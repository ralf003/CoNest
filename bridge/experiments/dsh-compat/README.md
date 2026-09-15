# Real DSH qualification profile

Run `pnpm run test:compat` from the bridge root with the adjacent, built DSH checkout and Node 24.15.x. This developer-only profile mounts actual unmodified DSH packages inside the production CoNest Runtime and tests selected read-only calls, negative host requirements, native teardown, and worker RPC.

See the [compatibility matrix](../../DSH-COMPATIBILITY.md) for exact versions, injected services, mappings, results and limitations. [profile.mjs](./profile.mjs) is test composition, **not a production plugin package**; its diagnostic capability must not be offered as a general Todo/Plan tool.

The tests own temporary fixture directories and clean them up. No real user skill roots, provider credentials, external network requests, installation state, default tool catalogs or release archives are changed. Reports go to `reports/dsh-compatibility/`; a failing run exits nonzero and writes `failure.json` without relabeling an earlier success.
