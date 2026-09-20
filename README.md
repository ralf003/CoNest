<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/assets/conest-banner-dark.svg" />
  <source media="(prefers-color-scheme: light)" srcset="docs/assets/conest-banner.svg" />
  <img src="docs/assets/conest-banner.svg" alt="CoNest — Two loops. One workspace. OpenClaw + DSH + Cordis." width="100%" />
</picture>

<br />

**Two agent loops · Shared tools and memory · One component runtime**

**English** &nbsp; / &nbsp; [简体中文](README-zh.md)

[![Build](https://img.shields.io/github/actions/workflow/status/zyw02/CoNest/repository.yml?branch=develop&style=flat-square&logo=github&label=build&labelColor=252638&color=65b9a2)](https://github.com/zyw02/CoNest/actions/workflows/repository.yml) [![OpenClaw 2026.9.2](https://img.shields.io/badge/OpenClaw-2026.9.2-ef9586?style=flat-square&labelColor=252638)](https://www.npmjs.com/package/openclaw/v/2026.9.2) [![Node 24.15](https://img.shields.io/badge/Node-24.15-65b9a2?style=flat-square&logo=nodedotjs&logoColor=white&labelColor=252638)](https://nodejs.org/) [![pnpm 11.7](https://img.shields.io/badge/pnpm-11.7-e8b86d?style=flat-square&logo=pnpm&logoColor=white&labelColor=252638)](https://pnpm.io/) [![PRs welcome](https://img.shields.io/badge/PRs-welcome-a392eb?style=flat-square&labelColor=252638)](CONTRIBUTING.md)

<br />

<a href="#quick-start"><strong>Quick start</strong></a> &nbsp;·&nbsp; <a href="bridge/STUDIO-zh.md"><strong>Studio</strong></a> &nbsp;·&nbsp; <a href="#branches"><strong>Branches</strong></a> &nbsp;·&nbsp; <a href="CONTRIBUTING.md"><strong>Contribute</strong></a> &nbsp;·&nbsp; <a href="https://github.com/zyw02/CoNest/issues"><strong>Issues</strong></a>

</div>

<br />

**CoNest connects OpenClaw with DeepSeek Harness (DSH).** Choose an agent loop, use tools from both ecosystems, and carry memory between tasks. CoNest Runtime manages Cordis components; Studio brings the tools and execution history into one workspace.

> [!TIP]
> **Explore 0.6.4** — Gateway + CoNest Host, composable office services, and an OpenClaw demo without DSH via `--core`.
> [Windows demo (中文) →](bridge/docs/windows-0.6.4-zh.md) · [Release scope (中文) →](bridge/docs/release-0.6.4-zh.md)

## Built to work together

<table>
<tr>
<td width="50%" valign="top">
  <img src="docs/assets/readme/loops.svg" width="44" height="44" alt="" />
  <p><sub>EXECUTION</sub><br /><strong>Choose your loop</strong></p>
  <p>Switch between native OpenClaw and DSH execution. Follow actual task results in Studio.</p>
  <a href="bridge/STUDIO-zh.md">Explore both loops →</a>
</td>
<td width="50%" valign="top">
  <img src="docs/assets/readme/components.svg" width="44" height="44" alt="" />
  <p><sub>COMPONENTS</sub><br /><strong>Compose capabilities</strong></p>
  <p>A dedicated worker manages discovery, invocation, lifecycle and permissions for runtime components.</p>
  <a href="bridge/README.md">Meet the runtime →</a>
</td>
</tr>
<tr>
<td width="50%" valign="top">
  <img src="docs/assets/readme/memory.svg" width="44" height="44" alt="" />
  <p><sub>MEMORY</sub><br /><strong>Carry context forward</strong></p>
  <p>A shared knowledge graph captures and recalls memory, keeping recorded decisions and preferences available.</p>
  <a href="bridge/STUDIO-zh.md">Explore shared memory →</a>
</td>
<td width="50%" valign="top">
  <img src="docs/assets/readme/studio.svg" width="44" height="44" alt="" />
  <p><sub>STUDIO</sub><br /><strong>One place to work</strong></p>
  <p>Browse tools and ecosystems, switch loops and follow the activity timeline, also available through DSH Web.</p>
  <a href="bridge/STUDIO-zh.md">Open the Studio guide →</a>
</td>
</tr>
</table>

<details>
<summary><strong>Architecture & current scope</strong> · Gateway / Host / optional DSH</summary>

The [target architecture (中文)](DESIGN-zh.md) extends Cordis-based OpenClaw enhancement to work without DSH. Version 0.6.4 uses **two persistent application processes: Gateway and CoNest Host**. DSH Agent / Session runs inside Host, alongside Management, Runtime and the optional DSH composition.

The office example demonstrates reusable Cordis services and per-call dependency graph consistency. `--core` disables DSH; separate Core / DSH distribution packages and the full plugin contribution model remain future work.

</details>

<a name="quick-start"></a>

## <img src="docs/assets/readme/start.svg" width="28" height="28" alt="" /> Quick start


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

The default uses a **local model fixture**: Gateway, loops, tools and persistence execute normally without paid model calls. See the [Studio guide (中文)](bridge/STUDIO-zh.md) and [plugin README](bridge/README.md) for installation and model configuration.

<a name="branches"></a>

## <img src="docs/assets/readme/branches.svg" width="28" height="28" alt="" /> Branches

Choose the stable baseline or follow development. Here is what each branch implements.

| Capability | <img src="docs/assets/readme/stable.svg" width="148" height="30" alt="main · 0.6.2" /><br /><sub>STABLE BASELINE</sub> | <img src="docs/assets/readme/develop.svg" width="172" height="30" alt="develop · 0.6.4" /><br /><sub>CURRENT DEVELOPMENT</sub> |
| :--- | :--- | :--- |
| **Dual loops & Studio** | ✓ Available | ✓ Available |
| **DSH Agent / Session** | In Gateway | **Inside CoNest Host** |
| **OpenClaw without DSH** | — | Office component demo via `--core` |
| **Shared memory** | In Gateway | Dedicated `dsh-memory` component |
| **Workspace search** | `knowledge_search` and verification | Also serves `dsh_grep` and `dsh_glob` |
| **Text reads** | In Gateway | Dedicated `dsh-read`, with guarded-edit observations |
| **Dynamic DSH components** | Pending | Host tool admission + component worker |
| **Clean clone & build** | ✓ Verified | ✓ Verified |

<sub>You are viewing <strong>develop</strong>. The original <code>v0.6.2</code> tag preserves the initial backup; branch maintenance continues independently of packaged releases.</sub>

## <img src="docs/assets/readme/docs.svg" width="28" height="28" alt="" /> Explore

| | Resource | What you will find |
| :---: | :--- | :--- |
| <img src="docs/assets/readme/contribute.svg" width="24" height="24" alt="" /> | **[Contributing](CONTRIBUTING.md)** | Code changes, checks and pull requests |
| <img src="docs/assets/readme/package.svg" width="24" height="24" alt="" /> | **[Dependencies (中文)](maintenance/DEPENDENCIES-zh.md)** | SDK verification, patches and third-party licenses |
| <img src="docs/assets/readme/components.svg" width="24" height="24" alt="" /> | **[Plugin README](bridge/README.md)** | Plugin configuration and runtime components |
| <img src="docs/assets/readme/studio.svg" width="24" height="24" alt="" /> | **[Studio guide (中文)](bridge/STUDIO-zh.md)** | Dual loops, tool catalogs and shared memory |
| <img src="docs/assets/readme/lock.svg" width="24" height="24" alt="" /> | **[Authorization](bridge/AUTHORIZATION.md)** | Permissions and invocation boundaries |
| <img src="docs/assets/readme/archive.svg" width="24" height="24" alt="" /> | **[Import provenance (中文)](maintenance/IMPORT-zh.md)** | The original source import |

<details>
<summary>Repository contents & historical deliveries</summary>

Git contains source, tests, documentation and build configuration. Historical release packages, private acceptance reports and personal runtime data are distributed or retained separately. Old links into `releases/` and `reports/` require the corresponding delivery materials.

</details>

<br />

---

<div align="center">

<img src="docs/assets/readme/loops.svg" width="36" height="36" alt="" />

**Build together, one capability at a time.**

Start with a component, an idea, or your first pull request.

[Contribute →](CONTRIBUTING.md) &nbsp;·&nbsp; [Report an issue →](https://github.com/zyw02/CoNest/issues)

<sub>OpenClaw + DSH + Cordis &nbsp; / &nbsp; CoNest</sub>

</div>
