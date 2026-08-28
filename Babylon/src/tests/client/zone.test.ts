import {
  Color3,
  NullEngine,
  Scene,
  Vector3
} from '@babylonjs/core'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  createZone,
  zoneBackgroundColorConfirmation,
  zoneBackgroundColorDefault,
  zoneBackgroundColorNegation
} from '../../client/scripts/model/zone'

describe('world zone', () => {
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

  it('creates configurable ground geometry outside the player', () => {
    const zone = createZone(scene, {
      id: 'goal',
      title: 'GOAL',
      position: new Vector3(3, 0, -2),
      size_x: 4,
      size_z: 2
    })
    const size = zone.fill.getBoundingInfo()
      .boundingBox.extendSize.scale(2)

    expect(zone.id).toBe('goal')
    expect(zone.title).toBe('GOAL')
    expect(zone.size_x).toBe(4)
    expect(zone.size_z).toBe(2)
    expect(zone.root.position.asArray()).toEqual([3, 0, -2])
    expect(size.x).toBeCloseTo(4)
    expect(size.z).toBeCloseTo(2)
    expect(zone.isPlayerInside).toBe(false)
    expect(zone.contains(new Vector3(5, 12, -1))).toBe(true)
    expect(zone.contains(new Vector3(5.01, 0, -1))).toBe(false)
  })

  it('validates identifiers, titles, and positive dimensions', () => {
    const options = {
      id: 'goal',
      title: 'GOAL',
      position: Vector3.Zero(),
      size_x: 2,
      size_z: 2
    }

    expect(() => createZone(scene, {
      ...options,
      id: ''
    })).toThrow()
    expect(() => createZone(scene, {
      ...options,
      title: ' '
    })).toThrow()
    expect(() => createZone(scene, {
      ...options,
      size_x: 0
    })).toThrow()
    expect(() => createZone(scene, {
      ...options,
      size_z: -1
    })).toThrow()
  })

  it('tracks overlapping zones independently', () => {
    const first = createZone(scene, {
      id: 'first',
      title: 'FIRST',
      position: Vector3.Zero(),
      size_x: 2,
      size_z: 2
    })
    const second = createZone(scene, {
      id: 'second',
      title: 'SECOND',
      position: new Vector3(1, 0, 0),
      size_x: 2,
      size_z: 2
    })
    const playerPosition = new Vector3(0.5, 0.5, 0)

    first.update(playerPosition, true)
    second.update(playerPosition, true)

    expect(first.isPlayerInside).toBe(true)
    expect(second.isPlayerInside).toBe(true)
  })

  it('changes fill and emits each boundary transition once', () => {
    const zone = createZone(scene, {
      id: 'goal',
      title: 'GOAL',
      position: Vector3.Zero(),
      size_x: 2,
      size_z: 2
    })
    const transitions: string[] = []

    zone.onEnteredObservable.add(() => transitions.push('enter'))
    zone.onExitedObservable.add(() => transitions.push('exit'))

    expect(zone.isEnabled).toBe(true)
    expect(zone.isTriggerable).toBe(true)
    expect(zone.fillMaterial.diffuseColor).toEqual(
      zoneBackgroundColorDefault
    )

    zone.update(new Vector3(0, 0.5, 0), true)
    zone.update(new Vector3(0.25, 0.5, 0.25), true)

    expect(zone.fillMaterial.diffuseColor).toEqual(
      zoneBackgroundColorConfirmation
    )
    expect(zoneBackgroundColorConfirmation.g).toBeGreaterThan(0.6)
    expect(zone.fillMaterial.alpha).toBeCloseTo(0.42)
    expect(transitions).toEqual(['enter'])

    zone.update(new Vector3(2, 0.5, 0), true)
    zone.update(new Vector3(3, 0.5, 0), true)

    expect(zone.fillMaterial.diffuseColor).toEqual(
      zoneBackgroundColorDefault
    )
    expect(zone.fillMaterial.alpha).toBeCloseTo(0.42)
    expect(transitions).toEqual(['enter', 'exit'])
  })

  it('waits for landing before entering or exiting', () => {
    const zone = createZone(scene, {
      id: 'goal',
      title: 'GOAL',
      position: Vector3.Zero(),
      size_x: 2,
      size_z: 2
    })
    const transitions: string[] = []

    zone.onEnteredObservable.add(() => transitions.push('enter'))
    zone.onExitedObservable.add(() => transitions.push('exit'))

    zone.update(Vector3.Zero(), false)
    expect(zone.isPlayerInside).toBe(false)
    expect(transitions).toEqual([])

    zone.update(Vector3.Zero(), true)
    expect(zone.isPlayerInside).toBe(true)
    expect(transitions).toEqual(['enter'])

    zone.update(Vector3.Zero(), false)
    zone.update(new Vector3(2, 1, 0), false)
    expect(zone.isPlayerInside).toBe(true)
    expect(transitions).toEqual(['enter'])

    zone.update(new Vector3(2, 0, 0), true)
    expect(zone.isPlayerInside).toBe(false)
    expect(transitions).toEqual(['enter', 'exit'])
  })

  it('creates non-diegetic elevated visuals', () => {
    const zone = createZone(scene, {
      id: 'goal',
      title: 'GOAL',
      position: Vector3.Zero(),
      size_x: 3,
      size_z: 3,
      titleSide: 'side-2'
    })
    const titleSize = zone.titleMesh.getBoundingInfo()
      .boundingBox.extendSize.scale(2)

    expect(zone.fill.position.y).toBeGreaterThan(0)
    expect(zone.fillMaterial.alpha).toBeGreaterThan(0)
    expect(zone.fillMaterial.alpha).toBeLessThan(1)
    expect(zone.fillMaterial.disableLighting).toBe(true)
    expect(zone.fill.isPickable).toBe(false)
    expect(zone.fill.receiveShadows).toBe(false)
    expect(zone.borderSegments).toHaveLength(4)
    expect(zone.borderSegments.every(segment => {
      return !segment.isPickable && !segment.receiveShadows
    })).toBe(true)
    expect(zone.titleMesh.isPickable).toBe(false)
    expect(zone.titleMesh.position.x).toBeGreaterThan(1.5)
    expect(zone.titleMesh.position.z).toBe(0)
    expect(zone.titleMesh.rotation.y).toBeCloseTo(-Math.PI / 2)
    expect(titleSize.x).toBeCloseTo(2.88)
    expect(titleSize.z).toBeCloseTo(1.1)
    expect(zone.titleText.text).toBe('GOAL')
    expect(zone.titleText.fontSize).toBe('144px')
    expect(zone.titleText.color).toBe(Color3.Black().toHexString())
  })

  it('uses configurable background colors for zone states', () => {
    const backgroundColorDefault = new Color3(0.1, 0.2, 0.3)
    const backgroundColorConfirmation = new Color3(0.2, 0.7, 0.3)
    const backgroundColorNegation = new Color3(0.8, 0.1, 0.2)
    const zone = createZone(scene, {
      id: 'custom',
      title: 'CUSTOM',
      position: Vector3.Zero(),
      size_x: 2,
      size_z: 2,
      backgroundColorDefault,
      backgroundColorConfirmation,
      backgroundColorNegation
    })

    expect(zone.backgroundColorDefault).toEqual(backgroundColorDefault)
    expect(zone.backgroundColorConfirmation).toEqual(
      backgroundColorConfirmation
    )
    expect(zone.backgroundColorNegation).toEqual(backgroundColorNegation)
    expect(zone.fillMaterial.diffuseColor).toEqual(
      backgroundColorDefault
    )

    zone.update(Vector3.Zero(), true)

    expect(zone.fillMaterial.diffuseColor).toEqual(
      backgroundColorConfirmation
    )
  })

  it('shows negation when enabled but not triggerable', () => {
    const zone = createZone(scene, {
      id: 'blocked',
      title: 'BLOCKED',
      position: Vector3.Zero(),
      size_x: 2,
      size_z: 2,
      isEnabled: true,
      isTriggerable: false
    })
    const transitions: string[] = []
    zone.onEnteredObservable.add(() => transitions.push('enter'))

    zone.update(Vector3.Zero(), true)

    expect(zone.isPlayerInside).toBe(true)
    expect(zone.fillMaterial.diffuseColor).toEqual(
      zoneBackgroundColorNegation
    )
    expect(zone.fillMaterial.alpha).toBeCloseTo(0.42)
    expect(transitions).toEqual(['enter'])
  })

  it('ignores boundary crossings while disabled', () => {
    const zone = createZone(scene, {
      id: 'disabled',
      title: 'DISABLED',
      position: Vector3.Zero(),
      size_x: 2,
      size_z: 2,
      isEnabled: false
    })
    const transitions: string[] = []
    zone.onEnteredObservable.add(() => transitions.push('enter'))
    zone.onExitedObservable.add(() => transitions.push('exit'))

    zone.update(Vector3.Zero(), true)
    zone.update(new Vector3(4, 0, 4), true)

    expect(zone.isPlayerInside).toBe(false)
    expect(zone.fillMaterial.diffuseColor).toEqual(
      zoneBackgroundColorDefault
    )
    expect(transitions).toEqual([])
  })

  it('defaults both zone dimensions to three', () => {
    const zone = createZone(scene, {
      id: 'default-size',
      title: 'DEFAULT',
      position: Vector3.Zero()
    })
    const size = zone.fill.getBoundingInfo()
      .boundingBox.extendSize.scale(2)

    expect(zone.size_x).toBe(3)
    expect(zone.size_z).toBe(3)
    expect(size.x).toBeCloseTo(3)
    expect(size.z).toBeCloseTo(3)
    expect(zone.contains(new Vector3(1.5, 0, 1.5))).toBe(true)
    expect(zone.contains(new Vector3(1.51, 0, 0))).toBe(false)
  })
})
