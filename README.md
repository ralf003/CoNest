<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/assets/conest-banner-dark.svg" />
  <source media="(prefers-color-scheme: light)" srcset="docs/assets/conest-banner.svg" />
  <img src="docs/assets/conest-banner.svg" alt="CoNest — Connect the agent world. Agents, tools, memory and services." width="100%" />
</picture>

<br />

**Connect the agent world.**

Agents · Tools · Memory · Services

**English** &nbsp; / &nbsp; [简体中文](README-zh.md)

[![Build](https://img.shields.io/github/actions/workflow/status/zyw02/CoNest/repository.yml?branch=develop&style=flat-square&logo=github&label=build&labelColor=252638&color=65b9a2)](https://github.com/zyw02/CoNest/actions/workflows/repository.yml) [![Node 24.15](https://img.shields.io/badge/Node-24.15-65b9a2?style=flat-square&logo=nodedotjs&logoColor=white&labelColor=252638)](https://nodejs.org/) [![pnpm 11.7](https://img.shields.io/badge/pnpm-11.7-e8b86d?style=flat-square&logo=pnpm&logoColor=white&labelColor=252638)](https://pnpm.io/) [![PRs welcome](https://img.shields.io/badge/PRs-welcome-a392eb?style=flat-square&labelColor=252638)](CONTRIBUTING.md)

<br />

<a href="#quick-start"><strong>Quick start</strong></a> &nbsp;·&nbsp; <a href="bridge/STUDIO-zh.md"><strong>Studio</strong></a> &nbsp;·&nbsp; <a href="#branches"><strong>Branches</strong></a> &nbsp;·&nbsp; <a href="CONTRIBUTING.md"><strong>Contribute</strong></a> &nbsp;·&nbsp; <a href="https://github.com/zyw02/CoNest/issues"><strong>Issues</strong></a>

</div>

<br />

**CoNest is building an interconnected world for agents.** Our goal is to connect agents across frameworks and runtimes, so tools, memory, services and workflows can be discovered, invoked and composed into capabilities that work together.

**Available today:** OpenClaw and DeepSeek Harness (DSH) are the first integrations. A Cordis-based runtime supports component composition, tool interoperability and shared memory; Studio shows available capabilities and execution history. More agent integrations and collaboration across runtimes are the next steps.

> [!TIP]
> **Explore 0.6.4** — Gateway + CoNest Host, composable office services, and an OpenClaw demo without DSH via `--core`.
> [Windows demo (中文) →](bridge/docs/windows-0.6.4-zh.md) · [Release scope (中文) →](bridge/docs/release-0.6.4-zh.md)

## Capabilities, connected

<table>
<tr>
<td width="50%" valign="top">
  <p align="center"><img src="docs/assets/readme/connections.svg" width="48" height="48" alt="" /></p>
  <h3 align="center">Connect agents</h3>
  <p>Extend access across frameworks and runtimes. OpenClaw and DSH are the first integrations for execution and tool interoperability.</p>
  <p><a href="bridge/README.md">Explore current integrations →</a></p>
</td>
<td width="50%" valign="top">
  <p align="center"><img src="docs/assets/readme/components.svg" width="48" height="48" alt="" /></p>
  <h3 align="center">Compose tools & services</h3>
  <p>Build reusable components. The runtime manages dependencies, invocation and lifecycle so services can work together.</p>
  <p><a href="bridge/README.md">Meet the component runtime →</a></p>
</td>
</tr>
<tr>
<td width="50%" valign="top">
  <p align="center"><img src="docs/assets/readme/memory.svg" width="48" height="48" alt="" /></p>
  <h3 align="center">Let knowledge accumulate</h3>
  <p>Capture and recall a shared knowledge graph so tasks can build on recorded project knowledge, decisions and experience.</p>
  <p><a href="bridge/STUDIO-zh.md">Explore shared memory →</a></p>
</td>
<td width="50%" valign="top">
  <p align="center"><img src="docs/assets/readme/studio.svg" width="48" height="48" alt="" /></p>
  <h3 align="center">See how capabilities work</h3>
  <p>Browse tool and component catalogs, task results and the activity timeline in Studio to understand the integrations running today.</p>
  <p><a href="bridge/STUDIO-zh.md">Open the Studio guide →</a></p>
</td>
</tr>
</table>

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

The current integration pins [OpenClaw 2026.9.2](https://www.npmjs.com/package/openclaw/v/2026.9.2). The default uses a **local model fixture**: Gateway, loops, tools and persistence execute normally without paid model calls. See the [Studio guide (中文)](bridge/STUDIO-zh.md) and [plugin README](bridge/README.md) for installation and model configuration.

<a name="branches"></a>

## Branches

This matrix records the integrations implemented today. More agents and runtimes will follow as adapters are developed.

| Capability | <img src="docs/assets/readme/stable.svg" width="148" height="30" alt="main · 0.6.2" /><br /><sub>STABLE BASELINE</sub> | <img src="docs/assets/readme/develop.svg" width="172" height="30" alt="develop · 0.6.4" /><br /><sub>CURRENT DEVELOPMENT</sub> |
| :--- | :--- | :--- |
| **OpenClaw / DSH & Studio** | ✓ Available | ✓ Available |
| **DSH Agent / Session** | In Gateway | **Inside CoNest Host** |
| **OpenClaw without DSH** | — | Office component demo via `--core` |
| **Shared memory** | In Gateway | Dedicated `dsh-memory` component |
| **Workspace search** | `knowledge_search` and verification | Also serves `dsh_grep` and `dsh_glob` |
| **Text reads** | In Gateway | Dedicated `dsh-read`, with guarded-edit observations |
| **Dynamic DSH components** | Pending | Host tool admission + component worker |
| **Clean clone & build** | ✓ Verified | ✓ Verified |

<sub>You are viewing <strong>develop</strong>. The original <code>v0.6.2</code> tag preserves the initial backup; branch maintenance continues independently of packaged releases.</sub>

## Explore

<table>
<thead><tr><th></th><th align="left">Resource</th><th align="left">What you will find</th></tr></thead>
<tbody>
<tr>
  <td width="48" align="center" valign="middle"><img src="docs/assets/readme/contribute.svg" width="32" height="32" align="absmiddle" alt="" /></td>
  <td valign="middle"><strong><a href="CONTRIBUTING.md">Contributing</a></strong></td>
  <td valign="middle">Code changes, checks and pull requests</td>
</tr>
<tr>
  <td width="48" align="center" valign="middle"><img src="docs/assets/readme/package.svg" width="32" height="32" align="absmiddle" alt="" /></td>
  <td valign="middle"><strong><a href="maintenance/DEPENDENCIES-zh.md">Dependencies (中文)</a></strong></td>
  <td valign="middle">SDK verification, patches and licenses</td>
</tr>
<tr>
  <td width="48" align="center" valign="middle"><img src="docs/assets/readme/components.svg" width="32" height="32" align="absmiddle" alt="" /></td>
  <td valign="middle"><strong><a href="bridge/README.md">Plugin README</a></strong></td>
  <td valign="middle">Integration and component configuration</td>
</tr>
<tr>
  <td width="48" align="center" valign="middle"><img src="docs/assets/readme/studio.svg" width="32" height="32" align="absmiddle" alt="" /></td>
  <td valign="middle"><strong><a href="bridge/STUDIO-zh.md">Studio guide (中文)</a></strong></td>
  <td valign="middle">Tool catalogs, task execution and memory</td>
</tr>
<tr>
  <td width="48" align="center" valign="middle"><img src="docs/assets/readme/lock.svg" width="32" height="32" align="absmiddle" alt="" /></td>
  <td valign="middle"><strong><a href="bridge/AUTHORIZATION.md">Authorization</a></strong></td>
  <td valign="middle">Permissions and invocation boundaries</td>
</tr>
<tr>
  <td width="48" align="center" valign="middle"><img src="docs/assets/readme/archive.svg" width="32" height="32" align="absmiddle" alt="" /></td>
  <td valign="middle"><strong><a href="maintenance/IMPORT-zh.md">Import provenance (中文)</a></strong></td>
  <td valign="middle">The original source import</td>
</tr>
</tbody>
</table>

<details>
<summary>Repository contents & historical deliveries</summary>

Git contains source, tests, documentation and build configuration. Historical release packages, private acceptance reports and personal runtime data are distributed or retained separately. Old links into `releases/` and `reports/` require the corresponding delivery materials.

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
