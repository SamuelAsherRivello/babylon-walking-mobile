## 1. Portrait Viewport Test Contract

- [x] 1.1 Add a focused Vitest source-contract test for the full-height 9:16
  canvas, centered clipping, viewport-visible overlays, and canvas resize
  observation; run the test alone and verify it fails against the template.

## 2. Portrait Viewport Implementation

- [x] 2.1 Update the page and canvas CSS for a centered, non-shrinking 9:16
  frame using `100vh` and `100dvh`, a neutral backdrop, and hidden overflow;
  run the focused CSS assertions and verify they pass.
- [x] 2.2 Observe canvas size changes and reuse the Babylon resize handler;
  run the complete focused test file and verify all assertions pass.
- [ ] 2.3 Anchor the canvas to the browser viewport independently of the
  development Inspector; verify the regression test and live Inspector toggle
  keep the same horizontal center.

## 3. Verification

- [x] 3.1 Run the full unit suite, TypeScript check, and production build and
  verify every command completes successfully.
- [ ] 3.2 Serve the production behavior in a real browser and verify measured
  canvas geometry at wide and narrow viewports, centered crop, no horizontal
  scrolling, visible debug overlays, correct geometry after resizing, and
  unchanged centering while toggling the development Inspector.
- [x] 3.3 Check changed authored files for the 80-character line limit and
  review the final diff for changes outside the approved feature scope.
