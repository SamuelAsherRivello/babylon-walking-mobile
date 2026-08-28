import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const readClientSource = () => readFileSync(
  resolve('src/client/scripts/controller/index.ts'),
  'utf8'
)

const countMatches = (source: string, value: string) =>
  source.split(value).length - 1

describe('prototype scene bootstrap', () => {
  it('loads runtime metadata once and passes it to the production HUD', () => {
    const source = readClientSource()

    expect(source).toContain('loadReleaseMetadata')
    expect(source).toContain('await loadReleaseMetadata(')
    expect(source).toContain('import.meta.env.BASE_URL')
    expect(source).not.toContain('import.meta.env.VITE_RELEASE_VERSION')
    expect(source).toContain('releaseVersion,')
  })

  it('starts the prototype scene without the room or bouncing sphere', () => {
    const source = readClientSource()

    expect(source).toContain('const world = await createGameWorld(')
    expect(source).toContain('new LevelProgression(levelDefinitions)')
    expect(source).not.toContain('pixel_room.glb')
    expect(source).not.toContain('MeshBuilder.CreateSphere')
    expect(source).not.toContain('initPhysics(scene)')
    expect(source).not.toContain('addPhysicsImposter(')
  })

  it('connects runtime input to the prototype player and camera', () => {
    const source = readClientSource()

    expect(source).toContain('const camera = createPrototypeCamera(scene)')
    expect(source).toContain(
      'const prototype = world.prototype'
    )
    expect(source).toContain('camera.attachControl(canvas, true)')
    expect(source).toContain(
      'configureRuntimeCamera(camera, prototype.player)'
    )
    expect(source).toContain('new RuntimeInputController(')
    expect(source).toContain('runtimeInput.update(inputDeltaSeconds)')
  })

  it('uses the new runtime labels without changing fullscreen input', () => {
    const source = readClientSource()

    expect(source).toContain('runtimeInputLabels')
    expect(source).not.toContain('Left Mouse = Move Camera')
    expect(source).toContain('onFullscreen: toggleFullscreen')
  })

  it('keeps keyboard HUD input separate from three-finger mobile mode', () => {
    const source = readClientSource()

    expect(source).toContain(
      "import { ThreeFingerTapController } from './threeFingerTap'"
    )
    expect(source).toContain('const toggleDebugHud = () =>')
    expect(source).toContain(
      'new ThreeFingerTapController(window, () =>'
    )
    expect(source).toContain('void toggleMobileMode()')
    expect(source).toContain('onHud: toggleDebugHud')
  })

  it('applies both mobile-mode runtime profiles', () => {
    const source = readClientSource()
    const fullscreenIndex = source.indexOf(
      'await setMobileFullscreen(enabled)'
    )
    const inspectorIndex = source.indexOf(
      'await inputController.setInspectorOpen(false)'
    )
    const profileStart = source.indexOf(
      'const applyDebugPreferences = () =>'
    )
    const profileEnd = source.indexOf(
      'const setMobileFullscreen = async'
    )
    const profileSource = source.slice(profileStart, profileEnd)

    expect(source).toContain('const toggleMobileMode = async () =>')
    expect(source).toContain('setMobileModePreference(')
    expect(source).toContain('inputController.setInspectorOpen(false)')
    expect(source).toContain('document.documentElement.requestFullscreen()')
    expect(source).toContain('document.exitFullscreen()')
    expect(profileSource).toContain(
      'pipeline.fxaaEnabled = debugPreferences.antialias'
    )
    expect(profileSource).toContain(
      'targetFramerateIndex = debugPreferences.targetFramerateIndex'
    )
    expect(profileSource).toContain(
      'renderScheduler.setTargetFPS(targetFramerate)'
    )
    expect(profileSource).toContain(
      'debugHud.setVisible(debugPreferences.hudVisible)'
    )
    expect(fullscreenIndex).toBeGreaterThan(-1)
    expect(fullscreenIndex).toBeLessThan(inspectorIndex)
  })

  it('owns mobile controls exactly once through startup and disposal', () => {
    const source = readClientSource()

    expect(countMatches(
      source,
      'new ThreeFingerTapController('
    )).toBe(1)
    expect(countMatches(
      source,
      'productionHud.addVirtualController('
    )).toBe(1)
    expect(source).toContain('onInput: direction => {')
    expect(source).toContain(
      'runtimeInput.setPlayerAnalogInput(direction)'
    )
    expect(countMatches(source, 'threeFingerTap.dispose()')).toBe(1)
    expect(countMatches(source, 'runtimeInput.dispose()')).toBe(1)
    expect(countMatches(source, 'productionHud.dispose()')).toBe(1)
  })

  it('places a Maple Tree 4 away from the Player at startup', () => {
    const source = readClientSource()

    expect(source).toContain("import '@babylonjs/loaders/glTF'")
    expect(source).toContain('const world = await createGameWorld(')
    expect(source).toContain('const prototype = world.prototype')
  })

  it('updates the shared zones after player movement', () => {
    const source = readClientSource()
    const movementUpdate = source.indexOf(
      'runtimeInput.update(inputDeltaSeconds)'
    )
    const zoneUpdate = source.indexOf(
      'zone.update(prototype.player.position, !playerActions.isJumping)',
      movementUpdate
    )

    expect(source).toContain('const zones = world.zones')
    expect(source).not.toContain('startZone.onEnteredObservable.add(')
    expect(source).not.toContain('startZone.onExitedObservable.add(')
    expect(zoneUpdate).toBeGreaterThan(movementUpdate)
  })

  it('constrains shared movement and level spawns before zone updates', () => {
    const source = readClientSource()
    const startLevel = source.indexOf('const startActiveLevel = () =>')
    const spawn = source.indexOf(
      'prototype.player.position.set(spawn.x, spawn.y, spawn.z)',
      startLevel
    )
    const spawnConstraint = source.indexOf(
      'walkableArea.constrainPlayer()',
      spawn
    )
    const spawnZoneUpdate = source.indexOf(
      'zone.update(prototype.player.position, !playerActions.isJumping)',
      spawn
    )
    const movement = source.indexOf(
      'runtimeInput.update(inputDeltaSeconds)'
    )
    const movementConstraint = source.indexOf(
      'walkableArea.constrainPlayer()',
      movement
    )
    const movementZoneUpdate = source.indexOf(
      'zone.update(prototype.player.position, !playerActions.isJumping)',
      movement
    )

    expect(source).toContain('const walkableArea = world.walkableArea')
    expect(spawnConstraint).toBeGreaterThan(spawn)
    expect(spawnZoneUpdate).toBeGreaterThan(spawnConstraint)
    expect(movementConstraint).toBeGreaterThan(movement)
    expect(movementZoneUpdate).toBeGreaterThan(movementConstraint)
  })

  it('connects Apple entries to inventory and completion', () => {
    const source = readClientSource()

    expect(source).toContain('world.appleZone.onEnteredObservable.add(')
    expect(source).toContain('progression.collectApple()')
    expect(source).toContain('createInventorySlots(')
    expect(source).toContain('progression.quest.appleCount')
    expect(source).toContain('runtimeInput.setEnabled(false)')
    expect(source).toContain('camera.detachControl()')
    expect(source).not.toContain('blockPrimaryMouseCameraInput')
    expect(source).toContain("'Level Complete'")
    expect(source).toContain("'Next Level?'")
    expect(source).toContain("'Game Complete'")
    expect(source).toContain("'Restart Game?'")
    expect(source).toContain("label: 'OK'")
    expect(source).toContain('progression.advance()')
    expect(source).toContain('startActiveLevel()')
    expect(source).toContain('productionHud.setLevel(')
    expect(source).not.toContain('productionHud.setTitle(')
    expect(source).toContain('runtimeInput.setEnabled(true)')
    expect(source).toContain('virtualController.setEnabled(true)')
    expect(source).toContain('camera.attachControl(canvas, true)')
    expect(source).toContain('window.location.reload()')
  })

  it('updates visible inventory capacity for each active level', () => {
    const source = readClientSource()

    expect(source).toContain('const maximumInventorySlotCount = Math.max(')
    expect(source).toContain(
      'productionHud.setInventorySlotCount('
    )
    expect(source).toContain(
      'questDefinition.inventorySlotCount'
    )
  })
})
