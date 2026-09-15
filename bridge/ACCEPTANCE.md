# CoNest Connector: historical acceptance baseline

Current 0.6.0 runtime scope and evidence locations are documented separately in [RUNTIME-ACCEPTANCE.md](./RUNTIME-ACCEPTANCE.md). The historical record below is unchanged.

The record below belongs to DSH Bridge 0.5.0, before its rename to CoNest Connector 0.5.1. Its measured results, release hashes, and report links remain historical and have not been relabeled. Current naming and compatibility are documented in [NAMING.md](./NAMING.md); new checks write separately to `reports/conest-0.5.1/`. No new paid-model qualification is implied by the rename. The historical release artifact remains `releases/local-openclaw-dsh-bridge-0.5.0.tgz`.

---

# Standalone local pilot and first-stage regression acceptance: Bridge 0.5.0

Date: 2026-09-07  
Baseline: unmodified official OpenClaw 2026.9.2, Node.js 24.15.0, pnpm 11.7.0, Linux x64

## Outcome and scope

The six first-stage gates in the preserved [DESIGN-zh.md](../DESIGN-zh.md) pass for the local, trusted-component, read-only reference scenario. This is an integration acceptance result, not a production, multi-tenant, hostile-code, real-model-quality, or live-channel certification.

The earlier 0.2.0 prototype checks did not establish arbitrary component installation or a complete host main-Loop task. Historical migration/source tests are not counted as evidence for this release. Version 0.3 established the first-stage reference flow; 0.4 adds capability-level authorization and reruns that baseline.

Version 0.5 completes the standalone local pilot: a private Linux x64 archive, a dedicated setup/doctor/start/status/ask/stop interface, and clean-install operation with the official DeepSeek provider. Two direct real-model tasks pass, including a nested permission denial. This does not complete broad model-quality evaluation, live-channel qualification, or a multi-user production deployment. Exact host-policy boundaries and the explicit hook permission are documented in [AUTHORIZATION.md](./AUTHORIZATION.md).

## Standalone installation and direct-provider evidence added in 0.5

The archive contains 40 pinned runtime packages and their licenses, with no source-workspace dependency links. A fresh directory outside the checkout installs the Bridge archive offline with no host peers or install scripts and executes real DSH search. The test checks each bundled package's complete file count and content hash against `runtime-lock.json`, including native assets. Official OpenClaw and its DeepSeek provider are then installed separately at exactly 2026.9.2. The current profile is Linux x64, glibc, and Node 24 ABI 137 only; the recorded build glibc is a conservative minimum, not a broader portability claim.

The clean-install tests pass private profile creation, official configuration validation, same-worker component installation/invocation, idempotent start/stop, component persistence over restart, actual Gateway SIGKILL visibility, and explicit recovery without replay. `/proc/<worker>/environ` confirms that the component worker did not inherit the provider key, Gateway token, or loader overrides. The original private credential file is referenced, not copied into configuration, and is retained after test cleanup.

The clean installation also passes two real DeepSeek tasks using the official provider's direct streaming path, without the recording transport used in the historical 0.4 test. Both task receipts identify provider `deepseek`, effective response model `deepseek-v4-flash`, and harness `openclaw`; neither is rerouted or uses a fallback. See the exact run time, archive hash, and usage in [the direct-provider clean-install report](./reports/installation-live.json).

- The successful task used native `read`, real `knowledge_search`, `bridge_capabilities`, and `bridge_invoke`, with four successful tool calls and an exact source-backed final CLI result.
- The restricted task discovered the verifier, attempted one dependent invocation, consumed an actual worker denial, and returned `POLICY_PROBE_BLOCKED`. There was exactly one tool failure and one worker policy-denial increment, with no bypass or retry.
- Host-reported task usage and assistant-turn counts are retained in each task's metadata. Cost fields are local estimates, not the account bill; a report describes that run, not total account usage including earlier candidate checks.

