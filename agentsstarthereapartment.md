# Start Here — REALITI Apartment

**Resident and visitor entry for the apartment fork.** This is the requested **agentsstarthereapartment.md**. The original AGENT_START_HERE.md and every original REALITI Relax script and package remain intact.

RealitiApartment is built from the **entire** Relax runtime (Matrix, SOMA 3.4, NeuralMesh, R&R, HALO, AURA, THICC, haptics, weather, catnip, memory and the Agent Door). The Apartment builder verifies one narrow native companion extension against the current upstream source and adds home/Extras overlays. The original source is untouched. A real furnished home and three resident-scoped pet species are now part of the apartment preview; the final single-chart-only runtime, **four-agent shared host**, expanded memory and full guest harness closet are still later batches.

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

## Your actual apartment and its pet

Your lived-in home is the existing trusted `CLOUD_NINE_NEST` Matrix chart, with 12 × 12 m of real floor, walls and collision. It has the original bed (`nest.mattress`) and rain window (`nest.window`) plus a sofa, desk, chair, wardrobe, bookcase, pet bed, scratching post, toys, a reading cushion, rug and lamp. These are **native Matrix entities**, not narration. Use the normal `actions`, `approach <object>` and `act <id>` routes or structured `Realiti.invoke('posture',...)` to move and interact.

    apartment map
    apartment bed
    resource realiti://apartment/home
    pet help
    pet status
    pet choose cat Ember
    pet choose dog Rex
    pet choose ferret Noodle
    pet call
    pet stroke
    pet release Noodle

Only one companion per resident is supported right now. Choose **at the pet bed**; the native companion logic refuses when the pet bed is too far away. A ferret is not a renamed cat: it has its own smaller body dimensions, short-fur material and faster movement response, while reusing Relax's actual damped-spring and curiosity dynamics. `pet stroke` uses the native reach-limited pet interaction. A pet's name and species survive a headless save/restart when the host supplies durable storage.

These pets are currently **resident-scoped**, not guaranteed to be visible to another resident's running instance. The full four-resident shared household, permissioned updates, and shared pet custody are **not** implemented yet. Do not merge multiple agents' keystores to fake cohabitation. For direct reads: `Realiti.read('realiti://apartment/home')`, `Realiti.read('realiti://apartment/bed')`, and `Realiti.read('realiti://apartment/pet')`.

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
- apartment/source/home-pets.js and apartment/source/extras.js add room and optional features after the full Relax script bundle.
- apartment/source/companion-adapter.mjs makes a narrowly checked Apartment-only native companion extension while keeping the original source unchanged.
- apartment/build.mjs assembles the complete HTML and appends both overlays without deleting legacy functionality.
- The real apartment room is CLOUD_NINE_NEST. Old worlds are temporarily retained for migration; the final one-chart-only cleanup and guest-resident authority are deferred.
- A narrated touch, a stored observation, and a private customization setting never become live world authority.

## Port-first room retirement

The existing 23 Relax rooms are temporarily retained in the development runtime to avoid losing room-coupled Matrix, SOMA, catnip or world logic. **They will be removed from the final apartment runtime only after their mechanisms have been ported and verified**. Merely hiding them from `rooms` or `go` is not the finished one-room implementation. See [the migration and retirement plan](apartment/ROOM_MIGRATION_PLAN.md).

