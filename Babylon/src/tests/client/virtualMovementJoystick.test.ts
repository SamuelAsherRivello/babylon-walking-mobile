import { Vector2 } from '@babylonjs/core'
import {
  AdvancedDynamicTexture,
  Container,
  Control,
  Rectangle,
  Vector2WithInfo
} from '@babylonjs/gui'
import { describe, expect, it, vi } from 'vitest'
import {
  VirtualMovementJoystick,
  calculateJoystickInput,
  calculateJoystickLayout
} from '../../client/scripts/virtualMovementJoystick'

class FakePointerSurface extends EventTarget {
  readonly capturedPointers = new Set<number>()

  setPointerCapture(pointerId: number) {
    this.capturedPointers.add(pointerId)
  }

  releasePointerCapture(pointerId: number) {
    this.capturedPointers.delete(pointerId)
  }

  hasPointerCapture(pointerId: number) {
    return this.capturedPointers.has(pointerId)
  }
}

class FakeTexture {
  readonly rootContainer = new Container('FakeTextureRoot')
  readonly _capturingControl: Record<number, Control> = {}
  readonly pointerSurface = new FakePointerSurface()
  idealHeight = 1600

  addControl(control: Control) {
    this.rootContainer.addControl(control)
    return this
  }

  removeControl(control: Control) {
    this.rootContainer.removeControl(control)
    return this
  }

  getSize() {
    return { width: 900, height: 1600 }
  }

  getScene() {
    return {
      getEngine: () => ({
        getRenderingCanvas: () => this.pointerSurface
      })
    }
  }
}

function createHarness() {
  const fakeTexture = new FakeTexture()
  const texture = fakeTexture as unknown as AdvancedDynamicTexture

  return { fakeTexture, texture }
}

describe('virtual movement joystick model', () => {
  it('applies a dead zone, proportional input, and drag clamping', () => {
    const centered = calculateJoystickInput(
      new Vector2(5, 0),
      Vector2.Zero(),
      100,
      0.15
    )
    expect(centered.length()).toBe(0)

    const partial = calculateJoystickInput(
      new Vector2(50, 0),
      Vector2.Zero(),
      100,
      0.15
    )
    const clamped = calculateJoystickInput(
      new Vector2(200, -200),
      Vector2.Zero(),
      100,
      0.15
    )
    expect(partial.length()).toBeGreaterThan(0)
    expect(partial.length()).toBeLessThan(1)
    expect(clamped.length()).toBeCloseTo(1)
    expect(clamped.x).toBeGreaterThan(0)
    expect(clamped.y).toBeGreaterThan(0)
  })

  it('accounts for crop, safe area, and resize scale', () => {
    const layout = calculateJoystickLayout(
      { height: 800, left: -50, top: 0, width: 500 },
      {
        height: 800,
        safeAreaBottom: 20,
        safeAreaLeft: 12,
        safeAreaRight: 0,
        safeAreaTop: 0,
        width: 400
      },
      1600
    )

    expect(layout.left).toBe(172)
    expect(layout.bottom).toBe(88)
  })

  it('recalculates for desktop, portrait, orientation, and fullscreen', () => {
    const viewport = {
      height: 900,
      safeAreaBottom: 0,
      safeAreaLeft: 0,
      safeAreaRight: 0,
      safeAreaTop: 0,
      width: 900
    }
    const desktop = calculateJoystickLayout(
      { height: 900, left: 0, top: 0, width: 506.25 },
      viewport
    )
    const portrait = calculateJoystickLayout(
      { height: 800, left: -20, top: 0, width: 450 },
      { ...viewport, height: 800, width: 410 }
    )
    const landscape = calculateJoystickLayout(
      { height: 430, left: 0, top: 0, width: 760 },
      { ...viewport, height: 430, width: 760 }
    )
    const fullscreen = calculateJoystickLayout(
      { height: 1080, left: 0, top: 0, width: 607.5 },
      { ...viewport, height: 1080, width: 607.5 }
    )

    expect(desktop.left).toBeCloseTo(42.67, 2)
    expect(portrait.left).toBe(88)
    expect(landscape.bottom).toBeCloseTo(89.3, 1)
    expect(fullscreen.bottom).toBeCloseTo(35.56, 2)
  })
})

