import { describe, expect, it } from 'vitest'
import {
  ResolutionDebugGrid,
  createResolutionGridModel
} from '../../client/scripts/resolutionDebugGrid'

class FakeElement {
  public readonly attributes = new Map<string, string>()
  public readonly children: FakeElement[] = []
  public readonly style: Record<string, string> = {}
  public removed = false
  public textContent = ''

  public constructor(public readonly tagName: string) {}

  public appendChild(child: FakeElement): FakeElement {
    this.children.push(child)
    return child
  }

  public remove(): void {
    this.removed = true
  }

  public replaceChildren(...children: FakeElement[]): void {
    this.children.splice(0, this.children.length, ...children)
  }

  public setAttribute(name: string, value: string): void {
    this.attributes.set(name, value)
  }
}

class FakeDocument {
  public readonly body = new FakeElement('body')

  public createElementNS(
    _namespace: string,
    tagName: string
  ): FakeElement {
    return new FakeElement(tagName)
  }
}

describe('resolution debug grid', () => {
  it('builds 100-pixel lines and an exact midpoint reference', () => {
    const model = createResolutionGridModel({
      height: 1920,
      width: 1080
    })

    expect(model.verticalLines).toEqual([
      100, 200, 300, 400, 500, 600, 700, 800, 900, 1000
    ])
    expect(model.horizontalLines[0]).toBe(100)
    expect(model.horizontalLines.at(-1)).toBe(1900)
    expect(model.midpoint).toEqual({
      label: 'x=540, y=960',
      x: 540,
      y: 960
    })
  })

  it('owns visibility, layout, pointer behavior, and disposal', () => {
    const documentTarget = new FakeDocument()
    const grid = new ResolutionDebugGrid(
      documentTarget as unknown as Document
    )
    const element = grid.element as unknown as FakeElement

    expect(documentTarget.body.children).toContain(element)
    expect(element.style.display).toBe('none')
    expect(element.style.pointerEvents).toBe('none')
    expect(grid.toggle()).toBe(true)
    expect(element.style.display).toBe('block')

    grid.setResolution({ height: 1920, width: 1080 })
    expect(element.attributes.get('viewBox')).toBe('0 0 1080 1920')
    const label = element.children.find(child => {
      return child.textContent === 'x=540, y=960'
    })
    expect(label?.attributes.get('text-anchor')).toBe('end')

    grid.setLayout({
      height: 960,
      left: 20,
      top: 10,
      width: 540
    })
    expect(element.style.height).toBe('960px')
    expect(element.style.left).toBe('20px')
    expect(element.style.top).toBe('10px')
    expect(element.style.width).toBe('540px')

    grid.dispose()
    expect(element.removed).toBe(true)
  })
})
