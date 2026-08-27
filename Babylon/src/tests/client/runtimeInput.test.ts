import {
  ArcRotateCamera,
  Matrix,
  Mesh,
  MeshBuilder,
  NullEngine,
  Scene,
  Vector2,
  Vector3
} from '@babylonjs/core'
import type { ArcRotateCameraPointersInput } from
  '@babylonjs/core/Cameras/Inputs/arcRotateCameraPointersInput'
import { afterEach, describe, expect, it } from 'vitest'
import {
  RuntimeInputController,
  blockPrimaryMouseCameraInput,
  cameraMotionTuning,
  configureRuntimeCamera,
  playerMotionTuning,
  playerTurnSpeed,
  runtimeInputLabels
} from '../../client/scripts/runtimeInput'

type Harness = {
  camera: ArcRotateCamera
  controller: RuntimeInputController
  engine: NullEngine
  player: Mesh
  scene: Scene
  target: EventTarget
}

const harnesses: Harness[] = []

function createHarness(): Harness {
  const engine = new NullEngine()
  const scene = new Scene(engine)
  const player = MeshBuilder.CreateBox('Player', { size: 1 }, scene)
  const camera = new ArcRotateCamera(
    'camera',
    Math.PI / 4,
    Math.PI / 3,
    10,
    Vector3.Zero(),
    scene
  )
  const target = new EventTarget()
  const controller = new RuntimeInputController(
    player,
    camera,
    target
  )
  const harness = {
    camera,
    controller,
    engine,
    player,
    scene,
    target
  }
  harnesses.push(harness)

  return harness
}

function dispatchKey(
  target: EventTarget,
  type: 'keydown' | 'keyup',
  code: string
) {
  const event = new Event(type, { cancelable: true })
  Object.defineProperty(event, 'code', { value: code })
  target.dispatchEvent(event)

  return event
}

function dispatchPointer(
  target: EventTarget,
  pointerType: string,
  button: number
) {
  const event = new Event('pointerdown', { cancelable: true })
  Object.defineProperties(event, {
    button: { value: button },
    pointerType: { value: pointerType }
  })
  target.dispatchEvent(event)

  return event
}

function runHeldInput(
  code: string,
  stepSeconds: number,
  steps: number
) {
  const harness = createHarness()
  dispatchKey(harness.target, 'keydown', code)

  for (let index = 0; index < steps; index += 1) {
    harness.controller.update(stepSeconds)
  }

  return harness
}

function advance(
  controller: RuntimeInputController,
  totalSeconds: number,
  stepSeconds = 0.05
) {
  let remainingSeconds = totalSeconds

  while (remainingSeconds > 0) {
    const deltaSeconds = Math.min(stepSeconds, remainingSeconds)
    controller.update(deltaSeconds)
    remainingSeconds -= deltaSeconds
  }
}

function getViewBasis(camera: ArcRotateCamera) {
  camera.getViewMatrix(true)
  const target = camera.getTarget()
  const forward = new Vector2(
    target.x - camera.position.x,
    target.z - camera.position.z
  ).normalize()
  const right = new Vector2(forward.y, -forward.x)

  return { forward, right }
}

function angularDistance(first: number, second: number) {
  return Math.abs(Math.atan2(
    Math.sin(first - second),
    Math.cos(first - second)
  ))
}

afterEach(() => {
  while (harnesses.length > 0) {
    const harness = harnesses.pop()
    harness?.controller.dispose()
    harness?.scene.dispose()
    harness?.engine.dispose()
  }
})

