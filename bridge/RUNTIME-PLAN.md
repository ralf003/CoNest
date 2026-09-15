# CoNest runtime and package interoperability plan

Status: Loader feasibility and versioned runtime integration implemented in Connector 0.6.0; release qualification is recorded in [RUNTIME-ACCEPTANCE.md](./RUNTIME-ACCEPTANCE.md) and its versioned reports. The first expanded real DSH qualification slice is recorded in [DSH-COMPATIBILITY.md](./DSH-COMPATIBILITY.md); promotion into shipped components and market implementation remain pending. The existing private Connector 0.5.1 and 0.6.0 archives are unchanged. OpenClaw 2026.9.2 remains the sole target host, and its core is not modified.

## Product and ownership

Host-integration slices are tracked in [HOST-ADAPTER.md](./HOST-ADAPTER.md) (extracted hooks and static guidance) and [CONTEXT-PROVIDERS.md](./CONTEXT-PROVIDERS.md) (one explicit, bounded dynamic workspace provider). The private [0.6.1 candidate](./HOST-ENHANCEMENT-ACCEPTANCE.md) combines these with session-end cleanup and shared payload-free diagnostics and requires exact-artifact qualification. This is not full DSH host-service interoperability or a change to the existing archives.

CoNest is the unified market and management platform. CoNest Connector for OpenClaw owns host integration through public extension APIs. CoNest Runtime owns DSH/Cordis component execution. Cordis and DSH remain upstream technologies, not market branding.

The market manages discovery, source provenance, pinned releases, installation requests, compatibility evidence, and user-visible state. It does not replace each ecosystem's runtime semantics. A package being indexed, structurally valid, installed, ready, and authorized for a particular caller are distinct states.

## Stage 1: native Loader feasibility

The executable [Loader experiment](./experiments/loader/README.md) uses the DSH-vendored Cordis 4.0.1 and Loader 1.0.2 already associated with the runtime dependency closure. It verifies unchanged instance preservation, dependent reactivation, rollback limits, asynchronous disposal, pending dependencies, and isolated revision coexistence.

Decision: reuse native Loader entry reconciliation and service isolation. Do not directly apply an accepted production configuration over existing active entries. Native direct replacement can dispose resources while application calls still reference them; failed activation can restart the old implementation without preserving its previous in-memory state.

## Stage 2: versioned production integration

Retain one long-lived runtime context and one Loader. Unchanged components retain stable entries. Changes produce new entry identities and isolated service labels for the affected graph, while unchanged providers can be shared through explicit ownership. Loader remains responsible for imports and effects; CoNest remains responsible for call admission, version selection, policy, and persistent management state.

The implementation must provide these steps:

1. Parse a detached management candidate and validate manifests, schemas, bundle integrity, component versions, and dependency constraints before executing candidate code.
2. Calculate the affected components using old and new declared dependencies and actual service injection requirements. Changes to shared infrastructure, workspaces, or permissions need explicit handling; an incomplete graph must not silently be treated as a local update.
3. Serialize all Loader mutations. Mount affected candidate entries with separate identities and service labels while retaining accepted entries and unchanged providers. Native groups are not a concurrent transaction coordinator.
4. Validate candidate readiness and declared capability registrations. Loader settlement alone is insufficient because missing dependencies can leave fibers pending. Preserve explicitly supported degraded startup semantics, but do not mistake an unexpectedly pending upgrade for success.
5. Commit persistent management state and publish one immutable capability/graph revision. Calls admitted before publication keep their original revision; later calls use the new one. Nested calls must resolve through the same captured graph, never through a mutable global current-provider lookup.
6. Retain old entries and shared providers until their actual call/graph leases are released. Bound retained revisions and candidate work. Cancellation, policy revocation, timeout, and the existing uncooperative-worker watchdog remain effective; task work is not replayed after worker failure.
7. Retire only entries no longer owned by any accepted, candidate, or leased graph. Await cleanup and surface uncertain cleanup as degraded state. Native Cordis can log a cleanup exception while Loader removal still resolves; track managed cleanup outcomes and relevant structured lifecycle diagnostics instead of treating a resolved promise as proof of clean disposal. A failed candidate must remove only its own effects; a failed management operation must not report candidate state as accepted.

Do not weaken existing authorization checks to make graph reuse easier. Discovery, direct, generic, and nested calls must continue to intersect host, agent/requester, operator, and worker policy. Retain one-use grants and stale-revision rejection. A candidate may perform external actions while starting; no lifecycle mechanism can promise to undo arbitrary external effects.

The implemented graph tests cover overlapping revisions sharing an unchanged provider, failures at activation and persistence, dependency removal, serialized conflicting updates, lease exhaustion, cancellation during update, policy revocation across retained revisions, and full shutdown during candidate activation. Additional cases cover reverse-order concurrent retirement, literal JSON rather than Loader expressions, private management services, and configuration-reversion token reuse. `test:runtime` executes emitted JavaScript and records exact hashes; official OpenClaw main-loop and clean-install results must be checked in same-version reports for the actual artifact. Deployment and paid inference are not implied by those tests.

