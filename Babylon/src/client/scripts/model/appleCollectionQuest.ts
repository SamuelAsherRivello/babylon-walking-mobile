export type AppleCollectionResult = {
  accepted: boolean
  appleCount: number
  justCompleted: boolean
}

export class AppleCollectionQuest {
  private collectedApples = 0

  public constructor(
    public readonly targetAppleCount: number
  ) {
    if (
      !Number.isInteger(targetAppleCount) ||
      targetAppleCount <= 0
    ) {
      throw new RangeError('targetAppleCount must be a positive integer')
    }
  }

  public get appleCount(): number {
    return this.collectedApples
  }

  public get isComplete(): boolean {
    return this.collectedApples >= this.targetAppleCount
  }

  public collectApple(): AppleCollectionResult {
    if (this.isComplete) {
      return {
        accepted: false,
        appleCount: this.collectedApples,
        justCompleted: false
      }
    }

    this.collectedApples += 1

    return {
      accepted: true,
      appleCount: this.collectedApples,
      justCompleted: this.isComplete
    }
  }
}
