# CoNest 0.6.0: versioned Loader runtime

Baseline: unmodified OpenClaw 2026.9.2, Cordis 4.0.1, DSH-vendored Loader 1.0.2, Node.js 24.15.0, Linux x64. This is the implementation and qualification record for trusted read-only components, not a public marketplace launch or arbitrary DSH compatibility certification. The 0.5.1 archive and earlier paid-model evidence remain historical.

## Implemented behavior

The supervised worker now retains one context and one native Loader. Component entries are shared across graphs only while their manifest, integrity, configuration, and dependency instances are unchanged and ready. Affected dependencies and consumers receive new entries. The application service scope is restricted to the component's declared dependency closure; the built-in search entry owns its DSH infrastructure.

Management prepares a detached candidate, checks actual readiness and declared registrations, persists accepted configuration, and then publishes one graph token. Calls already admitted, including queued calls and later nested calls, retain the original graph. Old entries survive until all graph owners and admitted calls release them. Policy/permission changes still revoke grants and cancel tasks across every retained graph. Configuration reversion cannot revive an old token.

Loader mutations and retirement are serialized. Native asynchronous cleanup is awaited; structured unloading errors remain observable even when Cordis resolves a disposal promise. An uncertain cleanup marks the worker degraded and requires operator review/restart; publication is not falsely reported as rolled back. Concurrently draining graphs cannot remove one another's bookkeeping entries.

## Reproducible evidence

Developer-side reports are deliberately outside the installation archive. A report establishes only its recorded run and tested hashes; absence of a report is not a pass. A later failed run does not invalidate history, but history does not certify the later candidate.

| Gate | Command and evidence |
| --- | --- |
| Types and complete local regression | `pnpm run typecheck`; `pnpm test`. Tests include real DSH search, public policy handling, worker failure/recovery, management persistence, and Loader graph scenarios. |
| Emitted JavaScript graph acceptance | `pnpm run test:runtime`; `reports/conest-0.6.0/runtime.json` and `runtime.tap`. Records tested source/built hashes, pinned framework entry hashes, and exact test totals. The emitted files under `lib/src` must match the distributed `dist` files. |
| Official host discovery and activation | `pnpm run test:openclaw`; `reports/conest-0.6.0/openclaw-inspection.json`. |
| Official Gateway main Loop | `pnpm run test:e2e`; `reports/conest-0.6.0/e2e.json`. A local deterministic model fixture chooses tools; the host executes native read, real DSH search, discovery, and the installed verifier. |
| Relocatable archive and lifecycle | `pnpm run test:installation ARCHIVE.tgz`; `reports/conest-0.6.0/installation.json`. Match its `archiveSha256` to the archive's companion checksum. Tests offline archive-only search, pinned host/provider installation, management, stop/start, and failure recovery outside the checkout. |

The focused graph suite covers overlapping revisions sharing an unchanged provider; old nested calls after a second update; unrelated port/cache/listener preservation; activation and persistence failures; reverse-order concurrent retirement; literal JSON configuration; no-op/scheduler-only changes; awaited asynchronous disposal; private Loader management; dependency removal/recovery; conflicting updates; stale grants and configuration reversion; lease exhaustion; cancellation during preparation; revocation across retained graphs; shutdown during activation; and logged cleanup failures. Each fixture verifies every acquired listener/resource is released exactly once. The unrelated component owns a real loopback TCP listener, not a mocked port.

## Compatibility and limits

- The OpenClaw plugin ID remains `dsh-bridge`, and the four tool names, policy layers, protocol version 3, profile paths, and command aliases remain stable. Installing this Connector update requires restarting its service; live component management does not replace the worker code.
- Component `inject` is a string array. An application service provided elsewhere must come from a declared component dependency, directly or transitively. Multiple competing providers are rejected. Components relying on unrelated ambient services, Loader self-modification, or another DSH Agent Loop are not supported by this contract.
- The example is `source-verifier@1.3.0`. Older third-party `bridgeVersion` ranges that exclude 0.6 must not be silently widened. Review, test, and publish a new compatible component bundle; old snapshots are retained.
- Handlers must honor cancellation and await their nested work before returning. Invocation authority cannot be retained for later detached work. Providers reused by candidate and accepted consumers must support that overlap without irreversibly modifying accepted state during candidate startup.
- Cordis scopes are not OS isolation. Trusted JavaScript can still access `ctx.root`, module globals, environment/files available to its OS user, and external systems. Managed rollback does not undo arbitrary imports or external effects. An uncooperative plugin may require terminating the worker; interrupted tasks are never replayed automatically.
- Initial missing dependencies remain explicitly degraded. A candidate that loses previously ready components unexpectedly is rejected; intentional provider removal may leave dependents blocked. Loader settlement is not itself a readiness certificate.
- Agent Plugins 1.0 catalog interoperability, additional real DSH plugin qualification, the unified market UI/catalog, other host connectors, paid-model requalification, and deployment remain separate work. No paid inference is required by the commands above unless an explicit live flag is added.
