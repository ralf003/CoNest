<div align="center">

<picture>
  <source media="(max-width: 600px) and (prefers-color-scheme: dark)" srcset="docs/assets/conest-banner-mobile-dark.svg" />
  <source media="(max-width: 600px)" srcset="docs/assets/conest-banner-mobile.svg" />
  <source media="(prefers-color-scheme: dark)" srcset="docs/assets/conest-banner-dark.svg" />
  <img src="docs/assets/conest-banner.svg" alt="CoNest — Connect the agent world. Agents, tools, memory and services." width="100%" />
</picture>

**English** &nbsp; / &nbsp; [简体中文](README-zh.md)

[![Build](https://img.shields.io/github/actions/workflow/status/zyw02/CoNest/repository.yml?branch=develop&style=flat-square&logo=github&label=build&labelColor=252638&color=65b9a2)](https://github.com/zyw02/CoNest/actions/workflows/repository.yml) [![Node 24.15](https://img.shields.io/badge/Node-24.15-65b9a2?style=flat-square&logo=nodedotjs&logoColor=white&labelColor=252638)](https://nodejs.org/) [![pnpm 11.7](https://img.shields.io/badge/pnpm-11.7-e8b86d?style=flat-square&logo=pnpm&logoColor=white&labelColor=252638)](https://pnpm.io/) [![PRs welcome](https://img.shields.io/badge/PRs-welcome-a392eb?style=flat-square&labelColor=252638)](CONTRIBUTING.md)

<br />

<a href="#quick-start"><strong>Quick start</strong></a> &nbsp;·&nbsp; <a href="bridge/docs/studio-zh.md"><strong>Studio</strong></a> &nbsp;·&nbsp; <a href="#branches"><strong>Branches</strong></a> &nbsp;·&nbsp; <a href="CONTRIBUTING.md"><strong>Contribute</strong></a> &nbsp;·&nbsp; <a href="https://github.com/zyw02/CoNest/issues"><strong>Issues</strong></a>

</div>

<br />

**CoNest is building an interconnected world for agents.** Our goal is to connect agents across frameworks and runtimes, so tools, memory, services and workflows can be discovered, invoked and composed into capabilities that work together.

**Available today:** OpenClaw and DeepSeek Harness (DSH) are the first integrations. A Cordis-based runtime supports component composition, tool interoperability and shared memory; Studio shows available capabilities and execution history. More agent integrations and collaboration across runtimes are the next steps.

> [!TIP]
> **Explore 0.6.4** — Gateway + CoNest Host, composable office services, and an OpenClaw demo without DSH via `--core`.

## Capabilities, connected

- **[Connect agents](bridge/README.md)** — Extend access across frameworks and runtimes, starting with OpenClaw and DSH execution and tool interoperability.

- **[Compose tools & services](bridge/README.md)** — Build reusable components. The runtime manages dependencies, invocation and lifecycle so services can work together.

- **[Let knowledge accumulate](bridge/docs/studio-zh.md)** — Capture and recall a shared knowledge graph so tasks can build on recorded knowledge, decisions and experience.

- **[See how capabilities work](bridge/docs/studio-zh.md)** — Browse tool and component catalogs, task results and the activity timeline in Studio.

<details>
<summary><strong>Architecture & current scope</strong> · Gateway / Host / optional DSH</summary>

The [target architecture (中文)](DESIGN-zh.md) extends Cordis-based OpenClaw enhancement to work without DSH. Version 0.6.4 uses **two persistent application processes: Gateway and CoNest Host**. DSH Agent / Session runs inside Host, alongside Management, Runtime and the optional DSH composition.

The office example demonstrates reusable Cordis services and per-call dependency graph consistency. `--core` disables DSH; separate Core / DSH distribution packages and the full plugin contribution model remain future work.

</details>

<a name="quick-start"></a>

## Quick start

Validated development environment: **Linux x64, Node.js 24.15.0 and pnpm 11.7.0**. Install Git and tar; native builds also require Python 3, make and a C++ compiler. Windows and RHEL 8 release packages have separate platform requirements and validation.

```bash
# Use develop to contribute; use main for the stable baseline.
git clone --branch develop https://github.com/zyw02/CoNest.git
cd CoNest

# Download and verify the pinned DSH SDK.
node maintenance/bootstrap.mjs

# Install locked dependencies, build and test.
pnpm --dir bridge install --frozen-lockfile
pnpm --dir bridge run build
pnpm --dir bridge exec tsx --test 'test/*.test.ts'
```

<details>
<summary>Dependencies & SDK download</summary>

The SDK contains the required DSH source, JavaScript runtime, types and licenses, approximately 2.3 MB compressed. Ordinary dependencies come from npm. Both the SDK and package lockfile are pinned. See [dependency provenance (中文)](maintenance/DEPENDENCIES-zh.md).

</details>

After building, run the four Studio acceptance scenarios with a disposable state directory:

```bash
CONEST_DEMO_STATE=/absolute/disposable/conest-studio \
  pnpm --dir bridge exec node scripts/demo-studio.mjs --verify
```

The current integration pins [OpenClaw 2026.9.2](https://www.npmjs.com/package/openclaw/v/2026.9.2). The default uses a **local model fixture**: Gateway, loops, tools and persistence execute normally without paid model calls. See the [Studio guide (中文)](bridge/docs/studio-zh.md) and [plugin README](bridge/README.md) for installation and model configuration.

<a name="branches"></a>

## Branches

`main` is the stable baseline; `develop` is the development branch. Both include OpenClaw / DSH integration, Studio, and verified clean-clone builds. The table focuses on implementation differences; more agent and runtime adapters remain under development.

| Capability | <a href="https://github.com/zyw02/CoNest/tree/main"><picture><source media="(prefers-color-scheme: dark)" srcset="docs/assets/readme/git-branch-dark.svg" /><img src="docs/assets/readme/git-branch.svg" width="16" height="16" align="absmiddle" alt="" /></picture> <code>main</code></a> · 0.6.2 | <a href="https://github.com/zyw02/CoNest/tree/develop"><picture><source media="(prefers-color-scheme: dark)" srcset="docs/assets/readme/git-branch-dark.svg" /><img src="docs/assets/readme/git-branch.svg" width="16" height="16" align="absmiddle" alt="" /></picture> <code>develop</code></a> · 0.6.4 |
| :--- | :--- | :--- |
| DSH execution | Gateway | CoNest Host |
| Without DSH | — | Office demo via `--core` |
| Shared memory | Provided by Gateway | `dsh-memory` component |
| Workspace search | `knowledge_search` and verification | Adds `dsh_grep` / `dsh_glob` |
| Text reads | Provided by Gateway | `dsh-read`, with guarded-edit observations |
| Dynamic DSH components | Pending | Host tool admission and component worker |

<sub>You are viewing <strong>develop</strong>. The original <code>v0.6.2</code> tag preserves the initial backup; branch maintenance continues independently of packaged releases.</sub>

## Explore

- **Use CoNest** · [Plugin configuration](bridge/README.md) · [Studio guide (中文)](bridge/docs/studio-zh.md)
- **Build & contribute** · [Contributing](CONTRIBUTING.md) · [Dependencies (中文)](maintenance/DEPENDENCIES-zh.md)
- **Understand internals** · [Authorization](bridge/docs/authorization.md) · [Import provenance (中文)](maintenance/IMPORT-zh.md)

<details>
<summary>Repository contents</summary>

Git contains developer source, tests, examples, build scripts and technical documentation. Customer materials and run reports stay outside Git.

</details>

<br />

---

<div align="center">

<img src="docs/assets/brand/conest-avatar.svg" width="64" height="64" alt="CoNest" />

**Build an interconnected world for agents.**

Start with a component, an idea, or your first pull request.

[Contribute →](CONTRIBUTING.md) &nbsp;·&nbsp; [Report an issue →](https://github.com/zyw02/CoNest/issues)

<sub>Agents · Tools · Memory · Services &nbsp; / &nbsp; CoNest</sub>

</div>
