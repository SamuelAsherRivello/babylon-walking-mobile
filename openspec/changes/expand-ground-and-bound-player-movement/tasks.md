## 1. Reusable Ground-Area Visuals

- [ ] 1.1 Add failing tests for optional fill, four segmented border edges,
  world anchoring, non-pickable and shadow-free resources, and disposal; run
  the focused visual tests and confirm they fail for the missing abstraction.
- [ ] 1.2 Implement the reusable ground-area visual within the approved
  Babylon.js toolset; rerun the focused tests and verify they pass.
- [ ] 1.3 Refactor `WorldZone` to compose the reusable visual while preserving
  its public fields, colors, title, transitions, and disposal; run all zone
  tests and verify no regression.

## 2. Walkable-Area Confinement

- [ ] 2.1 Add failing tests for centered 20-by-20 bounds, conservative Player
  clearance, direct edge stops, independent-axis sliding, corner stops, and
  movement back inward; run the focused tests and confirm the missing behavior.
- [ ] 2.2 Implement the world-owned walkable-area object and its border-only
  visual with independent X/Z clamping; rerun its focused tests and verify all
  boundary and disposal cases pass.
- [ ] 2.3 Add the walkable area to game-world creation and verify level tests
  prove the Player, START zone, Apple zone, and tree begin inside its bounds.

## 3. Enlarged Ground

- [ ] 3.1 Update prototype-scene tests to require a centered 100-by-100 Ground
  and 50 texture repeats on U and V; run the focused test and confirm it fails
  against the current 20-by-20 Ground.
- [ ] 3.2 Enlarge the Ground and derive its repeats from the established
  world-space density; rerun prototype-scene tests and verify dimensions,
  texture tiling, materials, lighting, and shadows remain correct.

## 4. Runtime Integration

- [ ] 4.1 Add a failing startup integration test proving confinement occurs
  after runtime movement and before zone updates for keyboard, joystick, and
  deceleration paths; run it and confirm the current unbounded result.
- [ ] 4.2 Constrain Player position between `RuntimeInputController.update()`
  and zone evaluation, including after level spawn; rerun runtime, joystick,
  zone, quest, and startup integration tests and verify unchanged input tuning.

## 5. Automated Verification

- [ ] 5.1 Run focused tests for ground-area visuals, walkable confinement,
  prototype scene, levels, runtime input, zones, and startup integration; fix
  only in-scope failures and record that all focused tests pass.
- [ ] 5.2 Run the full Vitest suite, TypeScript check, ESLint, and production
  build from `Babylon`; verify every command passes without new dependencies.
- [ ] 5.3 Check all authored files changed by this feature for the 80-character
  limit and verify generated files were not manually reformatted.

## 6. Real-Browser Verification

- [ ] 6.1 Run the game in a real desktop browser and verify the 100-by-100
  Ground, 20-by-20 segmented border, footprint stop, edge sliding, corners,
  inward movement, zones, and quests under the normal WebGPU-first path.
- [ ] 6.2 Verify the same behavior in a portrait mobile viewport with the
  virtual joystick, including after viewport resize and camera orbit.
- [ ] 6.3 Exercise the WebGL fallback in a real browser and verify Ground,
  border visibility, keyboard and touch bounds, zones, and disposal produce no
  runtime errors.
