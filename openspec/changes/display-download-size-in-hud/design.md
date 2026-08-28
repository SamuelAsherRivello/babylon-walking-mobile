## Context

See proposal.md - Why. The game already loads checked-in runtime metadata and
passes the resolved release version into the permanent Babylon GUI HUD. The
release workflow owns the final Vite artifact, while local development needs a
version-only display because no release build has calculated a size yet.

## Goals / Non-Goals

**Goals:**

- Keep version and size in one runtime metadata load and one HUD label.
- Define the size as the sum of the byte lengths of every file in the final
  published browser artifact.
- Keep the label single-line, non-interactive, and safe in desktop and
  portrait-mobile layouts.
- Preserve the existing WebGPU-first startup and WebGL fallback.

**Non-Goals:**

- Reporting compressed transfer size, server headers, or cache-dependent
  network usage.
- Measuring the source tree, node_modules, repository, or download time.
- Adding a runtime network request or a new dependency.

## Decisions

### Store size beside the release version

Extend the existing runtime environment JSON with a byte-count field. The
metadata loader validates it and returns a display-ready value or an empty
size label. The HUD receives the resolved label from bootstrap and does not read
files or perform its own fetch.

This is preferred over calculating size in the browser because a browser
cannot reliably enumerate the complete published artifact. It also keeps an
immutable release identifying itself consistently after later releases.

### Calculate the final artifact total in the release workflow

After Vite has produced the artifact, the workflow sums every packaged file,
including the metadata file, and writes the result into the packaged metadata.
The metadata field uses a fixed-width numeric placeholder so replacing it does
not change the artifact's byte total; the workflow then verifies the final
total and metadata value agree. The checked-in local metadata omits the size
until a release build calculates it, while invalid or absent metadata remains
supported.

This is preferred over gzip or brotli measurement because those values depend
on server configuration and are not the size of the immutable published file
set. It is also preferred over a runtime calculation because startup remains
offline-capable.

### Preserve the existing HUD layout path

The version-and-size label remains the first control in the existing upper-left
stack. It uses the existing smaller version typography, no wrapping, shared
safe-area padding, and the current resize/layout update path. Because it is
non-interactive, pointer and touch events continue to reach gameplay controls.
The shared Babylon GUI texture continues to own and dispose the control; no
new resource lifecycle is introduced.

## Risks / Trade-offs

- [The artifact total changes when metadata is rewritten] -> Use a fixed-width
  size field and verify the final packaged total against the stored value.
- [A local development size is not a release measurement] -> Treat local
  metadata as a fallback/demo value and document that release builds replace
  it with the calculated total.
- [The combined label is too wide on narrow screens] -> Keep it non-wrapping,
  retain the existing group width and safe-area layout, and verify a portrait
  browser viewport.
- [Workflow size calculation diverges from the hosted file set] -> Sum only
  the exact directory passed to the existing Pages packaging step.
