# develop 导入来源

此分支从 main 的 0.6.2 基线派生，导入 2026-09-15 整理时的 0.6.3 开发源码。原文件内容清单及与基线的差异见 [import.json](import.json)。该清单记录首次导入来源，后续正常维护无需将它作为逐提交锁文件更新。

已包含多平台开发增量、双 Loop 组件运行时接入、搜索组件、文本读取组件与共享记忆组件。搜索、读取和记忆由 worker 管理；Loop、文件写入/编辑、图片与 Bash 仍在 Gateway。

最近一次记忆迁移验收：98 项测试、13 个双 Loop 记忆场景、Studio 四段演示通过，Linux x64 / Node 24.15 / glibc 2.39 平台探针通过。模型决策使用本地 fixture，未调用付费模型。此结果来自导入前的开发验收，不表示 GitHub CI 已跑过完整运行时测试。

原始验收记录保留在开发工作区的 `bridge/reports/memory-migration/` 和 `bridge/reports/memory-migration-e2e/`；Git 中不收录会话、记忆与日志。构建产物和旧版交付包仍保留在原位置。
