// debugHud.ts - Owns optional development diagnostics and shortcuts.
import { BabylonConfigurationModel } from '../../model/babylonConfigurationModel'
import {
  debugHudCorner,
  getDebugHudCornerPosition
} from './debugHudLayout'
import {
  readDebugHudPanelState,
  writeDebugHudPanelCollapsed,
  type DebugHudPanelId
} from '../../model/debugHudPanelState'
import type {
  RenderResolution,
  RenderResolutionSnapshot,
  UpscalingMode
} from '../../model/renderUpscaling'
import { TextElement } from './textElement'

type RenderingType = 'WebGPU' | 'WebGL'

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

function formatLine(line: string) {
  const trimmedLine = line.trimStart()

  if (trimmedLine.startsWith('*')) {
    const bulletText = trimmedLine.slice(1).trimStart()

    return `&bull; ${escapeHtml(bulletText)}`
  }

  return `<strong>${escapeHtml(trimmedLine)}</strong>`
}

function formatBlock(lines: string[]) {
  return lines.map(formatLine).join('<br>')
}

function formatPowerPreference(
  powerPreference: BabylonConfigurationModel['powerPreference']
) {
  return powerPreference === 'high-performance'
    ? 'high'
    : powerPreference
}

function formatConfigText(configuration: BabylonConfigurationModel) {
  const lines = [
    `* Antialias = ${configuration.antialias}`,
    `* AdaptToDeviceRatio = ${configuration.adaptToDeviceRatio}`,
    `* PowerPreference = ${
      formatPowerPreference(configuration.powerPreference)
    }`
  ]

  return formatBlock(lines)
}

function formatRenderingText(
  renderingType: RenderingType,
  displayResolution?: string,
  renderResolution?: string,
  upscalingMode?: UpscalingMode,
  fps?: number,
  targetFPS?: number
) {
  const lines = [`* Type = ${renderingType}`]

  if (displayResolution) {
    lines.push(`* Total Rez = ${displayResolution}`)
  }

  if (renderResolution) {
    lines.push(`* Render Rez = ${renderResolution}`)
  }

  if (upscalingMode) {
    lines.push(`* Upscaling = ${upscalingMode}`)
  }

  if (typeof fps === 'number' && typeof targetFPS === 'number') {
    lines.push(`* FPS = ${fps}/${targetFPS}`)
  } else if (typeof fps === 'number') {
    lines.push(`* FPS = ${fps}`)
  }

  return formatBlock(lines)
}

interface HudPanel {
  panel: TextElement
  setHTML: (html: string) => void
}

function appendHudPanel(
  cornerUI: HTMLDivElement,
  panelId: DebugHudPanelId,
  title: string,
  html: string,
  isInitiallyCollapsed: boolean,
  storage: Storage | undefined
): HudPanel {
  const panel = new TextElement('', '70px')
  panel.element.style.position = 'relative'
  panel.element.style.top = 'auto'
  panel.element.style.right = 'auto'
  panel.element.style.bottom = 'auto'
  panel.element.style.left = 'auto'
  panel.element.style.margin = '0'
  panel.element.classList.add('DebugHudPanel')

  const header = document.createElement('div')
  header.className = 'DebugHudInputHeader'

  const heading = document.createElement('strong')
  heading.textContent = title
  header.appendChild(heading)

  const button = document.createElement('button')
  button.type = 'button'
  button.className = 'DebugHudCollapseButton'
  button.textContent = 'x'
  button.setAttribute('aria-expanded', 'true')
  button.setAttribute('aria-label', `Collapse ${title}`)
  header.appendChild(button)

  const content = document.createElement('div')
  content.className = 'DebugHudPanelContent'

  const setHTML = (nextHTML: string) => {
    content.innerHTML = nextHTML
  }

  let isCollapsed = isInitiallyCollapsed
  const applyCollapsedState = () => {
    content.hidden = isCollapsed
    button.setAttribute('aria-expanded', String(!isCollapsed))
    button.setAttribute(
      'aria-label',
      `${isCollapsed ? 'Expand' : 'Collapse'} ${title}`
    )
  }

  button.addEventListener('click', () => {
    isCollapsed = !isCollapsed
    applyCollapsedState()
    writeDebugHudPanelCollapsed(
      storage,
      panelId,
      isCollapsed
    )
  })

  setHTML(html)
  applyCollapsedState()
  panel.element.replaceChildren(header, content)
  cornerUI.appendChild(panel.element)

  return { panel, setHTML }
}

export class DebugHud {
  public readonly configElem: TextElement
  public readonly renderElem: TextElement
  public readonly shortcutsElem?: TextElement
  public readonly mobileShortcutsElem?: TextElement
  public readonly runtimeInputsElem?: TextElement

  private currentDisplayResolution?: string
  private currentRenderResolution?: string
  private currentUpscalingMode?: UpscalingMode
  private currentFPS = 0
  private currentTargetFPS = 60
  private isVisible = true
  private readonly cornerUI: HTMLDivElement
  private readonly configPanel: HudPanel
  private readonly renderPanel: HudPanel
  private readonly shortcutsPanel?: HudPanel

