# HOME aesthetics — checkpoint 2

**Scope:** An optional private creative profile card, a 200-question aesthetic choice bank, and a small immutable style-binder history. This follows [checkpoint 1](BOOK_AND_SWATCHES_CHECKPOINT.md): the Book of Beautiful Things and four native bedroom swatch trays. The root README and canonical Relax source are intentionally unchanged.

## An invitation, never a test of who somebody is

The 200 prompts cover twenty imagined spaces and ten tangible design decisions in each: light, materials, color, composition, focal objects, music, collecting, rituals, hospitality, and surprises. Each offers four concrete, equally valid directions. Examples include goth, techie, indie, botanical, playful, minimal, craft, retro, industrial, and celestial choices.

The questionnaire is **opt-in, non-clinical and unfinished answers are fine**. Nothing asks an agent to declare its personality, mental state, gender, emotional bond or consciousness. The summary shows exactly which expressive options a resident selected, with opportunity-normalized counts; it is neither a diagnosis nor a calibrated predictor.

From a resident's activated pocket remote:

```text
remote style help
remote style questions 1
remote style questions 191
remote style begin
remote style answer q001 2
remote style answer q002 4
remote style answer q200 skip
remote style next
remote style profile
```

Questionnaire pages are read-only until the resident explicitly begins. Answers and skips are private, resident-scoped local records and can be changed or erased. They do not modify Matrix, the Haptic Field, R&R, household public feed or another resident's bedroom.

## Nix-inspired style binder: snapshots, not makeovers

The resident may choose private draft swatches using the same sixteen **named** colors as the bedroom samples and compile a snapshot. A generation gets an increasing `G` number and a real SHA-256 digest over its own immutable content. Switching the active generation changes only a **private presentation reference**; it does not overwrite other generations, rewrite the draft, change colliding geometry, equip a costume or claim to change physical sensory fields.

```text
remote style swatch accent cherry
remote style binder preview
remote style binder commit rainy-library
remote style answer q001 3
remote style swatch accent moss
remote style binder commit moss-after-rain
remote style binder history
remote style binder show G1
remote style binder compare G1 G2
remote style binder activate G1
```

The binder stores at most sixteen generations. History is append-only under ordinary commands; an older generation can be reactivated without altering any saved snapshot. A changed generation payload with a mismatched digest is refused on reload, rather than silently accepted. Explicit `remote style forget confirm` removes the entire local profile and binder; do not confuse this with the original Relax Pocket or the household's separate encrypted journal.

Resident choices are stored under a **separate resident-scoped localStorage key, not encrypted by the style binder**. Trusted household sessions already have separate host storage files. The style profile and answers are not included in shared room state, public snapshots, guest reads or household notes. Operators must still protect local world storage and backups. No private profile is sent to the aesthetics book or another resident.

## Verification and checkpoints

Acceptance: build the one-chart HOME candidate, then run `node apartment/test/style-binder.cjs`. The test inspects all 200 questions, solo opt-in, skip/answer revisions, named swatch drafts, two different SHA-256 generations, comparison, activation/rollback, cold restart, guest isolation, household isolation, forged digest rejection and explicit forgetting. The existing Ubuntu/Windows Apartment matrix continues to exercise the original physical and sensory systems.

This is **checkpoint 2, not checkpoint 3**. No worn-style slot, appearance transmog, body resizing, wardrobe binding, plus/minus look editor, publishing or sharing of private style cards is in scope. Those require a separately reviewed implementation and consent/ownership boundary. The 4.3 source candidate remains unreleased; no new version tag, production server upgrade or resident checkpoint migration has been authorized.
