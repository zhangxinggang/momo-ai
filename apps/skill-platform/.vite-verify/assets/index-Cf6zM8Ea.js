const __vite__mapDeps = (
  i,
  m = __vite__mapDeps,
  d = m.f ||
    (m.f = [
      './index-C2avURFS.js',
      './markdown-vendor-DldLOD9R.js',
      './ui-vendor-C-FKu2uc.js',
      './markdown-it-vendor-DL4wSELR.js',
      './markdown-vendor-CmuYMs8x.css',
      './icons-B5Lu0sqU.js',
      './index-DUUm-ELF.css',
    ]),
) => i.map((i) => d[i]);
import { W as ee, k as te } from './icons-B5Lu0sqU.js';
import {
  bp as c,
  bh as G,
  br as K,
  bq as Q,
  bs as V,
  bt as W,
  bu as Y,
  bv as z,
} from './index-C2avURFS.js';
import './markdown-it-vendor-DL4wSELR.js';
import { _ as $, q as t } from './markdown-vendor-DldLOD9R.js';
import { r as s, B as S, M as X, e as Z } from './ui-vendor-C-FKu2uc.js';
function se({
  aiModels: i,
  scenarioModelDefaults: a,
  aiProvider: m,
  aiApiProtocol: l,
  aiApiKey: d,
  aiApiUrl: p,
  aiModel: g,
}) {
  return Q({
    aiModels: i,
    scenarioModelDefaults: a,
    scenario: 'quickAdd',
    type: 'chat',
    aiProvider: m,
    aiApiProtocol: l,
    aiApiKey: d,
    aiApiUrl: p,
    aiModel: g,
  });
}
function re(i, a = 'New IPrompt') {
  return (
    i
      .trim()
      .split(
        `
`,
      )
      .map((l) => l.trim())
      .find(Boolean)
      ?.slice(0, 30) || a
  );
}
function me({ isOpen: i, onClose: a, onCreate: m }) {
  const { showToast: l } = K(),
    d = V((e) => e.folders),
    p = c((e) => e.aiModels),
    g = c((e) => e.scenarioModelDefaults),
    _ = c((e) => e.aiProvider),
    M = c((e) => e.aiApiKey),
    L = c((e) => e.aiApiUrl),
    T = c((e) => e.aiModel),
    R = W((e) => e.prompts),
    [n, b] = s.useState(''),
    [P, j] = s.useState(!1),
    [o, f] = s.useState(void 0),
    D = s.useRef(null),
    x = s.useMemo(
      () =>
        se({
          aiModels: p,
          scenarioModelDefaults: g,
          aiProvider: _,
          aiApiKey: M,
          aiApiUrl: L,
          aiModel: T,
        }),
      [M, L, T, p, _, g],
    ),
    k = s.useCallback(() => n.trim() !== '', [n]),
    w = s.useCallback(() => {
      (b(''), f(void 0));
    }, []),
    E = s.useCallback(
      async (e, u) => {
        try {
          const I = d.map((r) => r.name).join(', '),
            h = [...new Set(R.flatMap((r) => r.tags || []))].sort(),
            C = h.length > 0 ? h.join(', ') : '无现有标签',
            A = `请分析以下用户提供的 IPrompt，并返回 JSON 格式的结果：
  
用户 IPrompt:
"""
${u}
"""

可用的文件夹列表：
${I || '暂无文件夹'}

已知存在的标签（请优先从这些标签中提取或匹配）：
${C}

请分析并返回以下 JSON 格式（不要包含任何其他文字，只返回纯 JSON）：
{
  "title": "为这个 IPrompt 起一个简洁的标题（不超过20字）",
  "systemPrompt": "如果 IPrompt 中包含系统提示词/角色设定，提取出来；如果没有，根据 IPrompt 内容生成一个合适的系统提示词",
  "suggestedFolder": "根据内容推荐最适合的文件夹名称，如果没有合适的则返回 null",
  "tags": ["根据内容提取关键词作为标签，优先使用已存在的标签，如果必要可以生成1-2个新标签"]
}`,
            U = (await G(x, [{ role: 'user', content: A }], { temperature: 0.3 })).content.match(
              /\{[\s\S]*\}/,
            );
          if (U) {
            const r = JSON.parse(U[0]);
            let F = o;
            if (!F && r.suggestedFolder) {
              const y = d.find(
                (v) =>
                  v.name.toLowerCase().includes(r.suggestedFolder.toLowerCase()) ||
                  r.suggestedFolder.toLowerCase().includes(v.name.toLowerCase()),
              );
              y && (F = y.id);
            }
            const { usePromptStore: H } = await $(
              async () => {
                const { usePromptStore: y } = await import('./index-C2avURFS.js').then((v) => v.er);
                return { usePromptStore: y };
              },
              __vite__mapDeps([0, 1, 2, 3, 4, 5, 6]),
              import.meta.url,
            );
            await H.getState().updatePrompt(e.id, {
              title: r.title || e.title,
              systemPrompt: r.systemPrompt,
              folderId: F,
              tags: Array.isArray(r.tags) ? r.tags : [],
            });
          }
        } catch (I) {
          console.error('Background AI analysis failed:', I);
          const { usePromptStore: h } = await $(
            async () => {
              const { usePromptStore: C } = await import('./index-C2avURFS.js').then((A) => A.er);
              return { usePromptStore: C };
            },
            __vite__mapDeps([0, 1, 2, 3, 4, 5, 6]),
            import.meta.url,
          );
          await h.getState().updatePrompt(e.id, { title: re(u, '新建提示词') });
        }
      },
      [x, d, R, o],
    ),
    N = s.useCallback(async () => {
      if (!n.trim() || P) return !1;
      if (!x) return (l('请先在设置中配置 AI 供应商，才能使用智能分析功能。', 'error'), !1);
      j(!0);
      try {
        const e = n,
          u = await m({ title: '正在分析...', userPrompt: e, folderId: o });
        return u ? (w(), E(u, e), !0) : !1;
      } finally {
        j(!1);
      }
    }, [x, P, m, n, w, E, o, l]),
    { confirmLeave: O, UnsavedLeaveDialog: q } = Y({ isDirty: k, onSave: N, onDiscard: w }),
    B = s.useCallback(() => {
      (async () => {
        if (!k()) {
          a();
          return;
        }
        (await O()) && a();
      })();
    }, [O, k, a]),
    J = s.useCallback(() => {
      N().then((e) => {
        e && a();
      });
    }, [N, a]);
  return (
    s.useEffect(() => {
      i && (b(''), f(void 0), j(!1));
    }, [i]),
    t.jsxs(t.Fragment, {
      children: [
        t.jsx(X, {
          open: i,
          onCancel: B,
          title: t.jsxs('span', {
            className: 'flex items-center gap-2',
            children: [
              t.jsx(te, { className: 'text-primary h-5 w-5' }),
              t.jsx('span', { children: '快速添加' }),
            ],
          }),
          width: 672,
          footer: t.jsxs('div', {
            className: 'flex justify-end gap-2',
            children: [
              t.jsx(S, { onClick: B, children: "'取消'" }),
              t.jsx(S, {
                type: 'primary',
                loading: P,
                disabled: !n.trim(),
                onClick: () => {
                  J();
                },
                children: '创建',
              }),
            ],
          }),
          destroyOnHidden: !0,
          afterOpenChange: (e) => {
            e && setTimeout(() => D.current?.focus?.(), 100);
          },
          styles: { body: { maxHeight: 'min(70vh, 520px)', overflowY: 'auto', paddingTop: 8 } },
          children: t.jsxs('div', {
            className: 'space-y-6',
            children: [
              t.jsxs('div', {
                className: 'space-y-2',
                children: [
                  t.jsxs('label', {
                    className: 'text-muted-foreground text-sm font-medium',
                    children: [
                      '粘贴你的 IPrompt',
                      t.jsx('span', { className: 'text-destructive ml-1', children: '*' }),
                    ],
                  }),
                  t.jsx(Z.TextArea, {
                    ref: D,
                    value: n,
                    onChange: (e) => b(e.target.value),
                    placeholder: '在这里粘贴你的 IPrompt 内容...',
                    rows: 10,
                    className: 'text-sm leading-relaxed',
                    style: { minHeight: '12rem' },
                  }),
                ],
              }),
              t.jsxs('div', {
                className: 'space-y-2',
                children: [
                  t.jsx('label', {
                    className: 'text-muted-foreground text-sm font-medium',
                    children: '文件夹（可选）',
                  }),
                  t.jsxs('div', {
                    className:
                      'custom-scrollbar grid max-h-40 grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3',
                    children: [
                      t.jsxs(S, {
                        type: o ? 'default' : 'primary',
                        onClick: () => f(void 0),
                        className: `flex h-auto items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-all ${o ? 'bg-muted/30 text-muted-foreground hover:bg-muted/50 border-transparent' : 'bg-primary/10 border-primary/30 text-primary'}`,
                        children: [
                          t.jsx(ee, { className: 'h-4 w-4 shrink-0' }),
                          t.jsx('span', { className: 'truncate', children: 'AI 智能自动分类' }),
                        ],
                      }),
                      d.map((e) =>
                        t.jsxs(
                          S,
                          {
                            type: o === e.id ? 'primary' : 'default',
                            onClick: () => f(e.id),
                            className: `flex h-auto items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-all ${o === e.id ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-muted/30 text-muted-foreground hover:bg-muted/50 border-transparent'}`,
                            title: e.name,
                            children: [
                              t.jsx('span', {
                                className: 'flex h-5 w-5 shrink-0 items-center justify-center',
                                children: z(e.icon),
                              }),
                              t.jsx('span', { className: 'truncate', children: e.name }),
                            ],
                          },
                          e.id,
                        ),
                      ),
                    ],
                  }),
                ],
              }),
            ],
          }),
        }),
        t.jsx(q, {}),
      ],
    })
  );
}
export { me as QuickAddModal };
