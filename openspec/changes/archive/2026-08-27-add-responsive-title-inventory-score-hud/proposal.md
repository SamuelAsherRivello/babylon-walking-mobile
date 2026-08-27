## Why

The game needs a permanent player-facing HUD that can evolve independently
from its optional development diagnostics. The initial HUD must expose the
game identity, inventory, and score while remaining anchored correctly when
the game frame changes size or aspect ratio.

## What Changes

- Add an always-present production HUD rendered with Babylon GUI.
- Anchor title and inventory controls to the upper-left game-frame corner.
- Anchor a zero-padded score display to the upper-right game-frame corner.
- Use one global `UI_PADDING` value, initially 50 design pixels, for the
  horizontal and vertical corner insets.
- Present five inventory slots with an apple PNG in the first slot and four
  empty slots in the initial demonstration state.
- Provide score and inventory update methods backed by dynamic state.
- Separate production HUD ownership from the existing optional HTML debug HUD
  while preserving the current debug visibility preference and toggle.

## Capabilities

### New Capabilities

- `production-hud`: Defines the permanent, responsive title, inventory, and
  score presentation and its separation from development diagnostics.

### Modified Capabilities

None.

## Impact

- Affects Babylon client startup and HUD organization.
- Adds production HUD code and a transparent apple PNG under public assets.
- Refactors the existing HTML HUD into a dedicated debug HUD owner without
  changing its behavior.
- Uses the already-installed `@babylonjs/gui` package; no new dependency is
  required.
