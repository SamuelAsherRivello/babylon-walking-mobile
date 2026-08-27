## Purpose

Provide a discoverable touch gesture that controls the complete debug HUD and
remembers the developer's chosen visibility across browser sessions.

## ADDED Requirements

### Requirement: Debug HUD is initially visible

The game SHALL show the complete debug HUD by default on desktop and mobile
when no saved visibility preference exists.

#### Scenario: First visit on mobile

- **WHEN** the game starts on a mobile browser without a saved HUD preference
- **THEN** the Config, Rendering, Debug Input, and Runtime Input panels are
  visible

#### Scenario: First visit on desktop

- **WHEN** the game starts on a desktop browser without a saved HUD preference
- **THEN** all four debug HUD panels are visible

### Requirement: Three-finger tap toggles mobile mode

The game SHALL treat one completed three-finger tap as one mobile-mode toggle
on any platform that supplies touch pointer input. Mobile mode on SHALL hide
the debug HUD, close the Inspector, disable antialiasing, select 60 FPS, and
enter fullscreen. Mobile mode off SHALL restore the normal debug defaults.

#### Scenario: Enable mobile mode

- **WHEN** three fingers tap while mobile mode is off
- **THEN** mobile mode is on with the mobile-mode profile applied

#### Scenario: Disable mobile mode

- **WHEN** three fingers tap while mobile mode is on
- **THEN** mobile mode is off and the normal debug defaults are restored

#### Scenario: One gesture produces one toggle

- **WHEN** the browser reports the pointer events for one three-finger tap
- **THEN** debug HUD visibility changes exactly once

#### Scenario: Ordinary gameplay touch continues

- **WHEN** fewer than three touch pointers interact with the game
- **THEN** the interaction does not toggle the debug HUD

### Requirement: Mobile mode is persisted

The game SHALL save the mobile-mode preference to browser storage and SHALL
restore its debug preference profile on the next startup. The existing `1`
keyboard shortcut SHALL continue to persist HUD visibility independently.

#### Scenario: Mobile mode survives restart

- **WHEN** the developer enables mobile mode and reloads the game
- **THEN** its debug preference profile remains active after startup

#### Scenario: Normal defaults survive restart

- **WHEN** the developer disables mobile mode and reloads the game
- **THEN** the normal debug defaults remain active after startup

#### Scenario: Storage is unavailable

- **WHEN** the browser rejects reading or writing the visibility preference
- **THEN** the current session continues with an in-memory visibility state

### Requirement: Mobile Debug Input advertises the mobile gesture

The existing debug shortcut panel SHALL be titled `Debug Input (PC)`. A
`Debug Input (Mobile)` panel SHALL appear immediately below it on desktop and
mobile, and SHALL contain only the line `3 Finger Tap = Mobile Mode`.

#### Scenario: Guidance is visible

- **WHEN** the debug input panels are shown on any supported platform
- **THEN** the PC shortcuts appear under `Debug Input (PC)`
- **AND** the panel immediately below is titled `Debug Input (Mobile)`
- **AND** its only input line is `3 Finger Tap = Mobile Mode`

### Requirement: Rendering backend does not change gesture behavior

The debug HUD gesture and persisted state SHALL behave equivalently when the
game uses WebGPU or its WebGL fallback.

#### Scenario: WebGPU is active

- **WHEN** WebGPU initializes and the developer performs a three-finger tap
- **THEN** mobile mode toggles once

#### Scenario: WebGL fallback is active

- **WHEN** the game falls back to WebGL and the developer performs a
  three-finger tap
- **THEN** mobile mode toggles once
