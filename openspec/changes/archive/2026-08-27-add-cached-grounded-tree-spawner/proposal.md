## Why

The prototype world has no reusable way to place imported scenery. A
placeable-tree capability establishes the first textured environment prop and
lets future scene code add tree variants without repeating loading, grounding,
or shadow setup.

## What Changes

- Add a reusable tree spawner with one public operation for adding a selected
  tree type at an arbitrary world contact position.
- Load and cache tree source assets so repeated placements do not repeat
  network and parsing work.
- Align each tree's lowest rendered point with the requested ground-contact
  height instead of relying on the model author's origin.
- Register all rendered tree meshes as shadow casters.
- Place one Maple Tree 4 instance away from the player at startup.
- Preserve the existing player, ground, camera, HUD, controls, and orbiter
  behavior.

## Capabilities

### New Capabilities

- `placeable-trees`: Loading, grounding, positioning, shadow registration, and
  initial demonstration of reusable tree instances.

### Modified Capabilities

None.

## Impact

The change affects Babylon scene construction, startup sequencing, focused
scene tests, and the tree asset bundle under
`Babylon/public/assets/models/tree`. It uses the existing
`@babylonjs/loaders` dependency and adds no new package.
