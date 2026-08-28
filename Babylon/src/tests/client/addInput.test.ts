import type { Scene } from '@babylonjs/core'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { addInput } from '../../client/scripts/addInput'

class FakeCanvas extends EventTarget {
  public getBoundingClientRect() {
    return {
      left: 10,
      top: 20
    } as DOMRect
  }
}

function click(canvas: EventTarget, x: number, y: number) {
  const event = new Event('click')
  Object.defineProperties(event, {
    clientX: { value: x },
    clientY: { value: y }
  })
  canvas.dispatchEvent(event)
}

function keydown(
  windowTarget: EventTarget,
  key: string,
  code = ''
) {
  const event = new Event('keydown')
  Object.defineProperties(event, {
    key: { value: key },
    code: { value: code }
  })
  windowTarget.dispatchEvent(event)
}

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('addInput canvas click', () => {
  it('invokes the click action exactly once per canvas click', () => {
    const canvas = new FakeCanvas()
    const onClick = vi.fn()
    vi.stubGlobal('window', new EventTarget())
    vi.spyOn(console, 'log').mockImplementation(() => undefined)

    addInput(
      canvas as unknown as HTMLCanvasElement,
      {} as Scene,
      { onClick }
    )
    click(canvas, 25, 35)
    click(canvas, 30, 40)

    expect(onClick).toHaveBeenCalledTimes(2)
  })

  it('uses the physical F key when Edge omits its key value', async () => {
    const canvas = new FakeCanvas()
    const windowTarget = new EventTarget()
    const onFullscreen = vi.fn()
    vi.stubGlobal('window', windowTarget)

    addInput(
      canvas as unknown as HTMLCanvasElement,
      {} as Scene,
      { onFullscreen }
    )
    keydown(windowTarget, 'Unidentified', 'KeyF')
    await Promise.resolve()

    expect(onFullscreen).toHaveBeenCalledOnce()
  })

  it('maps numbered debug actions from 1 through 8', async () => {
    const canvas = new FakeCanvas()
    const windowTarget = new EventTarget()
    const actions = {
      onHud: vi.fn(),
      onAntialiasing: vi.fn(),
      onUpscaling: vi.fn(),
      onFramerate: vi.fn(),
      onGrid: vi.fn(),
      onResetDefaults: vi.fn(),
      onRestart: vi.fn()
    }
    vi.stubGlobal('window', windowTarget)

    addInput(canvas as unknown as HTMLCanvasElement, {} as Scene, actions)

    for (const key of ['1', '3', '4', '5', '6', '7', '8']) {
      keydown(windowTarget, key)
    }
    await Promise.resolve()

    expect(actions.onHud).toHaveBeenCalledOnce()
    expect(actions.onAntialiasing).toHaveBeenCalledOnce()
    expect(actions.onUpscaling).toHaveBeenCalledOnce()
    expect(actions.onFramerate).toHaveBeenCalledOnce()
    expect(actions.onGrid).toHaveBeenCalledOnce()
    expect(actions.onResetDefaults).toHaveBeenCalledOnce()
    expect(actions.onRestart).toHaveBeenCalledOnce()
  })

  it('does not own C or V gameplay action shortcuts', () => {
    const canvas = new FakeCanvas()
    const windowTarget = new EventTarget()
    const onOrbiter = vi.fn()
    vi.stubGlobal('window', windowTarget)

    const actions = {
      onOrbiter
    } as unknown as Parameters<typeof addInput>[2]
    addInput(canvas as unknown as HTMLCanvasElement, {} as Scene, actions)
    keydown(windowTarget, 'c', 'KeyC')
    keydown(windowTarget, 'v', 'KeyV')

    expect(onOrbiter).not.toHaveBeenCalled()
  })
})
