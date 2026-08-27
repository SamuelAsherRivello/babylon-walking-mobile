import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const readSource = (name: string) => readFileSync(
  resolve(`src/client/scripts/${name}`),
  'utf8'
)

describe('HUD ownership', () => {
  it('keeps debug operations on a dedicated class', () => {
    const source = readSource('debugHud.ts')

    expect(source).toContain('export class DebugHud')
    expect(source).toContain('public toggle()')
    expect(source).toContain('public setVisible(')
    expect(source).toContain('public setShortcuts(')
    expect(source).toContain('public setConfig()')
    expect(source).toContain('public setRenderingResolution(')
    expect(source).toContain('public setFPS(')
    expect(source).toContain('public setTargetFPS(')
    expect(source).toContain("'Debug Input (PC)'")
    expect(source).toContain("'Debug Input (Mobile)'")
  })

  it('does not expose debug visibility through production UI', () => {
    const source = readSource('productionHud.ts')

    expect(source).toContain('export class ProductionHud')
    expect(source).not.toContain('public toggle()')
    expect(source).not.toContain('public setVisible(')
  })

  it('integrates both owners independently', () => {
    const source = readSource('index.ts')

    expect(source).toContain("import { DebugHud } from './debugHud'")
    expect(source).toContain(
      "import { ProductionHud } from './productionHud'"
    )
    expect(source).toContain('debugHud.toggle()')
    expect(source).not.toContain('productionHud.toggle()')
  })
})
