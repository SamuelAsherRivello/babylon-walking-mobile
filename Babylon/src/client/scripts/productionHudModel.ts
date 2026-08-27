// productionHudModel.ts - Pure state helpers for the production HUD.
export interface InventoryItem {
  imageUrl: string
}

export type InventorySlots = ReadonlyArray<InventoryItem | null>

function formatProgressName(name: string) {
  return name.replace(/\s+(?=\d+$)/, ':')
}

export function formatHudTitle(levelName: string, questName: string) {
  const level = formatProgressName(levelName)
  const quest = formatProgressName(questName)

  return `WalkMobile ${level} ${quest}`
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

export function formatScore(score: number) {
  const normalizedScore = Math.max(0, Math.floor(score))

  return normalizedScore.toString().padStart(3, '0')
}
