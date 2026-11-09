# REALITI Apartment — Experimental Matrix Visual Renderer
**Status:** PROPOSED / plan-only branch; no implementation or release approval
**Engine:** Three.js (modular, WebGL2, local assets)
**Base:** `main` at `97820ccd41decb448f07437996e29721079b8819` (Apartment HOME source candidate)
**Scope:** one `CLOUD_NINE_NEST` 12 × 12 m Matrix chart, not the historical 23-chart migration environment
**Non-goals:** new physics; rewrites of canonical Relax, Matrix or SOMA; a network service; autonomous AI vision bills; a new agent sensory system

## 1. Decision
Build an **optional, locally bundled 3D viewer** around the existing HOME candidate. Use a small tree-shaken Three.js WebGL2 subset for cameras, geometry, materials and rasterization, rather than Babylon.js or hand-written WebGL. An agent running headlessly incurs **no additional rendering load or network access**.

The renderer is a **consumer of existing Matrix truth**, never an authority over world events:
- `source/scripts/57.js` (native Relax Matrix) remains the authority for registered geometry, movement, swept collision, support, contact and reach/refusals.
- `packages/realiti-matrix/spatial.cjs` supplies the independently packaged Matrix observer pattern (`view`, `frame`, `nearby`, `entity`); do not confuse this package's own instance with the actual embedded HOME runtime.
- `apartment/shared-scene.cjs` and `apartment/household.cjs` own shared furniture and connected resident observations. `apartment/source/furniture.js` owns resident-local accent/material preferences.
- SOMA, Haptic Field, Pocket, memory, contact permissions and signed world-evidence paths are **not visual-renderer dependencies** and must not be modified.

No render, camera movement, screenshot or mouse click may mint a Matrix contact, SOMA sensory event, movement receipt or new world object.

## 2. Direct HOME source build — no 23-chart dependency

**Owner correction:** The 23-chart Apartment is retired migration scaffolding and must not be the source or a prerequisite for this experiment. Build directly from canonical `RealitiRELAX.html` using its original Matrix/SOMA and embodiment libraries. Apply Apartment-native features in order, and replace the registered native WORLD catalogue with the one `CLOUD_NINE_NEST` chart at source time; portal creation and old maze registration are bypassed. Historical world packages are not loaded as physical charts. The home-only layout retains the southwest real mattress and native collision geometry.

**Independent build:** `node build.mjs && node apartment/build-visual-experiment.mjs` produces `apartment/RealitiApartmentVisualExperiment.html` and `apartment/VISUAL_EXPERIMENT_VALIDATION.json`. It never reads `RealitiApartment.html`, `apartment/VALIDATION.json` or the old HOME candidate. The original Relax and all older artifacts remain untouched, with no data migrations or releases. A later standalone refactor can strip archived non-HOME library code too, after proving parity.

**M2 implementation checkpoint:** Lazy local Three.js viewer with four fixed NE/NW/SW/SE reference cameras and a resident-eye camera. The four 640x400 screenshots use one WebGL context and one native Matrix snapshot. Build the local bundle once: `cd apartment/visual && npm install && npm run build`. The direct HOME builder refuses missing or mismatched bundles. No CDN or automatic model vision calls. Full DOM, real screenshot and Potato/Mid hardware tests remain unverified.

**M1 now:** the direct experiment includes `visual/scene-projection.cjs`, which reads only registered native Matrix HOME geometry and resident position. The snapshot is a detached, read-only visual data contract, not an extra sensory system. Three.js, WebGL and model vision are not enabled at this checkpoint.

