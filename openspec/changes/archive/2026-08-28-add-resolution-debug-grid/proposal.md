## Why

Screenshots of the running game currently lack a shared screen-coordinate
reference, which makes it harder to discuss exact positions and dimensions.
A toggleable Total Rez grid will provide that reference without affecting
normal gameplay when it is disabled.

## What Changes

- Insert `6 = Toggle Grid` after the existing FPS debug input.
- Shift Reset to Defaults and Restart Scene to inputs 7 and 8.
- Draw a screen-space grid over the game using the current Total Rez
  coordinate system.
- Mark and label the screen midpoint with its current `x` and `y` values.
- Keep the grid aligned when the game viewport or Total Rez changes.
- Leave the grid disabled by default and remove its resources during runtime
  disposal.

## Capabilities

### New Capabilities

- `resolution-debug-grid`: Covers the numbered grid toggle, Total Rez grid
  coordinates, midpoint reference, resizing, and lifecycle behavior.

### Modified Capabilities

None.

## Impact

The change affects the debug input labels and keyboard mapping, runtime
bootstrap and resize handling, and a new focused debug-grid module with tests.
It uses browser-native drawing and DOM APIs with no new dependency. The
screen-space overlay behaves the same on desktop and portrait mobile and is
independent of whether Babylon.js uses WebGPU or the WebGL fallback.
