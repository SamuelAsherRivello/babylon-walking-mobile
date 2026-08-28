export type WorkDefinition = {
  endValue: number
  rate?: number
  startValue: number
}

export type WorkSnapshot = {
  completed: boolean
  justCompleted: boolean
  value: number
}

export type WorkEvent = {
  id: string
  snapshot: WorkSnapshot
}

type WorkState = WorkDefinition & {
  value: number
}

export class WorkManager {
  public readonly onStartObservable = new Observable<WorkEvent>()
  public readonly onUpdateObservable = new Observable<WorkEvent>()
  public readonly onCompleteObservable = new Observable<WorkEvent>()
  private readonly work = new Map<string, WorkState>()

  public start(id: string, definition: WorkDefinition): WorkSnapshot {
    const existing = this.work.get(id)
    if (existing) {
      return this.snapshot(existing, false)
    }

    if (definition.endValue <= definition.startValue) {
      throw new RangeError('endValue must exceed startValue')
    }
    if (!definition.rate || definition.rate <= 0) {
      throw new RangeError('rate must be positive')
    }

    const state = { ...definition, value: definition.startValue }
    this.work.set(id, state)
    const snapshot = this.snapshot(state, false)
    this.onStartObservable.notifyObservers({ id, snapshot })
    return snapshot
  }

  public update(
    id: string,
    deltaSeconds: number,
    isActive: boolean
  ): WorkSnapshot | undefined {
    const state = this.work.get(id)
    if (!state) {
      return undefined
    }

    if (state.value >= state.endValue) {
      return this.snapshot(state, false)
    }
    if (isActive) {
      const delta = Math.max(0, deltaSeconds)
      state.value = Math.min(
        state.endValue,
        state.value + delta * (state.rate || 0)
      )
    }

    const justCompleted = state.value >= state.endValue
    const snapshot = this.snapshot(state, justCompleted)
    if (isActive) {
      this.onUpdateObservable.notifyObservers({ id, snapshot })
    }
    if (justCompleted) {
      this.onCompleteObservable.notifyObservers({ id, snapshot })
    }
    return snapshot
  }

  public clear(id: string): void {
    this.work.delete(id)
  }

  public dispose(): void {
    this.onStartObservable.clear()
    this.onUpdateObservable.clear()
    this.onCompleteObservable.clear()
  }

  private snapshot(
    state: WorkState,
    justCompleted: boolean
  ): WorkSnapshot {
    return {
      completed: state.value >= state.endValue,
      justCompleted,
      value: state.value
    }
  }
}
import { Observable } from '@babylonjs/core'
