import {
  R as A,
  P as B,
  a as ce,
  D as de,
  C as ie,
  F as j,
  T as le,
  c as me,
  S as ne,
  b as oe,
} from './icons-B5Lu0sqU.js';
import { ba as se } from './index-C2avURFS.js';
import { c as _, S as ee, n as te } from './index-CSjkvQbC.js';
import './markdown-it-vendor-DL4wSELR.js';
import { q as e } from './markdown-vendor-DldLOD9R.js';
import { M as ae, r as l, B as m, e as O, C as re } from './ui-vendor-C-FKu2uc.js';
function je({
  scannedSkills: h,
  installedPaths: b,
  variant: q = 'local-scan',
  installedNames: p,
  isLoading: v = !1,
  loadError: S = null,
  onImport: P,
  onRescan: C,
  onClose: I,
}) {
  const r = q === 'default-import',
    T = se((t) => t.skills),
    H = l.useMemo(() => _(T), [T]),
    [d, x] = l.useState(new Set()),
    [y, K] = l.useState(''),
    [w, Q] = l.useState(!1),
    [k, V] = l.useState({}),
    [u, z] = l.useState(!1),
    [f, $] = l.useState([]),
    [N, D] = l.useState(''),
    [F, E] = l.useState(!1),
    [M, G] = l.useState(!1),
    c = l.useMemo(
      () =>
        h.map((t) => ({
          ...t,
          isInstalled: r ? (p?.has(t.name.toLowerCase()) ?? !1) : (b?.has(t.localPath) ?? !1),
        })),
      [h, b, p, r],
    ),
    J = l.useMemo(() => c.filter((t) => !t.isInstalled), [c]);
  l.useEffect(() => {
    if (!r) return;
    const t = new Set(h.filter((s) => !p?.has(s.name.toLowerCase())).map((s) => s.localPath));
    x(t);
  }, [r, h, p]);
  const g = l.useMemo(() => {
      const t = y.trim().toLowerCase();
      return t
        ? c.filter((s) =>
            [s.name, s.description, s.author, s.localPath, ...s.tags, ...s.platforms].some((o) =>
              o?.toLowerCase().includes(t),
            ),
          )
        : c;
    }, [c, y]),
    i = l.useMemo(() => (r ? g : g.filter((t) => !t.isInstalled)), [g, r]),
    L = (t) => {
      x((s) => {
        const a = new Set(s);
        return (a.has(t) ? a.delete(t) : a.add(t), a);
      });
    },
    U = () => {
      if (i.length === 0) return;
      const t = i.every((s) => d.has(s.localPath));
      x(
        t
          ? (s) => {
              const a = new Set(s);
              return (i.forEach((o) => a.delete(o.localPath)), a);
            }
          : (s) => {
              const a = new Set(s);
              return (i.forEach((o) => a.add(o.localPath)), a);
            },
      );
    },
    W = async () => {
      const s = (r ? c : J).filter((a) => d.has(a.localPath));
      if (s.length !== 0) {
        z(!0);
        try {
          const a = r
            ? await P(s)
            : await P(s, Object.fromEntries(s.map((o) => [o.localPath, k[o.localPath] || []])));
          (!r || a > 0) && I();
        } catch (a) {
          console.error('Import failed:', a);
        } finally {
          z(!1);
        }
      }
    },
    R = () => {
      const t = N.trim();
      !t || f.includes(t) || ($((s) => [...s, t]), D(''));
    },
    X = (t) => {
      $((s) => s.filter((a) => a !== t));
    },
    Y = (t, s) => {
      V((a) => ({ ...a, [t]: te(s) }));
    },
    Z = async () => {
      if (C) {
        E(!0);
        try {
          (await C(f), x(new Set()));
        } finally {
          E(!1);
        }
      }
    };
  return e.jsxs(ae, {
    open: !0,
    zIndex: 1050,
    onCancel: I,
    title: e.jsxs('div', {
      className: 'flex w-full flex-wrap items-center justify-between gap-3 pr-8',
      children: [
        e.jsxs('div', {
          className: 'flex flex-wrap items-center gap-3',
          children: [
            r
              ? e.jsx(B, { className: 'text-primary h-5 w-5 shrink-0' })
              : e.jsx(j, { className: 'text-primary h-5 w-5 shrink-0' }),
            e.jsx('span', {
              className: 'text-lg font-semibold',
              children: r ? '选择要导入的默认技能' : '扫描预览',
            }),
            e.jsxs('span', {
              className: 'text-muted-foreground bg-accent/50 rounded-full px-2 py-0.5 text-xs',
              children: [c.length, ' ', '技能'],
            }),
          ],
        }),
        !r &&
          e.jsxs('div', {
            className: 'flex items-center gap-1',
            children: [
              e.jsx(m, {
                type: 'text',
                size: 'small',
                icon: e.jsx(me, { className: 'h-4 w-4' }),
                onClick: () => G((t) => !t),
                className: M ? '!text-primary' : '',
                title: '自定义扫描路径',
                children: e.jsx('span', { className: 'hidden sm:inline', children: '添加' }),
              }),
              e.jsx(m, {
                type: 'text',
                size: 'small',
                icon: e.jsx(A, { className: `h-4 w-4 ${F ? 'animate-spin' : ''}` }),
                onClick: () => {
                  Z();
                },
                disabled: F,
                title: '重新扫描',
              }),
            ],
          }),
      ],
    }),
    footer:
      c.length > 0 && !v
        ? e.jsx('div', {
            className: 'flex justify-end',
            children: e.jsx(m, {
              type: 'primary',
              disabled: d.size === 0 || u,
              loading: u,
              icon: u ? void 0 : e.jsx(de, { className: 'h-4 w-4' }),
              onClick: () => {
                W();
              },
              children: u ? '导入中...' : `导入选中 (${d.size})`,
            }),
          })
        : null,
    width: 672,
    styles: {
      body: {
        padding: 0,
        maxHeight: 'min(85vh, 860px)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      },
      mask: { backdropFilter: 'blur(4px)' },
    },
    destroyOnHidden: !1,
    children: [
      !r &&
        M &&
        e.jsxs('div', {
          className: 'border-border bg-accent/20 shrink-0 space-y-2 border-b px-6 py-3',
          children: [
            e.jsx('p', {
              className: 'text-muted-foreground text-xs',
              children: '添加自定义扫描路径后，点击「重新扫描」生效。',
            }),
            f.length > 0 &&
              e.jsx('div', {
                className: 'space-y-1',
                children: f.map((t) =>
                  e.jsxs(
                    'div',
                    {
                      className:
                        'app-wallpaper-surface border-border flex items-center gap-2 rounded border px-2 py-1 text-xs',
                      children: [
                        e.jsx(j, { className: 'text-primary h-3 w-3 shrink-0' }),
                        e.jsx('span', { className: 'flex-1 truncate font-mono', children: t }),
                        e.jsx(m, {
                          type: 'text',
                          danger: !0,
                          onClick: () => X(t),
                          className: 'text-muted-foreground hover:text-destructive h-auto p-0',
                          icon: e.jsx(le, { className: 'h-3 w-3' }),
                        }),
                      ],
                    },
                    t,
                  ),
                ),
              }),
            e.jsxs('div', {
              className: 'flex items-center gap-2',
              children: [
                e.jsx(O, {
                  value: N,
                  onChange: (t) => D(t.target.value),
                  onKeyDown: (t) => t.key === 'Enter' && R(),
                  placeholder: '~/path/to/skills',
                  className: 'app-wallpaper-surface border-border flex-1 font-mono text-xs',
                }),
                e.jsx(m, {
                  type: 'primary',
                  size: 'small',
                  onClick: R,
                  disabled: !N.trim(),
                  children: '添加',
                }),
              ],
            }),
          ],
        }),
      e.jsx('div', {
        className: 'min-h-0 flex-1 space-y-3 overflow-y-auto p-6',
        children: v
          ? e.jsxs('div', {
              className: 'text-muted-foreground flex flex-col items-center justify-center py-16',
              children: [
                e.jsx(A, { className: 'text-primary mb-4 h-10 w-10 animate-spin opacity-70' }),
                e.jsx('p', { className: 'text-sm', children: '正在加载默认技能...' }),
              ],
            })
          : e.jsxs(e.Fragment, {
              children: [
                c.length > 0 &&
                  !r &&
                  e.jsxs('div', {
                    className:
                      'border-border app-wallpaper-surface/60 flex flex-col gap-3 rounded-2xl border p-4',
                    children: [
                      e.jsxs('div', {
                        className:
                          'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between',
                        children: [
                          e.jsxs('label', {
                            className: 'relative block flex-1',
                            children: [
                              e.jsx(ne, {
                                className:
                                  'text-muted-foreground pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2',
                              }),
                              e.jsx(O, {
                                value: y,
                                onChange: (t) => K(t.target.value),
                                placeholder: '按名称、描述、标签、平台或路径搜索',
                                className:
                                  'border-border app-wallpaper-surface h-10 w-full rounded-xl pl-9 text-sm',
                              }),
                            ],
                          }),
                          e.jsx(m, {
                            onClick: () => Q((t) => !t),
                            icon: e.jsx(ce, { className: 'h-4 w-4' }),
                            className: `inline-flex h-auto items-center gap-2 rounded-xl border px-3 py-2 text-sm ${w ? 'border-primary/40 bg-primary/5 text-primary' : 'border-border app-wallpaper-surface text-muted-foreground hover:text-foreground'}`,
                            children: w ? '隐藏可选标签' : '需要时再加标签',
                          }),
                        ],
                      }),
                      e.jsx('div', {
                        className: 'text-muted-foreground text-xs',
                        children: `显示 ${i.length}/${c.length}，已选 ${d.size}`,
                      }),
                    ],
                  }),
                c.length === 0
                  ? e.jsx('div', {
                      className:
                        'text-muted-foreground flex flex-col items-center justify-center py-12',
                      children: r
                        ? e.jsxs(e.Fragment, {
                            children: [
                              e.jsx(B, { className: 'mb-4 h-12 w-12 opacity-20' }),
                              e.jsx('h3', {
                                className: 'text-sm font-medium',
                                children: S || '暂无默认技能包',
                              }),
                              !S &&
                                e.jsx('p', {
                                  className: 'mt-1 text-xs opacity-70',
                                  children: '请确认 default/skills 目录下是否已放置有效的 zip 文件',
                                }),
                            ],
                          })
                        : e.jsxs(e.Fragment, {
                            children: [
                              e.jsx(j, { className: 'mb-4 h-12 w-12 opacity-20' }),
                              e.jsx('h3', {
                                className: 'text-sm font-medium',
                                children: '未发现新的本地 SKILL.md 文件。',
                              }),
                              e.jsx('p', {
                                className: 'mt-1 text-xs opacity-70',
                                children: '请确认是否已安装 Claude Code、Cursor 等工具',
                              }),
                              e.jsx('p', {
                                className: 'mt-1 text-xs opacity-60',
                                children: '或在上方添加自定义路径后重新扫描',
                              }),
                            ],
                          }),
                    })
                  : e.jsxs(e.Fragment, {
                      children: [
                        i.length > 0 &&
                          e.jsxs('div', {
                            className:
                              'bg-accent/30 mb-2 flex items-center justify-between rounded-lg px-3 py-2',
                            children: [
                              e.jsxs('span', {
                                className: 'text-muted-foreground text-xs',
                                children: [
                                  i.filter((t) => d.has(t.localPath)).length,
                                  ' ',
                                  '/ ',
                                  i.length,
                                  ' ',
                                  '已选择',
                                ],
                              }),
                              e.jsx(m, {
                                type: 'link',
                                size: 'small',
                                onClick: U,
                                className: 'text-primary h-auto p-0 text-xs',
                                children: i.every((t) => d.has(t.localPath)) ? '取消全选' : '全选',
                              }),
                            ],
                          }),
                        e.jsx('div', {
                          className: 'grid grid-cols-1 gap-4 lg:grid-cols-2',
                          children: g.map((t) => {
                            const s = d.has(t.localPath),
                              a = (() => {
                                if (r) return t.localPath.replace(/^default:/, '');
                                const n = t.localPath
                                  .replace(/\\/g, '/')
                                  .split('/')
                                  .filter(Boolean);
                                return n.length >= 2
                                  ? `.../${n[n.length - 2]}/${n[n.length - 1]}`
                                  : t.localPath;
                              })(),
                              o = r || !t.isInstalled;
                            return e.jsx(
                              m,
                              {
                                className: `h-auto w-full whitespace-normal rounded-2xl border p-4 text-left shadow-sm ${o ? (s ? 'bg-primary/5 border-primary/40 shadow-primary/10' : 'app-wallpaper-surface border-border hover:border-primary/30 hover:shadow-md') : 'bg-muted/30 border-border cursor-default opacity-70'}`,
                                onClick: () => o && L(t.localPath),
                                children: e.jsxs('div', {
                                  className: 'flex items-start gap-3',
                                  children: [
                                    e.jsx('div', {
                                      className: `mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl ${t.isInstalled ? 'bg-accent text-muted-foreground' : 'bg-primary/10 text-primary'}`,
                                      children: e.jsx(oe, { className: 'h-5 w-5' }),
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
                                                      children: t.name,
                                                    }),
                                                    t.version &&
                                                      e.jsxs('span', {
                                                        className:
                                                          'bg-primary/10 text-primary rounded-full px-2 py-0.5 text-[10px]',
                                                        children: ['v', t.version],
                                                      }),
                                                    t.isInstalled &&
                                                      e.jsx('span', {
                                                        className:
                                                          'bg-accent text-muted-foreground rounded-full px-2 py-0.5 text-[10px]',
                                                        children: r ? '已存在' : '已导入',
                                                      }),
                                                  ],
                                                }),
                                                t.author &&
                                                  e.jsx('p', {
                                                    className:
                                                      'text-muted-foreground mt-1 text-[11px]',
                                                    children: t.author,
                                                  }),
                                              ],
                                            }),
                                            e.jsx('div', {
                                              className: 'shrink-0 pt-0.5',
                                              children:
                                                t.isInstalled && !r
                                                  ? e.jsx(ie, {
                                                      className: 'text-muted-foreground h-5 w-5',
                                                    })
                                                  : e.jsx(re, {
                                                      checked: s,
                                                      onChange: () => L(t.localPath),
                                                      onClick: (n) => n.stopPropagation(),
                                                    }),
                                            }),
                                          ],
                                        }),
                                        t.description &&
                                          e.jsx('p', {
                                            className:
                                              'text-muted-foreground mt-3 line-clamp-3 text-xs leading-5',
                                            children: t.description,
                                          }),
                                        e.jsx('div', {
                                          className: 'mt-3 flex flex-wrap gap-1.5',
                                          children: t.platforms.map((n) =>
                                            e.jsx(
                                              'span',
                                              {
                                                className:
                                                  'bg-primary/8 text-primary/80 rounded-full px-2 py-0.5 text-[10px]',
                                                children: n,
                                              },
                                              n,
                                            ),
                                          ),
                                        }),
                                        !r &&
                                          !t.isInstalled &&
                                          s &&
                                          w &&
                                          e.jsx(ee, {
                                            bordered: !0,
                                            className: 'mt-4',
                                            compact: !0,
                                            label: '导入标签（可选）',
                                            onChange: (n) => Y(t.localPath, n),
                                            onClick: (n) => n.stopPropagation(),
                                            options: H,
                                            value: k[t.localPath] || [],
                                          }),
                                        e.jsxs('div', {
                                          className:
                                            'text-muted-foreground/60 mt-4 flex items-center gap-1 truncate font-mono text-[11px]',
                                          title: t.localPath,
                                          children: [
                                            e.jsx(j, { className: 'h-3 w-3 shrink-0' }),
                                            e.jsx('span', { className: 'truncate', children: a }),
                                          ],
                                        }),
                                      ],
                                    }),
                                  ],
                                }),
                              },
                              t.localPath,
                            );
                          }),
                        }),
                      ],
                    }),
              ],
            }),
      }),
    ],
  });
}
export { je as SkillScanPreview };
