## 1. Test-First Progression Coverage

- [x] 1.1 Add failing unit tests for three ordered level definitions, their
  one/two/three apple targets, initial Level 1 state, guarded advancement, and
  final completion; verify the focused progression test fails for the missing
  behavior.
- [x] 1.2 Update level-layout tests for the disabled START zone at the origin
  and the 3-by-3 Apple zone and tree at `(0, 0, 7)`; verify the focused level
  test fails against the current GOAL layout.
- [x] 1.3 Update HUD and bootstrap tests for title changes, both completion
  prompts, in-place advancement, input restoration, and final reload; verify
  the focused tests fail before production changes.

## 2. Pure State And Shared World

- [x] 2.1 Implement the three level definitions and pure progression state,
  including completion latching and guarded advancement; verify the focused
  progression tests pass.
- [x] 2.2 Generalize the first-level world into the shared layout, configure
  START with `isEnabled: false`, and move Apple/tree to positive Z 7; verify
  the focused level and zone tests pass.

## 3. HUD And Runtime Integration

- [x] 3.1 Add a production-HUD title update operation while retaining three
  stable inventory slots and the responsive prompt; verify the focused HUD
  tests pass.
- [x] 3.2 Route Apple entries through the active progression state and show
  exact non-final and final prompt copy; verify focused bootstrap tests cover
  the one, two, and three apple completion thresholds.
- [x] 3.3 Implement the asynchronous `OK` actions so intermediate levels reset
  player, inventory, zone occupancy, HUD title, sound, and all gameplay input
  in place while final completion reloads; verify transition and audio tests
  pass without duplicate advancement.

## 4. Full Verification

- [x] 4.1 Run `npm.cmd run run_unit_tests`, `npm.cmd run check`, and
  `npm.cmd run build` from `Babylon`, then scan authored changed files for the
  80-character limit; verify every command and check passes.
- [ ] 4.2 Run the game in a real browser and verify the complete three-level
  loop on desktop and portrait mobile, including START color stability,
  Apple/tree placement, one/two/three visible inventory slots, touch-capable
  `OK`, responsive prompts, WebGPU-first startup, and the available WebGL
  fallback path.

## 5. Level-Specific Inventory Capacity

- [ ] 5.1 Add failing definition, HUD, and bootstrap tests for exactly one,
  two, and three visible inventory slots in Levels 1, 2, and 3 respectively.
- [ ] 5.2 Set each level definition's inventory capacity to its level number
  and update the HUD to hide unavailable controls without rebuilding them;
  verify the focused tests pass.
- [ ] 5.3 Re-run the full unit suite, TypeScript checks, production build, and
  80-character scan after implementing the capacity refinement.
