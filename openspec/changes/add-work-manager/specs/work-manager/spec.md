## Purpose

Provide reusable in-memory timed work state that can pause and resume as a
gameplay condition changes, without persistence or coupling to presentation.

## ADDED Requirements

### Requirement: In-memory work lifecycle

The system SHALL create or retrieve work by a stable identifier, retain its
progress only in memory, and expose its current value and completion state.

#### Scenario: Work starts
- **WHEN** a new work identifier is started with a start value and end value
- **THEN** its progress begins at the configured start value
- **AND** the work is incomplete

#### Scenario: Work resumes
- **WHEN** existing incomplete work is started again
- **THEN** its prior progress is retained
- **AND** progress does not reset to the start value

#### Scenario: Work completes
- **WHEN** active work reaches its end value
- **THEN** its value is clamped to the end value
- **AND** it reports completion exactly once

### Requirement: Active-time progression

The system SHALL advance work only when the caller marks it active, using
frame delta time and the work item's configured rate or duration.

#### Scenario: Active frame advances work
- **WHEN** incomplete work is active for a frame
- **THEN** its progress increases by the configured frame contribution

#### Scenario: Inactive frame pauses work
- **WHEN** incomplete work is inactive for a frame
- **THEN** its progress remains unchanged

#### Scenario: Apple work duration
- **WHEN** Apple work is active continuously for one second
- **THEN** it reaches 100 percent and produces one completion event

### Requirement: Memory-only state

The system SHALL retain work state only for the lifetime of the running
application and SHALL NOT write work progress to disk, browser storage, or a
remote service.

#### Scenario: Application restarts
- **WHEN** the browser application starts a new runtime
- **THEN** no prior work progress is available
