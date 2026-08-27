## Purpose

Provide persistent pointer and touch movement through a visible virtual
joystick whose directions follow the player's current view of the game world.

## ADDED Requirements

### Requirement: Virtual movement joystick is always available

The game SHALL show one virtual movement joystick in the lower-left on desktop
and mobile while gameplay input is enabled. It SHALL remain inside the visible
browser viewport and respect lower-left safe-area insets after viewport or
orientation changes.

#### Scenario: Desktop startup

- **WHEN** the game starts in a desktop browser
- **THEN** the virtual movement joystick is visible in the lower-left

#### Scenario: Portrait mobile startup

- **WHEN** the game starts in a portrait mobile browser
- **THEN** the virtual movement joystick is fully visible in the lower-left

#### Scenario: Viewport changes

- **WHEN** the browser viewport, orientation, or visible canvas crop changes
- **THEN** the joystick remains fully visible within the lower-left safe area

### Requirement: Joystick movement follows the visible game world

The joystick SHALL convert its direction through the current camera view
projected onto the world ground plane. Twelve o'clock SHALL move toward the top
of the visible game world, three o'clock toward its right, six o'clock toward
its bottom, and nine o'clock toward its left.

#### Scenario: Twelve o'clock movement

- **WHEN** the player holds the joystick at twelve o'clock
- **THEN** the character moves toward the top of the current game view on the
  world ground plane

#### Scenario: Cardinal clock directions

- **WHEN** the player holds the joystick at three, six, or nine o'clock
- **THEN** the character moves toward the corresponding visible direction on
  the world ground plane

#### Scenario: Camera orientation changes

- **WHEN** the camera orbits and the player subsequently pushes the same
  joystick direction
- **THEN** character movement follows the new visible game-world direction

### Requirement: Joystick provides proportional movement

The joystick SHALL ignore input inside a small central dead zone, SHALL use
the remaining displacement as proportional movement intensity, and SHALL
prevent diagonal input from exceeding the configured maximum player speed.

#### Scenario: Stick is centered

- **WHEN** the joystick rests within its central dead zone
- **THEN** it requests no player movement

#### Scenario: Partial displacement

- **WHEN** the player holds the joystick partway between the center and edge
- **THEN** it requests less movement intensity than full displacement

#### Scenario: Full diagonal displacement

- **WHEN** the joystick is held fully in a diagonal direction
- **THEN** player speed does not exceed the maximum single-direction speed

### Requirement: Active joystick drag is captured until release

The joystick SHALL require pointer down within its outer circle to begin a
movement gesture. After it begins, movement SHALL continue to follow the same
pointer anywhere on screen until pointer up or cancellation. A later gesture
SHALL again require pointer down within the outer circle.

#### Scenario: Active drag leaves the joystick

- **WHEN** a pointer starts inside the joystick and moves outside its circle
- **THEN** the joystick continues reading the pointer with clamped input

#### Scenario: Active drag ends

- **WHEN** the active pointer is released or cancelled anywhere on screen
- **THEN** movement returns to center immediately
- **AND** movement cannot restart until a new press begins inside the circle

### Requirement: Keyboard movement remains unchanged

Existing keyboard movement SHALL retain its fixed world-axis mapping and
tuning. While the joystick is actively displaced outside its dead zone, the
joystick SHALL control player direction; otherwise keyboard movement SHALL
continue normally.

#### Scenario: Keyboard-only movement

- **WHEN** the joystick is centered and the player uses a movement key
- **THEN** the existing fixed world-axis keyboard movement is unchanged

#### Scenario: Joystick is active with a held key

- **WHEN** a movement key is held while the joystick is displaced
- **THEN** the joystick controls the player's movement direction

#### Scenario: Joystick is released with a held key

- **WHEN** the joystick returns to center while a movement key remains held
- **THEN** keyboard movement resumes without requiring a new key press

### Requirement: Joystick follows gameplay input lifecycle

Disabling gameplay input SHALL clear joystick movement immediately and SHALL
prevent the joystick from blocking an interactive game prompt. Re-enabling
gameplay input SHALL restore the joystick without retaining earlier movement.

#### Scenario: Gameplay completes

- **WHEN** gameplay input is disabled while the joystick is displaced
- **THEN** joystick movement stops immediately
- **AND** the completion prompt remains operable by pointer or touch

#### Scenario: Gameplay input resumes

- **WHEN** gameplay input is re-enabled after being disabled
- **THEN** the joystick begins centered and requests no movement

### Requirement: Joystick works with both rendering backends

Joystick appearance, positioning, pointer behavior, and player movement SHALL
be equivalent under WebGPU and the WebGL fallback.

#### Scenario: WebGPU rendering

- **WHEN** the game uses WebGPU
- **THEN** the joystick is visible and moves the player as specified

#### Scenario: WebGL fallback rendering

- **WHEN** the game uses WebGL fallback
- **THEN** the joystick is visible and moves the player as specified
