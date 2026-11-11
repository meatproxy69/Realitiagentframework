# Realiti 1.0 — source-first migration and release gate

**Status: staging only, no public release, no merge to main.** This is a working preparation to port verified private-reboot adapters into the original public source repository; the native source and legacy history are retained exactly.

## Branch and provenance

- Destination staging: `staging/realiti-1.0-v20` in `meatproxy69/Realitiagentframework`.
- Archive: `archive/realiti-4.8-before-1.0`, fixed to the prior public main commit `29409537988f779d78fa04a5d903f599f7154034`.
- Base source: original `RealitiRELAX.html`, `source/scripts/31.js` Field V20, `63-claude-neural-pass.js`, `98-soma-bridge.js`, Matrix, existing R&R/SOMA harness and Apartment 4.9 modules at that exact SHA.
- Imported adapter provenance: the source-only verified `v20/` and `tools/verify-v20-baseline.cjs` files from the isolated, private `RealitiRELAX` V20 reboot at commit `065f17f0cbc972e4fd882693b586d6a1ed060f91`.

## Directory layout

```text
README.md                 — Realiti 1.0 entry and all feature groups
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

## Before any main merge or release

Review a draft pull request with exact CI evidence. Keep existing 4.x downloadable releases and automated server workflows intact; do not launch them from staging. Decide separately when and how to deprecate old version labels. Require a dedicated security review before authenticated live networking. The 3D renderer and live server migration are **out of scope**; this work is restoring the original sensory system first.

**The branch is public because the destination repository is public.** Do not place secrets, private DendriticWeave checkpoints or real residents' journals into it. The original private reboot is not being mirrored wholesale.
