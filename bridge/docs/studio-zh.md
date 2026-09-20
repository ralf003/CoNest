# Studio 开发与集成验证

Studio 提供工具与组件目录、任务轨迹和共享记忆的调试入口。OpenClaw 与 DSH 是当前集成对象；目录中可发现的插件不等于已经完成执行适配。

## 从源码启动

先按 [开发指南](../README.md) 安装依赖并构建。在仓库根目录执行：

```bash
CONEST_DEMO_STATE=/absolute/disposable/conest-studio \
  pnpm --dir bridge exec node scripts/demo-studio.mjs
```

使用独立状态目录；启动器会创建测试工作区、Gateway 配置和记忆文件。`CONEST_DEMO_PORT` 覆盖默认端口 18791。连接地址及含 Gateway token 的 `connection.json` 路径由启动器输出。状态和凭据文件不提交到 Git。

默认模型决策来自本地 fixture，Gateway、工具和持久化实际执行。自动检查加 `--verify`，结束后查看状态目录中的 `acceptance.json`。这验证集成路径，不代表真实模型推理质量。

## 插件配置

在开发用 Gateway 中配置 `plugins.entries.dsh-bridge.config.workspaceRoot` 和 `studio.stateDir` 为绝对路径，并开启 `hooks.allowConversationAccess`。从 Control UI 的 CoNest Studio 标签或 `/plugins/conest-studio` 进入。

DSH 执行需要模型配置的 `agentRuntime.id` 为 `dsh`；OpenClaw 执行使用显式 `openclaw` runtime。模型及工具必须通过宿主准入，以活动轨迹中的实际执行器为准。完整配置项见 [插件清单](../openclaw.plugin.json) 和 [组件配置](components.md)。

可选真实模型测试需设置 `CONEST_CREDENTIAL_FILE=/absolute/private/deepseek.env` 并加 `--live`；凭据文件包含 `DEEPSEEK_API_KEY`，仅当前用户可读。此选项产生 API 费用，每次启动最多 12 次模型请求。

## 开发入口

- [Studio 源码](../src/studio)：界面、目录、任务轨迹、执行器与 Host 连接。
- [启动与集成检查](../scripts/demo-studio.mjs)：本地 fixture 和端到端断言。
- [DSH Web companion](../companions/dsh-ui/README.md)：在 DSH Web 中连接同一 Studio。

当前面向受信任的单用户开发环境。宿主沙箱会话不接受 DSH harness；工具仍受当前会话授权限制。

开发版还支持 `--verify --core` 检查不启动 DSH 的 OpenClaw 路径；`node bridge/scripts/demo-components.mjs` 验证办公组件依赖图。DSH Agent/Session 位于 CoNest Host；`--core` 不表示发行包已移除 DSH 依赖。
