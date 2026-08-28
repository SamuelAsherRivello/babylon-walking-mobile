import { describe, expect, it } from 'vitest'
import {
  AppleCollectionQuest
} from '../../client/scripts/model/appleCollectionQuest'

describe('apple collection quest', () => {
  it('starts empty and incomplete', () => {
    const quest = new AppleCollectionQuest(5)

    expect(quest.appleCount).toBe(0)
    expect(quest.isComplete).toBe(false)
  })

  it('awards one apple for each accepted zone entry', () => {
    const quest = new AppleCollectionQuest(5)

    expect(quest.collectApple()).toEqual({
      accepted: true,
      appleCount: 1,
      justCompleted: false
    })
    expect(quest.collectApple()).toEqual({
      accepted: true,
      appleCount: 2,
      justCompleted: false
    })
  })

  it('completes on the fifth apple and latches completion', () => {
    const quest = new AppleCollectionQuest(5)

    for (let count = 1; count < 5; count += 1) {
      expect(quest.collectApple().justCompleted).toBe(false)
    }

    expect(quest.collectApple()).toEqual({
      accepted: true,
      appleCount: 5,
      justCompleted: true
    })
    expect(quest.isComplete).toBe(true)
    expect(quest.collectApple()).toEqual({
      accepted: false,
      appleCount: 5,
      justCompleted: false
    })
  })
})
