import { describe, expect, it, vi } from 'vitest'
import { SoundManager } from '../../client/scripts/view/3d/soundManager'

class FakeAudio extends EventTarget {
  public currentTime = 0
  public loop = false
  public preload = ''
  public volume = 1
  public readonly play = vi.fn<() => Promise<void>>()
  public readonly remove = vi.fn()
  public readonly clones: FakeAudio[] = []

  public constructor(public readonly src: string) {
    super()
    this.play.mockResolvedValue()
  }

  public cloneNode() {
    const clone = new FakeAudio(this.src)
    this.clones.push(clone)

    return clone
  }
}

const flushPlayback = async () => {
  await Promise.resolve()
  await Promise.resolve()
}

describe('SoundManager', () => {
  it('starts configured looping music', async () => {
    const music = new FakeAudio('/music.ogg')
    const createAudio = vi.fn(() => music)
    const manager = new SoundManager(
      createAudio as unknown as (url: string) => HTMLAudioElement
    )

    manager.startMusic('/music.ogg', 0.15)
    await flushPlayback()

    expect(createAudio).toHaveBeenCalledWith('/music.ogg')
    expect(music.preload).toBe('auto')
    expect(music.loop).toBe(true)
    expect(music.volume).toBe(0.15)
    expect(music.play).toHaveBeenCalledOnce()
  })

  it('retries blocked music once and leaves successful music playing',
    async () => {
      const music = new FakeAudio('/music.ogg')
      music.play.mockRejectedValueOnce(new Error('autoplay blocked'))
      const manager = new SoundManager(
        () => music as unknown as HTMLAudioElement,
        vi.fn()
      )

      manager.startMusic('/music.ogg', 0.15)
      await flushPlayback()
      manager.resumeMusic()
      await flushPlayback()
      manager.resumeMusic()

      expect(music.play).toHaveBeenCalledTimes(2)
    })

  it('plays overlapping effect clones at the configured volume', () => {
    const effect = new FakeAudio('/click.wav')
    const manager = new SoundManager(
      () => effect as unknown as HTMLAudioElement
    )

    manager.playEffect('/click.wav', 0.35)
    manager.playEffect('/click.wav', 0.35)

    expect(effect.clones).toHaveLength(2)
    for (const clone of effect.clones) {
      expect(clone.loop).toBe(false)
      expect(clone.volume).toBe(0.35)
      expect(clone.play).toHaveBeenCalledOnce()
    }
  })

  it('reports rejected effects without throwing', async () => {
    const effect = new FakeAudio('/click.wav')
    const warn = vi.fn()
    vi.spyOn(effect, 'cloneNode').mockImplementation(() => {
      const clone = new FakeAudio(effect.src)
      clone.play.mockRejectedValueOnce(new Error('blocked'))
      effect.clones.push(clone)

      return clone
    })
    const manager = new SoundManager(
      () => effect as unknown as HTMLAudioElement,
      warn
    )

    manager.playEffect('/click.wav', 0.35)
    await flushPlayback()

    expect(warn).toHaveBeenCalledOnce()
  })

  it('waits for an effect to end before resolving', async () => {
    const effect = new FakeAudio('/click.wav')
    const manager = new SoundManager(
      () => effect as unknown as HTMLAudioElement
    )

    const completion = manager.playEffectAndWait('/click.wav', 0.35)
    const clone = effect.clones[0]
    let completed = false
    void completion.then(() => {
      completed = true
    })
    await flushPlayback()

    expect(completed).toBe(false)
    clone?.dispatchEvent(new Event('ended'))
    await completion
    expect(completed).toBe(true)
  })

  it('uses a bounded fallback when an effect never ends', async () => {
    vi.useFakeTimers()
    const effect = new FakeAudio('/click.wav')
    const manager = new SoundManager(
      () => effect as unknown as HTMLAudioElement
    )

    const completion = manager.playEffectAndWait('/click.wav', 0.35, 500)
    await vi.advanceTimersByTimeAsync(500)
    await expect(completion).resolves.toBeUndefined()
    vi.useRealTimers()
  })
})
