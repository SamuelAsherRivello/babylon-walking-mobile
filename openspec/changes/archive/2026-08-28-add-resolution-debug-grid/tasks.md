## 1. Test-First Contracts

- [x] 1.1 Update debug label and input tests for Toggle Grid on 6, Reset on 7,
  and Restart on 8; run the focused Vitest files and confirm they fail for
  the missing grid behavior before production edits.
- [x] 1.2 Add focused resolution-grid tests for 100-pixel lines, Total Rez
  bounds, midpoint placement and label formatting, visibility, layout updates,
  pointer transparency, and disposal; run the new test and confirm the current
  implementation is missing.

## 2. Resolution Grid Implementation

- [x] 2.1 Implement the focused disposable SVG grid module with a hidden
  default, green 100-pixel lines, stronger midpoint, and Total Rez view box;
  verify its focused tests pass and authored lines stay within 80 characters.
- [x] 2.2 Update debug labels and keyboard dispatch so 6 toggles Grid, 7 resets
  defaults, and 8 restarts; verify the focused input and label tests pass.

## 3. Runtime Integration

- [x] 3.1 Create one grid in the client bootstrap and connect toggle, reset,
  Total Rez synchronization, canvas-bound resize updates, and disposal;
  verify integration tests cover each lifecycle path.
- [x] 3.2 Verify no new touch gesture, gameplay input interception, dependency,
  Babylon.js resource, backend-specific branch, or persisted preference was
  added by reviewing the focused diff and running TypeScript checks.

## 4. Cross-Platform Verification

- [x] 4.1 Run the focused tests, full Vitest suite, `npm.cmd run check`,
  `npm.cmd run build`, an authored 80-character scan, `git diff --check`, and
  `openspec validate --all`; record each result.
- [x] 4.2 Start Vite with `npm start`, inspect its reported Local and Network
  URLs, and verify the server listens on `0.0.0.0` before reporting either URL.
- [x] 4.3 In a real browser, verify keys 6, 7, and 8, accurate Total Rez bounds,
  the midpoint label, pointer pass-through, upscaling independence, desktop
  resize, and a portrait mobile viewport; capture visual evidence.
- [x] 4.4 Exercise WebGPU when available and force or observe the WebGL
  fallback, confirming identical screen-space grid behavior in both paths.
