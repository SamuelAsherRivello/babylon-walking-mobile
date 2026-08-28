## Context

The player is a Babylon `TransformNode`, and the existing HUD is separate
from scene objects. See proposal.md - Why. This element needs true in-world
placement rather than a screen overlay.

## Goals / Non-Goals

**Goals:**

- Attach a circular visual above the player and make it camera-facing.
- Keep rendering independent from work-state ownership.
- Update the visual from work progress without text or hover interaction.
- Dispose every Babylon resource created by the component.

**Non-Goals:**

- A screen-space HUD replacement or input control.
- Persisting progress or implementing work timing in the visual component.

## Decisions

- Use a small Babylon mesh parented to the player, with a Babylon GUI texture
  created for that mesh. This gives automatic world-position following and
  3D depth/occlusion. A fullscreen GUI projected from the player was rejected
  because it is screen-space and requires per-frame projection calculations.
- Enable billboard behavior so the circular meter faces the camera while the
  player moves and the camera orbits. Touch input is unaffected because the
  meter is non-interactive.
- Expose start/end/current values and background/progress colors through a
  typed options object. The component clamps values and maps normalized
  progress to the circular fill.
- The gameplay controller owns the work-to-meter binding; the meter owns its
  mesh, material/GUI texture, and controls. This prevents rendering code from
  mutating quest or inventory state.

## Risks / Trade-offs

- [World-space readability] A fixed-size meter can become small at distance.
  Mitigation: choose a modest world size and validate desktop and portrait
  mobile camera views.
- [Occlusion] Geometry can hide the meter, which is correct for in-world UI.
  Mitigation: place it above the player and validate the Apple-zone camera.
- [GUI texture cost] Each meter uses a Babylon GUI texture. Mitigation: use
  one meter instance for the player and dispose it with the scene lifecycle.

## Migration Plan

Create the meter during player scene setup, bind it to Apple work updates,
and remove the direct immediate-award presentation. No asset, dependency, or
stored-data migration is required.
