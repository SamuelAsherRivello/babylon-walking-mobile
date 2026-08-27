## Context

The existing `VirtualMovementJoystick` creates and owns its GUI controls,
attaches directly to the production HUD texture, and emits only movement
vectors. `ProductionHud` has a movement-specific factory for it. Keyboard
movement lives in `RuntimeInputController`, while the `C` orbiter shortcut is
handled separately by `addInput`. See `proposal.md` for motivation and the
delta specs for observable requirements.

The player currently moves kinematically on X and Z, turns its local forward
direction toward movement, and does not use active Havok player physics. The
production HUD uses a 1600-pixel ideal height and computes visible safe bounds
for a full-height portrait canvas that may be horizontally cropped.

## Goals / Non-Goals

**Goals:**

- Make the complete on-screen controller reusable through data and callbacks.
- Give keyboard and touch actions one game-owned activation path.
- Preserve all existing joystick movement and pointer-capture behavior.
- Keep simultaneous movement and action touches independent.
- Own and deterministically dispose every new GUI and projectile resource.
- Keep controller labels visually identical to the current score treatment.

**Non-Goals:**

- Build a general command-remapping or input-persistence system.
- Add double jump, variable jump height, projectile collisions, damage,
  bouncing, aiming, ammunition, or shooting cooldowns.
- Convert player movement or actions to Havok physics.
- Remove the existing orbiter demonstration beyond its `C` shortcut and
  runtime guidance.
- Add dependencies or change the WebGPU-first startup path.

## Decisions

### Compose a generic controller from focused controls

Introduce a `VirtualController` that receives the production GUI texture and
a configuration containing movement behavior plus zero through three action
definitions. Each action definition carries a stable identifier, text label,
optional displayed shortcut, and activation callback. The controller owns its
root layout, movement control, action controls, labels, enabled state, and
disposal.

Keep joystick math and drag capture in a focused movement-control component,
but let the new controller place and own that component. A small shared puck
factory will create both the draggable joystick puck and each action ellipse
from the same appearance values. The action ellipse itself is the pointer
target; any layout container remains transparent and has no visible square.

Extending `VirtualMovementJoystick` with game-specific Jump and Shoot fields
was rejected because it would keep presentation coupled to one game. Building
a broad input framework was rejected as unnecessary for four controls.

### Use one action definition for touch, keyboard, and displayed guidance

This game's bootstrap will define Jump with `KeyC` and display `C`, and Shoot
with `KeyV` and display `V`. Both the virtual controller and gameplay input
consume those definitions. Touch activation and a keyboard key-down edge call
the same action callback. Browser repeat events and an already-held key do not
create additional activations.

Move `C` out of `addInput` by removing the `onOrbiter` shortcut connection.
Gameplay action keys belong with `RuntimeInputController` so its enabled,
blur, and disposal lifecycle applies consistently. Runtime guidance is derived
from or kept synchronized with the same definitions.

Keeping `C` in `addInput` and adding a second action listener was rejected
because it could double-fire and would bypass gameplay disable state.

### Share the score text treatment instead of copying style literals

Extract or reuse a production text-style helper so the score and controller
labels share Arial, 700 weight, 32-pixel design size, production text color,
and the same four-pixel outline. Controller labels use the existing 48-pixel
label height and centered alignment; alignment differs from the left-aligned
score because it is layout rather than font treatment. Text wrapping remains
disabled.

Copying the current values into a second module was rejected because later HUD
style changes could make the score and controller labels drift apart.

### Lay out movement from the left and actions from the right

The virtual controller receives the current `ProductionUiLayout`. It anchors
the joystick and `Move` label to the lower-left visible safe bound. Configured
actions form a lower-right row ordered from left to right as configured. For
this game that produces Jump followed by Shoot, matching the target mockup.

