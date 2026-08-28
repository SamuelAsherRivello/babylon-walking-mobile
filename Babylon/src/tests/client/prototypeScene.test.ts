import {
  Camera,
  Color3,
  DirectionalLight,
  HemisphericLight,
  NullEngine,
  Scene,
  Vector3
} from '@babylonjs/core'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  createPrototypeCamera,
  createPrototypeScene
} from '../../client/scripts/view/3d/prototypeScene'

describe('prototype scene', () => {
  let engine: NullEngine
  let scene: Scene

  beforeEach(() => {
    engine = new NullEngine()
    scene = new Scene(engine)
  })

  afterEach(() => {
    scene.dispose()
    engine.dispose()
  })

  it('creates named Player and Ground meshes with replaceable textures', () => {
    const prototype = createPrototypeScene(scene, '/')
    const playerSize = prototype.player.getBoundingInfo()
      .boundingBox.extendSize.scale(2)
    const groundSize = prototype.ground.getBoundingInfo()
      .boundingBox.extendSize.scale(2)

    expect(prototype.player.name).toBe('Player')
    expect(prototype.player.position.asArray()).toEqual([0, 0.5, 0])
    expect(playerSize.asArray()).toEqual([1, 1, 1])
    expect(prototype.ground.name).toBe('Ground')
    expect(prototype.ground.position.asArray()).toEqual([0, 0, 0])
    expect(groundSize.x).toBeCloseTo(24)
    expect(groundSize.z).toBeCloseTo(24)
    expect(prototype.playerMaterial.name).toBe('PlayerMaterial')
    expect(prototype.groundMaterial.name).toBe('GroundMaterial')
    expect(prototype.playerMaterial).not.toBe(prototype.groundMaterial)
    expect((prototype.playerTexture.url ?? '').endsWith(
      'assets/textures/player.png'
    )).toBe(true)
    expect((prototype.groundTexture.url ?? '').endsWith(
      'assets/textures/ground.png'
    )).toBe(true)
    expect(prototype.playerMaterial.diffuseColor).toEqual(Color3.White())
    expect(prototype.groundMaterial.diffuseColor).toEqual(Color3.White())
    expect(prototype.groundTexture.uScale).toBe(12)
    expect(prototype.groundTexture.vScale).toBe(12)
  })

  it('creates the elevated diagonal perspective camera', () => {
    const camera = createPrototypeCamera(scene)

    expect(camera.mode).toBe(Camera.PERSPECTIVE_CAMERA)
    expect(camera.position.x).toBeCloseTo(10)
    expect(camera.position.y).toBeCloseTo(10)
    expect(camera.position.z).toBeCloseTo(-10)
    expect(camera.getTarget().asArray()).toEqual([0, 0, 0])
  })

  it('projects negative X toward the upper-left of the screen', () => {
    const camera = createPrototypeCamera(scene)
    const viewMatrix = camera.getViewMatrix(true)
    const origin = Vector3.TransformCoordinates(
      Vector3.Zero(),
      viewMatrix
    )
    const negativeX = Vector3.TransformCoordinates(
      new Vector3(-1, 0, 0),
      viewMatrix
    )

    expect(negativeX.x).toBeLessThan(origin.x)
    expect(negativeX.y).toBeGreaterThan(origin.y)
  })

  it('creates independent key and ambient lights with Player shadows', () => {
    const prototype = createPrototypeScene(scene, '/')
    const lightPosition = new Vector3(40, 25.8, -10)
    const expectedDirection = Vector3.Zero()
      .subtract(lightPosition)
      .normalize()
    const previousShadowSlope = 40 / 7.5
    const currentShadowSlope = Math.hypot(
      lightPosition.x,
      lightPosition.z
    ) / lightPosition.y
    const shadowMap = prototype.shadowGenerator.getShadowMap()

    expect(scene.lights).toHaveLength(2)
    expect(prototype.light).toBeInstanceOf(DirectionalLight)
    expect(prototype.ambientLight).toBeInstanceOf(HemisphericLight)
    expect(prototype.light.intensity).toBeCloseTo(1.75)
    expect(prototype.ambientLight.intensity).toBeCloseTo(0.35)
    expect(prototype.ambientLight).not.toBe(prototype.light)
    expect(prototype.light.position.asArray()).toEqual([40, 25.8, -10])
    expect(currentShadowSlope / previousShadowSlope).toBeCloseTo(0.3)
    expect(lightPosition.z).toBeLessThan(0)
    expect(prototype.light.direction.x).toBeCloseTo(expectedDirection.x)
    expect(prototype.light.direction.y).toBeCloseTo(expectedDirection.y)
    expect(prototype.light.direction.z).toBeCloseTo(expectedDirection.z)
    expect(prototype.light.autoCalcShadowZBounds).toBe(false)
    expect(prototype.light.shadowMinZ).toBe(0)
    expect(prototype.light.shadowMaxZ).toBe(100)
    expect(prototype.light.shadowOrthoScale).toBe(4)
    expect(shadowMap?.renderList).toContain(prototype.player)
    expect(prototype.ground.receiveShadows).toBe(true)
  })
})
