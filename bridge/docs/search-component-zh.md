# 搜索服务组件化

2026-09-14，CoNest 0.6.3 开发增量。接续[双 Loop 组件运行时接入](dual-loop-component-runtime-zh.md)，本次将 Studio 的搜索服务迁入已有组件 worker。既有发行包与冻结上游源码不变。

## 改动与执行边界

此前 `knowledge_search` 使用 worker 中的 DSH 搜索插件，而 Studio 的 `dsh_grep`、`dsh_glob` 使用 Gateway 内另装的一份插件。现在三个入口均由 `dsh-search@0.2.1` 提供，每个组件实例只装配一次 `ToolFsSearch`。正常运行使用当前组件实例；版本切换期间，已经获准的调用仍可持有旧实例，沿用既有代际机制。

| 入口 | 保留的语义 | 返回 |
|---|---|---|
| `knowledge_search` | `query` 为单行字面量，在整个授权工作区检索 | 原有 `query/matches/totalMatches/truncated/durationMs`；最多 100 条结构化匹配 |
| `dsh_grep` | `pattern` 为 ripgrep 正则，支持 `path` 与单个 `include` 文件筛选 | DSH 原生分文件、带行号文本，内联最多 250 条；结构化值保留完整匹配 |
| `dsh_glob` | `pattern` 为文件 glob，支持 `path` | DSH 原生路径文本，内联最多 100 条，按修改时间排序；保留完整结构化路径 |

两个 Loop 均经宿主最终准入后的工具执行器进入同一 Connector 调用通道，再通过授权令牌进入 worker。直接工具名与通用入口使用相同能力名，`bridge_invoke` 无法绕过该名称的拒绝规则。三个能力分别授权：只允许字面量搜索不会自动允许正则搜索；拒绝 `dsh_grep` 也不等于拒绝全部工作区读取。

Gateway 的固定组合已移除 `ToolFsSearch` 及其本地 `grep/glob` 工具描述。其启动校验仍严格比对剩余工具清单。DSH Loop 使用已授权的宿主 `dsh_grep/dsh_glob` 代理，无本地搜索回退。Bash 继续使用 Gateway 的 `LocalSubprocessRuntime`，因此该基础服务保留。文件工具、记忆服务和 Loop 本体仍在 Gateway。

## 路径与结果兼容

`path` 缺省为已授权的工作区；相对路径以该工作区为基准，绝对路径必须位于其中。worker 在执行前解析真实路径，拒绝 `..` 和符号链接导致的越界；递归搜索沿用原生 ripgrep 不跟随子目录符号链接的行为。原先 Studio 搜索可接受工作区外的显式路径，本次收紧到组件声明的 `workspace:read` 范围。

DSH 原生搜索需要工具所属工作区来生成可继续读取的相对路径。worker 为每次原生搜索建立一个不发布到 SessionStore 的临时 DSH Session/工具 owner，仅提供工作区信息；不缓存会话、不启动 Agent Loop、不调用模型。字面量入口保留原有来源路径表示。

直接 `dsh_*` 工具继续返回 DSH 文本及 `details.source/tool/value`，另附 `bridge: cordis-process` 与组件 generation。通用调用返回含 `content/value` 的 JSON 包络。内联截断由原生 DSH 实现；当前两种组合都未装载 spill 存储，超限时明确提示完整结果未保存，不声称存在可读取的结果文件。

跨进程请求受 Runtime 的 `maxPayloadBytes` 限制，默认 256,000 字节；响应固定限制为 2,000,000 字节。超大结果报错，需缩小搜索范围。路径检查不是针对恶意文件系统并发替换的内核沙箱，组件仍为受信代码。

## 生命周期与配置

- 停用 `dsh-search` 后，三个入口与依赖它的验证组件均不可用；保留的宿主工具名调用会得到明确错误。
- 重新启用后恢复三个能力，无需重新装配 Studio 或重启 Gateway。
- 宿主取消与运行中权限撤销沿用已有 run/call scope，信号传入真正的 ripgrep 子进程；完成后释放任务资源。
- 两个 DSH 搜索工具现在随核心 Connector 注册，无需开启 Studio；仍需 OpenClaw 工具策略与 Runtime 能力策略准入。现有显式 allowlist 如需使用它们，应加入 `dsh_grep`、`dsh_glob`。
- 内建搜索版本从 0.2.0 升为 0.2.1，保留既有 `^0.2.0` 依赖兼容。

验收命令与结果见[本次验证记录](../reports/search-migration/RESULT.md)。本次备份位于仓库 `backups/conest-before-search-migration-20260914/code.tar.gz`。使用更新后的开发构建需重启所选开发 Gateway；当前修改没有替换已发行安装包或部署到既有用户实例。

后续[只读文件服务组件化](read-component-zh.md)已迁入 `dsh_read`，并保留读后写保护。本文保留搜索阶段的设计与验收范围。