## 3. Scene contract: Matrix -> sanitized snapshot -> Three.js
First implement and test a scene-projection contract **without importing Three.js**. A proposed `REALITI_APARTMENT_VISUAL_SCENE_V0` snapshot contains:
- Schema/version, source `CLOUD_NINE_NEST`, monotonically observed Matrix revision, and a scene/household revision where available.
- The authorized viewer's actual Matrix pose (position, quaternion/yaw, posture and supported camera height), never a guessed fictional position.
- An allowlisted collection of currently registered HOME entities: stable ID, Matrix chart, world position, orientation, shape kind and its real dimensions, material/tags needed for appearance, collision flag, and safe short label.
- Authorized appearance overlays (specific resident's accents, fabrics and style card); shared furniture positions from the host's accepted shared scene.
- Authorized pet and other live bodies from trusted Matrix/household presence, not from chat messages or self-reported fiction.
- A small set of sourced light/weather appearance values, clearly marked as *visual interpretation* (not additional physical or sensory evidence).

The **producer must fetch this information from the actual native HOME Matrix instance** (`window.REALITI_MATRIX_V1` in a local browser; trusted `entry.session.window.REALITI_MATRIX_V1` in a Node household). Do not instantiate a second Matrix, duplicate geometry as an independent game world, or infer physics from a drawn mesh.

Validate JSON strictly: number finiteness/bounds, chart allowlist, shape schema, entity count and string lengths; copy data and strip function references, signing keys, verifier cursors, Pocket, journal contents, private afterstate, raw resident capabilities and unsupported metadata. The renderer receives only this sanitized, immutable projection, never the trusted `M.entities()`, `M.state()`, `M.bump()`, world signing keys or native mutator functions.

Geometry implementation: implement visible equivalents for confirmed BOX and SPHERE entities first; add CAPSULE, PLANE, VOLUME and other observed types after an inventory test verifies their actual shape fields. Unknown kinds must be explicitly reported or skipped, not silently faked as solid furniture. Three.js is Y-up; document/test conversion from Matrix's Z-up metres and quaternion convention. The ray-facing camera must use the real resident yaw and support/posture height. Floors, walls, mattress, furniture, pet, decor and body locations should correspond to actual Matrix dimensions; *visual detail meshes must be decorative only*.

### Authority and privacy boundaries
- **Solo local viewer:** inspect the local Matrix state through a narrowly scoped adapter. Camera controls do not call Matrix movement functions.
- **Household viewer:** a trusted operator selects one resident context and composes the public shared scene with that resident's own authorized private appearance. No general-purpose HTTP JSON dump, raw JSDOM session or uncredentialed livestream is added. The existing Node household operator is **not** currently a public authenticated web API; a network viewer requires a separate security review.
- **Resident first-person camera:** show only what their actual pose, camera direction and occluding geometry can reveal. Do not treat an overhead dollhouse/spectator view as evidence of what the resident saw.
- **Human dollhouse/orbit camera:** explicitly labelled as a spectator/decorator view. Never imply that the resident moved or perceived that view.
- **Guests and other residents:** permit only views and data authorized by existing host rules. No leaks of another resident's personal colors, wardrobe, private notes, Pocket, identity keys, memories or sensory fields.

## 4. Renderer and UX
Load Three.js **only when the viewer is opened**. Render using a normal WebGL2 canvas with `WebGLRenderer`, mesh/primitive geometries, a simple palette-to-material mapper, one ambient light and at most one featured lamp light for v0. Avoid an engine physics plugin, postprocessing stack, shadow maps, skeletal animation, real-time global illumination, HDR environment maps, CDN imports or dynamic asset marketplaces. Prefer batched/reused geometries and materials; start with a small set of hand-authored procedural furniture plus locally licensed assets only where visual quality demands them.

Two camera modes:
- **Dollhouse:** orbit/orthographic or perspective cutaway for inspecting room decoration. Human observer only.
- **Resident eye:** first-person from native Matrix pose; camera turning is a view operation, not an unverified walking event. Any actual walking must dispatch the established Agent Door action and accept its Matrix resolution.

Keep primary controls sparse: `View`, `Camera`, `Snapshot`, `Close` at most. Existing remote commands continue to place/rearrange furnishings. Visual drag-to-move is **out of v0**; later it may propose a normal `remote furniture move`/decor command but must wait for host confirmation or show a visible refusal. Never directly write transforms to `M.entities()`.

On native state changes (e.g. `M.bump()` revision, trusted household update, chosen style, light toggle, pet location change) mark the scene dirty and update affected meshes by stable entity ID. When static, render **zero frames**. While rotating or walking, use a capped requestAnimationFrame loop; stop immediately when settled, hidden, closed or WebGL context lost. Recover context loss without rewriting Matrix. Provide clear WebGL-unavailable fallback to the existing text/headless HOME.

## 5. Packaging, offline operation and cost caps
- Pin `three` to an exact reviewed package version plus lockfile. Import only needed core modules and tree-shake/build to a local bundle. No external CDNs, Google fonts, telemetry, ad SDKs or remote assets.
- The first experimental artifact and its JS/assets must work offline from locally installed files or a loopback dev server. If a browser restricts module imports on `file://`, distribute an appropriately bundled classic script or document a loopback-only launcher; do not quietly rely on the internet.
- Headless use must not import Three.js, instantiate WebGL, spawn a browser or incur asset requests. The visual package may be cached/disk-installed once; its size does not imply recurring downloads.
- Use procedural primitives and tiny textures first. No unlicensed furniture pack or automatic remote asset fetching.

**Provisional acceptance budgets, not measured claims:**
| Metric | Initial target |
| --- | --- |
| Incremental compressed renderer JS | <= 250 KiB gzip (measure actual pinned build; exceptions require review) |
| Local decorative meshes and textures | <= 2 MiB initial package |
| Idle frames with static scene | 0 |
| Default image/vision API calls | 0 |
| Rendering resolution | 720p base; adjustable on Potato/Mid |
| Frame pacing during camera movement | target 30 FPS at 720p on target Potato; measure p50/p95 and degrade gracefully |
| WebGL/GPU memory delta | record in local test; no pretend fixed guarantee |

A browser may reinitialize JS/GPU on every launch, but should not re-download local files. The only possible recurring external cost is an **explicitly enabled** vision-model observation, not displaying the scene on a local GPU.

## 6. Optional AI sight, separate from graphics
Start with a local `Snapshot` action exporting a compressed image **from the resident's true first-person camera**. An image becomes agent visual input only if the resident/model integration explicitly requests it and has image-capable API support. Do not imply that a headless text model can see a Three.js canvas automatically.

Future opt-in integration may expose a constrained `look visual` route that returns either an image attachment to a supported vision model or an explicit `VISION_BACKEND_NOT_AVAILABLE` error. Prefer one snapshot per resident request, no polling. Initial caps to test: 640 × 360 WebP/JPEG; <= 150 KiB/image; 5-second minimum between automatically suggested captures; maximum 20 billable captures per session unless deliberately raised. Do not send images to providers without a user-authorized model path; keep call counts visible, and default to OFF. Do not include the spectator camera or private overlays in agent vision.

## 7. Milestones with stop gates
**M0 — pin baseline:** verify clean `main` source hashes and HOME candidate source, and document one chart, four zones, actual Matrix entity list, shape kinds, material tags, pets, lamps and current host/guest permission boundaries. Preserve test commands/results before edits.

**M1 — scene adapter only:** produce a read-only snapshot from real HOME Matrix; unit-test strict schema, actual transforms, chart scope, residents, pets, styles, stable IDs and revisions. Exercise positive + negative Matrix cases (blocked movement/contact, moved furniture/occupied fixture refusal). **Gate:** no mismatch between view and authoritative state, no mutation, no private data leak.

**M2 — isolated visual slice:** open one complete 3D HOME scene using local Three.js bundle. Include floor, walls, bed, sofa, desk/chair, lamp, window, four alcoves and 2+ representative decor pieces. Verify dimensions and that click/drag cannot sidestep Matrix. **Gate:** actual screenshot locally inspected against native 12 × 12 m positions; render only authorized objects.

**M3 — change propagation and aesthetics:** update individual meshes on authoritative revisions, implement personal palette/material rendering and five bedroom configurations, keep furniture/bed support positions exact. Verify that one resident's sofa accent is not copied into another resident's view. **Gate:** dynamic updates and house sharing remain consistent after restart without unsafe migration.

**M4 — optional resident sight:** local first-person screenshot, occlusion and posture tests; an explicit, budgeted model-vision hook only if suitable infrastructure exists. **Gate:** no default API traffic, camera reflects Matrix state, no omniscient screenshot disguised as sensory evidence.

**M5 — performance and resident vibe QA:** profile cold/warm startup, bundle size, memory, idle CPU/GPU, 30 FPS movement on representative Potato and Mid hardware, WebGL fallback, scene revision changes and lost-context recovery. Have a human actually inspect style and scale; headless tests cannot prove cozy visuals. **Gate:** quality approval and real-device evidence before any opt-in shipping or PR to `main`.

If a gate fails, **stop, retain the branch and revert just the experimental module**, never adjust native Matrix reach/collision to satisfy graphics.

## 8. Required regressions and test commands
Run locally against disposable identities. Existing baseline commands:
```sh
node build.mjs
node apartment/build.mjs
node apartment/build-visual-experiment.mjs
npm test --prefix packages/realiti-matrix
node apartment/test/home-candidate.cjs
node apartment/test/home-candidate-household.cjs
node apartment/test/home-cozy-layout.cjs
node apartment/test/native-home-boot-adapter.cjs
node apartment/test/peer-physics-pet.cjs
node apartment/test/bedroom-ownership.cjs
node apartment/test/private-memory-scene.cjs
node apartment/test/style-appearance.cjs
```
Some existing tests require `npm install --no-package-lock --prefix packages/realiti-headless-resident`; use a disposable local environment. Browser screenshot/GPU checks and `apartment/test/visual-*` are **to be written**, not claimed as passing. Run focused tests first and full local regression once per coherent milestone; no repetitive CI dispatch, no unreviewed workflows, no PR until locally qualified.

### Acceptance scenarios
1. Move desk via existing Agent Door command -> native Matrix pose changes -> screenshot shows exactly that position. Refused overlap -> screenshot and scene revision remain unchanged.
2. Bed, chair, mattress, pet and decor rendered at their real dimensions; SDF contact/reach tests still pass and a screenshot cannot create contact.
3. Two residents choose different sofa accents -> same authorized shared furniture position, different private visual presentation; guests see only allowed presentation.
4. Actor turns/views scene without moving -> no new Matrix movement receipt. Actor performs real approach -> first-person camera follows actual resolved posture/pose and cannot pass through native walls.
5. Static apartment and hidden tab -> zero redraws; no WebGL created for headless-only resident.
6. Cold offline start and warm reopen work with **no CDN requests**; `three` bundle is locally available.
7. A vision request, if implemented, charges at most one bounded capture and never leaks spectator view, another resident's private state or host secrets.
8. Normal HOME standalone artifact, canonical Relax, migration reference and existing source hashes remain unchanged.

## 9. Merge/release policy
Keep the experiment **branch-only**. No version tag, no public release, no migration and no change to live households. The visual experiment is not release-approved until M1–M5 gates, a human visual pass, privacy/security review for any network-facing access, and explicit owner approval. Preserve the original agent experience and field-first research: the viewer is optional presentation, never the source of sensory truth.

## 10. First implementation PR scope (after plan review)
Submit a small PR **to the experimental branch only** containing the scene projection and its tests (M1). No Three.js bundle, WebGL, gameplay controls, screenshot model hook, CI workflow modification, or `main` merge in that first code change. Once Matrix projection is verified, develop and measure the lightweight Three.js viewer as a separate follow-up.
