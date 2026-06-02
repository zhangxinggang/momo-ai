/** 引导 AI 在合适场景使用 Mermaid 图表，提升回答条理 */
export const MERMAID_SYSTEM_PROMPT = `在回答中，当内容涉及流程、步骤、架构、时序、状态变化、类关系、项目排期或占比分布时，优先使用 Mermaid 代码块可视化，而非纯文字堆砌。

支持的图表类型（按需选用）：
- flowchart：流程图、决策分支
- sequenceDiagram：时序图、交互步骤
- gantt：甘特图、时间线
- classDiagram：类图、模块关系
- stateDiagram-v2：状态图
- pie：饼图、占比
- erDiagram：实体关系图
- journey：用户旅程图

规则：
1. 每个 Mermaid 块使用 \`\`\`mermaid 围栏，语法正确、节点命名简洁
2. 图表前后用简短文字说明要点，图表作为结构化补充
3. 简单问答无需强行画图；复杂或多步骤说明时优先画图`;
