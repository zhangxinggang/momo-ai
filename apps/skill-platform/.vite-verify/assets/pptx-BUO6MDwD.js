const __vite__mapDeps = (
  i,
  m = __vite__mapDeps,
  d = m.f ||
    (m.f = [
      './billboard-C3IwVd7Y.js',
      './markdown-it-vendor-DL4wSELR.js',
      './ui-vendor-C-FKu2uc.js',
      './markdown-vendor-DldLOD9R.js',
      './markdown-vendor-CmuYMs8x.css',
    ]),
) => i.map((i) => d[i]);
import './icons-B5Lu0sqU.js';
import { aQ as $, b5 as B, ad as I, b7 as N } from './index-C2avURFS.js';
import './markdown-it-vendor-DL4wSELR.js';
import { _ as R } from './markdown-vendor-DldLOD9R.js';
import './ui-vendor-C-FKu2uc.js';
const V = (i) => (Array.isArray(i?.MsgQueue) ? i.MsgQueue : []),
  W = (i, e) => {
    switch (i) {
      case 'arabicPeriod':
        return `${e}. `;
      case 'arabicParenR':
        return `${e}) `;
      case 'alphaLcParenR':
        return `${String.fromCharCode(e + 96)}) `;
      case 'alphaLcPeriod':
        return `${String.fromCharCode(e + 96)}. `;
      case 'alphaUcParenR':
        return `${String.fromCharCode(e + 64)}) `;
      case 'alphaUcPeriod':
        return `${String.fromCharCode(e + 64)}. `;
      default:
        return String(e);
    }
  },
  X = (i) => {
    const e = [
      ...Array.from(i.querySelectorAll('.block')),
      ...Array.from(i.querySelectorAll('table td')),
    ];
    for (const t of e) {
      const r = Array.from(t.querySelectorAll('.numeric-bullet-style')),
        n = new Map();
      for (const c of r) {
        const p = String(c.dataset.bulltname || 'arabicPeriod'),
          l = `${String(c.dataset.bulltlvl || '0')}:${p}`,
          u = (n.get(l) || 0) + 1;
        (n.set(l, u), (c.textContent = W(p, u)));
      }
    }
  },
  H = async (i) => {
    var e;
    const t = i.data;
    if (!t?.chartID || !t.chartType || !t.chartData) return;
    const r = await R(
        () => import('./billboard-C3IwVd7Y.js'),
        __vite__mapDeps([0, 1, 2, 3, 4]),
        import.meta.url,
      ),
      n = await R(
        () => import('./markdown-it-vendor-DL4wSELR.js').then((s) => s.aR),
        __vite__mapDeps([1, 2, 3, 4]),
        import.meta.url,
      ),
      c = r.default || r,
      { area: p, bar: a, line: l, pie: u, scatter: v } = r,
      m = { bindto: `#${t.chartID}` },
      h = t.chartData,
      _ = {
        x: {
          tick: {
            format(s) {
              var d, f;
              return (
                ((f = (d = h[0]) === null || d === void 0 ? void 0 : d.xlabels) === null ||
                f === void 0
                  ? void 0
                  : f[s]) || s
              );
            },
          },
        },
      };
    switch (t.chartType) {
      case 'lineChart':
        Object.assign(m, {
          data: { columns: h.map((s) => [s.key, ...s.values.map(({ y: d }) => d)]), type: l() },
          axis: _,
          interaction: { enabled: !0 },
        });
        break;
      case 'barChart':
        Object.assign(m, {
          data: { columns: h.map((s) => [s.key, ...s.values.map(({ y: d }) => d)]), type: a() },
          axis: {
            x: {
              tick: {
                multiline: !0,
                format(s) {
                  var d, f;
                  return (
                    ((f = (d = h[0]) === null || d === void 0 ? void 0 : d.xlabels) === null ||
                    f === void 0
                      ? void 0
                      : f[s]) || s
                  );
                },
              },
            },
          },
        });
        break;
      case 'pieChart':
      case 'pie3DChart':
        Object.assign(m, {
          data: {
            columns: Object.values(
              ((e = h[0]) === null || e === void 0 ? void 0 : e.xlabels) || {},
            ).map((s, d) => {
              var f, w, x;
              return [
                s,
                (x =
                  (w = (f = h[0]) === null || f === void 0 ? void 0 : f.values) === null ||
                  w === void 0
                    ? void 0
                    : w[d]) === null || x === void 0
                  ? void 0
                  : x.y,
              ];
            }),
            type: u(),
          },
        });
        break;
      case 'areaChart':
        Object.assign(m, {
          data: { columns: h.map((s) => [s.key, ...s.values.map(({ y: d }) => d)]), type: p() },
          axis: _,
          interaction: { enabled: !0 },
        });
        break;
      case 'scatterChart':
        Object.assign(m, {
          data: { xs: { y: 'x' }, columns: h.map((s, d) => [d ? 'y' : 'x', ...s]), type: v() },
          axis: {
            x: { label: 'X', showDist: !0, tick: { format: n.format('.02f') } },
            y: { label: 'Y', showDist: !0, tick: { format: n.format('.02f') } },
          },
        });
        break;
      default:
        return;
    }
    m.data && c.generate(m);
  },
  U = async (i, e) => {
    X(e);
    const t = V(i);
    if (t.length)
      try {
        await Promise.all(t.map(H));
      } catch (r) {
        console.warn('PPTX chart rendering skipped:', r);
      }
  },
  F = { maxFileBytes: 160 * 1024 * 1024 },
  q = () => ({
    slidesScale: '',
    slideMode: !1,
    slideType: 'divs2slidesjs',
    revealjsPath: '',
    keyBoardShortCut: !1,
    mediaProcess: !0,
    jsZipV2: !1,
    themeProcess: !0,
    incSlide: { width: 0, height: 0 },
    slideModeConfig: {
      first: 1,
      nav: !0,
      navTxtColor: 'black',
      keyBoardShortCut: !0,
      showSlideNum: !0,
      showTotalSlideNum: !0,
      autoSlide: !0,
      randomAutoSlide: !1,
      loop: !1,
      background: !1,
      transition: 'default',
      transitionTime: 1,
    },
    revealjsConfig: {},
  }),
  Q = (i) => {
    var e, t, r, n, c, p, a, l;
    const u = q();
    return {
      ...u,
      ...i,
      incSlide: {
        width:
          (n =
            (t = (e = i?.incSlide) === null || e === void 0 ? void 0 : e.width) !== null &&
            t !== void 0
              ? t
              : (r = u.incSlide) === null || r === void 0
                ? void 0
                : r.width) !== null && n !== void 0
            ? n
            : 0,
        height:
          (l =
            (p = (c = i?.incSlide) === null || c === void 0 ? void 0 : c.height) !== null &&
            p !== void 0
              ? p
              : (a = u.incSlide) === null || a === void 0
                ? void 0
                : a.height) !== null && l !== void 0
            ? l
            : 0,
      },
      slideModeConfig: { ...u.slideModeConfig, ...i?.slideModeConfig },
      revealjsConfig: { ...u.revealjsConfig, ...i?.revealjsConfig },
    };
  },
  Y = `
.slide{position:relative;border:1px solid #333;border-radius:10px;overflow:hidden;margin-bottom:50px;margin-left:auto;margin-right:auto;z-index:100}
.slide div.block{position:absolute;top:0;left:0;width:100%;line-height:1}
.slide div.content{display:flex;flex-direction:column}
.slide div.diagram-content{display:flex;flex-direction:column}
.slide div.content-rtl{display:flex;flex-direction:column;direction:rtl}
.slide .pregraph-rtl{direction:rtl}
.slide .pregraph-ltr{direction:ltr}
.slide .pregraph-inherit{direction:inherit}
.slide .slide-prgrph{width:100%}
.slide .line-break-br::before{content:"\\A";white-space:pre}
.slide div.v-up{justify-content:flex-start}
.slide div.v-mid{justify-content:center}
.slide div.v-down{justify-content:flex-end}
.slide div.h-left{justify-content:flex-start;align-items:flex-start;text-align:left}
.slide div.h-left-rtl{justify-content:flex-end;align-items:flex-end;text-align:left}
.slide div.h-mid{justify-content:center;align-items:center;text-align:center}
.slide div.h-right{justify-content:flex-end;align-items:flex-end;text-align:right}
.slide div.h-right-rtl{justify-content:flex-start;align-items:flex-start;text-align:right}
.slide div.h-just,.slide div.h-dist{text-align:justify}
.slide div.up-left{justify-content:flex-start;align-items:flex-start;text-align:left}
.slide div.up-center{justify-content:flex-start;align-items:center}
.slide div.up-right{justify-content:flex-start;align-items:flex-end}
.slide div.center-left{justify-content:center;align-items:flex-start;text-align:left}
.slide div.center-center{justify-content:center;align-items:center}
.slide div.center-right{justify-content:center;align-items:flex-end}
.slide div.down-left{justify-content:flex-end;align-items:flex-start;text-align:left}
.slide div.down-center{justify-content:flex-end;align-items:center}
.slide div.down-right{justify-content:flex-end;align-items:flex-end}
.slide li.slide{margin:10px 0;font-size:18px}
.slide table{position:absolute}
.slide svg.drawing{position:absolute;overflow:visible}
`,
  G = `
.flyfish-pptx-scale-box{box-sizing:border-box;max-width:100%;margin:0 auto;min-width:0}
.flyfish-pptx-content{position:relative;box-sizing:border-box;max-width:none;min-width:0;transform-origin:top left;will-change:transform}
.flyfish-pptx-content[data-render-state="loading"]{opacity:.82}
.flyfish-pptx-content .slide{background:#fff;box-shadow:0 18px 36px rgba(18,35,52,.12)}
.flyfish-pptx-thumbnail{display:block;box-sizing:border-box;width:min(960px,100%);height:auto;margin:0 auto 28px;border-radius:12px;background:#fff;box-shadow:0 18px 36px rgba(18,35,52,.14)}
${Y}
`,
  O = 'flyfish-pptx-native-style',
  K = (i) => {
    if (i.getElementById(O)) return;
    const e = i.createElement('style');
    ((e.id = O), (e.textContent = G), (i.head || i.documentElement).appendChild(e));
  },
  J = (i = {}) => {
    var e;
    return i.workerFactory
      ? i.workerFactory()
      : i.workerUrl
        ? new Worker(i.workerUrl, {
            type: (e = i.workerType) !== null && e !== void 0 ? e : 'module',
          })
        : new Worker(
            new URL('' + new URL('pptx.worker-cXuz28DM.js', import.meta.url).href, import.meta.url),
            { type: 'module' },
          );
  },
  z = (i, e, t) => Math.min(t, Math.max(e, i)),
  A = (i) => {
    const e = typeof i == 'number' && Number.isFinite(i) ? i : 100;
    return z(e, 25, 300);
  },
  ee = (i, e) => {
    const t = { ...F, ...e.zipLimits };
    if (t.maxFileBytes && i.byteLength > t.maxFileBytes)
      throw new Error(`PPTX file is too large to preview safely (${i.byteLength} bytes).`);
  },
  te = (i, e) => {
    const t = i.ownerDocument.createElement('template');
    t.innerHTML = e;
    const r = Array.from(t.content.children);
    return (i.append(t.content), r[0] || null);
  };
