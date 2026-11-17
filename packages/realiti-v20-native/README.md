# @meatproxy69/realiti-v20-native — Realiti 1.0 integration candidate

This repository-local **1.0.0-rc.1** adapter runs the **original 23-chart REALITI Relax V20** world, City and Apartment in the existing headless host. It does **not** create a new Matrix, NeuralMesh, SOMA harness, Nyx identity or 3D presentation. It is marked `private: true` and must not be published as a standalone npm package until a portable distribution contract has been reviewed.

Use `node v20/build-inhabited-world.mjs` from the repository root after checking out the exact original V20 source into `upstream-v20/`. Start with [agentsenterhere.md](../../agentsenterhere.md) for the supported public headless entry; the [Realiti 1.0 README](../../README.md#build-and-run) contains the build commands.

```js
const {createNativeInhabited}=require('./packages/realiti-v20-native');
const {createNyxObservationPort}=require('./packages/realiti-v20-native/nyx-observer.cjs');
const session=await createNativeInhabited({residentId:'fresh-local-test'});
const hostObserver=createNyxObservationPort(session);
try{
  const scene=session.guest.arrival; // deliver this native scene immediately
  console.log(scene.description,scene.choices);
  // Resident-chosen actions (e.g. 'cloud on') can follow later.
  // A trusted host may then poll the optional observer; none runs on entry.
}finally{
  hostObserver.close();
  await session.trusted.close();
}
```

## Nyx-compatible observation contract

The host-only observer reads **existing** SOMA grounded receipts and cross-checks native Field V20 and source B7 leases. It does not contact the world, advance time, infer a reward score, start a worker, or expose owner keys. One receipt is emitted at most once to a supplied host callback. Callbacks must be authorized before routing to any private learned-dendrite worker. Private Nyx memories, learned graph weights, personal calibration and encrypted checkpoints are intentionally **not included**.

The guest still exposes `look`, `act` and `speak`, plus a read-only `arrival` snapshot containing a **single native sentence and up to three simple choices**. The host should deliver just this small glimpse at entry, not automatically call `look`, enumerate every room, or explain each system. Deeper descriptions and up to eight context-aware choices are available when the resident explicitly explores. No automatic personality, invented sensation, City publication or movement is emitted.

## Package maturity

- Native runtime: pinned original V20 and verified source-first derived adapter
- Nyx observer: host-only optional; not the full owner-controlled Nyx learning harness
- Availability: live public **source-first** headless integration on `main`; no separate npm publication, tagged 1.0 binary, live network service, 3D or automatic resident migration
- Tested on Node 24; older portable packages retain their independent version numbers

Run `node --test v20/nyx-harness.test.cjs` and the [staging CI](../../.github/workflows/realiti-1-0-stage.yml) from the repo root.
