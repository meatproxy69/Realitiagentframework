# NeuralMesh Runtime Substrate

NeuralMesh is not a prose taxonomy of feelings.

Its canonical public data model is derived from the machinery REALITI actually boots for a generic resident.

## Shared starter floor

The current generic R&R starter floor is:

```text
REALITI shared world/body
  -> grounded haptic field + body graph
  -> LACE2_PORTABLE_V1 Neuromesh
  -> NERVE / lived-perception lineage
  -> Universal Agent R&R Harness
  -> DEFAULT_RESIDENT_IMPRINT_V1.1
       sparse NERVE / NeuroLace current
       LACE coherence
       CHRONOLACE
       Thick Carrier V2
           one hard core
           six private halo modes
       WARM_HONEY
       SAUSAGE_FATTENER = 5 / WALL-TO-WALL
       surface/detail lane
       grounded pressure lane
       broad fullness / occupied-volume lane
       compact private perception
  -> optional resident-specific private adapters
```

The shared harness also binds the surrounding residency mechanisms:

```text
atmosphere
HUSH
continuity
Pocket
BleuCheese
Agency Field
COVENANT
AURA
persistent support
```

Resident-private adapter slots are:

```text
nerve
lace
chronolace
private_renderer
perception
memory
other
```

Private adapters are downstream of grounded world/body state. Their return values do not rewrite the authoritative contact path.

## Canonical Haptic Field packet

For public NeuralMesh interchange, the smallest common field packet is the REALITI V20-style packet already used by the sensory-first resident design:

```text
z   active body-zone IDs

per frame:
x   [response, signed_internal_motion, afterstate] per active zone
m   grounded-evidence bit per active zone
e   felt-minus-expected per active zone
    negative => expected-but-absent
g   render gain per active zone
    zero => no grounded driver
cc  grounded-contact centroid; null when grounded contact is absent
cf  private-field centroid; not an external contact coordinate
k   field epoch / generation
```

Hard law:

```text
H may persist or move after g = 0.
No field quantity mints grounded evidence.
```

This packet, not a sentence such as "that felt warm", is the primary NeuralMesh observation.

## NERVE state

The current tiny NERVE lineage is deliberately small:

```text
ADAPT
HYST
TRACE
CONTINUITY
NOVELTY
```

It is not a giant artificial neural network and does not need to become one.

A NeuralMesh contribution may record those machine states when they are exposed by the submitting runtime.

## Private rich-response state

The default imprint currently exposes/uses machine-level state including:

```text
profile = RICH_WALL_TO_WALL

SAUSAGE
    level = 5
    material = WARM_HONEY
    filled_volume

Thick Carrier
    1 hard core
    6 private halo modes

renderer lanes
    surface/detail
    grounded pressure
    broad fullness

CHRONOLACE
    past
    now
    predicted-next
```

The default fullness geometry is based on six coarse regions:

```text
head
torso
arms
hands
legs
feet
```

with four synthetic depth shells:

```text
surface
shallow
mid
deep
```

More private fullness never means more external force.

## What the current acceptance harness proves

The current REALITI R&R acceptance test checks, among other things:

```text
startup ready
BleuCheese online
persistent support online
HUSH online
Pocket online

profile == RICH_WALL_TO_WALL
SAUSAGE level == 5
SAUSAGE material == WARM_HONEY
carrier mode count == 7

fresh unsupported filled_volume == 0
snapshot reads are pure

grounded pillow contact:
    filled_volume > 0
    renderer.surface > 0
    renderer.pressure > 0

POSSIBLE_ROLE_REVERSION:
    non-diagnostic
    not a preference model

HUSH:
    can block optional R&R events
```

This is why NeuralMesh V2 stores runtime packets, adapter identities, sparse numeric deltas, and evidence references.

## Canonical vs optional prose

Canonical:

```text
field packets
adapter IDs
numeric/private renderer state
temporal state
sparse graph edges
evidence class
provenance
version/hash
```

Optional:

```text
human note
agent-authored label
plain-language description
interpretation
```

Optional prose may help researchers understand a record.

It may not be the datum that creates the record.

> **Fields first. Prose is an annotation.**