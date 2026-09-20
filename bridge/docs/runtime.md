# Component runtime

Commands run from `bridge/`. This contract covers trusted managed components.

## Versioned graphs

The supervised worker now retains one context and one native Loader. Component entries are shared across graphs only while their manifest, integrity, configuration, and dependency instances are unchanged and ready. Affected dependencies and consumers receive new entries. The application service scope is restricted to the component's declared dependency closure; the built-in search entry owns its DSH infrastructure.

Management prepares a detached candidate, checks actual readiness and declared registrations, persists accepted configuration, and then publishes one graph token. Calls already admitted, including queued calls and later nested calls, retain the original graph. Old entries survive until all graph owners and admitted calls release them. Policy/permission changes still revoke grants and cancel tasks across every retained graph. Configuration reversion cannot revive an old token.

Loader mutations and retirement are serialized. Native asynchronous cleanup is awaited; structured unloading errors remain observable even when Cordis resolves a disposal promise. An uncertain cleanup marks the worker degraded and requires operator review/restart; publication is not falsely reported as rolled back. Concurrently draining graphs cannot remove one another's bookkeeping entries.

## Verification

Run `pnpm test`, `pnpm run test:runtime` and `pnpm run test:e2e`. Tests cover retained calls, overlapping graphs, failed activation, permission revocation, dependency recovery and cleanup. Run reports remain local.

## Compatibility and limits

- The plugin ID remains `dsh-bridge`. Restart the Gateway after updating Connector code.
- Component `inject` is a string array. An application service provided elsewhere must come from a declared component dependency, directly or transitively. Multiple competing providers are rejected. Components relying on unrelated ambient services, Loader self-modification, or another DSH Agent Loop are not supported by this contract.
- The example is `source-verifier@1.3.0`. Older third-party `bridgeVersion` ranges that exclude 0.6 must not be silently widened. Review, test, and publish a new compatible component bundle; old snapshots are retained.
- Handlers must honor cancellation and await their nested work before returning. Invocation authority cannot be retained for later detached work. Providers reused by candidate and accepted consumers must support that overlap without irreversibly modifying accepted state during candidate startup.
- Cordis scopes are not OS isolation. Trusted JavaScript can still access `ctx.root`, module globals, environment/files available to its OS user, and external systems. Managed rollback does not undo arbitrary imports or external effects. An uncooperative plugin may require terminating the worker; interrupted tasks are never replayed automatically.
- Initial missing dependencies remain explicitly degraded. A candidate that loses previously ready components unexpectedly is rejected; intentional provider removal may leave dependents blocked. Loader settlement is not itself a readiness certificate.