class M {
  static async open(e, t, r = {}) {
    const n = new M(e, t, r);
    return (await n.open(), n);
  }
  constructor(e, t, r) {
    ((this.worker = null),
      (this.resizeObserver = null),
      (this.resizeFrame = 0),
      (this.fitScale = 1),
      (this.userZoomPercent = 100),
      (this.currentZoomPercent = 100),
      (this.thumbnailElement = null),
      (this.disposed = !1),
      (this.completed = !1),
      (this.buffer = e),
      (this.target = t),
      (this.options = r),
      (this.userZoomPercent = A(r.zoomPercent)),
      (this.currentZoomPercent = this.userZoomPercent));
    const n = t.ownerDocument || document;
    ((this.scaleBox = n.createElement('div')),
      (this.scaleBox.className = 'flyfish-pptx-scale-box'),
      (this.content = n.createElement('div')),
      (this.content.className = 'flyfish-pptx-content'),
      (this.content.dataset.renderState = 'loading'),
      this.scaleBox.append(this.content));
  }
  get zoomPercent() {
    return Math.round(this.currentZoomPercent);
  }
  async open() {
    (ee(this.buffer, this.options),
      K(this.target.ownerDocument || document),
      this.target.replaceChildren(this.scaleBox),
      this.attachResizeObserver(),
      this.startWorker());
  }
  async setZoom(e) {
    const t = A(e);
    ((this.userZoomPercent = z(t / Math.max(this.fitScale, 0.01), 25, 600)), this.scheduleResize());
  }
  destroy() {
    var e, t, r;
    ((this.disposed = !0),
      (e = this.worker) === null || e === void 0 || e.terminate(),
      (this.worker = null),
      (t = this.resizeObserver) === null || t === void 0 || t.disconnect(),
      (this.resizeObserver = null),
      this.resizeFrame &&
        ((r = this.target.ownerDocument.defaultView) === null ||
          r === void 0 ||
          r.cancelAnimationFrame(this.resizeFrame)),
      this.target.replaceChildren());
  }
  startWorker() {
    var e;
    ((e = this.worker) === null || e === void 0 || e.terminate(),
      (this.completed = !1),
      (this.content.dataset.renderState = 'loading'),
      (this.worker = J(this.options)),
      this.worker.addEventListener('message', (t) => this.processMessage(t.data)),
      this.worker.addEventListener('error', (t) => this.fail(t.error || t.message)),
      this.worker.postMessage({
        type: 'processPPTX',
        data: this.buffer,
        IE11: !1,
        options: Q(this.options.engineOptions),
      }));
  }
  processMessage(e) {
    var t, r, n, c, p, a, l, u, v, m;
    if (!(this.disposed || this.completed))
      switch (e.type) {
        case 'slide': {
          this.clearThumbnail();
          const h = te(this.content, String(e.data || ''));
          (this.scheduleResize(),
            (r = (t = this.options).onSlideRendered) === null ||
              r === void 0 ||
              r.call(t, Number(e.slide_num || 0), h));
          break;
        }
        case 'pptx-thumb':
          (this.showThumbnail(String(e.data || '')),
            (c = (n = this.options).onThumbnail) === null ||
              c === void 0 ||
              c.call(n, String(e.data || '')));
          break;
        case 'slideSize':
          (a = (p = this.options).onSlideSize) === null || a === void 0 || a.call(p, e.data || {});
          break;
        case 'globalCSS':
          this.appendGlobalCss(String(e.data || ''));
          break;
        case 'progress-update':
          (u = (l = this.options).onProgress) === null ||
            u === void 0 ||
            u.call(l, Number(e.data || 0), e);
          break;
        case 'ExecutionTime':
        case 'Done':
          this.complete(e.charts);
          break;
        case 'WARN':
          (m = (v = this.options).onWarning) === null || m === void 0 || m.call(v, e.data);
          break;
        case 'ERROR':
          this.fail(e.data);
          break;
      }
  }
  appendGlobalCss(e) {
    if (!e) return;
    const t = this.target.ownerDocument.createElement('style');
    ((t.textContent = e), this.content.append(t));
  }
  showThumbnail(e) {
    if (!e || this.content.children.length > 0) return;
    const t = this.target.ownerDocument.createElement('img');
    ((t.className = 'flyfish-pptx-thumbnail'),
      (t.alt = 'PPTX preview thumbnail'),
      (t.src = `data:image/jpeg;base64,${e}`),
      (this.thumbnailElement = t),
      this.scaleBox.insertBefore(t, this.content));
  }
  clearThumbnail() {
    var e;
    ((e = this.thumbnailElement) === null || e === void 0 || e.remove(),
      (this.thumbnailElement = null));
  }
  async complete(e) {
    var t, r, n;
    this.disposed ||
      this.completed ||
      ((this.completed = !0),
      (this.content.dataset.renderState = 'ready'),
      (t = this.worker) === null || t === void 0 || t.terminate(),
      (this.worker = null),
      this.scheduleResize(),
      await U(e, this.content),
      this.scheduleResize(),
      (n = (r = this.options).onRenderComplete) === null || n === void 0 || n.call(r));
  }
  fail(e) {
    var t, r, n;
    this.disposed ||
      ((this.completed = !0),
      (t = this.worker) === null || t === void 0 || t.terminate(),
      (this.worker = null),
      (this.content.dataset.renderState = 'error'),
      (n = (r = this.options).onError) === null || n === void 0 || n.call(r, e));
  }
  attachResizeObserver() {
    typeof ResizeObserver > 'u' ||
      ((this.resizeObserver = new ResizeObserver(() => this.scheduleResize())),
      this.resizeObserver.observe(this.target),
      this.target.parentElement && this.resizeObserver.observe(this.target.parentElement));
  }
  scheduleResize() {
    const e = this.target.ownerDocument.defaultView || window;
    (this.resizeFrame && e.cancelAnimationFrame(this.resizeFrame),
      (this.resizeFrame = e.requestAnimationFrame(() => this.resize())));
  }
  resize() {
    var e, t;
    const r =
        ((e = this.target.ownerDocument.defaultView) === null || e === void 0
          ? void 0
          : e.HTMLElement) || HTMLElement,
      n = Array.from(this.content.children).filter(
        (l) => l instanceof r && (l.classList.contains('slide') || l.tagName === 'SECTION'),
      );
    if (!n.length) return;
    const c = Math.max(...n.map((l) => l.offsetWidth), 0);
    if (!c) return;
    const p =
      this.target.clientWidth ||
      ((t = this.target.parentElement) === null || t === void 0 ? void 0 : t.clientWidth) ||
      c;
    this.fitScale = this.options.fitMode === 'none' ? 1 : Math.min(1, p / c);
    const a = z(this.fitScale * (this.userZoomPercent / 100), 0.25, 3);
    ((this.currentZoomPercent = a * 100),
      (this.content.style.width = `${c}px`),
      (this.content.style.transform = `scale(${a})`),
      (this.scaleBox.style.width = `${Math.ceil(c * a)}px`),
      (this.scaleBox.style.minHeight = `${Math.ceil(this.content.scrollHeight * a)}px`));
  }
}
const ie = `
.pptx-viewer-shell{position:relative;box-sizing:border-box;min-height:100%;padding:24px 20px;background:#eef3f8;color:#1f2d3b;font-family:Aptos,'Segoe UI','PingFang SC','Microsoft YaHei',sans-serif}
.pptx-render-surface{min-height:240px}
.pptx-render-surface.is-loading{opacity:.72}
.pptx-loading{position:sticky;top:12px;z-index:3;box-sizing:border-box;display:inline-flex;align-items:center;gap:10px;margin:0 0 16px 50%;padding:10px 14px;border:1px solid rgba(42,94,144,.14);border-radius:999px;background:rgba(255,255,255,.92);color:#41556b;box-shadow:0 12px 32px rgba(24,44,64,.12);transform:translateX(-50%)}
.pptx-loading[hidden],.pptx-error[hidden]{display:none!important}
.pptx-loading-dot{width:9px;height:9px;border-radius:999px;background:#1f9d67;box-shadow:0 0 0 6px rgba(31,157,103,.13)}
.pptx-error{box-sizing:border-box;width:min(680px,calc(100% - 32px));margin:48px auto;padding:24px;border:1px solid rgba(28,43,58,.12);border-radius:14px;background:#fff;color:#1f2d3b;box-shadow:0 16px 42px rgba(25,42,54,.08)}
.pptx-error strong{display:block;margin-bottom:10px;font-size:18px}
.pptx-error p{margin:0;color:#607282;line-height:1.7}
`,
  re = `
  .pptx-viewer-shell {
    background: #fff !important;
    padding: 0 !important;
  }
  .pptx-render-surface {
    display: block !important;
    overflow: visible !important;
  }
  .pptx-render-surface [data-slide-index] {
    break-after: page;
    page-break-after: always;
    margin: 0 auto !important;
  }
  .pptx-render-surface [data-slide-index]:last-child {
    break-after: auto;
    page-break-after: auto;
  }
`,
  ne = (i) => {
    const e = i.createElement('style');
    return ((e.textContent = ie), e);
  },
  g = (i, e, t, r) => {
    const n = i.createElement(e);
    return (t && (n.className = t), r !== void 0 && (n.textContent = r), n);
  },
  D = (i) => Math.min(300, Math.max(25, Math.round(i))),
  Z = (i) => (i instanceof Error ? i.message : String(i || 'PPTX 解析失败')),
  oe = (i) => ({
    print: !0,
    exportHtml: !0,
    includeDocumentStyles: !0,
    beforeSnapshot: () => N(i || void 0),
    printStyle: re,
  });
