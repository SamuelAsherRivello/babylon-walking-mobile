export type RenderingType = 'WebGPU' | 'WebGL'

export type RenderingFallbackReason =
  | 'unavailable'
  | 'initialization-failed'

export interface DisposableRenderingEngine {
  dispose(): void
}

export interface InitializableRenderingEngine
  extends DisposableRenderingEngine {
  initAsync(): Promise<void>
}

export interface RenderingEngineFactories<
  TEngine extends DisposableRenderingEngine,
  TWebGPUEngine extends TEngine & InitializableRenderingEngine,
> {
  createWebGPU(): TWebGPUEngine
  createWebGL(): TEngine
  warn?(error: unknown): void
}

export interface RenderingEngineResult<
  TEngine extends DisposableRenderingEngine,
> {
  engine: TEngine
  renderingType: RenderingType
  fallbackReason?: RenderingFallbackReason
}

export async function createRenderingEngine<
  TEngine extends DisposableRenderingEngine,
  TWebGPUEngine extends TEngine & InitializableRenderingEngine,
>(
  webGPUAvailable: boolean,
  factories: RenderingEngineFactories<TEngine, TWebGPUEngine>,
): Promise<RenderingEngineResult<TEngine>> {
  if (!webGPUAvailable) {
    return {
      engine: factories.createWebGL(),
      renderingType: 'WebGL',
      fallbackReason: 'unavailable',
    }
  }

  let webGPUEngine: TWebGPUEngine | undefined

  try {
    webGPUEngine = factories.createWebGPU()
    await webGPUEngine.initAsync()

    return {
      engine: webGPUEngine,
      renderingType: 'WebGPU',
    }
  } catch (error) {
    webGPUEngine?.dispose()
    factories.warn?.(error)

    return {
      engine: factories.createWebGL(),
      renderingType: 'WebGL',
      fallbackReason: 'initialization-failed',
    }
  }
}
