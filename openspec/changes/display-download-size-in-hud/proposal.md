## Why

Players and testers can identify the release version in the production HUD,
but cannot see how large the published game is to download. Showing the total
release artifact size beside the version makes the build's delivery footprint
visible in screenshots and runtime checks.

## What Changes

- Calculate the total byte size of the final Vite release artifact during the
  existing release build.
- Store the calculated size with the checked-in runtime release metadata.
- Load and display the size next to the release version in the production HUD.
- Format the value as one decimal megabyte with an `Mb` suffix, for example
  `v0.0.0 100.0Mb`.
- Show only the version when size metadata is missing or malformed.
- Keep the display on one line on desktop and portrait mobile layouts.
- Preserve WebGPU-first startup and WebGL fallback behavior.
- Add no dependencies.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `production-hud`: Add the published build download-size label beside the
  release version.

## Impact

- Release workflow size calculation and runtime environment metadata.
- Runtime metadata loading and production HUD construction.
- Production HUD, release metadata, and workflow tests.
- Desktop and portrait-mobile browser verification.
- No gameplay, touch-control, rendering-engine, or dependency changes.
