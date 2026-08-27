// debugHud.ts - Owns optional development diagnostics and shortcuts.
import { BabylonConfigurationModel } from './model/babylonConfigurationModel'
import type {
  RenderResolution,
  RenderResolutionSnapshot,
  UpscalingMode
} from './renderUpscaling'
import { TextElement } from './view/textElement'

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
    'Config',
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
  const lines = ['Rendering', `* Type = ${renderingType}`]

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

function appendOverlayPanel(
  cornerUI: HTMLDivElement,
  lines: string[]
) {
  const panel = new TextElement('', '70px')
  panel.setHTML(formatBlock(lines))
  panel.element.style.position = 'static'
  panel.element.style.margin = '0'
  cornerUI.appendChild(panel.element)

  return panel
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

  public constructor(
    private readonly configuration: BabylonConfigurationModel,
    private readonly renderingType: RenderingType,
    shortcuts?: string[],
    renderingResolution?: RenderResolutionSnapshot,
    runtimeInputs?: string[],
    mobileShortcuts?: string[]
  ) {
    if (renderingResolution) {
      this.setRenderingResolutionState(renderingResolution)
    }
    this.cornerUI = this.getOrCreateCornerUI()

    this.configElem = new TextElement('', '10px')
    this.configElem.setHTML(formatConfigText(configuration))
    this.appendElement(this.configElem)

    this.renderElem = new TextElement('', '10px')
    this.updateRenderingText()
    this.appendElement(this.renderElem)

    if (shortcuts) {
      this.shortcutsElem = appendOverlayPanel(
        this.cornerUI,
        [
          'Debug Input (PC)',
          ...shortcuts.map(value => `* ${value}`)
        ]
      )
    }

    if (mobileShortcuts) {
      this.mobileShortcutsElem = appendOverlayPanel(
        this.cornerUI,
        [
          'Debug Input (Mobile)',
          ...mobileShortcuts.map(value => `* ${value}`)
        ]
      )
    }

    if (runtimeInputs) {
      this.runtimeInputsElem = appendOverlayPanel(
        this.cornerUI,
        [
          'Runtime Input',
          ...runtimeInputs.map(value => `* ${value}`)
        ]
      )
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
    this.shortcutsElem?.setHTML(
      formatBlock([
        'Debug Input (PC)',
        ...nextShortcuts.map(value => `* ${value}`)
      ])
    )
  }

  public setConfig() {
    this.configElem.setHTML(formatConfigText(this.configuration))
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
      return existing
    }

    const cornerUI = document.createElement('div')
    cornerUI.id = 'CornerUI'
    cornerUI.style.position = 'fixed'
    cornerUI.style.right = '10px'
    cornerUI.style.bottom = '10px'
    cornerUI.style.display = 'flex'
    cornerUI.style.flexDirection = 'column'
    cornerUI.style.alignItems = 'flex-end'
    cornerUI.style.gap = '8px'
    cornerUI.style.zIndex = '1001'
    document.body.appendChild(cornerUI)

    return cornerUI
  }

  private appendElement(element: TextElement) {
    element.element.style.position = 'static'
    element.element.style.margin = '0'
    this.cornerUI.appendChild(element.element)
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
    this.renderElem?.setHTML(
      formatRenderingText(
        this.renderingType,
        this.currentDisplayResolution,
        this.currentRenderResolution,
        this.currentUpscalingMode,
        this.currentFPS,
        this.currentTargetFPS
      )
    )
  }
}
