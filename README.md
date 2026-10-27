# PXL Dub Web

Play and download: https://tomislavrupic.github.io/pxl-dub/

GitHub Pages publishes `dist/` from `main` after the engine, worklet and patch tests pass. The workflow can also be run manually from Actions.

The playable2126 instrument and native plugin landing/download page. Browser-local synthesis uses the exact PXL Dub engine in an AudioWorklet/WebAssembly module; no server audio, accounts or synth runtime dependencies are needed.

Serve `dist/` over localhost/HTTPS, for example `npm run dev`, then open http://localhost:4173. Click Start audio. `npm test` checks native/Wasm PCM parity, rate adaptation and patch handling. `tests/browser-check.js` is a Playwright-page function for GUI checks. Standalone rebuilding: set WASI_SDK_PATH to the official WASI SDK34 installation and run tools/build-engine.sh.

Play/Voices/Chords/Drums/Perform retain the original editing functions. Six individual duck amounts range0–100% of master depth; defaults100. Local Save and JSON import/export include generated loops. Browser transport is independent of a DAW. Native download is Apple Silicon/macOS12+ AU/VST3, Developer ID signed and Apple notarized.

Engine source is in engine/. All applicable licenses/notices remain included. The downloadable corresponding source also contains the native project and required JUCE modules/build helpers. Download archive creation: python3 tools/make-downloads.py --native /path/to/PXLDub.

## Notarized Mac plugin release — 27 October 2026

AU/VST3 download: https://github.com/tomislavrupic/pxl-dub/releases/download/notarized-2026-10-27/PXL-Dub-0.4.0-macOS-arm64-Notarized-2026-10-27.zip

This release contains the signed, Apple-notarized plugin bundles with stapled tickets. Standalone apps are not part of this Mac plugin ZIP. Save your session, back up previous copies, install whole bundles and restart/rescan your DAW. Existing Windows downloads and artwork remain available.
