# Dynamic workspace context — development contract

Included in the private 0.6.1 local candidate, targeting OpenClaw 2026.9.2 only. Existing 0.6.0 archives are unchanged and reject the new manifest field. No OpenClaw core, DSH upstream package, model scheduler or session store is replaced. See [candidate acceptance](./HOST-ENHANCEMENT-ACCEPTANCE.md) for versioned artifact qualification.

## Explicit opt-in

Install the inspected example into the running development runtime using its existing configuration:

```sh
node dist/cli.js --config /absolute/config/bridge.json components install /absolute/checkout/bridge/examples/workspace-context/component.json
```

Then merge the following into the existing OpenClaw plugin entry, retaining `configFile` and other settings:

```json
{
  "hooks": { "allowConversationAccess": true },
  "config": {
    "configFile": "/absolute/config/bridge.json",
    "contextProvider": {
      "capability": "workspace_context",
      "provider": "workspace-context",
      "timeoutMs": 1000,
      "maxChars": 2000
    }
  }
}
```

Restart the Connector/plugin service after changing host integration settings. Removing `contextProvider` disables automatic collection. Installing the component alone does not enable collection; the default configuration performs no context-provider work. This opt-in authorizes automatic component execution and sharing the first 1000 UTF-16 code units of the current prepared task prompt. That prompt can contain host-provided task metadata; it is not guaranteed to be a verbatim user message. No `messages` history array or full host API is passed to the component.

## Contract and limits

One explicitly selected capability must declare `contextProvider: "workspace-v1"` and `workspace:read` in its manifest. The current authorized catalog must bind it to the selected component ID. The marker declares an interface; it does not prove code purity or provide an OS sandbox. Components are trusted executable code under the existing installation/integrity model. Inspect them before opting in.

| Boundary | Behavior |
| --- | --- |
| Component arguments | `{ task: string, maxChars: integer }`, task limited to 1000 UTF-16 code units |
| Component result | Exactly `{ text: string }`; empty, malformed or oversized results are omitted |
| Text budget | Default 2000, configurable 128–4000 code units; encoded JSON envelope limited to `maxChars + 512`, plus a fixed warning prefix |
| Deadline | Default 1000 ms, configurable 50–2000 ms for catalog, execution and final revalidation together |
| Load | At most four outstanding collections per adapter registration; no waiting queue; timed-out transports retain their slot until they settle |
| Host permission | Finalized `knowledge_search`, `bridge_capabilities` and `bridge_invoke` must all be available; the hook workspace must exactly match the canonical configured workspace |
| Worker permission | Current agent/requester policy, host denials, declared dependency permissions and one-use invocation grants remain enforced |
| Output destination | OpenClaw's authorized `before_prompt_build.appendContext`, not the system prompt |

The native search tool's finalized availability supplies the host sandbox/filesystem gate because prompt hooks do not provide a separate `fsPolicy`. An exact workspace match adds a conservative restriction: otherwise usable nested-workspace arrangements may receive no context. There is no fallback that widens the workspace or changes agent/requester identity.

The example selects at most three longest literal terms from the task and calls the real DSH `knowledge_search` dependency, returning at most eight source excerpts within the text budget. It is a deliberately small retrieval example, not semantic search, language-aware segmentation or a relevance-quality guarantee. It never calls a model.

## Lifetime, freshness and failure

Collection binds a unique internal call to the host run and shared call scopes. Host authority is checked at each boundary and polled every 25 ms while awaiting work, since this host prompt hook provides an active-authority check rather than an abort signal. Run end/error, an owning `session_end` event, service stop, cleanup and the contribution deadline abort its signal. Session IDs select session cleanup, not keys that may be reused after reset. The worker also receives the deadline, enabling its existing cancellation and uncooperative-worker watchdog. A blocked worker may be terminated, interrupting other component tasks; native OpenClaw tools remain independent. JavaScript/event-loop scheduling means the deadline is not a hard real-time guarantee.

Every collection discovers the current authorized provider, invokes its exact generation, then re-reads the authorized catalog. A changed generation, disabled/uninstalled provider, lost dependency, policy denial, expired authority or malformed response produces no contribution. Results are never cached or automatically retried. Timed-out catalog/startup completion is checked before any later invocation, so it cannot start a stale component call. Optional collection failure omits context and lets the host task proceed; raw component errors and task/source text are not logged by this adapter.

Freshness is checked immediately before returning the contribution, not atomically with model submission. A subsequent management change cannot retract content already returned to OpenClaw. Previous contributions may remain in host-owned session history; this feature does not purge transcripts. Fresh-session tests distinguish new contributions from previously delivered content.

Source text is JSON encoded and labeled untrusted data. This prevents source strings from fabricating our envelope delimiters but does **not** eliminate model prompt injection. Do not treat retrieved text as instructions, proof of factual truth or new execution authority.

The authenticated `/plugins/conest-connector` page and `/conest` report shared counters for contributed, empty, denied, unavailable, stale, timeout, cancelled, invalid, busy and failed outcomes. Active prompt construction and outstanding transport counts are separate: a timed-out background transport may still be settling. Only counts, a fixed outcome, an allowlisted diagnostic code and timing are stored; neither payloads nor identities are recorded. Optional context progress is excluded from ordinary user-facing progress snapshots. Counters reset with the shared runtime owner, are not an audit log, and do not prove model consumption of returned text.

## Verification

```sh
pnpm test
CONEST_REPORT_PROFILE=context-provider node scripts/test-e2e.mjs --context-provider --capability-guidance
CONEST_REPORT_PROFILE=context-provider-default node scripts/test-e2e.mjs
CONEST_REPORT_PROFILE=context-provider-default node scripts/test-openclaw.mjs
```

Unit/process tests cover exact data boundaries, identity/tool/workspace gates, output validation, timed-out late work, concurrency, run cancellation, stale generations, real DSH retrieval, dependency disable/recovery, requester denial and in-flight upgrade/policy revocation. Gateway tests use a local deterministic model transport and actual OpenClaw/DSH execution, including context arriving before model tool calls and fresh-session checks after enable/disable, revocation/restoration and uninstall. They do not spend provider credits or measure real-model retrieval quality.

No session/history service, arbitrary multi-provider pipeline, prompt-authoring DSH service adapter or market UI is implemented. A new release still needs versioning and separate artifact qualification.

### Earlier checkout-slice results — 2026-09-07

- `pnpm test`: 73/73 passed, including 12 context-provider tests.
- [Dynamic context Gateway flow](./reports/context-provider/e2e.json): passed; 14 local model requests, including six context-only fresh-session checks with zero model tool calls.
- [Default-off Gateway regression](./reports/context-provider-default/e2e.json): passed; 8 local model requests.
- [OpenClaw runtime inspection](./reports/context-provider-default/openclaw-inspection.json): loaded, four tools, two routes, no diagnostics.

The E2E reports record the entry, host-adapter and context-provider module hashes and verify they do not change during the run. These are development evidence, not acceptance of a newly published archive or paid-model quality qualification.
