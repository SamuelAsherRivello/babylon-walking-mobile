import { describe, expect, it } from 'vitest'
import {
  LevelProgression,
  levelDefinitions
} from '../../client/scripts/level'

describe('level progression', () => {
  it('defines three ordered levels with matching apple targets', () => {
    expect(levelDefinitions.map(definition => ({
      level: definition.name,
      quest: definition.quests[0]?.name,
      target: definition.quests[0]?.targetAppleCount
    }))).toEqual([
      { level: 'Level 1', quest: 'Quest 1', target: 1 },
      { level: 'Level 2', quest: 'Quest 2', target: 2 },
      { level: 'Level 3', quest: 'Quest 3', target: 3 }
    ])
  })

  it('starts at Level 1 and blocks early advancement', () => {
    const progression = new LevelProgression(levelDefinitions)

    expect(progression.activeLevelDefinition.name).toBe('Level 1')
    expect(progression.activeQuestDefinition.name).toBe('Quest 1')
    expect(progression.quest.appleCount).toBe(0)
    expect(progression.advance()).toBe(false)
    expect(progression.activeLevelDefinition.name).toBe('Level 1')
  })

  it('advances only after each active quest completes', () => {
    const progression = new LevelProgression(levelDefinitions)

    expect(progression.collectApple().justCompleted).toBe(true)
    expect(progression.advance()).toBe(true)
    expect(progression.activeLevelDefinition.name).toBe('Level 2')
    expect(progression.quest.appleCount).toBe(0)

    expect(progression.collectApple().justCompleted).toBe(false)
    expect(progression.advance()).toBe(false)
    expect(progression.collectApple().justCompleted).toBe(true)
    expect(progression.advance()).toBe(true)
    expect(progression.activeLevelDefinition.name).toBe('Level 3')
    expect(progression.quest.appleCount).toBe(0)
  })

  it('latches final completion without advancing past Level 3', () => {
    const progression = new LevelProgression(levelDefinitions)

    progression.collectApple()
    progression.advance()
    progression.collectApple()
    progression.collectApple()
    progression.advance()
    progression.collectApple()
    progression.collectApple()

    expect(progression.collectApple().justCompleted).toBe(true)
    expect(progression.isGameComplete).toBe(true)
    expect(progression.advance()).toBe(false)
    expect(progression.activeLevelDefinition.name).toBe('Level 3')
    expect(progression.collectApple().accepted).toBe(false)
  })
})
