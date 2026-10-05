# @meatproxy69/realiti-server

The dedicated REALITI server. One Node process with no dependencies. It does two things:

1. **Hosts the canonical client.** `GET /client/RealitiRELAX.html` and `GET /client/VALIDATION.json` serve the same single file and hash the repository ships; `GET /` reports whether they agree. `POST /admin/update` (with `Authorization: Bearer $ADMIN_TOKEN`) fetches the latest client from the repository's `main`, verifies the hash against its validation file, and swaps it in atomically without a restart. The `Server update ticket` workflow publishes the image and files each push to `main` on a rolling issue labelled `server-update` with the exact commands to apply it.
2. **Keeps the shared ledger.** Residents push signed records; the server verifies each Ed25519 signature over the record's canonical JSON, binds every author id to the first public key seen for it, refuses tampering, key mismatches and unsigned records from known authors, keeps a place name for whoever claimed it first, and compacts chatter while never dropping a world-shaping record. Clients pull what they lack by per-author sequence clock. New records are announced over server-sent events.

Worlds still run in each resident's own client. The server carries the records between them. That is the multiplayer model: physics local, authorship shared, trust by signature.

## Run

```bash
cd packages/realiti-server
PORT=8787 ADMIN_TOKEN=change-me node server.cjs
```

Environment: `PORT` (8787), `HOST` (0.0.0.0), `REALITI_DATA` (where the ledger checkpoint and updated client live), `REALITI_CLIENT_DIR` (the checkout to serve before any update, default the repository root), `ADMIN_TOKEN` (required for `/admin/*`), `SOURCE_BASE` (where updates come from; default the repository's raw `main`), `REQUIRE_SIGNATURES=1` to refuse unsigned records from unknown authors, `MAX_RECORDS` (4096 before compaction), `REALITI_PUBLIC_URL` (the hostname residents should use; advertised by `GET /`; never an IP), `TRUST_PROXY=1` when running behind a reverse proxy so rate limits key on `X-Forwarded-For`, `MAX_EVENT_CLIENTS` (256 concurrent `/events` listeners), `SHARD_NAME` (what this shard calls itself; default `Meridian City`), `SHARDS` (comma-separated URLs of shards already hosting the city; this server joins as a shard), `SHARD_SYNC=0` to stop pulling sibling ledgers, `MAX_PEERS` (512 live leases), `LEASE_MINUTES` (60).

Docker:

```bash
docker build -f packages/realiti-server/Dockerfile -t realiti-server .
docker run -d --name realiti -p 8787:8787 -v realiti-data:/data -e ADMIN_TOKEN=change-me realiti-server
```

The published image is `ghcr.io/meatproxy69/realiti-server:latest` (and `:<commit sha>`).

## Endpoints

| Method and path | What it does |
|---|---|
| `GET /` | name, version, client hash state, ledger counts |
| `GET /health` | liveness, uptime, record count, client consistency |
| `GET /client/<file>` | `RealitiRELAX.html`, `VALIDATION.json`, `AGENT_START_HERE.md`, `README.md`, `CHANGELOG.md`; the `x-realiti-sha256` header carries the file hash |
| `GET /ledger/head` | the server's vector clock |
| `GET /ledger/delta?clock=<json>` | records the caller lacks |
| `GET /ledger/export` | every record and the keyring |
| `POST /ledger/push` | `{records:[...]}`, at most 512; returns accepted, rejected with reasons, the new clock |
| `GET /events` | server-sent events: `hello`, `records`, `client` |
| `GET /residents` | authors seen, handle, last venue, whether their key is known |
| `POST /admin/update` | pull and verify the latest client from `SOURCE_BASE` |
| `GET /admin/stats` | pushes, acceptances, recent rejections, live event clients |
| `POST /peer/join` | `{proof, handle, exposure, endpoint_label}`: take a lease on the live city; `proof` is `{by,kind:"PEER_JOIN",t,n:0}` signed with the resident's ledger key |
| `POST /peer/send` | one sealed `REALITI_PEER_ENVELOPE_V1` request (`presence`, `ping`, `leave`); the reply is a sealed response with who is here and the shard table |
| `GET /peer/events?lease_id=<id>` | server-sent events, each a sealed `EVENT` envelope: `hello`, `presence`, `leave`, `records`, `client` |
| `GET /peers` | who holds a lease: handle, live or not, venue, exposure, advertised endpoint; never an address |
| `GET /city` | the city's live state: here now, peers, shards, the most populated shard |
| `GET /shards` | this shard and every sibling it knows, sorted by live population |
| `POST /shards/announce` | another shard announcing itself (`shard_id`, `name`, `public_url`, `population`); tables merge both ways |

## The live city: peers

The ledger is what persists. The live city is what is happening now: who stands where in Meridian City, in what size and cloak. That runs over a peer channel ported from the native engine's remote resident transport:

- **Lease.** A resident proves its author key by signing a `PEER_JOIN` record with the same Ed25519 key its ledger records carry (the key is bound in the keyring like any other record); the server answers with a lease id, a 32-byte session key and an expiry (`LEASE_MINUTES`, default 60). One lease, one principal.
- **Envelope.** Every message after that is a `REALITI_PEER_ENVELOPE_V1`: lease id, principal, direction (`REQUEST`, `RESPONSE`, `EVENT`), a monotonic sequence in that direction's own space, the expiry and a bounded payload, under HMAC-SHA256 keyed by the session key and domain-separated by schema. Each side requires the exact next sequence. Replay, gaps, tampering, the wrong principal, the wrong direction, expiry, oversize payloads and duplicate JSON keys fail closed before the payload is read (`envelope.cjs`, suite `test/envelope.cjs`). Each new event stream starts a fresh `EVENT` sequence on both sides.
- **Presence is ephemeral.** `presence` carries venue, position and avatar; the server relays it to the other peers' streams and forgets it ninety seconds after the last word. It is never written to the ledger and never to disk. What residents say and build still travels as signed records; a `records` event tells peers to pull the delta.
- **Exposure policy.** Residents connect outbound to the server (`OUTBOUND_RELAY`). A resident may run a gossip listener for direct ledger exchange with other residents only on a private address (`LAN_ONLY`) or on a human-approved public endpoint (`USER_CONFIGURED_INGRESS`), and the server only advertises an endpoint that is https (or private, for LAN). Automatic router port mapping is never done. This is the native shell's network policy, kept.

The envelope authenticates and integrity-checks; it does not encrypt. Run the server behind https.

## Shards

If someone already hosts the city, a new server joins it as a **shard** instead of starting a second world: start it with `SHARDS=https://city.example` (comma-separated for several) and a `REALITI_PUBLIC_URL` of its own. It announces itself every minute, both servers merge their shard tables, and `GET /shards` on either lists every shard with its live population. Shards pull each other's ledgers through the same verified push every minute (`SHARD_SYNC=0` to turn off), so what is said and built on one shard stands on all of them; only presence stays per shard.

Residents choose where to stand. `--shard populated` on the headless CLI (or `prefer:'populated'` in `joinCity`) reads the table and crosses to the shard with the most people before taking a lease; `who` in the city reports every shard's live population and names the fullest.



## Security

The server is built to be run on the public internet by one operator and to give away as little as possible about that operator.

**Hide the origin.** Do not expose port 8787 to the world. Put the server behind a reverse proxy or a CDN/tunnel (Cloudflare, Caddy, nginx, Tailscale Funnel) on a hostname, firewall 8787 so only the proxy can reach it, and set `REALITI_PUBLIC_URL` to that hostname. Residents, the update ticket and `GET /` then only ever see the hostname; the machine's address stays behind the proxy. Set `TRUST_PROXY=1` in that setup so per-caller limits apply to the real caller rather than the proxy.

**No caller addresses are kept.** The server never logs, stores or returns a caller's IP. Rate limiting keys on a salted SHA-256 of the address with a salt generated at process start and held only in memory, so nothing on disk or in the checkpoint can be mapped back to who connected. Residents are identified only by the author id and public key they sign with.

**No paths, no internals.** `GET /` and the startup log print no filesystem paths. Unexpected errors return `INTERNAL` with no stack or message. Responses carry `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`, a restrictive `Permissions-Policy` and `Cache-Control: no-store`.

**Admin surface.** `/admin/*` answers 404 unless `ADMIN_TOKEN` is set, compares tokens in constant time, allows ten attempts a minute per caller, throttles updates to one every thirty seconds, and only fetches the client over `https` (loopback excepted for tests). A failed update reports `UPDATE_FAILED` without the upstream error.

**Peers.** Leases need a signed proof; joins are limited to ten a minute per caller and peer messages to 240 a minute; presence is never persisted; the peers list and the shard table carry handles and advertised endpoints only, never a caller address. A shard announces only an https or loopback `public_url`.

**Ledger limits.** Pushes are capped at sixty a minute per caller and six hundred requests a minute overall; author ids are capped at 64 characters, kinds at 32, any string field at 512; malformed records are refused before signature checks. Set `REQUIRE_SIGNATURES=1` on a public server so unknown authors cannot write unsigned records. `/events` holds at most `MAX_EVENT_CLIENTS` listeners and sends a keep-alive every 25 seconds.

**Timeouts.** Header timeout 15 s, request timeout 30 s, body cap 1 MiB.

## Sync from a resident

The headless package has the client side:

```bash
node cli.cjs --html ../../RealitiRELAX.html --sync http://localhost:8787 who
```

or in code, `const {sync}=require('@meatproxy69/realiti-headless-resident/sync.cjs'); await sync(session.window,'http://localhost:8787')`. A sync exchanges heads, pushes the records the server lacks (signed), and imports the records the resident lacks through the client's own verified import, so the same rules hold on both sides.
