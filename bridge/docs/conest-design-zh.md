# CoNest 当前设计说明

版本：CoNest Connector 0.6.2。依据：2026-09-13 的交付代码、最终安装包及验收记录。配套操作教程：[Ubuntu 本地安装与演示教程](./ubuntu-installation-demo-zh.md)。

后续开发增量见 [2026-09-14 双 Loop 组件运行时接入](./dual-loop-component-runtime-zh.md)。本文保留 0.6.2 交付基线；其中“四个 bridge 工具未进入 DSH harness”是该基线的限制，已由后续开发增量改进。继续见[搜索服务组件化](./search-component-zh.md)：`dsh_grep`、`dsh_glob` 已迁入搜索组件；随后[只读文件服务组件化](./read-component-zh.md)迁入 `dsh_read` 并保留读后写校验；再由[共享记忆服务组件化](./memory-component-zh.md)迁入记忆工具及自动记忆服务；写入、编辑、图片、Bash 和 Loop 仍在 Gateway。

## 1. 当前设计要解决的问题

CoNest 将 DSH 的任务循环和工具接入 OpenClaw，使用户能在同一工作台选择任务由谁组织，同时使用双方工具，并在不同 Loop 的任务之间共享记忆。统一清单负责让用户在 OpenClaw 和 DSH 两个界面中发现同一批资源。

本版的核心解耦是 **Loop 的选择与工具的来源分开**：选择 DSH Loop，不意味着只能使用 DSH 工具；选择 OpenClaw Loop，也不意味着只能使用 OpenClaw 原生工具。用户不需要先把文件复制到另一个运行环境才能演示双方工具协作。

| 用户选择 | 谁组织模型与工具循环 | OpenClaw 工具从哪里来 | DSH 工具从哪里来 |
|---|---|---|---|
| OpenClaw Loop | OpenClaw 原生运行时 | 宿主当前会话的工具表 | CoNest 注册到 OpenClaw 的 `dsh_*` 工具 |
| DSH Loop | CoNest 中注册的 DSH Agent Harness，实际调用 DSH Agent Loop | OpenClaw 为本次运行创建的工具执行接口 | 同一工具表中的 `dsh_*` 接口，最终回到 CoNest 的 DSH 组合执行 |

当前验证对象是 DeepSeek Flash、受信任的单用户工作区与文件搜索/记忆场景。市场的完整可见性已经实现；任意市场插件的安装、适配和执行不属于已经完成的能力。

## 2. 产品构成、安装制品与运行进程

### 2.1 交付物

| 名称 | 当前形态 | 作用 |
|---|---|---|
| CoNest Connector | OpenClaw 插件包 `@local/conest-connector`，插件 ID 保留为 `dsh-bridge` | 注册工具、DSH harness、生命周期、HTTP 页面和接口 |
| CoNest Studio | 插件包内的 HTML/JavaScript 页面 | 展示目录、选择 Loop、发起任务、查看轨迹和记忆 |
| CoNest DSH UI companion | 包内 `companions/dsh-ui`，包名 `@local/conest-dsh-ui` | 在 DSH Web 的插件设置页注册标签，用 iframe 嵌入同一个 Studio |
| 独立演示启动器 | 包内 `dist/demo-studio.mjs` | 创建演示配置、文件、模型通道并启动真正的 OpenClaw Gateway |
| DSH Web 演示运行包 | 冻结 DSH rc.5 快照及所需依赖的单独归档 | 在本机启动第二个宿主界面；不是 CoNest 执行 DSH Loop 的必要进程 |

CoNest 插件包可通过 `openclaw plugins install` 安装。DSH Web 的配套插件通过 DSH 的 profile/plugin 机制安装，两者不是同一种包管理接口。

### 2.2 运行时位置

浏览器中的 Studio 通过 HTTP 请求连接 OpenClaw Gateway。Gateway 进程内加载 CoNest，Studio 的 DSH 组合也在该进程内运行。MCP Memory 使用单独的 stdio 子进程保存图实体与 observations。

此前已有的 CoNest 组件运行时仍然保留：它通过受监督的 worker 子进程运行 Cordis 组件，并提供 `bridge_capabilities`、`bridge_invoke`、`knowledge_search`、`knowledge_verify` 等接口。**这一组件运行时与本版 Studio 内的 DSH 组合是两条不同的执行路径。** Studio 的双 Loop 演示没有自动经过旧组件 worker 的 capability 授权协议，不能把旧路径的隔离与验收结论直接套在新路径上。

