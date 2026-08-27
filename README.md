# Babylon Walking Mobile

This repo is a starting point for Babylon.js projects using TypeScript.
It includes physics, post-processing, tests, and a modular structure.

<figure>
  <img
    alt="screenshot"
    src="./Babylon/documentation/images/Screenshot01.png"
    width="600"
  >
  <figcaption>
    Image 1 - Babylon.js Game Engine - HTML5 + WebGPU
  </figcaption>
</figure>

## Live Demo

https://samuelasherrivello.github.io/babylon-walking-mobile/latest/

The browser build is exported and hosted when a GitHub Release is
published. Versioned releases live under `/releases/<version>/`, and
`/latest/` points to the newest published release.

## Table of Contents

1. [Live Demo](#live-demo)
2. [Getting Started](#getting-started)
3. [Release Deployment](#release-deployment)
4. [Project Overview](#project-overview)
5. [Project Details](#project-details)
6. [Resources](#resources)
7. [Credits](#credits)
8. [OpenSpec](#openspec)

## Getting Started

### Play Project

1. Clone or download this repo.
2. Open the `Babylon` folder in a command line.
3. Run `npm install` to download and install dependencies.
4. Run `npm run build` to build the project.
5. Run `npm start` to launch a local development server.

### More Commands

- `npm install`: Download and install dependencies.
- `npm run build`: Build the app.
- `npm start`: Run the app locally with hot reload.
- `npm run check`: Check TypeScript.
- `npm run run_unit_tests`: Run unit tests.

## OpenSpec

[OpenSpec](https://openspec.dev/) keeps feature intent, implementation, and
current specifications aligned.

| # | Name | Command | Comment |
| --- | --- | --- | --- |
| 1 | Explore | `/opsx:explore` | Optional feature discovery and planning. |
| 2 | Propose | `/opsx:propose <name>` | Creates one focused feature change. |
| 3 | Apply | `/opsx:apply <name>` | Implements the change and completes its tasks. |
| 4 | Sync | `/opsx:sync <name>` | Updates main specs without archiving the change. |
| 5 | Archive | `/opsx:archive <name>` | Finalizes specs and archives the completed change. |

## Release Deployment

GitHub Releases are the publishing boundary. Normal commits do not deploy
the project.

Before the first release, open `Settings > Pages` on GitHub and set the
source to `GitHub Actions`. Then publish a GitHub Release whose tag looks
like `v0.01` or `v1.2.3`.

The `ReleaseWebBuildToGithubPages` workflow performs these steps:

1. Checks out the released tag.
2. Installs dependencies from `Babylon/package-lock.json`.
3. Runs the TypeScript check and unit tests.
4. Builds the Vite app from the `Babylon` folder.
5. Attaches `babylon-web-build.zip` to the GitHub Release.
6. Publishes every stored release build to GitHub Pages.

| URL | Purpose |
| --- | ------- |
| `/latest/` | Redirects to the newest published release. |
| `/releases/v0.01/` | Plays one immutable versioned build. |

Each release asset is the source for its versioned Pages folder. When a
new release is published, the workflow reconstructs the Pages site from
all release assets and updates only the `/latest/` redirect.

## Project Overview

This repo demonstrates browser-based game development with Babylon.js,
TypeScript, and modular architecture. It includes physics integration,
post-processing, and input handling.

Use cases include prototypes, educational projects, and browser games.

### Documentation

- `README.md`: Primary documentation for this repo.

### Configuration

- `Game Engine`: Babylon.js powers the 3D graphics and gameplay systems.

### Structure

- `Babylon`: Main project folder.
- `.github/workflows`: Release-triggered GitHub Pages publishing.
- `Babylon/public/assets/glb/`: GLB assets.
- `Babylon/public/index.html`: Entry HTML page.
- `Babylon/src/client/styles/`: CSS styling.
- `Babylon/src/client/scripts/`: Client TypeScript logic.
- `Babylon/src/client/scripts/index.ts`: Main game setup.
- `Babylon/src/tests/client/`: Unit tests.

### Dependencies

- `Babylon/package.json`: Lists dependencies and scripts.

## Project Details

### Editor Tooling

- Visual Studio Code: Source code editor.
- ESLint extension: Linting support for JavaScript and TypeScript.
- Error Lens extension: In-editor error and warning highlights.
- Babylon.js Inspector: Runtime scene inspection.

### Code Packages

- `@babylonjs/core`: Babylon.js core 3D engine.
- `@babylonjs/loaders`: Babylon.js asset loaders.
- `vite`: JavaScript bundling and local dev server.
- `typescript`: TypeScript compiler.
- `eslint`: Linting for TypeScript.
- `vitest`: Unit testing for TypeScript.

## Resources

- [Babylon.js Documentation](https://doc.babylonjs.com/)
- [Babylon.js Playground](https://playground.babylonjs.com/)
- [Babylon.js Inspector](
  https://doc.babylonjs.com/toolsAndResources/inspector
  )
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## Credits

### Created By

- Samuel Asher Rivello
- Over 25 years of game development experience as of 2026

### Contact

- Twitter: <https://twitter.com/srivello/>
- Git: <https://github.com/SamuelAsherRivello/>
- Resume and portfolio: <http://www.SamuelAsherRivello.com>
- LinkedIn: <https://Linkedin.com/in/SamuelAsherRivello>

### License

Provided as-is under the MIT License.
Copyright © 2026 Rivello Multimedia Consulting, LLC.
