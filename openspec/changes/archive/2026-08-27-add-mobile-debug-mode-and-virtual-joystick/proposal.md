## Why

Portrait mobile players cannot use the keyboard-only debug HUD toggle or move
the player with the existing runtime controls. The game needs touch controls
that remain usable and testable on desktop without changing the established
keyboard behavior.

## What Changes

- Keep the debug HUD visible by default on all platforms.
- Toggle a persisted mobile-mode profile with a three-finger tap. The profile
  hides the HUD, closes the Inspector, disables antialiasing, selects 60 FPS,
  and requests fullscreen; toggling off restores normal debug defaults.
- Rename the existing panel to `Debug Input (PC)` and add a
  `Debug Input (Mobile)` panel below it containing only
  `3 Finger Tap = Mobile Mode`.
- Add an always-visible virtual movement joystick in the lower-left on desktop
  and mobile, with active pointer capture through release anywhere on screen.
- Keep the permanent gameplay HUD, inventory, joystick, and completion prompt
  within the visible canvas and safe-area bounds during fullscreen, resize,
  crop, and orientation changes.
- Map joystick direction to the current camera view projected onto the world
  ground plane, so twelve o'clock moves toward the top of the visible game
  world while keyboard movement retains its existing fixed world-axis mapping.
- Preserve WebGPU-first startup and the working WebGL fallback.

## Capabilities

### New Capabilities

- `debug-hud-touch-toggle`: Defines the cross-platform three-finger gesture,
  visible guidance, default state, and persisted mobile-mode profile.
- `virtual-player-joystick`: Defines the always-visible Babylon GUI joystick,
  camera-relative world movement, coexistence with keyboard input, and input
  lifecycle behavior.

### Modified Capabilities

None.

## Impact

- Affects debug input handling, debug preference persistence, runtime player
  movement input, Babylon GUI controls, startup composition, and focused tests.
- Adds gameplay UI that must respect all portrait safe areas, the visible
  canvas intersection, fullscreen transitions, and browser viewport resizing.
- Uses the existing Babylon.js core and GUI dependencies; no dependency is
  added.
- Desktop and portrait mobile gain the same visible joystick and gesture.
- WebGPU and WebGL use the same input and UI behavior, with the existing
  WebGPU-first selection and WebGL fallback preserved.
