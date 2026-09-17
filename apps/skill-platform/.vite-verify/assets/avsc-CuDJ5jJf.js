import { g as $e } from './ui-vendor-C-FKu2uc.js';
function Je(T, C) {
  for (var $ = 0; $ < C.length; $++) {
    const R = C[$];
    if (typeof R != 'string' && !Array.isArray(R)) {
      for (const z in R)
        if (z !== 'default' && !(z in T)) {
          const J = Object.getOwnPropertyDescriptor(R, z);
          J && Object.defineProperty(T, z, J.get ? J : { enumerable: !0, get: () => R[z] });
        }
    }
  }
  return Object.defineProperty(T, Symbol.toStringTag, { value: 'Module' });
}
var Te = { exports: {} },
  xe = { exports: {} },
  Ee,
  je;
function me() {
  if (je) return Ee;
  je = 1;
  var T = require('buffer'),
    C = require('crypto'),
    $ = require('util'),
    R = T.Buffer,
    z = new b(4096),
    J = /^[A-Za-z_][A-Za-z0-9_]*$/,
    B = $.format;
  function ie(f) {
    return typeof R.alloc == 'function' ? R.alloc(f) : new R(f);
  }
  function E(f) {
    return typeof R.allocUnsafeSlow == 'function' ? R.allocUnsafeSlow(f) : new T.SlowBuffer(f);
  }
  function Z(f, h) {
    return typeof R.from == 'function' ? R.from(f, h) : new R(f, h);
  }
  function W(f) {
    return f.charAt(0).toUpperCase() + f.slice(1);
  }
  function re(f, h) {
    return f === h ? 0 : f < h ? -1 : 1;
  }
  function u(f, h, y) {
    var k = f[h];
    return k === void 0 ? y : k;
  }
  function p(f, h) {
    h = h || 'md5';
    var y = C.createHash(h);
    return (y.end(f), y.read());
  }
  function _(f, h) {
    var y = -1,
      k,
      A;
    if (!f) return -1;
    for (k = 0, A = f.length; k < A; k++)
      if (f[k] === h) {
        if (y >= 0) return -2;
        y = k;
      }
    return y;
  }
  function S(f, h) {
    var y = {},
      k,
      A;
    for (k = 0; k < f.length; k++) ((A = f[k]), (y[h(A)] = A));
    return y;
  }
  function q(f) {
    return Object.keys(f).map(function (h) {
      return f[h];
    });
  }
  function K(f, h) {
    var y = Object.create(null),
      k,
      A,
      G;
    for (k = 0, A = f.length; k < A; k++) {
      if (((G = f[k]), h && (G = h(G)), y[G])) return !0;
      y[G] = !0;
    }
    return !1;
  }
  function L(f, h, y) {
    var k = Object.getOwnPropertyNames(f),
      A,
      G,
      H;
    for (A = 0, G = k.length; A < G; A++)
      if (((H = k[A]), !h.hasOwnProperty(H) || y)) {
        var oe = Object.getOwnPropertyDescriptor(f, H);
        Object.defineProperty(h, H, oe);
      }
    return h;
  }
  function V(f) {
    return J.test(f);
  }
  function O(f, h) {
    return (
      ~f.indexOf('.') ? (f = f.replace(/^\./, '')) : h && (f = h + '.' + f),
      f.split('.').forEach(function (y) {
        if (!V(y)) throw new Error(B('invalid name: %j', f));
      }),
      f
    );
  }
  function Q(f) {
    var h = f.split('.');
    return h[h.length - 1];
  }
  function M(f) {
    var h = /^(.*)\.[^.]+$/.exec(f);
    return h ? h[1] : void 0;
  }
  function ee(f, h) {
    h = h | 0;
    var y = f.charAt(h++);
    if (/[\d-]/.test(y)) {
      for (; /[eE\d.+-]/.test(f.charAt(h)); ) h++;
      return h;
    } else {
      if (/true|null/.test(f.slice(h - 1, h + 3))) return h + 3;
      if (/false/.test(f.slice(h - 1, h + 4))) return h + 4;
    }
    var k = 0,
      A = !1;
    do
      switch (y) {
        case '{':
        case '[':
          A || k++;
          break;
        case '}':
        case ']':
          if (!A && !--k) return h;
          break;
        case '"':
          if (((A = !A), !k && !A)) return h;
          break;
        case '\\':
          h++;
      }
    while ((y = f.charAt(h++)));
    return -1;
  }
  function d() {
    throw new Error('abstract');
  }
  function m(f, h) {
    var y = f.prototype,
      k,
      A,
      G,
      H;
    for (k = 0, A = h.length; k < A; k++)
      ((G = h[k]),
        (H = 'get' + W(G)),
        (y[H] = $.deprecate(oe(G), 'use `.' + G + '` instead of `.' + H + '()`')));
    function oe(ce) {
      return function () {
        var ae = this[ce];
        return typeof ae == 'function' ? ae.apply(this, arguments) : ae;
      };
    }
  }
  function b(f) {
    ((this._len = f | 0), (this._pos = 0), (this._slab = ie(this._len)));
  }
  b.prototype.alloc = function (f) {
    if (f < 0) throw new Error('negative length');
    var h = this._len;
    return f > h
      ? ie(f)
      : (this._pos + f > h && ((this._slab = ie(h)), (this._pos = 0)),
        this._slab.slice(this._pos, (this._pos += f)));
  };
  function v(f) {
    var h = 1103515245,
      y = 12345,
      k = Math.pow(2, 31),
      A = Math.floor(f || Math.random() * (k - 1));
    ((this._max = k),
      (this._nextInt = function () {
        return (A = (h * A + y) % k);
      }));
  }
  ((v.prototype.nextBoolean = function () {
    return !!(this._nextInt() % 2);
  }),
    (v.prototype.nextInt = function (f, h) {
      return (
        h === void 0 && ((h = f), (f = 0)),
        (h = h === void 0 ? this._max : h),
        f + Math.floor(this.nextFloat() * (h - f))
      );
    }),
    (v.prototype.nextFloat = function (f, h) {
      return (
        h === void 0 && ((h = f), (f = 0)),
        (h = h === void 0 ? 1 : h),
        f + ((h - f) * this._nextInt()) / this._max
      );
    }),
    (v.prototype.nextString = function (f, h) {
      ((f |= 0), (h = h || 'aA'));
      var y = '';
      (h.indexOf('a') > -1 && (y += 'abcdefghijklmnopqrstuvwxyz'),
        h.indexOf('A') > -1 && (y += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'),
        h.indexOf('#') > -1 && (y += '0123456789'),
        h.indexOf('!') > -1 && (y += '~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\'));
      for (var k = [], A = 0; A < f; A++) k.push(this.choice(y));
      return k.join('');
    }),
    (v.prototype.nextBuffer = function (f) {
      var h = [],
        y;
      for (y = 0; y < f; y++) h.push(this.nextInt(256));
      return Z(h);
    }),
    (v.prototype.choice = function (f) {
      var h = f.length;
      if (!h) throw new Error('choosing from empty array');
      return f[this.nextInt(h)];
    }));
  function D() {
    ((this._index = 0), (this._items = []));
  }
  ((D.prototype.push = function (f) {
    var h = this._items,
      y = h.length | 0,
      k;
    for (h.push(f); y > 0 && h[y].index < h[(k = (y - 1) >> 1)].index; )
      ((f = h[y]), (h[y] = h[k]), (h[k] = f), (y = k));
  }),
    (D.prototype.pop = function () {
      var f = this._items,
        h = (f.length - 1) | 0,
        y = f[0];
      if (!y || y.index > this._index) return null;
      if ((this._index++, !h)) return (f.pop(), y);
      f[0] = f.pop();
      for (
        var k = h >> 1, A = 0, G, H, oe, ce, ae, he, pe;
        A < k &&
        ((ce = f[A]),
        (G = (A << 1) + 1),
        (H = (A + 1) << 1),
        (he = f[G]),
        (pe = f[H]),
        !pe || he.index <= pe.index ? ((ae = he), (oe = G)) : ((ae = pe), (oe = H)),
        !(ae.index >= ce.index));
      )
        ((f[oe] = ce), (f[A] = ae), (A = oe));
      return y;
    }));
  function w(f, h) {
    if (((this.buf = f), (this.pos = h | 0), this.pos < 0)) throw new Error('negative offset');
  }
  ((w.prototype.isValid = function () {
    return this.pos <= this.buf.length;
  }),
    (w.prototype._invalidate = function () {
      this.pos = this.buf.length + 1;
    }),
    (w.prototype.readBoolean = function () {
      return !!this.buf[this.pos++];
    }),
    (w.prototype.skipBoolean = function () {
      this.pos++;
    }),
    (w.prototype.writeBoolean = function (f) {
      this.buf[this.pos++] = !!f;
    }),
    (w.prototype.readInt = w.prototype.readLong =
      function () {
        var f = 0,
          h = 0,
          y = this.buf,
          k,
          A,
          G,
          H;
        do ((k = y[this.pos++]), (A = k & 128), (f |= (k & 127) << h), (h += 7));
        while (A && h < 28);
        if (A) {
          ((G = f), (H = 268435456));
          do ((k = y[this.pos++]), (G += (k & 127) * H), (H *= 128));
          while (k & 128);
          return (G % 2 ? -(G + 1) : G) / 2;
        }
        return (f >> 1) ^ -(f & 1);
      }),
    (w.prototype.skipInt = w.prototype.skipLong =
      function () {
        for (var f = this.buf; f[this.pos++] & 128; );
      }),
    (w.prototype.writeInt = w.prototype.writeLong =
      function (f) {
        var h = this.buf,
          y,
          k;
        if (f >= -1073741824 && f < 1073741824) {
          k = f >= 0 ? f << 1 : (~f << 1) | 1;
          do ((h[this.pos] = k & 127), (k >>= 7));
          while (k && (h[this.pos++] |= 128));
        } else {
          y = f >= 0 ? f * 2 : -f * 2 - 1;
          do ((h[this.pos] = y & 127), (y /= 128));
          while (y >= 1 && (h[this.pos++] |= 128));
        }
        this.pos++;
      }),
    (w.prototype.readFloat = function () {
      var f = this.buf,
        h = this.pos;
      return ((this.pos += 4), this.pos > f.length ? 0 : this.buf.readFloatLE(h));
    }),
    (w.prototype.skipFloat = function () {
      this.pos += 4;
    }),
    (w.prototype.writeFloat = function (f) {
      var h = this.buf,
        y = this.pos;
      if (((this.pos += 4), !(this.pos > h.length))) return this.buf.writeFloatLE(f, y);
    }),
    (w.prototype.readDouble = function () {
      var f = this.buf,
        h = this.pos;
      return ((this.pos += 8), this.pos > f.length ? 0 : this.buf.readDoubleLE(h));
    }),
    (w.prototype.skipDouble = function () {
      this.pos += 8;
    }),
    (w.prototype.writeDouble = function (f) {
      var h = this.buf,
        y = this.pos;
      if (((this.pos += 8), !(this.pos > h.length))) return this.buf.writeDoubleLE(f, y);
    }),
    (w.prototype.readFixed = function (f) {
      var h = this.pos;
      if (((this.pos += f), !(this.pos > this.buf.length))) {
        var y = z.alloc(f);
        return (this.buf.copy(y, 0, h, h + f), y);
      }
    }),
    (w.prototype.skipFixed = function (f) {
      this.pos += f;
    }),
    (w.prototype.writeFixed = function (f, h) {
      h = h || f.length;
      var y = this.pos;
      ((this.pos += h), !(this.pos > this.buf.length) && f.copy(this.buf, y, 0, h));
    }),
    (w.prototype.readBytes = function () {
      var f = this.readLong();
      if (f < 0) {
        this._invalidate();
        return;
      }
      return this.readFixed(f);
    }),
    (w.prototype.skipBytes = function () {
      var f = this.readLong();
      if (f < 0) {
        this._invalidate();
        return;
      }
      this.pos += f;
    }),
    (w.prototype.writeBytes = function (f) {
      var h = f.length;
      (this.writeLong(h), this.writeFixed(f, h));
    }),
    typeof R.prototype.utf8Slice == 'function'
      ? (w.prototype.readString = function () {
          var f = this.readLong();
          if (f < 0) return (this._invalidate(), '');
          var h = this.pos,
            y = this.buf;
          if (((this.pos += f), !(this.pos > y.length))) return this.buf.utf8Slice(h, h + f);
        })
      : (w.prototype.readString = function () {
          var f = this.readLong();
          if (f < 0) return (this._invalidate(), '');
          var h = this.pos,
            y = this.buf;
          if (((this.pos += f), !(this.pos > y.length))) return this.buf.slice(h, h + f).toString();
        }),
    (w.prototype.skipString = function () {
      var f = this.readLong();
      if (f < 0) {
        this._invalidate();
        return;
      }
      this.pos += f;
    }),
    (w.prototype.writeString = function (f) {
      var h = R.byteLength(f),
        y = this.buf;
      this.writeLong(h);
      var k = this.pos;
      if (((this.pos += h), !(this.pos > y.length)))
        if (h > 64 && typeof R.prototype.utf8Write == 'function') y.utf8Write(f, k, h);
        else {
          var A, G, H, oe;
          for (A = 0, G = h; A < G; A++)
            ((H = f.charCodeAt(A)),
              H < 128
                ? (y[k++] = H)
                : H < 2048
                  ? ((y[k++] = (H >> 6) | 192), (y[k++] = (H & 63) | 128))
                  : (H & 64512) === 55296 && ((oe = f.charCodeAt(A + 1)) & 64512) === 56320
                    ? ((H = 65536 + ((H & 1023) << 10) + (oe & 1023)),
                      A++,
                      (y[k++] = (H >> 18) | 240),
                      (y[k++] = ((H >> 12) & 63) | 128),
                      (y[k++] = ((H >> 6) & 63) | 128),
                      (y[k++] = (H & 63) | 128))
                    : ((y[k++] = (H >> 12) | 224),
                      (y[k++] = ((H >> 6) & 63) | 128),
                      (y[k++] = (H & 63) | 128)));
        }
    }),
    typeof R.prototype.latin1Write == 'function'
      ? (w.prototype.writeBinary = function (f, h) {
          var y = this.pos;
          ((this.pos += h), !(this.pos > this.buf.length) && this.buf.latin1Write(f, y, h));
        })
      : typeof R.prototype.binaryWrite == 'function'
        ? (w.prototype.writeBinary = function (f, h) {
            var y = this.pos;
            ((this.pos += h), !(this.pos > this.buf.length) && this.buf.binaryWrite(f, y, h));
          })
        : (w.prototype.writeBinary = function (f, h) {
            var y = this.pos;
            ((this.pos += h), !(this.pos > this.buf.length) && this.buf.write(f, y, h, 'binary'));
          }),
    (w.prototype.matchBoolean = function (f) {
      return this.buf[this.pos++] - f.buf[f.pos++];
    }),
    (w.prototype.matchInt = w.prototype.matchLong =
      function (f) {
        var h = this.readLong(),
          y = f.readLong();
        return h === y ? 0 : h < y ? -1 : 1;
      }),
    (w.prototype.matchFloat = function (f) {
      var h = this.readFloat(),
        y = f.readFloat();
      return h === y ? 0 : h < y ? -1 : 1;
    }),
    (w.prototype.matchDouble = function (f) {
      var h = this.readDouble(),
        y = f.readDouble();
      return h === y ? 0 : h < y ? -1 : 1;
    }),
    (w.prototype.matchFixed = function (f, h) {
      return this.readFixed(h).compare(f.readFixed(h));
    }),
    (w.prototype.matchBytes = w.prototype.matchString =
      function (f) {
        var h = this.readLong(),
          y = this.pos;
        this.pos += h;
        var k = f.readLong(),
          A = f.pos;
        f.pos += k;
        var G = this.buf.slice(y, this.pos),
          H = f.buf.slice(A, f.pos);
        return G.compare(H);
      }),
    (w.prototype.unpackLongBytes = function () {
      var f = ie(8),
        h = 0,
        y = 0,
        k = 6,
        A = this.buf,
        G,
        H;
      for (G = A[this.pos++], H = G & 1, f.fill(0), h |= (G & 127) >> 1; G & 128; )
        ((G = A[this.pos++]),
          (h |= (G & 127) << k),
          (k += 7),
          k >= 8 && ((k -= 8), (f[y++] = h), (h >>= 8)));
      return ((f[y] = h), H && Y(f, 8), f);
    }),
    (w.prototype.packLongBytes = function (f) {
      var h = (f[7] & 128) >> 7,
        y = this.buf,
        k = 1,
        A = 0,
        G = 3,
        H;
      h ? (Y(f, 8), (H = 1)) : (H = 0);
      for (var oe = [f.readUIntLE(0, 3), f.readUIntLE(3, 3), f.readUIntLE(6, 2)]; G && !oe[--G]; );
      for (; A < G; )
        for (H |= oe[A++] << k, k += 24; k > 7; )
          ((y[this.pos++] = (H & 127) | 128), (H >>= 7), (k -= 7));
      H |= oe[G] << k;
      do ((y[this.pos] = H & 127), (H >>= 7));
      while (H && (y[this.pos++] |= 128));
      (this.pos++, h && Y(f, 8));
    }));
  function Y(f, h) {
    for (; h--; ) f[h] = ~f[h];
  }
  return (
    (Ee = {
      abstractFunction: d,
      addDeprecatedGetters: m,
      bufferFrom: Z,
      capitalize: W,
      copyOwnProperties: L,
      getHash: p,
      compare: re,
      getOption: u,
      impliedNamespace: M,
      isValidName: V,
      jsonEnd: ee,
      newBuffer: ie,
      newSlowBuffer: E,
      objectValues: q,
      qualify: O,
      toMap: S,
      singleIndexOf: _,
      hasDuplicates: K,
      unqualify: Q,
      BufferPool: b,
      Lcg: v,
      OrderedQueue: D,
      Tap: w,
    }),
    Ee
  );
}
var Se, Fe;
function Ae() {
  if (Fe) return Se;
  Fe = 1;
  var T = me(),
    C = require('buffer'),
    $ = require('util'),
    R = C.Buffer,
    z = T.Tap,
    J = $.debuglog('avsc:types'),
    B = $.format,
    ie = {
      array: D,
      boolean: S,
      bytes: Q,
      double: V,
      enum: m,
      error: w,
      fixed: b,
      float: L,
      int: q,
      long: K,
      map: v,
      null: _,
      record: w,
      string: O,
    },
    E = new T.Lcg(),
    Z = new z(T.newSlowBuffer(1024)),
    W = null,
    re = [];
  function u(e, r) {
    var i;
    if (
      (W ? ((i = W), re.push([W, this]), (W = null)) : (i = this),
      (this._hash = new k()),
      (this.name = void 0),
      (this.aliases = void 0),
      (this.doc = e && e.doc ? '' + e.doc : void 0),
      e)
    ) {
      var t = e.name,
        n = e.namespace === void 0 ? r && r.namespace : e.namespace;
      if (t !== void 0) {
        if (((t = ye(t, n)), oe(t))) throw new Error(B('cannot rename primitive type: %j', t));
        var s = r && r.registry;
        if (s) {
          if (s[t] !== void 0) throw new Error(B('duplicate type name: %s', t));
          s[t] = i;
        }
      } else if (r && r.noAnonymousTypes)
        throw new Error(B('missing name property in schema: %j', e));
      ((this.name = t),
        (this.aliases = e.aliases
          ? e.aliases.map(function (o) {
              return ye(o, n);
            })
          : []));
    }
  }
  ((u.forSchema = function (e, r) {
    ((r = r || {}), (r.registry = r.registry || {}));
    var i = (function (l) {
      switch (
        (l === !0
          ? (l = 'always')
          : l === !1
            ? (l = 'never')
            : l === void 0
              ? (l = 'auto')
              : typeof l == 'string' && (l = l.toLowerCase()),
        l)
      ) {
        case 'always':
          return d;
        case 'never':
          return ee;
        case 'auto':
          return;
        default:
          throw new Error(B('invalid wrap unions option: %j', l));
      }
    })(r.wrapUnions);
    if (e === null) throw new Error('invalid type: null (did you mean "null"?)');
    if (u.isType(e)) return e;
    var t;
    if (r.typeHook && (t = r.typeHook(e, r))) {
      if (!u.isType(t)) throw new Error(B('invalid typehook return value: %j', t));
      return t;
    }
    if (typeof e == 'string') {
      if (((e = ye(e, r.namespace)), (t = r.registry[e]), t)) return t;
      if (oe(e)) return (r.registry[e] = u.forSchema({ type: e }, r));
      throw new Error(B('undefined type name: %s', e));
    }
    if (e.logicalType && r.logicalTypes && !W) {
      var n = r.logicalTypes[e.logicalType];
      if (n) {
        var s = r.namespace,
          o = {};
        Object.keys(r.registry).forEach(function (l) {
          o[l] = r.registry[l];
        });
        try {
          return (J('instantiating logical type for %s', e.logicalType), new n(e, r));
        } catch (l) {
          if ((J('failed to instantiate logical type for %s', e.logicalType), r.assertLogicalTypes))
            throw l;
          ((W = null), (r.namespace = s), (r.registry = o));
        }
      }
    }
    if (Array.isArray(e)) {
      var a = W;
      W = null;
      var c = e.map(function (l) {
        return u.forSchema(l, r);
      });
      (i || (i = _e(c) ? d : ee), (W = a), (t = new i(c, r)));
    } else
      t = (function (l) {
        var x = ie[l];
        if (x === void 0) throw new Error(B('unknown type: %j', l));
        return new x(e, r);
      })(e.type);
    return t;
  }),
    (u.forValue = function (e, r) {
      if (
        ((r = r || {}),
        (r.emptyArrayType = r.emptyArrayType || u.forSchema({ type: 'array', items: 'null' })),
        r.valueHook)
      ) {
        var i = r.valueHook(e, r);
        if (i !== void 0) {
          if (!u.isType(i)) throw new Error(B('invalid value hook return value: %j', i));
          return i;
        }
      }
      switch (typeof e) {
        case 'string':
          return u.forSchema('string', r);
        case 'boolean':
          return u.forSchema('boolean', r);
        case 'number':
          return (e | 0) === e
            ? u.forSchema('int', r)
            : Math.abs(e) < 9007199254740991
              ? u.forSchema('float', r)
              : u.forSchema('double', r);
        case 'object':
          if (e === null) return u.forSchema('null', r);
          if (Array.isArray(e))
            return e.length
              ? u.forSchema(
                  {
                    type: 'array',
                    items: u.forTypes(
                      e.map(function (n) {
                        return u.forValue(n, r);
                      }),
                      r,
                    ),
                  },
                  r,
                )
              : r.emptyArrayType;
          if (R.isBuffer(e)) return u.forSchema('bytes', r);
          var t = Object.keys(e);
          return t.some(function (n) {
            return !T.isValidName(n);
          })
            ? u.forSchema(
                {
                  type: 'map',
                  values: u.forTypes(
                    t.map(function (n) {
                      return u.forValue(e[n], r);
                    }),
                    r,
                  ),
                },
                r,
              )
            : u.forSchema(
                {
                  type: 'record',
                  fields: t.map(function (n) {
                    return { name: n, type: u.forValue(e[n], r) };
                  }),
                },
                r,
              );
        default:
          throw new Error(B('cannot infer type from: %j', e));
      }
    }),
    (u.forTypes = function (e, r) {
      if (!e.length) throw new Error('no types to combine');
      if (e.length === 1) return e[0];
      r = r || {};
      var i = [],
        t = 0,
        n = !0;
      if (
        (e.forEach(function (g) {
          switch (g.typeName) {
            case 'union:unwrapped':
              ((n = !1), (i = i.concat(g.types)));
              break;
            case 'union:wrapped':
              (t++, (i = i.concat(g.types)));
              break;
            case 'null':
              i.push(g);
              break;
            default:
              ((n = !1), i.push(g));
          }
        }),
        t)
      ) {
        if (!n) throw new Error('cannot combine wrapped union');
        var s = {};
        i.forEach(function (g) {
          var j = g.branchName,
            P = s[j];
          if (!P) s[j] = g;
          else if (!g.equals(P)) throw new Error('inconsistent branch type');
        });
        var o = r.wrapUnions,
          a;
        r.wrapUnions = !0;
        try {
          a = u.forSchema(
            Object.keys(s).map(function (g) {
              return s[g];
            }),
            r,
          );
        } catch (g) {
          throw ((r.wrapUnions = o), g);
        }
        return ((r.wrapUnions = o), a);
      }
      var c = {};
      i.forEach(function (g) {
        var j = de(g),
          P = c[j];
        (P || (c[j] = P = []), P.push(g));
      });
      var l = Object.keys(c),
        x = l.map(function (g) {
          var j = c[g];
          if (j.length === 1) return j[0];
          switch (g) {
            case 'null':
            case 'boolean':
              return j[0];
            case 'number':
              return le(j);
            case 'string':
              return ge(j, r);
            case 'buffer':
              return be(j, r);
            case 'array':
              return (
                (j = j.filter(function (P) {
                  return P !== r.emptyArrayType;
                })),
                j.length
                  ? u.forSchema(
                      {
                        type: 'array',
                        items: u.forTypes(
                          j.map(function (P) {
                            return P.itemsType;
                          }),
                          r,
                        ),
                      },
                      r,
                    )
                  : r.emptyArrayType
              );
            default:
              return ke(j, r);
          }
        });
      return x.length === 1 ? x[0] : u.forSchema(x, r);
    }),
    (u.isType = function () {
      var e = arguments.length;
      if (!e) return !1;
      var r = arguments[0];
      if (!r || typeof r._update != 'function' || typeof r.fingerprint != 'function') return !1;
      if (e === 1) return !0;
      var i = r.typeName,
        t;
      for (t = 1; t < e; t++) if (i.indexOf(arguments[t]) === 0) return !0;
      return !1;
    }),
    (u.__reset = function (e) {
      (J('resetting type buffer to %d', e), (Z.buf = T.newSlowBuffer(e)));
    }),
    Object.defineProperty(u.prototype, 'branchName', {
      enumerable: !0,
      get: function () {
        var e = u.isType(this, 'logical') ? this.underlyingType : this;
        return e.name
          ? e.name
          : u.isType(e, 'abstract')
            ? e._concreteTypeName
            : u.isType(e, 'union')
              ? void 0
              : e.typeName;
      },
    }),
    (u.prototype.clone = function (e, r) {
      return r
        ? ((r = {
            coerce: !!r.coerceBuffers | 0,
            fieldHook: r.fieldHook,
            qualifyNames: !!r.qualifyNames,
            skip: !!r.skipMissingFields,
            wrap: !!r.wrapUnions | 0,
          }),
          this._copy(e, r))
        : this.fromBuffer(this.toBuffer(e));
    }),
    (u.prototype.compare = T.abstractFunction),
    (u.prototype.compareBuffers = function (e, r) {
      return this._match(new z(e), new z(r));
    }),
    (u.prototype.createResolver = function (e, r) {
      if (!u.isType(e)) throw new Error(B('not a type: %j', e));
      if (!u.isType(this, 'union', 'logical') && u.isType(e, 'logical'))
        return this.createResolver(e.underlyingType, r);
      ((r = r || {}), (r.registry = r.registry || {}));
      var i, t;
      if (
        u.isType(this, 'record', 'error') &&
        u.isType(e, 'record', 'error') &&
        ((t = this.name + ':' + e.name), (i = r.registry[t]), i)
      )
        return i;
      if (((i = new y(this)), t && (r.registry[t] = i), u.isType(e, 'union'))) {
        var n = e.types.map(function (s) {
          return this.createResolver(s, r);
        }, this);
        i._read = function (s) {
          var o = s.readLong(),
            a = n[o];
          if (a === void 0) throw new Error(B('invalid union index: %s', o));
          return n[o]._read(s);
        };
      } else this._update(i, e, r);
      if (!i._read) throw new Error(B('cannot read %s as %s', e, this));
      return Object.freeze(i);
    }),
    (u.prototype.decode = function (e, r, i) {
      var t = new z(e, r),
        n = A(this, t, i);
      return t.isValid() ? { value: n, offset: t.pos } : { value: void 0, offset: -1 };
    }),
    (u.prototype.encode = function (e, r, i) {
      var t = new z(r, i);
      return (this._write(t, e), t.isValid() ? t.pos : r.length - t.pos);
    }),
    (u.prototype.equals = function (e, r) {
      var i = u.isType(e) && this.fingerprint().equals(e.fingerprint());
      return !i || !(r && r.strict)
        ? i
        : JSON.stringify(this.schema({ exportAttrs: !0 })) ===
            JSON.stringify(e.schema({ exportAttrs: !0 }));
    }),
    (u.prototype.fingerprint = function (e) {
      if (e) return T.getHash(JSON.stringify(this.schema()), e);
      if (!this._hash.str) {
        var r = JSON.stringify(this.schema());
        this._hash.str = T.getHash(r).toString('binary');
      }
      return T.bufferFrom(this._hash.str, 'binary');
    }),
    (u.prototype.fromBuffer = function (e, r, i) {
      var t = new z(e),
        n = A(this, t, r, i);
      if (!t.isValid()) throw new Error('truncated buffer');
      if (!i && t.pos < e.length) throw new Error('trailing data');
      return n;
    }),
    (u.prototype.fromString = function (e) {
      return this._copy(JSON.parse(e), { coerce: 2 });
    }),
    (u.prototype.inspect = function () {
      var e = this.typeName,
        r = ce(e);
      if (oe(e)) return B('<%s>', r);
      var i = this.schema({ exportAttrs: !0, noDeref: !0 });
      return (
        typeof i == 'object' && !u.isType(this, 'logical') && (i.type = void 0),
        B('<%s %j>', r, i)
      );
    }),
    (u.prototype.isValid = function (e, r) {
      var i = (r && r.noUndeclaredFields) | 0,
        t = r && r.errorHook,
        n,
        s;
      return (
        t &&
          ((s = []),
          (n = function (o, a) {
            t.call(this, s.slice(), o, a, e);
          })),
        this._check(e, i, n, s)
      );
    }),
    (u.prototype.random = T.abstractFunction),
    (u.prototype.schema = function (e) {
      return this._attrs({ exportAttrs: !!(e && e.exportAttrs), noDeref: !!(e && e.noDeref) });
    }),
    (u.prototype.toBuffer = function (e) {
      ((Z.pos = 0), this._write(Z, e));
      var r = T.newBuffer(Z.pos);
      return (Z.isValid() ? Z.buf.copy(r, 0, 0, Z.pos) : this._write(new z(r), e), r);
    }),
    (u.prototype.toJSON = function () {
      return this.schema({ exportAttrs: !0 });
    }),
    (u.prototype.toString = function (e) {
      return JSON.stringify(
        e === void 0 ? this.schema({ noDeref: !0 }) : this._copy(e, { coerce: 3 }),
      );
    }),
    (u.prototype.wrap = function (e) {
      var r = this._branchConstructor;
      return r === null ? null : new r(e);
    }),
    (u.prototype._attrs = function (e) {
      e.derefed = e.derefed || {};
      var r = this.name;
      if (r !== void 0) {
        if (e.noDeref || e.derefed[r]) return r;
        e.derefed[r] = !0;
      }
      var i = {};
      (this.name !== void 0 && (i.name = r), (i.type = this.typeName));
      var t = this._deref(i, e);
      return (
        t !== void 0 && (i = t),
        e.exportAttrs &&
          (this.aliases && this.aliases.length && (i.aliases = this.aliases),
          this.doc !== void 0 && (i.doc = this.doc)),
        i
      );
    }),
    (u.prototype._createBranchConstructor = function () {
      var e = this.branchName;
      if (e === 'null') return null;
      var r = ~e.indexOf('.') ? "this['" + e + "']" : 'this.' + e,
        i = 'return function Branch$(val) { ' + r + ' = val; };',
        t = new Function(i)();
      return (
        (t.type = this),
        (t.prototype.unwrap = new Function('return ' + r + ';')),
        (t.prototype.unwrapped = t.prototype.unwrap),
        t
      );
    }),
    (u.prototype._peek = function (e) {
      var r = e.pos,
        i = this._read(e);
      return ((e.pos = r), i);
    }),
    (u.prototype._check = T.abstractFunction),
    (u.prototype._copy = T.abstractFunction),
    (u.prototype._deref = T.abstractFunction),
    (u.prototype._match = T.abstractFunction),
    (u.prototype._read = T.abstractFunction),
    (u.prototype._skip = T.abstractFunction),
    (u.prototype._update = T.abstractFunction),
    (u.prototype._write = T.abstractFunction),
    (u.prototype.getAliases = function () {
      return this.aliases;
    }),
    (u.prototype.getFingerprint = u.prototype.fingerprint),
    (u.prototype.getName = function (e) {
      return this.name || !e ? this.name : this.branchName;
    }),
    (u.prototype.getSchema = u.prototype.schema),
    (u.prototype.getTypeName = function () {
      return this.typeName;
    }));
  function p(e) {
    (u.call(this),
      (this._branchConstructor = this._createBranchConstructor()),
      e || Object.freeze(this));
  }
  ($.inherits(p, u),
    (p.prototype._update = function (e, r) {
      r.typeName === this.typeName && (e._read = this._read);
    }),
    (p.prototype._copy = function (e) {
      return (this._check(e, void 0, ne), e);
    }),
    (p.prototype._deref = function () {
      return this.typeName;
    }),
    (p.prototype.compare = T.compare));
  function _() {
    p.call(this);
  }
  ($.inherits(_, p),
    (_.prototype._check = function (e, r, i) {
      var t = e === null;
      return (!t && i && i(e, this), t);
    }),
    (_.prototype._read = function () {
      return null;
    }),
    (_.prototype._skip = function () {}),
    (_.prototype._write = function (e, r) {
      r !== null && ne(r, this);
    }),
    (_.prototype._match = function () {
      return 0;
    }),
    (_.prototype.compare = _.prototype._match),
    (_.prototype.typeName = 'null'),
    (_.prototype.random = _.prototype._read));
  function S() {
    p.call(this);
  }
  ($.inherits(S, p),
    (S.prototype._check = function (e, r, i) {
      var t = typeof e == 'boolean';
      return (!t && i && i(e, this), t);
    }),
    (S.prototype._read = function (e) {
      return e.readBoolean();
    }),
    (S.prototype._skip = function (e) {
      e.skipBoolean();
    }),
    (S.prototype._write = function (e, r) {
      (typeof r != 'boolean' && ne(r, this), e.writeBoolean(r));
    }),
    (S.prototype._match = function (e, r) {
      return e.matchBoolean(r);
    }),
    (S.prototype.typeName = 'boolean'),
    (S.prototype.random = function () {
      return E.nextBoolean();
    }));
  function q() {
    p.call(this);
  }
  ($.inherits(q, p),
    (q.prototype._check = function (e, r, i) {
      var t = e === (e | 0);
      return (!t && i && i(e, this), t);
    }),
    (q.prototype._read = function (e) {
      return e.readInt();
    }),
    (q.prototype._skip = function (e) {
      e.skipInt();
    }),
    (q.prototype._write = function (e, r) {
      (r !== (r | 0) && ne(r, this), e.writeInt(r));
    }),
    (q.prototype._match = function (e, r) {
      return e.matchInt(r);
    }),
    (q.prototype.typeName = 'int'),
    (q.prototype.random = function () {
      return E.nextInt(1e3) | 0;
    }));
  function K() {
    p.call(this);
  }
  ($.inherits(K, p),
    (K.prototype._check = function (e, r, i) {
      var t = typeof e == 'number' && e % 1 === 0 && he(e);
      return (!t && i && i(e, this), t);
    }),
    (K.prototype._read = function (e) {
      var r = e.readLong();
      if (!he(r)) throw new Error('potential precision loss');
      return r;
    }),
    (K.prototype._skip = function (e) {
      e.skipLong();
    }),
    (K.prototype._write = function (e, r) {
      ((typeof r != 'number' || r % 1 || !he(r)) && ne(r, this), e.writeLong(r));
    }),
    (K.prototype._match = function (e, r) {
      return e.matchLong(r);
    }),
    (K.prototype._update = function (e, r) {
      switch (r.typeName) {
        case 'int':
          e._read = r._read;
          break;
        case 'abstract:long':
        case 'long':
          e._read = this._read;
      }
    }),
    (K.prototype.typeName = 'long'),
    (K.prototype.random = function () {
      return E.nextInt();
    }),
    (K.__with = function (e, r) {
      e = e || {};
      var i = {
          toBuffer: '_toBuffer',
          fromBuffer: '_fromBuffer',
          fromJSON: '_fromJSON',
          toJSON: '_toJSON',
          isValid: '_isValid',
          compare: 'compare',
        },
        t = new f(r);
      return (
        Object.keys(i).forEach(function (n) {
          if (e[n] === void 0) throw new Error(B('missing method implementation: %s', n));
          t[i[n]] = e[n];
        }),
        Object.freeze(t)
      );
    }));
  function L() {
    p.call(this);
  }
  ($.inherits(L, p),
    (L.prototype._check = function (e, r, i) {
      var t = typeof e == 'number';
      return (!t && i && i(e, this), t);
    }),
    (L.prototype._read = function (e) {
      return e.readFloat();
    }),
    (L.prototype._skip = function (e) {
      e.skipFloat();
    }),
    (L.prototype._write = function (e, r) {
      (typeof r != 'number' && ne(r, this), e.writeFloat(r));
    }),
    (L.prototype._match = function (e, r) {
      return e.matchFloat(r);
    }),
    (L.prototype._update = function (e, r) {
      switch (r.typeName) {
        case 'float':
        case 'int':
          e._read = r._read;
          break;
        case 'abstract:long':
        case 'long':
          e._read = function (i) {
            return i.readLong();
          };
      }
    }),
    (L.prototype.typeName = 'float'),
    (L.prototype.random = function () {
      return E.nextFloat(1e3);
    }));
  function V() {
    p.call(this);
  }
  ($.inherits(V, p),
    (V.prototype._check = function (e, r, i) {
      var t = typeof e == 'number';
      return (!t && i && i(e, this), t);
    }),
    (V.prototype._read = function (e) {
      return e.readDouble();
    }),
    (V.prototype._skip = function (e) {
      e.skipDouble();
    }),
    (V.prototype._write = function (e, r) {
      (typeof r != 'number' && ne(r, this), e.writeDouble(r));
    }),
    (V.prototype._match = function (e, r) {
      return e.matchDouble(r);
    }),
    (V.prototype._update = function (e, r) {
      switch (r.typeName) {
        case 'double':
        case 'float':
        case 'int':
          e._read = r._read;
          break;
        case 'abstract:long':
        case 'long':
          e._read = function (i) {
            return i.readLong();
          };
      }
    }),
    (V.prototype.typeName = 'double'),
    (V.prototype.random = function () {
      return E.nextFloat();
    }));
  function O() {
    p.call(this);
  }
  ($.inherits(O, p),
    (O.prototype._check = function (e, r, i) {
      var t = typeof e == 'string';
      return (!t && i && i(e, this), t);
    }),
    (O.prototype._read = function (e) {
      return e.readString();
    }),
    (O.prototype._skip = function (e) {
      e.skipString();
    }),
    (O.prototype._write = function (e, r) {
      (typeof r != 'string' && ne(r, this), e.writeString(r));
    }),
    (O.prototype._match = function (e, r) {
      return e.matchString(r);
    }),
    (O.prototype._update = function (e, r) {
      switch (r.typeName) {
        case 'bytes':
        case 'string':
          e._read = this._read;
      }
    }),
    (O.prototype.typeName = 'string'),
    (O.prototype.random = function () {
      return E.nextString(E.nextInt(32));
    }));
  function Q() {
    p.call(this);
  }
  ($.inherits(Q, p),
    (Q.prototype._check = function (e, r, i) {
      var t = R.isBuffer(e);
      return (!t && i && i(e, this), t);
    }),
    (Q.prototype._read = function (e) {
      return e.readBytes();
    }),
    (Q.prototype._skip = function (e) {
      e.skipBytes();
    }),
    (Q.prototype._write = function (e, r) {
      (R.isBuffer(r) || ne(r, this), e.writeBytes(r));
    }),
    (Q.prototype._match = function (e, r) {
      return e.matchBytes(r);
    }),
    (Q.prototype._update = O.prototype._update),
    (Q.prototype._copy = function (e, r) {
      var i;
      switch ((r && r.coerce) | 0) {
        case 3:
          return (this._check(e, void 0, ne), e.toString('binary'));
        case 2:
          if (typeof e != 'string') throw new Error(B('cannot coerce to buffer: %j', e));
          return ((i = T.bufferFrom(e, 'binary')), this._check(i, void 0, ne), i);
        case 1:
          if (!pe(e)) throw new Error(B('cannot coerce to buffer: %j', e));
          return ((i = T.bufferFrom(e.data)), this._check(i, void 0, ne), i);
        default:
          return (this._check(e, void 0, ne), T.bufferFrom(e));
      }
    }),
    (Q.prototype.compare = R.compare),
    (Q.prototype.typeName = 'bytes'),
    (Q.prototype.random = function () {
      return E.nextBuffer(E.nextInt(32));
    }));
  function M(e, r) {
    if ((u.call(this), !Array.isArray(e))) throw new Error(B('non-array union schema: %j', e));
    if (!e.length) throw new Error('empty union');
    ((this.types = Object.freeze(
      e.map(function (i) {
        return u.forSchema(i, r);
      }),
    )),
      (this._branchIndices = {}),
      this.types.forEach(function (i, t) {
        if (u.isType(i, 'union')) throw new Error('unions cannot be directly nested');
        var n = i.branchName;
        if (this._branchIndices[n] !== void 0)
          throw new Error(B('duplicate union branch name: %j', n));
        this._branchIndices[n] = t;
      }, this));
  }
  ($.inherits(M, u),
    (M.prototype._branchConstructor = function () {
      throw new Error('unions cannot be directly wrapped');
    }),
    (M.prototype._skip = function (e) {
      this.types[e.readLong()]._skip(e);
    }),
    (M.prototype._match = function (e, r) {
      var i = e.readLong(),
        t = r.readLong();
      return i === t ? this.types[i]._match(e, r) : i < t ? -1 : 1;
    }),
    (M.prototype._deref = function (e, r) {
      return this.types.map(function (i) {
        return i._attrs(r);
      });
    }),
    (M.prototype.getTypes = function () {
      return this.types;
    }));
  function ee(e, r) {
    (M.call(this, e, r),
      (this._dynamicBranches = null),
      (this._bucketIndices = {}),
      this.types.forEach(function (i, t) {
        if (u.isType(i, 'abstract', 'logical'))
          (this._dynamicBranches || (this._dynamicBranches = []),
            this._dynamicBranches.push({ index: t, type: i }));
        else {
          var n = de(i);
          if (this._bucketIndices[n] !== void 0)
            throw new Error(B('ambiguous unwrapped union: %j', this));
          this._bucketIndices[n] = t;
        }
      }, this),
      Object.freeze(this));
  }
  ($.inherits(ee, M),
    (ee.prototype._getIndex = function (e) {
      var r = this._bucketIndices[we(e)];
      return (this._dynamicBranches && (r = this._getBranchIndex(e, r)), r);
    }),
    (ee.prototype._getBranchIndex = function (e, r) {
      var i = this._dynamicBranches,
        t,
        n,
        s;
      for (t = 0, n = i.length; t < n; t++)
        if (((s = i[t]), s.type._check(e)))
          if (r === void 0) r = s.index;
          else throw new Error('ambiguous conversion');
      return r;
    }),
    (ee.prototype._check = function (e, r, i, t) {
      var n = this._getIndex(e),
        s = n !== void 0;
      return s ? this.types[n]._check(e, r, i, t) : (i && i(e, this), s);
    }),
    (ee.prototype._read = function (e) {
      var r = e.readLong(),
        i = this.types[r];
      if (i) return i._read(e);
      throw new Error(B('invalid union index: %s', r));
    }),
    (ee.prototype._write = function (e, r) {
      var i = this._getIndex(r);
      (i === void 0 && ne(r, this), e.writeLong(i), r !== null && this.types[i]._write(e, r));
    }),
    (ee.prototype._update = function (e, r, i) {
      var t, n, s;
      for (t = 0, n = this.types.length; t < n; t++) {
        try {
          s = this.types[t].createResolver(r, i);
        } catch {
          continue;
        }
        e._read = function (o) {
          return s._read(o);
        };
        return;
      }
    }),
    (ee.prototype._copy = function (e, r) {
      var i = r && r.coerce | 0,
        t = r && r.wrap | 0,
        n;
      if (t === 2) n = 0;
      else {
        switch (i) {
          case 1:
            pe(e) && this._bucketIndices.buffer !== void 0
              ? (n = this._bucketIndices.buffer)
              : (n = this._getIndex(e));
            break;
          case 2:
            if (e === null) n = this._bucketIndices.null;
            else if (typeof e == 'object') {
              var s = Object.keys(e);
              s.length === 1 && ((n = this._branchIndices[s[0]]), (e = e[s[0]]));
            }
            break;
          default:
            n = this._getIndex(e);
        }
        n === void 0 && ne(e, this);
      }
      var o = this.types[n];
      if (e === null || t === 3) return o._copy(e, r);
      if (i === 3) {
        var a = {};
        return ((a[o.branchName] = o._copy(e, r)), a);
      } else return o._copy(e, r);
    }),
    (ee.prototype.compare = function (e, r) {
      var i = this._getIndex(e),
        t = this._getIndex(r);
      if (i === void 0) ne(e, this);
      else if (t === void 0) ne(r, this);
      else return i === t ? this.types[i].compare(e, r) : T.compare(i, t);
    }),
    (ee.prototype.typeName = 'union:unwrapped'),
    (ee.prototype.random = function () {
      var e = E.nextInt(this.types.length);
      return this.types[e].random();
    }));
  function d(e, r) {
    (M.call(this, e, r), Object.freeze(this));
  }
  ($.inherits(d, M),
    (d.prototype._check = function (e, r, i, t) {
      var n = !1;
      if (e === null) n = this._branchIndices.null !== void 0;
      else if (typeof e == 'object') {
        var s = Object.keys(e);
        if (s.length === 1) {
          var o = s[0],
            a = this._branchIndices[o];
          if (a !== void 0)
            return i
              ? (t.push(o), (n = this.types[a]._check(e[o], r, i, t)), t.pop(), n)
              : this.types[a]._check(e[o], r);
        }
      }
      return (!n && i && i(e, this), n);
    }),
    (d.prototype._read = function (e) {
      var r = this.types[e.readLong()];
      if (!r) throw new Error(B('invalid union index'));
      var i = r._branchConstructor;
      return i === null ? null : new i(r._read(e));
    }),
    (d.prototype._write = function (e, r) {
      var i, t, n;
      r === null
        ? ((i = this._branchIndices.null), i === void 0 && ne(r, this), e.writeLong(i))
        : ((t = Object.keys(r)),
          t.length === 1 && ((n = t[0]), (i = this._branchIndices[n])),
          i === void 0 && ne(r, this),
          e.writeLong(i),
          this.types[i]._write(e, r[n]));
    }),
    (d.prototype._update = function (e, r, i) {
      var t, n, s, o;
      for (t = 0, n = this.types.length; t < n; t++) {
        try {
          s = this.types[t].createResolver(r, i);
        } catch {
          continue;
        }
        ((o = this.types[t]._branchConstructor),
          o
            ? (e._read = function (a) {
                return new o(s._read(a));
              })
            : (e._read = function () {
                return null;
              }));
        return;
      }
    }),
    (d.prototype._copy = function (e, r) {
      var i = r && r.wrap | 0;
      if (i === 2) {
        var t = this.types[0];
        return e === null && t.typeName === 'null' ? null : new t._branchConstructor(t._copy(e, r));
      }
      if (e === null && this._branchIndices.null !== void 0) return null;
      var n, s, o;
      if (typeof e == 'object') {
        var a = Object.keys(e);
        if (a.length === 1) {
          var c = a[0];
          if (((n = this._branchIndices[c]), n === void 0 && r.qualifyNames)) {
            var l, x;
            for (l = 0, s = this.types.length; l < s; l++)
              if (((x = this.types[l]), x.name && c === T.unqualify(x.name))) {
                n = l;
                break;
              }
          }
          n !== void 0 && (o = this.types[n]._copy(e[c], r));
        }
      }
      if (i === 1 && o === void 0)
        for (n = 0, s = this.types.length; n < s && o === void 0; )
          try {
            o = this.types[n]._copy(e, r);
          } catch {
            n++;
          }
      if (o !== void 0) return i === 3 ? o : new this.types[n]._branchConstructor(o);
      ne(e, this);
    }),
    (d.prototype.compare = function (e, r) {
      var i = e === null ? 'null' : Object.keys(e)[0],
        t = r === null ? 'null' : Object.keys(r)[0],
        n = this._branchIndices[i];
      return i === t
        ? i === 'null'
          ? 0
          : this.types[n].compare(e[i], r[i])
        : T.compare(n, this._branchIndices[t]);
    }),
    (d.prototype.typeName = 'union:wrapped'),
    (d.prototype.random = function () {
      var e = E.nextInt(this.types.length),
        r = this.types[e],
        i = r._branchConstructor;
      return i ? new i(r.random()) : null;
    }));
  function m(e, r) {
    if ((u.call(this, e, r), !Array.isArray(e.symbols) || !e.symbols.length))
      throw new Error(B('invalid enum symbols: %j', e.symbols));
    if (
      ((this.symbols = Object.freeze(e.symbols.slice())),
      (this._indices = {}),
      this.symbols.forEach(function (i, t) {
        if (!T.isValidName(i)) throw new Error(B('invalid %s symbol: %j', this, i));
        if (this._indices[i] !== void 0) throw new Error(B('duplicate %s symbol: %j', this, i));
        this._indices[i] = t;
      }, this),
      (this.default = e.default),
      this.default !== void 0 && this._indices[this.default] === void 0)
    )
      throw new Error(B('invalid %s default: %j', this, this.default));
    ((this._branchConstructor = this._createBranchConstructor()), Object.freeze(this));
  }
  ($.inherits(m, u),
    (m.prototype._check = function (e, r, i) {
      var t = this._indices[e] !== void 0;
      return (!t && i && i(e, this), t);
    }),
    (m.prototype._read = function (e) {
      var r = e.readLong(),
        i = this.symbols[r];
      if (i === void 0) throw new Error(B('invalid %s enum index: %s', this.name, r));
      return i;
    }),
    (m.prototype._skip = function (e) {
      e.skipLong();
    }),
    (m.prototype._write = function (e, r) {
      var i = this._indices[r];
      (i === void 0 && ne(r, this), e.writeLong(i));
    }),
    (m.prototype._match = function (e, r) {
      return e.matchLong(r);
    }),
    (m.prototype.compare = function (e, r) {
      return T.compare(this._indices[e], this._indices[r]);
    }),
    (m.prototype._update = function (e, r, i) {
      var t = this.symbols;
      r.typeName === 'enum' &&
        H(this, r, !i.ignoreNamespaces) &&
        (r.symbols.every(function (n) {
          return ~t.indexOf(n);
        }) ||
          this.default !== void 0) &&
        ((e.symbols = r.symbols.map(function (n) {
          return this._indices[n] === void 0 ? this.default : n;
        }, this)),
        (e._read = r._read));
    }),
    (m.prototype._copy = function (e) {
      return (this._check(e, void 0, ne), e);
    }),
    (m.prototype._deref = function (e) {
      e.symbols = this.symbols;
    }),
    (m.prototype.getSymbols = function () {
      return this.symbols;
    }),
    (m.prototype.typeName = 'enum'),
    (m.prototype.random = function () {
      return E.choice(this.symbols);
    }));
  function b(e, r) {
    if ((u.call(this, e, r), e.size !== (e.size | 0) || e.size < 0))
      throw new Error(B('invalid %s size', this.branchName));
    ((this.size = e.size | 0),
      (this._branchConstructor = this._createBranchConstructor()),
      Object.freeze(this));
  }
  ($.inherits(b, u),
    (b.prototype._check = function (e, r, i) {
      var t = R.isBuffer(e) && e.length === this.size;
      return (!t && i && i(e, this), t);
    }),
    (b.prototype._read = function (e) {
      return e.readFixed(this.size);
    }),
    (b.prototype._skip = function (e) {
      e.skipFixed(this.size);
    }),
    (b.prototype._write = function (e, r) {
      ((!R.isBuffer(r) || r.length !== this.size) && ne(r, this), e.writeFixed(r, this.size));
    }),
    (b.prototype._match = function (e, r) {
      return e.matchFixed(r, this.size);
    }),
    (b.prototype.compare = R.compare),
    (b.prototype._update = function (e, r, i) {
      r.typeName === 'fixed' &&
        this.size === r.size &&
        H(this, r, !i.ignoreNamespaces) &&
        ((e.size = this.size), (e._read = this._read));
    }),
    (b.prototype._copy = Q.prototype._copy),
    (b.prototype._deref = function (e) {
      e.size = this.size;
    }),
    (b.prototype.getSize = function () {
      return this.size;
    }),
    (b.prototype.typeName = 'fixed'),
    (b.prototype.random = function () {
      return E.nextBuffer(this.size);
    }));
  function v(e, r) {
    if ((u.call(this), !e.values)) throw new Error(B('missing map values: %j', e));
    ((this.valuesType = u.forSchema(e.values, r)),
      (this._branchConstructor = this._createBranchConstructor()),
      Object.freeze(this));
  }
  ($.inherits(v, u),
    (v.prototype._check = function (e, r, i, t) {
      if (!e || typeof e != 'object' || Array.isArray(e)) return (i && i(e, this), !1);
      var n = Object.keys(e),
        s = !0,
        o,
        a,
        c,
        l;
      if (i) {
        for (c = t.length, t.push(''), o = 0, a = n.length; o < a; o++)
          ((l = t[c] = n[o]), this.valuesType._check(e[l], r, i, t) || (s = !1));
        t.pop();
      } else
        for (o = 0, a = n.length; o < a; o++) if (!this.valuesType._check(e[n[o]], r)) return !1;
      return s;
    }),
    (v.prototype._read = function (e) {
      for (var r = this.valuesType, i = {}, t; (t = ae(e)); )
        for (; t--; ) {
          var n = e.readString();
          i[n] = r._read(e);
        }
      return i;
    }),
    (v.prototype._skip = function (e) {
      for (var r = this.valuesType, i, t; (t = e.readLong()); )
        if (t < 0) ((i = e.readLong()), (e.pos += i));
        else for (; t--; ) (e.skipString(), r._skip(e));
    }),
    (v.prototype._write = function (e, r) {
      (!r || typeof r != 'object' || Array.isArray(r)) && ne(r, this);
      var i = this.valuesType,
        t = Object.keys(r),
        n = t.length,
        s,
        o;
      if (n)
        for (e.writeLong(n), s = 0; s < n; s++) ((o = t[s]), e.writeString(o), i._write(e, r[o]));
      e.writeLong(0);
    }),
    (v.prototype._match = function () {
      throw new Error('maps cannot be compared');
    }),
    (v.prototype._update = function (e, r, i) {
      r.typeName === 'map' &&
        ((e.valuesType = this.valuesType.createResolver(r.valuesType, i)), (e._read = this._read));
    }),
    (v.prototype._copy = function (e, r) {
      if (e && typeof e == 'object' && !Array.isArray(e)) {
        var i = this.valuesType,
          t = Object.keys(e),
          n,
          s,
          o,
          a = {};
        for (n = 0, s = t.length; n < s; n++) ((o = t[n]), (a[o] = i._copy(e[o], r)));
        return a;
      }
      ne(e, this);
    }),
    (v.prototype.compare = v.prototype._match),
    (v.prototype.typeName = 'map'),
    (v.prototype.getValuesType = function () {
      return this.valuesType;
    }),
    (v.prototype.random = function () {
      var e = {},
        r,
        i;
      for (r = 0, i = E.nextInt(10); r < i; r++)
        e[E.nextString(E.nextInt(20))] = this.valuesType.random();
      return e;
    }),
    (v.prototype._deref = function (e, r) {
      e.values = this.valuesType._attrs(r);
    }));
  function D(e, r) {
    if ((u.call(this), !e.items)) throw new Error(B('missing array items: %j', e));
    ((this.itemsType = u.forSchema(e.items, r)),
      (this._branchConstructor = this._createBranchConstructor()),
      Object.freeze(this));
  }
  ($.inherits(D, u),
    (D.prototype._check = function (e, r, i, t) {
      if (!Array.isArray(e)) return (i && i(e, this), !1);
      var n = this.itemsType,
        s = !0,
        o,
        a,
        c;
      if (i) {
        for (c = t.length, t.push(''), o = 0, a = e.length; o < a; o++)
          ((t[c] = '' + o), n._check(e[o], r, i, t) || (s = !1));
        t.pop();
      } else for (o = 0, a = e.length; o < a; o++) if (!n._check(e[o], r)) return !1;
      return s;
    }),
    (D.prototype._read = function (e) {
      for (var r = this.itemsType, i = 0, t, n; (n = e.readLong()); )
        for (n < 0 && ((n = -n), e.skipLong()), t = t || new Array(n); n--; ) t[i++] = r._read(e);
      return t || [];
    }),
    (D.prototype._skip = function (e) {
      for (var r = this.itemsType, i, t; (t = e.readLong()); )
        if (t < 0) ((i = e.readLong()), (e.pos += i));
        else for (; t--; ) r._skip(e);
    }),
    (D.prototype._write = function (e, r) {
      Array.isArray(r) || ne(r, this);
      var i = this.itemsType,
        t = r.length,
        n;
      if (t) for (e.writeLong(t), n = 0; n < t; n++) i._write(e, r[n]);
      e.writeLong(0);
    }),
    (D.prototype._match = function (e, r) {
      for (var i = e.readLong(), t = r.readLong(), n; i && t; ) {
        if (((n = this.itemsType._match(e, r)), n)) return n;
        (--i || (i = ae(e)), --t || (t = ae(r)));
      }
      return T.compare(i, t);
    }),
    (D.prototype._update = function (e, r, i) {
      r.typeName === 'array' &&
        ((e.itemsType = this.itemsType.createResolver(r.itemsType, i)), (e._read = this._read));
    }),
    (D.prototype._copy = function (e, r) {
      Array.isArray(e) || ne(e, this);
      var i = new Array(e.length),
        t,
        n;
      for (t = 0, n = e.length; t < n; t++) i[t] = this.itemsType._copy(e[t], r);
      return i;
    }),
    (D.prototype._deref = function (e, r) {
      e.items = this.itemsType._attrs(r);
    }),
    (D.prototype.compare = function (e, r) {
      var i = e.length,
        t = r.length,
        n,
        s,
        o;
      for (n = 0, s = Math.min(i, t); n < s; n++)
        if ((o = this.itemsType.compare(e[n], r[n]))) return o;
      return T.compare(i, t);
    }),
    (D.prototype.getItemsType = function () {
      return this.itemsType;
    }),
    (D.prototype.typeName = 'array'),
    (D.prototype.random = function () {
      var e = [],
        r,
        i;
      for (r = 0, i = E.nextInt(10); r < i; r++) e.push(this.itemsType.random());
      return e;
    }));
  function w(e, r) {
    r = r || {};
    var i = r.namespace;
    if (e.namespace !== void 0) r.namespace = e.namespace;
    else if (e.name) {
      var t = T.impliedNamespace(e.name);
      t !== void 0 && (r.namespace = t);
    }
    if ((u.call(this, e, r), !Array.isArray(e.fields)))
      throw new Error(B('non-array record fields: %j', e.fields));
    if (
      T.hasDuplicates(e.fields, function (n) {
        return n.name;
      })
    )
      throw new Error(B('duplicate field name: %j', e.fields));
    ((this._fieldsByName = {}),
      (this.fields = Object.freeze(
        e.fields.map(function (n) {
          var s = new h(n, r);
          return ((this._fieldsByName[s.name] = s), s);
        }, this),
      )),
      (this._branchConstructor = this._createBranchConstructor()),
      (this._isError = e.type === 'error'),
      (this.recordConstructor = this._createConstructor(r.errorStackTraces, r.omitRecordMethods)),
      (this._read = this._createReader()),
      (this._skip = this._createSkipper()),
      (this._write = this._createWriter()),
      (this._check = this._createChecker()),
      (r.namespace = i),
      Object.freeze(this));
  }
  ($.inherits(w, u),
    (w.prototype._getConstructorName = function () {
      return this.name
        ? T.capitalize(T.unqualify(this.name))
        : this._isError
          ? 'Error$'
          : 'Record$';
    }),
    (w.prototype._createConstructor = function (e, r) {
      var i = [],
        t = [],
        n = [],
        s = '',
        o,
        a,
        c,
        l,
        x,
        g,
        j;
      for (o = 0, a = this.fields.length; o < a; o++)
        ((c = this.fields[o]),
          (x = c.defaultValue),
          (g = x() !== void 0),
          (l = c.name),
          e && this._isError && l === 'stack' && u.isType(c.type, 'string') && !g && (j = c),
          t.push('v' + o),
          (s += '  '),
          g
            ? ((s += 'if (v' + o + ' === undefined) { '),
              (s += 'this.' + l + ' = d' + n.length + '(); '),
              (s +=
                '} else { this.' +
                l +
                ' = v' +
                o +
                `; }
`),
              i.push('d' + n.length),
              n.push(x))
            : (s +=
                'this.' +
                l +
                ' = v' +
                o +
                `;
`));
      j &&
        ((s += '  if (this.stack === undefined) { '),
        typeof Error.captureStackTrace == 'function'
          ? (s += 'Error.captureStackTrace(this, this.constructor);')
          : (s += 'this.stack = Error().stack;'),
        (s += ` }
`));
      var P = 'return function ' + this._getConstructorName() + '(';
      P +=
        t.join() +
        `) {
` +
        s +
        '};';
      var F = new Function(i.join(), P).apply(void 0, n);
      if (r) return F;
      var N = this;
      return (
        (F.getType = function () {
          return N;
        }),
        (F.type = N),
        this._isError && ($.inherits(F, Error), (F.prototype.name = this._getConstructorName())),
        (F.prototype.clone = function (I) {
          return N.clone(this, I);
        }),
        (F.prototype.compare = function (I) {
          return N.compare(this, I);
        }),
        (F.prototype.isValid = function (I) {
          return N.isValid(this, I);
        }),
        (F.prototype.toBuffer = function () {
          return N.toBuffer(this);
        }),
        (F.prototype.toString = function () {
          return N.toString(this);
        }),
        (F.prototype.wrap = function () {
          return N.wrap(this);
        }),
        (F.prototype.wrapped = F.prototype.wrap),
        F
      );
    }),
    (w.prototype._createChecker = function () {
      var e = [],
        r = [],
        i = this._getConstructorName(),
        t =
          'return function check' +
          i +
          `(v, f, h, p) {
`;
      if (
        ((t += `  if (
`),
        (t += `    v === null ||
`),
        (t += `    typeof v != 'object' ||
`),
        (t += `    (f && !this._checkFields(v))
`),
        (t += `  ) {
`),
        (t += `    if (h) { h(v, this); }
`),
        (t += `    return false;
`),
        (t += `  }
`),
        !this.fields.length)
      )
        t += `  return true;
`;
      else {
        for (n = 0, s = this.fields.length; n < s; n++)
          ((o = this.fields[n]),
            e.push('t' + n),
            r.push(o.type),
            o.defaultValue() !== void 0 &&
              (t +=
                '  var v' +
                n +
                ' = v.' +
                o.name +
                `;
`));
        ((t += `  if (h) {
`),
          (t += `    var b = 1;
`),
          (t += `    var j = p.length;
`),
          (t += `    p.push('');
`));
        var n, s, o;
        for (n = 0, s = this.fields.length; n < s; n++)
          ((o = this.fields[n]),
            (t +=
              "    p[j] = '" +
              o.name +
              `';
`),
            (t += '    b &= '),
            o.defaultValue() === void 0
              ? (t +=
                  't' +
                  n +
                  '._check(v.' +
                  o.name +
                  `, f, h, p);
`)
              : ((t += 'v' + n + ' === undefined || '),
                (t +=
                  't' +
                  n +
                  '._check(v' +
                  n +
                  `, f, h, p);
`)));
        ((t += `    p.pop();
`),
          (t += `    return !!b;
`),
          (t += `  } else {
    return (
      `),
          (t += this.fields.map(function (a, c) {
            return a.defaultValue() === void 0
              ? 't' + c + '._check(v.' + a.name + ', f)'
              : '(v' + c + ' === undefined || t' + c + '._check(v' + c + ', f))';
          }).join(` &&
      `)),
          (t += `
    );
  }
`));
      }
      return ((t += '};'), new Function(e.join(), t).apply(void 0, r));
    }),
    (w.prototype._createReader = function () {
      var e = [],
        r = [this.recordConstructor],
        i,
        t;
      for (i = 0, t = this.fields.length; i < t; i++)
        (e.push('t' + i), r.push(this.fields[i].type));
      var n = this._getConstructorName(),
        s =
          'return function read' +
          n +
          `(t) {
`;
      return (
        (s +=
          '  return new ' +
          n +
          `(
    `),
        (s += e.map(function (o) {
          return o + '._read(t)';
        }).join(`,
    `)),
        (s += `
  );
};`),
        e.unshift(n),
        new Function(e.join(), s).apply(void 0, r)
      );
    }),
    (w.prototype._createSkipper = function () {
      var e = [],
        r =
          'return function skip' +
          this._getConstructorName() +
          `(t) {
`,
        i = [],
        t,
        n;
      for (t = 0, n = this.fields.length; t < n; t++)
        (e.push('t' + t),
          i.push(this.fields[t].type),
          (r +=
            '  t' +
            t +
            `._skip(t);
`));
      return ((r += '}'), new Function(e.join(), r).apply(void 0, i));
    }),
    (w.prototype._createWriter = function () {
      var e = [],
        r = this._getConstructorName(),
        i =
          'return function write' +
          r +
          `(t, v) {
`,
        t = [],
        n,
        s,
        o,
        a;
      for (n = 0, s = this.fields.length; n < s; n++)
        ((o = this.fields[n]),
          e.push('t' + n),
          t.push(o.type),
          (i += '  '),
          o.defaultValue() === void 0
            ? (i +=
                't' +
                n +
                '._write(t, v.' +
                o.name +
                `);
`)
            : ((a = o.type.toBuffer(o.defaultValue()).toString('binary')),
              e.push('d' + n),
              t.push(a),
              (i +=
                'var v' +
                n +
                ' = v.' +
                o.name +
                `;
`),
              (i +=
                'if (v' +
                n +
                ` === undefined) {
`),
              (i +=
                '    t.writeBinary(d' +
                n +
                ', ' +
                a.length +
                `);
`),
              (i +=
                `  } else {
    t` +
                n +
                '._write(t, v' +
                n +
                `);
  }
`)));
      return ((i += '}'), new Function(e.join(), i).apply(void 0, t));
    }),
    (w.prototype._update = function (e, r, i) {
      if (!H(this, r, !i.ignoreNamespaces)) throw new Error(B('no alias found for %s', r.name));
      var t = this.fields,
        n = r.fields,
        s = T.toMap(n, function (se) {
          return se.name;
        }),
        o = [],
        a = {},
        c,
        l,
        x,
        g,
        j,
        P,
        F;
      for (c = 0; c < t.length; c++) {
        for (x = t[c], j = G(x), P = [], l = 0; l < j.length; l++) ((g = j[l]), s[g] && P.push(g));
        if (P.length > 1)
          throw new Error(B('ambiguous aliasing for %s.%s (%s)', r.name, x.name, P));
        if (P.length)
          ((g = P[0]),
            (F = { resolver: x.type.createResolver(s[g].type, i), name: '_' + x.name }),
            a[g] ? a[g].push(F) : (a[g] = [F]),
            o.push(F.name));
        else {
          if (x.defaultValue() === void 0)
            throw new Error(B('no matching field for default-less %s.%s', r.name, x.name));
          o.push('undefined');
        }
      }
      var N = -1;
      for (c = n.length; c && a[n[--c].name] === void 0; ) N = c;
      var I = this._getConstructorName(),
        U = [I],
        X = [this.recordConstructor],
        te =
          '  return function read' +
          I +
          `(t, b) {
`;
      for (c = 0; c < n.length; c++)
        if (
          (c === N &&
            (te += `  if (!b) {
`),
          (x = r.fields[c]),
          (g = x.name),
          a[g] === void 0)
        )
          ((te += ~N && c >= N ? '    ' : '  '),
            U.push('r' + c),
            X.push(x.type),
            (te +=
              'r' +
              c +
              `._skip(t);
`));
        else
          for (l = a[g].length; l--; )
            ((te += ~N && c >= N ? '    ' : '  '),
              U.push('r' + c + 'f' + l),
              (F = a[g][l]),
              X.push(F.resolver),
              (te += 'var ' + F.name + ' = '),
              (te +=
                'r' +
                c +
                'f' +
                l +
                '._' +
                (l ? 'peek' : 'read') +
                `(t);
`));
      (~N &&
        (te += `  }
`),
        (te +=
          '  return new ' +
          I +
          '(' +
          o.join() +
          `);
};`),
        (e._read = new Function(U.join(), te).apply(void 0, X)));
    }),
    (w.prototype._match = function (e, r) {
      var i = this.fields,
        t,
        n,
        s,
        o,
        a;
      for (t = 0, n = i.length; t < n; t++)
        if (((s = i[t]), (o = s._order), (a = s.type), o)) {
          if (((o *= a._match(e, r)), o)) return o;
        } else (a._skip(e), a._skip(r));
      return 0;
    }),
    (w.prototype._checkFields = function (e) {
      var r = Object.keys(e),
        i,
        t;
      for (i = 0, t = r.length; i < t; i++) if (!this._fieldsByName[r[i]]) return !1;
      return !0;
    }),
    (w.prototype._copy = function (e, r) {
      var i = r && r.fieldHook,
        t = [void 0],
        n,
        s,
        o,
        a;
      for (n = 0, s = this.fields.length; n < s; n++)
        ((o = this.fields[n]),
          (a = e[o.name]),
          a === void 0 && o.hasOwnProperty('defaultValue') && (a = o.defaultValue()),
          ((r && !r.skip) || a !== void 0) && (a = o.type._copy(a, r)),
          i && (a = i(o, a, this)),
          t.push(a));
      var c = this.recordConstructor;
      return new (c.bind.apply(c, t))();
    }),
    (w.prototype._deref = function (e, r) {
      e.fields = this.fields.map(function (i) {
        var t = i.type,
          n = { name: i.name, type: t._attrs(r) };
        if (r.exportAttrs) {
          var s = i.defaultValue();
          s !== void 0 && (n.default = t._copy(s, { coerce: 3, wrap: 3 }));
          var o = i.order;
          o !== 'ascending' && (n.order = o);
          var a = i.aliases;
          a.length && (n.aliases = a);
          var c = i.doc;
          c !== void 0 && (n.doc = c);
        }
        return n;
      });
    }),
    (w.prototype.compare = function (e, r) {
      var i = this.fields,
        t,
        n,
        s,
        o,
        a,
        c;
      for (t = 0, n = i.length; t < n; t++)
        if (
          ((s = i[t]),
          (o = s.name),
          (a = s._order),
          (c = s.type),
          a && ((a *= c.compare(e[o], r[o])), a))
        )
          return a;
      return 0;
    }),
    (w.prototype.random = function () {
      var e = this.fields.map(function (i) {
        return i.type.random();
      });
      e.unshift(void 0);
      var r = this.recordConstructor;
      return new (r.bind.apply(r, e))();
    }),
    (w.prototype.field = function (e) {
      return this._fieldsByName[e];
    }),
    (w.prototype.getField = w.prototype.field),
    (w.prototype.getFields = function () {
      return this.fields;
    }),
    (w.prototype.getRecordConstructor = function () {
      return this.recordConstructor;
    }),
    Object.defineProperty(w.prototype, 'typeName', {
      enumerable: !0,
      get: function () {
        return this._isError ? 'error' : 'record';
      },
    }));
  function Y(e, r) {
    ((this._logicalTypeName = e.logicalType), u.call(this), (W = this));
    try {
      this._underlyingType = u.forSchema(e, r);
    } finally {
      W = null;
      var i = re.length;
      i && re[i - 1][0] === this && re.pop();
    }
    u.isType(this.underlyingType, 'union')
      ? (this._branchConstructor = this.underlyingType._branchConstructor)
      : (this._branchConstructor = this.underlyingType._createBranchConstructor());
  }
  ($.inherits(Y, u),
    Object.defineProperty(Y.prototype, 'typeName', {
      enumerable: !0,
      get: function () {
        return 'logical:' + this._logicalTypeName;
      },
    }),
    Object.defineProperty(Y.prototype, 'underlyingType', {
      enumerable: !0,
      get: function () {
        if (this._underlyingType) return this._underlyingType;
        var e, r, i;
        for (e = 0, r = re.length; e < r; e++) if (((i = re[e]), i[0] === this)) return i[1];
      },
    }),
    (Y.prototype.getUnderlyingType = function () {
      return this.underlyingType;
    }),
    (Y.prototype._read = function (e) {
      return this._fromValue(this.underlyingType._read(e));
    }),
    (Y.prototype._write = function (e, r) {
      this.underlyingType._write(e, this._toValue(r));
    }),
    (Y.prototype._check = function (e, r, i, t) {
      try {
        var n = this._toValue(e);
      } catch {}
      return n === void 0 ? (i && i(e, this), !1) : this.underlyingType._check(n, r, i, t);
    }),
    (Y.prototype._copy = function (e, r) {
      var i = this.underlyingType;
      switch (r && r.coerce) {
        case 3:
          return i._copy(this._toValue(e), r);
        case 2:
          return this._fromValue(i._copy(e, r));
        default:
          return this._fromValue(i._copy(this._toValue(e), r));
      }
    }),
    (Y.prototype._update = function (e, r, i) {
      var t = this._resolve(r, i);
      t &&
        (e._read = function (n) {
          return t(r._read(n));
        });
    }),
    (Y.prototype.compare = function (e, r) {
      var i = this._toValue(e),
        t = this._toValue(r);
      return this.underlyingType.compare(i, t);
    }),
    (Y.prototype.random = function () {
      return this._fromValue(this.underlyingType.random());
    }),
    (Y.prototype._deref = function (e, r) {
      var i = this.underlyingType,
        t = i.name !== void 0 && r.derefed[i.name];
      return (
        (e = i._attrs(r)),
        !t &&
          r.exportAttrs &&
          (typeof e == 'string' && (e = { type: e }),
          (e.logicalType = this._logicalTypeName),
          this._export(e)),
        e
      );
    }),
    (Y.prototype._skip = function (e) {
      this.underlyingType._skip(e);
    }),
    (Y.prototype._export = function () {}),
    (Y.prototype._fromValue = T.abstractFunction),
    (Y.prototype._toValue = T.abstractFunction),
    (Y.prototype._resolve = T.abstractFunction));
  function f(e) {
    ((this._concreteTypeName = 'long'), p.call(this, !0), (this._noUnpack = !!e));
  }
  ($.inherits(f, K),
    (f.prototype.typeName = 'abstract:long'),
    (f.prototype._check = function (e, r, i) {
      var t = this._isValid(e);
      return (!t && i && i(e, this), t);
    }),
    (f.prototype._read = function (e) {
      var r, i;
      if (
        (this._noUnpack
          ? ((i = e.pos), e.skipLong(), (r = e.buf.slice(i, e.pos)))
          : (r = e.unpackLongBytes(e)),
        e.isValid())
      )
        return this._fromBuffer(r);
    }),
    (f.prototype._write = function (e, r) {
      this._isValid(r) || ne(r, this);
      var i = this._toBuffer(r);
      this._noUnpack ? e.writeFixed(i) : e.packLongBytes(i);
    }),
    (f.prototype._copy = function (e, r) {
      switch (r && r.coerce) {
        case 3:
          return this._toJSON(e);
        case 2:
          return this._fromJSON(e);
        default:
          return this._fromJSON(this._toJSON(e));
      }
    }),
    (f.prototype._deref = function () {
      return 'long';
    }),
    (f.prototype._update = function (e, r) {
      var i = this;
      switch (r.typeName) {
        case 'int':
          e._read = function (t) {
            return i._fromJSON(r._read(t));
          };
          break;
        case 'abstract:long':
        case 'long':
          e._read = function (t) {
            return i._read(t);
          };
      }
    }),
    (f.prototype.random = function () {
      return this._fromJSON(K.prototype.random());
    }),
    (f.prototype._fromBuffer = T.abstractFunction),
    (f.prototype._toBuffer = T.abstractFunction),
    (f.prototype._fromJSON = T.abstractFunction),
    (f.prototype._toJSON = T.abstractFunction),
    (f.prototype._isValid = T.abstractFunction),
    (f.prototype.compare = T.abstractFunction));
  function h(e, r) {
    var i = e.name;
    if (typeof i != 'string' || !T.isValidName(i)) throw new Error(B('invalid field name: %s', i));
    ((this.name = i),
      (this.type = u.forSchema(e.type, r)),
      (this.aliases = e.aliases || []),
      (this.doc = e.doc !== void 0 ? '' + e.doc : void 0),
      (this._order = (function (a) {
        switch (a) {
          case 'ascending':
            return 1;
          case 'descending':
            return -1;
          case 'ignore':
            return 0;
          default:
            throw new Error(B('invalid order: %j', a));
        }
      })(e.order === void 0 ? 'ascending' : e.order)));
    var t = e.default;
    if (t !== void 0) {
      var n = this.type,
        s;
      try {
        s = n._copy(t, { coerce: 2, wrap: 2 });
      } catch (a) {
        var o = B('incompatible field default %j (%s)', t, a.message);
        throw (
          u.isType(n, 'union') &&
            (o += B(", union defaults must match the first branch's type (%j)", n.types[0])),
          new Error(o)
        );
      }
      oe(n.typeName) && n.typeName !== 'bytes'
        ? (this.defaultValue = function () {
            return s;
          })
        : (this.defaultValue = function () {
            return n._copy(s);
          });
    }
    Object.freeze(this);
  }
  ((h.prototype.defaultValue = function () {}),
    Object.defineProperty(h.prototype, 'order', {
      enumerable: !0,
      get: function () {
        return ['descending', 'ignore', 'ascending'][this._order + 1];
      },
    }),
    (h.prototype.getAliases = function () {
      return this.aliases;
    }),
    (h.prototype.getDefault = h.prototype.defaultValue),
    (h.prototype.getName = function () {
      return this.name;
    }),
    (h.prototype.getOrder = function () {
      return this.order;
    }),
    (h.prototype.getType = function () {
      return this.type;
    }));
  function y(e) {
    ((this._readerType = e),
      (this._read = null),
      (this.itemsType = null),
      (this.size = 0),
      (this.symbols = null),
      (this.valuesType = null));
  }
  ((y.prototype._peek = u.prototype._peek),
    (y.prototype.inspect = function () {
      return '<Resolver>';
    }));
  function k() {
    this.str = void 0;
  }
  function A(e, r, i, t) {
    if (i) {
      if (i._readerType !== e) throw new Error('invalid resolver');
      return i._read(r, t);
    } else return e._read(r);
  }
  function G(e) {
    var r = {};
    e.name && (r[e.name] = !0);
    var i = e.aliases,
      t,
      n;
    for (t = 0, n = i.length; t < n; t++) r[i[t]] = !0;
    return Object.keys(r);
  }
  function H(e, r, i) {
    if (!r.name) return !0;
    var t = i ? r.name : T.unqualify(r.name),
      n = G(e),
      s,
      o,
      a;
    for (s = 0, o = n.length; s < o; s++)
      if (((a = n[s]), i || (a = T.unqualify(a)), a === t)) return !0;
    return !1;
  }
  function oe(e) {
    var r = ie[e];
    return r && r.prototype instanceof p;
  }
  function ce(e) {
    if (e === 'error') e = 'record';
    else {
      var r = /^([^:]+):(.*)$/.exec(e);
      r && (r[1] === 'union' ? (e = r[2] + 'Union') : (e = r[1]));
    }
    return T.capitalize(e) + 'Type';
  }
  function ae(e) {
    var r = e.readLong();
    return (r < 0 && ((r = -r), e.skipLong()), r);
  }
  function he(e) {
    return e >= -9007199254740990 && e <= 9007199254740990;
  }
  function pe(e) {
    return e && e.type === 'Buffer' && Array.isArray(e.data);
  }
  function ne(e, r) {
    throw new Error(B('invalid %j: %j', r.schema(), e));
  }
  function ye(e, r) {
    var i = T.unqualify(e);
    return oe(i) ? i : T.qualify(e, r);
  }
  function de(e) {
    var r = e.typeName;
    switch (r) {
      case 'double':
      case 'float':
      case 'int':
      case 'long':
        return 'number';
      case 'bytes':
      case 'fixed':
        return 'buffer';
      case 'enum':
        return 'string';
      case 'map':
      case 'error':
      case 'record':
        return 'object';
      default:
        return r;
    }
  }
  function we(e) {
    if (e === null) return 'null';
    var r = typeof e;
    if (r === 'object') {
      if (Array.isArray(e)) return 'array';
      if (R.isBuffer(e)) return 'buffer';
    }
    return r;
  }
  function _e(e) {
    var r = {},
      i,
      t,
      n,
      s;
    for (i = 0, t = e.length; i < t; i++)
      if (((s = e[i]), !u.isType(s, 'logical'))) {
        if (((n = de(s)), r[n])) return !0;
        r[n] = !0;
      }
    return !1;
  }
  function le(e) {
    var r = ['int', 'long', 'float', 'double'],
      i = -1,
      t = null,
      n,
      s,
      o,
      a;
    for (n = 0, s = e.length; n < s; n++)
      ((o = e[n]), (a = r.indexOf(o.typeName)), a > i && ((i = a), (t = o)));
    return t;
  }
  function ge(e, r) {
    var i = {},
      t,
      n,
      s,
      o;
    for (t = 0, n = e.length; t < n; t++) {
      if (((s = e[t]), s.typeName === 'string')) return s;
      o = s.symbols;
      var a, c;
      for (a = 0, c = o.length; a < c; a++) i[o[a]] = !0;
    }
    return u.forSchema({ type: 'enum', symbols: Object.keys(i) }, r);
  }
  function be(e, r) {
    var i = -1,
      t,
      n,
      s;
    for (t = 0, n = e.length; t < n; t++) {
      if (((s = e[t]), s.typeName === 'bytes')) return s;
      i === -1 ? (i = s.size) : s.size !== i && (i = -2);
    }
    return i < 0 ? u.forSchema('bytes', r) : e[0];
  }
  function ke(e, r) {
    var i = [],
      t = {},
      n = {},
      s = !0,
      o,
      a,
      c,
      l;
    for (o = 0, a = e.length; o < a; o++)
      if (((c = e[o]), c.typeName === 'map')) ((s = !1), i.push(c.valuesType));
      else {
        l = c.fields;
        var x, g, j, P, F, N;
        for (x = 0, g = l.length; x < g; x++)
          ((j = l[x]),
            (F = j.name),
            (N = j.type),
            i.push(N),
            s &&
              (t[F] || (t[F] = []),
              t[F].push(N),
              (P = j.defaultValue()),
              P !== void 0 && (n[F] = P)));
      }
    if (s) {
      var I = Object.keys(t);
      for (o = 0, a = I.length; o < a; o++)
        ((F = I[o]),
          t[F].length < e.length &&
            n[F] === void 0 &&
            (r && r.strictDefaults
              ? (s = !1)
              : (t[F].unshift(u.forSchema('null', r)), (n[F] = null))));
    }
    var U;
    return (
      s
        ? (U = {
            type: 'record',
            fields: I.map(function (X) {
              var te = u.forTypes(t[X], r),
                se = n[X];
              if (se !== void 0 && ~te.typeName.indexOf('union')) {
                var ue = te.types.slice(),
                  fe,
                  ve;
                for (fe = 0, ve = ue.length; fe < ve && !ue[fe].isValid(se); fe++);
                if (fe > 0) {
                  var ze = ue[0];
                  ((ue[0] = ue[fe]), (ue[fe] = ze), (te = u.forSchema(ue, r)));
                }
              }
              return { name: X, type: te, default: n[X] };
            }),
          })
        : (U = { type: 'map', values: u.forTypes(i, r) }),
      u.forSchema(U, r)
    );
  }
  return (
    (Se = {
      Type: u,
      getTypeBucket: de,
      getValueBucket: we,
      isPrimitive: oe,
      builtins: (function () {
        var e = { LogicalType: Y, UnwrappedUnionType: ee, WrappedUnionType: d },
          r = Object.keys(ie),
          i,
          t,
          n;
        for (i = 0, t = r.length; i < t; i++) ((n = r[i]), (e[ce(n)] = ie[n]));
        return e;
      })(),
    }),
    Se
  );
}
var Oe, Le;
function We() {
  if (Le) return Oe;
  Le = 1;
  var T = Ae();
  function C($, R) {
    var z;
    if (typeof $ == 'string')
      try {
        z = JSON.parse($);
      } catch {
        z = $;
      }
    else z = $;
    return T.Type.forSchema(z, R);
  }
  return (
    (Oe = {
      Type: T.Type,
      parse: C,
      types: T.builtins,
      combine: T.Type.forTypes,
      infer: T.Type.forValue,
    }),
    Oe
  );
}
var Be, Ie;
function Ue() {
  if (Ie) return Be;
  Ie = 1;
  var T = Ae(),
    C = me(),
    $ = require('buffer'),
    R = require('events'),
    z = require('stream'),
    J = require('util'),
    B = $.Buffer,
    ie = C.Tap,
    E = T.Type,
    Z = J.debuglog('avsc:services'),
    W = J.format,
    re = { namespace: 'org.apache.avro.ipc' },
    u = E.forSchema('boolean', re),
    p = E.forSchema({ type: 'map', values: 'bytes' }, re),
    _ = E.forSchema('string', re),
    S = E.forSchema(
      {
        name: 'HandshakeRequest',
        type: 'record',
        fields: [
          { name: 'clientHash', type: { name: 'MD5', type: 'fixed', size: 16 } },
          { name: 'clientProtocol', type: ['null', 'string'], default: null },
          { name: 'serverHash', type: 'MD5' },
          { name: 'meta', type: ['null', p], default: null },
        ],
      },
      re,
    ),
    q = E.forSchema(
      {
        name: 'HandshakeResponse',
        type: 'record',
        fields: [
          {
            name: 'match',
            type: { name: 'HandshakeMatch', type: 'enum', symbols: ['BOTH', 'CLIENT', 'NONE'] },
          },
          { name: 'serverProtocol', type: ['null', 'string'], default: null },
          { name: 'serverHash', type: ['null', 'MD5'], default: null },
          { name: 'meta', type: ['null', p], default: null },
        ],
      },
      re,
    ),
    K = 16,
    L = new V(
      '',
      E.forSchema({ name: 'PingRequest', type: 'record', fields: [] }, re),
      E.forSchema(['string'], re),
      E.forSchema('null', re),
    );
  function V(t, n, s, o, a, c) {
    if (((this.name = t), !E.isType(n, 'record'))) throw new Error('invalid request type');
    if (((this.requestType = n), !E.isType(s, 'union') || !E.isType(s.getTypes()[0], 'string')))
      throw new Error('invalid error type');
    if (((this.errorType = s), a && (!E.isType(o, 'null') || s.getTypes().length > 1)))
      throw new Error('inapplicable one-way parameter');
    ((this.responseType = o),
      (this.oneWay = !!a),
      (this.doc = c !== void 0 ? '' + c : void 0),
      Object.freeze(this));
  }
  ((V.forSchema = function (t, n, s) {
    if (((s = s || {}), !C.isValidName(t))) throw new Error(W('invalid message name: %s', t));
    if (!Array.isArray(n.request)) throw new Error(W('invalid message request: %s', t));
    var o = W('%s.%sRequest', re.namespace, C.capitalize(t)),
      a = E.forSchema(
        { name: o, type: 'record', namespace: s.namespace || '', fields: n.request },
        s,
      );
    if ((delete s.registry[o], !n.response)) throw new Error(W('invalid message response: %s', t));
    var c = E.forSchema(n.response, s);
    if (n.errors !== void 0 && !Array.isArray(n.errors))
      throw new Error(W('invalid message errors: %s', t));
    var l = E.forSchema(['string'].concat(n.errors || []), s),
      x = !!n['one-way'];
    return new V(t, a, l, c, x, n.doc);
  }),
    (V.prototype.schema = E.prototype.getSchema),
    (V.prototype._attrs = function (t) {
      var n = this.requestType._attrs(t),
        s = { request: n.fields, response: this.responseType._attrs(t) },
        o = this.doc;
      o !== void 0 && (s.doc = o);
      var a = this.errorType._attrs(t);
      return (a.length > 1 && (s.errors = a.slice(1)), this.oneWay && (s['one-way'] = !0), s);
    }),
    C.addDeprecatedGetters(V, ['name', 'errorType', 'requestType', 'responseType']),
    (V.prototype.isOneWay = J.deprecate(function () {
      return this.oneWay;
    }, 'use `.oneWay` directly instead of `.isOneWay()`')));
  function O(t, n, s, o, a) {
    if (typeof t != 'string') return O.forProtocol(t, n);
    ((this.name = t),
      (this._messagesByName = n || {}),
      (this.messages = Object.freeze(C.objectValues(this._messagesByName))),
      (this._typesByName = s || {}),
      (this.types = Object.freeze(C.objectValues(this._typesByName))),
      (this.protocol = o),
      (this._hashStr = C.getHash(JSON.stringify(o)).toString('binary')),
      (this.doc = o.doc ? '' + o.doc : void 0),
      (this._server = a || this.createServer({ silent: !0 })),
      Object.freeze(this));
  }
  ((O.Client = M),
    (O.Server = ee),
    (O.compatible = function (t, n) {
      try {
        pe(t, n);
      } catch {
        return !1;
      }
      return !0;
    }),
    (O.forProtocol = function (t, n) {
      n = n || {};
      var s = t.protocol;
      if (!s) throw new Error('missing protocol name');
      if (t.namespace !== void 0) n.namespace = t.namespace;
      else {
        var o = /^(.*)\.[^.]+$/.exec(s);
        o && (n.namespace = o[1]);
      }
      ((s = C.qualify(s, n.namespace)),
        t.types &&
          t.types.forEach(function (c) {
            E.forSchema(c, n);
          }));
      var a;
      return (
        t.messages &&
          ((a = {}),
          Object.keys(t.messages).forEach(function (c) {
            a[c] = V.forSchema(c, t.messages[c], n);
          })),
        new O(s, a, n.registry, t)
      );
    }),
    (O.isService = function (t) {
      return !!t && t.hasOwnProperty('_hashStr');
    }),
    (O.prototype.createClient = function (t) {
      var n = new M(this, t);
      return (
        process.nextTick(function () {
          if (t && t.server) {
            var s = { objectMode: !0 },
              o = [new z.PassThrough(s), new z.PassThrough(s)];
            (t.server.createChannel({ readable: o[0], writable: o[1] }, s),
              n.createChannel({ readable: o[1], writable: o[0] }, s));
          } else t && t.transport && n.createChannel(t.transport);
        }),
        n
      );
    }),
    (O.prototype.createServer = function (t) {
      return new ee(this, t);
    }),
    Object.defineProperty(O.prototype, 'hash', {
      enumerable: !0,
      get: function () {
        return C.bufferFrom(this._hashStr, 'binary');
      },
    }),
    (O.prototype.message = function (t) {
      return this._messagesByName[t];
    }),
    (O.prototype.type = function (t) {
      return this._typesByName[t];
    }),
    (O.prototype.inspect = function () {
      return W('<Service %j>', this.name);
    }),
    C.addDeprecatedGetters(O, ['message', 'messages', 'name', 'type', 'types']),
    (O.prototype.createEmitter = J.deprecate(function (t, n) {
      n = n || {};
      var s = this.createClient({
          cache: n.cache,
          buffering: !1,
          strictTypes: n.strictErrors,
          timeout: n.timeout,
        }),
        o = s.createChannel(t, n);
      return (we(s, o), o);
    }, 'use `.createClient()` instead of `.createEmitter()`')),
    (O.prototype.createListener = J.deprecate(function (t, n) {
      if (n && n.strictErrors) throw new Error('use `.createServer()` to support strict errors');
      return this._server.createChannel(t, n);
    }, 'use `.createServer().createChannel()` instead of `.createListener()`')),
    (O.prototype.emit = J.deprecate(function (t, n, s, o) {
      if (!s || !this.equals(s.client._svc$)) throw new Error('invalid emitter');
      var a = s.client;
      return (M.prototype.emitMessage.call(a, t, n, o && o.bind(this)), s.getPending());
    }, 'create a client via `.createClient()` to emit messages instead of `.emit()`')),
    (O.prototype.equals = J.deprecate(function (t) {
      return O.isService(t) && this.getFingerprint().equals(t.getFingerprint());
    }, 'equality testing is deprecated, compare the `.protocol`s instead')),
    (O.prototype.getFingerprint = J.deprecate(function (t) {
      return C.getHash(JSON.stringify(this.protocol), t);
    }, 'use `.hash` instead of `.getFingerprint()`')),
    (O.prototype.getSchema = J.deprecate(
      E.prototype.getSchema,
      'use `.protocol` instead of `.getSchema()`',
    )),
    (O.prototype.on = J.deprecate(function (t, n) {
      var s = this;
      return (
        this._server.onMessage(t, function (o, a) {
          return n.call(s, o, this.channel, a);
        }),
        this
      );
    }, 'use `.createServer().onMessage()` instead of `.on()`')),
    (O.prototype.subprotocol = J.deprecate(function () {
      var t = this._server,
        n = { strictTypes: t._strict, cache: t._cache },
        s = new ee(t.service, n);
      return (
        (s._handlers = Object.create(t._handlers)),
        new O(this.name, this._messagesByName, this._typesByName, this.protocol, s)
      );
    }, '`.subprotocol()` will be removed in 5.1')),
    (O.prototype._attrs = function (t) {
      var n = { protocol: this.name },
        s = [];
      (this.types.forEach(function (a) {
        if (a.getName() !== void 0) {
          var c = a._attrs(t);
          typeof c != 'string' && s.push(c);
        }
      }),
        s.length && (n.types = s));
      var o = Object.keys(this._messagesByName);
      return (
        o.length &&
          ((n.messages = {}),
          o.forEach(function (a) {
            n.messages[a] = this._messagesByName[a]._attrs(t);
          }, this)),
        t && t.exportAttrs && this.doc !== void 0 && (n.doc = this.doc),
        n
      );
    }));
  function Q(t, n, s) {
    s === void 0 && typeof n == 'function' && ((s = n), (n = void 0));
    var o = new O({ protocol: 'Empty' }, re),
      a;
    o.createClient({ timeout: n && n.timeout })
      .createChannel(t, { scope: n && n.scope, endWritable: typeof t == 'function' })
      .once('handshake', function (c, l) {
        ((a = l.serverProtocol), this.destroy(!0));
      })
      .once('eot', function (c, l) {
        l && !/interrupted/.test(l) ? s(l) : s(null, JSON.parse(a));
      });
  }
  function M(t, n) {
    ((n = n || {}),
      R.EventEmitter.call(this),
      (this._svc$ = t),
      (this._channels$ = []),
      (this._fns$ = []),
      (this._buffering$ = !!n.buffering),
      (this._cache$ = n.cache || {}),
      (this._policy$ = n.channelPolicy),
      (this._strict$ = !!n.strictTypes),
      (this._timeout$ = C.getOption(n, 'timeout', 1e4)),
      n.remoteProtocols && ne(this._cache$, n.remoteProtocols, t, !0),
      this._svc$.messages.forEach(function (s) {
        this[s.name] = this._createMessageHandler$(s);
      }, this));
  }
  (J.inherits(M, R.EventEmitter),
    (M.prototype.activeChannels = function () {
      return this._channels$.slice();
    }),
    (M.prototype.createChannel = function (t, n) {
      var s = n && n.objectMode,
        o;
      if (typeof t == 'function') {
        var a;
        (s
          ? (a = t)
          : (a = function (P) {
              var F = new G(),
                N = t(function (I, U) {
                  if (I) {
                    P(I);
                    return;
                  }
                  var X = new A().once('error', function (te) {
                    o.destroy(te);
                  });
                  P(null, U.pipe(X));
                });
              if (N) return (F.pipe(N), F);
            }),
          (o = new m(this, a, n)));
      } else {
        var c, l;
        if ((e(t) ? (c = l = t) : ((c = t.readable), (l = t.writable)), !s)) {
          var x = new H();
          c = c.pipe(x);
          var g = new oe();
          (g.pipe(l), (l = g));
        }
        ((o = new b(this, c, l, n)),
          s ||
            (o.once('eot', function () {
              (c.unpipe(x), g.unpipe(l));
            }),
            x.once('error', function (P) {
              o.destroy(P);
            })));
      }
      var j = this._channels$;
      return (
        j.push(o),
        o.once('_drain', function () {
          j.splice(j.indexOf(this), 1);
        }),
        (this._buffering$ = !1),
        this.emit('channel', o),
        o
      );
    }),
    (M.prototype.destroyChannels = function (t) {
      this._channels$.forEach(function (n) {
        n.destroy(t && t.noWait);
      });
    }),
    (M.prototype.emitMessage = function (t, n, s, o) {
      var a = r(this._svc$, t),
        c = new Y(a, {}, n);
      this._emitMessage$(c, s, o);
    }),
    (M.prototype.remoteProtocols = function () {
      return ye(this._cache$, !0);
    }),
    Object.defineProperty(M.prototype, 'service', {
      enumerable: !0,
      get: function () {
        return this._svc$;
      },
    }),
    (M.prototype.use = function () {
      var t, n, s;
      for (t = 0, n = arguments.length; t < n; t++)
        ((s = arguments[t]), this._fns$.push(s.length < 3 ? s(this) : s));
      return this;
    }),
    (M.prototype._emitMessage$ = function (t, n, s) {
      !s && typeof n == 'function' && ((s = n), (n = void 0));
      var o = this,
        a = this._channels$,
        c = a.length;
      if (!c) {
        if (this._buffering$)
          (Z('no active client channels, buffering call'),
            this.once('channel', function () {
              this._emitMessage$(t, n, s);
            }));
        else {
          var l = new Error('no active channels');
          process.nextTick(function () {
            s ? s.call(new h(t._msg), l) : o.emit('error', l);
          });
        }
        return;
      }
      ((n = n || {}), n.timeout === void 0 && (n.timeout = this._timeout$));
      var x;
      if (c === 1) x = a[0];
      else if (this._policy$) {
        if (((x = this._policy$(this._channels$.slice())), !x)) {
          Z('policy returned no channel, skipping call');
          return;
        }
      } else x = a[Math.floor(Math.random() * c)];
      x._emit(t, n, function (g, j) {
        var P = this,
          F = P.message.errorType;
        if (g) {
          (o._strict$ && (g = F.clone(g.message, { wrapUnions: !0 })), N(g));
          return;
        }
        if (!j) {
          N();
          return;
        }
        ((g = j.error),
          o._strict$ ||
            (g === void 0
              ? (g = null)
              : E.isType(F, 'union:unwrapped')
                ? typeof g == 'string' && (g = new Error(g))
                : g && g.string && typeof g.string == 'string' && (g = new Error(g.string))),
          N(g, j.response));
        function N(I, U) {
          s ? s.call(P, I, U) : I && o.emit('error', I);
        }
      });
    }),
    (M.prototype._createMessageHandler$ = function (t) {
      var n = t.requestType.getFields(),
        s = n.map(function (a) {
          return a.getName();
        }),
        o = 'return function ' + t.name + '(';
      return (
        s.length && (o += s.join(', ') + ', '),
        (o += `opts, cb) {
`),
        (o += '  var req = {'),
        (o += s
          .map(function (a) {
            return a + ': ' + a;
          })
          .join(', ')),
        (o += `};
`),
        (o +=
          "  return this.emitMessage('" +
          t.name +
          `', req, opts, cb);
`),
        (o += '};'),
        new Function(o)()
      );
    }));
  function ee(t, n) {
    ((n = n || {}),
      R.EventEmitter.call(this),
      (this.service = t),
      (this._handlers = {}),
      (this._fns = []),
      (this._channels = {}),
      (this._nextChannelId = 1),
      (this._cache = n.cache || {}),
      (this._defaultHandler = n.defaultHandler),
      (this._sysErrFormatter = n.systemErrorFormatter),
      (this._silent = !!n.silent),
      (this._strict = !!n.strictTypes),
      n.remoteProtocols && ne(this._cache, n.remoteProtocols, t, !1),
      t.messages.forEach(function (s) {
        var o = s.name;
        (n.noCapitalize || (o = C.capitalize(o)), (this['on' + o] = this._createMessageHandler(s)));
      }, this));
  }
  (J.inherits(ee, R.EventEmitter),
    (ee.prototype.activeChannels = function () {
      return C.objectValues(this._channels);
    }),
    (ee.prototype.createChannel = function (t, n) {
      var s = n && n.objectMode,
        o;
      if (typeof t == 'function') {
        var a;
        (s
          ? (a = t)
          : (a = function (F) {
              var N = new A().once('error', function (I) {
                o.destroy(I);
              });
              return t(function (I, U) {
                if (I) {
                  F(I);
                  return;
                }
                var X = new G();
                (X.pipe(U), F(null, X));
              }).pipe(N);
            }),
          (o = new D(this, a, n)));
      } else {
        var c, l;
        if ((e(t) ? (c = l = t) : ((c = t.readable), (l = t.writable)), !s)) {
          var x = new H();
          c = c.pipe(x);
          var g = new oe();
          (g.pipe(l), (l = g));
        }
        ((o = new w(this, c, l, n)),
          s ||
            (o.once('eot', function () {
              (c.unpipe(x), g.unpipe(l));
            }),
            x.once('error', function (F) {
              o.destroy(F);
            })));
      }
      this.listeners('error').length || this.on('error', this._onError);
      var j = this._nextChannelId++,
        P = this._channels;
      return (
        (P[j] = o.once('eot', function () {
          delete P[j];
        })),
        this.emit('channel', o),
        o
      );
    }),
    (ee.prototype.onMessage = function (t, n) {
      return (r(this.service, t), (this._handlers[t] = n), this);
    }),
    (ee.prototype.remoteProtocols = function () {
      return ye(this._cache, !1);
    }),
    (ee.prototype.use = function () {
      var t, n, s;
      for (t = 0, n = arguments.length; t < n; t++)
        ((s = arguments[t]), this._fns.push(s.length < 3 ? s(this) : s));
      return this;
    }),
    (ee.prototype._createMessageHandler = function (t) {
      var n = t.name,
        s = t.requestType.fields,
        o = s.length,
        a = s.length
          ? ', ' +
            s
              .map(function (l) {
                return 'req.' + l.name;
              })
              .join(', ')
          : '',
        c = `return function (handler) {
`;
      return (
        (c +=
          '  if (handler.length > ' +
          o +
          `) {
`),
        (c +=
          "    return this.onMessage('" +
          n +
          `', function (req, cb) {
`),
        (c +=
          '      return handler.call(this' +
          a +
          `, cb);
`),
        (c += `    });
`),
        (c += `  } else {
`),
        (c +=
          "    return this.onMessage('" +
          n +
          `', function (req) {
`),
        (c +=
          '      return handler.call(this' +
          a +
          `);
`),
        (c += `    });
`),
        (c += `  }
`),
        (c += `};
`),
        new Function(c)()
      );
    }),
    (ee.prototype._onError = function (t) {
      !this._silent &&
        t.rpcCode !== 'UNKNOWN_PROTOCOL' &&
        (console.error(),
        t.rpcCode
          ? (console.error(t.rpcCode), console.error(t.cause))
          : (console.error('INTERNAL_SERVER_ERROR'), console.error(t)));
    }));
  function d(t, n) {
    ((n = n || {}),
      R.EventEmitter.call(this),
      (this.client = t),
      (this.timeout = C.getOption(n, 'timeout', t._timeout$)),
      (this._endWritable = !!C.getOption(n, 'endWritable', !0)),
      (this._prefix = be(n.scope)));
    var s = t._cache$,
      o = t._svc$,
      a = n.serverHash;
    a || (a = o.hash);
    var c = s[a];
    (c || ((a = o.hash), (c = s[a] = new k(o, o, a))),
      (this._adapter = c),
      (this._registry = new y(this, K)),
      (this.pending = 0),
      (this.destroyed = !1),
      (this.draining = !1),
      this.once('_eot', function (l, x) {
        (Z('client channel EOT'), (this.destroyed = !0), this.emit('eot', l, x));
      }));
  }
  (J.inherits(d, R.EventEmitter),
    (d.prototype.destroy = function (t) {
      (Z('destroying client channel'),
        this.draining || ((this.draining = !0), this.emit('_drain')));
      var n = this._registry,
        s = this.pending;
      (t && n.clear(),
        t || !s
          ? de(t)
            ? (Z('fatal client channel error: %s', t), this.emit('_eot', s, t))
            : this.emit('_eot', s)
          : Z('client channel entering drain mode (%s pending)', s));
    }),
    (d.prototype.ping = function (t, n) {
      !n && typeof t == 'function' && ((n = t), (t = void 0));
      var s = this,
        o = new Y(L);
      this._emit(o, { timeout: t }, function (a) {
        n ? n.call(s, a) : a && s.destroy(a);
      });
    }),
    (d.prototype._createHandshakeRequest = function (t, n) {
      var s = this.client._svc$;
      return {
        clientHash: s.hash,
        clientProtocol: n ? null : JSON.stringify(s.protocol),
        serverHash: t._hash,
      };
    }),
    (d.prototype._emit = function (t, n, s) {
      var o = t._msg,
        a = o.oneWay ? void 0 : new f(o, {}),
        c = new h(o, this),
        l = this;
      (this.pending++,
        process.nextTick(function () {
          if (!o.name) x(t, a, g);
          else {
            l.emit('outgoingCall', c, n);
            var P = l.client._fns$;
            (Z('starting client middleware chain (%s middleware)', P.length),
              i({
                fns: P,
                ctx: c,
                wreq: t,
                wres: a,
                onTransition: x,
                onCompletion: g,
                onError: j,
              }));
          }
        }));
      function x(P, F, N) {
        var I, U;
        if (l.destroyed) I = new Error('channel destroyed');
        else
          try {
            U = P.toBuffer();
          } catch {
            I = ge(W('invalid %j request', o.name), P, [
              { name: 'headers', type: p },
              { name: 'request', type: o.requestType },
            ]);
          }
        if (I) {
          N(I);
          return;
        }
        var X = n && n.timeout !== void 0 ? n.timeout : l.timeout,
          te = l._registry.add(X, function (se, ue, fe) {
            if (!se && !o.oneWay)
              try {
                fe._decodeResponse(ue, F, o);
              } catch (ve) {
                se = ve;
              }
            N(se);
          });
        ((te |= l._prefix), Z('sending message %s', te), l._send(te, U, !!o && o.oneWay));
      }
      function g(P) {
        (l.pending--, s.call(c, P, a), l.draining && !l.destroyed && !l.pending && l.destroy());
      }
      function j(P) {
        l.client.emit('error', P, l);
      }
    }),
    (d.prototype._getAdapter = function (t) {
      var n = t.serverHash,
        s = this.client._cache$,
        o = s[n];
      if (o) return o;
      var a = JSON.parse(t.serverProtocol),
        c = O.forProtocol(a);
      return ((o = new k(this.client._svc$, c, n, !0)), (s[n] = o));
    }),
    (d.prototype._matchesPrefix = function (t) {
      return ke(t, this._prefix);
    }),
    (d.prototype._send = C.abstractFunction),
    C.addDeprecatedGetters(d, ['pending', 'timeout']),
    (d.prototype.getCache = J.deprecate(function () {
      return this.client._cache$;
    }, 'use `.remoteProtocols()` instead of `.getCache()`')),
    (d.prototype.getProtocol = J.deprecate(function () {
      return this.client._svc$;
    }, 'use `.service` instead or `.getProtocol()`')),
    (d.prototype.isDestroyed = J.deprecate(function () {
      return this.destroyed;
    }, 'use `.destroyed` instead of `.isDestroyed`')));
  function m(t, n, s) {
    (d.call(this, t, s),
      (this._writableFactory = n),
      (!s || !s.noPing) && (Z('emitting ping request'), this.ping()));
  }
  (J.inherits(m, d),
    (m.prototype._send = function (t, n) {
      var s = this._registry.get(t),
        o = this._adapter,
        a = this;
      return (process.nextTick(c), !0);
      function c(l) {
        if (!a.destroyed) {
          var x = a._createHandshakeRequest(o, !l),
            g = a._writableFactory.call(a, function (j, P) {
              if (j) {
                s(j);
                return;
              }
              P.on('data', function (F) {
                Z('received response %s', F.id);
                var N = B.concat(F.payload);
                try {
                  var I = ae(q, N),
                    U = I.head;
                  U.serverHash && (o = a._getAdapter(U));
                } catch (te) {
                  s(te);
                  return;
                }
                var X = U.match;
                (Z('handshake match: %s', X),
                  a.emit('handshake', x, U),
                  X === 'NONE'
                    ? process.nextTick(function () {
                        c(!0);
                      })
                    : ((a._adapter = o), s(null, I.tail, o)));
              });
            });
          if (!g) {
            s(new Error('invalid writable stream'));
            return;
          }
          (g.write({ id: t, payload: [S.toBuffer(x), n] }), a._endWritable && g.end());
        }
      }
    }));
  function b(t, n, s, o) {
    (d.call(this, t, o),
      (this._readable = n),
      (this._writable = s),
      (this._connected = !!(o && o.noPing)),
      this._readable.on('end', P),
      this._writable.on('finish', F));
    var a = this,
      c = null;
    this.once('eot', function () {
      (c && (clearTimeout(c), (c = null)),
        a._connected || a.emit('_ready'),
        this._writable.removeListener('finish', F),
        this._endWritable && (Z('ending transport'), this._writable.end()),
        this._readable
          .removeListener('data', g)
          .removeListener('data', j)
          .removeListener('end', P));
    });
    var l;
    this._connected
      ? this._readable.on('data', j)
      : (this._readable.on('data', g),
        process.nextTick(x),
        a.timeout &&
          (c = setTimeout(function () {
            a.destroy(new Error('timeout'));
          }, a.timeout)));
    function x(N) {
      if (!a.destroyed) {
        l = a._createHandshakeRequest(a._adapter, !N);
        var I = [S.toBuffer(l), C.bufferFrom([0, 0])];
        a._writable.write({ id: a._prefix, payload: I });
      }
    }
    function g(N) {
      if (!a._matchesPrefix(N.id)) {
        Z('discarding unscoped response %s (still connecting)', N.id);
        return;
      }
      var I = B.concat(N.payload);
      try {
        var U = ae(q, I).head;
        U.serverHash && (a._adapter = a._getAdapter(U));
      } catch (te) {
        a.destroy(te);
        return;
      }
      var X = U.match;
      (Z('handshake match: %s', X),
        a.emit('handshake', l, U),
        X === 'NONE'
          ? process.nextTick(function () {
              x(!0);
            })
          : (Z('successfully connected'),
            c && (clearTimeout(c), (c = null)),
            a._readable.removeListener('data', g).on('data', j),
            (a._connected = !0),
            a.emit('_ready'),
            (l = null)));
    }
    function j(N) {
      var I = N.id;
      if (!a._matchesPrefix(I)) {
        Z('discarding unscoped message %s', I);
        return;
      }
      var U = a._registry.get(I);
      U &&
        process.nextTick(function () {
          (Z('received message %s', I), U(null, B.concat(N.payload), a._adapter));
        });
    }
    function P() {
      a.destroy(!0);
    }
    function F() {
      a.destroy();
    }
  }
  (J.inherits(b, d),
    (b.prototype._emit = function () {
      if (this._connected || this.draining) d.prototype._emit.apply(this, arguments);
      else {
        Z('queuing request');
        var t = [],
          n,
          s;
        for (n = 0, s = arguments.length; n < s; n++) t.push(arguments[n]);
        this.once('_ready', function () {
          this._emit.apply(this, t);
        });
      }
    }),
    (b.prototype._send = function (t, n, s) {
      if (s) {
        var o = this;
        process.nextTick(function () {
          o._registry.get(t)(null, C.bufferFrom([0, 0, 0]), o._adapter);
        });
      }
      return this._writable.write({ id: t, payload: [n] });
    }));
  function v(t, n) {
    ((n = n || {}),
      R.EventEmitter.call(this),
      (this.server = t),
      (this._endWritable = !!C.getOption(n, 'endWritable', !0)),
      (this._prefix = be(n.scope)));
    var s = t._cache,
      o = t.service,
      a = o.hash;
    (s[a] || (s[a] = new k(o, o, a)),
      (this._adapter = null),
      (this.destroyed = !1),
      (this.draining = !1),
      (this.pending = 0),
      this.once('_eot', function (c, l) {
        (Z('server channel EOT'), this.emit('eot', c, l));
      }));
  }
  (J.inherits(v, R.EventEmitter),
    (v.prototype.destroy = function (t) {
      (this.draining || ((this.draining = !0), this.emit('_drain')),
        (t || !this.pending) &&
          ((this.destroyed = !0),
          de(t)
            ? (Z('fatal server channel error: %s', t), this.emit('_eot', this.pending, t))
            : this.emit('_eot', this.pending)));
    }),
    (v.prototype._createHandshakeResponse = function (t, n) {
      var s = this.server.service,
        o = s.hash,
        a = n && n.serverHash.equals(o);
      return {
        match: t ? 'NONE' : a ? 'BOTH' : 'CLIENT',
        serverProtocol: a ? null : JSON.stringify(s.protocol),
        serverHash: a ? null : o,
      };
    }),
    (v.prototype._getAdapter = function (t) {
      var n = t.clientHash,
        s = this.server._cache[n];
      if (s) return s;
      if (!t.clientProtocol) throw le('UNKNOWN_PROTOCOL');
      var o = JSON.parse(t.clientProtocol),
        a = O.forProtocol(o);
      return ((s = new k(a, this.server.service, n, !0)), (this.server._cache[n] = s));
    }),
    (v.prototype._matchesPrefix = function (t) {
      return ke(t, this._prefix);
    }),
    (v.prototype._receive = function (t, n, s) {
      var o = this,
        a;
      try {
        a = n._decodeRequest(t);
      } catch (N) {
        s(o._encodeSystemError(le('INVALID_REQUEST', N)));
        return;
      }
      var c = a._msg,
        l = new f(c, {});
      if (!c.name) {
        ((l.response = null), s(l.toBuffer(), !1));
        return;
      }
      var x = new h(c, this);
      o.emit('incomingCall', x);
      var g = this.server._fns;
      (Z('starting server middleware chain (%s middleware)', g.length),
        o.pending++,
        i({ fns: g, ctx: x, wreq: a, wres: l, onTransition: j, onCompletion: P, onError: F }));
      function j(N, I, U) {
        var X = o.server._handlers[c.name];
        if (X) {
          var ue = !c.oneWay;
          try {
            ue
              ? X.call(x, N.request, function (fe, ve) {
                  ((ue = !1), (I.error = fe), (I.response = ve), U());
                })
              : (X.call(x, N.request), U());
          } catch (fe) {
            ue ? ((ue = !1), U(fe)) : F(fe);
          }
        } else {
          var te = o.server._defaultHandler;
          if (te) te.call(x, N, I, U);
          else {
            var se = new Error(W('no handler for %s', c.name));
            U(le('NOT_IMPLEMENTED', se));
          }
        }
      }
      function P(N) {
        o.pending--;
        var I = o.server,
          U;
        if (!N) {
          var X = l.error,
            te = I._strict;
          te ||
            (de(X)
              ? (l.error = c.errorType.clone(X.message, { wrapUnions: !0 }))
              : X === null && (X = l.error = void 0),
            X === void 0 &&
              l.response === void 0 &&
              c.responseType.isValid(null) &&
              (l.response = null));
          try {
            U = l.toBuffer();
          } catch {
            l.error !== void 0
              ? (N = ge(W('invalid %j error', c.name), l, [
                  { name: 'headers', type: p },
                  { name: 'error', type: c.errorType },
                ]))
              : (N = ge(W('invalid %j response', c.name), l, [
                  { name: 'headers', type: p },
                  { name: 'response', type: c.responseType },
                ]));
          }
        }
        (U
          ? X !== void 0 && I.emit('error', le('APPLICATION_ERROR', X))
          : (U = o._encodeSystemError(N, l.headers)),
          s(U, c.oneWay),
          o.draining && !o.pending && o.destroy());
      }
      function F(N) {
        o.server.emit('error', N, o);
      }
    }),
    C.addDeprecatedGetters(v, ['pending']),
    (v.prototype.getCache = J.deprecate(function () {
      return this.server._cache;
    }, 'use `.remoteProtocols()` instead of `.getCache()`')),
    (v.prototype.getProtocol = J.deprecate(function () {
      return this.server.service;
    }, 'use `.service` instead of `.getProtocol()`')),
    (v.prototype.isDestroyed = J.deprecate(function () {
      return this.destroyed;
    }, 'use `.destroyed` instead of `.isDestroyed`')),
    (v.prototype._encodeSystemError = function (t, n) {
      var s = this.server;
      s.emit('error', t, this);
      var o;
      s._sysErrFormatter ? (o = s._sysErrFormatter.call(this, t)) : t.rpcCode && (o = t.message);
      var a;
      if (n)
        try {
          a = p.toBuffer(n);
        } catch (c) {
          s.emit('error', c, this);
        }
      return B.concat([
        a || C.bufferFrom([0]),
        C.bufferFrom([1, 0]),
        _.toBuffer(o || 'internal server error'),
      ]);
    }));
  function D(t, n, s) {
    (v.call(this, t, s), (this._writable = void 0));
    var o = this,
      a;
    process.nextTick(function () {
      a = n
        .call(o, function (g, j) {
          process.nextTick(function () {
            if (g) {
              x(g);
              return;
            }
            ((o._writable = j.on('finish', x)), o.emit('_writable'));
          });
        })
        .on('data', c)
        .on('end', l);
    });
    function c(g) {
      var j = g.id,
        P = B.concat(g.payload),
        F;
      try {
        var N = ae(S, P),
          I = N.head,
          U = o._getAdapter(I);
      } catch (se) {
        F = le('INVALID_HANDSHAKE_REQUEST', se);
      }
      var X = o._createHandshakeResponse(F, I);
      (o.emit('handshake', I, X), F ? te(o._encodeSystemError(F)) : o._receive(N.tail, U, te));
      function te(se) {
        if (!o.destroyed) {
          if (!o._writable) {
            o.once('_writable', function () {
              te(se);
            });
            return;
          }
          o._writable.write({ id: j, payload: [q.toBuffer(X), se] });
        }
        o._writable && o._endWritable && o._writable.end();
      }
    }
    function l() {
      o.destroy();
    }
    function x(g) {
      (a.removeListener('data', c).removeListener('end', l), o.destroy(g || !0));
    }
  }
  J.inherits(D, v);
  function w(t, n, s, o) {
    (v.call(this, t, o),
      (this._adapter = void 0),
      (this._writable = s.on('finish', g)),
      (this._readable = n.on('data', c).on('end', x)),
      this.once('_drain', function () {
        this._readable.removeListener('data', c).removeListener('data', l).removeListener('end', x);
      }).once('eot', function () {
        (this._writable.removeListener('finish', g), this._endWritable && this._writable.end());
      }));
    var a = this;
    function c(j) {
      var P = j.id;
      if (!a._matchesPrefix(P)) return;
      var F = B.concat(j.payload),
        N;
      try {
        var I = ae(S, F),
          U = I.head;
        a._adapter = a._getAdapter(U);
      } catch (se) {
        N = le('INVALID_HANDSHAKE_REQUEST', se);
      }
      var X = a._createHandshakeResponse(N, U);
      (a.emit('handshake', U, X),
        N
          ? te(a._encodeSystemError(N))
          : (a._readable.removeListener('data', c).on('data', l),
            a._receive(I.tail, a._adapter, te)));
      function te(se) {
        a.destroyed || a._writable.write({ id: P, payload: [q.toBuffer(X), se] });
      }
    }
    function l(j) {
      var P = j.id;
      if (a._matchesPrefix(P)) {
        var F = B.concat(j.payload);
        a._receive(F, a._adapter, function (N, I) {
          a.destroyed || I || a._writable.write({ id: P, payload: [N] });
        });
      }
    }
    function x() {
      a.destroy();
    }
    function g() {
      a.destroy(!0);
    }
  }
  J.inherits(w, v);
  function Y(t, n, s) {
    ((this._msg = t), (this.headers = n || {}), (this.request = s || {}));
  }
  Y.prototype.toBuffer = function () {
    var t = this._msg;
    return B.concat([
      p.toBuffer(this.headers),
      _.toBuffer(t.name),
      t.requestType.toBuffer(this.request),
    ]);
  };
  function f(t, n, s, o) {
    ((this._msg = t), (this.headers = n), (this.error = s), (this.response = o));
  }
  f.prototype.toBuffer = function () {
    var t = p.toBuffer(this.headers),
      n = this.error !== void 0;
    return B.concat([
      t,
      u.toBuffer(n),
      n ? this._msg.errorType.toBuffer(this.error) : this._msg.responseType.toBuffer(this.response),
    ]);
  };
  function h(t, n) {
    ((this.channel = n), (this.locals = {}), (this.message = t), Object.freeze(this));
  }
  function y(t, n) {
    ((this._ctx = t),
      (this._mask = -1 >>> (n | 0)),
      (this._id = 0),
      (this._n = 0),
      (this._cbs = {}));
  }
  ((y.prototype.get = function (t) {
    return this._cbs[t & this._mask];
  }),
    (y.prototype.add = function (t, n) {
      this._id = (this._id + 1) & this._mask;
      var s = this,
        o = this._id,
        a;
      return (
        t > 0 &&
          (a = setTimeout(function () {
            c(new Error('timeout'));
          }, t)),
        (this._cbs[o] = c),
        this._n++,
        o
      );
      function c() {
        s._cbs[o] && (delete s._cbs[o], s._n--, a && clearTimeout(a), n.apply(s._ctx, arguments));
      }
    }),
    (y.prototype.clear = function () {
      Object.keys(this._cbs).forEach(function (t) {
        this._cbs[t](new Error('interrupted'));
      }, this);
    }));
  function k(t, n, s, o) {
    ((this._clientSvc = t),
      (this._serverSvc = n),
      (this._hash = s),
      (this._isRemote = !!o),
      (this._readers = pe(t, n)));
  }
  ((k.prototype._decodeRequest = function (t) {
    var n = new ie(t),
      s = p._read(n),
      o = _._read(n),
      a,
      c;
    if (
      (o ? ((a = this._serverSvc.message(o)), (c = this._readers[o + '?']._read(n))) : (a = L),
      !n.isValid())
    )
      throw new Error(W('truncated %s request', o || 'ping$'));
    return new Y(a, s, c);
  }),
    (k.prototype._decodeResponse = function (t, n, s) {
      var o = new ie(t);
      C.copyOwnProperties(p._read(o), n.headers, !0);
      var a = u._read(o),
        c = s.name;
      if (c) {
        var l = this._readers[c + (a ? '*' : '!')];
        if (
          ((s = this._clientSvc.message(c)),
          a ? (n.error = l._read(o)) : (n.response = l._read(o)),
          !o.isValid())
        )
          throw new Error(W('truncated %s response', c));
      } else s = L;
    }));
  function A() {
    (z.Transform.call(this, { readableObjectMode: !0 }),
      (this._id = void 0),
      (this._buf = C.newBuffer(0)),
      (this._bufs = []),
      this.on('finish', function () {
        this.push(null);
      }));
  }
  (J.inherits(A, z.Transform),
    (A.prototype._transform = function (t, n, s) {
      t = B.concat([this._buf, t]);
      for (var o; t.length >= 4 && t.length >= (o = t.readInt32BE(0)) + 4; ) {
        if (o) this._bufs.push(t.slice(4, o + 4));
        else {
          var a = this._bufs;
          ((this._bufs = []), this.push({ id: null, payload: a }));
        }
        t = t.slice(o + 4);
      }
      ((this._buf = t), s());
    }),
    (A.prototype._flush = function (t) {
      if (this._buf.length || this._bufs.length) {
        var n = this._bufs.slice();
        n.unshift(this._buf);
        var s = le('TRAILING_DATA');
        ((s.trailingData = B.concat(n).toString()), this.emit('error', s));
      }
      t();
    }));
  function G() {
    (z.Transform.call(this, { writableObjectMode: !0 }),
      this.on('finish', function () {
        this.push(null);
      }));
  }
  (J.inherits(G, z.Transform),
    (G.prototype._transform = function (t, n, s) {
      var o = t.payload,
        a,
        c,
        l;
      for (a = 0, c = o.length; a < c; a++) ((l = o[a]), this.push(ce(l.length)), this.push(l));
      (this.push(ce(0)), s());
    }));
  function H() {
    (z.Transform.call(this, { readableObjectMode: !0 }),
      (this._id = void 0),
      (this._frameCount = 0),
      (this._buf = C.newBuffer(0)),
      (this._bufs = []),
      this.on('finish', function () {
        this.push(null);
      }));
  }
  (J.inherits(H, z.Transform),
    (H.prototype._transform = function (t, n, s) {
      for (t = B.concat([this._buf, t]); ; ) {
        if (this._id === void 0) {
          if (t.length < 8) {
            ((this._buf = t), s());
            return;
          }
          ((this._id = t.readInt32BE(0)), (this._frameCount = t.readInt32BE(4)), (t = t.slice(8)));
        }
        for (var o; this._frameCount && t.length >= 4 && t.length >= (o = t.readInt32BE(0)) + 4; )
          (this._frameCount--, this._bufs.push(t.slice(4, o + 4)), (t = t.slice(o + 4)));
        if (this._frameCount) {
          ((this._buf = t), s());
          return;
        } else {
          var a = { id: this._id, payload: this._bufs };
          ((this._bufs = []), (this._id = void 0), this.push(a));
        }
      }
    }),
    (H.prototype._flush = A.prototype._flush));
  function oe() {
    (z.Transform.call(this, { writableObjectMode: !0 }),
      this.on('finish', function () {
        this.push(null);
      }));
  }
  (J.inherits(oe, z.Transform),
    (oe.prototype._transform = function (t, n, s) {
      var o = t.payload,
        a = o.length,
        c;
      ((c = C.newBuffer(8)), c.writeInt32BE(t.id, 0), c.writeInt32BE(a, 4), this.push(c));
      var l;
      for (l = 0; l < a; l++) ((c = o[l]), this.push(ce(c.length)), this.push(c));
      s();
    }));
  function ce(t) {
    var n = C.newBuffer(4);
    return (n.writeInt32BE(t), n);
  }
  function ae(t, n) {
    var s = new ie(n),
      o = t._read(s);
    if (!s.isValid()) throw new Error(W('truncated %j', t.schema()));
    return { head: o, tail: s.buf.slice(s.pos) };
  }
  function he(t, n) {
    return t.equals(n) ? t : t.createResolver(n);
  }
  function pe(t, n) {
    var s = {};
    return (
      t.messages.forEach(function (o) {
        var a = o.name,
          c = n.message(a);
        try {
          if (!c) throw new Error(W('missing server message: %s', a));
          if (c.oneWay !== o.oneWay) throw new Error(W('inconsistent one-way message: %s', a));
          ((s[a + '?'] = he(c.requestType, o.requestType)),
            (s[a + '*'] = he(o.errorType, c.errorType)),
            (s[a + '!'] = he(o.responseType, c.responseType)));
        } catch (l) {
          throw le('INCOMPATIBLE_PROTOCOL', l);
        }
      }),
      s
    );
  }
  function ne(t, n, s, o) {
    Object.keys(n).forEach(function (a) {
      var c = n[a],
        l,
        x;
      (o ? ((l = s), (x = O.forProtocol(c))) : ((l = O.forProtocol(c)), (x = s)),
        (t[a] = new k(l, x, a, !0)));
    });
  }
  function ye(t, n) {
    var s = {};
    return (
      Object.keys(t).forEach(function (o) {
        var a = t[o];
        if (a._isRemote) {
          var c = n ? a._serverSvc : a._clientSvc;
          s[o] = c.protocol;
        }
      }),
      s
    );
  }
  function de(t) {
    return !!t && Object.prototype.toString.call(t) === '[object Error]';
  }
  function we(t, n) {
    return t.on('error', function (s) {
      n.emit('error', s, t);
    });
  }
  function _e(t, n) {
    var s = new Error(t);
    return ((s.cause = n), s);
  }
  function le(t, n) {
    var s = _e(t.toLowerCase().replace(/_/g, ' '), n);
    return ((s.rpcCode = n && n.rpcCode ? n.rpcCode : t), s);
  }
  function ge(t, n, s) {
    var o = [],
      a,
      c,
      l;
    for (a = 0, c = s.length; a < c; a++) ((l = s[a]), l.type.isValid(n[l.name], { errorHook: j }));
    var x = o
        .map(function (P) {
          return W('%s = %j but expected %s', P.path, P.value, P.type);
        })
        .join(', '),
      g = new Error(W('%s (%s)', t, x));
    return ((g.details = o), g);
    function j(P, F, N) {
      var I = [],
        U,
        X,
        te;
      for (U = 0, X = P.length; U < X; U++)
        ((te = P[U]), isNaN(te) ? I.push('.' + te) : I.push('[' + te + ']'));
      o.push({ path: l.name + I.join(''), value: F, type: N });
    }
  }
  function be(t) {
    return t ? C.getHash(t).readInt16BE(0) << (32 - K) : 0;
  }
  function ke(t, n) {
    return (t ^ n) >> (32 - K) === 0;
  }
  function e(t) {
    return !!(t && t.pipe);
  }
  function r(t, n) {
    var s = t.message(n);
    if (!s) throw new Error(W('unknown message: %s', n));
    return s;
  }
  function i(t) {
    var n = [t.wreq, t.wres],
      s = [],
      o;
    a(0);
    function a(l) {
      var x = !1;
      l < t.fns.length
        ? t.fns[l].apply(
            t.ctx,
            n.concat(function (g, j) {
              if (x) {
                t.onError(_e('duplicate forward middleware call', g));
                return;
              }
              if (
                ((x = !0), g || (t.wres && (t.wres.error !== void 0 || t.wres.response !== void 0)))
              ) {
                ((o = g), c());
                return;
              }
              (j && s.push(j), a(++l));
            }),
          )
        : t.onTransition.apply(
            t.ctx,
            n.concat(function (g) {
              if (x) {
                t.onError(_e('duplicate handler call', g));
                return;
              }
              ((x = !0), (o = g), process.nextTick(c));
            }),
          );
    }
    function c() {
      var l = s.pop();
      if (l) {
        var x = !1;
        l.call(t.ctx, o, function (g) {
          if (x) {
            t.onError(_e('duplicate backward middleware call', g));
            return;
          }
          ((o = g), (x = !0), c());
        });
      } else t.onCompletion.call(t.ctx, o);
    }
  }
  return (
    (Be = {
      Adapter: k,
      HANDSHAKE_REQUEST_TYPE: S,
      HANDSHAKE_RESPONSE_TYPE: q,
      Message: V,
      Registry: y,
      Service: O,
      discoverProtocol: Q,
      streams: { FrameDecoder: A, FrameEncoder: G, NettyDecoder: H, NettyEncoder: oe },
    }),
    Be
  );
}
var Ne, qe;
function Ye() {
  if (qe) return Ne;
  qe = 1;
  function T() {
    return new Error('unsupported in the browser');
  }
  function C() {
    return function (R, z, J) {
      J(T());
    };
  }
  function $() {
    return function () {
      throw T();
    };
  }
  return (
    (Ne = {
      createImportHook: C,
      createSyncImportHook: $,
      existsSync: function () {
        return !1;
      },
      readFileSync: function () {
        throw T();
      },
    }),
    Ne
  );
}
var Ce, Re;
function Ge() {
  if (Re) return Ce;
  Re = 1;
  var T = Ye(),
    C = me(),
    $ = require('path'),
    R = require('util'),
    z = R.format,
    J = {
      date: { type: 'int', logicalType: 'date' },
      decimal: { type: 'bytes', logicalType: 'decimal' },
      time_ms: { type: 'long', logicalType: 'time-millis' },
      timestamp_ms: { type: 'long', logicalType: 'timestamp-millis' },
    };
  function B(u, p, _) {
    (!_ && typeof p == 'function' && ((_ = p), (p = void 0)),
      (p = p || {}),
      p.importHook || (p.importHook = T.createImportHook()),
      S(u, function (L, V) {
        if (L) {
          _(L);
          return;
        }
        if (!V) {
          _(new Error('empty root import'));
          return;
        }
        var O = V.types;
        if (O) {
          var Q = re(V) || '';
          O.forEach(function (M) {
            M.namespace === Q && delete M.namespace;
          });
        }
        _(null, V);
      }));
    function S(L, V) {
      p.importHook(L, 'idl', function (O, Q) {
        if (O) {
          V(O);
          return;
        }
        if (Q === void 0) {
          V();
          return;
        }
        try {
          var M = new E(Q, p),
            ee = M._readProtocol(Q, p);
        } catch (d) {
          ((d.path = L), V(d));
          return;
        }
        q(ee.protocol, ee.imports, $.dirname(L), V);
      });
    }
    function q(L, V, O, Q) {
      var M = [];
      ee();
      function ee() {
        var d = V.shift();
        if (!d) {
          M.reverse();
          try {
            M.forEach(function (b) {
              K(L, b);
            });
          } catch (b) {
            Q(b);
            return;
          }
          Q(null, L);
          return;
        }
        var m = $.join(O, d.name);
        d.kind === 'idl'
          ? S(m, function (b, v) {
              if (b) {
                Q(b);
                return;
              }
              (v && M.push(v), ee());
            })
          : p.importHook(m, d.kind, function (b, v) {
              if (b) {
                Q(b);
                return;
              }
              switch (d.kind) {
                case 'protocol':
                case 'schema':
                  if (v === void 0) {
                    ee();
                    return;
                  }
                  try {
                    var D = JSON.parse(v);
                  } catch (Y) {
                    ((Y.path = m), Q(Y));
                    return;
                  }
                  var w = d.kind === 'schema' ? { types: [D] } : D;
                  (M.push(w), ee());
                  return;
                default:
                  Q(new Error(z('invalid import kind: %s', d.kind)));
              }
            });
      }
    }
    function K(L, V) {
      var O = V.types || [];
      (O.reverse(),
        O.forEach(function (Q) {
          (L.types || (L.types = []),
            Q.namespace === void 0 && (Q.namespace = re(V) || ''),
            L.types.unshift(Q));
        }),
        Object.keys(V.messages || {}).forEach(function (Q) {
          if ((L.messages || (L.messages = {}), L.messages[Q]))
            throw new Error(z('duplicate message: %s', Q));
          L.messages[Q] = V.messages[Q];
        }));
    }
  }
  function ie(u) {
    var p;
    if (typeof u == 'string' && ~u.indexOf($.sep) && T.existsSync(u)) {
      var _ = T.readFileSync(u, { encoding: 'utf8' });
      try {
        return JSON.parse(_);
      } catch {
        var S = { importHook: T.createSyncImportHook() };
        B(u, S, function (K, L) {
          p = K ? _ : L;
        });
      }
    } else p = u;
    if (typeof p != 'string' || p === 'null') return p;
    try {
      return JSON.parse(p);
    } catch {
      try {
        return E.readProtocol(p);
      } catch {
        try {
          return E.readSchema(p);
        } catch {
          return p;
        }
      }
    }
  }
  function E(u, p) {
    ((p = p || {}),
      (this._tk = new Z(u)),
      (this._ackVoidMessages = !!p.ackVoidMessages),
      (this._implicitTags = !p.delimitedCollections),
      (this._typeRefs = p.typeRefs || J));
  }
  ((E.readProtocol = function (u, p) {
    var _ = new E(u, p),
      S = _._readProtocol();
    if (S.imports.length) throw new Error('unresolvable import');
    return S.protocol;
  }),
    (E.readSchema = function (u, p) {
      var _ = new E(u, p),
        S = _._readJavadoc(),
        q = _._readType(S === void 0 ? {} : { doc: S }, !0);
      return (_._tk.next({ id: '(eof)' }), q);
    }),
    (E.prototype._readProtocol = function () {
      var u = this._tk,
        p = [],
        _ = [],
        S = {},
        q;
      this._readImports(p);
      var K = {},
        L = this._readJavadoc();
      for (
        L !== void 0 && (K.doc = L),
          this._readAnnotations(K),
          u.next({ val: 'protocol' }),
          u.next({ val: '{', silent: !0 }) ||
            ((K.protocol = u.next({ id: 'name' }).val), u.next({ val: '{' }));
        !u.next({ val: '}', silent: !0 });
      )
        if (!this._readImports(p)) {
          var V = this._readJavadoc(),
            O = this._readType({}, !0),
            Q = this._readImports(p, !0),
            M = void 0;
          if (((q = u.pos), !Q && (M = this._readMessage(O)))) {
            V !== void 0 && M.schema.doc === void 0 && (M.schema.doc = V);
            var ee = !1;
            if (
              ((M.schema.response === 'void' || M.schema.response.type === 'void') &&
                ((ee = !this._ackVoidMessages && !M.schema.errors),
                M.schema.response === 'void'
                  ? (M.schema.response = 'null')
                  : (M.schema.response.type = 'null')),
              ee && (M.schema['one-way'] = !0),
              S[M.name])
            )
              throw new Error(z('duplicate message: %s', M.name));
            S[M.name] = M.schema;
          } else
            (V &&
              (typeof O == 'string' ? (O = { doc: V, type: O }) : O.doc === void 0 && (O.doc = V)),
              _.push(O),
              (u.pos = q),
              u.next({ val: ';', silent: !0 }));
          V = void 0;
        }
      return (
        u.next({ id: '(eof)' }),
        _.length && (K.types = _),
        Object.keys(S).length && (K.messages = S),
        { protocol: K, imports: p }
      );
    }),
    (E.prototype._readAnnotations = function (u) {
      for (var p = this._tk; p.next({ val: '@', silent: !0 }); ) {
        for (var _ = []; !p.next({ val: '(', silent: !0 }); ) _.push(p.next().val);
        ((u[_.join('')] = p.next({ id: 'json' }).val), p.next({ val: ')' }));
      }
    }),
    (E.prototype._readMessage = function (u) {
      var p = this._tk,
        _ = { request: [], response: u };
      this._readAnnotations(_);
      var S = p.next().val;
      if (p.next().val === '(') {
        if (!p.next({ val: ')', silent: !0 }))
          do _.request.push(this._readField());
          while (!p.next({ val: ')', silent: !0 }) && p.next({ val: ',' }));
        var q = p.next();
        switch (q.val) {
          case 'throws':
            _.errors = [];
            do _.errors.push(this._readType());
            while (!p.next({ val: ';', silent: !0 }) && p.next({ val: ',' }));
            break;
          case 'oneway':
            ((_['one-way'] = !0), p.next({ val: ';' }));
            break;
          case ';':
            break;
          default:
            throw p.error('invalid message suffix', q);
        }
        return { name: S, schema: _ };
      }
    }),
    (E.prototype._readJavadoc = function () {
      var u = this._tk.next({ id: 'javadoc', emitJavadoc: !0, silent: !0 });
      if (u) return u.val;
    }),
    (E.prototype._readField = function () {
      var u = this._tk,
        p = this._readJavadoc(),
        _ = { type: this._readType() };
      return (
        p !== void 0 && _.doc === void 0 && (_.doc = p),
        this._readAnnotations(_),
        (_.name = u.next({ id: 'name' }).val),
        u.next({ val: '=', silent: !0 }) && (_.default = u.next({ id: 'json' }).val),
        _
      );
    }),
    (E.prototype._readType = function (u, p) {
      switch (
        ((u = u || {}),
        this._readAnnotations(u),
        (u.type = this._tk.next({ id: 'name' }).val),
        u.type)
      ) {
        case 'record':
        case 'error':
          return this._readRecord(u);
        case 'fixed':
          return this._readFixed(u);
        case 'enum':
          return this._readEnum(u, p);
        case 'map':
          return this._readMap(u);
        case 'array':
          return this._readArray(u);
        case 'union':
          if (Object.keys(u).length > 1) throw new Error('union annotations are not supported');
          return this._readUnion();
        default:
          var _ = this._typeRefs[u.type];
          return (
            _ && (delete u.type, C.copyOwnProperties(_, u)),
            Object.keys(u).length > 1 ? u : u.type
          );
      }
    }),
    (E.prototype._readFixed = function (u) {
      var p = this._tk;
      return (
        p.next({ val: '(', silent: !0 }) ||
          ((u.name = p.next({ id: 'name' }).val), p.next({ val: '(' })),
        (u.size = parseInt(p.next({ id: 'number' }).val)),
        p.next({ val: ')' }),
        u
      );
    }),
    (E.prototype._readMap = function (u) {
      var p = this._tk,
        _ = this._implicitTags,
        S = p.next({ val: '<', silent: _ }) === void 0;
      return ((u.values = this._readType()), p.next({ val: '>', silent: S }), u);
    }),
    (E.prototype._readArray = function (u) {
      var p = this._tk,
        _ = this._implicitTags,
        S = p.next({ val: '<', silent: _ }) === void 0;
      return ((u.items = this._readType()), p.next({ val: '>', silent: S }), u);
    }),
    (E.prototype._readEnum = function (u, p) {
      var _ = this._tk;
      (_.next({ val: '{', silent: !0 }) ||
        ((u.name = _.next({ id: 'name' }).val), _.next({ val: '{' })),
        (u.symbols = []));
      do u.symbols.push(_.next().val);
      while (!_.next({ val: '}', silent: !0 }) && _.next({ val: ',' }));
      return (
        p && _.next({ val: '=', silent: !0 }) && ((u.default = _.next().val), _.next({ val: ';' })),
        u
      );
    }),
    (E.prototype._readUnion = function () {
      var u = this._tk,
        p = [];
      u.next({ val: '{' });
      do p.push(this._readType());
      while (!u.next({ val: '}', silent: !0 }) && u.next({ val: ',' }));
      return p;
    }),
    (E.prototype._readRecord = function (u) {
      var p = this._tk;
      for (
        p.next({ val: '{', silent: !0 }) ||
          ((u.name = p.next({ id: 'name' }).val), p.next({ val: '{' })),
          u.fields = [];
        !p.next({ val: '}', silent: !0 });
      )
        (u.fields.push(this._readField()), p.next({ val: ';' }));
      return u;
    }),
    (E.prototype._readImports = function (u, p) {
      for (var _ = this._tk, S = 0, q = _.pos; _.next({ val: 'import', silent: !0 }); ) {
        if (!S && p && _.next({ val: '(', silent: !0 })) {
          _.pos = q;
          return;
        }
        var K = _.next({ id: 'name' }).val,
          L = JSON.parse(_.next({ id: 'string' }).val);
        (_.next({ val: ';' }), u.push({ kind: K, name: L }), S++);
      }
      return S;
    }));
  function Z(u) {
    ((this._str = u), (this.pos = 0));
  }
  ((Z.prototype.next = function (u) {
    var p = { pos: this.pos, id: void 0, val: void 0 },
      _ = this._skip(u && u.emitJavadoc);
    if (typeof _ == 'string') ((p.id = 'javadoc'), (p.val = _));
    else {
      var S = this.pos,
        q = this._str,
        K = q.charAt(S);
      if (!K) p.id = '(eof)';
      else if (
        (u && u.id === 'json'
          ? ((p.id = 'json'), (this.pos = this._endOfJson()))
          : K === '"'
            ? ((p.id = 'string'), (this.pos = this._endOfString()))
            : /[0-9]/.test(K)
              ? ((p.id = 'number'), (this.pos = this._endOf(/[0-9]/)))
              : /[`A-Za-z_.]/.test(K)
                ? ((p.id = 'name'), (this.pos = this._endOf(/[`A-Za-z0-9_.]/)))
                : ((p.id = 'operator'), (this.pos = S + 1)),
        (p.val = q.slice(S, this.pos)),
        p.id === 'json')
      )
        try {
          p.val = JSON.parse(p.val);
        } catch {
          throw this.error('invalid JSON', p);
        }
      else p.id === 'name' && (p.val = p.val.replace(/`/g, ''));
    }
    var L;
    if (
      (u && u.id && u.id !== p.id
        ? (L = this.error(z('expected ID %s', u.id), p))
        : u && u.val && u.val !== p.val && (L = this.error(z('expected value %s', u.val), p)),
      L)
    )
      if (u && u.silent) {
        this.pos = p.pos;
        return;
      } else throw L;
    else return p;
  }),
    (Z.prototype.error = function (u, p) {
      var _ = typeof p != 'number',
        S = _ ? p.pos : p,
        q = this._str,
        K = 1,
        L = 0,
        V;
      for (V = 0; V < S; V++)
        q.charAt(V) ===
          `
` && (K++, (L = V));
      var O = _ ? z('invalid token %j: %s', p, u) : u,
        Q = new Error(O);
      return ((Q.token = _ ? p : void 0), (Q.lineNum = K), (Q.colNum = S - L), Q);
    }),
    (Z.prototype._skip = function (u) {
      for (var p = this._str, _ = !1, S, q; (q = p.charAt(this.pos)) && /\s/.test(q); ) this.pos++;
      if (((S = this.pos), q === '/'))
        switch (p.charAt(this.pos + 1)) {
          case '/':
            for (
              this.pos += 2;
              (q = p.charAt(this.pos)) &&
              q !==
                `
`;
            )
              this.pos++;
            return this._skip(u);
          case '*':
            for (
              this.pos += 2, p.charAt(this.pos) === '*' && (_ = !0);
              (q = p.charAt(this.pos++));
            )
              if (q === '*' && p.charAt(this.pos) === '/')
                return (this.pos++, _ && u ? W(p.slice(S + 3, this.pos - 2)) : this._skip(u));
            throw this.error('unterminated comment', S);
        }
    }),
    (Z.prototype._endOf = function (u) {
      for (var p = this.pos, _ = this._str; u.test(_.charAt(p)); ) p++;
      return p;
    }),
    (Z.prototype._endOfString = function () {
      for (var u = this.pos + 1, p = this._str, _; (_ = p.charAt(u)); ) {
        if (_ === '"') return u + 1;
        _ === '\\' ? (u += 2) : u++;
      }
      throw this.error('unterminated string', u - 1);
    }),
    (Z.prototype._endOfJson = function () {
      var u = C.jsonEnd(this._str, this.pos);
      if (u < 0) throw this.error('invalid JSON', u);
      return u;
    }));
  function W(u) {
    for (
      var p = u
        .replace(/^[ \t]+|[ \t]+$/g, '')
        .split(
          `
`,
        )
        .map(function (_, S) {
          return S ? _.replace(/^\s*\*\s?/, '') : _;
        });
      p.length && !p[0];
    )
      p.shift();
    for (; p.length && !p[p.length - 1]; ) p.pop();
    return p.join(`
`);
  }
  function re(u) {
    if (u.namespace) return u.namespace;
    var p = /^(.*)\.[^.]+$/.exec(u.protocol);
    return p ? p[1] : void 0;
  }
  return (
    (Ce = {
      Tokenizer: Z,
      assembleProtocol: B,
      read: ie,
      readProtocol: E.readProtocol,
      readSchema: E.readSchema,
    }),
    Ce
  );
}
var He;
function Ke() {
  return (
    He ||
      ((He = 1),
      (function (T) {
        var C = We(),
          $ = Ue(),
          R = Ge(),
          z = me();
        function J(B, ie) {
          var E = R.read(B);
          return E.protocol ? $.Service.forProtocol(E, ie) : C.Type.forSchema(E, ie);
        }
        ((T.exports = {
          Service: $.Service,
          assembleProtocol: R.assembleProtocol,
          discoverProtocol: $.discoverProtocol,
          parse: J,
          readProtocol: R.readProtocol,
          readSchema: R.readSchema,
        }),
          z.copyOwnProperties(C, T.exports));
      })(xe)),
    xe.exports
  );
}
var Pe, Ve;
function Qe() {
  if (Ve) return Pe;
  Ve = 1;
  var T = Ae(),
    C = me(),
    $ = require('buffer'),
    R = require('stream'),
    z = require('util'),
    J = require('zlib'),
    B = $.Buffer,
    ie = { namespace: 'org.apache.avro.file' },
    E = T.Type.forSchema('long', ie),
    Z = T.Type.forSchema({ type: 'map', values: 'bytes' }, ie),
    W = T.Type.forSchema(
      {
        name: 'Header',
        type: 'record',
        fields: [
          { name: 'magic', type: { type: 'fixed', name: 'Magic', size: 4 } },
          { name: 'meta', type: Z },
          { name: 'sync', type: { type: 'fixed', name: 'Sync', size: 16 } },
        ],
      },
      ie,
    ),
    re = T.Type.forSchema(
      {
        name: 'Block',
        type: 'record',
        fields: [
          { name: 'count', type: 'long' },
          { name: 'data', type: 'bytes' },
          { name: 'sync', type: 'Sync' },
        ],
      },
      ie,
    ),
    u = C.bufferFrom('Obj'),
    p = z.format,
    _ = C.Tap;
  function S(d, m) {
    m = m || {};
    var b = !!m.noDecode;
    (R.Duplex.call(this, { readableObjectMode: !b, allowHalfOpen: !1 }),
      (this._type = T.Type.forSchema(d)),
      (this._tap = new _(C.newBuffer(0))),
      (this._writeCb = null),
      (this._needPush = !1),
      (this._readValue = M(b, this._type)),
      (this._finished = !1),
      this.on('finish', function () {
        ((this._finished = !0), this._read());
      }));
  }
  (z.inherits(S, R.Duplex),
    (S.prototype._write = function (d, m, b) {
      this._writeCb = b;
      var v = this._tap;
      ((v.buf = B.concat([v.buf.slice(v.pos), d])),
        (v.pos = 0),
        this._needPush && ((this._needPush = !1), this._read()));
    }),
    (S.prototype._read = function () {
      this._needPush = !1;
      var d = this._tap,
        m = d.pos,
        b = this._readValue(d);
      d.isValid()
        ? this.push(b)
        : this._finished
          ? this.push(null)
          : ((d.pos = m), (this._needPush = !0), this._writeCb && this._writeCb());
    }));
  function q(d) {
    d = d || {};
    var m = !!d.noDecode;
    (R.Duplex.call(this, { allowHalfOpen: !0, readableObjectMode: !m }),
      (this._rType = d.readerSchema !== void 0 ? T.Type.forSchema(d.readerSchema) : void 0),
      (this._wType = null),
      (this._codecs = d.codecs),
      (this._codec = void 0),
      (this._parseHook = d.parseHook),
      (this._tap = new _(C.newBuffer(0))),
      (this._blockTap = new _(C.newBuffer(0))),
      (this._syncMarker = null),
      (this._readValue = null),
      (this._noDecode = m),
      (this._queue = new C.OrderedQueue()),
      (this._decompress = null),
      (this._index = 0),
      (this._remaining = void 0),
      (this._needPush = !1),
      (this._finished = !1),
      this.on('finish', function () {
        ((this._finished = !0), this._needPush && this._read());
      }));
  }
  (z.inherits(q, R.Duplex),
    (q.defaultCodecs = function () {
      return {
        null: function (d, m) {
          m(null, d);
        },
        deflate: J.inflateRaw,
      };
    }),
    (q.getDefaultCodecs = q.defaultCodecs),
    (q.prototype._decodeHeader = function () {
      var d = this._tap;
      if (d.buf.length < u.length) return !1;
      if (!u.equals(d.buf.slice(0, u.length)))
        return (this.emit('error', new Error('invalid magic bytes')), !1);
      var m = W._read(d);
      if (!d.isValid()) return !1;
      this._codec = (m.meta['avro.codec'] || 'null').toString();
      var b = this._codecs || q.getDefaultCodecs();
      if (((this._decompress = b[this._codec]), !this._decompress)) {
        this.emit('error', new Error(p('unknown codec: %s', this._codec)));
        return;
      }
      try {
        var v = JSON.parse(m.meta['avro.schema'].toString());
        (this._parseHook && (v = this._parseHook(v)), (this._wType = T.Type.forSchema(v)));
      } catch (D) {
        this.emit('error', D);
        return;
      }
      try {
        this._readValue = M(this._noDecode, this._wType, this._rType);
      } catch (D) {
        this.emit('error', D);
        return;
      }
      return ((this._syncMarker = m.sync), this.emit('metadata', this._wType, this._codec, m), !0);
    }),
    (q.prototype._write = function (d, m, b) {
      var v = this._tap;
      if (((v.buf = B.concat([v.buf, d])), (v.pos = 0), !this._decodeHeader())) {
        process.nextTick(b);
        return;
      }
      ((this._write = this._writeChunk), this._write(C.newBuffer(0), m, b));
    }),
    (q.prototype._writeChunk = function (d, m, b) {
      var v = this._tap;
      ((v.buf = B.concat([v.buf.slice(v.pos), d])), (v.pos = 0));
      for (var D = 1, w; (w = Q(v)); ) {
        if (!this._syncMarker.equals(w.sync)) {
          this.emit('error', new Error('invalid sync marker'));
          return;
        }
        (D++, this._decompress(w.data, this._createBlockCallback(w.data.length, w.count, Y)));
      }
      Y();
      function Y() {
        --D || b();
      }
    }),
    (q.prototype._createBlockCallback = function (d, m, b) {
      var v = this,
        D = this._index++;
      return function (w, Y) {
        if (w) {
          var f = new Error(p('%s codec decompression error', v._codec));
          ((f.cause = w), v.emit('error', f), b());
        } else
          (v.emit('block', new V(m, Y.length, d)),
            v._queue.push(new O(D, Y, b, m)),
            v._needPush && v._read());
      };
    }),
    (q.prototype._read = function () {
      this._needPush = !1;
      var d = this._blockTap;
      if (!this._remaining) {
        var m = this._queue.pop();
        if (!m || !m.count) {
          (this._finished ? this.push(null) : (this._needPush = !0), m && m.cb());
          return;
        }
        (m.cb(), (this._remaining = m.count), (d.buf = m.buf), (d.pos = 0));
      }
      this._remaining--;
      var b;
      try {
        if (((b = this._readValue(d)), !d.isValid())) throw new Error('truncated block');
      } catch (v) {
        ((this._remaining = 0), this.emit('error', v));
        return;
      }
      this.push(b);
    }));
  function K(d, m) {
    ((m = m || {}),
      R.Transform.call(this, { writableObjectMode: !0, allowHalfOpen: !1 }),
      (this._type = T.Type.forSchema(d)),
      (this._writeValue = function (b, v) {
        try {
          this._type._write(b, v);
        } catch (D) {
          this.emit('typeError', D, v, this._type);
        }
      }),
      (this._tap = new _(C.newBuffer(m.batchSize || 65536))),
      this.on('typeError', function (b) {
        this.emit('error', b);
      }));
  }
  (z.inherits(K, R.Transform),
    (K.prototype._transform = function (d, m, b) {
      var v = this._tap,
        D = v.buf,
        w = v.pos;
      if ((this._writeValue(v, d), !v.isValid())) {
        w && this.push(ee(v.buf, 0, w));
        var Y = v.pos - w;
        (Y > D.length && (v.buf = C.newBuffer(2 * Y)), (v.pos = 0), this._writeValue(v, d));
      }
      b();
    }),
    (K.prototype._flush = function (d) {
      var m = this._tap,
        b = m.pos;
      (b && this.push(m.buf.slice(0, b)), d());
    }));
  function L(d, m) {
    ((m = m || {}), R.Duplex.call(this, { allowHalfOpen: !0, writableObjectMode: !0 }));
    var b;
    if (
      (T.Type.isType(d) ? ((b = d), (d = void 0)) : (b = T.Type.forSchema(d)),
      (this._schema = d),
      (this._type = b),
      (this._writeValue = function (D, w) {
        try {
          this._type._write(D, w);
        } catch (Y) {
          return (this.emit('typeError', Y, w, this._type), !1);
        }
        return !0;
      }),
      (this._blockSize = m.blockSize || 65536),
      (this._tap = new _(C.newBuffer(this._blockSize))),
      (this._codecs = m.codecs),
      (this._codec = m.codec || 'null'),
      (this._blockCount = 0),
      (this._syncMarker = m.syncMarker || new C.Lcg().nextBuffer(16)),
      (this._queue = new C.OrderedQueue()),
      (this._pending = 0),
      (this._finished = !1),
      (this._needHeader = !1),
      (this._needPush = !1),
      (this._metadata = m.metadata || {}),
      !Z.isValid(this._metadata))
    )
      throw new Error('invalid metadata');
    var v = this._codec;
    if (((this._compress = (this._codecs || L.getDefaultCodecs())[v]), !this._compress))
      throw new Error(p('unsupported codec: %s', v));
    switch (
      (m.omitHeader !== void 0 && (m.writeHeader = m.omitHeader ? 'never' : 'auto'), m.writeHeader)
    ) {
      case !1:
      case 'never':
        break;
      case void 0:
      case 'auto':
        this._needHeader = !0;
        break;
      default:
        this._writeHeader();
    }
    (this.on('finish', function () {
      ((this._finished = !0),
        this._blockCount
          ? this._flushChunk()
          : this._finished && this._needPush && this.push(null));
    }),
      this.on('typeError', function (D) {
        this.emit('error', D);
      }));
  }
  (z.inherits(L, R.Duplex),
    (L.defaultCodecs = function () {
      return {
        null: function (d, m) {
          m(null, d);
        },
        deflate: J.deflateRaw,
      };
    }),
    (L.getDefaultCodecs = L.defaultCodecs),
    (L.prototype._writeHeader = function () {
      var d = JSON.stringify(
          this._schema ? this._schema : this._type.getSchema({ exportAttrs: !0 }),
        ),
        m = C.copyOwnProperties(
          this._metadata,
          { 'avro.schema': C.bufferFrom(d), 'avro.codec': C.bufferFrom(this._codec) },
          !0,
        ),
        b = W.getRecordConstructor(),
        v = new b(u, m, this._syncMarker);
      this.push(v.toBuffer());
    }),
    (L.prototype._write = function (d, m, b) {
      this._needHeader && (this._writeHeader(), (this._needHeader = !1));
      var v = this._tap,
        D = v.pos,
        w = !1;
      if (this._writeValue(v, d)) {
        if (!v.isValid()) {
          D && (this._flushChunk(D, b), (w = !0));
          var Y = v.pos - D;
          (Y > this._blockSize && (this._blockSize = Y * 2),
            (v.buf = C.newBuffer(this._blockSize)),
            (v.pos = 0),
            this._writeValue(v, d));
        }
        this._blockCount++;
      } else v.pos = D;
      w || b();
    }),
    (L.prototype._flushChunk = function (d, m) {
      var b = this._tap;
      ((d = d || b.pos),
        this._compress(b.buf.slice(0, d), this._createBlockCallback(d, m)),
        (this._blockCount = 0));
    }),
    (L.prototype._read = function () {
      var d = this,
        m = this._queue.pop();
      if (!m) {
        this._finished && !this._pending
          ? process.nextTick(function () {
              d.push(null);
            })
          : (this._needPush = !0);
        return;
      }
      (this.push(E.toBuffer(m.count, !0)),
        this.push(E.toBuffer(m.buf.length, !0)),
        this.push(m.buf),
        this.push(this._syncMarker),
        this._finished || m.cb());
    }),
    (L.prototype._createBlockCallback = function (d, m) {
      var b = this,
        v = this._index++,
        D = this._blockCount;
      return (
        this._pending++,
        function (w, Y) {
          if (w) {
            var f = new Error(p('%s codec compression error', b._codec));
            ((f.cause = w), b.emit('error', f));
            return;
          }
          (b._pending--,
            b.emit('block', new V(D, d, Y.length)),
            b._queue.push(new O(v, Y, m, D)),
            b._needPush && ((b._needPush = !1), b._read()));
        }
      );
    }));
  function V(d, m, b) {
    ((this.valueCount = d), (this.rawDataLength = m), (this.compressedDataLength = b));
  }
  function O(d, m, b, v) {
    ((this.index = d), (this.buf = m), (this.cb = b), (this.count = v | 0));
  }
  function Q(d) {
    var m = d.pos,
      b = re._read(d);
    return d.isValid() ? b : ((d.pos = m), null);
  }
  function M(d, m, b) {
    if (d)
      return (function (D) {
        return function (w) {
          var Y = w.pos;
          return (D(w), w.buf.slice(Y, w.pos));
        };
      })(m._skip);
    if (b) {
      var v = b.createResolver(m);
      return function (D) {
        return v._read(D);
      };
    } else
      return function (D) {
        return m._read(D);
      };
  }
  function ee(d, m, b) {
    var v = C.newBuffer(b);
    return (d.copy(v, 0, m, m + b), v);
  }
  return (
    (Pe = {
      BLOCK_TYPE: re,
      HEADER_TYPE: W,
      MAGIC_BYTES: u,
      streams: { BlockDecoder: q, BlockEncoder: L, RawDecoder: S, RawEncoder: K },
    }),
    Pe
  );
}
var De;
function Ze() {
  return (
    De ||
      ((De = 1),
      (function (T) {
        var C = Ke(),
          $ = Qe(),
          R = me(),
          z = require('stream'),
          J = require('util');
        function B(W, re) {
          (z.Readable.call(this),
            (re = re || {}),
            (this._batchSize = re.batchSize || 65536),
            (this._blob = W),
            (this._pos = 0));
        }
        (J.inherits(B, z.Readable),
          (B.prototype._read = function () {
            var W = this._pos;
            if (W >= this._blob.size) {
              this.push(null);
              return;
            }
            this._pos += this._batchSize;
            var re = this._blob.slice(W, this._pos, this._blob.type),
              u = new FileReader(),
              p = this;
            (u.addEventListener(
              'loadend',
              function _(S) {
                (u.removeEventListener('loadend', _, !1),
                  S.error ? p.emit('error', S.error) : p.push(R.bufferFrom(u.result)));
              },
              !1,
            ),
              u.readAsArrayBuffer(re));
          }));
        function ie() {
          (z.Transform.call(this, { readableObjectMode: !0 }), (this._bufs = []));
        }
        (J.inherits(ie, z.Transform),
          (ie.prototype._transform = function (W, re, u) {
            (this._bufs.push(W), u());
          }),
          (ie.prototype._flush = function (W) {
            (this.push(new Blob(this._bufs, { type: 'application/octet-binary' })), W());
          }));
        function E(W, re) {
          return new B(W).pipe(new $.streams.BlockDecoder(re));
        }
        function Z(W, re) {
          var u = new $.streams.BlockEncoder(W, re),
            p = new ie();
          return (
            u.pipe(p),
            new z.Duplex({
              objectMode: !0,
              read: function () {
                var _ = p.read();
                _ ? q(_) : p.once('readable', q);
                var S = this;
                function q(K) {
                  (S.push(K || p.read()), S.push(null));
                }
              },
              write: function (_, S, q) {
                return u.write(_, S, q);
              },
            }).on('finish', function () {
              u.end();
            })
          );
        }
        ((T.exports = { createBlobDecoder: E, createBlobEncoder: Z, streams: $.streams }),
          R.copyOwnProperties(C, T.exports));
      })(Te)),
    Te.exports
  );
}
var Me = Ze();
const Xe = $e(Me),
  tt = Je({ __proto__: null, default: Xe }, [Me]);
export { tt as a };
