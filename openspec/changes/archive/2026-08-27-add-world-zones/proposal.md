## Why

The prototype world has a ground and a movable player, but it has no reusable
way to mark destinations or detect when the player crosses them. World zones
provide visible, ground-locked areas that later gameplay can use as goals and
other location triggers.

## What Changes

- Add a reusable method for creating rectangular zones at arbitrary ground
  positions with configurable dimensions and titles.
- Render zones as non-diegetic, darkened ground overlays with visible borders
  and ground-aligned titles.
- Track each zone's inside or outside state from the player's ground position.
- Change a zone's fill clearly when the player enters it and restore the idle
  fill when the player exits it.
- Expose single-fire enter and exit notifications for future gameplay logic.
- Give zones enabled and triggerable flags that default to `true`.
- Give zones configurable default, confirmation, and negation backgrounds.
- Name zone dimensions `size_x` and `size_z`, each defaulting to three.
- Add an initial zone titled `GOAL` to the prototype world.

## Capabilities

### New Capabilities

- `world-zones`: Creation, presentation, occupancy detection, and transition
  notification behavior for ground-locked rectangular world zones.

### Modified Capabilities

None.

## Impact

- Adds a focused world-zone module under the Babylon client scripts.
- Connects zone creation and updates to the prototype scene bootstrap and
  render loop.
- Adds unit and bootstrap coverage under the existing client test suite.
- Uses the existing Babylon core and GUI dependencies; no new package is
  required.
