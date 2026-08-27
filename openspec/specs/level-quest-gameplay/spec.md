# level-quest-gameplay Specification

## Purpose

Provide a complete first-level gameplay loop that turns zone visits into
visible inventory progress, quest completion, and a clean replay.

## Requirements

### Requirement: Ordered level progression

The game SHALL contain exactly three ordered levels. Level 1 SHALL contain
Quest 1 with a target of one apple and one visible inventory slot. Level 2
SHALL contain Quest 2 with a target of two apples and two visible inventory
slots. Level 3 SHALL contain Quest 3 with a target of three apples and three
visible inventory slots. The game SHALL start at Level 1 and Quest 1 whenever
the browser application starts or the game is restarted.

#### Scenario: New game starts

- **WHEN** the browser application finishes loading
- **THEN** Level 1 and Quest 1 are active
- **AND** the quest requires one apple
- **AND** exactly one inventory slot is visible
- **AND** the inventory is empty

#### Scenario: Game is restarted

- **WHEN** the user restarts the game from runtime input or final completion
- **THEN** Level 1 and Quest 1 are active
- **AND** no progress from the prior game remains

#### Scenario: Player advances through the sequence

- **WHEN** the player accepts advancement after completing Level 1 or Level 2
- **THEN** the next numbered level and quest become active
- **AND** the active apple target matches that level number
- **AND** the visible inventory slot count matches that level number
- **AND** no level is skipped

### Requirement: Initial level layout

Every level SHALL use the existing green ground and SHALL spawn the player at
the world origin. The world SHALL contain a zone titled `START` centered at the
origin and an Apple zone centered at `(0, 0, 7)`. The `START` zone SHALL have
`isEnabled` set to `false`, SHALL remain in its default color, and SHALL NOT
emit entry or exit events. The Apple zone SHALL contain one tree. The HUD SHALL
show exactly as many inventory slots as the active level's apple target, and
every available slot SHALL be empty when a level starts.

#### Scenario: Level starts

- **WHEN** any level begins
- **THEN** the player appears at `(0, 0.5, 0)` inside the START marker
- **AND** the START marker remains in its default color
- **AND** one tree and the Apple zone are visible near the positive-Z edge
- **AND** the visible inventory slot count matches the active level number
- **AND** every visible inventory slot is empty

#### Scenario: Level inventory capacity changes

- **WHEN** Level 1, Level 2, or Level 3 begins
- **THEN** exactly one, two, or three inventory slots are visible respectively
- **AND** no unavailable inventory slot is visible or interactive

#### Scenario: Player crosses the START marker boundary

- **WHEN** the player enters or exits the disabled START marker
- **THEN** its color remains unchanged
- **AND** it emits no entry or exit event

#### Scenario: Game runs on a supported browser

- **WHEN** a level runs on desktop or portrait mobile using WebGPU or the
  WebGL fallback
- **THEN** the layout, zones, inventory, and current level title remain usable
  and visible

### Requirement: Optional zone models

Each zone MAY declare a model. A declared tree model SHALL create the existing
tree at the exact center of that zone's background area. The Apple zone SHALL
be 3 units wide and 3 units deep, SHALL be centered at `(0, 0, 7)`, and SHALL
declare the tree model. The disabled START zone SHALL be centered at the
origin, SHALL remain 3 units wide and 3 units deep, and SHALL NOT declare a
model.

#### Scenario: Apple zone is created

- **WHEN** the shared level layout creates the Apple zone
- **THEN** its background dimensions are 3 units by 3 units
- **AND** its center is at `(0, 0, 7)`
- **AND** exactly one tree is created at the background area's center

#### Scenario: START zone is created

- **WHEN** the shared level layout creates the START zone
- **THEN** its center is at the world origin
- **AND** it creates no model
- **AND** it is disabled

#### Scenario: Zone has no model

- **WHEN** a zone definition omits its optional model
- **THEN** no model is created for that zone

### Requirement: Apple collection quest

The active quest SHALL award one apple when the player crosses from outside
to inside the Apple zone. Remaining inside MUST NOT award more apples, and
each entry after an exit SHALL award one additional apple until the active
level's target of one, two, or three apples has been collected.

#### Scenario: Player enters the Apple zone

- **WHEN** the player crosses from outside to inside the Apple zone before
  the active quest completes
- **THEN** exactly one apple is added to the inventory
- **AND** the inventory HUD displays the collected apple

#### Scenario: Player remains inside the Apple zone

- **WHEN** the player remains inside the Apple zone across repeated updates
- **THEN** no additional apple is awarded

#### Scenario: Player re-enters the Apple zone

- **WHEN** the player exits the Apple zone and later enters it again before
  completing a multi-apple quest
- **THEN** exactly one additional apple is added to the inventory