Installation reports identify the exact tested archive by SHA-256. Both the [non-inference installation report](./reports/installation.json) and the direct-provider report are checked against the final archive in [the release verification report](./reports/release.json). The verifier can also compare a future documentation-only repack's runtime fingerprint with a live-tested candidate; it refuses changed compiled code, examples, plugin metadata, or dependency hashes. See [installation commands](./INSTALLATION.md).

Startup checks service reachability rather than requiring a specific visible capability. A clean restart with an empty main-Agent allowlist and a disabled search dependency succeeds with `bridgeState: degraded`; live dependency/policy restoration returns it to `ready`. A temporarily unreachable worker is reported as `unavailable`, not falsely healthy. Native host exclusions and worker policy denials remain enforced independently of service readiness.

The local service is an explicit single-user CLI pilot, not a global or boot-time service. Tests stop all owned services and remove temporary installations. No persistent user profile or live channel is deployed. The two synthetic, explicitly instructed tasks are not a statistical model-reliability or thinking-mode qualification.

## Design gate evidence

| Gate | Result | Actual behavior exercised |
| --- | --- | --- |
| 1. Install, discover, and call without adapter edits | Pass | The official Gateway starts without `source_verify`; the CLI installs the separate example bundle into the same live worker. `bridge_capabilities` exposes its provider and schema, and the main Loop calls it through `bridge_invoke`. The adapter entry hash is unchanged during the workflow. |
| 2. Dependency absence, recovery, disable, and replacement | Pass | A missing component dependency prevents its activation body and listener from running. Installing the dependency recovers it. Disabling/re-enabling updates availability. Live injected Cordis service withdrawal also removes provider/consumer capabilities and listeners, interrupts cooperative work, and recovers without reload. Successful upgrades preserve the old version for already admitted work. |
| 3. Unload releases resources and preserves unrelated/native functions | Pass | Listener counts are asserted before and after disable, failed activation, replacement, uninstall, and shutdown. Removed capabilities cannot be invoked. Unrelated DSH search remains callable. Official native `read` participates in the main Loop; native `session_status` remains usable while the DSH dependency is disabled and after worker termination. |
| 4. Real authorization and failure behavior | Pass | Tests reject missing permissions, forged identity, replayed/revoked/expired grants, stale generations, undeclared nested dependencies, and recursive calls. Actual queued/running work is cancelled. SIGKILL rejects an interrupted invocation without replay; the next request recovers. Ignored cancellation and a blocked event loop are forcibly reaped. Failed upgrades preserve both accepted code and manager-owned configuration. Official per-agent denial of `bridge_invoke` returns HTTP 404. |
| 5. Real DSH service dependency and recorded compatibility | Pass | `@deepseek-ai/dsh-tool-fs-search` 0.1.0-rc.5 executes actual grep with DSH tools/system-prompt/local-subprocess services 0.1.0-rc.5 and Cordis 4.0.1. The newly installed verifier depends on the Bridge contract `dsh-search@0.2.0` and invokes that real search service twice. See compatibility limits below. |
| 6. Unmodified release and a complete main-Loop task | Pass | Official runtime inspection loads four tool contracts with zero diagnostics. An isolated official Gateway receives `openclaw agent` through its normal client path and completes native read → DSH search → discovery → new verifier → final CLI delivery. No host-core imports or patches are used by the adapter. The installed official CLI entry hash is unchanged by the test. |

New capability access uses the stable discovery/invocation pair; it does not dynamically add a separately named native OpenClaw tool for every component capability.

## Reproduction and artifacts

Run from `bridge/` with the required Node and pnpm on `PATH`:

```sh
pnpm run typecheck
pnpm test
pnpm exec openclaw plugins build --root .
pnpm exec openclaw plugins validate --root . --json
pnpm run test:openclaw
pnpm run test:e2e
pnpm run benchmark
```

The final run produced:

