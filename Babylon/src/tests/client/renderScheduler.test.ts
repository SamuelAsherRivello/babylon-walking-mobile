import { describe, expect, it } from 'vitest'

import { RenderScheduler } from '../../client/scripts/view/3d/renderScheduler'

function measureFrames(
  targetFPS: number,
  callbackIntervalMs: number,
  durationMs = 10_000,
): number {
  const scheduler = new RenderScheduler(targetFPS)
  let renderedFrames = 0

  for (
    let nowMs = callbackIntervalMs;
    nowMs <= durationMs;
    nowMs += callbackIntervalMs
  ) {
    if (scheduler.shouldRender(nowMs)) {
      renderedFrames += 1
    }
  }

  return renderedFrames * 1000 / durationMs
}

describe('RenderScheduler', () => {
  it.each([
    [30, 16.6, 30],
    [60, 16.6, 60],
    [120, 16.6, 60],
    [30, 16.8, 30],
    [60, 16.8, 59.5],
    [120, 16.8, 59.5],
  ])(
    'targets %i FPS with %.1f ms callbacks near %f FPS',
    (targetFPS, callbackIntervalMs, expectedFPS) => {
      const measuredFPS = measureFrames(targetFPS, callbackIntervalMs)

      expect(measuredFPS).toBeCloseTo(expectedFPS, 0)
    },
  )

  it('resets its deadline when the target rate changes', () => {
    const scheduler = new RenderScheduler(60)

    expect(scheduler.shouldRender(0)).toBe(true)
    expect(scheduler.shouldRender(8)).toBe(false)

    scheduler.setTargetFPS(30)

    expect(scheduler.shouldRender(8)).toBe(true)
    expect(scheduler.shouldRender(24)).toBe(false)
    expect(scheduler.shouldRender(42)).toBe(true)
  })

  it('resets safely when the timestamp moves backward', () => {
    const scheduler = new RenderScheduler(60)

    expect(scheduler.shouldRender(100)).toBe(true)
    expect(scheduler.shouldRender(110)).toBe(false)
    expect(scheduler.shouldRender(50)).toBe(true)
    expect(scheduler.shouldRender(55)).toBe(false)
  })

  it('renders at most once after a long pause', () => {
    const scheduler = new RenderScheduler(60)

    expect(scheduler.shouldRender(0)).toBe(true)
    expect(scheduler.shouldRender(10_000)).toBe(true)
    expect(scheduler.shouldRender(10_000)).toBe(false)
  })

  it('rejects invalid target rates', () => {
    expect(() => new RenderScheduler(0)).toThrow(RangeError)
    expect(() => new RenderScheduler(Number.NaN)).toThrow(RangeError)
  })
})
