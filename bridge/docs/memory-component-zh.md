# 共享记忆服务组件化

2026-09-14，CoNest 0.6.3 开发增量。接续[只读文件服务组件化](read-component-zh.md)。本阶段修改开发源码及构建产物，既有安装包与实际用户 Gateway 未替换。

## 运行边界

`dsh-memory@0.1.0` 现在是 CoNest worker 中可独立停用、启用和检查状态的内置组件。组件通过原生 DSH MCP Client 启动原有 MCP Memory Server；九个 `dsh_mcp__reference_memory__*` 工具保留名称、参数、原生文本和值。

OpenClaw Loop 与 DSH Loop 都使用宿主最终准入的工具表，经 Connector、一次性调用授权和 worker 能力注册表访问记忆。Gateway 内的 DSH composition 不再启动 MCP Memory Client，也不保留本地记忆工具备用入口。Gateway 仍持有 Loop、写入/编辑、图片和 Bash。搜索、文本读取、共享记忆已归 worker 管理。

Studio 的自动召回、自动捕获和已认证的记忆页面查询调用 `memory_recall` / `memory_remember` 服务能力。自动服务不依赖模型是否调用工具；这两个服务能力从模型的通用发现/调用入口中排除，防止其成为绕过显式工具准入的替代入口。

## 数据与权限

| 对象 | 归属与准入 |
|---|---|
| 原有共享知识图谱 | 保留同一个 JSONL 文件；获准的九个图谱工具可访问整个共享图谱。它不是多租户私有数据库。 |
| 自动记忆 | worker 根据已验证的 Agent 和完整 requester 身份计算旧版 `openclaw_auto_memory_v1:conest:<digest>` 实体名，模型不能指定归属实体。无 requester 的本地会话使用 Agent 归属。 |
| 图谱读取、自动召回 | 需要 `memory:read`，同时受能力策略限制。 |
| 图谱修改、自动捕获 | 需要 `memory:write`，同时受能力策略限制。自动捕获仍仅接受有明确记忆意图、长度受限且通过现有内容筛选的文本。 |
| 显式模型工具 | 额外服从 OpenClaw 最终工具准入及当前配置的负向约束，不能通过 `bridge_invoke` 绕过原生工具拒绝。 |
| Studio 自动服务 | 配置 Studio 即启用既有自动服务行为；worker 的权限上限及 `capabilityPolicy` 可关闭读或写。显式图谱工具的 allowlist 与自动服务的开关分别管理。 |
| 隐私会话 | 自动读写跳过；显式记忆工具不提供；通用调用不授予记忆权限并拒绝记忆能力。Studio 记忆和工具活动 hooks 不记录该会话。 |
| Studio 页面 | 先验证请求携带的 Gateway token；以受信任 operator 策略读取默认 main Agent 的自动记忆，不代表所有用户记忆汇总。 |

只迁移服务所有权，不改写旧数据。未提供 runtime `memoryFilePath` 时，Studio 将 `${studio.stateDir}/memory.jsonl` 作为 worker 启动绑定。组件管理和配置重载保留该绑定，不自动写进配置文件。显式 runtime `memoryFilePath` 优先；没有 Studio 且没有该字段时，记忆组件默认停用。

例如独立 runtime 配置：

```json
{
  "workspaceRoot": "/absolute/workspace",
  "memoryFilePath": "/absolute/private-state/memory.jsonl",
  "permissions": ["workspace:read", "memory:read", "memory:write"]
}
```

省略 `permissions` 时，有记忆路径才默认加入两项记忆权限；已有显式权限数组保持其限制。仅召回可保留 `memory:read` 并删除 `memory:write`。更换数据路径需要重启 worker；不允许通过组件 `config.file` 切换文件。

## 生命周期与故障

同一个规范化文件在 worker 内只有一个 MCP 后端和一个串行操作队列。原生工具操作与自动记忆的“读取—创建/追加”完整事务共用队列，组件世代之间共享后端引用。文件旁的所有权锁拒绝第二个 worker 同时打开文件。

取消调用及时返回；已经提交的操作继续占有队列直到 MCP 应答，未提交的操作检查取消状态后停止。不自动重放写入，也不宣称取消能回滚已提交数据。原生调用报错时，该后端停止接受新操作；检查数据后停用并重新启用组件可重建连接。此处保守处理普通原生错误与无法确定是否提交的传输错误，避免错误重试产生二次修改。

自动服务每次调用最多等待 2 秒，服务停止时取消等待。自动召回/捕获不可用时记录 `unavailable` 并让主任务继续；显式工具返回错误。Studio 页面返回空列表并标注 `memoryUnavailable`。停用组件保留文件，重新启用读取原记录。worker 意外退出时，MCP 子进程随 stdin 关闭退出；恢复后不会重放中断请求。

仍使用原生 Memory Server 的 JSONL 写文件实现，未增加文件替换事务或崩溃恢复日志。因此并发覆盖得到控制，但不承诺机器断电时的原子持久化。存储损坏时返回失败并保留原字节，不覆盖为空图谱。权限声明约束能力调用，受信任组件 JavaScript 仍具有 worker OS 账户权限。

## 验证

本地模型 fixture 驱动真实 OpenClaw Gateway、DSH/OpenClaw 两种 Loop、worker 和 MCP Server；未调用付费模型。验证旧格式和九个工具、并发与去重、身份归属、权限拆分、隐私入口、取消、worker 故障恢复、组件停用恢复及自动服务降级。完整结果见阶段验收。
