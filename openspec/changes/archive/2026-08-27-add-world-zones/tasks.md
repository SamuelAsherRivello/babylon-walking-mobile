## 1. Zone Behavior Tests

- [x] 1.1 Add failing unit tests for configurable geometry, inclusive X/Z
  containment, independent overlapping zones, and initial outside state; verify
  the focused zone test fails for the missing implementation.
- [x] 1.2 Add failing transition tests for idle and occupied colors plus
  single-fire enter and exit notifications; verify the focused zone test fails
  for the missing state behavior.

## 2. Reusable Zone Implementation

- [x] 2.1 Add the typed `createZone` factory and `WorldZone` lifecycle with
  validated options, occupancy state, observables, and disposal; verify the
  containment and transition tests pass.
- [x] 2.2 Add the elevated translucent fill, segmented border, and
  ground-aligned title without collision, physics, picking, or shadows; verify
  geometry and material assertions pass under the Babylon null engine.

## 3. Prototype Integration

- [x] 3.1 Add a failing bootstrap test for a `GOAL` zone created away from the
  player and updated after runtime movement; verify the focused bootstrap test
  fails before integration.
- [x] 3.2 Create the prototype `GOAL` zone and update the zones array after
  player movement in the render loop; verify the focused bootstrap and zone
  tests pass.

## 4. Verification

- [x] 4.1 Run type checking, the full unit suite, and the production build;
  verify all commands pass with authored lines at 80 characters or fewer.
- [x] 4.2 Run the prototype in a real browser and verify the `GOAL` zone stays
  fixed to the ground, changes clearly on entry, restores on exit, and never
  obstructs player movement.

## 5. Title Placement Follow-up

- [x] 5.1 Add failing zone and bootstrap assertions for side-two placement,
  reversed direction, two-times text scale, edge centering, and observable
  enter and exit hooks; verify the focused tests fail before implementation.
- [x] 5.2 Add title-side and title-scale creation inputs, update the prototype
  call, and retain color transitions and boundary observables; verify the
  focused zone and bootstrap tests pass.
- [x] 5.3 Run type checking, the complete unit suite, the production build,
  line-length validation, and real-browser entry and exit checks; verify the
  updated title and both zone colors visibly match the request.

## 6. Zone Configuration and Visual States

- [x] 6.1 Add failing tests for scale-one title sizing, enabled and triggerable
  defaults, configurable backgrounds, green confirmation, red negation, and
  disabled-zone behavior.
- [x] 6.2 Implement the new defaults and parameters while preserving the
  approved current title size and partial background opacity.
- [x] 6.3 Update the prototype call and verify focused tests, type checking,
  the full suite, production build, line lengths, strict OpenSpec validation,
  and the running browser scene.

## 7. Zone Size Defaults

- [x] 7.1 Add failing tests for the `size_x` and `size_z` option names, their
  three-unit defaults, and the updated level definitions.
- [x] 7.2 Replace the width and depth options with defaulted size parameters,
  then verify focused tests, type checking, the build, line lengths, and the
  running browser scene.
