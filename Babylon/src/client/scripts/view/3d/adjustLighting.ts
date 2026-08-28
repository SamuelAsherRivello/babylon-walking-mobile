import {
  HemisphericLight,
  PointLight,
  type Scene
} from '@babylonjs/core'

const pointLightScale = 0.5
const ambientLightScale = 1.1

export function adjustLighting(scene: Scene) {
  for (const light of scene.lights) {
    if (light instanceof PointLight) {
      light.intensity *= pointLightScale
    }

    if (light instanceof HemisphericLight) {
      light.intensity *= ambientLightScale
    }
  }

  scene.environmentIntensity *= ambientLightScale
  scene.ambientColor = scene.ambientColor.scale(ambientLightScale)
}
