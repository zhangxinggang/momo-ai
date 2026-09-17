import './icons-B5Lu0sqU.js';
import { aQ as Ae, ad as Be, b5 as Re, aO as ze } from './index-C2avURFS.js';
import './markdown-it-vendor-DL4wSELR.js';
import './markdown-vendor-DldLOD9R.js';
import './ui-vendor-C-FKu2uc.js';
var F;
(function (i) {
  ((i.INSERT = 'insert'), (i.DELETE = 'delete'), (i.CONTEXT = 'context'));
})(F || (F = {}));
const We = { LINE_BY_LINE: 'line-by-line' },
  je = { NONE: 'none' },
  $e = { WORD: 'word' };
var ee;
(function (i) {
  ((i.AUTO = 'auto'), (i.DARK = 'dark'), (i.LIGHT = 'light'));
})(ee || (ee = {}));
const Ue = ['-', '[', ']', '/', '{', '}', '(', ')', '*', '+', '?', '.', '\\', '^', '$', '|'],
  Ge = RegExp('[' + Ue.join('\\') + ']', 'g');
function Ve(i) {
  return i.replace(Ge, '\\$&');
}
function ye(i) {
  return i && i.replace(/\\/g, '/');
}
function _e(i) {
  let n,
    t,
    e,
    r = 0;
  for (n = 0, e = i.length; n < e; n++) ((t = i.charCodeAt(n)), (r = (r << 5) - r + t), (r |= 0));
  return r;
}
function Ie(i) {
  const n = i.length;
  let t = -1 / 0;
  for (let e = 0; e < n; e++) t = Math.max(t, i[e]);
  return t;
}
function xe(i, n) {
  const t = i.split('.');
  return t.length > 1 ? t[t.length - 1] : n;
}
function Te(i, n) {
  return n.reduce((t, e) => t || i.startsWith(e), !1);
}
const Ne = ['a/', 'b/', 'i/', 'w/', 'c/', 'o/'];
function X(i, n, t) {
  const e = t !== void 0 ? [...Ne, t] : Ne,
    r = n ? new RegExp(`^${Ve(n)} "?(.+?)"?$`) : new RegExp('^"?(.+?)"?$'),
    [, l = ''] = r.exec(i) || [],
    s = e.find((f) => l.indexOf(f) === 0);
  return (s ? l.slice(s.length) : l).replace(
    /\s+\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(?:\.\d+)? [+-]\d{4}.*$/,
    '',
  );
}
function Xe(i, n) {
  return X(i, '---', n);
}
function qe(i, n) {
  return X(i, '+++', n);
}
function Ze(i, n = {}) {
  const t = [];
  let e = null,
    r = null,
    l = null,
    s = null,
    d = null,
    f = null,
    h = null;
  const b = '--- ',
    x = '+++ ',
    E = '@@',
    o = /^old mode (\d{6})/,
    c = /^new mode (\d{6})/,
    w = /^deleted file mode (\d{6})/,
    p = /^new file mode (\d{6})/,
    y = /^copy from "?(.+)"?/,
    C = /^copy to "?(.+)"?/,
    T = /^rename from "?(.+)"?/,
    M = /^rename to "?(.+)"?/,
    S = /^similarity index (\d+)%/,
    I = /^dissimilarity index (\d+)%/,
    q = /^index ([\da-z]+)\.\.([\da-z]+)\s*(\d{6})?/,
    a = /^Binary files (.*) and (.*) differ/,
    u = /^GIT binary patch/,
    g = /^index ([\da-z]+),([\da-z]+)\.\.([\da-z]+)/,
    N = /^mode (\d{6}),(\d{6})\.\.(\d{6})/,
    k = /^new file mode (\d{6})/,
    R = /^deleted file mode (\d{6}),(\d{6})/,
    A = i.replace(/\\ No newline at end of file/g, '').replace(
      /\r\n?/g,
      `
`,
    ).split(`
`);
  function P() {
    r !== null && e !== null && (e.blocks.push(r), (r = null));
  }
  function _() {
    (e !== null &&
      (!e.oldName && f !== null && (e.oldName = f),
      !e.newName && h !== null && (e.newName = h),
      e.newName && (t.push(e), (e = null))),
      (f = null),
      (h = null));
  }
  function Z() {
    (P(), _(), (e = { blocks: [], deletedLines: 0, addedLines: 0 }));
  }
  function B(m) {
    P();
    let L;
    (e !== null &&
      ((L = /^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@.*/.exec(m))
        ? ((e.isCombined = !1), (l = parseInt(L[1], 10)), (d = parseInt(L[2], 10)))
        : (L = /^@@@ -(\d+)(?:,\d+)? -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@@.*/.exec(m))
          ? ((e.isCombined = !0),
            (l = parseInt(L[1], 10)),
            (s = parseInt(L[2], 10)),
            (d = parseInt(L[3], 10)))
          : (m.startsWith(E) && console.error('Failed to parse lines, starting in 0!'),
            (l = 0),
            (d = 0),
            (e.isCombined = !1))),
      (r = { lines: [], oldStartLine: l, oldStartLine2: s, newStartLine: d, header: m }));
  }
  function H(m) {
    if (e === null || r === null || l === null || d === null) return;
    const L = { content: m },
      v = e.isCombined ? ['+ ', ' +', '++'] : ['+'],
      W = e.isCombined ? ['- ', ' -', '--'] : ['-'];
    (Te(m, v)
      ? (e.addedLines++, (L.type = F.INSERT), (L.oldNumber = void 0), (L.newNumber = d++))
      : Te(m, W)
        ? (e.deletedLines++, (L.type = F.DELETE), (L.oldNumber = l++), (L.newNumber = void 0))
        : ((L.type = F.CONTEXT), (L.oldNumber = l++), (L.newNumber = d++)),
      r.lines.push(L));
  }
  function K(m, L) {
    let v = L;
    for (; v < A.length - 3; ) {
      if (m.startsWith('diff')) return !1;
      if (A[v].startsWith(b) && A[v + 1].startsWith(x) && A[v + 2].startsWith(E)) return !0;
      v++;
    }
    return !1;
  }
  return (
    A.forEach((m, L) => {
      if (!m || m.startsWith('*')) return;
      let v;
      const W = A[L - 1],
        ne = A[L + 1],
        ce = A[L + 2];
      if (m.startsWith('diff --git') || m.startsWith('diff --combined')) {
        if (
          (Z(),
          (v = /^diff --git "?([a-ciow]\/.+)"? "?([a-ciow]\/.+)"?/.exec(m)) &&
            ((f = X(v[1], void 0, n.dstPrefix)), (h = X(v[2], void 0, n.srcPrefix))),
          e === null)
        )
          throw new Error('Where is my file !!!');
        e.isGitDiff = !0;
        return;
      }
      if (m.startsWith('Binary files') && !e?.isGitDiff) {
        if (
          (Z(),
          (v = /^Binary files "?([a-ciow]\/.+)"? and "?([a-ciow]\/.+)"? differ/.exec(m)) &&
            ((f = X(v[1], void 0, n.dstPrefix)), (h = X(v[2], void 0, n.srcPrefix))),
          e === null)
        )
          throw new Error('Where is my file !!!');
        e.isBinary = !0;
        return;
      }
      if (
        ((!e || (!e.isGitDiff && e && m.startsWith(b) && ne.startsWith(x) && ce.startsWith(E))) &&
          Z(),
        e?.isTooBig)
      )
        return;
      if (
        e &&
        ((typeof n.diffMaxChanges == 'number' &&
          e.addedLines + e.deletedLines > n.diffMaxChanges) ||
          (typeof n.diffMaxLineLength == 'number' && m.length > n.diffMaxLineLength))
      ) {
        ((e.isTooBig = !0), (e.addedLines = 0), (e.deletedLines = 0), (e.blocks = []), (r = null));
        const ie =
          typeof n.diffTooBigMessage == 'function'
            ? n.diffTooBigMessage(t.length)
            : 'Diff too big to be displayed';
        B(ie);
        return;
      }
      if ((m.startsWith(b) && ne.startsWith(x)) || (m.startsWith(x) && W.startsWith(b))) {
        if (e && !e.oldName && m.startsWith('--- ') && (v = Xe(m, n.srcPrefix))) {
          ((e.oldName = v), (e.language = xe(e.oldName, e.language)));
          return;
        }
        if (e && !e.newName && m.startsWith('+++ ') && (v = qe(m, n.dstPrefix))) {
          ((e.newName = v), (e.language = xe(e.newName, e.language)));
          return;
        }
      }
      if (e && (m.startsWith(E) || (e.isGitDiff && e.oldName && e.newName && !r))) {
        B(m);
        return;
      }
      if (r && (m.startsWith('+') || m.startsWith('-') || m.startsWith(' '))) {
        H(m);
        return;
      }
      const J = !K(m, L);
      if (e === null) throw new Error('Where is my file !!!');
      (v = o.exec(m))
        ? (e.oldMode = v[1])
        : (v = c.exec(m))
          ? (e.newMode = v[1])
          : (v = w.exec(m))
            ? ((e.deletedFileMode = v[1]), (e.isDeleted = !0))
            : (v = p.exec(m))
              ? ((e.newFileMode = v[1]), (e.isNew = !0))
              : (v = y.exec(m))
                ? (J && (e.oldName = v[1]), (e.isCopy = !0))
                : (v = C.exec(m))
                  ? (J && (e.newName = v[1]), (e.isCopy = !0))
                  : (v = T.exec(m))
                    ? (J && (e.oldName = v[1]), (e.isRename = !0))
                    : (v = M.exec(m))
                      ? (J && (e.newName = v[1]), (e.isRename = !0))
                      : (v = a.exec(m))
                        ? ((e.isBinary = !0),
                          (e.oldName = X(v[1], void 0, n.srcPrefix)),
                          (e.newName = X(v[2], void 0, n.dstPrefix)),
                          B('Binary file'))
                        : u.test(m)
                          ? ((e.isBinary = !0), B(m))
                          : (v = S.exec(m))
                            ? (e.unchangedPercentage = parseInt(v[1], 10))
                            : (v = I.exec(m))
                              ? (e.changedPercentage = parseInt(v[1], 10))
                              : (v = q.exec(m))
                                ? ((e.checksumBefore = v[1]),
                                  (e.checksumAfter = v[2]),
                                  v[3] && (e.mode = v[3]))
                                : (v = g.exec(m))
                                  ? ((e.checksumBefore = [v[2], v[3]]), (e.checksumAfter = v[1]))
                                  : (v = N.exec(m))
                                    ? ((e.oldMode = [v[2], v[3]]), (e.newMode = v[1]))
                                    : (v = k.exec(m))
                                      ? ((e.newFileMode = v[1]), (e.isNew = !0))
                                      : (v = R.exec(m)) &&
                                        ((e.deletedFileMode = v[1]), (e.isDeleted = !0));
    }),
    P(),
    _(),
    t
  );
}
class De {
  diff(n, t, e = {}) {
    let r;
    typeof e == 'function' ? ((r = e), (e = {})) : 'callback' in e && (r = e.callback);
    const l = this.castInput(n, e),
      s = this.castInput(t, e),
      d = this.removeEmpty(this.tokenize(l, e)),
      f = this.removeEmpty(this.tokenize(s, e));
    return this.diffWithOptionsObj(d, f, e, r);
  }
  diffWithOptionsObj(n, t, e, r) {
    var l;
    const s = (C) => {
        if (((C = this.postProcess(C, e)), r)) {
          setTimeout(function () {
            r(C);
          }, 0);
          return;
        } else return C;
      },
      d = t.length,
      f = n.length;
    let h = 1,
      b = d + f;
    e.maxEditLength != null && (b = Math.min(b, e.maxEditLength));
    const x = (l = e.timeout) !== null && l !== void 0 ? l : 1 / 0,
      E = Date.now() + x,
      o = [{ oldPos: -1, lastComponent: void 0 }];
    let c = this.extractCommon(o[0], t, n, 0, e);
    if (o[0].oldPos + 1 >= f && c + 1 >= d) return s(this.buildValues(o[0].lastComponent, t, n));
    let w = -1 / 0,
      p = 1 / 0;
    const y = () => {
      for (let C = Math.max(w, -h); C <= Math.min(p, h); C += 2) {
        let T;
        const M = o[C - 1],
          S = o[C + 1];
        M && (o[C - 1] = void 0);
        let I = !1;
        if (S) {
          const a = S.oldPos - C;
          I = S && 0 <= a && a < d;
        }
        const q = M && M.oldPos + 1 < f;
        if (!I && !q) {
          o[C] = void 0;
          continue;
        }
        if (
          (!q || (I && M.oldPos < S.oldPos)
            ? (T = this.addToPath(S, !0, !1, 0, e))
            : (T = this.addToPath(M, !1, !0, 1, e)),
          (c = this.extractCommon(T, t, n, C, e)),
          T.oldPos + 1 >= f && c + 1 >= d)
        )
          return s(this.buildValues(T.lastComponent, t, n)) || !0;
        ((o[C] = T),
          T.oldPos + 1 >= f && (p = Math.min(p, C - 1)),
          c + 1 >= d && (w = Math.max(w, C + 1)));
      }
      h++;
    };
    if (r)
      (function C() {
        setTimeout(function () {
          if (h > b || Date.now() > E) return r(void 0);
          y() || C();
        }, 0);
      })();
    else
      for (; h <= b && Date.now() <= E; ) {
        const C = y();
        if (C) return C;
      }
  }
  addToPath(n, t, e, r, l) {
    const s = n.lastComponent;
    return s && !l.oneChangePerToken && s.added === t && s.removed === e
      ? {
          oldPos: n.oldPos + r,
          lastComponent: {
            count: s.count + 1,
            added: t,
            removed: e,
            previousComponent: s.previousComponent,
          },
        }
      : {
          oldPos: n.oldPos + r,
          lastComponent: { count: 1, added: t, removed: e, previousComponent: s },
        };
  }
  extractCommon(n, t, e, r, l) {
    const s = t.length,
      d = e.length;
    let f = n.oldPos,
      h = f - r,
      b = 0;
    for (; h + 1 < s && f + 1 < d && this.equals(e[f + 1], t[h + 1], l); )
      (h++,
        f++,
        b++,
        l.oneChangePerToken &&
          (n.lastComponent = {
            count: 1,
            previousComponent: n.lastComponent,
            added: !1,
            removed: !1,
          }));
    return (
      b &&
        !l.oneChangePerToken &&
        (n.lastComponent = {
          count: b,
          previousComponent: n.lastComponent,
          added: !1,
          removed: !1,
        }),
      (n.oldPos = f),
      h
    );
  }
  equals(n, t, e) {
    return e.comparator
      ? e.comparator(n, t)
      : n === t || (!!e.ignoreCase && n.toLowerCase() === t.toLowerCase());
  }
  removeEmpty(n) {
    const t = [];
    for (let e = 0; e < n.length; e++) n[e] && t.push(n[e]);
    return t;
  }
  castInput(n, t) {
    return n;
  }
  tokenize(n, t) {
    return Array.from(n);
  }
  join(n) {
    return n.join('');
  }
  postProcess(n, t) {
    return n;
  }
  get useLongestToken() {
    return !1;
  }
  buildValues(n, t, e) {
    const r = [];
    let l;
    for (; n; ) (r.push(n), (l = n.previousComponent), delete n.previousComponent, (n = l));
    r.reverse();
    const s = r.length;
    let d = 0,
      f = 0,
      h = 0;
    for (; d < s; d++) {
      const b = r[d];
      if (b.removed) ((b.value = this.join(e.slice(h, h + b.count))), (h += b.count));
      else {
        if (!b.added && this.useLongestToken) {
          let x = t.slice(f, f + b.count);
          ((x = x.map(function (E, o) {
            const c = e[h + o];
            return c.length > E.length ? c : E;
          })),
            (b.value = this.join(x)));
        } else b.value = this.join(t.slice(f, f + b.count));
        ((f += b.count), b.added || (h += b.count));
      }
    }
    return r;
  }
}
class Ke extends De {}
const Je = new Ke();
function Qe(i, n, t) {
  return Je.diff(i, n, t);
}
const Ce =
  'a-zA-Z0-9_\\u{AD}\\u{C0}-\\u{D6}\\u{D8}-\\u{F6}\\u{F8}-\\u{2C6}\\u{2C8}-\\u{2D7}\\u{2DE}-\\u{2FF}\\u{1E00}-\\u{1EFF}';
