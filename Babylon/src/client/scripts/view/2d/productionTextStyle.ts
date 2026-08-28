import { Control, type TextBlock } from '@babylonjs/gui'

export const PRODUCTION_TEXT_COLOR = '#fff7dc'
export const PRODUCTION_TEXT_OUTLINE_COLOR = '#261b17'
export const PRODUCTION_LABEL_FONT_SIZE = 32
export const PRODUCTION_LABEL_HEIGHT = 48

export type ProductionTextStyleOptions = {
  fontSize: number
  height: number
  horizontalAlignment?: number
}

export function applyProductionTextStyle(
  control: TextBlock,
  options: ProductionTextStyleOptions
): TextBlock {
  control.heightInPixels = options.height
  control.color = PRODUCTION_TEXT_COLOR
  control.fontFamily = 'Arial, sans-serif'
  control.fontSizeInPixels = options.fontSize
  control.fontWeight = '700'
  control.outlineColor = PRODUCTION_TEXT_OUTLINE_COLOR
  control.outlineWidth = 4
  control.textHorizontalAlignment = options.horizontalAlignment ??
    Control.HORIZONTAL_ALIGNMENT_LEFT
  control.isHitTestVisible = false

  return control
}
