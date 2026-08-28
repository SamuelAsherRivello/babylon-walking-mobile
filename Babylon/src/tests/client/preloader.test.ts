import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const source = readFileSync(
  resolve('src/client/scripts/view/2d/preloader.ts'),
  'utf8'
)

describe('game preloader', () => {
  it('implements Babylon custom loading screen hooks', () => {
    expect(source).toContain('loadingUI()')
    expect(source).toContain('displayLoadingUI()')
    expect(source).toContain('hideLoadingUI()')
    expect(source).toContain("root.id = 'game-preloader'")
  })

  it('keeps the overlay visible with a startup error', () => {
    expect(source).toContain('fail(message: string)')
    expect(source).toContain("root.classList.add('is-error')")
  })
})
