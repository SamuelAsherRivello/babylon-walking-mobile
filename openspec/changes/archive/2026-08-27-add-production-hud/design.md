## Context

The current debug HUD is created by `addUI.ts` as fixed HTML in the browser's
lower-right corner. It owns configuration, rendering, and input diagnostics,
and its visibility is stored in debug preferences and toggled from keyboard
input.

The game already depends on `@babylonjs/gui`. Its canvas is being changed to a
centered, full-height portrait frame, and future frame aspect ratios may differ.
See `proposal.md` and `specs/production-hud/spec.md` for the intended behavior.
All authored code must remain at 80 characters per line or less.

## Goals / Non-Goals

**Goals:**

- Give production and debug presentation separate owners and lifecycles.
- Keep production controls anchored to game-frame corners at every aspect
  ratio without screen-width calculations.
- Provide a small presentation API for future gameplay score and inventory
  updates.
- Preserve debug HUD behavior while making its purpose explicit.

**Non-Goals:**

- Add score-earning or inventory-collection gameplay.
- Add interactive inventory selection, drag and drop, or item quantities.
- Change the portrait frame's sizing or cropping behavior.
- Give the production HUD a normal gameplay visibility toggle.
- Introduce a shared HUD base class or a new UI dependency.

## Decisions

### Give each HUD a dedicated concrete class

Move the existing HTML overlay behavior behind a `DebugHud` class and create a
separate `ProductionHud` class for Babylon GUI. `DebugHud` retains toggle,
visibility, configuration, resolution, FPS, shortcut, and target-FPS methods.
`ProductionHud` owns its fullscreen texture and exposes score and inventory
updates but no ordinary visibility method.

A shared base class was rejected because the two HUDs use different renderers,
visibility policies, state, and disposal mechanics. Keeping them concrete
prevents a superficial abstraction from coupling their future development.

### Render production UI with one fullscreen Babylon GUI texture

Create one foreground `AdvancedDynamicTexture` for the scene and compose the
HUD with Babylon GUI containers, text, rectangles, and images. Use adaptive
design units so sizes and the initial `UI_PADDING = 50` scale consistently with
the game frame.

An additional HTML overlay was rejected because production UI should follow
the Babylon render surface and its aspect ratio. Multiple fullscreen textures
were rejected because Babylon supports one fullscreen GUI per scene and one
texture is sufficient for both corner groups.

### Anchor controls through alignment rather than frame dimensions

Align the left group to the top-left and the score group to the top-right.
Apply the positive shared padding to the left group and the corresponding
inward right offset to the score group; apply the same positive padding to
both top offsets. Babylon recalculates aligned positions when the render
surface changes, so the layout requires neither a fixed width nor a known
aspect ratio.

Anchoring against the visible browser viewport was rejected because the user
selected the game frame, including any intentional game-frame cropping, as the
production HUD's coordinate space.

### Keep gameplay state outside the presentation classes

Maintain the demonstration score and five-slot inventory as game state in the
client startup layer, then pass values into `ProductionHud.setScore` and
`ProductionHud.setInventory`. Score formatting pads to a minimum of three
digits. Inventory slots use `null` for empty and an item record containing a
PNG source for occupied slots.

Letting the HUD award points or mutate inventory was rejected because future
gameplay systems should own those rules. The HUD only reflects supplied state.

### Use a repository-owned apple PNG and fixed slot count

Add a small transparent apple PNG beneath the public inventory assets and load
it through Vite's base URL so local and GitHub Pages builds both work. Build
five slot frames with Babylon controls, showing the apple image in the first
slot for the demonstration state.

A remote image URL was rejected because it would add availability, licensing,
and offline-development risk. A sprite atlas was rejected as unnecessary for
one demonstration item.

### Keep non-interactive controls out of input handling

Disable hit testing on the production HUD containers so pointer and touch input
continue to reach the camera and gameplay. Interactive inventory behavior can
enable hit testing on specific controls in a later feature.

## Risks / Trade-offs

- [Game-frame corners can be cropped by a narrower browser] -> Preserve the
  selected game-frame anchoring contract and test the intended crop behavior.
- [HUD scale may feel too large or small on devices] -> Centralize the initial
  padding and other visual constants for focused visual tuning.
- [Refactoring the debug HUD could change existing behavior] -> Add focused
  contract tests before moving it and preserve its public operations.
- [Asset paths can break in a GitHub Pages build] -> Resolve the PNG through
  `import.meta.env.BASE_URL` and verify a production build.
- [GUI controls could block gameplay input] -> Disable hit testing and verify
  pointer input in a real browser.

## Migration Plan

1. Add failing production and debug HUD contract tests.
2. Introduce the two dedicated HUD classes and preserve debug behavior.
3. Add the apple asset and initialize the demonstration game state.
4. Run focused tests, type checking, and the production build.
5. Verify both HUDs, dynamic score updates, debug toggling, input pass-through,
   and corner anchoring at multiple aspect ratios in a real browser.

Rollback consists of reverting the HUD classes, startup integration, tests,
and apple asset. No stored game data or public API migration is involved.
