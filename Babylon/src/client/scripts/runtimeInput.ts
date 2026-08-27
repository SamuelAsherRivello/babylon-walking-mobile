import {
  ArcRotateCamera,
  TransformNode,
  Vector2
} from '@babylonjs/core'
import type { ArcRotateCameraPointersInput } from
  '@babylonjs/core/Cameras/Inputs/arcRotateCameraPointersInput'

type MotionTuning = {
  baseSpeed: number
  maxSpeed: number
  accelerationSeconds: number
  decelerationSeconds: number
}

type SpeedStep = {
  distance: number
  speed: number
}

const maxDeltaSeconds = 0.1
const minimumCameraBeta = 0.1
const maximumCameraBeta = Math.PI / 2 - 0.1
const minimumCameraRadius = 7
const maximumCameraRadius = 72
const playerAnalogDeadZone = 0.15

const playerKeyCodes = new Set([
  'KeyA',
  'KeyD',
  'KeyS',
  'KeyW',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp'
])

const cameraKeyCodes = new Set([
  'KeyI',
  'KeyJ',
  'KeyK',
  'KeyL'
])

const gameplayKeyCodes = new Set([
  ...playerKeyCodes,
  ...cameraKeyCodes
])

export const playerMotionTuning: Readonly<MotionTuning> = {
  baseSpeed: 3,
  maxSpeed: 5.85,
  accelerationSeconds: 0.5,
  decelerationSeconds: 0.25
}

export const playerTurnSpeed = Math.PI * 4

export const cameraMotionTuning: Readonly<MotionTuning> = {
  baseSpeed: 1.2,
  maxSpeed: 1.8,
  accelerationSeconds: 0.35,
  decelerationSeconds: 0.2
}

export const runtimeInputLabels = [
  'WASD = Move Player',
  'F = Fullscreen',
  'C = Create Orbiter'
]

function getPlayerDirection(keys: Set<string>) {
  return new Vector2(
    Number(keys.has('KeyD') || keys.has('ArrowRight')) -
      Number(keys.has('KeyA') || keys.has('ArrowLeft')),
    Number(keys.has('KeyW') || keys.has('ArrowUp')) -
      Number(keys.has('KeyS') || keys.has('ArrowDown'))
  )
}

function getCameraDirection(keys: Set<string>) {
  return new Vector2(
    Number(keys.has('KeyL')) - Number(keys.has('KeyJ')),
    Number(keys.has('KeyK')) - Number(keys.has('KeyI'))
  )
}

function hasAnyKey(keys: Set<string>, expectedKeys: Set<string>) {
  for (const key of keys) {
    if (expectedKeys.has(key)) {
      return true
    }
  }

  return false
}

function normalizeDirection(direction: Vector2) {
  if (direction.lengthSquared() > 0) {
    direction.normalize()
  }

  return direction
}

function turnTowardsHeading(
  currentHeading: number,
  targetHeading: number,
  deltaSeconds: number
) {
  const difference = Math.atan2(
    Math.sin(targetHeading - currentHeading),
    Math.cos(targetHeading - currentHeading)
  )
  const maximumTurn = playerTurnSpeed * deltaSeconds

  if (Math.abs(difference) <= maximumTurn) {
    return targetHeading
  }

  return currentHeading + Math.sign(difference) * maximumTurn
}

function integrateSpeed(
  speed: number,
  targetSpeed: number,
  rate: number,
  deltaSeconds: number
): SpeedStep {
  if (speed === targetSpeed || rate <= 0) {
    return {
      distance: speed * deltaSeconds,
      speed
    }
  }

  const direction = Math.sign(targetSpeed - speed)
  const targetSeconds = Math.abs(targetSpeed - speed) / rate
  const rampSeconds = Math.min(deltaSeconds, targetSeconds)
  const nextSpeed = speed + direction * rate * rampSeconds
  const rampDistance = (speed + nextSpeed) * 0.5 * rampSeconds
  const steadySeconds = deltaSeconds - rampSeconds

  const reachedTarget =
    Math.abs(nextSpeed - targetSpeed) < Number.EPSILON * 10

  return {
    distance: rampDistance + targetSpeed * steadySeconds,
    speed: reachedTarget ? targetSpeed : nextSpeed
  }
}

