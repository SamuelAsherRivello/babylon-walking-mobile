import { describe, expect, it } from 'vitest'
import { WorkManager } from '../../client/scripts/model/workManager'

describe('work manager events', () => {
  it('emits start, update, and complete in order', () => {
    const manager = new WorkManager()
    const events: string[] = []

    manager.onStartObservable.add(event => events.push(`${event.id}:start`))
    manager.onUpdateObservable.add(event => events.push(`${event.id}:update`))
    manager.onCompleteObservable.add(event => {
      events.push(`${event.id}:complete`)
    })

    manager.start('apple', {
      endValue: 1,
      rate: 1,
      startValue: 0
    })
    manager.update('apple', 1, true)

    expect(events).toEqual([
      'apple:start',
      'apple:update',
      'apple:complete'
    ])
  })
})
