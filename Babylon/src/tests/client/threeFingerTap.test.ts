import { describe, expect, it, vi } from 'vitest'
import { ThreeFingerTapController } from
  '../../client/scripts/threeFingerTap'

type PointerOptions = {
  pointerId: number
  x?: number
  y?: number
}

function dispatchPointer(
  target: EventTarget,
  type: string,
  options: PointerOptions
) {
  const event = new Event(type)
  Object.defineProperties(event, {
    clientX: { value: options.x ?? 0 },
    clientY: { value: options.y ?? 0 },
    pointerId: { value: options.pointerId },
    pointerType: { value: 'touch' }
  })
  target.dispatchEvent(event)
}

function dispatchThreeFingerTap(target: EventTarget) {
  for (let pointerId = 1; pointerId <= 3; pointerId += 1) {
    dispatchPointer(target, 'pointerdown', { pointerId })
  }

  for (let pointerId = 1; pointerId <= 3; pointerId += 1) {
    dispatchPointer(target, 'pointerup', { pointerId })
  }
}

describe('ThreeFingerTapController', () => {
  it('emits exactly once for a completed three-finger tap', () => {
    const target = new EventTarget()
    const onTap = vi.fn()
    const controller = new ThreeFingerTapController(target, onTap)

    dispatchThreeFingerTap(target)

    expect(onTap).toHaveBeenCalledTimes(1)
    controller.dispose()
  })

  it('ignores fewer than three touch pointers', () => {
    const target = new EventTarget()
    const onTap = vi.fn()
    const controller = new ThreeFingerTapController(target, onTap)

    dispatchPointer(target, 'pointerdown', { pointerId: 1 })
    dispatchPointer(target, 'pointerdown', { pointerId: 2 })
    dispatchPointer(target, 'pointerup', { pointerId: 1 })
    dispatchPointer(target, 'pointerup', { pointerId: 2 })

    expect(onTap).not.toHaveBeenCalled()
    controller.dispose()
  })

  it('rejects excessive movement and duration', () => {
    const movementTarget = new EventTarget()
    const movementTap = vi.fn()
    const movementController = new ThreeFingerTapController(
      movementTarget,
      movementTap,
      { maximumMovementPixels: 10 }
    )
    for (let pointerId = 1; pointerId <= 3; pointerId += 1) {
      dispatchPointer(movementTarget, 'pointerdown', { pointerId })
    }
    dispatchPointer(movementTarget, 'pointermove', {
      pointerId: 1,
      x: 11
    })
    for (let pointerId = 1; pointerId <= 3; pointerId += 1) {
      dispatchPointer(movementTarget, 'pointerup', { pointerId })
    }
    expect(movementTap).not.toHaveBeenCalled()
    movementController.dispose()

    let now = 0
    const durationTarget = new EventTarget()
    const durationTap = vi.fn()
    const durationController = new ThreeFingerTapController(
      durationTarget,
      durationTap,
      {
        maximumDurationMilliseconds: 400,
        now: () => now
      }
    )
    for (let pointerId = 1; pointerId <= 3; pointerId += 1) {
      dispatchPointer(durationTarget, 'pointerdown', { pointerId })
    }
    now = 401
    for (let pointerId = 1; pointerId <= 3; pointerId += 1) {
      dispatchPointer(durationTarget, 'pointerup', { pointerId })
    }
    expect(durationTap).not.toHaveBeenCalled()
    durationController.dispose()
  })

  it('resets on cancellation and blur', () => {
    const target = new EventTarget()
    const onTap = vi.fn()
    const controller = new ThreeFingerTapController(target, onTap)

    for (let pointerId = 1; pointerId <= 3; pointerId += 1) {
      dispatchPointer(target, 'pointerdown', { pointerId })
    }
    dispatchPointer(target, 'pointercancel', { pointerId: 1 })
    dispatchPointer(target, 'pointerup', { pointerId: 2 })
    dispatchPointer(target, 'pointerup', { pointerId: 3 })
    expect(onTap).not.toHaveBeenCalled()

    for (let pointerId = 1; pointerId <= 3; pointerId += 1) {
      dispatchPointer(target, 'pointerdown', { pointerId })
    }
    target.dispatchEvent(new Event('blur'))
    for (let pointerId = 1; pointerId <= 3; pointerId += 1) {
      dispatchPointer(target, 'pointerup', { pointerId })
    }
    expect(onTap).not.toHaveBeenCalled()
    controller.dispose()
  })

  it('removes its listeners when disposed', () => {
    const target = new EventTarget()
    const onTap = vi.fn()
    const controller = new ThreeFingerTapController(target, onTap)

    controller.dispose()
    dispatchThreeFingerTap(target)

    expect(onTap).not.toHaveBeenCalled()
  })
})
