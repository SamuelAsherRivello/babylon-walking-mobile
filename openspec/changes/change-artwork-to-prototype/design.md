## Context

The current scene bootstrap in `Babylon/src/client/scripts/index.ts` creates
the camera, loads `pixel_room.glb`, initializes Havok, adds an invisible
3.8-by-3.8 physics ground, and drops a sphere from `y = 5`. Lighting is
currently adjusted after the imported room supplies scene lights. See
`proposal.md` for the motivation and the prototype scene spec for behavior.

The same bootstrap also owns UI, input, orbiter, post-process, render-loop,
and HMR behavior that this change must preserve. The separate
`mobile-portrait-viewport` change intentionally defers camera composition to
a later feature; this change supplies that composition without changing its
viewport contract.

## Goals / Non-Goals

**Goals:**

- Make scene construction explicit enough to verify mesh names, transforms,
  materials, texture paths, lighting, and shadow registration.
- Keep solid colors in replaceable texture assets rather than baking them
  into material diffuse colors.
- Preserve existing engine, post-process, UI, input, orbiter, and render-loop
  integration.

**Non-Goals:**

- Redesign or reposition any HTML UI or debug overlay.
- Change orbiter artwork, tuning, animation, lifetime, or input mapping.
- Delete the old model asset or remove reusable physics helpers and
  dependencies from the project.
- Add player movement, collision, animation, or gameplay behavior.
- Produce a strict orthographic isometric projection.

## Decisions

### Build the prototype from Babylon primitives

Create a unit box named `Player` at `(0, 0.5, 0)` and a 20-by-20 ground
plane named `Ground` at `(0, 0, 0)`. The size leaves a margin around the
existing orbiters, whose configured radius reaches seven units.

The Player remains static. The startup path will not add physics aggregates
to either prototype mesh or drop the Player from a height. Havok helpers and
the dependency remain available for later gameplay work, but startup need not
initialize Havok when no scene object uses it.

Keeping the old sphere and merely recoloring it was rejected because it would
not establish the requested cube silhouette or bottom-at-origin transform.
Keeping the imported room hidden was rejected because it would retain an
unneeded runtime asset and could continue contributing lights or scene nodes.

### Use separate texture-backed standard materials

Create `PlayerMaterial` and `GroundMaterial`, backed respectively by
`assets/textures/player.png` and `assets/textures/ground.png`. Each initial
PNG will contain its solid prototype color. Leave material color multipliers
white so future replacement image colors render faithfully. Configure the
Ground texture to wrap and repeat across the plane; use normal box UV mapping
for the Player.

Hard-coded red and green diffuse colors were rejected because replacing them
would require a code edit. A shared material or texture was rejected because
the Player and Ground need independent replacement workflows.

### Use a perspective ArcRotateCamera on the world diagonal

Retain `ArcRotateCamera` and its existing attached controls, but initialize
it to the equivalent of position `(10, 10, 10)` with target `(0, 0, 0)`.
Setting the position explicitly after construction avoids relying on unclear
alpha and beta values and makes the intended composition inspectable.

An orthographic camera was rejected because the user requested an isometric
view as an approximate visual direction and explicitly suggested a spatial
camera position. Perspective also preserves the existing camera interaction
model with less behavioral change.

### Use one directional light and a shadow generator

Create one `DirectionalLight` near `(10, 10, 10)` and direct it at the
origin. This behaves like broad general illumination from the initial camera
direction while supporting Babylon shadow generation. Register `Player` as a
shadow caster and set `Ground.receiveShadows` to true. Use a moderate shadow
map size and filtering that provides a clear prototype shadow without adding
a new dependency or a full production lighting rig.

Ambient-only or hemispheric lighting was rejected because it cannot create
the required Player shadow. A point light was rejected because its distance
falloff and radial direction are unnecessary for this broad prototype light.
Multiple fill lights were rejected because the requested scene needs one
general source and a legible shadow direction.

### Isolate prototype construction from unrelated bootstrap behavior

Place prototype mesh, material, texture, light, and shadow setup behind a
small scene-construction function rather than expanding the main bootstrap
block. Return or otherwise expose the created nodes sufficiently for focused
tests. Keep camera setup close to the existing bootstrap unless extracting it
materially improves testability.

Editing UI and orbiter modules was rejected because their observable behavior
is explicitly outside this artwork change.

### Verify object contracts and the rendered result

Use focused automated tests to inspect node names, transforms, material
separation, texture paths, camera placement and target, light direction, and
shadow configuration. Follow with the full test suite, type checking, build,
and a real-browser check of the initial scene and C-key orbiter behavior.

Source-text assertions alone were rejected for object relationships that a
Babylon scene or focused construction test can validate directly. Browser
verification remains necessary because automated object checks cannot prove
the red, green, composition, and shadow result is visually legible.

## Risks / Trade-offs

- [A single directional light leaves back-facing surfaces dark] -> Place it
  along the camera diagonal and tune intensity so all initially visible cube
  faces remain legible without adding another light.
- [Shadow bounds clip after camera or plane changes] -> Configure the
  directional shadow projection to cover the 20-by-20 prototype area and
  verify the initial and moved-camera views in a browser.
- [Ground replacement artwork appears too dense or too sparse] -> Choose an
  explicit initial repeat value and keep it localized to the Ground texture
  configuration for easy later tuning.
- [The portrait viewport crops a fixed camera composition] -> Verify the
  scene in the intended 9:16 viewport as well as a desktop viewport without
  changing the separate viewport requirements.
- [Removing startup physics hides an unintended dependency] -> Run the full
  tests and exercise C-key orbiters; retain physics modules and packages so
  later gameplay can restore initialization deliberately.

## Migration Plan

1. Add focused failing coverage for the prototype scene contract.
2. Add the two solid-color texture assets and prototype scene construction.
3. Replace the imported room, physics ground, and bouncing sphere bootstrap
   with the prototype scene and retuned camera.
4. Run focused and full automated checks, then build the production bundle.
5. Verify Player, Ground, camera controls, lighting, shadow, UI, and orbiters
   in a real browser at desktop and portrait sizes.

Rollback consists of reverting the prototype scene constructor, texture
assets, bootstrap integration, and focused tests. No stored data, public API,
dependency, or destructive asset migration is involved.
