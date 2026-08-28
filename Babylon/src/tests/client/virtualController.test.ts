import { Vector2 } from '@babylonjs/core'
import {
  AdvancedDynamicTexture,
  Container,
  Control,
  Vector2WithInfo
} from '@babylonjs/gui'
import { describe, expect, it, vi } from 'vitest'
import {
  VirtualController,
  calculateVirtualControllerLayout,
  virtualControllerVerticalOffset
} from '../../client/scripts/controller/virtualController'
import {
  PRODUCTION_LABEL_FONT_SIZE,
  PRODUCTION_LABEL_HEIGHT
} from '../../client/scripts/view/2d/productionTextStyle'
import {
  virtualControllerPuckBackground,
  virtualControllerPuckPressedBackground
} from '../../client/scripts/controller/virtualMovementJoystick'

class FakePointerSurface extends EventTarget {
  readonly capturedPointers = new Set<number>()

  setPointerCapture(pointerId: number): void {
    this.capturedPointers.add(pointerId)
  }

  releasePointerCapture(pointerId: number): void {
    this.capturedPointers.delete(pointerId)
  }

  hasPointerCapture(pointerId: number): boolean {
    return this.capturedPointers.has(pointerId)
  }
}

class FakeTexture {
  readonly rootContainer = new Container('FakeTextureRoot')
  readonly _capturingControl: Record<number, Control> = {}
  readonly pointerSurface = new FakePointerSurface()
  idealHeight = 1600

  addControl(control: Control): this {
    this.rootContainer.addControl(control)
    return this
  }

  removeControl(control: Control): this {
    this.rootContainer.removeControl(control)
    return this
  }

