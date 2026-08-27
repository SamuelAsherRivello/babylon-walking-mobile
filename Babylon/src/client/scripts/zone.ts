import {
  Color3,
  LinesMesh,
  Mesh,
  MeshBuilder,
  Observable,
  Scene,
  StandardMaterial,
  TransformNode,
  Vector3
} from '@babylonjs/core'
import {
  AdvancedDynamicTexture,
  TextBlock
} from '@babylonjs/gui'

export type ZoneOptions = {
  id: string
  title: string
  position: Vector3
  size_x?: number
  size_z?: number
  titleSide?: ZoneTitleSide
  titleScale?: number
  backgroundColorDefault?: Color3
  backgroundColorConfirmation?: Color3
  backgroundColorNegation?: Color3
  isEnabled?: boolean
  isTriggerable?: boolean
}

export type ZoneTitleSide = 'side-1' | 'side-2'

export const zoneBackgroundColorDefault = new Color3(0.12, 0.18, 0.08)
export const zoneBackgroundColorConfirmation = new Color3(0.08, 0.72, 0.14)
export const zoneBackgroundColorNegation = new Color3(0.78, 0.08, 0.08)
export const zoneIdleColor = zoneBackgroundColorDefault
export const zoneOccupiedColor = zoneBackgroundColorConfirmation

const fillHeight = 0.01
const borderHeight = 0.02
const titleHeight = 0.025
const fillAlpha = 0.42
const titleDepth = 0.55
const titleGap = 0.15
const approvedTitleSize = 2
const borderColor = new Color3(0.62, 0.72, 0.18)

function requireText(value: string, name: string): string {
  const normalized = value.trim()

  if (!normalized) {
    throw new Error(`${name} must not be empty`)
  }

  return normalized
}

