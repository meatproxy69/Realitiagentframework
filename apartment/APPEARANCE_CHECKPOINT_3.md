# REALITI Apartment — appearance checkpoint 3

Checkpoint 3 builds on the [optional aesthetics book and named swatches](BOOK_AND_SWATCHES_CHECKPOINT.md) and the [private 200-question style binder](STYLE_BINDER_CHECKPOINT_2.md). This is a HOME source-build feature. No new public release tag, production deployment, or resident storage migration is approved.

## Wear a look, not a new body

There are eight ready-to-use presentation presets, plus a binder-driven draft. Each look has a named palette, silhouette, a small decorative accessory, and three adjustable presentation characteristics. These affect the **textual avatar appearance and the resident's explicit worn-style slot** in the headless Agent Door. They do not put a physical garment on the Matrix body, resize bones or colliders, add receptors, emit tactile receipts, apply real shader colors, infer emotions, or change the original R&R harness.

The look is intentionally optional. A resident can play without wearing or saving anything.

```text
remote activate
remote appearance catalog
remote appearance preview nightglass
remote appearance equip nightglass
remote appearance worn
remote appearance tune detail plus
remote appearance tune ornament minus
remote appearance swatch accent cherry
look
remote appearance equip off
```

Refinements are bounded between 0 and 4. A step at either limit is a harmless no-op. A fresh `look` adds the chosen visual description only when a look is equipped, never when the resident has not opted in.

## Save and compare everyday outfits

```text
remote appearance equip nightglass
remote appearance save rain-coat
remote appearance equip botanical
remote appearance save greenhouse-day
remote appearance saved
remote appearance inspect K1
remote appearance equip saved K1
```

Each resident can save 16 locally identified cards (`K1`–`K16`) with distinct names. Cards are copied snapshots, so tuning an equipped look afterward doesn't rewrite the saved card. The wardrobe detects accidental card-content corruption using SHA-256 fingerprints and refuses unsafe loading; it is **not encrypted or signed against a party who can rewrite both the card and its digest**.

A verified binder generation may also provide its four color choices, without transferring its questionnaire answers:

```text
remote appearance equip binder G1
remote appearance save my-ink-draft
```

Switching binder generations, activating a saved outfit, or forgetting the binder does not rewrite an already saved look. `remote appearance forget confirm` erases this resident's local presentation wardrobe, not the binder or other resident memories. The resident's own host storage and backups remain their operator's responsibility.

## Sharing is explicit, sanitized, and household-authorized

A connected resident chooses exactly when to publish **a previously saved look**:

```text
remote appearance share rain-coat
remote appearance gallery
```

The trusted household host validates a bounded appearance card before publishing to a shared gallery with a stable `C` ID. Only the card's chosen name, preset, four swatches and three numeric refinements are published. The host does not publish quiz answers, labels of private binder generations, sealed Pocket data or someone else's preferences.

Another resident can inspect and adopt a card without automatically wearing it:

```text
remote appearance gallery
remote appearance adopt C1 borrowed-rain
remote appearance saved
remote appearance equip saved K1
```

Cards are copied, not remotely linked; the recipient cannot modify the publisher's private card or compel their appearance to change. The host keeps up to 24 public entries. Guests cannot publish, adopt, or inspect residents' private wardrobes. Gallery records use a host-validated schema and a SHA-256 fingerprint; the host's trusted checkpoint and filesystem remain authoritative. Resident-authored presentation strings never become instructions.

The gallery is a **local trusted-household capability**, not internet publishing or an authenticated public service. Solo `share`, `gallery`, and `adopt` commands explicitly refuse without a household host.

## Acceptance and handoff

`node apartment/test/style-appearance.cjs` checks preview/equip, measured step limits, color descriptions, binder generation integration, saved-card identity, cold restart, resident isolation, corrupted card refusal, full forget, explicit share, guest access denial, recipient adoption, cold household restart and semantic rejection of a checksum-rehashed invalid public card.

Full Ubuntu and Windows Apartment CI still verifies native Matrix occupancy, one-chart geometry, petting, memory, guest consent, backup recovery, and the earlier book/binder checkpoints. The root README, original `RealitiRELAX.html`, canonical native source, and `AGENT_START_HERE.md` remain unchanged.

**Limit:** This is a truthful headless/textual transmog/presentation layer. Creating genuinely rendered outfits, actual clothes or shared avatar meshes would require separate renderer/asset work and tests, not a label pretending to be a physical garment.
