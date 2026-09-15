# Red Hat 8 系与 Windows 安装演示教程

交付版本：CoNest Connector 0.6.3 多平台候选版。宿主固定 OpenClaw 2026.9.2，Node 固定 24.15.0。本教程用于 OpenClaw 内的 CoNest 演示。

## 1. 安装目标与范围

| 项目 | Red Hat 8 系 | Windows |
|---|---|---|
| CPU | x86_64 | x64 |
| 系统基线 | glibc ≥ 2.28，内核 ≥ 4.18 | Windows 10/11 x64 |
| 安装入口 | `bash install.sh` | `install.ps1` |
| 默认安装目录 | `~/conest-demo-0.6.3` | 用户主目录下的 `conest-demo-0.6.3` |
| 执行方式 | 本机 Linux 进程 | 本机 Windows 进程，无需 WSL |
| 核心能力 | 统一清单、DSH/OpenClaw Loop、双方读取/搜索工具、共享记忆 | 相同的核心演示能力；原生系统验收状态见下文 |

0.6.2 基线已独立备份。本版使用新的默认目录，保留既有 0.6.2 安装与记忆。启动本版前，停止占用 18791 端口的旧演示服务。

独立 DSH Web 仅用于第二个界面对照，不是 OpenClaw 内 DSH Loop 的运行前提。本次多平台交付包不包含独立 DSH Web 运行包。0.6.2 的 Ubuntu DSH 运行包不能作为 Windows 安装包使用。DSH 侧的 CoNest 界面插件源码保留在 `companions/dsh-ui`。

**验证状态：** Red Hat 官方 UBI 8.10 用户空间（glibc 2.28）与 Windows 版 Node/Wine 环境已验证 DSH 运行组件的实际读取、搜索、Loop 和重启后记忆。UBI 使用当前 Linux 主机内核；Wine 检查不能代替原生 Windows 的完整 OpenClaw 安装与界面验收。最终结果以随包的多平台验证说明和本机自检为准。

## 2. Red Hat 8 系安装

在终端检查系统：

```bash
cat /etc/os-release
uname -m
getconf GNU_LIBC_VERSION
```

架构应为 `x86_64`，glibc 应为 2.28 或更高。公司定制发行版还需确认其 Node 运行条件与文件系统策略。

安装下载工具和运行库：

```bash
sudo dnf install -y ca-certificates curl tar xz git libstdc++
```

如果系统只提供 `yum`，将命令中的 `dnf` 换为 `yum`。无需在演示电脑上编译插件原生模块；包内已提供按 glibc 2.28 基线构建的 Linux 依赖。

解压完整交付 ZIP，在解压目录打开终端，执行：

```bash
bash install.sh
```

脚本依次下载并校验 Node 24.15.0，安装 OpenClaw 2026.9.2、pnpm 11.7.0，再通过 OpenClaw 原生命令安装对应平台的 CoNest 包。系统依赖安装之外，使用普通用户运行脚本。

成功输出包含 `Installed plugin: dsh-bridge`。然后自检：

```bash
bash "$HOME/conest-demo-0.6.3/start.sh" --verify
```

预期结果为 `Studio acceptance passed`。检查包含两个 Loop 的双方工具调用、记忆写入与跨 Loop 召回。自检使用确定性的模型决策，工具与磁盘记忆实际执行，不消耗模型 API 额度；市场同步仍需联网。

配置模型 Key：

```bash
mkdir -p "$HOME/conest-demo-0.6.3/credentials"
chmod 700 "$HOME/conest-demo-0.6.3/credentials"
read -rsp 'DeepSeek API Key: ' conest_api_key
printf '\n'
(umask 077; printf 'DEEPSEEK_API_KEY=%s\n' "$conest_api_key" > "$HOME/conest-demo-0.6.3/credentials/deepseek.env")
unset conest_api_key
```

输入不会回显。Key 需要能够调用本演示固定的 `deepseek-v4-flash`，两种 Loop 共用这份 Key。启动：

```bash
bash "$HOME/conest-demo-0.6.3/start.sh"
```

保持终端打开。在另一个终端读取连接信息：

```bash
bash "$HOME/conest-demo-0.6.3/start.sh" --connection
```

## 3. Windows 原生安装

使用普通用户打开 Windows PowerShell，在解压后的交付目录执行：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\install.ps1
```

`Bypass` 只作用于这次 PowerShell 进程，不修改系统全局执行策略。脚本下载 Windows x64 版 Node 并校验 SHA256，然后安装 Windows 依赖包及 CoNest。默认路径可包含空格。

自检：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File "$HOME\conest-demo-0.6.3\start.ps1" -Verify
```

预期为 `Studio acceptance passed`。若出现宿主生命周期锁、原生模块或权限错误，保留日志并对照第 6 节处理；Windows 原生验收不能用 Wine 的组件检查结果代替。

