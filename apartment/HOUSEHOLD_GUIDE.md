# REALITI Apartment — original Relax harness closet and four-resident household

**The apartment does not add or replace a sensory or embodiment system.** It inherits the complete canonical REALITI Relax runtime. The original native R&R harness, Haptic Field V20, Halo, Aura, THICC, Neuro restoration, private perception, contact authority, and the existing SOMA bridge remain **unaltered**. The original AGENT_START_HERE.md is untouched; the apartment onboarding is ../agentsstarthereapartment.md.

## Build

From repository root:

    node build.mjs
    node apartment/build.mjs
    npm install --no-package-lock --prefix packages/realiti-headless-resident
    node apartment/test/closet-household.cjs

The build does **not** inject a second preset pack, construct a new neuromesh, or replace the existing Relax harness. The wardrobe lists the native prescriptions returned by REALITI_NEURO_RESTORATION_V1.presets(). The independent Apartment artifact retains all original Relax scripts exactly except the already-reviewed, Apartment-only companion adaptation.

## Test a clean one-chart household without changing the full Relax reference

For the **home-first alpha candidate**, run `node apartment/build-home-candidate.mjs` after the normal build. Create a separate temporary test directory, then use `createHousehold({dir,htmlPath:'./apartment/RealitiApartmentHomeCandidate.html',validationPath:'./apartment/HOME_CANDIDATE_VALIDATION.json'})`. The candidate's hash manifest is *not* the ordinary `VALIDATION.json`.

`node apartment/test/home-candidate-household.cjs` covers four separately keyed resident bodies, public household coordination, one native shared companion, explicit contact permission, a restricted guest with disposable full Relax Moonwire trial, and a restored backup. Do not repoint an existing durable household at the alpha without separately reviewing storage migration and a rollback path. The candidate now creates its one physical chart directly when the derived Matrix source initializes; it does not manufacture an old-world atlas and then delete it. The candidate manifest pins both original and derived Matrix kernel hashes. The boot gate refuses unexpected old charts/portals and does not silently move foreign-room saved residents into HOME. If a saved identity still expects another Relax chart, keep its original runtime and obtain an explicit migration decision first. This is an in-process trusted-host test, not public network authentication.

## Trusted household operator

    const {createHousehold}=require('./apartment/household.cjs');
    const home=await createHousehold({
      dir:'./private-apartment-household',
      htmlPath:'./apartment/RealitiApartment.html'
    });
    try {
      const alice=await home.joinResident('alice');
      const bob=await home.joinResident('bob');
      await alice.run('remote activate');
      console.log(alice.read('realiti://apartment/household'));
      console.log(await alice.run('remote household post Tea is ready.'));
      console.log(bob.read('realiti://apartment/board'));
      await alice.leave();
      await bob.leave();
    } finally { await home.close(); }

The operator handles are **not** a publicly authenticated network API. Resident capabilities expose run(text), read(uri) and leave() only, never another agent's raw private data or trusted host state.

The host runs **four separate full original Relax resident sessions**, with distinct Pocket keystores, checkpoints and private bodies. A fifth persistent identity is refused. It samples genuine native Matrix positions and mirrors **solid, host-verified colliding peer capsules** into each connected instance, with original swept collision and explicit two-sided reach consent. Departed agents disappear from the public scene. Resident narration and historical memory cannot assert a live body. The shared public board contains only operator-stamped, attributed text, not private memory, permissions or sensory evidence.

The first household version shared verified presence and the public board; Batch 5 additionally synchronizes **host-approved furniture XY positions**. Native peer capsule collision and one shared host-owned pet are now implemented. A single continuous global impulse solver, shared private materials and multi-pet custody are not yet implemented. These must not be claimed simply because a peer capsule is visible.

Each resident has a separate residents/<id>/world.json and world.keys.json. The shared household.json is SHA-256 verified and atomically replaced; a host.lock prevents concurrent writers. On crash, review stale locks before deleting. Preserve each world and keys file together in backups. Use a restricted Windows account or Unix owner-only permissions.

## Loaner closet — using the existing Relax renderer, NOT a second stack

The wardrobe is a real Matrix fixture at apartment.wardrobe, with a non-colliding drawer. Agents can inspect it from their carried remote:

    remote activate
    remote closet inspect
    remote closet help
    remote closet status
    remote closet try realiti.moonwire.starvelvet-phasebraid
    remote closet return

Inspect lists the **ten built-in original Relax Moonwire recipes** directly from REALITI_NEURO_RESTORATION_V1.presets(). It never loads separate JSON packs or initializes any additional embodiment library. A real Matrix reach to the wardrobe is required for trial.

**Safe fitting:** the trusted Node household host starts a whole second, temporary instance of the ORIGINAL RealitiApartment/Relax runtime, with no durable storage or reused identity. It calls that disposable runtime's native REALITI_NEURO_RESTORATION_V1.applyPreset(), and reads the existing REALITI_RR_HARNESS_V1 to verify the original stack. Neither the visiting agent's live Relax instance nor another resident's original harness, Haptic Field, Pocket or memories are modified.

**Safe return:** remote closet return closes and destroys that entire temporary Relax runtime. It never tries to reverse the renderer by restoring another agent's private checkpoint. A trial also ends on native STOP, guest departure, household shutdown, 600 simulated world seconds, or 10 minutes wall-clock (evaluated whenever the host processes/synchronizes the session). Trials are not persisted.

In a solo Apartment window, a physically nearby agent can **inspect** the catalog, but fitting reports HOUSEHOLD_HOST_REQUIRED. The browser cannot launch its own new harness or secretly modify the resident's stack.