| 逻辑职责 | 实际位置 | 生命周期 |
|---|---|---|
| OpenClaw 会话、runtime 选择、宿主工具 | OpenClaw Gateway 进程 | 由 OpenClaw 管理 |
| Studio API、市场快照、轨迹记录 | Gateway 内的 CoNest 插件 | 插件注册和服务生命周期 |
| Studio 的 DSH Agent/Loop/工具组合 | Gateway 进程内的 Cordis context | CoNest 服务启动时装配，停止时释放 |
| MCP 共享记忆服务 | stdio 子进程 | 由 DSH MCP client 启动和连接 |
| 已有 Cordis 组件 worker | 另一子进程 | 由已有 CoNest Runtime 监督 |
| DSH Web | 独立 DSH 进程 | 独立启动/停止，只承担第二个界面入口及其宿主能力 |
| 演示模型转发器 | 演示启动器进程中的本地 HTTP 服务 | 随演示启动器启动/停止 |

关闭 DSH Web 不会关闭 OpenClaw 内的 DSH Loop。两端看到相同数据，是因为使用同一个 Studio API，而不是两套数据库在后台同步。

## 3. 统一清单如何形成

Studio 将三类数据合并为一个清单。

| 数据来源 | 接入方式 | 进入清单的内容 |
|---|---|---|
| OpenClaw 插件目录 | 通过公开 Gateway 方法 `plugins.list` 读取 | 宿主可发现、安装、启用状态对应的插件记录 |
| OpenClaw 工具目录 | `tools.catalog`，包含插件工具 | 核心及插件注册的工具，也包括 CoNest 暴露的 `dsh_*` |
| DSH Market | 完整读取 `https://awesome-dsh-plugin.com/plugins.json` | 上游 feed 中每一条市场插件元数据 |

条目有稳定 ID、名称、来源、类型、描述和状态。Market 使用来源 URL 构成 ID，解析时检查字段、重复项以及上游声明数量。目录拉取设置超时和体积上限，成功后将快照写入本地文件，并保留同步时间与内容摘要。

“同步市场”会重新请求 feed；上游不可达时可以显示此前的快照及错误/缓存提示。当前没有后台持续推送保证，因此“同源完整清单”指本次成功同步的完整 feed，不等于永远无延迟地反映上游变化。

清单状态承担两个不同问题：**是否能发现**与**是否已在当前宿主注册或加载**。市场条目显示“可发现·未验证适配”；它不会因为出现在清单里就获得执行权限。工具标记“已注册”也不等于每次任务都能调用，实际工具集合还要经过宿主策略过滤。

2026-09-13 验收环境共有 3,866 条，其中 DSH Market 3,627 条。数量会随市场和宿主变化；不能把这个时点计数写成产品常量。双方页面复用同一 API 和同一快照，因此查询同一资源时不会依赖各端各自维护的映射表。

## 4. Loop 的选择与会话建立

Studio 的每次任务请求带有 `loop` 和任务文本。当前服务端为该次任务创建新的 OpenClaw 会话 key，再设置模型/runtime，最后调用 OpenClaw 的 `agent` 方法开始运行。

本版固定验收 `deepseek/deepseek-v4-flash`。OpenClaw 2026.9.2 的会话命令不能直接把任意外部 harness ID 当成 `/model --runtime` 参数，因此采用以下组合：

| 用户选择 | 会话设置 | 成立条件 |
|---|---|---|
| DSH Loop | `/model deepseek/deepseek-v4-flash --runtime auto` | 模型默认 `agentRuntime.id` 已配置为 `dsh` |
| OpenClaw Loop | `/model deepseek/deepseek-v4-flash --runtime openclaw` | 使用宿主原生运行时 |

演示启动器自动写入这组配置，使用者无需手动执行命令。接入已有 Gateway 时则必须补齐配置，不能认为只安装插件就会替换所有会话的默认 Loop。

DSH harness 通过 OpenClaw 的公开 `registerAgentHarness` 接口注册。模型路由与运行条件不符合当前适配范围时，宿主可能使用其他运行时或报告不支持，所以工作台请求的 Loop 与实际运行身份分开记录。验收检查任务完成事件中的实际 `dsh` / `openclaw`，而不仅检查选择卡片。

这个版本按“每次点击新建任务会话”组织 Studio，并未提供可视化的长会话内连续切换。跨次任务的用户偏好由共享记忆承接。

