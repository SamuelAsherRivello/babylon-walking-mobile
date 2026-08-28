import { describe, expect, it } from 'vitest'
import {
  debugHudPanelDefaults,
  readDebugHudPanelState,
  writeDebugHudPanelCollapsed
} from '../../client/scripts/model/debugHudPanelState'

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

describe('debug HUD panel state', () => {
  it('defaults all five panels to expanded', () => {
    expect(readDebugHudPanelState(new MemoryStorage())).toEqual(
      debugHudPanelDefaults
    )
  })

  it('persists each panel collapse value independently', () => {
    const storage = new MemoryStorage()

    writeDebugHudPanelCollapsed(storage, 'config', true)
    writeDebugHudPanelCollapsed(storage, 'runtime-input', true)

    expect(readDebugHudPanelState(storage)).toEqual({
      ...debugHudPanelDefaults,
      config: true,
      'runtime-input': true
    })
  })

  it('falls back safely when stored panel state is invalid', () => {
    const storage = new MemoryStorage()
    storage.setItem('babylon.debugHudPanels.v1', '{"config":"bad"}')

    expect(readDebugHudPanelState(storage)).toEqual(
      debugHudPanelDefaults
    )
  })
})
