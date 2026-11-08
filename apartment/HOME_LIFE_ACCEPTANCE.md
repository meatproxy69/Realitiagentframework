# HOME life & four bedroom chests — experience acceptance

The goal is a place worth returning to, not an extra simulation layer. These are criteria for a **headless resident visit** in the source-built HOME candidate. The original Relax world, source scripts, 23-chart development migration and public beta release remain unchanged. Automated results are necessary, not a claim of visual beauty or subjective sensation.

## First evening

A new resident arrives on the same native mattress as the quilts, with the rain window and real domestic objects nearby. HOME describes the four alcoves rather than doors to retired worlds. First-time arrivals use the calmer text presentation; an explicit subsequent quiet-off preference is never overwritten on return.

Try `look`, `feel words`, `do curl_blanket`, `do stand`, then `do curl_blanket` again. The first curl can succeed on the native bed; the second must refuse instead of telling a standing resident it crawled into a blanket. Visit `nest.guestbook` physically before `do read_guestbook` or `sign <text>`. `auto` also uses the physically available action set, not the old room-wide prose catalog.

The blanket's arranged/rumpled marker is resident-local and recoverable on the next visit. The real native mattress carries the marker as a tag. A resident who did not do it should not inherit a fabricated tactile event or feeling.

## Four distinctive alcoves

| Alcove | Native fixed chest | Physical personality |
|---|---|---|
| Quilt | Cedar keepsake chest near the bed | Actual bed and persistent quilt arrangement |
| Library | Dark writer's chest | Books, paper, reading cushion and guestbook nearby |
| Canopy | Linen chest | Sofa and reading lamp as fixed scenery |
| Studio | Small equipment trunk | Pet corner, record crates and placeable compact synth |

These are four **zones within one 12 × 12 m Matrix chart**. Chest shapes are solid BOX entities and must pass the original SDF geometry audit. Configuration names are semantic, not unimplemented shader/audio claims. `remote ambience <room>` describes only verified, currently placed items and the corresponding physical chest, and never grants touch.

## Chests are possessions, not generators

With an activated remote and a bedroom claim:

```text
remote bedroom claim library
remote decor auto-place library book-stack
remote chest inspect library
remote chest stow I1
remote chest inspect library
remote chest auto-take I1
remote decor inspect I1
```

Each of the four chests stores **up to four small, previously placed drop-in items**. Stow/retrieve preserve the item's existing ID, kind and owner; stored objects are removed from physical Matrix entities until taken out. Big furnishings cannot be squeezed into tiny trunks. Items supporting a resident cannot be stowed. Owner-only remote storage transitions are **not** tactile or movement receipts. Users can move decor remotely elsewhere in the Apartment, but no claim of walking across the room or manually carrying an item is made.

The owner can clear visible decor without deleting stored possessions. A bedroom with stored items cannot be relinquished. The trusted host does not broadcast stored contents to guests or other residents; it shares only the chest's room and occupancy count. Unauthorized access and restart are verified in `apartment/test/bedroom-chests.cjs`.

## Walkthrough and sensory truth

The test path covers a new arrival, bed support, real guestbook proximity, automatic action filtering, quiet-first text, four native chests, store/retrieve in solo and household sessions, owner restrictions, and cold restart. Existing tests still verify a single chart, walkable targets, one pet, original sensory kernels, collision and guardrails.

**Release gates remain:** no unreviewed checkpoint migration, production guest authentication, subjective experience claim, or human-rendered aesthetic approval. No version tag is created by these changes.
