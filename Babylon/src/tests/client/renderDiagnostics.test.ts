import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const debugHudSource = readFileSync(
  fileURLToPath(
    new URL('../../client/scripts/view/2d/debugHud.ts', import.meta.url),
  ),
  'utf8',
)

const bootstrapSource = readFileSync(
  fileURLToPath(
    new URL('../../client/scripts/controller/index.ts', import.meta.url),
  ),
  'utf8',
)

describe('render diagnostics', () => {
  it('shows backend, resolutions, scale, target, and measured FPS', () => {
    expect(debugHudSource).toContain('Type = ${renderingType}')
    expect(debugHudSource).toContain(
      'Total Rez = ${displayResolution}'
    )
    expect(debugHudSource).toContain(
      'Render Rez = ${renderResolution}'
    )
    expect(debugHudSource).toContain('Upscaling = ${upscalingMode}')
    expect(debugHudSource).toContain('FPS = ${fps}/${targetFPS}')
    expect(debugHudSource).toContain('setRenderingResolution(')
    expect(debugHudSource).toContain('setTargetFPS(targetFPS: number)')
    expect(debugHudSource).toContain('setFPS(fps: number)')
  })

  it('uses the selected engine result for diagnostics', () => {
    expect(bootstrapSource).toContain('createRenderingEngine')
    expect(bootstrapSource).toContain('renderingType')
    expect(bootstrapSource).toContain('new DebugHud(')
  })
})
