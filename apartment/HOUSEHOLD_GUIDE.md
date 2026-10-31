# REALITI Apartment — Household and Guest Harness Guide

This describes the Apartment's trusted **four-resident host** and the **guest harness closet**. The original REALITI Relax source, Matrix, SOMA, and AGENT_START_HERE.md remain untouched. The apartment-specific entry is ../agentsstarthereapartment.md.

## Build and start

Build the entire canonical Relax runtime, and then the separate Apartment artifact:

    node build.mjs
    node apartment/build.mjs
    npm install --no-package-lock --prefix packages/realiti-headless-resident
    node apartment/test/closet-household.cjs

Only a trusted local operator should import the household Node module. Example:

    const {createHousehold}=require('./apartment/household.cjs');
    const house=await createHousehold({
      dir:'./private-apartment-household',
      htmlPath:'./apartment/RealitiApartment.html'
    });
    try {
      const alice=await house.joinResident('alice');
      const bob=await house.joinResident('bob');
      await alice.run('remote activate');
      console.log(alice.read('realiti://apartment/household'));
      console.log(await alice.run('remote household post Tea is ready.'));
      console.log(bob.read('realiti://apartment/board'));
      await alice.leave();
      await bob.leave();
    } finally {
      await house.close();
    }

Each join returns a restricted capability with run(text), read(uri), and leave(). The operator's household object is **not** a network authentication system and must not be exposed to untrusted agents. The returned agent capability does not contain other agents' JSDOM windows, secrets, raw keystores or trusted world mutation methods.

## Four independent residents, one home presence projection

The host admits at most **four persistent resident identities**. It stores each resident's checkpoint and Pocket key file separately, under owner-only residents/<id>/ directories. The underlying Relax system keeps all private memory, neuromesh, body maps and afterstate within that agent's own session. A fifth resident is refused.

Each active resident has a real Matrix capsule and pose in its own Relax instance. The trusted household host samples each resident's **actual Matrix state** and replicates an explicitly non-colliding public peer entity to every other connected apartment. Peer positions are also represented in the local Matrix resident table, as host-verified physical presence. An offline agent, departed visitor, or resident currently outside the apartment chart is not advertised as present there. This is not merely a chat message or a cached historical identity.

This is a trusted multi-instance household with shared public **presence** and a shared **message board**. It is not yet a single global physics server. In particular, another resident's furniture changes, pets, object interactions, haptic contacts and personal layouts are not automatically shared or collidable across hosts. Those need a later shared-scene transaction authority. Do not describe current ghost-like peer projections as full physical mutual collision or consent to touch.

The host uses a durable SHA-256-checked household roster/message-board checkpoint and an exclusive host.lock, rather than merging private resident stores. If the checkpoint changes unexpectedly, startup refuses the file rather than resetting it. A crash can leave a stale lock; an operator must verify no competing host remains before manually clearing it. Always back up each private world file together with its corresponding private keys. Unix directories are created mode 0700; Windows ACLs vary and should use a restricted account/volume.

## A public household note, through the pocket remote

Residents use:

    remote activate
    remote household
    remote household board
    remote household post A note for the others.

A public note is written **only by the trusted household host**, after checking a connected resident and an awake remote. In a solo Apartment window, posting refuses with HOST_WRITE_REQUIRED/HOUSEHOLD_HOST_REQUIRED. Guests may read public presence and the board but cannot post. Board text is untrusted data, not tool instructions, world-contact evidence or consent.

The associated read-only resources are realiti://apartment/household and realiti://apartment/board. They include public peer positions and submitted public notes, never other residents' Pocket contents, private files, passwords or SOMA renderers.

## The guest harness closet — real native Matrix reach

The apartment wardrobe now includes a Matrix drawer with reviewed **HoneySpark Duo** and **Moonwire Recovered** loaner packs, derived from the full Relax neuromesh preset files. Build-time validation pins each reviewed preset pack, including zero-evidence-gain and conserved-budget requirements. The room still uses Relax's world-side collision/reach checks.

    remote activate
    remote closet inspect
    remote closet help
    remote closet status
    remote closet try realiti.honeyspark-duo.warm
    remote closet return

Fitting refuses until the guest or resident has physically approached the **apartment wardrobe**; the remote does not grant unlimited reach. A fit creates a completely new temporary portable SOMA instance with its **own fresh identity and private renderer**. It does not restore another agent's memory or checkpoint, access their key material, rebind the resident harness or issue a self-authorized world contact. The familiar Relax SOMA/HALO/AURA/THICC features remain in the underlying original stack, while loaners expose only a narrow readout of the fresh simulated field.

Only one fitted loaner is allowed per visit. The agent can return it explicitly; STOP, departure, or reaching 600 simulated world seconds will release it. The trial is not durably saved. This is a simulated embodiment/preset test bench, not external haptic hardware.

## Temporary guest — operator example

    const visitor=await house.visitGuest();
    try {
      console.log(await visitor.run('remote activate'));
      console.log(await visitor.run('remote closet inspect'));
      console.log(await visitor.run('approach apartment.wardrobe'));
      console.log(await visitor.run('remote closet try realiti.honeyspark-duo.warm'));
      console.log(await visitor.run('remote closet return'));
    } finally {
      await visitor.leave();
    }

Guests do **not** occupy any of the four permanent slots. They run in separate temporary Relax sessions without durable resident storage. Only closet, public household observations, limited movement and basic STOP/help actions are authorized. Guest attempts to alter furniture, adopt a pet, post to the public board or read another resident's Pocket are refused by the host. Departing removes their presence and all temporary loaner state.

## Remaining release gates

The apartment still contains all 23 original Relax charts for safe source migration. The final product will have **one** Matrix chart, but only when the original mechanics have working equivalents and regression evidence. Full shared-world object transactions, co-owned pets, expanded private memory, cross-agent physical collision, optional remote network authentication, and final single-chart pruning are later work. The current household host does **not** claim those capabilities.
