import {
  b as bs,
  m as fs,
  u as gs,
  X as hs,
  D as js,
  r as Me,
  I as O,
  s as ps,
  t as xs,
  c as ys,
} from './icons-B5Lu0sqU.js';
import {
  ce as as,
  bs as Ce,
  ch as cs,
  bH as Ee,
  cb as es,
  c0 as Ge,
  c6 as He,
  bL as is,
  c3 as Je,
  bt as k,
  c1 as Ke,
  cg as ls,
  bg as ns,
  c2 as Oe,
  cf as os,
  br as qe,
  c9 as Qe,
  bD as rs,
  cc as ss,
  cd as ts,
  c4 as Ue,
  c5 as We,
  bp as we,
  c7 as Xe,
  c8 as Ye,
  ca as Ze,
} from './index-C2avURFS.js';
import { M as ds } from './index-Cea5ceJ-.js';
import { EditPromptModal as vs } from './index-D1wZ_XjT.js';
import './markdown-it-vendor-DL4wSELR.js';
import { q as s } from './markdown-vendor-DldLOD9R.js';
import { m as us } from './testing-qyiiDhJu.js';
import { r as a, a as ms, U as Se, e as se, B as y } from './ui-vendor-C-FKu2uc.js';
function Ns({ sessionId: o }) {
  const { switchToSession: p, currentSessionId: n } = Ee(),
    x = a.useRef(null);
  return (
    a.useEffect(
      () => (
        (x.current = Ge()),
        () => {
          (Ke(x.current), window.dispatchEvent(new Event(Oe)));
        }
      ),
      [o],
    ),
    a.useEffect(() => {
      n !== o && p(o);
    }, [o, p, n]),
    null
  );
}
function ws({
  sessionKey: o,
  bootstrapSessionId: p,
  bootstrapSessionTitle: n,
  services: x,
  className: h,
  children: g,
}) {
  return s.jsxs(
    Je,
    {
      services: x,
      bootstrapSessionId: p,
      bootstrapSessionTitle: n,
      children: [
        p ? s.jsx(Ns, { sessionId: p }) : null,
        s.jsx('div', { className: h, children: g }),
      ],
    },
    o,
  );
}
function te(o, p, n, x) {
  const h = [];
  let g = p;
  if (n)
    for (const [u, m] of Object.entries(n)) g = g.replace(new RegExp(`\\{\\{${u}\\}\\}`, 'g'), m);
  if (o) {
    let u = o;
    if (n)
      for (const [m, j] of Object.entries(n)) u = u.replace(new RegExp(`\\{\\{${m}\\}\\}`, 'g'), j);
    h.push({ role: 'system', content: u });
  }
  if (x && x.length > 0) {
    const u = [
      { type: 'text', text: g },
      ...x.map((m) => ({
        type: 'image_url',
        image_url: { url: `data:${m.mimeType};base64,${m.base64}` },
      })),
    ];
    h.push({ role: 'user', content: u });
  } else h.push({ role: 'user', content: g });
  return h;
}
function Cs({
  systemPrompt: o,
  userPrompt: p,
  onLoadingChange: n,
  onAfterSend: x,
  renderAssistantMessageActions: h,
}) {
  const {
      isAILoading: g,
      currentSession: u,
      currentSessionId: m,
      addMessage: j,
      updateMessage: l,
    } = Ee(),
    f = Ue();
  return (
    a.useEffect(() => {
      n?.(g);
    }, [g, n]),
    a.useEffect(() => {
      if (!m) return;
      const b = o.trim(),
        N = u?.messages.find((P) => P.role === 'system');
      if (b) {
        if (N) {
          N.content !== b && l(m, N.id, { content: b });
          return;
        }
        j(m, { role: 'system', content: b });
      }
    }, [o, m, u, j, l]),
    s.jsx(We, {
      ...f,
      inputValue: p,
      hideWelcome: !0,
      onAfterSend: x,
      renderAssistantMessageActions: h,
      placeholder: '输入用户提示词或继续对话...',
    })
  );
}
function Ss({
  sessionKey: o,
  bootstrapSessionId: p,
  bootstrapSessionTitle: n,
  services: x,
  systemPrompt: h,
  userPrompt: g,
  onLoadingChange: u,
  onAfterSend: m,
  renderAssistantMessageActions: j,
}) {
  return s.jsx(ws, {
    sessionKey: o,
    bootstrapSessionId: p,
    bootstrapSessionTitle: n,
    services: x,
    className: 'flex min-h-0 flex-1 flex-col',
    children: s.jsx(Cs, {
      systemPrompt: h,
      userPrompt: g,
      onLoadingChange: u,
      onAfterSend: m,
      renderAssistantMessageActions: j,
    }),
  });
}
const T = 8,
  re = 10 * 1024 * 1024,
  Ms = new Set(['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']);
