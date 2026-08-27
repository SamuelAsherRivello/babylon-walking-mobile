## Why

The scene currently has no reusable audio system and references a removed
one-off sound asset. A centralized manager will make background music and
interaction feedback consistent and easy to tune.

## What Changes

- Add a sound manager that owns music and sound-effect playback.
- Keep looping `invincible.ogg` available behind an explicit enable flag,
  with music disabled temporarily by default.
- Play `rotate.wav` at a provisional volume for every canvas click.
- When music is enabled, recover from browser autoplay blocking by retrying
  playback from a user click.
- Cover audio configuration and scene integration with automated tests.

## Capabilities

### New Capabilities

- `scene-audio`: Background music and click sound-effect behavior for the
  Babylon scene.

### Modified Capabilities

None.

## Impact

The change affects the Babylon client bootstrap, canvas input integration,
and a new client-side audio module and tests. It uses the existing browser
audio API and public audio assets, with no new package dependency.
