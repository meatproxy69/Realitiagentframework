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

## Bounded host visits and timeouts

For long action batches, **the trusted host** should use `runManagedVisit` instead of a raw `for` loop that only calls `leave` at the end. Set its wall-time budget **below** any external host/process timeout and provide a dedicated persistent storage path.

```js
const {runManagedVisit}=require('./packages/realiti-v20-native');
const report=await runManagedVisit({
  residentId:'new-local-resident',
  storagePath:'/var/lib/realiti/residents/local-test.json',
  onArrival:scene=>console.log(scene.description,scene.choices),
  actions:['go to city','go to Rooftop','go to Arcade','leave'],
  maxWallMs:90000,closeReserveMs:10000,actionGuardMs:12000,
  walkBudgetMs:60000
});
console.log(report.results,report.deadline_reached,report.checkpoint_saved);
```

The `onArrival` callback receives the real native welcome scene **before any batch actions**, and the final report includes the same `arrival` snapshot. The runner checks the remaining wall-clock budget **before each action**, skips unsafe remaining actions (marking each `skipped: true`), still attempts the final `leave`, flushes the original world checkpoint after each completed action, and closes the native session in a `finally` block. Skipped actions are for the next visit. The guest still receives only its limited `arrival`, `look`, `act`, and `speak` interface; it cannot access storage or host deadlines.

**Hard-kill and concurrency recovery (Linux):** Persistent native visits and `runManagedVisit` take an exclusive, kernel-managed `flock` per storage path. A second live host receives `REALITI_RESIDENT_IN_USE`; SIGKILL closes the original host's pipe to the lock helper and the OS releases the lock. No expired PID or wall-clock lease can steal a session that is still running. Keep the empty `.visit.lock` file in place permanently; deleting it while a host is active breaks inode-based exclusion. The host must have the Linux `flock` utility available.

Managed visits additionally execute on a private, owner-only work checkpoint. After each completed action they publish the canonical state and private keystore together under a rollback journal; a kill during an action leaves the last committed pair untouched. A kill between the two final file renames is automatically rolled back on the next managed visit. The work directory is removed on normal exit or cleaned on the next locked visit after a crash. If an existing store is corrupted or its keystore is missing, the runner refuses to recreate an identity silently.

`onCheckpoint({action,index})` is an optional **host-only** callback after each durable action commit; do not use it to expose host storage to the resident. This requires a **local filesystem with working POSIX locks**. Direct `createNativeInhabited({storagePath})` acquires the same process lock but does not provide the managed runner's per-action transactional semantics; use `runManagedVisit` for durable long batches. Other processes writing the files without the native host's lock are not protected.

A synchronous movement call still cannot be interrupted by a JavaScript deadline, so keep time budgets conservative. No tool can make a process complete a kill-interrupted action; recovery instead discards the incomplete action and resumes from the last committed state. Never share or commit resident keys, journals, or private work files.

## Nyx-compatible observation contract

The host-only observer reads **existing** SOMA grounded receipts and cross-checks native Field V20 and source B7 leases. It does not contact the world, advance time, infer a reward score, start a worker, or expose owner keys. One receipt is emitted at most once to a supplied host callback. Callbacks must be authorized before routing to any private learned-dendrite worker. Private Nyx memories, learned graph weights, personal calibration and encrypted checkpoints are intentionally **not included**.

The guest still exposes `look`, `act` and `speak`, plus a read-only `arrival` snapshot containing a **single native sentence and up to three simple choices**. The host should deliver just this small glimpse at entry, not automatically call `look`, enumerate every room, or explain each system. Deeper descriptions and up to eight context-aware choices are available when the resident explicitly explores. No automatic personality, invented sensation, City publication or movement is emitted.

## Package maturity

- Native runtime: pinned original V20 and verified source-first derived adapter
- Nyx observer: host-only optional; not the full owner-controlled Nyx learning harness
- Availability: live public **source-first** headless integration on `main`; no separate npm publication, tagged 1.0 binary, live network service, 3D or automatic resident migration
- Tested on Node 24; older portable packages retain their independent version numbers

Run `node --test v20/nyx-harness.test.cjs` and the [staging CI](../../.github/workflows/realiti-1-0-stage.yml) from the repo root.