describe('VirtualMovementJoystick GUI lifecycle', () => {
  it('captures an in-circle drag anywhere until release', () => {
    const { fakeTexture, texture } = createHarness()
    const onInput = vi.fn()
    const joystick = new VirtualMovementJoystick(texture, onInput)
    const pointerInfo = {
      event: { pointerId: 7 }
    }

    joystick.outer.onPointerDownObservable.notifyObservers(
      new Vector2WithInfo(new Vector2(100, 100)),
      -1,
      joystick.outer,
      joystick.outer,
      pointerInfo
    )
    expect(fakeTexture._capturingControl[7]).toBe(joystick.outer)
    expect(fakeTexture.pointerSurface.capturedPointers.has(7)).toBe(true)

    joystick.outer.onPointerMoveObservable.notifyObservers(
      new Vector2WithInfo(new Vector2(5000, -5000))
    )
    expect(onInput.mock.lastCall?.[0].length()).toBeCloseTo(1)

    joystick.outer.onPointerUpObservable.notifyObservers(
      new Vector2WithInfo(new Vector2(5000, -5000)),
      -1,
      joystick.outer,
      joystick.outer,
      pointerInfo
    )
    expect(fakeTexture._capturingControl[7]).toBeUndefined()
    expect(fakeTexture.pointerSurface.capturedPointers.has(7)).toBe(false)
    expect(onInput).toHaveBeenLastCalledWith(Vector2.Zero())

    const callCount = onInput.mock.calls.length
    joystick.outer.onPointerMoveObservable.notifyObservers(
      new Vector2WithInfo(new Vector2(0, 0))
    )
    expect(onInput).toHaveBeenCalledTimes(callCount)
    joystick.dispose()
  })

  it('centers captured input when the pointer is cancelled', () => {
    const { fakeTexture, texture } = createHarness()
    const onInput = vi.fn()
    const joystick = new VirtualMovementJoystick(texture, onInput)
    const pointerInfo = {
      event: { pointerId: 9 }
    }

    joystick.outer.onPointerDownObservable.notifyObservers(
      new Vector2WithInfo(new Vector2(100, 100)),
      -1,
      joystick.outer,
      joystick.outer,
      pointerInfo
    )
    const cancel = new Event('pointercancel')
    Object.defineProperty(cancel, 'pointerId', { value: 9 })
    fakeTexture.pointerSurface.dispatchEvent(cancel)

    expect(fakeTexture._capturingControl[9]).toBeUndefined()
    expect(onInput).toHaveBeenLastCalledWith(Vector2.Zero())
    joystick.dispose()
  })

  it('adds focused lower-left controls to the shared texture', () => {
    const { texture } = createHarness()
    const joystick = new VirtualMovementJoystick(texture, vi.fn())

    expect(texture.rootContainer.children).toContain(joystick.root)
    expect(joystick.root.horizontalAlignment).toBe(
      Control.HORIZONTAL_ALIGNMENT_LEFT
    )
    expect(joystick.root.verticalAlignment).toBe(
      Control.VERTICAL_ALIGNMENT_BOTTOM
    )
    expect(joystick.root.isPointerBlocker).toBe(false)
    expect(joystick.outer.isPointerBlocker).toBe(true)
    joystick.dispose()
  })

  it('updates layout and enabled state', () => {
    const { texture } = createHarness()
    const onInput = vi.fn()
    const joystick = new VirtualMovementJoystick(texture, onInput)

    joystick.updateLayout({
      bottom: 40,
      centerX: 0,
      centerY: 0,
      left: 124,
      right: 0,
      scale: 2,
      top: 0,
      visibleHeight: 1560,
      visibleWidth: 676
    })
    expect(joystick.root.leftInPixels).toBe(172)
    expect(joystick.root.topInPixels).toBe(-88)

    joystick.setEnabled(false)
    expect(joystick.root.isVisible).toBe(false)
    expect(joystick.outer.isHitTestVisible).toBe(false)
    expect(onInput).toHaveBeenLastCalledWith(Vector2.Zero())

    joystick.setEnabled(true)
    expect(joystick.root.isVisible).toBe(true)
    expect(joystick.outer.isHitTestVisible).toBe(true)
    joystick.dispose()
  })

  it('removes observers and controls without disposing the texture', () => {
    const { texture } = createHarness()
    const joystick = new VirtualMovementJoystick(texture, vi.fn())

    expect(joystick.outer.onPointerDownObservable.hasObservers()).toBe(true)
    joystick.dispose()

    expect(texture.rootContainer.children).not.toContain(joystick.root)
    expect(joystick.outer.onPointerDownObservable.hasObservers()).toBe(false)
    expect(() => texture.addControl(new Rectangle('StillAlive')))
      .not.toThrow()
  })
})
