// productionHud.ts - Owns permanent player-facing Babylon GUI controls.
import type { Scene } from '@babylonjs/core'
import {
  AdvancedDynamicTexture,
  Button,
  Control,
  Image,
  Rectangle,
  StackPanel,
  TextBlock
} from '@babylonjs/gui'
import {
  createInventorySlots,
  formatHudLevelScore,
  type InventorySlots
} from './productionHudModel'
import {
  calculateProductionUiLayout,
  type ProductionUiCanvasRect,
  type ProductionUiLayout,
  type ProductionUiViewport
} from './productionHudLayout'
import {
  PRODUCTION_LABEL_FONT_SIZE,
  PRODUCTION_LABEL_HEIGHT,
  PRODUCTION_TEXT_COLOR,
  applyProductionTextStyle
} from './productionTextStyle'
import {
  VirtualController,
  type VirtualControllerOptions
} from './virtualController'

export const UI_PADDING = 50

const UI_IDEAL_HEIGHT = 1600
const SLOT_BACKGROUND = 'rgba(25, 20, 22, 0.82)'
const SLOT_BORDER = '#d8b575'
const LEFT_GROUP_WIDTH = 650
const VERSION_FONT_SIZE = 24
const TITLE_HEIGHT = 58
const SLOT_SIZE = 82
const SLOT_GAP = 10
const PROMPT_WIDTH = 540
const PROMPT_HEIGHT = 350

export type PromptButtonOptions = {
  label: string
  onClick: () => void
}

export type PromptOptions = {
  body: string
  buttons: readonly PromptButtonOptions[]
  title: string
}

function createText(
  name: string,
  text: string,
  height: number,
  fontSize: number
) {
  const control = new TextBlock(name, text)
  return applyProductionTextStyle(control, {
    fontSize,
    height
  })
}

function createSlot(index: number) {
  const slot = new Rectangle(`InventorySlot${index}`)
  slot.widthInPixels = SLOT_SIZE
  slot.heightInPixels = SLOT_SIZE
  slot.background = SLOT_BACKGROUND
  slot.color = SLOT_BORDER
  slot.cornerRadius = 10
  slot.thickness = 4
  slot.isHitTestVisible = false

  return slot
}

export class ProductionHud {
  private readonly texture: AdvancedDynamicTexture
  private readonly levelScoreText: TextBlock
  private readonly slots: Rectangle[]
  private readonly leftGroup: StackPanel
  private readonly prompt: Rectangle
  private readonly promptTitle: TextBlock
  private readonly promptBody: TextBlock
  private readonly promptButtons: StackPanel
  private virtualController?: VirtualController
  private layout?: ProductionUiLayout
  private levelName: string
  private score = 0

  public constructor(
    scene: Scene,
    levelName: string,
    version: string,
    slotCount = 5
  ) {
    this.levelName = levelName
    this.texture = AdvancedDynamicTexture.CreateFullscreenUI(
      'ProductionHud',
      true,
      scene
    )
    this.texture.idealHeight = UI_IDEAL_HEIGHT

    const leftGroup = this.createLeftGroup(
      levelName,
      version,
      slotCount
    )
    this.levelScoreText = leftGroup.levelScoreText
    this.slots = leftGroup.slots
    this.leftGroup = leftGroup.control
    this.texture.addControl(this.leftGroup)

    const prompt = this.createPrompt()
    this.prompt = prompt.control
    this.promptTitle = prompt.title
    this.promptBody = prompt.body
    this.promptButtons = prompt.buttons
    this.texture.addControl(this.prompt)

    this.setInventory(createInventorySlots(null, 0, slotCount))
  }

  public setScore(score: number): void {
    this.score = score
    this.refreshLevelScore()
  }

  public setLevel(levelName: string): void {
    this.levelName = levelName
    this.refreshLevelScore()
  }

  public setInventorySlotCount(slotCount: number): void {
    const visibleSlotCount = Math.min(
      Math.max(0, Math.trunc(slotCount)),
      this.slots.length
    )

    this.slots.forEach((slot, index) => {
      slot.isVisible = index < visibleSlotCount
      slot.paddingRightInPixels = index < visibleSlotCount - 1
        ? SLOT_GAP
        : 0

      if (!slot.isVisible) {
        slot.clearControls()
      }
    })
  }

  public setInventory(inventory: InventorySlots) {
    this.slots.forEach((slot, index) => {
      const item = inventory[index]
      slot.clearControls()

      if (!item) {
        return
      }

      const image = new Image(`InventoryItem${index}`, item.imageUrl)
      image.width = '82%'
      image.height = '82%'
      image.stretch = Image.STRETCH_UNIFORM
      image.isHitTestVisible = false
      slot.addControl(image)
    })
  }

