import { z } from 'zod/v4';

// System capabilities are intentionally business-neutral. A page names actions;
// its separate manifest owns the instructions, skill and required result sections.
const name = z.string().regex(/^[a-zA-Z][a-zA-Z0-9_-]{0,63}$/);
const text = z.string().max(100_000);
const row = z.object({ cells: z.array(text).min(1).max(30), source: text });
export const reportBlockSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('text'), title: text.optional(), text, source: text.optional() }),
  z
    .object({
      type: z.literal('table'),
      title: text.optional(),
      columns: z.array(text).min(1).max(30),
      rows: z.array(row).max(10_000),
    })
    .superRefine((block, ctx) => {
      block.rows.forEach((row, i) => {
        if (row.cells.length !== block.columns.length)
          ctx.addIssue({
            code: 'custom',
            path: ['rows', i, 'cells'],
            message: '表格列数与内容不一致',
          });
      });
    }),
  z.object({ type: z.literal('file'), title: text, sourceId: z.string().min(1), source: text }),
]);
export const reportSchema = z
  .object({
    title: z.string().min(1).max(500),
    summary: text,
    sections: z
      .array(
        z.object({
          id: name,
          title: z.string().min(1).max(200),
          emptyMessage: text,
          groups: z
            .array(
              z.object({
                id: name,
                title: z.string().min(1).max(200),
                blocks: z.array(reportBlockSchema).min(1).max(200),
              }),
            )
            .max(100),
        }),
      )
      .min(1)
      .max(100),
  })
  .superRefine((report, ctx) => {
    if (new Set(report.sections.map((x) => x.id)).size !== report.sections.length)
      ctx.addIssue({ code: 'custom', message: '报告章节标识重复' });
    for (const section of report.sections) {
      if (new Set(section.groups.map((x) => x.id)).size !== section.groups.length)
        ctx.addIssue({ code: 'custom', message: '报告分组标识重复' });
    }
  });
export type ToolReport = z.infer<typeof reportSchema>;

export const toolPageActionsSchema = z
  .record(
    name,
    z.object({
      capability: z.literal('model.generate'),
      title: z.string().min(1).max(200),
      instruction: z.string().min(1).max(40_000),
      skill: z.string().max(200).optional(),
      result: z.enum(['report', 'json']),
      requiredSections: z
        .array(z.object({ id: name, title: z.string().min(1).max(200) }))
        .max(100)
        .optional(),
    }),
  )
  .refine((value) => Object.keys(value).length <= 20, '页面操作不能超过 20 个');
export type ToolPageActions = z.infer<typeof toolPageActionsSchema>;
export type ToolPageAction = ToolPageActions[string];

export function parseToolPageActions(value: unknown): ToolPageActions {
  const result = toolPageActionsSchema.safeParse(value);
  if (!result.success) throw new Error('工具执行配置无效：请检查操作名称、指令和结果类型');
  return result.data;
}

/** Generation envelope only: persisted HTML never contains model instructions. */
export function splitToolPage(content: string, supplied?: ToolPageActions) {
  const matches = [
    ...content.matchAll(
      /<script\b(?=[^>]*\bid=["']momo-actions["'])(?=[^>]*\btype=["']application\/json["'])[^>]*>([\s\S]*?)<\/script\s*>/gi,
    ),
  ];
  if (matches.length > 1) throw new Error('页面只能包含一份执行配置');
  if (!matches.length)
    return { content, actions: supplied ? parseToolPageActions(supplied) : undefined };
  let actions: ToolPageActions;
  try {
    actions = parseToolPageActions(JSON.parse(matches[0][1]));
  } catch {
    throw new Error('页面执行配置无法读取，请重新生成');
  }
  return { content: content.replace(matches[0][0], ''), actions };
}

/** Only the one data block is accepted; prose and page code cannot become results. */
export function parseToolResult(content: string, action: ToolPageAction): unknown {
  const raw = content.trim();
  const fenced = /^```json\s*\n([\s\S]*?)\n```$/.exec(raw);
  let data: unknown;
  try {
    data = JSON.parse(fenced ? fenced[1] : raw);
  } catch {
    throw new Error('分析结果数据不完整，请重试');
  }
  if (action.result === 'json') return data;
  const result = reportSchema.safeParse(data);
  if (!result.success) throw new Error('分析结果结构不完整，请重试');
  if (
    action.requiredSections &&
    JSON.stringify(result.data.sections.map(({ id, title }) => ({ id, title }))) !==
      JSON.stringify(action.requiredSections)
  ) {
    throw new Error('分析结果缺少要求的章节或章节顺序不正确，请重试');
  }
  return result.data;
}

export function toolResultSourceId(content: string): string | undefined {
  try {
    const raw = content.trim().replace(/^```json\s*\n([\s\S]*?)\n```$/, '$1');
    const value = JSON.parse(raw);
    return value &&
      typeof value === 'object' &&
      Object.keys(value).length === 1 &&
      typeof value.resultSourceId === 'string'
      ? value.resultSourceId
      : undefined;
  } catch {
    return undefined;
  }
}

export function toolResultPrompt(action: ToolPageAction): string {
  return [
    '执行配置指定的任务。根据真实附件和工具返回数据完成工作。最终只返回一个完整 JSON 对象，或唯一 json 代码块。不要生成页面、HTML、组件源码或文件链接代替结果。页面由宿主独立展示。业务技能负责事实、分析和证据；本协议决定最终返回格式。',
    action.result === 'report'
      ? `报告 JSON Schema：${JSON.stringify(z.toJSONSchema(reportSchema, { unrepresentable: 'any' }))}`
      : '返回任务要求的 JSON 数据。',
    action.requiredSections
      ? `sections 必须按此顺序包含以下 id/title，未涉及的章节使用 groups: [] 和准确 emptyMessage：${JSON.stringify(action.requiredSections)}`
      : '',
    '表格 rows[].cells 仅放业务内容，rows[].source 独立保存文件名、页码或段落位置和原文摘录。file.sourceId 只能使用附件或 artifact_create 返回的 sourceRef.sourceId。不要编造事实或产物。',
    '大型报告不要在最终回复重复输出全文：将完整结果 JSON 写入会话 temp 目录，使用 artifact_create 注册，然后最终只返回 {"resultSourceId":"返回的真实 sourceRef.sourceId"}。宿主读取并校验该产物，保证全部章节和表格完整。',
  ]
    .filter(Boolean)
    .join('\n\n');
}
