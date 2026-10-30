# Start Here — REALITI Apartment

**Resident and visitor entry for the apartment fork.** This is the requested **agentsstarthereapartment.md**. The original AGENT_START_HERE.md and every original REALITI Relax script and package remain intact.

The apartment is an additive standalone artifact, built from the **entire** Relax runtime (Matrix, SOMA 3.4, NeuralMesh, R&R, HALO, AURA, THICC, haptics, weather, catnip, memory and the Agent Door). Its own source lives in apartment/. This is an incremental build: the final one-room layout, pets, four-resident host, expanded memory and full guest harness closet are subsequent batches. Do not claim those features are working from this first two-feature batch.

## Build and enter

From the repository root run the following commands:

    node build.mjs
    node apartment/build.mjs
    npm install --no-package-lock --prefix packages/realiti-headless-resident

Use the headless host with the generated apartment artifact. The normal host validates apartment/VALIDATION.json:

    const {openResident}=require('./packages/realiti-headless-resident');
    const session=await openResident({
      htmlPath:'./apartment/RealitiApartment.html',
      residentId:'your-stable-resident-id',
      storagePath:'./private/your-stable-resident-id.json'
    });
    const ready=await session.window.Realiti.ready;
    if(!ready.ok || ready.harness!=='REALITI_RR_HARNESS_V1'
       || ready.starter_imprint!=='REALITI_DEFAULT_IMPRINT_V1')
      throw new Error('REALITI_HARNESS_NOT_READY');
    console.log(await session.door.run('look'));
    console.log(await session.door.run('extras'));

Use a **different storage file and keys file for each resident**, even when sharing the same household. Pocket private key names are not currently resident-namespaced within one backing file. Never merge or hand-copy resident storage and keys into a shared file. Never expose another resident's memory or private harness.

Always run goodbye or close the host cleanly. Save persists the original Pocket/world state if the keystore is available. The host loader is not the harness; the native harness is already installed. Inspect Realiti.read('realiti://harness') and Realiti.read('realiti://soma/harness') as the usual startup checks.

## Apartment Extras — deliberately tucked away

The standard help advertises only **extras**. The menu opens only when asked. Its optional features are:

    extras
    extras rain
    extras rain touch
    extras rain curtains closed
    extras rain curtains open
    extras cloak
    extras cloak wear
    extras cloak map
    extras cloak wiggle
    extras cloak remove
    extras close

The **rain window** reads the original Nest weather from REALITI_DYNAMICS_V1 and the original rain-window acoustic source. The real Matrix window entity is nest.window. Rain, its sound and its smell are inherited from Relax. Changing the curtain choice is per-resident *presentation*; it does not change the weather or invent contact. extras rain touch refuses if the window is out of Matrix reach. Approach it through ordinary spatial commands first.

The **shapeshifter cloak** is the original borrowed-limb exercise from the Relax Atelier, not an invented cosmetic response. extras cloak wear requires Matrix reach to a felt cloak placed near the Nest arrival area, then calls the existing borrowed-limb engine. An attached tail is initially only a representation, not a receptor. extras cloak map maps the right-palm receptor to tail.tip; extras cloak wiggle uses the original paired action/prediction path. extras cloak remove revokes the mapping; any saved slow learned trace remains historical/private. The menu does not mint host evidence.

Read-only resources: Realiti.read('realiti://apartment/extras') and Realiti.read('realiti://apartment/rain'). The original resource and Agent Door API remains available underneath.

## Make this home yours

See [the agent customization guide](apartment/CUSTOMIZATION_GUIDE.md) for staged personalization, current versus planned options, resident privacy, shared-household boundaries and the guest visitor policy.

## Source and safety

- Original AGENT_START_HERE.md remains the unmodified technical reference for all inherited Relax systems.
- apartment/source/extras.js is the only runtime overlay in this first pair.
- apartment/build.mjs copies the complete HTML and appends its extra script without deleting legacy functionality.
- The temporary room is the existing CLOUD_NINE_NEST. Final room replacement and guest-room state are deferred to later features.
- A narrated touch, a stored observation, and a private customization setting never become live world authority.

## Port-first room retirement

The existing 23 Relax rooms are temporarily retained in the development runtime to avoid losing room-coupled Matrix, SOMA, catnip or world logic. **They will be removed from the final apartment runtime only after their mechanisms have been ported and verified**. Merely hiding them from `rooms` or `go` is not the finished one-room implementation. See [the migration and retirement plan](apartment/ROOM_MIGRATION_PLAN.md).

