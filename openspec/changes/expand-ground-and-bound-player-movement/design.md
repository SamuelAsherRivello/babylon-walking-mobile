## Context

See `proposal.md` for motivation and the bounded-walkable-ground spec for the
behavior contract. The current prototype creates a centered 20-by-20 Ground,
and `RuntimeInputController.update()` directly advances Player X/Z position.
The render loop then updates zones from that position. Zone visuals currently
own a private dashed-border builder plus a translucent fill and title.

The active input work already unifies keyboard and virtual-joystick motion.
This change must constrain their shared result without adding another input
path or changing movement tuning. Authored code remains limited to 80
characters per line.

## Goals / Non-Goals

**Goals:**

- Keep one rectangle authoritative for movement limits and border placement.
- Reuse ground-area fill and border presentation without zone semantics.
- Preserve existing zone APIs, visual behavior, and resource disposal.
- Keep confinement deterministic and independently testable.

**Non-Goals:**

- Add physical wall meshes, Havok collision, terrain, or pathfinding.
- Support rotated, polygonal, circular, or per-zone movement boundaries.
- Change player speed, turning, camera controls, zone layout, or quest logic.
- Move destinations into the newly visible area outside the border.

## Decisions

### Represent the walkable area as one world-owned rectangle

Create a focused walkable-area object centered at the origin with explicit X
and Z dimensions. It owns the boundary visual and exposes a method that
constrains a proposed or updated Player position. Game-world creation returns
this object with the existing prototype, zones, and trees.

Separate size constants in the Ground, border, and render loop were rejected
because they could drift. Physics collision was rejected because the scene's
physics behavior is intentionally disabled and the boundary is axis-aligned.

### Extract reusable ground-area presentation from zones

Move the zone fill and dashed-border construction into a focused reusable
ground-area visual. Its options include identifier, center, X/Z dimensions,
border presentation, and an optional translucent fill. It returns owned root,
fill, material, and border resources as applicable.

`WorldZone` composes this visual and continues to own titles, occupancy,
colors, observables, and its public surface. The walkable area composes the
same border without a fill, so the Ground texture remains unobscured.

Exporting only the current private border function was rejected because fill
and border positioning, non-pickable behavior, height offsets, and disposal
form one reusable ground-area presentation concern. Reusing a full
`WorldZone` was rejected because walkable bounds have no title, occupancy, or
trigger state.

Each composed object disposes its visual resources through its own `dispose()`
method. Zone disposal delegates to the visual while retaining title and
observable cleanup. The game world owns the walkable-area instance; scene and
engine disposal remain the final runtime cleanup boundary.

### Preserve Ground texture density with world-space repeat scaling

Increase the Ground plane from 20-by-20 to 100-by-100. Derive its U and V
repeat values from the existing density of ten repeats per 20 world units,
which produces 50 repeats across the new dimensions.

Keeping the repeat value at ten was rejected because it would enlarge the
texture tiles by a factor of five. Stretching a single texture copy was
rejected because it would discard the established tiled presentation.

### Constrain after shared motion and before zone evaluation

In each update, first let `RuntimeInputController` apply its existing keyboard
or joystick motion. Then constrain Player X and Z through the walkable area,
and only afterward update zones. This order also constrains deceleration and
ensures zone occupancy observes the final valid position.

Putting limits inside keyboard or joystick handlers was rejected because the
two paths could diverge and deceleration occurs outside input events. Applying
the constraint after zone updates was rejected because zones could briefly
observe an unreachable position.

### Use a conservative, rotation-independent Player clearance

Derive a ground-plane clearance from the Player's initial X/Z bounding
dimensions. Use the half-diagonal as a conservative radius and reduce each
walkable half-extent by that clearance. This keeps the rotating unit cube's
footprint inside the border without recalculating bounds as it turns.

Clamp X and Z independently. A diagonal approach can therefore continue along
an open axis, while a corner clamps both axes. The motion controller retains
its existing speed and heading state so movement directed back inward remains
responsive.

Center-only confinement was rejected because half of the Player could cross
the visible border. Dynamic rotated bounding boxes were rejected because a
turn near an edge could move or jitter the Player even without translation.
Clearing all speed on contact was rejected because it would prevent natural
edge sliding and change existing motion tuning.

### Keep the boundary world-space and input-independent

The border and constraint use fixed world X/Z coordinates. Camera orbit,
viewport resize, portrait cropping, and rendering backend selection do not
recreate or resize the boundary. Touch behavior changes only in that joystick
movement is constrained by the same post-motion step as keyboard movement.

## Risks / Trade-offs

- [The conservative radius leaves a small gap for axis-aligned Player faces]
  -> Prefer guaranteed containment for every Player heading over a boundary
  that changes while the Player rotates.
- [Dashed lines can depth-fight with the enlarged Ground] -> Preserve the
  existing small vertical border offset and verify both rendering backends.
- [Refactoring zone visuals can change established public fields] -> Preserve
  current `WorldZone` access and add focused regression tests before reuse.
- [The Ground increases fragment coverage] -> Keep one unsubdivided plane and
  reuse the existing material, texture, lighting, and render scheduling.
- [Future levels may need different boundaries] -> Keep dimensions on the
  walkable-area object so level-specific configuration can be added later.

## Migration Plan

1. Add failing tests for reusable ground-area visuals and unchanged zones.
2. Add failing tests for Ground size, texture density, and movement bounds.
3. Extract ground-area presentation and compose zones and walkable bounds.
4. Connect confinement between runtime movement and zone evaluation.
5. Run focused tests, the full suite, type checking, and production build.
6. Verify edge, corner, keyboard, and joystick behavior in real browsers on
   desktop and portrait mobile under WebGPU and WebGL fallback.

Rollback removes the walkable-area integration and reusable visual, restores
the original Ground dimensions and repeats, and returns zone composition to
its prior implementation. No stored data or dependency migration is involved.
