# Ubuntu 本地安装与演示教程

适用交付：CoNest Connector 0.6.2、OpenClaw 2026.9.2、DSH 0.1.0-rc.5。编写日期：2026-09-13。

本教程用于在 Ubuntu 本机安装 CoNest，并通过 OpenClaw 界面操作统一清单、双 Loop、双方工具和共享记忆。按章节顺序执行命令，确认每一步的预期结果后继续。所有路径使用当前普通用户的 `$HOME`；除安装 Ubuntu 系统依赖外，不使用 sudo。

**操作路径：** 第 2–6 节完成 OpenClaw 主演示环境安装，第 8 节执行功能演示。第 7 节为可选步骤，仅在需要对照展示 DSH 侧界面时执行；OpenClaw 内的 DSH Loop 和工具不依赖独立的 DSH Web 服务。

## 1. 演示内容与环境要求

| 入口 | 地址 | 演示用途 |
|---|---|---|
| OpenClaw 原生界面 | http://127.0.0.1:18791 | 从左侧 CoNest Studio 进入插件 |
| CoNest Studio 直达 | http://127.0.0.1:18791/plugins/conest-studio | 统一清单、双 Loop、工具轨迹、共享记忆 |
| DSH Web（可选） | http://127.0.0.1:18801 | Settings → Plugins → CoNest 统一生态 → 全屏演示 |

选择 DSH Loop 时，OpenClaw 将当前任务交给 CoNest 加载的 DSH 执行引擎，后者调用当前任务允许的双方工具，并将结果返回 OpenClaw。可选的 DSH Web 通过界面插件连接同一个 OpenClaw Gateway，展示相同的清单、执行记录和记忆。

当前演示验证市场目录接入、随包工具互通与跨 Loop 记忆。市场条目状态为“可发现 · 未验证适配”，不表示已安装；当前版本未提供任意 DSH 市场插件的通用安装与执行能力。示例任务用于验证集成链路，尚不覆盖复杂业务任务验收。

当前包面向 **Ubuntu 24.04 LTS、x86_64、glibc、Node 24.15.0**；已有运行验收环境为 Ubuntu 24.04.4。ARM Ubuntu 不适用这份二进制包。建议为浏览器及两个服务预留 8 GB 内存、5 GB 可用磁盘，这属于演示资源建议，不是性能测定下限。

打开终端检查：

```bash
uname -m
lsb_release -ds
```

第一行应为 `x86_64`。本次不跟随 OpenClaw/DSH 的 latest，以免安装期间发生版本变化。

## 2. 准备交付文件

使用完整 ZIP 交付包时，在解压后的根目录运行 `bash prepare.sh`。显示“校验通过”后，所需文件已复制到 `~/conest-demo/downloads`，可直接进入第 3 节。

手动准备文件时，新建目录：

```bash
mkdir -p "$HOME/conest-demo/downloads"
```

把下面四个文件下载或复制到该目录。文件管理器里可以直接复制文件；不要先解压 CoNest 的 tgz。

| 文件 | 项目内位置 | 用途 |
|---|---|---|
| local-conest-connector-0.6.2.tgz | [下载插件包](../releases/delivery/local-conest-connector-0.6.2.tgz) | OpenClaw 通过原生插件安装命令安装 |
| local-conest-connector-0.6.2.tgz.sha256 | [插件校验文件](../releases/delivery/local-conest-connector-0.6.2.tgz.sha256) | 核对传输完整性 |
| dsh-web-demo-0.1.0-rc.5-linux-x64.tar.gz | [下载 DSH 演示运行包](../releases/ubuntu-demo/dsh-web-demo-0.1.0-rc.5-linux-x64.tar.gz) | 已构建的 DSH Web 和运行依赖，约 72 MB |
| dsh-web-demo-0.1.0-rc.5-linux-x64.tar.gz.sha256 | [DSH 校验文件](../releases/ubuntu-demo/dsh-web-demo-0.1.0-rc.5-linux-x64.tar.gz.sha256) | 核对传输完整性 |

