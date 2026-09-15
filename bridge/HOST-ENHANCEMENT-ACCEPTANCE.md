# CoNest 0.6.1 local candidate: host enhancement acceptance

This private candidate combines the static guidance and dynamic workspace context slices with session lifecycle cleanup and payload-free operator diagnostics. It is not a public release, production deployment, paid-model qualification or full DSH host-service adapter. The 0.6.0 archives and their reports remain historical and unchanged. OpenClaw 2026.9.2 remains the only supported host; its core and the DSH upstream snapshot are unmodified.

## Included behavior

- Optional authority-gated static guidance and one explicitly selected `workspace-v1` context capability; both default off.
- Real DSH source retrieval before model tool calls, without another model loop or transcript/history API.
- Bounded task input, output, duration and outstanding work; live provider/policy/generation revalidation and no stale-result cache or retry.
- Call/run cleanup plus the public `session_end` hook. Session IDs, not reusable session keys, select cancelled work; explicit agent identities must agree. This is lifecycle metadata, not an emulated DSH Session service.
- OpenClaw invokes runtime cleanup for scoped session resets too. Session/run-scoped cleanup keeps the shared worker and plugin registry alive; only global cleanup releases ownership. The real reset regression covers continued context on the reused key.
- Shared context outcome counters across service and request-time registries, visible through authenticated status routes and `/conest`. Counters retain only fixed reason codes, aggregate counts and timing; no task text, source content or session/requester IDs. Context invocation progress is excluded from ordinary progress snapshots. Trusted components can still write their own logs, which this is not an OS sandbox against.
- Existing one-use grants, requester/dependency policy, versioned Loader behavior, component management and worker recovery remain in force.

See [CONTEXT-PROVIDERS.md](./CONTEXT-PROVIDERS.md) for the opt-in contract and security boundaries. In particular, already-delivered context may remain in OpenClaw history; session cleanup does not delete it. JSON labeling does not eliminate prompt injection from source material.

## Reproducible qualification

The developer checkout owns tests/reports; they are not bundled in the candidate. Match reports to the actual package version and archive checksum before claiming qualification. Previous-slice reports do not qualify this artifact.

```sh
pnpm test
pnpm run test:runtime
pnpm run test:openclaw
CONEST_REPORT_PROFILE=conest-0.6.1 node scripts/test-e2e.mjs --context-provider --capability-guidance
CONEST_REPORT_PROFILE=conest-0.6.1-default node scripts/test-e2e.mjs
CONEST_REPORT_PROFILE=conest-0.6.1 node scripts/test-dsh-compat.mjs
node scripts/pack-release.mjs --out /absolute/new-candidate-directory
node scripts/test-installation.mjs /absolute/new-candidate-directory/local-conest-connector-0.6.1.tgz --host-enhancements
```

| Evidence | Location in the developer checkout |
| --- | --- |
| Emitted Loader graph regression | `reports/conest-0.6.1/runtime.json` and `runtime.tap` |
| Official host inspection | `reports/conest-0.6.1/openclaw-inspection.json` |
| Context, policy, shared diagnostics and native session reset | `reports/conest-0.6.1/e2e.json` |
| Default-off compatibility | `reports/conest-0.6.1-default/e2e.json` |
| Real DSH compatibility regression | `reports/conest-0.6.1/dsh-compatibility/` (developer profile, not extra bundled features) |
| Exact archive installation and lifecycle | `reports/conest-0.6.1/installation.json`, matched by `archiveSha256` |
| Gateway using the archive-installed Connector and host | `reports/conest-0.6.1-archive/e2e.json`, also summarized and hash-linked in the installation report |

The archive test first installs bundled runtime code offline with lifecycle scripts disabled, checks dependency hashes and real DSH search without a host/source checkout, then installs the pinned official host/provider from npm for owned service lifecycle tests. `--host-enhancements` runs the deterministic-model Gateway tests against that installed artifact, not the checkout's runtime. Downloads may use the network; no inference provider is called. Scratch services and directories are cleaned up after verified shutdown.

Candidate archives contain the context provider example and its instructions. `workspace-context@0.1.0` now requires `>=0.6.1 <0.7.0`, the first versioned package with the contract. Existing source-verifier `>=0.3.0 <0.7.0` compatibility already includes 0.6.1 and is not widened. Stop the old Connector/Gateway before replacing its installation; do not hot-swap implementation files or reuse old in-process shared owners.

## Not qualified by this milestone

No paid inference was authorized for this candidate. Do not copy 0.6.0 live-provider reports or run the paid-release equivalence verifier against them. Session/history services, unrestricted Cordis host API access, channel/browser UX, public marketplace installation, unattended deployment, other OS/host versions and hostile-code isolation remain outside this candidate.
