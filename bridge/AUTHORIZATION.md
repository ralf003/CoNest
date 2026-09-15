# Capability authorization in CoNest Connector

The 0.5.1 rename preserves the 0.4/0.5 authorization model and wire identifiers; see [NAMING.md](./NAMING.md). Old version-specific evidence remains historical, not a newly executed test.

Version 0.6.0 retains those policy layers and one-use grants while binding admitted and nested calls to a uniquely identified Loader graph. Returning to identical configuration bytes does not revive an old generation token. A committed policy or permission change cancels tasks across all retained graphs; service isolation is not an authorization grant or a hostile-code sandbox.

The 2026-09-14 development slice also connects the Studio DSH Harness to these four component tools through the official host's finalized tool-authority hook and real tool executor. Both loops use the same worker policy and grants. DSH attempt completion additionally revokes its retained tool proxies and run bindings. See [the integration design and qualification](docs/dual-loop-component-runtime-zh.md). The subsequent [search migration](docs/search-component-zh.md) brings `dsh_grep` and `dsh_glob` through this same policy and lifetime path, with independent capability names and workspace-contained paths. The [read migration](docs/read-component-zh.md) also moves `dsh_read` into an independent component, with the same authorization path and trusted observation handoff for existing guarded Gateway edits. The [memory migration](docs/memory-component-zh.md) moves nine graph tools and automatic memory into `dsh-memory`; filesystem mutation/image tools remain in Gateway. Memory reads and writes have separate permissions. Previously packaged archives are unchanged.

## Scope

This release adds capability-level policy to the existing private-pipe call grants. It is a step toward personal-use hardening, not complete organization governance or an untrusted-plugin sandbox.

The development native tools are `bridge_capabilities`, `bridge_invoke`, `knowledge_search`, `knowledge_verify`, `dsh_grep`, `dsh_glob`, `dsh_read`, and nine `dsh_mcp__reference_memory__*` tools. All CoNest Connector capability execution, including nested service calls, is checked inside the worker. Discovery filters the same policy that invocation enforces. A component can remain ready even when the caller cannot use one of its capabilities.

## Policy configuration

`capabilityPolicy` belongs in the separate CoNest Connector configuration:

```json
{
  "capabilityPolicy": {
    "defaults": { "allow": ["knowledge_search", "knowledge_verify", "source_verify"] },
    "agents": {
      "researcher": { "allow": ["knowledge_search", "source_verify"] },
      "restricted": { "deny": ["knowledge_search", "knowledge_verify", "source_verify"] }
    },
    "operator": { "allow": ["knowledge_search", "knowledge_verify", "source_verify"] },
    "requesters": [],
    "requireRequester": false
  }
}
```

For a standalone policy file, omit the outer `capabilityPolicy` property. Apply it with `policy set FILE`; see [the example](./examples/capability-policy.json). Existing configurations with no policy retain the worker ceiling; configuring a memory file adds default memory read/write permissions only when no explicit permission array exists. Use explicit allowlists to prevent a future installation from automatically becoming accessible.

Rules accept `allow` and `deny` arrays of capability names or `*` patterns. Omitted `allow` imposes no additional allowlist; `allow: []` denies everything. Unknown fields and malformed patterns are rejected. Rules intersect: a matching Agent or requester rule cannot override a default denial or grant a capability outside the default allowlist. Every nested dependency call must also be allowed; allowing only a verifier does not implicitly authorize search.

The layers are:

| Caller | Effective constraints |
| --- | --- |
| OpenClaw Agent | Worker defaults + matching Agent rule + requester rules + host-derived ceiling + worker/task permissions |
| Local operator CLI | Worker defaults + operator rule + worker permissions |
| Nested component | The same immutable call constraints, plus its declared component dependency and input/output schemas |

`status` is an operator inventory and can include capabilities denied to the caller; `catalog` is the filtered callable surface. A denied nested dependency may only be detected when the component attempts that call because manifests declare component dependencies, not an exact per-operation call graph.

## Requester identity

Requester rules use an exact `{channel, accountId, senderId}` tuple supplied by OpenClaw, never model arguments. Example:

```json
{
  "defaults": { "allow": ["knowledge_search", "source_verify"] },
  "requesters": [
    {
      "channel": "telegram",
      "accountId": "work",
      "senderId": "123456",
      "allow": ["knowledge_search", "source_verify"]
    }
  ],
  "requireRequester": true
}
```

A nonempty requester list is closed: Agents with an incomplete identity or no matching tuple are denied. All matching rows intersect. Do not assume the same sender ID identifies the same user on a different channel or account. `requireRequester: true` with an empty list requires a complete identity but does not introduce a membership list. With no requester rules and the flag unset, CLI-originated Agent turns may use the defaults and Agent rule without a channel sender.

