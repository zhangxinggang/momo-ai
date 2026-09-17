const __vite__mapDeps = (
  i,
  m = __vite__mapDeps,
  d = m.f ||
    (m.f = [
      './index-OuLba0Q1.js',
      './ui-vendor-C-FKu2uc.js',
      './markdown-vendor-DldLOD9R.js',
      './markdown-it-vendor-DL4wSELR.js',
      './markdown-vendor-CmuYMs8x.css',
    ]),
) => i.map((i) => d[i]);
import './markdown-it-vendor-DL4wSELR.js';
import { _ as X } from './markdown-vendor-DldLOD9R.js';
import './ui-vendor-C-FKu2uc.js';
const Y = `
.epub-viewer{width:100%;height:100%;display:flex;flex-direction:column;overflow:hidden;background:#eef1f4;color:#172033;box-sizing:border-box}
.epub-viewer *{box-sizing:border-box}
.epub-toolbar{flex-shrink:0;display:grid;grid-template-columns:40px minmax(0,1fr) auto;align-items:center;gap:12px;padding:12px 14px;border-bottom:1px solid rgba(15,23,42,.08);background:rgba(255,255,255,.92)}
.epub-title{min-width:0;display:flex;flex-direction:column;gap:3px}
.epub-title strong,.epub-title span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.epub-title strong{font-size:14px}
.epub-title span{color:#64748b;font-size:12px}
.epub-icon-button,.epub-button{height:36px;border:1px solid rgba(15,23,42,.08);background:#fff;color:#172033;font:inherit;cursor:pointer}
.epub-icon-button{width:40px;display:inline-flex;align-items:center;justify-content:center;border-radius:8px}
.epub-icon-button span,.epub-icon-button span::before,.epub-icon-button span::after{width:16px;height:2px;display:block;border-radius:999px;background:currentColor}
.epub-icon-button span{position:relative}
.epub-icon-button span::before,.epub-icon-button span::after{content:'';position:absolute;left:0}
.epub-icon-button span::before{top:-5px}
.epub-icon-button span::after{top:5px}
.epub-icon-button.active{border-color:rgba(37,99,235,.24);background:rgba(37,99,235,.08);color:#1d4ed8}
.epub-actions{display:flex;align-items:center;gap:8px}
.epub-button{min-width:68px;padding:0 12px;border-radius:8px;font-size:13px;font-weight:700}
.epub-button:disabled{color:#94a3b8;cursor:not-allowed}
.epub-progress{min-width:58px;color:#64748b;font-size:12px;text-align:center}
.epub-body{flex:1;min-height:0;display:grid;grid-template-columns:minmax(180px,240px) minmax(0,1fr)}
.epub-viewer--toc-hidden .epub-body{grid-template-columns:minmax(0,1fr)}
.epub-toc{min-width:0;min-height:0;display:flex;flex-direction:column;border-right:1px solid rgba(15,23,42,.08);background:rgba(255,255,255,.8)}
.epub-toc[hidden]{display:none}
.epub-toc-head{flex-shrink:0;display:flex;justify-content:space-between;gap:8px;padding:12px;color:#172033;font-size:13px}
.epub-toc-head span{color:#64748b}
.epub-toc-list{flex:1;min-height:0;overflow:auto;padding:0 8px 10px}
.epub-toc-item{width:100%;min-height:34px;border:0;border-radius:8px;background:transparent;color:#475569;font:inherit;font-size:12px;text-align:left;cursor:pointer}
.epub-toc-item:hover,.epub-toc-item.active{background:rgba(37,99,235,.08);color:#1d4ed8}
.epub-stage-wrap{position:relative;min-width:0;min-height:0;padding:18px;overflow:hidden}
.epub-stage{width:100%;height:100%;overflow-x:hidden;overflow-y:auto;border-radius:8px;background:#fff;box-shadow:0 18px 45px rgba(15,23,42,.12),inset 0 0 0 1px rgba(15,23,42,.06)}
.epub-stage .epub-container{width:100%!important;max-width:100%;overflow-x:hidden!important;overflow-y:auto!important}
.epub-stage iframe{max-width:100%}
.epub-state{position:absolute;inset:18px;display:flex;align-items:center;justify-content:center;border-radius:8px;background:rgba(255,255,255,.92);color:#64748b;font-size:14px}
.epub-state[hidden]{display:none!important}
.epub-state.error{color:#b42318}
.file-viewer[data-viewer-theme='dark'] .epub-viewer{background:#172033;color:#e5eef8}
.file-viewer[data-viewer-theme='dark'] .epub-toolbar,.file-viewer[data-viewer-theme='dark'] .epub-toc,.file-viewer[data-viewer-theme='dark'] .epub-stage{background:#fff;color:#172033}
@media (prefers-color-scheme:dark){.file-viewer[data-viewer-theme='system'] .epub-viewer{background:#172033;color:#e5eef8}.file-viewer[data-viewer-theme='system'] .epub-toolbar,.file-viewer[data-viewer-theme='system'] .epub-toc,.file-viewer[data-viewer-theme='system'] .epub-stage{background:#fff;color:#172033}}
@media (max-width:720px){.epub-toolbar{grid-template-columns:40px minmax(0,1fr)}.epub-actions{grid-column:1/-1;justify-content:space-between}.epub-body{position:relative;grid-template-columns:minmax(0,1fr)}.epub-toc{position:absolute;z-index:5;top:0;bottom:0;left:0;width:min(82vw,280px);box-shadow:18px 0 40px rgba(15,23,42,.16)}.epub-stage-wrap{padding:12px}}
`,
  Z = () => {
    const a = document.createElement('style');
    return ((a.textContent = Y), a);
  },
  r = (a, l, i) => {
    const t = document.createElement(a);
    return (l && (t.className = l), i !== void 0 && (t.textContent = i), t);
  },
  B = (a, l) => (typeof a == 'string' && a.trim() ? a.trim() : l),
  W = (a, l = 0) =>
    Array.isArray(a)
      ? a.flatMap((i, t) => {
          const d = i,
            s = typeof d.href == 'string' ? d.href : '',
            p = B(d.label || d.title, `章节 ${t + 1}`),
            u = W(d.subitems || d.children, l + 1);
          return s ? [{ depth: l, href: s, id: `${l}-${t}-${s}`, label: p }, ...u] : u;
        })
      : [],
  ee = (a) => {
    var l;
    const i = a.find((d) => {
      const s = d.label.toLowerCase();
      return (
        /(^|\s)(chapter|part|book|prologue|preface|introduction)\b/.test(s) ||
        /第[一二三四五六七八九十百千0-9]+[章节回部卷篇]/.test(d.label)
      );
    });
    if (i) return i.href;
    const t = a.find((d) => {
      const s = `${d.label} ${d.href}`.toLowerCase();
      return !/(cover|titlepage|title-page|copyright|license|toc|contents|nav|table-of-contents|wrap0000)/.test(
        s,
      );
    });
    return t?.href || ((l = a[0]) === null || l === void 0 ? void 0 : l.href);
  };
