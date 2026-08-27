## Purpose

Provide predictable rendering cadence, resilient backend startup, and useful
development diagnostics without changing the game's selected visual quality.

## ADDED Requirements

### Requirement: Stable render-target scheduling

The game SHALL offer the existing 30, 60, and 120 FPS render targets without
systematically reducing a sustainable target because browser callbacks fall
slightly before an exact frame boundary.

#### Scenario: Callback interval is slightly below the target interval

- **WHEN** the browser supplies callbacks slightly before an exact selected
  frame interval and the device can sustain the selected target
- **THEN** the scheduler preserves elapsed remainder across callbacks
- **AND** measured rendering converges on the selected target instead of a
  lower harmonic such as 60 FPS becoming 30 FPS

#### Scenario: Display refresh is below the selected target

- **WHEN** the selected target exceeds the browser's available callback rate
- **THEN** the game renders at no more than the available callback rate
- **AND** the game does not issue burst renders to simulate unavailable frames

#### Scenario: Player selects another target

- **WHEN** the player cycles among 30, 60, and 120 FPS
- **THEN** the new target takes effect without reloading the game
- **AND** the scheduler does not carry a stale deadline from the prior target

### Requirement: Simulation remains independent from render throttling

Input, player movement, camera movement, zones, orbiters, and enabled physics
SHALL advance from bounded elapsed time independently of whether a visual frame
is rendered on that browser callback.

#### Scenario: A visual frame is skipped

- **WHEN** a browser callback occurs before the next visual frame is due
- **THEN** enabled simulation and input updates still process that callback
- **AND** the visual frame is skipped without changing configured movement
  speed

#### Scenario: The game resumes after a long pause

- **WHEN** browser callbacks resume after the tab or device was suspended
- **THEN** elapsed input and simulation work is bounded
- **AND** physics does not execute an unbounded catch-up loop

### Requirement: Resilient rendering-backend selection

The game SHALL prefer WebGPU and SHALL start with WebGL when WebGPU is absent
or cannot initialize.

#### Scenario: WebGPU initializes successfully

- **WHEN** the browser exposes WebGPU and engine initialization succeeds
- **THEN** the game renders with WebGPU
- **AND** the development rendering diagnostics report WebGPU

#### Scenario: WebGPU is unavailable

- **WHEN** the browser does not expose WebGPU
- **THEN** the game starts with WebGL
- **AND** the development rendering diagnostics report WebGL

#### Scenario: WebGPU initialization fails

- **WHEN** the browser exposes WebGPU but engine initialization rejects or
  throws
- **THEN** partially initialized WebGPU resources are released
- **AND** the game starts with WebGL instead of terminating startup
- **AND** the development rendering diagnostics report WebGL

### Requirement: Observable rendering diagnostics

Development diagnostics SHALL show the active backend, backing resolution,
selected target FPS, and measured rendered FPS without changing game cadence.

#### Scenario: Inspector visibility changes

- **WHEN** the Babylon Inspector is opened or closed
- **THEN** canvas backing resolution and selected target FPS remain unchanged
- **AND** Inspector overhead does not alter scheduler correctness

#### Scenario: Browser viewport changes

- **WHEN** the browser, orientation, fullscreen state, or mobile browser chrome
  changes the displayed canvas size
- **THEN** the reported backing resolution updates to the engine render size
- **AND** the scheduler continues using the selected target FPS

### Requirement: Existing visual-quality policy remains unchanged

The game SHALL retain native device-ratio rendering and its existing scene,
asset, antialiasing, post-processing, shadow, and HUD appearance.

#### Scenario: Performance foundations are enabled

- **WHEN** the game starts after this change
- **THEN** it renders at the existing native device-ratio resolution
- **AND** it does not lower and upscale the render buffer
- **AND** no scene asset is replaced or visually simplified
