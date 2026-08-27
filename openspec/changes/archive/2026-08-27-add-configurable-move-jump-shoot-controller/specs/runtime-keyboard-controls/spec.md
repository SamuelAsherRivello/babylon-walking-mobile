## ADDED Requirements

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

## MODIFIED Requirements

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
