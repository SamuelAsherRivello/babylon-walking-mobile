import { TextBlock } from '@babylonjs/gui'
import { describe, expect, it } from 'vitest'
import {
  PRODUCTION_LABEL_FONT_SIZE,
  PRODUCTION_LABEL_HEIGHT,
  applyProductionTextStyle
} from '../../client/scripts/productionTextStyle'

describe('production text style', () => {
  it('applies the current score treatment and dimensions', () => {
    const text = new TextBlock('TestLabel', 'Test')

    applyProductionTextStyle(text, {
      fontSize: PRODUCTION_LABEL_FONT_SIZE,
      height: PRODUCTION_LABEL_HEIGHT
    })

    expect(PRODUCTION_LABEL_FONT_SIZE).toBe(32)
    expect(PRODUCTION_LABEL_HEIGHT).toBe(48)
    expect(text.fontFamily).toBe('Arial, sans-serif')
    expect(text.fontWeight).toBe('700')
    expect(text.fontSizeInPixels).toBe(32)
    expect(text.heightInPixels).toBe(48)
    expect(text.color).toBe('#fff7dc')
    expect(text.outlineColor).toBe('#261b17')
    expect(text.outlineWidth).toBe(4)
  })
})
