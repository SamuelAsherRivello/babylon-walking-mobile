## Why

Portrait mobile fullscreen can leave an uncovered strip at the top when the
mobile visual viewport is offset from the layout viewport. The game should
cover the mobile screen without changing the desktop presentation or allowing
cropped scene edges to hide gameplay UI.

## What Changes

- Make portrait mobile and mobile fullscreen use screen-covering presentation.
- Preserve centered horizontal scene cropping when the screen is narrower than
  the portrait game frame.
- Compensate for mobile visual-viewport offsets and display cutout regions.
- Keep the HUD and touch controls within the visible safe portion of the game.
- Preserve the current desktop aspect-ratio behavior, including acceptable
  backdrop bars outside the game frame.
- Distinguish web-content gaps from OS-reserved areas that a browser page
  cannot cover without successful fullscreen entry.
- Add automated geometry coverage and real-device browser verification.

## Capabilities

### New Capabilities

- `mobile-fullscreen-cover`: Defines screen-covering portrait mobile
  presentation, safe gameplay UI placement, and viewport-offset handling.

### Modified Capabilities

None.

## Impact

- Affects the page viewport metadata, mobile canvas layout, responsive resize
  handling, HUD layout geometry, and virtual controller layout.
- Desktop rendering remains unchanged.
- WebGPU-first startup and WebGL fallback remain unchanged.
- No public API, stored data, or dependency changes are expected.
