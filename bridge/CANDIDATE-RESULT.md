# CoNest 0.6.1 — verified local candidate

Verified on 2026-09-07, Linux x64 / Node 24.15.0 / OpenClaw 2026.9.2. This is a private installable candidate, not a public release or a change to an existing deployment.

[Candidate archive](./releases/candidates/0.6.1/local-conest-connector-0.6.1.tgz) · [Checksum](./releases/candidates/0.6.1/local-conest-connector-0.6.1.tgz.sha256) · [Machine-readable qualification](./reports/conest-0.6.1/candidate.json)

SHA-256: `a8e1215a47226e3f15744f5d57641edc5ac3855d807e071eb8f0a08a561f6809`

The archive includes 40 bundled runtime packages and the optional workspace context example. Verification matched all 29 emitted Connector JavaScript modules against the archive and linked the exact archive to its clean-install/Gateway reports.

| Check | Result |
| --- | --- |
| Full automated suite | 77/77 passed |
| Emitted Loader graph regression | 18/18 passed (also covered by the full suite) |
| Additional DSH compatibility profile | 10/10 passed |
| Default-off Gateway flow | Passed, 8 local fixture model requests |
| Context/session/diagnostics Gateway flow | Passed, 16 local fixture model requests |
| Clean archive installation and lifecycle | Passed, 7 acceptance checks |
| Gateway using installed archive and host | Passed, 16 local fixture model requests |

The session-reset regression found and fixed a real ownership bug: the host's runtime cleanup callback also handles scoped session resets. Scoped cleanup now preserves the shared worker and tool registry; a reset neither restarts that worker nor disables context for the new session on the same key. Global cleanup still releases ownership.

Context diagnostics expose shared, payload-free counters with fixed reason codes and timing. Context progress cannot populate ordinary progress snapshots. Provider output still passes the opt-in identity, tool, workspace, policy, generation, deadline and size gates described in [CONTEXT-PROVIDERS.md](./CONTEXT-PROVIDERS.md).

Recheck the archive and current recorded evidence without paid inference:

```sh
node scripts/verify-candidate.mjs releases/candidates/0.6.1/local-conest-connector-0.6.1.tgz
```

Old archives/reports are unchanged. All test services were stopped. No paid inference, channel connection, publication or production deployment was performed. This is not a session/history API, a semantic retrieval benchmark or a hostile-code sandbox; see [qualification boundaries](./HOST-ENHANCEMENT-ACCEPTANCE.md).
