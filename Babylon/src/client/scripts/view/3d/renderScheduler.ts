function validateTargetFPS(targetFPS: number): void {
  if (!Number.isFinite(targetFPS) || targetFPS <= 0) {
    throw new RangeError('Target FPS must be a positive finite number.')
  }
}

export class RenderScheduler {
  private targetFPS: number
  private nextRenderTimeMs?: number
  private lastTimestampMs?: number

  public constructor(targetFPS: number) {
    validateTargetFPS(targetFPS)
    this.targetFPS = targetFPS
  }

  public setTargetFPS(targetFPS: number): void {
    validateTargetFPS(targetFPS)
    this.targetFPS = targetFPS
    this.reset()
  }

  public reset(): void {
    this.nextRenderTimeMs = undefined
    this.lastTimestampMs = undefined
  }

  public shouldRender(nowMs: number): boolean {
    if (!Number.isFinite(nowMs)) {
      return false
    }

    const frameIntervalMs = 1000 / this.targetFPS
    const timelineRestarted = this.lastTimestampMs === undefined
      || nowMs < this.lastTimestampMs

    if (timelineRestarted || this.nextRenderTimeMs === undefined) {
      this.lastTimestampMs = nowMs
      this.nextRenderTimeMs = nowMs + frameIntervalMs
      return true
    }

    this.lastTimestampMs = nowMs

    if (nowMs < this.nextRenderTimeMs) {
      return false
    }

    const overdueIntervals = Math.floor(
      (nowMs - this.nextRenderTimeMs) / frameIntervalMs
    )
    this.nextRenderTimeMs += frameIntervalMs * (overdueIntervals + 1)

    return true
  }
}
