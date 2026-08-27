## 1. HUD Contracts

- [x] 1.1 Add focused production HUD tests for score formatting, five-slot
  inventory state, shared 50-pixel padding, corner alignment, and disabled
  hit testing; run the focused tests and confirm they fail before production
  implementation.
- [x] 1.2 Add a focused debug HUD separation test that preserves its existing
  update and visibility operations without exposing those controls through the
  production HUD; run it and confirm it fails before the ownership refactor.

## 2. Separate HUD Owners

- [x] 2.1 Refactor the existing HTML overlay into a dedicated `DebugHud` class
  while preserving saved visibility, toggle, configuration, resolution, FPS,
  shortcut, and target-FPS behavior; verify the focused debug tests pass.
- [x] 2.2 Add a dedicated `ProductionHud` class using one fullscreen Babylon
  GUI texture, independent top-left and top-right containers, adaptive design
  sizing, shared `UI_PADDING`, and non-blocking controls; verify the focused
  production HUD layout tests pass.
- [x] 2.3 Implement dynamic score and five-slot inventory update methods,
  including minimum three-digit score formatting; verify focused state tests
  cover scores 0, 8, and 1250 plus occupied and empty inventory slots.

## 3. Demo Asset And Integration

- [x] 3.1 Add a repository-owned transparent apple PNG beneath the public
  inventory assets and verify it is a readable PNG with transparent pixels.
- [x] 3.2 Initialize the production HUD with the game title, score variable at
  zero, and an inventory containing the apple followed by four empty slots;
  verify the debug toggle changes only the debug HUD and the production build
  resolves the apple through Vite's base URL.

## 4. Verification

- [x] 4.1 Run all unit tests, TypeScript checking, and the production build;
  verify every command passes and authored source remains within 80 characters
  per line.
- [x] 4.2 In a real browser, verify the initial HUD, camera input beneath it,
  independent debug toggling, and both-corner anchoring across at least three
  viewport aspect ratios; capture screenshots and confirm no console errors.
