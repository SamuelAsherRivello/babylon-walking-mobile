## Why

The template currently stretches the Babylon canvas to every browser shape,
but this game is intended to use a consistent mobile portrait presentation.
A stable 9:16 frame provides the foundation for later camera, control, and UI
features.

## What Changes

- Present the game in an exact 9:16 portrait frame at the full dynamic
  viewport height.
- Center the frame horizontally and clip equal amounts from both sides when
  the browser is narrower than the frame.
- Show a neutral backdrop beside the frame when the browser is wider than it.
- Keep temporary debug overlays visible within the browser viewport.
- Keep Babylon's render dimensions synchronized with browser, orientation,
  fullscreen, and mobile browser-chrome changes.
- Add automated layout coverage and real-browser responsive verification.

## Capabilities

### New Capabilities

- `portrait-game-viewport`: Defines the fixed 9:16, full-height game frame,
  centered overflow crop, wide-screen backdrop, and responsive resizing.

### Modified Capabilities

None.

## Impact

- Affects the Babylon client page layout, canvas sizing, and resize handling.
- Adds focused client tests for the portrait viewport contract.
- Does not change gameplay, camera composition, scene content, public APIs,
  or project dependencies.
