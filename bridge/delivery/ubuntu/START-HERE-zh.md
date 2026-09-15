# CoNest Ubuntu 演示交付包

**从这里开始。** 本包包含 CoNest 0.6.2 插件、插件源码、DSH Web 演示运行包、详细安装教程和独立设计说明。适用于 Ubuntu 24.04 LTS、x86_64 普通用户；Node 和 OpenClaw 按教程联网安装。

## 首次安装

1. 把整个 ZIP 下载到 Ubuntu 电脑，在文件管理器中右键“提取到此处”。不要只解压里面的插件 tgz。
2. 进入解压后的 `conest-ubuntu-demo-0.6.2` 文件夹，右键空白处“在终端打开”，执行：

```bash
bash prepare.sh
```

3. 看到“校验通过”，双击打开 [Ubuntu 本地安装与演示教程](docs/ubuntu-installation-demo-zh.html)，**从第 3 节开始**依次执行。准备脚本已完成第 2 节的文件复制。若浏览器未自动打开 HTML，右键选择 Firefox 或 Chrome。
4. 教程第 3–6 节依次完成 Node、OpenClaw、CoNest 插件、自检和 DeepSeek API Key 配置。第 7 节为可选的 DSH 侧展示入口安装；仅演示 OpenClaw 内的 DSH 能力时可跳过。命令按块复制到终端执行；系统安装步骤可能要求输入 Ubuntu 登录密码。
5. 按第 8 节操作统一清单、双 Loop、双方工具和共享记忆；第 9 节可自动验证四段基础流程。

首次安装需要联网；真实模型调用需要一份可调用 `deepseek-v4-flash` 的 DeepSeek API Key。本包未包含 Node 或 OpenClaw 安装包。DSH Web 已带运行依赖，不需要重新构建；CoNest 用 OpenClaw 原生插件命令安装。

## 日常启动

以下快捷脚本用于**已经按教程完成安装**的电脑。在解压目录打开终端，启动 OpenClaw 并保持终端打开：

```bash
# 终端 A：OpenClaw + CoNest + 模型转发服务
bash start-openclaw.sh
```

```bash
# 可选：另开终端启动 DSH Web，仅用于双端对照展示
bash start-dsh.sh
```

打开 [OpenClaw](http://127.0.0.1:18791)，从侧栏进入 CoNest Studio。另开终端，按教程第 6 节读取 Gateway token 并连接页面。若启动了可选的 [DSH Web](http://127.0.0.1:18801)，进入 Settings → Plugins → CoNest 统一生态，使用同一个 token 连接。每次重启 OpenClaw 后需读取新 token；模型 Key 与这个 token 是两回事。

关闭服务时，在对应终端按 Ctrl+C。不要同时启动教程命令和同一服务的快捷脚本。每次真实模型启动最多 12 次 API 请求，预算用完后重启 OpenClaw 服务；已有记忆保留。

## 功能演示顺序

| 顺序 | 操作 | 预期结果 |
|---|---|---|
| 1 | 在 OpenClaw 中查看统一清单；可选在 DSH 中对照同一条目 | 目录可检索，双端条目一致；市场可发现不等于已安装 |
| 2 | 选择 DSH Loop，执行教程里的混合工具任务 | 实际 Loop 为 DSH，调用 OpenClaw 的 read 和 DSH 的 dsh_grep |
| 3 | 切换 OpenClaw Loop，执行同一任务 | 实际 Loop 为 OpenClaw，同样调用双方工具 |
| 4 | DSH 写入偏好，再用 OpenClaw 召回 | 记忆页出现记录，另一个 Loop 使用该记录 |
| 5（可选） | DSH 入口切换全屏，展示轨迹与记忆 | 两个宿主共享相同插件服务和数据 |

具体提示词、预期结果和故障排查见详细教程。当前任务验证基础集成链路；任意 DSH 市场插件的通用安装、执行和复杂业务任务尚未完成验收。完整设计、执行边界和已有验收范围见 [CoNest 当前设计说明](docs/conest-design-zh.html)。

## 交付内容

| 位置 | 内容 |
|---|---|
| `docs/` | 两份文档的 HTML 与 Markdown 版本，HTML 可离线阅读 |
| `releases/delivery/` | 已验证的 CoNest 插件 tgz 和 SHA256 |
| `releases/ubuntu-demo/` | 已构建的 DSH Web 运行包、来源说明和 SHA256 |
| `src/`、`scripts/`、`test/`、`companions/` | 本项目插件代码、脚本、测试及 DSH 界面插件 |
| `reports/studio-0.6.2/` | 安装、双 Loop、工具、记忆和界面的验收记录 |
| `reports/ubuntu-tutorial/` | DSH 迁移到新目录、普通用户运行和浏览器验证记录 |
| `SHA256SUMS` | 外层包内所有文件的完整性清单 |

[源码说明](SOURCE-NOTES-zh.html) 解释代码位置及开发依赖。根目录其他英文说明保留项目历史背景；**本次从零安装只跟随 `docs/ubuntu-installation-demo-zh.html`**。
