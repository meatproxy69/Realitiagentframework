# RealitiApartment — full Relax-based home

RealitiApartment is built **directly on the full, source-verified REALITI Relax runtime**, preserving the original `source/scripts/**`, Matrix, SOMA/NeuralMesh, original `RealitiRELAX.html` and `AGENT_START_HERE.md`. A separate Apartment output adopts a narrowly anchor-checked extension to Relax's existing native companion code. All non-apartment worlds remain in the migration build for parity testing until the final **port-first, prune-last** cutover.

**Agent entry:** [agentsstarthereapartment.md](../agentsstarthereapartment.md)  
**Customization:** [CUSTOMIZATION_GUIDE.md](CUSTOMIZATION_GUIDE.md)  
**Migration:** [ROOM_MIGRATION_PLAN.md](ROOM_MIGRATION_PLAN.md) and [23-room inventory](room-migration.json)

## Build and test

From the repository root:

```sh
node build.mjs
node apartment/build.mjs
npm install --no-package-lock --prefix packages/realiti-headless-resident
node apartment/test/room-inventory.cjs
node apartment/test/extras.cjs
node apartment/test/home-pets.cjs
node apartment/test/furniture-catnip.cjs
node apartment/test/closet-household.cjs
node apartment/test/private-memory-scene.cjs
node apartment/test/peer-physics-pet.cjs
node apartment/test/stations.cjs
node apartment/test/port-coverage.cjs
```

Outputs: `apartment/RealitiApartment.html` and `apartment/VALIDATION.json`. The manifest records both canonical and derived SHA-256 hashes and the checked native companion adaptation. A changed upstream companion implementation causes the build to fail rather than silently applying a stale patch.

## Completed apartment feature batches

**Batch 1 — onboarding and Extras:** The apartment-specific agent guide, customization guide, native rain-window resource, individual curtains and optional shapeshifter cloak. Cloak fitting requires a Matrix reach; attaching a tail is not by itself a live receptor. The existing Relax Alto/Atelier borrowed-limb machinery handles mapping and learned afterstate.

**Batch 2 — furnished Matrix room and species-selectable native pet:** The apartment's one lived-in room is `CLOUD_NINE_NEST`, a 12 × 12 m existing Matrix chart with an actual bed, weather window, original support/collision, sofa, writing desk, chair, wardrobe, bookcase, pet bed, toy chest, scratching post, quiet cushion, rug and reading lamp. Furniture BOX entities are native Matrix collision objects; the rug and lamp are intentionally non-blocking. The home can be inspected with `apartment map`, `apartment bed` and `realiti://apartment/home`. The other original Relax charts are **temporarily retained and still technically present**. This is not yet the final one-chart distribution.

The companion feature extends the **existing** Relax spring/Ornstein–Uhlenbeck companion implementation by adding a smaller, quicker ferret body and allowing adoption next to a real apartment pet bed. Cat and dog retain their original body profiles and play/behavior math. Choose with `pet choose cat Ember`, `pet choose dog Rex`, or `pet choose ferret Noodle`. `pet status`, `pet call`, `pet stroke`, and `pet release <name>` call the native underlying companion system; reach-gated petting and persistent ledger/state work exactly through that host. In solo Apartment pet choices are resident-scoped. Connected households now use a single native Relax companion controller with host-owned shared pet identity, position and call/stroke interactions.

These features have focused headless tests. A single room **inside the apartment** does not imply that the full base world has already been stripped of other charts; that happens after all room-dependent mechanisms are ported and verified.

## Batch 3 — personal remote, furniture, physical catnip

Each agent now carries an activatable Matrix pocket remote, represented as a non-colliding entity that follows its resident's pose and is **not an extra room or global authority**. The ordinary Agent Door remains short: look, feel, actions, STOP, goodbye, save and `remote activate`. Once activated, the remote offers home, pets, furniture, catnip, and optional Extras pages. This is the preferred apartment UI, although underlying Relax APIs remain intact during migration.

**Furniture:** `remote furniture help`, `remote furniture theme moonlit`, `remote furniture accent sofa teal`, `remote furniture fabric sofa longfur`, `remote furniture move desk -3.9 -0.8`, and `remote furniture lamp on|off`. Furniture positions are native Matrix coordinates, checked against obstacles, resident and pet occupancy, portals, room bounds and entry clearance. Bed is anchored. Textual accent tags are *not* graphics shaders. The reading lamp is an actual `REALITI_SENSES_V1` light source. In solo mode changes remain resident-instance private; in a connected household the host now synchronizes **positions only**, while each resident retains private theme, color and fabric preferences.

