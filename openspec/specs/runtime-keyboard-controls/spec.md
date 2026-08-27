# Runtime Keyboard Controls Specification

## Purpose

Provide distinct, discoverable keyboard controls for camera-relative player
movement and a player-tracking camera without conflicting default inputs.

## Requirements

### Requirement: Equivalent player movement bindings

The game SHALL move the player on the ground plane with either `WASD` or the
corresponding arrow keys. Keyboard directions SHALL match a fully displaced
virtual joystick through the camera's current view.

#### Scenario: Player moves left

- **WHEN** the player holds `A` or `ArrowLeft`
- **THEN** the player moves toward the left of the current game view
- **AND** the movement matches the joystick at nine o'clock

#### Scenario: Player moves right

- **WHEN** the player holds `D` or `ArrowRight`
- **THEN** the player moves toward the right of the current game view
- **AND** the movement matches the joystick at three o'clock

#### Scenario: Player moves up

- **WHEN** the player holds `W` or `ArrowUp`
- **THEN** the player moves toward the top of the current game view
- **AND** the movement matches the joystick at twelve o'clock

#### Scenario: Player moves down

- **WHEN** the player holds `S` or `ArrowDown`
- **THEN** the player moves toward the bottom of the current game view
- **AND** the movement matches the joystick at six o'clock

#### Scenario: Equivalent keys produce equivalent movement

- **WHEN** the same movement duration is applied with a letter key and its
  corresponding arrow key
- **THEN** both inputs produce the same player displacement

#### Scenario: Camera orientation changes

- **WHEN** the camera orbits and the player subsequently uses a movement key
- **THEN** keyboard movement follows the new visible game-world direction
- **AND** it continues to match the corresponding joystick direction

### Requirement: Accelerated player movement

The game SHALL begin movement at an approximate speed of `3.0`, accelerate
held movement to an approximate speed of `5.85` over `0.5` seconds, and
decelerate current movement to rest over `0.25` seconds after all player
movement keys are released. Player motion SHALL scale by elapsed time.

#### Scenario: Player taps a movement key

- **WHEN** the player briefly presses and releases a movement key
- **THEN** the player moves a short distance in the requested direction
- **AND** movement begins without waiting for the acceleration period

#### Scenario: Player holds a movement key

- **WHEN** the player continues holding a movement key for `0.5` seconds
- **THEN** movement speed increases from approximately `3.0` to `5.85`
- **AND** movement does not exceed the configured maximum speed

#### Scenario: Player releases all movement keys

- **WHEN** the player releases the last held player movement key
- **THEN** the player continues briefly in the current movement direction
- **AND** movement speed reaches zero within `0.25` seconds

#### Scenario: Movement remains frame-rate-independent

- **WHEN** a movement key is held for the same duration at different render
  frame rates
- **THEN** the resulting player displacement is equivalent

#### Scenario: Player moves diagonally

- **WHEN** the player holds one horizontal and one vertical movement key
- **THEN** the player moves diagonally at the current movement speed
- **AND** diagonal movement is not faster than single-axis movement

#### Scenario: Opposing inputs are held

- **WHEN** the player holds opposing movement inputs on the same axis
- **THEN** neither input accelerates movement on that axis
- **AND** existing movement on that axis decelerates toward zero

### Requirement: Keyboard camera orbit

The game SHALL orbit the camera around the player using `I`, `J`, `K`, and
`L` while preserving the current camera radius unless a zoom input occurs.
Camera input SHALL use slight acceleration and deceleration controlled by
camera-specific tuning values that are independent from player tuning values.
Its angular speed SHALL begin at `1.2` radians per second and accelerate to
`1.8` radians per second over `0.35` seconds, then decelerate to rest within
`0.2` seconds after all camera keys are released.

#### Scenario: Camera moves upward

- **WHEN** the player holds `I`
- **THEN** the camera rises along its orbit around the player
- **AND** the camera remains aimed at the player

#### Scenario: Camera moves downward

- **WHEN** the player holds `K`
- **THEN** the camera lowers along its orbit around the player
- **AND** the camera remains aimed at the player

#### Scenario: Camera rotates left

- **WHEN** the player holds `J`
- **THEN** the visible camera orbit rotates left around the player

#### Scenario: Camera rotates right

- **WHEN** the player holds `L`
- **THEN** the visible camera orbit rotates right around the player

#### Scenario: Camera input is held

- **WHEN** the player continues holding any `IJKL` camera key
- **THEN** camera orbit speed increases smoothly to its configured maximum

#### Scenario: All camera inputs are released

- **WHEN** the player releases the last held `IJKL` camera key
- **THEN** camera orbit speed decreases smoothly to zero

#### Scenario: Player tuning changes independently

