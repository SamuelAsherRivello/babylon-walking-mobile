## Why

The current player HUD makes the first app view feel like a separate welcome
screen instead of the first page of the same application. A persistent top
bar with stable account, balance, and connection context will make navigation
and state changes easier to understand while giving the landing and gameplay
views one visual language.

## What Changes

- Add a persistent top navigation bar shared by landing, login, and gameplay
  states.
- Keep the project title at the left and retain the existing overflow (`...`)
  menu affordance.
- Add three consistent header items for Address, Balance, and Status, each
  using a title, value, and optional unit.
- Show sensible pre-login defaults, including a zero satoshi balance and a
  clearly disconnected or signed-out account state.
- Keep connection state visible in the top bar regardless of app state.
- Rework spacing, typography, borders, colors, and value emphasis so the
  header items form one coherent system based on the supplied mockup.
- Make the landing page use the same top-bar shell as the second app view.
- Preserve touch-safe interaction and responsive behavior on desktop and
  portrait mobile viewports.

## Capabilities

### New Capabilities

- `consistent-header-navigation`: Persistent, state-independent top bar and
  reusable header-item presentation for account, balance, and connection
  context.

### Modified Capabilities

- `production-hud`: Change the production HUD contract so its application
  identity and account context are presented in the shared top bar while
  gameplay-specific content remains available below it.

## Impact

- Affected Babylon GUI layout and styling in the production HUD and its model
  helpers, plus landing/app-state composition where the shared shell is
  created.
- Affected focused HUD tests and new browser-visible layout/state tests.
- No new dependency is required; the implementation will use the existing
  Babylon.js GUI and TypeScript toolset.
- WebGPU-first startup and WebGL fallback remain unchanged because this is a
  UI composition change layered over the existing scene.
