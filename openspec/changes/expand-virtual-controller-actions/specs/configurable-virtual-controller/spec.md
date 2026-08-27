## Purpose

Provide a reusable, configurable on-screen gameplay controller whose movement
and labeled action controls remain independent from game-specific behavior.

## ADDED Requirements

### Requirement: Controller supports configurable action counts

The virtual controller SHALL provide one movement control and SHALL accept
between zero and three configured action controls. Each configured action
SHALL supply an identifier, label, optional displayed keyboard shortcut, and
activation behavior without embedding game-specific behavior in the reusable
controller.

#### Scenario: Movement-only configuration

- **WHEN** a game configures no actions
- **THEN** the virtual controller displays only the movement control

#### Scenario: One through three actions

- **WHEN** a game configures one, two, or three actions
- **THEN** the controller displays exactly that many action controls
- **AND** each action invokes its own configured activation behavior

#### Scenario: Too many actions

- **WHEN** a game attempts to configure more than three actions
- **THEN** controller creation rejects the unsupported configuration

### Requirement: Controller uses the shared circular visual language

The movement control SHALL display `Move` beneath the joystick. Each action
control SHALL use only the same circular puck appearance as the center of the
joystick, without a visible square backing, and SHALL display its action label
beneath the circle. Every label SHALL remain on one line and SHALL match the
current `Score:` line's font family, weight, size, color, and outline
treatment.

#### Scenario: This game's controller is displayed

- **WHEN** this game creates its configured virtual controller
- **THEN** it displays `Move`, `Jump (C)`, and `Shoot (V)` on one line each
- **AND** Jump and Shoot display as standalone puck circles
- **AND** no square backing is visible behind either action circle

#### Scenario: Label styling is compared with the score

- **WHEN** a controller label and the production `Score:` line are visible
- **THEN** their font family, weight, size, color, and outline match

### Requirement: Movement and actions support concurrent touch input

The virtual controller SHALL track movement and each action with independent
pointers. An action SHALL activate once when its circle is pressed and SHALL
not repeat solely because the same pointer remains held.

#### Scenario: Player moves and jumps together

- **WHEN** one pointer holds the movement joystick and another presses Jump
- **THEN** movement remains active
- **AND** Jump activates exactly once for that press

#### Scenario: Player holds an action circle

- **WHEN** a pointer remains down on an action circle
- **THEN** the action activates only once until a later distinct press

### Requirement: Complete controller remains within visible bounds

The controller SHALL keep its movement control, configured action controls,
and single-line labels within the visible safe-area bounds. It SHALL recompute
its layout without cumulative drift after viewport, orientation, fullscreen,
canvas crop, or safe-area changes.

#### Scenario: Portrait mobile layout with two actions

- **WHEN** this game starts in a portrait mobile viewport
- **THEN** Move remains fully visible in the lower-left safe area
- **AND** Jump and Shoot remain fully visible toward the lower-right

#### Scenario: Three actions require less space

- **WHEN** three configured actions do not fit at the preferred spacing
- **THEN** the controller reduces spacing or scales its complete layout
- **AND** every control and its single-line label remains visible

#### Scenario: Visible bounds change repeatedly

- **WHEN** visible bounds change more than once
- **THEN** the controller lays out from the current bounds each time
- **AND** no cumulative position drift occurs

### Requirement: Controller follows gameplay input lifecycle

Disabling gameplay input SHALL hide and deactivate the complete controller,
clear active movement, and prevent action activation. Re-enabling gameplay
input SHALL restore the configured controls in an idle state.

#### Scenario: Gameplay input is disabled

- **WHEN** gameplay input is disabled during movement
- **THEN** the complete controller becomes hidden and inactive
- **AND** movement returns to center immediately

#### Scenario: Gameplay input resumes

- **WHEN** gameplay input is re-enabled
- **THEN** the configured controls return without retained pointer state

### Requirement: Controller works with both rendering backends

Controller appearance, labels, positioning, pointer behavior, and action
activation SHALL be equivalent under WebGPU and the WebGL fallback.

#### Scenario: WebGPU controller

- **WHEN** the game uses WebGPU
- **THEN** all configured controls work and appear as specified

#### Scenario: WebGL fallback controller

- **WHEN** the game uses the WebGL fallback
- **THEN** all configured controls work and appear as specified
