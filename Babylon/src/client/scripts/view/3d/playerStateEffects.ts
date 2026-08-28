import {
  Color3,
  StandardMaterial,
  type Scene
} from '@babylonjs/core'
import type { WorkManager } from '../../model/workManager'

const blinkDurationSeconds = 0.05
const updateBlinkIntervalSeconds = 0.1

export class PlayerStateEffects {
  private readonly originalColor: Color3
  private readonly black = Color3.Black()
  private readonly white = Color3.White()
  private restoreInSeconds = 0
  private updateBlinkInSeconds = 0
  private readonly observer: { remove: () => void }

  public constructor(
    scene: Scene,
    private readonly material: StandardMaterial,
    workManager: WorkManager
  ) {
    this.originalColor = material.diffuseColor.clone()
    workManager.onStartObservable.add(() => {
      this.updateBlinkInSeconds = updateBlinkIntervalSeconds
    })
    workManager.onUpdateObservable.add(() => {
      if (this.updateBlinkInSeconds <= 0) {
        this.blink(this.white)
        this.updateBlinkInSeconds = updateBlinkIntervalSeconds
      }
    })
    workManager.onCompleteObservable.add(() => {
      this.blink(this.black)
      this.updateBlinkInSeconds = updateBlinkIntervalSeconds
    })
    this.observer = scene.onBeforeRenderObservable.add(() => {
      this.restoreInSeconds -= scene.getEngine().getDeltaTime() / 1000
      this.updateBlinkInSeconds -= scene.getEngine().getDeltaTime() / 1000
      if (this.restoreInSeconds <= 0) {
        this.material.diffuseColor.copyFrom(this.originalColor)
      }
    })
  }

  public dispose(): void {
    this.observer.remove()
    this.material.diffuseColor.copyFrom(this.originalColor)
  }

  private blink(color: Color3): void {
    this.material.diffuseColor.copyFrom(color)
    this.restoreInSeconds = blinkDurationSeconds
  }

}
