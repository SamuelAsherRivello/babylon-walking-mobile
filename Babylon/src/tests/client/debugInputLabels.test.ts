import { describe, expect, it } from 'vitest'
import {
  debugPreferenceDefaults,
  getDebugInputLabels,
  mobileDebugInputLabels
} from '../../client/scripts/debugPreferences'

describe('debug input labels', () => {
  it('shows the requested numbered debug inputs', () => {
    const labels = getDebugInputLabels(debugPreferenceDefaults)

    expect(labels).toContain('1 = Toggle HUD')
    expect(labels).toContain('2 = Toggle Inspector')
    expect(labels).toContain('3 = Toggle Antialias')
    expect(labels).toContain('4 = Toggle Upscaling')
    expect(labels).toContain('5 = Toggle FPS')
    expect(labels).toContain('6 = Toggle Grid')
    expect(labels).toContain('7 = Reset to Defaults (Disk)')
    expect(labels).toContain('8 = Restart Scene')
    expect(labels).not.toContain('3 Finger Tap = Mobile Mode')
    expect(mobileDebugInputLabels).toEqual([
      '3 Finger Tap = Mobile Mode'
    ])
  })
})
