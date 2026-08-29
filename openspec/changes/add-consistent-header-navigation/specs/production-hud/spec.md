## MODIFIED Requirements

### Requirement: Game-frame corner anchoring

The production HUD SHALL anchor a shared application header to the upper edge
of the visible game frame using safe-area-aware padding. Gameplay-specific HUD
content SHALL remain below that header and preserve the existing safe-frame
anchoring behavior.

#### Scenario: Initial game frame
- **WHEN** the production HUD is created
- **THEN** the project title and header items are contained by the shared top
  bar and gameplay content begins below it

#### Scenario: Game aspect ratio changes
- **WHEN** the game frame is resized to a different aspect ratio
- **THEN** the shared header and gameplay content remain inside the visible
  safe game frame without aspect-ratio-specific positions

### Requirement: Title and inventory presentation

The production HUD SHALL keep the project title and gameplay level, score, and
inventory presentation visually consistent with the shared application header.
It SHALL continue to show the active level and score and SHALL NOT display an
inventory text label.

#### Scenario: Initial HUD text
- **WHEN** the production HUD displays level 1 with score zero
- **THEN** the shared header shows the project title and the gameplay area
  shows `Level: 001 Score: 000` with inventory slots below it

#### Scenario: Initial demonstration inventory
- **WHEN** the production HUD displays its initial demonstration state
- **THEN** the first inventory slot displays an apple and the remaining four
  slots display as empty

#### Scenario: Inventory changes
- **WHEN** gameplay supplies a new inventory state
- **THEN** the inventory slots update without changing the shared header's
  position or structure