## 5. 双向工具混用机制

### 5.1 DSH 工具进入 OpenClaw

CoNest 启动 DSH 组合，装配 Agent、Agent Loop、LLM adapter、文件访问、搜索、子进程、沙箱策略、会话持久化及 MCP client。生成的工具描述表将 DSH 工具注册到 OpenClaw，外部名称使用 `dsh_*` 前缀，区分来源并降低名称冲突。

当前导出 16 个工具：文件读写/编辑/图像读取、glob/grep 搜索、bash，以及 9 个 MCP Memory 图工具。演示启动配置只放行指定的读取、搜索等工具；导出列表不等于已逐项完成演示验收。写文件、执行 bash、读取图像等不能仅凭注册成功宣称已经通过本次四段演示。

OpenClaw Loop 调用 `dsh_grep` 时，其宿主工具执行过程先经过 OpenClaw 的准入和 hooks，再进入 CoNest，调用 DSH 注册的 grep 工具。搜索由实际 packaged ripgrep 执行，返回结果沿原调用链回到 OpenClaw Loop。

### 5.2 OpenClaw 工具进入 DSH Loop

DSH harness 不重新实现一套 OpenClaw 工具。它通过宿主为本次运行提供的 `createToolSurface` 获取工具执行接口，将会话、agent、工作区、模型及取消信号等上下文带入，并进一步应用工具允许/拒绝条件。

随后 CoNest 在这个 DSH agent 的局部工具注册表中安装这些宿主接口：

1. 限制继承的全局 DSH 工具，避免局部任务又从全局表取得另一套未经本次宿主授权的工具。
2. 将本次宿主工具以原名注册到 agent 的局部表，包括 `read` 和 `dsh_grep`。
3. 每次执行调用真实的宿主 tool executor，并检查运行上下文仍然有效。
4. 在成功或失败后向宿主报告对应工具事件，任务结束后释放局部工具注册和限制。

因此 DSH Loop 调用 `read` 的路径是：DSH 组织调用 → 局部工具代理 → OpenClaw 的真实 `read` executor → 文件结果回到 DSH。

DSH Loop 调用 `dsh_grep` 的路径是：DSH 组织调用 → 同一宿主工具表 → CoNest 注册的 `dsh_grep` executor → DSH grep 实现 → 结果回到 DSH。

这个设计使“随 DSH 带来的工具”和“宿主已有工具”能在同一轮任务中出现，同时由宿主工具表确定本次可见集合。它不是把整套 OpenClaw 全局对象直接暴露给 DSH。

### 5.3 当前准入边界

DSH harness 对 OpenClaw sandbox 会话拒绝执行；DSH 工具工厂也检查宿主 sandbox 状态与 workspace-only 路径一致性。内部 DSH 文件系统采用工作区范围的策略。当前不是已经完成的通用沙箱兼容层。

工具策略按具体工具名称生效。`read` 与 `dsh_read` 是不同名称，对一个名字的禁用不能自动解释成对所有同类能力的禁用。接入生产配置时需要明确每个导出工具的准入规则。

已有组件 worker 的四个 bridge 工具和递归委派接口没有进入此 DSH harness 的工具代理表，避免把当前尚未贯通的授权上下文或递归调用混入这条路径。“能使用 OpenClaw 资源”应理解为当前已授权、已接通的宿主工具及相应资源，不等于所有插件、所有管理接口都自动兼容。

## 6. 共享记忆如何跨越 Loop

本版共享记忆由 MCP Memory server 的图实体和 observations 保存，数据持久化到 Studio 状态目录中的 `memory.jsonl`。它不是把 DSH 自带的全部记忆系统与所有 OpenClaw memory 插件自动合并；演示配置明确将原生 memory slot 设为 `none`，避免形成两套互相不一致的自动记忆。

CoNest 在两个运行时的提示词构建与任务结束流程中使用同一套 hooks：

- **调用模型前**：根据 agent/用户上下文确定记忆主体，读取 observations，将格式化后的记忆作为上下文注入当前任务。
- **任务执行期间**：保留候选记忆文本及本次实际 Loop，工具调用正常进行。
- **任务成功结束后**：对符合捕获条件的用户文本写入同一主体，并记录 memory.write 事件；失败任务不按成功任务写入。

当前演示主体为 `main` agent，命名空间为 `conest`。命名函数能在存在 channel/sender/account 信息时构造更细的主体，但这不能替代多用户隔离的完整验收。Studio 页面当前读取 `main` 的记忆。

