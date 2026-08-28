import type { RenderResolution } from './renderUpscaling'

export type ResolutionGridLayout = {
  height: number
  left: number
  top: number
  width: number
}

export type ResolutionGridModel = {
  horizontalLines: number[]
  midpoint: {
    label: string
    x: number
    y: number
  }
  verticalLines: number[]
}

const gridSpacing = 100
const svgNamespace = 'http://www.w3.org/2000/svg'

function createLinePositions(length: number): number[] {
  const positions: number[] = []

  for (let position = gridSpacing; position < length; position += gridSpacing) {
    positions.push(position)
  }

  return positions
}

function formatCoordinate(value: number): string {
  return Number.isInteger(value) ? `${value}` : value.toFixed(1)
}

export function createResolutionGridModel(
  resolution: RenderResolution
): ResolutionGridModel {
  const x = resolution.width * 0.5
  const y = resolution.height * 0.5

  return {
    horizontalLines: createLinePositions(resolution.height),
    midpoint: {
      label: `x=${formatCoordinate(x)}, y=${formatCoordinate(y)}`,
      x,
      y
    },
    verticalLines: createLinePositions(resolution.width)
  }
}

function normalizeDimension(value: number): number {
  return Number.isFinite(value) ? Math.max(1, Math.floor(value)) : 1
}

function normalizePosition(value: number): number {
  return Number.isFinite(value) ? value : 0
}

export class ResolutionDebugGrid {
  public readonly element: SVGSVGElement

  private isVisible = false
  private layout: ResolutionGridLayout = {
    height: 1,
    left: 0,
    top: 0,
    width: 1
  }
  private resolution: RenderResolution = { height: 1, width: 1 }

  public constructor(
    private readonly documentTarget: Document = document
  ) {
    this.element = documentTarget.createElementNS(
      svgNamespace,
      'svg'
    )
    this.element.id = 'ResolutionDebugGrid'
    this.element.setAttribute('aria-hidden', 'true')
    this.element.setAttribute('preserveAspectRatio', 'none')
    this.element.style.display = 'none'
    this.element.style.pointerEvents = 'none'
    this.element.style.position = 'fixed'
    this.element.style.zIndex = '1000'
    documentTarget.body.appendChild(this.element)
    this.render()
  }

  public dispose(): void {
    this.element.remove()
  }

  public setLayout(layout: ResolutionGridLayout): void {
    this.layout = {
      height: Math.max(0, normalizePosition(layout.height)),
      left: normalizePosition(layout.left),
      top: normalizePosition(layout.top),
      width: Math.max(0, normalizePosition(layout.width))
    }
    this.element.style.height = `${this.layout.height}px`
    this.element.style.left = `${this.layout.left}px`
    this.element.style.top = `${this.layout.top}px`
    this.element.style.width = `${this.layout.width}px`
    this.render()
  }

  public setResolution(resolution: RenderResolution): void {
    this.resolution = {
      height: normalizeDimension(resolution.height),
      width: normalizeDimension(resolution.width)
    }
    this.element.setAttribute(
      'viewBox',
      `0 0 ${this.resolution.width} ${this.resolution.height}`
    )
    this.render()
  }

  public setVisible(visible: boolean): void {
    this.isVisible = visible
    this.element.style.display = visible ? 'block' : 'none'
  }

  public toggle(): boolean {
    this.setVisible(!this.isVisible)
    return this.isVisible
  }

  private createLine(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    midpoint: boolean
  ): SVGLineElement {
    const line = this.documentTarget.createElementNS(
      svgNamespace,
      'line'
    )
    line.setAttribute('x1', `${x1}`)
    line.setAttribute('y1', `${y1}`)
    line.setAttribute('x2', `${x2}`)
    line.setAttribute('y2', `${y2}`)
    line.setAttribute('stroke', '#22c55e')
    line.setAttribute('stroke-opacity', midpoint ? '0.9' : '0.35')
    line.setAttribute('stroke-width', midpoint ? '2' : '1')
    line.setAttribute('vector-effect', 'non-scaling-stroke')
    return line
  }

  private createMidpointLabel(
    model: ResolutionGridModel
  ): SVGTextElement {
    const label = this.documentTarget.createElementNS(
      svgNamespace,
      'text'
    )
    const scale = this.resolution.width /
      Math.max(this.layout.width, 1)
    label.setAttribute('x', `${model.midpoint.x - 24 * scale}`)
    label.setAttribute('y', `${model.midpoint.y - 8 * scale}`)
    label.setAttribute('fill', '#86efac')
    label.setAttribute('font-family', 'monospace')
    label.setAttribute('font-size', `${14 * scale}`)
    label.setAttribute('font-weight', '700')
    label.setAttribute('paint-order', 'stroke')
    label.setAttribute('stroke', 'rgba(0, 0, 0, 0.9)')
    label.setAttribute('stroke-width', `${3 * scale}`)
    label.setAttribute('text-anchor', 'end')
    label.textContent = model.midpoint.label
    return label
  }

  private render(): void {
    const model = createResolutionGridModel(this.resolution)
    const children: SVGElement[] = []

    for (const x of model.verticalLines) {
      if (x !== model.midpoint.x) {
        children.push(this.createLine(
          x,
          0,
          x,
          this.resolution.height,
          false
        ))
      }
    }

    for (const y of model.horizontalLines) {
      if (y !== model.midpoint.y) {
        children.push(this.createLine(
          0,
          y,
          this.resolution.width,
          y,
          false
        ))
      }
    }

    children.push(this.createLine(
      model.midpoint.x,
      0,
      model.midpoint.x,
      this.resolution.height,
      true
    ))
    children.push(this.createLine(
      0,
      model.midpoint.y,
      this.resolution.width,
      model.midpoint.y,
      true
    ))
    children.push(this.createMidpointLabel(model))
    this.element.replaceChildren(...children)
  }
}
