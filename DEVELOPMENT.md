# Development baseline

Updated: 2026-09-07

## Product naming

The current implementation is **CoNest Connector for OpenClaw** (CoNest Connector), with **CoNest Runtime** as its supervised component worker. **CoNest** names the planned unified plugin market and management platform, not the underlying Cordis framework. Version 0.5.1 changes branding and adds new command aliases without migrating the old plugin identity or stored state. See [naming and compatibility](bridge/docs/naming.md).

The `bridge/` directory and migration archives retain their historical names. The implementation chronology below is historical; the new market and native Cordis Loader integration are separate future work.

## Confirmed decisions

The new architecture uses the official OpenClaw **2026.9.2** release as its development, API compatibility, and acceptance baseline. Dependencies and test environments pin the complete version instead of a moving `latest` tag.

DESIGN-zh.md remains the architecture direction. Performance and user experience are part of implementation and acceptance. Numerical targets discussed before measurement are working hypotheses rather than acceptance thresholds.

## Migration snapshot and new baseline

The archived `openclaw-cordis-openclaw-schema18` and `phone-worker-zyw02-openclaw` package manifests both report `2026.8.1`. They represent different revisions with different local changes; SOURCE-INVENTORY.json records their exact state.

The archived trees reproduce historical behavior and support compatibility comparison. New compatibility claims require validation against an unmodified official OpenClaw 2026.9.2 package.

## Implementation order

1. Restore the Bridge and DSH development sources and frozen dependencies to establish the historical baseline.
2. Use an isolated, version-pinned OpenClaw 2026.9.2 environment to verify public plugin APIs, lifecycle behavior, tool policy, progress, and cancellation.
3. Implement the separate Cordis extension process and the first component dependency flow.
4. Measure cold start, time to first useful status, bridge overhead, concurrent queueing, resource use, cancellation, and failure recovery before freezing performance budgets.

## Current source layout

- `source/workspace/`: immutable migration source restored from the handoff archive.
- `bridge/`: new implementation targeting OpenClaw 2026.9.2.
- `.runtime/`: local official OpenClaw 2026.9.2 test dependency.
- `.tooling/`: local Node.js 24.15.0 and pnpm tooling for reproducible development on this machine.

The first implementation milestone provides a DSH-backed workspace search service and a quote-verification component that depends on it. The OpenClaw adapter remains lightweight; executable components run in a separate Cordis process.

## Sources

The npm `latest` dist-tag and official GitHub release were both `2026.9.2` when checked on 2026-09-07.

- Release notes: https://github.com/openclaw/openclaw/releases/tag/v2026.9.2
- npm dist-tags: https://registry.npmjs.org/-/package/openclaw/dist-tags

This post-migration document is outside the original handoff SHA256SUMS manifest.
