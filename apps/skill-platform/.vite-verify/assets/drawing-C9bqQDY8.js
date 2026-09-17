const __vite__mapDeps = (
  i,
  m = __vite__mapDeps,
  d = m.f ||
    (m.f = [
      './markdown-it-vendor-DL4wSELR.js',
      './ui-vendor-C-FKu2uc.js',
      './markdown-vendor-DldLOD9R.js',
      './markdown-vendor-CmuYMs8x.css',
      './percentages-BXMCSKIN-BjlwlnnH.js',
      './index-C2avURFS.js',
      './icons-B5Lu0sqU.js',
      './index-DUUm-ELF.css',
      './diagram-CVFe09lw.js',
      './panzoom.es-DqQtegHv.js',
    ]),
) => i.map((i) => d[i]);
import { p as j } from './assets-Cqo46k_X.js';
import './icons-B5Lu0sqU.js';
import { aO as J, ad as K, b7 as Q, aQ as Z, b5 as q } from './index-C2avURFS.js';
import './markdown-it-vendor-DL4wSELR.js';
import { _ as F } from './markdown-vendor-DldLOD9R.js';
import './ui-vendor-C-FKu2uc.js';
const tt = 'http://www.w3.org/2000/svg',
  Y = 6e3,
  et = 6e3,
  z = new WeakMap(),
  rt = `
.drawing-viewer{display:flex;height:100%;min-height:360px;flex-direction:column;background:#edf2f7;color:#172033}
.drawing-toolbar{position:sticky;top:0;z-index:2;display:flex;min-height:46px;align-items:center;justify-content:space-between;gap:16px;padding:8px 14px;border-bottom:1px solid rgba(148,163,184,.35);background:rgba(248,250,252,.92);backdrop-filter:blur(12px)}
.drawing-title{display:flex;min-width:0;align-items:center;gap:10px}
.drawing-title span{display:inline-flex;height:24px;align-items:center;justify-content:center;border-radius:6px;padding:0 8px;background:#0f766e;color:#fff;font-size:11px;font-weight:800;letter-spacing:0}
.drawing-title strong{overflow:hidden;color:#172033;font-size:13px;font-weight:800;text-overflow:ellipsis;white-space:nowrap}
.drawing-actions{display:flex;flex-shrink:0;align-items:center;gap:6px}
.drawing-actions button{min-width:32px;height:28px;border:1px solid rgba(100,116,139,.28);border-radius:6px;background:#fff;color:#0f172a;cursor:pointer;font-size:12px;font-weight:800}
.drawing-actions button:hover{border-color:rgba(15,118,110,.5);color:#0f766e}
.drawing-actions span{min-width:48px;color:#64748b;font-size:12px;font-weight:800;text-align:center}
.drawing-stage{position:relative;min-height:0;flex:1;overflow:hidden}
.drawing-scroll{height:100%;overflow:auto;padding:22px}
.drawing-canvas{width:100%;min-height:420px;transition:transform .18s ease,zoom .18s ease}
.drawing-canvas .drawing-svg,.drawing-canvas svg{display:block;max-width:100%;height:auto;margin:0 auto;border-radius:10px;background:#fff;box-shadow:0 18px 42px rgba(15,23,42,.12)}
.drawing-canvas .drawing-mxgraph{min-height:420px;overflow:hidden;border-radius:10px;background:#fff;box-shadow:0 18px 42px rgba(15,23,42,.12)}
.drawing-diagram-shell{display:flex;min-height:100%;align-items:center;justify-content:center;overflow:hidden;border-radius:10px;background:linear-gradient(135deg,#f8fafc,#eef6f4);box-shadow:0 18px 42px rgba(15,23,42,.12)}
.drawing-diagram-pan{display:inline-flex;min-width:240px;min-height:180px;align-items:center;justify-content:center;padding:32px;cursor:grab;touch-action:none}
.drawing-diagram-pan:active{cursor:grabbing}
.drawing-diagram-pan .drawing-diagram-svg{margin:0;box-shadow:none}
.file-viewer[data-viewer-theme='dark'] .drawing-diagram-shell{background:linear-gradient(135deg,#111827,#0f172a)}
@media (prefers-color-scheme:dark){.file-viewer[data-viewer-theme='system'] .drawing-diagram-shell{background:linear-gradient(135deg,#111827,#0f172a)}}
.drawing-state{position:absolute;inset:0;z-index:1;display:flex;align-items:center;justify-content:center;padding:24px;color:#64748b;font-size:14px;font-weight:700;text-align:center}
.drawing-state[hidden]{display:none!important}
.drawing-state.error{color:#b42318}
@media (max-width:720px){.drawing-toolbar{align-items:flex-start;flex-direction:column}.drawing-actions{width:100%;justify-content:space-between}.drawing-scroll{padding:12px}}
`,
  it = (t) => {
    const e = t.createElement('style');
    return ((e.textContent = rt), e);
  },
  C = (t, e, r, n) => {
    const i = t.createElement(e);
    return (r && (i.className = r), n !== void 0 && (i.textContent = n), i);
  },
  M = (t, e) => t.createElementNS(tt, e),
  ot = (t) => {
    const e = t?.toLowerCase();
    return e === 'excalidraw'
      ? 'excalidraw'
      : e === 'mermaid' || e === 'mmd'
        ? 'mermaid'
        : e === 'plantuml' || e === 'puml'
          ? 'plantuml'
          : 'drawio';
  },
  nt = (t) => {
    const e = (t || 'drawio').toLowerCase();
    return e === 'dio' ? 'DRAWIO' : e.toUpperCase();
  },
  at = (t) => Math.min(3, Math.max(0.5, Number(t.toFixed(2)))),
  d = (t, e = 0) => {
    const r = Number(t);
    return Number.isFinite(r) ? r : e;
  },
  st = (t) => !t || t === 'transparent' || t === 'rgba(0, 0, 0, 0)',
  dt = (t, e) => j(t, e?.baseURI || e?.URL),
  lt = (t) => {
    try {
      return new URL('.', t).href;
    } catch {
      const e = t.lastIndexOf('/');
      return e >= 0 ? t.slice(0, e + 1) : '';
    }
  },
  ct = (t, e) => {
    const r = t.defaultView || (typeof window < 'u' ? window : void 0);
    if (!r) return;
    const n = r,
      i = lt(e),
      o = (p, g) => {
        (n[p] === void 0 || n[p] === '') && (n[p] = g);
      };
    (o('PROXY_URL', `${i}proxy`),
      o('STYLE_PATH', `${i}styles`),
      o('SHAPES_PATH', `${i}shapes`),
      o('STENCIL_PATH', `${i}stencils`),
      o('DRAW_MATH_URL', `${i}math4/es5`),
      o('GRAPH_IMAGE_PATH', `${i}img`),
      o('mxImageBasePath', `${i}mxgraph/images`),
      o('mxBasePath', `${i}mxgraph/`),
      o('mxLoadStylesheets', !1),
      o('DRAWIO_BASE_URL', i.replace(/\/$/, '')),
      o('DRAWIO_LIGHTBOX_URL', i.replace(/\/$/, '')),
      o('DRAWIO_SERVER_URL', i),
      o('DRAWIO_VIEWER_URL', `${i}viewer-static.min.js`),
      o('DRAWIO_LOG_URL', ''),
      o('EXPORT_URL', `${i}export`),
      o('PLANT_URL', `${i}plant`),
      o('VSS_CONVERT_URL', `${i}VsdConverter/api/converter`),
      o('DRAWIO_GITLAB_URL', i),
      o('DRAWIO_GITHUB_URL', i),
      o('DRAWIO_GITHUB_API_URL', i),
      o('RT_WEBSOCKET_URL', `${i}rt`),
      o('NOTIFICATIONS_URL', `${i}notifications`));
  },
  gt = (t) => {
    let e = z.get(t);
    return (e || ((e = new Map()), z.set(t, e)), e);
  },
  ht = (t, e) => {
    const r = z.get(t);
    (r?.delete(e), r && r.size === 0 && z.delete(t));
  },
  pt = (t, e) => {
    if ((t.defaultView || (typeof window < 'u' ? window : void 0))?.GraphViewer)
      return Promise.resolve();
    ct(t, e);
    const n = gt(t),
      i = n.get(e);
    if (i) return i;
    const o = new Promise((p, g) => {
      const u = Array.from(t.querySelectorAll('script[src]')).find((f) => f.src === e);
      if (u) {
        (u.addEventListener('load', () => p(), { once: !0 }),
          u.addEventListener('error', () => g(new Error('diagrams.net viewer 加载失败')), {
            once: !0,
          }));
        return;
      }
      const a = t.createElement('script');
      ((a.src = e),
        (a.async = !0),
        (a.onload = () => p()),
        (a.onerror = () => g(new Error('diagrams.net viewer 加载失败'))),
        t.head.appendChild(a));
    });
    return (n.set(e, o), o);
  },
  B = async (t, e, r) => {
    let n;
    try {
      return await Promise.race([
        t,
        new Promise((i, o) => {
          n = setTimeout(() => o(new Error(r)), e);
        }),
      ]);
    } finally {
      n && clearTimeout(n);
    }
  },
  R = (t, e) => (t.dataset.drawingRendered ? !1 : ((t.dataset.drawingRendered = e), !0)),
  U = (t, e, r) => {
    R(t, r) && (e.classList.add('drawing-svg'), t.appendChild(e));
  },
  ut = () => {
    const t = console.error,
      e = (...r) => {
        const n = r.map((i) => String(i)).join(' ');
        n.includes('Failed to use workers for subsetting') ||
          n.includes('Failed to fetch font family') ||
          t(...r);
      };
    return (
      (console.error = e),
      () => {
        console.error === e && (console.error = t);
      }
    );
  },
  H = (t) =>
    Array.isArray(t.points) && t.points.length
      ? t.points.map((e) => [d(t.x) + d(e[0]), d(t.y) + d(e[1])])
      : [
          [d(t.x), d(t.y)],
          [d(t.x) + d(t.width), d(t.y) + d(t.height)],
        ],
  wt = (t) => {
    const e = H(t),
      r = e.map((i) => i[0]),
      n = e.map((i) => i[1]);
    return (
      Array.isArray(t.points) || (r.push(d(t.x) + d(t.width)), n.push(d(t.y) + d(t.height))),
      { minX: Math.min(...r), minY: Math.min(...n), maxX: Math.max(...r), maxY: Math.max(...n) }
    );
  },
  ft = (t) => {
    const e = {
        minX: Number.POSITIVE_INFINITY,
        minY: Number.POSITIVE_INFINITY,
        maxX: Number.NEGATIVE_INFINITY,
        maxY: Number.NEGATIVE_INFINITY,
      },
      r = t.reduce((n, i) => {
        const o = wt(i);
        return {
          minX: Math.min(n.minX, o.minX),
          minY: Math.min(n.minY, o.minY),
          maxX: Math.max(n.maxX, o.maxX),
          maxY: Math.max(n.maxY, o.maxY),
        };
      }, e);
    return Number.isFinite(r.minX) ? r : { minX: 0, minY: 0, maxX: 800, maxY: 480 };
  },
  mt = (t) => {
    const e = st(t.backgroundColor) ? void 0 : t.backgroundColor;
    return {
      stroke: t.strokeColor || '#1e1e1e',
      strokeWidth: Math.max(1, d(t.strokeWidth, 1)),
      roughness: Math.max(0, d(t.roughness, 1)),
      fill: e,
      fillStyle: t.fillStyle || 'hachure',
      seed: d(t.seed, 1),
      strokeLineDash:
        t.strokeStyle === 'dashed' ? [10, 8] : t.strokeStyle === 'dotted' ? [2, 6] : void 0,
    };
  },
  O = (t, e, r) => {
    const n = d(e.opacity, 100) / 100;
    (n < 1 && r.setAttribute('opacity', String(n)), t.appendChild(r));
  },
  xt = (t, e) => {
    const r = M(t, 'g'),
      n = d(e.angle);
    if (n) {
      const i = d(e.x) + d(e.width) / 2,
        o = d(e.y) + d(e.height) / 2;
      r.setAttribute('transform', `rotate(${(n * 180) / Math.PI} ${i} ${o})`);
    }
    return r;
  },
  yt = (t, e, r) => {
    const n = String(r.text || '');
    if (!n.trim()) return;
    const i = M(t, 'text'),
      o = Math.max(8, d(r.fontSize, 20)),
      p = o * 1.25,
      g = n.split(/\r?\n/),
      u = {
        1: 'Virgil, Segoe Print, Comic Sans MS, sans-serif',
        2: 'Helvetica, Arial, sans-serif',
        3: 'Cascadia Mono, Menlo, Consolas, monospace',
      };
    (i.setAttribute('x', String(d(r.x))),
      i.setAttribute('y', String(d(r.y) + o)),
      i.setAttribute('fill', r.strokeColor || '#1e1e1e'),
      i.setAttribute('font-size', String(o)),
      i.setAttribute('font-family', u[d(r.fontFamily, 1)] || u[1]),
      i.setAttribute('font-weight', String(r.fontWeight || 400)),
      i.setAttribute(
        'text-anchor',
        r.textAlign === 'center' ? 'middle' : r.textAlign === 'right' ? 'end' : 'start',
      ),
      r.textAlign === 'center'
        ? i.setAttribute('x', String(d(r.x) + d(r.width) / 2))
        : r.textAlign === 'right' && i.setAttribute('x', String(d(r.x) + d(r.width))),
      g.forEach((a, f) => {
        const w = M(t, 'tspan');
        (w.setAttribute('x', i.getAttribute('x') || String(d(r.x))),
          w.setAttribute('dy', f === 0 ? '0' : String(p)),
          (w.textContent = a),
          i.appendChild(w));
      }),
      O(e, r, i));
  },
  bt = (t, e, r, n) => {
    if (!(r.endArrowhead || r.startArrowhead) || n.length < 2) return;
    const o = n[n.length - 1],
      p = n[n.length - 2],
      g = Math.atan2(o[1] - p[1], o[0] - p[0]),
      u = Math.max(10, d(r.strokeWidth, 1) * 7),
      a = [o[0] - u * Math.cos(g - Math.PI / 7), o[1] - u * Math.sin(g - Math.PI / 7)],
      f = [o[0] - u * Math.cos(g + Math.PI / 7), o[1] - u * Math.sin(g + Math.PI / 7)],
      w = M(t, 'polygon');
    (w.setAttribute('points', `${o.join(',')} ${a.join(',')} ${f.join(',')}`),
      w.setAttribute('fill', r.strokeColor || '#1e1e1e'),
      w.setAttribute('stroke', r.strokeColor || '#1e1e1e'),
      O(e, r, w));
  },
  At = async (t, e, r, n) => {
    const { default: i } = await F(
        async () => {
          const { default: c } = await import('./markdown-it-vendor-DL4wSELR.js').then((A) => A.aS);
          return { default: c };
        },
        __vite__mapDeps([0, 1, 2, 3]),
        import.meta.url,
      ),
      o = ft(r),
      p = 80,
      g = Math.max(320, o.maxX - o.minX + p * 2),
      u = Math.max(220, o.maxY - o.minY + p * 2),
      a = M(t, 'svg'),
      f = M(t, 'g'),
      w = i.svg(a);
    (a.setAttribute('viewBox', `${o.minX - p} ${o.minY - p} ${g} ${u}`),
      a.setAttribute('width', String(g)),
      a.setAttribute('height', String(u)),
      a.setAttribute('role', 'img'),
      a.setAttribute('aria-label', 'Excalidraw rough.js preview'));
    const m = M(t, 'rect');
    (m.setAttribute('x', String(o.minX - p)),
      m.setAttribute('y', String(o.minY - p)),
      m.setAttribute('width', String(g)),
      m.setAttribute('height', String(u)),
      m.setAttribute('fill', e.appState?.viewBackgroundColor || '#ffffff'),
      a.appendChild(m),
      a.appendChild(f),
      r.forEach((c) => {
        const A = xt(t, c),
          _ = mt(c),
          y = d(c.x),
          v = d(c.y),
          b = d(c.width),
          k = d(c.height);
        if (c.type === 'text') yt(t, A, c);
        else if (c.type === 'rectangle') O(A, c, w.rectangle(y, v, b, k, _));
        else if (c.type === 'diamond')
          O(
            A,
            c,
            w.polygon(
              [
                [y + b / 2, v],
                [y + b, v + k / 2],
                [y + b / 2, v + k],
                [y, v + k / 2],
              ],
              _,
            ),
          );
        else if (c.type === 'ellipse')
          O(A, c, w.ellipse(y + b / 2, v + k / 2, Math.abs(b), Math.abs(k), _));
        else if (c.type === 'line' || c.type === 'arrow' || c.type === 'freedraw') {
          const S = H(c);
          (O(A, c, w.linearPath(S, _)), c.type === 'arrow' && bt(t, A, c, S));
        }
        A.childNodes.length && f.appendChild(A);
      }),
      U(n, a, 'rough'));
  },
  St = async (t, e, r) => {
    const n = ut(),
      i = setTimeout(n, Y + 1e3),
      { exportToSvg: o, restore: p } = await F(
        async () => {
          const { exportToSvg: g, restore: u } =
            await import('./percentages-BXMCSKIN-BjlwlnnH.js').then((a) => a.i);
          return { exportToSvg: g, restore: u };
        },
        __vite__mapDeps([4, 2, 1, 0, 3, 5, 6, 7]),
        import.meta.url,
      );
    try {
      const g = p({ elements: e, appState: t.appState || {}, files: t.files || {} }, null, null, {
          repairBindings: !0,
          refreshDimensions: !0,
        }),
        u = g.elements.filter((f) => !f.isDeleted),
        a = await o({
          elements: u,
          appState: {
            ...g.appState,
            exportBackground: !0,
            viewBackgroundColor: g.appState.viewBackgroundColor || '#ffffff',
          },
          files: g.files || {},
        });
      U(r, a, 'official');
    } finally {
      (clearTimeout(i), setTimeout(n, 3e3));
    }
  },
  vt = async (t, e, r) => {
    const n = JSON.parse(e),
      i = Array.isArray(n.elements) ? n.elements.filter((o) => !o.isDeleted) : [];
    if (!i.length) throw new Error('Excalidraw 文件中没有可预览图元');
    try {
      await B(St(n, i, r), Y, 'Excalidraw 官方导出超时，自动切换 rough.js 兼容渲染');
    } catch (o) {
      (console.warn(o), await At(t, n, i, r));
    }
  },
  Mt = (t, e) => Array.from(t.children).find((r) => r.localName === e) || null,
  G = (t) => {
    const e = new Map();
    for (const r of (t || '').split(';')) {
      if (!r) continue;
      const [n, ...i] = r.split('=');
      e.set(n, i.join('=') || '1');
    }
    return e;
  },
  N = (t, e, r) => {
    const n = t.get(e);
    return n && n !== 'none' ? n : r;
  },
  W = (t) => {
    const e = Mt(t, 'mxGeometry');
    return e
      ? {
          x: d(e.getAttribute('x')),
          y: d(e.getAttribute('y')),
          width: Math.max(1, d(e.getAttribute('width'), 80)),
          height: Math.max(1, d(e.getAttribute('height'), 40)),
          points: Array.from(e.querySelectorAll('mxPoint')).map((r) => ({
            x: d(r.getAttribute('x')),
            y: d(r.getAttribute('y')),
          })),
        }
      : null;
  },
  Et = (t, e) => {
    if (!e) return '';
    const r = t.createElement('textarea');
    return (
      (r.innerHTML = e),
      r.value
        .replace(
          /<br\s*\/?>/gi,
          `
`,
        )
        .replace(/<[^>]+>/g, '')
        .replace(/\u00a0/g, ' ')
        .replace(/[ \t]+/g, ' ')
        .trim()
    );
  },
  It = (t, e, r, n, i, o, p, g, u) => {
    if (!r) return;
    const a = M(t, 'text'),
      f = Math.max(4, Math.floor(o / Math.max(7, g * 0.55))),
      w = r.includes(' ') ? r.split(/\s+/) : r.match(new RegExp(`.{1,${f}}`, 'g')) || [r],
      m = [];
    let c = '';
    for (const y of w) {
      const v = c ? `${c} ${y}` : y;
      v.length > f && c ? (m.push(c), (c = y)) : (c = v);
    }
    c && m.push(c);
    const A = g * 1.24,
      _ = A * m.length;
    (a.setAttribute('x', String(n + o / 2)),
      a.setAttribute('y', String(i + p / 2 - _ / 2 + g)),
      a.setAttribute('fill', u),
      a.setAttribute('font-size', String(g)),
      a.setAttribute('font-family', 'Inter, Segoe UI, Arial, sans-serif'),
      a.setAttribute('font-weight', '600'),
      a.setAttribute('text-anchor', 'middle'),
      a.setAttribute('pointer-events', 'none'),
      m.slice(0, 5).forEach((y, v) => {
        const b = M(t, 'tspan');
        (b.setAttribute('x', String(n + o / 2)),
          b.setAttribute('dy', v === 0 ? '0' : String(A)),
          (b.textContent = y),
          a.appendChild(b));
      }),
      e.appendChild(a));
  },
  X = (t, e, r) => {
    const i = new DOMParser().parseFromString(e, 'text/xml'),
      o = i.querySelector('parsererror');
    if (o) throw new Error(`Draw.io XML 解析失败：${o.textContent || 'invalid xml'}`);
    const p = i.querySelector('diagram'),
      g = p?.querySelector('mxGraphModel') || i.querySelector('mxGraphModel');
    if (!g) throw new Error('当前 Draw.io 文件没有可直接渲染的 mxGraphModel。');
    const u = Array.from(g.querySelectorAll('mxCell')),
      a = u
        .filter((s) => s.getAttribute('vertex') === '1' && s.getAttribute('connectable') !== '0')
        .map((s) => ({
          cell: s,
          id: s.getAttribute('id') || '',
          geometry: W(s),
          style: G(s.getAttribute('style')),
          text: Et(t, s.getAttribute('value')),
        }))
        .filter((s) => s.id && s.geometry);
    if (!a.length) throw new Error('当前 Draw.io 文件没有可预览图元。');
    const f = new Map(a.map((s) => [s.id, s])),
      w = a.flatMap((s) => [s.geometry.x, s.geometry.x + s.geometry.width]),
      m = a.flatMap((s) => [s.geometry.y, s.geometry.y + s.geometry.height]),
      c = [],
      A = u.filter((s) => s.getAttribute('edge') === '1');
    for (const s of A) {
      const l = f.get(s.getAttribute('source') || ''),
        x = f.get(s.getAttribute('target') || ''),
        D = W(s);
      (l?.geometry &&
        c.push({ x: l.geometry.x + l.geometry.width / 2, y: l.geometry.y + l.geometry.height / 2 }),
        D?.points.forEach((V) => c.push(V)),
        x?.geometry &&
          c.push({
            x: x.geometry.x + x.geometry.width / 2,
            y: x.geometry.y + x.geometry.height / 2,
          }));
    }
    (w.push(...c.map((s) => s.x)), m.push(...c.map((s) => s.y)));
    const _ = 96,
      y = Math.min(...w) - _,
      v = Math.min(...m) - _,
      b = Math.max(480, Math.max(...w) - Math.min(...w) + _ * 2),
      k = Math.max(320, Math.max(...m) - Math.min(...m) + _ * 2),
      S = M(t, 'svg');
    (S.setAttribute('viewBox', `${y} ${v} ${b} ${k}`),
      S.setAttribute('width', String(Math.ceil(b))),
      S.setAttribute('height', String(Math.ceil(k))),
      S.setAttribute('role', 'img'),
      S.setAttribute('aria-label', p?.getAttribute('name') || 'Draw.io local SVG preview'));
    const L = M(t, 'defs'),
      T = M(t, 'marker');
    (T.setAttribute('id', 'drawio-arrow'),
      T.setAttribute('viewBox', '0 0 10 10'),
      T.setAttribute('refX', '9'),
      T.setAttribute('refY', '5'),
      T.setAttribute('markerWidth', '7'),
      T.setAttribute('markerHeight', '7'),
      T.setAttribute('orient', 'auto-start-reverse'));
    const I = M(t, 'path');
    (I.setAttribute('d', 'M 0 0 L 10 5 L 0 10 z'),
      I.setAttribute('fill', '#64748b'),
      T.appendChild(I),
      L.appendChild(T),
      S.appendChild(L));
    const $ = M(t, 'rect');
    ($.setAttribute('x', String(y)),
      $.setAttribute('y', String(v)),
      $.setAttribute('width', String(b)),
      $.setAttribute('height', String(k)),
      $.setAttribute('fill', '#ffffff'),
      S.appendChild($));
    for (const s of A) {
      const l = f.get(s.getAttribute('source') || ''),
        x = f.get(s.getAttribute('target') || '');
      if (!l?.geometry || !x?.geometry) continue;
      const D = G(s.getAttribute('style')),
        V = N(D, 'strokeColor', '#64748b'),
        E = [
          { x: l.geometry.x + l.geometry.width / 2, y: l.geometry.y + l.geometry.height / 2 },
          ...(W(s)?.points || []),
          { x: x.geometry.x + x.geometry.width / 2, y: x.geometry.y + x.geometry.height / 2 },
        ],
        h = M(t, 'polyline');
      (h.setAttribute('points', E.map((P) => `${P.x},${P.y}`).join(' ')),
        h.setAttribute('fill', 'none'),
        h.setAttribute('stroke', V),
        h.setAttribute('stroke-width', '2'),
        D.get('dashed') === '1' && h.setAttribute('stroke-dasharray', '8 7'),
        D.get('endArrow') !== 'none' && h.setAttribute('marker-end', 'url(#drawio-arrow)'),
        S.appendChild(h));
    }
    for (const s of a) {
      const l = s.geometry,
        x = N(s.style, 'fillColor', '#f8fafc'),
        D = N(s.style, 'strokeColor', '#64748b'),
        V = Math.max(10, d(s.style.get('fontSize'), 14)),
        E = s.style.has('ellipse')
          ? 'ellipse'
          : s.style.get('shape') === 'rhombus'
            ? 'diamond'
            : 'rect';
      if (E === 'ellipse') {
        const h = M(t, 'ellipse');
        (h.setAttribute('cx', String(l.x + l.width / 2)),
          h.setAttribute('cy', String(l.y + l.height / 2)),
          h.setAttribute('rx', String(l.width / 2)),
          h.setAttribute('ry', String(l.height / 2)),
          h.setAttribute('fill', x),
          h.setAttribute('stroke', D),
          h.setAttribute('stroke-width', '2'),
          S.appendChild(h));
      } else if (E === 'diamond') {
        const h = M(t, 'polygon');
        (h.setAttribute(
          'points',
          [
            `${l.x + l.width / 2},${l.y}`,
            `${l.x + l.width},${l.y + l.height / 2}`,
            `${l.x + l.width / 2},${l.y + l.height}`,
            `${l.x},${l.y + l.height / 2}`,
          ].join(' '),
        ),
          h.setAttribute('fill', x),
          h.setAttribute('stroke', D),
          h.setAttribute('stroke-width', '2'),
          S.appendChild(h));
      } else {
        const h = M(t, 'rect');
        (h.setAttribute('x', String(l.x)),
          h.setAttribute('y', String(l.y)),
          h.setAttribute('width', String(l.width)),
          h.setAttribute('height', String(l.height)),
          h.setAttribute('rx', s.style.get('rounded') === '1' ? '10' : '2'),
          h.setAttribute('fill', x),
          h.setAttribute('stroke', D),
          h.setAttribute('stroke-width', '2'),
          S.appendChild(h));
      }
      It(t, S, s.text, l.x, l.y, l.width, l.height, V, N(s.style, 'fontColor', '#172033'));
    }
    U(r, S, 'rough');
  },
  kt = async (t, e, r, n) => {
    const i = t.defaultView || (typeof window < 'u' ? window : void 0);
    (await pt(t, n), await Q(i));
    const o = C(t, 'div', 'mxgraph drawing-mxgraph');
    if (
      (o.setAttribute(
        'data-mxgraph',
        JSON.stringify({
          xml: e,
          toolbar: 'zoom layers lightbox',
          nav: !0,
          resize: !0,
          'auto-fit': !0,
          'auto-crop': !0,
          'auto-origin': !0,
          'allow-zoom-in': !0,
          'allow-zoom-out': !0,
          border: 16,
          highlight: '#0f766e',
        }),
      ),
      r.appendChild(o),
      !i?.GraphViewer)
    )
      throw new Error('diagrams.net viewer 未正确初始化');
    (i.GraphViewer.createViewerForElement(o), R(r, 'official'));
  },
  Ct = async (t, e, r, n) => {
    if (n?.preferOfficial === !1) {
      X(t, e, r);
      return;
    }
    const i = dt(n, t);
    try {
      await B(kt(t, e, r, i), et, 'diagrams.net 官方 Viewer 加载超时，自动切换本地 SVG 预览');
    } catch (o) {
      (console.warn(o),
        ht(t, i),
        delete r.dataset.drawingRendered,
        r.replaceChildren(),
        X(t, e, r));
    }
  };