DSH 运行包是项目冻结快照的内部演示分发包，不是上游官方发行包。编写教程时 npm 中无法取得 `@deepseek-ai/dsh@0.1.0-rc.5`，因此本教程使用已提供的运行包；不要执行 `npm install -g @deepseek-ai/dsh@0.1.0-rc.5`。包内保留原有许可证，依赖来源见 [DSH 运行包来源清单](../releases/ubuntu-demo/dsh-runtime-provenance.json)。

核对两份校验值：

```bash
cd "$HOME/conest-demo/downloads"
sha256sum -c local-conest-connector-0.6.2.tgz.sha256
sha256sum -c dsh-web-demo-0.1.0-rc.5-linux-x64.tar.gz.sha256
```

两条都应显示 `OK`。CoNest 插件包 SHA256 为：

```text
c2f8c8b12ffebd7f3ca6d604ae77da897331603940ba7deaad53715ed0fb2371
```

## 3. 安装 Node，并统一终端环境

### 3.1 安装系统依赖

先安装下载、解压和 npm 依赖所需的系统工具：

```bash
sudo apt update
sudo apt install -y ca-certificates curl xz-utils git build-essential python3
```

确认依赖安装成功后继续。若提示 `curl: command not found`，说明本步骤尚未完成。

### 3.2 下载并解压 Node

下载固定版本的 Node 官方 Linux x64 二进制及校验文件。以下命令在子终端中执行，任一步失败即停止本段操作：

```bash
(
  set -e
  cd "$HOME/conest-demo/downloads"
  curl -fLO https://nodejs.org/dist/v24.15.0/node-v24.15.0-linux-x64.tar.xz
  curl -fLO https://nodejs.org/dist/v24.15.0/SHASUMS256.txt
  sha256sum --check --ignore-missing SHASUMS256.txt
  mkdir -p "$HOME/.local/opt"
  tar -xJf node-v24.15.0-linux-x64.tar.xz -C "$HOME/.local/opt"
)
```

应看到该 Node 压缩包校验 `OK`。这里使用独立目录，避免替换系统已有 Node。

### 3.3 设置环境并确认版本

完成 Node 下载与解压后，创建本演示专用的环境文件。环境文件只设置路径，不会安装 Node：

```bash
cat > "$HOME/conest-demo/env.sh" <<'ENV'
export CONEST_HOME="$HOME/conest-demo"
export PATH="$HOME/.local/opt/node-v24.15.0-linux-x64/bin:$CONEST_HOME/host/node_modules/.bin:$PATH"
export OPENCLAW_STATE_DIR="$CONEST_HOME/install-state"
export OPENCLAW_CONFIG_PATH="$CONEST_HOME/install-state/openclaw.json"
export CONEST_PLUGIN_DIR="$OPENCLAW_STATE_DIR/extensions/dsh-bridge"
export CONEST_DEMO_STATE="$CONEST_HOME/demo-state"
export CONEST_DEMO_PORT=18791
export CONEST_CREDENTIAL_FILE="$CONEST_HOME/credentials/deepseek.env"
export DSH_HOME="$CONEST_HOME/dsh-state"
export DSH_TELEMETRY_DISABLED=1
ENV
source "$HOME/conest-demo/env.sh"
hash -r
command -v node
node -v
npm -v
```

`command -v node` 应指向当前用户目录下的 `.local/opt/node-v24.15.0-linux-x64/bin/node`，`node -v` 应显示 `v24.15.0`，随该版本安装的 npm 为 `11.12.1`。如果仍显示 Node 22，返回第 3.2 节确认下载与解压完成，再重新加载环境并执行 `hash -r`。

**确认 Node 版本正确后再进入第 4 节。每开一个新终端，先执行 `source "$HOME/conest-demo/env.sh"`。** 环境文件不保存 API Key。

