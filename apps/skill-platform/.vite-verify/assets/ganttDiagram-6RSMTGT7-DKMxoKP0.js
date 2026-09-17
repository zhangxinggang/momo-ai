import {
  ah as $e,
  an as _e,
  au as Ae,
  am as be,
  ao as Bt,
  ap as Ce,
  ag as De,
  ar as Ee,
  av as Fe,
  ay as Ht,
  as as Ie,
  az as jt,
  d as Le,
  at as Me,
  s as mt,
  x as Nt,
  ax as qt,
  aq as Se,
  W as Te,
  l as we,
  al as xe,
  aA as Xt,
  aw as zt,
} from './markdown-it-vendor-DL4wSELR.js';
import './markdown-vendor-DldLOD9R.js';
import {
  _ as c,
  s as de,
  l as et,
  p as fe,
  i as ge,
  o as he,
  b as ke,
  a as me,
  c as nt,
  x as pe,
  g as ue,
  u as ve,
  d as ye,
} from './mermaid.core-Cs_8gTP_.js';
import { l as Oe, k as P, g as Qt, m as We } from './ui-vendor-C-FKu2uc.js';
var kt = { exports: {} },
  Ye = kt.exports,
  Ut;
function Re() {
  return (
    Ut ||
      ((Ut = 1),
      (function (t, r) {
        (function (n, i) {
          t.exports = i();
        })(Ye, function () {
          var n = 'day';
          return function (i, a, k) {
            var T = function (A) {
                return A.add(4 - A.isoWeekday(), n);
              },
              C = a.prototype;
            ((C.isoWeekYear = function () {
              return T(this).year();
            }),
              (C.isoWeek = function (A) {
                if (!this.$utils().u(A)) return this.add(7 * (A - this.isoWeek()), n);
                var D,
                  $,
                  L,
                  O,
                  W = T(this),
                  _ =
                    ((D = this.isoWeekYear()),
                    ($ = this.$u),
                    (L = ($ ? k.utc : k)().year(D).startOf('year')),
                    (O = 4 - L.isoWeekday()),
                    L.isoWeekday() > 4 && (O += 7),
                    L.add(O, n));
                return W.diff(_, 'week') + 1;
              }),
              (C.isoWeekday = function (A) {
                return this.$utils().u(A) ? this.day() || 7 : this.day(this.day() % 7 ? A : A - 7);
              }));
            var Y = C.startOf;
            C.startOf = function (A, D) {
              var $ = this.$utils(),
                L = !!$.u(D) || D;
              return $.p(A) === 'isoweek'
                ? L
                  ? this.date(this.date() - (this.isoWeekday() - 1)).startOf('day')
                  : this.date(this.date() - 1 - (this.isoWeekday() - 1) + 7).endOf('day')
                : Y.bind(this)(A, D);
            };
          };
        });
      })(kt)),
    kt.exports
  );
}
var Pe = Re();
const Ve = Qt(Pe);
var yt = { exports: {} },
  Ne = yt.exports,
  Gt;
