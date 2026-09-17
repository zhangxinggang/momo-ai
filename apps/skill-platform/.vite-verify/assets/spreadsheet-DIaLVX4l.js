const __vite__mapDeps = (
  i,
  m = __vite__mapDeps,
  d = m.f ||
    (m.f = [
      './parser-Cx5tkEO4.js',
      './markdown-vendor-DldLOD9R.js',
      './ui-vendor-C-FKu2uc.js',
      './markdown-it-vendor-DL4wSELR.js',
      './markdown-vendor-CmuYMs8x.css',
      './assets-Cqo46k_X.js',
      './index-C2avURFS.js',
      './icons-B5Lu0sqU.js',
      './index-DUUm-ELF.css',
      './worker-DJ__aWVE.js',
    ]),
) => i.map((i) => d[i]);
import { q as Or } from './assets-Cqo46k_X.js';
import { aQ as Hr, b5 as Nr, ad as Wr } from './index-C2avURFS.js';
import { _ as Vt } from './markdown-vendor-DldLOD9R.js';
import { c as Fr } from './worker-DJ__aWVE.js';
const V = 500,
  Mt = 3,
  yt = 1,
  Ut = '__index',
  Gt = '__k',
  Fe = '__s',
  qe = { rowHeight: 20, colWidth: 64 },
  Q = { Placeholder: 0, Loading: 1, Loaded: 2 },
  Ye = () => ({
    active: !1,
    totalRows: 0,
    totalCols: 0,
    indexOffset: 0,
    defaults: { ...qe },
    dataKeys: [],
    rows: [],
    columns: [],
    cellCache: new Map(),
    mergeStartMap: new Map(),
    mergeCoveredMap: new Map(),
    rowHeightCache: new Map(),
    windowRows: new Map(),
    windowCells: new Map(),
    loadedWindows: new Set(),
    loadingWindows: new Set(),
  }),
  Z = (e, t) => `${e}-${t}`,
  ot = (e) => `c${e}`,
  Xe = (e) => {
    var t;
    return (t = e?.[Fe]) !== null && t !== void 0 ? t : Q.Placeholder;
  },
  Dr = (e) => {
    const t = new Array(e);
    for (let r = 0; r < e; r += 1) t[r] = { [Gt]: `${r}`, [Fe]: Q.Placeholder };
    return t;
  },
  Ir = (e) => (e ? Math.floor(Math.max(e - 1, 0) / V) * V : 0),
  He = (e = 0, t = 0) => Math.min(Math.max(e, 0), Ir(t)),
  At = (e = 0, t = 0) => {
    const r = Math.floor(Math.max(e, 0) / V) * V;
    return He(r, t);
  },
  Br = ({ startRow: e, endRow: t, direction: r, totalRows: n, far: i = !1 }) => {
    const o = new Set(),
      l = At(e, n),
      d = At(t, n);
    for (let p = l; p <= d; p += V) o.add(p);
    const c = i ? Mt + 1 : Mt,
      v = i ? yt + 1 : yt,
      E = r > 0 ? d : l;
    for (let p = 1; p <= c; p += 1) o.add(He(E + r * p * V, n));
    for (let p = 1; p <= v; p += 1) o.add(He(E - r * p * V, n));
    return Array.from(o);
  },
  St = (e, t, r, n) => {
    const i = Math.min(r + V, t);
    for (let o = r; o < i; o += 1) {
      const l = e[o];
      l && (l[Fe] = n);
    }
  };
function Ne(e) {
  '@babel/helpers - typeof';
  return (
    (Ne =
      typeof Symbol == 'function' && typeof Symbol.iterator == 'symbol'
        ? function (t) {
            return typeof t;
          }
        : function (t) {
            return t &&
              typeof Symbol == 'function' &&
              t.constructor === Symbol &&
              t !== Symbol.prototype
              ? 'symbol'
              : typeof t;
          }),
    Ne(e)
  );
}
var $r = /^\s+/,
  zr = /\s+$/;
