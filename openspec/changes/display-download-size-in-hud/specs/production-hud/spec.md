## ADDED Requirements

### Requirement: Release download size label

The production HUD SHALL display the total byte size of the published game
artifact beside the normalized release version. It SHALL format the size in
megabytes to one decimal place and append `Mb`, producing text such as
`v0.0.0 100.0Mb` on one line.

#### Scenario: Valid release metadata

- **WHEN** the game loads valid release-version and artifact-size metadata
- **THEN** the upper-left HUD displays the version followed by a space and
  the formatted megabyte size
- **AND** the version and size remain on one line

#### Scenario: Small artifact

- **WHEN** the artifact size is less than one megabyte
- **THEN** the HUD displays the correctly rounded one-decimal megabyte value
  with the `Mb` suffix

#### Scenario: Missing or malformed size metadata

- **WHEN** the runtime metadata does not contain a valid non-negative size
- **THEN** the game displays the version without a size label
- **AND** startup and the existing version fallback continue to work

### Requirement: Published artifact size accuracy

The release process SHALL calculate the displayed size from the complete final
browser download artifact, including JavaScript, styles, static assets, and
runtime metadata, and SHALL package that value with the same artifact.

#### Scenario: Release build completes

- **WHEN** the release workflow produces the browser artifact
- **THEN** the packaged metadata contains the total size of all packaged files
  in bytes
- **AND** the HUD value corresponds to that packaged total when the release is
  opened in a browser
