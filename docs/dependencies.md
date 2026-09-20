# Dependency provenance and reproducible builds

Use the [README](../README.md#quick-start) for normal setup. This reference is for dependency updates, offline SDK restoration and packaging maintenance.

| Dependency | Source and pinning |
| --- | --- |
| OpenClaw | npm `openclaw@2026.9.2`; never a moving `latest` tag |
| DSH / Cordis | [Development SDK release](https://github.com/zyw02/CoNest/releases/tag/dev-sdk-20260915); archive and manifest SHA-256 values in [sdk.lock.json](../scripts/maintenance/sdk.lock.json) |
| Other JavaScript/native libraries | Exact direct versions in `package.json`, resolved graph in `pnpm-lock.yaml` |
| node-pty patch | [Pinned patch](../patches/node-pty@1.1.0.patch), applied and checked by pnpm |

The DSH `0.1.0-rc.5` leaf packages used here are preserved in the SDK rather than fetched as npm releases. This is a CoNest development dependency snapshot, not an official DSH distribution. The snapshot has no verifiable upstream commit ID: hashes establish file identity, not reproducibility from an upstream Git commit.

The SDK contains 62 required packages with source, built JavaScript, types and licenses, approximately 2.3 MB compressed. Original manifests are retained as `package.upstream.json`. Installation manifests resolve workspace ranges, omit development dependencies/build scripts, and retain required helper-permission handling. `sdk.json` records transformations and file hashes. The archive excludes installed dependencies, native binaries, credentials, sessions, personal memory and complete DSH CLI/Web applications. Third-party licenses and notices remain with their code.

## Restore and verify

Bootstrap verifies the archive, extracts to a temporary directory, verifies the SDK manifest and every file, then installs into ignored `.vendor/dsh/`. Repeated runs verify existing content and reject local modifications rather than overwriting them.

For an offline SDK archive:

```bash
node scripts/maintenance/bootstrap.mjs --archive /path/to/conest-dsh-sdk-20260915.tar.gz
```

npm dependencies require a separate cache or network access. Native builds still require the platform toolchain. Never share a mutable dependency installation across independently checked-out branches.

## Update the SDK

1. Review package origins, licenses and the exact implementation change.
2. Export from the preserved source/manifests or restored SDK: `python3 scripts/maintenance/export-sdk.py --source .vendor/dsh --output /tmp/conest-sdk-export`.
3. Publish a new SDK asset and identifier; update `sdk.lock.json` and regenerate the pnpm lockfile. Do not overwrite old assets under unchanged checksums.
4. Bootstrap, install with `--frozen-lockfile`, build and test each affected maintained branch in a clean checkout.
5. Validate platform artifacts separately using the [packaging guide](installation.md). SDK restoration alone does not establish native-platform compatibility.
