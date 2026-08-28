## 2026-08-27 - Browser testing

Type: Convention
Scope: workflow
Note: Open browser tests only in external Microsoft Edge. Do not open the
Codex in-app browser.
Source: user

## 2026-08-27 - GitHub Pages releases

Type: Convention
Scope: workflow
Note: Publish Pages with GitHub Actions. The `github-pages` environment allows
`v*` tags so release-triggered workflows can deploy versioned builds.
Source: observed and verified release workflow

## 2026-08-28 - Release version environment

Type: Convention
Scope: workflow
Note: Before committing and publishing a release, update
`Babylon/public/environment.json` to the exact new three-component release tag.
Keep the checked-in version, GitHub tag, release notes, and published HUD value
aligned.
Source: user