describe('runtime player input', () => {
  it('uses the requested movement tuning with 1.5x top speed', () => {
    expect(playerMotionTuning).toEqual({
      baseSpeed: 3,
      maxSpeed: 5.85,
      accelerationSeconds: 0.5,
      decelerationSeconds: 0.25
    })
  })

  it.each([
    ['KeyA', 'ArrowLeft', 'right', -1],
    ['KeyD', 'ArrowRight', 'right', 1],
    ['KeyW', 'ArrowUp', 'forward', 1],
    ['KeyS', 'ArrowDown', 'forward', -1]
  ] as const)(
    'maps %s and %s through the current camera view',
    (letter, arrow, basisName, sign) => {
      const letterHarness = runHeldInput(letter, 0.1, 1)
      const arrowHarness = runHeldInput(arrow, 0.1, 1)
      const expected = getViewBasis(letterHarness.camera)[basisName]
        .scale(sign)
      const letterDirection = new Vector2(
        letterHarness.player.position.x,
        letterHarness.player.position.z
      ).normalize()
      const arrowDirection = new Vector2(
        arrowHarness.player.position.x,
        arrowHarness.player.position.z
      ).normalize()

      expect(Vector2.Dot(letterDirection, expected)).toBeCloseTo(1)
      expect(Vector2.Dot(arrowDirection, expected)).toBeCloseTo(1)
      expect(arrowHarness.player.position).toEqual(
        letterHarness.player.position
      )
    }
  )

  it('moves Up exactly like a full joystick at twelve oclock', () => {
    const keyboard = createHarness()
    const joystick = createHarness()
    keyboard.camera.alpha += Math.PI / 2
    joystick.camera.alpha += Math.PI / 2

    dispatchKey(keyboard.target, 'keydown', 'ArrowUp')
    joystick.controller.setPlayerAnalogInput(new Vector2(0, 1))
    keyboard.controller.update(0.1)
    joystick.controller.update(0.1)

    expect(keyboard.player.position).toEqual(joystick.player.position)
    expect(keyboard.player.rotation.y).toBe(joystick.player.rotation.y)
    expect(keyboard.controller.playerSpeed).toBe(
      joystick.controller.playerSpeed
    )
  })

  it('turns over several frames toward a new travel heading', () => {
    const { camera, controller, player, target } = createHarness()
    dispatchKey(target, 'keydown', 'KeyW')
    advance(controller, Math.PI / playerTurnSpeed)
    dispatchKey(target, 'keyup', 'KeyW')
    dispatchKey(target, 'keydown', 'KeyD')
    const targetDirection = getViewBasis(camera).right
    const targetHeading = Math.atan2(
      targetDirection.x,
      targetDirection.y
    )

    controller.update(1 / 60)

    expect(
      angularDistance(player.rotation.y, targetHeading)
    ).toBeGreaterThan(0)

    advance(controller, Math.PI / 2 / playerTurnSpeed)

    expect(
      angularDistance(player.rotation.y, targetHeading)
    ).toBeCloseTo(0)
  })

  it('turns at the same rate across different update rates', () => {
    const thirtyFps = runHeldInput('KeyD', 1 / 30, 3)
    const sixtyFps = runHeldInput('KeyD', 1 / 60, 6)

    expect(thirtyFps.player.rotation.y).toBeCloseTo(
      sixtyFps.player.rotation.y
    )
  })

  it.each([
    ['KeyW', 'KeyS', 'forward', -1],
    ['KeyS', 'KeyW', 'forward', 1],
    ['KeyA', 'KeyD', 'right', 1],
    ['KeyD', 'KeyA', 'right', -1]
  ] as const)(
    'gradually reverses from %s to %s',
    (firstCode, secondCode, basisName, sign) => {
      const { camera, controller, player, target } = createHarness()
      dispatchKey(target, 'keydown', firstCode)
      advance(controller, Math.PI / playerTurnSpeed)
      dispatchKey(target, 'keyup', firstCode)
      dispatchKey(target, 'keydown', secondCode)
      const targetDirection = getViewBasis(camera)[basisName]
        .scale(sign)
      const targetHeading = Math.atan2(
        targetDirection.x,
        targetDirection.y
      )

      controller.update(1 / 60)

      expect(
        angularDistance(player.rotation.y, targetHeading)
      ).toBeGreaterThan(0)

      advance(controller, Math.PI / playerTurnSpeed)

      expect(
        angularDistance(player.rotation.y, targetHeading)
      ).toBeCloseTo(0)
    }
  )

  it('faces a diagonal heading and retains it while slowing down', () => {
    const { camera, controller, player, target } = createHarness()
    dispatchKey(target, 'keydown', 'KeyW')
    dispatchKey(target, 'keydown', 'KeyD')
    advance(controller, Math.PI / 2 / playerTurnSpeed)
    const basis = getViewBasis(camera)
    const targetDirection = basis.forward.add(basis.right).normalize()
    const targetHeading = Math.atan2(
      targetDirection.x,
      targetDirection.y
    )

    expect(player.rotation.y).toBeCloseTo(targetHeading)

    dispatchKey(target, 'keyup', 'KeyW')
    dispatchKey(target, 'keyup', 'KeyD')
    controller.update(0.1)

    expect(player.rotation.y).toBeCloseTo(targetHeading)
  })

  it('moves on a tap that ends before the next update', () => {
    const { camera, controller, player, target } = createHarness()
    const expected = getViewBasis(camera).forward

    dispatchKey(target, 'keydown', 'KeyW')
    dispatchKey(target, 'keyup', 'KeyW')
    controller.update(1 / 60)

    const displacement = new Vector2(
      player.position.x,
      player.position.z
    )
    expect(Vector2.Dot(displacement, expected)).toBeGreaterThan(0)
    expect(controller.playerSpeed).toBeGreaterThanOrEqual(
      playerMotionTuning.baseSpeed
    )
  })

  it('accelerates while held and decelerates after release', () => {
    const { camera, controller, player, target } = createHarness()
    const expected = getViewBasis(camera).forward

    dispatchKey(target, 'keydown', 'KeyW')
    advance(controller, playerMotionTuning.accelerationSeconds)

    expect(controller.playerSpeed).toBeCloseTo(
      playerMotionTuning.maxSpeed
    )

    dispatchKey(target, 'keyup', 'KeyW')
    const releasePosition = player.position.clone()
    controller.update(0.1)
    const releaseDisplacement = new Vector2(
      player.position.x - releasePosition.x,
      player.position.z - releasePosition.z
    )

    expect(
      Vector2.Dot(releaseDisplacement, expected)
    ).toBeGreaterThan(0)
    expect(controller.playerSpeed).toBeGreaterThan(0)

    advance(controller, 0.15)

    expect(controller.playerSpeed).toBe(0)
  })

  it('normalizes diagonal movement to single-axis speed', () => {
    const straight = runHeldInput('KeyW', 0.1, 1)
    const diagonal = createHarness()
    dispatchKey(diagonal.target, 'keydown', 'KeyW')
    dispatchKey(diagonal.target, 'keydown', 'KeyD')
    diagonal.controller.update(0.1)
    const straightDistance = straight.player.position.length()
    const diagonalDistance = diagonal.player.position.length()
    const basis = getViewBasis(diagonal.camera)
    const expected = basis.forward.add(basis.right).normalize()
    const displacement = new Vector2(
      diagonal.player.position.x,
      diagonal.player.position.z
    ).normalize()

    expect(Vector2.Dot(displacement, expected)).toBeCloseTo(1)
    expect(diagonalDistance).toBeCloseTo(straightDistance)
  })

  it('produces equivalent movement at different update rates', () => {
    const thirtyFps = runHeldInput('KeyW', 1 / 30, 30)
    const sixtyFps = runHeldInput('KeyW', 1 / 60, 60)

    expect(thirtyFps.player.position.z).toBeCloseTo(
      sixtyFps.player.position.z,
      5
    )
  })

  it('decelerates when opposing inputs cancel', () => {
    const { controller, target } = createHarness()
    dispatchKey(target, 'keydown', 'KeyD')
    controller.update(0.2)
    const movingSpeed = controller.playerSpeed
    dispatchKey(target, 'keydown', 'KeyA')
    controller.update(0.1)

    expect(controller.playerSpeed).toBeLessThan(movingSpeed)
  })
})

