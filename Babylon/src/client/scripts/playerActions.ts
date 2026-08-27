import {
  Color3,
  MeshBuilder,
  StandardMaterial,
  Vector3,
  type AbstractMesh,
  type Scene,
  type TransformNode
} from '@babylonjs/core'

export const playerJumpDuration = 0.6
export const playerJumpHeight = 1.5
export const playerShotLifetime = 3
export const playerShotSpeed = 8

const playerShotDiameter = 0.5
const playerShotSpawnOffset = 0.9

type ActiveShot = {
  direction: Vector3
  elapsedSeconds: number
  mesh: AbstractMesh
}

export class PlayerActionController {
  private readonly shotMaterial: StandardMaterial
  private readonly shots: ActiveShot[] = []
  private jumpElapsedSeconds: number | null = null
  private jumpGroundY = 0
  private nextShotId = 0
  private disposed = false

  public constructor(
    private readonly scene: Scene,
    private readonly player: TransformNode
  ) {
    this.jumpGroundY = player.position.y
    this.shotMaterial = new StandardMaterial(
      'PlayerShotMaterial',
      scene
    )
    this.shotMaterial.diffuseColor = new Color3(1, 0.76, 0.25)
    this.shotMaterial.emissiveColor = new Color3(0.35, 0.18, 0.03)
    this.shotMaterial.specularColor = Color3.Black()
  }

  public get isJumping(): boolean {
    return this.jumpElapsedSeconds !== null
  }

  public get shotCount(): number {
    return this.shots.length
  }

  public jump(): void {
    if (this.disposed || this.isJumping) {
      return
    }

    this.jumpGroundY = this.player.position.y
    this.jumpElapsedSeconds = 0
  }

  public shoot(): void {
    if (this.disposed) {
      return
    }

    this.player.computeWorldMatrix(true)
    const direction = this.player
      .getDirection(Vector3.Forward())
    direction.y = 0

    if (direction.lengthSquared() === 0) {
      direction.copyFromFloats(0, 0, 1)
    } else {
      direction.normalize()
    }

    const mesh = MeshBuilder.CreateSphere(
      `PlayerShot${this.nextShotId}`,
      { diameter: playerShotDiameter, segments: 16 },
      this.scene
    )
    this.nextShotId += 1
    mesh.position.copyFrom(this.player.getAbsolutePosition())
    mesh.position.addInPlace(direction.scale(playerShotSpawnOffset))
    mesh.material = this.shotMaterial
    this.shots.push({
      direction,
      elapsedSeconds: 0,
      mesh
    })
  }

  public update(deltaSeconds: number): void {
    if (this.disposed) {
      return
    }

    const safeDeltaSeconds = Math.max(0, deltaSeconds)
    this.updateJump(safeDeltaSeconds)
    this.updateShots(safeDeltaSeconds)
  }

  public reset(groundY = this.player.position.y): void {
    if (this.disposed) {
      return
    }

    this.jumpElapsedSeconds = null
    this.jumpGroundY = groundY
    this.player.position.y = groundY
    this.clearShots()
  }

  public dispose(): void {
    if (this.disposed) {
      return
    }

    this.disposed = true
    this.jumpElapsedSeconds = null
    this.clearShots()
    this.shotMaterial.dispose()
  }

  private updateJump(deltaSeconds: number): void {
    if (this.jumpElapsedSeconds === null) {
      return
    }

    const elapsedSeconds = Math.min(
      this.jumpElapsedSeconds + deltaSeconds,
      playerJumpDuration
    )
    const progress = elapsedSeconds / playerJumpDuration
    const jumpOffset = 4 * playerJumpHeight * progress * (1 - progress)
    this.jumpElapsedSeconds = elapsedSeconds
    this.player.position.y = this.jumpGroundY + jumpOffset

    if (elapsedSeconds >= playerJumpDuration) {
      this.player.position.y = this.jumpGroundY
      this.jumpElapsedSeconds = null
    }
  }

  private updateShots(deltaSeconds: number): void {
    for (let index = this.shots.length - 1; index >= 0; index -= 1) {
      const shot = this.shots[index]
      const remainingLifetime = Math.max(
        0,
        playerShotLifetime - shot.elapsedSeconds
      )
      const travelSeconds = Math.min(deltaSeconds, remainingLifetime)
      shot.mesh.position.addInPlace(
        shot.direction.scale(playerShotSpeed * travelSeconds)
      )
      shot.elapsedSeconds += deltaSeconds

      if (shot.elapsedSeconds >= playerShotLifetime) {
        shot.mesh.dispose()
        this.shots.splice(index, 1)
      }
    }
  }

  private clearShots(): void {
    for (const shot of this.shots) {
      shot.mesh.dispose()
    }

    this.shots.length = 0
  }
}
