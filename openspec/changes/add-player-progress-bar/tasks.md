## 1. In-world component

- [x] 1.1 Add the reusable `player-progress-bar` component with typed values,
  colors, circular fill, no text, and visibility controls; verify strict
  TypeScript compilation succeeds
- [x] 1.2 Parent the visual above the player, enable camera-facing behavior,
  and own/dispose all Babylon resources; verify component tests cover values,
  clamping, visibility, and disposal

## 2. Gameplay integration

- [x] 2.1 Bind the meter to Apple work progress without moving work-state logic
  into the renderer; verify progress updates during active frames and remains
  retained while paused
- [x] 2.2 Hide the meter after completion and preserve the existing inventory,
  audio, and level-completion behavior; verify gameplay tests pass

## 3. Verification

- [x] 3.1 Run TypeScript, lint, and focused/all Vitest checks and verify the
  change respects the 80-character authored-code limit
- [ ] 3.2 Run the Vite app in a real desktop browser and portrait mobile-sized
  viewport with WebGPU and WebGL fallback paths, verifying the circle follows
  the player and remains readable during camera movement
