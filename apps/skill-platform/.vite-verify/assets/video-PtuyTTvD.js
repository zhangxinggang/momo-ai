import './markdown-it-vendor-DL4wSELR.js';
import { _ as b } from './markdown-vendor-DldLOD9R.js';
import './ui-vendor-C-FKu2uc.js';
const h = `
.fv-video-viewer{width:100%;min-height:100%;display:flex;align-items:center;justify-content:center;padding:28px;background:#eef1f4;box-sizing:border-box}
.fv-video-shell{width:min(100%,960px);border-radius:8px;border:1px solid rgba(15,23,42,.1);background:#fff;box-shadow:0 18px 48px rgba(15,23,42,.14);overflow:hidden}
.fv-video-heading{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:14px 18px;border-bottom:1px solid rgba(15,23,42,.08)}
.fv-video-heading span{color:#0f766e;font-size:12px;font-weight:800}
.fv-video-heading strong{color:#132235;font-size:16px}
.fv-video-player{display:block;width:100%;aspect-ratio:16/9;background:#05070a}
.fv-video-hint{margin:0;padding:12px 18px 16px;color:#64748b;font-size:13px;line-height:1.7}
`,
  y = { m3u8: 'application/vnd.apple.mpegurl', mp4: 'video/mp4', webm: 'video/webm' },
  i = (e, o, l) => {
    const n = document.createElement(e);
    return (o && (n.className = o), typeof l == 'string' && (n.textContent = l), n);
  },
  x = () => {
    const e = document.createElement('style');
    return ((e.textContent = h), e);
  },
  w = (e, o) => ({
    $el: e,
    unmount() {
      (o(), e.replaceChildren());
    },
  }),
  L = (e) => y[e] || 'video/*',
  _ = (e, o) => URL.createObjectURL(new Blob([e], { type: L(o) }));
async function k(e, o, l, n) {
  const d = (l || 'mp4').toLowerCase();
  let c = !1,
    a = '',
    r = null;
  const u = i('div', 'fv-video-viewer'),
    s = i('section', 'fv-video-shell'),
    v = i('div', 'fv-video-heading');
  v.append(i('span', '', d.toUpperCase() || 'VIDEO'), i('strong', '', '视频预览'));
  const t = i('video', 'fv-video-player');
  ((t.controls = !0),
    (t.preload = 'metadata'),
    (t.textContent = '当前浏览器不支持该视频格式。'),
    s.append(v, t),
    d === 'm3u8' &&
      s.append(
        i(
          'p',
          'fv-video-hint',
          'HLS 会优先使用原始 URL 加载分片；如果传入的是本地单文件清单，请确保分片地址可被浏览器访问。',
        ),
      ),
    u.append(s),
    o.replaceChildren(x(), u));
  const m = () => (d === 'm3u8' && n?.url ? n.url : ((a = _(e, d)), a));
  return (
    (async () => {
      const p = m();
      if (d === 'm3u8') {
        if (t.canPlayType('application/vnd.apple.mpegurl')) {
          t.src = p;
          return;
        }
        const { default: f } = await b(
          async () => {
            const { default: g } = await import('./hls-D1fSjlvU.js');
            return { default: g };
          },
          [],
          import.meta.url,
        );
        if (c) return;
        if (f.isSupported()) {
          ((r = new f({ enableWorker: !0, lowLatencyMode: !1 })),
            r.loadSource(p),
            r.attachMedia(t));
          return;
        }
      }
      t.src = p;
    })(),
    w(o, () => {
      ((c = !0),
        r?.destroy(),
        (r = null),
        t.pause(),
        t.removeAttribute('src'),
        t.load(),
        a && (URL.revokeObjectURL(a), (a = '')));
    })
  );
}
export { k as default };
