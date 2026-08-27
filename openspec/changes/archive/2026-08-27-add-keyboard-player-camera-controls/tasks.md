## 1. Input Contracts

- [x] 1.1 Add failing runtime-controller tests for `WASD` and arrow-key
  aliases, fixed world axes, tap response, player acceleration, release
  deceleration, opposing inputs, normalized diagonals, and elapsed-time motion;
  run the focused test file and confirm the new cases fail because the
  controller behavior does not exist yet.
- [x] 1.2 Add failing camera-control tests for `IJKL` directions, elevation
  limits, separate acceleration tuning, release deceleration, radius
  preservation, player tracking, simultaneous movement, blur cleanup, and
  arrow-key default prevention; run them and confirm the expected failures.
- [x] 1.3 Update bootstrap and debug-label contract tests for retained player
  scene state, removal of conflicting default camera inputs, and the new
  runtime guidance; run the focused tests and confirm they detect the current
  integration and labels.
- [x] 1.4 Add failing assertions for `3.0` to `3.9` player tuning, `1.2` to
  `1.8` camera tuning, negative-X screen-upper-left projection, and mirrored
  light placement; run the focused tests and confirm the current constants
  and initial view fail them.
- [x] 1.5 Reverse the vertical-axis contract tests so `W` and Up require
  positive Z while `S` and Down require negative Z; run the focused tests and
  confirm the existing mapping fails them.

## 2. Runtime Controller

- [x] 2.1 Add the held-key runtime input controller with pending tap input,
  keydown, keyup, blur, disposal, and capped elapsed-time updates; verify the
  focused lifecycle and input-state tests pass.
- [x] 2.2 Implement normalized, world-axis player movement with separate
  `3.0` base speed, `3.9` maximum speed, `0.5`-second acceleration, and
  `0.25`-second deceleration tuning; verify all player motion tests pass.
- [x] 2.3 Implement bounded camera elevation and horizontal orbit for `IJKL`
  with separate `1.2` base angular speed, `1.8` maximum speed, `0.35`-second
  acceleration, and `0.2`-second deceleration tuning; verify camera direction,
  momentum, radius, limits, and simultaneous-input tests pass.
- [x] 2.4 Reverse only the player vertical-axis mapping, preserving horizontal
  movement, camera behavior, acceleration, deceleration, and diagonals; verify
  the focused player input tests pass.

## 3. Scene Integration

- [x] 3.1 Retain the prototype scene result, make its player the camera target,
  and verify camera-target tests follow player translation and camera orbit.
- [x] 3.2 Remove the default keyboard camera conflict, disable primary-mouse
  camera movement, preserve wheel zoom, and verify camera input integration
  tests pass.
- [x] 3.3 Update the render loop to advance runtime input before frame-rate
  throttling and verify movement remains equivalent at supported target frame
  rates.
- [x] 3.4 Replace the primary-mouse runtime label with camera and player
  keyboard guidance while preserving `F = Fullscreen`, Create Orbiter, and
  numbered debug labels; verify the debug HUD contract tests pass.
- [x] 3.5 Mirror the initial camera and directional light across world Z and
  verify negative-X movement projects screen-upper-left while the initial
  lighting and shadow tests pass.

## 4. Verification

- [x] 4.1 Run the focused input, prototype-scene, bootstrap, and debug HUD test
  files, then run the full unit suite and confirm all tests pass.
- [x] 4.2 Run TypeScript checking and the production build and confirm both
  complete successfully without exceeding the authored 80-character limit.
- [x] 4.3 In a real browser, verify all eight player aliases, normalized
  diagonals, tap movement, both acceleration profiles, release deceleration,
  simultaneous player and camera input, visible `IJKL` directions, player
  tracking, blocked primary drag, retained wheel zoom, arrow-key scroll
  prevention, negative-X screen-upper-left movement, and unchanged lower-right
  debug behavior.
- [x] 4.4 Run the full automated checks and verify Up/W and Down/S in the real
  browser without changing the current camera or lighting.
