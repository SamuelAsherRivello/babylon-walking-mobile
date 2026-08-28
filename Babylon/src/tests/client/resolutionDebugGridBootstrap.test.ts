import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const source = readFileSync(
  resolve('src/client/scripts/index.ts'),
  'utf8'
)

describe('resolution debug grid bootstrap', () => {
  it('owns one grid through every runtime lifecycle path', () => {
    expect(source).toContain(
      "import { ResolutionDebugGrid } from './resolutionDebugGrid'"
    )
    expect(source.split('new ResolutionDebugGrid()')).toHaveLength(2)
    expect(source).toContain(
      'resolutionGrid.setResolution(snapshot.displayResolution)'
    )
    expect(source).toContain('resolutionGrid.setLayout({')
    expect(source).toContain('onGrid: () => resolutionGrid.toggle()')
    expect(source).toContain('resolutionGrid.setVisible(false)')
    expect(source).toContain('resolutionGrid.dispose()')
  })
})
