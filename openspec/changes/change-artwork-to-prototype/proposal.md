## Why

The current furnished room and bouncing sphere obscure the simple spatial
relationships needed while prototyping gameplay. A deliberately minimal
scene will make the player, ground, camera, lighting, and shadows easy to
inspect and replace independently.

## What Changes

- Stop loading the furnished room model at startup.
- Replace the bouncing sphere with a static red cube named `Player` whose
  bottom rests at the world origin.
- Replace the small invisible floor with a large green plane named `Ground`.
- Give `Player` and `Ground` unique named materials and replaceable texture
  files that initially provide their solid colors.
- Present the scene from an elevated diagonal camera looking at the origin.
- Illuminate the scene from approximately the camera direction and cast the
  Player's shadow onto the Ground.
- Preserve the existing UI, shortcuts, camera controls, and C-key orbiter
  behavior.

## Capabilities

### New Capabilities

- `prototype-scene-artwork`: Defines the minimal Player and Ground artwork,
  replaceable materials and textures, initial camera composition, lighting,
  and Player shadow.

### Modified Capabilities

None.

## Impact

- Affects Babylon scene construction, camera setup, lighting, materials,
  textures, shadows, physics setup, and related client tests.
- Adds two small texture assets beneath the existing public asset tree.
- Removes the room model and bouncing sphere from runtime scene startup but
  does not require deleting their source assets.
- Does not change UI code, input mappings, orbiter behavior, public APIs,
  stored preferences, or project dependencies.
