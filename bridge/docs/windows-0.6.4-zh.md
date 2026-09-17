# CoNest 0.6.4：Windows 11 演示

适用 Windows 11 x64。安装需要访问 nodejs.org 和 npm；解压目录建议使用较短路径，例如 `C:\CoNest`。无需 WSL、Ubuntu 或预装 Node。安装器下载并校验 Node 24.15.0，独立安装 OpenClaw 2026.9.2；不会修改已有 OpenClaw 配置。

在解压目录打开 PowerShell：

```powershell
powershell -ExecutionPolicy Bypass -File .\install.ps1
powershell -ExecutionPolicy Bypass -File "$HOME\conest-demo-0.6.4\start.ps1" -Verify
powershell -ExecutionPolicy Bypass -File "$HOME\conest-demo-0.6.4\start.ps1"
```

默认使用本地确定性模型响应，**不需要 API Key，也不会调用付费模型**。它只复现预设场景，不代表真实模型推理能力。Gateway、Cordis、DSH Loop 和业务组件实际运行。

浏览器打开 `http://127.0.0.1:18791/plugins/conest-studio`。另开 PowerShell 获取登录令牌：

```powershell
powershell -ExecutionPolicy Bypass -File "$HOME\conest-demo-0.6.4\start.ps1" -Connection
```

## 建议演示顺序

1. 点击“采购附件检查”，由 OpenClaw 调用 Cordis 业务组件，展示检查依据及 A-1 规则版本。
2. 切换 DSH Loop，执行相同检查；两个执行器使用同一组件服务。
3. 点击“混用双方工具”，展示 OpenClaw read 与 DSH grep 参与同一任务。
4. 点击“写入共享记忆”，再切换 Loop 点击“跨 Loop 召回”。

要突出“不采用 DSH 也能增强 OpenClaw”，先 Ctrl+C 停止演示，再运行：

```powershell
powershell -ExecutionPolicy Bypass -File "$HOME\conest-demo-0.6.4\start.ps1" -Core
```

此模式不启动 DSH 组合，不加载 DSH 内置组件，不访问 DSH Market；使用原生 OpenClaw Loop 和办公组件。发行包仍包含可选 DSH 代码，尚未拆成独立 npm 包。

## 展示依赖图切换

```powershell
powershell -ExecutionPolicy Bypass -File "$HOME\conest-demo-0.6.4\start.ps1" -Components
```

终端依次展示：禁止 DSH 模块加载仍可运行；更新知识服务配置后旧调用保持 A-1、新调用使用 B-2；候选配置失败保持当前版本；停用服务阻断依赖者，恢复服务后自动可用。结果保存为安装目录下的 `components-acceptance.json`。

一致性范围是**单次已接纳组件调用的依赖图**，不是整个 Agent 任务、数据库事务或外部副作用回滚。采购规则仅用于演示。

## 实际进程与验证边界

常驻应用进程是 Gateway 和 CoNest Host。Host 内部包含 Management、Cordis 组件 Runtime 与可选 DSH 组合；DSH Agent/Session 不再运行于 Gateway，也不启动 DSH CLI。演示启动器同时提供本地模型 HTTP 服务；Bash、MCP 等工具仍可能按需启动子进程。

`-Verify` 验证完整双 Loop 流程，`-Verify -Core` 验证 OpenClaw 独立增强流程。`verify-windows.ps1` 另外验证 Windows 原生 DSH 文件、搜索、记忆等能力。原生 Windows CI 的操作系统版本会记录在验证报告中；Windows Server CI 通过不能被写成已在 Windows 11 桌面验收。

## 可选真实模型

按 `configure-key.ps1` 提示保存 DeepSeek Key，再运行 `start.ps1 -Live`（可叠加 `-Core`）。此模式会使用付费模型。不要把 credentials、demo-state 或 Gateway 令牌提交到 GitHub。

关闭时在启动终端按 Ctrl+C。完整日志位于安装目录的 `demo-state`；`-Verify` 为每次检查建立独立 `check-state-*` 目录。
