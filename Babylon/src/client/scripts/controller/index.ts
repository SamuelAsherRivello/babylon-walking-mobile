// index.ts - Main entry point for Babylon.js client setup.
import * as BABYLON from '@babylonjs/core'
import '@babylonjs/loaders/glTF'
import '../../styles/index.css'
import { addInput } from './addInput'
import { AddOrbiter } from './addOrbiter'
import { addPostProcess } from '../view/3d/addPostProcess'
import { DebugHud } from '../view/2d/debugHud'
import {
  applyGameCanvasLayout,
  calculateGameCanvasLayout,
  portraitMobileMediaQuery
} from '../model/gameViewport'
import { createGameplayActions } from './gameplayActions'
import {
  debugPreferenceDefaults,
  getDebugInputLabels,
  mobileDebugInputLabels,
  readDebugPreferences,
  resetDebugPreferences,
  setMobileModePreference,
  toggleDebugHudPreference,
  writeDebugPreferences
} from '../model/debugPreferences'
import { BabylonConfigurationModel } from '../model/babylonConfigurationModel'
import {
  LevelProgression,
  createGameWorld,
  levelDefinitions
} from '../model/level'
import { OrbiterModel } from '../model/orbiterModel'
import { Orbiter } from '../view/3d/orbiter'
import { PlayerActionController } from './playerActions'
import { ProductionHud } from '../view/2d/productionHud'
import { readProductionUiViewport } from '../view/2d/productionHudLayout'
import { createInventorySlots } from '../model/productionHudModel'
import { createPrototypeCamera } from '../view/3d/prototypeScene'
import { ResolutionDebugGrid } from '../view/2d/resolutionDebugGrid'
import { RenderScheduler } from '../view/3d/renderScheduler'
import { createRenderingEngine } from '../view/3d/renderingEngineFactory'
import {
  loadReleaseMetadata
} from '../model/releaseVersion'
import { createPreloader } from '../view/2d/preloader'
import {
  RenderResolutionController,
  cycleUpscalingMode,
  type RenderViewport
} from '../model/renderUpscaling'
import {
  RuntimeInputController,
  configureRuntimeCamera,
  runtimeInputLabels
} from './runtimeInput'
import { SoundManager } from '../view/3d/soundManager'
import { ThreeFingerTapController } from './threeFingerTap'
import { Tweens } from '../view/3d/tweens'

const backgroundMusicEnabled = false
const backgroundMusicVolume = 0.15
const clickSoundVolume = 0.35

