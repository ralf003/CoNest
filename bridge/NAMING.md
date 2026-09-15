# CoNest naming and compatibility

Version 0.5.1 introduced the compatibility-preserving rename of DSH Bridge 0.5.0. Version 0.6.0 retains those product names and stable host identifiers while adding the [versioned Loader runtime](./RUNTIME-ACCEPTANCE.md).

| Name | Responsibility | Current scope |
| --- | --- | --- |
| CoNest | Unified plugin marketplace and management platform | Product direction; the marketplace is not implemented or published by this release. |
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

The private npm package name has changed. Do not load both old and new package locations: they share the same stable OpenClaw plugin ID. Stop the old local service before switching an installation. For archive installs, use a separate installation directory and a new profile as described in [INSTALLATION.md](./INSTALLATION.md); existing profiles embed their installed package location. Retain old state and credentials for explicit recovery. This rename does not automatically uninstall packages, rewrite profiles, migrate component snapshots, or restart any existing service.

## Validation and evidence

The rename's checks remain in `reports/conest-0.5.1/`; current runtime checks write separately to `reports/conest-0.6.0/`. Pre-CoNest reports and release archives keep their original names, bytes, and version claims. [ACCEPTANCE.md](./ACCEPTANCE.md) preserves the historical 0.5.0 acceptance, including paid model runs; those runs are not relabeled as evidence for later releases.

No new paid model call was needed for the naming change. Local tests cover branding, aliases, stable contracts, and runtime behavior; official-host checks and clean-install checks have their own versioned reports. Consult those actual reports before asserting that a particular artifact passed. The 0.5.1 rename did not implement component-level Loader reconciliation; its 0.6.0 implementation and compatibility limits are documented separately. Marketplace publication and broad DSH compatibility remain future work.

The historical 0.5.1 source checks on 2026-09-07 passed type checking and 39 tests. Official OpenClaw 2026.9.2 inspection loaded the renamed plugin with both chat commands, one worker service, four unchanged tool contracts, and no diagnostics. The deterministic Gateway end-to-end check passed its runtime and policy scenarios; both status routes returned 401 without authentication and 200 with it. Those checks used no paid inference. Versioned reports are developer-side evidence, not files bundled into the installation archive.