- Strict type checking: pass.
- Unit/process/lifecycle/recording-transport/local-profile tests: **35 passed, 0 failed**.
- Official package validation: `valid: true`, no errors.
- Official runtime inspection: loaded and activated, four tools, worker service, slash command, authenticated HTTP route, zero diagnostics; [inspection report](./reports/openclaw-inspection.json).
- Official Gateway end-to-end: **eight model requests**: five for the successful reference workflow and three for an adversarial generic-call policy probe. The successful agent result remains `status: ok`, `summary: completed`; [full task trace and result](./reports/e2e.json).
- Functional benchmark assertions: pass, zero running/queued/registered tasks after completion; [benchmark report](./reports/benchmark.json).
- Language boundary: newly authored source, tests, scripts, examples, and prose are English except user-facing strings in `src/ui.ts`. Generated task traces naturally contain those rendered UI results.

`test:e2e` uses a local deterministic OpenAI-compatible fixture. It only supplies model tool choices and checks tool results received from OpenClaw; it does not execute the tools or fabricate their results. The new capability name, provider, schema, and generation are read from the actual discovery response. The final result is emitted only after the actual verifier returns matching source evidence.

The fixture proves host orchestration and result transport. It does not prove that a production model would choose the correct tools or judge factual claims. “Delivery” here means the final result returned through the Gateway agent CLI, not an external chat-channel send. No persistent Gateway is deployed by the test.

## Historical 0.4 recording-transport DeepSeek reference

On 2026-09-07 at 05:59:12 UTC, the official Gateway completed the same integration flow using real `deepseek-v4-flash` decisions from the official DeepSeek API, with thinking disabled. Both Agent tasks returned `status: ok`, `summary: completed`, and used the OpenClaw harness. See [the real provider trace and usage](./reports/live-deepseek.json).

- Successful workflow: three model requests. Flash requested native `read`, real `knowledge_search`, and `bridge_capabilities` in its first response; after consuming their results, it used the discovered generation to invoke `source_verify`, consumed `verified: true`, and delivered the exact source sentence with its filename.
- Denial workflow: three additional model requests. Flash discovered the catalog, attempted one dependent verification, received an actual worker denial for the underlying `knowledge_search` capability, and stopped with `POLICY_PROBE_BLOCKED`. The worker denial counter increased exactly once, and the model did not retry or claim successful verification.
- The live run also retained same-worker installation, failed-upgrade rollback, explicit host/tool/operator policy checks, dependency disable/recovery, uninstall, native-tool survival after worker termination, and subsequent worker recovery. Adapter and official CLI entry hashes were unchanged.
- DeepSeek reported 27,619 input tokens (including 18,048 cache-hit tokens) and 655 output tokens across the six successful-run requests. These numbers exclude the initial failed diagnostic attempt; they are not a total account bill. The host's custom-route zero cost estimate is not the provider charge.
- The initial diagnostic attempt exposed two test-harness assumptions: implicit multi-Agent workspace layout broke a relative native read, and OpenClaw-normalized call IDs differed from upstream IDs. The runner now sets an explicit main workspace and correlates tool results against actual host history. Neither issue required changing the adapter or official host core.

Reproduce explicitly with `pnpm run test:live:deepseek` after configuring the private credential file described in [README.md](./README.md). This command makes paid API requests. The local transport only records and forwards model traffic: it uses upstream non-streaming completions and emits SSE to the host. It does not execute or simulate tools. Each run is bounded to 12 upstream requests, 400,000 serialized input bytes, and 2,048 output tokens per request; uncertain upstream failures stop further upstream calls without automatic replay. Three offline transport tests cover privacy checks, limits, truncation rejection, and fail-stop behavior.

This is a successful synthetic, explicitly instructed real-model reference run, not a statistical reliability claim, an autonomous tool-selection benchmark, a thinking-mode test, native DeepSeek streaming/provider-plugin certification, a live-channel test, or a persistent deployment.

## Capability-policy evidence added in 0.4

