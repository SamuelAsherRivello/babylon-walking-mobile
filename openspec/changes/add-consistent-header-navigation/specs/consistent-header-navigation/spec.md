## Purpose

Provide one recognizable application shell so account context, wallet context,
and connection state remain understandable while the user moves between views.

## ADDED Requirements

### Requirement: Persistent application header

The application SHALL present the project title, three header items, and the
overflow menu in one top bar on the landing, login, and gameplay views.

#### Scenario: Landing view
- **WHEN** the application is first opened
- **THEN** the top bar uses the same structure and visual treatment as the
  gameplay view

#### Scenario: Gameplay view
- **WHEN** a level is running
- **THEN** the top bar remains in the same position and order

### Requirement: Consistent header items

The right side of the top bar SHALL contain Address, Balance, and Status
header items. Each item SHALL have a consistent title and value treatment and
MAY include a unit after its value.

#### Scenario: Pre-login defaults
- **WHEN** no wallet account is connected
- **THEN** Address shows a sensible signed-out default, Balance shows `0`,
  and the balance unit is `sats`

#### Scenario: Connection state
- **WHEN** the wallet connection changes
- **THEN** Status displays the current connection state without changing the
  top-bar structure

### Requirement: Responsive and touch-safe header

The top bar SHALL remain legible within the visible safe game frame on desktop
and portrait mobile viewports, and its non-interactive regions MUST NOT block
gameplay touch input.

#### Scenario: Portrait resize
- **WHEN** the browser viewport changes size or safe-area insets
- **THEN** the header reflows or scales within the visible game frame without
  clipping its titles or values

#### Scenario: Overflow menu interaction
- **WHEN** the user taps the overflow menu
- **THEN** the menu remains reachable by touch and only its intended controls
  receive the interaction
