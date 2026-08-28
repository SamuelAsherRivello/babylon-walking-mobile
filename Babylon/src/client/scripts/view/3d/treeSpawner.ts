import {
  LoadAssetContainerAsync,
  TransformNode,
  type AbstractMesh,
  type Node,
  type Scene,
  type ShadowGenerator,
  type Vector3
} from '@babylonjs/core'

export const treeCatalog = {
  'maple-4': 'assets/models/tree/MapleTree_4.gltf'
} as const

export type TreeType = keyof typeof treeCatalog

export type TreePlacement = {
  position: Vector3
  type: TreeType
}

type TreeSource = {
  instantiateModelsToScene: (
    nameFunction?: (sourceName: string) => string
  ) => {
    rootNodes: Node[]
  }
}

export type TreeAssetLoader = (
  source: string,
  scene: Scene
) => Promise<TreeSource>

export type TreeInstance = {
  meshes: AbstractMesh[]
  root: TransformNode
  type: TreeType
}

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`
}

export class TreeSpawner {
  private readonly sources = new Map<TreeType, Promise<TreeSource>>()
  private nextInstanceId = 0

  constructor(
    private readonly scene: Scene,
    private readonly baseUrl: string,
    private readonly shadowGenerator: ShadowGenerator,
    private readonly loadAsset: TreeAssetLoader = LoadAssetContainerAsync
  ) {}

  async addTree(placement: TreePlacement): Promise<TreeInstance> {
    const source = await this.loadSource(placement.type)
    const instanceId = this.nextInstanceId
    this.nextInstanceId += 1
    const entries = source.instantiateModelsToScene(
      sourceName => `${sourceName}-${instanceId}`
    )
    const root = new TransformNode(
      `Tree-${placement.type}-${instanceId}`,
      this.scene
    )

    for (const rootNode of entries.rootNodes) {
      if (rootNode instanceof TransformNode) {
        rootNode.parent = root
      }
    }

    root.position.copyFrom(placement.position)
    const meshes = root.getChildMeshes(false).filter(
      mesh => mesh.getTotalVertices() > 0
    )

    this.alignWithContactPosition(root, meshes, placement.position.y)

    for (const mesh of meshes) {
      this.shadowGenerator.addShadowCaster(mesh, false)
    }

    return {
      meshes,
      root,
      type: placement.type
    }
  }

  private loadSource(type: TreeType): Promise<TreeSource> {
    const cachedSource = this.sources.get(type)

    if (cachedSource) {
      return cachedSource
    }

    const sourceUrl = `${normalizeBaseUrl(this.baseUrl)}${treeCatalog[type]}`
    const source = this.loadAsset(sourceUrl, this.scene)
    this.sources.set(type, source)

    return source
  }

  private alignWithContactPosition(
    root: TransformNode,
    meshes: AbstractMesh[],
    contactY: number
  ) {
    root.computeWorldMatrix(true)

    for (const mesh of meshes) {
      mesh.computeWorldMatrix(true)
    }

    const minimumY = Math.min(
      ...meshes.map(mesh => mesh.getBoundingInfo()
        .boundingBox.minimumWorld.y)
    )

    if (!Number.isFinite(minimumY)) {
      throw new Error('A tree asset must contain at least one rendered mesh')
    }

    root.position.y += contactY - minimumY
    root.computeWorldMatrix(true)

    for (const mesh of meshes) {
      mesh.computeWorldMatrix(true)
    }
  }
}