捕获使用明确记忆/偏好等规则，不是对所有对话进行模型总结。单条候选最多 500 字符，召回格式化最多 20 条、4,000 字符，并过滤部分指令注入和显式凭据样式。`incognito` 会话跳过自动记忆处理。规则只覆盖当前实现范围，不能作为全面敏感信息识别保证。

跨 Loop 演示分成两个独立任务：DSH 成功写入偏好，OpenClaw 的下一次任务从相同 MCP 后端取出并注入。验证时同时检查磁盘记忆、召回事件和最终回答；仅凭模型在答案里提及某个历史出现过的词语，不足以证明发生了召回。

## 7. 界面接入、认证与执行证据

### 7.1 同一页面的两个宿主入口

OpenClaw 通过 Control UI descriptor 将 CoNest Studio 注册为侧栏标签，并以受限 iframe 加载插件 HTML。DSH companion 通过 `settings.plugins.tab` slot 注册标签，内部同样嵌入 Studio，并提供目录、工作台、记忆切换与全屏展示。

HTML shell 本身不带用户数据或凭据。Studio API 要求用户提供 Gateway Bearer token，通过公开 Gateway 客户端验证调用者后才读取私有状态或发起操作。插件没有改用宿主配置里的管理员 token 代替来访者身份。

OpenClaw iframe 的 opaque origin 会禁止 sessionStorage，也可能禁止表单提交。当前页面在受限环境下把 token 放在内存中，并以按钮的 JavaScript 事件完成连接；服务端对 `Origin: null` 提供明确的 CORS 预检支持，实际请求仍需有效 Bearer token。缺失/错误令牌返回 401。未修改宿主 iframe 的限制来绕过这些条件。

### 7.2 轨迹记录什么

活动记录包括任务启动/完成、工具开始/结束、记忆读取/写入和 DSH Loop 完成事件。工具事件保存工具名、来源、状态、耗时及错误；任务完成事件保存实际 Loop 与输出。页面定期读取这些事件并展示。

活动文件有体积轮转和展示数量限制，属于演示运行记录，不是不可篡改的审计账本。模型回答中的“调用成功”不能替代真实工具完成事件。最终验收脚本检查了两种 Loop 的实际身份及双方工具成功事件。

### 7.3 模型与 Loop 的关系

两个 Loop 在本演示中都调用同一真实模型，模型名称不决定由哪个 Loop 组织执行。`--live` 模式中的本地模型服务转发到 DeepSeek 官方 API 并记录用量；默认模式则返回确定性的模型决策，用于排查运行链路。

启动器每次启动最多转发 12 次真实模型请求，并限制输入总量与单次输出。它是为演示验证提供的 transport，不是生产级模型代理、计费服务或限流产品。当前 API 中模型选择和 DSH adapter 的路由有固定假设，不能把一次 DeepSeek 验收推广到任意模型 provider。

## 8. 生命周期、配置与状态

Studio 的注册由 `plugins.entries.dsh-bridge.config.studio` 开启，并要求绝对 `stateDir`。没有配置 Studio 时，原有组件 worker 和 bridge 能力仍然可以工作；安装插件本身不会自动把所有会话改用 DSH Loop。

OpenClaw 可以为不同用途创建多个插件注册上下文。Studio 通过进程内共享表按真实状态目录复用 DSH host、市场缓存、活动记录及运行映射，通过服务拥有者计数控制关闭，避免某个临时注册上下文退出就关闭其他运行仍在使用的服务。

| 状态 | 保存位置/方式 | 作用 |
|---|---|---|
| 市场快照 | `studio/market.json` | 完整目录、同步时间与摘要 |
| 活动轨迹 | `studio/activity.jsonl` | 页面展示任务/工具/记忆事件 |
| MCP 记忆 | `studio/memory.jsonl` | 跨任务、跨 Loop、重启后保留 |
| DSH 会话 | `studio/sessions` | DSH 会话持久化与恢复基础 |
| OpenClaw 会话 | Gateway 自己的状态目录 | 原生会话、结果与宿主事件 |
| 演示连接信息 | `connection.json`，权限 600 | 当次地址/token/PID；重启会更新 |

任务代理传递取消信号，局部工具在 finally 中释放；服务停止会释放 DSH composition 与相关 agent 句柄。共享表、运行映射和长会话缓存还需要针对长期运行进一步验证，本版验收不是无界持续运行或多租户服务的容量验证。

