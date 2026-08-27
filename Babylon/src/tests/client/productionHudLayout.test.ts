import { describe, expect, it } from 'vitest'
import {
  calculateProductionUiLayout
} from '../../client/scripts/productionHudLayout'

describe('production HUD visible-canvas layout', () => {
  it('keeps portrait fullscreen UI inside a cropped canvas', () => {
    const layout = calculateProductionUiLayout(
      {
        height: 1338,
        left: -69,
        top: 54,
        width: 752
      },
      {
        height: 1338,
        safeAreaBottom: 0,
        safeAreaLeft: 0,
        safeAreaRight: 0,
        safeAreaTop: 0,
        width: 614
      }
    )

    expect(layout.left).toBeCloseTo(82.51, 2)
    expect(layout.right).toBeCloseTo(82.51, 2)
    expect(layout.top).toBe(0)
    expect(layout.visibleWidth).toBeCloseTo(734.23, 2)
    expect(layout.centerX).toBeCloseTo(0)
  })

  it('includes all four safe-area insets', () => {
    const layout = calculateProductionUiLayout(
      {
        height: 1000,
        left: 0,
        top: 0,
        width: 600
      },
      {
        height: 1000,
        safeAreaBottom: 30,
        safeAreaLeft: 40,
        safeAreaRight: 20,
        safeAreaTop: 10,
        width: 600
      }
    )

    expect(layout.top).toBe(16)
    expect(layout.right).toBe(32)
    expect(layout.bottom).toBe(48)
    expect(layout.left).toBe(64)
    expect(layout.centerX).toBe(16)
    expect(layout.centerY).toBe(-16)
  })

  it('includes visual-viewport origins in the safe intersection', () => {
    const layout = calculateProductionUiLayout(
      {
        height: 1338,
        left: -69,
        top: 20,
        width: 752
      },
      {
        height: 1284,
        left: 10,
        safeAreaBottom: 30,
        safeAreaLeft: 12,
        safeAreaRight: 20,
        safeAreaTop: 10,
        top: 54,
        width: 614
      }
    )

    expect(layout.left).toBeCloseTo(108.82, 2)
    expect(layout.right).toBeCloseTo(94.47, 2)
    expect(layout.top).toBeCloseTo(52.62, 2)
    expect(layout.bottom).toBeCloseTo(59.79, 2)
    expect(layout.visibleWidth).toBeCloseTo(695.96, 2)
    expect(layout.visibleHeight).toBeCloseTo(1487.59, 2)
  })

  it('derives each update from current geometry without drift', () => {
    const portrait = calculateProductionUiLayout(
      { height: 800, left: -50, top: 0, width: 500 },
      {
        height: 800,
        safeAreaBottom: 0,
        safeAreaLeft: 0,
        safeAreaRight: 0,
        safeAreaTop: 0,
        width: 400
      }
    )
    const landscape = calculateProductionUiLayout(
      { height: 400, left: 0, top: 0, width: 700 },
      {
        height: 400,
        safeAreaBottom: 0,
        safeAreaLeft: 0,
        safeAreaRight: 0,
        safeAreaTop: 0,
        width: 700
      }
    )
    const repeatedPortrait = calculateProductionUiLayout(
      { height: 800, left: -50, top: 0, width: 500 },
      {
        height: 800,
        safeAreaBottom: 0,
        safeAreaLeft: 0,
        safeAreaRight: 0,
        safeAreaTop: 0,
        width: 400
      }
    )

    expect(landscape.left).toBe(0)
    expect(repeatedPortrait).toEqual(portrait)
  })
})
