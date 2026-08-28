## Context

The controller currently awards apples directly from the Apple-zone entry
observable. See proposal.md - Why. The new state must be independent of the
zone event and must receive frame time from the existing game update loop.

## Goals / Non-Goals

**Goals:**

- Provide a small typed model for identified work items.
- Make active-time progression deterministic and unit-testable.
- Preserve incomplete work across zone exits and re-entries in one runtime.
- Keep quest/inventory updates at the gameplay integration boundary.

**Non-Goals:**

- Persistence, networking, serialization, or cross-tab synchronization.
- Rendering progress or knowing about Babylon scene objects.

## Decisions

- Use a manager-owned map keyed by stable work identifiers. This supports
  multiple future work actions without coupling them to zones. A single
  mutable singleton was rejected because it would make tests and ownership
  unclear.
- Advance with bounded delta seconds and a configured duration/rate. This
  keeps behavior independent of frame rate; a timer callback was rejected
  because it would drift from gameplay updates and complicate pause behavior.
- Emit a completion result from update rather than awarding inventory inside
  the manager. This keeps the manager reusable and makes quest side effects
  explicit in the controller.
- Clear completed work only after the integration consumes its completion
  result, preventing duplicate awards while permitting later work instances.

## Risks / Trade-offs

- [Large frame delta] A stalled tab could complete work in one update.
  Mitigation: clamp delta to a safe maximum while retaining total active time.
- [Identifier reuse] An incorrect identifier could share unrelated progress.
  Mitigation: define identifiers at the use-case boundary and test them.
- [Runtime-only state] Reloading loses progress by design. Mitigation: keep
  the no-persistence contract explicit and test application initialization.

## Migration Plan

Replace the direct Apple-zone award with work start/resume and per-frame
update. Rollback is removing that integration and restoring the direct award;
no stored data or schema migration is involved.
