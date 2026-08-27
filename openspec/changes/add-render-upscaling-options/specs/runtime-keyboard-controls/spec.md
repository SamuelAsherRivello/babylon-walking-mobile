## MODIFIED Requirements

### Requirement: Runtime input guidance reflects active controls

The lower-right runtime input panel SHALL describe the keyboard camera and
player movement bindings. Deliberate changes to numbered debug shortcuts
SHALL NOT change player, camera, fullscreen, or touch-control bindings.

#### Scenario: Runtime input panel is visible

- **WHEN** the debug HUD displays its runtime input section
- **THEN** it describes `I` and `K` as camera up and down
- **AND** it describes `J` and `L` as camera left and right rotation
- **AND** it describes `WASD` and arrow keys as player movement
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
- **THEN** player, camera, fullscreen, pointer, and touch inputs are unchanged
