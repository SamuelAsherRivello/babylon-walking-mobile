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
})
