type ThreeFingerTapOptions = {
  maximumDurationMilliseconds?: number
  maximumMovementPixels?: number
  now?: () => number
}

type PointerStart = {
  x: number
  y: number
}

const defaultMaximumDurationMilliseconds = 400
const defaultMaximumMovementPixels = 24

export class ThreeFingerTapController {
  private readonly activePointers = new Map<number, PointerStart>()
  private readonly participantIds = new Set<number>()
  private readonly maximumDurationMilliseconds: number
  private readonly maximumMovementSquared: number
  private readonly now: () => number
  private gestureStartedAt = 0
  private qualified = false
  private rejected = false
  private disposed = false

  public constructor(
    private readonly target: EventTarget,
    private readonly onTap: () => void,
    options: ThreeFingerTapOptions = {}
  ) {
    this.maximumDurationMilliseconds =
      options.maximumDurationMilliseconds ??
      defaultMaximumDurationMilliseconds
    const maximumMovementPixels =
      options.maximumMovementPixels ?? defaultMaximumMovementPixels
    this.maximumMovementSquared = maximumMovementPixels ** 2
    this.now = options.now ?? (() => performance.now())

    target.addEventListener('pointerdown', this.handlePointerDown)
    target.addEventListener('pointermove', this.handlePointerMove)
    target.addEventListener('pointerup', this.handlePointerUp)
    target.addEventListener('pointercancel', this.handlePointerCancel)
    target.addEventListener('blur', this.handleBlur)
  }

  public dispose(): void {
    if (this.disposed) {
      return
    }

    this.disposed = true
    this.reset()
    this.target.removeEventListener(
      'pointerdown',
      this.handlePointerDown
    )
    this.target.removeEventListener(
      'pointermove',
      this.handlePointerMove
    )
    this.target.removeEventListener('pointerup', this.handlePointerUp)
    this.target.removeEventListener(
      'pointercancel',
      this.handlePointerCancel
    )
    this.target.removeEventListener('blur', this.handleBlur)
  }

  private readonly handlePointerDown = (event: Event): void => {
    const pointerEvent = event as PointerEvent

    if (pointerEvent.pointerType !== 'touch') {
      return
    }

    if (this.activePointers.size === 0) {
      this.reset()
      this.gestureStartedAt = this.now()
    }

    this.activePointers.set(pointerEvent.pointerId, {
      x: pointerEvent.clientX,
      y: pointerEvent.clientY
    })
    this.participantIds.add(pointerEvent.pointerId)

    if (this.activePointers.size === 3) {
      this.qualified = this.participantIds.size === 3
    } else if (this.activePointers.size > 3) {
      this.rejected = true
    }
  }

  private readonly handlePointerMove = (event: Event): void => {
    const pointerEvent = event as PointerEvent
    const start = this.activePointers.get(pointerEvent.pointerId)

    if (!start) {
      return
    }

    const xDistance = pointerEvent.clientX - start.x
    const yDistance = pointerEvent.clientY - start.y
    const distanceSquared = xDistance ** 2 + yDistance ** 2

    if (distanceSquared > this.maximumMovementSquared) {
      this.rejected = true
    }
  }

  private readonly handlePointerUp = (event: Event): void => {
    const pointerEvent = event as PointerEvent

    if (!this.activePointers.delete(pointerEvent.pointerId)) {
      return
    }

    if (this.activePointers.size > 0) {
      return
    }

    const duration = this.now() - this.gestureStartedAt
    const accepted =
      this.qualified &&
      !this.rejected &&
      this.participantIds.size === 3 &&
      duration <= this.maximumDurationMilliseconds

    this.reset()

    if (accepted) {
      this.onTap()
    }
  }

  private readonly handlePointerCancel = (): void => {
    this.reset()
  }

  private readonly handleBlur = (): void => {
    this.reset()
  }

  private reset(): void {
    this.activePointers.clear()
    this.participantIds.clear()
    this.gestureStartedAt = 0
    this.qualified = false
    this.rejected = false
  }
}
