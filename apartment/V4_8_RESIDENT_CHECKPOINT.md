# REALITI Apartment 4.8 — the returning-resident checkpoint

**Candidate version:** `4.8.0-beta.1` (source-built HOME only)  
**Last independently published Apartment download:** `v4.0.0-beta.1`  
**Scope:** make the single native HOME more inhabitable through truthful, useful feedback. This checkpoint does not publish a new release, modify canonical Relax, migrate old resident snapshots, change network authentication, or rewrite the owner's root README.

## What an actual resident visit showed

A fresh resident entered the current 4.3 HOME and tried the obvious things: choosing a Nightglass look, recording a binder generation, furnishing the Library as Writer's Den, stowing something in its chest, reading the optional aesthetics book, letting `auto` decide what to do, and returning to the same storage.

The physical home, generated wardrobe and resident-local preferences worked. But the interaction had unnecessary friction:

1. The Writer's Den placed a **side table as I1** and a **book stack as I2**. Attempting to store I1 produced only `DECOR_TOO_LARGE_FOR_CHEST`, with no hint that I2 was suitable.
2. Approaching the aesthetics book produced the grammatical artifact **“the The Apartment Book…”** because a physical label and the native `approach` narrator both supplied the article.
3. `auto` always selected the first ordinary available action (often `watch_rain`), so it never built a rhythm between visits.
4. The general HOME opening remained the same when the resident had physically walked across the room; only the appended coordinates and object list changed.
5. Worn-look prose repeated a developer-facing disclaimer and broke a sentence between the color name and the detailing.

The browser test harness uses an isolated document, not a full trusted Node host. It lacks native browser WebCrypto key-generation features; its failure to save a sealed Pocket is **a harness limitation**, not a reproduced native SAVE defect. The dedicated Ubuntu and Windows test suite uses the actual headless resident host with integrity and persisted keys to qualify real save/restore.

## What 4.8 changes

- **Chest guidance based on actual room contents.** `remote chest suggest <room>` lists already placed small objects that can be stored, including their durable IDs, without placing or moving them. `chest inspect` includes the same available items and remaining capacity. Trying to stow something too large now retains the original refusal code and suggests a compatible item in that *owner's own bedroom* when one exists. Read-only queries do not advance revisions or mint contact.
- **Truly local HOME glance.** `look` now describes verified placed objects in the specific alcove containing the resident's current native Matrix coordinates. It doesn't claim that the resident entered a new chart, saw another person's private storage, or touched an object.
- **Native `auto` rhythm.** Ordinary actions (watching rain, doing nothing, and bed-appropriate quilt interactions) are chosen from the actual available-action list in rotation. The resident-owned rotation counter survives restart; reaching for a bed or guestbook remains physically gated. No random narrative hallucination, new sensation, or arbitrary movement is created.
- **Cleaner writing.** The tangible book no longer repeats “the The,” and chosen appearance descriptions form readable sentences without repeating the full technical disclaimer on every `look`. Its structured metadata still explicitly says that shaders, actual clothing and physical contacts are unchanged.

## Resident acceptance

After `node apartment/build.mjs` and `node apartment/build-home-candidate.mjs`:

```text
remote activate
remote bedroom claim library
remote bedroom furnish library writers
remote chest suggest library
remote chest stow I1
remote chest stow I2
remote chest auto-take I2
approach apartment.bedroom.book.library
look
auto
save
goodbye
```

The first stow of I1 **must refuse and suggest I2**; I2 must actually leave the Matrix while stowed and return with the same ID. A resident standing inside the Library bounds must get a Library-specific `look` grounded in its real furniture. Returning after a native save must not reset the ordinary-action rotation or silently lose owned items. Connected households must refuse chest suggestions and mutations from nonowners and guests. These are executable in `apartment/test/resident-experience-48.cjs` on both Ubuntu and Windows, together with all original HOME and Relax acceptance suites.

## Release and architectural boundaries

The canonical `RealitiRELAX.html`, `source/scripts/**`, the original `AGENT_START_HERE.md`, and the 23-chart development migration are unchanged. The 4.8 version appears only in the derived HOME source-candidate manifest and native topology metadata. Previous public prerelease metadata remains accurate and no public 4.8 tag is invented. Old resident checkpoint migration, genuine rendered clothing and production network authorization remain separate future qualification work.