The layout measures the visible width and the configured label widths. It
first reduces flexible gaps and then uniformly scales the complete control
group when the preferred layout does not fit. It never wraps a label, moves a
control outside the safe bounds, or accumulates offsets across repeated
updates. The zero-action configuration reserves no empty action space.

The controller's pointer model tracks the joystick's captured pointer and
each action press independently. An action fires on its ellipse pointer-down,
so a second pointer can act while the first continues moving. Disabling the
controller hides the root, disables hit testing, releases movement capture,
and clears action pointer state before an interactive prompt appears.

A fixed landscape-only layout was rejected because the app intentionally uses
a full-height portrait frame that may be cropped by the browser viewport.

### Implement Jump as a deterministic kinematic arc

A focused player-action controller will own jump state. A grounded activation
captures the current ground Y, then applies a normalized parabolic offset over
approximately 0.6 seconds with an approximate 1.5-world-unit peak. Horizontal
movement continues normally during the jump. Completion writes the captured
ground Y exactly to prevent drift. Further Jump activations are ignored until
completion, and level reset clears the state and restores the configured spawn
height.

The action update receives elapsed seconds from the runtime loop, making the
arc independent from render FPS. Havok impulse jumping was rejected because
the player and ground are not currently active physics bodies and enabling
them would substantially expand collision and movement scope.

### Manage each shot as a timed kinematic projectile

On Shoot, the action controller transforms local positive Z through the
player's world rotation, removes any vertical component, and normalizes it.
It creates a sphere approximately 0.5 world units in diameter just ahead of
the player and records that immutable direction. A default speed near eight
world units per second gives visible travel without leaving the scene
immediately.

Each runtime update advances every shot by elapsed seconds. At three seconds,
the controller disposes the shot mesh and removes its record. Shots may overlap
and expire independently. A shared controller-owned material avoids allocating
one material per shot; it is disposed when the action controller is disposed.
Disposal also removes all still-active shot meshes.

Using the camera direction was rejected because shooting is explicitly based
on player facing. Physics projectiles were rejected because collision and
bounce behavior are out of scope.

### Keep action updates within the existing runtime lifecycle

The action controller updates before the render-throttle return, alongside
input and fixed-step preparation, so jump and projectile time remain correct
at 30, 60, and 120 FPS targets. Quest completion disables new input but lets
an already-started jump or shot finish deterministically. Starting a level
resets jump state and clears existing shots so gameplay state does not leak
between levels.

The production HUD owns the virtual controller and disposes its GUI controls.
The main runtime owns the player-action controller and disposes it before the
engine. This ordering prevents Babylon resources from outliving their scene.

## Risks / Trade-offs

- [Three actions and labels can crowd a narrow safe area] -> Measure current
  visible bounds, reduce gaps, and uniformly scale without wrapping.
- [Pointer events can interfere with the completion prompt] -> Disable the
  entire controller and hit testing before showing the prompt.
- [The old and new `C` handlers could both run] -> Remove the orbiter action
  from `addInput` and cover one-activation routing with focused tests.
- [Jump Y can drift across resets or large frame deltas] -> Capture the ground
  height, clamp normalized progress, and assign the exact final Y.
- [Projectile meshes or material can leak] -> Centralize ownership and test
  expiry, level reset, and runtime disposal.
- [Exact tuning may need visual adjustment] -> Keep jump height, duration,
  ball size, and speed as named constants without changing behavior contracts.

## Migration Plan

1. Add failing controller, input-routing, jump, projectile, and layout tests.
2. Introduce shared controller styling and the reusable controller shell.
3. Route `C` and `V` through shared gameplay actions and remove the orbiter
   shortcut.
4. Add the player-action controller and connect its update/reset/disposal
   lifecycle.
5. Run focused and full validation, then verify desktop and portrait-mobile
   behavior in a real browser with WebGPU and WebGL fallback where available.

Rollback is additive: revert the new controller and action modules, restore
the movement-only HUD factory and `C` orbiter shortcut, and remove the focused
tests. No stored data or dependency migration is involved.
