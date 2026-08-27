## Why

Native device-ratio rendering can create a large pixel workload on mid-range
laptops and high-density Android and iPhone displays. Players need a simple,
manual way to trade sharpness for steadier progress toward 60 FPS without
changing assets or automatically reducing other visual settings.

## What Changes

- Add three manually selected upscaling modes: `Off`, `2x`, and `4x`.
- Keep `Off` as the default so display and render resolution initially match.
- Render at half width and height in `2x`, and at one-quarter width and height
  in `4x`, while preserving the same displayed game-frame size.
- Show the selected upscaling mode, display resolution, and render resolution
  in the debug Rendering panel.
- Persist the selected mode with the existing debug preferences and restore
  `Off` when debug defaults are reset.
- Insert the upscaling shortcut after Antialiasing: `4` cycles upscaling,
  `5` cycles 30, 60, and 120 FPS, `6` resets defaults, and `7` restarts.
- Preserve manual FPS selection and make no automatic changes to
  antialiasing, post-processing, shadows, assets, or gameplay input.
- Verify frame consistency on a mid-range laptop and representative
  mid-range Android and iPhone devices, with 60 FPS as the desired target.

## Capabilities

### New Capabilities

- `render-upscaling-controls`: Manual render scaling, diagnostics,
  persistence, resize behavior, and cross-backend performance acceptance.

### Modified Capabilities

- `runtime-keyboard-controls`: Deliberately remap numbered debug shortcuts
  while leaving player, camera, fullscreen, and other runtime bindings intact.

## Impact

- Affects render sizing, resize synchronization, debug preferences, debug HUD
  labels, and numbered debug keyboard handling.
- Applies to desktop and portrait mobile layouts under WebGPU and WebGL.
- Adds no dependency and changes no temporary asset or gameplay behavior.
- Keeps the existing 30, 60, and 120 FPS choices; upscaling is an independent
  manual selection rather than an automatic quality system.
