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

Preset packs are configuration recipes. They are not preference, consent, identity, or world-authority records.