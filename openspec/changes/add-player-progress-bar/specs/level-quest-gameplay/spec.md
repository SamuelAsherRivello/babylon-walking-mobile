## MODIFIED Requirements

### Requirement: Apple collection quest

The active quest SHALL start one-second Apple work when the player crosses
into the Apple zone. The player SHALL see the circular in-world progress meter
above the player while that work is active or paused. The work SHALL advance
only during active frames inside the zone, resume after re-entry, and award
one apple only at 100 percent. Existing one-, two-, and three-apple targets
and completion behavior SHALL remain unchanged.

#### Scenario: Apple work begins
- **WHEN** the player enters the Apple zone before the quest completes
- **THEN** the circular meter appears above the player at zero
- **AND** no apple is added immediately

#### Scenario: Apple work completes
- **WHEN** the player remains active in the zone for one second
- **THEN** the meter fills completely
- **AND** exactly one apple is added

#### Scenario: Apple work resumes
- **WHEN** the player leaves and later re-enters before completion
- **THEN** the meter resumes at the retained value
- **AND** one apple is added only when the meter reaches 100 percent

#### Scenario: Player enters the Apple zone
- **WHEN** the player crosses from outside to inside the Apple zone before
  the active quest completes
- **THEN** Apple work starts or resumes
- **AND** no apple is added immediately

#### Scenario: Player remains inside the Apple zone
- **WHEN** the player remains inside the Apple zone across repeated updates
- **THEN** no additional apple is awarded before the active work completes

#### Scenario: Player re-enters the Apple zone
- **WHEN** the player exits the Apple zone and later enters it again before
  completing a multi-apple quest
- **THEN** exactly one additional apple is awarded when resumed work completes

#### Scenario: Level target remains unchanged
- **WHEN** Level 1, Level 2, or Level 3 completes its required Apple work
- **THEN** completion occurs at one, two, or three apples respectively
