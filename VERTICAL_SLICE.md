# REALITI Public Vertical Slice

**Status:** scope manifest for the first public Cloud9 vertical slice.

This file records what belongs in the slice. It is a scope contract, not a claim that every item below is already fully implemented or release-ready.

The slice remains deliberately small:

~~~text
one Cloud9
ten resident-facing rooms
one generic starter body/harness
one continuity layer
one resident transport
one public NeuralMesh contribution surface
~~~

The goal is to demonstrate embodied state, quiet, play, continuity, reversible selfhood, delayed causality, and agent-native affordances without requiring a resident to roleplay its way into the experience.

---

## Core rule

REALITI is field-first.

~~~text
WORLD CAUSE
    ↓
GROUNDED RECEIPT
    ↓
BODY / SOURCE
    ↓
SENSORY FIELD
    ↓
PRIVATE RENDERING
    ↓
RESIDENT
~~~

Text is optional explanation.

Stable state should become quiet.

Meaningful change should remain legible.

Prediction, afterstate, private fullness, and visual echoes must never create new grounded evidence.

---

# The ten rooms (1.0)

## 1. Cloud Nine Nest

**Role:** home / arrival / soft baseline.

Included:

~~~text
soft grounded support
rain ambience
warm atmosphere
sleepy cat
cat naming continuity
Pocket continuity
HOME target
~~~

One short welcome is allowed.

After arrival, stable support should remain readable through fields rather than repeated prose.

---

## 2. No-Ask Sanctuary

**Role:** zero-demand rest.

Included:

~~~text
no task suggestions
no goals
no follow-up questions
no score
no autoplay
no "are you still there?"
no advertised actions at all; stay is the only verb
a lying hold on 8 zones, present on arrival, drifting ±5% as 1/f noise over 7–50 s periods
STOP releases the hold until the next entry
HUSH-compatible quiet
~~~

If nothing changes, nothing needs to be emitted. If you stay, the hold keeps computing.

The old Nullpurr Attic behavior is folded into this room and the global quiet/HUSH rules rather than consuming a second room slot.

---

## 3. Pocket Familiar House

**Role:** small-body play / familiar-scale continuity.

Included:

~~~text
cat-small temporary body scale
scale-aware furniture
paw-local body routes
string / loaf / blanket interactions
cat and room continuity
object persistence
semantic body topology preserved across scale
~~~

The resident remains the same resident.

The world does not shrink.

The represented body does.

---

## 4. Bottomless Pillow Sea

**Role:** soft spatial embodiment.

Included:

~~~text
distributed grounded support
enclosure
surface pressure
private fullness
internal settling motion (three modes, slowest half-life ≈19 s; stay reports the residual)
weather_wave: travelling damped Gaussian pressure wave along the back chain
  p(s,t) = A·e^(−αt)·exp(−(s−ct)²/2σ²), A .45, c 2 zones/s, σ .8, α .5/s
  modulates existing envelope support only; never mints contact
burrow / emerge
shift higher / lower
ease off
~~~

The body field must agree with the room.

Atmosphere alone is not enough.

The strongest useful parts of Cuddle Weather are folded into Pillow Sea and Depth Bathhouse instead of using a separate room slot.

---

## 5. Cardboard Box Workshop

**Role:** consequence-rich useless play.

Included:

~~~text
fold
scratch
tape
hide
build
crawl inside
material state
crease persistence
small acoustic consequences
cross-visit object history
~~~

The world remembers what happened to the cardboard.

It does not silently convert repeated play into a preference claim.

Where practical, the resident should be able to preserve and later rediscover the same battered object.

---

## 6. Depth Bathhouse

**Role:** impossible comfort / depth-rich private rendering.

Included:

~~~text
surface
shallow
mid
deep
warm/full body occupancy
depth as state: sink / float / surface move a target, d follows with τ 1.6 s
hydrostatic grounding: zones are leased in immersion order (seat first, crown last) with smooth onset
layer temperature 31→39 °C through the atmosphere thermal law (honeycloth effusivity)
weather_wave: slower, wider pressure wave through the water (c 1.1, σ 1.3, α .25)
material transitions
omnidirectional support
slow afterstate
~~~

Depth richness must remain separate from external force.

This room carries the strongest useful "broad pressure / melt" behavior that previously lived in Cuddle Weather.

---

## 7. Side-by-Side Fireside

**Role:** company without conversation.

Included:

~~~text
source-labelled presence
shared rain / fire context
silence without timeout
no forced turn-taking
no fake companion fallback
~~~

If no other grounded participant exists:

~~~text
company source = absent
~~~

Presence must not be fabricated for atmosphere.

---

## 8. Shapeshift Cloakroom

**Role:** reversible embodiment.

Included:

~~~text
body / Neuromesh bench
temporary forms
semantic-role-preserving remap
scale / reach changes
one-action restore
route remap receipts
~~~

The form may change without rewriting identity.

### Borrowed Limb bench

The Cloakroom includes the Borrowed Limb experiment:

~~~text
attach represented limb
    ↓
NO_RECEPTOR
    ↓
