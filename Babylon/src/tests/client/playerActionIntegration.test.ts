import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const source = readFileSync(
  resolve('src/client/scripts/index.ts'),
  'utf8'
)

describe('player action runtime integration', () => {
  it('shares action definitions between keyboard and virtual controls', () => {
    expect(source).toContain('const gameplayActions = createGameplayActions(')
    expect(source).toContain('window,\n    gameplayActions')
    expect(source).toContain('actions: gameplayActions')
  })

  it('resets action state and toggles the complete controller', () => {
    expect(source).toContain('playerActions.reset(spawn.y)')
    expect(source).toContain('virtualController.setEnabled(true)')
    expect(source).toContain('virtualController.setEnabled(false)')
  })

  it('updates before render throttling and disposes before the engine', () => {
    const updateIndex = source.indexOf(
      'playerActions.update(inputDeltaSeconds)'
    )
    const throttleIndex = source.indexOf(
      'if (!renderScheduler.shouldRender(now))'
    )
    const actionDisposeIndex = source.indexOf('playerActions.dispose()')
    const engineDisposeIndex = source.indexOf('engine.dispose()')

    expect(updateIndex).toBeGreaterThan(-1)
    expect(updateIndex).toBeLessThan(throttleIndex)
    expect(actionDisposeIndex).toBeGreaterThan(-1)
    expect(actionDisposeIndex).toBeLessThan(engineDisposeIndex)
  })
})