## 9. 打包方式与平台边界

0.6.2 为 Linux x64/glibc 打包，并固定 Node 24.15.0 验收。Studio JavaScript 及 MCP Memory server 进行了 bundle，原生依赖则以对应平台的实际文件放进安装包，包含 node-pty、sharp、koffi、ripgrep 及 Linux Landlock launcher 等。插件包包含 49 个单独保留的运行依赖包；这个数量不包含已经折叠进 JavaScript bundle 的全部依赖。

这种打包能在同平台安装时摆脱开发源码目录，最终包已经通过原生 OpenClaw 安装及安装后真实任务验收。它也解释了目前的平台限制：只带 Linux 原生模块的包不能直接装到 Windows 原生 OpenClaw。

跨平台仍是合理的后续目标，所需工作包括按 OS/CPU 分发原生依赖、隔离平台适配代码、替换 Linux 专用沙箱、使可选能力失败不阻断平台无关功能加载，并分别完成各平台安装和运行验收。把 package.json 的 `os` 限制删除、将 Linux 包放进 WSL、或者只保证 TypeScript 能编译，都不能视为完成 Windows 原生支持。

单独提供的 DSH Web 运行包是为本地 Ubuntu 双端展示补齐的冻结快照分发物，含预构建客户端和运行依赖；并未将上游 DSH 发布成一个新的官方版本。

## 10. 已完成与下一步

| 范围 | 当前结论 | 后续工作 |
|---|---|---|
| 双端统一发现 | 同一 API 合并 OpenClaw 目录、工具和完整 DSH Market feed，两个页面可见 | 更细的能力/版本/依赖关系与安装状态 |
| 双 Loop 工具混用 | 实际 DSH Loop、OpenClaw Loop 都执行了宿主 read 与 DSH grep | 扩大模型、第三方工具、异常与取消场景验证 |
| 共享记忆 | 单用户演示的写入、跨 Loop 召回、重启保留通过 | 用户授权、编辑/删除、隔离与其他 memory 后端适配 |
| 插件安装 | Linux x64 最终 tgz 的原生安装和安装后真实任务通过 | 多平台原生包、版本矩阵和升级流程 |
| 组件运行时 | 原有受监督 worker 与 Studio 组合共存 | 明确何时合并治理，贯通授权与生命周期，避免重复实现 |
| Market 安装执行 | 当前完成发现，不具备全量通用安装适配 | 对插件声明、依赖、服务接口、权限和兼容性做逐类适配 |
| 多用户生产部署 | 当前未完成该范围验收 | 身份、授权、持久化隔离、并发、资源回收与运行运维 |

当前定位是 **具备真实运行能力的内部演示版本**：核心联通路径已经运行，而平台、模型、工具和市场适配范围仍是有边界的。后续设计应保留“Loop 与工具来源解耦、宿主负责准入、双端共享同一发现入口”的结构，再扩大适配范围。

## 11. 代码与证据索引

| 主题 | 位置 |
|---|---|
| 插件主入口及已有组件 worker | [src/index.ts](../src/index.ts) |
| Studio 服务、工具注册、hooks 与 API | [src/studio/index.ts](../src/studio/index.ts) |
| DSH harness 与宿主工具绑定 | [src/studio/dsh-agent-harness.ts](../src/studio/dsh-agent-harness.ts) |
| DSH agent 局部工具表和执行 | [src/studio/cordis-bridge-host.ts](../src/studio/cordis-bridge-host.ts) |
| DSH 组合 | [src/studio/composition.ts](../src/studio/composition.ts) |
| Market 完整读取与缓存 | [src/studio/catalog.ts](../src/studio/catalog.ts) |
| 记忆主体、捕获和召回格式化 | [src/studio/automatic-memory.ts](../src/studio/automatic-memory.ts) |
| 工具映射 | [生成的工具描述](../src/studio/generated/composition.generated.ts) |
| DSH Web 插件 | [companions/dsh-ui](../companions/dsh-ui) |
| 演示模型及 Gateway 启动 | [scripts/demo-studio.mjs](../scripts/demo-studio.mjs) |
| 最终包安装和真实模型验收 | [RESULT.md](../reports/studio-0.6.2/RESULT.md)、[安装后证据](../reports/studio-0.6.2/installed-live-acceptance.json) |

这些引用证明当前实现与验收范围；文中的后续工作不视为已经进入交付包。