describe('runtime joystick input', () => {
  it('projects twelve oclock toward the top of the game view', () => {
    const { camera, controller, engine, player, scene } = createHarness()
    scene.activeCamera = camera
    scene.render()
    const viewport = camera.viewport.toGlobal(
      engine.getRenderWidth(),
      engine.getRenderHeight()
    )
    const start = Vector3.Project(
      player.position,
      Matrix.Identity(),
      scene.getTransformMatrix(),
      viewport
    )

    controller.setPlayerAnalogInput(new Vector2(0, 1))
    controller.update(0.1)
    scene.render()
    const end = Vector3.Project(
      player.position,
      Matrix.Identity(),
      scene.getTransformMatrix(),
      viewport
    )

    expect(end.y).toBeLessThan(start.y)
    expect(Math.abs(end.x - start.x)).toBeLessThan(
      Math.abs(end.y - start.y)
    )
  })

  it.each([
    ['three', new Vector2(1, 0), 1],
    ['nine', new Vector2(-1, 0), -1]
  ] as const)(
    'projects %s oclock toward the matching side of the game view',
    (_clock, input, sign) => {
      const { camera, controller, engine, player, scene } =
        createHarness()
      scene.activeCamera = camera
      scene.render()
      const viewport = camera.viewport.toGlobal(
        engine.getRenderWidth(),
        engine.getRenderHeight()
      )
      const start = Vector3.Project(
        player.position,
        Matrix.Identity(),
        scene.getTransformMatrix(),
        viewport
      )

      controller.setPlayerAnalogInput(input)
      controller.update(0.1)
      scene.render()
      const end = Vector3.Project(
        player.position,
        Matrix.Identity(),
        scene.getTransformMatrix(),
        viewport
      )

      expect(Math.sign(end.x - start.x)).toBe(sign)
      expect(Math.abs(end.y - start.y)).toBeLessThan(
        Math.abs(end.x - start.x)
      )
    }
  )

  it.each([
    ['twelve', new Vector2(0, 1), 'forward', 1],
    ['three', new Vector2(1, 0), 'right', 1],
    ['six', new Vector2(0, -1), 'forward', -1],
    ['nine', new Vector2(-1, 0), 'right', -1]
  ] as const)(
    'maps %s oclock through the current camera view',
    (_clock, stick, basisName, sign) => {
      const { camera, controller, player } = createHarness()
      const basis = getViewBasis(camera)[basisName].scale(sign)

      controller.setPlayerAnalogInput(stick)
      controller.update(0.1)

      const displacement = new Vector2(
        player.position.x,
        player.position.z
      ).normalize()
      expect(Vector2.Dot(displacement, basis)).toBeCloseTo(1)
    }
  )

  it('uses the latest camera orientation for twelve oclock', () => {
    const { camera, controller, player } = createHarness()
    camera.alpha += Math.PI / 2
    const expected = getViewBasis(camera).forward

    controller.setPlayerAnalogInput(new Vector2(0, 1))
    controller.update(0.1)

    const displacement = new Vector2(
      player.position.x,
      player.position.z
    ).normalize()
    expect(Vector2.Dot(displacement, expected)).toBeCloseTo(1)
  })

  it('applies a dead zone and proportional intensity', () => {
    const deadZone = createHarness()
    deadZone.controller.setPlayerAnalogInput(new Vector2(0, 0.1))
    deadZone.controller.update(0.1)
    expect(deadZone.player.position.length()).toBe(0)

    const partial = createHarness()
    partial.controller.setPlayerAnalogInput(new Vector2(0, 0.5))
    partial.controller.update(0.1)

    const full = createHarness()
    full.controller.setPlayerAnalogInput(new Vector2(0, 1))
    full.controller.update(0.1)

    expect(partial.player.position.length()).toBeGreaterThan(0)
    expect(partial.player.position.length()).toBeLessThan(
      full.player.position.length()
    )
  })

  it('clamps diagonal input to the full single-axis speed', () => {
    const straight = createHarness()
    straight.controller.setPlayerAnalogInput(new Vector2(0, 1))
    straight.controller.update(0.1)

    const diagonal = createHarness()
    diagonal.controller.setPlayerAnalogInput(new Vector2(1, 1))
    diagonal.controller.update(0.1)

    expect(diagonal.player.position.length()).toBeCloseTo(
      straight.player.position.length()
    )
  })

  it('uses joystick input until it returns to center', () => {
    const { camera, controller, player, target } = createHarness()
    const expected = getViewBasis(camera).forward
    dispatchKey(target, 'keydown', 'KeyA')
    controller.setPlayerAnalogInput(new Vector2(0, 1))
    controller.update(0.1)

    const joystickDisplacement = new Vector2(
      player.position.x,
      player.position.z
    ).normalize()
    expect(Vector2.Dot(joystickDisplacement, expected)).toBeCloseTo(1)

    controller.setPlayerAnalogInput(Vector2.Zero())
    const releasePosition = player.position.clone()
    const keyboardDirection = getViewBasis(camera).right.scale(-1)
    controller.update(0.1)
    const releaseDisplacement = new Vector2(
      player.position.x - releasePosition.x,
      player.position.z - releasePosition.z
    )
    expect(
      Vector2.Dot(releaseDisplacement, keyboardDirection)
    ).toBeGreaterThan(0)
  })
})

