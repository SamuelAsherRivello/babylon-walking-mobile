## Context

The debug HUD already owns one visibility state, exposes keyboard toggle
behavior, and persists preferences in browser storage. Runtime player movement
currently reads fixed world-axis keyboard input and applies shared acceleration
and deceleration tuning. The permanent player HUD uses one Babylon GUI
fullscreen texture that also owns the interactive completion prompt.

The portrait canvas can be wider than a narrow mobile viewport and cropped on
both sides. New lower-left GUI therefore cannot assume that the canvas's left
edge is visible. See `proposal.md` for motivation and the capability specs for
observable behavior.

## Goals / Non-Goals

**Goals:**

- Feed keyboard and joystick directions into one player-motion update without
  changing keyboard mapping or tuning.
- Keep touch gesture detection independent from rendering backend selection.
- Keep the joystick visible through portrait crop, safe-area, orientation, and
  dynamic viewport changes.
- Make ownership and disposal of gesture listeners and GUI controls explicit.

**Non-Goals:**

- Change camera orbit, zoom, or keyboard controls.
- Add a second joystick or touch camera control.
- Change keyboard Inspector control or open it in mobile mode.
- Replace the working WebGPU-first startup or WebGL fallback.
- Add a dependency or expose the development server publicly.

## Decisions

### Detect a bounded three-finger tap with pointer events

Add a focused gesture controller that observes touch pointer down, move, up,
cancel, and blur events. It tracks three concurrent touch pointers, rejects a
gesture that exceeds the movement or duration tolerance, and emits at most one
toggle after the three contacts complete. Fewer contacts remain ordinary game
input. The controller owns and removes all event listeners on disposal.

The emitted action will toggle a persisted mobile-mode profile. Enabling it
hides the HUD, closes the Inspector, disables antialiasing, selects 60 FPS,
and requests fullscreen. Disabling it restores the normal debug defaults.
The `1` shortcut remains an independent HUD-only toggle.

A corner hotspot was rejected because it remains visible when the HUD is off
and competes with game UI. Browser gesture APIs were rejected because there is
no portable three-finger tap abstraction across the supported browsers.

### Build the joystick with Babylon GUI controls

Create a focused virtual movement joystick from a non-blocking root container,
an outer ellipse, and a draggable inner ellipse on the existing fullscreen GUI
texture. Only the joystick hit region starts input. Once started, capture that
pointer through release so movement continues anywhere on screen. The joystick
owns its controls and pointer observers; disposal removes observers and
controls, while the production HUD owns and disposes the shared texture.

Babylon's core `VirtualJoystick` was rejected because it injects a full-window
canvas, assigns input by screen half, and could prevent the existing Babylon
GUI completion prompt from receiving pointer events. A camera joystick input
was rejected because this control moves the player rather than the camera.

### Convert screen-clock direction through the current camera basis

The joystick publishes a normalized two-dimensional screen direction and an
intensity. During each runtime input update, compute the camera's projected
forward and right vectors on the XZ ground plane. Combine joystick up with
projected forward and joystick right with projected right, then normalize the
world direction before applying intensity and the existing elapsed-time motion
integration.

The basis is recalculated while input is active so a camera orbit changes the
meaning of twelve o'clock immediately. Keyboard direction continues through
its existing fixed XZ mapping. When both sources are present, non-dead-zone
joystick input takes precedence; centering the joystick exposes held keyboard
input again.

Mapping joystick directions to the same fixed axes as the keyboard was
rejected because the user explicitly distinguished the clock-relative control
from keyboard movement. Rotating the player without moving it was rejected
because the requested result is immediate world movement.

### Position against the visible portion of the portrait canvas

Keep the joystick anchored in Babylon GUI coordinates, but calculate its
horizontal offset from the intersection of the canvas rectangle and browser
viewport. Add CSS safe-area values and a minimum touch margin. Recalculate
placement after canvas `ResizeObserver`, window resize, orientation, and
fullscreen changes using the existing resize path.

Anchoring only to the canvas's lower-left was rejected because that point can
be outside the viewport when the fixed 9:16 canvas is horizontally cropped.
A DOM overlay was rejected because it would duplicate the existing Babylon GUI
layering and disposal model.

### Share the existing gameplay enabled state

Extend the runtime input boundary with explicit analog direction state. Its
existing enabled transition clears keyboard and analog movement together. The
joystick reflects the disabled state, releases active pointer state, and stops
hit testing so the completion prompt remains interactive. Re-enabling starts
from a centered joystick.

Maintaining an independent joystick enabled flag was rejected because it could
drift from quest completion and allow movement after gameplay input stops.

## Risks / Trade-offs

- [Three contacts overlap joystick use] -> Require a completed bounded gesture
  and toggle only once; ordinary one-finger joystick input remains unaffected.
- [Camera projection becomes nearly vertical] -> Preserve the last valid
  ground-plane basis or use a stable ground-plane fallback.
- [Portrait crop hides the joystick] -> Derive placement from the visible
  canvas intersection and verify narrow mobile viewports in a real browser.
- [GUI controls block the completion prompt] -> Limit hit testing to the
  joystick circle and disable it with the shared gameplay input state.
- [Analog input changes keyboard feel] -> Keep keyboard mapping and tuning
  tests unchanged and select analog input only outside its dead zone.

## Migration Plan

1. Add failing gesture, persistence, analog movement, GUI, and startup
   integration tests.
2. Add the gesture controller and route it through the mobile-mode profile.
3. Add the Babylon GUI joystick and camera-relative analog input path.
4. Connect resize, enabled-state, and disposal behavior.
5. Run focused tests, all unit tests, type checking, and the production build.
6. Verify desktop and portrait mobile under WebGPU and WebGL fallback.

Rollback removes the gesture controller, joystick controls, analog input path,
and focused tests. Existing persisted debug preferences remain compatible.
