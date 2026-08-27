import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  createInventorySlots,
  formatHudTitle,
  formatScore
} from '../../client/scripts/productionHudModel'

const readProductionHud = () => readFileSync(
  resolve('src/client/scripts/productionHud.ts'),
  'utf8'
)

describe('production HUD', () => {
  it('formats the title from the current level and quest names', () => {
    expect(formatHudTitle('Level 1', 'Quest 1')).toBe(
      'WalkMobile Level:1 Quest:1'
    )
    expect(formatHudTitle('Level 12', 'Quest 4')).toBe(
      'WalkMobile Level:12 Quest:4'
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

  it('updates the persistent game title between levels', () => {
    const source = readProductionHud()

    expect(source).toContain('private readonly titleText: TextBlock')
    expect(source).toContain('this.titleText = leftGroup.titleText')
    expect(source).toContain('public setTitle(title: string)')
    expect(source).toContain('this.titleText.text = title')
  })

  it('owns one movement joystick on its shared texture', () => {
    const source = readProductionHud()

    expect(source).toContain('public addMovementJoystick(')
    expect(source).toContain('new VirtualMovementJoystick(')
    expect(source).toContain('this.texture')
    expect(source).toContain('this.movementJoystick?.dispose()')
    expect(source.indexOf('this.movementJoystick?.dispose()'))
      .toBeLessThan(source.indexOf('this.texture.dispose()'))
  })

  it('stacks title, score, label, and slots in the upper left', () => {
    const source = readProductionHud()
    const leftGroupStart = source.indexOf(
      'private createLeftGroup(title: string, slotCount: number)'
    )
    const leftGroup = source.slice(leftGroupStart)
    const titleIndex = leftGroup.indexOf("'GameTitle'")
    const scoreIndex = leftGroup.indexOf("'Score'")
    const labelIndex = leftGroup.indexOf("'InventoryLabel'")
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
    expect(source).not.toContain('HORIZONTAL_ALIGNMENT_RIGHT')
    expect(source).not.toContain('leftInPixels = -UI_PADDING')
    expect(leftGroup).toContain(
      "createText('Score', 'Score: 000', LABEL_HEIGHT, 32)"
    )
    expect(titleIndex).toBeGreaterThan(-1)
    expect(scoreIndex).toBeGreaterThan(titleIndex)
    expect(labelIndex).toBeGreaterThan(scoreIndex)
    expect(slotsIndex).toBeGreaterThan(labelIndex)
  })
})