async function main() {
  const preloader = createPreloader(document)
  preloader.setStatus('Loading game data...')
  const releaseMetadata = await loadReleaseMetadata(
    import.meta.env.BASE_URL
  )
  const releaseVersion = releaseMetadata.releaseVersion
  const canvas = document.createElement('canvas')
  document.body.append(canvas)
  const portraitMobileMedia = window.matchMedia(
    portraitMobileMediaQuery
  )
  let currentUiViewport = readProductionUiViewport(
    document.documentElement
  )
  const updateCanvasPresentation = () => {
    currentUiViewport = readProductionUiViewport(
      document.documentElement
    )
    const canvasLayout = calculateGameCanvasLayout(
      currentUiViewport,
      portraitMobileMedia.matches
    )
    applyGameCanvasLayout(
      canvas,
      canvasLayout,
      portraitMobileMedia.matches
    )
  }
  updateCanvasPresentation()

  const uiContainer = document.createElement('div')
  uiContainer.style.position = 'absolute'
  uiContainer.style.right = '0'
  uiContainer.style.bottom = '0'
  uiContainer.style.zIndex = '1001'
  uiContainer.style.pointerEvents = 'none'
  canvas.appendChild(uiContainer)

  function adjustUIForInspector() {
    const inspector = document.querySelector('.babylonjs-inspector') as
      | HTMLElement
      | null
    let inspectorWidth = 0

    if (inspector) {
      const canvasRect = canvas.getBoundingClientRect()
      const inspectorRect = inspector.getBoundingClientRect()
      const overlapsRightEdge =
        inspectorRect.left < canvasRect.right &&
        inspectorRect.right > canvasRect.right

      if (overlapsRightEdge) {
        inspectorWidth = inspectorRect.right - canvasRect.right
      }
    }

    uiContainer.style.right = inspectorWidth ? `${inspectorWidth}px` : '0'
    document.querySelectorAll('.info-overlay').forEach(el => {
      const infoOverlay = el as HTMLElement
      infoOverlay.style.right = inspectorWidth ? `${inspectorWidth}px` : '0'
    })
  }

  const configuration = new BabylonConfigurationModel()
  const toggleFullscreen = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen()
      return
    }

    await document.documentElement.requestFullscreen()
  }

  let engine: BABYLON.Engine | BABYLON.WebGPUEngine
  let scene: BABYLON.Scene
  let debugHud: DebugHud
  let AddOrbiterClass = AddOrbiter
  const orbiters: Orbiter[] = []
  const origin = BABYLON.Vector3.Zero()
  const baseSphereDiameter = 1
  const tweens = new Tweens()
  let orbiterModel = new OrbiterModel()
  const targetFramerates = [30, 60, 120]
  const storage = window.localStorage
  const debugPreferences = readDebugPreferences(storage)
  configuration.antialias = debugPreferences.antialias
  let targetFramerateIndex = debugPreferences.targetFramerateIndex
  let targetFramerate = targetFramerates[targetFramerateIndex]
  const renderScheduler = new RenderScheduler(targetFramerate)
  const saveDebugPreferences = () => {
    writeDebugPreferences(storage, debugPreferences)
    debugHud.setShortcuts(getDebugInputLabels(debugPreferences))
  }
  const toggleDebugHud = () => {
    toggleDebugHudPreference(
      debugPreferences,
      storage,
      () => debugHud.toggle()
    )
    debugHud.setShortcuts(getDebugInputLabels(debugPreferences))
  }
  const debugInputLabels = getDebugInputLabels(debugPreferences)

  const engineResult = await createRenderingEngine<
    BABYLON.Engine | BABYLON.WebGPUEngine,
    BABYLON.WebGPUEngine
  >(navigator.gpu !== undefined, {
    createWebGPU: () => new BABYLON.WebGPUEngine(canvas, {
      antialias: configuration.antialias,
      adaptToDeviceRatio: configuration.adaptToDeviceRatio,
      powerPreference: configuration.powerPreference
    }),
    createWebGL: () => new BABYLON.Engine(
      canvas,
      configuration.antialias,
      { powerPreference: configuration.powerPreference },
      configuration.adaptToDeviceRatio
    ),
    warn: error => {
      console.warn(
        '[Rendering] WebGPU startup failed; using WebGL.',
        error
      )
    }
  })
  engine = engineResult.engine
  engine.loadingScreen = preloader
  engine.displayLoadingUI()
  const readRenderViewport = (): RenderViewport => {
    return {
      width: canvas.clientWidth,
      height: canvas.clientHeight,
      devicePixelRatio: window.devicePixelRatio
    }
  }
  const renderResolutionController = new RenderResolutionController(
    engine,
    configuration.adaptToDeviceRatio
  )
  const initialRenderingResolution =
    renderResolutionController.synchronize(
      readRenderViewport(),
      debugPreferences.upscalingMode
    )
  const resolutionGrid = new ResolutionDebugGrid()
  resolutionGrid.setResolution(
    initialRenderingResolution.displayResolution
  )
  scene = new BABYLON.Scene(engine)
  preloader.setStatus('Building the world...')
  debugHud = new DebugHud(
    configuration,
    engineResult.renderingType,
    debugInputLabels,
    initialRenderingResolution,
    runtimeInputLabels,
    mobileDebugInputLabels,
    storage
  )

  if (engineResult.renderingType === 'WebGL') {
    const info = document.createElement('div')
    info.className = 'info-overlay'
    info.textContent = engineResult.fallbackReason === 'unavailable'
      ? 'WebGPU is not available. Using WebGL.'
      : 'WebGPU could not start. Using WebGL.'
    document.body.append(info)
    adjustUIForInspector()
  }

  const observer = new MutationObserver(() => {
    adjustUIForInspector()
  })
  observer.observe(document.body, { childList: true, subtree: true })

  let updateProductionUiLayout = () => undefined
  const synchronizeRenderResolution = () => {
    const snapshot = renderResolutionController.synchronize(
      readRenderViewport(),
      debugPreferences.upscalingMode
    )
    debugHud.setRenderingResolution(snapshot)
    resolutionGrid.setResolution(snapshot.displayResolution)
  }
  const handleResize = () => {
    updateCanvasPresentation()
    synchronizeRenderResolution()
    const canvasRect = canvas.getBoundingClientRect()
    resolutionGrid.setLayout({
      height: canvasRect.height,
      left: canvasRect.left,
      top: canvasRect.top,
      width: canvasRect.width
    })
    updateProductionUiLayout()
    adjustUIForInspector()
  }
  const resizeObserver = new ResizeObserver(handleResize)
  resizeObserver.observe(canvas)

  debugHud.setVisible(debugPreferences.hudVisible)
  debugHud.setTargetFPS(targetFramerate)
  window.addEventListener('resize', handleResize)
  window.addEventListener('orientationchange', handleResize)
  document.addEventListener('fullscreenchange', handleResize)
  portraitMobileMedia.addEventListener('change', handleResize)
  const visualViewport = window.visualViewport
  visualViewport?.addEventListener('resize', handleResize)
  visualViewport?.addEventListener('scroll', handleResize)

  let addOrbiter = new AddOrbiterClass(
    scene,
    origin,
    baseSphereDiameter,
    tweens,
    orbiterModel
  )

  const world = await createGameWorld(
    scene,
    import.meta.env.BASE_URL
  )
  const progression = new LevelProgression(levelDefinitions)
  const prototype = world.prototype
  const walkableArea = world.walkableArea
  const zones = world.zones
  const soundManager = new SoundManager()
  const backgroundMusicUrl =
    `${import.meta.env.BASE_URL}assets/audio/music/invincible.ogg`
  const worldClickSoundUrl =
    `${import.meta.env.BASE_URL}assets/audio/sfx/rotate.wav`
  const runtimeUiClickSoundUrl =
    `${import.meta.env.BASE_URL}assets/audio/sfx/rotate.wav`
  if (backgroundMusicEnabled) {
    soundManager.startMusic(
      backgroundMusicUrl,
      backgroundMusicVolume
    )
  }
  const camera = createPrototypeCamera(scene)
  configureRuntimeCamera(camera, prototype.player)
  const playerActions = new PlayerActionController(
    scene,
    prototype.player
  )
  const gameplayActions = createGameplayActions({
    onJump: () => playerActions.jump(),
    onShoot: () => playerActions.shoot()
  })
  const runtimeInput = new RuntimeInputController(
    prototype.player,
    camera,
    window,
    gameplayActions
  )

  const maximumInventorySlotCount = Math.max(
    ...levelDefinitions.flatMap(definition =>
      definition.quests.map(quest => quest.inventorySlotCount)
    )
  )
  const productionHud = new ProductionHud(
    scene,
    progression.activeLevelDefinition.name,
    releaseVersion,
    maximumInventorySlotCount,
    releaseMetadata.downloadSize
  )
  const virtualController = productionHud.addVirtualController({
    actions: gameplayActions,
    movement: {
      label: 'Move',
      onInput: direction => {
        runtimeInput.setPlayerAnalogInput(direction)
      }
    }
  })
  updateProductionUiLayout = () => {
    const canvasRect = canvas.getBoundingClientRect()
    productionHud.updateLayout(
      {
        height: canvasRect.height,
        left: canvasRect.left,
        top: canvasRect.top,
        width: canvasRect.width
      },
      currentUiViewport
    )
  }
  updateProductionUiLayout()
  const score = 0
  const appleUrl =
    `${import.meta.env.BASE_URL}assets/images/inventory/apple.png`
  const apple = { imageUrl: appleUrl }
  let isCompletionActionPending = false
  const getQuestSoundUrl = (sound: string) =>
    `${import.meta.env.BASE_URL}${sound}`
  const startActiveLevel = () => {
    const definition = progression.activeLevelDefinition
    const questDefinition = progression.activeQuestDefinition
    const spawn = definition.playerSpawn
    prototype.player.position.set(spawn.x, spawn.y, spawn.z)
    prototype.player.rotation.y = 0
    playerActions.reset(spawn.y)
    walkableArea.constrainPlayer()

    for (const zone of zones) {
      zone.update(prototype.player.position, !playerActions.isJumping)
    }

    productionHud.setLevel(definition.name)
    productionHud.setInventorySlotCount(
      questDefinition.inventorySlotCount
    )
    productionHud.setInventory(createInventorySlots(
      apple,
      progression.quest.appleCount,
      questDefinition.inventorySlotCount
    ))
    productionHud.hidePrompt()
    runtimeInput.setEnabled(true)
    virtualController.setEnabled(true)
    camera.attachControl(canvas, true)
    isCompletionActionPending = false
    const questBeginningSoundUrl = getQuestSoundUrl(
      progression.activeQuestDefinition.beginningSound
    )
    soundManager.playEffect(questBeginningSoundUrl, clickSoundVolume)
  }
  productionHud.setScore(score)
  startActiveLevel()
  world.appleZone.onEnteredObservable.add(() => {
    const collection = progression.collectApple()

    if (!collection.accepted) {
      return
    }

    const questUpdateSoundUrl = getQuestSoundUrl(
      progression.activeQuestDefinition.updateSound
    )
    soundManager.playEffect(questUpdateSoundUrl, clickSoundVolume)
    productionHud.setInventory(createInventorySlots(
      apple,
      progression.quest.appleCount,
      progression.activeQuestDefinition.inventorySlotCount
    ))

    if (!collection.justCompleted) {
      return
    }

    runtimeInput.setEnabled(false)
    virtualController.setEnabled(false)
    camera.detachControl()
    const isFinalLevel = progression.isFinalLevel
    productionHud.showPrompt({
      title: isFinalLevel ? 'Game Complete' : 'Level Complete',
      body: isFinalLevel ? 'Restart Game?' : 'Next Level?',
      buttons: [
        {
          label: 'OK',
          onClick: async () => {
            if (isCompletionActionPending) {
              return
            }

            isCompletionActionPending = true
            await soundManager.playEffectAndWait(
              runtimeUiClickSoundUrl,
              clickSoundVolume
            )

            if (progression.isGameComplete) {
              window.location.reload()
              return
            }

            if (progression.advance()) {
              startActiveLevel()
            } else {
              isCompletionActionPending = false
            }
          }
        }
      ]
    })
  })

  preloader.setStatus('Ready')
  engine.hideLoadingUI()

  const pipeline = addPostProcess(scene, [camera])

  const inputController = addInput(canvas, scene, {
    onClick: () => {
      if (backgroundMusicEnabled) {
        soundManager.resumeMusic()
      }
      soundManager.playEffect(worldClickSoundUrl, clickSoundVolume)
    },
    onFullscreen: toggleFullscreen,
    onHud: toggleDebugHud,
    onInspector: inspectorOpen => {
      if (debugPreferences.inspectorOpen === inspectorOpen) {
        return
      }

      debugPreferences.inspectorOpen = inspectorOpen
      saveDebugPreferences()
    },
    onAntialiasing: () => {
      configuration.antialias = !configuration.antialias
      debugPreferences.antialias = configuration.antialias
      pipeline.fxaaEnabled = configuration.antialias
      debugHud.setConfig()
      saveDebugPreferences()
    },
    onUpscaling: () => {
      debugPreferences.upscalingMode = cycleUpscalingMode(
        debugPreferences.upscalingMode
      )
      synchronizeRenderResolution()
      saveDebugPreferences()
    },
    onFramerate: () => {
      targetFramerateIndex =
        (targetFramerateIndex + 1) % targetFramerates.length
      debugPreferences.targetFramerateIndex = targetFramerateIndex
      targetFramerate = targetFramerates[targetFramerateIndex]
      renderScheduler.setTargetFPS(targetFramerate)
      debugHud.setTargetFPS(targetFramerate)
      saveDebugPreferences()
    },
    onGrid: () => resolutionGrid.toggle(),
    onRestart: () => {
      window.location.reload()
    },
    onResetDefaults: () => {
      resetDebugPreferences(storage)
      Object.assign(debugPreferences, debugPreferenceDefaults)
      configuration.antialias = debugPreferences.antialias
      pipeline.fxaaEnabled = configuration.antialias
      targetFramerateIndex = debugPreferences.targetFramerateIndex
      targetFramerate = targetFramerates[targetFramerateIndex]
      renderScheduler.setTargetFPS(targetFramerate)
      synchronizeRenderResolution()
      debugHud.setVisible(debugPreferences.hudVisible)
      debugHud.setConfig()
      debugHud.setTargetFPS(targetFramerate)
      debugHud.setShortcuts(getDebugInputLabels(debugPreferences))
      resolutionGrid.setVisible(false)
      adjustUIForInspector()
    }
  }, {
    initialInspectorOpen: debugPreferences.inspectorOpen
  })

  const applyDebugPreferences = () => {
    configuration.antialias = debugPreferences.antialias
    pipeline.fxaaEnabled = debugPreferences.antialias
    targetFramerateIndex = debugPreferences.targetFramerateIndex
    targetFramerate = targetFramerates[targetFramerateIndex]
    renderScheduler.setTargetFPS(targetFramerate)
    synchronizeRenderResolution()
    debugHud.setVisible(debugPreferences.hudVisible)
    debugHud.setConfig()
    debugHud.setTargetFPS(targetFramerate)
    debugHud.setShortcuts(getDebugInputLabels(debugPreferences))
  }
  const setMobileFullscreen = async (enabled: boolean) => {
    if (enabled && !document.fullscreenElement) {
      await document.documentElement.requestFullscreen()
    } else if (!enabled && document.fullscreenElement) {
      await document.exitFullscreen()
    }
  }
  const restoreMobileFullscreen = () => {
    const requestFullscreen = async () => {
      if (
        !debugPreferences.mobileModeEnabled ||
        document.fullscreenElement
      ) {
        return
      }

      try {
        await setMobileFullscreen(true)
        window.removeEventListener('pointerdown', requestFullscreen)
      } catch (error) {
        console.warn(
          '[MobileMode] Saved fullscreen request failed:',
          error
        )
      }
    }

    window.addEventListener('pointerdown', requestFullscreen, {
      once: true
    })
    void requestFullscreen()
  }

  if (debugPreferences.mobileModeEnabled) {
    void restoreMobileFullscreen()
  }
  const toggleMobileMode = async () => {
    const enabled = !debugPreferences.mobileModeEnabled
    setMobileModePreference(
      debugPreferences,
      storage,
      enabled
    )
    applyDebugPreferences()

    try {
      await setMobileFullscreen(enabled)
    } catch (error) {
      console.warn('[MobileMode] Fullscreen request failed:', error)
    }

    await inputController.setInspectorOpen(false)
  }
  const threeFingerTap = new ThreeFingerTapController(window, () => {
    void toggleMobileMode()
  })

  let lastOrbiterTime = performance.now()
  let lastInputTime = performance.now()

  const updateOrbiters = (deltaSeconds: number) => {
    for (let index = orbiters.length - 1; index >= 0; index -= 1) {
      if (!orbiters[index].update(deltaSeconds)) {
        orbiters.splice(index, 1)
      }
    }
  }

  scene.physicsEnabled = false
  const physicsStepMs = 1000 / 60
  const maximumPhysicsSteps = 5
  let physicsAccumulatorMs = 0
  let lastPhysicsTime = performance.now()

  const advancePhysics = (now: number) => {
    const elapsedMs = Math.max(0, now - lastPhysicsTime)
    lastPhysicsTime = now
    physicsAccumulatorMs = Math.min(
      physicsAccumulatorMs + elapsedMs,
      physicsStepMs * maximumPhysicsSteps
    )
    let physicsSteps = 0

    while (
      physicsAccumulatorMs >= physicsStepMs &&
      physicsSteps < maximumPhysicsSteps
    ) {
      scene._advancePhysicsEngineStep(physicsStepMs)
      physicsAccumulatorMs -= physicsStepMs
      physicsSteps += 1
    }
  }

  let lastFPSUpdateTime = 0
  let renderedFrames = 0

  engine.runRenderLoop(() => {
    const now = performance.now()
    advancePhysics(now)
    const inputDeltaSeconds = (now - lastInputTime) / 1000
    lastInputTime = now
    runtimeInput.update(inputDeltaSeconds)
    playerActions.update(inputDeltaSeconds)
    walkableArea.constrainPlayer()
    for (const zone of zones) {
      zone.update(prototype.player.position, !playerActions.isJumping)
    }
    const deltaSeconds = (now - lastOrbiterTime) / 1000
    lastOrbiterTime = now
    updateOrbiters(deltaSeconds)

    if (!renderScheduler.shouldRender(now)) {
      return
    }

    scene.render()
    renderedFrames += 1

    if (now - lastFPSUpdateTime >= 1000) {
      const elapsedSeconds = (now - lastFPSUpdateTime) / 1000
      debugHud.setFPS(Math.round(renderedFrames / elapsedSeconds))
      lastFPSUpdateTime = now
      renderedFrames = 0
    }
  })
  handleResize()

  const disposeRuntime = () => {
    threeFingerTap.dispose()
    runtimeInput.dispose()
    playerActions.dispose()
    productionHud.dispose()
    resolutionGrid.dispose()
    resizeObserver.disconnect()
    observer.disconnect()
    window.removeEventListener('resize', handleResize)
    window.removeEventListener('orientationchange', handleResize)
    document.removeEventListener('fullscreenchange', handleResize)
    portraitMobileMedia.removeEventListener('change', handleResize)
    visualViewport?.removeEventListener('resize', handleResize)
    visualViewport?.removeEventListener('scroll', handleResize)
    engine.dispose()
  }
  window.addEventListener('beforeunload', disposeRuntime, {
    once: true
  })

  if (import.meta.hot) {
    import.meta.hot.accept('./addOrbiter.ts', module => {
      if (!module) {
        return
      }

      AddOrbiterClass = module.AddOrbiter
      addOrbiter = new AddOrbiterClass(
        scene,
        origin,
        baseSphereDiameter,
        tweens,
        orbiterModel
      )
      console.info(
        '[HMR] AddOrbiter updated. New orbiters will use the ' +
          'latest factory code.'
      )
    })

    import.meta.hot.accept('../model/orbiterModel.ts', module => {
      if (!module) {
        return
      }

      orbiterModel = new module.OrbiterModel()
      addOrbiter.setModel(orbiterModel)
      console.info(
        '[HMR] OrbiterModel updated. New orbiters will use the ' +
          'latest values.'
      )
    })
  }
}

main().catch(error => {
  console.error('[index.ts] Error in main:', error)
})