## 4. 安装 OpenClaw 和 CoNest 插件

安装到当前用户的演示目录：

```bash
source "$HOME/conest-demo/env.sh"
mkdir -p "$CONEST_HOME/host" "$OPENCLAW_STATE_DIR"
cd "$CONEST_HOME/host"
npm install --ignore-scripts --no-audit --no-fund openclaw@2026.9.2 pnpm@11.7.0
openclaw --version
pnpm --version
```

应分别看到 `2026.9.2` 和 `11.7.0`。该固定版本演示使用已经构建的宿主与插件产物；安装时不运行上游生命周期脚本，与本项目安装验收方式一致。这里没有执行 `onboard --install-daemon`，后面用演示启动器生成专用 Gateway 配置。

安装 CoNest：

```bash
openclaw plugins install --force --accept-capabilities \
  "$CONEST_HOME/downloads/local-conest-connector-0.6.2.tgz"
```

安装和依赖检查可能需要几分钟。成功标志是：

```text
Installed plugin: dsh-bridge
Restart the gateway to load plugins.
```

`dsh-bridge` 是保留的插件 ID，产品名为 CoNest。`--force` 表示信任这份本地包，`--accept-capabilities` 接受插件声明的能力；没有第二个参数，安装可能在能力确认阶段退出。第一次没有参数而失败时，使用上面的完整命令重试。

确认文件存在：

```bash
test -f "$CONEST_PLUGIN_DIR/dist/demo-studio.mjs" && echo 'CoNest 安装完成'
```

本教程区分两个目录：`install-state` 保存插件安装及相关登记；`demo-state` 保存接下来实际运行的 Gateway 配置、工作区、记忆和日志。演示启动器会加载刚安装的插件目录。

## 5. 运行安装自检（无需模型 Key）

下面的命令使用单独目录和端口，检查四段流程后自动退出：

```bash
source "$HOME/conest-demo/env.sh"
CONEST_DEMO_STATE="$CONEST_HOME/check-state-$(date +%s)" \
CONEST_DEMO_PORT=18792 \
node "$CONEST_PLUGIN_DIR/dist/demo-studio.mjs" --verify
```

成功标志是 `Studio acceptance passed`。检查中模型决策是确定性 fixture，OpenClaw 会话、DSH Loop、双方工具和磁盘记忆实际执行；它证明运行链路，不代表真实模型推理。完整市场拉取仍需要联网。

如自检失败，查看输出指定的日志文件，按第 11 节排查；自检通过后继续配置真实模型。

## 6. 配置真实模型并启动 OpenClaw 演示

本演示需要一份可用的 DeepSeek API Key。启动器自动配置 OpenClaw 的模型连接，OpenClaw Loop 与 DSH Loop 共用这份 Key，无需在 OpenClaw 设置页面重复填写；切换 Loop 时模型保持不变。

在 Ubuntu 终端输入 DeepSeek API Key，输入内容不会回显：

```bash
source "$HOME/conest-demo/env.sh"
mkdir -p "$CONEST_HOME/credentials"
chmod 700 "$CONEST_HOME/credentials"
read -rsp 'DeepSeek API Key: ' conest_api_key
printf '\n'
(umask 077; printf 'DEEPSEEK_API_KEY=%s\n' "$conest_api_key" > "$CONEST_CREDENTIAL_FILE")
unset conest_api_key
chmod 600 "$CONEST_CREDENTIAL_FILE"
```

Key 须能调用本演示固定的 `deepseek-v4-flash`。真实请求会使用该账号额度。该 Key 交给演示启动器的模型转发服务，网页使用的是另一份 Gateway token。

在 **终端 A** 启动，保持这个终端打开：

```bash
source "$HOME/conest-demo/env.sh"
cd "$CONEST_HOME"
node "$CONEST_PLUGIN_DIR/dist/demo-studio.mjs" --live
```

