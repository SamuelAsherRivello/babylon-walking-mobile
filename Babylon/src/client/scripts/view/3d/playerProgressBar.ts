import {
  MeshBuilder,
  TransformNode,
  type AbstractMesh,
  type Scene
} from '@babylonjs/core'
import {
  AdvancedDynamicTexture,
  Control,
  Ellipse
} from '@babylonjs/gui'

export type PlayerProgressBarOptions = {
  backgroundColor: string
  endValue: number
  progressColor: string
  startValue: number
}

export class PlayerProgressBar {
  private static readonly HIDE_DELAY_SECONDS = 0.5
  private static readonly FADE_SECONDS = 0.1
  private readonly root: AbstractMesh
  private readonly texture: AdvancedDynamicTexture
  private readonly background: Ellipse
  private readonly progress: Ellipse
  private readonly options: PlayerProgressBarOptions
  private readonly fadeObserver: { remove: () => void }
  private opacity = 0
  private targetOpacity = 0
  private hideDelaySeconds = 0
  private visibilityRequested = false

  public constructor(
    scene: Scene,
    player: TransformNode,
    options: PlayerProgressBarOptions
  ) {
    this.options = options
    this.root = MeshBuilder.CreatePlane(
      'player-progress-bar',
      { size: 1 },
      scene
    )
    this.root.parent = player
    this.root.position.y = 1.5
    this.root.billboardMode = TransformNode.BILLBOARDMODE_ALL
    this.texture = AdvancedDynamicTexture.CreateForMesh(
      this.root,
      256,
      256
    )
    this.background = this.createEllipse(
      'player-progress-bar-background',
      options.backgroundColor
    )
    this.progress = this.createEllipse(
      'player-progress-bar-progress',
      options.progressColor
    )
    this.texture.addControl(this.background)
    this.texture.addControl(this.progress)
    this.setValue(options.startValue)
    this.root.isVisible = false
    this.fadeObserver = scene.onBeforeRenderObservable.add(() => {
      const deltaSeconds = scene.getEngine().getDeltaTime() / 1000
      if (this.hideDelaySeconds > 0) {
        this.hideDelaySeconds = Math.max(
          0,
          this.hideDelaySeconds - deltaSeconds
        )
        if (this.hideDelaySeconds === 0) {
          this.targetOpacity = 0
        }
      }
      const step = deltaSeconds / PlayerProgressBar.FADE_SECONDS
      const difference = this.targetOpacity - this.opacity
      this.opacity += Math.sign(difference) * Math.min(
        Math.abs(difference),
        step
      )
      this.background.alpha = this.opacity
      this.progress.alpha = this.opacity
      if (this.targetOpacity === 0 && this.opacity === 0) {
        this.root.isVisible = false
      }
    })
  }

  public setValue(value: number): void {
    const range = this.options.endValue - this.options.startValue
    const normalized = Math.max(
      0,
      Math.min(1, (value - this.options.startValue) / range)
    )
    this.progress.arc = normalized
  }

  public setVisible(isVisible: boolean): void {
    if (isVisible === this.visibilityRequested) {
      return
    }
    this.visibilityRequested = isVisible
    this.hideDelaySeconds = isVisible
      ? 0
      : PlayerProgressBar.HIDE_DELAY_SECONDS
    if (isVisible) {
      this.targetOpacity = 1
    }
    this.root.isVisible = true
  }

  public dispose(): void {
    this.fadeObserver.remove()
    this.texture.dispose()
    this.root.dispose()
  }

  private createEllipse(name: string, color: string): Ellipse {
    const ellipse = new Ellipse(name)
    ellipse.width = '82%'
    ellipse.height = '82%'
    ellipse.color = color
    ellipse.thickness = 14
    ellipse.background = 'transparent'
    ellipse.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER
    ellipse.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER
    ellipse.isHitTestVisible = false
    return ellipse
  }
}
