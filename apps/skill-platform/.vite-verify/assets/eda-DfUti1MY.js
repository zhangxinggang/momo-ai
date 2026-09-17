const __vite__mapDeps = (
  i,
  m = __vite__mapDeps,
  d = m.f ||
    (m.f = [
      './cfb-sP5jJ_0U.js',
      './ui-vendor-C-FKu2uc.js',
      './markdown-vendor-DldLOD9R.js',
      './markdown-it-vendor-DL4wSELR.js',
      './markdown-vendor-CmuYMs8x.css',
    ]),
) => i.map((i) => d[i]);
import './markdown-it-vendor-DL4wSELR.js';
import { _ as Qe } from './markdown-vendor-DldLOD9R.js';
import './ui-vendor-C-FKu2uc.js';
const se = 2500,
  C = {
    BGNLIB: 1,
    LIBNAME: 2,
    UNITS: 3,
    BGNSTR: 5,
    STRNAME: 6,
    ENDSTR: 7,
    BOUNDARY: 8,
    PATH: 9,
    SREF: 10,
    AREF: 11,
    TEXT: 12,
    LAYER: 13,
    DATATYPE: 14,
    WIDTH: 15,
    XY: 16,
    ENDEL: 17,
    SNAME: 18,
    COLROW: 19,
    TEXTTYPE: 22,
    STRING: 25,
  },
  Be = ['#5eead4', '#93c5fd', '#c4b5fd', '#f9a8d4', '#fde68a', '#86efac', '#fdba74', '#67e8f9'],
  De = (e) =>
    e
      .replace(/\u0000/g, '')
      .replace(/[^\S\r\n]+/g, ' ')
      .replace(
        /\r\n/g,
        `
`,
      )
      .trim(),
  V = (e, t) => {
    const n = (e[t] << 8) | e[t + 1];
    return n & 32768 ? n - 65536 : n;
  },
  ue = (e, t) => (e[t] << 24) | (e[t + 1] << 16) | (e[t + 2] << 8) | e[t + 3] | 0,
  H = (e, t, n) =>
    De(new TextDecoder('utf-8', { fatal: !1 }).decode(e.slice(t, t + n)).replace(/\u0000+$/g, '')),
  Je = (e) => {
    const t = e.slice(0, Math.min(e.length, 4096));
    if (!t.length) return !1;
    let n = 0;
    for (const r of t) (r === 9 || r === 10 || r === 13 || (r >= 32 && r <= 126)) && (n += 1);
    return n / t.length > 0.9;
  },
  I = (e) => {
    const t = Number(e);
    return Number.isFinite(t) ? t : void 0;
  },
  et = (e) => {
    var t;
    return (
      ((t = e.match(/"([^"]+)"/)) === null || t === void 0 ? void 0 : t[1]) ||
      e.split(/\s+/).slice(3).join(' ')
    );
  },
  Pe = (e, t) => {
    const n = e[t];
    if (!n) return 0;
    const r = n & 128 ? -1 : 1,
      a = (n & 127) - 64;
    let o = 0;
    for (let i = 1; i < 8; i += 1) o += e[t + i] / 256 ** i;
    return r * o * 16 ** a;
  },
  tt = (e, t, n) => {
    const r = [];
    for (let a = t; a + 7 < t + n; a += 8) r.push({ x: ue(e, a), y: ue(e, a + 4) });
    return r;
  },
  ze = (e, t) => {
    let n = e;
    return (
      t.forEach((r) => {
        if (!(!Number.isFinite(r.x) || !Number.isFinite(r.y))) {
          if (!n) {
            n = { minX: r.x, minY: r.y, maxX: r.x, maxY: r.y };
            return;
          }
          ((n.minX = Math.min(n.minX, r.x)),
            (n.minY = Math.min(n.minY, r.y)),
            (n.maxX = Math.max(n.maxX, r.x)),
            (n.maxY = Math.max(n.maxY, r.y)));
        }
      }),
      n
    );
  },
  nt = (e) => {
    const t = e.trim().replace(/^#/, '');
    return /^[0-9a-f]{3}$/i.test(t)
      ? t
          .split('')
          .map((n) => `${n}${n}`)
          .join('')
      : /^[0-9a-f]{6}$/i.test(t)
        ? t
        : '5eead4';
  },
  rt = (e, t) => {
    const n = Number.isFinite(e) ? Math.abs(Number(e)) : 0,
      r = nt(t[n % t.length] || Be[0]);
    return {
      r: parseInt(r.slice(0, 2), 16) / 255,
      g: parseInt(r.slice(2, 4), 16) / 255,
      b: parseInt(r.slice(4, 6), 16) / 255,
    };
  },
  at = (e) => {
    if (e.length < 2) return [...e];
    const t = e[0],
      n = e[e.length - 1];
    return t.x === n.x && t.y === n.y ? e.slice(0, -1) : [...e];
  },
  ot = (e) => {
    const t = [],
      n = [],
      r = [];
    let a = '',
      o,
      i,
      s = '',
      d = null,
      p;
    const f = () => {
      if (!d || !d.xy.length) {
        d = null;
        return;
      }
      (n.length < se
        ? (n.push(d), (p = ze(p, d.xy)))
        : r.length ||
          r.push(
            `Layout contains more than ${se} elements; only the first ${se} are rendered to protect browser memory.`,
          ),
        (d = null));
    };
    for (let u = 0; u + 3 < e.length; ) {
      const b = (e[u] << 8) | e[u + 1],
        g = e[u + 2];
      if (b < 4 || u + b > e.length) {
        r.push(
          `GDSII record has an invalid length at offset ${u}; geometry parsing stopped safely.`,
        );
        break;
      }
      const x = u + 4,
        c = b - 4;
      switch (g) {
        case C.BGNLIB:
          s = '';
          break;
        case C.LIBNAME:
          a = H(e, x, c);
          break;
        case C.UNITS:
          c >= 16 && ((o = Pe(e, x)), (i = Pe(e, x + 8)));
          break;
        case C.BGNSTR:
          (f(), (s = ''));
          break;
        case C.STRNAME:
          ((s = H(e, x, c)), s && !t.includes(s) && t.push(s));
          break;
        case C.ENDSTR:
          (f(), (s = ''));
          break;
        case C.BOUNDARY:
          (f(), (d = { kind: 'boundary', structure: s || 'STRUCTURE', xy: [] }));
          break;
        case C.PATH:
          (f(), (d = { kind: 'path', structure: s || 'STRUCTURE', xy: [] }));
          break;
        case C.TEXT:
          (f(), (d = { kind: 'text', structure: s || 'STRUCTURE', xy: [] }));
          break;
        case C.SREF:
          (f(), (d = { kind: 'sref', structure: s || 'STRUCTURE', xy: [] }));
          break;
        case C.AREF:
          (f(), (d = { kind: 'aref', structure: s || 'STRUCTURE', xy: [] }));
          break;
        case C.LAYER:
          d && c >= 2 && (d.layer = V(e, x));
          break;
        case C.DATATYPE:
        case C.TEXTTYPE:
          d && c >= 2 && (d.datatype = V(e, x));
          break;
        case C.WIDTH:
          d && c >= 4 && (d.width = Math.abs(ue(e, x)));
          break;
        case C.XY:
          d && (d.xy = tt(e, x, c));
          break;
        case C.SNAME:
          d && (d.reference = H(e, x, c));
          break;
        case C.STRING:
          d && (d.text = H(e, x, c));
          break;
        case C.COLROW:
          d && c >= 4 && (d.text = `${d.text || ''} ${V(e, x)}x${V(e, x + 2)}`.trim());
          break;
        case C.ENDEL:
          f();
          break;
      }
      u += b;
    }
    if ((f(), !(!t.length && !n.length && !a)))
      return {
        format: 'gdsii',
        libraryName: a,
        userUnit: o,
        databaseUnit: i,
        structureCount: t.length,
        structures: t,
        elements: n,
        bounds: p,
        warnings: r,
      };
  },
  it = (e) => {
    if (!Je(e)) return;
    const t = new TextDecoder('utf-8', { fatal: !1 }).decode(e);
    if (!/%SEMI-OASIS/i.test(t) && !/\bOASIS\b/i.test(t)) return;
    const n = [],
      r = [],
      a = [
        'Parsed an ASCII OASIS-like structure fixture. Full SEMI binary OASIS geometry requires the dedicated layout kernel path.',
      ],
      o = { structure: 'TOP' };
    let i, s;
    const d = (p) => {
      (r.push(p), (s = ze(s, p.xy)));
    };
    if (
      (t.split(/\r?\n/).forEach((p) => {
        const f = p.trim();
        if (!f || f.startsWith('#')) return;
        const u = f.split(/\s+/),
          b = (u[0] || '').toUpperCase();
        if (b === 'START') {
          const g = f.match(/\bunit=([0-9.eE+-]+)/);
          i = I(g?.[1]);
          return;
        }
        if (b === 'CELL') {
          ((o.structure = u[1] || `CELL_${n.length + 1}`),
            n.includes(o.structure) || n.push(o.structure));
          return;
        }
        if (b === 'LAYER') {
          o.layer = I(u[1]);
          const g = u.findIndex((x) => x.toUpperCase() === 'DATATYPE');
          o.datatype = I(u[g + 1]);
          return;
        }
        if (b === 'RECT') {
          const g = I(u[1]),
            x = I(u[2]),
            c = I(u[3]),
            A = I(u[4]);
          if ([g, x, c, A].some((k) => k === void 0)) {
            a.push(`Skipped malformed RECT record: ${f}`);
            return;
          }
          d({
            kind: 'boundary',
            structure: o.structure,
            layer: o.layer,
            datatype: o.datatype,
            xy: [
              { x: g, y: x },
              { x: g + c, y: x },
              { x: g + c, y: x + A },
              { x: g, y: x + A },
              { x: g, y: x },
            ],
          });
          return;
        }
        if (b === 'PATH' || b === 'POLYGON') {
          const g = u.slice(1).map(I);
          if (g.length < 4 || g.some((c) => c === void 0)) {
            a.push(`Skipped malformed ${b} record: ${f}`);
            return;
          }
          const x = [];
          for (let c = 0; c + 1 < g.length; c += 2) x.push({ x: g[c], y: g[c + 1] });
          (b === 'POLYGON' && x.length >= 3 && x.push({ ...x[0] }),
            d({
              kind: b === 'PATH' ? 'path' : 'boundary',
              structure: o.structure,
              layer: o.layer,
              datatype: o.datatype,
              xy: x,
            }));
          return;
        }
        if (b === 'TEXT') {
          const g = I(u[1]),
            x = I(u[2]);
          if (g === void 0 || x === void 0) {
            a.push(`Skipped malformed TEXT record: ${f}`);
            return;
          }
          d({
            kind: 'text',
            structure: o.structure,
            layer: o.layer,
            datatype: o.datatype,
            text: De(et(f)),
            xy: [{ x: g, y: x }],
          });
        }
      }),
      !(!r.length && !n.length))
    )
      return {
        format: 'oasis',
        libraryName: 'OASIS text fixture',
        userUnit: i,
        structureCount: n.length || 1,
        structures: n.length ? n : [o.structure],
        elements: r,
        bounds: s,
        warnings: a,
      };
  },
  st = (e, t = {}) => {
    var n, r, a;
    const o = [],
      i = [],
      s = [],
      d = [],
      p = [],
      f = !((n = t.palette) === null || n === void 0) && n.length ? t.palette : Be,
      u = (r = t.maxElements) !== null && r !== void 0 ? r : 18e3,
      b = (a = t.maxLabels) !== null && a !== void 0 ? a : 600,
      g = e.bounds;
    if (e.format !== 'gdsii' || !g)
      return {
        format: 'gdsii',
        elementCount: 0,
        triangleVertices: new Float32Array(),
        lineVertices: new Float32Array(),
        pointVertices: new Float32Array(),
        labels: p,
        bounds: g,
        warnings: ['WebGL batches are currently generated for parsed GDSII geometry only.'],
      };
    const x = Math.max(1, g.maxX - g.minX),
      c = Math.max(1, g.maxY - g.minY),
      A = (E) => ({ x: ((E.x - g.minX) / x) * 2 - 1, y: ((E.y - g.minY) / c) * 2 - 1 }),
      k = (E, L, w) => {
        const T = A(L);
        E.push(T.x, T.y, w.r, w.g, w.b);
      },
      y = (E, L, w) => {
        (k(s, E, w), k(s, L, w));
      },
      P = e.elements.slice(0, u);
    return (
      e.elements.length > u &&
        o.push(
          `Layout contains ${e.elements.length} elements; WebGL preview batched the first ${u} elements to protect browser memory.`,
        ),
      P.forEach((E) => {
        const L = rt(E.layer, f),
          w = at(E.xy);
        if ((E.kind === 'boundary' || E.kind === 'aref') && w.length >= 3) {
          for (let S = 1; S < w.length - 1; S += 1)
            (k(i, w[0], L), k(i, w[S], L), k(i, w[S + 1], L));
          for (let S = 0; S < w.length; S += 1) y(w[S], w[(S + 1) % w.length], L);
          return;
        }
        if (E.kind === 'path' && w.length >= 2) {
          for (let S = 0; S < w.length - 1; S += 1) y(w[S], w[S + 1], L);
          return;
        }
        const T = w[0];
        if (!T) return;
        k(d, T, L);
        const B = E.text || E.reference;
        if (B && p.length < b) {
          const S = A(T);
          p.push({ text: B, layer: E.layer, x: T.x, y: T.y, clipX: S.x, clipY: S.y });
        }
      }),
      p.length >= b && o.push(`Only the first ${b} layout labels are shown in the WebGL overlay.`),
      {
        format: 'gdsii',
        elementCount: P.length,
        triangleVertices: new Float32Array(i),
        lineVertices: new Float32Array(s),
        pointVertices: new Float32Array(d),
        labels: p,
        bounds: g,
        warnings: o,
      }
    );
  },
  dt = (e) => {
    const n = new TextDecoder('ascii', { fatal: !1 })
      .decode(e.slice(0, Math.min(24, e.length)))
      .includes('OASIS');
    return {
      format: 'oasis',
      magicFound: n,
      byteLength: e.byteLength,
      warnings: [
        n
          ? 'OASIS header detected. Full cell repetition expansion and geometry rendering is reserved for the dedicated WASM/WebGL layout engine boundary.'
          : 'OASIS header was not detected in the first bytes. The file may be wrapped, compressed, encrypted, or use a proprietary exchange container.',
      ],
    };
  },
  lt = [208, 207, 17, 224, 161, 177, 26, 225],
  Ue = 4096,
  ct = 192,
  pt = (e) => lt.every((t, n) => e[n] === t),
  _ = (e) =>
    e
      .replace(/\u0000/g, '')
      .replace(/[^\S\r\n]+/g, ' ')
      .replace(
        /\r\n/g,
        `
`,
      )
      .trim(),
  ut = (e) => {
    if (!e.length) return !1;
    const t = e.slice(0, Math.min(e.length, Ue));
    let n = 0,
      r = 0;
    for (const a of t)
      (a === 0 && (r += 1),
        (a === 9 || a === 10 || a === 13 || (a >= 32 && a <= 126) || a >= 128) && (n += 1));
    return n / t.length > 0.82 || r / t.length > 0.25;
  },
  ft = (e) => {
    const t = e.slice(0, Math.min(e.length, Ue));
    if (!t.length) return '';
    try {
      let n = 0,
        r = 0;
      for (let o = 0; o < t.length; o += 1) t[o] === 0 && (o % 2 === 0 ? (r += 1) : (n += 1));
      const a =
        n > t.length / 5 && n > r * 2
          ? new TextDecoder('utf-16le', { fatal: !1 })
          : new TextDecoder('utf-8', { fatal: !1 });
      return _(a.decode(t));
    } catch {
      return '';
    }
  },
  ht = (e) => {
    const t = e.slice(0, Math.min(e.length, ct)),
      n = [];
    for (let r = 0; r < t.length; r += 16) {
      const a = t.slice(r, r + 16),
        o = Array.from(a)
          .map((s) => s.toString(16).padStart(2, '0'))
          .join(' '),
        i = Array.from(a)
          .map((s) => (s >= 32 && s <= 126 ? String.fromCharCode(s) : '.'))
          .join('');
      n.push(`${r.toString(16).padStart(8, '0')}  ${o.padEnd(47)}  ${i}`);
    }
    return n.join(`
`);
  },
  gt = (e) => {
    const t = [];
    let n = '';
    for (const r of e) {
      if (r >= 32 && r <= 126) {
        n += String.fromCharCode(r);
        continue;
      }
      (n.length >= 4 && t.push(n), (n = ''));
    }
    return (n.length >= 4 && t.push(n), t);
  },
  mt = (e) => {
    const t = [];
    let n = '';
    for (let r = 0; r + 1 < e.length; r += 2) {
      const a = e[r];
      if (e[r + 1] === 0 && a >= 32 && a <= 126) {
        n += String.fromCharCode(a);
        continue;
      }
      (n.length >= 4 && t.push(n), (n = ''));
    }
    return (n.length >= 4 && t.push(n), t);
  },
  me = (e, t = 180) => {
    const n = new Set(),
      r = [];
    return (
      e.forEach((a) => {
        [...gt(a), ...mt(a)].forEach((i) => {
          const s = _(i);
          !s || s.length < 4 || n.has(s) || r.length >= t || (n.add(s), r.push(s));
        });
      }),
      r
    );
  },
  de = 200,
  xt = 24,
  bt = 420,
  xe = (e) => new Uint8Array(e),
  yt = (e) => (e instanceof Uint8Array ? e : new Uint8Array(e)),
  wt = (e) => _(e).toLowerCase(),
  vt = (e) => {
    const t = e.split('/').filter(Boolean);
    return t[t.length - 1] || e || '/';
  },
  Et = (e) => e.replace(/\.[a-z0-9]+$/i, ''),
  G = (e, t, n = Number.POSITIVE_INFINITY) => {
    const r = _(t);
    !r || e.includes(r) || e.length >= n || e.push(r);
  },
  St = /^\s*([A-Za-z][A-Za-z0-9_. /#-]{1,56})\s*[:=]\s*(.{1,240})\s*$/,
  kt = /\b([A-Za-z][A-Za-z0-9_. /#-]{1,56})\s*=\s*([^;\n\r|]{1,240})/g,
  Lt = (e) => _(e).replace(/\s+/g, ' '),
  Re = (e, t, n, r, a) => {
    if (e.length >= bt) return;
    const o = Lt(n),
      i = _(r);
    if (!o || !i) return;
    const s = `${a}\0${o.toLowerCase()}\0${i}`;
    t.has(s) || (t.add(s), e.push({ key: o, value: i, source: a }));
  },
  At = (e, t, n) => {
    const r = [],
      a = new Set();
    return (
      [e, ...t].filter(Boolean).forEach((i) => {
        _(i)
          .split(/\n|[|;]/)
          .forEach((s) => {
            const d = s.match(St);
            d && Re(r, a, d[1], d[2], n);
          });
        for (const s of i.matchAll(kt)) Re(r, a, s[1], s[2], n);
      }),
      r
    );
  },
  j = (e, t) => {
    const n = t.map((r) => r.toLowerCase());
    return e.some((r) => n.includes(r.key.toLowerCase()));
  },
  U = (e, t) => {
    const n = t.map((r) => r.toLowerCase());
    return e.find((r) => n.includes(r.key.toLowerCase()))?.value;
  },
  fe = (e, t, n, r, a, o, i) => {
    const s = wt(`${t}
${n}
${r}
${a.join(`
`)}`);
    if (s === '/' || t === '/') return 'root';
    if (i === 'storage' && /(^|\/)(library|libraries)(\/|$)/i.test(t)) return 'library';
    if (/(header|version|source|author|metadata|property|properties)/.test(s))
      return j(o, ['Name', 'Pins', 'Footprint', 'Padstack']) ? 'property' : 'metadata';
    if (e === 'olb') {
      if (
        /(^|\/)(symbols?|parts?)(\/|$)/.test(s) ||
        j(o, ['Pins', 'Footprint', 'PCB Footprint', 'Part Number'])
      )
        return 'symbol';
      if (/(^|\/)(library|capture|orcad)(\/|$)/.test(s)) return 'library';
    }
    if (e === 'dra') {
      if (/(padstack|pad stack|thermal|antipad|drill)/.test(s) || j(o, ['Padstack', 'Drill']))
        return 'padstack';
      if (/(footprint|package|psm|bsm|fsm|ssm|symbol)/.test(s)) return 'footprint';
      if (/(route|net|via|ratsnest)/.test(s)) return 'net';
      if (
        /(line |arc |circle|shape|outline|silk|place_bound|assembly|soldermask|pastemask)/.test(s)
      )
        return 'geometry';
      if (/(drawing|units|layers?|constraint|allegro)/.test(s) || j(o, ['Units', 'Layers']))
        return 'drawing';
    }
    if (e === 'gds' || e === 'oas' || e === 'oasis') {
      if (
        /(cell|structure|strname|sref|aref|boundary|path|polygon|layer|datatype|text|xy|gds|oas|oasis|layout)/.test(
          s,
        )
      )
        return 'geometry';
      if (/(library|libname|units|precision|technology|property|properties)/.test(s))
        return 'metadata';
    }
    return o.length ? 'property' : i === 'storage' ? 'library' : 'unknown';
  },
  he = (e, t, n, r, a, o) => {
    if (a === 'storage' || !o) {
      const f = fe(e, t, n, '', [], [], a);
      return { path: t, name: n, size: r, kind: a, role: f, strings: [], properties: [] };
    }
    const i = ut(o) ? ft(o) : '',
      s = me([o], xt),
      d = At(i, s, t),
      p = fe(e, t, n, i, s, d, i ? 'text' : 'binary');
    return {
      path: t,
      name: n,
      size: r,
      kind: i ? 'text' : 'binary',
      role: p,
      sample: i,
      hex: i ? void 0 : ht(o),
      strings: s,
      properties: d,
    };
  },
  Ge = (e) => {
    (e.children.sort((t, n) =>
      t.children.length !== n.children.length
        ? n.children.length - t.children.length
        : t.name.localeCompare(n.name),
    ),
      e.children.forEach(Ge));
  },
  Tt = (e, t) => {
    const n = {
        id: `${t}:root`,
        path: '/',
        name: t.toUpperCase(),
        kind: 'storage',
        role: 'root',
        size: 0,
        children: [],
      },
      r = new Map([['/', n]]);
    return (
      e.forEach((a) => {
        const o = a.path.split('/').filter(Boolean);
        let i = n,
          s = '';
        o.forEach((d, p) => {
          s += `/${d}`;
          const f = p === o.length - 1;
          let u = r.get(s);
          (u ||
            ((u = {
              id: `${t}:${s}`,
              path: s,
              name: d,
              kind: f ? a.kind : 'storage',
              role: f ? a.role : fe(t, s, d, '', [], [], 'storage'),
              size: f ? a.size : 0,
              children: [],
            }),
            r.set(s, u),
            i.children.push(u)),
            f && ((u.kind = a.kind), (u.role = a.role), (u.size = a.size)),
            (i = u));
        });
      }),
      Ge(n),
      n.children
    );
  },
  Ie = (e) => {
    if (!e) return [];
    const t = [];
    return (
      e.split(/[,/;| ]+/).forEach((n) => {
        /^[A-Za-z0-9_.+-]+$/.test(n) && G(t, n, 64);
      }),
      t
    );
  },
  Ct = (e, t) =>
    t === 'olb'
      ? e.role === 'symbol' && e.kind !== 'storage'
        ? 'symbol'
        : null
      : t === 'gds' || t === 'oas' || t === 'oasis'
        ? e.role === 'geometry' || e.role === 'metadata'
          ? 'drawing'
          : null
        : e.role === 'padstack'
          ? 'padstack'
          : e.role === 'footprint' || (e.role === 'geometry' && /\/footprint\//i.test(e.path))
            ? 'footprint'
            : e.role === 'drawing'
              ? 'drawing'
              : null,
  $t = (e, t) =>
    t === 'footprint'
      ? e.path.match(/^(.+?\/Footprint)(?:\/|$)/i)?.[1] || e.path
      : (t === 'drawing' && e.path.match(/^(.+?\/Drawing)(?:\/|$)/i)?.[1]) || e.path,
  Pt = (e, t, n) => {
    const r = U(e.properties, [
      'Name',
      'Part',
      'Part Name',
      'Symbol',
      'Device',
      'Footprint',
      'PCB Footprint',
      'Package',
      'Padstack',
      'Pad Stack',
      'Drawing',
    ]);
    if (r) return r;
    const a = Et(vt(n));
    return a && a !== '/' ? a : t.toUpperCase();
  },
  Rt = (e, t) => {
    const n = [],
      r = `${e.path}
${e.sample || ''}
${e.strings.join(`
`)}`.toLowerCase();
    return (
      (t === 'symbol'
        ? ['pins', 'footprint', 'pspice', 'part', 'symbol']
        : [
            'units',
            'layers',
            'padstack',
            'drill',
            'outline',
            'route',
            'constraint',
            'shape',
            'place_bound',
          ]
      ).forEach((o) => {
        r.includes(o) && G(n, o, 12);
      }),
      n
    );
  },
  Ye = (e, t) => {
    const n = new Set(e.map((r) => `${r.key.toLowerCase()}\0${r.value}`));
    t.forEach((r) => {
      const a = `${r.key.toLowerCase()}\0${r.value}`;
      n.has(a) || (n.add(a), e.push(r));
    });
  },
  It = (e, t) => {
    const n = new Map();
    return (
      e.forEach((r) => {
        const a = Ct(r, t);
        if (!a) return;
        const o = $t(r, a),
          i = `${a}:${o.toLowerCase()}`,
          d = n.get(i) || {
            id: i,
            name: Pt(r, a, o),
            role: a,
            path: o,
            streamCount: 0,
            byteLength: 0,
            properties: [],
            pins: [],
            layers: [],
            keywords: [],
          };
        ((d.streamCount += 1),
          (d.byteLength += r.size),
          Ye(d.properties, r.properties),
          Ie(U(r.properties, ['Pins', 'Pin', 'Pin Numbers'])).forEach((p) => G(d.pins, p, 96)),
          Ie(U(r.properties, ['Layers', 'Layer'])).forEach((p) => G(d.layers, p, 64)),
          Rt(r, a).forEach((p) => G(d.keywords, p, 16)),
          (d.description ||= U(d.properties, ['Description', 'Desc'])),
          (d.footprint ||= U(d.properties, ['Footprint', 'PCB Footprint', 'Package'])),
          n.set(i, d));
      }),
      Array.from(n.values()).sort((r, a) => {
        const o = { symbol: 0, footprint: 1, padstack: 2, drawing: 3 };
        return (o[r.role] ?? 9) - (o[a.role] ?? 9) || r.name.localeCompare(a.name);
      })
    );
  },
  _t = (e) => {
    const t = [];
    return (
      e.forEach((n) => {
        (n.role === 'metadata' || n.role === 'library' || n.role === 'drawing') &&
          Ye(t, n.properties);
      }),
      t.slice(0, 80)
    );
  },
  Nt = (e, t, n, r, a) => {
    const o = {
      textStreams: e.filter((i) => i.kind === 'text').length,
      binaryStreams: e.filter((i) => i.kind === 'binary').length,
      storageEntries: e.filter((i) => i.kind === 'storage').length,
      propertyCount: e.reduce((i, s) => i + s.properties.length, 0),
      stringCount: n.length,
      symbolCount: t.filter((i) => i.role === 'symbol').length,
      footprintCount: t.filter((i) => i.role === 'footprint').length,
      padstackCount: t.filter((i) => i.role === 'padstack').length,
      confidence: 'low',
    };
    return (
      a?.elements.length || (r === 'cfb' && t.length && o.propertyCount)
        ? (o.confidence = 'high')
        : (r === 'cfb' || n.length || o.propertyCount) && (o.confidence = 'medium'),
      o
    );
  },
  Mt = (e, t, n, r, a, o, i) => {
    const s = o.map((u, b) => ({ level: 'warning', code: `warning-${b + 1}`, message: u }));
    (s.push({
      level: 'info',
      code: 'parser',
      message: i
        ? i.format === 'oasis'
          ? '已识别为 OASIS 文本结构夹具，并在浏览器端解析几何预览和结构索引；真实 SEMI 二进制 OASIS 仍走安全索引与后续独立内核路线。'
          : '已识别为标准 GDSII 二进制版图记录，并在浏览器端解析几何预览和结构索引。'
        : t === 'cfb'
          ? '已识别为 Microsoft Compound File / OLE2 复合文档容器，并在浏览器端解析目录与流。'
          : '未识别为 CFB 容器，已使用二进制字符串索引模式展示可读信息。',
    }),
      s.push({
        level: 'info',
        code: 'coverage',
        message: `已索引 ${n.length} 个条目、${a.length} 个可读字符串、${r.length} 个 EDA 结构候选。`,
      }),
      i &&
        s.push({
          level: 'info',
          code: `${i.format}-layout`,
          message: `已解析 ${i.format === 'oasis' ? 'OASIS 结构夹具' : 'GDSII 版图'}: ${i.structureCount} 个 structure、${i.elements.length} 个几何/引用/文本元素，可在版图预览面板中拖动查看。`,
        }));
    const d = e === 'olb' && !r.some((u) => u.role === 'symbol'),
      p = e === 'dra' && !r.some((u) => u.role === 'footprint' || u.role === 'padstack'),
      f =
        (e === 'gds' || e === 'oas' || e === 'oasis') && !i && !r.some((u) => u.role === 'drawing');
    return (
      (d || p || f) &&
        s.push({
          level: 'warning',
          code: 'domain-candidates',
          message:
            e === 'olb'
              ? '未发现明确的元件符号候选，文件可能使用了私有二进制编码或需要专业工具导出 ASCII/XML 后再检查。'
              : e === 'dra'
                ? '未发现明确的封装、图形或 padstack 候选，文件可能使用了私有二进制数据库编码。'
                : e === 'gds'
                  ? '未发现明确的 GDSII 版图结构候选。文件可能不是标准 GDSII 二进制或使用了专有封装。'
                  : '未发现明确的 OASIS 版图结构候选。OASIS 完整几何浏览通常需要专业版图库或独立 WASM/TS 内核，当前前端包会安全展示头部、字符串、属性和二进制结构线索。',
        }),
      s
    );
  },
  We = (e, t, n, r, a, o, i, s) => {
    const d = a.reduce((b, g) => b + g.size, 0),
      p = It(a, t),
      f = _t(a),
      u = Mt(t, n, a, p, o, i, s);
    return {
      type: t,
      parser: n,
      title:
        t === 'olb'
          ? n === 'cfb'
            ? 'OrCAD Capture Symbol Library'
            : 'OLB Binary Library'
          : t === 'dra'
            ? n === 'cfb'
              ? 'OrCAD / Allegro Drawing Library'
              : 'DRA Binary Drawing'
            : `${t.toUpperCase()} Layout Structure`,
      byteLength: e.byteLength,
      streamCount: r,
      totalStreamBytes: d,
      streams: a,
      tree: Tt(a, t),
      entities: p,
      metadata: f,
      strings: o,
      warnings: i,
      diagnostics: u,
      stats: Nt(a, p, o, n, s),
      layout: s,
    };
  },
  Ft = async (e, t) => {
    const r = (
        await Qe(
          () => import('./cfb-sP5jJ_0U.js').then((d) => d.c),
          __vite__mapDeps([0, 1, 2, 3, 4]),
          import.meta.url,
        )
      ).parse(xe(e), { type: 'array' }),
      a = r.FileIndex.map((d, p) => ({ entry: d, path: r.FullPaths[p] || d.name }))
        .filter((d) => d.entry.type !== 5 && d.path !== '/' && d.entry.name)
        .slice(0, de),
      o = [],
      i = a.map(({ entry: d, path: p }) => {
        if (d.type === 1) return he(t, p, d.name, d.size || 0, 'storage');
        const f = yt(d.content || []);
        return (o.push(f), he(t, p, d.name, d.size || f.byteLength || 0, 'binary', f));
      }),
      s =
        a.length >= de
          ? [`仅展示前 ${de} 个 CFB 项，完整文件仍可下载后在专业 EDA 工具中打开。`]
          : [];
    return We(e, t, 'cfb', r.FileIndex.length, i, me(o), s);
  },
  _e = (e, t) => {
    const n = xe(e),
      r = he(t, `${t}.${t}`, `${t}.${t}`, e.byteLength, 'binary', n),
      a = t === 'gds' ? ot(n) : t === 'oas' || t === 'oasis' ? it(n) : void 0,
      o = t === 'oas' || t === 'oasis' ? dt(n) : void 0,
      i = a
        ? a.warnings
        : o
          ? o.warnings
          : ['该文件不是标准 CFB 容器，已退化为安全的二进制字符串索引预览。'];
    return We(e, t, 'binary', 1, [r], me([n]), i, a);
  },
  Ot = async (e, t = 'olb') => {
    const n = t === 'dra' ? 'dra' : t === 'gds' || t === 'oas' || t === 'oasis' ? t : 'olb',
      r = xe(e);
    if (!pt(r)) return _e(e, n);
    try {
      return await Ft(e, n);
    } catch (a) {
      const o = _e(e, n);
      return (
        o.warnings.unshift(a instanceof Error ? a.message : String(a)),
        o.diagnostics.unshift({
          level: 'warning',
          code: 'cfb-parse-failed',
          message: a instanceof Error ? a.message : String(a),
        }),
        o
      );
    }
  },
  Bt = {
    root: '根',
    library: '库',
    symbol: '元件符号',
    footprint: '封装',
    padstack: 'Padstack',
    drawing: '图纸',
    metadata: '元数据',
    property: '属性',
    geometry: '几何',
    net: '网络',
    unknown: '未知',
  },
  Xe = { high: '高', medium: '中', low: '低' },
  Dt = `
.eda-viewer{position:relative;height:100%;min-height:0;display:flex;flex-direction:column;background:#edf1f5;color:#172033;box-sizing:border-box}
.eda-viewer *{box-sizing:border-box}
.eda-header{min-height:84px;display:flex;align-items:center;justify-content:space-between;gap:18px;padding:18px 176px 18px 22px;border-bottom:1px solid rgba(23,32,51,.08);background:#fff}
.eda-header span,.eda-panel-head span{color:#0b7480;font-size:12px;font-weight:900;letter-spacing:0}
.eda-header h2{margin:4px 0 0;font-size:22px;line-height:1.2}
.eda-header dl{display:grid;grid-template-columns:repeat(4,minmax(70px,auto));gap:10px;margin:0}
.eda-header dt,.eda-header dd,.eda-entity-group dl,.eda-entity-group dt,.eda-entity-group dd{margin:0}
.eda-header dt{color:#718096;font-size:12px}
.eda-header dd{color:#172033;font-weight:900}
.eda-body{flex:1;min-height:0;display:grid;grid-template-columns:minmax(300px,32%) minmax(0,1fr)}
.eda-sidebar{min-height:0;display:flex;flex-direction:column;gap:12px;padding:16px;border-right:1px solid rgba(23,32,51,.08);background:rgba(255,255,255,.74)}
.eda-summary,.eda-warning,.eda-panel,.eda-error{border-radius:14px;background:#fff;box-shadow:inset 0 0 0 1px rgba(23,32,51,.06)}
.eda-summary,.eda-warning{padding:12px}
.eda-summary strong{display:block;color:#172033}
.eda-summary p,.eda-warning p,.eda-empty p,.eda-entity-group p{margin:6px 0 0;color:#64748b;line-height:1.55}
.eda-mini-grid,.eda-stat-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}
.eda-mini-grid div,.eda-stat-grid div{min-width:0;padding:10px;border-radius:12px;background:#fff;box-shadow:inset 0 0 0 1px rgba(23,32,51,.06)}
.eda-mini-grid span,.eda-stat-grid span{display:block;color:#718096;font-size:12px}
.eda-mini-grid strong,.eda-stat-grid strong{display:block;margin-top:4px;overflow:hidden;color:#172033;font-size:18px;text-overflow:ellipsis;white-space:nowrap}
.eda-warning{background:#fff7e8;color:#8a4b00}
.eda-search{height:42px;padding:0 12px;border-radius:12px;border:1px solid rgba(23,32,51,.1);outline:none;background:#fff;font:inherit}
.eda-stream-list{flex:1;min-height:0;overflow:auto;display:flex;flex-direction:column;gap:8px}
.eda-stream{min-height:78px;display:grid;grid-template-columns:74px minmax(0,1fr);gap:8px 10px;align-items:center;padding:10px;border:1px solid rgba(23,32,51,.08);border-radius:13px;background:#fff;color:inherit;font:inherit;text-align:left;cursor:pointer}
.eda-stream:hover,.eda-stream.active,.eda-tree button:hover,.eda-tree button.active,.eda-entity-group button:hover{border-color:rgba(11,116,128,.3);box-shadow:0 10px 22px rgba(23,32,51,.08)}
.eda-stream span{grid-row:span 3;min-height:40px;display:inline-flex;align-items:center;justify-content:center;padding:0 8px;border-radius:10px;background:rgba(11,116,128,.12);color:#0b7480;font-size:11px;font-weight:900}
.eda-stream span[data-role='symbol']{background:rgba(34,134,90,.14);color:#1d7a52}
.eda-stream span[data-role='footprint'],.eda-stream span[data-role='padstack']{background:rgba(111,87,190,.14);color:#5c47a5}
.eda-stream strong,.eda-stream em,.eda-tree strong,.eda-tree em,.eda-tree small,.eda-entity-group strong,.eda-entity-group span,.eda-entity-group dd{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.eda-stream em,.eda-stream small{color:#718096;font-size:12px;font-style:normal}
.eda-preview{min-width:0;min-height:0;overflow:auto;display:flex;flex-direction:column;gap:14px;padding:16px}
.eda-panel{min-height:0;overflow:hidden}
.eda-panel-head{min-height:54px;padding:12px 14px;border-bottom:1px solid rgba(23,32,51,.08)}
.eda-panel-head strong{display:block;margin-top:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.eda-panel--compact .eda-panel-head{min-height:auto}
.eda-stat-grid{padding:14px}
.eda-stat-grid div{background:#f6f9fb}
.eda-topology,.eda-bottom{min-height:300px;display:grid;grid-template-columns:minmax(0,.92fr) minmax(0,1.08fr);gap:14px}
.eda-topology>.eda-panel{min-height:360px;max-height:min(58vh,620px);display:flex;flex-direction:column}
.eda-tree,.eda-entities,.eda-diagnostics,.eda-string-grid{min-height:0;max-height:380px;overflow:auto;overscroll-behavior:contain}
.eda-tree{flex:1;max-height:none;padding:10px}
.eda-entities{flex:1;max-height:none;padding:12px}
.eda-tree button{width:100%;min-height:42px;display:grid;grid-template-columns:minmax(22px,auto) minmax(0,1fr) minmax(72px,auto) minmax(72px,auto);gap:8px;align-items:center;margin-bottom:6px;padding:8px;border:1px solid rgba(23,32,51,.06);border-radius:10px;background:#f8fafc;color:inherit;font:inherit;text-align:left;cursor:pointer}
.eda-tree span{color:#0b7480;font-weight:900}
.eda-tree em,.eda-tree small{color:#718096;font-size:12px;font-style:normal}
.eda-entity-group+.eda-entity-group{margin-top:16px}
.eda-entity-group h3{margin:0 0 8px;color:#172033;font-size:14px}
.eda-entity-group button{width:100%;display:block;margin-bottom:8px;padding:12px;border:1px solid rgba(23,32,51,.08);border-radius:12px;background:#f8fafc;color:inherit;font:inherit;text-align:left;cursor:pointer}
.eda-entity-group button>span{display:block;margin-top:4px;color:#718096;font-size:12px}
.eda-entity-group dl{display:grid;gap:6px;margin-top:10px}
.eda-entity-group dl div{min-width:0;display:grid;grid-template-columns:90px minmax(0,1fr);gap:8px;color:#475569;font-size:12px}
.eda-entity-group dt{color:#718096;font-weight:800}
.eda-selected-meta,.eda-property-grid,.eda-local-strings{display:flex;flex-wrap:wrap;gap:8px;padding:12px 14px 0}
.eda-selected-meta span,.eda-property-grid div,.eda-local-strings span{min-width:0;display:inline-flex;align-items:center;gap:6px;border-radius:999px;background:#eef6f7;color:#0b7480;font-size:12px;font-weight:800}
.eda-selected-meta span,.eda-local-strings span{padding:6px 10px}
.eda-property-grid div{max-width:100%;padding:6px 10px}
.eda-property-grid span{color:#64748b;font-weight:700}
.eda-property-grid strong{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.eda-panel pre{min-height:220px;max-height:440px;margin:12px 0 0;overflow:auto;padding:16px;border-top:1px solid rgba(23,32,51,.08);background:#101725;color:#d9e7ff;font-size:13px;line-height:1.6;white-space:pre-wrap;word-break:break-word}
.eda-layout-panel{min-height:360px;display:flex;flex-direction:column}
.eda-layout-meta{display:flex;flex-wrap:wrap;gap:8px;padding:12px 14px;border-bottom:1px solid rgba(23,32,51,.08)}
.eda-layout-meta span{border-radius:999px;padding:6px 10px;background:#eef6f7;color:#0b7480;font-size:12px;font-weight:800}
.eda-layout-canvas{flex:1;min-height:320px;overflow:auto;background:#111827}
.eda-layout-svg{display:block;min-width:860px;min-height:420px;background:#111827}
.eda-layout-webgl-wrap{position:relative;display:inline-block;min-width:860px;min-height:420px;background:#111827}
.eda-layout-webgl{display:block;background:#111827}
.eda-layout-label-layer{position:absolute;inset:0;pointer-events:none;overflow:hidden}
.eda-layout-label-layer span{position:absolute;max-width:220px;transform:translate(8px,-18px);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#d9f99d;text-shadow:0 1px 3px #020617;font:700 12px ui-sans-serif,system-ui,sans-serif}
.eda-layout-svg polygon{fill-opacity:.28;stroke-width:1.4;vector-effect:non-scaling-stroke}
.eda-layout-svg polyline{fill:none;stroke-width:2;vector-effect:non-scaling-stroke}
.eda-layout-svg circle{stroke-width:1.4;vector-effect:non-scaling-stroke}
.eda-layout-svg text{paint-order:stroke;stroke:#111827;stroke-width:3px;stroke-linejoin:round;font:700 13px ui-sans-serif,system-ui,sans-serif}
.eda-empty{min-height:180px;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;text-align:center}
.eda-string-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));align-content:start;gap:8px;padding:14px}
.eda-string-grid span{min-width:0;padding:8px 10px;border-radius:10px;background:#f6f9fb;color:#334155;font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.eda-diagnostics{padding:14px}
.eda-diagnostics p{margin:0 0 8px;padding:10px;border-radius:10px;background:#f6f9fb;color:#475569;line-height:1.5}
.eda-diagnostics p[data-level='warning']{background:#fff7e8;color:#8a4b00}
.eda-diagnostics span{display:inline-flex;margin-right:8px;color:#0b7480;font-size:11px;font-weight:900;text-transform:uppercase}
.eda-local-strings{padding-bottom:14px}
.eda-local-strings strong{width:100%;color:#172033;font-size:13px}
.eda-state{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:12px;background:rgba(237,241,245,.9);z-index:2}
.eda-state span{width:32px;height:32px;border-radius:999px;border:3px solid rgba(11,116,128,.16);border-top-color:#0b7480;animation:eda-spin .9s linear infinite}
.eda-error{position:absolute;right:18px;bottom:18px;width:min(440px,calc(100% - 36px));padding:14px;background:#fff7e8;color:#8a4b00;z-index:3}
@keyframes eda-spin{to{transform:rotate(360deg)}}
.file-viewer[data-viewer-theme='dark'] .eda-viewer{background:#172033;color:#e5eef8}
.file-viewer[data-viewer-theme='dark'] .eda-header,.file-viewer[data-viewer-theme='dark'] .eda-summary,.file-viewer[data-viewer-theme='dark'] .eda-panel,.file-viewer[data-viewer-theme='dark'] .eda-sidebar{background:#fff;color:#172033}
@media (prefers-color-scheme:dark){.file-viewer[data-viewer-theme='system'] .eda-viewer{background:#172033;color:#e5eef8}.file-viewer[data-viewer-theme='system'] .eda-header,.file-viewer[data-viewer-theme='system'] .eda-summary,.file-viewer[data-viewer-theme='system'] .eda-panel,.file-viewer[data-viewer-theme='system'] .eda-sidebar{background:#fff;color:#172033}}
@media (max-width:980px){.eda-header,.eda-body,.eda-topology,.eda-bottom{grid-template-columns:1fr}.eda-header{align-items:flex-start;flex-direction:column;padding-right:22px}.eda-body{display:flex;flex-direction:column}.eda-sidebar{max-height:42vh;border-right:0;border-bottom:1px solid rgba(23,32,51,.08)}}
@media (max-width:640px){.eda-header dl,.eda-mini-grid,.eda-stat-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.eda-tree button{grid-template-columns:minmax(22px,auto) minmax(0,1fr)}.eda-tree em,.eda-tree small{display:none}}
`,
  N = (e) => {
    if (!Number.isFinite(e) || e < 0) return '-';
    if (e < 1024) return `${e} B`;
    const t = e / 1024 / 1024;
    return t >= 1
      ? `${t.toFixed(t < 10 ? 1 : 0)} MB`
      : `${(e / 1024).toFixed(e < 10 * 1024 ? 1 : 0)} KB`;
  },
  le = (e) => Bt[e] || e,
  ce = (e) => (e === 'storage' ? '目录' : e === 'text' ? '文本' : '二进制'),
  M = (e) => e.replace(/^\/+/, '').toLowerCase(),
  Ve = (e, t = 0) => e.flatMap((n) => [{ ...n, depth: t }, ...Ve(n.children, t + 1)]),
  zt = () => {
    const e = document.createElement('style');
    return ((e.textContent = Dt), e);
  },
  l = (e, t, n) => {
    const r = document.createElement(e);
    return (t && (r.className = t), n !== void 0 && (r.textContent = n), r);
  },
  z = (e, t, n) => {
    const r = document.createElement('div');
    (r.append(l('dt', void 0, t), l('dd', void 0, n)), e.append(r));
  },
  O = (e, t, n) => {
    const r = l('div', 'eda-panel-head');
    (r.append(l('span', void 0, t), l('strong', void 0, n)), e.append(r));
  },
  Ut = 'http://www.w3.org/2000/svg',
  ge = ['#5eead4', '#93c5fd', '#c4b5fd', '#f9a8d4', '#fde68a', '#86efac', '#fdba74', '#67e8f9'],
  Gt = 360,
  Yt = 1800,
  Ne = 5,
  Wt = (e) => {
    const t = Number.isFinite(e.layer) ? Number(e.layer) : 0;
    return ge[Math.abs(t) % ge.length];
  },
  Xt = (e) => e.elements.reduce((t, n) => t + n.xy.length, 0),
  Vt = (e) => e.format === 'gdsii' && (e.elements.length >= Gt || Xt(e) >= Yt),
  Me = (e) =>
    Number.isFinite(e)
      ? Math.abs(Number(e)) < 0.001
        ? Number(e).toExponential(2)
        : String(e)
      : '-',
  F = (e, t) => {
    const n = document.createElementNS(Ut, e);
    return (
      Object.entries(t).forEach(([r, a]) => {
        n.setAttribute(r, String(a));
      }),
      n
    );
  },
  Fe = (e, t, n) => {
    const r = e.createShader(t);
    return r
      ? (e.shaderSource(r, n),
        e.compileShader(r),
        e.getShaderParameter(r, e.COMPILE_STATUS) ? r : (e.deleteShader(r), null))
      : null;
  },
  Ht = (e) => {
    const t = Fe(
        e,
        e.VERTEX_SHADER,
        `
    attribute vec2 a_position;
    attribute vec3 a_color;
    varying vec3 v_color;
    void main() {
      gl_Position = vec4(a_position, 0.0, 1.0);
      gl_PointSize = 5.0;
      v_color = a_color;
    }
  `,
      ),
      n = Fe(
        e,
        e.FRAGMENT_SHADER,
        `
    precision mediump float;
    varying vec3 v_color;
    uniform float u_alpha;
    void main() {
      gl_FragColor = vec4(v_color, u_alpha);
    }
  `,
      );
    if (!t || !n) return null;
    const r = e.createProgram();
    return r
      ? (e.attachShader(r, t),
        e.attachShader(r, n),
        e.linkProgram(r),
        e.deleteShader(t),
        e.deleteShader(n),
        e.getProgramParameter(r, e.LINK_STATUS) ? r : (e.deleteProgram(r), null))
      : null;
  },
  pe = (e, t, n, r, a) => {
    if (!n.length) return;
    const o = e.createBuffer();
    if (!o) return;
    const i = Ne * Float32Array.BYTES_PER_ELEMENT,
      s = e.getAttribLocation(t, 'a_position'),
      d = e.getAttribLocation(t, 'a_color'),
      p = e.getUniformLocation(t, 'u_alpha');
    if (s < 0 || d < 0 || !p) {
      e.deleteBuffer(o);
      return;
    }
    (e.bindBuffer(e.ARRAY_BUFFER, o),
      e.bufferData(e.ARRAY_BUFFER, n, e.STATIC_DRAW),
      e.enableVertexAttribArray(s),
      e.vertexAttribPointer(s, 2, e.FLOAT, !1, i, 0),
      e.enableVertexAttribArray(d),
      e.vertexAttribPointer(d, 3, e.FLOAT, !1, i, 2 * Float32Array.BYTES_PER_ELEMENT),
      e.uniform1f(p, a),
      e.drawArrays(r, 0, n.length / Ne),
      e.deleteBuffer(o));
  },
  jt = (e, t, n, r) => {
    const a = Ht(e);
    return a
      ? (e.viewport(0, 0, n, r),
        e.clearColor(0.066, 0.094, 0.153, 1),
        e.clear(e.COLOR_BUFFER_BIT),
        e.useProgram(a),
        e.enable(e.BLEND),
        e.blendFunc(e.SRC_ALPHA, e.ONE_MINUS_SRC_ALPHA),
        pe(e, a, t.triangleVertices, e.TRIANGLES, 0.32),
        pe(e, a, t.lineVertices, e.LINES, 0.92),
        pe(e, a, t.pointVertices, e.POINTS, 0.98),
        e.deleteProgram(a),
        !0)
      : !1;
  },
  Kt = (e, t, n) => {
    const r = st(e, { palette: ge }),
      a = Math.min(window.devicePixelRatio || 1, 2),
      o = l('div', 'eda-layout-webgl-wrap');
    ((o.style.width = `${t}px`), (o.style.height = `${n}px`));
    const i = document.createElement('canvas');
    ((i.className = 'eda-layout-webgl'),
      (i.width = Math.max(1, Math.round(t * a))),
      (i.height = Math.max(1, Math.round(n * a))),
      (i.style.width = `${t}px`),
      (i.style.height = `${n}px`));
    const s =
      i.getContext('webgl', { alpha: !1, antialias: !0, preserveDrawingBuffer: !0 }) ||
      i.getContext('experimental-webgl');
    if (!s || !jt(s, r, i.width, i.height)) return null;
    if (r.labels.length) {
      const d = l('div', 'eda-layout-label-layer');
      (r.labels.forEach((p) => {
        const f = l('span', void 0, p.text);
        ((f.title = p.text),
          (f.style.left = `${((p.clipX + 1) / 2) * t}px`),
          (f.style.top = `${((1 - p.clipY) / 2) * n}px`),
          d.append(f));
      }),
        o.append(i, d));
    } else o.append(i);
    return { element: o, batch: r };
  },
  Zt = (e) => {
    const t = l('section', 'eda-panel eda-layout-panel'),
      n = e.format === 'oasis' ? 'OASIS' : 'GDSII';
    O(
      t,
      '版图预览',
      `${n} · ${e.structureCount || e.structures.length} structures · ${e.elements.length} elements`,
    );
    const r = l('div', 'eda-layout-meta');
    if (
      ([
        `Library: ${e.libraryName || '-'}`,
        `User unit: ${Me(e.userUnit)}`,
        `DB unit: ${Me(e.databaseUnit)}`,
      ].forEach((y) => r.append(l('span', void 0, y))),
      t.append(r),
      !e.bounds || !e.elements.length)
    )
      return (
        t.append(
          K(
            '没有可绘制几何',
            `已读取 ${n} 头部和 structure 信息，但未发现 boundary、path、text 或 reference 元素。`,
          ),
        ),
        t
      );
    const a = e.bounds,
      o = Math.max(1, a.maxX - a.minX),
      i = Math.max(1, a.maxY - a.minY),
      s = 1200,
      d = Math.max(460, Math.min(1100, Math.round((s * i) / o))),
      p = 40,
      f = Math.min((s - p * 2) / o, (d - p * 2) / i),
      u = Math.max(860, Math.round(o * f + p * 2)),
      b = Math.max(420, Math.round(i * f + p * 2)),
      g = (y) => ({ x: (y.x - a.minX) * f + p, y: (a.maxY - y.y) * f + p }),
      x = (y) =>
        y
          .map((P) => {
            const E = g(P);
            return `${E.x.toFixed(2)},${E.y.toFixed(2)}`;
          })
          .join(' '),
      c = l('div', 'eda-layout-canvas'),
      A = Vt(e) ? Kt(e, u, b) : null;
    if (A)
      return (
        r.append(l('span', void 0, `Renderer: WebGL · ${A.batch.elementCount} elements`)),
        A.batch.warnings.forEach((y) => {
          const P = l('div', 'eda-warning');
          (P.append(l('p', void 0, y)), t.append(P));
        }),
        c.append(A.element),
        t.append(c),
        t
      );
    r.append(l('span', void 0, 'Renderer: SVG'));
    const k = F('svg', {
      class: 'eda-layout-svg',
      width: u,
      height: b,
      viewBox: `0 0 ${u} ${b}`,
      role: 'img',
      'aria-label': `${n} layout preview`,
    });
    return (
      k.append(F('rect', { x: 0, y: 0, width: u, height: b, fill: '#111827' })),
      e.elements.forEach((y) => {
        const P = Wt(y);
        if ((y.kind === 'boundary' || y.kind === 'aref') && y.xy.length >= 3) {
          k.append(F('polygon', { points: x(y.xy), fill: P, stroke: P }));
          return;
        }
        if (y.kind === 'path' && y.xy.length >= 2) {
          const T = Math.max(1.4, Math.min(10, (y.width || o / 500) * f));
          k.append(F('polyline', { points: x(y.xy), stroke: P, 'stroke-width': T }));
          return;
        }
        const E = y.xy[0];
        if (!E) return;
        const L = g(E);
        k.append(F('circle', { cx: L.x, cy: L.y, r: 4.5, fill: '#111827', stroke: P }));
        const w = y.text || y.reference || y.kind.toUpperCase();
        if (w) {
          const T = F('text', { x: L.x + 8, y: L.y - 8, fill: P });
          (T.append(document.createTextNode(w)), k.append(T));
        }
      }),
      c.append(k),
      t.append(c),
      t
    );
  },
  qt = (e) => {
    const t = e.stats;
    return [
      { label: '文本流', value: t.textStreams },
      { label: '二进制流', value: t.binaryStreams },
      { label: '目录', value: t.storageEntries },
      { label: '属性', value: t.propertyCount },
      { label: '符号', value: t.symbolCount },
      { label: '封装', value: t.footprintCount },
      { label: 'Padstack', value: t.padstackCount },
      { label: '可信度', value: Xe[t.confidence] },
    ];
  },
  Qt = (e) => {
    const t = [
      { role: 'symbol', label: '元件符号', items: [] },
      { role: 'footprint', label: '封装图形', items: [] },
      { role: 'padstack', label: 'Padstack', items: [] },
      { role: 'drawing', label: '图纸信息', items: [] },
    ];
    return (
      t.forEach((n) => {
        n.items = e.filter((r) => r.role === n.role);
      }),
      t.filter((n) => n.items.length)
    );
  },
  Oe = (e, t, n) => {
    const r = l('div', n);
    (t.forEach((a) => {
      const o = document.createElement('div');
      (o.append(l('span', void 0, a.label), l('strong', void 0, String(a.value))), r.append(o));
    }),
      e.append(r));
  },
  K = (e, t) => {
    const n = l('div', 'eda-empty');
    return (n.append(l('strong', void 0, e), l('p', void 0, t)), n);
  };
async function nn(e, t, n = 'olb', r) {
  const a = ['dra', 'gds', 'oas', 'oasis'].includes(n) ? n : 'olb',
    o = r?.filename || `preview.${a}`,
    i = l('section', 'eda-viewer'),
    s = zt(),
    d = [];
  let p = null;
  t.replaceChildren(s, i);
  const f = (c, A, k) => {
      (c.addEventListener(A, k), d.push(() => c.removeEventListener(A, k)));
    },
    u = () => {
      const c = l('div', 'eda-state');
      return (
        c.append(l('span'), l('strong', void 0, `正在解析 ${a.toUpperCase()}...`)),
        i.append(c),
        c
      );
    },
    b = (c) => {
      const A = l('div', 'eda-error');
      (A.append(l('strong', void 0, 'EDA 预览提示'), l('p', void 0, c)), i.append(A));
    },
    g = (c) => {
      p =
        c.streams.find((h) => h.properties.length) ||
        c.streams.find((h) => h.kind === 'text') ||
        c.streams[0] ||
        null;
      const A = qt(c),
        k = Ve(c.tree),
        y = Qt(c.entities);
      i.replaceChildren();
      const P = l('header', 'eda-header'),
        E = document.createElement('div');
      E.append(
        l('span', void 0, c.parser === 'cfb' ? 'CFB STRUCTURE VIEWER' : 'BINARY STRUCTURE VIEWER'),
        l('h2', void 0, o),
      );
      const L = document.createElement('dl');
      (z(L, '格式', c.type.toUpperCase()),
        z(L, '大小', N(c.byteLength)),
        z(L, '条目', String(c.streamCount)),
        z(L, '可信度', Xe[c.stats.confidence]),
        P.append(E, L));
      const w = l('div', 'eda-body'),
        T = l('aside', 'eda-sidebar'),
        B = l('div', 'eda-summary');
      if (
        (B.append(
          l('strong', void 0, c.title),
          l(
            'p',
            void 0,
            c.type === 'gds' || c.type === 'oas' || c.type === 'oasis'
              ? c.layout
                ? `${c.layout.format === 'oasis' ? 'OASIS' : 'GDSII'} 属于芯片版图工程文件。预览器已在浏览器端解析可识别几何，小图生成 SVG，大图自动切换 WebGL canvas，同时保留结构、字符串和诊断索引。`
                : 'GDSII / OASIS 属于芯片版图工程文件。预览器优先索引结构、属性、可读字符串和二进制线索，并在纯前端安全退化。'
              : 'OLB / DRA 属于 OrCAD / Allegro 生态的私有设计数据。预览器优先解析 CFB 结构、对象候选、属性和可读文本，并在纯前端安全退化。',
          ),
        ),
        T.append(B),
        Oe(T, A.slice(0, 4), 'eda-mini-grid'),
        c.warnings.length)
      ) {
        const h = l('div', 'eda-warning');
        (c.warnings.forEach((m) => h.append(l('p', void 0, m))), T.append(h));
      }
      const S = l('input', 'eda-search');
      ((S.type = 'search'), (S.placeholder = '筛选路径、角色、属性或文本'), T.append(S));
      const Z = l('div', 'eda-stream-list'),
        q = l('main', 'eda-preview');
      let Q = [];
      const be = l('section', 'eda-panel'),
        ye = l('div', 'eda-panel-head'),
        He = l('span', void 0, '当前条目'),
        we = l('strong', void 0, '未选择');
      ye.append(He, we);
      const J = l('div', 'eda-selected-meta'),
        ee = l('div', 'eda-property-grid'),
        D = document.createElement('div');
      be.append(ye, J, ee, D);
      const Y = l('div', 'eda-local-strings'),
        ve = () => {
          if (
            (Q.forEach(({ path: m, button: v }) => {
              v.classList.toggle('active', M(m) === M(p?.path || ''));
            }),
            (we.textContent = p?.path || '未选择'),
            J.replaceChildren(),
            ee.replaceChildren(),
            D.replaceChildren(),
            Y.replaceChildren(),
            !p)
          ) {
            D.append(K('目录条目', '该节点用于组织下级流，没有可直接展示的文本或十六进制片段。'));
            return;
          }
          (J.append(
            l('span', void 0, le(p.role)),
            l('span', void 0, ce(p.kind)),
            l('span', void 0, N(p.size)),
          ),
            p.properties.forEach((m) => {
              const v = document.createElement('div');
              (v.append(l('span', void 0, m.key), l('strong', void 0, m.value)), ee.append(v));
            }));
          const h = p.sample || p.hex || '';
          (h
            ? D.append(l('pre', void 0, h))
            : D.append(K('目录条目', '该节点用于组织下级流，没有可直接展示的文本或十六进制片段。')),
            p.strings.length &&
              (Y.append(l('strong', void 0, '当前条目字符串')),
              p.strings.forEach((m) => Y.append(l('span', void 0, m)))));
        },
        te = (h) => {
          ((p = h), ve());
        },
        je = (h) => {
          const m = M(h.path),
            v = c.streams.find(($) => M($.path) === m);
          v && te(v);
        },
        Ke = (h) => {
          const m = M(h.path),
            v = c.streams.find(($) => {
              const R = M($.path);
              return R === m || R.startsWith(`${m}/`);
            });
          v && te(v);
        },
        Ze = (h, m) => {
          if (!m) return !0;
          const v = h.properties.map((R) => `${R.key}=${R.value}`).join(`
`);
          return `${h.path}
${h.name}
${h.kind}
${h.role}
${h.sample || ''}
${h.strings.join(`
`)}
${v}`
            .toLowerCase()
            .includes(m);
        },
        Ee = () => {
          const h = S.value.trim().toLowerCase();
          (Z.replaceChildren(),
            (Q = []),
            c.streams
              .filter((m) => Ze(m, h))
              .forEach((m) => {
                const v = l('button', 'eda-stream');
                v.type = 'button';
                const $ = l('span', void 0, le(m.role));
                (($.dataset.role = m.role),
                  v.append(
                    $,
                    l('strong', void 0, m.name || m.path),
                    l('em', void 0, m.path),
                    l('small', void 0, `${ce(m.kind)} · ${N(m.size)}`),
                  ),
                  f(v, 'click', () => te(m)),
                  Q.push({ path: m.path, button: v }),
                  Z.append(v));
              }),
            ve());
        };
      (f(S, 'input', Ee), T.append(Z));
      const ne = l('section', 'eda-panel eda-panel--compact');
      (O(ne, '解析概览', `${c.parser.toUpperCase()} · ${N(c.totalStreamBytes)}`),
        Oe(ne, A, 'eda-stat-grid'));
      const Se = l('section', 'eda-topology'),
        re = l('div', 'eda-panel');
      O(re, '结构树', `${k.length} 节点`);
      const ke = l('div', 'eda-tree');
      (k.forEach((h) => {
        const m = l('button');
        m.type = 'button';
        const v = l('span', void 0, h.children.length ? '▸' : '•');
        ((v.style.paddingLeft = `${h.depth * 14}px`),
          m.append(
            v,
            l('strong', void 0, h.name),
            l('em', void 0, le(h.role)),
            l('small', void 0, h.size ? N(h.size) : ce(h.kind)),
          ),
          f(m, 'click', () => je(h)),
          ke.append(m));
      }),
        re.append(ke));
      const W = l('div', 'eda-panel');
      if ((O(W, 'EDA 对象', `${c.entities.length} 项`), y.length)) {
        const h = l('div', 'eda-entities');
        (y.forEach((m) => {
          const v = l('div', 'eda-entity-group');
          (v.append(l('h3', void 0, m.label)),
            m.items.forEach(($) => {
              const R = l('button');
              ((R.type = 'button'),
                R.append(
                  l('strong', void 0, $.name),
                  l('span', void 0, `${N($.byteLength)} · ${$.streamCount} 条目`),
                ),
                $.description && R.append(l('p', void 0, $.description)));
              const Ce = document.createElement('dl'),
                X = (qe, ie) => {
                  const $e = Array.isArray(ie) ? ie.join(', ') : ie;
                  $e && z(Ce, qe, $e);
                };
              (X('Footprint', $.footprint),
                X('Pins', $.pins),
                X('Layers', $.layers),
                X('Keywords', $.keywords),
                R.append(Ce),
                f(R, 'click', () => Ke($)),
                v.append(R));
            }),
            h.append(v));
        }),
          W.append(h));
      } else W.append(K('没有明确对象候选', '仍可从结构树、属性和字符串索引中查看可读内容。'));
      Se.append(re, W);
      const Le = l('section', 'eda-bottom'),
        ae = l('div', 'eda-panel');
      O(ae, '可读字符串', `${c.strings.length} 项`);
      const Ae = l('div', 'eda-string-grid');
      (c.strings.forEach((h) => Ae.append(l('span', void 0, h))), ae.append(Ae));
      const oe = l('div', 'eda-panel');
      O(oe, '诊断', `${c.diagnostics.length} 条`);
      const Te = l('div', 'eda-diagnostics');
      (c.diagnostics.forEach((h) => {
        const m = l('p');
        ((m.dataset.level = h.level),
          m.append(l('span', void 0, h.level), document.createTextNode(h.message)),
          Te.append(m));
      }),
        oe.append(Te, Y),
        Le.append(ae, oe),
        c.layout && q.append(Zt(c.layout)),
        q.append(ne, Se, be, Le),
        w.append(T, q),
        i.append(P, w),
        Ee());
    },
    x = u();
  try {
    const c = await Ot(e, a);
    g(c);
  } catch (c) {
    (console.error(c), i.replaceChildren(), b(c instanceof Error ? c.message : String(c)));
  } finally {
    x.remove();
  }
  return {
    $el: i,
    unmount() {
      (d.splice(0).forEach((c) => c()), (p = null), t.replaceChildren());
    },
  };
}
export { nn as default };
