import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('debug reset input', () => {
  it('resets debug preferences without restarting the scene', () => {
    const source = readFileSync(
      resolve('src/client/scripts/controller/index.ts'),
      'utf8'
    )
    const resetBlock = source.slice(
      source.indexOf('onResetDefaults'),
      source.indexOf('initialInspectorOpen')
    )

    expect(resetBlock).toContain('resetDebugPreferences(storage)')
    expect(resetBlock).toContain('debugPreferenceDefaults')
    expect(resetBlock).toContain('debugHud.setShortcuts')
    expect(resetBlock).not.toContain('window.location.reload()')
  })
})
