import {
  MeshBuilder,
  NullEngine,
  Scene,
  TransformNode
} from '@babylonjs/core'
import { afterEach, describe, expect, it } from 'vitest'
import {
  createGameWorld,
  levelDefinitions
} from '../../client/scripts/level'
import type {
  TreeAssetLoader
} from '../../client/scripts/treeSpawner'

const engines: NullEngine[] = []
const scenes: Scene[] = []

afterEach(() => {
  while (scenes.length > 0) {
    scenes.pop()?.dispose()
  }

  while (engines.length > 0) {
    engines.pop()?.dispose()
  }
})

describe('shared game world', () => {
  it('defines one inventory slot per required apple', () => {
    expect(levelDefinitions).toHaveLength(3)

    levelDefinitions.forEach((definition, index) => {
      const levelNumber = index + 1

      expect(definition.playerSpawn).toEqual({ x: 0, y: 0.5, z: 0 })
      expect(definition.quests).toHaveLength(1)
      expect(definition.quests[0]?.inventorySlotCount).toBe(levelNumber)
      expect(definition.zones.map(zone => zone.title)).toEqual([
        'START',
        'Apple'
      ])
    })
  })

  it('defines a disabled cosmetic START zone at the origin', () => {
    const start = levelDefinitions[0]?.zones[0]

    expect(start).toMatchObject({
      id: 'start',
      isEnabled: false,
      position: { x: 0, y: 0, z: 0 },
      size_x: 3,
      size_z: 3,
      title: 'START'
    })
    expect(start?.model).toBeUndefined()
  })

  it('maps the tree only to the Apple zone at X -6 and Z 7', () => {
    const apple = levelDefinitions[0]?.zones[1]

    expect(apple).toMatchObject({
      id: 'apple',
      position: { x: -6, y: 0, z: 7 },
      size_x: 3,
      size_z: 3,
      title: 'Apple'
    })
    expect(apple?.model).toEqual({
      kind: 'tree',
      type: 'maple-4'
    })
  })

  it('composes the shared runtime world from its definition', async () => {
    const engine = new NullEngine()
    const scene = new Scene(engine)
    engines.push(engine)
    scenes.push(scene)
    const loader: TreeAssetLoader = async () => ({
      instantiateModelsToScene: () => {
        const root = new TransformNode('TreeSource', scene)
        const mesh = MeshBuilder.CreateBox(
          'TreeMesh',
          { size: 1 },
          scene
        )
        mesh.parent = root

        return { rootNodes: [root] }
      }
    })
    const runtime = await createGameWorld(scene, '/game/', {
      treeAssetLoader: loader
    })

    expect(runtime.prototype.player.position.asArray()).toEqual([0, 0.5, 0])
    expect(runtime.tree.type).toBe('maple-4')
    expect(runtime.tree.root.parent).toBe(runtime.appleZone.root)
    expect(runtime.tree.root.position.x).toBe(0)
    expect(runtime.tree.root.position.z).toBe(0)
    expect(runtime.tree.root.getAbsolutePosition().x).toBe(-6)
    expect(runtime.tree.root.getAbsolutePosition().z).toBe(7)
    expect(runtime.startZone.title).toBe('START')
    expect(runtime.startZone.isEnabled).toBe(false)
    expect(runtime.appleZone.title).toBe('Apple')
    expect(runtime.walkableArea.size_x).toBe(20)
    expect(runtime.walkableArea.size_z).toBe(20)
    expect(runtime.walkableArea.visual.fill).toBeNull()
    expect(runtime.walkableArea.contains(
      runtime.prototype.player.position
    )).toBe(true)
    expect(runtime.walkableArea.contains(
      runtime.startZone.root.position
    )).toBe(true)
    expect(runtime.walkableArea.contains(
      runtime.appleZone.root.position
    )).toBe(true)
    expect(runtime.walkableArea.contains(
      runtime.tree.root.position
    )).toBe(true)
    expect(runtime.zones).toEqual([
      runtime.startZone,
      runtime.appleZone
    ])
  })
})
