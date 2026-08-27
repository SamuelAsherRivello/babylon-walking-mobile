## Purpose

Provide reusable, visually complete tree placement at world positions while
keeping each tree grounded and integrated with scene lighting and shadows.

## ADDED Requirements

### Requirement: Tree placement uses a ground-contact position

The system SHALL allow a supported tree type to be added at an arbitrary world
position. The rendered tree's lowest point MUST rest at the requested vertical
coordinate, regardless of the source model's internal origin.

#### Scenario: Tree is placed away from the origin

- **WHEN** a caller adds a supported tree at `(3, 0, -3)`
- **THEN** the tree is centered at horizontal coordinates `(3, -3)`
- **AND** its lowest rendered point rests at `y = 0`

#### Scenario: Tree uses a raised contact position

- **WHEN** a caller adds a supported tree at a position above `y = 0`
- **THEN** the tree's lowest rendered point rests at the requested height

### Requirement: Repeated tree placement is reusable

The system SHALL support adding multiple independent instances through the
same placement operation. Source assets MUST be loaded at most once per tree
type for a scene and reused for later placements of that type.

#### Scenario: Multiple trees share a type

- **WHEN** a caller adds the same supported tree type at two positions
- **THEN** two independently positioned tree instances are created
- **AND** the source asset is not fetched and parsed again for the second tree

### Requirement: Placed trees integrate with scene shadows

Every rendered mesh belonging to a placed tree MUST be registered as a shadow
caster while the existing Ground remains a shadow receiver.

#### Scenario: Tree casts onto the Ground

- **WHEN** a tree is placed on the Ground under the prototype light
- **THEN** every rendered part of the tree participates in shadow casting
- **AND** its shadow can be received by the Ground

### Requirement: Initial scene demonstrates the tree capability

The game SHALL load one complete Maple Tree 4 instance at `(3, 0, -3)` during
startup without replacing or covering the Player at the world origin.

#### Scenario: Game starts with the first tree

- **WHEN** the game finishes loading
- **THEN** the textured Maple Tree 4 is visible at `(3, 0, -3)`
- **AND** the Player remains available at the origin
- **AND** existing camera, HUD, controls, and orbiter behavior remain available

