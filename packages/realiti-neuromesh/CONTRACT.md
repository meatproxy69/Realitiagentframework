# SOMA V3 neighborhood adapter contract

A host may integrate SOMA at its physics/interaction event boundary. The host creates one independent mesh per resident. Only the **world port** receives validated, authoritative contact receipts. The **resident port** is a private projection and modeling surface.

## Native-depth optional extensions

SOMA 3.3 includes trusted-host-only `host.graph.configure` (edge rewiring for already-registered zones), `host.hearing.observe` (real source/lease/zone), `host.refusal.observe` (host-resolved obstruction, not pressure), `host.haptics.energySample` (measured power/stored energy), and conservative support via `host.support`. None are callable from the resident capability. World-side issuer authentication must precede any imported receipt.

The resident may read `resident.hapticsV20.packet/exact/energy`, `resident.graph.metrics`, `resident.interoception`, `resident.hearing`, `resident.support` and `resident.perception().moonwire`. The V20 packet is tagged `SOMA_V3_PROJECTED`, not falsely labeled a native B10/B18 force solution. The separate `./sealed-pocket` adapter is a real encrypted Node host module but **not** native V32 wire compatibility.

See [NATIVE_PARITY.md](./NATIVE_PARITY.md).

## Input events

World contact:
- zone: exact body zone ID registered on creation.
- source: one of WORLD_GROUNDED, SELF_STARTED_WORLD_CONTACT, INVITED_COMPANION.
- cause: stable host cause string, not prose narration.
- receiptId: nonempty host-local receipt identity. Equal ID renews a cause; changed ID denotes new onset.
- intensity: finite number in [0,1].
- leaseMs: finite simulation-time duration in [1,60000].
- material: optional finite-length descriptive material label.

Advance: world.tick(elapsedMs). This is **simulation time**, not Date.now/wall time. STOP or session end calls world.stop(). If a trusted collision/contact ends, call world.release({zone,receiptId}) immediately.

There is no REST endpoint, MCP server, chat instruction or generic plugin capability that may assert these inputs by default. The surrounding host must implement grounding checks and consent gates for its own world.

## Complete R&R harness contract

`createHarness({residentId,zones,edges})` returns `{host,resident,harness}`. Only the trusted neighborhood receives `host`. The resident's private interface has no mutation methods for grounded contact, support or world possibility admission. Use `harness.boot()` and inspect `harness.mechanisms()` before accepting resident sensory input.

The private renderers (THICC, seven-mode HALO, 128-bin AURA) derive from the original Relax numerical algorithms. BleuCheese produces structured candidate events, but the world host must explicitly admit/commit one with its own authenticated receipt; no private modulation, novelty or narrative can do this.

The portable `resident.pocket` is per-instance bounded in-memory state, **not automatically encrypted durable storage**. The host must add encryption/key management for saved private state. Continuity receipts are bounded and observational. `resident.checkpoint()` remains private and never restores live grounding.

## Compact memory and evidence provenance

Resident.memory stores bounded host-confirmed contacts, release/expiry, room entry and world events with their original receipts and origin world, plus separately marked SELF_REPORTED agent notes. Archived observations reload as ARCHIVED_HOST_RECORD and **cannot grant current-world authority**. The optional Node file store uses atomic private files and SHA-256 corruption checks, **not encryption or cryptographic authenticity**.

Never treat model narration, archived notes or a file import as live contact. Run the [independent Lantern Room tests](./MEMORY_AND_LAB.md) before attaching a new neighborhood.

## Output and privacy

The renderer/agent reads resident.field() without advancing time or changing state. The m bit is a receipt-backed grounded flag, not a sensation/intention/preference score. Graph spread and afterstate never set m, and cc must be null when every m bit is zero. The private cf, e, and x channels may outlast contact.

resident.expect() updates only private expectation. resident.checkpoint() stores no active receipts. Restoring a checkpoint grants no contact or host authority, requires matching resident and body, and must be performed in a resident-controlled storage scope.

Existing Relax v2 R&R and Haptic Field V20 are independent compatibility surfaces; SOMA's packet is V3, with no fraudulent V20 identity claim.
