## 1. Placement Contracts

- [x] 1.1 Add focused failing tests for arbitrary contact positions, model
  bottom alignment, independent instances, and shadow registration; run the
  focused test file and confirm it fails because the tree spawner is absent.
- [x] 1.2 Add a failing startup contract test for one `maple-4` placement at
  `(3, 0, -3)` and confirm it fails against the current bootstrap.

## 2. Reusable Tree Placement

- [x] 2.1 Add the typed tree catalog and scene-owned tree spawner with one
  asynchronous placement operation; verify the focused API tests pass.
- [x] 2.2 Load each tree type into a cached AssetContainer promise and create
  independent instances; verify repeated placement performs one source load.
- [x] 2.3 Align aggregate rendered bounds with the requested contact height
  and register all rendered meshes with the shared shadow generator; verify
  grounding and shadow tests pass.

## 3. Startup Integration

- [x] 3.1 Register the Babylon glTF loader and place one Maple Tree 4 at
  `(3, 0, -3)` during startup; verify the startup contract test passes.
- [x] 3.2 Preserve the existing prototype result, Player, Ground, camera,
  controls, HUD, and orbiter integration; verify affected integration tests
  pass.

## 4. Verification

- [x] 4.1 Run the focused tree and prototype tests, then the full unit suite,
  TypeScript check, and production build; confirm all commands pass and
  authored code stays within 80 characters per line.
- [x] 4.2 Run the app and inspect desktop and portrait browser views; confirm
  the textured tree is visible away from the Player, rests on the Ground,
  casts a shadow, and existing controls remain operational.
