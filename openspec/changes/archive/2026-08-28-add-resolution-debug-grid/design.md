## Context

See `proposal.md` for motivation. The debug input list and keyboard dispatch
are separate from the render-resolution controller. Canvas presentation can
also change independently on desktop, portrait mobile, fullscreen, and visual
viewport events. The overlay therefore needs both Total Rez coordinates and
the canvas's current CSS bounds.

## Goals / Non-Goals

**Goals:**

- Keep grid coordinates numerically identical to Total Rez.
- Keep the overlay aligned to the game through existing resize paths.
- Make screenshots readable with sparse green lines and one midpoint label.
- Isolate all created overlay resources behind a disposable debug class.

**Non-Goals:**

- World-space coordinates, object measurement, or gameplay hit testing.
- Labels on every grid line or an interactive coordinate inspector.
- Persistence of grid visibility across reloads.
- A new touch gesture or production HUD control.

## Decisions

### Use an SVG overlay in Total Rez coordinate space

A focused `ResolutionDebugGrid` class will own a browser SVG element attached
to the document. Its view box will use Total Rez width and height, while its
fixed CSS rectangle will copy the game canvas bounds. This makes SVG units
equal Total Rez pixels even when device pixel ratio or CSS scaling changes.

An HTML canvas overlay was considered, but it would require its own drawing
scale and clearing lifecycle. Babylon.js GUI was also considered, but this is
a screen diagnostic rather than scene content and should not affect engine
resources or Render Rez.

### Use sparse green reference lines and a stronger midpoint

Ordinary lines will be spaced at 100 Total Rez pixels and will remain
unlabeled. The exact horizontal and vertical midpoint lines will be stronger,
with one label formatted as `x=<value>, y=<value>`. The top-left origin and
right/down axis directions match browser screen coordinates.

Green follows the project's debug-draw default and stays visually distinct
from the production HUD. A transparent, pointer-ignoring root keeps gameplay
visible and interactive.

### Integrate with the existing resolution and resize synchronization

The bootstrap will create one grid instance after the initial render
resolution snapshot is available. The existing synchronization function will
pass each new Total Rez to the grid, and the existing resize handler will pass
the current canvas bounding rectangle after presentation is updated. No new
global resize listener is needed.

Touch behavior is unchanged: the overlay ignores pointer events, and no new
touch-only toggle is added. On portrait mobile, the same resize and visual
viewport paths keep it aligned. WebGPU and WebGL use the same DOM overlay.

### Keep visibility session-only and dispose owned DOM resources

The grid starts hidden and key 6 toggles its in-memory visibility. Reset to
Defaults hides it, while key 7 performs reset and key 8 restarts the scene.
The grid class removes its SVG root during runtime disposal. No Babylon.js
resource is created or owned.

Persisting visibility was considered but rejected because the grid is a
temporary screenshot aid and should never unexpectedly cover a later run.

## Risks / Trade-offs

- [Very high Total Rez values can create many SVG lines] -> Use 100-pixel
  spacing and recreate only when Total Rez changes.
- [Grid lines can cross debug text] -> Keep ordinary lines translucent and
  the midpoint label compact while preserving the debug panels above it.
- [Fractional midpoint values can be noisy] -> Format midpoint coordinates
  consistently and use exact half-resolution placement.
- [Canvas presentation and resolution can update in one event] -> Update both
  through the existing ordered resize handler before layout inspection.

## Migration Plan

Add the new class and input mapping without migrating stored debug
preferences. Rollback is additive: remove the grid wiring and restore the
original 6 and 7 mappings. No data or remote system changes are involved.
