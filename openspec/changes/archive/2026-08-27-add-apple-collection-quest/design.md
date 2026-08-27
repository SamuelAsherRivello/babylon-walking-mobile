## Context

The client bootstrap currently creates the prototype ground and player, one
tree, the `GOAL` zone, runtime input, and a five-slot production HUD directly.
Zones already emit one enter event per outside-to-inside transition. The HUD
can render supplied slots but has no interactive completion state. See
`proposal.md` and the level-quest gameplay spec for the required behavior.

## Goals / Non-Goals

**Goals:**

- Establish named level and quest boundaries without building a level
  sequencer.
- Keep quest state independent from Babylon.js rendering and HUD controls.
- Reuse zone transition events as the only apple-award trigger.
- Stop every current gameplay input path while leaving Babylon GUI usable.
- Keep new Babylon GUI resources owned and disposable by the production HUD.

**Non-Goals:**

- Persist inventory, quest, or level state.
- Add level selection, automatic advancement, multiple quests, or save data.
- Change the existing `GOAL` zone, movement tuning, or score.
- Add mobile movement controls or new assets and dependencies.

## Decisions

### Represent the current world as a first-level runtime

Move composition of the prototype scene and both zones behind an asynchronous
first-level creation operation. Declare the definition's display name as
`Level 1` and give it an ordered quests collection containing `Quest 1`.
Return the player, camera dependencies, zones, and Apple zone needed by
bootstrap integration. Keep the typed level and quest definitions suitable for
future levels that contain more than one quest, without adding sequencing now.

Leaving all layout creation in `index.ts` was rejected because it would add a
level name without giving the concept ownership. A general level sequencer was
rejected because there is only one level and `Ok` reloads the app.

### Let zones optionally own a centered model

Extend a zone definition with an optional model declaration. The first
supported mapping is the tree model already used by the prototype. `Apple` is
3 units wide and 3 units deep and declares that tree. Create the model at the
exact center of the zone background. `GOAL` declares no model and remains
otherwise unchanged.

A separate top-level tree list was rejected because the tree now belongs to
the Apple area. Baking tree creation into Apple-specific bootstrap code was
rejected because future zones may also declare models.

### Keep apple quest state pure and fixed to three visits

Add a small gameplay model for `Quest 1` that starts at zero, increments once
per accepted Apple-zone entry, exposes the current count and completion state,
and reports whether an entry newly completed the quest. Set its required apple
count to three and ignore entries after completion. The model contains no
Babylon.js objects, asset URLs, HUD controls, or storage.

Putting the count on the zone was rejected because zones are reusable world
locations. Letting the HUD own inventory progress was rejected because the HUD
is presentation rather than gameplay state.

### Derive three inventory slots from quest progress

Extend the pure inventory helper to create the number of slots declared by the
quest, containing the apple item up to the supplied count. `Quest 1` declares
three slots. Initialize it with zero, then update the HUD after every accepted
entry. Clamp invalid counts so presentation remains safe, although the quest
itself never exceeds three.

Maintaining a second mutable slot array was rejected because the apple count is
the authoritative state and its slot view can be derived cheaply.

### Complete through a single latched transition

Subscribe only the Apple zone's enter observable to the quest. On an accepted
entry, update inventory. When that entry reports the first completion, disable
gameplay input and show the completion prompt. The existing `GOAL` observable
hooks remain unchanged and do not affect the quest.

Polling the zone's occupied state for awards was rejected because it could add
an apple every frame. Comparing the inventory count in the render loop was
rejected because completion should be caused by the third accepted entry.

### Disable runtime and camera controls at completion

Add an enabled state to the runtime input controller that clears pending motion
when disabled. Also detach Babylon camera controls when the quest completes so
keyboard, mouse, and touch camera movement stop. The render loop and GUI remain
active, allowing the completion button and other UI to receive pointer input.

Disposing the entire input controller was rejected because enabled state is an
explicit gameplay lifecycle concept and is easier to test. Stopping the render
loop was rejected because it would also prevent responsive UI rendering.

### Let ProductionHud own a configurable prompt

Create a reusable prompt on the HUD's existing fullscreen texture. Its
configuration accepts a title, body, and zero, one, or two button definitions.
The completion configuration uses title `Level Compete`, body `Restart game?`,
and one `Ok` button. The prompt becomes visible only when requested and keeps
hit testing enabled for configured buttons. Alignment uses Babylon GUI center
alignment and ideal-height sizing, so desktop, portrait mobile, WebGPU, WebGL,
and viewport resizing use the existing responsive coordinate space.

The HUD owns and disposes these controls with its fullscreen texture. A DOM
overlay was rejected because production UI already uses Babylon GUI. A hover
requirement was rejected because every configured button must work with touch.

### Give each quest event an explicit sound

Declare `levelup.wav` as the `Quest 1` beginning sound and play it once when
the quest starts. Declare `clear.wav` as its update sound and play it once for
each accepted apple collection, including the third collection. Do not play it
while the player remains in the zone or after quest completion.

Declare the runtime UI click URL separately from the world-background click
URL, even though both initially point to `rotate.wav`. This keeps their intent
independent so either asset can change later without restructuring input code.

The browser may reject the automatic beginning sound under its autoplay
policy. Use the existing sound manager behavior to attempt playback at startup
without blocking level creation, and retain its playback-failure handling.

### Play completion UI feedback before a plain application reload

The `Ok` button handler plays the separately declared runtime UI click effect,
then calls `window.location.reload()` after playback completes or a bounded
failure fallback occurs. Quest, inventory, and level state stay in memory and
therefore restart cleanly. It does not clear local storage, so existing debug
preferences survive as requested.

An in-place scene reset was rejected because it adds disposal and
reinitialization complexity without benefit for the one-level prototype.

## Risks / Trade-offs

- [The centered tree obscures the Apple zone] -> Keep the zone background and
  title visible around the 3 by 3 area and verify the layout in a browser.
- [Startup audio is blocked by browser policy] -> Attempt it without blocking
  startup and preserve the sound manager's safe failure behavior.
- [Reload cuts off the runtime UI click] -> Wait for playback completion with
  a bounded failure fallback before reloading.
- [Held keys continue motion after completion] -> Clear held, pending, speed,
  and direction state when gameplay input is disabled.
- [Camera touch input remains active] -> Detach Babylon camera controls as part
  of the same completion transition.
- [The prompt blocks or misses UI input] -> Enable hit testing only where the
  interactive completion surface needs it and verify mouse and touch behavior.
- [Future levels need different quest types] -> Keep the level boundary and
  pure quest model focused; generalize only when a second level exists.

## Migration Plan

1. Extend failing tests for named levels and quests, three-slot progress,
   zone-owned models, sound events, input gating, HUD, and integration.
2. Update the level definition, zone model mapping, and pure apple quest.
3. Add the configurable prompt and gameplay-input gate.
4. Integrate quest sounds, zone awards, completion, and audible restart.
5. Run focused tests, type checking, the full suite, production build,
   line-length validation, and real-browser gameplay checks.

Rollback consists of removing the level and quest integration and restoring
the direct prototype startup composition. There is no stored gameplay data or
dependency migration.
