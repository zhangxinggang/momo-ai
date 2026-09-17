const __vite__mapDeps = (
  i,
  m = __vite__mapDeps,
  d = m.f ||
    (m.f = [
      './Midi-Cx1Tte1f.js',
      './ui-vendor-C-FKu2uc.js',
      './markdown-vendor-DldLOD9R.js',
      './markdown-it-vendor-DL4wSELR.js',
      './markdown-vendor-CmuYMs8x.css',
    ]),
) => i.map((i) => d[i]);
import './markdown-it-vendor-DL4wSELR.js';
import { _ as E } from './markdown-vendor-DldLOD9R.js';
import './ui-vendor-C-FKu2uc.js';
const M = {
    aac: 'audio/aac',
    flac: 'audio/flac',
    m4a: 'audio/mp4',
    mp3: 'audio/mpeg',
    mpeg: 'audio/mpeg',
    oga: 'audio/ogg',
    ogg: 'audio/ogg',
    opus: 'audio/ogg; codecs=opus',
    wav: 'audio/wav',
    weba: 'audio/webm',
  },
  I = `
.fv-audio-viewer{width:100%;min-height:100%;display:flex;align-items:center;justify-content:center;padding:28px;background:linear-gradient(135deg,rgba(14,116,144,.1),transparent 34%),linear-gradient(180deg,#f5f8fb 0%,#edf2f7 100%);box-sizing:border-box}
.fv-audio-card{width:min(100%,640px);display:grid;grid-template-columns:86px minmax(0,1fr);gap:18px;align-items:center;padding:24px;border-radius:8px;border:1px solid rgba(15,23,42,.08);background:rgba(255,255,255,.92);box-shadow:0 20px 52px rgba(15,23,42,.13);box-sizing:border-box}
.fv-audio-art{position:relative;width:86px;height:86px;border-radius:8px;background:linear-gradient(135deg,#0f766e,#2dd4bf);box-shadow:inset 0 0 0 1px rgba(255,255,255,.24)}
.fv-audio-art span{position:absolute;inset:18px;border-radius:999px;border:8px solid rgba(255,255,255,.88)}
.fv-audio-art i{position:absolute;right:18px;bottom:20px;width:18px;height:36px;border-radius:10px 10px 4px 4px;background:rgba(255,255,255,.9)}
.fv-audio-copy{min-width:0}
.fv-audio-kicker{color:#0f766e;font-size:12px;font-weight:800;letter-spacing:0}
.fv-audio-copy strong{display:block;margin-top:5px;color:#132235;font-size:23px;line-height:1.15}
.fv-audio-copy p{margin:8px 0 0;color:#64748b;font-size:13px;line-height:1.7}
.fv-audio-meter{grid-column:1/-1;display:grid;grid-template-columns:48px minmax(0,1fr) 48px;align-items:center;gap:10px;color:#64748b;font-size:12px;font-variant-numeric:tabular-nums}
.fv-audio-progress{height:6px;overflow:hidden;border-radius:999px;background:rgba(15,118,110,.12)}
.fv-audio-progress i{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,#0f766e,#2dd4bf);transition:width .18s ease}
.fv-audio-control{grid-column:1/-1;width:100%;height:42px}
.fv-midi-viewer{min-height:100%;padding:28px;background:#eef1f4;box-sizing:border-box}
.fv-midi-card{max-width:960px;margin:0 auto;border-radius:8px;border:1px solid rgba(15,23,42,.08);background:#fff;box-shadow:0 18px 48px rgba(15,23,42,.12);overflow:hidden}
.fv-midi-card header{padding:18px 22px;border-bottom:1px solid rgba(15,23,42,.08)}
.fv-midi-card header span{display:block;color:#0f766e;font-size:12px;font-weight:800}
.fv-midi-card header strong{display:block;margin-top:6px;color:#132235;font-size:22px}
.fv-midi-state{padding:28px 22px;color:#64748b}
.fv-midi-error{color:#b42318}
.fv-midi-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:1px;background:rgba(15,23,42,.08)}
.fv-midi-stats div{padding:16px;background:#f8fafc}
.fv-midi-stats span{display:block;color:#64748b;font-size:12px}
.fv-midi-stats strong{display:block;margin-top:4px;color:#132235;font-size:20px}
.fv-midi-table-wrap{overflow:auto}
.fv-midi-table{width:100%;border-collapse:collapse;color:#132235;font-size:14px}
.fv-midi-table th,.fv-midi-table td{padding:12px 16px;border-top:1px solid rgba(15,23,42,.08);text-align:left}
.fv-midi-table th{color:#64748b;background:#f8fafc;font-weight:700}
@media (max-width:700px){.fv-midi-stats{grid-template-columns:repeat(2,minmax(0,1fr))}}
`,
  e = (o, i, s) => {
    const n = document.createElement(o);
    return (i && (n.className = i), typeof s == 'string' && (n.textContent = s), n);
  },
  w = (o) => {
    if (!Number.isFinite(o) || o <= 0) return '00:00';
    const i = Math.floor(o / 60),
      s = Math.round(o % 60);
    return `${String(i).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  },
  y = () => {
    const o = document.createElement('style');
    return ((o.textContent = I), o);
  },
  z = (o) => {
    o.replaceChildren();
  },
  k = (o, i) => ({
    $el: o,
    unmount() {
      (i(), z(o));
    },
  }),
  T = (o, i, s) => {
    const n = s.trim().toLowerCase() || 'mp3',
      g = M[n] || 'audio/*',
      u = URL.createObjectURL(new Blob([o], { type: g })),
      f = e('div', 'fv-audio-viewer'),
      l = e('section', 'fv-audio-card'),
      b = e('div', 'fv-audio-art');
    b.append(e('span'), e('i'));
    const x = e('div', 'fv-audio-copy');
    x.append(
      e('span', 'fv-audio-kicker', n.toUpperCase() || 'AUDIO'),
      e('strong', '', '音频预览'),
      e('p', '', '使用浏览器原生播放器打开，兼容性取决于当前浏览器支持的音频编码。'),
    );
    const v = e('span', '', '00:00'),
      a = e('span', '', '--:--'),
      p = e('i'),
      r = e('div', 'fv-audio-progress');
    (r.setAttribute('aria-hidden', 'true'), r.append(p));
    const d = e('div', 'fv-audio-meter');
    d.append(v, r, a);
    const t = e('audio', 'fv-audio-control');
    ((t.src = u),
      (t.controls = !0),
      (t.preload = 'metadata'),
      (t.textContent = '当前浏览器不支持音频播放。'));
    const c = () => {
        a.textContent = Number.isFinite(t.duration) && t.duration > 0 ? w(t.duration) : '--:--';
      },
      m = () => {
        v.textContent = w(t.currentTime);
        const h =
          Number.isFinite(t.duration) && t.duration > 0
            ? Math.min(100, Math.max(0, (t.currentTime / t.duration) * 100))
            : 0;
        p.style.width = `${h}%`;
      };
    return (
      t.addEventListener('loadedmetadata', c),
      t.addEventListener('timeupdate', m),
      l.append(b, x, d, t),
      f.append(l),
      i.replaceChildren(y(), f),
      k(i, () => {
        (t.pause(),
          t.removeEventListener('loadedmetadata', c),
          t.removeEventListener('timeupdate', m),
          URL.revokeObjectURL(u));
      })
    );
  },
  C = (o, i) => {
    let s = !1;
    const n = e('div', 'fv-midi-viewer'),
      g = e('section', 'fv-midi-card'),
      u = document.createElement('header'),
      f = e('strong', '', 'MIDI 文件');
    u.append(e('span', '', 'MIDI'), f);
    const l = e('div', 'fv-midi-state', '正在解析 MIDI 轨道...');
    (g.append(u, l), n.append(g), i.replaceChildren(y(), n));
    const b = (a) => {
        ((l.className = 'fv-midi-state fv-midi-error'), (l.textContent = a));
      },
      x = (a) => {
        const p = e('div', 'fv-midi-table-wrap'),
          r = e('table', 'fv-midi-table'),
          d = document.createElement('thead'),
          t = document.createElement('tr');
        for (const m of ['轨道', '乐器', '通道', '音符数', '时长']) t.append(e('th', '', m));
        d.append(t);
        const c = document.createElement('tbody');
        for (const m of a) {
          const h = document.createElement('tr');
          (h.append(
            e('td', '', m.name),
            e('td', '', m.instrument),
            e('td', '', String(m.channel + 1)),
            e('td', '', String(m.notes)),
            e('td', '', w(m.duration)),
          ),
            c.append(h));
        }
        return (r.append(d, c), p.append(r), p);
      },
      v = (a) => {
        f.textContent = a.name;
        const p = a.tracks.reduce((d, t) => d + t.notes, 0),
          r = e('div', 'fv-midi-stats');
        for (const [d, t] of [
          ['时长', w(a.duration)],
          ['PPQ', String(a.ppq)],
          ['轨道', String(a.tracks.length)],
          ['音符', String(p)],
        ]) {
          const c = document.createElement('div');
          (c.append(e('span', '', d), e('strong', '', t)), r.append(c));
        }
        l.replaceWith(r, x(a.tracks));
      };
    return (
      (async () => {
        try {
          const { Midi: a } = await E(
              async () => {
                const { Midi: r } = await import('./Midi-Cx1Tte1f.js').then((d) => d.M);
                return { Midi: r };
              },
              __vite__mapDeps([0, 1, 2, 3, 4]),
              import.meta.url,
            ),
            p = new a(o);
          if (s) return;
          v({
            name: p.name || 'MIDI 文件',
            duration: p.duration,
            ppq: p.header.ppq,
            tracks: p.tracks.map((r, d) => {
              var t, c;
              return {
                name: r.name || `Track ${d + 1}`,
                instrument:
                  ((t = r.instrument) === null || t === void 0 ? void 0 : t.name) ||
                  ((c = r.instrument) === null || c === void 0 ? void 0 : c.family) ||
                  'Unknown',
                channel: r.channel,
                notes: r.notes.length,
                duration: r.duration,
              };
            }),
          });
        } catch (a) {
          s || b(a instanceof Error ? a.message : 'MIDI 解析失败');
        }
      })(),
      k(i, () => {
        s = !0;
      })
    );
  };
async function U(o, i, s) {
  const n = (s || 'mp3').toLowerCase();
  return n === 'midi' || n === 'mid' ? C(o, i) : T(o, i, n);
}
export { U as default };