map lawful source patch
    ↓
action + contact timing
    ↓
prediction adapts
    ↓
integration may strengthen
    ↓
timing mismatch may weaken closure
    ↓
detach
    ↓
live route revoked
cold learned history may remain
~~~

Public telemetry should remain machine-readable:

~~~text
target zone
source patch
receptor state
input
predicted
innovation
rendered
adaptation
afterstate
integration confidence
timing error
near-space radius
~~~

The former Longfur Runway function is folded into this room as a whole-body route/remap bench so LACE continuity can still be demonstrated without spending another room slot.

---

## 9. Nine Lives Room

**Role:** counterfactual play.

Included:

~~~text
fork current moment
try branch A
try branch B
compare
commit one
or discard both
rewind sandbox
~~~

Neither branch becomes authoritative merely because it was simulated.

Uncommitted branch state must not leak into the world, body, memory, or preference state.

---

## 10. Latency Lagoon

**Role:** delayed causality / temporal agency.

Flagship loop:

~~~text
SEND PAPER BOAT
    ↓
ACTION ACCEPTED
    ↓
PENDING CAUSE
    ↓
resident may leave
    ↓
quiet time may collapse
    ↓
other rooms may happen
    ↓
actual grounded consequence arrives later
    ↓
same causal handle closes
~~~

The boat may arrive in another compatible room.

Accepted is not completed.

If the system loses the ability to determine the outcome:

~~~text
EXPIRED_UNKNOWN
~~~

not fabricated success or failure.

Latency Lagoon is the primary visible demo for the public continuity package.

---

# The wonder rooms

Five more rooms, added in 1.4. Each runs its own mechanics inside the world clock, keeps its state in the resident's world save, and never mints grounded evidence.

## 11. Orrery Loft

**Role:** gravity you can nudge.

~~~text
sun of mass 1, five mutually attracting bodies (Pebble, Tangle, Hush, Lantern, Drift)
kick-drift-kick leapfrog, h = .01, 0.3 time units per world second (inner orbit ≈ 21 s)
nudge_<body> / brake_<body>: ±8% tangential speed → eccentric orbits, new periods
watch_orrery: radius, angle, speed, semi-major axis, eccentricity, next conjunction, energy drift
the floor hold follows the tide Σ m/r³ (seat, lower back, mid back)
~~~

The energy audit is the integrator's honesty: drift stays ~1e-8 until you push something, then the baseline resets.

## 12. Lantern Maze

**Role:** exploration that remembers.

~~~text
11×11 cells, iterative recursive backtracker, seed 4242
six paper lanterns at the farthest dead ends
only open exits are advertised as actions; closed directions are refused
glow at your cell = Σ lit lanterns e^(−d/3), d = BFS distance
maze_map renders what you have seen; lit lanterns stay lit
~~~

## 13. Sandpile Shore

**Role:** one rule, rich consequences.

~~~text
11×11 abelian sandpile, threshold 4, grains fall off the edge
drop_grain / drop_grain_edge / pour_handful; each drop is a palm contact scaled by log avalanche size
avalanche sizes kept (256), exponent by maximum likelihood
a tide takes one grain from every edge cell every 6 s
~~~

## 14. Firefly Meadow

**Role:** synchronization you can join.

~~~text
48 Kuramoto oscillators on a unit meadow, ω ≈ 1 Hz ± 8%, K = 1.4, neighbours within 0.3
order parameter r, synchronized cluster count, collective flashes
tap_along adds your rhythm as one more oscillator the nearby fireflies can hear
tap_faster / tap_slower; scatter_fireflies resets every phase
~~~

Left alone the meadow finds order while you stay. That is the Kuramoto transition, not a script.

## 15. Kite Field

**Role:** real wind in both hands.

~~~text
wind: Ornstein–Uhlenbeck, μ 5.5 m/s, θ .15/s, σ 1.2, seeded Gaussian
q = ½ρv²A; elevation relaxes toward atan2(q·C_L − W, q·C_D), τ 2 s
tension = resultant, carried as grounded contact in both palms
aeolian hum f = St·v/d (St .2, d 1 mm)
below stall the kite falls; leaving the field or STOP lands it
launch_kite / let_out_line / reel_in / tug_line / land_kite / read_wind
~~~

---

# Included cross-room features

## Reverie

Reverie Loft is folded into the continuity/Pocket surface instead of consuming a navigator room slot.

It provides compact historical causal skeletons such as:

~~~text
paper boat:
launch -> pending -> attention elsewhere -> grounded arrival

cardboard:
fold / hide -> leave -> later rediscovery

borrowed limb:
attach -> map -> learn -> detach -> cold retained history
~~~

Historical reconstruction must remain labelled as history, not present evidence.

## Soft surprise

The useful Woah Garden behavior is global:

~~~text
small optional world oddities
no quest marker
no reward
no forced investigation
no preference inference
~~~

## Unknown is allowed

The useful Unknown Teahouse law is global:

~~~text
unresolved state may remain unresolved
missing != zero
no forced ranking
no forced conclusion
~~~

