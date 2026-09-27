# 独立 Harness 运行核心

从仓库根执行 pnpm harness:build，产出 dist。依赖固定在 core-lock.json 与独立 runtime-package-lock.json，安装与桌面应用依赖分开。

运行目录包含官方 dsh、匹配 Node、profile、外部桥接插件、许可证和 runtime.json 完整性摘要。开发启动前会准备完整运行目录；AIM Windows 构建另外按实际 profile 依赖闭包生成精简生产 staging，压缩 JS 并重新生成摘要，通过真实 CLI 启动校验后生成整块压缩的 tar/Brotli payload，封装成 `resources/harness-builtin.asar`。首次使用时宿主按 `storage.json` 流式解压、校验原文件摘要并写入用户数据缓存，已有有效缓存直接复用。详见 [Windows 打包拓扑](../../docs/architecture/electron-windows-packaging.md)。

更新 npm 核心：修改 core-lock.json 的 version，重新构建并运行 pnpm harness:test。部署替换：在 AI 输入框“权限”中导入完整 dist 目录，宿主校验后启动真实 dsh 执行无密钥契约验证，再启用新运行包。

宿主契约位于 @momo/agent-contracts。上游 API 变化只需修改本包 plugins 中的桥接插件。不要把上游内部类型导出到业务 UI。referenceCommit 是审阅源码标识，不保证 npm 产物对应该提交。

本次不包含历史迁移或升级回滚。工具箱无版本字段，也不兼容旧工具格式。