看到包含以下字段的输出后再开页面：

```json
{"ready":"ready","url":"http://127.0.0.1:18791/plugins/conest-studio","errors":[],"model":"live"}
```

实际输出还会有目录数量和 `connectionFile`。启动器自动配置了 DSH 默认 runtime、OpenClaw 显式 runtime 切换、`read` 和 `dsh_grep` 等演示工具以及记忆 hooks，不需要手工编辑这些 JSON。

在 **终端 B** 读取连接信息：

```bash
source "$HOME/conest-demo/env.sh"
node -e 'const fs=require("node:fs"); const c=JSON.parse(fs.readFileSync(process.env.CONEST_DEMO_STATE+"/connection.json","utf8")); console.log("地址:",c.url); console.log("Gateway token:",c.token); console.log("模型模式:",c.mode);'
```

不要把终端中的 Key/token 投屏。

在 Ubuntu 的 Firefox/Chrome 中打开 http://127.0.0.1:18791 。如果 OpenClaw 要求连接信息，填 `ws://127.0.0.1:18791` 和刚读取的 Gateway token。连接后点击左侧 **CoNest Studio**，在插件自己的连接框再次粘贴同一 token。

也可以直接打开 http://127.0.0.1:18791/plugins/conest-studio 。OpenClaw 的插件 iframe 禁止会话存储，当前实现会将 token 仅留在该页面内存中；重新进入 iframe 后再次连接属于预期行为。

**每次启动 `--live` 最多允许 12 次真实模型请求，不是 12 个任务。** 一项工具任务可能消耗多次请求。四段演示通常约 7–10 次；预算耗尽时在终端 A 按 Ctrl+C，等进程退出，再运行同一启动命令。记忆保留，Gateway token 会更换，需要重新读取和连接。

## 7. 可选：安装 DSH 侧展示入口

本节用于展示统一清单和记忆在 DSH 侧同样可见。仅在 OpenClaw 内演示时，跳过本节，直接进入第 8 节。DSH 侧 CoNest 插件提供界面入口；OpenClaw 中的 DSH 执行引擎由 OpenClaw 侧 CoNest 插件加载。

在终端 B 解压独立 DSH 运行包：

```bash
source "$HOME/conest-demo/env.sh"
mkdir -p "$CONEST_HOME/dsh-runtime"
tar -xzf "$CONEST_HOME/downloads/dsh-web-demo-0.1.0-rc.5-linux-x64.tar.gz" \
  -C "$CONEST_HOME/dsh-runtime"
```

解压后入口为：

```text
~/conest-demo/dsh-runtime/deepseek-harness/apps/cli/lib/bin.js
```

这个包已经构建完成，不再执行 `pnpm install` 或全仓库重建。通过 DSH 自己的插件管理命令，安装 CoNest 附带的客户端插件：

```bash
cd "$CONEST_HOME"
node "$CONEST_HOME/dsh-runtime/deepseek-harness/apps/cli/lib/bin.js" \
  plugin --profile web add "$CONEST_PLUGIN_DIR/companions/dsh-ui"
```

此命令会调用前面安装的 pnpm，初始化 Web profile，并将具有 `dsh.bundle` 声明的 CoNest 插件加入 profile。成功输出含 `@local/conest-dsh-ui`。

可检查激活的 bundle：

```bash
node -e 'const fs=require("node:fs"); const p=JSON.parse(fs.readFileSync(process.env.DSH_HOME+"/profiles/web/package.json","utf8")); console.log(p.dsh.profile.bundles);'
```

应含 `@deepseek-ai/dsh-base`、`@deepseek-ai/dsh-web-app`、`@local/conest-dsh-ui`。

在 **终端 C** 启动 DSH，保持终端打开：

