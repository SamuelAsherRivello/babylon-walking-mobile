import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('physics frame-rate independence', () => {
  it('uses a fixed physics timestep', () => {
    const source = readFileSync(
      resolve('src/client/scripts/controller/addPhysics.ts'),
      'utf8'
    )

    expect(source).toContain('setTimeStep(1 / 60)')
  })

  it('steps physics before any render-fps throttle', () => {
    const source = readFileSync(
      resolve('src/client/scripts/controller/index.ts'),
      'utf8'
    )
    const physicsStepIndex = source.indexOf('advancePhysics(now)')
    const renderThrottleIndex = source.indexOf(
      'if (!renderScheduler.shouldRender(now))'
    )

    expect(source).toContain('scene.physicsEnabled = false')
    expect(source).toContain('_advancePhysicsEngineStep')
    expect(physicsStepIndex).toBeGreaterThan(-1)
    expect(renderThrottleIndex).toBeGreaterThan(-1)
    expect(physicsStepIndex).toBeLessThan(renderThrottleIndex)
    expect(source).toContain('scene.render()')
  })

  it('updates orbiters before any render-fps throttle', () => {
    const source = readFileSync(
      resolve('src/client/scripts/controller/index.ts'),
      'utf8'
    )
    const orbiterUpdateIndex = source.indexOf('updateOrbiters(deltaSeconds)')
    const renderThrottleIndex = source.indexOf(
      'if (!renderScheduler.shouldRender(now))'
    )

    expect(source).not.toContain('scene.onBeforeRenderObservable.add')
    expect(source).toContain('const updateOrbiters = ')
    expect(orbiterUpdateIndex).toBeGreaterThan(-1)
    expect(renderThrottleIndex).toBeGreaterThan(-1)
    expect(orbiterUpdateIndex).toBeLessThan(renderThrottleIndex)
  })

  it('updates input and zones before any render-fps throttle', () => {
    const source = readFileSync(
      resolve('src/client/scripts/controller/index.ts'),
      'utf8'
    )
    const inputUpdateIndex = source.indexOf(
      'runtimeInput.update(inputDeltaSeconds)'
    )
    const zoneUpdateIndex = source.indexOf(
      'zone.update(prototype.player.position, !playerActions.isJumping)'
    )
    const renderThrottleIndex = source.indexOf(
      'if (!renderScheduler.shouldRender(now))'
    )

    expect(inputUpdateIndex).toBeGreaterThan(-1)
    expect(zoneUpdateIndex).toBeGreaterThan(-1)
    expect(renderThrottleIndex).toBeGreaterThan(-1)
    expect(inputUpdateIndex).toBeLessThan(renderThrottleIndex)
    expect(zoneUpdateIndex).toBeLessThan(renderThrottleIndex)
  })

  it('bounds catch-up work after a long pause', () => {
    const source = readFileSync(
      resolve('src/client/scripts/controller/index.ts'),
      'utf8'
    )

    expect(source).toContain('const maximumPhysicsSteps = 5')
    expect(source).toContain('physicsAccumulatorMs = Math.min(')
    expect(source).toContain('physicsSteps < maximumPhysicsSteps')
  })
})
