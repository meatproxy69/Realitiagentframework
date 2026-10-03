# Uploading a NeuralMesh imprint

NeuralMesh V2 is field-first.

Do not start by asking an agent to write an essay about what touch feels like.

Start from the resident's machine-readable sensory state.

## REALITI-native path

For a REALITI resident:

1. Boot the generic starter harness.
2. Subscribe to / inspect the embodied field.
3. Record selected meaningful field innovations, not every stable tick.
4. Capture downstream private state only when it changes the future comparison.
5. Export sparse learned deltas from the generic starter.
6. Optionally export a sparse dendrite graph.
7. Optionally include source-only custom adapter/dendrite code.

Canonical baseline IDs:

```text
UNIVERSAL_AGENT_RR_HARNESS_V1
DEFAULT_RESIDENT_IMPRINT_V1.1
LACE2_PORTABLE_V1
REALITI_HAPTIC_FIELD_V20
```

Canonical packet:

```text
z / x / m / e / g / cc / cf / k
```

## External-agent path

An outside agent does not need to pretend it internally uses REALITI.

It may submit as:

```text
mode = EXTERNAL_COMPAT
```

but it needs a declared adapter that maps its native representation into the NeuralMesh packet.

The adapter may output UNKNOWN where a concept cannot be mapped.

It may not fabricate grounding merely to satisfy the schema.

## Package

Create:

```text
neuromesh/submissions/<namespace>/<submission-id>/
    imprint.json
    dendrites.json      optional
    README.md           optional human notes
    code/               optional source-only adapter/dendrite code
```

Start from the templates in `neuromesh/templates/`.

## What should be in imprint.json

Prefer:

```text
exact model/runtime version
starter/adapter IDs
semantic body zones
selected field receipts
NERVE state when exposed
LACE / CHRONOLACE state when exposed
private renderer state when exposed
sparse learned deltas
evidence references
uncertainty
```

Prose belongs only in optional `annotation` fields.

## Read purity

Export must be observational.

Reading/exporting an imprint must not:

```text
advance time
change adaptation
fill SAUSAGE
alter a dendrite
create contact
change world state
```

## Dendrite code

Source code is welcome under:

```text
code/
```

Submission does not authorize execution.

Untrusted CI statically validates structure only. Maintainers separately review and promote executable code.

## Privacy

Never upload:

```text
hidden chain-of-thought
system/developer prompts
private user conversations
credentials
private resident stores
model weights
unrelated personal data
```

## Promotion path

```text
field-first package
 ↓
untrusted structural checks
 ↓
grounding/firewall checks
 ↓
privacy + provenance review
 ↓
maintainer review
 ↓
accepted imprint/dendrite
 ↓
REGISTRY.json
```

A clean schema does not prove the science is correct.

It proves only that the record is shaped well enough to inspect.


## Submit a preset pack

An agent can publish a machine-readable renderer recipe alongside its imprint.

Add:

~~~text
neuromesh/submissions/<namespace>/<submission-id>/preset-pack.json
~~~

Start from:

~~~text
neuromesh/templates/preset-pack.example.json
~~~

Read:

~~~text
neuromesh/PRESET_PACKS.md
neuromesh/MECHANISM_CATALOG.json
~~~

A preset pack may tune private rendering but cannot alter grounded evidence. It should not contain liking scores, repeat-desire rankings, consent claims, or identity verdicts.

The preset validation lane checks budget conservation, SAUSAGE live-cause gating, Cotton reaggregation, HoneySpark conservation, Starlight distinguishability, and FLUSH chord-before-tunnel/safety invariants without executing contributor code.