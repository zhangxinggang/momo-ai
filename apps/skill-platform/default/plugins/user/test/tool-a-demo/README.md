# 自定义工具

这个目录是一个独立、可迁移的工具包，工具所需的页面、服务、脚本和数据都应保存在这里。

- `index.html`：页面入口，可通过 `/assets/...` 引用本地资源。
- `backend/`：Node.js 或 Python 后台服务。监听端口必须读取 `MOMO_TOOL_PORT`，地址使用 `MOMO_TOOL_HOST`。
- `scripts/`：一次性 Python/Node 脚本或后台服务调用的辅助脚本。
- `mcp/`、`skills/`：工具专属的 MCP/Skill 配置、提示或辅助文件。
- `data/`：工具运行数据；`assets/`：前端静态资源。
- `tool.json`：入口、后台服务和 MCP/Skill 权限声明。

页面请求后台时使用 `window.momoTool.request('/api/path', options)`，不要写死端口。
页面调用宿主能力时使用 `window.momoTool.callMcp(name, args)` 或
`window.momoTool.runSkill(idOrName, input, options)`，并在 `tool.json` 的 permissions 中显式声明。
