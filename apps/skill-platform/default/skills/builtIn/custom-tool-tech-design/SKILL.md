---
name: custom-tool-tech-design
description: Design or refine AIM custom-tool OpenUI/HTML interfaces with an adaptive, polished technology-forward visual system. Use for custom tools, dashboards, command centers, data-heavy screens, or requests for 酷炫/科技感; do not force this style when the user explicitly asks for another visual direction.
---

# 自定义工具科技视觉设计

为 AIM 自定义工具生成有明确数据叙事、精密层级和完成度的科技风界面。科技感来自结构、信息和细节，不等于把所有页面做成同一套蓝色大屏。

开始设计或生成代码前，完整阅读 [references/generation-guidance.md](references/generation-guidance.md)。

## 工作方式

1. 从用户需求提取业务场景、主要决策、关键数据关系、交互任务、信息密度和目标屏幕。
2. 在内部比较至少两种内容驱动的布局拓扑，选择最能突出主要任务的一种；不要默认套用“标题 + 四个指标卡 + 2×2 图表”。
3. 先确定颜色、字体、间距、面板层级和一个标志性视觉，再实现页面。用户明确指定的品牌、颜色或风格始终优先。
4. 图表只用于回答问题，并根据趋势、比较、组成、分布、流程、空间或排行选择类型。图标使用统一 SVG 图标体系，不使用 emoji 充当界面图标。
5. 根据输出模式实现：
   - 在 AIM 自定义工具对话框中显式调用 `/custom-tool-tech-design` 时，优先生成 HTML，以便真实实现深色主题、地图/拓扑、纹理、光效和响应式构图；用户明确要求 OpenUI 时仍遵从用户。
   - OpenUI：只使用当前 OpenUI prompt 声明的合法组件和属性，通过组件组合、比例、层级与数据叙事表达风格，不虚构 CSS 能力。输出前核对每个变量引用都有完整声明。
   - HTML：输出完整单文件页面，使用 CSS 变量形成视觉系统，确保 iframe 内可独立运行、全高、自适应且无横向溢出。
6. 完成前按参考文档中的质量门槛自检，删除不服务于信息或交互的装饰。

## 边界

- 默认方向是克制而有张力的科技视觉，不强制纯深蓝，也不复制参考图构图。
- 普通表单、单任务工具和内容页不应被强行改造成数据大屏；保留任务主表面，只借用精密的色彩、边框、排版和反馈语言。
- 当用户要求温暖、自然、纸质、极简、品牌化等其他方向时，保留质量标准和动态布局方法，但让其明确视觉意图覆盖默认科技色调。