- **WHEN** a developer changes the player movement tuning values
- **THEN** the configured camera acceleration profile remains unchanged

#### Scenario: Camera reaches an elevation limit

- **WHEN** `I` or `K` would move the camera through an orbit pole
- **THEN** the camera stops at a safe elevation limit

### Requirement: Initial world orientation supports view-relative movement

The initial camera SHALL view the player from the positive-X, negative-Z
world diagonal, and the directional light SHALL illuminate the initial world
from the negative-Z side.

#### Scenario: Player moves toward the left of the view

- **WHEN** the player holds `A` or `ArrowLeft` from the initial camera
  orientation
- **THEN** the player movement appears toward the left of the game view

#### Scenario: Initial player lighting

- **WHEN** the world is first created with the mirrored camera orientation
- **THEN** the directional light continues to illuminate the player and cast
  its shadow onto the ground

### Requirement: Camera remains locked on the player

The camera SHALL use the player as its tracking target throughout runtime
movement and camera orbit changes.

#### Scenario: Player changes position

- **WHEN** keyboard input moves the player to a new world position
- **THEN** the camera target follows the player's position
- **AND** the camera remains aimed at the player

#### Scenario: Camera orbits a moving player

- **WHEN** player movement and camera orbit input occur together
- **THEN** the camera orbits the player's current position

### Requirement: Primary mouse drag does not move the camera

The game MUST NOT change camera orbit, elevation, target, or radius in
response to dragging with the primary mouse button, and it SHALL preserve
mouse-wheel zoom.

#### Scenario: Player drags with the primary mouse button

- **WHEN** the player presses and drags with the primary mouse button
- **THEN** the camera orientation, target, and radius remain unchanged

#### Scenario: Player uses the mouse wheel

- **WHEN** the player uses the mouse wheel over the game canvas
- **THEN** the camera radius changes using the existing zoom behavior
- **AND** the camera remains aimed at the player

### Requirement: Runtime input guidance reflects active controls

The lower-right runtime input panel SHALL describe the keyboard camera,
player movement, Jump, and Shoot bindings. Deliberate changes to numbered
debug shortcuts SHALL NOT change player, camera, action, fullscreen, or touch
control bindings.

#### Scenario: Runtime input panel is visible

- **WHEN** the debug HUD displays its runtime input section
- **THEN** it describes `I` and `K` as camera up and down
- **AND** it describes `J` and `L` as camera left and right rotation
- **AND** it describes `WASD` and arrow keys as player movement
- **AND** it describes `C` as Jump and `V` as Shoot
- **AND** it does not describe `C` as Create Orbiter
- **AND** it does not describe primary mouse drag as camera movement
- **AND** it continues to describe `F` as Fullscreen

#### Scenario: Debug shortcuts are displayed

- **WHEN** the debug input labels are displayed
- **THEN** `1` toggles the HUD
- **AND** `2` toggles the Inspector
- **AND** `3` toggles Antialiasing
- **AND** `4` cycles Upscaling
- **AND** `5` cycles the 30, 60, and 120 FPS targets
- **AND** `6` resets debug preferences to defaults
- **AND** `7` restarts the scene

#### Scenario: Runtime controls remain independent

- **WHEN** the numbered debug shortcuts are remapped
- **THEN** player, camera, action, fullscreen, pointer, and touch inputs are
  unchanged

### Requirement: Gameplay keys do not invoke browser or default camera actions

The game SHALL reserve its active movement keys for gameplay while the game
canvas is running.

#### Scenario: Player uses an arrow key

- **WHEN** the player presses an arrow key during gameplay
- **THEN** the arrow key moves the player instead of rotating the camera
- **AND** the browser page does not scroll because of that key press

### Requirement: Keyboard and touch actions are equivalent

The `C` key SHALL activate the same Jump action as the virtual Jump control,
and the `V` key SHALL activate the same Shoot action as the virtual Shoot
control. A held key SHALL activate its action only once until released and
pressed again. These gameplay bindings SHALL be inactive while gameplay input
is disabled.

#### Scenario: Player uses the Jump key

- **WHEN** gameplay input is enabled and the player presses `C`
- **THEN** Jump activates exactly as if `Jump (C)` were pressed

#### Scenario: Player uses the Shoot key

- **WHEN** gameplay input is enabled and the player presses `V`
- **THEN** Shoot activates exactly as if `Shoot (V)` were pressed

#### Scenario: Player holds an action key

- **WHEN** the player holds `C` or `V` and browser key-repeat events occur
- **THEN** the corresponding action activates only once for that key press

#### Scenario: Gameplay input is disabled

- **WHEN** gameplay input is disabled and the player presses `C` or `V`
- **THEN** neither Jump nor Shoot activates
