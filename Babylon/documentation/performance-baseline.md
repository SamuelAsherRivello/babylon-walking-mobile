# Render Performance Baseline

## Purpose

This baseline records the current temporary scene without changing visual
quality or replacing assets. It is intended to make later measurements
repeatable and to distinguish observed costs from possible future work.

Foreground production runs on the target device are authoritative. The
automated browser results below are sanity checks, not mobile hardware
benchmarks.

## Test environment

- Date: 2026-08-27
- Host: Windows, Intel Core i9-13950HX
- GPUs: Intel UHD Graphics and NVIDIA RTX 4070 Laptop GPU
- Browser harness: headed Playwright Chromium
- Development server: Vite on localhost
- Scene: current level, one tree, player, ground, goal, and production HUD
- Backend: WebGPU unless a test explicitly forces WebGL
- Antialiasing: enabled
- Device-ratio adaptation: enabled
- Power preference: high performance

The portrait-mobile check emulated an iPhone 15 viewport in Chromium. It did
not run on an iPhone GPU and must not be treated as an iPhone performance
result.

## Measurement method

1. Use a foreground headed browser with no other game tabs running.
2. Wait at least two seconds after a target or Inspector change.
3. Record backend, backing resolution, and the HUD's measured/target FPS.
4. Take three settled samples for each desktop condition.
5. Repeat at 30, 60, and 120 targets with the Inspector closed and open.
6. Repeat representative resize, orientation, fullscreen, and joystick flows.
7. Record unexpected stalls separately from stable cadence.

For future target-device runs, copy this result format:

| Device | Backend | View | Inspector | Target | Resolution | FPS samples |
| --- | --- | --- | --- | ---: | --- | --- |
| Example | WebGPU | Portrait | Closed | 60 | 1170 x 2532 | 60, 60, 59 |

## Desktop results

The desktop viewport was 1280 by 720. The game retained its native portrait
canvas at 405 by 720 backing pixels.

| Inspector | Target | FPS samples | Result |
| --- | ---: | --- | --- |
| Closed | 30 | 30, 30, 30 | Stable at target |
| Closed | 60 | 60, 60, 60 | Stable at target |
| Closed | 120 | 60, 60, 52 | Display-limited with one harness dip |
| Open | 30 | 30, 30, 30 | Stable at target |
| Open | 60 | 56, 43, 56 | Variable Inspector and harness overhead |
| Open | 120 | 60, 60, 60 | Display-limited |

The Inspector-open 60 target did not settle at the old 30 FPS lower harmonic.
The Inspector adds CPU and UI work, so isolated dips are expected in this
automation environment. A manual foreground run should be used for final
feel and frame-time judgment.

## Backend and viewport checks

- Normal startup reported WebGPU and accurate resolution and FPS labels.
- Removing `navigator.gpu` before startup selected WebGL and showed the
  fallback notice without a startup failure.
- A 393 by 659 portrait CSS viewport at device ratio 3 produced a
  1113 by 1977 backing resolution. The automated run varied from 27 to 37 FPS.
- A landscape resize retained the portrait game shape. Its 221 by 393 CSS
  canvas produced a 663 by 1179 backing resolution and reached 60 FPS.
- Fullscreen entered successfully in the harness and retained the same canvas
  geometry because the automated viewport size did not change.
- Dragging the portrait joystick moved the player into the apple zone and
  updated the inventory, confirming movement and UI input remained active.

## Current rendering-cost observations

These are observations, not changes made by this performance proposal.

- Antialiasing is enabled at engine creation, the default pipeline uses four
  samples, and FXAA is enabled. This is layered antialiasing work.
- The default rendering pipeline uses HDR, tone mapping, and bloom. Bloom uses
  a 64-pixel kernel at half scale. Depth of field is disabled.
- A 1024-pixel shadow map uses medium percentage-closer filtering. The player
  and tree meshes cast shadows, and the ground receives them.
- The tree asset has one mesh, two materials, and two rendered primitives.
  Its accessors describe 511 and 864 vertices with 2472 and 1296 indices.
- The tree source is cached and instantiated through the asset container, so
  repeat loads do not refetch the model source.
- Tree transfer size is dominated by a 2048 by 2048 normal-map PNG of
  22,064,128 bytes. The bark image is 817,140 bytes, the leaves image is
  212,333 bytes, and geometry is 51,536 bytes.

## Findings and future recommendations

1. Keep the persistent-deadline scheduler. It removes callback-boundary
   aliasing while keeping simulation work independent of visual frame skips.
2. Keep WebGPU-first startup with tested WebGL fallback. Benchmark both on
   representative devices instead of assuming one backend always wins.
3. Native device-ratio rendering is the sharpest current choice, but the
   portrait result shows it is not automatically the fastest choice on high
   density displays.
4. If target-device measurements later miss the frame budget, first evaluate
   a fixed render scale or bounded dynamic resolution. No such scaling is part
   of this change.
5. Profile the current post-process, shadow, and antialiasing stack separately
   before reducing quality. Change one variable at a time and keep screenshots.
6. Treat the tree normal map as a transfer and memory candidate when assets
   stop being temporary. No asset was replaced or recompressed here.