function f(e, t) {
  if (((e = e || ''), (t = t || {}), e instanceof f)) return e;
  if (!(this instanceof f)) return new f(e, t);
  var r = Pr(e);
  ((this._originalInput = e),
    (this._r = r.r),
    (this._g = r.g),
    (this._b = r.b),
    (this._a = r.a),
    (this._roundA = Math.round(100 * this._a) / 100),
    (this._format = t.format || r.format),
    (this._gradientType = t.gradientType),
    this._r < 1 && (this._r = Math.round(this._r)),
    this._g < 1 && (this._g = Math.round(this._g)),
    this._b < 1 && (this._b = Math.round(this._b)),
    (this._ok = r.ok));
}
f.prototype = {
  isDark: function () {
    return this.getBrightness() < 128;
  },
  isLight: function () {
    return !this.isDark();
  },
  isValid: function () {
    return this._ok;
  },
  getOriginalInput: function () {
    return this._originalInput;
  },
  getFormat: function () {
    return this._format;
  },
  getAlpha: function () {
    return this._a;
  },
  getBrightness: function () {
    var t = this.toRgb();
    return (t.r * 299 + t.g * 587 + t.b * 114) / 1e3;
  },
  getLuminance: function () {
    var t = this.toRgb(),
      r,
      n,
      i,
      o,
      l,
      d;
    return (
      (r = t.r / 255),
      (n = t.g / 255),
      (i = t.b / 255),
      r <= 0.03928 ? (o = r / 12.92) : (o = Math.pow((r + 0.055) / 1.055, 2.4)),
      n <= 0.03928 ? (l = n / 12.92) : (l = Math.pow((n + 0.055) / 1.055, 2.4)),
      i <= 0.03928 ? (d = i / 12.92) : (d = Math.pow((i + 0.055) / 1.055, 2.4)),
      0.2126 * o + 0.7152 * l + 0.0722 * d
    );
  },
  setAlpha: function (t) {
    return ((this._a = Yt(t)), (this._roundA = Math.round(100 * this._a) / 100), this);
  },
  toHsv: function () {
    var t = Tt(this._r, this._g, this._b);
    return { h: t.h * 360, s: t.s, v: t.v, a: this._a };
  },
  toHsvString: function () {
    var t = Tt(this._r, this._g, this._b),
      r = Math.round(t.h * 360),
      n = Math.round(t.s * 100),
      i = Math.round(t.v * 100);
    return this._a == 1
      ? 'hsv(' + r + ', ' + n + '%, ' + i + '%)'
      : 'hsva(' + r + ', ' + n + '%, ' + i + '%, ' + this._roundA + ')';
  },
  toHsl: function () {
    var t = Lt(this._r, this._g, this._b);
    return { h: t.h * 360, s: t.s, l: t.l, a: this._a };
  },
  toHslString: function () {
    var t = Lt(this._r, this._g, this._b),
      r = Math.round(t.h * 360),
      n = Math.round(t.s * 100),
      i = Math.round(t.l * 100);
    return this._a == 1
      ? 'hsl(' + r + ', ' + n + '%, ' + i + '%)'
      : 'hsla(' + r + ', ' + n + '%, ' + i + '%, ' + this._roundA + ')';
  },
  toHex: function (t) {
    return kt(this._r, this._g, this._b, t);
  },
  toHexString: function (t) {
    return '#' + this.toHex(t);
  },
  toHex8: function (t) {
    return Yr(this._r, this._g, this._b, this._a, t);
  },
  toHex8String: function (t) {
    return '#' + this.toHex8(t);
  },
  toRgb: function () {
    return { r: Math.round(this._r), g: Math.round(this._g), b: Math.round(this._b), a: this._a };
  },
  toRgbString: function () {
    return this._a == 1
      ? 'rgb(' + Math.round(this._r) + ', ' + Math.round(this._g) + ', ' + Math.round(this._b) + ')'
      : 'rgba(' +
          Math.round(this._r) +
          ', ' +
          Math.round(this._g) +
          ', ' +
          Math.round(this._b) +
          ', ' +
          this._roundA +
          ')';
  },
  toPercentageRgb: function () {
    return {
      r: Math.round(_(this._r, 255) * 100) + '%',
      g: Math.round(_(this._g, 255) * 100) + '%',
      b: Math.round(_(this._b, 255) * 100) + '%',
      a: this._a,
    };
  },
  toPercentageRgbString: function () {
    return this._a == 1
      ? 'rgb(' +
          Math.round(_(this._r, 255) * 100) +
          '%, ' +
          Math.round(_(this._g, 255) * 100) +
          '%, ' +
          Math.round(_(this._b, 255) * 100) +
          '%)'
      : 'rgba(' +
          Math.round(_(this._r, 255) * 100) +
          '%, ' +
          Math.round(_(this._g, 255) * 100) +
          '%, ' +
          Math.round(_(this._b, 255) * 100) +
          '%, ' +
          this._roundA +
          ')';
  },
  toName: function () {
    return this._a === 0
      ? 'transparent'
      : this._a < 1
        ? !1
        : on[kt(this._r, this._g, this._b, !0)] || !1;
  },
  toFilter: function (t) {
    var r = '#' + Ot(this._r, this._g, this._b, this._a),
      n = r,
      i = this._gradientType ? 'GradientType = 1, ' : '';
    if (t) {
      var o = f(t);
      n = '#' + Ot(o._r, o._g, o._b, o._a);
    }
    return (
      'progid:DXImageTransform.Microsoft.gradient(' +
      i +
      'startColorstr=' +
      r +
      ',endColorstr=' +
      n +
      ')'
    );
  },
  toString: function (t) {
    var r = !!t;
    t = t || this._format;
    var n = !1,
      i = this._a < 1 && this._a >= 0,
      o =
        !r &&
        i &&
        (t === 'hex' ||
          t === 'hex6' ||
          t === 'hex3' ||
          t === 'hex4' ||
          t === 'hex8' ||
          t === 'name');
    return o
      ? t === 'name' && this._a === 0
        ? this.toName()
        : this.toRgbString()
      : (t === 'rgb' && (n = this.toRgbString()),
        t === 'prgb' && (n = this.toPercentageRgbString()),
        (t === 'hex' || t === 'hex6') && (n = this.toHexString()),
        t === 'hex3' && (n = this.toHexString(!0)),
        t === 'hex4' && (n = this.toHex8String(!0)),
        t === 'hex8' && (n = this.toHex8String()),
        t === 'name' && (n = this.toName()),
        t === 'hsl' && (n = this.toHslString()),
        t === 'hsv' && (n = this.toHsvString()),
        n || this.toHexString());
  },
  clone: function () {
    return f(this.toString());
  },
  _applyModification: function (t, r) {
    var n = t.apply(null, [this].concat([].slice.call(r)));
    return ((this._r = n._r), (this._g = n._g), (this._b = n._b), this.setAlpha(n._a), this);
  },
  lighten: function () {
    return this._applyModification(Kr, arguments);
  },
  brighten: function () {
    return this._applyModification(qr, arguments);
  },
  darken: function () {
    return this._applyModification(Jr, arguments);
  },
  desaturate: function () {
    return this._applyModification(Xr, arguments);
  },
  saturate: function () {
    return this._applyModification(jr, arguments);
  },
  greyscale: function () {
    return this._applyModification(Zr, arguments);
  },
  spin: function () {
    return this._applyModification(Qr, arguments);
  },
  _applyCombination: function (t, r) {
    return t.apply(null, [this].concat([].slice.call(r)));
  },
  analogous: function () {
    return this._applyCombination(rn, arguments);
  },
  complement: function () {
    return this._applyCombination(en, arguments);
  },
  monochromatic: function () {
    return this._applyCombination(nn, arguments);
  },
  splitcomplement: function () {
    return this._applyCombination(tn, arguments);
  },
  triad: function () {
    return this._applyCombination(Ht, [3]);
  },
  tetrad: function () {
    return this._applyCombination(Ht, [4]);
  },
};
f.fromRatio = function (e, t) {
  if (Ne(e) == 'object') {
    var r = {};
    for (var n in e) e.hasOwnProperty(n) && (n === 'a' ? (r[n] = e[n]) : (r[n] = ge(e[n])));
    e = r;
  }
  return f(e, t);
};
function Pr(e) {
  var t = { r: 0, g: 0, b: 0 },
    r = 1,
    n = null,
    i = null,
    o = null,
    l = !1,
    d = !1;
  return (
    typeof e == 'string' && (e = dn(e)),
    Ne(e) == 'object' &&
      (j(e.r) && j(e.g) && j(e.b)
        ? ((t = Vr(e.r, e.g, e.b)), (l = !0), (d = String(e.r).substr(-1) === '%' ? 'prgb' : 'rgb'))
        : j(e.h) && j(e.s) && j(e.v)
          ? ((n = ge(e.s)), (i = ge(e.v)), (t = Gr(e.h, n, i)), (l = !0), (d = 'hsv'))
          : j(e.h) &&
            j(e.s) &&
            j(e.l) &&
            ((n = ge(e.s)), (o = ge(e.l)), (t = Ur(e.h, n, o)), (l = !0), (d = 'hsl')),
      e.hasOwnProperty('a') && (r = e.a)),
    (r = Yt(r)),
    {
      ok: l,
      format: e.format || d,
      r: Math.min(255, Math.max(t.r, 0)),
      g: Math.min(255, Math.max(t.g, 0)),
      b: Math.min(255, Math.max(t.b, 0)),
      a: r,
    }
  );
}
function Vr(e, t, r) {
  return { r: _(e, 255) * 255, g: _(t, 255) * 255, b: _(r, 255) * 255 };
}
function Lt(e, t, r) {
  ((e = _(e, 255)), (t = _(t, 255)), (r = _(r, 255)));
  var n = Math.max(e, t, r),
    i = Math.min(e, t, r),
    o,
    l,
    d = (n + i) / 2;
  if (n == i) o = l = 0;
  else {
    var c = n - i;
    switch (((l = d > 0.5 ? c / (2 - n - i) : c / (n + i)), n)) {
      case e:
        o = (t - r) / c + (t < r ? 6 : 0);
        break;
      case t:
        o = (r - e) / c + 2;
        break;
      case r:
        o = (e - t) / c + 4;
        break;
    }
    o /= 6;
  }
  return { h: o, s: l, l: d };
}
function Ur(e, t, r) {
  var n, i, o;
  ((e = _(e, 360)), (t = _(t, 100)), (r = _(r, 100)));
  function l(v, E, p) {
    return (
      p < 0 && (p += 1),
      p > 1 && (p -= 1),
      p < 1 / 6
        ? v + (E - v) * 6 * p
        : p < 1 / 2
          ? E
          : p < 2 / 3
            ? v + (E - v) * (2 / 3 - p) * 6
            : v
    );
  }
  if (t === 0) n = i = o = r;
  else {
    var d = r < 0.5 ? r * (1 + t) : r + t - r * t,
      c = 2 * r - d;
    ((n = l(c, d, e + 1 / 3)), (i = l(c, d, e)), (o = l(c, d, e - 1 / 3)));
  }
  return { r: n * 255, g: i * 255, b: o * 255 };
}
function Tt(e, t, r) {
  ((e = _(e, 255)), (t = _(t, 255)), (r = _(r, 255)));
  var n = Math.max(e, t, r),
    i = Math.min(e, t, r),
    o,
    l,
    d = n,
    c = n - i;
  if (((l = n === 0 ? 0 : c / n), n == i)) o = 0;
  else {
    switch (n) {
      case e:
        o = (t - r) / c + (t < r ? 6 : 0);
        break;
      case t:
        o = (r - e) / c + 2;
        break;
      case r:
        o = (e - t) / c + 4;
        break;
    }
    o /= 6;
  }
  return { h: o, s: l, v: d };
}
function Gr(e, t, r) {
  ((e = _(e, 360) * 6), (t = _(t, 100)), (r = _(r, 100)));
  var n = Math.floor(e),
    i = e - n,
    o = r * (1 - t),
    l = r * (1 - i * t),
    d = r * (1 - (1 - i) * t),
    c = n % 6,
    v = [r, l, o, o, d, r][c],
    E = [d, r, r, l, o, o][c],
    p = [o, o, d, r, r, l][c];
  return { r: v * 255, g: E * 255, b: p * 255 };
}
function kt(e, t, r, n) {
  var i = [
    I(Math.round(e).toString(16)),
    I(Math.round(t).toString(16)),
    I(Math.round(r).toString(16)),
  ];
  return n &&
    i[0].charAt(0) == i[0].charAt(1) &&
    i[1].charAt(0) == i[1].charAt(1) &&
    i[2].charAt(0) == i[2].charAt(1)
    ? i[0].charAt(0) + i[1].charAt(0) + i[2].charAt(0)
    : i.join('');
}
function Yr(e, t, r, n, i) {
  var o = [
    I(Math.round(e).toString(16)),
    I(Math.round(t).toString(16)),
    I(Math.round(r).toString(16)),
    I(Xt(n)),
  ];
  return i &&
    o[0].charAt(0) == o[0].charAt(1) &&
    o[1].charAt(0) == o[1].charAt(1) &&
    o[2].charAt(0) == o[2].charAt(1) &&
    o[3].charAt(0) == o[3].charAt(1)
    ? o[0].charAt(0) + o[1].charAt(0) + o[2].charAt(0) + o[3].charAt(0)
    : o.join('');
}
function Ot(e, t, r, n) {
  var i = [
    I(Xt(n)),
    I(Math.round(e).toString(16)),
    I(Math.round(t).toString(16)),
    I(Math.round(r).toString(16)),
  ];
  return i.join('');
}
f.equals = function (e, t) {
  return !e || !t ? !1 : f(e).toRgbString() == f(t).toRgbString();
};
f.random = function () {
  return f.fromRatio({ r: Math.random(), g: Math.random(), b: Math.random() });
};
function Xr(e, t) {
  t = t === 0 ? 0 : t || 10;
  var r = f(e).toHsl();
  return ((r.s -= t / 100), (r.s = De(r.s)), f(r));
}
function jr(e, t) {
  t = t === 0 ? 0 : t || 10;
  var r = f(e).toHsl();
  return ((r.s += t / 100), (r.s = De(r.s)), f(r));
}
function Zr(e) {
  return f(e).desaturate(100);
}
function Kr(e, t) {
  t = t === 0 ? 0 : t || 10;
  var r = f(e).toHsl();
  return ((r.l += t / 100), (r.l = De(r.l)), f(r));
}
function qr(e, t) {
  t = t === 0 ? 0 : t || 10;
  var r = f(e).toRgb();
  return (
    (r.r = Math.max(0, Math.min(255, r.r - Math.round(255 * -(t / 100))))),
    (r.g = Math.max(0, Math.min(255, r.g - Math.round(255 * -(t / 100))))),
    (r.b = Math.max(0, Math.min(255, r.b - Math.round(255 * -(t / 100))))),
    f(r)
  );
}
function Jr(e, t) {
  t = t === 0 ? 0 : t || 10;
  var r = f(e).toHsl();
  return ((r.l -= t / 100), (r.l = De(r.l)), f(r));
}
function Qr(e, t) {
  var r = f(e).toHsl(),
    n = (r.h + t) % 360;
  return ((r.h = n < 0 ? 360 + n : n), f(r));
}
function en(e) {
  var t = f(e).toHsl();
  return ((t.h = (t.h + 180) % 360), f(t));
}
function Ht(e, t) {
  if (isNaN(t) || t <= 0) throw new Error('Argument to polyad must be a positive number');
  for (var r = f(e).toHsl(), n = [f(e)], i = 360 / t, o = 1; o < t; o++)
    n.push(f({ h: (r.h + o * i) % 360, s: r.s, l: r.l }));
  return n;
}
function tn(e) {
  var t = f(e).toHsl(),
    r = t.h;
  return [
    f(e),
    f({ h: (r + 72) % 360, s: t.s, l: t.l }),
    f({ h: (r + 216) % 360, s: t.s, l: t.l }),
  ];
}
function rn(e, t, r) {
  ((t = t || 6), (r = r || 30));
  var n = f(e).toHsl(),
    i = 360 / r,
    o = [f(e)];
  for (n.h = (n.h - ((i * t) >> 1) + 720) % 360; --t; ) ((n.h = (n.h + i) % 360), o.push(f(n)));
  return o;
}
function nn(e, t) {
  t = t || 6;
  for (var r = f(e).toHsv(), n = r.h, i = r.s, o = r.v, l = [], d = 1 / t; t--; )
    (l.push(f({ h: n, s: i, v: o })), (o = (o + d) % 1));
  return l;
}
f.mix = function (e, t, r) {
  r = r === 0 ? 0 : r || 50;
  var n = f(e).toRgb(),
    i = f(t).toRgb(),
    o = r / 100,
    l = {
      r: (i.r - n.r) * o + n.r,
      g: (i.g - n.g) * o + n.g,
      b: (i.b - n.b) * o + n.b,
      a: (i.a - n.a) * o + n.a,
    };
  return f(l);
};
f.readability = function (e, t) {
  var r = f(e),
    n = f(t);
  return (
    (Math.max(r.getLuminance(), n.getLuminance()) + 0.05) /
    (Math.min(r.getLuminance(), n.getLuminance()) + 0.05)
  );
};
f.isReadable = function (e, t, r) {
  var n = f.readability(e, t),
    i,
    o;
  switch (((o = !1), (i = cn(r)), i.level + i.size)) {
    case 'AAsmall':
    case 'AAAlarge':
      o = n >= 4.5;
      break;
    case 'AAlarge':
      o = n >= 3;
      break;
    case 'AAAsmall':
      o = n >= 7;
      break;
  }
  return o;
};
f.mostReadable = function (e, t, r) {
  var n = null,
    i = 0,
    o,
    l,
    d,
    c;
  ((r = r || {}), (l = r.includeFallbackColors), (d = r.level), (c = r.size));
  for (var v = 0; v < t.length; v++)
    ((o = f.readability(e, t[v])), o > i && ((i = o), (n = f(t[v]))));
  return f.isReadable(e, n, { level: d, size: c }) || !l
    ? n
    : ((r.includeFallbackColors = !1), f.mostReadable(e, ['#fff', '#000'], r));
};
var Je = (f.names = {
    aliceblue: 'f0f8ff',
    antiquewhite: 'faebd7',
    aqua: '0ff',
    aquamarine: '7fffd4',
    azure: 'f0ffff',
    beige: 'f5f5dc',
    bisque: 'ffe4c4',
    black: '000',
    blanchedalmond: 'ffebcd',
    blue: '00f',
    blueviolet: '8a2be2',
    brown: 'a52a2a',
    burlywood: 'deb887',
    burntsienna: 'ea7e5d',
    cadetblue: '5f9ea0',
    chartreuse: '7fff00',
    chocolate: 'd2691e',
    coral: 'ff7f50',
    cornflowerblue: '6495ed',
    cornsilk: 'fff8dc',
    crimson: 'dc143c',
    cyan: '0ff',
    darkblue: '00008b',
    darkcyan: '008b8b',
    darkgoldenrod: 'b8860b',
    darkgray: 'a9a9a9',
    darkgreen: '006400',
    darkgrey: 'a9a9a9',
    darkkhaki: 'bdb76b',
    darkmagenta: '8b008b',
    darkolivegreen: '556b2f',
    darkorange: 'ff8c00',
    darkorchid: '9932cc',
    darkred: '8b0000',
    darksalmon: 'e9967a',
    darkseagreen: '8fbc8f',
    darkslateblue: '483d8b',
    darkslategray: '2f4f4f',
    darkslategrey: '2f4f4f',
    darkturquoise: '00ced1',
    darkviolet: '9400d3',
    deeppink: 'ff1493',
    deepskyblue: '00bfff',
    dimgray: '696969',
    dimgrey: '696969',
    dodgerblue: '1e90ff',
    firebrick: 'b22222',
    floralwhite: 'fffaf0',
    forestgreen: '228b22',
    fuchsia: 'f0f',
    gainsboro: 'dcdcdc',
    ghostwhite: 'f8f8ff',
    gold: 'ffd700',
    goldenrod: 'daa520',
    gray: '808080',
    green: '008000',
    greenyellow: 'adff2f',
    grey: '808080',
    honeydew: 'f0fff0',
    hotpink: 'ff69b4',
    indianred: 'cd5c5c',
    indigo: '4b0082',
    ivory: 'fffff0',
    khaki: 'f0e68c',
    lavender: 'e6e6fa',
    lavenderblush: 'fff0f5',
    lawngreen: '7cfc00',
    lemonchiffon: 'fffacd',
    lightblue: 'add8e6',
    lightcoral: 'f08080',
    lightcyan: 'e0ffff',
    lightgoldenrodyellow: 'fafad2',
    lightgray: 'd3d3d3',
    lightgreen: '90ee90',
    lightgrey: 'd3d3d3',
    lightpink: 'ffb6c1',
    lightsalmon: 'ffa07a',
    lightseagreen: '20b2aa',
    lightskyblue: '87cefa',
    lightslategray: '789',
    lightslategrey: '789',
    lightsteelblue: 'b0c4de',
    lightyellow: 'ffffe0',
    lime: '0f0',
    limegreen: '32cd32',
    linen: 'faf0e6',
    magenta: 'f0f',
    maroon: '800000',
    mediumaquamarine: '66cdaa',
    mediumblue: '0000cd',
    mediumorchid: 'ba55d3',
    mediumpurple: '9370db',
    mediumseagreen: '3cb371',
    mediumslateblue: '7b68ee',
    mediumspringgreen: '00fa9a',
    mediumturquoise: '48d1cc',
    mediumvioletred: 'c71585',
    midnightblue: '191970',
    mintcream: 'f5fffa',
    mistyrose: 'ffe4e1',
    moccasin: 'ffe4b5',
    navajowhite: 'ffdead',
    navy: '000080',
    oldlace: 'fdf5e6',
    olive: '808000',
    olivedrab: '6b8e23',
    orange: 'ffa500',
    orangered: 'ff4500',
    orchid: 'da70d6',
    palegoldenrod: 'eee8aa',
    palegreen: '98fb98',
    paleturquoise: 'afeeee',
    palevioletred: 'db7093',
    papayawhip: 'ffefd5',
    peachpuff: 'ffdab9',
    peru: 'cd853f',
    pink: 'ffc0cb',
    plum: 'dda0dd',
    powderblue: 'b0e0e6',
    purple: '800080',
    rebeccapurple: '663399',
    red: 'f00',
    rosybrown: 'bc8f8f',
    royalblue: '4169e1',
    saddlebrown: '8b4513',
    salmon: 'fa8072',
    sandybrown: 'f4a460',
    seagreen: '2e8b57',
    seashell: 'fff5ee',
    sienna: 'a0522d',
    silver: 'c0c0c0',
    skyblue: '87ceeb',
    slateblue: '6a5acd',
    slategray: '708090',
    slategrey: '708090',
    snow: 'fffafa',
    springgreen: '00ff7f',
    steelblue: '4682b4',
    tan: 'd2b48c',
    teal: '008080',
    thistle: 'd8bfd8',
    tomato: 'ff6347',
    turquoise: '40e0d0',
    violet: 'ee82ee',
    wheat: 'f5deb3',
    white: 'fff',
    whitesmoke: 'f5f5f5',
    yellow: 'ff0',
    yellowgreen: '9acd32',
  }),
  on = (f.hexNames = an(Je));
