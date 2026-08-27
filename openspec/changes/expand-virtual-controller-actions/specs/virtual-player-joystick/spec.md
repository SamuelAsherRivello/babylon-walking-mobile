## MODIFIED Requirements

### Requirement: Virtual movement joystick is always available

The game SHALL show one virtual movement joystick as the lower-left movement
control within the configured virtual controller on desktop and mobile while
gameplay input is enabled. It SHALL display the single-line label `Move`,
remain inside the visible browser viewport, and respect lower-left safe-area
insets after viewport or orientation changes.

#### Scenario: Desktop startup

- **WHEN** the game starts in a desktop browser
- **THEN** the virtual movement joystick is visible in the lower-left
- **AND** `Move` is visible beneath it on one line

#### Scenario: Portrait mobile startup

- **WHEN** the game starts in a portrait mobile browser
- **THEN** the virtual movement joystick is fully visible in the lower-left
- **AND** it appears within the complete configured virtual controller

#### Scenario: Viewport changes

- **WHEN** the browser viewport, orientation, or visible canvas crop changes
- **THEN** the joystick remains fully visible within the lower-left safe area
- **AND** its label remains fully visible on one line
