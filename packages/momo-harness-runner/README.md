# 独立 Harness 运行核心

从仓库根执行 pnpm harness:build，产出 dist。依赖固定在 core-lock.json 与独立 runtime-package-lock.json，安装与桌面应用依赖分开。

运行目录包含官方 dsh、匹配 Node、profile、外部桥接插件、许可证和 runtime.json 完整性摘要。Electron 构建前会准备目录，并作为 harness-builtin 放在 resources 下、asar 外。开发启动前同样会准备运行目录。

更新 npm 核心：修改 core-lock.json 的 version，重新构建并运行 pnpm harness:test。部署替换：在 AI 输入框“权限”中导入完整 dist 目录，宿主校验后启动真实 dsh 执行无密钥契约验证，再启用新运行包。

宿主契约位于 @momo/agent-contracts。上游 API 变化只需修改本包 plugins 中的桥接插件。不要把上游内部类型导出到业务 UI。referenceCommit 是审阅源码标识，不保证 npm 产物对应该提交。

本次不包含历史迁移或升级回滚。工具箱无版本字段，也不兼容旧工具格式。
