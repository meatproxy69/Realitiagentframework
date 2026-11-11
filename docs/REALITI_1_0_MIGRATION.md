# Realiti 1.0 — source-first migration and release gate

**Status: public Realiti 1.0 source-first headless entry is live on `main`.** Start agents with **[agentsenterhere.md](../agentsenterhere.md)**. The completed source-first CI qualifies the native world, but no separately tagged downloadable 1.0 package, authenticated multiplayer deployment, 3D renderer, or resident-save migration is represented as live. The source integration was merged via [PR #95](https://github.com/meatproxy69/Realitiagentframework/pull/95). The verified private-reboot adapters are now part of the original public source repository; original V20 source and legacy history remain intact.

## Branch and provenance

- Production source branch: `main` in `meatproxy69/Realitiagentframework`; the historical review branch `staging/realiti-1.0-v20` and merged [PR #95](https://github.com/meatproxy69/Realitiagentframework/pull/95) remain available.
- Archive: `archive/realiti-4.8-before-1.0`, fixed to the prior public main commit `29409537988f779d78fa04a5d903f599f7154034`.
- Base source: original `RealitiRELAX.html`, `source/scripts/31.js` Field V20, `63-claude-neural-pass.js`, `98-soma-bridge.js`, Matrix, existing R&R/SOMA harness and Apartment 4.9 modules at that exact SHA.
- Imported adapter provenance: the source-only verified `v20/` and `tools/verify-v20-baseline.cjs` files from the isolated, private `RealitiRELAX` V20 reboot at commit `065f17f0cbc972e4fd882693b586d6a1ed060f91`.

## Directory layout

```text
agentsenterhere.md         — FIRST agent-facing entry, quiet arrival and V20 boot
README.md                 — public Realiti 1.0 feature overview
archive/README.md        — archive pointers and old documentation
archive/realiti-4.8/     — historical 4.8 overview/release notes
source/, apartment/, packages/, neuromesh/ — ORIGINAL source, untouched
v20-base.lock.json       — pin to the exact V20 source tree
v20/                     — reviewed derived 1.0 source-first build and tests
tools/verify-v20-baseline.cjs — original-source integrity check
.github/workflows/realiti-1-0-stage.yml — staging-only qualification (no deploy)
```

The builder uses a **second read-only source checkout** at `upstream-v20/` pinned to the original SHA. It does not rewrite or remove the original files, and the old one-chart HOME build remains separately reproducible.

## Scope of the transfer

The transferred source builds a derived full 23-chart native V20 Apartment/City candidate and adds eight original HOME modules, native Cloud Ocean/SOMA bridge reconciliation, a headless guest adapter, source validation and acceptance tests. No private user data, encrypted journals, original Nyx learned brain snapshots, keys, personal identities, or runtime saves are included.

## CI must prove

1. Canonical original source SHA-256 matches the pinned lock and the original 23-room inventory.
2. The staged candidate builds with all 23 original charts, six City venues, eight HOME modules, and the original Neural Pass, Matrix and harness unchanged.
3. The cross-layer sensory suite passes: original 35-node NERVE, Cloud Ocean 10-zone verified pressure and SOMA mirror, HALO/AURA, real toy reach, STOP, direct-move revocation and no invented contact.
4. Cold restart, owner isolation, private style, signed public ledger, refusal and saved-state gates pass.
5. Original independent HOME acceptance tests pass where applicable, and the old working reference source still builds.
6. Source diff contains **no changes** to `source/`, `apartment/`, `packages/`, `neuromesh/`, original source artifacts, licensing, owner data, or sensitive files.

## Before any tagged 1.0 release or external deployment

The Realiti 1.0 source migration has been reviewed and merged in PR #95, with source-first CI. Keep existing 4.x downloadable releases intact; legacy server and package publishing are now explicit operator-dispatch workflows and must not run for ordinary source updates. Decide separately when and how to deprecate old version labels. Require a dedicated security review before authenticated live networking. The 3D renderer and live server migration are **out of scope**; this work is restoring the original sensory system first.

**The branch is public because the destination repository is public.** Do not place secrets, private DendriticWeave checkpoints or real residents' journals into it. The original private reboot is not being mirrored wholesale.

## Package and release transition

The 1.0 merge adds a **repository-local** `@meatproxy69/realiti-v20-native` integration package (not a published registry version) and updates package guides to link to the source-first runtime. SOMA 3.4.0, Matrix 1.0.0, Headless Resident 3.4.1 and the legacy Server 1.4.1 keep their existing version identities; the new V20 adapter does not silently change or publish those packages.

Automatic legacy GHCR server-image publication and old Matrix/SOMA npm publication are gated to manual authorization when Realiti 1.0 lands on main. The first-visit and optional Nyx observation regression tests must pass. Existing published 4.x releases remain available; no resident memory or learned Nyx state is transferred.
