# CoNest Studio 0.6.2 演示手册

CoNest 是 OpenClaw 插件。Studio 将 OpenClaw 插件/工具目录与 DSH Market 完整 feed 合并，DSH Web 通过配套插件显示同一页面与数据。两种 Loop 都在 OpenClaw 会话中执行；DSH Loop 获得当前会话经过授权的 OpenClaw 工具表，其中也包括 CoNest 注册的 DSH 工具。

## 安装与配置

演示目标：Linux x64/glibc、Node 24.15、OpenClaw 2026.9.2、DSH 0.1.0-rc.5。安装包包含运行库，不依赖源代码目录。

```bash
openclaw plugins install --force --accept-capabilities ./local-conest-connector-0.6.2.tgz
```

`--force` 用于确认信任这份本地内部安装包（OpenClaw 默认会拒绝未签名的本地包）；请先核对随包 SHA256。

现有 Gateway 中，将 `plugins.entries.dsh-bridge.config.workspaceRoot` 和 `studio.stateDir` 设为绝对路径，并开启 `plugins.entries.dsh-bridge.hooks.allowConversationAccess: true`。设置默认模型为 `deepseek/deepseek-v4-flash`，将 `agents.defaults.models["deepseek/deepseek-v4-flash"].agentRuntime.id` 设为 `dsh`，配置该模型凭据，并允许需要的 `read`、`dsh_grep` 等工具。重启后从 Control UI 的 CoNest Studio 标签进入，或打开 `/plugins/conest-studio`。

2026.9.2 的会话命令不接受任意外部 runtime 名称：DSH 选择使用模型默认 runtime，OpenClaw 选择使用显式 `openclaw` runtime。未配置 DSH 默认 runtime 时不能声称 DSH 已执行，应以轨迹中的实际 Loop 为准。

## 独立演示工作区

启动脚本创建独立 Gateway 配置、共享记忆和样例文件，不覆盖现有 OpenClaw 配置。需安装匹配的 OpenClaw。0.6.2 启动器保留了 `/root/.local/state/...` 与 `/root/.config/...` 的开发默认路径；普通用户必须用 `CONEST_DEMO_STATE` 和 `CONEST_CREDENTIAL_FILE` 覆盖。端口默认 18791，完整的普通用户安装命令见 [Ubuntu 本地教程](docs/Ubuntu本地安装与演示教程.md)。

```bash
node /path/to/plugin/dist/demo-studio.mjs
# 真实 DeepSeek 官方 API；凭据文件仅所有者可读，包含 DEEPSEEK_API_KEY
CONEST_CREDENTIAL_FILE=/path/to/deepseek.env node /path/to/plugin/dist/demo-studio.mjs --live
```

默认是确定性彩排：模型决策为 fixture，Gateway 会话、DSH Loop、双方工具和磁盘记忆实际执行。`--live` 才调用真实模型。每次启动最多 12 次真实模型请求，达到预算后需重启。不要将彩排介绍为真实模型推理。

启动输出包含页面地址和 `connection.json` 路径，该文件保存 Gateway token，在 Studio 连接设置中输入。OpenClaw 的受限 iframe 中令牌仅保存在当前页面内存，重新打开页面时需再次输入。token 不进入分发包和报告。`CONEST_DEMO_STATE`、`CONEST_DEMO_PORT` 可覆盖目录与端口。加 `--verify` 自动执行四段验收后退出，结果保存到状态目录的 `acceptance.json`。

## DSH 端

配套包位于 `companions/dsh-ui`。将此本地包安装到 DSH Web profile，并将 `@local/conest-dsh-ui` 加入 profile 的 `dsh.profile.bundles`，重启 DSH Web。设置 → Plugins → CoNest 统一生态，输入可达的 Studio 地址和同一 Gateway token。默认 loopback 供本机或 SSH 隧道使用。

## 演示顺序

1. 统一清单切换 OpenClaw / DSH / Market，搜索插件，展示总数、拉取时间与来源。Market 条目“可发现·未验证适配”不表示已安装或全部兼容。
2. DSH Loop：用 `read` 读取 `evidence.txt`，再用 `dsh_grep` 搜索 CoNest。查看两种来源的工具完成事件。
3. OpenClaw Loop：执行相同任务，展示双方工具。
4. DSH Loop：“请记住：项目代号是青竹，汇报偏好为先结论、后证据。”切换 OpenClaw Loop：“刚才记住的项目代号和汇报偏好是什么？请根据共享记忆回答。”查看共享记忆页的持久记录。
5. DSH Web 的 CoNest 标签展示相同清单、执行记录和记忆。

## 范围

当前为受信任操作者的单用户内部演示。DSH harness 在 sandbox 会话中拒绝执行；工具通过 OpenClaw 当前会话工具表调用。Studio 不提供 Market 全量插件自动安装，也未承诺任意版本、平台、模型和第三方插件的运行兼容性。目录可见性和执行兼容性分别标注。
