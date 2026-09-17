const __vite__mapDeps = (
  i,
  m = __vite__mapDeps,
  d = m.f ||
    (m.f = [
      './RTFJS.bundle-W4S5iWt8.js',
      './ui-vendor-C-FKu2uc.js',
      './markdown-vendor-DldLOD9R.js',
      './markdown-it-vendor-DL4wSELR.js',
      './markdown-vendor-CmuYMs8x.css',
    ]),
) => i.map((i) => d[i]);
import { e as g } from './jszip.min-DnpxAPiE.js';
import './markdown-it-vendor-DL4wSELR.js';
import { _ as x } from './markdown-vendor-DldLOD9R.js';
import './ui-vendor-C-FKu2uc.js';
const w = `
.odf-viewer{min-height:100%;padding:28px;overflow:auto;background:#dfe5eb;box-sizing:border-box}
.odf-shell{width:min(100%,980px);margin:0 auto}.odf-shell>header{margin-bottom:18px;padding:18px 22px;border-radius:8px;background:#fff;box-shadow:0 10px 26px rgba(15,23,42,.1);box-sizing:border-box}
.odf-shell>header span{color:#0f766e;font-size:12px;font-weight:800}.odf-shell>header h2{margin:6px 0 0;color:#132235;font-size:24px}
.odf-page{min-height:360px;margin:0 auto 18px;padding:42px 48px;border-radius:4px;background:#fff;box-shadow:0 16px 38px rgba(15,23,42,.12);color:#1f2937;box-sizing:border-box}
.odf-page h3{margin:0 0 20px;color:#334155;font-size:18px}.odf-page p{margin:0 0 12px;font-size:15px;line-height:1.85;white-space:pre-wrap}
.flyfish-rtf-viewer{min-height:100%;padding:28px;overflow:auto;background:#dfe5eb;color:#1f2937;box-sizing:border-box}
.flyfish-rtf-header{width:min(100%,900px);margin:0 auto 18px;padding:18px 22px;border-radius:8px;background:#fff;box-shadow:0 10px 26px rgba(15,23,42,.1);box-sizing:border-box}
.flyfish-rtf-header span{display:block;color:#0f766e;font-size:12px;font-weight:800}.flyfish-rtf-header strong{display:block;margin-top:6px;color:#132235;font-size:24px}
.flyfish-rtf-paper{width:min(100%,900px);min-height:980px;margin:0 auto;padding:54px 62px;background:#fff;box-shadow:0 16px 38px rgba(15,23,42,.12);line-height:1.75;box-sizing:border-box}.flyfish-rtf-paper p{margin:0 0 12px}
.file-viewer[data-viewer-theme='dark'] .odf-viewer,.file-viewer[data-viewer-theme='dark'] .flyfish-rtf-viewer{background:#111827}.file-viewer[data-viewer-theme='dark'] .odf-shell>header,.file-viewer[data-viewer-theme='dark'] .odf-page,.file-viewer[data-viewer-theme='dark'] .flyfish-rtf-header,.file-viewer[data-viewer-theme='dark'] .flyfish-rtf-paper{background:#f8fafc;color:#1f2937}
@media (prefers-color-scheme:dark){.file-viewer[data-viewer-theme='system'] .odf-viewer,.file-viewer[data-viewer-theme='system'] .flyfish-rtf-viewer{background:#111827}.file-viewer[data-viewer-theme='system'] .odf-shell>header,.file-viewer[data-viewer-theme='system'] .odf-page,.file-viewer[data-viewer-theme='system'] .flyfish-rtf-header,.file-viewer[data-viewer-theme='system'] .flyfish-rtf-paper{background:#f8fafc;color:#1f2937}}
@media (max-width:720px){.odf-viewer,.flyfish-rtf-viewer{padding:14px}.odf-page{padding:28px 24px}.flyfish-rtf-paper{padding:36px 28px}}
`,
  h = () => {
    const e = document.createElement('style');
    return ((e.textContent = w), e);
  },
  f = (e, t, n, a) => {
    const r = document.createElement(t);
    return ((r.textContent = n), e.appendChild(r), r);
  },
  m = (e) => (e.textContent || '').replace(/\s+/g, ' ').trim(),
  u = async (e, t) => {
    var n;
    const r = await ((n = (await g.loadAsync(e)).file('content.xml')) === null || n === void 0
      ? void 0
      : n.async('text'));
    if (!r) throw new Error('ODF 文件缺少 content.xml');
    const o = new DOMParser().parseFromString(r, 'application/xml'),
      d = o.querySelector('parsererror');
    if (d) throw new Error(d.textContent || 'ODF XML 解析失败');
    if (t === 'odp')
      return Array.from(o.getElementsByTagName('draw:page')).map((s, p) => {
        const c = Array.from(s.getElementsByTagName('text:p')).map(m).filter(Boolean);
        return { title: `第 ${p + 1} 页`, blocks: c.length ? c : ['该页没有可提取文本'] };
      });
    const i = [
      ...Array.from(o.getElementsByTagName('text:h')).map(m),
      ...Array.from(o.getElementsByTagName('text:p')).map(m),
    ].filter(Boolean);
    return [{ title: '正文', blocks: i.length ? i : ['没有提取到可读文本'] }];
  },
  b = (e, t, n) => {
    const a = document.createElement('div');
    a.className = 'odf-viewer';
    const r = document.createElement('section');
    r.className = 'odf-shell';
    const o = document.createElement('header');
    return (
      f(o, 'span', e.toUpperCase()),
      f(o, 'h2', t),
      r.appendChild(o),
      n.forEach((d) => {
        const i = document.createElement('article');
        ((i.className = 'odf-page'),
          f(i, 'h3', d.title),
          d.blocks.forEach((l) => f(i, 'p', l)),
          r.appendChild(i));
      }),
      a.appendChild(r),
      a
    );
  },
  v = async () => {
    const e = await x(
      () => import('./RTFJS.bundle-W4S5iWt8.js').then((t) => t.R),
      __vite__mapDeps([0, 1, 2, 3, 4]),
      import.meta.url,
    );
    return e.RTFJS || e.default || e;
  },
  y = async (e, t) => {
    var n, a;
    const r = await v();
    (n = r.loggingEnabled) === null || n === void 0 || n.call(r, !1);
    const o = new r.Document(e, {}),
      d = ((a = o.metadata) === null || a === void 0 ? void 0 : a.call(o)) || {},
      i = await o.render(),
      l = document.createElement('div');
    l.className = 'flyfish-rtf-viewer';
    const s = document.createElement('div');
    ((s.className = 'flyfish-rtf-header'),
      f(s, 'span', 'RTF'),
      f(s, 'strong', d.title || 'RTF 文档预览'));
    const p = document.createElement('article');
    return (
      (p.className = 'flyfish-rtf-paper'),
      i.forEach((c) => p.appendChild(c)),
      l.append(s, p),
      t.replaceChildren(h(), l),
      {
        $el: t,
        unmount() {
          t.replaceChildren();
        },
      }
    );
  };
async function T(e, t, n) {
  const a = (n || 'odt').toLowerCase();
  if (a === 'rtf') return y(e, t);
  const r = await u(e, a),
    o = a === 'odp' ? 'OpenDocument 演示文稿预览' : 'OpenDocument 文档预览';
  return (
    t.replaceChildren(h(), b(a, o, r)),
    {
      $el: t,
      unmount() {
        t.replaceChildren();
      },
    }
  );
}
export { T as default };
