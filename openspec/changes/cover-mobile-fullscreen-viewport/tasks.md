## 1. Reproduction And Test Contracts

- [ ] 1.1 Reproduce the top strip on the target mobile device and record
  fullscreen state, screen size, inner size, visual-viewport bounds, canvas
  bounds, safe-area insets, and display mode; verify the measurements classify
  the strip as inside or outside the browser's drawable viewport.
- [x] 1.2 Add failing pure geometry tests for narrow and wide portrait cover,
  centered opposing-edge crop, non-zero viewport origins, and unchanged
  desktop presentation; run the focused tests and verify the new cases fail.
- [x] 1.3 Add failing HUD and joystick layout tests for visual-viewport origins,
  horizontal crop, and all four safe-area insets; run the focused tests and
  verify the new cases fail without hiding or clipping complete controls.
- [x] 1.4 Add failing source-contract tests for `viewport-fit=cover`,
  visual-viewport resize and scroll listeners, and listener disposal; run the
  focused tests and verify the required declarations are absent.

## 2. Mobile Cover Geometry

- [x] 2.1 Extend the page viewport metadata for drawable display cutouts and
  run the focused metadata test to verify `viewport-fit=cover` is present.
- [x] 2.2 Implement one typed viewport snapshot containing dimensions, origin,
  and safe-area insets; run its focused tests and verify current values and
  browser fallbacks are normalized correctly.
- [x] 2.3 Implement centered 9:16 cover geometry for portrait coarse-pointer
  presentation and preserve the current desktop rules; run the geometry and
  viewport contract tests and verify all narrow, wide, and desktop cases pass.
- [x] 2.4 Apply each current geometry snapshot to the displayed canvas and
  Babylon render dimensions; run the focused resize tests and verify repeated
  updates are idempotent and do not introduce page scrolling.

## 3. Safe Gameplay UI And Lifecycle

- [x] 3.1 Calculate the safe visible intersection of the overscanned canvas,
  drawable viewport, and safe-area insets; run the HUD layout tests and verify
  every offset and visible dimension is correct in ideal-height coordinates.
- [x] 3.2 Update the production HUD and virtual joystick from the shared safe
  layout; run their focused tests and verify HUD text, inventory slots, and the
  complete joystick remain within the visible touchable region.
- [x] 3.3 Route window, orientation, fullscreen, canvas, and visual-viewport
  changes through one layout update; run focused listener tests and verify all
  additional listeners are removed by runtime disposal.
- [x] 3.4 Preserve virtual-controller input across safe-layout updates; run the
  joystick interaction tests and verify direction, intensity, capture, cancel,
  and release behavior are unchanged.

## 4. Browser And Build Verification

- [x] 4.1 Run the complete Vitest suite, TypeScript check, and production build
  and verify every command succeeds without adding a dependency.
- [ ] 4.2 Verify desktop browser windows at wide, narrow, resized, and
  fullscreen dimensions; confirm the current centered aspect behavior remains
  and desktop backdrop bars are allowed.
- [ ] 4.3 Verify portrait mobile cover at representative narrow and wide ratios,
  browser-chrome changes, orientation round trips, and fullscreen; measure the
  canvas and confirm no application backdrop is visible on any drawable edge.
- [ ] 4.4 Verify the target mobile device in fullscreen and capture an updated
  screenshot; confirm the top strip is removed when it is drawable, or document
  that it is OS-reserved while every browser-drawable pixel is covered.
- [ ] 4.5 Exercise HUD text, inventory, and the virtual joystick near cutouts
  and gesture insets on Android Chrome and iOS Safari where available; confirm
  the complete interface stays visible and touchable without line wrapping.
- [ ] 4.6 Verify the affected flow with WebGPU and the WebGL fallback, check all
  changed authored files against the 80-character limit, and review the final
  diff for changes outside the approved scope.
