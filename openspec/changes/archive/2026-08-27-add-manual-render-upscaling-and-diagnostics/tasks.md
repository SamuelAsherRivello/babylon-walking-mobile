## 1. Upscaling Tests

- [x] 1.1 Add failing pure tests for Off, 2x, and 4x mode order and factors;
  verify cycling wraps from 4x to Off.
- [x] 1.2 Add DPR 1, 2, and 3 scaling tests for all modes; verify 2x halves
  each native dimension and 4x quarters each native dimension.
- [x] 1.3 Add preference tests for missing, legacy, valid, and invalid modes;
  verify default reset selects Off and mobile-mode toggles preserve the mode.
- [x] 1.4 Add diagnostics tests for display resolution, render resolution,
  mode, backend, measured FPS, and target FPS; verify active modes show a
  smaller render resolution.
- [x] 1.5 Add input contract tests for the new 1-through-7 debug mapping;
  verify movement, camera, fullscreen, pointer, and touch bindings are intact.

## 2. Scale Model and Preferences

- [x] 2.1 Add the typed mode model and factor conversion using project
  conventions; run the focused mode tests and verify every case passes.
- [x] 2.2 Add the focused render-resolution controller with DPR-relative
  scaling and one rounding policy; verify controller tests pass without a DOM
  or real Babylon engine.
- [x] 2.3 Extend debug preferences and tolerant migration with Off as default;
  run preference and reset tests and verify older records remain valid.
- [x] 2.4 Preserve the selected mode through mobile debug-mode transitions;
  run mobile-mode preference tests and verify its other behavior is unchanged.

## 3. Runtime Integration

- [x] 3.1 Apply the saved scale to the selected WebGPU or WebGL engine before
  the render loop starts; verify source and startup integration tests pass.
- [x] 3.2 Route window, canvas, orientation, and fullscreen resize work through
  one scale synchronization path; verify repeated notifications do not alter
  CSS game-frame geometry or reapply an unchanged effective scale.
- [x] 3.3 Extend the Rendering panel with Display Resolution, Render
  Resolution, and Upscaling; run diagnostics and resolution tests and verify
  Off reports matching values.
- [x] 3.4 Add the upscaling action and remap numbered shortcuts to 1-through-7;
  run input and label tests and verify key 5 still cycles 30, 60, and 120 FPS.
- [x] 3.5 Keep upscaling independent of antialiasing and the render scheduler;
  run focused scheduler and preference tests and verify target changes do not
  change scale while scale changes do not reset the selected target.

## 4. Browser and Device Verification

- [x] 4.1 In a foreground desktop WebGPU browser, test Off, 2x, and 4x at the
  60 FPS target; record repeated FPS and both resolutions and verify canvas,
  production HUD, keyboard movement, and Inspector behavior remain correct.
- [x] 4.2 Force WebGL fallback and repeat all three modes; verify labels, scale
  ratios, resize behavior, and the visible game frame match WebGPU behavior.
- [x] 4.3 At portrait-mobile and landscape-mobile emulated viewports, verify
  mode persistence, orientation, fullscreen, three-finger debug behavior, and
  touch joystick movement without using emulator FPS as device evidence.
- [ ] 4.4 Run the measurement procedure on a named mid-range laptop, a named
  mid-range Android device, and a named mid-range iPhone; record Off, 2x, and
  4x results at 60 FPS and leave this task open until physical results exist.
- [x] 4.5 Update `Babylon/documentation/performance-baseline.md` with exact
  devices, browsers, backends, modes, resolutions, and repeated FPS samples;
  verify measurements are separated from future recommendations.

## 5. Final Verification

- [x] 5.1 Run the complete Vitest suite, `npm.cmd run check`, and
  `npm.cmd run build`; verify concurrent mobile and level work remains green.
- [x] 5.2 Check every changed authored file for the 80-character limit and
  review the diff; verify there are no dependencies, asset changes, dynamic
  resolution, automatic visual changes, or unrelated cleanup.
