## 1. Work model

- [x] 1.1 Add typed in-memory work state and manager APIs, then verify strict
  TypeScript compilation succeeds
- [x] 1.2 Add unit tests for start, resume, active-frame progression,
  inactive-frame pause, clamping, completion, and runtime-only state, then
  verify the focused Vitest suite passes

## 2. Gameplay integration

- [x] 2.1 Replace immediate Apple-zone awards with one-second active work and
  retained progress, then verify quest unit tests cover leave and re-entry
- [x] 2.2 Preserve inventory, audio, level targets, and completion prompts,
  then verify the existing gameplay test suite passes

## 3. Verification

- [x] 3.1 Run the Babylon TypeScript, lint, and test checks and verify no
  unrelated files are modified
- [ ] 3.2 Run the Vite app in a real desktop browser and portrait mobile-sized
  viewport and verify Apple work pauses, resumes, and awards at one second