async function Ot(t, e, r = 'drawio', n) {
  const i = e.ownerDocument || document,
    o = ot(r),
    p = K();
  let g = 'loading',
    u = '',
    a = 1,
    f = !1,
    w = null;
  const m = C(i, 'div', 'drawing-viewer');
  m.dataset.viewerZoomProvider = 'drawing';
  const c = C(i, 'div', 'drawing-toolbar'),
    A = C(i, 'div', 'drawing-title');
  A.append(
    C(i, 'span', void 0, nt(r)),
    C(
      i,
      'strong',
      void 0,
      o === 'excalidraw'
        ? 'Excalidraw 官方 SVG 预览'
        : o === 'mermaid'
          ? 'Mermaid SVG 预览'
          : o === 'plantuml'
            ? 'PlantUML SVG 预览'
            : 'Draw.io 离线 SVG 预览',
    ),
  );
  const _ = C(i, 'div', 'drawing-actions'),
    y = C(i, 'button', void 0, '-'),
    v = C(i, 'span'),
    b = C(i, 'button', void 0, '+'),
    k = C(i, 'button', void 0, '适合');
  ([y, b, k].forEach((E) => {
    E.type = 'button';
  }),
    (y.title = '缩小'),
    (b.title = '放大'),
    (k.title = '适合宽度'),
    _.append(y, v, b, k),
    c.append(A, _));
  const S = C(i, 'div', 'drawing-stage'),
    L = C(i, 'div', 'drawing-state'),
    T = C(i, 'div', 'drawing-scroll'),
    I = C(i, 'div', 'drawing-canvas');
  (T.append(I), S.append(L, T), m.append(c, S), e.replaceChildren(it(i), m));
  const $ = () => {
      (w?.destroy(), (w = null), delete I.dataset.drawingRendered, I.replaceChildren());
    },
    s = () => ({
      scale: a,
      label: `${Math.round(a * 100)}%`,
      canZoomIn: a < 3,
      canZoomOut: a > 0.5,
      canReset: a !== 1,
      minScale: 0.5,
      maxScale: 3,
    }),
    l = () => {
      if (w) {
        (w.setZoom(a), (v.textContent = `${Math.round(a * 100)}%`));
        return;
      }
      (o === 'excalidraw'
        ? ((I.style.transform = `scale(${a})`),
          (I.style.transformOrigin = 'top center'),
          (I.style.zoom = ''))
        : ((I.style.transform = ''), (I.style.transformOrigin = ''), (I.style.zoom = String(a))),
        (v.textContent = `${Math.round(a * 100)}%`));
    },
    x = (E) => ((a = at(E)), l(), p.emit(), s()),
    D = () => {
      ((L.hidden = g === 'ready'),
        L.classList.toggle('error', g === 'error'),
        (L.textContent = g === 'error' ? u : '正在加载绘图预览...'),
        l());
    },
    V = async () => {
      ((g = 'loading'), (u = ''), (a = 1), $(), D());
      try {
        const E = await J(t);
        if (f) return;
        if (o === 'excalidraw') await vt(i, E, I);
        else if (o === 'mermaid' || o === 'plantuml') {
          const { renderDiagram: h } = await F(
            async () => {
              const { renderDiagram: P } = await import('./diagram-CVFe09lw.js');
              return { renderDiagram: P };
            },
            __vite__mapDeps([8, 2, 1, 0, 3, 9]),
            import.meta.url,
          );
          w = await h({
            documentRef: i,
            text: E,
            target: I,
            kind: o,
            options: n?.options?.drawing,
            theme: n?.options?.theme,
          });
        } else await Ct(i, E, I, n?.options?.drawing);
        if (f) return;
        ((g = 'ready'), D());
      } catch (E) {
        if (f) return;
        (console.error(E), (u = E instanceof Error ? E.message : String(E)), (g = 'error'), D());
      }
    };
  return (
    Z(m, {
      zoomIn: () => x(a + 0.15),
      zoomOut: () => x(a - 0.15),
      resetZoom: () => x(1),
      setZoom: x,
      getState: s,
      subscribe: p.subscribe,
    }),
    y.addEventListener('click', () => x(a - 0.15)),
    b.addEventListener('click', () => x(a + 0.15)),
    k.addEventListener('click', () => x(1)),
    D(),
    V(),
    {
      $el: m,
      unmount() {
        ((f = !0), w?.destroy(), q(m), e.replaceChildren());
      },
    }
  );
}
export { Ot as default };
