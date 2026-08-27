import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('custom resolution display', () => {
  it('updates when Babylon changes the render size', () => {
    const source = readFileSync(
      resolve('src/client/scripts/index.ts'),
      'utf8'
    )

    expect(source).toContain('synchronizeRenderResolution()')
    expect(source).toContain('renderResolutionController.synchronize(')
    expect(source).toContain('debugHud.setRenderingResolution(')
    expect(source).toContain('updateProductionUiLayout()')
    expect(source).toContain('readProductionUiViewport(')
  })
})
