import { Vector2 } from '@babylonjs/core'
import {
  AdvancedDynamicTexture,
  Container,
  Control,
  Ellipse
} from '@babylonjs/gui'
import {
  calculateProductionUiLayout,
  type ProductionUiCanvasRect,
  type ProductionUiLayout,
  type ProductionUiViewport
} from './productionHudLayout'

type JoystickLayout = {
  bottom: number
  left: number
}

type GuiPointerInfo = {
  event?: {
    pointerId?: number
  }
}

const idealHeight = 1600
const rootSize = 260
const outerSize = 220
const puckSize = 88
const layoutMargin = 24
const deadZone = 0.15

export function calculateJoystickInput(
  pointer: Vector2,
  center: Vector2,
  radius: number,
  inputDeadZone: number
) {
  if (radius <= 0) {
    return Vector2.Zero()
  }

  const displacement = new Vector2(
    pointer.x - center.x,
    center.y - pointer.y
  )
  const rawLength = displacement.length() / radius

  if (rawLength <= inputDeadZone) {
    return Vector2.Zero()
  }

  const direction = displacement.normalize()
  const intensity = Math.min(
    (rawLength - inputDeadZone) / (1 - inputDeadZone),
    1
  )

  return direction.scale(intensity)
}

export function calculateJoystickLayout(
  canvas: ProductionUiCanvasRect,
  viewport: ProductionUiViewport,
  targetIdealHeight = idealHeight
): JoystickLayout {
  const layout = calculateProductionUiLayout(
    canvas,
    viewport,
    targetIdealHeight
  )

  return {
    bottom: layout.bottom + layoutMargin * layout.scale,
    left: layout.left + layoutMargin * layout.scale
  }
}

export class VirtualMovementJoystick {
  public readonly root = new Container('MovementJoystickRoot')
  public readonly outer = new Ellipse('MovementJoystickOuter')
  public readonly puck = new Ellipse('MovementJoystickPuck')

  private pressed = false
  private enabled = true
  private disposed = false
  private activePointerId: number | undefined
  private readonly pointerSurface: HTMLCanvasElement | null

  public constructor(
    private readonly texture: AdvancedDynamicTexture,
    private readonly onInput: (direction: Vector2) => void
  ) {
    this.pointerSurface = this.texture
      .getScene()
      ?.getEngine()
      .getRenderingCanvas() ?? null
    this.root.widthInPixels = rootSize
    this.root.heightInPixels = rootSize
    this.root.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT
    this.root.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM
    this.root.leftInPixels = layoutMargin
    this.root.topInPixels = -layoutMargin
    this.root.isPointerBlocker = false

    this.outer.widthInPixels = outerSize
    this.outer.heightInPixels = outerSize
    this.outer.color = 'rgba(255, 247, 220, 0.82)'
    this.outer.background = 'rgba(25, 20, 22, 0.42)'
    this.outer.thickness = 5
    this.outer.isPointerBlocker = true

    this.puck.widthInPixels = puckSize
    this.puck.heightInPixels = puckSize
    this.puck.color = 'rgba(255, 247, 220, 0.94)'
    this.puck.background = 'rgba(216, 181, 117, 0.76)'
    this.puck.thickness = 4
    this.puck.isHitTestVisible = false

    this.root.addControl(this.outer)
    this.root.addControl(this.puck)
    this.texture.addControl(this.root)

    this.outer.onPointerDownObservable.add((position, state) => {
      if (!this.enabled || this.activePointerId !== undefined) {
        return
      }

      const pointerInfo = state.userInfo as GuiPointerInfo | undefined
      this.activePointerId = pointerInfo?.event?.pointerId
      this.captureActivePointer()
      this.pressed = true
      this.updateInput(position)
    })
    this.outer.onPointerMoveObservable.add(position => {
      if (this.pressed && this.enabled) {
        this.updateInput(position)
      }
    })
    this.outer.onPointerUpObservable.add((_position, state) => {
      const pointerInfo = state.userInfo as GuiPointerInfo | undefined
      this.endInput(pointerInfo?.event?.pointerId)
    })
    this.pointerSurface?.addEventListener(
      'pointercancel',
      this.handlePointerCancel
    )
    this.pointerSurface?.addEventListener(
      'lostpointercapture',
      this.handlePointerCancel
    )
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled
    this.root.isVisible = enabled
    this.outer.isHitTestVisible = enabled
    this.endInput()
  }

  public updateLayout(layout: ProductionUiLayout): void {
    this.root.leftInPixels = (
      layout.left + layoutMargin * layout.scale
    )
    this.root.topInPixels = -(
      layout.bottom + layoutMargin * layout.scale
    )
  }

  public dispose(): void {
    if (this.disposed) {
      return
    }

    this.disposed = true
    this.endInput()
    this.pointerSurface?.removeEventListener(
      'pointercancel',
      this.handlePointerCancel
    )
    this.pointerSurface?.removeEventListener(
      'lostpointercapture',
      this.handlePointerCancel
    )
    this.outer.onPointerDownObservable.clear()
    this.outer.onPointerMoveObservable.clear()
    this.outer.onPointerUpObservable.clear()
    this.texture.removeControl(this.root)
    this.root.dispose()
  }

  private updateInput(pointer: Vector2): void {
    const textureHeight = this.texture.getSize().height
    const coordinateScale = this.texture.idealHeight > 0
      ? textureHeight / this.texture.idealHeight
      : 1
    const radius = outerSize * coordinateScale * 0.5
    const input = calculateJoystickInput(
      pointer,
      new Vector2(this.outer.centerX, this.outer.centerY),
      radius,
      deadZone
    )
    const puckTravel = (outerSize - puckSize) * 0.5
    this.puck.leftInPixels = input.x * puckTravel
    this.puck.topInPixels = -input.y * puckTravel
    this.onInput(input)
  }

  private captureActivePointer(): void {
    if (this.activePointerId === undefined) {
      return
    }

    this.texture._capturingControl[this.activePointerId] = this.outer
    this.pointerSurface?.setPointerCapture(this.activePointerId)
  }

  private endInput(pointerId?: number): void {
    if (
      pointerId !== undefined &&
      pointerId !== this.activePointerId
    ) {
      return
    }

    const activePointerId = this.activePointerId
    this.activePointerId = undefined

    if (activePointerId !== undefined) {
      delete this.texture._capturingControl[activePointerId]

      if (this.pointerSurface?.hasPointerCapture(activePointerId)) {
        this.pointerSurface.releasePointerCapture(activePointerId)
      }
    }

    this.resetInput()
  }

  private readonly handlePointerCancel = (event: Event): void => {
    const pointerEvent = event as PointerEvent
    this.endInput(pointerEvent.pointerId)
  }

  private resetInput(): void {
    this.pressed = false
    this.puck.leftInPixels = 0
    this.puck.topInPixels = 0
    this.onInput(Vector2.Zero())
  }
}
