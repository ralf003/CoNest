<div align="center">

<picture>
  <source media="(max-width: 600px) and (prefers-color-scheme: dark)" srcset="docs/assets/conest-banner-zh-mobile-dark.svg" />
  <source media="(max-width: 600px)" srcset="docs/assets/conest-banner-zh-mobile.svg" />
  <source media="(prefers-color-scheme: dark)" srcset="docs/assets/conest-banner-zh-dark.svg" />
  <img src="docs/assets/conest-banner-zh.svg" alt="CoNest — Agent 的万物互联。连接智能体、工具、记忆与服务。" width="100%" />
</picture>

[English](README.md) &nbsp; / &nbsp; **简体中文**

[![Build](https://img.shields.io/github/actions/workflow/status/zyw02/CoNest/repository.yml?branch=develop&style=flat-square&logo=github&label=build&labelColor=252638&color=65b9a2)](https://github.com/zyw02/CoNest/actions/workflows/repository.yml) [![Node 24.15](https://img.shields.io/badge/Node-24.15-65b9a2?style=flat-square&logo=nodedotjs&logoColor=white&labelColor=252638)](https://nodejs.org/) [![pnpm 11.7](https://img.shields.io/badge/pnpm-11.7-e8b86d?style=flat-square&logo=pnpm&logoColor=white&labelColor=252638)](https://pnpm.io/) [![PRs welcome](https://img.shields.io/badge/PRs-welcome-a392eb?style=flat-square&labelColor=252638)](CONTRIBUTING.md)

<br />

<a href="#快速开始"><strong>快速开始</strong></a> &nbsp;·&nbsp; <a href="#快速开始"><strong>Studio</strong></a> &nbsp;·&nbsp; <a href="#分支与能力"><strong>分支与能力</strong></a> &nbsp;·&nbsp; <a href="CONTRIBUTING.md"><strong>参与共建</strong></a> &nbsp;·&nbsp; <a href="https://github.com/zyw02/CoNest/issues"><strong>Issues</strong></a>

</div>

<br />

**CoNest 正在构建面向 Agent 的互联与协作基础设施。** 我们希望连接不同框架、不同运行环境中的 Agent，让工具、记忆、服务与工作流能够被发现、调用和组合，让各自独立的能力共同完成任务。

**当前实现：** 从 OpenClaw 与 DeepSeek Harness（DSH）的接入起步，以 Cordis 组件运行时提供能力组合、工具互用和共享记忆，Studio 展示接入能力与执行记录。更多 Agent 的接入和跨运行环境协作，是项目继续建设的方向。

> [!TIP]
> **探索 0.6.4** — Gateway 与 CoNest Host 双进程、办公组件组合，以及 `--core` 无 DSH 演示。

## 让能力彼此相连

- **[连接 Agent](bridge/README.md)** — 面向不同框架和运行环境扩展接入。当前以 OpenClaw 与 DSH 验证执行接入和工具互用。

- **[组合工具与服务](bridge/README.md)** — 将能力组织成可复用组件，由运行时管理依赖、调用与生命周期，让服务彼此协作。

- **[让知识持续积累](#快速开始)** — 通过共享知识图谱捕获和召回记忆，让不同任务接续已记录的知识、约定与经验。

- **[观察能力如何运行](#快速开始)** — 在 Studio 查看工具与组件目录、执行结果和活动时间线。

<details>
<summary><strong>架构与当前边界</strong> · Gateway / Host / 可选 DSH</summary>

0.6.4 已采用 **Gateway 与 CoNest Host 两个常驻应用进程**，DSH Agent / Session 已迁入 Host；Management、Runtime 与可选 DSH 组合共享 Host。

办公服务示例演示可复用 Cordis 服务及单次调用的依赖图版本一致性。`--core` 可关闭 DSH；独立 Core / DSH 发行包、完整插件贡献模型仍为后续工作。

</details>

<a name="快速开始"></a>

## 快速开始

**第一次使用，只需按本节操作。** 已验证的源码启动环境为 Linux x64、Node.js 24.15.0 和 pnpm 11.7.0；还需 Git、tar，以及原生编译所需的 Python 3、make 和 C++ 编译器。

```bash
git clone --branch develop https://github.com/zyw02/CoNest.git
cd CoNest
node maintenance/bootstrap.mjs
pnpm --dir bridge install --frozen-lockfile
pnpm --dir bridge run build
CONEST_DEMO_STATE="$HOME/.local/state/conest-dev" \
  pnpm --dir bridge exec node scripts/demo-studio.mjs
```

打开终端输出的 Studio 地址，在连接设置中输入同次输出所指向的 `connection.json` 中的 Gateway token。默认端口为 18791，可用 `CONEST_DEMO_PORT` 覆盖；本地启动用 Ctrl+C 停止。上面的专用目录存放测试工作区、配置与记忆，不要指向客户工作区，也不要上传其中的文件。

默认使用本地模型 fixture，无需 API Key；Gateway、工具和记忆持久化实际执行。自动验证时在最后一条命令追加 `--verify`，检查结束后进程退出。真实模型需设置 `CONEST_CREDENTIAL_FILE` 指向包含 `DEEPSEEK_API_KEY` 且仅当前用户可读的凭据文件，并追加 `--live`；这会产生 API 费用。

如果启动失败，先核对 Node/pnpm 版本、端口与终端报错。SDK 下载问题见 [依赖维护说明（英文）](maintenance/DEPENDENCIES.md)；已有 Gateway 的插件配置见 [宿主接入（英文）](bridge/docs/host-integration.md#plugin-configuration)。仍无法解决时，用 [Question 表单](https://github.com/zyw02/CoNest/issues/new?template=question.yml) 提供版本、命令和脱敏错误。

<a name="分支与能力"></a>

## 分支与能力

`main` 为稳定基线，`develop` 为开发线。两条分支均已接入 OpenClaw / DSH 与 Studio，并验证干净克隆后的依赖恢复和构建。下表只列实现差异；更多 Agent 与运行环境将随适配能力逐步扩展。

| 能力 | <a href="https://github.com/zyw02/CoNest/tree/main"><picture><source media="(prefers-color-scheme: dark)" srcset="docs/assets/readme/git-branch-dark.svg" /><img src="docs/assets/readme/git-branch.svg" width="16" height="16" align="absmiddle" alt="" /></picture> <code>main</code></a> · 0.6.2 | <a href="https://github.com/zyw02/CoNest/tree/develop"><picture><source media="(prefers-color-scheme: dark)" srcset="docs/assets/readme/git-branch-dark.svg" /><img src="docs/assets/readme/git-branch.svg" width="16" height="16" align="absmiddle" alt="" /></picture> <code>develop</code></a> · 0.6.4 |
| :--- | :--- | :--- |
| DSH 执行位置 | Gateway | CoNest Host |
| 无 DSH 模式 | — | `--core` 办公组件演示 |
| 共享记忆 | Gateway 内提供 | `dsh-memory` 组件 |
| 工作区搜索 | `knowledge_search` 与验证能力 | 另接入 `dsh_grep` / `dsh_glob` |
| 文本读取 | Gateway 内提供 | `dsh-read`，保留读后写校验 |
| DSH 动态组件 | 尚未接入 | Host 工具准入与组件 worker |

<sub>当前浏览的是 <strong>develop</strong>。<code>v0.6.2</code> 保留最初备份；分支维护与安装包发布独立进行。</sub>

## 该看哪份文档？

- **运行项目：** 本页的 [快速开始](#快速开始)，或 [英文 README](README.md)。
- **报告问题、提交 PR：** [CONTRIBUTING](CONTRIBUTING.md)，统一的英文协作规范。
- **修改内部实现：** [开发参考索引](bridge/README.md)，按组件、宿主接入或打包任务选择阅读。

<br />

---

<div align="center">

<img src="docs/assets/brand/conest-avatar.svg" width="64" height="64" alt="CoNest" />

**一起构建 Agent 的互联世界。**

从一个组件、一条反馈或一次 PR 开始。

[参与共建 →](CONTRIBUTING.md) &nbsp;·&nbsp; [反馈问题 →](https://github.com/zyw02/CoNest/issues)

<sub>Agents · Tools · Memory · Services &nbsp; / &nbsp; CoNest</sub>

</div>