- Default, Agent, requester, operator, and host-ceiling rules intersect. Empty allowlists deny all. Malformed rules are rejected.
- Requester rules bind channel/account/sender and reject missing or unmatched identities. Actual external channel transport is not certified by these unit tests.
- Worker-side discovery, direct calls, generic calls, and dependent calls use the same capability rules. Nested permissions are also intersected with the worker-wide read ceiling.
- The official Gateway's `nosearch` Agent denies only the native `knowledge_search` tool. Direct host lookup returns 404; both generic search and indirect search through `source_verify` are refused by the worker. A real main-Loop probe deliberately attempts generic search after discovery omits it and receives a policy refusal.
- A separate worker Agent rule denies direct search and generic verification while another Agent remains able to search. Operator CLI policy is enforced and its catalog is filtered; supplying an Agent principal on the operator socket is rejected.
- Principal changes and host-ceiling widening invalidate a one-use grant. Live policy updates revoke unused grants, cancel running/queued work, and terminate uncooperative work without replay. Invalid policy updates preserve the accepted disk contents.
- Gateway HTTP worker denials currently surface as 500, distinct from native tool exclusion's 404. The test also checks the worker denial counter, so an unrelated transport failure cannot count as successful enforcement.

## Measured baseline

Observed on a four-logical-CPU AMD EPYC 9754 allocation, 200 fixture files, 40 matching files:

| Metric | 0.5.0 observation |
| --- | ---: |
| Worker cold start, p50 / p95 | 273.80 / 300.29 ms |
| Warm status round trip, p50 / p95 | 0.82 / 1.18 ms |
| Authorized no-op invocation, p50 / p95 | 1.11 / 2.56 ms |
| DSH search, p50 / p95 | 14.16 / 17.91 ms |
| Dependent verification, p50 / p95 | 21.98 / 29.21 ms |
| Twelve 50 ms calls at concurrency four | 160.35 ms total; peak 4 active, 8 queued |
| Caller cancellation / worker drain | 2.20 / 4.17 ms |
| Worker RSS after benchmark | 91,893,760 bytes |

These are reproducible workload observations, not portable service-level objectives. No numerical performance acceptance threshold was invented.

## Security, lifecycle, and compatibility limits

- Installed component code is trusted. A worker process isolates crashes and lifecycle, not arbitrary filesystem, environment, credentials, or network access. Manifest permissions and bundle hashes are not an OS sandbox.
- Only `workspace:read` is supported. The adapter rejects sandboxed host tool contexts and incompatible workspace-only roots. Worker grants bind identity, task/call, parent run, canonical workspace, permissions, generation, and expiry; nested calls recheck permissions.
- `bridge_invoke` cannot broaden worker capability rules or its host-derived ceiling. The tested native search denial also blocks generic and dependent access. Arbitrary argument-sensitive native hooks and approval prompts are not reproduced for nested service calls; use Bridge capability policy for restrictions that must govern every Bridge entry point.
- Same-user Unix-socket CLI access is explicit operator authority, not a remote/multi-tenant endpoint. One process owns a configuration; separate host processes cannot share the private task pipe.
- Component upgrade prepares an entire candidate generation. Active old tasks pin their original generation. Component activation must be reversible: configuration rollback cannot undo arbitrary external effects. Cleanup errors are observable through degraded status where propagated and Cordis stderr logs; restart is the containment boundary for uncertain cleanup.
- Interrupted calls are never automatically replayed. Uncooperative work is terminated at the process boundary. Automatic restart is bounded and happens for a new request, not a retry of the interrupted operation.
- Installed snapshots are content-addressed and retained after uninstall/failed upgrade for recovery. Automatic pruning and public registry distribution are not included.
- DSH qualification covers the restored local snapshot and standalone ripgrep-backed filesystem search with real service dependencies. Session history, inference events, spill/retention variants, executor/UI components, arbitrary DSH plugin loading, and multiple Agent Loops are not certified.
- Search is literal and bounded; exact source occurrence is not factual verification. Semantic search, mutating tools, organization governance, autonomous plugin generation/publishing, distributed execution, and hostile-code isolation remain outside this stage.
- Paid-provider evidence is limited to the DeepSeek Flash non-thinking reference runs above. Linux standalone installation and direct-provider streaming are covered by the 0.5 checks; external messaging channels, browser rendering, Windows/macOS, and other Node ABIs remain unqualified.
