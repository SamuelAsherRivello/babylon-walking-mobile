import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const readStyles = () => readFileSync(
  resolve('src/client/styles/index.css'),
  'utf8'
)

const readClientSource = () => readFileSync(
  resolve('src/client/scripts/index.ts'),
  'utf8'
)

const readPage = () => readFileSync(
  resolve('index.html'),
  'utf8'
)

describe('portrait game viewport', () => {
  it('uses a centered, full-height 9:16 frame that cannot shrink', () => {
    const styles = readStyles()

    expect(styles).toContain('display: flex;')
    expect(styles).toContain('justify-content: center;')
    expect(styles).toContain('overflow: hidden;')
    expect(styles).toMatch(
      /html,\s*body\s*\{[^}]*overflow: hidden;/s
    )
    expect(styles).toContain('background: #111827;')
    expect(styles).toContain('height: 100vh;')
    expect(styles).toContain('height: 100dvh;')
    expect(styles).toContain('aspect-ratio: 9 / 16;')
    expect(styles).toContain('flex-shrink: 0;')
  })

  it('keeps temporary overlays anchored to the browser viewport', () => {
    const styles = readStyles()

    expect(styles).toMatch(
      /\.info-overlay\s*\{[^}]*position: absolute;/s
    )
    expect(styles).toMatch(
      /#CornerUI\s*\{[^}]*position: fixed;/s
    )
  })

  it('keeps the WebGL notice below the upper-left HUD', () => {
    const styles = readStyles()

    expect(styles).toMatch(
      /[.]info-overlay\s*\{[^}]*top: calc\([^;]+165px\s*\);/s
    )
  })

  it('anchors the game frame independently of Inspector layout', () => {
    const styles = readStyles()
    const source = readClientSource()

    expect(styles).toMatch(
      /canvas\s*\{[^}]*position: fixed;/s
    )
    expect(styles).toMatch(/canvas\s*\{[^}]*left: 50%;/s)
    expect(styles).toMatch(
      /canvas\s*\{[^}]*transform: translateX\(-50%\);/s
    )
    expect(source).not.toContain("canvas.style.position = 'relative'")
  })

  it('resizes Babylon when the displayed canvas size changes', () => {
    const source = readClientSource()

    expect(source).toContain(
      'const resizeObserver = new ResizeObserver(handleResize)'
    )
    expect(source).toContain('resizeObserver.observe(canvas)')
  })

  it('extends mobile content into drawable display cutouts', () => {
    const page = readPage()

    expect(page).toContain('viewport-fit=cover')
  })

  it('tracks and disposes visual-viewport changes', () => {
    const source = readClientSource()

    expect(source).toContain(
      "visualViewport?.addEventListener('resize', handleResize)"
    )
    expect(source).toContain(
      "visualViewport?.addEventListener('scroll', handleResize)"
    )
    expect(source).toContain(
      "visualViewport?.removeEventListener('resize', handleResize)"
    )
    expect(source).toContain(
      "visualViewport?.removeEventListener('scroll', handleResize)"
    )
  })
})
