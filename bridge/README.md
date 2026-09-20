# CoNest developer references

To **start CoNest**, use the [project README](../README.md). To **submit a change**, use [CONTRIBUTING](../CONTRIBUTING.md). The references below are needed only when modifying their corresponding implementation.

| Task | Reference | Source entry points |
| --- | --- | --- |
| Implement or configure a component | [Components](docs/components.md) | `src/components.ts`, `src/runtime.ts`, `examples/` |
| Change host integration or authorization | [Host integration](docs/host-integration.md) | `src/index.ts`, `src/host-adapter.ts`, `src/authorization.ts`, `src/studio/` |
| Build and validate installation artifacts | [Packaging](docs/installation.md) | `scripts/pack-release.mjs`, `scripts/test-installation.mjs` |
| Restore or update the pinned SDK | [Dependency provenance](../maintenance/DEPENDENCIES.md) | `maintenance/bootstrap.mjs`, `maintenance/sdk.lock.json` |

This branch contains **0.6.4**. The plugin ID is `dsh-bridge`; package version and host compatibility are declared in [package.json](package.json) and [openclaw.plugin.json](openclaw.plugin.json).

```text
src/          Connector, runtime, host services and Studio
test/         Behavioral and regression tests
scripts/      Builds, packaging and integration checks
docs/         The three implementation references above
examples/     Minimal installable components and policies
experiments/  Isolated Loader and DSH compatibility probes
companions/   Optional DSH Web integration
patches/      Pinned dependency patches
```

Experiment notes live beside their fixtures; they qualify only the stated probe. Test and validation commands belong in CONTRIBUTING. Internal plans, customer materials and run reports stay outside Git.
