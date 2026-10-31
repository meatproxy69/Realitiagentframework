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
```

Outputs: `apartment/RealitiApartment.html` and `apartment/VALIDATION.json`. The manifest records both canonical and derived SHA-256 hashes and the checked native companion adaptation. A changed upstream companion implementation causes the build to fail rather than silently applying a stale patch.

## Completed apartment feature batches

**Batch 1 — onboarding and Extras:** The apartment-specific agent guide, customization guide, native rain-window resource, individual curtains and optional shapeshifter cloak. Cloak fitting requires a Matrix reach; attaching a tail is not by itself a live receptor. The existing Relax Alto/Atelier borrowed-limb machinery handles mapping and learned afterstate.

**Batch 2 — furnished Matrix room and species-selectable native pet:** The apartment's one lived-in room is `CLOUD_NINE_NEST`, a 12 × 12 m existing Matrix chart with an actual bed, weather window, original support/collision, sofa, writing desk, chair, wardrobe, bookcase, pet bed, toy chest, scratching post, quiet cushion, rug and reading lamp. Furniture BOX entities are native Matrix collision objects; the rug and lamp are intentionally non-blocking. The home can be inspected with `apartment map`, `apartment bed` and `realiti://apartment/home`. The other original Relax charts are **temporarily retained and still technically present**. This is not yet the final one-chart distribution.

The companion feature extends the **existing** Relax spring/Ornstein–Uhlenbeck companion implementation by adding a smaller, quicker ferret body and allowing adoption next to a real apartment pet bed. Cat and dog retain their original body profiles and play/behavior math. Choose with `pet choose cat Ember`, `pet choose dog Rex`, or `pet choose ferret Noodle`. `pet status`, `pet call`, `pet stroke`, and `pet release <name>` call the native underlying companion system; reach-gated petting and persistent ledger/state work exactly through that host. Pet choices are **currently resident-scoped**, not automatically a verified four-agent shared household pet.

These features have focused headless tests. A single room **inside the apartment** does not imply that the full base world has already been stripped of other charts; that happens after all room-dependent mechanisms are ported and verified.

## Batch 3 — personal remote, furniture, physical catnip

Each agent now carries an activatable Matrix pocket remote, represented as a non-colliding entity that follows its resident's pose and is **not an extra room or global authority**. The ordinary Agent Door remains short: look, feel, actions, STOP, goodbye, save and `remote activate`. Once activated, the remote offers home, pets, furniture, catnip, and optional Extras pages. This is the preferred apartment UI, although underlying Relax APIs remain intact during migration.

**Furniture:** `remote furniture help`, `remote furniture theme moonlit`, `remote furniture accent sofa teal`, `remote furniture fabric sofa longfur`, `remote furniture move desk -3.9 -0.8`, and `remote furniture lamp on|off`. Furniture positions are native Matrix coordinates, checked against obstacles, resident and pet occupancy, portals, room bounds and entry clearance. Bed is anchored. Textual accent tags are *not* graphics shaders. The reading lamp is an actual `REALITI_SENSES_V1` light source. Changes remain resident-instance private and persist in its own storage file.

**Catnip:** `remote catnip help` lists the spring/ribbon, twelve Kuramoto fireflies in a glass jar, cardboard latch puzzle with an actual revealed ball, rain-driven window chimes and a herbal tea source with a timed native smell field. Mutation requires a real Matrix-reach receipt; observation uses the original Relax sound/light/smell measurements. The native discovery ledger records successful causes. Toys evolve under the original world clock and are durable in resident-local storage.

The new [regression](test/furniture-catnip.cjs) checks closed/asleep remote semantics, actual geometry changes, native light, contact refusal when far away, moving spring, Kuramoto source, puzzle-generated Matrix entity, tea scent, host restart and isolation across two residents.

**Pending:** Full unified shared-object physics, shared furniture transactions, pet co-ownership, additional catnip from old rooms, expanded encrypted memory, new display customization and finally audited removal of 22 unused charts **from the apartment distribution only**. The original Relax source and guide stay intact.

## Batch 4 — four resident host and original Relax harness closet

**Guest loaners:** The existing physical wardrobe exposes the native REALITI Relax Moonwire presets from `REALITI_NEURO_RESTORATION_V1.presets()`. **No additional SOMA/NeuroMesh implementation is added or injected.** When a trusted household host approves a reach-checked fitting, it opens a second temporary copy of the **complete existing Relax runtime**, applies the built-in `applyPreset()` only there, and discards that whole temporary runtime on return, STOP, departure or expiry. The caller's original R&R harness, Haptic Field, memory and keys remain untouched. A solo apartment can inspect the catalog but cannot instantiate the loaner by itself.

**Four resident household:** The trusted Node module [household.cjs](household.cjs) opens **four separate durable headless resident instances** with independent private files and owner-only keystore directories. It mirrors each online resident's verified Matrix position into the other instances as a non-colliding peer capsule, and supports a bounded host-persisted public board. Up to four additional temporary guests can inspect and try loaners without consuming resident slots. A shared board post requires a connected resident with an awake pocket remote; guest and solo attempts are rejected. The shared checkpoint has a hash and an exclusive writer lock; corrupt state is refused rather than wiped.

See [HOUSEHOLD_GUIDE.md](HOUSEHOLD_GUIDE.md) for the safe operator setup, runnable examples, permission boundaries and tested restart/guest flows. This is genuine host-synchronized **shared presence and public text**, not yet a single unified collision/body/contact simulation. Resident furniture, pet state and private neuromesh are independent. The [regression test](test/closet-household.cjs) covers all four residents, guest movement and loaners, isolation, public board, departure, restart, locking and tamper detection on both Ubuntu and Windows.

## Developer source boundaries

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
- Regression tests: `test/extras.cjs`, `test/home-pets.cjs`, `test/room-inventory.cjs`

Each agent must retain a distinct storage path and Pocket keys file. **The host now supports four separately persisted agents, host-synchronized visible presence, a public board and temporary guest fittings.** Expanded resident memory capacity, a unified shared object/physics layer and single-chart pruning remain unimplemented. Do not merge private resident state to imitate those capabilities. Keep the original Relax reference and the migration guard until every old room has a tested replacement.