class Ye extends De {
  tokenize(n) {
    const t = new RegExp(`(\\r?\\n)|[${Ce}]+|[^\\S\\n\\r]+|[^${Ce}]`, 'ug');
    return n.match(t) || [];
  }
}
const et = new Ye();
function tt(i, n, t) {
  return et.diff(i, n, t);
}
function nt(i, n) {
  if (i.length === 0) return n.length;
  if (n.length === 0) return i.length;
  const t = [];
  let e;
  for (e = 0; e <= n.length; e++) t[e] = [e];
  let r;
  for (r = 0; r <= i.length; r++) t[0][r] = r;
  for (e = 1; e <= n.length; e++)
    for (r = 1; r <= i.length; r++)
      n.charAt(e - 1) === i.charAt(r - 1)
        ? (t[e][r] = t[e - 1][r - 1])
        : (t[e][r] = Math.min(t[e - 1][r - 1] + 1, Math.min(t[e][r - 1] + 1, t[e - 1][r] + 1)));
  return t[n.length][i.length];
}
function be(i) {
  return (n, t) => {
    const e = i(n).trim(),
      r = i(t).trim();
    return nt(e, r) / (e.length + r.length);
  };
}
function me(i) {
  function n(e, r, l = new Map()) {
    let s = 1 / 0,
      d;
    for (let f = 0; f < e.length; ++f)
      for (let h = 0; h < r.length; ++h) {
        const b = JSON.stringify([e[f], r[h]]);
        let x;
        ((l.has(b) && (x = l.get(b))) || ((x = i(e[f], r[h])), l.set(b, x)),
          x < s && ((s = x), (d = { indexA: f, indexB: h, score: s })));
      }
    return d;
  }
  function t(e, r, l = 0, s = new Map()) {
    const d = n(e, r, s);
    if (!d || e.length + r.length < 3) return [[e, r]];
    const f = e.slice(0, d.indexA),
      h = r.slice(0, d.indexB),
      b = [e[d.indexA]],
      x = [r[d.indexB]],
      E = d.indexA + 1,
      o = d.indexB + 1,
      c = e.slice(E),
      w = r.slice(o),
      p = t(f, h, l + 1, s),
      y = t(b, x, l + 1, s),
      C = t(c, w, l + 1, s);
    let T = y;
    return (
      (d.indexA > 0 || d.indexB > 0) && (T = p.concat(T)),
      (e.length > E || r.length > o) && (T = T.concat(C)),
      T
    );
  }
  return t;
}
const z = {
    INSERTS: 'd2h-ins',
    DELETES: 'd2h-del',
    CONTEXT: 'd2h-cntx',
    INFO: 'd2h-info',
    INSERT_CHANGES: 'd2h-ins d2h-change',
    DELETE_CHANGES: 'd2h-del d2h-change',
  },
  oe = {
    matching: je.NONE,
    matchWordsThreshold: 0.25,
    maxLineLengthHighlight: 1e4,
    diffStyle: $e.WORD,
    colorScheme: ee.LIGHT,
  },
  $ = '/',
  Fe = be((i) => i.value),
  it = me(Fe);
function fe(i) {
  return i.indexOf('dev/null') !== -1;
}
function rt(i) {
  return i.replace(/(<ins[^>]*>((.|\n)*?)<\/ins>)/g, '');
}
function st(i) {
  return i.replace(/(<del[^>]*>((.|\n)*?)<\/del>)/g, '');
}
function ae(i) {
  switch (i) {
    case F.CONTEXT:
      return z.CONTEXT;
    case F.INSERT:
      return z.INSERTS;
    case F.DELETE:
      return z.DELETES;
  }
}
function ge(i) {
  switch (i) {
    case ee.DARK:
      return 'd2h-dark-color-scheme';
    case ee.AUTO:
      return 'd2h-auto-color-scheme';
    case ee.LIGHT:
    default:
      return 'd2h-light-color-scheme';
  }
}
function at(i) {
  return i ? 2 : 1;
}
function te(i) {
  return i
    .slice(0)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}
