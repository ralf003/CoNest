<div align="center">

<picture>
  <source media="(max-width: 600px) and (prefers-color-scheme: dark)" srcset="docs/assets/conest-banner-mobile-dark.svg" />
  <source media="(max-width: 600px)" srcset="docs/assets/conest-banner-mobile.svg" />
  <source media="(prefers-color-scheme: dark)" srcset="docs/assets/conest-banner-dark.svg" />
  <img src="docs/assets/conest-banner.svg" alt="CoNest — Connect the agent world. Agents, tools, memory and services." width="100%" />
</picture>

**English** &nbsp; / &nbsp; [简体中文](README-zh.md)

[![Build](https://img.shields.io/github/actions/workflow/status/zyw02/CoNest/repository.yml?branch=develop&style=flat-square&logo=github&label=build&labelColor=252638&color=65b9a2)](https://github.com/zyw02/CoNest/actions/workflows/repository.yml) [![Node 24.16](https://img.shields.io/badge/Node-24.16-65b9a2?style=flat-square&logo=nodedotjs&logoColor=white&labelColor=252638)](https://nodejs.org/) [![pnpm 11.7](https://img.shields.io/badge/pnpm-11.7-e8b86d?style=flat-square&logo=pnpm&logoColor=white&labelColor=252638)](https://pnpm.io/) [![PRs welcome](https://img.shields.io/badge/PRs-welcome-a392eb?style=flat-square&labelColor=252638)](CONTRIBUTING.md)

<br />

<a href="#quick-start"><strong>Quick start</strong></a> &nbsp;·&nbsp; <a href="#quick-start"><strong>Studio</strong></a> &nbsp;·&nbsp; <a href="#branches"><strong>Branches</strong></a> &nbsp;·&nbsp; <a href="CONTRIBUTING.md"><strong>Contribute</strong></a> &nbsp;·&nbsp; <a href="https://github.com/zyw02/CoNest/issues"><strong>Issues</strong></a>

</div>

<br />

**CoNest is building an interconnected world for agents.** Our goal is to connect agents across frameworks and runtimes, so tools, memory, services and workflows can be discovered, invoked and composed into capabilities that work together.

**Available today:** OpenClaw and DeepSeek Harness (DSH) are the first integrations. A Cordis-based runtime supports component composition, tool interoperability and shared memory; Studio shows available capabilities and execution history. More agent integrations and collaboration across runtimes are the next steps.

CoNest is intended to become the capability fabric between Agent runtimes, reusable services and OS execution nodes. It matters when one durable task must cross runtimes, machines, trust boundaries and business systems while retaining one identity, policy, operation history and deliverable state—not when a single Agent only needs another tool endpoint.

CoNest keeps its component manifest and runtime protocol independent from either Agent SDK. OpenClaw and the optional DSH/Cordis support pack enter through narrow adapters; the machine-readable [compatibility policy](compatibility.json) records qualified versions. CI verifies the oldest and newest supported OpenClaw releases plus every declared DSH release from its pinned source.

> [!TIP]
> **Explore 0.6.4** — Gateway + CoNest Host, composable office services, and an OpenClaw demo without DSH via `--core`.

## Capabilities, connected

- **[Connect agents](docs/README.md)** — Extend access across frameworks and runtimes, starting with OpenClaw and DSH execution and tool interoperability.

- **[Compose tools & services](docs/README.md)** — Build reusable components. The runtime manages dependencies, invocation and lifecycle so services can work together.

- **[Let knowledge accumulate](#quick-start)** — Capture and recall a shared knowledge graph so tasks can build on recorded knowledge, decisions and experience.

- **[See how capabilities work](#quick-start)** — Browse tool and component catalogs, task results and the activity timeline in Studio.

<details>
<summary><strong>Architecture & current scope</strong> · Gateway / Host / optional DSH</summary>

Version 0.6.4 uses **two persistent application processes: Gateway and CoNest Host**. DSH Agent / Session runs inside Host, alongside Management, Runtime and the optional DSH composition.

The office example demonstrates reusable Cordis services and per-call dependency graph consistency. `--core` disables DSH; separate Core / DSH distribution packages and the full plugin contribution model remain future work.

</details>

<a name="quick-start"></a>

## Quick start

**New here? This section is all you need to start.** The validated source environment is Linux x64, Node.js 24.16.0 and pnpm 11.7.0. Install Git, tar, Python 3, make and a C++ compiler for native dependencies.

```bash
git clone --branch develop https://github.com/zyw02/CoNest.git
cd CoNest
node scripts/maintenance/bootstrap.mjs
pnpm install --frozen-lockfile
pnpm build
CONEST_DEMO_STATE="$PWD/.local/studio" \
  pnpm start
```

Open the Studio URL printed in the terminal. Enter the Gateway token from the printed `connection.json` location in its connection settings. The default port is 18791; override it with `CONEST_DEMO_PORT`. Stop the local launcher with Ctrl+C. The ignored `.local/studio/` directory holds the fixture workspace, configuration and memory; do not point it at customer data or commit its contents.

The default model is a local fixture: no API key is needed, while Gateway, tools and persistence execute normally. Append `--verify` to the last command for an automated check that exits when finished. Live-model use requires an owner-readable file containing `DEEPSEEK_API_KEY`, selected by `CONEST_CREDENTIAL_FILE` and an explicit `--live` flag; it incurs API usage.

If startup fails, check Node/pnpm versions, port availability and the terminal error. See [dependency maintenance](docs/dependencies.md) for SDK download problems or [host configuration](docs/host-integration.md#plugin-configuration) for an existing Gateway. For further help, use the [Question form](https://github.com/zyw02/CoNest/issues/new?template=question.yml) with versions, commands and redacted errors.

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

## What should I read?

- **Run CoNest:** [Quick start](#quick-start) on this page, also available in [Chinese](README-zh.md).
- **Report a problem or submit a PR:** [CONTRIBUTING](CONTRIBUTING.md), the single collaboration policy.
- **Change implementation details:** [Developer reference index](docs/README.md), organized by components, host integration and packaging.

[MIT license](LICENSE) · [Third-party notices](THIRD_PARTY_NOTICES.md) · [Security](SECURITY.md)

<br />

---

<div align="center">

<img src="docs/assets/brand/conest-avatar.svg" width="64" height="64" alt="CoNest" />

**Build an interconnected world for agents.**

Start with a component, an idea, or your first pull request.

[Contribute →](CONTRIBUTING.md) &nbsp;·&nbsp; [Report an issue →](https://github.com/zyw02/CoNest/issues)

<sub>Agents · Tools · Memory · Services &nbsp; / &nbsp; CoNest</sub>

</div>
