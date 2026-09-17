import {
  A as $a,
  H as $i,
  C as _i,
  Z as Aa,
  I as Ai,
  ad as ar,
  F as bi,
  X as Bi,
  N as Ci,
  u as di,
  U as Di,
  l as Dt,
  P as Ei,
  ab as er,
  v as fi,
  V as Fi,
  x as gi,
  b as Gi,
  y as hi,
  a0 as Hi,
  R as Ii,
  ae as ir,
  a3 as ji,
  aa as Ji,
  ag as Jt,
  Q as ki,
  a5 as Ki,
  a4 as Kt,
  s as L,
  O as Li,
  D as mi,
  W as Mi,
  B as mt,
  f as Ni,
  ai as nr,
  S as Oi,
  z as pi,
  T as Pi,
  a6 as qi,
  n as Qi,
  af as qt,
  a8 as Ra,
  K as Ri,
  ah as rr,
  L as Si,
  q as Ta,
  G as Ti,
  ac as tr,
  a2 as Ui,
  a9 as Ve,
  w as vi,
  _ as Vi,
  a7 as wa,
  J as wi,
  a1 as Wi,
  o as xi,
  Y as Xi,
  E as yi,
  $ as Yi,
  g as zi,
  t as Zi,
  a as Zt,
} from './markdown-it-vendor-DL4wSELR.js';
import './markdown-vendor-DldLOD9R.js';
import './ui-vendor-C-FKu2uc.js';
var F = function () {
  return (
    (F =
      Object.assign ||
      function (e) {
        for (var a, i = 1, r = arguments.length; i < r; i++) {
          a = arguments[i];
          for (var n in a) Object.prototype.hasOwnProperty.call(a, n) && (e[n] = a[n]);
        }
        return e;
      }),
    F.apply(this, arguments)
  );
};
function ne(t, e, a) {
  if (a || arguments.length === 2)
    for (var i = 0, r = e.length, n; i < r; i++)
      (n || !(i in e)) && (n || (n = Array.prototype.slice.call(e, 0, i)), (n[i] = e[i]));
  return t.concat(n || Array.prototype.slice.call(e));
}
var z = {
    button: 'bb-button',
    chart: 'bb-chart',
    empty: 'bb-empty',
    main: 'bb-main',
    target: 'bb-target',
    EXPANDED: '_expanded_',
    dummy: '_dummy_',
  },
  V = {
    arc: 'bb-arc',
    arcLabelLine: 'bb-arc-label-line',
    arcLabelLineText: 'bb-arc-label-line-text',
    arcRange: 'bb-arc-range',
    arcs: 'bb-arcs',
    chartArc: 'bb-chart-arc',
    chartArcs: 'bb-chart-arcs',
    chartArcsBackground: 'bb-chart-arcs-background',
    chartArcsTitle: 'bb-chart-arcs-title',
    needle: 'bb-needle',
  },
  yt = { area: 'bb-area', areas: 'bb-areas' },
  ue = {
    axis: 'bb-axis',
    axisX: 'bb-axis-x',
    axisXLabel: 'bb-axis-x-label',
    axisY: 'bb-axis-y',
    axisY2: 'bb-axis-y2',
    axisY2Label: 'bb-axis-y2-label',
    axisYLabel: 'bb-axis-y-label',
    axisXTooltip: 'bb-axis-x-tooltip',
    axisYTooltip: 'bb-axis-y-tooltip',
    axisY2Tooltip: 'bb-axis-y2-tooltip',
    axisTooltipX: 'bb-axis-tooltip-x',
    axisTooltipY: 'bb-axis-tooltip-y',
  },
  _e = {
    bar: 'bb-bar',
    bars: 'bb-bars',
    chartBar: 'bb-chart-bar',
    chartBars: 'bb-chart-bars',
    barConnectLine: 'bb-bar-connectLine',
  },
  ke = {
    candlestick: 'bb-candlestick',
    candlesticks: 'bb-candlesticks',
    chartCandlestick: 'bb-chart-candlestick',
    chartCandlesticks: 'bb-chart-candlesticks',
    valueDown: 'bb-value-down',
    valueUp: 'bb-value-up',
  },
  he = { chartCircles: 'bb-chart-circles', circle: 'bb-circle', circles: 'bb-circles' },
  zt = { colorPattern: 'bb-color-pattern', colorScale: 'bb-colorscale' },
  Ge = { dragarea: 'bb-dragarea', INCLUDED: '_included_' },
  dt = {
    funnel: 'bb-funnel',
    chartFunnel: 'bb-chart-funnel',
    chartFunnels: 'bb-chart-funnels',
    funnelBackground: 'bb-funnel-background',
  },
  me = {
    chartArcsGaugeMax: 'bb-chart-arcs-gauge-max',
    chartArcsGaugeMin: 'bb-chart-arcs-gauge-min',
    chartArcsGaugeUnit: 'bb-chart-arcs-gauge-unit',
    chartArcsGaugeTitle: 'bb-chart-arcs-gauge-title',
    gaugeValue: 'bb-gauge-value',
  },
  K = {
    legend: 'bb-legend',
    legendBackground: 'bb-legend-background',
    legendItem: 'bb-legend-item',
    legendItemEvent: 'bb-legend-item-event',
    legendItemHidden: 'bb-legend-item-hidden',
    legendItemPoint: 'bb-legend-item-point',
    legendItemTile: 'bb-legend-item-tile',
  },
  Ie = {
    chartLine: 'bb-chart-line',
    chartLines: 'bb-chart-lines',
    line: 'bb-line',
    lines: 'bb-lines',
  },
  we = {
    eventRect: 'bb-event-rect',
    eventRects: 'bb-event-rects',
    eventRectsMultiple: 'bb-event-rects-multiple',
    eventRectsSingle: 'bb-event-rects-single',
  },
  J = {
    focused: 'bb-focused',
    defocused: 'bb-defocused',
    legendItemFocused: 'bb-legend-item-focused',
    xgridFocus: 'bb-xgrid-focus',
    ygridFocus: 'bb-ygrid-focus',
  },
  ie = {
    grid: 'bb-grid',
    gridLines: 'bb-grid-lines',
    xgrid: 'bb-xgrid',
    xgridLine: 'bb-xgrid-line',
    xgridLines: 'bb-xgrid-lines',
    xgrids: 'bb-xgrids',
    ygrid: 'bb-ygrid',
    ygridLine: 'bb-ygrid-line',
    ygridLines: 'bb-ygrid-lines',
    ygrids: 'bb-ygrids',
  },
  Fe = { level: 'bb-level', levels: 'bb-levels' },
  Sa = { chartRadar: 'bb-chart-radar', chartRadars: 'bb-chart-radars' },
  ft = { region: 'bb-region', regions: 'bb-regions' },
  ee = {
    selectedCircle: 'bb-selected-circle',
    selectedCircles: 'bb-selected-circles',
    SELECTED: '_selected_',
  },
  oe = { shape: 'bb-shape', shapes: 'bb-shapes' },
  Ca = { brush: 'bb-brush', subchart: 'bb-subchart' },
  ce = {
    chartText: 'bb-chart-text',
    chartTexts: 'bb-chart-texts',
    text: 'bb-text',
    texts: 'bb-texts',
    title: 'bb-title',
    textBorderRect: 'bb-text-border',
    textLabelImage: 'bb-text-label-image',
    TextOverlapping: 'text-overlapping',
  },
  xt = {
    tooltip: 'bb-tooltip',
    tooltipContainer: 'bb-tooltip-container',
    tooltipName: 'bb-tooltip-name',
  },
  La = {
    treemap: 'bb-treemap',
    chartTreemap: 'bb-chart-treemap',
    chartTreemaps: 'bb-chart-treemaps',
  },
  Ft = { buttonZoomReset: 'bb-zoom-reset', zoomBrush: 'bb-zoom-brush' },
  U = F(
    F(
      F(
        F(
          F(
            F(
              F(
                F(
                  F(
                    F(
                      F(
                        F(
                          F(
                            F(
                              F(
                                F(
                                  F(F(F(F(F(F(F(F(F({}, z), V), yt), ue), _e), ke), he), zt), Ge),
                                  me,
                                ),
                                K,
                              ),
                              Ie,
                            ),
                            we,
                          ),
                          J,
                        ),
                        dt,
                      ),
                      ie,
                    ),
                    Sa,
                  ),
                  ft,
                ),
                ee,
              ),
              oe,
            ),
            Ca,
          ),
          ce,
        ),
        xt,
      ),
      La,
    ),
    Ft,
  ),
  or = { boost_useCssRule: !1, boost_useWorker: !1 },
  sr = { color_pattern: [], color_tiles: void 0, color_threshold: {}, color_onover: void 0 },
  lr = {
    legend_contents_bindto: void 0,
    legend_contents_template:
      "<span style='color:#fff;padding:5px;background-color:{=COLOR}'>{=TITLE}</span>",
    legend_equally: !1,
    legend_hide: !1,
    legend_inset_anchor: 'top-left',
    legend_inset_x: 10,
    legend_inset_y: 0,
    legend_inset_step: void 0,
    legend_item_interaction: !0,
    legend_item_dblclick: !1,
    legend_item_onclick: void 0,
    legend_item_onover: void 0,
    legend_item_onout: void 0,
    legend_item_tile_width: 10,
    legend_item_tile_height: 10,
    legend_item_tile_r: 5,
    legend_item_tile_type: 'rectangle',
    legend_format: void 0,
    legend_padding: 0,
    legend_position: 'bottom',
    legend_show: !0,
    legend_tooltip: !1,
    legend_usePoint: !1,
  },
  cr = {
    bindto: '#chart',
    background: {},
    clipPath: !0,
    svg_classname: void 0,
    size_width: void 0,
    size_height: void 0,
    padding: !0,
    padding_mode: void 0,
    padding_left: void 0,
    padding_right: void 0,
    padding_top: void 0,
    padding_bottom: void 0,
    resize_auto: !0,
    resize_timer: !0,
    onclick: void 0,
    onover: void 0,
    onout: void 0,
    onresize: void 0,
    onresized: void 0,
    onbeforeinit: void 0,
    oninit: void 0,
    onafterinit: void 0,
    onrendered: void 0,
    transition_duration: 250,
    plugins: [],
    render: {},
    regions: [],
  },
  ur = {
    title_text: void 0,
    title_padding: { top: 0, right: 0, bottom: 0, left: 0 },
    title_position: 'center',
  },
  dr = {
    tooltip_show: !0,
    tooltip_doNotHide: !1,
    tooltip_grouped: !0,
    tooltip_format_title: void 0,
    tooltip_format_name: void 0,
    tooltip_format_value: void 0,
    tooltip_position: void 0,
    tooltip_contents: {},
    tooltip_init_show: !1,
    tooltip_init_x: 0,
    tooltip_init_position: void 0,
    tooltip_linked: !1,
    tooltip_linked_name: '',
    tooltip_onshow: function () {},
    tooltip_onhide: function () {},
    tooltip_onshown: function () {},
    tooltip_onhidden: function () {},
    tooltip_order: null,
  },
  fr = {
    data_x: void 0,
    data_idConverter: function (t) {
      return t;
    },
    data_names: {},
    data_classes: {},
    data_type: void 0,
    data_types: {},
    data_order: 'desc',
    data_groups: [],
    data_groupsZeroAs: 'positive',
    data_color: void 0,
    data_colors: {},
    data_labels: {},
    data_labels_backgroundColors: void 0,
    data_labels_colors: void 0,
    data_labels_position: {},
    data_labels_imgUrl: void 0,
    data_hide: !1,
    data_filter: void 0,
    data_onclick: function () {},
    data_onover: function () {},
    data_onout: function () {},
    data_onshown: void 0,
    data_onhidden: void 0,
    data_onmin: void 0,
    data_onmax: void 0,
    data_url: void 0,
    data_headers: void 0,
    data_json: void 0,
    data_rows: void 0,
    data_columns: void 0,
    data_mimeType: 'csv',
    data_keys: void 0,
    data_empty_label_text: '',
  },
  vr = {
    interaction_enabled: !0,
    interaction_brighten: !0,
    interaction_inputType_mouse: !0,
    interaction_inputType_touch: {},
    interaction_onout: !0,
  };
function gr() {
  return (
    (typeof globalThis == 'object' &&
      globalThis !== null &&
      globalThis.Object === Object &&
      globalThis) ||
    (typeof global == 'object' && global !== null && global.Object === Object && global) ||
    (typeof self == 'object' && self !== null && self.Object === Object && self) ||
    Function('return this')()
  );
}
function hr(t) {
  var e =
      typeof t?.requestAnimationFrame == 'function' && typeof t?.cancelAnimationFrame == 'function',
    a = typeof t?.requestIdleCallback == 'function' && typeof t?.cancelIdleCallback == 'function',
    i = function (n) {
      return setTimeout(n, 1);
    },
    r = function (n) {
      return clearTimeout(n);
    };
  return [
    e ? t.requestAnimationFrame : i,
    e ? t.cancelAnimationFrame : r,
    a ? t.requestIdleCallback : i,
    a ? t.cancelIdleCallback : r,
  ];
}
var X = gr(),
  te = X?.document,
  Ea = hr(X),
  pr = Ea[0],
  ka = Ea[2],
  xr = new Set([
    'span',
    'div',
    'p',
    'br',
    'b',
    'i',
    'em',
    'strong',
    'u',
    's',
    'sub',
    'sup',
    'ul',
    'ol',
    'li',
    'dl',
    'dt',
    'dd',
    'table',
    'thead',
    'tbody',
    'tfoot',
    'tr',
    'th',
    'td',
    'caption',
    'colgroup',
    'col',
    'hr',
    'pre',
    'code',
    'blockquote',
    'a',
    'img',
    'svg',
    'g',
    'path',
    'circle',
    'ellipse',
    'rect',
    'line',
    'polyline',
    'polygon',
    'text',
    'tspan',
    'textPath',
    'use',
    'defs',
    'symbol',
    'clipPath',
    'mask',
    'linearGradient',
    'radialGradient',
    'stop',
    'pattern',
    'marker',
    'title',
    'desc',
  ]),
  Qt = new Set([
    'class',
    'id',
    'style',
    'title',
    'lang',
    'dir',
    'href',
    'src',
    'alt',
    'width',
    'height',
    'colspan',
    'rowspan',
    'scope',
    'headers',
    'd',
    'points',
    'x',
    'y',
    'x1',
    'x2',
    'y1',
    'y2',
    'cx',
    'cy',
    'r',
    'rx',
    'ry',
    'dx',
    'dy',
    'viewBox',
    'preserveAspectRatio',
    'transform',
    'fill',
    'fill-opacity',
    'fill-rule',
    'stroke',
    'stroke-width',
    'stroke-opacity',
    'stroke-linecap',
    'stroke-linejoin',
    'stroke-dasharray',
    'stroke-dashoffset',
    'opacity',
    'clip-path',
    'clip-rule',
    'mask',
    'font-family',
    'font-size',
    'font-weight',
    'font-style',
    'text-anchor',
    'dominant-baseline',
    'offset',
    'stop-color',
    'stop-opacity',
    'gradientUnits',
    'gradientTransform',
    'spreadMethod',
    'patternUnits',
    'patternTransform',
    'marker-start',
    'marker-mid',
    'marker-end',
    'markerWidth',
    'markerHeight',
    'refX',
    'refY',
    'xlink:href',
  ]),
  _r = new Set(['http:', 'https:', 'mailto:']),
  mr = new Set(['href', 'src', 'xlink:href']),
  yr = /^<\/?([a-zA-Z][a-zA-Z0-9]*)/,
  br = /^<\/([a-zA-Z][a-zA-Z0-9]*)\s*>$/,
  Tr = /^<([a-zA-Z][a-zA-Z0-9]*)([\s\S]*?)(\/?)>$/,
  ea = /([a-zA-Z][\w:-]*)\s*(?:=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g,
  ta = /url\s*\(\s*["']?([^"')]+)["']?\s*\)/gi,
  $r = ['expression(', 'behavior:', 'binding:', '@import', '@charset', '-moz-binding:'];
function Vt(t) {
  return t
    .replace(/&colon;/gi, ':')
    .replace(
      /&newline;/gi,
      `
`,
    )
    .replace(/&tab;/gi, '	')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&#(\d+);/gi, function (e, a) {
      return String.fromCharCode(parseInt(a, 10));
    })
    .replace(/&#x([0-9a-f]+);/gi, function (e, a) {
      return String.fromCharCode(parseInt(a, 16));
    });
}
function Ia(t) {
  var e = Vt(t).trim(),
    a = e.replace(/[\s\u0000-\u001f]/g, '').toLowerCase();
  if (
    !a ||
    a.startsWith('#') ||
    a.startsWith('/') ||
    a.startsWith('./') ||
    a.startsWith('../') ||
    !a.includes(':')
  )
    return !0;
  var i = a.indexOf(':');
  if (i > 0) {
    var r = a.substring(0, i + 1);
    return _r.has(r);
  }
  return !1;
}
function Ar(t) {
  var e = Vt(t),
    a = e.replace(/[\u0000-\u001f]/g, '');
  ta.lastIndex = 0;
  for (var i; (i = ta.exec(a)) !== null; ) if (!Ia(i[1])) return null;
  for (var r = a.toLowerCase().replace(/\s/g, ''), n = 0, o = $r; n < o.length; n++) {
    var s = o[n];
    if (r.includes(s)) return null;
  }
  return t;
}
var wr = { '"': '&quot;', "'": '&#39;', '`': '&#96;' },
  Rr = /["'`]/g;
function St(t) {
  return t.replace(Rr, function (e) {
    return wr[e];
  });
}
function Sr(t, e, a) {
  if ((a === void 0 && (a = !1), mr.has(t))) return Ia(e) ? (a ? St(e) : e) : null;
  if (t === 'style') {
    var i = Ar(e);
    return i === null ? null : a ? St(i) : i;
  }
  var r = Vt(e).toLowerCase().replace(/\s/g, '');
  return /\bon\w+=/.test(r) ? null : a ? St(e) : e;
}
function Cr(t) {
  var e = t.match(yr);
  return e ? e[1].toLowerCase() : null;
}
function Lr(t) {
  var e = Cr(t);
  return e !== null && xr.has(e);
}
function Er(t) {
  var e = t.match(br);
  if (e) return '</'.concat(e[1].toLowerCase(), '>');
  var a = t.match(Tr);
  if (!a) return '';
  var i = a[1],
    r = a[2],
    n = a[3],
    o = i.toLowerCase(),
    s = [];
  ea.lastIndex = 0;
  for (var l; (l = ea.exec(r)) !== null; ) {
    var c = l[1].toLowerCase(),
      u = l[2],
      d = l[3],
      f = l[4];
    if (!c.startsWith('on')) {
      var v = void 0,
        g = void 0;
      if (u !== void 0) ((v = u), (g = '"'));
      else if (d !== void 0) ((v = d), (g = "'"));
      else if (f !== void 0) ((v = f), (g = '"'));
      else {
        Qt.has(c) && s.push(c);
        continue;
      }
      if (Qt.has(c)) {
        var h = f !== void 0,
          p = Sr(c, v, h);
        p !== null && s.push(''.concat(c, '=').concat(g).concat(p).concat(g));
      }
    }
  }
  var x = s.length > 0 ? ' '.concat(s.join(' ')) : '',
    _ = n ? '/>' : '>';
  return '<'.concat(o).concat(x).concat(_);
}
function tt(t) {
  return typeof t != 'string' || !t || t.indexOf('<') === -1
    ? t
    : t.replace(/<\/?[^>]*>|[^<>\s]+>/g, function (e) {
        return e.startsWith('<!--')
          ? ''
          : e.startsWith('<')
            ? Lr(e)
              ? Er(e)
              : e.replace(/</g, '&lt;')
            : e.slice(0, -1) + '&gt;';
      });
}
function Oa(t, e, a) {
  a === void 0 && (a = !1);
  var i = function (n) {
    return n[t ? 'getBoundingClientRect' : 'getBBox']();
  };
  if (a) return i(e);
  var r =
    !('rect' in e) ||
    ('rect' in e && e.hasAttribute('width') && e.rect.width !== +(e.getAttribute('width') || 0));
  return r ? (e.rect = i(e)) : e.rect;
}
function Pa(t, e) {
  for (var a = 0; a < t.length; a++) {
    var i = t[a];
    i && e(i, a);
  }
}
var N = function (t) {
    return t || t === 0;
  },
  I = function (t) {
    return typeof t == 'function';
  },
  H = function (t) {
    return typeof t == 'string';
  },
  P = function (t) {
    return typeof t == 'number';
  },
  se = function (t) {
    return typeof t > 'u';
  },
  q = function (t) {
    return typeof t < 'u';
  },
  Mt = function (t) {
    return typeof t == 'boolean';
  },
  kr = function (t) {
    return Math.ceil(t / 10) * 10;
  },
  ht = function (t) {
    return Math.ceil(t) + 0.5;
  },
  Ye = function (t) {
    return t[1] - t[0];
  },
  ye = function (t) {
    return typeof t == 'object';
  },
  Ir = function (t) {
    for (var e in t) return !1;
    return !0;
  },
  $e = function (t) {
    return (
      se(t) ||
      t === null ||
      (H(t) && t.length === 0) ||
      (ye(t) && !(t instanceof Date) && Ir(t)) ||
      (P(t) && isNaN(t))
    );
  },
  le = function (t) {
    return !$e(t);
  },
  j = function (t) {
    return Array.isArray(t);
  },
  W = function (t) {
    return t && !t?.nodeType && ye(t) && !j(t);
  };
function Me(t, e, a) {
  return q(t[e]) ? t[e] : a;
}
function Or(t, e) {
  var a = !1;
  return (
    Object.keys(t).forEach(function (i) {
      return t[i] === e && (a = !0);
    }),
    a
  );
}
function Q(t, e) {
  for (var a = [], i = 2; i < arguments.length; i++) a[i - 2] = arguments[i];
  var r = I(t);
  return (r && t.call.apply(t, ne([e], a, !1)), r);
}
function bt(t, e) {
  var a = 0,
    i = function () {
      for (var r = [], n = 0; n < arguments.length; n++) r[n] = arguments[n];
      !--a && e.apply.apply(e, ne([this], r, !1));
    };
  'duration' in t
    ? t
        .each(function () {
          return ++a;
        })
        .on('end', i)
    : (++a, t.call(i));
}
function at(t, e, a, i) {
  if ((a === void 0 && (a = [-1, 1]), i === void 0 && (i = !1), !(!t || !H(e))))
    if (
      e.indexOf(`
`) === -1
    )
      t.text(e);
    else {
      var r = [t.text(), e].map(function (s) {
        return s.replace(/[\s\n]/g, '');
      });
      if (r[0] !== r[1]) {
        var n = e.split(`
`),
          o = i ? n.length - 1 : 1;
        (t.html(''),
          n.forEach(function (s, l) {
            t.append('tspan')
              .attr('x', 0)
              .attr('dy', ''.concat(l === 0 ? a[0] * o : a[1], 'em'))
              .text(s);
          }));
      }
    }
}
function Da(t) {
  var e = t.getBBox(),
    a = e.x,
    i = e.y,
    r = e.width,
    n = e.height;
  return [
    { x: a, y: i + n },
    { x: a, y: i },
    { x: a + r, y: i },
    { x: a + r, y: i + n },
  ];
}
function za(t) {
  var e = fe(t),
    a = e.width,
    i = e.height,
    r = Da(t),
    n = r[0].x,
    o = Math.min(r[0].y, r[1].y);
  return { x: n, y: o, width: a, height: i };
}
function Te(t, e) {
  var a,
    i =
      t &&
      ((a = t.touches || (t.sourceEvent && t.sourceEvent.touches)) === null || a === void 0
        ? void 0
        : a[0]),
    r = [0, 0];
  try {
    r = pi(i || t, e);
  } catch {}
  return r.map(function (n) {
    return isNaN(n) ? 0 : n;
  });
}
function Fa(t) {
  var e = t.event,
    a = t.$el,
    i = a.subchart.main || a.main,
    r;
  return (
    e && e.type === 'brush'
      ? (r = e.selection)
      : i && (r = i.select('.bb-brush').node()) && (r = wa(r)),
    r
  );
}
function fe(t, e) {
  return (e === void 0 && (e = !1), Oa(!0, t, e));
}
function Be(t, e) {
  return (e === void 0 && (e = !1), Oa(!1, t, e));
}
function Ce(t, e, a) {
  (t === void 0 && (t = !0), e === void 0 && (e = 0), a === void 0 && (a = 1e4));
  var i = X.crypto || X.msCrypto,
    r = i
      ? e + (i.getRandomValues(new Uint32Array(1))[0] % (a - e + 1))
      : Math.floor(Math.random() * (a - e) + e);
  return t ? String(r) : r;
}
function Bt(t, e, a, i, r) {
  if (a > i) return -1;
  var n = Math.floor((a + i) / 2),
    o = t[n],
    s = o.x,
    l = o.w,
    c = l === void 0 ? 0 : l;
  return (
    r && ((s = t[n].y), (c = t[n].h)),
    e >= s && e <= s + c ? n : e < s ? Bt(t, e, a, n - 1, r) : Bt(t, e, n + 1, i, r)
  );
}
function Ma(t) {
  var e = Fa(t);
  return e ? e[0] === e[1] : !0;
}
function Pr() {
  for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
  var a = function (i) {
    if (W(i) && i.constructor) {
      var r = new i.constructor();
      for (var n in i) r[n] = a(i[n]);
      return r;
    }
    return i;
  };
  return t
    .map(function (i) {
      return a(i);
    })
    .reduce(function (i, r) {
      return F(F({}, i), r);
    });
}
function ve(t, e) {
  (t === void 0 && (t = {}),
    j(e) &&
      e.forEach(function (i) {
        return ve(t, i);
      }));
  for (var a in e) /^\d+$/.test(a) || a in t || (t[a] = e[a]);
  return t;
}
var pe = function (t) {
  return t.charAt(0).toUpperCase() + t.slice(1);
};
function Dr(t, e) {
  return (
    e === void 0 && (e = '-'),
    t
      .split(e)
      .map(function (a, i) {
        return i ? a.charAt(0).toUpperCase() + a.slice(1).toLowerCase() : a.toLowerCase();
      })
      .join('')
  );
}
var He = function (t) {
  return [].slice.call(t);
};
function zr(t, e, a) {
  var i = t.rootSelector,
    r = i === void 0 ? '' : i,
    n = t.sheet,
    o = function (l) {
      return l.replace(/\s?(bb-)/g, '.$1').replace(/\.+/g, '.');
    },
    s = ''.concat(r, ' ').concat(o(e), ' {').concat(a.join(';'), '}');
  return n[n.insertRule ? 'insertRule' : 'addRule'](s, n.cssRules.length);
}
function Fr(t) {
  var e = [];
  return (
    t.forEach(function (a) {
      var i;
      try {
        a.cssRules && a.cssRules.length && (e = e.concat(He(a.cssRules)));
      } catch (r) {
        (i = X.console) === null ||
          i === void 0 ||
          i.warn('Error while reading rules from '.concat(a.href, ': ').concat(r.toString()));
      }
    }),
    e
  );
}
function Ba(t) {
  var e, a, i, r, n, o;
  return {
    x:
      ((a = (e = X.pageXOffset) !== null && e !== void 0 ? e : X.scrollX) !== null && a !== void 0
        ? a
        : 0) + ((i = t.scrollLeft) !== null && i !== void 0 ? i : 0),
    y:
      ((n = (r = X.pageYOffset) !== null && r !== void 0 ? r : X.scrollY) !== null && n !== void 0
        ? n
        : 0) + ((o = t.scrollTop) !== null && o !== void 0 ? o : 0),
  };
}
function Tt(t, e, a, i) {
  (e === void 0 && (e = 0), a === void 0 && (a = 0), i === void 0 && (i = !0));
  var r = new DOMPoint(e, a),
    n = t.getScreenCTM(),
    o = r.matrixTransform(i ? n?.inverse() : n);
  if (i === !1) {
    var s = fe(t);
    ((o.x -= s.x), (o.y -= s.y));
  }
  return o;
}
function aa(t) {
  var e = t ? t.transform : null,
    a = e && e.baseVal;
  return a && a.numberOfItems ? a.getItem(0).matrix : { a: 0, b: 0, c: 0, d: 0, e: 0, f: 0 };
}
function Xt(t) {
  var e = t[0] instanceof Date,
    a = (e ? t.map(Number) : t).filter(function (i, r, n) {
      return n.indexOf(i) === r;
    });
  return e
    ? a.map(function (i) {
        return new Date(i);
      })
    : a;
}
function ia(t) {
  return t && t.length
    ? t.reduce(function (e, a) {
        return e.concat(a);
      })
    : [];
}
function it(t) {
  for (var e = [], a = 1; a < arguments.length; a++) e[a - 1] = arguments[a];
  if (!e.length || (e.length === 1 && !e[0])) return t;
  var i = e.shift();
  return (
    W(t) &&
      W(i) &&
      Object.keys(i).forEach(function (r) {
        if (!/^(__proto__|constructor|prototype)$/i.test(r)) {
          var n = i[r];
          W(n) ? (!t[r] && (t[r] = {}), (t[r] = it(t[r], n))) : (t[r] = j(n) ? n.concat() : n);
        }
      }),
    it.apply(void 0, ne([t], e, !1))
  );
}
function rt(t, e) {
  e === void 0 && (e = !0);
  var a;
  return (
    t[0] instanceof Date
      ? (a = e
          ? function (i, r) {
              return i - r;
            }
          : function (i, r) {
              return r - i;
            })
      : e && !t.every(isNaN)
        ? (a = function (i, r) {
            return i - r;
          })
        : e ||
          (a = function (i, r) {
            return (i > r && -1) || (i < r && 1) || (i === r && 0);
          }),
    t.concat().sort(a)
  );
}
function Re(t, e) {
  var a = e.filter(function (i) {
    return le(i);
  });
  return (
    a.length
      ? P(a[0])
        ? (a = Math[t].apply(Math, a))
        : a[0] instanceof Date && (a = rt(a, t === 'min')[0])
      : (a = void 0),
    a
  );
}
var _t = function (t, e, a) {
    a === void 0 && (a = 1);
    for (var i = [], r = Math.max(0, Math.ceil((e - t) / a)) | 0, n = t; n < r; n++)
      i.push(t + n * a);
    return i;
  },
  Mr = {
    mouse: (function () {
      var t = function () {
        return { bubbles: !1, cancelable: !1, screenX: 0, screenY: 0, clientX: 0, clientY: 0 };
      };
      try {
        return (
          new MouseEvent('t'),
          function (e, a, i) {
            (i === void 0 && (i = t()), e.dispatchEvent(new MouseEvent(a, i)));
          }
        );
      } catch {
        return function (a, i, r) {
          r === void 0 && (r = t());
          var n = te.createEvent('MouseEvent');
          (n.initMouseEvent(
            i,
            r.bubbles,
            r.cancelable,
            X,
            0,
            r.screenX,
            r.screenY,
            r.clientX,
            r.clientY,
            !1,
            !1,
            !1,
            !1,
            0,
            null,
          ),
            a.dispatchEvent(n));
        };
      }
    })(),
    touch: function (t, e, a) {
      var i = new Touch(
        it(
          {
            identifier: Date.now(),
            target: t,
            radiusX: 2.5,
            radiusY: 2.5,
            rotationAngle: 10,
            force: 0.5,
          },
          a,
        ),
      );
      t.dispatchEvent(
        new TouchEvent(e, {
          cancelable: !0,
          bubbles: !0,
          shiftKey: !0,
          touches: [i],
          targetTouches: [],
          changedTouches: [i],
        }),
      );
    },
  };
function vt(t, e) {
  var a = t;
  for (var i in e) a = a.replace(new RegExp('{='.concat(i, '}'), 'g'), e[i]);
  return tt(a);
}
function Ae(t) {
  var e, a;
  if (t instanceof Date) a = t;
  else if (H(t)) {
    var i = this,
      r = i.config,
      n = i.format;
    a = (e = n.dataTime(r.data_xFormat)(t)) !== null && e !== void 0 ? e : new Date(t);
  } else P(t) && !isNaN(t) && (a = new Date(+t));
  return (
    (!a || isNaN(+a)) &&
      console &&
      console.error &&
      console.error("Failed to parse x '".concat(t, "' to Date object")),
    a
  );
}
function Yt(t) {
  var e = t.attr('viewBox');
  return e ? /(\d+(\.\d+)?){3}/.test(e) : !1;
}
function Br(t, e, a) {
  a === void 0 && (a = !1);
  for (var i = !!t.node, r = !1, n = 0, o = Object.entries(e); n < o.length; n++) {
    var s = o[n],
      l = s[0],
      c = s[1];
    if (((r = i ? t.style(l) === c : t.style[l] === c), a === !1 && r)) break;
  }
  return r;
}
function gt() {
  return te?.hidden === !1 || te?.visibilityState === 'visible';
}
function Xr(t, e) {
  var a = X.DocumentTouch,
    i = X.matchMedia,
    r = X.navigator,
    n = i?.('(pointer:coarse)').matches,
    o = !1;
  if (e)
    if (r && 'maxTouchPoints' in r) o = r.maxTouchPoints > 0;
    else if ('ontouchmove' in X || (a && te instanceof a)) o = !0;
    else if (n) o = !0;
    else {
      var s = r.userAgent;
      o =
        /\b(BlackBerry|webOS|iPhone|IEMobile)\b/i.test(s) ||
        /\b(Android|Windows Phone|iPad|iPod)\b/i.test(s);
    }
  var l = t && !n && i?.('(pointer:fine)').matches;
  return (l && 'mouse') || (o && 'touch') || 'mouse';
}
function Xa(t, e) {
  e() === !1
    ? pr(function () {
        return Xa(t, e);
      })
    : t();
}
function Nr(t) {
  if (W(t) && !H(t)) {
    var e = t;
    return { top: e.top || 0, right: e.right || 0, bottom: e.bottom || 0, left: e.left || 0 };
  }
  var a = (H(t) ? t.trim().split(/\s+/) : [t]).map(function (u) {
      return +u || 0;
    }),
    i = a[0],
    r = a[1],
    n = r === void 0 ? i : r,
    o = a[2],
    s = o === void 0 ? i : o,
    l = a[3],
    c = l === void 0 ? n : l;
  return { top: i, right: n, bottom: s, left: c };
}
function Na(t, e) {
  t.pendingRaf !== null
    ? (X.cancelAnimationFrame(t.pendingRaf),
      (t.pendingRaf = X.requestAnimationFrame(function () {
        ((t.pendingRaf = null), e());
      })))
    : ((t.pendingRaf = X.requestAnimationFrame(function () {
        t.pendingRaf = null;
      })),
      e());
}
function Ga(t, e) {
  e === void 0 &&
    (e = function (i) {
      return i;
    });
  var a = new Set();
  return (
    Pa(t, function (i, r) {
      a.add(e(i, r));
    }),
    a
  );
}
function Va(t, e, a) {
  a === void 0 &&
    (a = function (r) {
      return r;
    });
  var i = new Map();
  return (
    Pa(t, function (r, n) {
      i.set(e(r, n), a(r, n));
    }),
    i
  );
}
var Ue = (function () {
    function t() {
      return Pr(cr, or, fr, sr, vr, lr, ur, dr, t.data);
    }
    return (
      (t.setOptions = function (e) {
        this.data = e.reduce(function (a, i) {
          return F(F({}, a), i);
        }, this.data);
      }),
      (t.data = {}),
      t
    );
  })(),
  Gr = (function () {
    function t() {
      var e = {
        chart: null,
        main: null,
        svg: null,
        axis: { x: null, y: null, y2: null, subX: null },
        axisTooltip: { x: null, y: null, y2: null },
        defs: null,
        tooltip: null,
        legend: null,
        title: null,
        subchart: { main: null, bar: null, line: null, area: null },
        arcs: null,
        bar: null,
        candlestick: null,
        line: null,
        area: null,
        circle: null,
        radar: null,
        text: null,
        grid: { main: null, x: null, y: null },
        gridLines: { main: null, x: null, y: null },
        region: { main: null, list: null },
        eventRect: null,
        zoomResetBtn: null,
      };
      return e;
    }
    return t;
  })(),
  Vr = (function () {
    function t() {
      return {
        width: 0,
        width2: 0,
        height: 0,
        height2: 0,
        margin: { top: 0, bottom: 0, left: 0, right: 0 },
        margin2: { top: 0, bottom: 0, left: 0, right: 0 },
        margin3: { top: 0, bottom: 0, left: 0, right: 0 },
        arcWidth: 0,
        arcHeight: 0,
        xAxisHeight: 0,
        hasAxis: !1,
        hasFunnel: !1,
        hasRadar: !1,
        hasTreemap: !1,
        cssRule: {},
        loading: void 0,
        domain: void 0,
        current: {
          domain: void 0,
          width: 0,
          height: 0,
          dataMax: 0,
          maxTickSize: {
            x: { width: 0, height: 0, ticks: [], clipPath: 0, domain: '' },
            y: { width: 0, height: 0, domain: '' },
            y2: { width: 0, height: 0, domain: '' },
          },
          types: [],
          needle: void 0,
          zoomDomain: null,
        },
        isLegendRight: !1,
        isLegendInset: !1,
        isLegendTop: !1,
        isLegendLeft: !1,
        legendStep: 0,
        legendItemWidth: 0,
        legendItemHeight: 0,
        legendHasRendered: !1,
        eventReceiver: { currentIdx: -1, rect: {}, data: [], coords: [] },
        axis: { x: { padding: { left: 0, right: 0 }, tickCount: 0 } },
        rotatedPadding: { left: 30, right: 0, top: 5 },
        withoutFadeIn: {},
        inputType: '',
        datetimeId: '',
        clip: {
          id: '',
          idXAxis: '',
          idYAxis: '',
          idXAxisTickTexts: '',
          idGrid: '',
          idSubchart: '',
          path: '',
          pathXAxis: '',
          pathYAxis: '',
          pathXAxisTickTexts: '',
          pathGrid: '',
        },
        event: null,
        dragStart: null,
        dragging: !1,
        flowing: !1,
        cancelClick: !1,
        mouseover: !1,
        rendered: !1,
        transiting: !1,
        redrawing: !1,
        resizing: !1,
        toggling: !1,
        zooming: !1,
        hasNegativeValue: !1,
        hasPositiveValue: !0,
        orgAreaOpacity: '0.2',
        orgConfig: {},
        hiddenTargetIds: [],
        hiddenLegendIds: [],
        focusedTargetIds: [],
        defocusedTargetIds: [],
        radius: 0,
        innerRadius: 0,
        outerRadius: void 0,
        innerRadiusRatio: 0,
        gaugeArcWidth: 0,
        radiusExpanded: 0,
        xgridAttr: { x1: null, x2: null, y1: null, y2: null },
        pendingRaf: null,
        rafBatchQueue: [],
      };
    }
    return t;
  })(),
  ra = { element: Gr, state: Vr },
  Yr = (function () {
    function t() {
      var e = this;
      Object.keys(ra).forEach(function (a) {
        e[a] = new ra[a]();
      });
    }
    return (
      (t.prototype.getStore = function (e) {
        return this[e];
      }),
      t
    );
  })(),
  re = {
    bubbleBaseLength: '$baseLength',
    colorPattern: '__colorPattern__',
    dataMinMax: '$dataMinMax',
    dataTotalSum: '$dataTotalSum',
    dataTotalPerIndex: '$totalPerIndex',
    filteredTargets: '$filteredTargets',
    visibilityChecksum: 'visibilityChecksum',
    legendItemTextBox: 'legendItemTextBox',
    legendItemMap: '$legendItemMap',
    radarPoints: '$radarPoints',
    radarTextWidth: '$radarTextWidth',
    setOverOut: 'setOverOut',
    callOverOutForTouch: 'callOverOutForTouch',
    textRect: 'textRect',
    shapeOffset: '$shapeOffset',
  },
  Hr = (function () {
    function t() {
      this.cache = {};
    }
    return (
      (t.prototype.add = function (e, a, i) {
        return (
          i === void 0 && (i = !1),
          (this.cache[e] = i ? this.cloneTarget(a) : a),
          this.cache[e]
        );
      }),
      (t.prototype.remove = function (e) {
        var a = this;
        (H(e) ? [e] : e).forEach(function (i) {
          return delete a.cache[i];
        });
      }),
      (t.prototype.get = function (e, a) {
        if ((a === void 0 && (a = !1), a && Array.isArray(e))) {
          for (var i = [], r = 0, n = void 0; (n = e[r]); r++)
            n in this.cache && i.push(this.cloneTarget(this.cache[n]));
          return i;
        } else {
          var o = this.cache[e];
          return N(o) ? o : null;
        }
      }),
      (t.prototype.has = function (e) {
        return e in this.cache && this.cache[e] !== null;
      }),
      (t.prototype.getKeys = function () {
        return Object.keys(this.cache);
      }),
      (t.prototype.reset = function (e) {
        var a = this;
        for (var i in a.cache) (e || /^\$/.test(i)) && (a.cache[i] = null);
      }),
      (t.prototype.cloneTarget = function (e) {
        return {
          id: e.id,
          id_org: e.id_org,
          values: e.values.map(function (a) {
            return { x: a.x, value: a.value, id: a.id };
          }),
        };
      }),
      t
    );
  })(),
  E = {
    AREA: 'area',
    AREA_LINE_RANGE: 'area-line-range',
    AREA_SPLINE: 'area-spline',
    AREA_SPLINE_RANGE: 'area-spline-range',
    AREA_STEP: 'area-step',
    AREA_STEP_RANGE: 'area-step-range',
    BAR: 'bar',
    BUBBLE: 'bubble',
    CANDLESTICK: 'candlestick',
    DONUT: 'donut',
    FUNNEL: 'funnel',
    GAUGE: 'gauge',
    LINE: 'line',
    PIE: 'pie',
    POLAR: 'polar',
    RADAR: 'radar',
    SCATTER: 'scatter',
    SPLINE: 'spline',
    STEP: 'step',
    TREEMAP: 'treemap',
  },
  Ct = {
    AREA: 'initArea',
    AREA_LINE_RANGE: 'initArea',
    AREA_SPLINE: 'initArea',
    AREA_SPLINE_RANGE: 'initArea',
    AREA_STEP: 'initArea',
    AREA_STEP_RANGE: 'initArea',
    BAR: 'initBar',
    BUBBLE: 'initCircle',
    CANDLESTICK: 'initCandlestick',
    DONUT: 'initArc',
    FUNNEL: 'initFunnel',
    GAUGE: 'initArc',
    LINE: 'initLine',
    PIE: 'initArc',
    POLAR: 'initPolar',
    RADAR: 'initCircle',
    SCATTER: 'initCircle',
    SPLINE: 'initLine',
    STEP: 'initLine',
    TREEMAP: 'initTreemap',
  },
  ze = {
    Area: [
      E.AREA,
      E.AREA_SPLINE,
      E.AREA_SPLINE_RANGE,
      E.AREA_LINE_RANGE,
      E.AREA_STEP,
      E.AREA_STEP_RANGE,
    ],
    AreaRange: [E.AREA_SPLINE_RANGE, E.AREA_LINE_RANGE, E.AREA_STEP_RANGE],
    Arc: [E.PIE, E.DONUT, E.GAUGE, E.POLAR, E.RADAR],
    Line: [
      E.LINE,
      E.SPLINE,
      E.AREA,
      E.AREA_SPLINE,
      E.AREA_SPLINE_RANGE,
      E.AREA_LINE_RANGE,
      E.STEP,
      E.AREA_STEP,
      E.AREA_STEP_RANGE,
    ],
    Step: [E.STEP, E.AREA_STEP, E.AREA_STEP_RANGE],
    Spline: [E.SPLINE, E.AREA_SPLINE, E.AREA_SPLINE_RANGE],
  };
function Wr(t) {
  var e = t,
    a = e.config,
    i = '';
  if ($e(a.data_type || a.data_types) && !e[Ct.LINE]) i = 'line';
  else
    for (var r in Ct) {
      var n = E[r];
      if (e.hasType(n) && !e[Ct[r]]) {
        i = n;
        break;
      }
    }
  i &&
    Ur(
      'Please, make sure if %c'.concat(Dr(i)),
      'module has been imported and specified correctly.',
      'https://github.com/naver/billboard.js/wiki/CHANGELOG-v2#modularization-by-its-functionality',
    );
}
function Ur(t, e, a) {
  var i,
    r = '[billboard.js]',
    n = (i = X.console) === null || i === void 0 ? void 0 : i.error;
  if (n) {
    var o = ['background:red;color:white;display:block;font-size:15px', e];
    (console.error.apply(
      console,
      ne(
        ['❌ '.concat(r, ' ').concat(t), 'background:red;color:white;display:block;font-size:15px'],
        o,
        !1,
      ),
    ),
      console.info('%cℹ️', 'font-size:15px', a));
  }
  throw Error(
    ''
      .concat(r, ' ')
      .concat(t.replace(/\%c([a-z-]+)/i, "'$1' "), ' ')
      .concat(e),
  );
}
var jr = X.setTimeout,
  Zr = X.clearTimeout;
function Kr(t) {
  var e = [],
    a,
    i = function () {
      (i.clear(),
        t === !1
          ? ka(
              function () {
                e.forEach(function (r) {
                  return r();
                });
              },
              { timeout: 200 },
            )
          : (a = jr(
              function () {
                e.forEach(function (r) {
                  return r();
                });
              },
              P(t) ? t : 200,
            )));
    };
  return (
    (i.clear = function () {
      a && (Zr(a), (a = null));
    }),
    (i.add = function (r) {
      return e.push(r);
    }),
    (i.remove = function (r) {
      return e.splice(e.indexOf(r), 1);
    }),
    i
  );
}
function Ya() {
  var t = [],
    e = function (a, i) {
      function r() {
        for (var n, o = 0, s = 0, l = void 0; (l = t[s]); s++) {
          if (l === !0 || (!((n = l.empty) === null || n === void 0) && n.call(l))) {
            o++;
            continue;
          }
          if (gt() === !1) {
            o = t.length;
            break;
          }
          try {
            l.transition();
          } catch {
            o++;
          }
        }
        return o === t.length;
      }
      Xa(function () {
        i?.();
      }, r);
    };
  return (
    (e.add = function (a) {
      j(a) ? (t = t.concat(a)) : t.push(a);
    }),
    e
  );
}
var Lt = {};
function qr(t, e) {
  var a,
    i = t.toString(),
    r = i.replace(/(function|[\s\W\n])/g, '').substring(0, 15);
  return (
    r in Lt ||
      (Lt[r] = new X.Blob(
        [
          ''
            .concat(
              (a = e?.map(String).join(';')) !== null && a !== void 0 ? a : '',
              `

			self.onmessage=function({data}) {
				const result = (`,
            )
            .concat(
              i,
              `).apply(null, data);
				self.postMessage(result);
			};`,
            ),
        ],
        { type: 'text/javascript' },
      )),
    X.URL.createObjectURL(Lt[r])
  );
}
function Jr(t) {
  var e = new X.Worker(t);
  return (
    (e.onerror = function (a) {
      console.error ? console.error(a) : console.log(a);
    }),
    e
  );
}
function Et(t, e, a, i) {
  t === void 0 && (t = !0);
  var r = function () {
    for (var s = [], l = 0; l < arguments.length; l++) s[l] = arguments[l];
    var c = e.apply(void 0, s);
    a(c);
  };
  if (X.Worker && t) {
    var n = qr(e, i),
      o = Jr(n);
    r = function () {
      for (var s = [], l = 0; l < arguments.length; l++) s[l] = arguments[l];
      (o.postMessage(s),
        (o.onmessage = function (c) {
          return (X.URL.revokeObjectURL(n), a(c.data));
        }));
    };
  }
  return r;
}
function Nt(t) {
  var e = [];
  return (
    t.forEach(function (a, i) {
      var r = a[0];
      a.forEach(function (n, o) {
        if (o > 0) {
          if ((typeof e[o - 1] > 'u' && (e[o - 1] = {}), typeof n > 'u'))
            throw new Error(
              'Source data is missing a component at ('.concat(i, ', ').concat(o, ')!'),
            );
          e[o - 1][r] = n;
        }
      });
    }),
    e
  );
}
function Gt(t) {
  var e = t[0],
    a = [];
  return (
    t.forEach(function (i, r) {
      if (r > 0) {
        var n = {};
        (i.forEach(function (o, s) {
          if (typeof o > 'u')
            throw new Error(
              'Source data is missing a component at ('.concat(r, ', ').concat(s, ')!'),
            );
          n[e[s]] = o;
        }),
          a.push(n));
      }
    }),
    a
  );
}
function Ha(t, e) {
  var a = [],
    i,
    r;
  if (Array.isArray(t)) {
    var n = function (o, s) {
      if (o[s] !== void 0) return o[s];
      var l = s.replace(/\[(\w+)\]/g, '.$1'),
        c = l.replace(/^\./, '').split('.'),
        u = o;
      return (
        c.some(function (d) {
          return !(u = u && d in u ? u[d] : void 0);
        }),
        u
      );
    };
    (e.x ? (i = e.value.concat(e.x)) : (i = e.value),
      a.push(i),
      t.forEach(function (o) {
        var s = i.map(function (l) {
          var c = n(o, l);
          return (typeof c > 'u' && (c = null), c);
        });
        a.push(s);
      }),
      (r = Gt(a)));
  } else
    (Object.keys(t).forEach(function (o) {
      var s,
        l = t[o].concat();
      ((s = l.unshift) === null || s === void 0 || s.call(l, o), a.push(l));
    }),
      (r = Nt(a)));
  return r;
}
function Qr(t, e, a, i, r) {
  e === void 0 && (e = 'csv');
  var n = new XMLHttpRequest(),
    o = { csv: en, tsv: tn, json: Ha };
  (n.open('GET', t),
    a &&
      Object.keys(a).forEach(function (s) {
        n.setRequestHeader(s, a[s]);
      }),
    (n.onreadystatechange = function () {
      if (n.readyState === 4)
        if (n.status === 200) {
          var s = n.responseText;
          s && r.call(this, o[e](e === 'json' ? JSON.parse(s) : s, i));
        } else throw new Error(''.concat(t, ': Something went wrong loading!'));
    }),
    n.send());
}
function Wa(t, e) {
  var a = t.rows(e),
    i;
  return (
    a.length === 1
      ? ((i = [{}]),
        a[0].forEach(function (r) {
          i[0][r] = null;
        }))
      : (i = t.parse(e)),
    i
  );
}
function en(t) {
  return Wa({ rows: tr, parse: er }, t);
}
function tn(t) {
  return Wa({ rows: ir, parse: ar }, t);
}
function na(t, e) {
  var a = t || e?.data_keys;
  return (a?.x && (e.data_x = a.x), a);
}
function an(t, e, a) {
  var i = this,
    r = this,
    n = r.config,
    o;
  t.forEach(function (s) {
    var l = r.getXKey(s);
    if (
      (a.customX || a.timeSeries
        ? a.xs.indexOf(l) >= 0
          ? (o = ((a.appendXs && r.data.xs[s]) || []).concat(
              e
                .map(function (c, u) {
                  var d = N(c[l]);
                  return d ? r.generateTargetX(d, s, u) : !1;
                })
                .filter(function (c) {
                  return c !== !1;
                }),
            ))
          : n.data_x
            ? (o = i.getOtherTargetXs())
            : le(n.data_xs) && (o = r.getXValuesOfXKey(l, r.data.targets))
        : (o = e.map(function (c, u) {
            return u;
          })),
      o)
    )
      r.data.xs[s] = o;
    else throw new Error('x is not defined for id = "'.concat(s, '".'));
  });
}
var rn = {
    convertData: function (t, e) {
      var a = this.config,
        i = function (n) {
          return n?.length && !$e(n[0]) ? a.boost_useWorker : !1;
        },
        r = t;
      if (
        (t.bindto &&
          ((r = {}),
          ['url', 'mimeType', 'headers', 'keys', 'json', 'keys', 'rows', 'columns'].forEach(
            function (n) {
              var o = 'data_'.concat(n);
              o in t && (r[n] = t[o]);
            },
          )),
        r.url && e)
      )
        Qr(r.url, r.mimeType, r.headers, na(r.keys, a), e);
      else if (r.json) Et(i(r.json), Ha, e, [Nt, Gt])(r.json, na(r.keys, a));
      else if (r.rows) Et(i(r.rows), Gt, e)(r.rows);
      else if (r.columns) Et(i(r.columns), Nt, e)(r.columns);
      else if (t.bindto) throw Error('url or json or rows or columns is required.');
    },
    convertDataToTargets: function (t, e) {
      var a = this,
        i = a.axis,
        r = a.config,
        n = a.state,
        o = r.data_type,
        s = Object.keys(t[0] || {}),
        l = s.length
          ? s.reduce(
              function (g, h) {
                return (a.isX.call(a, h) ? g.xs.push(h) : a.isNotX.call(a, h) && g.ids.push(h), g);
              },
              { ids: [], xs: [] },
            )
          : { ids: [], xs: [] },
        c = l.ids,
        u = l.xs,
        d = {
          appendXs: e,
          xs: u,
          idConverter: r.data_idConverter.bind(a.api),
          categorized: i?.isCategorized(),
          timeSeries: i?.isTimeSeries(),
          customX: i?.isCustomX(),
        };
      an.bind(a)(c, t, d);
      var f = c.map(function (g, h) {
        var p = r.data_idConverter.bind(a.api)(g),
          x = a.getXKey(g),
          _ = d.customX && d.categorized,
          m =
            _ &&
            (function () {
              var b = Ga(r.axis_x_categories);
              return t.every(function ($) {
                return b.has($.x);
              });
            })(),
          y = t.__append__,
          T = x === null && y ? a.api.data.values(g).length : 0;
        return {
          id: p,
          id_org: g,
          values: t
            .map(function (b, $) {
              var w = b[x],
                A = b[g],
                R;
              return (
                (A = A !== null && !isNaN(A) && !W(A) ? +A : j(A) || W(A) ? A : null),
                (_ || n.hasRadar) && h === 0 && !se(w)
                  ? (!m && h === 0 && $ === 0 && !y && (r.axis_x_categories = []),
                    (R = r.axis_x_categories.indexOf(w)),
                    R === -1 && ((R = r.axis_x_categories.length), r.axis_x_categories.push(w)))
                  : (R = a.generateTargetX(w, g, T + $)),
                (se(A) || a.data.xs[g].length <= $) && (R = void 0),
                { x: R, value: A, id: p, index: -1 }
              );
            })
            .filter(function (b) {
              return q(b.x);
            }),
        };
      });
      if (
        (f.forEach(function (g) {
          var h;
          (r.data_xSort &&
            (g.values = g.values.sort(function (p, x) {
              var _ = p.x || p.x === 0 ? p.x : 1 / 0,
                m = x.x || x.x === 0 ? x.x : 1 / 0;
              return _ - m;
            })),
            g.values.forEach(function (p, x) {
              return (p.index = x);
            }),
            (h = a.data.xs[g.id]) === null ||
              h === void 0 ||
              h.sort(function (p, x) {
                return p - x;
              }));
        }),
        (n.hasNegativeValue = a.hasNegativeValueInTargets(f)),
        (n.hasPositiveValue = a.hasPositiveValueInTargets(f)),
        o && a.isValidChartType(o))
      ) {
        var v = a.mapToIds(f).filter(function (g) {
          return !(g in r.data_types) || !a.isValidChartType(r.data_types[g]);
        });
        a.setTargetType(v, o);
      }
      return (
        f.forEach(function (g) {
          return a.cache.add(g.id_org, g, !0);
        }),
        f
      );
    },
  },
  nn = {
    isX: function (t) {
      var e = this,
        a = e.config,
        i = a.data_x && t === a.data_x,
        r = le(a.data_xs) && Or(a.data_xs, t);
      return i || r;
    },
    isNotX: function (t) {
      return !this.isX(t);
    },
    isStackNormalized: function () {
      var t = this.config;
      return !!(
        (t.data_stack_normalize === !0 || ye(t.data_stack_normalize)) &&
        t.data_groups.length
      );
    },
    isStackNormalizedPerGroup: function () {
      var t,
        e = this.config;
      return !!(
        ye(e.data_stack_normalize) &&
        !((t = e.data_stack_normalize) === null || t === void 0) &&
        t.perGroup &&
        e.data_groups.length
      );
    },
    isGrouped: function (t) {
      var e = this.config.data_groups;
      return t
        ? e.some(function (a) {
            return a.indexOf(t) >= 0 && a.length > 1;
          })
        : e.length > 0;
    },
    hasAxisGroupedData: function (t) {
      var e = this,
        a = e.axis,
        i = e.data.targets,
        r = i
          .filter(function (n) {
            return a.getId(n.id) === t;
          })
          .map(function (n) {
            return n.id;
          });
      return r.some(function (n) {
        return e.isGrouped(n);
      });
    },
    getXKey: function (t) {
      var e = this,
        a = e.config;
      return a.data_x ? a.data_x : le(a.data_xs) ? a.data_xs[t] : null;
    },
    getXValuesOfXKey: function (t, e) {
      var a = this,
        i = e && le(e) ? a.mapToIds(e) : [],
        r;
      return (
        i.forEach(function (n) {
          a.getXKey(n) === t && (r = a.data.xs[n]);
        }),
        r
      );
    },
    getIndexByX: function (t, e) {
      var a = this;
      return e
        ? e.indexOf(H(t) ? t : +t)
        : (a.filterByX(a.data.targets, t)[0] || { index: null }).index;
    },
    getXValue: function (t, e) {
      var a = this;
      return t in a.data.xs && a.data.xs[t] && N(a.data.xs[t][e]) ? a.data.xs[t][e] : e;
    },
    getOtherTargetXs: function () {
      var t = this,
        e = Object.keys(t.data.xs);
      return e.length ? t.data.xs[e[0]] : null;
    },
    getOtherTargetX: function (t) {
      var e = this.getOtherTargetXs();
      return e && t < e.length ? e[t] : null;
    },
    addXs: function (t) {
      var e = this,
        a = e.config;
      Object.keys(t).forEach(function (i) {
        a.data_xs[i] = t[i];
      });
    },
    isMultipleX: function () {
      return (
        !this.config.axis_x_forceAsSingle &&
        (le(this.config.data_xs) || this.hasType('bubble') || this.hasType('scatter'))
      );
    },
    addName: function (t) {
      var e = this,
        a = e.config,
        i;
      return (t && ((i = a.data_names[t.id]), (t.name = i !== void 0 ? i : t.id)), t);
    },
    getAllValuesOnIndex: function (t, e) {
      e === void 0 && (e = !1);
      var a = this,
        i = a.filterTargetsToShow(a.data.targets).map(function (r) {
          return a.addName(a.getValueOnIndex(r.values, t));
        });
      return (
        e &&
          (i = i.filter(function (r) {
            return r && 'value' in r && N(r.value);
          })),
        i
      );
    },
    getValueOnIndex: function (t, e) {
      var a = t.filter(function (i) {
        return i.index === e;
      });
      return a.length ? a[0] : null;
    },
    updateTargetX: function (t, e) {
      var a = this;
      t.forEach(function (i) {
        (i.values.forEach(function (r, n) {
          r.x = a.generateTargetX(e[n], i.id, n);
        }),
          (a.data.xs[i.id] = e));
      });
    },
    updateTargetXs: function (t, e) {
      var a = this;
      t.forEach(function (i) {
        e[i.id] && a.updateTargetX([i], e[i.id]);
      });
    },
    generateTargetX: function (t, e, a) {
      var i = this,
        r = i.axis,
        n = r?.isCategorized() ? a : t || a;
      if (r?.isTimeSeries()) {
        var o = Ae.bind(i);
        n = o(t || i.getXValue(e, a));
      } else r?.isCustomX() && !r?.isCategorized() && (n = N(t) ? +t : i.getXValue(e, a));
      return n;
    },
    updateXs: function (t) {
      t.length &&
        (this.axis.xs = t.map(function (e) {
          return e.x;
        }));
    },
    getPrevX: function (t) {
      var e = this.axis.xs[t - 1];
      return q(e) ? e : null;
    },
    getNextX: function (t) {
      var e = this.axis.xs[t + 1];
      return q(e) ? e : null;
    },
    getBaseValue: function (t) {
      var e = this,
        a = e.state.hasAxis,
        i = t.value;
      return (
        i &&
          a &&
          (e.isAreaRangeType(t)
            ? (i = e.getRangedData(t, 'mid'))
            : e.isBubbleZType(t) && (i = e.getBubbleZData(i, 'y'))),
        i
      );
    },
    getMinMaxValue: function (t) {
      var e = this.getBaseValue.bind(this),
        a,
        i;
      return (
        (
          t ||
          this.data.targets.map(function (r) {
            return r.values;
          })
        ).forEach(function (r, n) {
          var o = r.map(e).filter(P);
          ((a = Math.min.apply(Math, ne([n ? a : 1 / 0], o, !1))),
            (i = Math.max.apply(Math, ne([n ? i : -1 / 0], o, !1))));
        }),
        { min: a, max: i }
      );
    },
    getMinMaxData: function () {
      var t = this,
        e = re.dataMinMax,
        a = t.cache.get(e);
      if (!a) {
        var i = t.data.targets.map(function (c) {
            return c.values;
          }),
          r = t.getMinMaxValue(i),
          n = [],
          o = [],
          s = r.min,
          l = r.max;
        (i.forEach(function (c) {
          var u = t.getFilteredDataByValue(c, s),
            d = t.getFilteredDataByValue(c, l);
          (u.length && (n = n.concat(u)), d.length && (o = o.concat(d)));
        }),
          t.cache.add(e, (a = { min: n, max: o })));
      }
      return a;
    },
    getTotalPerIndex: function (t) {
      var e = this,
        a = e.config,
        i = t ? ''.concat(re.dataTotalPerIndex, '-').concat(t) : re.dataTotalPerIndex,
        r = e.cache.get(i);
      if ((e.config.data_groups.length || e.isStackNormalized()) && !r) {
        r = [];
        var n = e.data.targets;
        if (e.isStackNormalizedPerGroup() && t) {
          var o = a.data_groups.find(function (s) {
            return s.indexOf(t) >= 0;
          });
          if (o)
            n = n.filter(function (s) {
              return o.indexOf(s.id) >= 0;
            });
          else return null;
        }
        (n.forEach(function (s) {
          s.values.forEach(function (l, c) {
            (r[c] || (r[c] = 0), (r[c] += ~~l.value));
          });
        }),
          e.cache.add(i, r));
      }
      return r;
    },
    getTotalDataSum: function (t) {
      var e = this,
        a = re.dataTotalSum,
        i = e.cache.get(a);
      return (
        P(i) ||
          ((i = e.data.targets.reduce(function (r, n) {
            return (
              r +
              n.values.reduce(function (o, s) {
                var l;
                return o + ((l = s.value) !== null && l !== void 0 ? l : 0);
              }, 0)
            );
          }, 0)),
          e.cache.add(a, i)),
        t && (i -= e.getHiddenTotalDataSum()),
        i
      );
    },
    getHiddenTotalDataSum: function () {
      var t = this,
        e = t.api,
        a = t.state.hiddenTargetIds,
        i = 0;
      return (
        a.length &&
          (i = e.data.values
            .bind(e)(a)
            .reduce(function (r, n) {
              return r + n;
            })),
        i
      );
    },
    getFilteredDataByValue: function (t, e) {
      var a = this;
      return t.filter(function (i) {
        return a.getBaseValue(i) === e;
      });
    },
    getMaxDataCount: function () {
      return Math.max.apply(
        Math,
        ne(
          ne(
            [],
            this.data.targets.map(function (t) {
              return t.values.length;
            }),
            !1,
          ),
          [0],
          !1,
        ),
      );
    },
    getMaxDataCountTarget: function () {
      var t = this.filterTargetsToShow() || [],
        e = t.length,
        a = this.config.axis_x_inverted;
      return (
        e > 1
          ? ((t = t
              .map(function (i) {
                return i.values;
              })
              .reduce(function (i, r) {
                return i.concat(r);
              })
              .map(function (i) {
                return i.x;
              })),
            (t = rt(Xt(t)).map(function (i, r, n) {
              return { x: i, index: a ? n.length - r - 1 : r };
            })))
          : e && (t = t[0].values.concat()),
        t
      );
    },
    mapToIds: function (t) {
      return t.map(function (e) {
        return e.id;
      });
    },
    mapToTargetIds: function (t) {
      var e = this;
      return t ? (j(t) ? t.concat() : [t]) : e.mapToIds(e.data.targets);
    },
    hasTarget: function (t, e) {
      for (var a = this.mapToIds(t), i = 0, r = void 0; (r = a[i]); i++) if (r === e) return !0;
      return !1;
    },
    isTargetToShow: function (t) {
      return this.state.hiddenTargetIds.indexOf(t) < 0;
    },
    isLegendToShow: function (t) {
      return this.state.hiddenLegendIds.indexOf(t) < 0;
    },
    filterTargetsToShow: function (t) {
      var e = this;
      if (!t) {
        var a = e.cache,
          i = e.data,
          r = e.state,
          n = re.filteredTargets,
          o = r.hiddenTargetIds.join(','),
          s = a.get(re.visibilityChecksum);
        if ((o !== s && (a.remove(n), a.add(re.visibilityChecksum, o)), a.has(n))) return a.get(n);
        var l = i.targets.filter(function (c) {
          return e.isTargetToShow(c.id);
        });
        return (a.add(n, l), l);
      }
      return t.filter(function (c) {
        return e.isTargetToShow(c.id);
      });
    },
    mapTargetsToUniqueXs: function (t) {
      var e = this,
        a = e.axis,
        i = [];
      return (
        t?.length &&
          ((i = Xt(
            ia(
              t.map(function (r) {
                return r.values.map(function (n) {
                  return +n.x;
                });
              }),
            ),
          )),
          (i = a?.isTimeSeries()
            ? i.map(function (r) {
                return new Date(+r);
              })
            : i.map(Number))),
        rt(i)
      );
    },
    addTargetIds: function (t, e) {
      var a = this.state,
        i = j(e) ? e : [e];
      i.forEach(function (r) {
        a[t].indexOf(r) < 0 && a[t].push(r);
      });
    },
    removeTargetIds: function (t, e) {
      var a = this.state,
        i = j(e) ? e : [e];
      i.forEach(function (r) {
        var n = a[t].indexOf(r);
        n >= 0 && a[t].splice(n, 1);
      });
    },
    addHiddenTargetIds: function (t) {
      this.addTargetIds('hiddenTargetIds', t);
    },
    removeHiddenTargetIds: function (t) {
      this.removeTargetIds('hiddenTargetIds', t);
    },
    addHiddenLegendIds: function (t) {
      this.addTargetIds('hiddenLegendIds', t);
    },
    removeHiddenLegendIds: function (t) {
      this.removeTargetIds('hiddenLegendIds', t);
    },
    getValuesAsIdKeyed: function (t) {
      var e = this,
        a = e.state.hasAxis,
        i = {},
        r = e.isMultipleX(),
        n = r
          ? e.mapTargetsToUniqueXs(t).map(function (s) {
              return H(s) ? s : +s;
            })
          : null,
        o = n
          ? new Map(
              n.map(function (s, l) {
                return [s, l];
              }),
            )
          : null;
      return (
        t.forEach(function (s) {
          var l = [];
          (s.values
            .filter(function (c) {
              var u = c.value;
              return N(u) || u === null;
            })
            .forEach(function (c) {
              var u = c.value;
              if (
                (u !== null &&
                  e.isCandlestickType(c) &&
                  (u = j(u) ? u.slice(0, 4) : [u.open, u.high, u.low, u.close]),
                j(u))
              )
                l.push.apply(l, u);
              else if (W(u) && 'high' in u) l.push.apply(l, Object.values(u));
              else if (e.isBubbleZType(c)) l.push(a && e.getBubbleZData(u, 'y'));
              else if (r && o) {
                var d = H(c.x) ? c.x : +c.x,
                  f = o.get(d);
                f !== void 0 && (l[f] = u);
              } else l.push(u);
            }),
            (i[s.id] = l));
        }),
        i
      );
    },
    checkValueInTargets: function (t, e) {
      return Object.keys(t).some(function (a) {
        return t[a].values.some(function (i) {
          return e(i.value);
        });
      });
    },
    hasMultiTargets: function () {
      return this.filterTargetsToShow().length > 1;
    },
    hasNegativeValueInTargets: function (t) {
      return this.checkValueInTargets(t, function (e) {
        return e < 0;
      });
    },
    hasPositiveValueInTargets: function (t) {
      return this.checkValueInTargets(t, function (e) {
        return e > 0;
      });
    },
    orderTargets: function (t) {
      var e = this,
        a = ne([], t, !0),
        i = e.getSortCompareFn();
      return (i && a.sort(i), a);
    },
    getSortCompareFn: function (t) {
      t === void 0 && (t = !1);
      var e = this,
        a = e.config,
        i = a.data_order,
        r = /asc/i.test(i),
        n = /desc/i.test(i),
        o;
      if (r || n) {
        var s = function (c, u) {
            return c + Math.abs(u.value);
          },
          l = function (c) {
            return P(c) ? c : 'values' in c ? c.values.reduce(s, 0) : c.value;
          };
        o = function (c, u) {
          var d = l(c),
            f = l(u);
          return t ? (r ? d - f : f - d) : r ? f - d : d - f;
        };
      } else I(i) && (o = i.bind(e.api));
      return o || null;
    },
    filterByX: function (t, e) {
      return ia(
        t.map(function (a) {
          return a.values;
        }),
      ).filter(function (a) {
        return a.x - e === 0;
      });
    },
    filterNullish: function (t) {
      var e = function (a) {
        return N(a.value);
      };
      return (
        t &&
        t.filter(function (a) {
          return 'value' in a ? e(a) : a.values.some(e);
        })
      );
    },
    filterRemoveNull: function (t) {
      var e = this;
      return t.filter(function (a) {
        return N(e.getBaseValue(a));
      });
    },
    filterByXDomain: function (t, e) {
      return t.map(function (a) {
        return {
          id: a.id,
          id_org: a.id_org,
          values: a.values.filter(function (i) {
            return e[0] <= i.x && i.x <= e[1];
          }),
        };
      });
    },
    hasDataLabel: function () {
      var t = this.config.data_labels;
      return (Mt(t) && t) || (ye(t) && le(t));
    },
    hasNullDataValue: function (t) {
      return t.some(function (e) {
        var a = e.value;
        return a === null;
      });
    },
    getDataIndexFromEvent: function (t) {
      var e = this,
        a = e.$el,
        i = e.config,
        r = e.state,
        n = r.hasRadar,
        o = r.inputType,
        s = r.eventReceiver,
        l = s.coords,
        c = s.rect,
        u;
      if (n) {
        var d = t.target;
        /tspan/i.test(d.tagName) && (d = d.parentNode);
        var f = L(d).datum();
        u = f && Object.keys(f).length === 1 ? f.index : void 0;
      } else {
        var v = i.axis_rotated,
          g = Ba(a.chart.node()),
          h = o === 'touch' && t.changedTouches ? t.changedTouches[0] : t,
          p = v ? h.clientY + g.y : h.clientX + g.x;
        if (Yt(a.svg)) {
          var x = [p, 0];
          (v && x.reverse(),
            (p = Tt.apply(void 0, ne([a.eventRect.node()], x, !1))[v ? 'y' : 'x']));
        } else p -= v ? c.top : c.left;
        u = Bt(l, p, 0, l.length - 1, v);
      }
      return u;
    },
    getDataLabelLength: function (t, e, a) {
      var i,
        r = this,
        n = 1.3;
      return (
        ((i = r.getTextRect(
          [t, e].map(function (o) {
            return r.dataLabelFormat()(o);
          }),
        )) === null || i === void 0
          ? void 0
          : i.map(function (o) {
              return o[a] * n;
            })) || [0, 0]
      );
    },
    isNoneArc: function (t) {
      return this.hasTarget(this.data.targets, t.id);
    },
    isArc: function (t) {
      return 'data' in t && this.hasTarget(this.data.targets, t.data.id);
    },
    findSameXOfValues: function (t, e) {
      var a = t[e].x,
        i = [],
        r;
      for (r = e - 1; r >= 0 && a === t[r].x; r--) i.push(t[r]);
      for (r = e; r < t.length && a === t[r].x; r++) i.push(t[r]);
      return i;
    },
    findClosestFromTargets: function (t, e) {
      var a = this,
        i = t.map(function (r) {
          return a.findClosest(r.values, e);
        });
      return a.findClosest(i, e);
    },
    findClosest: function (t, e) {
      var a = this,
        i = a.$el.main,
        r = t.filter(function (s) {
          return s && N(s.value);
        }),
        n,
        o;
      return (
        r
          .filter(function (s) {
            return a.isBarType(s.id) || a.isCandlestickType(s.id);
          })
          .forEach(function (s) {
            var l = a.isBarType(s.id)
              ? '.'
                  .concat(_e.chartBar, '.')
                  .concat(z.target)
                  .concat(a.getTargetSelectorSuffix(s.id), ' .')
                  .concat(_e.bar, '-')
                  .concat(s.index)
              : '.'
                  .concat(ke.chartCandlestick, '.')
                  .concat(z.target)
                  .concat(a.getTargetSelectorSuffix(s.id), ' .')
                  .concat(ke.candlestick, '-')
                  .concat(s.index, ' path');
            !o && a.isWithinBar(i.select(l).node()) && (o = s);
          }),
        r
          .filter(function (s) {
            return !a.isBarType(s.id) && !a.isCandlestickType(s.id);
          })
          .forEach(function (s) {
            var l = a.dist(s, e);
            ((n = a.getPointSensitivity(s)), l < n && ((n = l), (o = s)));
          }),
        o
      );
    },
    dist: function (t, e) {
      var a = this,
        i = a.config.axis_rotated,
        r = a.scale,
        n = +i,
        o = +!i,
        s = a.circleY(t, t.index),
        l = (r.zoom || r.x)(t.x);
      return Math.sqrt(Math.pow(l - e[n], 2) + Math.pow(s - e[o], 2));
    },
    convertValuesToStep: function (t) {
      var e = this,
        a = e.axis,
        i = e.config,
        r = i.line_step_type,
        n = a ? a.isCategorized() : !1,
        o = j(t) ? t.concat() : [t];
      if (!(n || /step\-(after|before)/.test(r))) return t;
      if (o.length) {
        var s = o[0],
          l = o[o.length - 1],
          c = s.id,
          u = s.x;
        (o.unshift({ x: --u, value: s.value, id: c }),
          n && r === 'step-after' && o.unshift({ x: --u, value: s.value, id: c }),
          (u = l.x),
          o.push({ x: ++u, value: l.value, id: c }),
          n && r === 'step-before' && o.push({ x: ++u, value: l.value, id: c }));
      }
      return o;
    },
    convertValuesToRange: function (t) {
      var e = j(t) ? t.concat() : [t],
        a = [];
      return (
        e.forEach(function (i) {
          var r = i.x,
            n = i.id;
          (a.push({ x: r, id: n, value: i.value[0] }), a.push({ x: r, id: n, value: i.value[2] }));
        }),
        a
      );
    },
    updateDataAttributes: function (t, e) {
      var a = this,
        i = a.config,
        r = i['data_'.concat(t)];
      return (
        se(e) ||
          (Object.keys(e).forEach(function (n) {
            r[n] = e[n];
          }),
          a.redraw({ withLegend: !0 })),
        r
      );
    },
    getRangedData: function (t, e, a) {
      (e === void 0 && (e = ''), a === void 0 && (a = 'areaRange'));
      var i = t?.value;
      if (j(i)) {
        if (a === 'bar')
          return i.reduce(function (n, o) {
            return o - n;
          });
        var r = {
          areaRange: ['high', 'mid', 'low'],
          candlestick: ['open', 'high', 'low', 'close', 'volume'],
        }[a].indexOf(e);
        return r >= 0 && i ? i[r] : void 0;
      } else if (i && e) return i[e];
      return i;
    },
    setRatioForGroupedData: function (t) {
      var e = this,
        a = e.config;
      if (
        a.data_groups.length &&
        t.some(function (r) {
          return e.isGrouped(r.id);
        })
      ) {
        var i = function (r) {
          return e.getRatio('index', r, !0);
        };
        t.forEach(function (r) {
          'values' in r ? r.values.forEach(i) : i(r);
        });
      }
    },
    getRatio: function (t, e, a) {
      a === void 0 && (a = !1);
      var i = this,
        r = i.config,
        n = i.state,
        o = i.api,
        s = 0;
      if (e && o.data.shown().length)
        if (((s = e.ratio || e.value), t === 'arc'))
          if (i.pie.padAngle()()) s = e.value / i.getTotalDataSum(!0);
          else {
            var l = r.gauge_fullCircle ? i.getArcLength() : i.getStartingAngle() * -2,
              c = i.hasType('gauge') ? l : Math.PI * 2;
            s = (e.endAngle - e.startAngle) / c;
          }
        else if (t === 'index') {
          var u = o.data.values.bind(o),
            d = n.hiddenTargetIds,
            f = this.getTotalPerIndex(i.isStackNormalizedPerGroup() ? e.id : void 0);
          if (f === null) return s;
          if (d.length) {
            var v = d;
            if (i.isStackNormalizedPerGroup() && e.id) {
              var g = r.data_groups.find(function (m) {
                return m.indexOf(e.id) >= 0;
              });
              g &&
                (v = v.filter(function (m) {
                  return g.indexOf(m) >= 0;
                }));
            }
            if (v.length) {
              var h = u(v, !1);
              h.length &&
                ((h = h.reduce(function (m, y) {
                  return m.map(function (T, b) {
                    return ~~T + y[b];
                  });
                })),
                (f = f.map(function (m, y) {
                  return m - h[y];
                })));
            }
          }
          var p = f[e.index];
          ((e.ratio = P(e.value) && f && p ? e.value / p : 0), (s = e.ratio));
        } else if (t === 'radar')
          s = (parseFloat(String(Math.max(e.value, 0))) / n.current.dataMax) * r.radar_size_ratio;
        else if (t === 'bar') {
          var x = i.getYScaleById.bind(i)(e.id),
            _ = x.domain().reduce(function (m, y) {
              return y - m;
            });
          s = _ === 0 ? 0 : Math.abs(i.getRangedData(e, null, t) / _);
        } else t === 'treemap' && (s /= i.getTotalDataSum(!0));
      return a && s ? s * 100 : s;
    },
    updateDataIndexByX: function (t) {
      var e = this,
        a = t.reduce(function (i, r, n) {
          return ((i[Number(r.x)] = n), i);
        }, {});
      e.data.targets.forEach(function (i) {
        i.values.forEach(function (r, n) {
          var o = a[Number(r.x)];
          (o === void 0 && (o = n), (r.index = o));
        });
      });
    },
    isBubbleZType: function (t) {
      var e = this;
      return (
        e.isBubbleType(t) &&
        ((W(t.value) && ('z' in t.value || 'y' in t.value)) || (j(t.value) && t.value.length >= 2))
      );
    },
    isBarRangeType: function (t) {
      var e = this,
        a = t.value;
      return e.isBarType(t) && j(a) && a.length >= 2 && a.every(P);
    },
    getDataById: function (t) {
      var e,
        a = this.cache.get(t) || this.api.data(t);
      return (e = a?.[0]) !== null && e !== void 0 ? e : a;
    },
  };
function Ua(t, e) {
  e === void 0 && (e = !1);
  var a = this,
    i = a.api;
  (e && a.api.flush(!0), t?.call(i));
}
var on = {
    load: function (t, e) {
      var a = this,
        i = a.axis,
        r = a.data,
        n = a.org,
        o = a.scale,
        s = e.append,
        l = { domain: null, currentDomain: null, x: null },
        c = t;
      (c &&
        (e.filter && (c = c.filter(e.filter)),
        (e.type || e.types) &&
          c.forEach(function (u) {
            var d,
              f = ((d = e.types) === null || d === void 0 ? void 0 : d[u.id]) || e.type;
            a.setTargetType(u.id, f);
          }),
        r.targets.forEach(function (u) {
          for (var d = 0; d < c.length; d++)
            if (u.id === c[d].id) {
              ((u.values = s ? u.values.concat(c[d].values) : c[d].values), c.splice(d, 1));
              break;
            }
        }),
        (r.targets = r.targets.concat(c))),
        a.updateTargets(r.targets),
        o.zoom &&
          ((l.x = i.isCategorized() ? o.x.orgScale() : (n.xScale || o.x).copy()),
          (l.domain = a.getXDomain(r.targets)),
          l.x.domain(l.domain),
          (l.currentDomain = a.zoom.getDomain()),
          a.withinRange(l.currentDomain, void 0, l.domain) ||
            (o.x.domain(l.domain), (o.zoom = null), a.$el.eventRect.property('__zoom', null))),
        a.redraw({ withUpdateOrgXDomain: !0, withUpdateXDomain: !0, withLegend: !0 }),
        o.zoom
          ? ((n.xDomain = l.domain),
            (n.xScale = l.x),
            i.isCategorized() &&
              ((l.currentDomain = a.getZoomDomainValue(l.currentDomain)),
              (n.xDomain = a.getZoomDomainValue(n.xDomain)),
              (n.xScale = l.x.domain(n.xDomain))),
            a.updateCurrentZoomTransform(l.x, l.currentDomain))
          : n.xScale && n.xScale.domain(n.xDomain),
        a.updateTypesElements(),
        Ua.call(a, e.done, e.resizeAfter));
    },
    loadFromArgs: function (t) {
      var e = this;
      e.config &&
        (e.cache.reset(),
        e.convertData(t, function (a) {
          var i = t.data || a;
          (t.append && (i.__append__ = !0), i && e.load(e.convertDataToTargets.call(e, i), t));
        }));
    },
    unload: function (t, e) {
      var a,
        i = this,
        r = i.state,
        n = i.$el,
        o = i.$T,
        s = !!(!((a = i.hasLegendDefsPoint) === null || a === void 0) && a.call(i)),
        l = e,
        c = t;
      if (
        (i.cache.reset(),
        l || (l = function () {}),
        (c = c.filter(function (d) {
          return i.hasTarget(i.data.targets, d);
        })),
        !c || c.length === 0)
      ) {
        l();
        return;
      }
      (c.forEach(function (d) {
        var f,
          v = i.getTargetSelectorSuffix(d);
        ((r.withoutFadeIn[d] = !1),
          n.legend && n.legend.selectAll('.'.concat(K.legendItem).concat(v)).remove(),
          (i.data.targets = i.data.targets.filter(function (g) {
            return g.id !== d;
          })),
          s &&
            ((f = n.defs) === null ||
              f === void 0 ||
              f.select('#'.concat(i.getDefsPointId(v))).remove()));
      }),
        r.hasFunnel && i.updateFunnel(i.data.targets),
        r.hasTreemap && i.updateTargetsForTreemap(i.data.targets),
        i.updateTypesElements());
      var u = n.svg.selectAll(
        c.map(function (d) {
          return i.selectorTarget(d);
        }),
      );
      o(u).style('opacity', '0').remove().call(bt, l);
    },
  },
  sn = {
    setExpand: function (t, e, a) {
      var i = this,
        r = i.config,
        n = i.$el.circle;
      (n && r.point_focus_expand_enabled && i.expandCircles(t, e, a),
        i.expandBarTypeShapes(!0, t, e, a));
    },
    expandBarTypeShapes: function (t, e, a, i) {
      t === void 0 && (t = !0);
      var r = this;
      ['bar', 'candlestick']
        .filter(function (n) {
          return r.$el[n];
        })
        .forEach(function (n) {
          (i && r.$el[n].classed(z.EXPANDED, !1),
            r.getShapeByIndex(n, e, a).classed(z.EXPANDED, t));
        });
    },
    setOverOut: function (t, e) {
      var a = this,
        i = a.config,
        r = a.state,
        n = r.hasFunnel,
        o = r.hasRadar,
        s = r.hasTreemap,
        l = a.$el.main,
        c = W(e);
      if (c || e !== -1) {
        var u = i[t ? 'data_onover' : 'data_onout'].bind(a.api);
        if ((i.color_onover && a.setOverColor(t, e, c), c)) {
          var d = a.getTargetSelectorSuffix(e.id),
            f = n || s ? ''.concat(z.target + d, ' .').concat(oe.shape) : V.arc + d;
          u(e, l.select('.'.concat(f)).node());
        } else if (i.tooltip_grouped)
          (t &&
            (o && a.isPointFocusOnly()
              ? a.showCircleFocus(a.getAllValuesOnIndex(e, !0))
              : a.setExpand(e, null, !0)),
            !a.isMultipleX() &&
              l.selectAll('.'.concat(oe.shape, '-').concat(e)).each(function (x) {
                u(x, this);
              }));
        else {
          var v = a.cache.get(re.setOverOut) || [],
            g = l.selectAll('.'.concat(oe.shape, '-').concat(e)).filter(function (x) {
              return a.isWithinShape(this, x);
            }),
            h = g.filter(function () {
              var x = this;
              return v.every(function (_) {
                return _ !== x;
              });
            });
          if (
            !t ||
            g.empty() ||
            (v.length === h.size() &&
              h.nodes().every(function (x, _) {
                return x !== v[_];
              }))
          )
            for (; v.length; ) {
              var p = v.pop();
              i.data_onout.bind(a.api)(L(p).datum(), p);
            }
          (h.each(function () {
            t && (u(L(this).datum(), this), v.push(this));
          }),
            a.cache.add(re.setOverOut, v));
        }
      }
    },
    callOverOutForTouch: function (t) {
      var e = this,
        a = e.cache.get(re.callOverOutForTouch);
      (W(t) && a ? t.id !== a.id : t !== a) &&
        ((a || P(a)) && e.setOverOut(!1, a),
        (t || P(t)) && e.setOverOut(!0, t),
        e.cache.add(re.callOverOutForTouch, t));
    },
    getDraggableSelection: function () {
      var t = this,
        e = t.config,
        a = t.state;
      return e.interaction_enabled && e.data_selection_draggable && t.drag
        ? $a()
            .on('drag', function (i) {
              ((a.event = i), t.drag(Te(i, this)));
            })
            .on('start', function (i) {
              ((a.event = i), t.dragstart(Te(i, this)));
            })
            .on('end', function (i) {
              ((a.event = i), t.dragend());
            })
        : function () {};
    },
    dispatchEvent: function (t, e, a) {
      var i,
        r,
        n,
        o = this,
        s = o.config,
        l = o.state,
        c = l.eventReceiver,
        u = l.hasAxis,
        d = l.hasFunnel,
        f = l.hasRadar,
        v = l.hasTreemap,
        g = o.$el,
        h = g.eventRect,
        p = g.funnel,
        x = g.radar,
        _ = g.svg,
        m = g.treemap,
        y =
          (n =
            (r =
              ((d || v) && c.rect) ||
              (f && x.axes.select('.'.concat(ue.axis, '-').concat(e, ' text'))) ||
              h ||
              ((i = o.getArcElementByIdOrIndex) === null || i === void 0
                ? void 0
                : i.call(o, e))) === null || r === void 0
              ? void 0
              : r.node) === null || n === void 0
            ? void 0
            : n.call(r);
      if (y) {
        var T = o.isMultipleX(),
          b = s.axis_rotated,
          $ = fe(y),
          w = $.width,
          A = $.left,
          R = $.top;
        if (u && !f && !T) {
          var C = c.coords[e];
          C ? ((w = C.w), (A += C.x), (R += C.y)) : ((w = 0), (A = 0), (R = 0));
        }
        var S = A + (a ? a[0] : 0) + (T || b ? 0 : w / 2),
          M = R + (a ? a[1] : 0) + (b ? 4 : 0);
        if (Yt(_)) {
          var k = Tt(o.$el.eventRect.node(), S, M, !1);
          ((S = k.x), (M = k.y));
        }
        var Z = { screenX: S, screenY: M, clientX: S, clientY: M, bubbles: f };
        ((d || v) && (y = (p ?? m).node()),
          Mr[/^(mouse|click)/.test(t) ? 'mouse' : 'touch'](y, t, Z));
      }
    },
    setDragStatus: function (t) {
      this.state.dragging = t;
    },
    unbindZoomEvent: function () {
      var t = this,
        e = t.$el,
        a = e.eventRect,
        i = e.zoomResetBtn;
      (a?.on('.zoom wheel.zoom .drag', null), i?.on('click', null).style('display', 'none'));
    },
    unbindAllEvents: function () {
      var t,
        e = this,
        a = e.$el,
        i = a.arcs,
        r = a.eventRect,
        n = a.legend,
        o = a.region,
        s = a.svg,
        l = a.treemap,
        c = e.brush,
        u = [
          'wheel',
          'click',
          'mouseover',
          'mousemove',
          'mouseout',
          'touchstart',
          'touchmove',
          'touchend',
          'touchstart.eventRect',
          'touchmove.eventRect',
          'touchend.eventRect',
          '.brush',
          '.drag',
          '.zoom',
          'wheel.zoom',
          'dblclick.zoom',
        ].join(' ');
      ([s, r, o?.list, c?.getSelection(), i?.selectAll('path'), n?.selectAll('g'), l].forEach(
        function (d) {
          return d?.on(u, null);
        },
      ),
        (t = e.unbindZoomEvent) === null || t === void 0 || t.call(e));
    },
  },
  ln = {
    categoryName: function (t) {
      var e,
        a = this.config.axis_x_categories;
      return (e = a?.[t]) !== null && e !== void 0 ? e : t;
    },
  },
  cn = {
    generateClass: function (t, e) {
      return ' '.concat(t, ' ').concat(t + this.getTargetSelectorSuffix(e));
    },
    getClass: function (t, e) {
      var a = this,
        i = /s$/.test(t),
        r = /^(area|arc|line|funnel|treemap)s?$/.test(t),
        n = i ? 'id' : 'index';
      return function (o) {
        var s = o.data || o,
          l =
            (e ? a.generateClass(U[i ? 'shapes' : 'shape'], s[n]) : '') +
            a.generateClass(U[t], s[r ? 'id' : n]);
        return l.trim();
      };
    },
    getChartClass: function (t) {
      var e = this;
      return function (a) {
        return U['chart'.concat(t)] + e.classTarget((a.data ? a.data : a).id);
      };
    },
    generateExtraLineClass: function () {
      var t = this,
        e = t.config.line_classes || [],
        a = [];
      return function (i) {
        var r,
          n = i.id || ((r = i.data) === null || r === void 0 ? void 0 : r.id) || i;
        return (a.indexOf(n) < 0 && a.push(n), e[a.indexOf(n) % e.length]);
      };
    },
    classRegion: function (t, e) {
      return ''.concat(this.generateClass(U.region, e), ' ').concat('class' in t ? t.class : '');
    },
    classTarget: function (t) {
      var e = this.config.data_classes[t],
        a = '';
      return (e && (a = ' '.concat(U.target, '-').concat(e)), this.generateClass(U.target, t) + a);
    },
    classFocus: function (t) {
      return this.classFocused(t) + this.classDefocused(t);
    },
    classFocused: function (t) {
      return ' '.concat(this.state.focusedTargetIds.indexOf(t.id) >= 0 ? U.focused : '');
    },
    classDefocused: function (t) {
      return ' '.concat(this.state.defocusedTargetIds.indexOf(t.id) >= 0 ? U.defocused : '');
    },
    getTargetSelectorSuffix: function (t) {
      var e = t || t === 0 ? '-'.concat(t) : '';
      return e.replace(/[\x00-\x20\x7F-\xA0\s?!@#$%^&*()_=+,.<>'":;\[\]\/|~`{}\\]/g, '-');
    },
    selectorTarget: function (t, e, a) {
      (e === void 0 && (e = ''), a === void 0 && (a = ''));
      var i = this.getTargetSelectorSuffix(t);
      return ''
        .concat(e, '.')
        .concat(U.target + i, ' ')
        .concat(a, ', ')
        .concat(e, '.')
        .concat(U.circles + i, ' ')
        .concat(a);
    },
    selectorTargets: function (t, e) {
      var a = this,
        i = t || [];
      return i.length
        ? i.map(function (r) {
            return a.selectorTarget(r, e);
          })
        : null;
    },
    selectorLegend: function (t) {
      return '.'.concat(U.legendItem + this.getTargetSelectorSuffix(t));
    },
    selectorLegends: function (t) {
      var e = this;
      return t?.length
        ? t.map(function (a) {
            return e.selectorLegend(a);
          })
        : null;
    },
  },
  un = function (t, e, a) {
    var i = L(t.cloneNode(!0));
    return (
      i
        .attr('id', a)
        .insert('rect', ':first-child')
        .attr('width', i.attr('width'))
        .attr('height', i.attr('height'))
        .style('fill', e),
      { id: a, node: i.node() }
    );
  };
function dn(t) {
  var e = re.colorPattern,
    a = te.body,
    i = a[e];
  if (!i) {
    var r = ';',
      n = t.classed(zt.colorPattern, !0).style('background-image');
    (t.classed(zt.colorPattern, !1),
      n.indexOf(r) > -1 &&
        ((i = n
          .replace(/url[^#]*|["'()]|(\s|%20)/g, '')
          .split(r)
          .map(function (o) {
            return o.trim().replace(/[\"'\s]/g, '');
          })
          .filter(Boolean)),
        (a[e] = i)));
  }
  return i;
}
var fn = [
    '#1f77b4',
    '#ff7f0e',
    '#2ca02c',
    '#d62728',
    '#9467bd',
    '#8c564b',
    '#e377c2',
    '#7f7f7f',
    '#bcbd22',
    '#17becf',
  ],
  vn = {
    generateColor: function () {
      var t = this,
        e = t.$el,
        a = t.config,
        i = [],
        r = a.area_linearGradient || a.bar_linearGradient || a.point_radialGradient,
        n = le(a.color_pattern) ? a.color_pattern : xi(dn(e.chart) || fn).range(),
        o = n;
      if (I(a.color_tiles)) {
        var s = a.color_tiles.bind(t.api)(),
          l = n.map(function (c, u) {
            var d = c.replace(/[#\(\)\s,]/g, ''),
              f = ''.concat(t.state.datetimeId, '-pattern-').concat(d, '-').concat(u);
            return un(s[u % s.length], c, f);
          });
        ((n = l.map(function (c) {
          return 'url(#'.concat(c.id, ')');
        })),
          (t.patterns = l));
      }
      return function (c) {
        var u,
          d = a.data_colors,
          f = a.data_color,
          v = c.id || ((u = c.data) === null || u === void 0 ? void 0 : u.id) || c,
          g = t.isTypeOf(v, ['line', 'spline', 'step']) || !a.data_types[v],
          h;
        if (
          (I(d[v])
            ? (h = d[v].bind(t.api)(c))
            : d[v]
              ? (h = d[v])
              : (i.indexOf(v) < 0 && i.push(v),
                (h = g ? o[i.indexOf(v) % o.length] : n[i.indexOf(v) % n.length]),
                (d[v] = h)),
          (h = I(f) ? f.call(t.api, h, c) : h),
          r)
        ) {
          var p = t.$el.defs.selectAll(
              "[id$='-gradient".concat(t.getTargetSelectorSuffix(v), "'] stop"),
            ),
            x;
          (p.each(function (_, m) {
            x = m === 0 ? this.style.stopColor : this.style.stopColor === x;
          }),
            x === !0 && p.attr('stop-color', h));
        }
        return h;
      };
    },
    generateLevelColor: function () {
      var t = this,
        e = t.config,
        a = e.color_pattern,
        i = e.color_threshold,
        r = i.unit === 'value',
        n = i.max || 100,
        o = i.values && i.values.length ? i.values : [];
      return le(i)
        ? function (s) {
            for (
              var l = r ? s : (s * 100) / n, c = a[a.length - 1], u = 0, d = o.length;
              u < d;
              u++
            )
              if (l <= o[u]) {
                c = a[u];
                break;
              }
            return c;
          }
        : null;
    },
    generateTextBGColorFilter: function (t, e) {
      e === void 0 && (e = { x: 0, y: 0, width: 1, height: 1 });
      var a = this,
        i = a.$el.defs,
        r = a.state;
      if (t) {
        var n = [];
        (H(t) ? n.push('') : W(t) ? (n = Object.keys(t)) : I(t) && (n = a.mapToTargetIds()),
          n.forEach(function (o) {
            var s = ''
                .concat(r.datetimeId, '-labels-bg')
                .concat(a.getTargetSelectorSuffix(o))
                .concat(H(t) ? a.getTargetSelectorSuffix(t) : ''),
              l = tt(o === '' ? t : t?.[o] || '');
            i.select('#'.concat(s)).empty() &&
              i
                .append('filter')
                .attr('x', e.x)
                .attr('y', e.y)
                .attr('width', e.width)
                .attr('height', e.height)
                .attr('id', s)
                .html(
                  '<feFlood flood-color="'.concat(
                    l,
                    `" />
							<feComposite in="SourceGraphic" />`,
                  ),
                );
          }));
      }
    },
    getGradienColortUrl: function (t) {
      return 'url(#'
        .concat(this.state.datetimeId, '-gradient')
        .concat(this.getTargetSelectorSuffix(t), ')');
    },
    updateLinearGradient: function () {
      var t = this,
        e = t.config,
        a = t.data.targets,
        i = t.state.datetimeId,
        r = t.$el.defs;
      a.forEach(function (n) {
        var o = ''.concat(i, '-gradient').concat(t.getTargetSelectorSuffix(n.id)),
          s = t.hasPointType() && e.point_radialGradient,
          l = (t.isAreaType(n) && 'area') || (t.isBarType(n) && 'bar');
        if ((s || l) && r.select('#'.concat(o)).empty()) {
          var c = t.color(n),
            u = { defs: null, stops: [] };
          if (s) {
            var d = s.cx,
              f = d === void 0 ? 0.3 : d,
              v = s.cy,
              g = v === void 0 ? 0.3 : v,
              h = s.r,
              p = h === void 0 ? 0.7 : h,
              x = s.stops,
              _ =
                x === void 0
                  ? [
                      [0.1, c, 0],
                      [0.9, c, 1],
                    ]
                  : x;
            ((u.stops = _),
              (u.defs = r
                .append('radialGradient')
                .attr('id', ''.concat(o))
                .attr('cx', f)
                .attr('cy', g)
                .attr('r', p)));
          } else {
            var m = e.axis_rotated,
              y = e[''.concat(l, '_linearGradient')],
              T = y.x,
              b = T === void 0 ? (m ? [1, 0] : [0, 0]) : T,
              $ = y.y,
              w = $ === void 0 ? (m ? [0, 0] : [0, 1]) : $,
              A = y.stops,
              _ =
                A === void 0
                  ? [
                      [0, c, 1],
                      [1, c, 0],
                    ]
                  : A;
            ((u.stops = _),
              (u.defs = r
                .append('linearGradient')
                .attr('id', ''.concat(o))
                .attr('x1', b[0])
                .attr('x2', b[1])
                .attr('y1', w[0])
                .attr('y2', w[1])));
          }
          u.stops.forEach(function (R) {
            var C = R[0],
              S = R[1],
              M = R[2],
              k = I(S) ? S.bind(t.api)(n.id) : S;
            u.defs &&
              u.defs
                .append('stop')
                .attr('offset', C)
                .attr('stop-color', k || c)
                .attr('stop-opacity', M);
          });
        }
      });
    },
    setOverColor: function (t, e) {
      var a = this,
        i = a.config,
        r = a.$el.main,
        n = i.color_onover,
        o = t ? n : a.color;
      (W(o)
        ? (o = function (s) {
            var l = s.id;
            return l in n ? n[l] : a.color(l);
          })
        : H(o)
          ? (o = function () {
              return n;
            })
          : I(n) && (o = o.bind(a.api)),
        r
          .selectAll(
            W(e)
              ? '.'.concat(V.arc).concat(a.getTargetSelectorSuffix(e.id))
              : '.'.concat(oe.shape, '-').concat(e),
          )
          .style('fill', o));
    },
  },
  gn = {
    getYDomainMinMax: function (t, e) {
      var a = this,
        i = a.axis,
        r = a.config,
        n = e === 'min',
        o = r.data_groups,
        s = a.mapToIds(t),
        l = Ga(s),
        c = a.getValuesAsIdKeyed(t);
      if (o.length > 0) {
        var u = a['has'.concat(n ? 'Negative' : 'Positive', 'ValueInTargets')](t),
          d = new Map(
            s.map(function (f) {
              return [f, i.getId(f)];
            }),
          );
        o.forEach(function (f) {
          var v = f.filter(function (p) {
            return l.has(p);
          });
          if (v.length) {
            var g = v[0],
              h = d.get(g);
            (u &&
              c[g] &&
              (c[g] = c[g].map(function (p) {
                return (n ? p < 0 : p > 0) ? p : 0;
              })),
              v
                .filter(function (p, x) {
                  return x > 0;
                })
                .forEach(function (p) {
                  if (c[p]) {
                    var x = d.get(p);
                    c[p].forEach(function (_, m) {
                      var y = +_,
                        T = n ? y > 0 : y < 0;
                      x === h && !(u && T) && (c[g][m] += y);
                    });
                  }
                }));
          }
        });
      }
      return Re(
        e,
        Object.keys(c).map(function (f) {
          return Re(e, c[f]);
        }),
      );
    },
    isHiddenTargetWithYDomain: function (t) {
      var e = this;
      return e.state.hiddenTargetIds.some(function (a) {
        return e.axis.getId(a) === t;
      });
    },
    getYDomain: function (t, e, a) {
      var i = this,
        r = i.axis,
        n = i.config,
        o = i.scale,
        s = 'axis_'.concat(e);
      if (i.isStackNormalized()) {
        var l = t
            .filter(function (G) {
              return r.getId(G.id) === e;
            })
            .map(function (G) {
              return G.id;
            }),
          c = l.some(function (G) {
            return i.isGrouped(G);
          });
        if (c) return [0, 100];
      }
      var u = o?.[e] && o[e].type === 'log',
        d = t.filter(function (G) {
          return r.getId(G.id) === e;
        }),
        f = a ? i.filterByXDomain(d, a) : d;
      if (f.length === 0)
        return i.isHiddenTargetWithYDomain(e)
          ? o[e].domain()
          : e === 'y2'
            ? o.y.domain()
            : i.getYDomain(t, 'y2', a);
      var v = n[''.concat(s, '_min')],
        g = n[''.concat(s, '_max')],
        h = n[''.concat(s, '_center')],
        p = n[''.concat(s, '_inverted')],
        x = i.hasDataLabel() && n.axis_rotated,
        _ = i.hasDataLabel() && !n.axis_rotated,
        m = i.getYDomainMinMax(f, 'min'),
        y = i.getYDomainMinMax(f, 'max'),
        T = ne([E.BAR, E.BUBBLE, E.SCATTER], ze.Line, !0).some(function (G) {
          var O = G.indexOf('area') > -1 ? 'area' : G;
          return i.hasType(G, f, !0) && n[''.concat(O, '_zerobased')];
        });
      ((m = N(v) ? v : N(g) ? (m <= g ? m : g - 10) : m),
        (y = N(g) ? g : N(v) ? (v <= y ? y : v + 10) : y),
        isNaN(m) && (m = 0),
        isNaN(y) && (y = m),
        m === y && (m < 0 ? (y = 0) : (m = 0)));
      var b = m >= 0 && y >= 0,
        $ = m <= 0 && y <= 0;
      (((N(v) && b) || (N(g) && $)) && (T = !1), T && (b && (m = 0), $ && (y = 0)));
      var w = Math.abs(y - m),
        A = { top: w * 0.1, bottom: w * 0.1 };
      if (q(h)) {
        var R = Math.max(Math.abs(m), Math.abs(y));
        ((y = h + R), (m = h - R));
      }
      if (x) {
        var C = Ye(o.y.range()),
          S = i.getDataLabelLength(m, y, 'width').map(function (G) {
            var O = G / C;
            return isFinite(O) ? O : 0;
          });
        ['bottom', 'top'].forEach(function (G, O) {
          A[G] += w * (S[O] / (1 - S[0] - S[1]));
        });
      } else if (_) {
        var M = i.getDataLabelLength(m, y, 'height');
        ['bottom', 'top'].forEach(function (G, O) {
          A[G] += i.convertPixelToScale('y', M[O], w);
        });
      }
      A = i.getResettedPadding(A);
      var k = n[''.concat(s, '_padding')];
      (le(k) &&
        ['bottom', 'top'].forEach(function (G) {
          A[G] = r.getPadding(k, G, A[G], w);
        }),
        T && (b && (A.bottom = m), $ && (A.top = -y)));
      var Z = u
        ? [m, y].map(function (G) {
            return G < 0 ? 0 : G;
          })
        : [m - A.bottom, y + A.top];
      return p ? Z.reverse() : Z;
    },
    getXDomainMinMax: function (t, e) {
      var a,
        i = this,
        r = i.config['axis_x_'.concat(e)],
        n = Re(
          e,
          t.map(function (s) {
            return Re(
              e,
              s.values.map(function (l) {
                return l.x;
              }),
            );
          }),
        ),
        o = W(r) ? r.value : r;
      return (
        (o =
          q(o) && !((a = i.axis) === null || a === void 0) && a.isTimeSeries()
            ? Ae.bind(this)(o)
            : o),
        W(r) && r.fit && ((e === 'min' && o < n) || (e === 'max' && o > n)) && (o = void 0),
        q(o) ? o : n
      );
    },
    getXDomainPadding: function (t, e) {
      var a = this,
        i = a.axis,
        r = a.config,
        n = r.axis_x_padding,
        o = i.isTimeSeries() && e,
        s = Ye(t),
        l;
      if (i.isCategorized() || o) l = 0;
      else if (a.hasType('bar')) {
        var c = a.getMaxDataCount();
        l = c > 1 ? s / (c - 1) / 2 : 0.5;
      } else l = a.getResettedPadding(s * 0.01);
      var u = P(n) ? { left: n, right: n } : n,
        d = u.left,
        f = d === void 0 ? l : d,
        v = u.right,
        g = v === void 0 ? l : v;
      if (n.unit === 'px') {
        var h = Math.abs(s + s * 0.2);
        ((f = i.getPadding(n, 'left', l, h)), (g = i.getPadding(n, 'right', l, h)));
      } else {
        var p = s + f + g;
        if (o && p) {
          var x = s / e / p;
          ((f = f / p / x), (g = g / p / x));
        }
      }
      return { left: f, right: g };
    },
    getXDomain: function (t) {
      var e = this,
        a = e.axis,
        i = e.config,
        r = e.scale.x,
        n = i.axis_x_inverted,
        o = [e.getXDomainMinMax(t, 'min'), e.getXDomainMinMax(t, 'max')],
        s = o[0],
        l = s === void 0 ? 0 : s,
        c = o[1],
        u = c === void 0 ? 0 : c;
      if (r.type !== 'log') {
        var d = a.isCategorized(),
          f = a.isTimeSeries(),
          v = e.getXDomainPadding(o),
          g = o[0],
          h = o[1];
        (g - h === 0 &&
          !d &&
          (f
            ? ((g = new Date(g.getTime() * 0.5)), (h = new Date(h.getTime() * 1.5)))
            : ((g = g === 0 ? 1 : g * 0.5), (h = h === 0 ? -1 : h * 1.5))),
          (g || g === 0) && (l = f ? new Date(g.getTime() - v.left) : g - v.left),
          (h || h === 0) && (u = f ? new Date(h.getTime() + v.right) : h + v.right));
      }
      return n ? [u, l] : [l, u];
    },
    updateXDomain: function (t, e, a, i, r) {
      var n,
        o = this,
        s = o.config,
        l = o.org,
        c = o.scale,
        u = c.x,
        d = c.subX,
        f = s.zoom_enabled;
      if (
        (a &&
          (u.domain(r || rt(o.getXDomain(t), !s.axis_x_inverted)),
          (l.xDomain = u.domain()),
          d.domain(u.domain()),
          (n = o.brush) === null || n === void 0 || n.scale(d)),
        e)
      ) {
        var v = r || !o.brush || Ma(o) ? l.xDomain : Fa(o).map(d.invert);
        u.domain(v);
      }
      return (
        (a || e) && f && o.zoom.updateScaleExtent(),
        i && u.domain(o.trimXDomain(u.orgDomain())),
        u.domain()
      );
    },
    trimXDomain: function (t) {
      var e = this,
        a = e.config.axis_x_inverted,
        i = e.getZoomDomain(),
        r = i[0],
        n = i[1];
      return (
        (a ? t[0] >= r : t[0] <= r) && ((t[1] = +t[1] + (r - t[0])), (t[0] = r)),
        (a ? t[1] <= n : t[1] >= n) && ((t[0] = +t[0] - (t[1] - n)), (t[1] = n)),
        t
      );
    },
    getZoomDomain: function (t, e) {
      (t === void 0 && (t = 'zoom'), e === void 0 && (e = !1));
      var a = this,
        i = a.config,
        r = a.scale,
        n = a.org,
        o = e && r[t] ? r[t].domain() : n.xDomain,
        s = o[0],
        l = o[1];
      return (
        t === 'zoom' &&
          (q(i.zoom_x_min) && (s = Re('min', [s, i.zoom_x_min])),
          q(i.zoom_x_max) && (l = Re('max', [l, i.zoom_x_max]))),
        [s, l]
      );
    },
    getZoomDomainValue: function (t) {
      var e = this,
        a = e.config,
        i = e.axis;
      if (i.isCategorized() && Array.isArray(t)) {
        var r = a.axis_x_inverted,
          n = t.map(function (o, s) {
            return Number(o) + (s === 0 ? +r : +!r);
          });
        return n;
      }
      return t;
    },
    convertPixelToScale: function (t, e, a) {
      var i = this,
        r = i.config,
        n = i.state,
        o = r.axis_rotated,
        s;
      return (
        t === 'x' ? (s = o ? 'height' : 'width') : (s = o ? 'width' : 'height'),
        a * (e / n[s])
      );
    },
    withinRange: function (t, e, a) {
      e === void 0 && (e = [0, 0]);
      var i = this,
        r = i.config.axis_x_inverted,
        n = a,
        o = n[0],
        s = n[1];
      if (Array.isArray(t)) {
        var l = ne([], t, !0);
        if ((r && l.reverse(), l[0] < l[1]))
          return t.every(function (c, u) {
            return (
              (u === 0 ? (r ? +c <= o : +c >= o) : r ? +c >= s : +c <= s) &&
              !t.every(function (d, f) {
                return d === e[f];
              })
            );
          });
      }
      return !1;
    },
  };
function oa(t, e, a) {
  var i = t.config,
    r = 'axis_'.concat(e, '_tick_format'),
    n = i[r] ? i[r] : t.defaultValueFormat;
  return n.call(t.api, a);
}
var hn = {
  yFormat: function (t) {
    return oa(this, 'y', t);
  },
  y2Format: function (t) {
    return oa(this, 'y2', t);
  },
  getDefaultValueFormat: function () {
    var t = this,
      e = t.defaultArcValueFormat,
      a = t.yFormat,
      i = t.y2Format,
      r = t.hasArcType(null, ['gauge', 'polar', 'radar']);
    return function (n, o, s) {
      var l = r ? e : t.axis && t.axis.getId(s) === 'y2' ? i : a;
      return l.call(t, n, o);
    };
  },
  defaultValueFormat: function (t) {
    return j(t) ? t.join('~') : N(t) ? +t : '';
  },
  defaultArcValueFormat: function (t, e) {
    return ''.concat((e * 100).toFixed(1), '%');
  },
  defaultPolarValueFormat: function (t) {
    return ''.concat(t);
  },
  dataLabelFormat: function (t) {
    var e = this,
      a = e.config.data_labels,
      i = function (n) {
        var o = '~',
          s = n;
        return (j(n) ? (s = n.join(o)) : W(n) && (s = Object.values(n).join(o)), s);
      },
      r = i;
    return (
      I(a.format)
        ? (r = a.format)
        : ye(a.format) &&
          (a.format[t]
            ? (r = a.format[t] === !0 ? i : a.format[t])
            : (r = function () {
                return '';
              })),
      r.bind(e.api)
    );
  },
};
function pt(t) {
  var e = this,
    a = e.getDataById(t),
    i = e.levelColor ? e.levelColor(a.values[0].value) : e.color(a);
  return i;
}
function kt(t, e) {
  var a;
  e === void 0 && (e = !0);
  var i = this.config,
    r = (a = i.data_names[t]) !== null && a !== void 0 ? a : t;
  return (e && I(i.legend_format) && (r = i.legend_format(r, t !== r ? t : void 0)), r);
}
function pn(t, e) {
  if (!(!e || e.empty())) {
    var a = [];
    e.each(function (r) {
      a.push({ id: r, node: this });
    });
    var i = Va(
      a,
      function (r) {
        return r.id;
      },
      function (r) {
        return r.node;
      },
    );
    t.cache.add(re.legendItemMap, i);
  }
}
var xn = {
    initLegend: function () {
      var t = this,
        e = t.config,
        a = t.$el;
      ((t.legendItemTextBox = {}),
        (t.state.legendHasRendered = !1),
        e.legend_show
          ? (e.legend_contents_bindto ||
              (a.legend = t.$el.svg
                .append('g')
                .classed(K.legend, !0)
                .attr('transform', t.getTranslate('legend'))),
            t.updateLegend())
          : (t.state.hiddenLegendIds = t.mapToIds(t.data.targets)));
    },
    updateLegend: function (t, e, a) {
      var i,
        r = this,
        n = r.config,
        o = r.state,
        s = r.scale,
        l = r.$el,
        c = e || { withTransform: !1, withTransitionForTransform: !1, withTransition: !1 };
      ((c.withTransition = Me(c, 'withTransition', !0)),
        (c.withTransitionForTransform = Me(c, 'withTransitionForTransform', !0)),
        n.legend_contents_bindto && n.legend_contents_template
          ? r.updateLegendTemplate()
          : o.hasTreemap || r.updateLegendElement(t || r.mapToIds(r.data.targets), c, a),
        (i = l.legend) === null ||
          i === void 0 ||
          i.selectAll('.'.concat(K.legendItem)).classed(K.legendItemHidden, function (u) {
            var d = !r.isTargetToShow(u);
            return (d && (this.style.opacity = null), d);
          }),
        r.updateScales(!1, !s.zoom),
        r.updateSvgSize(),
        r.transformAll(c.withTransitionForTransform, a),
        (o.legendHasRendered = !0));
    },
    updateLegendTemplate: function () {
      var t = this,
        e = t.config,
        a = t.$el,
        i = L(e.legend_contents_bindto),
        r = e.legend_contents_template;
      if (!i.empty()) {
        var n = t.mapToIds(t.data.targets),
          o = [],
          s = '';
        n.forEach(function (c) {
          var u = I(r)
            ? tt(r.call(t.api, c, t.color(c), t.api.data(c)[0].values))
            : vt(r, { COLOR: t.color(c), TITLE: c });
          u && (o.push(c), (s += u));
        });
        var l = i
          .html(s)
          .selectAll(function () {
            return this.childNodes;
          })
          .data(o);
        (t.setLegendItem(l), (a.legend = i));
      }
    },
    updateSizeForLegend: function (t) {
      var e = this,
        a = e.config,
        i = e.state,
        r = i.isLegendTop,
        n = i.isLegendLeft,
        o = i.isLegendRight,
        s = i.isLegendInset,
        l = i.current,
        c = t.width,
        u = t.height,
        d = {
          top: r
            ? e.getCurrentPaddingByDirection('top') + a.legend_inset_y + 5.5
            : l.height - u - e.getCurrentPaddingByDirection('bottom') - a.legend_inset_y,
          left: n
            ? e.getCurrentPaddingByDirection('left') + a.legend_inset_x + 0.5
            : l.width - c - e.getCurrentPaddingByDirection('right') - a.legend_inset_x + 0.5,
        };
      e.state.margin3 = {
        top: o ? 0 : s ? d.top : l.height - u,
        right: NaN,
        bottom: 0,
        left: o ? l.width - c : s ? d.left : 0,
      };
    },
    transformLegend: function (t) {
      var e = this,
        a = e.$el.legend,
        i = e.$T;
      i(a, t).attr('transform', e.getTranslate('legend'));
    },
    updateLegendStep: function (t) {
      this.state.legendStep = t;
    },
    updateLegendItemWidth: function (t) {
      this.state.legendItemWidth = t;
    },
    updateLegendItemHeight: function (t) {
      this.state.legendItemHeight = t;
    },
    updateLegendItemColor: function (t, e) {
      var a = this,
        i = a.$el.legend;
      if (i) {
        var r = a.getLegendItemById(t);
        r && L(r).select('line').style('stroke', e);
      }
    },
    getLegendWidth: function () {
      var t = this,
        e = t.state,
        a = e.current.width,
        i = e.isLegendRight,
        r = e.isLegendInset,
        n = e.legendItemWidth,
        o = e.legendStep;
      return t.config.legend_show ? (i || r ? n * (o + 1) : a) : 0;
    },
    getLegendHeight: function () {
      var t,
        e = this,
        a = e.state,
        i = a.current,
        r = a.isLegendRight,
        n = a.legendItemHeight,
        o = a.legendStep,
        s = ((t = e.config.padding) === null || t === void 0 ? void 0 : t.mode) === 'fit',
        l = e.config.legend_show ? (r ? i.height : Math.max(s ? 10 : 20, n) * (o + 1)) : 0;
      return l;
    },
    opacityForUnfocusedLegend: function (t) {
      return t.classed(K.legendItemHidden) ? null : '0.3';
    },
    toggleFocusLegend: function (t, e) {
      var a = this,
        i = a.$el.legend,
        r = a.$T,
        n = a.mapToTargetIds(t);
      i &&
        r(
          i
            .selectAll('.'.concat(K.legendItem))
            .filter(function (o) {
              return n.indexOf(o) >= 0;
            })
            .classed(J.legendItemFocused, e),
        ).style('opacity', function () {
          return e ? null : a.opacityForUnfocusedLegend.call(a, L(this));
        });
    },
    revertLegend: function () {
      var t = this,
        e = t.$el.legend,
        a = t.$T;
      e &&
        a(e.selectAll('.'.concat(K.legendItem)).classed(J.legendItemFocused, !1)).style(
          'opacity',
          null,
        );
    },
    showLegend: function (t) {
      var e = this,
        a = e.config,
        i = e.$el,
        r = e.$T;
      (a.legend_show ||
        ((a.legend_show = !0),
        i.legend ? i.legend.style('visibility', null) : e.initLegend(),
        !e.state.legendHasRendered && e.updateLegend()),
        e.removeHiddenLegendIds(t),
        r(i.legend.selectAll(e.selectorLegends(t)).style('visibility', null)).style(
          'opacity',
          null,
        ));
    },
    hideLegend: function (t) {
      var e = this,
        a = e.config,
        i = e.$el.legend;
      (a.legend_show && $e(t) && ((a.legend_show = !1), i.style('visibility', 'hidden')),
        e.addHiddenLegendIds(t),
        i.selectAll(e.selectorLegends(t)).style('opacity', '0').style('visibility', 'hidden'));
    },
    getLegendItemTextBox: function (t, e) {
      var a = this,
        i = a.cache,
        r = a.state,
        n,
        o = re.legendItemTextBox;
      return (
        t &&
          ((n = (!r.redrawing && i.get(o)) || {}),
          n[t] || ((n[t] = a.getTextRect(e, K.legendItem)), i.add(o, n)),
          (n = n[t])),
        n
      );
    },
    setLegendItem: function (t) {
      var e = this,
        a = e.$el,
        i = e.api,
        r = e.config,
        n = e.state,
        o = n.inputType === 'touch',
        s = e.hasType('gauge'),
        l = r.boost_useCssRule,
        c = r.legend_item_interaction;
      (t
        .attr('class', function (u) {
          var d = L(this),
            f = (!d.empty() && d.attr('class')) || '';
          return f + e.generateClass(K.legendItem, u);
        })
        .style('visibility', function (u) {
          return e.isLegendToShow(u) ? null : 'hidden';
        }),
        r.interaction_enabled &&
          (l &&
            [
              ['.'.concat(K.legendItem), 'cursor:pointer'],
              ['.'.concat(K.legendItem, ' text'), 'pointer-events:none'],
              ['.'.concat(K.legendItemPoint, ' text'), 'pointer-events:none'],
              ['.'.concat(K.legendItemTile), 'pointer-events:none'],
              ['.'.concat(K.legendItemEvent), 'fill-opacity:0'],
            ].forEach(function (u) {
              var d = u[0],
                f = u[1];
              e.setCssRule(!1, d, [f])(a.legend);
            }),
          t.on(
            c.dblclick ? 'dblclick' : 'click',
            c || I(r.legend_item_onclick)
              ? function (u, d) {
                  if (!Q(r.legend_item_onclick, i, d, !n.hiddenTargetIds.includes(d))) {
                    var f = u.altKey,
                      v = u.target,
                      g = u.type;
                    g === 'dblclick' || f
                      ? n.hiddenTargetIds.length &&
                        v.parentNode.getAttribute('class').indexOf(K.legendItemHidden) === -1
                        ? i.show()
                        : (i.hide(), i.show(d))
                      : (i.toggle(d), L(this).classed(J.legendItemFocused, !1));
                  }
                  o && e.hideTooltip();
                }
              : null,
          ),
          !o &&
            t
              .on(
                'mouseout',
                c || I(r.legend_item_onout)
                  ? function (u, d) {
                      Q(r.legend_item_onout, i, d, !n.hiddenTargetIds.includes(d)) ||
                        (L(this).classed(J.legendItemFocused, !1),
                        s && e.undoMarkOverlapped(e, '.'.concat(me.gaugeValue)),
                        e.api.revert());
                    }
                  : null,
              )
              .on(
                'mouseover',
                c || I(r.legend_item_onover)
                  ? function (u, d) {
                      Q(r.legend_item_onover, i, d, !n.hiddenTargetIds.includes(d)) ||
                        (L(this).classed(J.legendItemFocused, !0),
                        s && e.markOverlapped(d, e, '.'.concat(me.gaugeValue)),
                        !n.transiting && e.isTargetToShow(d) && i.focus(d));
                    }
                  : null,
              ),
          !t.empty() &&
            t.on('click mouseout mouseover') &&
            t.style('cursor', e.getStylePropValue('pointer'))),
        pn(e, t));
    },
    getLegendItemById: function (t) {
      var e,
        a = this,
        i = a.cache.get(re.legendItemMap);
      if (i && i instanceof Map) return i.get(t) || null;
      var r =
        (e = a.$el.legend) === null || e === void 0
          ? void 0
          : e.selectAll('.'.concat(K.legendItem)).filter(function (n) {
              return n === t;
            });
      return r?.node() || null;
    },
    updateLegendElement: function (t, e) {
      var a = this,
        i = a.config,
        r = a.state,
        n = a.$el.legend,
        o = a.$T,
        s = i.legend_item_tile_type,
        l = s !== 'circle',
        c = i.legend_item_tile_r,
        u = {
          width: l ? i.legend_item_tile_width : c * 2,
          height: l ? i.legend_item_tile_height : c * 2,
        },
        d = {
          padding: { top: 4, right: 10 },
          max: { width: 0, height: 0 },
          posMin: 10,
          step: 0,
          tileWidth: u.width + 5,
          totalLength: 0,
        },
        f = { offsets: {}, widths: {}, heights: {}, margins: [0], steps: {} },
        v,
        g,
        h,
        p = t.filter(function (b) {
          return !q(i.data_names[b]) || i.data_names[b] !== null;
        }),
        x = e.withTransition,
        _ = a.getUpdateLegendPositions(p, d, f);
      (r.isLegendInset &&
        ((d.step = i.legend_inset_step ? i.legend_inset_step : p.length),
        a.updateLegendStep(d.step)),
        r.isLegendRight
          ? ((v = function (b) {
              return d.max.width * f.steps[b];
            }),
            (g = function (b) {
              return f.margins[f.steps[b]] + f.offsets[b];
            }))
          : r.isLegendInset
            ? ((v = function (b) {
                return d.max.width * f.steps[b] + 10;
              }),
              (g = function (b) {
                return f.margins[f.steps[b]] + f.offsets[b];
              }))
            : ((v = function (b) {
                return f.margins[f.steps[b]] + f.offsets[b];
              }),
              (g = function (b) {
                return d.max.height * f.steps[b];
              })));
      var m = {
        xText: function (b, $) {
          return v(b, $) + 4 + u.width;
        },
        xRect: function (b, $) {
          return v(b, $);
        },
        x1Tile: function (b, $) {
          return v(b, $) - 2;
        },
        x2Tile: function (b, $) {
          return v(b, $) - 2 + u.width;
        },
        yText: function (b, $) {
          return g(b, $) + 9;
        },
        yRect: function (b, $) {
          return g(b, $) - 5;
        },
        yTile: function (b, $) {
          return g(b, $) + 4;
        },
      };
      (a.generateLegendItem(p, u, _, m),
        (h = n.select('.'.concat(K.legendBackground, ' rect'))),
        r.isLegendInset &&
          d.max.width > 0 &&
          h.size() === 0 &&
          (h = n
            .insert('g', '.'.concat(K.legendItem))
            .attr('class', K.legendBackground)
            .append('rect')),
        i.legend_tooltip &&
          n
            .selectAll('title')
            .data(p)
            .text(function (b) {
              return kt.bind(a)(b, !1);
            }));
      var y = n
        .selectAll('text')
        .data(p)
        .text(function (b) {
          return kt.bind(a)(b);
        })
        .each(function (b, $) {
          _(this, b, $);
        });
      o(y, x).attr('x', m.xText).attr('y', m.yText);
      var T = n.selectAll('rect.'.concat(K.legendItemEvent)).data(p);
      (o(T, x)
        .attr('width', function (b) {
          return f.widths[b];
        })
        .attr('height', function (b) {
          return f.heights[b];
        })
        .attr('x', m.xRect)
        .attr('y', m.yRect),
        a.updateLegendItemPos(p, x, m),
        h &&
          o(h, x)
            .attr('height', a.getLegendHeight() - 12)
            .attr('width', d.max.width * (d.step + 1) + 10),
        a.updateLegendItemWidth(d.max.width),
        a.updateLegendItemHeight(d.max.height),
        a.updateLegendStep(d.step));
    },
    getUpdateLegendPositions: function (t, e, a) {
      var i = this,
        r = i.config,
        n = i.state,
        o = n.isLegendRight || n.isLegendInset;
      return function (s, l, c) {
        var u = c === 0,
          d = c === t.length - 1,
          f = i.getLegendItemTextBox(l, s),
          v = f.width + e.tileWidth + (d && !o ? 0 : e.padding.right) + r.legend_padding,
          g = f.height + e.padding.top,
          h = o ? g : v,
          p = o ? i.getLegendHeight() : i.getLegendWidth(),
          x,
          _ = function (y, T) {
            (T ||
              ((x = (p - e.totalLength - h) / 2),
              x < e.posMin && ((x = (p - h) / 2), (e.totalLength = 0), e.step++)),
              (a.steps[y] = e.step),
              (a.margins[e.step] = n.isLegendInset ? 10 : x),
              (a.offsets[y] = e.totalLength),
              (e.totalLength += h));
          };
        if (
          (u && ((e.totalLength = 0), (e.step = 0), (e.max.width = 0), (e.max.height = 0)),
          r.legend_show && !i.isLegendToShow(l))
        ) {
          ((a.widths[l] = 0), (a.heights[l] = 0), (a.steps[l] = 0), (a.offsets[l] = 0));
          return;
        }
        ((a.widths[l] = v),
          (a.heights[l] = g),
          (!e.max.width || v >= e.max.width) && (e.max.width = v),
          (!e.max.height || g >= e.max.height) && (e.max.height = g));
        var m = o ? e.max.height : e.max.width;
        r.legend_equally
          ? (Object.keys(a.widths).forEach(function (y) {
              return (a.widths[y] = e.max.width);
            }),
            Object.keys(a.heights).forEach(function (y) {
              return (a.heights[y] = e.max.height);
            }),
            (x = (p - m * t.length) / 2),
            x < e.posMin
              ? ((e.totalLength = 0),
                (e.step = 0),
                t.forEach(function (y) {
                  return _(y);
                }))
              : _(l, !0))
          : _(l);
      };
    },
    generateLegendItem: function (t, e, a, i) {
      var r = this,
        n = r.config,
        o = r.state,
        s = r.$el.legend,
        l = n.legend_usePoint,
        c = n.legend_item_tile_r,
        u = n.legend_item_tile_type,
        d = u !== 'circle',
        f = o.isLegendRight || o.isLegendInset,
        v = -200,
        g = s.selectAll('.'.concat(K.legendItem)).data(t).enter().append('g');
      if (
        (r.setLegendItem(g),
        n.legend_tooltip &&
          g.append('title').text(function (x) {
            return x;
          }),
        g
          .append('text')
          .text(function (x) {
            return kt.bind(r)(x);
          })
          .each(function (x, _) {
            a(this, x, _);
          })
          .style('pointer-events', r.getStylePropValue('none'))
          .attr('x', f ? i.xText : v)
          .attr('y', f ? v : i.yText),
        g
          .append('rect')
          .attr('class', K.legendItemEvent)
          .style('fill-opacity', r.getStylePropValue('0'))
          .attr('x', f ? i.xRect : v)
          .attr('y', f ? v : i.yRect),
        l)
      ) {
        var h = [],
          p = r.getValidPointPattern();
        g.append(function (x) {
          h.indexOf(x) === -1 && h.push(x);
          var _ = p[h.indexOf(x) % p.length];
          return (
            _ === 'rectangle' && (_ = 'rect'),
            te.createElementNS(
              mt.svg,
              'hasValidPointType' in r && r.hasValidPointType(_) ? _ : 'use',
            )
          );
        })
          .attr('class', K.legendItemPoint)
          .style('fill', pt.bind(r))
          .style('pointer-events', r.getStylePropValue('none'))
          .attr('href', function (x, _, m) {
            var y = m[_],
              T = y.nodeName.toLowerCase(),
              b = r.getTargetSelectorSuffix(x);
            return T === 'use' ? '#'.concat(o.datetimeId, '-point').concat(b) : void 0;
          });
      } else
        g.append(d ? 'line' : u)
          .attr('class', K.legendItemTile)
          .style('stroke', pt.bind(r))
          .style('pointer-events', r.getStylePropValue('none'))
          .call(function (x) {
            u === 'circle'
              ? x
                  .attr('r', c)
                  .style('fill', pt.bind(r))
                  .attr('cx', f ? i.x2Tile : v)
                  .attr('cy', f ? v : i.yTile)
              : d &&
                x
                  .attr('stroke-width', e.height)
                  .attr('x1', f ? i.x1Tile : v)
                  .attr('y1', f ? v : i.yTile)
                  .attr('x2', f ? i.x2Tile : v)
                  .attr('y2', f ? v : i.yTile);
          });
    },
    updateLegendItemPos: function (t, e, a) {
      var i = this,
        r = i.config,
        n = i.$el.legend,
        o = i.$T,
        s = r.legend_usePoint,
        l = r.legend_item_tile_type,
        c = l !== 'circle';
      if (s) {
        var u = n.selectAll('.'.concat(K.legendItemPoint)).data(t);
        o(u, e).each(function () {
          var d = this.nodeName.toLowerCase(),
            f = r.point_r,
            v = 'x',
            g = 'y',
            h = 2,
            p = 2.5,
            x = null,
            _ = null,
            m = null;
          if (d === 'circle') {
            var y = f * 0.2;
            ((v = 'cx'), (g = 'cy'), (x = f + y), (h = f * 2), (p = -y));
          } else if (d === 'rect') {
            var y = f * 2.5;
            ((_ = y), (m = y), (p = 3));
          }
          L(this)
            .attr(v, function (T) {
              return a.x1Tile(T) + h;
            })
            .attr(g, function (T) {
              return a.yTile(T) - p;
            })
            .attr('r', x)
            .attr('width', _)
            .attr('height', m);
        });
      } else {
        var u = n.selectAll('.'.concat(K.legendItemTile)).data(t);
        o(u, e)
          .style('stroke', pt.bind(i))
          .call(function (f) {
            l === 'circle'
              ? f
                  .attr('cx', function (v) {
                    var g = a.x2Tile(v);
                    return g - (g - a.x1Tile(v)) / 2;
                  })
                  .attr('cy', a.yTile)
              : c &&
                f.attr('x1', a.x1Tile).attr('y1', a.yTile).attr('x2', a.x2Tile).attr('y2', a.yTile);
          });
      }
    },
  },
  _n = {
    redraw: function (t) {
      var e, a, i, r;
      t === void 0 && (t = {});
      var n = this,
        o = n.config,
        s = n.state,
        l = n.$el,
        c = l.main,
        u = l.treemap;
      s.redrawing = !0;
      var d = n.filterTargetsToShow(n.data.targets),
        f = t.flow,
        v = t.initializing,
        g = n.getWithOption(t),
        h = g.Transition ? o.transition_duration : 0,
        p = g.TransitionForExit ? h : 0,
        x = g.TransitionForAxis ? h : 0,
        _ = (e = n.axis) === null || e === void 0 ? void 0 : e.generateTransitions(x);
      (n.updateSizes(v),
        g.Legend && o.legend_show
          ? ((t.withTransition = !!h), !u && n.updateLegend(n.mapToIds(n.data.targets), t, _))
          : g.Dimension && n.updateDimension(!0),
        o.data_empty_label_text &&
          c
            .select('text.'.concat(ce.text, '.').concat(z.empty))
            .attr('x', s.width / 2)
            .attr('y', s.height / 2)
            .text(o.data_empty_label_text)
            .style('display', d.length ? 'none' : null),
        s.hasAxis
          ? (n.axis.redrawAxis(d, g, _, f, v),
            n.hasGrid() && n.updateGrid(),
            o.regions.length && n.updateRegion(),
            ['bar', 'candlestick', 'line', 'area'].forEach(function (m) {
              var y = pe(m);
              ((/^(line|area)$/.test(m) && n.hasTypeOf(y)) || n.hasType(m)) &&
                n['update'.concat(y)](g.TransitionForExit);
            }),
            l.text &&
              c
                .selectAll('.'.concat(ee.selectedCircles))
                .filter(n.isBarType.bind(n))
                .selectAll('circle')
                .remove(),
            o.interaction_enabled &&
              !f &&
              g.EventRect &&
              (n.redrawEventRect(), (a = n.bindZoomEvent) === null || a === void 0 || a.call(n)))
          : (l.arcs && n.redrawArc(h, p, g.Transform),
            l.radar && n.redrawRadar(),
            l.polar && n.redrawPolar(),
            l.funnel && n.redrawFunnel(),
            u && n.updateTreemap(p)),
        !s.resizing && !u && (n.hasPointType() || s.hasRadar)
          ? n.updateCircle()
          : !((i = n.hasLegendDefsPoint) === null || i === void 0) &&
            i.call(n) &&
            n.data.targets.forEach(n.point('create', this)),
        n.hasDataLabel() && !n.hasArcType(null, ['radar']) && n.updateText(),
        (r = n.redrawTitle) === null || r === void 0 || r.call(n),
        v && n.updateTypesElements(),
        n.generateRedrawList(d, f, h, g.Subchart),
        n.updateTooltipOnRedraw(),
        n.callPluginHook('$redraw', t, h));
    },
    generateRedrawList: function (t, e, a, i) {
      var r = this,
        n = r.config,
        o = r.state,
        s = r.getDrawShape();
      o.hasAxis && n.subchart_show && r.redrawSubchart(i, a, s);
      var l =
          e &&
          r.generateFlow({ targets: t, flow: e, duration: e.duration, shape: s, xv: r.xv.bind(r) }),
        c = (a || l) && gt(),
        u = r.getRedrawList(s, e, l, c),
        d = function () {
          (l && l(), (o.redrawing = !1), Q(n.onrendered, r.api));
        };
      if (d)
        if (c && u.length) {
          var f = Ya();
          _i()
            .duration(a)
            .each(function () {
              u.reduce(function (v, g) {
                return v.concat(g);
              }, []).forEach(function (v) {
                return f.add(v);
              });
            })
            .call(f, d);
        } else o.transiting || d();
      r.mapToIds(r.data.targets).forEach(function (v) {
        o.withoutFadeIn[v] = !0;
      });
    },
    getRedrawList: function (t, e, a, i) {
      var r = this,
        n = r.config,
        o = r.state,
        s = o.hasAxis,
        l = o.hasRadar,
        c = o.hasTreemap,
        u = r.$el.grid,
        d = t.pos,
        f = d.cx,
        v = d.cy,
        g = d.xForText,
        h = d.yForText,
        p = [];
      return (
        s &&
          ((n.grid_x_lines.length || n.grid_y_lines.length) && p.push(r.redrawGrid(i)),
          n.regions.length && p.push(r.redrawRegion(i)),
          Object.keys(t.type).forEach(function (x) {
            var _ = pe(x),
              m = t.type[x];
            ((/^(area|line)$/.test(x) && r.hasTypeOf(_)) || r.hasType(x)) &&
              p.push(r['redraw'.concat(_)](m, i));
          }),
          !e && u.main && p.push(r.updateGridFocus())),
        (!r.hasArcType() || l) &&
          le(n.data_labels) &&
          n.data_labels !== !1 &&
          p.push(r.redrawText(g, h, e, i)),
        (r.hasPointType() || l) &&
          !r.isPointFocusOnly() &&
          r.redrawCircle &&
          p.push(r.redrawCircle(f, v, i, a)),
        c && p.push(r.redrawTreemap(i)),
        p
      );
    },
    updateAndRedraw: function (t) {
      t === void 0 && (t = {});
      var e = this,
        a = e.config,
        i = e.state,
        r;
      ((t.withTransition = Me(t, 'withTransition', !0)),
        (t.withTransform = Me(t, 'withTransform', !1)),
        (t.withLegend = Me(t, 'withLegend', !1)),
        (t.withUpdateXDomain = !0),
        (t.withUpdateOrgXDomain = !0),
        (t.withTransitionForExit = !1),
        (t.withTransitionForTransform = Me(t, 'withTransitionForTransform', t.withTransition)),
        (t.withLegend && a.legend_show) ||
          (i.hasAxis &&
            (r = e.axis.generateTransitions(t.withTransitionForAxis ? a.transition_duration : 0)),
          e.updateScales(),
          e.updateSvgSize(),
          e.transformAll(t.withTransitionForTransform, r)),
        e.redraw(t, r));
    },
  };
function We(t, e, a) {
  t === void 0 && (t = 'linear');
  var i = { linear: Dt, log: Xi, _log: Bi, time: Mi, utc: Fi }[t]();
  return ((i.type = t), /_?log/.test(t) && i.clamp(!0), i.range([e ?? 0, a ?? 1]));
}
var mn = {
    getXScale: function (t, e, a, i) {
      var r = this,
        n = (r.state.loading !== 'append' && r.scale.zoom) || We(r.axis.getAxisType('x'), t, e);
      return r.getCustomizedXScale(a ? n.domain(a) : n, i);
    },
    getYScale: function (t, e, a, i) {
      var r = this,
        n = We(r.axis.getAxisType(t), e, a);
      return (i && n.domain(i), n);
    },
    getYScaleById: function (t, e) {
      var a;
      e === void 0 && (e = !1);
      var i = ((a = this.axis) === null || a === void 0 ? void 0 : a.getId(t)) === 'y2',
        r = e ? (i ? 'subY2' : 'subY') : i ? 'y2' : 'y';
      return this.scale[r];
    },
    getCustomizedXScale: function (t, e) {
      var a = this,
        i =
          e ||
          function () {
            return a.axis.x.tickOffset();
          },
        r = a.config.axis_x_inverted,
        n = function (s) {
          return t(s) + i();
        };
      for (var o in t) n[o] = t[o];
      return (
        (n.orgDomain = function () {
          return t.domain();
        }),
        (n.orgScale = function () {
          return t;
        }),
        a.axis.isCategorized() &&
          (n.domain = function (s) {
            var l = s;
            return arguments.length
              ? (t.domain(l), n)
              : ((l = this.orgDomain()), r ? [l[0] + 1, l[1]] : [l[0], l[1] + 1]);
          }),
        n
      );
    },
    updateScales: function (t, e) {
      var a, i;
      e === void 0 && (e = !0);
      var r = this,
        n = r.axis,
        o = r.config,
        s = r.format,
        l = r.org,
        c = r.scale,
        u = r.state,
        d = u.current,
        f = u.width,
        v = u.height,
        g = u.width2,
        h = u.height2,
        p = u.hasAxis,
        x = u.hasTreemap;
      if (p) {
        var _ = o.axis_rotated,
          m = r.getResettedPadding(1),
          y = { x: _ ? m : 0, y: _ ? 0 : v, subX: _ ? 1 : 0, subY: _ ? 0 : h },
          T = { x: _ ? v : f, y: _ ? f : m, subX: _ ? v : f, subY: _ ? g : 1 },
          b = e && ((a = c.x) === null || a === void 0 ? void 0 : a.orgDomain()),
          $ = e && l.xDomain;
        ((c.x = r.getXScale(y.x, T.x, b, function () {
          return n.x.tickOffset();
        })),
          (c.subX = r.getXScale(y.x, T.x, $, function (A) {
            var R;
            return A % 1 ? 0 : ((R = n.subX) !== null && R !== void 0 ? R : n.x).tickOffset();
          })),
          (s.xAxisTick = n.getXAxisTickFormat()),
          (s.subXAxisTick = n.getXAxisTickFormat(!0)),
          n.setAxis('x', c.x, o.axis_x_tick_outer, t),
          o.subchart_show && n.setAxis('subX', c.subX, o.axis_x_tick_outer, t),
          (c.y = r.getYScale('y', y.y, T.y, c.y ? c.y.domain() : o.axis_y_default)),
          (c.subY = r.getYScale('y', y.subY, T.subY, c.subY ? c.subY.domain() : o.axis_y_default)),
          n.setAxis('y', c.y, o.axis_y_tick_outer, t),
          o.axis_y2_show &&
            ((c.y2 = r.getYScale('y2', y.y, T.y, c.y2 ? c.y2.domain() : o.axis_y2_default)),
            (c.subY2 = r.getYScale(
              'y2',
              y.subY,
              T.subY,
              c.subY2 ? c.subY2.domain() : o.axis_y2_default,
            )),
            n.setAxis('y2', c.y2, o.axis_y2_tick_outer, t)));
      } else if (x) {
        var w = r.getCurrentPadding();
        ((c.x = Dt().rangeRound([w.left, d.width - w.right])),
          (c.y = Dt().rangeRound([w.top, d.height - w.bottom])));
      } else (i = r.updateArc) === null || i === void 0 || i.call(r);
    },
    xx: function (t) {
      var e = this,
        a = e.config,
        i = e.scale,
        r = i.x,
        n = i.zoom,
        o = a.zoom_enabled && n ? n : r;
      return t ? o(N(t.x) ? t.x : t) : null;
    },
    xv: function (t) {
      var e = this,
        a = e.axis,
        i = e.config,
        r = e.scale,
        n = r.x,
        o = r.zoom,
        s = i.zoom_enabled && o ? o : n,
        l = e.getBaseValue(t);
      return (
        a.isTimeSeries()
          ? (l = Ae.call(e, l))
          : a.isCategorized() && H(l) && (l = i.axis_x_categories.indexOf(l)),
        s(l)
      );
    },
    yv: function (t) {
      var e = this,
        a = e.scale,
        i = a.y,
        r = a.y2,
        n = t.axis && t.axis === 'y2' ? r : i;
      return n(e.getBaseValue(t));
    },
    subxx: function (t) {
      return t ? this.scale.subX(t.x) : null;
    },
  },
  yn = {
    setContainerSize: function () {
      var t = this,
        e = t.state;
      ((e.current.width = t.getCurrentWidth()), (e.current.height = t.getCurrentHeight()));
    },
    getCurrentWidth: function () {
      var t = this;
      return t.config.size_width || t.getParentWidth();
    },
    getCurrentHeight: function () {
      var t = this,
        e = t.config,
        a = e.size_height || t.getParentHeight();
      return a > 0 ? a : 320 / (t.hasType('gauge') && !e.gauge_fullCircle ? 2 : 1);
    },
    getParentRectValue: function (t) {
      for (
        var e = 'offset'.concat(pe(t)), a = this.$el.chart.node(), i = 0;
        i < 30 && a && a.tagName !== 'BODY';
      ) {
        try {
          i = fe(a, !0)[t];
        } catch {
          e in a && (i = a[e]);
        }
        a = a.parentNode;
      }
      var r = te.body[e];
      return (i > r && (i = r), i);
    },
    getParentWidth: function () {
      return this.getParentRectValue('width');
    },
    getParentHeight: function () {
      var t = this.$el.chart.style('height'),
        e = 0;
      return (t && (e = /px$/.test(t) ? parseInt(t, 10) : this.getParentRectValue('height')), e);
    },
    getSvgLeft: function (t) {
      var e = this,
        a = e.config,
        i = e.state.hasAxis,
        r = e.$el,
        n = a.axis_rotated,
        o = n || (!n && !a.axis_y_inner),
        s = n ? ue.axisX : ue.axisY,
        l = r.main.select('.'.concat(s)).node(),
        c = i && a['axis_'.concat(n ? 'x' : 'y', '_label')],
        u = 0;
      if (i && (H(c) || H(c.text) || /^inner-/.test(c?.position))) {
        var d = r.main.select('.'.concat(s, '-label'));
        d.empty() || (u = fe(d.node()).left);
      }
      var f = l && o ? fe(l, !t) : { right: 0 },
        v = fe(r.chart.node(), !t).left + u,
        g = e.hasArcType(),
        h = f.right - v - (g ? 0 : e.getCurrentPaddingByDirection('left', t));
      return h > 0 ? h : 0;
    },
    updateDimension: function (t) {
      var e,
        a = this,
        i = a.config,
        r = a.state.hasAxis,
        n = a.$el;
      (r &&
        !t &&
        a.axis.x &&
        i.axis_rotated &&
        ((e = a.axis.subX) === null || e === void 0 || e.create(n.axis.subX)),
        a.updateScales(t),
        a.updateSvgSize(),
        a.transformAll(!1));
    },
    updateSvgSize: function () {
      var t = this,
        e = t.config,
        a = t.state,
        i = a.clip,
        r = a.current,
        n = a.hasAxis,
        o = a.width,
        s = a.height,
        l = t.$el.svg;
      if (
        (e.resize_auto === 'viewBox'
          ? l.attr('viewBox', '0 0 '.concat(r.width, ' ').concat(r.height))
          : l.attr('width', r.width).attr('height', r.height),
        n)
      ) {
        var c = l.select('.'.concat(Ca.brush, ' .overlay')),
          u = { width: 0, height: 0 };
        (c.size() && ((u.width = +c.attr('width')), (u.height = +c.attr('height'))),
          l
            .selectAll(['#'.concat(i.id), '#'.concat(i.idGrid)])
            .select('rect')
            .attr('width', o)
            .attr('height', s),
          l.select('#'.concat(i.idXAxis)).select('rect').call(t.setXAxisClipPath.bind(t)),
          l.select('#'.concat(i.idYAxis)).select('rect').call(t.setYAxisClipPath.bind(t)),
          i.idSubchart &&
            l
              .select('#'.concat(i.idSubchart))
              .select('rect')
              .attr('width', o)
              .attr('height', u.height));
      }
    },
    getCurrentPaddingByDirection: function (t, e, a) {
      var i;
      (e === void 0 && (e = !1), a === void 0 && (a = !1));
      var r = this,
        n = r.config,
        o = r.$el,
        s = r.state.hasAxis,
        l = n.axis_rotated,
        c = ((i = n.padding) === null || i === void 0 ? void 0 : i.mode) === 'fit',
        u = P(n['padding_'.concat(t)]) ? n['padding_'.concat(t)] : void 0,
        d = s
          ? {
              top: l ? 'y2' : null,
              bottom: l ? 'y' : 'x',
              left: l ? 'x' : 'y',
              right: l ? null : 'y2',
            }[t]
          : null,
        f = /^(left|right)$/.test(t),
        v = d && n['axis_'.concat(d, '_inner')],
        g = d && n['axis_'.concat(d, '_show')],
        h = d ? n['axis_'.concat(d, '_axes')].length : 0,
        p = d ? (f ? r.getAxisWidthByAxisId(d, e) : r.getHorizontalAxisHeight(d)) : 0,
        x = 20,
        _ = 0;
      !c && f && (p = kr(p));
      var m = s && f && (v || (se(u) && !g)) ? 0 : c ? (g ? p : 0) + (u ?? 0) : se(u) ? p : u;
      return (
        f && s
          ? (d &&
              (c || v) &&
              n['axis_'.concat(d, '_label')].text &&
              (m += r.axis.getAxisLabelPosition(d).isOuter ? x : 0),
            t === 'right'
              ? ((m += l ? (!c && se(u) ? 10 : 2) : !g || v ? (c ? 2 : 1) : 0),
                (m += a ? r.axis.getXAxisTickTextY2Overflow(x) : 0))
              : t === 'left' && l && se(u) && (m = n.axis_x_show ? (c ? p : Math.max(p, 40)) : 1))
          : t === 'top'
            ? (o.title && o.title.node() && (m += r.getTitlePadding()), (_ = l && !v ? h : 0))
            : t === 'bottom' && s && l && !g && (m += 1),
        m + p * h - _
      );
    },
    getCurrentPadding: function (t) {
      t === void 0 && (t = !1);
      var e = this,
        a = ['top', 'bottom', 'left', 'right'].map(function (s) {
          return e.getCurrentPaddingByDirection(s, null, t);
        }),
        i = a[0],
        r = a[1],
        n = a[2],
        o = a[3];
      return { top: i, bottom: r, left: n, right: o };
    },
    getResettedPadding: function (t) {
      var e = this,
        a = e.config,
        i = P(t),
        r = i ? 0 : {};
      return (
        a.padding === !1
          ? !i &&
            Object.keys(t).forEach(function (n) {
              r[n] = !$e(a.data_labels) && a.data_labels !== !1 && n === 'top' ? t[n] : 0;
            })
          : (r = t),
        r
      );
    },
    updateSizes: function (t) {
      var e,
        a,
        i,
        r,
        n,
        o = this,
        s = o.config,
        l = o.state,
        c = o.$el.legend,
        u = s.axis_rotated,
        d = o.hasArcType() || l.hasFunnel || l.hasTreemap,
        f = ((e = s.padding) === null || e === void 0 ? void 0 : e.mode) === 'fit';
      !t && o.setContainerSize();
      var v = { width: c ? o.getLegendWidth() : 0, height: c ? o.getLegendHeight() : 0 };
      !d && s.axis_x_show && s.axis_x_tick_autorotate && o.updateXAxisTickClip();
      var g = {
          right: s.legend_show && l.isLegendRight ? o.getLegendWidth() + (f ? 0 : 20) : 0,
          bottom: !s.legend_show || l.isLegendRight || l.isLegendInset ? 0 : v.height,
        },
        h = u || d ? 0 : o.getHorizontalAxisHeight('x'),
        p = s.subchart_axis_x_show && s.subchart_axis_x_tick_text_show ? h : 30,
        x = s.subchart_show && !d ? s.subchart_size_height + p : 0,
        _ =
          o.hasType('gauge') && s.arc_needle_show && !s.gauge_fullCircle && !s.gauge_label_show
            ? 10
            : 0,
        m = o.getCurrentPadding(!0);
      if (
        ((l.margin =
          !d && u
            ? {
                top: m.top,
                right: d ? 0 : m.right + g.right,
                bottom: g.bottom + m.bottom,
                left: x + (d ? 0 : m.left),
              }
            : {
                top: (f ? 0 : 4) + m.top,
                right: d ? 0 : m.right + g.right,
                bottom: _ + x + g.bottom + m.bottom,
                left: d ? 0 : m.left,
              }),
        (l.margin = o.getResettedPadding(l.margin)),
        (l.margin2 = u
          ? {
              top: l.margin.top,
              right: NaN,
              bottom: 20 + g.bottom,
              left: o.state.rotatedPadding.left,
            }
          : {
              top: l.current.height - x - g.bottom,
              right: NaN,
              bottom: p + g.bottom,
              left: l.margin.left,
            }),
        (l.margin3 = { top: 0, right: NaN, bottom: 0, left: 0 }),
        (a = o.updateSizeForLegend) === null || a === void 0 || a.call(o, v),
        (l.width = l.current.width - l.margin.left - l.margin.right),
        (l.height = l.current.height - l.margin.top - l.margin.bottom),
        l.width < 0 && (l.width = 0),
        l.height < 0 && (l.height = 0),
        (l.width2 = u ? l.margin.left - l.rotatedPadding.left - l.rotatedPadding.right : l.width),
        (l.height2 = u ? l.height : l.current.height - l.margin2.top - l.margin2.bottom),
        l.width2 < 0 && (l.width2 = 0),
        l.height2 < 0 && (l.height2 = 0),
        o.hasArcType())
      ) {
        var y = o.hasType('gauge'),
          T = s.legend_show && l.isLegendRight,
          b = (i = l.hasRadar && o.cache.get(re.radarTextWidth)) !== null && i !== void 0 ? i : 0;
        ((l.arcWidth = l.width - (T ? v.width + 10 : 0) - b),
          (l.arcHeight = l.height - (T && !y ? 0 : 10)),
          !((r = s.arc_rangeText_values) === null || r === void 0) &&
            r.length &&
            (y
              ? ((l.arcWidth -= 25), (l.arcHeight -= 10), (l.margin.left += 10))
              : ((l.arcHeight -= 20), (l.margin.top += 10))),
          y && !s.gauge_fullCircle && (l.arcHeight += l.height - o.getPaddingBottomForGauge()),
          (n = o.updateRadius) === null || n === void 0 || n.call(o));
      }
      l.isLegendRight && d && (l.margin3.left = l.arcWidth / 2 + l.radiusExpanded * 1.1);
    },
  },
  bn = {
    setCssRule: function (t, e, a, i) {
      var r = this,
        n = r.config,
        o = r.state,
        s = o.cssRule,
        l = o.style;
      return n.boost_useCssRule
        ? function (c) {
            c.each(function (u) {
              var d = i && i?.call(r, u),
                f = ''
                  .concat(t ? '.'.concat(oe.shapes + r.getTargetSelectorSuffix(u.id)) : '')
                  .concat(e);
              (e in s && l.sheet.deleteRule(s[f]),
                (r.state.cssRule[f] = zr(
                  l,
                  f,
                  a.filter(Boolean).map(function (v) {
                    return H(d) && v.indexOf(':') === -1 ? ''.concat(v, ': ').concat(d) : v || '';
                  }),
                )));
            });
          }
        : function () {};
    },
    getStylePropValue: function (t) {
      var e = this.config.boost_useCssRule;
      return e ? null : I(t) ? t.bind(this) : t;
    },
  };
function Tn(t) {
  var e = 'middle';
  return (t > 0 && t <= 170 ? (e = 'end') : t > 190 && t <= 360 && (e = 'start'), e);
}
function $n(t, e, a, i, r) {
  var n,
    o = this,
    s = t.value,
    l = o.isCandlestickType(t),
    c =
      (P(s) && s < 0) ||
      (l && !(!((n = o.getCandlestickData(t)) === null || n === void 0) && n._isUp)),
    u = e.x,
    d = e.y,
    f = 4,
    v = f * 2;
  return (
    i
      ? a === 'start'
        ? ((u += c ? 0 : v), (d += f))
        : a === 'middle'
          ? ((u += v), (d -= v))
          : a === 'end' && (c && (u -= v), (d += f))
      : (a === 'start'
          ? ((u += f), c && (d += v * 2))
          : a === 'middle'
            ? (d -= v)
            : a === 'end' && ((u -= f), c && (d += v * 2)),
        r && (d += c ? -17 : l ? 13 : 7)),
    { x: u, y: d }
  );
}
function sa(t, e) {
  var a,
    i = this.config.data_labels_position,
    r = t.id,
    n = t.index,
    o = t.value;
  return (a = I(i) ? i.bind(this.api)(e, o, r, n, this.$el.text) : (r in i ? i[r] : i)[e]) !==
    null && a !== void 0
    ? a
    : 0;
}
function An(t, e, a) {
  var i,
    r,
    n = this,
    o = n.config,
    s = n.$T,
    l = o.axis_rotated,
    c = o.data_labels.border,
    u = c.padding,
    d = u === void 0 ? '3 5' : u,
    f = c.radius,
    v = f === void 0 ? 10 : f,
    g = c.stroke,
    h = g === void 0 ? '#000' : g,
    p = c.strokeWidth,
    x = p === void 0 ? 1 : p,
    _ = c.fill,
    m = _ === void 0 ? 'none' : _,
    y = Nr(d),
    T = o.data_labels.border !== !0,
    b = Be(t),
    $ = L(t.previousElementSibling);
  (($.empty() ||
    ((i = $.node()) === null || i === void 0 ? void 0 : i.tagName) !== 'rect' ||
    !(!((r = $.attr('class')) === null || r === void 0) && r.includes(a))) &&
    (($ = L(t.parentNode)
      .insert('rect', function () {
        return t;
      })
      .attr('class', ''.concat(ce.textBorderRect, ' ').concat(a))
      .attr('width', b.width + (T ? y.left + y.right : 0))
      .attr('height', b.height + (T ? y.top + y.bottom : 0))),
    T &&
      $.style('fill', m)
        .style('stroke', h)
        .style('stroke-width', ''.concat(x, 'px'))
        .attr('rx', v)
        .attr('ry', v)),
    s($)
      .attr('x', e.x - (T ? y.left : 0) - (l ? 0 : b.width / 2))
      .attr('y', e.y - (T ? y.top : 0) - (b.height / 4) * 3.2));
}
function Ht(t, e) {
  t === void 0 && (t = 0);
  var a = this,
    i = a.config,
    r = i[''.concat(e, '_label_threshold')] || 0;
  return t >= r;
}
function ja() {
  var t = this,
    e = t.$el.text,
    a = t.config,
    i = t.state.arcWidth;
  (i ? t.getArcLabelConfig('image') : a.data_labels.image) &&
    e
      .filter(function () {
        var r = this.previousElementSibling;
        return r ? r.tagName !== 'image' || !r.classList.contains(ce.textLabelImage) : !0;
      })
      .each(function (r) {
        var n,
          o,
          s,
          l,
          c = wn.call(t, r),
          u = c.url,
          d = c.width,
          f = c.height,
          v = c.pos;
        if (u) {
          var g = L(this.parentNode);
          g?.insert(
            'image',
            ''.concat(
              (o =
                (n = this.getAttribute('class')) === null || n === void 0
                  ? void 0
                  : n.replace(/(?:^(.)|\s)/g, '.$1')) !== null && o !== void 0
                ? o
                : 'text',
            ),
          )
            .style('opacity', '0')
            .attr('href', function (h) {
              return vt(u, { ID: 'id' in h ? h.id : h.data.id });
            })
            .attr('class', ce.textLabelImage)
            .style('pointer-events', 'none')
            .attr('width', d)
            .attr('height', f)
            .attr(
              'transform',
              v
                ? 'translate('
                    .concat((s = v.x) !== null && s !== void 0 ? s : 0, ' ')
                    .concat((l = v.y) !== null && l !== void 0 ? l : 0, ')')
                : null,
            );
        }
      });
}
function wn(t) {
  var e,
    a = this,
    i = a.config,
    r = a.state,
    n = r.arcWidth ? a.getArcLabelConfig('image') : i.data_labels.image;
  if (I(n))
    return (e = n.call(a.api, t.value, t.id, t.index)) !== null && e !== void 0
      ? e
      : { url: '', width: 0, height: 0, pos: { x: 0, y: 0 } };
  if (n) {
    var o = n.url,
      s = o === void 0 ? '' : o,
      l = n.width,
      c = l === void 0 ? 0 : l,
      u = n.height,
      d = u === void 0 ? 0 : u,
      f = n.pos;
    return { url: s, width: c, height: d, pos: f };
  }
  return null;
}
function Za(t, e) {
  var a = this,
    i,
    r = this,
    n = r.config,
    o = r.state,
    s = o.arcWidth,
    l = o.hasTreemap,
    c = n.axis_rotated,
    u = L(t.previousElementSibling),
    d = function (x) {
      var _,
        m = x.style.opacity !== '0' && x.style.fillOpacity !== '0';
      return (
        (s ? x.textContent : m) &&
        ((_ = a.previousElementSibling) === null || _ === void 0 ? void 0 : _.tagName) !== 'image'
      );
    };
  if (!u.empty() && ((i = u.node()) === null || i === void 0 ? void 0 : i.tagName) === 'image') {
    var f = fe(t),
      v = +u.attr('width') / 2,
      g = +u.attr('height') / 2,
      h = e.x - v,
      p = e.y - g - f.height / 2;
    (c
      ? (e.x += v)
      : (l && ((h = -v), (p = -(g * 2 + f.height))),
        r.hasType('pie') || r.hasType('polar') || (e.y += g)),
      r
        .$T(u)
        .style('opacity', d(t) ? null : '0')
        .attr('x', h)
        .attr('y', p));
  }
}
function Rn(t) {
  return Va(
    t,
    function (e) {
      return e;
    },
    function (e) {
      return Be(e);
    },
  );
}
var Sn = {
  opacityForText: function (t) {
    var e = this;
    return e.isBarType(t) && !Ht.call(e, Math.abs(e.getRatio('bar', t)), 'bar')
      ? '0'
      : e.hasDataLabel
        ? null
        : '0';
  },
  initText: function () {
    var t = this.$el;
    t.main
      .select('.'.concat(z.chart))
      .append('g')
      .attr('class', ce.chartTexts)
      .style('pointer-events', t.funnel || t.treemap ? 'none' : null);
  },
  updateTargetsForText: function (t) {
    var e = this,
      a = e.getChartClass('Text'),
      i = e.getClass('texts', 'id'),
      r = e.classFocus.bind(e),
      n = e.$el.main
        .select('.'.concat(ce.chartTexts))
        .selectAll('.'.concat(ce.chartText))
        .data(e.filterNullish(t))
        .attr('class', function (s) {
          return ''.concat(a(s)).concat(r(s)).trim();
        }),
      o = n
        .enter()
        .append('g')
        .style('opacity', '0')
        .attr('class', a)
        .call(
          e.setCssRule(
            !0,
            ' .'.concat(ce.text),
            ['fill', 'pointer-events:none'],
            e.updateTextColor,
          ),
        );
    o.append('g').attr('class', i);
  },
  updateText: function () {
    var t = this,
      e = t.$el,
      a = t.$T,
      i = t.config,
      r = t.axis,
      n = t.getClass('text', 'index'),
      o = i.data_labels.centered,
      s = e.main
        .selectAll('.'.concat(ce.texts))
        .selectAll('.'.concat(ce.text))
        .data(t.labelishData.bind(t));
    (a(s.exit()).style('fill-opacity', '0').remove(),
      (e.text = s
        .enter()
        .append('text')
        .merge(s)
        .attr('class', n)
        .attr('text-anchor', function (l) {
          var c = i['axis_'.concat(r?.getId(l.id), '_inverted')],
            u = c ? l.value > 0 : l.value < 0;
          if (t.isCandlestickType(l)) {
            var d = t.getCandlestickData(l);
            u = !d?._isUp;
          } else if (t.isTreemapType(l)) return o ? 'middle' : 'start';
          return i.axis_rotated ? (u ? 'end' : 'start') : 'middle';
        })
        .style('fill', t.getStylePropValue(t.updateTextColor))
        .style('fill-opacity', '0')
        .each(function (l, c, u) {
          var d = L(this),
            f = l.value;
          if (t.isBubbleZType(l)) f = t.getBubbleZData(f, 'z');
          else if (t.isCandlestickType(l)) {
            var v = t.getCandlestickData(l);
            v && (f = v.close);
          }
          ((f = t.isTreemapType(l)
            ? t.treemapDataLabelFormat(l)(d)
            : t.dataLabelFormat(l.id)(f, l.id, l.index, u)),
            P(f) ? (this.textContent = f) : at(d, f, void 0, !0));
        })),
      ja.call(t));
  },
  updateTextColor: function (t) {
    var e = this,
      a = e.config,
      i = a.data_labels_colors,
      r =
        (e.isArcType(t) && !e.isRadarType(t)) || e.isFunnelType(t) || e.isTreemapType(t)
          ? null
          : e.color(t),
      n;
    if (H(i)) n = i;
    else if (W(i)) {
      var o = (t.data || t).id;
      n = i[o];
    } else I(i) && (n = i.bind(e.api)(r, t));
    if (e.isCandlestickType(t) && !I(i)) {
      var s = e.getCandlestickData(t);
      if (!s?._isUp) {
        var l = a.candlestick_color_down;
        n = W(l) ? l[t.id] : l;
      }
    }
    return n || r;
  },
  updateTextBGColor: function (t, e) {
    var a = this,
      i = a.$el.defs,
      r = '';
    if (e) {
      var n = H(e) ? '' : a.getTargetSelectorSuffix('id' in t ? t.id : t.data.id),
        o = i.select(["filter[id*='labels-bg", "']"].join(n));
      if ((o.size() && (r = 'url(#'.concat(o.attr('id'), ')')), I(e))) {
        a.generateTextBGColorFilter(e);
        var s = a.color(t),
          l = e.bind(a.api)(s, t);
        l ? o.select('feFlood').attr('flood-color', l) : (r = '');
      }
    }
    return r || null;
  },
  redrawText: function (t, e, a, i) {
    var r = this,
      n = r.$T,
      o = r.axis,
      s = r.config,
      l = r.state.hasTreemap,
      c = Ce(!0),
      u = s.axis_rotated,
      d = s.data_labels.rotate,
      f = Tn(d),
      v = d ? 'rotate('.concat(d, ')') : '',
      g = new Map();
    if (s.data_labels.centered) {
      var h = [];
      (r.$el.text.each(function (p) {
        (r.isBarType(p) || r.isTreemapType(p)) && h.push(this);
      }),
        h.length > 0 && (g = Rn(h)));
    }
    return (
      r.$el.text
        .style('fill', r.getStylePropValue(r.updateTextColor))
        .attr('filter', function (p) {
          return r.updateTextBGColor.bind(r)(p, s.data_labels_backgroundColors);
        })
        .style('fill-opacity', a ? 0 : r.opacityForText.bind(r))
        .each(function (p, x) {
          var _ = g.get(this),
            m = n(
              l && this.childElementCount ? this.parentNode : this,
              !!(i && (this.getAttribute('x') || this.getAttribute('transform'))),
              c,
            ),
            y = s['axis_'.concat(o?.getId(p.id), '_inverted')],
            T = { x: t.bind(this)(p, x, _), y: e.bind(this)(p, x, _) };
          (d && ((T = $n.bind(r)(p, T, f, u, y)), m.attr('text-anchor', f)),
            Za.call(r, this, T),
            this.childElementCount || d
              ? m.attr('transform', 'translate('.concat(T.x, ' ').concat(T.y, ') ').concat(v))
              : m.attr('x', T.x).attr('y', T.y),
            s.data_labels.border &&
              An.call(r, m.node(), T, ''.concat(ce.textBorderRect, '-').concat(x)));
        }),
      !0
    );
  },
  getTextRect: function (t, e) {
    var a,
      i,
      r,
      n = this,
      o,
      s,
      l;
    Array.isArray(t)
      ? (o = ''.concat(re.textRect, '-').concat(t.join('_')))
      : ((s =
          (r = (i = (a = t).node) === null || i === void 0 ? void 0 : i.call(a)) !== null &&
          r !== void 0
            ? r
            : t),
        /text/i.test(s.tagName) || (s = s.querySelector('text')),
        (l = s.textContent),
        (o = ''.concat(re.textRect, '-').concat(l.replace(/\W/g, '_'))));
    var c = n.cache.get(o) || [];
    return (
      c.length === 0 &&
        ((n.$el.svg || n.$el.chart.select('svg'))
          .selectAll('.'.concat(z.dummy))
          .data(l ? [l] : t)
          .enter()
          .append('text')
          .style('visibility', 'hidden')
          .style('font', s ? L(s).style('font') : null)
          .classed(e || z.dummy, !0)
          .text(function (u) {
            return u;
          })
          .each(function (u, d) {
            c[d] = fe(this);
          })
          .remove(),
        n.cache.add(o, c)),
      c.length > 1 ? c : c[0]
    );
  },
  generateXYForText: function (t, e) {
    var a = this,
      i = a.state,
      r = i.hasRadar,
      n = i.hasFunnel,
      o = i.hasTreemap,
      s = Object.keys(t),
      l = {},
      c = e ? a.getXForText : a.getYForText;
    return (
      n && s.push('funnel'),
      r && s.push('radar'),
      o && s.push('treemap'),
      s.forEach(function (u) {
        l[u] = a['generateGet'.concat(pe(u), 'Points')](t[u], !1);
      }),
      function (u, d) {
        var f =
          (a.isAreaType(u) && 'area') ||
          (a.isBarType(u) && 'bar') ||
          (a.isCandlestickType(u) && 'candlestick') ||
          (a.isFunnelType(u) && 'funnel') ||
          (a.isRadarType(u) && 'radar') ||
          (a.isTreemapType(u) && 'treemap') ||
          'line';
        return c.call(a, l[f](u, d), u, this);
      }
    );
  },
  getCenteredTextPos: function (t, e, a, i, r) {
    var n = this,
      o = n.config,
      s = o.axis_rotated,
      l = n.isBarType(t),
      c = n.isTreemapType(t);
    if (o.data_labels.centered && (l || c)) {
      var u = r || Be(a);
      if (l) {
        var d = n.getRangedData(t, null, 'bar') >= 0;
        if (s) {
          var f = (d ? e[1][1] - e[0][1] : e[0][1] - e[1][1]) / 2 + u.width / 2;
          return d ? -f - 3 : f + 2;
        } else {
          var v = (d ? e[0][1] - e[1][1] : e[1][1] - e[0][1]) / 2 + u.height / 2;
          return d ? v : -v - 2;
        }
      } else if (c)
        return i === 'x' ? (e[1][0] - e[0][0]) / 2 : (e[1][1] - e[0][1]) / 2 - u.y - u.height / 2;
    }
    return 0;
  },
  getXForText: function (t, e, a, i) {
    var r,
      n = this,
      o = n.config,
      s = o.axis_rotated,
      l = n.isFunnelType(e),
      c = n.isTreemapType(e),
      u = t ? t[0][0] : 0;
    if (n.isCandlestickType(e))
      s
        ? (u =
            !((r = n.getCandlestickData(e)) === null || r === void 0) && r._isUp
              ? t[2][2] + 4
              : t[2][1] - 4)
        : (u += (t[1][0] - u) / 2);
    else if (l) u += n.state.current.width / 2;
    else if (c) u += o.data_labels.centered ? 0 : 5;
    else if (s) {
      var d = o['axis_'.concat(n.axis.getId(e.id), '_inverted')],
        f = n.isBarType(e) ? 4 : 6,
        v = e.value;
      ((u = t[2][1]), d ? (u -= f * (v > 0 ? 1 : -1)) : (u += f * (v < 0 ? -1 : 1)));
    } else u = n.hasType('bar') ? (t[2][0] + t[0][0]) / 2 : u;
    return ((s || c) && (u += n.getCenteredTextPos(e, t, a, 'x', i)), u + sa.call(this, e, 'x'));
  },
  getYForText: function (t, e, a, i) {
    var r = this,
      n = r.axis,
      o = r.config,
      s = r.state,
      l = o.axis_rotated,
      c = o['axis_'.concat(n?.getId(e.id), '_inverted')],
      u = r.isBarType(e),
      d = r.isFunnelType(e),
      f = r.isTreemapType(e),
      v = o.point_r,
      g = fe(a),
      h = e.value,
      p = 3,
      x;
    if (r.isCandlestickType(e))
      ((h = r.getCandlestickData(e)),
        l
          ? ((x = t[0][0]), (x += (t[1][0] - x) / 2 + p))
          : ((x = h && h._isUp ? t[2][2] - p : t[2][1] + p * 4),
            c && (x += 15 * (h._isUp ? 1 : -1))));
    else if (d) x = t ? t[0][1] + (t[1][1] - t[0][1]) / 2 + g.height / 2 - 3 : 0;
    else if (f) x = t[0][1] + (o.data_labels.centered ? 0 : g.height + 5);
    else if (l) x = (t[0][0] + t[2][0] + g.height * 0.6) / 2;
    else if (
      ((x = t[2][1]),
      P(v) && v > 5 && (r.isLineType(e) || r.isScatterType(e)) && (p += o.point_r / 2.3),
      h < 0 || (h === 0 && !s.hasPositiveValue && s.hasNegativeValue))
    )
      x += c ? (u ? -3 : -5) : g.height + (u ? -p : p);
    else {
      var _ = -p * 2;
      (u ? (_ = -p) : r.isBubbleType(e) && (_ = p), c && (_ = u ? 10 : 15), (x += _));
    }
    return ((!l || f) && (x += r.getCenteredTextPos(e, t, a, 'y', i)), x + sa.call(this, e, 'y'));
  },
  markOverlapped: function (t, e, a) {
    var i = e.$el.arcs.selectAll(a),
      r = i.filter(function (l) {
        return l.data.id !== t;
      }),
      n = i.filter(function (l) {
        return l.data.id === t;
      }),
      o = aa(n.node()),
      s = function (l, c) {
        return Math.sqrt(Math.pow(l, 2) + Math.pow(c, 2));
      };
    n.node() &&
      r.each(function () {
        var l = aa(this),
          c = L(this),
          u = s(o.e, o.f) > s(l.e, l.f) ? n : c,
          d = Math.ceil(Math.abs(o.e - l.e)) < Math.ceil(u.node().getComputedTextLength()),
          f = Math.ceil(Math.abs(o.f - l.f)) < parseInt(n.style('font-size'), 10);
        c.classed(ce.TextOverlapping, d && f);
      });
  },
  undoMarkOverlapped: function (t, e) {
    t.$el.arcs.selectAll(e).each(function () {
      Ta([this, this.previousSibling]).classed(ce.TextOverlapping, !1);
    });
  },
};
function la(t, e) {
  t === void 0 && (t = 'left');
  var a = P(e),
    i;
  return (
    t.indexOf('center') > -1
      ? (i = a ? e / 2 : 'middle')
      : t.indexOf('right') > -1
        ? (i = a ? e : 'end')
        : (i = a ? 0 : 'start'),
    i
  );
}
var Cn = {
    initTitle: function () {
      var t = this,
        e = t.config,
        a = t.$el;
      if (e.title_text) {
        a.title = a.svg.append('g');
        var i = a.title
          .append('text')
          .style('text-anchor', la(e.title_position))
          .attr('class', ce.title);
        at(i, e.title_text, [0.3, 1.5]);
      }
    },
    redrawTitle: function () {
      var t = this,
        e = t.config,
        a = t.state.current,
        i = t.$el.title;
      if (i) {
        var r = la(e.title_position, a.width),
          n = (e.title_padding.top || 0) + t.getTextRect(t.$el.title, ce.title).height;
        i.attr('transform', 'translate('.concat(r, ', ').concat(n, ')'));
      }
    },
    getTitlePadding: function () {
      var t = this,
        e = t.$el.title,
        a = t.config;
      return (
        (a.title_padding.top || 0) +
        (e ? t.getTextRect(e, ce.title).height : 0) +
        (a.title_padding.bottom || 0)
      );
    },
  },
  Ln = {
    initTooltip: function () {
      var t = this,
        e = t.config,
        a = t.$el;
      ((a.tooltip = L(e.tooltip_contents.bindto)),
        a.tooltip.empty() &&
          (a.tooltip = a.chart
            .append('div')
            .attr('class', xt.tooltipContainer)
            .style('position', 'absolute')
            .style('pointer-events', 'none')
            .style('display', 'none')),
        t.bindTooltipResizePos());
    },
    initShowTooltip: function () {
      var t,
        e,
        a = this,
        i = a.config,
        r = a.$el,
        n = a.state,
        o = n.hasAxis,
        s = n.hasRadar;
      if (i.tooltip_init_show) {
        var l = !(o || s);
        (!((e = a.axis) === null || e === void 0) &&
          e.isTimeSeries() &&
          H(i.tooltip_init_x) &&
          (i.tooltip_init_x = Ae.call(a, i.tooltip_init_x)),
          a.api.tooltip.show({ data: ((t = {}), (t[l ? 'index' : 'x'] = i.tooltip_init_x), t) }));
        var c = i.tooltip_init_position;
        if (!i.tooltip_contents.bindto && !$e(c)) {
          var u = c.top,
            d = u === void 0 ? 0 : u,
            f = c.left,
            v = f === void 0 ? 50 : f;
          r.tooltip
            .style('top', H(d) ? d : ''.concat(d, 'px'))
            .style('left', H(v) ? v : ''.concat(v, 'px'))
            .style('display', null);
        }
      }
    },
    getTooltipHTML: function () {
      for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
      var a = this,
        i = a.api,
        r = a.config;
      return tt(
        I(r.tooltip_contents)
          ? r.tooltip_contents.bind(i).apply(void 0, t)
          : a.getTooltipContent.apply(a, t),
      );
    },
    getTooltipContent: function (t, e, a, i) {
      var r,
        n = this,
        o = n.api,
        s = n.config,
        l = n.state,
        c = n.$el,
        u = ['title', 'name', 'value'].map(function (O) {
          var B = s['tooltip_format_'.concat(O)];
          return I(B) ? B.bind(o) : B;
        }),
        d = u[0],
        f = u[1],
        v = u[2],
        g = function () {
          for (var O = [], B = 0; B < arguments.length; B++) O[B] = arguments[B];
          return (d || e).apply(void 0, O);
        },
        h = function () {
          for (var O = [], B = 0; B < arguments.length; B++) O[B] = arguments[B];
          return (
            f ||
            function (Y) {
              return Y;
            }
          ).apply(void 0, O);
        },
        p = function (O, B, Y, ae) {
          var Se = v;
          return (
            Se ||
              (l.hasTreemap ||
              (n.isStackNormalized() && (!n.isStackNormalizedPerGroup() || n.isGrouped(Y)))
                ? (Se = function (be, Pe) {
                    return ''.concat((Pe * 100).toFixed(2), '%');
                  })
                : (Se = a)),
            Se(O, B, Y, ae)
          );
        },
        x = s.tooltip_order,
        _ = function (O) {
          return n.axis && n.isBubbleZType(O) ? n.getBubbleZData(O.value, 'z') : n.getBaseValue(O);
        },
        m = n.levelColor
          ? function (O) {
              return n.levelColor(O.value);
            }
          : function (O) {
              return i(O);
            },
        y = s.tooltip_contents,
        T = y.template,
        b = n.mapToTargetIds();
      if (x === null && s.data_groups.length) {
        var $ = n
          .orderTargets(n.data.targets)
          .map(function (O) {
            return O.id;
          })
          .reverse();
        t.sort(function (O, B) {
          var Y = O ? O.value : null,
            ae = B ? B.value : null;
          return (
            Y > 0 &&
              ae > 0 &&
              ((Y = O.id ? $.indexOf(O.id) : null), (ae = B.id ? $.indexOf(B.id) : null)),
            Y - ae
          );
        });
      } else if (/^(asc|desc)$/.test(x)) {
        var w = x === 'asc';
        t.sort(function (O, B) {
          var Y = O ? _(O) : null,
            ae = B ? _(B) : null;
          return w ? Y - ae : ae - Y;
        });
      } else I(x) && t.sort(x.bind(o));
      var A = n.getTooltipContentTemplate(T),
        R = t.length,
        C,
        S,
        M,
        k,
        Z,
        G = function () {
          if (((S = t[Z]), !S || !(_(S) || _(S) === 0))) return 'continue';
          if (se(C)) {
            var O = (l.hasAxis || l.hasRadar) && g(S.x);
            C = vt(A[0], {
              CLASS_TOOLTIP: xt.tooltip,
              TITLE: N(O) ? (T ? O : '<tr><th colspan="2">'.concat(O, '</th></tr>')) : '',
            });
          }
          if (
            (!S.ratio &&
              c.arcs &&
              ((M = ['arc', n.$el.arcs.select('path.'.concat(V.arc, '-').concat(S.id)).data()[0]]),
              (S.ratio = n.getRatio.apply(n, M))),
            (M = [S.ratio, S.id, S.index]),
            n.isAreaRangeType(S))
          ) {
            var B = ['high', 'low'].map(function (Ee) {
                return p.apply(void 0, ne([n.getRangedData(S, Ee)], M, !1));
              }),
              Y = B[0],
              ae = B[1],
              Se = p.apply(void 0, ne([_(S)], M, !1));
            k = '<b>Mid:</b> '.concat(Se, ' <b>High:</b> ').concat(Y, ' <b>Low:</b> ').concat(ae);
          } else if (n.isCandlestickType(S)) {
            var be = ['open', 'high', 'low', 'close', 'volume'].map(function (qe) {
                var Je = n.getRangedData(S, qe, 'candlestick');
                return Je
                  ? p.apply(void 0, ne([n.getRangedData(S, qe, 'candlestick')], M, !1))
                  : void 0;
              }),
              Pe = be[0],
              Y = be[1],
              ae = be[2],
              Ke = be[3],
              Xe = be[4];
            k = '<b>Open:</b> '
              .concat(Pe, ' <b>High:</b> ')
              .concat(Y, ' <b>Low:</b> ')
              .concat(ae, ' <b>Close:</b> ')
              .concat(Ke)
              .concat(Xe ? ' <b>Volume:</b> '.concat(Xe) : '');
          } else if (n.isBarRangeType(S)) {
            var D = S.value,
              ge = S.id,
              de = S.index;
            k = ''.concat(p(D, void 0, ge, de));
          } else k = p.apply(void 0, ne([_(S)], M, !1));
          if (k !== void 0) {
            if (S.name === null) return 'continue';
            var xe = h.apply(void 0, ne([(r = S.name) !== null && r !== void 0 ? r : S.id], M, !1)),
              De = m(S),
              Le = {
                CLASS_TOOLTIP_NAME: xt.tooltipName + n.getTargetSelectorSuffix(S.id),
                COLOR:
                  T || !n.patterns
                    ? De
                    : '<svg><rect style="fill:'.concat(
                        De,
                        '" width="10" height="10"></rect></svg>',
                      ),
                NAME: xe,
                VALUE: k,
              };
            if (T && W(y.text)) {
              var Ne = b.indexOf(S.id);
              Object.keys(y.text).forEach(function (Ee) {
                Le[Ee] = y.text[Ee][Ne];
              });
            }
            C += vt(A[1], Le);
          }
        };
      for (Z = 0; Z < R; Z++) G();
      return ''.concat(C, '</table>');
    },
    getTooltipContentTemplate: function (t) {
      return (
        t ||
        `<table class="{=CLASS_TOOLTIP}"><tbody>
				{=TITLE}
				{{<tr class="{=CLASS_TOOLTIP_NAME}">
					<td class="name">`.concat(
          this.patterns ? '{=COLOR}' : '<span style="background-color:{=COLOR}"></span>',
          `{=NAME}</td>
					<td class="value">{=VALUE}</td>
				</tr>}}
			</tbody></table>`,
        )
      )
        .replace(/(\r?\n|\t)/g, '')
        .split(/{{(.*)}}/);
    },
    setTooltipPosition: function (t, e) {
      var a,
        i,
        r = this,
        n = r.config,
        o = r.scale,
        s = r.state,
        l = r.$el,
        c = l.eventRect,
        u = l.tooltip,
        d = l.svg,
        f = n.tooltip_contents.bindto,
        v = n.axis_rotated,
        g = u?.datum();
      if (!f && g) {
        var h = t ?? JSON.parse(g.current),
          p = Te(s.event, e ?? c?.node()),
          x = p[0],
          _ = p[1],
          m = { x, y: _ };
        if (s.hasAxis && o.x && g && 'x' in g) {
          var y = function (R, C, S) {
            var M;
            (R === void 0 && (R = 0), S === void 0 && (S = 'y'));
            var k = o[C ? ((M = r.axis) === null || M === void 0 ? void 0 : M.getId(C)) : S];
            return k ? k(R) + (v ? s.margin.left : s.margin.top) : 0;
          };
          ((m.xAxis = o.x(g.x) + (n.tooltip_position ? (v ? s.margin.top : s.margin.left) : 0)),
            h.length === 1 ? (m.yAxis = y(h[0].value, h[0].id)) : (m.yAxis = y));
        }
        var T = g.width,
          b = T === void 0 ? 0 : T,
          $ = g.height,
          w = $ === void 0 ? 0 : $,
          A =
            (i =
              (a = n.tooltip_position) === null || a === void 0
                ? void 0
                : a.bind(r.api)(h, b, w, c?.node(), m)) !== null && i !== void 0
              ? i
              : Yt(d)
                ? r.getTooltipPositionViewBox.bind(r)(b, w, m)
                : r.getTooltipPosition.bind(r)(b, w, m);
        ['top', 'left'].forEach(function (R) {
          var C = A[R];
          (u.style(R, ''.concat(C, 'px')),
            R === 'left' && !g.xPosInPercent && (g.xPosInPercent = (C / s.current.width) * 100));
        });
      }
    },
    getTooltipPositionViewBox: function (t, e, a) {
      var i,
        r,
        n = this,
        o = n.$el,
        s = o.eventRect,
        l = o.svg,
        c = n.config,
        u = n.state,
        d = c.axis_rotated,
        f = n.hasArcType() || u.hasFunnel || u.hasTreemap,
        v =
          (r = (i = f ? l : s) === null || i === void 0 ? void 0 : i.node()) !== null &&
          r !== void 0
            ? r
            : u.event.target,
        g = a.x,
        h = a.y;
      u.hasAxis && ((g = d ? g : a.xAxis), (h = d ? a.xAxis : h));
      var p = Tt(v, g, h, !1),
        x = fe(v),
        _ = Tt(v, 20, 0, !1).x,
        m = p.y,
        y = p.x + t / 2 + _;
      return (
        f &&
          (u.hasFunnel || u.hasTreemap || u.hasRadar
            ? ((y -= t / 2 + _), (m += e))
            : ((m += x.height / 2), (y += x.width / 2 - (t - _)))),
        y + t > x.width && (y = x.width - t - _),
        m + e > x.height && (m -= e * 2),
        { top: m, left: y }
      );
    },
    getTooltipPosition: function (t, e, a) {
      var i,
        r,
        n,
        o = this,
        s = o.config,
        l = o.scale,
        c = o.state,
        u = c.width,
        d = c.height,
        f = c.current,
        v = c.hasFunnel,
        g = c.hasRadar,
        h = c.hasTreemap,
        p = c.isLegendRight,
        x = c.inputType,
        _ = o.hasType('gauge') && !s.gauge_fullCircle,
        m = s.axis_rotated,
        y = o.hasArcType(),
        T = o.getSvgLeft(!0),
        b = T + f.width - o.getCurrentPaddingByDirection('right'),
        $ = 20,
        w = a.x,
        A = a.y;
      if (g) ((w += w >= u / 2 ? 15 : -(t + 15)), (A += 15));
      else if (y) {
        var R = x !== 'touch';
        if (R) {
          var C =
            (r = (i = o.getTitlePadding) === null || i === void 0 ? void 0 : i.call(o)) !== null &&
            r !== void 0
              ? r
              : 0;
          (C &&
            _ &&
            !((n = s.arc_rangeText_values) === null || n === void 0) &&
            n.length &&
            (C += 10),
            (w += (u - (p ? o.getLegendWidth() : 0)) / 2),
            (A += (_ ? d : d / 2 + e) + C));
        }
      } else if (v || h) A += e;
      else {
        var S = {
          top: o.getCurrentPaddingByDirection('top', !0),
          left: o.getCurrentPaddingByDirection('left', !0),
        };
        m
          ? ((w += T + S.left + $), (A = S.top + a.xAxis + $), (b -= T))
          : ((w = T + S.left + $ + (l.zoom ? w : a.xAxis)), (A += S.top - 5));
      }
      if ((w + t + 15 > b && (w -= t + (v || h || y ? 0 : m ? $ * 2 : 38)), A + e > f.height)) {
        var M = h ? e + 10 : 30;
        A -= _ ? e * 1.5 : e + M;
      }
      var k = { top: A, left: w };
      return (
        Object.keys(k).forEach(function (Z) {
          k[Z] < 0 && (k[Z] = 0);
        }),
        k
      );
    },
    showTooltip: function (t, e) {
      var a = this,
        i = a.config,
        r = a.$el.tooltip,
        n = t.filter(function (d) {
          return d && N(a.getBaseValue(d));
        });
      if (!(!r || n.length === 0 || !i.tooltip_show)) {
        var o = r.datum(),
          s = JSON.stringify(t);
        if (!o || o.current !== s) {
          var l = t.concat().sort()[0],
            c = l.index,
            u = l.x;
          (Q(i.tooltip_onshow, a.api, t),
            r
              .html(
                a.getTooltipHTML(
                  t,
                  a.axis ? a.axis.getXAxisTickFormat() : a.categoryName.bind(a),
                  a.getDefaultValueFormat(),
                  a.color,
                ),
              )
              .style('display', null)
              .style('visibility', null)
              .datum(
                (o = {
                  index: c,
                  x: u,
                  current: s,
                  width: r.property('offsetWidth'),
                  height: r.property('offsetHeight'),
                }),
              ),
            Q(i.tooltip_onshown, a.api, t),
            a._handleLinkedCharts(!0, c));
        }
        a.setTooltipPosition(n, e);
      }
    },
    bindTooltipResizePos: function () {
      var t = this,
        e = t.resizeFunction,
        a = t.state,
        i = t.$el.tooltip;
      e.add(function () {
        if (i.style('display') === 'block') {
          var r = a.current,
            n = i.datum(),
            o = n.width,
            s = n.xPosInPercent,
            l = (r.width / 100) * s,
            c = r.width - (l + o);
          (c < 0 && (l += c), i.style('left', ''.concat(l, 'px')));
        }
      });
    },
    hideTooltip: function (t) {
      var e,
        a = this,
        i = a.api,
        r = a.config,
        n = a.$el.tooltip;
      if (n && n.style('display') !== 'none' && (!r.tooltip_doNotHide || t)) {
        var o = JSON.parse((e = n.datum().current) !== null && e !== void 0 ? e : {});
        (Q(r.tooltip_onhide, i, o),
          n.style('display', 'none').datum(null),
          Q(r.tooltip_onhidden, i, o));
      }
    },
    _handleLinkedCharts: function (t, e) {
      var a = this,
        i = a.charts,
        r = a.config,
        n = a.state.event;
      if (n?.isTrusted && r.tooltip_linked && i.length > 1) {
        var o = r.tooltip_linked_name;
        i.filter(function (s) {
          return s !== a.api;
        }).forEach(function (s) {
          var l = s.internal,
            c = l.config,
            u = l.$el,
            d = c.tooltip_linked,
            f = c.tooltip_linked_name,
            v = te.body.contains(u.chart.node());
          if (d && o === f && v) {
            var g = u.tooltip.data()[0],
              h = e !== g?.index;
            try {
              s.tooltip[t && h ? 'show' : 'hide']({ index: e });
            } catch {}
          }
        });
      }
    },
    updateTooltipOnRedraw: function (t, e) {
      var a,
        i = this,
        r = i.config,
        n = i.$el,
        o = n.eventRect,
        s = n.svg,
        l = n.tooltip,
        c = i.state,
        u = c.event,
        d = c.hasAxis,
        f = c.hasRadar,
        v = c.hasTreemap;
      if (l?.style('display') === 'block' && u) {
        var g = t ?? ((a = f ? s : o) === null || a === void 0 ? void 0 : a.node());
        if (d || f)
          if (i.isMultipleX()) i.selectRectForMultipleXs(g, !1);
          else {
            var h = e ?? i.getDataIndexFromEvent(u);
            e === -1
              ? i.api.tooltip.hide()
              : (i.selectRectForSingle(g, h), i.setExpand(h, null, !0));
          }
        else {
          var p = u.clientX,
            x = u.clientY;
          setTimeout(function () {
            var _ = [p, x].every(Number.isFinite) && te.elementFromPoint(p, x),
              m = _ && L(_).datum();
            if (m) {
              var y = i.hasArcType() ? i.convertToArcData(i.updateAngle(m)) : m?.data;
              (v && (_ = s.node()), y && i.showTooltip([y], _));
            } else i.api.tooltip.hide();
          }, r.transition_duration);
        }
      }
    },
  },
  En = {
    getTranslate: function (t, e) {
      var a;
      e === void 0 && (e = 0);
      var i = this,
        r = i.config,
        n = i.state,
        o = r.axis_rotated,
        s = 0,
        l,
        c;
      if ((e && /^(x|y2?)$/.test(t) && (s = i.getAxisSize(t) * e), t === 'main'))
        ((l = ht(n.margin.left)), (c = ht(n.margin.top)));
      else if (t === 'context') ((l = ht(n.margin2.left)), (c = ht(n.margin2.top)));
      else if (t === 'legend') ((l = n.margin3.left), (c = n.margin3.top));
      else if (t === 'x') ((l = o ? -s : 0), (c = o ? 0 : n.height + s));
      else if (t === 'y') ((l = o ? 0 : -s), (c = o ? n.height + s : 0));
      else if (t === 'y2') ((l = o ? 0 : n.width + s), (c = o ? -s - 1 : 0));
      else if (t === 'subX') ((l = 0), (c = o ? 0 : n.height2));
      else if (t === 'arc')
        ((l = n.arcWidth / 2),
          (c = n.arcHeight / 2),
          !((a = r.arc_rangeText_values) === null || a === void 0) &&
            a.length &&
            (c += 5 + (i.hasType('gauge') && r.title_text ? 10 : 0)));
      else if (t === 'polar') ((l = n.arcWidth / 2), (c = n.arcHeight / 2));
      else if (t === 'radar') {
        var u = i.getRadarSize(),
          d = u[0],
          f = u[1];
        ((l = n.width / 2 - d), (c = n.height / 2 - f));
      }
      return 'translate('.concat(l, ', ').concat(c, ')');
    },
    transformMain: function (t, e) {
      var a = this,
        i = a.$el.main,
        r = a.$T,
        n = e?.axisX ? e.axisX : r(i.select('.'.concat(ue.axisX)), t),
        o = e?.axisY ? e.axisY : r(i.select('.'.concat(ue.axisY)), t),
        s = e?.axisY2 ? e.axisY2 : r(i.select('.'.concat(ue.axisY2)), t);
      (r(i, t).attr('transform', a.getTranslate('main')),
        n.attr('transform', a.getTranslate('x')),
        o.attr('transform', a.getTranslate('y')),
        s.attr('transform', a.getTranslate('y2')),
        i.select('.'.concat(V.chartArcs)).attr('transform', a.getTranslate('arc')));
    },
    transformAll: function (t, e) {
      var a = this,
        i = a.config,
        r = a.state,
        n = r.hasAxis,
        o = r.hasFunnel,
        s = r.hasTreemap,
        l = a.$el;
      (!o && !s && a.transformMain(t, e),
        n && i.subchart_show && a.transformContext(t, e),
        l.legend && a.transformLegend(t));
    },
  },
  kn = {
    isValidChartType: function (t) {
      return !!(t && Object.values(E).indexOf(t) > -1);
    },
    setTargetType: function (t, e) {
      var a = this,
        i = a.config,
        r = a.state.withoutFadeIn;
      (a.mapToTargetIds(t).forEach(function (n) {
        ((r[n] = e === i.data_types[n]), (i.data_types[n] = e));
      }),
        t || (i.data_type = e));
    },
    updateTypesElements: function () {
      var t = this,
        e = t.state.current;
      (Object.keys(E).forEach(function (a) {
        var i = E[a],
          r = t.hasType(i, null, !0),
          n = e.types.indexOf(i);
        n === -1 && r ? e.types.push(i) : n > -1 && !r && e.types.splice(n, 1);
      }),
        t.setChartElements());
    },
    hasType: function (t, e, a) {
      var i;
      a === void 0 && (a = !1);
      var r = this,
        n = r.config,
        o = r.state.current,
        s = n.data_types,
        l = e || r.data.targets,
        c = !1;
      return (
        !a && ((i = o.types) === null || i === void 0 ? void 0 : i.indexOf(t)) > -1
          ? (c = !0)
          : l?.length
            ? l.forEach(function (u) {
                var d = s[u.id];
                (d === t || (!d && t === 'line')) && (c = !0);
              })
            : Object.keys(s).length
              ? Object.keys(s).forEach(function (u) {
                  s[u] === t && (c = !0);
                })
              : (c = n.data_type === t),
        c
      );
    },
    hasTypeOf: function (t, e, a) {
      var i = this;
      return (
        a === void 0 && (a = []),
        t in ze
          ? !ze[t]
              .filter(function (r) {
                return a.indexOf(r) === -1;
              })
              .every(function (r) {
                return !i.hasType(r, e);
              })
          : !1
      );
    },
    isTypeOf: function (t, e) {
      var a,
        i = H(t) ? t : t.id,
        r =
          this.config &&
          (((a = this.config.data_types) === null || a === void 0 ? void 0 : a[i]) ||
            this.config.data_type);
      return j(e) ? e.indexOf(r) >= 0 : r === e;
    },
    hasPointType: function () {
      var t = this;
      return t.hasTypeOf('Line') || t.hasType('bubble') || t.hasType('scatter');
    },
    hasArcType: function (t, e) {
      return this.hasTypeOf('Arc', t, e);
    },
    hasMultiArcGauge: function () {
      return this.hasType('gauge') && this.config.gauge_type === 'multi';
    },
    isLineType: function (t) {
      var e = H(t) ? t : t.id;
      return !this.config.data_types[e] || this.isTypeOf(e, ze.Line);
    },
    isStepType: function (t) {
      return this.isTypeOf(t, ze.Step);
    },
    isSplineType: function (t) {
      return this.isTypeOf(t, ze.Spline);
    },
    isAreaType: function (t) {
      return this.isTypeOf(t, ze.Area);
    },
    isAreaRangeType: function (t) {
      return this.isTypeOf(t, ze.AreaRange);
    },
    isBarType: function (t) {
      return this.isTypeOf(t, 'bar');
    },
    isBubbleType: function (t) {
      return this.isTypeOf(t, 'bubble');
    },
    isCandlestickType: function (t) {
      return this.isTypeOf(t, 'candlestick');
    },
    isScatterType: function (t) {
      return this.isTypeOf(t, 'scatter');
    },
    isTreemapType: function (t) {
      return this.isTypeOf(t, 'treemap');
    },
    isPieType: function (t) {
      return this.isTypeOf(t, 'pie');
    },
    isFunnelType: function (t) {
      return this.isTypeOf(t, 'funnel');
    },
    isGaugeType: function (t) {
      return this.isTypeOf(t, 'gauge');
    },
    isDonutType: function (t) {
      return this.isTypeOf(t, 'donut');
    },
    isPolarType: function (t) {
      return this.isTypeOf(t, 'polar');
    },
    isRadarType: function (t) {
      return this.isTypeOf(t, 'radar');
    },
    isArcType: function (t) {
      return (
        this.isPieType(t) ||
        this.isDonutType(t) ||
        this.isGaugeType(t) ||
        this.isPolarType(t) ||
        this.isRadarType(t)
      );
    },
    isCirclePoint: function (t) {
      var e = this.config,
        a = e.point_pattern,
        i = !1;
      return (
        t?.tagName === 'circle'
          ? (i = !0)
          : (i = e.point_type === 'circle' && (!a || (j(a) && a.length === 0))),
        i
      );
    },
    lineData: function (t) {
      return this.isLineType(t) ? [t] : [];
    },
    arcData: function (t) {
      return this.isArcType(t.data) ? [t] : [];
    },
    labelishData: function (t) {
      return this.isBarType(t) ||
        this.isLineType(t) ||
        this.isScatterType(t) ||
        this.isBubbleType(t) ||
        this.isCandlestickType(t) ||
        this.isFunnelType(t) ||
        this.isRadarType(t) ||
        this.isTreemapType(t)
        ? t.values.filter(function (e) {
            return P(e.value) || !!e.value;
          })
        : [];
    },
    barLineBubbleData: function (t) {
      return this.isBarType(t) || this.isLineType(t) || this.isBubbleType(t) ? t.values : [];
    },
    isInterpolationType: function (t) {
      return (
        [
          'basis',
          'basis-closed',
          'basis-open',
          'bundle',
          'cardinal',
          'cardinal-closed',
          'cardinal-open',
          'catmull-rom',
          'catmull-rom-closed',
          'catmull-rom-open',
          'linear',
          'linear-closed',
          'monotone-x',
          'monotone-y',
          'natural',
        ].indexOf(t) >= 0
      );
    },
  };
function In(t) {
  var e = this,
    a;
  return (
    e.isLineType(t)
      ? (a = e.generateGetLinePoints(e.getShapeIndices(e.isLineType)))
      : e.isBarType(t) && (a = e.generateGetBarPoints(e.getShapeIndices(e.isBarType))),
    a
  );
}
var On = {
    getDrawShape: function () {
      var t = this,
        e = t.config.axis_rotated,
        a = t.state,
        i = a.hasRadar,
        r = a.hasTreemap,
        n = { type: {}, indices: {}, pos: {} };
      if (
        (!r &&
          ['bar', 'candlestick', 'line', 'area'].forEach(function (l) {
            var c = pe(/^(bubble|scatter)$/.test(l) ? 'line' : l);
            if (
              t.hasType(l) ||
              t.hasTypeOf(c) ||
              (l === 'line' && (t.hasType('bubble') || t.hasType('scatter')))
            ) {
              var u = t.getShapeIndices(t['is'.concat(c, 'Type')]),
                d = t['generateDraw'.concat(c)];
              ((n.indices[l] = u), (n.type[l] = d ? d.bind(t)(u, !1) : void 0));
            }
          }),
        !t.hasArcType() || i || r)
      ) {
        var o = void 0,
          s = void 0;
        (r ||
          ((o = i ? t.radarCircleX : e ? t.circleY : t.circleX),
          (s = i ? t.radarCircleY : e ? t.circleX : t.circleY)),
          (n.pos = {
            xForText: t.generateXYForText(n.indices, !0),
            yForText: t.generateXYForText(n.indices, !1),
            cx: (o || function () {}).bind(t),
            cy: (s || function () {}).bind(t),
          }));
      }
      return n;
    },
    getShapeIndices: function (t) {
      var e = this,
        a = e.config,
        i = a.data_xs,
        r = le(i),
        n = {},
        o = r ? {} : 0;
      return (
        r &&
          Xt(
            Object.keys(i).map(function (s) {
              return i[s];
            }),
          ).forEach(function (s) {
            ((o[s] = 0), (n[s] = {}));
          }),
        e.filterTargetsToShow(e.data.targets.filter(t, e)).forEach(function (s) {
          for (
            var l, c = (s.id in i) ? i[s.id] : '', u = c ? n[c] : n, d = 0, f = void 0;
            (f = a.data_groups[d]);
            d++
          )
            if (!(f.indexOf(s.id) < 0))
              for (var v = 0, g = void 0; (g = f[v]); v++) {
                if (g in u) {
                  u[s.id] = u[g];
                  break;
                }
                s.id !== g && c && (u[g] = (l = u[s.id]) !== null && l !== void 0 ? l : o[c]);
              }
          se(u[s.id]) && ((u[s.id] = c ? o[c]++ : o++), (u.__max__ = (c ? o[c] : o) - 1));
        }),
        n
      );
    },
    getIndices: function (t, e, a) {
      var i = this,
        r = i.config,
        n = r.data_xs,
        o = r.bar_indices_removeNull,
        s = e.id,
        l = e.index;
      if (i.isBarType(s) && o) {
        var c = {};
        return (
          i.getAllValuesOnIndex(l, !0).forEach(function (u, d) {
            ((c[u.id] = d), (c.__max__ = d));
          }),
          c
        );
      }
      return le(n) ? t[n[s]] : t;
    },
    getIndicesMax: function (t) {
      return le(this.config.data_xs)
        ? Object.keys(t)
            .map(function (e) {
              return t[e].__max__ || 0;
            })
            .reduce(function (e, a) {
              return e + a;
            })
        : t.__max__;
    },
    getShapeX: function (t, e, a) {
      var i = this,
        r = i.config,
        n = i.scale,
        o = a ? n.subX : n.zoom || n.x,
        s = r.bar_overlap,
        l = r.bar_padding,
        c = function (d, f) {
          return d + f;
        },
        u = ye(t) && (t._$total.length ? t._$total.reduce(c) / 2 : 0);
      return function (d) {
        var f = i.getIndices(e, d, 'getShapeX'),
          v = d.id in f ? f[d.id] : 0,
          g = (f.__max__ || 0) + 1,
          h = 0;
        if (le(d.x)) {
          var p = o(d.x, !0);
          if (u) {
            var x = t[d.id] || t._$width;
            h = s ? p - x / 2 : p - x + t._$total.slice(0, v + 1).reduce(c) - u;
          } else h = p - (P(t) ? t : t._$width) * (g / 2 - (s ? 1 : v));
        }
        return (
          t &&
            h &&
            g > 1 &&
            l &&
            (v && (h += l * v), g > 2 ? (h -= ((g - 1) * l) / 2) : g === 2 && (h -= l / 2)),
          h
        );
      };
    },
    getShapeY: function (t) {
      var e = this,
        a = e.isStackNormalized();
      return function (i) {
        var r = i.value;
        return (
          P(i)
            ? (r = i)
            : e.isAreaRangeType(i)
              ? (r = e.getBaseValue(i, 'mid'))
              : a
                ? (r = e.getRatio('index', i, !0))
                : e.isBubbleZType(i)
                  ? (r = e.getBubbleZData(i.value, 'y'))
                  : e.isBarRangeType(i) && (r = r[1]),
          e.getYScaleById(i.id, t)(r)
        );
      };
    },
    getShapeYMin: function (t) {
      var e = this,
        a = e.axis.getId(t),
        i = e.scale[a],
        r = i.domain()[0],
        n = e.config['axis_'.concat(a, '_inverted')];
      return !e.isGrouped(t) && !n && r > 0 ? r : 0;
    },
    getShapeOffsetData: function (t) {
      var e = this,
        a = e.orderTargets(e.filterTargetsToShow(e.data.targets.filter(t, e))),
        i = a
          .map(function (u) {
            return u.id;
          })
          .join('_'),
        r = ''.concat(re.shapeOffset, '_').concat(i),
        n = e.cache.get(r);
      if (n) return n;
      var o = e.isStackNormalized(),
        s = a.map(function (u) {
          var d = u.values,
            f = {};
          e.isStepType(u) && (d = e.convertValuesToStep(d));
          var v = d.reduce(function (g, h) {
            var p = Number(h.x);
            return ((g[p] = h), (f[p] = o ? e.getRatio('index', h, !0) : h.value), g);
          }, {});
          return { id: u.id, rowValues: d, rowValueMapByXValue: v, values: f };
        }),
        l = a.reduce(function (u, d, f) {
          var v = d.id;
          return ((u[v] = f), u);
        }, {}),
        c = { indexMapByTargetId: l, shapeOffsetTargets: s };
      return (e.cache.add(r, c), c);
    },
    getShapeOffset: function (t, e, a) {
      var i = this,
        r = i.getShapeOffsetData(t),
        n = r.shapeOffsetTargets,
        o = r.indexMapByTargetId,
        s = i.config.data_groupsZeroAs;
      return function (l, c) {
        var u = l.id,
          d = l.value,
          f = l.x,
          v = i.getIndices(e, l),
          g = i.getYScaleById(u, a);
        if (i.isBarRangeType(l)) return g(d[0]);
        var h = Number(f),
          p = g(s === 'zero' ? 0 : i.getShapeYMin(u)),
          x = p;
        return (
          n
            .filter(function (_) {
              return _.id !== u && v[_.id] === v[u];
            })
            .forEach(function (_) {
              var m = _.id,
                y = _.rowValueMapByXValue,
                T = _.rowValues,
                b = _.values;
              if (o[m] < o[u]) {
                var $ = b[h],
                  w = T[c];
                if (((!w || Number(w.x) !== h) && (w = y[h]), w?.value * d >= 0 && P($))) {
                  var A = d === 0 ? (s === 'positive' && $ > 0) || (s === 'negative' && $ < 0) : !0;
                  A && (x += g($) - p);
                }
              }
            }),
          x
        );
      };
    },
    circleY: function (t, e) {
      var a = this,
        i = t.id,
        r;
      return (
        a.isGrouped(i) && (r = In.bind(a)(t)),
        r ? r(t, e)[0][1] : a.getYScaleById(i)(a.getBaseValue(t))
      );
    },
    getBarW: function (t, e, a) {
      var i,
        r,
        n,
        o,
        s,
        l = this,
        c = l.config,
        u = l.org,
        d = l.scale,
        f = l.state,
        v = l.getMaxDataCount(),
        g = t === 'bar' && ((i = c.data_groups) === null || i === void 0 ? void 0 : i.length),
        h = ''.concat(t, '_width'),
        p = (
          (n = (r = l.getZoomTransform) === null || r === void 0 ? void 0 : r.call(l)) !== null &&
          n !== void 0
            ? n
            : { k: 1 }
        ).k,
        x = [
          (o = c.axis_x_min) !== null && o !== void 0 ? o : u.xDomain[0],
          (s = c.axis_x_max) !== null && s !== void 0 ? s : u.xDomain[1],
        ].map(l.axis.isTimeSeries() ? Ae.bind(l) : Number),
        _ = e.tickInterval(v);
      if (d.zoom && !l.axis.isCategorized() && p > 1) {
        var m = x.every(function (b, $) {
          return b === u.xDomain[$];
        });
        _ =
          u.xDomain
            .map(function (b, $) {
              var w = m ? b : b - Math.abs(x[$]);
              return d.zoom(w);
            })
            .reduce(function (b, $) {
              return Math.abs(b) + $;
            }) / v;
      }
      var y = function (b) {
          var $ = b ? c[h][b] : c[h],
            w = b ? $.ratio : c[''.concat(h, '_ratio')],
            A = b ? $.max : c[''.concat(h, '_max')],
            R = P($) ? $ : I($) ? $.call(l, f.width, a, v) : a ? (_ * w) / a : 0;
          return A && R > A ? A : R;
        },
        T = y();
      return (
        !g &&
          ye(c[h]) &&
          ((T = { _$width: T, _$total: [] }),
          l.filterTargetsToShow(l.data.targets).forEach(function (b) {
            c[h][b.id] && ((T[b.id] = y(b.id)), T._$total.push(T[b.id] || T._$width));
          })),
        T
      );
    },
    getShapeByIndex: function (t, e, a) {
      var i = this,
        r = i.$el,
        n = N(e) ? '-'.concat(e) : '',
        o = r[t];
      return (
        o && !o.empty()
          ? (o = o
              .filter(function (s) {
                return a ? s.id === a : !0;
              })
              .filter(function (s) {
                return N(e) ? s.index === e : !0;
              }))
          : (o = (
              a
                ? r.main.selectAll(
                    '.'.concat(U[''.concat(t, 's')]).concat(i.getTargetSelectorSuffix(a)),
                  )
                : r.main
            ).selectAll('.'.concat(U[t]).concat(n))),
        o
      );
    },
    isWithinShape: function (t, e) {
      var a,
        i = this,
        r = L(t),
        n;
      return (
        i.isTargetToShow(e.id)
          ? !((a = i.hasValidPointType) === null || a === void 0) && a.call(i, t.nodeName)
            ? (n = i.isStepType(e)
                ? i.isWithinStep(t, i.getYScaleById(e.id)(i.getBaseValue(e)))
                : i.isWithinCircle(t, i.isBubbleType(e) ? i.pointSelectR(e) * 1.5 : 0))
            : t.nodeName === 'path' && (n = r.classed(U.bar) ? i.isWithinBar(t) : !0)
          : (n = !1),
        n
      );
    },
    getInterpolate: function (t) {
      var e = this,
        a = e.getInterpolateType(t);
      return {
        basis: zi,
        'basis-closed': Di,
        'basis-open': Pi,
        bundle: Oi,
        cardinal: Ii,
        'cardinal-closed': ki,
        'cardinal-open': Ei,
        'catmull-rom': Li,
        'catmull-rom-closed': Ci,
        'catmull-rom-open': Si,
        'monotone-x': Ri,
        'monotone-y': wi,
        natural: Ai,
        'linear-closed': $i,
        linear: Ti,
        step: bi,
        'step-after': yi,
        'step-before': mi,
      }[a];
    },
    getInterpolateType: function (t) {
      var e = this,
        a = e.config,
        i = a.spline_interpolation_type,
        r = e.isInterpolationType(i) ? i : 'cardinal';
      return e.isSplineType(t) ? r : e.isStepType(t) ? a.line_step_type : 'linear';
    },
    isWithinBar: function (t) {
      var e = Te(this.state.event, t),
        a = Da(t),
        i = a[0],
        r = a[1],
        n = Math.min(i.x, r.x),
        o = Math.min(i.y, r.y),
        s = this.config.bar_sensitivity,
        l = Be(t, !0),
        c = l.width,
        u = l.height,
        d = n - s,
        f = n + c + s,
        v = o + u + s,
        g = o - s,
        h = d < e[0] && e[0] < f && g < e[1] && e[1] < v;
      return h;
    },
  },
  je = (function () {
    function t(e) {
      ((this.data = { xs: {}, targets: [] }),
        (this.scale = {
          x: null,
          y: null,
          y2: null,
          subX: null,
          subY: null,
          subY2: null,
          zoom: null,
        }),
        (this.org = { xScale: null, xDomain: null }),
        (this.format = {
          extraLineClasses: null,
          xAxisTick: null,
          dataTime: null,
          defaultAxisTime: null,
          axisTime: null,
        }));
      var a = this;
      ((a.api = e), (a.config = new Ue()), (a.cache = new Hr()));
      var i = new Yr();
      ((a.$el = i.getStore('element')), (a.state = i.getStore('state')), (a.$T = a.$T.bind(a)));
    }
    return (
      (t.prototype.$T = function (e, a, i) {
        var r = this,
          n = r.config,
          o = r.state,
          s = n.transition_duration,
          l = n.subchart_show,
          c = e;
        if (c) {
          'tagName' in c && (c = L(c));
          var u =
            ((a !== !1 && s) || a) && (!o.zooming || o.dragging) && !o.resizing && o.rendered && !l;
          c = u ? c.transition(i).duration(s) : c;
        }
        return c;
      }),
      (t.prototype.beforeInit = function () {
        var e = this;
        (e.callPluginHook('$beforeInit'), Q(e.config.onbeforeinit, e.api));
      }),
      (t.prototype.afterInit = function () {
        var e = this;
        (e.callPluginHook('$afterInit'), Q(e.config.onafterinit, e.api));
      }),
      (t.prototype.init = function () {
        var e = this,
          a = e.config,
          i = e.state,
          r = e.$el,
          n = a.boost_useCssRule,
          o = a.bindto;
        Wr(e);
        var s = e.hasArcType();
        if (
          ((i.hasRadar = !i.hasAxis && e.hasType('radar')),
          (i.hasFunnel = !i.hasAxis && e.hasType('funnel')),
          (i.hasTreemap = !i.hasAxis && e.hasType('treemap')),
          (i.hasAxis = !s && !i.hasFunnel && !i.hasTreemap),
          (i.datetimeId = 'bb-'.concat(+new Date() * Ce())),
          n)
        ) {
          var l = te.createElement('style');
          ((l.type = 'text/css'),
            te.head.appendChild(l),
            (i.style = { rootSelctor: '.'.concat(i.datetimeId), sheet: l.sheet }),
            (r.style = l));
        }
        var c = { element: o, classname: 'bb' };
        (W(o) && ((c.element = o.element || '#chart'), (c.classname = o.classname || c.classname)),
          (r.chart = I(c.element.node) ? o.element : L(c.element || [])),
          r.chart.empty() && (r.chart = L(te.body.appendChild(te.createElement('div')))),
          r.chart
            .html('')
            .classed(c.classname, !0)
            .classed(i.datetimeId, n)
            .style('position', 'relative'),
          e.initParams(),
          e.initToRender());
      }),
      (t.prototype.initToRender = function (e) {
        var a = this,
          i = a.config,
          r = a.state,
          n = a.$el.chart,
          o = function () {
            return Br(n, { display: 'none', visibility: 'hidden' });
          },
          s = i.render.lazy === !1 ? !1 : i.render.lazy || o(),
          l = X.MutationObserver;
        (s &&
          l &&
          i.render.observe !== !1 &&
          !e &&
          new l(function (c, u) {
            o() || (u.disconnect(), !r.rendered && a.initToRender(!0));
          }).observe(n.node(), { attributes: !0, attributeFilter: ['class', 'style'] }),
          (!s || e) &&
            a.convertData(i, function (c) {
              (a.initWithData(c), a.afterInit());
            }));
      }),
      (t.prototype.initParams = function () {
        var e,
          a = this,
          i = a.config,
          r = a.format,
          n = a.state;
        if (
          ((a.color = a.generateColor()),
          (a.levelColor = a.generateLevelColor()),
          i.padding === !1 &&
            ((i.axis_x_show = !1),
            (i.axis_y_show = !1),
            (i.axis_y2_show = !1),
            (i.subchart_show = !1)),
          (a.hasPointType() ||
            (!((e = a.hasLegendDefsPoint) === null || e === void 0) && e.call(a))) &&
            (a.point = a.generatePoint()),
          n.hasAxis)
        ) {
          (a.initClip(),
            (r.extraLineClasses = a.generateExtraLineClass()),
            (r.dataTime = i.data_xLocaltime ? fi : vi),
            (r.axisTime = i.axis_x_localtime ? gi : hi));
          var o = i.zoom_enabled && i.zoom_type === 'drag';
          r.defaultAxisTime = function (u) {
            var d = a.scale,
              f = d.x,
              v = d.zoom,
              g = o ? v : v && f.orgDomain().toString() !== v.domain().toString(),
              h =
                (u.getMilliseconds() && '.%L') ||
                (u.getSeconds() && '.:%S') ||
                (u.getMinutes() && '%I:%M') ||
                (u.getHours() && '%I %p') ||
                (u.getDate() !== 1 && '%b %d') ||
                (g && u.getDate() === 1 && "%b'%y") ||
                (u.getMonth() && '%-m/%-d') ||
                '%Y';
            return r.axisTime(h)(u);
          };
        }
        var s = i.legend_position,
          l = i.legend_inset_anchor,
          c = i.axis_rotated;
        ((n.isLegendRight = s === 'right'),
          (n.isLegendInset = s === 'inset'),
          (n.isLegendTop = l === 'top-left' || l === 'top-right'),
          (n.isLegendLeft = l === 'top-left' || l === 'bottom-left'),
          (n.rotatedPadding.top = a.getResettedPadding(n.rotatedPadding.top)),
          (n.rotatedPadding.right = c && !i.axis_x_show ? 0 : 30),
          (n.inputType = Xr(i.interaction_inputType_mouse, i.interaction_inputType_touch)));
      }),
      (t.prototype.initWithData = function (e) {
        var a,
          i,
          r,
          n = this,
          o = n.config,
          s = n.scale,
          l = n.state,
          c = n.$el,
          u = n.org,
          d = l.hasAxis,
          f = l.hasFunnel,
          v = l.hasTreemap,
          g = o.interaction_enabled,
          h = n.hasType('polar'),
          p = o.data_labels_backgroundColors;
        if (
          (d && ((n.axis = n.getAxisInstance()), o.zoom_enabled && n.initZoom()),
          (n.data.xs = {}),
          (n.data.targets = n.convertDataToTargets(e)),
          o.data_filter && (n.data.targets = n.data.targets.filter(o.data_filter.bind(n.api))),
          o.data_hide &&
            n.addHiddenTargetIds(o.data_hide === !0 ? n.mapToIds(n.data.targets) : o.data_hide),
          o.legend_hide &&
            n.addHiddenLegendIds(o.legend_hide === !0 ? n.mapToIds(n.data.targets) : o.legend_hide),
          n.updateSizes(),
          n.updateScales(!0),
          d)
        ) {
          var x = s.x,
            _ = s.y,
            m = s.y2,
            y = s.subX,
            T = s.subY,
            b = s.subY2;
          (x &&
            (x.domain(rt(n.getXDomain(n.data.targets), !o.axis_x_inverted)),
            y.domain(x.domain()),
            (u.xDomain = x.domain())),
            _ && (_.domain(n.getYDomain(n.data.targets, 'y')), T.domain(_.domain())),
            m && (m.domain(n.getYDomain(n.data.targets, 'y2')), b && b.domain(m.domain())));
        }
        if (
          ((c.svg = c.chart.append('svg').style('overflow', 'hidden').style('display', 'block')),
          g && l.inputType)
        ) {
          var $ = l.inputType === 'touch',
            w = o.onclick,
            A = o.onover,
            R = o.onout;
          c.svg
            .on('click', w?.bind(n.api) || null)
            .on(
              $ ? 'touchstart' : 'mouseenter',
              A?.bind(n.api) || null,
              $ ? { passive: !0 } : void 0,
            )
            .on($ ? 'touchend' : 'mouseleave', R?.bind(n.api) || null);
        }
        o.svg_classname && c.svg.attr('class', o.svg_classname);
        var C = I(o.color_tiles) && n.patterns;
        ((d ||
          C ||
          h ||
          v ||
          p ||
          (!((a = n.hasLegendDefsPoint) === null || a === void 0) && a.call(n))) &&
          ((c.defs = c.svg.append('defs')),
          d &&
            ['id', 'idXAxis', 'idYAxis', 'idGrid'].forEach(function (k) {
              n.appendClip(c.defs, l.clip[k]);
            }),
          n.generateTextBGColorFilter(p),
          C &&
            n.patterns.forEach(function (k) {
              return c.defs.append(function () {
                return k.node;
              });
            })),
          n.updateSvgSize(),
          n.bindResize());
        var S = c.svg
          .append('g')
          .classed(z.main, !0)
          .attr('transform', f || v ? null : n.getTranslate('main'));
        if (
          ((c.main = S),
          o.subchart_show && n.initSubchart(),
          o.tooltip_show && n.initTooltip(),
          o.title_text && n.initTitle(),
          !v && o.legend_show && n.initLegend(),
          o.data_empty_label_text &&
            S.append('text')
              .attr('class', ''.concat(ce.text, ' ').concat(z.empty))
              .attr('text-anchor', 'middle')
              .attr('dominant-baseline', 'middle'),
          d && (o.regions.length && n.initRegion(), !o.clipPath && n.axis.init()),
          S.append('g')
            .classed(z.chart, !0)
            .attr('clip-path', d ? l.clip.path : null),
          n.callPluginHook('$init'),
          n.initChartElements(),
          d &&
            (g && ((i = n.initEventRect) === null || i === void 0 || i.call(n)),
            n.initGrid(),
            o.clipPath && ((r = n.axis) === null || r === void 0 || r.init())),
          n.updateTargets(n.data.targets),
          n.updateDimension(),
          Q(o.oninit, n.api),
          n.setBackground(),
          n.redraw({
            withTransition: !1,
            withTransform: !0,
            withUpdateXDomain: !0,
            withUpdateOrgXDomain: !0,
            withTransitionForAxis: !1,
            initializing: !0,
          }),
          o.data_onmin || o.data_onmax)
        ) {
          var M = n.getMinMaxData();
          (Q(o.data_onmin, n.api, M.min), Q(o.data_onmax, n.api, M.max));
        }
        (o.tooltip_show && n.initShowTooltip(), (l.rendered = !0));
      }),
      (t.prototype.initChartElements = function () {
        var e = this,
          a = e.state,
          i = a.hasAxis,
          r = a.hasRadar,
          n = a.hasTreemap,
          o = [];
        if (i) {
          var s = ['bar', 'bubble', 'candlestick', 'line'];
          e.config.bar_front && s.push(s.shift());
          for (var l = 0, c = s; l < c.length; l++) {
            var u = c[l],
              d = pe(u);
            ((u === 'line' && e.hasTypeOf(d)) || e.hasType(u)) && o.push(d);
          }
        } else if (n) o.push('Treemap');
        else if (e.hasType('funnel')) o.push('Funnel');
        else {
          var f = e.hasType('polar'),
            v = e.hasType('gauge');
          (r || o.push('Arc', 'Pie'),
            v ? o.push('Gauge') : r ? o.push('Radar') : f && o.push('Polar'));
        }
        for (var g = 0, h = o; g < h.length; g++) {
          var p = h[g];
          e['init'.concat(p)]();
        }
        le(e.config.data_labels) && !e.hasArcType(null, ['radar']) && e.initText();
      }),
      (t.prototype.setChartElements = function () {
        var e = this,
          a = e.$el,
          i = a.chart,
          r = a.svg,
          n = a.defs,
          o = a.main,
          s = a.tooltip,
          l = a.legend,
          c = a.title,
          u = a.grid,
          d = a.needle,
          f = a.arcs,
          v = a.circle,
          g = a.bar,
          h = a.candlestick,
          p = a.line,
          x = a.area,
          _ = a.text;
        e.api.$ = {
          chart: i,
          svg: r,
          defs: n,
          main: o,
          tooltip: s,
          legend: l,
          title: c,
          grid: u,
          arc: f,
          circles: v,
          bar: { bars: g },
          candlestick: h,
          line: { lines: p, areas: x },
          needle: d,
          text: { texts: _ },
        };
      }),
      (t.prototype.setBackground = function () {
        var e = this,
          a = e.config.background,
          i = e.state,
          r = e.$el.svg;
        if (le(a)) {
          var n = r.select('g').insert(a.imgUrl ? 'image' : 'rect', ':first-child');
          (a.imgUrl
            ? n.attr('href', a.imgUrl)
            : a.color && n.style('fill', a.color).attr('clip-path', i.clip.path),
            n
              .attr('class', a.class || null)
              .attr('width', '100%')
              .attr('height', '100%'));
        }
      }),
      (t.prototype.updateTargets = function (e) {
        var a,
          i,
          r = this,
          n = r.state,
          o = n.hasAxis,
          s = n.hasFunnel,
          l = n.hasRadar,
          c = n.hasTreemap,
          u = function (_) {
            return r['updateTargetsFor'.concat(_)](e.filter(r['is'.concat(_, 'Type')].bind(r)));
          };
        if ((r.updateTargetsForText(e), o)) {
          for (var d = ['bar', 'candlestick', 'line'], f = 0, v = d; f < v.length; f++) {
            var g = v[f],
              h = pe(g);
            ((g === 'line' && r.hasTypeOf(h)) || r.hasType(g)) && u(h);
          }
          (a = r.updateTargetsForSubchart) === null || a === void 0 || a.call(r, e);
        } else if (r.hasArcType(e)) {
          var p = 'Arc';
          (l ? (p = 'Radar') : r.hasType('polar') && (p = 'Polar'), u(p));
        } else s ? u('Funnel') : c && u('Treemap');
        var x = r.hasType('bubble') || r.hasType('scatter');
        (x && ((i = r.updateTargetForCircle) === null || i === void 0 || i.call(r)),
          r.filterTargetsToShowAtInit(x));
      }),
      (t.prototype.filterTargetsToShowAtInit = function (e) {
        e === void 0 && (e = !1);
        var a = this,
          i = a.$el.svg,
          r = a.$T,
          n = '.'.concat(z.target);
        (e && (n += ', .'.concat(he.chartCircles, ' > .').concat(he.circles)),
          r(
            i.selectAll(n).filter(function (o) {
              return a.isTargetToShow(o.id);
            }),
          ).style('opacity', null));
      }),
      (t.prototype.getWithOption = function (e) {
        for (
          var a = {
              Dimension: !0,
              EventRect: !0,
              Legend: !1,
              Subchart: !0,
              Transform: !1,
              Transition: !0,
              TrimXDomain: !0,
              UpdateXAxis: 'UpdateXDomain',
              UpdateXDomain: !1,
              UpdateOrgXDomain: !1,
              TransitionForExit: 'Transition',
              TransitionForAxis: 'Transition',
              Y: !0,
            },
            i = 0,
            r = Object.entries(a);
          i < r.length;
          i++
        ) {
          var n = r[i],
            o = n[0],
            s = n[1],
            l = H(s) ? a[s] : s;
          a[o] = Me(e, 'with'.concat(o), l);
        }
        return a;
      }),
      (t.prototype.initialOpacity = function (e) {
        var a = this,
          i = a.state.withoutFadeIn;
        return a.getBaseValue(e) !== null && i[e.id] ? null : '0';
      }),
      (t.prototype.bindResize = function () {
        var e = this,
          a = e.$el,
          i = e.config,
          r = e.state,
          n = Kr(i.resize_timer),
          o = i.resize_auto,
          s = [];
        (s.push(function () {
          return Q(i.onresize, e.api);
        }),
          /^(true|parent)$/.test(o) &&
            s.push(function () {
              ((r.resizing = !0),
                i.legend_show && (e.updateSizes(), e.updateLegend()),
                e.api.flush(!1));
            }),
          s.push(function () {
            (Q(i.onresized, e.api), (r.resizing = !1));
          }),
          s.forEach(function (l) {
            return n.add(l);
          }),
          (e.resizeFunction = n),
          o === 'parent'
            ? (e.resizeFunction.resizeObserver = new ResizeObserver(
                e.resizeFunction.bind(e),
              )).observe(a.chart.node().parentNode)
            : X.addEventListener('resize', e.resizeFunction));
      }),
      (t.prototype.callPluginHook = function (e) {
        for (var a = this, i = [], r = 1; r < arguments.length; r++) i[r - 1] = arguments[r];
        this.config.plugins.forEach(function (n) {
          (e === '$beforeInit' && ((n.$$ = a), a.api.plugins.push(n)), n[e].apply(n, i));
        });
      }),
      t
    );
  })();
ve(je.prototype, [rn, nn, on, ln, cn, vn, gn, sn, hn, xn, _n, mn, On, yn, bn, Sn, Cn, Ln, En, kn]);
function Pn(t) {
  var e = this.config,
    a,
    i,
    r,
    n = function () {
      var o = i.shift();
      if (o && a && ye(a) && o in a) return ((a = a[o]), n());
      if (!o) return a;
    };
  (Object.keys(e).forEach(function (o) {
    ((a = t), (i = o.split('_')), (r = n()), q(r) && (e[o] = r));
  }),
    this.api && (this.state.orgConfig = t));
}
var Dn = {
    resize: function (t) {
      var e = this.internal,
        a = e.config,
        i = e.state;
      i.rendered &&
        ((a.size_width = t ? t.width : null),
        (a.size_height = t ? t.height : null),
        (i.resizing = !0),
        this.flush(!1),
        e.resizeFunction());
    },
    flush: function (t) {
      var e,
        a,
        i = this.internal,
        r = i.state,
        n = i.$el.zoomResetBtn;
      r.rendered
        ? (r.resizing
            ? (e = i.brush) === null || e === void 0 || e.updateResize()
            : (a = i.axis) === null || a === void 0 || a.setOrient(),
          n?.style('display', 'none'),
          i.scale.zoom && (r.current.zoomDomain = i.scale.zoom.domain()),
          (i.scale.zoom = null),
          t
            ? i.redraw({
                withTransform: !0,
                withUpdateXDomain: !0,
                withUpdateOrgXDomain: !0,
                withLegend: !0,
              })
            : i.updateAndRedraw({
                withLegend: !0,
                withTransition: !1,
                withTransitionForTransform: !1,
              }),
          !r.resizing && i.brush && (i.brush.getSelection().call(i.brush.move), i.unselectRect()),
          r.current.zoomDomain && (i.api.zoom(r.current.zoomDomain), (r.current.zoomDomain = null)))
        : i.initToRender(!0);
    },
    destroy: function () {
      var t = this,
        e,
        a = this.internal,
        i = a.$el,
        r = i.chart,
        n = i.style,
        o = i.svg;
      if (le(a)) {
        (a.callPluginHook('$willDestroy'),
          a.charts.splice(a.charts.indexOf(this), 1),
          a.unbindAllEvents(),
          o.select('*').interrupt(),
          a.resizeFunction.clear(),
          (e = a.resizeFunction.resizeObserver) === null || e === void 0 || e.disconnect(),
          X.removeEventListener('resize', a.resizeFunction),
          r.classed('bb', !1).style('position', null).selectChildren().remove(),
          n && n.parentNode.removeChild(n),
          Object.keys(this).forEach(function (l) {
            (l === 'internal' &&
              Object.keys(a).forEach(function (c) {
                a[c] = null;
              }),
              (t[l] = null),
              delete t[l]);
          }));
        for (var s in this) this[s] = function () {};
      }
      return null;
    },
    config: function (t, e, a) {
      var i = this.internal,
        r = i.config,
        n = i.state,
        o = t?.replace(/\./g, '_'),
        s;
      return (
        t && o in r
          ? q(e)
            ? ((r[o] = e), (s = e), a && this.flush())
            : (s = r[o])
          : (arguments.length === 0 || $e(t)) && (s = n.orgConfig),
        s
      );
    },
  },
  zn = {
    color: function (t) {
      return this.internal.color(t);
    },
  },
  Ka = function (t) {
    var e = this.internal.data.targets;
    if (!se(t)) {
      var a = j(t) ? t : [t];
      return e.filter(function (i) {
        return a.some(function (r) {
          return r === i.id;
        });
      });
    }
    return e;
  };
ve(Ka, {
  shown: function (t) {
    return this.internal.filterTargetsToShow(this.data(t));
  },
  values: function (t, e) {
    e === void 0 && (e = !0);
    var a = null;
    if (t) {
      var i = this.data(t);
      j(i) &&
        ((a = []),
        i.forEach(function (r) {
          var n = r.values.map(function (o) {
            return o.value;
          });
          e ? (a = a.concat(n)) : a.push(n);
        }));
    }
    return a;
  },
  names: function (t) {
    var e = this.internal;
    return e.updateDataAttributes('names', t);
  },
  colors: function (t) {
    return this.internal.updateDataAttributes('colors', t);
  },
  axes: function (t) {
    return this.internal.updateDataAttributes('axes', t);
  },
  min: function () {
    return this.internal.getMinMaxData().min;
  },
  max: function () {
    return this.internal.getMinMaxData().max;
  },
});
var Fn = { data: Ka },
  Mn = function (t) {
    var e;
    return (e = X.btoa) === null || e === void 0
      ? void 0
      : e.call(
          X,
          encodeURIComponent(t).replace(/%([0-9A-F]{2})/g, function (a, i) {
            return String.fromCharCode(Number('0x'.concat(i)));
          }),
        );
  };
function Bn(t, e, a) {
  var i = e || a,
    r = i.width,
    n = i.height,
    o = new XMLSerializer(),
    s = t.cloneNode(!0),
    l = Fr(He(te.styleSheets))
      .filter(function (v) {
        return v.cssText;
      })
      .map(function (v) {
        return v.cssText;
      });
  (s.setAttribute('xmlns', mt.xhtml),
    (s.style.margin = '0'),
    (s.style.padding = '0'),
    e.preserveFontStyle &&
      s.querySelectorAll('text').forEach(function (v) {
        v.innerHTML = '';
      }));
  var c = o.serializeToString(s),
    u = te.createElement('style');
  u.appendChild(
    te.createTextNode(
      l.join(`
`),
    ),
  );
  var d = o.serializeToString(u),
    f = '<svg xmlns="'
      .concat(mt.svg, '" width="')
      .concat(r, '" height="')
      .concat(
        n,
        `" 
		viewBox="0 0 `,
      )
      .concat(a.width, ' ')
      .concat(
        a.height,
        `" 
		preserveAspectRatio="`,
      )
      .concat(
        e?.preserveAspectRatio === !1 ? 'none' : 'xMinYMid meet',
        `">
			<foreignObject width="100%" height="100%">
				`,
      )
      .concat(
        d,
        `
				`,
      )
      .concat(
        c.replace(/(url\()[^#]+/g, '$1'),
        `
			</foreignObject></svg>`,
      );
  return 'data:image/svg+xml;base64,'.concat(Mn(f));
}
function Xn(t, e) {
  var a = e.top,
    i = e.left,
    r = Be(t, !0),
    n = r.x,
    o = r.y,
    s = t.getScreenCTM(),
    l = s.a,
    c = s.b,
    u = s.c,
    d = s.d,
    f = s.e,
    v = s.f,
    g = fe(t, !0),
    h = g.width,
    p = g.height;
  return {
    x: l * n + u * o + f - i,
    y: c * n + d * o + v - a + (p - Math.round(p / 4)),
    width: h,
    height: p,
  };
}
function Nn(t) {
  var e = fe(t),
    a = e.left,
    i = e.top,
    r = function (o) {
      return o.textContent || o.childElementCount;
    },
    n = [];
  return (
    He(t.querySelectorAll('text'))
      .filter(r)
      .forEach(function (o) {
        var s = function (c) {
          var u,
            d = X.getComputedStyle(c),
            f = d.fill,
            v = d.fontFamily,
            g = d.fontSize,
            h = d.textAnchor,
            p = d.transform,
            x = Xn(c, { left: a, top: i }),
            _ = x.x,
            m = x.y,
            y = x.width,
            T = x.height;
          return (
            (u = {}),
            (u[c.textContent] = {
              x: _,
              y: m,
              width: y,
              height: T,
              fill: f,
              fontFamily: v,
              fontSize: g,
              textAnchor: h,
              transform: p,
            }),
            u
          );
        };
        if (o.childElementCount > 1) {
          var l = [];
          return (
            He(o.querySelectorAll('tspan'))
              .filter(r)
              .forEach(function (c) {
                n.push(s(c));
              }),
            l
          );
        } else n.push(s(o));
      }),
    n
  );
}
function Gn(t, e) {
  e.forEach(function (a) {
    Object.keys(a).forEach(function (i) {
      var r = a[i],
        n = r.x,
        o = r.y,
        s = r.width,
        l = r.height,
        c = r.fill,
        u = r.fontFamily,
        d = r.fontSize,
        f = r.transform;
      if ((t.save(), (t.font = ''.concat(d, ' ').concat(u)), (t.fillStyle = c), f === 'none'))
        t.fillText(i, n, o);
      else {
        var v = f.replace(/(matrix|\(|\))/g, '').split(',');
        (v.splice(4).every(function (g) {
          return +g == 0;
        })
          ? (v.push(n + s - s / 4), v.push(o - l + l / 3))
          : (v.push(n), v.push(o)),
          t.transform.apply(t, v),
          t.fillText(i, 0, 0));
      }
      t.restore();
    });
  });
}
var Vn = {
    export: function (t, e) {
      var a = this,
        i = this.internal,
        r = i.state,
        n = i.$el,
        o = n.chart,
        s = n.svg,
        l = r.current,
        c = l.width,
        u = l.height,
        d = it(
          Object.create(null),
          {
            width: c,
            height: u,
            preserveAspectRatio: !0,
            preserveFontStyle: !1,
            mimeType: 'image/png',
          },
          t,
        ),
        f = Bn(o.node(), d, { width: c, height: u }),
        v = d.preserveFontStyle ? Nn(s.node()) : [];
      if (e && I(e)) {
        var g = new Image();
        ((g.crossOrigin = 'Anonymous'),
          (g.onload = function () {
            var h = te.createElement('canvas'),
              p = h.getContext('2d');
            ((h.width = d.width || c),
              (h.height = d.height || u),
              p.drawImage(g, 0, 0),
              v.length && (Gn(p, v), (v.length = 0)),
              e.bind(a)(h.toDataURL(d.mimeType)));
          }),
          (g.src = f));
      }
      return f;
    },
  },
  Yn = {
    focus: function (t) {
      var e = this.internal,
        a = e.state,
        i = e.mapToTargetIds(t),
        r = e.$el.svg.selectAll(e.selectorTargets(i.filter(e.isTargetToShow, e)));
      (this.revert(),
        this.defocus(),
        r.classed(J.focused, !0).classed(J.defocused, !1),
        e.hasArcType() &&
          !a.hasRadar &&
          (e.expandArc(i), e.hasType('gauge') && e.markOverlapped(t, e, '.'.concat(me.gaugeValue))),
        e.toggleFocusLegend(i, !0),
        (a.focusedTargetIds = i),
        (a.defocusedTargetIds = a.defocusedTargetIds.filter(function (n) {
          return i.indexOf(n) < 0;
        })));
    },
    defocus: function (t) {
      var e = this.internal,
        a = e.state,
        i = e.mapToTargetIds(t),
        r = e.$el.svg.selectAll(e.selectorTargets(i.filter(e.isTargetToShow, e)));
      (r.classed(J.focused, !1).classed(J.defocused, !0),
        e.hasArcType(null, ['polar']) &&
          (e.unexpandArc(i),
          e.hasType('gauge') && e.undoMarkOverlapped(e, '.'.concat(me.gaugeValue))),
        e.toggleFocusLegend(i, !1),
        (a.focusedTargetIds = a.focusedTargetIds.filter(function (n) {
          return i.indexOf(n) < 0;
        })),
        (a.defocusedTargetIds = i));
    },
    revert: function (t) {
      var e = this.internal,
        a = e.config,
        i = e.state,
        r = e.$el,
        n = e.mapToTargetIds(t),
        o = r.svg.selectAll(e.selectorTargets(n));
      (o.classed(J.focused, !1).classed(J.defocused, !1),
        e.hasArcType(null, ['polar']) && e.unexpandArc(n),
        a.legend_show &&
          (e.showLegend(n.filter(e.isLegendToShow.bind(e))),
          r.legend
            .selectAll(e.selectorLegends(n))
            .filter(function () {
              return L(this).classed(J.legendItemFocused);
            })
            .classed(J.legendItemFocused, !1)),
        (i.focusedTargetIds = []),
        (i.defocusedTargetIds = []));
    },
  },
  Hn = {
    show: function (t) {
      var e = this.internal;
      (e.showLegend(e.mapToTargetIds(t)), e.updateAndRedraw({ withLegend: !0 }));
    },
    hide: function (t) {
      var e = this.internal;
      (e.hideLegend(e.mapToTargetIds(t)), e.updateAndRedraw({ withLegend: !0 }));
    },
  },
  Wn = { legend: Hn },
  Un = {
    load: function (t) {
      var e = this.internal,
        a = e.config;
      (t.xs && e.addXs(t.xs),
        'names' in t && this.data.names(t.names),
        'classes' in t &&
          Object.keys(t.classes).forEach(function (i) {
            a.data_classes[i] = t.classes[i];
          }),
        'categories' in t && e.axis.isCategorized() && (a.axis_x_categories = t.categories),
        'axes' in t &&
          Object.keys(t.axes).forEach(function (i) {
            a.data_axes[i] = t.axes[i];
          }),
        'colors' in t &&
          Object.keys(t.colors).forEach(function (i) {
            a.data_colors[i] = t.colors[i];
          }),
        'unload' in t && t.unload !== !1
          ? e.unload(e.mapToTargetIds(t.unload === !0 ? null : t.unload), function () {
              ka(function () {
                return e.loadFromArgs(t);
              });
            })
          : e.loadFromArgs(t));
    },
    unload: function (t) {
      var e = this.internal,
        a = t || {};
      ($e(a) && this.tooltip.hide(), j(a) ? (a = { ids: a }) : H(a) && (a = { ids: [a] }));
      var i = e.mapToTargetIds(a.ids);
      e.unload(i, function () {
        (e.redraw({ withUpdateOrgXDomain: !0, withUpdateXDomain: !0, withLegend: !0 }),
          e.cache.remove(i),
          Ua.call(e, a.done, a.resizeAfter));
      });
    },
  };
function ca(t, e, a) {
  var i = this,
    r = this.internal,
    n = r.mapToTargetIds(e),
    o = r.state.hiddenTargetIds
      .map(function (c) {
        return n.indexOf(c) > -1 && c;
      })
      .filter(Boolean);
  ((r.state.toggling = !0), r[''.concat(t ? 'remove' : 'add', 'HiddenTargetIds')](n));
  var s = r.$el.svg.selectAll(r.selectorTargets(n)),
    l = t ? null : '0';
  (t && o.length && (s.style('display', null), Q(r.config.data_onshown, this, o)),
    r
      .$T(s)
      .style('opacity', l, 'important')
      .call(bt, function () {
        var c;
        (!t &&
          o.length === 0 &&
          (s.style('display', 'none'),
          Q((c = r.config) === null || c === void 0 ? void 0 : c.data_onhidden, i, n)),
          s.style('opacity', l));
      }),
    a.withLegend && r[''.concat(t ? 'show' : 'hide', 'Legend')](n),
    r.redraw({ withUpdateOrgXDomain: !0, withUpdateXDomain: !0, withLegend: !0 }),
    (r.state.toggling = !1));
}
var jn = {
    show: function (t, e) {
      (e === void 0 && (e = {}), ca.call(this, !0, t, e));
    },
    hide: function (t, e) {
      (e === void 0 && (e = {}), ca.call(this, !1, t, e));
    },
    toggle: function (t, e) {
      var a = this;
      e === void 0 && (e = {});
      var i = this.internal,
        r = { show: [], hide: [] };
      (i.mapToTargetIds(t).forEach(function (n) {
        return r[i.isTargetToShow(n) ? 'hide' : 'show'].push(n);
      }),
        r.show.length && this.show(r.show, e),
        r.hide.length &&
          setTimeout(function () {
            return a.hide(r.hide, e);
          }, 0));
    },
  },
  Zn = {
    show: function (t) {
      var e,
        a,
        i,
        r = this.internal,
        n = r.$el,
        o = r.config,
        s = r.state,
        l = s.eventReceiver,
        c = s.hasFunnel,
        u = s.hasTreemap,
        d = s.inputType,
        f,
        v;
      if ((t.mouse && (v = t.mouse), t.data)) {
        var g = t.data,
          h = (e = r.getYScaleById(g.id)) === null || e === void 0 ? void 0 : e(g.value);
        if ((c || u) && g.id) {
          var p = r.selectorTarget(g.id, void 0, '.'.concat(oe.shape));
          l.rect = n.main.select(p);
        } else
          r.isMultipleX()
            ? (v = [r.xx(g), h])
            : (o.tooltip_grouped || (v = [0, h]),
              (f =
                (a = g.index) !== null && a !== void 0
                  ? a
                  : r.hasArcType() && g.id
                    ? (i = r.getArcElementByIdOrIndex(g.id)) === null || i === void 0
                      ? void 0
                      : i.datum().index
                    : r.getIndexByX(g.x)));
      } else q(t.x) ? (f = r.getIndexByX(t.x)) : q(t.index) && (f = t.index);
      (d === 'mouse' ? ['mouseover', 'mousemove'] : ['touchstart']).forEach(function (x) {
        r.dispatchEvent(x, f, v);
      });
    },
    hide: function () {
      var t,
        e,
        a,
        i = this.internal,
        r = i.state.inputType,
        n = i.$el.tooltip,
        o = n?.datum();
      if (o) {
        var s = JSON.parse(o.current)[0].index;
        (r === 'mouse' ? ['mouseout'] : ['touchend']).forEach(function (l) {
          i.dispatchEvent(l, s);
        });
      }
      (r === 'touch' && i.callOverOutForTouch(),
        i.hideTooltip(!0),
        (t = i.hideGridFocus) === null || t === void 0 || t.call(i),
        (e = i.unexpandCircles) === null || e === void 0 || e.call(i),
        (a = i.expandBarTypeShapes) === null || a === void 0 || a.call(i, !1));
    },
  },
  Kn = { tooltip: Zn },
  nt = (function () {
    function t(e) {
      this.plugins = [];
      var a = new je(this);
      ((this.internal = a),
        (function i(r, n, o) {
          Object.keys(r).forEach(function (s) {
            var l = I(r[s]),
              c = n !== o,
              u = le(r[s]),
              d = u && Object.keys(r[s]).length > 0;
            (l && ((!c && d) || c) ? (n[s] = r[s].bind(o)) : u && !l ? (n[s] = {}) : (n[s] = r[s]),
              d && i(r[s], n[s], o));
          });
        })(t.prototype, this, this),
        Pn.call(a, e),
        a.beforeInit(),
        a.init());
    }
    return t;
  })();
ve(nt.prototype, [Dn, zn, Fn, Vn, Yn, Wn, Un, jn, Kn]);
function ua(t, e, a) {
  var i = t.config,
    r = function (n, o) {
      var s = P(o) ? o : o === !1 ? void 0 : null;
      s !== null && (i['axis_'.concat(n, '_').concat(e)] = s);
    };
  q(a) &&
    (ye(a)
      ? Object.keys(a).forEach(function (n) {
          r(n, a[n]);
        })
      : (P(a) || a === !1) &&
        ['y', 'y2'].forEach(function (n) {
          r(n, a);
        }),
    t.redraw({ withUpdateOrgXDomain: !0, withUpdateXDomain: !0 }));
}
function da(t, e) {
  var a = t.config;
  return { x: a['axis_x_'.concat(e)], y: a['axis_y_'.concat(e)], y2: a['axis_y2_'.concat(e)] };
}
var qn = {
    labels: function (t) {
      var e = this.internal,
        a;
      return (
        t &&
          (Object.keys(t).forEach(function (i) {
            e.axis.setLabelText(i, t[i]);
          }),
          e.axis.updateLabels()),
        ['x', 'y', 'y2'].forEach(function (i) {
          var r = e.axis.getLabelText(i);
          r && (!a && (a = {}), (a[i] = r));
        }),
        a
      );
    },
    min: function (t) {
      var e = this.internal;
      return N(t) || t === !1 ? ua(e, 'min', t) : da(e, 'min');
    },
    max: function (t) {
      var e = this.internal;
      return N(t) || t === !1 ? ua(e, 'max', t) : da(e, 'max');
    },
    range: function (t) {
      var e = this.axis;
      if (arguments.length) {
        var a = t.min,
          i = t.max;
        (q(i) && e.max(i), q(a) && e.min(a));
      } else return { max: e.max(), min: e.min() };
    },
  },
  Jn = { axis: qn },
  Qn = {
    category: function (t, e) {
      var a = this.internal,
        i = a.config;
      return (
        arguments.length > 1 && ((i.axis_x_categories[t] = e), a.redraw()),
        i.axis_x_categories[t]
      );
    },
    categories: function (t) {
      var e = this.internal,
        a = e.config;
      if (!t || !Array.isArray(t)) {
        var i = a.axis_x_categories;
        return $e(i) ? Object.values(e.data.xs)[0] : i;
      }
      return ((a.axis_x_categories = t), e.redraw(), a.axis_x_categories);
    },
  },
  eo = {
    flow: function (t) {
      var e = this.internal,
        a;
      (t.json || t.rows || t.columns) &&
        e.convertData(t, function (r) {
          ((a = r), i());
        });
      function i() {
        var r,
          n = 0,
          o = 0,
          s,
          l;
        if (!(e.state.redrawing || !a || !gt())) {
          var c = [],
            u = e.getMaxDataCount(),
            d = e.convertDataToTargets(a, !0),
            f = e.axis.isTimeSeries();
          (e.data.targets.forEach(function (h) {
            for (var p = !1, x = 0; x < d.length; x++)
              if (h.id === d[x].id) {
                ((p = !0),
                  h.values[h.values.length - 1] && (o = h.values[h.values.length - 1].index + 1),
                  (n = d[x].values.length));
                for (var _ = 0; _ < n; _++)
                  ((d[x].values[_].index = o + _), f || (d[x].values[_].x = o + _));
                ((h.values = h.values.concat(d[x].values)), d.splice(x, 1));
                break;
              }
            !p && c.push(h.id);
          }),
            e.data.targets.forEach(function (h) {
              for (var p = 0; p < c.length; p++)
                if (h.id === c[p]) {
                  o = h.values[h.values.length - 1].index + 1;
                  for (var x = 0; x < n; x++)
                    h.values.push({
                      id: h.id,
                      index: o + x,
                      x: f ? e.getOtherTargetX(o + x) : o + x,
                      value: null,
                    });
                }
            }),
            e.data.targets.length &&
              d.forEach(function (h) {
                for (var p = [], x = e.data.targets[0].values[0].index; x < o; x++)
                  p.push({ id: h.id, index: x, x: f ? e.getOtherTargetX(x) : x, value: null });
                (h.values.forEach(function (_) {
                  ((_.index += o), f || (_.x += o));
                }),
                  (h.values = p.concat(h.values)));
              }),
            (e.data.targets = e.data.targets.concat(d)));
          var v = e.data.targets[0],
            g = v.values[0];
          (q(t.to)
            ? ((n = 0),
              (l = f ? Ae.call(e, t.to) : t.to),
              v.values.forEach(function (h) {
                h.x < l && n++;
              }))
            : q(t.length) && (n = t.length),
            u
              ? u === 1 &&
                f &&
                ((s = (v.values[v.values.length - 1].x - g.x) / 2),
                (r = [new Date(+g.x - s), new Date(+g.x + s)]))
              : (f
                  ? (s =
                      v.values.length > 1
                        ? v.values[v.values.length - 1].x - g.x
                        : g.x - e.getXDomain(e.data.targets)[0])
                  : (s = 1),
                (r = [g.x - s, g.x])),
            r && e.updateXDomain(null, !0, !0, !1, r),
            e.updateTargets(e.data.targets),
            e.redraw({
              flow: {
                index: g.index,
                length: n,
                duration: N(t.duration) ? t.duration : e.config.transition_duration,
                done: t.done,
                orgDataCount: u,
              },
              withLegend: !0,
              withTransition: u > 1,
              withTrimXDomain: !1,
              withUpdateXAxis: !0,
            }));
        }
      }
    },
  };
function Wt(t, e) {
  var a = this.internal,
    i = a.config,
    r = i.transition_duration && gt(),
    n = 'grid_'.concat(e, '_lines');
  return (t && ((i[n] = t), a.updateGrid(), a.redrawGrid(r)), i[n]);
}
function qa(t, e) {
  var a = 'grid_'.concat(e, '_lines');
  return Wt.bind(this)(this.internal.config[a].concat(t || []), e);
}
function Ja(t, e) {
  this.internal.removeGridLines(t, e);
}
var Qa = function (t) {
  return Wt.bind(this)(t, 'x');
};
ve(Qa, {
  add: function (t) {
    return qa.bind(this)(t, 'x');
  },
  remove: function (t) {
    return Ja.bind(this)(t, !0);
  },
});
var ei = function (t) {
  return Wt.bind(this)(t, 'y');
};
ve(ei, {
  add: function (t) {
    return qa.bind(this)(t, 'y');
  },
  remove: function (t) {
    return Ja.bind(this)(t, !1);
  },
});
var to = { xgrids: Qa, ygrids: ei },
  ao = {
    groups: function (t) {
      var e = this.internal,
        a = e.config;
      return (se(t) || ((a.data_groups = t), e.redraw()), a.data_groups);
    },
  };
function ti(t, e) {
  e === void 0 && (e = !1);
  var a = this.internal,
    i = a.config,
    r = i.transition_duration && gt();
  return t
    ? ((i.regions = e ? i.regions.concat(t) : t),
      a.updateRegion(),
      a.redrawRegion(r),
      e ? i.regions : t)
    : i.regions;
}
var ai = function (t) {
  return ti.bind(this)(t);
};
ve(ai, {
  add: function (t) {
    return ti.bind(this)(t, !0);
  },
  remove: function (t) {
    var e = this.internal,
      a = e.config,
      i = e.$T,
      r = t || {},
      n = Me(r, 'classes', [ft.region]),
      o = e.$el.main.select('.'.concat(ft.regions)).selectAll(
        n.map(function (s) {
          return '.'.concat(s);
        }),
      );
    return (
      i(o).style('opacity', '0').remove(),
      (o = a.regions),
      Object.keys(r).length
        ? ((o = o.filter(function (s) {
            var l = !1;
            return s.class
              ? (s.class.split(' ').forEach(function (c) {
                  n.indexOf(c) >= 0 && (l = !0);
                }),
                !l)
              : !0;
          })),
          (a.regions = o))
        : (a.regions = []),
      o
    );
  },
});
var io = { regions: ai },
  ro = {
    x: function (t) {
      var e = this.internal,
        a = e.axis,
        i = e.data,
        r = a.isCustomX() && a.isCategorized();
      return (
        j(t) &&
          (r
            ? this.categories(t)
            : (e.updateTargetX(i.targets, t),
              e.redraw({ withUpdateOrgXDomain: !0, withUpdateXDomain: !0 }))),
        r ? this.categories() : i.xs
      );
    },
    xs: function (t) {
      var e = this.internal;
      return (
        W(t) &&
          (e.updateTargetXs(e.data.targets, t),
          e.redraw({ withUpdateOrgXDomain: !0, withUpdateXDomain: !0 })),
        e.data.xs
      );
    },
  },
  no = (function () {
    function t(e) {
      this.charSize = {};
      var a = We(),
        i = e.config,
        r = e.params;
      ((this.owner = e),
        (this.config = i),
        (this.scale = a),
        (i.noTransition || !r.config.transition_duration) && (i.withoutTransition = !0),
        (i.range = this.scaleExtent((r.orgXScale || a).range())));
    }
    return (
      (t.prototype.getSizeFor1Char = function (e, a, i) {
        i === void 0 && (i = !0);
        var r = { w: 5.5, h: 11.5 };
        return this.charSize[e] && i
          ? this.charSize[e]
          : (!a.empty() &&
              a.text('0').call(function (n) {
                try {
                  var o = Be(n.node(), !0),
                    s = o.width,
                    l = o.height;
                  s && l && ((r.w = s), (r.h = l));
                } finally {
                  n.text('');
                }
              }),
            (this.charSize[e] = r),
            r);
      }),
      (t.prototype.getTickTransformSetter = function (e) {
        var a = this.config,
          i =
            e === 'x'
              ? function (r) {
                  return 'translate('.concat(r + a.tickOffset, ',0)');
                }
              : function (r) {
                  return 'translate(0,'.concat(r, ')');
                };
        return function (r, n) {
          r.attr('transform', function (o) {
            var s = n(o);
            return N(o) ? i(s) : null;
          });
        };
      }),
      (t.prototype.scaleExtent = function (e) {
        var a = e[0],
          i = e[e.length - 1];
        return a < i ? [a, i] : [i, a];
      }),
      (t.prototype.generateTicks = function (e, a) {
        var i = this.owner.params.tickStepSize,
          r = e.domain(),
          n = r[0],
          o = r[1],
          s = [];
        if (a && i) for (var l = Math.round(n); l <= o; ) (s.push(l), (l += i));
        else if (e.ticks) {
          var c = this.config.tickArguments;
          if (e.type === 'log' && !c) {
            var u = We('_log')
              .domain([n > 0 ? n : 1, o])
              .range(e.range());
            s = u.ticks();
            for (var d = o.toFixed().length; s.length > 15; d--) s = u.ticks(d);
            (s.splice(0, 1, n), s.splice(s.length - 1, 1, o));
          } else s = e.ticks.apply(e, this.config.tickArguments || []);
          s = s.map(function (f) {
            var v = (H(f) && P(f) && !isNaN(f) && Math.round(f * 10) / 10) || f;
            return v;
          });
        }
        return s;
      }),
      (t.prototype.copyScale = function () {
        var e = this.scale.copy();
        return (e.domain().length || e.domain(this.scale.domain()), (e.type = this.scale.type), e);
      }),
      (t.prototype.textFormatted = function (e) {
        var a = this.config.tickFormat,
          i = /\d+\.\d+0{5,}\d$/.test(e) ? +String(e).replace(/0+\d$/, '') : e,
          r = a ? a(i) : i;
        return q(r) ? r : '';
      }),
      (t.prototype.transitionise = function (e) {
        var a = this.config,
          i = e;
        if (a.withoutTransition) i = e.interrupt();
        else if (a.transition || !this.owner.params.noTransition)
          try {
            i = e.transition(a.transition);
          } catch {}
        return i;
      }),
      t
    );
  })(),
  oo = (function () {
    function t(e) {
      e === void 0 && (e = {});
      var a = {
        innerTickSize: 6,
        outerTickSize: e.outerTick ? 6 : 0,
        orient: 'bottom',
        range: [],
        tickArguments: null,
        tickCentered: null,
        tickCulling: !0,
        tickFormat: null,
        tickLength: 9,
        tickOffset: 0,
        tickPadding: 3,
        tickValues: null,
        transition: null,
        noTransition: e.noTransition,
      };
      ((a.tickLength = Math.max(a.innerTickSize, 0) + a.tickPadding),
        (this.config = a),
        (this.params = e),
        (this.helper = new no(this)));
    }
    return (
      (t.prototype.create = function (e) {
        var a = this,
          i = a.config,
          r = a.helper,
          n = a.params,
          o = r.scale,
          s = i.orient,
          l = this.splitTickText.bind(a),
          c = /^(left|right)$/.test(s),
          u = /^(top|bottom)$/.test(s),
          d = r.getTickTransformSetter(u ? 'x' : 'y'),
          f = d === r.axisX ? 'y' : 'x',
          v = /^(top|left)$/.test(s) ? -1 : 1,
          g = n.tickTextRotate;
        this.config.range = o.rangeExtent
          ? o.rangeExtent()
          : r.scaleExtent((n.orgXScale || o).range());
        var h = i.innerTickSize,
          p = i.tickLength,
          x = i.range,
          _ = n.id,
          m =
            _ && /^(x|y|y2)$/.test(_)
              ? n.config['axis_'.concat(_, '_tick_text_position')]
              : { x: 0, y: 0 },
          y = _ === 'subX' ? 'subchart_axis_x' : 'axis_'.concat(_),
          T = n.config[''.concat(y, '_show')],
          b = {
            tick: T ? n.config[''.concat(y, '_tick_show')] : !1,
            text: T ? n.config[''.concat(y, '_tick_text_show')] : !1,
          },
          $ = n.config.axis_evalTextSize,
          w;
        (e.each(function () {
          var A = L(this),
            R = this.__chart__ || o,
            C = r.copyScale();
          ((w = A), (this.__chart__ = C), (i.tickOffset = n.isCategory ? (C(1) - C(0)) / 2 : 0));
          var S = A.selectAll('.domain').data([0]);
          if (
            (S.enter()
              .append('path')
              .attr('class', 'domain')
              .merge(S)
              .attr('d', function () {
                var D = i.outerTickSize * v;
                return u
                  ? 'M'.concat(x[0], ',').concat(D, 'V0H').concat(x[1], 'V').concat(D)
                  : 'M'.concat(D, ',').concat(x[0], 'H0V').concat(x[1], 'H').concat(D);
              }),
            b.tick || b.text)
          ) {
            var M = i.tickValues || r.generateTicks(C, c || n.config.axis_rotated);
            a.generatedTicks = M;
            var k = A.selectAll('.tick').data(M, C),
              Z = k.enter().insert('g', '.domain').attr('class', 'tick'),
              G = k.exit().remove();
            ((k = Z.merge(k)), b.tick && Z.append('line'), b.text && Z.append('text'));
            var O = k.select('text'),
              B = [],
              Y = { w: 0, h: 0 };
            (I($) &&
              ((Y = $.bind(a.params.owner.api)(O.node(), _)),
              this.classList.contains(z.dummy) && (this.sizeFor1Char = Y)),
              (!Y || Y.w === 0 || Y.h === 0) && (Y = a.helper.getSizeFor1Char(s, O, !!$)));
            var ae = O.selectAll('tspan').data(function (D, ge) {
              var de = n.tickMultiline
                ? l(D, C, M, c, Y.w)
                : j(r.textFormatted(D))
                  ? r.textFormatted(D).concat()
                  : [r.textFormatted(D)];
              return (
                (B[ge] = de.length),
                de.map(function (xe) {
                  return { index: ge, splitted: xe };
                })
              );
            });
            (ae.exit().remove(),
              (ae = ae
                .enter()
                .append('tspan')
                .merge(ae)
                .text(function (D) {
                  return D.splitted;
                })),
              ae
                .attr('x', u ? 0 : p * v)
                .attr(
                  'dx',
                  (function () {
                    var D = 0;
                    return (
                      /(top|bottom)/.test(s) &&
                        g &&
                        (D = 8 * Math.sin(Math.PI * (g / 180)) * (s === 'top' ? -1 : 1)),
                      D + (m.x || 0)
                    );
                  })(),
                )
                .attr('dy', function (D, ge) {
                  var de = '.71em',
                    xe = 0;
                  return (
                    s !== 'top' &&
                      ((xe = Y.h),
                      ge === 0 &&
                        (xe = c ? -((B[D.index] - 1) * (Y.h / 2) - 3) : m.y === 0 ? de : 0)),
                    P(xe) && m.y ? xe + m.y : xe || de
                  );
                }));
            var Se = k.select('line'),
              be = k.select('text');
            if (
              (Z.select('line').attr(''.concat(f, '2'), h * v),
              Z.select('text').attr(f, p * v),
              a.setTickLineTextPosition(Se, be, Y),
              n.tickTitle)
            ) {
              var Pe = be.select('title');
              (Pe.empty() ? be.append('title') : Pe).text(function (D) {
                return n.tickTitle[D];
              });
            }
            if (C.bandwidth) {
              var Ke = C,
                Xe = Ke.bandwidth() / 2;
              ((R = function (D) {
                return Ke(D) + Xe;
              }),
                (C = R));
            } else R.bandwidth ? (R = C) : d(G, C);
            ((k = n.owner.state.flowing ? r.transitionise(k) : n.owner.$T(k)),
              d(Z, R),
              d(k.style('opacity', null), C));
          }
        }),
          (this.g = w));
      }),
      (t.prototype.getGeneratedTicks = function (e) {
        var a,
          i = ((a = this.generatedTicks) === null || a === void 0 ? void 0 : a.length) - 1,
          r = this.generatedTicks;
        if (i > e) {
          var n = Math.round(i / e + 0.1);
          r = this.generatedTicks
            .map(function (o, s) {
              return s % n === 0 ? o : null;
            })
            .filter(function (o) {
              return o !== null;
            })
            .splice(0, e);
        }
        return r;
      }),
      (t.prototype.getTickXY = function () {
        var e = this.config,
          a = { x: 0, y: 0 };
        return (
          this.params.isCategory &&
            ((a.x = e.tickCentered ? 0 : e.tickOffset), (a.y = e.tickCentered ? e.tickOffset : 0)),
          a
        );
      }),
      (t.prototype.getTickSize = function (e) {
        var a = this.helper.scale,
          i = this.config,
          r = i.innerTickSize,
          n = i.range,
          o = a(e) + (i.tickCentered ? 0 : i.tickOffset);
        return n[0] < o && o < n[1] ? r : 0;
      }),
      (t.prototype.setTickLineTextPosition = function (e, a, i) {
        var r = this,
          n = this.getTickXY(),
          o = this.config,
          s = o.innerTickSize,
          l = o.orient,
          c = o.tickLength,
          u = o.tickOffset,
          d = this.params.id,
          f = this.params.tickTextRotate,
          v = 6,
          g = i.h / 2 - v,
          h = function (b) {
            var $ = ['start', 'end'];
            return (l === 'top' && $.reverse(), b ? $[b > 0 ? 0 : 1] : 'middle');
          },
          p = function (b) {
            return b ? 'rotate('.concat(b, ')') : null;
          },
          x = function (b) {
            var $ = b / (l === 'bottom' ? 15 : 23),
              w = b ? 11.5 - 2.5 * $ * (b > 0 ? 1 : -1) : c;
            return w;
          },
          _ = this.params.owner.config,
          m = _.axis_rotated,
          y = _.axis_x_tick_text_inner,
          T = this.params.config['axis_'.concat(d, '_tick_inner')];
        switch (l) {
          case 'bottom':
            (e
              .attr('x1', n.x)
              .attr('x2', n.x)
              .attr('y2', function (b) {
                return r.getTickSize.bind(r)(b) * (T ? -1 : 1);
              }),
              a
                .attr('x', 0)
                .attr('y', x(f))
                .style('text-anchor', h(f))
                .style('text-anchor', function (b, $, w) {
                  var A = w.length;
                  return !m && $ === 0 && (y === !0 || y.first)
                    ? 'start'
                    : !m && $ === A - 1 && (y === !0 || y.last)
                      ? 'end'
                      : h(f);
                })
                .attr('transform', p(f)));
            break;
          case 'top':
            (e.attr('x2', 0).attr('y2', T ? s : -s),
              a
                .attr('x', 0)
                .attr('y', -(x(f) + g + v))
                .style('text-anchor', h(f))
                .attr('transform', p(f)));
            break;
          case 'left':
            (e
              .attr('x2', T ? s : -s)
              .attr('y1', n.y)
              .attr('y2', n.y),
              a
                .attr('x', -c)
                .attr('y', u + (m ? g / 4 : g))
                .style('text-anchor', 'end'));
            break;
          case 'right':
            (e.attr('x2', T ? -s : s).attr('y2', 0),
              a.attr('x', c).attr('y', g).style('text-anchor', 'start'));
        }
      }),
      (t.prototype.splitTickText = function (e, a, i, r, n) {
        var o = this.params,
          s = this.helper.textFormatted(e),
          l =
            H(s) &&
            s.indexOf(`
`) > -1
              ? s.split(`
`)
              : [];
        if (l.length) return l;
        if (j(s)) return s;
        var c = o.tickWidth;
        (!c || c <= 0) &&
          (c = r
            ? 95
            : o.isCategory
              ? (o.isInverted ? a(i[0]) - a(i[1]) : a(i[1]) - a(i[0])) - 12
              : 110);
        function u(d, f) {
          for (var v, g, h, p = 1; p < f.length; p++)
            if (
              (f.charAt(p) === ' ' && (g = p), (v = f.substr(0, p + 1)), (h = n * v.length), c < h)
            )
              return u(d.concat(f.substr(0, g || p)), f.slice(g ? g + 1 : p));
          return d.concat(f);
        }
        return u(l, String(s));
      }),
      (t.prototype.scale = function (e) {
        return arguments.length ? ((this.helper.scale = e), this) : this.helper.scale;
      }),
      (t.prototype.orient = function (e) {
        return arguments.length
          ? ((this.config.orient =
              e in { top: 1, right: 1, bottom: 1, left: 1 } ? String(e) : 'bottom'),
            this)
          : this.config.orient;
      }),
      (t.prototype.tickFormat = function (e) {
        var a = this.config;
        return arguments.length ? ((a.tickFormat = e), this) : a.tickFormat;
      }),
      (t.prototype.tickCentered = function (e) {
        var a = this.config;
        return arguments.length ? ((a.tickCentered = e), this) : a.tickCentered;
      }),
      (t.prototype.tickOffset = function () {
        return this.config.tickOffset;
      }),
      (t.prototype.tickInterval = function (e) {
        var a,
          i = this.config,
          r = i.outerTickSize,
          n = i.tickOffset,
          o = i.tickValues,
          s;
        if (this.params.isCategory) s = n * 2;
        else {
          var l =
              (a = this.params.owner.scale.zoom) !== null && a !== void 0 ? a : this.helper.scale,
            c = this.g.select('path.domain').node().getTotalLength() - r * 2;
          s = c / (e || this.g.selectAll('line').size());
          var u = o
            ? o
                .map(function (d, f, v) {
                  var g = f + 1;
                  return g < v.length ? l(v[g]) - l(d) : null;
                })
                .filter(Boolean)
            : [];
          s = Math.min.apply(Math, ne(ne([], u, !1), [s], !1));
        }
        return s === 1 / 0 ? 0 : s;
      }),
      (t.prototype.ticks = function () {
        for (var e = [], a = 0; a < arguments.length; a++) e[a] = arguments[a];
        var i = this.config;
        return e.length ? ((i.tickArguments = He(e)), this) : i.tickArguments;
      }),
      (t.prototype.tickCulling = function (e) {
        var a = this.config;
        return arguments.length ? ((a.tickCulling = e), this) : a.tickCulling;
      }),
      (t.prototype.tickValues = function (e) {
        var a = this,
          i = this.config;
        if (I(e))
          i.tickValues = function () {
            return e(a.helper.scale.domain());
          };
        else {
          if (!arguments.length) return i.tickValues;
          i.tickValues = e;
        }
        return this;
      }),
      (t.prototype.setTransition = function (e) {
        return ((this.config.transition = e), this);
      }),
      t
    );
  })(),
  so = {
    getAxisInstance: function () {
      return this.axis || new lo(this);
    },
  },
  lo = (function () {
    function t(e) {
      ((this.axesList = {}),
        (this.tick = { x: null, y: null, y2: null }),
        (this.xs = []),
        (this.orient = { x: 'bottom', y: 'left', y2: 'right', subX: 'bottom' }),
        (this.owner = e),
        this.setOrient());
    }
    return (
      (t.prototype.getAxisClassName = function (e) {
        return ''.concat(ue.axis, ' ').concat(ue['axis'.concat(pe(e))]);
      }),
      (t.prototype.isHorizontal = function (e, a) {
        var i = e.config.axis_rotated;
        return a ? i : !i;
      }),
      (t.prototype.isCategorized = function () {
        var e = this.owner,
          a = e.config,
          i = e.state;
        return a.axis_x_type.indexOf('category') >= 0 || i.hasRadar;
      }),
      (t.prototype.isCustomX = function () {
        var e = this.owner.config;
        return !this.isTimeSeries() && (e.data_x || le(e.data_xs));
      }),
      (t.prototype.isTimeSeries = function (e) {
        return (
          e === void 0 && (e = 'x'),
          this.owner.config['axis_'.concat(e, '_type')] === 'timeseries'
        );
      }),
      (t.prototype.isLog = function (e) {
        return (e === void 0 && (e = 'x'), this.owner.config['axis_'.concat(e, '_type')] === 'log');
      }),
      (t.prototype.isTimeSeriesY = function () {
        return this.isTimeSeries('y');
      }),
      (t.prototype.getAxisType = function (e) {
        e === void 0 && (e = 'x');
        var a = 'linear';
        return (
          this.isTimeSeries(e)
            ? (a = this.owner.config.axis_x_localtime ? 'time' : 'utc')
            : this.isLog(e) && (a = 'log'),
          a
        );
      }),
      (t.prototype.getExtent = function () {
        var e = this.owner,
          a = e.config,
          i = e.scale,
          r = a.axis_x_extent;
        if (r) {
          if (I(r)) r = r.bind(e.api)(e.getXDomain(e.data.targets), i.subX);
          else if (this.isTimeSeries() && r.every(isNaN)) {
            var n = Ae.bind(e);
            r = r.map(function (o) {
              return i.subX(n(o));
            });
          }
        }
        return r;
      }),
      (t.prototype.init = function () {
        var e = this,
          a = this.owner,
          i = a.config,
          r = a.$el,
          n = r.main,
          o = r.axis,
          s = a.state.clip,
          l = ['x', 'y'];
        (i.axis_y2_show && l.push('y2'),
          l.forEach(function (c) {
            var u = e.getAxisClassName(c);
            ((o[c] = n
              .append('g')
              .attr('class', u)
              .attr('clip-path', function () {
                var d = null;
                return (c === 'x' ? (d = s.pathXAxis) : c === 'y' && (d = s.pathYAxis), d);
              })
              .attr('transform', a.getTranslate(c))
              .style('visibility', i['axis_'.concat(c, '_show')] ? null : 'hidden')),
              e.generateAxes(c));
          }));
      }),
      (t.prototype.setOrient = function () {
        var e = this.owner,
          a = e.config,
          i = a.axis_rotated,
          r = a.axis_y_inner,
          n = a.axis_y2_inner;
        this.orient = {
          x: i ? 'left' : 'bottom',
          y: i ? (r ? 'top' : 'bottom') : r ? 'right' : 'left',
          y2: i ? (n ? 'bottom' : 'top') : n ? 'left' : 'right',
          subX: i ? 'left' : 'bottom',
        };
      }),
      (t.prototype.generateAxes = function (e) {
        var a = this.owner,
          i = a.config,
          r = [],
          n = i['axis_'.concat(e, '_axes')],
          o = i.axis_rotated,
          s;
        (e === 'x'
          ? (s = o ? qt : Jt)
          : e === 'y'
            ? (s = o ? Jt : qt)
            : e === 'y2' && (s = o ? rr : nr),
          n.length &&
            n.forEach(function (l) {
              var c = l.tick || {},
                u = a.scale[e].copy();
              (l.domain && u.domain(l.domain),
                r.push(
                  s(u)
                    .ticks(c.count)
                    .tickFormat(
                      I(c.format)
                        ? c.format.bind(a.api)
                        : function (d) {
                            return d;
                          },
                    )
                    .tickValues(c.values)
                    .tickSizeOuter(c.outer === !1 ? 0 : 6),
                ));
            }),
          (this.axesList[e] = r));
      }),
      (t.prototype.updateAxes = function () {
        var e = this,
          a = this.owner,
          i = a.config,
          r = a.$el.main,
          n = a.$T;
        Object.keys(this.axesList).forEach(function (o) {
          var s = i['axis_'.concat(o, '_axes')],
            l = a.scale[o].copy(),
            c = l.range();
          e.axesList[o].forEach(function (u, d) {
            var f = u.scale().range();
            c.every(function (h, p) {
              return h === f[p];
            }) || u.scale().range(c);
            var v = ''.concat(e.getAxisClassName(o), '-').concat(d + 1),
              g = r.select('.'.concat(v.replace(/\s/, '.')));
            (g.empty()
              ? (g = r
                  .append('g')
                  .attr('class', v)
                  .style('visibility', i['axis_'.concat(o, '_show')] ? null : 'hidden')
                  .call(u))
              : (s[d].domain && l.domain(s[d].domain), n(g).call(u.scale(l))),
              g.attr('transform', a.getTranslate(o, d + 1)));
          });
        });
      }),
      (t.prototype.setAxis = function (e, a, i, r) {
        var n = this.owner;
        (e !== 'subX' && (this.tick[e] = this.getTickValues(e)),
          (this[e] = this.getAxis(
            e,
            a,
            i,
            e === 'x' && (n.scale.zoom || n.config.subchart_show || n.state.resizing) ? !0 : r,
          )));
      }),
      (t.prototype.getAxis = function (e, a, i, r, n) {
        var o = this.owner,
          s = o.config,
          l = /^(x|subX)$/.test(e),
          c = l ? 'x' : e,
          u = l && this.isCategorized(),
          d = this.orient[e],
          f = n ? 0 : o.getAxisTickRotate(c),
          v;
        if (l) v = e === 'subX' ? o.format.subXAxisTick : o.format.xAxisTick;
        else {
          var g = s['axis_'.concat(e, '_tick_format')];
          I(g) && (v = g.bind(o.api));
        }
        var h = this.tick[c],
          p = it(
            { outerTick: i, noTransition: r, config: s, id: e, tickTextRotate: f, owner: o },
            l && {
              isCategory: u,
              isInverted: s.axis_x_inverted,
              tickMultiline: s.axis_x_tick_multiline,
              tickWidth: s.axis_x_tick_width,
              tickTitle: u && s.axis_x_tick_tooltip && o.api.categories(),
              orgXScale: o.scale.x,
            },
          );
        l || (p.tickStepSize = s['axis_'.concat(c, '_tick_stepSize')]);
        var x = new oo(p).scale((l && o.scale.zoom) || a).orient(d);
        if (l && this.isTimeSeries() && h && !I(h)) {
          var _ = Ae.bind(o);
          h = h.map(function (y) {
            return _(y);
          });
        } else !l && this.isTimeSeriesY() && (x.ticks(s.axis_y_tick_time_value), (h = null));
        (h && x.tickValues(h),
          x.tickFormat(
            v ||
              (!l &&
                o.isStackNormalized() &&
                o.hasAxisGroupedData(e) &&
                function (y) {
                  return ''.concat(y, '%');
                }),
          ),
          u &&
            (x.tickCentered(s.axis_x_tick_centered),
            $e(s.axis_x_tick_culling) && (s.axis_x_tick_culling = !1)));
        var m = s['axis_'.concat(c, '_tick_count')];
        return (m && x.ticks(m), x);
      }),
      (t.prototype.updateXAxisTickValues = function (e, a) {
        var i,
          r = this.owner,
          n = r.config,
          o = n.axis_x_tick_fit,
          s = n.axis_x_tick_count,
          l;
        return (
          (o || (s && o)) &&
            ((l = r.mapTargetsToUniqueXs(e)),
            this.isCategorized() && s > l.length && (s = l.length),
            (l = this.generateTickValues(l, s, this.isTimeSeries()))),
          a
            ? a.tickValues(l)
            : this.x &&
              (this.x.tickValues(l), (i = this.subX) === null || i === void 0 || i.tickValues(l)),
          l
        );
      }),
      (t.prototype.getId = function (e) {
        var a = this.owner,
          i = a.config,
          r = a.scale,
          n = i.data_axes[e];
        return ((!n || !r[n]) && (n = 'y'), n);
      }),
      (t.prototype.getXAxisTickFormat = function (e) {
        var a = this.owner,
          i = a.config,
          r = a.format,
          n = (e && i.subchart_axis_x_tick_format) || i.axis_x_tick_format,
          o = this.isTimeSeries(),
          s = this.isCategorized(),
          l;
        return (
          n
            ? I(n)
              ? (l = n.bind(a.api))
              : o &&
                (l = function (c) {
                  return c ? r.axisTime(n)(c) : '';
                })
            : (l = o
                ? r.defaultAxisTime
                : s
                  ? a.categoryName
                  : function (c) {
                      return c < 0 ? c.toFixed(0) : c;
                    }),
          I(l)
            ? function (c) {
                return l.apply(a, s ? [c, a.categoryName(c)] : [c]);
              }
            : l
        );
      }),
      (t.prototype.getTickValues = function (e) {
        var a = this.owner,
          i = a.config['axis_'.concat(e, '_tick_values')],
          r = a[''.concat(e, 'Axis')];
        return (I(i) ? i.call(a.api) : i) || (r ? r.tickValues() : void 0);
      }),
      (t.prototype.getLabelOptionByAxisId = function (e) {
        return this.owner.config['axis_'.concat(e, '_label')];
      }),
      (t.prototype.getLabelText = function (e) {
        var a = this.getLabelOptionByAxisId(e);
        return H(a) ? a : a ? a.text : null;
      }),
      (t.prototype.setLabelText = function (e, a) {
        var i = this.owner,
          r = i.config,
          n = this.getLabelOptionByAxisId(e);
        H(n) ? (r['axis_'.concat(e, '_label')] = a) : n && (n.text = a);
      }),
      (t.prototype.getLabelPosition = function (e, a) {
        var i = this.owner.config.axis_rotated,
          r = this.getLabelOptionByAxisId(e),
          n = ye(r) && r.position ? r.position : a[+!i],
          o = function (s) {
            return !!~n.indexOf(s);
          };
        return {
          isInner: o('inner'),
          isOuter: o('outer'),
          isLeft: o('left'),
          isCenter: o('center'),
          isRight: o('right'),
          isTop: o('top'),
          isMiddle: o('middle'),
          isBottom: o('bottom'),
        };
      }),
      (t.prototype.getAxisLabelPosition = function (e) {
        return this.getLabelPosition(
          e,
          e === 'x' ? ['inner-top', 'inner-right'] : ['inner-right', 'inner-top'],
        );
      }),
      (t.prototype.getLabelPositionById = function (e) {
        return this.getAxisLabelPosition(e);
      }),
      (t.prototype.xForAxisLabel = function (e) {
        var a = this.owner,
          i = a.state,
          r = i.width,
          n = i.height,
          o = this.getAxisLabelPosition(e),
          s = o.isMiddle ? -n / 2 : 0;
        return (
          this.isHorizontal(a, e !== 'x')
            ? (s = o.isLeft ? 0 : o.isCenter ? r / 2 : r)
            : o.isBottom && (s = -n),
          s
        );
      }),
      (t.prototype.textAnchorForAxisLabel = function (e) {
        var a = this.owner,
          i = this.getAxisLabelPosition(e),
          r = i.isMiddle ? 'middle' : 'end';
        return (
          this.isHorizontal(a, e !== 'x')
            ? (r = i.isLeft ? 'start' : i.isCenter ? 'middle' : 'end')
            : i.isBottom && (r = 'start'),
          r
        );
      }),
      (t.prototype.dxForAxisLabel = function (e) {
        var a = this.owner,
          i = this.getAxisLabelPosition(e),
          r = i.isBottom ? '0.5em' : '0';
        return (
          this.isHorizontal(a, e !== 'x')
            ? (r = i.isLeft ? '0.5em' : i.isRight ? '-0.5em' : '0')
            : i.isTop && (r = '-0.5em'),
          r
        );
      }),
      (t.prototype.dyForAxisLabel = function (e) {
        var a = this.owner,
          i = a.config,
          r = i.axis_rotated,
          n = this.getAxisLabelPosition(e).isInner,
          o = i['axis_'.concat(e, '_tick_rotate')] ? a.getHorizontalAxisHeight(e) : 0,
          s = this.getMaxTickSize(e).width,
          l;
        if (e === 'x') {
          var c = i.axis_x_height;
          r
            ? (l = n ? '1.2em' : -25 - s)
            : n
              ? (l = '-0.5em')
              : c
                ? (l = c - 10)
                : o
                  ? (l = o - 10)
                  : (l = '3em');
        } else
          ((l = {
            y: ['-0.5em', 10, '3em', '1.2em', 10],
            y2: ['1.2em', -20, '-2.2em', '-0.5em', 15],
          }[e]),
            r
              ? n
                ? (l = l[0])
                : o
                  ? (l = o * (e === 'y2' ? -1 : 1) - l[1])
                  : (l = l[2])
              : (l = n
                  ? l[3]
                  : (l[4] + (i['axis_'.concat(e, '_inner')] ? 0 : s + l[4])) *
                    (e === 'y' ? -1 : 1)));
        return l;
      }),
      (t.prototype.getMaxTickSize = function (e, a) {
        var i = this.owner,
          r = i.config,
          n = i.state,
          o = n.current,
          s = n.resizing,
          l = i.$el,
          c = l.svg,
          u = l.chart,
          d = o.maxTickSize[e],
          f = 'axis_'.concat(e),
          v = { width: 0, height: 0 };
        if (
          s ||
          a ||
          !r[''.concat(f, '_show')] ||
          (d.width > 0 && i.filterTargetsToShow().length === 0)
        )
          return d;
        if (c) {
          var g = /^y2?$/.test(e),
            h = i.filterTargetsToShow(i.data.targets),
            p = i.scale[e].copy().domain(i['get'.concat(g ? 'Y' : 'X', 'Domain')](h, e)),
            x = p.domain(),
            _ =
              x[0] === x[1] &&
              x.every(function (C) {
                return C > 0;
              }),
            m =
              j(d.domain) &&
              d.domain[0] === d.domain[1] &&
              d.domain.every(function (C) {
                return C > 0;
              });
          if (_ || m) return d.size;
          ((d.domain = x), g || d.ticks.splice(0));
          var y = this.getAxis(e, p, !1, !1, !0),
            T = r[''.concat(f, '_tick_rotate')],
            b = r[''.concat(f, '_tick_count')],
            $ = r[''.concat(f, '_tick_values')];
          (!$ &&
            b &&
            y.tickValues(
              this.generateTickValues(x, b, g ? this.isTimeSeriesY() : this.isTimeSeries()),
            ),
            !g && this.updateXAxisTickValues(h, y));
          var w = u
              .append('svg')
              .style('visibility', 'hidden')
              .style('position', 'fixed')
              .style('top', '0')
              .style('left', '0'),
            A = w
              .append('g')
              .attr('class', ''.concat(ue['axis'.concat(pe(e))], ' ').concat(z.dummy));
          y.create(A);
          var R = A.node().sizeFor1Char;
          (w
            .selectAll('text')
            .attr('transform', P(T) ? 'rotate('.concat(T, ')') : null)
            .each(function (C, S) {
              var M = R ? { width: this.textContent.length * R.w, height: R.h } : fe(this, !0),
                k = M.width,
                Z = M.height;
              ((v.width = Math.max(v.width, k)),
                (v.height = Math.max(v.height, Z)),
                g || (d.ticks[S] = k));
            }),
            w.remove());
        }
        return (
          Object.keys(v).forEach(function (C) {
            v[C] > 0 && (d[C] = v[C]);
          }),
          d
        );
      }),
      (t.prototype.getXAxisTickTextY2Overflow = function (e) {
        var a = this.owner,
          i = a.axis,
          r = a.config,
          n = a.state,
          o = n.current,
          s = n.isLegendRight,
          l = n.legendItemWidth,
          c = a.getAxisTickRotate('x'),
          u = c > 0 && c < 90;
        if (
          (i.isCategorized() || i.isTimeSeries()) &&
          r.axis_x_tick_fit &&
          (!r.axis_x_tick_culling || $e(r.axis_x_tick_culling)) &&
          !r.axis_x_tick_multiline &&
          u
        ) {
          var d = (r.axis_y2_show && o.maxTickSize.y2.width) || 0,
            f = (s && l) || 0,
            v = o.width - a.getCurrentPaddingByDirection('left'),
            g = this.getXAxisTickMaxOverflow(c, v - e) - d - f,
            h = Math.max(0, g) + e;
          return Math.min(h, v / 2);
        }
        return 0;
      }),
      (t.prototype.getXAxisTickMaxOverflow = function (e, a) {
        for (
          var i = this.owner,
            r = i.axis,
            n = i.config,
            o = i.state,
            s = r.isTimeSeries(),
            l = o.current.maxTickSize.x.ticks,
            c = l.length,
            u = o.axis.x.padding,
            d = u.left,
            f = u.right,
            v = 0,
            g = c - (s && n.axis_x_tick_fit ? 0.5 : 0),
            h = 0;
          h < c;
          h++
        ) {
          var p = h + 1,
            x = Math.cos((Math.PI * e) / 180) * l[h],
            _ = p - (s ? 1 : 0.5) + d;
          if (!(_ <= 0)) {
            var m = a - x,
              y = m / _,
              T = g - p,
              b = f * y,
              $ = T * y + b,
              w = x - y / 2 - $;
            v = Math.max(v, w);
          }
        }
        var A = i.filterTargetsToShow(i.data.targets),
          R = 0;
        if (!s && n.axis_x_tick_count <= A.length && A[0].values.length) {
          var C = We(i.axis.getAxisType('x'), 0, a - v).domain([
            d * -1,
            i.getXDomainMax(i.data.targets) + 1 + f,
          ]);
          R = (C(1) - C(0)) / 2;
        }
        return v + R;
      }),
      (t.prototype.updateLabels = function (e) {
        var a = this,
          i = this.owner,
          r = i.config,
          n = i.$el.main,
          o = i.$T,
          s = r.axis_rotated;
        ['x', 'y', 'y2'].forEach(function (l) {
          var c = a.getLabelText(l),
            u = 'axis'.concat(pe(l)),
            d = ue[''.concat(u, 'Label')];
          if (c) {
            var f = n.select('text.'.concat(d));
            (f.empty() &&
              (f = n
                .select('g.'.concat(ue[u]))
                .insert('text', ':first-child')
                .attr('class', d)
                .attr('transform', ['rotate(-90)', null][l === 'x' ? +!s : +s])
                .style('text-anchor', function () {
                  return a.textAnchorForAxisLabel(l);
                })),
              o(f, e)
                .attr('x', function () {
                  return a.xForAxisLabel(l);
                })
                .attr('dx', function () {
                  return a.dxForAxisLabel(l);
                })
                .attr('dy', function () {
                  return a.dyForAxisLabel(l);
                })
                .text(c));
          }
        });
      }),
      (t.prototype.getPadding = function (e, a, i, r) {
        var n = P(e) ? e : e[a];
        return N(n) ? this.owner.convertPixelToScale(/(bottom|top)/.test(a) ? 'y' : 'x', n, r) : i;
      }),
      (t.prototype.generateTickValues = function (e, a, i) {
        var r = e;
        if (a) {
          var n = I(a) ? a() : a;
          if (n === 1) r = [e[0]];
          else if (n === 2) r = [e[0], e[e.length - 1]];
          else if (n > 2) {
            var o = this.isCategorized(),
              s = n - 2,
              l = e[0],
              c = e[e.length - 1],
              u = (c - l) / (s + 1),
              d = void 0;
            r = [l];
            for (var f = 0; f < s; f++)
              ((d = +l + u * (f + 1)), r.push(i ? new Date(d) : o ? Math.round(d) : d));
            r.push(c);
          }
        }
        return (
          i ||
            (r = r.sort(function (v, g) {
              return v - g;
            })),
          r
        );
      }),
      (t.prototype.generateTransitions = function (e) {
        var a = this.owner,
          i = a.$el.axis,
          r = a.$T,
          n = ['x', 'y', 'y2', 'subX'].map(function (u) {
            return r(i[u], e);
          }),
          o = n[0],
          s = n[1],
          l = n[2],
          c = n[3];
        return { axisX: o, axisY: s, axisY2: l, axisSubX: c };
      }),
      (t.prototype.redraw = function (e, a, i) {
        var r = this,
          n = this.owner,
          o = n.config,
          s = n.state,
          l = n.$el,
          c = a ? '0' : null;
        (['x', 'y', 'y2', 'subX'].forEach(function (u) {
          var d = r[u],
            f = l.axis[u];
          d &&
            f &&
            (!i && !o.transition_duration && (d.config.withoutTransition = !0),
            f.style('opacity', c),
            d.create(e['axis'.concat(pe(u))]));
        }),
          this.updateAxes(),
          !s.rendered && o.axis_tooltip && this.setAxisTooltip());
      }),
      (t.prototype.redrawAxis = function (e, a, i, r, n) {
        var o = this,
          s,
          l,
          c,
          u = this.owner,
          d = u.config,
          f = u.scale,
          v = u.$el,
          g = !!f.zoom,
          h;
        (!g &&
          this.isCategorized() &&
          e.length === 0 &&
          f.x.domain([0, v.axis.x.selectAll('.tick').size()]),
          f.x && e.length
            ? (!g && u.updateXDomain(e, a.UpdateXDomain, a.UpdateOrgXDomain, a.TrimXDomain),
              d.axis_x_tick_values || this.updateXAxisTickValues(e))
            : this.x &&
              (this.x.tickValues([]), (s = this.subX) === null || s === void 0 || s.tickValues([])),
          d.zoom_rescale && !r && (h = f.x.orgDomain()),
          ['y', 'y2'].forEach(function (p) {
            var x = 'axis_'.concat(p, '_'),
              _ = f[p];
            if (_) {
              var m = d[''.concat(x, 'tick_values')],
                y = d[''.concat(x, 'tick_count')];
              if ((_.domain(u.getYDomain(e, p, h)), !m && y)) {
                var T = u.axis[p],
                  b = _.domain();
                T.tickValues(
                  o.generateTickValues(
                    b,
                    b.every(function ($) {
                      return $ === 0;
                    })
                      ? 1
                      : y,
                    o.isTimeSeriesY(),
                  ),
                );
              }
            }
          }),
          this.redraw(i, u.hasArcType(), n),
          this.updateLabels(a.Transition),
          (a.UpdateXDomain || a.UpdateXAxis || a.Y) && e.length && this.setCulling(),
          a.Y &&
            ((l = f.subY) === null || l === void 0 || l.domain(u.getYDomain(e, 'y')),
            (c = f.subY2) === null || c === void 0 || c.domain(u.getYDomain(e, 'y2'))));
      }),
      (t.prototype.setCulling = function () {
        var e = this.owner,
          a = e.config,
          i = e.state,
          r = i.clip,
          n = i.current,
          o = e.$el;
        ['subX', 'x', 'y', 'y2'].forEach(function (s) {
          var l = o.axis[s],
            c = s === 'subX' ? 'x' : s,
            u = 'axis_'.concat(c, '_tick_culling'),
            d = a[u];
          if (l && d) {
            var f = l.selectAll('.tick'),
              v = rt(f.data(), !a[''.concat(u, '_reverse')]),
              g = v.length,
              h = a[''.concat(u, '_max')],
              p = a[''.concat(u, '_lines')],
              x;
            if (g) {
              for (var _ = 1; _ < g; _++)
                if (g / _ < h) {
                  x = _;
                  break;
                }
              f.each(function (y) {
                var T = p ? this.querySelector('text') : this;
                T && (T.style.display = v.indexOf(y) % x ? 'none' : null);
              });
            } else f.style('display', null);
            if (s === 'x') {
              var m = n.maxTickSize.x.clipPath ? r.pathXAxisTickTexts : null;
              o.svg.selectAll('.'.concat(ue.axisX, ' .tick text')).attr('clip-path', m);
            }
          }
        });
      }),
      (t.prototype.setAxisTooltip = function () {
        var e,
          a = this.owner,
          i = a.config,
          r = i.axis_rotated,
          n = i.axis_tooltip,
          o = a.$el,
          s = o.axis,
          l = o.axisTooltip,
          c = (e = n.backgroundColor) !== null && e !== void 0 ? e : 'black';
        (a.generateTextBGColorFilter(c, { x: -0.15, y: -0.2, width: 1.3, height: 1.3 }),
          ['x', 'y', 'y2'].forEach(function (u) {
            var d, f, v;
            if (H(c) || c[u])
              if (
                ((l[u] =
                  (d = s[u]) === null || d === void 0
                    ? void 0
                    : d
                        .append('text')
                        .classed(ue['axis'.concat(u.toUpperCase(), 'Tooltip')], !0)
                        .attr('filter', a.updateTextBGColor({ id: u }, c))),
                r)
              ) {
                var g = u === 'x' ? 'x' : 'y',
                  h = u === 'y' ? '1.15em' : u === 'x' ? '-0.3em' : '-0.4em';
                (f = l[u]) === null ||
                  f === void 0 ||
                  f
                    .attr(g, h)
                    .attr('d'.concat(u === 'x' ? 'y' : 'x'), u === 'x' ? '0.4em' : '-1.3em')
                    .style('text-anchor', u === 'x' ? 'end' : null);
              } else {
                var g = u === 'x' ? 'y' : 'x',
                  h = u === 'x' ? '1.15em' : ''.concat(u === 'y' ? '-' : '', '0.4em');
                (v = l[u]) === null ||
                  v === void 0 ||
                  v
                    .attr(g, h)
                    .attr('d'.concat(u === 'x' ? 'x' : 'y'), u === 'x' ? '-1em' : '0.3em')
                    .style('text-anchor', u === 'y' ? 'end' : null);
              }
          }));
      }),
      t
    );
  })(),
  co = {
    initEventRect: function () {
      var t = this;
      t.$el.main
        .select('.'.concat(z.chart))
        .append('g')
        .attr('class', we.eventRects)
        .style('fill-opacity', '0');
    },
    redrawEventRect: function () {
      var t,
        e = this,
        a = e.config,
        i = e.state,
        r = e.$el,
        n = e.isMultipleX(),
        o = a.axis_x_inverted;
      if (r.eventRect) e.updateEventRect(r.eventRect, !0);
      else if (e.data.targets.length) {
        var s = e.$el.main
            .select('.'.concat(we.eventRects))
            .style(
              'cursor',
              a.zoom_enabled && a.zoom_type !== 'drag'
                ? a.axis_rotated
                  ? 'ns-resize'
                  : 'ew-resize'
                : null,
            )
            .classed(we.eventRectsMultiple, n)
            .classed(we.eventRectsSingle, !n),
          l = s.selectAll('.'.concat(we.eventRect)).data([0]).enter().append('rect');
        (e.updateEventRect(l),
          e.updateEventType(l),
          l.call(e.getDraggableSelection()),
          (r.eventRect = l),
          e.state.inputType === 'touch' &&
            !r.svg.on('touchstart.eventRect') &&
            !e.hasArcType() &&
            e.bindTouchOnEventRect(),
          i.rendered && e.updateEventRect(r.eventRect, !0));
      }
      if (!n) {
        var c = e.getMaxDataCountTarget();
        ((!a.data_xSort || o) &&
          c.sort(function (u, d) {
            return o ? d.x - u.x : u.x - d.x;
          }),
          e.updateDataIndexByX(c),
          e.updateXs(c),
          (t = e.updatePointClass) === null || t === void 0 || t.call(e, !0),
          (i.eventReceiver.data = c));
      }
      e.updateEventRectData();
    },
    bindTouchOnEventRect: function () {
      var t = this,
        e = t.config,
        a = t.state,
        i = t.$el,
        r = i.eventRect,
        n = i.svg,
        o = function (g) {
          if (t.isMultipleX()) t.selectRectForMultipleXs(g);
          else {
            var h = t.getDataIndexFromEvent(a.event);
            (t.callOverOutForTouch(h), h === -1 ? t.unselectRect() : t.selectRectForSingle(g, h));
          }
        },
        s = function () {
          (t.unselectRect(), t.callOverOutForTouch());
        },
        l = e.interaction_inputType_touch.preventDefault,
        c = (Mt(l) && l) || !1,
        u = (!isNaN(l) && l) || null,
        d,
        f = !c && u === null,
        v = function (g) {
          var h = g.type,
            p = g.changedTouches[0],
            x = p['client'.concat(e.axis_rotated ? 'Y' : 'X')];
          h === 'touchstart'
            ? c
              ? g.preventDefault()
              : u !== null && (d = x)
            : h === 'touchmove' &&
              (c || d === !0 || (u !== null && Math.abs(d - x) >= u)) &&
              ((d = !0), g.preventDefault());
        };
      (r
        .on(
          'touchstart',
          function (g) {
            ((a.event = g), t.updateEventRect());
          },
          { passive: f },
        )
        .on(
          'touchstart.eventRect touchmove.eventRect',
          function (g) {
            if (((a.event = g), !r.empty() && r.classed(we.eventRect))) {
              if (a.dragging || a.flowing || t.hasArcType() || g.touches.length > 1) return;
              (v(g), o(r.node()));
            } else s();
          },
          { passive: f },
        )
        .on(
          'touchend.eventRect',
          function (g) {
            ((a.event = g),
              !r.empty() &&
                r.classed(we.eventRect) &&
                (t.hasArcType() || !t.toggleShape || a.cancelClick) &&
                a.cancelClick &&
                (a.cancelClick = !1));
          },
          { passive: f },
        ),
        n.on(
          'touchstart',
          function (g) {
            a.event = g;
            var h = g.target;
            h && h !== r.node() && s();
          },
          { passive: f },
        ));
    },
    updateEventRect: function (t, e) {
      e === void 0 && (e = !1);
      var a = this,
        i = a.state,
        r = a.$el,
        n = i.eventReceiver,
        o = i.width,
        s = i.height,
        l = i.rendered,
        c = i.resizing,
        u = t || r.eventRect,
        d = function () {
          if (n) {
            var f = Ba(r.chart.node());
            ((n.rect = fe(u.node(), !0).toJSON()), (n.rect.top += f.y), (n.rect.left += f.x));
          }
        };
      ((!l || c || e) &&
        (u.attr('x', 0).attr('y', 0).attr('width', o).attr('height', s),
        (!l || e) && u.classed(we.eventRect, !0)),
        d());
    },
    updateEventType: function (t) {
      var e = this,
        a = Mt(t),
        i = a ? e.$el.eventRect : t,
        r = a ? t !== i?.datum().multipleX : !1;
      i &&
        (r && i?.on('mouseover mousemove mouseout click', null),
        e.isMultipleX() ? e.generateEventRectsForMultipleXs(i) : e.generateEventRectsForSingleX(i));
    },
    updateEventRectData: function () {
      var t = this,
        e = t.config,
        a = t.scale,
        i = t.state,
        r = a.zoom || a.x,
        n = e.axis_rotated,
        o = t.isMultipleX(),
        s,
        l,
        c,
        u;
      if ((t.updateEventType(o), o)) ((s = 0), (l = 0), (c = i.width), (u = i.height));
      else {
        var d,
          f = void 0;
        if (t.axis.isCategorized())
          ((d = t.getEventRectWidth()),
            (f = function (p) {
              return r(p.x) - d / 2;
            }));
        else {
          var v = function (p) {
            var x = p.index;
            return { prev: t.getPrevX(x), next: t.getNextX(x) };
          };
          ((d = function (p) {
            var x = v(p),
              _ = r.domain(),
              m;
            return (
              x.prev === null && x.next === null
                ? (m = n ? i.height : i.width)
                : x.prev === null
                  ? (m = (r(x.next) + r(p.x)) / 2)
                  : x.next === null
                    ? (m = r(_[1]) - (r(x.prev) + r(p.x)) / 2)
                    : (Object.keys(x).forEach(function (y, T) {
                        var b;
                        x[y] = (b = x[y]) !== null && b !== void 0 ? b : _[T];
                      }),
                      (m = Math.max(0, (r(x.next) - r(x.prev)) / 2))),
              m
            );
          }),
            (f = function (p) {
              var x = v(p),
                _;
              return (
                x.prev === null && x.next === null
                  ? (_ = 0)
                  : x.prev === null
                    ? (_ = r(r.domain()[0]))
                    : (_ = (r(p.x) + r(x.prev)) / 2),
                _
              );
            }));
        }
        ((s = n ? 0 : f), (l = n ? f : 0), (c = n ? i.width : d), (u = n ? d : i.height));
      }
      var g = i.eventReceiver,
        h = function (p, x) {
          return I(p) ? p(x) : p;
        };
      (g.coords.splice(g.data.length),
        g.data.forEach(function (p, x) {
          g.coords[x] = { x: h(s, p), y: h(l, p), w: h(c, p), h: h(u, p) };
        }));
    },
    selectRectForSingle: function (t, e) {
      var a,
        i,
        r = this,
        n = r.config,
        o = r.$el,
        s = o.main,
        l = o.circle,
        c = n.data_selection_enabled,
        u = n.data_selection_grouped,
        d = n.data_selection_isselectable,
        f = n.tooltip_grouped,
        v = r.getAllValuesOnIndex(e);
      if (
        !(
          f &&
          (r.showTooltip(v, t),
          (a = r.showGridFocus) === null || a === void 0 || a.call(r, v),
          !c || u)
        )
      ) {
        !l &&
          s
            .selectAll('.'.concat(z.EXPANDED, ':not(.').concat(oe.shape, '-').concat(e, ')'))
            .classed(z.EXPANDED, !1);
        var g = s
          .selectAll('.'.concat(oe.shape, '-').concat(e))
          .classed(z.EXPANDED, !0)
          .style('cursor', d ? 'pointer' : null)
          .filter(function (h) {
            return r.isWithinShape(this, h);
          });
        (g.empty() &&
          !f &&
          n.interaction_onout &&
          ((i = r.hideGridFocus) === null || i === void 0 || i.call(r),
          r.hideTooltip(),
          !u && r.setExpand(e)),
          g.call(function (h) {
            var p,
              x,
              _ = h.data();
            (c && (u || d?.bind(r.api)(_)) && (t.style.cursor = 'pointer'),
              f ||
                (r.showTooltip(_, t),
                (p = r.showGridFocus) === null || p === void 0 || p.call(r, _),
                (x = r.unexpandCircles) === null || x === void 0 || x.call(r),
                h.each(function (m) {
                  return r.setExpand(e, m.id);
                })));
          }));
      }
    },
    selectRectForMultipleXs: function (t, e) {
      e === void 0 && (e = !0);
      var a = this,
        i = a.config,
        r = a.state,
        n = a.filterTargetsToShow(a.data.targets);
      if (!(r.dragging || a.hasArcType(n))) {
        var o = Te(r.event, t),
          s = a.findClosestFromTargets(n, o);
        if (
          (e &&
            r.mouseover &&
            (!s || s.id !== r.mouseover.id) &&
            (i.data_onout.call(a.api, r.mouseover), (r.mouseover = void 0)),
          !s)
        ) {
          a.unselectRect();
          return;
        }
        var l =
            a.isBubbleType(s) || a.isScatterType(s) || !i.tooltip_grouped
              ? [s]
              : a.filterByX(n, s.x),
          c = l.map(function (d) {
            return a.addName(d);
          });
        (a.showTooltip(c, t), a.setExpand(s.index, s.id, !0), a.showGridFocus(c));
        var u = a.dist(s, o);
        (a.isBarType(s.id) || u < a.getPointSensitivity(s)) &&
          (a.$el.svg.select('.'.concat(we.eventRect)).style('cursor', 'pointer'),
          e &&
            (!r.mouseover || r.mouseover.x !== s.x || r.mouseover.id !== s.id) &&
            (i.data_onover.call(a.api, s), (r.mouseover = s)));
      }
    },
    unselectRect: function () {
      var t = this,
        e = t.$el,
        a = e.circle,
        i = e.tooltip;
      (t.$el.svg.select('.'.concat(we.eventRect)).style('cursor', null),
        t.hideGridFocus(),
        i && (t.hideTooltip(), t._handleLinkedCharts(!1)),
        a && !t.isPointFocusOnly() && t.unexpandCircles(),
        t.expandBarTypeShapes(!1));
    },
    generateEventRectsForSingleX: function (t) {
      var e = this,
        a = e.config,
        i = e.state,
        r = i.eventReceiver,
        n = t
          .style('cursor', a.data_selection_enabled && a.data_selection_grouped ? 'pointer' : null)
          .on('click', function (s) {
            i.event = s;
            var l = r.currentIdx,
              c = r.data,
              u = c[l === -1 ? e.getDataIndexFromEvent(s) : l];
            e.clickHandlerForSingleX.bind(this)(u, e);
          })
          .datum({ multipleX: !1 });
      if (i.inputType === 'mouse') {
        var o = function (s) {
          var l = s ? e.getDataIndexFromEvent(s) : r.currentIdx;
          return l > -1 ? r.data[l] : null;
        };
        n.on('mouseover', function (s) {
          ((i.event = s),
            e.updateEventRect(),
            Object.values(e.$el.axisTooltip).forEach(function (l) {
              return l?.style('display', null);
            }));
        })
          .on('mousemove', function (s) {
            var l = o(s);
            if (((i.event = s), !!l)) {
              var c = l.index,
                u = a.line_step_type;
              if (
                a.line_step_tooltipMatch &&
                e.hasType('step') &&
                /^step\-(before|after)$/.test(u)
              ) {
                var d = e.scale.zoom || e.scale.x,
                  f = e.axis.xs[c],
                  v = d.invert(Te(s, this)[0]);
                u === 'step-after' && v < f ? (c -= 1) : u === 'step-before' && v > f && (c += 1);
              }
              e.showAxisGridFocus();
              var g = a.tooltip_grouped && c === r.currentIdx;
              if (i.dragging || i.flowing || e.hasArcType() || g) {
                a.tooltip_show && g && e.setTooltipPosition();
                return;
              }
              (c !== r.currentIdx && (e.setOverOut(!1, r.currentIdx), (r.currentIdx = c)),
                c === -1 ? e.unselectRect() : e.selectRectForSingle(this, c),
                e.setOverOut(c !== -1, c));
            }
          })
          .on('mouseout', function (s) {
            ((i.event = s),
              !(!a || e.hasArcType() || r.currentIdx === -1 || !a.interaction_onout) &&
                (e.hideAxisGridFocus(),
                e.unselectRect(),
                e.setOverOut(!1, r.currentIdx),
                (r.currentIdx = -1)));
          });
      }
      return n;
    },
    clickHandlerForSingleX: function (t, e) {
      var a = e,
        i = a.config,
        r = a.state,
        n = a.$el.main;
      if (!t || a.hasArcType() || r.cancelClick) {
        r.cancelClick && (r.cancelClick = !1);
        return;
      }
      var o = t.index;
      n.selectAll('.'.concat(oe.shape, '-').concat(o)).each(function (s) {
        var l;
        (i.data_selection_grouped || a.isWithinShape(this, s)) &&
          ((l = a.toggleShape) === null || l === void 0 || l.call(a, this, s, o),
          i.data_onclick.bind(a.api)(s, this));
      });
    },
    generateEventRectsForMultipleXs: function (t) {
      var e = this,
        a = e.config,
        i = e.state;
      (t
        .on('click', function (r) {
          ((i.event = r), e.clickHandlerForMultipleXS.bind(this)(e));
        })
        .datum({ multipleX: !0 }),
        i.inputType === 'mouse' &&
          t
            .on('mouseover mousemove', function (r) {
              ((i.event = r), e.selectRectForMultipleXs(this));
            })
            .on('mouseout', function (r) {
              ((i.event = r),
                !(!e.config || e.hasArcType() || !a.interaction_onout) && e.unselectRect());
            }));
    },
    clickHandlerForMultipleXS: function (t) {
      var e = t,
        a = e.config,
        i = e.state,
        r = e.filterTargetsToShow(e.data.targets);
      if (!e.hasArcType(r)) {
        var n = Te(i.event, this),
          o = e.findClosestFromTargets(r, n),
          s = e.getPointSensitivity(o);
        o &&
          (e.isBarType(o.id) || e.dist(o, n) < s) &&
          e.$el.main
            .selectAll('.'.concat(oe.shapes).concat(e.getTargetSelectorSuffix(o.id)))
            .selectAll('.'.concat(oe.shape, '-').concat(o.index))
            .each(function () {
              var l;
              (a.data_selection_grouped || e.isWithinShape(this, o)) &&
                ((l = e.toggleShape) === null || l === void 0 || l.call(e, this, o, o.index),
                a.data_onclick.bind(e.api)(o, this));
            });
      }
    },
  },
  uo = {
    generateFlow: function (t) {
      var e = this,
        a = e.data,
        i = e.state,
        r = e.$el;
      return function () {
        var n = t.flow.length;
        ((i.flowing = !0),
          a.targets.forEach(function (s) {
            s.values.splice(0, n);
          }),
          e.updateXGrid && e.updateXGrid(!0));
        var o = {};
        ([
          'axis.x',
          'grid.x',
          'gridLines.x',
          'region.list',
          'text',
          'bar',
          'line',
          'area',
          'circle',
        ].forEach(function (s) {
          var l = s.split('.'),
            c = r[l[0]];
          (c && l.length > 1 && (c = c[l[1]]), c?.size() && (o[s] = c));
        }),
          e.hideGridFocus(),
          e.setFlowList(o, t));
      };
    },
    setFlowList: function (t, e) {
      var a = this,
        i = e.flow,
        r = e.targets,
        n = i.duration,
        o = n === void 0 ? e.duration : n,
        s = i.index,
        l = i.length,
        c = i.orgDataCount,
        u = a.getFlowTransform(r, c, s, l),
        d = Ya(),
        f;
      (d.add(
        Object.keys(t).map(function (v) {
          return (
            (f = t[v].transition().ease(di).duration(o)),
            v === 'axis.x'
              ? (f = f.call(function (g) {
                  a.axis.x.setTransition(g).create(g);
                }))
              : v === 'region.list'
                ? (f = f.filter(a.isRegionOnX).attr('transform', u))
                : (f = f.attr('transform', u)),
            f
          );
        }),
      ),
        f.call(d, function () {
          a.cleanUpFlow(t, e);
        }));
    },
    cleanUpFlow: function (t, e) {
      var a = this,
        i = a.config,
        r = a.state,
        n = a.$el.svg,
        o = i.axis_rotated,
        s = e.flow,
        l = e.shape,
        c = e.xv,
        u = l.pos,
        d = u.cx,
        f = u.cy,
        v = u.xForText,
        g = u.yForText,
        h = s.done,
        p = h === void 0 ? function () {} : h,
        x = s.length;
      (x &&
        (['circle', 'text', 'shape', 'eventRect'].forEach(function (_) {
          for (var m = [], y = 0; y < x; y++) m.push('.'.concat(U[_], '-').concat(y));
          n.selectAll('.'.concat(U[''.concat(_, 's')]))
            .selectAll(m)
            .remove();
        }),
        n.select('.'.concat(U.xgrid)).remove()),
        Object.keys(t).forEach(function (_) {
          var m = t[_];
          if ((_ !== 'axis.x' && m.attr('transform', null), _ === 'grid.x')) m.attr(r.xgridAttr);
          else if (_ === 'gridLines.x')
            (m.attr('x1', o ? 0 : c).attr('x2', o ? r.width : c),
              m
                .select('text')
                .attr('x', o ? r.width : 0)
                .attr('y', c));
          else if (/^(area|bar|line)$/.test(_)) m.attr('d', l.type[_]);
          else if (_ === 'text')
            m.attr('x', v).attr('y', g).style('fill-opacity', a.opacityForText.bind(a));
          else if (_ === 'circle')
            if (a.isCirclePoint()) m.attr('cx', d).attr('cy', f);
            else {
              var y = function (b) {
                  return d(b) - i.point_r;
                },
                T = function (b) {
                  return f(b) - i.point_r;
                };
              m.attr('x', y).attr('y', T);
            }
          else
            _ === 'region.list' &&
              m
                .select('rect')
                .filter(a.isRegionOnX)
                .attr('x', a.regionX.bind(a))
                .attr('width', a.regionWidth.bind(a));
        }),
        i.interaction_enabled && a.redrawEventRect(),
        p.call(a.api),
        (r.flowing = !1));
    },
    getFlowTransform: function (t, e, a, i) {
      var r = this,
        n = r.data,
        o = r.scale.x,
        s = n.targets[0].values,
        l = r.getValueOnIndex(s, a),
        c = r.getValueOnIndex(s, a + i),
        u,
        d = o.domain(),
        f = r.updateXDomain(t, !0, !0);
      e
        ? e === 1 || l?.x === c?.x
          ? (u = o(d[0]) - o(f[0]))
          : (u = r.axis.isTimeSeries() ? o(d[0]) - o(f[0]) : o(l?.x || 0) - o(c.x))
        : s.length !== 1
          ? (u = o(d[0]) - o(f[0]))
          : r.axis.isTimeSeries()
            ? ((l = r.getValueOnIndex(s, 0)),
              (c = r.getValueOnIndex(s, s.length - 1)),
              (u = o(l.x) - o(c.x)))
            : (u = Ye(f) / 2);
      var v = Ye(d) / Ye(f);
      return 'translate('.concat(u, ',0) scale(').concat(v, ',1)');
    },
  },
  fo = {
    initClip: function () {
      var t = this,
        e = t.state,
        a = e.clip,
        i = e.datetimeId;
      ((a.id = ''.concat(i, '-clip')),
        (a.idXAxis = ''.concat(a.id, '-xaxis')),
        (a.idYAxis = ''.concat(a.id, '-yaxis')),
        (a.idGrid = ''.concat(a.id, '-grid')),
        (a.path = t.getClipPath(a.id)),
        (a.pathXAxis = t.getClipPath(a.idXAxis)),
        (a.pathYAxis = t.getClipPath(a.idYAxis)),
        (a.pathGrid = t.getClipPath(a.idGrid)));
    },
    getClipPath: function (t) {
      var e = this,
        a = e.config;
      return (!a.clipPath && /-clip$/.test(t)) ||
        (!a.axis_x_clipPath && /-clip-xaxis$/.test(t)) ||
        (!a.axis_y_clipPath && /-clip-yaxis$/.test(t))
        ? null
        : 'url(#'.concat(t, ')');
    },
    appendClip: function (t, e) {
      e && t.append('clipPath').attr('id', e).append('rect');
    },
    setXAxisClipPath: function (t) {
      var e = this,
        a = e.config,
        i = e.state,
        r = i.margin,
        n = i.width,
        o = i.height,
        s = a.axis_rotated,
        l = Math.max(30, r.left) - (s ? 0 : 20),
        c = (s ? r.top + o + 10 : r.bottom) + 20,
        u = s ? -(1 + l) : -(l - 1),
        d = -15,
        f = s ? r.left + 20 : n + 10 + l;
      t.attr('x', u).attr('y', d).attr('width', f).attr('height', c);
    },
    setYAxisClipPath: function (t) {
      var e = this,
        a = e.config,
        i = e.state,
        r = i.margin,
        n = i.width,
        o = i.height,
        s = a.axis_rotated,
        l = Math.max(30, r.left) - (s ? 20 : 0),
        c = a.axis_y_inner,
        u = c && !s ? (a.axis_y_label.text ? -20 : -1) : s ? -(1 + l) : -(l - 1),
        d = -(s ? 20 : r.top),
        f = (s ? n + 15 + l : r.left + 20) + (c ? 20 : 0),
        v = (s ? r.bottom + 10 : r.top + o) + 10;
      t.attr('x', u).attr('y', d).attr('width', f).attr('height', v);
    },
    updateXAxisTickClip: function () {
      var t = this,
        e = t.config,
        a = t.state,
        i = a.clip,
        r = a.xAxisHeight,
        n = t.$el.defs,
        o = t.getHorizontalAxisHeight('x');
      if (n && !i.idXAxisTickTexts) {
        var s = ''.concat(i.id, '-xaxisticktexts');
        (t.appendClip(n, s),
          (i.pathXAxisTickTexts = t.getClipPath(i.idXAxisTickTexts)),
          (i.idXAxisTickTexts = s));
      }
      (!e.axis_x_tick_multiline &&
        t.getAxisTickRotate('x') &&
        o !== r &&
        (t.setXAxisTickClipWidth(), t.setXAxisTickTextClipPathWidth()),
        (t.state.xAxisHeight = o));
    },
    setXAxisTickClipWidth: function () {
      var t = this,
        e = t.config,
        a = t.state.current.maxTickSize,
        i = t.getAxisTickRotate('x');
      if (!e.axis_x_tick_multiline && i) {
        var r = Math.sin((Math.PI / 180) * Math.abs(i));
        a.x.clipPath = (t.getHorizontalAxisHeight('x') - 20) / r;
      } else a.x.clipPath = null;
    },
    setXAxisTickTextClipPathWidth: function () {
      var t = this,
        e = t.state,
        a = e.clip,
        i = e.current,
        r = t.$el.svg;
      r &&
        r
          .select('#'.concat(a.idXAxisTickTexts, ' rect'))
          .attr('width', i.maxTickSize.x.clipPath)
          .attr('height', 30);
    },
  },
  vo = function (t) {
    return N(t.position) || 'end';
  },
  go = function (t) {
    return t.position === 'start' ? 4 : t.position === 'middle' ? 0 : -4;
  };
function fa(t, e, a) {
  return function (i) {
    var r = t ? 0 : e;
    return (
      i.position === 'start' ? (r = t ? -a : 0) : i.position === 'middle' && (r = (t ? -a : e) / 2),
      r
    );
  };
}
function va(t, e) {
  t.each(function () {
    var a = L(this);
    ['x1', 'x2', 'y1', 'y2'].forEach(function (i) {
      return a.attr(i, +a.attr(i));
    });
  });
}
var ho = {
    hasGrid: function () {
      var t = this.config;
      return ['x', 'y'].some(function (e) {
        return t['grid_'.concat(e, '_show')] || t['grid_'.concat(e, '_lines')].length;
      });
    },
    initGrid: function () {
      var t = this;
      (t.hasGrid() && t.initGridLines(), t.initFocusGrid());
    },
    initGridLines: function () {
      var t = this,
        e = t.config,
        a = t.state.clip,
        i = t.$el;
      (e.grid_x_lines.length || e.grid_y_lines.length) &&
        ((i.gridLines.main = i.main
          .insert('g', '.'.concat(z.chart).concat(e.grid_lines_front ? ' + *' : ''))
          .attr('clip-path', a.pathGrid)
          .attr('class', ''.concat(ie.grid, ' ').concat(ie.gridLines))),
        i.gridLines.main.append('g').attr('class', ie.xgridLines),
        i.gridLines.main.append('g').attr('class', ie.ygridLines),
        (i.gridLines.x = Ta([])));
    },
    updateXGrid: function (t) {
      var e = this,
        a = e.config,
        i = e.scale,
        r = e.state,
        n = e.$el,
        o = n.main,
        s = n.grid,
        l = a.axis_rotated,
        c = e.generateGridData(a.grid_x_type, i.x),
        u = e.axis.isCategorized() ? e.axis.x.tickOffset() : 0,
        d = function (f) {
          return (i.zoom || i.x)(f) + u * (l ? -1 : 1);
        };
      ((r.xgridAttr = l
        ? { x1: 0, x2: r.width, y1: d, y2: d }
        : { x1: d, x2: d, y1: 0, y2: r.height }),
        (s.x = o.select('.'.concat(ie.xgrids)).selectAll('.'.concat(ie.xgrid)).data(c)),
        s.x.exit().remove(),
        (s.x = s.x.enter().append('line').attr('class', ie.xgrid).merge(s.x)),
        t ||
          s.x.each(function () {
            var f = L(this);
            Object.keys(r.xgridAttr).forEach(function (v) {
              f.attr(v, r.xgridAttr[v]).style('opacity', function () {
                return f.attr(l ? 'y1' : 'x1') === (l ? r.height : 0) ? '0' : null;
              });
            });
          }));
    },
    updateYGrid: function () {
      var t = this,
        e = t.axis,
        a = t.config,
        i = t.scale,
        r = t.state,
        n = t.$el,
        o = n.grid,
        s = n.main,
        l = a.axis_rotated,
        c = function (d) {
          return i.y(d);
        },
        u = e.y.getGeneratedTicks(a.grid_y_ticks) || t.scale.y.ticks(a.grid_y_ticks);
      ((o.y = s.select('.'.concat(ie.ygrids)).selectAll('.'.concat(ie.ygrid)).data(u)),
        o.y.exit().remove(),
        (o.y = o.y.enter().append('line').attr('class', ie.ygrid).merge(o.y)),
        o.y
          .attr('x1', l ? c : 0)
          .attr('x2', l ? c : r.width)
          .attr('y1', l ? 0 : c)
          .attr('y2', l ? r.height : c),
        va(o.y));
    },
    updateGrid: function () {
      var t = this,
        e = t.$el,
        a = e.grid,
        i = e.gridLines;
      (!i.main && t.initGridLines(),
        a.main.style('visibility', t.hasArcType() ? 'hidden' : null),
        t.hideGridFocus(),
        t.updateGridLines('x'),
        t.updateGridLines('y'));
    },
    updateGridLines: function (t) {
      var e = this,
        a = e.config,
        i = e.$el,
        r = i.gridLines,
        n = i.main,
        o = e.$T,
        s = a.axis_rotated,
        l = t === 'x';
      a['grid_'.concat(t, '_show')] && e['update'.concat(t.toUpperCase(), 'Grid')]();
      var c = n
        .select('.'.concat(ie[''.concat(t, 'gridLines')]))
        .selectAll('.'.concat(ie[''.concat(t, 'gridLine')]))
        .data(a['grid_'.concat(t, '_lines')]);
      o(c.exit()).style('opacity', '0').remove();
      var u = c.enter().append('g');
      (u.append('line').style('opacity', '0'),
        (c = u.merge(c)),
        c.each(function (d) {
          var f = L(this);
          f.select('text').empty() && d.text && f.append('text').style('opacity', '0');
        }),
        o(
          c
            .attr('class', function (d) {
              return ''
                .concat(ie[''.concat(t, 'gridLine')], ' ')
                .concat(d.class || '')
                .trim();
            })
            .select('text')
            .attr('text-anchor', vo)
            .attr('transform', function () {
              return l ? (s ? null : 'rotate(-90)') : s ? 'rotate(-90)' : null;
            })
            .attr('dx', go)
            .attr('dy', -5),
        ).text(function (d) {
          var f;
          return (f = d.text) !== null && f !== void 0 ? f : this.remove();
        }),
        (r[t] = c));
    },
    redrawGrid: function (t) {
      var e = this,
        a = e.config.axis_rotated,
        i = e.state,
        r = i.width,
        n = i.height,
        o = e.$el.gridLines,
        s = e.$T,
        l = e.xv.bind(e),
        c = e.yv.bind(e),
        u = o.x.select('line'),
        d = o.x.select('text'),
        f = o.y.select('line'),
        v = o.y.select('text');
      return (
        (u = s(u, t)
          .attr('x1', a ? 0 : l)
          .attr('x2', a ? r : l)
          .attr('y1', a ? l : 0)
          .attr('y2', a ? l : n)),
        (d = s(d, t)
          .attr('x', fa(!a, r, n))
          .attr('y', l)),
        (f = s(f, t)
          .attr('x1', a ? c : 0)
          .attr('x2', a ? c : r)
          .attr('y1', a ? 0 : c)
          .attr('y2', a ? n : c)),
        (v = s(v, t)
          .attr('x', fa(a, r, n))
          .attr('y', c)),
        [
          u.style('opacity', null),
          d.style('opacity', null),
          f.style('opacity', null),
          v.style('opacity', null),
        ]
      );
    },
    initFocusGrid: function () {
      var t = this,
        e = t.config,
        a = t.state.clip,
        i = t.$el,
        r = e.grid_front,
        n = '.'.concat(r && i.gridLines.main ? ie.gridLines : z.chart).concat(r ? ' + *' : ''),
        o = i.main.insert('g', n).attr('clip-path', a.pathGrid).attr('class', ie.grid);
      if (
        ((i.grid.main = o),
        e.grid_x_show && o.append('g').attr('class', ie.xgrids),
        e.grid_y_show && o.append('g').attr('class', ie.ygrids),
        e.axis_tooltip)
      ) {
        var s = o.append('g').attr('class', 'bb-axis-tooltip');
        (s.append('line').attr('class', 'bb-axis-tooltip-x'),
          s.append('line').attr('class', 'bb-axis-tooltip-y'));
      }
      e.interaction_enabled &&
        e.grid_focus_show &&
        !e.axis_tooltip &&
        (o.append('g').attr('class', J.xgridFocus).append('line').attr('class', J.xgridFocus),
        e.grid_focus_y &&
          !e.tooltip_grouped &&
          o.append('g').attr('class', J.ygridFocus).append('line').attr('class', J.ygridFocus));
    },
    showAxisGridFocus: function () {
      for (
        var t,
          e,
          a = this,
          i = a.config,
          r = a.format,
          n = a.state,
          o = n.event,
          s = n.width,
          l = n.height,
          c = i.axis_rotated,
          u = Te(o, (t = a.$el.eventRect) === null || t === void 0 ? void 0 : t.node()),
          d = u[0],
          f = u[1],
          v = { x: d, y: f },
          g = 0,
          h = Object.entries(a.$el.axisTooltip);
        g < h.length;
        g++
      ) {
        var p = h[g],
          x = p[0],
          _ = p[1],
          m = (x === 'x' && !c) || (x !== 'x' && c) ? 'x' : 'y',
          y = v[m],
          T = (e = a.scale[x]) === null || e === void 0 ? void 0 : e.invert(y);
        T &&
          ((T = x === 'x' && a.axis.isTimeSeries() ? r.xAxisTick(T) : T?.toFixed(2)),
          _?.attr(m, y).text(T));
      }
      a.$el.main
        .selectAll('line.bb-axis-tooltip-x, line.bb-axis-tooltip-y')
        .style('visibility', null)
        .each(function (b, $) {
          var w = L(this);
          $ === 0
            ? w
                .attr('x1', d)
                .attr('x2', d)
                .attr('y1', $ ? 0 : l)
                .attr('y2', $ ? l : 0)
            : w
                .attr('x1', $ ? 0 : s)
                .attr('x2', $ ? s : 0)
                .attr('y1', f)
                .attr('y2', f);
        });
    },
    hideAxisGridFocus: function () {
      var t = this;
      (t.$el.main
        .selectAll('line.'.concat(ue.axisTooltipX, ', line.').concat(ue.axisTooltipY))
        .style('visibility', 'hidden'),
        Object.values(t.$el.axisTooltip).forEach(function (e) {
          return e?.style('display', 'none');
        }));
    },
    showGridFocus: function (t) {
      var e,
        a = this,
        i = a.config,
        r = a.state,
        n = r.width,
        o = r.height,
        s = i.axis_rotated,
        l = a.$el.main.selectAll('line.'.concat(J.xgridFocus, ', line.').concat(J.ygridFocus)),
        c = (t || [l.datum()]).filter(function (f) {
          return f && N(a.getBaseValue(f));
        });
      if (
        !(
          !i.tooltip_show ||
          c.length === 0 ||
          (!i.axis_x_forceAsSingle && a.hasType('bubble')) ||
          a.hasArcType()
        )
      ) {
        var u = i.grid_focus_edge && !i.tooltip_grouped,
          d = a.xx.bind(a);
        (l
          .style('visibility', null)
          .data(c.concat(c))
          .each(function (f) {
            var v = L(this),
              g = { x: d(f), y: a.getYScaleById(f.id)(f.value) },
              h;
            if (v.classed(J.xgridFocus))
              h = s ? [null, g.x, u ? g.y : n, g.x] : [g.x, u ? g.y : null, g.x, o];
            else {
              var p = a.axis.getId(f.id) === 'y2';
              h = s
                ? [g.y, u && !p ? g.x : null, g.y, u && p ? g.x : o]
                : [u && p ? g.x : null, g.y, u && !p ? g.x : n, g.y];
            }
            ['x1', 'y1', 'x2', 'y2'].forEach(function (x, _) {
              return v.attr(x, h[_]);
            });
          }),
          va(l),
          (e = a.showCircleFocus) === null || e === void 0 || e.call(a, t));
      }
    },
    hideGridFocus: function () {
      var t,
        e = this,
        a = e.state,
        i = a.inputType,
        r = a.resizing,
        n = e.$el.main;
      (i === 'mouse' || !r) &&
        (n
          .selectAll('line.'.concat(J.xgridFocus, ', line.').concat(J.ygridFocus))
          .style('visibility', 'hidden'),
        (t = e.hideCircleFocus) === null || t === void 0 || t.call(e));
    },
    updateGridFocus: function () {
      var t,
        e = this,
        a = e.state,
        i = a.inputType,
        r = a.width,
        n = a.height,
        o = a.resizing,
        s = e.$el.grid,
        l = s.main.select('line.'.concat(J.xgridFocus));
      if (i === 'touch')
        l.empty()
          ? o && ((t = e.showCircleFocus) === null || t === void 0 || t.call(e))
          : e.showGridFocus();
      else {
        var c = e.config.axis_rotated;
        l.attr('x1', c ? 0 : -10)
          .attr('x2', c ? r : -10)
          .attr('y1', c ? -10 : 0)
          .attr('y2', c ? -10 : n);
      }
      return !0;
    },
    generateGridData: function (t, e) {
      var a = this,
        i = a.$el.main.select('.'.concat(ue.axisX)).selectAll('.tick').size(),
        r = [];
      if (t === 'year')
        for (
          var n = a.getXDomain(),
            o = n.map(function (u) {
              return u.getFullYear();
            }),
            s = o[0],
            l = o[1],
            c = s;
          c <= l;
          c++
        )
          r.push(new Date(''.concat(c, '-01-01 00:00:00')));
      else
        ((r = e.ticks(10)),
          r.length > i &&
            (r = r.filter(function (u) {
              return String(u).indexOf('.') < 0;
            })));
      return r;
    },
    getGridFilterToRemove: function (t) {
      return t
        ? function (e) {
            var a = !1;
            return (
              (j(t) ? t.concat() : [t]).forEach(function (i) {
                (('value' in i && e.value === i.value) || ('class' in i && e.class === i.class)) &&
                  (a = !0);
              }),
              a
            );
          }
        : function () {
            return !0;
          };
    },
    removeGridLines: function (t, e) {
      var a = this,
        i = a.config,
        r = a.$T,
        n = a.getGridFilterToRemove(t),
        o = function (u) {
          return !n(u);
        },
        s = e ? ie.xgridLines : ie.ygridLines,
        l = e ? ie.xgridLine : ie.ygridLine;
      r(a.$el.main.select('.'.concat(s)).selectAll('.'.concat(l)).filter(n))
        .style('opacity', '0')
        .remove();
      var c = 'grid_'.concat(e ? 'x' : 'y', '_lines');
      i[c] = i[c].filter(o);
    },
  },
  po = {
    initRegion: function () {
      var t = this,
        e = t.$el;
      e.region.main = e.main
        .insert('g', ':first-child')
        .attr('clip-path', t.state.clip.path)
        .attr('class', ft.regions);
    },
    updateRegion: function () {
      var t = this,
        e = t.config,
        a = t.$el.region,
        i = t.$T;
      (a.main || t.initRegion(), a.main.style('visibility', t.hasArcType() ? 'hidden' : null));
      var r = a.main.selectAll('.'.concat(ft.region)).data(e.regions);
      i(r.exit()).style('opacity', '0').remove();
      var n = r.enter().append('g');
      (n.append('rect').style('fill-opacity', '0'),
        (a.list = n.merge(r).attr('class', t.classRegion.bind(t))),
        a.list.each(function (o) {
          var s,
            l = L(this);
          l.select('text').empty() &&
            !((s = o.label) === null || s === void 0) &&
            s.text &&
            L(this).append('text').style('opacity', '0');
        }));
    },
    redrawRegion: function (t) {
      var e = this,
        a = e.$el.region,
        i = e.$T,
        r = e.regionX.bind(e),
        n = e.regionY.bind(e),
        o = ['width', 'height'],
        s = a.list.select('rect'),
        l = a.list.selectAll('text');
      return (
        (s = i(s, t)
          .attr('x', r)
          .attr('y', n)
          .attr('width', e.regionWidth.bind(e))
          .attr('height', e.regionHeight.bind(e))),
        (l = i(l, t)
          .text(function (c) {
            var u;
            return (u = c.label) === null || u === void 0 ? void 0 : u.text;
          })
          .attr('transform', function (c) {
            var u = c.label;
            return u.rotated ? ' rotate(-90)' : null;
          })
          .attr('transform', function (c) {
            var u = this,
              d,
              f = (d = c.label) !== null && d !== void 0 ? d : {},
              v = f.x,
              g = v === void 0 ? 0 : v,
              h = f.y,
              p = h === void 0 ? 0 : h,
              x = f.center,
              _ = x === void 0 ? !1 : x,
              m = f.rotated,
              y = m === void 0 ? !1 : m,
              T = this.previousElementSibling,
              b = { x: 0, y: 0 };
            return (
              H(_) &&
                ['x', 'y'].forEach(function ($, w) {
                  _.indexOf($) > -1 && (b[$] = (+T.getAttribute(o[w]) - fe(u)[o[w]]) / 2);
                }),
              'translate('
                .concat(r(c) + b.x + g, ', ')
                .concat(n(c) + b.y + p, ')')
                .concat(y ? ' rotate(-90)' : '')
            );
          })
          .attr('text-anchor', function (c) {
            var u = c.label;
            return u?.rotated ? 'end' : null;
          })
          .attr('dy', '1em')
          .style('fill', function (c) {
            var u,
              d = c.label;
            return (u = d?.color) !== null && u !== void 0 ? u : null;
          })),
        [
          s
            .style('fill-opacity', function (c) {
              return N(c.opacity) ? c.opacity : null;
            })
            .on('end', function () {
              L(this.parentNode).selectAll('rect:not([x])').remove();
            }),
          l.style('opacity', null),
        ]
      );
    },
    regionX: function (t) {
      return this.getRegionSize('x', t);
    },
    regionY: function (t) {
      return this.getRegionSize('y', t);
    },
    regionWidth: function (t) {
      return this.getRegionSize('width', t);
    },
    regionHeight: function (t) {
      return this.getRegionSize('height', t);
    },
    getRegionSize: function (t, e) {
      var a = this,
        i = a.config,
        r = a.scale,
        n = a.state,
        o = i.axis_rotated,
        s = /(x|y|y2)/.test(t),
        l = s ? t === 'x' : t === 'width',
        c = !s && a[l ? 'regionX' : 'regionY'](e),
        u = s ? 'start' : 'end',
        d = s ? 0 : n[t],
        f;
      if (
        (e.axis === 'y' || e.axis === 'y2'
          ? (!s && !l ? (u = 'start') : s && !l && (u = 'end'),
            (l ? o : !o) && u in e && (f = r[e.axis]))
          : (l ? !o : o) && u in e && (f = r.zoom || r.x),
        f)
      ) {
        var v = 0;
        ((d = e[u]),
          a.axis.isTimeSeries(e.axis)
            ? (d = Ae.call(a, d))
            : /(x|width)/.test(t) &&
              a.axis.isCategorized() &&
              isNaN(d) &&
              ((d = i.axis_x_categories.indexOf(d)),
              (v = a.axis.x.tickOffset() * (u === 'start' ? -1 : 1))),
          (d = f(d) + v));
      }
      return s ? d : d < c ? 0 : d - c;
    },
    isRegionOnX: function (t) {
      return !t.axis || t.axis === 'x';
    },
  },
  xo = {
    getAxisSize: function (t) {
      var e = this,
        a = e.config.axis_rotated;
      return (a && t === 'x') || (!a && /y2?/.test(t))
        ? e.getAxisWidthByAxisId(t, !0)
        : e.getHorizontalAxisHeight(t);
    },
    getAxisWidthByAxisId: function (t, e) {
      var a,
        i,
        r = this;
      if (r.axis) {
        var n = (a = r.axis) === null || a === void 0 ? void 0 : a.getLabelPositionById(t),
          o = r.axis.getMaxTickSize(t, e).width,
          s = o === 0 ? 0.5 : 0;
        return (
          o +
          (((i = r.config.padding) === null || i === void 0 ? void 0 : i.mode) === 'fit'
            ? n.isInner
              ? 10 + s
              : 10
            : n.isInner
              ? 20 + s
              : 40)
        );
      } else return 40;
    },
    getHorizontalAxisHeight: function (t) {
      var e,
        a,
        i = this,
        r = i.config,
        n = i.state,
        o = n.rotatedPadding,
        s = n.isLegendRight,
        l = n.isLegendInset,
        c = r.axis_rotated,
        u = ((e = r.padding) === null || e === void 0 ? void 0 : e.mode) === 'fit',
        d = r['axis_'.concat(t, '_inner')],
        f = r['axis_'.concat(t, '_label')].text,
        v = 13,
        g =
          ((a = r.padding) === null || a === void 0 ? void 0 : a.mode) === 'fit'
            ? d && !f
              ? t === 'y'
                ? 1
                : 0
              : 20
            : 30;
      if (t === 'x' && !r.axis_x_show) return 8;
      if (t === 'x' && P(r.axis_x_height)) return r.axis_x_height;
      if (t === 'y' && !r.axis_y_show) return r.legend_show && !s && !l ? 10 : 1;
      if (t === 'y2' && !r.axis_y2_show) return u ? 0 : o.top;
      var h = i.axis.getMaxTickSize(t),
        p =
          Math.abs(r.axis_x_tick_rotate) > 0 &&
          (!r.axis_x_tick_autorotate || i.needToRotateXAxisTickTexts());
      return (
        (r.axis_x_tick_multiline || p) && h.height > v && (g += h.height - v),
        g + (i.axis.getLabelPositionById(t).isInner ? 0 : 10) + (t === 'y2' && !c ? -10 : 0)
      );
    },
    getEventRectWidth: function () {
      var t = this,
        e = t.config,
        a = t.axis,
        i = e.axis_x_inverted,
        r = a.x.tickInterval();
      return Math.max(0, i ? Math.abs(r) : r);
    },
    getAxisTickRotate: function (t) {
      var e = this,
        a = e.axis,
        i = e.config,
        r = e.state,
        n = e.$el,
        o = i['axis_'.concat(t, '_tick_rotate')];
      if (t === 'x') {
        var s = a.isCategorized() || a.isTimeSeries();
        if (i.axis_x_tick_fit && s) {
          var l = i.axis_x_tick_count,
            c = r.current.maxTickSize.x.ticks.length,
            u = 0;
          if ((l ? (u = l > c ? c : l) : c && (u = c), u !== r.axis.x.tickCount)) {
            var d = e.data.targets;
            r.axis.x.padding = e.getXDomainPadding(
              [e.getXDomainMinMax(d, 'min'), e.getXDomainMinMax(d, 'max')],
              u,
            );
          }
          r.axis.x.tickCount = u;
        }
        n.svg &&
          i.axis_x_tick_autorotate &&
          i.axis_x_tick_fit &&
          !i.axis_x_tick_multiline &&
          !i.axis_x_tick_culling &&
          s &&
          (o = e.needToRotateXAxisTickTexts() ? i.axis_x_tick_rotate : 0);
      }
      return o;
    },
    needToRotateXAxisTickTexts: function () {
      var t = this,
        e = t.state,
        a = e.axis,
        i = e.current,
        r = e.isLegendRight,
        n = e.legendItemWidth,
        o = r && n,
        s =
          i.width -
          o -
          t.getCurrentPaddingByDirection('left') -
          t.getCurrentPaddingByDirection('right'),
        l = a.x.tickCount + a.x.padding.left + a.x.padding.right,
        c = t.axis.getMaxTickSize('x').width,
        u = l ? s / l : 0;
      return c > u;
    },
  },
  _o = {
    axis_x_clipPath: !0,
    axis_x_show: !0,
    axis_x_forceAsSingle: !1,
    axis_x_type: 'indexed',
    axis_x_localtime: !0,
    axis_x_categories: [],
    axis_x_tick_centered: !1,
    axis_x_tick_format: void 0,
    axis_x_tick_culling: {},
    axis_x_tick_culling_max: 10,
    axis_x_tick_culling_lines: !0,
    axis_x_tick_culling_reverse: !1,
    axis_x_tick_count: void 0,
    axis_x_tick_inner: !1,
    axis_x_tick_show: !0,
    axis_x_tick_text_show: !0,
    axis_x_tick_text_inner: !1,
    axis_x_tick_text_position: { x: 0, y: 0 },
    axis_x_tick_fit: !0,
    axis_x_tick_values: null,
    axis_x_tick_autorotate: !1,
    axis_x_tick_rotate: 0,
    axis_x_tick_outer: !0,
    axis_x_tick_multiline: !0,
    axis_x_tick_width: null,
    axis_x_tick_tooltip: !1,
    axis_x_max: void 0,
    axis_x_min: void 0,
    axis_x_inverted: !1,
    axis_x_padding: {},
    axis_x_height: void 0,
    axis_x_extent: void 0,
    axis_x_label: {},
    axis_x_axes: [],
  },
  mo = {
    axis_y_clipPath: !0,
    axis_y_show: !0,
    axis_y_type: 'indexed',
    axis_y_max: void 0,
    axis_y_min: void 0,
    axis_y_inverted: !1,
    axis_y_center: void 0,
    axis_y_inner: !1,
    axis_y_label: {},
    axis_y_tick_format: void 0,
    axis_y_tick_culling: !1,
    axis_y_tick_culling_max: 5,
    axis_y_tick_culling_lines: !0,
    axis_y_tick_culling_reverse: !1,
    axis_y_tick_inner: !1,
    axis_y_tick_outer: !0,
    axis_y_tick_values: null,
    axis_y_tick_rotate: 0,
    axis_y_tick_count: void 0,
    axis_y_tick_show: !0,
    axis_y_tick_stepSize: null,
    axis_y_tick_text_show: !0,
    axis_y_tick_text_position: { x: 0, y: 0 },
    axis_y_tick_time_value: void 0,
    axis_y_padding: {},
    axis_y_default: void 0,
    axis_y_axes: [],
  },
  yo = {
    axis_y2_show: !1,
    axis_y2_type: 'indexed',
    axis_y2_max: void 0,
    axis_y2_min: void 0,
    axis_y2_inverted: !1,
    axis_y2_center: void 0,
    axis_y2_inner: !1,
    axis_y2_label: {},
    axis_y2_tick_format: void 0,
    axis_y2_tick_culling: !1,
    axis_y2_tick_culling_max: 5,
    axis_y2_tick_culling_lines: !0,
    axis_y2_tick_culling_reverse: !1,
    axis_y2_tick_inner: !1,
    axis_y2_tick_outer: !0,
    axis_y2_tick_values: null,
    axis_y2_tick_rotate: 0,
    axis_y2_tick_count: void 0,
    axis_y2_tick_show: !0,
    axis_y2_tick_stepSize: null,
    axis_y2_tick_text_show: !0,
    axis_y2_tick_text_position: { x: 0, y: 0 },
    axis_y2_padding: {},
    axis_y2_default: void 0,
    axis_y2_axes: [],
  },
  bo = F(F(F({ axis_evalTextSize: !0, axis_rotated: !1, axis_tooltip: !1 }, _o), mo), yo),
  To = {
    grid_x_show: !1,
    grid_x_type: 'tick',
    grid_x_lines: [],
    grid_y_show: !1,
    grid_y_lines: [],
    grid_y_ticks: void 0,
    grid_focus_edge: !1,
    grid_focus_show: !0,
    grid_focus_y: !1,
    grid_front: !1,
    grid_lines_front: !0,
  },
  $o = {
    data_xs: {},
    data_xFormat: '%Y-%m-%d',
    data_xLocaltime: !0,
    data_xSort: !0,
    data_axes: {},
    data_regions: {},
    data_stack_normalize: !1,
  },
  Ao = [Jn, Qn, eo, to, ao, io, ro],
  ii = { axis: so, clip: fo, eventrect: co, flow: uo, grid: ho, region: po, sizeAxis: xo },
  ri = { optDataAxis: $o, optAxis: bo, optGrid: To },
  wo = 15,
  ga = 20,
  ha = 0.35;
function Ro(t) {
  t === void 0 && (t = !1);
  var e = this;
  return ['donut', 'pie', 'polar', 'gauge'].find(function (a) {
    return e.hasType(a) && !(a === 'gauge' && t && e.hasMultiArcGauge());
  });
}
function ni() {
  var t = this,
    e = t.config,
    a = Ro.call(t, !0),
    i = a && e[''.concat(a, '_label_line')],
    r = ye(i),
    n = function (l, c, u) {
      return u;
    },
    o = { show: i === !0 || (r && i?.show !== !1), distance: (r && i?.distance) || ga };
  if (i === !0) return { chartType: a, line: o, text: { formatter: n } };
  if (!r) return { chartType: a, line: { show: !1, distance: ga }, text: { formatter: null } };
  var s = n;
  return (
    I(i.text) ? (s = i.text) : i.text === !1 && (s = null),
    { chartType: a, line: o, text: { formatter: s } }
  );
}
function So(t, e) {
  var a = this,
    i = a.state,
    r = a.updateAngle(t);
  if (!r) return null;
  var n = a.getRadius(t).outerRadius,
    o = n;
  a.hasType('polar') && ((o = a.getPolarOuterRadius(t, n)), (n = i.radius));
  var s = (r.startAngle + r.endAngle) / 2,
    l = Math.abs(r.endAngle - r.startAngle - 2 * Math.PI) < 0.01;
  l && (s = Math.PI / 2);
  var c = Math.sin(s),
    u = -Math.cos(s),
    d = { x: c * o, y: u * o },
    f = n + wo,
    v = { x: c * f, y: u * f },
    g = c >= 0,
    h = { x: v.x + e * (g ? 1 : -1), y: v.y };
  return { startPoint: d, breakPoint: v, endPoint: h, isRight: g, midAngle: s };
}
function pa() {
  return ni.call(this).line.show;
}
function Co(t) {
  var e = this,
    a = e.$el.arcs,
    i = e.$T,
    r = ni.call(e),
    n = r.line,
    o = r.text,
    s = n.distance,
    l = null;
  a.selectAll('.'.concat(V.chartArc)).each(function (c) {
    var u,
      d,
      f,
      v = L(this),
      g = So.call(e, c, s),
      h = (u = c._cache) !== null && u !== void 0 ? u : {},
      p = h.ratio,
      x = h.meetsThreshold,
      _ = h.updated;
    if (!(!_ || !g)) {
      var m = e.isTargetToShow(c.data.id) && x,
        y = g.startPoint,
        T = g.breakPoint,
        b = g.endPoint,
        $ = g.isRight,
        w = ''
          .concat(y.x, ',')
          .concat(y.y, ' ')
          .concat(T.x, ',')
          .concat(T.y, ' ')
          .concat(b.x, ',')
          .concat(b.y);
      if (n.show) {
        var A = v.select('.'.concat(V.arcLabelLine));
        (A.empty() && (A = v.append('polyline').attr('class', V.arcLabelLine)),
          i(A, t)
            .attr('points', w)
            .style('stroke', e.color(c.data))
            .style('opacity', m ? null : '0'));
      }
      var R = v.select('.'.concat(V.arcLabelLineText));
      if (
        (R.empty() &&
          (R = v.append('text').attr('class', V.arcLabelLineText).style('pointer-events', 'none')),
        m)
      ) {
        var C = _.value,
          S = c.data.id,
          M = (
            (f = (d = o.formatter) !== null && d !== void 0 ? d : e.getArcLabelConfig('format')) !==
              null && f !== void 0
              ? f
              : e.defaultArcValueFormat
          )(C, p, S).toString();
        at(R, M, [-1, 1], !1);
        var k = { x: b.x + 5 * ($ ? 1 : -1), y: b.y };
        R.style('text-anchor', $ ? 'start' : 'end');
        var Z = R.node(),
          G = Z?.querySelectorAll('tspan');
        if (
          (l === null && (l = parseFloat(X.getComputedStyle(Z).fontSize) || 12), G && G.length > 1)
        ) {
          var O = G.length,
            B = (O - 3) / 2;
          k.y += (-B + ha) * l;
        } else k.y += ha * l;
        i(R, t)
          .attr('transform', 'translate('.concat(k.x, ',').concat(k.y, ')'))
          .style('opacity', null)
          .style('fill', e.updateTextColor.bind(e)(c));
      } else i(R, t).style('opacity', '0');
    }
  });
}
function Lo(t) {
  return ['donut', 'pie', 'polar', 'gauge'].find(function (e) {
    return t.hasType(e);
  });
}
function Eo(t, e, a, i) {
  var r,
    n,
    o = t.config,
    s = t.state.radiusExpanded,
    l = a.endAngle - Math.PI / 2,
    c = Math.sin(l),
    u = { x: Math.cos(l) * (s + (i ? 5 : 25)), y: c * (s + 15 - Math.abs(c * 10)) + 3 };
  if (i) {
    var d = o.arc_rangeText_position;
    if (d) {
      var f = o.arc_rangeText_values,
        v = I(d) ? d(f[e.index]) : d;
      ((u.x += (r = v?.x) !== null && r !== void 0 ? r : 0),
        (u.y += (n = v?.y) !== null && n !== void 0 ? n : 0));
    }
  }
  return u;
}
function ko(t, e, a, i) {
  var r = t.config,
    n = Lo(t),
    o = n ? r[''.concat(n, '_label_ratio')] : void 0;
  if (o) o = I(o) ? o.bind(t.api)(e, a, i) : o;
  else {
    var s = 36,
      l = 0.375,
      c = 1.175,
      u = 0.8,
      d = s / a,
      f = d > l;
    o = a && i ? ((f ? c - d : u) * a) / i : 0;
  }
  return o;
}
function Io(t, e, a) {
  var i = t.getRadius(e).outerRadius;
  t.hasType('polar') && (i = t.getPolarOuterRadius(e, i));
  var r = t.svgArc.centroid(a).map(function (c) {
      return isNaN(c) ? 0 : c;
    }),
    n = r[0],
    o = r[1],
    s = Math.sqrt(n * n + o * o),
    l = ko(t, e, i, s);
  return { pos: { x: n, y: o }, ratio: l };
}
function xa(t) {
  t === void 0 && (t = 0);
  var e = this,
    a = e.config,
    i = e.state,
    r = e.hasMultiArcGauge(),
    n = i.gaugeArcWidth / e.filterTargetsToShow(e.data.targets).length,
    o = t ? Math.min(i.radiusExpanded * t - i.radius, n * 0.8 - (1 - t) * 100) : 0;
  return {
    inner: function (s) {
      var l = e.getRadius(s).innerRadius;
      return r ? i.radius - n * (s.index + 1) : P(l) ? l : 0;
    },
    outer: function (s) {
      var l = e.getRadius(s).outerRadius,
        c;
      if (r) c = i.radius - n * s.index + o;
      else if (e.hasType('polar') && !t) c = e.getPolarOuterRadius(s, l);
      else if (((c = l), t)) {
        var u = i.radiusExpanded;
        (i.radius !== l && (u -= Math.abs(i.radius - l)), (c = u * t));
      }
      return c;
    },
    corner: function (s, l) {
      var c = a.arc_cornerRadius_ratio,
        u = c === void 0 ? 0 : c,
        d = a.arc_cornerRadius,
        f = d === void 0 ? 0 : d,
        v = s.data.id,
        g = s.value,
        h = 0;
      return (u ? (h = u * l) : (h = P(f) ? f : f.call(e.api, v, g, l)), h);
    },
  };
}
function It(t) {
  return function (e) {
    var a = function (r) {
        var n = r.startAngle,
          o = n === void 0 ? 0 : n,
          s = r.endAngle,
          l = s === void 0 ? 0 : s,
          c = r.padAngle,
          u = c === void 0 ? 0 : c;
        return { startAngle: o, endAngle: l, padAngle: u };
      },
      i = Aa(a(this._current), a(e));
    return (
      (this._current = e),
      function (r) {
        var n = i(r),
          o = e.data,
          s = e.index,
          l = e.value;
        return t(F(F({}, n), { data: o, index: s, value: l }));
      }
    );
  };
}
var Oo = {
    initPie: function () {
      var t = this,
        e = t.config,
        a = e.data_type,
        i = e[''.concat(a, '_padding')],
        r = e[''.concat(a, '_startingAngle')] || 0,
        n = (i ? i * 0.01 : e[''.concat(a, '_padAngle')]) || 0;
      t.pie = Gi()
        .startAngle(r)
        .endAngle(r + 2 * Math.PI)
        .padAngle(n)
        .value(function (o) {
          var s, l;
          return (l =
            (s = o.values) === null || s === void 0
              ? void 0
              : s.reduce(function (c, u) {
                  return c + u.value;
                }, 0)) !== null && l !== void 0
            ? l
            : o;
        })
        .sort(t.getSortCompareFn.bind(t)(!0));
    },
    updateRadius: function () {
      var t = this,
        e = t.config,
        a = t.state,
        i = e.data_type,
        r = e[''.concat(i, '_padding')],
        n = e.gauge_width || e.donut_width,
        o = t.filterTargetsToShow(t.data.targets).length * e.gauge_arcs_minWidth,
        s = 0.85,
        l = pa.call(t) ? s : 1;
      ((a.radiusExpanded =
        (Math.min(a.arcWidth, a.arcHeight) / 2) *
        (t.hasMultiArcGauge() && e.gauge_label_show ? s : l)),
        (a.radius = a.radiusExpanded * 0.95),
        (a.innerRadiusRatio = n ? (a.radius - n) / a.radius : 0.6),
        (a.gaugeArcWidth =
          n ||
          (o <= a.radius - a.innerRadius
            ? a.radius - a.innerRadius
            : o <= a.radius
              ? o
              : a.radius)));
      var c = e.pie_innerRadius || (r ? r * (a.innerRadiusRatio + 0.1) : 0);
      ((a.outerRadius = e.pie_outerRadius),
        (a.innerRadius =
          t.hasType('donut') || t.hasType('gauge') ? a.radius * a.innerRadiusRatio : c));
    },
    getRadius: function (t) {
      var e = this,
        a = t?.data,
        i = e.state,
        r = i.innerRadius,
        n = i.outerRadius;
      return (
        !P(r) && a && (r = r[a.id] || 0),
        W(n) && a && a.id in n ? (n = n[a.id]) : P(n) || (n = e.state.radius),
        { innerRadius: r, outerRadius: n }
      );
    },
    updateArc: function () {
      var t = this;
      (t.updateRadius(), (t.svgArc = t.getSvgArc()), (t.svgArcExpanded = t.getSvgArcExpanded()));
    },
    getArcLength: function () {
      var t = this,
        e = t.config,
        a = e.gauge_arcLength * 3.6,
        i = 2 * (a / 360);
      return (a < -360 ? (i = -2) : a > 360 && (i = 2), i * Math.PI);
    },
    getStartingAngle: function () {
      var t = this,
        e = t.config,
        a = e.data_type,
        i = t.hasType('gauge') ? e.gauge_fullCircle : !1,
        r = (-1 * Math.PI) / 2,
        n = Math.PI / 2,
        o = e[''.concat(a, '_startingAngle')] || 0;
      return (
        !i && o <= r
          ? (o = r)
          : !i && o >= n
            ? (o = n)
            : (o > Math.PI || o < -1 * Math.PI) && (o = Math.PI),
        o
      );
    },
    updateAngle: function (t, e) {
      var a;
      e === void 0 && (e = !1);
      var i = this,
        r = i.config,
        n = i.state,
        o = e && i.hasType('gauge'),
        s = i.pie,
        l = t,
        c = !1;
      if (!r) return null;
      var u = i.getStartingAngle(),
        d = r.gauge_fullCircle || (e && !o) ? i.getArcLength() : u * -2;
      if (l.data && i.isGaugeType(l.data) && !i.hasMultiArcGauge()) {
        var f = r.gauge_min,
          v = r.gauge_max,
          g = i.getTotalDataSum(n.rendered),
          h = d * ((g - f) / (v - f));
        s = s.startAngle(u).endAngle(h + u);
      }
      if (
        (e === !1 &&
          s(i.filterTargetsToShow()).forEach(function (y, T) {
            var b;
            !c &&
              y.data.id === ((b = l.data) === null || b === void 0 ? void 0 : b.id) &&
              ((c = !0), (l = y), (l.index = T));
          }),
        isNaN(l.startAngle) && (l.startAngle = 0),
        isNaN(l.endAngle) && (l.endAngle = l.startAngle),
        e || (l.data && (r.gauge_enforceMinMax || i.hasMultiArcGauge())))
      ) {
        var f = r.gauge_min,
          v = r.gauge_max,
          p = e && !o ? i.getTotalDataSum(n.rendered) : v,
          x = d / (p - f),
          _ = (a = l.value) !== null && a !== void 0 ? a : 0,
          m = _ < f ? 0 : _ < p ? _ - f : p - f;
        ((l.startAngle = u), (l.endAngle = u + x * m));
      }
      return c || e ? l : null;
    },
    getSvgArc: function () {
      var t = this,
        e = xa.call(t),
        a = e.inner,
        i = e.outer,
        r = e.corner,
        n = Zt().innerRadius(a).outerRadius(i),
        o = function (s, l) {
          var c,
            u = 'M 0 0';
          if (s.value || s.data) {
            var d = l ? s : (c = t.updateAngle(s)) !== null && c !== void 0 ? c : null;
            d && (u = n.cornerRadius(r(d, i(d)))(d));
          }
          return u;
        };
      return ((o.centroid = n.centroid), o);
    },
    getSvgArcExpanded: function (t) {
      t === void 0 && (t = 1);
      var e = this,
        a = xa.call(e, t),
        i = a.inner,
        r = a.outer,
        n = a.corner,
        o = Zt().innerRadius(i).outerRadius(r);
      return function (s) {
        var l = e.updateAngle(s),
          c = r(l),
          u = 0;
        return (l && (u = n(l, c)), l ? o.cornerRadius(u)(l) : 'M 0 0');
      };
    },
    getArc: function (t, e, a) {
      return a || this.isArcType(t.data) ? this.svgArc(t, e) : 'M 0 0';
    },
    redrawArcRangeText: function () {
      var t = this,
        e = t.config,
        a = t.$el.arcs,
        i = t.state,
        r = t.$T,
        n = e.arc_rangeText_format,
        o = t.hasType('gauge') && e.arc_rangeText_fixed,
        s = e.arc_rangeText_values;
      if (s?.length) {
        var l = e.arc_rangeText_unit === '%',
          c = t.getTotalDataSum(i.rendered);
        l &&
          (s = s.map(function (f) {
            return (c / 100) * f;
          }));
        var u = t.pie(s).map(function (f, v) {
            return ((f.index = v), f);
          }),
          d = a.selectAll('.'.concat(V.arcRange)).data(s);
        (d.exit(),
          (d = r(
            d
              .enter()
              .append('text')
              .attr('class', V.arcRange)
              .style('text-anchor', 'middle')
              .style('pointer-events', 'none')
              .style('opacity', '0')
              .text(function (f) {
                var v = l ? (f / c) * 100 : f;
                return I(n) ? n(v) : ''.concat(v).concat(l ? '%' : '');
              })
              .merge(d),
          )),
          (!i.rendered || (i.rendered && !o)) &&
            c > 0 &&
            d.attr('transform', function (f, v) {
              return t.transformForArcLabel(this, u[v], !0);
            }),
          d.style('opacity', function (f) {
            return !o && (f > c || c === 0) ? '0' : null;
          }));
      }
    },
    transformForArcLabel: function (t, e, a) {
      a === void 0 && (a = !1);
      var i = this,
        r = i.updateAngle(e, a);
      if (!r) return '';
      var n,
        o = 1;
      if (a || i.hasMultiArcGauge()) n = Eo(i, e, r, a);
      else if (!i.hasType('gauge') || i.data.targets.length > 1) {
        var s = Io(i, e, r);
        ((n = s.pos), (o = s.ratio));
      } else return '';
      return (Za.call(i, t, n), 'translate('.concat(n.x * o, ',').concat(n.y * o, ')'));
    },
    convertToArcData: function (t) {
      return this.addName({
        id: 'data' in t ? t.data.id : t.id,
        value: t.value,
        ratio: this.getRatio('arc', t),
        index: t.index,
      });
    },
    textForArcLabel: function (t) {
      var e,
        a = this,
        i = a.hasType('gauge'),
        r =
          (e = ['donut', 'gauge', 'pie', 'polar'].filter(a.hasType.bind(a))) === null ||
          e === void 0
            ? void 0
            : e[0];
      a.shouldShowArcLabel() &&
        t
          .style('fill', a.updateTextColor.bind(a))
          .attr('filter', function (n) {
            return a.updateTextBGColor.bind(a)(n, a.config.data_labels_backgroundColors);
          })
          .each(function (n) {
            var o = L(this),
              s = a.updateAngle(n),
              l = a.getRatio('arc', s),
              c = Ht.call(a, l, r);
            if (((n._cache = { updated: s, ratio: l, meetsThreshold: c }), c)) {
              var u = (s || n).value,
                d = (a.getArcLabelConfig('format') || a.defaultArcValueFormat)(
                  u,
                  l,
                  n.data.id,
                ).toString();
              at(o, d, [-1, 1], i);
            } else o.text('');
          });
    },
    expandArc: function (t) {
      var e = this,
        a = e.state.transiting,
        i = e.$el;
      if (a) {
        var r = setInterval(function () {
          a ||
            (clearInterval(r),
            i.legend.selectAll('.'.concat(J.legendItemFocused)).size() > 0 && e.expandArc(t));
        }, 10);
        return;
      }
      var n = e.mapToTargetIds(t);
      i.svg.selectAll(e.selectorTargets(n, '.'.concat(V.chartArc))).each(function (o) {
        if (e.shouldExpand(o.data.id)) {
          var s = e.getExpandConfig(o.data.id, 'duration'),
            l = e.getSvgArcExpanded(e.getExpandConfig(o.data.id, 'rate'));
          L(this)
            .selectAll('path')
            .transition()
            .duration(s)
            .attrTween('d', It(e.svgArcExpanded.bind(e)))
            .transition()
            .duration(s * 2)
            .attrTween('d', It(l.bind(e)));
        }
      });
    },
    unexpandArc: function (t) {
      var e = this,
        a = e.state.transiting,
        i = e.$el.svg;
      if (!a) {
        var r = e.mapToTargetIds(t);
        (i
          .selectAll(e.selectorTargets(r, '.'.concat(V.chartArc)))
          .selectAll('path')
          .transition()
          .duration(function (n) {
            return e.getExpandConfig(n.data.id, 'duration');
          })
          .attrTween('d', It(e.svgArc.bind(e))),
          i.selectAll(''.concat(V.arc)).style('opacity', null));
      }
    },
    getExpandConfig: function (t, e) {
      var a = this,
        i = a.config,
        r = { duration: 50, rate: 0.98 },
        n;
      return (
        a.isDonutType(t)
          ? (n = 'donut')
          : a.isGaugeType(t)
            ? (n = 'gauge')
            : a.isPieType(t) && (n = 'pie'),
        n ? i[''.concat(n, '_expand_').concat(e)] : r[e]
      );
    },
    shouldExpand: function (t) {
      var e = this,
        a = e.config;
      return (
        (e.isDonutType(t) && a.donut_expand) ||
        (e.isGaugeType(t) && a.gauge_expand) ||
        (e.isPieType(t) && a.pie_expand)
      );
    },
    shouldShowArcLabel: function () {
      var t = this,
        e = t.config;
      return ['donut', 'gauge', 'pie', 'polar'].some(function (a) {
        return t.hasType(a) && e[''.concat(a, '_label_show')];
      });
    },
    getArcLabelConfig: function (t) {
      t === void 0 && (t = 'format');
      var e = this,
        a = e.config,
        i = function (r) {
          return r;
        };
      return (
        ['donut', 'gauge', 'pie', 'polar'].filter(e.hasType.bind(e)).forEach(function (r) {
          i = a[''.concat(r, '_label_').concat(t)];
        }),
        t === 'format' && I(i) ? i.bind(e.api) : i
      );
    },
    updateTargetsForArc: function (t) {
      var e = this,
        a = e.$el,
        i = e.hasType('gauge'),
        r = e.getChartClass('Arc'),
        n = e.getClass('arcs', !0),
        o = e.classFocus.bind(e),
        s = a.main.select('.'.concat(V.chartArcs)),
        l = s
          .selectAll('.'.concat(V.chartArc))
          .data(e.pie(t))
          .attr('class', function (u) {
            return r(u) + o(u.data);
          }),
        c = l
          .enter()
          .append('g')
          .attr('class', r)
          .call(
            this.setCssRule(!1, '.'.concat(V.chartArcs, ' text'), [
              'pointer-events:none',
              'text-anchor:middle',
            ]),
          );
      (c.append('g').attr('class', n).merge(l),
        c
          .append('text')
          .attr('dy', i && !e.hasMultiTargets() ? '-.1em' : null)
          .style('opacity', '0')
          .style('text-anchor', e.getStylePropValue('middle'))
          .style('pointer-events', e.getStylePropValue('none')),
        (a.text = s.selectAll('.'.concat(z.target, ' text'))));
    },
    initArc: function () {
      var t = this,
        e = t.$el;
      ((e.arcs = e.main
        .select('.'.concat(z.chart))
        .append('g')
        .attr('class', V.chartArcs)
        .attr('transform', t.getTranslate('arc'))),
        t.setArcTitle());
    },
    setArcTitle: function (t) {
      var e = this,
        a = t || e.getArcTitle(),
        i = e.hasType('gauge');
      if (a) {
        var r = i ? me.chartArcsGaugeTitle : V.chartArcsTitle,
          n = e.$el.arcs.select('.'.concat(r));
        (n.empty() &&
          (n = e.$el.arcs.append('text').attr('class', r).style('text-anchor', 'middle')),
          i && n.attr('dy', '-0.3em'),
          at(n, a, i ? void 0 : [-0.6, 1.35], !0));
      }
    },
    getArcTitle: function () {
      var t = this,
        e = (t.hasType('donut') && 'donut') || (t.hasType('gauge') && 'gauge');
      return e ? t.config[''.concat(e, '_title')] : '';
    },
    getArcTitleWithNeedleValue: function () {
      var t = this,
        e = t.config,
        a = t.state,
        i = t.getArcTitle();
      if (i && t.config.arc_needle_show && /{=[A-Z_]+}/.test(i)) {
        var r = a.current.needle;
        return (P(r) || (r = e.arc_needle_value), vt(i, { NEEDLE_VALUE: ~~r }));
      }
      return !1;
    },
    redrawArc: function (t, e, a) {
      var i = this,
        r = i.config,
        n = i.state,
        o = i.$el.main,
        s = r.interaction_enabled,
        l = s && r.data_selection_isselectable,
        c = o.selectAll('.'.concat(V.arcs)).selectAll('.'.concat(V.arc)).data(i.arcData.bind(i));
      (c.exit().transition().duration(e).style('opacity', '0').remove(),
        (c = c
          .enter()
          .append('path')
          .attr('class', i.getClass('arc', !0))
          .style('fill', function (u) {
            return i.color(u.data);
          })
          .style('cursor', function (u) {
            var d;
            return !((d = l?.bind) === null || d === void 0) && d.call(l, i.api)(u)
              ? 'pointer'
              : null;
          })
          .style('opacity', '0')
          .each(function (u) {
            (i.isGaugeType(u.data) &&
              ((u.startAngle = r.gauge_startingAngle), (u.endAngle = r.gauge_startingAngle)),
              (this._current = u));
          })
          .merge(c)),
        i.hasType('gauge') && (i.updateGaugeMax(), i.hasMultiArcGauge() && i.redrawArcGaugeLine()),
        c
          .attr('transform', function (u) {
            return !i.isGaugeType(u.data) && a ? 'scale(0)' : '';
          })
          .style('opacity', function (u) {
            return u === this._current ? '0' : null;
          })
          .each(function () {
            n.transiting = !0;
          })
          .transition()
          .duration(t)
          .attrTween('d', function (u) {
            var d = i.updateAngle(u);
            if (!d)
              return function () {
                return 'M 0 0';
              };
            (isNaN(this._current.startAngle) && (this._current.startAngle = 0),
              isNaN(this._current.endAngle) && (this._current.endAngle = this._current.startAngle));
            var f = Aa(this._current, d);
            return (
              (this._current = f(0)),
              function (v) {
                var g = f(v);
                return ((g.data = u.data), i.getArc(g, !0));
              }
            );
          })
          .attr('transform', a ? 'scale(1)' : '')
          .style('fill', function (u) {
            var d;
            return (
              i.levelColor
                ? ((d = i.levelColor(u.data.values[0].value)), (r.data_colors[u.data.id] = d))
                : (d = i.color(u.data)),
              d
            );
          })
          .style('opacity', null)
          .call(bt, function () {
            if (i.levelColor) {
              var u = L(this),
                d = u.datum(this._current);
              i.updateLegendItemColor(d.data.id, u.style('fill'));
            }
            ((n.transiting = !1), Q(r.onrendered, i.api));
          }),
        s && i.bindArcEvent(c),
        i.hasType('polar') && i.redrawPolar(),
        i.hasType('gauge') && i.redrawBackgroundArcs(),
        r.arc_needle_show && i.redrawNeedle(),
        i.redrawArcText(t),
        i.redrawArcRangeText());
    },
    redrawNeedle: function () {
      var t = this,
        e = t.$el,
        a = t.config,
        i = t.state,
        r = i.hiddenTargetIds,
        n = i.radius,
        o = ((n - 1) / 100) * a.arc_needle_length,
        s = r.length !== t.data.targets.length,
        l = t.$el.arcs.select('.'.concat(V.needle)),
        c = a.arc_needle_path,
        u = a.arc_needle_bottom_width / 2,
        d = a.arc_needle_top_width / 2,
        f = a.arc_needle_top_rx,
        v = a.arc_needle_top_ry,
        g = a.arc_needle_bottom_len,
        h = a.arc_needle_bottom_rx,
        p = a.arc_needle_bottom_ry,
        x = t.getNeedleAngle(),
        _ = function () {
          var y = t.getArcTitleWithNeedleValue();
          y && t.setArcTitle(y);
        };
      if (
        (_(),
        l.empty() &&
          ((l = e.arcs.append('path').classed(V.needle, !0)),
          (e.needle = l),
          (e.needle.updateHelper = function (y, T) {
            (T === void 0 && (T = !1),
              e.needle.style('display') !== 'none' &&
                t
                  .$T(e.needle)
                  .style('transform', 'rotate('.concat(t.getNeedleAngle(y), 'deg)'))
                  .call(bt, function () {
                    (T && (a.arc_needle_value = y), _());
                  }));
          })),
        s)
      ) {
        var m = I(c)
          ? c.call(t, o)
          : 'M-'
              .concat(u, ' ')
              .concat(g, ' A')
              .concat(h, ' ')
              .concat(p, ' 0 0 0 ')
              .concat(u, ' ')
              .concat(g, ' L')
              .concat(d, ' -')
              .concat(o, ' A')
              .concat(f, ' ')
              .concat(v, ' 0 0 0 -')
              .concat(d, ' -')
              .concat(o, ' L-')
              .concat(u, ' ')
              .concat(g, ' Z');
        t.$T(l)
          .attr('d', m)
          .style('fill', a.arc_needle_color)
          .style('display', null)
          .style('transform', 'rotate('.concat(x, 'deg)'));
      } else l.style('display', 'none');
    },
    getNeedleAngle: function (t) {
      var e = this,
        a = e.config,
        i = e.state,
        r = e.getArcLength(),
        n = e.hasType('gauge'),
        o = e.getTotalDataSum(!0),
        s = q(t) ? t : a.arc_needle_value,
        l = a[''.concat(a.data_type, '_startingAngle')] || 0,
        c = 0;
      if ((P(s) || (s = n && e.data.targets.length === 1 ? o : 0), (i.current.needle = s), n)) {
        l = e.getStartingAngle();
        var u = a.gauge_fullCircle ? r : l * -2,
          d = a.gauge_min,
          f = a.gauge_max;
        c = u * ((s - d) / (f - d));
      } else c = r * (s / o);
      return (l + c) * (180 / Math.PI);
    },
    redrawBackgroundArcs: function () {
      var t = this,
        e = t.config,
        a = t.state,
        i = t.hasMultiArcGauge(),
        r = e.gauge_fullCircle,
        n = t.filterTargetsToShow(t.data.targets).length === 0 && !!e.data_empty_label_text,
        o = t.getStartingAngle(),
        s = r ? o + t.getArcLength() : o * -1,
        l = t.$el.arcs.select(''.concat(i ? 'g' : '', '.').concat(V.chartArcsBackground));
      if (i) {
        var c = 0;
        ((l = l.selectAll('path.'.concat(V.chartArcsBackground)).data(t.data.targets)),
          l
            .enter()
            .append('path')
            .attr('class', function (u, d) {
              return ''
                .concat(V.chartArcsBackground, ' ')
                .concat(V.chartArcsBackground, '-')
                .concat(d);
            })
            .merge(l)
            .style('fill', e.gauge_background || null)
            .attr('d', function (u) {
              var d = u.id;
              if (n || a.hiddenTargetIds.indexOf(d) >= 0) return 'M 0 0';
              var f = { data: [{ value: e.gauge_max }], startAngle: o, endAngle: s, index: c++ };
              return t.getArc(f, !0, !0);
            }),
          l.exit().remove());
      } else
        l.attr(
          'd',
          n
            ? 'M 0 0'
            : function () {
                var u = { data: [{ value: e.gauge_max }], startAngle: o, endAngle: s };
                return t.getArc(u, !0, !0);
              },
        );
    },
    bindArcEvent: function (t) {
      var e = this,
        a = e.config,
        i = e.state,
        r = i.inputType === 'touch',
        n = i.inputType === 'mouse';
      function o(c, u, d) {
        (e.expandArc(d), e.api.focus(d), e.toggleFocusLegend(d, !0), e.showTooltip([u], c));
      }
      function s(c) {
        var u = void 0;
        (e.unexpandArc(u), e.api.revert(), e.revertLegend(), e.hideTooltip());
      }
      if (
        (t.on('click', function (c, u, d) {
          var f,
            v = e.updateAngle(u),
            g;
          v &&
            ((g = e.convertToArcData(v)),
            (f = e.toggleShape) === null || f === void 0 || f.call(e, this, g, d),
            a.data_onclick.bind(e.api)(g, this));
        }),
        n &&
          t
            .on('mouseover', function (c, u) {
              if (!i.transiting) {
                i.event = c;
                var d = e.updateAngle(u),
                  f = d ? e.convertToArcData(d) : null,
                  v = f?.id || void 0;
                (o(this, f, v), e.setOverOut(!0, f));
              }
            })
            .on('mouseout', function (c, u) {
              if (!(i.transiting || !a.interaction_onout)) {
                i.event = c;
                var d = e.updateAngle(u),
                  f = d ? e.convertToArcData(d) : null;
                (s(), e.setOverOut(!1, f));
              }
            })
            .on('mousemove', function (c, u) {
              var d = e.updateAngle(u),
                f = d ? e.convertToArcData(d) : null;
              ((i.event = c), e.showTooltip([f], this));
            }),
        r && e.hasArcType() && !e.radars)
      ) {
        var l = function (c) {
          var u,
            d,
            f =
              (d = (u = c.changedTouches) === null || u === void 0 ? void 0 : u[0]) !== null &&
              d !== void 0
                ? d
                : { clientX: 0, clientY: 0 },
            v = f.clientX,
            g = f.clientY,
            h = L(te.elementFromPoint(v, g));
          return h;
        };
        e.$el.svg.on(
          'touchstart touchmove',
          function (c) {
            if (!i.transiting) {
              i.event = c;
              var u = l(c),
                d = u.datum(),
                f = d?.data && d.data.id ? e.updateAngle(d) : null,
                v = f ? e.convertToArcData(f) : null,
                g = v?.id || void 0;
              (e.callOverOutForTouch(v), se(g) ? s() : o(this, v, g));
            }
          },
          { passive: !0 },
        );
      }
    },
    redrawArcText: function (t) {
      var e = this,
        a = e.config,
        i = e.state,
        r = e.$el,
        n = r.main,
        o = r.arcs,
        s = e.hasType('gauge'),
        l = e.hasMultiArcGauge(),
        c;
      if (
        ((s && e.data.targets.length === 1 && a.gauge_title) ||
          ((c = n
            .selectAll('.'.concat(V.chartArc))
            .select('text')
            .style('opacity', '0')
            .attr('class', function (d) {
              return e.isGaugeType(d.data) ? me.gaugeValue : null;
            })
            .call(e.textForArcLabel.bind(e))
            .style('font-size', function (d) {
              return e.isGaugeType(d.data) && e.data.targets.length === 1 && !l
                ? ''.concat(Math.round(i.radius / 5), 'px')
                : null;
            })),
          ja.call(e),
          c
            .attr('transform', function (d) {
              return e.transformForArcLabel.bind(e)(this, d);
            })
            .transition()
            .duration(t)
            .style('opacity', function (d) {
              return e.isTargetToShow(d.data.id) && e.isArcType(d.data) ? null : '0';
            }),
          l && c.attr('dy', '-.1em')),
        n
          .select('.'.concat(V.chartArcsTitle))
          .style('opacity', e.hasType('donut') || s ? null : '0'),
        s)
      ) {
        var u = a.gauge_fullCircle;
        (u && c?.attr('dy', ''.concat(l ? 0 : Math.round(i.radius / 14))),
          a.gauge_label_show &&
            (o
              .select('.'.concat(me.chartArcsGaugeUnit))
              .attr('dy', ''.concat(u ? 1.5 : 0.75, 'em'))
              .text(a.gauge_units),
            o
              .select('.'.concat(me.chartArcsGaugeMin))
              .attr(
                'dx',
                ''.concat(-1 * (i.innerRadius + (i.radius - i.innerRadius) / (u ? 1 : 2)), 'px'),
              )
              .attr('dy', '1.2em')
              .text(e.textForGaugeMinMax(a.gauge_min, !1)),
            !u &&
              o
                .select('.'.concat(me.chartArcsGaugeMax))
                .attr('dx', ''.concat(i.innerRadius + (i.radius - i.innerRadius) / 2, 'px'))
                .attr('dy', '1.2em')
                .text(e.textForGaugeMinMax(a.gauge_max, !0))));
      }
      pa.call(e) && Co.call(e, t);
    },
    getArcElementByIdOrIndex: function (t) {
      var e = this,
        a = e.$el.arcs,
        i = P(t)
          ? function (r) {
              return r.index === t;
            }
          : function (r) {
              return r.data.id === t;
            };
      return a?.selectAll('.'.concat(z.target, ' path')).filter(i);
    },
  },
  ot = {
    initArea: function (t) {
      var e = this,
        a = e.config;
      t.insert('g', '.'.concat(a.area_front ? he.circles : Ie.lines)).attr(
        'class',
        e.getClass('areas', !0),
      );
    },
    updateAreaColor: function (t) {
      var e = this;
      return e.config.area_linearGradient ? e.getGradienColortUrl(t.id) : e.color(t);
    },
    updateArea: function (t, e) {
      e === void 0 && (e = !1);
      var a = this,
        i = a.config,
        r = a.state,
        n = a.$el,
        o = a.$T,
        s = e ? n.subchart : n;
      i.area_linearGradient && a.updateLinearGradient();
      var l = s.main
        .selectAll('.'.concat(yt.areas))
        .selectAll('.'.concat(yt.area))
        .data(a.lineData.bind(a));
      (o(l.exit(), t).style('opacity', '0').remove(),
        (s.area = l
          .enter()
          .append('path')
          .attr('class', a.getClass('area', !0))
          .style('fill', a.updateAreaColor.bind(a))
          .style('opacity', function () {
            return ((r.orgAreaOpacity = L(this).style('opacity')), '0');
          })
          .merge(l)),
        l.style('opacity', r.orgAreaOpacity),
        a.setRatioForGroupedData(s.area.data()));
    },
    redrawArea: function (t, e, a) {
      a === void 0 && (a = !1);
      var i = this,
        r = (a ? this.$el.subchart : this.$el).area,
        n = i.state.orgAreaOpacity;
      return [
        i
          .$T(r, e, Ce())
          .attr('d', t)
          .style('fill', i.updateAreaColor.bind(i))
          .style('opacity', function (o) {
            return String(i.isAreaRangeType(o) ? n / 1.75 : n);
          }),
      ];
    },
    generateDrawArea: function (t, e) {
      var a = this,
        i = a.config,
        r = i.line_connectNull,
        n = i.axis_rotated,
        o = a.generateGetAreaPoints(t, e),
        s = a.getYScaleById.bind(a),
        l = function (d) {
          return (e ? a.subxx : a.xx).call(a, d);
        },
        c = function (d, f) {
          return a.isGrouped(d.id)
            ? o(d, f)[0][1]
            : s(d.id, e)(a.isAreaRangeType(d) ? a.getRangedData(d, 'high') : a.getShapeYMin(d.id));
        },
        u = function (d, f) {
          return a.isGrouped(d.id)
            ? o(d, f)[1][1]
            : s(d.id, e)(a.isAreaRangeType(d) ? a.getRangedData(d, 'low') : d.value);
        };
      return function (d) {
        var f = r ? a.filterRemoveNull(d.values) : d.values,
          v = 0,
          g = 0,
          h;
        if (a.isAreaType(d)) {
          var p = Vi();
          ((p = n
            ? p.y(l).x0(c).x1(u)
            : p
                .x(l)
                .y0(i.area_above ? 0 : i.area_below ? a.state.height : c)
                .y1(u)),
            r ||
              (p = p.defined(function (x) {
                return a.getBaseValue(x) !== null;
              })),
            a.isStepType(d) && (f = a.convertValuesToStep(f)),
            (h = p.curve(a.getCurve(d))(f)));
        } else
          (f[0] && ((v = a.scale.x(f[0].x)), (g = a.getYScaleById(d.id)(f[0].value))),
            (h = n ? 'M '.concat(g, ' ').concat(v) : 'M '.concat(v, ' ').concat(g)));
        return h || 'M 0 0';
      };
    },
    generateGetAreaPoints: function (t, e) {
      var a = this,
        i = a.config,
        r = a.getShapeX(0, t, e),
        n = a.getShapeY(!!e),
        o = a.getShapeOffset(a.isAreaType, t, e),
        s = a.getYScaleById.bind(a);
      return function (l, c) {
        var u = s.call(a, l.id, e)(a.getShapeYMin(l.id)),
          d = o(l, c) || u,
          f = r(l),
          v = l.value,
          g = n(l);
        return (
          i.axis_rotated && ((v > 0 && g < u) || (v < 0 && u < g)) && (g = u),
          [
            [f, d],
            [f, g - (u - d)],
            [f, g - (u - d)],
            [f, d],
          ]
        );
      };
    },
  };
function Ot(t) {
  var e = this.config.bar_connectLine,
    a = e?.[t] || e;
  return /^(start|end)\-(start|end)$/.test(a) ? a : null;
}
var Po = {
    initBar: function () {
      var t = this,
        e = t.$el,
        a = t.config,
        i = t.state.clip;
      ((e.bar = e.main.select('.'.concat(z.chart))),
        (e.bar = a.bar_front ? e.bar.append('g') : e.bar.insert('g', ':first-child')),
        e.bar
          .attr('class', _e.chartBars)
          .call(this.setCssRule(!1, '.'.concat(_e.chartBars), ['pointer-events:none'])),
        a.clipPath === !1 &&
          (a.bar_radius || a.bar_radius_ratio) &&
          e.bar.attr('clip-path', i.pathXAxis.replace(/#[^)]*/, '#'.concat(i.id))));
    },
    updateTargetsForBar: function (t) {
      var e = this,
        a = e.config,
        i = e.$el,
        r = e.getChartClass('Bar'),
        n = e.getClass('bars', !0),
        o = e.classFocus.bind(e),
        s = a.interaction_enabled && a.data_selection_isselectable;
      i.bar || e.initBar();
      var l = i.main
          .select('.'.concat(_e.chartBars))
          .selectAll('.'.concat(_e.chartBar))
          .data(e.filterNullish(t))
          .attr('class', function (u) {
            return r(u) + o(u);
          }),
        c = l
          .enter()
          .append('g')
          .attr('class', r)
          .style('opacity', '0')
          .style('pointer-events', e.getStylePropValue('none'));
      c.append('g')
        .attr('class', n)
        .style('cursor', function (u) {
          var d;
          return !((d = s?.bind) === null || d === void 0) && d.call(s, e.api)(u)
            ? 'pointer'
            : null;
        })
        .call(function (u) {
          (e.setCssRule(!0, ' .'.concat(_e.bar), ['fill'], e.color)(u),
            u.each(function (d) {
              Ot.call(e, d.id) && L(this).append('path').attr('class', _e.barConnectLine);
            }));
        });
    },
    updateBar: function (t, e) {
      e === void 0 && (e = !1);
      var a = this,
        i = a.config,
        r = a.$el,
        n = a.$T,
        o = e ? r.subchart : r,
        s = a.getClass('bar', !0),
        l = a.initialOpacity.bind(a);
      i.bar_linearGradient && a.updateLinearGradient();
      var c = o.main
        .selectAll('.'.concat(_e.bars))
        .selectAll('.'.concat(_e.bar))
        .data(a.labelishData.bind(a));
      (n(c.exit(), t).style('opacity', '0').remove(),
        (o.bar = c
          .enter()
          .append('path')
          .attr('class', s)
          .style('fill', a.updateBarColor.bind(a))
          .merge(c)
          .style('opacity', l)),
        a.setRatioForGroupedData(o.bar.data()));
    },
    updateBarColor: function (t) {
      var e = this,
        a = e.getStylePropValue(e.color);
      return e.config.bar_linearGradient ? e.getGradienColortUrl(t.id) : a ? a(t) : null;
    },
    redrawBar: function (t, e, a) {
      a === void 0 && (a = !1);
      var i = this,
        r = (a ? i.$el.subchart : i.$el).bar,
        n = [];
      return [
        i
          .$T(r, e, Ce())
          .attr('d', function (o, s, l) {
            var c = (P(o.value) || i.isBarRangeType(o)) && t(o, s),
              u = Ot.call(i, o.id);
            if (c.length > 1 && (n.push(c[1]), s === l.length - 1)) {
              var d = i.$T(
                L(this.parentNode.querySelector('.'.concat(_e.barConnectLine))),
                e,
                Ce(),
              );
              (i.updateConnectLine(d, u, n), n.splice(0));
            }
            return c[0];
          })
          .style('fill', i.updateBarColor.bind(i))
          .style('clip-path', function (o) {
            return o.clipPath;
          })
          .style('opacity', null),
      ];
    },
    generateDrawBar: function (t, e) {
      var a = this,
        i = a.config,
        r = a.generateGetBarPoints(t, e),
        n = i.axis_rotated,
        o = i.bar_radius,
        s = i.bar_radius_ratio,
        l =
          P(o) && o > 0
            ? function () {
                return o;
              }
            : P(s)
              ? function (c) {
                  return c * s;
                }
              : null;
      return function (c, u) {
        var d = r(c, u),
          f = +n,
          v = +!f,
          g = c.value < 0,
          h = i['axis_'.concat(a.axis.getId(c.id), '_inverted')],
          p = (!h && g) || (h && !g),
          x = ['', ''],
          _ = a.isGrouped(c.id),
          m = l && _ ? a.isStackingRadiusData(c) : !1,
          y = [d[0][f], d[0][v]],
          T = 0;
        if (((c.clipPath = null), l)) {
          var b = n ? v : f,
            $ = d[2][b] - d[0][b];
          T = !_ || m ? l($) : 0;
          var w = 'a'
            .concat(T, ' ')
            .concat(T, ' ')
            .concat(p ? '1 0 0' : '0 0 1', ' ');
          ((x[+!n] = ''.concat(w).concat(T, ',').concat(T)),
            (x[+n] = ''.concat(w).concat([-T, T][n ? 'sort' : 'reverse']())),
            p && x.reverse());
        }
        var A = n ? d[1][f] + (p ? T : -T) : d[1][v] + (p ? -T : T);
        if (T) {
          var R = '';
          (n
            ? p && y[0] < A
              ? (R = '0 '.concat(A - y[0], 'px 0 0'))
              : !p && y[0] > A && (R = '0 0 0 '.concat(y[0] - A, 'px'))
            : p && y[1] > A
              ? (R = ''.concat(y[1] - A, 'px 0 0 0'))
              : !p && y[1] < A && (R = '0 0 '.concat(A - y[1], 'px 0')),
            R && (c.clipPath = 'inset('.concat(R, ')')));
        }
        var C = n
            ? 'H'
                .concat(A, ' ')
                .concat(x[0], 'V')
                .concat(d[2][v] - T, ' ')
                .concat(x[1], 'H')
                .concat(d[3][f])
            : 'V'
                .concat(A, ' ')
                .concat(x[0], 'H')
                .concat(d[2][f] - T, ' ')
                .concat(x[1], 'V')
                .concat(d[3][v]),
          S = ['M'.concat(d[0][f], ',').concat(d[0][v]).concat(C, 'z')];
        return (
          Ot.call(a, c.id) &&
            S.push(
              n
                ? { x: d[0][f], y: d[0][v], width: d[0][f] - A, height: d[2][v] - d[0][v] }
                : { x: d[0][f], y: A, width: d[2][f] - d[0][f], height: d[3][v] - A },
            ),
          S
        );
      };
    },
    isStackingRadiusData: function (t) {
      var e = this,
        a = e.$el,
        i = e.config,
        r = e.data,
        n = e.state,
        o = t.id,
        s = t.index,
        l = t.value;
      if (n.hiddenTargetIds.indexOf(o) > -1) {
        var c = a.bar.filter(function (v) {
          return v.id === o && v.value === l;
        });
        return !c.empty() && /a\d+/i.test(c.attr('d'));
      }
      var u = i.data_groups.find(function (v) {
          return v.indexOf(o) > -1;
        }),
        d = e
          .orderTargets(e.filterTargetsToShow(r.targets.filter(e.isBarType, e)))
          .filter(function (v) {
            return u.indexOf(v.id) > -1;
          }),
        f = d
          .map(function (v) {
            return v.values.filter(function (g) {
              return g.index === s && (P(l) && l > 0 ? g.value > 0 : g.value < 0);
            })[0];
          })
          .filter(Boolean)
          .map(function (v) {
            return v.id;
          });
      return l !== 0 && f.indexOf(o) === f.length - 1;
    },
    generateGetBarPoints: function (t, e) {
      var a = this,
        i = a.config,
        r = e ? a.axis.subX : a.axis.x,
        n = a.getIndicesMax(t) + 1,
        o = a.getBarW('bar', r, n),
        s = a.getShapeX(o, t, !!e),
        l = a.getShapeY(!!e),
        c = a.getShapeOffset(a.isBarType, t, !!e),
        u = a.getYScaleById.bind(a);
      return function (d, f) {
        var v = d.id,
          g = u.call(a, v, e)(a.getShapeYMin(v)),
          h = c(d, f) || g,
          p = P(o) ? o : o[d.id] || o._$width,
          x = i['axis_'.concat(a.axis.getId(v), '_inverted')],
          _ = d.value,
          m = s(d),
          y = l(d);
        (i.axis_rotated && !x && ((_ > 0 && y < g) || (_ < 0 && g < y)) && (y = g),
          a.isBarRangeType(d) || (y -= g - h));
        var T = m + p;
        return [
          [m, h],
          [m, y],
          [T, y],
          [T, h],
        ];
      };
    },
    updateConnectLine: function (t, e, a) {
      var i = this,
        r = a.map(function (n, o, s) {
          var l = i.config.axis_rotated,
            c = /^start-(start|end)$/.test(e),
            u = /^end-(start|end)$/.test(e),
            d = [],
            f = l ? (u ? n.x - n.width : n.x) : n.x + n.width,
            v = l || c ? n.y + n.height : n.y;
          return (
            o === 0
              ? d.push(''.concat(f, ',').concat(v))
              : (d.push(
                  l
                    ? 'L'.concat(n.x - (/\w+-end$/.test(e) ? n.width : 0), ',').concat(n.y)
                    : 'L'.concat(n.x, ',').concat(n.y + (/\w+-start$/.test(e) ? n.height : 0)),
                ),
                o < s.length - 1 && d.push('M'.concat(f, ',').concat(v))),
            d.join(' ')
          );
        });
      t.attr('d', 'M'.concat(r.join(''), 'z'));
    },
  },
  Do = {
    initBubble: function () {
      var t = this,
        e = t.config;
      t.hasType('bubble') && ((e.point_show = !0), (e.point_type = 'circle'));
    },
    getBaseLength: function () {
      var t = this,
        e = t.state,
        a = e.width,
        i = e.height,
        r = re.bubbleBaseLength,
        n = t.cache.get(r);
      return (n || t.cache.add(r, (n = Re('min', [a, i]))), n);
    },
    getBubbleR: function (t) {
      var e = this,
        a = e.config.bubble_maxR;
      I(a)
        ? (a = a.bind(e.api)(t))
        : P(a) || (a = e.getBaseLength() / (e.getMaxDataCount() * 2) + 12);
      var i = Re(
          'max',
          e.getMinMaxData().max.map(function (o) {
            return e.isBubbleZType(o)
              ? e.getBubbleZData(o.value, 'y')
              : W(o.value)
                ? o.value.mid
                : o.value;
          }),
        ),
        r = a * a * Math.PI,
        n = (e.isBubbleZType(t) ? e.getBubbleZData(t.value, 'z') : t.value) * (r / i);
      return Math.sqrt(n / Math.PI);
    },
    getBubbleZData: function (t, e) {
      return W(t) ? t[e] : t[e === 'y' ? 0 : 1];
    },
  },
  zo = {
    initCandlestick: function () {
      var t = this.$el;
      t.candlestick = t.main
        .select('.'.concat(z.chart))
        .append('g')
        .attr('class', ke.chartCandlesticks);
    },
    updateTargetsForCandlestick: function (t) {
      var e = this,
        a = e.$el,
        i = e.getChartClass('Candlestick');
      a.candlestick || e.initCandlestick();
      var r = e.$el.main
        .select('.'.concat(ke.chartCandlesticks))
        .selectAll('.'.concat(ke.chartCandlestick))
        .data(e.filterNullish(t));
      r.enter().append('g').attr('class', i).style('pointer-events', 'none');
    },
    updateCandlestick: function (t, e) {
      e === void 0 && (e = !1);
      var a = this,
        i = a.$el,
        r = a.$T,
        n = e ? i.subchart : i,
        o = a.getClass('candlestick', !0),
        s = a.initialOpacity.bind(a),
        l = n.main
          .selectAll('.'.concat(ke.chartCandlestick))
          .selectAll('.'.concat(ke.candlestick))
          .data(a.labelishData.bind(a));
      r(l.exit(), t).style('opacity', '0').remove();
      var c = l
        .enter()
        .filter(function (u) {
          return u.value;
        })
        .append('g')
        .attr('class', o);
      (c.append('line'), c.append('path'), (n.candlestick = l.merge(c).style('opacity', s)));
    },
    generateDrawCandlestick: function (t, e) {
      var a = this,
        i = a.config,
        r = a.generateGetCandlestickPoints(t, e),
        n = i.axis_rotated,
        o = i.candlestick_color_down;
      return function (s, l, c) {
        var u = r(s, l),
          d = a.getCandlestickData(s),
          f = d?._isUp,
          v = +n,
          g = +!v;
        c.classed && c.classed(ke[f ? 'valueUp' : 'valueDown'], !0);
        var h = n
          ? 'H'.concat(u[1][1], ' V').concat(u[1][0], ' H').concat(u[0][1])
          : 'V'.concat(u[1][1], ' H').concat(u[1][0], ' V').concat(u[0][1]);
        c.select('path')
          .attr('d', 'M'.concat(u[0][v], ',').concat(u[0][g]).concat(h, 'z'))
          .style('fill', function (m) {
            var y = f ? a.color(m) : W(o) ? o[m.id] : o;
            return y || a.color(m);
          });
        var p = c.select('line'),
          x = n
            ? { x1: u[2][1], x2: u[2][2], y1: u[2][0], y2: u[2][0] }
            : { x1: u[2][0], x2: u[2][0], y1: u[2][1], y2: u[2][2] };
        for (var _ in x) p.attr(_, x[_]);
      };
    },
    generateGetCandlestickPoints: function (t, e) {
      e === void 0 && (e = !1);
      var a = this,
        i = e ? a.axis.subX : a.axis.x,
        r = a.getIndicesMax(t) + 1,
        n = a.getBarW('candlestick', i, r),
        o = a.getShapeX(n, t, !!e),
        s = a.getShapeY(!!e),
        l = a.getShapeOffset(a.isBarType, t, !!e),
        c = a.getYScaleById.bind(a);
      return function (u, d) {
        var f = c.call(a, u.id, e)(a.getShapeYMin(u.id)),
          v = l(u, d) || f,
          g = P(n) ? n : n[u.id] || n._$width,
          h = a.getCandlestickData(u),
          p;
        if (h && P(h.open) && P(h.close)) {
          var x = { start: o(u), end: 0 };
          x.end = x.start + g;
          var _ = { start: s(h.open), end: s(h.close) },
            m = { x: x.start + g / 2, high: s(h.high), low: s(h.low) };
          ((_.start -= f - v),
            (p = [
              [x.start, _.start],
              [x.end, _.end],
              [m.x, m.low, m.high],
            ]));
        } else
          p = [
            [0, 0],
            [0, 0],
            [0, 0, 0],
          ];
        return p;
      };
    },
    redrawCandlestick: function (t, e, a) {
      a === void 0 && (a = !1);
      var i = this,
        r = i.$el,
        n = i.$T,
        o = (a ? r.subchart : r).candlestick,
        s = Ce(!0);
      return [
        o
          .each(function (l, c) {
            var u = n(L(this), e, s);
            t(l, c, u);
          })
          .style('opacity', null),
      ];
    },
    getCandlestickData: function (t) {
      var e = t.value,
        a;
      if (j(e)) {
        var i = e[0],
          r = e[1],
          n = e[2],
          o = e[3],
          s = e[4],
          l = s === void 0 ? !1 : s;
        ((a = { open: i, high: r, low: n, close: o }), l !== !1 && (a.volume = l));
      } else W(e) && (a = F({}, e));
      return (a && (a._isUp = a.close >= a.open), a || null);
    },
  };
function $t(t) {
  t === void 0 && (t = !1);
  var e = this,
    a = e.config,
    i = e.state.current,
    r = i.width,
    n = i.height,
    o = e.getCurrentPadding(),
    s = F(
      {
        width: r - (o.left + o.right),
        height: n - (a.legend_show ? e.getLegendHeight() + 10 : 0) - (o.top + o.bottom),
      },
      o,
    );
  if (t) {
    var l = oi.call(e, { width: s.width, height: s.height }),
      c = l.width,
      u = l.height;
    (s.width < c && (s.width = c), s.height < u && (s.height = u));
  }
  return s;
}
function oi(t) {
  var e,
    a = this,
    i = a.config,
    r = i.funnel_neck_width,
    n = i.funnel_neck_height;
  return (
    (e = [r, n].map(function (o, s) {
      var l = o;
      return (W(o) && (l = t[s ? 'height' : 'width'] * o.ratio), l);
    })),
    (r = e[0]),
    (n = e[1]),
    { width: r, height: n }
  );
}
function Fo(t) {
  var e = this,
    a = $t.call(e, !0),
    i = a.top,
    r = a.left,
    n = a.width,
    o = [];
  return (
    t.forEach(function (s, l) {
      var c = s.ratio,
        u = l > 0 ? o[l - 1][2][1] : i;
      o.push(
        (s.coords = [
          [r, u],
          [r + n, u],
          [r + n, l > 0 ? c + u : c + i],
          [r, l > 0 ? c + u : c + i],
          [r, u],
        ]),
      );
    }),
    o
  );
}
function _a(t) {
  t === void 0 && (t = !1);
  var e = this,
    a = $t.call(e, !0),
    i = a.width,
    r = a.height,
    n = a.top,
    o = a.left,
    s = oi.call(e, { width: i, height: r }),
    l = (i - s.width) / 2,
    c = (i + s.width) / 2,
    u = r - s.height,
    d = [
      [0, 0],
      [i, 0],
      [c, u],
      [c, r],
      [l, r],
      [l, u],
      [0, 0],
    ];
  return (
    t &&
      d.forEach(function (f) {
        ((f[0] += o), (f[1] += n));
      }),
    'M'.concat(d.join('L'), 'z')
  );
}
function Mo(t) {
  var e = this,
    a = e.config,
    i = t.map(function (r) {
      return {
        id: r.id,
        value: r.values.reduce(function (n, o) {
          return n + o.value;
        }, 0),
      };
    });
  return (a.data_order && i.sort(e.getSortCompareFn.bind(e)(!0)), si.call(e, i));
}
function si(t) {
  var e = this,
    a = $t.call(e).height,
    i = e.getTotalDataSum(!0);
  return (
    t.forEach(function (r) {
      r.ratio = (r.value / i) * a;
    }),
    t
  );
}
var Bo = {
    initFunnel: function () {
      var t = this,
        e = t.$el;
      ((e.funnel = e.main.select('.'.concat(z.chart)).append('g').classed(dt.chartFunnels, !0)),
        (e.funnel.background = e.funnel.append('path').classed(dt.funnelBackground, !0)),
        t.bindFunnelEvent());
    },
    bindFunnelEvent: function () {
      var t = this,
        e = t.$el.funnel,
        a = t.config,
        i = t.state,
        r = function (o) {
          var s,
            l = o.isTrusted
              ? o.target
              : (s = i.eventReceiver.rect) === null || s === void 0
                ? void 0
                : s.node(),
            c;
          return (/^path$/i.test(l.tagName) && ((i.event = o), (c = L(l).datum())), c);
        };
      if (a.interaction_enabled) {
        var n = i.inputType === 'touch';
        e.on(
          n ? 'touchstart' : 'mouseover mousemove',
          function (o) {
            var s = r(o);
            s &&
              (t.showTooltip([s], o.target),
              /^(touchstart|mouseover)$/.test(o.type) && t.setOverOut(!0, s));
          },
          n ? { passive: !0 } : void 0,
        ).on(n ? 'touchend' : 'mouseout', function (o) {
          var s = r(o);
          a.interaction_onout && (t.hideTooltip(), t.setOverOut(!1, s));
        });
      }
    },
    updateTargetsForFunnel: function (t) {
      var e = this,
        a = e.$el.funnel,
        i = e.getChartClass('Funnel'),
        r = e.getClass('funnel', !0);
      a || e.initFunnel();
      var n = Mo.call(e, t.filter(e.isFunnelType.bind(e))),
        o = a.selectAll('.'.concat(dt.chartFunnel)).data(e.filterNullish(n));
      o.exit().remove();
      var s = o.enter().insert('g', '.'.concat(dt.funnelBackground));
      (s.append('path'),
        (a.path = s
          .merge(o)
          .attr('class', function (l) {
            return i(l);
          })
          .select('path')
          .attr('class', r)
          .style('opacity', '0')
          .style('fill', e.color)));
    },
    updateFunnel: function (t) {
      var e = this,
        a = e.$el.funnel,
        i = t.map(function (r) {
          var n = r.id;
          return n;
        });
      a.path = a.path.filter(function (r) {
        return i.indexOf(r.id) >= 0;
      });
    },
    generateGetFunnelPoints: function () {
      var t = this,
        e = t.$el.funnel,
        a = t.filterTargetsToShow(e.path),
        i = $t.call(t),
        r = i.top,
        n = i.left,
        o = i.right,
        s = (n - o) / 2,
        l = {},
        c = r ?? 0;
      return (
        a.each(function (u, d) {
          var f;
          l[u.id] = [
            [s, c],
            [s, (c += ((f = a?.[d]) !== null && f !== void 0 ? f : u).ratio)],
          ];
        }),
        function (u) {
          return l[u.id];
        }
      );
    },
    redrawFunnel: function () {
      var t = this,
        e = t.$T,
        a = t.$el.funnel,
        i = t.filterTargetsToShow(a.path),
        r = Fo.call(t, si.call(t, i.data()));
      (a.attr('clip-path', "path('".concat(_a.bind(t)(), "')")),
        a.background.attr('d', _a.call(t, !0)),
        e(i)
          .attr('d', function (n, o) {
            return 'M'.concat(r[o].join('L'), 'z');
          })
          .style('opacity', '1'),
        a.selectAll('g').style('opacity', null));
    },
  },
  Xo = {
    initGauge: function () {
      var t = this,
        e = t.config,
        a = t.$el.arcs,
        i = function (n, o) {
          (n === void 0 && (n = null),
            o === void 0 && (o = ''),
            a
              .append('text')
              .attr('class', n)
              .style('text-anchor', 'middle')
              .style('pointer-events', 'none')
              .text(o));
        };
      if (t.hasType('gauge')) {
        var r = t.hasMultiArcGauge();
        (a
          .append(r ? 'g' : 'path')
          .attr('class', V.chartArcsBackground)
          .style('fill', (!r && e.gauge_background) || null),
          e.gauge_units && i(me.chartArcsGaugeUnit),
          e.gauge_label_show &&
            (i(me.chartArcsGaugeMin), !e.gauge_fullCircle && i(me.chartArcsGaugeMax)));
      }
    },
    updateGaugeMax: function () {
      var t = this,
        e = t.config,
        a = t.state,
        i = t.hasMultiArcGauge(),
        r = i ? t.getMinMaxData().max[0].value : t.getTotalDataSum(a.rendered);
      !e.gauge_enforceMinMax &&
        r + e.gauge_min * (e.gauge_min > 0 ? -1 : 1) > e.gauge_max &&
        (e.gauge_max = r - e.gauge_min);
    },
    redrawArcGaugeLine: function () {
      var t = this,
        e = t.config,
        a = t.state,
        i = t.$el,
        r = t.state.hiddenTargetIds,
        n = i.main
          .selectAll('.'.concat(V.arcs))
          .selectAll('.'.concat(V.arcLabelLine))
          .data(t.arcData.bind(t)),
        o = n
          .enter()
          .append('rect')
          .attr('class', function (s) {
            return ''
              .concat(V.arcLabelLine, ' ')
              .concat(z.target, ' ')
              .concat(z.target, '-')
              .concat(s.data.id);
          })
          .merge(n);
      o.style('fill', function (s) {
        return t.levelColor ? t.levelColor(s.data.values[0].value) : t.color(s.data);
      })
        .style('display', e.gauge_label_show ? null : 'none')
        .each(function (s) {
          var l = 0,
            c = 2,
            u = 0,
            d = 0,
            f = '';
          if (r.indexOf(s.data.id) < 0) {
            var v = t.updateAngle(s),
              g = (a.gaugeArcWidth / t.filterTargetsToShow(t.data.targets).length) * (v.index + 1),
              h = v.endAngle - Math.PI / 2,
              p = a.radius - g,
              x = h - (p === 0 ? 0 : 1 / p);
            ((l = a.radiusExpanded - a.radius + g),
              (u = Math.cos(x) * p),
              (d = Math.sin(x) * p),
              (f = 'rotate('
                .concat((h * 180) / Math.PI, ', ')
                .concat(u, ', ')
                .concat(d, ')')));
          }
          L(this)
            .attr('x', u)
            .attr('y', d)
            .attr('width', l)
            .attr('height', c)
            .attr('transform', f)
            .style('stroke-dasharray', '0, '.concat(l + c, ', 0'));
        });
    },
    textForGaugeMinMax: function (t, e) {
      var a = this,
        i = a.config,
        r = i.gauge_label_extents;
      return I(r) ? r.bind(a.api)(t, e) : t;
    },
    getGaugeLabelHeight: function () {
      var t = this.config;
      return this.config.gauge_label_show && !t.gauge_fullCircle ? 20 : 0;
    },
    getPaddingBottomForGauge: function () {
      var t = this;
      return t.getGaugeLabelHeight() * (t.config.gauge_label_show ? 2 : 2.5);
    },
  };
function No(t, e, a, i) {
  i === void 0 && (i = !1);
  for (
    var r = t ? [t, 0] : a,
      n = function (l) {
        (a.forEach(function (c) {
          (l + c <= e && r.push(c), (l += c));
        }),
          (o = l));
      },
      o,
      s =
        t ||
        a.reduce(function (l, c) {
          return l + c;
        });
    s <= e;
  )
    (n(s), (s = o));
  return (
    r.length % 2 !== 0 && r.push(i ? a[1] : 0),
    {
      dash: r.join(' '),
      length: r.reduce(function (l, c) {
        return l + c;
      }, 0),
    }
  );
}
function Go(t, e, a) {
  var i = this,
    r = [],
    n = '2 2';
  if (q(e))
    for (
      var o = function (f, v) {
          return se(f) ? v : a ? Ae.call(i, f) : f;
        },
        s = 0,
        l = void 0;
      (l = e[s]);
      s++
    ) {
      var c = o(l.start, t[0].x),
        u = o(l.end, t[t.length - 1].x),
        d = l.style || { dasharray: n };
      r[s] = { start: c, end: u, style: d };
    }
  return r;
}
var Vo = {
    initLine: function () {
      var t = this.$el;
      t.line = t.main
        .select('.'.concat(z.chart))
        .append('g')
        .attr('class', Ie.chartLines)
        .call(this.setCssRule(!1, '.'.concat(Ie.chartLines), ['pointer-events:none']));
    },
    updateTargetsForLine: function (t) {
      var e = this,
        a = e.$el,
        i = a.area,
        r = a.line,
        n = a.main,
        o = e.getChartClass('Line'),
        s = e.getClass('lines', !0),
        l = e.classFocus.bind(e);
      r || e.initLine();
      var c = t.filter(function (v) {
          return !(e.isScatterType(v) || e.isBubbleType(v));
        }),
        u = n
          .select('.'.concat(Ie.chartLines))
          .selectAll('.'.concat(Ie.chartLine))
          .data(e.filterNullish(c))
          .attr('class', function (v) {
            return o(v) + l(v);
          }),
        d = u
          .enter()
          .append('g')
          .attr('class', o)
          .style('opacity', '0')
          .style('pointer-events', e.getStylePropValue('none'));
      if ((d.append('g').attr('class', s), e.hasTypeOf('Area'))) {
        var f = (!i && d.empty() ? u : d).filter(e.isAreaType.bind(e));
        e.initArea(f);
      }
      e.updateTargetForCircle(c, d);
    },
    updateLine: function (t, e) {
      e === void 0 && (e = !1);
      var a = this,
        i = a.format.extraLineClasses,
        r = a.$el,
        n = a.$T,
        o = e ? r.subchart : r,
        s = o.main
          .selectAll('.'.concat(Ie.lines))
          .selectAll('.'.concat(Ie.line))
          .data(a.lineData.bind(a));
      (n(s.exit(), t).style('opacity', '0').remove(),
        (o.line = s
          .enter()
          .append('path')
          .attr('class', function (l) {
            return ''.concat(a.getClass('line', !0)(l), ' ').concat(i(l) || '');
          })
          .style('stroke', a.color)
          .merge(s)
          .style('opacity', a.initialOpacity.bind(a))
          .attr('transform', null)));
    },
    redrawLine: function (t, e, a) {
      a === void 0 && (a = !1);
      var i = this,
        r = i.$el,
        n = i.$T,
        o = (a ? r.subchart : r).line;
      return [n(o, e, Ce()).attr('d', t).style('stroke', this.color).style('opacity', null)];
    },
    getCurve: function (t) {
      var e = this,
        a = e.config.axis_rotated && e.isStepType(t);
      return a
        ? function (i) {
            var r = e.getInterpolate(t)(i);
            return (
              (r.orgPoint = r.point),
              (r.pointRotated = function (n, o) {
                this._point === 1 && (this._point = 2);
                var s = this._y * (1 - this._t) + o * this._t;
                (this._context.lineTo(this._x, s),
                  this._context.lineTo(n, s),
                  (this._x = n),
                  (this._y = o));
              }),
              (r.point = function (n, o) {
                this._point === 0 ? this.orgPoint(n, o) : this.pointRotated(n, o);
              }),
              r
            );
          }
        : e.getInterpolate(t);
    },
    generateDrawLine: function (t, e) {
      var a = this,
        i = a.config,
        r = a.scale,
        n = i.line_connectNull,
        o = i.axis_rotated,
        s = a.generateGetLinePoints(t, e),
        l = a.getYScaleById.bind(a),
        c = function (v) {
          return (e ? a.subxx : a.xx).call(a, v);
        },
        u = function (v, g) {
          return a.isGrouped(v.id) ? s(v, g)[0][1] : l(v.id, e)(a.getBaseValue(v));
        },
        d = Ni();
      ((d = o ? d.x(u).y(c) : d.x(c).y(u)),
        n ||
          (d = d.defined(function (v) {
            return a.getBaseValue(v) !== null;
          })));
      var f = e ? r.subX : r.x;
      return function (v) {
        var g = l(v.id, e),
          h = n ? a.filterRemoveNull(v.values) : v.values,
          p = 0,
          x = 0,
          _;
        if (a.isLineType(v)) {
          var m = i.data_regions[v.id];
          m
            ? (a.isAreaRangeType(v) &&
                (h = h.map(function (y) {
                  return F(F({}, y), { value: a.getRangedData(y, 'mid') });
                })),
              (_ = a.lineWithRegions(h, r.zoom || f, g, m)))
            : (a.isStepType(v) && (h = a.convertValuesToStep(h)), (_ = d.curve(a.getCurve(v))(h)));
        } else
          (h[0] && ((p = f(h[0].x)), (x = g(h[0].value))),
            (_ = o ? 'M '.concat(x, ' ').concat(p) : 'M '.concat(p, ' ').concat(x)));
        return _ || 'M 0 0';
      };
    },
    lineWithRegions: function (t, e, a, i) {
      for (
        var r = this,
          n = r.config,
          o = n.axis_rotated,
          s = r.axis.isTimeSeries(),
          l = '2 2',
          c = Go.bind(r)(t, i, s),
          u = r.hasNullDataValue(t),
          d,
          f,
          v,
          g,
          h = o
            ? function (D) {
                return a(D.value);
              }
            : function (D) {
                return e(D.x);
              },
          p = o
            ? function (D) {
                return e(D.x);
              }
            : function (D) {
                return a(D.value);
              },
          x = function (D) {
            return 'M'
              .concat(D[0][0], ',')
              .concat(D[0][1], 'L')
              .concat(D[1][0], ',')
              .concat(D[1][1]);
          },
          _ = s
            ? function (D, ge, de, xe) {
                var De = D.x.getTime(),
                  Le = ge.x - D.x,
                  Ne = new Date(De + Le * de),
                  Ee = new Date(De + Le * (de + xe)),
                  Rt = o
                    ? [
                        [a(f(de)), e(Ne)],
                        [a(f(de + v)), e(Ee)],
                      ]
                    : [
                        [e(Ne), a(f(de))],
                        [e(Ee), a(f(de + v))],
                      ];
                return x(Rt);
              }
            : function (D, ge, de, xe) {
                var De = e(ge.x, !o),
                  Le = a(ge.value, o),
                  Ne = de + xe,
                  Ee = e(d(de), !o),
                  Rt = a(f(de), o),
                  qe = e(d(Ne), !o),
                  Je = a(f(Ne), o);
                (qe > De && (qe = De), D.value > ge.value && (o ? Je < Le : Je > Le) && (Je = Le));
                var jt = [
                  [Ee, Rt],
                  [qe, Je],
                ];
                return (
                  o &&
                    jt.forEach(function (ui) {
                      return ui.reverse();
                    }),
                  x(jt)
                );
              },
          m = { x: r.axis.getAxisType('x'), y: r.axis.getAxisType('y') },
          y = '',
          T = r.$el.line.filter(function (D) {
            var ge = D.id;
            return ge === t[0].id;
          }),
          b = T.clone().style('display', 'none'),
          $ = function (D, ge) {
            return D.attr('d', ge).node().getTotalLength();
          },
          w = { dash: [], lastLength: 0 },
          A = !1,
          R = 0,
          C = void 0;
        (C = t[R]);
        R++
      ) {
        var S = t[R - 1],
          M = S && N(S.value),
          k = r.isWithinRegions(C.x, c);
        if (N(C.value)) {
          if (se(c) || !k || !M)
            y += ''
              .concat(R && M ? 'L' : 'M')
              .concat(h(C), ',')
              .concat(p(C));
          else if (M)
            if (
              ((k = (k?.dasharray || l).split(' ').map(Number)),
              (d = We(m.x, S.x, C.x)),
              (f = We(m.y, S.value, C.value)),
              u)
            ) {
              var Z = e(C.x) - e(S.x),
                G = a(C.value) - a(S.value),
                O = Math.sqrt(Math.pow(Z, 2) + Math.pow(G, 2));
              ((v = k[0] / O), (g = v * k[1]));
              for (var B = v; B <= 1; B += g)
                ((y += _(S, C, B, v)), B + g >= 1 && (y += _(S, C, 1, 0)));
            } else {
              var Y = [];
              if (((A = C.x === t[t.length - 1].x), s)) {
                var ae = +S.x,
                  Se = new Date(ae),
                  be = new Date(ae + (+C.x - ae));
                Y = [
                  [e(Se), a(f(0))],
                  [e(be), a(f(1))],
                ];
              } else
                Y = [
                  [e(d(0)), a(f(0))],
                  [e(d(1)), a(f(1))],
                ];
              o &&
                Y.forEach(function (D) {
                  return D.reverse();
                });
              var Pe = $(b, y),
                Ke = $(b, (y += 'L'.concat(Y[1].join(',')))),
                Xe = No(Pe - w.lastLength, Ke - w.lastLength, k, A);
              ((w.lastLength += Xe.length), w.dash.push(Xe.dash));
            }
        }
      }
      return (
        w.dash.length &&
          (!A && w.dash.push($(b, y)), b.remove(), T.attr('stroke-dasharray', w.dash.join(' '))),
        y
      );
    },
    isWithinRegions: function (t, e) {
      for (var a = 0, i = void 0; (i = e[a]); a++) if (i.start < t && t <= i.end) return i.style;
      return !1;
    },
    isWithinStep: function (t, e) {
      return Math.abs(e - Te(this.state.event, t)[1]) < 30;
    },
    shouldDrawPointsForLine: function (t) {
      var e = this.config.line_point;
      return e === !0 || (j(e) && e.indexOf(t.id) !== -1);
    },
  },
  Qe = function () {
    return Ce();
  },
  At = {
    initialOpacityForCircle: function (t) {
      var e = this,
        a = e.config,
        i = e.state.withoutFadeIn,
        r = a.point_opacity;
      return (
        se(r) && (r = this.getBaseValue(t) !== null && i[t.id] ? this.opacityForCircle(t) : '0'),
        r
      );
    },
    opacityForCircle: function (t) {
      var e,
        a = this.config,
        i = a.point_opacity;
      return (
        se(i) &&
          ((i =
            a.point_show &&
            !(!((e = this.isPointFocusOnly) === null || e === void 0) && e.call(this))
              ? null
              : '0'),
          (i = N(this.getBaseValue(t))
            ? this.isBubbleType(t) || this.isScatterType(t)
              ? '0.5'
              : i
            : '0')),
        i
      );
    },
    initCircle: function () {
      var t = this,
        e = t.$el.main;
      (!t.point && (t.point = t.generatePoint()),
        (t.hasType('bubble') || t.hasType('scatter')) &&
          e.select('.'.concat(z.chart, ' > .').concat(he.chartCircles)).empty() &&
          e.select('.'.concat(z.chart)).append('g').attr('class', he.chartCircles));
    },
    updateTargetForCircle: function (t, e) {
      var a = this,
        i = this,
        r = i.config,
        n = i.data,
        o = i.$el,
        s = r.interaction_enabled && r.data_selection_enabled,
        l = s && r.data_selection_isselectable,
        c = i.getClass('circles', !0);
      if (r.point_show) {
        i.initCircle();
        var u = t,
          d = e;
        if (!u) {
          u = i.filterNullish(n.targets).filter(function (v) {
            return a.isScatterType(v) || a.isBubbleType(v);
          });
          var f = o.main
            .select('.'.concat(he.chartCircles))
            .style('pointer-events', 'none')
            .selectAll('.'.concat(he.circles))
            .data(u);
          (f.exit().remove(), (d = f.enter()));
        }
        (s &&
          d.append('g').attr('class', function (v) {
            return i.generateClass(ee.selectedCircles, v.id);
          }),
          d
            .append('g')
            .attr('class', c)
            .call(function (v) {
              (i.setCssRule(!0, '.'.concat(he.circles), ['cursor:pointer'], l)(v),
                i.setCssRule(!0, ' .'.concat(he.circle), ['fill', 'stroke'], i.color)(v));
            })
            .style('opacity', function () {
              var v = L(this.parentNode);
              return v.attr('class').indexOf(he.chartCircles) > -1 ? '0' : null;
            }),
          s &&
            u.forEach(function (v) {
              o.main
                .selectAll('.'.concat(ee.selectedCircles).concat(i.getTargetSelectorSuffix(v.id)))
                .selectAll(''.concat(ee.selectedCircle))
                .each(function (g) {
                  g.value = v.values[g.index].value;
                });
            }));
      }
    },
    updateCircle: function (t) {
      t === void 0 && (t = !1);
      var e = this,
        a = e.config,
        i = e.state,
        r = e.$el,
        n = e.isPointFocusOnly(),
        o = t ? r.subchart : r;
      if (a.point_show && !i.toggling) {
        a.point_radialGradient && e.updateLinearGradient();
        var s = o.main
          .selectAll('.'.concat(he.circles))
          .selectAll('.'.concat(he.circle))
          .data(function (l) {
            var c =
              (e.isLineType(l) && e.shouldDrawPointsForLine(l)) ||
              e.isBubbleType(l) ||
              e.isRadarType(l) ||
              e.isScatterType(l)
                ? n
                  ? [l.values[0]]
                  : l.values
                : [];
            return e.filterNullish(c);
          });
        (s.exit().remove(),
          s
            .enter()
            .filter(Boolean)
            .append(e.point('create', this, e.pointR.bind(e), e.updateCircleColor.bind(e))),
          (o.circle = o.main
            .selectAll('.'.concat(he.circles, ' .').concat(he.circle))
            .style('stroke', e.getStylePropValue(e.color))
            .style('opacity', e.initialOpacityForCircle.bind(e))));
      }
    },
    updateCircleColor: function (t) {
      var e = this,
        a = e.getStylePropValue(e.color);
      return e.config.point_radialGradient ? e.getGradienColortUrl(t.id) : a ? a(t) : null;
    },
    redrawCircle: function (t, e, a, i, r) {
      r === void 0 && (r = !1);
      var n = this,
        o = n.state.rendered,
        s = n.$el,
        l = n.$T,
        c = r ? s.subchart : s,
        u = c.main.selectAll('.'.concat(ee.selectedCircle));
      if (!n.config.point_show) return [];
      var d = n.point('update', n, t, e, n.updateCircleColor.bind(n), a, i, u),
        f = n.isCirclePoint() ? 'c' : '',
        v = Ce(),
        g = n.opacityForCircle.bind(n),
        h = [];
      return (
        c.circle.each(function (p) {
          var x = d.bind(this)(p);
          ((x = l(x, a || !o, v).style('opacity', g)), h.push(x));
        }),
        [h, l(u, a).attr(''.concat(f, 'x'), t).attr(''.concat(f, 'y'), e)]
      );
    },
    showCircleFocus: function (t) {
      var e = this,
        a = e.state,
        i = a.hasRadar,
        r = a.resizing,
        n = a.toggling,
        o = a.transiting,
        s = e.$el,
        l = s.circle;
      if (o === !1 && l && e.isPointFocusOnly()) {
        var c = (i ? e.radarCircleX : e.circleX).bind(e),
          u = (i ? e.radarCircleY : e.circleY).bind(e),
          d = n || se(t),
          f = e.point('update', e, c, u, e.getStylePropValue(e.color), r ? !1 : d);
        (t &&
          (l = l.filter(function (v) {
            var g,
              h =
                (g = t.filter) === null || g === void 0
                  ? void 0
                  : g.call(t, function (p) {
                      return p.id === v.id;
                    });
            return h.length ? L(this).datum(h[0]) : !1;
          })),
          l
            .attr('class', this.updatePointClass.bind(this))
            .style('opacity', null)
            .each(function (v) {
              var g = v.id,
                h = v.index,
                p = v.value,
                x = 'hidden';
              (N(p) && (f.bind(this)(v), e.expandCircles(h, g), (x = '')),
                (this.style.visibility = x));
            }));
      }
    },
    hideCircleFocus: function () {
      var t = this,
        e = t.$el.circle;
      t.isPointFocusOnly() && e && (t.unexpandCircles(), e.style('visibility', 'hidden'));
    },
    circleX: function (t) {
      return this.xx(t);
    },
    updateCircleY: function (t) {
      t === void 0 && (t = !1);
      var e = this,
        a = e.generateGetLinePoints(e.getShapeIndices(e.isLineType), t);
      return function (i, r) {
        var n = i.id;
        return e.isGrouped(n) ? a(i, r)[0][1] : e.getYScaleById(n, t)(e.getBaseValue(i));
      };
    },
    expandCircles: function (t, e, a) {
      var i = this,
        r = i.pointExpandedR.bind(i);
      a && i.unexpandCircles();
      var n = i.getShapeByIndex('circle', t, e).classed(z.EXPANDED, !0),
        o = r(n) / i.config.point_r,
        s = 1 - o;
      i.isCirclePoint()
        ? n.attr('r', r)
        : n.each(function () {
            var l = L(this);
            if (this.tagName === 'circle') l.attr('r', r);
            else {
              var c = Be(this),
                u = c.width,
                d = c.height,
                f = s * (+l.attr('x') + u / 2),
                v = s * (+l.attr('y') + d / 2);
              l.attr('transform', 'translate('.concat(f, ' ').concat(v, ') scale(').concat(o, ')'));
            }
          });
    },
    unexpandCircles: function (t) {
      var e = this,
        a = e.pointR.bind(e),
        i = e
          .getShapeByIndex('circle', t)
          .filter(function () {
            return L(this).classed(z.EXPANDED);
          })
          .classed(z.EXPANDED, !1);
      if ((i.attr('r', a), !e.isCirclePoint())) {
        var r = a(i) / e.config.point_r;
        i.attr('transform', r !== 1 ? 'scale('.concat(r, ')') : null);
      }
    },
    pointR: function (t) {
      var e = this,
        a = e.config,
        i = a.point_r,
        r = i;
      return (
        e.isBubbleType(t) ? (r = e.getBubbleR(t)) : I(i) && (r = i.bind(e.api)(t)),
        (t.r = r),
        r
      );
    },
    pointExpandedR: function (t) {
      var e = this,
        a = e.config,
        i = e.isBubbleType(t) ? 1.15 : 1.75;
      return a.point_focus_expand_enabled ? a.point_focus_expand_r || e.pointR(t) * i : e.pointR(t);
    },
    pointSelectR: function (t) {
      var e = this,
        a = e.config.point_select_r;
      return I(a) ? a(t) : a || e.pointR(t) * 4;
    },
    isPointFocusOnly: function () {
      var t = this;
      return (
        t.config.point_focus_only &&
        !t.hasType('bubble') &&
        !t.hasType('scatter') &&
        !t.hasArcType(null, ['radar'])
      );
    },
    isWithinCircle: function (t, e) {
      var a = this.state,
        i = Te(a.event, t),
        r = L(t),
        n = this.isCirclePoint(t) ? 'c' : '',
        o = this.getPointSensitivity(r?.datum()),
        s = +r.attr(''.concat(n, 'x')),
        l = +r.attr(''.concat(n, 'y'));
      if (!(s || l) && t.nodeType === 1) {
        var c = fe(t),
          u = c.x,
          d = c.y;
        ((s = u), (l = d));
      }
      return Math.sqrt(Math.pow(s - i[0], 2) + Math.pow(l - i[1], 2)) < (e || o);
    },
    getPointSensitivity: function (t) {
      var e = this,
        a = e.config.point_sensitivity;
      if (t) I(a) ? (a = a.call(e.api, t)) : a === 'radius' && (a = t.r);
      else return a;
      return a;
    },
    updatePointClass: function (t) {
      var e = this,
        a = e.$el.circle,
        i = !1;
      return (
        (W(t) || a) &&
          (i =
            t === !0
              ? a.each(function (r) {
                  var n = e.getClass('circle', !0)(r);
                  (this.getAttribute('class').indexOf(z.EXPANDED) > -1 &&
                    (n += ' '.concat(z.EXPANDED)),
                    this.setAttribute('class', n));
                })
              : e.getClass('circle', !0)(t)),
        i
      );
    },
    generateGetLinePoints: function (t, e) {
      var a = this,
        i = a.config,
        r = a.getShapeX(0, t, e),
        n = a.getShapeY(e),
        o = a.getShapeOffset(a.isLineType, t, e),
        s = a.getYScaleById.bind(a);
      return function (l, c) {
        var u = s.call(a, l.id, e)(a.getShapeYMin(l.id)),
          d = o(l, c) || u,
          f = r(l),
          v = n(l);
        i.axis_rotated && ((l.value > 0 && v < u) || (l.value < 0 && u < v)) && (v = u);
        var g = [f, v - (u - d)];
        return [g, g, g, g];
      };
    },
    custom: {
      create: function (t, e, a) {
        return t
          .append('use')
          .attr('xlink:href', '#'.concat(e))
          .attr('class', this.updatePointClass.bind(this))
          .style('fill', a)
          .node();
      },
      update: function (t, e, a, i, r, n, o) {
        var s = this,
          l = Be(t.node()),
          c = l.width,
          u = l.height,
          d = function (g) {
            return N(g.value) ? e(g) - c / 2 : 0;
          },
          f = function (g) {
            return N(g.value) ? a(g) - u / 2 : 0;
          },
          v = t;
        return (
          r && (n && v.attr('x', d), (v = s.$T(v, r, Qe())), o && s.$T(o, r, Qe())),
          v.attr('x', d).attr('y', f).style('fill', i)
        );
      },
    },
    circle: {
      create: function (t, e, a) {
        return t
          .append('circle')
          .attr('class', this.updatePointClass.bind(this))
          .attr('r', e)
          .style('fill', a)
          .node();
      },
      update: function (t, e, a, i, r, n, o) {
        var s = this,
          l = t;
        return (
          s.hasType('bubble') && l.attr('r', s.pointR.bind(s)),
          r &&
            (n && l.attr('cx', e), l.attr('cx') && (l = s.$T(l, r, Qe())), o && s.$T(l, r, Qe())),
          l.attr('cx', e).attr('cy', a).style('fill', i)
        );
      },
    },
    rectangle: {
      create: function (t, e, a) {
        var i = function (r) {
          return e(r) * 2;
        };
        return t
          .append('rect')
          .attr('class', this.updatePointClass.bind(this))
          .attr('width', i)
          .attr('height', i)
          .style('fill', a)
          .node();
      },
      update: function (t, e, a, i, r, n, o) {
        var s = this,
          l = s.config.point_r,
          c = function (f) {
            return e(f) - l;
          },
          u = function (f) {
            return a(f) - l;
          },
          d = t;
        return (
          r && (n && d.attr('x', c), (d = s.$T(d, r, Qe())), o && s.$T(o, r, Qe())),
          d.attr('x', c).attr('y', u).style('fill', i)
        );
      },
    },
  };
function Yo(t) {
  return ye(t) && I(t.create) && I(t.update);
}
function Ho(t, e) {
  var a,
    i = this,
    r = function (c, u) {
      for (var d = c.attributes, f = 0, v; (v = d[f]); f++)
        ((v = v.name), u.setAttribute(v, c.getAttribute(v)));
    },
    n = new DOMParser().parseFromString(tt(t), 'image/svg+xml'),
    o = n.documentElement,
    s = te.createElementNS(mt.svg, o.nodeName.toLowerCase());
  if (
    ((s.id = e),
    (s.style.fill = 'inherit'),
    (s.style.stroke = 'inherit'),
    r(o, s),
    !((a = o.childNodes) === null || a === void 0) && a.length)
  ) {
    var l = L(s);
    'innerHTML' in s
      ? l.html(tt(o.innerHTML))
      : He(o.childNodes).forEach(function (c) {
          r(c, l.append(c.tagName).node());
        });
  }
  i.$el.defs.node().appendChild(s);
}
var st = {
  hasValidPointType: function (t) {
    return /^(circle|rect(angle)?|polygon|ellipse|use)$/i.test(t || this.config.point_type);
  },
  hasLegendDefsPoint: function () {
    var t,
      e = this.config;
    return (
      e.legend_show &&
      ((t = e.point_pattern) === null || t === void 0 ? void 0 : t.length) &&
      e.legend_usePoint
    );
  },
  getDefsPointId: function (t) {
    var e = this.state.datetimeId;
    return ''.concat(e, '-point').concat(t);
  },
  getValidPointPattern: function () {
    var t = this.config,
      e = /^(circle|rect(angle)?)$/i.test(t.point_type) ? t.point_type : 'circle';
    return le(t.point_pattern) ? t.point_pattern : [e];
  },
  generatePoint: function () {
    var t = this,
      e = t.$el,
      a = t.config,
      i = [],
      r = t.getValidPointPattern();
    return function (n, o) {
      for (var s = [], l = 2; l < arguments.length; l++) s[l - 2] = arguments[l];
      return function (c) {
        var u,
          d,
          f,
          v,
          g = t.getTargetSelectorSuffix(
            c.id || ((u = c.data) === null || u === void 0 ? void 0 : u.id) || c,
          ),
          h = L(this);
        i.indexOf(g) < 0 && i.push(g);
        var p = r[i.indexOf(g) % r.length];
        if (t.hasValidPointType(p)) p = t[p];
        else if (!Yo(p || a.point_type)) {
          var x = t.getDefsPointId(g),
            _ = e.defs.select('#'.concat(x));
          if ((_.size() < 1 && Ho.call(t, p, x), n === 'create'))
            return (d = t.custom) === null || d === void 0
              ? void 0
              : d.create.bind(o).apply(void 0, ne([h, x], s, !1));
          if (n === 'update')
            return (f = t.custom) === null || f === void 0
              ? void 0
              : f.update.bind(o).apply(void 0, ne([h], s, !1));
        }
        return (v = p[n]) === null || v === void 0
          ? void 0
          : v.bind(o).apply(void 0, ne([h], s, !1));
      };
    };
  },
};
function ma(t) {
  var e = t.config.polar_level_max,
    a = t.getMinMaxData().max[0].value;
  return (e && e > a && (a = e), a);
}
var Wo = {
  initPolar: function () {
    var t = this,
      e = t.$el.arcs,
      a = t.config,
      i = a.polar_level_text_show,
      r = a.polar_level_text_backgroundColor;
    ((e.levels = e.append('g').attr('class', Fe.levels)), i && r && t.generateTextBGColorFilter(r));
  },
  getPolarOuterRadius: function (t, e) {
    var a,
      i = ma(this);
    return (((a = t?.data.values[0].value) !== null && a !== void 0 ? a : 0) / i) * e;
  },
  updateTargetsForPolar: function (t) {
    this.updateTargetsForArc(t);
  },
  redrawPolar: function () {
    var t = this,
      e = t.config;
    e.polar_level_show && t.updatePolarLevel();
  },
  updatePolarLevel: function () {
    var t = this,
      e = t.config,
      a = t.state,
      i = t.$el.arcs.levels,
      r = e.polar_level_depth,
      n = ma(t),
      o = _t(0, r),
      s = a.radius,
      l = o.map(function (g) {
        return s * ((g + 1) / r);
      }),
      c = (e.polar_level_text_format || function () {}).bind(t.api),
      u = i.selectAll('.'.concat(Fe.level)).data(o);
    u.exit().remove();
    var d = u
      .enter()
      .append('g')
      .attr('class', function (g, h) {
        return ''.concat(Fe.level, ' ').concat(Fe.level, '-').concat(h);
      });
    if (
      (d.append('circle'),
      d
        .merge(u)
        .selectAll('circle')
        .style('visibility', e.polar_level_show ? null : 'hidden')
        .attr('cx', 0)
        .attr('cy', 0)
        .attr('r', function (g) {
          return l[g];
        }),
      e.polar_level_text_show)
    ) {
      var f = e.polar_level_text_backgroundColor,
        v = '#'.concat(a.datetimeId, '-labels-bg').concat(t.getTargetSelectorSuffix(f));
      (d.append('text').style('text-anchor', 'middle'),
        d
          .merge(u)
          .selectAll('text')
          .attr('dy', function (g) {
            return -l[g] + 5;
          })
          .attr('filter', f ? 'url('.concat(v, ')') : null)
          .text(function (g) {
            return c((n / o.length) * (g + 1));
          }));
    }
  },
};
function Uo(t, e, a, i, r, n) {
  var o = t && i > 0 ? a - i : i,
    s = 2 * Math.PI,
    l = e === 'x' ? Math.sin : Math.cos;
  return r * (1 - n * l((o * s) / a));
}
var et = re.radarPoints,
  ya = re.radarTextWidth,
  jo = {
    initRadar: function () {
      var t = this,
        e = t.config,
        a = t.state.current,
        i = t.$el;
      t.hasType('radar') &&
        ((i.radar = i.main.select('.'.concat(z.chart)).append('g').attr('class', Sa.chartRadars)),
        (i.radar.levels = i.radar.append('g').attr('class', Fe.levels)),
        (i.radar.axes = i.radar.append('g').attr('class', ue.axis)),
        (i.radar.shapes = i.radar.append('g').attr('class', oe.shapes)),
        (a.dataMax = e.radar_axis_max || t.getMinMaxData().max[0].value),
        e.radar_axis_text_show &&
          (e.interaction_enabled && t.bindRadarEvent(), t.updateRadarLevel(), t.updateRadarAxes()));
    },
    getRadarSize: function () {
      var t = this,
        e = t.config,
        a = t.state,
        i = a.arcWidth,
        r = a.arcHeight,
        n = e.axis_x_categories.length < 4 ? -20 : 10,
        o = (Math.min(i, r) - n) / 2;
      return [o, o];
    },
    updateTargetsForRadar: function (t) {
      var e = this,
        a = e.config;
      ($e(a.axis_x_categories) &&
        (a.axis_x_categories = _t(
          0,
          Re(
            'max',
            t.map(function (i) {
              return i.values.length;
            }),
          ),
        )),
        e.generateRadarPoints());
    },
    getRadarPosition: function (t, e, a, i) {
      var r = this,
        n = r.config,
        o = r.getRadarSize(),
        s = o[0],
        l = o[1],
        c = n.axis_x_categories.length,
        u = n.radar_direction_clockwise,
        d = He(t).map(function (f) {
          return Uo(u, f, c, e, q(a) ? a : t === 'x' ? s : l, P(i) ? i : n.radar_size_ratio);
        });
      return d.length === 1 ? d[0] : d;
    },
    generateRadarPoints: function () {
      var t = this,
        e = t.data.targets,
        a = t.getRadarSize(),
        i = a[0],
        r = a[1],
        n = t.cache.get(et) || {},
        o = n._size;
      (!o || (o.width !== i && o.height !== r)) &&
        (e.forEach(function (s) {
          n[s.id] = s.values.map(function (l, c) {
            return t.getRadarPosition(['x', 'y'], c, void 0, t.getRatio('radar', l));
          });
        }),
        (n._size = { width: i, height: r }),
        t.cache.add(et, n));
    },
    redrawRadar: function () {
      var t = this,
        e = t.$el,
        a = e.radar,
        i = e.main,
        r = t.getTranslate('radar');
      r &&
        (a.attr('transform', r),
        i.select('.'.concat(ce.chartTexts)).attr('transform', r),
        t.generateRadarPoints(),
        t.updateRadarLevel(),
        t.updateRadarAxes(),
        t.updateRadarShape());
    },
    generateGetRadarPoints: function () {
      var t = this.cache.get(et);
      return function (e, a) {
        var i = t[e.id][a];
        return [i, i, i, i];
      };
    },
    updateRadarLevel: function () {
      var t = this,
        e = t.config,
        a = t.state,
        i = t.$el.radar,
        r = t.getRadarSize(),
        n = r[0],
        o = r[1],
        s = e.radar_level_depth,
        l = e.axis_x_categories.length,
        c = e.radar_level_text_show,
        u = i.levels,
        d = _t(0, s),
        f = e.radar_size_ratio * Math.min(n, o),
        v = d.map(function (_) {
          return f * ((_ + 1) / s);
        }),
        g = (e.radar_level_text_format || function () {}).bind(t.api),
        h = d.map(function (_) {
          var m = v[_],
            y = _t(0, l).map(function (T) {
              return t.getRadarPosition(['x', 'y'], T, m, 1).join(',');
            });
          return y.join(' ');
        }),
        p = u.selectAll('.'.concat(Fe.level)).data(d);
      p.exit().remove();
      var x = p
        .enter()
        .append('g')
        .attr('class', function (_, m) {
          return ''.concat(Fe.level, ' ').concat(Fe.level, '-').concat(m);
        });
      (x.append('polygon').style('visibility', e.radar_level_show ? null : 'hidden'),
        c &&
          (u.select('text').empty() &&
            u
              .append('text')
              .attr('dx', '-.5em')
              .attr('dy', '-.7em')
              .style('text-anchor', 'end')
              .text(function () {
                return g(0);
              }),
          x
            .append('text')
            .attr('dx', '-.5em')
            .style('text-anchor', 'end')
            .text(function (_) {
              return g((a.current.dataMax / d.length) * (_ + 1));
            })),
        x
          .merge(p)
          .attr('transform', function (_) {
            return 'translate('.concat(n - v[_], ', ').concat(o - v[_], ')');
          })
          .selectAll('polygon')
          .attr('points', function (_) {
            return h[_];
          }),
        c &&
          u
            .selectAll('text')
            .attr('x', function (_) {
              return se(_) ? n : h[_].split(',')[0];
            })
            .attr('y', function (_) {
              return se(_) ? o : 0;
            }));
    },
    updateRadarAxes: function () {
      var t = this,
        e = t.config,
        a = t.$el.radar,
        i = t.getRadarSize(),
        r = i[0],
        n = i[1],
        o = e.axis_x_categories,
        s = a.axes.selectAll('g').data(o);
      s.exit().remove();
      var l = s
        .enter()
        .append('g')
        .attr('class', function (p, x) {
          return ''.concat(ue.axis, '-').concat(x);
        });
      if (
        (e.radar_axis_line_show && l.append('line'),
        e.radar_axis_text_show && l.append('text'),
        (s = l.merge(s)),
        e.radar_axis_line_show &&
          s
            .select('line')
            .attr('x1', r)
            .attr('y1', n)
            .attr('x2', function (p, x) {
              return t.getRadarPosition('x', x);
            })
            .attr('y2', function (p, x) {
              return t.getRadarPosition('y', x);
            }),
        e.radar_axis_text_show)
      ) {
        var c = e.radar_axis_text_position,
          u = c.x,
          d = u === void 0 ? 0 : u,
          f = c.y,
          v = f === void 0 ? 0 : f,
          g = t.cache.get(ya) || 0;
        if (
          (s
            .select('text')
            .style('text-anchor', 'middle')
            .attr('dy', '.5em')
            .call(function (p) {
              p.each(function (x) {
                at(L(this), String(x), [-0.6, 1.2]);
              });
            })
            .datum(function (p, x) {
              return { index: x };
            })
            .attr('transform', function (p) {
              se(this.width) && (this.width = fe(this, !0).width / 2);
              var x = t.getRadarPosition('x', p.index, void 0, 1),
                _ = Math.round(t.getRadarPosition('y', p.index, void 0, 1));
              return (
                x > r ? (x += this.width + d) : Math.round(x) < r && (x -= this.width + d),
                _ > n
                  ? (_ / 2 === n &&
                      this.firstChild.tagName === 'tspan' &&
                      this.firstChild.setAttribute('dy', '0em'),
                    (_ += v))
                  : _ < n && (_ -= v),
                'translate('.concat(x, ' ').concat(_, ')')
              );
            }),
          !g)
        ) {
          var h = [a.axes, a.levels].map(function (p) {
            return za(p.node()).width;
          });
          h.every(function (p) {
            return p > 0;
          }) && t.cache.add(ya, h[0] - h[1]);
        }
      }
    },
    bindRadarEvent: function () {
      var t = this,
        e = t.config,
        a = t.state,
        i = t.$el,
        r = i.radar,
        n = i.svg,
        o = t.isPointFocusOnly(),
        s = a.inputType,
        l = a.transiting,
        c = s === 'mouse',
        u = function (d) {
          if (((a.event = d), !!e.interaction_onout)) {
            var f = t.getDataIndexFromEvent(d),
              v = se(f);
            (c || v) &&
              (t.hideTooltip(),
              o ? t.hideCircleFocus() : t.unexpandCircles(),
              c ? t.setOverOut(!1, f) : v && t.callOverOutForTouch());
          }
        };
      (r.axes
        .on(
          c ? 'mouseover ' : 'touchstart',
          function (d) {
            if (!l) {
              a.event = d;
              var f = t.getDataIndexFromEvent(d);
              (t.selectRectForSingle(n.node(), f),
                c ? t.setOverOut(!0, f) : t.callOverOutForTouch(f));
            }
          },
          c ? void 0 : { passive: !0 },
        )
        .on('mouseout', c ? u : null),
        c || n.on('touchstart', u, { passive: !0 }));
    },
    updateRadarShape: function () {
      var t = this,
        e = t.data.targets.filter(function (n) {
          return t.isRadarType(n);
        }),
        a = t.cache.get(et),
        i = t.$el.radar.shapes.selectAll('polygon').data(t.filterNullish(e)),
        r = i.enter().append('g').attr('class', t.getChartClass('Radar'));
      (t.$T(i.exit()).remove(),
        r
          .append('polygon')
          .merge(i)
          .style('fill', t.color)
          .style('stroke', t.color)
          .attr('points', function (n) {
            return a[n.id].join(' ');
          }),
        t.updateTargetForCircle(e, r));
    },
    radarCircleX: function (t) {
      return this.cache.get(et)[t.id][t.index][0];
    },
    radarCircleY: function (t) {
      return this.cache.get(et)[t.id][t.index][1];
    },
  };
function Zo(t, e) {
  var a = this,
    i = a.scale,
    r = i.x,
    n = i.y,
    o = a.state.width;
  t.selectAll('g')
    .attr('transform', function (s) {
      return 'translate('.concat(s === e ? '0,0' : ''.concat(r(s.x0), ',').concat(n(s.y0)), ')');
    })
    .select('rect')
    .attr('width', function (s) {
      return s === e ? o : r(s.x1) - r(s.x0);
    })
    .attr('height', function (s) {
      return s === e ? 0 : n(s.y1) - n(s.y0);
    });
}
function Ko(t) {
  var e = this;
  return t.map(function (a) {
    var i = a.id,
      r = a.values,
      n = r[0].value;
    return { name: i, id: i, value: n, ratio: e.getRatio('treemap', r[0]) };
  });
}
function qo(t) {
  var e = this,
    a = Qi(t).sum(function (r) {
      return r.value;
    }),
    i = e.getSortCompareFn(!0);
  return [e.treemap(i ? a.sort(i) : a)];
}
var Jo = {
    initTreemap: function () {
      var t = this,
        e = t.$el,
        a = t.state,
        i = a.current,
        r = i.width,
        n = i.height,
        o = a.clip,
        s = a.datetimeId;
      ((o.id = ''.concat(s, '-clip')),
        (t.treemap = Zi().tile(t.getTreemapTile())),
        e.defs
          .append('clipPath')
          .attr('id', o.id)
          .append('rect')
          .attr('width', r)
          .attr('height', n),
        (e.treemap = e.main
          .select('.'.concat(z.chart))
          .attr('clip-path', 'url(#'.concat(o.id, ')'))
          .append('g')
          .classed(La.chartTreemaps, !0)),
        t.bindTreemapEvent());
    },
    bindTreemapEvent: function () {
      var t = this,
        e = t.$el,
        a = t.config,
        i = t.state,
        r = function (o) {
          var s,
            l = o.isTrusted
              ? o.target
              : (s = i.eventReceiver.rect) === null || s === void 0
                ? void 0
                : s.node(),
            c;
          return (/^rect$/i.test(l.tagName) && ((i.event = o), (c = L(l).datum())), c?.data);
        };
      if (a.interaction_enabled) {
        var n = i.inputType === 'touch';
        e.treemap
          .on(
            n ? 'touchstart' : 'mouseover mousemove',
            function (o) {
              var s = r(o);
              s &&
                (t.showTooltip([s], o.currentTarget),
                /^(touchstart|mouseover)$/.test(o.type) && t.setOverOut(!0, s));
            },
            n ? { passive: !0 } : void 0,
          )
          .on(n ? 'touchend' : 'mouseout', function (o) {
            var s = r(o);
            a.interaction_onout && (t.hideTooltip(), t.setOverOut(!1, s));
          });
      }
    },
    getTreemapTile: function () {
      var t,
        e,
        a = this,
        i = a.config,
        r = a.state.current,
        n = r.width,
        o = r.height,
        s =
          (e = { binary: Kt, dice: ji, slice: Ui, sliceDice: Wi, squarify: Hi, resquarify: Yi }[
            (t = i.treemap_tile) !== null && t !== void 0 ? t : 'binary'
          ]) !== null && e !== void 0
            ? e
            : Kt;
      return function (l, c, u, d, f) {
        s(l, 0, 0, n, o);
        for (var v = 0, g = l.children; v < g.length; v++) {
          var h = g[v];
          ((h.x0 = c + (h.x0 / n) * (d - c)),
            (h.x1 = c + (h.x1 / n) * (d - c)),
            (h.y0 = u + (h.y0 / o) * (f - u)),
            (h.y1 = u + (h.y1 / o) * (f - u)));
        }
      };
    },
    getTreemapData: function (t) {
      var e = this;
      return {
        name: 'root',
        children: Ko.bind(e)(e.filterTargetsToShow(t.filter(e.isTreemapType, e))),
      };
    },
    updateTargetsForTreemap: function (t) {
      var e = this,
        a = e.$el.treemap,
        i = qo.call(e, e.getTreemapData(t ?? e.data.targets));
      a.data(e.filterNullish(i));
    },
    updateTreemap: function (t) {
      var e = this,
        a = e.$el,
        i = e.$T,
        r = a.treemap.datum(),
        n = e.getChartClass('Treemap'),
        o = e.getClass('treemap', !0),
        s = a.treemap.selectAll('g').data(r.children);
      (i(s.exit(), t).style('opacity', '0').remove(),
        s.enter().append('g').append('rect'),
        a.treemap
          .selectAll('g')
          .attr('class', n)
          .select('rect')
          .attr('class', o)
          .attr('fill', function (l) {
            return e.color(l.data.name);
          }));
    },
    generateGetTreemapPoints: function () {
      var t = this,
        e = t.$el,
        a = t.scale,
        i = a.x,
        r = a.y,
        n = {};
      return (
        e.treemap.selectAll('g').each(function (o) {
          n[o.data.name] = [
            [i(o.x0), r(o.y0)],
            [i(o.x1), r(o.y1)],
          ];
        }),
        function (o) {
          return n[o.id];
        }
      );
    },
    redrawTreemap: function (t) {
      var e = this,
        a = e.$el,
        i = e.state.current,
        r = i.width,
        n = i.height;
      return (
        a.defs.select('rect').attr('width', r).attr('height', n),
        [e.$T(a.treemap, t, Ce()).call(Zo.bind(e), a.treemap.datum())]
      );
    },
    treemapDataLabelFormat: function (t) {
      var e = this,
        a = e.$el.treemap,
        i = e.config,
        r = e.scale,
        n = r.x,
        o = r.y,
        s = t.id,
        l = t.value,
        c = i.treemap_label_format,
        u = e.getRatio('treemap', t),
        d = (u * 100).toFixed(2),
        f = i.treemap_label_show && Ht.call(e, u, 'treemap') ? null : '0',
        v = a
          .selectAll('g')
          .filter(function (y) {
            return y.data.id === s;
          })
          .datum(),
        g = 0,
        h = 0;
      if (v) {
        var p = v.x0,
          x = v.x1,
          _ = v.y0,
          m = v.y1;
        ((g = n(x) - n(p)), (h = o(m) - o(_)));
      }
      return function (y) {
        return (
          y.style('opacity', f),
          I(c)
            ? c.bind(e.api)(l, u, s, { width: g, height: h })
            : ''
                .concat(
                  s,
                  `
`,
                )
                .concat(d, '%')
        );
      };
    },
  },
  Ze = {
    point_show: !0,
    point_r: 2.5,
    point_radialGradient: !1,
    point_sensitivity: 10,
    point_focus_expand_enabled: !0,
    point_focus_expand_r: void 0,
    point_focus_only: !1,
    point_opacity: void 0,
    point_pattern: [],
    point_select_r: void 0,
    point_type: 'circle',
  },
  lt = {
    area_above: !1,
    area_below: !1,
    area_front: !0,
    area_linearGradient: !1,
    area_zerobased: !0,
  },
  Qo = {
    bar_connectLine: !1,
    bar_front: !1,
    bar_indices_removeNull: !1,
    bar_label_threshold: 0,
    bar_linearGradient: !1,
    bar_overlap: !1,
    bar_padding: 0,
    bar_radius: void 0,
    bar_radius_ratio: void 0,
    bar_sensitivity: 2,
    bar_width: void 0,
    bar_width_ratio: 0.6,
    bar_width_max: void 0,
    bar_zerobased: !0,
  },
  es = { bubble_maxR: 35, bubble_zerobased: !1 },
  ts = {
    candlestick_width: void 0,
    candlestick_width_ratio: 0.6,
    candlestick_width_max: void 0,
    candlestick_color_down: 'red',
  },
  as = {
    line_connectNull: !1,
    line_step_type: 'step',
    line_step_tooltipMatch: !1,
    line_zerobased: !1,
    line_classes: void 0,
    line_point: !0,
  },
  is = { scatter_zerobased: !1 },
  Ut = { spline_interpolation_type: 'cardinal' },
  wt = {
    arc_cornerRadius: 0,
    arc_cornerRadius_ratio: 0,
    arc_needle_show: !1,
    arc_needle_color: void 0,
    arc_needle_value: void 0,
    arc_needle_path: void 0,
    arc_needle_length: 100,
    arc_needle_top_rx: 0,
    arc_needle_top_ry: 0,
    arc_needle_top_width: 0,
    arc_needle_bottom_rx: 1,
    arc_needle_bottom_ry: 1,
    arc_needle_bottom_width: 15,
    arc_needle_bottom_len: 0,
    arc_rangeText_values: void 0,
    arc_rangeText_unit: 'absolute',
    arc_rangeText_fixed: !1,
    arc_rangeText_format: void 0,
    arc_rangeText_position: void 0,
  },
  rs = {
    donut_label_show: !0,
    donut_label_format: void 0,
    donut_label_threshold: 0.05,
    donut_label_line: !1,
    donut_label_image: void 0,
    donut_label_ratio: void 0,
    donut_width: void 0,
    donut_title: '',
    donut_expand: {},
    donut_expand_rate: 0.98,
    donut_expand_duration: 50,
    donut_padAngle: 0,
    donut_startingAngle: 0,
  },
  ns = { funnel_neck_width: 0, funnel_neck_height: 0 },
  os = {
    gauge_background: '',
    gauge_fullCircle: !1,
    gauge_label_show: !0,
    gauge_label_extents: void 0,
    gauge_label_format: void 0,
    gauge_label_ratio: void 0,
    gauge_label_threshold: 0,
    gauge_label_line: !1,
    gauge_label_image: void 0,
    gauge_enforceMinMax: !1,
    gauge_min: 0,
    gauge_max: 100,
    gauge_type: 'single',
    gauge_startingAngle: (-1 * Math.PI) / 2,
    gauge_arcLength: 100,
    gauge_title: '',
    gauge_units: void 0,
    gauge_width: void 0,
    gauge_arcs_minWidth: 5,
    gauge_expand: {},
    gauge_expand_rate: 0.98,
    gauge_expand_duration: 50,
  },
  ss = {
    pie_label_show: !0,
    pie_label_format: void 0,
    pie_label_ratio: void 0,
    pie_label_threshold: 0.05,
    pie_label_line: !1,
    pie_label_image: void 0,
    pie_expand: {},
    pie_expand_rate: 0.98,
    pie_expand_duration: 50,
    pie_innerRadius: 0,
    pie_outerRadius: void 0,
    pie_padAngle: 0,
    pie_padding: 0,
    pie_startingAngle: 0,
  },
  ls = {
    polar_label_show: !0,
    polar_label_format: void 0,
    polar_label_threshold: 0.05,
    polar_label_line: !1,
    polar_label_image: void 0,
    polar_label_ratio: void 0,
    polar_level_depth: 3,
    polar_level_max: void 0,
    polar_level_show: !0,
    polar_level_text_backgroundColor: '#fff',
    polar_level_text_format: function (t) {
      return t % 1 === 0 ? t : t.toFixed(2);
    },
    polar_level_text_show: !0,
    polar_padAngle: 0,
    polar_padding: 0,
    polar_startingAngle: 0,
  },
  cs = {
    radar_axis_max: void 0,
    radar_axis_line_show: !0,
    radar_axis_text_show: !0,
    radar_axis_text_position: {},
    radar_level_depth: 3,
    radar_level_show: !0,
    radar_level_text_format: function (t) {
      return t % 1 === 0 ? t : t.toFixed(2);
    },
    radar_level_text_show: !0,
    radar_size_ratio: 0.87,
    radar_direction_clockwise: !1,
  },
  us = {
    treemap_tile: 'binary',
    treemap_label_format: void 0,
    treemap_label_threshold: 0.05,
    treemap_label_show: !0,
  };
function ct(t, e) {
  (ve(je.prototype, Object.values(ii).concat(t)),
    ve(nt.prototype, Ao),
    Ue.setOptions(Object.values(ri).concat(e || [])));
}
function Oe(t, e) {
  (ct([st, At, Vo].concat(t || [])), Ue.setOptions([Ze, as].concat(e || [])));
}
function ut(t, e) {
  (ve(je.prototype, [Oo, st].concat(t || [])), Ue.setOptions([Ze].concat(e || [])));
}
var ds = function () {
    return (
      Oe(ot, [lt]),
      (ds = function () {
        return E.AREA;
      })()
    );
  },
  fs = function () {
    return (
      Oe(ot, [lt]),
      (fs = function () {
        return E.AREA_LINE_RANGE;
      })()
    );
  },
  vs = function () {
    return (
      Oe(ot, [lt]),
      (vs = function () {
        return E.AREA_STEP_RANGE;
      })()
    );
  },
  gs = function () {
    return (
      Oe(ot, [lt, Ut]),
      (gs = function () {
        return E.AREA_SPLINE;
      })()
    );
  },
  hs = function () {
    return (
      Oe(ot, [lt, Ut]),
      (hs = function () {
        return E.AREA_SPLINE_RANGE;
      })()
    );
  },
  ps = function () {
    return (
      Oe(ot, [lt]),
      (ps = function () {
        return E.AREA_STEP;
      })()
    );
  },
  xs = function () {
    return (
      Oe(),
      (xs = function () {
        return E.LINE;
      })()
    );
  },
  _s = function () {
    return (
      Oe(void 0, [Ut]),
      (_s = function () {
        return E.SPLINE;
      })()
    );
  },
  ms = function () {
    return (
      Oe(),
      (ms = function () {
        return E.STEP;
      })()
    );
  },
  ys = function () {
    return (
      ut(void 0, [wt, rs]),
      (ys = function () {
        return E.DONUT;
      })()
    );
  },
  bs = function () {
    return (
      ut([Xo], [wt, os]),
      (bs = function () {
        return E.GAUGE;
      })()
    );
  },
  Ts = function () {
    return (
      ut(void 0, [wt, ss]),
      (Ts = function () {
        return E.PIE;
      })()
    );
  },
  $s = function () {
    return (
      ut([Wo], [wt, ls]),
      ($s = function () {
        return E.POLAR;
      })()
    );
  },
  As = function () {
    return (
      ut([ii.eventrect, At, jo], [Ze, cs, { axis_x_categories: ri.optAxis.axis_x_categories }]),
      (As = function () {
        return E.RADAR;
      })()
    );
  },
  ws = function () {
    return (
      ct([Po, st], [Qo, Ze]),
      (ws = function () {
        return E.BAR;
      })()
    );
  },
  Rs = function () {
    return (
      ct([st, At, Do], [es, Ze]),
      (Rs = function () {
        return E.BUBBLE;
      })()
    );
  },
  Ss = function () {
    return (
      ct([zo, st], [ts, Ze]),
      (Ss = function () {
        return E.CANDLESTICK;
      })()
    );
  },
  Cs = function () {
    return (
      ct([st, At], [Ze, is]),
      (Cs = function () {
        return E.SCATTER;
      })()
    );
  },
  Ls = function () {
    return (
      ut([Bo], [ns]),
      (Ls = function () {
        return E.FUNNEL;
      })()
    );
  },
  Es = function () {
    return (
      ct([Jo], [us]),
      (Es = function () {
        return E.TREEMAP;
      })()
    );
  };
function ba(t, e, a, i) {
  t === void 0 && (t = !1);
  var r = this,
    n = r.config,
    o = r.$el.main,
    s = n.data_selection_grouped,
    l = n.data_selection_isselectable.bind(r.api);
  n.data_selection_enabled &&
    o
      .selectAll('.'.concat(oe.shapes))
      .selectAll('.'.concat(oe.shape))
      .each(function (c) {
        var u = L(this),
          d = c.data ? c.data : c,
          f = d.id,
          v = d.index,
          g = r.getToggle(this, c).bind(r),
          h = s || !e || e.indexOf(f) >= 0,
          p = !a || a.indexOf(v) >= 0,
          x = u.classed(ee.SELECTED);
        u.classed(Ie.line) ||
          u.classed(yt.area) ||
          (t
            ? h && p && l(c) && !x
              ? g(!0, u.classed(ee.SELECTED, !0), c, v)
              : q(i) && i && x && g(!1, u.classed(ee.SELECTED, !1), c, v)
            : h && p && l(c) && x && g(!1, u.classed(ee.SELECTED, !1), c, v));
      });
}
var ks = {
    selected: function (t) {
      var e = this.internal,
        a = [];
      return (
        e.$el.main
          .selectAll('.'.concat(oe.shapes + e.getTargetSelectorSuffix(t)))
          .selectAll('.'.concat(oe.shape))
          .filter(function () {
            return L(this).classed(ee.SELECTED);
          })
          .each(function (i) {
            return a.push(i);
          }),
        a
      );
    },
    select: function (t, e, a) {
      var i = this.internal;
      ba.bind(i)(!0, t, e, a);
    },
    unselect: function (t, e) {
      var a = this.internal;
      ba.bind(a)(!1, t, e);
    },
  },
  li = function (t) {
    var e,
      a = this.internal,
      i = a.axis,
      r = a.brush,
      n = a.config,
      o = a.scale,
      s = o.x,
      l = o.subX,
      c = a.state,
      u;
    if (n.subchart_show)
      if (((u = t), Array.isArray(u))) {
        i.isTimeSeries() &&
          (u = u.map(function (f) {
            return Ae.bind(a)(f);
          }));
        var d = a.withinRange(u, a.getZoomDomain('subX', !0), a.getZoomDomain('subX'));
        d && ((c.domain = u), r.move(r.getSelection(), u.map(l)));
      } else u = (e = c.domain) !== null && e !== void 0 ? e : s.orgDomain();
    return u;
  };
ve(li, {
  show: function () {
    var t,
      e,
      a = this.internal,
      i = a.$el.subchart,
      r = a.config,
      n = r.subchart_show;
    if (!n) {
      (a.unbindZoomEvent(), (r.subchart_show = !n), !i.main && a.initSubchart());
      var o = i.main.selectAll('.'.concat(z.target));
      (a.data.targets.length !== o.size() &&
        (a.updateSizes(),
        a.updateTargetsForSubchart(a.data.targets),
        (o = (t = i.main) === null || t === void 0 ? void 0 : t.selectAll('.'.concat(z.target)))),
        o?.style('opacity', null),
        (e = i.main) === null || e === void 0 || e.style('display', null),
        this.resize());
    }
  },
  hide: function () {
    var t = this.internal,
      e = t.$el.subchart.main,
      a = t.config;
    a.subchart_show &&
      e?.style('display') !== 'none' &&
      ((a.subchart_show = !1), e.style('display', 'none'), this.resize());
  },
  toggle: function () {
    var t = this.internal,
      e = t.config;
    this.subchart[e.subchart_show ? 'hide' : 'show']();
  },
  reset: function () {
    var t = this.internal,
      e = t.brush;
    e.clear(e.getSelection());
  },
});
var Is = { subchart: li },
  ci = function (t) {
    var e,
      a = this.internal,
      i = a.axis,
      r = a.config,
      n = a.org,
      o = a.scale,
      s = a.state,
      l = i.isCategorized(),
      c;
    if (r.zoom_enabled)
      if (((c = t), Array.isArray(c))) {
        i.isTimeSeries() &&
          (c = c.map(function (f) {
            return Ae.bind(a)(f);
          }));
        var u = a.withinRange(c, a.getZoomDomain('zoom', !0), a.getZoomDomain('zoom'));
        if (u) {
          if (
            ((s.domain = c), (c = a.getZoomDomainValue(c)), a.api.tooltip.hide(), r.subchart_show)
          ) {
            var d = o.zoom || o.x;
            a.brush.getSelection().call(a.brush.move, c.map(d));
          } else {
            var d = l ? o.x.orgScale() : n.xScale || o.x;
            a.updateCurrentZoomTransform(d, c);
          }
          a.setZoomResetButton();
        }
      } else c = a.zoom.getDomain();
    return (e = s.domain) !== null && e !== void 0 ? e : c;
  };
ve(ci, {
  enable: function (t) {
    var e = this.internal,
      a = e.config;
    (/^(drag|wheel)$/.test(t) && (a.zoom_type = t),
      (a.zoom_enabled = !!t),
      e.zoom ? t === !1 && e.bindZoomEvent(!1) : (e.initZoom(), e.bindZoomEvent()),
      e.updateAndRedraw());
  },
  max: function (t) {
    var e = this.internal,
      a = e.config,
      i = e.org.xDomain;
    return ((t === 0 || t) && (a.zoom_x_max = Re('max', [i[1], t])), a.zoom_x_max);
  },
  min: function (t) {
    var e = this.internal,
      a = e.config,
      i = e.org.xDomain;
    return ((t === 0 || t) && (a.zoom_x_min = Re('min', [i[0], t])), a.zoom_x_min);
  },
  range: function (t) {
    var e = this.zoom;
    if (W(t)) {
      var a = t.min,
        i = t.max;
      (q(a) && e.min(a), q(i) && e.max(i));
    }
    return { min: e.min(), max: e.max() };
  },
});
var Os = {
    zoom: ci,
    unzoom: function () {
      var t = this.internal,
        e = t.config,
        a = t.$el,
        i = a.eventRect,
        r = a.zoomResetBtn,
        n = t.scale.zoom,
        o = t.state;
      n &&
        (e.subchart_show
          ? t.brush.getSelection().call(t.brush.move, null)
          : t.zoom.updateTransformScale(Ve),
        t.updateZoom(!0),
        r?.style('display', 'none'),
        Ra(i.node()) !== Ve && t.zoom.transform(i, Ve),
        (o.domain = void 0));
    },
  },
  Ps = {
    initBrush: function () {
      var t = this,
        e = t.config,
        a = t.scale,
        i = t.$el.subchart,
        r = t.state,
        n = e.axis_rotated,
        o = e.subchart_size_height,
        s,
        l,
        c;
      ((t.brush = (n ? Ki() : qi()).handleSize(5)),
        t.brush.on('start brush end', function (u) {
          var d = u.selection,
            f = u.sourceEvent,
            v = u.target,
            g = u.type;
          (g === 'start' && (t.state.inputType === 'touch' && t.hideTooltip(), (l = f ? d : null)),
            /(start|brush)/.test(g) &&
              (g === 'brush' &&
                f &&
                r.domain &&
                l?.forEach(function (h, p) {
                  h !== d[p] && (r.domain[p] = a.x.orgDomain()[p]);
                }),
              t.redrawForBrush(g !== 'start')),
            g === 'end' && (s = a.x.orgDomain()),
            v?.handle &&
              (d === null
                ? t.brush.handle.attr('display', 'none')
                : t.brush.handle.attr('display', null).attr('transform', function (h, p) {
                    var x = [d[p], o / 2];
                    return 'translate('.concat(n ? x.reverse() : x, ')');
                  })));
        }),
        (t.brush.updateResize = function () {
          var u = this;
          (c && clearTimeout(c),
            (c = setTimeout(function () {
              var d = u.getSelection();
              s && wa(d.node()) && u.move(d, s.map(a.subX.orgScale()));
            }, 0)));
        }),
        (t.brush.update = function () {
          var u,
            d = this.extent()();
          return (
            d[1].filter(function (f) {
              return isNaN(f);
            }).length === 0 &&
              ((u = i.main) === null || u === void 0 || u.select('.'.concat(U.brush)).call(this)),
            this
          );
        }),
        (t.brush.scale = function (u) {
          var d = e.subchart_size_height,
            f = t.axis.getExtent();
          (!f && u.range
            ? (f = [
                [0, 0],
                [u.range()[1], d],
              ])
            : j(f) &&
              (f = f.map(function (v, g) {
                return [v, g > 0 ? d : g];
              })),
            n && f[1].reverse(),
            this.extent(f),
            this.update());
        }),
        (t.brush.getSelection = function () {
          return i.main ? i.main.select('.'.concat(U.brush)) : L([]);
        }));
    },
    initSubchart: function () {
      var t = this,
        e = t.config,
        a = t.state,
        i = a.clip,
        r = a.hasAxis,
        n = t.$el,
        o = n.defs,
        s = n.svg,
        l = n.subchart,
        c = n.axis;
      if (r) {
        var u = e.subchart_show ? null : 'hidden',
          d = ''.concat(i.id, '-subchart'),
          f = t.getClipPath(d);
        ((i.idSubchart = d),
          t.appendClip(o, d),
          t.initBrush(),
          (l.main = s
            .append('g')
            .classed(U.subchart, !0)
            .attr('transform', t.getTranslate('context'))));
        var v = l.main;
        (v.style('visibility', u),
          v.append('g').attr('clip-path', f).attr('class', U.chart),
          ['bar', 'line', 'bubble', 'candlestick', 'scatter'].forEach(function (h) {
            var p = pe(/^(bubble|scatter)$/.test(h) ? 'circle' : h);
            if (t.hasType(h) || t.hasTypeOf(p)) {
              var x = v.select('.'.concat(U.chart)),
                _ = U['chart'.concat(p, 's')];
              x.select('.'.concat(_)).empty() && x.append('g').attr('class', _);
            }
          }));
        var g = v.append('g').attr('clip-path', f).attr('class', U.brush).call(t.brush);
        (e.subchart_showHandle && t.addBrushHandle(g),
          (c.subX = v
            .append('g')
            .attr('class', U.axisX)
            .attr('transform', t.getTranslate('subX'))
            .attr('clip-path', e.axis_rotated ? '' : i.pathXAxis)
            .style('visibility', e.subchart_axis_x_show ? u : 'hidden')));
      }
    },
    addBrushHandle: function (t) {
      var e = this,
        a = e.config,
        i = a.axis_rotated,
        r = a.subchart_init_range,
        n = 'handle--custom',
        o = i
          ? [
              'M8.5 0 a6 6 0 0 0 -6 -6.5 H-2.5 a 6 6 0 0 0 -6 6.5 z m-5 -2 H-3.5 m7 -2 H-3.5z',
              'M8.5 0 a6 -6 0 0 1 -6 6.5 H-2.5 a 6 -6 0 0 1 -6 -6.5z m-5 2 H-3.5 m7 2 H-3.5z',
            ]
          : [
              'M0 -8.5 A6 6 0 0 0 -6.5 -3.5 V2.5 A6 6 0 0 0 0 8.5 Z M-2 -3.5 V3.5 M-4 -3.5 V3.5z',
              'M0 -8.5 A6 6 0 0 1 6.5 -3.5 V2.5 A6 6 0 0 1 0 8.5 Z M2 -3.5 V3.5 M4 -3.5 V3.5z',
            ];
      e.brush.handle = t
        .selectAll('.'.concat(n))
        .data(i ? [{ type: 'n' }, { type: 's' }] : [{ type: 'w' }, { type: 'e' }])
        .enter()
        .append('path')
        .attr('class', n)
        .attr('cursor', ''.concat(i ? 'ns' : 'ew', '-resize'))
        .attr('d', function (s) {
          return o[+/[se]/.test(s.type)];
        })
        .attr('display', r ? null : 'none');
    },
    updateTargetsForSubchart: function (t) {
      var e = this,
        a = e.config,
        i = e.state,
        r = e.$el.subchart.main;
      a.subchart_show &&
        (['bar', 'line', 'bubble', 'candlestick', 'scatter']
          .filter(function (n) {
            return e.hasType(n) || e.hasTypeOf(pe(n));
          })
          .forEach(function (n) {
            var o = /^(bubble|scatter)$/.test(n),
              s = pe(o ? 'circle' : n),
              l = e.getChartClass(s, !0),
              c = e.getClass(o ? 'circles' : ''.concat(n, 's'), !0),
              u = r.select('.'.concat(U['chart'.concat(''.concat(s, 's'))]));
            if (o) {
              var d = u
                .selectAll('.'.concat(U.circles))
                .data(t.filter(e['is'.concat(pe(n), 'Type')].bind(e)))
                .attr('class', c);
              (d.exit().remove(), d.enter().append('g').attr('class', c));
            } else {
              var f = u
                  .selectAll('.'.concat(U['chart'.concat(s)]))
                  .attr('class', l)
                  .data(t.filter(e['is'.concat(s, 'Type')].bind(e))),
                v = f
                  .enter()
                  .append('g')
                  .style('opacity', '0')
                  .attr('class', l)
                  .append('g')
                  .attr('class', c);
              (f.exit().remove(),
                n === 'line' &&
                  e.hasTypeOf('Area') &&
                  v.append('g').attr('class', e.getClass('areas', !0)));
            }
          }),
        r
          .selectAll('.'.concat(U.brush, ' rect'))
          .attr(a.axis_rotated ? 'width' : 'height', a.axis_rotated ? i.width2 : i.height2));
    },
    redrawSubchart: function (t, e, a) {
      var i,
        r = this,
        n = r.config,
        o = r.$el.subchart.main,
        s = r.state,
        l = !!e;
      if (
        (o.style('visibility', n.subchart_show ? null : 'hidden'),
        n.subchart_show &&
          (((i = s.event) === null || i === void 0 ? void 0 : i.type) === 'zoom' &&
            r.brush.update(),
          t))
      ) {
        var c = n.subchart_init_range;
        if (
          (!Ma(r) && r.brush.update(),
          Object.keys(a.type).forEach(function (f) {
            var v = pe(f),
              g = r['generateDraw'.concat(v)](a.indices[f], !0);
            (r['update'.concat(v)](l, !0), r['redraw'.concat(v)](g, l, !0));
          }),
          r.hasType('bubble') || r.hasType('scatter'))
        ) {
          var u = a.pos.cx,
            d = r.updateCircleY(!0);
          (r.updateCircle(!0), r.redrawCircle(u, d, l, void 0, !0));
        }
        !s.rendered &&
          c &&
          ((s.domain = c), r.brush.move(r.brush.getSelection(), c.map(r.scale.x)));
      }
    },
    redrawForBrush: function (t) {
      var e;
      t === void 0 && (t = !0);
      var a = this,
        i = a.config,
        r = i.subchart_onbrush,
        n = i.zoom_rescale,
        o = a.scale,
        s = a.state;
      (a.redraw({
        withTransition: !1,
        withY: n,
        withSubchart: !1,
        withUpdateXDomain: !0,
        withDimension: !1,
      }),
        t &&
          s.rendered &&
          r.bind(a.api)((e = s.domain) !== null && e !== void 0 ? e : o.x.orgDomain()));
    },
    transformContext: function (t, e) {
      var a = this,
        i = a.$el.subchart,
        r = a.$T,
        n = e?.axisSubX ? e.axisSubX : r(i.main.select('.'.concat(U.axisX)), t);
      (i.main.attr('transform', a.getTranslate('context')),
        n.attr('transform', a.getTranslate('subX')));
    },
  },
  Ds = {
    initZoom: function () {
      var t = this;
      ((t.scale.zoom = null),
        t.generateZoom(),
        t.config.zoom_type === 'drag' && t.initZoomBehaviour());
    },
    bindZoomEvent: function (t) {
      t === void 0 && (t = !0);
      var e = this,
        a = e.config,
        i = a.zoom_enabled;
      i && t
        ? !a.subchart_show && e.bindZoomOnEventRect()
        : t === !1 && (e.api.unzoom(), e.unbindZoomEvent());
    },
    generateZoom: function () {
      var t = this,
        e = t.config,
        a = t.org,
        i = t.scale,
        r = Ji()
          .duration(0)
          .on('start', t.onZoomStart.bind(t))
          .on('zoom', t.onZoom.bind(t))
          .on('end', t.onZoomEnd.bind(t));
      ((r.orgScaleExtent = function () {
        var n = e.zoom_extent || [1, 10];
        return [n[0], Math.max(t.getMaxDataCount() / n[1], n[1])];
      }),
        (r.updateScaleExtent = function () {
          var n = Ye(t.scale.x.orgDomain()) / Ye(t.getZoomDomain()),
            o = this.orgScaleExtent();
          return (this.scaleExtent([o[0] * n, o[1] * n]), this);
        }),
        (r.updateTransformScale = function (n, o) {
          var s,
            l = e.axis_rotated;
          (s = a.xScale) === null || s === void 0 || s.range(i.x.range());
          var c = n[l ? 'rescaleY' : 'rescaleX'](a.xScale || i.x);
          if (
            !c.domain().some(function (h) {
              return /(Invalid Date|NaN)/.test(h.toString());
            })
          ) {
            var u = t.trimXDomain(c.domain()),
              d = e.zoom_rescale;
            if ((c.domain(u, a.xDomain), o)) {
              var f = c(i.x.domain()[0]),
                v = l ? n.x : f,
                g = l ? f : n.y;
              t.$el.eventRect.property('__zoom', Ve.translate(v, g).scale(n.k));
            }
            ((i.zoom = t.getCustomizedXScale(c)),
              t.axis.x.scale(i.zoom),
              d
                ? (!a.xScale && (a.xScale = i.x.copy()), i.x.domain(u))
                : a.xScale && (i.x.domain(a.xScale.domain()), (a.xScale = null)));
          }
        }),
        (r.getDomain = function () {
          var n = i[i.zoom ? 'zoom' : 'subX'].domain(),
            o = t.axis.isCategorized();
          return (o && (n[1] -= 2), n);
        }),
        (t.zoom = r));
    },
    onZoomStart: function (t) {
      var e = this,
        a = t.sourceEvent;
      a &&
        ((e.zoom.startEvent = a), (e.state.zooming = !0), Q(e.config.zoom_onzoomstart, e.api, t));
    },
    onZoom: function (t) {
      var e = this,
        a = e.config,
        i = e.scale,
        r = e.state,
        n = e.org,
        o = t.sourceEvent,
        s = t?.transform === Ve;
      if (
        !(
          !a.zoom_enabled ||
          e.filterTargetsToShow(e.data.targets).length === 0 ||
          (!i.zoom && o?.type.indexOf('touch') > -1 && o?.touches.length === 1)
        )
      ) {
        t.sourceEvent && ((r.zooming = !0), (r.domain = void 0));
        var l = o?.type === 'mousemove',
          c = o?.wheelDelta < 0,
          u = t.transform;
        (!l &&
          c &&
          i.x.domain().every(function (g, h) {
            return g !== n.xDomain[h];
          }) &&
          i.x.domain(n.xDomain),
          e.zoom.updateTransformScale(u, a.zoom_type === 'wheel' && o));
        var d =
            a.transition_duration > 0 && !a.subchart_show && (r.dragging || s || !t.sourceEvent),
          f = o && l && a.zoom_type !== 'wheel',
          v = function () {
            var g;
            (e.redraw({
              withTransition: d,
              withY: a.zoom_rescale,
              withSubchart: !1,
              withEventRect: !1,
              withDimension: !1,
            }),
              (e.state.cancelClick = l),
              !s &&
                Q(
                  a.zoom_onzoom,
                  e.api,
                  (g = e.state.domain) !== null && g !== void 0 ? g : e.zoom.getDomain(),
                ));
          };
        f ? Na(e.state, v) : v();
      }
    },
    onZoomEnd: function (t) {
      var e,
        a,
        i = this,
        r = i.config,
        n = i.state,
        o = i.zoom.startEvent,
        s = t?.sourceEvent,
        l = t?.transform === Ve;
      (o?.type.indexOf('touch') > -1 &&
        ((o = o.changedTouches[0]),
        (s = (e = s?.changedTouches) === null || e === void 0 ? void 0 : e[0])),
        !(r.zoom_type === 'drag' && s && o.clientX === s.clientX && o.clientY === s.clientY) &&
          ((n.zooming = !1),
          i.redrawEventRect(),
          i.updateZoom(),
          !l &&
            (s || n.dragging) &&
            Q(
              r.zoom_onzoomend,
              i.api,
              (a = i.state.domain) !== null && a !== void 0 ? a : i.zoom.getDomain(),
            )));
    },
    updateZoom: function (t) {
      var e = this,
        a = e.scale,
        i = a.subX,
        r = a.x,
        n = a.zoom;
      if (n) {
        var o = n.domain(),
          s = i.domain(),
          l = 0.015,
          c = e.config.axis_x_inverted
            ? (o[0] >= s[0] || o[0] + l >= s[0]) && (s[1] >= o[1] || s[1] >= o[1] + l)
            : (o[0] <= s[0] || o[0] - l <= s[0]) && (s[1] <= o[1] || s[1] <= o[1] - l);
        (t || c) && (e.axis.x.scale(i), r.domain(i.orgDomain()), (e.scale.zoom = null));
      }
    },
    updateCurrentZoomTransform: function (t, e) {
      var a,
        i = this,
        r = i.$el.eventRect,
        n = i.config,
        o = n.axis_rotated,
        s = [-t(e[0]), 0],
        l = (a = Ve.scale(t.range()[1] / (t(e[1]) - t(e[0])))).translate.apply(
          a,
          o ? s.reverse() : s,
        );
      r.call(i.zoom.transform, l);
    },
    bindZoomOnEventRect: function () {
      var t,
        e = this,
        a = e.config,
        i = e.$el,
        r = i.eventRect,
        n = i.svg,
        o = a.zoom_type === 'drag' ? e.zoomBehaviour : e.zoom;
      (X.GestureEvent &&
        /^((?!chrome|android|mobile).)*safari/i.test(
          (t = X.navigator) === null || t === void 0 ? void 0 : t.userAgent,
        ) &&
        n.on('wheel', function () {}),
        r?.call(o).on('dblclick.zoom', null));
    },
    initZoomBehaviour: function () {
      var t = this,
        e = t.config,
        a = t.state,
        i = e.axis_rotated,
        r = 0,
        n = 0,
        o,
        s,
        l = { axis: i ? 'y' : 'x', attr: i ? 'height' : 'width', index: i ? 1 : 0 };
      t.zoomBehaviour = $a()
        .clickDistance(4)
        .on('start', function (c) {
          ((s = t.scale.zoom ? null : t.axis.getExtent()),
            (a.event = c),
            t.setDragStatus(!0),
            t.unselectRect(),
            o ||
              (o = t.$el.main
                .append('rect')
                .attr('clip-path', a.clip.path)
                .attr('class', Ft.zoomBrush)
                .attr('width', i ? a.width : 0)
                .attr('height', i ? 0 : a.height)),
            (r = Te(c, this)[l.index]),
            s && (r < s[0] ? (r = s[0]) : r > s[1] && (r = s[1])),
            (n = r),
            o.attr(l.axis, r).attr(l.attr, 0),
            t.onZoomStart(c));
        })
        .on('drag', function (c) {
          ((n = Te(c, this)[l.index]),
            s && (n > s[1] ? (n = s[1]) : n < s[0] && (n = s[0])),
            o.attr(l.axis, Math.min(r, n)).attr(l.attr, Math.abs(n - r)));
        })
        .on('end', function (c) {
          var u,
            d = t.scale.zoom || t.scale.x;
          ((a.event = c),
            o.attr(l.axis, 0).attr(l.attr, 0),
            r > n && ((u = [n, r]), (r = u[0]), (n = u[1])),
            r < 0 && ((n += Math.abs(r)), (r = 0)),
            r !== n &&
              t.api.zoom(
                [r, n].map(function (f) {
                  return d.invert(f);
                }),
              ),
            t.setDragStatus(!1));
        });
    },
    setZoomResetButton: function () {
      var t = this,
        e = t.config,
        a = t.$el,
        i = e.zoom_resetButton;
      i &&
        e.zoom_type === 'drag' &&
        (a.zoomResetBtn
          ? a.zoomResetBtn.style('display', null)
          : (a.zoomResetBtn = t.$el.chart
              .append('div')
              .classed(z.button, !0)
              .append('span')
              .on('click', function () {
                (I(i.onclick) && i.onclick.bind(t.api)(this), t.api.unzoom());
              })
              .classed(Ft.buttonZoomReset, !0)
              .text(i.text || 'Reset Zoom')));
    },
    getZoomTransform: function () {
      var t = this,
        e = t.$el.eventRect;
      return e?.node() ? Ra(e.node()) : { k: 1 };
    },
  },
  zs = {
    drag: function (t) {
      var e = this,
        a = e.config,
        i = e.state,
        r = e.$el.main,
        n = a.data_selection_grouped,
        o = a.interaction_enabled && a.data_selection_isselectable;
      if (
        !(
          e.hasArcType() ||
          !a.data_selection_enabled ||
          (a.zoom_enabled && !e.zoom.altDomain) ||
          !a.data_selection_multiple
        )
      ) {
        var s = i.dragStart || [0, 0],
          l = s[0],
          c = s[1],
          u = t[0],
          d = t[1],
          f = Math.min(l, u),
          v = Math.max(l, u),
          g = n ? i.margin.top : Math.min(c, d),
          h = n ? i.height : Math.max(c, d),
          p = function () {
            !e ||
              !e.$el ||
              !e.$el.main ||
              (r
                .select('.'.concat(Ge.dragarea))
                .attr('x', f)
                .attr('y', g)
                .attr('width', v - f)
                .attr('height', h - g),
              r
                .selectAll('.'.concat(oe.shapes))
                .selectAll('.'.concat(oe.shape))
                .filter(function (x) {
                  return o?.bind(e.api)(x);
                })
                .each(function (x, _) {
                  var m = L(this),
                    y = m.classed(ee.SELECTED),
                    T = m.classed(Ge.INCLUDED),
                    b = !1,
                    $;
                  if (m.classed(he.circle)) {
                    var w = +m.attr('cx') * 1,
                      A = +m.attr('cy') * 1;
                    (($ = e.togglePoint), (b = f < w && w < v && g < A && A < h));
                  } else if (m.classed(_e.bar)) {
                    var R = za(this),
                      w = R.x,
                      A = R.y,
                      C = R.width,
                      S = R.height;
                    (($ = e.togglePath), (b = !(v < w || w + C < f) && !(h < A || A + S < g)));
                  } else return;
                  b ^ T &&
                    (m.classed(Ge.INCLUDED, !T),
                    m.classed(ee.SELECTED, !y),
                    $.call(e, !y, m, x, _));
                }));
          };
        Na(e.state, p);
      }
    },
    dragstart: function (t) {
      var e = this,
        a = e.config,
        i = e.state,
        r = e.$el.main;
      e.hasArcType() ||
        !a.data_selection_enabled ||
        ((i.dragStart = t),
        r
          .select('.'.concat(z.chart))
          .append('rect')
          .attr('class', Ge.dragarea)
          .style('opacity', '0.1'),
        e.setDragStatus(!0));
    },
    dragend: function () {
      var t = this,
        e = t.config,
        a = t.$el.main,
        i = t.$T;
      t.hasArcType() ||
        !e.data_selection_enabled ||
        (i(a.select('.'.concat(Ge.dragarea)))
          .style('opacity', '0')
          .remove(),
        a.selectAll('.'.concat(oe.shape)).classed(Ge.INCLUDED, !1),
        t.setDragStatus(!1));
    },
  },
  Fs = F(F({}, zs), {
    selectPoint: function (t, e, a) {
      var i = this,
        r = i.config,
        n = i.$el.main,
        o = i.$T,
        s = r.axis_rotated,
        l = (s ? i.circleY : i.circleX).bind(i),
        c = (s ? i.circleX : i.circleY).bind(i),
        u = i.pointSelectR.bind(i);
      (Q(r.data_onselected, i.api, e, t.node()),
        o(
          n
            .select('.'.concat(ee.selectedCircles).concat(i.getTargetSelectorSuffix(e.id)))
            .selectAll('.'.concat(ee.selectedCircle, '-').concat(a))
            .data([e])
            .enter()
            .append('circle')
            .attr('class', function () {
              return i.generateClass(ee.selectedCircle, a);
            })
            .attr('cx', l)
            .attr('cy', c)
            .attr('stroke', i.color)
            .attr('r', function (d) {
              return i.pointSelectR(d) * 1.4;
            }),
        ).attr('r', u));
    },
    unselectPoint: function (t, e, a) {
      var i = this,
        r = i.config,
        n = i.$el.main,
        o = i.$T;
      (Q(r.data_onunselected, i.api, e, t?.node()),
        o(
          n
            .select('.'.concat(ee.selectedCircles).concat(i.getTargetSelectorSuffix(e.id)))
            .selectAll('.'.concat(ee.selectedCircle, '-').concat(a)),
        )
          .attr('r', 0)
          .remove());
    },
    togglePoint: function (t, e, a, i) {
      var r = ''.concat(t ? '' : 'un', 'selectPoint');
      this[r](e, a, i);
    },
    selectPath: function (t, e) {
      var a = this,
        i = a.config;
      (Q(i.data_onselected, a.api, e, t.node()),
        i.interaction_brighten && t.style('filter', 'brightness(1.25)'));
    },
    unselectPath: function (t, e) {
      var a = this,
        i = a.config;
      (Q(i.data_onunselected, a.api, e, t.node()),
        i.interaction_brighten && t.style('filter', null));
    },
    togglePath: function (t, e, a, i) {
      this[''.concat(t ? '' : 'un', 'selectPath')](e, a, i);
    },
    getToggle: function (t, e) {
      var a = this;
      return t.nodeName === 'path'
        ? a.togglePath
        : a.isStepType(e)
          ? function () {}
          : a.togglePoint;
    },
    toggleShape: function (t, e, a) {
      var i,
        r = this,
        n = r.config,
        o = r.$el.main;
      if (n.data_selection_enabled && n.data_selection_isselectable.bind(r.api)(e)) {
        var s = L(t),
          l = s.classed(ee.SELECTED),
          c = r.getToggle(t, e).bind(r),
          u;
        if (!n.data_selection_multiple) {
          var d = (i = r.isPointFocusOnly) === null || i === void 0 ? void 0 : i.call(r),
            f = '.'.concat(d ? ee.selectedCircles : oe.shapes);
          (n.data_selection_grouped && (f += r.getTargetSelectorSuffix(e.id)),
            o
              .selectAll(f)
              .selectAll(
                d ? '.'.concat(ee.selectedCircle) : '.'.concat(oe.shape, '.').concat(ee.SELECTED),
              )
              .classed(ee.SELECTED, !1)
              .each(function (v) {
                var g = L(this);
                ((u = g), c(!1, g, v, v.index));
              }));
        }
        (!u || u.node() !== s.node()) && (s.classed(ee.SELECTED, !l), c(!l, s, e, a));
      }
    },
  }),
  Ms = {
    data_selection_enabled: !1,
    data_selection_grouped: !1,
    data_selection_isselectable: function () {
      return !0;
    },
    data_selection_multiple: !0,
    data_selection_draggable: !1,
    data_onselected: function () {},
    data_onunselected: function () {},
  },
  Bs = {
    subchart_show: !1,
    subchart_showHandle: !1,
    subchart_size_height: 60,
    subchart_axis_x_show: !0,
    subchart_axis_x_tick_show: !0,
    subchart_axis_x_tick_format: void 0,
    subchart_axis_x_tick_text_show: !0,
    subchart_init_range: void 0,
    subchart_onbrush: function () {},
  },
  Xs = {
    zoom_enabled: !1,
    zoom_type: 'wheel',
    zoom_extent: void 0,
    zoom_privileged: !1,
    zoom_rescale: !1,
    zoom_onzoom: void 0,
    zoom_onzoomstart: void 0,
    zoom_onzoomend: void 0,
    zoom_resetButton: !0,
    zoom_x_min: void 0,
    zoom_x_max: void 0,
  },
  Ns = function () {
    return (
      ve(je.prototype, Fs),
      ve(nt.prototype, ks),
      Ue.setOptions([Ms]),
      (Ns = function () {
        return !0;
      })()
    );
  },
  Gs = function () {
    return (
      ve(je.prototype, Ps),
      ve(nt.prototype, Is),
      Ue.setOptions([Bs]),
      (Gs = function () {
        return !0;
      })()
    );
  },
  Vs = function () {
    return (
      ve(je.prototype, Ds),
      ve(nt.prototype, Os),
      Ue.setOptions([Xs]),
      (Vs = function () {
        return !0;
      })()
    );
  },
  Pt = Object.create(null),
  Us = {
    version: '3.18.0',
    generate: function (t) {
      var e = it(Object.create(null), Pt, t),
        a = new nt(e);
      return ((a.internal.charts = this.instance), this.instance.push(a), a);
    },
    defaults: function (t) {
      return (W(t) && (Pt = t), Pt);
    },
    instance: [],
    plugin: {},
  };
export {
  ds as area,
  fs as areaLineRange,
  gs as areaSpline,
  hs as areaSplineRange,
  ps as areaStep,
  vs as areaStepRange,
  ws as bar,
  Us as bb,
  Rs as bubble,
  Ss as candlestick,
  Us as default,
  ys as donut,
  Ls as funnel,
  bs as gauge,
  xs as line,
  Ts as pie,
  $s as polar,
  As as radar,
  Cs as scatter,
  Ns as selection,
  _s as spline,
  ms as step,
  Gs as subchart,
  Es as treemap,
  Vs as zoom,
};