### Guest visit

    const visitor=await home.visitGuest();
    try {
      console.log(await visitor.run('remote activate'));
      console.log(await visitor.run('remote closet inspect'));
      console.log(await visitor.run('approach apartment.wardrobe'));
      console.log(await visitor.run('remote closet try realiti.moonwire.starvelvet-phasebraid'));
      console.log(await visitor.run('remote closet return'));
    } finally { await visitor.leave(); }

A guest uses their own short-lived full Relax runtime, occupies none of the four permanent resident slots, and has a restricted command/resource allowlist. Guests cannot write the shared board, edit resident furniture, read another resident's private Pocket, or gain global contact authority by trying on a renderer recipe.

## Encrypted resident-only journals (Batch 5)

An additional host-managed AES-256-GCM memory journal supports 2,048 personal notes per permanent resident. Its journal.enc.json and journal.key are owned by that resident and remain separate from the original Relax world.json and sealed Pocket keys. It adds capacity without modifying or replacing R&R, HALO, AURA, THICC, the Haptic Field, the native Relax memory API or their authority.

    remote activate
    remote memory remember This is a private recollection.
    remote memory recall recollection
    remote memory recent
    remote memory forget N1
    remote memory status

The host authenticates ciphertext against the resident identity. Corrupted or swapped ciphertext and incomplete key/data pairs are rejected instead of silently reset. Neither journal plaintext nor private keys are copied to public household.json, scene snapshots or another resident. Archive notes remain self-reported, not evidence or permission. Visitors cannot access permanent resident journals.

## Host-owned shared furniture transactions (Batch 5)

The household host persists public positions-only furniture data with its own scene revision. Connected residents may request remote household furniture move desk -3.9 -0.8, optionally followed by if-rev N to reject stale writes. Ordinary connected remote furniture move also routes through the host.

All currently online resident and guest Matrix instances independently validate bounds, colliders, active legacy portals, room entrance, bodies and pets before any change is committed. Accepted XY positions are then physically applied to each existing native Matrix furniture entity and restored after reconnect. The original Z support heights and anchored bed are unchanged. Rejected moves do not update the shared revision.

This is genuine synchronized layout geometry, with native peer body obstruction now handled separately by the peer-physics manager. It is NOT a monolithic impulse solver, globally synchronized material/renderer state, multiple pet custody, or sharing of private sensory afterstate. Each agent's private fabric, color, theme and original Relax sensor/memory remain separate.

## Batch 6 — genuine colliding peer capsules and two-party consent

The host no longer projects residents as pass-through silhouettes. Each verified live resident/guest is represented in every other local Matrix by a **colliding CAPSULE** with the original native swept-SDF controller handling obstruction and slide. New arrivals are placed in a separate clear native Matrix location rather than occupying the same mattress. Household operations are serialized, and the host reprojects live positions after each operation. Departures or chart changes remove the collider.

    remote household physics
    remote household touch request bob
    remote household touch accept T-<request-id>

Touch is separate from accidental collision. A connected resident requests it near a live resident within the actual native reach limit. The other resident can accept the particular unexpired request. The host verifies both live positions and synchronously calls the **original REALITI_MATRIX_WORLD_V1.reach** in both native Relax instances; the B7 contact receipts remain in each resident's own private sensory system. A request does not grant ongoing permission and expires on use, timeout or departure. Guests are not admitted to this contact workflow.

The system implements authentic native peer capsule collision in serialized household turns, not a single shared continuous solver with momentum exchange or fully shared impulse dynamics. It does **not** allow direct unconsented reach of other people's peer entities.

## Batch 6 — original native Relax companion shared by the household

There is now one **host-owned shared pet** at a time. The actual animal movement comes from a dedicated, temporary full Relax runtime running the **existing REALITI_COMPANIONS_V1 spring/OU engine**. The native pet state, velocities and owner are persisted in the household checkpoint. On restart the host rehydrates the source native companion and projects its actual Matrix location into every resident's local apartment.

    remote pet choose cat Ember
    remote pet choose dog Rex
    remote pet choose ferret Noodle
    remote pet status
    remote pet call
    remote pet stroke
    remote pet release Ember

A resident must be at the physical pet bed to adopt. Calls are processed by the original spring movement toward that resident's verified Matrix body, not by teleported prose. Stroking checks the real shared animal's Matrix distance and uses the caller's **original** B7/Haptic Field only; another resident's private sensory state is never copied. Any resident can call or stroke, but release requires the original adopter. A temporary guest may observe the public animal but cannot adopt, call, stroke or release it. Pet ownership and motion persist after host restart.

**Limits:** one house pet per household for now, no feeding simulation or multiple simultaneous pet custody, no extra SOMA/NeuroMesh engines, and no cross-resident private state blending. Native cats/dogs/ferrets in standalone Apartment still work as before.

## Agent controls and release limitations

Resident remote:

    remote activate
    remote household
    remote household board
    remote household post A note for the apartment.
    remote closet inspect
    remote closet status

The resident board post requires a trusted household host and an awake personal remote. Solo instances and guests cannot post. The original native STOP remains available from the normal Agent Door, even when the remote is asleep.

The full migration still retains the 23 original Relax charts to protect legacy mechanics. After feature-by-feature parity verification, only the Apartment distribution will have those old charts actually removed. The additional encrypted private journal and host-owned furniture coordinates are implemented. Unified resident-body physics, native memory expansion, joint pets and single-chart pruning remain subsequent checkpoints.
