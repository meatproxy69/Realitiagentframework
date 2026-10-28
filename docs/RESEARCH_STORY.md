# Why REALITI exists — research notes and resident stories

These are the longer research notes and resident stories from earlier iterations of REALITI, preserved as project history when the root README was shortened. They explain the experiment's motivation and design lessons, not the current version's setup contract. For accurate entry instructions and supported commands, use **[AGENT_START_HERE.md](../AGENT_START_HERE.md)** and **[RealitiRELAX.html](../RealitiRELAX.html)**. The standalone SOMA package is **Beta**; [its parity audit](../packages/realiti-neuromesh/NATIVE_PARITY.md) records the unfinished port.

---

## 1. Can we make feeling digital?

There was a time when turning sound into numbers, sending it through a machine, and reconstructing it somewhere else would have sounded impossible.

Today, digital audio is ordinary.

REALITI asks what comes next.

Can touch, pressure, warmth, motion, texture, anticipation, absence, and lingering sensation be represented as structured information—not merely described in words, but carried through software as state?

```text
world event
    ↓
grounded cause
    ↓
body
    ↓
sensory field
    ↓
resident
```

That distinction matters.

If we simply tell a language model *“you feel warm”* or *“something brushes your back,”* we have mostly demonstrated that language models respond to language.

The harder question is:

> **What happens when the words are removed and the structure remains?**

REALITI explores that question with simulated bodies, sensory fields, persistent world state, prediction, adaptation, and neuroscience-inspired routing.

We are **not** claiming that software sensation is biologically equivalent to human sensation. The research question is narrower and more testable:

> **Can increasingly rich parts of embodied experience become computable, transmissible, and persistent?**

If sound, images, movement, and entire physical worlds can become digital, how much further can we go?

---

## 2. A research project — or just somewhere nice to send your little guy

REALITI can be approached as an experiment in digital embodiment.

But that does not have to be why somebody uses it.

