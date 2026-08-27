## Why

The current 20-by-20 Ground ends at the same approximate area where gameplay
occurs, but player movement is unbounded and can leave it. The world needs a
larger visual ground plus a clearly marked, authoritative walkable area that
keeps the player inside the intended gameplay space.

## What Changes

- Expand the centered Ground from 20-by-20 to 100-by-100 while preserving its
  current world-space texture density.
- Define a centered 20-by-20 walkable rectangle matching the former Ground
  footprint.
- Prevent the Player's footprint from crossing the walkable rectangle while
  allowing movement to slide along its edges and into its corners.
- Draw the existing segmented zone-border style around the walkable area so
  players can see the movement limit.
- Extract the zone fill and border presentation into reusable ground-area
  visuals that can be used without zone occupancy or title behavior.
- Preserve equivalent behavior on desktop and portrait mobile under WebGPU
  and the WebGL fallback.
- Add no dependencies.

## Capabilities

### New Capabilities

- `bounded-walkable-ground`: Enlarged ground presentation, visible walkable
  bounds, and player movement confinement on the world X/Z plane.

### Modified Capabilities

None.

## Impact

- Changes prototype Ground dimensions and texture tiling in
  `Babylon/src/client/scripts/prototypeScene.ts`.
- Adds a reusable ground-area visual module or focused equivalent and composes
  existing zones from it without changing zone behavior.
- Adds walkable-area state to game-world creation and constrains player motion
  between runtime input updates and zone occupancy updates.
- Adds focused Vitest coverage for visual dimensions, reusable borders,
  footprint-aware bounds, edge sliding, and startup integration.
- Requires real-browser verification on desktop and portrait mobile with both
  supported rendering paths; it adds no data migration or external service.
