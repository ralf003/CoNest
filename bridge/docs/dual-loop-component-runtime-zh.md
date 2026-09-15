# 双 Loop 接入同一组件运行时

后续增量：[搜索服务组件化](search-component-zh.md)已将 `dsh_grep`、`dsh_glob` 接入受管理搜索服务。本文保留第一阶段的设计与验收范围。

日期：2026-09-14。范围：0.6.3 开发工作区的第一阶段改进；既有发布包与平台验收记录保持原样。本阶段接通调用与治理，后续服务迁移单独推进。

## 1. 本次解决的问题

此前 DSH Harness 从宿主工具表中排除了四个组件工具。OpenClaw Loop 可以调用受管理组件，DSH Loop 则只能使用另外装配的 DSH 工具和其余获准的宿主工具。

本次让两个 Loop 经由宿主工具表调用同一个 CoNest worker：`bridge_capabilities` 发现已就绪且获授权的能力，`bridge_invoke` 按目录 generation 调用；`knowledge_search`、`knowledge_verify` 继续作为已有便捷入口。新组件仍由组件管理器安装，普通组件调用不启动另一 Agent Loop。

Studio 的 DSH Agent/Loop 组合继续运行在 Gateway 内。它现在能调用 worker 中的组件，原有 `dsh_*` 工具和 MCP 记忆仍由原组合提供；二者的执行实例尚未合并。

## 2. 授权与任务生命周期

DSH Harness 使用 OpenClaw 2026.9.2 的公开 `createToolSurface` 创建带当前会话、agent、运行身份和取消信号的真实宿主工具接口。普通提示词 hooks 运行后，对宿主工具表、运行允许集合、hook 允许集合和安全拒绝集合取交集；`disableTools` 得到空集合，递归委派入口继续排除。

通过公开提示词构建接口的 builder 在授权 hooks 执行前完成上述筛选，再传入宿主提供的 `toolAuthorityFingerprint`、最终工具名称和运行有效性检查。已有 HostAdapter 因此能取得真正的最终工具准入快照。普通提示词和自动记忆 hooks 只运行一次。

这一步仍要求 `hooks.allowConversationAccess: true`。缺少有效宿主授权时，组件主任务调用按既有规则拒绝执行，不生成替代授权，不以 operator 身份降级调用。

每次工具执行使用宿主已有的 before-tool 包装层建立调用与 requester 的绑定，完成后转发 after-tool hook。worker 沿用一次性授权、工作区和能力权限校验，组件嵌套调用沿用原依赖图。授权信息不从模型参数中读取。

工具代理合并当前 attempt、宿主和工具自身的取消信号，并在执行前和返回结果前检查宿主仍然有效。成功、失败或取消退出都会撤销该 attempt 的工具代理并清理所属 run 的组件调用资格。保留旧工具对象不能在任务结束后继续执行。

会话重置验证还发现并修复了 DSH 仅按可复用 session key 缓存历史的问题。OpenClaw 2026.9.2 重置时可保留 session ID、更新 `lifecycleRevision`。现在通过公开 session-store API 读取该版本，DSH 绑定同时包含 session ID、agent 和生命周期版本；同一生命周期可继续复用，重置后的回合改用新绑定并释放旧 handle。没有可验证版本时，仅使用本次 attempt 的独立绑定。

终止会话的 `session_end` 释放对应 handle；保留同一 ID 的重置事件交由新回合按版本清理，防止延迟事件误释放新实例。旧版仅凭 session key 保存的 DSH 历史无法确认所属生命周期，本开发增量不自动复用这些记录；原文件、OpenClaw 历史和共享记忆不删除。

组件版本切换继续按已接纳的能力调用固定依赖图；不是把整个多轮 Agent 任务固定在同一个组件版本。新调用携带过期 generation 时须重新发现。已接受的组件升级允许旧调用完成，权限变更则撤销活动调用。

## 3. 使用方式

已有 Studio 配置下，在宿主的工具准入配置中允许需要的组件工具，并保持组件配置、权限和 hooks 授权。例如可允许 `bridge_capabilities`、`bridge_invoke`、`knowledge_search` 和 `knowledge_verify`，再通过现有 CLI 安装组件。全局、agent、provider 与 worker 规则仍会进一步限制实际可用集合。

开发版演示启动器已加入这四个工具的准入。现有安装或已启动的演示不会因源码变化自动更新；需使用更新后的构建并重新启动相应测试配置。

## 4. 验证方法与证据

模型使用本地确定性决策服务，实际执行使用未经修改的 OpenClaw Gateway、DSH Agent Loop、宿主工具与 CoNest worker。测试不调用外部模型。测试夹具的控制文件仅用于观察调用进入、释放与取消，位于测试自己的目录，不作为发布能力。

```sh
pnpm run typecheck
pnpm test
CONEST_REPORT_PROFILE=dual-loop-components-runtime node scripts/test-runtime.mjs
CONEST_REPORT_PROFILE=dual-loop-components-openclaw node scripts/test-e2e.mjs
CONEST_REPORT_PROFILE=dual-loop-components-dsh node scripts/test-e2e.mjs --dsh-loop --capability-guidance --component-lifecycle
CONEST_REPORT_PROFILE=dual-loop-components-context node scripts/test-e2e.mjs --dsh-loop --capability-guidance --context-provider
pnpm run test:studio
```

双 Loop 专项在同一个 Gateway 和同一个组件 worker 中执行：动态发现和嵌套验证、运行中升级与新旧版本并存、真实宿主取消、活动调用撤权、拒绝后不进入组件、禁用/启用与卸载。每次任务核对宿主返回的实际 `agentHarnessId`，而非只检查配置选择。

结果及本次构建的摘要见 [验收记录](../reports/dual-loop-components/RESULT.md)。开发工作区测试不代表旧的 0.6.3 多平台候选包包含此变更，也不扩展原生 Windows 的验收范围。

## 5. 后续阶段

1. **迁移重复工具服务。** 优先搜索和只读文件访问；逐项保留参数语义、将旧名称映射到受管理能力，并统一别名授权。不能直接把功能较窄的 `knowledge_search` 当作完整 `dsh_grep` 的替代。
2. **独立共享记忆服务。** 将 MCP 连接、持久化和主体校验从 Studio 组合中移出，让两种 Loop 的 hooks、显式工具和页面查询使用同一受管理服务；补充独立的记忆读写权限。
3. **纳管 DSH 执行器。** 将剩余 Agent、Loop、模型适配与会话服务整理成声明式执行器配置，提供任务启动、流式事件、审批、取消和结束接口。进程外部署需另外验证宿主工具回调和模型通道。

组件纳管与进程位置分别推进。本阶段没有把整套 DSH 组合移动到 worker，也没有让任意市场插件自动获得执行兼容性。