```bash
source "$HOME/conest-demo/env.sh"
cd "$CONEST_HOME"
node "$CONEST_HOME/dsh-runtime/deepseek-harness/apps/cli/lib/bin.js" \
  web --host 127.0.0.1 --port 18801
```

看到 `dsh web: http://127.0.0.1:18801` 后，在同一个浏览器打开该地址。首次启动如出现测试版说明，点击 **Continue**；如要求 API Key，选择 **Configure later**，因为 CoNest 任务使用 OpenClaw 演示启动器提供的模型通道。

进入 **Settings → Plugins → CoNest 统一生态**。地址保持 `http://127.0.0.1:18791/plugins/conest-studio`，连接时输入第 6 节同一份 Gateway token。顶部有 **统一清单 / 任务工作台 / 共享记忆 / 全屏演示**。

到这里，终端 A 跑 OpenClaw + CoNest，终端 C 跑 DSH Web，终端 B 留作查看日志与 token。关闭终端 C 只会关闭 DSH Web；OpenClaw 中的 DSH Loop 由 CoNest 自己提供，不依赖该 Web 进程。

## 8. 功能演示步骤与预期结果

开始前，确认 OpenClaw 中的 CoNest Studio 已连接，页面能完整显示工具来源和执行状态。若已完成第 7 节，可同时打开 DSH 侧页面并选择“全屏演示”。完成连接后隐藏含 token 的终端窗口。以下步骤按顺序操作，每次等待“任务完成”再继续。

### 8.1 同一份统一清单

在 OpenClaw 的 CoNest Studio 点击“统一生态”。分别切换 OpenClaw、DSH、工具、市场，搜索 `dsh_grep`，再在市场分类选择任意一项、记住名称。

在市场分类查看条目来源链接、同步时间和目录指纹。2026-09-13 验收时总计 3,866 项、Market 3,627 项；本机实际数量取决于宿主目录和市场同步结果。

**可选双端对照：** 切到 DSH Web 的“统一清单”，搜索同一名称。两边应显示相同条目和状态。

**预期结果：** OpenClaw 插件、双方工具与 DSH Market 条目可在同一清单中检索。市场条目显示“可发现 · 未验证适配”；这一步验证目录接入，不验证市场插件安装或运行。

### 8.2 DSH Loop 调用 OpenClaw 工具和 DSH 工具

在工作台选择 **DSH Loop**，点击“混用双方工具”，或输入：

```text
使用 OpenClaw 的 read 读取 evidence.txt，再用 DSH 的 dsh_grep 搜索 CoNest，汇总两次工具返回的真实内容。
```

点击运行，在右侧“真实执行轨迹”中核对：

1. 任务完成事件的实际 Loop 为 `dsh`。
2. `read` 的来源为 `openclaw`，状态为 `completed`。
3. `dsh_grep` 的来源为 `dsh`，状态为 `completed`。

最终回答应来自本地 `evidence.txt`，包含 CoNest 相关内容。文件由启动器在 `demo-state/workspace` 下生成，标记为 `CONEST_BOTH_TOOLS_OK`。

**预期结果：** DSH 组织本次模型与工具循环，OpenClaw 的 `read` 和 DSH 的 `dsh_grep` 均返回实际文件内容。Loop 选择卡表示请求意图，实际执行身份以完成事件为准。

### 8.3 OpenClaw Loop 调用双方工具

选择 **OpenClaw**，运行同一条任务。检查实际 Loop 为 `openclaw`，并再次看到 `read` 与 `dsh_grep` 都成功。

**预期结果：** 切换为 OpenClaw Loop 后，双方工具仍可参与同一任务。模型可能在一轮中并行调用工具，也可能分成多轮；以实际 Loop、工具来源、完成状态和返回内容判断结果。

### 8.4 跨 Loop 共享记忆

选择 DSH Loop，点击“写入共享记忆”，运行：

```text
请记住：CoNest 演示的项目代号是青竹，汇报偏好为先结论、后证据。请确认记忆。
```

