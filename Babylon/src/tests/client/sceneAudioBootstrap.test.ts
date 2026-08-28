import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const readClientSource = () => readFileSync(
  resolve('src/client/scripts/controller/index.ts'),
  'utf8'
)

describe('scene audio bootstrap', () => {
  it('keeps the selected music configured but temporarily disabled', () => {
    const source = readClientSource()

    expect(source).toContain("import { SoundManager } from '../view/3d/soundManager'")
    expect(source).toContain('assets/audio/music/invincible.ogg')
    expect(source).toContain('const backgroundMusicEnabled = false')
    expect(source).toContain('const backgroundMusicVolume = 0.15')
    expect(source).toContain('if (backgroundMusicEnabled) {')
    expect(source).toContain('soundManager.startMusic(')
  })

  it('declares independent world and runtime UI click sounds', () => {
    const source = readClientSource()

    expect(source).toContain('const worldClickSoundUrl =')
    expect(source).toContain('const runtimeUiClickSoundUrl =')
    expect(source.match(/assets\/audio\/sfx\/rotate\.wav/g)).toHaveLength(2)
    expect(source).toContain('const clickSoundVolume = 0.35')
    expect(source).toContain('onClick: () => {')
    expect(source).toContain('soundManager.resumeMusic()')
    expect(source).toContain(
      'soundManager.playEffect(worldClickSoundUrl, clickSoundVolume)'
    )
    expect(source).not.toContain('Pop01.mp3')
  })

  it('plays quest beginning and accepted-apple update sounds', () => {
    const source = readClientSource()

    expect(source).toContain(
      'progression.activeQuestDefinition.beginningSound'
    )
    expect(source).toContain(
      'progression.activeQuestDefinition.updateSound'
    )
    expect(source).toContain('soundManager.playEffect(questBeginningSoundUrl')
    expect(source).toContain('soundManager.playEffect(questUpdateSoundUrl')
  })

  it('finishes the runtime UI click before reloading', () => {
    const source = readClientSource()
    const click = source.indexOf(
      'await soundManager.playEffectAndWait('
    )
    const reload = source.indexOf('window.location.reload()', click)

    expect(click).toBeGreaterThan(-1)
    expect(source.slice(click, reload)).toContain('runtimeUiClickSoundUrl')
    expect(reload).toBeGreaterThan(click)
  })
})
