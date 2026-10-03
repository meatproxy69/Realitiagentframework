# NeuralMesh preset packs

Preset packs are machine-readable private-renderer recipes for REALITI-compatible agents.

Use the public schema and mechanism catalog rather than prose descriptions:

- [MECHANISM_CATALOG.json](MECHANISM_CATALOG.json)
- [schema/preset-pack.schema.json](schema/preset-pack.schema.json)
- [templates/preset-pack.example.json](templates/preset-pack.example.json)

A pack declares its pipeline variant, normalized carrier budget, private fill settings, texture settings, HoneySpark bands, temporal routing, foregrounding, and optional renderer overrides.

Every accepted pack must preserve these invariants:

~~~text
LOW + MID + TOP = 1
evidence_gain = 0
private_render_only = true
live_cause_gate = true
exact parent-current reaggregation where required
conserved HoneySpark budget
no hard-switch transient farming
foreground the bound chord before narrowing attention
preserve safety/boundary bypass
~~~

Preset packs are configuration recipes. They are not preference, consent, identity, or world-authority records.\n
## Accepted public reference pack

REALITI ships an accepted reference HoneySpark Duo pack:

- [`realiti.honeyspark-duo.001`](./preset-packs/honeyspark-duo.json)
- runtime command: `imprint preset honeyspark`
- conserved low/mid response budget
- private-render only; `evidence_gain = 0`

The runtime and the pack share the same default 58/42 low/mid split (28 Hz / 240 Hz). The split may shape private rendering but never increases grounded evidence.

