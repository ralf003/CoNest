# Contributing to CoNest

**English** · [简体中文](CONTRIBUTING-zh.md)

Discuss bugs and designs in Issues, and submit changes through pull requests. Start a `feature/short-name` or `fix/short-name` branch from `develop`; validated changes can then move to `main`.

## Set up and validate

Use Linux x64, Node.js 24.15.0, pnpm 11.7.0, Git and tar. Native builds require Python 3, make and a C++ compiler. From the repository root:

```bash
node maintenance/bootstrap.mjs
pnpm --dir bridge install --frozen-lockfile
pnpm --dir bridge run build
pnpm --dir bridge exec tsx --test 'test/*.test.ts'
python3 maintenance/check-repository.py
```

Run relevant integration checks for behavior changes. Studio's four acceptance scenarios use real loops and tools with a local model fixture:

```bash
CONEST_DEMO_STATE=/absolute/disposable/conest-check \
  pnpm --dir bridge exec node scripts/demo-studio.mjs --verify
```

For dependency changes, validate both branches from clean clones. See the [Chinese contribution guide](CONTRIBUTING-zh.md) for the validation matrix and development-only memory checks, and [dependency provenance](maintenance/DEPENDENCIES-zh.md) for SDK verification and licensing.

## File naming

Use English names and ASCII characters for all tracked files and directories. Chinese documents use a `-zh` suffix before the extension, for example `README-zh.md` or `studio-zh.md`. Keep links, renderers and packaging scripts consistent when renaming files. The historical paths and hashes in `maintenance/import.json` record the initial import and remain unchanged.

## Submit and release

Describe the concrete problem, resulting behavior and checks performed in your PR. Keep downloaded `.vendor` content, `node_modules`, credentials, logs and runtime state out of Git. CI uses local fixtures and does not invoke paid models.

`main` starts from 0.6.2; `develop` contains 0.6.4 development changes. Maintain shared build and documentation changes in both branches without moving the original `v0.6.2` tag. Use separate clones or worktrees when checking the other branch. SDK releases are development dependencies; plugin installers require their own platform validation.

## Repository content boundary

Commit developer source, configuration, dependency locks, component examples, tests, build/release scripts and developer documentation. Keep only `README.md` as documentation at the `bridge/` root; put technical guides in `bridge/docs/`.

Keep customer presentations, delivery tutorials, speaker notes, screenshots and rendered HTML/PDF outside Git, or in ignored `maintenance/local/customer-delivery/`. Run evidence belongs in ignored `bridge/reports/`; document reproduction commands and scope. Packaged documentation must be explicitly listed in `pack-release.mjs`; never copy the entire docs directory.
