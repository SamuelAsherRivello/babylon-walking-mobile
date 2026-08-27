# Render Upscaling Controls Specification

## Purpose

Provide explicit render-resolution trade-offs that help players pursue steady
frame rates while preserving game-frame size and all other visual settings.

## Requirements

### Requirement: Manual upscaling modes

The game SHALL provide `Off`, `2x`, and `4x` upscaling modes and SHALL keep
`Off` as the default mode.

#### Scenario: Game starts with default preferences

- **WHEN** no saved upscaling preference exists
- **THEN** the selected mode is `Off`
- **AND** display resolution and render resolution match

#### Scenario: Player selects 2x

- **WHEN** the selected mode is `2x`
- **THEN** the game renders at one-half display width and height
- **AND** the rendered image fills the unchanged game frame

#### Scenario: Player selects 4x

- **WHEN** the selected mode is `4x`
- **THEN** the game renders at one-quarter display width and height
- **AND** the rendered image fills the unchanged game frame

#### Scenario: Player cycles past 4x

- **WHEN** the player cycles the mode while `4x` is selected
- **THEN** the selected mode returns to `Off`

### Requirement: Independent manual quality selection

Changing upscaling SHALL NOT automatically change antialiasing,
post-processing, shadows, assets, camera behavior, or the selected FPS target.

#### Scenario: Player changes upscaling

- **WHEN** the player cycles to another upscaling mode
- **THEN** only render resolution and the upscaling preference change
- **AND** the current 30, 60, or 120 FPS selection remains active

### Requirement: Persistent upscaling preference

The selected upscaling mode SHALL use the existing debug-preference storage
and SHALL recover safely from absent or invalid stored values.

#### Scenario: Saved mode is valid

- **WHEN** the game starts with a saved `2x` or `4x` mode
- **THEN** that mode is restored before the first settled gameplay frame

#### Scenario: Saved mode is invalid

- **WHEN** the stored upscaling value is not a supported mode
- **THEN** the game uses `Off`

#### Scenario: Player resets debug defaults

- **WHEN** the player activates Reset to Defaults
- **THEN** the selected upscaling mode becomes `Off`
- **AND** display resolution and render resolution match again

#### Scenario: Player toggles mobile debug mode

- **WHEN** the player toggles mobile debug mode after selecting upscaling
- **THEN** the selected upscaling mode remains unchanged

### Requirement: Rendering diagnostics distinguish resolutions

The debug Rendering panel SHALL display backend, display resolution, render
resolution, upscaling mode, measured FPS, and selected FPS target.

#### Scenario: Upscaling is off

- **WHEN** the Rendering panel is visible in `Off` mode
- **THEN** it displays `Upscaling = Off`
- **AND** display and render resolution values match

#### Scenario: Upscaling is active

- **WHEN** the Rendering panel is visible in `2x` or `4x` mode
- **THEN** it displays the selected upscaling mode
- **AND** it displays a render resolution smaller than display resolution

### Requirement: Resize and backend consistency

Upscaling SHALL preserve game-frame geometry and its selected scale across
desktop resize, portrait-mobile resize, orientation changes, fullscreen,
WebGPU startup, and WebGL fallback.

#### Scenario: Viewport changes while upscaling is active

- **WHEN** the viewport, orientation, or fullscreen state changes
- **THEN** display and render resolution are recalculated for the new frame
- **AND** the selected `2x` or `4x` ratio remains active
- **AND** production HUD and touch-control placement remain correct

#### Scenario: WebGL fallback is selected

- **WHEN** WebGPU is unavailable or fails to initialize
- **THEN** the selected upscaling behavior is equivalent under WebGL

### Requirement: Cross-platform 60 FPS acceptance target

Performance verification SHALL use 60 FPS as the desired target on a
mid-range laptop, a mid-range Android device, and a mid-range iPhone while
recording the mode and both resolution values for every result.

#### Scenario: Native rendering misses the target

- **WHEN** a representative device cannot sustain the 60 FPS target in `Off`
- **THEN** the tester records results for `2x` and `4x`
- **AND** no unselected visual setting changes automatically

#### Scenario: Display refresh is below a selected target

- **WHEN** the selected FPS target exceeds display refresh
- **THEN** measured FPS is allowed to remain display-limited
- **AND** movement and input timing remain consistent
