import { TransformNode, type Scene } from '@babylonjs/core'

export interface ClassTemplateOptions {
  name: string
}

/**
 * Lightweight pattern for a class that owns Babylon.js resources.
 */
export class ClassTemplate {
  public readonly root: TransformNode

  public constructor(
    scene: Scene,
    options: ClassTemplateOptions
  ) {
    this.root = new TransformNode(options.name, scene)
  }

  public dispose(): void {
    this.root.dispose()
  }
}
