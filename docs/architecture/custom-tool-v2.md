# 自定义工具 v2 详细设计

## 目标

自定义工具不再等同于一段 `index.html`，而是一个可独立迁移、运行和继续扩展的工具包。页面、后台服务、爬虫、接口适配、Python 脚本以及工具专属的 MCP/Skill 辅助文件都保存在同一个工具目录中。

## 工具包结构

新建工具时创建以下结构：

```text
工具名/
├─ tool.json             # 入口、后台运行时、宿主能力权限
├─ index.html            # 页面入口，生成时最先流式输出
├─ README.md             # 目录约定和页面 API
├─ assets/               # CSS、JS、图片、字体等静态资源
├─ backend/              # Node.js/Python 长驻后台服务
├─ scripts/              # 一次性脚本和后台辅助模块
├─ mcp/                  # 工具专属 MCP 配置或说明
├─ skills/               # 工具专属 Skill 提示和辅助文件
└─ data/                 # 运行数据，不加入下一轮 AI 上下文
```

旧版 `tool.json` 会按纯静态工具兼容读取。v2 manifest 示例：

```json
{
  "kind": "tool",
  "version": 2,
  "entry": "index.html",
  "service": {
    "runtime": "node",
    "entry": "backend/server.mjs",
    "healthPath": "/health",
    "startupTimeoutMs": 15000
  },
  "permissions": {
    "mcp": ["server__tool"],
    "skills": ["skill-id-or-name"]
  }
}
```

`service.runtime` 支持 `none`、`node`、`python`。工具服务必须监听宿主注入的 `MOMO_TOOL_HOST` 和 `MOMO_TOOL_PORT`，并以 `MOMO_TOOL_ROOT` 定位当前工具目录，不能写死端口或绝对路径。

## 运行和切换

主进程运行器维护一个活动工具，状态为 `idle → starting → running/error`。

1. 选择工具时先停止上一个工具的预览服务器和后台子进程。
2. 宿主为后台服务动态申请 loopback 端口，避免与应用自身、其他工具和本机软件争用固定端口。
3. 使用 `tool.json` 中的健康检查等待服务就绪；启动超时、入口缺失或进程提前退出会转为错误状态。
4. 无论后台是否启动成功，宿主仍尽量启动静态预览，使用户能看到页面和错误提示。
5. 快速切换时，旧的排队/启动任务会被取消；删除、移动、重命名活动工具前先停止运行时。
6. 应用退出时立即关闭监听并终止子进程，避免后台残留。

每个活动工具另有一个动态端口的静态服务器。它只公开页面与前端资源；`tool.json`、`backend/`、`scripts/`、`mcp/`、`skills/`、`data/` 不允许直接从页面读取。

## 前后台通信

页面不感知后台真实端口，统一访问同源代理：

```js
const response = await window.momoTool.request('/api/items', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ query: 'example' }),
});
```

宿主将 `/__tool_api__/...` 代理到当前后台服务。这样切换工具或端口变化不会要求重写 HTML，也不会产生浏览器跨域问题。

## MCP 和 Skill 桥

预览服务器会向入口 HTML 注入受限的 `window.momoTool` 桥：

```js
await window.momoTool.callMcp('server__tool', { input: 'value' });
await window.momoTool.runSkill('skill-id-or-name', '用户输入');
```

调用通过 iframe `postMessage` 发往渲染进程。宿主同时校验消息来源、工具路径和 `tool.json` allowlist；未显式声明的 MCP/Skill 一律拒绝。Skill 桥不会接受页面传入的任意 shell commands。

## AI 多文件生成与流式预览

模型使用文件标记协议返回工具包：

```text
<<<MOMO_TOOL_FILE path="index.html">>>
<!doctype html>...
<<<MOMO_TOOL_FILE path="tool.json">>>
{...}
<<<MOMO_TOOL_FILE path="backend/server.mjs">>>
...
```

`index.html` 必须是第一个文件。每收到一批 token，渲染进程最多每 80ms 增量抽取一次尚未闭合的 HTML，并立即更新 `srcDoc` 预览。模型完成后才解析完整文件集合、做路径和体积校验、写入当前工具目录并重启运行时。

为了支持连续改写，下一轮会携带当前工具中的文本实现文件，包括 `index.html`、`tool.json`、后台、脚本及 MCP/Skill 辅助文件；运行数据、依赖目录、二进制和大文件会被排除。未遵守多文件协议的模型输出仍按传统单 `index.html` 兼容。

## “随手改”交互模型

`snapEdit.html` 继续作为可视化编辑器，编辑能力分为四层：

- 内容层：双击编辑普通文本；属性面板可修改按钮、链接、标签的嵌套文本，以及 `placeholder`、`alt`、`title`、`aria-label`、`value` 和 SVG text/tspan。
- 结构层：元素树选中父子节点；流式拖动可插入到目标之前、之后或内部；支持复制、删除、锁定、隐藏、组合、解组和同级图层排序。
- 布局层：支持 `display`、flex 方向/换行/对齐、grid 行列、gap、盒模型、定位、z-index；Alt 拖动把元素转为自由定位，并提供网格、参考线和智能吸附。
- 几何层：八方向缩放，多选对齐与分布，Shift 保持比例或锁定拖动轴。

编辑器内部保留撤销、重做、历史和快照。每次 DOM、文案或布局提交还会通过 `snapedit:change` 回传宿主；宿主据此更新未保存状态，保存时再主动拉取最终 HTML，避免内外状态不同步。

AI 生成期间不让半成品反复重置 SnapEdit 的撤销栈，而是切到专用实时预览；生成完成后再将完整 HTML 交给 SnapEdit 继续人工编辑。

## 安全和扩展边界

- 所有文件读写都进行工具根目录边界校验，拒绝绝对路径和 `..` 越界。
- AI 产物限制单文件 2 MiB、单次 20 MiB；上下文另有更小限额。
- 后台仅监听 `127.0.0.1`，使用无 shell 的子进程参数启动。
- MCP/Skill 按 manifest 精确授权，静态服务器隐藏后台源码和运行数据。
- Node/Python 服务入口是稳定扩展点；后续可在 `ICustomToolServiceConfig` 增加依赖安装策略、任务型脚本运行器或更细的网络权限，而无需改变工具树和页面协议。
