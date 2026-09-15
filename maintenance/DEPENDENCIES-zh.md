# 依赖来源与可复现构建

两个维护分支使用同一个开发 SDK 和固定的 npm 版本，无需原开发机、Ubuntu 系统快照或手工创建本地 `link:` 路径。

## 依赖如何获取

| 部分 | 来源与固定方式 |
|---|---|
| OpenClaw | npm `openclaw@2026.9.2`，本地开发依赖；不跟随 latest。 |
| DSH / Cordis | [开发 SDK Release](https://github.com/zyw02/CoNest/releases/tag/dev-sdk-20260915)，下载地址、归档和清单 SHA256 固定在 `sdk.lock.json`。 |
| 其余 JavaScript 与原生库 | npm 固定直接版本，传递依赖由 `bridge/pnpm-lock.yaml` 固定。原生包按安装机的平台获取或构建。 |
| node-pty 兼容补丁 | `bridge/patches/node-pty@1.1.0.patch`，保留原开发快照的 spawn-helper 路径兼容修改，由 pnpm 校验并应用。 |

目前使用的 DSH `0.1.0-rc.5` 叶子包未发布到 npm；我们保留其已验证实现，没有擅自升级到其他 DSH 版本。SDK 是 CoNest 整理的开发依赖，不是官方 DSH 发行版。原快照没有可核验的上游提交号，因此这里固定并验证文件内容，不声称能从某个上游 Git commit 重建。

SDK 包含 62 个所需包的源码、JavaScript 运行库、类型定义及许可证，压缩后约 2.3 MB。包的 `src/` 与 `lib/` 保留快照字节；原清单保存为 `package.upstream.json`。安装用清单将 `workspace:` 约束解析为原版本、去除开发依赖及构建脚本，并保留所需 helper 权限修正脚本。`sdk.json` 记录内容散列和变换范围。

**不包含** `node_modules`、Ubuntu 系统文件、原生二进制、API Key、会话、个人记忆或完整 DSH CLI/Web 应用。第三方代码保留自身许可证；根目录 DSH MIT 许可证及第三方通知随 SDK 分发。

## Bootstrap 的行为

```bash
node maintenance/bootstrap.mjs
pnpm --dir bridge install --frozen-lockfile
pnpm --dir bridge run build
```

Bootstrap 先校验归档 SHA256，解压到临时目录，再核对 SDK 清单与每个文件，最后写入被 Git 忽略的 `.vendor/dsh/`。重复运行校验现有文件；不会覆盖不匹配或被修改的 SDK。普通 npm 安装仍需要网络与系统原生编译工具。

离线机器可以从另一台机器带入同一个 SDK 文件（npm 包缓存需另行准备）：

```bash
node maintenance/bootstrap.mjs --archive /path/to/conest-dsh-sdk-20260915.tar.gz
```

维护者可使用冻结原件，或已下载 SDK 中的原始源码与清单，重新生成相同归档：

```bash
python3 maintenance/export-sdk.py --source .vendor/dsh --output /tmp/conest-sdk-export
```

更新 SDK 时发布新的 Release 文件与标识、修改 `sdk.lock.json`、重新生成 pnpm 锁文件并运行两个分支的构建/测试。不要替换旧 Release 文件并保留旧校验值，也不要修改 `v0.6.2` 原始标签。

## 范围

CI 在 Linux x64 上从干净克隆执行 Bootstrap、冻结锁文件安装、构建与测试。Studio 和双 Loop 集成验证不调用付费模型。Windows / Red Hat 8 的发行包仍需要对应平台资产和专门验收；普通开发构建不自动具备旧版发行包的跨平台保证。

`pack-dsh-demo.mjs` 是旧的完整 DSH Web 演示打包工具，额外需要 `CONEST_DSH_SOURCE` 指向独立构建的上游完整工作区；它不是构建 CoNest 插件的前提。历史交付 ZIP 的生成还需要原始交付资产，未混入干净克隆的快速开始。