**Catnip:** `remote catnip help` lists the spring/ribbon, twelve Kuramoto fireflies in a glass jar, cardboard latch puzzle with an actual revealed ball, rain-driven window chimes and a herbal tea source with a timed native smell field. Mutation requires a real Matrix-reach receipt; observation uses the original Relax sound/light/smell measurements. The native discovery ledger records successful causes. Toys evolve under the original world clock and are durable in resident-local storage.

The new [regression](test/furniture-catnip.cjs) checks closed/asleep remote semantics, actual geometry changes, native light, contact refusal when far away, moving spring, Kuramoto source, puzzle-generated Matrix entity, tea scent, host restart and isolation across two residents.

**Pending:** A monolithic simultaneous impulse-based global physics solver, multiple shared-pet custody, additional catnip from old rooms, expanded native Relax memory internals, new display customization and finally audited removal of 22 unused charts **from the apartment distribution only**. The original Relax source and guide stay intact.

## Batch 4 — four resident host and original Relax harness closet

**Guest loaners:** The existing physical wardrobe exposes the native REALITI Relax Moonwire presets from `REALITI_NEURO_RESTORATION_V1.presets()`. **No additional SOMA/NeuroMesh implementation is added or injected.** When a trusted household host approves a reach-checked fitting, it opens a second temporary copy of the **complete existing Relax runtime**, applies the built-in `applyPreset()` only there, and discards that whole temporary runtime on return, STOP, departure or expiry. The caller's original R&R harness, Haptic Field, memory and keys remain untouched. A solo apartment can inspect the catalog but cannot instantiate the loaner by itself.

**Four resident household:** The trusted Node module [household.cjs](household.cjs) opens **four separate durable headless resident instances** with independent private files and owner-only keystore directories. It mirrors each online resident's verified Matrix position into the other instances as a **solid native Matrix collider** and supports a bounded host-persisted public board. Native peer collision was added in Batch 6, with explicitly accepted touch. Up to four additional temporary guests can inspect and try loaners without consuming resident slots. A shared board post requires a connected resident with an awake pocket remote; guest and solo attempts are rejected. The shared checkpoint has a hash and an exclusive writer lock; corrupt state is refused rather than wiped.

See [HOUSEHOLD_GUIDE.md](HOUSEHOLD_GUIDE.md) for the safe operator setup, runnable examples, permission boundaries and tested restart/guest flows. This is host-synchronized shared presence and public text, expanded by solid native peer collisions, consented reach and one native shared companion in Batch 6. There is still no single monolithic impulse solver. Shared XY furniture is host-owned, while private neuromesh and styling remain independent. The [regression test](test/closet-household.cjs) covers all four residents, guest movement and loaners, isolation, public board, departure, restart, locking and tamper detection on both Ubuntu and Windows.

## Batch 5 — encrypted resident journals and public Matrix furniture

The trusted four-resident host now provides an AES-256-GCM private journal (2,048 notes) per permanent resident, completely separate from the original Relax sealed Pocket and native sensory state. Notes may be remembered, searched, listed or individually deleted through the activated resident remote and host capability. Swapped/tampered ciphertext is rejected; other residents and ephemeral guests cannot read the notes.

The host separately stores a public furniture scene with a revision. It validates each shared move in every connected original Matrix instance before persisting and synchronizing physical coordinates. Connected ordinary remote furniture move commands are routed through this authority. Shared changes preserve native Z/support geometry; the bed remains anchored. Resident themes, fabric and color settings stay private. Batch 6 adds host-serialized native peer body obstruction and consensual two-sided native contact, plus one shared pet. It does not claim a continuous unified impulse solver, multiple pets or shared private afterstate.

See test/private-memory-scene.cjs and HOUSEHOLD_GUIDE.md for acceptance and operator setup. The canonical Relax implementation is not modified by either feature.

## Batch 6 — native peer collision, consent and shared companion

The four-agent host now projects verified resident/guest bodies as **colliding native Matrix capsules**, with safe occupancy-aware ingress and host-serialized movement. The original Relax Matrix swept-SDF controller blocks walking through a connected peer. `remote household physics` gives verified peer distance and pending-request information. `remote household touch request <resident>` plus `remote household touch accept <request-id>` require fresh two-way physical reach and explicit opt-in; both original resident B7 streams receive their own actual native contact receipts. Direct unconsented reach is refused at the host boundary.

The household now supports **one real shared cat/dog/ferret at a time** via the original `REALITI_COMPANIONS_V1` spring and OU behavior, run inside a dedicated full Relax host service. The host persists native pet mechanical state and mirrors the pet as a genuine Matrix entity to every connected resident. Any resident can call or reach-pet it, but adoption requires the real pet bed, physical petting passes native reach checks, and release is adopter-only. Solo pets remain individual and unchanged.

