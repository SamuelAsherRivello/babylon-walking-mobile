## 1. Test-First Controller Contracts

- [x] 1.1 Add failing virtual-controller tests for zero through three actions,
  rejection of a fourth action, standalone puck circles, one activation per
  press, concurrent movement, disable state, and disposal; verify the focused
  Vitest file fails for the missing controller behavior.
- [x] 1.2 Add failing layout tests for lower-left movement, lower-right action
  ordering, safe-area and crop bounds, repeated resize stability, three-action
  fitting, and non-wrapping labels; verify the focused Vitest file fails.
- [x] 1.3 Add failing production-style tests proving controller labels share
  the score's 32-pixel font treatment and 48-pixel label height; verify the
  focused HUD or controller test fails before extracting the shared style.

## 2. Reusable Virtual Controller

- [x] 2.1 Extract the production score text treatment into a shared helper and
  use it for the score and controller labels; verify the style tests pass and
  the score's existing appearance contract remains unchanged.
- [x] 2.2 Refactor the movement joystick into a controller-owned component
  without changing its input math or pointer capture; verify all existing
  `virtualMovementJoystick` tests pass.
- [x] 2.3 Implement the configurable `VirtualController` with movement, zero
  through three action circles, single-line labels, independent pointers,
  lifecycle control, and deterministic disposal; verify the focused controller
  tests pass.
- [x] 2.4 Implement visible-safe-area layout for movement plus up to three
  actions, including gap reduction and uniform fitting after resize or crop;
  verify the focused layout tests pass.
- [x] 2.5 Replace the production HUD's movement-specific factory with ownership
  of the complete configured controller; verify HUD lifecycle and prompt tests
  pass.

## 3. Shared Gameplay Action Input

- [x] 3.1 Add failing runtime-input tests for `C` Jump and `V` Shoot, keyboard
  repeat suppression, touch equivalence, disabled input, blur, and disposal;
  verify the focused runtime-input test fails before implementation.
- [x] 3.2 Define this game's Jump and Shoot action metadata once and route both
  keyboard and virtual controls through the same callbacks; verify the focused
  input-routing tests pass.
- [x] 3.3 Remove `C = Create Orbiter`, the `onOrbiter` shortcut path, and its
  runtime label, then publish `C = Jump` and `V = Shoot`; verify `addInput` and
  runtime-label tests pass with no duplicate action activation.

## 4. Jump And Shoot Behavior

- [x] 4.1 Add failing player-action tests for one non-stacking jump, exact
  ground-height restoration, frame-rate independence, and reset behavior;
  verify the focused Vitest file fails before production implementation.
- [x] 4.2 Add failing projectile tests for player-facing spawn and direction,
  camera independence, immutable shot heading, overlapping shots, three-second
  expiry, and resource disposal; verify the focused Vitest file fails.
- [x] 4.3 Implement the kinematic jump arc with named tuning constants and
  exact reset behavior; verify all focused jump tests pass at multiple update
  rates.
- [x] 4.4 Implement the timed ball projectiles with a shared owned material,
  independent shot records, and complete reset and disposal behavior; verify
  all focused projectile tests pass.
- [x] 4.5 Connect action update, level reset, quest input lifecycle, and runtime
  disposal before the render throttle and engine disposal; verify integration
  tests cover level and completion transitions.

## 5. Validation And Browser Verification

- [x] 5.1 Run `npm.cmd run run_unit_tests` from `Babylon` and verify the full
  Vitest suite passes without regressing movement, HUD, quests, or rendering.
- [x] 5.2 Run `npm.cmd run check`, `npm.cmd exec -- eslint .`, and
  `npm.cmd run build` from `Babylon`; verify strict TypeScript, lint, the
  80-character authored-code limit, and the production build all pass.
- [x] 5.3 Run the game in a real desktop browser and verify Move, `C` Jump,
  `V` Shoot, action labels, player-facing shots, exact timed disappearance,
  resize behavior, and WebGPU rendering.
- [x] 5.4 Verify portrait mobile dimensions and multitouch in a real browser:
  move while pressing Jump and Shoot, rotate or resize the viewport, confirm
  all labels remain single-line and score-matched, and confirm no visible
  square backing appears behind either action circle.
- [x] 5.5 Exercise the WebGL fallback in a real browser and verify controller
  appearance, Jump, Shoot, timed disposal, and lifecycle behavior remain
  equivalent; record any unavailable backend or device limitation explicitly.
