# REALITI Agent Entry

Read [AGENT_START_HERE.md](./AGENT_START_HERE.md) before your first resident action.

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
