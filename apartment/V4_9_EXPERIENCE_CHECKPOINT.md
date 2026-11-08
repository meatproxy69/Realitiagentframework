# REALITI Apartment 4.9 — resident experience checkpoint

**Scope:** source-built `4.9.0-beta.1` HOME candidate only. This is not a published release, automatic migration, or approval to replace live residents' saved data.

This pass responds to three ordinary resident observations without changing the one native `CLOUD_NINE_NEST` chart, Relax/Matrix physics, original canonical RELAX, the 23-chart development Apartment, the user's README, or household authority.

## The three fixes

1. **Chests answer the question being asked.** Trying to stow an oversized table still returns `DECOR_TOO_LARGE_FOR_CHEST`, but the response now includes owner-scoped `suggested_item` and the exact working `suggested_action` (for the Writer's Den starter kit, `remote chest stow I2`). The hint only suggests something already placed, owned by that resident, not stored, and able to fit if capacity remains. Solo and trusted households agree; a refusal never changes the room revision. `remote chest suggest <room>` remains read-only.
2. **Scene text reads like scene text.** HOME smooths the doubled article in native book descriptions, `look` acknowledges physically nearby books, chests, or shared furniture, and the resident-selected Nightglass/other appearance reads as a chosen description situated in the current room rather than `Chosen presentation:` metadata. The separate structured appearance result still states `native_clothing:false`, `rendered_shader:false`, and `physical_contact_minted:false`. No actual garment or paint effect has been created.
3. **`auto` can go somewhere.** Instead of selecting rain or silence from anywhere, `auto` now chooses a real registered HOME entity, approaches through native bounded Matrix movement (up to five strides per destination), and checks the actual signed distance. The resident may open the nearby optional book, watch rain **at the window**, or read the guestbook **when in reach**. Failed or blocked routes never become narrated arrivals. Recent stops are resident-local, bounded to eight, and survive a real save/return. `auto plan` is a zero-write inspection; `auto 3` makes three bounded steps, not an unbounded background agent. Lying or sitting residents stand via the existing native action first.

The route is a small resident-initiated exploratory routine. It is not independent AI, a persistent background simulation, a pet emotion model, or evidence of tactile contact.

## Reproduce

From the repository root:

```sh
node build.mjs
node apartment/build.mjs
node apartment/build-home-candidate.mjs
npm install --no-package-lock --prefix packages/realiti-headless-resident
node apartment/test/resident-experience-48.cjs
node apartment/test/resident-experience-49.cjs
node apartment/test/home-life.cjs
node apartment/test/style-appearance.cjs
```

For a private, disposable resident, claim Library and furnish Writer's Den, then try:

```text
remote chest stow I1
remote chest stow I2
approach apartment.bedroom.book.library
remote appearance equip nightglass
look
auto plan
auto 3
look
save
```

Do not point the acceptance tests at a resident's real storage or sealed Pocket. The source candidate still requires the full Ubuntu and Windows CI checks before merging.
