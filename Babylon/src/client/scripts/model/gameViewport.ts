export const portraitMobileMediaQuery =
  '(orientation: portrait) and (pointer: coarse)'

export type GameSafeArea = {
  bottom: number
  left: number
  right: number
  top: number
}

export type GameViewportSource = {
  innerHeight: number
  innerWidth: number
  visualViewport?: {
    height: number
    offsetLeft: number
    offsetTop: number
    width: number
  } | null
}

export type GameViewportSnapshot = {
  height: number
  left: number
  safeAreaBottom: number
  safeAreaLeft: number
  safeAreaRight: number
  safeAreaTop: number
  top: number
  width: number
}

export type GameCanvasLayout = {
  height: number
  left: number
  top: number
  width: number
}

type GameCanvasTarget = {
  dataset: Record<string, string | undefined>
  style: {
    height: string
    left: string
    top: string
    transform: string
    width: string
  }
}

const gameAspectRatio = 9 / 16

function normalizeNumber(value: number, fallback = 0): number {
  return Number.isFinite(value) ? value : fallback
}

function normalizeDimension(value: number): number {
  return Math.max(0, normalizeNumber(value))
}

export function createGameViewportSnapshot(
  source: GameViewportSource,
  safeArea: GameSafeArea
): GameViewportSnapshot {
  const viewport = source.visualViewport

  return {
    height: normalizeDimension(viewport?.height ?? source.innerHeight),
    left: normalizeNumber(viewport?.offsetLeft ?? 0),
    safeAreaBottom: normalizeDimension(safeArea.bottom),
    safeAreaLeft: normalizeDimension(safeArea.left),
    safeAreaRight: normalizeDimension(safeArea.right),
    safeAreaTop: normalizeDimension(safeArea.top),
    top: normalizeNumber(viewport?.offsetTop ?? 0),
    width: normalizeDimension(viewport?.width ?? source.innerWidth)
  }
}

export function calculateGameCanvasLayout(
  viewport: GameViewportSnapshot,
  coverViewport: boolean
): GameCanvasLayout {
  const height = coverViewport
    ? Math.max(viewport.height, viewport.width / gameAspectRatio)
    : viewport.height
  const width = height * gameAspectRatio

  return {
    height,
    left: viewport.left + (viewport.width - width) * 0.5,
    top: viewport.top + (viewport.height - height) * 0.5,
    width
  }
}

function setStyle(
  target: GameCanvasTarget,
  property: keyof GameCanvasTarget['style'],
  value: string
): boolean {
  if (target.style[property] === value) {
    return false
  }

  target.style[property] = value
  return true
}

export function applyGameCanvasLayout(
  target: GameCanvasTarget,
  layout: GameCanvasLayout,
  coverViewport: boolean
): boolean {
  if (!coverViewport) {
    let changed = false

    changed = setStyle(target, 'height', '') || changed
    changed = setStyle(target, 'left', '') || changed
    changed = setStyle(target, 'top', '') || changed
    changed = setStyle(target, 'transform', '') || changed
    changed = setStyle(target, 'width', '') || changed

    if (target.dataset.viewportPresentation !== undefined) {
      delete target.dataset.viewportPresentation
      changed = true
    }

    return changed
  }

  let changed = false

  changed = setStyle(target, 'height', `${layout.height}px`) || changed
  changed = setStyle(target, 'left', `${layout.left}px`) || changed
  changed = setStyle(target, 'top', `${layout.top}px`) || changed
  changed = setStyle(target, 'transform', 'none') || changed
  changed = setStyle(target, 'width', `${layout.width}px`) || changed

  if (target.dataset.viewportPresentation !== 'cover') {
    target.dataset.viewportPresentation = 'cover'
    changed = true
  }

  return changed
}
