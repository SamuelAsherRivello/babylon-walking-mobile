import {
  Mesh,
  MeshBuilder,
  NullEngine,
  Scene
} from '@babylonjs/core'
import { afterEach, describe, expect, it } from 'vitest'
import {
  PlayerActionController,
  playerJumpDuration,
  playerJumpHeight,
  playerShotLifetime
} from '../../client/scripts/playerActions'

type Harness = {
  actions: PlayerActionController
  engine: NullEngine
  player: Mesh
  scene: Scene
}
const harnesses: Harness[] = []

function createHarness(): Harness {
  const engine = new NullEngine()
  const scene = new Scene(engine)
  const player = MeshBuilder.CreateBox(
    'Player',
    { size: 1 },
    scene
  )
  player.position.set(0, 0.5, 0)
  const actions = new PlayerActionController(scene, player)
  const harness = { actions, engine, player, scene }
  harnesses.push(harness)

  return harness
}

function advance(
  actions: PlayerActionController,
  totalSeconds: number,
  stepSeconds: number
): void {
  let remaining = totalSeconds

  while (remaining > 0) {
    const step = Math.min(stepSeconds, remaining)
    actions.update(step)
    remaining -= step
  }
}

afterEach(() => {
  while (harnesses.length > 0) {
    const harness = harnesses.pop()
    harness?.actions.dispose()
    harness?.scene.dispose()
    harness?.engine.dispose()
  }
})

describe('player jump action', () => {
  it('runs one non-stacking arc and restores exact ground height', () => {
    const { actions, player } = createHarness()
    const groundY = player.position.y

    actions.jump()
    actions.update(playerJumpDuration / 2)
    expect(player.position.y).toBeCloseTo(groundY + playerJumpHeight)

    actions.jump()
    actions.update(playerJumpDuration / 2)
    expect(actions.isJumping).toBe(false)
    expect(player.position.y).toBe(groundY)
  })

  it('is frame-rate independent', () => {
    const thirty = createHarness()
    const sixty = createHarness()
    thirty.actions.jump()
    sixty.actions.jump()

    advance(thirty.actions, playerJumpDuration / 2, 1 / 30)
    advance(sixty.actions, playerJumpDuration / 2, 1 / 60)

    expect(thirty.player.position.y).toBeCloseTo(
      sixty.player.position.y
    )
    expect(thirty.player.position.y).toBeCloseTo(
      0.5 + playerJumpHeight
    )
  })

  it('resets active action state to the supplied ground height', () => {
    const { actions, player } = createHarness()
    actions.jump()
    actions.update(0.1)
    actions.shoot()

    actions.reset(1.25)

    expect(actions.isJumping).toBe(false)
    expect(actions.shotCount).toBe(0)
    expect(player.position.y).toBe(1.25)
  })
})

describe('player shoot action', () => {
  it('shoots along player facing independently from camera state', () => {
    const { actions, player, scene } = createHarness()
    player.rotation.y = Math.PI / 2
    actions.shoot()
    const shot = scene.getMeshByName('PlayerShot0')

    expect(shot).not.toBeNull()
    expect(shot?.position.x).toBeGreaterThan(player.position.x)
    const startZ = shot?.position.z ?? 0
    actions.update(0.25)
    expect(shot?.position.x).toBeGreaterThan(player.position.x)
    expect(shot?.position.z).toBeCloseTo(startZ)
  })

  it('keeps the direction captured when the player later turns', () => {
    const { actions, player, scene } = createHarness()
    actions.shoot()
    const shot = scene.getMeshByName('PlayerShot0')
    const startX = shot?.position.x ?? 0
    const startZ = shot?.position.z ?? 0

    player.rotation.y = Math.PI / 2
    actions.update(0.25)

    expect(shot?.position.x).toBeCloseTo(startX)
    expect(shot?.position.z).toBeGreaterThan(startZ)
  })

  it('expires shots at three seconds with independent lifetimes', () => {
    const { actions, player, scene } = createHarness()
    actions.shoot()
    const first = scene.getMeshByName('PlayerShot0')
    actions.update(1)
    player.rotation.y = Math.PI / 2
    actions.shoot()
    const second = scene.getMeshByName('PlayerShot1')

    actions.update(playerShotLifetime - 1)

    expect(first?.isDisposed()).toBe(true)
    expect(second?.isDisposed()).toBe(false)
    expect(actions.shotCount).toBe(1)

    actions.update(1)
    expect(second?.isDisposed()).toBe(true)
    expect(actions.shotCount).toBe(0)
  })

  it('disposes active meshes and its shared material', () => {
    const { actions, scene } = createHarness()
    actions.shoot()
    const shot = scene.getMeshByName('PlayerShot0')
    const material = scene.getMaterialByName('PlayerShotMaterial')
    expect(material).not.toBeNull()

    actions.dispose()

    expect(shot?.isDisposed()).toBe(true)
    expect(scene.getMaterialByName('PlayerShotMaterial')).toBeNull()
  })
})
