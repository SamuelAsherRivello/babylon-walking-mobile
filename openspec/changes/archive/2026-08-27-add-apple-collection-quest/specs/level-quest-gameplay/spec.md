## Purpose

Provide a complete first-level gameplay loop that turns zone visits into
visible inventory progress, quest completion, and a clean replay.

## ADDED Requirements

### Requirement: Initial level layout

The game SHALL start a level declared as `Level 1`. It SHALL contain the
existing ground, a player at the center, the existing `GOAL` zone, and an
additional zone titled `Apple`. `Level 1` SHALL contain an ordered quest
collection with `Quest 1` as its first quest. `Quest 1` SHALL declare three
inventory slots and require three apples. Every slot SHALL initially be empty.

#### Scenario: Level starts

- **WHEN** the game finishes loading
- **THEN** the player appears at the center of the ground
- **AND** one tree, the `GOAL` zone, and the `Apple` zone are visible
- **AND** all three inventory slots are empty

#### Scenario: Game runs on a supported browser

- **WHEN** the level runs on desktop or portrait mobile using WebGPU or the
  WebGL fallback
- **THEN** the level layout, zones, and inventory remain usable and visible

### Requirement: Optional zone models

Each zone MAY declare a model. A declared tree model SHALL create the existing
tree at the exact center of that zone's background area. The `Apple` zone SHALL
be 3 units wide and 3 units deep and SHALL declare the tree model. The `GOAL`
zone SHALL remain unchanged and SHALL NOT declare a model.

#### Scenario: Apple zone is created

- **WHEN** `Level 1` creates the `Apple` zone
- **THEN** its background dimensions are 3 units by 3 units
- **AND** exactly one tree is created at the background area's center

#### Scenario: Zone has no model

- **WHEN** a zone definition omits its optional model
- **THEN** no model is created for that zone

### Requirement: Apple collection quest

The level SHALL contain a quest that awards one apple when the player crosses
from outside to inside the `Apple` zone. Remaining inside MUST NOT award more
apples, and each entry after an exit SHALL award one additional apple until
three apples have been collected.

#### Scenario: Player enters the Apple zone

- **WHEN** the player crosses from outside to inside the `Apple` zone before
  quest completion
- **THEN** exactly one apple is added to the inventory
- **AND** the inventory HUD displays the collected apple

#### Scenario: Player remains inside the Apple zone

- **WHEN** the player remains inside the `Apple` zone across repeated updates
- **THEN** no additional apple is awarded

#### Scenario: Player re-enters the Apple zone

- **WHEN** the player exits the `Apple` zone and later enters it again before
  quest completion
- **THEN** exactly one additional apple is added to the inventory

### Requirement: Quest completion

The quest SHALL complete exactly when the player collects the third apple.
Completion SHALL be latched so further updates cannot add apples or repeat the
completion transition.

#### Scenario: Third apple is collected

- **WHEN** the player enters the `Apple` zone with two apples collected
- **THEN** the third inventory slot displays an apple
- **AND** the quest becomes complete exactly once

#### Scenario: Completed quest receives another zone entry

- **WHEN** the completed quest receives another `Apple` zone entry
- **THEN** the inventory remains at three apples
- **AND** no additional completion transition occurs

### Requirement: Quest audio feedback

`Quest 1` SHALL declare `levelup.wav` as its beginning sound and `clear.wav` as
its update sound. The beginning sound SHALL be requested once when the quest
starts. The update sound SHALL play once for each accepted apple collection.

#### Scenario: Quest begins

- **WHEN** `Quest 1` starts during initial level creation
- **THEN** `levelup.wav` is requested exactly once

#### Scenario: Apple collection is accepted

- **WHEN** an Apple-zone entry awards an apple before completion
- **THEN** `clear.wav` plays exactly once for that award

#### Scenario: Apple collection is not accepted

- **WHEN** the player remains in the zone or enters after completion
- **THEN** no quest update sound plays

### Requirement: Level completion prompt

The game SHALL support a configurable prompt centered in the game frame with a
title, body, and zero, one, or two buttons. Quest completion SHALL configure
the prompt with title `Level Compete`, body `Restart game?`, and one interactive
button labeled `Ok`. Gameplay input MUST stop while the prompt is visible,
while UI input MUST remain usable.

#### Scenario: Quest completes

- **WHEN** the third apple is collected
- **THEN** a centered prompt titled `Level Compete` appears
- **AND** its body reads `Restart game?`
- **AND** its only button is labeled `Ok`
- **AND** player and camera gameplay input stop

#### Scenario: User interacts with completion UI

- **WHEN** the completion prompt is visible on desktop or touch input
- **THEN** the user can activate the `Ok` button
- **AND** completion UI remains aligned after a viewport resize

### Requirement: Runtime UI click feedback

Runtime UI SHALL have a click sound declaration independent from the world
background click declaration. Both declarations SHALL initially map to
`rotate.wav`. Activating `Ok` SHALL play the runtime UI click audibly before
the application reloads.

#### Scenario: User activates Ok

- **WHEN** the user activates the completion prompt's `Ok` button
- **THEN** the separately declared runtime UI click plays
- **AND** its asset is `rotate.wav`
- **AND** the application waits for playback completion or a bounded failure
  fallback before reloading

### Requirement: Clean gameplay replay

Activating `Ok` SHALL reload the application and start the level with new
in-memory gameplay state. Restart MUST NOT erase saved debug preferences.

#### Scenario: User replays a completed level

- **WHEN** the user activates `Ok`
- **THEN** the application reloads
- **AND** the level restarts with an empty inventory and an incomplete quest
- **AND** saved debug preferences remain unchanged
