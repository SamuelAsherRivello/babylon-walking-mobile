## 1. Runtime metadata and formatting

- [x] 1.1 Extend release metadata loading with validated artifact byte size,
  stable fallback behavior, and one-decimal `Mb` formatting; verify focused
  release-metadata unit tests cover valid, missing, malformed, and rounding
  cases.
- [x] 1.2 Update checked-in runtime metadata and bootstrap wiring so the
  resolved version-and-size label reaches the production HUD; verify TypeScript
  checks and bootstrap tests pass.

## 2. HUD presentation

- [x] 2.1 Render the size immediately beside the existing version in the
  ordered upper-left HUD stack, preserving non-wrapping text, safe-area
  padding, touch pass-through, and shared texture disposal; verify production
  HUD tests cover ordering and label content.
- [x] 2.2 Confirm the combined label remains visible on one line at desktop and
  portrait-mobile viewport sizes; verify with the existing Vite app in a real
  browser and inspect both WebGPU and WebGL fallback startup paths.

## 3. Release artifact calculation

- [x] 3.1 Update the release workflow to calculate and package the total byte
  size of the complete final browser artifact using a fixed-width metadata
  value; verify workflow/configuration tests prove the stored value matches
  the packaged file total.
- [x] 3.2 Run the complete affected test suite, TypeScript checks, build, and
  OpenSpec validation; verify `openspec validate --change
  display-download-size-in-hud` succeeds and no unrelated working-tree
  changes are overwritten.
