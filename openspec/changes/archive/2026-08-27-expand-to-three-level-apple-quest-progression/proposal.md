## Why

The current prototype ends after one three-apple quest and can only restart
through a page reload. A short three-level sequence will turn that loop into
visible progression while keeping every new game deterministic.

## What Changes

- Start every browser load and game restart at `Level 1` and `Quest 1`.
- Replace the interactive `GOAL` zone with a cosmetic `START` zone at the
  world origin. Configure it with `isEnabled: false` so player movement never
  changes its color or emits entry and exit events.
- Move the Apple zone and its centered tree near the positive-Z edge of the
  green ground while preserving the shared layout across all three levels.
- Require one apple in Level 1, two apples in Level 2, and three apples in
  Level 3. Pair those levels with Quest 1, Quest 2, and Quest 3, and show
  exactly one, two, and three inventory slots in those levels respectively.
- After Levels 1 and 2, stop gameplay and show `Level Complete`,
  `Next Level?`, and one `OK` button. Advance in place when it is activated.
- After Level 3, show `Game Complete`, `Restart Game?`, and one `OK` button.
  Restart at Level 1 when it is activated.
- Reset the player to START, clear quest inventory, update the HUD title, and
  restore input whenever a new level begins.
- Preserve existing quest and runtime-UI audio feedback during collection,
  advancement, and restart.
- Preserve behavior on desktop, portrait mobile, WebGPU, and WebGL fallback.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `level-quest-gameplay`: Expand the single-level apple quest into a
  three-level progression with a cosmetic START marker, level advancement,
  and final game restart.

## Impact

- Updates the level definitions, pure quest/progression state, runtime scene
  integration, and level-specific production HUD inventory capacity.
- Updates tests for layout, quest targets, level transitions, prompts, input
  gating, restart behavior, desktop, portrait mobile, WebGPU, and WebGL.
- Uses only existing Babylon.js and test dependencies.