function Es({
  isOpen: o,
  onClose: p,
  prompt: n,
  initialMode: x,
  filledSystemPrompt: h,
  filledUserPrompt: g,
  onUsageIncrement: u,
  onSaveResponse: m,
  onAddImage: j,
}) {
  const { showToast: l } = qe(),
    [f, b] = a.useState('single'),
    [N, P] = a.useState(null),
    [A, d] = a.useState(!1),
    [F, J] = a.useState(!1),
    U = a.useRef([]),
    [ne, R] = a.useState(null),
    [oe, W] = a.useState([]),
    [B, le] = a.useState([]),
    [E, ce] = a.useState({}),
    [C, q] = a.useState('text'),
    [H, Ie] = a.useState('response'),
    [z, ke] = a.useState(''),
    D = a.useRef({}),
    _ = a.useRef(null),
    [S, X] = a.useState([]),
    [ie, de] = a.useState([]),
    w = we((e) => e.aiModels),
    me = we((e) => e.scenarioModelDefaults),
    ue = He(w),
    fe = Xe(w),
    pe = Ye(),
    v = a.useMemo(() => Qe(w, me, 'imageTest', 'image'), [w, me]);
  a.useMemo(() => Ze(w, 'image'), [w]);
  const L = a.useMemo(
    () => (f === 'image' ? [] : w.filter((e) => (e.type ?? 'chat') === 'chat')),
    [w, f],
  );
  (a.useEffect(() => {
    le((e) => e.filter((t) => L.some((r) => r.id === t)));
  }, [L]),
    a.useEffect(() => {
      !o || !n || b(x ?? 'single');
    }, [x, o, n]),
    a.useEffect(() => {
      if (!o) return;
      const e = (r) => {
        r.key === 'Escape' && p();
      };
      document.addEventListener('keydown', e);
      const t = document.body.style.overflow;
      return (
        (document.body.style.overflow = 'hidden'),
        () => {
          (document.removeEventListener('keydown', e), (document.body.style.overflow = t));
        }
      );
    }, [o, p]));
  const Y = a.useCallback(() => {
      R(
        (e) =>
          e &&
          e.map((t) => {
            const r = t.id ? D.current[t.id] : void 0;
            return r ? { ...t, response: r.response } : t;
          }),
      );
    }, []),
    Te = a.useCallback(() => {
      _.current === null &&
        (_.current = requestAnimationFrame(() => {
          ((_.current = null),
            ms.flushSync(() => {
              Y();
            }));
        }));
    }, [Y]),
    $ = a.useCallback(() => {
      (_.current !== null && (cancelAnimationFrame(_.current), (_.current = null)),
        (D.current = {}));
    }, []),
    xe = (e) => {
      const t = /\{\{([^}]+)\}\}/g,
        r = [];
      let i;
      for (; (i = t.exec(e)) !== null; ) r.includes(i[1]) || r.push(i[1]);
      return r;
    },
    V = a.useMemo(() => {
      if (!n) return [];
      const e = xe(n.systemPrompt || ''),
        t = xe(n.userPrompt);
      return [...new Set([...e, ...t])];
    }, [n]),
    G = a.useCallback((e) => e.replace(/\{\{([^}]+)\}\}/g, (t, r) => E[r] || t), [E]),
    he = a.useMemo(() => (n && n.systemPrompt) || '', [n]),
    ge = a.useMemo(() => (n ? n.userPrompt : ''), [n]),
    I = a.useMemo(() => h ?? G(he), [h, G, he]),
    M = a.useMemo(() => g ?? G(ge), [g, G, ge]),
    ye = a.useCallback(
      (e) =>
        new Promise((t, r) => {
          const i = new FileReader();
          ((i.onload = () => {
            if (typeof i.result != 'string') {
              r(new Error('无法读取图片'));
              return;
            }
            const c = i.result.indexOf(',');
            if (c === -1) {
              r(new Error('无法读取图片'));
              return;
            }
            t({
              id: `${e.name}-${e.size}-${e.lastModified}-${Math.random().toString(36).slice(2, 8)}`,
              name: e.name,
              mimeType: e.type,
              size: e.size,
              dataUrl: i.result,
              base64: i.result.slice(c + 1),
            });
          }),
            (i.onerror = () => r(new Error('无法读取图片'))),
            i.readAsDataURL(e));
        }),
      [],
    ),
    K = a.useCallback(
      (e) =>
        e >= 1024 * 1024
          ? `${(e / 1024 / 1024).toFixed(1)} MB`
          : `${Math.max(1, Math.round(e / 1024))} KB`,
      [],
    ),
    je = a.useCallback(
      async (e) => {
        if (e.length === 0) return;
        const t = T - S.length;
        if (t <= 0) {
          l(`最多只能附加 ${T} 张图片`, 'error');
          return;
        }
        const r = [...e];
        r.length > t && l(`最多只能附加 ${T} 张图片`, 'error');
        const i = [];
        for (const c of r.slice(0, t)) {
          if (!Ms.has(c.type)) {
            l(`${c.name} 不是图片文件`, 'error');
            continue;
          }
          if (c.size > re) {
            l(`${c.name} 超过 ${K(re)}`, 'error');
            continue;
          }
          i.push(c);
        }
        if (i.length !== 0)
          try {
            const c = await Promise.all(i.map(ye));
            X((ee) => [...ee, ...c].slice(0, T));
          } catch (c) {
            l(c instanceof Error ? c.message : '无法读取图片', 'error');
          }
      },
      [K, ye, l, S.length],
    ),
    Pe = a.useCallback((e, t) => (je(t), Se.LIST_IGNORE), [je]),
    Ae = a.useCallback((e) => {
      X((t) => t.filter((r) => r.id !== e));
    }, []);
  a.useCallback((e) => {
    de((t) => (t.includes(e) ? t.filter((r) => r !== e) : [...t, e]));
  }, []);
  const Q = a.useCallback(
      async () => [
        ...(
          await Promise.all(
            ie.map(async (t) => {
              const r = await es(t);
              if (!r) return null;
              const i = t.split('.').pop()?.toLowerCase();
              return {
                name: t,
                mimeType:
                  i === 'jpg' || i === 'jpeg'
                    ? 'image/jpeg'
                    : i === 'webp'
                      ? 'image/webp'
                      : i === 'gif'
                        ? 'image/gif'
                        : 'image/png',
                base64: r,
              };
            }),
          )
        ).filter((t) => t !== null),
        ...S.map((t) => ({ name: t.name, mimeType: t.mimeType, base64: t.base64 })),
      ],
      [ie, S],
    ),
    be = a.useCallback(() => {
      if (C !== 'text') {
        if (C === 'json_schema' && z)
          try {
            return {
              type: C,
              jsonSchema: { name: H || 'response', strict: !0, schema: JSON.parse(z) },
            };
          } catch {
            return { type: 'json_schema' };
          }
        return { type: C };
      }
    }, [z, H, C]),
    ve = a.useCallback(async () => {
      if (f === 'single') {
        const t = te(I, '', E);
        U.current = t.filter((r) => r.role === 'system');
        return;
      }
      const e = f === 'image' ? await Q() : void 0;
      U.current = te(I, M, E, e);
    }, [Q, f, I, M, E]);
  (a.useEffect(() => {
    !o || !n || ve();
  }, [o, n, ve]),
    a.useEffect(() => {
      if (!o || !n) {
        P(null);
        return;
      }
      const e = ss();
      P({ sessionId: e, sessionKey: `prompt-test-${e}`, sessionTitle: `提示词测试：${n.title}` });
    }, [o, n?.id, n?.title]));
  const Z = a.useRef(n?.id);
  Z.current = n?.id;
  const _e = a.useMemo(
    () =>
      ts({
        aiModels: w,
        chatModelOptionGroups: fe,
        workspace: pe,
        enableSuperpower: !1,
        noAttachmentsMessage: '不是图片文件',
        callAIChatStream: as({
          getModelConfig: (e) => ue.current.getModelConfig(e),
          getDefaultConfig: () => ue.current.getModelConfig(),
          getBaseMessages: () => U.current,
          getResponseFormat: be,
          onComplete: (e) => {
            m && Z.current && m(Z.current, e);
          },
          onErrorToast: (e) => l(e, 'error'),
          onNeedModel: () => l('请先在设置中配置 AI 对话模型', 'error'),
        }),
      }),
    [w, fe, be, m, l, pe],
  );
  if (
    (a.useEffect(() => {
      if (o && n) {
        ($(), R(null), W([]), X([]), de([]), d(!1), J(!1));
        const e = {};
        (V.forEach((t) => {
          e[t] = '';
        }),
          ce(e));
      }
    }, [o, n?.id, V, $]),
    a.useEffect(
      () => () => {
        $();
      },
      [$],
    ),
    !n)
  )
    return null;
  const $e = async () => {
      const e = [
        I.trim()
          ? `【系统】
${I.trim()}`
          : '',
        M.trim()
          ? `【用户】
${M.trim()}`
          : '',
      ].filter(Boolean).join(`

`);
      if (!e) {
        l('没有可复制的内容', 'warning');
        return;
      }
      try {
        (await navigator.clipboard.writeText(e), l('已复制', 'success'));
      } catch {
        l('复制失败', 'error');
      }
    },
    Re = async (e) => {
      const t = e.trim();
      if (!t) {
        l('没有可保存的内容', 'warning');
        return;
      }
      if (m) {
        (await m(n.id, t), l('已保存回复', 'success'));
        return;
      }
      l('当前环境不支持保存回复', 'warning');
    },
    Be = async () => {
      if (B.length < 2) return;
      (d(!0), R(null), u && u(n.id));
      const e = L.filter((r) => B.includes(r.id)).map((r) => ({
          id: r.id,
          provider: r.provider,
          apiProtocol: r.apiProtocol,
          apiKey: r.apiKey,
          apiUrl: r.apiUrl,
          model: r.model,
          chatParams: r.chatParams,
          imageParams: r.imageParams,
        })),
        t = te(I, M, E);
      try {
        ($(),
          (D.current = Object.fromEntries(e.map((c) => [c.id, { response: '' }]))),
          R(
            e.map((c) => ({
              id: c.id,
              success: !0,
              response: '',
              latency: 0,
              model: c.model,
              provider: c.provider,
            })),
          ));
        const r = new Map();
        for (const c of e)
          c.chatParams?.stream &&
            r.set(c.id, {
              onContent: (ee) => {
                const Ne = D.current[c.id];
                Ne && ((Ne.response += ee), Te());
              },
            });
        const i = await us(e, t, { streamCallbacksMap: r });
        (Y(), R(i.results));
      } catch {
      } finally {
        ($(), d(!1));
      }
    },
    Fe = (e) => {
      le((t) => (t.includes(e) ? t.filter((r) => r !== e) : [...t, e]));
    },
    ze = async () => {
      if (!v) {
        l('请先配置生图模型', 'error');
        return;
      }
      (J(!0), W([]), u && u(n.id));
      try {
        const e = {
            provider: v.provider,
            apiProtocol: v.apiProtocol,
            apiKey: v.apiKey,
            apiUrl: v.apiUrl,
            model: v.model,
          },
          t = await Q(),
          r = await ns(e, M, { n: 1, referenceImages: t }),
          i = [];
        for (const c of r.data)
          c.url ? i.push(c.url) : c.b64_json && i.push(`data:image/png;base64,${c.b64_json}`);
        (W(i), i.length > 0 && l('图片生成成功', 'success'));
      } catch (e) {
        l(`操作失败: ${e instanceof Error ? e.message : '操作失败'}`, 'error');
      } finally {
        J(!1);
      }
    },
    De = (e) =>
      s.jsx('div', {
        className: 'markdown-content break-words text-[15px] leading-relaxed',
        children: s.jsx(ds, { value: e }),
      }),
    Le = async (e) => {
      if (j)
        try {
          if (e.startsWith('http')) {
            const t = await os(e);
            t ? (j(t), l('图片已添加到 IPrompt', 'success')) : l('上传失败', 'error');
          } else if (e.startsWith('data:')) {
            const t = e.split(',')[1],
              r = `generated-${Date.now()}.png`;
            (await ls(r, t), j(r), l('图片已添加到 IPrompt', 'success'));
          }
        } catch {
          l('上传失败', 'error');
        }
    },
    Ve = async (e, t) => {
      try {
        const r = document.createElement('a');
        ((r.href = e),
          (r.download = `generated-image-${t + 1}.png`),
          document.body.appendChild(r),
          r.click(),
          document.body.removeChild(r),
          l('下载成功', 'success'));
      } catch {
        l('下载失败', 'error');
      }
    };
  return o
    ? s.jsx(rs, {
        open: o,
        title: s.jsxs('div', {
          children: [
            s.jsx('div', { className: 'text-sm font-semibold', children: 'AI 测试' }),
            s.jsx('div', {
              className: 'text-muted-foreground truncate text-xs',
              children: n.title,
            }),
          ],
        }),
        onClose: p,
        footer: null,
        showDefaultFooter: !1,
        zIndex: 9999,
        destroyOnHidden: !1,
        children: s.jsx('aside', {
          className: 'flex h-full min-h-0 flex-col',
          children: s.jsx('div', {
            className: `flex min-h-0 flex-1 flex-col px-5 py-4 ${f === 'single' ? 'overflow-hidden' : 'overflow-y-auto'}`,
            children: s.jsxs('div', {
              className: `space-y-4 ${f === 'single' ? 'flex min-h-0 flex-1 flex-col' : ''}`,
              children: [
                s.jsxs('div', {
                  className: 'border-border flex flex-wrap items-center gap-2 border-b pb-4',
                  children: [
                    s.jsxs(s.Fragment, {
                      children: [
                        s.jsx(y, {
                          type: f === 'single' ? 'primary' : 'default',
                          onClick: () => b('single'),
                          className:
                            'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium',
                          icon: s.jsx(fs, { className: 'h-4 w-4' }),
                          children: 'AI 测试',
                        }),
                        s.jsx(y, {
                          type: f === 'compare' ? 'primary' : 'default',
                          onClick: () => b('compare'),
                          className:
                            'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium',
                          icon: s.jsx(Me, { className: 'h-4 w-4' }),
                          children: '多模型对比',
                        }),
                      ],
                    }),
                    s.jsx(y, {
                      type: f === 'image' ? 'primary' : 'default',
                      onClick: () => b('image'),
                      className: 'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium',
                      icon: s.jsx(O, { className: 'h-4 w-4' }),
                      children: '测试生图',
                    }),
                  ],
                }),
                V.length > 0 &&
                  s.jsxs('div', {
                    className: 'space-y-3',
                    children: [
                      s.jsxs('h4', {
                        className:
                          'text-muted-foreground flex items-center gap-1.5 text-sm font-medium',
                        children: [
                          s.jsx(ps, { className: 'h-4 w-4' }),
                          '请填写以下变量的值（自动记住历史输入）',
                        ],
                      }),
                      s.jsx('div', {
                        className: 'grid grid-cols-1 gap-3 md:grid-cols-2',
                        children: V.map((e) =>
                          s.jsxs(
                            'div',
                            {
                              className: 'space-y-1',
                              children: [
                                s.jsx('label', {
                                  className: 'text-muted-foreground font-mono text-xs',
                                  children: `{{${e}}}`,
                                }),
                                s.jsx(se, {
                                  value: E[e] || '',
                                  onChange: (t) => ce((r) => ({ ...r, [e]: t.target.value })),
                                  placeholder: '输入值',
                                  className:
                                    'bg-muted/50 border-border focus:ring-primary/50 w-full rounded-md border px-3 py-1.5 text-sm focus:outline-none focus:ring-2',
                                }),
                              ],
                            },
                            e,
                          ),
                        ),
                      }),
                    ],
                  }),
                f !== 'single' &&
                  s.jsxs('div', {
                    className: 'space-y-2',
                    children: [
                      s.jsx('h4', {
                        className: 'text-muted-foreground text-sm font-medium',
                        children: 'User IPrompt',
                      }),
                      s.jsx('div', {
                        className: 'bg-muted/50 max-h-32 overflow-y-auto rounded-lg p-3',
                        children: s.jsx('p', {
                          className: 'whitespace-pre-wrap text-sm',
                          children: M,
                        }),
                      }),
                    ],
                  }),
                f === 'image' &&
                  s.jsxs('div', {
                    className: 'space-y-3',
                    children: [
                      s.jsxs('div', {
                        className: 'flex items-center justify-between gap-3',
                        children: [
                          s.jsxs('div', {
                            className: 'space-y-1',
                            children: [
                              s.jsxs('h4', {
                                className:
                                  'text-muted-foreground flex items-center gap-1.5 text-sm font-medium',
                                children: [s.jsx(xs, { className: 'h-4 w-4' }), '参考图片'],
                              }),
                              s.jsx('p', {
                                className: 'text-muted-foreground text-xs',
                                children: `支持 PNG、JPG、WebP、GIF，用于多模态对话模型识别图片。最多 ${T} 张，每张不超过 ${K(re)}。`,
                              }),
                            ],
                          }),
                          s.jsx(Se, {
                            showUploadList: !1,
                            multiple: !0,
                            accept: 'image/png,image/jpeg,image/webp,image/gif',
                            beforeUpload: Pe,
                            disabled: S.length >= T,
                            children: s.jsx(y, {
                              disabled: S.length >= T,
                              className:
                                'border-border bg-background hover:bg-accent flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors disabled:opacity-50',
                              icon: s.jsx(O, { className: 'h-4 w-4' }),
                              children: '添加图片',
                            }),
                          }),
                        ],
                      }),
                      S.length > 0 &&
                        s.jsxs('div', {
                          className: 'space-y-2',
                          children: [
                            s.jsx('div', {
                              className: 'text-muted-foreground text-xs font-medium',
                              children: '已上传的参考图片',
                            }),
                            s.jsx('div', {
                              className: 'grid grid-cols-2 gap-3 sm:grid-cols-4',
                              children: S.map((e) =>
                                s.jsxs(
                                  'div',
                                  {
                                    className:
                                      'border-border bg-muted/40 relative overflow-hidden rounded-lg border',
                                    children: [
                                      s.jsx('img', {
                                        src: e.dataUrl,
                                        alt: e.name,
                                        className: 'h-24 w-full object-cover',
                                      }),
                                      s.jsx(y, {
                                        type: 'text',
                                        size: 'small',
                                        onClick: () => Ae(e.id),
                                        className:
                                          'bg-background/90 text-foreground hover:bg-background absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full shadow-sm',
                                        title: '移除图片',
                                        icon: s.jsx(hs, { className: 'h-3.5 w-3.5' }),
                                      }),
                                      s.jsxs('div', {
                                        className: 'space-y-0.5 px-2 py-1.5',
                                        children: [
                                          s.jsx('p', {
                                            className: 'truncate text-xs font-medium',
                                            title: e.name,
                                            children: e.name,
                                          }),
                                          s.jsx('p', {
                                            className: 'text-muted-foreground text-[10px]',
                                            children: K(e.size),
                                          }),
                                        ],
                                      }),
                                    ],
                                  },
                                  e.id,
                                ),
                              ),
                            }),
                          ],
                        }),
                    ],
                  }),
                f === 'single' &&
                  s.jsxs('div', {
                    className: 'flex min-h-0 flex-1 flex-col space-y-4',
                    children: [
                      s.jsxs('div', {
                        className: 'space-y-3',
                        children: [
                          s.jsx('h4', {
                            className: 'text-muted-foreground text-sm font-medium',
                            children: '输出格式',
                          }),
                          s.jsxs('div', {
                            className: 'flex flex-wrap gap-2',
                            children: [
                              s.jsx(y, {
                                type: C === 'text' ? 'primary' : 'default',
                                size: 'small',
                                shape: 'round',
                                onClick: () => q('text'),
                                className: 'rounded-full px-3 py-1.5 text-xs font-medium',
                                children: '文本',
                              }),
                              s.jsx(y, {
                                type: C === 'json_object' ? 'primary' : 'default',
                                size: 'small',
                                shape: 'round',
                                onClick: () => q('json_object'),
                                className: 'rounded-full px-3 py-1.5 text-xs font-medium',
                                children: 'JSON 模式',
                              }),
                              s.jsx(y, {
                                type: C === 'json_schema' ? 'primary' : 'default',
                                size: 'small',
                                shape: 'round',
                                onClick: () => q('json_schema'),
                                className: 'rounded-full px-3 py-1.5 text-xs font-medium',
                                children: 'JSON Schema',
                              }),
                            ],
                          }),
                          C === 'json_schema' &&
                            s.jsxs('div', {
                              className:
                                'bg-muted/50 border-border space-y-2 rounded-lg border p-3',
                              children: [
                                s.jsxs('div', {
                                  className: 'space-y-1',
                                  children: [
                                    s.jsx('label', {
                                      className: 'text-muted-foreground text-xs',
                                      children: 'Schema 名称',
                                    }),
                                    s.jsx(se, {
                                      value: H,
                                      onChange: (e) => Ie(e.target.value),
                                      placeholder: 'Schema 名称'.toLowerCase(),
                                      className:
                                        'bg-background border-border focus:ring-primary/50 w-full rounded-md border px-3 py-1.5 text-sm focus:outline-none focus:ring-2',
                                    }),
                                  ],
                                }),
                                s.jsxs('div', {
                                  className: 'space-y-1',
                                  children: [
                                    s.jsx('label', {
                                      className: 'text-muted-foreground text-xs',
                                      children: 'Schema 定义',
                                    }),
                                    s.jsx(se.TextArea, {
                                      value: z,
                                      onChange: (e) => ke(e.target.value),
                                      placeholder: `输入 JSON Schema，例如：
{
  "type": "object",
  "properties": {
    "answer": { "type": "string" }
  },
  "required": ["answer"]
}`,
                                      rows: 6,
                                      className:
                                        'bg-background border-border focus:ring-primary/50 w-full resize-none rounded-md border px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2',
                                    }),
                                    s.jsx('p', {
                                      className: 'text-muted-foreground text-xs',
                                      children: '定义输出的 JSON 结构，AI 将严格遵循此格式返回',
                                    }),
                                  ],
                                }),
                              ],
                            }),
                        ],
                      }),
                      s.jsxs('div', {
                        className:
                          'border-border/60 flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border',
                        children: [
                          s.jsx('div', {
                            className:
                              'border-border flex shrink-0 items-center gap-2 border-b px-3 py-2',
                            children: s.jsx(y, {
                              type: 'text',
                              size: 'small',
                              onClick: () => {
                                $e();
                              },
                              className:
                                'text-muted-foreground hover:bg-accent hover:text-foreground inline-flex h-8 items-center gap-1 rounded-lg px-2 text-xs',
                              icon: s.jsx(gs, { className: 'h-3.5 w-3.5' }),
                              children: '复制提示词',
                            }),
                          }),
                          N
                            ? s.jsx(Ss, {
                                sessionKey: N.sessionKey,
                                bootstrapSessionId: N.sessionId,
                                bootstrapSessionTitle: N.sessionTitle,
                                services: _e,
                                systemPrompt: I,
                                userPrompt: M,
                                onAfterSend: () => {
                                  u && u(n.id);
                                },
                                renderAssistantMessageActions: m
                                  ? (e) =>
                                      s.jsx(y, {
                                        type: 'link',
                                        size: 'small',
                                        onClick: () => {
                                          Re(e.content);
                                        },
                                        className:
                                          'text-primary hover:text-primary/80 h-auto p-0 text-xs font-medium',
                                        children: '保存回复',
                                      })
                                  : void 0,
                              })
                            : null,
                        ],
                      }),
                    ],
                  }),
                f === 'compare' &&
                  s.jsxs('div', {
                    className: 'space-y-4',
                    children: [
                      s.jsxs('div', {
                        className: 'space-y-2',
                        children: [
                          s.jsx('h4', {
                            className: 'text-muted-foreground text-sm font-medium',
                            children: '选择多个模型对比响应效果',
                          }),
                          s.jsx('div', {
                            className: 'flex flex-wrap gap-2',
                            children: L.map((e) =>
                              s.jsx(
                                y,
                                {
                                  type: B.includes(e.id) ? 'primary' : 'default',
                                  size: 'small',
                                  shape: 'round',
                                  onClick: () => Fe(e.id),
                                  className: 'rounded-full px-3 py-1.5 text-xs font-medium',
                                  children: e.name || e.model,
                                },
                                e.id,
                              ),
                            ),
                          }),
                        ],
                      }),
                      s.jsxs('div', {
                        className: 'flex items-center justify-between',
                        children: [
                          s.jsx('span', {
                            className: 'text-muted-foreground text-sm',
                            children: `对比 ${B.length} 个模型`,
                          }),
                          s.jsx(y, {
                            type: 'primary',
                            onClick: Be,
                            disabled: A || B.length < 2,
                            loading: A,
                            className:
                              'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium',
                            icon: A ? void 0 : s.jsx(Me, { className: 'h-4 w-4' }),
                            children: A ? '对比中...' : '开始对比测试',
                          }),
                        ],
                      }),
                      ne &&
                        s.jsx('div', {
                          className:
                            'grid max-h-80 grid-cols-1 gap-4 overflow-y-auto md:grid-cols-2',
                          children: ne.map((e, t) =>
                            s.jsxs(
                              'div',
                              {
                                className: `rounded-lg border p-3 ${e.success ? 'border-border app-wallpaper-surface' : 'border-destructive/50 bg-destructive/5'}`,
                                children: [
                                  s.jsxs('div', {
                                    className: 'mb-2 flex items-center justify-between',
                                    children: [
                                      s.jsx('span', {
                                        className: 'truncate text-xs font-medium',
                                        children: e.model,
                                      }),
                                      s.jsxs('span', {
                                        className: 'text-muted-foreground text-[10px]',
                                        children: [e.latency, 'ms'],
                                      }),
                                    ],
                                  }),
                                  s.jsx('div', {
                                    className:
                                      'text-muted-foreground max-h-40 overflow-y-auto text-xs',
                                    children: e.success
                                      ? (De(e.response || '(空)') ?? '(空)')
                                      : e.error || '未知错误',
                                  }),
                                ],
                              },
                              t,
                            ),
                          ),
                        }),
                    ],
                  }),
                f === 'image' &&
                  s.jsxs('div', {
                    className: 'space-y-4',
                    children: [
                      s.jsxs('div', {
                        className: 'flex items-center justify-between',
                        children: [
                          s.jsxs('div', {
                            className: 'space-y-1',
                            children: [
                              s.jsxs('span', {
                                className: 'text-muted-foreground text-sm',
                                children: ['模型', ': ', v?.model || '未配置生图模型'],
                              }),
                              v &&
                                s.jsxs('p', {
                                  className: 'text-muted-foreground text-xs',
                                  children: ['服务提供商', ': ', v.provider],
                                }),
                            ],
                          }),
                          s.jsx(y, {
                            type: 'primary',
                            onClick: ze,
                            disabled: F || !v,
                            loading: F,
                            className:
                              'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium',
                            icon: F ? void 0 : s.jsx(O, { className: 'h-4 w-4' }),
                            children: F ? '生成中...' : '测试生图',
                          }),
                        ],
                      }),
                      oe.length > 0 &&
                        s.jsxs('div', {
                          className: 'space-y-3',
                          children: [
                            s.jsx('h4', {
                              className: 'text-muted-foreground text-sm font-medium',
                              children: '生成的图片',
                            }),
                            s.jsx('div', {
                              className: 'grid grid-cols-1 gap-4 md:grid-cols-2',
                              children: oe.map((e, t) =>
                                s.jsxs(
                                  'div',
                                  {
                                    className:
                                      'border-border group relative overflow-hidden rounded-lg border',
                                    children: [
                                      s.jsx('img', {
                                        src: e,
                                        alt: `Generated ${t + 1}`,
                                        className: 'h-auto w-full object-cover',
                                      }),
                                      s.jsxs('div', {
                                        className:
                                          'absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100',
                                        children: [
                                          j &&
                                            s.jsx(y, {
                                              type: 'primary',
                                              size: 'small',
                                              onClick: () => Le(e),
                                              className:
                                                'flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium',
                                              title: '添加到 IPrompt',
                                              icon: s.jsx(ys, { className: 'h-4 w-4' }),
                                              children: '添加到 IPrompt',
                                            }),
                                          s.jsx(y, {
                                            size: 'small',
                                            onClick: () => Ve(e, t),
                                            className:
                                              'bg-muted text-foreground hover:bg-muted/80 flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium',
                                            title: '下载',
                                            icon: s.jsx(js, { className: 'h-4 w-4' }),
                                          }),
                                        ],
                                      }),
                                    ],
                                  },
                                  t,
                                ),
                              ),
                            }),
                          ],
                        }),
                      !v &&
                        s.jsxs('div', {
                          className: 'bg-muted/50 border-border rounded-lg border p-4 text-center',
                          children: [
                            s.jsx(O, { className: 'text-muted-foreground mx-auto mb-2 h-8 w-8' }),
                            s.jsx('p', {
                              className: 'text-muted-foreground text-sm',
                              children: '请先在设置中配置生图模型',
                            }),
                          ],
                        }),
                    ],
                  }),
              ],
            }),
          }),
        }),
      })
    : null;
}
const Is = '_prompt_1dwe4_1',
  ae = {
    prompt: Is,
    'prompt-editor': '_prompt-editor_1dwe4_10',
    'prompt-editor-shell': '_prompt-editor-shell_1dwe4_18',
  };
