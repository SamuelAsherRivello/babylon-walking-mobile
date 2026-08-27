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
      upscalingMode: '4x' as const,
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
      upscalingMode: '2x',
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
      upscalingMode: '4x' as const,
      targetFramerateIndex: 2,
      mobileModeEnabled: true
    })

    expect(getDebugInputLabels(debugPreferenceDefaults)).toEqual([
      '1 = Toggle HUD',
      '2 = Toggle Inspector',
      '3 = Toggle Antialias',
      '4 = Toggle Upscaling',
      '5 = Toggle FPS',
      '6 = Reset to Defaults (Disk)',
      '7 = Restart Scene',
      'IJKL = Move Camera'
    ])
    expect(labels).toEqual([
      '1 = Toggle HUD *',
      '2 = Toggle Inspector *',
      '3 = Toggle Antialias *',
      '4 = Toggle Upscaling *',
      '5 = Toggle FPS *',
      '6 = Reset to Defaults (Disk)',
      '7 = Restart Scene',
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
      upscalingMode: 'Off',
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

  it('migrates missing and invalid modes to Off', () => {
    const storage = new MemoryStorage()
    const legacyPreferences = {
      hudVisible: false,
      inspectorOpen: true,
      antialias: false,
      targetFramerateIndex: 2,
      mobileModeEnabled: false
    }

    storage.setItem(
      'babylon.debugPreferences.v1',
      JSON.stringify(legacyPreferences)
    )
    expect(readDebugPreferences(storage)).toEqual({
      ...legacyPreferences,
      upscalingMode: 'Off'
    })

    storage.setItem(
      'babylon.debugPreferences.v1',
      JSON.stringify({
        ...legacyPreferences,
        upscalingMode: 'invalid'
      })
    )
    expect(readDebugPreferences(storage)).toEqual({
      ...legacyPreferences,
      upscalingMode: 'Off'
    })
  })

  it('preserves upscaling through mobile-mode transitions', () => {
    const storage = new MemoryStorage()
    const preferences = {
      ...debugPreferenceDefaults,
      upscalingMode: '4x' as const
    }

    setMobileModePreference(preferences, storage, true)
    expect(preferences.upscalingMode).toBe('4x')

    setMobileModePreference(preferences, storage, false)
    expect(preferences.upscalingMode).toBe('4x')
  })
})
