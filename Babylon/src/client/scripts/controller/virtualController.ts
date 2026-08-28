import type { Vector2 } from '@babylonjs/core'
import {
  AdvancedDynamicTexture,
  Container,
  Control,
  type Ellipse,
  TextBlock
} from '@babylonjs/gui'
import type { ProductionUiLayout } from '../view/2d/productionHudLayout'
import {
  PRODUCTION_LABEL_FONT_SIZE,
  PRODUCTION_LABEL_HEIGHT,
  applyProductionTextStyle
} from '../view/2d/productionTextStyle'
import {
  VirtualMovementJoystick,
  createVirtualControllerPuck,
  setVirtualControllerPuckPressed
} from './virtualMovementJoystick'

const maximumActionCount = 3
const layoutMargin = 24
export const virtualControllerVerticalOffset = 30
const movementWidth = 260
const actionWidth = 180
const controlHeight = 260
const groupHeight = controlHeight + PRODUCTION_LABEL_HEIGHT
const actionCircleTop = 86

export type VirtualControllerMovement = {
  label: string
  onInput: (direction: Vector2) => void
}

export type VirtualControllerAction = {
  id: string
  label: string
  onPressed: () => void
  shortcut?: string
}

export type VirtualControllerOptions = {
  actions?: readonly VirtualControllerAction[]
  movement: VirtualControllerMovement
}

export type VirtualControllerBox = {
  bottom: number
  left: number
  right: number
  top: number
}

export type VirtualControllerLayout = {
  actions: readonly VirtualControllerBox[]
  movement: VirtualControllerBox
  scale: number
}

export type VirtualControllerActionControl = {
  circle: Ellipse
  definition: VirtualControllerAction
  label: TextBlock
  root: Container
}

type GuiPointerInfo = {
  event?: {
    pointerId?: number
  }
}

function createBox(
  left: number,
  bottom: number,
  width: number,
  height: number
): VirtualControllerBox {
  return {
    bottom,
    left,
    right: left + width,
    top: bottom + height
  }
}

function formatActionLabel(action: VirtualControllerAction): string {
  return action.shortcut
    ? `${action.label} (${action.shortcut})`
    : action.label
}

export function calculateVirtualControllerLayout(
  layout: ProductionUiLayout,
  actionCount: number
): VirtualControllerLayout {
  const count = Math.min(
    Math.max(0, Math.trunc(actionCount)),
    maximumActionCount
  )
  const halfVisibleWidth = layout.visibleWidth * 0.5
  const movementAvailableWidth = Math.max(
    0,
    halfVisibleWidth - layoutMargin
  )
  const actionSlotWidth = count > 0
    ? halfVisibleWidth / count
    : halfVisibleWidth
  const movementScale = movementAvailableWidth / movementWidth
  const actionScale = count > 0
    ? actionSlotWidth / actionWidth
    : 1
  const scale = Math.min(1, movementScale, actionScale)
  const scaledMovementWidth = movementWidth * scale
  const scaledActionWidth = actionWidth * scale
  const left = layout.left + layoutMargin
  const height = groupHeight * scale
  const requestedBottom = layout.bottom + layoutMargin +
    virtualControllerVerticalOffset * layout.scale
  const maximumBottom = layout.bottom + Math.max(
    0,
    layout.visibleHeight - height
  )
  const bottom = Math.min(requestedBottom, maximumBottom)
  const movement = createBox(
    left,
    bottom,
    scaledMovementWidth,
    height
  )
  const actions = Array.from({ length: count }, (_, index) => {
    const actionCenter = layout.left + halfVisibleWidth +
      actionSlotWidth * (index + 0.5)
    const actionLeft = actionCenter - scaledActionWidth * 0.5

    return createBox(
      actionLeft,
      bottom,
      scaledActionWidth,
      height
    )
  })

  return { actions, movement, scale }
}

function setLeftBottomPosition(
  control: Control,
  box: VirtualControllerBox,
  baseWidth: number,
  baseHeight: number,
  scale: number
): void {
  const horizontalScaleInset = baseWidth * (1 - scale) * 0.5
  const verticalScaleInset = baseHeight * (1 - scale) * 0.5
  control.scaleX = scale
  control.scaleY = scale
  control.leftInPixels = box.left - horizontalScaleInset
  control.topInPixels = -(box.bottom - verticalScaleInset)
}

function createLabel(name: string, text: string): TextBlock {
  const label = new TextBlock(name, text)
  label.widthInPixels = movementWidth
  label.textWrapping = false
  label.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT
  label.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM
  applyProductionTextStyle(label, {
    fontSize: PRODUCTION_LABEL_FONT_SIZE,
    height: PRODUCTION_LABEL_HEIGHT,
    horizontalAlignment: Control.HORIZONTAL_ALIGNMENT_CENTER
  })

  return label
}

