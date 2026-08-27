import * as BABYLON from '@babylonjs/core'

// addInput.ts - Handles mouse click input and keyboard shortcuts.

type InputActions = {
  onClick?: () => void
  onFullscreen?: () => Promise<void> | void
  onHud?: () => void
  onInspector?: (inspectorOpen: boolean) => void
  onAntialiasing?: () => void
  onUpscaling?: () => void
  onFramerate?: () => void
  onRestart?: () => void
  onResetDefaults?: () => void
}

type InputOptions = {
  initialInspectorOpen?: boolean
}

function updateTextElementPosition(inspectorOpen: boolean) {
  const inspectorWidth = 310

  document.querySelectorAll('.TextElement').forEach(el => {
    const textElement = el as HTMLElement
    textElement.style.right = inspectorOpen
      ? `${inspectorWidth}px`
      : '10px'
  })
}

export function addInput(
  canvas: HTMLCanvasElement,
  scene: BABYLON.Scene,
  actions: InputActions = {},
  options: InputOptions = {}
) {
  let setInspectorOpen: ((inspectorOpen: boolean) => Promise<void>) | undefined

  canvas.addEventListener('click', (event: MouseEvent) => {
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    console.log(`Clicked at: (${x}, ${y})`)
    actions.onClick?.()
  })

  window.addEventListener('keydown', async ({ code, key }) => {
    const shortcut = code === 'KeyF' ? 'f' : key.toLowerCase()

    if (shortcut === 'f') {
      try {
        await actions.onFullscreen?.()
      } catch (error) {
        console.error('[addInput.ts] Fullscreen toggle failed:', error)
      }
    }

    if (shortcut === '1') {
      actions.onHud?.()
    }

    if (shortcut === '3') {
      actions.onAntialiasing?.()
    }

    if (shortcut === '4') {
      actions.onUpscaling?.()
    }

    if (shortcut === '5') {
      actions.onFramerate?.()
    }

    if (shortcut === '6') {
      actions.onResetDefaults?.()
      await setInspectorOpen?.(false)
    }

    if (shortcut === '7') {
      actions.onRestart?.()
    }

  })

  if (import.meta.env.MODE === 'development') {
    let inspectorReady = false
    let inspectorOpen = options.initialInspectorOpen ?? false

    const updateInspectorOpen = async (nextInspectorOpen: boolean) => {
      if (!nextInspectorOpen && !inspectorReady) {
        inspectorOpen = false
        updateTextElementPosition(false)
        actions.onInspector?.(false)
        return
      }

      if (!inspectorReady) {
        await import('@babylonjs/core/Debug/debugLayer')
        await import('@babylonjs/inspector')
        inspectorReady = true
      }

      inspectorOpen = nextInspectorOpen
      updateTextElementPosition(inspectorOpen)

      if (inspectorOpen) {
        if (scene.debugLayer && typeof scene.debugLayer.show === 'function') {
          scene.debugLayer.show()
        } else {
          console.error(
            'Babylon.js Inspector is not available or not attached ' +
              'to the scene.'
          )
        }
      } else {
        if (scene.debugLayer && typeof scene.debugLayer.hide === 'function') {
          scene.debugLayer.hide()
        }
      }

      actions.onInspector?.(inspectorOpen)
    }
    setInspectorOpen = updateInspectorOpen

    window.addEventListener('keydown', async ({ key }) => {
      if (key !== '2') {
        return
      }

      await updateInspectorOpen(!inspectorOpen)
    })

    if (inspectorOpen) {
      void updateInspectorOpen(true)
    }
  }

  return {
    setInspectorOpen: async (inspectorOpen: boolean) => {
      await setInspectorOpen?.(inspectorOpen)
    }
  }
}
