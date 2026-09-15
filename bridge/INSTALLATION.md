# CoNest Connector: standalone local installation

This profile is for a trusted, single-user Linux x64 machine with glibc and Node.js >=24.15.0 <25. The archive includes the tested DSH/Cordis runtime dependency closure, licenses, and Linux native assets. Node.js, official OpenClaw 2026.9.2, and the official DeepSeek provider 2026.9.2 are installed separately. Do not use this platform-specific archive on another architecture or Node ABI. The local doctor rejects a different Node ABI or a glibc older than the build recorded in `runtime-lock.json`.

For product names, unchanged plugin/configuration identifiers, and old command aliases, see [NAMING.md](./NAMING.md). The private 0.6.1 candidate keeps the OpenClaw plugin ID `dsh-bridge`; do not rename that configuration key. See [host-enhancement acceptance](./HOST-ENHANCEMENT-ACCEPTANCE.md) for this candidate. Historical paid runs, including 0.6.0, are not evidence of paid inference on this archive.

## Install

Create a new installation directory and install the exact host, provider, and CoNest Connector archive. Clean-install acceptance uses npm 12.0.2; use that version for exact reproduction:

```sh
mkdir -p /absolute/installation
cd /absolute/installation
npx --yes npm@12.0.2 install --ignore-scripts --registry=https://registry.npmjs.org \
  openclaw@2026.9.2 @openclaw/deepseek-provider@2026.9.2 \
  /absolute/candidates/local-conest-connector-0.6.1.tgz
```

Verify the archive's `.sha256` companion before installation when transferring it between machines. The hash records this locally built archive; it is not a publisher signature. The CoNest Connector is private and is not published to a registry. The bundled dependency manifests pin exact versions and have installation hooks removed; upstream licenses and existing patches are retained. The developer checkout can continue using `link:` dependencies, but the produced archive does not require that checkout.

## Create a profile

Create an existing workspace for source files. Keep the private profile and credentials outside that workspace. Store only `DEEPSEEK_API_KEY=...` in a current-user-owned regular file with mode 600 or 400. Do not put the key in a shell argument or the searchable repository.

```sh
./node_modules/.bin/conest-local setup \
  --state /absolute/private-profile \
  --workspace /absolute/workspace \
  --credentials /absolute/private/deepseek.env
./node_modules/.bin/conest-local doctor --state /absolute/private-profile
```

`setup` requires a new profile directory, references the credential file without copying the key, chooses a free loopback port, and writes private local, CoNest Connector, and OpenClaw configuration files. Use `--port 18791` to choose a specific free port. Existing profiles are never overwritten. The profile is tied to the installed package locations; create a new profile if relocating that installation.

The generated configuration enables only the CoNest Connector and official DeepSeek provider, pins `deepseek/deepseek-v4-flash` on the OpenClaw harness, disables thinking and model fallbacks, limits output to 2,048 tokens and tasks to 90 seconds, and allows only native read/status and the four CoNest Connector tools. Native filesystem access is workspace-only. Channels, browser control, Control UI, memory plugins, and heartbeat work are disabled. These are a constrained personal pilot's settings, not an OS sandbox.

The CoNest Connector requires the explicit `hooks.allowConversationAccess` permission for its finalized tool-policy hook. It retains only additional tool denials, not conversation content or the host authority object; see [AUTHORIZATION.md](./AUTHORIZATION.md). Review this permission before connecting a broader workspace or enabling additional plugins.

## Start, use, and stop

```sh
./node_modules/.bin/conest-local start --state /absolute/private-profile
./node_modules/.bin/conest-local status --state /absolute/private-profile
./node_modules/.bin/conest-local ask --state /absolute/private-profile \
  --message "Read evidence.txt, search its release marker, and report the source."
./node_modules/.bin/conest-local stop --state /absolute/private-profile
```

`ask` is an explicit, chargeable task through the running Gateway, with a fresh session per invocation and no external delivery. `doctor --probe` checks authenticated model availability without running inference. `doctor` without the flag validates local credentials, required versions, and the official host configuration only. A configured key does not by itself establish provider access or available balance.

