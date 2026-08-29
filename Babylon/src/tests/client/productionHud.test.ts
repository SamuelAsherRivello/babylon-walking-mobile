import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  createInventorySlots,
  formatHudLevelScore,
  formatScore
} from '../../client/scripts/model/productionHudModel'

const readProductionHud = () => readFileSync(
      resolve('src/client/scripts/view/2d/productionHud.ts'),
  'utf8'
)

describe('production HUD', () => {
  it('formats the level and score together with three-digit padding', () => {
    expect(formatHudLevelScore('Level 1', 0)).toBe(
      'Level: 001 Score: 000'
    )
    expect(formatHudLevelScore('Level 12', 8)).toBe(
      'Level: 012 Score: 008'
    )
    expect(formatHudLevelScore('Level 1250', 1250)).toBe(
      'Level: 1250 Score: 1250'
    )
  })

  it('formats scores with a minimum of three digits', () => {
    expect(formatScore(0)).toBe('000')
    expect(formatScore(8)).toBe('008')
    expect(formatScore(1250)).toBe('1250')
  })

  it('creates exactly five inventory slots', () => {
    const apple = { imageUrl: '/assets/images/inventory/apple.png' }

    expect(createInventorySlots(apple)).toEqual([
      apple,
      null,
      null,
      null,
      null
    ])
  })

  it('derives inventory contents and capacity from supplied counts', () => {
    const apple = { imageUrl: '/assets/images/inventory/apple.png' }

    for (let count = 0; count <= 5; count += 1) {
      const inventory = createInventorySlots(apple, count, 5)

      expect(inventory).toHaveLength(5)
      expect(inventory.filter(Boolean)).toHaveLength(count)
    }

    expect(createInventorySlots(apple, -4, 3)).toEqual([
      null,
      null,
      null
    ])
    expect(createInventorySlots(apple, 99, 3)).toEqual([
      apple,
      apple,
      apple
    ])
  })

  it('provides a hidden configurable centered prompt', () => {
    const source = readProductionHud()

    expect(source).toContain('export type PromptOptions')
    expect(source).toContain('buttons.length > 2')
    expect(source).toContain("new Rectangle('Prompt')")
    expect(source).toContain('prompt.isVisible = false')
    expect(source).toContain('HORIZONTAL_ALIGNMENT_CENTER')
    expect(source).toContain('VERTICAL_ALIGNMENT_CENTER')
    expect(source).toContain('public showPrompt(options: PromptOptions)')
    expect(source).toContain('button.fontSizeInPixels = 32')
    expect(source).toContain('button.onPointerClickObservable.add(')
  })

  it('updates level state without replacing the title or score', () => {
    const source = readProductionHud()

    expect(source).toContain('private levelName: string')
    expect(source).toContain('private score = 0')
    expect(source).toContain('public setLevel(levelName: string)')
    expect(source).toContain('this.levelName = levelName')
    expect(source).toContain('this.refreshLevelScore()')
    expect(source).toContain("'Babylon Walking'")
  })

  it('shows only the active level inventory slots', () => {
    const source = readProductionHud()

    expect(source).toContain(
      'public setInventorySlotCount(slotCount: number)'
    )
    expect(source).toContain('slot.isVisible = index < visibleSlotCount')
    expect(source).toContain(
      'slot.paddingRightInPixels = index < visibleSlotCount - 1'
    )
  })

  it('owns one complete virtual controller on its shared texture', () => {
    const source = readProductionHud()

    expect(source).toContain('public addVirtualController(')
    expect(source).toContain('new VirtualController(')
    expect(source).toContain('this.texture')
    expect(source).toContain('this.virtualController?.dispose()')
    expect(source.indexOf('this.virtualController?.dispose()'))
      .toBeLessThan(source.indexOf('this.texture.dispose()'))
  })

  it('uses one ordered upper-left HUD stack', () => {
    const source = readProductionHud()
    const leftGroupStart = source.indexOf(
      'private createLeftGroup('
    )
    const leftGroupEnd = source.indexOf(
      'private createPrompt()',
      leftGroupStart
    )
    const leftGroup = source.slice(leftGroupStart, leftGroupEnd)
    const versionIndex = leftGroup.indexOf("'ReleaseVersion'")
    const titleIndex = leftGroup.indexOf("'GameTitle'")
    const levelScoreIndex = leftGroup.indexOf("'LevelScore'")
    const slotsIndex = leftGroup.indexOf(
      "new StackPanel('InventorySlots')"
    )

    expect(source).toContain('export const UI_PADDING = 50')
    expect(source).toContain('HORIZONTAL_ALIGNMENT_LEFT')
    expect(source).toContain('VERTICAL_ALIGNMENT_TOP')
    expect(source).toContain('leftInPixels = UI_PADDING')
    expect(source).toContain('topInPixels = UI_PADDING')
    expect(source).toContain('isHitTestVisible = false')
    expect(source).not.toContain('getRenderWidth')
    expect(source).not.toContain('private readonly rightGroup')
    expect(leftGroup).not.toContain("'InventoryLabel'")
    expect(leftGroup).not.toContain("'Inventory:'")
    expect(leftGroup).not.toContain('Quest')
    expect(source).toContain('const VERSION_FONT_SIZE = 24')
    expect(source).toContain(
      'downloadSize ? `${version} ${downloadSize}` : version'
    )
    expect(leftGroup).toContain('textWrapping = false')
    expect(versionIndex).toBeGreaterThan(-1)
    expect(titleIndex).toBeGreaterThan(versionIndex)
    expect(levelScoreIndex).toBeGreaterThan(titleIndex)
    expect(slotsIndex).toBeGreaterThan(levelScoreIndex)
  })

  it('applies one visible layout to the HUD, prompt, and controller', () => {
    const source = readProductionHud()

    expect(source).toContain('private readonly leftGroup: StackPanel')
    expect(source).not.toContain('private readonly rightGroup: StackPanel')
    expect(source).toContain('public updateLayout(')
    expect(source).toContain('calculateProductionUiLayout(')
    expect(source).toContain(
      'this.leftGroup.leftInPixels = layout.left + UI_PADDING'
    )
    expect(source).toContain(
      'this.leftGroup.topInPixels = layout.top + UI_PADDING'
    )
    expect(source).toContain('this.prompt.leftInPixels = layout.centerX')
    expect(source).toContain('this.prompt.topInPixels = layout.centerY')
    expect(source).toContain('this.virtualController?.updateLayout(layout)')
  })

  it('uses the shared production text style for the score', () => {
    const source = readProductionHud()

    expect(source).toContain("from './productionTextStyle'")
    expect(source).toContain('PRODUCTION_LABEL_FONT_SIZE')
    expect(source).toContain('PRODUCTION_LABEL_HEIGHT')
    expect(source).toContain('applyProductionTextStyle(')
  })

  it('disposes the ordered group through the shared texture', () => {
    const source = readProductionHud()

    expect(source).toContain('this.texture.addControl(this.leftGroup)')
    expect(source).toContain('this.texture.dispose()')
    expect(source).not.toContain('this.leftGroup.dispose()')
  })
})
