import { b as ke } from './icons-B5Lu0sqU.js';
import {
  br as be,
  bH as Ce,
  bF as l,
  bK as Se,
  bL as Te,
  bI as ve,
  bp as we,
  bG as xe,
  bJ as ye,
} from './index-C2avURFS.js';
import './markdown-it-vendor-DL4wSELR.js';
import { Q as _e, S as Ee, R as fe, q as r } from './markdown-vendor-DldLOD9R.js';
import { f as ie, r as n } from './ui-vendor-C-FKu2uc.js';
const Me = '_composer_1s2tb_1',
  Ne = '_hint_1s2tb_72',
  g = {
    composer: Me,
    'status-rail': '_status-rail_1s2tb_8',
    'status-rail-bar': '_status-rail-bar_1s2tb_14',
    'status-rail--rewriting': '_status-rail--rewriting_1s2tb_23',
    'status-rail--done': '_status-rail--done_1s2tb_26',
    'status-rail--stopped': '_status-rail--stopped_1s2tb_27',
    'status-rail--error': '_status-rail--error_1s2tb_30',
    'status-rail-row': '_status-rail-row_1s2tb_33',
    'status-rail-text': '_status-rail-text_1s2tb_41',
    'status-rail-undo': '_status-rail-undo_1s2tb_52',
    'input-wrap': '_input-wrap_1s2tb_68',
    hint: Ne,
  };
function Ie(s, a) {
  return [
    {
      role: 'system',
      content: `你正在改写用户的当前笔记。用户指令会要求你润色、缩短、补全，或就笔记内容作答。

约束：
1. 只输出改写后的完整 Markdown 正文，作为新的笔记全文
2. 不要解释、不要前言后语、不要用代码围栏包裹全文
3. 若用户是提问，把完整回答作为新的笔记正文

当前笔记：
${s.trim() ? s : '（当前笔记为空）'}`,
    },
    { role: 'user', content: a },
  ];
}
function je(s) {
  const a = s.trim();
  return /^```(?:markdown|md)?\r?\n([\s\S]*?)\r?\n```$/i.exec(a)?.[1] ?? s;
}
var o = ((s) => (
  (s.EIdle = 'idle'),
  (s.ERewriting = 'rewriting'),
  (s.EDone = 'done'),
  (s.EStopped = 'stopped'),
  (s.EError = 'error'),
  s
))(o || {});
const Ae = 10,
  Re = 5e4;