function U(i, n, t = !0) {
  const e = at(n);
  return { prefix: i.substring(0, e), content: t ? te(i.substring(e)) : i.substring(e) };
}
function le(i) {
  const n = ye(i.oldName),
    t = ye(i.newName);
  if (n !== t && !fe(n) && !fe(t)) {
    const e = [],
      r = [],
      l = n.split($),
      s = t.split($),
      d = l.length,
      f = s.length;
    let h = 0,
      b = d - 1,
      x = f - 1;
    for (; h < b && h < x && l[h] === s[h]; ) (e.push(s[h]), (h += 1));
    for (; b > h && x > h && l[b] === s[x]; ) (r.unshift(s[x]), (b -= 1), (x -= 1));
    const E = e.join($),
      o = r.join($),
      c = l.slice(h, b + 1).join($),
      w = s.slice(h, x + 1).join($);
    return E.length && o.length
      ? E + $ + '{' + c + ' → ' + w + '}' + $ + o
      : E.length
        ? E + $ + '{' + c + ' → ' + w + '}'
        : o.length
          ? '{' + c + ' → ' + w + '}' + $ + o
          : n + ' → ' + t;
  } else return fe(t) ? n : t;
}
function ve(i) {
  return `d2h-${_e(le(i)).toString().slice(-6)}`;
}
function we(i) {
  let n = 'file-changed';
  return (
    i.isRename || i.isCopy
      ? (n = 'file-renamed')
      : i.isNew
        ? (n = 'file-added')
        : i.isDeleted
          ? (n = 'file-deleted')
          : i.newName !== i.oldName && (n = 'file-renamed'),
    n
  );
}
function Oe(i, n, t, e = {}) {
  const {
      matching: r,
      maxLineLengthHighlight: l,
      matchWordsThreshold: s,
      diffStyle: d,
    } = Object.assign(Object.assign({}, oe), e),
    f = U(i, t, !1),
    h = U(n, t, !1);
  if (f.content.length > l || h.content.length > l)
    return {
      oldLine: { prefix: f.prefix, content: te(f.content) },
      newLine: { prefix: h.prefix, content: te(h.content) },
    };
  const b = d === 'char' ? Qe(f.content, h.content) : tt(f.content, h.content),
    x = [];
  if (d === 'word' && r === 'words') {
    const o = b.filter((p) => p.removed),
      c = b.filter((p) => p.added);
    it(c, o).forEach((p) => {
      p[0].length === 1 &&
        p[1].length === 1 &&
        Fe(p[0][0], p[1][0]) < s &&
        (x.push(p[0][0]), x.push(p[1][0]));
    });
  }
  const E = b.reduce((o, c) => {
    const w = c.added ? 'ins' : c.removed ? 'del' : null,
      p = x.indexOf(c) > -1 ? ' class="d2h-change"' : '',
      y = te(c.value);
    return w !== null ? `${o}<${w}${p}>${y}</${w}>` : `${o}${y}`;
  }, '');
  return {
    oldLine: { prefix: f.prefix, content: rt(E) },
    newLine: { prefix: h.prefix, content: st(E) },
  };
}
const Ee = 'file-summary',
  ot = 'icon',
  lt = { colorScheme: oe.colorScheme };
class ct {
  constructor(n, t = {}) {
    ((this.hoganUtils = n), (this.config = Object.assign(Object.assign({}, lt), t)));
  }
  render(n) {
    const t = n.map((e) =>
      this.hoganUtils.render(
        Ee,
        'line',
        {
          fileHtmlId: ve(e),
          oldName: e.oldName,
          newName: e.newName,
          fileName: le(e),
          deletedLines: '-' + e.deletedLines,
          addedLines: '+' + e.addedLines,
        },
        { fileIcon: this.hoganUtils.template(ot, we(e)) },
      ),
    ).join(`
`);
    return this.hoganUtils.render(Ee, 'wrapper', {
      colorScheme: ge(this.config.colorScheme),
      filesNumber: n.length,
      files: t,
    });
  }
}
const ke = Object.assign(Object.assign({}, oe), {
    renderNothingWhenEmpty: !1,
    matchingMaxComparisons: 2500,
    maxLineSizeInBlockForComparison: 200,
  }),
  re = 'generic',
  Se = 'line-by-line',
  dt = 'icon',
  ft = 'tag';
class ht {
  constructor(n, t = {}) {
    ((this.hoganUtils = n), (this.config = Object.assign(Object.assign({}, ke), t)));
  }
  render(n) {
    const t = n.map((e) => {
      let r;
      return (
        e.blocks.length ? (r = this.generateFileHtml(e)) : (r = this.generateEmptyDiff()),
        this.makeFileDiffHtml(e, r)
      );
    }).join(`
`);
    return this.hoganUtils.render(re, 'wrapper', {
      colorScheme: ge(this.config.colorScheme),
      content: t,
    });
  }
  makeFileDiffHtml(n, t) {
    if (this.config.renderNothingWhenEmpty && Array.isArray(n.blocks) && n.blocks.length === 0)
      return '';
    const e = this.hoganUtils.template(Se, 'file-diff'),
      r = this.hoganUtils.template(re, 'file-path'),
      l = this.hoganUtils.template(dt, 'file'),
      s = this.hoganUtils.template(ft, we(n));
    return e.render({
      file: n,
      fileHtmlId: ve(n),
      diffs: t,
      filePath: r.render({ fileDiffName: le(n) }, { fileIcon: l, fileTag: s }),
    });
  }
  generateEmptyDiff() {
    return this.hoganUtils.render(re, 'empty-diff', {
      contentClass: 'd2h-code-line',
      CSSLineClass: z,
    });
  }
  generateFileHtml(n) {
    const t = me(be((e) => U(e.content, n.isCombined).content));
    return n.blocks.map((e) => {
      let r = this.hoganUtils.render(re, 'block-header', {
        CSSLineClass: z,
        blockHeader: n.isTooBig ? e.header : te(e.header),
        lineClass: 'd2h-code-linenumber',
        contentClass: 'd2h-code-line',
      });
      return (
        this.applyLineGroupping(e).forEach(([l, s, d]) => {
          if (s.length && d.length && !l.length)
            this.applyRematchMatching(s, d, t).map(([f, h]) => {
              const { left: b, right: x } = this.processChangedLines(n, n.isCombined, f, h);
              ((r += b), (r += x));
            });
          else if (l.length)
            l.forEach((f) => {
              const { prefix: h, content: b } = U(f.content, n.isCombined);
              r += this.generateSingleLineHtml(n, {
                type: z.CONTEXT,
                prefix: h,
                content: b,
                oldNumber: f.oldNumber,
                newNumber: f.newNumber,
              });
            });
          else if (s.length || d.length) {
            const { left: f, right: h } = this.processChangedLines(n, n.isCombined, s, d);
            ((r += f), (r += h));
          } else console.error('Unknown state reached while processing groups of lines', l, s, d);
        }),
        r
      );
    }).join(`
`);
  }
  applyLineGroupping(n) {
    const t = [];
    let e = [],
      r = [];
    for (let l = 0; l < n.lines.length; l++) {
      const s = n.lines[l];
      (((s.type !== F.INSERT && r.length) || (s.type === F.CONTEXT && e.length > 0)) &&
        (t.push([[], e, r]), (e = []), (r = [])),
        s.type === F.CONTEXT
          ? t.push([[s], [], []])
          : s.type === F.INSERT && e.length === 0
            ? t.push([[], [], [s]])
            : s.type === F.INSERT && e.length > 0
              ? r.push(s)
              : s.type === F.DELETE && e.push(s));
    }
    return ((e.length || r.length) && (t.push([[], e, r]), (e = []), (r = [])), t);
  }
  applyRematchMatching(n, t, e) {
    const r = n.length * t.length,
      l = Ie(n.concat(t).map((d) => d.content.length));
    return r < this.config.matchingMaxComparisons &&
      l < this.config.maxLineSizeInBlockForComparison &&
      (this.config.matching === 'lines' || this.config.matching === 'words')
      ? e(n, t)
      : [[n, t]];
  }
  processChangedLines(n, t, e, r) {
    const l = { right: '', left: '' },
      s = Math.max(e.length, r.length);
    for (let d = 0; d < s; d++) {
      const f = e[d],
        h = r[d],
        b = f !== void 0 && h !== void 0 ? Oe(f.content, h.content, t, this.config) : void 0,
        x =
          f !== void 0 && f.oldNumber !== void 0
            ? Object.assign(
                Object.assign(
                  {},
                  b !== void 0
                    ? {
                        prefix: b.oldLine.prefix,
                        content: b.oldLine.content,
                        type: z.DELETE_CHANGES,
                      }
                    : Object.assign(Object.assign({}, U(f.content, t)), { type: ae(f.type) }),
                ),
                { oldNumber: f.oldNumber, newNumber: f.newNumber },
              )
            : void 0,
        E =
          h !== void 0 && h.newNumber !== void 0
            ? Object.assign(
                Object.assign(
                  {},
                  b !== void 0
                    ? {
                        prefix: b.newLine.prefix,
                        content: b.newLine.content,
                        type: z.INSERT_CHANGES,
                      }
                    : Object.assign(Object.assign({}, U(h.content, t)), { type: ae(h.type) }),
                ),
                { oldNumber: h.oldNumber, newNumber: h.newNumber },
              )
            : void 0,
        { left: o, right: c } = this.generateLineHtml(n, x, E);
      ((l.left += o), (l.right += c));
    }
    return l;
  }
  generateLineHtml(n, t, e) {
    return { left: this.generateSingleLineHtml(n, t), right: this.generateSingleLineHtml(n, e) };
  }
  generateSingleLineHtml(n, t) {
    if (t === void 0) return '';
    const e = this.hoganUtils.render(Se, 'numbers', {
      oldNumber: t.oldNumber || '',
      newNumber: t.newNumber || '',
    });
    return this.hoganUtils.render(re, 'line', {
      type: t.type,
      lineClass: 'd2h-code-linenumber',
      contentClass: 'd2h-code-line',
      prefix: t.prefix === ' ' ? '&nbsp;' : t.prefix,
      content: t.content,
      lineNumber: e,
      line: t,
      file: n,
    });
  }
}
const He = Object.assign(Object.assign({}, oe), {
    renderNothingWhenEmpty: !1,
    matchingMaxComparisons: 2500,
    maxLineSizeInBlockForComparison: 200,
  }),
  se = 'generic',
  ut = 'side-by-side',
  pt = 'icon',
  bt = 'tag';
