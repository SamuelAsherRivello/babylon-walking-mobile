## Context

The prototype scene currently creates a textured 20-by-20 ground and a
one-unit player mesh. `RuntimeInputController.update()` changes the player's
X/Z position before the frame is rendered. Babylon core and GUI are already
available, and authored files must remain at 80 characters per line or less.

The active keyboard-controls change owns movement behavior. Zones must observe
the resulting player position without adding another input path or modifying
movement.

## Goals / Non-Goals

**Goals:**

- Keep zone geometry, occupancy, visual state, and notifications together in
  a reusable world object.
- Make the containment rule deterministic and independently testable.
- Allow multiple zones to be created and updated without shared occupancy.
- Keep the initial integration small enough to extend with gameplay actions.

**Non-Goals:**

- Add physics triggers, player collision, pathfinding, scoring, or persistence.
- Support circles, arbitrary polygons, terrain projection, or rotated zones.
- Make the label face the camera or remain screen-upright through a full orbit.
- Add an editor or runtime interface for placing zones.

## Decisions

### Create zones through a focused factory

Add a `createZone(scene, options)` function in a dedicated `zone.ts` module.
Options contain an identifier, title, X/Z center, `size_x`, `size_z`, visual
state colors, and enabled and triggerable flags. Both sizes default to three.
The factory returns a `WorldZone` object that owns its visuals, occupancy
state, enter and exit observables, `update(playerPosition)`, and `dispose()`.

A method on the prototype scene result was rejected because zones are general
world objects rather than properties of the player, ground, or lighting. A
zone manager was deferred because a simple array can update multiple zones
without adding another lifecycle abstraction.

### Compose each zone from ground-aligned visual elements

Use a parent transform at the configured world position. Attach a rectangular
ground mesh with a transparent, unlit material; a segmented line border; and a
small horizontal title mesh using a mesh-bound GUI texture. Offset the visual
elements slightly above the ground to avoid depth fighting. Disable picking,
shadow participation, and physics behavior on all zone visuals.

The title placement accepts `side-1` or `side-2` plus a positive scale. Each
side is defined relative to the zone so the creation call stays meaningful in
world space. Side two is the adjacent lower-right edge shown in the supplied
annotation. It uses the positive-X zone edge and a negative quarter-turn
around world Y. This is a 180-degree reversal from the original side-2 title
orientation. The title mesh is centered at local Z zero so it remains centered
on its nearest edge. Scale one maps to the current approved title size and is
the default.

A fullscreen GUI label was rejected because it would be screen-space rather
than drawn as part of the marked ground area. A camera-facing billboard was
rejected because it would not look painted onto the ground.

### Use player-center containment on the X/Z plane

Containment compares the player's world X/Z position with the inclusive
axis-aligned half extents of the zone. The player's Y position is ignored.
This makes entry independent of the player's visual height and matches the
requested ground-area semantics.

Full mesh intersection was rejected because the player would enter when a
corner first touched the rectangle, making the visible boundary less clear.
Physics triggers were rejected because the scene has physics disabled and
zones must remain non-diegetic.

### Store state and emit only boundary transitions

Each zone stores `isPlayerInside`, `isEnabled`, and `isTriggerable`. Its update
operation ignores player crossings while disabled. On an enabled transition,
it swaps the default background for confirmation green when triggerable or
negation red when not triggerable, then notifies the matching observable. Exit
restores the default background. All three states use the same partial opacity.

Polling directly from the render loop is preferred over subscribing to input
events because player motion includes acceleration and deceleration after key
events. Babylon observables provide a small extension seam for later goal or
location logic without coupling it to the color change.

### Evaluate zones immediately after player movement

Create the initial `GOAL` zone during startup and retain it in a zones array.
In each render-loop iteration, update zones immediately after
`RuntimeInputController.update()` and before the frame-rate throttle. This
keeps transitions current even when the configured render rate skips a frame.

The goal starts away from the origin but within the 20-by-20 ground so the
player begins outside and can visibly enter and exit it.

## Risks / Trade-offs

- [Coplanar visuals can flicker against the ground] -> Use small, consistent
  vertical offsets for the fill, border, and label.
- [A ground-aligned title can appear upside down from the opposite camera
  side] -> Preserve the reference appearance now and revisit label orientation
  only if camera playtesting shows it harms usability.
- [Very small zones can make an adjacent label overlap the fill] -> Validate
  positive dimensions and size the title surface independently from the zone.
- [Large frame deltas can skip over a narrow zone without sampling inside] ->
  Accept point sampling for this prototype; swept detection can be added if
  later movement speeds or teleportation require it.
- [Existing uncommitted scene work overlaps startup integration] -> Make a
  focused additive edit around the established prototype and runtime input
  calls without replacing unrelated changes.

## Migration Plan

1. Add failing zone behavior and startup integration tests.
2. Add the reusable zone module and its visual composition.
3. Create the prototype `GOAL` zone and update it after player movement.
4. Run focused tests, type checking, the full unit suite, the production build,
   and real-browser entry and exit checks.

Rollback consists of removing the startup zone integration and zone module.
No stored data or dependency migration is involved.
