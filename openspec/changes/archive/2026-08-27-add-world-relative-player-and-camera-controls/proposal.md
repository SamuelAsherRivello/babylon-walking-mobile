## Why

The current ArcRotateCamera controls assign pointer dragging and the arrow
keys to the camera, leaving no dedicated keyboard movement for the player.
The game needs explicit, non-conflicting camera and player controls while the
camera continues to follow the player.

## What Changes

- Remove mouse-drag camera movement while preserving mouse-wheel zoom.
- Move camera orbit and elevation control to the `I`, `J`, `K`, and `L` keys.
- Lock the camera target to the player as the player moves through the world.
- Move the player on the ground plane with either `WASD` or the arrow keys.
- Map `W` and Up to positive world Z, and `S` and Down to negative world Z.
- Keep movement world-axis-relative and independent of camera rotation.
- Give a movement-key tap an immediate low-speed response, accelerate held
  movement from approximately `3.0` to `3.9` over `0.5` seconds, and
  decelerate for `0.25` seconds after all movement keys are released.
- Give `IJKL` camera input its own `1.2` to `1.8` angular-speed profile so
  player and camera acceleration can be tuned independently.
- Mirror the initial camera and light across the world Z axis so negative-X
  player movement appears toward the screen's upper-left.
- Keep motion frame-rate-independent and normalize diagonal player movement.
- Replace the lower-right runtime input description with the new bindings
  while preserving `F = Fullscreen`, all debug input, and HUD behavior.

## Capabilities

### New Capabilities

- `runtime-keyboard-controls`: Defines keyboard player movement, keyboard
  camera orbit, camera tracking, mouse behavior, and runtime input guidance.

### Modified Capabilities

None.

## Impact

- Runtime input setup and per-frame update integration in the client startup.
- Prototype player and ArcRotateCamera coordination.
- Lower-right runtime input labels, without changing debug preferences or
  debug shortcut behavior.
- Focused unit and browser tests for key aliases, acceleration profiles,
  camera tracking, diagonal speed, mouse behavior, and visible directions.
- No new runtime dependency, stored-data migration, or public API change.