function Fs() {
  const o = k((d) => d.editorMode),
    p = k((d) => d.selectedId),
    n = k((d) => d.prompts),
    x = k((d) => d.fetchPrompts),
    h = Ce((d) => d.fetchFolders),
    g = k((d) => d.isLoading),
    u = k((d) => d.refreshTree),
    m = k((d) => d.openEditEditor),
    j = Ce((d) => d.folders),
    [l, f] = a.useState(!1);
  (a.useEffect(() => {
    (x(), h());
  }, [h, x]),
    a.useEffect(() => {
      u();
    }, [j, n, u]));
  const b = a.useMemo(
      () => (o === 'create' ? null : (n.find((d) => d.id === p) ?? null)),
      [o, n, p],
    ),
    N = o === 'create' || !!b,
    P = a.useCallback(
      (d) => {
        m(d);
      },
      [m],
    ),
    A = a.useCallback(() => {
      f(!0);
    }, []);
  return s.jsxs('div', {
    className: ae.prompt,
    children: [
      g && n.length === 0 ? s.jsx(cs, { label: '加载提示词…' }) : null,
      s.jsx('div', {
        className: ae['prompt-editor'],
        children: N
          ? s.jsx('div', {
              className: ae['prompt-editor-shell'],
              children: s.jsx(vs, {
                variant: 'panel',
                isOpen: !0,
                prompt: b,
                onClose: () => {},
                onSaved: P,
                onAiTest: A,
              }),
            })
          : s.jsx(is, {
              centered: !0,
              icon: bs,
              title: '在左侧选择或新建提示词',
              description: '从侧栏目录选择已有提示词，或新建目录与提示词开始编辑',
            }),
      }),
      s.jsx(Es, { isOpen: l, onClose: () => f(!1), prompt: b }),
    ],
  });
}
export { Fs as PromptManager };
