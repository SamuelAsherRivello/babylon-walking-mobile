## Purpose

Provide a larger continuous ground surface while visibly marking and enforcing
the smaller world-space rectangle in which the player can walk.

## ADDED Requirements

### Requirement: Ground extends beyond the walkable area

The game SHALL render a centered 100-by-100 Ground on the world X/Z plane.
The Ground texture SHALL retain the same world-space tile density that it had
on the previous 20-by-20 Ground.

#### Scenario: Prototype world starts

- **WHEN** the prototype world finishes loading
- **THEN** the Ground extends 50 world units from the origin on X and Z
- **AND** the Ground extends substantially beyond the visible walkable area
- **AND** its texture does not appear enlarged or stretched

### Requirement: Walkable area matches the former Ground footprint

The game SHALL define one axis-aligned walkable rectangle centered at the
world origin. It SHALL be 20 world units wide on X and 20 world units deep on
Z, matching the former Ground footprint.

#### Scenario: Walkable area is created

- **WHEN** the prototype world starts
- **THEN** its walkable area extends 10 units from the origin on X and Z
- **AND** the player and current level destinations begin inside that area

### Requirement: Walkable boundary is visibly marked

The game SHALL draw a contrasting segmented border around all four edges of
the walkable rectangle. The border SHALL remain anchored to the Ground, SHALL
remain visible above it, and MUST NOT be pickable, cast shadows, or obstruct
gameplay through physics.

#### Scenario: Player views a walkable edge

- **WHEN** a walkable-area edge is visible in the camera view
- **THEN** the segmented border identifies the movement limit
- **AND** the larger Ground remains visible on both sides of the border

#### Scenario: Camera or viewport changes

- **WHEN** the camera moves or the desktop or portrait viewport resizes
- **THEN** the border remains fixed to the same world-space rectangle
- **AND** it continues to identify the same walkable area

### Requirement: Player footprint remains inside the walkable area

The game SHALL constrain gameplay movement so the current Player's ground
footprint cannot cross any edge of the walkable rectangle. The same constraint
SHALL apply to keyboard movement, virtual-joystick movement, and continued
deceleration after either input is released.

#### Scenario: Player moves directly toward an edge

- **WHEN** gameplay movement would carry any part of the Player beyond an edge
- **THEN** the Player stops at that edge with its footprint inside the border
- **AND** repeated input toward the edge does not move it outside

#### Scenario: Player moves diagonally into an edge

- **WHEN** one movement axis reaches an edge while the other remains valid
- **THEN** the blocked axis remains inside the border
- **AND** the Player continues moving along the unblocked axis

#### Scenario: Player moves into a corner

- **WHEN** gameplay movement reaches two perpendicular edges
- **THEN** the Player stops with its footprint inside both edges
- **AND** movement directed back into the area moves the Player away normally

### Requirement: Movement mapping and rendering compatibility are preserved

Confinement MUST NOT change keyboard world-axis mapping, joystick
camera-relative mapping, player speed tuning, camera controls, zone occupancy,
or quest behavior. Ground, border, and confinement behavior SHALL be
equivalent on desktop and portrait mobile under WebGPU and WebGL fallback.

#### Scenario: Player moves within the walkable area

- **WHEN** movement does not reach a walkable-area edge
- **THEN** existing keyboard and joystick movement behave as before
- **AND** existing zones continue evaluating the resulting player position

#### Scenario: Supported runtime renders the world

- **WHEN** the game runs on desktop or portrait mobile using WebGPU or WebGL
- **THEN** the enlarged Ground and walkable border remain visible
- **AND** the same world-space movement boundary is enforced
