## 1. Gameplay Model Tests

- [x] 1.1 Add failing quest tests for zero initial apples, one award per
  accepted entry, completion on the fifth entry, and the completion latch;
  verify the focused test fails before implementation.
- [x] 1.2 Add failing inventory-model tests for zero through five displayed
  apples and safe count clamping; verify the focused HUD-model test fails
  before implementation.

## 2. Level And UI Contract Tests

- [x] 2.1 Add failing level tests for the centered player, existing tree and
  `GOAL` layout, new `Apple` zone, and five-apple quest target; verify the
  focused level test fails before implementation.
- [x] 2.2 Add failing production-HUD tests for a hidden configurable prompt,
  title and body text, zero to two interactive buttons, callbacks, and
  responsive Babylon GUI alignment; verify the focused HUD test fails.
- [x] 2.3 Add failing runtime-input tests for disabling held and pending player
  and camera motion; verify the focused input test fails before implementation.
- [x] 2.4 Add failing bootstrap assertions for Apple-zone awards, HUD updates,
  one-time completion, input shutdown, camera detachment, and reload-only
  `Ok` action; verify the focused bootstrap test fails before integration.

## 3. Gameplay And Level Implementation

- [x] 3.1 Implement the pure five-entry apple quest model and verify all
  focused quest tests pass.
- [x] 3.2 Extend the inventory helper to derive five slots from an apple count
  and verify focused inventory-model tests pass.
- [x] 3.3 Add the typed first-level definition and asynchronous runtime
  composition for the prototype scene, existing tree and `GOAL` zone, new
  `Apple` zone, and quest; verify focused level tests pass.

## 4. Completion And Input Implementation

- [x] 4.1 Add runtime-input enabled state that clears active motion when
  disabled and verify focused input tests pass.
- [x] 4.2 Add the configurable centered Babylon GUI prompt and interactive
  button callbacks to `ProductionHud`; verify focused HUD tests pass.
- [x] 4.3 Integrate Apple-zone awards, derived inventory updates, latched
  completion, runtime-input disabling, camera detachment, and application
  reload; verify focused bootstrap and gameplay tests pass.

## 5. Verification

- [x] 5.1 Run TypeScript checking, the complete unit suite, and the production
  build; verify every command passes.
- [x] 5.2 Validate authored files at 80 characters or fewer and run strict
  OpenSpec validation; verify both checks pass.
- [x] 5.3 In a real desktop browser, collect five apples through five distinct
  entries, verify `GOAL` remains unchanged, verify gameplay input stops while
  UI remains interactive, click `Ok`, and confirm clean gameplay state with
  saved debug preferences preserved.
- [x] 5.4 In a portrait mobile viewport, verify the level, inventory, centered
  completion prompt, touch `Ok` control, and resize alignment remain usable.

## 6. Revised Level And Audio Tests

- [x] 6.1 Add failing level-definition tests for the exact names `Level 1` and
  `Quest 1`, an ordered quest collection, three inventory slots, and a
  three-apple target.
- [x] 6.2 Add failing layout tests for an Apple zone with 3 by 3 dimensions,
  its optional tree-model mapping, exact centered model placement, and no
  model on `GOAL`.
- [x] 6.3 Add failing sound integration tests for one `levelup.wav` request at
  quest start and one `clear.wav` playback per accepted apple collection.
- [x] 6.4 Add failing runtime UI sound tests proving its click URL is declared
  separately from the world click URL, both currently map to `rotate.wav`, and
  reload follows audible playback or its bounded failure fallback.

## 7. Revised Level And Audio Implementation

- [x] 7.1 Declare `Level 1` with an ordered quests collection containing
  `Quest 1`; configure that quest for three slots and three required apples.
- [x] 7.2 Add an optional zone-model declaration, map the first model kind to
  the existing tree, enlarge Apple to 3 by 3, and center its tree exactly.
- [x] 7.3 Declare and integrate the `levelup.wav` quest-beginning sound and
  `clear.wav` accepted-apple update sound.
- [x] 7.4 Declare the runtime UI click independently from the world click,
  initially map both to `rotate.wav`, and finish its playback before replay.

## 8. Revised Verification

- [x] 8.1 Run focused tests, TypeScript checking, the complete test suite, and
  the production build; verify every command passes.
- [x] 8.2 Validate authored files at 80 characters or fewer and run strict
  OpenSpec validation; verify both checks pass.
- [x] 8.3 In a real browser, verify the 3 by 3 Apple zone, its centered tree,
  three-slot quest loop, beginning and update sounds, and audible `Ok` click
  before a clean restart.
