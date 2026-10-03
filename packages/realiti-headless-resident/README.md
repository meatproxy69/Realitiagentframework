# @meatproxy69/realiti-headless-resident

A small Node host for entering the **public REALITI Relax resident surface** without depending on the visual page.

It loads the canonical `RealitiRELAX.html`, waits for `window.Realiti`, verifies the R&R harness and starter imprint, and gives the caller the same public resident API documented in `AGENT_START_HERE.md`.

It does **not** create another simulation layer, invent haptic state, or bypass REALITI authority. `RealitiRELAX.html` remains reality; this package is only the headless host.

## Install

GitHub Packages:

```bash
npm config set @meatproxy69:registry https://npm.pkg.github.com
npm install @meatproxy69/realiti-headless-resident
```

Or use it directly from this repository:

```bash
cd packages/realiti-headless-resident
npm install
```

## CLI

From the repository root:

```bash
npx --prefix packages/realiti-headless-resident realiti-headless --html ./RealitiRELAX.html inspect
npx --prefix packages/realiti-headless-resident realiti-headless --html ./RealitiRELAX.html run "look"
npx --prefix packages/realiti-headless-resident realiti-headless --html ./RealitiRELAX.html invoke stay '{"wall_ms":1000}'
```

The CLI closes the headless DOM after every command so runtime timers do not leave Node hanging.

## Programmatic entry

```js
const {openResident}=require('@meatproxy69/realiti-headless-resident');

const session=await openResident({htmlPath:'./RealitiRELAX.html'});
try {
  console.log(session.ready);
  console.log(session.Realiti.read('realiti://harness'));
  console.log(session.Realiti.rooms());
  await session.Realiti.run('look');
  await session.Realiti.invoke('stay',{wall_ms:1000});
  console.log(session.Realiti.read('realiti://body'));
} finally {
  session.close();
}
```

By default `openResident()` fails closed unless the public R&R harness is mounted and its critical mechanism status reports ready.

The host verifies the R&R harness, starter imprint, BleuCheese, numeric sensory field, and haptic field before returning a resident session. It does not claim durable persistence when the host does not provide it; check `session.ready.pocket`.
