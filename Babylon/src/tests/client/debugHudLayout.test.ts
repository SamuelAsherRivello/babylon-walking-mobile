import { describe, expect, it } from 'vitest'
import {
  debugHudCorner,
  getDebugHudCornerPosition
} from '../../client/scripts/debugHudLayout'

describe('debug HUD corner layout', () => {
  it('keeps lower-right as the hardcoded default', () => {
    expect(debugHudCorner).toBe('lower-right')
  })

  it.each([
    [
      'upper-right',
      {
        top: '10px',
        right: '10px',
        bottom: 'auto',
        left: 'auto',
        alignItems: 'flex-end'
      }
    ],
    [
      'upper-left',
      {
        top: '10px',
        right: 'auto',
        bottom: 'auto',
        left: '10px',
        alignItems: 'flex-start'
      }
    ],
    [
      'lower-left',
      {
        top: 'auto',
        right: 'auto',
        bottom: '10px',
        left: '10px',
        alignItems: 'flex-start'
      }
    ],
    [
      'lower-right',
      {
        top: 'auto',
        right: '10px',
        bottom: '10px',
        left: 'auto',
        alignItems: 'flex-end'
      }
    ]
  ] as const)('positions panels in the %s', (corner, expected) => {
    expect(getDebugHudCornerPosition(corner)).toEqual(expected)
  })
})
