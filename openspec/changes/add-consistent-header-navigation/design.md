## Context

The existing `ProductionHud` owns a fullscreen Babylon GUI texture and a
single upper-left stack. The new shell must coexist with its prompt,
inventory, virtual controller, safe-area layout, and WebGPU/WebGL startup.

## Goals / Non-Goals

**Goals:**

- Establish one reusable top-bar composition for all app states.
- Represent header items as title, value, and optional unit data.
- Make defaults explicit and keep header geometry stable as state changes.
- Preserve touch passthrough, safe-area handling, and resize recalculation.

**Non-Goals:**

- Implement real wallet authentication or payment transport.
- Add a UI framework or new dependency.
- Change the WebGPU-first renderer selection or gameplay controls.

## Decisions

- Use Babylon GUI controls in the existing fullscreen texture. This keeps
  ownership and disposal in the existing HUD and avoids a second DOM overlay.
- Add a small header-item model/helper with defaults for address, zero sats,
  and disconnected status. State setters update values in place rather than
  rebuilding the bar, so landing and gameplay share identical geometry.
- Use a horizontal header container with a flexible title region and bounded
  right-side item regions. At narrow portrait widths, values remain single
  line and item widths reduce predictably; overflow remains a dedicated
  touch target.
- Keep only the overflow control interactive. Header labels and values remain
  pointer-transparent so they do not interfere with movement or gameplay
  input.
- Reuse the existing safe-frame layout calculation and invoke it on every
  viewport resize. The header owns its controls and is disposed through the
  shared `AdvancedDynamicTexture`.
- Apply the existing production text-style system with a revised palette,
  spacing, and border treatment so the landing and gameplay views read as
  pages in one application.

## Risks / Trade-offs

- [Risk] Three right-side items can become crowded on narrow phones ->
  Mitigation: use compact values, optional units, bounded item widths, and
  verify portrait screenshots at the smallest supported viewport.
- [Risk] Existing source-oriented HUD tests may encode the old single-stack
  shape -> Mitigation: update focused tests alongside the new model and run
  the full TypeScript/Vitest checks.
- [Risk] Interactive overflow controls could consume gameplay input ->
  Mitigation: mark only the menu control hit-testable and verify touch input
  outside it reaches the game.
