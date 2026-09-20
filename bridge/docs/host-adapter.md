# Host adapter

The adapter targets the pinned OpenClaw 2026.9.2 hook contract. Commands run from `bridge/`.

`src/host-adapter.ts` now owns the public host hook registration: finalized tool-policy narrowing, session-qualified tool-call identity, requester principal binding, caller abort, call completion, and run end/error. `src/index.ts` retains tool execution and worker/service/UI registration. No OpenClaw core or upstream DSH package is modified.

Optional `plugins.entries.dsh-bridge.config.capabilityGuidance: true` contributes fixed guidance through `before_prompt_build.appendContext`. It defaults off and requires the existing `hooks.allowConversationAccess: true` permission and both generic tools in the finalized authority. Authority is checked before and after reading it and is not retained. Missing/expired authority never establishes a new policy snapshot. Policy snapshots continue to narrow rather than widen within a run.

Host integration finding: although the general hook type exposes system-context fields, OpenClaw 2026.9.2's authorized post-policy pass forwards only `prependContext` and `appendContext`. An initial system-field attempt failed the real Gateway test. The implementation uses the supported ordinary-context field; it does not weaken the permission gate to gain system-prompt access.

The text explains discovery, schemas, generation refresh, and respecting denials. It does not include component descriptions, names from installed third-party packages, files, user messages, or catalog results. No catalog RPC or component execution happens in the prompt hook. OpenClaw still owns model scheduling, transcript/session storage, and cancellation. This is static connector guidance, not a dynamic DSH prompt-provider bridge.

## Verification

Use the pinned Node/pnpm toolchain described in README:

```sh
pnpm test
CONEST_REPORT_PROFILE=host-adapter-default node scripts/test-openclaw.mjs
CONEST_REPORT_PROFILE=host-adapter-default node scripts/test-e2e.mjs
CONEST_REPORT_PROFILE=host-adapter-guidance node scripts/test-e2e.mjs --capability-guidance
```

The E2E runner uses a local deterministic model transport, actual OpenClaw Gateway and actual component tools. It asserts user-context presence/absence and no system-prompt mutation on every model request, alongside native/extension tool chaining, dynamic installation, host-policy denial through generic invocation, failed-upgrade preservation, dependency recovery, and worker crash recovery. It does not call a paid model or prove model-driven adoption of the guidance. Unit tests additionally cover authority expiry, generic-tool denial, session isolation, requester binding and cancellation.