function an(e) {
  var t = {};
  for (var r in e) e.hasOwnProperty(r) && (t[e[r]] = r);
  return t;
}
function Yt(e) {
  return ((e = parseFloat(e)), (isNaN(e) || e < 0 || e > 1) && (e = 1), e);
}
function _(e, t) {
  sn(e) && (e = '100%');
  var r = ln(e);
  return (
    (e = Math.min(t, Math.max(0, parseFloat(e)))),
    r && (e = parseInt(e * t, 10) / 100),
    Math.abs(e - t) < 1e-6 ? 1 : (e % t) / parseFloat(t)
  );
}
function De(e) {
  return Math.min(1, Math.max(0, e));
}
function O(e) {
  return parseInt(e, 16);
}
function sn(e) {
  return typeof e == 'string' && e.indexOf('.') != -1 && parseFloat(e) === 1;
}
function ln(e) {
  return typeof e == 'string' && e.indexOf('%') != -1;
}
function I(e) {
  return e.length == 1 ? '0' + e : '' + e;
}
function ge(e) {
  return (e <= 1 && (e = e * 100 + '%'), e);
}
function Xt(e) {
  return Math.round(parseFloat(e) * 255).toString(16);
}
function Nt(e) {
  return O(e) / 255;
}
var D = (function () {
  var e = '[-\\+]?\\d+%?',
    t = '[-\\+]?\\d*\\.\\d+%?',
    r = '(?:' + t + ')|(?:' + e + ')',
    n = '[\\s|\\(]+(' + r + ')[,|\\s]+(' + r + ')[,|\\s]+(' + r + ')\\s*\\)?',
    i = '[\\s|\\(]+(' + r + ')[,|\\s]+(' + r + ')[,|\\s]+(' + r + ')[,|\\s]+(' + r + ')\\s*\\)?';
  return {
    CSS_UNIT: new RegExp(r),
    rgb: new RegExp('rgb' + n),
    rgba: new RegExp('rgba' + i),
    hsl: new RegExp('hsl' + n),
    hsla: new RegExp('hsla' + i),
    hsv: new RegExp('hsv' + n),
    hsva: new RegExp('hsva' + i),
    hex3: /^#?([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
    hex6: /^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/,
    hex4: /^#?([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
    hex8: /^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/,
  };
})();
function j(e) {
  return !!D.CSS_UNIT.exec(e);
}
function dn(e) {
  e = e.replace($r, '').replace(zr, '').toLowerCase();
  var t = !1;
  if (Je[e]) ((e = Je[e]), (t = !0));
  else if (e == 'transparent') return { r: 0, g: 0, b: 0, a: 0, format: 'name' };
  var r;
  return (r = D.rgb.exec(e))
    ? { r: r[1], g: r[2], b: r[3] }
    : (r = D.rgba.exec(e))
      ? { r: r[1], g: r[2], b: r[3], a: r[4] }
      : (r = D.hsl.exec(e))
        ? { h: r[1], s: r[2], l: r[3] }
        : (r = D.hsla.exec(e))
          ? { h: r[1], s: r[2], l: r[3], a: r[4] }
          : (r = D.hsv.exec(e))
            ? { h: r[1], s: r[2], v: r[3] }
            : (r = D.hsva.exec(e))
              ? { h: r[1], s: r[2], v: r[3], a: r[4] }
              : (r = D.hex8.exec(e))
                ? { r: O(r[1]), g: O(r[2]), b: O(r[3]), a: Nt(r[4]), format: t ? 'name' : 'hex8' }
                : (r = D.hex6.exec(e))
                  ? { r: O(r[1]), g: O(r[2]), b: O(r[3]), format: t ? 'name' : 'hex' }
                  : (r = D.hex4.exec(e))
                    ? {
                        r: O(r[1] + '' + r[1]),
                        g: O(r[2] + '' + r[2]),
                        b: O(r[3] + '' + r[3]),
                        a: Nt(r[4] + '' + r[4]),
                        format: t ? 'name' : 'hex8',
                      }
                    : (r = D.hex3.exec(e))
                      ? {
                          r: O(r[1] + '' + r[1]),
                          g: O(r[2] + '' + r[2]),
                          b: O(r[3] + '' + r[3]),
                          format: t ? 'name' : 'hex',
                        }
                      : !1;
}
function cn(e) {
  var t, r;
  return (
    (e = e || { level: 'AA', size: 'small' }),
    (t = (e.level || 'AA').toUpperCase()),
    (r = (e.size || 'small').toLowerCase()),
    t !== 'AA' && t !== 'AAA' && (t = 'AA'),
    r !== 'small' && r !== 'large' && (r = 'small'),
    { level: t, size: r }
  );
}
const pe = 68,
  me = 'Aptos, Calibri, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif',
  be = 11,
  Wt = 8,
  jt = 0.1,
  it = 2,
  Zt = 1.2,
  Qe = 34,
  Kt = 40,
  qt = '#f3f3f3',
  Jt = '#5f6368',
  hn = '#d7dbe0',
  Ae = '#21a366',
  fn = 'rgba(33, 163, 102, 0.1)',
  un = 1,
  gn = '#000000',
  pn = { double: 8, solid: 7, dashed: 5, dotted: 4 },
  et = `bold 12px ${me}`,
  We = `${be}px ${me}`,
  mn = 32,
  bn = { backgroundColor: qt, color: Jt, font: et },
  Ft = { backgroundColor: '#f4f7f9', color: '#73808d', font: `italic ${be}px ${me}` },
  vn = new Map(),
  ve = (e = 1) => (Number.isFinite(e) ? Math.min(2.5, Math.max(0.5, e)) : 1),
  K = (e, t) => Math.max(1, Math.round(e * ve(t))),
  Ie = (e, t) => {
    if (!e) return e;
    const r = ve(t);
    return e.replace(/(\d+(?:\.\d+)?)px/g, (n, i) => `${Number(i) * r}px`);
  },
  Se = (e, t) => {
    if (e) return { ...e, width: Math.max(0.5, e.width * ve(t)) };
  },
  ne = (e, t) => {
    if (e)
      return {
        ...e,
        font: Ie(e.font, t),
        borderTop: Se(e.borderTop, t),
        borderRight: Se(e.borderRight, t),
        borderBottom: Se(e.borderBottom, t),
        borderLeft: Se(e.borderLeft, t),
      };
  },
  Qt = (e) => Ie(et, e) || et,
  wn = (e) => Ie(We, e) || We,
  _n = (e) => ({ ...bn, font: Qt(e) }),
  xn = (e) => ({ ...Ft, font: Ie(Ft.font, e) }),
  er = (e) =>
    e.map((t) => {
      var r;
      return {
        ...t,
        ...(!((r = t.children) === null || r === void 0) && r.length
          ? { children: er(t.children) }
          : {}),
      };
    }),
  En = (e) => {
    if (typeof e.font == 'string' && e.font.trim()) return e.font;
    if (
      !(
        e.fontFamily !== void 0 ||
        e.fontSize !== void 0 ||
        e.fontWeight !== void 0 ||
        e.fontStyle !== void 0
      )
    )
      return;
    const r = (() => {
      const { fontWeight: n } = e;
      if (typeof n == 'number') return n >= 600 ? 'bold' : 'normal';
      if (typeof n == 'string') {
        const i = n.trim();
        return /^\d+$/.test(i) ? (Number(i) >= 600 ? 'bold' : 'normal') : i;
      }
      return 'normal';
    })();
    return [
      e.fontStyle || 'normal',
      r,
      `${Number.parseInt(e.fontSize, 10) || be}px`,
      e.fontFamily || me,
    ].join(' ');
  },
  tr = (e) => {
    if (e) {
      if (e.includes('htLeft')) return 'left';
      if (e.includes('htRight')) return 'right';
      if (e.includes('htCenter')) return 'center';
    }
  },
  rr = (e) => {
    if (e) {
      if (e.includes('htTop')) return 'top';
      if (e.includes('htBottom')) return 'bottom';
      if (e.includes('htMiddle')) return 'middle';
    }
  },
  Dt = (e, t) => !!e?.split(/\s+/).includes(t),
  Rn = (e, t, r) => {
    var n;
    return typeof e == 'number' ? e : (n = e?.[t]) !== null && n !== void 0 ? n : r;
  },
  at = (e) => {
    const t = Number(e?.width);
    return Number.isFinite(t) && t > 0 ? t : 0;
  },
  Cn = (e) => !!e && !e.hide && at(e) > 0,
  Mn = (e) => {
    var t, r;
    return !(
      (r = (t = e.structure) === null || t === void 0 ? void 0 : t.columns) === null || r === void 0
    ) && r.length
      ? e.structure.columns
      : e.columns;
  },
  yn = (e) => {
    var t, r;
    return (r = (t = e.structure) === null || t === void 0 ? void 0 : t.colWidths) !== null &&
      r !== void 0
      ? r
      : e.colWidths;
  },
  It = (e, t, r) => {
    var n;
    return typeof e == 'number' ? e : (n = e?.[t]) !== null && n !== void 0 ? n : r;
  },
  tt = (e, t) =>
    typeof e == 'number' && Number.isFinite(e)
      ? e <= 0
        ? jt
        : Math.max(Math.ceil(e), Wt)
      : Math.max(Math.ceil(t), Wt),
  An = (e) => {
    if (e == null) return !1;
    const t = `${e}`.trim();
    return t ? !/^\d+([./:-]\d+)*$/.test(t) : !1;
  },
  Sn = (e) => {
    const t = e.meta,
      r = e.data || [];
    if (!t || r.length < 2 || (e.merge || []).length) return 0;
    const n = r[0] || [],
      i = r[1] || [],
      o = n.filter((d) => `${d ?? ''}`.trim() !== ''),
      l = i.filter((d) => `${d ?? ''}`.trim() !== '');
    return o.length < Math.min(Math.max(Math.floor(t.totalCols / 2), 3), 6) ||
      !o.every(An) ||
      l.length < 2
      ? 0
      : 1;
  },
  Ln = (e) => {
    var t;
    const r = Mn(e),
      n = yn(e),
      i = [
        {
          key: Ut,
          title: '',
          type: 'index',
          fixed: 'left',
          width: pe,
          minWidth: pe,
          maxWidth: pe,
          widthFillDisable: !0,
          headerAlign: 'center',
          align: 'center',
          headerVerticalAlign: 'middle',
          verticalAlign: 'middle',
          overflowTooltipShow: !1,
          overflowTooltipHeaderShow: !1,
        },
      ],
      o = [];
    for (
      let l = 0;
      l < (((t = e.meta) === null || t === void 0 ? void 0 : t.totalCols) || 0);
      l += 1
    ) {
      const d = ot(l),
        c = r?.[l],
        v = Rn(n, l, e.defaults.colWidth),
        E = !!c?.hidden || v <= 0,
        p = rr(c?.className) || 'middle';
      (o.push(d),
        i.push({
          key: d,
          title: c?.title || `${l + 1}`,
          width: E ? 0 : Math.max(Math.ceil(v), 1),
          hide: E,
          widthFillDisable: !0,
          renderType: 'both',
          headerAlign: 'center',
          headerVerticalAlign: 'middle',
          align: tr(c?.className) || 'left',
          verticalAlign: p,
          overflowTooltipShow: !0,
          overflowTooltipHeaderShow: !0,
        }));
    }
    return { columns: i, dataKeys: o };
  },
  nr = (e, t) => {
    var r;
    const n = {
        ...e,
        ...(!((r = e.children) === null || r === void 0) && r.length
          ? { children: e.children.map((d) => nr(d, t)) }
          : {}),
      },
      i = Number(e.width);
    Number.isFinite(i) && i > 0 && (n.width = K(i, t));
    const o = Number(e.minWidth);
    Number.isFinite(o) && o > 0 && (n.minWidth = K(o, t));
    const l = Number(e.maxWidth);
    return (Number.isFinite(l) && l > 0 && (n.maxWidth = K(l, t)), n);
  },
  Bt = (e, t = 1) => {
    const r = ve(t);
    return r === 1 ? er(e) : e.map((n) => nr(n, r));
  },
  Tn = (e) => {
    if (typeof e == 'number' && Number.isFinite(e)) return Math.max(e, 0);
    if (typeof e == 'string') {
      const t = Number.parseFloat(e);
      return Number.isFinite(t) ? Math.max(t, 0) : 0;
    }
    return 0;
  },
  kn = (e) => {
    if (typeof e != 'string') return 'solid';
    const t = e.trim();
    switch (t) {
      case 'double':
      case 'dashed':
      case 'dotted':
      case 'solid':
        return t;
      default:
        return 'solid';
    }
  },
  Le = (e, t) => {
    const r = Tn(e[`border${t}Width`]);
    if (r) return { width: r, style: kn(e[`border${t}Style`]), color: e[`border${t}Color`] || gn };
  },
  rt = (e) => (e ? !!(e.borderTop || e.borderRight || e.borderBottom || e.borderLeft) : !1),
  or = (e) => (e ? !!(e.horizontalAlign || e.verticalAlign || e.wrapText || e.shrinkToFit) : !1),
  $t = (e, t) =>
    or(e)
      ? !!(
          e?.wrapText ||
          e?.shrinkToFit ||
          (e?.horizontalAlign && e.horizontalAlign !== (t?.align || 'left')) ||
          (e?.verticalAlign && e.verticalAlign !== (t?.verticalAlign || 'middle'))
        )
      : !1,
  On = (e) => {
    switch (e) {
      case 'center':
        return 'center';
      case 'right':
        return 'flex-end';
      default:
        return 'flex-start';
    }
  },
  Hn = (e) => {
    switch (e) {
      case 'top':
        return 'flex-start';
      case 'bottom':
        return 'flex-end';
      default:
        return 'center';
    }
  },
  Nn = (e, t, r, n) => {
    switch (e) {
      case 'right':
        return t - r;
      case 'center':
        return -Math.min(n, Math.max((r - t) / 2, 0));
      default:
        return 0;
    }
  },
  je = (e) => typeof e._height == 'number' && e._height <= jt,
  nt = (e, t) => {
    const r = e?.key;
    if (typeof r == 'string' && r.startsWith('c')) {
      const n = Number(r.slice(1));
      if (Number.isInteger(n) && n >= 0) return n;
    }
    return Math.max(t - 1, 0);
  },
  Te = (e, t, r) => Z(e, nt(r, t) + 1),
  ir = (e, t) => Z(e, t + 1),
  st = (e) => (e == null ? '' : `${e}`),
  Wn = (e) => st(e).trim() !== '',
  Fn = (e) => /^[+-]?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?%?$/.test(e.trim()),
  Dn = (e, t, r, n) => {
    const i = `${t}
${r}
${e}`,
      o = vn.get(i);
    return o !== void 0 ? o : e.length * be;
  },
  In = (e, t, r, n) => {
    const i = e.columns[n + 1];
    if (!Cn(i)) return !1;
    const o = ir(r, n);
    return e.mergeStartMap.has(o) || e.mergeCoveredMap.has(o) ? !1 : !Wn(t[ot(n)]);
  },
  zt = (e, t, r, n, i) => {
    let o = 0;
    for (let l = 1; l <= mn; l += 1) {
      const d = n + l * i;
      if (d < 0 || d >= e.totalCols || !In(e, t, r, d)) break;
      o += at(e.columns[d + 1]);
    }
    return o;
  },
  Pt = (e, t, r, n, i, o, l, d, c) => {
    const v = st(l);
    if (!v || o?.wrapText || o?.shrinkToFit || Fn(v)) return;
    const E = ir(r, n);
    if (e.mergeStartMap.has(E) || e.mergeCoveredMap.has(E)) return;
    const p = at(i);
    if (!p) return;
    const W = o?.font || We,
      U = Math.ceil(Dn(v, W, K(it, d)));
    if (U <= p) return;
    const B = o?.horizontalAlign || i?.align || 'left',
      $ = B === 'right' || B === 'center' ? zt(e, t, r, n, -1) : 0,
      S = B !== 'right' ? zt(e, t, r, n, 1) : 0,
      x = p + $ + S;
    if (x <= p) return;
    const R = Math.min(U, x);
    return { left: Nn(B, p, R, $), width: R };
  },
  J = (e) => (e ? e.width * 100 + (pn[e.style] || 1) : 0),
  Bn = (e, t, r, n, i) => {
    const o = ne(e.cellCache.get(Z(t - 1, r + 1)), i),
      l = ne(e.cellCache.get(Z(t + 1, r + 1)), i),
      d = ne(e.cellCache.get(Z(t, r)), i),
      c = ne(e.cellCache.get(Z(t, r + 2)), i),
      v = J(n.borderTop) >= J(o?.borderBottom) ? n.borderTop : void 0,
      E = J(n.borderBottom) > J(l?.borderTop) ? n.borderBottom : void 0,
      p = J(n.borderLeft) >= J(d?.borderRight) ? n.borderLeft : void 0,
      W = J(n.borderRight) > J(c?.borderLeft) ? n.borderRight : void 0;
    return { ...n, borderTop: v, borderRight: W, borderBottom: E, borderLeft: p };
  },
  ke = (e, t, r) => {
    const n = e.createElement('span'),
      i = r.width / 2;
    return (
      Object.assign(n.style, {
        position: 'absolute',
        pointerEvents: 'none',
        boxSizing: 'border-box',
      }),
      t === 'top' || t === 'bottom'
        ? (Object.assign(n.style, {
            left: `${-i}px`,
            width: `calc(100% + ${r.width}px)`,
            height: '0',
          }),
          (n.style[t] = `${-i}px`),
          (n.style.borderTop = `${r.width}px ${r.style} ${r.color}`))
        : (Object.assign(n.style, {
            top: `${-i}px`,
            height: `calc(100% + ${r.width}px)`,
            width: '0',
          }),
          (n.style[t] = `${-i}px`),
          (n.style.borderLeft = `${r.width}px ${r.style} ${r.color}`)),
      n
    );
  },
  $n = (e, t, r, n) => {
    const i = e.createElement('span');
    return (
      (i.textContent = st(t)),
      Object.assign(i.style, {
        position: 'relative',
        zIndex: '1',
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: Hn(r.verticalAlign),
        justifyContent: On(r.horizontalAlign),
        padding: `0 ${n}px`,
        overflow: 'hidden',
        textOverflow: r.wrapText ? 'clip' : 'ellipsis',
        whiteSpace: r.wrapText ? 'pre-wrap' : 'nowrap',
        wordBreak: r.wrapText ? 'break-word' : 'normal',
        lineHeight: `${Zt}`,
        textAlign: r.horizontalAlign || 'left',
        color: r.color || 'inherit',
        font: r.font || We,
        transform: r.shrinkToFit ? 'scale(0.92)' : 'none',
        transformOrigin: `${r.horizontalAlign || 'left'} center`,
      }),
      i
    );
  },
  zn = (e, t) => {
    t &&
      Object.assign(e.style, {
        position: 'absolute',
        left: `${t.left}px`,
        top: '0',
        width: `${t.width}px`,
        overflow: 'hidden',
        textOverflow: 'clip',
      });
  },
  Pn = (e, t, r, n, i, o) => {
    const l = e.ownerDocument;
    (e.replaceChildren(),
      Object.assign(e.style, {
        pointerEvents: 'none',
        overflow: 'visible',
        background: 'transparent',
      }));
    const d = l.createDocumentFragment();
    if (n) {
      const c = $n(l, r, t, K(it, o));
      (zn(c, i), d.appendChild(c));
    }
    (t.borderTop && d.appendChild(ke(l, 'top', t.borderTop)),
      t.borderRight && d.appendChild(ke(l, 'right', t.borderRight)),
      t.borderBottom && d.appendChild(ke(l, 'bottom', t.borderBottom)),
      t.borderLeft && d.appendChild(ke(l, 'left', t.borderLeft)),
      e.appendChild(d));
  },
  Vn = (e) => {
    if (!e) return;
    const t = e.style || {},
      r = {};
    (t.backgroundColor && (r.backgroundColor = t.backgroundColor),
      t.color
        ? (r.color = t.color)
        : t.backgroundColor && f(t.backgroundColor).isDark() && (r.color = '#ffffff'));
    const n = En(t);
    n
      ? (r.font = n)
      : t.backgroundColor && f(t.backgroundColor).isDark() && (r.font = `bold ${be}px ${me}`);
    const i = Le(t, 'Top');
    i && (r.borderTop = i);
    const o = Le(t, 'Right');
    o && (r.borderRight = o);
    const l = Le(t, 'Bottom');
    l && (r.borderBottom = l);
    const d = Le(t, 'Left');
    d && (r.borderLeft = d);
    const c = tr(e.className);
    c && (r.horizontalAlign = c);
    const v = rr(e.className);
    if (
      (v && (r.verticalAlign = v),
      Dt(e.className, 'htWrap') && (r.wrapText = !0),
      Dt(e.className, 'htShrink') && (r.shrinkToFit = !0),
      !(!r.backgroundColor && !r.color && !r.font && !rt(r) && !or(r)))
    )
      return r;
  },
  Ze = ({
    hostHeight: e,
    resizableColumns: t = !1,
    sheetDefaults: r,
    virtualState: n,
    zoomScale: i = 1,
  }) => {
    const o = ve(i),
      l = K(it, o),
      d = K(Qe, o),
      c = K(tt(r.rowHeight, r.rowHeight), o),
      v = K(r.colWidth, o),
      E = _n(o),
      p = xn(o),
      W = ({ rowIndex: S, colIndex: x, column: R }) => {
        if (x === 0) return;
        const w = Te(S, x, R);
        if (n.mergeCoveredMap.has(w)) return { rowspan: 0, colspan: 0 };
        const y = n.mergeStartMap.get(w);
        if (y) return { rowspan: y.rowspan, colspan: y.colspan };
      },
      U = () => E,
      B = ({ row: S, rowIndex: x, colIndex: R, column: w }) => {
        if (R === 0) return E;
        const y = S;
        if (!je(y)) return Xe(y) !== Q.Loaded ? p : ne(n.cellCache.get(Te(x, R, w)), o);
      },
      $ = ({ row: S, rowIndex: x, colIndex: R, column: w, value: y }) => {
        const F = S;
        if (R === 0 || je(F) || Xe(F) !== Q.Loaded) return;
        const G = Te(x, R, w);
        if (n.mergeCoveredMap.has(G)) return;
        const C = ne(n.cellCache.get(G), o),
          L = nt(w, R),
          H = Pt(n, F, x, L, w, C, y, o),
          z = $t(C, w) || !!H;
        if (!(!rt(C) && !z))
          return (oe) => {
            const Y = {
                ...(C || {}),
                horizontalAlign: C?.horizontalAlign || w?.align,
                verticalAlign: C?.verticalAlign || w?.verticalAlign,
              },
              P = rt(C) ? Bn(n, x, L, Y, o) : Y;
            Pn(oe, P, y, z, H, o);
          };
      };
    return {
      ROW_KEY: Gt,
      DISABLED: !0,
      HEIGHT: Math.max(e, 240),
      MAX_HEIGHT: Math.max(e, 240),
      HEADER_HEIGHT: d,
      CELL_HEIGHT: c,
      CELL_WIDTH: v,
      CELL_PADDING: l,
      CELL_LINE_HEIGHT: Zt,
      COLUMNS_VERTICAL_ALIGN: 'middle',
      HEADER_FONT: Qt(o),
      BODY_FONT: wn(o),
      BORDER_RADIUS: 0,
      BORDER_COLOR: hn,
      HEADER_BG_COLOR: qt,
      BODY_BG_COLOR: '#ffffff',
      HEADER_TEXT_COLOR: Jt,
      BODY_TEXT_COLOR: '#202124',
      READONLY_COLOR: '#ffffff',
      READONLY_TEXT_COLOR: '#202124',
      EDIT_BG_COLOR: '#ffffff',
      PLACEHOLDER_COLOR: '#8a94a3',
      SCROLLER_COLOR: '#c1c7d0',
      SCROLLER_FOCUS_COLOR: '#9aa0a6',
      SELECT_ROW_COL_BG_COLOR: fn,
      SELECT_AREA_COLOR: 'rgba(33, 163, 102, 0.14)',
      SELECT_BORDER_COLOR: Ae,
      AUTOFILL_POINT_BORDER_COLOR: Ae,
      ENABLE_SELECTOR: !0,
      ENABLE_SELECTOR_SINGLE: !1,
      ENABLE_SELECTOR_SPAN_COL: !0,
      ENABLE_SELECTOR_SPAN_ROW: !0,
      ENABLE_SELECTOR_ALL_ROWS: !0,
      ENABLE_SELECTOR_ALL_COLS: !0,
      SELECTOR_AREA_MIN_X: un,
      ENABLE_CONTEXT_MENU: !1,
      ENABLE_HEADER_CONTEXT_MENU: !1,
      ENABLE_AUTOFILL: !0,
      ENABLE_AUTOFILL_SPAN_COL: !0,
      ENABLE_AUTOFILL_SPAN_ROW: !0,
      ENABLE_PASTER: !1,
      ENABLE_HISTORY: !1,
      ENABLE_RESIZE_COLUMN: t,
      ENABLE_RESIZE_COLUMN_TEXT: t,
      RESIZE_COLUMN_LINE_COLOR: Ae,
      RESIZE_COLUMN_TEXT_BG_COLOR: Ae,
      RESIZE_COLUMN_MIN_WIDTH: Kt,
      ENABLE_RESIZE_ROW: !1,
      ENABLE_KEYBOARD: !0,
      ENABLE_COPY: !0,
      BEFORE_AUTOFILL_DATA_METHOD: () => [],
      SPAN_METHOD: W,
      HEADER_CELL_STYLE_METHOD: U,
      BODY_CELL_STYLE_METHOD: B,
      BODY_CELL_RENDER_METHOD: $,
      BODY_CELL_FORMATTER_METHOD: ({ row: S, rowIndex: x, colIndex: R, column: w, value: y }) => {
        if (je(S)) return '';
        if (R === 0) {
          const L = x + 1 - n.indexOffset;
          return L > 0 ? `${L}` : '';
        }
        if (Xe(S) !== Q.Loaded) return '';
        const F = S,
          G = ne(n.cellCache.get(Te(x, R, w)), o),
          C = Pt(n, F, x, nt(w, R), w, G, y, o);
        return $t(G, w) || C || y == null ? '' : `${y}`;
      },
    };
  },
  Un = `
.excel-wrapper{position:relative;width:100%;height:100%;display:flex;flex-direction:column;background:#fff;color:#172033;font-family:Aptos,'Segoe UI','PingFang SC','Microsoft YaHei',sans-serif}
.excel-wrapper *{box-sizing:border-box}
.excel-wrapper .table-wrapper{position:relative;width:100%;flex:1;min-height:0;background:#fff;overflow:hidden}
.excel-wrapper .table-host{position:absolute;inset:0}
.excel-wrapper .table-target{width:100%;height:100%}
.excel-wrapper .table-host .e-virt-table-container,.excel-wrapper .table-host .e-virt-table-stage{width:100%!important}
.excel-wrapper .table-host .e-virt-table-container{height:100%!important}
.excel-wrapper .table-host .e-virt-table-stage{overflow:hidden}
.excel-wrapper .sheet-loading{position:absolute;right:18px;bottom:18px;z-index:20;display:inline-flex;align-items:center;gap:8px;padding:10px 14px;border-radius:14px;background:rgba(33,163,102,.1);border:1px solid rgba(33,163,102,.2);box-shadow:0 8px 20px rgba(33,163,102,.12);color:#1a7f50;font-size:12px;font-weight:700;pointer-events:none}
.excel-wrapper .sheet-loading-dot{width:8px;height:8px;flex-shrink:0;border-radius:999px;background:#21a366;box-shadow:0 0 0 6px rgba(33,163,102,.12);animation:sheet-loading-pulse 1.2s ease-in-out infinite}
.excel-wrapper .sheet-loading-summary{color:#5f6368}
.excel-wrapper .excel-image-viewport{position:absolute;right:0;bottom:0;z-index:35;overflow:hidden;pointer-events:none}
.excel-wrapper .excel-image-layer{position:absolute;inset:0 auto auto 0;width:0;height:0;transform-origin:0 0;will-change:transform}
.excel-wrapper .excel-image{position:absolute;display:block;max-width:none;height:auto;object-fit:contain;user-select:none}
.excel-wrapper .loading{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.96);z-index:999;backdrop-filter:blur(6px)}
.excel-wrapper .loading-card{width:min(100%,460px);display:flex;align-items:center;gap:18px;padding:22px;border-radius:24px;background:rgba(255,255,255,.92);border:1px solid rgba(33,163,102,.1);box-shadow:0 22px 48px rgba(18,36,27,.12)}
.excel-wrapper .loading-brand{flex-shrink:0;width:78px;height:78px;display:flex;align-items:center;justify-content:center;border-radius:22px;background:linear-gradient(135deg,rgba(33,163,102,.14),rgba(33,163,102,.04));color:#1a7f50;font-size:18px;font-weight:900;letter-spacing:0}
.excel-wrapper .loading-copy{min-width:0;flex:1}
.excel-wrapper .loading-kicker{display:block;color:#21a366;font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase}
.excel-wrapper .loading-copy strong{display:block;margin-top:6px;color:#183828;font-size:20px;line-height:1.3}
.excel-wrapper .loading-copy p{margin:8px 0 0;color:#64748b;font-size:13px;line-height:1.5}
.excel-wrapper .loading-spinner{width:28px;height:28px;border-radius:999px;border:3px solid rgba(33,163,102,.16);border-top-color:#21a366;animation:sheet-loading-spin .8s linear infinite}
.excel-wrapper .error{position:absolute;left:50%;top:50%;z-index:1000;transform:translate(-50%,-50%);max-width:min(520px,calc(100% - 48px));padding:16px 18px;border-radius:16px;background:#fff7ed;color:#9a3412;border:1px solid rgba(234,88,12,.18);box-shadow:0 18px 42px rgba(154,52,18,.12);font-size:14px;line-height:1.6}
.excel-wrapper .toolbar{min-height:44px;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:8px 12px;border-top:1px solid #e5e7eb;background:#f8fafc}
.excel-wrapper .btn-group{min-width:0;max-width:100%;flex:1 1 auto;display:flex;align-items:center;gap:6px;overflow-x:auto;overflow-y:hidden;scrollbar-gutter:stable;scrollbar-width:thin;overscroll-behavior-x:contain}
.excel-wrapper .sheet-tab{flex:0 0 auto;width:max-content;min-width:72px;max-width:min(260px,70vw);height:30px;border:1px solid transparent;border-radius:8px;padding:0 12px;background:transparent;color:#526173;font:inherit;font-size:12px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer}
.excel-wrapper .sheet-tab:hover{background:#edf2f7}
.excel-wrapper .sheet-tab.active{border-color:rgba(33,163,102,.28);background:rgba(33,163,102,.12);color:#137347}
.excel-wrapper .summary{flex:0 0 auto;max-width:42%;overflow:hidden;color:#64748b;font-size:12px;font-weight:700;white-space:nowrap;text-overflow:ellipsis}
.excel-wrapper .hidden{display:none!important}
.file-viewer[data-viewer-theme='dark'] .excel-wrapper{background:#0f172a;color:#e5e7eb}
.file-viewer[data-viewer-theme='dark'] .excel-wrapper .table-wrapper{background:#111827}
.file-viewer[data-viewer-theme='dark'] .excel-wrapper .toolbar{background:#111827;border-color:rgba(148,163,184,.22)}
.file-viewer[data-viewer-theme='dark'] .excel-wrapper .sheet-tab{color:#cbd5e1}
.file-viewer[data-viewer-theme='dark'] .excel-wrapper .sheet-tab:hover{background:#1f2937}
@media (prefers-color-scheme:dark){.file-viewer[data-viewer-theme='system'] .excel-wrapper{background:#0f172a;color:#e5e7eb}.file-viewer[data-viewer-theme='system'] .excel-wrapper .table-wrapper{background:#111827}.file-viewer[data-viewer-theme='system'] .excel-wrapper .toolbar{background:#111827;border-color:rgba(148,163,184,.22)}.file-viewer[data-viewer-theme='system'] .excel-wrapper .sheet-tab{color:#cbd5e1}.file-viewer[data-viewer-theme='system'] .excel-wrapper .sheet-tab:hover{background:#1f2937}}
@keyframes sheet-loading-spin{to{transform:rotate(360deg)}}
@keyframes sheet-loading-pulse{0%,100%{opacity:.55;transform:scale(.9)}50%{opacity:1;transform:scale(1)}}
@media (max-width:720px){.excel-wrapper .toolbar{align-items:stretch;flex-direction:column}.excel-wrapper .btn-group{flex:0 0 auto}.excel-wrapper .summary{max-width:none;white-space:normal}.excel-wrapper .sheet-loading{left:12px;right:12px;bottom:58px;justify-content:center}.excel-wrapper .loading-card{margin:18px;flex-direction:column;text-align:center}}
`,
  Gn = async () => {
    const e = await Vt(() => import('./index.es-B2nEvkyk.js'), [], import.meta.url);
    return e.default || e;
  },
  lt = (e) => e.ownerDocument.defaultView,
  Yn = (e) => e.ownerDocument.baseURI || e.ownerDocument.URL || 'http://localhost/',
  Xn = (e, t) => {
    if (e) {
      if (typeof e == 'function') {
        e(t);
        return;
      }
      e.handleEvent(t);
    }
  };
