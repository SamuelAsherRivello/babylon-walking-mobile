# Production HUD Specification

## Purpose

Provide a permanent, responsive player HUD for game identity, inventory, and
score without coupling it to optional development diagnostics.

## Requirements

### Requirement: Permanent production HUD

The game SHALL present the production HUD whenever the game scene is running,
and changes to debug HUD visibility MUST NOT hide or remove the production HUD.

#### Scenario: Debug HUD is hidden

- **WHEN** the player hides the optional debug HUD
- **THEN** the production HUD remains visible and unchanged

#### Scenario: Debug HUD is shown

- **WHEN** the player shows the optional debug HUD
- **THEN** both HUDs are visible without sharing visibility state

### Requirement: Game-frame corner anchoring

The production HUD SHALL anchor its left and right groups to their respective
upper game-frame corners using one shared horizontal and vertical padding
value initially equal to 50 design pixels.

#### Scenario: Initial game frame

- **WHEN** the production HUD is created
- **THEN** the left group is inset from the upper-left game-frame corner by
  the shared padding value
- **AND** the score is inset from the upper-right game-frame corner by the
  same shared padding value

#### Scenario: Game aspect ratio changes

- **WHEN** the game frame is resized to a different aspect ratio
- **THEN** each production HUD group remains anchored to its respective corner
- **AND** no aspect-ratio-specific position is required

### Requirement: Title and inventory presentation

The upper-left HUD group SHALL show `Babylon Walking Mobile` on one line and
an `Inventory:` label followed by exactly five inventory slots beneath it.

#### Scenario: Initial demonstration inventory

- **WHEN** the production HUD displays its initial demonstration state
- **THEN** the first slot displays an apple from a PNG asset
- **AND** the remaining four slots display as empty

#### Scenario: Inventory changes

- **WHEN** gameplay supplies a new five-slot inventory state
- **THEN** each slot displays the corresponding item PNG or empty appearance

### Requirement: Dynamic score presentation

The upper-right HUD group SHALL display the current non-negative numeric score
after the `Score:` label and SHALL pad values below 100 to three digits without
truncating larger values.

#### Scenario: Initial score

- **WHEN** the production HUD is initialized with a score of zero
- **THEN** it displays `Score: 000`

#### Scenario: Score increases below three digits

- **WHEN** gameplay updates the score to 8
- **THEN** the production HUD displays `Score: 008`

#### Scenario: Score exceeds three digits

- **WHEN** gameplay updates the score to 1250
- **THEN** the production HUD displays `Score: 1250`

### Requirement: Non-blocking HUD presentation

The non-interactive production HUD SHALL allow pointer and touch input to
continue reaching the game controls beneath it.

#### Scenario: Player interacts beneath the HUD

- **WHEN** the player uses pointer or touch input over a non-interactive HUD
  region
- **THEN** the production HUD does not consume that gameplay input
