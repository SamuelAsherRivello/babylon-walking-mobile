## Purpose

Provide player-facing Jump and Shoot actions with deterministic motion,
facing-relative behavior, and bounded lifetimes across supported browsers.

## ADDED Requirements

### Requirement: Player performs a single non-stacking jump

Activating Jump while the player is grounded SHALL move the player through a
frame-rate-independent vertical arc and return the player to the same ground
height. Activating Jump while that arc is active SHALL NOT start, stack, or
restart another jump.

#### Scenario: Grounded player jumps

- **WHEN** the grounded player activates Jump
- **THEN** the player rises visibly above the ground
- **AND** returns to the original ground height after one arc

#### Scenario: Jump is pressed while airborne

- **WHEN** Jump is activated during the current jump arc
- **THEN** the current arc continues without stacking or restarting

#### Scenario: Jump runs at different frame rates

- **WHEN** the same jump runs at different render frame rates
- **THEN** its height, duration, and ending ground height are equivalent

### Requirement: Player shoots in the current facing direction

Activating Shoot SHALL create a visible ball just ahead of the player and move
it in the player's horizontal facing direction captured at activation time.
The shot direction SHALL be independent from the camera orientation.

#### Scenario: Player shoots after turning

- **WHEN** the player faces a new horizontal direction and activates Shoot
- **THEN** the ball travels away from the player in that facing direction

#### Scenario: Camera orbits before shooting

- **WHEN** the camera orbits without changing the player's facing direction
- **THEN** a new shot continues to use the player's facing direction

#### Scenario: Player turns after shooting

- **WHEN** the player turns after a ball has been created
- **THEN** the existing ball continues along its captured direction

### Requirement: Each shot lasts exactly three seconds

Each shot SHALL move in a straight horizontal line for three seconds of
runtime and SHALL then disappear and release its owned rendering resources.
Separate shots SHALL track their lifetimes independently.

#### Scenario: Shot reaches its lifetime

- **WHEN** three seconds have elapsed since a ball was created
- **THEN** that ball is no longer visible in the scene
- **AND** its owned resources are disposed

#### Scenario: Multiple shots overlap

- **WHEN** Shoot is activated again before an earlier shot expires
- **THEN** both balls continue with independent directions and lifetimes

### Requirement: Actions work with both rendering backends

Jump motion and Shoot appearance, direction, lifetime, and disposal SHALL be
equivalent under WebGPU and the WebGL fallback.

#### Scenario: Actions under WebGPU

- **WHEN** the game uses WebGPU
- **THEN** Jump and Shoot behave as specified

#### Scenario: Actions under WebGL fallback

- **WHEN** the game uses the WebGL fallback
- **THEN** Jump and Shoot behave as specified
