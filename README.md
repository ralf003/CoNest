# CoNest

CoNest 是接入 OpenClaw 的插件，提供 DSH/Cordis 组件运行时、可选择的 OpenClaw / DSH Loop，以及 Studio 统一界面与共享记忆。

| 分支 | 维护用途 |
|---|---|
| [`main`](https://github.com/zyw02/CoNest/tree/main) | 0.6.2 稳定基线，来自多平台修改前校验通过的备份。 |
| [`night`](https://github.com/zyw02/CoNest/tree/night) | 当前 0.6.3 开发线，包含多平台适配、双 Loop 组件接入，以及搜索、文本读取、共享记忆组件化。 |

日常开发使用 `night`，通过 Pull Request 审核后再将已验收的变更合入 `main`。`night` 是本项目约定的分支名。

- [插件说明与配置](bridge/README.md)
- [Studio 使用说明](bridge/STUDIO.md)
- [维护、环境恢复与发布约定](CONTRIBUTING.md)
- [本分支来源及导入校验](maintenance/IMPORT.md)

## 仓库内容

`bridge/` 保存插件源码、测试、脚本、示例、教程和 DSH UI 配套插件。根目录的设计文档保留历史背景，当前行为以分支内代码及插件说明为准。

仓库不收录 `node_modules`、冻结的上游源码、构建目录、安装大包、凭据、会话、个人记忆或原始运行日志。此前交付包和验收原件仍保留在原备份中；文档内指向 `releases/` 或 `reports/` 的历史链接需要相应交付资料。

## 开发环境

现有代码使用固定工作区的 `link:` 依赖；单独克隆本仓库后直接 `pnpm install` 还不能恢复完整开发环境。需要配套的冻结 DSH 工作区及官方 OpenClaw 2026.9.2，具体见 [CONTRIBUTING.md](CONTRIBUTING.md)。仓库自动检查验证源码一致性与提交内容；完整构建和双 Loop 验收在恢复依赖的开发环境中运行。
