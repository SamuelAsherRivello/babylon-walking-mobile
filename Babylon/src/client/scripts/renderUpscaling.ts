export const upscalingModes = ['Off', '2x', '4x'] as const

export type UpscalingMode = (typeof upscalingModes)[number]

export type RenderResolution = {
  width: number
  height: number
}

export type RenderViewport = RenderResolution & {
  devicePixelRatio: number
}

export type RenderResolutionSnapshot = {
  displayResolution: RenderResolution
  renderResolution: RenderResolution
  upscalingMode: UpscalingMode
}

export interface RenderResolutionEngine {
  getHardwareScalingLevel(): number
  setHardwareScalingLevel(level: number): void
  getRenderWidth(): number
  getRenderHeight(): number
  resize(): void
}

export function isUpscalingMode(value: unknown): value is UpscalingMode {
  return upscalingModes.includes(value as UpscalingMode)
}

export function getUpscalingFactor(mode: UpscalingMode): number {
  return mode === 'Off' ? 1 : Number.parseInt(mode, 10)
}

export function cycleUpscalingMode(
  mode: UpscalingMode
): UpscalingMode {
  const currentIndex = upscalingModes.indexOf(mode)
  const nextIndex = (currentIndex + 1) % upscalingModes.length

  return upscalingModes[nextIndex]
}

function normalizeDimension(value: number): number {
  return Number.isFinite(value) ? Math.max(1, value) : 1
}

function normalizeDevicePixelRatio(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 1
}

export class RenderResolutionController {
  private lastSignature?: string

  public constructor(
    private readonly engine: RenderResolutionEngine,
    private readonly adaptToDeviceRatio: boolean
  ) {}

  public synchronize(
    viewport: RenderViewport,
    mode: UpscalingMode
  ): RenderResolutionSnapshot {
    const width = normalizeDimension(viewport.width)
    const height = normalizeDimension(viewport.height)
    const devicePixelRatio = normalizeDevicePixelRatio(
      viewport.devicePixelRatio
    )
    const nativeScale = this.adaptToDeviceRatio
      ? 1 / devicePixelRatio
      : 1
    const hardwareScalingLevel =
      nativeScale * getUpscalingFactor(mode)
    const signature = [
      width,
      height,
      devicePixelRatio,
      hardwareScalingLevel
    ].join(':')

    if (
      Math.abs(
        this.engine.getHardwareScalingLevel() - hardwareScalingLevel
      ) > Number.EPSILON
    ) {
      this.engine.setHardwareScalingLevel(hardwareScalingLevel)
    }

    if (signature !== this.lastSignature) {
      this.lastSignature = signature
      this.engine.resize()
    }

    const displayScale = this.adaptToDeviceRatio
      ? devicePixelRatio
      : 1

    return {
      displayResolution: {
        width: Math.floor(width * displayScale),
        height: Math.floor(height * displayScale)
      },
      renderResolution: {
        width: this.engine.getRenderWidth(),
        height: this.engine.getRenderHeight()
      },
      upscalingMode: mode
    }
  }
}
