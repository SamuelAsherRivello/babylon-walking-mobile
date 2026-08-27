## 1. Failing Audio Tests

- [x] 1.1 Add sound-manager unit tests for looping music, configured volumes,
  autoplay retry, overlapping effects, and non-fatal rejections; run the
  focused test and verify it fails before the manager exists
- [x] 1.2 Add an input test for one click callback per canvas click; run the
  focused test and verify it fails before the callback is implemented
- [x] 1.3 Add a bootstrap integration test for the selected assets, volumes,
  startup music, and click wiring; run it and verify the current bootstrap
  fails the new expectations

## 2. Audio Implementation

- [x] 2.1 Implement the browser audio manager with injected audio creation,
  music retry state, and cloned effects; verify its focused unit test passes
- [x] 2.2 Extend canvas input actions with the click callback while preserving
  coordinate logging; verify the focused input test passes
- [x] 2.3 Create and configure the manager during scene startup, wire click
  playback, and remove the obsolete `Pop01.mp3` reference; verify the
  bootstrap integration test passes
- [x] 2.4 Add the disabled background-music flag, guard startup and resume
  playback, and update the bootstrap test; verify the focused test passes

## 3. Verification

- [ ] 3.1 Run the complete unit-test suite, TypeScript check, and production
  build; verify all commands pass and changed authored lines are at most 80
  characters
- [x] 3.2 Run the application in a real browser and verify the music asset is
  not requested, canvas clicks request or play the click SFX, repeated clicks
  do not stop rendering, and no uncaught audio error appears
