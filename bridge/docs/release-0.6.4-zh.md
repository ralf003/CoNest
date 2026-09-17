# CoNest 0.6.4

本版把 DSH 执行器从 Gateway 迁入 CoNest Host，并提供一个不启动 DSH 的 OpenClaw 办公组件演示。版本范围以本文为准；旧版安装文档与验收记录保留各自原有版本范围。

## 交付内容

- Gateway 只保留 Connector 与 Studio；Management、Cordis 组件 Runtime、可选 DSH Agent/Session 同处 CoNest Host。协议版本升至 4，升级时应整体替换插件并重启 Gateway。
- 私有 stdio RPC 支持 Host 回调 Gateway 的获准工具、事件、审批与取消；回调绑定本次调用和实际子进程，结束后失效。
- 通用组件模块按需加载 DSH 实现。`--core` 演示关闭 DSH 内置组件、执行器、市场与共享记忆；组件验证通过 Node 模块加载钩子主动拒绝 DSH 依赖。
- `office-knowledge` 提供知识规则服务，`office-check` 和 `office-context` 注入该服务。配置变更、失败候选、停用/恢复均有实际运行验证。
- Windows x64 安装器、默认无 API Key 演示、组件验证入口，以及原生 Windows CI 工作流。

## 验证方式

Linux 本地：99 项自动化测试通过；完整双 Loop、双方工具、共享记忆、办公组件场景通过；无 DSH OpenClaw 场景和组件依赖图演示通过。模型响应为确定性 fixture，未执行付费模型测试。

Windows：由 [Windows demo acceptance](https://github.com/zyw02/CoNest/actions/workflows/windows-demo.yml) 从源码构建目标包，在原生 Windows Server 2025 runner 安装并运行。须以对应提交的实际运行结果为准，不能仅依据工作流文件宣称通过。Windows 11 桌面验收尚需独立机器。

```bash
pnpm --dir bridge run build
pnpm --dir bridge exec tsx --test 'test/*.test.ts'
node bridge/scripts/demo-components.mjs --out bridge/reports/0.6.4/components.json
node bridge/scripts/demo-studio.mjs --verify
node bridge/scripts/demo-studio.mjs --verify --core
```

## 边界

版本一致性约束单次已接纳的组件调用，不覆盖整个 Agent 任务、数据库事务或外部操作撤销。DSH 固定组合与受管组件 Runtime 处于同一进程、不同 Context；固定组合尚未统一进入组件版本图。发行包仍包含 DSH 依赖，Core/Support Pack 尚未独立发布。完整生态插件安装、任意贡献类型、自动评估及自主发布均仍属后续目标。

[Windows 演示步骤](windows-0.6.4-zh.md) · [架构与后续目标](../../DESIGN-zh.md)
