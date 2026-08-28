import {
  ArcRotateCamera,
  Color3,
  DirectionalLight,
  HemisphericLight,
  MeshBuilder,
  Scene,
  ShadowGenerator,
  StandardMaterial,
  Texture,
  Vector3
} from '@babylonjs/core'

const cameraPosition = new Vector3(10, 10, -10)
const lightPosition = new Vector3(40, 25.8, -10)
const groundSize = 24
const groundTextureRepeatsPerUnit = 0.5
const groundTextureScale = groundSize * groundTextureRepeatsPerUnit
const shadowMapSize = 1024

function createTextureUrl(baseUrl: string, filename: string): string {
  const normalizedBase = baseUrl.endsWith('/')
    ? baseUrl
    : `${baseUrl}/`

  return `${normalizedBase}assets/textures/${filename}`
}

function createPrototypeTexture(
  scene: Scene,
  baseUrl: string,
  filename: string
): Texture {
  return new Texture(
    createTextureUrl(baseUrl, filename),
    scene,
    false,
    true,
    Texture.NEAREST_SAMPLINGMODE
  )
}

export function createPrototypeCamera(scene: Scene): ArcRotateCamera {
  const target = Vector3.Zero()
  const radius = cameraPosition.length()
  const alpha = Math.atan2(cameraPosition.z, cameraPosition.x)
  const beta = Math.acos(cameraPosition.y / radius)
  const camera = new ArcRotateCamera(
    'camera',
    alpha,
    beta,
    radius,
    target,
    scene
  )

  camera.setPosition(cameraPosition)
  camera.setTarget(target)

  return camera
}

export function createPrototypeScene(scene: Scene, baseUrl: string) {
  const player = MeshBuilder.CreateBox(
    'Player',
    { size: 1 },
    scene
  )
  player.position.set(0, 0.5, 0)

  const ground = MeshBuilder.CreateGround(
    'Ground',
    {
      width: groundSize,
      height: groundSize,
      subdivisions: 1
    },
    scene
  )

  const playerTexture = createPrototypeTexture(
    scene,
    baseUrl,
    'player.png'
  )
  const playerMaterial = new StandardMaterial(
    'PlayerMaterial',
    scene
  )
  playerMaterial.diffuseColor = Color3.White()
  playerMaterial.specularColor = Color3.Black()
  playerMaterial.diffuseTexture = playerTexture
  player.material = playerMaterial

  const groundTexture = createPrototypeTexture(
    scene,
    baseUrl,
    'ground.png'
  )
  groundTexture.uScale = groundTextureScale
  groundTexture.vScale = groundTextureScale
  const groundMaterial = new StandardMaterial(
    'GroundMaterial',
    scene
  )
  groundMaterial.diffuseColor = Color3.White()
  groundMaterial.specularColor = Color3.Black()
  groundMaterial.diffuseTexture = groundTexture
  ground.material = groundMaterial

  const lightDirection = Vector3.Zero()
    .subtract(lightPosition)
    .normalize()
  const light = new DirectionalLight(
    'PrototypeLight',
    lightDirection,
    scene
  )
  light.position.copyFrom(lightPosition)
  light.intensity = 1.75
  light.autoCalcShadowZBounds = false
  light.shadowMinZ = 0
  light.shadowMaxZ = 100
  light.shadowOrthoScale = 4

  const ambientLight = new HemisphericLight(
    'PrototypeAmbientLight',
    Vector3.Up(),
    scene
  )
  ambientLight.intensity = 0.35

  const shadowGenerator = new ShadowGenerator(shadowMapSize, light)
  shadowGenerator.usePercentageCloserFiltering = true
  shadowGenerator.filteringQuality = ShadowGenerator.QUALITY_MEDIUM
  shadowGenerator.bias = 0.0005
  shadowGenerator.normalBias = 0.02
  shadowGenerator.addShadowCaster(player)
  ground.receiveShadows = true

  return {
    player,
    ground,
    playerMaterial,
    groundMaterial,
    playerTexture,
    groundTexture,
    light,
    ambientLight,
    shadowGenerator
  }
}
