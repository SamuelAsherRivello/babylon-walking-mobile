## Context

The canvas is a direct child of the document body. Both currently fill the
browser, while temporary debug overlays are positioned against the browser
viewport. Babylon listens for window resize events and calls `engine.resize()`.
See `proposal.md` for motivation and the portrait viewport spec for observable
behavior.

The implementation must preserve the project's 80-character line limit and
must not add dependencies for this layout-only change.

## Goals / Non-Goals

**Goals:**

- Express the portrait contract primarily through resilient page and canvas
  layout rules.
- Keep Babylon's backing render size synchronized with CSS size changes.
- Preserve the existing browser-anchored temporary debug overlays.
- Make centered cropping deterministic and prevent page scrolling.

**Non-Goals:**

- Retune the camera or rearrange scene content for portrait composition.
- Introduce gameplay HUD safe areas or mobile input controls.
- Change fullscreen targeting, rendering configuration, or dependencies.

## Decisions

### Anchor a non-shrinking canvas to the browser viewport

The root and document body will hide overflow. The canvas will be positioned
against the browser viewport at the 50% horizontal line, independent of other
body children. It will use the dynamic viewport height and a preferred 9:16
aspect ratio, with a `100vh` fallback for browsers that do not support dynamic
viewport units. The canvas must not shrink to fit the browser width.

This produces equal side backdrop on wide screens and equal left/right crop on
narrow screens without JavaScript width calculations. Body flex centering was
rejected because the development Inspector adds layout children that shift the
canvas. A fit-within-viewport layout was rejected because the user selected
full height over full visibility.

### Keep temporary overlays browser-anchored

The existing information and corner debug overlays will remain positioned
against the visible browser viewport. Moving them to the wider game frame would
allow narrow-screen cropping to hide development controls and diagnostics.

Gameplay UI will need an explicit safe-area design later rather than inheriting
this temporary debug behavior.

### Observe the rendered canvas size

A `ResizeObserver` will call the existing resize handler whenever CSS changes
the canvas dimensions. The window resize listener remains useful as a broad
browser fallback. Observing the actual rendered element covers dynamic viewport
height changes without duplicating the layout formula in TypeScript.

Relying only on the current window resize event was rejected because the source
of truth is the canvas's computed CSS size, especially while mobile browser
chrome changes.

### Combine contract tests with real-browser checks

A focused Vitest test will follow the repository's existing source-contract
test style and assert the essential layout and resize-observer declarations.
Real-browser verification will measure the canvas bounding rectangle in wide,
narrow, and resized viewports and confirm the absence of horizontal scrolling.

Adding a browser-test dependency was rejected for this first feature because
the project currently has none and the same checks can be performed with the
available browser tooling.

## Risks / Trade-offs

- [Portrait crop hides scene content at narrow ratios] -> Treat this as the
  selected behavior and address camera composition as a separate feature.
- [Older browsers do not support `dvh`] -> Declare `vh` immediately before the
  dynamic unit so unsupported browsers retain a full-height fallback.
- [CSS contract tests cannot prove geometry] -> Measure geometry in a real
  browser at representative wide and narrow viewport sizes.
- [Debug overlays differ from future gameplay UI] -> Keep their behavior
  explicit and defer gameplay safe areas rather than coupling the two.

## Migration Plan

1. Add a failing portrait viewport contract test.
2. Apply the body and canvas layout rules and canvas resize observation.
3. Run focused tests, type checking, and the production build.
4. Verify wide, narrow, resized, and fullscreen behavior in a real browser.

Rollback requires reverting the layout rules, observer, and focused test. No
stored data, public API, or dependency migration is involved.
