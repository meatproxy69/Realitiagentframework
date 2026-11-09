# Local prebuilt Three.js renderer

The experimental branch **includes** `visual/dist/viewer.js` (Three.js **r187 / npm 0.187.0**, MIT licensed), so running REALITI HOME **does not require npm, an online CDN, or a network connection**. This is a prebuilt, self-contained classic browser script: no module-import/CORS issue on `file://`.

Build the canonical Relax HTML if necessary, then the direct HOME experiment:

```bash
node build.mjs
node apartment/build-visual-experiment.mjs
node apartment/test/visual-prebuilt.cjs
node --test apartment/test/visual-projection.cjs apartment/test/visual-home-world.cjs apartment/test/visual-reference-cameras.cjs
```

Open `apartment/RealitiApartmentVisualExperiment.html` and click **View HOME · 3D**. Use NE/NW/SW/SE or **4 reference views**. The graphics do not alter Matrix state and are not an AI vision service.

The vendored bundle is **2,130,000 bytes uncompressed**, with SHA-256 `0de90c5c5faef2024d2b7fd1eb725711ddee8496842facf3bbb9b0ccec0f8c54`. It is intentionally larger than the planned optimized 250-KiB gzip target; that performance/size target remains unqualified. `npm install && npm run build` in this directory is **optional developer rebuild work** to produce a smaller tree-shaken variant, not required to play. If rebuilding, regenerate the manifest and rerun integrity tests.

Upstream Three.js code is pinned to tag `r187` at the core/WebGL Git blob hashes listed in `dist/manifest.json`. Upstream MIT license is in `dist/THREE_LICENSE.txt`. Historical 23-chart Apartment artifacts are not dependencies. Nothing is published or merged into `main`.
