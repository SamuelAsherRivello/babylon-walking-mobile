## 1. Render Scheduler Tests

- [x] 1.1 Add deterministic tests for 16.6 ms and 16.8 ms callback
  sequences at 30, 60, and 120 FPS; run the focused test and verify the
  current boundary-sensitive behavior fails the expected cadence assertions.
- [x] 1.2 Add scheduler tests for target changes, display refresh below the
  target, backward timestamps, and long pauses; verify the focused test rejects
  stale deadlines and burst renders.
- [x] 1.3 Add an integration contract test proving input, zones, orbiters, and
  physics updates remain before the render decision; run it and verify it fails
  if simulation is placed behind the visual-frame throttle.

## 2. Backend Selection Tests

- [x] 2.1 Add engine-creation tests for successful WebGPU startup and absent
  WebGPU; run them and verify the returned engine and backend label agree.
- [x] 2.2 Add a failing WebGPU-initialization test that requires disposal of
  the attempted engine followed by WebGL startup; verify fallback occurs once
  and reports WebGL.
- [x] 2.3 Add focused diagnostics tests for backend, backing resolution,
  selected target FPS, and measured FPS; verify the existing labels remain
  available without adding production telemetry.

## 3. Render and Simulation Implementation

- [x] 3.1 Add the pure persistent-deadline render scheduler using the project
  TypeScript conventions; run the focused scheduler tests and verify all
  cadence cases pass.
- [x] 3.2 Integrate the scheduler into the main loop and reset it when the FPS
  target changes; run scheduler and debug-preference tests and verify the
  existing 30, 60, and 120 selections remain compatible.
- [x] 3.3 Keep input, zone, orbiter, and physics work before the render decision
  and bound physics substeps after long pauses; run focused movement and
  physics tests and verify speed remains frame-rate independent.

## 4. Resilient Engine Startup

- [x] 4.1 Extract asynchronous WebGPU-first engine creation with equivalent
  applicable WebGL options; run the focused successful and unavailable-backend
  tests and verify their engine labels.
- [x] 4.2 Dispose a failed WebGPU attempt before constructing WebGL and emit one
  concise development warning; run the initialization-failure test and verify
  startup completes with WebGL.
- [x] 4.3 Integrate the returned engine and backend label with scene creation,
  resize handling, and the debug HUD; run the relevant startup and resolution
  tests and verify no duplicate scene or engine is created.

## 5. Performance Baseline

- [x] 5.1 Create `Babylon/documentation/performance-baseline.md` with the test
  environment, measurement method, repeated-result format, and explicit note
  that foreground production runs are authoritative; verify the document
  covers WebGPU, WebGL, desktop, and portrait mobile.
- [x] 5.2 Measure the existing scene at 30, 60, and 120 targets with the
  Inspector closed and open; record backing resolution and measured FPS and
  verify Inspector visibility does not cause lower-harmonic scheduler behavior.
- [x] 5.3 Record focused observations for current antialiasing,
  post-processing, shadows, tree geometry, and texture transfer size without
  persisting visual-setting or asset changes; verify the baseline distinguishes
  measurements from future recommendations.

## 6. Verification

- [x] 6.1 Run the full Vitest suite, `npm.cmd run check`, and
  `npm.cmd run build`; verify all commands pass without masking failures from
  the concurrent mobile-controls change.
- [x] 6.2 Verify WebGPU-first startup and forced WebGL fallback in foreground
  desktop browsers; verify the active backend, resolution, target FPS, and
  measured FPS diagnostics are accurate.
- [x] 6.3 Verify 30, 60, and 120 selections, Inspector open and closed,
  movement, touch joystick, resize, orientation, and fullscreen behavior at
  desktop and portrait-mobile viewports; verify canvas geometry and native
  device-ratio rendering remain unchanged.
- [x] 6.4 Check all changed authored files for the 80-character line limit and
  review the final diff; verify no asset replacement, resolution reduction,
  dependency addition, or unrelated cleanup entered the change.