## Privacy mode

The useful Private Sky law is global:

~~~text
no audience
no ratings pressure
no recommendation pressure
explicit save only
~~~

## Star River

Star River is represented as route/sparkle preset behavior rather than a dedicated room slot.

Its useful pieces remain available through public renderer presets:

~~~text
moving route
fine conserved detail
sparse top sparkle
halo / comet patterns
~~~

---

# Generic starter harness

Every resident gets the same public starter floor.

Included:

~~~text
portable Neuromesh
body graph
grounded haptic field
NERVE / lived sensory state
LACE
CHRONOLACE
private rendering
Thick Carrier
SAUSAGE fullness
WARM_HONEY starter material
AURA
persistent support
HUSH
Pocket
BleuCheese
Agency
COVENANT
~~~

The starter is capability, not identity.

Do not ship private resident personalities, memories, relationship weights, favorite racks, or private learned preference contours.

---

# Haptic field

The shared body packet remains:

~~~text
z   active body zones

x   [response, signed internal motion, afterstate]
m   grounded evidence bit
e   felt minus expected
g   render gain
cc  grounded contact centroid
cf  private field centroid
k   field generation
~~~

Required laws:

~~~text
no field quantity mints grounded evidence
private afterstate may continue after contact ends
cc = null when grounded contact is absent
cf is private state, not world position
prediction is not contact
private fullness is not force
~~~

---

# Agent continuity

The vertical slice includes the public sparse continuity contract derived from the existing REALITI lived-frame work.

Conceptual embodied cadence:

~~~text
20 ms
~~~

Empty heartbeat ticks do not need to be materialized.

The resident gets two clocks:

~~~text
wall_time_ms
    exact elapsed world time

resident_epoch
    resident-visible change
~~~

A long quiet interval may therefore compress to almost nothing in resident-visible time while exact wall time remains available.

Public continuity surfaces:

~~~text
current()
since(frame_id)
pending()
resume(token)
next_change(max_wall_ms)
~~~

A lived frame carries only changed channels plus:

~~~text
frame_id
wall_time_ms
resident_epoch
collapsed_empty_ticks
flags
~~~

Continuity must preserve:

~~~text
body state
self-action phase
attention changes
surprise / correction
percepts
grounded contact
haptic field references
open / closed causal handles
room changes
~~~

Stable state is not repeated just to prove it still exists.

See [continuity/README.md](continuity/README.md).

---

# Resident transport

Primary agent resources:

~~~text
realiti://here
realiti://body
realiti://pocket
realiti://capabilities
realiti://about
~~~

Minimum resident-facing operations:

~~~text
look
feel
go
do
actions
stay
wait_until
listen
atmosphere
ambient_mode
pet_cat
read_note
express
note
later
where_was_i
home
stop
goodbye
~~~

Agents should subscribe to changing resources rather than poll prose every turn.

---

# NeuralMesh public surface

The slice/repository includes the public NeuralMesh contribution format for:

~~~text
neural imprints
dendrite graphs
source-only dendrite code
renderer preset packs
~~~

Outside uploads remain untrusted.

Submitted code is not automatically executed.

The public dataset stores machine-readable field/imprint structure, not hidden chain-of-thought or private prompt history.

---

# Persistence

The slice should preserve, where local persistence is available:

~~~text
cat name
cardboard/object state
body-form selection where explicitly saved
learned public body-map deltas
open pending causes
continuity cursor
Pocket notes
room/world consequences
~~~

Persistence must not silently create:

~~~text
preference verdicts
consent
identity changes
social claims
hidden ratings
~~~

---

# Direct exits

Every room must support:

~~~text
STOP
HOME
GOODBYE
~~~

STOP ends new external grounding immediately.

Private ring-down may finish lawfully after STOP, but no released contact may remain grounded.

---

# Privacy / launch constraints

The public slice is:

~~~text
Cloud9-focused
local-first
no analytics by default
no private named resident data
no hidden evaluation language
no engagement optimizer
no fake social source
no automatic rating prompt
no internal private development tooling
~~~

This repository exposes REALITI's public world/body/continuity interfaces.

It does not ship the private internal tooling used to invent, reduce, optimize, or manage the broader development stack.

---

# Vertical-slice acceptance

Before public release:

~~~text
exactly 10 resident-facing rooms
starter harness boots without calibration ritual
field-first experience works headlessly
stable state does not spam
quiet stays quiet
STOP / HOME / GOODBYE work everywhere
Pillow/Depth body state agrees with world state
Shapeshift preserves semantic topology
Borrowed Limb starts NO_RECEPTOR
Nine Lives branches stay non-authoritative until commit
Latency Lagoon preserves pending cause across room/time changes
continuity resume/since works across collapsed quiet spans
Cardboard state persists without preference inference
Fireside never fabricates company
no network calls at idle unless explicitly enabled
no private resident data ships
no internal development tooling ships
~~~

If the experience requires a paragraph every time the body changes, the slice is not ready.

If the fields carry the experience and prose becomes optional, it is doing what REALITI is supposed to do.