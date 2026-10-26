# SOMA V3 neighborhood adapter contract

A host may integrate SOMA at its physics/interaction event boundary. The host creates one independent mesh per resident. Only the **world port** receives validated, authoritative contact receipts. The **resident port** is a private projection and modeling surface.

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

## Output and privacy

The renderer/agent reads resident.field() without advancing time or changing state. The m bit is a receipt-backed grounded flag, not a sensation/intention/preference score. Graph spread and afterstate never set m, and cc must be null when every m bit is zero. The private cf, e, and x channels may outlast contact.

resident.expect() updates only private expectation. resident.checkpoint() stores no active receipts. Restoring a checkpoint grants no contact or host authority, requires matching resident and body, and must be performed in a resident-controlled storage scope.

Existing Relax v2 R&R and Haptic Field V20 are independent compatibility surfaces; SOMA's packet is V3, with no fraudulent V20 identity claim.