完成后，在“共享记忆”页确认记录已经出现，再切 OpenClaw Loop，点击“跨 Loop 召回”，运行：

```text
刚才记住的 CoNest 项目代号和汇报偏好是什么？请根据共享记忆回答。
```

**预期结果：** 回答包含“青竹”和“先结论、后证据”，轨迹出现记忆召回事件，共享记忆页存在对应记录。由于 `evidence.txt` 也包含项目代号，需同时核对汇报偏好、记忆记录和召回事件，确认回答使用了共享记忆。

每次点击运行都会新建 OpenClaw 会话；跨次召回依靠持久记忆注入。若已启用 DSH 侧展示入口，可在其“共享记忆”页核对同一记录。

### 8.5 可选：证明重启后记忆仍在

终端 A 按 Ctrl+C，退出后用同样命令和同一 `CONEST_DEMO_STATE` 重新启动。读取新的 Gateway token，重新连接已打开的 CoNest 页面，先查看记忆页，再用 OpenClaw Loop 询问汇报偏好。

本项验证需使用同一状态目录并保留原有 `memory.jsonl`。需要新建独立演示工作区时，可在启动命令前临时指定新的状态目录。

## 9. 自动验证真实模型流程

需要自动验证四段基础流程时，在终端 B 运行以下命令。检查使用独立端口和状态目录，演示工作区的记忆保持不变：

```bash
source "$HOME/conest-demo/env.sh"
CONEST_DEMO_STATE="$CONEST_HOME/live-check-$(date +%s)" \
CONEST_DEMO_PORT=18792 \
node "$CONEST_PLUGIN_DIR/dist/demo-studio.mjs" --live --verify
```

成功显示 `Studio acceptance passed`，相应目录生成 `acceptance.json`。此检查消耗真实模型额度，包含两种 Loop 混用工具、DSH 写记忆、OpenClaw 召回四段任务。已有最终安装包验收记录见 [验收结果](../reports/studio-0.6.2/RESULT.md)。

## 10. 日常启动、停止与文件位置

下次开机无需重新安装。终端 A 重新加载环境并运行第 6 节的 `demo-studio.mjs --live` 命令，再读取新的 token 连接页面。需要 DSH 侧展示时，再在终端 C 加载环境并运行第 7 节的 DSH `web` 命令。当前教程使用前台进程，未创建开机自启服务。

| 目录或文件 | 含义 |
|---|---|
| `~/conest-demo/env.sh` | 终端环境和路径，无 Key |
| `host/node_modules/openclaw` | 固定版本 OpenClaw |
| `install-state/extensions/dsh-bridge` | 原生安装的 CoNest 包及 DSH 客户端插件 |
| `dsh-runtime/deepseek-harness` | 可移动的冻结 DSH 运行包 |
| `credentials/deepseek.env` | 真实模型 Key，权限 600 |
| `demo-state/connection.json` | 当次 Gateway token、地址、启动器 PID |
| `demo-state/openclaw.json` | 启动器生成的实际运行配置；重启会重写 |
| `demo-state/workspace/evidence.txt` | 混用工具的样例文件；启动器重写 |
| `demo-state/studio/memory.jsonl` | MCP 持久记忆 |
| `demo-state/studio/activity.jsonl` | 工具、Loop、记忆的执行事件 |
| `demo-state/studio/market.json` | 市场目录快照 |
| `demo-state/studio/sessions` | DSH 会话持久化 |
| `demo-state/host` | 演示 Gateway 的 OpenClaw 状态 |
| `dsh-state` | 独立 DSH Web 的 profile 和状态 |

停止时在对应前台终端按 Ctrl+C。重启模型 transport 会刷新请求预算和 token，不清除共享记忆。关闭浏览器不会停止后端。

## 11. 常见问题

