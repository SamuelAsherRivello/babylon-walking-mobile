// productionHudModel.ts - Pure state helpers for the production HUD.
export interface InventoryItem {
  imageUrl: string
}

export type InventorySlots = ReadonlyArray<InventoryItem | null>

export type HeaderItem = {
  title: string
  unit?: string
  value: string
}

export type HeaderState = {
  address: HeaderItem
  balance: HeaderItem
  status: HeaderItem
}

export function createDefaultHeaderState(): HeaderState {
  return {
    address: {
      title: 'Address',
      value: 'Signed out'
    },
    balance: {
      title: 'Balance',
      unit: 'sats',
      value: '0'
    },
    status: {
      title: 'Status',
      value: 'Offline'
    }
  }
}

function readLevelNumber(levelName: string): number {
  const match = levelName.match(/\d+$/)

  return match ? Number.parseInt(match[0], 10) : 0
}

export function createInventorySlots(
  item: InventoryItem | null = null,
  itemCount = item ? 1 : 0,
  slotCount = 5
): InventorySlots {
  const normalizedSlots = Number.isFinite(slotCount)
    ? Math.max(0, Math.floor(slotCount))
    : 0
  const normalizedItems = Number.isFinite(itemCount)
    ? Math.min(normalizedSlots, Math.max(0, Math.floor(itemCount)))
    : 0

  return Array.from(
    { length: normalizedSlots },
    (_, index) => item && index < normalizedItems ? item : null
  )
}

export function formatScore(score: number): string {
  const normalizedScore = Math.max(0, Math.floor(score))

  return normalizedScore.toString().padStart(3, '0')
}

export function formatHudLevelScore(
  levelName: string,
  score: number
): string {
  const level = formatScore(readLevelNumber(levelName))

  return `Level: ${level} Score: ${formatScore(score)}`
}