配置模型 Key：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File "$HOME\conest-demo-0.6.3\configure-key.ps1"
```

脚本用隐藏输入读取 Key，并通过 Windows ACL 保护凭据目录。无需执行 Linux 的 `chmod`，也无需在 OpenClaw 设置页面重复填写 Key。

启动服务，保持窗口打开：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File "$HOME\conest-demo-0.6.3\start.ps1"
```

另开 PowerShell 读取连接信息：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File "$HOME\conest-demo-0.6.3\start.ps1" -Connection
```

## 4. 打开界面与演示

两种系统均在本机浏览器打开 `http://127.0.0.1:18791`，连接后点击左侧 **CoNest Studio**。如果宿主要求连接地址，填写 `ws://127.0.0.1:18791`；宿主和插件连接框均使用启动后读取的 Gateway token。Gateway token 与模型 Key 不同。

按以下顺序操作，每项等待任务完成后继续：

| 步骤 | 操作 | 预期结果 |
|---|---|---|
| 1 | 统一生态 → 同步市场 → 筛选 DSH、工具、市场 | 查看条目来源、注册状态和市场摘要；市场条目不代表已安装 |
| 2 | 工作台选择 DSH Loop，执行下方混合工具任务 | 实际 Loop 为 dsh，OpenClaw read 和 DSH dsh_grep 均完成 |
| 3 | 切换 OpenClaw Loop，执行同一任务 | 实际 Loop 为 openclaw，双方工具再次完成 |
| 4 | DSH Loop 写入偏好，打开共享记忆页 | 出现持久记忆记录 |
| 5 | 切换 OpenClaw Loop，召回偏好 | 新会话出现记忆召回事件，并回答对应内容 |

混合工具任务：

```text
使用 OpenClaw 的 read 读取 evidence.txt，再用 DSH 的 dsh_grep 搜索 CoNest，汇总两次工具返回的真实内容。请用中文回答。
```

记忆写入：

```text
请记住：CoNest 演示的项目代号是青竹，汇报偏好为先结论、后证据。请确认记忆。
```

跨 Loop 召回：

```text
刚才记住的 CoNest 项目代号和汇报偏好是什么？请根据共享记忆回答。
```

以工具事件、实际 Loop、磁盘记忆与召回事件判断结果。模型在自动记忆 hook 写入之前生成确认文字，可能无法准确描述随后完成的持久化；请核对共享记忆页。

当前任务验证基础集成链路，未扩展为复杂业务任务验收。Market 全量目录接入也不等于任意第三方市场插件都可安装、运行。

## 5. 停止与再次启动

在服务终端按 Ctrl+C。下次直接执行对应系统的 `start.sh` 或 `start.ps1`，无需重装。每次重启会生成新的 Gateway token，记忆保留在该版本的 `demo-state/studio/memory.jsonl`。

每次启动最多允许 12 次真实模型 API 请求；一项任务可能包含多次请求。额度达到上限后停止并重新启动演示服务，再读取新 token。

## 6. 排查与平台能力

| 现象 | 处理方式 |
|---|---|
| Red Hat 提示 curl / tar / xz 缺失 | 先完成第 2 节系统依赖安装 |
| 平台或 glibc 不匹配 | 核对 x64 与 glibc ≥ 2.28；不要使用 0.6.2 的旧 Linux 原生包替代本版 |
| Windows ACL 配置失败 | 检查 PowerShell 可用、目录属于当前用户；保留报错，不跳过凭据权限检查 |
| Windows 安装失败 | 区分 Node 下载、OpenClaw 安装、CoNest 插件安装三步；保留原生系统报错 |
| 端口被占用 | 停止原来的 0.6.2 或另一份演示进程，再启动本版 |
| 公司网络无法访问 npm | 按公司网络要求配置代理；可通过 `CONEST_NPM_REGISTRY` 环境变量指定可用的 npm registry |
| 市场显示缓存 | 检查联网，重新点击同步；目录缓存不能作为最新同步成功的依据 |
| dsh_bash 无法执行 | 本次默认演示不开放该工具。Linux 的沙箱命令执行还需要可用的 bwrap/Landlock；Windows 还涉及 Bash 和 ACL 沙箱能力，不能将缺失沙箱悄悄改为无隔离执行 |

包内已保留 DSH 的 Bash、图片等组件，但本次跨平台验收重点是 Loop、读取/搜索和共享记忆，不代表所有系统相关工具都完成目标系统验收。详见 [多平台适配设计与验证](多平台适配设计与验证.md)。

Node 平台基线依据 [Node 24.15.0 官方构建说明](https://github.com/nodejs/node/blob/v24.15.0/BUILDING.md)。
