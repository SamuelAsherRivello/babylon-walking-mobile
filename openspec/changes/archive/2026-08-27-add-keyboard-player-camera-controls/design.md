## Context

The prototype uses an ArcRotateCamera created separately from the player.
Startup calls the camera's default control attachment before creating the
prototype scene and discards the returned player reference. That attachment
enables Babylon's keyboard, mouse-wheel, and pointer camera inputs, including
arrow-key and primary-drag behavior.

Debug shortcuts are owned by `addInput.ts`. Runtime guidance is supplied to
`DebugHud` from startup. The new gameplay controls cross those integration
points, and all authored code must remain at 80 characters per line or less.

## Goals / Non-Goals

**Goals:**

- Keep debug shortcuts separate from continuous gameplay input state.
- Make player and camera motion deterministic and straightforward to test.
- Preserve the existing wheel zoom and lower-right HUD structure.
- Preserve simultaneous player movement and camera orbit input.

**Non-Goals:**

- Add player animation, collision, physics, or ground-edge constraints.
- Add configurable key bindings or persist gameplay input preferences.
- Add new touch controls or redesign secondary pointer-button behavior.
- Change camera zoom limits, initial framing, or visual styling.

## Decisions

### Add a dedicated runtime input controller

Introduce a runtime controller that owns a set of held gameplay key codes and
an `update(deltaSeconds)` operation. Keep the existing debug shortcut actions
in `addInput.ts`; discrete development actions and continuous gameplay motion
have different state and testing needs.

The controller will listen for keydown, keyup, and window blur. It will use
physical `KeyboardEvent.code` values so letter bindings do not change with
keyboard layout or Shift state. Blur clears the held set to prevent a key from
remaining active after focus changes.

Adding movement branches to the current debug keydown listener was rejected
because browser key repeat is not a stable movement clock and key release
state would remain implicit.

### Update motion once per animation frame using elapsed time

Call the runtime controller before the render-loop frame-rate throttle return.
Build one X/Z movement vector from all held aliases, normalize a nonzero
vector, and use it as the requested direction. Opposing keys cancel before
normalization. Track player speed and the most recent nonzero direction so
release deceleration continues briefly along the current world direction.

This keeps movement independent of browser repeat rate, target render FPS,
and diagonal direction. A held input begins at the configured base speed and
ramps linearly toward its maximum. With no requested direction, speed ramps
toward zero while retaining the last direction. A new requested direction
applies immediately at the current speed, including during deceleration.

Applying a fixed displacement per keydown was rejected because it would vary
with operating-system repeat settings. Instantly setting velocity to zero on
keyup was rejected because it would remove the requested release deceleration.

### Keep player and camera motion tuning separate

Define player and camera tuning as separate named objects or constants rather
than sharing generic speed or timing values. Start with these player values:

- Base speed: `3.0` world units per second.
- Maximum speed: `3.9` world units per second.
- Acceleration time: `0.5` seconds from base to maximum.
- Deceleration time: `0.25` seconds from maximum to rest.

Start with these independently adjustable camera values:

- Base angular speed: `1.2` radians per second.
- Maximum angular speed: `1.8` radians per second.
- Acceleration time: `0.35` seconds from base to maximum.
- Deceleration time: `0.2` seconds from maximum to rest.

These camera defaults provide slight momentum without copying the player's
numbers. Browser verification can tune the initial values while preserving
the separate profiles and acceleration behavior required by the spec.

### Mirror the initial camera and directional light across world Z

Change the prototype camera position from `(10, 10, 10)` to
`(10, 10, -10)`. From that elevated diagonal, negative world X projects to
the screen's upper-left while positive world X projects lower-right. The
player input mapping remains negative X for `A` and Left; only presentation
changes.

Place the directional light at `(40, 25.8, -10)`, preserving the mirrored
world-Z lighting direction while allowing explicit shadow depth bounds. This
keeps the light on the same world-Z side as the revised camera and preserves
the intended visible face lighting and ground shadow.

Rotating movement vectors with the camera was rejected because that would
break the fixed-axis requirement. Swapping the left/right input signs was
rejected because `A` and Left already correctly produce negative world X.

### Use fixed world axes for player movement

Map `A` and Left to negative X, `D` and Right to positive X, `W` and Up to
positive Z, and `S` and Down to negative Z. Camera rotation does not transform
this vector.

Camera-relative movement was rejected because the requested directions refer
to world axes and must retain their meaning while the camera rotates.

### Make the player the camera target host

Retain the object returned by prototype scene creation and set its player mesh
as the ArcRotateCamera target host. Babylon then resolves the target from the
player transform on every camera update and disables camera panning away from
that target.

Copying the player position into a target vector each frame was rejected
because the camera already supports tracking a transform node directly.

### Own camera orbit explicitly and retain wheel zoom

Remove Babylon's default keyboard camera input so arrow keys cannot rotate the
camera. Prevent the primary mouse button from resolving to a camera movement
while leaving the wheel zoom input attached. The pointer configuration must
not turn a primary mouse drag into panning or zooming.

The runtime controller tracks a normalized camera direction and a scalar
camera speed separately from the player speed. `I` raises the visible camera
elevation, `K` lowers it, `J` rotates the view left, and `L` rotates it right.
Held input accelerates from the camera base speed toward its maximum. When all
camera keys are released, the last camera direction continues while its speed
decelerates to zero. Elevation is clamped away from both orbit poles, while
wheel input remains responsible for radius changes.

Keeping Babylon's default keyboard input with remapped keys was rejected
because player and camera controls would remain split across state systems,
making simultaneous-input and focus-loss behavior harder to verify.

### Treat visible direction as the camera-orbit contract

Tests will cover angle changes, but browser verification determines whether
`J` visibly rotates left and `L` visibly rotates right. ArcRotateCamera angle
signs are an implementation detail and are less clear than the required
on-screen result.

### Update only runtime guidance in the debug HUD

Replace the primary-mouse runtime label with concise lines for camera elevation,
camera rotation, and player movement. Preserve Fullscreen and Create Orbiter
labels, numbered debug labels, preference storage, and debug HUD visibility.
The existing `F` shortcut remains the Fullscreen action and requires no input
handler change.

Creating a new gameplay HUD was rejected because this change only updates the
existing diagnostic guidance and does not introduce production instructions.

## Risks / Trade-offs

- [A long suspended frame could cause a large movement jump] -> Cap the
  movement delta used by the controller without changing normal frame timing.
- [A tap shorter than one animation frame could be missed] -> Record a
  keydown direction until at least one controller update consumes it.
- [Camera elevation can cross an orbit pole and invert controls] -> Clamp the
  elevation angle to safe minimum and maximum values.
- [Browser arrow-key scrolling can move the page] -> Prevent the default action
  only for recognized gameplay keys while runtime input is active.
- [Primary-button filtering could affect touch if pointer types are conflated]
  -> Verify primary mouse dragging separately from existing touch behavior.
- [Visible orbit direction can differ from angle-sign assumptions] -> Verify
  `J` and `L` in a real browser and adjust the internal signs if necessary.
- [The player can leave the prototype ground] -> Accept this until a later
  gameplay-boundary or collision capability defines world limits.

## Migration Plan

1. Add focused controller and integration tests that fail against the current
   default camera controls.
2. Add the runtime input controller and connect the prototype player and
   camera through startup.
3. Replace conflicting default inputs while preserving wheel zoom.
4. Update runtime guidance and affected bootstrap assertions.
5. Run focused tests, type checking, the production build, and browser checks.

Rollback consists of removing the runtime controller integration and restoring
the previous camera attachment and runtime labels. No stored data is migrated.
