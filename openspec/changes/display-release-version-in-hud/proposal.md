## Why

Players and testers cannot currently identify which published game release
they are running from the game screen. The production HUD should display the
  release tag stored with that exact build so screenshots and reports can be
matched to an immutable GitHub Release.

## What Changes

- Load the displayed version from a checked-in runtime environment file.
- Seed that file with the current GitHub Release and have the release workflow
  rewrite it from each triggering release tag before building.
- Use `V0.0.0` only when the runtime environment file cannot supply a version.
- Reorder the upper-left production HUD as version, `Babylon Walking` title,
  a shared three-digit level and score line, then the inventory slots.
- Display the version in smaller text than the other HUD labels and normalize
  its visible prefix to uppercase `V`.
- Remove the visible `Inventory` label entirely.
- Keep every HUD label visible on one line inside the safe game-frame area on
  desktop and portrait mobile viewports.
- Preserve WebGPU-first startup and WebGL fallback behavior.
- Add no dependencies.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `production-hud`: Add a permanent build-version label sourced from the
  release build and define the reordered upper-left HUD presentation.

## Impact

- Release publishing workflow and its configuration tests.
- Runtime environment asset and asynchronous game bootstrap wiring.
- Babylon GUI production HUD ownership, layout, and focused tests.
- Desktop and portrait-mobile browser verification of safe-area placement.
- No gameplay, touch-control, rendering-engine, or dependency changes.