function advanceMotion(
  speed: number,
  inputIntensity: number,
  tuning: Readonly<MotionTuning>,
  deltaSeconds: number
) {
  const safeIntensity = Math.min(Math.max(inputIntensity, 0), 1)
  const hasInput = safeIntensity > 0
  const baseSpeed = tuning.baseSpeed * safeIntensity
  let currentSpeed = speed

  if (hasInput && currentSpeed < baseSpeed) {
    currentSpeed = baseSpeed
  }

  const targetSpeed = hasInput
    ? tuning.maxSpeed * safeIntensity
    : 0
  const speedRange = hasInput
    ? (tuning.maxSpeed - tuning.baseSpeed) * safeIntensity
    : tuning.maxSpeed
  const duration = hasInput
    ? tuning.accelerationSeconds
    : tuning.decelerationSeconds
  const rate = duration > 0 ? speedRange / duration : 0

  return integrateSpeed(
    currentSpeed,
    targetSpeed,
    rate,
    deltaSeconds
  )
}

export function configureRuntimeCamera(
  camera: ArcRotateCamera,
  player: TransformNode
) {
  camera.setTarget(player)
  camera.lowerRadiusLimit = minimumCameraRadius
  camera.upperRadiusLimit = maximumCameraRadius
  const keyboardInput = camera.inputs.attached.keyboard

  if (keyboardInput) {
    camera.inputs.remove(keyboardInput)
  }

  const pointerInput = camera.inputs.attached.pointers as
    ArcRotateCameraPointersInput | undefined

  if (pointerInput) {
    pointerInput.buttons = pointerInput.buttons.filter(
      button => button !== 0
    )
  }
}

export function blockPrimaryMouseCameraInput(target: EventTarget) {
  const listenerOptions = { capture: true }
  const blockPrimaryMouse = (event: Event) => {
    const pointerEvent = event as PointerEvent

    if (
      pointerEvent.pointerType === 'mouse' &&
      pointerEvent.button === 0
    ) {
      event.stopImmediatePropagation()
    }
  }

  target.addEventListener(
    'pointerdown',
    blockPrimaryMouse,
    listenerOptions
  )

  return () => {
    target.removeEventListener(
      'pointerdown',
      blockPrimaryMouse,
      listenerOptions
    )
  }
}

export class RuntimeInputController {
  private readonly heldKeys = new Set<string>()
  private readonly pendingKeys = new Set<string>()
  private readonly lastPlayerDirection = Vector2.Zero()
  private readonly lastCameraDirection = Vector2.Zero()
  private readonly analogPlayerInput = Vector2.Zero()
  private currentPlayerSpeed = 0
  private currentCameraSpeed = 0
  private enabled = true
  private disposed = false

  public constructor(
    private readonly player: TransformNode,
    private readonly camera: ArcRotateCamera,
    private readonly eventTarget: EventTarget
  ) {
    eventTarget.addEventListener('keydown', this.handleKeyDown)
    eventTarget.addEventListener('keyup', this.handleKeyUp)
    eventTarget.addEventListener('blur', this.handleBlur)
  }

  public get playerSpeed() {
    return this.currentPlayerSpeed
  }

  public get cameraSpeed() {
    return this.currentCameraSpeed
  }

  public get isEnabled() {
    return this.enabled
  }

  public get playerAnalogInput() {
    return this.analogPlayerInput.clone()
  }

  public setPlayerAnalogInput(direction: Vector2) {
    if (this.disposed || !this.enabled) {
      this.analogPlayerInput.set(0, 0)
      return
    }

    this.analogPlayerInput.copyFrom(direction)

    if (this.analogPlayerInput.lengthSquared() > 1) {
      this.analogPlayerInput.normalize()
    }
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled

    if (!enabled) {
      this.clearMotion()
    }
  }

  public update(deltaSeconds: number) {
    if (this.disposed || !this.enabled) {
      return
    }

    const safeDeltaSeconds = Math.min(
      Math.max(deltaSeconds, 0),
      maxDeltaSeconds
    )
    this.updatePlayer(safeDeltaSeconds)
    this.updateCamera(safeDeltaSeconds)
    this.pendingKeys.clear()
  }

  public dispose() {
    if (this.disposed) {
      return
    }

    this.disposed = true
    this.clearMotion()
    this.eventTarget.removeEventListener('keydown', this.handleKeyDown)
    this.eventTarget.removeEventListener('keyup', this.handleKeyUp)
    this.eventTarget.removeEventListener('blur', this.handleBlur)
  }

  private readonly handleKeyDown = (event: Event) => {
    const keyboardEvent = event as KeyboardEvent

    if (!gameplayKeyCodes.has(keyboardEvent.code)) {
      return
    }

    keyboardEvent.preventDefault()

    if (!this.enabled) {
      return
    }

    if (!this.heldKeys.has(keyboardEvent.code)) {
      this.pendingKeys.add(keyboardEvent.code)
    }

    this.heldKeys.add(keyboardEvent.code)
  }

