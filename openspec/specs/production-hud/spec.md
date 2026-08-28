# Production HUD Specification

## Purpose

Provide a permanent, responsive player HUD for game identity, inventory, and
score without coupling it to optional development diagnostics.

## Requirements

### Requirement: Release download size label

The production HUD SHALL display the total byte size of the published game
artifact beside the normalized release version. It SHALL format the size in
megabytes to one decimal place and append `Mb`, producing text such as
`v0.0.0 100.0Mb` on one line.

#### Scenario: Valid release metadata

- **WHEN** the game loads valid release-version and artifact-size metadata
- **THEN** the upper-left HUD displays the version followed by a space and
  the formatted megabyte size
- **AND** the version and size remain on one line

#### Scenario: Small artifact

- **WHEN** the artifact size is less than one megabyte
- **THEN** the HUD displays the correctly rounded one-decimal megabyte value
  with the `Mb` suffix

#### Scenario: Missing or malformed size metadata

- **WHEN** the runtime metadata does not contain a valid non-negative size
- **THEN** the game displays the version without a size label
- **AND** startup and the existing version fallback continue to work

### Requirement: Published artifact size accuracy

The release process SHALL calculate the displayed size from the complete final
browser download artifact, including JavaScript, styles, static assets, and
runtime metadata, and SHALL package that value with the same artifact.

#### Scenario: Release build completes

- **WHEN** the release workflow produces the browser artifact
- **THEN** the packaged metadata contains the total size of all packaged files
  in bytes
- **AND** the HUD value corresponds to that packaged total when the release is
  opened in a browser

### Requirement: Permanent production HUD

The game SHALL present the production HUD whenever the game scene is running,
and changes to debug HUD visibility MUST NOT hide or remove the production HUD.

#### Scenario: Debug HUD is hidden

- **WHEN** the player hides the optional debug HUD
- **THEN** the production HUD remains visible and unchanged

#### Scenario: Debug HUD is shown

- **WHEN** the player shows the optional debug HUD
- **THEN** both HUDs are visible without sharing visibility state

### Requirement: Release version identification

The production HUD SHALL display the version stored with the running build
as a single-line string matching `V<number>.<number>.<number>`. A published
release build MUST use the numeric version from the exact three-component
GitHub Release tag that triggered that build and SHALL normalize the visible
prefix to uppercase `V`. The game SHALL load the value from its runtime
environment file. When that file cannot supply a valid value, the HUD SHALL
display `V0.0.0`.

#### Scenario: Published release is running

- **WHEN** a GitHub Release tagged `v0.05.1` builds the browser application
- **AND** its workflow writes the tag to the runtime environment file
- **THEN** the running production HUD displays `V0.05.1`

#### Scenario: Checked-in current release is running locally

- **WHEN** the checked-in runtime environment contains `v0.05.1`
- **THEN** the local production HUD displays `V0.05.1`

#### Scenario: Runtime release metadata is unavailable

- **WHEN** the runtime environment cannot provide a valid release version
- **THEN** the production HUD displays `V0.0.0`

#### Scenario: Immutable older release is opened

- **WHEN** the player opens an immutable release build that is older than the
  newest published release
- **THEN** the HUD displays that build's own embedded numeric version
- **AND** it does not query GitHub for a newer version at runtime

### Requirement: Game-frame corner anchoring

The production HUD SHALL anchor one ordered group to the upper-left game-frame
corner using one shared horizontal and vertical padding value initially equal
to 50 design pixels.

#### Scenario: Initial game frame

- **WHEN** the production HUD is created
- **THEN** its ordered group is inset from the upper-left game-frame corner by
  the shared padding value
- **AND** the version, title, combined level and score line, and inventory
  slots are contained by that group

#### Scenario: Game aspect ratio changes

- **WHEN** the game frame is resized to a different aspect ratio
- **THEN** the ordered HUD group remains anchored to the upper-left corner
- **AND** every text row remains on one line inside the safe game frame
- **AND** no aspect-ratio-specific position is required

### Requirement: Title and inventory presentation

The upper-left HUD group SHALL show `V0.0.0`-formatted version text,
`Babylon Walking`, and a combined `Level: 001 Score: 000` row in that order,
followed directly by exactly five inventory slots. The version text SHALL be
smaller than the title and combined level and score text. The HUD MUST NOT
display an inventory text label.

#### Scenario: Initial HUD text

- **WHEN** the production HUD displays level 1 with score zero
- **THEN** it displays `Babylon Walking` on the row below the version
- **AND** it displays `Level: 001 Score: 000` on the next row
- **AND** it displays the inventory slots directly below that row
- **AND** it does not display `Inventory` or `Inventory:`

#### Scenario: Initial demonstration inventory

- **WHEN** the production HUD displays its initial demonstration state
- **THEN** the first slot displays an apple from a PNG asset
- **AND** the remaining four slots display as empty

#### Scenario: Inventory changes

- **WHEN** gameplay supplies a new five-slot inventory state
- **THEN** each slot displays the corresponding item PNG or empty appearance

### Requirement: Dynamic score presentation

The upper-left HUD group SHALL display the current level and non-negative
numeric score together after their respective labels. Level and score values
below 100 SHALL be padded to three digits without truncating larger values.

#### Scenario: Initial score

- **WHEN** the production HUD is initialized at level 1 with score zero
- **THEN** it displays `Level: 001 Score: 000`

#### Scenario: Score increases below three digits

- **WHEN** gameplay updates the score to 8 while level 1 remains active
- **THEN** the production HUD displays `Level: 001 Score: 008`

#### Scenario: Score exceeds three digits

- **WHEN** gameplay displays level 1250 with score 1250
- **THEN** it displays `Level: 1250 Score: 1250`

### Requirement: Non-blocking HUD presentation

The non-interactive production HUD SHALL allow pointer and touch input to
continue reaching the game controls beneath it.

#### Scenario: Player interacts beneath the HUD

- **WHEN** the player uses pointer or touch input over a non-interactive HUD
  region
- **THEN** the production HUD does not consume that gameplay input
