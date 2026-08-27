## Why

The current touch controller supports movement only, and its UI is coupled to
movement-specific behavior. The game now needs reusable, configurable action
controls plus concrete Jump and Shoot actions that work equivalently from
touch and keyboard input.

## What Changes

- Wrap the existing movement joystick in a reusable virtual-controller shell
  that separates generic control presentation from game-specific behavior.
- Configure the shell with movement and zero through three labeled action
  buttons so other games can select only the controls they need.
- Reuse the joystick puck circle for each action button without a square
  backing, and keep every control label on one line.
- Match every controller label to the current `Score:` line's font family,
  weight, size, color, and outline treatment.
- Configure this game with `Move`, `Jump (C)`, and `Shoot (V)` controls.
- Replace the existing `C = Create Orbiter` shortcut with `C = Jump` and add
  `V = Shoot`.
- Add a single non-stacking player jump and a shot that travels in the
  player's facing direction for three seconds before disappearing.
- Preserve equivalent behavior on desktop and portrait mobile, including
  simultaneous movement and action touches, viewport resizing, safe areas,
  WebGPU, and the WebGL fallback.
- Use only existing Babylon.js and project dependencies.

## Capabilities

### New Capabilities

- `configurable-virtual-controller`: Defines the reusable movement-and-action
  controller, its configuration limits, labels, touch behavior, layout, and
  lifecycle.
- `player-actions`: Defines the game's Jump and Shoot behavior, including
  facing-relative projectile travel and timed disposal.

### Modified Capabilities

- `virtual-player-joystick`: Places the existing movement joystick inside the
  reusable controller while preserving its movement behavior.
- `runtime-keyboard-controls`: Replaces the orbiter shortcut with Jump, adds
  Shoot, and keeps keyboard actions equivalent to their touch controls.

## Impact

- Affects the Babylon GUI controller, production HUD ownership, gameplay input
  routing, runtime input labels, player motion, scene update loop, and resource
  disposal.
- Replaces the user-facing Create Orbiter shortcut but does not require removal
  of the existing orbiter demonstration code.
- Adds focused unit and integration coverage plus desktop and portrait-mobile
  real-browser verification under WebGPU and WebGL fallback where available.
- Adds no dependency, persisted-data, network, or public API migration.