  public constructor(
    private readonly configuration: BabylonConfigurationModel,
    private readonly renderingType: RenderingType,
    shortcuts?: string[],
    renderingResolution?: RenderResolutionSnapshot,
    runtimeInputs?: string[],
    mobileShortcuts?: string[],
    storage?: Storage
  ) {
    if (renderingResolution) {
      this.setRenderingResolutionState(renderingResolution)
    }
    this.cornerUI = this.getOrCreateCornerUI()
    const panelState = readDebugHudPanelState(storage)

    this.configPanel = appendHudPanel(
      this.cornerUI,
      'config',
      'Config',
      formatConfigText(configuration),
      panelState.config,
      storage
    )
    this.configElem = this.configPanel.panel

    this.renderPanel = appendHudPanel(
      this.cornerUI,
      'rendering',
      'Rendering',
      this.getRenderingText(),
      panelState.rendering,
      storage
    )
    this.renderElem = this.renderPanel.panel

    if (shortcuts) {
      this.shortcutsPanel = appendHudPanel(
        this.cornerUI,
        'pc-input',
        'Debug Input (PC)',
        this.formatInputLines(shortcuts),
        panelState['pc-input'],
        storage
      )
      this.shortcutsElem = this.shortcutsPanel.panel
    }

    if (mobileShortcuts) {
      const mobilePanel = appendHudPanel(
        this.cornerUI,
        'mobile-input',
        'Debug Input (Mobile)',
        this.formatInputLines(mobileShortcuts),
        panelState['mobile-input'],
        storage
      )
      this.mobileShortcutsElem = mobilePanel.panel
    }

    if (runtimeInputs) {
      const runtimePanel = appendHudPanel(
        this.cornerUI,
        'runtime-input',
        'Runtime Input',
        this.formatInputLines(runtimeInputs),
        panelState['runtime-input'],
        storage
      )
      this.runtimeInputsElem = runtimePanel.panel
    }
  }

  public toggle() {
    this.setVisible(!this.isVisible)

    return this.isVisible
  }

  public setVisible(nextVisible: boolean) {
    this.isVisible = nextVisible
    this.cornerUI.style.display = nextVisible ? 'flex' : 'none'
  }

  public setShortcuts(nextShortcuts: string[]) {
    this.shortcutsPanel?.setHTML(
      this.formatInputLines(nextShortcuts)
    )
  }

  public setConfig() {
    this.configPanel.setHTML(formatConfigText(this.configuration))
  }

  public setRenderingResolution(
    snapshot: RenderResolutionSnapshot
  ) {
    this.setRenderingResolutionState(snapshot)
    this.updateRenderingText()
  }

  public setFPS(fps: number) {
    this.currentFPS = fps
    this.updateRenderingText()
  }

  public setTargetFPS(targetFPS: number) {
    this.currentTargetFPS = targetFPS
    this.updateRenderingText()
  }

  private getOrCreateCornerUI() {
    const existing = document.getElementById('CornerUI') as
      | HTMLDivElement
      | null

    if (existing) {
      this.applyCornerPosition(existing)

      return existing
    }

    const cornerUI = document.createElement('div')
    cornerUI.id = 'CornerUI'
    cornerUI.style.position = 'fixed'
    cornerUI.style.display = 'flex'
    cornerUI.style.flexDirection = 'column'
    cornerUI.style.gap = '8px'
    cornerUI.style.zIndex = '1001'
    this.applyCornerPosition(cornerUI)
    document.body.appendChild(cornerUI)

    return cornerUI
  }

  private applyCornerPosition(cornerUI: HTMLDivElement) {
    const position = getDebugHudCornerPosition(debugHudCorner)

    cornerUI.style.top = position.top
    cornerUI.style.right = position.right
    cornerUI.style.bottom = position.bottom
    cornerUI.style.left = position.left
    cornerUI.style.alignItems = position.alignItems
  }

  private formatInputLines(lines: string[]) {
    return formatBlock(lines.map(value => `* ${value}`))
  }

  private formatResolution(resolution: RenderResolution) {
    return `${resolution.width} x ${resolution.height}`
  }

  private setRenderingResolutionState(
    snapshot: RenderResolutionSnapshot
  ) {
    this.currentDisplayResolution = this.formatResolution(
      snapshot.displayResolution
    )
    this.currentRenderResolution = this.formatResolution(
      snapshot.renderResolution
    )
    this.currentUpscalingMode = snapshot.upscalingMode
  }

  private updateRenderingText() {
    this.renderPanel?.setHTML(this.getRenderingText())
  }

  private getRenderingText() {
    return formatRenderingText(
      this.renderingType,
      this.currentDisplayResolution,
      this.currentRenderResolution,
      this.currentUpscalingMode,
      this.currentFPS,
      this.currentTargetFPS
    )
  }
}
