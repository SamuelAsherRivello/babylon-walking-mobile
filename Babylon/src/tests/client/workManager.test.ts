import { describe, expect, it } from 'vitest'
import { WorkManager } from '../../client/scripts/model/workManager'

const appleWork = {
  endValue: 1,
  rate: 1,
  startValue: 0
}

describe('work manager', () => {
  it('advances only during active frames and resumes', () => {
    const manager = new WorkManager()

    manager.start('apple', appleWork)
    expect(manager.update('apple', 0.4, true)?.value).toBeCloseTo(0.4)
    expect(manager.update('apple', 0.4, false)?.value).toBeCloseTo(0.4)
    expect(manager.update('apple', 0.6, true)?.justCompleted).toBe(true)
  })

  it('clamps completion and does not repeat it', () => {
    const manager = new WorkManager()

    manager.start('apple', appleWork)
    expect(manager.update('apple', 2, true)).toEqual({
      completed: true,
      justCompleted: true,
      value: 1
    })
  })

  it('retains no state after a new manager is created', () => {
    const manager = new WorkManager()

    expect(manager.update('apple', 1, true)).toBeUndefined()
  })
})
