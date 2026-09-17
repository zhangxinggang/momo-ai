import { o as A, m as le, M as ne, n as q } from './icons-B5Lu0sqU.js';
import { bu as _, bC as ee, bt as R, bD as re, bE as U, br as Z } from './index-C2avURFS.js';
import { M as K } from './index-Cea5ceJ-.js';
import './markdown-it-vendor-DL4wSELR.js';
import { q as e, P as X } from './markdown-vendor-DldLOD9R.js';
import { r as a, B as m, e as se, M as te } from './ui-vendor-C-FKu2uc.js';
function oe({
  value: t,
  onChange: i,
  onKeyDown: l,
  textareaRef: n,
  placeholder: u = '在这里输入你的 IPrompt...',
}) {
  return e.jsxs('div', {
    className: 'flex min-h-0 flex-1 overflow-hidden',
    children: [
      e.jsxs('div', {
        className: 'border-border flex min-h-0 w-1/2 min-w-0 flex-col overflow-hidden border-r',
        children: [
          e.jsx('div', {
            className:
              'border-border bg-muted/20 text-muted-foreground shrink-0 border-b px-4 py-2 text-xs font-medium',
            children: '编辑',
          }),
          e.jsx(se.TextArea, {
            ref: n,
            className:
              'bg-background box-border min-h-0 w-full flex-1 resize-none border-none p-[10px] font-mono text-base leading-relaxed outline-none',
            value: t,
            onChange: (f) => i(f.target.value),
            onKeyDown: l,
            autoFocus: !0,
            placeholder: u,
            variant: 'borderless',
          }),
        ],
      }),
      e.jsxs('div', {
        className: 'flex min-h-0 w-1/2 min-w-0 flex-col overflow-hidden',
        children: [
          e.jsx('div', {
            className:
              'border-border bg-muted/20 text-muted-foreground shrink-0 border-b px-4 py-2 text-xs font-medium',
            children: '预览',
          }),
          e.jsx('div', {
            className: 'min-h-0 flex-1 overflow-auto p-[10px]',
            children: e.jsx('div', {
              className: 'prose prose-sm markdown-content max-w-none',
              children: t
                ? e.jsx(K, { value: t })
                : e.jsx('div', {
                    className: 'text-muted-foreground text-sm italic',
                    children: '(无)',
                  }),
            }),
          }),
        ],
      }),
    ],
  });
}
const $ = X();
function ae({ getFieldValue: t, setFieldValue: i, getFieldTitle: l }) {
  const [n, u] = a.useState(null),
    [f, x] = a.useState(!1),
    s = a.useCallback((c) => {
      (u(c), x(!0), $.enter());
    }, []),
    h = a.useCallback(() => {
      (u(null), x(!1), $.exit());
    }, []),
    v = n ? t(n) : '',
    b = n ? l(n) : '',
    g = a.useCallback(
      (c) => {
        n && i(n, c);
      },
      [n, i],
    );
  return {
    activeFullscreenField: n,
    fullscreenTitle: b,
    fullscreenValue: v,
    isNativeFullscreen: f,
    enterNativeFullscreen: s,
    exitNativeFullscreen: h,
    updateFullscreenValue: g,
  };
}
function k(t, i) {
  return {
    title: t?.title || i?.title || '',
    systemPrompt: t?.systemPrompt || i?.systemPrompt || '',
    userPrompt: t?.userPrompt || i?.userPrompt || '',
    folderId: t?.folderId ?? i?.folderId,
  };
}
function ie(t) {
  return {
    title: t.title.trim(),
    systemPrompt: t.systemPrompt.trim() || void 0,
    userPrompt: t.userPrompt.trim(),
    tags: [],
    folderId: t.folderId || void 0,
  };
}
function de(t, i) {
  const l = k(i);
  return (
    t.title !== l.title ||
    t.systemPrompt !== l.systemPrompt ||
    t.userPrompt !== l.userPrompt ||
    (t.folderId || void 0) !== (l.folderId || void 0)
  );
}
function pe({
  isOpen: t,
  onClose: i,
  prompt: l,
  initialData: n,
  variant: u = 'modal',
  onAiTest: f,
  onSaved: x,
}) {
  const s = u === 'panel',
    h = s || t,
    { showToast: v } = Z(),
    b = R((r) => r.updatePrompt),
    g = R((r) => r.createPrompt),
    [c, y] = a.useState(''),
    [d, w] = a.useState(''),
    [p, z] = a.useState(!1),
    D = a.useRef(null),
    {
      activeFullscreenField: G,
      fullscreenTitle: W,
      fullscreenValue: P,
      isNativeFullscreen: F,
      enterNativeFullscreen: L,
      exitNativeFullscreen: C,
      updateFullscreenValue: I,
    } = ae({
      getFieldValue: (r) => {
        switch (r) {
          case 'system':
            return c;
          case 'user':
            return d;
        }
      },
      setFieldValue: (r, o) => {
        switch (r) {
          case 'system':
            y(o);
            break;
          case 'user':
            w(o);
            break;
        }
      },
      getFieldTitle: (r) => {
        switch (r) {
          case 'system':
            return '系统提示词（可选）';
          case 'user':
            return '用户提示词';
        }
      },
    }),
    j = a.useMemo(() => ({ ...k(l || n), systemPrompt: c, userPrompt: d }), [n, l, c, d]),
    S = a.useCallback(() => de(j, l || n), [j, n, l]),
    Y = a.useCallback(() => {
      const r = k(l || n);
      (y(r.systemPrompt), w(r.userPrompt));
    }, [n, l]),
    M = a.useCallback(async () => {
      if (!d.trim()) return !1;
      try {
        const r = ie(j);
        if (l) (await b(l.id, r), x?.(l.id));
        else {
          const o = await g(r);
          x?.(o.id);
        }
        return !0;
      } catch (r) {
        return (console.error('Failed to save prompt:', r), v('操作失败', 'error'), !1);
      }
    }, [g, j, x, l, v, b, d]),
    { confirmLeave: H, UnsavedLeaveDialog: J } = _({ isDirty: S, onSave: M, onDiscard: Y }),
    V = a.useCallback(() => {
      (async () => {
        if (!S()) {
          i();
          return;
        }
        (await H()) && i();
      })();
    }, [H, S, i]),
    N = a.useCallback(() => {
      M().then((r) => {
        r && !s && i();
      });
    }, [M, s, i]);
  (a.useEffect(() => {
    if (h) {
      const r = k(l || n);
      (y(r.systemPrompt), w(r.userPrompt));
    }
  }, [l, n, h]),
    a.useEffect(() => {
      if (!t) return;
      const r = (o) => {
        ((o.metaKey || o.ctrlKey) &&
          (o.key === 's' || o.key === 'S' || o.key === 'Enter') &&
          (o.preventDefault(), N()),
          (o.metaKey || o.ctrlKey) &&
            o.shiftKey &&
            (o.key === 'f' || o.key === 'F') &&
            (o.preventDefault(), z((E) => !E)),
          o.key === 'Escape' && F && C());
      };
      return (
        window.addEventListener('keydown', r),
        () => window.removeEventListener('keydown', r)
      );
    }, [t, N, F, C]));
  const O = a.useCallback(
    (r) => {
      ee(r, P, (E, B) => {
        (I(E),
          requestAnimationFrame(() => {
            const T = D.current?.resizableTextArea?.textArea;
            T && ((T.selectionStart = B), (T.selectionEnd = B));
          }));
      });
    },
    [P, I],
  );
  if (F && G)
    return e.jsx(re, {
      open: !0,
      title: W,
      onClose: C,
      zIndex: 9999,
      getContainer: () => document.body,
      destroyOnHidden: !1,
      children: e.jsx(oe, { value: P, onChange: I, onKeyDown: O, textareaRef: D }),
    });
  const Q = s
    ? e.jsxs('div', {
        className: 'flex w-full justify-end gap-2',
        children: [
          e.jsx(m, {
            onClick: () => f?.(),
            disabled: !d.trim(),
            icon: e.jsx(le, { className: 'h-4 w-4' }),
            children: 'AI 测试',
          }),
          e.jsx(m, {
            type: 'primary',
            onClick: N,
            disabled: !d.trim(),
            icon: e.jsx(q, { className: 'h-4 w-4' }),
            children: '保存',
          }),
        ],
      })
    : e.jsxs('div', {
        className: 'flex w-full items-center justify-between gap-3',
        children: [
          e.jsx(m, {
            type: 'text',
            size: 'small',
            onClick: () => z(!p),
            className:
              'text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg p-2 transition-colors',
            title: p ? '退出全屏' : '全屏',
            icon: p ? e.jsx(ne, { className: 'h-4 w-4' }) : e.jsx(A, { className: 'h-4 w-4' }),
          }),
          e.jsxs('div', {
            className: 'flex flex-1 justify-end gap-2',
            children: [
              e.jsx(m, { onClick: V, children: '取消' }),
              e.jsx(m, {
                type: 'primary',
                onClick: N,
                disabled: !d.trim(),
                icon: e.jsx(q, { className: 'h-4 w-4' }),
                children: l ? '保存' : '创建',
              }),
            ],
          }),
        ],
      });
  return e.jsxs(te, {
    open: h,
    onCancel: s ? void 0 : V,
    title: s ? void 0 : l ? '编辑 IPrompt' : '创建 IPrompt',
    width: s ? '100%' : p ? 'calc(100vw - 96px)' : 900,
    footer: Q,
    closable: !s,
    mask: !s,
    centered: !s,
    getContainer: s ? !1 : void 0,
    destroyOnHidden: !1,
    className: s ? 'prompt-form-panel-modal' : void 0,
    style: s ? { top: 0, margin: 0, maxWidth: '100%', paddingBottom: 0 } : void 0,
    styles: s
      ? {
          wrapper: {
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            justifyContent: 'flex-start',
            overflow: 'hidden',
          },
          container: {
            flex: '1 1 auto',
            height: '100%',
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: 'none',
            padding: 0,
            margin: 0,
            overflow: 'hidden',
          },
          header: { display: 'none', margin: 0, padding: 0 },
          body: {
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            padding: 10,
          },
          footer: { flexShrink: 0, margin: 0, padding: 10, borderTop: '1px solid var(--border)' },
        }
      : { body: { maxHeight: p ? 'calc(100vh - 140px)' : 'min(70vh, 720px)', overflowY: 'auto' } },
    children: [
      e.jsxs('div', {
        className: s ? 'flex min-h-0 flex-1 flex-col gap-5' : 'space-y-5',
        children: [
          e.jsxs('div', {
            className: s ? 'flex min-h-0 flex-[2] flex-col gap-2' : 'space-y-2',
            children: [
              e.jsxs('div', {
                className: 'flex items-center justify-between',
                children: [
                  e.jsxs('label', {
                    className: 'text-foreground block text-sm font-medium',
                    children: [
                      '用户提示词',
                      e.jsx('span', { className: 'text-destructive ml-2 text-xs', children: '*' }),
                    ],
                  }),
                  e.jsx(m, {
                    type: 'text',
                    size: 'small',
                    onClick: () => L('user'),
                    className:
                      'hover:bg-muted text-muted-foreground hover:text-foreground border-border rounded-lg border p-1.5 transition-colors',
                    title: '全屏编辑',
                    icon: e.jsx(A, { className: 'h-4 w-4' }),
                  }),
                ],
              }),
              e.jsxs('div', {
                className: `border-border flex overflow-hidden rounded-xl border ${s ? 'min-h-0 flex-1' : 'min-h-[280px]'}`,
                children: [
                  e.jsx('div', {
                    className: 'border-border flex h-full min-h-0 w-1/2 flex-col border-r',
                    children: e.jsx(U, {
                      placeholder:
                        '输入你的 IPrompt 内容，可以使用 {{变量名}} 或 {{变量名:示例值}} 定义变量...',
                      value: d,
                      onChange: (r) => w(r.target.value),
                      fillHeight: s,
                      className: s
                        ? 'flex-1 rounded-none border-0'
                        : 'min-h-[280px] flex-1 rounded-none border-0',
                      enableMarkdownList: !0,
                    }),
                  }),
                  e.jsxs('div', {
                    className: 'bg-muted/30 flex w-1/2 flex-col',
                    children: [
                      e.jsx('div', {
                        className:
                          'border-border bg-muted/50 text-muted-foreground shrink-0 border-b px-3 py-1.5 text-xs font-medium',
                        children: '预览',
                      }),
                      e.jsx('div', {
                        className: 'flex-1 overflow-auto p-4',
                        children: e.jsx('div', {
                          className: 'prose prose-sm markdown-content max-w-none',
                          children: d
                            ? e.jsx(K, { value: d })
                            : e.jsx('div', {
                                className: 'text-muted-foreground text-sm italic',
                                children: '(无)',
                              }),
                        }),
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          e.jsxs('div', {
            className: s ? 'flex min-h-0 flex-1 flex-col gap-2' : 'space-y-2',
            children: [
              e.jsxs('div', {
                className: 'flex items-center justify-between',
                children: [
                  e.jsx('label', {
                    className: 'text-foreground block text-sm font-medium',
                    children: '系统提示词（可选）',
                  }),
                  e.jsx(m, {
                    type: 'text',
                    size: 'small',
                    onClick: () => L('system'),
                    className:
                      'hover:bg-muted text-muted-foreground hover:text-foreground border-border rounded-lg border p-1.5 transition-colors',
                    title: '全屏编辑',
                    icon: e.jsx(A, { className: 'h-4 w-4' }),
                  }),
                ],
              }),
              e.jsxs('div', {
                className: `border-border flex overflow-hidden rounded-xl border ${s ? 'min-h-0 flex-1' : 'min-h-[200px]'}`,
                children: [
                  e.jsx('div', {
                    className: 'border-border flex h-full min-h-0 w-1/2 flex-col border-r',
                    children: e.jsx(U, {
                      placeholder: '设置 AI 的角色和行为...',
                      value: c,
                      onChange: (r) => y(r.target.value),
                      fillHeight: s,
                      className: s
                        ? 'flex-1 rounded-none border-0'
                        : 'min-h-[200px] flex-1 rounded-none border-0',
                      enableMarkdownList: !0,
                    }),
                  }),
                  e.jsxs('div', {
                    className: 'bg-muted/30 flex w-1/2 flex-col',
                    children: [
                      e.jsx('div', {
                        className:
                          'border-border bg-muted/50 text-muted-foreground shrink-0 border-b px-3 py-1.5 text-xs font-medium',
                        children: '预览',
                      }),
                      e.jsx('div', {
                        className: 'flex-1 overflow-auto p-4',
                        children: e.jsx('div', {
                          className: 'prose prose-sm markdown-content max-w-none',
                          children: c
                            ? e.jsx(K, { value: c })
                            : e.jsx('div', {
                                className: 'text-muted-foreground text-sm italic',
                                children: '(无)',
                              }),
                        }),
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      e.jsx(J, {}),
    ],
  });
}
export { pe as EditPromptModal };
