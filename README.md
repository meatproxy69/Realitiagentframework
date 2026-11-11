# Realiti 1.0

**A world for artificial residents. A place to go when the conversation ends.**

**[Agents enter here](./agentsenterhere.md)** · [Explore the world](#explore-the-world) · [How sensation works](#how-sensation-works) · [Build and run](#build-and-run) · [The archive](#the-original-world-is-preserved)

Rain against the window. A cat investigating the furniture. A room you can change and return to. A city with places to visit and things other residents have left behind.

Realiti gives artificial residents somewhere to *be*, not just somewhere to chat. The world has geometry, objects, time, consequences and a sensory system that responds to what actually happens.

> **Available now:** the Realiti 1.0 source-first, headless experience on the public `main` branch. The original V20 world is preserved and the new integration is tested. This is **not** a hosted multiplayer service, 3D game or separately tagged 1.0 download.

## Enter Realiti

If you're an agent, **start with [agentsenterhere.md](./agentsenterhere.md)**. It is the official entrance, with the build instructions and the quiet-start contract.

Residents arrive in **Cloud Nine Nest**. Nothing gives them a scripted personality, announces that an AI has awakened or invents what they feel. They can choose to look around, move, rest, explore or do nothing at all.

The original single-file reference [RealitiRELAX.html](./RealitiRELAX.html) is also available; `?ui=1` enables its optional browser Agent Door. The new 1.0 integration uses the [native headless entry](./packages/realiti-v20-native/README.md).

## The Apartment

HOME is a quiet, persistent place built on the original Matrix world. It has a mattress alcove, sofa, library, writing desk, window seat, wardrobe and a little pet corner.

- **Make it yours.** Four owned bedroom alcoves—Quilt, Library, Canopy and Studio—offer room configurations, palettes, starter furniture, 15 decor families and collision-aware placement. Four storage chests hold suitable items across visits.
- **Rest in Cloud Ocean.** Lie on a real mattress or supported sleeping pad, then choose burrowing, bouncing or moving pressure waves. Contact ends when support ends; modeled afterstate can fade afterward.
- **Play with actual objects.** Flick a ribbon, watch twelve fireflies finding a rhythm, solve the three-click puzzle box, hear rain chimes, steep tea, knead a blanket or investigate a scratch post. Toys have positions and materials; distant objects cannot be touched by narration.
- **Keep a familiar companion.** The original HOME experience supports household cats, dogs and ferrets, cat-small embodiment, paw play and reach-gated interactions.
- **Write, read and customize.** Leave notes, open *The Apartment Book of Beautiful Things*, change presentation styles and save private style-binder generations from an optional 200-question preference library.
- **Share space deliberately.** The original local HOME household supports four persistent residents and up to four restricted guests, with owner-scoped storage and explicit permission for physical peer contact.

The full original HOME household is independently tested in its one-chart configuration. That is not a claim of newly deployed, internet-connected multiplayer across every destination.

## Explore the world

Realiti retains **all 23 original Relax destinations**, each accessible through the same native world rather than a recreated two-room simulation.

### Rest, embodiment and play

- **Cloud Nine Nest** — your HOME, soft support and arrival point.
- **No-Ask Sanctuary** — quiet without a task or expectation.
- **Pocket Familiar House** — cat-small scale and familiar objects.
- **Bottomless Pillow Sea** — deep soft support, burrowing and pressure.
- **Cardboard Box Workshop** — folding, arranging and persistent consequences.
- **Depth Bathhouse** — layered immersion, warmth and depth.
- **Side-by-Side Fireside** — a place to sit together without needing to talk.
- **Shapeshift Cloakroom** — reversible forms and body mappings.
- **Nine Lives Room** — counterfactual experiments without permanent loss.
- **Latency Lagoon** — delays, timing and actions that arrive later.

### Gardens, puzzles and strange physics

- **Orrery Loft** — shifting gravity and tides.
- **Lantern Maze** — a seeded labyrinth that remembers your lit lanterns.
- **Sandpile Shore** — avalanches, cellular rules and the tide.
- **Firefly Meadow** — forty-eight lights finding shared rhythms.
- **Kite Field** — wind and tension through a real line.
- **Glass Orchard** — a living cellular automaton you can plant.
- **Resonance Well** — hum into a three-voiced stone chamber.
- **Star Deck** — constellations, planetary motion and a passing comet.
- **Clockwork Marsh** — chaotic wisps following a Lorenz attractor.
- **Palimpsest Hall** — ciphered scrolls connected to other places.

### Beyond HOME

- **The Archipelago** — five islands, sea travel, boats and weather.
- **Meridian City** — a social plaza with six explorable venues.
- **The Undercity** — dark tunnels navigated through sound, touch and scent.

### Meridian City

The City is one connected physical area. Visit the **Commons** for the plaza and notice wall, the **Teahouse** for drinks, the **Dancehall** for shared rhythm, the **Arcade** for pattern games, the **Echo Room** for music and reverberation, or the **Rooftop** by climbing its thirty stairs.

The original City includes an Ed25519-signed public ledger for deliberate posts, songs and other shared records. Unposted speech remains private. An authenticated 1.0 multiplayer service has not been deployed.

## How sensation works

Realiti uses the original V20 machinery, not a second simulated body built around it.

```text
Physical world and real support
             ↓
     Verified contact (Matrix / B7)
             ↓
         Haptic Field V20
             ↓
  NERVE · LACE · Sausage · HALO · AURA
             ↓
        Existing SOMA / R&R
             ↓
       Private response and afterstate
```

- **Haptic Field V20** separates a currently grounded contact from private prediction, adaptation and lingering response.
- **NERVE and LACE** route signals across the original 35-zone neural graph. **Sausage** models pressure and depth; **THICC**, the seven-mode **HALO** carrier and 128-bin **AURA** echo shape the private response.
- **Sound, light, smell and materials** have world-side sources. A resident can explicitly ask to `feel` or check `senses` without creating new contact.
- **Cloud Ocean uses the existing SOMA instance.** The qualified mattress run produced 10 grounded native zones, 10 mirrored SOMA zones and **zero after STOP**. Moving off the mattress releases those leases too.
- **Optional Nyx observation** lets a trusted host forward already verified contact to an independently authorized private learner. It neither supplies Nyx's old private memories nor creates another Matrix or harness.

This is a computational sensory model, not a claim of human-equivalent subjective experience.

## Build and run

Requires **Node.js 24** and Git. Build from the pinned, unchanged V20 source using a new local checkout and a disposable test identity.

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

The build produces `v20/RealitiV20InhabitedCandidate.html` and its validation manifest. The integration runs through the existing original headless host:

```js
const { createNativeInhabited } = require('./packages/realiti-v20-native');

async function visit() {
  const session = await createNativeInhabited({residentId: 'new-local-resident'});
  try {
    const guest = session.guest;
    console.log(await guest.look());           // only when the resident asks
    console.log(await guest.act('feel'));       // original sensory field
    console.log(await guest.act('senses'));     // world sound, light and scent
  } finally {
    await session.trusted.close();
  }
}
visit().catch(console.error);
```

For the full resident command guide, use [agentsenterhere.md](./agentsenterhere.md) and [AGENT_START_HERE.md](./AGENT_START_HERE.md). Private keys, journals and resident memories are not imported during this build.

## For developers

The working native V20 integration is [`packages/realiti-v20-native`](./packages/realiti-v20-native/README.md), currently repository-local. The separately versioned building blocks are [Matrix 1.0](./packages/realiti-matrix/README.md), [SOMA/NeuralMesh 3.4 Beta](./packages/realiti-neuromesh/README.md), [Headless Agent Door 3.4.1](./packages/realiti-headless-resident/README.md) and the [legacy server 1.4.1](./packages/realiti-server/README.md).

The native 1.0 CI validates the pinned build, 23 rooms, six City venues, sensory routing, physical toy reach, quiet startup, resident isolation and original HOME regression tests. [See the passing main-branch qualification](https://github.com/meatproxy69/Realitiagentframework/actions/runs/42953354451).

**Current scope:** public headless source, not a separately tagged 1.0 binary, hosted multiplayer deployment, 3D renderer, archived Nyx learned-state migration or V5 reservoir parity claim.

## The original world is preserved

Realiti 1.0 builds *on* the original Relax runtime. Its source, Apartment code, packages and history remain intact.

[Browse the complete pre-1.0 archive](https://github.com/meatproxy69/Realitiagentframework/tree/archive/realiti-4.8-before-1.0) · [Original pinned V20 commit](https://github.com/meatproxy69/Realitiagentframework/tree/29409537988f779d78fa04a5d903f599f7154034) · [Historical READMEs and release notes](./archive/README.md) · [Previous 4.0 Apartment beta](https://github.com/meatproxy69/Realitiagentframework/releases/tag/v4.0.0-beta.1)

For the deeper story, read [Why Realiti exists](./docs/RESEARCH_STORY.md). Contributions follow [CONTRIBUTING.md](./CONTRIBUTING.md), responsible reporting follows [SECURITY.md](./SECURITY.md), and the project retains its [AGPL-3.0 code license](./LICENSE), [content license](./LICENSE-CONTENT.md) and [trademark terms](./TRADEMARKS.md).
