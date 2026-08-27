# mobile-fullscreen-cover Specification

## Purpose
Keep the portrait mobile game covering every drawable screen edge while its
gameplay interface remains visible, safe, and usable across mobile viewports.

## Requirements

### Requirement: Portrait mobile screen coverage

The game SHALL cover the complete drawable viewport in portrait mobile
presentation without stretching the rendered scene or exposing page backdrop
along the top, bottom, left, or right edge.

#### Scenario: Narrow portrait screen

- **WHEN** a portrait mobile viewport is narrower than the full-height game
  frame
- **THEN** the game fills the viewport height
- **AND** equal portions of the scene are cropped from the left and right
- **AND** no page backdrop is visible along any drawable viewport edge

#### Scenario: Wider portrait screen

- **WHEN** filling the portrait mobile viewport height would leave uncovered
  space on the left or right
- **THEN** the game expands until it covers the viewport width
- **AND** equal portions of the scene are cropped from the top and bottom
- **AND** no page backdrop is visible along any drawable viewport edge

#### Scenario: Successful mobile fullscreen entry

- **WHEN** the browser successfully enters fullscreen on a portrait mobile
  device
- **THEN** the game covers the fullscreen drawable viewport
- **AND** the visible result has no application-created black bars

### Requirement: Mobile viewport offset response

The game SHALL align its cover frame with the current drawable mobile viewport
when browser chrome, fullscreen state, orientation, or display cutouts change
the viewport size or origin.

#### Scenario: Mobile browser chrome changes

- **WHEN** mobile browser chrome changes the drawable viewport size or origin
- **THEN** the game frame is realigned and resized to cover the new viewport
- **AND** Babylon's rendered dimensions match the displayed canvas

#### Scenario: Portrait orientation is restored

- **WHEN** a mobile device returns to portrait orientation
- **THEN** the game reapplies portrait cover geometry without stale offsets
- **AND** no horizontal or vertical page scrolling is introduced

#### Scenario: Reserved operating-system region remains

- **WHEN** the browser reports a screen region as outside its drawable
  viewport
- **THEN** the game covers every region the browser permits web content to use
- **AND** the game remains usable without positioning gameplay UI in the
  reserved region

### Requirement: Visible safe gameplay interface

The production HUD and virtual controls MUST remain entirely within the
visible safe intersection of the game frame and the drawable viewport.

#### Scenario: Scene is horizontally cropped

- **WHEN** portrait cover presentation crops the left and right scene edges
- **THEN** all HUD text and inventory slots remain visible
- **AND** the complete virtual controller remains visible and touchable

#### Scenario: Device has safe-area insets

- **WHEN** a display cutout or system gesture area creates a safe-area inset
- **THEN** gameplay UI is placed inside all applicable safe-area boundaries
- **AND** the rendered scene continues beneath drawable inset regions

#### Scenario: Viewport changes during touch input

- **WHEN** the viewport changes while the virtual controller is enabled
- **THEN** the controller adopts the new safe layout
- **AND** its movement mapping and touch behavior remain unchanged

### Requirement: Unchanged desktop presentation

Desktop presentation SHALL retain its current aspect-ratio behavior and MAY
show backdrop bars outside the game frame.

#### Scenario: Desktop window is resized

- **WHEN** a desktop browser window changes size or enters fullscreen
- **THEN** the game retains its current centered aspect-ratio presentation
- **AND** backdrop bars outside the game frame are permitted
- **AND** the HUD and controls remain aligned with the game frame