class jn {
  constructor(t) {
    ((this.onmessage = null),
      (this.onerror = null),
      (this.destroyed = !1),
      (this.listeners = new Map()),
      (this.parserPromise = null),
      (this.context = null),
      (this.targetWindow = t));
  }
  addEventListener(t, r) {
    var n;
    (this.listeners.has(t) || this.listeners.set(t, new Set()),
      (n = this.listeners.get(t)) === null || n === void 0 || n.add(r));
  }
  removeEventListener(t, r) {
    var n;
    (n = this.listeners.get(t)) === null || n === void 0 || n.delete(r);
  }
  terminate() {
    ((this.destroyed = !0), this.listeners.clear());
  }
  postMessage(t) {
    this.handleMessage(t);
  }
  async loadParser() {
    this.parserPromise ||
      (this.parserPromise = Vt(
        () => import('./parser-Cx5tkEO4.js'),
        __vite__mapDeps([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]),
        import.meta.url,
      ));
    const t = await this.parserPromise;
    return (this.context || (this.context = t.createSpreadsheetParserContext()), t);
  }
  dispatch(t, r) {
    var n;
    (n = this.listeners.get(t)) === null || n === void 0 || n.forEach((i) => Xn(i, r));
  }
  dispatchMessage(t) {
    var r;
    const n = this.targetWindow,
      i = n?.MessageEvent || (typeof MessageEvent < 'u' ? MessageEvent : void 0),
      o = i ? new i('message', { data: t }) : { type: 'message', data: t };
    ((r = this.onmessage) === null || r === void 0 || r.call(this, o), this.dispatch('message', o));
  }
  dispatchError(t) {
    var r;
    const n = t instanceof Error ? t.message : String(t),
      i = this.targetWindow,
      o = i?.ErrorEvent || (typeof ErrorEvent < 'u' ? ErrorEvent : void 0),
      l = o ? new o('error', { message: n, error: t }) : { type: 'error', message: n, error: t };
    ((r = this.onerror) === null || r === void 0 || r.call(this, l), this.dispatch('error', l));
  }
  async handleMessage(t) {
    if (!this.destroyed)
      try {
        const r = await this.loadParser();
        r.handleSpreadsheetWorkerRequest(
          this.context || r.createSpreadsheetParserContext(),
          t,
        ).forEach((n) => {
          this.destroyed || this.dispatchMessage(n);
        });
      } catch (r) {
        this.destroyed || this.dispatchError(r);
      }
  }
}
const Ke = (e) => new jn(lt(e)),
  Zn = (e, t) => () => {
    var r, n, i;
    if (
      ((n = (r = t?.options) === null || r === void 0 ? void 0 : r.spreadsheet) === null ||
      n === void 0
        ? void 0
        : n.worker) !== !0
    )
      return Ke(e);
    const o = lt(e),
      l = o?.Worker || (typeof Worker < 'u' ? Worker : void 0);
    if (!l) return Ke(e);
    const d = Or((i = t?.options) === null || i === void 0 ? void 0 : i.spreadsheet, Yn(e));
    try {
      return new l(d, { type: 'module' });
    } catch (c) {
      try {
        return new l(d);
      } catch (v) {
        return (
          console.warn('[file-viewer] Spreadsheet Worker 无法创建，已回退到主线程解析。', v || c),
          Ke(e)
        );
      }
    }
  },
  Kn = (e) => {
    const t = e.createElement('style');
    return ((t.textContent = Un), t);
  },
  Oe = (e, t) => {
    e.classList.toggle('hidden', t);
  },
  qn = (e) => Math.min(2.5, Math.max(0.5, Number(e.toFixed(2)))),
  Jn = async (e, t, r, n) => {
    var i, o, l, d;
    const c = t.ownerDocument,
      v = await Gn(),
      E = Wr(),
      p = c.createElement('div');
    ((p.className = 'excel-wrapper'), (p.dataset.viewerZoomProvider = 'xlsx'));
    const W = c.createElement('div');
    ((W.className = 'loading'),
      (W.innerHTML = `
    <div class="loading-card">
      <div class="loading-brand">XLSX</div>
      <div class="loading-copy">
        <span class="loading-kicker">Excel 表格</span>
        <strong data-loading-title>正在解析 Excel 工作簿</strong>
        <p>正在准备工作表、样式和大数据视口，请稍候。</p>
      </div>
      <span class="loading-spinner"></span>
    </div>
  `));
    const U = c.createElement('div');
    U.className = 'error hidden';
    const B = c.createElement('div');
    B.className = 'table-wrapper';
    const $ = c.createElement('div');
    (($.className = 'sheet-loading hidden'),
      ($.innerHTML = `
    <span class="sheet-loading-dot"></span>
    <span>正在平滑补充可视区数据</span>
    <span class="sheet-loading-summary"></span>
  `));
    const S = c.createElement('div');
    S.className = 'table-host';
    const x = c.createElement('div');
    x.className = 'table-target';
    const R = c.createElement('div');
    R.className = 'excel-image-viewport hidden';
    const w = c.createElement('div');
    ((w.className = 'excel-image-layer'), R.appendChild(w), S.append(x, R), B.append($, S));
    const y = c.createElement('div');
    y.className = 'toolbar';
    const F = c.createElement('div');
    ((F.className = 'btn-group'), F.setAttribute('aria-label', '工作表列表'));
    const G = c.createElement('div');
    ((G.className = 'summary'), y.append(F, G), p.append(W, U, B, y), t.replaceChildren(Kn(c), p));
    let C = [],
      L = 0,
      H = '',
      z = 0,
      oe = 0,
      Y = { ...qe },
      P = !0,
      ie = !1,
      dt = 0,
      ct = 0,
      we = [],
      A = 1,
      ee = { scrollX: 0, scrollY: 0, width: 0, height: 0 },
      X = !0,
      u = Ye();
    const _e = new Map(),
      ht = new Map();
    let m = null,
      ae = null,
      se = 0,
      le = 0,
      xe = { start: 0, end: 0 },
      Be = 1,
      $e = 0,
      Ee = 0,
      de = !1,
      ft = !1;
    const Re =
        ((o = (i = n?.options) === null || i === void 0 ? void 0 : i.spreadsheet) === null ||
        o === void 0
          ? void 0
          : o.resizableColumns) === !0,
      ce = Fr(Zn(t, n), { logErrors: !1 }),
      ze = () => C.find((a) => a.id === L),
      ar = () => {
        const a = C.filter((s) => !s.hidden);
        return a.length ? a : C;
      },
      te = () => {
        var a;
        return L ?? ((a = C[0]) === null || a === void 0 ? void 0 : a.id);
      },
      Pe = () => x.clientHeight || 0,
      ut = () => !H && !ie && (X || P),
      sr = () => !ut() && !H && ie && ct > 0,
      N = (a) => Math.max(1, Math.round(a * A)),
      lr = (a) => Math.max(0.1, Math.round(a * A)),
      dr = () => {
        var a;
        if (!C.length) return '正在解析 Excel 工作簿，请耐心等待...';
        const s = (a = ze()) === null || a === void 0 ? void 0 : a.name;
        return s ? `正在准备「${s}」...` : '正在准备工作表内容...';
      },
      cr = () =>
        z ? `已缓存 ${Math.min(dt * V, z).toLocaleString()} / ${z.toLocaleString()} 行` : '',
      hr = () => {
        var a, s;
        const h = z || ((a = ze()) === null || a === void 0 ? void 0 : a.rowCount) || 0,
          g = oe || ((s = ze()) === null || s === void 0 ? void 0 : s.colCount) || 0;
        return h
          ? g
            ? `共 ${h} 行，${g} 列，按视口预取平滑加载`
            : `共 ${h} 行，按视口预取平滑加载`
          : '';
      },
      gt = () => ({
        scale: A,
        label: `${Math.round(A * 100)}%`,
        canZoomIn: A < 2.5,
        canZoomOut: A > 0.5,
        canReset: A !== 1,
        minScale: 0.5,
        maxScale: 2.5,
      }),
      pt = () => {
        const s = Math.max(ee.width - N(pe), 0),
          h = Math.max(ee.height - N(Qe), 0),
          g = we.filter((b) => {
            const T = N(b.left) - ee.scrollX,
              M = N(b.top) - ee.scrollY;
            return (
              T + N(b.width) >= -240 && T <= s + 240 && M + N(b.height) >= -240 && M <= h + 240
            );
          });
        (Oe(R, g.length === 0),
          Object.assign(R.style, { left: `${N(pe)}px`, top: `${N(Qe)}px` }),
          (w.style.transform = `translate(${-ee.scrollX}px, ${-ee.scrollY}px)`),
          w.replaceChildren(
            ...g.map((b, T) => {
              const M = c.createElement('img');
              return (
                (M.className = 'excel-image'),
                (M.src = b.src),
                (M.alt = b.id),
                (M.draggable = !1),
                Object.assign(M.style, {
                  left: `${N(b.left)}px`,
                  top: `${N(b.top)}px`,
                  width: `${N(b.width)}px`,
                  height: `${N(b.height)}px`,
                }),
                (M.dataset.imageIndex = `${T}`),
                M
              );
            }),
          ));
      },
      Ve = () => {
        requestAnimationFrame(() => {
          var a;
          (a = F.querySelector('.sheet-tab.active')) === null ||
            a === void 0 ||
            a.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
        });
      },
      k = () => {
        Oe(W, !ut());
        const a = W.querySelector('[data-loading-title]');
        (a && (a.textContent = dr()), (U.textContent = H), Oe(U, !H), Oe($, !sr()));
        const s = $.querySelector('.sheet-loading-summary');
        (s && (s.textContent = cr()),
          (G.textContent = hr()),
          F.replaceChildren(
            ...ar().map((h) => {
              const g = c.createElement('button');
              return (
                (g.type = 'button'),
                (g.className = `sheet-tab${L === h.id ? ' active' : ''}`),
                (g.title = h.name),
                (g.textContent = h.name),
                g.setAttribute('aria-pressed', L === h.id ? 'true' : 'false'),
                g.addEventListener('click', () => Sr(h.id)),
                g
              );
            }),
          ),
          pt());
      },
      fr = (a) => {
        ((X = a), k());
      },
      mt = (a, s) => {
        (fr(!0), ce.emit(a, s));
      },
      Ue = (a, s) => {
        ((a.__baseHeight = s), (a._height = lr(s)));
      },
      ur = () => {
        u.rowHeightCache.forEach((a, s) => {
          const h = u.rows[s];
          h && Ue(h, a);
        });
      },
      Ce = (a) => ((A = qn(a)), ur(), Ge(), E.emit(), k(), gt());
    Hr(p, {
      zoomIn: () => Ce(A + 0.1),
      zoomOut: () => Ce(A - 0.1),
      resetZoom: () => Ce(1),
      setZoom: Ce,
      getState: gt,
      subscribe: E.subscribe,
    });
    const re = () => {
        ((dt = u.loadedWindows.size), (ct = u.loadingWindows.size), k());
      },
      he = () => {
        ((ee = {
          scrollX: m?.ctx.scrollX || 0,
          scrollY: m?.ctx.scrollY || 0,
          width: x.clientWidth || 0,
          height: x.clientHeight || 0,
        }),
          pt());
      },
      gr = () => ({
        config: Ze({
          hostHeight: Pe(),
          resizableColumns: Re,
          sheetDefaults: Y,
          virtualState: u,
          zoomScale: A,
        }),
        columns: Bt(u.columns, A),
      }),
      pr = () => {
        ((xe = { start: 0, end: 0 }), (Be = 1), ($e = 0));
      },
      bt = (a, s) => {
        !u.active ||
          !u.totalRows ||
          Br({ startRow: a, endRow: s, direction: Be, totalRows: u.totalRows }).forEach((h) =>
            _t(h, !0),
          );
      },
      fe = () => {
        !m ||
          de ||
          (le && cancelAnimationFrame(le),
          (le = requestAnimationFrame(() => {
            if (((le = 0), !m || !u.active || !u.totalRows || de)) return;
            const a = Math.max(m.ctx.body.headIndex || 0, 0),
              s = Math.max(m.ctx.body.tailIndex || a, a),
              h = m.ctx.scrollY || 0;
            ((Be = h >= $e ? 1 : -1), ($e = h), (xe = { start: a, end: s }), he(), bt(a, s));
          })));
      },
      Me = () =>
        m ||
        ((m = new v(x, {
          data: [],
          columns: [],
          config: Ze({
            hostHeight: Pe(),
            resizableColumns: Re,
            sheetDefaults: Y,
            virtualState: u,
            zoomScale: A,
          }),
        })),
        m.on('onScrollX', fe),
        m.on('onScrollY', fe),
        m.on('resize', fe),
        m.on('resizeColumnChange', br),
        m),
      vt = (a, s = u.columns, h = u.rows, g = !1) => {
        const b = {
          config: Ze({
            hostHeight: Pe(),
            resizableColumns: Re,
            sheetDefaults: Y,
            virtualState: u,
            zoomScale: A,
          }),
          columns: Bt(s, A),
        };
        if ((a.loadConfig(b.config), a.loadColumns(b.columns), a.loadData(h), a.draw(), he(), g)) {
          requestAnimationFrame(() => {
            (a.scrollTo(0, 0), a.draw(), he(), fe());
          });
          return;
        }
        fe();
      };
    function Ge() {
      const a = Me(),
        { config: s, columns: h } = gr();
      (a.loadConfig(s),
        u.active && h.length && a.loadColumns(h),
        a.doLayout(),
        a.draw(),
        he(),
        fe());
    }
    function wt(a, s, h) {
      for (const g of a) {
        if (`${g.key}` === s) return ((g.width = h), !0);
        if (Array.isArray(g.children) && wt(g.children, s, h)) return !0;
      }
      return !1;
    }
    function mr() {
      var a;
      try {
        (a = m?.setCustomHeader) === null || a === void 0 || a.call(m, { resizableData: {} }, !0);
      } catch {}
    }
    function br(a) {
      if (!Re || de) return;
      const s = a?.key === void 0 ? '' : `${a.key}`,
        h = Number(a?.width);
      if (!s || s === Ut || !Number.isFinite(h) || h <= 0) return;
      const g = Math.max(1, Math.round(h / Math.max(A, 0.01)));
      if (!wt(u.columns, s, Math.max(g, Math.round(Kt / Math.max(A, 1))))) return;
      const T = te();
      (T !== void 0 && _e.set(T, u), mr(), Ge());
    }
    function _t(a = 0, s = !0) {
      const h = te();
      if (h === void 0) return;
      const g = He(a, u.totalRows);
      u.loadedWindows.has(g) ||
        u.loadingWindows.has(g) ||
        (u.loadingWindows.add(g),
        re(),
        u.active && (St(u.rows, u.totalRows, g, Q.Loading), m?.draw()),
        (H = ''),
        mt('parseSheet', { sheet: h, startRow: g, pageSize: V, sessionId: Ee }),
        s && ((X = !1), k()));
    }
    const vr = (a) => {
        const s = a.meta;
        if (!s) return;
        const { columns: h, dataKeys: g } = Ln(a);
        ((u = {
          ...Ye(),
          active: !0,
          totalRows: s.totalRows,
          totalCols: s.totalCols,
          indexOffset: Sn(a),
          defaults: a.defaults,
          dataKeys: g,
          rows: Dr(s.totalRows),
          columns: h,
        }),
          (Y = a.defaults),
          (z = s.totalRows),
          (oe = s.totalCols),
          re(),
          queueMicrotask(() => {
            de || vt(Me(), h, u.rows, !0);
          }));
      },
      wr = (a) => {
        u.dataKeys.forEach((s) => {
          delete a[s];
        });
      },
      _r = (a) => {
        Array.isArray(a) &&
          a.forEach((s, h) => {
            if (s === void 0) return;
            const g = u.rows[h];
            if (!g) return;
            const b = tt(s, u.defaults.rowHeight);
            (Ue(g, b), u.rowHeightCache.set(h, b));
          });
      },
      xr = (a) => {
        var s, h;
        const g = a.meta;
        if (!g) return;
        const b = [],
          T = Math.min(g.endRow, u.totalRows);
        for (let M = g.startRow; M < T; M += 1) {
          const q = u.rows[M],
            ue = M - g.startRow;
          if (!q) continue;
          (wr(q),
            (((s = a.data) === null || s === void 0 ? void 0 : s[ue]) || []).forEach((ye, kr) => {
              ye === '' || ye === null || ye === void 0 || (q[ot(kr)] = ye);
            }));
          const Tr = It(a.rowHeights, ue, u.defaults.rowHeight),
            Ct = tt(
              It((h = a.structure) === null || h === void 0 ? void 0 : h.rowHeights, M, Tr),
              u.defaults.rowHeight,
            );
          (Ue(q, Ct), (q[Fe] = Q.Loaded), u.rowHeightCache.set(M, Ct), b.push(M));
        }
        u.windowRows.set(g.startRow, b);
      },
      Er = (a) => {
        const s = a.meta;
        if (!s) return;
        const h = [];
        (Object.entries(a.cell || {}).forEach(([g, b]) => {
          const [T, M] = g.split('-').map(Number),
            q = Z(s.startRow + T, M + 1),
            ue = Vn(b);
          ue && (u.cellCache.set(q, ue), h.push(q));
        }),
          u.windowCells.set(s.startRow, h));
      },
      xt = (a) => {
        (u.mergeStartMap.clear(),
          u.mergeCoveredMap.clear(),
          a.forEach((s) => {
            const h = Z(s.row, s.col + 1);
            u.mergeStartMap.set(h, { ...s, col: s.col + 1 });
            for (let g = 0; g < s.rowspan; g += 1)
              for (let b = 0; b < s.colspan; b += 1) {
                if (g === 0 && b === 0) continue;
                const T = Z(s.row + g, s.col + b + 1);
                u.mergeCoveredMap.set(T, !0);
              }
          }));
      },
      Rr = (a) => {
        const s = a.structure,
          h = s?.merge;
        if (h) xt(h);
        else {
          const g = a.meta;
          g &&
            !u.mergeStartMap.size &&
            xt((a.merge || []).map((b) => ({ ...b, row: b.row + g.startRow })));
        }
        if ((_r(s?.rowHeights), s?.images)) {
          we = s.images;
          const g = te();
          g !== void 0 && ht.set(g, s.images);
        }
      },
      Cr = (a) => {
        var s;
        const h = a.meta;
        if (!h) return;
        (u.active || vr(a),
          Rr(a),
          xr(a),
          Er(a),
          u.loadedWindows.add(h.startRow),
          u.loadingWindows.delete(h.startRow),
          re(),
          (ie = !0));
        const g = te();
        (g !== void 0 && _e.set(g, u),
          m?.draw(),
          (X = !1),
          (P = !1),
          k(),
          ft || ((ft = !0), (s = n?.onProgressiveRender) === null || s === void 0 || s.call(n)));
        const b = xe.start || h.startRow,
          T = Math.max(xe.end, h.endRow - 1, h.startRow);
        bt(b, T);
      },
      Mr = () => {
        ((H = ''),
          (z = 0),
          (oe = 0),
          (Y = { ...qe }),
          (we = []),
          (u = Ye()),
          (ie = !1),
          pr(),
          re(),
          he(),
          m && (m.loadColumns([]), m.loadData([]), m.scrollTo(0, 0), m.draw()));
      },
      yr = () => {
        const a = te();
        a === void 0 || !u.active || _e.set(a, u);
      },
      Ar = (a) => {
        const s = _e.get(a);
        return s
          ? (s.loadingWindows.clear(),
            (u = s),
            (H = ''),
            (z = s.totalRows),
            (oe = s.totalCols),
            (Y = s.defaults),
            (we = ht.get(a) || []),
            (ie = s.loadedWindows.size > 0),
            (P = !ie),
            re(),
            queueMicrotask(() => {
              de || (vt(Me(), s.columns, s.rows), he());
            }),
            !0)
          : !1;
      },
      Et = () => {
        const a = te();
        if (a === void 0) {
          ((X = !1), (P = !1), k());
          return;
        }
        if (((Ee += 1), Ar(a))) {
          ((X = !1), k());
          return;
        }
        ((P = !0), Mr(), _t(0, !1));
      };
    function Sr(a) {
      if (L === a) {
        Ve();
        return;
      }
      (yr(), (L = a), k(), Et(), Ve());
    }
    const Lr = () => {
      mt('parseWorkbook', { workbook: e });
    };
    (ce.onWorkerEvent('sheets', ({ sheets: a }) => {
      C = a;
      const s = a.find((h) => !h.hidden) || a[0];
      if (s) {
        ((L = s.id), k(), Et(), Ve());
        return;
      }
      ((P = !1), (X = !1), k());
    }),
      ce.onWorkerEvent('parseSheet', ({ sessionId: a, sheet: s, sheetData: h }) => {
        a !== Ee || s !== te() || Cr(h);
      }),
      ce.onWorkerEvent('parseError', ({ sessionId: a, startRow: s, message: h }) => {
        (a && a !== Ee) ||
          ((P = !1),
          (X = !1),
          typeof s == 'number'
            ? (u.loadingWindows.delete(s),
              re(),
              u.active && (St(u.rows, u.totalRows, s, Q.Placeholder), m?.draw()))
            : (u.loadingWindows.clear(), re()),
          (H = h || 'Excel 解析失败'),
          k());
      }),
      ce.onWorkerError((a) => {
        ((P = !1), (X = !1), (H = a.message || 'Excel Worker 运行失败'), k());
      }),
      (l = n?.registerExportAdapter) === null ||
        l === void 0 ||
        l.call(n, { print: !1, exportHtml: !1 }),
      Me());
    const Rt =
      ((d = lt(t)) === null || d === void 0 ? void 0 : d.ResizeObserver) ||
      (typeof ResizeObserver < 'u' ? ResizeObserver : void 0);
    return (
      Rt &&
        ((ae = new Rt(() => {
          (se && cancelAnimationFrame(se),
            (se = requestAnimationFrame(() => {
              ((se = 0), Ge());
            })));
        })),
        ae.observe(x)),
      k(),
      Lr(),
      {
        $el: p,
        unmount() {
          var a;
          ((de = !0),
            se && cancelAnimationFrame(se),
            le && cancelAnimationFrame(le),
            ae?.disconnect(),
            (ae = null),
            Nr(p),
            ce.destroy(),
            m?.destroy(),
            (m = null),
            (a = n?.registerExportAdapter) === null || a === void 0 || a.call(n, null));
        },
      }
    );
  },
  oo = Object.defineProperty({ __proto__: null, default: Jn }, Symbol.toStringTag, {
    value: 'Module',
  });
export { oo as s, f as t };
