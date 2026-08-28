## Why

The game currently awards an apple immediately when the player enters the
Apple zone. A reusable in-memory work system is needed so actions can take
time, pause when their conditions stop being true, and resume without losing
progress.

## What Changes

- Add a work manager that tracks active work items in RAM only.
- Give each work item a stable identifier and configurable completion target.
- Advance work by active frame time while its condition is satisfied.
- Pause work when the player leaves the relevant zone and resume on return.
- Configure Apple-zone work to complete after one second of active time.
- Award one apple only when that work item completes.
- Preserve the existing one-, two-, and three-apple level targets.

## Capabilities

### New Capabilities

- `work-manager`: In-memory, frame-driven, pause/resume-able work state.

### Modified Capabilities

- `level-quest-gameplay`: Replace immediate Apple-zone awards with completed
  work while preserving level targets, inventory, and completion behavior.

## Impact

This affects the gameplay controller, Apple-zone integration, quest tests, and
new focused work-manager model code. It adds no dependencies, persistence,
network behavior, or storage migrations. The behavior must remain usable on
desktop and portrait mobile browsers under both WebGPU and WebGL fallback.