function requireDimension(value: number, name: string): number {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${name} must be a positive number`)
  }

  return value
}

function requirePosition(position: Vector3): Vector3 {
  const coordinates = [position.x, position.y, position.z]

  if (coordinates.some(value => !Number.isFinite(value))) {
    throw new RangeError('position coordinates must be finite')
  }

  return position.clone()
}

function requireColor(color: Color3, name: string): Color3 {
  const channels = [color.r, color.g, color.b]

  if (channels.some(value => !Number.isFinite(value))) {
    throw new RangeError(`${name} channels must be finite`)
  }

  return color.clone()
}

function createBorderSegments(
  scene: Scene,
  id: string,
  width: number,
  depth: number,
  parent: TransformNode
): LinesMesh[] {
  const halfWidth = width / 2
  const halfDepth = depth / 2
  const corners = [
    new Vector3(-halfWidth, borderHeight, -halfDepth),
    new Vector3(halfWidth, borderHeight, -halfDepth),
    new Vector3(halfWidth, borderHeight, halfDepth),
    new Vector3(-halfWidth, borderHeight, halfDepth)
  ]

  return corners.map((start, index) => {
    const end = corners[(index + 1) % corners.length]
    const segment = MeshBuilder.CreateDashedLines(
      `${id}-zone-border-${index}`,
      {
        points: [start, end],
        dashSize: 0.18,
        gapSize: 0.12
      },
      scene
    )

    segment.parent = parent
    segment.color.copyFrom(borderColor)
    segment.alpha = 0.9
    segment.isPickable = false
    segment.receiveShadows = false

    return segment
  })
}

function createTitle(
  scene: Scene,
  id: string,
  title: string,
  width: number,
  depth: number,
  titleSide: ZoneTitleSide,
  titleScale: number,
  parent: TransformNode
) {
  const visualScale = titleScale * approvedTitleSize
  const scaledTitleDepth = titleDepth * visualScale
  const titleWidth = Math.max(
    1.4,
    title.length * 0.36
  ) * visualScale
  const isSideTwo = titleSide === 'side-2'
  const titleMesh = MeshBuilder.CreateGround(
    `${id}-zone-title`,
    {
      width: titleWidth,
      height: scaledTitleDepth,
      subdivisions: 1
    },
    scene
  )
  titleMesh.parent = parent
  titleMesh.position.set(
    isSideTwo
      ? width / 2 + scaledTitleDepth / 2 + titleGap
      : 0,
    titleHeight,
    isSideTwo
      ? 0
      : depth / 2 + scaledTitleDepth / 2 + titleGap
  )
  titleMesh.rotation.y = isSideTwo
    ? -Math.PI / 2
    : 0
  titleMesh.isPickable = false
  titleMesh.receiveShadows = false

  const text = new TextBlock(`${id}-zone-title-text`, title)
  text.color = Color3.Black().toHexString()
  text.fontSize = 72 * visualScale
  text.fontWeight = '700'
  let texture: AdvancedDynamicTexture | null = null

  if (
    typeof document !== 'undefined' ||
    typeof OffscreenCanvas !== 'undefined'
  ) {
    texture = AdvancedDynamicTexture.CreateForMesh(
      titleMesh,
      Math.round(512 * visualScale),
      Math.round(128 * visualScale),
      false
    )
    texture.addControl(text)
  }

  return {
    mesh: titleMesh,
    text,
    texture
  }
}

export class WorldZone {
  public readonly onEnteredObservable = new Observable<WorldZone>()
  public readonly onExitedObservable = new Observable<WorldZone>()
  public isPlayerInside = false

  public constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly size_x: number,
    public readonly size_z: number,
    public isEnabled: boolean,
    public isTriggerable: boolean,
    public readonly backgroundColorDefault: Color3,
    public readonly backgroundColorConfirmation: Color3,
    public readonly backgroundColorNegation: Color3,
    public readonly root: TransformNode,
    public readonly fill: Mesh,
    public readonly fillMaterial: StandardMaterial,
    public readonly borderSegments: LinesMesh[],
    public readonly titleMesh: Mesh,
    public readonly titleText: TextBlock,
    private readonly titleTexture: AdvancedDynamicTexture | null
  ) {}

  public contains(position: Vector3): boolean {
    const offsetX = Math.abs(position.x - this.root.position.x)
    const offsetZ = Math.abs(position.z - this.root.position.z)

    return offsetX <= this.size_x / 2 && offsetZ <= this.size_z / 2
  }

  public update(playerPosition: Vector3): void {
    if (!this.isEnabled) {
      this.isPlayerInside = false
      this.applyBackground(this.backgroundColorDefault)
      return
    }

    const nextState = this.contains(playerPosition)
    const stateChanged = nextState !== this.isPlayerInside
    this.isPlayerInside = nextState
    const nextColor = this.getBackgroundColor(nextState)
    this.applyBackground(nextColor)

    if (!stateChanged) {
      return
    }

    if (nextState) {
      this.onEnteredObservable.notifyObservers(this)
    } else {
      this.onExitedObservable.notifyObservers(this)
    }
  }

  private getBackgroundColor(isInside: boolean): Color3 {
    if (!isInside) {
      return this.backgroundColorDefault
    }

    return this.isTriggerable
      ? this.backgroundColorConfirmation
      : this.backgroundColorNegation
  }

  private applyBackground(color: Color3): void {
    this.fillMaterial.diffuseColor.copyFrom(color)
    this.fillMaterial.emissiveColor.copyFrom(color)
    this.fillMaterial.alpha = fillAlpha
  }

  public dispose(): void {
    this.onEnteredObservable.clear()
    this.onExitedObservable.clear()
    this.titleTexture?.dispose()
    this.fillMaterial.dispose()
    this.root.dispose()
  }
}

export function createZone(
  scene: Scene,
  options: ZoneOptions
): WorldZone {
  const id = requireText(options.id, 'id')
  const title = requireText(options.title, 'title')
  const size_x = requireDimension(options.size_x ?? 3, 'size_x')
  const size_z = requireDimension(options.size_z ?? 3, 'size_z')
  const titleScale = requireDimension(
    options.titleScale ?? 1,
    'titleScale'
  )
  const titleSide = options.titleSide ?? 'side-1'
  const position = requirePosition(options.position)
  const backgroundColorDefault = requireColor(
    options.backgroundColorDefault ?? zoneBackgroundColorDefault,
    'backgroundColorDefault'
  )
  const backgroundColorConfirmation = requireColor(
    options.backgroundColorConfirmation ?? zoneBackgroundColorConfirmation,
    'backgroundColorConfirmation'
  )
  const backgroundColorNegation = requireColor(
    options.backgroundColorNegation ?? zoneBackgroundColorNegation,
    'backgroundColorNegation'
  )
  const isEnabled = options.isEnabled ?? true
  const isTriggerable = options.isTriggerable ?? true
  const root = new TransformNode(`${id}-zone`, scene)
  root.position.copyFrom(position)

  const fill = MeshBuilder.CreateGround(
    `${id}-zone-fill`,
    { width: size_x, height: size_z, subdivisions: 1 },
    scene
  )
  fill.parent = root
  fill.position.y = fillHeight
  fill.isPickable = false
  fill.receiveShadows = false

  const fillMaterial = new StandardMaterial(
    `${id}-zone-fill-material`,
    scene
  )
  fillMaterial.diffuseColor.copyFrom(backgroundColorDefault)
  fillMaterial.emissiveColor.copyFrom(backgroundColorDefault)
  fillMaterial.specularColor.copyFrom(Color3.Black())
  fillMaterial.alpha = fillAlpha
  fillMaterial.disableLighting = true
  fillMaterial.backFaceCulling = false
  fill.material = fillMaterial

  const borderSegments = createBorderSegments(
    scene,
    id,
    size_x,
    size_z,
    root
  )
  const titleResult = createTitle(
    scene,
    id,
    title,
    size_x,
    size_z,
    titleSide,
    titleScale,
    root
  )

  return new WorldZone(
    id,
    title,
    size_x,
    size_z,
    isEnabled,
    isTriggerable,
    backgroundColorDefault,
    backgroundColorConfirmation,
    backgroundColorNegation,
    root,
    fill,
    fillMaterial,
    borderSegments,
    titleResult.mesh,
    titleResult.text,
    titleResult.texture
  )
}