`start` launches a detached, owned supervisor; `serve` runs that supervisor in the foreground instead. This installs no global OpenClaw/systemd service and does not start at boot. Status and stop use a same-user private control socket rather than blindly signalling a stored PID. The supervisor owns its Gateway child; it does not automatically restart a failed Gateway or replay interrupted model work. A new explicit start is required after a Gateway failure. The CoNest Connector's existing bounded worker recovery still applies to new tool requests.

Local `state: ready` means the Gateway/control service is available, not that every component is enabled or every Agent is authorized. `bridgeState` separately reports `ready`, `degraded` dependency/cleanup state, or an `unavailable` worker. An empty policy-filtered catalog does not prevent startup. Use CoNest Connector `status` for per-component reasons and repair dependencies/policy through the operator CLI.

## Components and recovery

Use the installed CoNest Connector CLI against the profile's `bridge.json`:

```sh
./node_modules/.bin/conest --config /absolute/private-profile/bridge.json components install \
  ./node_modules/@local/conest-connector/examples/source-verifier/component.json
./node_modules/.bin/conest --config /absolute/private-profile/bridge.json catalog
```

Management reaches the live worker when the Gateway is running. Component install/uninstall and policy changes persist under the profile, not the installation directory. Stopping the supervisor retains configuration, sessions, logs, and component snapshots. It does not remove your credential file.

Connector 0.6.0 introduces component-level Loader reuse and isolated services; review the [runtime contract](./RUNTIME-ACCEPTANCE.md) before upgrading third-party components. The included `source-verifier@1.3.0` declares compatibility with this version. Older installed snapshots whose `bridgeVersion` excludes 0.6 remain unchanged and must be upgraded from a reviewed compatible bundle. Stop the old service before switching Connector installations; component reload does not upgrade the Connector itself.

If startup fails, inspect the private `launcher.log` and `gateway.log`. Host logs rotate at 1 MiB with up to five archives. Configuration checks and errors must not expose the API key. Component workers inherit a small OS environment allowlist, not provider tokens or arbitrary parent environment variables. Trusted component code can still read files available to its OS account; this is not credential isolation against malicious code.

Stop before editing host configuration; validate with `doctor`, then start again. The profile checks that the direct provider URL, symbolic credential reference, loopback listener, task bounds, and canonical workspace remain consistent. Create a new profile for a different workspace or model instead of partially editing these coupled settings. Advanced changes to timeout/output settings must update both `local.json` and matching host settings. Capability policy and installed components remain managed through the CoNest Connector CLI. Port collisions, missing/mismatched host packages, unsafe credential permissions, and invalid configuration fail visibly. Never reuse an interrupted call as evidence of success. A manually invalid profile or an unreachable supervisor requires operator diagnosis; the commands do not kill unrelated processes or silently repair an existing installation.

## Build and verify a release

From the prepared developer checkout:

```sh
pnpm run pack:release
pnpm run test:installation /absolute/candidates/local-conest-connector-0.6.1.tgz --host-enhancements
# Optional: two real-model tasks; this incurs provider usage.
pnpm run test:installation /absolute/candidates/local-conest-connector-0.6.1.tgz --live
```

The builder refuses to overwrite an existing archive/checksum. Use `node scripts/pack-release.mjs --out /absolute/new-output` after a successful build for another candidate. It uses pinned npm file-list rules without traversing linked development dependencies; package metadata is rewritten only in a temporary staging tree. The clean-install test checks every bundled package's file count and content hash, runs actual DSH search with an offline archive-only install, then installs the pinned host/provider and tests owned lifecycle and live component management outside the checkout. The optional paid variant also checks direct provider completion and a real dependent permission denial. Test profiles are stopped and removed; the original credential file is retained.

## Qualification limits

Historical 0.5.0 model streaming and lifecycle results are recorded in [ACCEPTANCE.md](./ACCEPTANCE.md); 0.6.0 has its own historical reports. Candidate 0.6.1 checks write to `reports/conest-0.6.1/`, with an additional `conest-0.6.1-archive/` profile for Gateway tests of the installed package. No paid model run has been authorized for this candidate. Provider cost metadata is an estimate, not a spending limit or account bill. Task timeout and output limits bound ordinary operation but do not provide a hard currency cap. Use provider-side account controls for spending restrictions.

No live channel, multi-user endpoint, auto-start service, public package registry publication, Windows/macOS installation, or hostile-code sandbox is included in this milestone.
