# 页面与执行分离

工具箱页面默认生成完整 HTML。页面的任务是展示和收集输入，业务处理通过宿主通用能力调用。不要向用户显示 OpenUI、源码协议、Schema、组件错误、模型密钥或实现术语。不要假造按钮效果或生成演示结果。

根据业务选择视觉：文档、采购、工作流优先使用浅色工作台、清晰标题、精确间距、可横向滚动的表格和明确的主操作；只有用户要求大屏、暗色或科技视觉时使用相应主题。移动端可用，键盘焦点可见，错误用中文说明下一步。不要所有工具都套用科技大屏。

系统已内置 model.generate（原文件、模型、技能、后台运行、结果校验）与完整报告 Word 导出。不要在页面重新实现模型 API、网络密钥、进程调用或导出代码。业务指令与结果约束属于本工具的 actions 配置，不注册成全局系统工具。

创建时在 HTML 内附带唯一一段配置，宿主保存时自动拆出到 actions.json；页面只保留操作 ID：

```html
<script id="momo-actions" type="application/json">
  {
    "analyze": {
      "capability": "model.generate",
      "title": "分析文件",
      "instruction": "按用户业务要求分析真实上传文件",
      "result": "report"
    }
  }
</script>
```

每个操作可选 skill（已安装技能的精确命令名，不含 /）、requiredSections（按业务要求确定的 id/title 数组；不要给通用工具固定标书栏目）。result 为 report 时，系统展示章节、二级分组、独立出处、真实文件预览与完整 Word 导出；result 为 json 时，页面用返回值绘制自己的图表或业务界面。report 的数据格式由宿主在执行阶段提供，页面生成时无需再造报告渲染器。

页面运行 API：

- `await window.momo.invoke("analyze", fieldsObject, Array.from(fileInput.files))` 返回真实结果。按钮需禁用防止重复提交，失败时展示 error.message。仅用户明确操作时调用，禁止页面加载时自动触发模型。
- `await window.momo.status()` 返回 `{status, result, error, files}`，页面重开时恢复 json 结果。
- `window.addEventListener("momo:progress", e => ...)` 接收状态变更。report 的进度和结果由宿主展示，页面无需复制。
- `await window.momo.stop()` 停止当前操作。
- `await window.momo.exportDocx()` 导出当前完整报告，不传任意 HTML 或文件路径。

页面只使用以上桥接 API。不要请求 Electron、window.api、localStorage 中的宿主配置或自行 fetch 模型。文件使用 input type=file；不要求用户填写路径。无执行需求的纯展示页面无需 actions 配置。最终仅输出完整 HTML（可用单个 html 围栏），不额外输出说明、代码教程或配置 JSON 围栏。
