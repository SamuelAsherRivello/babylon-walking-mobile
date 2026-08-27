# Project AI Instructions

- Keep AI-generated code at 80 characters per line or less.
- Apply the same 80-character limit when updating existing authored files.
- Exclude generated files from manual wrapping unless explicitly requested.
- HUD panel text must not line wrap; ideally, each panel fits on one line.

## Local PC and Mobile Runs

- Start the project with `npm start` from `Babylon` using Vite hot reload.
- Read Vite's startup output. Use its `Local` URL on the PC and its `Wi-Fi`
  `Network` URL on a phone connected to the same Wi-Fi network.
- Do not hard-code a Wi-Fi IP in project files or documentation. It may change.
- Keep the Vite server on HTTP. Do not add HTTPS certificates, a certificate
  server, or phone certificate-installation steps for normal mobile testing.
- For Android Chrome WebGPU testing, the user may manually add Vite's exact
  current Wi-Fi origin to Chrome's `Insecure origins treated as secure` flag.
- Before claiming a mobile URL works, verify that Vite lists it and that the
  server is listening on `0.0.0.0`.
