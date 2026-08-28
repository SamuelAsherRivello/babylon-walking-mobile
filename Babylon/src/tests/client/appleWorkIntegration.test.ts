import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('apple work integration', () => {
  it('clears completed work before the next apple can start', () => {
    const source = readFileSync(resolve(
      'src/client/scripts/controller/index.ts'
    ), 'utf8')
    const completion = source.indexOf('const collection = progression.collectApple()')
    const clear = source.indexOf("workManager.clear('apple')", completion)
    const partialQuestReturn = source.indexOf(
      'if (!collection.justCompleted)',
      completion
    )

    expect(clear).toBeGreaterThan(completion)
    expect(clear).toBeLessThan(partialQuestReturn)
  })
})
