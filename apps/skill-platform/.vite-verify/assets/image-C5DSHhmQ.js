const __vite__mapDeps = (
  i,
  m = __vite__mapDeps,
  d = m.f ||
    (m.f = [
      './heic2any-DYsTdBqC.js',
      './ui-vendor-C-FKu2uc.js',
      './markdown-vendor-DldLOD9R.js',
      './markdown-it-vendor-DL4wSELR.js',
      './markdown-vendor-CmuYMs8x.css',
    ]),
) => i.map((i) => d[i]);
import './icons-B5Lu0sqU.js';
import { b5 as E, ad as k, aQ as y } from './index-C2avURFS.js';
import './markdown-it-vendor-DL4wSELR.js';
import { _ as w } from './markdown-vendor-DldLOD9R.js';
import './ui-vendor-C-FKu2uc.js';
const z = {
    avif: 'image/avif',
    bmp: 'image/bmp',
    gif: 'image/gif',
    heic: 'image/heic',
    heif: 'image/heif',
    ico: 'image/x-icon',
    jxl: 'image/jxl',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    svg: 'image/svg+xml',
    tif: 'image/tiff',
    tiff: 'image/tiff',
    webp: 'image/webp',
  },
  L = `
.image-viewer{position:relative;width:100%;height:100%;overflow:auto;background:#eef1f4;box-sizing:border-box}
.image-stage{min-width:100%;min-height:100%;display:flex;align-items:center;justify-content:center;padding:24px;box-sizing:border-box}
.image-stage img{display:block;width:auto;max-width:none;margin:0 auto;border:0;box-shadow:0 18px 48px rgba(15,23,42,.16);background:#fff;cursor:zoom-in}
.image-lightbox{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:40px;background:rgba(15,23,42,.88);box-sizing:border-box}
.image-lightbox[hidden]{display:none}
.image-lightbox img{display:block;max-width:100%;max-height:100%;object-fit:contain;background:#fff;box-shadow:0 30px 80px rgba(0,0,0,.4);cursor:zoom-out}
.image-lightbox button{position:absolute;top:20px;right:20px;width:40px;height:40px;border:0;border-radius:999px;background:rgba(255,255,255,.92);color:#172033;font-size:24px;line-height:40px;cursor:pointer;box-shadow:0 12px 28px rgba(0,0,0,.18)}
.file-viewer[data-viewer-theme='dark'] .image-viewer{background:#101820}
@media (prefers-color-scheme:dark){.file-viewer[data-viewer-theme='system'] .image-viewer{background:#101820}}
@media (max-width:767px){.image-stage{padding:12px}.image-lightbox{padding:16px}.image-lightbox button{top:12px;right:12px}}
`,
  Z = () => {
    const t = document.createElement('style');
    return ((t.textContent = L), t);
  },
  x = (t) => {
    const e = (t || '').trim().toLowerCase();
    return z[e] || 'image/*';
  },
  f = async (t) =>
    await new Promise((e, i) => {
      const a = new FileReader();
      ((a.onload = (o) => {
        var r;
        const n = (r = o.target) === null || r === void 0 ? void 0 : r.result;
        if (typeof n == 'string') {
          e(n);
          return;
        }
        i(new Error('Unable to read image data URL.'));
      }),
        (a.onerror = () => i(a.error || new Error('Unable to read image data URL.'))),
        a.readAsDataURL(t));
    }),
  _ = async (t, e) => {
    const { default: i } = await w(
        async () => {
          const { default: r } = await import('./heic2any-DYsTdBqC.js').then((n) => n.h);
          return { default: r };
        },
        __vite__mapDeps([0, 1, 2, 3, 4]),
        import.meta.url,
      ),
      a = await i({ blob: new Blob([t], { type: x(e) }), toType: 'image/png' }),
      o = Array.isArray(a) ? a[0] : a;
    return f(o);
  },
  j = async (t, e) => {
    const i = (e || '').trim().toLowerCase();
    return i === 'heic' || i === 'heif' ? _(t, i) : f(new Blob([t], { type: x(i) }));
  },
  C = (t) => Math.min(5, Math.max(0.1, Number(t.toFixed(2)))),
  h = (t, e, i) => {
    if (e > 0) {
      t.style.height = `${Math.max(1, Math.round(e * i))}px`;
      return;
    }
    t.style.height = `${i * 100}%`;
  },
  A = (t) => {
    const e = document.createElement('div');
    ((e.className = 'image-lightbox'),
      (e.hidden = !0),
      e.setAttribute('role', 'dialog'),
      e.setAttribute('aria-modal', 'true'));
    const i = document.createElement('img');
    ((i.alt = 'Preview image'), (i.src = t));
    const a = document.createElement('button');
    ((a.type = 'button'),
      a.setAttribute('aria-label', 'Close image preview'),
      (a.textContent = 'x'));
    const o = () => {
      e.hidden = !0;
    };
    return (
      a.addEventListener('click', o),
      i.addEventListener('click', o),
      e.addEventListener('click', (r) => {
        r.target === e && o();
      }),
      e.append(i, a),
      {
        element: e,
        open() {
          e.hidden = !1;
        },
        destroy() {
          (a.removeEventListener('click', o), i.removeEventListener('click', o), e.remove());
        },
      }
    );
  };
async function U(t, e, i) {
  const a = await j(t, i);
  let o = 1,
    r = 0;
  const n = k(),
    s = document.createElement('div');
  ((s.className = 'image-viewer'), (s.dataset.viewerZoomProvider = 'image'));
  const d = document.createElement('div');
  d.className = 'image-stage';
  const m = document.createElement('img');
  ((m.alt = '图片'), (m.src = a), d.append(m), s.append(d));
  const g = A(a),
    l = () => g.open();
  (m.addEventListener('click', l), document.body.append(g.element));
  const p = () => {
      ((r = s.clientHeight || 0), h(m, r, o), n.emit());
    },
    b = new ResizeObserver(p);
  b.observe(s);
  const u = () => ({
      scale: o,
      label: `${Math.round(o * 100)}%`,
      canZoomIn: o < 5,
      canZoomOut: o > 0.1,
      canReset: o !== 1,
      minScale: 0.1,
      maxScale: 5,
    }),
    c = (v) => ((o = C(v)), h(m, r, o), n.emit(), u());
  return (
    y(s, {
      zoomIn: () => c(o + 0.15),
      zoomOut: () => c(o - 0.15),
      resetZoom: () => c(1),
      setZoom: c,
      getState: u,
      subscribe: n.subscribe,
    }),
    e.replaceChildren(Z(), s),
    p(),
    {
      $el: e,
      unmount() {
        (E(s), b.disconnect(), m.removeEventListener('click', l), g.destroy(), e.replaceChildren());
      },
    }
  );
}
export { U as default };
