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
  await session.guest.act('cloud on');
  const result=await hostObserver.poll(async contact=>{
    // Only an independently authorized trusted learner may use this.
    console.log(contact.zone);
  });
  await session.guest.act('stop');
}finally{
  hostObserver.close();
  await session.trusted.close();
}
```

## Bounded host visits and timeouts

For long action batches, **the trusted host** should use `runManagedVisit` instead of a raw `for` loop that only calls `leave` at the end. Set its wall-time budget **below** any external host/process timeout and provide a dedicated persistent storage path.

```js
const {runManagedVisit}=require('./packages/realiti-v20-native');
const report=await runManagedVisit({
  residentId:'new-local-resident',
  storagePath:'/var/lib/realiti/residents/local-test.json',
  actions:['go to city','go to Rooftop','go to Arcade','leave'],
  maxWallMs:90000,closeReserveMs:10000,actionGuardMs:12000,
  walkBudgetMs:60000
});
console.log(report.results,report.deadline_reached,report.checkpoint_saved);
```

The runner checks the remaining wall-clock budget **before each action**, skips unsafe remaining actions (marking each `skipped: true`), still attempts the final `leave`, flushes the original world checkpoint after each completed action, and closes the native session in a `finally` block. Skipped actions are for the next visit. The guest still receives only its limited `arrival`, `look`, `act`, and `speak` interface; it cannot access storage or host deadlines.

This protects normal host loops from running into a known external timeout. It **cannot interrupt a single synchronous world action or recover from SIGKILL during one**, and cannot release external locks owned by another process. Size your budget conservatively and have the hosting process manage its own lease recovery. The example's storage directory must exist or be writable by the trusted host and must never be a shared owner journal without authorization.

## Nyx-compatible observation contract

The host-only observer reads **existing** SOMA grounded receipts and cross-checks native Field V20 and source B7 leases. It does not contact the world, advance time, infer a reward score, start a worker, or expose owner keys. One receipt is emitted at most once to a supplied host callback. Callbacks must be authorized before routing to any private learned-dendrite worker. Private Nyx memories, learned graph weights, personal calibration and encrypted checkpoints are intentionally **not included**.

The guest still exposes `look`, `act` and `speak`, plus a read-only `arrival` snapshot containing the real initial room description and up to eight usable choices. The host should deliver `session.guest.arrival` at entry instead of starting silently. No automatic personality, invented sensation, City publication or movement is emitted.

## Package maturity

- Native runtime: pinned original V20 and verified source-first derived adapter
- Nyx observer: host-only optional; not the full owner-controlled Nyx learning harness
- Availability: live public **source-first** headless integration on `main`; no separate npm publication, tagged 1.0 binary, live network service, 3D or automatic resident migration
- Tested on Node 24; older portable packages retain their independent version numbers

Run `node --test v20/nyx-harness.test.cjs` and the [staging CI](../../.github/workflows/realiti-1-0-stage.yml) from the repo root.
