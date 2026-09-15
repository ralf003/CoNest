# CoNest 0.6.3 多平台适配设计与验证

0.6.3 为多平台候选版，保留 OpenClaw 2026.9.2 与 DSH rc.5 的业务集成机制。本次改动面向 Red Hat 8 系 Linux x64 与 Windows x64 的交付、启动和运行依赖。操作步骤见 [安装演示教程](rhel8-windows-installation-demo-zh.md)。

## 1. 0.6.2 基线备份

多平台代码修改前已生成独立备份，目录名为 `conest-0.6.2-before-multiplatform-20260913T120145Z`。归档包含 634 个文件，覆盖插件源码、构建产物、教程 Markdown/HTML、交付安装包、演示 ZIP、截图与验收记录；排除开发 node_modules、用户凭据和私有运行状态。交付包内已经包含相应运行依赖。

备份归档 `conest-0.6.2-code-docs-delivery.tar.gz` 为 464,348,889 字节，已逐文件回读核对 FILES.json；整个归档的 SHA256 为：

```text
56fed995d9dcaac9d4a2d534ade5213c256a20741ccd04e06bbd8ba568f7bd6f
```

0.6.2 的插件 tgz、Ubuntu 整体 ZIP 与原验收记录仍保留；0.6.3 使用新的发布目录和默认安装目录。

## 2. 改动与原因

| 部分 | 0.6.2 情况 | 0.6.3 改动 |
|---|---|---|
| 发布目标 | 固定 Linux x64，复制开发机依赖 | 显式 linux-x64 / win32-x64 目标，按 os/cpu/libc 筛选依赖并验证目标包齐全 |
| Linux PTY | 原模块要求 glibc 2.34 | 在 Red Hat UBI 8.10 中重编译相同 node-pty 源码，所需 glibc 最高为 2.28 |
| Windows 原生依赖 | 未收集 Windows 变体 | 打包 Windows sharp、Koffi、ripgrep 与 node-pty 的 Windows N-API 预构建文件 |
| DSH Windows ACL runner | bundle 外入口未独立交付 | 保留其包及运行依赖，满足运行时 import.meta.resolve 的独立入口解析 |
| 默认状态与凭据路径 | 演示启动器含开发机 /root 默认路径 | 默认从用户主目录推导，保留环境变量覆盖 |
| 权限 | 依赖 POSIX mode / uid | Linux 保持原校验；Windows 使用 ACL 保护目录并检查凭据访问身份 |
| 进程停止 | SIGTERM / SIGKILL | Windows 使用 taskkill 的进程树停止方式，避免只停止父进程 |
| 本地组件控制 | Unix socket 与文件权限 | Windows named pipe 加私有锁文件 nonce 认证；Linux 保持 Unix socket |
| 子进程环境 | 部分变量名按 POSIX 大小写匹配 | 保留 Windows Path/SystemRoot/用户目录变量，仍移除模型 Key 和 Gateway token |
| 安装体验 | 多段人工环境配置 | 两个平台各提供入口脚本，统一自动安装 Node、宿主和原生插件；日常启动无需手写环境变量 |

目标包各自携带已选择的原生依赖。安装脚本根据当前平台选包，用户无需在演示电脑上编译 node-pty。安装时仍需要联网获取 Node、OpenClaw 和宿主检查所需依赖。

## 3. 实际验证结果

以下结果区分组件运行、宿主集成与真实模型，避免把兼容层或静态检查等同于目标系统验收。

| 检查 | 结果 | 说明 |
|---|---|---|
| TypeScript 类型检查 | 通过 | 插件、适配代码和测试 |
| 回归测试 | 80 项通过 | 含原有授权/生命周期测试及新增平台、环境变量、私有凭据检查 |
| Linux ELF 依赖检查 | 通过 | 随包相关 ELF 的 GLIBC 符号要求不高于 2.28；node-pty 为 2.28 |
| UBI 8.10 组件运行 | 通过 | 实际 DSH read、grep、DSH Loop 和重启后记忆 |
| UBI 8.10 原生插件安装 | 通过 | OpenClaw plugins install 安装平台候选包，宿主 peer 链接成功 |
| UBI 8.10 双 Loop 自检 | 通过 | 安装目录启动，四段任务、双方工具和共享记忆；模型决策为 fixture |
| UBI 8.10 真实模型演示 | 通过 | 四段任务，7 次 DeepSeek API 请求；实际 Loop 与双方工具完成事件均核对 |
| Windows 版 Node 组件运行 | 通过（Wine） | 使用真正的 win32 Node、Windows 原生依赖和 ripgrep.exe，完成 DSH 工具、Loop 与记忆重启测试 |
| Windows OpenClaw CLI 版本命令 | 通过（Wine） | 2026.9.2 正常输出版本 |
| Windows OpenClaw 插件安装 | Wine 中未通过 | 宿主无法取得 plugin lifecycle lease；尚不能据此判断原生 Windows 的结果 |
| PowerShell 安装脚本语法 | 通过 | 使用 PowerShell 自身 Parser 检查；不是 Windows ACL 的实机验证 |
| 原生 Windows 完整安装、ACL、双 Loop、界面 | 待验收 | 随包提供 verify-windows.ps1，并保留 Windows CI 工作流 |

UBI 8.10 是 Red Hat 官方用户空间，glibc 为 2.28；此次运行共享当前机器的 Linux 6.8 内核，不替代公司定制 Red Hat 8 内核和桌面环境的验证。Windows 组件检查使用 Wine，不能标为已通过原生 Windows 完整验收。

记录位于 `reports/multiplatform-0.6.3/`，包括原生安装日志、fixture 与 live 的独立记录、Windows 兼容层结果和 ELF 检查。没有将 0.6.2 的旧验收记录改名充当本版证据。

## 4. 保留的能力边界

当前默认演示开放 OpenClaw 的 read/session_status 与 DSH 的读取、搜索、记忆查询；自动记忆 hook 完成写入。双方 Loop 仍通过 OpenClaw 当前任务允许的工具表执行，不因多平台改动增加权限。

DSH Bash、PTY 交互、Windows ACL 沙箱、Linux bwrap/Landlock 属于进一步的系统能力。本次没有用取消沙箱、放宽授权或替换为模拟工具的方式绕过平台限制。RHEL 8 的内核沙箱条件、Windows Bash 与交互终端不在已通过的核心演示验收范围内。

统一清单展示 DSH Market 的可发现条目；本次没有新增任意市场第三方插件的一键安装与执行适配。独立 DSH Web 的平台分发包也不属于本次候选 ZIP；其界面 companion 源码仍提供。

## 5. 复现与发布

在原冻结开发工作区中，使用 `scripts/prepare-native.mjs` 收集目标依赖，再用 `scripts/pack-release.mjs --target ... --native-dir ... --out ...` 生成对应包。Linux 需提供在 glibc 2.28 环境构建的 node-pty 二进制；准备脚本检查其 GLIBC 符号要求。包中 `runtime-lock.json` 保留平台、最低 libc 和原生资产来源。

`dist/probe-platform.mjs` 直接检查真实 DSH 运行组件；`dist/demo-studio.mjs --verify` 检查完整 OpenClaw 集成。Windows 机器安装后，运行随包 `verify-windows.ps1` 可串联这两项检查。原生 Windows 验收通过前，该目标保持候选状态。

本文使用的 Node 平台基线来自 [Node 24.15.0 官方构建说明](https://github.com/nodejs/node/blob/v24.15.0/BUILDING.md)，其他版本可能有不同系统要求。