async function re(a, l) {
  let i,
    t,
    d = !1,
    s = !0,
    p = 'loading',
    u = 'EPUB 电子书',
    T = '',
    b = [],
    g = '',
    E = null,
    S = !0,
    $ = !1;
  const m = new Set(),
    P = [],
    v = r('div', 'epub-viewer'),
    A = r('div', 'epub-toolbar'),
    f = r('button', 'epub-icon-button');
  ((f.type = 'button'), (f.title = '目录'), f.append(r('span')));
  const U = r('div', 'epub-title'),
    R = r('strong', void 0, u),
    j = r('span', void 0, '阅读中');
  U.append(R, j);
  const F = r('div', 'epub-actions'),
    x = r('button', 'epub-button', '上一页'),
    H = r('span', 'epub-progress', '阅读中'),
    w = r('button', 'epub-button', '下一页');
  ((x.type = 'button'), (w.type = 'button'), F.append(x, H, w), A.append(f, U, F));
  const O = r('div', 'epub-body'),
    C = r('aside', 'epub-toc'),
    q = r('div', 'epub-toc-head'),
    I = r('span', void 0, '0 项');
  q.append(r('strong', void 0, '目录'), I);
  const y = r('div', 'epub-toc-list');
  C.append(q, y);
  const L = r('main', 'epub-stage-wrap'),
    _ = r('div', 'epub-stage'),
    h = r('div', 'epub-state', '正在解析 EPUB...');
  (L.append(_, h), O.append(C, L), v.append(A, O), l.replaceChildren(Z(), v));
  const k = (e, o, n) => {
      (e.addEventListener(o, n), P.push(() => e.removeEventListener(o, n)));
    },
    G = () => {
      var e;
      if (!g) return '';
      const o = b.find((n) => n.href === g);
      return o
        ? o.label
        : ((e = b.find((n) => g.includes(n.href.split('#')[0]))) === null || e === void 0
            ? void 0
            : e.label) || '';
    },
    D = () => (typeof E == 'number' ? `${E}%` : G() || '阅读中'),
    c = () => {
      (v.classList.toggle('epub-viewer--toc-hidden', !s),
        (C.hidden = !s),
        f.classList.toggle('active', s),
        (R.textContent = u),
        (j.textContent = T || D()),
        (H.textContent = D()),
        (x.disabled = p !== 'ready' || S),
        (w.disabled = p !== 'ready' || $),
        (h.hidden = p === 'ready'),
        h.classList.toggle('error', p === 'error'),
        (I.textContent = `${b.length} 项`),
        Array.from(y.querySelectorAll('.epub-toc-item')).forEach((e) => {
          e.classList.toggle('active', e.dataset.href === g);
        }));
    },
    N = () => {
      (y.replaceChildren(),
        b.forEach((e) => {
          const o = r('button', 'epub-toc-item', e.label);
          ((o.type = 'button'),
            (o.dataset.href = e.href),
            (o.style.paddingLeft = `${12 + e.depth * 14}px`),
            k(o, 'click', () => {
              (t?.display(e.href), (s = !1), c());
            }),
            y.append(o));
        }),
        c());
    },
    M = (e) => {
      var o, n;
      ((S = !!e?.atStart),
        ($ = !!e?.atEnd),
        (g = ((o = e?.start) === null || o === void 0 ? void 0 : o.href) || ''),
        typeof ((n = e?.start) === null || n === void 0 ? void 0 : n.percentage) == 'number' &&
          (E = Math.round(e.start.percentage * 100)),
        c());
    },
    V = (e) =>
      new Promise((o) => {
        const n = window.setTimeout(() => {
          (m.delete(n), o(void 0));
        }, e);
        m.add(n);
      }),
    z = () => {
      var e;
      try {
        const o = _.querySelector('iframe'),
          n = (e = o?.contentDocument) === null || e === void 0 ? void 0 : e.body;
        return n ? !!(n.innerText.trim() || n.querySelector('img, svg, canvas')) : !1;
      } catch {
        return !1;
      }
    },
    J = async () => {
      for (let e = 0; e < 20; e += 1) {
        if (d || z()) return z();
        await V(100);
      }
      return z();
    },
    K = async () => {
      ((p = 'loading'), (h.textContent = '正在解析 EPUB...'), c());
      try {
        const { default: e } = await X(
          async () => {
            const { default: Q } = await import('./index-OuLba0Q1.js');
            return { default: Q };
          },
          __vite__mapDeps([0, 1, 2, 3, 4]),
          import.meta.url,
        );
        if (d) return;
        ((i = e(a.slice(0), { openAs: 'binary', replacements: 'blobUrl' })),
          (t = i.renderTo(_, {
            allowScriptedContent: !1,
            flow: 'scrolled',
            height: '100%',
            manager: 'continuous',
            resizeOnOrientationChange: !0,
            spread: 'none',
            width: '100%',
          })),
          t.themes.default({
            body: {
              color: '#172033',
              fontFamily: 'Georgia, "Times New Roman", serif',
              lineHeight: '1.72',
              padding: '0 8px',
            },
            img: { maxWidth: '100%' },
            html: { height: 'auto', overflow: 'auto' },
          }),
          t.on('relocated', M),
          await i.ready);
        const o = await i.loaded.metadata.catch(() => {});
        ((u = B(o?.title, u)), (T = B(o?.creator, '')));
        const n = await i.loaded.navigation.catch(() => {});
        if (((b = W(n?.toc)), N(), await t.display(ee(b)), !(await J())))
          throw new Error('EPUB 正文渲染未完成，请刷新后重试');
        if (d) return;
        ((p = 'ready'), c(), i.locations.generate(1200).catch(() => {}));
      } catch (e) {
        (console.error(e),
          (p = 'error'),
          (h.textContent = e instanceof Error ? e.message : String(e)),
          c());
      }
    };
  return (
    k(f, 'click', () => {
      ((s = !s), c());
    }),
    k(x, 'click', () => {
      t?.prev();
    }),
    k(w, 'click', () => {
      t?.next();
    }),
    c(),
    K(),
    {
      $el: v,
      unmount() {
        ((d = !0),
          m.forEach((e) => window.clearTimeout(e)),
          m.clear(),
          t && (t.off('relocated', M), t.destroy(), (t = void 0)),
          i?.destroy(),
          (i = void 0),
          P.splice(0).forEach((e) => e()),
          l.replaceChildren());
      },
    }
  );
}
export { re as default };