### Requirement: Quest completion

The active quest SHALL complete exactly when its level-specific apple target
is reached. Completion SHALL be latched so further updates cannot add apples
or repeat the completion transition.

#### Scenario: Active apple target is collected

- **WHEN** an Apple-zone entry raises the collected count to the active target
- **THEN** the corresponding inventory slot displays an apple
- **AND** the quest becomes complete exactly once

#### Scenario: Third apple is collected

- **WHEN** the player enters the Apple zone with two apples in Level 3
- **THEN** the third inventory slot displays an apple
- **AND** Quest 3 becomes complete exactly once

#### Scenario: Completed quest receives another zone entry

- **WHEN** the completed quest receives another Apple-zone entry
- **THEN** its collected count remains at the active target
- **AND** no additional completion transition occurs

### Requirement: Quest audio feedback

Each quest SHALL declare `levelup.wav` as its beginning sound and `clear.wav`
as its update sound. The beginning sound SHALL be requested once whenever a
quest starts. The update sound SHALL play once for each accepted apple
collection.

#### Scenario: Quest begins

- **WHEN** Quest 1, Quest 2, or Quest 3 starts
- **THEN** `levelup.wav` is requested exactly once for that quest

#### Scenario: Apple collection is accepted

- **WHEN** an Apple-zone entry awards an apple before completion
- **THEN** `clear.wav` plays exactly once for that award

#### Scenario: Apple collection is not accepted

- **WHEN** the player remains in the zone or enters after completion
- **THEN** no quest update sound plays

### Requirement: Level completion prompt

The game SHALL support a configurable prompt centered in the game frame with
a title, body, and zero, one, or two buttons. Completing Level 1 or Level 2
SHALL configure it with title `Level Complete`, body `Next Level?`, and one
button labeled `OK`. Completing Level 3 SHALL configure it with title
`Game Complete`, body `Restart Game?`, and one button labeled `OK`. Gameplay
input MUST stop while the prompt is visible, while UI input MUST remain usable.

#### Scenario: Non-final level completes

- **WHEN** the active quest completes in Level 1 or Level 2
- **THEN** a centered prompt titled `Level Complete` appears
- **AND** its body reads `Next Level?`
- **AND** its only button is labeled `OK`
- **AND** player and camera gameplay input stop

#### Scenario: Quest completes

- **WHEN** the active quest reaches its required apple count
- **THEN** the completion prompt for that level appears exactly once
- **AND** player and camera gameplay input stop

#### Scenario: Final level completes

- **WHEN** Quest 3 completes in Level 3
- **THEN** a centered prompt titled `Game Complete` appears
- **AND** its body reads `Restart Game?`
- **AND** its only button is labeled `OK`
- **AND** player and camera gameplay input stop

#### Scenario: User interacts with completion UI

- **WHEN** either completion prompt is visible on desktop or touch input
- **THEN** the user can activate the `OK` button
- **AND** completion UI remains aligned after a viewport resize

### Requirement: Runtime UI click feedback

Runtime UI SHALL have a click sound declaration independent from the world
background click declaration. Both declarations SHALL map to `rotate.wav`.
Activating either completion prompt's `OK` button SHALL play the runtime UI
click audibly before level advancement or application reload.

#### Scenario: User activates Ok

- **WHEN** the user activates a completion prompt's `OK` button
- **THEN** the separately declared runtime UI click plays
- **AND** its asset is `rotate.wav`
- **AND** the game waits for playback completion or a bounded failure fallback
  before advancing or reloading

### Requirement: Clean gameplay replay

Activating `OK` after Level 1 or Level 2 SHALL advance in place to the next
level with new quest state. The player SHALL return to START, inventory SHALL
be emptied, the HUD title SHALL show the next level and quest, the completion
prompt SHALL close, and gameplay input SHALL resume. Activating `OK` after
Level 3 SHALL reload the application and start Level 1 with new in-memory
gameplay state. Restart MUST NOT erase saved debug preferences.

#### Scenario: User advances to the next level

- **WHEN** the user activates `OK` after Level 1 or Level 2
- **THEN** the application does not reload
- **AND** the next numbered level and quest start
- **AND** the player returns to START with an empty inventory
- **AND** the visible inventory slot count matches the next level number
- **AND** gameplay input resumes

#### Scenario: User restarts after game completion

- **WHEN** the user activates `OK` after completing Level 3
- **THEN** the application reloads
- **AND** Level 1 and Quest 1 start with an empty inventory
- **AND** saved debug preferences remain unchanged

#### Scenario: User replays a completed level

- **WHEN** the application starts again after final game completion
- **THEN** Level 1 and Quest 1 are active
- **AND** inventory and quest progress are empty
- **AND** saved debug preferences remain unchanged
