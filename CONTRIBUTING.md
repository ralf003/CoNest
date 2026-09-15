# 维护 CoNest

## 分支

- `main`：以备份中的 0.6.2 为起点，接收已验证的修复和稳定版本。
- `develop`：当前开发分支。功能分支从 `develop` 创建，完成构建与相应验证后通过 PR 合入。
- 发布前通过 `develop → main` 的 PR 审核变更、验证证据和版本；不要将未经验证的候选版标为稳定版。
- 现有开发服务器默认停留在 `develop`。需要检查 `main` 时使用另一个 clone 或 `git worktree`，避免切换正在运行的开发代码。

## 恢复开发依赖

当前代码和锁文件保留原有工作区路径；本次导入没有改写依赖版本或替换 DSH 实现。需要恢复以下布局：

```text
CoNest/
  bridge/                              # 本仓库
  source/workspace/deepseek-harness/    # 配套冻结源码及已构建 lib
  source/workspace/openclaw-cordis-bridge-demo/
  .runtime/node_modules/openclaw/       # 官方 OpenClaw 2026.9.2
  .tooling/node_modules/.bin/           # 可选：配套 Node / pnpm
```

`package.json` 的所有 `link:` 引用都必须存在，包括指向冻结工作区 `node_modules` 的依赖。Node 版本为 24.15.0，pnpm 为 11.7.0。冻结快照没有可确认的远端提交号，不能用上游最新源码代替并声称复现原验收。相关工作区及安装包由项目所有者保留，尚未作为此仓库的 Release 附件上传。

在原开发机这些路径已经就绪。另一台机器恢复配套工作区后执行：

```bash
python3 maintenance/check-dependencies.py
pnpm --dir bridge install --frozen-lockfile
pnpm --dir bridge run build
pnpm --dir bridge exec tsx --test 'test/*.test.ts'
```

没有上述冻结依赖时，仅可运行仓库检查：

```bash
python3 maintenance/check-repository.py
```

## 验证与发布

完整构建与测试遵循 [插件开发说明](bridge/README.md)。`develop` 中可按变更范围选择以下验证；0.6.2 不包含后来新增的迁移参数。

```bash
CONEST_REPORT_PROFILE=local-check pnpm --dir bridge exec node scripts/test-e2e.mjs --dsh-loop --memory-migration
CONEST_DEMO_STATE=/absolute/disposable/studio-check pnpm --dir bridge exec node scripts/demo-studio.mjs --verify
```

默认验收使用本地模型 fixture，Gateway、Loop、worker 和工具实际运行。真实模型测试需单独配置凭据；不在 GitHub CI 中自动调用付费模型。

GitHub Actions 仅运行无需冻结依赖的仓库检查，不能代替构建、平台或真实模型验收。`bridge/.github/` 保留的历史平台工作流模板不在根目录自动启用，因为它依赖另行提供的候选安装包。

提交源码、必要测试和说明。安装包通过 GitHub Releases 分发，验收记录发布前去除 token、私有任务内容和用户数据。不要把整个原开发工作区或 `node_modules` 加入 Git。