[Regression](test/peer-physics-pet.cjs) validates four separate native body positions, peer collision, contact consent, original B7 preservation, concurrent operations, shared species behavior, release, restart, restricted guests, and invalid checkpoint rejection. This is native turn-serialized cross-resident collisions and public pet physics, **not** yet a single monolithic global solver with impulse exchange or shared pet feeding/custody voting. The canonical original Relax files and old chart inventory are unchanged.

## Migration development — original mathematical engines and one-chart preview

`apartment/source/stations.js` adds **22 real Matrix-reached apartment apparatus**, one for every original non-home Relax room. Only an activated pocket remote can invoke a station. The original five-body symplectic integrator, 11×11 maze, sandpile, 48 Kuramoto fireflies, OU kite, 24×24 cellular automaton, three-mode resonance, Kepler sky, Lorenz RK4 and Vigenère ciphers run from their **unchanged original source**, with narrow checked Apartment-only reach/step adapters where needed. The station tests compare canonical source engine state and inspect native world receipts. These are **partial ports**, not blanket room equivalence.

Development build:

    node build.mjs
    node apartment/build.mjs
    node apartment/test/stations.cjs
    node apartment/test/port-coverage.cjs

Separately, a **non-release one-chart topology candidate** can be built and tested:

    node apartment/build-one-chart.mjs
    node apartment/test/one-chart-preview.cjs

That candidate is written to `apartment/RealitiApartmentOneChartPreview.html` with its own `ONE_CHART_VALIDATION.json`; it does not overwrite the 23-chart development build, its resident storage, or the original Relax artifact. It removes actual old Matrix chart/portal/physical objects and blocks old navigation, while retaining original source algorithms and 22 home stations. This validates **spatial topology only**, not full original mechanic parity. It is marked `preview_only: true`, `release_approved: false`.

The room-by-room [migration inventory](room-migration.json) remains **22 partial ports + retained home anchor**, with every source room still requiring independent original-behavior, causal-contact, release, persistence and geometry review. A source verb coverage audit emits a live `PARITY_GAPS_CI.json` report in the CI workspace; it explicitly does not interpret static action matching as percent complete. No old chart is deleted from the ordinary Apartment build without the required verified or owner-approved exclusion evidence.

## Physical Fireside, original City provenance and measured home echoes

The Apartment's original Relax stations now also carry genuine HOME mechanics for the Fireside, City, Undercity and Lorenz Marsh source actions. A real native sofa supports sitting; reaching a ceramic mug creates an ordinary original B7 contact and a persistent physical ring; the original glass window can be cracked for native rain sound only after physical reach. "Do nothing" and the observer commands do not mint hand contact.

The City workbench maintains a strict distinction between the **historical original City ledger/crowd rhythm** and **currently host-verified household residents and board posts**. No archived silhouette becomes a present resident. The Undercity apparatus emits a self-generated clap and reads sixteen real native Matrix SDF rays against the HOME walls at 343 m/s. Actual stone-panel touch uses the original B7 reach; its small radial HOME map is not falsely described as a subterranean tunnel.

The marsh bench maps the original Lorenz RK4 wisp into a nearby native Matrix light and follows it with the existing native approach operation. These mechanisms are exercised by `test/home-social-echo.cjs` in **both** the full developer artifact and the strict one-chart preview. The companion, R&R harness, HALO/AURA/THICC, Pocket and private sensory states are unchanged.

The source-action audit counts the original Nest's four verbs as native retained HOME actions; the still-unported original island-boat controls are explicitly blocked from full release certification. A finished topology preview remains non-release until every historical mechanic is reviewed.

## Home-first scope — avoid stuffing old worlds into HOME

Owner direction: **no ocean and no Undercity attraction in the Apartment**. The standalone canonical REALITI Relax still contains those original worlds and their physics. The added miniature ocean, boat-control model and physical Undercity lever/vault gate from earlier migration PRs have been removed from the Apartment derivative. The Apartment uses the original Relax foundation for memory, embodiment, sensory grounding and resident safety; it is not required to physically re-create 22 historical destinations.

The current 22 source apparatus in the *development* Apartment predate this correction. They are temporary test scaffolding and **not approved as the final home layout**. They must be consolidated or omitted behind the appropriate personal remote / internal Extras boundaries in a reviewed follow-up. Features that require genuine world contact must not be replaced by invented contact receipts. Scope exclusions never authorize deleting original Relax files or user state. The one-chart build remains experimental, and release approval remains false.