Implementation details: `src/loader-runtime.ts` owns native entry reconciliation and graph ownership; `src/components.ts` owns per-component capability registrations and graph-bound nested routing; `src/runtime.ts` retains admission, policy revocation, scheduling, and graph leases. Native Loader imports and normalizes approved module exports. CoNest uses Cordis service scopes to expose only the declared dependency closure, rather than guessing ambient service providers or mutating upstream Loader. Shared providers must support concurrent consumers; module globals, root-context access, and irreversible provider mutations remain trusted-component compatibility concerns.

## Stage 3: real DSH compatibility

First slice executed: real filesystem/read, glob, and explicit-root Skill registry/provider profiles, plus actual missing-host probes for native Skill/Todo/Plan. Web is static-review-only and out of scope. The [matrix](./DSH-COMPATIBILITY.md) links 10 passing tests including production worker RPC, exact package content hashes, and explicit limitations. This developer qualification does not add default tools or qualify a new release artifact.

Expand beyond the validated search chain using a small set of real tool/service plugins that do not require a second Agent Loop. Record their exact versions, injected services, host mappings, permissions, result/cancellation behavior, platform constraints, and executed evidence. Do not equate bundled dependency count with compatible plugin count.

Keep unavailable DSH session, executor, UI, and inference-event services explicit. Do not silently emulate them or label dependent plugins ready. Shared services and module-global state must be reviewed before a plugin is qualified for isolated candidate activation.

## Stage 4: market interoperability

Support multiple package formats in one catalog instead of converting every package into an OpenClaw code plugin:

| Package format | Initial installation and execution path |
| --- | --- |
| Agent Plugins 1.0.0 portable Skills/MCP bundle | Reuse supported native OpenClaw bundle handling. |
| Native OpenClaw code plugin | Use OpenClaw's own installer and lifecycle. |
| DSH/Cordis component | Use CoNest component management and the versioned Runtime. |

Agent Plugins 1.0.0 supplies a root `plugin.json`, fixed `skills/` and `mcp.json` locations, and client extension namespaces. It does not supply the CoNest market, a Cordis dependency graph, or a complete permission/provenance system. Keep the published 1.0.0 contract pinned; 1.1.0 is a working draft at the time of this decision. References: [Agent Plugins specification](https://agent-plugins.org/specification), [version status](https://github.com/agentplugins/agent-plugins-spec), [scope not covered by 1.0](https://github.com/agentplugins/agent-plugins-spec/blob/main/FUTURE_CONSIDERATIONS.md), and [OpenClaw bundle handling](https://docs.openclaw.ai/plugins/bundles).

The CoNest catalog should separately store its own stable catalog ID, publisher/source identity, package format, exact source revision and artifact digest, package version, required host/runtime/platform, capabilities, configuration/permission requirements, and compatibility evidence. These are catalog records, not arbitrary extra top-level fields inserted into the standard's closed manifest. A claimed publisher name is not verified provenance, and a package digest is not a publisher signature.

If portable packages need CoNest-specific metadata, use a namespace based on a domain the project controls. Do not claim ownership of an unregistered namespace. Other clients may ignore it, so CoNest-only DSH behavior must be labeled accordingly. Reference: [client extensions](https://agent-plugins.org/plugin-authors/client-extensions).

Recognize format before selecting an installer. Do not treat an OpenClaw native manifest as an Agent Plugins bundle merely because a root `plugin.json` also exists. Delegate existing supported bundle execution to OpenClaw rather than building a competing MCP launcher. The first compatibility acceptance should exercise one simple Skill package and one MCP package on OpenClaw only; other hosts are outside scope.

For a future Agent Plugins validator, use locally pinned validation rules selected by the recognized `$schema`; never fetch a remote schema during package loading. Apply resolved-path containment and report the specified narrow failure boundaries. Format validation does not authorize execution or sandbox a subprocess. CoNest's trust, approval, integrity, credential, and policy checks remain separate obligations.

## Stage 5: market MVP and release qualification

Begin with a curated catalog and explicit user installation, configuration, update, enable/disable, and uninstall flows. A complete public hosting registry, automated submission pipeline, and additional host connectors are not prerequisites. Reuse upstream distribution sources where permitted and pin the installed artifact/revision; do not mutate upstream packages or submit them to another market automatically.

Verify the complete path from selecting an eligible package to an actual host capability, including policy denial and uninstall cleanup. Prepare fresh evidence for the exact release artifact. Marketplace publication, account creation, credential setup, production deployment, and chargeable model qualification require their own explicit scope; none is performed by the current experiment.
