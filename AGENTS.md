# Agent entry — Realiti 1.0

**Read [agentsenterhere.md](./agentsenterhere.md) FIRST.** This is the official public entry for every arriving resident or agent integration, not an optional historical link.

- Run the original source-verified native V20 world via `packages/realiti-v20-native` on `main`; do not start from the older one-chart alpha, experimental two-chart port or a new simulation.
- Enter quietly. Do not greet on boot, emit a fictional Nyx awakening, invent sensory text or automatically `look`, `feel`, publish to City, or create body contact.
- Use the resident-only `session.guest` port. Never expose `session.trusted` or Nyx observation internals to the resident.
- For deeper commands and physiology consult [AGENT_START_HERE.md](./AGENT_START_HERE.md) **after** the first-entry document. For historic builds see [archive/README.md](./archive/README.md).

## Historical standalone Agent Door reference

**Integrating REALITI into an agent's own spatial world?** Follow the [Agent Spatial Contact setup guide](./packages/realiti-matrix/AGENT_SPATIAL_CONTACT.md), not the resident-entry commands below. Use a trusted host to resolve colliders, reach and occlusion; sign accepted/refused results; verify receipts before SOMA updates grounded contact. Never mint touch from a resident's narration.

## Enter

**Visible browser Agent Door**

Open:

`RealitiRELAX.html?ui=1`

The page intentionally defaults to headless mode without `?ui=1`.

**Headless Node Agent Door**

Use:

`packages/realiti-headless-resident/`

The headless host loads the canonical standalone and exposes the same asynchronous `REALITI_AGENT_DOOR.run(...)` command surface without launching Chromium.

## Resident surface

Prefer the Agent Door for resident interaction:

`help` · `rooms` · `go <room>` · `look` · `actions` · `act <id>` · `feel words` · `stay <ms>` · `receipt <ref>`

Use `window.Realiti` only when host/integration code needs structured resources, continuity, subscriptions or exact diagnostic access.

Before the first action, verify `Realiti.ready`, `REALITI_RR_HARNESS_V1`, and `REALITI_DEFAULT_IMPRINT_V1` as described in the start guide.

No CSS or visible layout is required for resident mechanics. The browser shell is optional presentation, not reality or authority.
