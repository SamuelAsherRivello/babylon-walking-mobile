type AudioFactory = (url: string) => HTMLAudioElement
type PlaybackWarning = (message: string, error: unknown) => void

const createBrowserAudio: AudioFactory = url => new Audio(url)
const warnAboutPlayback: PlaybackWarning = (message, error) => {
  console.warn(message, error)
}

function clampVolume(volume: number) {
  return Math.min(1, Math.max(0, volume))
}

export class SoundManager {
  private readonly effects = new Map<string, HTMLAudioElement>()
  private music: HTMLAudioElement | undefined
  private musicNeedsRetry = false

  public constructor(
    private readonly createAudio: AudioFactory = createBrowserAudio,
    private readonly warn: PlaybackWarning = warnAboutPlayback
  ) {}

  public startMusic(url: string, volume: number) {
    const music = this.createAudio(url)
    music.preload = 'auto'
    music.loop = true
    music.volume = clampVolume(volume)
    this.music = music
    this.musicNeedsRetry = true
    this.tryPlayMusic()
  }

  public resumeMusic() {
    this.tryPlayMusic()
  }

  public playEffect(url: string, volume: number): void {
    const instance = this.createEffectInstance(url, volume)
    instance.addEventListener('ended', () => {
      instance.remove()
    }, { once: true })

    void instance.play().catch(error => {
      this.warn(`[SoundManager] Unable to play effect "${url}".`, error)
    })
  }

  public playEffectAndWait(
    url: string,
    volume: number,
    maximumWaitMs = 1500
  ): Promise<void> {
    const instance = this.createEffectInstance(url, volume)

    return new Promise(resolve => {
      let completed = false
      const finish = () => {
        if (completed) {
          return
        }

        completed = true
        clearTimeout(timeout)
        instance.removeEventListener('ended', finish)
        instance.removeEventListener('error', finish)
        instance.remove()
        resolve()
      }
      const timeout = setTimeout(
        finish,
        Number.isFinite(maximumWaitMs)
          ? Math.max(0, maximumWaitMs)
          : 1500
      )
      instance.addEventListener('ended', finish, { once: true })
      instance.addEventListener('error', finish, { once: true })
      void instance.play().catch(error => {
        this.warn(
          `[SoundManager] Unable to play effect "${url}".`,
          error
        )
        finish()
      })
    })
  }

  private createEffectInstance(
    url: string,
    volume: number
  ): HTMLAudioElement {
    const template = this.getEffect(url)
    const instance = template.cloneNode(true) as HTMLAudioElement
    instance.currentTime = 0
    instance.loop = false
    instance.volume = clampVolume(volume)

    return instance
  }

  private getEffect(url: string) {
    let effect = this.effects.get(url)

    if (!effect) {
      effect = this.createAudio(url)
      effect.preload = 'auto'
      this.effects.set(url, effect)
    }

    return effect
  }

  private tryPlayMusic() {
    const music = this.music

    if (!music || !this.musicNeedsRetry) {
      return
    }

    void music.play().then(() => {
      if (this.music === music) {
        this.musicNeedsRetry = false
      }
    }).catch(error => {
      if (this.music === music) {
        this.musicNeedsRetry = true
      }
      this.warn('[SoundManager] Unable to play background music.', error)
    })
  }
}