  public showPrompt(options: PromptOptions) {
    const { buttons } = options

    if (buttons.length > 2) {
      throw new RangeError('A prompt supports at most two buttons')
    }

    this.promptTitle.text = options.title
    this.promptBody.text = options.body
    this.promptButtons.clearControls()

    buttons.forEach((buttonOptions, index) => {
      const button = Button.CreateSimpleButton(
        `PromptButton${index}`,
        buttonOptions.label
      )
      button.widthInPixels = 190
      button.heightInPixels = 64
      button.paddingLeftInPixels = 8
      button.paddingRightInPixels = 8
      button.color = PRODUCTION_TEXT_COLOR
      button.background = SLOT_BACKGROUND
      button.fontSizeInPixels = 32
      button.cornerRadius = 10
      button.thickness = 4
      button.onPointerClickObservable.add(
        buttonOptions.onClick
      )
      this.promptButtons.addControl(button)
    })

    this.prompt.isVisible = true
  }

  public hidePrompt() {
    this.prompt.isVisible = false
  }

  public addVirtualController(
    options: VirtualControllerOptions
  ): VirtualController {
    this.virtualController?.dispose()
    this.virtualController = new VirtualController(
      this.texture,
      options
    )
    if (this.layout) {
      this.virtualController.updateLayout(this.layout)
    }

    return this.virtualController
  }

  public updateLayout(
    canvas: ProductionUiCanvasRect,
    viewport: ProductionUiViewport
  ): void {
    const layout = calculateProductionUiLayout(
      canvas,
      viewport,
      this.texture.idealHeight || UI_IDEAL_HEIGHT
    )
    this.layout = layout
    this.leftGroup.leftInPixels = layout.left + UI_PADDING
    this.leftGroup.topInPixels = layout.top + UI_PADDING
    this.leftGroup.widthInPixels = Math.min(
      LEFT_GROUP_WIDTH,
      Math.max(0, layout.visibleWidth - UI_PADDING * 2)
    )
    this.prompt.leftInPixels = layout.centerX
    this.prompt.topInPixels = layout.centerY
    this.prompt.widthInPixels = Math.min(
      PROMPT_WIDTH,
      Math.max(0, layout.visibleWidth - UI_PADDING * 2)
    )
    this.prompt.heightInPixels = Math.min(
      PROMPT_HEIGHT,
      Math.max(0, layout.visibleHeight - UI_PADDING * 2)
    )
    this.virtualController?.updateLayout(layout)
  }

  public dispose() {
    this.virtualController?.dispose()
    this.texture.dispose()
  }

  private createLeftGroup(
    levelName: string,
    version: string,
    slotCount: number
  ) {
    const leftGroup = new StackPanel('ProductionHudLeft')
    leftGroup.widthInPixels = LEFT_GROUP_WIDTH
    leftGroup.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT
    leftGroup.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP
    leftGroup.leftInPixels = UI_PADDING
    leftGroup.topInPixels = UI_PADDING
    leftGroup.isHitTestVisible = false

    const versionText = createText(
      'ReleaseVersion',
      version,
      PRODUCTION_LABEL_HEIGHT,
      VERSION_FONT_SIZE
    )
    versionText.textWrapping = false

    const titleText = createText(
      'GameTitle',
      'Babylon Walking',
      TITLE_HEIGHT,
      40
    )
    titleText.textWrapping = false

    const levelScoreText = createText(
      'LevelScore',
      formatHudLevelScore(levelName, this.score),
      PRODUCTION_LABEL_HEIGHT,
      PRODUCTION_LABEL_FONT_SIZE
    )
    levelScoreText.textWrapping = false

    leftGroup.addControl(versionText)
    leftGroup.addControl(titleText)
    leftGroup.addControl(levelScoreText)

    const slotRow = new StackPanel('InventorySlots')
    slotRow.isVertical = false
    slotRow.heightInPixels = SLOT_SIZE
    slotRow.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT
    slotRow.isHitTestVisible = false

    const slots = Array.from({ length: slotCount }, (_, index) => {
      const slot = createSlot(index)
      slot.paddingRightInPixels = index < slotCount - 1
        ? SLOT_GAP
        : 0
      slotRow.addControl(slot)

      return slot
    })

    leftGroup.addControl(slotRow)

    return {
      control: leftGroup,
      levelScoreText,
      slots
    }
  }

  private refreshLevelScore(): void {
    this.levelScoreText.text = formatHudLevelScore(
      this.levelName,
      this.score
    )
  }

  private createPrompt() {
    const prompt = new Rectangle('Prompt')
    prompt.widthInPixels = PROMPT_WIDTH
    prompt.heightInPixels = PROMPT_HEIGHT
    prompt.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER
    prompt.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER
    prompt.background = 'rgba(25, 20, 22, 0.94)'
    prompt.color = SLOT_BORDER
    prompt.cornerRadius = 18
    prompt.thickness = 5
    prompt.isVisible = false

    const content = new StackPanel('PromptContent')
    content.width = '90%'
    content.isHitTestVisible = true
    prompt.addControl(content)

    const title = createText(
      'PromptTitle',
      '',
      72,
      46
    )
    title.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER
    content.addControl(title)

    const body = createText(
      'PromptBody',
      '',
      100,
      34
    )
    body.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER
    content.addControl(body)

    const buttons = new StackPanel('PromptButtons')
    buttons.isVertical = false
    buttons.heightInPixels = 72
    buttons.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER
    buttons.isHitTestVisible = true
    content.addControl(buttons)

    return {
      body,
      buttons,
      control: prompt,
      title
    }
  }
}
