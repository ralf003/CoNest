# 一起构建 CoNest

欢迎通过 Issue 讨论问题与设计，通过 Pull Request 提交改进。日常开发面向 `develop`；`main` 接收通过验收的稳定变更。

## 五步开始

1. Fork 仓库，从 `develop` 创建 `feature/简短名称` 或 `fix/简短名称`。
2. 准备 Node.js 24.15.0、pnpm 11.7.0、Git 和 tar；原生编译需要 Python 3、make 和 C++ 编译器。
3. 在仓库根目录恢复固定依赖并构建：

```bash
node maintenance/bootstrap.mjs
pnpm --dir bridge install --frozen-lockfile
pnpm --dir bridge run build
pnpm --dir bridge exec tsx --test 'test/*.test.ts'
```

4. 按影响范围运行相关集成验收，更新说明。
5. 向 `develop` 提交 PR，写明触发场景、行为变化和实际运行的验证。

原开发机的 `.runtime`、`.tooling`、`source/workspace` 均不是必要前提。依赖来源、校验和 node-pty 补丁见 [DEPENDENCIES.md](maintenance/DEPENDENCIES.md)。不要将下载的 `.vendor`、`node_modules` 或状态文件提交到 Git。

## 选择验证

| 变更范围 | 建议验证 |
|---|---|
| 文档、仓库配置 | `python3 maintenance/check-repository.py`，检查链接与实际命令 |
| 插件、worker 或组件行为 | 构建与完整测试；必要时增加有针对性的行为测试 |
| Studio、Loop 或工具准入 | 在独立状态目录运行 Studio / 双 Loop 验收 |
| 依赖或 SDK | 两个分支都从干净克隆恢复、安装、构建和测试 |

```bash
# 两个分支都有的 Studio 四段验收，使用本地模型 fixture。
CONEST_DEMO_STATE=/absolute/disposable/conest-check \
  pnpm --dir bridge exec node scripts/demo-studio.mjs --verify

# develop 的记忆组件迁移验收；main 不包含该开发增量。
CONEST_REPORT_PROFILE=local-check \
  pnpm --dir bridge exec node scripts/test-e2e.mjs --dsh-loop --memory-migration
```

默认验收实际运行 Gateway、Loop、worker 和工具，但模型决策来自本地 fixture。真实模型验证需要单独配置凭据，不在 CI 中自动调用付费模型。提交证据前删除 token、个人任务内容和运行数据。

## 分支与发布

```text
feature/* 或 fix/* → develop → 验收与 PR → main → 版本标签
```

`main` 以 0.6.2 稳定代码为起点，`develop` 为 0.6.3 开发线。两个分支的依赖恢复与协作流程共同维护，功能版本保持各自边界。原始 `v0.6.2` 标签固定备份，不因维护说明或构建改进而移动。

检查另一分支时使用独立 clone 或 `git worktree`，避免切换正在运行的开发代码。新安装包通过 Releases 分发；发布前核对版本、依赖来源、平台资产和相应验收。SDK Release 是开发依赖，不是 CoNest 插件安装包。

## 项目布局

```text
bridge/src/          插件、组件运行时与 Studio
bridge/test/         行为测试
bridge/scripts/      构建、集成验证与打包
bridge/docs/         配置、架构与平台说明
bridge/patches/      明确记录的依赖补丁
maintenance/         SDK 获取、来源、仓库检查
.vendor/             Bootstrap 的下载结果（不提交）
```
