## Context

The runtime currently creates one first-level definition, one pure
three-apple quest, one shared world, and one HUD. Its completion callback
disables gameplay, shows a restart prompt, and reloads the page. The existing
world zone implementation already guarantees that a zone configured with
`isEnabled: false` stays at its default color and emits no transition events.
See `proposal.md` and the level-quest gameplay delta for the new behavior.

## Goals / Non-Goals

**Goals:**

- Keep level sequencing independent from Babylon.js rendering objects.
- Reuse the identical world layout and its resources across all three levels.
- Make every transition reset gameplay state as one coordinated operation.
- Preserve mouse, keyboard, and touch behavior across prompts and transitions.

**Non-Goals:**

- Persist the current level across browser loads.
- Add level selection, branching quests, save data, or additional quest types.
- Change movement tuning, camera orientation, score behavior, or debug data.
- Add assets, packages, or a second tree or Apple zone.

## Decisions

### Represent progression as ordered pure definitions

Declare three ordered level definitions. Each definition contains its matching
level and quest names, an apple target and visible inventory capacity equal to
its level number, and the existing quest sound declarations. A focused pure
progression model owns the current index and current `AppleCollectionQuest`.
It exposes the active definition, accepts apple collection, and advances only
after the active quest completes.

Duplicating three Babylon.js scenes was rejected because their world layouts
are identical. Encoding the sequence as nested conditionals in bootstrap was
rejected because it would mix gameplay state with rendering and UI effects.

### Create one shared world layout

Replace the first-level-only world boundary with a shared game-world creation
operation. It creates the existing ground, player, camera dependencies, START
zone, Apple zone, and tree once. START is centered at `(0, 0, 0)`, titled
`START`, and configured with `isEnabled: false`. Apple and its centered tree
are placed at `(0, 0, 7)`. On the 20-by-20 ground, the 3-by-3 Apple zone then
ends at positive Z 8.5 and leaves a 1.5-unit margin to the edge.

Moving only the tree was rejected because collection should remain visually
associated with the Apple zone. Recreating the world on every level was
rejected because it adds resource disposal and loading churn without changing
what the player sees.

### Keep one permanent Apple-zone subscription

Subscribe to Apple entry once and route every accepted entry to the current
progression state. The callback reads the active definition when updating
inventory, sound, and completion UI. Advancing replaces only the pure quest
state, so no observable is duplicated and no stale level closure remains.

Adding and removing one observer per level was rejected because missed cleanup
could award multiple apples after advancement.

### Reset level state through one runtime transition

A shared level-start operation hides the prompt, returns the player to
`(0, 0.5, 0)`, clears inventory, updates the HUD title, requests the active
quest beginning sound, enables keyboard and analog movement, and attaches
camera control to the existing canvas. It also synchronizes zone occupancy so
the player cannot carry an inside-Apple transition into the next quest.

The production HUD creates the maximum of three inventory slot controls once.
It gains explicit title and active-slot-count update operations. At level
start, it clears every slot, shows the first one, two, or three controls, and
hides controls above the active capacity. This provides level-specific visual
capacity without rebuilding or disposing GUI controls during progression.

### Use separate non-final and final completion actions

The completion handler always disables runtime input and the movement
joystick, detaches camera controls, and shows the appropriate one-button
prompt. Level 1 and Level 2 `OK` actions await the runtime UI click, advance the
pure progression state, and invoke the shared level-start operation without a
page reload. Level 3 `OK` awaits the same click and then reloads the page, which
deterministically reconstructs Level 1 while preserving debug preferences.

Keeping reload for intermediate levels was rejected because in-memory level
state intentionally starts from Level 1 after every page load. Keeping input
active behind a prompt was rejected because it permits accidental movement
during an explicit transition decision.

### Preserve responsive HUD and resource ownership

The existing Babylon GUI prompt remains centered in the fullscreen texture,
so mouse and touch activation and viewport-resize alignment retain the current
behavior. The shared world, zones, tree, and GUI are created once and remain
owned by their existing runtime owners. The three maximum inventory controls
are also created once. This change creates no additional Babylon.js resources
that need per-level disposal.

## Risks / Trade-offs

- [The Apple zone is too close to the ground edge] -> Keep its full 3-by-3
  area inside the plane and verify the remaining margin in a browser.
- [A stale Apple inside-state blocks or grants collection] -> Reset the player
  and synchronize zone occupancy before gameplay resumes.
- [Input stays disabled after advancement] -> Restore runtime, joystick, and
  camera input together in the shared level-start operation.
- [Repeated button activation advances twice] -> Latch completion and prevent
  another transition while the asynchronous click action is pending.
- [HUD state drifts from progression] -> Derive its title and inventory from
  the active definition and active quest at every level start and award.
- [A hidden slot retains an apple] -> Clear all three controls before applying
  the active capacity and populate only visible slots from current quest state.
- [Browser autoplay blocks a quest sound] -> Preserve the existing non-blocking
  sound-manager failure behavior.

## Migration Plan

1. Add failing pure-state and definition tests for three-level progression.
2. Add failing layout and bootstrap tests for START, Apple placement, prompts,
   inventory capacity, transitions, input restoration, and restart.
3. Generalize the level world, add the progression state, and update the HUD.
4. Connect the runtime transition flow and sound behavior.
5. Run focused tests, the full suite, TypeScript checks, production build,
   line-length validation, and real-browser desktop and portrait checks.

Rollback consists of removing the progression integration and restoring the
single first-level definition and final reload callback. No stored gameplay
data or dependency migration is involved.
