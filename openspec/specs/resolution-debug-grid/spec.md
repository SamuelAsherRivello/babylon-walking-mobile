# Resolution Debug Grid Specification

## Purpose

Provide a toggleable screen-coordinate reference that lets developers discuss
positions in screenshots using the game's current Total Rez dimensions.

## Requirements

### Requirement: Debug input toggles the resolution grid

The game SHALL insert `6 = Toggle Grid` after `5 = Toggle FPS` in the PC
debug input list. Pressing `6` SHALL toggle the grid without restarting the
scene. Reset to Defaults and Restart Scene SHALL move to inputs 7 and 8.

#### Scenario: Enable the grid

- **WHEN** the grid is hidden and the developer presses `6`
- **THEN** the resolution grid becomes visible over the game

#### Scenario: Disable the grid

- **WHEN** the grid is visible and the developer presses `6`
- **THEN** the resolution grid becomes hidden without changing gameplay

#### Scenario: Later inputs remain available

- **WHEN** the developer views the PC debug input list
- **THEN** Reset to Defaults is assigned to `7`
- **AND** Restart Scene is assigned to `8`

### Requirement: Grid coordinates match Total Rez

The visible grid SHALL cover the rendered game area and use a top-left origin
whose width and height equal the current Total Rez. Grid x values SHALL
increase to the right and grid y values SHALL increase downward.

#### Scenario: Grid is enabled at startup resolution

- **WHEN** the developer enables the grid
- **THEN** its right and bottom bounds match the Total Rez width and height
- **AND** its top-left coordinate is `x=0, y=0`

#### Scenario: Upscaling mode changes

- **WHEN** the grid is visible and Total Rez remains unchanged while Render
  Rez changes
- **THEN** the grid coordinate bounds remain matched to Total Rez

### Requirement: Grid provides a midpoint reference

The grid SHALL emphasize the horizontal and vertical midpoint and SHALL show
one readable label containing the midpoint's current x and y coordinates.
Ordinary grid lines SHALL remain unlabeled.

#### Scenario: Midpoint is visible

- **WHEN** the grid is enabled for a Total Rez of 1080 by 1920
- **THEN** the midpoint is labeled `x=540, y=960`

### Requirement: Grid follows viewport changes

The grid SHALL remain aligned with the game and SHALL update its coordinate
bounds and midpoint label when the viewport, orientation, fullscreen state,
device pixel ratio, or game presentation changes.

#### Scenario: Portrait mobile viewport changes

- **WHEN** a visible grid is shown in a portrait mobile browser and the visual
  viewport changes
- **THEN** the grid continues to cover the visible game area
- **AND** its coordinates reflect the updated Total Rez

#### Scenario: Desktop viewport changes

- **WHEN** a visible grid is shown in a desktop browser and the window resizes
- **THEN** the grid remains aligned to the game canvas

### Requirement: Grid is non-interactive and backend-independent

The grid SHALL NOT capture pointer input or alter gameplay, camera, rendering
backend selection, or render resolution. It SHALL behave equivalently with
WebGPU and the WebGL fallback and SHALL be disabled by default.

#### Scenario: Player interacts through the grid

- **WHEN** the grid is visible and the player uses mouse or touch controls
- **THEN** the underlying gameplay input continues to receive the interaction

#### Scenario: Rendering backend changes

- **WHEN** the game runs with WebGPU or its WebGL fallback
- **THEN** the same debug input toggles the same screen-space grid behavior
