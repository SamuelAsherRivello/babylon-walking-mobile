## Purpose

Provide visible, ground-locked destination areas that report when the player
enters and exits them so world locations can drive later gameplay behavior.

## ADDED Requirements

### Requirement: Configurable rectangular zones

The game SHALL allow rectangular zones to be created with a title, ground
position, `size_x`, and `size_z`. Both size parameters SHALL default to three.
Each zone SHALL retain its configured world position while the player and
camera move.

#### Scenario: Create a zone at an arbitrary position

- **WHEN** a zone is created with a valid title, position, `size_x`, and
  `size_z`
- **THEN** a rectangle with those dimensions appears at that world position
- **AND** its configured title is visible

#### Scenario: Zone dimensions are omitted

- **WHEN** a zone is created without `size_x` or `size_z`
- **THEN** it is three world units wide on X
- **AND** it is three world units deep on Z

#### Scenario: Camera moves around a zone

- **WHEN** the camera orbits or zooms after a zone is created
- **THEN** the zone remains anchored to the same ground position

### Requirement: Non-diegetic ground presentation

The game SHALL present each zone as a dark, translucent ground overlay with a
contrasting segmented border and a ground-aligned title. The title SHALL
support selectable edge placement and configurable scale. A zone MUST NOT
cast shadows, block movement, or participate in physics.

#### Scenario: Goal title uses side two

- **WHEN** the prototype goal zone is created
- **THEN** its title appears outside the lower-right side-two edge
- **AND** it is rotated 180 degrees from its prior side-two orientation
- **AND** the title is twice its original size
- **AND** it is horizontally centered on the nearest zone edge

#### Scenario: Player walks across a zone

- **WHEN** the player walks across the zone overlay and its border
- **THEN** the player's movement is not obstructed or redirected
- **AND** the overlay remains visible on top of the ground

#### Scenario: Title scale is omitted

- **WHEN** a zone is created without a title scale
- **THEN** its title uses the current prototype title size as scale one

### Requirement: Player occupancy state

Each zone SHALL determine occupancy from the player's ground position on the
world X/Z plane. A position on the rectangle boundary SHALL count as inside.

#### Scenario: Player crosses into a zone

- **WHEN** the player's ground position moves from outside to inside a zone
- **THEN** that zone's occupancy state becomes inside

#### Scenario: Player crosses out of a zone

- **WHEN** the player's ground position moves from inside to outside a zone
- **THEN** that zone's occupancy state becomes outside

#### Scenario: Player occupies overlapping zones

- **WHEN** the player's ground position is inside more than one zone
- **THEN** each matching zone independently reports an inside state

### Requirement: Occupancy changes zone appearance

Each zone SHALL support default, confirmation, and negation background colors
at the same partial opacity. The zone SHALL restore its default background
after the player exits.

#### Scenario: Zone becomes occupied

- **WHEN** a zone changes from outside to inside
- **THEN** its background changes from default to confirmation green

#### Scenario: Zone becomes unoccupied

- **WHEN** a zone changes from inside to outside
- **THEN** its background changes back to the default color

#### Scenario: Player enters a non-triggerable zone

- **GIVEN** a zone is enabled but not triggerable
- **WHEN** the player enters it
- **THEN** its background changes from default to negation red

### Requirement: Zone activation defaults

Each zone SHALL accept `isEnabled` and `isTriggerable` parameters. Both
parameters SHALL default to `true`. A disabled zone SHALL remain in its
default visual state and SHALL NOT emit boundary notifications.

#### Scenario: Activation parameters are omitted

- **WHEN** a zone is created without activation parameters
- **THEN** it is enabled and triggerable

#### Scenario: Player crosses a disabled zone

- **GIVEN** a zone is disabled
- **WHEN** the player's position crosses its boundary
- **THEN** the zone remains in its default state
- **AND** it emits no enter or exit notification

### Requirement: Enter and exit transitions are observable

Each zone SHALL expose enter and exit notifications. A notification SHALL
occur once per matching boundary crossing and MUST NOT repeat while occupancy
remains unchanged.

#### Scenario: Player remains inside a zone

- **WHEN** the zone is updated repeatedly while the player remains inside
- **THEN** the zone emits one enter notification for that visit
- **AND** it emits no exit notification

#### Scenario: Player completes a visit

- **WHEN** the player enters a zone and later leaves it
- **THEN** the zone emits one enter notification followed by one exit
  notification

### Requirement: Prototype goal zone

The prototype world SHALL include a rectangular zone titled `GOAL` that the
player can enter and exit using the existing movement controls.

#### Scenario: Prototype world starts

- **WHEN** the prototype scene finishes its startup setup
- **THEN** a zone titled `GOAL` is visible on the ground away from the
  player's initial position
