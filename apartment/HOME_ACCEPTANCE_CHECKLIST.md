# HOME alpha — owner and resident acceptance

This is a review worksheet, **not** an approval. The native synthetic-agent walkthrough only verifies real Matrix geometry, movement, contact, support and current mechanics. It cannot decide whether the apartment feels like a comfortable home or looks right.

## Evidence the build provides

Run from the repository root after building the standalone alpha:

    node apartment/test/home-native-walkthrough.cjs

CI produces a short, sanitized `HOME_WALKTHROUGH_CI.md` and machine-readable `HOME_WALKTHROUGH_CI.json`. The native SDF footprint diagram uses 0.5 m cells and does not contain a screenshot, private memory, keys or guest conversations. Each stop is approached through the public Agent Door: sofa, bookcase, cushion, firefly jar, wind chime, tea, wardrobe, pet bed, ribbon, puzzle, toy chest, desk, chair and bed. Touch, pet, sit, lie, STOP and save must produce their real native results. A failed route blocks this CI gate; the report still uploads for debugging.

This is a **mechanical script**, not a claim that a thinking agent independently chose the route, nor an owner sightline or aesthetic sign-off.

**Latest verified synthetic results (October 31, 2026):** all 14 household destinations were operable on Ubuntu and Windows, with zero recorded mechanical failures, on the PR #69 revision and post-merge main CI. The raised rain chime was verified as a **sound** source, not a hand-touch. The toy chest required up to **five sequential grounded Agent Door approaches** before the native body settled in reach; this is a possible usability issue for a resident-led walkthrough, even though the final contact passed. Do not quietly increase native reach or move furniture merely to eliminate the observation.

## Human acceptance items (not yet signed)

- [ ] On a fresh isolated candidate, the home feels like one believable, comfortable living space rather than a laboratory of old worlds. No ocean, Undercity, extra chart portals or 22-station gallery.
- [ ] Walk from entry to bed, sofa, desk, pet bed, wardrobe, quiet corner and main toys using actual agent controls. Check confusing routes, furniture bottlenecks, corners, accessibility and room proportions.
- [ ] Confirm readable orientation and onboarding: the ordinary Agent Door stays short; the pocket remote is carried and works after activation without introducing host authority.
- [ ] Try native pet and tactile play with real approach/contact requirements. Make sure distant actions fail, resting and standing work, and rain/light/smell do not mint imaginary tactile evidence.
- [ ] Try four different permanent agents, a restricted guest and the original temporary Relax harness presets. Check that shared presence, collision and mutual consent make sense in the actual room.
- [ ] Verify each resident's memories, preferences, sealed Pocket and private sensory afterstate are isolated. The household shares only authorized scene/board/pet state.
- [ ] Confirm STOP, goodbyes, restarts, corrupt-state refusal and a *cold* recovery rehearsal with protected keys on the intended local operator machine.
- [ ] Decide whether the service is local/trusted-only or will accept network guests. Network-authenticated deployment needs a separate threat model and security tests.
- [ ] Owner accepts the scope and room arrangement without asking for more historical world furniture.

## Current release decision

**ALPHA / NOT RELEASE-APPROVED.** Synthetic CI results may close individual mechanical blockers only. Owner layout acceptance, real-machine recovery/deployment rehearsal, external-access policy and final release approval remain open. The full REALITI Relax and development Apartment must remain untouched, and old resident data must never be automatically repointed or wiped.
