import {
  Color3,
  NullEngine,
  Scene,
  Vector3
} from '@babylonjs/core'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  createGroundAreaVisual,
  groundAreaBorderColor
} from '../../client/scripts/groundAreaVisual'

describe('ground-area visual', () => {
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

  it('creates an anchored border without requiring a fill', () => {
    const position = new Vector3(2, 0, -3)
    const visual = createGroundAreaVisual(scene, {
      id: 'walkable',
      position,
      size_x: 20,
      size_z: 10
    })

    position.set(8, 0, 8)

    expect(visual.root.position.asArray()).toEqual([2, 0, -3])
    expect(visual.size_x).toBe(20)
    expect(visual.size_z).toBe(10)
    expect(visual.fill).toBeNull()
    expect(visual.fillMaterial).toBeNull()
    expect(visual.borderSegments).toHaveLength(4)
    expect(visual.borderSegments.every(segment => {
      return !segment.isPickable && !segment.receiveShadows
    })).toBe(true)
    expect(visual.borderSegments.every(segment => {
      return segment.color.equals(groundAreaBorderColor)
    })).toBe(true)
  })

  it('adds a translucent non-diegetic fill when configured', () => {
    const color = new Color3(0.1, 0.2, 0.3)
    const visual = createGroundAreaVisual(scene, {
      id: 'filled',
      position: Vector3.Zero(),
      size_x: 4,
      size_z: 2,
      fill: {
        alpha: 0.42,
        color
      }
    })
    const fill = visual.fill
    const material = visual.fillMaterial
    const size = fill?.getBoundingInfo()
      .boundingBox.extendSize.scale(2)

    expect(fill).not.toBeNull()
    expect(material).not.toBeNull()
    expect(size?.x).toBeCloseTo(4)
    expect(size?.z).toBeCloseTo(2)
    expect(fill?.position.y).toBeGreaterThan(0)
    expect(fill?.isPickable).toBe(false)
    expect(fill?.receiveShadows).toBe(false)
    expect(material?.diffuseColor).toEqual(color)
    expect(material?.emissiveColor).toEqual(color)
    expect(material?.alpha).toBeCloseTo(0.42)
    expect(material?.disableLighting).toBe(true)
  })

  it('disposes every resource it owns', () => {
    const visual = createGroundAreaVisual(scene, {
      id: 'disposable',
      position: Vector3.Zero(),
      size_x: 3,
      size_z: 3,
      fill: {
        alpha: 0.5,
        color: Color3.Green()
      }
    })
    const fill = visual.fill
    const material = visual.fillMaterial
    const borders = [...visual.borderSegments]

    visual.dispose()

    expect(visual.root.isDisposed()).toBe(true)
    expect(fill?.isDisposed()).toBe(true)
    expect(scene.materials).not.toContain(material)
    expect(borders.every(border => border.isDisposed())).toBe(true)
  })
})
