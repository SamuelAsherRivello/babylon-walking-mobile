# Babylon Walking Mobile

This demo project uses Babylon.js for a simple walking game that works with
WebGPU on PC and Mobile.

<figure>
  <img
    alt="screenshot"
    src="./Babylon/documentation/images/Screenshot01.png"
    width="600px"
  >
  <figcaption>
    Image 1 - Babylon.js Game Engine - HTML5 + WebGPU
  </figcaption>
</figure>

## Live Demo

https://samuelasherrivello.github.io/babylon-walking-mobile/latest/

WebGPU not working? See [Troubleshooting](#troubleshooting).

## Table of Contents

1. [Live Demo](#live-demo)
2. [Getting Started](#getting-started)
3. [Project Overview](#project-overview)
4. [Project Details](#project-details)
5. [Troubleshooting](#troubleshooting)
6. [Resources](#resources)
7. [Credits](#credits)

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

## Project Overview

This repo demonstrates browser-based game development with Babylon.js,
TypeScript, and WebGPU.

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

### OpenSpec

[OpenSpec](https://openspec.dev/) keeps feature intent, implementation, and
current specifications aligned.

| # | Name | Command | Comment |
| --- | --- | --- | --- |
| 1 | Explore | `/opsx:explore` | Optional feature discovery and planning. |
| 2 | Propose | `/opsx:propose <name>` | Creates one focused feature change. |
| 3 | Apply | `/opsx:apply <name>` | Implements the change and completes its tasks. |
| 4 | Sync | `/opsx:sync <name>` | Updates main specs without archiving the change. |
| 5 | Archive | `/opsx:archive <name>` | Finalizes specs and archives the completed change. |

## Troubleshooting

### WebGPU not working?

First, open the [official WebGPU Samples hello-triangle
test](https://webgpu.github.io/webgpu-samples/?sample=helloTriangle). If that
does not render, the browser or device cannot currently run this project's
WebGPU path.

For Chrome-specific troubleshooting, see the official [WebGPU
documentation](https://developer.chrome.com/docs/web-platform/webgpu/). It
covers browser requirements, secure origins, graphics acceleration,
`chrome://gpu`, and the `enable-unsafe-webgpu` development flag.

Third-party references:

- [WebGPU Report](https://webgpureport.org/) shows the detected adapter,
  limits, and features.
- [WebGPU Fundamentals](https://webgpufundamentals.org/) explains compatibility
  mode and its experimental Chrome flag.
- [WebGPU Check](https://webgpucheck.com/) provides browser-specific enablement
  guidance and diagnostics.
- [Can I use: WebGPU](https://caniuse.com/webgpu) tracks current browser
  support, including mobile browsers.

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
