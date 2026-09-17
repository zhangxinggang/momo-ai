import './markdown-it-vendor-DL4wSELR.js';
import './markdown-vendor-DldLOD9R.js';
import {
  S as _,
  g as G,
  B as H,
  F as I,
  V as k,
  a as N,
  C as P,
  L as z,
} from './model--ne-WQc5.js';
import './ui-vendor-C-FKu2uc.js';
class Z extends z {
  constructor(h) {
    super(h);
  }
  load(h, V, D, y) {
    const L = this,
      m = new I(this.manager);
    (m.setPath(this.path),
      m.setResponseType('arraybuffer'),
      m.setRequestHeader(this.requestHeader),
      m.setWithCredentials(this.withCredentials),
      m.load(
        h,
        function (T) {
          try {
            V(L.parse(T));
          } catch (C) {
            (y ? y(C) : console.error(C), L.manager.itemError(h));
          }
        },
        D,
        y,
      ));
  }
  parse(h) {
    function V(e) {
      const t = new DataView(e),
        o = (32 / 8) * 3 + (32 / 8) * 3 * 3 + 16 / 8,
        a = t.getUint32(80, !0);
      if (80 + 32 / 8 + a * o === t.byteLength) return !0;
      const i = [115, 111, 108, 105, 100];
      for (let s = 0; s < 5; s++) if (D(i, t, s)) return !1;
      return !0;
    }
    function D(e, t, o) {
      for (let a = 0, f = e.length; a < f; a++) if (e[a] !== t.getUint8(o + a)) return !1;
      return !0;
    }
    function y(e) {
      const t = new DataView(e),
        o = t.getUint32(80, !0);
      let a,
        f,
        i,
        s = !1,
        x,
        b,
        A,
        S,
        U;
      for (let n = 0; n < 70; n++)
        t.getUint32(n, !1) == 1129270351 &&
          t.getUint8(n + 4) == 82 &&
          t.getUint8(n + 5) == 61 &&
          ((s = !0),
          (x = new Float32Array(o * 3 * 3)),
          (b = t.getUint8(n + 6) / 255),
          (A = t.getUint8(n + 7) / 255),
          (S = t.getUint8(n + 8) / 255),
          (U = t.getUint8(n + 9) / 255));
      const p = 84,
        r = 50,
        c = new H(),
        g = new Float32Array(o * 3 * 3),
        d = new Float32Array(o * 3 * 3),
        w = new P();
      for (let n = 0; n < o; n++) {
        const F = p + n * r,
          v = t.getFloat32(F, !0),
          B = t.getFloat32(F + 4, !0),
          R = t.getFloat32(F + 8, !0);
        if (s) {
          const l = t.getUint16(F + 48, !0);
          (l & 32768) === 0
            ? ((a = (l & 31) / 31), (f = ((l >> 5) & 31) / 31), (i = ((l >> 10) & 31) / 31))
            : ((a = b), (f = A), (i = S));
        }
        for (let l = 1; l <= 3; l++) {
          const E = F + l * 12,
            u = n * 3 * 3 + (l - 1) * 3;
          ((g[u] = t.getFloat32(E, !0)),
            (g[u + 1] = t.getFloat32(E + 4, !0)),
            (g[u + 2] = t.getFloat32(E + 8, !0)),
            (d[u] = v),
            (d[u + 1] = B),
            (d[u + 2] = R),
            s && (w.setRGB(a, f, i, _), (x[u] = w.r), (x[u + 1] = w.g), (x[u + 2] = w.b)));
        }
      }
      return (
        c.setAttribute('position', new G(g, 3)),
        c.setAttribute('normal', new G(d, 3)),
        s && (c.setAttribute('color', new G(x, 3)), (c.hasColors = !0), (c.alpha = U)),
        c
      );
    }
    function L(e) {
      const t = new H(),
        o = /solid([\s\S]*?)endsolid/g,
        a = /facet([\s\S]*?)endfacet/g,
        f = /solid\s(.+)/;
      let i = 0;
      const s = /[\s]+([+-]?(?:\d*)(?:\.\d*)?(?:[eE][+-]?\d+)?)/.source,
        x = new RegExp('vertex' + s + s + s, 'g'),
        b = new RegExp('normal' + s + s + s, 'g'),
        A = [],
        S = [],
        U = [],
        p = new k();
      let r,
        c = 0,
        g = 0,
        d = 0;
      for (; (r = o.exec(e)) !== null; ) {
        g = d;
        const w = r[0],
          n = (r = f.exec(w)) !== null ? r[1] : '';
        for (U.push(n); (r = a.exec(w)) !== null; ) {
          let B = 0,
            R = 0;
          const l = r[0];
          for (; (r = b.exec(l)) !== null; )
            ((p.x = parseFloat(r[1])), (p.y = parseFloat(r[2])), (p.z = parseFloat(r[3])), R++);
          for (; (r = x.exec(l)) !== null; )
            (A.push(parseFloat(r[1]), parseFloat(r[2]), parseFloat(r[3])),
              S.push(p.x, p.y, p.z),
              B++,
              d++);
          (R !== 1 &&
            console.error(
              "THREE.STLLoader: Something isn't right with the normal of face number " + i,
            ),
            B !== 3 &&
              console.error(
                "THREE.STLLoader: Something isn't right with the vertices of face number " + i,
              ),
            i++);
        }
        const F = g,
          v = d - g;
        ((t.userData.groupNames = U), t.addGroup(F, v, c), c++);
      }
      return (t.setAttribute('position', new N(A, 3)), t.setAttribute('normal', new N(S, 3)), t);
    }
    function m(e) {
      return typeof e != 'string' ? new TextDecoder().decode(e) : e;
    }
    function T(e) {
      if (typeof e == 'string') {
        const t = new Uint8Array(e.length);
        for (let o = 0; o < e.length; o++) t[o] = e.charCodeAt(o) & 255;
        return t.buffer || t;
      } else return e;
    }
    const C = T(h);
    return V(C) ? y(C) : L(m(h));
  }
}
export { Z as STLLoader };
