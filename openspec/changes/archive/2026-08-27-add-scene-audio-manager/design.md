## Context

The Babylon client starts from `index.ts`, creates a full-window canvas, and
routes canvas clicks through `addInput.ts`. The existing `playSound.ts` helper
only clones one-off effects, has no volume control, and is still called with
the removed `Pop01.mp3` asset. See `proposal.md` for motivation and
`specs/scene-audio/spec.md` for required behavior.

Browser autoplay policies can reject music until a user gesture occurs. A
startup request therefore cannot guarantee immediate audible playback on
every browser.

Background music is temporarily muted at the user's request, while the music
implementation remains available for later restoration.

## Goals / Non-Goals

**Goals:**

- Give music and sound effects one owner with explicit volume settings.
- Keep simultaneous sound effects independent.
- Recover cleanly when startup music is blocked by autoplay policy.
- Restore music later through one explicit configuration change.
- Keep the module testable without constructing the Babylon scene.

**Non-Goals:**

- Add settings UI, mute controls, persistence, fades, or playlists.
- Select different sounds based on the clicked scene object.
- Introduce a third-party audio library or spatial audio.

## Decisions

### Use a browser-audio manager

Add a focused `SoundManager` around `HTMLAudioElement`. It will own one music
element and cached sound-effect templates. Each effect playback clones its
template so rapid clicks can overlap.

This keeps audio independent of Babylon scene lifetime details and avoids a
new dependency. Using Babylon audio nodes was considered, but it would couple
simple non-spatial UI feedback to the rendering engine without adding value.

### Inject audio creation

Accept an audio-element factory with `Audio` as the production default. Unit
tests can supply deterministic fakes for play requests, volumes, looping,
cloning, and rejected promises without relying on browser media support.

### Gate music behind one bootstrap flag

Define `backgroundMusicEnabled = false` near the volume constants. Both the
startup play request and click-based resume request will run only when this
flag is true. The click effect remains independent and always plays.

When enabled, the bootstrap will start music after the prototype scene is
created. The manager will retain whether playback succeeded. Canvas click
handling will ask it to resume blocked music before playing the click effect.

The first successful gesture clears the retry state, preventing later clicks
from restarting music. Removing music setup entirely was considered, but a
single flag better preserves the tested implementation for later restoration.

### Route click audio through the existing input boundary

Extend the existing input actions with an optional click callback. The canvas
listener will retain coordinate logging and invoke this callback once for
every click. This avoids a second competing click listener in the bootstrap.

### Keep tunable values near bootstrap configuration

The selected asset paths and provisional volumes will be explicit constants:
music `0.15` and click SFX `0.35`. The nearby music-enable flag will default
to false. The manager API will accept the volumes so later tuning does not
require changing playback internals.

## Risks / Trade-offs

- [Enabled startup music is browser-dependent] -> Retry after the first
  canvas click and keep rejected playback non-fatal.
- [Some audio formats vary across browsers] -> Use the supplied OGG and WAV
  assets and verify them in the project's supported browser.
- [Rapid clicking creates overlapping elements] -> Use short cloned effects
  and release each instance after it ends.
- [Existing dirty work overlaps `index.ts`] -> Make a narrow additive edit and
  preserve all unrelated working-tree changes.

## Migration Plan

Add the manager and tests, connect it to scene startup and input, and remove
the obsolete `Pop01.mp3` bootstrap reference. Leave
`backgroundMusicEnabled` false until music is requested again. Rollback is
limited to reverting these additive integration points; no stored data or
schema migration exists.
