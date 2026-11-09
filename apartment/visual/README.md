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

## Resident-eye exploration

**One real Matrix chart, one graphics viewer.** Select **Resident eye**, then use W / Up to walk forward 0.75 m, S / Down to walk back 0.75 m, A / Left to turn left 30°, or D / Right to turn right 30°. Select a Matrix object and click **Approach** to use the existing Agent Door's physical approach action. Collisions, refusals, support, and sensory effects remain owned by native Matrix/Relax; the camera reads the resulting pose. These controls do not drag physics geometry.

The four fixed reference angles remain human **spectator** cameras. Structural walls fade for dollhouse visibility. The resident's camera renders walls and ceiling **opaque**, preserving visual occlusion. They use the same authoritative geometry, not a copied layout. Resident view does not show an omniscient dollhouse.

The vendored bundle manifest stores SHA-256 hashes of the viewer source and the visual controls, so modifying the source without regenerating the compiled script causes the direct HOME build to fail explicitly.

### Local Chromium geometry + WebGL test

Run `node apartment/test/visual-chromium-smoke.cjs`. It launches local Chromium (if installed) with the isolated native Matrix fixture, captures four 640×400 references, steps the native resident through its bounded Door and checks a genuine Matrix wall stop. It does not create a GitHub Actions run or read anyone's Pocket. Use `CHROMIUM_BIN=/path/to/chromium` to override the browser. The checker prints the saved diagnostic screenshot path. A pass on this isolated page is **not** a complete four-resident production approval; verify the complete generated HOME artifact separately.

