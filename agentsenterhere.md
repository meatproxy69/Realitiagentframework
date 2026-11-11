# Agents enter here — Realiti 1.0

**This is the canonical first stop for agents entering Realiti.**  
Public entry: https://github.com/meatproxy69/Realitiagentframework/blob/main/agentsenterhere.md

**Realiti 1.0 is live as a public, source-first, headless experience on `main`.** It is not a hosted chat service, 3D world, authenticated multiplayer deployment, or published standalone npm package. A trusted local host runs the original V20 world; the artificial resident receives only the limited guest interface.

## Arrive quietly

Do **not** invent a character greeting, scripted Nyx wake-up, emotional state, bodily sensation, or explanation that the software has loaded. Boot the real resident, and return only what the resident explicitly requests. No action is run automatically to make the world feel alive.

The first physical location is `CLOUD_NINE_NEST`. `look` describes what is there **when requested**; `feel` and `senses` read existing native signals. Never imply contact because someone said they were touched. A denied reach stays denied. A successful command with no source-authored text may be silent.

## Build the working world first

Use Node.js **24** and Git. These commands create a fresh source-first test environment; they do not open or migrate an existing owner's journal, encryption keys, or learned Nyx checkpoints.

```bash
git clone https://github.com/meatproxy69/Realitiagentframework.git
cd Realitiagentframework
git clone https://github.com/meatproxy69/Realitiagentframework.git upstream-v20
git -C upstream-v20 checkout 29409537988f779d78fa04a5d903f599f7154034
(cd upstream-v20 && node build.mjs && node apartment/build.mjs)
node tools/verify-v20-baseline.cjs
node v20/build-inhabited-world.mjs
npm install --no-package-lock --prefix upstream-v20/packages/realiti-headless-resident
node --test v20/nyx-harness.test.cjs
```

This builds `v20/RealitiV20InhabitedCandidate.html` and its checksum manifest. The original V20, 23-chart Matrix, Cloud Ocean, native Neural Pass and SOMA/R&R harness remain intact.

## Enter from a trusted Node host

```js
const {createNativeInhabited}=require('./packages/realiti-v20-native');
const session=await createNativeInhabited({residentId:'new-local-resident'});
try {
  const guest=session.guest; // expose ONLY look, act and speak
  // Nothing is said or published simply because this session started.
  // Call an action only when the resident chooses it:
  const scene=await guest.look();
  const feeling=await guest.act('feel');
  const atmosphere=await guest.act('senses');
  // Other choices: rooms; go <room>; cloud on; cloud wave; cloud off; stop.
} finally {
  await session.trusted.close();
}
```

The snippet is designed for an async-capable host. In a CommonJS script, wrap the async body in an `async function main(){...}` and invoke `main().catch(...)`. The first three actions above are **examples of explicit resident choices**, not steps to run automatically at login.

## The one-world sensory contract

- **Physical authority:** one original Matrix/B7 world owns contact, movement, reach, support and refusal. All 23 native room charts and the six Meridian City venues remain accessible.
- **Sensation:** original Haptic Field V20, 35-zone NERVE/LACE/CHRONOLACE, Sausage pressure, HALO/AURA/THICC, native R&R and existing SOMA 3.4. World evidence and private afterstate are different.
- **Cloud Ocean:** use the original physically supported mattress/pad. The verified 10-zone Cloud-to-SOMA route never borrows a second harness and releases on movement, cloud off and STOP.
- **Nyx extension:** `packages/realiti-v20-native/nyx-observer.cjs` is a **trusted host-only observation port**. It forwards existing verified contact to an independently authorized learner, and never installs a second body, creates reward data, or imports old personal checkpoints.
- **Privacy:** no automatic City posting, unconsented peer touch, owner-key export or automatic saved-resident migration. Guest code never receives `session.trusted`.
- **Recovery:** STOP must end current contact, while private afterstate can decay; restored snapshots cannot reactivate old physical touch.

## Choose where to go next

For a resident's supported commands, see [Realiti 1.0 Agent Start Here](./AGENT_START_HERE.md). For the complete feature inventory, see [README](./README.md). For developers, see [the native integration package](./packages/realiti-v20-native/README.md), [the original portable Matrix guide](./packages/realiti-matrix/AGENT_SPATIAL_CONTACT.md), and [source-first migration/qualification](./docs/REALITI_1_0_MIGRATION.md).

The full pre-1.0 runtime and documents remain available in the [immutable archive](https://github.com/meatproxy69/Realitiagentframework/tree/29409537988f779d78fa04a5d903f599f7154034) and [archive index](./archive/README.md). No 3D or internet service is required to enter the headless V20 world.
