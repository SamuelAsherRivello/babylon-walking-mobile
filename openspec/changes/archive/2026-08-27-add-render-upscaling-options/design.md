## Context

See `proposal.md` for motivation. The engine currently adapts to device ratio,
reports one render resolution, persists debug settings in one versioned
record, and cycles FPS independently of simulation. The selected engine may
be WebGPU or WebGL, and the portrait game frame is resized from both window
and canvas observations.

The new behavior crosses render sizing, preference validation, diagnostics,
keyboard shortcuts, and browser verification. It must compose with the
completed persistent-deadline scheduler and concurrent mobile controls.

## Goals / Non-Goals

**Goals:**

- Represent upscaling as one typed, testable three-value preference.
- Apply the same scale under WebGPU and WebGL without changing CSS geometry.
- Preserve native device-ratio output exactly when the mode is `Off`.
- Restore the saved mode before the first settled gameplay frame.
- Keep display and render resolution diagnostics synchronized after resize.
- Measure whether manual scaling helps pursue 60 FPS on target device classes.

**Non-Goals:**

- Dynamic resolution or automatic mode selection.
- Automatic changes to antialiasing, bloom, HDR, shadows, or assets.
- Changes to the FPS scheduler or the 30, 60, and 120 target choices.
- Asset replacement, compression, level changes, or input-motion changes.
- A production settings menu or touch-only selector for developer controls.

## Decisions

### Use Off, 2x, and 4x as dimension scale factors

Store a stable mode identifier and map it to scale factors `1`, `2`, and `4`.
`2x` renders at half width and height, which is one-quarter of native pixels.
`4x` renders at quarter width and height, which is one-sixteenth of native
pixels. The CSS game frame does not change, so the browser stretches the
rendered image to the existing frame.

This naming directly describes the linear upscale requested by the user.
Alternatives such as percentages or Low/Medium/High are less precise, while a
dynamic percentage slider adds unnecessary states and testing combinations.

### Scale relative to the native device-ratio baseline

The effective Babylon hardware scaling level will be the selected factor
multiplied by the unscaled baseline. When device-ratio adaptation is enabled,
the baseline accounts for `window.devicePixelRatio`; it is not assumed to be
an absolute hardware scaling level of `1`.

This prevents `2x` and `4x` from producing inconsistent results on DPR 1, 2,
and 3 displays. The baseline is recalculated when device pixel ratio or the
viewport changes. Using absolute levels was rejected because it would make
high-density mobile output much smaller than the stated ratios.

### Apply scaling through one render-resolution controller

A focused controller will own mode-to-factor conversion, apply the effective
hardware scaling level to the selected engine, request resize synchronization,
and return display and render resolution diagnostics. The controller owns no
Babylon resource; the bootstrap remains responsible for disposing the engine.

Engine creation remains WebGPU-first. The saved scale is applied to whichever
engine the factory returns before the render loop starts. Both the window and
canvas resize paths call the same synchronization operation so orientation and
fullscreen cannot bypass scaling.

Directly scattering scale calculations through keyboard and resize handlers
was rejected because it invites stale HUD values and backend differences.

### Distinguish display and render resolutions

The Rendering panel will show these separate concepts:

- Display resolution: the native backing resolution available for the current
  game-frame geometry and device-ratio policy.
- Render resolution: the engine's actual internal render width and height.
- Upscaling: `Off`, `2x`, or `4x`.

Both values match in `Off`. Active scaling makes the render value smaller
while the visible game-frame dimensions remain unchanged. Resolution updates
are committed together after engine resize to prevent mixed old and new data.

### Extend the current preference record compatibly

Add the upscaling mode to the existing debug-preference model with `Off` as
its default. Reading an older record with no mode migrates it in memory to
`Off`; unknown values also fall back to `Off`. Reset to Defaults restores it.
Mobile debug-mode transitions preserve the selected upscaling value so the
phone-oriented control does not silently remove the requested performance
trade-off.

Reusing the existing record preserves one source of truth. A separate storage
key was rejected because reset, change markers, and mobile-mode behavior could
then diverge.

### Insert and remap numbered debug shortcuts

Add an upscaling action to the existing input action contract. Numbered keys
become `1` HUD, `2` Inspector, `3` Antialiasing, `4` Upscaling, `5` FPS,
`6` Reset, and `7` Restart. The shortcut panel and changed marker derive from
the same preference state.

Runtime movement, camera, fullscreen, pointer, and touch bindings are not
renumbered. Keeping duplicate old FPS or reset bindings was rejected because
the displayed help would no longer be an exact input contract.

### Treat 60 FPS as a measured acceptance target

Verification records repeated measured FPS, backend, mode, display
resolution, and render resolution for a mid-range laptop and representative
mid-range Android and iPhone devices. It tests `Off`, `2x`, and `4x` at the
existing 60 FPS selection and confirms 30 and 120 remain selectable.

This is a target-device acceptance exercise, not an unconditional promise that
every mid-range device can sustain 60 FPS. If all three modes miss the target,
the result remains visible evidence for a later proposal rather than authority
to reduce another quality setting.

## Risks / Trade-offs

- [Risk] `4x` can look substantially blurred and can expose texture filtering
  or thin-geometry artifacts. → Mitigation: keep `Off` as the default and make
  every change manual and immediately reversible.
- [Risk] Device-ratio changes during monitor moves or browser zoom can make a
  saved absolute scale incorrect. → Mitigation: recompute from the current DPR
  during the shared resize synchronization path.
- [Risk] Rounding at odd canvas dimensions can differ by one pixel. →
  Mitigation: use one documented rounding policy for scaling and diagnostics.
- [Risk] Repeated resize notifications can cause redundant allocations. →
  Mitigation: apply a scale only when its effective value changes and coalesce
  diagnostic refresh with the existing resize path.
- [Risk] Remapped numbered keys can surprise existing testers. → Mitigation:
  update labels, tests, documentation, reset behavior, and browser checks in
  the same change.
- [Risk] Emulator FPS can misrepresent mobile hardware. → Mitigation: use
  emulation for layout only and record performance on physical target devices.

## Migration Plan

1. Add tolerant preference reading so existing records resolve to `Off`.
2. Add scale modeling and controller tests before runtime integration.
3. Integrate scaling and diagnostics while `Off` preserves current rendering.
4. Remap shortcuts and update their source-contract and browser tests.
5. Record physical-device results without changing other quality settings.

Rollback removes the controller integration and new preference field. Older
preference readers ignore the additional serialized field, and `Off` remains
behaviorally identical to the current render path.
