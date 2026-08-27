import { describe, expect, it } from 'vitest'
import {
  applyGameCanvasLayout,
  createGameViewportSnapshot,
  calculateGameCanvasLayout
} from '../../client/scripts/gameViewport'

describe('game viewport cover geometry', () => {
  const narrowPortrait = {
    height: 1284,
    left: 0,
    safeAreaBottom: 0,
    safeAreaLeft: 0,
    safeAreaRight: 0,
    safeAreaTop: 0,
    top: 54,
    width: 614
  }

  it('fills height and crops equal horizontal edges', () => {
    const layout = calculateGameCanvasLayout(
      narrowPortrait,
      true
    )

    expect(layout.height).toBe(1284)
    expect(layout.width).toBeCloseTo(722.25)
    expect(layout.left).toBeCloseTo(-54.125)
    expect(layout.top).toBe(54)
  })

  it('fills width and crops equal vertical edges', () => {
    const layout = calculateGameCanvasLayout(
      {
        ...narrowPortrait,
        height: 900,
        left: 12,
        top: 20,
        width: 600
      },
      true
    )

    expect(layout.width).toBe(600)
    expect(layout.height).toBeCloseTo(1066.67, 2)
    expect(layout.left).toBe(12)
    expect(layout.top).toBeCloseTo(-63.33, 2)
  })

  it('preserves full-height desktop presentation', () => {
    const layout = calculateGameCanvasLayout(
      {
        ...narrowPortrait,
        height: 900,
        left: 0,
        top: 0,
        width: 1440
      },
      false
    )

    expect(layout.height).toBe(900)
    expect(layout.width).toBeCloseTo(506.25)
    expect(layout.left).toBeCloseTo(466.875)
    expect(layout.top).toBe(0)
  })

  it('returns stable geometry for repeated snapshots', () => {
    const first = calculateGameCanvasLayout(narrowPortrait, true)
    const repeated = calculateGameCanvasLayout(narrowPortrait, true)

    expect(repeated).toEqual(first)
  })

  it('reads visual bounds and safe insets into one snapshot', () => {
    const snapshot = createGameViewportSnapshot(
      {
        innerHeight: 900,
        innerWidth: 600,
        visualViewport: {
          height: 850,
          offsetLeft: 12,
          offsetTop: 40,
          width: 580
        }
      },
      {
        bottom: 30,
        left: 8,
        right: 10,
        top: 20
      }
    )

    expect(snapshot).toEqual({
      height: 850,
      left: 12,
      safeAreaBottom: 30,
      safeAreaLeft: 8,
      safeAreaRight: 10,
      safeAreaTop: 20,
      top: 40,
      width: 580
    })
  })

  it('falls back to the layout viewport at the zero origin', () => {
    const snapshot = createGameViewportSnapshot(
      {
        innerHeight: 900,
        innerWidth: 600,
        visualViewport: null
      },
      { bottom: 0, left: 0, right: 0, top: 0 }
    )

    expect(snapshot.left).toBe(0)
    expect(snapshot.top).toBe(0)
    expect(snapshot.width).toBe(600)
    expect(snapshot.height).toBe(900)
  })

  it('applies mobile geometry idempotently and clears it for desktop', () => {
    const target = {
      dataset: {} as Record<string, string | undefined>,
      style: {
        height: '',
        left: '',
        top: '',
        transform: '',
        width: ''
      }
    }
    const layout = calculateGameCanvasLayout(narrowPortrait, true)

    expect(applyGameCanvasLayout(target, layout, true)).toBe(true)
    expect(applyGameCanvasLayout(target, layout, true)).toBe(false)
    expect(target.style.top).toBe('54px')
    expect(target.dataset.viewportPresentation).toBe('cover')

    expect(applyGameCanvasLayout(target, layout, false)).toBe(true)
    expect(applyGameCanvasLayout(target, layout, false)).toBe(false)
    expect(target.style.top).toBe('')
    expect(target.dataset.viewportPresentation).toBeUndefined()
  })
})
