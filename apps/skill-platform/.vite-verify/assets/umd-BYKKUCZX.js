import { a as ne, i as te } from './pako.esm-D9qDZ2Eh.js';
const re = 3734674313,
  oe = 35,
  ie = 36,
  ae = 5,
  c = {
    VERSION: 1,
    TITLE: 2,
    AUTHOR: 3,
    YEAR: 4,
    MONTH: 5,
    DAY: 6,
    CATEGORY: 7,
    PUBLISHER: 8,
    VENDOR: 9,
    CID: 10,
    CONTENT_LENGTH: 11,
    IMAGE: 14,
    MIXED_IMAGE: 15,
    TEXT_SEGMENT_INDEX: 129,
    COVER: 130,
    CHAPTER_OFFSETS: 131,
    CHAPTER_TITLES: 132,
    PAGE_OFFSETS: 135,
    SPLASH: 241,
  };
class de {
  constructor(t) {
    ((this.offset = 0), (this.bytes = new Uint8Array(t)), (this.view = new DataView(t)));
  }
  get remaining() {
    return this.bytes.length - this.offset;
  }
  peek() {
    return this.remaining > 0 ? this.bytes[this.offset] : void 0;
  }
  readUint8() {
    this.ensure(1);
    const t = this.view.getUint8(this.offset);
    return ((this.offset += 1), t);
  }
  readUint16() {
    this.ensure(2);
    const t = this.view.getUint16(this.offset, !0);
    return ((this.offset += 2), t);
  }
  readUint32() {
    this.ensure(4);
    const t = this.view.getUint32(this.offset, !0);
    return ((this.offset += 4), t);
  }
  readBytes(t) {
    const n = Math.max(0, Math.min(t, this.remaining)),
      r = this.offset;
    return ((this.offset += n), this.bytes.slice(r, r + n));
  }
  ensure(t) {
    if (this.remaining < t) throw new Error('UMD 文件结构不完整，读取时遇到意外结尾');
  }
}
const G = (e, t = 0) =>
    e.length < t + 4 ? 0 : new DataView(e.buffer, e.byteOffset + t, 4).getUint32(0, !0),
  W = (e) => {
    if (!e.length) return '';
    if (typeof TextDecoder == 'function') return new TextDecoder('utf-16le').decode(e);
    let t = '';
    for (let n = 0; n + 1 < e.length; n += 2) t += String.fromCharCode(e[n] | (e[n + 1] << 8));
    return t;
  },
  E = (e) =>
    W(e)
      .replace(/\u0000+$/g, '')
      .trim(),
  se = (e) =>
    e
      .replace(/\u0000+$/g, '')
      .replace(
        /\u2029/g,
        `
`,
      )
      .replace(
        /\r\n?/g,
        `
`,
      ),
  ce = (e, t = 0) => {
    const n = e.reduce((a, l) => a + l.length, 0),
      r = t > 0 ? Math.min(t, n) : n,
      i = new Uint8Array(r);
    let d = 0;
    for (const a of e) {
      if (d >= r) break;
      const l = a.subarray(0, Math.min(a.length, r - d));
      (i.set(l, d), (d += l.length));
    }
    return i;
  },
  le = (e) => {
    try {
      return te(e);
    } catch {
      return ne(e);
    }
  },
  me = (e) => {
    const t = [];
    let n = 0;
    for (; n < e.length; ) {
      const r = e[n];
      if (((n += 1), !r || n + r > e.length)) break;
      (t.push(E(e.subarray(n, n + r))), (n += r));
    }
    return t;
  },
  ue = (e) => {
    const t = [],
      n = new DataView(e.buffer, e.byteOffset, e.byteLength);
    for (let r = 0; r + 4 <= e.length; r += 4) t.push(n.getUint32(r, !0));
    return t;
  },
  pe = (e) =>
    e.length >= 8 && e[0] === 137 && e[1] === 80 && e[2] === 78 && e[3] === 71
      ? { extension: 'png', mimeType: 'image/png' }
      : e.length >= 3 && e[0] === 255 && e[1] === 216 && e[2] === 255
        ? { extension: 'jpg', mimeType: 'image/jpeg' }
        : e.length >= 6 && e[0] === 71 && e[1] === 73 && e[2] === 70
          ? { extension: 'gif', mimeType: 'image/gif' }
          : e.length >= 2 && e[0] === 66 && e[1] === 77
            ? { extension: 'bmp', mimeType: 'image/bmp' }
            : e.length >= 12 &&
                e[0] === 82 &&
                e[1] === 73 &&
                e[2] === 70 &&
                e[3] === 70 &&
                e[8] === 87 &&
                e[9] === 69 &&
                e[10] === 66 &&
                e[11] === 80
              ? { extension: 'webp', mimeType: 'image/webp' }
              : { extension: 'bin', mimeType: 'application/octet-stream' },
  X = (e, t, n) => {
    const { extension: r, mimeType: i } = pe(e);
    return { bytes: e, extension: r, id: `${t}-${n}-${e.length}`, mimeType: i };
  },
  he = (e) => (e === 1 ? 'text' : e === 2 ? 'comic' : e === 3 ? 'mixed' : 'unknown'),
  ge = ({ day: e, month: t, year: n }) => [n, t, e].filter(Boolean).join('-'),
  fe = (e, t, n) => {
    if (!e.length) return [];
    const i = (t.length ? t : [0])
      .map((d) => Math.max(0, Math.min(d, e.length)))
      .filter((d, a, l) => a === 0 || d > l[a - 1]);
    return i.map((d, a) => {
      const l = a + 1 < i.length ? i[a + 1] : e.length,
        g = d - (d % 2),
        f = l - (l % 2);
      return {
        content: se(W(e.subarray(g, f))),
        end: f,
        id: `chapter-${a}-${g}`,
        images: [],
        start: g,
        title: n[a] || `章节 ${a + 1}`,
      };
    });
  },
  Y = (e, t, n) => {
    if (!e.length) return [];
    const i = (t.length ? t : [0])
      .map((d) => Math.max(0, Math.min(d, e.length)))
      .filter((d, a, l) => a === 0 || d > l[a - 1]);
    return i.map((d, a) => {
      const l = a + 1 < i.length ? i[a + 1] : e.length;
      return {
        content: '',
        end: l,
        id: `image-chapter-${a}-${d}`,
        images: e.slice(d, l),
        start: d,
        title: n[a] || `图集 ${a + 1}`,
      };
    });
  },
  xe = (e) =>
    e.map((t, n) => ({
      content: '',
      end: n,
      id: `empty-chapter-${n}`,
      images: [],
      start: n,
      title: t || `章节 ${n + 1}`,
    })),
  be = (e) => {
    const t = new de(e),
      n = {
        author: '',
        category: '',
        day: '',
        month: '',
        publishedAt: '',
        publisher: '',
        title: '',
        vendor: '',
        year: '',
      },
      r = new Map(),
      i = [],
      d = [],
      a = [];
    let l = 0,
      g = [],
      f = [],
      u = 0,
      T,
      k = 0;
    if (t.readUint32() !== re) throw new Error('不是有效的 UMD 电子书文件');
    for (; t.remaining > 0 && t.peek() === oe; ) {
      t.readUint8();
      const p = t.readUint16(),
        w = t.readUint8(),
        L = Math.max(0, t.readUint8() - ae),
        m = t.readBytes(L),
        y = p === c.CID || p === c.SPLASH ? l : p;
      switch (p) {
        case c.VERSION:
          k = m[0] || w;
          break;
        case c.TITLE:
          n.title = E(m);
          break;
        case c.AUTHOR:
          n.author = E(m);
          break;
        case c.YEAR:
          n.year = E(m);
          break;
        case c.MONTH:
          n.month = E(m);
          break;
        case c.DAY:
          n.day = E(m);
          break;
        case c.CATEGORY:
          n.category = E(m);
          break;
        case c.PUBLISHER:
          n.publisher = E(m);
          break;
        case c.VENDOR:
          n.vendor = E(m);
          break;
        case c.CONTENT_LENGTH:
          u = G(m);
          break;
        case c.TEXT_SEGMENT_INDEX:
        case c.CHAPTER_OFFSETS:
        case c.CHAPTER_TITLES:
        case c.PAGE_OFFSETS:
          r.set(p, G(m));
          break;
        case c.COVER:
          r.set(p, G(m, 1));
          break;
        case c.IMAGE:
        case c.MIXED_IMAGE:
          k = k || (p === c.MIXED_IMAGE ? 3 : 2);
          break;
      }
      for (l = y || l; t.peek() === ie; ) {
        t.readUint8();
        const R = t.readUint32(),
          M = Math.max(0, t.readUint32() - 9),
          v = t.readBytes(M);
        switch (y) {
          case c.COVER:
            T = X(v, 'cover', R);
            break;
          case c.CHAPTER_OFFSETS:
            g = ue(v);
            break;
          case c.CHAPTER_TITLES:
            R === r.get(c.CHAPTER_TITLES) ? (f = me(v)) : d.push(v);
            break;
          case c.IMAGE:
          case c.MIXED_IMAGE:
            a.push(X(v, 'image', a.length));
            break;
        }
      }
    }
    const D = d.map((p) => {
        try {
          return le(p);
        } catch (w) {
          return (i.push(w instanceof Error ? w.message : String(w)), new Uint8Array());
        }
      }),
      C = ce(D, u);
    u > C.length && d.length && i.push('UMD 正文长度小于声明长度，文件可能不完整');
    let x = fe(C, g, f);
    return (
      x.length ? a.length && k !== 1 && (x = Y(a, g, f)) : (x = Y(a, g, f)),
      !x.length && f.length && (x = xe(f)),
      (n.publishedAt = ge(n)),
      {
        author: n.author,
        category: n.category,
        chapters: x,
        contentLength: u || C.length,
        cover: T,
        kind: he(k),
        publishedAt: n.publishedAt,
        publisher: n.publisher,
        rawType: k,
        title: n.title || 'UMD 电子书',
        vendor: n.vendor,
        warnings: i,
      }
    );
  },
  we = `
.umd-viewer{width:100%;height:100%;display:flex;flex-direction:column;overflow:hidden;background:#eef1f4;color:#172033;box-sizing:border-box}
.umd-toolbar{flex-shrink:0;display:grid;grid-template-columns:40px minmax(0,1fr) auto;align-items:center;gap:12px;padding:12px 14px;border-bottom:1px solid rgba(15,23,42,.08);background:rgba(255,255,255,.94);box-sizing:border-box}
.umd-title{min-width:0;display:flex;flex-direction:column;gap:3px}
.umd-title strong,.umd-title span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.umd-title strong{font-size:14px}.umd-title span{color:#64748b;font-size:12px}
.umd-icon-button,.umd-button{height:36px;border:1px solid rgba(15,23,42,.08);background:#fff;color:#172033;font:inherit;cursor:pointer}
.umd-icon-button{width:40px;display:inline-flex;align-items:center;justify-content:center;border-radius:8px}
.umd-icon-button span,.umd-icon-button span::before,.umd-icon-button span::after{width:16px;height:2px;display:block;border-radius:999px;background:currentColor}
.umd-icon-button span{position:relative}.umd-icon-button span::before,.umd-icon-button span::after{content:'';position:absolute;left:0}.umd-icon-button span::before{top:-5px}.umd-icon-button span::after{top:5px}
.umd-icon-button.active{border-color:rgba(2,132,199,.24);background:rgba(2,132,199,.08);color:#0369a1}
.umd-actions{display:flex;align-items:center;gap:8px}.umd-button{min-width:68px;padding:0 12px;border-radius:8px;font-size:13px;font-weight:700}.umd-button:disabled{color:#94a3b8;cursor:not-allowed}
.umd-progress{min-width:58px;color:#64748b;font-size:12px;text-align:center}
.umd-body{flex:1;min-height:0;display:grid;grid-template-columns:minmax(180px,240px) minmax(0,1fr)}
.umd-viewer--toc-hidden .umd-body{grid-template-columns:minmax(0,1fr)}
.umd-toc{min-width:0;min-height:0;display:flex;flex-direction:column;border-right:1px solid rgba(15,23,42,.08);background:rgba(255,255,255,.82)}
.umd-viewer--toc-hidden .umd-toc{display:none}
.umd-toc-head{flex-shrink:0;display:flex;justify-content:space-between;gap:8px;padding:12px;color:#172033;font-size:13px}.umd-toc-head span{color:#64748b}
.umd-toc-list{flex:1;min-height:0;overflow:auto;padding:0 8px 10px}
.umd-toc-item{width:100%;min-height:34px;padding:7px 10px;border:0;border-radius:8px;background:transparent;color:#475569;font:inherit;font-size:12px;text-align:left;cursor:pointer}
.umd-toc-item:hover,.umd-toc-item.active{background:rgba(2,132,199,.08);color:#0369a1}
.umd-stage-wrap{position:relative;min-width:0;min-height:0;padding:18px;overflow:hidden;box-sizing:border-box}
.umd-stage{width:100%;height:100%;overflow:auto;border-radius:8px;background:#fffef8;box-shadow:0 18px 45px rgba(15,23,42,.12),inset 0 0 0 1px rgba(15,23,42,.06);box-sizing:border-box}
.umd-book-head{display:flex;gap:20px;max-width:820px;margin:0 auto;padding:32px 34px 8px;box-sizing:border-box}.umd-book-head img{width:96px;max-height:136px;object-fit:cover;border-radius:6px;box-shadow:0 12px 26px rgba(15,23,42,.16)}.umd-book-head div{min-width:0}
.umd-book-head h1{margin:0;color:#111827;font-size:24px;line-height:1.3}.umd-book-head p{margin:8px 0 0;color:#64748b;font-size:13px;line-height:1.6}
.umd-chapter{max-width:820px;margin:0 auto;padding:28px 34px 56px;box-sizing:border-box}.umd-chapter h2{margin:0 0 22px;color:#111827;font-size:22px;line-height:1.35}
.umd-text{color:#1f2937;font-family:Georgia,'Times New Roman','Songti SC',SimSun,serif;font-size:17px;line-height:1.86;white-space:pre-wrap;word-break:break-word}
.umd-image-list{display:grid;gap:18px}.umd-image-list figure{margin:0;text-align:center}.umd-image-list img{max-width:100%;height:auto;border-radius:6px;box-shadow:0 10px 24px rgba(15,23,42,.12)}
.umd-empty,.umd-warning{color:#64748b;font-size:14px;line-height:1.7}.umd-warning{max-width:820px;margin:-28px auto 36px;padding:0 34px;color:#b45309;box-sizing:border-box}
.umd-state{position:absolute;inset:18px;display:flex;align-items:center;justify-content:center;border-radius:8px;background:rgba(255,255,255,.92);color:#64748b;font-size:14px}.umd-state[hidden]{display:none!important}.umd-state.error{color:#b42318}
.file-viewer[data-viewer-theme='dark'] .umd-viewer{background:#101820;color:#e5edf6}.file-viewer[data-viewer-theme='dark'] .umd-toolbar,.file-viewer[data-viewer-theme='dark'] .umd-toc{background:rgba(15,23,42,.92);border-color:rgba(148,163,184,.18)}
.file-viewer[data-viewer-theme='dark'] .umd-stage{background:#111827;box-shadow:0 18px 45px rgba(0,0,0,.35),inset 0 0 0 1px rgba(148,163,184,.16)}
.file-viewer[data-viewer-theme='dark'] .umd-book-head h1,.file-viewer[data-viewer-theme='dark'] .umd-chapter h2,.file-viewer[data-viewer-theme='dark'] .umd-text,.file-viewer[data-viewer-theme='dark'] .umd-toc-head{color:#e5edf6}
.file-viewer[data-viewer-theme='dark'] .umd-title span,.file-viewer[data-viewer-theme='dark'] .umd-book-head p,.file-viewer[data-viewer-theme='dark'] .umd-toc-head span,.file-viewer[data-viewer-theme='dark'] .umd-progress{color:#94a3b8}
.file-viewer[data-viewer-theme='dark'] .umd-button,.file-viewer[data-viewer-theme='dark'] .umd-icon-button{background:#172033;color:#e5edf6;border-color:rgba(148,163,184,.18)}
@media (prefers-color-scheme:dark){.file-viewer[data-viewer-theme='system'] .umd-viewer{background:#101820;color:#e5edf6}.file-viewer[data-viewer-theme='system'] .umd-toolbar,.file-viewer[data-viewer-theme='system'] .umd-toc{background:rgba(15,23,42,.92);border-color:rgba(148,163,184,.18)}.file-viewer[data-viewer-theme='system'] .umd-stage{background:#111827;box-shadow:0 18px 45px rgba(0,0,0,.35),inset 0 0 0 1px rgba(148,163,184,.16)}.file-viewer[data-viewer-theme='system'] .umd-book-head h1,.file-viewer[data-viewer-theme='system'] .umd-chapter h2,.file-viewer[data-viewer-theme='system'] .umd-text,.file-viewer[data-viewer-theme='system'] .umd-toc-head{color:#e5edf6}.file-viewer[data-viewer-theme='system'] .umd-title span,.file-viewer[data-viewer-theme='system'] .umd-book-head p,.file-viewer[data-viewer-theme='system'] .umd-toc-head span,.file-viewer[data-viewer-theme='system'] .umd-progress{color:#94a3b8}.file-viewer[data-viewer-theme='system'] .umd-button,.file-viewer[data-viewer-theme='system'] .umd-icon-button{background:#172033;color:#e5edf6;border-color:rgba(148,163,184,.18)}}
@media (max-width:720px){.umd-toolbar{grid-template-columns:40px minmax(0,1fr)}.umd-actions{grid-column:1/-1;justify-content:space-between}.umd-body{position:relative;grid-template-columns:minmax(0,1fr)}.umd-toc{position:absolute;z-index:5;top:0;bottom:0;left:0;width:min(82vw,280px);box-shadow:18px 0 40px rgba(15,23,42,.16)}.umd-stage-wrap{padding:12px}.umd-book-head{padding:24px 20px 0}.umd-chapter{padding:24px 20px 42px}}
`,
  ve = () => {
    const e = document.createElement('style');
    return ((e.textContent = we), e);
  },
  b = (e, t, n, r) => {
    const i = document.createElement(t);
    return (r && (i.className = r), (i.textContent = n), e.appendChild(i), i);
  },
  $ = (e, t) => {
    const n = document.createElement('button');
    return ((n.type = 'button'), (n.className = t), (n.textContent = e), n);
  },
  K = (e, t) =>
    e
      ? [e.author, e.category, e.publishedAt].filter(Boolean).join(' / ') || t?.title || '阅读中'
      : t?.title || '阅读中',
  Ee = (e) => {
    const t = new Uint8Array(e.bytes.byteLength);
    return (t.set(e.bytes), t);
  };
