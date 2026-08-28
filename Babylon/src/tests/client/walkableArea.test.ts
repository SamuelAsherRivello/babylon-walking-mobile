import {
  MeshBuilder,
  NullEngine,
  Scene,
  Vector3
} from '@babylonjs/core'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createWalkableArea } from '../../client/scripts/model/walkableArea'

describe('walkable area', () => {
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

  function createHarness() {
    const player = MeshBuilder.CreateBox(
      'Player',
      { size: 1 },
      scene
    )
    player.position.set(0, 0.5, 0)
    const area = createWalkableArea(scene, {
      id: 'walkable',
      player,
      position: Vector3.Zero(),
      size_x: 20,
      size_z: 20
    })

    return { area, player }
  }

  it('creates centered bounds and a border-only visual', () => {
    const { area } = createHarness()

    expect(area.root.position.asArray()).toEqual([0, 0, 0])
    expect(area.size_x).toBe(20)
    expect(area.size_z).toBe(20)
    expect(area.playerClearance).toBeCloseTo(Math.SQRT1_2)
    expect(area.visual.fill).toBeNull()
    expect(area.borderSegments).toHaveLength(4)
    expect(area.contains(Vector3.Zero())).toBe(true)
    expect(area.contains(new Vector3(10, 0, 10))).toBe(true)
    expect(area.contains(new Vector3(10.01, 0, 0))).toBe(false)
  })

  it('keeps the complete Player footprint inside a direct edge', () => {
    const { area, player } = createHarness()
    const maximumCenter = 10 - Math.SQRT1_2

    player.position.x = 20
    area.constrainPlayer()

    expect(player.position.x).toBeCloseTo(maximumCenter)
    expect(player.position.z).toBe(0)

    player.position.x += 2
    area.constrainPlayer()

    expect(player.position.x).toBeCloseTo(maximumCenter)
  })

  it('clamps each axis independently for edge sliding', () => {
    const { area, player } = createHarness()
    const maximumCenter = 10 - Math.SQRT1_2

    player.position.set(12, 0.5, 3)
    area.constrainPlayer()

    expect(player.position.x).toBeCloseTo(maximumCenter)
    expect(player.position.z).toBe(3)
  })

  it('stops in corners and permits movement back inward', () => {
    const { area, player } = createHarness()
    const maximumCenter = 10 - Math.SQRT1_2

    player.position.set(12, 0.5, -12)
    area.constrainPlayer()

    expect(player.position.x).toBeCloseTo(maximumCenter)
    expect(player.position.z).toBeCloseTo(-maximumCenter)

    player.position.x -= 1
    player.position.z += 1
    area.constrainPlayer()

    expect(player.position.x).toBeCloseTo(maximumCenter - 1)
    expect(player.position.z).toBeCloseTo(-maximumCenter + 1)
  })

  it('disposes its reusable visual resources', () => {
    const { area } = createHarness()
    const borders = [...area.borderSegments]

    area.dispose()

    expect(area.root.isDisposed()).toBe(true)
    expect(borders.every(border => border.isDisposed())).toBe(true)
  })
})
