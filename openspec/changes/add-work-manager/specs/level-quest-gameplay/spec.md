## MODIFIED Requirements

### Requirement: Apple collection quest

The active quest SHALL start one work item when the player crosses from
outside to inside the Apple zone. The work item SHALL advance only while the
player is actively inside the zone, SHALL take one second of active time to
complete, and SHALL award one apple only when it completes. Remaining inside
MUST NOT award more apples, and each completed work item after a later exit
and re-entry SHALL award one additional apple until the active level's target
of one, two, or three apples has been collected.

#### Scenario: Player enters the Apple zone
- **WHEN** the player crosses from outside to inside before the quest completes
- **THEN** Apple work starts or resumes at its retained progress
- **AND** no apple is added immediately

#### Scenario: Player remains inside the Apple zone
- **WHEN** the player remains inside across active updates for one second
- **THEN** exactly one apple is added when work reaches completion

#### Scenario: Player leaves while working
- **WHEN** the player exits before work completes
- **THEN** the current work progress is retained
- **AND** no apple is awarded

#### Scenario: Player re-enters while work is incomplete
- **WHEN** the player later re-enters the Apple zone
- **THEN** the retained work resumes
- **AND** exactly one apple is awarded when it completes

#### Scenario: Player re-enters the Apple zone
- **WHEN** the player exits the Apple zone and later enters it again before
  completing a multi-apple quest
- **THEN** exactly one additional apple is awarded when the resumed work
  completes

#### Scenario: Quest target is reached
- **WHEN** completed Apple work raises the count to the active target
- **THEN** the corresponding inventory slot displays an apple
- **AND** quest completion occurs exactly once
