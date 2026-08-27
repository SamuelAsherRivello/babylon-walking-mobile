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
  it('defines three levels with the same three-slot layout', () => {
    expect(levelDefinitions).toHaveLength(3)

    for (const definition of levelDefinitions) {
      expect(definition.playerSpawn).toEqual({ x: 0, y: 0.5, z: 0 })
      expect(definition.quests).toHaveLength(1)
      expect(definition.quests[0]?.inventorySlotCount).toBe(3)
      expect(definition.zones.map(zone => zone.title)).toEqual([
        'START',
        'Apple'
      ])
    }
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

  it('maps the tree only to the Apple zone at positive Z 7', () => {
    const apple = levelDefinitions[0]?.zones[1]

    expect(apple).toMatchObject({
      id: 'apple',
      position: { x: 0, y: 0, z: 7 },
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
    expect(runtime.tree.root.position.x).toBe(
      runtime.appleZone.root.position.x
    )
    expect(runtime.tree.root.position.z).toBe(
      runtime.appleZone.root.position.z
    )
    expect(runtime.startZone.title).toBe('START')
    expect(runtime.startZone.isEnabled).toBe(false)
    expect(runtime.appleZone.title).toBe('Apple')
    expect(runtime.zones).toEqual([
      runtime.startZone,
      runtime.appleZone
    ])
  })
})
