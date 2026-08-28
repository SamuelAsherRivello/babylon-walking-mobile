## Why

Timed work needs clear feedback in the world. A reusable circular meter above
the player will show work progress while remaining attached to the player’s
position in the 3D scene.

## What Changes

- Add a reusable `player-progress-bar` circular in-world UI element.
- Parent it to the player so it follows the player through the scene.
- Make it camera-facing and position it above the player.
- Provide configurable start value, end value, current value, and colors.
- Show no text inside the meter.
- Bind the first use case to Apple work progress.
- Hide or reset the visual when no work is active, according to the work
  lifecycle defined by the work-manager change.

## Capabilities

### New Capabilities

- `player-progress-bar`: Reusable circular Babylon.js in-world progress UI.

### Modified Capabilities

- `level-quest-gameplay`: Show Apple work progress and award only after the
  visible meter reaches completion.

## Impact

This affects the Babylon.js scene/UI layer, player setup, render/update loop,
gameplay integration, and browser-visible tests. It uses the existing Babylon
core and GUI dependencies; no new package or UI framework is required. The
element must remain usable on desktop and portrait mobile browsers with
WebGPU and WebGL fallback, including camera movement and viewport resizing.
