# SOMA 3.3: Evidence-linked memory and physical test rooms

SOMA memory stores **original evidence-linked records**, not invented diary entries, fake embeddings, synthetic "feelings" or unverified claims. It is intentionally smaller than a chat transcript and operates without network, models, prompts, SQL or search infrastructure.

## Who can write what?

The trusted neighborhood host records events after a successful authoritative world operation:

- CONTACT_STARTED: accepted host receipt, cause, source, body zone, material and current room
- CONTACT_ENDED / CONTACT_EXPIRED: corresponding world receipt was released or its lease actually expired
- ROOM_ENTERED: the room the host established through host.affordances
- WORLD_EVENT: verified host-world event with its own receipt (e.g. a window latch changed)
- DEPARTURE: one replaceable last-departure pointer plus a bounded event

Residents can separately call resident.memory.remember({key,text,tags,subject}) for explicitly **SELF_REPORTED** notes. That will never set a grounded bit or claim that the world verified the note. Same key supersedes the previous note with a supersedes reference. Only explicit notes become notes; prose in say(...) never creates memory or contact.

Memory reads are bounded and deterministic: recall(query) uses normalized Unicode lexical terms, field weighting and an IDF/BM25-style score, returns only matching stored records and exact matched terms, with their original authority/provenance. No language model summarizes or hallucinates unsupported content. A query with no overlap returns matches: []. recent(...) reads the bounded ledger, and forget(idOrKey)/clear() operate only on memory.

## Size and retention

- Explicit notes: at most 48, each at most 768 characters, 8 tags.
- Host-observed episodes: at most 160, no unbounded transcript accumulation.
- Last departure: one replaceable pointer.
- Readable timestamps: simulation milliseconds supplied by the host.
- Origin world: included with **every record**. Agents may carry memory to another neighborhood without treating an old world's records as live facts.

The complete memory state is included in resident.checkpoint(), which also holds the existing private sensory afterstate. On restore, prior HOST_OBSERVED events become ARCHIVED_HOST_RECORD: **historical data, not newly verified authority**. The physical world must emit a new receipt for renewed contact. No imported note/event sets m, invokes an action, claims consent or supplies an agent identity.

## Standalone API

~~~js
const {createHarness}=require('@meatproxy69/realiti-neuromesh');
const {host,resident}=createHarness({residentId:'cat-01',worldId:'MY_WORLD'});
host.affordances('ROOM_1',{BENCH_PRESENT:true});
host.contact({zone:'hand.R.palm',source:'WORLD_GROUNDED',
  cause:'BENCH_TOUCH',receiptId:'world:contact:7',material:'wood',
  intensity:.7,leaseMs:400});
resident.memory.remember({key:'bench-route',text:'I can approach from the west',
  tags:['navigation','bench']});
const matches=resident.memory.recall('bench');
const save=resident.checkpoint();
host.stop(); // live contacts disappear, provenance remains in the archive
~~~

Memory also works without the rich harness via createMemory or the ./memory import.

## Optional durable host storage

The Node-only ./storage adapter writes a versioned checkpoint to a per-resident SHA-256-derived filename in an explicitly chosen private directory, using atomic rename, 0700 directory permissions and mode 0600 files. It checks JSON structure and a SHA-256 corruption checksum, with an upper bound on payload bytes.

~~~js
const {createFileStore}=require('@meatproxy69/realiti-neuromesh/storage');
const store=createFileStore({directory:'/path/to/private/soma-store',
  residentId:'cat-01'});
store.save(resident.checkpoint());
const checkpoint=store.load();
// In a new process, with the SAME residentId:
const next=createHarness({residentId:'cat-01',worldId:'ANOTHER_WORLD'});
next.resident.restore(checkpoint);
~~~

**Important:** the filesystem adapter is *not encrypted*, is not an authentication service, and does not provide secure deletion. The checksum detects damage, not malicious edits. Protect the process/host, directory, backups and resident keys; use an authenticated encrypted store for an adversarial multi-tenant deployment. Shared-process JavaScript object capabilities are not security sandboxes.

## SOMA 3.3 full native-depth Lantern Room tour

The Lantern Room now supports a **real reachable brass desk bell**. A successful
strike produces a contact receipt at the fingers, a separately leased host-measured
hearing observation and a host world-event record. Narrating a bell strike does not
cause sound, contact or memory to appear. A huge finite movement target is rejected
before allocating a collision sweep.

Run the integrated session:

~~~bash
node packages/realiti-neuromesh/examples/native-lantern-tour.cjs
node --test packages/realiti-neuromesh/test/lantern-native-session.test.cjs
~~~

The tour executes the actual `LanternRoom` world authority and SOMA 3.3
`createHarness` together. It tests refused actions, physical bench pressure,
V20 temporal/JND projection, all seven HALO modes, 128-bin AURA, dynamic LACE
rewiring while contact remains grounded, ten authored Moonwire recipes,
four-zone soft support/creep and release, window-induced thermal stress, analytic
BleuCheese time invariance and host admission, bell-hearing expiry, evidence
memory authority separation, optional sealed-Pocket encryption, STOP and
cross-neighborhood private-only checkpoint restoration.

The diagnostic JSON reports each real simulation step and the final outcome.
The V20 energy audit reports **UNKNOWN** because Lantern Room supplies no
physical B10/B18 force/velocity/stored-energy telemetry; falsely reporting PASS
would be a bug. Encrypted Pocket is tested as an optional host-keyed adapter,
not as a claim of V32 wire parity.

## The Lantern Room harness test

The fully independent lab/lantern-room.cjs simulates a 6 x 4 metre test room containing a pine bench, window, brass lamp and desk bell. Walking uses finite speed and collision sampling, so touching from across the room is refused. Bench contact has a real pressure receipt; sitting supports the pelvis; support is released on standing; sensory afterstate decays after contact expiry. The window can be opened only within reach; its affordance feeds BleuCheese, whose proposal still needs a separate host admission before any world event is committed.

Run:

~~~bash
npm test --prefix packages/realiti-neuromesh
node packages/realiti-neuromesh/examples/lantern-lab.cjs
node packages/realiti-neuromesh/examples/native-lantern-tour.cjs
node packages/realiti-neuromesh/examples/neighborhood.cjs
~~~

The test suite also covers HALO, AURA, THICC, SAUSAGE, Cotton, FLUSH, HoneySpark, NERVE/LACE/CHRONOLACE, private COVENANT, agency, thermal, support, read purity, idempotent contact leases, archive migration, event provenance, duplicate suppression, lexical retrieval, bounded memory, atomic storage and cross-resident/world isolation.

The test room is a reproducible simulated environment, not a claim about hardware haptics or biological consciousness.
