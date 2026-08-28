## Context

See `proposal.md` for motivation. GitHub Releases trigger the Pages build, and
the workflow already resolves `github.event.release.tag_name` before invoking
Vite. The browser application can load static files from Vite's public assets
and renders its permanent interface through one Babylon GUI `ProductionHud`.

The confirmed HUD layout supersedes both the main specification's split-corner
layout and the partially applied right-side version group. All permanent HUD
text and slots must form one ordered upper-left group without adding an HTML
overlay or an independent UI lifecycle.

## Goals / Non-Goals

**Goals:**

- Keep the GitHub Release tag as the only authored release-version value.
- Store that tag in a runtime environment file packaged with the release.
- Make the HUD version dependency explicit and easy to test.
- Keep the ordered HUD inside desktop and mobile safe-area bounds.
- Present the title and a combined padded level and score row exactly once.
- Place inventory slots directly below the combined row without a label.
- Retain one-line HUD text and non-blocking pointer and touch behavior.

**Non-Goals:**

- Query GitHub or another external service while the game is running.
- Make an older immutable build display the newest current release number.
- Derive release versions from package manifests or local Git commands.
- Add another UI framework, build tool, package, or persistent setting.

## Decisions

### Write the triggering release tag to a runtime environment file

The release workflow will validate the triggering tag as exactly three
numeric components prefixed with `v`, then write it to
`Babylon/public/environment.json` before tests and the existing build command.
Vite will copy that file into the release artifact unchanged. The workflow
will validate that the built file exists before packaging.

This uses the release event already responsible for selecting the source and
deployment path. It avoids a duplicated version in a package manifest. A
runtime GitHub request was rejected because it could fail offline and would
make an old immutable build misidentify itself after a newer release appears.
The checked-in file will initially contain the current GitHub Release,
`v0.05.1`, so ordinary local runs display the latest confirmed version until
the next release workflow updates the packaged copy.

### Use one explicit local fallback

Bootstrap code will fetch the runtime environment file once and use `V0.0.0`
only when the request, JSON parsing, or version validation fails. Resolution
will preserve the stored numeric components while normalizing the visible
prefix to uppercase `V`. Published builds rely on workflow validation so a
missing or malformed release tag fails before the game is packaged.

Fetching the latest GitHub release directly at runtime was rejected because
it would make startup network-dependent and could make an older immutable
build identify itself as a newer release.

### Pass the resolved version into the production HUD

Game bootstrap will await the runtime environment loader and pass the resolved
string to the `ProductionHud` constructor. The HUD will not fetch or parse the
file itself. This keeps the presentation object testable and separates runtime
metadata resolution from Babylon GUI ownership.

`ProductionHud` will own one left-aligned, top-aligned stack in this order:

1. The version at 24 design pixels.
2. The static `Babylon Walking` title at the existing title size.
3. One `Level: 001 Score: 000` row at the existing label size.
4. The inventory slot row.

The combined row will retain the current level identifier and score as HUD
state so either update can rebuild both values without splitting the row.
Existing level names supply their trailing numeric value, and both level and
score use the existing minimum-three-digit formatting behavior. Quest text and
the inventory text label are not created.

The stack and its text controls belong to the HUD's existing fullscreen
texture. Disposing `ProductionHud` disposes that texture and all child
controls, so the change needs no separate disposal path or event listener.

### Reuse safe-area layout and shared corner padding

The ordered group will use Babylon GUI left and top alignment. Each layout
update will offset it from the safe left and top edges by the existing shared
`UI_PADDING` value. It will derive those edges from the existing
`ProductionUiLayout` and will not introduce breakpoint-specific coordinates.

All text controls will be non-interactive and configured not to wrap. Pointer
and touch input therefore continue to reach gameplay controls. Viewport resize
and mobile visual-viewport changes use the existing HUD layout update path.
WebGPU and WebGL use the same Babylon GUI behavior, so rendering engine
selection is unaffected.

## Risks / Trade-offs

- [A release tag has the wrong shape] -> Tighten workflow validation to accept
  only `v<number>.<number>.<number>` before the build starts.
- [Release metadata is missing] -> Fail release packaging while retaining the
  explicit `V0.0.0` runtime fallback.
- [The combined row is too wide on a narrow viewport] -> Use the existing
  visible-width calculation and focused portrait browser verification to keep
  `Level: 001 Score: 000` on one line.
- [Level or score updates overwrite the other value] -> Retain both values as
  HUD state and cover independent level and score updates with focused tests.
- [Historical two-component releases exist] -> Keep their stored builds and
  routes immutable; enforce three components only for releases built after
  this change.

## Migration Plan

1. Add failing workflow, metadata, and HUD layout tests.
2. Add the runtime environment file and release-time rewrite.
3. Load the resolved version into the reordered upper-left production HUD.
4. Verify checked-in, fallback, and release-generated versions.
5. Publish the next three-component release through the existing workflow.

Rollback consists of reverting the runtime file, workflow rewrite, and HUD
controls in a later commit. Already published release assets remain immutable.