describe('runtime camera input', () => {
  it('uses the requested doubled camera tuning', () => {
    expect(cameraMotionTuning).toEqual({
      baseSpeed: 1.2,
      maxSpeed: 1.8,
      accelerationSeconds: 0.35,
      decelerationSeconds: 0.2
    })
  })

  it.each([
    ['KeyI', 'beta', -1],
    ['KeyK', 'beta', 1],
    ['KeyJ', 'alpha', -1],
    ['KeyL', 'alpha', 1]
  ] as const)(
    'maps %s to the requested orbit direction',
    (code, angle, sign) => {
      const harness = createHarness()
      const initialAngle = harness.camera[angle]
      dispatchKey(harness.target, 'keydown', code)
      harness.controller.update(0.1)

      expect(Math.sign(harness.camera[angle] - initialAngle)).toBe(sign)
    }
  )

  it('uses independent camera acceleration and deceleration', () => {
    const { controller, target } = createHarness()

    expect(cameraMotionTuning).not.toBe(playerMotionTuning)
    expect(cameraMotionTuning.accelerationSeconds).not.toBe(
      playerMotionTuning.accelerationSeconds
    )

    dispatchKey(target, 'keydown', 'KeyJ')
    advance(controller, cameraMotionTuning.accelerationSeconds)
    expect(controller.cameraSpeed).toBeCloseTo(
      cameraMotionTuning.maxSpeed
    )

    dispatchKey(target, 'keyup', 'KeyJ')
    advance(controller, cameraMotionTuning.decelerationSeconds / 2)
    expect(controller.cameraSpeed).toBeGreaterThan(0)
    advance(controller, cameraMotionTuning.decelerationSeconds / 2)
    expect(controller.cameraSpeed).toBe(0)
  })

  it('preserves radius and clamps camera elevation', () => {
    const { camera, controller, target } = createHarness()
    const radius = camera.radius
    camera.beta = 0.11
    dispatchKey(target, 'keydown', 'KeyI')
    controller.update(0.1)

    expect(camera.radius).toBe(radius)
    expect(camera.beta).toBeGreaterThan(0)

    dispatchKey(target, 'keyup', 'KeyI')
    advance(controller, cameraMotionTuning.decelerationSeconds)
    camera.beta = Math.PI / 2 - 0.11
    dispatchKey(target, 'keydown', 'KeyK')
    controller.update(0.1)

    expect(camera.beta).toBeLessThan(Math.PI / 2)
  })

  it('moves the player and camera simultaneously', () => {
    const { camera, controller, player, target } = createHarness()
    const alpha = camera.alpha
    const expected = getViewBasis(camera).forward
    dispatchKey(target, 'keydown', 'KeyW')
    dispatchKey(target, 'keydown', 'KeyJ')
    controller.update(0.1)
    const displacement = new Vector2(
      player.position.x,
      player.position.z
    )

    expect(Vector2.Dot(displacement, expected)).toBeGreaterThan(0)
    expect(camera.alpha).toBeLessThan(alpha)
  })
})

