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
```

Outputs: `apartment/RealitiApartment.html` and `apartment/VALIDATION.json`. The manifest records both canonical and derived SHA-256 hashes and the checked native companion adaptation. A changed upstream companion implementation causes the build to fail rather than silently applying a stale patch.

## Completed apartment feature batches

**Batch 1 — onboarding and Extras:** The apartment-specific agent guide, customization guide, native rain-window resource, individual curtains and optional shapeshifter cloak. Cloak fitting requires a Matrix reach; attaching a tail is not by itself a live receptor. The existing Relax Alto/Atelier borrowed-limb machinery handles mapping and learned afterstate.

**Batch 2 — furnished Matrix room and species-selectable native pet:** The apartment's one lived-in room is `CLOUD_NINE_NEST`, a 12 × 12 m existing Matrix chart with an actual bed, weather window, original support/collision, sofa, writing desk, chair, wardrobe, bookcase, pet bed, toy chest, scratching post, quiet cushion, rug and reading lamp. Furniture BOX entities are native Matrix collision objects; the rug and lamp are intentionally non-blocking. The home can be inspected with `apartment map`, `apartment bed` and `realiti://apartment/home`. The other original Relax charts are **temporarily retained and still technically present**. This is not yet the final one-chart distribution.

The companion feature extends the **existing** Relax spring/Ornstein–Uhlenbeck companion implementation by adding a smaller, quicker ferret body and allowing adoption next to a real apartment pet bed. Cat and dog retain their original body profiles and play/behavior math. Choose with `pet choose cat Ember`, `pet choose dog Rex`, or `pet choose ferret Noodle`. `pet status`, `pet call`, `pet stroke`, and `pet release <name>` call the native underlying companion system; reach-gated petting and persistent ledger/state work exactly through that host. Pet choices are **currently resident-scoped**, not automatically a verified four-agent shared household pet.

These features have focused headless tests. A single room **inside the apartment** does not imply that the full base world has already been stripped of other charts; that happens after all room-dependent mechanisms are ported and verified.

## Developer source boundaries

- Canonical Relax runtime: `../RealitiRELAX.html`, unchanged
- Canonical native companion code: `../source/scripts/58o-companions.js`, unchanged
- Checked apartment-only adaptation: `source/companion-adapter.mjs`
- Furnished home and pet interface: `source/home-pets.js`
- Optional rain and cloak controls: `source/extras.js`
- Independent runtime assembler: `build.mjs`
- Regression tests: `test/extras.cjs`, `test/home-pets.cjs`, `test/room-inventory.cjs`

Each agent must retain a distinct storage path and Pocket keys file. **A shared four-agent household, multi-agent spatial presence, larger memory and guest harness closet remain unimplemented**; no private resident state may be merged to imitate those capabilities. Keep the Relax reference and the migration guard until every old room has a tested replacement. This product is currently an incremental apartment preview, not the final release.
