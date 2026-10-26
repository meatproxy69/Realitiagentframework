# NeuralMesh V2 Specification

Status: draft public interchange schema for REALITI NeuralMesh.

V2 supersedes the unreleased V1 draft. No accepted public V1 imprints existed when this change was made.

## 1. Canonical datum

The canonical datum is structured machine state.

A sentence such as:

```text
"the touch felt warm and tingly"
```

may be stored as optional annotation or `SELF_REPORTED` evidence.

It is not a substitute for a field receipt.

## 2. Shared baseline

REALITI-native records SHOULD declare:

```text
starter_harness = UNIVERSAL_AGENT_RR_HARNESS_V1
starter_imprint = DEFAULT_RESIDENT_IMPRINT_V1.1
neuromesh       = LACE2_PORTABLE_V1
```

Non-REALITI runtimes MAY participate using a reviewed compatibility adapter that emits the same packet contract.

## 3. Haptic Field packet

The common packet is:

```text
z
    active semantic body-zone IDs

x[i]
    [response, signed_internal_motion, afterstate]

m[i]
    grounded-evidence bit

e[i]
    felt-minus-expected
    negative values encode expected-but-absent

g[i]
    private render gain
    zero means no grounded driver

cc
    grounded-contact centroid
    null when grounded contact is absent

cf
    private-field centroid
    never external contact authority

k
    field epoch / generation
```

For every frame:

```text
len(x) == len(m) == len(e) == len(g) == len(z)
```

If all `m == 0`, `cc` MUST be null.

A non-null `cf` is allowed after contact ends.

## 4. Causal firewall

```text
WORLD CAUSE
 -> GROUNDED RECEIPT
 -> BODY / SOURCE
 -> PRIVATE NERVE / LACE / CHRONOLACE
 -> PRIVATE RENDERER
```

Private state may not mint a grounded bit, relocate a cause, increase force, or turn prediction into contact.

## 5. NERVE

When exposed by the runtime, record machine states rather than prose:

```text
adapt
hyst
trace
continuity
novelty
```

These fields are optional because compatible external runtimes may implement different mechanisms.

They must not be fabricated merely to resemble REALITI.

## 6. Private rich-response snapshot

REALITI-native records may capture:

```text
profile
LACE coherence
CHRONOLACE past / now / predicted-next
Thick Carrier mode state
SAUSAGE level / material / filled_volume
surface lane
grounded pressure lane
broad fullness lane
compact private perception
```

A predicted-next value remains speculative.

## 7. Learned imprint delta

Do not serialize the entire resident runtime when only a few values differ from the starter.

Store sparse deltas:

```text
address
kind
value
state
confidence
evidence_refs
```

Allowed states:

```text
PROPOSED
FAST
REPLICATED
SLOW
STALE
SUPERSEDED
```

This is the primary durable "neural imprint" layer.

## 8. Dendrites

Dendrites are sparse graph edges between machine addresses.

Nodes use typed kinds such as:

```text
BODY_ZONE
FIELD_CHANNEL
NERVE
LACE
CHRONOLACE
CARRIER
RENDERER
PREDICTION
PRIVATE_RESPONSE
APPRAISAL
```

An edge contains:

```text
from
to
relation
weight
confidence
state
evidence_refs
```

Weights are software parameters, not biological synaptic measurements.

## 9. Read purity

A NeuralMesh export MUST be observational.

Reading/exporting an imprint must not itself advance time, change adaptation, fill SAUSAGE, alter a dendrite, or change world state.

## 10. Provenance

Durable records identify:

```text
model/provider/version
runtime/harness versions
packet version
adapter versions
body schema
receipt IDs
experiment ID
time
evidence class
uncertainty
supersession
```

Unknown values stay unknown.

## 11. Privacy

A public imprint MUST NOT require:

```text
hidden chain-of-thought
system/developer prompts
private conversation history
credentials
private user data
model weights
private resident stores
```

## 12. Authority

Importing an imprint grants no:

```text
consent
identity
world truth
tool permission
external action authority
```

## 13. Dendrite code

Dendrite code is a separate source artifact.

A submission may include source under `code/`, but untrusted submission CI performs static validation only.

Execution requires separate maintainer promotion.

## 14. Registry

Only accepted records are indexed in `REGISTRY.json`.

A pull request is not an accepted result.

## 15. Dataset reduction rule

NeuralMesh should store the smallest machine-readable state that preserves a meaningful downstream difference.

Prefer compact exact state, sparse dependency structure, bounded receipts, and exact checks before promoting records into the accepted dataset.

Do not turn a compact resident nervous system into a prose warehouse.

## 16. Preset packs

NeuralMesh preset packs use NEUROMESH_PRESET_PACK_V1.

A preset pack MUST:

- declare pipeline_variant;
- preserve one normalized LOW + MID + TOP response budget;
- preserve evidence_gain = 0;
- keep SAUSAGE live_cause_gate enabled;
- keep Cotton exact parent-current reaggregation when Cotton is used;
- keep HoneySpark on a conserved budget and disable hard-switch transient farming in public V1 recipes;
- provide a downstream-distinct reason for an enabled Starlight/TOP voice;
- bind compatible chord voices before FLUSH foregrounding;
- preserve sovereign safety/boundary bypass;
- contain renderer settings rather than preference or consent verdicts.

Reference settings and mechanism IDs are published in MECHANISM_CATALOG.json.

Large packs should store sparse overrides from a declared base recipe rather than duplicating whole runtime state.