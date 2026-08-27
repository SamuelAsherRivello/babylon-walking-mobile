import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('fullscreen target', () => {
  it('uses the page root so overlays stay visible in fullscreen', () => {
    const source = readFileSync(
      resolve('src/client/scripts/index.ts'),
      'utf8'
    )

    expect(source).toContain('document.documentElement.requestFullscreen()')
    expect(source).not.toContain('canvas.requestFullscreen()')
  })

  it('restores saved mobile fullscreen during startup', () => {
    const source = readFileSync(
      resolve('src/client/scripts/index.ts'),
      'utf8'
    )

    expect(source).toContain(
      'if (debugPreferences.mobileModeEnabled) {'
    )
    expect(source).toContain('void restoreMobileFullscreen()')
    expect(source).toContain(
      "window.addEventListener('pointerdown', requestFullscreen, {"
    )
  })
})