  private readonly handleKeyUp = (event: Event) => {
    const keyboardEvent = event as KeyboardEvent

    if (!gameplayKeyCodes.has(keyboardEvent.code)) {
      return
    }

    keyboardEvent.preventDefault()
    this.heldKeys.delete(keyboardEvent.code)
  }

  private readonly handleBlur = () => {
    this.heldKeys.clear()
    this.pendingKeys.clear()
    this.analogPlayerInput.set(0, 0)
  }

  private clearMotion() {
    this.heldKeys.clear()
    this.pendingKeys.clear()
    this.lastPlayerDirection.set(0, 0)
    this.lastCameraDirection.set(0, 0)
    this.analogPlayerInput.set(0, 0)
    this.currentPlayerSpeed = 0
    this.currentCameraSpeed = 0
  }

  private updatePlayer(deltaSeconds: number) {
    const hasHeldInput = hasAnyKey(this.heldKeys, playerKeyCodes)
    const keys = hasHeldInput ? this.heldKeys : this.pendingKeys
    const keyboardInput = normalizeDirection(getPlayerDirection(keys))
    const keyboardDirection = this.getViewRelativePlayerDirection(
      keyboardInput
    )
    const analogMotion = this.getAnalogPlayerMotion()
    const direction = analogMotion.intensity > 0
      ? analogMotion.direction
      : keyboardDirection
    const inputIntensity = analogMotion.intensity > 0
      ? analogMotion.intensity
      : Number(keyboardDirection.lengthSquared() > 0)
    const hasDirection = inputIntensity > 0

    if (hasDirection) {
      this.lastPlayerDirection.copyFrom(direction)
    }

    if (this.lastPlayerDirection.lengthSquared() > 0) {
      const targetHeading = Math.atan2(
        this.lastPlayerDirection.x,
        this.lastPlayerDirection.y
      )
      this.player.rotation.y = turnTowardsHeading(
        this.player.rotation.y,
        targetHeading,
        deltaSeconds
      )
    }

    const step = advanceMotion(
      this.currentPlayerSpeed,
      inputIntensity,
      playerMotionTuning,
      deltaSeconds
    )
    this.currentPlayerSpeed = step.speed
    this.player.position.x += this.lastPlayerDirection.x * step.distance
    this.player.position.z += this.lastPlayerDirection.y * step.distance
  }

  private updateCamera(deltaSeconds: number) {
    const hasHeldInput = hasAnyKey(this.heldKeys, cameraKeyCodes)
    const keys = hasHeldInput ? this.heldKeys : this.pendingKeys
    const direction = normalizeDirection(getCameraDirection(keys))
    const hasDirection = direction.lengthSquared() > 0

    if (hasDirection) {
      this.lastCameraDirection.copyFrom(direction)
    }

    const step = advanceMotion(
      this.currentCameraSpeed,
      Number(hasDirection),
      cameraMotionTuning,
      deltaSeconds
    )
    this.currentCameraSpeed = step.speed
    this.camera.alpha += this.lastCameraDirection.x * step.distance
    this.camera.beta += this.lastCameraDirection.y * step.distance
    this.camera.beta = Math.min(
      Math.max(this.camera.beta, minimumCameraBeta),
      maximumCameraBeta
    )
  }

  private getAnalogPlayerMotion() {
    const rawLength = this.analogPlayerInput.length()

    if (rawLength <= playerAnalogDeadZone) {
      return {
        direction: Vector2.Zero(),
        intensity: 0
      }
    }

    const stickDirection = this.analogPlayerInput.scale(1 / rawLength)
    const direction = this.getViewRelativePlayerDirection(
      stickDirection
    )
    const intensity = Math.min(
      (rawLength - playerAnalogDeadZone) /
        (1 - playerAnalogDeadZone),
      1
    )

    return { direction, intensity }
  }

  private getViewRelativePlayerDirection(viewDirection: Vector2) {
    if (viewDirection.lengthSquared() <= Number.EPSILON) {
      return Vector2.Zero()
    }

    this.camera.getViewMatrix(true)
    const target = this.camera.getTarget()
    const forward = new Vector2(
      target.x - this.camera.position.x,
      target.z - this.camera.position.z
    )

    if (forward.lengthSquared() <= Number.EPSILON) {
      forward.set(0, 1)
    } else {
      forward.normalize()
    }

    const right = new Vector2(forward.y, -forward.x)
    const direction = right.scale(viewDirection.x).addInPlace(
      forward.scale(viewDirection.y)
    )
    normalizeDirection(direction)

    return direction
  }
}
