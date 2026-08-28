import {
  createGameViewportSnapshot,
  type GameViewportSnapshot
} from '../../model/gameViewport'

export type ProductionUiCanvasRect = {
  height: number
  left: number
  top: number
  width: number
}

export type ProductionUiViewport = {
  height: number
  left?: number
  safeAreaBottom: number
  safeAreaLeft: number
  safeAreaRight: number
  safeAreaTop: number
  top?: number
  width: number
}

export type ProductionUiLayout = {
  bottom: number
  centerX: number
  centerY: number
  left: number
  right: number
  scale: number
  top: number
  visibleHeight: number
  visibleWidth: number
}

const defaultIdealHeight = 1600

function readPixels(value: string): number {
  const pixels = Number.parseFloat(value)

  return Number.isFinite(pixels) ? pixels : 0
}

export function calculateProductionUiLayout(
  canvas: ProductionUiCanvasRect,
  viewport: ProductionUiViewport,
  idealHeight = defaultIdealHeight
): ProductionUiLayout {
  const scale = canvas.height > 0
    ? idealHeight / canvas.height
    : 1
  const canvasRight = canvas.left + canvas.width
  const canvasBottom = canvas.top + canvas.height
  const viewportLeft = (viewport.left ?? 0) + viewport.safeAreaLeft
  const viewportTop = (viewport.top ?? 0) + viewport.safeAreaTop
  const viewportRight = (viewport.left ?? 0) + viewport.width -
    viewport.safeAreaRight
  const viewportBottom = (viewport.top ?? 0) + viewport.height -
    viewport.safeAreaBottom
  const left = Math.max(
    0,
    viewportLeft - canvas.left
  ) * scale
  const right = Math.max(0, canvasRight - viewportRight) * scale
  const top = Math.max(
    0,
    viewportTop - canvas.top
  ) * scale
  const bottom = Math.max(0, canvasBottom - viewportBottom) * scale
  const canvasWidth = Math.max(0, canvas.width * scale)
  const canvasHeight = Math.max(0, canvas.height * scale)

  return {
    bottom,
    centerX: (left - right) * 0.5,
    centerY: (top - bottom) * 0.5,
    left,
    right,
    scale,
    top,
    visibleHeight: Math.max(0, canvasHeight - top - bottom),
    visibleWidth: Math.max(0, canvasWidth - left - right)
  }
}

export function readProductionUiViewport(
  root: Element
): GameViewportSnapshot {
  const style = getComputedStyle(root)
  const visualViewport = window.visualViewport

  return createGameViewportSnapshot(
    {
      innerHeight: window.innerHeight,
      innerWidth: window.innerWidth,
      visualViewport
    },
    {
      bottom: readPixels(
        style.getPropertyValue('--safe-area-inset-bottom')
      ),
      left: readPixels(
        style.getPropertyValue('--safe-area-inset-left')
      ),
      right: readPixels(
        style.getPropertyValue('--safe-area-inset-right')
      ),
      top: readPixels(
        style.getPropertyValue('--safe-area-inset-top')
      )
    }
  )
}