async function Te(e, t) {
  const n = new Map();
  let r = null,
    i = 0,
    d = !0,
    a = !1;
  const l = ve(),
    g = document.createElement('div');
  g.className = 'umd-viewer';
  const f = document.createElement('div');
  f.className = 'umd-toolbar';
  const u = document.createElement('button');
  ((u.type = 'button'),
    (u.className = 'umd-icon-button active'),
    (u.title = '目录'),
    u.appendChild(document.createElement('span')));
  const T = document.createElement('div');
  T.className = 'umd-title';
  const k = b(T, 'strong', 'UMD 电子书'),
    D = b(T, 'span', '阅读中'),
    C = document.createElement('div');
  C.className = 'umd-actions';
  const x = $('上一章', 'umd-button'),
    p = document.createElement('span');
  ((p.className = 'umd-progress'), (p.textContent = '0/0'));
  const w = $('下一章', 'umd-button');
  (C.append(x, p, w), f.append(u, T, C));
  const L = document.createElement('div');
  L.className = 'umd-body';
  const m = document.createElement('aside');
  m.className = 'umd-toc';
  const y = document.createElement('div');
  ((y.className = 'umd-toc-head'), b(y, 'strong', '目录'));
  const R = b(y, 'span', '0 项'),
    M = document.createElement('div');
  ((M.className = 'umd-toc-list'), m.append(y, M));
  const v = document.createElement('main');
  v.className = 'umd-stage-wrap';
  const A = document.createElement('article');
  A.className = 'umd-stage';
  const U = document.createElement('div');
  ((U.className = 'umd-state'),
    (U.textContent = '正在解析 UMD...'),
    v.append(A, U),
    L.append(m, v),
    g.append(f, L),
    t.replaceChildren(l, g));
  const Z = () => {
      (n.forEach((o) => URL.revokeObjectURL(o)), n.clear());
    },
    j = (o) => {
      if (!o) return '';
      const s = n.get(o.id);
      if (s) return s;
      const h = URL.createObjectURL(new Blob([Ee(o)], { type: o.mimeType }));
      return (n.set(o.id, h), h);
    },
    B = () => r?.chapters[i],
    _ = () => {
      const o = B(),
        s = r?.chapters.length || 0;
      ((k.textContent = r?.title || 'UMD 电子书'),
        (D.textContent = K(r, o)),
        (p.textContent = s ? `${i + 1}/${s}` : '0/0'),
        (x.disabled = !r || i <= 0),
        (w.disabled = !r || !s || i >= s - 1),
        u.classList.toggle('active', d),
        g.classList.toggle('umd-viewer--toc-hidden', !d),
        (R.textContent = `${s} 项`));
    },
    z = () => {
      A.scrollTo({ top: 0 });
    },
    q = () => {
      (M.replaceChildren(),
        r?.chapters.forEach((o, s) => {
          const h = $(o.title, 'umd-toc-item');
          (h.classList.toggle('active', s === i),
            h.addEventListener('click', () => {
              ((i = s), (d = !1), O(), z());
            }),
            M.appendChild(h));
        }));
    },
    J = (o) => {
      if (!r) return;
      const s = j(r.cover),
        h = K(r);
      if (!s && !h) return;
      const I = document.createElement('header');
      if (((I.className = 'umd-book-head'), s)) {
        const H = document.createElement('img');
        ((H.src = s), (H.alt = r.title), I.appendChild(H));
      }
      const S = document.createElement('div');
      (b(S, 'h1', r.title), h && b(S, 'p', h));
      const N = [r.publisher, r.vendor].filter(Boolean).join(' / ');
      (N && b(S, 'p', N), I.appendChild(S), o.appendChild(I));
    },
    Q = (o) => {
      const s = document.createElement('section');
      if (
        ((s.className = 'umd-chapter'),
        (s.dataset.viewerAnchorId = o.id),
        b(s, 'h2', o.title),
        o.images.length)
      ) {
        const h = document.createElement('div');
        ((h.className = 'umd-image-list'),
          o.images.forEach((I) => {
            const S = document.createElement('figure'),
              N = document.createElement('img');
            ((N.src = j(I)), (N.alt = o.title), S.appendChild(N), h.appendChild(S));
          }),
          s.appendChild(h));
      }
      return (
        o.content
          ? b(s, 'div', o.content, 'umd-text')
          : o.images.length || b(s, 'div', '未解析到正文内容', 'umd-empty'),
        s
      );
    },
    O = () => {
      (_(), q(), (U.hidden = !0), A.replaceChildren(), J(A));
      const o = B();
      o && A.appendChild(Q(o));
      const s = r?.warnings.filter(Boolean).join('；') || '';
      s && b(A, 'div', s, 'umd-warning');
    },
    ee = (o) => {
      (_(), (U.hidden = !1), U.classList.add('error'), (U.textContent = o));
    },
    P = () => {
      ((d = !d), _());
    },
    F = () => {
      !r || i <= 0 || ((i -= 1), O(), z());
    },
    V = () => {
      const o = r?.chapters.length || 0;
      !r || i >= o - 1 || ((i += 1), O(), z());
    };
  (u.addEventListener('click', P), x.addEventListener('click', F), w.addEventListener('click', V));
  try {
    ((r = be(e.slice(0))), a || ((i = 0), O()));
  } catch (o) {
    a || (console.error(o), ee(o instanceof Error ? o.message : String(o)));
  }
  return {
    $el: t,
    unmount() {
      ((a = !0),
        u.removeEventListener('click', P),
        x.removeEventListener('click', F),
        w.removeEventListener('click', V),
        Z(),
        t.replaceChildren());
    },
  };
}
export { Te as default };
