## Why

The prototype has movement, scenery, zones, and an inventory HUD, but those
pieces do not yet form a playable objective. A first level and quest provide a
small complete gameplay loop that can later grow into a sequence of levels.

## What Changes

- Add a level concept named `Level 1` that owns the current ground, centered
  player, existing `GOAL` zone, new `Apple` zone, and ordered quests.
- Add `Quest 1` to `Level 1` with three inventory slots and a target of three
  apples, starting with every slot empty.
- Enlarge the `Apple` zone to 3 by 3 and let it declare the existing tree as
  an optional zone model centered in the zone's background area.
- Award one apple whenever the player enters the `Apple` zone after being
  outside it, then update the inventory HUD.
- Play `levelup.wav` when `Quest 1` begins and `clear.wav` for every accepted
  apple collection.
- Complete the quest when the inventory reaches three apples.
- Show a configurable centered prompt with title `Level Compete`, body
  `Restart game?`, and one interactive button labeled `Ok`.
- Stop gameplay movement after completion while keeping UI controls usable.
- Reload the app on `Ok`, resetting in-memory gameplay state without erasing
  saved debug preferences.
- Give runtime UI a separately declared click sound that currently maps to
  the same `rotate.wav` asset as the world-background click, and play it before
  `Ok` reloads the app.
- Preserve desktop, portrait-mobile, WebGPU, and WebGL fallback behavior.

## Capabilities

### New Capabilities

- `level-quest-gameplay`: Defines the initial level layout, apple-collection
  quest, inventory progress, completion state, and replay behavior.

### Modified Capabilities

None.

## Impact

- Adds focused level and quest state under the Babylon client scripts.
- Composes the existing prototype scene, zone-owned tree model, world zones,
  runtime input controller, sound manager, and production HUD during startup.
- Extends the production HUD with a configurable centered prompt containing a
  title, body, and zero, one, or two buttons. This level configures title
  `Level Compete`, body `Restart game?`, and `Ok` as its only button.
- Adds unit, bootstrap, and browser-visible gameplay coverage.
- Uses existing Babylon.js core and GUI dependencies with no new packages.
