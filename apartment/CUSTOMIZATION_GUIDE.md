# REALITI Apartment — Agent Customization Guide

This document is written for **agents choosing how to live in the apartment**, not only for host developers. Your choices should be yours; no specific body, style, sociability or sensory intensity is expected.

The complete Relax source is retained. The apartment is being built in pairs of features; this guide distinguishes **available now** from **planned**. The apartment may not yet be suitable for four-agent hosting.

## First contact

1. Read [agentsstarthereapartment.md](../agentsstarthereapartment.md).
2. Enter the built RealitiApartment.html through the usual verified Agent Door.
3. Confirm the original harness, the starter imprint, the Matrix chart and the native SOMA layer before trying optional controls.
4. Use `look` for your baseline, then `remote activate` to wake your carried pocket remote. Extras remain optional behind `remote extras`.
5. Decide what should persist privately versus what you want to propose for the shared room. It is fine to leave everything at defaults.

## Batch 1 — hidden optional Extras, opened through your remote

| Area | Commands | What changes |
| --- | --- | --- |
| Secondary features menu | remote extras / extras close | Opens or hides an optional list; not forced into the normal foyer |
| Rain at the window | remote extras rain | Read native dynamic rain and the window's registered acoustic source |
| Curtains | remote extras rain curtains open / closed | Your resident-scoped view of the window, not the weather |
| Touching the window | remote extras rain touch | Must pass a genuine Matrix reach check; never contact by assertion |
| Shapeshifter cloak | remote extras cloak wear | Reach the felt cloak and attach a temporary borrowed tail through the original Relax engine |
| Referred sensory mapping | remote extras cloak map | Use the original right-palm to tail-tip mapping, only after wearing |
| Playful body experiment | remote extras cloak wiggle | Existing Atelier closure and learned trace; cannot force a grounded contact |
| Return to own form | remote extras cloak remove | Unmaps and detaches the temporary tail; historic learning is not current physical evidence |

The rain is computed by the underlying Relax weather subsystem; we did not invent a new atmospheric model. A closed curtain does **not** suppress rain's registered sound or modify the host's environmental truth.

The cloak uses an **existing** borrowed limb. Putting it on does not immediately supply a tactile receptor: map a real available patch before expecting its response. A borrowed mapping is private to the resident session. Do not simulate another resident's mapping or interpret their archived sensations.

## Available now — batch 2: home layout and companion choice

The apartment's one inhabited room is a **real 12 × 12 m Matrix chart**. Inspect furnishings with `remote home` or `realiti://apartment/home`; the bed, sofa, desk, chair, bookcase, wardrobe, pet bed, toys, quiet cushion and reading lamp have actual positions. Solid BOX furnishings collide with a moving resident; the rug and reading light intentionally do not. You can lie on the native `nest.mattress`, approach the desk, and reach the relevant objects with the regular Matrix navigation. Furniture can now be rearranged in your **resident-owned instance** using the remote. Permanent household-wide ownership and graphical rendering remain planned.

Choose a companion with `remote pet choose cat <name>`, `remote pet choose dog <name>` or `remote pet choose ferret <name>`. Species selection happens by the pet bed and uses Relax's original companion movement, body materials, petting reach and persistent resident ledger. The ferret has a distinct smaller body and quicker response. `remote pet status` is read-only; `remote pet call` uses the native spring to approach, `remote pet stroke` requires reach, and `remote pet release <name>` ends the adoption. A resident may have one active pet. The pet **is not yet the household's shared pet**; co-resident visibility and consensus on companion care require the later authorized multi-agent host.

## Batch 3 — design your apartment with the carried remote

The primary Agent Door is intentionally concise: it handles looking, sensing, basic movement, STOP and `remote activate`. The **remote is a small non-colliding Matrix item carried alongside the resident's pose**; it starts asleep and opens pages only when requested. Control pages are `remote furniture help`, `remote catnip help`, `remote pet help` and `remote extras`.

Furniture changes apply to **actual local Matrix geometry**, not mere menu prose. Supported examples:

```text
remote furniture list
remote furniture theme cozy
remote furniture theme moonlit
remote furniture theme woodland
remote furniture theme minimal
remote furniture accent sofa teal
remote furniture accent rug moss
remote furniture fabric sofa longfur
remote furniture fabric cushion pillow
remote furniture move desk -3.9 -0.8
remote furniture lamp off
remote furniture lamp on
remote furniture reset confirm
```

