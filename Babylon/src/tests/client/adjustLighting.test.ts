import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('adjustLighting', () => {
  it('halves point lights and raises ambient light by ten percent', () => {
    const source = readFileSync(
      resolve('src/client/scripts/view/3d/adjustLighting.ts'),
      'utf8'
    )

    expect(source).toContain('const pointLightScale = 0.5')
    expect(source).toContain('const ambientLightScale = 1.1')
    expect(source).toContain('light instanceof PointLight')
    expect(source).toContain('light instanceof HemisphericLight')
    expect(source).toContain('scene.environmentIntensity *= ambientLightScale')
  })
})