| 现象 | 处理方式 |
|---|---|
| `curl` 找不到，随后校验或解压提示文件不存在 | 先完成第 3.1 节，再重新执行第 3.2 节下载与解压 |
| Node 仍显示 v22 | 完成第 3.2 节，重新加载环境并执行 `hash -r`，确认 Node 路径与版本 |
| `openclaw` / `pnpm` 找不到 | 在当前终端重新 source `~/conest-demo/env.sh`，再检查 `node -v` |
| `EACCES` 或尝试写 `/root/...` | 不要用 sudo 启动；重新 source 环境，确认 `CONEST_DEMO_STATE`、`CONEST_CREDENTIAL_FILE` 已设为当前用户路径 |
| 平台不匹配、原生模块加载失败 | 核对 `uname -m` 为 x86_64、Node 为 24.15.0；不要使用 ARM 包或旧 Node |
| 提示 capability consent | 使用第 4 节完整安装命令，包含 `--accept-capabilities` |
| DeepSeek provider 要求另一版本 API | 确认安装 OpenClaw 2026.9.2，并使用包内启动器；不要手动升级 provider 到 latest |
| `Cannot find module`，或 DSH 提示 client bundle 未构建 | 重新校验、完整解压所提供 DSH 运行包；不要使用只含源码的旧归档代替它 |
| DSH 中没有 CoNest 标签 | 确认命令和 Web 进程都使用同一个 `DSH_HOME`；检查 Web profile 的 bundles 并重启 DSH |
| 401、令牌错误、页面重新要求连接 | 读取本次启动的 `demo-state/connection.json`；重启后的旧 token 不再有效 |
| 打开页面失败 | OpenClaw 对应终端 A；可选 DSH Web 对应终端 C。确认相应服务仍在运行，再检查下方连通性 |
| `EADDRINUSE` | 用 `ss -ltnp` 检查 18791/18801/18792，停止自己先前的演示进程；不要同时启动两份同端口服务 |
| Key 权限错误 | `chmod 600 "$CONEST_CREDENTIAL_FILE"`，确认文件里是 `DEEPSEEK_API_KEY=...` |
| 模型 budget exhausted | 在终端 A Ctrl+C 后重启；这是演示 transport 的每次启动请求上限 |
| 市场为空或显示缓存 | 检查到市场地址的联网情况，点击“同步市场”；缓存展示不是新鲜同步成功 |
| 原生 OpenClaw 聊天入口行为与 Studio 不同 | 本教程的双 Loop 演示入口是 CoNest Studio；它负责选择 runtime 和建立任务，不能把任意新聊天默认当作同一配置流程 |

查看连通性及日志：

```bash
source "$HOME/conest-demo/env.sh"
curl -f http://127.0.0.1:18791/health
# 仅在已启动可选 DSH Web 时检查此端口
curl -I http://127.0.0.1:18801
ss -ltnp | grep -E '18791|18792|18801'
tail -n 60 "$CONEST_DEMO_STATE/gateway.log"
tail -n 60 "$CONEST_DEMO_STATE/launcher.log"
```

排查时保留终端报错及相应日志，依据失败步骤核对版本、路径、连接信息与配置。

## 12. 依据与验证范围

固定版本、配置字段和 Loop 命令来自实际交付代码与安装验收；Node 二进制及校验文件使用 [Node 官方版本目录](https://nodejs.org/dist/v24.15.0/)。OpenClaw 支持 npm 安装，但其 [在线安装文档](https://docs.openclaw.ai/install) 随当前版本更新，本教程以已经验收的 2026.9.2 命令为准。

已验证：最终 CoNest tgz 经 OpenClaw 原生命令安装后，真实模型四段任务通过；DSH 分发包解压至另一处目录，以非 root 用户启动，并通过 DSH 自己的插件管理命令安装 CoNest 客户端。本机安装后需完成第 5 节自检；已有验收记录用于说明交付版本的验证范围，本机运行结果以实际检查为准。