class mt {
  constructor(n, t = {}) {
    ((this.hoganUtils = n), (this.config = Object.assign(Object.assign({}, He), t)));
  }
  render(n) {
    const t = n.map((e) => {
      let r;
      return (
        e.blocks.length ? (r = this.generateFileHtml(e)) : (r = this.generateEmptyDiff()),
        this.makeFileDiffHtml(e, r)
      );
    }).join(`
`);
    return this.hoganUtils.render(se, 'wrapper', {
      colorScheme: ge(this.config.colorScheme),
      content: t,
    });
  }
  makeFileDiffHtml(n, t) {
    if (this.config.renderNothingWhenEmpty && Array.isArray(n.blocks) && n.blocks.length === 0)
      return '';
    const e = this.hoganUtils.template(ut, 'file-diff'),
      r = this.hoganUtils.template(se, 'file-path'),
      l = this.hoganUtils.template(pt, 'file'),
      s = this.hoganUtils.template(bt, we(n));
    return e.render({
      file: n,
      fileHtmlId: ve(n),
      diffs: t,
      filePath: r.render({ fileDiffName: le(n) }, { fileIcon: l, fileTag: s }),
    });
  }
  generateEmptyDiff() {
    return {
      right: '',
      left: this.hoganUtils.render(se, 'empty-diff', {
        contentClass: 'd2h-code-side-line',
        CSSLineClass: z,
      }),
    };
  }
  generateFileHtml(n) {
    const t = me(be((e) => U(e.content, n.isCombined).content));
    return n.blocks
      .map((e) => {
        const r = { left: this.makeHeaderHtml(e.header, n), right: this.makeHeaderHtml('') };
        return (
          this.applyLineGroupping(e).forEach(([l, s, d]) => {
            if (s.length && d.length && !l.length)
              this.applyRematchMatching(s, d, t).map(([f, h]) => {
                const { left: b, right: x } = this.processChangedLines(n.isCombined, f, h);
                ((r.left += b), (r.right += x));
              });
            else if (l.length)
              l.forEach((f) => {
                const { prefix: h, content: b } = U(f.content, n.isCombined),
                  { left: x, right: E } = this.generateLineHtml(
                    { type: z.CONTEXT, prefix: h, content: b, number: f.oldNumber },
                    { type: z.CONTEXT, prefix: h, content: b, number: f.newNumber },
                  );
                ((r.left += x), (r.right += E));
              });
            else if (s.length || d.length) {
              const { left: f, right: h } = this.processChangedLines(n.isCombined, s, d);
              ((r.left += f), (r.right += h));
            } else console.error('Unknown state reached while processing groups of lines', l, s, d);
          }),
          r
        );
      })
      .reduce((e, r) => ({ left: e.left + r.left, right: e.right + r.right }), {
        left: '',
        right: '',
      });
  }
  applyLineGroupping(n) {
    const t = [];
    let e = [],
      r = [];
    for (let l = 0; l < n.lines.length; l++) {
      const s = n.lines[l];
      (((s.type !== F.INSERT && r.length) || (s.type === F.CONTEXT && e.length > 0)) &&
        (t.push([[], e, r]), (e = []), (r = [])),
        s.type === F.CONTEXT
          ? t.push([[s], [], []])
          : s.type === F.INSERT && e.length === 0
            ? t.push([[], [], [s]])
            : s.type === F.INSERT && e.length > 0
              ? r.push(s)
              : s.type === F.DELETE && e.push(s));
    }
    return ((e.length || r.length) && (t.push([[], e, r]), (e = []), (r = [])), t);
  }
  applyRematchMatching(n, t, e) {
    const r = n.length * t.length,
      l = Ie(n.concat(t).map((d) => d.content.length));
    return r < this.config.matchingMaxComparisons &&
      l < this.config.maxLineSizeInBlockForComparison &&
      (this.config.matching === 'lines' || this.config.matching === 'words')
      ? e(n, t)
      : [[n, t]];
  }
  makeHeaderHtml(n, t) {
    return this.hoganUtils.render(se, 'block-header', {
      CSSLineClass: z,
      blockHeader: t?.isTooBig ? n : te(n),
      lineClass: 'd2h-code-side-linenumber',
      contentClass: 'd2h-code-side-line',
    });
  }
  processChangedLines(n, t, e) {
    const r = { right: '', left: '' },
      l = Math.max(t.length, e.length);
    for (let s = 0; s < l; s++) {
      const d = t[s],
        f = e[s],
        h = d !== void 0 && f !== void 0 ? Oe(d.content, f.content, n, this.config) : void 0,
        b =
          d !== void 0 && d.oldNumber !== void 0
            ? Object.assign(
                Object.assign(
                  {},
                  h !== void 0
                    ? {
                        prefix: h.oldLine.prefix,
                        content: h.oldLine.content,
                        type: z.DELETE_CHANGES,
                      }
                    : Object.assign(Object.assign({}, U(d.content, n)), { type: ae(d.type) }),
                ),
                { number: d.oldNumber },
              )
            : void 0,
        x =
          f !== void 0 && f.newNumber !== void 0
            ? Object.assign(
                Object.assign(
                  {},
                  h !== void 0
                    ? {
                        prefix: h.newLine.prefix,
                        content: h.newLine.content,
                        type: z.INSERT_CHANGES,
                      }
                    : Object.assign(Object.assign({}, U(f.content, n)), { type: ae(f.type) }),
                ),
                { number: f.newNumber },
              )
            : void 0,
        { left: E, right: o } = this.generateLineHtml(b, x);
      ((r.left += E), (r.right += o));
    }
    return r;
  }
  generateLineHtml(n, t) {
    return { left: this.generateSingleHtml(n), right: this.generateSingleHtml(t) };
  }
  generateSingleHtml(n) {
    const t = 'd2h-code-side-linenumber',
      e = 'd2h-code-side-line';
    return this.hoganUtils.render(se, 'line', {
      type: n?.type || `${z.CONTEXT} d2h-emptyplaceholder`,
      lineClass: n !== void 0 ? t : `${t} d2h-code-side-emptyplaceholder`,
      contentClass: n !== void 0 ? e : `${e} d2h-code-side-emptyplaceholder`,
      prefix: n?.prefix === ' ' ? '&nbsp;' : n?.prefix,
      content: n?.content,
      lineNumber: n?.number,
    });
  }
}
var he = {},
  Le;
