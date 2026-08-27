## Context

The canvas currently uses a full-height 9:16 CSS frame centered horizontally.
That already produces the desired horizontal overscan on a narrow portrait
screen. The reported screenshot instead shows a single top strip, which points
to a difference between the layout viewport, visual viewport, and physical
screen rather than an incorrect game-frame aspect ratio.

The HUD and virtual joystick already calculate offsets from canvas geometry,
visual-viewport dimensions, and CSS safe-area insets. Their viewport model does
not include the visual viewport origin. See `proposal.md` for motivation and
`specs/mobile-fullscreen-cover/spec.md` for observable requirements.

No new Babylon.js resources or dependencies are needed. Existing GUI resources
remain owned and disposed by `ProductionHud` and `VirtualMovementJoystick`.

## Goals / Non-Goals

**Goals:**

- Separate mobile cover behavior from the accepted desktop presentation.
- Derive mobile cover and UI-safe geometry from one current viewport snapshot.
- Keep cover layout stable through fullscreen, orientation, and browser-chrome
  transitions.
- Identify whether an uncovered strip belongs to the page or to an
  operating-system region that web content cannot draw into.

**Non-Goals:**

- Change the camera, field of view, player movement, or world composition.
- Guarantee drawing inside an operating-system region that the browser does
  not expose to web content.
- Change fullscreen targeting away from the document root.
- Change the installed PWA display mode without evidence that the browser's
  Fullscreen API cannot provide the requested drawable area.
- Add a browser-detection library or another dependency.

## Decisions

### Use cover geometry only for portrait mobile presentation

Portrait, coarse-pointer presentation will use cover sizing rather than a new
fixed aspect ratio. For a 9:16 source frame, the displayed width and height are
scaled by the larger factor required to cover the current drawable viewport.
The frame remains centered, so overflow is cropped equally on opposing edges.

Desktop keeps the current centered fixed-aspect behavior. Applying cover to all
platforms was rejected because the user explicitly accepts desktop backdrop
bars and values the current desktop composition.

### Treat the visual viewport as a rectangle with an origin

A focused viewport snapshot will contain width, height, offset-left, and
offset-top together with all four safe-area insets. Canvas cover placement and
gameplay UI layout will use the same snapshot, avoiding disagreement between
the render surface and controls.

Using only `visualViewport.width` and `height` was rejected because mobile
browser chrome and zoom can move the visual viewport inside the layout
viewport. Using only CSS viewport units was rejected because the screenshot
shows that their origin and usable size require runtime verification on the
target device.

### Extend viewport metadata into display cutouts

The page viewport declaration will opt into `viewport-fit=cover`. The scene may
render beneath drawable cutout and gesture-inset regions, while HUD and touch
controls remain padded inside safe-area insets.

Avoiding cutout coverage was rejected because it can create page-colored edge
strips. Ignoring safe-area insets was rejected because it could hide gameplay
UI or place controls beneath system gestures.

### Synchronize from visual-viewport and fullscreen events

One idempotent layout update will run for the existing window resize,
orientation, fullscreen, and canvas resize signals. When available, it will
also observe visual-viewport resize and scroll events because either can change
the drawable rectangle. Every listener will be removed by the existing runtime
disposal path.

Creating independent handlers was rejected because event ordering differs
across mobile browsers and could leave canvas, engine, HUD, and joystick using
different geometry snapshots.

### Diagnose the strip before selecting its offset correction

Real-device verification will record only non-sensitive geometry:
fullscreen-active state, screen and inner dimensions, visual-viewport bounds,
canvas bounds, safe-area insets, and display mode. The implementation will use
the measured relationship to determine whether canvas positioning needs an
origin correction.

If the strip is inside the drawable viewport, the cover calculation must
eliminate it. If it is outside the drawable viewport and owned by the browser
or operating system, CSS cannot paint it; successful Fullscreen API entry will
be verified before considering a separate installed-PWA display-mode change.
Guessing a fixed negative top offset was rejected because it could crop the
bottom on devices whose viewport origin is already correct.

### Keep gameplay UI within the visible safe intersection

HUD and joystick layout will intersect the canvas rectangle with the drawable
viewport after safe-area insets. Babylon GUI offsets will be derived from that
intersection in ideal-height coordinates. Scene pixels can extend beneath
insets and outside the viewport; gameplay UI cannot.

Anchoring UI to the full overscanned canvas was rejected because narrow devices
could crop controls. Anchoring UI to screen coordinates without the canvas
intersection was rejected because it can misalign Babylon GUI content.

## Risks / Trade-offs

- [Mobile viewport APIs report values in different event phases] -> Schedule
  one idempotent update and verify settled geometry after each transition.
- [Fullscreen is denied without a user gesture] -> Preserve the existing
  gesture-based request and keep the non-fullscreen game usable.
- [An OS-owned status region cannot be painted by web content] -> Confirm the
  drawable boundary and do not disguise it as an aspect-ratio defect.
- [Cover crops more scene on unusual portrait ratios] -> Keep UI safe and
  centered; camera composition remains a separate future decision.
- [Extra viewport events increase resize work] -> Reuse the existing resize
  path and avoid creating new render-loop work.
- [Cutout handling differs across browsers] -> Combine viewport metadata,
  safe-area insets, and real-device checks on Android Chrome and iOS Safari.

## Migration Plan

1. Capture current target-device geometry and reproduce the uncovered strip.
2. Add failing pure geometry and source-contract tests.
3. Add viewport-fit metadata and the shared mobile viewport snapshot.
4. Apply mobile cover geometry and safe UI intersection calculations.
5. Connect and dispose the additional visual-viewport event listeners.
6. Verify desktop, portrait mobile, fullscreen, browser-chrome, WebGPU, and
   WebGL behavior in real browsers.

Rollback reverts the viewport metadata, geometry snapshot, mobile cover rules,
listeners, and focused tests. No data or dependency migration is required.
