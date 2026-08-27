import { describe, expect, it } from 'vitest'
import {
  debugPreferenceDefaults,
  getDebugInputLabels
} from '../../client/scripts/debugPreferences'

describe('debug input labels', () => {
  it('shows the requested numbered debug inputs', () => {
    const labels = getDebugInputLabels(debugPreferenceDefaults)

    expect(labels).toContain('1 = Toggle HUD')
    expect(labels).toContain('2 = Toggle Inspector')
    expect(labels).toContain('3 = Toggle Antialias')
    expect(labels).toContain('4 = Toggle FPS')
    expect(labels).toContain('5 = Reset to Defaults (Disk)')
    expect(labels).toContain('6 = Restart Scene')
    expect(labels).toContain(
      '3 Finger Tap = Tog. Mobile Mode'
    )
    expect(labels.at(-1)).toBe('IJKL = Move Camera')
  })
})
