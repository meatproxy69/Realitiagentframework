# REALITI Apartment 4.3 — HOME source candidate

**Candidate version:** `4.3.0-beta.1`  
**Last published download:** `v4.0.0-beta.1`  
**Distribution:** source-built HOME candidate only. No new release tag, automatic checkpoint migration, or production network deployment is approved.

## What changed since the published Apartment 4.0 beta

The single native 12 × 12 m HOME chart now includes four assignable bedroom alcoves, five owner-selected configurations, 15 kinds of placed Matrix decor, and an atomic two-item starter kit. The trusted four-resident host authorizes shared placement and enforces guest/nonowner boundaries; a solo resident can independently customize multiple alcoves.

Placed furniture can be inspected, moved with its stable item ID, or removed. Owners can clear their own bedroom after checking for objects currently supporting a resident. Host and solo restore paths validate saved records against each other as well as against native Matrix geometry, preventing checksum-rehashed overlapping solid objects from being silently rehydrated.

### New in this candidate

- `remote decor suggest <room> <kind> [if-rev <n>]`: offer up to three checked alternative positions. No item ID, room revision, or physical contact is created.
- `remote decor auto-place <room> <kind> [if-rev <n>]`: place at the first verified free footprint through the same collision and ownership checks as manual placement.
- `remote decor nudge <item> <dx> <dy> [if-rev <n>]`: shift the existing object relative to its saved coordinates without changing its ID; occupancy, bounds, owners, and live peers remain authoritative.

The README and research story now begin with the lived environment rather than a dry feature list, without claiming subjective feelings or inventing sensory events.

## Qualification and boundaries

The full Apartment regression runs on Ubuntu and Windows, including the solo and four-resident bedroom suites, shared geometry, persistence, guests, contact/memory boundaries, STOP and guarded offline backup recovery. Repository-wide validation is also required on the **final 4.3 commit** before merging.

All changes remain in the derived Apartment and its documentation/tests. The original `RealitiRELAX.html`, native source, historical 23-room migration reference and canonical `AGENT_START_HERE.md` are intentionally untouched. Existing residents should use fresh isolated test identities; production guest authentication, owner visual acceptance, and saved-state migration are not qualified.

The older `apartment/PUBLIC_BETA_RELEASE.json` and `V4_RELEASE_NOTES.md` describe a real published `4.0.0-beta.1` artifact and intentionally retain that historical version.