function De(s) {
  if (s.length === 0) return '';
  const a = Math.max(1, Math.floor(Re / s.length));
  return [
    '以下为用户上传的文件内容（可能已截断），回答可引用并标注文件名：',
    ...s.map((p) => {
      const d = p.text || '',
        h = d.length > a ? d.slice(0, a) : d;
      return [
        `--- 文件: ${p.name} (type=${p.ext}, chars=${h.length}) START ---`,
        h,
        `--- 文件: ${p.name} END ---`,
      ].join(`
`);
    }),
  ].join(`

`);
}
function ze({ noteKey: s, onRewritingChange: a }) {
  const { showToast: u } = be(),
    p = l((e) => e.editorContent),
    d = l((e) => e.setEditorContent),
    h = l((e) => e.saveCurrentFile),
    {
      callAIChatStream: F,
      uploadFiles: $,
      validateLocalFiles: U,
      isImageModel: x,
      superpowerPrompts: B,
    } = xe(),
    {
      currentModel: S,
      kbEnabled: L,
      kbCollectionId: W,
      temperature: X,
      topP: q,
      systemPrompt: I,
      agentMode: O,
    } = Ce(),
    [j, J] = n.useState(''),
    [i, t] = n.useState(o.EIdle),
    [re, H] = n.useState(''),
    [K, Q] = n.useState(null),
    [V, T] = n.useState(null),
    [E, G] = n.useState([]),
    [Y, ae] = n.useState(!1),
    [le, Z] = n.useState({}),
    k = n.useRef(!1),
    ee = n.useRef(0),
    te = n.useRef(a);
  te.current = a;
  const C = i === o.ERewriting,
    A = !!(S && x?.(S)),
    de = K !== null && (i === o.EDone || i === o.EStopped || i === o.EError);
  (n.useEffect(() => {
    te.current(C);
  }, [C]),
    n.useEffect(
      () => () => {
        ((k.current = !0), te.current(!1));
      },
      [],
    ),
    n.useEffect(() => {
      C ||
        (i !== o.EDone && i !== o.EStopped && i !== o.EError) ||
        V === null ||
        p === V ||
        (t(o.EIdle), Q(null), T(null), H(''));
    }, [V, p, C, i]));
  const ce = n.useCallback(() => {
      K !== null && (d(K), T(K), Q(null), t(o.EIdle), H(''), h());
    }, [h, d, K]),
    ue = n.useCallback(() => {
      if (!k.current && i === o.ERewriting) {
        k.current = !0;
        const e = l.getState().editorContent;
        (T(e), t(o.EStopped), h());
      }
    }, [h, i]),
    me = n.useCallback(
      async (e) => {
        if (!e.length) return;
        if (E.length + e.length > Ae) {
          u('单次最多 10 个附件', 'error');
          return;
        }
        const v = U(e);
        if (!v.ok) {
          u(v.message || '文件不合法', 'error');
          return;
        }
        const f = e.map((m) => {
          const w = (m.name.split('.').pop() || '').toLowerCase();
          return {
            id: `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            name: m.name,
            size: m.size,
            mime: m.type || '',
            ext: w,
            text: '',
            snippet: '',
          };
        });
        (G((m) => [...m, ...f]), ae(!0));
        for (let m = 0; m < e.length; m += 1) {
          const w = e[m],
            M = f[m].id;
          try {
            const [y] = await $([w], (D, b) => {
              Z((N) => ({ ...N, [M]: b }));
            });
            G((D) => D.map((b) => (b.id === M ? y : b)));
          } catch (y) {
            const D = y instanceof Error ? y.message : `${w.name} 上传失败`;
            (u(D, 'error'), G((b) => b.filter((N) => N.id !== M)));
          }
        }
        ae(!1);
      },
      [E.length, u, $, U],
    ),
    pe = n.useCallback((e) => {
      (G((v) => v.filter((f) => f.id !== e)),
        Z((v) => {
          const f = { ...v };
          return (delete f[e], f);
        }));
    }, []),
    ne = n.useCallback(() => {
      const e = !!j.trim(),
        v = E.some((c) => c.imageBase64 && c.mime.startsWith('image/'));
      if ((!e && !(A && v) && E.length === 0) || C || Y) return;
      const f = j.trim(),
        m = De(E),
        w = E.filter((c) => c.imageBase64 && c.mime.startsWith('image/')).map((c) => ({
          name: c.name,
          mimeType: c.mime || 'image/png',
          base64: c.imageBase64,
        }));
      let M = f;
      !A && E.length > 0
        ? (M = `${m}

我的问题：
${f || '(基于以上文件，请给出总结/见解)'}`)
        : A && !f && w.length > 0 && (M = '请根据参考图生成或编辑图片');
      const y = l.getState().editorContent,
        D = s,
        b = ee.current + 1;
      ((ee.current = b),
        (k.current = !1),
        J(''),
        G([]),
        Z({}),
        Q(y),
        T(null),
        H(''),
        t(o.ERewriting));
      const N = () => ee.current === b && l.getState().selectedId === D,
        oe = [];
      (O === 'plan' && B?.workflow?.trim() && oe.push(B.workflow.trim()),
        I.trim() && oe.push(I.trim()),
        (async () => {
          let c = '',
            se = '';
          try {
            if (
              (await F(
                Ie(y, M),
                (P) => {
                  k.current || !N() || ((c += P), d(c));
                },
                (P) => {
                  se = P;
                },
                void 0,
                S,
                {
                  temperature: X,
                  top_p: q,
                  user_system_prompt:
                    oe.join(`

`) || void 0,
                  kb_enabled: A ? !1 : L,
                  kb_collection_id: W,
                  kb_top_k: 6,
                  referenceImages: A && w.length > 0 ? w : void 0,
                },
              ),
              !N() || k.current)
            )
              return;
            if (se) throw new Error(se);
            const z = je(c);
            (d(z), T(z), t(o.EDone), h());
          } catch (z) {
            if (!N() || k.current) return;
            const P = z instanceof Error ? z.message : String(z);
            if (!c) {
              (d(y), Q(null), T(null), t(o.EError), H(P));
              return;
            }
            const ge = l.getState().editorContent;
            (T(ge), t(o.EError), H(P), h());
          }
        })());
    }, [O, E, F, S, A, C, Y, W, L, s, j, h, d, B, I, X, q]),
    he = n.useCallback(
      (e) => {
        e.nativeEvent.isComposing ||
          (e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), ne()));
      },
      [ne],
    );
  let R = '';
  return (
    i === o.ERewriting
      ? (R = '正在改写…')
      : i === o.EDone
        ? (R = '已改写全文')
        : i === o.EStopped
          ? (R = '已停止')
          : i === o.EError && (R = re ? `改写失败：${re}` : '改写失败'),
    r.jsxs('div', {
      className: g.composer,
      children: [
        r.jsxs('div', {
          className: ie(
            g['status-rail'],
            i === o.ERewriting && g['status-rail--rewriting'],
            i === o.EDone && g['status-rail--done'],
            i === o.EStopped && g['status-rail--stopped'],
            i === o.EError && g['status-rail--error'],
          ),
          children: [
            r.jsx('div', { className: g['status-rail-bar'] }),
            R
              ? r.jsxs('div', {
                  className: g['status-rail-row'],
                  children: [
                    r.jsx('span', { className: g['status-rail-text'], children: R }),
                    de
                      ? r.jsx('button', {
                          type: 'button',
                          className: g['status-rail-undo'],
                          onClick: ce,
                          'aria-label': '撤销本次改写',
                          children: '撤销本次',
                        })
                      : null,
                  ],
                })
              : null,
          ],
        }),
        r.jsxs('div', {
          className: g['input-wrap'],
          children: [
            r.jsx('p', { className: g.hint, children: '基于当前笔记提问，发送后将改写全文' }),
            r.jsx(ve, {
              value: j,
              onChange: J,
              onSend: ne,
              onStop: ue,
              onKeyDown: he,
              placeholder: '缩短、润色或提问，发送后将改写这篇笔记',
              loading: C,
              isGenerating: C,
              attachments: E.map((e) => ({
                id: e.id,
                name: e.name,
                size: e.size,
                mime: e.mime,
                ext: e.ext,
                snippet: e.snippet,
                charCount: typeof e.text == 'string' ? e.text.length : void 0,
                imageBase64: e.imageBase64,
              })),
              isUploading: Y,
              progressMap: le,
              onAttachFiles: me,
              onRemoveAttachment: pe,
            }),
          ],
        }),
      ],
    })
  );
}
const Pe = '_note_1eayz_1',
  _ = {
    note: Pe,
    'note-editor': '_note-editor_1eayz_9',
    'note-editor-shell': '_note-editor-shell_1eayz_17',
    'note-editor-toolbar': '_note-editor-toolbar_1eayz_24',
    'note-editor-path': '_note-editor-path_1eayz_33',
    'note-editor-toolbar-actions': '_note-editor-toolbar-actions_1eayz_41',
    'note-editor-save-hint': '_note-editor-save-hint_1eayz_47',
    'note-editor-body': '_note-editor-body_1eayz_51',
    'note-editor-md': '_note-editor-md_1eayz_58',
    'note-editor-md--locked': '_note-editor-md--locked_1eayz_67',
    'note-editor-loading': '_note-editor-loading_1eayz_102',
  },
  Fe = fe,
  $e = 2e3;
function Ue(s) {
  return s.replace(/[^a-zA-Z0-9_-]/g, '_');
}
function Be() {
  return Ee();
}
const Le = Be();
function Xe() {
  const s = we((t) => t.isDarkMode),
    a = l((t) => t.selectedId),
    u = l((t) => t.editorContent),
    p = l((t) => t.savedContent),
    d = l((t) => t.isLoadingFile),
    h = l((t) => t.isSaving),
    F = l((t) => t.setEditorContent),
    $ = l((t) => t.saveCurrentFile),
    U = l((t) => t.loadTree),
    [x, B] = n.useState(!1),
    S = n.useRef($);
  S.current = $;
  const L = n.useRef(null),
    { handleDrop: W, handleUploadImg: X } = ye(L),
    q = s ? 'dark' : 'light',
    [I, O] = _e('cyanosis'),
    j = Se({ content: u, exportTitle: a ?? 'note', previewTheme: I, onPreviewThemeChange: O }),
    J = n.useMemo(() => `note-md-${Ue(a ?? 'none')}`, [a]);
  (n.useEffect(() => {
    U();
  }, [U]),
    n.useEffect(() => {
      if (!a || d || x || u === p) return;
      const t = window.setTimeout(() => {
        S.current();
      }, $e);
      return () => {
        window.clearTimeout(t);
      };
    }, [u, x, d, p, a]));
  const i = n.useCallback(
    (t) => {
      x || F(t);
    },
    [x, F],
  );
  return r.jsx('div', {
    className: _.note,
    children: r.jsx('div', {
      className: _['note-editor'],
      children: a
        ? r.jsxs('div', {
            className: _['note-editor-shell'],
            children: [
              r.jsxs('div', {
                className: _['note-editor-toolbar'],
                children: [
                  r.jsx('span', { className: _['note-editor-path'], title: a, children: a }),
                  r.jsx('div', {
                    className: _['note-editor-toolbar-actions'],
                    children: h
                      ? r.jsx('span', {
                          className: _['note-editor-save-hint'],
                          children: '保存中...',
                        })
                      : u !== p
                        ? r.jsx('span', {
                            className: _['note-editor-save-hint'],
                            children: '未保存',
                          })
                        : null,
                  }),
                ],
              }),
              r.jsx('div', {
                className: _['note-editor-body'],
                children: d
                  ? r.jsx('div', { className: _['note-editor-loading'], children: '加载中…' })
                  : r.jsx('div', {
                      className: ie(_['note-editor-md'], x && _['note-editor-md--locked']),
                      children: r.jsx(
                        Fe,
                        {
                          ref: L,
                          id: J,
                          value: u,
                          onChange: i,
                          theme: q,
                          preview: !0,
                          previewTheme: I,
                          onPreviewThemeChange: O,
                          noPrettier: !0,
                          inputBoxWidth: '50%',
                          footers: [],
                          toolbars: Le,
                          toolbarsExclude: [],
                          defToolbars: j,
                          onDrop: W,
                          onUploadImg: X,
                          readOnly: x,
                          style: { height: '100%' },
                        },
                        a,
                      ),
                    }),
              }),
              r.jsx(ze, { noteKey: a, onRewritingChange: B }, a),
            ],
          })
        : r.jsx(Te, {
            centered: !0,
            icon: ke,
            title: '在左侧选择或新建笔记',
            description: '从侧栏目录选择已有笔记，或新建目录与笔记开始写作',
          }),
    }),
  });
}
export { Xe as NoteManager };