function gt() {
  return (
    Le ||
      ((Le = 1),
      (function (i) {
        (function (n) {
          var t = /\S/,
            e = /\"/g,
            r = /\n/g,
            l = /\r/g,
            s = /\\/g,
            d = /\u2028/,
            f = /\u2029/;
          ((n.tags = {
            '#': 1,
            '^': 2,
            '<': 3,
            $: 4,
            '/': 5,
            '!': 6,
            '>': 7,
            '=': 8,
            _v: 9,
            '{': 10,
            '&': 11,
            _t: 12,
          }),
            (n.scan = function (u, g) {
              var N = u.length,
                k = 0,
                R = 1,
                A = 2,
                P = k,
                _ = null,
                Z = null,
                B = '',
                H = [],
                K = !1,
                m = 0,
                L = 0,
                v = '{{',
                W = '}}';
              function ne() {
                B.length > 0 && (H.push({ tag: '_t', text: new String(B) }), (B = ''));
              }
              function ce() {
                for (var G = !0, j = L; j < H.length; j++)
                  if (
                    ((G =
                      n.tags[H[j].tag] < n.tags._v ||
                      (H[j].tag == '_t' && H[j].text.match(t) === null)),
                    !G)
                  )
                    return !1;
                return G;
              }
              function J(G, j) {
                if ((ne(), G && ce()))
                  for (var V = L, Q; V < H.length; V++)
                    H[V].text &&
                      ((Q = H[V + 1]) && Q.tag == '>' && (Q.indent = H[V].text.toString()),
                      H.splice(V, 1));
                else
                  j ||
                    H.push({
                      tag: `
`,
                    });
                ((K = !1), (L = H.length));
              }
              function ie(G, j) {
                var V = '=' + W,
                  Q = G.indexOf(V, j),
                  de = b(G.substring(G.indexOf('=', j) + 1, Q)).split(' ');
                return ((v = de[0]), (W = de[de.length - 1]), Q + V.length - 1);
              }
              for (g && ((g = g.split(' ')), (v = g[0]), (W = g[1])), m = 0; m < N; m++)
                P == k
                  ? x(v, u, m)
                    ? (--m, ne(), (P = R))
                    : u.charAt(m) ==
                        `
`
                      ? J(K)
                      : (B += u.charAt(m))
                  : P == R
                    ? ((m += v.length - 1),
                      (Z = n.tags[u.charAt(m + 1)]),
                      (_ = Z ? u.charAt(m + 1) : '_v'),
                      _ == '=' ? ((m = ie(u, m)), (P = k)) : (Z && m++, (P = A)),
                      (K = m))
                    : x(W, u, m)
                      ? (H.push({
                          tag: _,
                          n: b(B),
                          otag: v,
                          ctag: W,
                          i: _ == '/' ? K - v.length : m + W.length,
                        }),
                        (B = ''),
                        (m += W.length - 1),
                        (P = k),
                        _ == '{' && (W == '}}' ? m++ : h(H[H.length - 1])))
                      : (B += u.charAt(m));
              return (J(K, !0), H);
            }));
          function h(a) {
            a.n.substr(a.n.length - 1) === '}' && (a.n = a.n.substring(0, a.n.length - 1));
          }
          function b(a) {
            return a.trim ? a.trim() : a.replace(/^\s*|\s*$/g, '');
          }
          function x(a, u, g) {
            if (u.charAt(g) != a.charAt(0)) return !1;
            for (var N = 1, k = a.length; N < k; N++) if (u.charAt(g + N) != a.charAt(N)) return !1;
            return !0;
          }
          var E = { _t: !0, '\n': !0, $: !0, '/': !0 };
          function o(a, u, g, N) {
            var k = [],
              R = null,
              A = null,
              P = null;
            for (A = g[g.length - 1]; a.length > 0; ) {
              if (((P = a.shift()), A && A.tag == '<' && !(P.tag in E)))
                throw new Error('Illegal content in < super tag.');
              if (n.tags[P.tag] <= n.tags.$ || c(P, N)) (g.push(P), (P.nodes = o(a, P.tag, g, N)));
              else if (P.tag == '/') {
                if (g.length === 0) throw new Error('Closing tag without opener: /' + P.n);
                if (((R = g.pop()), P.n != R.n && !w(P.n, R.n, N)))
                  throw new Error('Nesting error: ' + R.n + ' vs. ' + P.n);
                return ((R.end = P.i), k);
              } else
                P.tag ==
                  `
` &&
                  (P.last =
                    a.length == 0 ||
                    a[0].tag ==
                      `
`);
              k.push(P);
            }
            if (g.length > 0) throw new Error('missing closing tag: ' + g.pop().n);
            return k;
          }
          function c(a, u) {
            for (var g = 0, N = u.length; g < N; g++) if (u[g].o == a.n) return ((a.tag = '#'), !0);
          }
          function w(a, u, g) {
            for (var N = 0, k = g.length; N < k; N++) if (g[N].c == a && g[N].o == u) return !0;
          }
          function p(a) {
            var u = [];
            for (var g in a) u.push('"' + T(g) + '": function(c,p,t,i) {' + a[g] + '}');
            return '{ ' + u.join(',') + ' }';
          }
          function y(a) {
            var u = [];
            for (var g in a.partials)
              u.push(
                '"' + T(g) + '":{name:"' + T(a.partials[g].name) + '", ' + y(a.partials[g]) + '}',
              );
            return 'partials: {' + u.join(',') + '}, subs: ' + p(a.subs);
          }
          n.stringify = function (a, u, g) {
            return '{code: function (c,p,i) { ' + n.wrapMain(a.code) + ' },' + y(a) + '}';
          };
          var C = 0;
          ((n.generate = function (a, u, g) {
            C = 0;
            var N = { code: '', subs: {}, partials: {} };
            return (
              n.walk(a, N),
              g.asString ? this.stringify(N, u, g) : this.makeTemplate(N, u, g)
            );
          }),
            (n.wrapMain = function (a) {
              return 'var t=this;t.b(i=i||"");' + a + 'return t.fl();';
            }),
            (n.template = n.Template),
            (n.makeTemplate = function (a, u, g) {
              var N = this.makePartials(a);
              return (
                (N.code = new Function('c', 'p', 'i', this.wrapMain(a.code))),
                new this.template(N, u, this, g)
              );
            }),
            (n.makePartials = function (a) {
              var u,
                g = { subs: {}, partials: a.partials, name: a.name };
              for (u in g.partials) g.partials[u] = this.makePartials(g.partials[u]);
              for (u in a.subs) g.subs[u] = new Function('c', 'p', 't', 'i', a.subs[u]);
              return g;
            }));
          function T(a) {
            return a
              .replace(s, '\\\\')
              .replace(e, '\\"')
              .replace(r, '\\n')
              .replace(l, '\\r')
              .replace(d, '\\u2028')
              .replace(f, '\\u2029');
          }
          function M(a) {
            return ~a.indexOf('.') ? 'd' : 'f';
          }
          function S(a, u) {
            var g = '<' + (u.prefix || ''),
              N = g + a.n + C++;
            return (
              (u.partials[N] = { name: a.n, partials: {} }),
              (u.code += 't.b(t.rp("' + T(N) + '",c,p,"' + (a.indent || '') + '"));'),
              N
            );
          }
          n.codegen = {
            '#': function (a, u) {
              ((u.code +=
                'if(t.s(t.' +
                M(a.n) +
                '("' +
                T(a.n) +
                '",c,p,1),c,p,0,' +
                a.i +
                ',' +
                a.end +
                ',"' +
                a.otag +
                ' ' +
                a.ctag +
                '")){t.rs(c,p,function(c,p,t){'),
                n.walk(a.nodes, u),
                (u.code += '});c.pop();}'));
            },
            '^': function (a, u) {
              ((u.code += 'if(!t.s(t.' + M(a.n) + '("' + T(a.n) + '",c,p,1),c,p,1,0,0,"")){'),
                n.walk(a.nodes, u),
                (u.code += '};'));
            },
            '>': S,
            '<': function (a, u) {
              var g = { partials: {}, code: '', subs: {}, inPartial: !0 };
              n.walk(a.nodes, g);
              var N = u.partials[S(a, u)];
              ((N.subs = g.subs), (N.partials = g.partials));
            },
            $: function (a, u) {
              var g = { subs: {}, code: '', partials: u.partials, prefix: a.n };
              (n.walk(a.nodes, g),
                (u.subs[a.n] = g.code),
                u.inPartial || (u.code += 't.sub("' + T(a.n) + '",c,p,i);'));
            },
            '\n': function (a, u) {
              u.code += q('"\\n"' + (a.last ? '' : ' + i'));
            },
            _v: function (a, u) {
              u.code += 't.b(t.v(t.' + M(a.n) + '("' + T(a.n) + '",c,p,0)));';
            },
            _t: function (a, u) {
              u.code += q('"' + T(a.text) + '"');
            },
            '{': I,
            '&': I,
          };
          function I(a, u) {
            u.code += 't.b(t.t(t.' + M(a.n) + '("' + T(a.n) + '",c,p,0)));';
          }
          function q(a) {
            return 't.b(' + a + ');';
          }
          ((n.walk = function (a, u) {
            for (var g, N = 0, k = a.length; N < k; N++)
              ((g = n.codegen[a[N].tag]), g && g(a[N], u));
            return u;
          }),
            (n.parse = function (a, u, g) {
              return ((g = g || {}), o(a, '', [], g.sectionTags || []));
            }),
            (n.cache = {}),
            (n.cacheKey = function (a, u) {
              return [a, !!u.asString, !!u.disableLambda, u.delimiters, !!u.modelGet].join('||');
            }),
            (n.compile = function (a, u) {
              u = u || {};
              var g = n.cacheKey(a, u),
                N = this.cache[g];
              if (N) {
                var k = N.partials;
                for (var R in k) delete k[R].instance;
                return N;
              }
              return (
                (N = this.generate(this.parse(this.scan(a, u.delimiters), a, u), a, u)),
                (this.cache[g] = N)
              );
            }));
        })(i);
      })(he)),
    he
  );
}
var ue = {},
  Pe;
