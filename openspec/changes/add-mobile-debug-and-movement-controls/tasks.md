## 1. Three-Finger Gesture Tests

- [x] 1.1 Add focused gesture-controller tests for three concurrent touch
  pointers, movement and duration rejection, cancellation, blur, single-toggle
  emission, and disposal; run the focused test and verify it fails for missing
  gesture behavior.
- [x] 1.2 Add initial debug-input label and integration tests for the gesture
  guidance and routing; run the focused tests and verify they fail before
  implementation.
- [x] 1.3 Extend preference tests for default-visible state and visibility
  persistence from both keyboard and gesture paths; run the focused tests and
  verify they fail only for the missing integration.

## 2. Three-Finger Gesture Implementation

- [x] 2.1 Implement the bounded three-finger tap controller with pointer,
  cancellation, blur, and disposal handling; verify the focused controller
  test from task 1.1 passes.
- [x] 2.2 Add the exact Debug Input guidance and connect gesture toggles to the
  existing preference-save path; verify the focused label, integration, and
  preference tests from tasks 1.2 and 1.3 pass.

## 3. Joystick Movement Tests

- [x] 3.1 Add failing runtime-input tests for twelve, three, six, and nine
  o'clock camera-relative movement, camera-orbit changes, proportional input,
  dead zone, diagonal speed, joystick precedence, and unchanged keyboard
  movement; run the focused runtime test and verify the new cases fail.
- [x] 3.2 Add failing lifecycle tests for clearing analog state on disable,
  restoring centered state on enable, and disposing input state; run the
  focused runtime test and verify the new cases fail.
- [x] 3.3 Add failing Babylon GUI joystick tests for lower-left placement,
  pointer-only hit testing, drag clamping, viewport crop, safe-area resize,
  enabled state, observer cleanup, and shared texture ownership; run the
  focused GUI test and verify the new cases fail.

## 4. Joystick Implementation

- [x] 4.1 Extend runtime player input with dead-zone-filtered analog direction
  and intensity, current-camera ground projection, joystick precedence, and
  existing keyboard fallback; verify the focused movement tests from task 3.1
  pass without changing existing keyboard expectations.
- [x] 4.2 Implement the Babylon GUI joystick control on the production HUD
  texture with fixed lower-left visuals, constrained drag, focused hit testing,
  explicit observers, and disposal; verify the focused GUI tests from task 3.3
  pass.
- [x] 4.3 Connect joystick state to the shared gameplay enabled lifecycle and
  completion prompt behavior; verify the lifecycle tests from task 3.2 and
  existing quest and prompt tests pass.
- [x] 4.4 Reposition the joystick from the visible canvas intersection and
  safe-area offsets through the existing resize path; verify focused resize
  tests cover wide desktop, narrow portrait, orientation, and fullscreen
  changes.

## 5. Startup And Regression Verification

- [x] 5.1 Compose gesture and joystick ownership during startup and disposal;
  verify startup source-contract tests prove both are connected exactly once.
- [x] 5.2 Run all unit tests with `npm.cmd run run_unit_tests` and verify the
  complete suite passes.
- [x] 5.3 Run `npm.cmd run check` and `npm.cmd run build`; verify strict
  TypeScript and the production build pass without new dependencies.
- [x] 5.4 In a real desktop browser, verify mouse joystick movement, unchanged
  keyboard axes, visible guidance, persistence after reload, viewport resize,
  and the WebGPU rendering label.
- [ ] 5.5 In Android Chrome portrait mode, verify the mobile-mode toggle,
  persisted hidden state, twelve-o'clock movement, safe-area placement,
  orientation changes, completion prompt input, and WebGPU rendering.
- [x] 5.6 Force or use a supported WebGL fallback browser context and verify
  gesture, persistence, joystick visuals, movement, and prompt behavior remain
  equivalent.

## 6. Revised Mobile Mode And Pointer Capture

- [x] 6.1 Update focused tests for the exact mobile-mode guidance, persisted
  on and off profiles, fullscreen behavior, and Inspector closure.
- [x] 6.2 Implement the mobile-mode preference and runtime profile while
  keeping keyboard HUD toggling independent.
- [x] 6.3 Add a failing joystick test for capture beyond the outer circle,
  release or cancellation, and a required new in-circle press.
- [x] 6.4 Capture the active joystick pointer through release and correct the
  reversed left and right camera-relative movement mapping.
- [ ] 6.5 Re-run automated and real-browser verification for the revised
  behavior on WebGPU and WebGL fallback.
