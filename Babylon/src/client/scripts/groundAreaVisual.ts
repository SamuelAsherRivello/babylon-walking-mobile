import {
  Color3,
  LinesMesh,
  Mesh,
  MeshBuilder,
  StandardMaterial,
  TransformNode,
  Vector3,
  type Scene
} from '@babylonjs/core'

export type GroundAreaFillOptions = {
  alpha: number
  color: Color3
}

export type GroundAreaVisualOptions = {
  id: string
  position: Vector3
  size_x: number
  size_z: number
  fill?: GroundAreaFillOptions
}

export const groundAreaBorderColor = new Color3(0.62, 0.72, 0.18)

const fillHeight = 0.01
const borderHeight = 0.02
const borderAlpha = 0.9
const borderDashSize = 0.18
const borderGapSize = 0.12

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

function requireAlpha(alpha: number): number {
  if (!Number.isFinite(alpha) || alpha < 0 || alpha > 1) {
    throw new RangeError('fill alpha must be between zero and one')
  }

  return alpha
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
      `${id}-ground-area-border-${index}`,
      {
        points: [start, end],
        dashSize: borderDashSize,
        gapSize: borderGapSize
      },
      scene
    )

    segment.parent = parent
    segment.color.copyFrom(groundAreaBorderColor)
    segment.alpha = borderAlpha
    segment.isPickable = false
    segment.receiveShadows = false

    return segment
  })
}

function createFill(
  scene: Scene,
  id: string,
  width: number,
  depth: number,
  fillOptions: GroundAreaFillOptions,
  parent: TransformNode
): { fill: Mesh; material: StandardMaterial } {
  const color = requireColor(fillOptions.color, 'fill color')
  const alpha = requireAlpha(fillOptions.alpha)
  const fill = MeshBuilder.CreateGround(
    `${id}-ground-area-fill`,
    { width, height: depth, subdivisions: 1 },
    scene
  )
  fill.parent = parent
  fill.position.y = fillHeight
  fill.isPickable = false
  fill.receiveShadows = false

  const material = new StandardMaterial(
    `${id}-ground-area-fill-material`,
    scene
  )
  material.diffuseColor.copyFrom(color)
  material.emissiveColor.copyFrom(color)
  material.specularColor.copyFrom(Color3.Black())
  material.alpha = alpha
  material.disableLighting = true
  material.backFaceCulling = false
  fill.material = material

  return { fill, material }
}

export class GroundAreaVisual {
  public constructor(
    public readonly id: string,
    public readonly size_x: number,
    public readonly size_z: number,
    public readonly root: TransformNode,
    public readonly fill: Mesh | null,
    public readonly fillMaterial: StandardMaterial | null,
    public readonly borderSegments: LinesMesh[]
  ) {}

  public setFillColor(color: Color3, alpha?: number): void {
    if (!this.fillMaterial) {
      throw new Error('ground-area visual has no fill')
    }

    const nextColor = requireColor(color, 'fill color')
    this.fillMaterial.diffuseColor.copyFrom(nextColor)
    this.fillMaterial.emissiveColor.copyFrom(nextColor)

    if (alpha !== undefined) {
      this.fillMaterial.alpha = requireAlpha(alpha)
    }
  }

  public dispose(): void {
    this.fillMaterial?.dispose()
    this.root.dispose()
  }
}

export function createGroundAreaVisual(
  scene: Scene,
  options: GroundAreaVisualOptions
): GroundAreaVisual {
  const id = requireText(options.id, 'id')
  const size_x = requireDimension(options.size_x, 'size_x')
  const size_z = requireDimension(options.size_z, 'size_z')
  const position = requirePosition(options.position)
  const root = new TransformNode(`${id}-ground-area`, scene)
  root.position.copyFrom(position)
  const fillResult = options.fill
    ? createFill(scene, id, size_x, size_z, options.fill, root)
    : null
  const borderSegments = createBorderSegments(
    scene,
    id,
    size_x,
    size_z,
    root
  )

  return new GroundAreaVisual(
    id,
    size_x,
    size_z,
    root,
    fillResult?.fill ?? null,
    fillResult?.material ?? null,
    borderSegments
  )
}
