import { Vector3, type Scene } from '@babylonjs/core'
import {
  AppleCollectionQuest,
  type AppleCollectionResult
} from './appleCollectionQuest'
import { createPrototypeScene } from './prototypeScene'
import {
  TreeSpawner,
  type TreeAssetLoader,
  type TreeInstance,
  type TreeType
} from './treeSpawner'
import {
  createZone,
  type WorldZone,
  type ZoneTitleSide
} from './zone'

export type LevelPosition = {
  x: number
  y: number
  z: number
}

export type LevelZoneModelDefinition = {
  kind: 'tree'
  type: TreeType
}

export type LevelZoneDefinition = {
  id: string
  isEnabled: boolean
  isTriggerable: boolean
  position: LevelPosition
  size_x: number
  size_z: number
  title: string
  titleScale: number
  titleSide: ZoneTitleSide
  model?: LevelZoneModelDefinition
}

export type LevelQuestDefinition = {
  appleZoneId: string
  beginningSound: string
  id: string
  inventorySlotCount: number
  name: string
  targetAppleCount: number
  updateSound: string
}

export type LevelDefinition = {
  id: string
  name: string
  playerSpawn: LevelPosition
  quests: readonly LevelQuestDefinition[]
  zones: readonly LevelZoneDefinition[]
}

export type GameWorldDependencies = {
  treeAssetLoader?: TreeAssetLoader
}

export type GameWorld = {
  appleZone: WorldZone
  prototype: ReturnType<typeof createPrototypeScene>
  startZone: WorldZone
  tree: TreeInstance
  trees: TreeInstance[]
  zones: WorldZone[]
}

const playerSpawn: LevelPosition = { x: 0, y: 0.5, z: 0 }

const sharedZoneDefinitions: readonly LevelZoneDefinition[] = [
  {
    id: 'start',
    isEnabled: false,
    isTriggerable: false,
    position: { x: 0, y: 0, z: 0 },
    size_x: 3,
    size_z: 3,
    title: 'START',
    titleScale: 1,
    titleSide: 'side-2'
  },
  {
    id: 'apple',
    isEnabled: true,
    isTriggerable: true,
    position: { x: 0, y: 0, z: 7 },
    size_x: 3,
    size_z: 3,
    title: 'Apple',
    titleScale: 1,
    titleSide: 'side-2',
    model: {
      kind: 'tree',
      type: 'maple-4'
    }
  }
]

function createLevelDefinition(levelNumber: number): LevelDefinition {
  return {
    id: `level-${levelNumber}`,
    name: `Level ${levelNumber}`,
    playerSpawn,
    quests: [
      {
        appleZoneId: 'apple',
        beginningSound: 'assets/audio/sfx/levelup.wav',
        id: `quest-${levelNumber}`,
        inventorySlotCount: 3,
        name: `Quest ${levelNumber}`,
        targetAppleCount: levelNumber,
        updateSound: 'assets/audio/sfx/clear.wav'
      }
    ],
    zones: sharedZoneDefinitions
  }
}

export const levelDefinitions: readonly LevelDefinition[] = [
  createLevelDefinition(1),
  createLevelDefinition(2),
  createLevelDefinition(3)
]

function getQuestDefinition(
  definition: LevelDefinition
): LevelQuestDefinition {
  const questDefinition = definition.quests[0]

  if (!questDefinition) {
    throw new Error(`${definition.name} requires one quest`)
  }

  return questDefinition
}

export class LevelProgression {
  private levelIndex = 0
  private activeQuest: AppleCollectionQuest

  public constructor(
    private readonly definitions: readonly LevelDefinition[]
  ) {
    if (definitions.length === 0) {
      throw new Error('Level progression requires at least one level')
    }

    this.activeQuest = this.createActiveQuest()
  }

  public get activeLevelDefinition(): LevelDefinition {
    const definition = this.definitions[this.levelIndex]

    if (!definition) {
      throw new Error('Active level definition is unavailable')
    }

    return definition
  }

  public get activeQuestDefinition(): LevelQuestDefinition {
    return getQuestDefinition(this.activeLevelDefinition)
  }

  public get quest(): AppleCollectionQuest {
    return this.activeQuest
  }

  public get isFinalLevel(): boolean {
    return this.levelIndex === this.definitions.length - 1
  }

  public get isGameComplete(): boolean {
    return this.isFinalLevel && this.activeQuest.isComplete
  }

  public collectApple(): AppleCollectionResult {
    return this.activeQuest.collectApple()
  }

  public advance(): boolean {
    if (!this.activeQuest.isComplete || this.isFinalLevel) {
      return false
    }

    this.levelIndex += 1
    this.activeQuest = this.createActiveQuest()

    return true
  }

  private createActiveQuest(): AppleCollectionQuest {
    return new AppleCollectionQuest(
      this.activeQuestDefinition.targetAppleCount
    )
  }
}

function toVector3(position: LevelPosition): Vector3 {
  return new Vector3(position.x, position.y, position.z)
}

function findZone(zones: WorldZone[], id: string): WorldZone {
  const zone = zones.find(candidate => candidate.id === id)

  if (!zone) {
    throw new Error(`Level zone not found: ${id}`)
  }

  return zone
}

export async function createGameWorld(
  scene: Scene,
  baseUrl: string,
  dependencies: GameWorldDependencies = {}
): Promise<GameWorld> {
  const layoutDefinition = levelDefinitions[0]

  if (!layoutDefinition) {
    throw new Error('The game world requires one level definition')
  }

  const prototype = createPrototypeScene(scene, baseUrl)
  prototype.player.position.copyFrom(
    toVector3(layoutDefinition.playerSpawn)
  )
  const treeSpawner = new TreeSpawner(
    scene,
    baseUrl,
    prototype.shadowGenerator,
    dependencies.treeAssetLoader
  )
  const zones: WorldZone[] = []
  const trees: TreeInstance[] = []

  for (const zoneDefinition of layoutDefinition.zones) {
    zones.push(createZone(scene, {
      ...zoneDefinition,
      position: toVector3(zoneDefinition.position)
    }))

    if (zoneDefinition.model?.kind === 'tree') {
      trees.push(await treeSpawner.addTree({
        position: toVector3(zoneDefinition.position),
        type: zoneDefinition.model.type
      }))
    }
  }

  const startZone = findZone(zones, 'start')
  const appleZone = findZone(zones, 'apple')
  const tree = trees[0]

  if (!tree) {
    throw new Error('The game world requires one tree')
  }

  return {
    appleZone,
    prototype,
    startZone,
    tree,
    trees,
    zones
  }
}