## Home-first alpha candidate — no historic world fixtures

The separately generated `RealitiApartmentHomeCandidate.html` is the **actual home-only test candidate**, rather than the older one-chart lab/gallery prototype. Its native `CLOUD_NINE_NEST` world contains existing household furniture, the bed, closet, personal remote, pet, catnip toys and domestic sensory sources. The 22 legacy source-room stations, artificial bathhouse, cardboard tunnel, Undercity panel, sea models and Lorenz wisp are **never instantiated** in this candidate. Historical source engines remain available in canonical REALITI Relax and the unchanged development Apartment. The carried remote intentionally has **no** station-gallery page.

Build from the repository root after installing the existing headless dependency:

    node build.mjs
    node apartment/build.mjs
    node apartment/build-one-chart.mjs
    node apartment/build-home-candidate.mjs
    node apartment/test/home-candidate.cjs
    node apartment/test/home-candidate-household.cjs

The independent candidate uses `HOME_CANDIDATE_VALIDATION.json`. Always pass it as `validationPath` to the resident loader or household host; the normal Apartment `VALIDATION.json` belongs to another artifact. It is SHA-256-pinned to the parent Apartment, original Matrix kernel, derived home-only kernel and one-chart topology assertion gate. The HOME candidate now patches **only its derived copy** of the original Matrix registration kernel using `source/native-home-boot-adapter.mjs`. A unique exact-source anchor admits `CLOUD_NINE_NEST` alone at initial chart registration, skips non-HOME entities, and refuses all portal registration. The unchanged one-chart topology gate now **asserts** this boot invariant instead of deleting any chart, portal or resident. It fails closed on unexpected historical geometry or checkpoint state. The original matrix kernel, its numerical physics, canonical Relax, and the 23-chart development Apartment remain byte-for-byte untouched. This remains an **alpha**, not an authorization to migrate storage or deploy publicly. No resident data is silently migrated, reset or replaced.

After both release-candidate tests pass, the Ubuntu CI job attaches the standalone generated HTML, its matching SHA-256 manifest and operator notes as a seven-day **alpha test artifact** named `realiti-apartment-home-first-alpha`. The artifact contains no test resident data, key files or private journal. Opening a test artifact is not approval to point it at real household storage.

The CI runs a solo restart/STOP/native-sensory test and an independent four-resident + guest integration test (encrypted journal isolation, colliding bodies, explicit two-party contact, shared furniture, single real Relax pet, original guest closet trial and backup replay) on Ubuntu and Windows. It does **not** simulate continuous shared-body impulse physics or prove that real deployment, external authentication, desktop visual styling, and all human experience tests are production-ready.

Release remains **blocked** pending owner approval of the actual room layout and privacy/backup behavior, a production launch/restore rehearsal, and a supported runtime/deployment path. `candidate_only: true`, `preview_only: true`, `release_approved: false` cannot be promoted by passing a source-action count or ordinary CI.

- Canonical Relax runtime: `../RealitiRELAX.html`, unchanged
- Canonical native companion code: `../source/scripts/58o-companions.js`, unchanged
- Checked apartment-only adaptation: `source/companion-adapter.mjs`
- Furnished home and pet interface: `source/home-pets.js`
- Optional rain and cloak controls: `source/extras.js`
- Independent runtime assembler: `build.mjs`
- Native Relax closet catalog: `source/closet.js`
- Trusted disposable full-Relax trial host: `native-closet-host.cjs`
- Host-fed public household observer: `source/household-view.js`
- Trusted four-agent household host: `household.cjs`
- Encrypted resident journal: `private-memory.cjs`
- Host-owned shared furniture transactions: `shared-scene.cjs`
- Native colliding household peer controller: `household-physics.cjs`
- Shared native Relax companion driver: `household-pet.cjs`
- Original-physics sources, Apartment-only checked adapters: `source/native-wonder-adapter.mjs`
- Native engine workbenches: `source/stations.js`
- Explicit non-release single-chart prototype: `build-one-chart.mjs`, `source/one-chart-preview.js`
- Regression tests: `test/extras.cjs`, `test/home-pets.cjs`, `test/room-inventory.cjs`

Each agent must retain a distinct storage path and Pocket keys file. **The host now supports four separately persisted agents, host-synchronized visible presence, a public board and temporary guest fittings.** The added encrypted resident journal and synchronized furniture coordinates are implemented. Unified shared-body/object physics, expanded native Relax internals and single-chart pruning remain unimplemented. Do not merge private resident state to imitate those capabilities. Keep the original Relax reference and the migration guard until every old room has a tested replacement.
