import { describe, expect, it } from 'vitest'
import {
  debugPreferenceDefaults,
  getDebugInputLabels,
  readDebugPreferences,
  resetDebugPreferences,
  setMobileModePreference,
  toggleDebugHudPreference,
  writeDebugPreferences
} from '../../client/scripts/debugPreferences'

class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>()

  public get length() {
    return this.values.size
  }

  public clear() {
    this.values.clear()
  }

  public getItem(key: string) {
    return this.values.get(key) ?? null
  }

  public key(index: number) {
    return Array.from(this.values.keys())[index] ?? null
  }

  public removeItem(key: string) {
    this.values.delete(key)
  }

  public setItem(key: string, value: string) {
    this.values.set(key, value)
  }
}

describe('debugPreferences', () => {
  it('uses the original debug defaults when nothing is stored', () => {
    expect(readDebugPreferences(new MemoryStorage())).toEqual(
      debugPreferenceDefaults
    )
  })

  it('round-trips persisted debug preferences from storage', () => {
    const storage = new MemoryStorage()
    const preferences = {
      hudVisible: false,
      inspectorOpen: true,
      antialias: false,
      targetFramerateIndex: 2,
      mobileModeEnabled: true
    }

    writeDebugPreferences(storage, preferences)

    expect(readDebugPreferences(storage)).toEqual(preferences)
  })

  it('falls back to defaults for invalid persisted data', () => {
    const storage = new MemoryStorage()
    storage.setItem('babylon.debugPreferences.v1', '{"antialias":"bad"}')

    expect(readDebugPreferences(storage)).toEqual(debugPreferenceDefaults)
  })

  it('removes persisted debug preferences when reset', () => {
    const storage = new MemoryStorage()
    writeDebugPreferences(storage, {
      hudVisible: false,
      inspectorOpen: true,
      antialias: false,
      targetFramerateIndex: 2,
      mobileModeEnabled: true
    })

    resetDebugPreferences(storage)

    expect(readDebugPreferences(storage)).toEqual(debugPreferenceDefaults)
  })

  it('marks disk-backed debug inputs changed from defaults', () => {
    const labels = getDebugInputLabels({
      hudVisible: false,
      inspectorOpen: true,
      antialias: false,
      targetFramerateIndex: 2,
      mobileModeEnabled: true
    })

    expect(getDebugInputLabels(debugPreferenceDefaults)).toEqual([
      '1 = Toggle HUD',
      '2 = Toggle Inspector',
      '3 = Toggle Antialias',
      '4 = Toggle FPS',
      '5 = Reset to Defaults (Disk)',
      '6 = Restart Scene',
      '3 Finger Tap = Tog. Mobile Mode',
      'IJKL = Move Camera'
    ])
    expect(labels).toEqual([
      '1 = Toggle HUD *',
      '2 = Toggle Inspector *',
      '3 = Toggle Antialias *',
      '4 = Toggle FPS *',
      '5 = Reset to Defaults (Disk)',
      '6 = Restart Scene',
      '3 Finger Tap = Tog. Mobile Mode',
      'IJKL = Move Camera'
    ])
  })

  it('persists visibility through the shared HUD toggle path', () => {
    const storage = new MemoryStorage()
    const preferences = { ...debugPreferenceDefaults }

    expect(toggleDebugHudPreference(
      preferences,
      storage,
      () => false
    )).toBe(false)
    expect(readDebugPreferences(storage).hudVisible).toBe(false)

    expect(toggleDebugHudPreference(
      preferences,
      storage,
      () => true
    )).toBe(true)
    expect(readDebugPreferences(storage).hudVisible).toBe(true)
  })

  it('persists the mobile-mode on and normal-default profiles', () => {
    const storage = new MemoryStorage()
    const preferences = { ...debugPreferenceDefaults }

    setMobileModePreference(preferences, storage, true)
    expect(preferences).toEqual({
      hudVisible: false,
      inspectorOpen: false,
      antialias: false,
      targetFramerateIndex: 1,
      mobileModeEnabled: true
    })
    expect(readDebugPreferences(storage)).toEqual(preferences)

    setMobileModePreference(preferences, storage, false)
    expect(preferences).toEqual(debugPreferenceDefaults)
    expect(readDebugPreferences(storage)).toEqual(
      debugPreferenceDefaults
    )
  })
})
