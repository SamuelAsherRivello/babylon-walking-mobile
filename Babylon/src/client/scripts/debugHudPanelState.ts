// debugHudPanelState.ts - Persists each debug HUD panel collapse value.

export type DebugHudPanelId =
  | 'config'
  | 'rendering'
  | 'pc-input'
  | 'mobile-input'
  | 'runtime-input'

export type DebugHudPanelState = Record<DebugHudPanelId, boolean>

export const debugHudPanelDefaults: DebugHudPanelState = {
  config: false,
  rendering: false,
  'pc-input': false,
  'mobile-input': false,
  'runtime-input': false
}

const debugHudPanelStateKey = 'babylon.debugHudPanels.v1'

function isDebugHudPanelState(
  value: unknown
): value is DebugHudPanelState {
  if (!value || typeof value !== 'object') {
    return false
  }

  const state = value as Partial<DebugHudPanelState>

  return Object.keys(debugHudPanelDefaults).every(key => (
    typeof state[key as DebugHudPanelId] === 'boolean'
  ))
}

export function readDebugHudPanelState(
  storage: Storage | undefined
): DebugHudPanelState {
  if (!storage) {
    return { ...debugHudPanelDefaults }
  }

  try {
    const storedValue = storage.getItem(debugHudPanelStateKey)

    if (!storedValue) {
      return { ...debugHudPanelDefaults }
    }

    const parsedValue: unknown = JSON.parse(storedValue)

    return isDebugHudPanelState(parsedValue)
      ? parsedValue
      : { ...debugHudPanelDefaults }
  } catch {
    return { ...debugHudPanelDefaults }
  }
}

export function writeDebugHudPanelCollapsed(
  storage: Storage | undefined,
  panelId: DebugHudPanelId,
  isCollapsed: boolean
) {
  if (!storage) {
    return
  }

  try {
    const state = readDebugHudPanelState(storage)
    state[panelId] = isCollapsed
    storage.setItem(debugHudPanelStateKey, JSON.stringify(state))
  } catch {
    // Storage can fail in restricted browser contexts. Keep running with the
    // current in-memory panel state when persistence is unavailable.
  }
}