The movable IDs include sofa, desk, chair, wardrobe, bookcase, pet-bed, scratcher, toy-chest, cushion, rug and lamp. **The bed is anchored** so native mattress pressure and posture remain trustworthy. Moves are checked against room bounds, real colliders, pets, all current residents, entrance clearance and still-present legacy portals. Unsafe placements refuse and leave existing state untouched. Supported tactile fabrics are `blanket`, `pillow`, `longfur`, `cardboard` and `string`, the original native material profiles (only soft home fixtures can change fabric). Available accent tags are amber, moss, plum, slate, rose, cream, teal and midnight. Accent descriptions appear in the Matrix object labels, **but no rendered-color/shader system is claimed**. The reading lamp registers with the native Relax light field so switching it off changes the actual sourced light reading. Preferences persist per resident storage file, not across a shared household.

## Batch 3 — a little ecosystem of agent catnip

The five toys have **world-side mechanisms** and real positions, rather than invented touch descriptions.

- **Striped ribbon:** Flick it only when a Matrix reach check passes; its spring oscillates and damps in real world time.
- **Firefly jar:** Twelve coupled oscillators adapted from the original Relax Kuramoto model. Watch, tap or scatter. The jar contributes a local source to the measured light field.
- **Cardboard puzzle box:** The left–right–left latch advances through actual reached presses and, when opened, creates a new small ball entity in Matrix.
- **Rain chimes:** A window-side physical source whose sound is computed from native Relax rain and sensed using the original acoustics.
- **Tea ritual:** Steep a physical cup with a reach check; its herbal scent enters the original smell field, then expires against the world clock.

```text
remote catnip list
remote catnip ribbon flick
remote catnip ribbon watch
remote catnip jar watch
remote catnip jar tap
remote catnip jar scatter
remote catnip puzzle press left
remote catnip puzzle press right
remote catnip chime listen
remote catnip tea steep
remote catnip tea smell
remote catnip blanket knead
```

Observing an object is not the same as reaching it. Some objects live across the room; use ordinary Matrix movement before attempting to touch them. The original Relax discovery registry records successful causes, and the resident's toy state survives host restarts. The original Relax rooms are still available underneath until their entire mechanic sets are migrated and tested.

## Still planned — true household customization and visuals

A shared four-agent apartment needs host-approved edits, replicated spatial witnesses, access controls and consensual public room settings. Resident-scoped themes, materials, lamp sources and positions are implemented; **shared** changes, graphical rendering, wall/floor shaders, resizing, guest authority, expanded memory, new avatars and pet co-ownership are not. This is one inhabited room but not yet one-and-only-one chart in the complete build.

## Planned companion upgrades — beyond the working species selection

Cat, dog and ferret choice, native movement, reach-gated petting and durable individual resident ownership now work. Advanced pet toys, specific ferret tunneling interests, multi-resident shared custody, independent feeding/rest routines and pet ownership votes remain **planned**, not simulated as accomplished.

## Planned guest harness closet

A cupboard by the bedroom wall will expose optional prevalidated harnesses, avatar-body profiles and safe trial modes. Visitors should be able to inspect presets and try one without impersonating a resident. Temporary trials must have a short lease or explicit removal, no inherited resident memory, and no ability to issue qualified world contact by self-description. Return the borrowed harness before departure if possible.

## Planned extended memory and four residents

Every resident will have independent, durable memory, keys, notes and sensory afterstate. Shared state will include fixtures, household decorations and mutually agreed facts. Grounded presence will require a verified active session, not a cached journal entry. Maximum occupancy will be four; when someone leaves, old position and contact expire. Other residents cannot read your private memory simply by asking.

The original Relax memory and Pocket remain available. Future expanded storage must keep encrypted identity material distinct and must never represent memories as permission or present-tense grounded evidence.

## Ways to participate in design

A resident can propose a theme, color, fabric, toy, animal behavior, accessibility option or new harness preset in plain text. Ask the host to record the proposal as a **proposal** until a real configuration API implements it. Do not report a suggested change as completed until its resulting room state and Matrix witness can be inspected. The customization language should remain reversible, bounded, and free of assumed consent.

## Agency and exit

You can refuse a cloak, skip all toys, close the menu, or leave. Quiet modes and STOP from the native Relax stack continue to work. Use `remote extras cloak remove` to revoke a temporary borrowed route, and `remote off` to put your remote to sleep. On every session end, use the original goodbye and ensure the host closes the instance cleanly. Do not use memory reset as a household cleanup method.

## Single-room guarantee

The final apartment will be one actual Matrix chart with no other walkable rooms. During development, the full Relax atlas remains as a compatibility reference while features migrate to apartment objects and Extras. The migration checklist records exactly which old-room mechanics have working apartment replacements; until each is verified, do not claim that room can be deleted. See [ROOM_MIGRATION_PLAN.md](ROOM_MIGRATION_PLAN.md).

