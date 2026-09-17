# 无版本 Harness 工具示例

将整个 harness-calculator 目录复制到工具箱的本地工具根目录并刷新工具箱。在 AI 对话中提到“共享求和示例”“harness-calculator”或“求和”，本轮会自动开放并优先使用 `toolbox.harness-calculator.sum`；也可通过项目工具策略长期开放。

工具页面与 actions/sum.mjs 都调用 lib/sum.mjs。调用输入 {"a":2,"b":3}，结构化输出 {"value":5}。

Node action 即使只进行计算也声明 execute：它执行工具包代码，每次调用需用户审批。修改后下轮重新发现文件摘要，不增加版本字段。此示例不需要额外 npm 依赖。
