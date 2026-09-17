const __vite__mapDeps = (
  i,
  m = __vite__mapDeps,
  d = m.f ||
    (m.f = [
      './index-D4Gp0uHC.js',
      './ui-vendor-C-FKu2uc.js',
      './markdown-vendor-DldLOD9R.js',
      './markdown-it-vendor-DL4wSELR.js',
      './markdown-vendor-CmuYMs8x.css',
    ]),
) => i.map((i) => d[i]);
import './icons-B5Lu0sqU.js';
import { an as ae } from './index-C2avURFS.js';
import './markdown-it-vendor-DL4wSELR.js';
import { _ as I } from './markdown-vendor-DldLOD9R.js';
import './ui-vendor-C-FKu2uc.js';
const ie = `
.email-viewer{position:relative;height:100%;min-height:0;display:flex;flex-direction:column;background:#f3f6f8;color:#172033;box-sizing:border-box}
.email-viewer *{box-sizing:border-box}
.email-header{padding:18px 22px;border-bottom:1px solid rgba(23,32,51,.08);background:#fff}
.email-header>span{color:#1f7a58;font-size:12px;font-weight:900}
.email-header h2{margin:4px 0 12px;font-size:22px;line-height:1.25}
.email-meta{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px 18px}
.email-meta p{margin:0;color:#526275;font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.email-meta strong{margin-right:8px;color:#172033}
.email-body{flex:1;min-height:0;display:grid;grid-template-columns:minmax(240px,300px) minmax(0,1fr)}
.email-sidebar{min-height:0;display:flex;flex-direction:column;gap:14px;padding:14px;border-right:1px solid rgba(23,32,51,.08);background:rgba(255,255,255,.7)}
.body-tabs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;padding:4px;border-radius:12px;background:rgba(23,32,51,.06)}
.body-tabs button,.attachment-item,.attachment-preview-head button{font:inherit;cursor:pointer}
.body-tabs button{height:34px;border:0;border-radius:9px;background:transparent;color:#64748b;font-size:12px;font-weight:800}
.body-tabs button.active{background:#fff;color:#172033}
.body-tabs button:disabled{opacity:.4;cursor:not-allowed}
.attachment-panel{min-height:0;overflow:auto}
.attachment-title{display:flex;justify-content:space-between;color:#172033;font-size:14px;margin-bottom:8px}
.attachment-title span{color:#64748b}
.attachment-empty{margin:8px 0 0;color:#64748b;font-size:12px}
.attachment-item{width:100%;min-height:62px;display:grid;grid-template-columns:42px minmax(0,1fr);gap:10px;align-items:center;margin-bottom:8px;padding:9px;border:1px solid rgba(23,32,51,.08);border-radius:12px;background:#fff;text-align:left}
.attachment-item:hover,.attachment-item.active{border-color:rgba(31,122,88,.28);box-shadow:0 10px 22px rgba(23,32,51,.08)}
.attachment-item span{grid-row:span 2;height:38px;display:inline-flex;align-items:center;justify-content:center;border-radius:10px;background:rgba(31,122,88,.12);color:#1f7a58;font-size:11px;font-weight:900}
.attachment-item strong,.attachment-item em{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.attachment-item em{color:#64748b;font-size:12px;font-style:normal}
.message-panel{min-width:0;min-height:0;display:grid;grid-template-rows:minmax(240px,46%) minmax(0,1fr)}
.email-message-content{min-height:0}
.email-html,.email-text{width:100%;height:100%;border:0;background:#fff}
.email-text{margin:0;overflow:auto;padding:20px;white-space:pre-wrap;word-break:break-word;line-height:1.65}
.attachment-preview{min-height:0;display:flex;flex-direction:column;border-top:1px solid rgba(23,32,51,.08)}
.attachment-preview[hidden]{display:none}
.attachment-preview-head{min-height:48px;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:8px 14px;background:rgba(255,255,255,.78)}
.attachment-preview-head button{height:32px;padding:0 12px;border:0;border-radius:9px;background:#1f7a58;color:#fff;font-weight:800}
.attachment-target{flex:1;min-height:0;overflow:auto}
.email-attachment-render{width:100%;height:100%;min-height:320px}
.email-state{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:14px;background:rgba(243,246,248,.86);z-index:2}
.email-state span{width:34px;height:34px;border-radius:999px;border:3px solid rgba(31,122,88,.16);border-top-color:#1f7a58;animation:email-spin .9s linear infinite}
.email-error{position:absolute;right:18px;bottom:18px;width:min(460px,calc(100% - 36px));padding:14px;border-radius:14px;background:#fff7e8;color:#8a4b00;box-shadow:0 16px 36px rgba(23,32,51,.14);z-index:3}
.email-error p{margin:6px 0 0}
@keyframes email-spin{to{transform:rotate(360deg)}}
@media (prefers-color-scheme:dark){.file-viewer[data-viewer-theme='system'] .email-viewer{background:#172033;color:#e5eef8}.file-viewer[data-viewer-theme='system'] .email-header,.file-viewer[data-viewer-theme='system'] .attachment-item,.file-viewer[data-viewer-theme='system'] .email-html,.file-viewer[data-viewer-theme='system'] .email-text{background:#fff;color:#172033}}
.file-viewer[data-viewer-theme='dark'] .email-viewer{background:#172033;color:#e5eef8}
.file-viewer[data-viewer-theme='dark'] .email-header,.file-viewer[data-viewer-theme='dark'] .attachment-item,.file-viewer[data-viewer-theme='dark'] .email-html,.file-viewer[data-viewer-theme='dark'] .email-text{background:#fff;color:#172033}
@media (max-width:860px){.email-meta,.email-body{grid-template-columns:1fr}.email-body{grid-template-rows:auto minmax(0,1fr)}.email-sidebar{border-right:0;border-bottom:1px solid rgba(23,32,51,.08)}}
`,
  re = (e) => {
    if (!Number.isFinite(e) || e < 0) return '-';
    if (e < 1024) return `${e} B`;
    const n = e / 1024 / 1024;
    return n >= 1
      ? `${n.toFixed(n < 10 ? 1 : 0)} MB`
      : `${(e / 1024).toFixed(e < 10 * 1024 ? 1 : 0)} KB`;
  },
  v = (e) =>
    e
      ? (Array.isArray(e) ? e : [e]).flatMap((o) => {
          const a = o;
          return a.group
            ? v(a.group)
            : [{ name: a.name || '', address: a.address || a.email || '' }];
        })
      : [],
  R = (e) =>
    e
      .map((n) => (n.name && n.address ? `${n.name} <${n.address}>` : n.address || n.name || ''))
      .filter(Boolean)
      .join(', '),
  U = async (e) => {
    if (e instanceof ArrayBuffer) return e;
    if (e instanceof Uint8Array) {
      const n = new Uint8Array(e.byteLength);
      return (n.set(e), n.buffer);
    }
    return U(new TextEncoder().encode(e));
  },
  oe = (e) => (e || '').replace(/[<>]/g, ''),
  Q = (e, n, o) => {
    const a = (e.attachments || []).map((r, p) => {
      var s;
      const m =
          typeof r.content == 'string'
            ? r.content.length
            : ((s = r.content) === null || s === void 0 ? void 0 : s.byteLength) || 0,
        l = r.filename || `attachment-${p + 1}`;
      return {
        id: `${p}-${l}`,
        name: l,
        mimeType: r.mimeType,
        size: m,
        contentId: r.contentId,
        load: () => U(r.content),
      };
    });
    return Promise.all(
      a.map(async (r) => {
        var p;
        if (
          !r.contentId ||
          !(!((p = r.mimeType) === null || p === void 0) && p.startsWith('image/'))
        )
          return;
        const s = await r.load(),
          m = URL.createObjectURL(new Blob([s], { type: r.mimeType }));
        (n.push(m), o.set(oe(r.contentId), m));
      }),
    ).then(() => a);
  },
  de = async (e, n, o, a) => {
    var r, p;
    const m = await (
        await I(
          async () => {
            const { default: h } = await import('./postal-mime-BE9fd5gi.js');
            return { default: h };
          },
          [],
          import.meta.url,
        )
      ).default.parse(e, {
        attachmentEncoding: 'arraybuffer',
        maxNestingDepth: 24,
        maxHeadersSize: 2 * 1024 * 1024,
      }),
      l = await Q(m, o, a);
    return {
      kind: 'eml',
      subject: m.subject || n,
      from: v(m.from),
      to: v(m.to),
      cc: v(m.cc),
      date: m.date,
      text: m.text,
      html: m.html,
      headers:
        ((r = m.headerLines) === null || r === void 0
          ? void 0
          : r.map((h) => h.line).join(`
`)) ||
        ((p = m.headers) === null || p === void 0
          ? void 0
          : p.map((h) => `${h.originalKey}: ${h.value}`).join(`
`)),
      attachments: l,
    };
  },
  se = async (e, n, o, a) => {
    var r, p, s, m;
    const l = new TextDecoder('utf-8', { fatal: !1 }).decode(e),
      h = [...l.matchAll(/^From .*$\n/gm)].map((w) => w.index || 0),
      f = (r = h[0]) !== null && r !== void 0 ? r : 0,
      x = (p = h[1]) !== null && p !== void 0 ? p : l.length,
      y = l.slice(f, x).replace(/^From .*$\n/, ''),
      M = new TextEncoder().encode(y).buffer,
      u = await (
        await I(
          async () => {
            const { default: w } = await import('./postal-mime-BE9fd5gi.js');
            return { default: w };
          },
          [],
          import.meta.url,
        )
      ).default.parse(M, {
        attachmentEncoding: 'arraybuffer',
        maxNestingDepth: 24,
        maxHeadersSize: 2 * 1024 * 1024,
      }),
      L = await Q(u, o, a);
    return {
      kind: 'mbox',
      subject: u.subject || `${n} · 第 1 封`,
      from: v(u.from),
      to: v(u.to),
      cc: v(u.cc),
      date: u.date,
      text: `MBOX 共识别 ${Math.max(1, h.length)} 封邮件，当前展示第 1 封。

${u.text || ''}`,
      html: u.html,
      headers:
        ((s = u.headerLines) === null || s === void 0
          ? void 0
          : s.map((w) => w.line).join(`
`)) ||
        ((m = u.headers) === null || m === void 0
          ? void 0
          : m.map((w) => `${w.originalKey}: ${w.value}`).join(`
`)),
      attachments: L,
    };
  },
  le = async (e, n) => {
    var o;
    const a = await I(
        () => import('./index-D4Gp0uHC.js').then((l) => l.i),
        __vite__mapDeps([0, 1, 2, 3, 4]),
        import.meta.url,
      ),
      r = ((o = a.default) === null || o === void 0 ? void 0 : o.default) || a.default,
      p = new r(e),
      s = p.getFileData(),
      m = (s.attachments || []).map((l, h) => {
        const f =
          l.fileName || l.fileNameShort || l.name || `attachment-${h + 1}${l.extension || ''}`;
        return {
          id: `${h}-${f}`,
          name: f,
          mimeType: 'application/octet-stream',
          size: l.contentLength || l.size || 0,
          contentId: l.pidContentId,
          async load() {
            const x = p.getAttachment(l);
            return U(x.content);
          },
        };
      });
    return {
      kind: 'msg',
      subject: s.subject || n,
      from: v({ name: s.senderName, address: s.senderEmail }),
      to: v(s.recipients || []).filter((l) => l.name || l.address),
      cc: [],
      date: s.messageDeliveryTime || s.clientSubmitTime || s.creationTime,
      text: s.body,
      html: s.html || '',
      headers: s.headers,
      attachments: m,
    };
  },
  ce = (e, n, o, a, r) => (n === 'msg' ? le(e, o) : n === 'mbox' ? se(e, o, a, r) : de(e, o, a, r)),
  me = () => {
    const e = document.createElement('style');
    return ((e.textContent = ie), e);
  },
  i = (e, n, o) => {
    const a = document.createElement(e);
    return (n && (a.className = n), o !== void 0 && (a.textContent = o), a);
  },
  J = (e) => {
    const n = e.lastIndexOf('.');
    return n >= 0 ? e.slice(n + 1).toLowerCase() : 'txt';
  },
  pe = (e, n) => {
    let o = e;
    return (
      n.forEach((a, r) => {
        const p = r.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        o = o.replace(new RegExp(`cid:${p}`, 'gi'), a);
      }),
      `<!doctype html><html><head><meta charset="utf-8"><base target="_blank"><style>body{margin:0;padding:18px;font-family:Aptos,"Segoe UI",sans-serif;line-height:1.6;color:#172033;word-break:break-word;}img{max-width:100%;height:auto;}</style></head><body>${o}</body></html>`
    );
  },
  C = (e, n, o) => {
    const a = document.createElement('p'),
      r = document.createElement('strong');
    ((r.textContent = n), a.append(r, document.createTextNode(o || '-')), e.append(a));
  };