The operator CLI has a separate principal and does not impersonate a channel sender. Operator requests cannot inject principal or policy fields. Local operators can administer the policy itself, so these rules are not a security boundary against the OS account owner. Actual channel-specific identity transport remains to be qualified with a real channel; the tuple rules and grant binding are covered by deterministic tests.

## OpenClaw policy integration

Use the public hook permission in the OpenClaw plugin entry:

```json
{
  "enabled": true,
  "hooks": { "allowConversationAccess": true },
  "config": { "configFile": "/absolute/config/bridge.json" }
}
```

The post-policy `before_prompt_build` hook checks the finalized availability of the two convenience tools while OpenClaw's ephemeral authority is active. It stores only additional denials for the owning run. It does not retain the authority object or use its fingerprint as a bearer token. Negative restrictions can accumulate but cannot widen during a run; run completion and expiry remove the snapshot. A run with no valid snapshot is refused rather than silently using a broader fallback. The hook ignores conversation content, but its host permission is broad and must be explicitly reviewed when deploying.

The adapter also intersects explicit global/Agent/provider tool denials and convenience-tool allowlists from the public runtime configuration. A direct trusted-operator HTTP invocation has no model turn; it uses these configuration restrictions and worker Agent/requester policy. If model metadata is absent, all configured provider restrictions for that Agent are conservatively intersected. This can deny more than a particular model would.

This does **not** reproduce arbitrary argument-sensitive `before_tool_call` hooks, native approval prompts, or another tool's custom execution-time checks. There is no public general-purpose API here to execute the entire host policy pipeline for a nested service call. Put capability restrictions in `capabilityPolicy`, where they apply to every CoNest Connector entry point. Keep Gateway HTTP bearer credentials private: `/tools/invoke` is a trusted-operator surface, not a channel-user endpoint. Unsupported harnesses without a finalized run snapshot are not qualified.

Known native aliases must be allowed when a generic component needs their underlying service. For example, a host allowlist containing only `bridge_invoke` and `bridge_capabilities` does not authorize nested `knowledge_search`; include that search tool when intended. Native denial of `bridge_invoke` itself still controls that host surface and need not disable an independently admitted convenience tool.

## Revocation and diagnostics

Policy updates are validated and persisted atomically through the live worker. Changed worker policy or permission ceilings revoke unused grants and cancel running and queued tasks. Uncooperative work triggers the existing process watchdog; interrupted work is never replayed. Component-only changes retain version-pinned active work. Invalid policy updates leave the accepted configuration and runtime unchanged.

Grants bind the principal and host capability ceiling as well as task/call, subject, parent run, canonical workspace, generation, and deadline. Tampering with the principal or widening the ceiling invalidates the one-use grant.

Useful errors are `CAPABILITY_DENIED`, `INVALID_POLICY`, `INVALID_PRINCIPAL`, `AUTHORIZATION_MISMATCH`, `POLICY_CHANGED`, and `HOST_POLICY_UNAVAILABLE`. `status.policyDenials` counts worker authorization denials; it is not a durable audit log. The pinned OpenClaw `/tools/invoke` endpoint currently translates worker-thrown denials to HTTP 500, while tools excluded by native policy return 404. E2E assertions check the worker denial counter to distinguish policy refusal from unrelated failures.

## Upgrade and remaining work

Stop the old CoNest Connector worker and restart the plugin service when upgrading from 0.3: protocol 3 requires a principal on every task/catalog request. The protocol remains unchanged between 0.4 and 0.5. Do not mix old clients and new workers. Review external manifests' `bridgeVersion` ranges before restarting. The example verifier is now 1.2.0, declaring support for CoNest Connector 0.3 through 0.5; retained older bundles are not silently rewritten.

Version 0.5 adds a private standalone Linux archive and an owned local service profile; see [INSTALLATION.md](./INSTALLATION.md) and the exact evidence in [ACCEPTANCE.md](./ACCEPTANCE.md). Live channels and broader model reliability remain unqualified. Per-component OS isolation, credential/network mediation, durable audit, and organization admission/release governance remain separate work. The worker environment allowlist reduces accidental credential inheritance; trusted code can still read files available to its OS account.

## Shared memory service

Studio automatic hooks use separately authorized `memory_recall` and `memory_remember` capabilities. These service entries are denied at model-facing discovery/invocation surfaces; the nine graph tools follow finalized tool authority. Worker capability policy and `memory:read` / `memory:write` govern the service calls. Incognito sessions skip automatic hooks and cannot access either memory entry path. See [the memory design](docs/memory-component-zh.md) for ownership, cancellation and failure semantics.
