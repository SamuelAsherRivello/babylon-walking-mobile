export type GameplayActionId = 'jump' | 'shoot'

export type GameplayActionDefinition = {
  id: GameplayActionId
  keyCode: string
  label: string
  onPressed: () => void
  shortcut: string
}

export type GameplayActionCallbacks = {
  onJump: () => void
  onShoot: () => void
}

const gameplayActionMetadata = [
  {
    id: 'jump',
    keyCode: 'KeyC',
    label: 'Jump',
    shortcut: 'C'
  },
  {
    id: 'shoot',
    keyCode: 'KeyV',
    label: 'Shoot',
    shortcut: 'V'
  }
] as const

export const gameplayActionInputLabels = gameplayActionMetadata.map(
  action => `${action.shortcut} = ${action.label}`
)

export function createGameplayActions(
  callbacks: GameplayActionCallbacks
): readonly GameplayActionDefinition[] {
  return gameplayActionMetadata.map(action => ({
    ...action,
    onPressed: action.id === 'jump'
      ? callbacks.onJump
      : callbacks.onShoot
  }))
}
