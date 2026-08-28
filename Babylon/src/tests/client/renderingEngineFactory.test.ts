import { describe, expect, it, vi } from 'vitest'

import {
  createRenderingEngine,
  type DisposableRenderingEngine,
  type InitializableRenderingEngine,
} from '../../client/scripts/view/3d/renderingEngineFactory'

class FakeEngine implements DisposableRenderingEngine {
  public disposed = false

  public dispose(): void {
    this.disposed = true
  }
}

class FakeWebGPUEngine extends FakeEngine
  implements InitializableRenderingEngine {
  public constructor(private readonly initializationError?: Error) {
    super()
  }

  public async initAsync(): Promise<void> {
    if (this.initializationError !== undefined) {
      throw this.initializationError
    }
  }
}

describe('createRenderingEngine', () => {
  it('uses WebGPU when initialization succeeds', async () => {
    const webGPUEngine = new FakeWebGPUEngine()
    const createWebGPU = vi.fn(() => webGPUEngine)
    const createWebGL = vi.fn(() => new FakeEngine())

    const result = await createRenderingEngine(true, {
      createWebGPU,
      createWebGL,
    })

    expect(result).toEqual({
      engine: webGPUEngine,
      renderingType: 'WebGPU',
    })
    expect(createWebGPU).toHaveBeenCalledOnce()
    expect(createWebGL).not.toHaveBeenCalled()
  })

  it('uses WebGL when WebGPU is unavailable', async () => {
    const webGLEngine = new FakeEngine()
    const createWebGPU = vi.fn(() => new FakeWebGPUEngine())
    const createWebGL = vi.fn(() => webGLEngine)

    const result = await createRenderingEngine(false, {
      createWebGPU,
      createWebGL,
    })

    expect(result).toEqual({
      engine: webGLEngine,
      renderingType: 'WebGL',
      fallbackReason: 'unavailable',
    })
    expect(createWebGPU).not.toHaveBeenCalled()
    expect(createWebGL).toHaveBeenCalledOnce()
  })

  it('disposes a failed WebGPU engine and warns once', async () => {
    const error = new Error('WebGPU initialization failed')
    const failedEngine = new FakeWebGPUEngine(error)
    const webGLEngine = new FakeEngine()
    const warn = vi.fn()

    const result = await createRenderingEngine(true, {
      createWebGPU: () => failedEngine,
      createWebGL: () => webGLEngine,
      warn,
    })

    expect(failedEngine.disposed).toBe(true)
    expect(warn).toHaveBeenCalledOnce()
    expect(warn).toHaveBeenCalledWith(error)
    expect(result).toEqual({
      engine: webGLEngine,
      renderingType: 'WebGL',
      fallbackReason: 'initialization-failed',
    })
  })
})
