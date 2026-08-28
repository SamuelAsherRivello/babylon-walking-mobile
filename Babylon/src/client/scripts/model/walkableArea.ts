import {
  type AbstractMesh,
  type LinesMesh,
  type Scene,
  type TransformNode,
  type Vector3
} from '@babylonjs/core'
import {
  createGroundAreaVisual,
  type GroundAreaVisual
} from '../view/3d/groundAreaVisual'

export type WalkableAreaOptions = {
  id: string
  player: AbstractMesh
  position: Vector3
  size_x: number
  size_z: number
}

function getGroundFootprintClearance(player: AbstractMesh): number {
  player.computeWorldMatrix(true)
  const bounds = player.getBoundingInfo().boundingBox

  return Math.hypot(bounds.extendSizeWorld.x, bounds.extendSizeWorld.z)
}

export class WalkableArea {
  public readonly playerClearance: number
  private readonly maximumOffsetX: number
  private readonly maximumOffsetZ: number

  public constructor(
    public readonly visual: GroundAreaVisual,
    private readonly player: AbstractMesh
  ) {
    this.playerClearance = getGroundFootprintClearance(player)
    this.maximumOffsetX = visual.size_x / 2 - this.playerClearance
    this.maximumOffsetZ = visual.size_z / 2 - this.playerClearance

    if (this.maximumOffsetX < 0 || this.maximumOffsetZ < 0) {
      visual.dispose()
      throw new RangeError('walkable area is smaller than the Player')
    }
  }

  public get size_x(): number {
    return this.visual.size_x
  }

  public get size_z(): number {
    return this.visual.size_z
  }

  public get root(): TransformNode {
    return this.visual.root
  }

  public get borderSegments(): LinesMesh[] {
    return this.visual.borderSegments
  }

  public contains(position: Vector3): boolean {
    const offsetX = Math.abs(position.x - this.root.position.x)
    const offsetZ = Math.abs(position.z - this.root.position.z)

    return offsetX <= this.size_x / 2 && offsetZ <= this.size_z / 2
  }

  public constrainPlayer(): void {
    const minimumX = this.root.position.x - this.maximumOffsetX
    const maximumX = this.root.position.x + this.maximumOffsetX
    const minimumZ = this.root.position.z - this.maximumOffsetZ
    const maximumZ = this.root.position.z + this.maximumOffsetZ

    this.player.position.x = Math.min(
      Math.max(this.player.position.x, minimumX),
      maximumX
    )
    this.player.position.z = Math.min(
      Math.max(this.player.position.z, minimumZ),
      maximumZ
    )
  }

  public dispose(): void {
    this.visual.dispose()
  }
}

export function createWalkableArea(
  scene: Scene,
  options: WalkableAreaOptions
): WalkableArea {
  const visual = createGroundAreaVisual(scene, {
    id: options.id,
    position: options.position,
    size_x: options.size_x,
    size_z: options.size_z
  })

  return new WalkableArea(visual, options.player)
}
