## Purpose

Provide configurable low-volume scene music and immediate sound feedback for
mouse interaction while respecting browser media playback restrictions.

## ADDED Requirements

### Requirement: Configurable scene background music

The application SHALL keep background music disabled by default. When music
is enabled, the application SHALL attempt to play `invincible.ogg` when the
scene starts, SHALL set its volume to `0.15`, and SHALL loop it continuously.

#### Scenario: Music is temporarily disabled

- **WHEN** the scene starts with background music disabled
- **THEN** the application does not request or play `invincible.ogg`

#### Scenario: Enabled startup playback is allowed

- **WHEN** music is enabled and the browser permits media playback
- **THEN** `invincible.ogg` plays at volume `0.15` and loops continuously

#### Scenario: Enabled startup playback is blocked

- **WHEN** enabled startup playback is rejected by the autoplay policy
- **THEN** the application remains usable and retries the music after the
  first canvas click

### Requirement: Canvas click sound effect

The application SHALL play `rotate.wav` at volume `0.35` for every mouse
click on the application canvas.

#### Scenario: User clicks the canvas

- **WHEN** the user clicks anywhere on the application canvas
- **THEN** a new instance of `rotate.wav` plays at volume `0.35`

#### Scenario: User clicks repeatedly

- **WHEN** the user clicks again before an earlier click sound has ended
- **THEN** the new click sound plays without stopping the earlier sound

### Requirement: Playback failures are non-blocking

The application SHALL handle rejected music or sound-effect playback without
stopping scene setup, input handling, or rendering.

#### Scenario: Audio playback fails

- **WHEN** the browser rejects an audio playback request
- **THEN** the scene continues running and the failure is reported for
  diagnostics
