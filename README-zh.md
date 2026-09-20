<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/assets/conest-banner-dark.svg" />
  <source media="(prefers-color-scheme: light)" srcset="docs/assets/conest-banner.svg" />
  <img src="docs/assets/conest-banner.svg" alt="CoNest — Connect the agent world. Agents, tools, memory and services." width="100%" />
</picture>

<br />

**Agent 的万物互联**

连接 Agent、工具、记忆与服务，让能力跨越框架边界。

[English](README.md) &nbsp; / &nbsp; **简体中文**

[![Build](https://img.shields.io/github/actions/workflow/status/zyw02/CoNest/repository.yml?branch=develop&style=flat-square&logo=github&label=build&labelColor=252638&color=65b9a2)](https://github.com/zyw02/CoNest/actions/workflows/repository.yml) [![Node 24.15](https://img.shields.io/badge/Node-24.15-65b9a2?style=flat-square&logo=nodedotjs&logoColor=white&labelColor=252638)](https://nodejs.org/) [![pnpm 11.7](https://img.shields.io/badge/pnpm-11.7-e8b86d?style=flat-square&logo=pnpm&logoColor=white&labelColor=252638)](https://pnpm.io/) [![PRs welcome](https://img.shields.io/badge/PRs-welcome-a392eb?style=flat-square&labelColor=252638)](CONTRIBUTING-zh.md)

<br />

<a href="#快速开始"><strong>快速开始</strong></a> &nbsp;·&nbsp; <a href="bridge/STUDIO-zh.md"><strong>Studio</strong></a> &nbsp;·&nbsp; <a href="#分支与能力"><strong>分支与能力</strong></a> &nbsp;·&nbsp; <a href="CONTRIBUTING-zh.md"><strong>参与共建</strong></a> &nbsp;·&nbsp; <a href="https://github.com/zyw02/CoNest/issues"><strong>Issues</strong></a>

</div>

<br />

**CoNest 正在构建面向 Agent 的互联与协作基础设施。** 我们希望连接不同框架、不同运行环境中的 Agent，让工具、记忆、服务与工作流能够被发现、调用和组合，让各自独立的能力共同完成任务。

**当前实现：** 从 OpenClaw 与 DeepSeek Harness（DSH）的接入起步，以 Cordis 组件运行时提供能力组合、工具互用和共享记忆，Studio 展示接入能力与执行记录。更多 Agent 的接入和跨运行环境协作，是项目继续建设的方向。

> [!TIP]
> **探索 0.6.4** — Gateway 与 CoNest Host 双进程、办公组件组合，以及 `--core` 无 DSH 演示。
> [Windows 安装与演示 →](bridge/docs/windows-0.6.4-zh.md) · [版本范围 →](bridge/docs/release-0.6.4-zh.md)

## 让能力彼此相连

<table>
<tr>
<td width="50%" valign="top">
  <p align="center"><img src="docs/assets/readme/connections.svg" width="48" height="48" alt="" /></p>
  <h3 align="center">连接 Agent</h3>
  <p>面向不同框架和运行环境扩展接入。当前以 OpenClaw 与 DSH 验证执行接入和工具互用。</p>
  <p><a href="bridge/README.md">了解当前接入 →</a></p>
</td>
<td width="50%" valign="top">
  <p align="center"><img src="docs/assets/readme/components.svg" width="48" height="48" alt="" /></p>
  <h3 align="center">组合工具与服务</h3>
  <p>将能力组织成可复用组件，由运行时管理依赖、调用与生命周期，让服务可以彼此协作。</p>
  <p><a href="bridge/README.md">探索组件运行时 →</a></p>
</td>
</tr>
<tr>
<td width="50%" valign="top">
  <p align="center"><img src="docs/assets/readme/memory.svg" width="48" height="48" alt="" /></p>
  <h3 align="center">让知识持续积累</h3>
  <p>通过共享知识图谱捕获和召回记忆，让不同任务接续已记录的知识、约定与经验。</p>
  <p><a href="bridge/STUDIO-zh.md">了解共享记忆 →</a></p>
</td>
<td width="50%" valign="top">
  <p align="center"><img src="docs/assets/readme/studio.svg" width="48" height="48" alt="" /></p>
  <h3 align="center">观察能力如何运行</h3>
  <p>在 Studio 查看工具与组件目录、执行结果和活动时间线，了解已经接入的能力如何工作。</p>
  <p><a href="bridge/STUDIO-zh.md">打开 Studio 手册 →</a></p>
</td>
</tr>
</table>

<details>
<summary><strong>架构与当前边界</strong> · Gateway / Host / 可选 DSH</summary>

[目标架构](DESIGN-zh.md) 将 Cordis 对 OpenClaw 的增强扩展为不依赖 DSH 也能运行的模式。0.6.4 已采用 **Gateway 与 CoNest Host 两个常驻应用进程**，DSH Agent / Session 已迁入 Host；Management、Runtime 与可选 DSH 组合共享 Host。

办公服务示例演示可复用 Cordis 服务及单次调用的依赖图版本一致性。`--core` 可关闭 DSH；独立 Core / DSH 发行包、完整插件贡献模型仍为后续工作。

</details>

<a name="快速开始"></a>

## 快速开始


开发验证环境：**Linux x64、Node.js 24.15.0、pnpm 11.7.0**。系统需要 Git、tar；原生依赖从源码构建时需要 Python 3、make 和 C++ 编译器。Windows / Red Hat 8 的运行包验证范围见开发分支说明，不能将本地开发构建当作跨平台发行包。

```bash
# 使用开发主线参与共建；稳定基线可以把 develop 换成 main。
git clone --branch develop https://github.com/zyw02/CoNest.git
cd CoNest

# 下载并验证固定的 DSH SDK；无需原开发服务器。
node maintenance/bootstrap.mjs

# 安装锁定依赖、构建并运行测试。
pnpm --dir bridge install --frozen-lockfile
pnpm --dir bridge run build
pnpm --dir bridge exec tsx --test 'test/*.test.ts'
```

<details>
<summary>依赖与 SDK 下载说明</summary>

下载的是所需 DSH 源码、JavaScript 运行库和许可证，约 2.3 MB；不包含 Ubuntu 依赖、`node_modules`、会话或凭据。普通依赖来自 npm，SDK 和锁文件均固定版本。见 [依赖来源](maintenance/DEPENDENCIES-zh.md)。

</details>

完成构建后，用隔离状态目录运行四段 Studio 验收：

```bash
CONEST_DEMO_STATE=/absolute/disposable/conest-studio \
  pnpm --dir bridge exec node scripts/demo-studio.mjs --verify
```

当前集成固定使用 [OpenClaw 2026.9.2](https://www.npmjs.com/package/openclaw/v/2026.9.2)。默认采用**本地模型 fixture**：Gateway、DSH Loop、工具和持久化实际执行，不调用付费模型。真实模型接入和插件安装见 [Studio 手册](bridge/STUDIO-zh.md) 与 [插件说明](bridge/README.md)。

<a name="分支与能力"></a>

## 分支与能力

下表记录当前接入的实现范围。更多 Agent 与运行环境将随适配能力逐步扩展。

| 能力 | <img src="docs/assets/readme/stable.svg" width="148" height="30" alt="main · 0.6.2" /><br /><sub>稳定基线</sub> | <img src="docs/assets/readme/develop.svg" width="172" height="30" alt="develop · 0.6.4" /><br /><sub>当前开发线</sub> |
| :--- | :--- | :--- |
| **OpenClaw / DSH 接入与 Studio** | ✓ 已接入 | ✓ 已接入 |
| **DSH Agent / Session** | Gateway 内 | **CoNest Host 内** |
| **OpenClaw 无 DSH 模式** | — | `--core` 办公组件演示 |
| **共享记忆** | Gateway 内提供 | 独立 `dsh-memory` 组件 |
| **工作区搜索** | `knowledge_search` / 验证能力 | 进一步接入 `dsh_grep`、`dsh_glob` |
| **文本读取** | Gateway 内提供 | 独立 `dsh-read`，保留读后写校验 |
| **DSH 动态组件入口** | 尚未接入 | 宿主最终工具准入 + 组件 worker |
| **干净克隆与构建** | ✓ 已验证 | ✓ 已验证 |

<sub>当前浏览的是 <strong>develop</strong>。<code>v0.6.2</code> 保留最初备份；分支维护与安装包发布独立进行。</sub>

## 从这里继续

<table>
<thead><tr><th></th><th align="left">入口</th><th align="left">内容</th></tr></thead>
<tbody>
<tr>
  <td width="48" align="center" valign="middle"><img src="docs/assets/readme/contribute.svg" width="32" height="32" align="absmiddle" alt="" /></td>
  <td valign="middle"><strong><a href="CONTRIBUTING-zh.md">贡献指南</a></strong></td>
  <td valign="middle">修改代码、运行检查、提交 PR</td>
</tr>
<tr>
  <td width="48" align="center" valign="middle"><img src="docs/assets/readme/package.svg" width="32" height="32" align="absmiddle" alt="" /></td>
  <td valign="middle"><strong><a href="maintenance/DEPENDENCIES-zh.md">依赖来源与复现</a></strong></td>
  <td valign="middle">核对 SDK、补丁与第三方许可证</td>
</tr>
<tr>
  <td width="48" align="center" valign="middle"><img src="docs/assets/readme/components.svg" width="32" height="32" align="absmiddle" alt="" /></td>
  <td valign="middle"><strong><a href="bridge/README.md">插件 README</a></strong></td>
  <td valign="middle">配置接入与运行时组件</td>
</tr>
<tr>
  <td width="48" align="center" valign="middle"><img src="docs/assets/readme/studio.svg" width="32" height="32" align="absmiddle" alt="" /></td>
  <td valign="middle"><strong><a href="bridge/STUDIO-zh.md">Studio 手册</a></strong></td>
  <td valign="middle">查看工具目录、任务执行与共享记忆</td>
</tr>
<tr>
  <td width="48" align="center" valign="middle"><img src="docs/assets/readme/lock.svg" width="32" height="32" align="absmiddle" alt="" /></td>
  <td valign="middle"><strong><a href="bridge/AUTHORIZATION.md">授权模型</a></strong></td>
  <td valign="middle">理解权限与调用边界</td>
</tr>
<tr>
  <td width="48" align="center" valign="middle"><img src="docs/assets/readme/archive.svg" width="32" height="32" align="absmiddle" alt="" /></td>
  <td valign="middle"><strong><a href="maintenance/IMPORT-zh.md">源码来源</a></strong></td>
  <td valign="middle">查看当前分支的导入依据</td>
</tr>
</tbody>
</table>

<details>
<summary>仓库内容与历史交付资料</summary>

Git 中维护源码、测试、文档和构建配置。历史交付包、原始验收报告和个人运行数据不在仓库内；旧教程中的本地 `releases/`、`reports/` 链接需要对应交付资料。

</details>

<br />

---

<div align="center">

<img src="docs/assets/brand/conest-avatar.svg" width="64" height="64" alt="CoNest" />

**一起构建 Agent 的互联世界。**

从一个组件、一条反馈或一次 PR 开始。

[参与共建 →](CONTRIBUTING-zh.md) &nbsp;·&nbsp; [反馈问题 →](https://github.com/zyw02/CoNest/issues)

<sub>Agents · Tools · Memory · Services &nbsp; / &nbsp; CoNest</sub>

</div>