async function pe(i, e, t, r) {
  const n = e.ownerDocument || document,
    c = n.defaultView || (typeof window < 'u' ? window : null),
    p = I();
  let a = null,
    l = 'loading',
    u = '',
    v = 100,
    m = !1,
    h = !1;
  const _ = ne(n),
    s = g(n, 'div', 'pptx-viewer-shell');
  s.dataset.viewerZoomProvider = 'pptx';
  const d = g(n, 'div', 'pptx-loading');
  (d.setAttribute('aria-live', 'polite'),
    d.append(g(n, 'span', 'pptx-loading-dot'), g(n, 'span', void 0, '正在解析 PPTX...')));
  const f = g(n, 'div', 'pptx-error'),
    w = g(n, 'strong', void 0, 'PPTX 预览失败'),
    x = g(n, 'p');
  f.append(w, x);
  const C = g(n, 'div', 'pptx-render-surface');
  (s.append(d, f, C), e.replaceChildren(_, s));
  const y = () => {
      var o;
      return D((o = a?.zoomPercent) !== null && o !== void 0 ? o : v);
    },
    j = () => {
      const o = y();
      return {
        scale: o / 100,
        label: `${o}%`,
        canZoomIn: o < 300,
        canZoomOut: o > 25,
        canReset: o !== 100,
        minScale: 0.25,
        maxScale: 3,
      };
    },
    S = async (o) => {
      const b = D(o);
      return ((v = b), a && (await a.setZoom(b), (v = y())), p.emit(), j());
    },
    E = () => {
      var o;
      m || ((m = !0), (o = r?.onProgressiveRender) === null || o === void 0 || o.call(r));
    },
    P = () => {
      ((d.hidden = !(l === 'loading' && !u)),
        (f.hidden = l !== 'error'),
        (x.textContent = u),
        C.classList.toggle('is-loading', l === 'loading'));
    },
    L = () => {
      var o;
      (o = r?.registerExportAdapter) === null || o === void 0 || o.call(r, oe(c));
    };
  return (
    $(s, {
      zoomIn: () => S(y() + 15),
      zoomOut: () => S(y() - 15),
      resetZoom: () => S(100),
      setZoom: (o) => S(o * 100),
      getState: j,
      subscribe: p.subscribe,
    }),
    (async () => {
      var o;
      ((l = 'loading'), (u = ''), (m = !1), P());
      try {
        const b = await M.open(i, C, {
          fitMode: 'contain',
          zoomPercent: v,
          zipLimits: F,
          lazySlides: !0,
          lazyMedia: !0,
          listOptions: { windowed: !0, initialSlides: 3, batchSize: 4, overscanViewport: 1.5 },
          onSlideRendered: () => E(),
          onRenderComplete: () => {
            h || ((l = 'ready'), E(), (v = y()), P(), p.emit());
          },
          onSlideError: (T, k) => {
            console.warn('PPTX slide render warning:', k);
          },
          onError: (T) => {
            var k;
            h ||
              ((l = 'error'),
              (u = Z(T)),
              (k = r?.registerExportAdapter) === null || k === void 0 || k.call(r, null),
              P());
          },
        });
        if (h) {
          b.destroy();
          return;
        }
        ((a = b), (l = 'ready'), E(), (v = y()), L(), P(), p.emit());
      } catch (b) {
        if (h) return;
        ((l = 'error'),
          (u = Z(b)),
          (o = r?.registerExportAdapter) === null || o === void 0 || o.call(r, null),
          P());
      }
    })(),
    {
      $el: s,
      unmount() {
        var o;
        ((h = !0),
          (o = r?.registerExportAdapter) === null || o === void 0 || o.call(r, null),
          B(s),
          a?.destroy(),
          (a = null),
          e.replaceChildren());
      },
    }
  );
}
export { pe as default };
