<div align="center">

[English](README.md) · **简体中文**

<img src="docs/assets/conest-banner.svg" alt="CoNest — Two loops. One workspace." width="100%" />

**两种 Agent Loop · 共享工具与记忆 · 一个组件运行时**

[![Build](https://github.com/zyw02/CoNest/actions/workflows/repository.yml/badge.svg?branch=develop)](https://github.com/zyw02/CoNest/actions/workflows/repository.yml)
[![OpenClaw](https://img.shields.io/badge/OpenClaw-2026.9.2-4388cc?style=flat-square)](https://www.npmjs.com/package/openclaw/v/2026.9.2)
![Node](https://img.shields.io/badge/Node-24.15-438b59?style=flat-square)
![pnpm](https://img.shields.io/badge/pnpm-11.7-f1ac38?style=flat-square)
[![Contributions](https://img.shields.io/badge/PRs-welcome-56bba0?style=flat-square)](CONTRIBUTING-zh.md)

[快速开始](#快速开始) · [分支与能力](#分支与能力) · [参与共建](CONTRIBUTING-zh.md) · [Studio](bridge/STUDIO-zh.md) · [讨论与问题](https://github.com/zyw02/CoNest/issues)

</div>

---

CoNest 是连接 **OpenClaw** 与 **DeepSeek Harness（DSH）** 的插件。你可以在同一工作台选择 Agent Loop、调用双方工具，并在不同 Loop 的任务间共享记忆。底层 Cordis 组件由 CoNest Runtime 管理，Studio 提供统一入口和执行记录。

[目标架构](DESIGN-zh.md) 将 Cordis 对 OpenClaw 的增强扩展为不依赖 DSH 也能运行的模式。默认采用 Gateway 与 CoNest Host 两个常驻应用进程；Management、Runtime 和可选 DSH 组合共享 Host。0.6.4 已落实双进程结构；完整插件贡献模型等仍为后续目标。

**0.6.4：** [Windows 安装与演示](bridge/docs/windows-0.6.4-zh.md) · [版本范围](bridge/docs/release-0.6.4-zh.md)。Gateway 与 CoNest Host 双进程已落地，DSH Agent/Session 已迁入 Host。新增办公服务组合与单次调用版本一致性演示；`--core` 可关闭 DSH。独立 Core/DSH 发行包仍待拆分。

<table>
<tr><td width="50%">

### ↔ 选择任务如何执行

在 OpenClaw 原生 Loop 与 DSH Loop 之间选择。Studio 展示实际执行结果，方便观察两种 Loop 的行为。

</td><td width="50%">

### ◈ 让能力成为组件

独立 worker 管理组件的发现、调用、生命周期和权限。通过配置管理能力，而不是将全部实现堆进 Gateway。

</td></tr>
<tr><td>

### ◎ 让上下文延续

共享知识图谱、自动记忆捕获与召回，让任务能使用已经记录的项目约定和偏好。

</td><td>

### ⌘ 在一个界面工作

Studio 汇集工具与生态目录、Loop 切换和活动时间线；DSH Web 配套插件可显示同一界面。

</td></tr>
</table>

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

> **SDK ≠ 本地运行环境。** 下载的是所需 DSH 源码、JavaScript 运行库和许可证，约 2.3 MB；不包含 Ubuntu 依赖、`node_modules`、会话或凭据。普通依赖来自 npm，SDK 和锁文件均固定版本。见 [依赖来源](maintenance/DEPENDENCIES-zh.md)。

完成构建后，用隔离状态目录运行四段 Studio 验收：

```bash
CONEST_DEMO_STATE=/absolute/disposable/conest-studio \
  pnpm --dir bridge exec node scripts/demo-studio.mjs --verify
```

默认采用**本地模型 fixture**：Gateway、DSH Loop、工具和持久化实际执行，不调用付费模型。真实模型接入和插件安装见 [Studio 手册](bridge/STUDIO-zh.md) 与 [插件说明](bridge/README.md)。

## 分支与能力

| | `main` · 0.6.2 稳定基线 | `develop` · 0.6.3 开发线 |
|---|---|---|
| OpenClaw / DSH 双 Loop、Studio | ✓ | ✓ |
| 共享记忆 | Gateway 内提供 | 独立 `dsh-memory` 组件 |
| 组件化工作区搜索 | `knowledge_search` / 验证能力 | 进一步接入 `dsh_grep`、`dsh_glob` |
| 文本读取 | Gateway 内提供 | 独立 `dsh-read`，保留读后写校验 |
| DSH Loop 动态组件入口 | 尚未接入 | 接入宿主最终工具准入与组件 worker |
| 干净克隆后的依赖恢复与构建 | ✓ | ✓ |

当前浏览的是 **develop**。`v0.6.2` 标签保留最初备份的原始代码，分支上的依赖与协作流程会继续维护；它不等于重新发布了一个安装包。

## 从这里继续

| 目标 | 入口 |
|---|---|
| 修改代码、运行完整检查、提 PR | [贡献指南](CONTRIBUTING-zh.md) |
| 了解 SDK 校验、补丁和第三方许可证 | [依赖来源与复现](maintenance/DEPENDENCIES-zh.md) |
| 配置插件、管理组件 | [插件 README](bridge/README.md) |
| 体验双 Loop 与共享记忆 | [Studio 手册](bridge/STUDIO-zh.md) |
| 理解权限与调用边界 | [授权模型](bridge/AUTHORIZATION.md) |
| 查看当前分支的导入依据 | [源码来源](maintenance/IMPORT-zh.md) |

Git 中维护源码、测试、文档和构建配置。历史交付包、原始验收报告和个人运行数据不在仓库内；旧教程中的本地 `releases/`、`reports/` 链接需要对应交付资料。

---

<div align="center">

**Build together, one capability at a time.**

新功能从 `develop` 出发 · 通过验证后合入 `main` · 用版本标签固定交付

</div>
