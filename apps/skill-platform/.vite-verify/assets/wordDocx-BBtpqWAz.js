const __vite__mapDeps = (
  i,
  m = __vite__mapDeps,
  d = m.f ||
    (m.f = [
      './docx-preview-DFupRAxs.js',
      './jszip.min-DnpxAPiE.js',
      './ui-vendor-C-FKu2uc.js',
      './markdown-vendor-DldLOD9R.js',
      './markdown-it-vendor-DL4wSELR.js',
      './markdown-vendor-CmuYMs8x.css',
    ]),
) => i.map((i) => d[i]);
import { n as ie, o as ne } from './assets-Cqo46k_X.js';
import './icons-B5Lu0sqU.js';
import { b5 as ae, ad as le, aQ as re } from './index-C2avURFS.js';
import './markdown-it-vendor-DL4wSELR.js';
import { _ as U } from './markdown-vendor-DldLOD9R.js';
import { a as ce, g as de, b as se, f as W } from './printLayout-DpvXGlU9.js';
import './ui-vendor-C-FKu2uc.js';
const F = { width: 794, height: 1123 },
  ue = 2,
  fe = 12e4,
  A = 0.24,
  H = 3,
  I = 0.15,
  Z = 9525,
  me = 20555,
  pe = (() => {
    const e = {
      module: null,
      async load() {
        return (
          this.module ||
            (this.module = U(
              () => import('./docx-preview-DFupRAxs.js'),
              __vite__mapDeps([0, 1, 2, 3, 4, 5]),
              import.meta.url,
            )),
          this.module
        );
      },
    };
    return async () => await e.load();
  })(),
  he = (e) => {
    if ((e.byteLength >= 4 ? new DataView(e).getUint16(0, !1) : 0) !== me)
      throw new Error(
        '文件不是有效的 DOCX/OOXML 压缩包，可能下载不完整或被服务端错误内容替换，请重新上传或检查文件源。',
      );
  },
  xe = (e, t, o) => {
    var i, n, r, l, s, f, u, c, p, x, g, v;
    const a = (i = t?.options) === null || i === void 0 ? void 0 : i.docx,
      h = e.ownerDocument.URL || void 0,
      m = a?.worker !== !1,
      w = a?.visualPagination === !0,
      d = (y) => {
        (y.phase === 'render' || y.phase === 'layout' || y.phase === 'done') && o();
      };
    return {
      debug: !1,
      experimental: !1,
      useWorker: m,
      workerUrl: m ? ne(a, h) : void 0,
      workerJsZipUrl: m ? ie(a, h) : void 0,
      workerFallback: !0,
      workerTimeout: (n = a?.workerTimeout) !== null && n !== void 0 ? n : fe,
      renderPageBatchSize:
        (r = a?.renderPageBatchSize) !== null && r !== void 0
          ? r
          : a?.progressive === !1
            ? Number.MAX_SAFE_INTEGER
            : ue,
      renderYieldEveryMs: (l = a?.renderYieldEveryMs) !== null && l !== void 0 ? l : 16,
      strictWordCompatibility: (s = a?.strictWordCompatibility) !== null && s !== void 0 ? s : !0,
      paginationTolerance: (f = a?.paginationTolerance) !== null && f !== void 0 ? f : 2,
      breakPages: w,
      maxDynamicPaginationPasses: w
        ? (u = a?.maxDynamicPaginationPasses) !== null && u !== void 0
          ? u
          : 1e3
        : 0,
      awaitLayout: (c = a?.awaitLayout) !== null && c !== void 0 ? c : w,
      preserveComplexFieldResults:
        (p = a?.preserveComplexFieldResults) !== null && p !== void 0 ? p : !0,
      updatePageReferences: (x = a?.updatePageReferences) !== null && x !== void 0 ? x : !1,
      hideWebHiddenContent: (g = a?.hideWebHiddenContent) !== null && g !== void 0 ? g : !1,
      ignoreLastRenderedPageBreak:
        (v = a?.ignoreLastRenderedPageBreak) !== null && v !== void 0 ? v : !w,
      progress: d,
    };
  },
  T = (e) => e.ownerDocument.defaultView,
  k = (e, t) => {
    var o;
    const i = (o = T(t)) === null || o === void 0 ? void 0 : o.HTMLElement;
    return i ? e instanceof i : e instanceof HTMLElement;
  },
  ge = (e) => {
    var t, o;
    return (
      ((o = (t = e?.options) === null || t === void 0 ? void 0 : t.docx) === null || o === void 0
        ? void 0
        : o.visualPagination) === !0
    );
  },
  ve = `
.docx-fit-viewer {
  box-sizing: border-box;
  height: 100%;
  overflow: auto;
  background: #ececec;
}
.docx-fit-viewer .docx-wrapper {
  box-sizing: border-box;
  min-width: 0 !important;
  width: 100% !important;
  padding: 24px 14px 40px !important;
  background: #e7e9ec !important;
}
.docx-fit-viewer .docx-page-frame {
  position: relative;
  width: 100%;
  min-width: 0;
  margin: 0 auto 24px;
  overflow: visible;
}
.docx-fit-viewer .docx-flow-frame {
  position: relative;
  width: 100%;
  min-width: 0;
  margin: 0 auto 28px;
  overflow: visible;
}
.docx-fit-viewer .docx-page-frame > section.docx,
.docx-fit-viewer .docx-flow-frame > section.docx {
  position: absolute;
  top: 0;
  left: 50%;
  margin: 0 !important;
  background: #ffffff !important;
  box-shadow: 0 2px 14px rgba(25, 35, 48, 0.18);
  box-sizing: border-box;
  color: #111827;
  overflow: hidden;
  transform-origin: top center;
}
.docx-fit-viewer .docx-flow-frame > section.docx {
  height: auto !important;
  min-height: 0 !important;
  overflow: visible !important;
}
.docx-fit-viewer .docx-page-frame > section.docx > article,
.docx-fit-viewer .docx-flow-frame > section.docx > article {
  position: relative;
  z-index: 1;
}
.docx-fit-viewer .docx-vml-watermark {
  position: absolute;
  inset: 0;
  z-index: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.28;
  filter: saturate(0.72) brightness(1.24);
  pointer-events: none;
  user-select: none;
}
.docx-fit-viewer .docx-vml-fallback,
.docx-fit-viewer .docx-chart-fallback {
  display: block;
  max-width: 100%;
  margin: 12px auto;
  break-inside: avoid;
  page-break-inside: avoid;
}
.docx-fit-viewer .docx-vml-fallback {
  text-align: center;
}
.docx-fit-viewer .docx-vml-fallback img {
  display: block;
  max-width: 100%;
  height: auto;
  margin: 0 auto;
}
.docx-fit-viewer .docx-chart-fallback {
  box-sizing: border-box;
  overflow: hidden;
  border: 1px solid #d7dee8;
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 1px 6px rgba(15, 23, 42, 0.08);
}
.docx-fit-viewer .docx-chart-fallback svg {
  display: block;
  width: 100%;
  height: auto;
}
`;
function P(e) {
  return e.localName || e.tagName.split(':').pop() || e.tagName;
}
function C(e, t) {
  return Array.from(e.querySelectorAll('*')).filter((o) => P(o) === t);
}
function b(e, t) {
  return C(e, t)[0];
}
function q(e, t, o) {
  return e.getAttributeNS(o, t) || e.getAttribute(t) || e.getAttribute(`r:${t}`);
}
function B(e) {
  return e ? (e.textContent || '').replace(/\s+/g, ' ').trim() : '';
}
function L(e, t) {
  let o = e?.parentElement || null;
  for (; o; ) {
    if (P(o) === t) return o;
    o = o.parentElement;
  }
  return null;
}
function R(e) {
  const t = P(e) === 'p' ? e : L(e, 'p');
  if (!t) return;
  let o = 0,
    i = t.previousElementSibling;
  for (; i; ) (P(i) === 'p' && (o += 1), (i = i.previousElementSibling));
  return o;
}
function N(e, t) {
  var o;
  const i = ((o = T(t)) === null || o === void 0 ? void 0 : o.DOMParser) || globalThis.DOMParser;
  if (!i) return null;
  const n = new i().parseFromString(e, 'application/xml');
  return n.querySelector('parsererror') ? null : n;
}
function z(e) {
  const t = [];
  return (
    e.split('/').forEach((o) => {
      if (!(!o || o === '.')) {
        if (o === '..') {
          t.pop();
          return;
        }
        t.push(o);
      }
    }),
    t.join('/')
  );
}
function G(e) {
  const t = e.lastIndexOf('/');
  return t >= 0 ? e.slice(0, t) : '';
}
function we(e) {
  const t = G(e),
    o = e.slice(t ? t.length + 1 : 0);
  return z(`${t}/_rels/${o}.rels`);
}
function J(e, t) {
  return t.startsWith('/') ? z(t.slice(1)) : z(`${G(e)}/${t}`);
}
function ye(e) {
  var t;
  switch ((t = e.split('.').pop()) === null || t === void 0 ? void 0 : t.toLowerCase()) {
    case 'png':
      return 'image/png';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'gif':
      return 'image/gif';
    case 'bmp':
      return 'image/bmp';
    case 'webp':
      return 'image/webp';
    case 'svg':
      return 'image/svg+xml';
    default:
      return 'application/octet-stream';
  }
}
function V(e) {
  if (!e) return;
  const t = e.trim().match(/^(-?\d+(?:\.\d+)?)(px|pt|in|cm|mm)?$/i);
  if (!t) return;
  const o = Number(t[1]);
  if (!Number.isFinite(o) || o <= 0) return;
  switch ((t[2] || 'px').toLowerCase()) {
    case 'pt':
      return (o * 96) / 72;
    case 'in':
      return o * 96;
    case 'cm':
      return (o * 96) / 2.54;
    case 'mm':
      return (o * 96) / 25.4;
    default:
      return o;
  }
}
function be(e) {
  const t = new Map();
  return (
    e &&
      e.split(';').forEach((o) => {
        const i = o.indexOf(':');
        i <= 0 || t.set(o.slice(0, i).trim().toLowerCase(), o.slice(i + 1).trim());
      }),
    t
  );
}
function Ee(e) {
  const t = be(e);
  return { width: V(t.get('width')), height: V(t.get('height')) };
}
function $e(e) {
  const t = L(e, 'inline') || L(e, 'anchor'),
    o = t ? b(t, 'extent') : void 0,
    i = Number(o?.getAttribute('cx')),
    n = Number(o?.getAttribute('cy'));
  return {
    width: Number.isFinite(i) && i > 0 ? i / Z : void 0,
    height: Number.isFinite(n) && n > 0 ? n / Z : void 0,
  };
}
async function Y(e, t, o) {
  const i = e.file(we(t)),
    n = new Map();
  if (!i) return n;
  const r = N(await i.async('text'), o);
  return (
    r &&
      C(r, 'Relationship').forEach((l) => {
        const s = l.getAttribute('Id'),
          f = l.getAttribute('Target');
        !s ||
          !f ||
          n.set(s, {
            id: s,
            type: l.getAttribute('Type') || '',
            target: f,
            targetMode: l.getAttribute('TargetMode') || void 0,
          });
      }),
    n
  );
}
async function Se(e, t) {
  const o = e.file(t);
  if (!o) return;
  const i = await o.async('base64');
  return `data:${ye(t)};base64,${i}`;
}
function Ce(e) {
  return Object.keys(e.files)
    .filter(
      (t) =>
        t === 'word/document.xml' ||
        /^word\/header\d+\.xml$/i.test(t) ||
        /^word\/footer\d+\.xml$/i.test(t),
    )
    .sort((t, o) =>
      t === 'word/document.xml' ? -1 : o === 'word/document.xml' ? 1 : t.localeCompare(o),
    );
}
function De(e, t, o) {
  const i = `${t?.getAttribute('id') || ''} ${t?.getAttribute('o:spid') || ''}`.toLowerCase(),
    n = (o || '').toLowerCase();
  return e.includes('/header') &&
    (i.includes('watermark') ||
      n.includes('z-index:-') ||
      n.includes('mso-position-horizontal:center'))
    ? 'watermark'
    : t?.getAttribute('o:ole') === 't' || t?.getAttribute('ole') === 't'
      ? 'ole-preview'
      : 'vml-image';
}
async function Me(e, t) {
  var o;
  const i = [],
    n = new Set();
  for (const r of Ce(e)) {
    const l = e.file(r);
    if (!l) continue;
    const s = N(await l.async('text'), t);
    if (!s) continue;
    const f = await Y(e, r, t);
    for (const u of C(s, 'imagedata')) {
      const c = q(u, 'id', 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'),
        p = c ? f.get(c) : void 0;
      if (!p || p.targetMode === 'External' || !p.type.includes('/image')) continue;
      const x = J(r, p.target),
        g = await Se(e, x);
      if (!g) continue;
      const v = L(u, 'shape'),
        a = v?.getAttribute('style') || void 0,
        h = De(r, v, a),
        m =
          h === 'watermark'
            ? `${h}:${x}`
            : `${h}:${r}:${x}:${(o = R(u)) !== null && o !== void 0 ? o : 'end'}`;
      n.has(m) ||
        (n.add(m),
        i.push({
          role: h,
          key: m,
          dataUrl: g,
          sourcePath: x,
          partPath: r,
          title: u.getAttribute('o:title') || u.getAttribute('title') || void 0,
          style: a,
          ...Ee(a),
          paragraphIndex: r === 'word/document.xml' ? R(u) : void 0,
        }));
    }
  }
  return i;
}
function _(e) {
  return e
    ? C(e, 'pt')
        .sort((t, o) => Number(t.getAttribute('idx') || 0) - Number(o.getAttribute('idx') || 0))
        .map((t) => B(b(t, 'v')))
        .filter(Boolean)
    : [];
}
function _e(e) {
  const t =
      _(b(b(e, 'tx') || e, 'strCache'))[0] || _(b(b(e, 'tx') || e, 'numCache'))[0] || 'Series',
    o = _(b(b(e, 'cat') || e, 'strCache')),
    i = _(b(b(e, 'cat') || e, 'numCache')),
    n = _(b(b(e, 'val') || e, 'numCache'))
      .map((r) => Number(r))
      .filter((r) => Number.isFinite(r));
  return { name: t, categories: o.length ? o : i, values: n };
}
function Pe(e, t, o, i) {
  const n = ['lineChart', 'barChart', 'pieChart', 'areaChart', 'scatterChart']
      .map((c) => C(e, c)[0])
      .find(Boolean),
    r = n ? P(n) : 'chart',
    l = B(b(b(e, 'title') || e, 't')) || t.split('/').pop() || 'Chart',
    s = C(n || e, 'ser')
      .map(_e)
      .filter((c) => c.values.length),
    { width: f, height: u } = $e(o);
  if (s.length)
    return {
      key: `chart:${t}:${i ?? 'end'}`,
      title: l,
      type: r,
      sourcePath: t,
      series: s,
      width: f,
      height: u,
      paragraphIndex: i,
    };
}
async function Ae(e, t) {
  const o = 'word/document.xml',
    i = e.file(o);
  if (!i) return [];
  const n = N(await i.async('text'), t);
  if (!n) return [];
  const r = await Y(e, o, t),
    l = [],
    s = new Set();
  for (const f of C(n, 'chart')) {
    const u = q(f, 'id', 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'),
      c = u ? r.get(u) : void 0;
    if (!c || c.targetMode === 'External' || !c.type.includes('/chart')) continue;
    const p = J(o, c.target),
      x = e.file(p);
    if (!x) continue;
    const g = N(await x.async('text'), t),
      v = R(f),
      a = g ? Pe(g, p, f, v) : void 0;
    !a || s.has(a.key) || (s.add(a.key), l.push(a));
  }
  return l;
}
function S(e) {
  return e
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
function Fe(e) {
  var t;
  const o = Math.max(360, Math.round(e.width || 520)),
    i = Math.max(220, Math.round(e.height || 320)),
    n = { top: 52, right: 30, bottom: 56, left: 54 },
    r = o - n.left - n.right,
    l = i - n.top - n.bottom,
    s = e.series.flatMap((d) => d.values),
    f = Math.max(...s, 1),
    u = Math.min(...s, 0),
    c = Math.max(f - u, 1),
    p = ['#2563eb', '#10b981', '#f97316', '#8b5cf6', '#ef4444'],
    x = Math.max(...e.series.map((d) => d.values.length), 1),
    g = (d) => n.left + (x === 1 ? r / 2 : (d * r) / (x - 1)),
    v = (d) => n.top + l - ((d - u) / c) * l,
    a = e.series
      .map((d, y) => {
        const E = p[y % p.length],
          D = d.values.map(($, O) => `${g(O).toFixed(1)},${v($).toFixed(1)}`).join(' '),
          M = d.values
            .map(($, O) => {
              const te = g(O).toFixed(1),
                oe = v($).toFixed(1);
              return `<circle cx="${te}" cy="${oe}" r="3.5" fill="${E}"><title>${S(d.name)}: ${S(String($))}</title></circle>`;
            })
            .join('');
        return `<polyline points="${D}" fill="none" stroke="${E}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>${M}`;
      })
      .join(''),
    m = (
      ((t = e.series.find((d) => d.categories.length)) === null || t === void 0
        ? void 0
        : t.categories) || []
    )
      .slice(0, x)
      .map((d, y) => {
        const E = g(y),
          D = d.length > 14 ? `${d.slice(0, 13)}...` : d;
        return `<text x="${E.toFixed(1)}" y="${i - 22}" text-anchor="middle" fill="#64748b" font-size="11">${S(D)}</text>`;
      })
      .join(''),
    w = e.series
      .slice(0, 5)
      .map((d, y) => {
        const E = n.left + y * 98,
          D = 30,
          M = p[y % p.length];
        return `<g transform="translate(${E} ${D})"><rect width="10" height="10" rx="2" fill="${M}"/><text x="15" y="9" fill="#475569" font-size="11">${S(d.name)}</text></g>`;
      })
      .join('');
  return `<svg viewBox="0 0 ${o} ${i}" role="img" aria-label="${S(e.title)}">
    <rect x="0" y="0" width="${o}" height="${i}" rx="8" fill="#ffffff"/>
    <text x="${n.left}" y="22" fill="#0f172a" font-size="15" font-weight="700">${S(e.title)}</text>
    ${w}
    <line x1="${n.left}" y1="${n.top + l}" x2="${n.left + r}" y2="${n.top + l}" stroke="#cbd5e1"/>
    <line x1="${n.left}" y1="${n.top}" x2="${n.left}" y2="${n.top + l}" stroke="#cbd5e1"/>
    <text x="${n.left - 8}" y="${n.top + 4}" text-anchor="end" fill="#64748b" font-size="11">${S(f.toFixed(1))}</text>
    <text x="${n.left - 8}" y="${n.top + l}" text-anchor="end" fill="#64748b" font-size="11">${S(u.toFixed(1))}</text>
    ${a}
    ${m}
  </svg>`;
}
function ke(e) {
  return Array.from(e.querySelectorAll('section.docx'));
}
function Le(e) {
  return Array.from(e.querySelectorAll('section.docx > article'));
}
function Ne(e, t) {
  if (t === void 0) return;
  const o = Array.from(e.querySelectorAll('section.docx > article p'));
  return o[Math.min(Math.max(t, 0), Math.max(o.length - 1, 0))];
}
function K(e, t, o) {
  const i = Ne(e, o);
  if (i) {
    i.after(t);
    return;
  }
  const n = Le(e)[0];
  n && n.appendChild(t);
}
function Te(e, t) {
  const o = ke(e);
  o.length &&
    t.forEach((i) => {
      if (i.role === 'watermark') {
        o.forEach((l) => {
          const s = e.ownerDocument.createElement('img');
          ((s.className = 'docx-vml-watermark'),
            (s.src = i.dataUrl),
            (s.alt = i.title || ''),
            (s.dataset.docxFallback = i.key),
            l.prepend(s));
        });
        return;
      }
      const n = e.ownerDocument.createElement('figure');
      ((n.className = 'docx-vml-fallback'),
        (n.dataset.docxFallback = i.key),
        i.width && (n.style.width = `${Math.round(i.width)}px`));
      const r = e.ownerDocument.createElement('img');
      ((r.src = i.dataUrl),
        (r.alt =
          i.title || (i.role === 'ole-preview' ? 'Embedded object preview' : 'Document image')),
        i.width && (r.style.width = `${Math.round(i.width)}px`),
        i.height && (r.style.height = `${Math.round(i.height)}px`),
        n.appendChild(r),
        K(e, n, i.paragraphIndex));
    });
}
function Oe(e, t) {
  t.forEach((o) => {
    const i = e.ownerDocument.createElement('figure');
    ((i.className = 'docx-chart-fallback'),
      (i.dataset.docxFallback = o.key),
      o.width && (i.style.width = `${Math.round(o.width)}px`),
      (i.innerHTML = Fe(o)),
      K(e, i, o.paragraphIndex));
  });
}
async function He(e, t) {
  try {
    const { default: o } = await U(
        async () => {
          const { default: l } = await import('./jszip.min-DnpxAPiE.js').then((s) => s.j);
          return { default: l };
        },
        __vite__mapDeps([1, 2, 3, 4, 5]),
        import.meta.url,
      ),
      i = await o.loadAsync(e.slice(0)),
      [n, r] = await Promise.all([Me(i, t), Ae(i, t)]);
    (n.length && Te(t, n), r.length && Oe(t, r));
  } catch (o) {
    console.warn('[file-viewer] DOCX 兼容增强解析失败，已保留 @file-viewer/docx 原始渲染结果。', o);
  }
}
function Re(e) {
  const t = e.ownerDocument.createElement('style');
  return ((t.textContent = ve), e.prepend(t), t);
}
function j(e, t, o) {
  const i = e.cloneNode(!1);
  ((i.innerHTML = ''),
    (i.dataset.docxPaginated = 'true'),
    (i.style.minHeight = `${o}px`),
    (i.style.height = `${o}px`),
    (i.style.overflow = 'hidden'));
  const n = t.cloneNode(!1);
  return (
    i.appendChild(n),
    Array.from(e.children).forEach((r) => {
      r !== t && i.appendChild(r.cloneNode(!0));
    }),
    { page: i, article: n }
  );
}
function ze(e) {
  var t;
  const o =
      (t = e.ownerDocument.defaultView) === null || t === void 0 ? void 0 : t.getComputedStyle(e),
    i = o ? parseFloat(o.minHeight) : 0;
  return Number.isFinite(i) && i > 0 ? i : e.offsetHeight;
}
function Xe(e) {
  const t = e.querySelector('.docx-wrapper');
  t &&
    Array.from(t.children).forEach((o) => {
      if (!k(o, e) || !o.matches('section.docx')) return;
      const i = o.querySelector(':scope > article');
      if (!k(i, e)) return;
      const n = ze(o),
        r = Array.from(i.childNodes);
      if (!n || r.length < 2 || o.scrollHeight <= n * 1.15) return;
      let l = j(o, i, n);
      (o.before(l.page),
        r.forEach((s) => {
          (l.article.appendChild(s),
            !(l.page.scrollHeight <= n + 1 || l.article.childNodes.length === 1) &&
              (l.article.removeChild(s),
              (l = j(o, i, n)),
              o.before(l.page),
              l.article.appendChild(s)));
        }),
        o.remove());
    });
}
function We(e, t) {
  const o = e.querySelector('.docx-wrapper');
  return o
    ? Array.from(o.children).flatMap((i) => {
        if (!k(i, e) || !i.matches('section.docx')) return [];
        const n = e.ownerDocument.createElement('div');
        return (
          (n.className = t ? 'docx-page-frame' : 'docx-flow-frame'),
          i.before(n),
          n.appendChild(i),
          [n]
        );
      })
    : [];
}
function Ie(e, t) {
  e.classList.add('docx-fit-viewer');
  const o = Re(e),
    i = ge(t);
  i && Xe(e);
  const n = We(e, i),
    r = T(e),
    l = r?.ResizeObserver;
  let s = 0,
    f = 1,
    u = 1,
    c = 1;
  const p = le(),
    x = (m) => Math.min(H, Math.max(A, Number(m.toFixed(2)))),
    g = () => {
      r &&
        (r.cancelAnimationFrame(s),
        (s = r.requestAnimationFrame(() => {
          let m = 1;
          (n.forEach((w) => {
            const d = w.firstElementChild;
            if (!k(d, e)) return;
            d.style.transform = 'translateX(-50%)';
            const y = d.offsetWidth,
              E = i ? d.offsetHeight : Math.max(d.scrollHeight, d.offsetHeight);
            if (!y || !E) return;
            const D = Math.max(e.clientWidth - 28, 120),
              M = Math.min(1, Math.max(A, D / y)),
              $ = x(M * f);
            ((m = $),
              (c = M),
              (d.style.transform = `translateX(-50%) scale(${$})`),
              (w.style.width = `${Math.ceil(Math.max(y * $, e.clientWidth - 28, 120))}px`),
              (w.style.maxWidth = 'none'),
              (w.style.height = `${Math.ceil(E * $)}px`));
          }),
            (u = m),
            p.emit());
        })));
    },
    v = () => ({
      scale: u,
      label: `${Math.round(u * 100)}%`,
      canZoomIn: u < H,
      canZoomOut: u > A,
      canReset: f !== 1,
      minScale: A,
      maxScale: H,
    }),
    a = (m) => ((f = Math.min(6, Math.max(0.2, Number(m.toFixed(2))))), g(), v());
  ((e.dataset.viewerZoomProvider = 'docx'),
    re(e, {
      zoomIn: () => a(f + I),
      zoomOut: () => a(f - I),
      resetZoom: () => a(1),
      setZoom: (m) => a(m / Math.max(c, 0.01)),
      getState: v,
      subscribe: p.subscribe,
    }));
  const h = l ? new l(g) : null;
  return (
    h?.observe(e),
    n.forEach((m) => {
      const w = X(m);
      w && h?.observe(w);
    }),
    g(),
    () => {
      (r?.cancelAnimationFrame(s),
        h?.disconnect(),
        ae(e),
        o.remove(),
        e.classList.remove('docx-fit-viewer'));
    }
  );
}
function X(e) {
  var t;
  const o = e.firstElementChild,
    i = (t = e.ownerDocument.defaultView) === null || t === void 0 ? void 0 : t.HTMLElement;
  return i && o instanceof i ? o : null;
}
function Q(e) {
  return !!e?.classList.contains('docx-flow-frame');
}
function ee(e) {
  const t = e ? X(e) : null;
  if (!t) return F;
  const o = de(t, F);
  return Q(e)
    ? { width: o.width, height: Math.max(t.scrollHeight || 0, t.offsetHeight || 0, F.height) }
    : o;
}
function Ze(e, t) {
  const o = Q(e),
    i = W(t.width),
    n = W(t.height);
  (ce(e, t, { heightMode: o ? 'min' : 'fixed' }), (e.style.margin = '0 auto 18px'));
  const r = X(e);
  r &&
    ((r.style.position = 'relative'),
    (r.style.top = 'auto'),
    (r.style.left = 'auto'),
    (r.style.width = i),
    (r.style.maxWidth = 'none'),
    (r.style.minHeight = o ? '0' : n),
    (r.style.height = o ? 'auto' : n),
    (r.style.margin = '0 auto'),
    (r.style.transform = 'none'),
    (r.style.transformOrigin = 'top left'),
    (r.style.overflow = o ? 'visible' : 'hidden'),
    (r.style.boxShadow = 'none'));
}
function Ve(e) {
  const t = e.querySelector('.docx-page-frame, .docx-flow-frame'),
    o = ee(t || void 0),
    i = t?.classList.contains('docx-flow-frame')
      ? '.viewer-export-content .docx-flow-frame'
      : '.viewer-export-content .docx-page-frame';
  return se({
    selector: i,
    width: o.width,
    height: t?.classList.contains('docx-flow-frame') ? F.height : o.height,
    heightMode: t?.classList.contains('docx-flow-frame') ? 'min' : 'fixed',
  });
}
function je(e) {
  const t = Array.from(e.querySelectorAll('.docx-page-frame, .docx-flow-frame')),
    o = e.cloneNode(!0),
    i = e.ownerDocument.createElement('div');
  i.className = 'docx-print-document';
  const n = Array.from(o.querySelectorAll('style'))
    .filter((r) => {
      var l;
      return !(!((l = r.textContent) === null || l === void 0) && l.includes('.docx-fit-viewer'));
    })
    .map((r) => r.outerHTML)
    .join('');
  return (
    o.querySelectorAll('.docx-page-frame, .docx-flow-frame').forEach((r, l) => {
      (Ze(r, ee(t[l])), i.appendChild(r.cloneNode(!0)));
    }),
    i.childElementCount ? `${n}${i.outerHTML}` : o.innerHTML
  );
}
async function Qe(e, t, o) {
  var i;
  he(e);
  let n = !1;
  const r = () => {
      var c;
      n || ((n = !0), (c = o?.onProgressiveRender) === null || c === void 0 || c.call(o));
    },
    l = xe(t, o, r),
    { defaultOptions: s, renderAsync: f } = await pe();
  ((t.dataset.docxWorker = l.useWorker ? 'self' : 'false'),
    await f(e, t, void 0, { ...s, ...l }),
    r(),
    await He(e, t));
  const u = Ie(t, o);
  return (
    (i = o?.registerExportAdapter) === null ||
      i === void 0 ||
      i.call(o, {
        includeDocumentStyles: !1,
        beforeSnapshot: () => {
          const c = T(t);
          c && c.dispatchEvent(new c.Event('resize'));
        },
        printStyle: () => Ve(t),
        toHtml: () => je(t),
      }),
    {
      $el: t,
      unmount() {
        var c;
        ((c = o?.registerExportAdapter) === null || c === void 0 || c.call(o, null),
          u(),
          delete t.dataset.docxWorker,
          (t.innerHTML = ''));
      },
    }
  );
}
export { Qe as default };