function Be() {
  return (
    Gt ||
      ((Gt = 1),
      (function (t, r) {
        (function (n, i) {
          t.exports = i();
        })(Ne, function () {
          var n,
            i,
            a = 1e3,
            k = 6e4,
            T = 36e5,
            C = 864e5,
            Y =
              /\[([^\]]+)]|Y{1,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g,
            A = 31536e6,
            D = 2628e6,
            $ =
              /^(-|\+)?P(?:([-+]?[0-9,.]*)Y)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)W)?(?:([-+]?[0-9,.]*)D)?(?:T(?:([-+]?[0-9,.]*)H)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)S)?)?$/,
            L = {
              years: A,
              months: D,
              days: C,
              hours: T,
              minutes: k,
              seconds: a,
              milliseconds: 1,
              weeks: 6048e5,
            },
            O = function (I) {
              return I instanceof X;
            },
            W = function (I, v, f) {
              return new X(I, f, v.$l);
            },
            _ = function (I) {
              return i.p(I) + 's';
            },
            J = function (I) {
              return I < 0;
            },
            B = function (I) {
              return J(I) ? Math.ceil(I) : Math.floor(I);
            },
            Q = function (I) {
              return Math.abs(I);
            },
            q = function (I, v) {
              return I
                ? J(I)
                  ? { negative: !0, format: '' + Q(I) + v }
                  : { negative: !1, format: '' + I + v }
                : { negative: !1, format: '' };
            },
            X = (function () {
              function I(f, u, y) {
                var g = this;
                if (
                  ((this.$d = {}),
                  (this.$l = y),
                  f === void 0 && ((this.$ms = 0), this.parseFromMilliseconds()),
                  u)
                )
                  return W(f * L[_(u)], this);
                if (typeof f == 'number')
                  return ((this.$ms = f), this.parseFromMilliseconds(), this);
                if (typeof f == 'object')
                  return (
                    Object.keys(f).forEach(function (o) {
                      g.$d[_(o)] = f[o];
                    }),
                    this.calMilliseconds(),
                    this
                  );
                if (typeof f == 'string') {
                  var p = f.match($);
                  if (p) {
                    var m = p.slice(2).map(function (o) {
                      return o != null ? Number(o) : 0;
                    });
                    return (
                      (this.$d.years = m[0]),
                      (this.$d.months = m[1]),
                      (this.$d.weeks = m[2]),
                      (this.$d.days = m[3]),
                      (this.$d.hours = m[4]),
                      (this.$d.minutes = m[5]),
                      (this.$d.seconds = m[6]),
                      this.calMilliseconds(),
                      this
                    );
                  }
                }
                return this;
              }
              var v = I.prototype;
              return (
                (v.calMilliseconds = function () {
                  var f = this;
                  this.$ms = Object.keys(this.$d).reduce(function (u, y) {
                    return u + (f.$d[y] || 0) * L[y];
                  }, 0);
                }),
                (v.parseFromMilliseconds = function () {
                  var f = this.$ms;
                  ((this.$d.years = B(f / A)),
                    (f %= A),
                    (this.$d.months = B(f / D)),
                    (f %= D),
                    (this.$d.days = B(f / C)),
                    (f %= C),
                    (this.$d.hours = B(f / T)),
                    (f %= T),
                    (this.$d.minutes = B(f / k)),
                    (f %= k),
                    (this.$d.seconds = B(f / a)),
                    (f %= a),
                    (this.$d.milliseconds = f));
                }),
                (v.toISOString = function () {
                  var f = q(this.$d.years, 'Y'),
                    u = q(this.$d.months, 'M'),
                    y = +this.$d.days || 0;
                  this.$d.weeks && (y += 7 * this.$d.weeks);
                  var g = q(y, 'D'),
                    p = q(this.$d.hours, 'H'),
                    m = q(this.$d.minutes, 'M'),
                    o = this.$d.seconds || 0;
                  this.$d.milliseconds &&
                    ((o += this.$d.milliseconds / 1e3), (o = Math.round(1e3 * o) / 1e3));
                  var l = q(o, 'S'),
                    h =
                      f.negative ||
                      u.negative ||
                      g.negative ||
                      p.negative ||
                      m.negative ||
                      l.negative,
                    d = p.format || m.format || l.format ? 'T' : '',
                    x =
                      (h ? '-' : '') +
                      'P' +
                      f.format +
                      u.format +
                      g.format +
                      d +
                      p.format +
                      m.format +
                      l.format;
                  return x === 'P' || x === '-P' ? 'P0D' : x;
                }),
                (v.toJSON = function () {
                  return this.toISOString();
                }),
                (v.format = function (f) {
                  var u = f || 'YYYY-MM-DDTHH:mm:ss',
                    y = {
                      Y: this.$d.years,
                      YY: i.s(this.$d.years, 2, '0'),
                      YYYY: i.s(this.$d.years, 4, '0'),
                      M: this.$d.months,
                      MM: i.s(this.$d.months, 2, '0'),
                      D: this.$d.days,
                      DD: i.s(this.$d.days, 2, '0'),
                      H: this.$d.hours,
                      HH: i.s(this.$d.hours, 2, '0'),
                      m: this.$d.minutes,
                      mm: i.s(this.$d.minutes, 2, '0'),
                      s: this.$d.seconds,
                      ss: i.s(this.$d.seconds, 2, '0'),
                      SSS: i.s(this.$d.milliseconds, 3, '0'),
                    };
                  return u.replace(Y, function (g, p) {
                    return p || String(y[g]);
                  });
                }),
                (v.as = function (f) {
                  return this.$ms / L[_(f)];
                }),
                (v.get = function (f) {
                  var u = this.$ms,
                    y = _(f);
                  return (
                    y === 'milliseconds'
                      ? (u %= 1e3)
                      : (u = y === 'weeks' ? B(u / L[y]) : this.$d[y]),
                    u || 0
                  );
                }),
                (v.add = function (f, u, y) {
                  var g;
                  return (
                    (g = u ? f * L[_(u)] : O(f) ? f.$ms : W(f, this).$ms),
                    W(this.$ms + g * (y ? -1 : 1), this)
                  );
                }),
                (v.subtract = function (f, u) {
                  return this.add(f, u, !0);
                }),
                (v.locale = function (f) {
                  var u = this.clone();
                  return ((u.$l = f), u);
                }),
                (v.clone = function () {
                  return W(this.$ms, this);
                }),
                (v.humanize = function (f) {
                  return n().add(this.$ms, 'ms').locale(this.$l).fromNow(!f);
                }),
                (v.valueOf = function () {
                  return this.asMilliseconds();
                }),
                (v.milliseconds = function () {
                  return this.get('milliseconds');
                }),
                (v.asMilliseconds = function () {
                  return this.as('milliseconds');
                }),
                (v.seconds = function () {
                  return this.get('seconds');
                }),
                (v.asSeconds = function () {
                  return this.as('seconds');
                }),
                (v.minutes = function () {
                  return this.get('minutes');
                }),
                (v.asMinutes = function () {
                  return this.as('minutes');
                }),
                (v.hours = function () {
                  return this.get('hours');
                }),
                (v.asHours = function () {
                  return this.as('hours');
                }),
                (v.days = function () {
                  return this.get('days');
                }),
                (v.asDays = function () {
                  return this.as('days');
                }),
                (v.weeks = function () {
                  return this.get('weeks');
                }),
                (v.asWeeks = function () {
                  return this.as('weeks');
                }),
                (v.months = function () {
                  return this.get('months');
                }),
                (v.asMonths = function () {
                  return this.as('months');
                }),
                (v.years = function () {
                  return this.get('years');
                }),
                (v.asYears = function () {
                  return this.as('years');
                }),
                I
              );
            })(),
            Z = function (I, v, f) {
              return I.add(v.years() * f, 'y')
                .add(v.months() * f, 'M')
                .add(v.days() * f, 'd')
                .add(v.hours() * f, 'h')
                .add(v.minutes() * f, 'm')
                .add(v.seconds() * f, 's')
                .add(v.milliseconds() * f, 'ms');
            };
          return function (I, v, f) {
            ((n = f),
              (i = f().$utils()),
              (f.duration = function (g, p) {
                var m = f.locale();
                return W(g, { $l: m }, p);
              }),
              (f.isDuration = O));
            var u = v.prototype.add,
              y = v.prototype.subtract;
            ((v.prototype.add = function (g, p) {
              return O(g) ? Z(this, g, 1) : u.bind(this)(g, p);
            }),
              (v.prototype.subtract = function (g, p) {
                return O(g) ? Z(this, g, -1) : y.bind(this)(g, p);
              }));
          };
        });
      })(yt)),
    yt.exports
  );
}
var ze = Be();
const qe = Qt(ze);
var Dt = (function () {
  var t = c(function (m, o, l, h) {
      for (l = l || {}, h = m.length; h--; l[m[h]] = o);
      return l;
    }, 'o'),
    r = [
      6, 8, 10, 12, 13, 14, 15, 16, 17, 18, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 33, 35,
      36, 38, 40,
    ],
    n = [1, 26],
    i = [1, 27],
    a = [1, 28],
    k = [1, 29],
    T = [1, 30],
    C = [1, 31],
    Y = [1, 32],
    A = [1, 33],
    D = [1, 34],
    $ = [1, 9],
    L = [1, 10],
    O = [1, 11],
    W = [1, 12],
    _ = [1, 13],
    J = [1, 14],
    B = [1, 15],
    Q = [1, 16],
    q = [1, 19],
    X = [1, 20],
    Z = [1, 21],
    I = [1, 22],
    v = [1, 23],
    f = [1, 25],
    u = [1, 35],
    y = {
      trace: c(function () {}, 'trace'),
      yy: {},
      symbols_: {
        error: 2,
        start: 3,
        gantt: 4,
        document: 5,
        EOF: 6,
        line: 7,
        SPACE: 8,
        statement: 9,
        NL: 10,
        weekday: 11,
        weekday_monday: 12,
        weekday_tuesday: 13,
        weekday_wednesday: 14,
        weekday_thursday: 15,
        weekday_friday: 16,
        weekday_saturday: 17,
        weekday_sunday: 18,
        weekend: 19,
        weekend_friday: 20,
        weekend_saturday: 21,
        dateFormat: 22,
        inclusiveEndDates: 23,
        topAxis: 24,
        axisFormat: 25,
        tickInterval: 26,
        excludes: 27,
        includes: 28,
        todayMarker: 29,
        title: 30,
        acc_title: 31,
        acc_title_value: 32,
        acc_descr: 33,
        acc_descr_value: 34,
        acc_descr_multiline_value: 35,
        section: 36,
        clickStatement: 37,
        taskTxt: 38,
        taskData: 39,
        click: 40,
        callbackname: 41,
        callbackargs: 42,
        href: 43,
        clickStatementDebug: 44,
        $accept: 0,
        $end: 1,
      },
      terminals_: {
        2: 'error',
        4: 'gantt',
        6: 'EOF',
        8: 'SPACE',
        10: 'NL',
        12: 'weekday_monday',
        13: 'weekday_tuesday',
        14: 'weekday_wednesday',
        15: 'weekday_thursday',
        16: 'weekday_friday',
        17: 'weekday_saturday',
        18: 'weekday_sunday',
        20: 'weekend_friday',
        21: 'weekend_saturday',
        22: 'dateFormat',
        23: 'inclusiveEndDates',
        24: 'topAxis',
        25: 'axisFormat',
        26: 'tickInterval',
        27: 'excludes',
        28: 'includes',
        29: 'todayMarker',
        30: 'title',
        31: 'acc_title',
        32: 'acc_title_value',
        33: 'acc_descr',
        34: 'acc_descr_value',
        35: 'acc_descr_multiline_value',
        36: 'section',
        38: 'taskTxt',
        39: 'taskData',
        40: 'click',
        41: 'callbackname',
        42: 'callbackargs',
        43: 'href',
      },
      productions_: [
        0,
        [3, 3],
        [5, 0],
        [5, 2],
        [7, 2],
        [7, 1],
        [7, 1],
        [7, 1],
        [11, 1],
        [11, 1],
        [11, 1],
        [11, 1],
        [11, 1],
        [11, 1],
        [11, 1],
        [19, 1],
        [19, 1],
        [9, 1],
        [9, 1],
        [9, 1],
        [9, 1],
        [9, 1],
        [9, 1],
        [9, 1],
        [9, 1],
        [9, 1],
        [9, 1],
        [9, 1],
        [9, 2],
        [9, 2],
        [9, 1],
        [9, 1],
        [9, 1],
        [9, 2],
        [37, 2],
        [37, 3],
        [37, 3],
        [37, 4],
        [37, 3],
        [37, 4],
        [37, 2],
        [44, 2],
        [44, 3],
        [44, 3],
        [44, 4],
        [44, 3],
        [44, 4],
        [44, 2],
      ],
      performAction: c(function (o, l, h, d, x, s, F) {
        var e = s.length - 1;
        switch (x) {
          case 1:
            return s[e - 1];
          case 2:
            this.$ = [];
            break;
          case 3:
            (s[e - 1].push(s[e]), (this.$ = s[e - 1]));
            break;
          case 4:
          case 5:
            this.$ = s[e];
            break;
          case 6:
          case 7:
            this.$ = [];
            break;
          case 8:
            d.setWeekday('monday');
            break;
          case 9:
            d.setWeekday('tuesday');
            break;
          case 10:
            d.setWeekday('wednesday');
            break;
          case 11:
            d.setWeekday('thursday');
            break;
          case 12:
            d.setWeekday('friday');
            break;
          case 13:
            d.setWeekday('saturday');
            break;
          case 14:
            d.setWeekday('sunday');
            break;
          case 15:
            d.setWeekend('friday');
            break;
          case 16:
            d.setWeekend('saturday');
            break;
          case 17:
            (d.setDateFormat(s[e].substr(11)), (this.$ = s[e].substr(11)));
            break;
          case 18:
            (d.enableInclusiveEndDates(), (this.$ = s[e].substr(18)));
            break;
          case 19:
            (d.TopAxis(), (this.$ = s[e].substr(8)));
            break;
          case 20:
            (d.setAxisFormat(s[e].substr(11)), (this.$ = s[e].substr(11)));
            break;
          case 21:
            (d.setTickInterval(s[e].substr(13)), (this.$ = s[e].substr(13)));
            break;
          case 22:
            (d.setExcludes(s[e].substr(9)), (this.$ = s[e].substr(9)));
            break;
          case 23:
            (d.setIncludes(s[e].substr(9)), (this.$ = s[e].substr(9)));
            break;
          case 24:
            (d.setTodayMarker(s[e].substr(12)), (this.$ = s[e].substr(12)));
            break;
          case 27:
            (d.setDiagramTitle(s[e].substr(6)), (this.$ = s[e].substr(6)));
            break;
          case 28:
            ((this.$ = s[e].trim()), d.setAccTitle(this.$));
            break;
          case 29:
          case 30:
            ((this.$ = s[e].trim()), d.setAccDescription(this.$));
            break;
          case 31:
            (d.addSection(s[e].substr(8)), (this.$ = s[e].substr(8)));
            break;
          case 33:
            (d.addTask(s[e - 1], s[e]), (this.$ = 'task'));
            break;
          case 34:
            ((this.$ = s[e - 1]), d.setClickEvent(s[e - 1], s[e], null));
            break;
          case 35:
            ((this.$ = s[e - 2]), d.setClickEvent(s[e - 2], s[e - 1], s[e]));
            break;
          case 36:
            ((this.$ = s[e - 2]),
              d.setClickEvent(s[e - 2], s[e - 1], null),
              d.setLink(s[e - 2], s[e]));
            break;
          case 37:
            ((this.$ = s[e - 3]),
              d.setClickEvent(s[e - 3], s[e - 2], s[e - 1]),
              d.setLink(s[e - 3], s[e]));
            break;
          case 38:
            ((this.$ = s[e - 2]),
              d.setClickEvent(s[e - 2], s[e], null),
              d.setLink(s[e - 2], s[e - 1]));
            break;
          case 39:
            ((this.$ = s[e - 3]),
              d.setClickEvent(s[e - 3], s[e - 1], s[e]),
              d.setLink(s[e - 3], s[e - 2]));
            break;
          case 40:
            ((this.$ = s[e - 1]), d.setLink(s[e - 1], s[e]));
            break;
          case 41:
          case 47:
            this.$ = s[e - 1] + ' ' + s[e];
            break;
          case 42:
          case 43:
          case 45:
            this.$ = s[e - 2] + ' ' + s[e - 1] + ' ' + s[e];
            break;
          case 44:
          case 46:
            this.$ = s[e - 3] + ' ' + s[e - 2] + ' ' + s[e - 1] + ' ' + s[e];
            break;
        }
      }, 'anonymous'),
      table: [
        { 3: 1, 4: [1, 2] },
        { 1: [3] },
        t(r, [2, 2], { 5: 3 }),
        {
          6: [1, 4],
          7: 5,
          8: [1, 6],
          9: 7,
          10: [1, 8],
          11: 17,
          12: n,
          13: i,
          14: a,
          15: k,
          16: T,
          17: C,
          18: Y,
          19: 18,
          20: A,
          21: D,
          22: $,
          23: L,
          24: O,
          25: W,
          26: _,
          27: J,
          28: B,
          29: Q,
          30: q,
          31: X,
          33: Z,
          35: I,
          36: v,
          37: 24,
          38: f,
          40: u,
        },
        t(r, [2, 7], { 1: [2, 1] }),
        t(r, [2, 3]),
        {
          9: 36,
          11: 17,
          12: n,
          13: i,
          14: a,
          15: k,
          16: T,
          17: C,
          18: Y,
          19: 18,
          20: A,
          21: D,
          22: $,
          23: L,
          24: O,
          25: W,
          26: _,
          27: J,
          28: B,
          29: Q,
          30: q,
          31: X,
          33: Z,
          35: I,
          36: v,
          37: 24,
          38: f,
          40: u,
        },
        t(r, [2, 5]),
        t(r, [2, 6]),
        t(r, [2, 17]),
        t(r, [2, 18]),
        t(r, [2, 19]),
        t(r, [2, 20]),
        t(r, [2, 21]),
        t(r, [2, 22]),
        t(r, [2, 23]),
        t(r, [2, 24]),
        t(r, [2, 25]),
        t(r, [2, 26]),
        t(r, [2, 27]),
        { 32: [1, 37] },
        { 34: [1, 38] },
        t(r, [2, 30]),
        t(r, [2, 31]),
        t(r, [2, 32]),
        { 39: [1, 39] },
        t(r, [2, 8]),
        t(r, [2, 9]),
        t(r, [2, 10]),
        t(r, [2, 11]),
        t(r, [2, 12]),
        t(r, [2, 13]),
        t(r, [2, 14]),
        t(r, [2, 15]),
        t(r, [2, 16]),
        { 41: [1, 40], 43: [1, 41] },
        t(r, [2, 4]),
        t(r, [2, 28]),
        t(r, [2, 29]),
        t(r, [2, 33]),
        t(r, [2, 34], { 42: [1, 42], 43: [1, 43] }),
        t(r, [2, 40], { 41: [1, 44] }),
        t(r, [2, 35], { 43: [1, 45] }),
        t(r, [2, 36]),
        t(r, [2, 38], { 42: [1, 46] }),
        t(r, [2, 37]),
        t(r, [2, 39]),
      ],
      defaultActions: {},
      parseError: c(function (o, l) {
        if (l.recoverable) this.trace(o);
        else {
          var h = new Error(o);
          throw ((h.hash = l), h);
        }
      }, 'parseError'),
      parse: c(function (o) {
        var l = this,
          h = [0],
          d = [],
          x = [null],
          s = [],
          F = this.table,
          e = '',
          b = 0,
          M = 0,
          E = 2,
          S = 1,
          V = s.slice.call(arguments, 1),
          w = Object.create(this.lexer),
          U = { yy: {} };
        for (var ct in this.yy)
          Object.prototype.hasOwnProperty.call(this.yy, ct) && (U.yy[ct] = this.yy[ct]);
        (w.setInput(o, U.yy),
          (U.yy.lexer = w),
          (U.yy.parser = this),
          typeof w.yylloc > 'u' && (w.yylloc = {}));
        var xt = w.yylloc;
        s.push(xt);
        var ce = w.options && w.options.ranges;
        typeof U.yy.parseError == 'function'
          ? (this.parseError = U.yy.parseError)
          : (this.parseError = Object.getPrototypeOf(this).parseError);
        function le(z) {
          ((h.length = h.length - 2 * z), (x.length = x.length - z), (s.length = s.length - z));
        }
        c(le, 'popStack');
        function Pt() {
          var z;
          return (
            (z = d.pop() || w.lex() || S),
            typeof z != 'number' &&
              (z instanceof Array && ((d = z), (z = d.pop())), (z = l.symbols_[z] || z)),
            z
          );
        }
        c(Pt, 'lex');
        for (var N, tt, H, bt, it = {}, ft, G, Vt, ht; ; ) {
          if (
            ((tt = h[h.length - 1]),
            this.defaultActions[tt]
              ? (H = this.defaultActions[tt])
              : ((N === null || typeof N > 'u') && (N = Pt()), (H = F[tt] && F[tt][N])),
            typeof H > 'u' || !H.length || !H[0])
          ) {
            var wt = '';
            ht = [];
            for (ft in F[tt])
              this.terminals_[ft] && ft > E && ht.push("'" + this.terminals_[ft] + "'");
            (w.showPosition
              ? (wt =
                  'Parse error on line ' +
                  (b + 1) +
                  `:
` +
                  w.showPosition() +
                  `
Expecting ` +
                  ht.join(', ') +
                  ", got '" +
                  (this.terminals_[N] || N) +
                  "'")
              : (wt =
                  'Parse error on line ' +
                  (b + 1) +
                  ': Unexpected ' +
                  (N == S ? 'end of input' : "'" + (this.terminals_[N] || N) + "'")),
              this.parseError(wt, {
                text: w.match,
                token: this.terminals_[N] || N,
                line: w.yylineno,
                loc: xt,
                expected: ht,
              }));
          }
          if (H[0] instanceof Array && H.length > 1)
            throw new Error(
              'Parse Error: multiple actions possible at state: ' + tt + ', token: ' + N,
            );
          switch (H[0]) {
            case 1:
              (h.push(N),
                x.push(w.yytext),
                s.push(w.yylloc),
                h.push(H[1]),
                (N = null),
                (M = w.yyleng),
                (e = w.yytext),
                (b = w.yylineno),
                (xt = w.yylloc));
              break;
            case 2:
              if (
                ((G = this.productions_[H[1]][1]),
                (it.$ = x[x.length - G]),
                (it._$ = {
                  first_line: s[s.length - (G || 1)].first_line,
                  last_line: s[s.length - 1].last_line,
                  first_column: s[s.length - (G || 1)].first_column,
                  last_column: s[s.length - 1].last_column,
                }),
                ce && (it._$.range = [s[s.length - (G || 1)].range[0], s[s.length - 1].range[1]]),
                (bt = this.performAction.apply(it, [e, M, b, U.yy, H[1], x, s].concat(V))),
                typeof bt < 'u')
              )
                return bt;
              (G &&
                ((h = h.slice(0, -1 * G * 2)), (x = x.slice(0, -1 * G)), (s = s.slice(0, -1 * G))),
                h.push(this.productions_[H[1]][0]),
                x.push(it.$),
                s.push(it._$),
                (Vt = F[h[h.length - 2]][h[h.length - 1]]),
                h.push(Vt));
              break;
            case 3:
              return !0;
          }
        }
        return !0;
      }, 'parse'),
    },
    g = (function () {
      var m = {
        EOF: 1,
        parseError: c(function (l, h) {
          if (this.yy.parser) this.yy.parser.parseError(l, h);
          else throw new Error(l);
        }, 'parseError'),
        setInput: c(function (o, l) {
          return (
            (this.yy = l || this.yy || {}),
            (this._input = o),
            (this._more = this._backtrack = this.done = !1),
            (this.yylineno = this.yyleng = 0),
            (this.yytext = this.matched = this.match = ''),
            (this.conditionStack = ['INITIAL']),
            (this.yylloc = { first_line: 1, first_column: 0, last_line: 1, last_column: 0 }),
            this.options.ranges && (this.yylloc.range = [0, 0]),
            (this.offset = 0),
            this
          );
        }, 'setInput'),
        input: c(function () {
          var o = this._input[0];
          ((this.yytext += o),
            this.yyleng++,
            this.offset++,
            (this.match += o),
            (this.matched += o));
          var l = o.match(/(?:\r\n?|\n).*/g);
          return (
            l ? (this.yylineno++, this.yylloc.last_line++) : this.yylloc.last_column++,
            this.options.ranges && this.yylloc.range[1]++,
            (this._input = this._input.slice(1)),
            o
          );
        }, 'input'),
        unput: c(function (o) {
          var l = o.length,
            h = o.split(/(?:\r\n?|\n)/g);
          ((this._input = o + this._input),
            (this.yytext = this.yytext.substr(0, this.yytext.length - l)),
            (this.offset -= l));
          var d = this.match.split(/(?:\r\n?|\n)/g);
          ((this.match = this.match.substr(0, this.match.length - 1)),
            (this.matched = this.matched.substr(0, this.matched.length - 1)),
            h.length - 1 && (this.yylineno -= h.length - 1));
          var x = this.yylloc.range;
          return (
            (this.yylloc = {
              first_line: this.yylloc.first_line,
              last_line: this.yylineno + 1,
              first_column: this.yylloc.first_column,
              last_column: h
                ? (h.length === d.length ? this.yylloc.first_column : 0) +
                  d[d.length - h.length].length -
                  h[0].length
                : this.yylloc.first_column - l,
            }),
            this.options.ranges && (this.yylloc.range = [x[0], x[0] + this.yyleng - l]),
            (this.yyleng = this.yytext.length),
            this
          );
        }, 'unput'),
        more: c(function () {
          return ((this._more = !0), this);
        }, 'more'),
        reject: c(function () {
          if (this.options.backtrack_lexer) this._backtrack = !0;
          else
            return this.parseError(
              'Lexical error on line ' +
                (this.yylineno + 1) +
                `. You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).
` +
                this.showPosition(),
              { text: '', token: null, line: this.yylineno },
            );
          return this;
        }, 'reject'),
        less: c(function (o) {
          this.unput(this.match.slice(o));
        }, 'less'),
        pastInput: c(function () {
          var o = this.matched.substr(0, this.matched.length - this.match.length);
          return (o.length > 20 ? '...' : '') + o.substr(-20).replace(/\n/g, '');
        }, 'pastInput'),
        upcomingInput: c(function () {
          var o = this.match;
          return (
            o.length < 20 && (o += this._input.substr(0, 20 - o.length)),
            (o.substr(0, 20) + (o.length > 20 ? '...' : '')).replace(/\n/g, '')
          );
        }, 'upcomingInput'),
        showPosition: c(function () {
          var o = this.pastInput(),
            l = new Array(o.length + 1).join('-');
          return (
            o +
            this.upcomingInput() +
            `
` +
            l +
            '^'
          );
        }, 'showPosition'),
        test_match: c(function (o, l) {
          var h, d, x;
          if (
            (this.options.backtrack_lexer &&
              ((x = {
                yylineno: this.yylineno,
                yylloc: {
                  first_line: this.yylloc.first_line,
                  last_line: this.last_line,
                  first_column: this.yylloc.first_column,
                  last_column: this.yylloc.last_column,
                },
                yytext: this.yytext,
                match: this.match,
                matches: this.matches,
                matched: this.matched,
                yyleng: this.yyleng,
                offset: this.offset,
                _more: this._more,
                _input: this._input,
                yy: this.yy,
                conditionStack: this.conditionStack.slice(0),
                done: this.done,
              }),
              this.options.ranges && (x.yylloc.range = this.yylloc.range.slice(0))),
            (d = o[0].match(/(?:\r\n?|\n).*/g)),
            d && (this.yylineno += d.length),
            (this.yylloc = {
              first_line: this.yylloc.last_line,
              last_line: this.yylineno + 1,
              first_column: this.yylloc.last_column,
              last_column: d
                ? d[d.length - 1].length - d[d.length - 1].match(/\r?\n?/)[0].length
                : this.yylloc.last_column + o[0].length,
            }),
            (this.yytext += o[0]),
            (this.match += o[0]),
            (this.matches = o),
            (this.yyleng = this.yytext.length),
            this.options.ranges &&
              (this.yylloc.range = [this.offset, (this.offset += this.yyleng)]),
            (this._more = !1),
            (this._backtrack = !1),
            (this._input = this._input.slice(o[0].length)),
            (this.matched += o[0]),
            (h = this.performAction.call(
              this,
              this.yy,
              this,
              l,
              this.conditionStack[this.conditionStack.length - 1],
            )),
            this.done && this._input && (this.done = !1),
            h)
          )
            return h;
          if (this._backtrack) {
            for (var s in x) this[s] = x[s];
            return !1;
          }
          return !1;
        }, 'test_match'),
        next: c(function () {
          if (this.done) return this.EOF;
          this._input || (this.done = !0);
          var o, l, h, d;
          this._more || ((this.yytext = ''), (this.match = ''));
          for (var x = this._currentRules(), s = 0; s < x.length; s++)
            if (
              ((h = this._input.match(this.rules[x[s]])), h && (!l || h[0].length > l[0].length))
            ) {
              if (((l = h), (d = s), this.options.backtrack_lexer)) {
                if (((o = this.test_match(h, x[s])), o !== !1)) return o;
                if (this._backtrack) {
                  l = !1;
                  continue;
                } else return !1;
              } else if (!this.options.flex) break;
            }
          return l
            ? ((o = this.test_match(l, x[d])), o !== !1 ? o : !1)
            : this._input === ''
              ? this.EOF
              : this.parseError(
                  'Lexical error on line ' +
                    (this.yylineno + 1) +
                    `. Unrecognized text.
` +
                    this.showPosition(),
                  { text: '', token: null, line: this.yylineno },
                );
        }, 'next'),
        lex: c(function () {
          var l = this.next();
          return l || this.lex();
        }, 'lex'),
        begin: c(function (l) {
          this.conditionStack.push(l);
        }, 'begin'),
        popState: c(function () {
          var l = this.conditionStack.length - 1;
          return l > 0 ? this.conditionStack.pop() : this.conditionStack[0];
        }, 'popState'),
        _currentRules: c(function () {
          return this.conditionStack.length && this.conditionStack[this.conditionStack.length - 1]
            ? this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules
            : this.conditions.INITIAL.rules;
        }, '_currentRules'),
        topState: c(function (l) {
          return (
            (l = this.conditionStack.length - 1 - Math.abs(l || 0)),
            l >= 0 ? this.conditionStack[l] : 'INITIAL'
          );
        }, 'topState'),
        pushState: c(function (l) {
          this.begin(l);
        }, 'pushState'),
        stateStackSize: c(function () {
          return this.conditionStack.length;
        }, 'stateStackSize'),
        options: { 'case-insensitive': !0 },
        performAction: c(function (l, h, d, x) {
          switch (d) {
            case 0:
              return (this.begin('open_directive'), 'open_directive');
            case 1:
              return (this.begin('acc_title'), 31);
            case 2:
              return (this.popState(), 'acc_title_value');
            case 3:
              return (this.begin('acc_descr'), 33);
            case 4:
              return (this.popState(), 'acc_descr_value');
            case 5:
              this.begin('acc_descr_multiline');
              break;
            case 6:
              this.popState();
              break;
            case 7:
              return 'acc_descr_multiline_value';
            case 8:
              break;
            case 9:
              break;
            case 10:
              break;
            case 11:
              return 10;
            case 12:
              break;
            case 13:
              break;
            case 14:
              this.begin('href');
              break;
            case 15:
              this.popState();
              break;
            case 16:
              return 43;
            case 17:
              this.begin('callbackname');
              break;
            case 18:
              this.popState();
              break;
            case 19:
              (this.popState(), this.begin('callbackargs'));
              break;
            case 20:
              return 41;
            case 21:
              this.popState();
              break;
            case 22:
              return 42;
            case 23:
              this.begin('click');
              break;
            case 24:
              this.popState();
              break;
            case 25:
              return 40;
            case 26:
              return 4;
            case 27:
              return 22;
            case 28:
              return 23;
            case 29:
              return 24;
            case 30:
              return 25;
            case 31:
              return 26;
            case 32:
              return 28;
            case 33:
              return 27;
            case 34:
              return 29;
            case 35:
              return 12;
            case 36:
              return 13;
            case 37:
              return 14;
            case 38:
              return 15;
            case 39:
              return 16;
            case 40:
              return 17;
            case 41:
              return 18;
            case 42:
              return 20;
            case 43:
              return 21;
            case 44:
              return 'date';
            case 45:
              return 30;
            case 46:
              return 'accDescription';
            case 47:
              return 36;
            case 48:
              return 38;
            case 49:
              return 39;
            case 50:
              return ':';
            case 51:
              return 6;
            case 52:
              return 'INVALID';
          }
        }, 'anonymous'),
        rules: [
          /^(?:%%\{)/i,
          /^(?:accTitle\s*:\s*)/i,
          /^(?:(?!\n||)*[^\n]*)/i,
          /^(?:accDescr\s*:\s*)/i,
          /^(?:(?!\n||)*[^\n]*)/i,
          /^(?:accDescr\s*\{\s*)/i,
          /^(?:[\}])/i,
          /^(?:[^\}]*)/i,
          /^(?:%%(?!\{)*[^\n]*)/i,
          /^(?:[^\}]%%*[^\n]*)/i,
          /^(?:%%*[^\n]*[\n]*)/i,
          /^(?:[\n]+)/i,
          /^(?:\s+)/i,
          /^(?:%[^\n]*)/i,
          /^(?:href[\s]+["])/i,
          /^(?:["])/i,
          /^(?:[^"]*)/i,
          /^(?:call[\s]+)/i,
          /^(?:\([\s]*\))/i,
          /^(?:\()/i,
          /^(?:[^(]*)/i,
          /^(?:\))/i,
          /^(?:[^)]*)/i,
          /^(?:click[\s]+)/i,
          /^(?:[\s\n])/i,
          /^(?:[^\s\n]*)/i,
          /^(?:gantt\b)/i,
          /^(?:dateFormat\s[^#\n;]+)/i,
          /^(?:inclusiveEndDates\b)/i,
          /^(?:topAxis\b)/i,
          /^(?:axisFormat\s[^#\n;]+)/i,
          /^(?:tickInterval\s[^#\n;]+)/i,
          /^(?:includes\s[^#\n;]+)/i,
          /^(?:excludes\s[^#\n;]+)/i,
          /^(?:todayMarker\s[^\n;]+)/i,
          /^(?:weekday\s+monday\b)/i,
          /^(?:weekday\s+tuesday\b)/i,
          /^(?:weekday\s+wednesday\b)/i,
          /^(?:weekday\s+thursday\b)/i,
          /^(?:weekday\s+friday\b)/i,
          /^(?:weekday\s+saturday\b)/i,
          /^(?:weekday\s+sunday\b)/i,
          /^(?:weekend\s+friday\b)/i,
          /^(?:weekend\s+saturday\b)/i,
          /^(?:\d\d\d\d-\d\d-\d\d\b)/i,
          /^(?:title\s[^\n]+)/i,
          /^(?:accDescription\s[^#\n;]+)/i,
          /^(?:section\s[^\n]+)/i,
          /^(?:[^:\n]+)/i,
          /^(?::[^#\n;]+)/i,
          /^(?::)/i,
          /^(?:$)/i,
          /^(?:.)/i,
        ],
        conditions: {
          acc_descr_multiline: { rules: [6, 7], inclusive: !1 },
          acc_descr: { rules: [4], inclusive: !1 },
          acc_title: { rules: [2], inclusive: !1 },
          callbackargs: { rules: [21, 22], inclusive: !1 },
          callbackname: { rules: [18, 19, 20], inclusive: !1 },
          href: { rules: [15, 16], inclusive: !1 },
          click: { rules: [24, 25], inclusive: !1 },
          INITIAL: {
            rules: [
              0, 1, 3, 5, 8, 9, 10, 11, 12, 13, 14, 17, 23, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35,
              36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52,
            ],
            inclusive: !0,
          },
        },
      };
      return m;
    })();
  y.lexer = g;
  function p() {
    this.yy = {};
  }
  return (c(p, 'Parser'), (p.prototype = y), (y.Parser = p), new p());
})();
Dt.parser = Dt;
var He = Dt;
P.extend(Ve);
P.extend(Oe);
P.extend(We);
var Kt = { friday: 5, saturday: 6 },
  j = '',
  It = '',
  Mt = void 0,
  At = '',
  lt = [],
  ut = [],
  Ft = new Map(),
  $t = [],
  vt = [],
  ot = '',
  Lt = '',
  te = ['active', 'done', 'crit', 'milestone', 'vert'],
  Ot = [],
  rt = '',
  dt = !1,
  Wt = !1,
  Yt = 'sunday',
  Tt = 'saturday',
  Ct = 0,
  je = c(function () {
    (($t = []),
      (vt = []),
      (ot = ''),
      (Ot = []),
      (gt = 0),
      (Et = void 0),
      (pt = void 0),
      (R = []),
      (j = ''),
      (It = ''),
      (Lt = ''),
      (Mt = void 0),
      (At = ''),
      (lt = []),
      (ut = []),
      (dt = !1),
      (Wt = !1),
      (Ct = 0),
      (Ft = new Map()),
      (rt = ''),
      pe(),
      (Yt = 'sunday'),
      (Tt = 'saturday'));
  }, 'clear'),
  Xe = c(function (t) {
    rt = t;
  }, 'setDiagramId'),
  Ue = c(function (t) {
    It = t;
  }, 'setAxisFormat'),
  Ge = c(function () {
    return It;
  }, 'getAxisFormat'),
  Ke = c(function (t) {
    Mt = t;
  }, 'setTickInterval'),
  Je = c(function () {
    return Mt;
  }, 'getTickInterval'),
  Ze = c(function (t) {
    At = t;
  }, 'setTodayMarker'),
  Qe = c(function () {
    return At;
  }, 'getTodayMarker'),
  ts = c(function (t) {
    j = t;
  }, 'setDateFormat'),
  es = c(function () {
    dt = !0;
  }, 'enableInclusiveEndDates'),
  ss = c(function () {
    return dt;
  }, 'endDatesAreInclusive'),
  is = c(function () {
    Wt = !0;
  }, 'enableTopAxis'),
  rs = c(function () {
    return Wt;
  }, 'topAxisEnabled'),
  ns = c(function (t) {
    Lt = t;
  }, 'setDisplayMode'),
  as = c(function () {
    return Lt;
  }, 'getDisplayMode'),
  os = c(function () {
    return j;
  }, 'getDateFormat'),
  cs = c(function (t) {
    lt = t.toLowerCase().split(/[\s,]+/);
  }, 'setIncludes'),
  ls = c(function () {
    return lt;
  }, 'getIncludes'),
  us = c(function (t) {
    ut = t.toLowerCase().split(/[\s,]+/);
  }, 'setExcludes'),
  ds = c(function () {
    return ut;
  }, 'getExcludes'),
  fs = c(function () {
    return Ft;
  }, 'getLinks'),
  hs = c(function (t) {
    ((ot = t), $t.push(t));
  }, 'addSection'),
  ms = c(function () {
    return $t;
  }, 'getSections'),
  ks = c(function () {
    let t = Jt();
    const r = 10;
    let n = 0;
    for (; !t && n < r; ) ((t = Jt()), n++);
    return ((vt = R), vt);
  }, 'getTasks'),
  ee = c(function (t, r, n, i) {
    const a = t.format(r.trim()),
      k = t.format('YYYY-MM-DD');
    return i.includes(a) || i.includes(k)
      ? !1
      : (n.includes('weekends') && (t.isoWeekday() === Kt[Tt] || t.isoWeekday() === Kt[Tt] + 1)) ||
          n.includes(t.format('dddd').toLowerCase())
        ? !0
        : n.includes(a) || n.includes(k);
  }, 'isInvalidDate'),
  ys = c(function (t) {
    Yt = t;
  }, 'setWeekday'),
  gs = c(function () {
    return Yt;
  }, 'getWeekday'),
  ps = c(function (t) {
    Tt = t;
  }, 'setWeekend'),
  se = c(function (t, r, n, i) {
    if (!n.length || t.manualEndTime) return;
    let a;
    (t.startTime instanceof Date ? (a = P(t.startTime)) : (a = P(t.startTime, r, !0)),
      (a = a.add(1, 'd')));
    let k;
    t.endTime instanceof Date ? (k = P(t.endTime)) : (k = P(t.endTime, r, !0));
    const [T, C] = vs(a, k, r, n, i);
    ((t.endTime = T.toDate()), (t.renderEndTime = C));
  }, 'checkTaskDates'),
  vs = c(function (t, r, n, i, a) {
    let k = !1,
      T = null;
    const C = r.add(1e4, 'd');
    for (; t <= r; ) {
      if ((k || (T = r.toDate()), (k = ee(t, n, i, a)), k && ((r = r.add(1, 'd')), r > C)))
        throw new Error(
          'Failed to find a valid date that was not excluded by `excludes` after 10,000 iterations.',
        );
      t = t.add(1, 'd');
    }
    return [r, T];
  }, 'fixTaskDates'),
  St = c(function (t, r, n) {
    if (
      ((n = n.trim()),
      c((C) => {
        const Y = C.trim();
        return Y === 'x' || Y === 'X';
      }, 'isTimestampFormat')(r) && /^\d+$/.test(n))
    )
      return new Date(Number(n));
    const k = /^after\s+(?<ids>[\d\w- ]+)/.exec(n);
    if (k !== null) {
      let C = null;
      for (const A of k.groups.ids.split(' ')) {
        let D = st(A);
        D !== void 0 && (!C || D.endTime > C.endTime) && (C = D);
      }
      if (C) return C.endTime;
      const Y = new Date();
      return (Y.setHours(0, 0, 0, 0), Y);
    }
    let T = P(n, r.trim(), !0);
    if (T.isValid()) return T.toDate();
    {
      (et.debug('Invalid date:' + n), et.debug('With date format:' + r.trim()));
      const C = new Date(n);
      if (C === void 0 || isNaN(C.getTime()) || C.getFullYear() < -1e4 || C.getFullYear() > 1e4)
        throw new Error('Invalid date:' + n);
      return C;
    }
  }, 'getStartDate'),
  ie = c(function (t) {
    const r = /^(\d+(?:\.\d+)?)([Mdhmswy]|ms)$/.exec(t.trim());
    return r !== null ? [Number.parseFloat(r[1]), r[2]] : [NaN, 'ms'];
  }, 'parseDuration'),
  re = c(function (t, r, n, i = !1) {
    n = n.trim();
    const k = /^until\s+(?<ids>[\d\w- ]+)/.exec(n);
    if (k !== null) {
      let D = null;
      for (const L of k.groups.ids.split(' ')) {
        let O = st(L);
        O !== void 0 && (!D || O.startTime < D.startTime) && (D = O);
      }
      if (D) return D.startTime;
      const $ = new Date();
      return ($.setHours(0, 0, 0, 0), $);
    }
    let T = P(n, r.trim(), !0);
    if (T.isValid()) return (i && (T = T.add(1, 'd')), T.toDate());
    let C = P(t);
    const [Y, A] = ie(n);
    if (!Number.isNaN(Y)) {
      const D = C.add(Y, A);
      D.isValid() && (C = D);
    }
    return C.toDate();
  }, 'getEndDate'),
  gt = 0,
  at = c(function (t) {
    return t === void 0 ? ((gt = gt + 1), 'task' + gt) : t;
  }, 'parseId'),
  Ts = c(function (t, r) {
    let n;
    r.substr(0, 1) === ':' ? (n = r.substr(1, r.length)) : (n = r);
    const i = n.split(','),
      a = {};
    Rt(i, a, te);
    for (let T = 0; T < i.length; T++) i[T] = i[T].trim();
    let k = '';
    switch (i.length) {
      case 1:
        ((a.id = at()), (a.startTime = t.endTime), (k = i[0]));
        break;
      case 2:
        ((a.id = at()), (a.startTime = St(void 0, j, i[0])), (k = i[1]));
        break;
      case 3:
        ((a.id = at(i[0])), (a.startTime = St(void 0, j, i[1])), (k = i[2]));
        break;
    }
    return (
      k &&
        ((a.endTime = re(a.startTime, j, k, dt)),
        (a.manualEndTime = P(k, 'YYYY-MM-DD', !0).isValid()),
        se(a, j, ut, lt)),
      a
    );
  }, 'compileData'),
  xs = c(function (t, r) {
    let n;
    r.substr(0, 1) === ':' ? (n = r.substr(1, r.length)) : (n = r);
    const i = n.split(','),
      a = {};
    Rt(i, a, te);
    for (let k = 0; k < i.length; k++) i[k] = i[k].trim();
    switch (i.length) {
      case 1:
        ((a.id = at()),
          (a.startTime = { type: 'prevTaskEnd', id: t }),
          (a.endTime = { data: i[0] }));
        break;
      case 2:
        ((a.id = at()),
          (a.startTime = { type: 'getStartDate', startData: i[0] }),
          (a.endTime = { data: i[1] }));
        break;
      case 3:
        ((a.id = at(i[0])),
          (a.startTime = { type: 'getStartDate', startData: i[1] }),
          (a.endTime = { data: i[2] }));
        break;
    }
    return a;
  }, 'parseData'),
  Et,
  pt,
  R = [],
  ne = {},
  bs = c(function (t, r) {
    const n = {
        section: ot,
        type: ot,
        processed: !1,
        manualEndTime: !1,
        renderEndTime: null,
        raw: { data: r },
        task: t,
        classes: [],
      },
      i = xs(pt, r);
    ((n.raw.startTime = i.startTime),
      (n.raw.endTime = i.endTime),
      (n.id = i.id),
      (n.prevTaskId = pt),
      (n.active = i.active),
      (n.done = i.done),
      (n.crit = i.crit),
      (n.milestone = i.milestone),
      (n.vert = i.vert),
      (n.order = Ct),
      Ct++);
    const a = R.push(n);
    ((pt = n.id), (ne[n.id] = a - 1));
  }, 'addTask'),
  st = c(function (t) {
    const r = ne[t];
    return R[r];
  }, 'findTaskById'),
  ws = c(function (t, r) {
    const n = { section: ot, type: ot, description: t, task: t, classes: [] },
      i = Ts(Et, r);
    ((n.startTime = i.startTime),
      (n.endTime = i.endTime),
      (n.id = i.id),
      (n.active = i.active),
      (n.done = i.done),
      (n.crit = i.crit),
      (n.milestone = i.milestone),
      (n.vert = i.vert),
      (Et = n),
      vt.push(n));
  }, 'addTaskOrg'),
  Jt = c(function () {
    const t = c(function (n) {
      const i = R[n];
      let a = '';
      switch (R[n].raw.startTime.type) {
        case 'prevTaskEnd': {
          const k = st(i.prevTaskId);
          i.startTime = k.endTime;
          break;
        }
        case 'getStartDate':
          ((a = St(void 0, j, R[n].raw.startTime.startData)), a && (R[n].startTime = a));
          break;
      }
      return (
        R[n].startTime &&
          ((R[n].endTime = re(R[n].startTime, j, R[n].raw.endTime.data, dt)),
          R[n].endTime &&
            ((R[n].processed = !0),
            (R[n].manualEndTime = P(R[n].raw.endTime.data, 'YYYY-MM-DD', !0).isValid()),
            se(R[n], j, ut, lt))),
        R[n].processed
      );
    }, 'compileTask');
    let r = !0;
    for (const [n, i] of R.entries()) (t(n), (r = r && i.processed));
    return r;
  }, 'compileTasks'),
  _s = c(function (t, r) {
    let n = r;
    (nt().securityLevel !== 'loose' && (n = Le.sanitizeUrl(r)),
      t.split(',').forEach(function (i) {
        st(i) !== void 0 &&
          (oe(i, () => {
            window.open(n, '_self');
          }),
          Ft.set(i, n));
      }),
      ae(t, 'clickable'));
  }, 'setLink'),
  ae = c(function (t, r) {
    t.split(',').forEach(function (n) {
      let i = st(n);
      i !== void 0 && i.classes.push(r);
    });
  }, 'setClass'),
  Ds = c(function (t, r, n) {
    if (nt().securityLevel !== 'loose' || r === void 0) return;
    let i = [];
    if (typeof n == 'string') {
      i = n.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
      for (let k = 0; k < i.length; k++) {
        let T = i[k].trim();
        (T.startsWith('"') && T.endsWith('"') && (T = T.substr(1, T.length - 2)), (i[k] = T));
      }
    }
    (i.length === 0 && i.push(t),
      st(t) !== void 0 &&
        oe(t, () => {
          ve.runFunc(r, ...i);
        }));
  }, 'setClickFun'),
  oe = c(function (t, r) {
    Ot.push(
      function () {
        const n = rt ? `${rt}-${t}` : t,
          i = document.querySelector(`[id="${n}"]`);
        i !== null &&
          i.addEventListener('click', function () {
            r();
          });
      },
      function () {
        const n = rt ? `${rt}-${t}` : t,
          i = document.querySelector(`[id="${n}-text"]`);
        i !== null &&
          i.addEventListener('click', function () {
            r();
          });
      },
    );
  }, 'pushFun'),
  Cs = c(function (t, r, n) {
    (t.split(',').forEach(function (i) {
      Ds(i, r, n);
    }),
      ae(t, 'clickable'));
  }, 'setClickEvent'),
  Ss = c(function (t) {
    Ot.forEach(function (r) {
      r(t);
    });
  }, 'bindFunctions'),
  Es = {
    getConfig: c(() => nt().gantt, 'getConfig'),
    clear: je,
    setDateFormat: ts,
    getDateFormat: os,
    enableInclusiveEndDates: es,
    endDatesAreInclusive: ss,
    enableTopAxis: is,
    topAxisEnabled: rs,
    setAxisFormat: Ue,
    getAxisFormat: Ge,
    setTickInterval: Ke,
    getTickInterval: Je,
    setTodayMarker: Ze,
    getTodayMarker: Qe,
    setAccTitle: ke,
    getAccTitle: me,
    setDiagramTitle: he,
    getDiagramTitle: fe,
    setDiagramId: Xe,
    setDisplayMode: ns,
    getDisplayMode: as,
    setAccDescription: de,
    getAccDescription: ue,
    addSection: hs,
    getSections: ms,
    getTasks: ks,
    addTask: bs,
    findTaskById: st,
    addTaskOrg: ws,
    setIncludes: cs,
    getIncludes: ls,
    setExcludes: us,
    getExcludes: ds,
    setClickEvent: Cs,
    setLink: _s,
    getLinks: fs,
    bindFunctions: Ss,
    parseDuration: ie,
    isInvalidDate: ee,
    setWeekday: ys,
    getWeekday: gs,
    setWeekend: ps,
  };
function Rt(t, r, n) {
  let i = !0;
  for (; i; )
    ((i = !1),
      n.forEach(function (a) {
        const k = '^\\s*' + a + '\\s*$',
          T = new RegExp(k);
        t[0].match(T) && ((r[a] = !0), t.shift(1), (i = !0));
      }));
}
c(Rt, 'getTaskTags');
P.extend(qe);
var Is = c(function () {
    et.debug('Something is calling, setConf, remove the call');
  }, 'setConf'),
  Zt = {
    monday: Fe,
    tuesday: Ae,
    wednesday: Me,
    thursday: Ie,
    friday: Ee,
    saturday: Se,
    sunday: Ce,
  },
  Ms = c((t, r) => {
    let n = [...t].map(() => -1 / 0),
      i = [...t].sort((k, T) => k.startTime - T.startTime || k.order - T.order),
      a = 0;
    for (const k of i)
      for (let T = 0; T < n.length; T++)
        if (k.startTime >= n[T]) {
          ((n[T] = k.endTime), (k.order = T + r), T > a && (a = T));
          break;
        }
    return a;
  }, 'getMaxIntersections'),
  K,
  _t = 1e4,
  As = c(function (t, r, n, i) {
    const a = nt().gantt;
    i.db.setDiagramId(r);
    const k = nt().securityLevel;
    let T;
    k === 'sandbox' && (T = mt('#i' + r));
    const C = k === 'sandbox' ? mt(T.nodes()[0].contentDocument.body) : mt('body'),
      Y = k === 'sandbox' ? T.nodes()[0].contentDocument : document,
      A = Y.getElementById(r);
    ((K = A.parentElement.offsetWidth),
      K === void 0 && (K = 1200),
      a.useWidth !== void 0 && (K = a.useWidth));
    const D = i.db.getTasks();
    let $ = [];
    for (const u of D) $.push(u.type);
    $ = f($);
    const L = {};
    let O = 2 * a.topPadding;
    if (i.db.getDisplayMode() === 'compact' || a.displayMode === 'compact') {
      const u = {};
      for (const g of D) u[g.section] === void 0 ? (u[g.section] = [g]) : u[g.section].push(g);
      let y = 0;
      for (const g of Object.keys(u)) {
        const p = Ms(u[g], y) + 1;
        ((y += p), (O += p * (a.barHeight + a.barGap)), (L[g] = p));
      }
    } else {
      O += D.length * (a.barHeight + a.barGap);
      for (const u of $) L[u] = D.filter((y) => y.type === u).length;
    }
    A.setAttribute('viewBox', '0 0 ' + K + ' ' + O);
    const W = C.select(`[id="${r}"]`),
      _ = Te()
        .domain([
          xe(D, function (u) {
            return u.startTime;
          }),
          be(D, function (u) {
            return u.endTime;
          }),
        ])
        .rangeRound([0, K - a.leftPadding - a.rightPadding]);
    function J(u, y) {
      const g = u.startTime,
        p = y.startTime;
      let m = 0;
      return (g > p ? (m = 1) : g < p && (m = -1), m);
    }
    (c(J, 'taskCompare'),
      D.sort(J),
      B(D, K, O),
      ye(W, O, K, a.useMaxWidth),
      W.append('text')
        .text(i.db.getDiagramTitle())
        .attr('x', K / 2)
        .attr('y', a.titleTopMargin)
        .attr('class', 'titleText'));
    function B(u, y, g) {
      const p = a.barHeight,
        m = p + a.barGap,
        o = a.topPadding,
        l = a.leftPadding,
        h = we().domain([0, $.length]).range(['#00B9FA', '#F95002']).interpolate(_e);
      (q(m, o, l, y, g, u, i.db.getExcludes(), i.db.getIncludes()),
        Z(l, o, y, g),
        Q(u, m, o, l, p, h, y),
        I(m, o),
        v(l, o, y, g));
    }
    c(B, 'makeGantt');
    function Q(u, y, g, p, m, o, l) {
      u.sort((e, b) => (e.vert === b.vert ? 0 : e.vert ? 1 : -1));
      const d = [...new Set(u.map((e) => e.order))].map((e) => u.find((b) => b.order === e));
      W.append('g')
        .selectAll('rect')
        .data(d)
        .enter()
        .append('rect')
        .attr('x', 0)
        .attr('y', function (e, b) {
          return ((b = e.order), b * y + g - 2);
        })
        .attr('width', function () {
          return l - a.rightPadding / 2;
        })
        .attr('height', y)
        .attr('class', function (e) {
          for (const [b, M] of $.entries())
            if (e.type === M) return 'section section' + (b % a.numberSectionStyles);
          return 'section section0';
        })
        .enter();
      const x = W.append('g').selectAll('rect').data(u).enter(),
        s = i.db.getLinks();
      if (
        (x
          .append('rect')
          .attr('id', function (e) {
            return r + '-' + e.id;
          })
          .attr('rx', 3)
          .attr('ry', 3)
          .attr('x', function (e) {
            return e.milestone
              ? _(e.startTime) + p + 0.5 * (_(e.endTime) - _(e.startTime)) - 0.5 * m
              : _(e.startTime) + p;
          })
          .attr('y', function (e, b) {
            return ((b = e.order), e.vert ? a.gridLineStartPadding : b * y + g);
          })
          .attr('width', function (e) {
            return e.milestone
              ? m
              : e.vert
                ? 0.08 * m
                : _(e.renderEndTime || e.endTime) - _(e.startTime);
          })
          .attr('height', function (e) {
            return e.vert ? D.length * (a.barHeight + a.barGap) + a.barHeight * 2 : m;
          })
          .attr('transform-origin', function (e, b) {
            return (
              (b = e.order),
              (_(e.startTime) + p + 0.5 * (_(e.endTime) - _(e.startTime))).toString() +
                'px ' +
                (b * y + g + 0.5 * m).toString() +
                'px'
            );
          })
          .attr('class', function (e) {
            const b = 'task';
            let M = '';
            e.classes.length > 0 && (M = e.classes.join(' '));
            let E = 0;
            for (const [V, w] of $.entries()) e.type === w && (E = V % a.numberSectionStyles);
            let S = '';
            return (
              e.active
                ? e.crit
                  ? (S += ' activeCrit')
                  : (S = ' active')
                : e.done
                  ? e.crit
                    ? (S = ' doneCrit')
                    : (S = ' done')
                  : e.crit && (S += ' crit'),
              S.length === 0 && (S = ' task'),
              e.milestone && (S = ' milestone ' + S),
              e.vert && (S = ' vert ' + S),
              (S += E),
              (S += ' ' + M),
              b + S
            );
          }),
        x
          .append('text')
          .attr('id', function (e) {
            return r + '-' + e.id + '-text';
          })
          .text(function (e) {
            return e.task;
          })
          .attr('font-size', a.fontSize)
          .attr('x', function (e) {
            let b = _(e.startTime),
              M = _(e.renderEndTime || e.endTime);
            if (
              (e.milestone && ((b += 0.5 * (_(e.endTime) - _(e.startTime)) - 0.5 * m), (M = b + m)),
              e.vert)
            )
              return _(e.startTime) + p;
            const E = this.getBBox().width;
            return E > M - b
              ? M + E + 1.5 * a.leftPadding > l
                ? b + p - 5
                : M + p + 5
              : (M - b) / 2 + b + p;
          })
          .attr('y', function (e, b) {
            return e.vert
              ? a.gridLineStartPadding + D.length * (a.barHeight + a.barGap) + 60
              : ((b = e.order), b * y + a.barHeight / 2 + (a.fontSize / 2 - 2) + g);
          })
          .attr('text-height', m)
          .attr('class', function (e) {
            const b = _(e.startTime);
            let M = _(e.endTime);
            e.milestone && (M = b + m);
            const E = this.getBBox().width;
            let S = '';
            e.classes.length > 0 && (S = e.classes.join(' '));
            let V = 0;
            for (const [U, ct] of $.entries()) e.type === ct && (V = U % a.numberSectionStyles);
            let w = '';
            return (
              e.active && (e.crit ? (w = 'activeCritText' + V) : (w = 'activeText' + V)),
              e.done
                ? e.crit
                  ? (w = w + ' doneCritText' + V)
                  : (w = w + ' doneText' + V)
                : e.crit && (w = w + ' critText' + V),
              e.milestone && (w += ' milestoneText'),
              e.vert && (w += ' vertText'),
              E > M - b
                ? M + E + 1.5 * a.leftPadding > l
                  ? S + ' taskTextOutsideLeft taskTextOutside' + V + ' ' + w
                  : S + ' taskTextOutsideRight taskTextOutside' + V + ' ' + w + ' width-' + E
                : S + ' taskText taskText' + V + ' ' + w + ' width-' + E
            );
          }),
        nt().securityLevel === 'sandbox')
      ) {
        let e;
        e = mt('#i' + r);
        const b = e.nodes()[0].contentDocument;
        x.filter(function (M) {
          return s.has(M.id);
        }).each(function (M) {
          var E = b.querySelector('#' + CSS.escape(r + '-' + M.id)),
            S = b.querySelector('#' + CSS.escape(r + '-' + M.id + '-text'));
          const V = E.parentNode;
          var w = b.createElement('a');
          (w.setAttribute('xlink:href', s.get(M.id)),
            w.setAttribute('target', '_top'),
            V.appendChild(w),
            w.appendChild(E),
            w.appendChild(S));
        });
      }
    }
    c(Q, 'drawRects');
    function q(u, y, g, p, m, o, l, h) {
      if (l.length === 0 && h.length === 0) return;
      let d, x;
      for (const { startTime: E, endTime: S } of o)
        ((d === void 0 || E < d) && (d = E), (x === void 0 || S > x) && (x = S));
      if (!d || !x) return;
      if (P(x).diff(P(d), 'year') > 5) {
        et.warn(
          'The difference between the min and max time is more than 5 years. This will cause performance issues. Skipping drawing exclude days.',
        );
        return;
      }
      const s = i.db.getDateFormat(),
        F = [];
      let e = null,
        b = P(d);
      for (; b.valueOf() <= x; )
        (i.db.isInvalidDate(b, s, l, h)
          ? e
            ? (e.end = b)
            : (e = { start: b, end: b })
          : e && (F.push(e), (e = null)),
          (b = b.add(1, 'd')));
      W.append('g')
        .selectAll('rect')
        .data(F)
        .enter()
        .append('rect')
        .attr('id', (E) => r + '-exclude-' + E.start.format('YYYY-MM-DD'))
        .attr('x', (E) => _(E.start.startOf('day')) + g)
        .attr('y', a.gridLineStartPadding)
        .attr('width', (E) => _(E.end.endOf('day')) - _(E.start.startOf('day')))
        .attr('height', m - y - a.gridLineStartPadding)
        .attr('transform-origin', function (E, S) {
          return (
            (_(E.start) + g + 0.5 * (_(E.end) - _(E.start))).toString() +
            'px ' +
            (S * u + 0.5 * m).toString() +
            'px'
          );
        })
        .attr('class', 'exclude-range');
    }
    c(q, 'drawExcludeDays');
    function X(u, y, g, p) {
      if (g <= 0 || u > y) return 1 / 0;
      const m = y - u,
        o = P.duration({ [p ?? 'day']: g }).asMilliseconds();
      return o <= 0 ? 1 / 0 : Math.ceil(m / o);
    }
    c(X, 'getEstimatedTickCount');
    function Z(u, y, g, p) {
      const m = i.db.getDateFormat(),
        o = i.db.getAxisFormat();
      let l;
      o ? (l = o) : m === 'D' ? (l = '%d') : (l = a.axisFormat ?? '%Y-%m-%d');
      let h = De(_)
        .tickSize(-p + y + a.gridLineStartPadding)
        .tickFormat(Nt(l));
      const x = /^([1-9]\d*)(millisecond|second|minute|hour|day|week|month)$/.exec(
        i.db.getTickInterval() || a.tickInterval,
      );
      if (x !== null) {
        const s = parseInt(x[1], 10);
        if (isNaN(s) || s <= 0)
          et.warn(`Invalid tick interval value: "${x[1]}". Skipping custom tick interval.`);
        else {
          const F = x[2],
            e = i.db.getWeekday() || a.weekday,
            b = _.domain(),
            M = b[0],
            E = b[1],
            S = X(M, E, s, F);
          if (S > _t)
            et.warn(
              `The tick interval "${s}${F}" would generate ${S} ticks, which exceeds the maximum allowed (${_t}). This may indicate an invalid date or time range. Skipping custom tick interval.`,
            );
          else
            switch (F) {
              case 'millisecond':
                h.ticks(Xt.every(s));
                break;
              case 'second':
                h.ticks(jt.every(s));
                break;
              case 'minute':
                h.ticks(Ht.every(s));
                break;
              case 'hour':
                h.ticks(qt.every(s));
                break;
              case 'day':
                h.ticks(zt.every(s));
                break;
              case 'week':
                h.ticks(Zt[e].every(s));
                break;
              case 'month':
                h.ticks(Bt.every(s));
                break;
            }
        }
      }
      if (
        (W.append('g')
          .attr('class', 'grid')
          .attr('transform', 'translate(' + u + ', ' + (p - 50) + ')')
          .call(h)
          .selectAll('text')
          .style('text-anchor', 'middle')
          .attr('fill', '#000')
          .attr('stroke', 'none')
          .attr('font-size', 10)
          .attr('dy', '1em'),
        i.db.topAxisEnabled() || a.topAxis)
      ) {
        let s = $e(_)
          .tickSize(-p + y + a.gridLineStartPadding)
          .tickFormat(Nt(l));
        if (x !== null) {
          const F = parseInt(x[1], 10);
          if (isNaN(F) || F <= 0)
            et.warn(`Invalid tick interval value: "${x[1]}". Skipping custom tick interval.`);
          else {
            const e = x[2],
              b = i.db.getWeekday() || a.weekday,
              M = _.domain(),
              E = M[0],
              S = M[1];
            if (X(E, S, F, e) <= _t)
              switch (e) {
                case 'millisecond':
                  s.ticks(Xt.every(F));
                  break;
                case 'second':
                  s.ticks(jt.every(F));
                  break;
                case 'minute':
                  s.ticks(Ht.every(F));
                  break;
                case 'hour':
                  s.ticks(qt.every(F));
                  break;
                case 'day':
                  s.ticks(zt.every(F));
                  break;
                case 'week':
                  s.ticks(Zt[b].every(F));
                  break;
                case 'month':
                  s.ticks(Bt.every(F));
                  break;
              }
          }
        }
        W.append('g')
          .attr('class', 'grid')
          .attr('transform', 'translate(' + u + ', ' + y + ')')
          .call(s)
          .selectAll('text')
          .style('text-anchor', 'middle')
          .attr('fill', '#000')
          .attr('stroke', 'none')
          .attr('font-size', 10);
      }
    }
    c(Z, 'makeGrid');
    function I(u, y) {
      let g = 0;
      const p = Object.keys(L).map((m) => [m, L[m]]);
      W.append('g')
        .selectAll('text')
        .data(p)
        .enter()
        .append(function (m) {
          const o = m[0].split(ge.lineBreakRegex),
            l = -(o.length - 1) / 2,
            h = Y.createElementNS('http://www.w3.org/2000/svg', 'text');
          h.setAttribute('dy', l + 'em');
          for (const [d, x] of o.entries()) {
            const s = Y.createElementNS('http://www.w3.org/2000/svg', 'tspan');
            (s.setAttribute('alignment-baseline', 'central'),
              s.setAttribute('x', '10'),
              d > 0 && s.setAttribute('dy', '1em'),
              (s.textContent = x),
              h.appendChild(s));
          }
          return h;
        })
        .attr('x', 10)
        .attr('y', function (m, o) {
          if (o > 0)
            for (let l = 0; l < o; l++) return ((g += p[o - 1][1]), (m[1] * u) / 2 + g * u + y);
          else return (m[1] * u) / 2 + y;
        })
        .attr('font-size', a.sectionFontSize)
        .attr('class', function (m) {
          for (const [o, l] of $.entries())
            if (m[0] === l) return 'sectionTitle sectionTitle' + (o % a.numberSectionStyles);
          return 'sectionTitle';
        });
    }
    c(I, 'vertLabels');
    function v(u, y, g, p) {
      const m = i.db.getTodayMarker();
      if (m === 'off') return;
      const o = W.append('g').attr('class', 'today'),
        l = new Date(),
        h = o.append('line');
      (h
        .attr('x1', _(l) + u)
        .attr('x2', _(l) + u)
        .attr('y1', a.titleTopMargin)
        .attr('y2', p - a.titleTopMargin)
        .attr('class', 'today'),
        m !== '' && h.attr('style', m.replace(/,/g, ';')));
    }
    c(v, 'drawToday');
    function f(u) {
      const y = {},
        g = [];
      for (let p = 0, m = u.length; p < m; ++p)
        Object.prototype.hasOwnProperty.call(y, u[p]) || ((y[u[p]] = !0), g.push(u[p]));
      return g;
    }
    c(f, 'checkUnique');
  }, 'draw'),
  Fs = { setConf: Is, draw: As },
  $s = c(
    (t) => `
  .mermaid-main-font {
        font-family: ${t.fontFamily};
  }

  .exclude-range {
    fill: ${t.excludeBkgColor};
  }

  .section {
    stroke: none;
    opacity: 0.2;
  }

  .section0 {
    fill: ${t.sectionBkgColor};
  }

  .section2 {
    fill: ${t.sectionBkgColor2};
  }

  .section1,
  .section3 {
    fill: ${t.altSectionBkgColor};
    opacity: 0.2;
  }

  .sectionTitle0 {
    fill: ${t.titleColor};
  }

  .sectionTitle1 {
    fill: ${t.titleColor};
  }

  .sectionTitle2 {
    fill: ${t.titleColor};
  }

  .sectionTitle3 {
    fill: ${t.titleColor};
  }

  .sectionTitle {
    text-anchor: start;
    font-family: ${t.fontFamily};
  }


  /* Grid and axis */

  .grid .tick {
    stroke: ${t.gridColor};
    opacity: 0.8;
    shape-rendering: crispEdges;
  }

  .grid .tick text {
    font-family: ${t.fontFamily};
    fill: ${t.textColor};
  }

  .grid path {
    stroke-width: 0;
  }


  /* Today line */

  .today {
    fill: none;
    stroke: ${t.todayLineColor};
    stroke-width: 2px;
  }


  /* Task styling */

  /* Default task */

  .task {
    stroke-width: 2;
  }

  .taskText {
    text-anchor: middle;
    font-family: ${t.fontFamily};
  }

  .taskTextOutsideRight {
    fill: ${t.taskTextDarkColor};
    text-anchor: start;
    font-family: ${t.fontFamily};
  }

  .taskTextOutsideLeft {
    fill: ${t.taskTextDarkColor};
    text-anchor: end;
  }


  /* Special case clickable */

  .task.clickable {
    cursor: pointer;
  }

  .taskText.clickable {
    cursor: pointer;
    fill: ${t.taskTextClickableColor} !important;
    font-weight: bold;
  }

  .taskTextOutsideLeft.clickable {
    cursor: pointer;
    fill: ${t.taskTextClickableColor} !important;
    font-weight: bold;
  }

  .taskTextOutsideRight.clickable {
    cursor: pointer;
    fill: ${t.taskTextClickableColor} !important;
    font-weight: bold;
  }


  /* Specific task settings for the sections*/

  .taskText0,
  .taskText1,
  .taskText2,
  .taskText3 {
    fill: ${t.taskTextColor};
  }

  .task0,
  .task1,
  .task2,
  .task3 {
    fill: ${t.taskBkgColor};
    stroke: ${t.taskBorderColor};
  }

  .taskTextOutside0,
  .taskTextOutside2
  {
    fill: ${t.taskTextOutsideColor};
  }

  .taskTextOutside1,
  .taskTextOutside3 {
    fill: ${t.taskTextOutsideColor};
  }


  /* Active task */

  .active0,
  .active1,
  .active2,
  .active3 {
    fill: ${t.activeTaskBkgColor};
    stroke: ${t.activeTaskBorderColor};
  }

  .activeText0,
  .activeText1,
  .activeText2,
  .activeText3 {
    fill: ${t.taskTextDarkColor} !important;
  }


  /* Completed task */

  .done0,
  .done1,
  .done2,
  .done3 {
    stroke: ${t.doneTaskBorderColor};
    fill: ${t.doneTaskBkgColor};
    stroke-width: 2;
  }

  .doneText0,
  .doneText1,
  .doneText2,
  .doneText3 {
    fill: ${t.taskTextDarkColor} !important;
  }

  /* Done task text displayed outside the bar sits against the diagram background,
     not against the done-task bar, so it must use the outside/contrast color. */
  .doneText0.taskTextOutsideLeft,
  .doneText0.taskTextOutsideRight,
  .doneText1.taskTextOutsideLeft,
  .doneText1.taskTextOutsideRight,
  .doneText2.taskTextOutsideLeft,
  .doneText2.taskTextOutsideRight,
  .doneText3.taskTextOutsideLeft,
  .doneText3.taskTextOutsideRight {
    fill: ${t.taskTextOutsideColor} !important;
  }


  /* Tasks on the critical line */

  .crit0,
  .crit1,
  .crit2,
  .crit3 {
    stroke: ${t.critBorderColor};
    fill: ${t.critBkgColor};
    stroke-width: 2;
  }

  .activeCrit0,
  .activeCrit1,
  .activeCrit2,
  .activeCrit3 {
    stroke: ${t.critBorderColor};
    fill: ${t.activeTaskBkgColor};
    stroke-width: 2;
  }

  .doneCrit0,
  .doneCrit1,
  .doneCrit2,
  .doneCrit3 {
    stroke: ${t.critBorderColor};
    fill: ${t.doneTaskBkgColor};
    stroke-width: 2;
    cursor: pointer;
    shape-rendering: crispEdges;
  }

  .milestone {
    transform: rotate(45deg) scale(0.8,0.8);
  }

  .milestoneText {
    font-style: italic;
  }
  .doneCritText0,
  .doneCritText1,
  .doneCritText2,
  .doneCritText3 {
    fill: ${t.taskTextDarkColor} !important;
  }

  /* Done-crit task text outside the bar — same reasoning as doneText above. */
  .doneCritText0.taskTextOutsideLeft,
  .doneCritText0.taskTextOutsideRight,
  .doneCritText1.taskTextOutsideLeft,
  .doneCritText1.taskTextOutsideRight,
  .doneCritText2.taskTextOutsideLeft,
  .doneCritText2.taskTextOutsideRight,
  .doneCritText3.taskTextOutsideLeft,
  .doneCritText3.taskTextOutsideRight {
    fill: ${t.taskTextOutsideColor} !important;
  }

  .vert {
    stroke: ${t.vertLineColor};
  }

  .vertText {
    font-size: 15px;
    text-anchor: middle;
    fill: ${t.vertLineColor} !important;
  }

  .activeCritText0,
  .activeCritText1,
  .activeCritText2,
  .activeCritText3 {
    fill: ${t.taskTextDarkColor} !important;
  }

  .titleText {
    text-anchor: middle;
    font-size: 18px;
    fill: ${t.titleColor || t.textColor};
    font-family: ${t.fontFamily};
  }
`,
    'getStyles',
  ),
  Ls = $s,
  Ps = { parser: He, db: Es, renderer: Fs, styles: Ls };
export { Ps as diagram };
