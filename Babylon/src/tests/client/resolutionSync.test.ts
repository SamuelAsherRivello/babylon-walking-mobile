import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('custom resolution display', () => {
  it('updates when Babylon changes the render size', () => {
    const source = readFileSync(
      resolve('src/client/scripts/index.ts'),
      'utf8'
    )

    expect(source).toContain('engine.onResizeObservable.add')
    expect(source).toContain(
      'debugHud.setResolution(getResolution(engine))'
    )
    expect(source).toContain('updateMovementJoystickLayout()')
    expect(source).toContain('readJoystickViewport(')
  })
})
