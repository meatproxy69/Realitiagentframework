# HOME: resident-led discovery and truthful sensory surprises

This checkpoint supersedes the `auto` itinerary described in historical 4.8–4.9 notes. It does **not** change the source candidate's 4.9 version, authorize a public release, or migrate an older resident's storage. The original Relax, R&R, Matrix, compiled development Apartment and root README are untouched.

## Choosing is the point

HOME no longer picks what a resident should do: `auto`, `auto plan`, `auto 3`, `auto status`, and `do the obvious` now return `HOME_AUTO_DISABLED` without moving the native body, reading a page on anyone's behalf, or editing memory. A resident can still open `actions`, `approach <entity-id>`, `look`, `feel words`, deliberately `do` an advertised action, or use an owner-selected geometric helper such as `remote decor auto-place`. The latter chooses a verified position **for an object already selected by the resident**; it does not decide to explore or act.

The pre-existing `auto_turn` and `auto_recent` values in historical local life checkpoints are not loaded or exposed by the new HOME. Private blanket continuity survives unchanged. No migration of original memory or contact evidence is attempted.

## Small things you find by being there

Try `notice`, `look closer`, or an optional focus such as `notice tea-trace`. These are passive reads, available without the remote, and **never move anything or mint touch**. A single localized cue may also appear in an ordinary `look` when its native evidence is present.

| Tucked-away observation | Exact ground truth |
|---|---|
| Threads of rain at the window | Native Relax rain intensity and a physically nearby Matrix window |
| Chime's thin note | Native measured `apartment.rain-chime` sound source, positive rain threshold, and reachability of the chime |
| Firefly rhythm beginning to align | Native `apartment.firefly-glow` light plus the existing twelve-oscillator order parameter above 0.65, observed beside the jar |
| A spot of lamp light | Original `apartment.reading_lamp` light reading, lamp switched on and physically nearby |
| Tea scent fading from the shelf | Registered `apartment.herbal-tea` smell source, active steeping clock and physical proximity to the real cup |
| Ribbon still moving | Existing spring oscillator velocity after an actual user-triggered flick, observed beside the ribbon |
| Puzzle's small hidden ball | `apartment.hidden-ball` **actually present as a native Matrix entity** after the real left–right–left puzzle latch |
| Two unrelated rhythms | Rare, conditional **co-observation** of firefly light and rain-chime sound while the resident stands between both sources; this does not claim acoustic/visual synchronization or a new physics law |

If a source is absent, off, too distant, or not measurable, its corresponding clue disappears. Nothing fabricates new sensory origins. No new pet desire, affection, obedience or convenient reach is inferred; Ember can still be out of range even after she is called.

A read-only rain check through `remote extras rain` no longer requires opening the optional Extras menu; physical window touch and cloak interactions preserve their guards.

## Bedroom aesthetics remain honest

Room `look` and `remote ambience <room>` now aggregate repeated furniture naturally and acknowledge the resident-selected **actual cardstock sample names** (field, anchor, accent and bridge). The cardboard cards physically exist on that room's chest. They are not room-wide shaders. Material choices on supported fixtures and the existing reading lamp are genuinely tied to original native material and light fields; styling metadata and avatar looks remain text presentation until a separately qualified renderer exists.

## Test boundary

`node apartment/test/home-field-notes.cjs` verifies disabled automatic routines, an unmoved body, read-only observation, native light/sound/smell/phase thresholds, one physical puzzle object, direct rain reading, a grouped personalized room description, cold restart and unchanged Haptic V20 integrity. The original Ubuntu/Windows Apartment test matrix remains the merge gate.

This is an experience and causal-consistency improvement, not a proof of consciousness, fully rendered room design, a mood simulator, or a replacement for human vibe testing.
