## 1. Prototype Scene Contract

- [x] 1.1 Add focused tests for Player and Ground names, dimensions,
  transforms, unique materials, texture paths, and Ground texture tiling;
  run the focused tests and confirm they fail against the current scene.
- [x] 1.2 Add focused tests for the initial camera position and target, the
  single directional light, Player shadow casting, and Ground shadow receipt;
  run the focused tests and confirm they fail for the missing behavior.

## 2. Prototype Assets and Scene Construction

- [x] 2.1 Add solid red `player.png` and solid green `ground.png` beneath
  `Babylon/public/assets/textures`; verify both files decode and report the
  intended colors.
- [x] 2.2 Add the prototype scene-construction module with the unit `Player`,
  20-by-20 `Ground`, named texture-backed materials, and tiled Ground texture;
  run the focused mesh and material tests and verify they pass.
- [x] 2.3 Add the directional light and shadow generator, register `Player`
  as a caster and `Ground` as a receiver, and run the focused lighting and
  shadow tests to verify the required relationships.

## 3. Bootstrap Integration

- [x] 3.1 Replace startup loading of the room, physics ground, and bouncing
  sphere with the prototype scene constructor; run the focused tests and
  verify no room or bouncing-sphere node is created at startup.
- [x] 3.2 Set the perspective camera to `(10, 10, 10)` looking at the origin
  while preserving attached controls; run the focused camera tests and verify
  they pass.
- [x] 3.3 Remove only bootstrap imports and initialization made obsolete by
  the prototype scene, retain reusable assets, physics modules, and packages,
  and run `npm.cmd run check` from `Babylon` to verify type correctness.

## 4. Regression and Visual Verification

- [x] 4.1 Run `npm.cmd run run_unit_tests` and `npm.cmd run build` from
  `Babylon`; verify the full suite and production build pass.
- [x] 4.2 Open the built scene in a real browser at desktop and portrait
  sizes; verify the red Player rests at the origin, the green Ground surrounds
  it, the camera is elevated and diagonal, and the Player shadow is visible.
- [x] 4.3 Exercise mouse camera control, C-key orbiter creation, fullscreen,
  debug shortcuts, stored preferences, and enabled UI; verify their visible
  behavior is unchanged and no UI or input module was modified.
