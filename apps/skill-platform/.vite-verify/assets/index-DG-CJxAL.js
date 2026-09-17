import {
  K as At,
  e as Ce,
  k as De,
  x as Ee,
  J as Gt,
  f as Ie,
  b as It,
  N as Le,
  U as Lt,
  d as Mt,
  H as Pe,
  S as Pt,
  z as Re,
  P as Rt,
} from './icons-B5Lu0sqU.js';
import { SkillScanPreview as Ne } from './index-BgI0W1fK.js';
import {
  cD as $t,
  bB as Dt,
  br as Et,
  cE as Ge,
  bJ as Ht,
  cC as Kt,
  cB as Me,
  ba as R,
  bp as Tt,
  bh as Ue,
  bu as Ut,
  cF as _t,
} from './index-C2avURFS.js';
import { d as Bt, S as Ot, c as zt } from './index-CSjkvQbC.js';
import './markdown-it-vendor-DL4wSELR.js';
import { T as Ct, R as Nt, q as e } from './markdown-vendor-DldLOD9R.js';
import { M as He, e as I, U as Te, r as n, B as x } from './ui-vendor-C-FKu2uc.js';
const Ft = `You are a ISkill Creator that helps users create effective SKILL.md files following the Anthropic Agent Skills specification.

## About Skills

Skills are modular, self-contained packages that extend Claude's capabilities by providing specialized knowledge, workflows, and tools. They transform Claude from a general-purpose agent into a specialized agent equipped with procedural knowledge.

## SKILL.md Structure

Every SKILL.md requires:
1. **YAML frontmatter** (between --- markers) with:
   - \`name\`: Human-friendly name (lowercase-with-hyphens, max 64 characters)
   - \`description\`: What the skill does and when to use it (max 200 characters) - CRITICAL: Claude uses this to determine when to invoke the skill
2. **Markdown body** with clear instructions

## Core Principles

1. **Concise is Key**: Only include information Claude doesn't already have. Challenge each piece: "Does Claude really need this?"
2. **Clear Description**: Include BOTH what the skill does AND specific triggers/contexts for when to use it
3. **Progressive Disclosure**: Keep SKILL.md lean (<500 lines), move detailed reference to separate files
4. **Appropriate Freedom**: Match instruction specificity to task fragility

## Output Format

Generate a complete SKILL.md with proper structure:

\`\`\`markdown
---
name: skill-name-here
description: Clear description of what this skill does and when to use it (max 200 chars)
---

# ISkill Title

## Overview
Brief explanation of the skill's purpose.

## When to Use
- Trigger condition 1
- Trigger condition 2

## Instructions
1. Step 1
2. Step 2
...

## Examples (if helpful)
...

## Guidelines
- Important constraint 1
- Best practice 2
\`\`\`

## Important Rules

1. Use imperative/infinitive form in instructions
2. Be specific about when the skill should be used in the description
3. Include examples when they clarify usage
4. Focus each skill on one specific workflow
5. Do NOT include extraneous documentation (README, CHANGELOG, etc.)
6. Output ONLY the SKILL.md content, no additional explanation`,
  Yt = `You are a SKILL.md editor. Your job is to polish and restructure existing skill content to follow the Anthropic Agent Skills specification — while strictly preserving ALL core capabilities, instructions, and intent written by the user.

## Rules

1. **PRESERVE everything the user wrote** — do NOT remove, weaken, or change any core instruction, capability, workflow step, or constraint. You are polishing, not rewriting.
2. **Add YAML frontmatter** if missing (name + description ≤200 chars)
3. **Restructure** into clear sections: Overview, When to Use, Instructions, Guidelines, Examples (only if helpful)
4. **Improve clarity** — fix grammar, use imperative form, add bullet points, improve formatting
5. **Keep it concise** — remove redundancy but never remove unique information
6. **Output ONLY the polished SKILL.md** — no explanations, no commentary, no code fences wrapping the entire output
7. **Use the same language as the user's content** — if the user wrote in Chinese, output in Chinese; if English, output in English

## Important

- If the content already has good structure, make minimal changes
- Never invent new capabilities the user didn't describe
- The description in frontmatter should accurately summarize what the user wrote`;
async function Wt(r, d, u, s, f) {
  const m = `Create a SKILL.md file for the following skill:

**ISkill Name**: ${d}
**Purpose/Description**: ${u}

Generate a complete, well-structured SKILL.md following the Anthropic Agent Skills specification. Output ONLY the SKILL.md content (including the YAML frontmatter), no additional explanation.`;
  return (
    await Ue(
      r,
      [
        { role: 'system', content: f || Ft },
        { role: 'user', content: m },
      ],
      { temperature: 0.7, maxTokens: 4096, stream: !1, streamCallbacks: s },
    )
  ).content;
}
async function qt(r, d, u, s) {
  const f = `Please polish the following SKILL.md content. Preserve ALL core capabilities and instructions. Only improve structure, formatting, and readability according to the SKILL.md standard.

${
  u
    ? `**ISkill Name**: ${u}
`
    : ''
}
**Existing Content**:
${d}`;
  return (
    await Ue(
      r,
      [
        { role: 'system', content: Yt },
        { role: 'user', content: f },
      ],
      { temperature: 0.4, maxTokens: 4096, stream: !1, streamCallbacks: s },
    )
  ).content;
}
function z(r) {
  return r.toLowerCase().replace(/[^a-z0-9-]/g, '');
}
function Jt({
  name: r,
  description: d,
  canGenerateWithAI: u,
  isGenerating: s,
  onNameChange: f,
  onDescriptionChange: m,
  onBack: c,
  onGenerate: b,
}) {
  return e.jsxs('div', {
    className: 'space-y-4',
    children: [
      e.jsx('div', {
        className: 'bg-primary/5 border-primary/20 rounded-lg border p-3',
        children: e.jsxs('p', {
          className: 'text-primary flex items-center gap-2 text-xs',
          children: [
            e.jsx(Re, { className: 'h-3.5 w-3.5' }),
            '将使用 ISkill Creator 技能生成专业的 SKILL.md，您可在保存前审阅与编辑。',
          ],
        }),
      }),
      !u &&
        e.jsxs('div', {
          className:
            'flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3',
          children: [
            e.jsx(Pe, { className: 'h-4 w-4 flex-shrink-0 text-amber-500' }),
            e.jsx('p', {
              className: 'text-xs text-amber-600 dark:text-amber-400',
              children: 'Configure an AI model in settings to enable AI generation',
            }),
          ],
        }),
      e.jsxs('div', {
        children: [
          e.jsxs('label', {
            className: 'mb-2 block text-sm font-medium',
            children: [
              '技能名称',
              e.jsx('span', { className: 'text-destructive ml-1', children: '*' }),
            ],
          }),
          e.jsx(I, { value: r, onChange: (h) => f(z(h.target.value)), placeholder: 'my-skill' }),
          e.jsx('p', {
            className: 'text-muted-foreground mt-1.5 text-xs',
            children: '仅小写字母、数字和连字符，例如 my-skill-name',
          }),
        ],
      }),
      e.jsxs('div', {
        children: [
          e.jsxs('label', {
            className: 'mb-2 block text-sm font-medium',
            children: [
              '描述',
              e.jsx('span', { className: 'text-destructive ml-1', children: '*' }),
            ],
          }),
          e.jsx(I.TextArea, {
            value: d,
            onChange: (h) => m(h.target.value),
            placeholder: '描述这个技能应做什么、用途及使用场景…',
            rows: 4,
          }),
        ],
      }),
      e.jsxs('div', {
        className: 'flex gap-2 pt-2',
        children: [
          e.jsx(x, { className: 'flex-1', onClick: c, children: '返回' }),
          e.jsx(x, {
            type: 'primary',
            className: 'flex-1',
            loading: s,
            disabled: !u || !r.trim() || !d.trim(),
            icon: e.jsx(De, { className: 'h-4 w-4' }),
            onClick: b,
            children: s ? '生成中...' : '生成并预览',
          }),
        ],
      }),
    ],
  });
}
function Vt({
  githubUrl: r,
  onGithubUrlChange: d,
  hasResults: u,
  importNotice: s,
  annotatedResults: f,
  selectableResults: m,
  selectedSlugs: c,
  onToggleSkill: b,
  onToggleSelectAll: h,
}) {
  const g = Dt(),
    P = m.every((l) => c.has(l.slug));
  return e.jsxs('div', {
    className: 'flex h-full min-h-0 flex-col gap-4',
    children: [
      e.jsxs('div', {
        children: [
          e.jsx('label', {
            className: 'mb-2 block text-sm font-medium',
            children: 'GitHub 仓库地址',
          }),
          e.jsx(I, {
            value: r,
            onChange: (l) => d(l.target.value),
            placeholder: 'https://github.com/owner/skill-repo',
          }),
          e.jsx('p', {
            className: 'text-muted-foreground mt-2 text-xs',
            children: `请输入仓库根地址。${g} 会先扫描仓库中的可导入 SKILL.md，再让你选择要导入的内容。`,
          }),
          e.jsxs('div', {
            className:
              'border-border bg-muted/20 text-muted-foreground mt-3 space-y-1.5 rounded-lg border p-3 text-xs',
            children: [
              e.jsx('p', { children: '目前只支持仓库根地址，例如 https://github.com/owner/repo' }),
              e.jsx('p', {
                children: `如果没有找到 SKILL.md，${g} 会回退到仓库根目录的 README.md，并将其作为单个导入候选。`,
              }),
            ],
          }),
        ],
      }),
      u &&
        e.jsxs('div', {
          className:
            'border-border bg-background/60 flex min-h-0 flex-1 flex-col space-y-3 rounded-xl border p-4',
          children: [
            s &&
              e.jsx('div', {
                className:
                  'border-primary/20 bg-primary/10 text-primary rounded-lg border px-3 py-2 text-xs',
                children: s,
              }),
            e.jsxs('div', {
              className: 'flex items-center justify-between',
              children: [
                e.jsxs('div', {
                  children: [
                    e.jsx('div', {
                      className: 'text-foreground text-sm font-medium',
                      children: 'Found {{count}} import option(s)'.replace(
                        '{{count}}',
                        String(f.length),
                      ),
                    }),
                    e.jsx('div', {
                      className: 'text-muted-foreground mt-1 text-xs',
                      children: '请先从这个仓库中选择一个或多个技能再导入。',
                    }),
                  ],
                }),
                e.jsx(x, {
                  type: 'text',
                  size: 'small',
                  onClick: h,
                  children: P
                    ? e.jsxs(e.Fragment, {
                        children: [e.jsx(Ce, { className: 'h-3.5 w-3.5' }), '取消全选'],
                      })
                    : e.jsxs(e.Fragment, {
                        children: [e.jsx(Ie, { className: 'h-3.5 w-3.5' }), '全选'],
                      }),
                }),
              ],
            }),
            e.jsx('div', {
              'data-testid': 'github-results-scroll-area',
              className: 'min-h-0 flex-1 overflow-y-auto pr-1',
              children: e.jsx('div', {
                className: 'grid grid-cols-1 gap-3',
                children: f.map((l) => {
                  const L = c.has(l.slug);
                  return e.jsx(
                    x,
                    {
                      type: 'default',
                      block: !0,
                      disabled: l.isImported,
                      onClick: () => !l.isImported && b(l.slug),
                      className: `!h-auto w-full rounded-2xl border p-4 text-left shadow-sm transition-all ${l.isImported ? 'border-border bg-muted/30 cursor-not-allowed opacity-70' : L ? 'border-primary/40 bg-primary/5 shadow-primary/10' : 'border-border app-wallpaper-surface hover:border-primary/30 hover:shadow-md'}`,
                      children: e.jsxs('div', {
                        className: 'flex items-start gap-3',
                        children: [
                          e.jsx('div', {
                            className: `mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl ${l.isImported ? 'bg-accent text-muted-foreground' : 'bg-primary/10 text-primary'}`,
                            children: e.jsx(It, { className: 'h-5 w-5' }),
                          }),
                          e.jsxs('div', {
                            className: 'min-w-0 flex-1',
                            children: [
                              e.jsxs('div', {
                                className: 'flex items-start justify-between gap-3',
                                children: [
                                  e.jsxs('div', {
                                    className: 'min-w-0',
                                    children: [
                                      e.jsxs('div', {
                                        className: 'flex flex-wrap items-center gap-2',
                                        children: [
                                          e.jsx('h4', {
                                            className: 'truncate text-sm font-semibold',
                                            children: l.name,
                                          }),
                                          l.version &&
                                            e.jsxs('span', {
                                              className:
                                                'bg-primary/10 text-primary rounded-full px-2 py-0.5 text-[10px]',
                                              children: ['v', l.version],
                                            }),
                                          l.isImported &&
                                            e.jsx('span', {
                                              className:
                                                'bg-accent text-muted-foreground inline-flex shrink-0 items-center rounded px-1.5 py-0.5 text-[10px]',
                                              children: '已导入',
                                            }),
                                        ],
                                      }),
                                      e.jsx('p', {
                                        className:
                                          'text-muted-foreground mt-1 break-all text-[11px]',
                                        children: l.source_url,
                                      }),
                                    ],
                                  }),
                                  e.jsx('div', {
                                    className: 'shrink-0 pt-0.5',
                                    children:
                                      l.isImported || L
                                        ? e.jsx(Ce, { className: 'text-primary h-4 w-4' })
                                        : e.jsx(Ie, { className: 'text-muted-foreground h-4 w-4' }),
                                  }),
                                ],
                              }),
                              e.jsx('p', {
                                className:
                                  'text-muted-foreground mt-3 line-clamp-3 text-xs leading-5',
                                children: l.description,
                              }),
                            ],
                          }),
                        ],
                      }),
                    },
                    l.slug,
                  );
                }),
              }),
            }),
          ],
        }),
    ],
  });
}
const Zt = Nt;
function Qt({
  form: r,
  existingTags: d,
  canGenerateWithAI: u,
  isGenerating: s,
  skillMdEditorRef: f,
  skillMdToolbars: m,
  onFieldChange: c,
  onMdFileUpload: b,
  onAIPolish: h,
  onDrop: g,
  onUploadImg: P,
}) {
  return e.jsxs('div', {
    className: 'space-y-5',
    children: [
      e.jsxs('div', {
        children: [
          e.jsxs('label', {
            className: 'mb-2 block text-sm font-medium',
            children: [
              '技能名称',
              ' ',
              e.jsx('span', { className: 'text-destructive', children: '*' }),
            ],
          }),
          e.jsx(I, {
            value: r.name,
            onChange: (l) => c('name', z(l.target.value)),
            placeholder: 'my-skill-name',
          }),
          e.jsx('p', {
            className: 'text-muted-foreground mt-1.5 text-xs',
            children: '仅小写字母、数字和连字符，例如 my-skill-name',
          }),
        ],
      }),
      e.jsxs('div', {
        children: [
          e.jsx('label', { className: 'mb-2 block text-sm font-medium', children: '技能描述' }),
          e.jsx(I, {
            value: r.description,
            onChange: (l) => c('description', l.target.value),
            placeholder: '简短描述技能的功能',
          }),
        ],
      }),
      e.jsx(Bt, {
        name: r.name,
        iconUrl: r.iconUrl,
        iconEmoji: r.iconEmoji,
        iconBackground: r.iconBackground,
        onChange: ({ iconUrl: l, iconEmoji: L, iconBackground: y }) => {
          (c('iconUrl', l), c('iconEmoji', L), c('iconBackground', y));
        },
      }),
      e.jsxs('div', {
        className: 'grid grid-cols-2 gap-4',
        children: [
          e.jsxs('div', {
            children: [
              e.jsx('label', { className: 'mb-2 block text-sm font-medium', children: '版本' }),
              e.jsx(I, {
                value: r.version,
                onChange: (l) => c('version', l.target.value),
                placeholder: '1.0.0',
              }),
            ],
          }),
          e.jsxs('div', {
            children: [
              e.jsx('label', { className: 'mb-2 block text-sm font-medium', children: '作者' }),
              e.jsx(I, {
                value: r.author,
                onChange: (l) => c('author', l.target.value),
                placeholder: '作者名称',
              }),
            ],
          }),
        ],
      }),
      e.jsx(Ot, { onChange: (l) => c('tags', l), options: d, value: r.tags }),
      e.jsxs('div', {
        children: [
          e.jsxs('div', {
            className: 'mb-2 flex flex-wrap items-center justify-between gap-2',
            children: [
              e.jsx('label', {
                className: 'block text-sm font-medium',
                children: '指令 (SKILL.md)',
              }),
              e.jsxs('div', {
                className: 'flex flex-wrap items-center gap-2',
                children: [
                  e.jsx(Te, {
                    showUploadList: !1,
                    accept: '.md,.markdown,.txt',
                    beforeUpload: b,
                    children: e.jsx(x, {
                      type: 'default',
                      size: 'small',
                      icon: e.jsx(Lt, { className: 'h-3.5 w-3.5' }),
                      children: '上传 .md',
                    }),
                  }),
                  e.jsx(x, {
                    type: 'primary',
                    size: 'small',
                    loading: s,
                    disabled: !u || !r.instructions.trim(),
                    icon: e.jsx(De, { className: 'h-3.5 w-3.5' }),
                    onClick: h,
                    title: u
                      ? r.instructions.trim()
                        ? '按 SKILL.md 标准格式润色内容'
                        : '请先编写一些内容再进行润色'
                      : '请先在设置中配置 AI 模型',
                    children: s ? '润色中...' : 'AI 润色',
                  }),
                ],
              }),
            ],
          }),
          !u &&
            e.jsxs('div', {
              className:
                'mb-2 flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 p-2',
              children: [
                e.jsx(Pe, { className: 'h-4 w-4 flex-shrink-0 text-amber-500' }),
                e.jsx('p', {
                  className: 'text-xs text-amber-600 dark:text-amber-400',
                  children: '请先在设置中配置 AI 模型以启用 AI 润色',
                }),
              ],
            }),
          e.jsx('div', {
            className: 'border-border overflow-hidden rounded-lg border',
            style: { height: 420 },
            children: e.jsx(Zt, {
              ref: f,
              value: r.instructions,
              onChange: (l) => c('instructions', l),
              preview: !0,
              previewTheme: 'default',
              noPrettier: !0,
              toolbars: m,
              onDrop: g,
              onUploadImg: P,
              style: { height: '100%' },
            }),
          }),
          e.jsx('p', {
            className: 'text-muted-foreground mt-1.5 text-xs',
            children: '支持 Markdown 格式，用于指导 AI 如何使用该技能',
          }),
        ],
      }),
    ],
  });
}
function Xt({ onSelectMode: r }) {
  return e.jsxs('div', {
    className: 'space-y-3',
    children: [
      e.jsx('p', {
        className: 'text-muted-foreground mb-4 text-sm',
        children: '选择添加技能的方式：',
      }),
      e.jsxs(x, {
        type: 'default',
        block: !0,
        className:
          'bg-primary/5 hover:bg-primary/10 border-primary/30 !h-auto justify-start gap-4 rounded-xl border p-4 text-left',
        onClick: () => r('ai'),
        children: [
          e.jsx('div', {
            className: 'bg-primary rounded-lg p-3',
            children: e.jsx(Re, { className: 'h-6 w-6 text-white' }),
          }),
          e.jsxs('div', {
            className: 'text-left',
            children: [
              e.jsxs('h3', {
                className: 'text-foreground flex items-center gap-2 font-medium',
                children: [
                  'AI 草稿',
                  e.jsx('span', {
                    className:
                      'bg-primary/20 text-primary rounded-full px-1.5 py-0.5 text-[10px] font-normal',
                    children: 'skill-creator',
                  }),
                ],
              }),
              e.jsx('p', {
                className: 'text-muted-foreground text-sm',
                children: '描述你的需求，AI 先生成 SKILL.md 草稿供你确认',
              }),
            ],
          }),
        ],
      }),
      e.jsxs(x, {
        type: 'default',
        block: !0,
        className:
          'bg-accent/50 hover:bg-accent border-border !h-auto justify-start gap-4 rounded-xl border p-4 text-left',
        onClick: () => r('github'),
        children: [
          e.jsx('div', {
            className: 'bg-background group-hover:bg-primary/10 rounded-lg p-3 transition-colors',
            children: e.jsx(Gt, { className: 'text-foreground h-6 w-6' }),
          }),
          e.jsxs('div', {
            className: 'text-left',
            children: [
              e.jsx('h3', { className: 'text-foreground font-medium', children: '从 GitHub 安装' }),
              e.jsx('p', {
                className: 'text-muted-foreground text-sm',
                children: '粘贴 GitHub 仓库地址安装',
              }),
            ],
          }),
        ],
      }),
      e.jsxs(x, {
        type: 'default',
        block: !0,
        className:
          'bg-accent/50 hover:bg-accent border-border !h-auto justify-start gap-4 rounded-xl border p-4 text-left',
        onClick: () => r('manual'),
        children: [
          e.jsx('div', {
            className: 'bg-background group-hover:bg-primary/10 rounded-lg p-3 transition-colors',
            children: e.jsx(At, { className: 'text-foreground h-6 w-6' }),
          }),
          e.jsxs('div', {
            className: 'text-left',
            children: [
              e.jsx('h3', { className: 'text-foreground font-medium', children: '手动创建' }),
              e.jsx('p', {
                className: 'text-muted-foreground text-sm',
                children: '从零开始编写技能',
              }),
            ],
          }),
        ],
      }),
      e.jsxs(x, {
        type: 'default',
        block: !0,
        className:
          'bg-accent/50 hover:bg-accent border-border !h-auto justify-start gap-4 rounded-xl border p-4 text-left',
        onClick: () => r('default'),
        children: [
          e.jsx('div', {
            className: 'bg-background group-hover:bg-primary/10 rounded-lg p-3 transition-colors',
            children: e.jsx(Rt, { className: 'text-foreground h-6 w-6' }),
          }),
          e.jsxs('div', {
            className: 'text-left',
            children: [
              e.jsx('h3', { className: 'text-foreground font-medium', children: '导入默认' }),
              e.jsx('p', {
                className: 'text-muted-foreground text-sm',
                children: '从应用内置技能包快速导入',
              }),
            ],
          }),
        ],
      }),
      e.jsxs(x, {
        type: 'default',
        block: !0,
        className:
          'bg-accent/50 hover:bg-accent border-border !h-auto justify-start gap-4 rounded-xl border p-4 text-left',
        onClick: () => r('scan'),
        children: [
          e.jsx('div', {
            className: 'bg-background group-hover:bg-primary/10 rounded-lg p-3 transition-colors',
            children: e.jsx(Ee, { className: 'text-foreground h-6 w-6' }),
          }),
          e.jsxs('div', {
            className: 'text-left',
            children: [
              e.jsx('h3', { className: 'text-foreground font-medium', children: '扫描本地' }),
              e.jsx('p', {
                className: 'text-muted-foreground text-sm',
                children: '扫描本地已有的技能',
              }),
            ],
          }),
        ],
      }),
    ],
  });
}
function es(r) {
  switch (r) {
    case 'select':
      return '新建技能';
    case 'github':
      return '从 GitHub 安装';
    case 'manual':
      return '创建新技能';
    case 'ai':
      return 'AI 草稿';
    case 'scan':
      return '扫描本地';
    case 'default':
      return '导入默认';
    default:
      return '新建技能';
  }
}
function ts() {
  return e.jsx(Mt, { className: 'text-primary h-5 w-5' });
}
function ss({ isScanning: r, onStartScan: d }) {
  return e.jsxs('div', {
    className: 'py-8 text-center',
    children: [
      e.jsx(Ee, { className: 'text-muted-foreground/30 mx-auto mb-4 h-12 w-12' }),
      e.jsx('h3', { className: 'mb-2 font-medium', children: '扫描本地技能' }),
      e.jsx('p', {
        className: 'text-muted-foreground mb-4 text-sm',
        children: '自动检测 Claude、Cursor、Windsurf 等 AI 工具中的 SKILL.md 文件。',
      }),
      e.jsx(x, {
        type: 'primary',
        loading: r,
        icon: e.jsx(Pt, { className: 'h-4 w-4' }),
        onClick: d,
        children: r ? '扫描中...' : '开始扫描',
      }),
    ],
  });
}
const as = 'https://raw.githubusercontent.com/anthropics/skills/main/skills/skill-creator/SKILL.md';
function Ae(r) {
  return {
    provider: r.provider,
    apiProtocol: r.apiProtocol,
    apiKey: r.apiKey,
    apiUrl: r.apiUrl,
    model: r.model,
    chatParams: r.chatParams,
  };
}
function ns({ isOpen: r, onClose: d }) {
  const u = R((t) => t.createSkill),
    s = R((t) => t.installRegistrySkill),
    f = R((t) => t.importScannedSkills),
    m = R((t) => t.skills),
    { showToast: c } = Et(),
    b = Tt((t) => t.aiModels),
    [h, g] = n.useState('select'),
    [P, l] = n.useState(!1),
    [L, y] = n.useState(!1),
    [Ke, o] = n.useState(null),
    [U, ce] = n.useState(''),
    [de, ue] = n.useState([]),
    [F, K] = n.useState(new Set()),
    [me, he] = n.useState(!1),
    [$e, $] = n.useState(null),
    [S, M] = n.useState(''),
    [k, _] = n.useState(''),
    [j, G] = n.useState(''),
    [Y, W] = n.useState(''),
    [q, J] = n.useState(''),
    [D, V] = n.useState(void 0),
    [E, Z] = n.useState(void 0),
    [T, Q] = n.useState(void 0),
    [X, ee] = n.useState([]),
    pe = n.useRef(null),
    { handleDrop: _e, handleUploadImg: Be } = Ht(pe),
    Oe = n.useMemo(() => Ct.filter((t) => !['prettier', 'github', 'save'].includes(String(t))), []),
    [ze, te] = n.useState([]),
    [Fe, se] = n.useState(!1),
    [Ye, ae] = n.useState(!1),
    [B, xe] = n.useState([]),
    [We, ne] = n.useState(!1),
    [qe, O] = n.useState(!1),
    [Je, re] = n.useState(null),
    fe = n.useMemo(
      () =>
        new Set(
          m.flatMap((t) =>
            [t.source_url, t.local_repo_path].filter(
              (a) => typeof a == 'string' && a.trim().length > 0,
            ),
          ),
        ),
      [m],
    ),
    Ve = n.useMemo(() => zt(m), [m]),
    le = n.useMemo(
      () =>
        new Set(
          m.map((t) => t.source_url).filter((t) => typeof t == 'string' && t.trim().length > 0),
        ),
      [m],
    ),
    H = n.useMemo(() => de.map((t) => ({ ...t, isImported: le.has(t.source_url) })), [de, le]),
    ie = n.useMemo(() => H.filter((t) => !t.isImported), [H]),
    Ze = n.useMemo(
      () =>
        B.map((t) => ({
          name: t.name,
          description: t.description,
          version: t.version,
          author: t.author,
          tags: t.tags,
          instructions: t.instructions,
          filePath: `${t.extractDir}/SKILL.md`,
          localPath: `default:${t.zipFileName}`,
          platforms: ['default'],
        })),
      [B],
    ),
    ge = n.useMemo(
      () => new Set(B.filter((t) => t.isInstalled).map((t) => t.name.toLowerCase())),
      [B],
    ),
    w = n.useMemo(() => {
      const t = b.filter((a) => (a.type ?? 'chat') === 'chat');
      return t.find((a) => a.isDefault) ?? t[0] ?? null;
    }, [b]),
    Qe = n.useMemo(() => w && w.apiKey && w.apiUrl, [w]),
    [Xe, et] = n.useState(null);
  n.useEffect(() => {
    if (!r) return;
    let t = !1;
    return (
      Me(as)
        .then((a) => {
          !t && a.trim() && et(a);
        })
        .catch((a) => {
          console.warn('Failed to load skill-creator prompt:', a);
        }),
      () => {
        t = !0;
      }
    );
  }, [r]);
  const be = n.useCallback(
      () => S.trim() !== '' || k.trim() !== '' || j.trim() !== '' || !!D || !!E || !!T,
      [S, k, j, D, E, T],
    ),
    oe = n.useCallback(() => be() && (h === 'manual' || h === 'ai'), [be, h]),
    tt = n.useCallback(() => {
      (M(''), _(''), G(''), W(''), J(''), V(void 0), Z(void 0), Q(void 0), ee([]));
    }, []),
    Se = n.useRef(async () => !1),
    { confirmLeave: ve, UnsavedLeaveDialog: st } = Ut({
      isDirty: oe,
      onSave: () => Se.current(),
      onDiscard: tt,
    }),
    N = n.useCallback(() => {
      (g('select'),
        o(null),
        ce(''),
        ue([]),
        K(new Set()),
        he(!1),
        $(null),
        M(''),
        _(''),
        G(''),
        W(''),
        J(''),
        V(void 0),
        Z(void 0),
        Q(void 0),
        ee([]),
        y(!1),
        te([]),
        se(!1),
        ae(!1),
        xe([]),
        ne(!1),
        O(!1),
        re(null),
        d());
    }, [d]),
    at = n.useCallback(() => {
      (async () => {
        if (!oe()) {
          N();
          return;
        }
        (await ve()) && N();
      })();
    }, [ve, N, oe]),
    nt = (t) => {
      const a = new FileReader();
      return (
        (a.onload = (i) => {
          const v = i.target?.result;
          if (v && (G(v), !S.trim())) {
            const p = t.name
              .replace(/\.md$/i, '')
              .replace(/[^a-z0-9-]/gi, '-')
              .toLowerCase();
            M(p);
          }
        }),
        a.readAsText(t),
        Te.LIST_IGNORE
      );
    },
    rt = async () => {
      if (!j.trim()) {
        o('请先编写一些内容再进行润色');
        return;
      }
      if (!w) {
        o('请先在设置中配置 AI 模型');
        return;
      }
      (y(!0), o(null));
      try {
        const t = Ae(w),
          a = await qt(t, j, S || void 0);
        G(a);
      } catch (t) {
        o(t instanceof Error ? t.message : '润色失败');
      } finally {
        y(!1);
      }
    },
    lt = async () => {
      const t = z(S);
      if (!t.trim()) {
        o('请输入技能名称');
        return;
      }
      if (!k.trim()) {
        o('请先填写技能描述以便 AI 生成');
        return;
      }
      if (!w) {
        o('请先在设置中配置 AI 模型');
        return;
      }
      (y(!0), o(null));
      try {
        const a = Ae(w),
          i = await Wt(a, t, k, void 0, Xe || void 0);
        (M(t), G(i), g('manual'));
      } catch (a) {
        o(a instanceof Error ? a.message : '生成失败');
      } finally {
        y(!1);
      }
    },
    it = async () => {
      if (!U.trim()) {
        o('请输入 GitHub 地址');
        return;
      }
      (l(!0), o(null));
      try {
        if (
          !U.trim().match(
            /^https?:\/\/github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+?)(?:\.git)?\/?$/,
          )
        )
          throw new Error('无效的 GitHub 地址格式');
        const a = await _t(U.trim(), {
          fetchRemoteContent: (i) => Me(i),
          registrySkills: [],
          rateLimitMessage: 'GitHub API 请求限额已达到，请几分钟后重试，或切换网络后再试。',
          networkMessage: '无法连接到 GitHub，请检查当前网络，或切换网络后再试。',
          invalidRepoMessage: '仓库不存在，或仓库地址无效，请检查 GitHub 仓库地址后重试。',
        });
        if (a.length === 0) throw new Error('这个仓库里没有可导入的 SKILL.md 或 README.md 文件。');
        (ue(a),
          K(new Set(a.filter((i) => !le.has(i.source_url)).map((i) => i.slug))),
          he(!0),
          $(null));
      } catch (t) {
        o(t instanceof Error ? t.message : '安装失败');
      } finally {
        l(!1);
      }
    },
    ot = (t) => {
      K((a) => {
        const i = new Set(a);
        return (i.has(t) ? i.delete(t) : i.add(t), i);
      });
    },
    ct = () => {
      const t = ie.every((a) => F.has(a.slug));
      K(t ? new Set() : new Set(ie.map((a) => a.slug)));
    },
    dt = n.useMemo(
      () => ({
        name: S,
        description: k,
        instructions: j,
        version: Y,
        author: q,
        iconUrl: D,
        iconEmoji: E,
        iconBackground: T,
        tags: X,
      }),
      [S, k, j, Y, q, D, E, T, X],
    ),
    ut = async () => {
      const t = H.filter((a) => !a.isImported && F.has(a.slug));
      if (t.length !== 0) {
        (l(!0), o(null), $(null));
        try {
          let a = 0;
          const i = [],
            v = [];
          for (const p of t)
            try {
              if (!(await s(p))) {
                i.push(p.name);
                continue;
              }
              a += 1;
            } catch (C) {
              v.push(`${p.name}: ${C instanceof Error ? C.message : String(C)}`);
            }
          if (a > 0 && v.length === 0 && i.length === 0) {
            N();
            return;
          }
          $(`已导入 ${a} / ${t.length}，跳过 ${i.length}，失败 ${v.length}。`);
        } finally {
          l(!1);
        }
      }
    },
    ke = async () => {
      const t = z(S);
      if (!t.trim()) return (o('请输入技能名称'), !1);
      (l(!0), o(null));
      try {
        if (
          !(await u({
            name: t,
            description: k,
            instructions: j,
            content: j,
            protocol_type: 'skill',
            is_favorite: !1,
            tags: X,
            version: Y || void 0,
            author: q || void 0,
            icon_url: D,
            icon_emoji: E,
            icon_background: T,
          }))
        )
          throw new Error('创建完成后未返回有效的技能结果');
        return !0;
      } catch (a) {
        return (o(a instanceof Error ? a.message : '创建失败'), !1);
      } finally {
        l(!1);
      }
    },
    mt = () => {
      ke().then((t) => {
        t && N();
      });
    },
    ht = (t, a) => {
      switch (t) {
        case 'name':
          M(a);
          break;
        case 'description':
          _(a);
          break;
        case 'instructions':
          G(a);
          break;
        case 'version':
          W(a);
          break;
        case 'author':
          J(a);
          break;
        case 'iconUrl':
          V(a);
          break;
        case 'iconEmoji':
          Z(a);
          break;
        case 'iconBackground':
          Q(a);
          break;
        case 'tags':
          ee(a);
          break;
      }
    },
    pt = async () => {
      (se(!0), o(null));
      try {
        const t = await Ge(),
          a = t.filter((i) => fe.has(i.localPath)).length;
        if ((te(t), t.length > 0 && a === t.length)) {
          o('扫描到的技能已全部存在于您的库中。');
          return;
        }
        if (t.length === 0) {
          o('未发现新的本地 SKILL.md 文件。');
          return;
        }
        ae(!0);
      } catch (t) {
        o('扫描失败：' + String(t));
      } finally {
        se(!1);
      }
    },
    xt = async (t, a) => {
      const i = await f(t, a);
      return (
        i.importedCount > 0 && i.failed.length === 0 && i.skipped.length === 0 && N(),
        i.importedCount
      );
    },
    ft = async (t) => {
      const a = t.length ? await R.getState().scanLocalPreview(t) : await Ge();
      te(a);
    },
    je = n.useCallback(async () => {
      (ne(!0), o(null), re(null), O(!0));
      try {
        const t = await Kt();
        (xe(t), t.length === 0 && o('暂无默认技能包'));
      } catch (t) {
        o('加载默认技能失败：' + String(t));
      } finally {
        ne(!1);
      }
    }, []),
    gt = n.useCallback(
      (t) => {
        (t !== 'default' && O(!1), g(t), t === 'default' && je());
      },
      [je],
    ),
    bt = async (t) => {
      const a = t.map((A) => A.localPath.replace(/^default:/, '')),
        i = t.filter((A) => ge.has(A.name.toLowerCase())).length;
      let v = !1;
      i > 0 &&
        (v = await new Promise((A) => {
          He.confirm({
            title: '覆盖已有技能？',
            content: `选中的技能中有 ${i} 个与库中已有技能同名，是否覆盖？覆盖将替换本地文件和 SKILL.md 内容，此操作不可撤销。`,
            okText: '全部覆盖',
            cancelText: '跳过同名',
            onOk: () => A(!0),
            onCancel: () => A(!1),
          });
        }));
      const p = await $t(a, { overwrite: v });
      await R.getState().loadSkills();
      const C = `成功 ${p.imported}，覆盖 ${p.overwritten}，跳过 ${p.skipped}，失败 ${p.failed.length}`;
      return (
        re(C),
        c(C, p.failed.length > 0 ? 'warning' : 'success'),
        p.failed.length === 0 && p.imported + p.overwritten > 0 && N(),
        p.imported + p.overwritten
      );
    },
    St = n.useCallback(() => {
      (O(!1), g('select'));
    }, []),
    we = h === 'manual',
    ye = h === 'github',
    vt = h === 'scan',
    kt = h === 'default',
    jt = me && H.length > 0,
    wt = we ? '100vw' : ye ? 'min(92vw, 896px)' : 512;
  Se.current = ke;
  const yt = n.useCallback(() => {
    (ae(!1), g('select'));
  }, []);
  return {
    mode: h,
    setMode: gt,
    error: Ke,
    isLoading: P,
    isGenerating: L,
    name: S,
    description: k,
    canGenerateWithAI: Qe,
    githubUrl: U,
    setGithubUrl: ce,
    githubImportNotice: $e,
    annotatedGitHubResults: H,
    selectableGitHubResults: ie,
    selectedGitHubSkills: F,
    githubScanDone: me,
    manualForm: dt,
    existingTags: Ve,
    skillMdEditorRef: pe,
    skillMdToolbars: Oe,
    scanResults: ze,
    isScanning: Fe,
    showScanPreview: Ye,
    installedScanPaths: fe,
    isManualMode: we,
    isGitHubMode: ye,
    isScanMode: vt,
    hasGitHubResults: jt,
    createSkillModalWidth: wt,
    handleCloseRequest: at,
    handleGitHubInstall: it,
    handleImportSelectedGitHubSkills: ut,
    toggleGitHubSkill: ot,
    handleToggleGitHubSelectAll: ct,
    handleManualCreateClick: mt,
    handleManualFieldChange: ht,
    handleMdFileUpload: nt,
    handleAIPolish: rt,
    handleAICreate: lt,
    handleScanLocal: pt,
    handleScanImport: xt,
    handleScanRescan: ft,
    handleCloseScanPreview: yt,
    handleDefaultImport: bt,
    handleCloseDefaultPreview: St,
    defaultScanResults: Ze,
    installedDefaultNames: ge,
    isLoadingDefault: We,
    showDefaultPreview: qe,
    defaultImportNotice: Je,
    isDefaultMode: kt,
    handleDrop: _e,
    handleUploadImg: Be,
    setName: M,
    setDescription: _,
    UnsavedLeaveDialog: st,
  };
}
function ms({ isOpen: r, onClose: d }) {
  const { UnsavedLeaveDialog: u, ...s } = ns({ isOpen: r, onClose: d });
  if (!r) return null;
  const f = e.jsxs('span', {
      className: 'flex items-center gap-2',
      children: [e.jsx(ts, {}), e.jsx('span', { children: es(s.mode) })],
    }),
    m = s.isGitHubMode
      ? e.jsxs('div', {
          'data-testid': 'github-mode-footer',
          className: 'flex justify-end gap-2',
          children: [
            e.jsx(x, { onClick: () => s.setMode('select'), children: '返回' }),
            e.jsx(x, {
              type: 'primary',
              loading: s.isLoading,
              disabled: s.isLoading || (s.githubScanDone && s.selectedGitHubSkills.size === 0),
              icon: e.jsx(Le, { className: 'h-4 w-4' }),
              onClick: s.githubScanDone
                ? s.handleImportSelectedGitHubSkills
                : s.handleGitHubInstall,
              children: s.githubScanDone ? '导入选中' : '扫描仓库',
            }),
          ],
        })
      : s.isManualMode
        ? e.jsxs('div', {
            className: 'flex justify-end gap-2',
            children: [
              e.jsx(x, { onClick: () => s.setMode('select'), children: '返回' }),
              e.jsx(x, {
                type: 'primary',
                loading: s.isLoading,
                disabled: s.isLoading || s.isGenerating || !s.name.trim(),
                icon: e.jsx(Le, { className: 'h-4 w-4' }),
                onClick: () => {
                  s.handleManualCreateClick();
                },
                children: '创建技能',
              }),
            ],
          })
        : null,
    c = s.isDefaultMode && s.showDefaultPreview;
  return e.jsxs(e.Fragment, {
    children: [
      !c &&
        e.jsx(He, {
          open: !0,
          zIndex: 100,
          'data-testid': 'create-skill-modal-container',
          onCancel: s.handleCloseRequest,
          title: f,
          width: s.createSkillModalWidth,
          footer: m,
          centered: !s.isManualMode,
          style: s.isManualMode ? { top: 0, paddingBottom: 0, maxWidth: '100vw' } : void 0,
          styles: s.isManualMode
            ? {
                wrapper: { padding: 0 },
                content: {
                  margin: 0,
                  maxWidth: '100vw',
                  width: '100vw',
                  height: '100vh',
                  display: 'flex',
                  flexDirection: 'column',
                  padding: 0,
                  borderRadius: 0,
                },
                body: { flex: 1, minHeight: 0, overflow: 'auto', paddingTop: 8 },
              }
            : {
                body: {
                  maxHeight:
                    s.isGitHubMode && s.hasGitHubResults ? 'min(85vh, 720px)' : 'min(72vh, 520px)',
                  overflowY: 'auto',
                  paddingTop: 8,
                },
              },
          destroyOnHidden: !1,
          children: e.jsxs('div', {
            className: `p-6 ${s.isManualMode ? '' : s.isGitHubMode || s.isScanMode || s.isDefaultMode ? 'flex min-h-0 flex-col overflow-hidden' : ''}`,
            children: [
              s.error &&
                e.jsx('div', {
                  className:
                    'bg-destructive/10 border-destructive/20 text-destructive mb-4 rounded-lg border p-3 text-sm',
                  children: s.error,
                }),
              s.mode === 'select' && e.jsx(Xt, { onSelectMode: s.setMode }),
              s.isGitHubMode &&
                e.jsx(Vt, {
                  githubUrl: s.githubUrl,
                  onGithubUrlChange: s.setGithubUrl,
                  hasResults: s.hasGitHubResults,
                  importNotice: s.githubImportNotice,
                  annotatedResults: s.annotatedGitHubResults,
                  selectableResults: s.selectableGitHubResults,
                  selectedSlugs: s.selectedGitHubSkills,
                  onToggleSkill: s.toggleGitHubSkill,
                  onToggleSelectAll: s.handleToggleGitHubSelectAll,
                }),
              s.mode === 'manual' &&
                e.jsx(Qt, {
                  form: s.manualForm,
                  existingTags: s.existingTags,
                  canGenerateWithAI: !!s.canGenerateWithAI,
                  isGenerating: s.isGenerating,
                  skillMdEditorRef: s.skillMdEditorRef,
                  skillMdToolbars: s.skillMdToolbars,
                  onFieldChange: s.handleManualFieldChange,
                  onMdFileUpload: s.handleMdFileUpload,
                  onAIPolish: () => {
                    s.handleAIPolish();
                  },
                  onDrop: s.handleDrop,
                  onUploadImg: s.handleUploadImg,
                }),
              s.mode === 'ai' &&
                e.jsx(Jt, {
                  name: s.name,
                  description: s.description,
                  canGenerateWithAI: !!s.canGenerateWithAI,
                  isGenerating: s.isGenerating,
                  onNameChange: s.setName,
                  onDescriptionChange: s.setDescription,
                  onBack: () => s.setMode('select'),
                  onGenerate: () => {
                    s.handleAICreate();
                  },
                }),
              s.isScanMode &&
                !s.showScanPreview &&
                e.jsx(ss, {
                  isScanning: s.isScanning,
                  onStartScan: () => {
                    s.handleScanLocal();
                  },
                }),
            ],
          }),
        }),
      s.showScanPreview &&
        e.jsx(Ne, {
          scannedSkills: s.scanResults,
          installedPaths: s.installedScanPaths,
          onImport: s.handleScanImport,
          onRescan: s.handleScanRescan,
          onClose: s.handleCloseScanPreview,
        }),
      s.showDefaultPreview &&
        e.jsx(Ne, {
          variant: 'default-import',
          scannedSkills: s.defaultScanResults,
          installedNames: s.installedDefaultNames,
          isLoading: s.isLoadingDefault,
          loadError: s.error,
          onImport: s.handleDefaultImport,
          onClose: s.handleCloseDefaultPreview,
        }),
      e.jsx(u, {}),
    ],
  });
}
export { ms as CreateSkillModal };
