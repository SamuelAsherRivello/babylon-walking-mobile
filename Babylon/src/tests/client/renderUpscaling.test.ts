import { describe, expect, it } from 'vitest'
import {
  RenderResolutionController,
  cycleUpscalingMode,
  getUpscalingFactor,
  upscalingModes,
  type RenderResolutionEngine,
  type RenderViewport,
  type UpscalingMode
} from '../../client/scripts/model/renderUpscaling'

class FakeRenderEngine implements RenderResolutionEngine {
  public hardwareScalingLevel = 1
  public renderWidth = 0
  public renderHeight = 0
  public resizeCount = 0

  public constructor(
    private readonly getViewport: () => RenderViewport
  ) {}

  public getHardwareScalingLevel(): number {
    return this.hardwareScalingLevel
  }

  public setHardwareScalingLevel(level: number): void {
    this.hardwareScalingLevel = level
  }

  public resize(): void {
    const viewport = this.getViewport()
    this.resizeCount += 1
    this.renderWidth = Math.floor(
      viewport.width / this.hardwareScalingLevel
    )
    this.renderHeight = Math.floor(
      viewport.height / this.hardwareScalingLevel
    )
  }

  public getRenderWidth(): number {
    return this.renderWidth
  }

  public getRenderHeight(): number {
    return this.renderHeight
  }
}

describe('render upscaling', () => {
  it('cycles through stable mode order and factors', () => {
    expect(upscalingModes).toEqual(['Off', '2x', '4x'])
    expect(upscalingModes.map(getUpscalingFactor)).toEqual([1, 2, 4])
    expect(cycleUpscalingMode('Off')).toBe('2x')
    expect(cycleUpscalingMode('2x')).toBe('4x')
    expect(cycleUpscalingMode('4x')).toBe('Off')
  })

  it.each([1, 2, 3])(
    'keeps each mode relative to the native DPR %i size',
    devicePixelRatio => {
      let viewport: RenderViewport = {
        width: 801.5,
        height: 603.25,
        devicePixelRatio
      }
      const engine = new FakeRenderEngine(() => viewport)
      const controller = new RenderResolutionController(engine, true)
      const expectedDisplay = {
        width: Math.floor(viewport.width * devicePixelRatio),
        height: Math.floor(viewport.height * devicePixelRatio)
      }

      for (const mode of upscalingModes) {
        const factor = getUpscalingFactor(mode)
        const snapshot = controller.synchronize(viewport, mode)

        expect(snapshot.displayResolution).toEqual(expectedDisplay)
        expect(snapshot.renderResolution).toEqual({
          width: Math.floor(
            viewport.width * devicePixelRatio / factor
          ),
          height: Math.floor(
            viewport.height * devicePixelRatio / factor
          )
        })
        expect(engine.hardwareScalingLevel).toBeCloseTo(
          factor / devicePixelRatio
        )
      }

      const resizeCount = engine.resizeCount
      controller.synchronize(viewport, '4x')
      expect(engine.resizeCount).toBe(resizeCount)

      viewport = { ...viewport, width: 900 }
      controller.synchronize(viewport, '4x')
      expect(engine.resizeCount).toBe(resizeCount + 1)
    }
  )

  it('keeps Off native when device-ratio adaptation is disabled', () => {
    let viewport: RenderViewport = {
      width: 800,
      height: 600,
      devicePixelRatio: 3
    }
    const engine = new FakeRenderEngine(() => viewport)
    const controller = new RenderResolutionController(engine, false)

    const snapshot = controller.synchronize(viewport, 'Off')

    expect(snapshot.displayResolution).toEqual({
      width: 800,
      height: 600
    })
    expect(snapshot.renderResolution).toEqual(
      snapshot.displayResolution
    )
    expect(engine.hardwareScalingLevel).toBe(1)
  })

  it('accepts only the declared modes', () => {
    const modes: UpscalingMode[] = ['Off', '2x', '4x']

    expect(modes).toEqual(upscalingModes)
  })
})