describe('runtime input lifecycle and camera configuration', () => {
  it('disables held, pending, and future gameplay motion', () => {
    const { camera, controller, player, target } = createHarness()
    dispatchKey(target, 'keydown', 'KeyW')
    dispatchKey(target, 'keydown', 'KeyJ')
    controller.update(0.1)
    const stoppedPosition = player.position.clone()
    const stoppedAlpha = camera.alpha

    controller.setEnabled(false)

    expect(controller.isEnabled).toBe(false)
    expect(controller.playerSpeed).toBe(0)
    expect(controller.cameraSpeed).toBe(0)

    dispatchKey(target, 'keydown', 'KeyD')
    dispatchKey(target, 'keydown', 'KeyL')
    controller.update(0.1)

    expect(player.position).toEqual(stoppedPosition)
    expect(camera.alpha).toBe(stoppedAlpha)
  })

  it('clears analog input across disable, enable, and disposal', () => {
    const { controller, player } = createHarness()
    controller.setPlayerAnalogInput(new Vector2(0, 1))
    expect(controller.playerAnalogInput.length()).toBeGreaterThan(0)

    controller.setEnabled(false)
    expect(controller.playerAnalogInput.length()).toBe(0)
    controller.setPlayerAnalogInput(new Vector2(1, 0))
    expect(controller.playerAnalogInput.length()).toBe(0)

    controller.setEnabled(true)
    controller.update(0.1)
    expect(player.position.length()).toBe(0)

    controller.setPlayerAnalogInput(new Vector2(0, 1))
    controller.dispose()
    expect(controller.playerAnalogInput.length()).toBe(0)
    controller.setPlayerAnalogInput(new Vector2(1, 0))
    expect(controller.playerAnalogInput.length()).toBe(0)
  })

  it('tracks the player and removes only default keyboard control', () => {
    const { camera, player } = createHarness()
    const pointerInput = camera.inputs.attached.pointers as
      ArcRotateCameraPointersInput

    expect(camera.inputs.attached.keyboard).toBeDefined()
    expect(pointerInput.buttons).toContain(0)
    expect(camera.inputs.attached.mousewheel).toBeDefined()
    configureRuntimeCamera(camera, player)

    expect(camera.targetHost).toBe(player)
    expect(camera.inputs.attached.keyboard).toBeUndefined()
    expect(pointerInput.buttons).not.toContain(0)
    expect(camera.inputs.attached.mousewheel).toBeDefined()

    player.position.set(2, 0.5, -3)
    player.computeWorldMatrix(true)
    camera.getViewMatrix(true)
    expect(camera.getTarget().asArray()).toEqual([2, 0.5, -3])
  })

  it('limits camera zoom without changing the current radius', () => {
    const { camera, player } = createHarness()
    const initialRadius = camera.radius

    configureRuntimeCamera(camera, player)

    expect(camera.lowerRadiusLimit).toBe(7)
    expect(camera.upperRadiusLimit).toBe(72)
    expect(camera.radius).toBe(initialRadius)
  })

  it(
    'blocks primary mouse drag without blocking touch or other buttons',
    () => {
      const canvas = new EventTarget()
      const dispose = blockPrimaryMouseCameraInput(canvas)
      let receivedEvents = 0
      canvas.addEventListener('pointerdown', () => {
        receivedEvents += 1
      })

      dispatchPointer(canvas, 'mouse', 0)
      expect(receivedEvents).toBe(0)

      dispatchPointer(canvas, 'touch', 0)
      dispatchPointer(canvas, 'mouse', 2)
      expect(receivedEvents).toBe(2)

      dispose()
      dispatchPointer(canvas, 'mouse', 0)
      expect(receivedEvents).toBe(3)
    }
  )

  it('prevents gameplay defaults but leaves F available', () => {
    const { controller, target } = createHarness()
    const arrowEvent = dispatchKey(target, 'keydown', 'ArrowUp')
    const fullscreenEvent = dispatchKey(target, 'keydown', 'KeyF')

    expect(arrowEvent.defaultPrevented).toBe(true)
    expect(fullscreenEvent.defaultPrevented).toBe(false)
    controller.update(0.1)
  })

  it('clears held input on blur and detaches listeners on dispose', () => {
    const { controller, player, target } = createHarness()
    dispatchKey(target, 'keydown', 'KeyW')
    controller.update(0.1)
    target.dispatchEvent(new Event('blur'))
    advance(controller, playerMotionTuning.decelerationSeconds)
    const stoppedPosition = player.position.z

    expect(controller.playerSpeed).toBe(0)

    controller.dispose()
    dispatchKey(target, 'keydown', 'KeyW')
    controller.update(0.1)
    expect(player.position.z).toBe(stoppedPosition)
  })

  it('publishes the requested runtime guidance', () => {
    expect(runtimeInputLabels).toEqual([
      'WASD = Move Player',
      'F = Fullscreen',
      'C = Create Orbiter'
    ])
  })
})
