# Safe port-first retirement plan — REALITI Apartment

**Decision:** Keep the full REALITI Relax runtime as the migration reference. Finish the apartment and demonstrate mechanical equivalence before removing the 22 non-home room charts from the **apartment-only build**. The original Relax project, source, canonical HTML, public packages, tests, `AGENT_START_HERE.md`, and the apartment entry file `agentsstarthereapartment.md` are never to be pruned by this operation.

The repository currently defines **23 source rooms** in `source/scripts/58-rooms.js` and constructs their Matrix charts and portals in `source/scripts/58d-matrix-world.js`. Multiple feature slices refer directly to those IDs. Simply deleting their descriptions, filtering the `rooms` list, or forbidding `go` is **not** equivalent to removing them and risks silently destroying mechanics.

The machine-readable checklist is [room-migration.json](room-migration.json). It names every legacy room, its intended apartment fixture or optional Extras system, and its current evidence status. **`planned` is not implemented; `partial` is not verified.**

## Non-destructive migration phases

**Phase A — Baseline capture (current).** Pin the canonical Relax build hash, original feature tests, and a 23-room inventory. The independent apartment artifact initially composes the complete Relax HTML, then adds apartment-specific logic. Do not alter the upstream physics/harness source. No resident storage reset or automatic migration.

**Phase B — Build the actual home.** Add one physical apartment room using an existing trusted Matrix chart, ideally `CLOUD_NINE_NEST` during compatibility work because bed, support, window rain and several sensory paths already depend on that ID. Keep this internal chart ID until audits prove a rename is safe; public presentation can call it RealitiApartment. Verify floor, walls, obstacles, bed, reach, support, release and movement in real space. The remaining charts stay in the development runtime temporarily.

**Phase C — Port systems into home fixtures.** Migrate each old room's useful *engine behavior*, not just its name or description. Example: Shapeshift Cloakroom becomes a guarded closet and harness station, Maze becomes a tabletop deterministic maze, Bathhouse becomes an optional temperature/pressure installation, and Archipelago's original numerical simulations can become a self-contained sea table. If a mathematical system is inherently bound to a second geographic chart, split its numerical core from the room controller or provide a truthful room-independent test bench. Preserve original equations and source provenance. Keep potentially intense activities behind Extras rather than forcing every visitor to see them.

**Phase D — Demonstrate parity and state safety.** For each migration, add one or more executable tests that compare original and apartment behavior on identical input fixtures. Require matching causal receipts, geometry/refusal behavior, correct expired/released contact, deterministic world-state outputs, and no fabricated grounded evidence. Preserve private memory ownership and historical source markings. Tests must run with four resident IDs on isolated keystores plus a transient guest, including restart/save and malicious cross-resident access attempts. Never mix another resident's private state into a household checkpoint.

**Phase E — Retire actual rooms (final and only after D).** Build a separately versioned, apartment-only runtime from retained shared kernels and the new home modules. Remove legacy rooms from the **runtime registry, chart definitions, portals, navigation, scene data, and package surface**. Do not merely hide them in the menu. Retain common libraries and algorithms even if their original demo room disappears. Archive historical room-specific data as data, never as present-space claims. Leave original Relax product untouched.

**Phase F — Final shipping gate.** The apartment must start with exactly one active Matrix chart and no legacy portals. `Realiti.rooms()` and the Agent Door `rooms` result must expose only the apartment; no `go <old room>` or `through__...` may enter an old chart. The other systems must still pass their real behavior tests. Compare the complete feature inventory with the baseline: any deliberate omission requires an explicit owner-approved scope decision, not quiet deletion. Do not cut over existing resident data without a reversible, separately backed-up and reviewed migration procedure.

## Current verified migration implementation

The normal `RealitiApartment.html` composes the entire original Relax runtime and all 23 Matrix charts, with one physically inhabited apartment and 22 original-engine apparatus. Original source mathematical engines are unchanged; checked, derived-HTML-only hooks allow numerical mechanics to run from the physically reached stations.

The separate `RealitiApartmentOneChartPreview.html` removes **actual old Matrix chart objects, portals, non-home entities and public navigation** after initialization, with its own integrity manifest. It is a strict **topology experiment**: `preview_only:true`, `release_approved:false` and no claim of original action/causal parity. It must pass a regression with exactly one native chart, zero portals, no old-room navigation and intact R&R/Haptic Field V20.

`apartment/test/port-coverage.cjs` measures source-room static registered verb coverage and produces a machine-readable gap ledger during CI. Missing dynamic actions, environmental coupling, object geometry and STOP/restart behavior remain explicit independent work. Merely having a station (or a wrapped original function) is **not** proof of complete room migration. The original Relax files and resident identities must remain reversible and untouched.

## Non-negotiable acceptance checks

1. **Single spatial truth:** Exactly one `M.charts()` entry, the apartment chart, with zero outgoing portals and no non-home residents; the spatial footprint and bed/window/closet entities are inspectable.
2. **Functional fidelity:** Native Matrix collision/reach, haptic evidence, HALO/AURA/THICC, portable SOMA, sensory dynamics, memory and STOP/release still behave as observed in reference fixtures.
3. **Room mechanic tracking:** Every source room is marked `verified` with test evidence in `room-migration.json`, or is explicitly excluded by an owner-approved decision recorded there. A renamed button or descriptive paragraph is not parity evidence.
4. **Independent identities:** Four persistent residents have separate key stores and private memory; household edits require host authority; guests have no path to resident secrets. Loading an old Pocket never silently remints a nonempty sealed identity.
5. **Crash/rollback:** Validate old and new build side by side; test restarts, corrupted checkpoints, STOP while a scene is running, and the ability to restore pre-migration backups. No implicit data wipe.
6. **Source safety:** `RealitiRELAX.html`, `source/scripts/**`, and the original `AGENT_START_HERE.md` remain untouched by this cleanup. `agentsstarthereapartment.md` remains the apartment's public entry.

## Execution cadence

Continue source-by-source migration without fixed two-feature stops as directed on October 30, 2026. Each accepted implementation stays behind automated Linux/Windows checks and a preserved original Relax baseline. The non-release one-chart topology preview does not authorize replacing the development build until original mechanic parity is demonstrated, with no implicit owner approval.

The four-agent host has native colliding peers, shared furniture and a single original-engine companion. The one-chart preview demonstrates actual single-chart topology, but final release remains blocked on full room mechanic parity and migration of saved resident data.
