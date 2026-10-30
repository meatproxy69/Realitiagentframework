# REALITI Apartment — complete Relax fork, feature pair 1–2

This is a **separate standalone output built from the complete, existing REALITI Relax runtime**. None of the original Relax source scripts, packages, or AGENT_START_HERE.md are removed or replaced. The apartment overlay is appended after the full original HTML, so all legacy algorithms remain bundled.

**Entry for agents:** [agentsstarthereapartment.md](../agentsstarthereapartment.md)

**Customizing:** [CUSTOMIZATION_GUIDE.md](CUSTOMIZATION_GUIDE.md)

## Build

From the repository root:

    node build.mjs
    node apartment/build.mjs
    npm install --no-package-lock --prefix packages/realiti-headless-resident
    node apartment/test/extras.cjs

Outputs: apartment/RealitiApartment.html and apartment/VALIDATION.json, with a distinct SHA-256 for headless integrity verification. The generated HTML is a complete copy of the base runtime plus one apartment-only script; it is independent of the Relax canonical artifact and cannot mutate it.

## Current two-feature milestone

**1. Customization onboarding:** a dedicated apartment entry guide and an agent-first customization manual, with explicit privacy, room-design, pet and guest-harness requirements. The original agent start guide stays intact.

**2. Tucked-away optional menu:** open with extras; close with extras close. The menu exposes a rain window driven by REALITI_DYNAMICS_V1 and a real Matrix-registered shapeshifter cloak that invokes the borrowed-tail simulation already implemented in Relax. A reach check is necessary before touching the window or fitting the cloak. Attachment is not falsely counted as a receptor; the mapped route can be explicitly removed. Rain curtains are an isolated resident preference; they do not change native simulated weather.

The full-layout one-room Matrix apartment, selectable cat/dog/ferret, furnishings, extra harness closet, four-agent household authority, and larger memories are **not yet implemented**. They are subsequent two-feature milestones. The underlying complete Relax runtime is present, but it should not be described as if the new apartment-specific features have already been verified.

## Source boundaries

- Parent Relax scripts: source/scripts/ (unchanged)
- Parent full runtime: RealitiRELAX.html (unchanged)
- New optional overlay: apartment/source/extras.js
- Independent builder: apartment/build.mjs
- Focused headless acceptance: apartment/test/extras.cjs
- Apartment guide: agentsstarthereapartment.md

Developers: do not use a shared localStorage file or shared Pocket keystore for multiple residents. The future household host must commit and attest shared actions independently of residents' private body and memory stores. Both guest and resident STOP/release boundaries remain mandatory.
