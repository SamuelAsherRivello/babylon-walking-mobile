import {
  isUpscalingMode,
  type UpscalingMode
} from './renderUpscaling'

export type DebugPreferences = {
  hudVisible: boolean
  inspectorOpen: boolean
  antialias: boolean
  upscalingMode: UpscalingMode
  targetFramerateIndex: number
  mobileModeEnabled: boolean
}

export const debugPreferenceDefaults: DebugPreferences = {
  hudVisible: true,
  inspectorOpen: false,
  antialias: true,
  upscalingMode: 'Off',
  targetFramerateIndex: 1,
  mobileModeEnabled: false
}

export const mobileDebugInputLabels = [
  '3 Finger Tap = Mobile Mode'
]

const debugPreferenceKey = 'babylon.debugPreferences.v1'

function changedMarker(changed: boolean) {
  return changed ? ' *' : ''
}

export function getDebugInputLabels(preferences: DebugPreferences) {
  return [
    `1 = Toggle HUD${changedMarker(
      preferences.hudVisible !== debugPreferenceDefaults.hudVisible
    )}`,
    `2 = Toggle Inspector${changedMarker(
      preferences.inspectorOpen !== debugPreferenceDefaults.inspectorOpen
    )}`,
    `3 = Toggle Antialias${changedMarker(
      preferences.antialias !== debugPreferenceDefaults.antialias
    )}`,
    `4 = Toggle Upscaling${changedMarker(
      preferences.upscalingMode !==
        debugPreferenceDefaults.upscalingMode
    )}`,
    `5 = Toggle FPS${changedMarker(
      preferences.targetFramerateIndex !==
        debugPreferenceDefaults.targetFramerateIndex
    )}`,
    '6 = Toggle Grid',
    '7 = Reset to Defaults (Disk)',
    '8 = Restart Scene',
    'IJKL = Move Camera'
  ]
}

type StoredDebugPreferences = Omit<
  DebugPreferences,
  'mobileModeEnabled' | 'upscalingMode'
> & {
  mobileModeEnabled?: boolean
  upscalingMode?: unknown
}

function isValidPreference(
  value: unknown
): value is StoredDebugPreferences {
  if (!value || typeof value !== 'object') {
    return false
  }

  const preference = value as Partial<StoredDebugPreferences>
  const targetFramerateIndex = preference.targetFramerateIndex

  return (
    typeof preference.hudVisible === 'boolean' &&
    typeof preference.inspectorOpen === 'boolean' &&
    typeof preference.antialias === 'boolean' &&
    typeof targetFramerateIndex === 'number' &&
    Number.isInteger(targetFramerateIndex) &&
    targetFramerateIndex >= 0 &&
    targetFramerateIndex <= 2 &&
    (
      preference.mobileModeEnabled === undefined ||
      typeof preference.mobileModeEnabled === 'boolean'
    )
  )
}

export function readDebugPreferences(
  storage: Storage | undefined
): DebugPreferences {
  if (!storage) {
    return { ...debugPreferenceDefaults }
  }

  try {
    const storedValue = storage.getItem(debugPreferenceKey)

    if (!storedValue) {
      return { ...debugPreferenceDefaults }
    }

    const parsedValue = JSON.parse(storedValue)

    if (!isValidPreference(parsedValue)) {
      return { ...debugPreferenceDefaults }
    }

    return {
      ...parsedValue,
      upscalingMode: isUpscalingMode(parsedValue.upscalingMode)
        ? parsedValue.upscalingMode
        : 'Off',
      mobileModeEnabled: parsedValue.mobileModeEnabled ?? false
    }
  } catch {
    return { ...debugPreferenceDefaults }
  }
}

export function writeDebugPreferences(
  storage: Storage | undefined,
  preferences: DebugPreferences
) {
  if (!storage) {
    return
  }

  try {
    storage.setItem(debugPreferenceKey, JSON.stringify(preferences))
  } catch {
    // Storage can fail in restricted browser contexts. The app should keep
    // running with in-memory state if persistence is unavailable.
  }
}

export function toggleDebugHudPreference(
  preferences: DebugPreferences,
  storage: Storage | undefined,
  toggle: () => boolean
) {
  preferences.hudVisible = toggle()
  writeDebugPreferences(storage, preferences)

  return preferences.hudVisible
}

export function setMobileModePreference(
  preferences: DebugPreferences,
  storage: Storage | undefined,
  enabled: boolean
) {
  const upscalingMode = preferences.upscalingMode
  Object.assign(preferences, debugPreferenceDefaults)
  preferences.upscalingMode = upscalingMode

  if (enabled) {
    preferences.hudVisible = false
    preferences.antialias = false
    preferences.mobileModeEnabled = true
  }

  writeDebugPreferences(storage, preferences)
}

export function resetDebugPreferences(storage: Storage | undefined) {
  if (!storage) {
    return
  }

  try {
    storage.removeItem(debugPreferenceKey)
  } catch {
    // Ignore storage failures for the same reason as writes.
  }
}
