// debugHudLayout.ts - Defines the hardcoded debug HUD corner placement.

export type DebugHudCorner =
  | 'upper-right'
  | 'upper-left'
  | 'lower-left'
  | 'lower-right'

export interface DebugHudCornerPosition {
  top: string
  right: string
  bottom: string
  left: string
  alignItems: 'flex-start' | 'flex-end'
}

// Change this value to move the complete debug HUD panel stack.
export const debugHudCorner: DebugHudCorner = 'lower-right'

export function getDebugHudCornerPosition(
  corner: DebugHudCorner
): DebugHudCornerPosition {
  const isUpper = corner.startsWith('upper')
  const isRight = corner.endsWith('right')

  return {
    top: isUpper ? '10px' : 'auto',
    right: isRight ? '10px' : 'auto',
    bottom: isUpper ? 'auto' : '10px',
    left: isRight ? 'auto' : '10px',
    alignItems: isRight ? 'flex-end' : 'flex-start'
  }
}
