# CoNest naming and compatibility

Version 0.5.1 introduced the compatibility-preserving rename of DSH Bridge 0.5.0. Version 0.6.0 retains those product names and stable host identifiers while adding the [versioned Loader runtime](runtime.md).

| Name | Responsibility | Current scope |
| --- | --- | --- |
| CoNest | Connect agents, tools, memory and services | OpenClaw and DSH are the first integrations; broader interoperability remains the project direction. |
| CoNest Connector for OpenClaw | OpenClaw integration, abbreviated CoNest Connector | The existing public-SDK plugin, now displayed under this name. |
| CoNest Runtime | DSH/Cordis component execution and lifecycle | The supervised worker with native Loader reconciliation and version-bound calls; not a separately published package. |

Cordis remains the underlying framework. DSH and OpenClaw remain the upstream ecosystems; their package names, authorship, and licenses are not renamed.

## New user-facing names

- Private package: `@local/conest-connector` (not a public registry listing or a reserved namespace).
- Operator CLI: `conest`.
- Local pilot CLI: `conest-local`.
- Authenticated chat command: `/conest` (including `reload` and `restart`).
- Authenticated status route: `/plugins/conest-connector`.
- Example configuration: `conest.config.example.json`.

## Stable compatibility identifiers

This is not a schema or identity migration. The following are deliberately preserved:

- OpenClaw plugin ID `dsh-bridge`, including `plugins.allow`, `plugins.entries`, service IDs, and existing control-tab identity. Do not replace these config keys with `conest` or `conest-connector`.
- Tools `bridge_capabilities`, `bridge_invoke`, `knowledge_search`, and `knowledge_verify`, including their permission-policy mappings.
- Component APIs such as `ctx.bridgeCapabilities`, `bridgeVersion`, existing exported `Bridge*` types, JSON fields, and `BRIDGE_*` error codes.
- Profile file `bridge.json`, component snapshot directory `.dsh-bridge`, socket names, and worker ownership keys. They continue to identify the same state and prevent a second runtime from claiming it.
- CLI aliases `dsh-bridge` and `dsh-bridge-local`, chat alias `/bridge`, and status alias `/plugins/dsh-bridge`.
- Existing credential-file locations. Optional test runners accept `CONEST_CREDENTIAL_FILE`, then the legacy `BRIDGE_CREDENTIAL_FILE`, then their unchanged documented default. No credential is moved, copied, or read by the rename itself.

The new and legacy commands call the same implementation. Both status routes retain Gateway authentication and the trusted-operator scope. There is one worker service, not separate workers for the two names.

## Existing installations

Source checkout paths and frozen migration archives are unchanged. The active implementation still lives in `openclaw-dsh-bridge/bridge/`; changing its directory is not required to use the new product names.

The private npm package name has changed. Do not load both old and new package locations: they share the same stable OpenClaw plugin ID. Stop the old local service before switching an installation. For archive installs, use a separate installation directory and a new profile as described in [INSTALLATION.md](installation.md); existing profiles embed their installed package location. Retain old state and credentials for explicit recovery. This rename does not automatically uninstall packages, rewrite profiles, migrate component snapshots, or restart any existing service.
