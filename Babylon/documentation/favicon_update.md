# Babylon Walking Mobile

This project uses the Babylon.js favicon for all supported app icons.

Babylon.js favicon source:
https://www.babylonjs.com/assets/favicon.ico

To update the favicon, the following steps were taken:

- Downloaded the Babylon.js `favicon.ico`.
- Generated browser, Apple touch, Android/PWA, and Windows tile PNGs from it.
- Added the icons to `index.html` and `public/manifest.webmanifest`.

If you need to update the favicon again, replace `favicon.ico` in the project
root and regenerate the PNG files in `public/icons` from the new source.
