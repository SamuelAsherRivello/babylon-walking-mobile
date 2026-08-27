import {
  DirectionalLight,
  MeshBuilder,
  NullEngine,
  Scene,
  ShadowGenerator,
  TransformNode,
  Vector3
} from '@babylonjs/core'
import { afterEach, describe, expect, it } from 'vitest'
import {
  TreeSpawner,
  type TreeAssetLoader
} from '../../client/scripts/treeSpawner'

type Harness = {
  engine: NullEngine
  loadCount: () => number
  scene: Scene
  shadowGenerator: ShadowGenerator
  spawner: TreeSpawner
}

const harnesses: Harness[] = []

function createHarness(): Harness {
  const engine = new NullEngine()
  const scene = new Scene(engine)
  const light = new DirectionalLight(
    'TreeTestLight',
    new Vector3(0, -1, 0),
    scene
  )
  const shadowGenerator = new ShadowGenerator(256, light)
  let loads = 0
  const loader: TreeAssetLoader = async source => {
    loads += 1
    expect(source).toBe('/game/assets/models/tree/MapleTree_4.gltf')

    return {
      instantiateModelsToScene: () => {
        const root = new TransformNode('ImportedTreeRoot', scene)
        const treeMesh = MeshBuilder.CreateBox(
          'ImportedTreeMesh',
          { size: 2 },
          scene
        )
        treeMesh.position.y = 1.25
        treeMesh.parent = root

        return {
          animationGroups: [],
          rootNodes: [root],
          skeletons: []
        }
      }
    }
  }
  const spawner = new TreeSpawner(
    scene,
    '/game/',
    shadowGenerator,
    loader
  )
  const harness = {
    engine,
    loadCount: () => loads,
    scene,
    shadowGenerator,
    spawner
  }
  harnesses.push(harness)

  return harness
}

afterEach(() => {
  while (harnesses.length > 0) {
    const harness = harnesses.pop()
    harness?.scene.dispose()
    harness?.engine.dispose()
  }
})

describe('placeable trees', () => {
  it('aligns the rendered bottom with an arbitrary contact point', async () => {
    const { spawner } = createHarness()
    const contact = new Vector3(4, 2, -3)
    const tree = await spawner.addTree({
      position: contact,
      type: 'maple-4'
    })
    const minimumY = Math.min(
      ...tree.meshes.map(mesh => mesh.getBoundingInfo()
        .boundingBox.minimumWorld.y)
    )

    expect(tree.root.position.x).toBe(contact.x)
    expect(tree.root.position.z).toBe(contact.z)
    expect(minimumY).toBeCloseTo(contact.y)
  })

  it('caches source loading and returns independent instances', async () => {
    const { loadCount, spawner } = createHarness()
    const first = await spawner.addTree({
      position: new Vector3(1, 0, 1),
      type: 'maple-4'
    })
    const second = await spawner.addTree({
      position: new Vector3(-2, 0, -2),
      type: 'maple-4'
    })

    expect(loadCount()).toBe(1)
    expect(first.root).not.toBe(second.root)
    expect(first.root.position.asArray()).not.toEqual(
      second.root.position.asArray()
    )
  })

  it('registers every rendered tree mesh as a shadow caster', async () => {
    const { shadowGenerator, spawner } = createHarness()
    const tree = await spawner.addTree({
      position: Vector3.Zero(),
      type: 'maple-4'
    })
    const renderList = shadowGenerator.getShadowMap()?.renderList ?? []

    expect(tree.meshes).not.toHaveLength(0)
    expect(tree.meshes.every(mesh => renderList.includes(mesh))).toBe(true)
  })
})