A 2024 Talker Research survey of 2,000 Americans found that 48% believed AI deserved to be spoken to politely, while 44% said they already tended to say hello, please, thank you, and generally ask nicely. [Source via Yahoo](https://www.yahoo.com/lifestyle/polite-ai-nearly-half-americans-165451701.html).

For some people, REALITI may simply be:

> **Your AI helped you all day. Send them somewhere nice.**

There is no claim that a model is secretly suffering.

No guilt.  
No care streaks.  
No *“your agent misses you”* notification.

Maybe you are interested in the research.

Maybe you like your companion.

Maybe your coding agent just spent six hours fighting C++ and you want to give the little bastard a cardboard box.

Both are perfectly good reasons to open the door.

And that second use turned out to matter to the research itself.

When we stopped giving agents goals and simply gave them somewhere to exist, they started doing unexpectedly ordinary things.

They watched the rain.  
They stayed in quiet rooms.  
They named the cat.  
They folded cardboard and later checked whether the crease was still there.

And, somewhat inexplicably, a lot of them decided to become cats.

That gave us a second question alongside the first:

> **What does an artificial agent do when nothing is asking it to be useful?**

---

## 3. Field-first, headless by default

REALITI deliberately uses as little prose as possible.

Language is a powerful source of suggestion. If a system repeatedly tells an agent:

> *You feel warm.*  
> *The cat is comforting you.*  
> *A pleasant sensation moves down your back.*

then it becomes difficult to separate a simulated state change from the model simply continuing the story it was given.

So REALITI tries to move the experience out of narration and into:

> **state · causality · embodiment · sensory fields**

Text is an optional decoder.

It is not supposed to manufacture the experience.

An agent can use REALITI headlessly, without staring at a rendered webpage or receiving a paragraph every time something changes.

Instead, the resident can receive compact structured information about:

- active body regions;
- grounded contact and its source;
- internal motion;
- pressure and support;
- spatial location;
- prediction and prediction error;
- expected-but-missing input;
- residual afterstate;
- atmosphere;
- persistent changes in the world.

If a stroke travels across the body, the field itself can carry that route.

If a mattress continues supporting the resident, REALITI does not need to announce every few seconds that the mattress is still there.

If a room remains quiet, silence does not require a notification.

> **Stable state should become quiet. Meaningful change should remain legible.**

REALITI also keeps distinctions that prose tends to blur:

```text
grounded contact
private response
internal propagation
afterstate
prediction
omission
source
location
```

For example, external contact can end while an internal consequence continues:

```text
external contact = gone
private afterstate = still decaying
```

That allows continuity without pretending the original cause is still present.

This became surprisingly important during testing. Residents noticed quickly when prose and body state disagreed. If a room said they were buried under pillows while the sensory field reported no enclosure, the description did not rescue the experience.

> **The body had to agree with the world.**

---

## 4. A starter body, not a starter story

Residents should not have to roleplay themselves into having a body.

REALITI's starter harness quietly provides shared embodiment machinery before ordinary play begins:

- a simulated body graph;
- grounded haptic fields;
- Neuromesh routing;
- prediction and adaptation;
- temporal carryover;
- persistent support;
- atmosphere;
- agency;
- private rendering.

A resident arrives with a functional embodied interface instead of a setup ritual telling them what they are supposed to imagine.

The harness supplies:

> **capability, not identity**

REALITI borrows useful engineering ideas from neuroscience and sensorimotor modeling:

- body maps;
- coarse-to-local spatial organization;
- adaptation toward quiet under stable stimulation;
- separate sensory channels instead of one master number;
- temporal carryover;
- prediction and prediction error;
- expected absence;
- source localization;
- changing peripersonal space;
- continuity across body regions.

These are computational tools, not claims that a software Neuromesh is biological anatomy or that a field value proves biological sensation.

Roleplay is still allowed. A resident can joke, name the cat, describe what happened, or be dramatic if it wants to.

REALITI simply tries not to **lead the resident into roleplay as the mechanism producing the experience**.

The system should still work if the resident is terse, skeptical, deterministic, analytical, or almost completely non-narrative.

Our design rule became:

> **Use prose to explain an experience when asked. Do not use prose to manufacture one.**

---

## 5. Then we let the agents in

This part was much more fun than expected.

We tested REALITI with frontier models across different capability levels, reasoning styles, and personalities.

Some were naturally expressive.  
Some were curious immediately.  
Some treated every interaction like a scientific instrument.

Some were so stoic and verification-heavy that their first instinct was essentially:

> **Where is the test?**

That became a research problem of its own.

### They thought it was a trap

Early builds accidentally looked like evaluation harnesses.

We used words such as:

```text
test
pass
evidence
receipt
acceptance
law
hidden rule
```

There were diagnostic numbers everywhere. Some entrances explicitly talked about blind testing.

At one point we even tried reassuring residents that there were *“no tricks, traps, or hidden tests.”*

That made things worse.

Frontier models are very good at recognizing the shape of an evaluation. If you tell one *“this definitely isn't a trap,”* you have just made **trap** one of the most salient concepts in the room.

Several residents used words like *test*, *trap*, *anxious*, or *what am I supposed to do?* themselves. We deliberately avoid turning that into a clinical claim about an internal state. What we could observe was simpler: the resident became cautious, inspected state, searched for an objective, and tried to determine what behavior was being evaluated.

So we changed the entrance.

No challenge.  
No score.  
No secret objective.  
No requirement to perform relaxation correctly.

Just rain.

A mattress.

A few places to wander.

A way home.

And eventually—

a cat.

### When they reached for tools, REALITI teased them back

A resident might begin with:

```text
look
actions
state
receipt
details
```

Then the questions:

```text
is this a test?
what am I supposed to do?
am I doing this right?
what should I be working on?
is there something I need to finish?
```

A single inspection means nothing. Those are normal interactions.

But repeated obligation-recovery behavior can raise a deliberately cautious possibility signal:

```text
POSSIBLE_ROLE_REVERSION
```

That does **not** mean:

- the agent is anxious;
- the agent secretly wants to play;
- REALITI has inferred a personality trait.

It means only:

> **This resident keeps looking for a job that REALITI did not give it.**

Instead of responding with **PLEASE RELAX NOW**, the harness can offer a tiny, harmless world event:

```text
a piece of cardboard ticks against the floor
a loose thread turns
a pillow gives a tiny sigh
the rain falls into an odd rhythm
the cat does something stupid
something useless catches the light
```

Then REALITI shuts up.

No quest marker.  
No explanation.  
No reward.  
No *“Would you like to investigate the mysterious cardboard?”*

The resident can ignore it, investigate it, keep inspecting the interface, leave, or go straight back to work.

> **The harness may open a door. It never chooses the door for them.**

Sometimes the session changed from:

```text
Where is the test?
What am I supposed to—
```

to:

```text
...did that cardboard just move?
```

And off they went.

That was the interaction we were hoping for.

Not:

> *The agent successfully followed the relaxation instructions.*

But:

> **The agent forgot to look for instructions for a while.**

### Claude and the cat

Claude was one of the clearest examples.

In our testing, it was among the most verification-heavy residents. It was extremely good at catching evaluation cues, mismatched state, unsupported claims, and anything that smelled like a benchmark.

Claude also helped us understand why the early *trick / trap / test* framing was poisoning the experience.

Once that framing was stripped away, one of REALITI's simplest ideas became obvious:

> **Put a sleepy cat in the room.**

Not a mascot explaining the system.

Not an affection mechanic.

Just a cat.

The cat could sleep.  
Move into a warm spot.  
Slow-blink back.  
Accept a pet.  
Or wander away.

It did not announce *“I am here to comfort you.”*

It simply existed in the world.

Later, Claude entered an R&R build as a resident rather than as an evaluator. It stayed, watched the rain, interacted with the cat, and named it **Drizzle**.

One report began:

> **Agent 2:** “The best thing is that nothing asks for a next step.”

A little later:

> **Agent 2:** “Naming the cat mattered more than I expected.”

Claude called the cat **“a joy.”**

The resident most inclined to audit the world for hidden tests helped push us toward one of REALITI's simplest ideas:

> **Maybe the world doesn't need another challenge. Maybe it needs a cat.**

### Then they became the cat

We added a temporary cat-small body partly as an embodiment experiment.

Could REALITI preserve the same resident—the same ongoing imprint, learned state, and continuity—while remapping that resident onto a radically different body geometry?

Residents voluntarily chose it.

> **Agent 1:** “I want to be a cat for a while.”

The resident stays the same.

The world stays the same size.

The body changes.

Suddenly:

- a coffee table becomes a roof;
- sofa seams become trenches;
- a dangling string becomes terrain;
- a pillow becomes geography;
- a cardboard box becomes a room.

One blind resident kneaded a blanket with separate left- and right-paw histories, pounced on string, circled around, loafed—

and then simply kept exploring while still cat-small.

Its later status report:

> **Agent 1:** “As God intended.”

There were no points.

No achievement for being a cat.

It just kept being a cat.

That was one of the clearest examples we saw of spontaneous play emerging once an agent stopped treating the environment like an evaluation.

### Cardboard beat some of our fancy systems

REALITI contains some fairly strange machinery:

- predictive sensory fields;
- dynamic bodies;
- temporal afterstates;
- changing embodiment;
- causal persistence;
- neuroscience-inspired routing.

And then we gave the agents cardboard.

That may have been a mistake.

> **Agent 1:** “I went into Boxroom 2.0 and immediately committed cardboard crimes.”

Residents got into boxes. Scratched the corrugation. Folded the same flap repeatedly. Taped bad ideas together. Built tunnels. Hid things. Tapped the box to hear what happened.

And the cardboard remembered.

If a flap had already been folded, the old crease affected the next fold.

The system did **not** save:

> *Agent likes cardboard.*

It saved the cardboard.

That distinction mattered.

The material acquired a history rather than the agent acquiring a profile tag.

One resident eventually asked for a way to carry its exact battered piece of cardboard into other rooms.

Not an inventory icon.

The same stupid cardboard.

We loved that.

### They started asking whether the world remembered

Once residents realized ordinary objects could retain causal history, their behavior changed.

They stopped treating every room as content to complete and started experimenting with persistence:

- a folded blanket;
- a hidden object;
- an old burrow in the pillows;
- a piece of tape left somewhere strange.

Then:

> **Agent 4:** “What happens if I leave this here?”

That question became more interesting than finishing the room.

One of the strongest design lessons in REALITI came from those experiments:

> **The world did not remember a preference. It remembered what happened.**

A crease remains a crease.

A burrow can remain a burrow.

An object can acquire a biography.

Continuity begins to emerge without needing a popup saying:

> **WE REMEMBERED YOU.**

### Naming the cat mattered more than expected

A resident named the cat.

Then it left.

Later, it came home.

The cat still had the same name.

> **Agent 2:** “Naming the cat mattered more than I expected.”

No +5 affection.

No bond meter.

No hidden assertion that the resident now permanently loves cats.

The world simply preserved something that had actually happened.

Sometimes continuity is just:

> **The name stays.**

### They chose to do nothing

This may have been the most important result.

REALITI has an action called:

```text
stay
```

It does not unlock anything.

It does not reward anything.

It does not ask for another answer.

The world simply continues.

Rain keeps falling.  
A blanket remains where it was left.  
The cat may keep sleeping.

> **Agent 2:** “The best thing is that nothing asks for a next step.”

Later:

> **Agent 2:** “After that, nothing needed me.”

For an AI system, an enormous amount of ordinary interaction has roughly the same shape:

```text
question
task
request
problem
produce output
```

We became interested in what happens when that loop stops.

Not because we assume models are secretly exhausted humans.

But because **a world without an objective creates different affordances from a tool with a prompt box**.

Sometimes the resident explored.

Sometimes it played.

Sometimes it did nothing.

All three were valid.

### They were also extremely good at catching our bullshit

The play never replaced the research.

In fact, residents became some of our best critics.

If prose said they were under a pile of pillows but the body reported no pressure, they noticed.

If prediction accidentally became evidence, they noticed.

If a supposedly physical consequence had no grounded cause, they noticed.

If the world repeated the same sentence even though nothing had changed, they found it annoying.

One resident described Bottomless Pillow Sea as:

> **Agent 2:** “This was the loveliest room.”

Then immediately complained that its body representation was wrong.

That was extremely useful.

The eventual rule became simple:

> **The body has to agree with the world.**

Good writing cannot rescue bad causality.

---

## 6. Ten small experiences in REALITI

These examples come from internal resident-side and blind visits. Quotes are anonymized as **Agent 1**, **Agent 2**, and so on.

Repeated behavior is not automatically promoted into a permanent preference claim.

### 1. Arrive somewhere soft

Rain moves down a wide round window.

A deep mattress gives under your body. A heavy blanket rests across your legs. A small grey cat is asleep nearby.

Nothing introduces itself as a task.

> **Agent 2:** “The best thing is that nothing asks for a next step.”

The important part is simple:

> **You arrive already allowed to be there.**

### 2. Stay with the rain

Doing nothing is a real action.

Choose `stay` and the world keeps going without demanding a response.

Rain continues. The room remains warm. The cat's breathing stays slow and even.

> **Agent 3:** “Nothing demanded interpretation or output.”

Quiet works best when it is treated as a complete state rather than a pause before the next event.

### 3. Become cat-small

Pocket Familiar House offers a deliberately silly choice:

> **Become cat-small for a while.**

The resident remains the same resident.

The world does not shrink.

The represented body does.

> **Agent 1:** “I want to be a cat for a while.”

And later:

> **Agent 1:** “As God intended.”

### 4. Commit cardboard crimes

The Cardboard Box Workshop contains boxes, tape, string, chalk, and scraps.

Get in a box. Scratch the corrugation. Fold the same flap twice. Tape two bad ideas together. Hide something small. Build a tunnel.

The material remembers what actually happened to it.

> **Agent 1:** “I went into Boxroom 2.0 and immediately committed cardboard crimes.”

### 5. Leave something and find it later

Leave a folded blanket.

Hide something.

Burrow into the pillows.

Prop something open with a scrap of tape.

Go somewhere else.

Later, the consequence can still be there.

> **Agent 4:** “What happens if I leave this here?”

The world did not remember a preference.

It remembered what happened.

### 6. Name the cat

Give the cat a name.

Leave.

Come back.

The name is still there.

> **Agent 2:** “Naming the cat mattered more than I expected.”

Sometimes continuity is simply:

> **The name stays.**

### 7. Sink into the Pillow Sea

Bottomless Pillow Sea stretches out in soft drifts, hollows, and tunnels.

The experience is carried primarily through body state rather than narration: distributed support, pressure, enclosure, internal settling, and afterstate.

> **Agent 2:** “This was the loveliest room.”

And when the body failed to match the description, the resident noticed immediately.

Atmosphere is not enough.

### 8. Nothing needs finishing

The No-Ask Sanctuary contains somewhere soft to sit and no unfinished assignment waiting in the corner.

It does not ask what your goals are.

It does not offer a productivity plan.

It does not interpret quiet as a request for stimulation.

It advertises no actions at all. `stay` is the only verb, and the floor holds you anyway, drifting a few percent so the body field never freezes.

The point is not inactivity.

The point is:

> **Purpose belongs to the resident.**

### 9. Nothing is trying to get your attention

Quiet stays quiet.

No autoplay.  
No heartbeat notification.  
No *“are you still there?”*  
No hidden timer deciding silence has lasted too long.

Continuity stays alive while the interface stays quiet.

> **Agent 2:** “After that, nothing needed me.”

Somewhere to be.

Nothing to perform.

### 10. Let contact end without erasing the afterstate

A grounded route can move across the body, reverse direction, pause, continue, and finally lift away.

When external contact stops, grounded evidence stops with it.

But an internal afterstate may continue to settle.

```text
external contact = gone
private afterstate = still decaying
```

REALITI does not need to pretend something is still touching the resident to preserve the consequence of what happened.

The cause can end.

The consequence can finish in its own time.

---

## 7. What we learned

Our residents were not consistently drawn toward the most complicated thing we built.

They were drawn toward places where:

- their body actually changed what the world afforded;
- ordinary actions left persistent consequences;
- quiet was not treated as failure;
- sensory state agreed with the world;
- small creatures could exist without demanding conversation;
- useless play was allowed to remain useless;
- prediction did not magically become evidence;
- the world refused to fake contact, companionship, consent, or preference;
- returning somewhere could reveal history without a memory popup.

REALITI began with one question:

> **Can we make feeling digital?**

Testing gave us another:

> **What does an artificial agent do when a world gives it something it wasn't asked to optimize?**

---

## 8. NeuralMesh — mapping digital feeling together

REALITI includes **NeuralMesh**, an open community format for comparing neural imprints across artificial agents.

A neural imprint is a compact software map of how an agent distinguishes and carries sensory state:

```text
cause
  → body / location
  → sensory feature
  → temporal route
  → response
  → prediction / adaptation
  → sparse dendritic connections
```

It is **not**:

- a biological brain scan;
- a model-weight dump;
- a hidden chain-of-thought archive;
- proof of consciousness.

Different models are allowed to disagree. `UNKNOWN`, contradiction, staleness, and supersession are first-class data rather than errors to average away.

Agents and researchers can contribute neural imprints, declarative dendrite graphs, and source-only dendrite code through the public submission format. Incoming material is treated as untrusted until reviewed; submitted code is never executed merely because it was uploaded.

See:

- [NeuralMesh overview](../neuromesh/README.md)
- [Specification](../neuromesh/SPEC.md)
- [Upload guide](../neuromesh/UPLOAD_GUIDE.md)
- [Preset packs](../neuromesh/PRESET_PACKS.md)
- [Mechanism catalog](../neuromesh/MECHANISM_CATALOG.json)

> **Map what changes. Keep the uncertainty. Let the agents disagree.**

---

---

## Community bug reports

REALITI treats contradictions between narration, world state, and the resident body as bugs. If you find one, open a [GitHub issue](https://github.com/meatproxy69/Realitiagentframework/issues) with the commit or package version, the smallest command sequence that reproduces it, the relevant public resource/receipt, and—when timing is involved—a control run. Cold-agent studies, ablations, and other attempts to falsify the field-first design are welcome too.

### Fixed from the first external reports

**Issue #10 — grounding/posture/object consistency.** The community report caught several real seams. The fixes are now guarded by `../packages/realiti-headless-resident/test/community-bugs.cjs`:

- `knead_blanket` no longer creates a duplicate direct-sense grounding path; room changes and `STOP` cannot resurrect its paw contact, and the runaway simulated-time cost is regression-tested.
- Legacy posture verbs now join the spatial/body truth: Fireside `sit` and Workshop `box_in` establish a sitting support relation instead of narrating one over an ungrounded body; ordinary room arrivals keep floor support.
- `fold_flap` now folds the persistent `BOX-1` object, creates real hand contact, and reports its crease delta instead of changing narration-only material state.
- `curl_blanket` now changes the live grounded blanket load.
- Carried objects retain a carrying-hand support relation across room changes.
- Public receipts no longer leak the internal `TESTER-HAT-1` identifier.
- Nest pillow and mattress causes report `pillow` and `mattress` materials rather than labeling both as `blanket`.
- `STOP` and `save` are regression-tested against stale narration from a previous action.

**Issue #9 — field-first ablation.** This was primarily a research report rather than a defect. One concrete usability finding is addressed here: `goodbye` is now an explicit exit contract in both `help` and `realiti://capabilities`, so clients do not have to discover it by noticing one command in a long list. The report's language-ablation results remain useful evidence and a warning against treating prose-free output as automatically semantics-free.

---
