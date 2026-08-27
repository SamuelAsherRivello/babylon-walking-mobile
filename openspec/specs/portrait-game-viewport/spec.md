# portrait-game-viewport Specification

## Purpose
Provide a consistent mobile portrait presentation for the game across desktop
and mobile browser shapes while preserving a full-height 9:16 render frame.

## Requirements

### Requirement: Full-height portrait frame

The game SHALL render in a frame whose height equals the current dynamic
browser viewport height and whose width maintains an exact 9:16 aspect ratio.

#### Scenario: Wide browser viewport

- **WHEN** the browser is wider than the full-height 9:16 game frame
- **THEN** the complete game frame fills the browser height without stretching
- **AND** backdrop space remains visible beside the frame

#### Scenario: Narrow browser viewport

- **WHEN** the browser is narrower than the full-height 9:16 game frame
- **THEN** the game frame continues to fill the browser height
- **AND** the frame retains its exact 9:16 aspect ratio

### Requirement: Centered horizontal presentation

The game frame SHALL remain horizontally centered in the browser, and the page
MUST prevent horizontal scrolling caused by frame overflow.

#### Scenario: Narrow viewport crops both sides

- **WHEN** the full-height game frame is wider than the browser
- **THEN** equal amounts of the frame are clipped from the left and right sides
- **AND** no horizontal scrollbar is presented

#### Scenario: Wide viewport centers the frame

- **WHEN** the full-height game frame is narrower than the browser
- **THEN** the backdrop space on its left and right sides is equal

#### Scenario: Inspector visibility changes

- **WHEN** the development Inspector is opened or closed
- **THEN** the game frame remains centered on the browser viewport
- **AND** the Inspector does not move or resize the game frame

### Requirement: Responsive render dimensions

The game SHALL update its frame and render dimensions whenever the browser's
dynamic viewport size changes while preserving the full-height 9:16 contract.

#### Scenario: Browser dimensions change

- **WHEN** the browser is resized or its orientation changes
- **THEN** the game frame is recalculated for the new dynamic viewport height
- **AND** the rendered scene matches the frame's displayed dimensions

#### Scenario: Fullscreen or mobile browser chrome changes

- **WHEN** fullscreen state or mobile browser chrome changes the visible height
- **THEN** the game frame and rendered scene update to the new visible height

### Requirement: Visible temporary debug overlays

Temporary debug overlays SHALL remain within the visible browser area even
when the centered game frame is wider than the browser and cropped.

#### Scenario: Debug overlay on a cropped frame

- **WHEN** the game frame extends beyond the browser's horizontal edges
- **THEN** each enabled temporary debug overlay remains readable and reachable
  within the visible browser area
