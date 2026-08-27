## Why

The current frame limiter can render well below a selected target when browser
callback timing falls just below an exact frame boundary, which can make
movement appear smoother when the development Inspector adds overhead. Engine
startup also stops instead of using WebGL when WebGPU is present but fails to
initialize, and the project lacks a repeatable performance baseline.

## What Changes

- Replace the boundary-sensitive render throttle with a stable scheduler for
  the existing 30, 60, and 120 FPS targets.
- Keep input, zone, and simulation updates independent from the selected
  render target while bounding long-pause catch-up work.
- Fall back to WebGL when WebGPU is unavailable or initialization fails, and
  dispose any partially initialized WebGPU resources.
- Keep renderer type, backing resolution, target FPS, and measured FPS visible
  in the existing development diagnostics.
- Add deterministic scheduler and engine-selection tests plus repeatable
  foreground browser performance checks for desktop and portrait mobile.
- Measure the existing antialiasing, post-processing, shadow, and tree costs
  without replacing assets or changing their appearance in this change.
- Preserve native device-ratio rendering; lower-resolution upscaling and
  dynamic resolution scaling remain explicitly out of scope.

## Capabilities

### New Capabilities

- `render-performance-foundations`: Defines stable render-target scheduling,
  simulation independence, WebGPU-first startup with WebGL fallback, and
  observable development rendering diagnostics.

### Modified Capabilities

None.

## Impact

- Affects Babylon engine creation, the main render loop, physics catch-up,
  debug rendering diagnostics, and focused client tests.
- Adds a repeatable performance-verification matrix for current desktop and
  portrait-mobile browser targets.
- Preserves the existing canvas layout, touch and keyboard behavior, scene
  assets, visual quality, and production HUD.
- WebGPU remains preferred on supported browsers; WebGL behavior becomes more
  reliable when WebGPU initialization fails.
- No dependency, public API, asset, or stored-data migration is required.
