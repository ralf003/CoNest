# 现在演示

本页地址与路径对应当前开发服务器。在你自己的 Ubuntu 电脑安装，请使用 [Ubuntu 本地安装与演示教程](docs/Ubuntu本地安装与演示教程.md)。

使用 **OpenClaw 2026.9.2 / CoNest 0.6.2 / DSH rc.5 / 真实 DeepSeek Flash**。

- OpenClaw：http://127.0.0.1:18791 ，左侧 **CoNest Studio**。
- Studio 直达：http://127.0.0.1:18791/plugins/conest-studio 。
- DSH：http://127.0.0.1:18801 ，Settings → Plugins → **CoNest 统一生态** → **全屏演示**。
- 两边的 Gateway token 取自 `/root/.local/state/conest-demo/connection.json`。不要将其投屏或发给无关人员。OpenClaw 受限 iframe 不保存令牌，重新进入需再次连接。

如果浏览器在另一台电脑，通过当前服务器的 SSH 连接转发 18791 和 18801：`ssh -L 18791:127.0.0.1:18791 -L 18801:127.0.0.1:18801 <你的服务器>`，然后打开上述地址。

## 投屏顺序

1. OpenClaw 左侧 CoNest Studio → 统一生态，展示完整同源目录；切到 DSH 全屏统一清单，显示同样的数据。现场按市场同步结果显示数量，验收时为 3,866 项，其中 DSH Market 3,627 项。
2. 任务工作台选择 **DSH Loop**，点击“混用双方工具”，运行。轨迹显示 **OpenClaw read** 和 **DSH dsh_grep** 均完成。
3. 切 **OpenClaw Loop**，运行相同任务，展示双方工具再次完成。
4. DSH Loop 点击“写入共享记忆”并运行；切 OpenClaw Loop 点击“跨 Loop 召回”并运行。最后展示共享记忆页。

模型使用官方 API，当前演示 transport 每次启动最多 12 次请求。四步通常消耗约 7–10 次；预算耗尽时重启演示服务。市场条目表示可发现，不等于全部已安装或已验证运行兼容。这个限定也显示在清单中。

## 安装包

最终交付：`releases/delivery/local-conest-connector-0.6.2.tgz`，同目录提供 SHA256。

```bash
openclaw plugins install --force --accept-capabilities ./local-conest-connector-0.6.2.tgz
```

这两个参数分别确认信任本地包与接受声明的插件能力。完整现有 Gateway 配置、独立工作区启动方式见 [STUDIO.md](./STUDIO.md)。运行结果与截图见 [reports/studio-0.6.2](./reports/studio-0.6.2)。