  getSize(): { width: number; height: number } {
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

function createController(actionCount = 2) {
  const fakeTexture = new FakeTexture()
  const texture = fakeTexture as unknown as AdvancedDynamicTexture
  const onMove = vi.fn()
  const onActions = Array.from(
    { length: actionCount },
    () => vi.fn()
  )
  const controller = new VirtualController(texture, {
    movement: {
      label: 'Move',
      onInput: onMove
    },
    actions: onActions.map((onPressed, index) => ({
      id: `action-${index}`,
      label: `Action ${index}`,
      onPressed,
      shortcut: `${index}`
    }))
  })

  return {
    controller,
    fakeTexture,
    onActions,
    onMove,
    texture
  }
}

describe('configurable virtual controller', () => {
  it.each([0, 1, 2, 3])('supports movement plus %i actions', count => {
    const { controller } = createController(count)

    expect(controller.movementLabel.text).toBe('Move')
    expect(controller.actions).toHaveLength(count)
    controller.dispose()
  })

  it('rejects a fourth action', () => {
    expect(() => createController(4)).toThrow(RangeError)
  })

  it('uses standalone joystick puck circles for actions', () => {
    const { controller } = createController()
    const action = controller.actions[0]

    expect(action.circle.widthInPixels).toBe(
      controller.movement.puck.widthInPixels
    )
    expect(action.circle.heightInPixels).toBe(
      controller.movement.puck.heightInPixels
    )
    expect(action.circle.background).toBe(
      controller.movement.puck.background
    )
    expect(action.circle.color).toBe(controller.movement.puck.color)
    expect(action.circle.isPointerBlocker).toBe(true)
    expect(action.root.background).toBe('')
    controller.dispose()
  })

  it('keeps action presses independent from captured movement', () => {
    const harness = createController(1)
    const { controller, fakeTexture, onActions, onMove } = harness
    const pointerInfo = { event: { pointerId: 5 } }

    controller.movement.outer.onPointerDownObservable.notifyObservers(
      new Vector2WithInfo(new Vector2(100, 100)),
      -1,
      controller.movement.outer,
      controller.movement.outer,
      pointerInfo
    )
    controller.actions[0].circle.onPointerDownObservable.notifyObservers(
      new Vector2WithInfo(Vector2.Zero())
    )

    expect(fakeTexture.pointerSurface.capturedPointers.has(5)).toBe(true)
    expect(onMove.mock.lastCall?.[0].length()).toBeGreaterThan(0)
    expect(onActions[0]).toHaveBeenCalledOnce()
    controller.dispose()
  })

  it('darkens each action circle only while its pointer is down', () => {
    const { controller } = createController(2)
    const first = controller.actions[0].circle
    const second = controller.actions[1].circle
    const pointerInfo = { event: { pointerId: 11 } }

    first.onPointerDownObservable.notifyObservers(
      new Vector2WithInfo(Vector2.Zero()),
      -1,
      first,
      first,
      pointerInfo
    )
    expect(first.background).toBe(
      virtualControllerPuckPressedBackground
    )
    expect(second.background).toBe(
      virtualControllerPuckBackground
    )

    first.onPointerUpObservable.notifyObservers(
      new Vector2WithInfo(Vector2.Zero()),
      -1,
      first,
      first,
      pointerInfo
    )
    expect(first.background).toBe(virtualControllerPuckBackground)
    controller.dispose()
  })

  it('disables input and disposes only its own controls', () => {
    const harness = createController(1)
    const { controller, fakeTexture, onActions, onMove } = harness

    controller.setEnabled(false)
    controller.actions[0].circle.onPointerDownObservable.notifyObservers(
      new Vector2WithInfo(Vector2.Zero())
    )

    expect(controller.root.isVisible).toBe(false)
    expect(controller.actions[0].circle.isHitTestVisible).toBe(false)
    expect(onActions[0]).not.toHaveBeenCalled()
    expect(onMove).toHaveBeenLastCalledWith(Vector2.Zero())

    controller.dispose()
    expect(fakeTexture.rootContainer.children).not.toContain(controller.root)
    expect(
      controller.actions[0].circle.onPointerDownObservable.hasObservers()
    ).toBe(false)
  })

  it('uses single-line score-sized controller labels', () => {
    const { controller } = createController(1)
    const labels = [
      controller.movementLabel,
      controller.actions[0].label
    ]

    for (const label of labels) {
      expect(label.fontSizeInPixels).toBe(PRODUCTION_LABEL_FONT_SIZE)
      expect(label.heightInPixels).toBe(PRODUCTION_LABEL_HEIGHT)
      expect(label.textWrapping).toBeFalsy()
      expect(label.fontFamily).toBe('Arial, sans-serif')
      expect(label.fontWeight).toBe('700')
      expect(label.outlineWidth).toBe(4)
    }
    controller.dispose()
  })
})

describe('virtual controller layout', () => {
  const visibleLayout = {
    bottom: 40,
    centerX: 0,
    centerY: 0,
    left: 80,
    right: 80,
    scale: 2,
    top: 0,
    visibleHeight: 1560,
    visibleWidth: 740
  }

  it('places movement left and ordered actions right', () => {
    const layout = calculateVirtualControllerLayout(visibleLayout, 2)
    const first = layout.actions[0]
    const second = layout.actions[1]

    expect(layout.movement.left).toBeGreaterThanOrEqual(visibleLayout.left)
    expect(first.left).toBeGreaterThan(layout.movement.right)
    expect(second.left).toBeGreaterThan(first.left)
    expect(second.right).toBeLessThanOrEqual(
      visibleLayout.left + visibleLayout.visibleWidth
    )
  })

  it('centers two actions in equal slots across the right half', () => {
    const layout = calculateVirtualControllerLayout(visibleLayout, 2)
    const visibleLeft = visibleLayout.left
    const visibleWidth = visibleLayout.visibleWidth
    const centers = layout.actions.map(action => {
      return (action.left + action.right) * 0.5
    })

    expect(centers[0]).toBeCloseTo(
      visibleLeft + visibleWidth * 0.625
    )
    expect(centers[1]).toBeCloseTo(
      visibleLeft + visibleWidth * 0.875
    )
  })

  it('moves the complete controller up 30 viewport pixels', () => {
    const layout = calculateVirtualControllerLayout(visibleLayout, 2)
    const expectedBottom = visibleLayout.bottom + 24 +
      virtualControllerVerticalOffset * visibleLayout.scale

    expect(virtualControllerVerticalOffset).toBe(30)
    expect(layout.movement.bottom).toBe(expectedBottom)
    expect(layout.actions[0].bottom).toBe(expectedBottom)
    expect(layout.actions[1].bottom).toBe(expectedBottom)
  })

  it('fits three actions and is stable across repeated updates', () => {
    const first = calculateVirtualControllerLayout(visibleLayout, 3)
    const repeated = calculateVirtualControllerLayout(visibleLayout, 3)

    expect(repeated).toEqual(first)
    expect(first.scale).toBeLessThanOrEqual(1)
    expect(first.actions).toHaveLength(3)
    expect(first.actions[2].right).toBeLessThanOrEqual(
      visibleLayout.left + visibleLayout.visibleWidth
    )
  })
})
