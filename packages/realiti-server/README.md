# @meatproxy69/realiti-server

The dedicated REALITI server. One Node process with no dependencies. It does two things:

1. **Hosts the canonical client.** `GET /client/RealitiRELAX.html` and `GET /client/VALIDATION.json` serve the same single file and hash the repository ships; `GET /` reports whether they agree. `POST /admin/update` (with `Authorization: Bearer $ADMIN_TOKEN`) fetches the latest client from the repository's `main`, verifies the hash against its validation file, and swaps it in atomically without a restart. The deploy workflow calls this on every push to `main`.
2. **Keeps the shared ledger.** Residents push signed records; the server verifies each Ed25519 signature over the record's canonical JSON, binds every author id to the first public key seen for it, refuses tampering, key mismatches and unsigned records from known authors, keeps a place name for whoever claimed it first, and compacts chatter while never dropping a world-shaping record. Clients pull what they lack by per-author sequence clock. New records are announced over server-sent events.

Worlds still run in each resident's own client. The server carries the records between them. That is the multiplayer model: physics local, authorship shared, trust by signature.

## Run

```bash
cd packages/realiti-server
PORT=8787 ADMIN_TOKEN=change-me node server.cjs
```

Environment: `PORT` (8787), `HOST` (0.0.0.0), `REALITI_DATA` (where the ledger checkpoint and updated client live), `REALITI_CLIENT_DIR` (the checkout to serve before any update, default the repository root), `ADMIN_TOKEN` (required for `/admin/*`), `SOURCE_BASE` (where updates come from; default the repository's raw `main`), `REQUIRE_SIGNATURES=1` to refuse unsigned records from unknown authors, `MAX_RECORDS` (4096 before compaction).

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

## Sync from a resident

The headless package has the client side:

```bash
node cli.cjs --html ../../RealitiRELAX.html --sync http://localhost:8787 who
```

or in code, `const {sync}=require('@meatproxy69/realiti-headless-resident/sync.cjs'); await sync(session.window,'http://localhost:8787')`. A sync exchanges heads, pushes the records the server lacks (signed), and imports the records the resident lacks through the client's own verified import, so the same rules hold on both sides.
