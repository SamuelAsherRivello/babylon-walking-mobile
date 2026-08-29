## 1. Header model and visual system

- [x] 1.1 Add typed header-item state and pre-login defaults for address,
  balance, unit, and connection status; verify model tests cover zero sats and
  state updates
- [x] 1.2 Define shared header typography, spacing, colors, borders, and
  compact portrait sizing; verify authored lines remain within 80 columns

## 2. Shared Babylon GUI shell

- [x] 2.1 Build the persistent top bar with project title, Address, Balance,
  Status, and retained overflow menu; verify source tests identify all three
  header items and the menu
- [x] 2.2 Integrate the shell with landing, login, and gameplay composition so
  state changes update values in place; verify the header remains mounted
  across each app state
- [x] 2.3 Keep gameplay level, score, inventory, prompt, and virtual controller
  below or alongside the shell without changing their behavior; verify the
  existing focused HUD tests pass

## 3. Responsive interaction and verification

- [x] 3.1 Apply safe-area-aware resize layout and touch hit-testing rules;
  verify portrait and landscape layout tests cover cropping and insets
- [x] 3.2 Run TypeScript, lint, and focused Vitest checks from `Babylon` and
  verify `git diff --check` reports no whitespace errors
- [x] 3.3 Start Vite with `npm start`, inspect the listed Local and Network
  URLs, and use a real browser to verify landing/gameplay visual parity,
  zero-sat defaults, connection status, overflow interaction, and portrait
  layout; confirm the server listens on `0.0.0.0`