export class VirtualController {
  public readonly root = new Container('VirtualControllerRoot')
  public readonly movement: VirtualMovementJoystick
  public readonly movementLabel: TextBlock
  public readonly actions: readonly VirtualControllerActionControl[]

  private enabled = true
  private disposed = false
  private readonly actionPointers = new Map<
    Ellipse,
    Set<number | undefined>
  >()

  public constructor(
    private readonly texture: AdvancedDynamicTexture,
    options: VirtualControllerOptions
  ) {
    const actionDefinitions = options.actions ?? []

    if (actionDefinitions.length > maximumActionCount) {
      throw new RangeError('A virtual controller supports at most 3 actions')
    }

    this.root.width = 1
    this.root.height = 1
    this.root.isPointerBlocker = false
    this.texture.addControl(this.root)
    this.movement = new VirtualMovementJoystick(
      texture,
      options.movement.onInput,
      this.root
    )
    this.movementLabel = createLabel(
      'VirtualControllerMovementLabel',
      options.movement.label
    )
    this.root.addControl(this.movementLabel)
    this.actions = actionDefinitions.map((definition, index) => {
      return this.createActionControl(definition, index)
    })
  }

  public setEnabled(enabled: boolean): void {
    if (this.disposed) {
      return
    }

    this.enabled = enabled
    this.root.isVisible = enabled
    this.movement.setEnabled(enabled)

    for (const action of this.actions) {
      action.circle.isHitTestVisible = enabled

      if (!enabled) {
        this.resetActionPress(action.circle)
      }
    }
  }

  public updateLayout(layout: ProductionUiLayout): void {
    const controllerLayout = calculateVirtualControllerLayout(
      layout,
      this.actions.length
    )
    const movementRootBox = {
      ...controllerLayout.movement,
      bottom: controllerLayout.movement.bottom +
        PRODUCTION_LABEL_HEIGHT * controllerLayout.scale
    }
    setLeftBottomPosition(
      this.movement.root,
      movementRootBox,
      movementWidth,
      controlHeight,
      controllerLayout.scale
    )
    setLeftBottomPosition(
      this.movementLabel,
      controllerLayout.movement,
      movementWidth,
      PRODUCTION_LABEL_HEIGHT,
      controllerLayout.scale
    )

    this.actions.forEach((action, index) => {
      setLeftBottomPosition(
        action.root,
        controllerLayout.actions[index],
        actionWidth,
        groupHeight,
        controllerLayout.scale
      )
    })
  }

  public dispose(): void {
    if (this.disposed) {
      return
    }

    this.disposed = true
    this.movement.dispose()

    for (const action of this.actions) {
      action.circle.onPointerDownObservable.clear()
      action.circle.onPointerUpObservable.clear()
      action.circle.onPointerOutObservable.clear()
    }

    this.texture.removeControl(this.root)
    this.root.dispose()
  }

  private createActionControl(
    definition: VirtualControllerAction,
    index: number
  ): VirtualControllerActionControl {
    const root = new Container(`VirtualControllerAction${index}`)
    root.widthInPixels = actionWidth
    root.heightInPixels = groupHeight
    root.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT
    root.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM
    root.isPointerBlocker = false

    const circle = createVirtualControllerPuck(
      `VirtualControllerActionCircle${index}`
    )
    circle.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER
    circle.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP
    circle.topInPixels = actionCircleTop
    circle.isPointerBlocker = true
    const pressedPointers = new Set<number | undefined>()
    this.actionPointers.set(circle, pressedPointers)
    circle.onPointerDownObservable.add((_position, state) => {
      if (this.enabled && !this.disposed) {
        const pointerInfo = state.userInfo as GuiPointerInfo | undefined
        pressedPointers.add(pointerInfo?.event?.pointerId)
        setVirtualControllerPuckPressed(circle, true)
        definition.onPressed()
      }
    })
    circle.onPointerUpObservable.add((_position, state) => {
      const pointerInfo = state.userInfo as GuiPointerInfo | undefined
      pressedPointers.delete(pointerInfo?.event?.pointerId)
      setVirtualControllerPuckPressed(
        circle,
        pressedPointers.size > 0
      )
    })
    circle.onPointerOutObservable.add((_position, state) => {
      const pointerInfo = state.userInfo as GuiPointerInfo | undefined
      pressedPointers.delete(pointerInfo?.event?.pointerId)
      setVirtualControllerPuckPressed(
        circle,
        pressedPointers.size > 0
      )
    })
    root.addControl(circle)

    const label = createLabel(
      `VirtualControllerActionLabel${index}`,
      formatActionLabel(definition)
    )
    label.widthInPixels = actionWidth
    root.addControl(label)
    this.root.addControl(root)

    return {
      circle,
      definition,
      label,
      root
    }
  }

  private resetActionPress(circle: Ellipse): void {
    this.actionPointers.get(circle)?.clear()
    setVirtualControllerPuckPressed(circle, false)
  }
}
