## Context

The current prototype scene creates a flat Ground at `y = 0`, a Player at the
origin, and one shared directional shadow generator. Startup construction is
currently synchronous. The Maple Tree 4 glTF bundle is already present under
`Babylon/public/assets/models/tree` and references a sibling binary buffer and
three sibling textures. See `proposal.md` for motivation and the
`placeable-trees` spec for behavior.

The source model is approximately 3.59 units tall, but its geometry extends
slightly below its authored origin. The project already depends on
`@babylonjs/loaders`, and authored code must remain within 80 characters per
line.

## Goals / Non-Goals

**Goals:**

- Expose one operation that fully places a tree from a type and contact point.
- Keep model loading, instantiation, grounding, and shadow setup outside the
  startup module.
- Make repeated placements efficient and independently transformable.
- Keep placement calculations testable without a browser or network request.

**Non-Goals:**

- Add collision, chopping, interaction, animation, or persistence.
- Conform trees to sloped or deformable terrain.
- Optimize or replace the supplied high-resolution textures.
- Add procedural distribution, random variation, or more tree assets.
- Alter camera composition, player movement, HUD, or ground dimensions.

## Decisions

### Use a scene-owned tree spawner with a typed catalog

Create a small spawner that receives the Scene, base URL, and shared shadow
generator. Its public placement operation accepts a supported tree type and a
world contact position, then returns the created instance asynchronously. A
catalog entry maps `maple-4` to its glTF path and leaves a clear extension point
for future variants.

A general scene-prop loader was rejected because the current contract is
specifically about tree grounding and tree instances. Direct loader calls in
startup were rejected because they would repeat placement and shadow logic.

### Cache an AssetContainer promise per tree type

Load the source glTF into an AssetContainer on first use and cache that pending
or completed operation. Instantiate models from the container for every call.
Caching the promise prevents simultaneous first placements from starting
duplicate loads. Each returned root remains independently transformable.

Importing the glTF for every tree was rejected because it repeats texture,
network, and parsing work. Cloning a previously visible tree directly was
rejected because an AssetContainer provides an explicit reusable source and
owns the loaded asset lifecycle.

### Treat the requested position as the tree contact point

After instantiation, parent the imported roots beneath one placement root.
Apply the requested horizontal translation, update world matrices, and compute
the aggregate world-space minimum Y across rendered child meshes. Translate
the placement root vertically by `requestedY - minimumY`, then refresh bounds.

Using the imported node origin directly was rejected because Maple Tree 4
extends slightly below it and future assets may use different origins. A
hard-coded correction was rejected because it would not generalize.

### Register rendered child meshes with the existing shadow generator

Add every instantiated render mesh to the prototype shadow generator. Do not
create a second light or shadow map. Preserve the Ground's existing
`receiveShadows` setting and the glTF-authored PBR materials, alpha blending,
normal map, and double-sided flags.

Replacing the imported materials was rejected because the supplied textures
and leaf transparency already form the intended tree appearance.

### Await the demonstration tree before removing the startup loader

Retain the prototype scene result, construct the spawner after its shadow
generator exists, and await a `maple-4` placement at `(3, 0, -3)`. Startup is
already asynchronous, so the scene can finish loading the tree before hiding
the loader and entering the normal visible state.

Placing at the origin was rejected because the Player occupies it. The chosen
position is inside the 20-by-20 Ground and offset from the initial focal point.

### Verify geometry contracts and the rendered result

Use focused tests for catalog routing, loader caching, independent instances,
aggregate-bottom alignment, and shadow registration. Use an integration check
for startup placement, followed by the full suite, type check, build, and a
real-browser inspection at desktop and portrait dimensions.

## Risks / Trade-offs

- [The supplied normal map is about 22 MB] -> Accept it for the first visible
  integration and record texture optimization as separate mobile work.
- [Asset loading makes startup asynchronous] -> Cache load promises and await
  the demonstration tree before completing startup presentation.
- [Leaf alpha blending can be order-sensitive] -> Preserve the glTF material
  and verify the canopy visually in the browser.
- [Imported root structures can vary by tree type] -> Calculate aggregate
  rendered bounds rather than depending on one named child mesh.
- [Active player-control work overlaps startup] -> Make minimal additive edits
  around the current prototype result and do not revert unrelated changes.

## Migration Plan

1. Add focused failing placement and startup tests.
2. Add the tree spawner and the loader registration needed for glTF assets.
3. Add one startup placement using the existing Maple Tree 4 bundle.
4. Run focused and full automated checks, type checking, and production build.
5. Inspect the live tree, ground contact, shadow, player, and controls in a real
   browser at desktop and portrait sizes.

Rollback consists of removing the startup placement and spawner module. The
existing asset files can remain unused without affecting runtime behavior.
