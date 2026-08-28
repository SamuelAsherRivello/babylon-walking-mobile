## Purpose

Show reusable, text-free progress feedback as a circular Babylon.js element
that exists in the 3D world and remains attached to a moving player.

## ADDED Requirements

### Requirement: Reusable circular in-world meter

The system SHALL provide a `player-progress-bar` element with configurable
start value, end value, current value, background color, progress color, and
visibility. It SHALL render as a circle with no text.

#### Scenario: Meter is configured
- **WHEN** a meter is created with values and color properties
- **THEN** it displays the configured progress range and colors
- **AND** it contains no text label

#### Scenario: Meter reaches the end
- **WHEN** its current value reaches or exceeds the end value
- **THEN** the visible arc is completely filled
- **AND** the value is clamped to the end value

### Requirement: Player-following presentation

The meter SHALL render above the player, follow the player's world position,
and face the active camera as the player and camera move.

#### Scenario: Player moves
- **WHEN** the player changes position in the scene
- **THEN** the meter remains above that player
- **AND** it does not remain at its original world position

#### Scenario: Camera moves
- **WHEN** the camera orbits or changes viewpoint
- **THEN** the meter remains readable as a camera-facing circle

### Requirement: Work visibility

The meter SHALL be visible while associated work is active or paused and
SHALL be hidden when no associated work exists. Its displayed value SHALL
match the associated work value.

#### Scenario: Work pauses
- **WHEN** the player leaves an incomplete work zone
- **THEN** the meter remains at its retained value while visible

#### Scenario: Work completes
- **WHEN** associated work completes
- **THEN** the meter reaches its end value
- **AND** it is hidden after completion handling finishes

### Requirement: Runtime compatibility and ownership

The meter SHALL remain usable on desktop and portrait mobile viewports under
WebGPU and WebGL fallback, and its owned Babylon resources SHALL be disposed
when the meter is disposed.

#### Scenario: Viewport changes
- **WHEN** the browser viewport or camera framing changes
- **THEN** the meter remains attached, visible, and usable without manual UI
  input
