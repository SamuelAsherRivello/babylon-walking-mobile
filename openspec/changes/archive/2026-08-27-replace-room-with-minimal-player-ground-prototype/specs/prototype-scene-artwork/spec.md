## Purpose

Provide a minimal, replaceable prototype scene whose player, ground, camera,
lighting, and shadow relationships are immediately clear at startup.

## ADDED Requirements

### Requirement: Minimal startup artwork

The game SHALL start with a unit cube named `Player` resting on a horizontal
plane named `Ground`. The Player MUST be centered at `(0, 0.5, 0)` so its
bottom-center point is the world origin, and the Ground MUST be centered at
the origin at `y = 0` and extend 10 units in each horizontal direction.

#### Scenario: Prototype scene starts

- **WHEN** the game finishes loading
- **THEN** a unit cube named `Player` is visible at `(0, 0.5, 0)`
- **AND** a 20-by-20 plane named `Ground` is visible at `y = 0`
- **AND** the Player remains resting on the Ground

#### Scenario: Previous artwork is absent

- **WHEN** the game finishes loading
- **THEN** the furnished room model is not loaded or visible
- **AND** the previous bouncing sphere is not present

### Requirement: Independently replaceable prototype textures

The Player SHALL use a unique material named `PlayerMaterial` with
`assets/textures/player.png` as its color texture. The Ground SHALL use a
different material named `GroundMaterial` with
`assets/textures/ground.png` as its tiled color texture. The initial texture
files MUST render the Player red and the Ground green without applying a
material tint that changes replacement texture colors.

#### Scenario: Initial solid-color textures load

- **WHEN** the prototype scene starts with the supplied texture files
- **THEN** the Player appears red
- **AND** the Ground appears green
- **AND** each mesh reports its required unique material name

#### Scenario: A texture file is replaced

- **WHEN** either prototype texture file is replaced at the same path
- **THEN** its mesh uses the replacement artwork without a source-code change
- **AND** the other mesh continues to use its own texture file

### Requirement: Elevated diagonal initial camera

The initial camera SHALL use a perspective view from `(10, 10, 10)`, SHALL
look at the world origin, and SHALL retain the existing user camera controls.

#### Scenario: Initial scene composition

- **WHEN** the game first renders the prototype scene
- **THEN** the camera views the Player and surrounding Ground from above
- **AND** the view follows the positive X, Y, and Z diagonal toward the origin

#### Scenario: User moves the camera

- **WHEN** the user operates the existing camera control
- **THEN** the camera responds as it did before this change

### Requirement: Camera-direction lighting and Player shadow

The scene SHALL use one directional light that illuminates the prototype
scene from approximately the initial camera position toward the origin. The
Player MUST cast a visible shadow onto the Ground, and the Ground MUST receive
that shadow.

#### Scenario: Prototype scene is illuminated

- **WHEN** the scene renders from its initial camera position
- **THEN** the visible Player faces and Ground are illuminated
- **AND** the Player remains visibly three-dimensional

#### Scenario: Player shadow appears on Ground

- **WHEN** the Player and Ground render under the directional light
- **THEN** a shadow from the Player is visible on the Ground

### Requirement: Existing interface and orbiter behavior remain unchanged

The artwork change MUST preserve the existing UI, UI styling, keyboard
shortcuts, stored debug preferences, and C-key orbiter behavior.

#### Scenario: Existing interface is displayed

- **WHEN** the prototype scene starts
- **THEN** the same enabled UI and runtime input labels remain visible
- **AND** the existing debug and fullscreen shortcuts retain their behavior

#### Scenario: User creates an orbiter

- **WHEN** the user presses the C key
- **THEN** an orbiter is created with the existing primitive, motion, and
  lifetime behavior
