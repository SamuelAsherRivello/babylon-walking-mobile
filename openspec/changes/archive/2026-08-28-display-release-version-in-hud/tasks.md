## 1. Establish Failing Coverage

- [x] 1.1 Revise release-workflow and bootstrap tests to require a checked-in
  runtime environment file, release-time tag rewrite, and asynchronous load;
  run the focused tests and verify they fail for the missing behavior.
- [x] 1.2 Revise focused HUD tests for the local `V0.0.0` fallback, smaller
  version, `Babylon Walking` title, combined padded level and score row, no
  inventory label, direct slots, shared padding, one-line text, and
  non-blocking input; run them and verify the current layout fails.

## 2. Provide Runtime Release Metadata

- [x] 2.1 Add `Babylon/public/environment.json` with the current GitHub Release
  `v0.05.1`; update the release workflow to rewrite it from the validated tag
  and verify the built runtime file before packaging.
- [x] 2.2 Load and validate the runtime environment once before HUD creation,
  normalize its visible prefix to uppercase `V`, and use `V0.0.0` if loading
  fails; run the focused metadata and bootstrap tests and verify they pass.

## 3. Present The Version In The HUD

- [x] 3.1 Build one upper-left HUD stack ordered as smaller version, title,
  combined padded level and score row, and inventory slots; remove quest and
  inventory text, then run the focused production-HUD tests and verify they
  pass.
- [x] 3.2 Anchor the ordered stack to the calculated safe top and left edges
  with `UI_PADDING`, keep every text row single-line and non-interactive, and
  verify focused desktop, portrait, and resize layout tests pass.
- [x] 3.3 Verify HUD disposal still releases the fullscreen texture and all
  ordered stack controls without another listener or disposal path.

## 4. Validate The Completed Change

- [x] 4.1 Run `npm.cmd run check`, the full unit-test suite, the production
  build, `openspec validate --all`, the 80-character authored-line scan, and
  `git diff --check`; verify every command passes without a new dependency.
- [x] 4.2 Start Vite from `Babylon` with a representative runtime version,
  read its Local and Wi-Fi Network URLs, and verify it listens on `0.0.0.0`.
- [x] 4.3 Inspect the Local URL in real desktop and portrait browser viewports;
  verify the version, title, combined level and score row, and slots remain
  ordered, single-line, upper-left, safe-area aware, and non-blocking during
  gameplay and resize.
- [x] 4.4 Inspect the runtime fallback without valid metadata and smoke-test
  WebGPU-first startup plus forced WebGL fallback; verify the HUD displays
  `V0.0.0` in both rendering paths and capture browser evidence.
