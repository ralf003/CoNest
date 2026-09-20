# CoNest Connector — developer guide

Package version: **0.6.4**. The OpenClaw plugin ID remains `dsh-bridge`.
CoNest aims to connect agents, tools, memory and services; OpenClaw and DSH are the first integrations.
See the [project overview](../README.md) and [contribution guide](../CONTRIBUTING.md).

## Build and test

Use Node.js 24.15.0 and pnpm 11.7.0. Native builds require Python 3, make and a C++ compiler.
Run from the repository root:

```sh
node maintenance/bootstrap.mjs
pnpm --dir bridge install --frozen-lockfile
pnpm --dir bridge run build
pnpm --dir bridge exec tsx --test 'test/*.test.ts'
python3 maintenance/check-repository.py
```

OpenClaw is pinned to 2026.9.2. Bootstrap restores the checksum-pinned DSH SDK;
see [dependency provenance](../maintenance/DEPENDENCIES-zh.md).

## Package layout

```text
src/          Connector, component runtime, host services and Studio
test/         Behavioral and regression tests
scripts/      Build, packaging and integration checks
docs/         Developer contracts, configuration and verification guides
examples/     Installable component examples and policies
experiments/  Isolated Loader and DSH compatibility probes
companions/   DSH Web integration
patches/      Pinned dependency patches
```

Customer presentations, delivery tutorials, speaker notes, rendered documents and
run reports belong outside Git. Local working materials can live under
`maintenance/local/customer-delivery/` at the repository root.

## Configure the development plugin

From `bridge/`, create a configuration in an existing directory:

```sh
node dist/cli.js init --config /absolute/config/bridge.json --workspace /absolute/workspace
```

Merge the following entry into your development OpenClaw configuration:

```json
{
  "plugins": {
    "enabled": true,
    "allow": ["dsh-bridge"],
    "load": { "paths": ["/absolute/path/to/CoNest/bridge"] },
    "entries": {
      "dsh-bridge": {
        "enabled": true,
        "hooks": { "allowConversationAccess": true },
        "config": { "configFile": "/absolute/config/bridge.json" }
      }
    }
  }
}
```

The post-policy hook supplies finalized tool denials; it does not store conversation content.
See [authorization](docs/authorization.md) for admission, revocation and recovery boundaries.
Restart the Gateway after replacing the Connector package. Component reload only updates managed components.

## Architecture and tool contract

The development adapter registers sixteen stable OpenClaw tools:

| Tool | Purpose |
| --- | --- |
| `dsh_mcp__reference_memory__*` (nine tools) | Shared graph operations in the managed memory component, with separate read/write permissions. |
| `bridge_capabilities` | Discover currently available capabilities, provider IDs/versions, permissions, input/output schemas, and a generation token. |
| `bridge_invoke` | Call a discovered capability using its name, generation, and schema-valid arguments. |
| `knowledge_search` | Convenience tool for the built-in DSH literal search capability. |
| `knowledge_verify` | Convenience tool for the built-in exact-quote verifier. |
| `dsh_grep` | DSH regular-expression search with workspace path and file filtering, served by the search component. |
| `dsh_glob` | DSH file-path glob search, served by the same search component. |
| `dsh_read` | DSH text read with original line windows and guarded-edit observation handoff. |

New component capabilities appear through discovery and generic invocation without adapter edits, a host restart, or another Agent Loop. They do not each become separately named OpenClaw tools. Capability schemas remain discoverable, rather than being flattened into a generated host tool list.

The Gateway's service and request-time plugin registries share one supervised worker per canonical CoNest Connector configuration in the same process. Worker ownership is exclusive across processes. A private inherited NDJSON pipe carries task traffic; a same-user management endpoint (Unix socket on Linux, authenticated named pipe on Windows) carries explicit operator management. A second Gateway cannot independently own the same configuration.

## Developer documentation

- [Components and configuration](docs/components.md): manifests, dependency injection, CLI management and lifecycle.
- [Runtime](docs/runtime.md): versioned graphs, retained calls and cleanup boundaries.
- [Authorization](docs/authorization.md), [host adapter](docs/host-adapter.md) and [context providers](docs/context-providers.md).
- [Studio development](docs/studio-zh.md): local fixture, configuration and integration checks.
- [Package installation and verification](docs/installation.md).
- [DSH compatibility profile](docs/dsh-compatibility.md) and [stable identifiers](docs/naming.md).

## Integration checks

Run from `bridge/` after building:

```sh
pnpm run test:runtime
pnpm run test:openclaw
pnpm run test:e2e
pnpm run test:compat
CONEST_DEMO_STATE=/absolute/disposable/conest-check node scripts/demo-studio.mjs --verify
```

The default integration checks use a deterministic model fixture with real Gateway,
tool and component execution. Reports stay in ignored local directories.
Optional real-model checks require `CONEST_CREDENTIAL_FILE` and an explicit `--live`
or `test:live:deepseek` invocation; these incur provider usage and do not run in CI.

For current development changes, see [release scope](docs/release-0.6.4-zh.md),
[host tool admission](docs/dual-loop-component-runtime-zh.md),
[search](docs/search-component-zh.md), [read](docs/read-component-zh.md) and [memory](docs/memory-component-zh.md).
