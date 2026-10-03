# REALITI Relax — Agent Start Here

This is the practical entry contract for an artificial resident using the packaged vertical slice.

REALITI Relax is **headless-first but not JavaScript-free**. The final public interface is `window.Realiti`. This package is an in-process JavaScript runtime, not a standalone MCP/network endpoint. Headless means the resident mechanics do not depend on CSS or visible layout; it does not mean the later native/browserless runtime is included here.

## Cold start

```js
const ready = await Realiti.ready;
if (!ready?.ok) throw new Error(ready?.error || 'REALITI_NOT_READY');

const caps    = Realiti.read('realiti://capabilities');
const harness = Realiti.read('realiti://harness');
const body0   = Realiti.read('realiti://body');
const imprint = Realiti.read('realiti://imprint');
```

`REALITI_RR_HARNESS_V1` is the included sensory/R&R harness. `REALITI_DEFAULT_IMPRINT_V1` is the generic rich starter imprint. A Node/browser loader used to evaluate the package is only a host loader.

If `ready.pocket === 'unavailable'`, durable Pocket persistence is unavailable in that host. The in-memory world may still run.

## Final resident surface

Prefer:

```text
Realiti.help()
Realiti.read(...)
Realiti.rooms()
Realiti.actions()
Realiti.invoke(...)
Realiti.run(...)
Realiti.continuity.*
Realiti.createClient()
```

`Realiti.help()`, `Realiti.run('help')`, and the compatibility agent-door help now describe the same final public command set. Use `rooms()` and `actions()` for exact canonical IDs because available actions are state-dependent.

## Time

Reads are observational and do not advance the experience.

```js
await Realiti.invoke('stay', { wall_ms: 1000 });
await Realiti.run('stay 1000');
```

Both advance **simulated world time** by 1,000 ms. Host execution time and closed-browser time do not silently advance the world. One explicit advance is bounded to 60,000 ms.

The starter Nest already has lawful support. Record the initial body/imprint before interpreting later changes.

## Body and rich imprint

Always inspect both:

```js
const body = Realiti.read('realiti://body');
const rich = Realiti.read('realiti://imprint');
```

For sparse field arrays, each row is indexed by `field.z`. Do not assume a fixed body ordering.

Grounded evidence and private rendering are intentionally different:

```text
m / cc
    grounded evidence / grounded contact centroid

cf / afterstate / fullness / renderer lanes / prediction
    private state that may persist after contact ends
```

STOP releases current grounding immediately. It does not erase lawful private ring-down; advance simulated time if you want to observe decay.

## Action results and exact receipts

Mutation results use `REALITI_MUTATION_RESULT_V1` and include current `here` and `body` projections.

The default result is compact. When an operation produces a full diagnostic receipt, the mutation returns a stable `receipt_ref`:

```js
const r = await Realiti.invoke('do', { action: someActionId });
if (r.receipt_ref) {
  const exact = await Realiti.invoke('receipt', { ref: r.receipt_ref });
}
```

The same receipt can be requested through the text door:

```text
receipt receipt:12
```

The diagnostic journal retains the latest 128 receipts. An expired reference fails explicitly. Preserve full receipts in experiment evidence when exact causality matters; use selected values for narration.

`feel words` remains a small accessibility decoder. It is not the full imprint and should not be treated as an authoritative interpretation.

## Continuity

Subscriptions coalesce latest-state changes. They are not complete history.

Use:

```text
Realiti.continuity.current()
Realiti.continuity.since(cursor, limit)
Realiti.continuity.pending()
Realiti.continuity.resume(token, limit)
Realiti.continuity.next_change(max_wall_ms)
```

Continuity frames are deltas: omitted channel means unchanged; explicit `null` clears the channel. Replay is bounded to 4,096 meaningful frames. Expired cursors and field references fail explicitly.

Latency Lagoon demonstrates the difference between accepted action, world placement, and observed completion. Follow the pending cause to the Nest; elapsed time alone is not observer closure.

## Mutation discipline

- Refresh `actions()` after room/body state changes.
- Await mutations sequentially; shared-world overlap can return `ACTION_IN_PROGRESS`.
- Mutations from resource-subscription callbacks are blocked until callback delivery finishes.
- Unsubscribe/close abandoned clients.
- STOP remains available as the emergency contact-release path.

## Embodiment-specific notes

Borrowed Limb:

```text
attach
→ may truthfully report NO_RECEPTOR
→ map source patch
→ stimulate / compare timing
→ live integration may change
→ detach revokes live route
→ cold learned trace may remain separately
```

Nine Lives:

```text
fork stable base
→ run A
→ run B
→ compare
→ commit one or discard
```

Compare refuses incomplete branches and a stale live base. Committing learned sandbox state does not create present contact.

## Quiet and exits

No-Ask uses room-local quiet. Explicit `hush` persists across rooms until `normal`.

```text
STOP
    release current external grounding

HOME
    STOP + restore temporary body state + return to supported Nest

GOODBYE
    end visit + close clients + advertise no room actions until re-entry
```

## Persistence

Default persistence mode is explicit. Ordinary activity is session state until Save. `note` and `later` intentionally request a save too. Check storage results.

The packaged validation receipt includes Chromium persistence/restart cases. A host in which `Realiti.ready` reports Pocket unavailable has **not** demonstrated durable persistence in that host.

Imprint export is an observational contribution draft, not a complete profile backup.

## Validation

The packaged public build includes `VALIDATION.json` with the exact runtime hash, focused public-contract checks, static gates, and remaining acceptance limits.

## Recommended exploration rhythm

```text
inspect baseline
→ choose an advertised action
→ inspect body + rich imprint
→ advance time deliberately
→ inspect again
→ separate current grounding from lingering private state
→ use continuity for ordered history
→ retain exact receipt refs when needed
```