function vt() {
  return (
    Pe ||
      ((Pe = 1),
      (function (i) {
        (function (n) {
          ((n.Template = function (o, c, w, p) {
            ((o = o || {}),
              (this.r = o.code || this.r),
              (this.c = w),
              (this.options = p || {}),
              (this.text = c || ''),
              (this.partials = o.partials || {}),
              (this.subs = o.subs || {}),
              (this.buf = ''));
          }),
            (n.Template.prototype = {
              r: function (o, c, w) {
                return '';
              },
              v: x,
              t: b,
              render: function (c, w, p) {
                return this.ri([c], w || {}, p);
              },
              ri: function (o, c, w) {
                return this.r(o, c, w);
              },
              ep: function (o, c) {
                var w = this.partials[o],
                  p = c[w.name];
                if (w.instance && w.base == p) return w.instance;
                if (typeof p == 'string') {
                  if (!this.c) throw new Error('No compiler available.');
                  p = this.c.compile(p, this.options);
                }
                if (!p) return null;
                if (((this.partials[o].base = p), w.subs)) {
                  c.stackText || (c.stackText = {});
                  for (key in w.subs)
                    c.stackText[key] ||
                      (c.stackText[key] =
                        this.activeSub !== void 0 && c.stackText[this.activeSub]
                          ? c.stackText[this.activeSub]
                          : this.text);
                  p = e(p, w.subs, w.partials, this.stackSubs, this.stackPartials, c.stackText);
                }
                return ((this.partials[o].instance = p), p);
              },
              rp: function (o, c, w, p) {
                var y = this.ep(o, w);
                return y ? y.ri(c, w, p) : '';
              },
              rs: function (o, c, w) {
                var p = o[o.length - 1];
                if (!E(p)) {
                  w(o, c, this);
                  return;
                }
                for (var y = 0; y < p.length; y++) (o.push(p[y]), w(o, c, this), o.pop());
              },
              s: function (o, c, w, p, y, C, T) {
                var M;
                return E(o) && o.length === 0
                  ? !1
                  : (typeof o == 'function' && (o = this.ms(o, c, w, p, y, C, T)),
                    (M = !!o),
                    !p && M && c && c.push(typeof o == 'object' ? o : c[c.length - 1]),
                    M);
              },
              d: function (o, c, w, p) {
                var y,
                  C = o.split('.'),
                  T = this.f(C[0], c, w, p),
                  M = this.options.modelGet,
                  S = null;
                if (o === '.' && E(c[c.length - 2])) T = c[c.length - 1];
                else
                  for (var I = 1; I < C.length; I++)
                    ((y = t(C[I], T, M)), y !== void 0 ? ((S = T), (T = y)) : (T = ''));
                return p && !T
                  ? !1
                  : (!p && typeof T == 'function' && (c.push(S), (T = this.mv(T, c, w)), c.pop()),
                    T);
              },
              f: function (o, c, w, p) {
                for (
                  var y = !1, C = null, T = !1, M = this.options.modelGet, S = c.length - 1;
                  S >= 0;
                  S--
                )
                  if (((C = c[S]), (y = t(o, C, M)), y !== void 0)) {
                    T = !0;
                    break;
                  }
                return T
                  ? (!p && typeof y == 'function' && (y = this.mv(y, c, w)), y)
                  : p
                    ? !1
                    : '';
              },
              ls: function (o, c, w, p, y, C) {
                var T = this.options.delimiters;
                return (
                  (this.options.delimiters = C),
                  this.b(this.ct(b(o.call(c, y, w)), c, p)),
                  (this.options.delimiters = T),
                  !1
                );
              },
              ct: function (o, c, w) {
                if (this.options.disableLambda) throw new Error('Lambda features disabled.');
                return this.c.compile(o, this.options).render(c, w);
              },
              b: function (o) {
                this.buf += o;
              },
              fl: function () {
                var o = this.buf;
                return ((this.buf = ''), o);
              },
              ms: function (o, c, w, p, y, C, T) {
                var M,
                  S = c[c.length - 1],
                  I = o.call(S);
                return typeof I == 'function'
                  ? p
                    ? !0
                    : ((M =
                        this.activeSub && this.subsText && this.subsText[this.activeSub]
                          ? this.subsText[this.activeSub]
                          : this.text),
                      this.ls(I, S, c, w, M.substring(y, C), T))
                  : I;
              },
              mv: function (o, c, w) {
                var p = c[c.length - 1],
                  y = o.call(p);
                return typeof y == 'function' ? this.ct(b(y.call(p)), p, w) : y;
              },
              sub: function (o, c, w, p) {
                var y = this.subs[o];
                y && ((this.activeSub = o), y(c, w, this, p), (this.activeSub = !1));
              },
            }));
          function t(o, c, w) {
            var p;
            return (
              c &&
                typeof c == 'object' &&
                (c[o] !== void 0
                  ? (p = c[o])
                  : w && c.get && typeof c.get == 'function' && (p = c.get(o))),
              p
            );
          }
          function e(o, c, w, p, y, C) {
            function T() {}
            T.prototype = o;
            function M() {}
            M.prototype = o.subs;
            var S,
              I = new T();
            ((I.subs = new M()),
              (I.subsText = {}),
              (I.buf = ''),
              (p = p || {}),
              (I.stackSubs = p),
              (I.subsText = C));
            for (S in c) p[S] || (p[S] = c[S]);
            for (S in p) I.subs[S] = p[S];
            ((y = y || {}), (I.stackPartials = y));
            for (S in w) y[S] || (y[S] = w[S]);
            for (S in y) I.partials[S] = y[S];
            return I;
          }
          var r = /&/g,
            l = /</g,
            s = />/g,
            d = /\'/g,
            f = /\"/g,
            h = /[&<>\"\']/;
          function b(o) {
            return String(o ?? '');
          }
          function x(o) {
            return (
              (o = b(o)),
              h.test(o)
                ? o
                    .replace(r, '&amp;')
                    .replace(l, '&lt;')
                    .replace(s, '&gt;')
                    .replace(d, '&#39;')
                    .replace(f, '&quot;')
                : o
            );
          }
          var E =
            Array.isArray ||
            function (o) {
              return Object.prototype.toString.call(o) === '[object Array]';
            };
        })(i);
      })(ue)),
    ue
  );
}
var pe, Me;
function wt() {
  if (Me) return pe;
  Me = 1;
  var i = gt();
  return ((i.Template = vt().Template), (i.template = i.Template), (pe = i), pe);
}
var D = wt();
const O = {};
O['file-summary-line'] = new D.Template({
  code: function (i, n, t) {
    var e = this;
    return (
      e.b((t = t || '')),
      e.b('<li class="d2h-file-list-line">'),
      e.b(
        `
` + t,
      ),
      e.b('    <span class="d2h-file-name-wrapper">'),
      e.b(
        `
` + t,
      ),
      e.b(e.rp('<fileIcon0', i, n, '      ')),
      e.b('      <a href="#'),
      e.b(e.v(e.f('fileHtmlId', i, n, 0))),
      e.b('" class="d2h-file-name">'),
      e.b(e.v(e.f('fileName', i, n, 0))),
      e.b('</a>'),
      e.b(
        `
` + t,
      ),
      e.b('      <span class="d2h-file-stats">'),
      e.b(
        `
` + t,
      ),
      e.b('          <span class="d2h-lines-added">'),
      e.b(e.v(e.f('addedLines', i, n, 0))),
      e.b('</span>'),
      e.b(
        `
` + t,
      ),
      e.b('          <span class="d2h-lines-deleted">'),
      e.b(e.v(e.f('deletedLines', i, n, 0))),
      e.b('</span>'),
      e.b(
        `
` + t,
      ),
      e.b('      </span>'),
      e.b(
        `
` + t,
      ),
      e.b('    </span>'),
      e.b(
        `
` + t,
      ),
      e.b('</li>'),
      e.fl()
    );
  },
  partials: { '<fileIcon0': { name: 'fileIcon', partials: {}, subs: {} } },
  subs: {},
});
O['file-summary-wrapper'] = new D.Template({
  code: function (i, n, t) {
    var e = this;
    return (
      e.b((t = t || '')),
      e.b('<div class="d2h-file-list-wrapper '),
      e.b(e.v(e.f('colorScheme', i, n, 0))),
      e.b('">'),
      e.b(
        `
` + t,
      ),
      e.b('    <div class="d2h-file-list-header">'),
      e.b(
        `
` + t,
      ),
      e.b('        <span class="d2h-file-list-title">Files changed ('),
      e.b(e.v(e.f('filesNumber', i, n, 0))),
      e.b(')</span>'),
      e.b(
        `
` + t,
      ),
      e.b('        <a class="d2h-file-switch d2h-hide">hide</a>'),
      e.b(
        `
` + t,
      ),
      e.b('        <a class="d2h-file-switch d2h-show">show</a>'),
      e.b(
        `
` + t,
      ),
      e.b('    </div>'),
      e.b(
        `
` + t,
      ),
      e.b('    <ol class="d2h-file-list">'),
      e.b(
        `
` + t,
      ),
      e.b('    '),
      e.b(e.t(e.f('files', i, n, 0))),
      e.b(
        `
` + t,
      ),
      e.b('    </ol>'),
      e.b(
        `
` + t,
      ),
      e.b('</div>'),
      e.fl()
    );
  },
  partials: {},
  subs: {},
});
O['generic-block-header'] = new D.Template({
  code: function (i, n, t) {
    var e = this;
    return (
      e.b((t = t || '')),
      e.b('<tr>'),
      e.b(
        `
` + t,
      ),
      e.b('    <td class="'),
      e.b(e.v(e.f('lineClass', i, n, 0))),
      e.b(' '),
      e.b(e.v(e.d('CSSLineClass.INFO', i, n, 0))),
      e.b('"></td>'),
      e.b(
        `
` + t,
      ),
      e.b('    <td class="'),
      e.b(e.v(e.d('CSSLineClass.INFO', i, n, 0))),
      e.b('">'),
      e.b(
        `
` + t,
      ),
      e.b('        <div class="'),
      e.b(e.v(e.f('contentClass', i, n, 0))),
      e.b('">'),
      e.s(e.f('blockHeader', i, n, 1), i, n, 0, 156, 173, '{{ }}') &&
        (e.rs(i, n, function (r, l, s) {
          s.b(s.t(s.f('blockHeader', r, l, 0)));
        }),
        i.pop()),
      e.s(e.f('blockHeader', i, n, 1), i, n, 1, 0, 0, '') || e.b('&nbsp;'),
      e.b('</div>'),
      e.b(
        `
` + t,
      ),
      e.b('    </td>'),
      e.b(
        `
` + t,
      ),
      e.b('</tr>'),
      e.fl()
    );
  },
  partials: {},
  subs: {},
});
O['generic-empty-diff'] = new D.Template({
  code: function (i, n, t) {
    var e = this;
    return (
      e.b((t = t || '')),
      e.b('<tr>'),
      e.b(
        `
` + t,
      ),
      e.b('    <td class="'),
      e.b(e.v(e.d('CSSLineClass.INFO', i, n, 0))),
      e.b('">'),
      e.b(
        `
` + t,
      ),
      e.b('        <div class="'),
      e.b(e.v(e.f('contentClass', i, n, 0))),
      e.b('">'),
      e.b(
        `
` + t,
      ),
      e.b('            File without changes'),
      e.b(
        `
` + t,
      ),
      e.b('        </div>'),
      e.b(
        `
` + t,
      ),
      e.b('    </td>'),
      e.b(
        `
` + t,
      ),
      e.b('</tr>'),
      e.fl()
    );
  },
  partials: {},
  subs: {},
});
O['generic-file-path'] = new D.Template({
  code: function (i, n, t) {
    var e = this;
    return (
      e.b((t = t || '')),
      e.b('<span class="d2h-file-name-wrapper">'),
      e.b(
        `
` + t,
      ),
      e.b(e.rp('<fileIcon0', i, n, '    ')),
      e.b('    <span class="d2h-file-name">'),
      e.b(e.v(e.f('fileDiffName', i, n, 0))),
      e.b('</span>'),
      e.b(
        `
` + t,
      ),
      e.b(e.rp('<fileTag1', i, n, '    ')),
      e.b('</span>'),
      e.b(
        `
` + t,
      ),
      e.b('<label class="d2h-file-collapse">'),
      e.b(
        `
` + t,
      ),
      e.b(
        '    <input class="d2h-file-collapse-input" type="checkbox" name="viewed" value="viewed">',
      ),
      e.b(
        `
` + t,
      ),
      e.b('    Viewed'),
      e.b(
        `
` + t,
      ),
      e.b('</label>'),
      e.fl()
    );
  },
  partials: {
    '<fileIcon0': { name: 'fileIcon', partials: {}, subs: {} },
    '<fileTag1': { name: 'fileTag', partials: {}, subs: {} },
  },
  subs: {},
});
O['generic-line'] = new D.Template({
  code: function (i, n, t) {
    var e = this;
    return (
      e.b((t = t || '')),
      e.b('<tr>'),
      e.b(
        `
` + t,
      ),
      e.b('    <td class="'),
      e.b(e.v(e.f('lineClass', i, n, 0))),
      e.b(' '),
      e.b(e.v(e.f('type', i, n, 0))),
      e.b('">'),
      e.b(
        `
` + t,
      ),
      e.b('      '),
      e.b(e.t(e.f('lineNumber', i, n, 0))),
      e.b(
        `
` + t,
      ),
      e.b('    </td>'),
      e.b(
        `
` + t,
      ),
      e.b('    <td class="'),
      e.b(e.v(e.f('type', i, n, 0))),
      e.b('">'),
      e.b(
        `
` + t,
      ),
      e.b('        <div class="'),
      e.b(e.v(e.f('contentClass', i, n, 0))),
      e.b('">'),
      e.b(
        `
` + t,
      ),
      e.s(e.f('prefix', i, n, 1), i, n, 0, 162, 238, '{{ }}') &&
        (e.rs(i, n, function (r, l, s) {
          (s.b('            <span class="d2h-code-line-prefix">'),
            s.b(s.t(s.f('prefix', r, l, 0))),
            s.b('</span>'),
            s.b(
              `
` + t,
            ));
        }),
        i.pop()),
      e.s(e.f('prefix', i, n, 1), i, n, 1, 0, 0, '') ||
        (e.b('            <span class="d2h-code-line-prefix">&nbsp;</span>'),
        e.b(
          `
` + t,
        )),
      e.s(e.f('content', i, n, 1), i, n, 0, 371, 445, '{{ }}') &&
        (e.rs(i, n, function (r, l, s) {
          (s.b('            <span class="d2h-code-line-ctn">'),
            s.b(s.t(s.f('content', r, l, 0))),
            s.b('</span>'),
            s.b(
              `
` + t,
            ));
        }),
        i.pop()),
      e.s(e.f('content', i, n, 1), i, n, 1, 0, 0, '') ||
        (e.b('            <span class="d2h-code-line-ctn"><br></span>'),
        e.b(
          `
` + t,
        )),
      e.b('        </div>'),
      e.b(
        `
` + t,
      ),
      e.b('    </td>'),
      e.b(
        `
` + t,
      ),
      e.b('</tr>'),
      e.fl()
    );
  },
  partials: {},
  subs: {},
});
O['generic-wrapper'] = new D.Template({
  code: function (i, n, t) {
    var e = this;
    return (
      e.b((t = t || '')),
      e.b('<div class="d2h-wrapper '),
      e.b(e.v(e.f('colorScheme', i, n, 0))),
      e.b('">'),
      e.b(
        `
` + t,
      ),
      e.b('    '),
      e.b(e.t(e.f('content', i, n, 0))),
      e.b(
        `
` + t,
      ),
      e.b('</div>'),
      e.fl()
    );
  },
  partials: {},
  subs: {},
});
O['icon-file-added'] = new D.Template({
  code: function (i, n, t) {
    var e = this;
    return (
      e.b((t = t || '')),
      e.b(
        '<svg aria-hidden="true" class="d2h-icon d2h-added" height="16" title="added" version="1.1" viewBox="0 0 14 16"',
      ),
      e.b(
        `
` + t,
      ),
      e.b('     width="14">'),
      e.b(
        `
` + t,
      ),
      e.b(
        '    <path d="M13 1H1C0.45 1 0 1.45 0 2v12c0 0.55 0.45 1 1 1h12c0.55 0 1-0.45 1-1V2c0-0.55-0.45-1-1-1z m0 13H1V2h12v12zM6 9H3V7h3V4h2v3h3v2H8v3H6V9z"></path>',
      ),
      e.b(
        `
` + t,
      ),
      e.b('</svg>'),
      e.fl()
    );
  },
  partials: {},
  subs: {},
});
O['icon-file-changed'] = new D.Template({
  code: function (i, n, t) {
    var e = this;
    return (
      e.b((t = t || '')),
      e.b(
        '<svg aria-hidden="true" class="d2h-icon d2h-changed" height="16" title="modified" version="1.1"',
      ),
      e.b(
        `
` + t,
      ),
      e.b('     viewBox="0 0 14 16" width="14">'),
      e.b(
        `
` + t,
      ),
      e.b(
        '    <path d="M13 1H1C0.45 1 0 1.45 0 2v12c0 0.55 0.45 1 1 1h12c0.55 0 1-0.45 1-1V2c0-0.55-0.45-1-1-1z m0 13H1V2h12v12zM4 8c0-1.66 1.34-3 3-3s3 1.34 3 3-1.34 3-3 3-3-1.34-3-3z"></path>',
      ),
      e.b(
        `
` + t,
      ),
      e.b('</svg>'),
      e.fl()
    );
  },
  partials: {},
  subs: {},
});
O['icon-file-deleted'] = new D.Template({
  code: function (i, n, t) {
    var e = this;
    return (
      e.b((t = t || '')),
      e.b(
        '<svg aria-hidden="true" class="d2h-icon d2h-deleted" height="16" title="removed" version="1.1"',
      ),
      e.b(
        `
` + t,
      ),
      e.b('     viewBox="0 0 14 16" width="14">'),
      e.b(
        `
` + t,
      ),
      e.b(
        '    <path d="M13 1H1C0.45 1 0 1.45 0 2v12c0 0.55 0.45 1 1 1h12c0.55 0 1-0.45 1-1V2c0-0.55-0.45-1-1-1z m0 13H1V2h12v12zM11 9H3V7h8v2z"></path>',
      ),
      e.b(
        `
` + t,
      ),
      e.b('</svg>'),
      e.fl()
    );
  },
  partials: {},
  subs: {},
});
O['icon-file-renamed'] = new D.Template({
  code: function (i, n, t) {
    var e = this;
    return (
      e.b((t = t || '')),
      e.b(
        '<svg aria-hidden="true" class="d2h-icon d2h-moved" height="16" title="renamed" version="1.1"',
      ),
      e.b(
        `
` + t,
      ),
      e.b('     viewBox="0 0 14 16" width="14">'),
      e.b(
        `
` + t,
      ),
      e.b(
        '    <path d="M6 9H3V7h3V4l5 4-5 4V9z m8-7v12c0 0.55-0.45 1-1 1H1c-0.55 0-1-0.45-1-1V2c0-0.55 0.45-1 1-1h12c0.55 0 1 0.45 1 1z m-1 0H1v12h12V2z"></path>',
      ),
      e.b(
        `
` + t,
      ),
      e.b('</svg>'),
      e.fl()
    );
  },
  partials: {},
  subs: {},
});
O['icon-file'] = new D.Template({
  code: function (i, n, t) {
    var e = this;
    return (
      e.b((t = t || '')),
      e.b(
        '<svg aria-hidden="true" class="d2h-icon" height="16" version="1.1" viewBox="0 0 12 16" width="12">',
      ),
      e.b(
        `
` + t,
      ),
      e.b(
        '    <path d="M6 5H2v-1h4v1zM2 8h7v-1H2v1z m0 2h7v-1H2v1z m0 2h7v-1H2v1z m10-7.5v9.5c0 0.55-0.45 1-1 1H1c-0.55 0-1-0.45-1-1V2c0-0.55 0.45-1 1-1h7.5l3.5 3.5z m-1 0.5L8 2H1v12h10V5z"></path>',
      ),
      e.b(
        `
` + t,
      ),
      e.b('</svg>'),
      e.fl()
    );
  },
  partials: {},
  subs: {},
});
O['line-by-line-file-diff'] = new D.Template({
  code: function (i, n, t) {
    var e = this;
    return (
      e.b((t = t || '')),
      e.b('<div id="'),
      e.b(e.v(e.f('fileHtmlId', i, n, 0))),
      e.b('" class="d2h-file-wrapper" data-lang="'),
      e.b(e.v(e.d('file.language', i, n, 0))),
      e.b('">'),
      e.b(
        `
` + t,
      ),
      e.b('    <div class="d2h-file-header">'),
      e.b(
        `
` + t,
      ),
      e.b('    '),
      e.b(e.t(e.f('filePath', i, n, 0))),
      e.b(
        `
` + t,
      ),
      e.b('    </div>'),
      e.b(
        `
` + t,
      ),
      e.b('    <div class="d2h-file-diff">'),
      e.b(
        `
` + t,
      ),
      e.b('        <div class="d2h-code-wrapper">'),
      e.b(
        `
` + t,
      ),
      e.b('            <table class="d2h-diff-table">'),
      e.b(
        `
` + t,
      ),
      e.b('                <tbody class="d2h-diff-tbody">'),
      e.b(
        `
` + t,
      ),
      e.b('                '),
      e.b(e.t(e.f('diffs', i, n, 0))),
      e.b(
        `
` + t,
      ),
      e.b('                </tbody>'),
      e.b(
        `
` + t,
      ),
      e.b('            </table>'),
      e.b(
        `
` + t,
      ),
      e.b('        </div>'),
      e.b(
        `
` + t,
      ),
      e.b('    </div>'),
      e.b(
        `
` + t,
      ),
      e.b('</div>'),
      e.fl()
    );
  },
  partials: {},
  subs: {},
});
O['line-by-line-numbers'] = new D.Template({
  code: function (i, n, t) {
    var e = this;
    return (
      e.b((t = t || '')),
      e.b('<div class="line-num1">'),
      e.b(e.v(e.f('oldNumber', i, n, 0))),
      e.b('</div>'),
      e.b(
        `
` + t,
      ),
      e.b('<div class="line-num2">'),
      e.b(e.v(e.f('newNumber', i, n, 0))),
      e.b('</div>'),
      e.fl()
    );
  },
  partials: {},
  subs: {},
});
O['side-by-side-file-diff'] = new D.Template({
  code: function (i, n, t) {
    var e = this;
    return (
      e.b((t = t || '')),
      e.b('<div id="'),
      e.b(e.v(e.f('fileHtmlId', i, n, 0))),
      e.b('" class="d2h-file-wrapper" data-lang="'),
      e.b(e.v(e.d('file.language', i, n, 0))),
      e.b('">'),
      e.b(
        `
` + t,
      ),
      e.b('    <div class="d2h-file-header">'),
      e.b(
        `
` + t,
      ),
      e.b('      '),
      e.b(e.t(e.f('filePath', i, n, 0))),
      e.b(
        `
` + t,
      ),
      e.b('    </div>'),
      e.b(
        `
` + t,
      ),
      e.b('    <div class="d2h-files-diff">'),
      e.b(
        `
` + t,
      ),
      e.b('        <div class="d2h-file-side-diff">'),
      e.b(
        `
` + t,
      ),
      e.b('            <div class="d2h-code-wrapper">'),
      e.b(
        `
` + t,
      ),
      e.b('                <table class="d2h-diff-table">'),
      e.b(
        `
` + t,
      ),
      e.b('                    <tbody class="d2h-diff-tbody">'),
      e.b(
        `
` + t,
      ),
      e.b('                    '),
      e.b(e.t(e.d('diffs.left', i, n, 0))),
      e.b(
        `
` + t,
      ),
      e.b('                    </tbody>'),
      e.b(
        `
` + t,
      ),
      e.b('                </table>'),
      e.b(
        `
` + t,
      ),
      e.b('            </div>'),
      e.b(
        `
` + t,
      ),
      e.b('        </div>'),
      e.b(
        `
` + t,
      ),
      e.b('        <div class="d2h-file-side-diff">'),
      e.b(
        `
` + t,
      ),
      e.b('            <div class="d2h-code-wrapper">'),
      e.b(
        `
` + t,
      ),
      e.b('                <table class="d2h-diff-table">'),
      e.b(
        `
` + t,
      ),
      e.b('                    <tbody class="d2h-diff-tbody">'),
      e.b(
        `
` + t,
      ),
      e.b('                    '),
      e.b(e.t(e.d('diffs.right', i, n, 0))),
      e.b(
        `
` + t,
      ),
      e.b('                    </tbody>'),
      e.b(
        `
` + t,
      ),
      e.b('                </table>'),
      e.b(
        `
` + t,
      ),
      e.b('            </div>'),
      e.b(
        `
` + t,
      ),
      e.b('        </div>'),
      e.b(
        `
` + t,
      ),
      e.b('    </div>'),
      e.b(
        `
` + t,
      ),
      e.b('</div>'),
      e.fl()
    );
  },
  partials: {},
  subs: {},
});
O['tag-file-added'] = new D.Template({
  code: function (i, n, t) {
    var e = this;
    return (
      e.b((t = t || '')),
      e.b('<span class="d2h-tag d2h-added d2h-added-tag">ADDED</span>'),
      e.fl()
    );
  },
  partials: {},
  subs: {},
});
O['tag-file-changed'] = new D.Template({
  code: function (i, n, t) {
    var e = this;
    return (
      e.b((t = t || '')),
      e.b('<span class="d2h-tag d2h-changed d2h-changed-tag">CHANGED</span>'),
      e.fl()
    );
  },
  partials: {},
  subs: {},
});
O['tag-file-deleted'] = new D.Template({
  code: function (i, n, t) {
    var e = this;
    return (
      e.b((t = t || '')),
      e.b('<span class="d2h-tag d2h-deleted d2h-deleted-tag">DELETED</span>'),
      e.fl()
    );
  },
  partials: {},
  subs: {},
});
O['tag-file-renamed'] = new D.Template({
  code: function (i, n, t) {
    var e = this;
    return (
      e.b((t = t || '')),
      e.b('<span class="d2h-tag d2h-moved d2h-moved-tag">RENAMED</span>'),
      e.fl()
    );
  },
  partials: {},
  subs: {},
});
class yt {
  constructor({ compiledTemplates: n = {}, rawTemplates: t = {} }) {
    const e = Object.entries(t).reduce((r, [l, s]) => {
      const d = D.compile(s, { asString: !1 });
      return Object.assign(Object.assign({}, r), { [l]: d });
    }, {});
    this.preCompiledTemplates = Object.assign(Object.assign(Object.assign({}, O), n), e);
  }
  static compile(n) {
    return D.compile(n, { asString: !1 });
  }
  render(n, t, e, r, l) {
    const s = this.templateKey(n, t);
    try {
      return this.preCompiledTemplates[s].render(e, r, l);
    } catch {
      throw new Error(`Could not find template to render '${s}'`);
    }
  }
  template(n, t) {
    return this.preCompiledTemplates[this.templateKey(n, t)];
  }
  templateKey(n, t) {
    return `${n}-${t}`;
  }
}
const xt = Object.assign(Object.assign(Object.assign({}, ke), He), {
  outputFormat: We.LINE_BY_LINE,
  drawFileList: !0,
});
function Tt(i, n = {}) {
  const t = Object.assign(Object.assign({}, xt), n),
    e = typeof i == 'string' ? Ze(i, t) : i,
    r = new yt(t),
    { colorScheme: l } = t,
    s = { colorScheme: l },
    d = t.drawFileList ? new ct(r, s).render(e) : '',
    f = t.outputFormat === 'side-by-side' ? new mt(r, t).render(e) : new ht(r, t).render(e);
  return d + f;
}
const Nt = `
.patch-viewer{min-height:100%;--patch-bg:#f6f8fa;--patch-surface:#fff;--patch-border:rgba(31,35,40,.12);--patch-text:#24292f;--patch-muted:#57606a;--patch-add:#dafbe1;--patch-del:#ffebe9;--patch-info:#ddf4ff;--patch-font-size:13px;background:var(--patch-bg);color:var(--patch-text);box-sizing:border-box}
.patch-toolbar{position:sticky;top:0;z-index:2;display:flex;height:46px;align-items:center;justify-content:space-between;gap:12px;padding:0 16px;border-bottom:1px solid var(--patch-border);background:rgba(255,255,255,.92);backdrop-filter:blur(12px);box-sizing:border-box}
.patch-toolbar span,.patch-toolbar strong{color:var(--patch-muted);font-size:12px;font-weight:800;letter-spacing:0}
.patch-body{padding:16px;overflow:auto;font-size:var(--patch-font-size)}
.patch-body .d2h-wrapper{min-width:860px}
.patch-body .d2h-file-wrapper{margin:0 0 16px;overflow:hidden;border:1px solid var(--patch-border);border-radius:8px;background:var(--patch-surface)}
.patch-body .d2h-file-header{display:flex;align-items:center;gap:8px;padding:10px 12px;border-bottom:1px solid var(--patch-border);background:#f8fafc;color:var(--patch-muted);font-weight:800}
.patch-body .d2h-file-name-wrapper{display:flex;min-width:0;align-items:center;gap:8px}
.patch-body .d2h-file-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.patch-body .d2h-diff-table{width:100%;border-collapse:collapse;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,'Liberation Mono',monospace;font-size:1em;line-height:1.58}
.patch-body .d2h-code-side-linenumber,.patch-body .d2h-code-linenumber{width:56px;padding:0 8px;border-right:1px solid var(--patch-border);color:var(--patch-muted);text-align:right;user-select:none}
.patch-body .d2h-code-side-line,.patch-body .d2h-code-line{padding:0 10px;white-space:pre-wrap;word-break:break-word}
.patch-body .d2h-ins{background:var(--patch-add)}
.patch-body .d2h-del{background:var(--patch-del)}
.patch-body .d2h-info{background:var(--patch-info);color:var(--patch-muted)}
.patch-body .d2h-file-list-wrapper{margin:0 0 16px;border:1px solid var(--patch-border);border-radius:8px;background:var(--patch-surface)}
.patch-body .d2h-file-list-header{padding:10px 12px;border-bottom:1px solid var(--patch-border);color:var(--patch-muted);font-weight:800}
.patch-body .d2h-file-list{margin:0;padding:8px 12px;list-style:none}
.patch-body .d2h-file-list-line{display:flex;gap:8px;padding:4px 0;color:var(--patch-text);font-size:.95em}
.patch-fallback{margin:0;padding:18px 20px;overflow:auto;border-radius:8px;background:#0d1117;color:#e6edf3;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,'Liberation Mono',monospace;font-size:var(--patch-font-size);line-height:1.7;white-space:pre}
.file-viewer[data-viewer-theme='dark'] .patch-viewer{--patch-bg:#0d1117;--patch-surface:#161b22;--patch-border:rgba(139,148,158,.24);--patch-text:#e6edf3;--patch-muted:#8b949e;--patch-add:rgba(46,160,67,.26);--patch-del:rgba(248,81,73,.24);--patch-info:rgba(56,139,253,.18)}
.file-viewer[data-viewer-theme='dark'] .patch-toolbar{background:rgba(13,17,23,.92)}
.file-viewer[data-viewer-theme='dark'] .patch-body .d2h-file-header{background:#161b22}
@media (prefers-color-scheme:dark){.file-viewer[data-viewer-theme='system'] .patch-viewer{--patch-bg:#0d1117;--patch-surface:#161b22;--patch-border:rgba(139,148,158,.24);--patch-text:#e6edf3;--patch-muted:#8b949e;--patch-add:rgba(46,160,67,.26);--patch-del:rgba(248,81,73,.24);--patch-info:rgba(56,139,253,.18)}.file-viewer[data-viewer-theme='system'] .patch-toolbar{background:rgba(13,17,23,.92)}.file-viewer[data-viewer-theme='system'] .patch-body .d2h-file-header{background:#161b22}}
`,
  Y = (i, n, t, e) => {
    const r = i.createElement(n);
    return (t && (r.className = t), typeof e == 'string' && (r.textContent = e), r);
  },
  Ct = (i) => {
    const n = i.createElement('style');
    return ((n.textContent = Nt), n);
  },
  Et = (i) => Math.min(2.4, Math.max(0.6, Number(i.toFixed(2)))),
  St = (i) => {
    var n;
    const t = i.match(/^diff --git\s+/gm);
    return t?.length
      ? t.length
      : ((n = i.match(/^---\s+/gm)) === null || n === void 0 ? void 0 : n.length) || 1;
  },
  Lt = (i) =>
    i.replace(
      /[&<>"']/g,
      (n) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[n],
    );
async function Ot(i, n, t = 'patch') {
  const e = n.ownerDocument || document,
    r = await ze(i);
  let l = 1;
  const s = Be(),
    d = Y(e, 'div', 'patch-viewer');
  d.dataset.viewerZoomProvider = 'patch';
  const f = Y(e, 'div', 'patch-toolbar');
  f.append(
    Y(e, 'span', void 0, t.toUpperCase()),
    Y(e, 'strong', void 0, `${St(r)} files · side-by-side`),
  );
  const h = Y(e, 'div', 'patch-body');
  try {
    h.innerHTML = Tt(r, {
      drawFileList: !0,
      matching: 'lines',
      outputFormat: 'side-by-side',
      renderNothingWhenEmpty: !1,
    });
  } catch {
    const E = Y(e, 'pre', 'patch-fallback');
    ((E.innerHTML = Lt(r)), h.replaceChildren(E));
  }
  (d.append(f, h),
    d.style.setProperty('--patch-font-size', `${13 * l}px`),
    n.replaceChildren(Ct(e), d));
  const b = () => ({
      scale: l,
      label: `${Math.round(l * 100)}%`,
      canZoomIn: l < 2.4,
      canZoomOut: l > 0.6,
      canReset: l !== 1,
      minScale: 0.6,
      maxScale: 2.4,
    }),
    x = (E) => (
      (l = Et(E)),
      d.style.setProperty('--patch-font-size', `${13 * l}px`),
      s.emit(),
      b()
    );
  return (
    Ae(d, {
      zoomIn: () => x(l + 0.1),
      zoomOut: () => x(l - 0.1),
      resetZoom: () => x(1),
      setZoom: x,
      getState: b,
      subscribe: s.subscribe,
    }),
    {
      $el: d,
      unmount() {
        (Re(d), n.replaceChildren());
      },
    }
  );
}
export { Ot as default };
