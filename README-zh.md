<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/assets/conest-banner-dark.svg" />
  <source media="(prefers-color-scheme: light)" srcset="docs/assets/conest-banner.svg" />
  <img src="docs/assets/conest-banner.svg" alt="CoNest — A shared home. Room to grow. OpenClaw + DSH + Cordis." width="100%" />
</picture>

<br />

**两种 Agent Loop · 共享工具与记忆 · 一个组件运行时**

[English](README.md) &nbsp; / &nbsp; **简体中文**

[![Build](https://img.shields.io/github/actions/workflow/status/zyw02/CoNest/repository.yml?branch=develop&style=flat-square&logo=github&label=build&labelColor=252638&color=65b9a2)](https://github.com/zyw02/CoNest/actions/workflows/repository.yml) [![OpenClaw 2026.9.2](https://img.shields.io/badge/OpenClaw-2026.9.2-ef9586?style=flat-square&labelColor=252638)](https://www.npmjs.com/package/openclaw/v/2026.9.2) [![Node 24.15](https://img.shields.io/badge/Node-24.15-65b9a2?style=flat-square&logo=nodedotjs&logoColor=white&labelColor=252638)](https://nodejs.org/) [![pnpm 11.7](https://img.shields.io/badge/pnpm-11.7-e8b86d?style=flat-square&logo=pnpm&logoColor=white&labelColor=252638)](https://pnpm.io/) [![PRs welcome](https://img.shields.io/badge/PRs-welcome-a392eb?style=flat-square&labelColor=252638)](CONTRIBUTING-zh.md)

<br />

<a href="#快速开始"><strong>快速开始</strong></a> &nbsp;·&nbsp; <a href="bridge/STUDIO-zh.md"><strong>Studio</strong></a> &nbsp;·&nbsp; <a href="#分支与能力"><strong>分支与能力</strong></a> &nbsp;·&nbsp; <a href="CONTRIBUTING-zh.md"><strong>参与共建</strong></a> &nbsp;·&nbsp; <a href="https://github.com/zyw02/CoNest/issues"><strong>Issues</strong></a>

</div>

<br />

**CoNest 连接 OpenClaw 与 DeepSeek Harness（DSH）。** 在同一工作台选择 Agent Loop、调用双方工具，并在不同任务间共享记忆。Cordis 组件由 CoNest Runtime 管理，Studio 提供统一入口和执行记录。

> [!TIP]
> **探索 0.6.4** — Gateway 与 CoNest Host 双进程、办公组件组合，以及 `--core` 无 DSH 演示。
> [Windows 安装与演示 →](bridge/docs/windows-0.6.4-zh.md) · [版本范围 →](bridge/docs/release-0.6.4-zh.md)

## 为协作而连接

<table>
<tr>
<td width="50%" valign="top">
  <img src="docs/assets/readme/loops.svg" width="44" height="44" alt="" />
  <p><sub>EXECUTION</sub><br /><strong>选择任务如何执行</strong></p>
  <p>在 OpenClaw 原生 Loop 与 DSH Loop 之间选择，在 Studio 查看实际执行结果。</p>
  <a href="bridge/STUDIO-zh.md">体验双 Loop →</a>
</td>
<td width="50%" valign="top">
  <img src="docs/assets/readme/components.svg" width="44" height="44" alt="" />
  <p><sub>COMPONENTS</sub><br /><strong>让能力成为组件</strong></p>
  <p>独立 worker 管理组件发现、调用、生命周期与权限，通过运行时配置组合能力。</p>
  <a href="bridge/README.md">了解组件运行时 →</a>
</td>
</tr>
<tr>
<td width="50%" valign="top">
  <img src="docs/assets/readme/memory.svg" width="44" height="44" alt="" />
  <p><sub>MEMORY</sub><br /><strong>让上下文延续</strong></p>
  <p>共享知识图谱，自动捕获与召回记忆，让任务接续已记录的项目约定和偏好。</p>
  <a href="bridge/STUDIO-zh.md">探索共享记忆 →</a>
</td>
<td width="50%" valign="top">
  <img src="docs/assets/readme/studio.svg" width="44" height="44" alt="" />
  <p><sub>STUDIO</sub><br /><strong>在一个界面工作</strong></p>
  <p>工具与生态目录、Loop 切换、活动时间线集中呈现，DSH Web 也可显示同一 Studio。</p>
  <a href="bridge/STUDIO-zh.md">打开 Studio 手册 →</a>
</td>
</tr>
</table>

<details>
<summary><strong>架构与当前边界</strong> · Gateway / Host / 可选 DSH</summary>

[目标架构](DESIGN-zh.md) 将 Cordis 对 OpenClaw 的增强扩展为不依赖 DSH 也能运行的模式。0.6.4 已采用 **Gateway 与 CoNest Host 两个常驻应用进程**，DSH Agent / Session 已迁入 Host；Management、Runtime 与可选 DSH 组合共享 Host。

办公服务示例演示可复用 Cordis 服务及单次调用的依赖图版本一致性。`--core` 可关闭 DSH；独立 Core / DSH 发行包、完整插件贡献模型仍为后续工作。

</details>

<a name="快速开始"></a>

## <img src="docs/assets/readme/start.svg" width="28" height="28" alt="" /> 快速开始


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

默认采用**本地模型 fixture**：Gateway、DSH Loop、工具和持久化实际执行，不调用付费模型。真实模型接入和插件安装见 [Studio 手册](bridge/STUDIO-zh.md) 与 [插件说明](bridge/README.md)。

<a name="分支与能力"></a>

## <img src="docs/assets/readme/branches.svg" width="28" height="28" alt="" /> 分支与能力

按需要选择稳定基线或开发线；下表展示两条分支的实现差异。

| 能力 | <img src="docs/assets/readme/stable.svg" width="148" height="30" alt="main · 0.6.2" /><br /><sub>稳定基线</sub> | <img src="docs/assets/readme/develop.svg" width="172" height="30" alt="develop · 0.6.4" /><br /><sub>当前开发线</sub> |
| :--- | :--- | :--- |
| **双 Loop 与 Studio** | ✓ 已接入 | ✓ 已接入 |
| **DSH Agent / Session** | Gateway 内 | **CoNest Host 内** |
| **OpenClaw 无 DSH 模式** | — | `--core` 办公组件演示 |
| **共享记忆** | Gateway 内提供 | 独立 `dsh-memory` 组件 |
| **工作区搜索** | `knowledge_search` / 验证能力 | 进一步接入 `dsh_grep`、`dsh_glob` |
| **文本读取** | Gateway 内提供 | 独立 `dsh-read`，保留读后写校验 |
| **DSH 动态组件入口** | 尚未接入 | 宿主最终工具准入 + 组件 worker |
| **干净克隆与构建** | ✓ 已验证 | ✓ 已验证 |

<sub>当前浏览的是 <strong>develop</strong>。<code>v0.6.2</code> 保留最初备份；分支维护与安装包发布独立进行。</sub>

## <img src="docs/assets/readme/docs.svg" width="28" height="28" alt="" /> 从这里继续

| | 入口 | 你可以在这里… |
| :---: | :--- | :--- |
| <img src="docs/assets/readme/contribute.svg" width="24" height="24" alt="" /> | **[贡献指南](CONTRIBUTING-zh.md)** | 修改代码、运行完整检查、提交 PR |
| <img src="docs/assets/readme/package.svg" width="24" height="24" alt="" /> | **[依赖来源与复现](maintenance/DEPENDENCIES-zh.md)** | 核对 SDK 校验、补丁与第三方许可证 |
| <img src="docs/assets/readme/components.svg" width="24" height="24" alt="" /> | **[插件 README](bridge/README.md)** | 配置插件与管理运行时组件 |
| <img src="docs/assets/readme/studio.svg" width="24" height="24" alt="" /> | **[Studio 手册](bridge/STUDIO-zh.md)** | 体验双 Loop、工具目录与共享记忆 |
| <img src="docs/assets/readme/lock.svg" width="24" height="24" alt="" /> | **[授权模型](bridge/AUTHORIZATION.md)** | 理解权限与调用边界 |
| <img src="docs/assets/readme/archive.svg" width="24" height="24" alt="" /> | **[源码来源](maintenance/IMPORT-zh.md)** | 查看当前分支的导入依据 |

<details>
<summary>仓库内容与历史交付资料</summary>

Git 中维护源码、测试、文档和构建配置。历史交付包、原始验收报告和个人运行数据不在仓库内；旧教程中的本地 `releases/`、`reports/` 链接需要对应交付资料。

</details>

<br />

---

<div align="center">

<img src="docs/assets/brand/conest-avatar.svg" width="64" height="64" alt="CoNest" />

**Build together, one capability at a time.**

从一个组件、一条反馈或一次 PR 开始。

[参与共建 →](CONTRIBUTING-zh.md) &nbsp;·&nbsp; [反馈问题 →](https://github.com/zyw02/CoNest/issues)

<sub>OpenClaw + DSH + Cordis &nbsp; / &nbsp; CoNest</sub>

</div>