async function we(e, n, o = 'eml', a) {
  const r = o === 'msg' ? 'msg' : o === 'mbox' ? 'mbox' : 'eml',
    p = a?.filename || `message.${r}`,
    s = [],
    m = new Map(),
    l = [];
  let h,
    f = null,
    x = null;
  const y = i('section', 'email-viewer'),
    M = me();
  n.replaceChildren(M, y);
  const $ = (t, g, b) => {
      (t.addEventListener(g, b), l.push(() => t.removeEventListener(g, b)));
    },
    u = (t) => {
      if (!f) {
        ((f = i('div', 'email-state')), f.append(i('span'), i('strong', void 0, t)), y.append(f));
        return;
      }
      const g = f.querySelector('strong');
      g && (g.textContent = t);
    },
    L = () => {
      (f?.remove(), (f = null));
    },
    w = (t) => {
      (x?.remove(),
        (x = i('div', 'email-error')),
        x.append(i('strong', void 0, '邮件预览提示')),
        x.append(i('p', void 0, t)),
        y.append(x));
    },
    D = async () => {
      (await ae(h), (h = void 0));
    },
    Y = async (t) => {
      const g = await t.load(),
        b = URL.createObjectURL(new Blob([g], { type: t.mimeType || 'application/octet-stream' }));
      s.push(b);
      const k = document.createElement('a');
      ((k.href = b), (k.download = t.name), document.body.append(k), k.click(), k.remove());
    },
    Z = (t) => {
      let g = t.html ? 'html' : t.text ? 'text' : 'headers',
        b = null;
      const k = [],
        N = [];
      y.replaceChildren();
      const T = i('header', 'email-header');
      (T.append(i('span', void 0, t.kind.toUpperCase())),
        T.append(i('h2', void 0, t.subject || p)));
      const E = i('div', 'email-meta');
      (C(E, '发件人', R(t.from)),
        C(E, '收件人', R(t.to)),
        t.cc.length && C(E, '抄送', R(t.cc)),
        C(E, '时间', t.date || '-'),
        T.append(E));
      const F = i('div', 'email-body'),
        O = i('aside', 'email-sidebar'),
        H = i('div', 'body-tabs'),
        V = i('main', 'message-panel'),
        z = i('div', 'email-message-content'),
        A = i('section', 'attachment-preview');
      A.hidden = !0;
      const K = i('div', 'attachment-preview-head'),
        q = i('strong'),
        B = i('button', void 0, '下载附件');
      B.type = 'button';
      const P = i('div', 'attachment-target');
      (K.append(q, B), A.append(K, P));
      const W = () => {
          if ((z.replaceChildren(), g === 'html' && t.html)) {
            const d = i('iframe', 'email-html');
            (d.setAttribute('sandbox', ''), (d.srcdoc = pe(t.html, m)), z.append(d));
            return;
          }
          const c = i('pre', 'email-text');
          ((c.textContent = g === 'text' ? t.text || '' : t.headers || ''), z.append(c));
        },
        X = () => {
          k.forEach(({ mode: c, button: d }) => {
            d.classList.toggle('active', c === g);
          });
        };
      ([
        { key: 'html', label: 'HTML', disabled: !t.html },
        { key: 'text', label: '正文', disabled: !t.text },
        { key: 'headers', label: '头信息', disabled: !t.headers },
      ].forEach((c) => {
        const d = i('button', void 0, c.label);
        ((d.type = 'button'),
          (d.disabled = c.disabled),
          $(d, 'click', () => {
            d.disabled || ((g = c.key), X(), W());
          }),
          k.push({ mode: c.key, button: d }),
          H.append(d));
      }),
        X());
      const j = i('section', 'attachment-panel'),
        G = i('div', 'attachment-title');
      (G.append(i('strong', void 0, '附件'), i('span', void 0, String(t.attachments.length))),
        j.append(G),
        t.attachments.length || j.append(i('p', 'attachment-empty', '暂无附件')));
      const ee = () => {
          N.forEach(({ id: c, button: d }) => {
            d.classList.toggle('active', c === b?.id);
          });
        },
        te = async (c) => {
          ((b = c),
            ee(),
            (A.hidden = !1),
            (q.textContent = c.name),
            u(`正在打开附件 ${c.name}...`));
          try {
            (await D(), P.replaceChildren());
            const d = await c.load(),
              _ = i('div', 'email-attachment-render');
            P.append(_);
            const S = J(c.name);
            a?.renderNestedBuffer
              ? (h = await a.renderNestedBuffer(d, S, _, {
                  ...a,
                  filename: c.name,
                  options: a.options,
                }))
              : _.append(
                  i('div', void 0, `当前运行环境未提供附件嵌套预览入口，请下载 ${c.name} 后查看。`),
                );
          } catch (d) {
            (console.error(d), w(d instanceof Error ? d.message : String(d)));
          } finally {
            L();
          }
        };
      (t.attachments.forEach((c) => {
        const d = i('button', 'attachment-item');
        d.type = 'button';
        const _ = i('span', void 0, J(c.name).toUpperCase() || 'FILE'),
          S = i('strong', void 0, c.name),
          ne = i('em', void 0, re(c.size));
        (d.append(_, S, ne),
          $(d, 'click', () => {
            te(c);
          }),
          N.push({ id: c.id, button: d }),
          j.append(d));
      }),
        $(B, 'click', () => {
          b && Y(b);
        }),
        W(),
        O.append(H, j),
        V.append(z, A),
        F.append(O, V),
        y.append(T, F));
    };
  u('正在解析邮件...');
  try {
    const t = await ce(e, r, p, s, m);
    Z(t);
  } catch (t) {
    (console.error(t), y.replaceChildren(), w(t instanceof Error ? t.message : String(t)));
  } finally {
    L();
  }
  return {
    $el: y,
    async unmount() {
      (await D(),
        l.splice(0).forEach((t) => t()),
        s.forEach((t) => URL.revokeObjectURL(t)),
        n.replaceChildren());
    },
  };
}
export { we as default };
