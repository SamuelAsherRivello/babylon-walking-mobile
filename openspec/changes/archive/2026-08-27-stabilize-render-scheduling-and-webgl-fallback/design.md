## Context

The main browser callback currently advances simulation, then compares elapsed
time with an exact target interval and assigns the last-render timestamp to the
current callback time. Near-boundary callbacks can therefore skip every second
or third opportunity and produce a lower harmonic. The same entry point owns
WebGPU selection, WebGL creation, resize handling, physics catch-up, and debug
FPS reporting. See `proposal.md` for motivation and the capability spec for
observable behavior.

The scene currently renders at native device ratio with engine antialiasing,
four-sample pipeline antialiasing, FXAA, HDR image processing, bloom, and a
shadow map. Those settings and all assets remain unchanged while this work
establishes a trustworthy baseline.

## Goals / Non-Goals

**Goals:**

- Make selected render targets stable across ordinary callback jitter.
- Preserve input and simulation behavior when visual frames are skipped.
- Bound long-pause physics catch-up.
- Make WebGPU-first startup resilient to initialization failure.
- Produce a repeatable performance baseline using the existing scene.

**Non-Goals:**

- Lower, upscale, or dynamically adjust the backing render resolution.
- Replace, recompress, resize, or simplify an asset.
- Change antialiasing, bloom, HDR, shadows, lighting, or camera composition.
- Change keyboard, pointer, joystick, touch, or viewport-layout behavior.
- Add a package, benchmark framework, or production telemetry service.

## Decisions

### Schedule against a persistent deadline

Extract a small render scheduler that owns the next due timestamp and selected
target. When a callback reaches the deadline, advance the deadline by complete
target intervals until it lies in the future, then authorize one render. This
preserves fractional remainder, avoids burst renders, and converges on the
selected target across callback jitter. Reset the deadline when the target
changes or time moves backward.

Assigning the deadline directly to the current callback was rejected because
that reproduces the current drift. Rendering several catch-up frames in one
callback was rejected because the user cannot see those intermediate frames
and the burst would increase latency and GPU work.

The scheduler is pure timing logic and owns no Babylon resources. It accepts a
monotonic timestamp supplied by the caller so deterministic tests can cover
30, 60, and 120 FPS without wall-clock waits.

### Keep simulation before the render decision

Continue processing runtime input, zones, orbiters, and enabled physics before
asking whether a visual frame is due. Preserve the existing input delta clamp.
Bound fixed physics work to a small maximum number of substeps per callback and
discard excess accumulated pause time after that bound.

Moving all updates behind the render decision was rejected because it would
make movement and interaction frequency depend on the selected visual target.
Allowing unlimited catch-up was rejected because a background-tab pause can
create a long blocking loop when physics is active.

### Isolate asynchronous backend creation

Move engine selection behind one asynchronous creation boundary that returns
the initialized engine and its backend label. Attempt WebGPU only when exposed.
If construction or initialization fails, dispose the attempted engine when it
exists, record one concise development warning, and create WebGL with equivalent
applicable engine options.

Testing only for WebGPU API presence was rejected because adapters, devices,
drivers, and initialization can still fail. Retrying WebGPU indefinitely was
rejected because it delays a working WebGL experience.

The returned engine remains owned by the application entry point and follows
the existing page-lifetime disposal model. The failed WebGPU attempt is owned
and disposed inside the creation boundary. No new persistent Babylon resource
is introduced.

### Separate correctness checks from performance measurements

Use Vitest with synthetic timestamps and mocked engine factories to prove
scheduler and fallback behavior. Use a production build in foreground browsers
for performance observations because development mode, background tabs, and
the Inspector can change callback scheduling.

Record the baseline in `Babylon/documentation/performance-baseline.md`. Include
WebGPU and WebGL, 30/60/120 targets, Inspector closed and open, desktop and
portrait viewports, backing resolution, and measured FPS. Also record focused
observations for antialiasing, post-processing, shadows, tree geometry, and
texture transfer size without making persistent visual-setting changes.

Adding a benchmark dependency was rejected because browser developer tools,
Babylon diagnostics, and the existing test stack cover this scope. Treating
background automation FPS as authoritative was rejected because browsers may
throttle or perturb non-foreground tabs.

### Preserve touch and viewport behavior

The scheduler consumes time only and does not listen for pointer or touch
events. Existing keyboard and joystick paths continue feeding the same runtime
input update. Existing canvas resize observation remains the source of backing
resolution changes, including portrait resize, orientation, fullscreen, and
mobile browser-chrome changes.

## Risks / Trade-offs

- [Foreground measurements vary by device and browser] -> Record environment,
  backend, resolution, target, and repeated observations with each result.
- [A strict physics substep bound discards suspended time] -> Prefer a stable
  resumed game over blocking catch-up and document the selected bound.
- [WebGPU failure can leave partial resources] -> Keep ownership local and
  dispose the attempted engine before WebGL creation.
- [Inspector overhead still lowers raw performance] -> Require scheduler
  correctness, not identical measured FPS, with the Inspector open.
- [Native device ratio can remain expensive on mobile] -> Measure and record
  it; handle lower-resolution or dynamic scaling in a separate future change.

## Migration Plan

1. Add deterministic failing tests for scheduler cadence and engine fallback.
2. Introduce and integrate the scheduler without changing simulation order.
3. Add bounded physics catch-up and resilient engine creation.
4. Run automated checks and foreground browser verification.
5. Record the current-scene performance baseline and review the final diff.

Rollback restores the previous entry-point timing and engine creation paths.
No stored data, asset, dependency, or public API migration is involved.
