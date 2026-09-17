const __vite__mapDeps = (
  i,
  m = __vite__mapDeps,
  d = m.f ||
    (m.f = [
      './dagre-BM42HDAG-CwrAZJCY.js',
      './graph-ccH1oO3f.js',
      './markdown-vendor-DldLOD9R.js',
      './ui-vendor-C-FKu2uc.js',
      './markdown-it-vendor-DL4wSELR.js',
      './markdown-vendor-CmuYMs8x.css',
      './layout-CyvM1v-x.js',
      './cose-bilkent-S5V4N54A-CI6AaVKe.js',
      './cytoscape.esm-DH6-wILU.js',
      './c4Diagram-AAUBKEIU-C1lOF5Ut.js',
      './chunk-ND2GUHAM-TMCKCFt-.js',
      './flowDiagram-I6XJVG4X-BokLJIH1.js',
      './chunk-FMBD7UC4-B08AeLCH.js',
      './chunk-55IACEB6-BTq3bZL5.js',
      './chunk-2J33WTMH-CGvQ9bSc.js',
      './erDiagram-TEJ5UH35-BsPy1RWg.js',
      './gitGraphDiagram-PVQCEYII-CyGtU6Y8.js',
      './chunk-4BX2VUAB-T0fy3fOG.js',
      './chunk-QZHKN3VN-BdOwWt8C.js',
      './wardley-L42UT6IY-PPlg582g.js',
      './ganttDiagram-6RSMTGT7-DKMxoKP0.js',
      './infoDiagram-5YYISTIA-0FaINmMD.js',
      './pieDiagram-4H26LBE5-BwVnHHHf.js',
      './quadrantDiagram-W4KKPZXB-BfEasW7F.js',
      './xychartDiagram-2RQKCTM6-BX2uTcKG.js',
      './requirementDiagram-4Y6WPE33-Cs1X_Ghk.js',
      './sequenceDiagram-3UESZ5HK-D7z_Ktem.js',
      './classDiagram-4FO5ZUOK-W-XJ1P32.js',
      './chunk-727SXJPM-CRUXgUrZ.js',
      './classDiagram-v2-Q7XG4LA2-W-XJ1P32.js',
      './stateDiagram-AJRCARHV-1wTHzH2J.js',
      './chunk-AQP2D5EJ-Csrhhc3k.js',
      './stateDiagram-v2-BHNVJYJU-vKkHKFus.js',
      './journeyDiagram-JHISSGLW-CC7_DFlb.js',
      './timeline-definition-PNZ67QCA-BoGwOGIp.js',
      './mindmap-definition-RKZ34NQL-Bw2XNInU.js',
      './kanban-definition-UN3LZRKU-JtWncK2N.js',
      './sankeyDiagram-5OEKKPKP-D4oQqOpL.js',
      './diagram-LMA3HP47-BMrD7tDn.js',
      './diagram-2AECGRRQ-B9-9EW9-.js',
      './blockDiagram-GPEHLZMM-CeDGCI2L.js',
      './diagram-5GNKFQAL-e6ygqUXe.js',
      './architectureDiagram-3BPJPVTR-ClnDEwH3.js',
      './diagram-KO2AKTUF-DOXymSlq.js',
      './ishikawaDiagram-YF4QCWOH-BKMMMio4.js',
      './vennDiagram-CIIHVFJN-D72fpY8E.js',
      './diagram-OG6HWLK6-BP0gmJFm.js',
      './wardleyDiagram-YWT4CUSO-BpFDKWYD.js',
    ]),
) => i.map((i) => d[i]);
import {
  K as $o,
  aD as B,
  J as Do,
  D as Eo,
  i as Et,
  d as Gh,
  I as Io,
  P as Jh,
  s as K,
  H as Kh,
  E as Mo,
  p as Mr,
  aM as No,
  F as Oo,
  O as Po,
  L as Qh,
  aE as Ro,
  g as Wi,
  aF as Wo,
  N as Zh,
  aH as ac,
  r as ar,
  U as ec,
  f as hc,
  T as ic,
  aK as lc,
  aC as m,
  aL as nc,
  aG as oc,
  R as qo,
  S as rc,
  aI as sc,
  G as si,
  Q as tc,
  j as v,
  h as w,
  k as z,
  aJ as zo,
} from './markdown-it-vendor-DL4wSELR.js';
import { _ as tt } from './markdown-vendor-DldLOD9R.js';
import {
  O as Hh,
  K as Nh,
  N as Qe,
  k as Rh,
  X as Uh,
  Y as Vh,
  H as Wh,
  W as Xh,
  Q as Yh,
  V as jh,
  J as zh,
} from './ui-vendor-C-FKu2uc.js';
var Ho = Object.defineProperty,
  d = (r, t) => Ho(r, 'name', { value: t, configurable: !0 }),
  cc = (r, t) => {
    for (var i in t) Ho(r, i, { get: t[i], enumerable: !0 });
  },
  qt = { trace: 0, debug: 1, info: 2, warn: 3, error: 4, fatal: 5 },
  F = {
    trace: d((...r) => {}, 'trace'),
    debug: d((...r) => {}, 'debug'),
    info: d((...r) => {}, 'info'),
    warn: d((...r) => {}, 'warn'),
    error: d((...r) => {}, 'error'),
    fatal: d((...r) => {}, 'fatal'),
  },
  xe = d(function (r = 'fatal') {
    let t = qt.fatal;
    (typeof r == 'string' ? r.toLowerCase() in qt && (t = qt[r]) : typeof r == 'number' && (t = r),
      (F.trace = () => {}),
      (F.debug = () => {}),
      (F.info = () => {}),
      (F.warn = () => {}),
      (F.error = () => {}),
      (F.fatal = () => {}),
      t <= qt.fatal &&
        (F.fatal = console.error
          ? console.error.bind(console, vt('FATAL'), 'color: orange')
          : console.log.bind(console, '\x1B[35m', vt('FATAL'))),
      t <= qt.error &&
        (F.error = console.error
          ? console.error.bind(console, vt('ERROR'), 'color: orange')
          : console.log.bind(console, '\x1B[31m', vt('ERROR'))),
      t <= qt.warn &&
        (F.warn = console.warn
          ? console.warn.bind(console, vt('WARN'), 'color: orange')
          : console.log.bind(console, '\x1B[33m', vt('WARN'))),
      t <= qt.info &&
        (F.info = console.info
          ? console.info.bind(console, vt('INFO'), 'color: lightblue')
          : console.log.bind(console, '\x1B[34m', vt('INFO'))),
      t <= qt.debug &&
        (F.debug = console.debug
          ? console.debug.bind(console, vt('DEBUG'), 'color: lightgreen')
          : console.log.bind(console, '\x1B[32m', vt('DEBUG'))),
      t <= qt.trace &&
        (F.trace = console.debug
          ? console.debug.bind(console, vt('TRACE'), 'color: lightgreen')
          : console.log.bind(console, '\x1B[32m', vt('TRACE'))));
  }, 'setLogLevel'),
  vt = d((r) => `%c${Rh().format('ss.SSS')} : ${r} : `, 'format'),
  Yo = /^-{3}\s*[\n\r](.*?)[\n\r]-{3}\s*[\n\r]+/s,
  Yr = /%{2}{\s*(?:(\w+)\s*:|(\w+))\s*(?:(\w+)|((?:(?!}%{2}).|\r?\n)*))?\s*(?:}%{2})?/gi,
  dc = /\s*%%.*\n/gm,
  yr,
  jo =
    ((yr = class extends Error {
      constructor(t) {
        (super(t), (this.name = 'UnknownDiagramError'));
      }
    }),
    d(yr, 'UnknownDiagramError'),
    yr),
  lr = {},
  be = d(function (r, t) {
    r = r
      .replace(Yo, '')
      .replace(Yr, '')
      .replace(
        dc,
        `
`,
      );
    for (const [i, { detector: e }] of Object.entries(lr)) if (e(r, t)) return i;
    throw new jo(`No diagram type detected matching given configuration for text: ${r}`);
  }, 'detectType'),
  zi = d((...r) => {
    for (const { id: t, detector: i, loader: e } of r) Xo(t, i, e);
  }, 'registerLazyLoadedDiagrams'),
  Xo = d((r, t, i) => {
    (lr[r] && F.warn(`Detector with key ${r} already exists. Overwriting.`),
      (lr[r] = { detector: t, loader: i }),
      F.debug(`Detector with key ${r} added${i ? ' with loader' : ''}`));
  }, 'addDetector'),
  gc = d((r) => lr[r].loader, 'getDiagramLoader'),
  Ni = d((r, t, { depth: i = 2, clobber: e = !1 } = {}) => {
    const o = { depth: i, clobber: e };
    return Array.isArray(t) && !Array.isArray(r)
      ? (t.forEach((a) => Ni(r, a, o)), r)
      : Array.isArray(t) && Array.isArray(r)
        ? (t.forEach((a) => {
            r.includes(a) || r.push(a);
          }),
          r)
        : r === void 0 || i <= 0
          ? r != null && typeof r == 'object' && typeof t == 'object'
            ? Object.assign(r, t)
            : t
          : (t !== void 0 &&
              typeof r == 'object' &&
              typeof t == 'object' &&
              Object.keys(t).forEach((a) => {
                typeof t[a] == 'object' &&
                t[a] !== null &&
                (r[a] === void 0 || typeof r[a] == 'object')
                  ? (r[a] === void 0 && (r[a] = Array.isArray(t[a]) ? [] : {}),
                    (r[a] = Ni(r[a], t[a], { depth: i - 1, clobber: e })))
                  : (e || (typeof r[a] != 'object' && typeof t[a] != 'object')) && (r[a] = t[a]);
              }),
            r);
  }, 'assignWithDepth'),
  ht = Ni,
  $t = '#ffffff',
  Pt = '#f2f2f2',
  G = d((r, t) => (t ? m(r, { s: -40, l: 10 }) : m(r, { s: -40, l: -10 })), 'mkBorder'),
  xr,
  uc =
    ((xr = class {
      constructor() {
        ((this.background = '#f4f4f4'),
          (this.primaryColor = '#fff4dd'),
          (this.noteBkgColor = '#fff5ad'),
          (this.noteTextColor = '#333'),
          (this.THEME_COLOR_LIMIT = 12),
          (this.radius = 5),
          (this.strokeWidth = 1),
          (this.fontFamily = '"trebuchet ms", verdana, arial, sans-serif'),
          (this.fontSize = '16px'),
          (this.useGradient = !0),
          (this.dropShadow = 'drop-shadow( 1px 2px 2px rgba(185,185,185,1))'));
      }
      updateColors() {
        if (
          ((this.primaryTextColor = this.primaryTextColor || (this.darkMode ? '#eee' : '#333')),
          (this.secondaryColor = this.secondaryColor || m(this.primaryColor, { h: -120 })),
          (this.tertiaryColor = this.tertiaryColor || m(this.primaryColor, { h: 180, l: 5 })),
          (this.primaryBorderColor =
            this.primaryBorderColor || G(this.primaryColor, this.darkMode)),
          (this.secondaryBorderColor =
            this.secondaryBorderColor || G(this.secondaryColor, this.darkMode)),
          (this.tertiaryBorderColor =
            this.tertiaryBorderColor || G(this.tertiaryColor, this.darkMode)),
          (this.noteBorderColor = this.noteBorderColor || G(this.noteBkgColor, this.darkMode)),
          (this.noteBkgColor = this.noteBkgColor || '#fff5ad'),
          (this.noteTextColor = this.noteTextColor || '#333'),
          (this.secondaryTextColor = this.secondaryTextColor || B(this.secondaryColor)),
          (this.tertiaryTextColor = this.tertiaryTextColor || B(this.tertiaryColor)),
          (this.lineColor = this.lineColor || B(this.background)),
          (this.arrowheadColor = this.arrowheadColor || B(this.background)),
          (this.textColor = this.textColor || this.primaryTextColor),
          (this.border2 = this.border2 || this.tertiaryBorderColor),
          (this.nodeBkg = this.nodeBkg || this.primaryColor),
          (this.mainBkg = this.mainBkg || this.primaryColor),
          (this.nodeBorder = this.nodeBorder || this.primaryBorderColor),
          (this.clusterBkg = this.clusterBkg || this.tertiaryColor),
          (this.clusterBorder = this.clusterBorder || this.tertiaryBorderColor),
          (this.defaultLinkColor = this.defaultLinkColor || this.lineColor),
          (this.titleColor = this.titleColor || this.tertiaryTextColor),
          (this.edgeLabelBackground =
            this.edgeLabelBackground ||
            (this.darkMode ? v(this.secondaryColor, 30) : this.secondaryColor)),
          (this.nodeTextColor = this.nodeTextColor || this.primaryTextColor),
          (this.actorBorder = this.actorBorder || this.primaryBorderColor),
          (this.actorBkg = this.actorBkg || this.mainBkg),
          (this.actorTextColor = this.actorTextColor || this.primaryTextColor),
          (this.actorLineColor = this.actorLineColor || this.actorBorder),
          (this.labelBoxBkgColor = this.labelBoxBkgColor || this.actorBkg),
          (this.signalColor = this.signalColor || this.textColor),
          (this.signalTextColor = this.signalTextColor || this.textColor),
          (this.labelBoxBorderColor = this.labelBoxBorderColor || this.actorBorder),
          (this.labelTextColor = this.labelTextColor || this.actorTextColor),
          (this.loopTextColor = this.loopTextColor || this.actorTextColor),
          (this.activationBorderColor = this.activationBorderColor || v(this.secondaryColor, 10)),
          (this.activationBkgColor = this.activationBkgColor || this.secondaryColor),
          (this.sequenceNumberColor = this.sequenceNumberColor || B(this.lineColor)),
          (this.sectionBkgColor = this.sectionBkgColor || this.tertiaryColor),
          (this.altSectionBkgColor = this.altSectionBkgColor || 'white'),
          (this.sectionBkgColor = this.sectionBkgColor || this.secondaryColor),
          (this.sectionBkgColor2 = this.sectionBkgColor2 || this.primaryColor),
          (this.excludeBkgColor = this.excludeBkgColor || '#eeeeee'),
          (this.taskBorderColor = this.taskBorderColor || this.primaryBorderColor),
          (this.taskBkgColor = this.taskBkgColor || this.primaryColor),
          (this.activeTaskBorderColor = this.activeTaskBorderColor || this.primaryColor),
          (this.activeTaskBkgColor = this.activeTaskBkgColor || w(this.primaryColor, 23)),
          (this.gridColor = this.gridColor || 'lightgrey'),
          (this.doneTaskBkgColor = this.doneTaskBkgColor || 'lightgrey'),
          (this.doneTaskBorderColor = this.doneTaskBorderColor || 'grey'),
          (this.critBorderColor = this.critBorderColor || '#ff8888'),
          (this.critBkgColor = this.critBkgColor || 'red'),
          (this.todayLineColor = this.todayLineColor || 'red'),
          (this.vertLineColor = this.vertLineColor || 'navy'),
          (this.taskTextColor = this.taskTextColor || this.textColor),
          (this.taskTextOutsideColor = this.taskTextOutsideColor || this.textColor),
          (this.taskTextLightColor = this.taskTextLightColor || this.textColor),
          (this.taskTextColor = this.taskTextColor || this.primaryTextColor),
          (this.taskTextDarkColor = this.taskTextDarkColor || this.textColor),
          (this.taskTextClickableColor = this.taskTextClickableColor || '#003163'),
          (this.noteFontWeight = this.noteFontWeight || 'normal'),
          (this.fontWeight = this.fontWeight || 'normal'),
          (this.personBorder = this.personBorder || this.primaryBorderColor),
          (this.personBkg = this.personBkg || this.mainBkg),
          this.darkMode
            ? ((this.rowOdd = this.rowOdd || v(this.mainBkg, 5) || '#ffffff'),
              (this.rowEven = this.rowEven || v(this.mainBkg, 10)))
            : ((this.rowOdd = this.rowOdd || w(this.mainBkg, 75) || '#ffffff'),
              (this.rowEven = this.rowEven || w(this.mainBkg, 5))),
          (this.transitionColor = this.transitionColor || this.lineColor),
          (this.transitionLabelColor = this.transitionLabelColor || this.textColor),
          (this.stateLabelColor = this.stateLabelColor || this.stateBkg || this.primaryTextColor),
          (this.stateBkg = this.stateBkg || this.mainBkg),
          (this.labelBackgroundColor = this.labelBackgroundColor || this.stateBkg),
          (this.compositeBackground =
            this.compositeBackground || this.background || this.tertiaryColor),
          (this.altBackground = this.altBackground || this.tertiaryColor),
          (this.compositeTitleBackground = this.compositeTitleBackground || this.mainBkg),
          (this.compositeBorder = this.compositeBorder || this.nodeBorder),
          (this.innerEndBackground = this.nodeBorder),
          (this.errorBkgColor = this.errorBkgColor || this.tertiaryColor),
          (this.errorTextColor = this.errorTextColor || this.tertiaryTextColor),
          (this.transitionColor = this.transitionColor || this.lineColor),
          (this.specialStateColor = this.lineColor),
          (this.cScale0 = this.cScale0 || this.primaryColor),
          (this.cScale1 = this.cScale1 || this.secondaryColor),
          (this.cScale2 = this.cScale2 || this.tertiaryColor),
          (this.cScale3 = this.cScale3 || m(this.primaryColor, { h: 30 })),
          (this.cScale4 = this.cScale4 || m(this.primaryColor, { h: 60 })),
          (this.cScale5 = this.cScale5 || m(this.primaryColor, { h: 90 })),
          (this.cScale6 = this.cScale6 || m(this.primaryColor, { h: 120 })),
          (this.cScale7 = this.cScale7 || m(this.primaryColor, { h: 150 })),
          (this.cScale8 = this.cScale8 || m(this.primaryColor, { h: 210, l: 150 })),
          (this.cScale9 = this.cScale9 || m(this.primaryColor, { h: 270 })),
          (this.cScale10 = this.cScale10 || m(this.primaryColor, { h: 300 })),
          (this.cScale11 = this.cScale11 || m(this.primaryColor, { h: 330 })),
          this.darkMode)
        )
          for (let i = 0; i < this.THEME_COLOR_LIMIT; i++)
            this['cScale' + i] = v(this['cScale' + i], 75);
        else
          for (let i = 0; i < this.THEME_COLOR_LIMIT; i++)
            this['cScale' + i] = v(this['cScale' + i], 25);
        for (let i = 0; i < this.THEME_COLOR_LIMIT; i++)
          this['cScaleInv' + i] = this['cScaleInv' + i] || B(this['cScale' + i]);
        for (let i = 0; i < this.THEME_COLOR_LIMIT; i++)
          this.darkMode
            ? (this['cScalePeer' + i] = this['cScalePeer' + i] || w(this['cScale' + i], 10))
            : (this['cScalePeer' + i] = this['cScalePeer' + i] || v(this['cScale' + i], 10));
        this.scaleLabelColor = this.scaleLabelColor || this.labelTextColor;
        for (let i = 0; i < this.THEME_COLOR_LIMIT; i++)
          this['cScaleLabel' + i] = this['cScaleLabel' + i] || this.scaleLabelColor;
        const t = this.darkMode ? -4 : -1;
        for (let i = 0; i < 5; i++)
          ((this['surface' + i] =
            this['surface' + i] || m(this.mainBkg, { h: 180, s: -15, l: t * (5 + i * 3) })),
            (this['surfacePeer' + i] =
              this['surfacePeer' + i] || m(this.mainBkg, { h: 180, s: -15, l: t * (8 + i * 3) })));
        ((this.classText = this.classText || this.textColor),
          (this.fillType0 = this.fillType0 || this.primaryColor),
          (this.fillType1 = this.fillType1 || this.secondaryColor),
          (this.fillType2 = this.fillType2 || m(this.primaryColor, { h: 64 })),
          (this.fillType3 = this.fillType3 || m(this.secondaryColor, { h: 64 })),
          (this.fillType4 = this.fillType4 || m(this.primaryColor, { h: -64 })),
          (this.fillType5 = this.fillType5 || m(this.secondaryColor, { h: -64 })),
          (this.fillType6 = this.fillType6 || m(this.primaryColor, { h: 128 })),
          (this.fillType7 = this.fillType7 || m(this.secondaryColor, { h: 128 })),
          (this.pie1 = this.pie1 || this.primaryColor),
          (this.pie2 = this.pie2 || this.secondaryColor),
          (this.pie3 = this.pie3 || this.tertiaryColor),
          (this.pie4 = this.pie4 || m(this.primaryColor, { l: -10 })),
          (this.pie5 = this.pie5 || m(this.secondaryColor, { l: -10 })),
          (this.pie6 = this.pie6 || m(this.tertiaryColor, { l: -10 })),
          (this.pie7 = this.pie7 || m(this.primaryColor, { h: 60, l: -10 })),
          (this.pie8 = this.pie8 || m(this.primaryColor, { h: -60, l: -10 })),
          (this.pie9 = this.pie9 || m(this.primaryColor, { h: 120, l: 0 })),
          (this.pie10 = this.pie10 || m(this.primaryColor, { h: 60, l: -20 })),
          (this.pie11 = this.pie11 || m(this.primaryColor, { h: -60, l: -20 })),
          (this.pie12 = this.pie12 || m(this.primaryColor, { h: 120, l: -10 })),
          (this.pieTitleTextSize = this.pieTitleTextSize || '25px'),
          (this.pieTitleTextColor = this.pieTitleTextColor || this.taskTextDarkColor),
          (this.pieSectionTextSize = this.pieSectionTextSize || '17px'),
          (this.pieSectionTextColor = this.pieSectionTextColor || this.textColor),
          (this.pieLegendTextSize = this.pieLegendTextSize || '17px'),
          (this.pieLegendTextColor = this.pieLegendTextColor || this.taskTextDarkColor),
          (this.pieStrokeColor = this.pieStrokeColor || 'black'),
          (this.pieStrokeWidth = this.pieStrokeWidth || '2px'),
          (this.pieOuterStrokeWidth = this.pieOuterStrokeWidth || '2px'),
          (this.pieOuterStrokeColor = this.pieOuterStrokeColor || 'black'),
          (this.pieOpacity = this.pieOpacity || '0.7'),
          (this.venn1 = this.venn1 ?? m(this.primaryColor, { l: -30 })),
          (this.venn2 = this.venn2 ?? m(this.secondaryColor, { l: -30 })),
          (this.venn3 = this.venn3 ?? m(this.tertiaryColor, { l: -30 })),
          (this.venn4 = this.venn4 ?? m(this.primaryColor, { h: 60, l: -30 })),
          (this.venn5 = this.venn5 ?? m(this.primaryColor, { h: -60, l: -30 })),
          (this.venn6 = this.venn6 ?? m(this.secondaryColor, { h: 60, l: -30 })),
          (this.venn7 = this.venn7 ?? m(this.primaryColor, { h: 120, l: -30 })),
          (this.venn8 = this.venn8 ?? m(this.secondaryColor, { h: 120, l: -30 })),
          (this.vennTitleTextColor = this.vennTitleTextColor ?? this.titleColor),
          (this.vennSetTextColor = this.vennSetTextColor ?? this.textColor),
          (this.radar = {
            axisColor: this.radar?.axisColor || this.lineColor,
            axisStrokeWidth: this.radar?.axisStrokeWidth || 2,
            axisLabelFontSize: this.radar?.axisLabelFontSize || 12,
            curveOpacity: this.radar?.curveOpacity || 0.5,
            curveStrokeWidth: this.radar?.curveStrokeWidth || 2,
            graticuleColor: this.radar?.graticuleColor || '#DEDEDE',
            graticuleStrokeWidth: this.radar?.graticuleStrokeWidth || 1,
            graticuleOpacity: this.radar?.graticuleOpacity || 0.3,
            legendBoxSize: this.radar?.legendBoxSize || 12,
            legendFontSize: this.radar?.legendFontSize || 12,
          }),
          (this.wardleyEvolutionColor = this.wardleyEvolutionColor || '#dc3545'),
          (this.wardley = {
            backgroundColor: this.wardley?.backgroundColor || this.background,
            axisColor: this.wardley?.axisColor || this.lineColor,
            axisTextColor: this.wardley?.axisTextColor || this.primaryTextColor,
            gridColor: this.wardley?.gridColor || this.gridColor,
            componentFill: this.wardley?.componentFill || this.background,
            componentStroke: this.wardley?.componentStroke || this.lineColor,
            componentLabelColor: this.wardley?.componentLabelColor || this.primaryTextColor,
            linkStroke: this.wardley?.linkStroke || this.lineColor,
            evolutionStroke: this.wardley?.evolutionStroke || this.wardleyEvolutionColor,
            annotationStroke: this.wardley?.annotationStroke || this.lineColor,
            annotationTextColor: this.wardley?.annotationTextColor || this.primaryTextColor,
            annotationFill: this.wardley?.annotationFill || this.background,
          }),
          (this.archEdgeColor = this.archEdgeColor || '#777'),
          (this.archEdgeArrowColor = this.archEdgeArrowColor || '#777'),
          (this.archEdgeWidth = this.archEdgeWidth || '3'),
          (this.archGroupBorderColor = this.archGroupBorderColor || '#000'),
          (this.archGroupBorderWidth = this.archGroupBorderWidth || '2px'),
          (this.quadrant1Fill = this.quadrant1Fill || this.primaryColor),
          (this.quadrant2Fill = this.quadrant2Fill || m(this.primaryColor, { r: 5, g: 5, b: 5 })),
          (this.quadrant3Fill =
            this.quadrant3Fill || m(this.primaryColor, { r: 10, g: 10, b: 10 })),
          (this.quadrant4Fill =
            this.quadrant4Fill || m(this.primaryColor, { r: 15, g: 15, b: 15 })),
          (this.quadrant1TextFill = this.quadrant1TextFill || this.primaryTextColor),
          (this.quadrant2TextFill =
            this.quadrant2TextFill || m(this.primaryTextColor, { r: -5, g: -5, b: -5 })),
          (this.quadrant3TextFill =
            this.quadrant3TextFill || m(this.primaryTextColor, { r: -10, g: -10, b: -10 })),
          (this.quadrant4TextFill =
            this.quadrant4TextFill || m(this.primaryTextColor, { r: -15, g: -15, b: -15 })),
          (this.quadrantPointFill =
            this.quadrantPointFill || Et(this.quadrant1Fill)
              ? w(this.quadrant1Fill)
              : v(this.quadrant1Fill)),
          (this.quadrantPointTextFill = this.quadrantPointTextFill || this.primaryTextColor),
          (this.quadrantXAxisTextFill = this.quadrantXAxisTextFill || this.primaryTextColor),
          (this.quadrantYAxisTextFill = this.quadrantYAxisTextFill || this.primaryTextColor),
          (this.quadrantInternalBorderStrokeFill =
            this.quadrantInternalBorderStrokeFill || this.primaryBorderColor),
          (this.quadrantExternalBorderStrokeFill =
            this.quadrantExternalBorderStrokeFill || this.primaryBorderColor),
          (this.quadrantTitleFill = this.quadrantTitleFill || this.primaryTextColor),
          (this.xyChart = {
            backgroundColor: this.xyChart?.backgroundColor || this.background,
            titleColor: this.xyChart?.titleColor || this.primaryTextColor,
            dataLabelColor: this.xyChart?.dataLabelColor || this.primaryTextColor,
            xAxisTitleColor: this.xyChart?.xAxisTitleColor || this.primaryTextColor,
            xAxisLabelColor: this.xyChart?.xAxisLabelColor || this.primaryTextColor,
            xAxisTickColor: this.xyChart?.xAxisTickColor || this.primaryTextColor,
            xAxisLineColor: this.xyChart?.xAxisLineColor || this.primaryTextColor,
            yAxisTitleColor: this.xyChart?.yAxisTitleColor || this.primaryTextColor,
            yAxisLabelColor: this.xyChart?.yAxisLabelColor || this.primaryTextColor,
            yAxisTickColor: this.xyChart?.yAxisTickColor || this.primaryTextColor,
            yAxisLineColor: this.xyChart?.yAxisLineColor || this.primaryTextColor,
            plotColorPalette:
              this.xyChart?.plotColorPalette ||
              '#FFF4DD,#FFD8B1,#FFA07A,#ECEFF1,#D6DBDF,#C3E0A8,#FFB6A4,#FFD74D,#738FA7,#FFFFF0',
          }),
          (this.requirementBackground = this.requirementBackground || this.primaryColor),
          (this.requirementBorderColor = this.requirementBorderColor || this.primaryBorderColor),
          (this.requirementBorderSize = this.requirementBorderSize || '1'),
          (this.requirementTextColor = this.requirementTextColor || this.primaryTextColor),
          (this.relationColor = this.relationColor || this.lineColor),
          (this.relationLabelBackground =
            this.relationLabelBackground ||
            (this.darkMode ? v(this.secondaryColor, 30) : this.secondaryColor)),
          (this.relationLabelColor = this.relationLabelColor || this.actorTextColor),
          (this.git0 = this.git0 || this.primaryColor),
          (this.git1 = this.git1 || this.secondaryColor),
          (this.git2 = this.git2 || this.tertiaryColor),
          (this.git3 = this.git3 || m(this.primaryColor, { h: -30 })),
          (this.git4 = this.git4 || m(this.primaryColor, { h: -60 })),
          (this.git5 = this.git5 || m(this.primaryColor, { h: -90 })),
          (this.git6 = this.git6 || m(this.primaryColor, { h: 60 })),
          (this.git7 = this.git7 || m(this.primaryColor, { h: 120 })),
          this.darkMode
            ? ((this.git0 = w(this.git0, 25)),
              (this.git1 = w(this.git1, 25)),
              (this.git2 = w(this.git2, 25)),
              (this.git3 = w(this.git3, 25)),
              (this.git4 = w(this.git4, 25)),
              (this.git5 = w(this.git5, 25)),
              (this.git6 = w(this.git6, 25)),
              (this.git7 = w(this.git7, 25)))
            : ((this.git0 = v(this.git0, 25)),
              (this.git1 = v(this.git1, 25)),
              (this.git2 = v(this.git2, 25)),
              (this.git3 = v(this.git3, 25)),
              (this.git4 = v(this.git4, 25)),
              (this.git5 = v(this.git5, 25)),
              (this.git6 = v(this.git6, 25)),
              (this.git7 = v(this.git7, 25))),
          (this.gitInv0 = this.gitInv0 || B(this.git0)),
          (this.gitInv1 = this.gitInv1 || B(this.git1)),
          (this.gitInv2 = this.gitInv2 || B(this.git2)),
          (this.gitInv3 = this.gitInv3 || B(this.git3)),
          (this.gitInv4 = this.gitInv4 || B(this.git4)),
          (this.gitInv5 = this.gitInv5 || B(this.git5)),
          (this.gitInv6 = this.gitInv6 || B(this.git6)),
          (this.gitInv7 = this.gitInv7 || B(this.git7)),
          (this.branchLabelColor =
            this.branchLabelColor || (this.darkMode ? 'black' : this.labelTextColor)),
          (this.gitBranchLabel0 = this.gitBranchLabel0 || this.branchLabelColor),
          (this.gitBranchLabel1 = this.gitBranchLabel1 || this.branchLabelColor),
          (this.gitBranchLabel2 = this.gitBranchLabel2 || this.branchLabelColor),
          (this.gitBranchLabel3 = this.gitBranchLabel3 || this.branchLabelColor),
          (this.gitBranchLabel4 = this.gitBranchLabel4 || this.branchLabelColor),
          (this.gitBranchLabel5 = this.gitBranchLabel5 || this.branchLabelColor),
          (this.gitBranchLabel6 = this.gitBranchLabel6 || this.branchLabelColor),
          (this.gitBranchLabel7 = this.gitBranchLabel7 || this.branchLabelColor),
          (this.tagLabelColor = this.tagLabelColor || this.primaryTextColor),
          (this.tagLabelBackground = this.tagLabelBackground || this.primaryColor),
          (this.tagLabelBorder = this.tagBorder || this.primaryBorderColor),
          (this.tagLabelFontSize = this.tagLabelFontSize || '10px'),
          (this.commitLabelColor = this.commitLabelColor || this.secondaryTextColor),
          (this.commitLabelBackground = this.commitLabelBackground || this.secondaryColor),
          (this.commitLabelFontSize = this.commitLabelFontSize || '10px'),
          (this.emUiFill = this.emUiFill || 'white'),
          (this.emUiStroke = this.emUiStroke || '#dbdada'),
          (this.emProcessorFill = this.emProcessorFill || '#edb3f6'),
          (this.emProcessorStroke = this.emProcessorStroke || '#b88cbf'),
          (this.emReadModelFill = this.emReadModelFill || '#d3f1a2'),
          (this.emReadModelStroke = this.emReadModelStroke || '#a3b732'),
          (this.emCommandFill = this.emCommandFill || '#bcd6fe'),
          (this.emCommandStroke = this.emCommandStroke || '#679ac3'),
          (this.emEventFill = this.emEventFill || '#ffb778'),
          (this.emEventStroke = this.emEventStroke || '#c19a0f'),
          (this.emSwimlaneBackgroundOdd = this.emSwimlaneBackgroundOdd || 'rgb(250,250,250)'),
          (this.emSwimlaneBackgroundStroke = this.emSwimlaneBackgroundStroke || 'rgb(240,240,240)'),
          (this.emArrowhead = this.emArrowhead || this.lineColor),
          (this.emRelationStroke = this.emRelationStroke || this.lineColor),
          (this.attributeBackgroundColorOdd = this.attributeBackgroundColorOdd || $t),
          (this.attributeBackgroundColorEven = this.attributeBackgroundColorEven || Pt),
          (this.gradientStart = this.primaryBorderColor),
          (this.gradientStop = this.secondaryBorderColor));
      }
      calculate(t) {
        if (typeof t != 'object') {
          this.updateColors();
          return;
        }
        const i = Object.keys(t);
        (i.forEach((e) => {
          this[e] = t[e];
        }),
          this.updateColors(),
          i.forEach((e) => {
            this[e] = t[e];
          }));
      }
    }),
    d(xr, 'Theme'),
    xr),
  pc = d((r) => {
    const t = new uc();
    return (t.calculate(r), t);
  }, 'getThemeVariables'),
  br,
  fc =
    ((br = class {
      constructor() {
        ((this.background = '#333'),
          (this.primaryColor = '#1f2020'),
          (this.secondaryColor = w(this.primaryColor, 16)),
          (this.tertiaryColor = m(this.primaryColor, { h: -160 })),
          (this.primaryBorderColor = B(this.background)),
          (this.secondaryBorderColor = G(this.secondaryColor, this.darkMode)),
          (this.tertiaryBorderColor = G(this.tertiaryColor, this.darkMode)),
          (this.primaryTextColor = B(this.primaryColor)),
          (this.secondaryTextColor = B(this.secondaryColor)),
          (this.tertiaryTextColor = B(this.tertiaryColor)),
          (this.lineColor = B(this.background)),
          (this.textColor = B(this.background)),
          (this.mainBkg = '#1f2020'),
          (this.secondBkg = 'calculated'),
          (this.mainContrastColor = 'lightgrey'),
          (this.darkTextColor = w(B('#323D47'), 10)),
          (this.lineColor = 'calculated'),
          (this.border1 = '#ccc'),
          (this.border2 = ar(255, 255, 255, 0.25)),
          (this.arrowheadColor = 'calculated'),
          (this.fontFamily = '"trebuchet ms", verdana, arial, sans-serif'),
          (this.fontSize = '16px'),
          (this.labelBackground = '#181818'),
          (this.textColor = '#ccc'),
          (this.THEME_COLOR_LIMIT = 12),
          (this.radius = 5),
          (this.strokeWidth = 1),
          (this.nodeBkg = 'calculated'),
          (this.nodeBorder = 'calculated'),
          (this.clusterBkg = 'calculated'),
          (this.clusterBorder = 'calculated'),
          (this.defaultLinkColor = 'calculated'),
          (this.titleColor = '#F9FFFE'),
          (this.edgeLabelBackground = 'calculated'),
          (this.actorBorder = 'calculated'),
          (this.actorBkg = 'calculated'),
          (this.actorTextColor = 'calculated'),
          (this.actorLineColor = 'calculated'),
          (this.signalColor = 'calculated'),
          (this.signalTextColor = 'calculated'),
          (this.labelBoxBkgColor = 'calculated'),
          (this.labelBoxBorderColor = 'calculated'),
          (this.labelTextColor = 'calculated'),
          (this.loopTextColor = 'calculated'),
          (this.noteBorderColor = 'calculated'),
          (this.noteBkgColor = '#fff5ad'),
          (this.noteTextColor = 'calculated'),
          (this.activationBorderColor = 'calculated'),
          (this.activationBkgColor = 'calculated'),
          (this.sequenceNumberColor = 'black'),
          (this.clusterBkg = '#302F3D'),
          (this.sectionBkgColor = v('#EAE8D9', 30)),
          (this.altSectionBkgColor = 'calculated'),
          (this.sectionBkgColor2 = '#EAE8D9'),
          (this.excludeBkgColor = v(this.sectionBkgColor, 10)),
          (this.taskBorderColor = ar(255, 255, 255, 70)),
          (this.taskBkgColor = 'calculated'),
          (this.taskTextColor = 'calculated'),
          (this.taskTextLightColor = 'calculated'),
          (this.taskTextOutsideColor = 'calculated'),
          (this.taskTextClickableColor = '#003163'),
          (this.activeTaskBorderColor = ar(255, 255, 255, 50)),
          (this.activeTaskBkgColor = '#81B1DB'),
          (this.gridColor = 'calculated'),
          (this.doneTaskBkgColor = 'calculated'),
          (this.doneTaskBorderColor = 'grey'),
          (this.critBorderColor = '#E83737'),
          (this.critBkgColor = '#E83737'),
          (this.taskTextDarkColor = 'calculated'),
          (this.todayLineColor = '#DB5757'),
          (this.vertLineColor = '#00BFFF'),
          (this.personBorder = this.primaryBorderColor),
          (this.personBkg = this.mainBkg),
          (this.archEdgeColor = 'calculated'),
          (this.archEdgeArrowColor = 'calculated'),
          (this.archEdgeWidth = '3'),
          (this.archGroupBorderColor = this.primaryBorderColor),
          (this.archGroupBorderWidth = '2px'),
          (this.rowOdd = this.rowOdd || w(this.mainBkg, 5) || '#ffffff'),
          (this.rowEven = this.rowEven || v(this.mainBkg, 10)),
          (this.labelColor = 'calculated'),
          (this.errorBkgColor = '#a44141'),
          (this.errorTextColor = '#ddd'),
          (this.useGradient = !0),
          (this.gradientStart = this.primaryBorderColor),
          (this.gradientStop = this.secondaryBorderColor),
          (this.dropShadow = 'drop-shadow( 1px 2px 2px rgba(185,185,185,1))'),
          (this.noteFontWeight = this.noteFontWeight || 'normal'),
          (this.fontWeight = this.fontWeight || 'normal'));
      }
      updateColors() {
        ((this.secondBkg = w(this.mainBkg, 16)),
          (this.lineColor = this.mainContrastColor),
          (this.arrowheadColor = this.mainContrastColor),
          (this.nodeBkg = this.mainBkg),
          (this.nodeBorder = this.border1),
          (this.clusterBkg = this.secondBkg),
          (this.clusterBorder = this.border2),
          (this.defaultLinkColor = this.lineColor),
          (this.edgeLabelBackground = w(this.labelBackground, 25)),
          (this.actorBorder = this.border1),
          (this.actorBkg = this.mainBkg),
          (this.actorTextColor = this.mainContrastColor),
          (this.actorLineColor = this.actorBorder),
          (this.signalColor = this.mainContrastColor),
          (this.signalTextColor = this.mainContrastColor),
          (this.labelBoxBkgColor = this.actorBkg),
          (this.labelBoxBorderColor = this.actorBorder),
          (this.labelTextColor = this.mainContrastColor),
          (this.loopTextColor = this.mainContrastColor),
          (this.noteBorderColor = this.secondaryBorderColor),
          (this.noteBkgColor = this.secondBkg),
          (this.noteTextColor = this.secondaryTextColor),
          (this.activationBorderColor = this.border1),
          (this.activationBkgColor = this.secondBkg),
          (this.altSectionBkgColor = this.background),
          (this.taskBkgColor = w(this.mainBkg, 23)),
          (this.taskTextColor = this.darkTextColor),
          (this.taskTextLightColor = this.mainContrastColor),
          (this.taskTextOutsideColor = this.taskTextLightColor),
          (this.gridColor = this.mainContrastColor),
          (this.doneTaskBkgColor = this.mainContrastColor),
          (this.taskTextDarkColor = B(this.doneTaskBkgColor)),
          (this.archEdgeColor = this.lineColor),
          (this.archEdgeArrowColor = this.lineColor),
          (this.transitionColor = this.transitionColor || this.lineColor),
          (this.transitionLabelColor = this.transitionLabelColor || this.textColor),
          (this.stateLabelColor = this.stateLabelColor || this.stateBkg || this.primaryTextColor),
          (this.stateBkg = this.stateBkg || this.mainBkg),
          (this.labelBackgroundColor = this.labelBackgroundColor || this.stateBkg),
          (this.compositeBackground =
            this.compositeBackground || this.background || this.tertiaryColor),
          (this.altBackground = this.altBackground || '#555'),
          (this.compositeTitleBackground = this.compositeTitleBackground || this.mainBkg),
          (this.compositeBorder = this.compositeBorder || this.nodeBorder),
          (this.innerEndBackground = this.primaryBorderColor),
          (this.specialStateColor = '#f4f4f4'),
          (this.errorBkgColor = this.errorBkgColor || this.tertiaryColor),
          (this.errorTextColor = this.errorTextColor || this.tertiaryTextColor),
          (this.fillType0 = this.primaryColor),
          (this.fillType1 = this.secondaryColor),
          (this.fillType2 = m(this.primaryColor, { h: 64 })),
          (this.fillType3 = m(this.secondaryColor, { h: 64 })),
          (this.fillType4 = m(this.primaryColor, { h: -64 })),
          (this.fillType5 = m(this.secondaryColor, { h: -64 })),
          (this.fillType6 = m(this.primaryColor, { h: 128 })),
          (this.fillType7 = m(this.secondaryColor, { h: 128 })),
          (this.cScale1 = this.cScale1 || '#0b0000'),
          (this.cScale2 = this.cScale2 || '#4d1037'),
          (this.cScale3 = this.cScale3 || '#3f5258'),
          (this.cScale4 = this.cScale4 || '#4f2f1b'),
          (this.cScale5 = this.cScale5 || '#6e0a0a'),
          (this.cScale6 = this.cScale6 || '#3b0048'),
          (this.cScale7 = this.cScale7 || '#995a01'),
          (this.cScale8 = this.cScale8 || '#154706'),
          (this.cScale9 = this.cScale9 || '#161722'),
          (this.cScale10 = this.cScale10 || '#00296f'),
          (this.cScale11 = this.cScale11 || '#01629c'),
          (this.cScale12 = this.cScale12 || '#010029'),
          (this.cScale0 = this.cScale0 || this.primaryColor),
          (this.cScale1 = this.cScale1 || this.secondaryColor),
          (this.cScale2 = this.cScale2 || this.tertiaryColor),
          (this.cScale3 = this.cScale3 || m(this.primaryColor, { h: 30 })),
          (this.cScale4 = this.cScale4 || m(this.primaryColor, { h: 60 })),
          (this.cScale5 = this.cScale5 || m(this.primaryColor, { h: 90 })),
          (this.cScale6 = this.cScale6 || m(this.primaryColor, { h: 120 })),
          (this.cScale7 = this.cScale7 || m(this.primaryColor, { h: 150 })),
          (this.cScale8 = this.cScale8 || m(this.primaryColor, { h: 210 })),
          (this.cScale9 = this.cScale9 || m(this.primaryColor, { h: 270 })),
          (this.cScale10 = this.cScale10 || m(this.primaryColor, { h: 300 })),
          (this.cScale11 = this.cScale11 || m(this.primaryColor, { h: 330 })));
        for (let t = 0; t < this.THEME_COLOR_LIMIT; t++)
          this['cScaleInv' + t] = this['cScaleInv' + t] || B(this['cScale' + t]);
        for (let t = 0; t < this.THEME_COLOR_LIMIT; t++)
          this['cScalePeer' + t] = this['cScalePeer' + t] || w(this['cScale' + t], 10);
        for (let t = 0; t < 5; t++)
          ((this['surface' + t] =
            this['surface' + t] || m(this.mainBkg, { h: 30, s: -30, l: -(-10 + t * 4) })),
            (this['surfacePeer' + t] =
              this['surfacePeer' + t] || m(this.mainBkg, { h: 30, s: -30, l: -(-7 + t * 4) })));
        this.scaleLabelColor =
          this.scaleLabelColor || (this.darkMode ? 'black' : this.labelTextColor);
        for (let t = 0; t < this.THEME_COLOR_LIMIT; t++)
          this['cScaleLabel' + t] = this['cScaleLabel' + t] || this.scaleLabelColor;
        for (let t = 0; t < this.THEME_COLOR_LIMIT; t++) this['pie' + t] = this['cScale' + t];
        ((this.pieTitleTextSize = this.pieTitleTextSize || '25px'),
          (this.pieTitleTextColor = this.pieTitleTextColor || this.mainContrastColor),
          (this.pieSectionTextSize = this.pieSectionTextSize || '17px'),
          (this.pieSectionTextColor = this.pieSectionTextColor || this.textColor),
          (this.pieLegendTextSize = this.pieLegendTextSize || '17px'),
          (this.pieLegendTextColor = this.pieLegendTextColor || this.mainContrastColor),
          (this.pieStrokeColor = this.pieStrokeColor || 'black'),
          (this.pieStrokeWidth = this.pieStrokeWidth || '2px'),
          (this.pieOuterStrokeWidth = this.pieOuterStrokeWidth || '2px'),
          (this.pieOuterStrokeColor = this.pieOuterStrokeColor || 'black'),
          (this.pieOpacity = this.pieOpacity || '0.7'));
        for (let t = 0; t < 8; t++)
          this['venn' + (t + 1)] = this['venn' + (t + 1)] ?? w(this['cScale' + t], 30);
        ((this.vennTitleTextColor = this.vennTitleTextColor ?? this.titleColor),
          (this.vennSetTextColor = this.vennSetTextColor ?? this.textColor),
          (this.quadrant1Fill = this.quadrant1Fill || this.primaryColor),
          (this.quadrant2Fill = this.quadrant2Fill || m(this.primaryColor, { r: 5, g: 5, b: 5 })),
          (this.quadrant3Fill =
            this.quadrant3Fill || m(this.primaryColor, { r: 10, g: 10, b: 10 })),
          (this.quadrant4Fill =
            this.quadrant4Fill || m(this.primaryColor, { r: 15, g: 15, b: 15 })),
          (this.quadrant1TextFill = this.quadrant1TextFill || this.primaryTextColor),
          (this.quadrant2TextFill =
            this.quadrant2TextFill || m(this.primaryTextColor, { r: -5, g: -5, b: -5 })),
          (this.quadrant3TextFill =
            this.quadrant3TextFill || m(this.primaryTextColor, { r: -10, g: -10, b: -10 })),
          (this.quadrant4TextFill =
            this.quadrant4TextFill || m(this.primaryTextColor, { r: -15, g: -15, b: -15 })),
          (this.quadrantPointFill =
            this.quadrantPointFill || Et(this.quadrant1Fill)
              ? w(this.quadrant1Fill)
              : v(this.quadrant1Fill)),
          (this.quadrantPointTextFill = this.quadrantPointTextFill || this.primaryTextColor),
          (this.quadrantXAxisTextFill = this.quadrantXAxisTextFill || this.primaryTextColor),
          (this.quadrantYAxisTextFill = this.quadrantYAxisTextFill || this.primaryTextColor),
          (this.quadrantInternalBorderStrokeFill =
            this.quadrantInternalBorderStrokeFill || this.primaryBorderColor),
          (this.quadrantExternalBorderStrokeFill =
            this.quadrantExternalBorderStrokeFill || this.primaryBorderColor),
          (this.quadrantTitleFill = this.quadrantTitleFill || this.primaryTextColor),
          (this.xyChart = {
            backgroundColor: this.xyChart?.backgroundColor || this.background,
            titleColor: this.xyChart?.titleColor || this.primaryTextColor,
            dataLabelColor: this.xyChart?.dataLabelColor || this.primaryTextColor,
            xAxisTitleColor: this.xyChart?.xAxisTitleColor || this.primaryTextColor,
            xAxisLabelColor: this.xyChart?.xAxisLabelColor || this.primaryTextColor,
            xAxisTickColor: this.xyChart?.xAxisTickColor || this.primaryTextColor,
            xAxisLineColor: this.xyChart?.xAxisLineColor || this.primaryTextColor,
            yAxisTitleColor: this.xyChart?.yAxisTitleColor || this.primaryTextColor,
            yAxisLabelColor: this.xyChart?.yAxisLabelColor || this.primaryTextColor,
            yAxisTickColor: this.xyChart?.yAxisTickColor || this.primaryTextColor,
            yAxisLineColor: this.xyChart?.yAxisLineColor || this.primaryTextColor,
            plotColorPalette:
              this.xyChart?.plotColorPalette ||
              '#3498db,#2ecc71,#e74c3c,#f1c40f,#bdc3c7,#ffffff,#34495e,#9b59b6,#1abc9c,#e67e22',
          }),
          (this.packet = {
            startByteColor: this.primaryTextColor,
            endByteColor: this.primaryTextColor,
            labelColor: this.primaryTextColor,
            titleColor: this.primaryTextColor,
            blockStrokeColor: this.primaryTextColor,
            blockFillColor: this.background,
          }),
          (this.radar = {
            axisColor: this.radar?.axisColor || this.lineColor,
            axisStrokeWidth: this.radar?.axisStrokeWidth || 2,
            axisLabelFontSize: this.radar?.axisLabelFontSize || 12,
            curveOpacity: this.radar?.curveOpacity || 0.5,
            curveStrokeWidth: this.radar?.curveStrokeWidth || 2,
            graticuleColor: this.radar?.graticuleColor || '#DEDEDE',
            graticuleStrokeWidth: this.radar?.graticuleStrokeWidth || 1,
            graticuleOpacity: this.radar?.graticuleOpacity || 0.3,
            legendBoxSize: this.radar?.legendBoxSize || 12,
            legendFontSize: this.radar?.legendFontSize || 12,
          }),
          (this.wardleyEvolutionColor = this.wardleyEvolutionColor || '#ff6b6b'),
          (this.wardley = {
            backgroundColor: this.wardley?.backgroundColor || this.background,
            axisColor: this.wardley?.axisColor || this.lineColor,
            axisTextColor: this.wardley?.axisTextColor || this.primaryTextColor,
            gridColor: this.wardley?.gridColor || this.gridColor,
            componentFill: this.wardley?.componentFill || this.mainBkg,
            componentStroke: this.wardley?.componentStroke || this.lineColor,
            componentLabelColor: this.wardley?.componentLabelColor || this.primaryTextColor,
            linkStroke: this.wardley?.linkStroke || this.lineColor,
            evolutionStroke: this.wardley?.evolutionStroke || this.wardleyEvolutionColor,
            annotationStroke: this.wardley?.annotationStroke || this.lineColor,
            annotationTextColor: this.wardley?.annotationTextColor || this.primaryTextColor,
            annotationFill: this.wardley?.annotationFill || this.mainBkg,
          }),
          (this.classText = this.primaryTextColor),
          (this.requirementBackground = this.requirementBackground || this.primaryColor),
          (this.requirementBorderColor = this.requirementBorderColor || this.primaryBorderColor),
          (this.requirementBorderSize = this.requirementBorderSize || '1'),
          (this.requirementTextColor = this.requirementTextColor || this.primaryTextColor),
          (this.relationColor = this.relationColor || this.lineColor),
          (this.relationLabelBackground =
            this.relationLabelBackground ||
            (this.darkMode ? v(this.secondaryColor, 30) : this.secondaryColor)),
          (this.relationLabelColor = this.relationLabelColor || this.actorTextColor),
          (this.git0 = w(this.secondaryColor, 20)),
          (this.git1 = w(this.pie2 || this.secondaryColor, 20)),
          (this.git2 = w(this.pie3 || this.tertiaryColor, 20)),
          (this.git3 = w(this.pie4 || m(this.primaryColor, { h: -30 }), 20)),
          (this.git4 = w(this.pie5 || m(this.primaryColor, { h: -60 }), 20)),
          (this.git5 = w(this.pie6 || m(this.primaryColor, { h: -90 }), 10)),
          (this.git6 = w(this.pie7 || m(this.primaryColor, { h: 60 }), 10)),
          (this.git7 = w(this.pie8 || m(this.primaryColor, { h: 120 }), 20)),
          (this.gitInv0 = this.gitInv0 || B(this.git0)),
          (this.gitInv1 = this.gitInv1 || B(this.git1)),
          (this.gitInv2 = this.gitInv2 || B(this.git2)),
          (this.gitInv3 = this.gitInv3 || B(this.git3)),
          (this.gitInv4 = this.gitInv4 || B(this.git4)),
          (this.gitInv5 = this.gitInv5 || B(this.git5)),
          (this.gitInv6 = this.gitInv6 || B(this.git6)),
          (this.gitInv7 = this.gitInv7 || B(this.git7)),
          (this.gitBranchLabel0 = this.gitBranchLabel0 || B(this.labelTextColor)),
          (this.gitBranchLabel1 = this.gitBranchLabel1 || this.labelTextColor),
          (this.gitBranchLabel2 = this.gitBranchLabel2 || this.labelTextColor),
          (this.gitBranchLabel3 = this.gitBranchLabel3 || B(this.labelTextColor)),
          (this.gitBranchLabel4 = this.gitBranchLabel4 || this.labelTextColor),
          (this.gitBranchLabel5 = this.gitBranchLabel5 || this.labelTextColor),
          (this.gitBranchLabel6 = this.gitBranchLabel6 || this.labelTextColor),
          (this.gitBranchLabel7 = this.gitBranchLabel7 || this.labelTextColor),
          (this.tagLabelColor = this.tagLabelColor || this.primaryTextColor),
          (this.tagLabelBackground = this.tagLabelBackground || this.primaryColor),
          (this.tagLabelBorder = this.tagBorder || this.primaryBorderColor),
          (this.tagLabelFontSize = this.tagLabelFontSize || '10px'),
          (this.commitLabelColor = this.commitLabelColor || this.secondaryTextColor),
          (this.commitLabelBackground = this.commitLabelBackground || this.secondaryColor),
          (this.commitLabelFontSize = this.commitLabelFontSize || '10px'),
          (this.emUiFill = this.emUiFill || '#2d2d2d'),
          (this.emUiStroke = this.emUiStroke || '#555'),
          (this.emProcessorFill = this.emProcessorFill || w('#5a3d5c', 10)),
          (this.emProcessorStroke = this.emProcessorStroke || '#8a6d8c'),
          (this.emReadModelFill = this.emReadModelFill || w('#3d5a2d', 10)),
          (this.emReadModelStroke = this.emReadModelStroke || '#6d8c5c'),
          (this.emCommandFill = this.emCommandFill || w('#2d3d5a', 10)),
          (this.emCommandStroke = this.emCommandStroke || '#5c6d8c'),
          (this.emEventFill = this.emEventFill || w('#5a452d', 10)),
          (this.emEventStroke = this.emEventStroke || '#8c755c'),
          (this.emSwimlaneBackgroundOdd = this.emSwimlaneBackgroundOdd || w(this.background, 5)),
          (this.emSwimlaneBackgroundStroke =
            this.emSwimlaneBackgroundStroke || w(this.background, 12)),
          (this.emArrowhead = this.emArrowhead || this.lineColor),
          (this.emRelationStroke = this.emRelationStroke || this.lineColor),
          (this.attributeBackgroundColorOdd =
            this.attributeBackgroundColorOdd || w(this.background, 12)),
          (this.attributeBackgroundColorEven =
            this.attributeBackgroundColorEven || w(this.background, 2)),
          (this.nodeBorder = this.nodeBorder || '#999'));
      }
      calculate(t) {
        if (typeof t != 'object') {
          this.updateColors();
          return;
        }
        const i = Object.keys(t);
        (i.forEach((e) => {
          this[e] = t[e];
        }),
          this.updateColors(),
          i.forEach((e) => {
            this[e] = t[e];
          }));
      }
    }),
    d(br, 'Theme'),
    br),
  mc = d((r) => {
    const t = new fc();
    return (t.calculate(r), t);
  }, 'getThemeVariables'),
  kr,
  Cc =
    ((kr = class {
      constructor() {
        ((this.background = '#f4f4f4'),
          (this.primaryColor = '#ECECFF'),
          (this.secondaryColor = m(this.primaryColor, { h: 120 })),
          (this.secondaryColor = '#ffffde'),
          (this.tertiaryColor = m(this.primaryColor, { h: -160 })),
          (this.primaryBorderColor = G(this.primaryColor, this.darkMode)),
          (this.secondaryBorderColor = G(this.secondaryColor, this.darkMode)),
          (this.tertiaryBorderColor = G(this.tertiaryColor, this.darkMode)),
          (this.primaryTextColor = B(this.primaryColor)),
          (this.secondaryTextColor = B(this.secondaryColor)),
          (this.tertiaryTextColor = B(this.tertiaryColor)),
          (this.lineColor = B(this.background)),
          (this.textColor = B(this.background)),
          (this.background = 'white'),
          (this.mainBkg = '#ECECFF'),
          (this.secondBkg = '#ffffde'),
          (this.lineColor = '#333333'),
          (this.border1 = '#9370DB'),
          (this.primaryBorderColor = G(this.primaryColor, this.darkMode)),
          (this.border2 = '#aaaa33'),
          (this.arrowheadColor = '#333333'),
          (this.fontFamily = '"trebuchet ms", verdana, arial, sans-serif'),
          (this.fontSize = '16px'),
          (this.labelBackground = 'rgba(232,232,232, 0.8)'),
          (this.textColor = '#333'),
          (this.THEME_COLOR_LIMIT = 12),
          (this.radius = 5),
          (this.strokeWidth = 1),
          (this.nodeBkg = 'calculated'),
          (this.nodeBorder = 'calculated'),
          (this.clusterBkg = 'calculated'),
          (this.clusterBorder = 'calculated'),
          (this.defaultLinkColor = 'calculated'),
          (this.titleColor = 'calculated'),
          (this.edgeLabelBackground = 'calculated'),
          (this.actorBorder = 'calculated'),
          (this.actorBkg = 'calculated'),
          (this.actorTextColor = 'black'),
          (this.actorLineColor = 'calculated'),
          (this.signalColor = 'calculated'),
          (this.signalTextColor = 'calculated'),
          (this.labelBoxBkgColor = 'calculated'),
          (this.labelBoxBorderColor = 'calculated'),
          (this.labelTextColor = 'calculated'),
          (this.loopTextColor = 'calculated'),
          (this.noteBorderColor = 'calculated'),
          (this.noteBkgColor = '#fff5ad'),
          (this.noteTextColor = 'calculated'),
          (this.activationBorderColor = '#666'),
          (this.activationBkgColor = '#f4f4f4'),
          (this.sequenceNumberColor = 'white'),
          (this.clusterBkg = '#FBFBFF'),
          (this.sectionBkgColor = 'calculated'),
          (this.altSectionBkgColor = 'calculated'),
          (this.sectionBkgColor2 = 'calculated'),
          (this.excludeBkgColor = '#eeeeee'),
          (this.taskBorderColor = 'calculated'),
          (this.taskBkgColor = 'calculated'),
          (this.taskTextLightColor = 'calculated'),
          (this.taskTextColor = this.taskTextLightColor),
          (this.taskTextDarkColor = 'calculated'),
          (this.taskTextOutsideColor = this.taskTextDarkColor),
          (this.taskTextClickableColor = 'calculated'),
          (this.activeTaskBorderColor = 'calculated'),
          (this.activeTaskBkgColor = 'calculated'),
          (this.gridColor = 'calculated'),
          (this.doneTaskBkgColor = 'calculated'),
          (this.doneTaskBorderColor = 'calculated'),
          (this.critBorderColor = 'calculated'),
          (this.critBkgColor = 'calculated'),
          (this.todayLineColor = 'calculated'),
          (this.vertLineColor = 'calculated'),
          (this.sectionBkgColor = ar(102, 102, 255, 0.49)),
          (this.altSectionBkgColor = 'white'),
          (this.sectionBkgColor2 = '#fff400'),
          (this.taskBorderColor = '#534fbc'),
          (this.taskBkgColor = '#8a90dd'),
          (this.taskTextLightColor = 'white'),
          (this.taskTextColor = 'calculated'),
          (this.taskTextDarkColor = 'black'),
          (this.taskTextOutsideColor = 'calculated'),
          (this.taskTextClickableColor = '#003163'),
          (this.activeTaskBorderColor = '#534fbc'),
          (this.activeTaskBkgColor = '#bfc7ff'),
          (this.gridColor = 'lightgrey'),
          (this.doneTaskBkgColor = 'lightgrey'),
          (this.doneTaskBorderColor = 'grey'),
          (this.critBorderColor = '#ff8888'),
          (this.critBkgColor = 'red'),
          (this.todayLineColor = 'red'),
          (this.vertLineColor = 'navy'),
          (this.noteFontWeight = this.noteFontWeight || 'normal'),
          (this.fontWeight = this.fontWeight || 'normal'),
          (this.personBorder = this.primaryBorderColor),
          (this.personBkg = this.mainBkg),
          (this.archEdgeColor = 'calculated'),
          (this.archEdgeArrowColor = 'calculated'),
          (this.archEdgeWidth = '3'),
          (this.archGroupBorderColor = this.primaryBorderColor),
          (this.archGroupBorderWidth = '2px'),
          (this.rowOdd = 'calculated'),
          (this.rowEven = 'calculated'),
          (this.labelColor = 'black'),
          (this.errorBkgColor = '#552222'),
          (this.errorTextColor = '#552222'),
          (this.useGradient = !1),
          (this.gradientStart = this.primaryBorderColor),
          (this.gradientStop = this.secondaryBorderColor),
          (this.dropShadow = 'drop-shadow(1px 2px 2px rgba(185, 185, 185, 1))'),
          this.updateColors());
      }
      updateColors() {
        ((this.cScale0 = this.cScale0 || this.primaryColor),
          (this.cScale1 = this.cScale1 || this.secondaryColor),
          (this.cScale2 = this.cScale2 || this.tertiaryColor),
          (this.cScale3 = this.cScale3 || m(this.primaryColor, { h: 30 })),
          (this.cScale4 = this.cScale4 || m(this.primaryColor, { h: 60 })),
          (this.cScale5 = this.cScale5 || m(this.primaryColor, { h: 90 })),
          (this.cScale6 = this.cScale6 || m(this.primaryColor, { h: 120 })),
          (this.cScale7 = this.cScale7 || m(this.primaryColor, { h: 150 })),
          (this.cScale8 = this.cScale8 || m(this.primaryColor, { h: 210 })),
          (this.cScale9 = this.cScale9 || m(this.primaryColor, { h: 270 })),
          (this.cScale10 = this.cScale10 || m(this.primaryColor, { h: 300 })),
          (this.cScale11 = this.cScale11 || m(this.primaryColor, { h: 330 })),
          (this.cScalePeer1 = this.cScalePeer1 || v(this.secondaryColor, 45)),
          (this.cScalePeer2 = this.cScalePeer2 || v(this.tertiaryColor, 40)));
        for (let t = 0; t < this.THEME_COLOR_LIMIT; t++)
          ((this['cScale' + t] = v(this['cScale' + t], 10)),
            (this['cScalePeer' + t] = this['cScalePeer' + t] || v(this['cScale' + t], 25)));
        for (let t = 0; t < this.THEME_COLOR_LIMIT; t++)
          this['cScaleInv' + t] = this['cScaleInv' + t] || m(this['cScale' + t], { h: 180 });
        for (let t = 0; t < 5; t++)
          ((this['surface' + t] =
            this['surface' + t] || m(this.mainBkg, { h: 30, l: -(5 + t * 5) })),
            (this['surfacePeer' + t] =
              this['surfacePeer' + t] || m(this.mainBkg, { h: 30, l: -(7 + t * 5) })));
        if (
          ((this.scaleLabelColor =
            this.scaleLabelColor !== 'calculated' && this.scaleLabelColor
              ? this.scaleLabelColor
              : this.labelTextColor),
          this.labelTextColor !== 'calculated')
        ) {
          ((this.cScaleLabel0 = this.cScaleLabel0 || B(this.labelTextColor)),
            (this.cScaleLabel3 = this.cScaleLabel3 || B(this.labelTextColor)));
          for (let t = 0; t < this.THEME_COLOR_LIMIT; t++)
            this['cScaleLabel' + t] = this['cScaleLabel' + t] || this.labelTextColor;
        }
        ((this.nodeBkg = this.mainBkg),
          (this.nodeBorder = this.border1),
          (this.clusterBkg = this.secondBkg),
          (this.clusterBorder = this.border2),
          (this.defaultLinkColor = this.lineColor),
          (this.titleColor = this.textColor),
          (this.edgeLabelBackground = this.labelBackground),
          (this.actorBorder = this.border1),
          (this.actorBkg = this.mainBkg),
          (this.labelBoxBkgColor = this.actorBkg),
          (this.signalColor = this.textColor),
          (this.signalTextColor = this.textColor),
          (this.labelBoxBorderColor = this.actorBorder),
          (this.labelTextColor = this.actorTextColor),
          (this.loopTextColor = this.actorTextColor),
          (this.noteBorderColor = this.border2),
          (this.noteTextColor = this.actorTextColor),
          (this.actorLineColor = this.actorBorder),
          (this.taskTextColor = this.taskTextLightColor),
          (this.taskTextOutsideColor = this.taskTextDarkColor),
          (this.archEdgeColor = this.lineColor),
          (this.archEdgeArrowColor = this.lineColor),
          (this.rowOdd = this.rowOdd || w(this.primaryColor, 75) || '#ffffff'),
          (this.rowEven = this.rowEven || w(this.primaryColor, 1)),
          (this.transitionColor = this.transitionColor || this.lineColor),
          (this.transitionLabelColor = this.transitionLabelColor || this.textColor),
          (this.stateLabelColor = this.stateLabelColor || this.stateBkg || this.primaryTextColor),
          (this.stateBkg = this.stateBkg || this.mainBkg),
          (this.labelBackgroundColor = this.labelBackgroundColor || this.stateBkg),
          (this.compositeBackground =
            this.compositeBackground || this.background || this.tertiaryColor),
          (this.altBackground = this.altBackground || '#f0f0f0'),
          (this.compositeTitleBackground = this.compositeTitleBackground || this.mainBkg),
          (this.compositeBorder = this.compositeBorder || this.nodeBorder),
          (this.innerEndBackground = this.nodeBorder),
          (this.specialStateColor = this.lineColor),
          (this.errorBkgColor = this.errorBkgColor || this.tertiaryColor),
          (this.errorTextColor = this.errorTextColor || this.tertiaryTextColor),
          (this.transitionColor = this.transitionColor || this.lineColor),
          (this.classText = this.primaryTextColor),
          (this.fillType0 = this.primaryColor),
          (this.fillType1 = this.secondaryColor),
          (this.fillType2 = m(this.primaryColor, { h: 64 })),
          (this.fillType3 = m(this.secondaryColor, { h: 64 })),
          (this.fillType4 = m(this.primaryColor, { h: -64 })),
          (this.fillType5 = m(this.secondaryColor, { h: -64 })),
          (this.fillType6 = m(this.primaryColor, { h: 128 })),
          (this.fillType7 = m(this.secondaryColor, { h: 128 })),
          (this.pie1 = this.pie1 || this.primaryColor),
          (this.pie2 = this.pie2 || this.secondaryColor),
          (this.pie3 = this.pie3 || m(this.tertiaryColor, { l: -40 })),
          (this.pie4 = this.pie4 || m(this.primaryColor, { l: -10 })),
          (this.pie5 = this.pie5 || m(this.secondaryColor, { l: -30 })),
          (this.pie6 = this.pie6 || m(this.tertiaryColor, { l: -20 })),
          (this.pie7 = this.pie7 || m(this.primaryColor, { h: 60, l: -20 })),
          (this.pie8 = this.pie8 || m(this.primaryColor, { h: -60, l: -40 })),
          (this.pie9 = this.pie9 || m(this.primaryColor, { h: 120, l: -40 })),
          (this.pie10 = this.pie10 || m(this.primaryColor, { h: 60, l: -40 })),
          (this.pie11 = this.pie11 || m(this.primaryColor, { h: -90, l: -40 })),
          (this.pie12 = this.pie12 || m(this.primaryColor, { h: 120, l: -30 })),
          (this.pieTitleTextSize = this.pieTitleTextSize || '25px'),
          (this.pieTitleTextColor = this.pieTitleTextColor || this.taskTextDarkColor),
          (this.pieSectionTextSize = this.pieSectionTextSize || '17px'),
          (this.pieSectionTextColor = this.pieSectionTextColor || this.textColor),
          (this.pieLegendTextSize = this.pieLegendTextSize || '17px'),
          (this.pieLegendTextColor = this.pieLegendTextColor || this.taskTextDarkColor),
          (this.pieStrokeColor = this.pieStrokeColor || 'black'),
          (this.pieStrokeWidth = this.pieStrokeWidth || '2px'),
          (this.pieOuterStrokeWidth = this.pieOuterStrokeWidth || '2px'),
          (this.pieOuterStrokeColor = this.pieOuterStrokeColor || 'black'),
          (this.pieOpacity = this.pieOpacity || '0.7'),
          (this.venn1 = this.venn1 ?? m(this.primaryColor, { l: -30 })),
          (this.venn2 = this.venn2 ?? m(this.secondaryColor, { l: -30 })),
          (this.venn3 = this.venn3 ?? m(this.tertiaryColor, { l: -40 })),
          (this.venn4 = this.venn4 ?? m(this.primaryColor, { h: 60, l: -30 })),
          (this.venn5 = this.venn5 ?? m(this.primaryColor, { h: -60, l: -30 })),
          (this.venn6 = this.venn6 ?? m(this.secondaryColor, { h: 60, l: -30 })),
          (this.venn7 = this.venn7 ?? m(this.primaryColor, { h: 120, l: -30 })),
          (this.venn8 = this.venn8 ?? m(this.secondaryColor, { h: 120, l: -30 })),
          (this.vennTitleTextColor = this.vennTitleTextColor ?? this.titleColor),
          (this.vennSetTextColor = this.vennSetTextColor ?? this.textColor),
          (this.quadrant1Fill = this.quadrant1Fill || this.primaryColor),
          (this.quadrant2Fill = this.quadrant2Fill || m(this.primaryColor, { r: 5, g: 5, b: 5 })),
          (this.quadrant3Fill =
            this.quadrant3Fill || m(this.primaryColor, { r: 10, g: 10, b: 10 })),
          (this.quadrant4Fill =
            this.quadrant4Fill || m(this.primaryColor, { r: 15, g: 15, b: 15 })),
          (this.quadrant1TextFill = this.quadrant1TextFill || this.primaryTextColor),
          (this.quadrant2TextFill =
            this.quadrant2TextFill || m(this.primaryTextColor, { r: -5, g: -5, b: -5 })),
          (this.quadrant3TextFill =
            this.quadrant3TextFill || m(this.primaryTextColor, { r: -10, g: -10, b: -10 })),
          (this.quadrant4TextFill =
            this.quadrant4TextFill || m(this.primaryTextColor, { r: -15, g: -15, b: -15 })),
          (this.quadrantPointFill =
            this.quadrantPointFill || Et(this.quadrant1Fill)
              ? w(this.quadrant1Fill)
              : v(this.quadrant1Fill)),
          (this.quadrantPointTextFill = this.quadrantPointTextFill || this.primaryTextColor),
          (this.quadrantXAxisTextFill = this.quadrantXAxisTextFill || this.primaryTextColor),
          (this.quadrantYAxisTextFill = this.quadrantYAxisTextFill || this.primaryTextColor),
          (this.quadrantInternalBorderStrokeFill =
            this.quadrantInternalBorderStrokeFill || this.primaryBorderColor),
          (this.quadrantExternalBorderStrokeFill =
            this.quadrantExternalBorderStrokeFill || this.primaryBorderColor),
          (this.quadrantTitleFill = this.quadrantTitleFill || this.primaryTextColor),
          (this.radar = {
            axisColor: this.radar?.axisColor || this.lineColor,
            axisStrokeWidth: this.radar?.axisStrokeWidth || 2,
            axisLabelFontSize: this.radar?.axisLabelFontSize || 12,
            curveOpacity: this.radar?.curveOpacity || 0.5,
            curveStrokeWidth: this.radar?.curveStrokeWidth || 2,
            graticuleColor: this.radar?.graticuleColor || '#DEDEDE',
            graticuleStrokeWidth: this.radar?.graticuleStrokeWidth || 1,
            graticuleOpacity: this.radar?.graticuleOpacity || 0.3,
            legendBoxSize: this.radar?.legendBoxSize || 12,
            legendFontSize: this.radar?.legendFontSize || 12,
          }),
          (this.wardleyEvolutionColor = this.wardleyEvolutionColor || '#dc3545'),
          (this.wardley = {
            backgroundColor: this.wardley?.backgroundColor || this.background,
            axisColor: this.wardley?.axisColor || this.lineColor,
            axisTextColor: this.wardley?.axisTextColor || this.primaryTextColor,
            gridColor: this.wardley?.gridColor || this.gridColor,
            componentFill: this.wardley?.componentFill || this.background,
            componentStroke: this.wardley?.componentStroke || this.lineColor,
            componentLabelColor: this.wardley?.componentLabelColor || this.primaryTextColor,
            linkStroke: this.wardley?.linkStroke || this.lineColor,
            evolutionStroke: this.wardley?.evolutionStroke || this.wardleyEvolutionColor,
            annotationStroke: this.wardley?.annotationStroke || this.lineColor,
            annotationTextColor: this.wardley?.annotationTextColor || this.primaryTextColor,
            annotationFill: this.wardley?.annotationFill || this.background,
          }),
          (this.xyChart = {
            backgroundColor: this.xyChart?.backgroundColor || this.background,
            titleColor: this.xyChart?.titleColor || this.primaryTextColor,
            dataLabelColor: this.xyChart?.dataLabelColor || this.primaryTextColor,
            xAxisTitleColor: this.xyChart?.xAxisTitleColor || this.primaryTextColor,
            xAxisLabelColor: this.xyChart?.xAxisLabelColor || this.primaryTextColor,
            xAxisTickColor: this.xyChart?.xAxisTickColor || this.primaryTextColor,
            xAxisLineColor: this.xyChart?.xAxisLineColor || this.primaryTextColor,
            yAxisTitleColor: this.xyChart?.yAxisTitleColor || this.primaryTextColor,
            yAxisLabelColor: this.xyChart?.yAxisLabelColor || this.primaryTextColor,
            yAxisTickColor: this.xyChart?.yAxisTickColor || this.primaryTextColor,
            yAxisLineColor: this.xyChart?.yAxisLineColor || this.primaryTextColor,
            plotColorPalette:
              this.xyChart?.plotColorPalette ||
              '#ECECFF,#8493A6,#FFC3A0,#DCDDE1,#B8E994,#D1A36F,#C3CDE6,#FFB6C1,#496078,#F8F3E3',
          }),
          (this.requirementBackground = this.requirementBackground || this.primaryColor),
          (this.requirementBorderColor = this.requirementBorderColor || this.primaryBorderColor),
          (this.requirementBorderSize = this.requirementBorderSize || '1'),
          (this.requirementTextColor = this.requirementTextColor || this.primaryTextColor),
          (this.relationColor = this.relationColor || this.lineColor),
          (this.relationLabelBackground = this.relationLabelBackground || this.labelBackground),
          (this.relationLabelColor = this.relationLabelColor || this.actorTextColor),
          (this.git0 = this.git0 || this.primaryColor),
          (this.git1 = this.git1 || this.secondaryColor),
          (this.git2 = this.git2 || this.tertiaryColor),
          (this.git3 = this.git3 || m(this.primaryColor, { h: -30 })),
          (this.git4 = this.git4 || m(this.primaryColor, { h: -60 })),
          (this.git5 = this.git5 || m(this.primaryColor, { h: -90 })),
          (this.git6 = this.git6 || m(this.primaryColor, { h: 60 })),
          (this.git7 = this.git7 || m(this.primaryColor, { h: 120 })),
          this.darkMode
            ? ((this.git0 = w(this.git0, 25)),
              (this.git1 = w(this.git1, 25)),
              (this.git2 = w(this.git2, 25)),
              (this.git3 = w(this.git3, 25)),
              (this.git4 = w(this.git4, 25)),
              (this.git5 = w(this.git5, 25)),
              (this.git6 = w(this.git6, 25)),
              (this.git7 = w(this.git7, 25)))
            : ((this.git0 = v(this.git0, 25)),
              (this.git1 = v(this.git1, 25)),
              (this.git2 = v(this.git2, 25)),
              (this.git3 = v(this.git3, 25)),
              (this.git4 = v(this.git4, 25)),
              (this.git5 = v(this.git5, 25)),
              (this.git6 = v(this.git6, 25)),
              (this.git7 = v(this.git7, 25))),
          (this.gitInv0 = this.gitInv0 || v(B(this.git0), 25)),
          (this.gitInv1 = this.gitInv1 || B(this.git1)),
          (this.gitInv2 = this.gitInv2 || B(this.git2)),
          (this.gitInv3 = this.gitInv3 || B(this.git3)),
          (this.gitInv4 = this.gitInv4 || B(this.git4)),
          (this.gitInv5 = this.gitInv5 || B(this.git5)),
          (this.gitInv6 = this.gitInv6 || B(this.git6)),
          (this.gitInv7 = this.gitInv7 || B(this.git7)),
          (this.gitBranchLabel0 = this.gitBranchLabel0 || B(this.labelTextColor)),
          (this.gitBranchLabel1 = this.gitBranchLabel1 || this.labelTextColor),
          (this.gitBranchLabel2 = this.gitBranchLabel2 || this.labelTextColor),
          (this.gitBranchLabel3 = this.gitBranchLabel3 || B(this.labelTextColor)),
          (this.gitBranchLabel4 = this.gitBranchLabel4 || this.labelTextColor),
          (this.gitBranchLabel5 = this.gitBranchLabel5 || this.labelTextColor),
          (this.gitBranchLabel6 = this.gitBranchLabel6 || this.labelTextColor),
          (this.gitBranchLabel7 = this.gitBranchLabel7 || this.labelTextColor),
          (this.tagLabelColor = this.tagLabelColor || this.primaryTextColor),
          (this.tagLabelBackground = this.tagLabelBackground || this.primaryColor),
          (this.tagLabelBorder = this.tagBorder || this.primaryBorderColor),
          (this.tagLabelFontSize = this.tagLabelFontSize || '10px'),
          (this.commitLabelColor = this.commitLabelColor || this.secondaryTextColor),
          (this.commitLabelBackground = this.commitLabelBackground || this.secondaryColor),
          (this.commitLabelFontSize = this.commitLabelFontSize || '10px'),
          (this.emUiFill = this.emUiFill || 'white'),
          (this.emUiStroke = this.emUiStroke || '#dbdada'),
          (this.emProcessorFill = this.emProcessorFill || '#edb3f6'),
          (this.emProcessorStroke = this.emProcessorStroke || '#b88cbf'),
          (this.emReadModelFill = this.emReadModelFill || '#d3f1a2'),
          (this.emReadModelStroke = this.emReadModelStroke || '#a3b732'),
          (this.emCommandFill = this.emCommandFill || '#bcd6fe'),
          (this.emCommandStroke = this.emCommandStroke || '#679ac3'),
          (this.emEventFill = this.emEventFill || '#ffb778'),
          (this.emEventStroke = this.emEventStroke || '#c19a0f'),
          (this.emSwimlaneBackgroundOdd = this.emSwimlaneBackgroundOdd || 'rgb(250,250,250)'),
          (this.emSwimlaneBackgroundStroke = this.emSwimlaneBackgroundStroke || 'rgb(240,240,240)'),
          (this.emArrowhead = this.emArrowhead || this.lineColor),
          (this.emRelationStroke = this.emRelationStroke || this.lineColor),
          (this.attributeBackgroundColorOdd = this.attributeBackgroundColorOdd || $t),
          (this.attributeBackgroundColorEven = this.attributeBackgroundColorEven || Pt));
      }
      calculate(t) {
        if (
          (Object.keys(this).forEach((e) => {
            this[e] === 'calculated' && (this[e] = void 0);
          }),
          typeof t != 'object')
        ) {
          this.updateColors();
          return;
        }
        const i = Object.keys(t);
        (i.forEach((e) => {
          this[e] = t[e];
        }),
          this.updateColors(),
          i.forEach((e) => {
            this[e] = t[e];
          }));
      }
    }),
    d(kr, 'Theme'),
    kr),
  yc = d((r) => {
    const t = new Cc();
    return (t.calculate(r), t);
  }, 'getThemeVariables'),
  Br,
  xc =
    ((Br = class {
      constructor() {
        ((this.background = '#f4f4f4'),
          (this.primaryColor = '#cde498'),
          (this.secondaryColor = '#cdffb2'),
          (this.background = 'white'),
          (this.mainBkg = '#cde498'),
          (this.secondBkg = '#cdffb2'),
          (this.lineColor = 'green'),
          (this.border1 = '#13540c'),
          (this.border2 = '#6eaa49'),
          (this.arrowheadColor = 'green'),
          (this.fontFamily = '"trebuchet ms", verdana, arial, sans-serif'),
          (this.fontSize = '16px'),
          (this.tertiaryColor = w('#cde498', 10)),
          (this.primaryBorderColor = G(this.primaryColor, this.darkMode)),
          (this.secondaryBorderColor = G(this.secondaryColor, this.darkMode)),
          (this.tertiaryBorderColor = G(this.tertiaryColor, this.darkMode)),
          (this.primaryTextColor = B(this.primaryColor)),
          (this.secondaryTextColor = B(this.secondaryColor)),
          (this.tertiaryTextColor = B(this.primaryColor)),
          (this.lineColor = B(this.background)),
          (this.textColor = B(this.background)),
          (this.THEME_COLOR_LIMIT = 12),
          (this.radius = 5),
          (this.strokeWidth = 1),
          (this.nodeBkg = 'calculated'),
          (this.nodeBorder = 'calculated'),
          (this.clusterBkg = 'calculated'),
          (this.clusterBorder = 'calculated'),
          (this.defaultLinkColor = 'calculated'),
          (this.titleColor = '#333'),
          (this.edgeLabelBackground = '#e8e8e8'),
          (this.actorBorder = 'calculated'),
          (this.actorBkg = 'calculated'),
          (this.actorTextColor = 'black'),
          (this.actorLineColor = 'calculated'),
          (this.signalColor = '#333'),
          (this.signalTextColor = '#333'),
          (this.labelBoxBkgColor = 'calculated'),
          (this.labelBoxBorderColor = '#326932'),
          (this.labelTextColor = 'calculated'),
          (this.loopTextColor = 'calculated'),
          (this.noteBorderColor = 'calculated'),
          (this.noteBkgColor = '#fff5ad'),
          (this.noteTextColor = 'calculated'),
          (this.activationBorderColor = '#666'),
          (this.activationBkgColor = '#f4f4f4'),
          (this.sequenceNumberColor = 'white'),
          (this.sectionBkgColor = '#6eaa49'),
          (this.altSectionBkgColor = 'white'),
          (this.sectionBkgColor2 = '#6eaa49'),
          (this.excludeBkgColor = '#eeeeee'),
          (this.taskBorderColor = 'calculated'),
          (this.taskBkgColor = '#487e3a'),
          (this.taskTextLightColor = 'white'),
          (this.taskTextColor = 'calculated'),
          (this.taskTextDarkColor = 'black'),
          (this.taskTextOutsideColor = 'calculated'),
          (this.taskTextClickableColor = '#003163'),
          (this.activeTaskBorderColor = 'calculated'),
          (this.activeTaskBkgColor = 'calculated'),
          (this.gridColor = 'lightgrey'),
          (this.doneTaskBkgColor = 'lightgrey'),
          (this.doneTaskBorderColor = 'grey'),
          (this.critBorderColor = '#ff8888'),
          (this.critBkgColor = 'red'),
          (this.todayLineColor = 'red'),
          (this.vertLineColor = '#00BFFF'),
          (this.personBorder = this.primaryBorderColor),
          (this.personBkg = this.mainBkg),
          (this.archEdgeColor = 'calculated'),
          (this.archEdgeArrowColor = 'calculated'),
          (this.archEdgeWidth = '3'),
          (this.archGroupBorderColor = this.primaryBorderColor),
          (this.archGroupBorderWidth = '2px'),
          (this.noteFontWeight = 'normal'),
          (this.fontWeight = 'normal'),
          (this.labelColor = 'black'),
          (this.errorBkgColor = '#552222'),
          (this.errorTextColor = '#552222'),
          (this.useGradient = !0),
          (this.gradientStart = this.primaryBorderColor),
          (this.gradientStop = this.secondaryBorderColor),
          (this.dropShadow = 'drop-shadow( 1px 2px 2px rgba(185,185,185,0.5))'));
      }
      updateColors() {
        ((this.actorBorder = v(this.mainBkg, 20)),
          (this.actorBkg = this.mainBkg),
          (this.labelBoxBkgColor = this.actorBkg),
          (this.labelTextColor = this.actorTextColor),
          (this.loopTextColor = this.actorTextColor),
          (this.noteBorderColor = this.border2),
          (this.noteTextColor = this.actorTextColor),
          (this.actorLineColor = this.actorBorder),
          (this.cScale0 = this.cScale0 || this.primaryColor),
          (this.cScale1 = this.cScale1 || this.secondaryColor),
          (this.cScale2 = this.cScale2 || this.tertiaryColor),
          (this.cScale3 = this.cScale3 || m(this.primaryColor, { h: 30 })),
          (this.cScale4 = this.cScale4 || m(this.primaryColor, { h: 60 })),
          (this.cScale5 = this.cScale5 || m(this.primaryColor, { h: 90 })),
          (this.cScale6 = this.cScale6 || m(this.primaryColor, { h: 120 })),
          (this.cScale7 = this.cScale7 || m(this.primaryColor, { h: 150 })),
          (this.cScale8 = this.cScale8 || m(this.primaryColor, { h: 210 })),
          (this.cScale9 = this.cScale9 || m(this.primaryColor, { h: 270 })),
          (this.cScale10 = this.cScale10 || m(this.primaryColor, { h: 300 })),
          (this.cScale11 = this.cScale11 || m(this.primaryColor, { h: 330 })),
          (this.cScalePeer1 = this.cScalePeer1 || v(this.secondaryColor, 45)),
          (this.cScalePeer2 = this.cScalePeer2 || v(this.tertiaryColor, 40)));
        for (let t = 0; t < this.THEME_COLOR_LIMIT; t++)
          ((this['cScale' + t] = v(this['cScale' + t], 10)),
            (this['cScalePeer' + t] = this['cScalePeer' + t] || v(this['cScale' + t], 25)));
        for (let t = 0; t < this.THEME_COLOR_LIMIT; t++)
          this['cScaleInv' + t] = this['cScaleInv' + t] || m(this['cScale' + t], { h: 180 });
        this.scaleLabelColor =
          this.scaleLabelColor !== 'calculated' && this.scaleLabelColor
            ? this.scaleLabelColor
            : this.labelTextColor;
        for (let t = 0; t < this.THEME_COLOR_LIMIT; t++)
          this['cScaleLabel' + t] = this['cScaleLabel' + t] || this.scaleLabelColor;
        for (let t = 0; t < 5; t++)
          ((this['surface' + t] =
            this['surface' + t] || m(this.mainBkg, { h: 30, s: -30, l: -(5 + t * 5) })),
            (this['surfacePeer' + t] =
              this['surfacePeer' + t] || m(this.mainBkg, { h: 30, s: -30, l: -(8 + t * 5) })));
        ((this.nodeBkg = this.mainBkg),
          (this.nodeBorder = this.border1),
          (this.clusterBkg = this.secondBkg),
          (this.clusterBorder = this.border2),
          (this.defaultLinkColor = this.lineColor),
          (this.taskBorderColor = this.border1),
          (this.taskTextColor = this.taskTextLightColor),
          (this.taskTextOutsideColor = this.taskTextDarkColor),
          (this.activeTaskBorderColor = this.taskBorderColor),
          (this.activeTaskBkgColor = this.mainBkg),
          (this.archEdgeColor = this.lineColor),
          (this.archEdgeArrowColor = this.lineColor),
          (this.rowOdd = this.rowOdd || w(this.mainBkg, 75) || '#ffffff'),
          (this.rowEven = this.rowEven || w(this.mainBkg, 20)),
          (this.transitionColor = this.transitionColor || this.lineColor),
          (this.transitionLabelColor = this.transitionLabelColor || this.textColor),
          (this.stateLabelColor = this.stateLabelColor || this.stateBkg || this.primaryTextColor),
          (this.stateBkg = this.stateBkg || this.mainBkg),
          (this.labelBackgroundColor = this.labelBackgroundColor || this.stateBkg),
          (this.compositeBackground =
            this.compositeBackground || this.background || this.tertiaryColor),
          (this.altBackground = this.altBackground || '#f0f0f0'),
          (this.compositeTitleBackground = this.compositeTitleBackground || this.mainBkg),
          (this.compositeBorder = this.compositeBorder || this.nodeBorder),
          (this.innerEndBackground = this.primaryBorderColor),
          (this.specialStateColor = this.lineColor),
          (this.errorBkgColor = this.errorBkgColor || this.tertiaryColor),
          (this.errorTextColor = this.errorTextColor || this.tertiaryTextColor),
          (this.transitionColor = this.transitionColor || this.lineColor),
          (this.classText = this.primaryTextColor),
          (this.fillType0 = this.primaryColor),
          (this.fillType1 = this.secondaryColor),
          (this.fillType2 = m(this.primaryColor, { h: 64 })),
          (this.fillType3 = m(this.secondaryColor, { h: 64 })),
          (this.fillType4 = m(this.primaryColor, { h: -64 })),
          (this.fillType5 = m(this.secondaryColor, { h: -64 })),
          (this.fillType6 = m(this.primaryColor, { h: 128 })),
          (this.fillType7 = m(this.secondaryColor, { h: 128 })),
          (this.pie1 = this.pie1 || this.primaryColor),
          (this.pie2 = this.pie2 || this.secondaryColor),
          (this.pie3 = this.pie3 || this.tertiaryColor),
          (this.pie4 = this.pie4 || m(this.primaryColor, { l: -30 })),
          (this.pie5 = this.pie5 || m(this.secondaryColor, { l: -30 })),
          (this.pie6 = this.pie6 || m(this.tertiaryColor, { h: 40, l: -40 })),
          (this.pie7 = this.pie7 || m(this.primaryColor, { h: 60, l: -10 })),
          (this.pie8 = this.pie8 || m(this.primaryColor, { h: -60, l: -10 })),
          (this.pie9 = this.pie9 || m(this.primaryColor, { h: 120, l: 0 })),
          (this.pie10 = this.pie10 || m(this.primaryColor, { h: 60, l: -50 })),
          (this.pie11 = this.pie11 || m(this.primaryColor, { h: -60, l: -50 })),
          (this.pie12 = this.pie12 || m(this.primaryColor, { h: 120, l: -50 })),
          (this.pieTitleTextSize = this.pieTitleTextSize || '25px'),
          (this.pieTitleTextColor = this.pieTitleTextColor || this.taskTextDarkColor),
          (this.pieSectionTextSize = this.pieSectionTextSize || '17px'),
          (this.pieSectionTextColor = this.pieSectionTextColor || this.textColor),
          (this.pieLegendTextSize = this.pieLegendTextSize || '17px'),
          (this.pieLegendTextColor = this.pieLegendTextColor || this.taskTextDarkColor),
          (this.pieStrokeColor = this.pieStrokeColor || 'black'),
          (this.pieStrokeWidth = this.pieStrokeWidth || '2px'),
          (this.pieOuterStrokeWidth = this.pieOuterStrokeWidth || '2px'),
          (this.pieOuterStrokeColor = this.pieOuterStrokeColor || 'black'),
          (this.pieOpacity = this.pieOpacity || '0.7'),
          (this.venn1 = this.venn1 ?? m(this.primaryColor, { l: -30 })),
          (this.venn2 = this.venn2 ?? m(this.secondaryColor, { l: -30 })),
          (this.venn3 = this.venn3 ?? m(this.tertiaryColor, { l: -30 })),
          (this.venn4 = this.venn4 ?? m(this.primaryColor, { h: 60, l: -30 })),
          (this.venn5 = this.venn5 ?? m(this.primaryColor, { h: -60, l: -30 })),
          (this.venn6 = this.venn6 ?? m(this.secondaryColor, { h: 60, l: -30 })),
          (this.venn7 = this.venn7 ?? m(this.primaryColor, { h: 120, l: -30 })),
          (this.venn8 = this.venn8 ?? m(this.secondaryColor, { h: 120, l: -30 })),
          (this.vennTitleTextColor = this.vennTitleTextColor ?? this.titleColor),
          (this.vennSetTextColor = this.vennSetTextColor ?? this.textColor),
          (this.quadrant1Fill = this.quadrant1Fill || this.primaryColor),
          (this.quadrant2Fill = this.quadrant2Fill || m(this.primaryColor, { r: 5, g: 5, b: 5 })),
          (this.quadrant3Fill =
            this.quadrant3Fill || m(this.primaryColor, { r: 10, g: 10, b: 10 })),
          (this.quadrant4Fill =
            this.quadrant4Fill || m(this.primaryColor, { r: 15, g: 15, b: 15 })),
          (this.quadrant1TextFill = this.quadrant1TextFill || this.primaryTextColor),
          (this.quadrant2TextFill =
            this.quadrant2TextFill || m(this.primaryTextColor, { r: -5, g: -5, b: -5 })),
          (this.quadrant3TextFill =
            this.quadrant3TextFill || m(this.primaryTextColor, { r: -10, g: -10, b: -10 })),
          (this.quadrant4TextFill =
            this.quadrant4TextFill || m(this.primaryTextColor, { r: -15, g: -15, b: -15 })),
          (this.quadrantPointFill =
            this.quadrantPointFill || Et(this.quadrant1Fill)
              ? w(this.quadrant1Fill)
              : v(this.quadrant1Fill)),
          (this.quadrantPointTextFill = this.quadrantPointTextFill || this.primaryTextColor),
          (this.quadrantXAxisTextFill = this.quadrantXAxisTextFill || this.primaryTextColor),
          (this.quadrantYAxisTextFill = this.quadrantYAxisTextFill || this.primaryTextColor),
          (this.quadrantInternalBorderStrokeFill =
            this.quadrantInternalBorderStrokeFill || this.primaryBorderColor),
          (this.quadrantExternalBorderStrokeFill =
            this.quadrantExternalBorderStrokeFill || this.primaryBorderColor),
          (this.quadrantTitleFill = this.quadrantTitleFill || this.primaryTextColor),
          (this.packet = {
            startByteColor: this.primaryTextColor,
            endByteColor: this.primaryTextColor,
            labelColor: this.primaryTextColor,
            titleColor: this.primaryTextColor,
            blockStrokeColor: this.primaryTextColor,
            blockFillColor: this.mainBkg,
          }),
          (this.radar = {
            axisColor: this.radar?.axisColor || this.lineColor,
            axisStrokeWidth: this.radar?.axisStrokeWidth || 2,
            axisLabelFontSize: this.radar?.axisLabelFontSize || 12,
            curveOpacity: this.radar?.curveOpacity || 0.5,
            curveStrokeWidth: this.radar?.curveStrokeWidth || 2,
            graticuleColor: this.radar?.graticuleColor || '#DEDEDE',
            graticuleStrokeWidth: this.radar?.graticuleStrokeWidth || 1,
            graticuleOpacity: this.radar?.graticuleOpacity || 0.3,
            legendBoxSize: this.radar?.legendBoxSize || 12,
            legendFontSize: this.radar?.legendFontSize || 12,
          }),
          (this.wardleyEvolutionColor = this.wardleyEvolutionColor || '#dc3545'),
          (this.wardley = {
            backgroundColor: this.wardley?.backgroundColor || this.background,
            axisColor: this.wardley?.axisColor || this.lineColor,
            axisTextColor: this.wardley?.axisTextColor || this.primaryTextColor,
            gridColor: this.wardley?.gridColor || this.gridColor,
            componentFill: this.wardley?.componentFill || this.background,
            componentStroke: this.wardley?.componentStroke || this.lineColor,
            componentLabelColor: this.wardley?.componentLabelColor || this.primaryTextColor,
            linkStroke: this.wardley?.linkStroke || this.lineColor,
            evolutionStroke: this.wardley?.evolutionStroke || this.wardleyEvolutionColor,
            annotationStroke: this.wardley?.annotationStroke || this.lineColor,
            annotationTextColor: this.wardley?.annotationTextColor || this.primaryTextColor,
            annotationFill: this.wardley?.annotationFill || this.background,
          }),
          (this.xyChart = {
            backgroundColor: this.xyChart?.backgroundColor || this.background,
            titleColor: this.xyChart?.titleColor || this.primaryTextColor,
            dataLabelColor: this.xyChart?.dataLabelColor || this.primaryTextColor,
            xAxisTitleColor: this.xyChart?.xAxisTitleColor || this.primaryTextColor,
            xAxisLabelColor: this.xyChart?.xAxisLabelColor || this.primaryTextColor,
            xAxisTickColor: this.xyChart?.xAxisTickColor || this.primaryTextColor,
            xAxisLineColor: this.xyChart?.xAxisLineColor || this.primaryTextColor,
            yAxisTitleColor: this.xyChart?.yAxisTitleColor || this.primaryTextColor,
            yAxisLabelColor: this.xyChart?.yAxisLabelColor || this.primaryTextColor,
            yAxisTickColor: this.xyChart?.yAxisTickColor || this.primaryTextColor,
            yAxisLineColor: this.xyChart?.yAxisLineColor || this.primaryTextColor,
            plotColorPalette:
              this.xyChart?.plotColorPalette ||
              '#CDE498,#FF6B6B,#A0D2DB,#D7BDE2,#F0F0F0,#FFC3A0,#7FD8BE,#FF9A8B,#FAF3E0,#FFF176',
          }),
          (this.requirementBackground = this.requirementBackground || this.primaryColor),
          (this.requirementBorderColor = this.requirementBorderColor || this.primaryBorderColor),
          (this.requirementBorderSize = this.requirementBorderSize || '1'),
          (this.requirementTextColor = this.requirementTextColor || this.primaryTextColor),
          (this.relationColor = this.relationColor || this.lineColor),
          (this.relationLabelBackground = this.relationLabelBackground || this.edgeLabelBackground),
          (this.relationLabelColor = this.relationLabelColor || this.actorTextColor),
          (this.git0 = this.git0 || this.primaryColor),
          (this.git1 = this.git1 || this.secondaryColor),
          (this.git2 = this.git2 || this.tertiaryColor),
          (this.git3 = this.git3 || m(this.primaryColor, { h: -30 })),
          (this.git4 = this.git4 || m(this.primaryColor, { h: -60 })),
          (this.git5 = this.git5 || m(this.primaryColor, { h: -90 })),
          (this.git6 = this.git6 || m(this.primaryColor, { h: 60 })),
          (this.git7 = this.git7 || m(this.primaryColor, { h: 120 })),
          this.darkMode
            ? ((this.git0 = w(this.git0, 25)),
              (this.git1 = w(this.git1, 25)),
              (this.git2 = w(this.git2, 25)),
              (this.git3 = w(this.git3, 25)),
              (this.git4 = w(this.git4, 25)),
              (this.git5 = w(this.git5, 25)),
              (this.git6 = w(this.git6, 25)),
              (this.git7 = w(this.git7, 25)))
            : ((this.git0 = v(this.git0, 25)),
              (this.git1 = v(this.git1, 25)),
              (this.git2 = v(this.git2, 25)),
              (this.git3 = v(this.git3, 25)),
              (this.git4 = v(this.git4, 25)),
              (this.git5 = v(this.git5, 25)),
              (this.git6 = v(this.git6, 25)),
              (this.git7 = v(this.git7, 25))),
          (this.gitInv0 = this.gitInv0 || B(this.git0)),
          (this.gitInv1 = this.gitInv1 || B(this.git1)),
          (this.gitInv2 = this.gitInv2 || B(this.git2)),
          (this.gitInv3 = this.gitInv3 || B(this.git3)),
          (this.gitInv4 = this.gitInv4 || B(this.git4)),
          (this.gitInv5 = this.gitInv5 || B(this.git5)),
          (this.gitInv6 = this.gitInv6 || B(this.git6)),
          (this.gitInv7 = this.gitInv7 || B(this.git7)),
          (this.gitBranchLabel0 = this.gitBranchLabel0 || B(this.labelTextColor)),
          (this.gitBranchLabel1 = this.gitBranchLabel1 || this.labelTextColor),
          (this.gitBranchLabel2 = this.gitBranchLabel2 || this.labelTextColor),
          (this.gitBranchLabel3 = this.gitBranchLabel3 || B(this.labelTextColor)),
          (this.gitBranchLabel4 = this.gitBranchLabel4 || this.labelTextColor),
          (this.gitBranchLabel5 = this.gitBranchLabel5 || this.labelTextColor),
          (this.gitBranchLabel6 = this.gitBranchLabel6 || this.labelTextColor),
          (this.gitBranchLabel7 = this.gitBranchLabel7 || this.labelTextColor),
          (this.tagLabelColor = this.tagLabelColor || this.primaryTextColor),
          (this.tagLabelBackground = this.tagLabelBackground || this.primaryColor),
          (this.tagLabelBorder = this.tagBorder || this.primaryBorderColor),
          (this.tagLabelFontSize = this.tagLabelFontSize || '10px'),
          (this.commitLabelColor = this.commitLabelColor || this.secondaryTextColor),
          (this.commitLabelBackground = this.commitLabelBackground || this.secondaryColor),
          (this.commitLabelFontSize = this.commitLabelFontSize || '10px'),
          (this.emUiFill = this.emUiFill || 'white'),
          (this.emUiStroke = this.emUiStroke || '#dbdada'),
          (this.emProcessorFill = this.emProcessorFill || '#edb3f6'),
          (this.emProcessorStroke = this.emProcessorStroke || '#b88cbf'),
          (this.emReadModelFill = this.emReadModelFill || '#d3f1a2'),
          (this.emReadModelStroke = this.emReadModelStroke || '#a3b732'),
          (this.emCommandFill = this.emCommandFill || '#bcd6fe'),
          (this.emCommandStroke = this.emCommandStroke || '#679ac3'),
          (this.emEventFill = this.emEventFill || '#ffb778'),
          (this.emEventStroke = this.emEventStroke || '#c19a0f'),
          (this.emSwimlaneBackgroundOdd = this.emSwimlaneBackgroundOdd || 'rgb(250,250,250)'),
          (this.emSwimlaneBackgroundStroke = this.emSwimlaneBackgroundStroke || 'rgb(240,240,240)'),
          (this.emArrowhead = this.emArrowhead || this.lineColor),
          (this.emRelationStroke = this.emRelationStroke || this.lineColor),
          (this.attributeBackgroundColorOdd = this.attributeBackgroundColorOdd || $t),
          (this.attributeBackgroundColorEven = this.attributeBackgroundColorEven || Pt));
      }
      calculate(t) {
        if (typeof t != 'object') {
          this.updateColors();
          return;
        }
        const i = Object.keys(t);
        (i.forEach((e) => {
          this[e] = t[e];
        }),
          this.updateColors(),
          i.forEach((e) => {
            this[e] = t[e];
          }));
      }
    }),
    d(Br, 'Theme'),
    Br),
  bc = d((r) => {
    const t = new xc();
    return (t.calculate(r), t);
  }, 'getThemeVariables'),
  Tr,
  kc =
    ((Tr = class {
      constructor() {
        ((this.primaryColor = '#eee'),
          (this.contrast = '#707070'),
          (this.secondaryColor = w(this.contrast, 55)),
          (this.background = '#ffffff'),
          (this.tertiaryColor = m(this.primaryColor, { h: -160 })),
          (this.primaryBorderColor = G(this.primaryColor, this.darkMode)),
          (this.secondaryBorderColor = G(this.secondaryColor, this.darkMode)),
          (this.tertiaryBorderColor = G(this.tertiaryColor, this.darkMode)),
          (this.primaryTextColor = B(this.primaryColor)),
          (this.secondaryTextColor = B(this.secondaryColor)),
          (this.tertiaryTextColor = B(this.tertiaryColor)),
          (this.lineColor = B(this.background)),
          (this.textColor = B(this.background)),
          (this.mainBkg = '#eee'),
          (this.secondBkg = 'calculated'),
          (this.lineColor = '#666'),
          (this.border1 = '#999'),
          (this.border2 = 'calculated'),
          (this.note = '#ffa'),
          (this.text = '#333'),
          (this.critical = '#d42'),
          (this.done = '#bbb'),
          (this.arrowheadColor = '#333333'),
          (this.fontFamily = '"trebuchet ms", verdana, arial, sans-serif'),
          (this.fontSize = '16px'),
          (this.THEME_COLOR_LIMIT = 12),
          (this.radius = 5),
          (this.strokeWidth = 1),
          (this.nodeBkg = 'calculated'),
          (this.nodeBorder = 'calculated'),
          (this.clusterBkg = 'calculated'),
          (this.clusterBorder = 'calculated'),
          (this.defaultLinkColor = 'calculated'),
          (this.titleColor = 'calculated'),
          (this.edgeLabelBackground = 'white'),
          (this.actorBorder = 'calculated'),
          (this.actorBkg = 'calculated'),
          (this.actorTextColor = 'calculated'),
          (this.actorLineColor = this.actorBorder),
          (this.signalColor = 'calculated'),
          (this.signalTextColor = 'calculated'),
          (this.labelBoxBkgColor = 'calculated'),
          (this.labelBoxBorderColor = 'calculated'),
          (this.labelTextColor = 'calculated'),
          (this.loopTextColor = 'calculated'),
          (this.noteBorderColor = 'calculated'),
          (this.noteBkgColor = 'calculated'),
          (this.noteTextColor = 'calculated'),
          (this.activationBorderColor = '#666'),
          (this.activationBkgColor = '#f4f4f4'),
          (this.sequenceNumberColor = 'white'),
          (this.sectionBkgColor = 'calculated'),
          (this.altSectionBkgColor = 'white'),
          (this.sectionBkgColor2 = 'calculated'),
          (this.excludeBkgColor = '#eeeeee'),
          (this.taskBorderColor = 'calculated'),
          (this.taskBkgColor = 'calculated'),
          (this.taskTextLightColor = 'white'),
          (this.taskTextColor = 'calculated'),
          (this.taskTextDarkColor = 'calculated'),
          (this.taskTextOutsideColor = 'calculated'),
          (this.taskTextClickableColor = '#003163'),
          (this.activeTaskBorderColor = 'calculated'),
          (this.activeTaskBkgColor = 'calculated'),
          (this.gridColor = 'calculated'),
          (this.doneTaskBkgColor = 'calculated'),
          (this.doneTaskBorderColor = 'calculated'),
          (this.critBkgColor = 'calculated'),
          (this.critBorderColor = 'calculated'),
          (this.todayLineColor = 'calculated'),
          (this.vertLineColor = 'calculated'),
          (this.personBorder = this.primaryBorderColor),
          (this.personBkg = this.mainBkg),
          (this.archEdgeColor = 'calculated'),
          (this.archEdgeArrowColor = 'calculated'),
          (this.archEdgeWidth = '3'),
          (this.archGroupBorderColor = this.primaryBorderColor),
          (this.archGroupBorderWidth = '2px'),
          (this.noteFontWeight = 'normal'),
          (this.fontWeight = 'normal'),
          (this.rowOdd = this.rowOdd || w(this.mainBkg, 75) || '#ffffff'),
          (this.rowEven = this.rowEven || '#f4f4f4'),
          (this.labelColor = 'black'),
          (this.errorBkgColor = '#552222'),
          (this.errorTextColor = '#552222'),
          (this.useGradient = !0),
          (this.gradientStart = this.primaryBorderColor),
          (this.gradientStop = this.secondaryBorderColor),
          (this.dropShadow = 'drop-shadow( 1px 2px 2px rgba(185,185,185,1))'));
      }
      updateColors() {
        ((this.secondBkg = w(this.contrast, 55)),
          (this.border2 = this.contrast),
          (this.actorBorder = w(this.border1, 23)),
          (this.actorBkg = this.mainBkg),
          (this.actorTextColor = this.text),
          (this.actorLineColor = this.actorBorder),
          (this.signalColor = this.text),
          (this.signalTextColor = this.text),
          (this.labelBoxBkgColor = this.actorBkg),
          (this.labelBoxBorderColor = this.actorBorder),
          (this.labelTextColor = this.text),
          (this.loopTextColor = this.text),
          (this.noteBorderColor = '#999'),
          (this.noteBkgColor = '#666'),
          (this.noteTextColor = '#fff'),
          (this.cScale0 = this.cScale0 || '#555'),
          (this.cScale1 = this.cScale1 || '#F4F4F4'),
          (this.cScale2 = this.cScale2 || '#555'),
          (this.cScale3 = this.cScale3 || '#BBB'),
          (this.cScale4 = this.cScale4 || '#777'),
          (this.cScale5 = this.cScale5 || '#999'),
          (this.cScale6 = this.cScale6 || '#DDD'),
          (this.cScale7 = this.cScale7 || '#FFF'),
          (this.cScale8 = this.cScale8 || '#DDD'),
          (this.cScale9 = this.cScale9 || '#BBB'),
          (this.cScale10 = this.cScale10 || '#999'),
          (this.cScale11 = this.cScale11 || '#777'));
        for (let t = 0; t < this.THEME_COLOR_LIMIT; t++)
          this['cScaleInv' + t] = this['cScaleInv' + t] || B(this['cScale' + t]);
        for (let t = 0; t < this.THEME_COLOR_LIMIT; t++)
          this.darkMode
            ? (this['cScalePeer' + t] = this['cScalePeer' + t] || w(this['cScale' + t], 10))
            : (this['cScalePeer' + t] = this['cScalePeer' + t] || v(this['cScale' + t], 10));
        ((this.scaleLabelColor =
          this.scaleLabelColor || (this.darkMode ? 'black' : this.labelTextColor)),
          (this.cScaleLabel0 = this.cScaleLabel0 || this.cScale1),
          (this.cScaleLabel2 = this.cScaleLabel2 || this.cScale1));
        for (let t = 0; t < this.THEME_COLOR_LIMIT; t++)
          this['cScaleLabel' + t] = this['cScaleLabel' + t] || this.scaleLabelColor;
        for (let t = 0; t < 5; t++)
          ((this['surface' + t] = this['surface' + t] || m(this.mainBkg, { l: -(5 + t * 5) })),
            (this['surfacePeer' + t] =
              this['surfacePeer' + t] || m(this.mainBkg, { l: -(8 + t * 5) })));
        ((this.nodeBkg = this.mainBkg),
          (this.nodeBorder = this.border1),
          (this.clusterBkg = this.secondBkg),
          (this.clusterBorder = this.border2),
          (this.defaultLinkColor = this.lineColor),
          (this.titleColor = this.text),
          (this.sectionBkgColor = w(this.contrast, 30)),
          (this.sectionBkgColor2 = w(this.contrast, 30)),
          (this.taskBorderColor = v(this.contrast, 10)),
          (this.taskBkgColor = this.contrast),
          (this.taskTextColor = this.taskTextLightColor),
          (this.taskTextDarkColor = this.text),
          (this.taskTextOutsideColor = this.taskTextDarkColor),
          (this.activeTaskBorderColor = this.taskBorderColor),
          (this.activeTaskBkgColor = this.mainBkg),
          (this.gridColor = w(this.border1, 30)),
          (this.doneTaskBkgColor = this.done),
          (this.doneTaskBorderColor = this.lineColor),
          (this.critBkgColor = this.critical),
          (this.critBorderColor = v(this.critBkgColor, 10)),
          (this.todayLineColor = this.critBkgColor),
          (this.vertLineColor = this.critBkgColor),
          (this.archEdgeColor = this.lineColor),
          (this.archEdgeArrowColor = this.lineColor),
          (this.transitionColor = this.transitionColor || '#000'),
          (this.transitionLabelColor = this.transitionLabelColor || this.textColor),
          (this.stateLabelColor = this.stateLabelColor || this.stateBkg || this.primaryTextColor),
          (this.stateBkg = this.stateBkg || this.mainBkg),
          (this.labelBackgroundColor = this.labelBackgroundColor || this.stateBkg),
          (this.compositeBackground =
            this.compositeBackground || this.background || this.tertiaryColor),
          (this.altBackground = this.altBackground || '#f4f4f4'),
          (this.compositeTitleBackground = this.compositeTitleBackground || this.mainBkg),
          (this.stateBorder = this.stateBorder || '#000'),
          (this.innerEndBackground = this.primaryBorderColor),
          (this.specialStateColor = '#222'),
          (this.errorBkgColor = this.errorBkgColor || this.tertiaryColor),
          (this.errorTextColor = this.errorTextColor || this.tertiaryTextColor),
          (this.classText = this.primaryTextColor),
          (this.fillType0 = this.primaryColor),
          (this.fillType1 = this.secondaryColor),
          (this.fillType2 = m(this.primaryColor, { h: 64 })),
          (this.fillType3 = m(this.secondaryColor, { h: 64 })),
          (this.fillType4 = m(this.primaryColor, { h: -64 })),
          (this.fillType5 = m(this.secondaryColor, { h: -64 })),
          (this.fillType6 = m(this.primaryColor, { h: 128 })),
          (this.fillType7 = m(this.secondaryColor, { h: 128 })));
        for (let t = 0; t < this.THEME_COLOR_LIMIT; t++) this['pie' + t] = this['cScale' + t];
        ((this.pie12 = this.pie0),
          (this.pieTitleTextSize = this.pieTitleTextSize || '25px'),
          (this.pieTitleTextColor = this.pieTitleTextColor || this.taskTextDarkColor),
          (this.pieSectionTextSize = this.pieSectionTextSize || '17px'),
          (this.pieSectionTextColor = this.pieSectionTextColor || this.textColor),
          (this.pieLegendTextSize = this.pieLegendTextSize || '17px'),
          (this.pieLegendTextColor = this.pieLegendTextColor || this.taskTextDarkColor),
          (this.pieStrokeColor = this.pieStrokeColor || 'black'),
          (this.pieStrokeWidth = this.pieStrokeWidth || '2px'),
          (this.pieOuterStrokeWidth = this.pieOuterStrokeWidth || '2px'),
          (this.pieOuterStrokeColor = this.pieOuterStrokeColor || 'black'),
          (this.pieOpacity = this.pieOpacity || '0.7'));
        for (let t = 0; t < 8; t++)
          this['venn' + (t + 1)] = this['venn' + (t + 1)] ?? this['cScale' + t];
        ((this.vennTitleTextColor = this.vennTitleTextColor ?? this.titleColor),
          (this.vennSetTextColor = this.vennSetTextColor ?? this.textColor),
          (this.quadrant1Fill = this.quadrant1Fill || this.primaryColor),
          (this.quadrant2Fill = this.quadrant2Fill || m(this.primaryColor, { r: 5, g: 5, b: 5 })),
          (this.quadrant3Fill =
            this.quadrant3Fill || m(this.primaryColor, { r: 10, g: 10, b: 10 })),
          (this.quadrant4Fill =
            this.quadrant4Fill || m(this.primaryColor, { r: 15, g: 15, b: 15 })),
          (this.quadrant1TextFill = this.quadrant1TextFill || this.primaryTextColor),
          (this.quadrant2TextFill =
            this.quadrant2TextFill || m(this.primaryTextColor, { r: -5, g: -5, b: -5 })),
          (this.quadrant3TextFill =
            this.quadrant3TextFill || m(this.primaryTextColor, { r: -10, g: -10, b: -10 })),
          (this.quadrant4TextFill =
            this.quadrant4TextFill || m(this.primaryTextColor, { r: -15, g: -15, b: -15 })),
          (this.quadrantPointFill =
            this.quadrantPointFill || Et(this.quadrant1Fill)
              ? w(this.quadrant1Fill)
              : v(this.quadrant1Fill)),
          (this.quadrantPointTextFill = this.quadrantPointTextFill || this.primaryTextColor),
          (this.quadrantXAxisTextFill = this.quadrantXAxisTextFill || this.primaryTextColor),
          (this.quadrantYAxisTextFill = this.quadrantYAxisTextFill || this.primaryTextColor),
          (this.quadrantInternalBorderStrokeFill =
            this.quadrantInternalBorderStrokeFill || this.primaryBorderColor),
          (this.quadrantExternalBorderStrokeFill =
            this.quadrantExternalBorderStrokeFill || this.primaryBorderColor),
          (this.quadrantTitleFill = this.quadrantTitleFill || this.primaryTextColor),
          (this.xyChart = {
            backgroundColor: this.xyChart?.backgroundColor || this.background,
            titleColor: this.xyChart?.titleColor || this.primaryTextColor,
            dataLabelColor: this.xyChart?.dataLabelColor || this.primaryTextColor,
            xAxisTitleColor: this.xyChart?.xAxisTitleColor || this.primaryTextColor,
            xAxisLabelColor: this.xyChart?.xAxisLabelColor || this.primaryTextColor,
            xAxisTickColor: this.xyChart?.xAxisTickColor || this.primaryTextColor,
            xAxisLineColor: this.xyChart?.xAxisLineColor || this.primaryTextColor,
            yAxisTitleColor: this.xyChart?.yAxisTitleColor || this.primaryTextColor,
            yAxisLabelColor: this.xyChart?.yAxisLabelColor || this.primaryTextColor,
            yAxisTickColor: this.xyChart?.yAxisTickColor || this.primaryTextColor,
            yAxisLineColor: this.xyChart?.yAxisLineColor || this.primaryTextColor,
            plotColorPalette:
              this.xyChart?.plotColorPalette ||
              '#EEE,#6BB8E4,#8ACB88,#C7ACD6,#E8DCC2,#FFB2A8,#FFF380,#7E8D91,#FFD8B1,#FAF3E0',
          }),
          (this.radar = {
            axisColor: this.radar?.axisColor || this.lineColor,
            axisStrokeWidth: this.radar?.axisStrokeWidth || 2,
            axisLabelFontSize: this.radar?.axisLabelFontSize || 12,
            curveOpacity: this.radar?.curveOpacity || 0.5,
            curveStrokeWidth: this.radar?.curveStrokeWidth || 2,
            graticuleColor: this.radar?.graticuleColor || '#DEDEDE',
            graticuleStrokeWidth: this.radar?.graticuleStrokeWidth || 1,
            graticuleOpacity: this.radar?.graticuleOpacity || 0.3,
            legendBoxSize: this.radar?.legendBoxSize || 12,
            legendFontSize: this.radar?.legendFontSize || 12,
          }),
          (this.wardleyEvolutionColor = this.wardleyEvolutionColor || '#dc3545'),
          (this.wardley = {
            backgroundColor: this.wardley?.backgroundColor || this.background,
            axisColor: this.wardley?.axisColor || this.lineColor,
            axisTextColor: this.wardley?.axisTextColor || this.primaryTextColor,
            gridColor: this.wardley?.gridColor || this.gridColor,
            componentFill: this.wardley?.componentFill || this.background,
            componentStroke: this.wardley?.componentStroke || this.lineColor,
            componentLabelColor: this.wardley?.componentLabelColor || this.primaryTextColor,
            linkStroke: this.wardley?.linkStroke || this.lineColor,
            evolutionStroke: this.wardley?.evolutionStroke || this.wardleyEvolutionColor,
            annotationStroke: this.wardley?.annotationStroke || this.lineColor,
            annotationTextColor: this.wardley?.annotationTextColor || this.primaryTextColor,
            annotationFill: this.wardley?.annotationFill || this.background,
          }),
          (this.requirementBackground = this.requirementBackground || this.primaryColor),
          (this.requirementBorderColor = this.requirementBorderColor || this.primaryBorderColor),
          (this.requirementBorderSize = this.requirementBorderSize || '1'),
          (this.requirementTextColor = this.requirementTextColor || this.primaryTextColor),
          (this.relationColor = this.relationColor || this.lineColor),
          (this.relationLabelBackground = this.relationLabelBackground || this.edgeLabelBackground),
          (this.relationLabelColor = this.relationLabelColor || this.actorTextColor),
          (this.git0 = v(this.pie1, 25) || this.primaryColor),
          (this.git1 = this.pie2 || this.secondaryColor),
          (this.git2 = this.pie3 || this.tertiaryColor),
          (this.git3 = this.pie4 || m(this.primaryColor, { h: -30 })),
          (this.git4 = this.pie5 || m(this.primaryColor, { h: -60 })),
          (this.git5 = this.pie6 || m(this.primaryColor, { h: -90 })),
          (this.git6 = this.pie7 || m(this.primaryColor, { h: 60 })),
          (this.git7 = this.pie8 || m(this.primaryColor, { h: 120 })),
          (this.gitInv0 = this.gitInv0 || B(this.git0)),
          (this.gitInv1 = this.gitInv1 || B(this.git1)),
          (this.gitInv2 = this.gitInv2 || B(this.git2)),
          (this.gitInv3 = this.gitInv3 || B(this.git3)),
          (this.gitInv4 = this.gitInv4 || B(this.git4)),
          (this.gitInv5 = this.gitInv5 || B(this.git5)),
          (this.gitInv6 = this.gitInv6 || B(this.git6)),
          (this.gitInv7 = this.gitInv7 || B(this.git7)),
          (this.branchLabelColor = this.branchLabelColor || this.labelTextColor),
          (this.gitBranchLabel0 = this.branchLabelColor),
          (this.gitBranchLabel1 = 'white'),
          (this.gitBranchLabel2 = this.branchLabelColor),
          (this.gitBranchLabel3 = 'white'),
          (this.gitBranchLabel4 = this.branchLabelColor),
          (this.gitBranchLabel5 = this.branchLabelColor),
          (this.gitBranchLabel6 = this.branchLabelColor),
          (this.gitBranchLabel7 = this.branchLabelColor),
          (this.tagLabelColor = this.tagLabelColor || this.primaryTextColor),
          (this.tagLabelBackground = this.tagLabelBackground || this.primaryColor),
          (this.tagLabelBorder = this.tagBorder || this.primaryBorderColor),
          (this.tagLabelFontSize = this.tagLabelFontSize || '10px'),
          (this.commitLabelColor = this.commitLabelColor || this.secondaryTextColor),
          (this.commitLabelBackground = this.commitLabelBackground || this.secondaryColor),
          (this.commitLabelFontSize = this.commitLabelFontSize || '10px'),
          (this.emUiFill = this.emUiFill || 'white'),
          (this.emUiStroke = this.emUiStroke || '#dbdada'),
          (this.emProcessorFill = this.emProcessorFill || '#edb3f6'),
          (this.emProcessorStroke = this.emProcessorStroke || '#b88cbf'),
          (this.emReadModelFill = this.emReadModelFill || '#d3f1a2'),
          (this.emReadModelStroke = this.emReadModelStroke || '#a3b732'),
          (this.emCommandFill = this.emCommandFill || '#bcd6fe'),
          (this.emCommandStroke = this.emCommandStroke || '#679ac3'),
          (this.emEventFill = this.emEventFill || '#ffb778'),
          (this.emEventStroke = this.emEventStroke || '#c19a0f'),
          (this.emSwimlaneBackgroundOdd = this.emSwimlaneBackgroundOdd || 'rgb(250,250,250)'),
          (this.emSwimlaneBackgroundStroke = this.emSwimlaneBackgroundStroke || 'rgb(240,240,240)'),
          (this.emArrowhead = this.emArrowhead || this.lineColor),
          (this.emRelationStroke = this.emRelationStroke || this.lineColor),
          (this.attributeBackgroundColorOdd = this.attributeBackgroundColorOdd || $t),
          (this.attributeBackgroundColorEven = this.attributeBackgroundColorEven || Pt));
      }
      calculate(t) {
        if (typeof t != 'object') {
          this.updateColors();
          return;
        }
        const i = Object.keys(t);
        (i.forEach((e) => {
          this[e] = t[e];
        }),
          this.updateColors(),
          i.forEach((e) => {
            this[e] = t[e];
          }));
      }
    }),
    d(Tr, 'Theme'),
    Tr),
  Bc = d((r) => {
    const t = new kc();
    return (t.calculate(r), t);
  }, 'getThemeVariables'),
  Sr,
  Tc =
    ((Sr = class {
      constructor() {
        ((this.background = '#ffffff'),
          (this.primaryColor = '#cccccc'),
          (this.mainBkg = '#ffffff'),
          (this.noteBkgColor = '#fff5ad'),
          (this.noteTextColor = '#333'),
          (this.THEME_COLOR_LIMIT = 12),
          (this.radius = 3),
          (this.strokeWidth = 2),
          (this.primaryBorderColor = G(this.primaryColor, this.darkMode)),
          (this.fontFamily = 'arial, sans-serif'),
          (this.fontSize = '14px'),
          (this.nodeBorder = '#000000'),
          (this.stateBorder = '#000000'),
          (this.useGradient = !0),
          (this.gradientStart = '#0042eb'),
          (this.gradientStop = '#eb0042'),
          (this.dropShadow = 'drop-shadow( 0px 1px 2px rgba(0, 0, 0, 0.25));'),
          (this.tertiaryColor = '#ffffff'),
          (this.archEdgeColor = 'calculated'),
          (this.archEdgeArrowColor = 'calculated'),
          (this.archEdgeWidth = '3'),
          (this.archGroupBorderColor = this.primaryBorderColor),
          (this.archGroupBorderWidth = '2px'),
          (this.noteFontWeight = 'normal'),
          (this.fontWeight = 'normal'));
      }
      updateColors() {
        ((this.primaryTextColor = this.primaryTextColor || (this.darkMode ? '#eee' : '#333')),
          (this.secondaryColor = this.secondaryColor || m(this.primaryColor, { h: -120 })),
          (this.tertiaryColor = this.tertiaryColor || m(this.primaryColor, { h: 180, l: 5 })),
          (this.primaryBorderColor =
            this.primaryBorderColor || G(this.primaryColor, this.darkMode)),
          (this.secondaryBorderColor =
            this.secondaryBorderColor || G(this.secondaryColor, this.darkMode)),
          (this.tertiaryBorderColor =
            this.tertiaryBorderColor || G(this.tertiaryColor, this.darkMode)),
          (this.noteBorderColor = this.noteBorderColor || G(this.noteBkgColor, this.darkMode)),
          (this.noteBkgColor = this.noteBkgColor || '#fff5ad'),
          (this.noteTextColor = this.noteTextColor || '#333'),
          (this.secondaryTextColor = this.secondaryTextColor || B(this.secondaryColor)),
          (this.tertiaryTextColor = this.tertiaryTextColor || B(this.tertiaryColor)),
          (this.lineColor = this.lineColor || B(this.background)),
          (this.arrowheadColor = this.arrowheadColor || B(this.background)),
          (this.textColor = this.textColor || this.primaryTextColor),
          (this.border2 = this.border2 || this.tertiaryBorderColor),
          (this.nodeBkg = this.nodeBkg || this.primaryColor),
          (this.mainBkg = this.mainBkg || this.primaryColor),
          (this.nodeBorder = this.nodeBorder || this.primaryBorderColor),
          (this.clusterBkg = this.clusterBkg || this.tertiaryColor),
          (this.clusterBorder = this.clusterBorder || this.tertiaryBorderColor),
          (this.defaultLinkColor = this.defaultLinkColor || this.lineColor),
          (this.titleColor = this.titleColor || this.tertiaryTextColor),
          (this.edgeLabelBackground =
            this.edgeLabelBackground ||
            (this.darkMode ? v(this.secondaryColor, 30) : this.secondaryColor)),
          (this.nodeTextColor = this.nodeTextColor || this.primaryTextColor),
          (this.actorBorder = this.actorBorder || this.primaryBorderColor),
          (this.actorBkg = this.actorBkg || this.mainBkg),
          (this.actorTextColor = this.actorTextColor || this.primaryTextColor),
          (this.actorLineColor = this.actorLineColor || this.actorBorder),
          (this.labelBoxBkgColor = this.labelBoxBkgColor || this.actorBkg),
          (this.signalColor = this.signalColor || this.textColor),
          (this.signalTextColor = this.signalTextColor || this.textColor),
          (this.labelBoxBorderColor = this.labelBoxBorderColor || this.actorBorder),
          (this.labelTextColor = this.labelTextColor || this.actorTextColor),
          (this.loopTextColor = this.loopTextColor || this.actorTextColor),
          (this.activationBorderColor = this.activationBorderColor || v(this.secondaryColor, 10)),
          (this.activationBkgColor = this.activationBkgColor || this.secondaryColor),
          (this.sequenceNumberColor = this.sequenceNumberColor || B(this.lineColor)));
        const t = '#ECECFE',
          i = '#E9E9F1',
          e = m(t, { h: 180, l: 5 });
        if (
          ((this.sectionBkgColor = this.sectionBkgColor || e),
          (this.altSectionBkgColor = this.altSectionBkgColor || 'white'),
          (this.sectionBkgColor = this.sectionBkgColor || i),
          (this.sectionBkgColor2 = this.sectionBkgColor2 || t),
          (this.excludeBkgColor = this.excludeBkgColor || '#eeeeee'),
          (this.taskBorderColor = this.taskBorderColor || this.primaryBorderColor),
          (this.taskBkgColor = this.taskBkgColor || t),
          (this.activeTaskBorderColor = this.activeTaskBorderColor || t),
          (this.activeTaskBkgColor = this.activeTaskBkgColor || w(t, 23)),
          (this.gridColor = this.gridColor || 'lightgrey'),
          (this.doneTaskBkgColor = this.doneTaskBkgColor || 'lightgrey'),
          (this.doneTaskBorderColor = this.doneTaskBorderColor || 'grey'),
          (this.critBorderColor = this.critBorderColor || '#ff8888'),
          (this.critBkgColor = this.critBkgColor || 'red'),
          (this.todayLineColor = this.todayLineColor || 'red'),
          (this.taskTextColor = this.taskTextColor || this.textColor),
          (this.taskTextOutsideColor = this.taskTextOutsideColor || this.textColor),
          (this.vertLineColor = this.vertLineColor || this.primaryBorderColor),
          (this.taskTextLightColor = this.taskTextLightColor || this.textColor),
          (this.taskTextColor = this.taskTextColor || this.primaryTextColor),
          (this.taskTextDarkColor = this.taskTextDarkColor || this.textColor),
          (this.taskTextClickableColor = this.taskTextClickableColor || '#003163'),
          (this.archEdgeColor = this.lineColor),
          (this.archEdgeArrowColor = this.lineColor),
          (this.personBorder = this.personBorder || this.primaryBorderColor),
          (this.personBkg = this.personBkg || this.mainBkg),
          (this.transitionColor = this.transitionColor || this.lineColor),
          (this.transitionLabelColor = this.transitionLabelColor || this.textColor),
          (this.stateLabelColor = this.stateLabelColor || this.stateBkg || this.primaryTextColor),
          (this.stateBkg = this.stateBkg || this.mainBkg),
          (this.labelBackgroundColor = this.labelBackgroundColor || this.stateBkg),
          (this.compositeBackground =
            this.compositeBackground || this.background || this.tertiaryColor),
          (this.altBackground = this.altBackground || '#f0f0f0'),
          (this.compositeTitleBackground = this.compositeTitleBackground || this.mainBkg),
          (this.compositeBorder = this.compositeBorder || this.nodeBorder),
          (this.innerEndBackground = this.nodeBorder),
          (this.errorBkgColor = this.errorBkgColor || this.tertiaryColor),
          (this.errorTextColor = this.errorTextColor || this.tertiaryTextColor),
          (this.transitionColor = this.transitionColor || this.lineColor),
          (this.specialStateColor = this.lineColor),
          (this.cScale0 = this.cScale0 || t),
          (this.cScale1 = this.cScale1 || i),
          (this.cScale2 = this.cScale2 || e),
          (this.cScale3 = this.cScale3 || m(t, { h: 30 })),
          (this.cScale4 = this.cScale4 || m(t, { h: 60 })),
          (this.cScale5 = this.cScale5 || m(t, { h: 90 })),
          (this.cScale6 = this.cScale6 || m(t, { h: 120 })),
          (this.cScale7 = this.cScale7 || m(t, { h: 150 })),
          (this.cScale8 = this.cScale8 || m(t, { h: 210, l: 150 })),
          (this.cScale9 = this.cScale9 || m(t, { h: 270 })),
          (this.cScale10 = this.cScale10 || m(t, { h: 300 })),
          (this.cScale11 = this.cScale11 || m(t, { h: 330 })),
          this.darkMode)
        )
          for (let a = 0; a < this.THEME_COLOR_LIMIT; a++)
            this['cScale' + a] = v(this['cScale' + a], 75);
        else
          for (let a = 0; a < this.THEME_COLOR_LIMIT; a++)
            this['cScale' + a] = v(this['cScale' + a], 25);
        for (let a = 0; a < this.THEME_COLOR_LIMIT; a++)
          this['cScaleInv' + a] = this['cScaleInv' + a] || B(this['cScale' + a]);
        for (let a = 0; a < this.THEME_COLOR_LIMIT; a++)
          this.darkMode
            ? (this['cScalePeer' + a] = this['cScalePeer' + a] || w(this['cScale' + a], 10))
            : (this['cScalePeer' + a] = this['cScalePeer' + a] || v(this['cScale' + a], 10));
        this.scaleLabelColor = this.scaleLabelColor || this.labelTextColor;
        for (let a = 0; a < this.THEME_COLOR_LIMIT; a++)
          this['cScaleLabel' + a] = this['cScaleLabel' + a] || this.scaleLabelColor;
        const o = this.darkMode ? -4 : -1;
        for (let a = 0; a < 5; a++)
          ((this['surface' + a] =
            this['surface' + a] || m(this.mainBkg, { h: 180, s: -15, l: o * (5 + a * 3) })),
            (this['surfacePeer' + a] =
              this['surfacePeer' + a] || m(this.mainBkg, { h: 180, s: -15, l: o * (8 + a * 3) })));
        ((this.classText = this.classText || this.textColor),
          (this.fillType0 = this.fillType0 || t),
          (this.fillType1 = this.fillType1 || i),
          (this.fillType2 = this.fillType2 || m(t, { h: 64 })),
          (this.fillType3 = this.fillType3 || m(i, { h: 64 })),
          (this.fillType4 = this.fillType4 || m(t, { h: -64 })),
          (this.fillType5 = this.fillType5 || m(i, { h: -64 })),
          (this.fillType6 = this.fillType6 || m(t, { h: 128 })),
          (this.fillType7 = this.fillType7 || m(i, { h: 128 })),
          (this.pie1 = this.pie1 || t),
          (this.pie2 = this.pie2 || i),
          (this.pie3 = this.pie3 || e),
          (this.pie4 = this.pie4 || m(t, { l: -10 })),
          (this.pie5 = this.pie5 || m(i, { l: -10 })),
          (this.pie6 = this.pie6 || m(e, { l: -10 })),
          (this.pie7 = this.pie7 || m(t, { h: 60, l: -10 })),
          (this.pie8 = this.pie8 || m(t, { h: -60, l: -10 })),
          (this.pie9 = this.pie9 || m(t, { h: 120, l: 0 })),
          (this.pie10 = this.pie10 || m(t, { h: 60, l: -20 })),
          (this.pie11 = this.pie11 || m(t, { h: -60, l: -20 })),
          (this.pie12 = this.pie12 || m(t, { h: 120, l: -10 })),
          (this.pieTitleTextSize = this.pieTitleTextSize || '25px'),
          (this.pieTitleTextColor = this.pieTitleTextColor || this.taskTextDarkColor),
          (this.pieSectionTextSize = this.pieSectionTextSize || '17px'),
          (this.pieSectionTextColor = this.pieSectionTextColor || this.textColor),
          (this.pieLegendTextSize = this.pieLegendTextSize || '17px'),
          (this.pieLegendTextColor = this.pieLegendTextColor || this.taskTextDarkColor),
          (this.pieStrokeColor = this.pieStrokeColor || 'black'),
          (this.pieStrokeWidth = this.pieStrokeWidth || '2px'),
          (this.pieOuterStrokeWidth = this.pieOuterStrokeWidth || '2px'),
          (this.pieOuterStrokeColor = this.pieOuterStrokeColor || 'black'),
          (this.pieOpacity = this.pieOpacity || '0.7'),
          (this.vennTitleTextColor = this.vennTitleTextColor ?? this.titleColor),
          (this.vennSetTextColor = this.vennSetTextColor ?? this.textColor),
          (this.quadrant1Fill = this.quadrant1Fill || t),
          (this.quadrant2Fill = this.quadrant2Fill || m(t, { r: 5, g: 5, b: 5 })),
          (this.quadrant3Fill = this.quadrant3Fill || m(t, { r: 10, g: 10, b: 10 })),
          (this.quadrant4Fill = this.quadrant4Fill || m(t, { r: 15, g: 15, b: 15 })),
          (this.quadrant1TextFill = this.quadrant1TextFill || this.primaryTextColor),
          (this.quadrant2TextFill =
            this.quadrant2TextFill || m(this.primaryTextColor, { r: -5, g: -5, b: -5 })),
          (this.quadrant3TextFill =
            this.quadrant3TextFill || m(this.primaryTextColor, { r: -10, g: -10, b: -10 })),
          (this.quadrant4TextFill =
            this.quadrant4TextFill || m(this.primaryTextColor, { r: -15, g: -15, b: -15 })),
          (this.quadrantPointFill =
            this.quadrantPointFill || Et(this.quadrant1Fill)
              ? w(this.quadrant1Fill)
              : v(this.quadrant1Fill)),
          (this.quadrantPointTextFill = this.quadrantPointTextFill || this.primaryTextColor),
          (this.quadrantXAxisTextFill = this.quadrantXAxisTextFill || this.primaryTextColor),
          (this.quadrantYAxisTextFill = this.quadrantYAxisTextFill || this.primaryTextColor),
          (this.quadrantInternalBorderStrokeFill =
            this.quadrantInternalBorderStrokeFill || this.primaryBorderColor),
          (this.quadrantExternalBorderStrokeFill =
            this.quadrantExternalBorderStrokeFill || this.primaryBorderColor),
          (this.quadrantTitleFill = this.quadrantTitleFill || this.primaryTextColor),
          (this.xyChart = {
            backgroundColor: this.xyChart?.backgroundColor || this.background,
            titleColor: this.xyChart?.titleColor || this.primaryTextColor,
            xAxisTitleColor: this.xyChart?.xAxisTitleColor || this.primaryTextColor,
            xAxisLabelColor: this.xyChart?.xAxisLabelColor || this.primaryTextColor,
            xAxisTickColor: this.xyChart?.xAxisTickColor || this.primaryTextColor,
            xAxisLineColor: this.xyChart?.xAxisLineColor || this.primaryTextColor,
            yAxisTitleColor: this.xyChart?.yAxisTitleColor || this.primaryTextColor,
            yAxisLabelColor: this.xyChart?.yAxisLabelColor || this.primaryTextColor,
            yAxisTickColor: this.xyChart?.yAxisTickColor || this.primaryTextColor,
            yAxisLineColor: this.xyChart?.yAxisLineColor || this.primaryTextColor,
            plotColorPalette:
              this.xyChart?.plotColorPalette ||
              '#FFF4DD,#FFD8B1,#FFA07A,#ECEFF1,#D6DBDF,#C3E0A8,#FFB6A4,#FFD74D,#738FA7,#FFFFF0',
          }),
          (this.requirementBackground = this.requirementBackground || t),
          (this.requirementBorderColor = this.requirementBorderColor || this.primaryBorderColor),
          (this.requirementBorderSize = this.requirementBorderSize || '1'),
          (this.requirementTextColor = this.requirementTextColor || this.primaryTextColor),
          (this.relationColor = this.relationColor || this.lineColor),
          (this.relationLabelBackground =
            this.relationLabelBackground ||
            (this.darkMode ? v(this.secondaryColor, 30) : this.secondaryColor)),
          (this.relationLabelColor = this.relationLabelColor || this.actorTextColor),
          (this.git0 = this.git0 || t),
          (this.git1 = this.git1 || i),
          (this.git2 = this.git2 || e),
          (this.git3 = this.git3 || m(t, { h: -30 })),
          (this.git4 = this.git4 || m(t, { h: -60 })),
          (this.git5 = this.git5 || m(t, { h: -90 })),
          (this.git6 = this.git6 || m(t, { h: 60 })),
          (this.git7 = this.git7 || m(t, { h: 120 })),
          this.darkMode
            ? ((this.git0 = w(this.git0, 25)),
              (this.git1 = w(this.git1, 25)),
              (this.git2 = w(this.git2, 25)),
              (this.git3 = w(this.git3, 25)),
              (this.git4 = w(this.git4, 25)),
              (this.git5 = w(this.git5, 25)),
              (this.git6 = w(this.git6, 25)),
              (this.git7 = w(this.git7, 25)))
            : ((this.git0 = v(this.git0, 25)),
              (this.git1 = v(this.git1, 25)),
              (this.git2 = v(this.git2, 25)),
              (this.git3 = v(this.git3, 25)),
              (this.git4 = v(this.git4, 25)),
              (this.git5 = v(this.git5, 25)),
              (this.git6 = v(this.git6, 25)),
              (this.git7 = v(this.git7, 25))),
          (this.gitInv0 = this.gitInv0 || B(this.git0)),
          (this.gitInv1 = this.gitInv1 || B(this.git1)),
          (this.gitInv2 = this.gitInv2 || B(this.git2)),
          (this.gitInv3 = this.gitInv3 || B(this.git3)),
          (this.gitInv4 = this.gitInv4 || B(this.git4)),
          (this.gitInv5 = this.gitInv5 || B(this.git5)),
          (this.gitInv6 = this.gitInv6 || B(this.git6)),
          (this.gitInv7 = this.gitInv7 || B(this.git7)),
          (this.branchLabelColor =
            this.branchLabelColor || (this.darkMode ? 'black' : this.labelTextColor)),
          (this.gitBranchLabel0 = this.gitBranchLabel0 || this.branchLabelColor),
          (this.gitBranchLabel1 = this.gitBranchLabel1 || this.branchLabelColor),
          (this.gitBranchLabel2 = this.gitBranchLabel2 || this.branchLabelColor),
          (this.gitBranchLabel3 = this.gitBranchLabel3 || this.branchLabelColor),
          (this.gitBranchLabel4 = this.gitBranchLabel4 || this.branchLabelColor),
          (this.gitBranchLabel5 = this.gitBranchLabel5 || this.branchLabelColor),
          (this.gitBranchLabel6 = this.gitBranchLabel6 || this.branchLabelColor),
          (this.gitBranchLabel7 = this.gitBranchLabel7 || this.branchLabelColor),
          (this.tagLabelColor = this.tagLabelColor || this.primaryTextColor),
          (this.tagLabelBackground = this.tagLabelBackground || this.primaryColor),
          (this.tagLabelBorder = this.tagBorder || this.primaryBorderColor),
          (this.tagLabelFontSize = this.tagLabelFontSize || '10px'),
          (this.commitLabelColor = this.commitLabelColor || this.secondaryTextColor),
          (this.commitLabelBackground = this.commitLabelBackground || this.secondaryColor),
          (this.commitLabelFontSize = this.commitLabelFontSize || '10px'),
          (this.attributeBackgroundColorOdd = this.attributeBackgroundColorOdd || $t),
          (this.attributeBackgroundColorEven = this.attributeBackgroundColorEven || Pt));
      }
      calculate(t) {
        if (typeof t != 'object') {
          this.updateColors();
          return;
        }
        const i = Object.keys(t);
        (i.forEach((e) => {
          this[e] = t[e];
        }),
          this.updateColors(),
          i.forEach((e) => {
            this[e] = t[e];
          }));
      }
    }),
    d(Sr, 'Theme'),
    Sr),
  Sc = d((r) => {
    const t = new Tc();
    return (t.calculate(r), t);
  }, 'getThemeVariables'),
  wr,
  wc =
    ((wr = class {
      constructor() {
        ((this.background = '#333'),
          (this.primaryColor = '#1f2020'),
          (this.secondaryColor = w(this.primaryColor, 16)),
          (this.tertiaryColor = m(this.primaryColor, { h: -160 })),
          (this.primaryBorderColor = B(this.background)),
          (this.secondaryBorderColor = G(this.secondaryColor, this.darkMode)),
          (this.tertiaryBorderColor = G(this.tertiaryColor, this.darkMode)),
          (this.primaryTextColor = B(this.primaryColor)),
          (this.secondaryTextColor = B(this.secondaryColor)),
          (this.tertiaryTextColor = B(this.tertiaryColor)),
          (this.mainBkg = '#2a2020'),
          (this.secondBkg = 'calculated'),
          (this.mainContrastColor = 'lightgrey'),
          (this.darkTextColor = w(B('#323D47'), 10)),
          (this.border1 = '#ccc'),
          (this.border2 = ar(255, 255, 255, 0.25)),
          (this.arrowheadColor = B(this.background)),
          (this.fontFamily = 'arial, sans-serif'),
          (this.fontSize = '14px'),
          (this.labelBackground = '#181818'),
          (this.textColor = '#ccc'),
          (this.THEME_COLOR_LIMIT = 12),
          (this.radius = 3),
          (this.strokeWidth = 1),
          (this.noteBkgColor = '#fff5ad'),
          (this.noteTextColor = '#333'),
          (this.THEME_COLOR_LIMIT = 12),
          (this.fontFamily = 'arial, sans-serif'),
          (this.fontSize = '14px'),
          (this.useGradient = !0),
          (this.gradientStart = '#0042eb'),
          (this.gradientStop = '#eb0042'),
          (this.dropShadow = 'drop-shadow( 1px 2px 2px rgba(185,185,185,0.2))'),
          (this.archEdgeColor = 'calculated'),
          (this.archEdgeArrowColor = 'calculated'),
          (this.archEdgeWidth = '3'),
          (this.archGroupBorderColor = this.primaryBorderColor),
          (this.archGroupBorderWidth = '2px'),
          (this.noteFontWeight = 'normal'),
          (this.fontWeight = 'normal'));
      }
      updateColors() {
        if (
          ((this.primaryTextColor = this.primaryTextColor || (this.darkMode ? '#eee' : '#333')),
          (this.secondaryColor = this.secondaryColor || m(this.primaryColor, { h: -120 })),
          (this.tertiaryColor = this.tertiaryColor || m(this.primaryColor, { h: 180, l: 5 })),
          (this.primaryBorderColor =
            this.primaryBorderColor || G(this.primaryColor, this.darkMode)),
          (this.secondaryBorderColor =
            this.secondaryBorderColor || G(this.secondaryColor, this.darkMode)),
          (this.tertiaryBorderColor =
            this.tertiaryBorderColor || G(this.tertiaryColor, this.darkMode)),
          (this.noteBorderColor = this.noteBorderColor || G(this.noteBkgColor, this.darkMode)),
          (this.noteBkgColor = this.noteBkgColor || '#fff5ad'),
          (this.noteTextColor = this.noteTextColor || '#333'),
          (this.secondaryTextColor = this.secondaryTextColor || B(this.secondaryColor)),
          (this.tertiaryTextColor = this.tertiaryTextColor || B(this.tertiaryColor)),
          (this.lineColor = this.lineColor || B(this.background)),
          (this.arrowheadColor = this.arrowheadColor || B(this.background)),
          (this.textColor = this.textColor || this.primaryTextColor),
          (this.border2 = this.border2 || this.tertiaryBorderColor),
          (this.nodeBkg = this.nodeBkg || this.primaryColor),
          (this.mainBkg = this.mainBkg || this.primaryColor),
          (this.nodeBorder = this.nodeBorder || this.border1),
          (this.clusterBkg = this.clusterBkg || this.tertiaryColor),
          (this.clusterBorder = this.clusterBorder || this.tertiaryBorderColor),
          (this.defaultLinkColor = this.defaultLinkColor || this.lineColor),
          (this.titleColor = this.titleColor || this.tertiaryTextColor),
          (this.edgeLabelBackground =
            this.edgeLabelBackground ||
            (this.darkMode ? v(this.secondaryColor, 30) : this.secondaryColor)),
          (this.nodeTextColor = this.nodeTextColor || this.primaryTextColor),
          (this.actorBorder = this.actorBorder || this.primaryBorderColor),
          (this.actorBkg = this.actorBkg || this.mainBkg),
          (this.actorTextColor = this.actorTextColor || this.primaryTextColor),
          (this.actorLineColor = this.actorLineColor || this.actorBorder),
          (this.labelBoxBkgColor = this.labelBoxBkgColor || this.actorBkg),
          (this.signalColor = this.signalColor || this.textColor),
          (this.signalTextColor = this.signalTextColor || this.textColor),
          (this.labelBoxBorderColor = this.labelBoxBorderColor || this.actorBorder),
          (this.labelTextColor = this.labelTextColor || this.actorTextColor),
          (this.loopTextColor = this.loopTextColor || this.actorTextColor),
          (this.activationBorderColor = this.activationBorderColor || v(this.secondaryColor, 10)),
          (this.activationBkgColor = this.activationBkgColor || this.secondaryColor),
          (this.sequenceNumberColor = this.sequenceNumberColor || B(this.lineColor)),
          (this.sectionBkgColor = this.sectionBkgColor || this.tertiaryColor),
          (this.altSectionBkgColor = this.altSectionBkgColor || 'white'),
          (this.sectionBkgColor = this.sectionBkgColor || this.secondaryColor),
          (this.sectionBkgColor2 = this.sectionBkgColor2 || this.primaryColor),
          (this.excludeBkgColor = this.excludeBkgColor || '#eeeeee'),
          (this.taskBorderColor = this.taskBorderColor || this.primaryBorderColor),
          (this.taskBkgColor = this.taskBkgColor || this.primaryColor),
          (this.activeTaskBorderColor = this.activeTaskBorderColor || this.primaryColor),
          (this.activeTaskBkgColor = this.activeTaskBkgColor || w(this.primaryColor, 23)),
          (this.gridColor = this.gridColor || 'lightgrey'),
          (this.doneTaskBkgColor = this.doneTaskBkgColor || 'lightgrey'),
          (this.doneTaskBorderColor = this.doneTaskBorderColor || 'grey'),
          (this.critBorderColor = this.critBorderColor || '#ff8888'),
          (this.critBkgColor = this.critBkgColor || 'red'),
          (this.todayLineColor = this.todayLineColor || 'red'),
          (this.vertLineColor = this.vertLineColor || this.primaryBorderColor),
          (this.taskTextColor = this.taskTextColor || this.textColor),
          (this.taskTextOutsideColor = this.taskTextOutsideColor || this.textColor),
          (this.taskTextLightColor = this.taskTextLightColor || this.textColor),
          (this.taskTextColor = this.taskTextColor || this.primaryTextColor),
          (this.taskTextDarkColor = this.taskTextDarkColor || this.textColor),
          (this.taskTextClickableColor = this.taskTextClickableColor || '#003163'),
          (this.archEdgeColor = this.lineColor),
          (this.archEdgeArrowColor = this.lineColor),
          (this.personBorder = this.personBorder || this.primaryBorderColor),
          (this.personBkg = this.personBkg || this.mainBkg),
          (this.transitionColor = this.transitionColor || this.lineColor),
          (this.transitionLabelColor = this.transitionLabelColor || this.textColor),
          (this.stateLabelColor = this.stateLabelColor || this.stateBkg || this.primaryTextColor),
          (this.stateBkg = this.stateBkg || this.mainBkg),
          (this.labelBackgroundColor = this.labelBackgroundColor || this.stateBkg),
          (this.compositeBackground =
            this.compositeBackground || this.background || this.tertiaryColor),
          (this.altBackground = this.altBackground || '#f0f0f0'),
          (this.compositeTitleBackground = this.compositeTitleBackground || this.mainBkg),
          (this.compositeBorder = this.compositeBorder || this.nodeBorder),
          (this.innerEndBackground = this.nodeBorder),
          (this.errorBkgColor = this.errorBkgColor || this.tertiaryColor),
          (this.errorTextColor = this.errorTextColor || this.tertiaryTextColor),
          (this.transitionColor = this.transitionColor || this.lineColor),
          (this.specialStateColor = this.lineColor),
          (this.cScale0 = this.cScale0 || this.primaryColor),
          (this.cScale1 = this.cScale1 || this.secondaryColor),
          (this.cScale2 = this.cScale2 || this.tertiaryColor),
          (this.cScale3 = this.cScale3 || m(this.primaryColor, { h: 30 })),
          (this.cScale4 = this.cScale4 || m(this.primaryColor, { h: 60 })),
          (this.cScale5 = this.cScale5 || m(this.primaryColor, { h: 90 })),
          (this.cScale6 = this.cScale6 || m(this.primaryColor, { h: 120 })),
          (this.cScale7 = this.cScale7 || m(this.primaryColor, { h: 150 })),
          (this.cScale8 = this.cScale8 || m(this.primaryColor, { h: 210, l: 150 })),
          (this.cScale9 = this.cScale9 || m(this.primaryColor, { h: 270 })),
          (this.cScale10 = this.cScale10 || m(this.primaryColor, { h: 300 })),
          (this.cScale11 = this.cScale11 || m(this.primaryColor, { h: 330 })),
          this.darkMode)
        )
          for (let i = 0; i < this.THEME_COLOR_LIMIT; i++)
            this['cScale' + i] = v(this['cScale' + i], 75);
        else
          for (let i = 0; i < this.THEME_COLOR_LIMIT; i++)
            this['cScale' + i] = v(this['cScale' + i], 25);
        for (let i = 0; i < this.THEME_COLOR_LIMIT; i++)
          this['cScaleInv' + i] = this['cScaleInv' + i] || B(this['cScale' + i]);
        for (let i = 0; i < this.THEME_COLOR_LIMIT; i++)
          this.darkMode
            ? (this['cScalePeer' + i] = this['cScalePeer' + i] || w(this['cScale' + i], 10))
            : (this['cScalePeer' + i] = this['cScalePeer' + i] || v(this['cScale' + i], 10));
        this.scaleLabelColor = this.scaleLabelColor || this.labelTextColor;
        for (let i = 0; i < this.THEME_COLOR_LIMIT; i++)
          this['cScaleLabel' + i] = this['cScaleLabel' + i] || this.scaleLabelColor;
        const t = this.darkMode ? -4 : -1;
        for (let i = 0; i < 5; i++)
          ((this['surface' + i] =
            this['surface' + i] || m(this.mainBkg, { h: 180, s: -15, l: t * (5 + i * 3) })),
            (this['surfacePeer' + i] =
              this['surfacePeer' + i] || m(this.mainBkg, { h: 180, s: -15, l: t * (8 + i * 3) })));
        ((this.classText = this.classText || this.textColor),
          (this.fillType0 = this.fillType0 || this.primaryColor),
          (this.fillType1 = this.fillType1 || this.secondaryColor),
          (this.fillType2 = this.fillType2 || m(this.primaryColor, { h: 64 })),
          (this.fillType3 = this.fillType3 || m(this.secondaryColor, { h: 64 })),
          (this.fillType4 = this.fillType4 || m(this.primaryColor, { h: -64 })),
          (this.fillType5 = this.fillType5 || m(this.secondaryColor, { h: -64 })),
          (this.fillType6 = this.fillType6 || m(this.primaryColor, { h: 128 })),
          (this.fillType7 = this.fillType7 || m(this.secondaryColor, { h: 128 })),
          (this.pie1 = this.pie1 || this.primaryColor),
          (this.pie2 = this.pie2 || this.secondaryColor),
          (this.pie3 = this.pie3 || this.tertiaryColor),
          (this.pie4 = this.pie4 || m(this.primaryColor, { l: -10 })),
          (this.pie5 = this.pie5 || m(this.secondaryColor, { l: -10 })),
          (this.pie6 = this.pie6 || m(this.tertiaryColor, { l: -10 })),
          (this.pie7 = this.pie7 || m(this.primaryColor, { h: 60, l: -10 })),
          (this.pie8 = this.pie8 || m(this.primaryColor, { h: -60, l: -10 })),
          (this.pie9 = this.pie9 || m(this.primaryColor, { h: 120, l: 0 })),
          (this.pie10 = this.pie10 || m(this.primaryColor, { h: 60, l: -20 })),
          (this.pie11 = this.pie11 || m(this.primaryColor, { h: -60, l: -20 })),
          (this.pie12 = this.pie12 || m(this.primaryColor, { h: 120, l: -10 })),
          (this.pieTitleTextSize = this.pieTitleTextSize || '25px'),
          (this.pieTitleTextColor = this.pieTitleTextColor || this.taskTextDarkColor),
          (this.pieSectionTextSize = this.pieSectionTextSize || '17px'),
          (this.pieSectionTextColor = this.pieSectionTextColor || this.textColor),
          (this.pieLegendTextSize = this.pieLegendTextSize || '17px'),
          (this.pieLegendTextColor = this.pieLegendTextColor || this.taskTextDarkColor),
          (this.pieStrokeColor = this.pieStrokeColor || 'black'),
          (this.pieStrokeWidth = this.pieStrokeWidth || '2px'),
          (this.pieOuterStrokeWidth = this.pieOuterStrokeWidth || '2px'),
          (this.pieOuterStrokeColor = this.pieOuterStrokeColor || 'black'),
          (this.pieOpacity = this.pieOpacity || '0.7'),
          (this.vennTitleTextColor = this.vennTitleTextColor ?? this.titleColor),
          (this.vennSetTextColor = this.vennSetTextColor ?? this.textColor),
          (this.quadrant1Fill = this.quadrant1Fill || this.primaryColor),
          (this.quadrant2Fill = this.quadrant2Fill || m(this.primaryColor, { r: 5, g: 5, b: 5 })),
          (this.quadrant3Fill =
            this.quadrant3Fill || m(this.primaryColor, { r: 10, g: 10, b: 10 })),
          (this.quadrant4Fill =
            this.quadrant4Fill || m(this.primaryColor, { r: 15, g: 15, b: 15 })),
          (this.quadrant1TextFill = this.quadrant1TextFill || this.primaryTextColor),
          (this.quadrant2TextFill =
            this.quadrant2TextFill || m(this.primaryTextColor, { r: -5, g: -5, b: -5 })),
          (this.quadrant3TextFill =
            this.quadrant3TextFill || m(this.primaryTextColor, { r: -10, g: -10, b: -10 })),
          (this.quadrant4TextFill =
            this.quadrant4TextFill || m(this.primaryTextColor, { r: -15, g: -15, b: -15 })),
          (this.quadrantPointFill =
            this.quadrantPointFill || Et(this.quadrant1Fill)
              ? w(this.quadrant1Fill)
              : v(this.quadrant1Fill)),
          (this.quadrantPointTextFill = this.quadrantPointTextFill || this.primaryTextColor),
          (this.quadrantXAxisTextFill = this.quadrantXAxisTextFill || this.primaryTextColor),
          (this.quadrantYAxisTextFill = this.quadrantYAxisTextFill || this.primaryTextColor),
          (this.quadrantInternalBorderStrokeFill =
            this.quadrantInternalBorderStrokeFill || this.primaryBorderColor),
          (this.quadrantExternalBorderStrokeFill =
            this.quadrantExternalBorderStrokeFill || this.primaryBorderColor),
          (this.quadrantTitleFill = this.quadrantTitleFill || this.primaryTextColor),
          (this.xyChart = {
            backgroundColor: this.xyChart?.backgroundColor || this.background,
            titleColor: this.xyChart?.titleColor || this.primaryTextColor,
            xAxisTitleColor: this.xyChart?.xAxisTitleColor || this.primaryTextColor,
            xAxisLabelColor: this.xyChart?.xAxisLabelColor || this.primaryTextColor,
            xAxisTickColor: this.xyChart?.xAxisTickColor || this.primaryTextColor,
            xAxisLineColor: this.xyChart?.xAxisLineColor || this.primaryTextColor,
            yAxisTitleColor: this.xyChart?.yAxisTitleColor || this.primaryTextColor,
            yAxisLabelColor: this.xyChart?.yAxisLabelColor || this.primaryTextColor,
            yAxisTickColor: this.xyChart?.yAxisTickColor || this.primaryTextColor,
            yAxisLineColor: this.xyChart?.yAxisLineColor || this.primaryTextColor,
            plotColorPalette:
              this.xyChart?.plotColorPalette ||
              '#FFF4DD,#FFD8B1,#FFA07A,#ECEFF1,#D6DBDF,#C3E0A8,#FFB6A4,#FFD74D,#738FA7,#FFFFF0',
          }),
          (this.requirementBackground = this.requirementBackground || this.primaryColor),
          (this.requirementBorderColor = this.requirementBorderColor || this.primaryBorderColor),
          (this.requirementBorderSize = this.requirementBorderSize || '1'),
          (this.requirementTextColor = this.requirementTextColor || this.primaryTextColor),
          (this.relationColor = this.relationColor || this.lineColor),
          (this.relationLabelBackground =
            this.relationLabelBackground ||
            (this.darkMode ? v(this.secondaryColor, 30) : this.secondaryColor)),
          (this.relationLabelColor = this.relationLabelColor || this.actorTextColor),
          (this.git0 = this.git0 || '#0b0000'),
          (this.git1 = this.git1 || '#4d1037'),
          (this.git2 = this.git2 || '#3f5258'),
          (this.git3 = this.git3 || '#4f2f1b'),
          (this.git4 = this.git4 || '#6e0a0a'),
          (this.git5 = this.git5 || '#3b0048'),
          (this.git6 = this.git6 || '#995a01'),
          (this.git7 = this.git7 || '#154706'),
          (this.gitDarkMode = !0),
          this.gitDarkMode
            ? ((this.git0 = w(this.git0, 25)),
              (this.git1 = w(this.git1, 25)),
              (this.git2 = w(this.git2, 25)),
              (this.git3 = w(this.git3, 25)),
              (this.git4 = w(this.git4, 25)),
              (this.git5 = w(this.git5, 25)),
              (this.git6 = w(this.git6, 25)),
              (this.git7 = w(this.git7, 25)))
            : ((this.git0 = v(this.git0, 25)),
              (this.git1 = v(this.git1, 25)),
              (this.git2 = v(this.git2, 25)),
              (this.git3 = v(this.git3, 25)),
              (this.git4 = v(this.git4, 25)),
              (this.git5 = v(this.git5, 25)),
              (this.git6 = v(this.git6, 25)),
              (this.git7 = v(this.git7, 25))),
          (this.gitInv0 = this.gitInv0 || B(this.git0)),
          (this.gitInv1 = this.gitInv1 || B(this.git1)),
          (this.gitInv2 = this.gitInv2 || B(this.git2)),
          (this.gitInv3 = this.gitInv3 || B(this.git3)),
          (this.gitInv4 = this.gitInv4 || B(this.git4)),
          (this.gitInv5 = this.gitInv5 || B(this.git5)),
          (this.gitInv6 = this.gitInv6 || B(this.git6)),
          (this.gitInv7 = this.gitInv7 || B(this.git7)),
          (this.branchLabelColor =
            this.branchLabelColor || (this.darkMode ? 'black' : this.labelTextColor)),
          (this.gitBranchLabel0 = this.gitBranchLabel0 || this.branchLabelColor),
          (this.gitBranchLabel1 = this.gitBranchLabel1 || this.branchLabelColor),
          (this.gitBranchLabel2 = this.gitBranchLabel2 || this.branchLabelColor),
          (this.gitBranchLabel3 = this.gitBranchLabel3 || this.branchLabelColor),
          (this.gitBranchLabel4 = this.gitBranchLabel4 || this.branchLabelColor),
          (this.gitBranchLabel5 = this.gitBranchLabel5 || this.branchLabelColor),
          (this.gitBranchLabel6 = this.gitBranchLabel6 || this.branchLabelColor),
          (this.gitBranchLabel7 = this.gitBranchLabel7 || this.branchLabelColor),
          (this.tagLabelColor = this.tagLabelColor || this.primaryTextColor),
          (this.tagLabelBackground = this.tagLabelBackground || this.primaryColor),
          (this.tagLabelBorder = this.tagBorder || this.primaryBorderColor),
          (this.tagLabelFontSize = this.tagLabelFontSize || '10px'),
          (this.commitLabelColor = this.commitLabelColor || this.secondaryTextColor),
          (this.commitLabelBackground = this.commitLabelBackground || this.secondaryColor),
          (this.commitLabelFontSize = this.commitLabelFontSize || '10px'),
          (this.attributeBackgroundColorOdd = this.attributeBackgroundColorOdd || $t),
          (this.attributeBackgroundColorEven = this.attributeBackgroundColorEven || Pt));
      }
      calculate(t) {
        if (typeof t != 'object') {
          this.updateColors();
          return;
        }
        const i = Object.keys(t);
        (i.forEach((e) => {
          this[e] = t[e];
        }),
          this.updateColors(),
          i.forEach((e) => {
            this[e] = t[e];
          }));
      }
    }),
    d(wr, 'Theme'),
    wr),
  vc = d((r) => {
    const t = new wc();
    return (t.calculate(r), t);
  }, 'getThemeVariables'),
  vr,
  Lc =
    ((vr = class {
      constructor() {
        ((this.background = '#ffffff'),
          (this.primaryColor = '#cccccc'),
          (this.mainBkg = '#ffffff'),
          (this.noteBkgColor = '#fff5ad'),
          (this.noteTextColor = '#28253D'),
          (this.THEME_COLOR_LIMIT = 12),
          (this.radius = 12),
          (this.strokeWidth = 2),
          (this.primaryBorderColor = G('#28253D', this.darkMode)),
          (this.fontFamily = '"Recursive Variable", arial, sans-serif'),
          (this.fontSize = '14px'),
          (this.nodeBorder = '#28253D'),
          (this.stateBorder = '#28253D'),
          (this.useGradient = !1),
          (this.gradientStart = '#0042eb'),
          (this.gradientStop = '#eb0042'),
          (this.dropShadow = 'url(#drop-shadow)'),
          (this.nodeShadow = !0),
          (this.tertiaryColor = '#ffffff'),
          (this.clusterBkg = '#F9F9FB'),
          (this.clusterBorder = '#BDBCCC'),
          (this.noteBorderColor = '#FACC15'),
          (this.archEdgeColor = 'calculated'),
          (this.archEdgeArrowColor = 'calculated'),
          (this.archEdgeWidth = '3'),
          (this.archGroupBorderColor = this.primaryBorderColor),
          (this.archGroupBorderWidth = '2px'),
          (this.actorBorder = '#28253D'),
          (this.filterColor = '#000000'));
      }
      updateColors() {
        ((this.primaryTextColor = this.primaryTextColor || (this.darkMode ? '#eee' : '#28253D')),
          (this.secondaryColor = this.secondaryColor || m(this.primaryColor, { h: -120 })),
          (this.tertiaryColor = this.tertiaryColor || m(this.primaryColor, { h: 180, l: 5 })),
          (this.primaryBorderColor =
            this.primaryBorderColor || G(this.primaryColor, this.darkMode)),
          (this.secondaryBorderColor =
            this.secondaryBorderColor || G(this.secondaryColor, this.darkMode)),
          (this.tertiaryBorderColor =
            this.tertiaryBorderColor || G(this.tertiaryColor, this.darkMode)),
          (this.noteBorderColor = this.noteBorderColor || G(this.noteBkgColor, this.darkMode)),
          (this.noteBkgColor = this.noteBkgColor || '#FEF9C3'),
          (this.noteTextColor = this.noteTextColor || '#28253D'),
          (this.secondaryTextColor = this.secondaryTextColor || B(this.secondaryColor)),
          (this.tertiaryTextColor = this.tertiaryTextColor || B(this.tertiaryColor)),
          (this.lineColor = this.lineColor || B(this.background)),
          (this.arrowheadColor = this.arrowheadColor || B(this.background)),
          (this.textColor = this.textColor || this.primaryTextColor),
          (this.border2 = this.border2 || this.tertiaryBorderColor),
          (this.nodeBkg = this.nodeBkg || this.primaryColor),
          (this.mainBkg = this.mainBkg || this.primaryColor),
          (this.nodeBorder = this.nodeBorder || this.primaryBorderColor),
          (this.clusterBkg = this.clusterBkg || this.tertiaryColor),
          (this.clusterBorder = this.clusterBorder || this.tertiaryBorderColor),
          (this.defaultLinkColor = this.defaultLinkColor || this.lineColor),
          (this.titleColor = this.titleColor || this.tertiaryTextColor),
          (this.edgeLabelBackground =
            this.edgeLabelBackground ||
            (this.darkMode ? v(this.secondaryColor, 30) : this.secondaryColor)),
          (this.nodeTextColor = this.nodeTextColor || this.primaryTextColor),
          (this.noteFontWeight = 600),
          (this.actorBorder = this.actorBorder || this.primaryBorderColor),
          (this.actorBkg = this.actorBkg || this.mainBkg),
          (this.actorTextColor = this.actorTextColor || this.primaryTextColor),
          (this.actorLineColor = this.actorLineColor || this.actorBorder),
          (this.labelBoxBkgColor = this.labelBoxBkgColor || this.actorBkg),
          (this.signalColor = this.signalColor || this.textColor),
          (this.signalTextColor = this.signalTextColor || this.textColor),
          (this.labelBoxBorderColor = this.labelBoxBorderColor || this.actorBorder),
          (this.labelTextColor = this.labelTextColor || this.actorTextColor),
          (this.loopTextColor = this.loopTextColor || this.actorTextColor),
          (this.activationBorderColor = this.activationBorderColor || v(this.secondaryColor, 10)),
          (this.activationBkgColor = this.activationBkgColor || this.secondaryColor),
          (this.sequenceNumberColor = this.sequenceNumberColor || B(this.lineColor)));
        const t = '#ECECFE',
          i = '#E9E9F1',
          e = m(t, { h: 180, l: 5 });
        ((this.sectionBkgColor = this.sectionBkgColor || e),
          (this.altSectionBkgColor = this.altSectionBkgColor || 'white'),
          (this.sectionBkgColor = this.sectionBkgColor || i),
          (this.sectionBkgColor2 = this.sectionBkgColor2 || t),
          (this.excludeBkgColor = this.excludeBkgColor || '#eeeeee'),
          (this.taskBorderColor = this.taskBorderColor || this.primaryBorderColor),
          (this.taskBkgColor = this.taskBkgColor || t),
          (this.activeTaskBorderColor = this.activeTaskBorderColor || t),
          (this.activeTaskBkgColor = this.activeTaskBkgColor || w(t, 23)),
          (this.gridColor = this.gridColor || 'lightgrey'),
          (this.doneTaskBkgColor = this.doneTaskBkgColor || 'lightgrey'),
          (this.doneTaskBorderColor = this.doneTaskBorderColor || 'grey'),
          (this.critBorderColor = this.critBorderColor || '#ff8888'),
          (this.critBkgColor = this.critBkgColor || 'red'),
          (this.todayLineColor = this.todayLineColor || 'red'),
          (this.taskTextColor = this.taskTextColor || this.textColor),
          (this.vertLineColor = this.vertLineColor || this.primaryBorderColor),
          (this.taskTextOutsideColor = this.taskTextOutsideColor || this.textColor),
          (this.taskTextLightColor = this.taskTextLightColor || this.textColor),
          (this.taskTextColor = this.taskTextColor || this.primaryTextColor),
          (this.taskTextDarkColor = this.taskTextDarkColor || this.textColor),
          (this.taskTextClickableColor = this.taskTextClickableColor || '#003163'),
          (this.archEdgeColor = this.lineColor),
          (this.archEdgeArrowColor = this.lineColor),
          (this.personBorder = this.personBorder || this.primaryBorderColor),
          (this.personBkg = this.personBkg || this.mainBkg),
          (this.transitionColor = this.transitionColor || this.lineColor),
          (this.transitionLabelColor = this.transitionLabelColor || this.textColor),
          (this.stateLabelColor = this.stateLabelColor || this.stateBkg || this.primaryTextColor),
          (this.compositeTitleBackground = '#F9F9FB'),
          (this.altBackground = '#F9F9FB'),
          (this.stateEdgeLabelBackground = '#FFFFFF'),
          (this.fontWeight = 600),
          (this.stateBkg = this.stateBkg || this.mainBkg),
          (this.labelBackgroundColor = this.labelBackgroundColor || this.stateBkg),
          (this.compositeBackground =
            this.compositeBackground || this.background || this.tertiaryColor),
          (this.altBackground = this.altBackground || '#f0f0f0'),
          (this.compositeTitleBackground = this.compositeTitleBackground || this.mainBkg),
          (this.compositeBorder = this.compositeBorder || this.nodeBorder),
          (this.innerEndBackground = this.nodeBorder),
          (this.errorBkgColor = this.errorBkgColor || this.tertiaryColor),
          (this.errorTextColor = this.errorTextColor || this.tertiaryTextColor),
          (this.transitionColor = this.transitionColor || this.lineColor),
          (this.specialStateColor = this.lineColor));
        for (let a = 0; a < this.THEME_COLOR_LIMIT; a++) this['cScale' + a] = this.mainBkg;
        if (this.darkMode)
          for (let a = 0; a < this.THEME_COLOR_LIMIT; a++)
            this['cScale' + a] = v(this['cScale' + a], 75);
        else
          for (let a = 0; a < this.THEME_COLOR_LIMIT; a++)
            this['cScale' + a] = v(this['cScale' + a], 25);
        for (let a = 0; a < this.THEME_COLOR_LIMIT; a++)
          this['cScaleInv' + a] = this['cScaleInv' + a] || B(this['cScale' + a]);
        for (let a = 0; a < this.THEME_COLOR_LIMIT; a++)
          this.darkMode
            ? (this['cScalePeer' + a] = this['cScalePeer' + a] || w(this['cScale' + a], 10))
            : (this['cScalePeer' + a] = this['cScalePeer' + a] || v(this['cScale' + a], 10));
        this.scaleLabelColor = this.scaleLabelColor || this.labelTextColor;
        for (let a = 0; a < this.THEME_COLOR_LIMIT; a++)
          this['cScaleLabel' + a] = this['cScaleLabel' + a] || this.scaleLabelColor;
        const o = this.darkMode ? -4 : -1;
        for (let a = 0; a < 5; a++)
          ((this['surface' + a] =
            this['surface' + a] || m(this.mainBkg, { h: 180, s: -15, l: o * (5 + a * 3) })),
            (this['surfacePeer' + a] =
              this['surfacePeer' + a] || m(this.mainBkg, { h: 180, s: -15, l: o * (8 + a * 3) })));
        ((this.classText = this.classText || this.textColor),
          (this.fillType0 = this.fillType0 || t),
          (this.fillType1 = this.fillType1 || i),
          (this.fillType2 = this.fillType2 || m(t, { h: 64 })),
          (this.fillType3 = this.fillType3 || m(i, { h: 64 })),
          (this.fillType4 = this.fillType4 || m(t, { h: -64 })),
          (this.fillType5 = this.fillType5 || m(i, { h: -64 })),
          (this.fillType6 = this.fillType6 || m(t, { h: 128 })),
          (this.fillType7 = this.fillType7 || m(i, { h: 128 })),
          (this.pie1 = this.pie1 || t),
          (this.pie2 = this.pie2 || i),
          (this.pie3 = this.pie3 || e),
          (this.pie4 = this.pie4 || m(t, { l: -10 })),
          (this.pie5 = this.pie5 || m(i, { l: -10 })),
          (this.pie6 = this.pie6 || m(e, { l: -10 })),
          (this.pie7 = this.pie7 || m(t, { h: 60, l: -10 })),
          (this.pie8 = this.pie8 || m(t, { h: -60, l: -10 })),
          (this.pie9 = this.pie9 || m(t, { h: 120, l: 0 })),
          (this.pie10 = this.pie10 || m(t, { h: 60, l: -20 })),
          (this.pie11 = this.pie11 || m(t, { h: -60, l: -20 })),
          (this.pie12 = this.pie12 || m(t, { h: 120, l: -10 })),
          (this.pieTitleTextSize = this.pieTitleTextSize || '25px'),
          (this.pieTitleTextColor = this.pieTitleTextColor || this.taskTextDarkColor),
          (this.pieSectionTextSize = this.pieSectionTextSize || '17px'),
          (this.pieSectionTextColor = this.pieSectionTextColor || this.textColor),
          (this.pieLegendTextSize = this.pieLegendTextSize || '17px'),
          (this.pieLegendTextColor = this.pieLegendTextColor || this.taskTextDarkColor),
          (this.pieStrokeColor = this.pieStrokeColor || 'black'),
          (this.pieStrokeWidth = this.pieStrokeWidth || '2px'),
          (this.pieOuterStrokeWidth = this.pieOuterStrokeWidth || '2px'),
          (this.pieOuterStrokeColor = this.pieOuterStrokeColor || 'black'),
          (this.pieOpacity = this.pieOpacity || '0.7'),
          (this.vennTitleTextColor = this.vennTitleTextColor ?? this.titleColor),
          (this.vennSetTextColor = this.vennSetTextColor ?? this.textColor),
          (this.quadrant1Fill = this.quadrant1Fill || t),
          (this.quadrant2Fill = this.quadrant2Fill || m(t, { r: 5, g: 5, b: 5 })),
          (this.quadrant3Fill = this.quadrant3Fill || m(t, { r: 10, g: 10, b: 10 })),
          (this.quadrant4Fill = this.quadrant4Fill || m(t, { r: 15, g: 15, b: 15 })),
          (this.quadrant1TextFill = this.quadrant1TextFill || this.primaryTextColor),
          (this.quadrant2TextFill =
            this.quadrant2TextFill || m(this.primaryTextColor, { r: -5, g: -5, b: -5 })),
          (this.quadrant3TextFill =
            this.quadrant3TextFill || m(this.primaryTextColor, { r: -10, g: -10, b: -10 })),
          (this.quadrant4TextFill =
            this.quadrant4TextFill || m(this.primaryTextColor, { r: -15, g: -15, b: -15 })),
          (this.quadrantPointFill =
            this.quadrantPointFill || Et(this.quadrant1Fill)
              ? w(this.quadrant1Fill)
              : v(this.quadrant1Fill)),
          (this.quadrantPointTextFill = this.quadrantPointTextFill || this.primaryTextColor),
          (this.quadrantXAxisTextFill = this.quadrantXAxisTextFill || this.primaryTextColor),
          (this.quadrantYAxisTextFill = this.quadrantYAxisTextFill || this.primaryTextColor),
          (this.quadrantInternalBorderStrokeFill =
            this.quadrantInternalBorderStrokeFill || this.primaryBorderColor),
          (this.quadrantExternalBorderStrokeFill =
            this.quadrantExternalBorderStrokeFill || this.primaryBorderColor),
          (this.quadrantTitleFill = this.quadrantTitleFill || this.primaryTextColor),
          (this.xyChart = {
            backgroundColor: this.xyChart?.backgroundColor || this.background,
            titleColor: this.xyChart?.titleColor || this.primaryTextColor,
            xAxisTitleColor: this.xyChart?.xAxisTitleColor || this.primaryTextColor,
            xAxisLabelColor: this.xyChart?.xAxisLabelColor || this.primaryTextColor,
            xAxisTickColor: this.xyChart?.xAxisTickColor || this.primaryTextColor,
            xAxisLineColor: this.xyChart?.xAxisLineColor || this.primaryTextColor,
            yAxisTitleColor: this.xyChart?.yAxisTitleColor || this.primaryTextColor,
            yAxisLabelColor: this.xyChart?.yAxisLabelColor || this.primaryTextColor,
            yAxisTickColor: this.xyChart?.yAxisTickColor || this.primaryTextColor,
            yAxisLineColor: this.xyChart?.yAxisLineColor || this.primaryTextColor,
            plotColorPalette:
              this.xyChart?.plotColorPalette ||
              '#FFF4DD,#FFD8B1,#FFA07A,#ECEFF1,#D6DBDF,#C3E0A8,#FFB6A4,#FFD74D,#738FA7,#FFFFF0',
          }),
          (this.requirementBackground = this.requirementBackground || t),
          (this.requirementBorderColor = this.requirementBorderColor || this.primaryBorderColor),
          (this.requirementBorderSize = this.requirementBorderSize || '1'),
          (this.requirementTextColor = this.requirementTextColor || this.primaryTextColor),
          (this.relationColor = this.relationColor || this.lineColor),
          (this.relationLabelBackground =
            this.relationLabelBackground ||
            (this.darkMode ? v(this.secondaryColor, 30) : this.secondaryColor)),
          (this.relationLabelColor = this.relationLabelColor || this.actorTextColor),
          (this.requirementEdgeLabelBackground = '#FFFFFF'),
          (this.git0 = this.git0 || t),
          (this.git1 = this.git1 || i),
          (this.git2 = this.git2 || e),
          (this.git3 = this.git3 || m(t, { h: -30 })),
          (this.git4 = this.git4 || m(t, { h: -60 })),
          (this.git5 = this.git5 || m(t, { h: -90 })),
          (this.git6 = this.git6 || m(t, { h: 60 })),
          (this.git7 = this.git7 || m(t, { h: 120 })),
          this.darkMode
            ? ((this.git0 = w(this.git0, 25)),
              (this.git1 = w(this.git1, 25)),
              (this.git2 = w(this.git2, 25)),
              (this.git3 = w(this.git3, 25)),
              (this.git4 = w(this.git4, 25)),
              (this.git5 = w(this.git5, 25)),
              (this.git6 = w(this.git6, 25)),
              (this.git7 = w(this.git7, 25)))
            : ((this.git0 = v(this.git0, 25)),
              (this.git1 = v(this.git1, 25)),
              (this.git2 = v(this.git2, 25)),
              (this.git3 = v(this.git3, 25)),
              (this.git4 = v(this.git4, 25)),
              (this.git5 = v(this.git5, 25)),
              (this.git6 = v(this.git6, 25)),
              (this.git7 = v(this.git7, 25))),
          (this.gitInv0 = this.gitInv0 || B(this.git0)),
          (this.gitInv1 = this.gitInv1 || B(this.git1)),
          (this.gitInv2 = this.gitInv2 || B(this.git2)),
          (this.gitInv3 = this.gitInv3 || B(this.git3)),
          (this.gitInv4 = this.gitInv4 || B(this.git4)),
          (this.gitInv5 = this.gitInv5 || B(this.git5)),
          (this.gitInv6 = this.gitInv6 || B(this.git6)),
          (this.gitInv7 = this.gitInv7 || B(this.git7)),
          (this.branchLabelColor =
            this.branchLabelColor || (this.darkMode ? 'black' : this.labelTextColor)),
          (this.gitBranchLabel0 = this.gitBranchLabel0 || this.branchLabelColor),
          (this.gitBranchLabel1 = this.gitBranchLabel1 || this.branchLabelColor),
          (this.gitBranchLabel2 = this.gitBranchLabel2 || this.branchLabelColor),
          (this.gitBranchLabel3 = this.gitBranchLabel3 || this.branchLabelColor),
          (this.gitBranchLabel4 = this.gitBranchLabel4 || this.branchLabelColor),
          (this.gitBranchLabel5 = this.gitBranchLabel5 || this.branchLabelColor),
          (this.gitBranchLabel6 = this.gitBranchLabel6 || this.branchLabelColor),
          (this.gitBranchLabel7 = this.gitBranchLabel7 || this.branchLabelColor),
          (this.tagLabelColor = this.tagLabelColor || this.primaryTextColor),
          (this.tagLabelBackground = this.tagLabelBackground || this.primaryColor),
          (this.tagLabelBorder = this.tagBorder || this.primaryBorderColor),
          (this.tagLabelFontSize = this.tagLabelFontSize || '10px'),
          (this.commitLabelColor = this.commitLabelColor || this.secondaryTextColor),
          (this.commitLabelBackground = this.commitLabelBackground || this.secondaryColor),
          (this.commitLabelFontSize = this.commitLabelFontSize || '10px'),
          (this.commitLineColor = this.commitLineColor ?? '#BDBCCC'),
          (this.erEdgeLabelBackground = '#FFFFFF'),
          (this.attributeBackgroundColorOdd = this.attributeBackgroundColorOdd || $t),
          (this.attributeBackgroundColorEven = this.attributeBackgroundColorEven || Pt));
      }
      calculate(t) {
        if (typeof t != 'object') {
          this.updateColors();
          return;
        }
        const i = Object.keys(t);
        (i.forEach((e) => {
          this[e] = t[e];
        }),
          this.updateColors(),
          i.forEach((e) => {
            this[e] = t[e];
          }));
      }
    }),
    d(vr, 'Theme'),
    vr),
  Fc = d((r) => {
    const t = new Lc();
    return (t.calculate(r), t);
  }, 'getThemeVariables'),
  Lr,
  _c =
    ((Lr = class {
      constructor() {
        ((this.background = '#333'),
          (this.primaryColor = '#1f2020'),
          (this.secondaryColor = w(this.primaryColor, 16)),
          (this.tertiaryColor = m(this.primaryColor, { h: -160 })),
          (this.primaryBorderColor = B(this.background)),
          (this.secondaryBorderColor = G(this.secondaryColor, this.darkMode)),
          (this.tertiaryBorderColor = G(this.tertiaryColor, this.darkMode)),
          (this.primaryTextColor = B(this.primaryColor)),
          (this.secondaryTextColor = B(this.secondaryColor)),
          (this.tertiaryTextColor = B(this.tertiaryColor)),
          (this.mainBkg = '#111113'),
          (this.secondBkg = 'calculated'),
          (this.mainContrastColor = 'lightgrey'),
          (this.darkTextColor = w(B('#323D47'), 10)),
          (this.border1 = '#ccc'),
          (this.border2 = ar(255, 255, 255, 0.25)),
          (this.arrowheadColor = B(this.background)),
          (this.fontFamily = '"Recursive Variable", arial, sans-serif'),
          (this.fontSize = '14px'),
          (this.labelBackground = '#111113'),
          (this.textColor = '#ccc'),
          (this.THEME_COLOR_LIMIT = 12),
          (this.radius = 12),
          (this.strokeWidth = 2),
          (this.noteBkgColor = this.noteBkgColor ?? '#FEF9C3'),
          (this.noteTextColor = this.noteTextColor ?? '#28253D'),
          (this.THEME_COLOR_LIMIT = 12),
          (this.fontFamily = '"Recursive Variable", arial, sans-serif'),
          (this.fontSize = '14px'),
          (this.nodeBorder = '#FFFFFF'),
          (this.stateBorder = '#FFFFFF'),
          (this.useGradient = !1),
          (this.gradientStart = '#0042eb'),
          (this.gradientStop = '#eb0042'),
          (this.dropShadow = 'url(#drop-shadow)'),
          (this.nodeShadow = !0),
          (this.archEdgeColor = 'calculated'),
          (this.archEdgeArrowColor = 'calculated'),
          (this.archEdgeWidth = '3'),
          (this.archGroupBorderColor = this.primaryBorderColor),
          (this.archGroupBorderWidth = '2px'),
          (this.clusterBkg = '#1E1A2E'),
          (this.clusterBorder = '#BDBCCC'),
          (this.noteBorderColor = '#FACC15'),
          (this.noteFontWeight = 600),
          (this.filterColor = '#FFFFFF'));
      }
      updateColors() {
        if (
          ((this.primaryTextColor = this.primaryTextColor || (this.darkMode ? '#eee' : '#FFFFFF')),
          (this.secondaryColor = this.secondaryColor || m(this.primaryColor, { h: -120 })),
          (this.tertiaryColor = this.tertiaryColor || m(this.primaryColor, { h: 180, l: 5 })),
          (this.primaryBorderColor =
            this.primaryBorderColor || G(this.primaryColor, this.darkMode)),
          (this.secondaryBorderColor =
            this.secondaryBorderColor || G(this.secondaryColor, this.darkMode)),
          (this.tertiaryBorderColor =
            this.tertiaryBorderColor || G(this.tertiaryColor, this.darkMode)),
          (this.noteBorderColor = this.noteBorderColor || G(this.noteBkgColor, this.darkMode)),
          (this.noteBkgColor = this.noteBkgColor || '#fff5ad'),
          (this.noteTextColor = this.noteTextColor || '#FFFFFF'),
          (this.secondaryTextColor = this.secondaryTextColor || B(this.secondaryColor)),
          (this.tertiaryTextColor = this.tertiaryTextColor || B(this.tertiaryColor)),
          (this.lineColor = this.lineColor || B(this.background)),
          (this.arrowheadColor = this.arrowheadColor || B(this.background)),
          (this.textColor = this.textColor || this.primaryTextColor),
          (this.border2 = this.border2 || this.tertiaryBorderColor),
          (this.nodeBkg = this.nodeBkg || this.primaryColor),
          (this.mainBkg = this.mainBkg || this.primaryColor),
          (this.nodeBorder = this.nodeBorder || this.border1),
          (this.clusterBkg = this.clusterBkg || this.tertiaryColor),
          (this.clusterBorder = this.clusterBorder || this.tertiaryBorderColor),
          (this.defaultLinkColor = this.defaultLinkColor || this.lineColor),
          (this.titleColor = this.titleColor || this.tertiaryTextColor),
          (this.edgeLabelBackground =
            this.edgeLabelBackground ||
            (this.darkMode ? v(this.secondaryColor, 30) : this.secondaryColor)),
          (this.nodeTextColor = this.nodeTextColor || this.primaryTextColor),
          (this.actorBorder = '#FFFFFF'),
          (this.signalColor = '#FFFFFF'),
          (this.labelBoxBorderColor = '#BDBCCC'),
          (this.actorBorder = this.actorBorder || this.primaryBorderColor),
          (this.actorBkg = this.actorBkg || this.mainBkg),
          (this.actorTextColor = this.actorTextColor || this.primaryTextColor),
          (this.actorLineColor = this.actorLineColor || this.actorBorder),
          (this.labelBoxBkgColor = this.labelBoxBkgColor || this.actorBkg),
          (this.signalColor = this.signalColor || this.textColor),
          (this.signalTextColor = this.signalTextColor || this.textColor),
          (this.labelBoxBorderColor = this.labelBoxBorderColor || this.actorBorder),
          (this.labelTextColor = this.labelTextColor || this.actorTextColor),
          (this.loopTextColor = this.loopTextColor || this.actorTextColor),
          (this.activationBorderColor = this.activationBorderColor || v(this.secondaryColor, 10)),
          (this.activationBkgColor = this.activationBkgColor || this.secondaryColor),
          (this.sequenceNumberColor = this.sequenceNumberColor || B(this.lineColor)),
          (this.sectionBkgColor = this.sectionBkgColor || this.tertiaryColor),
          (this.altSectionBkgColor = this.altSectionBkgColor || 'white'),
          (this.sectionBkgColor = this.sectionBkgColor || this.secondaryColor),
          (this.sectionBkgColor2 = this.sectionBkgColor2 || this.primaryColor),
          (this.excludeBkgColor = this.excludeBkgColor || '#eeeeee'),
          (this.taskBorderColor = this.taskBorderColor || this.primaryBorderColor),
          (this.taskBkgColor = this.taskBkgColor || this.primaryColor),
          (this.activeTaskBorderColor = this.activeTaskBorderColor || this.primaryColor),
          (this.activeTaskBkgColor = this.activeTaskBkgColor || w(this.primaryColor, 23)),
          (this.gridColor = this.gridColor || 'lightgrey'),
          (this.doneTaskBkgColor = this.doneTaskBkgColor || 'lightgrey'),
          (this.doneTaskBorderColor = this.doneTaskBorderColor || 'grey'),
          (this.critBorderColor = this.critBorderColor || '#ff8888'),
          (this.critBkgColor = this.critBkgColor || 'red'),
          (this.todayLineColor = this.todayLineColor || 'red'),
          (this.taskTextColor = this.taskTextColor || this.textColor),
          (this.taskTextOutsideColor = this.taskTextOutsideColor || this.textColor),
          (this.taskTextLightColor = this.taskTextLightColor || this.textColor),
          (this.taskTextColor = this.taskTextColor || this.primaryTextColor),
          (this.taskTextDarkColor = this.taskTextDarkColor || this.textColor),
          (this.taskTextClickableColor = this.taskTextClickableColor || '#003163'),
          (this.archEdgeColor = this.lineColor),
          (this.archEdgeArrowColor = this.lineColor),
          (this.personBorder = this.personBorder || this.primaryBorderColor),
          (this.personBkg = this.personBkg || this.mainBkg),
          (this.transitionColor = this.transitionColor || this.lineColor),
          (this.transitionLabelColor = this.transitionLabelColor || this.textColor),
          (this.stateLabelColor = this.stateLabelColor || this.stateBkg || this.primaryTextColor),
          (this.vertLineColor = this.vertLineColor || this.primaryBorderColor),
          (this.compositeBackground = '#16141F'),
          (this.altBackground = '#16141F'),
          (this.compositeTitleBackground = '#16141F'),
          (this.stateEdgeLabelBackground = '#16141F'),
          (this.fontWeight = 600),
          (this.stateBkg = this.stateBkg || this.mainBkg),
          (this.labelBackgroundColor = this.labelBackgroundColor || this.stateBkg),
          (this.compositeBackground =
            this.compositeBackground || this.background || this.tertiaryColor),
          (this.altBackground = this.altBackground || '#f0f0f0'),
          (this.compositeTitleBackground = this.compositeTitleBackground || this.mainBkg),
          (this.compositeBorder = this.compositeBorder || this.nodeBorder),
          (this.innerEndBackground = this.nodeBorder),
          (this.errorBkgColor = this.errorBkgColor || this.tertiaryColor),
          (this.errorTextColor = this.errorTextColor || this.tertiaryTextColor),
          (this.transitionColor = this.transitionColor || this.lineColor),
          (this.specialStateColor = this.lineColor),
          (this.cScale0 = this.cScale0 || this.primaryColor),
          (this.cScale1 = this.cScale1 || this.secondaryColor),
          (this.cScale2 = this.cScale2 || this.tertiaryColor),
          (this.cScale3 = this.cScale3 || m(this.primaryColor, { h: 30 })),
          (this.cScale4 = this.cScale4 || m(this.primaryColor, { h: 60 })),
          (this.cScale5 = this.cScale5 || m(this.primaryColor, { h: 90 })),
          (this.cScale6 = this.cScale6 || m(this.primaryColor, { h: 120 })),
          (this.cScale7 = this.cScale7 || m(this.primaryColor, { h: 150 })),
          (this.cScale8 = this.cScale8 || m(this.primaryColor, { h: 210, l: 150 })),
          (this.cScale9 = this.cScale9 || m(this.primaryColor, { h: 270 })),
          (this.cScale10 = this.cScale10 || m(this.primaryColor, { h: 300 })),
          (this.cScale11 = this.cScale11 || m(this.primaryColor, { h: 330 })),
          this.darkMode)
        )
          for (let i = 0; i < this.THEME_COLOR_LIMIT; i++)
            this['cScale' + i] = v(this['cScale' + i], 75);
        else
          for (let i = 0; i < this.THEME_COLOR_LIMIT; i++)
            this['cScale' + i] = v(this['cScale' + i], 25);
        for (let i = 0; i < this.THEME_COLOR_LIMIT; i++)
          this['cScaleInv' + i] = this['cScaleInv' + i] || B(this['cScale' + i]);
        for (let i = 0; i < this.THEME_COLOR_LIMIT; i++)
          this.darkMode
            ? (this['cScalePeer' + i] = this['cScalePeer' + i] || w(this['cScale' + i], 10))
            : (this['cScalePeer' + i] = this['cScalePeer' + i] || v(this['cScale' + i], 10));
        this.scaleLabelColor = this.scaleLabelColor || this.labelTextColor;
        for (let i = 0; i < this.THEME_COLOR_LIMIT; i++)
          this['cScaleLabel' + i] = this['cScaleLabel' + i] || this.scaleLabelColor;
        const t = this.darkMode ? -4 : -1;
        for (let i = 0; i < 5; i++)
          ((this['surface' + i] =
            this['surface' + i] || m(this.mainBkg, { h: 180, s: -15, l: t * (5 + i * 3) })),
            (this['surfacePeer' + i] =
              this['surfacePeer' + i] || m(this.mainBkg, { h: 180, s: -15, l: t * (8 + i * 3) })));
        ((this.classText = this.classText || this.textColor),
          (this.fillType0 = this.fillType0 || this.primaryColor),
          (this.fillType1 = this.fillType1 || this.secondaryColor),
          (this.fillType2 = this.fillType2 || m(this.primaryColor, { h: 64 })),
          (this.fillType3 = this.fillType3 || m(this.secondaryColor, { h: 64 })),
          (this.fillType4 = this.fillType4 || m(this.primaryColor, { h: -64 })),
          (this.fillType5 = this.fillType5 || m(this.secondaryColor, { h: -64 })),
          (this.fillType6 = this.fillType6 || m(this.primaryColor, { h: 128 })),
          (this.fillType7 = this.fillType7 || m(this.secondaryColor, { h: 128 })),
          (this.pie1 = this.pie1 || this.primaryColor),
          (this.pie2 = this.pie2 || this.secondaryColor),
          (this.pie3 = this.pie3 || this.tertiaryColor),
          (this.pie4 = this.pie4 || m(this.primaryColor, { l: -10 })),
          (this.pie5 = this.pie5 || m(this.secondaryColor, { l: -10 })),
          (this.pie6 = this.pie6 || m(this.tertiaryColor, { l: -10 })),
          (this.pie7 = this.pie7 || m(this.primaryColor, { h: 60, l: -10 })),
          (this.pie8 = this.pie8 || m(this.primaryColor, { h: -60, l: -10 })),
          (this.pie9 = this.pie9 || m(this.primaryColor, { h: 120, l: 0 })),
          (this.pie10 = this.pie10 || m(this.primaryColor, { h: 60, l: -20 })),
          (this.pie11 = this.pie11 || m(this.primaryColor, { h: -60, l: -20 })),
          (this.pie12 = this.pie12 || m(this.primaryColor, { h: 120, l: -10 })),
          (this.pieTitleTextSize = this.pieTitleTextSize || '25px'),
          (this.pieTitleTextColor = this.pieTitleTextColor || this.taskTextDarkColor),
          (this.pieSectionTextSize = this.pieSectionTextSize || '17px'),
          (this.pieSectionTextColor = this.pieSectionTextColor || this.textColor),
          (this.pieLegendTextSize = this.pieLegendTextSize || '17px'),
          (this.pieLegendTextColor = this.pieLegendTextColor || this.taskTextDarkColor),
          (this.pieStrokeColor = this.pieStrokeColor || 'black'),
          (this.pieStrokeWidth = this.pieStrokeWidth || '2px'),
          (this.pieOuterStrokeWidth = this.pieOuterStrokeWidth || '2px'),
          (this.pieOuterStrokeColor = this.pieOuterStrokeColor || 'black'),
          (this.pieOpacity = this.pieOpacity || '0.7'),
          (this.vennTitleTextColor = this.vennTitleTextColor ?? this.titleColor),
          (this.vennSetTextColor = this.vennSetTextColor ?? this.textColor),
          (this.quadrant1Fill = this.quadrant1Fill || this.primaryColor),
          (this.quadrant2Fill = this.quadrant2Fill || m(this.primaryColor, { r: 5, g: 5, b: 5 })),
          (this.quadrant3Fill =
            this.quadrant3Fill || m(this.primaryColor, { r: 10, g: 10, b: 10 })),
          (this.quadrant4Fill =
            this.quadrant4Fill || m(this.primaryColor, { r: 15, g: 15, b: 15 })),
          (this.quadrant1TextFill = this.quadrant1TextFill || this.primaryTextColor),
          (this.quadrant2TextFill =
            this.quadrant2TextFill || m(this.primaryTextColor, { r: -5, g: -5, b: -5 })),
          (this.quadrant3TextFill =
            this.quadrant3TextFill || m(this.primaryTextColor, { r: -10, g: -10, b: -10 })),
          (this.quadrant4TextFill =
            this.quadrant4TextFill || m(this.primaryTextColor, { r: -15, g: -15, b: -15 })),
          (this.quadrantPointFill =
            this.quadrantPointFill || Et(this.quadrant1Fill)
              ? w(this.quadrant1Fill)
              : v(this.quadrant1Fill)),
          (this.quadrantPointTextFill = this.quadrantPointTextFill || this.primaryTextColor),
          (this.quadrantXAxisTextFill = this.quadrantXAxisTextFill || this.primaryTextColor),
          (this.quadrantYAxisTextFill = this.quadrantYAxisTextFill || this.primaryTextColor),
          (this.quadrantInternalBorderStrokeFill =
            this.quadrantInternalBorderStrokeFill || this.primaryBorderColor),
          (this.quadrantExternalBorderStrokeFill =
            this.quadrantExternalBorderStrokeFill || this.primaryBorderColor),
          (this.quadrantTitleFill = this.quadrantTitleFill || this.primaryTextColor),
          (this.xyChart = {
            backgroundColor: this.xyChart?.backgroundColor || this.background,
            titleColor: this.xyChart?.titleColor || this.primaryTextColor,
            xAxisTitleColor: this.xyChart?.xAxisTitleColor || this.primaryTextColor,
            xAxisLabelColor: this.xyChart?.xAxisLabelColor || this.primaryTextColor,
            xAxisTickColor: this.xyChart?.xAxisTickColor || this.primaryTextColor,
            xAxisLineColor: this.xyChart?.xAxisLineColor || this.primaryTextColor,
            yAxisTitleColor: this.xyChart?.yAxisTitleColor || this.primaryTextColor,
            yAxisLabelColor: this.xyChart?.yAxisLabelColor || this.primaryTextColor,
            yAxisTickColor: this.xyChart?.yAxisTickColor || this.primaryTextColor,
            yAxisLineColor: this.xyChart?.yAxisLineColor || this.primaryTextColor,
            plotColorPalette:
              this.xyChart?.plotColorPalette ||
              '#FFF4DD,#FFD8B1,#FFA07A,#ECEFF1,#D6DBDF,#C3E0A8,#FFB6A4,#FFD74D,#738FA7,#FFFFF0',
          }),
          (this.requirementBackground = this.requirementBackground || this.primaryColor),
          (this.requirementBorderColor = this.requirementBorderColor || this.primaryBorderColor),
          (this.requirementBorderSize = this.requirementBorderSize || '1'),
          (this.requirementTextColor = this.requirementTextColor || this.primaryTextColor),
          (this.relationColor = this.relationColor || this.lineColor),
          (this.relationLabelBackground =
            this.relationLabelBackground ||
            (this.darkMode ? v(this.secondaryColor, 30) : this.secondaryColor)),
          (this.relationLabelColor = this.relationLabelColor || this.actorTextColor),
          (this.requirementEdgeLabelBackground = '#16141F'),
          (this.git0 = this.git0 || this.primaryColor),
          (this.git1 = this.git1 || this.secondaryColor),
          (this.git2 = this.git2 || this.tertiaryColor),
          (this.git3 = this.git3 || m(this.primaryColor, { h: -30 })),
          (this.git4 = this.git4 || m(this.primaryColor, { h: -60 })),
          (this.git5 = this.git5 || m(this.primaryColor, { h: -90 })),
          (this.git6 = this.git6 || m(this.primaryColor, { h: 60 })),
          (this.git7 = this.git7 || m(this.primaryColor, { h: 120 })),
          this.darkMode
            ? ((this.git0 = w(this.git0, 25)),
              (this.git1 = w(this.git1, 25)),
              (this.git2 = w(this.git2, 25)),
              (this.git3 = w(this.git3, 25)),
              (this.git4 = w(this.git4, 25)),
              (this.git5 = w(this.git5, 25)),
              (this.git6 = w(this.git6, 25)),
              (this.git7 = w(this.git7, 25)))
            : ((this.git0 = v(this.git0, 25)),
              (this.git1 = v(this.git1, 25)),
              (this.git2 = v(this.git2, 25)),
              (this.git3 = v(this.git3, 25)),
              (this.git4 = v(this.git4, 25)),
              (this.git5 = v(this.git5, 25)),
              (this.git6 = v(this.git6, 25)),
              (this.git7 = v(this.git7, 25))),
          (this.gitInv0 = this.gitInv0 || B(this.git0)),
          (this.gitInv1 = this.gitInv1 || B(this.git1)),
          (this.gitInv2 = this.gitInv2 || B(this.git2)),
          (this.gitInv3 = this.gitInv3 || B(this.git3)),
          (this.gitInv4 = this.gitInv4 || B(this.git4)),
          (this.gitInv5 = this.gitInv5 || B(this.git5)),
          (this.gitInv6 = this.gitInv6 || B(this.git6)),
          (this.gitInv7 = this.gitInv7 || B(this.git7)),
          (this.branchLabelColor =
            this.branchLabelColor || (this.darkMode ? 'black' : this.labelTextColor)),
          (this.gitBranchLabel0 = this.gitBranchLabel0 || this.branchLabelColor),
          (this.gitBranchLabel1 = this.gitBranchLabel1 || this.branchLabelColor),
          (this.gitBranchLabel2 = this.gitBranchLabel2 || this.branchLabelColor),
          (this.gitBranchLabel3 = this.gitBranchLabel3 || this.branchLabelColor),
          (this.gitBranchLabel4 = this.gitBranchLabel4 || this.branchLabelColor),
          (this.gitBranchLabel5 = this.gitBranchLabel5 || this.branchLabelColor),
          (this.gitBranchLabel6 = this.gitBranchLabel6 || this.branchLabelColor),
          (this.gitBranchLabel7 = this.gitBranchLabel7 || this.branchLabelColor),
          (this.tagLabelColor = this.tagLabelColor || this.primaryTextColor),
          (this.tagLabelBackground = this.tagLabelBackground || this.primaryColor),
          (this.tagLabelBorder = this.tagBorder || this.primaryBorderColor),
          (this.tagLabelFontSize = this.tagLabelFontSize || '10px'),
          (this.commitLabelColor = this.commitLabelColor || this.secondaryTextColor),
          (this.commitLabelBackground = this.commitLabelBackground || this.secondaryColor),
          (this.commitLabelFontSize = this.commitLabelFontSize || '10px'),
          (this.commitLineColor = this.commitLineColor ?? '#BDBCCC'),
          (this.erEdgeLabelBackground = '#16141F'),
          (this.attributeBackgroundColorOdd = this.attributeBackgroundColorOdd || $t),
          (this.attributeBackgroundColorEven = this.attributeBackgroundColorEven || Pt));
      }
      calculate(t) {
        if (typeof t != 'object') {
          this.updateColors();
          return;
        }
        const i = Object.keys(t);
        (i.forEach((e) => {
          this[e] = t[e];
        }),
          this.updateColors(),
          i.forEach((e) => {
            this[e] = t[e];
          }));
      }
    }),
    d(Lr, 'Theme'),
    Lr),
  Ac = d((r) => {
    const t = new _c();
    return (t.calculate(r), t);
  }, 'getThemeVariables'),
  Fr,
  Ec =
    ((Fr = class {
      constructor() {
        ((this.background = '#ffffff'),
          (this.primaryColor = '#cccccc'),
          (this.mainBkg = '#ffffff'),
          (this.noteBkgColor = '#fff5ad'),
          (this.noteTextColor = '#28253D'),
          (this.THEME_COLOR_LIMIT = 12),
          (this.radius = 12),
          (this.strokeWidth = 2),
          (this.primaryBorderColor = G(this.primaryColor, this.darkMode)),
          (this.fontFamily = '"Recursive Variable", arial, sans-serif'),
          (this.fontSize = '14px'),
          (this.nodeBorder = '#28253D'),
          (this.stateBorder = '#28253D'),
          (this.useGradient = !1),
          (this.gradientStart = '#0042eb'),
          (this.gradientStop = '#eb0042'),
          (this.dropShadow = 'url(#drop-shadow)'),
          (this.nodeShadow = !0),
          (this.tertiaryColor = '#ffffff'),
          (this.archEdgeColor = 'calculated'),
          (this.archEdgeArrowColor = 'calculated'),
          (this.archEdgeWidth = '3'),
          (this.archGroupBorderColor = this.primaryBorderColor),
          (this.archGroupBorderWidth = '2px'),
          (this.actorBorder = '#28253D'),
          (this.noteBorderColor = '#FACC15'),
          (this.noteFontWeight = 600),
          (this.borderColorArray = [
            '#E879F9',
            '#2DD4BF',
            '#FB923C',
            '#22D3EE',
            '#4ADE80',
            '#A78BFA',
            '#F87171',
            '#FACC15',
            '#818CF8',
            '#A3E635 ',
            '#38BDF8',
            '#FB7185',
          ]),
          (this.bkgColorArray = [
            '#FDF4FF',
            '#F0FDFA',
            '#FFF7ED',
            '#ECFEFF',
            '#F0FDF4',
            '#F5F3FF',
            '#FEF2F2',
            '#FEFCE8',
            '#EEF2FF',
            '#F7FEE7',
            '#F0F9FF',
            '#FFF1F2',
          ]),
          (this.filterColor = '#000000'));
      }
      updateColors() {
        ((this.primaryTextColor = this.primaryTextColor || (this.darkMode ? '#eee' : '#28253D')),
          (this.secondaryColor = this.secondaryColor || m(this.primaryColor, { h: -120 })),
          (this.tertiaryColor = this.tertiaryColor || m(this.primaryColor, { h: 180, l: 5 })),
          (this.primaryBorderColor =
            this.primaryBorderColor || G(this.primaryColor, this.darkMode)),
          (this.secondaryBorderColor =
            this.secondaryBorderColor || G(this.secondaryColor, this.darkMode)),
          (this.tertiaryBorderColor =
            this.tertiaryBorderColor || G(this.tertiaryColor, this.darkMode)),
          (this.noteBorderColor = this.noteBorderColor || G(this.noteBkgColor, this.darkMode)),
          (this.noteBkgColor = this.noteBkgColor || '#fff5ad'),
          (this.noteTextColor = this.noteTextColor || '#28253D'),
          (this.secondaryTextColor = this.secondaryTextColor || B(this.secondaryColor)),
          (this.tertiaryTextColor = this.tertiaryTextColor || B(this.tertiaryColor)),
          (this.lineColor = this.lineColor || B(this.background)),
          (this.arrowheadColor = this.arrowheadColor || B(this.background)),
          (this.textColor = this.textColor || this.primaryTextColor),
          (this.border2 = this.border2 || this.tertiaryBorderColor),
          (this.nodeBkg = this.nodeBkg || this.primaryColor),
          (this.mainBkg = this.mainBkg || this.primaryColor),
          (this.nodeBorder = this.nodeBorder || this.primaryBorderColor),
          (this.clusterBkg = this.clusterBkg || this.tertiaryColor),
          (this.clusterBorder = this.clusterBorder || this.tertiaryBorderColor),
          (this.defaultLinkColor = this.defaultLinkColor || this.lineColor),
          (this.titleColor = this.titleColor || this.tertiaryTextColor),
          (this.edgeLabelBackground =
            this.edgeLabelBackground ||
            (this.darkMode ? v(this.secondaryColor, 30) : this.secondaryColor)),
          (this.nodeTextColor = this.nodeTextColor || this.primaryTextColor),
          (this.actorBorder = this.actorBorder || this.primaryBorderColor),
          (this.actorBkg = this.actorBkg || this.mainBkg),
          (this.actorTextColor = this.actorTextColor || this.primaryTextColor),
          (this.actorLineColor = this.actorLineColor || this.actorBorder),
          (this.labelBoxBkgColor = this.labelBoxBkgColor || this.actorBkg),
          (this.signalColor = this.signalColor || this.textColor),
          (this.signalTextColor = this.signalTextColor || this.textColor),
          (this.labelBoxBorderColor = this.labelBoxBorderColor || this.actorBorder),
          (this.labelTextColor = this.labelTextColor || this.actorTextColor),
          (this.loopTextColor = this.loopTextColor || this.actorTextColor),
          (this.activationBorderColor = this.activationBorderColor || v(this.secondaryColor, 10)),
          (this.activationBkgColor = this.activationBkgColor || this.secondaryColor),
          (this.sequenceNumberColor = this.sequenceNumberColor || B(this.lineColor)));
        const t = '#ECECFE',
          i = '#E9E9F1',
          e = m(t, { h: 180, l: 5 });
        ((this.sectionBkgColor = this.sectionBkgColor || e),
          (this.altSectionBkgColor = this.altSectionBkgColor || 'white'),
          (this.sectionBkgColor = this.sectionBkgColor || i),
          (this.sectionBkgColor2 = this.sectionBkgColor2 || t),
          (this.excludeBkgColor = this.excludeBkgColor || '#eeeeee'),
          (this.taskBorderColor = this.taskBorderColor || this.primaryBorderColor),
          (this.taskBkgColor = this.taskBkgColor || t),
          (this.activeTaskBorderColor = this.activeTaskBorderColor || t),
          (this.activeTaskBkgColor = this.activeTaskBkgColor || w(t, 23)),
          (this.gridColor = this.gridColor || 'lightgrey'),
          (this.doneTaskBkgColor = this.doneTaskBkgColor || 'lightgrey'),
          (this.doneTaskBorderColor = this.doneTaskBorderColor || 'grey'),
          (this.critBorderColor = this.critBorderColor || '#ff8888'),
          (this.critBkgColor = this.critBkgColor || 'red'),
          (this.todayLineColor = this.todayLineColor || 'red'),
          (this.taskTextColor = this.taskTextColor || this.textColor),
          (this.vertLineColor = this.vertLineColor || this.primaryBorderColor),
          (this.taskTextOutsideColor = this.taskTextOutsideColor || this.textColor),
          (this.taskTextLightColor = this.taskTextLightColor || this.textColor),
          (this.taskTextColor = this.taskTextColor || this.primaryTextColor),
          (this.taskTextDarkColor = this.taskTextDarkColor || this.textColor),
          (this.taskTextClickableColor = this.taskTextClickableColor || '#003163'),
          (this.archEdgeColor = this.lineColor),
          (this.archEdgeArrowColor = this.lineColor),
          (this.personBorder = this.personBorder || this.primaryBorderColor),
          (this.personBkg = this.personBkg || this.mainBkg),
          (this.transitionColor = this.transitionColor || this.lineColor),
          (this.transitionLabelColor = this.transitionLabelColor || this.textColor),
          (this.stateLabelColor = this.stateLabelColor || this.stateBkg || this.primaryTextColor),
          (this.stateBkg = this.stateBkg || this.mainBkg),
          (this.labelBackgroundColor = this.labelBackgroundColor || this.stateBkg),
          (this.compositeBackground =
            this.compositeBackground || this.background || this.tertiaryColor),
          (this.altBackground = this.altBackground || '#f0f0f0'),
          (this.compositeTitleBackground = this.compositeTitleBackground || this.mainBkg),
          (this.compositeBorder = this.compositeBorder || this.nodeBorder),
          (this.innerEndBackground = this.nodeBorder),
          (this.errorBkgColor = this.errorBkgColor || this.tertiaryColor),
          (this.errorTextColor = this.errorTextColor || this.tertiaryTextColor),
          (this.transitionColor = this.transitionColor || this.lineColor),
          (this.specialStateColor = this.lineColor),
          (this.cScale0 = this.cScale0 || '#f4a8ff'),
          (this.cScale1 = this.cScale1 || '#46ecd5'),
          (this.cScale2 = this.cScale2 || '#ffb86a'),
          (this.cScale3 = this.cScale3 || '#dab2ff'),
          (this.cScale4 = this.cScale4 || '#7bf1a8'),
          (this.cScale5 = this.cScale5 || '#c4b4ff'),
          (this.cScale6 = this.cScale6 || '#ffa2a2'),
          (this.cScale7 = this.cScale7 || '#ffdf20'),
          (this.cScale8 = this.cScale8 || '#a3b3ff'),
          (this.cScale9 = this.cScale9 || '#bbf451'),
          (this.cScale10 = this.cScale10 || '#74d4ff'),
          (this.cScale11 = this.cScale11 || '#ffa1ad'));
        for (let a = 0; a < this.THEME_COLOR_LIMIT; a++)
          this['cScaleInv' + a] = this['cScaleInv' + a] || B(this['cScale' + a]);
        for (let a = 0; a < this.THEME_COLOR_LIMIT; a++)
          this.darkMode
            ? (this['cScalePeer' + a] = this['cScalePeer' + a] || w(this['cScale' + a], 10))
            : (this['cScalePeer' + a] = this['cScalePeer' + a] || v(this['cScale' + a], 10));
        this.scaleLabelColor = this.scaleLabelColor || this.labelTextColor;
        for (let a = 0; a < this.THEME_COLOR_LIMIT; a++)
          this['cScaleLabel' + a] = this['cScaleLabel' + a] || this.scaleLabelColor;
        const o = this.darkMode ? -4 : -1;
        for (let a = 0; a < 5; a++)
          ((this['surface' + a] =
            this['surface' + a] || m(this.mainBkg, { h: 180, s: -15, l: o * (5 + a * 3) })),
            (this['surfacePeer' + a] =
              this['surfacePeer' + a] || m(this.mainBkg, { h: 180, s: -15, l: o * (8 + a * 3) })));
        ((this.classText = this.classText || this.textColor),
          (this.fillType0 = this.fillType0 || t),
          (this.fillType1 = this.fillType1 || i),
          (this.fillType2 = this.fillType2 || m(t, { h: 64 })),
          (this.fillType3 = this.fillType3 || m(i, { h: 64 })),
          (this.fillType4 = this.fillType4 || m(t, { h: -64 })),
          (this.fillType5 = this.fillType5 || m(i, { h: -64 })),
          (this.fillType6 = this.fillType6 || m(t, { h: 128 })),
          (this.fillType7 = this.fillType7 || m(i, { h: 128 })),
          (this.pie1 = this.pie1 || t),
          (this.pie2 = this.pie2 || i),
          (this.pie3 = this.pie3 || e),
          (this.pie4 = this.pie4 || m(t, { l: -10 })),
          (this.pie5 = this.pie5 || m(i, { l: -10 })),
          (this.pie6 = this.pie6 || m(e, { l: -10 })),
          (this.pie7 = this.pie7 || m(t, { h: 60, l: -10 })),
          (this.pie8 = this.pie8 || m(t, { h: -60, l: -10 })),
          (this.pie9 = this.pie9 || m(t, { h: 120, l: 0 })),
          (this.pie10 = this.pie10 || m(t, { h: 60, l: -20 })),
          (this.pie11 = this.pie11 || m(t, { h: -60, l: -20 })),
          (this.pie12 = this.pie12 || m(t, { h: 120, l: -10 })),
          (this.pieTitleTextSize = this.pieTitleTextSize || '25px'),
          (this.pieTitleTextColor = this.pieTitleTextColor || this.taskTextDarkColor),
          (this.pieSectionTextSize = this.pieSectionTextSize || '17px'),
          (this.pieSectionTextColor = this.pieSectionTextColor || this.textColor),
          (this.pieLegendTextSize = this.pieLegendTextSize || '17px'),
          (this.pieLegendTextColor = this.pieLegendTextColor || this.taskTextDarkColor),
          (this.pieStrokeColor = this.pieStrokeColor || 'black'),
          (this.pieStrokeWidth = this.pieStrokeWidth || '2px'),
          (this.pieOuterStrokeWidth = this.pieOuterStrokeWidth || '2px'),
          (this.pieOuterStrokeColor = this.pieOuterStrokeColor || 'black'),
          (this.pieOpacity = this.pieOpacity || '0.7'),
          (this.vennTitleTextColor = this.vennTitleTextColor ?? this.titleColor),
          (this.vennSetTextColor = this.vennSetTextColor ?? this.textColor),
          (this.quadrant1Fill = this.quadrant1Fill || t),
          (this.quadrant2Fill = this.quadrant2Fill || m(t, { r: 5, g: 5, b: 5 })),
          (this.quadrant3Fill = this.quadrant3Fill || m(t, { r: 10, g: 10, b: 10 })),
          (this.quadrant4Fill = this.quadrant4Fill || m(t, { r: 15, g: 15, b: 15 })),
          (this.quadrant1TextFill = this.quadrant1TextFill || this.primaryTextColor),
          (this.quadrant2TextFill =
            this.quadrant2TextFill || m(this.primaryTextColor, { r: -5, g: -5, b: -5 })),
          (this.quadrant3TextFill =
            this.quadrant3TextFill || m(this.primaryTextColor, { r: -10, g: -10, b: -10 })),
          (this.quadrant4TextFill =
            this.quadrant4TextFill || m(this.primaryTextColor, { r: -15, g: -15, b: -15 })),
          (this.quadrantPointFill =
            this.quadrantPointFill || Et(this.quadrant1Fill)
              ? w(this.quadrant1Fill)
              : v(this.quadrant1Fill)),
          (this.quadrantPointTextFill = this.quadrantPointTextFill || this.primaryTextColor),
          (this.quadrantXAxisTextFill = this.quadrantXAxisTextFill || this.primaryTextColor),
          (this.quadrantYAxisTextFill = this.quadrantYAxisTextFill || this.primaryTextColor),
          (this.quadrantInternalBorderStrokeFill =
            this.quadrantInternalBorderStrokeFill || this.primaryBorderColor),
          (this.quadrantExternalBorderStrokeFill =
            this.quadrantExternalBorderStrokeFill || this.primaryBorderColor),
          (this.quadrantTitleFill = this.quadrantTitleFill || this.primaryTextColor),
          (this.xyChart = {
            backgroundColor: this.xyChart?.backgroundColor || this.background,
            titleColor: this.xyChart?.titleColor || this.primaryTextColor,
            xAxisTitleColor: this.xyChart?.xAxisTitleColor || this.primaryTextColor,
            xAxisLabelColor: this.xyChart?.xAxisLabelColor || this.primaryTextColor,
            xAxisTickColor: this.xyChart?.xAxisTickColor || this.primaryTextColor,
            xAxisLineColor: this.xyChart?.xAxisLineColor || this.primaryTextColor,
            yAxisTitleColor: this.xyChart?.yAxisTitleColor || this.primaryTextColor,
            yAxisLabelColor: this.xyChart?.yAxisLabelColor || this.primaryTextColor,
            yAxisTickColor: this.xyChart?.yAxisTickColor || this.primaryTextColor,
            yAxisLineColor: this.xyChart?.yAxisLineColor || this.primaryTextColor,
            plotColorPalette:
              this.xyChart?.plotColorPalette ||
              '#FFF4DD,#FFD8B1,#FFA07A,#ECEFF1,#D6DBDF,#C3E0A8,#FFB6A4,#FFD74D,#738FA7,#FFFFF0',
          }),
          (this.requirementBackground = this.requirementBackground || t),
          (this.requirementBorderColor = this.requirementBorderColor || this.primaryBorderColor),
          (this.requirementBorderSize = this.requirementBorderSize || '1'),
          (this.requirementTextColor = this.requirementTextColor || this.primaryTextColor),
          (this.relationColor = this.relationColor || this.lineColor),
          (this.relationLabelBackground =
            this.relationLabelBackground ||
            (this.darkMode ? v(this.secondaryColor, 30) : this.secondaryColor)),
          (this.relationLabelColor = this.relationLabelColor || this.actorTextColor),
          (this.git0 = this.git0 || t),
          (this.git1 = this.git1 || i),
          (this.git2 = this.git2 || e),
          (this.git3 = this.git3 || m(t, { h: -30 })),
          (this.git4 = this.git4 || m(t, { h: -60 })),
          (this.git5 = this.git5 || m(t, { h: -90 })),
          (this.git6 = this.git6 || m(t, { h: 60 })),
          (this.git7 = this.git7 || m(t, { h: 120 })),
          this.darkMode
            ? ((this.git0 = w(this.git0, 25)),
              (this.git1 = w(this.git1, 25)),
              (this.git2 = w(this.git2, 25)),
              (this.git3 = w(this.git3, 25)),
              (this.git4 = w(this.git4, 25)),
              (this.git5 = w(this.git5, 25)),
              (this.git6 = w(this.git6, 25)),
              (this.git7 = w(this.git7, 25)))
            : ((this.git0 = v(this.git0, 25)),
              (this.git1 = v(this.git1, 25)),
              (this.git2 = v(this.git2, 25)),
              (this.git3 = v(this.git3, 25)),
              (this.git4 = v(this.git4, 25)),
              (this.git5 = v(this.git5, 25)),
              (this.git6 = v(this.git6, 25)),
              (this.git7 = v(this.git7, 25))),
          (this.gitInv0 = this.gitInv0 || B(this.git0)),
          (this.gitInv1 = this.gitInv1 || B(this.git1)),
          (this.gitInv2 = this.gitInv2 || B(this.git2)),
          (this.gitInv3 = this.gitInv3 || B(this.git3)),
          (this.gitInv4 = this.gitInv4 || B(this.git4)),
          (this.gitInv5 = this.gitInv5 || B(this.git5)),
          (this.gitInv6 = this.gitInv6 || B(this.git6)),
          (this.gitInv7 = this.gitInv7 || B(this.git7)),
          (this.branchLabelColor =
            this.branchLabelColor || (this.darkMode ? 'black' : this.labelTextColor)),
          (this.gitBranchLabel0 = this.gitBranchLabel0 || this.branchLabelColor),
          (this.gitBranchLabel1 = this.gitBranchLabel1 || this.branchLabelColor),
          (this.gitBranchLabel2 = this.gitBranchLabel2 || this.branchLabelColor),
          (this.gitBranchLabel3 = this.gitBranchLabel3 || this.branchLabelColor),
          (this.gitBranchLabel4 = this.gitBranchLabel4 || this.branchLabelColor),
          (this.gitBranchLabel5 = this.gitBranchLabel5 || this.branchLabelColor),
          (this.gitBranchLabel6 = this.gitBranchLabel6 || this.branchLabelColor),
          (this.gitBranchLabel7 = this.gitBranchLabel7 || this.branchLabelColor),
          (this.tagLabelColor = this.tagLabelColor || this.primaryTextColor),
          (this.tagLabelBackground = this.tagLabelBackground || this.primaryColor),
          (this.tagLabelBorder = this.tagBorder || this.primaryBorderColor),
          (this.tagLabelFontSize = this.tagLabelFontSize || '10px'),
          (this.commitLabelColor = this.commitLabelColor || this.secondaryTextColor),
          (this.commitLabelBackground = this.commitLabelBackground || this.secondaryColor),
          (this.commitLineColor = this.commitLineColor ?? '#BDBCCC'),
          (this.commitLabelFontSize = this.commitLabelFontSize || '10px'),
          (this.fontWeight = 600),
          (this.erEdgeLabelBackground = '#FFFFFF'),
          (this.attributeBackgroundColorOdd = this.attributeBackgroundColorOdd || $t),
          (this.attributeBackgroundColorEven = this.attributeBackgroundColorEven || Pt));
      }
      calculate(t) {
        if (typeof t != 'object') {
          this.updateColors();
          return;
        }
        const i = Object.keys(t);
        (i.forEach((e) => {
          this[e] = t[e];
        }),
          this.updateColors(),
          i.forEach((e) => {
            this[e] = t[e];
          }));
      }
    }),
    d(Fr, 'Theme'),
    Fr),
  Mc = d((r) => {
    const t = new Ec();
    return (t.calculate(r), t);
  }, 'getThemeVariables'),
  _r,
  Oc =
    ((_r = class {
      constructor() {
        ((this.background = '#333'),
          (this.primaryColor = '#1f2020'),
          (this.secondaryColor = w(this.primaryColor, 16)),
          (this.tertiaryColor = m(this.primaryColor, { h: -160 })),
          (this.primaryBorderColor = B(this.background)),
          (this.secondaryBorderColor = G(this.secondaryColor, this.darkMode)),
          (this.tertiaryBorderColor = G(this.tertiaryColor, this.darkMode)),
          (this.primaryTextColor = B(this.primaryColor)),
          (this.secondaryTextColor = B(this.secondaryColor)),
          (this.tertiaryTextColor = B(this.tertiaryColor)),
          (this.mainBkg = '#111113'),
          (this.secondBkg = 'calculated'),
          (this.mainContrastColor = 'lightgrey'),
          (this.darkTextColor = w(B('#323D47'), 10)),
          (this.border1 = '#ccc'),
          (this.border2 = ar(255, 255, 255, 0.25)),
          (this.arrowheadColor = B(this.background)),
          (this.fontFamily = '"Recursive Variable", arial, sans-serif'),
          (this.fontSize = '14px'),
          (this.labelBackground = '#111113'),
          (this.textColor = '#ccc'),
          (this.THEME_COLOR_LIMIT = 12),
          (this.radius = 12),
          (this.strokeWidth = 2),
          (this.noteBkgColor = this.noteBkgColor ?? '#FEF9C3'),
          (this.noteTextColor = this.noteTextColor ?? '#28253D'),
          (this.THEME_COLOR_LIMIT = 12),
          (this.fontFamily = '"Recursive Variable", arial, sans-serif'),
          (this.fontSize = '14px'),
          (this.nodeBorder = '#FFFFFF'),
          (this.stateBorder = '#FFFFFF'),
          (this.useGradient = !1),
          (this.gradientStart = '#0042eb'),
          (this.gradientStop = '#eb0042'),
          (this.dropShadow = 'url(#drop-shadow)'),
          (this.nodeShadow = !0),
          (this.archEdgeColor = 'calculated'),
          (this.archEdgeArrowColor = 'calculated'),
          (this.archEdgeWidth = '3'),
          (this.archGroupBorderColor = this.primaryBorderColor),
          (this.archGroupBorderWidth = '2px'),
          (this.clusterBkg = '#1E1A2E'),
          (this.clusterBorder = '#BDBCCC'),
          (this.noteBorderColor = '#FACC15'),
          (this.noteFontWeight = 600),
          (this.borderColorArray = [
            '#E879F9',
            '#2DD4BF',
            '#FB923C',
            '#22D3EE',
            '#4ADE80',
            '#A78BFA',
            '#F87171',
            '#FACC15',
            '#818CF8',
            '#A3E635 ',
            '#38BDF8',
            '#FB7185',
          ]),
          (this.bkgColorArray = []),
          (this.filterColor = '#FFFFFF'));
      }
      updateColors() {
        ((this.primaryTextColor = this.primaryTextColor || (this.darkMode ? '#eee' : '#FFFFFF')),
          (this.secondaryColor = this.secondaryColor || m(this.primaryColor, { h: -120 })),
          (this.tertiaryColor = this.tertiaryColor || m(this.primaryColor, { h: 180, l: 5 })),
          (this.primaryBorderColor =
            this.primaryBorderColor || G(this.primaryColor, this.darkMode)),
          (this.secondaryBorderColor =
            this.secondaryBorderColor || G(this.secondaryColor, this.darkMode)),
          (this.tertiaryBorderColor =
            this.tertiaryBorderColor || G(this.tertiaryColor, this.darkMode)),
          (this.noteBorderColor = this.noteBorderColor || G(this.noteBkgColor, this.darkMode)),
          (this.noteBkgColor = this.noteBkgColor || '#fff5ad'),
          (this.noteTextColor = this.noteTextColor || '#FFFFFF'),
          (this.secondaryTextColor = this.secondaryTextColor || B(this.secondaryColor)),
          (this.tertiaryTextColor = this.tertiaryTextColor || B(this.tertiaryColor)),
          (this.lineColor = this.lineColor || B(this.background)),
          (this.arrowheadColor = this.arrowheadColor || B(this.background)),
          (this.textColor = this.textColor || this.primaryTextColor),
          (this.border2 = this.border2 || this.tertiaryBorderColor),
          (this.nodeBkg = this.nodeBkg || this.primaryColor),
          (this.mainBkg = this.mainBkg || this.primaryColor),
          (this.nodeBorder = this.nodeBorder || this.border1),
          (this.clusterBkg = this.clusterBkg || this.tertiaryColor),
          (this.clusterBorder = this.clusterBorder || this.tertiaryBorderColor),
          (this.defaultLinkColor = this.defaultLinkColor || this.lineColor),
          (this.titleColor = this.titleColor || this.tertiaryTextColor),
          (this.edgeLabelBackground =
            this.edgeLabelBackground ||
            (this.darkMode ? v(this.secondaryColor, 30) : this.secondaryColor)),
          (this.nodeTextColor = this.nodeTextColor || this.primaryTextColor),
          (this.actorBorder = '#FFFFFF'),
          (this.signalColor = '#FFFFFF'),
          (this.labelBoxBorderColor = '#BDBCCC'),
          (this.actorBorder = this.actorBorder || this.primaryBorderColor),
          (this.actorBkg = this.actorBkg || this.mainBkg),
          (this.actorTextColor = this.actorTextColor || this.primaryTextColor),
          (this.actorLineColor = this.actorLineColor || this.actorBorder),
          (this.labelBoxBkgColor = this.labelBoxBkgColor || this.actorBkg),
          (this.signalColor = this.signalColor || this.textColor),
          (this.signalTextColor = this.signalTextColor || this.textColor),
          (this.labelBoxBorderColor = this.labelBoxBorderColor || this.actorBorder),
          (this.labelTextColor = this.labelTextColor || this.actorTextColor),
          (this.loopTextColor = this.loopTextColor || this.actorTextColor),
          (this.activationBorderColor = this.activationBorderColor || v(this.secondaryColor, 10)),
          (this.activationBkgColor = this.activationBkgColor || this.secondaryColor),
          (this.sequenceNumberColor = this.sequenceNumberColor || B(this.lineColor)),
          (this.rootLabelColor = '#FFFFFF'),
          (this.sectionBkgColor = this.sectionBkgColor || this.tertiaryColor),
          (this.altSectionBkgColor = this.altSectionBkgColor || 'white'),
          (this.sectionBkgColor = this.sectionBkgColor || this.secondaryColor),
          (this.sectionBkgColor2 = this.sectionBkgColor2 || this.primaryColor),
          (this.excludeBkgColor = this.excludeBkgColor || '#eeeeee'),
          (this.taskBorderColor = this.taskBorderColor || this.primaryBorderColor),
          (this.taskBkgColor = this.taskBkgColor || this.primaryColor),
          (this.activeTaskBorderColor = this.activeTaskBorderColor || this.primaryColor),
          (this.activeTaskBkgColor = this.activeTaskBkgColor || w(this.primaryColor, 23)),
          (this.gridColor = this.gridColor || 'lightgrey'),
          (this.doneTaskBkgColor = this.doneTaskBkgColor || 'lightgrey'),
          (this.doneTaskBorderColor = this.doneTaskBorderColor || 'grey'),
          (this.critBorderColor = this.critBorderColor || '#ff8888'),
          (this.critBkgColor = this.critBkgColor || 'red'),
          (this.todayLineColor = this.todayLineColor || 'red'),
          (this.taskTextColor = this.taskTextColor || this.textColor),
          (this.vertLineColor = this.vertLineColor || this.primaryBorderColor),
          (this.taskTextOutsideColor = this.taskTextOutsideColor || this.textColor),
          (this.taskTextLightColor = this.taskTextLightColor || this.textColor),
          (this.taskTextColor = this.taskTextColor || this.primaryTextColor),
          (this.taskTextDarkColor = this.taskTextDarkColor || this.textColor),
          (this.taskTextClickableColor = this.taskTextClickableColor || '#003163'),
          (this.archEdgeColor = this.lineColor),
          (this.archEdgeArrowColor = this.lineColor),
          (this.personBorder = this.personBorder || this.primaryBorderColor),
          (this.personBkg = this.personBkg || this.mainBkg),
          (this.transitionColor = this.transitionColor || this.lineColor),
          (this.transitionLabelColor = this.transitionLabelColor || this.textColor),
          (this.stateLabelColor = this.stateLabelColor || this.stateBkg || this.primaryTextColor),
          (this.stateBkg = this.stateBkg || this.mainBkg),
          (this.labelBackgroundColor = this.labelBackgroundColor || this.stateBkg),
          (this.compositeBackground =
            this.compositeBackground || this.background || this.tertiaryColor),
          (this.altBackground = this.altBackground || '#f0f0f0'),
          (this.compositeTitleBackground = this.compositeTitleBackground || this.mainBkg),
          (this.compositeBorder = this.compositeBorder || this.nodeBorder),
          (this.innerEndBackground = this.nodeBorder),
          (this.errorBkgColor = this.errorBkgColor || this.tertiaryColor),
          (this.errorTextColor = this.errorTextColor || this.tertiaryTextColor),
          (this.transitionColor = this.transitionColor || this.lineColor),
          (this.specialStateColor = this.lineColor),
          (this.cScale0 = this.cScale0 || '#f4a8ff'),
          (this.cScale1 = this.cScale1 || '#46ecd5'),
          (this.cScale2 = this.cScale2 || '#ffb86a'),
          (this.cScale3 = this.cScale3 || '#dab2ff'),
          (this.cScale4 = this.cScale4 || '#7bf1a8'),
          (this.cScale5 = this.cScale5 || '#c4b4ff'),
          (this.cScale6 = this.cScale6 || '#ffa2a2'),
          (this.cScale7 = this.cScale7 || '#ffdf20'),
          (this.cScale8 = this.cScale8 || '#a3b3ff'),
          (this.cScale9 = this.cScale9 || '#bbf451'),
          (this.cScale10 = this.cScale10 || '#74d4ff'),
          (this.cScale11 = this.cScale11 || '#ffa1ad'));
        for (let i = 0; i < this.THEME_COLOR_LIMIT; i++)
          this['cScaleInv' + i] = this['cScaleInv' + i] || B(this['cScale' + i]);
        for (let i = 0; i < this.THEME_COLOR_LIMIT; i++)
          this.darkMode
            ? (this['cScalePeer' + i] = this['cScalePeer' + i] || w(this['cScale' + i], 10))
            : (this['cScalePeer' + i] = this['cScalePeer' + i] || v(this['cScale' + i], 10));
        this.scaleLabelColor = this.scaleLabelColor || this.labelTextColor;
        for (let i = 0; i < this.THEME_COLOR_LIMIT; i++)
          this['cScaleLabel' + i] = v(this['cScale' + i], 75);
        const t = this.darkMode ? -4 : -1;
        for (let i = 0; i < 5; i++)
          ((this['surface' + i] =
            this['surface' + i] || m(this.mainBkg, { h: 180, s: -15, l: t * (5 + i * 3) })),
            (this['surfacePeer' + i] =
              this['surfacePeer' + i] || m(this.mainBkg, { h: 180, s: -15, l: t * (8 + i * 3) })));
        ((this.classText = this.classText || this.textColor),
          (this.fillType0 = this.fillType0 || this.primaryColor),
          (this.fillType1 = this.fillType1 || this.secondaryColor),
          (this.fillType2 = this.fillType2 || m(this.primaryColor, { h: 64 })),
          (this.fillType3 = this.fillType3 || m(this.secondaryColor, { h: 64 })),
          (this.fillType4 = this.fillType4 || m(this.primaryColor, { h: -64 })),
          (this.fillType5 = this.fillType5 || m(this.secondaryColor, { h: -64 })),
          (this.fillType6 = this.fillType6 || m(this.primaryColor, { h: 128 })),
          (this.fillType7 = this.fillType7 || m(this.secondaryColor, { h: 128 })),
          (this.pie1 = this.pie1 || this.primaryColor),
          (this.pie2 = this.pie2 || this.secondaryColor),
          (this.pie3 = this.pie3 || this.tertiaryColor),
          (this.pie4 = this.pie4 || m(this.primaryColor, { l: -10 })),
          (this.pie5 = this.pie5 || m(this.secondaryColor, { l: -10 })),
          (this.pie6 = this.pie6 || m(this.tertiaryColor, { l: -10 })),
          (this.pie7 = this.pie7 || m(this.primaryColor, { h: 60, l: -10 })),
          (this.pie8 = this.pie8 || m(this.primaryColor, { h: -60, l: -10 })),
          (this.pie9 = this.pie9 || m(this.primaryColor, { h: 120, l: 0 })),
          (this.pie10 = this.pie10 || m(this.primaryColor, { h: 60, l: -20 })),
          (this.pie11 = this.pie11 || m(this.primaryColor, { h: -60, l: -20 })),
          (this.pie12 = this.pie12 || m(this.primaryColor, { h: 120, l: -10 })),
          (this.pieTitleTextSize = this.pieTitleTextSize || '25px'),
          (this.pieTitleTextColor = this.pieTitleTextColor || this.taskTextDarkColor),
          (this.pieSectionTextSize = this.pieSectionTextSize || '17px'),
          (this.pieSectionTextColor = this.pieSectionTextColor || this.textColor),
          (this.pieLegendTextSize = this.pieLegendTextSize || '17px'),
          (this.pieLegendTextColor = this.pieLegendTextColor || this.taskTextDarkColor),
          (this.pieStrokeColor = this.pieStrokeColor || 'black'),
          (this.pieStrokeWidth = this.pieStrokeWidth || '2px'),
          (this.pieOuterStrokeWidth = this.pieOuterStrokeWidth || '2px'),
          (this.pieOuterStrokeColor = this.pieOuterStrokeColor || 'black'),
          (this.pieOpacity = this.pieOpacity || '0.7'),
          (this.vennTitleTextColor = this.vennTitleTextColor ?? this.titleColor),
          (this.vennSetTextColor = this.vennSetTextColor ?? this.textColor),
          (this.quadrant1Fill = this.quadrant1Fill || this.primaryColor),
          (this.quadrant2Fill = this.quadrant2Fill || m(this.primaryColor, { r: 5, g: 5, b: 5 })),
          (this.quadrant3Fill =
            this.quadrant3Fill || m(this.primaryColor, { r: 10, g: 10, b: 10 })),
          (this.quadrant4Fill =
            this.quadrant4Fill || m(this.primaryColor, { r: 15, g: 15, b: 15 })),
          (this.quadrant1TextFill = this.quadrant1TextFill || this.primaryTextColor),
          (this.quadrant2TextFill =
            this.quadrant2TextFill || m(this.primaryTextColor, { r: -5, g: -5, b: -5 })),
          (this.quadrant3TextFill =
            this.quadrant3TextFill || m(this.primaryTextColor, { r: -10, g: -10, b: -10 })),
          (this.quadrant4TextFill =
            this.quadrant4TextFill || m(this.primaryTextColor, { r: -15, g: -15, b: -15 })),
          (this.quadrantPointFill =
            this.quadrantPointFill || Et(this.quadrant1Fill)
              ? w(this.quadrant1Fill)
              : v(this.quadrant1Fill)),
          (this.quadrantPointTextFill = this.quadrantPointTextFill || this.primaryTextColor),
          (this.quadrantXAxisTextFill = this.quadrantXAxisTextFill || this.primaryTextColor),
          (this.quadrantYAxisTextFill = this.quadrantYAxisTextFill || this.primaryTextColor),
          (this.quadrantInternalBorderStrokeFill =
            this.quadrantInternalBorderStrokeFill || this.primaryBorderColor),
          (this.quadrantExternalBorderStrokeFill =
            this.quadrantExternalBorderStrokeFill || this.primaryBorderColor),
          (this.quadrantTitleFill = this.quadrantTitleFill || this.primaryTextColor),
          (this.xyChart = {
            backgroundColor: this.xyChart?.backgroundColor || this.background,
            titleColor: this.xyChart?.titleColor || this.primaryTextColor,
            xAxisTitleColor: this.xyChart?.xAxisTitleColor || this.primaryTextColor,
            xAxisLabelColor: this.xyChart?.xAxisLabelColor || this.primaryTextColor,
            xAxisTickColor: this.xyChart?.xAxisTickColor || this.primaryTextColor,
            xAxisLineColor: this.xyChart?.xAxisLineColor || this.primaryTextColor,
            yAxisTitleColor: this.xyChart?.yAxisTitleColor || this.primaryTextColor,
            yAxisLabelColor: this.xyChart?.yAxisLabelColor || this.primaryTextColor,
            yAxisTickColor: this.xyChart?.yAxisTickColor || this.primaryTextColor,
            yAxisLineColor: this.xyChart?.yAxisLineColor || this.primaryTextColor,
            plotColorPalette:
              this.xyChart?.plotColorPalette ||
              '#FFF4DD,#FFD8B1,#FFA07A,#ECEFF1,#D6DBDF,#C3E0A8,#FFB6A4,#FFD74D,#738FA7,#FFFFF0',
          }),
          (this.requirementBackground = this.requirementBackground || this.primaryColor),
          (this.requirementBorderColor = this.requirementBorderColor || this.primaryBorderColor),
          (this.requirementBorderSize = this.requirementBorderSize || '1'),
          (this.requirementTextColor = this.requirementTextColor || this.primaryTextColor),
          (this.relationColor = this.relationColor || this.lineColor),
          (this.relationLabelBackground =
            this.relationLabelBackground ||
            (this.darkMode ? v(this.secondaryColor, 30) : this.secondaryColor)),
          (this.relationLabelColor = this.relationLabelColor || this.actorTextColor),
          (this.git0 = this.git0 || this.primaryColor),
          (this.git1 = this.git1 || this.secondaryColor),
          (this.git2 = this.git2 || this.tertiaryColor),
          (this.git3 = this.git3 || m(this.primaryColor, { h: -30 })),
          (this.git4 = this.git4 || m(this.primaryColor, { h: -60 })),
          (this.git5 = this.git5 || m(this.primaryColor, { h: -90 })),
          (this.git6 = this.git6 || m(this.primaryColor, { h: 60 })),
          (this.git7 = this.git7 || m(this.primaryColor, { h: 120 })),
          this.darkMode
            ? ((this.git0 = w(this.git0, 25)),
              (this.git1 = w(this.git1, 25)),
              (this.git2 = w(this.git2, 25)),
              (this.git3 = w(this.git3, 25)),
              (this.git4 = w(this.git4, 25)),
              (this.git5 = w(this.git5, 25)),
              (this.git6 = w(this.git6, 25)),
              (this.git7 = w(this.git7, 25)))
            : ((this.git0 = v(this.git0, 25)),
              (this.git1 = v(this.git1, 25)),
              (this.git2 = v(this.git2, 25)),
              (this.git3 = v(this.git3, 25)),
              (this.git4 = v(this.git4, 25)),
              (this.git5 = v(this.git5, 25)),
              (this.git6 = v(this.git6, 25)),
              (this.git7 = v(this.git7, 25))),
          (this.gitInv0 = this.gitInv0 || B(this.git0)),
          (this.gitInv1 = this.gitInv1 || B(this.git1)),
          (this.gitInv2 = this.gitInv2 || B(this.git2)),
          (this.gitInv3 = this.gitInv3 || B(this.git3)),
          (this.gitInv4 = this.gitInv4 || B(this.git4)),
          (this.gitInv5 = this.gitInv5 || B(this.git5)),
          (this.gitInv6 = this.gitInv6 || B(this.git6)),
          (this.gitInv7 = this.gitInv7 || B(this.git7)),
          (this.branchLabelColor =
            this.branchLabelColor || (this.darkMode ? 'black' : this.labelTextColor)),
          (this.gitBranchLabel0 = this.gitBranchLabel0 || this.branchLabelColor),
          (this.gitBranchLabel1 = this.gitBranchLabel1 || this.branchLabelColor),
          (this.gitBranchLabel2 = this.gitBranchLabel2 || this.branchLabelColor),
          (this.gitBranchLabel3 = this.gitBranchLabel3 || this.branchLabelColor),
          (this.gitBranchLabel4 = this.gitBranchLabel4 || this.branchLabelColor),
          (this.gitBranchLabel5 = this.gitBranchLabel5 || this.branchLabelColor),
          (this.gitBranchLabel6 = this.gitBranchLabel6 || this.branchLabelColor),
          (this.gitBranchLabel7 = this.gitBranchLabel7 || this.branchLabelColor),
          (this.tagLabelColor = this.tagLabelColor || this.primaryTextColor),
          (this.tagLabelBackground = this.tagLabelBackground || this.primaryColor),
          (this.tagLabelBorder = this.tagBorder || this.primaryBorderColor),
          (this.tagLabelFontSize = this.tagLabelFontSize || '10px'),
          (this.commitLabelColor = this.commitLabelColor || this.secondaryTextColor),
          (this.commitLabelBackground = this.commitLabelBackground || this.secondaryColor),
          (this.commitLabelFontSize = this.commitLabelFontSize || '10px'),
          (this.commitLineColor = this.commitLineColor ?? '#BDBCCC'),
          (this.fontWeight = 600),
          (this.erEdgeLabelBackground = '#16141F'),
          (this.attributeBackgroundColorOdd = this.attributeBackgroundColorOdd || $t),
          (this.attributeBackgroundColorEven = this.attributeBackgroundColorEven || Pt));
      }
      calculate(t) {
        if (typeof t != 'object') {
          this.updateColors();
          return;
        }
        const i = Object.keys(t);
        (i.forEach((e) => {
          this[e] = t[e];
        }),
          this.updateColors(),
          i.forEach((e) => {
            this[e] = t[e];
          }));
      }
    }),
    d(_r, 'Theme'),
    _r),
  Ic = d((r) => {
    const t = new Oc();
    return (t.calculate(r), t);
  }, 'getThemeVariables'),
  zt = {
    base: { getThemeVariables: pc },
    dark: { getThemeVariables: mc },
    default: { getThemeVariables: yc },
    forest: { getThemeVariables: bc },
    neutral: { getThemeVariables: Bc },
    neo: { getThemeVariables: Sc },
    'neo-dark': { getThemeVariables: vc },
    redux: { getThemeVariables: Fc },
    'redux-dark': { getThemeVariables: Ac },
    'redux-color': { getThemeVariables: Mc },
    'redux-dark-color': { getThemeVariables: Ic },
  },
  xt = {
    flowchart: {
      useMaxWidth: !0,
      titleTopMargin: 25,
      subGraphTitleMargin: { top: 0, bottom: 0 },
      diagramPadding: 8,
      htmlLabels: null,
      nodeSpacing: 50,
      rankSpacing: 50,
      curve: 'basis',
      padding: 15,
      defaultRenderer: 'dagre-wrapper',
      wrappingWidth: 200,
      inheritDir: !1,
    },
    sequence: {
      useMaxWidth: !0,
      hideUnusedParticipants: !1,
      activationWidth: 10,
      diagramMarginX: 50,
      diagramMarginY: 10,
      actorMargin: 50,
      width: 150,
      height: 65,
      boxMargin: 10,
      boxTextMargin: 5,
      noteMargin: 10,
      messageMargin: 35,
      messageAlign: 'center',
      mirrorActors: !0,
      forceMenus: !1,
      bottomMarginAdj: 1,
      rightAngles: !1,
      showSequenceNumbers: !1,
      actorFontSize: 14,
      actorFontFamily: '"Open Sans", sans-serif',
      actorFontWeight: 400,
      noteFontSize: 14,
      noteFontFamily: '"trebuchet ms", verdana, arial, sans-serif',
      noteFontWeight: 400,
      noteAlign: 'center',
      messageFontSize: 16,
      messageFontFamily: '"trebuchet ms", verdana, arial, sans-serif',
      messageFontWeight: 400,
      wrap: !1,
      wrapPadding: 10,
      labelBoxWidth: 50,
      labelBoxHeight: 20,
    },
    gantt: {
      useMaxWidth: !0,
      titleTopMargin: 25,
      barHeight: 20,
      barGap: 4,
      topPadding: 50,
      rightPadding: 75,
      leftPadding: 75,
      gridLineStartPadding: 35,
      fontSize: 11,
      sectionFontSize: 11,
      numberSectionStyles: 4,
      axisFormat: '%Y-%m-%d',
      topAxis: !1,
      displayMode: '',
      weekday: 'sunday',
    },
    journey: {
      useMaxWidth: !0,
      diagramMarginX: 50,
      diagramMarginY: 10,
      leftMargin: 150,
      maxLabelWidth: 360,
      width: 150,
      height: 50,
      boxMargin: 10,
      boxTextMargin: 5,
      noteMargin: 10,
      messageMargin: 35,
      messageAlign: 'center',
      bottomMarginAdj: 1,
      rightAngles: !1,
      taskFontSize: 14,
      taskFontFamily: '"Open Sans", sans-serif',
      taskMargin: 50,
      activationWidth: 10,
      textPlacement: 'fo',
      actorColours: ['#8FBC8F', '#7CFC00', '#00FFFF', '#20B2AA', '#B0E0E6', '#FFFFE0'],
      sectionFills: ['#191970', '#8B008B', '#4B0082', '#2F4F4F', '#800000', '#8B4513', '#00008B'],
      sectionColours: ['#fff'],
      titleColor: '',
      titleFontFamily: '"trebuchet ms", verdana, arial, sans-serif',
      titleFontSize: '4ex',
    },
    class: {
      useMaxWidth: !0,
      titleTopMargin: 25,
      arrowMarkerAbsolute: !1,
      dividerMargin: 10,
      padding: 5,
      textHeight: 10,
      defaultRenderer: 'dagre-wrapper',
      htmlLabels: !1,
      hideEmptyMembersBox: !1,
      hierarchicalNamespaces: !0,
    },
    state: {
      useMaxWidth: !0,
      titleTopMargin: 25,
      dividerMargin: 10,
      sizeUnit: 5,
      padding: 8,
      textHeight: 10,
      titleShift: -15,
      noteMargin: 10,
      forkWidth: 70,
      forkHeight: 7,
      miniPadding: 2,
      fontSizeFactor: 5.02,
      fontSize: 24,
      labelHeight: 16,
      edgeLengthFactor: '20',
      compositTitleSize: 35,
      radius: 5,
      defaultRenderer: 'dagre-wrapper',
    },
    er: {
      useMaxWidth: !0,
      titleTopMargin: 25,
      diagramPadding: 20,
      layoutDirection: 'TB',
      minEntityWidth: 100,
      minEntityHeight: 75,
      entityPadding: 15,
      nodeSpacing: 140,
      rankSpacing: 80,
      stroke: 'gray',
      fill: 'honeydew',
      fontSize: 12,
    },
    pie: { useMaxWidth: !0, textPosition: 0.75 },
    quadrantChart: {
      useMaxWidth: !0,
      chartWidth: 500,
      chartHeight: 500,
      titleFontSize: 20,
      titlePadding: 10,
      quadrantPadding: 5,
      xAxisLabelPadding: 5,
      yAxisLabelPadding: 5,
      xAxisLabelFontSize: 16,
      yAxisLabelFontSize: 16,
      quadrantLabelFontSize: 16,
      quadrantTextTopPadding: 5,
      pointTextPadding: 5,
      pointLabelFontSize: 12,
      pointRadius: 5,
      xAxisPosition: 'top',
      yAxisPosition: 'left',
      quadrantInternalBorderStrokeWidth: 1,
      quadrantExternalBorderStrokeWidth: 2,
    },
    xyChart: {
      useMaxWidth: !0,
      width: 700,
      height: 500,
      titleFontSize: 20,
      titlePadding: 10,
      showDataLabel: !1,
      showDataLabelOutsideBar: !1,
      showTitle: !0,
      xAxis: {
        $ref: '#/$defs/XYChartAxisConfig',
        showLabel: !0,
        labelFontSize: 14,
        labelPadding: 5,
        showTitle: !0,
        titleFontSize: 16,
        titlePadding: 5,
        showTick: !0,
        tickLength: 5,
        tickWidth: 2,
        showAxisLine: !0,
        axisLineWidth: 2,
      },
      yAxis: {
        $ref: '#/$defs/XYChartAxisConfig',
        showLabel: !0,
        labelFontSize: 14,
        labelPadding: 5,
        showTitle: !0,
        titleFontSize: 16,
        titlePadding: 5,
        showTick: !0,
        tickLength: 5,
        tickWidth: 2,
        showAxisLine: !0,
        axisLineWidth: 2,
      },
      chartOrientation: 'vertical',
      plotReservedSpacePercent: 50,
    },
    requirement: {
      useMaxWidth: !0,
      rect_fill: '#f9f9f9',
      text_color: '#333',
      rect_border_size: '0.5px',
      rect_border_color: '#bbb',
      rect_min_width: 200,
      rect_min_height: 200,
      fontSize: 14,
      rect_padding: 10,
      line_height: 20,
    },
    mindmap: { useMaxWidth: !0, padding: 10, maxNodeWidth: 200, layoutAlgorithm: 'cose-bilkent' },
    ishikawa: { useMaxWidth: !0, diagramPadding: 20 },
    kanban: { useMaxWidth: !0, padding: 8, sectionWidth: 200, ticketBaseUrl: '' },
    timeline: {
      useMaxWidth: !0,
      diagramMarginX: 50,
      diagramMarginY: 10,
      leftMargin: 150,
      width: 150,
      height: 50,
      boxMargin: 10,
      boxTextMargin: 5,
      noteMargin: 10,
      messageMargin: 35,
      messageAlign: 'center',
      bottomMarginAdj: 1,
      rightAngles: !1,
      taskFontSize: 14,
      taskFontFamily: '"Open Sans", sans-serif',
      taskMargin: 50,
      activationWidth: 10,
      textPlacement: 'fo',
      actorColours: ['#8FBC8F', '#7CFC00', '#00FFFF', '#20B2AA', '#B0E0E6', '#FFFFE0'],
      sectionFills: ['#191970', '#8B008B', '#4B0082', '#2F4F4F', '#800000', '#8B4513', '#00008B'],
      sectionColours: ['#fff'],
      disableMulticolor: !1,
    },
    gitGraph: {
      useMaxWidth: !0,
      titleTopMargin: 25,
      diagramPadding: 8,
      nodeLabel: { width: 75, height: 100, x: -25, y: 0 },
      mainBranchName: 'main',
      mainBranchOrder: 0,
      showCommitLabel: !0,
      showBranches: !0,
      rotateCommitLabel: !0,
      parallelCommits: !1,
      arrowMarkerAbsolute: !1,
    },
    c4: {
      useMaxWidth: !0,
      diagramMarginX: 50,
      diagramMarginY: 10,
      c4ShapeMargin: 50,
      c4ShapePadding: 20,
      width: 216,
      height: 60,
      boxMargin: 10,
      c4ShapeInRow: 4,
      nextLinePaddingX: 0,
      c4BoundaryInRow: 2,
      personFontSize: 14,
      personFontFamily: '"Open Sans", sans-serif',
      personFontWeight: 'normal',
      external_personFontSize: 14,
      external_personFontFamily: '"Open Sans", sans-serif',
      external_personFontWeight: 'normal',
      systemFontSize: 14,
      systemFontFamily: '"Open Sans", sans-serif',
      systemFontWeight: 'normal',
      external_systemFontSize: 14,
      external_systemFontFamily: '"Open Sans", sans-serif',
      external_systemFontWeight: 'normal',
      system_dbFontSize: 14,
      system_dbFontFamily: '"Open Sans", sans-serif',
      system_dbFontWeight: 'normal',
      external_system_dbFontSize: 14,
      external_system_dbFontFamily: '"Open Sans", sans-serif',
      external_system_dbFontWeight: 'normal',
      system_queueFontSize: 14,
      system_queueFontFamily: '"Open Sans", sans-serif',
      system_queueFontWeight: 'normal',
      external_system_queueFontSize: 14,
      external_system_queueFontFamily: '"Open Sans", sans-serif',
      external_system_queueFontWeight: 'normal',
      boundaryFontSize: 14,
      boundaryFontFamily: '"Open Sans", sans-serif',
      boundaryFontWeight: 'normal',
      messageFontSize: 12,
      messageFontFamily: '"Open Sans", sans-serif',
      messageFontWeight: 'normal',
      containerFontSize: 14,
      containerFontFamily: '"Open Sans", sans-serif',
      containerFontWeight: 'normal',
      external_containerFontSize: 14,
      external_containerFontFamily: '"Open Sans", sans-serif',
      external_containerFontWeight: 'normal',
      container_dbFontSize: 14,
      container_dbFontFamily: '"Open Sans", sans-serif',
      container_dbFontWeight: 'normal',
      external_container_dbFontSize: 14,
      external_container_dbFontFamily: '"Open Sans", sans-serif',
      external_container_dbFontWeight: 'normal',
      container_queueFontSize: 14,
      container_queueFontFamily: '"Open Sans", sans-serif',
      container_queueFontWeight: 'normal',
      external_container_queueFontSize: 14,
      external_container_queueFontFamily: '"Open Sans", sans-serif',
      external_container_queueFontWeight: 'normal',
      componentFontSize: 14,
      componentFontFamily: '"Open Sans", sans-serif',
      componentFontWeight: 'normal',
      external_componentFontSize: 14,
      external_componentFontFamily: '"Open Sans", sans-serif',
      external_componentFontWeight: 'normal',
      component_dbFontSize: 14,
      component_dbFontFamily: '"Open Sans", sans-serif',
      component_dbFontWeight: 'normal',
      external_component_dbFontSize: 14,
      external_component_dbFontFamily: '"Open Sans", sans-serif',
      external_component_dbFontWeight: 'normal',
      component_queueFontSize: 14,
      component_queueFontFamily: '"Open Sans", sans-serif',
      component_queueFontWeight: 'normal',
      external_component_queueFontSize: 14,
      external_component_queueFontFamily: '"Open Sans", sans-serif',
      external_component_queueFontWeight: 'normal',
      wrap: !0,
      wrapPadding: 10,
      person_bg_color: '#08427B',
      person_border_color: '#073B6F',
      external_person_bg_color: '#686868',
      external_person_border_color: '#8A8A8A',
      system_bg_color: '#1168BD',
      system_border_color: '#3C7FC0',
      system_db_bg_color: '#1168BD',
      system_db_border_color: '#3C7FC0',
      system_queue_bg_color: '#1168BD',
      system_queue_border_color: '#3C7FC0',
      external_system_bg_color: '#999999',
      external_system_border_color: '#8A8A8A',
      external_system_db_bg_color: '#999999',
      external_system_db_border_color: '#8A8A8A',
      external_system_queue_bg_color: '#999999',
      external_system_queue_border_color: '#8A8A8A',
      container_bg_color: '#438DD5',
      container_border_color: '#3C7FC0',
      container_db_bg_color: '#438DD5',
      container_db_border_color: '#3C7FC0',
      container_queue_bg_color: '#438DD5',
      container_queue_border_color: '#3C7FC0',
      external_container_bg_color: '#B3B3B3',
      external_container_border_color: '#A6A6A6',
      external_container_db_bg_color: '#B3B3B3',
      external_container_db_border_color: '#A6A6A6',
      external_container_queue_bg_color: '#B3B3B3',
      external_container_queue_border_color: '#A6A6A6',
      component_bg_color: '#85BBF0',
      component_border_color: '#78A8D8',
      component_db_bg_color: '#85BBF0',
      component_db_border_color: '#78A8D8',
      component_queue_bg_color: '#85BBF0',
      component_queue_border_color: '#78A8D8',
      external_component_bg_color: '#CCCCCC',
      external_component_border_color: '#BFBFBF',
      external_component_db_bg_color: '#CCCCCC',
      external_component_db_border_color: '#BFBFBF',
      external_component_queue_bg_color: '#CCCCCC',
      external_component_queue_border_color: '#BFBFBF',
    },
    sankey: {
      useMaxWidth: !0,
      width: 600,
      height: 400,
      linkColor: 'gradient',
      nodeAlignment: 'justify',
      showValues: !0,
      prefix: '',
      suffix: '',
      nodeWidth: 10,
      nodePadding: 12,
      labelStyle: 'legacy',
    },
    block: { useMaxWidth: !0, padding: 8 },
    packet: {
      useMaxWidth: !0,
      rowHeight: 32,
      bitWidth: 32,
      bitsPerRow: 32,
      showBits: !0,
      paddingX: 5,
      paddingY: 5,
    },
    treeView: { useMaxWidth: !0, rowIndent: 10, paddingX: 5, paddingY: 5, lineThickness: 1 },
    architecture: {
      useMaxWidth: !0,
      padding: 40,
      iconSize: 80,
      fontSize: 16,
      randomize: !1,
      nodeSeparation: 75,
      idealEdgeLengthMultiplier: 1.5,
      edgeElasticity: 0.45,
      numIter: 2500,
    },
    eventmodeling: { useMaxWidth: !0, padding: 30, rowHeight: 32 },
    radar: {
      useMaxWidth: !0,
      width: 600,
      height: 600,
      marginTop: 50,
      marginRight: 50,
      marginBottom: 50,
      marginLeft: 50,
      axisScaleFactor: 1,
      axisLabelFactor: 1.05,
      curveTension: 0.17,
    },
    venn: { useMaxWidth: !0, width: 800, height: 450, padding: 8, useDebugLayout: !1 },
    theme: 'default',
    look: 'classic',
    handDrawnSeed: 0,
    layout: 'dagre',
    maxTextSize: 5e4,
    maxEdges: 500,
    darkMode: !1,
    fontFamily: '"trebuchet ms", verdana, arial, sans-serif;',
    logLevel: 5,
    securityLevel: 'strict',
    startOnLoad: !0,
    arrowMarkerAbsolute: !1,
    secure: [
      'secure',
      'securityLevel',
      'startOnLoad',
      'maxTextSize',
      'suppressErrorRendering',
      'maxEdges',
    ],
    legacyMathML: !1,
    forceLegacyMathML: !1,
    deterministicIds: !1,
    fontSize: 16,
    markdownAutoWrap: !0,
    suppressErrorRendering: !1,
  },
  Uo = {
    ...xt,
    deterministicIDSeed: void 0,
    elk: {
      mergeEdges: !1,
      nodePlacementStrategy: 'BRANDES_KOEPF',
      forceNodeModelOrder: !1,
      considerModelOrder: 'NODES_AND_EDGES',
    },
    themeCSS: void 0,
    themeVariables: zt.default.getThemeVariables(),
    sequence: {
      ...xt.sequence,
      messageFont: d(function () {
        return {
          fontFamily: this.messageFontFamily,
          fontSize: this.messageFontSize,
          fontWeight: this.messageFontWeight,
        };
      }, 'messageFont'),
      noteFont: d(function () {
        return {
          fontFamily: this.noteFontFamily,
          fontSize: this.noteFontSize,
          fontWeight: this.noteFontWeight,
        };
      }, 'noteFont'),
      actorFont: d(function () {
        return {
          fontFamily: this.actorFontFamily,
          fontSize: this.actorFontSize,
          fontWeight: this.actorFontWeight,
        };
      }, 'actorFont'),
    },
    class: { hideEmptyMembersBox: !1, hierarchicalNamespaces: !0 },
    gantt: { ...xt.gantt, tickInterval: void 0, useWidth: void 0 },
    c4: {
      ...xt.c4,
      useWidth: void 0,
      personFont: d(function () {
        return {
          fontFamily: this.personFontFamily,
          fontSize: this.personFontSize,
          fontWeight: this.personFontWeight,
        };
      }, 'personFont'),
      flowchart: { ...xt.flowchart, inheritDir: !1 },
      external_personFont: d(function () {
        return {
          fontFamily: this.external_personFontFamily,
          fontSize: this.external_personFontSize,
          fontWeight: this.external_personFontWeight,
        };
      }, 'external_personFont'),
      systemFont: d(function () {
        return {
          fontFamily: this.systemFontFamily,
          fontSize: this.systemFontSize,
          fontWeight: this.systemFontWeight,
        };
      }, 'systemFont'),
      external_systemFont: d(function () {
        return {
          fontFamily: this.external_systemFontFamily,
          fontSize: this.external_systemFontSize,
          fontWeight: this.external_systemFontWeight,
        };
      }, 'external_systemFont'),
      system_dbFont: d(function () {
        return {
          fontFamily: this.system_dbFontFamily,
          fontSize: this.system_dbFontSize,
          fontWeight: this.system_dbFontWeight,
        };
      }, 'system_dbFont'),
      external_system_dbFont: d(function () {
        return {
          fontFamily: this.external_system_dbFontFamily,
          fontSize: this.external_system_dbFontSize,
          fontWeight: this.external_system_dbFontWeight,
        };
      }, 'external_system_dbFont'),
      system_queueFont: d(function () {
        return {
          fontFamily: this.system_queueFontFamily,
          fontSize: this.system_queueFontSize,
          fontWeight: this.system_queueFontWeight,
        };
      }, 'system_queueFont'),
      external_system_queueFont: d(function () {
        return {
          fontFamily: this.external_system_queueFontFamily,
          fontSize: this.external_system_queueFontSize,
          fontWeight: this.external_system_queueFontWeight,
        };
      }, 'external_system_queueFont'),
      containerFont: d(function () {
        return {
          fontFamily: this.containerFontFamily,
          fontSize: this.containerFontSize,
          fontWeight: this.containerFontWeight,
        };
      }, 'containerFont'),
      external_containerFont: d(function () {
        return {
          fontFamily: this.external_containerFontFamily,
          fontSize: this.external_containerFontSize,
          fontWeight: this.external_containerFontWeight,
        };
      }, 'external_containerFont'),
      container_dbFont: d(function () {
        return {
          fontFamily: this.container_dbFontFamily,
          fontSize: this.container_dbFontSize,
          fontWeight: this.container_dbFontWeight,
        };
      }, 'container_dbFont'),
      external_container_dbFont: d(function () {
        return {
          fontFamily: this.external_container_dbFontFamily,
          fontSize: this.external_container_dbFontSize,
          fontWeight: this.external_container_dbFontWeight,
        };
      }, 'external_container_dbFont'),
      container_queueFont: d(function () {
        return {
          fontFamily: this.container_queueFontFamily,
          fontSize: this.container_queueFontSize,
          fontWeight: this.container_queueFontWeight,
        };
      }, 'container_queueFont'),
      external_container_queueFont: d(function () {
        return {
          fontFamily: this.external_container_queueFontFamily,
          fontSize: this.external_container_queueFontSize,
          fontWeight: this.external_container_queueFontWeight,
        };
      }, 'external_container_queueFont'),
      componentFont: d(function () {
        return {
          fontFamily: this.componentFontFamily,
          fontSize: this.componentFontSize,
          fontWeight: this.componentFontWeight,
        };
      }, 'componentFont'),
      external_componentFont: d(function () {
        return {
          fontFamily: this.external_componentFontFamily,
          fontSize: this.external_componentFontSize,
          fontWeight: this.external_componentFontWeight,
        };
      }, 'external_componentFont'),
      component_dbFont: d(function () {
        return {
          fontFamily: this.component_dbFontFamily,
          fontSize: this.component_dbFontSize,
          fontWeight: this.component_dbFontWeight,
        };
      }, 'component_dbFont'),
      external_component_dbFont: d(function () {
        return {
          fontFamily: this.external_component_dbFontFamily,
          fontSize: this.external_component_dbFontSize,
          fontWeight: this.external_component_dbFontWeight,
        };
      }, 'external_component_dbFont'),
      component_queueFont: d(function () {
        return {
          fontFamily: this.component_queueFontFamily,
          fontSize: this.component_queueFontSize,
          fontWeight: this.component_queueFontWeight,
        };
      }, 'component_queueFont'),
      external_component_queueFont: d(function () {
        return {
          fontFamily: this.external_component_queueFontFamily,
          fontSize: this.external_component_queueFontSize,
          fontWeight: this.external_component_queueFontWeight,
        };
      }, 'external_component_queueFont'),
      boundaryFont: d(function () {
        return {
          fontFamily: this.boundaryFontFamily,
          fontSize: this.boundaryFontSize,
          fontWeight: this.boundaryFontWeight,
        };
      }, 'boundaryFont'),
      messageFont: d(function () {
        return {
          fontFamily: this.messageFontFamily,
          fontSize: this.messageFontSize,
          fontWeight: this.messageFontWeight,
        };
      }, 'messageFont'),
    },
    pie: { ...xt.pie, useWidth: 984 },
    xyChart: { ...xt.xyChart, useWidth: void 0 },
    requirement: { ...xt.requirement, useWidth: void 0 },
    packet: { ...xt.packet },
    eventmodeling: { ...xt.eventmodeling },
    treeView: { ...xt.treeView, useWidth: void 0 },
    radar: { ...xt.radar },
    ishikawa: { ...xt.ishikawa },
    sankey: { ...xt.sankey, nodeColors: void 0 },
    treemap: {
      useMaxWidth: !0,
      padding: 10,
      diagramPadding: 8,
      showValues: !0,
      nodeWidth: 100,
      nodeHeight: 40,
      borderWidth: 1,
      valueFontSize: 12,
      labelFontSize: 14,
      valueFormat: ',',
    },
    venn: { ...xt.venn },
  },
  Vo = d(
    (r, t = '') =>
      Object.keys(r).reduce(
        (i, e) =>
          Array.isArray(r[e])
            ? i
            : typeof r[e] == 'object' && r[e] !== null
              ? [...i, t + e, ...Vo(r[e], '')]
              : [...i, t + e],
        [],
      ),
    'keyify',
  ),
  Dc = new Set(Vo(Uo, '')),
  Go = Uo,
  gi = d((r) => {
    if ((F.debug('sanitizeDirective called with', r), !(typeof r != 'object' || r == null))) {
      if (Array.isArray(r)) {
        r.forEach((t) => gi(t));
        return;
      }
      for (const t of Object.keys(r)) {
        if (
          (F.debug('Checking key', t),
          t.startsWith('__') ||
            t.includes('proto') ||
            t.includes('constr') ||
            !Dc.has(t) ||
            r[t] == null)
        ) {
          (F.debug('sanitize deleting key: ', t), delete r[t]);
          continue;
        }
        if (typeof r[t] == 'object') {
          if (t === 'nodeColors') {
            const e = /^#[\da-f]{3,8}$|^rgb\([\d\s%,.]+\)$|^hsl\([\d\s%,.]+\)$|^[a-z]+$/i;
            for (const o of Object.keys(r[t]))
              (typeof r[t][o] != 'string' || !e.test(r[t][o])) &&
                (F.debug('sanitize deleting invalid color:', o, r[t][o]), delete r[t][o]);
          } else (F.debug('sanitizing object', t), gi(r[t]));
          continue;
        }
        const i = ['themeCSS', 'fontFamily', 'altFontFamily'];
        for (const e of i)
          t.includes(e) && (F.debug('sanitizing css option', t), (r[t] = Ko(r[t])));
      }
      if (r.themeVariables)
        for (const t of Object.keys(r.themeVariables)) {
          const i = r.themeVariables[t];
          i?.match && !i.match(/^[\d "#%(),.;A-Za-z]+$/) && (r.themeVariables[t] = '');
        }
      F.debug('After sanitization', r);
    }
  }, 'sanitizeDirective'),
  Ko = d((r) => {
    let t = 0,
      i = 0;
    for (const e of r) {
      if (t < i) return '{ /* ERROR: Unbalanced CSS */ }';
      e === '{' ? t++ : e === '}' && i++;
    }
    return t !== i ? '{ /* ERROR: Unbalanced CSS */ }' : r;
  }, 'sanitizeCss'),
  Or = Object.freeze(Go),
  jt = d(
    (r) => !(r === !1 || ['false', 'null', '0'].includes(String(r).trim().toLowerCase())),
    'evaluate',
  ),
  Tt = ht({}, Or),
  ui,
  nr = [],
  jr = ht({}, Or),
  vi = d((r, t) => {
    let i = ht({}, r),
      e = {};
    for (const o of t) (Jo(o), (e = ht(e, o)));
    if (((i = ht(i, e)), e.theme && e.theme in zt)) {
      const o = ht({}, ui),
        a = ht(o.themeVariables || {}, e.themeVariables);
      i.theme && i.theme in zt && (i.themeVariables = zt[i.theme].getThemeVariables(a));
    }
    return ((jr = i), ra(jr), jr);
  }, 'updateCurrentConfig'),
  $c = d(
    (r) => (
      (Tt = ht({}, Or)),
      (Tt = ht(Tt, r)),
      r.theme &&
        zt[r.theme] &&
        (Tt.themeVariables = zt[r.theme].getThemeVariables(r.themeVariables)),
      vi(Tt, nr),
      Tt
    ),
    'setSiteConfig',
  ),
  Pc = d((r) => {
    ui = ht({}, r);
  }, 'saveConfigFromInitialize'),
  qc = d((r) => ((Tt = ht(Tt, r)), vi(Tt, nr), Tt), 'updateSiteConfig'),
  Qo = d(() => ht({}, Tt), 'getSiteConfig'),
  Zo = d((r) => (ra(r), ht(jr, r), at()), 'setConfig'),
  at = d(() => ht({}, jr), 'getConfig'),
  Jo = d((r) => {
    r &&
      (['secure', ...(Tt.secure ?? [])].forEach((t) => {
        Object.hasOwn(r, t) &&
          (F.debug(`Denied attempt to modify a secure key ${t}`, r[t]), delete r[t]);
      }),
      Object.keys(r).forEach((t) => {
        t.startsWith('__') && delete r[t];
      }),
      Object.keys(r).forEach((t) => {
        (typeof r[t] == 'string' &&
          (r[t].includes('<') || r[t].includes('>') || r[t].includes('url(data:')) &&
          delete r[t],
          typeof r[t] == 'object' && Jo(r[t]));
      }));
  }, 'sanitize'),
  Rc = d((r) => {
    (gi(r),
      r.fontFamily &&
        !r.themeVariables?.fontFamily &&
        (r.themeVariables = { ...r.themeVariables, fontFamily: r.fontFamily }),
      nr.push(r),
      vi(Tt, nr));
  }, 'addDirective'),
  pi = d((r = Tt) => {
    ((nr = []), vi(r, nr));
  }, 'reset'),
  Wc = {
    LAZY_LOAD_DEPRECATED:
      'The configuration options lazyLoadedDiagrams and loadExternalDiagramsAtStartup are deprecated. Please use registerExternalDiagrams instead.',
    FLOWCHART_HTML_LABELS_DEPRECATED:
      'flowchart.htmlLabels is deprecated. Please use global htmlLabels instead.',
  },
  Ze = {},
  ta = d((r) => {
    Ze[r] || (F.warn(Wc[r]), (Ze[r] = !0));
  }, 'issueWarning'),
  ra = d((r) => {
    r && (r.lazyLoadedDiagrams || r.loadExternalDiagramsAtStartup) && ta('LAZY_LOAD_DEPRECATED');
  }, 'checkConfig'),
  YC = d(() => {
    let r = {};
    ui && (r = ht(r, ui));
    for (const t of nr) r = ht(r, t);
    return r;
  }, 'getUserDefinedConfig'),
  kt = d(
    (r) => (
      r.flowchart?.htmlLabels != null && ta('FLOWCHART_HTML_LABELS_DEPRECATED'),
      jt(r.htmlLabels ?? r.flowchart?.htmlLabels ?? !0)
    ),
    'getEffectiveHtmlLabels',
  ),
  Jr = /<br\s*\/?>/gi,
  zc = d((r) => (r ? oa(r).replace(/\\n/g, '#br#').split('#br#') : ['']), 'getRows'),
  Nc = (() => {
    let r = !1;
    return () => {
      r || (ia(), (r = !0));
    };
  })();
function ia() {
  const r = 'data-temp-href-target';
  (Mr.addHook('beforeSanitizeAttributes', (t) => {
    t.tagName === 'A' &&
      t.hasAttribute('target') &&
      t.setAttribute(r, t.getAttribute('target') ?? '');
  }),
    Mr.addHook('afterSanitizeAttributes', (t) => {
      t.tagName === 'A' &&
        t.hasAttribute(r) &&
        (t.setAttribute('target', t.getAttribute(r) ?? ''),
        t.removeAttribute(r),
        t.getAttribute('target') === '_blank' && t.setAttribute('rel', 'noopener'));
    }));
}
d(ia, 'setupDompurifyHooks');
var ea = d((r) => (Nc(), Mr.sanitize(r)), 'removeScript'),
  Je = d((r, t) => {
    if (kt(t)) {
      const i = t.securityLevel;
      i === 'antiscript' || i === 'strict' || i === 'sandbox'
        ? (r = ea(r))
        : i !== 'loose' &&
          ((r = oa(r)),
          (r = r.replace(/</g, '&lt;').replace(/>/g, '&gt;')),
          (r = r.replace(/=/g, '&equals;')),
          (r = Xc(r)));
    }
    return r;
  }, 'sanitizeMore'),
  At = d(
    (r, t) =>
      r &&
      (t.dompurifyConfig
        ? (r = Mr.sanitize(Je(r, t), t.dompurifyConfig).toString())
        : (r = Mr.sanitize(Je(r, t), { FORBID_TAGS: ['style'] }).toString()),
      r),
    'sanitizeText',
  ),
  Hc = d(
    (r, t) => (typeof r == 'string' ? At(r, t) : r.flat().map((i) => At(i, t))),
    'sanitizeTextOrArray',
  ),
  Yc = d((r) => Jr.test(r), 'hasBreaks'),
  jc = d((r) => r.split(Jr), 'splitBreaks'),
  Xc = d((r) => r.replace(/#br#/g, '<br/>'), 'placeholderToBreak'),
  oa = d((r) => r.replace(Jr, '#br#'), 'breakToPlaceholder'),
  Uc = d((r) => {
    let t = '';
    return (
      r &&
        ((t =
          window.location.protocol +
          '//' +
          window.location.host +
          window.location.pathname +
          window.location.search),
        (t = CSS.escape(t))),
      t
    );
  }, 'getUrl'),
  Vc = d(function (...r) {
    const t = r.filter((i) => !isNaN(i));
    return Math.max(...t);
  }, 'getMax'),
  Gc = d(function (...r) {
    const t = r.filter((i) => !isNaN(i));
    return Math.min(...t);
  }, 'getMin'),
  to = d(function (r) {
    const t = r.split(/(,)/),
      i = [];
    for (let e = 0; e < t.length; e++) {
      let o = t[e];
      if (o === ',' && e > 0 && e + 1 < t.length) {
        const a = t[e - 1],
          s = t[e + 1];
        Kc(a, s) && ((o = a + ',' + s), e++, i.pop());
      }
      i.push(Qc(o));
    }
    return i.join('');
  }, 'parseGenericTypes'),
  Hi = d((r, t) => Math.max(0, r.split(t).length - 1), 'countOccurrence'),
  Kc = d((r, t) => {
    const i = Hi(r, '~'),
      e = Hi(t, '~');
    return i === 1 && e === 1;
  }, 'shouldCombineSets'),
  Qc = d((r) => {
    const t = Hi(r, '~');
    let i = !1;
    if (t <= 1) return r;
    t % 2 !== 0 && r.startsWith('~') && ((r = r.substring(1)), (i = !0));
    const e = [...r];
    let o = e.indexOf('~'),
      a = e.lastIndexOf('~');
    for (; o !== -1 && a !== -1 && o !== a; )
      ((e[o] = '<'), (e[a] = '>'), (o = e.indexOf('~')), (a = e.lastIndexOf('~')));
    return (i && e.unshift('~'), e.join(''));
  }, 'processSet'),
  ro = d(() => window.MathMLElement !== void 0, 'isMathMLSupported'),
  Yi = /\$\$(.*)\$\$/g,
  Xr = d((r) => (r.match(Yi)?.length ?? 0) > 0, 'hasKatex'),
  jC = d(async (r, t) => {
    const i = document.createElement('div');
    ((i.innerHTML = await aa(r, t)),
      (i.id = 'katex-temp'),
      (i.style.visibility = 'hidden'),
      (i.style.position = 'absolute'),
      (i.style.top = '0'),
      document.querySelector('body')?.insertAdjacentElement('beforeend', i));
    const o = { width: i.clientWidth, height: i.clientHeight };
    return (i.remove(), o);
  }, 'calculateMathMLDimensions'),
  Zc = d(async (r, t) => {
    if (!Xr(r)) return r;
    if (!(ro() || t.legacyMathML || t.forceLegacyMathML))
      return r.replace(Yi, 'MathML is unsupported in this environment.');
    {
      const { default: i } = await tt(
          async () => {
            const { default: o } = await import('./katex-DHMw6HUq.js');
            return { default: o };
          },
          [],
          import.meta.url,
        ),
        e = t.forceLegacyMathML || (!ro() && t.legacyMathML) ? 'htmlAndMathml' : 'mathml';
      return r
        .split(Jr)
        .map((o) =>
          Xr(o)
            ? `<div style="display: flex; align-items: center; justify-content: center; white-space: nowrap;">${o}</div>`
            : `<div>${o}</div>`,
        )
        .join('')
        .replace(Yi, (o, a) =>
          i
            .renderToString(a, { throwOnError: !0, displayMode: !0, output: e })
            .replace(/\n/g, ' ')
            .replace(/<annotation.*<\/annotation>/g, ''),
        );
    }
  }, 'renderKatexUnsanitized'),
  aa = d(async (r, t) => At(await Zc(r, t), t), 'renderKatexSanitized'),
  ti = {
    getRows: zc,
    sanitizeText: At,
    sanitizeTextOrArray: Hc,
    hasBreaks: Yc,
    splitBreaks: jc,
    lineBreakRegex: Jr,
    removeScript: ea,
    getUrl: Uc,
    evaluate: jt,
    getMax: Vc,
    getMin: Gc,
  },
  Jc = d(function (r, t) {
    for (let i of t) r.attr(i[0], i[1]);
  }, 'd3Attrs'),
  td = d(function (r, t, i) {
    let e = new Map();
    return (
      i
        ? (e.set('width', '100%'), e.set('style', `max-width: ${t}px;`))
        : (e.set('height', r), e.set('width', t)),
      e
    );
  }, 'calculateSvgSizeAttrs'),
  sa = d(function (r, t, i, e) {
    const o = td(t, i, e);
    Jc(r, o);
  }, 'configureSvgSize'),
  rd = d(function (r, t, i, e) {
    const o = t.node().getBBox(),
      a = o.width,
      s = o.height;
    F.info(`SVG bounds: ${a}x${s}`, o);
    let l = 0,
      n = 0;
    (F.info(`Graph bounds: ${l}x${n}`, r),
      (l = a + i * 2),
      (n = s + i * 2),
      F.info(`Calculated bounds: ${l}x${n}`),
      sa(t, n, l, e));
    const g = `${o.x - i} ${o.y - i} ${o.width + 2 * i} ${o.height + 2 * i}`;
    t.attr('viewBox', g);
  }, 'setupGraphViewbox'),
  li = {};
function ji(r) {
  return [...r.cssRules].map((t) => t.cssText).join(`
`);
}
d(ji, 'cssStyleSheetToString');
var id = d((r, t, i, e) => {
    let o = '';
    return (
      r in li && li[r] ? (o = li[r]({ ...i, svgId: e })) : F.warn(`No theme found for ${r}`),
      ` & {
    font-family: ${i.fontFamily};
    font-size: ${i.fontSize};
    fill: ${i.textColor}
  }
  @keyframes edge-animation-frame {
    from {
      stroke-dashoffset: 0;
    }
  }
  @keyframes dash {
    to {
      stroke-dashoffset: 0;
    }
  }
  & .edge-animation-slow {
    stroke-dasharray: 9,5 !important;
    stroke-dashoffset: 900;
    animation: dash 50s linear infinite;
    stroke-linecap: round;
  }
  & .edge-animation-fast {
    stroke-dasharray: 9,5 !important;
    stroke-dashoffset: 900;
    animation: dash 20s linear infinite;
    stroke-linecap: round;
  }
  /* Classes common for multiple diagrams */

  & .error-icon {
    fill: ${i.errorBkgColor};
  }
  & .error-text {
    fill: ${i.errorTextColor};
    stroke: ${i.errorTextColor};
  }

  & .edge-thickness-normal {
    stroke-width: ${i.strokeWidth ?? 1}px;
  }
  & .edge-thickness-thick {
    stroke-width: 3.5px
  }
  & .edge-pattern-solid {
    stroke-dasharray: 0;
  }
  & .edge-thickness-invisible {
    stroke-width: 0;
    fill: none;
  }
  & .edge-pattern-dashed{
    stroke-dasharray: 3;
  }
  .edge-pattern-dotted {
    stroke-dasharray: 2;
  }

  & .marker {
    fill: ${i.lineColor};
    stroke: ${i.lineColor};
  }
  & .marker.cross {
    stroke: ${i.lineColor};
  }

  & svg {
    font-family: ${i.fontFamily};
    font-size: ${i.fontSize};
  }
   & p {
    margin: 0
   }

  ${o}
  .node .neo-node {
    stroke: ${i.nodeBorder};
  }

  [data-look="neo"].node rect, [data-look="neo"].cluster rect, [data-look="neo"].node polygon {
    stroke: ${i.useGradient ? 'url(' + e + '-gradient)' : i.nodeBorder};
    filter: ${i.dropShadow ? i.dropShadow.replace('url(#drop-shadow)', `url(${e}-drop-shadow)`) : 'none'};
  }


  [data-look="neo"].node path {
    stroke: ${i.useGradient ? 'url(' + e + '-gradient)' : i.nodeBorder};
    stroke-width: ${i.strokeWidth ?? 1}px;
  }

  [data-look="neo"].node .outer-path {
    filter: ${i.dropShadow ? i.dropShadow.replace('url(#drop-shadow)', `url(${e}-drop-shadow)`) : 'none'};
  }

  [data-look="neo"].node .neo-line path {
    stroke: ${i.nodeBorder};
    filter: none;
  }

  [data-look="neo"].node circle{
    stroke: ${i.useGradient ? 'url(' + e + '-gradient)' : i.nodeBorder};
    filter: ${i.dropShadow ? i.dropShadow.replace('url(#drop-shadow)', `url(${e}-drop-shadow)`) : 'none'};
  }

  [data-look="neo"].node circle .state-start{
    fill: #000000;
  }

  [data-look="neo"].icon-shape .icon {
    fill: ${i.useGradient ? 'url(' + e + '-gradient)' : i.nodeBorder};
    filter: ${i.dropShadow ? i.dropShadow.replace('url(#drop-shadow)', `url(${e}-drop-shadow)`) : 'none'};
  }

    [data-look="neo"].icon-shape .icon-neo path {
    stroke: ${i.useGradient ? 'url(' + e + '-gradient)' : i.nodeBorder};
    filter: ${i.dropShadow ? i.dropShadow.replace('url(#drop-shadow)', `url(${e}-drop-shadow)`) : 'none'};
  }

  ${t}
`
    );
  }, 'getStyles'),
  ed = d((r, t) => {
    t !== void 0 && (li[r] = t);
  }, 'addStylesForDiagram'),
  od = id,
  la = {};
cc(la, {
  clear: () => ad,
  getAccDescription: () => hd,
  getAccTitle: () => ld,
  getDiagramTitle: () => dd,
  setAccDescription: () => nd,
  setAccTitle: () => sd,
  setDiagramTitle: () => cd,
});
var ke = '',
  Be = '',
  Te = '',
  Se = d((r) => At(r, at()), 'sanitizeText'),
  ad = d(() => {
    ((ke = ''), (Te = ''), (Be = ''));
  }, 'clear'),
  sd = d((r) => {
    ke = Se(r).replace(/^\s+/g, '');
  }, 'setAccTitle'),
  ld = d(() => ke, 'getAccTitle'),
  nd = d((r) => {
    Te = Se(r).replace(
      /\n\s+/g,
      `
`,
    );
  }, 'setAccDescription'),
  hd = d(() => Te, 'getAccDescription'),
  cd = d((r) => {
    Be = Se(r);
  }, 'setDiagramTitle'),
  dd = d(() => Be, 'getDiagramTitle'),
  io = F,
  gd = xe,
  it = at,
  XC = Zo,
  UC = Or,
  we = d((r) => At(r, it()), 'sanitizeText'),
  ud = rd,
  pd = d(() => la, 'getCommonDb'),
  fi = {},
  mi = d((r, t, i) => {
    (fi[r] && io.warn(`Diagram with id ${r} already registered. Overwriting.`),
      (fi[r] = t),
      i && Xo(r, i),
      ed(r, t.styles),
      t.injectUtils?.(io, gd, it, we, ud, pd(), () => {}));
  }, 'registerDiagram'),
  Xi = d((r) => {
    if (r in fi) return fi[r];
    throw new fd(r);
  }, 'getDiagram'),
  Ar,
  fd =
    ((Ar = class extends Error {
      constructor(t) {
        super(`Diagram ${t} not found.`);
      }
    }),
    d(Ar, 'DiagramNotFoundError'),
    Ar),
  md = d((r) => {
    const { securityLevel: t } = it();
    let i = K('body');
    if (t === 'sandbox') {
      const a = K(`#i${r}`).node()?.contentDocument ?? document;
      i = K(a.body);
    }
    return i.select(`#${r}`);
  }, 'selectSvgElement');
function ve(r) {
  return typeof r > 'u' || r === null;
}
d(ve, 'isNothing');
function na(r) {
  return typeof r == 'object' && r !== null;
}
d(na, 'isObject');
function ha(r) {
  return Array.isArray(r) ? r : ve(r) ? [] : [r];
}
d(ha, 'toArray');
function ca(r, t) {
  var i, e, o, a;
  if (t) for (a = Object.keys(t), i = 0, e = a.length; i < e; i += 1) ((o = a[i]), (r[o] = t[o]));
  return r;
}
d(ca, 'extend');
function da(r, t) {
  var i = '',
    e;
  for (e = 0; e < t; e += 1) i += r;
  return i;
}
d(da, 'repeat');
function ga(r) {
  return r === 0 && Number.NEGATIVE_INFINITY === 1 / r;
}
d(ga, 'isNegativeZero');
var Cd = ve,
  yd = na,
  xd = ha,
  bd = da,
  kd = ga,
  Bd = ca,
  ct = { isNothing: Cd, isObject: yd, toArray: xd, repeat: bd, isNegativeZero: kd, extend: Bd };
function Le(r, t) {
  var i = '',
    e = r.reason || '(unknown reason)';
  return r.mark
    ? (r.mark.name && (i += 'in "' + r.mark.name + '" '),
      (i += '(' + (r.mark.line + 1) + ':' + (r.mark.column + 1) + ')'),
      !t &&
        r.mark.snippet &&
        (i +=
          `

` + r.mark.snippet),
      e + ' ' + i)
    : e;
}
d(Le, 'formatError');
function Ir(r, t) {
  (Error.call(this),
    (this.name = 'YAMLException'),
    (this.reason = r),
    (this.mark = t),
    (this.message = Le(this, !1)),
    Error.captureStackTrace
      ? Error.captureStackTrace(this, this.constructor)
      : (this.stack = new Error().stack || ''));
}
d(Ir, 'YAMLException$1');
Ir.prototype = Object.create(Error.prototype);
Ir.prototype.constructor = Ir;
Ir.prototype.toString = d(function (t) {
  return this.name + ': ' + Le(this, t);
}, 'toString');
var St = Ir;
function ni(r, t, i, e, o) {
  var a = '',
    s = '',
    l = Math.floor(o / 2) - 1;
  return (
    e - t > l && ((a = ' ... '), (t = e - l + a.length)),
    i - e > l && ((s = ' ...'), (i = e + l - s.length)),
    { str: a + r.slice(t, i).replace(/\t/g, '→') + s, pos: e - t + a.length }
  );
}
d(ni, 'getLine');
function hi(r, t) {
  return ct.repeat(' ', t - r.length) + r;
}
d(hi, 'padStart');
function ua(r, t) {
  if (((t = Object.create(t || null)), !r.buffer)) return null;
  (t.maxLength || (t.maxLength = 79),
    typeof t.indent != 'number' && (t.indent = 1),
    typeof t.linesBefore != 'number' && (t.linesBefore = 3),
    typeof t.linesAfter != 'number' && (t.linesAfter = 2));
  for (var i = /\r?\n|\r|\0/g, e = [0], o = [], a, s = -1; (a = i.exec(r.buffer)); )
    (o.push(a.index),
      e.push(a.index + a[0].length),
      r.position <= a.index && s < 0 && (s = e.length - 2));
  s < 0 && (s = e.length - 1);
  var l = '',
    n,
    g,
    c = Math.min(r.line + t.linesAfter, o.length).toString().length,
    h = t.maxLength - (t.indent + c + 3);
  for (n = 1; n <= t.linesBefore && !(s - n < 0); n++)
    ((g = ni(r.buffer, e[s - n], o[s - n], r.position - (e[s] - e[s - n]), h)),
      (l =
        ct.repeat(' ', t.indent) +
        hi((r.line - n + 1).toString(), c) +
        ' | ' +
        g.str +
        `
` +
        l));
  for (
    g = ni(r.buffer, e[s], o[s], r.position, h),
      l +=
        ct.repeat(' ', t.indent) +
        hi((r.line + 1).toString(), c) +
        ' | ' +
        g.str +
        `
`,
      l +=
        ct.repeat('-', t.indent + c + 3 + g.pos) +
        `^
`,
      n = 1;
    n <= t.linesAfter && !(s + n >= o.length);
    n++
  )
    ((g = ni(r.buffer, e[s + n], o[s + n], r.position - (e[s] - e[s + n]), h)),
      (l +=
        ct.repeat(' ', t.indent) +
        hi((r.line + n + 1).toString(), c) +
        ' | ' +
        g.str +
        `
`));
  return l.replace(/\n$/, '');
}
d(ua, 'makeSnippet');
var Td = ua,
  Sd = [
    'kind',
    'multi',
    'resolve',
    'construct',
    'instanceOf',
    'predicate',
    'represent',
    'representName',
    'defaultStyle',
    'styleAliases',
  ],
  wd = ['scalar', 'sequence', 'mapping'];
function pa(r) {
  var t = {};
  return (
    r !== null &&
      Object.keys(r).forEach(function (i) {
        r[i].forEach(function (e) {
          t[String(e)] = i;
        });
      }),
    t
  );
}
d(pa, 'compileStyleAliases');
function fa(r, t) {
  if (
    ((t = t || {}),
    Object.keys(t).forEach(function (i) {
      if (Sd.indexOf(i) === -1)
        throw new St('Unknown option "' + i + '" is met in definition of "' + r + '" YAML type.');
    }),
    (this.options = t),
    (this.tag = r),
    (this.kind = t.kind || null),
    (this.resolve =
      t.resolve ||
      function () {
        return !0;
      }),
    (this.construct =
      t.construct ||
      function (i) {
        return i;
      }),
    (this.instanceOf = t.instanceOf || null),
    (this.predicate = t.predicate || null),
    (this.represent = t.represent || null),
    (this.representName = t.representName || null),
    (this.defaultStyle = t.defaultStyle || null),
    (this.multi = t.multi || !1),
    (this.styleAliases = pa(t.styleAliases || null)),
    wd.indexOf(this.kind) === -1)
  )
    throw new St('Unknown kind "' + this.kind + '" is specified for "' + r + '" YAML type.');
}
d(fa, 'Type$1');
var mt = fa;
function Ui(r, t) {
  var i = [];
  return (
    r[t].forEach(function (e) {
      var o = i.length;
      (i.forEach(function (a, s) {
        a.tag === e.tag && a.kind === e.kind && a.multi === e.multi && (o = s);
      }),
        (i[o] = e));
    }),
    i
  );
}
d(Ui, 'compileList');
function ma() {
  var r = {
      scalar: {},
      sequence: {},
      mapping: {},
      fallback: {},
      multi: { scalar: [], sequence: [], mapping: [], fallback: [] },
    },
    t,
    i;
  function e(o) {
    o.multi
      ? (r.multi[o.kind].push(o), r.multi.fallback.push(o))
      : (r[o.kind][o.tag] = r.fallback[o.tag] = o);
  }
  for (d(e, 'collectType'), t = 0, i = arguments.length; t < i; t += 1) arguments[t].forEach(e);
  return r;
}
d(ma, 'compileMap');
function Ci(r) {
  return this.extend(r);
}
d(Ci, 'Schema$1');
Ci.prototype.extend = d(function (t) {
  var i = [],
    e = [];
  if (t instanceof mt) e.push(t);
  else if (Array.isArray(t)) e = e.concat(t);
  else if (t && (Array.isArray(t.implicit) || Array.isArray(t.explicit)))
    (t.implicit && (i = i.concat(t.implicit)), t.explicit && (e = e.concat(t.explicit)));
  else
    throw new St(
      'Schema.extend argument should be a Type, [ Type ], or a schema definition ({ implicit: [...], explicit: [...] })',
    );
  (i.forEach(function (a) {
    if (!(a instanceof mt))
      throw new St(
        'Specified list of YAML types (or a single Type object) contains a non-Type object.',
      );
    if (a.loadKind && a.loadKind !== 'scalar')
      throw new St(
        'There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.',
      );
    if (a.multi)
      throw new St(
        'There is a multi type in the implicit list of a schema. Multi tags can only be listed as explicit.',
      );
  }),
    e.forEach(function (a) {
      if (!(a instanceof mt))
        throw new St(
          'Specified list of YAML types (or a single Type object) contains a non-Type object.',
        );
    }));
  var o = Object.create(Ci.prototype);
  return (
    (o.implicit = (this.implicit || []).concat(i)),
    (o.explicit = (this.explicit || []).concat(e)),
    (o.compiledImplicit = Ui(o, 'implicit')),
    (o.compiledExplicit = Ui(o, 'explicit')),
    (o.compiledTypeMap = ma(o.compiledImplicit, o.compiledExplicit)),
    o
  );
}, 'extend');
var vd = Ci,
  Ld = new mt('tag:yaml.org,2002:str', {
    kind: 'scalar',
    construct: d(function (r) {
      return r !== null ? r : '';
    }, 'construct'),
  }),
  Fd = new mt('tag:yaml.org,2002:seq', {
    kind: 'sequence',
    construct: d(function (r) {
      return r !== null ? r : [];
    }, 'construct'),
  }),
  _d = new mt('tag:yaml.org,2002:map', {
    kind: 'mapping',
    construct: d(function (r) {
      return r !== null ? r : {};
    }, 'construct'),
  }),
  Ad = new vd({ explicit: [Ld, Fd, _d] });
function Ca(r) {
  if (r === null) return !0;
  var t = r.length;
  return (t === 1 && r === '~') || (t === 4 && (r === 'null' || r === 'Null' || r === 'NULL'));
}
d(Ca, 'resolveYamlNull');
function ya() {
  return null;
}
d(ya, 'constructYamlNull');
function xa(r) {
  return r === null;
}
d(xa, 'isNull');
var Ed = new mt('tag:yaml.org,2002:null', {
  kind: 'scalar',
  resolve: Ca,
  construct: ya,
  predicate: xa,
  represent: {
    canonical: d(function () {
      return '~';
    }, 'canonical'),
    lowercase: d(function () {
      return 'null';
    }, 'lowercase'),
    uppercase: d(function () {
      return 'NULL';
    }, 'uppercase'),
    camelcase: d(function () {
      return 'Null';
    }, 'camelcase'),
    empty: d(function () {
      return '';
    }, 'empty'),
  },
  defaultStyle: 'lowercase',
});
function ba(r) {
  if (r === null) return !1;
  var t = r.length;
  return (
    (t === 4 && (r === 'true' || r === 'True' || r === 'TRUE')) ||
    (t === 5 && (r === 'false' || r === 'False' || r === 'FALSE'))
  );
}
d(ba, 'resolveYamlBoolean');
function ka(r) {
  return r === 'true' || r === 'True' || r === 'TRUE';
}
d(ka, 'constructYamlBoolean');
function Ba(r) {
  return Object.prototype.toString.call(r) === '[object Boolean]';
}
d(Ba, 'isBoolean');
var Md = new mt('tag:yaml.org,2002:bool', {
  kind: 'scalar',
  resolve: ba,
  construct: ka,
  predicate: Ba,
  represent: {
    lowercase: d(function (r) {
      return r ? 'true' : 'false';
    }, 'lowercase'),
    uppercase: d(function (r) {
      return r ? 'TRUE' : 'FALSE';
    }, 'uppercase'),
    camelcase: d(function (r) {
      return r ? 'True' : 'False';
    }, 'camelcase'),
  },
  defaultStyle: 'lowercase',
});
function Ta(r) {
  return (48 <= r && r <= 57) || (65 <= r && r <= 70) || (97 <= r && r <= 102);
}
d(Ta, 'isHexCode');
function Sa(r) {
  return 48 <= r && r <= 55;
}
d(Sa, 'isOctCode');
function wa(r) {
  return 48 <= r && r <= 57;
}
d(wa, 'isDecCode');
function va(r) {
  if (r === null) return !1;
  var t = r.length,
    i = 0,
    e = !1,
    o;
  if (!t) return !1;
  if (((o = r[i]), (o === '-' || o === '+') && (o = r[++i]), o === '0')) {
    if (i + 1 === t) return !0;
    if (((o = r[++i]), o === 'b')) {
      for (i++; i < t; i++)
        if (((o = r[i]), o !== '_')) {
          if (o !== '0' && o !== '1') return !1;
          e = !0;
        }
      return e && o !== '_';
    }
    if (o === 'x') {
      for (i++; i < t; i++)
        if (((o = r[i]), o !== '_')) {
          if (!Ta(r.charCodeAt(i))) return !1;
          e = !0;
        }
      return e && o !== '_';
    }
    if (o === 'o') {
      for (i++; i < t; i++)
        if (((o = r[i]), o !== '_')) {
          if (!Sa(r.charCodeAt(i))) return !1;
          e = !0;
        }
      return e && o !== '_';
    }
  }
  if (o === '_') return !1;
  for (; i < t; i++)
    if (((o = r[i]), o !== '_')) {
      if (!wa(r.charCodeAt(i))) return !1;
      e = !0;
    }
  return !(!e || o === '_');
}
d(va, 'resolveYamlInteger');
function La(r) {
  var t = r,
    i = 1,
    e;
  if (
    (t.indexOf('_') !== -1 && (t = t.replace(/_/g, '')),
    (e = t[0]),
    (e === '-' || e === '+') && (e === '-' && (i = -1), (t = t.slice(1)), (e = t[0])),
    t === '0')
  )
    return 0;
  if (e === '0') {
    if (t[1] === 'b') return i * parseInt(t.slice(2), 2);
    if (t[1] === 'x') return i * parseInt(t.slice(2), 16);
    if (t[1] === 'o') return i * parseInt(t.slice(2), 8);
  }
  return i * parseInt(t, 10);
}
d(La, 'constructYamlInteger');
function Fa(r) {
  return (
    Object.prototype.toString.call(r) === '[object Number]' && r % 1 === 0 && !ct.isNegativeZero(r)
  );
}
d(Fa, 'isInteger');
var Od = new mt('tag:yaml.org,2002:int', {
    kind: 'scalar',
    resolve: va,
    construct: La,
    predicate: Fa,
    represent: {
      binary: d(function (r) {
        return r >= 0 ? '0b' + r.toString(2) : '-0b' + r.toString(2).slice(1);
      }, 'binary'),
      octal: d(function (r) {
        return r >= 0 ? '0o' + r.toString(8) : '-0o' + r.toString(8).slice(1);
      }, 'octal'),
      decimal: d(function (r) {
        return r.toString(10);
      }, 'decimal'),
      hexadecimal: d(function (r) {
        return r >= 0
          ? '0x' + r.toString(16).toUpperCase()
          : '-0x' + r.toString(16).toUpperCase().slice(1);
      }, 'hexadecimal'),
    },
    defaultStyle: 'decimal',
    styleAliases: {
      binary: [2, 'bin'],
      octal: [8, 'oct'],
      decimal: [10, 'dec'],
      hexadecimal: [16, 'hex'],
    },
  }),
  Id = new RegExp(
    '^(?:[-+]?(?:[0-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$',
  );
function _a(r) {
  return !(r === null || !Id.test(r) || r[r.length - 1] === '_');
}
d(_a, 'resolveYamlFloat');
function Aa(r) {
  var t, i;
  return (
    (t = r.replace(/_/g, '').toLowerCase()),
    (i = t[0] === '-' ? -1 : 1),
    '+-'.indexOf(t[0]) >= 0 && (t = t.slice(1)),
    t === '.inf'
      ? i === 1
        ? Number.POSITIVE_INFINITY
        : Number.NEGATIVE_INFINITY
      : t === '.nan'
        ? NaN
        : i * parseFloat(t, 10)
  );
}
d(Aa, 'constructYamlFloat');
var Dd = /^[-+]?[0-9]+e/;
function Ea(r, t) {
  var i;
  if (isNaN(r))
    switch (t) {
      case 'lowercase':
        return '.nan';
      case 'uppercase':
        return '.NAN';
      case 'camelcase':
        return '.NaN';
    }
  else if (Number.POSITIVE_INFINITY === r)
    switch (t) {
      case 'lowercase':
        return '.inf';
      case 'uppercase':
        return '.INF';
      case 'camelcase':
        return '.Inf';
    }
  else if (Number.NEGATIVE_INFINITY === r)
    switch (t) {
      case 'lowercase':
        return '-.inf';
      case 'uppercase':
        return '-.INF';
      case 'camelcase':
        return '-.Inf';
    }
  else if (ct.isNegativeZero(r)) return '-0.0';
  return ((i = r.toString(10)), Dd.test(i) ? i.replace('e', '.e') : i);
}
d(Ea, 'representYamlFloat');
function Ma(r) {
  return (
    Object.prototype.toString.call(r) === '[object Number]' && (r % 1 !== 0 || ct.isNegativeZero(r))
  );
}
d(Ma, 'isFloat');
var $d = new mt('tag:yaml.org,2002:float', {
    kind: 'scalar',
    resolve: _a,
    construct: Aa,
    predicate: Ma,
    represent: Ea,
    defaultStyle: 'lowercase',
  }),
  Oa = Ad.extend({ implicit: [Ed, Md, Od, $d] }),
  Pd = Oa,
  Ia = new RegExp('^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$'),
  Da = new RegExp(
    '^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$',
  );
function $a(r) {
  return r === null ? !1 : Ia.exec(r) !== null || Da.exec(r) !== null;
}
d($a, 'resolveYamlTimestamp');
function Pa(r) {
  var t,
    i,
    e,
    o,
    a,
    s,
    l,
    n = 0,
    g = null,
    c,
    h,
    p;
  if (((t = Ia.exec(r)), t === null && (t = Da.exec(r)), t === null))
    throw new Error('Date resolve error');
  if (((i = +t[1]), (e = +t[2] - 1), (o = +t[3]), !t[4])) return new Date(Date.UTC(i, e, o));
  if (((a = +t[4]), (s = +t[5]), (l = +t[6]), t[7])) {
    for (n = t[7].slice(0, 3); n.length < 3; ) n += '0';
    n = +n;
  }
  return (
    t[9] && ((c = +t[10]), (h = +(t[11] || 0)), (g = (c * 60 + h) * 6e4), t[9] === '-' && (g = -g)),
    (p = new Date(Date.UTC(i, e, o, a, s, l, n))),
    g && p.setTime(p.getTime() - g),
    p
  );
}
d(Pa, 'constructYamlTimestamp');
function qa(r) {
  return r.toISOString();
}
d(qa, 'representYamlTimestamp');
var qd = new mt('tag:yaml.org,2002:timestamp', {
  kind: 'scalar',
  resolve: $a,
  construct: Pa,
  instanceOf: Date,
  represent: qa,
});
function Ra(r) {
  return r === '<<' || r === null;
}
d(Ra, 'resolveYamlMerge');
var Rd = new mt('tag:yaml.org,2002:merge', { kind: 'scalar', resolve: Ra }),
  Fe = `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=
\r`;
function Wa(r) {
  if (r === null) return !1;
  var t,
    i,
    e = 0,
    o = r.length,
    a = Fe;
  for (i = 0; i < o; i++)
    if (((t = a.indexOf(r.charAt(i))), !(t > 64))) {
      if (t < 0) return !1;
      e += 6;
    }
  return e % 8 === 0;
}
d(Wa, 'resolveYamlBinary');
function za(r) {
  var t,
    i,
    e = r.replace(/[\r\n=]/g, ''),
    o = e.length,
    a = Fe,
    s = 0,
    l = [];
  for (t = 0; t < o; t++)
    (t % 4 === 0 && t && (l.push((s >> 16) & 255), l.push((s >> 8) & 255), l.push(s & 255)),
      (s = (s << 6) | a.indexOf(e.charAt(t))));
  return (
    (i = (o % 4) * 6),
    i === 0
      ? (l.push((s >> 16) & 255), l.push((s >> 8) & 255), l.push(s & 255))
      : i === 18
        ? (l.push((s >> 10) & 255), l.push((s >> 2) & 255))
        : i === 12 && l.push((s >> 4) & 255),
    new Uint8Array(l)
  );
}
d(za, 'constructYamlBinary');
function Na(r) {
  var t = '',
    i = 0,
    e,
    o,
    a = r.length,
    s = Fe;
  for (e = 0; e < a; e++)
    (e % 3 === 0 &&
      e &&
      ((t += s[(i >> 18) & 63]),
      (t += s[(i >> 12) & 63]),
      (t += s[(i >> 6) & 63]),
      (t += s[i & 63])),
      (i = (i << 8) + r[e]));
  return (
    (o = a % 3),
    o === 0
      ? ((t += s[(i >> 18) & 63]),
        (t += s[(i >> 12) & 63]),
        (t += s[(i >> 6) & 63]),
        (t += s[i & 63]))
      : o === 2
        ? ((t += s[(i >> 10) & 63]), (t += s[(i >> 4) & 63]), (t += s[(i << 2) & 63]), (t += s[64]))
        : o === 1 && ((t += s[(i >> 2) & 63]), (t += s[(i << 4) & 63]), (t += s[64]), (t += s[64])),
    t
  );
}
d(Na, 'representYamlBinary');
function Ha(r) {
  return Object.prototype.toString.call(r) === '[object Uint8Array]';
}
d(Ha, 'isBinary');
var Wd = new mt('tag:yaml.org,2002:binary', {
    kind: 'scalar',
    resolve: Wa,
    construct: za,
    predicate: Ha,
    represent: Na,
  }),
  zd = Object.prototype.hasOwnProperty,
  Nd = Object.prototype.toString;
function Ya(r) {
  if (r === null) return !0;
  var t = [],
    i,
    e,
    o,
    a,
    s,
    l = r;
  for (i = 0, e = l.length; i < e; i += 1) {
    if (((o = l[i]), (s = !1), Nd.call(o) !== '[object Object]')) return !1;
    for (a in o)
      if (zd.call(o, a))
        if (!s) s = !0;
        else return !1;
    if (!s) return !1;
    if (t.indexOf(a) === -1) t.push(a);
    else return !1;
  }
  return !0;
}
d(Ya, 'resolveYamlOmap');
function ja(r) {
  return r !== null ? r : [];
}
d(ja, 'constructYamlOmap');
var Hd = new mt('tag:yaml.org,2002:omap', { kind: 'sequence', resolve: Ya, construct: ja }),
  Yd = Object.prototype.toString;
function Xa(r) {
  if (r === null) return !0;
  var t,
    i,
    e,
    o,
    a,
    s = r;
  for (a = new Array(s.length), t = 0, i = s.length; t < i; t += 1) {
    if (((e = s[t]), Yd.call(e) !== '[object Object]' || ((o = Object.keys(e)), o.length !== 1)))
      return !1;
    a[t] = [o[0], e[o[0]]];
  }
  return !0;
}
d(Xa, 'resolveYamlPairs');
function Ua(r) {
  if (r === null) return [];
  var t,
    i,
    e,
    o,
    a,
    s = r;
  for (a = new Array(s.length), t = 0, i = s.length; t < i; t += 1)
    ((e = s[t]), (o = Object.keys(e)), (a[t] = [o[0], e[o[0]]]));
  return a;
}
d(Ua, 'constructYamlPairs');
var jd = new mt('tag:yaml.org,2002:pairs', { kind: 'sequence', resolve: Xa, construct: Ua }),
  Xd = Object.prototype.hasOwnProperty;
function Va(r) {
  if (r === null) return !0;
  var t,
    i = r;
  for (t in i) if (Xd.call(i, t) && i[t] !== null) return !1;
  return !0;
}
d(Va, 'resolveYamlSet');
function Ga(r) {
  return r !== null ? r : {};
}
d(Ga, 'constructYamlSet');
var Ud = new mt('tag:yaml.org,2002:set', { kind: 'mapping', resolve: Va, construct: Ga }),
  Ka = Pd.extend({ implicit: [qd, Rd], explicit: [Wd, Hd, jd, Ud] }),
  Qt = Object.prototype.hasOwnProperty,
  yi = 1,
  Qa = 2,
  Za = 3,
  xi = 4,
  Di = 1,
  Vd = 2,
  eo = 3,
  Gd =
    /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/,
  Kd = /[\x85\u2028\u2029]/,
  Qd = /[,\[\]\{\}]/,
  Ja = /^(?:!|!!|![a-z\-]+!)$/i,
  ts = /^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;
function Vi(r) {
  return Object.prototype.toString.call(r);
}
d(Vi, '_class');
function _t(r) {
  return r === 10 || r === 13;
}
d(_t, 'is_EOL');
function Kt(r) {
  return r === 9 || r === 32;
}
d(Kt, 'is_WHITE_SPACE');
function bt(r) {
  return r === 9 || r === 32 || r === 10 || r === 13;
}
d(bt, 'is_WS_OR_EOL');
function er(r) {
  return r === 44 || r === 91 || r === 93 || r === 123 || r === 125;
}
d(er, 'is_FLOW_INDICATOR');
function rs(r) {
  var t;
  return 48 <= r && r <= 57 ? r - 48 : ((t = r | 32), 97 <= t && t <= 102 ? t - 97 + 10 : -1);
}
d(rs, 'fromHexCode');
function is(r) {
  return r === 120 ? 2 : r === 117 ? 4 : r === 85 ? 8 : 0;
}
d(is, 'escapedHexLen');
function es(r) {
  return 48 <= r && r <= 57 ? r - 48 : -1;
}
d(es, 'fromDecimalCode');
function Gi(r) {
  return r === 48
    ? '\0'
    : r === 97
      ? '\x07'
      : r === 98
        ? '\b'
        : r === 116 || r === 9
          ? '	'
          : r === 110
            ? `
`
            : r === 118
              ? '\v'
              : r === 102
                ? '\f'
                : r === 114
                  ? '\r'
                  : r === 101
                    ? '\x1B'
                    : r === 32
                      ? ' '
                      : r === 34
                        ? '"'
                        : r === 47
                          ? '/'
                          : r === 92
                            ? '\\'
                            : r === 78
                              ? ''
                              : r === 95
                                ? ' '
                                : r === 76
                                  ? '\u2028'
                                  : r === 80
                                    ? '\u2029'
                                    : '';
}
d(Gi, 'simpleEscapeSequence');
function os(r) {
  return r <= 65535
    ? String.fromCharCode(r)
    : String.fromCharCode(((r - 65536) >> 10) + 55296, ((r - 65536) & 1023) + 56320);
}
d(os, 'charFromCodepoint');
function _e(r, t, i) {
  t === '__proto__'
    ? Object.defineProperty(r, t, { configurable: !0, enumerable: !0, writable: !0, value: i })
    : (r[t] = i);
}
d(_e, 'setProperty');
var as = new Array(256),
  ss = new Array(256);
for (rr = 0; rr < 256; rr++) ((as[rr] = Gi(rr) ? 1 : 0), (ss[rr] = Gi(rr)));
var rr;
function ls(r, t) {
  ((this.input = r),
    (this.filename = t.filename || null),
    (this.schema = t.schema || Ka),
    (this.onWarning = t.onWarning || null),
    (this.legacy = t.legacy || !1),
    (this.json = t.json || !1),
    (this.listener = t.listener || null),
    (this.implicitTypes = this.schema.compiledImplicit),
    (this.typeMap = this.schema.compiledTypeMap),
    (this.length = r.length),
    (this.position = 0),
    (this.line = 0),
    (this.lineStart = 0),
    (this.lineIndent = 0),
    (this.firstTabInLine = -1),
    (this.documents = []));
}
d(ls, 'State$1');
function Ae(r, t) {
  var i = {
    name: r.filename,
    buffer: r.input.slice(0, -1),
    position: r.position,
    line: r.line,
    column: r.position - r.lineStart,
  };
  return ((i.snippet = Td(i)), new St(t, i));
}
d(Ae, 'generateError');
function X(r, t) {
  throw Ae(r, t);
}
d(X, 'throwError');
function Ur(r, t) {
  r.onWarning && r.onWarning.call(null, Ae(r, t));
}
d(Ur, 'throwWarning');
var oo = {
  YAML: d(function (t, i, e) {
    var o, a, s;
    (t.version !== null && X(t, 'duplication of %YAML directive'),
      e.length !== 1 && X(t, 'YAML directive accepts exactly one argument'),
      (o = /^([0-9]+)\.([0-9]+)$/.exec(e[0])),
      o === null && X(t, 'ill-formed argument of the YAML directive'),
      (a = parseInt(o[1], 10)),
      (s = parseInt(o[2], 10)),
      a !== 1 && X(t, 'unacceptable YAML version of the document'),
      (t.version = e[0]),
      (t.checkLineBreaks = s < 2),
      s !== 1 && s !== 2 && Ur(t, 'unsupported YAML version of the document'));
  }, 'handleYamlDirective'),
  TAG: d(function (t, i, e) {
    var o, a;
    (e.length !== 2 && X(t, 'TAG directive accepts exactly two arguments'),
      (o = e[0]),
      (a = e[1]),
      Ja.test(o) || X(t, 'ill-formed tag handle (first argument) of the TAG directive'),
      Qt.call(t.tagMap, o) &&
        X(t, 'there is a previously declared suffix for "' + o + '" tag handle'),
      ts.test(a) || X(t, 'ill-formed tag prefix (second argument) of the TAG directive'));
    try {
      a = decodeURIComponent(a);
    } catch {
      X(t, 'tag prefix is malformed: ' + a);
    }
    t.tagMap[o] = a;
  }, 'handleTagDirective'),
};
function Nt(r, t, i, e) {
  var o, a, s, l;
  if (t < i) {
    if (((l = r.input.slice(t, i)), e))
      for (o = 0, a = l.length; o < a; o += 1)
        ((s = l.charCodeAt(o)),
          s === 9 || (32 <= s && s <= 1114111) || X(r, 'expected valid JSON character'));
    else Gd.test(l) && X(r, 'the stream contains non-printable characters');
    r.result += l;
  }
}
d(Nt, 'captureSegment');
function Ki(r, t, i, e) {
  var o, a, s, l;
  for (
    ct.isObject(i) || X(r, 'cannot merge mappings; the provided source object is unacceptable'),
      o = Object.keys(i),
      s = 0,
      l = o.length;
    s < l;
    s += 1
  )
    ((a = o[s]), Qt.call(t, a) || (_e(t, a, i[a]), (e[a] = !0)));
}
d(Ki, 'mergeMappings');
function or(r, t, i, e, o, a, s, l, n) {
  var g, c;
  if (Array.isArray(o))
    for (o = Array.prototype.slice.call(o), g = 0, c = o.length; g < c; g += 1)
      (Array.isArray(o[g]) && X(r, 'nested arrays are not supported inside keys'),
        typeof o == 'object' && Vi(o[g]) === '[object Object]' && (o[g] = '[object Object]'));
  if (
    (typeof o == 'object' && Vi(o) === '[object Object]' && (o = '[object Object]'),
    (o = String(o)),
    t === null && (t = {}),
    e === 'tag:yaml.org,2002:merge')
  )
    if (Array.isArray(a)) for (g = 0, c = a.length; g < c; g += 1) Ki(r, t, a[g], i);
    else Ki(r, t, a, i);
  else
    (!r.json &&
      !Qt.call(i, o) &&
      Qt.call(t, o) &&
      ((r.line = s || r.line),
      (r.lineStart = l || r.lineStart),
      (r.position = n || r.position),
      X(r, 'duplicated mapping key')),
      _e(t, o, a),
      delete i[o]);
  return t;
}
d(or, 'storeMappingPair');
function Li(r) {
  var t;
  ((t = r.input.charCodeAt(r.position)),
    t === 10
      ? r.position++
      : t === 13
        ? (r.position++, r.input.charCodeAt(r.position) === 10 && r.position++)
        : X(r, 'a line break is expected'),
    (r.line += 1),
    (r.lineStart = r.position),
    (r.firstTabInLine = -1));
}
d(Li, 'readLineBreak');
function lt(r, t, i) {
  for (var e = 0, o = r.input.charCodeAt(r.position); o !== 0; ) {
    for (; Kt(o); )
      (o === 9 && r.firstTabInLine === -1 && (r.firstTabInLine = r.position),
        (o = r.input.charCodeAt(++r.position)));
    if (t && o === 35)
      do o = r.input.charCodeAt(++r.position);
      while (o !== 10 && o !== 13 && o !== 0);
    if (_t(o))
      for (Li(r), o = r.input.charCodeAt(r.position), e++, r.lineIndent = 0; o === 32; )
        (r.lineIndent++, (o = r.input.charCodeAt(++r.position)));
    else break;
  }
  return (i !== -1 && e !== 0 && r.lineIndent < i && Ur(r, 'deficient indentation'), e);
}
d(lt, 'skipSeparationSpace');
function ri(r) {
  var t = r.position,
    i;
  return (
    (i = r.input.charCodeAt(t)),
    !!(
      (i === 45 || i === 46) &&
      i === r.input.charCodeAt(t + 1) &&
      i === r.input.charCodeAt(t + 2) &&
      ((t += 3), (i = r.input.charCodeAt(t)), i === 0 || bt(i))
    )
  );
}
d(ri, 'testDocumentSeparator');
function Fi(r, t) {
  t === 1
    ? (r.result += ' ')
    : t > 1 &&
      (r.result += ct.repeat(
        `
`,
        t - 1,
      ));
}
d(Fi, 'writeFoldedLines');
function ns(r, t, i) {
  var e,
    o,
    a,
    s,
    l,
    n,
    g,
    c,
    h = r.kind,
    p = r.result,
    u;
  if (
    ((u = r.input.charCodeAt(r.position)),
    bt(u) ||
      er(u) ||
      u === 35 ||
      u === 38 ||
      u === 42 ||
      u === 33 ||
      u === 124 ||
      u === 62 ||
      u === 39 ||
      u === 34 ||
      u === 37 ||
      u === 64 ||
      u === 96 ||
      ((u === 63 || u === 45) && ((o = r.input.charCodeAt(r.position + 1)), bt(o) || (i && er(o)))))
  )
    return !1;
  for (r.kind = 'scalar', r.result = '', a = s = r.position, l = !1; u !== 0; ) {
    if (u === 58) {
      if (((o = r.input.charCodeAt(r.position + 1)), bt(o) || (i && er(o)))) break;
    } else if (u === 35) {
      if (((e = r.input.charCodeAt(r.position - 1)), bt(e))) break;
    } else {
      if ((r.position === r.lineStart && ri(r)) || (i && er(u))) break;
      if (_t(u))
        if (
          ((n = r.line), (g = r.lineStart), (c = r.lineIndent), lt(r, !1, -1), r.lineIndent >= t)
        ) {
          ((l = !0), (u = r.input.charCodeAt(r.position)));
          continue;
        } else {
          ((r.position = s), (r.line = n), (r.lineStart = g), (r.lineIndent = c));
          break;
        }
    }
    (l && (Nt(r, a, s, !1), Fi(r, r.line - n), (a = s = r.position), (l = !1)),
      Kt(u) || (s = r.position + 1),
      (u = r.input.charCodeAt(++r.position)));
  }
  return (Nt(r, a, s, !1), r.result ? !0 : ((r.kind = h), (r.result = p), !1));
}
d(ns, 'readPlainScalar');
function hs(r, t) {
  var i, e, o;
  if (((i = r.input.charCodeAt(r.position)), i !== 39)) return !1;
  for (
    r.kind = 'scalar', r.result = '', r.position++, e = o = r.position;
    (i = r.input.charCodeAt(r.position)) !== 0;
  )
    if (i === 39)
      if ((Nt(r, e, r.position, !0), (i = r.input.charCodeAt(++r.position)), i === 39))
        ((e = r.position), r.position++, (o = r.position));
      else return !0;
    else
      _t(i)
        ? (Nt(r, e, o, !0), Fi(r, lt(r, !1, t)), (e = o = r.position))
        : r.position === r.lineStart && ri(r)
          ? X(r, 'unexpected end of the document within a single quoted scalar')
          : (r.position++, (o = r.position));
  X(r, 'unexpected end of the stream within a single quoted scalar');
}
d(hs, 'readSingleQuotedScalar');
function cs(r, t) {
  var i, e, o, a, s, l;
  if (((l = r.input.charCodeAt(r.position)), l !== 34)) return !1;
  for (
    r.kind = 'scalar', r.result = '', r.position++, i = e = r.position;
    (l = r.input.charCodeAt(r.position)) !== 0;
  ) {
    if (l === 34) return (Nt(r, i, r.position, !0), r.position++, !0);
    if (l === 92) {
      if ((Nt(r, i, r.position, !0), (l = r.input.charCodeAt(++r.position)), _t(l))) lt(r, !1, t);
      else if (l < 256 && as[l]) ((r.result += ss[l]), r.position++);
      else if ((s = is(l)) > 0) {
        for (o = s, a = 0; o > 0; o--)
          ((l = r.input.charCodeAt(++r.position)),
            (s = rs(l)) >= 0 ? (a = (a << 4) + s) : X(r, 'expected hexadecimal character'));
        ((r.result += os(a)), r.position++);
      } else X(r, 'unknown escape sequence');
      i = e = r.position;
    } else
      _t(l)
        ? (Nt(r, i, e, !0), Fi(r, lt(r, !1, t)), (i = e = r.position))
        : r.position === r.lineStart && ri(r)
          ? X(r, 'unexpected end of the document within a double quoted scalar')
          : (r.position++, (e = r.position));
  }
  X(r, 'unexpected end of the stream within a double quoted scalar');
}
d(cs, 'readDoubleQuotedScalar');
function ds(r, t) {
  var i = !0,
    e,
    o,
    a,
    s = r.tag,
    l,
    n = r.anchor,
    g,
    c,
    h,
    p,
    u,
    f = Object.create(null),
    C,
    x,
    y,
    b;
  if (((b = r.input.charCodeAt(r.position)), b === 91)) ((c = 93), (u = !1), (l = []));
  else if (b === 123) ((c = 125), (u = !0), (l = {}));
  else return !1;
  for (
    r.anchor !== null && (r.anchorMap[r.anchor] = l), b = r.input.charCodeAt(++r.position);
    b !== 0;
  ) {
    if ((lt(r, !0, t), (b = r.input.charCodeAt(r.position)), b === c))
      return (
        r.position++,
        (r.tag = s),
        (r.anchor = n),
        (r.kind = u ? 'mapping' : 'sequence'),
        (r.result = l),
        !0
      );
    (i
      ? b === 44 && X(r, "expected the node content, but found ','")
      : X(r, 'missed comma between flow collection entries'),
      (x = C = y = null),
      (h = p = !1),
      b === 63 &&
        ((g = r.input.charCodeAt(r.position + 1)),
        bt(g) && ((h = p = !0), r.position++, lt(r, !0, t))),
      (e = r.line),
      (o = r.lineStart),
      (a = r.position),
      hr(r, t, yi, !1, !0),
      (x = r.tag),
      (C = r.result),
      lt(r, !0, t),
      (b = r.input.charCodeAt(r.position)),
      (p || r.line === e) &&
        b === 58 &&
        ((h = !0),
        (b = r.input.charCodeAt(++r.position)),
        lt(r, !0, t),
        hr(r, t, yi, !1, !0),
        (y = r.result)),
      u ? or(r, l, f, x, C, y, e, o, a) : h ? l.push(or(r, null, f, x, C, y, e, o, a)) : l.push(C),
      lt(r, !0, t),
      (b = r.input.charCodeAt(r.position)),
      b === 44 ? ((i = !0), (b = r.input.charCodeAt(++r.position))) : (i = !1));
  }
  X(r, 'unexpected end of the stream within a flow collection');
}
d(ds, 'readFlowCollection');
function gs(r, t) {
  var i,
    e,
    o = Di,
    a = !1,
    s = !1,
    l = t,
    n = 0,
    g = !1,
    c,
    h;
  if (((h = r.input.charCodeAt(r.position)), h === 124)) e = !1;
  else if (h === 62) e = !0;
  else return !1;
  for (r.kind = 'scalar', r.result = ''; h !== 0; )
    if (((h = r.input.charCodeAt(++r.position)), h === 43 || h === 45))
      Di === o ? (o = h === 43 ? eo : Vd) : X(r, 'repeat of a chomping mode identifier');
    else if ((c = es(h)) >= 0)
      c === 0
        ? X(r, 'bad explicit indentation width of a block scalar; it cannot be less than one')
        : s
          ? X(r, 'repeat of an indentation width identifier')
          : ((l = t + c - 1), (s = !0));
    else break;
  if (Kt(h)) {
    do h = r.input.charCodeAt(++r.position);
    while (Kt(h));
    if (h === 35)
      do h = r.input.charCodeAt(++r.position);
      while (!_t(h) && h !== 0);
  }
  for (; h !== 0; ) {
    for (
      Li(r), r.lineIndent = 0, h = r.input.charCodeAt(r.position);
      (!s || r.lineIndent < l) && h === 32;
    )
      (r.lineIndent++, (h = r.input.charCodeAt(++r.position)));
    if ((!s && r.lineIndent > l && (l = r.lineIndent), _t(h))) {
      n++;
      continue;
    }
    if (r.lineIndent < l) {
      o === eo
        ? (r.result += ct.repeat(
            `
`,
            a ? 1 + n : n,
          ))
        : o === Di &&
          a &&
          (r.result += `
`);
      break;
    }
    for (
      e
        ? Kt(h)
          ? ((g = !0),
            (r.result += ct.repeat(
              `
`,
              a ? 1 + n : n,
            )))
          : g
            ? ((g = !1),
              (r.result += ct.repeat(
                `
`,
                n + 1,
              )))
            : n === 0
              ? a && (r.result += ' ')
              : (r.result += ct.repeat(
                  `
`,
                  n,
                ))
        : (r.result += ct.repeat(
            `
`,
            a ? 1 + n : n,
          )),
        a = !0,
        s = !0,
        n = 0,
        i = r.position;
      !_t(h) && h !== 0;
    )
      h = r.input.charCodeAt(++r.position);
    Nt(r, i, r.position, !1);
  }
  return !0;
}
d(gs, 'readBlockScalar');
function Qi(r, t) {
  var i,
    e = r.tag,
    o = r.anchor,
    a = [],
    s,
    l = !1,
    n;
  if (r.firstTabInLine !== -1) return !1;
  for (
    r.anchor !== null && (r.anchorMap[r.anchor] = a), n = r.input.charCodeAt(r.position);
    n !== 0 &&
    (r.firstTabInLine !== -1 &&
      ((r.position = r.firstTabInLine), X(r, 'tab characters must not be used in indentation')),
    !(n !== 45 || ((s = r.input.charCodeAt(r.position + 1)), !bt(s))));
  ) {
    if (((l = !0), r.position++, lt(r, !0, -1) && r.lineIndent <= t)) {
      (a.push(null), (n = r.input.charCodeAt(r.position)));
      continue;
    }
    if (
      ((i = r.line),
      hr(r, t, Za, !1, !0),
      a.push(r.result),
      lt(r, !0, -1),
      (n = r.input.charCodeAt(r.position)),
      (r.line === i || r.lineIndent > t) && n !== 0)
    )
      X(r, 'bad indentation of a sequence entry');
    else if (r.lineIndent < t) break;
  }
  return l ? ((r.tag = e), (r.anchor = o), (r.kind = 'sequence'), (r.result = a), !0) : !1;
}
d(Qi, 'readBlockSequence');
function us(r, t, i) {
  var e,
    o,
    a,
    s,
    l,
    n,
    g = r.tag,
    c = r.anchor,
    h = {},
    p = Object.create(null),
    u = null,
    f = null,
    C = null,
    x = !1,
    y = !1,
    b;
  if (r.firstTabInLine !== -1) return !1;
  for (
    r.anchor !== null && (r.anchorMap[r.anchor] = h), b = r.input.charCodeAt(r.position);
    b !== 0;
  ) {
    if (
      (!x &&
        r.firstTabInLine !== -1 &&
        ((r.position = r.firstTabInLine), X(r, 'tab characters must not be used in indentation')),
      (e = r.input.charCodeAt(r.position + 1)),
      (a = r.line),
      (b === 63 || b === 58) && bt(e))
    )
      (b === 63
        ? (x && (or(r, h, p, u, f, null, s, l, n), (u = f = C = null)),
          (y = !0),
          (x = !0),
          (o = !0))
        : x
          ? ((x = !1), (o = !0))
          : X(
              r,
              'incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line',
            ),
        (r.position += 1),
        (b = e));
    else {
      if (((s = r.line), (l = r.lineStart), (n = r.position), !hr(r, i, Qa, !1, !0))) break;
      if (r.line === a) {
        for (b = r.input.charCodeAt(r.position); Kt(b); ) b = r.input.charCodeAt(++r.position);
        if (b === 58)
          ((b = r.input.charCodeAt(++r.position)),
            bt(b) ||
              X(
                r,
                'a whitespace character is expected after the key-value separator within a block mapping',
              ),
            x && (or(r, h, p, u, f, null, s, l, n), (u = f = C = null)),
            (y = !0),
            (x = !1),
            (o = !1),
            (u = r.tag),
            (f = r.result));
        else if (y) X(r, 'can not read an implicit mapping pair; a colon is missed');
        else return ((r.tag = g), (r.anchor = c), !0);
      } else if (y)
        X(r, 'can not read a block mapping entry; a multiline key may not be an implicit key');
      else return ((r.tag = g), (r.anchor = c), !0);
    }
    if (
      ((r.line === a || r.lineIndent > t) &&
        (x && ((s = r.line), (l = r.lineStart), (n = r.position)),
        hr(r, t, xi, !0, o) && (x ? (f = r.result) : (C = r.result)),
        x || (or(r, h, p, u, f, C, s, l, n), (u = f = C = null)),
        lt(r, !0, -1),
        (b = r.input.charCodeAt(r.position))),
      (r.line === a || r.lineIndent > t) && b !== 0)
    )
      X(r, 'bad indentation of a mapping entry');
    else if (r.lineIndent < t) break;
  }
  return (
    x && or(r, h, p, u, f, null, s, l, n),
    y && ((r.tag = g), (r.anchor = c), (r.kind = 'mapping'), (r.result = h)),
    y
  );
}
d(us, 'readBlockMapping');
function ps(r) {
  var t,
    i = !1,
    e = !1,
    o,
    a,
    s;
  if (((s = r.input.charCodeAt(r.position)), s !== 33)) return !1;
  if (
    (r.tag !== null && X(r, 'duplication of a tag property'),
    (s = r.input.charCodeAt(++r.position)),
    s === 60
      ? ((i = !0), (s = r.input.charCodeAt(++r.position)))
      : s === 33
        ? ((e = !0), (o = '!!'), (s = r.input.charCodeAt(++r.position)))
        : (o = '!'),
    (t = r.position),
    i)
  ) {
    do s = r.input.charCodeAt(++r.position);
    while (s !== 0 && s !== 62);
    r.position < r.length
      ? ((a = r.input.slice(t, r.position)), (s = r.input.charCodeAt(++r.position)))
      : X(r, 'unexpected end of the stream within a verbatim tag');
  } else {
    for (; s !== 0 && !bt(s); )
      (s === 33 &&
        (e
          ? X(r, 'tag suffix cannot contain exclamation marks')
          : ((o = r.input.slice(t - 1, r.position + 1)),
            Ja.test(o) || X(r, 'named tag handle cannot contain such characters'),
            (e = !0),
            (t = r.position + 1))),
        (s = r.input.charCodeAt(++r.position)));
    ((a = r.input.slice(t, r.position)),
      Qd.test(a) && X(r, 'tag suffix cannot contain flow indicator characters'));
  }
  a && !ts.test(a) && X(r, 'tag name cannot contain such characters: ' + a);
  try {
    a = decodeURIComponent(a);
  } catch {
    X(r, 'tag name is malformed: ' + a);
  }
  return (
    i
      ? (r.tag = a)
      : Qt.call(r.tagMap, o)
        ? (r.tag = r.tagMap[o] + a)
        : o === '!'
          ? (r.tag = '!' + a)
          : o === '!!'
            ? (r.tag = 'tag:yaml.org,2002:' + a)
            : X(r, 'undeclared tag handle "' + o + '"'),
    !0
  );
}
d(ps, 'readTagProperty');
function fs(r) {
  var t, i;
  if (((i = r.input.charCodeAt(r.position)), i !== 38)) return !1;
  for (
    r.anchor !== null && X(r, 'duplication of an anchor property'),
      i = r.input.charCodeAt(++r.position),
      t = r.position;
    i !== 0 && !bt(i) && !er(i);
  )
    i = r.input.charCodeAt(++r.position);
  return (
    r.position === t && X(r, 'name of an anchor node must contain at least one character'),
    (r.anchor = r.input.slice(t, r.position)),
    !0
  );
}
d(fs, 'readAnchorProperty');
function ms(r) {
  var t, i, e;
  if (((e = r.input.charCodeAt(r.position)), e !== 42)) return !1;
  for (e = r.input.charCodeAt(++r.position), t = r.position; e !== 0 && !bt(e) && !er(e); )
    e = r.input.charCodeAt(++r.position);
  return (
    r.position === t && X(r, 'name of an alias node must contain at least one character'),
    (i = r.input.slice(t, r.position)),
    Qt.call(r.anchorMap, i) || X(r, 'unidentified alias "' + i + '"'),
    (r.result = r.anchorMap[i]),
    lt(r, !0, -1),
    !0
  );
}
d(ms, 'readAlias');
function hr(r, t, i, e, o) {
  var a,
    s,
    l,
    n = 1,
    g = !1,
    c = !1,
    h,
    p,
    u,
    f,
    C,
    x;
  if (
    (r.listener !== null && r.listener('open', r),
    (r.tag = null),
    (r.anchor = null),
    (r.kind = null),
    (r.result = null),
    (a = s = l = xi === i || Za === i),
    e &&
      lt(r, !0, -1) &&
      ((g = !0),
      r.lineIndent > t ? (n = 1) : r.lineIndent === t ? (n = 0) : r.lineIndent < t && (n = -1)),
    n === 1)
  )
    for (; ps(r) || fs(r); )
      lt(r, !0, -1)
        ? ((g = !0),
          (l = a),
          r.lineIndent > t ? (n = 1) : r.lineIndent === t ? (n = 0) : r.lineIndent < t && (n = -1))
        : (l = !1);
  if (
    (l && (l = g || o),
    (n === 1 || xi === i) &&
      (yi === i || Qa === i ? (C = t) : (C = t + 1),
      (x = r.position - r.lineStart),
      n === 1
        ? (l && (Qi(r, x) || us(r, x, C))) || ds(r, C)
          ? (c = !0)
          : ((s && gs(r, C)) || hs(r, C) || cs(r, C)
              ? (c = !0)
              : ms(r)
                ? ((c = !0),
                  (r.tag !== null || r.anchor !== null) &&
                    X(r, 'alias node should not have any properties'))
                : ns(r, C, yi === i) && ((c = !0), r.tag === null && (r.tag = '?')),
            r.anchor !== null && (r.anchorMap[r.anchor] = r.result))
        : n === 0 && (c = l && Qi(r, x))),
    r.tag === null)
  )
    r.anchor !== null && (r.anchorMap[r.anchor] = r.result);
  else if (r.tag === '?') {
    for (
      r.result !== null &&
        r.kind !== 'scalar' &&
        X(r, 'unacceptable node kind for !<?> tag; it should be "scalar", not "' + r.kind + '"'),
        h = 0,
        p = r.implicitTypes.length;
      h < p;
      h += 1
    )
      if (((f = r.implicitTypes[h]), f.resolve(r.result))) {
        ((r.result = f.construct(r.result)),
          (r.tag = f.tag),
          r.anchor !== null && (r.anchorMap[r.anchor] = r.result));
        break;
      }
  } else if (r.tag !== '!') {
    if (Qt.call(r.typeMap[r.kind || 'fallback'], r.tag)) f = r.typeMap[r.kind || 'fallback'][r.tag];
    else
      for (f = null, u = r.typeMap.multi[r.kind || 'fallback'], h = 0, p = u.length; h < p; h += 1)
        if (r.tag.slice(0, u[h].tag.length) === u[h].tag) {
          f = u[h];
          break;
        }
    (f || X(r, 'unknown tag !<' + r.tag + '>'),
      r.result !== null &&
        f.kind !== r.kind &&
        X(
          r,
          'unacceptable node kind for !<' +
            r.tag +
            '> tag; it should be "' +
            f.kind +
            '", not "' +
            r.kind +
            '"',
        ),
      f.resolve(r.result, r.tag)
        ? ((r.result = f.construct(r.result, r.tag)),
          r.anchor !== null && (r.anchorMap[r.anchor] = r.result))
        : X(r, 'cannot resolve a node with !<' + r.tag + '> explicit tag'));
  }
  return (r.listener !== null && r.listener('close', r), r.tag !== null || r.anchor !== null || c);
}
d(hr, 'composeNode');
function Cs(r) {
  var t = r.position,
    i,
    e,
    o,
    a = !1,
    s;
  for (
    r.version = null,
      r.checkLineBreaks = r.legacy,
      r.tagMap = Object.create(null),
      r.anchorMap = Object.create(null);
    (s = r.input.charCodeAt(r.position)) !== 0 &&
    (lt(r, !0, -1), (s = r.input.charCodeAt(r.position)), !(r.lineIndent > 0 || s !== 37));
  ) {
    for (a = !0, s = r.input.charCodeAt(++r.position), i = r.position; s !== 0 && !bt(s); )
      s = r.input.charCodeAt(++r.position);
    for (
      e = r.input.slice(i, r.position),
        o = [],
        e.length < 1 && X(r, 'directive name must not be less than one character in length');
      s !== 0;
    ) {
      for (; Kt(s); ) s = r.input.charCodeAt(++r.position);
      if (s === 35) {
        do s = r.input.charCodeAt(++r.position);
        while (s !== 0 && !_t(s));
        break;
      }
      if (_t(s)) break;
      for (i = r.position; s !== 0 && !bt(s); ) s = r.input.charCodeAt(++r.position);
      o.push(r.input.slice(i, r.position));
    }
    (s !== 0 && Li(r),
      Qt.call(oo, e) ? oo[e](r, e, o) : Ur(r, 'unknown document directive "' + e + '"'));
  }
  if (
    (lt(r, !0, -1),
    r.lineIndent === 0 &&
    r.input.charCodeAt(r.position) === 45 &&
    r.input.charCodeAt(r.position + 1) === 45 &&
    r.input.charCodeAt(r.position + 2) === 45
      ? ((r.position += 3), lt(r, !0, -1))
      : a && X(r, 'directives end mark is expected'),
    hr(r, r.lineIndent - 1, xi, !1, !0),
    lt(r, !0, -1),
    r.checkLineBreaks &&
      Kd.test(r.input.slice(t, r.position)) &&
      Ur(r, 'non-ASCII line breaks are interpreted as content'),
    r.documents.push(r.result),
    r.position === r.lineStart && ri(r))
  ) {
    r.input.charCodeAt(r.position) === 46 && ((r.position += 3), lt(r, !0, -1));
    return;
  }
  if (r.position < r.length - 1) X(r, 'end of the stream or a document separator is expected');
  else return;
}
d(Cs, 'readDocument');
function Ee(r, t) {
  ((r = String(r)),
    (t = t || {}),
    r.length !== 0 &&
      (r.charCodeAt(r.length - 1) !== 10 &&
        r.charCodeAt(r.length - 1) !== 13 &&
        (r += `
`),
      r.charCodeAt(0) === 65279 && (r = r.slice(1))));
  var i = new ls(r, t),
    e = r.indexOf('\0');
  for (
    e !== -1 && ((i.position = e), X(i, 'null byte is not allowed in input')), i.input += '\0';
    i.input.charCodeAt(i.position) === 32;
  )
    ((i.lineIndent += 1), (i.position += 1));
  for (; i.position < i.length - 1; ) Cs(i);
  return i.documents;
}
d(Ee, 'loadDocuments');
function Zd(r, t, i) {
  t !== null && typeof t == 'object' && typeof i > 'u' && ((i = t), (t = null));
  var e = Ee(r, i);
  if (typeof t != 'function') return e;
  for (var o = 0, a = e.length; o < a; o += 1) t(e[o]);
}
d(Zd, 'loadAll$1');
function ys(r, t) {
  var i = Ee(r, t);
  if (i.length !== 0) {
    if (i.length === 1) return i[0];
    throw new St('expected a single document in the stream, but found more');
  }
}
d(ys, 'load$1');
var Jd = ys,
  tg = { load: Jd },
  xs = Object.prototype.toString,
  bs = Object.prototype.hasOwnProperty,
  Me = 65279,
  rg = 9,
  Vr = 10,
  ig = 13,
  eg = 32,
  og = 33,
  ag = 34,
  Zi = 35,
  sg = 37,
  lg = 38,
  ng = 39,
  hg = 42,
  ks = 44,
  cg = 45,
  bi = 58,
  dg = 61,
  gg = 62,
  ug = 63,
  pg = 64,
  Bs = 91,
  Ts = 93,
  fg = 96,
  Ss = 123,
  mg = 124,
  ws = 125,
  Ct = {};
Ct[0] = '\\0';
Ct[7] = '\\a';
Ct[8] = '\\b';
Ct[9] = '\\t';
Ct[10] = '\\n';
Ct[11] = '\\v';
Ct[12] = '\\f';
Ct[13] = '\\r';
Ct[27] = '\\e';
Ct[34] = '\\"';
Ct[92] = '\\\\';
Ct[133] = '\\N';
Ct[160] = '\\_';
Ct[8232] = '\\L';
Ct[8233] = '\\P';
var Cg = [
    'y',
    'Y',
    'yes',
    'Yes',
    'YES',
    'on',
    'On',
    'ON',
    'n',
    'N',
    'no',
    'No',
    'NO',
    'off',
    'Off',
    'OFF',
  ],
  yg = /^[-+]?[0-9_]+(?::[0-9_]+)+(?:\.[0-9_]*)?$/;
function vs(r, t) {
  var i, e, o, a, s, l, n;
  if (t === null) return {};
  for (i = {}, e = Object.keys(t), o = 0, a = e.length; o < a; o += 1)
    ((s = e[o]),
      (l = String(t[s])),
      s.slice(0, 2) === '!!' && (s = 'tag:yaml.org,2002:' + s.slice(2)),
      (n = r.compiledTypeMap.fallback[s]),
      n && bs.call(n.styleAliases, l) && (l = n.styleAliases[l]),
      (i[s] = l));
  return i;
}
d(vs, 'compileStyleMap');
function Ls(r) {
  var t, i, e;
  if (((t = r.toString(16).toUpperCase()), r <= 255)) ((i = 'x'), (e = 2));
  else if (r <= 65535) ((i = 'u'), (e = 4));
  else if (r <= 4294967295) ((i = 'U'), (e = 8));
  else throw new St('code point within a string may not be greater than 0xFFFFFFFF');
  return '\\' + i + ct.repeat('0', e - t.length) + t;
}
d(Ls, 'encodeHex');
var xg = 1,
  Gr = 2;
function Fs(r) {
  ((this.schema = r.schema || Ka),
    (this.indent = Math.max(1, r.indent || 2)),
    (this.noArrayIndent = r.noArrayIndent || !1),
    (this.skipInvalid = r.skipInvalid || !1),
    (this.flowLevel = ct.isNothing(r.flowLevel) ? -1 : r.flowLevel),
    (this.styleMap = vs(this.schema, r.styles || null)),
    (this.sortKeys = r.sortKeys || !1),
    (this.lineWidth = r.lineWidth || 80),
    (this.noRefs = r.noRefs || !1),
    (this.noCompatMode = r.noCompatMode || !1),
    (this.condenseFlow = r.condenseFlow || !1),
    (this.quotingType = r.quotingType === '"' ? Gr : xg),
    (this.forceQuotes = r.forceQuotes || !1),
    (this.replacer = typeof r.replacer == 'function' ? r.replacer : null),
    (this.implicitTypes = this.schema.compiledImplicit),
    (this.explicitTypes = this.schema.compiledExplicit),
    (this.tag = null),
    (this.result = ''),
    (this.duplicates = []),
    (this.usedDuplicates = null));
}
d(Fs, 'State');
function Ji(r, t) {
  for (var i = ct.repeat(' ', t), e = 0, o = -1, a = '', s, l = r.length; e < l; )
    ((o = r.indexOf(
      `
`,
      e,
    )),
      o === -1 ? ((s = r.slice(e)), (e = l)) : ((s = r.slice(e, o + 1)), (e = o + 1)),
      s.length &&
        s !==
          `
` &&
        (a += i),
      (a += s));
  return a;
}
d(Ji, 'indentString');
function ki(r, t) {
  return (
    `
` + ct.repeat(' ', r.indent * t)
  );
}
d(ki, 'generateNextLine');
function _s(r, t) {
  var i, e, o;
  for (i = 0, e = r.implicitTypes.length; i < e; i += 1)
    if (((o = r.implicitTypes[i]), o.resolve(t))) return !0;
  return !1;
}
d(_s, 'testImplicitResolving');
function Kr(r) {
  return r === eg || r === rg;
}
d(Kr, 'isWhitespace');
function Dr(r) {
  return (
    (32 <= r && r <= 126) ||
    (161 <= r && r <= 55295 && r !== 8232 && r !== 8233) ||
    (57344 <= r && r <= 65533 && r !== Me) ||
    (65536 <= r && r <= 1114111)
  );
}
d(Dr, 'isPrintable');
function te(r) {
  return Dr(r) && r !== Me && r !== ig && r !== Vr;
}
d(te, 'isNsCharOrWhitespace');
function re(r, t, i) {
  var e = te(r),
    o = e && !Kr(r);
  return (
    ((i ? e : e && r !== ks && r !== Bs && r !== Ts && r !== Ss && r !== ws) &&
      r !== Zi &&
      !(t === bi && !o)) ||
    (te(t) && !Kr(t) && r === Zi) ||
    (t === bi && o)
  );
}
d(re, 'isPlainSafe');
function As(r) {
  return (
    Dr(r) &&
    r !== Me &&
    !Kr(r) &&
    r !== cg &&
    r !== ug &&
    r !== bi &&
    r !== ks &&
    r !== Bs &&
    r !== Ts &&
    r !== Ss &&
    r !== ws &&
    r !== Zi &&
    r !== lg &&
    r !== hg &&
    r !== og &&
    r !== mg &&
    r !== dg &&
    r !== gg &&
    r !== ng &&
    r !== ag &&
    r !== sg &&
    r !== pg &&
    r !== fg
  );
}
d(As, 'isPlainSafeFirst');
function Es(r) {
  return !Kr(r) && r !== bi;
}
d(Es, 'isPlainSafeLast');
function mr(r, t) {
  var i = r.charCodeAt(t),
    e;
  return i >= 55296 &&
    i <= 56319 &&
    t + 1 < r.length &&
    ((e = r.charCodeAt(t + 1)), e >= 56320 && e <= 57343)
    ? (i - 55296) * 1024 + e - 56320 + 65536
    : i;
}
d(mr, 'codePointAt');
function Oe(r) {
  var t = /^\n* /;
  return t.test(r);
}
d(Oe, 'needIndentIndicator');
var Ms = 1,
  ie = 2,
  Os = 3,
  Is = 4,
  ur = 5;
function Ds(r, t, i, e, o, a, s, l) {
  var n,
    g = 0,
    c = null,
    h = !1,
    p = !1,
    u = e !== -1,
    f = -1,
    C = As(mr(r, 0)) && Es(mr(r, r.length - 1));
  if (t || s)
    for (n = 0; n < r.length; g >= 65536 ? (n += 2) : n++) {
      if (((g = mr(r, n)), !Dr(g))) return ur;
      ((C = C && re(g, c, l)), (c = g));
    }
  else {
    for (n = 0; n < r.length; g >= 65536 ? (n += 2) : n++) {
      if (((g = mr(r, n)), g === Vr))
        ((h = !0), u && ((p = p || (n - f - 1 > e && r[f + 1] !== ' ')), (f = n)));
      else if (!Dr(g)) return ur;
      ((C = C && re(g, c, l)), (c = g));
    }
    p = p || (u && n - f - 1 > e && r[f + 1] !== ' ');
  }
  return !h && !p
    ? C && !s && !o(r)
      ? Ms
      : a === Gr
        ? ur
        : ie
    : i > 9 && Oe(r)
      ? ur
      : s
        ? a === Gr
          ? ur
          : ie
        : p
          ? Is
          : Os;
}
d(Ds, 'chooseScalarStyle');
function $s(r, t, i, e, o) {
  r.dump = (function () {
    if (t.length === 0) return r.quotingType === Gr ? '""' : "''";
    if (!r.noCompatMode && (Cg.indexOf(t) !== -1 || yg.test(t)))
      return r.quotingType === Gr ? '"' + t + '"' : "'" + t + "'";
    var a = r.indent * Math.max(1, i),
      s = r.lineWidth === -1 ? -1 : Math.max(Math.min(r.lineWidth, 40), r.lineWidth - a),
      l = e || (r.flowLevel > -1 && i >= r.flowLevel);
    function n(g) {
      return _s(r, g);
    }
    switch (
      (d(n, 'testAmbiguity'), Ds(t, l, r.indent, s, n, r.quotingType, r.forceQuotes && !e, o))
    ) {
      case Ms:
        return t;
      case ie:
        return "'" + t.replace(/'/g, "''") + "'";
      case Os:
        return '|' + ee(t, r.indent) + oe(Ji(t, a));
      case Is:
        return '>' + ee(t, r.indent) + oe(Ji(Ps(t, s), a));
      case ur:
        return '"' + qs(t) + '"';
      default:
        throw new St('impossible error: invalid scalar style');
    }
  })();
}
d($s, 'writeScalar');
function ee(r, t) {
  var i = Oe(r) ? String(t) : '',
    e =
      r[r.length - 1] ===
      `
`,
    o =
      e &&
      (r[r.length - 2] ===
        `
` ||
        r ===
          `
`),
    a = o ? '+' : e ? '' : '-';
  return (
    i +
    a +
    `
`
  );
}
d(ee, 'blockHeader');
function oe(r) {
  return r[r.length - 1] ===
    `
`
    ? r.slice(0, -1)
    : r;
}
d(oe, 'dropEndingNewline');
function Ps(r, t) {
  for (
    var i = /(\n+)([^\n]*)/g,
      e = (function () {
        var g = r.indexOf(`
`);
        return ((g = g !== -1 ? g : r.length), (i.lastIndex = g), ae(r.slice(0, g), t));
      })(),
      o =
        r[0] ===
          `
` || r[0] === ' ',
      a,
      s;
    (s = i.exec(r));
  ) {
    var l = s[1],
      n = s[2];
    ((a = n[0] === ' '),
      (e +=
        l +
        (!o && !a && n !== ''
          ? `
`
          : '') +
        ae(n, t)),
      (o = a));
  }
  return e;
}
d(Ps, 'foldString');
function ae(r, t) {
  if (r === '' || r[0] === ' ') return r;
  for (var i = / [^ ]/g, e, o = 0, a, s = 0, l = 0, n = ''; (e = i.exec(r)); )
    ((l = e.index),
      l - o > t &&
        ((a = s > o ? s : l),
        (n +=
          `
` + r.slice(o, a)),
        (o = a + 1)),
      (s = l));
  return (
    (n += `
`),
    r.length - o > t && s > o
      ? (n +=
          r.slice(o, s) +
          `
` +
          r.slice(s + 1))
      : (n += r.slice(o)),
    n.slice(1)
  );
}
d(ae, 'foldLine');
function qs(r) {
  for (var t = '', i = 0, e, o = 0; o < r.length; i >= 65536 ? (o += 2) : o++)
    ((i = mr(r, o)),
      (e = Ct[i]),
      !e && Dr(i) ? ((t += r[o]), i >= 65536 && (t += r[o + 1])) : (t += e || Ls(i)));
  return t;
}
d(qs, 'escapeString');
function Rs(r, t, i) {
  var e = '',
    o = r.tag,
    a,
    s,
    l;
  for (a = 0, s = i.length; a < s; a += 1)
    ((l = i[a]),
      r.replacer && (l = r.replacer.call(i, String(a), l)),
      (Dt(r, t, l, !1, !1) || (typeof l > 'u' && Dt(r, t, null, !1, !1))) &&
        (e !== '' && (e += ',' + (r.condenseFlow ? '' : ' ')), (e += r.dump)));
  ((r.tag = o), (r.dump = '[' + e + ']'));
}
d(Rs, 'writeFlowSequence');
function se(r, t, i, e) {
  var o = '',
    a = r.tag,
    s,
    l,
    n;
  for (s = 0, l = i.length; s < l; s += 1)
    ((n = i[s]),
      r.replacer && (n = r.replacer.call(i, String(s), n)),
      (Dt(r, t + 1, n, !0, !0, !1, !0) || (typeof n > 'u' && Dt(r, t + 1, null, !0, !0, !1, !0))) &&
        ((!e || o !== '') && (o += ki(r, t)),
        r.dump && Vr === r.dump.charCodeAt(0) ? (o += '-') : (o += '- '),
        (o += r.dump)));
  ((r.tag = a), (r.dump = o || '[]'));
}
d(se, 'writeBlockSequence');
function Ws(r, t, i) {
  var e = '',
    o = r.tag,
    a = Object.keys(i),
    s,
    l,
    n,
    g,
    c;
  for (s = 0, l = a.length; s < l; s += 1)
    ((c = ''),
      e !== '' && (c += ', '),
      r.condenseFlow && (c += '"'),
      (n = a[s]),
      (g = i[n]),
      r.replacer && (g = r.replacer.call(i, n, g)),
      Dt(r, t, n, !1, !1) &&
        (r.dump.length > 1024 && (c += '? '),
        (c += r.dump + (r.condenseFlow ? '"' : '') + ':' + (r.condenseFlow ? '' : ' ')),
        Dt(r, t, g, !1, !1) && ((c += r.dump), (e += c))));
  ((r.tag = o), (r.dump = '{' + e + '}'));
}
d(Ws, 'writeFlowMapping');
function zs(r, t, i, e) {
  var o = '',
    a = r.tag,
    s = Object.keys(i),
    l,
    n,
    g,
    c,
    h,
    p;
  if (r.sortKeys === !0) s.sort();
  else if (typeof r.sortKeys == 'function') s.sort(r.sortKeys);
  else if (r.sortKeys) throw new St('sortKeys must be a boolean or a function');
  for (l = 0, n = s.length; l < n; l += 1)
    ((p = ''),
      (!e || o !== '') && (p += ki(r, t)),
      (g = s[l]),
      (c = i[g]),
      r.replacer && (c = r.replacer.call(i, g, c)),
      Dt(r, t + 1, g, !0, !0, !0) &&
        ((h = (r.tag !== null && r.tag !== '?') || (r.dump && r.dump.length > 1024)),
        h && (r.dump && Vr === r.dump.charCodeAt(0) ? (p += '?') : (p += '? ')),
        (p += r.dump),
        h && (p += ki(r, t)),
        Dt(r, t + 1, c, !0, h) &&
          (r.dump && Vr === r.dump.charCodeAt(0) ? (p += ':') : (p += ': '),
          (p += r.dump),
          (o += p))));
  ((r.tag = a), (r.dump = o || '{}'));
}
d(zs, 'writeBlockMapping');
function le(r, t, i) {
  var e, o, a, s, l, n;
  for (o = i ? r.explicitTypes : r.implicitTypes, a = 0, s = o.length; a < s; a += 1)
    if (
      ((l = o[a]),
      (l.instanceOf || l.predicate) &&
        (!l.instanceOf || (typeof t == 'object' && t instanceof l.instanceOf)) &&
        (!l.predicate || l.predicate(t)))
    ) {
      if (
        (i
          ? l.multi && l.representName
            ? (r.tag = l.representName(t))
            : (r.tag = l.tag)
          : (r.tag = '?'),
        l.represent)
      ) {
        if (
          ((n = r.styleMap[l.tag] || l.defaultStyle), xs.call(l.represent) === '[object Function]')
        )
          e = l.represent(t, n);
        else if (bs.call(l.represent, n)) e = l.represent[n](t, n);
        else throw new St('!<' + l.tag + '> tag resolver accepts not "' + n + '" style');
        r.dump = e;
      }
      return !0;
    }
  return !1;
}
d(le, 'detectType');
function Dt(r, t, i, e, o, a, s) {
  ((r.tag = null), (r.dump = i), le(r, i, !1) || le(r, i, !0));
  var l = xs.call(r.dump),
    n = e,
    g;
  e && (e = r.flowLevel < 0 || r.flowLevel > t);
  var c = l === '[object Object]' || l === '[object Array]',
    h,
    p;
  if (
    (c && ((h = r.duplicates.indexOf(i)), (p = h !== -1)),
    ((r.tag !== null && r.tag !== '?') || p || (r.indent !== 2 && t > 0)) && (o = !1),
    p && r.usedDuplicates[h])
  )
    r.dump = '*ref_' + h;
  else {
    if ((c && p && !r.usedDuplicates[h] && (r.usedDuplicates[h] = !0), l === '[object Object]'))
      e && Object.keys(r.dump).length !== 0
        ? (zs(r, t, r.dump, o), p && (r.dump = '&ref_' + h + r.dump))
        : (Ws(r, t, r.dump), p && (r.dump = '&ref_' + h + ' ' + r.dump));
    else if (l === '[object Array]')
      e && r.dump.length !== 0
        ? (r.noArrayIndent && !s && t > 0 ? se(r, t - 1, r.dump, o) : se(r, t, r.dump, o),
          p && (r.dump = '&ref_' + h + r.dump))
        : (Rs(r, t, r.dump), p && (r.dump = '&ref_' + h + ' ' + r.dump));
    else if (l === '[object String]') r.tag !== '?' && $s(r, r.dump, t, a, n);
    else {
      if (l === '[object Undefined]') return !1;
      if (r.skipInvalid) return !1;
      throw new St('unacceptable kind of an object to dump ' + l);
    }
    r.tag !== null &&
      r.tag !== '?' &&
      ((g = encodeURI(r.tag[0] === '!' ? r.tag.slice(1) : r.tag).replace(/!/g, '%21')),
      r.tag[0] === '!'
        ? (g = '!' + g)
        : g.slice(0, 18) === 'tag:yaml.org,2002:'
          ? (g = '!!' + g.slice(18))
          : (g = '!<' + g + '>'),
      (r.dump = g + ' ' + r.dump));
  }
  return !0;
}
d(Dt, 'writeNode');
function Ns(r, t) {
  var i = [],
    e = [],
    o,
    a;
  for (Bi(r, i, e), o = 0, a = e.length; o < a; o += 1) t.duplicates.push(i[e[o]]);
  t.usedDuplicates = new Array(a);
}
d(Ns, 'getDuplicateReferences');
function Bi(r, t, i) {
  var e, o, a;
  if (r !== null && typeof r == 'object')
    if (((o = t.indexOf(r)), o !== -1)) i.indexOf(o) === -1 && i.push(o);
    else if ((t.push(r), Array.isArray(r))) for (o = 0, a = r.length; o < a; o += 1) Bi(r[o], t, i);
    else for (e = Object.keys(r), o = 0, a = e.length; o < a; o += 1) Bi(r[e[o]], t, i);
}
d(Bi, 'inspectNode');
function bg(r, t) {
  t = t || {};
  var i = new Fs(t);
  i.noRefs || Ns(r, i);
  var e = r;
  return (
    i.replacer && (e = i.replacer.call({ '': e }, '', e)),
    Dt(i, 0, e, !0, !0)
      ? i.dump +
        `
`
      : ''
  );
}
d(bg, 'dump$1');
function kg(r, t) {
  return function () {
    throw new Error(
      'Function yaml.' +
        r +
        ' is removed in js-yaml 4. Use yaml.' +
        t +
        ' instead, which is now safe by default.',
    );
  };
}
d(kg, 'renamed');
var Bg = Oa,
  Tg = tg.load;
var Rr = d((r, t) => {
    if (t) return 'translate(' + -r.width / 2 + ', ' + -r.height / 2 + ')';
    const i = r.x ?? 0,
      e = r.y ?? 0;
    return 'translate(' + -(i + r.width / 2) + ', ' + -(e + r.height / 2) + ')';
  }, 'computeLabelTransform'),
  ft = {
    aggregation: 17.25,
    extension: 17.25,
    composition: 17.25,
    dependency: 6,
    lollipop: 13.5,
    arrow_point: 4,
    arrow_barb: 0,
    arrow_barb_neo: 5.5,
  },
  ao = { arrow_point: 4, arrow_cross: 12.5, arrow_circle: 12.5 };
function zr(r, t) {
  if (r === void 0 || t === void 0) return { angle: 0, deltaX: 0, deltaY: 0 };
  ((r = ot(r)), (t = ot(t)));
  const [i, e] = [r.x, r.y],
    [o, a] = [t.x, t.y],
    s = o - i,
    l = a - e;
  return { angle: Math.atan(l / s), deltaX: s, deltaY: l };
}
d(zr, 'calculateDeltaAndAngle');
var ot = d((r) => (Array.isArray(r) ? { x: r[0], y: r[1] } : r), 'pointTransformer'),
  Sg = d(
    (r) => ({
      x: d(function (t, i, e) {
        let o = 0;
        const a = ot(e[0]).x < ot(e[e.length - 1]).x ? 'left' : 'right';
        if (i === 0 && Object.hasOwn(ft, r.arrowTypeStart)) {
          const { angle: u, deltaX: f } = zr(e[0], e[1]);
          o = ft[r.arrowTypeStart] * Math.cos(u) * (f >= 0 ? 1 : -1);
        } else if (i === e.length - 1 && Object.hasOwn(ft, r.arrowTypeEnd)) {
          const { angle: u, deltaX: f } = zr(e[e.length - 1], e[e.length - 2]);
          o = ft[r.arrowTypeEnd] * Math.cos(u) * (f >= 0 ? 1 : -1);
        }
        const s = Math.abs(ot(t).x - ot(e[e.length - 1]).x),
          l = Math.abs(ot(t).y - ot(e[e.length - 1]).y),
          n = Math.abs(ot(t).x - ot(e[0]).x),
          g = Math.abs(ot(t).y - ot(e[0]).y),
          c = ft[r.arrowTypeStart],
          h = ft[r.arrowTypeEnd],
          p = 1;
        if (s < h && s > 0 && l < h) {
          let u = h + p - s;
          ((u *= a === 'right' ? -1 : 1), (o -= u));
        }
        if (n < c && n > 0 && g < c) {
          let u = c + p - n;
          ((u *= a === 'right' ? -1 : 1), (o += u));
        }
        return ot(t).x + o;
      }, 'x'),
      y: d(function (t, i, e) {
        let o = 0;
        const a = ot(e[0]).y < ot(e[e.length - 1]).y ? 'down' : 'up';
        if (i === 0 && Object.hasOwn(ft, r.arrowTypeStart)) {
          const { angle: u, deltaY: f } = zr(e[0], e[1]);
          o = ft[r.arrowTypeStart] * Math.abs(Math.sin(u)) * (f >= 0 ? 1 : -1);
        } else if (i === e.length - 1 && Object.hasOwn(ft, r.arrowTypeEnd)) {
          const { angle: u, deltaY: f } = zr(e[e.length - 1], e[e.length - 2]);
          o = ft[r.arrowTypeEnd] * Math.abs(Math.sin(u)) * (f >= 0 ? 1 : -1);
        }
        const s = Math.abs(ot(t).y - ot(e[e.length - 1]).y),
          l = Math.abs(ot(t).x - ot(e[e.length - 1]).x),
          n = Math.abs(ot(t).y - ot(e[0]).y),
          g = Math.abs(ot(t).x - ot(e[0]).x),
          c = ft[r.arrowTypeStart],
          h = ft[r.arrowTypeEnd],
          p = 1;
        if (s < h && s > 0 && l < h) {
          let u = h + p - s;
          ((u *= a === 'up' ? -1 : 1), (o -= u));
        }
        if (n < c && n > 0 && g < c) {
          let u = c + p - n;
          ((u *= a === 'up' ? -1 : 1), (o += u));
        }
        return ot(t).y + o;
      }, 'y'),
    }),
    'getLineFunctionsWithOffset',
  );
function $i(r) {
  if (typeof r != 'object' || r == null) return !1;
  if (Object.getPrototypeOf(r) === null) return !0;
  if (Object.prototype.toString.call(r) !== '[object Object]') {
    const i = r[Symbol.toStringTag];
    return i == null || !Object.getOwnPropertyDescriptor(r, Symbol.toStringTag)?.writable
      ? !1
      : r.toString() === `[object ${i}]`;
  }
  let t = r;
  for (; Object.getPrototypeOf(t) !== null; ) t = Object.getPrototypeOf(t);
  return Object.getPrototypeOf(r) === t;
}
function wg() {}
function Hs(r) {
  return Object.getOwnPropertySymbols(r).filter((t) =>
    Object.prototype.propertyIsEnumerable.call(r, t),
  );
}
function Ie(r) {
  return r == null
    ? r === void 0
      ? '[object Undefined]'
      : '[object Null]'
    : Object.prototype.toString.call(r);
}
const vg = '[object RegExp]',
  Ys = '[object String]',
  js = '[object Number]',
  Xs = '[object Boolean]',
  Us = '[object Arguments]',
  Lg = '[object Symbol]',
  Fg = '[object Date]',
  _g = '[object Map]',
  Ag = '[object Set]',
  Eg = '[object Array]',
  Mg = '[object ArrayBuffer]',
  Og = '[object Object]',
  Ig = '[object DataView]',
  Dg = '[object Uint8Array]',
  $g = '[object Uint8ClampedArray]',
  Pg = '[object Uint16Array]',
  qg = '[object Uint32Array]',
  Rg = '[object Int8Array]',
  Wg = '[object Int16Array]',
  zg = '[object Int32Array]',
  Ng = '[object Float32Array]',
  Hg = '[object Float64Array]',
  so =
    (typeof globalThis == 'object' && globalThis) ||
    (typeof window == 'object' && window) ||
    (typeof self == 'object' && self) ||
    (typeof global == 'object' && global) ||
    (function () {
      return this;
    })();
function De(r) {
  return typeof so.Buffer < 'u' && so.Buffer.isBuffer(r);
}
function Yg(r) {
  return Number.isSafeInteger(r) && r >= 0;
}
function Vs(r) {
  return r != null && typeof r != 'function' && Yg(r.length);
}
function jg(r) {
  return r === '__proto__';
}
function $e(r) {
  return r == null || (typeof r != 'object' && typeof r != 'function');
}
function Pe(r) {
  return ArrayBuffer.isView(r) && !(r instanceof DataView);
}
function Xg(r, t) {
  return Cr(r, void 0, r, new Map(), t);
}
function Cr(r, t, i, e = new Map(), o = void 0) {
  const a = o?.(r, t, i, e);
  if (a !== void 0) return a;
  if ($e(r)) return r;
  if (e.has(r)) return e.get(r);
  if (Array.isArray(r)) {
    const s = new Array(r.length);
    e.set(r, s);
    for (let l = 0; l < r.length; l++) s[l] = Cr(r[l], l, i, e, o);
    return (
      Object.hasOwn(r, 'index') && (s.index = r.index),
      Object.hasOwn(r, 'input') && (s.input = r.input),
      s
    );
  }
  if (r instanceof Date) return new Date(r.getTime());
  if (r instanceof RegExp) {
    const s = new RegExp(r.source, r.flags);
    return ((s.lastIndex = r.lastIndex), s);
  }
  if (r instanceof Map) {
    const s = new Map();
    e.set(r, s);
    for (const [l, n] of r) s.set(l, Cr(n, l, i, e, o));
    return s;
  }
  if (r instanceof Set) {
    const s = new Set();
    e.set(r, s);
    for (const l of r) s.add(Cr(l, void 0, i, e, o));
    return s;
  }
  if (De(r)) return r.subarray();
  if (Pe(r)) {
    const s = new (Object.getPrototypeOf(r).constructor)(r.length);
    e.set(r, s);
    for (let l = 0; l < r.length; l++) s[l] = Cr(r[l], l, i, e, o);
    return s;
  }
  if (
    r instanceof ArrayBuffer ||
    (typeof SharedArrayBuffer < 'u' && r instanceof SharedArrayBuffer)
  )
    return r.slice(0);
  if (r instanceof DataView) {
    const s = new DataView(r.buffer.slice(0), r.byteOffset, r.byteLength);
    return (e.set(r, s), Lt(s, r, i, e, o), s);
  }
  if (typeof File < 'u' && r instanceof File) {
    const s = new File([r], r.name, { type: r.type });
    return (e.set(r, s), Lt(s, r, i, e, o), s);
  }
  if (typeof Blob < 'u' && r instanceof Blob) {
    const s = new Blob([r], { type: r.type });
    return (e.set(r, s), Lt(s, r, i, e, o), s);
  }
  if (r instanceof Error) {
    const s = structuredClone(r);
    return (
      e.set(r, s),
      (s.message = r.message),
      (s.name = r.name),
      (s.stack = r.stack),
      (s.cause = r.cause),
      (s.constructor = r.constructor),
      Lt(s, r, i, e, o),
      s
    );
  }
  if (r instanceof Boolean) {
    const s = new Boolean(r.valueOf());
    return (e.set(r, s), Lt(s, r, i, e, o), s);
  }
  if (r instanceof Number) {
    const s = new Number(r.valueOf());
    return (e.set(r, s), Lt(s, r, i, e, o), s);
  }
  if (r instanceof String) {
    const s = new String(r.valueOf());
    return (e.set(r, s), Lt(s, r, i, e, o), s);
  }
  if (typeof r == 'object' && Ug(r)) {
    const s = Object.create(Object.getPrototypeOf(r));
    return (e.set(r, s), Lt(s, r, i, e, o), s);
  }
  return r;
}
function Lt(r, t, i = r, e, o) {
  const a = [...Object.keys(t), ...Hs(t)];
  for (let s = 0; s < a.length; s++) {
    const l = a[s],
      n = Object.getOwnPropertyDescriptor(r, l);
    (n == null || n.writable) && (r[l] = Cr(t[l], l, i, e, o));
  }
}
function Ug(r) {
  switch (Ie(r)) {
    case Us:
    case Eg:
    case Mg:
    case Ig:
    case Xs:
    case Fg:
    case Ng:
    case Hg:
    case Rg:
    case Wg:
    case zg:
    case _g:
    case js:
    case Og:
    case vg:
    case Ag:
    case Ys:
    case Lg:
    case Dg:
    case $g:
    case Pg:
    case qg:
      return !0;
    default:
      return !1;
  }
}
function Vg(r, t) {
  return Xg(r, (i, e, o, a) => {
    if (typeof r == 'object') {
      if (Ie(r) === '[object Object]' && typeof r.constructor != 'function') {
        const s = {};
        return (a.set(r, s), Lt(s, r, o, a), s);
      }
      switch (Object.prototype.toString.call(r)) {
        case js:
        case Ys:
        case Xs: {
          const s = new r.constructor(r?.valueOf());
          return (Lt(s, r), s);
        }
        case Us: {
          const s = {};
          return (Lt(s, r), (s.length = r.length), (s[Symbol.iterator] = r[Symbol.iterator]), s);
        }
        default:
          return;
      }
    }
  });
}
function lo(r) {
  return Vg(r);
}
function ne(r) {
  return r !== null && typeof r == 'object' && Ie(r) === '[object Arguments]';
}
function he(r) {
  return typeof r == 'object' && r !== null;
}
function Gg(r) {
  return he(r) && Vs(r);
}
function ii(r, t) {
  if (typeof r != 'function' || (t != null && typeof t != 'function'))
    throw new TypeError('Expected a function');
  const i = function (...e) {
    const o = t ? t.apply(this, e) : e[0],
      a = i.cache;
    if (a.has(o)) return a.get(o);
    const s = r.apply(this, e);
    return ((i.cache = a.set(o, s) || a), s);
  };
  return ((i.cache = new (ii.Cache || Map)()), i);
}
ii.Cache = Map;
function ci(r) {
  return Pe(r);
}
function Kg(r) {
  const t = r?.constructor;
  return r === (typeof t == 'function' ? t.prototype : Object.prototype);
}
function Qg(r) {
  if ($e(r)) return r;
  if (
    Array.isArray(r) ||
    Pe(r) ||
    r instanceof ArrayBuffer ||
    (typeof SharedArrayBuffer < 'u' && r instanceof SharedArrayBuffer)
  )
    return r.slice(0);
  const t = Object.getPrototypeOf(r);
  if (t == null) return Object.assign(Object.create(t), r);
  const i = t.constructor;
  if (r instanceof Date || r instanceof Map || r instanceof Set) return new i(r);
  if (r instanceof RegExp) {
    const e = new i(r);
    return ((e.lastIndex = r.lastIndex), e);
  }
  if (r instanceof DataView) return new i(r.buffer.slice(0));
  if (r instanceof Error) {
    let e;
    return (
      r instanceof AggregateError
        ? (e = new i(r.errors, r.message, { cause: r.cause }))
        : (e = new i(r.message, { cause: r.cause })),
      (e.stack = r.stack),
      Object.assign(e, r),
      e
    );
  }
  return typeof File < 'u' && r instanceof File
    ? new i([r], r.name, { type: r.type, lastModified: r.lastModified })
    : typeof r == 'object'
      ? Object.assign(Object.create(t), r)
      : r;
}
function Zg(r, ...t) {
  const i = t.slice(0, -1),
    e = t[t.length - 1];
  let o = r;
  for (let a = 0; a < i.length; a++) {
    const s = i[a];
    o = di(o, s, e, new Map());
  }
  return o;
}
function di(r, t, i, e) {
  if (($e(r) && (r = Object(r)), t == null || typeof t != 'object')) return r;
  if (e.has(t)) return Qg(e.get(t));
  if ((e.set(t, r), Array.isArray(t))) {
    t = t.slice();
    for (let a = 0; a < t.length; a++) t[a] = t[a] ?? void 0;
  }
  const o = [...Object.keys(t), ...Hs(t)];
  for (let a = 0; a < o.length; a++) {
    const s = o[a];
    if (jg(s)) continue;
    let l = t[s],
      n = r[s];
    if ((ne(l) && (l = { ...l }), ne(n) && (n = { ...n }), De(l) && (l = lo(l)), Array.isArray(l)))
      if (Array.isArray(n)) {
        const c = [],
          h = Reflect.ownKeys(n);
        for (let p = 0; p < h.length; p++) {
          const u = h[p];
          c[u] = n[u];
        }
        n = c;
      } else if (Gg(n)) {
        const c = [];
        for (let h = 0; h < n.length; h++) c[h] = n[h];
        n = c;
      } else n = [];
    const g = i(n, l, s, r, t, e);
    g !== void 0
      ? (r[s] = g)
      : Array.isArray(l) || (he(n) && he(l) && ($i(n) || $i(l) || ci(n) || ci(l)))
        ? (r[s] = di(n, l, i, e))
        : n == null && $i(l)
          ? (r[s] = di({}, l, i, e))
          : n == null && ci(l)
            ? (r[s] = lo(l))
            : (n === void 0 || l !== void 0) && (r[s] = l);
  }
  return r;
}
function Jg(r, ...t) {
  return Zg(r, ...t, wg);
}
function no(r) {
  if (r == null) return !0;
  if (Vs(r))
    return typeof r.splice != 'function' && typeof r != 'string' && !De(r) && !ci(r) && !ne(r)
      ? !1
      : r.length === 0;
  if (typeof r == 'object' || typeof r == 'function') {
    if (r instanceof Map || r instanceof Set) return r.size === 0;
    const t = Object.keys(r);
    return Kg(r) ? t.filter((i) => i !== 'constructor').length === 0 : t.length === 0;
  }
  return !0;
}
var tu = '​',
  ru = {
    curveBasis: Wi,
    curveBasisClosed: ec,
    curveBasisOpen: ic,
    curveBumpX: Wo,
    curveBumpY: Ro,
    curveBundle: rc,
    curveCardinalClosed: tc,
    curveCardinalOpen: Jh,
    curveCardinal: qo,
    curveCatmullRomClosed: Zh,
    curveCatmullRomOpen: Qh,
    curveCatmullRom: Po,
    curveLinear: si,
    curveLinearClosed: Kh,
    curveMonotoneX: $o,
    curveMonotoneY: Do,
    curveNatural: Io,
    curveStep: Oo,
    curveStepAfter: Mo,
    curveStepBefore: Eo,
  },
  iu = /\s*(?:(\w+)(?=:):|(\w+))\s*(?:(\w+)|((?:(?!}%{2}).|\r?\n)*))?\s*(?:}%{2})?/gi,
  eu = d(function (r, t) {
    const i = Gs(r, /(?:init\b)|(?:initialize\b)/);
    let e = {};
    if (Array.isArray(i)) {
      const s = i.map((l) => l.args);
      (gi(s), (e = ht(e, [...s])));
    } else e = i.args;
    if (!e) return;
    let o = be(r, t);
    const a = 'config';
    return (
      e[a] !== void 0 && (o === 'flowchart-v2' && (o = 'flowchart'), (e[o] = e[a]), delete e[a]),
      e
    );
  }, 'detectInit'),
  Gs = d(function (r, t = null) {
    try {
      const i = new RegExp(
        `[%]{2}(?![{]${iu.source})(?=[}][%]{2}).*
`,
        'ig',
      );
      ((r = r.trim().replace(i, '').replace(/'/gm, '"')),
        F.debug(
          `Detecting diagram directive${t !== null ? ' type:' + t : ''} based on the text:${r}`,
        ));
      let e;
      const o = [];
      for (; (e = Yr.exec(r)) !== null; )
        if (
          (e.index === Yr.lastIndex && Yr.lastIndex++,
          (e && !t) || (t && e[1]?.match(t)) || (t && e[2]?.match(t)))
        ) {
          const a = e[1] ? e[1] : e[2],
            s = e[3] ? e[3].trim() : e[4] ? JSON.parse(e[4].trim()) : null;
          o.push({ type: a, args: s });
        }
      return o.length === 0 ? { type: r, args: null } : o.length === 1 ? o[0] : o;
    } catch (i) {
      return (
        F.error(
          `ERROR: ${i.message} - Unable to parse directive type: '${t}' based on the text: '${r}'`,
        ),
        { type: void 0, args: null }
      );
    }
  }, 'detectDirective'),
  ou = d(function (r) {
    return r.replace(Yr, '');
  }, 'removeDirectives'),
  au = d(function (r, t) {
    for (const [i, e] of t.entries()) if (e.match(r)) return i;
    return -1;
  }, 'isSubstringInArray');
function qe(r, t) {
  if (!r) return t;
  const i = `curve${r.charAt(0).toUpperCase() + r.slice(1)}`;
  return ru[i] ?? t;
}
d(qe, 'interpolateToCurve');
function Ks(r, t) {
  const i = r.trim();
  if (i) return t.securityLevel !== 'loose' ? Gh.sanitizeUrl(i) : i;
}
d(Ks, 'formatUrl');
var su = d((r, ...t) => {
  const i = r.split('.'),
    e = i.length - 1,
    o = i[e];
  let a = window;
  for (let s = 0; s < e; s++)
    if (((a = a[i[s]]), !a)) {
      F.error(`Function name: ${r} not found in window`);
      return;
    }
  a[o](...t);
}, 'runFunc');
function Re(r, t) {
  return !r || !t ? 0 : Math.sqrt(Math.pow(t.x - r.x, 2) + Math.pow(t.y - r.y, 2));
}
d(Re, 'distance');
function Qs(r) {
  let t,
    i = 0;
  r.forEach((o) => {
    ((i += Re(o, t)), (t = o));
  });
  const e = i / 2;
  return We(r, e);
}
d(Qs, 'traverseEdge');
function Zs(r) {
  return r.length === 1 ? r[0] : Qs(r);
}
d(Zs, 'calcLabelPosition');
var ho = d((r, t = 2) => {
    const i = Math.pow(10, t);
    return Math.round(r * i) / i;
  }, 'roundNumber'),
  We = d((r, t) => {
    let i,
      e = t;
    for (const o of r) {
      if (i) {
        const a = Re(o, i);
        if (a === 0) return i;
        if (a < e) e -= a;
        else {
          const s = e / a;
          if (s <= 0) return i;
          if (s >= 1) return { x: o.x, y: o.y };
          if (s > 0 && s < 1)
            return { x: ho((1 - s) * i.x + s * o.x, 5), y: ho((1 - s) * i.y + s * o.y, 5) };
        }
      }
      i = o;
    }
    throw new Error('Could not find a suitable point for the given distance');
  }, 'calculatePoint'),
  lu = d((r, t, i) => {
    (F.info(`our points ${JSON.stringify(t)}`), t[0] !== i && (t = t.reverse()));
    const o = We(t, 25),
      a = r ? 10 : 5,
      s = Math.atan2(t[0].y - o.y, t[0].x - o.x),
      l = { x: 0, y: 0 };
    return (
      (l.x = Math.sin(s) * a + (t[0].x + o.x) / 2),
      (l.y = -Math.cos(s) * a + (t[0].y + o.y) / 2),
      l
    );
  }, 'calcCardinalityPosition');
function Js(r, t, i) {
  const e = structuredClone(i);
  (F.info('our points', e), t !== 'start_left' && t !== 'start_right' && e.reverse());
  const o = 25 + r,
    a = We(e, o),
    s = 10 + r * 0.5,
    l = Math.atan2(e[0].y - a.y, e[0].x - a.x),
    n = { x: 0, y: 0 };
  return (
    t === 'start_left'
      ? ((n.x = Math.sin(l + Math.PI) * s + (e[0].x + a.x) / 2),
        (n.y = -Math.cos(l + Math.PI) * s + (e[0].y + a.y) / 2))
      : t === 'end_right'
        ? ((n.x = Math.sin(l - Math.PI) * s + (e[0].x + a.x) / 2 - 5),
          (n.y = -Math.cos(l - Math.PI) * s + (e[0].y + a.y) / 2 - 5))
        : t === 'end_left'
          ? ((n.x = Math.sin(l) * s + (e[0].x + a.x) / 2 - 5),
            (n.y = -Math.cos(l) * s + (e[0].y + a.y) / 2 - 5))
          : ((n.x = Math.sin(l) * s + (e[0].x + a.x) / 2),
            (n.y = -Math.cos(l) * s + (e[0].y + a.y) / 2)),
    n
  );
}
d(Js, 'calcTerminalLabelPosition');
function tl(r) {
  let t = '',
    i = '';
  for (const e of r)
    e !== void 0 &&
      (e.startsWith('color:') || e.startsWith('text-align:')
        ? (i = i + e + ';')
        : (t = t + e + ';'));
  return { style: t, labelStyle: i };
}
d(tl, 'getStylesFromArray');
var co = 0,
  nu = d(() => (co++, 'id-' + Math.random().toString(36).substr(2, 12) + '-' + co), 'generateId');
function rl(r) {
  let t = '';
  const i = '0123456789abcdef',
    e = i.length;
  for (let o = 0; o < r; o++) t += i.charAt(Math.floor(Math.random() * e));
  return t;
}
d(rl, 'makeRandomHex');
var hu = d((r) => rl(r.length), 'random'),
  cu = d(function () {
    return {
      x: 0,
      y: 0,
      fill: void 0,
      anchor: 'start',
      style: '#666',
      width: 100,
      height: 100,
      textMargin: 0,
      rx: 0,
      ry: 0,
      valign: void 0,
      text: '',
    };
  }, 'getTextObj'),
  du = d(function (r, t) {
    const i = t.text.replace(ti.lineBreakRegex, ' '),
      [, e] = _i(t.fontSize),
      o = r.append('text');
    (o.attr('x', t.x),
      o.attr('y', t.y),
      o.style('text-anchor', t.anchor),
      o.style('font-family', t.fontFamily),
      o.style('font-size', e),
      o.style('font-weight', t.fontWeight),
      o.attr('fill', t.fill),
      t.class !== void 0 && o.attr('class', t.class));
    const a = o.append('tspan');
    return (a.attr('x', t.x + t.textMargin * 2), a.attr('fill', t.fill), a.text(i), o);
  }, 'drawSimpleText'),
  gu = ii(
    (r, t, i) => {
      if (
        !r ||
        ((i = Object.assign(
          { fontSize: 12, fontWeight: 400, fontFamily: 'Arial', joinWith: '<br/>' },
          i,
        )),
        ti.lineBreakRegex.test(r))
      )
        return r;
      const e = r.split(' ').filter(Boolean),
        o = [];
      let a = '';
      return (
        e.forEach((s, l) => {
          const n = Ht(`${s} `, i),
            g = Ht(a, i);
          if (n > t) {
            const { hyphenatedStrings: p, remainingWord: u } = uu(s, t, '-', i);
            (o.push(a, ...p), (a = u));
          } else g + n >= t ? (o.push(a), (a = s)) : (a = [a, s].filter(Boolean).join(' '));
          l + 1 === e.length && o.push(a);
        }),
        o.filter((s) => s !== '').join(i.joinWith)
      );
    },
    (r, t, i) => `${r}${t}${i.fontSize}${i.fontWeight}${i.fontFamily}${i.joinWith}`,
  ),
  uu = ii(
    (r, t, i = '-', e) => {
      e = Object.assign({ fontSize: 12, fontWeight: 400, fontFamily: 'Arial', margin: 0 }, e);
      const o = [...r],
        a = [];
      let s = '';
      return (
        o.forEach((l, n) => {
          const g = `${s}${l}`;
          if (Ht(g, e) >= t) {
            const h = n + 1,
              p = o.length === h,
              u = `${g}${i}`;
            (a.push(p ? g : u), (s = ''));
          } else s = g;
        }),
        { hyphenatedStrings: a, remainingWord: s }
      );
    },
    (r, t, i = '-', e) => `${r}${t}${i}${e.fontSize}${e.fontWeight}${e.fontFamily}`,
  );
function il(r, t) {
  return ze(r, t).height;
}
d(il, 'calculateTextHeight');
function Ht(r, t) {
  return ze(r, t).width;
}
d(Ht, 'calculateTextWidth');
var ze = ii(
    (r, t) => {
      const { fontSize: i = 12, fontFamily: e = 'Arial', fontWeight: o = 400 } = t;
      if (!r) return { width: 0, height: 0 };
      const [, a] = _i(i),
        s = ['sans-serif', e],
        l = r.split(ti.lineBreakRegex),
        n = [],
        g = K('body');
      if (!g.remove) return { width: 0, height: 0, lineHeight: 0 };
      const c = g.append('svg');
      for (const p of s) {
        let u = 0;
        const f = { width: 0, height: 0, lineHeight: 0 };
        for (const C of l) {
          const x = cu();
          x.text = C || tu;
          const y = du(c, x).style('font-size', a).style('font-weight', o).style('font-family', p),
            b = (y._groups || y)[0][0].getBBox();
          if (b.width === 0 && b.height === 0) throw new Error('svg element not in render tree');
          ((f.width = Math.round(Math.max(f.width, b.width))),
            (u = Math.round(b.height)),
            (f.height += u),
            (f.lineHeight = Math.round(Math.max(f.lineHeight, u))));
        }
        n.push(f);
      }
      c.remove();
      const h =
        isNaN(n[1].height) ||
        isNaN(n[1].width) ||
        isNaN(n[1].lineHeight) ||
        (n[0].height > n[1].height && n[0].width > n[1].width && n[0].lineHeight > n[1].lineHeight)
          ? 0
          : 1;
      return n[h];
    },
    (r, t) => `${r}${t.fontSize}${t.fontWeight}${t.fontFamily}`,
  ),
  Er,
  pu =
    ((Er = class {
      constructor(t = !1, i) {
        ((this.count = 0),
          (this.count = i ? i.length : 0),
          (this.next = t ? () => this.count++ : () => Date.now()));
      }
    }),
    d(Er, 'InitIDGenerator'),
    Er),
  oi,
  fu = d(function (r) {
    return (
      (oi = oi || document.createElement('div')),
      (r = escape(r).replace(/%26/g, '&').replace(/%23/g, '#').replace(/%3B/g, ';')),
      (oi.innerHTML = r),
      unescape(oi.textContent)
    );
  }, 'entityDecode');
function Ne(r) {
  return 'str' in r;
}
d(Ne, 'isDetailedError');
var mu = d((r, t, i, e) => {
    if (!e) return;
    const o = r.node()?.getBBox();
    o &&
      r
        .append('text')
        .text(e)
        .attr('text-anchor', 'middle')
        .attr('x', o.x + o.width / 2)
        .attr('y', -i)
        .attr('class', t);
  }, 'insertTitle'),
  _i = d((r) => {
    if (typeof r == 'number') return [r, r + 'px'];
    const t = parseInt(r ?? '', 10);
    return Number.isNaN(t) ? [void 0, void 0] : r === String(t) ? [t, r + 'px'] : [t, r];
  }, 'parseFontSize');
function He(r, t) {
  return Jg({}, r, t);
}
d(He, 'cleanAndMerge');
var Ft = {
    assignWithDepth: ht,
    wrapLabel: gu,
    calculateTextHeight: il,
    calculateTextWidth: Ht,
    calculateTextDimensions: ze,
    cleanAndMerge: He,
    detectInit: eu,
    detectDirective: Gs,
    isSubstringInArray: au,
    interpolateToCurve: qe,
    calcLabelPosition: Zs,
    calcCardinalityPosition: lu,
    calcTerminalLabelPosition: Js,
    formatUrl: Ks,
    getStylesFromArray: tl,
    generateId: nu,
    random: hu,
    runFunc: su,
    entityDecode: fu,
    insertTitle: mu,
    isLabelCoordinateInPath: el,
    parseFontSize: _i,
    InitIDGenerator: pu,
  },
  Cu = d(function (r) {
    let t = r;
    return (
      (t = t.replace(/style.*:\S*#.*;/g, function (i) {
        return i.substring(0, i.length - 1);
      })),
      (t = t.replace(/classDef.*:\S*#.*;/g, function (i) {
        return i.substring(0, i.length - 1);
      })),
      (t = t.replace(/#\w+;/g, function (i) {
        const e = i.substring(1, i.length - 1);
        return /^\+?\d+$/.test(e) ? 'ﬂ°°' + e + '¶ß' : 'ﬂ°' + e + '¶ß';
      })),
      t
    );
  }, 'encodeEntities'),
  cr = d(function (r) {
    return r.replace(/ﬂ°°/g, '&#').replace(/ﬂ°/g, '&').replace(/¶ß/g, ';');
  }, 'decodeEntities'),
  VC = d(
    (r, t, { counter: i = 0, prefix: e, suffix: o }, a) =>
      a || `${e ? `${e}_` : ''}${r}_${t}_${i}${o ? `_${o}` : ''}`,
    'getEdgeId',
  );
function dt(r) {
  return r ?? null;
}
d(dt, 'handleUndefinedAttr');
function el(r, t) {
  const i = Math.round(r.x),
    e = Math.round(r.y),
    o = t.replace(/(\d+\.\d+)/g, (a) => Math.round(parseFloat(a)).toString());
  return o.includes(i.toString()) || o.includes(e.toString());
}
d(el, 'isLabelCoordinateInPath');
var Ye = d(({ flowchart: r }) => {
  const t = r?.subGraphTitleMargin?.top ?? 0,
    i = r?.subGraphTitleMargin?.bottom ?? 0,
    e = t + i;
  return { subGraphTitleTopMargin: t, subGraphTitleBottomMargin: i, subGraphTitleTotalMargin: e };
}, 'getSubGraphTitleMargins');
async function ol(r, t) {
  const i = r.getElementsByTagName('img');
  if (!i || i.length === 0) return;
  const e = t.replace(/<img[^>]*>/g, '').trim() === '';
  await Promise.all(
    [...i].map(
      (o) =>
        new Promise((a) => {
          function s() {
            if (((o.style.display = 'flex'), (o.style.flexDirection = 'column'), e)) {
              const l = it().fontSize
                  ? it().fontSize
                  : window.getComputedStyle(document.body).fontSize,
                n = 5,
                [g = Go.fontSize] = _i(l),
                c = g * n + 'px';
              ((o.style.minWidth = c), (o.style.maxWidth = c));
            } else o.style.width = '100%';
            a(o);
          }
          (d(s, 'setupImage'),
            setTimeout(() => {
              o.complete && s();
            }),
            o.addEventListener('error', s),
            o.addEventListener('load', s));
        }),
    ),
  );
}
d(ol, 'configureLabelImages');
var yu = d((r) => {
    const { handDrawnSeed: t } = it();
    return {
      fill: r,
      hachureAngle: 120,
      hachureGap: 4,
      fillWeight: 2,
      roughness: 0.7,
      stroke: r,
      seed: t,
    };
  }, 'solidStateFill'),
  $r = d((r) => {
    const t = xu([...(r.cssCompiledStyles || []), ...(r.cssStyles || []), ...(r.labelStyle || [])]);
    return { stylesMap: t, stylesArray: [...t] };
  }, 'compileStyles'),
  xu = d((r) => {
    const t = new Map();
    return (
      r.forEach((i) => {
        const [e, o] = i.split(':');
        t.set(e.trim(), o?.trim());
      }),
      t
    );
  }, 'styles2Map'),
  al = d(
    (r) =>
      r === 'color' ||
      r === 'font-size' ||
      r === 'font-family' ||
      r === 'font-weight' ||
      r === 'font-style' ||
      r === 'text-decoration' ||
      r === 'text-align' ||
      r === 'text-transform' ||
      r === 'line-height' ||
      r === 'letter-spacing' ||
      r === 'word-spacing' ||
      r === 'text-shadow' ||
      r === 'text-overflow' ||
      r === 'white-space' ||
      r === 'word-wrap' ||
      r === 'word-break' ||
      r === 'overflow-wrap' ||
      r === 'hyphens',
    'isLabelStyle',
  ),
  H = d((r) => {
    const { stylesArray: t } = $r(r),
      i = [],
      e = [],
      o = [],
      a = [];
    return (
      t.forEach((s) => {
        const l = s[0];
        al(l)
          ? i.push(s.join(':') + ' !important')
          : (e.push(s.join(':') + ' !important'),
            l.includes('stroke') && o.push(s.join(':') + ' !important'),
            l === 'fill' && a.push(s.join(':') + ' !important'));
      }),
      {
        labelStyles: i.join(';'),
        nodeStyles: e.join(';'),
        stylesArray: t,
        borderStyles: o,
        backgroundStyles: a,
      }
    );
  }, 'styles2String'),
  N = d((r, t) => {
    const { themeVariables: i, handDrawnSeed: e } = it(),
      { nodeBorder: o, mainBkg: a } = i,
      { stylesMap: s } = $r(r);
    return Object.assign(
      {
        roughness: 0.7,
        fill: s.get('fill') || a,
        fillStyle: 'hachure',
        fillWeight: 4,
        hachureGap: 5.2,
        stroke: s.get('stroke') || o,
        seed: e,
        strokeWidth: s.get('stroke-width')?.replace('px', '') || 1.3,
        fillLineDash: [0, 0],
        strokeLineDash: bu(s.get('stroke-dasharray')),
      },
      t,
    );
  }, 'userNodeOverrides'),
  bu = d((r) => {
    if (!r) return [0, 0];
    const t = r.trim().split(/\s+/).map(Number);
    if (t.length === 1) {
      const o = isNaN(t[0]) ? 0 : t[0];
      return [o, o];
    }
    const i = isNaN(t[0]) ? 0 : t[0],
      e = isNaN(t[1]) ? 0 : t[1];
    return [i, e];
  }, 'getStrokeDashArray'),
  ku = {
    body: '<g><rect width="80" height="80" style="fill: #087ebf; stroke-width: 0px;"/><text transform="translate(21.16 64.67)" style="fill: #fff; font-family: ArialMT, Arial; font-size: 67.75px;"><tspan x="0" y="0">?</tspan></text></g>',
    height: 80,
    width: 80,
  },
  ce = new Map(),
  sl = new Map(),
  Bu = d((r) => {
    for (const t of r) {
      if (!t.name)
        throw new Error(
          'Invalid icon loader. Must have a "name" property with non-empty string value.',
        );
      if ((F.debug('Registering icon pack:', t.name), 'loader' in t)) sl.set(t.name, t.loader);
      else if ('icons' in t) ce.set(t.name, t.icons);
      else
        throw (
          F.error('Invalid icon loader:', t),
          new Error('Invalid icon loader. Must have either "icons" or "loader" property.')
        );
    }
  }, 'registerIconPacks'),
  ll = d(async (r, t) => {
    const i = lc(r, !0, t !== void 0);
    if (!i) throw new Error(`Invalid icon name: ${r}`);
    const e = i.prefix || t;
    if (!e) throw new Error(`Icon name must contain a prefix: ${r}`);
    let o = ce.get(e);
    if (!o) {
      const s = sl.get(e);
      if (!s) throw new Error(`Icon set not found: ${i.prefix}`);
      try {
        ((o = { ...(await s()), prefix: e }), ce.set(e, o));
      } catch (l) {
        throw (F.error(l), new Error(`Failed to load icon set: ${i.prefix}`));
      }
    }
    const a = nc(o, i.name);
    if (!a) throw new Error(`Icon not found: ${r}`);
    return a;
  }, 'getRegisteredIconData'),
  Tu = d(async (r) => {
    try {
      return (await ll(r), !0);
    } catch {
      return !1;
    }
  }, 'isIconAvailable'),
  ei = d(async (r, t, i) => {
    let e;
    try {
      e = await ll(r, t?.fallbackPrefix);
    } catch (s) {
      (F.error(s), (e = ku));
    }
    const o = oc(e, t),
      a = ac(sc(o.body), { ...o.attributes, ...i });
    return At(a, at());
  }, 'getIconSVG');
function nl(r, { markdownAutoWrap: t }) {
  const e = r
    .replace(
      /<br\/>/g,
      `
`,
    )
    .replace(
      /\n{2,}/g,
      `
`,
    );
  return No(e);
}
d(nl, 'preprocessMarkdown');
function hl(r) {
  return r.split(/\\n|\n|<br\s*\/?>/gi).map(
    (t) =>
      t
        .trim()
        .match(/<[^>]+>|[^\s<>]+/g)
        ?.map((i) => ({ content: i, type: 'normal' })) ?? [],
  );
}
d(hl, 'nonMarkdownToLines');
function cl(r, t = {}) {
  const i = nl(r, t),
    e = zo.lexer(i),
    o = [[]];
  let a = 0;
  function s(l, n = 'normal') {
    l.type === 'text'
      ? l.text
          .split(
            `
`,
          )
          .forEach((c, h) => {
            (h !== 0 && (a++, o.push([])),
              c.split(' ').forEach((p) => {
                ((p = p.replace(/&#39;/g, "'")), p && o[a].push({ content: p, type: n }));
              }));
          })
      : l.type === 'strong' || l.type === 'em'
        ? l.tokens.forEach((g) => {
            s(g, l.type);
          })
        : l.type === 'html' && o[a].push({ content: l.text, type: 'normal' });
  }
  return (
    d(s, 'processNode'),
    e.forEach((l) => {
      l.type === 'paragraph'
        ? l.tokens?.forEach((n) => {
            s(n);
          })
        : l.type === 'html'
          ? o[a].push({ content: l.text, type: 'normal' })
          : o[a].push({ content: l.raw, type: 'normal' });
    }),
    o
  );
}
d(cl, 'markdownToLines');
function dl(r) {
  return r ? `<p>${r.replace(/\\n|\n/g, '<br />')}</p>` : '';
}
d(dl, 'nonMarkdownToHTML');
function gl(r, { markdownAutoWrap: t } = {}) {
  const i = zo.lexer(r);
  function e(o) {
    return o.type === 'text'
      ? t === !1
        ? o.text.replace(/\n */g, '<br/>').replace(/ /g, '&nbsp;')
        : o.text.replace(/\n */g, '<br/>')
      : o.type === 'strong'
        ? `<strong>${o.tokens?.map(e).join('')}</strong>`
        : o.type === 'em'
          ? `<em>${o.tokens?.map(e).join('')}</em>`
          : o.type === 'paragraph'
            ? `<p>${o.tokens?.map(e).join('')}</p>`
            : o.type === 'space'
              ? ''
              : o.type === 'html'
                ? `${o.text}`
                : o.type === 'escape'
                  ? o.text
                  : (F.warn(`Unsupported markdown: ${o.type}`), o.raw);
  }
  return (d(e, 'output'), i.map(e).join(''));
}
d(gl, 'markdownToHTML');
function ul(r) {
  return Intl.Segmenter ? [...new Intl.Segmenter().segment(r)].map((t) => t.segment) : [...r];
}
d(ul, 'splitTextToChars');
function pl(r, t) {
  const i = ul(t.content);
  return je(r, [], i, t.type);
}
d(pl, 'splitWordToFitWidth');
function je(r, t, i, e) {
  if (i.length === 0)
    return [
      { content: t.join(''), type: e },
      { content: '', type: e },
    ];
  const [o, ...a] = i,
    s = [...t, o];
  return r([{ content: s.join(''), type: e }])
    ? je(r, s, a, e)
    : (t.length === 0 && o && (t.push(o), i.shift()),
      [
        { content: t.join(''), type: e },
        { content: i.join(''), type: e },
      ]);
}
d(je, 'splitWordToFitWidthRecursion');
function fl(r, t) {
  if (
    r.some(({ content: i }) =>
      i.includes(`
`),
    )
  )
    throw new Error('splitLineToFitWidth does not support newlines in the line');
  return Ti(r, t);
}
d(fl, 'splitLineToFitWidth');
function Ti(r, t, i = [], e = []) {
  if (r.length === 0) return (e.length > 0 && i.push(e), i.length > 0 ? i : []);
  let o = '';
  r[0].content === ' ' && ((o = ' '), r.shift());
  const a = r.shift() ?? { content: ' ', type: 'normal' },
    s = [...e];
  if ((o !== '' && s.push({ content: o, type: 'normal' }), s.push(a), t(s))) return Ti(r, t, i, s);
  if (e.length > 0) (i.push(e), r.unshift(a));
  else if (a.content) {
    const [l, n] = pl(t, a);
    (i.push([l]), n.content && r.unshift(n));
  }
  return Ti(r, t, i);
}
d(Ti, 'splitLineToFitWidthRecursion');
function de(r, t) {
  t && r.attr('style', t);
}
d(de, 'applyStyle');
var go = 16384;
async function ml(r, t, i, e, o = !1, a = at()) {
  const s = r.append('foreignObject');
  (s.attr('width', `${Math.min(10 * i, go)}px`), s.attr('height', `${Math.min(10 * i, go)}px`));
  const l = s.append('xhtml:div'),
    n = Xr(t.label)
      ? await aa(
          t.label.replace(
            ti.lineBreakRegex,
            `
`,
          ),
          a,
        )
      : At(t.label, a),
    g = t.isNode ? 'nodeLabel' : 'edgeLabel',
    c = l.append('span');
  (c.html(n),
    de(c, t.labelStyle),
    c.attr('class', `${g} ${e}`),
    de(l, t.labelStyle),
    l.style('display', 'table-cell'),
    l.style('white-space', 'nowrap'),
    l.style('line-height', '1.5'),
    i !== Number.POSITIVE_INFINITY &&
      (l.style('max-width', i + 'px'), l.style('text-align', 'center')),
    l.attr('xmlns', 'http://www.w3.org/1999/xhtml'),
    o && l.attr('class', 'labelBkg'));
  let h = l.node().getBoundingClientRect();
  return (
    h.width === i &&
      (l.style('display', 'table'),
      l.style('white-space', 'break-spaces'),
      l.style('width', i + 'px'),
      (h = l.node().getBoundingClientRect())),
    s.node()
  );
}
d(ml, 'addHtmlSpan');
function Ai(r, t, i, e = !1) {
  const o = r
    .append('tspan')
    .attr('class', 'text-outer-tspan')
    .attr('x', 0)
    .attr('y', t * i - 0.1 + 'em')
    .attr('dy', i + 'em');
  return (e && o.attr('text-anchor', 'middle'), o);
}
d(Ai, 'createTspan');
function Cl(r, t, i) {
  const e = r.append('text'),
    o = Ai(e, 1, t);
  Ei(o, i);
  const a = o.node().getComputedTextLength();
  return (e.remove(), a);
}
d(Cl, 'computeWidthOfText');
function Su(r, t, i) {
  const e = r.append('text'),
    o = Ai(e, 1, t);
  Ei(o, [{ content: i, type: 'normal' }]);
  const a = o.node()?.getBoundingClientRect();
  return (a && e.remove(), a);
}
d(Su, 'computeDimensionOfText');
function yl(r, t, i, e = !1, o = !1) {
  const s = t.append('g'),
    l = s.insert('rect').attr('class', 'background').attr('style', 'stroke: none'),
    n = s.append('text').attr('y', '-10.1');
  o && n.attr('text-anchor', 'middle');
  let g = 0;
  for (const c of i) {
    const h = d((u) => Cl(s, 1.1, u) <= r, 'checkWidth'),
      p = h(c) ? [c] : fl(c, h);
    for (const u of p) {
      const f = Ai(n, g, 1.1, o);
      (Ei(f, u), g++);
    }
  }
  if (e) {
    const c = n.node().getBBox(),
      h = 2;
    return (
      l
        .attr('x', c.x - h)
        .attr('y', c.y - h)
        .attr('width', c.width + 2 * h)
        .attr('height', c.height + 2 * h),
      s.node()
    );
  } else return n.node();
}
d(yl, 'createFormattedText');
function ge(r) {
  const t = /&(amp|lt|gt);/g;
  return r.replace(t, (i, e) => {
    switch (e) {
      case 'amp':
        return '&';
      case 'lt':
        return '<';
      case 'gt':
        return '>';
      default:
        return i;
    }
  });
}
d(ge, 'decodeHTMLEntities');
function Ei(r, t) {
  (r.text(''),
    t.forEach((i, e) => {
      const o = r
        .append('tspan')
        .attr('font-style', i.type === 'em' ? 'italic' : 'normal')
        .attr('class', 'text-inner-tspan')
        .attr('font-weight', i.type === 'strong' ? 'bold' : 'normal');
      e === 0 ? o.text(ge(i.content)) : o.text(' ' + ge(i.content));
    }));
}
d(Ei, 'updateTextContentAndStyles');
async function xl(r, t = {}) {
  const i = [];
  r.replace(
    /(fa[bklrs]?):fa-([\w-]+)/g,
    (o, a, s) => (
      i.push(
        (async () => {
          const l = `${a}:${s}`;
          return (await Tu(l))
            ? await ei(l, void 0, { class: 'label-icon' })
            : `<i class='${At(o, t).replace(':', ' ')}'></i>`;
        })(),
      ),
      o
    ),
  );
  const e = await Promise.all(i);
  return r.replace(/(fa[bklrs]?):fa-([\w-]+)/g, () => e.shift() ?? '');
}
d(xl, 'replaceIconSubstring');
var Xt = d(
    async (
      r,
      t = '',
      {
        style: i = '',
        isTitle: e = !1,
        classes: o = '',
        useHtmlLabels: a = !0,
        markdown: s = !0,
        isNode: l = !0,
        width: n = 200,
        addSvgBackground: g = !1,
      } = {},
      c,
    ) => {
      if ((F.debug('XYZ createText', t, i, e, o, a, l, 'addSvgBackground: ', g), a)) {
        const h = s ? gl(t, c) : dl(t),
          p = await xl(cr(h), c),
          u = t.replace(/\\\\/g, '\\'),
          f = { isNode: l, label: Xr(t) ? u : p, labelStyle: i.replace('fill:', 'color:') };
        return await ml(r, f, n, o, g, c);
      } else {
        const h = cr(t.replace(/<br\s*\/?>/g, '<br/>')),
          p = s ? cl(h.replace('<br>', '<br/>'), c) : hl(h),
          u = yl(n, r, p, t ? g : !1, !l);
        if (l) {
          /stroke:/.exec(i) && (i = i.replace('stroke:', 'lineColor:'));
          const f = i
            .replace(/stroke:[^;]+;?/g, '')
            .replace(/stroke-width:[^;]+;?/g, '')
            .replace(/fill:[^;]+;?/g, '')
            .replace(/color:/g, 'fill:');
          K(u).attr('style', f);
        } else {
          const f = i
            .replace(/stroke:[^;]+;?/g, '')
            .replace(/stroke-width:[^;]+;?/g, '')
            .replace(/fill:[^;]+;?/g, '')
            .replace(/background:/g, 'fill:');
          K(u)
            .select('rect')
            .attr('style', f.replace(/background:/g, 'fill:'));
          const C = i
            .replace(/stroke:[^;]+;?/g, '')
            .replace(/stroke-width:[^;]+;?/g, '')
            .replace(/fill:[^;]+;?/g, '')
            .replace(/color:/g, 'fill:');
          K(u).select('text').attr('style', C);
        }
        return (
          e
            ? K(u).selectAll('tspan.text-outer-tspan').classed('title-row', !0)
            : K(u).selectAll('tspan.text-outer-tspan').classed('row', !0),
          u
        );
      }
    },
    'createText',
  ),
  V = d(async (r, t, i) => {
    let e;
    const o = t.useHtmlLabels || jt(it()?.htmlLabels);
    i ? (e = i) : (e = 'node default');
    const a = r
        .insert('g')
        .attr('class', e)
        .attr('id', t.domId || t.id),
      s = a.insert('g').attr('class', 'label').attr('style', dt(t.labelStyle));
    let l;
    t.label === void 0 ? (l = '') : (l = typeof t.label == 'string' ? t.label : t.label[0]);
    const n = !!t.icon || !!t.img,
      g = t.labelType === 'markdown',
      c = await Xt(
        s,
        At(cr(l), it()),
        {
          useHtmlLabels: o,
          width: t.width || it().flowchart?.wrappingWidth,
          classes: g ? 'markdown-node-label' : '',
          style: t.labelStyle,
          addSvgBackground: n,
          markdown: g,
        },
        it(),
      );
    let h = c.getBBox();
    const p = (t?.padding ?? 0) / 2;
    if (o) {
      const u = c.children[0],
        f = K(c);
      (await ol(u, l),
        (h = u.getBoundingClientRect()),
        f.attr('width', h.width),
        f.attr('height', h.height));
    }
    return (
      o
        ? s.attr('transform', 'translate(' + -h.width / 2 + ', ' + -h.height / 2 + ')')
        : s.attr('transform', 'translate(0, ' + -h.height / 2 + ')'),
      t.centerLabel &&
        s.attr('transform', 'translate(' + -h.width / 2 + ', ' + -h.height / 2 + ')'),
      s.insert('rect', ':first-child'),
      { shapeSvg: a, bbox: h, halfPadding: p, label: s }
    );
  }, 'labelHelper'),
  Pi = d(async (r, t, i) => {
    const e = i.useHtmlLabels ?? kt(it()),
      o = r
        .insert('g')
        .attr('class', 'label')
        .attr('style', i.labelStyle || ''),
      a = await Xt(o, At(cr(t), it()), {
        useHtmlLabels: e,
        width: i.width || it()?.flowchart?.wrappingWidth,
        style: i.labelStyle,
        addSvgBackground: !!i.icon || !!i.img,
      });
    let s = a.getBBox();
    const l = i.padding / 2;
    if (kt(it())) {
      const n = a.children[0],
        g = K(a);
      ((s = n.getBoundingClientRect()), g.attr('width', s.width), g.attr('height', s.height));
    }
    return (
      e
        ? o.attr('transform', 'translate(' + -s.width / 2 + ', ' + -s.height / 2 + ')')
        : o.attr('transform', 'translate(0, ' + -s.height / 2 + ')'),
      i.centerLabel &&
        o.attr('transform', 'translate(' + -s.width / 2 + ', ' + -s.height / 2 + ')'),
      o.insert('rect', ':first-child'),
      { shapeSvg: r, bbox: s, halfPadding: l, label: o }
    );
  }, 'insertLabel'),
  Y = d((r, t) => {
    const i = t.node().getBBox();
    ((r.width = i.width), (r.height = i.height));
  }, 'updateNodeBounds'),
  U = d(
    (r, t) =>
      (r.look === 'handDrawn' ? 'rough-node' : 'node') + ' ' + r.cssClasses + ' ' + (t || ''),
    'getNodeClasses',
  );
function J(r) {
  const t = r.map((i, e) => `${e === 0 ? 'M' : 'L'}${i.x},${i.y}`);
  return (t.push('Z'), t.join(' '));
}
d(J, 'createPathFromPoints');
function Zt(r, t, i, e, o, a) {
  const s = [],
    n = i - r,
    g = e - t,
    c = n / a,
    h = (2 * Math.PI) / c,
    p = t + g / 2;
  for (let u = 0; u <= 50; u++) {
    const f = u / 50,
      C = r + f * n,
      x = p + o * Math.sin(h * (C - r));
    s.push({ x: C, y: x });
  }
  return s;
}
d(Zt, 'generateFullSineWavePoints');
function Qr(r, t, i, e, o, a) {
  const s = [],
    l = (o * Math.PI) / 180,
    c = ((a * Math.PI) / 180 - l) / (e - 1);
  for (let h = 0; h < e; h++) {
    const p = l + h * c,
      u = r + i * Math.cos(p),
      f = t + i * Math.sin(p);
    s.push({ x: -u, y: -f });
  }
  return s;
}
d(Qr, 'generateCirclePoints');
function ue(r) {
  const t = Array.from(r.childNodes).filter((n) => n.tagName === 'path'),
    i = document.createElementNS('http://www.w3.org/2000/svg', 'path'),
    e = t
      .map((n) => n.getAttribute('d'))
      .filter((n) => n !== null)
      .join(' ');
  i.setAttribute('d', e);
  const o = t.find((n) => n.getAttribute('fill') !== 'none'),
    a = t.find((n) => n.getAttribute('stroke') !== 'none'),
    s = d((n, g) => n?.getAttribute(g) ?? void 0, 'getAttr');
  if (o) {
    const n = { fill: s(o, 'fill'), 'fill-opacity': s(o, 'fill-opacity') ?? '1' };
    Object.entries(n).forEach(([g, c]) => {
      c && i.setAttribute(g, c);
    });
  }
  if (a) {
    const n = {
      stroke: s(a, 'stroke'),
      'stroke-width': s(a, 'stroke-width') ?? '1',
      'stroke-opacity': s(a, 'stroke-opacity') ?? '1',
    };
    Object.entries(n).forEach(([g, c]) => {
      c && i.setAttribute(g, c);
    });
  }
  const l = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  return (l.appendChild(i), l);
}
d(ue, 'mergePaths');
var wu = d((r, t) => {
    var i = r.x,
      e = r.y,
      o = t.x - i,
      a = t.y - e,
      s = r.width / 2,
      l = r.height / 2,
      n,
      g;
    return (
      Math.abs(a) * s > Math.abs(o) * l
        ? (a < 0 && (l = -l), (n = a === 0 ? 0 : (l * o) / a), (g = l))
        : (o < 0 && (s = -s), (n = s), (g = o === 0 ? 0 : (s * a) / o)),
      { x: i + n, y: e + g }
    );
  }, 'intersectRect'),
  Pr = wu,
  vu = d(async (r, t, i, e = !1, o = !1) => {
    let a = t || '';
    typeof a == 'object' && (a = a[0]);
    const s = it(),
      l = kt(s);
    return await Xt(
      r,
      a,
      {
        style: i,
        isTitle: e,
        useHtmlLabels: l,
        markdown: !1,
        isNode: o,
        width: Number.POSITIVE_INFINITY,
      },
      s,
    );
  }, 'createLabel'),
  Gt = vu,
  Jt = d(
    (r, t, i, e, o) =>
      [
        'M',
        r + o,
        t,
        'H',
        r + i - o,
        'A',
        o,
        o,
        0,
        0,
        1,
        r + i,
        t + o,
        'V',
        t + e - o,
        'A',
        o,
        o,
        0,
        0,
        1,
        r + i - o,
        t + e,
        'H',
        r + o,
        'A',
        o,
        o,
        0,
        0,
        1,
        r,
        t + e - o,
        'V',
        t + o,
        'A',
        o,
        o,
        0,
        0,
        1,
        r + o,
        t,
        'Z',
      ].join(' '),
    'createRoundedRectPathD',
  ),
  bl = d(async (r, t) => {
    F.info('Creating subgraph rect for ', t.id, t);
    const i = it(),
      { themeVariables: e, handDrawnSeed: o } = i,
      { clusterBkg: a, clusterBorder: s } = e,
      { labelStyles: l, nodeStyles: n, borderStyles: g, backgroundStyles: c } = H(t),
      h = r
        .insert('g')
        .attr('class', 'cluster ' + t.cssClasses)
        .attr('id', t.domId)
        .attr('data-look', t.look),
      p = kt(i),
      u = h.insert('g').attr('class', 'cluster-label ');
    let f;
    t.labelType === 'markdown'
      ? (f = await Xt(u, t.label, {
          style: t.labelStyle,
          useHtmlLabels: p,
          isNode: !0,
          width: t.width,
        }))
      : (f = await Gt(u, t.label, t.labelStyle || '', !1, !0));
    let C = f.getBBox();
    if (kt(i)) {
      const A = f.children[0],
        _ = K(f);
      ((C = A.getBoundingClientRect()), _.attr('width', C.width), _.attr('height', C.height));
    }
    const x = t.width <= C.width + t.padding ? C.width + t.padding : t.width;
    t.width <= C.width + t.padding
      ? (t.diff = (x - t.width) / 2 - t.padding)
      : (t.diff = -t.padding);
    const y = t.height,
      b = t.x - x / 2,
      k = t.y - y / 2;
    F.trace('Data ', t, JSON.stringify(t));
    let S;
    if (t.look === 'handDrawn') {
      const A = z.svg(h),
        _ = N(t, { roughness: 0.7, fill: a, stroke: s, fillWeight: 3, seed: o }),
        M = A.path(Jt(b, k, x, y, 0), _);
      ((S = h.insert(() => (F.debug('Rough node insert CXC', M), M), ':first-child')),
        S.select('path:nth-child(2)').attr('style', g.join(';')),
        S.select('path').attr('style', c.join(';').replace('fill', 'stroke')));
    } else
      ((S = h.insert('rect', ':first-child')),
        S.attr('style', n)
          .attr('rx', t.rx)
          .attr('ry', t.ry)
          .attr('x', b)
          .attr('y', k)
          .attr('width', x)
          .attr('height', y));
    const { subGraphTitleTopMargin: T } = Ye(i);
    if ((u.attr('transform', `translate(${t.x - C.width / 2}, ${t.y - t.height / 2 + T})`), l)) {
      const A = u.select('span');
      A && A.attr('style', l);
    }
    const L = S.node().getBBox();
    return (
      (t.offsetX = 0),
      (t.width = L.width),
      (t.height = L.height),
      (t.offsetY = C.height - t.padding / 2),
      (t.intersect = function (A) {
        return Pr(t, A);
      }),
      { cluster: h, labelBBox: C }
    );
  }, 'rect'),
  Lu = d((r, t) => {
    const i = r.insert('g').attr('class', 'note-cluster').attr('id', t.domId),
      e = i.insert('rect', ':first-child'),
      o = 0 * t.padding,
      a = o / 2;
    e.attr('rx', t.rx)
      .attr('ry', t.ry)
      .attr('x', t.x - t.width / 2 - a)
      .attr('y', t.y - t.height / 2 - a)
      .attr('width', t.width + o)
      .attr('height', t.height + o)
      .attr('fill', 'none');
    const s = e.node().getBBox();
    return (
      (t.width = s.width),
      (t.height = s.height),
      (t.intersect = function (l) {
        return Pr(t, l);
      }),
      { cluster: i, labelBBox: { width: 0, height: 0 } }
    );
  }, 'noteGroup'),
  Fu = d(async (r, t) => {
    const i = it(),
      { themeVariables: e, handDrawnSeed: o } = i,
      { altBackground: a, compositeBackground: s, compositeTitleBackground: l, nodeBorder: n } = e,
      g = r
        .insert('g')
        .attr('class', t.cssClasses)
        .attr('id', t.domId)
        .attr('data-id', t.id)
        .attr('data-look', t.look),
      c = g.insert('g', ':first-child'),
      h = g.insert('g').attr('class', 'cluster-label');
    let p = g.append('rect');
    const u = await Gt(h, t.label, t.labelStyle, void 0, !0);
    let f = u.getBBox();
    if (kt(i)) {
      const M = u.children[0],
        E = K(u);
      ((f = M.getBoundingClientRect()), E.attr('width', f.width), E.attr('height', f.height));
    }
    const C = 0 * t.padding,
      x = C / 2,
      y = (t.width <= f.width + t.padding ? f.width + t.padding : t.width) + C;
    t.width <= f.width + t.padding
      ? (t.diff = (y - t.width) / 2 - t.padding)
      : (t.diff = -t.padding);
    const b = t.height + C,
      k = t.height + C - f.height - 6,
      S = t.x - y / 2,
      T = t.y - b / 2;
    t.width = y;
    const L = t.y - t.height / 2 - x + f.height + 2;
    let A;
    if (t.look === 'handDrawn') {
      const M = t.cssClasses.includes('statediagram-cluster-alt'),
        E = z.svg(g),
        O =
          t.rx || t.ry
            ? E.path(Jt(S, T, y, b, 10), {
                roughness: 0.7,
                fill: l,
                fillStyle: 'solid',
                stroke: n,
                seed: o,
              })
            : E.rectangle(S, T, y, b, { seed: o });
      A = g.insert(() => O, ':first-child');
      const $ = E.rectangle(S, L, y, k, {
        fill: M ? a : s,
        fillStyle: M ? 'hachure' : 'solid',
        stroke: n,
        seed: o,
      });
      ((A = g.insert(() => O, ':first-child')), (p = g.insert(() => $)));
    } else
      ((A = c.insert('rect', ':first-child')),
        A.attr('class', 'outer')
          .attr('x', S)
          .attr('y', T)
          .attr('width', y)
          .attr('height', b)
          .attr('data-look', t.look),
        p.attr('class', 'inner').attr('x', S).attr('y', L).attr('width', y).attr('height', k));
    h.attr('transform', `translate(${t.x - f.width / 2}, ${T + 1 - (kt(i) ? 0 : 3)})`);
    const _ = A.node().getBBox();
    return (
      (t.height = _.height),
      (t.offsetX = 0),
      (t.offsetY = f.height - t.padding / 2),
      (t.labelBBox = f),
      (t.intersect = function (M) {
        return Pr(t, M);
      }),
      { cluster: g, labelBBox: f }
    );
  }, 'roundedWithTitle'),
  _u = d(async (r, t) => {
    F.info('Creating subgraph rect for ', t.id, t);
    const i = it(),
      { themeVariables: e, handDrawnSeed: o } = i,
      { clusterBkg: a, clusterBorder: s } = e,
      { labelStyles: l, nodeStyles: n, borderStyles: g, backgroundStyles: c } = H(t),
      h = r
        .insert('g')
        .attr('class', 'cluster ' + t.cssClasses)
        .attr('id', t.domId)
        .attr('data-look', t.look),
      p = kt(i),
      u = h.insert('g').attr('class', 'cluster-label '),
      f = await Xt(u, t.label, {
        style: t.labelStyle,
        useHtmlLabels: p,
        isNode: !0,
        width: t.width,
      });
    let C = f.getBBox();
    if (kt(i)) {
      const A = f.children[0],
        _ = K(f);
      ((C = A.getBoundingClientRect()), _.attr('width', C.width), _.attr('height', C.height));
    }
    const x = t.width <= C.width + t.padding ? C.width + t.padding : t.width;
    t.width <= C.width + t.padding
      ? (t.diff = (x - t.width) / 2 - t.padding)
      : (t.diff = -t.padding);
    const y = t.height,
      b = t.x - x / 2,
      k = t.y - y / 2;
    F.trace('Data ', t, JSON.stringify(t));
    let S;
    if (t.look === 'handDrawn') {
      const A = z.svg(h),
        _ = N(t, { roughness: 0.7, fill: a, stroke: s, fillWeight: 4, seed: o }),
        M = A.path(Jt(b, k, x, y, t.rx), _);
      ((S = h.insert(() => (F.debug('Rough node insert CXC', M), M), ':first-child')),
        S.select('path:nth-child(2)').attr('style', g.join(';')),
        S.select('path').attr('style', c.join(';').replace('fill', 'stroke')));
    } else
      ((S = h.insert('rect', ':first-child')),
        S.attr('style', n)
          .attr('rx', t.rx)
          .attr('ry', t.ry)
          .attr('x', b)
          .attr('y', k)
          .attr('width', x)
          .attr('height', y));
    const { subGraphTitleTopMargin: T } = Ye(i);
    if ((u.attr('transform', `translate(${t.x - C.width / 2}, ${t.y - t.height / 2 + T})`), l)) {
      const A = u.select('span');
      A && A.attr('style', l);
    }
    const L = S.node().getBBox();
    return (
      (t.offsetX = 0),
      (t.width = L.width),
      (t.height = L.height),
      (t.offsetY = C.height - t.padding / 2),
      (t.intersect = function (A) {
        return Pr(t, A);
      }),
      { cluster: h, labelBBox: C }
    );
  }, 'kanbanSection'),
  Au = d((r, t) => {
    const i = it(),
      { themeVariables: e, handDrawnSeed: o } = i,
      { nodeBorder: a } = e,
      s = r.insert('g').attr('class', t.cssClasses).attr('id', t.domId).attr('data-look', t.look),
      l = s.insert('g', ':first-child'),
      n = 0 * t.padding,
      g = t.width + n;
    t.diff = -t.padding;
    const c = t.height + n,
      h = t.x - g / 2,
      p = t.y - c / 2;
    t.width = g;
    let u;
    if (t.look === 'handDrawn') {
      const x = z
        .svg(s)
        .rectangle(h, p, g, c, {
          fill: 'lightgrey',
          roughness: 0.5,
          strokeLineDash: [5],
          stroke: a,
          seed: o,
        });
      u = s.insert(() => x, ':first-child');
    } else {
      u = l.insert('rect', ':first-child');
      let C = 'outer';
      (t.look,
        (C = 'divider'),
        u
          .attr('class', C)
          .attr('x', h)
          .attr('y', p)
          .attr('width', g)
          .attr('height', c)
          .attr('data-look', t.look));
    }
    const f = u.node().getBBox();
    return (
      (t.height = f.height),
      (t.offsetX = 0),
      (t.offsetY = 0),
      (t.intersect = function (C) {
        return Pr(t, C);
      }),
      { cluster: s, labelBBox: {} }
    );
  }, 'divider'),
  Eu = bl,
  Mu = {
    rect: bl,
    squareRect: Eu,
    roundedWithTitle: Fu,
    noteGroup: Lu,
    divider: Au,
    kanbanSection: _u,
  },
  kl = new Map(),
  Ou = d(async (r, t) => {
    const i = t.shape || 'rect',
      e = await Mu[i](r, t);
    return (kl.set(t.id, e), e);
  }, 'insertCluster'),
  GC = d(() => {
    kl = new Map();
  }, 'clear');
function Bl(r, t) {
  return r.intersect(t);
}
d(Bl, 'intersectNode');
var Iu = Bl;
function Tl(r, t, i, e) {
  var o = r.x,
    a = r.y,
    s = o - e.x,
    l = a - e.y,
    n = Math.sqrt(t * t * l * l + i * i * s * s),
    g = Math.abs((t * i * s) / n);
  e.x < o && (g = -g);
  var c = Math.abs((t * i * l) / n);
  return (e.y < a && (c = -c), { x: o + g, y: a + c });
}
d(Tl, 'intersectEllipse');
var Sl = Tl;
function wl(r, t, i) {
  return Sl(r, t, t, i);
}
d(wl, 'intersectCircle');
var Du = wl;
function vl(r, t, i, e) {
  {
    const o = t.y - r.y,
      a = r.x - t.x,
      s = t.x * r.y - r.x * t.y,
      l = o * i.x + a * i.y + s,
      n = o * e.x + a * e.y + s,
      g = 1e-6;
    if (l !== 0 && n !== 0 && pe(l, n)) return;
    const c = e.y - i.y,
      h = i.x - e.x,
      p = e.x * i.y - i.x * e.y,
      u = c * r.x + h * r.y + p,
      f = c * t.x + h * t.y + p;
    if (Math.abs(u) < g && Math.abs(f) < g && pe(u, f)) return;
    const C = o * h - c * a;
    if (C === 0) return;
    const x = Math.abs(C / 2);
    let y = a * p - h * s;
    const b = y < 0 ? (y - x) / C : (y + x) / C;
    y = c * s - o * p;
    const k = y < 0 ? (y - x) / C : (y + x) / C;
    return { x: b, y: k };
  }
}
d(vl, 'intersectLine');
function pe(r, t) {
  return r * t > 0;
}
d(pe, 'sameSign');
var $u = vl;
function Ll(r, t, i) {
  let e = r.x,
    o = r.y,
    a = [],
    s = Number.POSITIVE_INFINITY,
    l = Number.POSITIVE_INFINITY;
  typeof t.forEach == 'function'
    ? t.forEach(function (c) {
        ((s = Math.min(s, c.x)), (l = Math.min(l, c.y)));
      })
    : ((s = Math.min(s, t.x)), (l = Math.min(l, t.y)));
  let n = e - r.width / 2 - s,
    g = o - r.height / 2 - l;
  for (let c = 0; c < t.length; c++) {
    let h = t[c],
      p = t[c < t.length - 1 ? c + 1 : 0],
      u = $u(r, i, { x: n + h.x, y: g + h.y }, { x: n + p.x, y: g + p.y });
    u && a.push(u);
  }
  return a.length
    ? (a.length > 1 &&
        a.sort(function (c, h) {
          let p = c.x - i.x,
            u = c.y - i.y,
            f = Math.sqrt(p * p + u * u),
            C = h.x - i.x,
            x = h.y - i.y,
            y = Math.sqrt(C * C + x * x);
          return f < y ? -1 : f === y ? 0 : 1;
        }),
      a[0])
    : r;
}
d(Ll, 'intersectPolygon');
var Pu = Ll,
  q = { node: Iu, circle: Du, ellipse: Sl, polygon: Pu, rect: Pr };
function Fl(r, t) {
  const { labelStyles: i } = H(t);
  t.labelStyle = i;
  const e = U(t);
  let o = e;
  e || (o = 'anchor');
  const a = r
      .insert('g')
      .attr('class', o)
      .attr('id', t.domId || t.id),
    s = 1,
    { cssStyles: l } = t,
    n = z.svg(a),
    g = N(t, { fill: 'black', stroke: 'none', fillStyle: 'solid' });
  t.look !== 'handDrawn' && (g.roughness = 0);
  const c = n.circle(0, 0, s * 2, g),
    h = a.insert(() => c, ':first-child');
  return (
    h.attr('class', 'anchor').attr('style', dt(l)),
    Y(t, h),
    (t.intersect = function (p) {
      return (F.info('Circle intersect', t, s, p), q.circle(t, s, p));
    }),
    a
  );
}
d(Fl, 'anchor');
function fe(r, t, i, e, o, a, s) {
  const n = (r + i) / 2,
    g = (t + e) / 2,
    c = Math.atan2(e - t, i - r),
    h = (i - r) / 2,
    p = (e - t) / 2,
    u = h / o,
    f = p / a,
    C = Math.sqrt(u ** 2 + f ** 2);
  if (C > 1) throw new Error('The given radii are too small to create an arc between the points.');
  const x = Math.sqrt(1 - C ** 2),
    y = n + x * a * Math.sin(c) * (s ? -1 : 1),
    b = g - x * o * Math.cos(c) * (s ? -1 : 1),
    k = Math.atan2((t - b) / a, (r - y) / o);
  let T = Math.atan2((e - b) / a, (i - y) / o) - k;
  (s && T < 0 && (T += 2 * Math.PI), !s && T > 0 && (T -= 2 * Math.PI));
  const L = [];
  for (let A = 0; A < 20; A++) {
    const _ = A / 19,
      M = k + _ * T,
      E = y + o * Math.cos(M),
      O = b + a * Math.sin(M);
    L.push({ x: E, y: O });
  }
  return L;
}
d(fe, 'generateArcPoints');
function _l(r, t, i) {
  const [e, o] = [t, i].sort((a, s) => s - a);
  return o * (1 - Math.sqrt(1 - (r / e / 2) ** 2));
}
d(_l, 'calculateArcSagitta');
async function Al(r, t) {
  const { labelStyles: i, nodeStyles: e } = H(t);
  t.labelStyle = i;
  const o = t.padding ?? 0,
    a = t.look === 'neo' ? 16 : o,
    s = t.look === 'neo' ? 12 : o,
    l = d((M) => M + s, 'calcTotalHeight'),
    n = d((M) => {
      const E = M / 2;
      return [E / (2.5 + M / 50), E];
    }, 'calcEllipseRadius'),
    { shapeSvg: g, bbox: c } = await V(r, t, U(t)),
    h = l(t?.height ? t?.height : c.height),
    [p, u] = n(h),
    f = _l(h, p, u),
    x = (t?.width ? t?.width : c.width) + a * 2 + f - f,
    y = h,
    { cssStyles: b } = t,
    k = [
      { x: x / 2, y: -y / 2 },
      { x: -x / 2, y: -y / 2 },
      ...fe(-x / 2, -y / 2, -x / 2, y / 2, p, u, !1),
      { x: x / 2, y: y / 2 },
      ...fe(x / 2, y / 2, x / 2, -y / 2, p, u, !0),
    ],
    S = z.svg(g),
    T = N(t, {});
  t.look !== 'handDrawn' && ((T.roughness = 0), (T.fillStyle = 'solid'));
  const L = J(k),
    A = S.path(L, T),
    _ = g.insert(() => A, ':first-child');
  return (
    _.attr('class', 'basic label-container outer-path'),
    b && t.look !== 'handDrawn' && _.selectAll('path').attr('style', b),
    e && t.look !== 'handDrawn' && _.selectAll('path').attr('style', e),
    _.attr('transform', `translate(${p / 2}, 0)`),
    Y(t, _),
    (t.intersect = function (M) {
      return q.polygon(t, k, M);
    }),
    g
  );
}
d(Al, 'bowTieRect');
function Ut(r, t, i, e) {
  return r
    .insert('polygon', ':first-child')
    .attr(
      'points',
      e
        .map(function (o) {
          return o.x + ',' + o.y;
        })
        .join(' '),
    )
    .attr('class', 'label-container')
    .attr('transform', 'translate(' + -t / 2 + ',' + i / 2 + ')');
}
d(Ut, 'insertPolygonShape');
var ai = 12;
async function El(r, t) {
  const { labelStyles: i, nodeStyles: e } = H(t);
  t.labelStyle = i;
  const o = t.padding ?? 0,
    a = t.look === 'neo' ? 28 : o,
    s = t.look === 'neo' ? 24 : o,
    { shapeSvg: l, bbox: n } = await V(r, t, U(t)),
    g = (t?.width ?? n.width) + (t.look === 'neo' ? a * 2 : a + ai),
    c = (t?.height ?? n.height) + (t.look === 'neo' ? s * 2 : s),
    h = 0,
    p = g,
    u = -c,
    f = 0,
    C = [
      { x: h + ai, y: u },
      { x: p, y: u },
      { x: p, y: f },
      { x: h, y: f },
      { x: h, y: u + ai },
      { x: h + ai, y: u },
    ];
  let x;
  const { cssStyles: y } = t;
  if (t.look === 'handDrawn') {
    const b = z.svg(l),
      k = N(t, {}),
      S = J(C),
      T = b.path(S, k);
    ((x = l.insert(() => T, ':first-child').attr('transform', `translate(${-g / 2}, ${c / 2})`)),
      y && x.attr('style', y));
  } else x = Ut(l, g, c, C);
  return (
    e && x.attr('style', e),
    Y(t, x),
    (t.intersect = function (b) {
      return q.polygon(t, C, b);
    }),
    l
  );
}
d(El, 'card');
function Ml(r, t) {
  const { nodeStyles: i } = H(t);
  t.label = '';
  const e = r
      .insert('g')
      .attr('class', U(t))
      .attr('id', t.domId ?? t.id),
    { cssStyles: o } = t,
    a = Math.max(28, t.width ?? 0),
    s = [
      { x: 0, y: a / 2 },
      { x: a / 2, y: 0 },
      { x: 0, y: -a / 2 },
      { x: -a / 2, y: 0 },
    ],
    l = z.svg(e),
    n = N(t, {});
  t.look !== 'handDrawn' && ((n.roughness = 0), (n.fillStyle = 'solid'));
  const g = J(s),
    c = l.path(g, n),
    h = e.insert(() => c, ':first-child');
  return (
    o && t.look !== 'handDrawn' && h.selectAll('path').attr('style', o),
    i && t.look !== 'handDrawn' && h.selectAll('path').attr('style', i),
    (t.width = 28),
    (t.height = 28),
    (t.intersect = function (p) {
      return q.polygon(t, s, p);
    }),
    e
  );
}
d(Ml, 'choice');
async function Xe(r, t, i) {
  const { labelStyles: e, nodeStyles: o } = H(t);
  t.labelStyle = e;
  const { shapeSvg: a, bbox: s, halfPadding: l } = await V(r, t, U(t)),
    n = 16,
    g = i?.padding ?? l,
    c = t.look === 'neo' ? s.width / 2 + n * 2 : s.width / 2 + g;
  let h;
  const { cssStyles: p } = t;
  if (t.look === 'handDrawn') {
    const u = z.svg(a),
      f = N(t, {}),
      C = u.circle(0, 0, c * 2, f);
    ((h = a.insert(() => C, ':first-child')),
      h.attr('class', 'basic label-container').attr('style', dt(p)));
  } else
    h = a
      .insert('circle', ':first-child')
      .attr('class', 'basic label-container')
      .attr('style', o)
      .attr('r', c)
      .attr('cx', 0)
      .attr('cy', 0);
  return (
    Y(t, h),
    (t.calcIntersect = function (u, f) {
      const C = u.width / 2;
      return q.circle(u, C, f);
    }),
    (t.intersect = function (u) {
      return (F.info('Circle intersect', t, c, u), q.circle(t, c, u));
    }),
    a
  );
}
d(Xe, 'circle');
function Ol(r) {
  const t = Math.cos(Math.PI / 4),
    i = Math.sin(Math.PI / 4),
    e = r * 2,
    o = { x: (e / 2) * t, y: (e / 2) * i },
    a = { x: -(e / 2) * t, y: (e / 2) * i },
    s = { x: -(e / 2) * t, y: -(e / 2) * i },
    l = { x: (e / 2) * t, y: -(e / 2) * i };
  return `M ${a.x},${a.y} L ${l.x},${l.y}
                   M ${o.x},${o.y} L ${s.x},${s.y}`;
}
d(Ol, 'createLine');
function Il(r, t) {
  const { labelStyles: i, nodeStyles: e } = H(t);
  ((t.labelStyle = i), (t.label = ''));
  const o = r
      .insert('g')
      .attr('class', U(t))
      .attr('id', t.domId ?? t.id),
    a = Math.max(30, t?.width ?? 0),
    { cssStyles: s } = t,
    l = z.svg(o),
    n = N(t, {});
  t.look !== 'handDrawn' && ((n.roughness = 0), (n.fillStyle = 'solid'));
  const g = l.circle(0, 0, a * 2, n),
    c = Ol(a),
    h = l.path(c, n),
    p = o.insert(() => g, ':first-child');
  return (
    p.insert(() => h),
    p.attr('class', 'outer-path'),
    s && t.look !== 'handDrawn' && p.selectAll('path').attr('style', s),
    e && t.look !== 'handDrawn' && p.selectAll('path').attr('style', e),
    Y(t, p),
    (t.intersect = function (u) {
      return (F.info('crossedCircle intersect', t, { radius: a, point: u }), q.circle(t, a, u));
    }),
    o
  );
}
d(Il, 'crossedCircle');
function Rt(r, t, i, e = 100, o = 0, a = 180) {
  const s = [],
    l = (o * Math.PI) / 180,
    c = ((a * Math.PI) / 180 - l) / (e - 1);
  for (let h = 0; h < e; h++) {
    const p = l + h * c,
      u = r + i * Math.cos(p),
      f = t + i * Math.sin(p);
    s.push({ x: -u, y: -f });
  }
  return s;
}
d(Rt, 'generateCirclePoints');
async function Dl(r, t) {
  const { labelStyles: i, nodeStyles: e } = H(t);
  t.labelStyle = i;
  const { shapeSvg: o, bbox: a, label: s } = await V(r, t, U(t)),
    l = t.look === 'neo' ? 18 : (t.padding ?? 0),
    n = t.look === 'neo' ? 12 : (t.padding ?? 0),
    g = a.width + l,
    c = a.height + n,
    h = Math.max(5, c * 0.1),
    { cssStyles: p } = t,
    u = [
      ...Rt(g / 2, -c / 2, h, 30, -90, 0),
      { x: -g / 2 - h, y: h },
      ...Rt(g / 2 + h * 2, -h, h, 20, -180, -270),
      ...Rt(g / 2 + h * 2, h, h, 20, -90, -180),
      { x: -g / 2 - h, y: -c / 2 },
      ...Rt(g / 2, c / 2, h, 20, 0, 90),
    ],
    f = [
      { x: g / 2, y: -c / 2 - h },
      { x: -g / 2, y: -c / 2 - h },
      ...Rt(g / 2, -c / 2, h, 20, -90, 0),
      { x: -g / 2 - h, y: -h },
      ...Rt(g / 2 + g * 0.1, -h, h, 20, -180, -270),
      ...Rt(g / 2 + g * 0.1, h, h, 20, -90, -180),
      { x: -g / 2 - h, y: c / 2 },
      ...Rt(g / 2, c / 2, h, 20, 0, 90),
      { x: -g / 2, y: c / 2 + h },
      { x: g / 2, y: c / 2 + h },
    ],
    C = z.svg(o),
    x = N(t, { fill: 'none' });
  t.look !== 'handDrawn' && ((x.roughness = 0), (x.fillStyle = 'solid'));
  const b = J(u).replace('Z', ''),
    k = C.path(b, x),
    S = J(f),
    T = C.path(S, { ...x }),
    L = o.insert('g', ':first-child');
  return (
    L.insert(() => T, ':first-child').attr('stroke-opacity', 0),
    L.insert(() => k, ':first-child'),
    L.attr('class', 'text'),
    p && t.look !== 'handDrawn' && L.selectAll('path').attr('style', p),
    e && t.look !== 'handDrawn' && L.selectAll('path').attr('style', e),
    L.attr('transform', `translate(${h}, 0)`),
    s.attr(
      'transform',
      `translate(${-g / 2 + h - (a.x - (a.left ?? 0))},${-c / 2 + (t.padding ?? 0) / 2 - (a.y - (a.top ?? 0))})`,
    ),
    Y(t, L),
    (t.intersect = function (A) {
      return q.polygon(t, f, A);
    }),
    o
  );
}
d(Dl, 'curlyBraceLeft');
function Wt(r, t, i, e = 100, o = 0, a = 180) {
  const s = [],
    l = (o * Math.PI) / 180,
    c = ((a * Math.PI) / 180 - l) / (e - 1);
  for (let h = 0; h < e; h++) {
    const p = l + h * c,
      u = r + i * Math.cos(p),
      f = t + i * Math.sin(p);
    s.push({ x: u, y: f });
  }
  return s;
}
d(Wt, 'generateCirclePoints');
async function $l(r, t) {
  const { labelStyles: i, nodeStyles: e } = H(t);
  t.labelStyle = i;
  const { shapeSvg: o, bbox: a, label: s } = await V(r, t, U(t)),
    l = t.look === 'neo' ? 18 : (t.padding ?? 0),
    n = t.look === 'neo' ? 12 : (t.padding ?? 0),
    g = a.width + (t.look === 'neo' ? l * 2 : l),
    c = a.height + (t.look === 'neo' ? n * 2 : n),
    h = Math.max(5, c * 0.1),
    { cssStyles: p } = t,
    u = [
      ...Wt(g / 2, -c / 2, h, 20, -90, 0),
      { x: g / 2 + h, y: -h },
      ...Wt(g / 2 + h * 2, -h, h, 20, -180, -270),
      ...Wt(g / 2 + h * 2, h, h, 20, -90, -180),
      { x: g / 2 + h, y: c / 2 },
      ...Wt(g / 2, c / 2, h, 20, 0, 90),
    ],
    f = [
      { x: -g / 2, y: -c / 2 - h },
      { x: g / 2, y: -c / 2 - h },
      ...Wt(g / 2, -c / 2, h, 20, -90, 0),
      { x: g / 2 + h, y: -h },
      ...Wt(g / 2 + h * 2, -h, h, 20, -180, -270),
      ...Wt(g / 2 + h * 2, h, h, 20, -90, -180),
      { x: g / 2 + h, y: c / 2 },
      ...Wt(g / 2, c / 2, h, 20, 0, 90),
      { x: g / 2, y: c / 2 + h },
      { x: -g / 2, y: c / 2 + h },
    ],
    C = z.svg(o),
    x = N(t, { fill: 'none' });
  t.look !== 'handDrawn' && ((x.roughness = 0), (x.fillStyle = 'solid'));
  const b = J(u).replace('Z', ''),
    k = C.path(b, x),
    S = J(f),
    T = C.path(S, { ...x }),
    L = o.insert('g', ':first-child');
  return (
    L.insert(() => T, ':first-child').attr('stroke-opacity', 0),
    L.insert(() => k, ':first-child'),
    L.attr('class', 'text'),
    p && t.look !== 'handDrawn' && L.selectAll('path').attr('style', p),
    e && t.look !== 'handDrawn' && L.selectAll('path').attr('style', e),
    L.attr('transform', `translate(${-h}, 0)`),
    s.attr(
      'transform',
      `translate(${-g / 2 + (t.padding ?? 0) / 2 - (a.x - (a.left ?? 0))},${-c / 2 + (t.padding ?? 0) / 2 - (a.y - (a.top ?? 0))})`,
    ),
    Y(t, L),
    (t.intersect = function (A) {
      return q.polygon(t, f, A);
    }),
    o
  );
}
d($l, 'curlyBraceRight');
function gt(r, t, i, e = 100, o = 0, a = 180) {
  const s = [],
    l = (o * Math.PI) / 180,
    c = ((a * Math.PI) / 180 - l) / (e - 1);
  for (let h = 0; h < e; h++) {
    const p = l + h * c,
      u = r + i * Math.cos(p),
      f = t + i * Math.sin(p);
    s.push({ x: -u, y: -f });
  }
  return s;
}
d(gt, 'generateCirclePoints');
async function Pl(r, t) {
  const { labelStyles: i, nodeStyles: e } = H(t);
  t.labelStyle = i;
  const { shapeSvg: o, bbox: a, label: s } = await V(r, t, U(t)),
    l = t.look === 'neo' ? 18 : (t.padding ?? 0),
    n = t.look === 'neo' ? 12 : (t.padding ?? 0),
    g = a.width + (t.look === 'neo' ? l * 2 : l),
    c = a.height + (t.look === 'neo' ? n * 2 : n),
    h = Math.max(5, c * 0.1),
    { cssStyles: p } = t,
    u = [
      ...gt(g / 2, -c / 2, h, 30, -90, 0),
      { x: -g / 2 - h, y: h },
      ...gt(g / 2 + h * 2, -h, h, 20, -180, -270),
      ...gt(g / 2 + h * 2, h, h, 20, -90, -180),
      { x: -g / 2 - h, y: -c / 2 },
      ...gt(g / 2, c / 2, h, 20, 0, 90),
    ],
    f = [
      ...gt(-g / 2 + h + h / 2, -c / 2, h, 20, -90, -180),
      { x: g / 2 - h / 2, y: h },
      ...gt(-g / 2 - h / 2, -h, h, 20, 0, 90),
      ...gt(-g / 2 - h / 2, h, h, 20, -90, 0),
      { x: g / 2 - h / 2, y: -h },
      ...gt(-g / 2 + h + h / 2, c / 2, h, 30, -180, -270),
    ],
    C = [
      { x: g / 2, y: -c / 2 - h },
      { x: -g / 2, y: -c / 2 - h },
      ...gt(g / 2, -c / 2, h, 20, -90, 0),
      { x: -g / 2 - h, y: -h },
      ...gt(g / 2 + h * 2, -h, h, 20, -180, -270),
      ...gt(g / 2 + h * 2, h, h, 20, -90, -180),
      { x: -g / 2 - h, y: c / 2 },
      ...gt(g / 2, c / 2, h, 20, 0, 90),
      { x: -g / 2, y: c / 2 + h },
      { x: g / 2 - h - h / 2, y: c / 2 + h },
      ...gt(-g / 2 + h + h / 2, -c / 2, h, 20, -90, -180),
      { x: g / 2 - h / 2, y: h },
      ...gt(-g / 2 - h / 2, -h, h, 20, 0, 90),
      ...gt(-g / 2 - h / 2, h, h, 20, -90, 0),
      { x: g / 2 - h / 2, y: -h },
      ...gt(-g / 2 + h + h / 2, c / 2, h, 30, -180, -270),
    ],
    x = z.svg(o),
    y = N(t, { fill: 'none' });
  t.look !== 'handDrawn' && ((y.roughness = 0), (y.fillStyle = 'solid'));
  const k = J(u).replace('Z', ''),
    S = x.path(k, y),
    L = J(f).replace('Z', ''),
    A = x.path(L, y),
    _ = J(C),
    M = x.path(_, { ...y }),
    E = o.insert('g', ':first-child');
  return (
    E.insert(() => M, ':first-child').attr('stroke-opacity', 0),
    E.insert(() => S, ':first-child'),
    E.insert(() => A, ':first-child'),
    E.attr('class', 'text'),
    p && t.look !== 'handDrawn' && E.selectAll('path').attr('style', p),
    e && t.look !== 'handDrawn' && E.selectAll('path').attr('style', e),
    E.attr('transform', `translate(${h - h / 4}, 0)`),
    s.attr(
      'transform',
      `translate(${-g / 2 + (t.padding ?? 0) / 2 - (a.x - (a.left ?? 0))},${-c / 2 + (t.padding ?? 0) / 2 - (a.y - (a.top ?? 0))})`,
    ),
    Y(t, E),
    (t.intersect = function (O) {
      return q.polygon(t, C, O);
    }),
    o
  );
}
d(Pl, 'curlyBraces');
async function ql(r, t) {
  const { labelStyles: i, nodeStyles: e } = H(t);
  t.labelStyle = i;
  const o = t.padding ?? 0,
    a = t.look === 'neo' ? 16 : o,
    s = t.look === 'neo' ? 12 : o,
    l = 20,
    n = 5,
    { shapeSvg: g, bbox: c } = await V(r, t, U(t)),
    h = Math.max(l, (c.width + a * 2) * 1.25, t?.width ?? 0),
    p = Math.max(n, c.height + s * 2, t?.height ?? 0),
    u = p / 2,
    { cssStyles: f } = t,
    C = z.svg(g),
    x = N(t, {});
  t.look !== 'handDrawn' && ((x.roughness = 0), (x.fillStyle = 'solid'));
  const y = h,
    b = p,
    k = y - u,
    S = b / 4,
    T = [
      { x: k, y: 0 },
      { x: S, y: 0 },
      { x: 0, y: b / 2 },
      { x: S, y: b },
      { x: k, y: b },
      ...Qr(-k, -b / 2, u, 50, 270, 90),
    ],
    L = J(T),
    A = C.path(L, x),
    _ = g.insert(() => A, ':first-child');
  return (
    _.attr('class', 'basic label-container outer-path'),
    f && t.look !== 'handDrawn' && _.selectChildren('path').attr('style', f),
    e && t.look !== 'handDrawn' && _.selectChildren('path').attr('style', e),
    _.attr('transform', `translate(${-h / 2}, ${-p / 2})`),
    Y(t, _),
    (t.intersect = function (M) {
      return q.polygon(t, T, M);
    }),
    g
  );
}
d(ql, 'curvedTrapezoid');
var qu = d(
    (r, t, i, e, o, a) =>
      [
        `M${r},${t + a}`,
        `a${o},${a} 0,0,0 ${i},0`,
        `a${o},${a} 0,0,0 ${-i},0`,
        `l0,${e}`,
        `a${o},${a} 0,0,0 ${i},0`,
        `l0,${-e}`,
      ].join(' '),
    'createCylinderPathD',
  ),
  Ru = d(
    (r, t, i, e, o, a) =>
      [
        `M${r},${t + a}`,
        `M${r + i},${t + a}`,
        `a${o},${a} 0,0,0 ${-i},0`,
        `l0,${e}`,
        `a${o},${a} 0,0,0 ${i},0`,
        `l0,${-e}`,
      ].join(' '),
    'createOuterCylinderPathD',
  ),
  Wu = d(
    (r, t, i, e, o, a) => [`M${r - i / 2},${-e / 2}`, `a${o},${a} 0,0,0 ${i},0`].join(' '),
    'createInnerCylinderPathD',
  ),
  uo = 8,
  po = 8;
async function Rl(r, t) {
  const { labelStyles: i, nodeStyles: e } = H(t);
  t.labelStyle = i;
  const o = t.padding ?? 0,
    a = t.look === 'neo' ? 24 : o,
    s = t.look === 'neo' ? 24 : o;
  if (t.width || t.height) {
    const x = t.width ?? 0;
    ((t.width = (t.width ?? 0) - s), t.width < po && (t.width = po));
    const b = x / 2 / (2.5 + x / 50);
    ((t.height = (t.height ?? 0) - a - b * 3), t.height < uo && (t.height = uo));
  }
  const { shapeSvg: l, bbox: n, label: g } = await V(r, t, U(t)),
    c = (t.width ? t.width : n.width) + s,
    h = c / 2,
    p = h / (2.5 + c / 50),
    u = (t.height ? t.height : n.height) + a + p;
  let f;
  const { cssStyles: C } = t;
  if (t.look === 'handDrawn') {
    const x = z.svg(l),
      y = Ru(0, 0, c, u, h, p),
      b = Wu(0, p, c, u, h, p),
      k = N(t, {}),
      S = x.path(y, k),
      T = x.path(b, N(t, { fill: 'none' }));
    ((f = l.insert(() => T, ':first-child')),
      (f = l.insert(() => S, ':first-child')),
      f.attr('class', 'basic label-container'),
      C && f.attr('style', C));
  } else {
    const x = qu(0, 0, c, u, h, p);
    f = l
      .insert('path', ':first-child')
      .attr('d', x)
      .attr('class', 'basic label-container outer-path')
      .attr('style', dt(C))
      .attr('style', e);
  }
  return (
    f.attr('label-offset-y', p),
    f.attr('transform', `translate(${-c / 2}, ${-(u / 2 + p)})`),
    Y(t, f),
    g.attr(
      'transform',
      `translate(${-(n.width / 2) - (n.x - (n.left ?? 0))}, ${-(n.height / 2) + (t.padding ?? 0) / 1.5 - (n.y - (n.top ?? 0))})`,
    ),
    (t.intersect = function (x) {
      const y = q.rect(t, x),
        b = y.x - (t.x ?? 0);
      if (
        h != 0 &&
        (Math.abs(b) < (t.width ?? 0) / 2 ||
          (Math.abs(b) == (t.width ?? 0) / 2 &&
            Math.abs(y.y - (t.y ?? 0)) > (t.height ?? 0) / 2 - p))
      ) {
        let k = p * p * (1 - (b * b) / (h * h));
        (k > 0 && (k = Math.sqrt(k)), (k = p - k), x.y - (t.y ?? 0) > 0 && (k = -k), (y.y += k));
      }
      return y;
    }),
    l
  );
}
d(Rl, 'cylinder');
async function qr(r, t, i) {
  const { labelStyles: e, nodeStyles: o } = H(t);
  t.labelStyle = e;
  const { shapeSvg: a, bbox: s } = await V(r, t, U(t)),
    l = Math.max(s.width + i.labelPaddingX * 2, t?.width || 0),
    n = Math.max(s.height + i.labelPaddingY * 2, t?.height || 0),
    g = -l / 2,
    c = -n / 2;
  let h,
    { rx: p, ry: u } = t;
  const { cssStyles: f } = t;
  if ((i?.rx && i.ry && ((p = i.rx), (u = i.ry)), t.look === 'handDrawn')) {
    const C = z.svg(a),
      x = N(t, {}),
      y = p || u ? C.path(Jt(g, c, l, n, p || 0), x) : C.rectangle(g, c, l, n, x);
    ((h = a.insert(() => y, ':first-child')),
      h.attr('class', 'basic label-container').attr('style', dt(f)));
  } else
    ((h = a.insert('rect', ':first-child')),
      h
        .attr('class', 'basic label-container')
        .attr('style', o)
        .attr('rx', dt(p))
        .attr('ry', dt(u))
        .attr('x', g)
        .attr('y', c)
        .attr('width', l)
        .attr('height', n));
  return (
    Y(t, h),
    (t.calcIntersect = function (C, x) {
      return q.rect(C, x);
    }),
    (t.intersect = function (C) {
      return q.rect(t, C);
    }),
    a
  );
}
d(qr, 'drawRect');
async function Wl(r, t) {
  const { cssClasses: i, labelPaddingX: e, labelPaddingY: o, padding: a, width: s, height: l } = t,
    n = { rx: 0, ry: 0, labelPaddingX: e ?? (a ?? 0) * 2, labelPaddingY: o ?? a ?? 0 },
    g = await qr(r, t, n);
  if (t.look === 'handDrawn') {
    const u = z.svg(g),
      f = N(t, {}),
      C = g.select('.basic.label-container > path:nth-child(2)'),
      x = C.node();
    if (!x) return g;
    let y = null;
    if (x instanceof SVGGraphicsElement) y = x.getBBox();
    else return g;
    return (
      g.insert(() => u.line(y.x, y.y, y.x + y.width, y.y, f), '.basic.label-container g.label'),
      g.insert(
        () => u.line(y.x, y.y + y.height, y.x + y.width, y.y + y.height, f),
        '.basic.label-container g.label',
      ),
      C.remove(),
      g
    );
  }
  const c = g.select('.basic.label-container'),
    h = (Number(c.attr('width')) || s) ?? 0,
    p = (Number(c.attr('height')) || l) ?? 0;
  return (h > 0 && p > 0 && c.attr('stroke-dasharray', `${h} ${p}`), g);
}
d(Wl, 'datastore');
async function zl(r, t) {
  const { labelStyles: i, nodeStyles: e } = H(t);
  t.labelStyle = i;
  const o = t.look === 'neo' ? 16 : (t.padding ?? 0),
    a = t.look === 'neo' ? 16 : (t.padding ?? 0),
    { shapeSvg: s, bbox: l, label: n } = await V(r, t, U(t)),
    g = l.width + o,
    c = l.height + a,
    h = c * 0.2,
    p = -g / 2,
    u = -c / 2 - h / 2,
    { cssStyles: f } = t,
    C = z.svg(s),
    x = N(t, {});
  t.look !== 'handDrawn' && ((x.roughness = 0), (x.fillStyle = 'solid'));
  const y = [
      { x: p, y: u + h },
      { x: -p, y: u + h },
      { x: -p, y: -u },
      { x: p, y: -u },
      { x: p, y: u },
      { x: -p, y: u },
      { x: -p, y: u + h },
    ],
    b = C.polygon(
      y.map((S) => [S.x, S.y]),
      x,
    ),
    k = s.insert(() => b, ':first-child');
  return (
    k.attr('class', 'basic label-container outer-path'),
    f && t.look !== 'handDrawn' && k.selectAll('path').attr('style', f),
    e && t.look !== 'handDrawn' && k.selectAll('path').attr('style', e),
    n.attr(
      'transform',
      `translate(${p + (t.padding ?? 0) / 2 - (l.x - (l.left ?? 0))}, ${u + h + (t.padding ?? 0) / 2 - (l.y - (l.top ?? 0))})`,
    ),
    Y(t, k),
    (t.intersect = function (S) {
      return q.rect(t, S);
    }),
    s
  );
}
d(zl, 'dividedRectangle');
async function Nl(r, t) {
  const { labelStyles: i, nodeStyles: e } = H(t),
    o = t.look === 'neo' ? 12 : 5;
  t.labelStyle = i;
  const a = t.padding ?? 0,
    s = t.look === 'neo' ? 16 : a,
    { shapeSvg: l, bbox: n } = await V(r, t, U(t)),
    g = (t?.width ? t?.width / 2 : n.width / 2) + (s ?? 0),
    c = g - o;
  let h;
  const { cssStyles: p } = t;
  if (t.look === 'handDrawn') {
    const u = z.svg(l),
      f = N(t, { roughness: 0.2, strokeWidth: 2.5 }),
      C = N(t, { roughness: 0.2, strokeWidth: 1.5 }),
      x = u.circle(0, 0, g * 2, f),
      y = u.circle(0, 0, c * 2, C);
    ((h = l.insert('g', ':first-child')),
      h.attr('class', dt(t.cssClasses)).attr('style', dt(p)),
      h.node()?.appendChild(x),
      h.node()?.appendChild(y));
  } else {
    h = l.insert('g', ':first-child');
    const u = h.insert('circle', ':first-child'),
      f = h.insert('circle');
    (h.attr('class', 'basic label-container').attr('style', e),
      u.attr('class', 'outer-circle').attr('style', e).attr('r', g).attr('cx', 0).attr('cy', 0),
      f.attr('class', 'inner-circle').attr('style', e).attr('r', c).attr('cx', 0).attr('cy', 0));
  }
  return (
    Y(t, h),
    (t.intersect = function (u) {
      return (F.info('DoubleCircle intersect', t, g, u), q.circle(t, g, u));
    }),
    l
  );
}
d(Nl, 'doublecircle');
function Hl(r, t, { config: { themeVariables: i } }) {
  const { labelStyles: e, nodeStyles: o } = H(t);
  ((t.label = ''), (t.labelStyle = e));
  const a = r
      .insert('g')
      .attr('class', U(t))
      .attr('id', t.domId ?? t.id),
    s = 7,
    { cssStyles: l } = t,
    n = z.svg(a),
    { nodeBorder: g } = i,
    c = N(t, { fillStyle: 'solid' });
  t.look !== 'handDrawn' && (c.roughness = 0);
  const h = n.circle(0, 0, s * 2, c),
    p = a.insert(() => h, ':first-child');
  return (
    p.selectAll('path').attr('style', `fill: ${g} !important;`),
    l && l.length > 0 && t.look !== 'handDrawn' && p.selectAll('path').attr('style', l),
    o && t.look !== 'handDrawn' && p.selectAll('path').attr('style', o),
    Y(t, p),
    (t.intersect = function (u) {
      return (F.info('filledCircle intersect', t, { radius: s, point: u }), q.circle(t, s, u));
    }),
    a
  );
}
d(Hl, 'filledCircle');
var fo = 10,
  mo = 10;
async function Yl(r, t) {
  const { labelStyles: i, nodeStyles: e } = H(t);
  t.labelStyle = i;
  const o = t.padding ?? 0,
    a = t.look === 'neo' ? o * 2 : o;
  (t.width || t.height) &&
    ((t.height = t?.height ?? 0),
    t.height < fo && (t.height = fo),
    (t.width = (t?.width ?? 0) - a - a / 2),
    t.width < mo && (t.width = mo));
  const { shapeSvg: s, bbox: l, label: n } = await V(r, t, U(t)),
    g = (t?.width ? t?.width : l.width) + (a ?? 0),
    c = t?.height ? t?.height : g + l.height,
    h = c,
    p = [
      { x: 0, y: -c },
      { x: h, y: -c },
      { x: h / 2, y: 0 },
    ],
    { cssStyles: u } = t,
    f = z.svg(s),
    C = N(t, {});
  t.look !== 'handDrawn' && ((C.roughness = 0), (C.fillStyle = 'solid'));
  const x = J(p),
    y = f.path(x, C),
    b = s
      .insert(() => y, ':first-child')
      .attr('transform', `translate(${-c / 2}, ${c / 2})`)
      .attr('class', 'outer-path');
  return (
    u && t.look !== 'handDrawn' && b.selectChildren('path').attr('style', u),
    e && t.look !== 'handDrawn' && b.selectChildren('path').attr('style', e),
    (t.width = g),
    (t.height = c),
    Y(t, b),
    n.attr(
      'transform',
      `translate(${-l.width / 2 - (l.x - (l.left ?? 0))}, ${-c / 2 + (t.padding ?? 0) / 2 + (l.y - (l.top ?? 0))})`,
    ),
    (t.intersect = function (k) {
      return (F.info('Triangle intersect', t, p, k), q.polygon(t, p, k));
    }),
    s
  );
}
d(Yl, 'flippedTriangle');
function jl(r, t, { dir: i, config: { state: e, themeVariables: o } }) {
  const { nodeStyles: a } = H(t);
  t.label = '';
  const s = r
      .insert('g')
      .attr('class', U(t))
      .attr('id', t.domId ?? t.id),
    { cssStyles: l } = t;
  let n = Math.max(70, t?.width ?? 0),
    g = Math.max(10, t?.height ?? 0);
  i === 'LR' && ((n = Math.max(10, t?.width ?? 0)), (g = Math.max(70, t?.height ?? 0)));
  const c = (-1 * n) / 2,
    h = (-1 * g) / 2,
    p = z.svg(s),
    u = N(t, { stroke: o.lineColor, fill: o.lineColor });
  t.look !== 'handDrawn' && ((u.roughness = 0), (u.fillStyle = 'solid'));
  const f = p.rectangle(c, h, n, g, u),
    C = s.insert(() => f, ':first-child');
  (l && t.look !== 'handDrawn' && C.selectAll('path').attr('style', l),
    a && t.look !== 'handDrawn' && C.selectAll('path').attr('style', a),
    Y(t, C));
  const x = e?.padding ?? 0;
  return (
    t.width && t.height && ((t.width += x / 2 || 0), (t.height += x / 2 || 0)),
    (t.intersect = function (y) {
      return q.rect(t, y);
    }),
    s
  );
}
d(jl, 'forkJoin');
async function Xl(r, t) {
  const { labelStyles: i, nodeStyles: e } = H(t);
  t.labelStyle = i;
  const o = 15,
    a = 10,
    s = t.look === 'neo' ? 16 : (t.padding ?? 0),
    l = t.look === 'neo' ? 12 : (t.padding ?? 0);
  (t.width || t.height) &&
    ((t.height = (t?.height ?? 0) - l * 2),
    t.height < a && (t.height = a),
    (t.width = (t?.width ?? 0) - s * 2),
    t.width < o && (t.width = o));
  const { shapeSvg: n, bbox: g } = await V(r, t, U(t)),
    c = (t?.width ? t?.width : Math.max(o, g.width)) + s * 2,
    h = (t?.height ? t?.height : Math.max(a, g.height)) + l * 2,
    p = h / 2,
    { cssStyles: u } = t,
    f = z.svg(n),
    C = N(t, {});
  t.look !== 'handDrawn' && ((C.roughness = 0), (C.fillStyle = 'solid'));
  const x = [
      { x: -c / 2, y: -h / 2 },
      { x: c / 2 - p, y: -h / 2 },
      ...Qr(-c / 2 + p, 0, p, 50, 90, 270),
      { x: c / 2 - p, y: h / 2 },
      { x: -c / 2, y: h / 2 },
    ],
    y = J(x),
    b = f.path(y, C),
    k = n.insert(() => b, ':first-child');
  return (
    k.attr('class', 'basic label-container outer-path'),
    u && t.look !== 'handDrawn' && k.selectChildren('path').attr('style', u),
    e && t.look !== 'handDrawn' && k.selectChildren('path').attr('style', e),
    Y(t, k),
    (t.intersect = function (S) {
      return (F.info('Pill intersect', t, { radius: p, point: S }), q.polygon(t, x, S));
    }),
    n
  );
}
d(Xl, 'halfRoundedRectangle');
var zu = d(
  (r, t, i, e, o) =>
    [
      `M${r + o},${t}`,
      `L${r + i - o},${t}`,
      `L${r + i},${t - e / 2}`,
      `L${r + i - o},${t - e}`,
      `L${r + o},${t - e}`,
      `L${r},${t - e / 2}`,
      'Z',
    ].join(' '),
  'createHexagonPathD',
);
async function Ul(r, t) {
  const { labelStyles: i, nodeStyles: e } = H(t),
    o = t.look === 'neo' ? 3.5 : 4;
  t.labelStyle = i;
  const a = t.padding ?? 0,
    s = 70,
    l = 32,
    n = t.look === 'neo' ? s : a,
    g = t.look === 'neo' ? l : a;
  if (t.width || t.height) {
    const k = (t.height ?? 0) / o;
    ((t.width = (t?.width ?? 0) - 2 * k - g), (t.height = (t.height ?? 0) - n));
  }
  const { shapeSvg: c, bbox: h } = await V(r, t, U(t)),
    p = (t?.height ? t?.height : h.height) + n,
    u = p / o,
    f = (t?.width ? t?.width : h.width) + 2 * u + g,
    C = [
      { x: u, y: 0 },
      { x: f - u, y: 0 },
      { x: f, y: -p / 2 },
      { x: f - u, y: -p },
      { x: u, y: -p },
      { x: 0, y: -p / 2 },
    ];
  let x;
  const { cssStyles: y } = t;
  if (t.look === 'handDrawn') {
    const b = z.svg(c),
      k = N(t, {}),
      S = zu(0, 0, f, p, u),
      T = b.path(S, k);
    ((x = c.insert(() => T, ':first-child').attr('transform', `translate(${-f / 2}, ${p / 2})`)),
      y && x.attr('style', y));
  } else x = Ut(c, f, p, C);
  return (
    e && x.attr('style', e),
    (t.width = f),
    (t.height = p),
    Y(t, x),
    (t.intersect = function (b) {
      return q.polygon(t, C, b);
    }),
    c
  );
}
d(Ul, 'hexagon');
async function Vl(r, t) {
  const { labelStyles: i, nodeStyles: e } = H(t);
  ((t.label = ''), (t.labelStyle = i));
  const { shapeSvg: o } = await V(r, t, U(t)),
    a = Math.max(30, t?.width ?? 0),
    s = Math.max(30, t?.height ?? 0),
    { cssStyles: l } = t,
    n = z.svg(o),
    g = N(t, {});
  t.look !== 'handDrawn' && ((g.roughness = 0), (g.fillStyle = 'solid'));
  const c = [
      { x: 0, y: 0 },
      { x: a, y: 0 },
      { x: 0, y: s },
      { x: a, y: s },
    ],
    h = J(c),
    p = n.path(h, g),
    u = o.insert(() => p, ':first-child');
  return (
    u.attr('class', 'basic label-container outer-path'),
    l && t.look !== 'handDrawn' && u.selectChildren('path').attr('style', l),
    e && t.look !== 'handDrawn' && u.selectChildren('path').attr('style', e),
    u.attr('transform', `translate(${-a / 2}, ${-s / 2})`),
    Y(t, u),
    (t.intersect = function (f) {
      return (F.info('Pill intersect', t, { points: c }), q.polygon(t, c, f));
    }),
    o
  );
}
d(Vl, 'hourglass');
async function Gl(r, t, { config: { themeVariables: i, flowchart: e } }) {
  const { labelStyles: o } = H(t);
  t.labelStyle = o;
  const a = t.assetHeight ?? 48,
    s = t.assetWidth ?? 48,
    l = Math.max(a, s),
    n = e?.wrappingWidth;
  t.width = Math.max(l, n ?? 0);
  const { shapeSvg: g, bbox: c, label: h } = await V(r, t, 'icon-shape default'),
    p = t.pos === 't',
    u = l,
    f = l,
    { nodeBorder: C } = i,
    { stylesMap: x } = $r(t),
    y = -f / 2,
    b = -u / 2,
    k = t.label ? 8 : 0,
    S = z.svg(g),
    T = N(t, { stroke: 'none', fill: 'none' });
  t.look !== 'handDrawn' && ((T.roughness = 0), (T.fillStyle = 'solid'));
  const L = S.rectangle(y, b, f, u, T),
    A = Math.max(f, c.width),
    _ = u + c.height + k,
    M = S.rectangle(-A / 2, -_ / 2, A, _, { ...T, fill: 'transparent', stroke: 'none' }),
    E = g.insert(() => L, ':first-child'),
    O = g.insert(() => M);
  if (t.icon) {
    const $ = g.append('g');
    $.html(`<g>${await ei(t.icon, { height: l, width: l, fallbackPrefix: '' })}</g>`);
    const D = $.node().getBBox(),
      W = D.width,
      R = D.height,
      P = D.x,
      I = D.y;
    ($.attr(
      'transform',
      `translate(${-W / 2 - P},${p ? c.height / 2 + k / 2 - R / 2 - I : -c.height / 2 - k / 2 - R / 2 - I})`,
    ),
      $.attr('style', `color: ${x.get('stroke') ?? C};`));
  }
  return (
    h.attr(
      'transform',
      `translate(${-c.width / 2 - (c.x - (c.left ?? 0))},${p ? -_ / 2 : _ / 2 - c.height})`,
    ),
    E.attr('transform', `translate(0,${p ? c.height / 2 + k / 2 : -c.height / 2 - k / 2})`),
    Y(t, O),
    (t.intersect = function ($) {
      if ((F.info('iconSquare intersect', t, $), !t.label)) return q.rect(t, $);
      const D = t.x ?? 0,
        W = t.y ?? 0,
        R = t.height ?? 0;
      let P = [];
      return (
        p
          ? (P = [
              { x: D - c.width / 2, y: W - R / 2 },
              { x: D + c.width / 2, y: W - R / 2 },
              { x: D + c.width / 2, y: W - R / 2 + c.height + k },
              { x: D + f / 2, y: W - R / 2 + c.height + k },
              { x: D + f / 2, y: W + R / 2 },
              { x: D - f / 2, y: W + R / 2 },
              { x: D - f / 2, y: W - R / 2 + c.height + k },
              { x: D - c.width / 2, y: W - R / 2 + c.height + k },
            ])
          : (P = [
              { x: D - f / 2, y: W - R / 2 },
              { x: D + f / 2, y: W - R / 2 },
              { x: D + f / 2, y: W - R / 2 + u },
              { x: D + c.width / 2, y: W - R / 2 + u },
              { x: D + c.width / 2 / 2, y: W + R / 2 },
              { x: D - c.width / 2, y: W + R / 2 },
              { x: D - c.width / 2, y: W - R / 2 + u },
              { x: D - f / 2, y: W - R / 2 + u },
            ]),
        q.polygon(t, P, $)
      );
    }),
    g
  );
}
d(Gl, 'icon');
async function Kl(r, t, { config: { themeVariables: i, flowchart: e } }) {
  const { labelStyles: o } = H(t);
  t.labelStyle = o;
  const a = t.assetHeight ?? 48,
    s = t.assetWidth ?? 48,
    l = Math.max(a, s),
    n = e?.wrappingWidth;
  t.width = Math.max(l, n ?? 0);
  const { shapeSvg: g, bbox: c, label: h } = await V(r, t, 'icon-shape default'),
    p = 20,
    u = t.label ? 8 : 0,
    f = t.pos === 't',
    { nodeBorder: C, mainBkg: x } = i,
    { stylesMap: y } = $r(t),
    b = z.svg(g),
    k = N(t, {});
  t.look !== 'handDrawn' && ((k.roughness = 0), (k.fillStyle = 'solid'));
  const S = y.get('fill');
  k.stroke = S ?? x;
  const T = g.append('g');
  t.icon && T.html(`<g>${await ei(t.icon, { height: l, width: l, fallbackPrefix: '' })}</g>`);
  const L = T.node().getBBox(),
    A = L.width,
    _ = L.height,
    M = L.x,
    E = L.y,
    O = Math.max(A, _) * Math.SQRT2 + p * 2,
    $ = b.circle(0, 0, O, k),
    D = Math.max(O, c.width),
    W = O + c.height + u,
    R = b.rectangle(-D / 2, -W / 2, D, W, { ...k, fill: 'transparent', stroke: 'none' }),
    P = g.insert(() => $, ':first-child'),
    I = g.insert(() => R);
  return (
    T.attr(
      'transform',
      `translate(${-A / 2 - M},${f ? c.height / 2 + u / 2 - _ / 2 - E : -c.height / 2 - u / 2 - _ / 2 - E})`,
    ),
    T.attr('style', `color: ${y.get('stroke') ?? C};`),
    h.attr(
      'transform',
      `translate(${-c.width / 2 - (c.x - (c.left ?? 0))},${f ? -W / 2 : W / 2 - c.height})`,
    ),
    P.attr('transform', `translate(0,${f ? c.height / 2 + u / 2 : -c.height / 2 - u / 2})`),
    Y(t, I),
    (t.intersect = function (j) {
      return (F.info('iconSquare intersect', t, j), q.rect(t, j));
    }),
    g
  );
}
d(Kl, 'iconCircle');
async function Ql(r, t, { config: { themeVariables: i, flowchart: e } }) {
  const { labelStyles: o } = H(t);
  t.labelStyle = o;
  const a = t.assetHeight ?? 48,
    s = t.assetWidth ?? 48,
    l = Math.max(a, s),
    n = e?.wrappingWidth;
  t.width = Math.max(l, n ?? 0);
  const { shapeSvg: g, bbox: c, halfPadding: h, label: p } = await V(r, t, 'icon-shape default'),
    u = t.pos === 't',
    f = l + h * 2,
    C = l + h * 2,
    { nodeBorder: x, mainBkg: y } = i,
    { stylesMap: b } = $r(t),
    k = -C / 2,
    S = -f / 2,
    T = t.label ? 8 : 0,
    L = z.svg(g),
    A = N(t, {});
  t.look !== 'handDrawn' && ((A.roughness = 0), (A.fillStyle = 'solid'));
  const _ = b.get('fill');
  A.stroke = _ ?? y;
  const M = L.path(Jt(k, S, C, f, 5), A),
    E = Math.max(C, c.width),
    O = f + c.height + T,
    $ = L.rectangle(-E / 2, -O / 2, E, O, { ...A, fill: 'transparent', stroke: 'none' }),
    D = g.insert(() => M, ':first-child').attr('class', 'icon-shape2'),
    W = g.insert(() => $);
  if (t.icon) {
    const R = g.append('g');
    R.html(`<g>${await ei(t.icon, { height: l, width: l, fallbackPrefix: '' })}</g>`);
    const P = R.node().getBBox(),
      I = P.width,
      j = P.height,
      Q = P.x,
      rt = P.y;
    (R.attr(
      'transform',
      `translate(${-I / 2 - Q},${u ? c.height / 2 + T / 2 - j / 2 - rt : -c.height / 2 - T / 2 - j / 2 - rt})`,
    ),
      R.attr('style', `color: ${b.get('stroke') ?? x};`));
  }
  return (
    p.attr(
      'transform',
      `translate(${-c.width / 2 - (c.x - (c.left ?? 0))},${u ? -O / 2 : O / 2 - c.height})`,
    ),
    D.attr('transform', `translate(0,${u ? c.height / 2 + T / 2 : -c.height / 2 - T / 2})`),
    Y(t, W),
    (t.intersect = function (R) {
      if ((F.info('iconSquare intersect', t, R), !t.label)) return q.rect(t, R);
      const P = t.x ?? 0,
        I = t.y ?? 0,
        j = t.height ?? 0;
      let Q = [];
      return (
        u
          ? (Q = [
              { x: P - c.width / 2, y: I - j / 2 },
              { x: P + c.width / 2, y: I - j / 2 },
              { x: P + c.width / 2, y: I - j / 2 + c.height + T },
              { x: P + C / 2, y: I - j / 2 + c.height + T },
              { x: P + C / 2, y: I + j / 2 },
              { x: P - C / 2, y: I + j / 2 },
              { x: P - C / 2, y: I - j / 2 + c.height + T },
              { x: P - c.width / 2, y: I - j / 2 + c.height + T },
            ])
          : (Q = [
              { x: P - C / 2, y: I - j / 2 },
              { x: P + C / 2, y: I - j / 2 },
              { x: P + C / 2, y: I - j / 2 + f },
              { x: P + c.width / 2, y: I - j / 2 + f },
              { x: P + c.width / 2 / 2, y: I + j / 2 },
              { x: P - c.width / 2, y: I + j / 2 },
              { x: P - c.width / 2, y: I - j / 2 + f },
              { x: P - C / 2, y: I - j / 2 + f },
            ]),
        q.polygon(t, Q, R)
      );
    }),
    g
  );
}
d(Ql, 'iconRounded');
async function Zl(r, t, { config: { themeVariables: i, flowchart: e } }) {
  const { labelStyles: o } = H(t);
  t.labelStyle = o;
  const a = t.assetHeight ?? 48,
    s = t.assetWidth ?? 48,
    l = Math.max(a, s),
    n = e?.wrappingWidth;
  t.width = Math.max(l, n ?? 0);
  const { shapeSvg: g, bbox: c, halfPadding: h, label: p } = await V(r, t, 'icon-shape default'),
    u = t.pos === 't',
    f = l + h * 2,
    C = l + h * 2,
    { nodeBorder: x, mainBkg: y } = i,
    { stylesMap: b } = $r(t),
    k = -C / 2,
    S = -f / 2,
    T = t.label ? 8 : 0,
    L = z.svg(g),
    A = N(t, {});
  t.look !== 'handDrawn' && ((A.roughness = 0), (A.fillStyle = 'solid'));
  const _ = b.get('fill');
  A.stroke = _ ?? y;
  const M = L.path(Jt(k, S, C, f, 0.1), A),
    E = Math.max(C, c.width),
    O = f + c.height + T,
    $ = L.rectangle(-E / 2, -O / 2, E, O, { ...A, fill: 'transparent', stroke: 'none' }),
    D = g.insert(() => M, ':first-child'),
    W = g.insert(() => $);
  if (t.icon) {
    const R = g.append('g');
    R.html(`<g>${await ei(t.icon, { height: l, width: l, fallbackPrefix: '' })}</g>`);
    const P = R.node().getBBox(),
      I = P.width,
      j = P.height,
      Q = P.x,
      rt = P.y;
    (R.attr(
      'transform',
      `translate(${-I / 2 - Q},${u ? c.height / 2 + T / 2 - j / 2 - rt : -c.height / 2 - T / 2 - j / 2 - rt})`,
    ),
      R.attr('style', `color: ${b.get('stroke') ?? x};`));
  }
  return (
    p.attr(
      'transform',
      `translate(${-c.width / 2 - (c.x - (c.left ?? 0))},${u ? -O / 2 : O / 2 - c.height})`,
    ),
    D.attr('transform', `translate(0,${u ? c.height / 2 + T / 2 : -c.height / 2 - T / 2})`),
    Y(t, W),
    (t.intersect = function (R) {
      if ((F.info('iconSquare intersect', t, R), !t.label)) return q.rect(t, R);
      const P = t.x ?? 0,
        I = t.y ?? 0,
        j = t.height ?? 0;
      let Q = [];
      return (
        u
          ? (Q = [
              { x: P - c.width / 2, y: I - j / 2 },
              { x: P + c.width / 2, y: I - j / 2 },
              { x: P + c.width / 2, y: I - j / 2 + c.height + T },
              { x: P + C / 2, y: I - j / 2 + c.height + T },
              { x: P + C / 2, y: I + j / 2 },
              { x: P - C / 2, y: I + j / 2 },
              { x: P - C / 2, y: I - j / 2 + c.height + T },
              { x: P - c.width / 2, y: I - j / 2 + c.height + T },
            ])
          : (Q = [
              { x: P - C / 2, y: I - j / 2 },
              { x: P + C / 2, y: I - j / 2 },
              { x: P + C / 2, y: I - j / 2 + f },
              { x: P + c.width / 2, y: I - j / 2 + f },
              { x: P + c.width / 2 / 2, y: I + j / 2 },
              { x: P - c.width / 2, y: I + j / 2 },
              { x: P - c.width / 2, y: I - j / 2 + f },
              { x: P - C / 2, y: I - j / 2 + f },
            ]),
        q.polygon(t, Q, R)
      );
    }),
    g
  );
}
d(Zl, 'iconSquare');
async function Jl(r, t, { config: { flowchart: i } }) {
  const e = new Image();
  ((e.src = t?.img ?? ''), await e.decode());
  const o = Number(e.naturalWidth.toString().replace('px', '')),
    a = Number(e.naturalHeight.toString().replace('px', ''));
  t.imageAspectRatio = o / a;
  const { labelStyles: s } = H(t);
  t.labelStyle = s;
  const l = i?.wrappingWidth;
  t.defaultWidth = i?.wrappingWidth;
  const n = Math.max(t.label ? (l ?? 0) : 0, t?.assetWidth ?? o),
    g = t.constraint === 'on' && t?.assetHeight ? t.assetHeight * t.imageAspectRatio : n,
    c = t.constraint === 'on' ? g / t.imageAspectRatio : (t?.assetHeight ?? a);
  t.width = Math.max(g, l ?? 0);
  const { shapeSvg: h, bbox: p, label: u } = await V(r, t, 'image-shape default'),
    f = t.pos === 't',
    C = -g / 2,
    x = -c / 2,
    y = t.label ? 8 : 0,
    b = z.svg(h),
    k = N(t, {});
  t.look !== 'handDrawn' && ((k.roughness = 0), (k.fillStyle = 'solid'));
  const S = b.rectangle(C, x, g, c, k),
    T = Math.max(g, p.width),
    L = c + p.height + y,
    A = b.rectangle(-T / 2, -L / 2, T, L, { ...k, fill: 'none', stroke: 'none' }),
    _ = h.insert(() => S, ':first-child'),
    M = h.insert(() => A);
  if (t.img) {
    const E = h.append('image');
    (E.attr('href', t.img),
      E.attr('width', g),
      E.attr('height', c),
      E.attr('preserveAspectRatio', 'none'),
      E.attr('transform', `translate(${-g / 2},${f ? L / 2 - c : -L / 2})`));
  }
  return (
    u.attr(
      'transform',
      `translate(${-p.width / 2 - (p.x - (p.left ?? 0))},${f ? -c / 2 - p.height / 2 - y / 2 : c / 2 - p.height / 2 + y / 2})`,
    ),
    _.attr('transform', `translate(0,${f ? p.height / 2 + y / 2 : -p.height / 2 - y / 2})`),
    Y(t, M),
    (t.intersect = function (E) {
      if ((F.info('iconSquare intersect', t, E), !t.label)) return q.rect(t, E);
      const O = t.x ?? 0,
        $ = t.y ?? 0,
        D = t.height ?? 0;
      let W = [];
      return (
        f
          ? (W = [
              { x: O - p.width / 2, y: $ - D / 2 },
              { x: O + p.width / 2, y: $ - D / 2 },
              { x: O + p.width / 2, y: $ - D / 2 + p.height + y },
              { x: O + g / 2, y: $ - D / 2 + p.height + y },
              { x: O + g / 2, y: $ + D / 2 },
              { x: O - g / 2, y: $ + D / 2 },
              { x: O - g / 2, y: $ - D / 2 + p.height + y },
              { x: O - p.width / 2, y: $ - D / 2 + p.height + y },
            ])
          : (W = [
              { x: O - g / 2, y: $ - D / 2 },
              { x: O + g / 2, y: $ - D / 2 },
              { x: O + g / 2, y: $ - D / 2 + c },
              { x: O + p.width / 2, y: $ - D / 2 + c },
              { x: O + p.width / 2 / 2, y: $ + D / 2 },
              { x: O - p.width / 2, y: $ + D / 2 },
              { x: O - p.width / 2, y: $ - D / 2 + c },
              { x: O - g / 2, y: $ - D / 2 + c },
            ]),
        q.polygon(t, W, E)
      );
    }),
    h
  );
}
d(Jl, 'imageSquare');
async function tn(r, t) {
  const { labelStyles: i, nodeStyles: e } = H(t);
  t.labelStyle = i;
  const o = t.padding ?? 0,
    a = o,
    s = t.look === 'neo' ? o * 2 : o,
    { shapeSvg: l, bbox: n } = await V(r, t, U(t)),
    g = Math.max(n.width + (s ?? 0) * 2, t?.width ?? 0),
    c = Math.max(n.height + (a ?? 0) * 2, t?.height ?? 0),
    h = [
      { x: 0, y: 0 },
      { x: g, y: 0 },
      { x: g + (3 * c) / 6, y: -c },
      { x: (-3 * c) / 6, y: -c },
    ];
  let p;
  const { cssStyles: u } = t;
  if (t.look === 'handDrawn') {
    const f = z.svg(l),
      C = N(t, {}),
      x = J(h),
      y = f.path(x, C);
    ((p = l.insert(() => y, ':first-child').attr('transform', `translate(${-g / 2}, ${c / 2})`)),
      u && p.attr('style', u));
  } else p = Ut(l, g, c, h);
  return (
    e && p.attr('style', e),
    (t.width = g),
    (t.height = c),
    Y(t, p),
    (t.intersect = function (f) {
      return q.polygon(t, h, f);
    }),
    l
  );
}
d(tn, 'inv_trapezoid');
async function rn(r, t) {
  const { shapeSvg: i, bbox: e, label: o } = await V(r, t, 'label'),
    a = i.insert('rect', ':first-child');
  return (
    a.attr('width', 0.1).attr('height', 0.1),
    i.attr('class', 'label edgeLabel'),
    o.attr(
      'transform',
      `translate(${-(e.width / 2) - (e.x - (e.left ?? 0))}, ${-(e.height / 2) - (e.y - (e.top ?? 0))})`,
    ),
    Y(t, a),
    (t.intersect = function (n) {
      return q.rect(t, n);
    }),
    i
  );
}
d(rn, 'labelRect');
async function en(r, t) {
  const { labelStyles: i, nodeStyles: e } = H(t);
  t.labelStyle = i;
  const o = t.padding ?? 0,
    a = o,
    s = t.look === 'neo' ? o * 2 : o,
    { shapeSvg: l, bbox: n } = await V(r, t, U(t)),
    g = (t?.height ?? n.height) + a,
    c = (t?.width ?? n.width) + s,
    h = [
      { x: 0, y: 0 },
      { x: c + (3 * g) / 6, y: 0 },
      { x: c, y: -g },
      { x: -(3 * g) / 6, y: -g },
    ];
  let p;
  const { cssStyles: u } = t;
  if (t.look === 'handDrawn') {
    const f = z.svg(l),
      C = N(t, {}),
      x = J(h),
      y = f.path(x, C);
    ((p = l.insert(() => y, ':first-child').attr('transform', `translate(${-c / 2}, ${g / 2})`)),
      u && p.attr('style', u));
  } else p = Ut(l, c, g, h);
  return (
    e && p.attr('style', e),
    (t.width = c),
    (t.height = g),
    Y(t, p),
    (t.intersect = function (f) {
      return q.polygon(t, h, f);
    }),
    l
  );
}
d(en, 'lean_left');
async function on(r, t) {
  const { labelStyles: i, nodeStyles: e } = H(t);
  t.labelStyle = i;
  const o = t.padding ?? 0,
    a = o,
    s = t.look === 'neo' ? o * 2 : o,
    { shapeSvg: l, bbox: n } = await V(r, t, U(t)),
    g = (t?.height ?? n.height) + a,
    c = (t?.width ?? n.width) + s,
    h = [
      { x: (-3 * g) / 6, y: 0 },
      { x: c, y: 0 },
      { x: c + (3 * g) / 6, y: -g },
      { x: 0, y: -g },
    ];
  let p;
  const { cssStyles: u } = t;
  if (t.look === 'handDrawn') {
    const f = z.svg(l),
      C = N(t, {}),
      x = J(h),
      y = f.path(x, C);
    ((p = l.insert(() => y, ':first-child').attr('transform', `translate(${-c / 2}, ${g / 2})`)),
      u && p.attr('style', u));
  } else p = Ut(l, c, g, h);
  return (
    e && p.attr('style', e),
    (t.width = c),
    (t.height = g),
    Y(t, p),
    (t.intersect = function (f) {
      return q.polygon(t, h, f);
    }),
    l
  );
}
d(on, 'lean_right');
function an(r, t) {
  const { labelStyles: i, nodeStyles: e } = H(t);
  ((t.label = ''), (t.labelStyle = i));
  const o = r
      .insert('g')
      .attr('class', U(t))
      .attr('id', t.domId ?? t.id),
    { cssStyles: a } = t,
    s = Math.max(35, t?.width ?? 0),
    l = Math.max(35, t?.height ?? 0),
    n = 7,
    g = [
      { x: s, y: 0 },
      { x: 0, y: l + n / 2 },
      { x: s - 2 * n, y: l + n / 2 },
      { x: 0, y: 2 * l },
      { x: s, y: l - n / 2 },
      { x: 2 * n, y: l - n / 2 },
    ],
    c = z.svg(o),
    h = N(t, {});
  t.look !== 'handDrawn' && ((h.roughness = 0), (h.fillStyle = 'solid'));
  const p = J(g),
    u = c.path(p, h),
    f = o.insert(() => u, ':first-child');
  return (
    f.attr('class', 'outer-path'),
    a && t.look !== 'handDrawn' && f.selectAll('path').attr('style', a),
    e && t.look !== 'handDrawn' && f.selectAll('path').attr('style', e),
    f.attr('transform', `translate(-${s / 2},${-l})`),
    Y(t, f),
    (t.intersect = function (C) {
      return (F.info('lightningBolt intersect', t, C), q.polygon(t, g, C));
    }),
    o
  );
}
d(an, 'lightningBolt');
var Nu = d(
    (r, t, i, e, o, a, s) =>
      [
        `M${r},${t + a}`,
        `a${o},${a} 0,0,0 ${i},0`,
        `a${o},${a} 0,0,0 ${-i},0`,
        `l0,${e}`,
        `a${o},${a} 0,0,0 ${i},0`,
        `l0,${-e}`,
        `M${r},${t + a + s}`,
        `a${o},${a} 0,0,0 ${i},0`,
      ].join(' '),
    'createCylinderPathD',
  ),
  Hu = d(
    (r, t, i, e, o, a, s) =>
      [
        `M${r},${t + a}`,
        `M${r + i},${t + a}`,
        `a${o},${a} 0,0,0 ${-i},0`,
        `l0,${e}`,
        `a${o},${a} 0,0,0 ${i},0`,
        `l0,${-e}`,
        `M${r},${t + a + s}`,
        `a${o},${a} 0,0,0 ${i},0`,
      ].join(' '),
    'createOuterCylinderPathD',
  ),
  Yu = d(
    (r, t, i, e, o, a) => [`M${r - i / 2},${-e / 2}`, `a${o},${a} 0,0,0 ${i},0`].join(' '),
    'createInnerCylinderPathD',
  ),
  Co = 10,
  yo = 10;
async function sn(r, t) {
  const { labelStyles: i, nodeStyles: e } = H(t);
  t.labelStyle = i;
  const o = t.padding ?? 0,
    a = t.look === 'neo' ? 16 : o,
    s = t.look === 'neo' ? 24 : o;
  if (t.width || t.height) {
    const y = t.width ?? 0;
    ((t.width = (t.width ?? 0) - a), t.width < yo && (t.width = yo));
    const k = y / 2 / (2.5 + y / 50);
    ((t.height = (t.height ?? 0) - s - k * 3), t.height < Co && (t.height = Co));
  }
  const { shapeSvg: l, bbox: n, label: g } = await V(r, t, U(t)),
    c = (t?.width ? t?.width : n.width) + a * 2,
    h = c / 2,
    p = h / (2.5 + c / 50),
    u = (t?.height ? t?.height : n.height) + p + s * 2,
    f = u * 0.1;
  let C;
  const { cssStyles: x } = t;
  if (t.look === 'handDrawn') {
    const y = z.svg(l),
      b = Hu(0, 0, c, u, h, p, f),
      k = Yu(0, p, c, u, h, p),
      S = N(t, {}),
      T = y.path(b, S),
      L = y.path(k, S);
    (l.insert(() => L, ':first-child').attr('class', 'line'),
      (C = l.insert(() => T, ':first-child')),
      C.attr('class', 'basic label-container'),
      x && C.attr('style', x));
  } else {
    const y = Nu(0, 0, c, u, h, p, f);
    C = l
      .insert('path', ':first-child')
      .attr('d', y)
      .attr('class', 'basic label-container outer-path')
      .attr('style', dt(x))
      .attr('style', e);
  }
  return (
    C.attr('label-offset-y', p),
    C.attr('transform', `translate(${-c / 2}, ${-(u / 2 + p)})`),
    Y(t, C),
    g.attr(
      'transform',
      `translate(${-(n.width / 2) - (n.x - (n.left ?? 0))}, ${-(n.height / 2) + p - (n.y - (n.top ?? 0))})`,
    ),
    (t.intersect = function (y) {
      const b = q.rect(t, y),
        k = b.x - (t.x ?? 0);
      if (
        h != 0 &&
        (Math.abs(k) < (t.width ?? 0) / 2 ||
          (Math.abs(k) == (t.width ?? 0) / 2 &&
            Math.abs(b.y - (t.y ?? 0)) > (t.height ?? 0) / 2 - p))
      ) {
        let S = p * p * (1 - (k * k) / (h * h));
        (S > 0 && (S = Math.sqrt(S)), (S = p - S), y.y - (t.y ?? 0) > 0 && (S = -S), (b.y += S));
      }
      return b;
    }),
    l
  );
}
d(sn, 'linedCylinder');
async function ln(r, t) {
  const { labelStyles: i, nodeStyles: e } = H(t);
  t.labelStyle = i;
  const o = t.padding ?? 0,
    a = t.look === 'neo' ? 16 : o,
    s = t.look === 'neo' ? 12 : o;
  if (t.width || t.height) {
    const S = t.width;
    ((t.width = ((S ?? 0) * 10) / 11 - a * 2),
      t.width < 10 && (t.width = 10),
      (t.height = (t?.height ?? 0) - s * 2),
      t.height < 10 && (t.height = 10));
  }
  const { shapeSvg: l, bbox: n, label: g } = await V(r, t, U(t)),
    c = (t?.width ? t?.width : n.width) + (a ?? 0) * 2,
    h = (t?.height ? t?.height : n.height) + (s ?? 0) * 2,
    p = t.look === 'neo' ? h / 4 : h / 8,
    u = h + p,
    { cssStyles: f } = t,
    C = z.svg(l),
    x = N(t, {});
  t.look !== 'handDrawn' && ((x.roughness = 0), (x.fillStyle = 'solid'));
  const y = [
      { x: -c / 2 - (c / 2) * 0.1, y: -u / 2 },
      { x: -c / 2 - (c / 2) * 0.1, y: u / 2 },
      ...Zt(-c / 2 - (c / 2) * 0.1, u / 2, c / 2 + (c / 2) * 0.1, u / 2, p, 0.8),
      { x: c / 2 + (c / 2) * 0.1, y: -u / 2 },
      { x: -c / 2 - (c / 2) * 0.1, y: -u / 2 },
      { x: -c / 2, y: -u / 2 },
      { x: -c / 2, y: (u / 2) * 1.1 },
      { x: -c / 2, y: -u / 2 },
    ],
    b = C.polygon(
      y.map((S) => [S.x, S.y]),
      x,
    ),
    k = l.insert(() => b, ':first-child');
  return (
    k.attr('class', 'basic label-container outer-path'),
    f && t.look !== 'handDrawn' && k.selectAll('path').attr('style', f),
    e && t.look !== 'handDrawn' && k.selectAll('path').attr('style', e),
    k.attr('transform', `translate(0,${-p / 2})`),
    g.attr(
      'transform',
      `translate(${-c / 2 + (t.padding ?? 0) + ((c / 2) * 0.1) / 2 - (n.x - (n.left ?? 0))},${-h / 2 + (t.padding ?? 0) - p / 2 - (n.y - (n.top ?? 0))})`,
    ),
    Y(t, k),
    (t.intersect = function (S) {
      return q.polygon(t, y, S);
    }),
    l
  );
}
d(ln, 'linedWaveEdgedRect');
async function nn(r, t) {
  const { labelStyles: i, nodeStyles: e } = H(t);
  t.labelStyle = i;
  const o = t.padding ?? 0,
    a = t.look === 'neo' ? 16 : o,
    s = t.look === 'neo' ? 12 : o,
    l = t.look === 'neo' ? 10 : 5;
  (t.width || t.height) &&
    ((t.width = Math.max((t?.width ?? 0) - a * 2 - 2 * l, 10)),
    (t.height = Math.max((t?.height ?? 0) - s * 2 - 2 * l, 10)));
  const { shapeSvg: n, bbox: g, label: c } = await V(r, t, U(t)),
    h = (t?.width ? t?.width : g.width) + a * 2 + 2 * l,
    p = (t?.height ? t?.height : g.height) + s * 2 + 2 * l,
    u = h - 2 * l,
    f = p - 2 * l,
    C = -u / 2,
    x = -f / 2,
    { cssStyles: y } = t,
    b = z.svg(n),
    k = N(t, {}),
    S = [
      { x: C - l, y: x + l },
      { x: C - l, y: x + f + l },
      { x: C + u - l, y: x + f + l },
      { x: C + u - l, y: x + f },
      { x: C + u, y: x + f },
      { x: C + u, y: x + f - l },
      { x: C + u + l, y: x + f - l },
      { x: C + u + l, y: x - l },
      { x: C + l, y: x - l },
      { x: C + l, y: x },
      { x: C, y: x },
      { x: C, y: x + l },
    ],
    T = [
      { x: C, y: x + l },
      { x: C + u - l, y: x + l },
      { x: C + u - l, y: x + f },
      { x: C + u, y: x + f },
      { x: C + u, y: x },
      { x: C, y: x },
    ];
  t.look !== 'handDrawn' && ((k.roughness = 0), (k.fillStyle = 'solid'));
  const L = J(S);
  let A = b.path(L, k);
  const _ = J(T);
  let M = b.path(_, k);
  t.look !== 'handDrawn' && ((A = ue(A)), (M = ue(M)));
  const E = n.insert('g', ':first-child');
  return (
    E.insert(() => A),
    E.insert(() => M),
    E.attr('class', 'basic label-container outer-path'),
    y && t.look !== 'handDrawn' && E.selectAll('path').attr('style', y),
    e && t.look !== 'handDrawn' && E.selectAll('path').attr('style', e),
    c.attr(
      'transform',
      `translate(${-(g.width / 2) - l - (g.x - (g.left ?? 0))}, ${-(g.height / 2) + l - (g.y - (g.top ?? 0))})`,
    ),
    Y(t, E),
    (t.intersect = function (O) {
      return q.polygon(t, S, O);
    }),
    n
  );
}
d(nn, 'multiRect');
async function hn(r, t) {
  const { labelStyles: i, nodeStyles: e } = H(t);
  t.labelStyle = i;
  const { shapeSvg: o, bbox: a, label: s } = await V(r, t, U(t)),
    l = t.padding ?? 0,
    n = t.look === 'neo' ? 16 : l,
    g = t.look === 'neo' ? 12 : l;
  let c = !0;
  (t.width || t.height) &&
    ((c = !1), (t.width = (t?.width ?? 0) - n * 2), (t.height = (t?.height ?? 0) - g * 3));
  const h = Math.max(a.width, t?.width ?? 0) + n * 2,
    p = Math.max(a.height, t?.height ?? 0) + g * 3,
    u = t.look === 'neo' ? p / 4 : p / 8,
    f = p + (c ? u / 2 : -u / 2),
    C = -h / 2,
    x = -f / 2,
    y = 10,
    { cssStyles: b } = t,
    k = Zt(C - y, x + f + y, C + h - y, x + f + y, u, 0.8),
    S = k?.[k.length - 1],
    T = [
      { x: C - y, y: x + y },
      { x: C - y, y: x + f + y },
      ...k,
      { x: C + h - y, y: S.y - y },
      { x: C + h, y: S.y - y },
      { x: C + h, y: S.y - 2 * y },
      { x: C + h + y, y: S.y - 2 * y },
      { x: C + h + y, y: x - y },
      { x: C + y, y: x - y },
      { x: C + y, y: x },
      { x: C, y: x },
      { x: C, y: x + y },
    ],
    L = [
      { x: C, y: x + y },
      { x: C + h - y, y: x + y },
      { x: C + h - y, y: S.y - y },
      { x: C + h, y: S.y - y },
      { x: C + h, y: x },
      { x: C, y: x },
    ],
    A = z.svg(o),
    _ = N(t, {});
  t.look !== 'handDrawn' && ((_.roughness = 0), (_.fillStyle = 'solid'));
  const M = J(T),
    E = A.path(M, _),
    O = J(L),
    $ = A.path(O, _),
    D = o.insert(() => E, ':first-child');
  return (
    D.insert(() => $),
    D.attr('class', 'basic label-container outer-path'),
    b && t.look !== 'handDrawn' && D.selectAll('path').attr('style', b),
    e && t.look !== 'handDrawn' && D.selectAll('path').attr('style', e),
    D.attr('transform', `translate(0,${-u / 2})`),
    s.attr(
      'transform',
      `translate(${-(a.width / 2) - y - (a.x - (a.left ?? 0))}, ${-(a.height / 2) + y - u / 2 - (a.y - (a.top ?? 0))})`,
    ),
    Y(t, D),
    (t.intersect = function (W) {
      return q.polygon(t, T, W);
    }),
    o
  );
}
d(hn, 'multiWaveEdgedRectangle');
async function cn(r, t, { config: { themeVariables: i } }) {
  const { labelStyles: e, nodeStyles: o } = H(t);
  ((t.labelStyle = e), t.useHtmlLabels || kt(at()) || (t.centerLabel = !0));
  const { shapeSvg: s, bbox: l, label: n } = await V(r, t, U(t)),
    g = Math.max(l.width + (t.padding ?? 0) * 2, t?.width ?? 0),
    c = Math.max(l.height + (t.padding ?? 0) * 2, t?.height ?? 0),
    h = -g / 2,
    p = -c / 2,
    { cssStyles: u } = t,
    f = z.svg(s),
    C = N(t, { fill: i.noteBkgColor, stroke: i.noteBorderColor });
  t.look !== 'handDrawn' && ((C.roughness = 0), (C.fillStyle = 'solid'));
  const x = f.rectangle(h, p, g, c, C),
    y = s.insert(() => x, ':first-child');
  return (
    y.attr('class', 'basic label-container outer-path'),
    n.attr('class', 'label noteLabel'),
    u && t.look !== 'handDrawn' && y.selectAll('path').attr('style', u),
    o && t.look !== 'handDrawn' && y.selectAll('path').attr('style', o),
    n.attr(
      'transform',
      `translate(${-l.width / 2 - (l.x - (l.left ?? 0))}, ${-(l.height / 2) - (l.y - (l.top ?? 0))})`,
    ),
    Y(t, y),
    (t.intersect = function (b) {
      return q.rect(t, b);
    }),
    s
  );
}
d(cn, 'note');
var ju = d(
  (r, t, i) =>
    [
      `M${r + i / 2},${t}`,
      `L${r + i},${t - i / 2}`,
      `L${r + i / 2},${t - i}`,
      `L${r},${t - i / 2}`,
      'Z',
    ].join(' '),
  'createDecisionBoxPathD',
);
async function dn(r, t) {
  const { labelStyles: i, nodeStyles: e } = H(t);
  t.labelStyle = i;
  const { shapeSvg: o, bbox: a } = await V(r, t, U(t)),
    s = a.width + (t.padding ?? 0),
    l = a.height + (t.padding ?? 0),
    n = s + l,
    g = 0.5,
    c = [
      { x: n / 2, y: 0 },
      { x: n, y: -n / 2 },
      { x: n / 2, y: -n },
      { x: 0, y: -n / 2 },
    ];
  let h;
  const { cssStyles: p } = t;
  if (t.look === 'handDrawn') {
    const u = z.svg(o),
      f = N(t, {}),
      C = ju(0, 0, n),
      x = u.path(C, f);
    ((h = o
      .insert(() => x, ':first-child')
      .attr('transform', `translate(${-n / 2 + g}, ${n / 2})`)),
      p && h.attr('style', p));
  } else ((h = Ut(o, n, n, c)), h.attr('transform', `translate(${-n / 2 + g}, ${n / 2})`));
  return (
    e && h.attr('style', e),
    Y(t, h),
    (t.calcIntersect = function (u, f) {
      const C = u.width,
        x = [
          { x: C / 2, y: 0 },
          { x: C, y: -C / 2 },
          { x: C / 2, y: -C },
          { x: 0, y: -C / 2 },
        ],
        y = q.polygon(u, x, f);
      return { x: y.x - 0.5, y: y.y - 0.5 };
    }),
    (t.intersect = function (u) {
      return this.calcIntersect(t, u);
    }),
    o
  );
}
d(dn, 'question');
async function gn(r, t) {
  const { labelStyles: i, nodeStyles: e } = H(t);
  t.labelStyle = i;
  const o = t.padding ?? 0,
    a = t.look === 'neo' ? 21 : (o ?? 0),
    s = t.look === 'neo' ? 12 : (o ?? 0),
    { shapeSvg: l, bbox: n, label: g } = await V(r, t, U(t)),
    c = (t?.width ?? n.width) + (t.look === 'neo' ? a * 2 : a),
    h = (t?.height ?? n.height) + (t.look === 'neo' ? s * 2 : s),
    p = -c / 2,
    u = -h / 2,
    f = u / 2,
    C = [
      { x: p + f, y: u },
      { x: p, y: 0 },
      { x: p + f, y: -u },
      { x: -p, y: -u },
      { x: -p, y: u },
    ],
    { cssStyles: x } = t,
    y = z.svg(l),
    b = N(t, {});
  t.look !== 'handDrawn' && ((b.roughness = 0), (b.fillStyle = 'solid'));
  const k = J(C),
    S = y.path(k, b),
    T = l.insert(() => S, ':first-child');
  return (
    T.attr('class', 'basic label-container outer-path'),
    x && t.look !== 'handDrawn' && T.selectAll('path').attr('style', x),
    e && t.look !== 'handDrawn' && T.selectAll('path').attr('style', e),
    T.attr('transform', `translate(${-f / 2},0)`),
    g.attr(
      'transform',
      `translate(${-f / 2 - n.width / 2 - (n.x - (n.left ?? 0))}, ${-(n.height / 2) - (n.y - (n.top ?? 0))})`,
    ),
    Y(t, T),
    (t.intersect = function (L) {
      return q.polygon(t, C, L);
    }),
    l
  );
}
d(gn, 'rect_left_inv_arrow');
async function un(r, t) {
  const { labelStyles: i, nodeStyles: e } = H(t);
  t.labelStyle = i;
  let o;
  t.cssClasses ? (o = 'node ' + t.cssClasses) : (o = 'node default');
  const a = r
      .insert('g')
      .attr('class', o)
      .attr('id', t.domId || t.id),
    s = a.insert('g'),
    l = a.insert('g').attr('class', 'label').attr('style', e),
    n = t.description,
    g = t.label,
    c = await Gt(l, g, t.labelStyle, !0, !0);
  let h = { width: 0, height: 0 };
  if (kt(it())) {
    const _ = c.children[0],
      M = K(c);
    ((h = _.getBoundingClientRect()), M.attr('width', h.width), M.attr('height', h.height));
  }
  F.info('Text 2', n);
  const p = n || [],
    u = c.getBBox(),
    f = await Gt(l, Array.isArray(p) ? p.join('<br/>') : p, t.labelStyle, !0, !0),
    C = f.children[0],
    x = K(f);
  ((h = C.getBoundingClientRect()), x.attr('width', h.width), x.attr('height', h.height));
  const y = (t.padding || 0) / 2;
  (K(f).attr(
    'transform',
    'translate( ' +
      (h.width > u.width ? 0 : (u.width - h.width) / 2) +
      ', ' +
      (u.height + y + 5) +
      ')',
  ),
    K(c).attr(
      'transform',
      'translate( ' + (h.width < u.width ? 0 : -(u.width - h.width) / 2) + ', 0)',
    ),
    (h = l.node().getBBox()),
    l.attr('transform', 'translate(' + -h.width / 2 + ', ' + (-h.height / 2 - y + 3) + ')'));
  const b = h.width + (t.padding || 0),
    k = h.height + (t.padding || 0),
    S = -h.width / 2 - y,
    T = -h.height / 2 - y;
  let L, A;
  if (t.look === 'handDrawn') {
    const _ = z.svg(a),
      M = N(t, {}),
      E = _.path(Jt(S, T, b, k, t.rx || 0), M),
      O = _.line(
        -h.width / 2 - y,
        -h.height / 2 - y + u.height + y,
        h.width / 2 + y,
        -h.height / 2 - y + u.height + y,
        M,
      );
    ((A = a.insert(() => (F.debug('Rough node insert CXC', E), O), ':first-child')),
      (L = a.insert(() => (F.debug('Rough node insert CXC', E), E), ':first-child')));
  } else
    ((L = s.insert('rect', ':first-child')),
      (A = s.insert('line')),
      L.attr('class', 'outer title-state')
        .attr('style', e)
        .attr('x', -h.width / 2 - y)
        .attr('y', -h.height / 2 - y)
        .attr('width', h.width + (t.padding || 0))
        .attr('height', h.height + (t.padding || 0)),
      A.attr('class', 'divider')
        .attr('x1', -h.width / 2 - y)
        .attr('x2', h.width / 2 + y)
        .attr('y1', -h.height / 2 - y + u.height + y)
        .attr('y2', -h.height / 2 - y + u.height + y));
  return (
    Y(t, L),
    (t.intersect = function (_) {
      return q.rect(t, _);
    }),
    a
  );
}
d(un, 'rectWithTitle');
async function pn(r, t, { config: { themeVariables: i } }) {
  const e = i?.radius ?? 5,
    o = {
      rx: e,
      ry: e,
      labelPaddingX: (t?.padding ?? 0) * 1,
      labelPaddingY: (t?.padding ?? 0) * 1,
    };
  return qr(r, t, o);
}
d(pn, 'roundedRect');
var ir = 8;
async function fn(r, t) {
  const { labelStyles: i, nodeStyles: e } = H(t);
  t.labelStyle = i;
  const o = t.look === 'neo' ? 16 : (t.padding ?? 0),
    a = t.look === 'neo' ? 12 : (t.padding ?? 0),
    { shapeSvg: s, bbox: l, label: n } = await V(r, t, U(t)),
    g = (t?.width ?? l.width) + o * 2 + (t.look === 'neo' ? ir : ir * 2),
    c = (t?.height ?? l.height) + a * 2,
    h = g - ir,
    p = c,
    u = ir - g / 2,
    f = -c / 2,
    { cssStyles: C } = t,
    x = z.svg(s),
    y = N(t, {});
  t.look !== 'handDrawn' && ((y.roughness = 0), (y.fillStyle = 'solid'));
  const b = [
      { x: u, y: f },
      { x: u + h, y: f },
      { x: u + h, y: f + p },
      { x: u - ir, y: f + p },
      { x: u - ir, y: f },
      { x: u, y: f },
      { x: u, y: f + p },
    ],
    k = x.polygon(
      b.map((T) => [T.x, T.y]),
      y,
    ),
    S = s.insert(() => k, ':first-child');
  return (
    S.attr('class', 'basic label-container outer-path').attr('style', dt(C)),
    e && t.look !== 'handDrawn' && S.selectAll('path').attr('style', e),
    C && t.look !== 'handDrawn' && S.selectAll('path').attr('style', e),
    n.attr(
      'transform',
      `translate(${ir / 2 - l.width / 2 - (l.x - (l.left ?? 0))}, ${-(l.height / 2) - (l.y - (l.top ?? 0))})`,
    ),
    Y(t, S),
    (t.intersect = function (T) {
      return q.rect(t, T);
    }),
    s
  );
}
d(fn, 'shadedProcess');
async function mn(r, t) {
  const { labelStyles: i, nodeStyles: e } = H(t);
  t.labelStyle = i;
  const o = t.padding ?? 0,
    a = t.look === 'neo' ? 16 : o,
    s = t.look === 'neo' ? 12 : o;
  (t.width || t.height) &&
    ((t.width = Math.max((t?.width ?? 0) - a * 2, 10)),
    (t.height = Math.max((t?.height ?? 0) / 1.5 - s * 2, 10)));
  const { shapeSvg: l, bbox: n, label: g } = await V(r, t, U(t)),
    c = (t?.width ? t?.width : n.width) + a * 2,
    h = ((t?.height ? t?.height : n.height) + s * 2) * 1.5,
    p = c,
    u = h / 1.5,
    f = -p / 2,
    C = -u / 2,
    { cssStyles: x } = t,
    y = z.svg(l),
    b = N(t, {});
  t.look !== 'handDrawn' && ((b.roughness = 0), (b.fillStyle = 'solid'));
  const k = [
      { x: f, y: C },
      { x: f, y: C + u },
      { x: f + p, y: C + u },
      { x: f + p, y: C - u / 2 },
    ],
    S = J(k),
    T = y.path(S, b),
    L = l.insert(() => T, ':first-child');
  return (
    L.attr('class', 'basic label-container  outer-path'),
    x && t.look !== 'handDrawn' && L.selectChildren('path').attr('style', x),
    e && t.look !== 'handDrawn' && L.selectChildren('path').attr('style', e),
    L.attr('transform', `translate(0, ${u / 4})`),
    g.attr(
      'transform',
      `translate(${-p / 2 + (t.padding ?? 0) - (n.x - (n.left ?? 0))}, ${-u / 4 + (t.padding ?? 0) - (n.y - (n.top ?? 0))})`,
    ),
    Y(t, L),
    (t.intersect = function (A) {
      return q.polygon(t, k, A);
    }),
    l
  );
}
d(mn, 'slopedRect');
async function Cn(r, t) {
  const i = t.padding ?? 0,
    e = t.look === 'neo' ? 16 : i * 2,
    o = t.look === 'neo' ? 12 : i,
    a = { rx: 0, ry: 0, labelPaddingX: t.labelPaddingX ?? e, labelPaddingY: o };
  return qr(r, t, a);
}
d(Cn, 'squareRect');
async function yn(r, t) {
  const { labelStyles: i, nodeStyles: e } = H(t);
  t.labelStyle = i;
  const o = t.padding ?? 0,
    a = t.look === 'neo' ? 20 : o,
    s = t.look === 'neo' ? 12 : o,
    { shapeSvg: l, bbox: n } = await V(r, t, U(t)),
    g = n.height + (t.look === 'neo' ? s * 2 : s),
    c = n.width + g / 4 + (t.look === 'neo' ? a * 2 : a),
    h = g / 2,
    { cssStyles: p } = t,
    u = z.svg(l),
    f = N(t, {});
  t.look !== 'handDrawn' && ((f.roughness = 0), (f.fillStyle = 'solid'));
  const C = [
      { x: -c / 2 + h, y: -g / 2 },
      { x: c / 2 - h, y: -g / 2 },
      ...Qr(-c / 2 + h, 0, h, 50, 90, 270),
      { x: c / 2 - h, y: g / 2 },
      ...Qr(c / 2 - h, 0, h, 50, 270, 450),
    ],
    x = J(C),
    y = u.path(x, f),
    b = l.insert(() => y, ':first-child');
  return (
    b.attr('class', 'basic label-container outer-path'),
    p && t.look !== 'handDrawn' && b.selectChildren('path').attr('style', p),
    e && t.look !== 'handDrawn' && b.selectChildren('path').attr('style', e),
    Y(t, b),
    (t.intersect = function (k) {
      return q.polygon(t, C, k);
    }),
    l
  );
}
d(yn, 'stadium');
async function xn(r, t) {
  const i = { rx: t.look === 'neo' ? 3 : 5, ry: t.look === 'neo' ? 3 : 5 };
  return qr(r, t, i);
}
d(xn, 'state');
function bn(r, t, { config: { themeVariables: i } }) {
  const { labelStyles: e, nodeStyles: o } = H(t);
  t.labelStyle = e;
  const { cssStyles: a } = t,
    { lineColor: s, stateBorder: l, nodeBorder: n, nodeShadow: g } = i;
  ((t.width || t.height) &&
    ((t.width ?? 0) < 14 && (t.width = 14), (t.height ?? 0) < 14 && (t.height = 14)),
    t.width || (t.width = 14),
    t.height || (t.height = 14));
  const c = r
      .insert('g')
      .attr('class', 'node default')
      .attr('id', t.domId ?? t.id),
    h = z.svg(c),
    p = N(t, {});
  t.look !== 'handDrawn' && ((p.roughness = 0), (p.fillStyle = 'solid'));
  const u = h.circle(0, 0, t.width, { ...p, stroke: s, strokeWidth: 2 }),
    f = l ?? n,
    C = ((t.width ?? 0) * 5) / 14,
    x = h.circle(0, 0, C, { ...p, fill: f, stroke: f, strokeWidth: 2, fillStyle: 'solid' }),
    y = c.insert(() => u, ':first-child');
  if (
    (y.insert(() => x),
    t.look !== 'handDrawn' && y.attr('class', 'outer-path'),
    a && y.selectAll('path').attr('style', a),
    o && y.selectAll('path').attr('style', o),
    t.width < 25 && g && t.look !== 'handDrawn')
  ) {
    const b = r.node()?.ownerSVGElement?.id ?? '',
      k = b ? `${b}-drop-shadow-small` : 'drop-shadow-small';
    y.attr('style', `filter:url(#${k})`);
  }
  return (
    Y(t, y),
    (t.intersect = function (b) {
      return q.circle(t, (t.width ?? 0) / 2, b);
    }),
    c
  );
}
d(bn, 'stateEnd');
function kn(r, t, { config: { themeVariables: i } }) {
  const { lineColor: e, nodeShadow: o } = i;
  ((t.width || t.height) &&
    ((t.width ?? 0) < 14 && (t.width = 14), (t.height ?? 0) < 14 && (t.height = 14)),
    t.width || (t.width = 14),
    t.height || (t.height = 14));
  const a = r
    .insert('g')
    .attr('class', 'node default')
    .attr('id', t.domId || t.id);
  let s;
  if (t.look === 'handDrawn') {
    const n = z.svg(a).circle(0, 0, t.width, yu(e));
    ((s = a.insert(() => n)),
      s
        .attr('class', 'state-start')
        .attr('r', (t.width ?? 7) / 2)
        .attr('width', t.width ?? 14)
        .attr('height', t.height ?? 14));
  } else
    ((s = a.insert('circle', ':first-child')),
      s
        .attr('class', 'state-start')
        .attr('r', (t.width ?? 7) / 2)
        .attr('width', t.width ?? 14)
        .attr('height', t.height ?? 14));
  if (t.width < 25 && o && t.look !== 'handDrawn') {
    const l = r.node()?.ownerSVGElement?.id ?? '',
      n = l ? `${l}-drop-shadow-small` : 'drop-shadow-small';
    s.attr('style', `filter:url(#${n})`);
  }
  return (
    Y(t, s),
    (t.intersect = function (l) {
      return q.circle(t, (t.width ?? 7) / 2, l);
    }),
    a
  );
}
d(kn, 'stateStart');
var gr = 8;
async function Bn(r, t) {
  const { labelStyles: i, nodeStyles: e } = H(t);
  t.labelStyle = i;
  const o = t?.padding ?? 8,
    a = t.look === 'neo' ? 28 : o,
    s = t.look === 'neo' ? 12 : o,
    { shapeSvg: l, bbox: n } = await V(r, t, U(t)),
    g = (t?.width ?? n.width) + 2 * gr + a,
    c = (t?.height ?? n.height) + s,
    h = g - 2 * gr,
    p = c,
    u = -g / 2,
    f = -c / 2,
    C = [
      { x: 0, y: 0 },
      { x: h, y: 0 },
      { x: h, y: -p },
      { x: 0, y: -p },
      { x: 0, y: 0 },
      { x: -8, y: 0 },
      { x: h + 8, y: 0 },
      { x: h + 8, y: -p },
      { x: -8, y: -p },
      { x: -8, y: 0 },
    ];
  if (t.look === 'handDrawn') {
    const x = z.svg(l),
      y = N(t, {}),
      b = x.rectangle(u, f, h + 16, p, y),
      k = x.line(u + gr, f, u + gr, f + p, y),
      S = x.line(u + gr + h, f, u + gr + h, f + p, y);
    (l.insert(() => k, ':first-child'), l.insert(() => S, ':first-child'));
    const T = l.insert(() => b, ':first-child'),
      { cssStyles: L } = t;
    (T.attr('class', 'basic label-container').attr('style', dt(L)), Y(t, T));
  } else {
    const x = Ut(l, h, p, C);
    (e && x.attr('style', e), Y(t, x));
  }
  return (
    (t.intersect = function (x) {
      return q.polygon(t, C, x);
    }),
    l
  );
}
d(Bn, 'subroutine');
var qi = 0.2;
async function Tn(r, t) {
  const { labelStyles: i, nodeStyles: e } = H(t);
  t.labelStyle = i;
  const o = t.padding ?? 0,
    a = t.look === 'neo' ? 16 : o,
    s = t.look === 'neo' ? 12 : o;
  (t.width || t.height) &&
    ((t.height = Math.max((t?.height ?? 0) - s * 2, 10)),
    (t.width = Math.max((t?.width ?? 0) - a * 2 - qi * (t.height + s * 2), 10)));
  const { shapeSvg: l, bbox: n } = await V(r, t, U(t)),
    g = (t?.height ? t?.height : n.height) + s * 2,
    c = qi * g,
    h = qi * g,
    u = (t?.width ? t?.width : n.width) + a * 2 + c - c,
    f = g,
    C = -u / 2,
    x = -f / 2,
    { cssStyles: y } = t,
    b = z.svg(l),
    k = N(t, {}),
    S = [
      { x: C - c / 2, y: x },
      { x: C + u + c / 2, y: x },
      { x: C + u + c / 2, y: x + f },
      { x: C - c / 2, y: x + f },
    ],
    T = [
      { x: C + u - c / 2, y: x + f },
      { x: C + u + c / 2, y: x + f },
      { x: C + u + c / 2, y: x + f - h },
    ];
  t.look !== 'handDrawn' && ((k.roughness = 0), (k.fillStyle = 'solid'));
  const L = J(S),
    A = b.path(L, k),
    _ = J(T),
    M = b.path(_, { ...k, fillStyle: 'solid' }),
    E = l.insert(() => M, ':first-child');
  return (
    E.insert(() => A, ':first-child'),
    E.attr('class', 'basic label-container outer-path'),
    y && t.look !== 'handDrawn' && E.selectAll('path').attr('style', y),
    e && t.look !== 'handDrawn' && E.selectAll('path').attr('style', e),
    Y(t, E),
    (t.intersect = function (O) {
      return q.polygon(t, S, O);
    }),
    l
  );
}
d(Tn, 'taggedRect');
async function Sn(r, t) {
  const { labelStyles: i, nodeStyles: e } = H(t);
  t.labelStyle = i;
  const { shapeSvg: o, bbox: a, label: s } = await V(r, t, U(t)),
    l = Math.max(a.width + (t.padding ?? 0) * 2, t?.width ?? 0),
    n = Math.max(a.height + (t.padding ?? 0) * 2, t?.height ?? 0),
    g = n / 8,
    c = 0.2 * l,
    h = 0.2 * n,
    p = n + g,
    { cssStyles: u } = t,
    f = z.svg(o),
    C = N(t, {});
  t.look !== 'handDrawn' && ((C.roughness = 0), (C.fillStyle = 'solid'));
  const x = [
      { x: -l / 2 - (l / 2) * 0.1, y: p / 2 },
      ...Zt(-l / 2 - (l / 2) * 0.1, p / 2, l / 2 + (l / 2) * 0.1, p / 2, g, 0.8),
      { x: l / 2 + (l / 2) * 0.1, y: -p / 2 },
      { x: -l / 2 - (l / 2) * 0.1, y: -p / 2 },
    ],
    y = -l / 2 + (l / 2) * 0.1,
    b = -p / 2 - h * 0.4,
    k = [
      { x: y + l - c, y: (b + n) * 1.3 },
      { x: y + l, y: b + n - h },
      { x: y + l, y: (b + n) * 0.9 },
      ...Zt(y + l, (b + n) * 1.25, y + l - c, (b + n) * 1.3, -n * 0.02, 0.5),
    ],
    S = J(x),
    T = f.path(S, C),
    L = J(k),
    A = f.path(L, { ...C, fillStyle: 'solid' }),
    _ = o.insert(() => A, ':first-child');
  return (
    _.insert(() => T, ':first-child'),
    _.attr('class', 'basic label-container outer-path'),
    u && t.look !== 'handDrawn' && _.selectAll('path').attr('style', u),
    e && t.look !== 'handDrawn' && _.selectAll('path').attr('style', e),
    _.attr('transform', `translate(0,${-g / 2})`),
    s.attr(
      'transform',
      `translate(${-l / 2 + (t.padding ?? 0) - (a.x - (a.left ?? 0))},${-n / 2 + (t.padding ?? 0) - g / 2 - (a.y - (a.top ?? 0))})`,
    ),
    Y(t, _),
    (t.intersect = function (M) {
      return q.polygon(t, x, M);
    }),
    o
  );
}
d(Sn, 'taggedWaveEdgedRectangle');
async function wn(r, t) {
  const { labelStyles: i, nodeStyles: e } = H(t);
  t.labelStyle = i;
  const { shapeSvg: o, bbox: a } = await V(r, t, U(t)),
    s = Math.max(a.width + (t.padding ?? 0), t?.width || 0),
    l = Math.max(a.height + (t.padding ?? 0), t?.height || 0),
    n = -s / 2,
    g = -l / 2,
    c = o.insert('rect', ':first-child');
  return (
    c
      .attr('class', 'text')
      .attr('style', e)
      .attr('rx', 0)
      .attr('ry', 0)
      .attr('x', n)
      .attr('y', g)
      .attr('width', s)
      .attr('height', l),
    Y(t, c),
    (t.intersect = function (h) {
      return q.rect(t, h);
    }),
    o
  );
}
d(wn, 'text');
var Xu = d(
    (r, t, i, e, o, a) => `M${r},${t}
    a${o},${a} 0,0,1 0,${-e}
    l${i},0
    a${o},${a} 0,0,1 0,${e}
    M${i},${-e}
    a${o},${a} 0,0,0 0,${e}
    l${-i},0`,
    'createCylinderPathD',
  ),
  Uu = d(
    (r, t, i, e, o, a) =>
      [
        `M${r},${t}`,
        `M${r + i},${t}`,
        `a${o},${a} 0,0,0 0,${-e}`,
        `l${-i},0`,
        `a${o},${a} 0,0,0 0,${e}`,
        `l${i},0`,
      ].join(' '),
    'createOuterCylinderPathD',
  ),
  Vu = d(
    (r, t, i, e, o, a) => [`M${r + i / 2},${-e / 2}`, `a${o},${a} 0,0,0 0,${e}`].join(' '),
    'createInnerCylinderPathD',
  ),
  xo = 5,
  bo = 10;
async function vn(r, t) {
  const { labelStyles: i, nodeStyles: e } = H(t);
  t.labelStyle = i;
  const o = t.padding ?? 0,
    a = t.look === 'neo' ? 12 : o / 2;
  if (t.width || t.height) {
    const C = t.height ?? 0;
    ((t.height = (t.height ?? 0) - a), t.height < xo && (t.height = xo));
    const y = C / 2 / (2.5 + C / 50);
    ((t.width = (t.width ?? 0) - a - y * 3), t.width < bo && (t.width = bo));
  }
  const { shapeSvg: s, bbox: l, label: n } = await V(r, t, U(t)),
    g = (t.height ? t.height : l.height) + a,
    c = g / 2,
    h = c / (2.5 + g / 50),
    p = (t.width ? t.width : l.width) + h + a,
    { cssStyles: u } = t;
  let f;
  if (t.look === 'handDrawn') {
    const C = z.svg(s),
      x = Uu(0, 0, p, g, h, c),
      y = Vu(0, 0, p, g, h, c),
      b = C.path(x, N(t, {})),
      k = C.path(y, N(t, { fill: 'none' }));
    ((f = s.insert(() => k, ':first-child')),
      (f = s.insert(() => b, ':first-child')),
      f.attr('class', 'basic label-container'),
      u && f.attr('style', u));
  } else {
    const C = Xu(0, 0, p, g, h, c);
    ((f = s
      .insert('path', ':first-child')
      .attr('d', C)
      .attr('class', 'basic label-container')
      .attr('style', dt(u))
      .attr('style', e)),
      f.attr('class', 'basic label-container outer-path'),
      u && f.selectAll('path').attr('style', u),
      e && f.selectAll('path').attr('style', e));
  }
  return (
    f.attr('label-offset-x', h),
    f.attr('transform', `translate(${-p / 2}, ${g / 2} )`),
    n.attr(
      'transform',
      `translate(${-(l.width / 2) - h - (l.x - (l.left ?? 0))}, ${-(l.height / 2) - (l.y - (l.top ?? 0))})`,
    ),
    Y(t, f),
    (t.intersect = function (C) {
      const x = q.rect(t, C),
        y = x.y - (t.y ?? 0);
      if (
        c != 0 &&
        (Math.abs(y) < (t.height ?? 0) / 2 ||
          (Math.abs(y) == (t.height ?? 0) / 2 &&
            Math.abs(x.x - (t.x ?? 0)) > (t.width ?? 0) / 2 - h))
      ) {
        let b = h * h * (1 - (y * y) / (c * c));
        (b != 0 && (b = Math.sqrt(Math.abs(b))),
          (b = h - b),
          C.x - (t.x ?? 0) > 0 && (b = -b),
          (x.x += b));
      }
      return x;
    }),
    s
  );
}
d(vn, 'tiltedCylinder');
async function Ln(r, t) {
  const { labelStyles: i, nodeStyles: e } = H(t);
  t.labelStyle = i;
  const o = t.padding ?? 0,
    a = (t.look === 'neo', o),
    s = t.look === 'neo' ? o * 2 : o,
    { shapeSvg: l, bbox: n } = await V(r, t, U(t)),
    g = (t?.height ?? n.height) + a,
    c = (t?.width ?? n.width) + s,
    h = [
      { x: (-3 * g) / 6, y: 0 },
      { x: c + (3 * g) / 6, y: 0 },
      { x: c, y: -g },
      { x: 0, y: -g },
    ];
  let p;
  const { cssStyles: u } = t;
  if (t.look === 'handDrawn') {
    const f = z.svg(l),
      C = N(t, {}),
      x = J(h),
      y = f.path(x, C);
    ((p = l.insert(() => y, ':first-child').attr('transform', `translate(${-c / 2}, ${g / 2})`)),
      u && p.attr('style', u));
  } else p = Ut(l, c, g, h);
  return (
    e && p.attr('style', e),
    (t.width = c),
    (t.height = g),
    Y(t, p),
    (t.intersect = function (f) {
      return q.polygon(t, h, f);
    }),
    l
  );
}
d(Ln, 'trapezoid');
async function Fn(r, t) {
  const { labelStyles: i, nodeStyles: e } = H(t);
  t.labelStyle = i;
  const o = t.padding ?? 0,
    a = t.look === 'neo' ? 16 : o,
    s = t.look === 'neo' ? 12 : o,
    l = 15,
    n = 5;
  (t.width || t.height) &&
    ((t.height = (t.height ?? 0) - s * 2),
    t.height < n && (t.height = n),
    (t.width = (t.width ?? 0) - a * 2),
    t.width < l && (t.width = l));
  const { shapeSvg: g, bbox: c } = await V(r, t, U(t)),
    h = (t?.width ? t?.width : c.width) + a * 2,
    p = (t?.height ? t?.height : c.height) + s * 2,
    { cssStyles: u } = t,
    f = z.svg(g),
    C = N(t, {});
  t.look !== 'handDrawn' && ((C.roughness = 0), (C.fillStyle = 'solid'));
  const x = [
      { x: (-h / 2) * 0.8, y: -p / 2 },
      { x: (h / 2) * 0.8, y: -p / 2 },
      { x: h / 2, y: (-p / 2) * 0.6 },
      { x: h / 2, y: p / 2 },
      { x: -h / 2, y: p / 2 },
      { x: -h / 2, y: (-p / 2) * 0.6 },
    ],
    y = J(x),
    b = f.path(y, C),
    k = g.insert(() => b, ':first-child');
  return (
    k.attr('class', 'basic label-container outer-path'),
    u && t.look !== 'handDrawn' && k.selectChildren('path').attr('style', u),
    e && t.look !== 'handDrawn' && k.selectChildren('path').attr('style', e),
    Y(t, k),
    (t.intersect = function (S) {
      return q.polygon(t, x, S);
    }),
    g
  );
}
d(Fn, 'trapezoidalPentagon');
var ko = 10,
  Bo = 10;
async function _n(r, t) {
  const { labelStyles: i, nodeStyles: e } = H(t);
  t.labelStyle = i;
  const o = t.padding ?? 0,
    a = t.look === 'neo' ? o * 2 : o;
  (t.width || t.height) &&
    ((t.width = ((t?.width ?? 0) - a) / 2),
    t.width < Bo && (t.width = Bo),
    (t.height = t?.height ?? 0),
    t.height < ko && (t.height = ko));
  const { shapeSvg: s, bbox: l, label: n } = await V(r, t, U(t)),
    g = jt(it().flowchart?.htmlLabels),
    c = (t?.width ? t?.width : l.width) + a,
    h = t?.height ? t?.height : c + l.height,
    p = h,
    u = [
      { x: 0, y: 0 },
      { x: p, y: 0 },
      { x: p / 2, y: -h },
    ],
    { cssStyles: f } = t,
    C = z.svg(s),
    x = N(t, {});
  t.look !== 'handDrawn' && ((x.roughness = 0), (x.fillStyle = 'solid'));
  const y = J(u),
    b = C.path(y, x),
    k = s
      .insert(() => b, ':first-child')
      .attr('transform', `translate(${-h / 2}, ${h / 2})`)
      .attr('class', 'outer-path');
  return (
    f && t.look !== 'handDrawn' && k.selectChildren('path').attr('style', f),
    e && t.look !== 'handDrawn' && k.selectChildren('path').attr('style', e),
    (t.width = c),
    (t.height = h),
    Y(t, k),
    n.attr(
      'transform',
      `translate(${-l.width / 2 - (l.x - (l.left ?? 0))}, ${h / 2 - (l.height + (t.padding ?? 0) / (g ? 2 : 1) - (l.y - (l.top ?? 0)))})`,
    ),
    (t.intersect = function (S) {
      return (F.info('Triangle intersect', t, u, S), q.polygon(t, u, S));
    }),
    s
  );
}
d(_n, 'triangle');
async function An(r, t) {
  const { labelStyles: i, nodeStyles: e } = H(t);
  t.labelStyle = i;
  const o = t.padding ?? 0,
    a = t.look === 'neo' ? 16 : o,
    s = t.look === 'neo' ? 12 : o;
  let l = !0;
  (t.width || t.height) &&
    ((l = !1),
    (t.width = (t?.width ?? 0) - a * 2),
    t.width < 10 && (t.width = 10),
    (t.height = (t?.height ?? 0) - s * 2),
    t.height < 10 && (t.height = 10));
  const { shapeSvg: n, bbox: g, label: c } = await V(r, t, U(t)),
    h = (t?.width ? t?.width : g.width) + (a ?? 0) * 2,
    p = (t?.height ? t?.height : g.height) + (s ?? 0) * 2,
    u = t.look === 'neo' ? p / 4 : p / 8,
    f = p + (l ? u : -u),
    { cssStyles: C } = t,
    y = 14 - h,
    b = y > 0 ? y / 2 : 0,
    k = z.svg(n),
    S = N(t, {});
  t.look !== 'handDrawn' && ((S.roughness = 0), (S.fillStyle = 'solid'));
  const T = [
      { x: -h / 2 - b, y: f / 2 },
      ...Zt(-h / 2 - b, f / 2, h / 2 + b, f / 2, u, 0.8),
      { x: h / 2 + b, y: -f / 2 },
      { x: -h / 2 - b, y: -f / 2 },
    ],
    L = J(T),
    A = k.path(L, S),
    _ = n.insert(() => A, ':first-child');
  return (
    _.attr('class', 'basic label-container outer-path'),
    C && t.look !== 'handDrawn' && _.selectAll('path').attr('style', C),
    e && t.look !== 'handDrawn' && _.selectAll('path').attr('style', e),
    _.attr('transform', `translate(0,${-u / 2})`),
    c.attr(
      'transform',
      `translate(${-h / 2 + (t.padding ?? 0) - (g.x - (g.left ?? 0))},${-p / 2 + (t.padding ?? 0) - u - (g.y - (g.top ?? 0))})`,
    ),
    Y(t, _),
    (t.intersect = function (M) {
      return q.polygon(t, T, M);
    }),
    n
  );
}
d(An, 'waveEdgedRectangle');
async function En(r, t) {
  const { labelStyles: i, nodeStyles: e } = H(t);
  t.labelStyle = i;
  const o = t.padding ?? 0,
    a = t.look === 'neo' ? 16 : o,
    s = t.look === 'neo' ? 20 : o;
  if (t.width || t.height) {
    ((t.width = t?.width ?? 0),
      t.width < 20 && (t.width = 20),
      (t.height = t?.height ?? 0),
      t.height < 10 && (t.height = 10));
    const S = Math.min(t.height * 0.2, t.height / 4);
    ((t.height = Math.ceil(t.height - s - S * (20 / 9))), (t.width = t.width - a * 2));
  }
  const { shapeSvg: l, bbox: n } = await V(r, t, U(t)),
    g = (t?.width ? t?.width : n.width) + a * 2,
    c = (t?.height ? t?.height : n.height) + s,
    h = c / 8,
    p = c + h * 2,
    { cssStyles: u } = t,
    f = z.svg(l),
    C = N(t, {});
  t.look !== 'handDrawn' && ((C.roughness = 0), (C.fillStyle = 'solid'));
  const x = [
      { x: -g / 2, y: p / 2 },
      ...Zt(-g / 2, p / 2, g / 2, p / 2, h, 1),
      { x: g / 2, y: -p / 2 },
      ...Zt(g / 2, -p / 2, -g / 2, -p / 2, h, -1),
    ],
    y = J(x),
    b = f.path(y, C),
    k = l.insert(() => b, ':first-child');
  return (
    k.attr('class', 'basic label-container'),
    u && t.look !== 'handDrawn' && k.selectAll('path').attr('style', u),
    e && t.look !== 'handDrawn' && k.selectAll('path').attr('style', e),
    Y(t, k),
    (t.intersect = function (S) {
      return q.polygon(t, x, S);
    }),
    l
  );
}
d(En, 'waveRectangle');
var st = 10;
async function Mn(r, t) {
  const { labelStyles: i, nodeStyles: e } = H(t);
  t.labelStyle = i;
  const o = t.look === 'neo' ? 16 : (t.padding ?? 0),
    a = t.look === 'neo' ? 12 : (t.padding ?? 0);
  (t.width || t.height) &&
    ((t.width = Math.max((t?.width ?? 0) - o * 2 - st, 10)),
    (t.height = Math.max((t?.height ?? 0) - a * 2 - st, 10)));
  const { shapeSvg: s, bbox: l, label: n } = await V(r, t, U(t)),
    g = (t?.width ? t?.width : l.width) + o * 2 + st,
    c = (t?.height ? t?.height : l.height) + a * 2 + st,
    h = g - st,
    p = c - st,
    u = -h / 2,
    f = -p / 2,
    { cssStyles: C } = t,
    x = z.svg(s),
    y = N(t, {}),
    b = [
      { x: u - st, y: f - st },
      { x: u - st, y: f + p },
      { x: u + h, y: f + p },
      { x: u + h, y: f - st },
    ],
    k = `M${u - st},${f - st} L${u + h},${f - st} L${u + h},${f + p} L${u - st},${f + p} L${u - st},${f - st}
                M${u - st},${f} L${u + h},${f}
                M${u},${f - st} L${u},${f + p}`;
  t.look !== 'handDrawn' && ((y.roughness = 0), (y.fillStyle = 'solid'));
  const S = x.path(k, y),
    T = s.insert(() => S, ':first-child');
  return (
    T.attr('transform', `translate(${st / 2}, ${st / 2})`),
    T.attr('class', 'basic label-container outer-path'),
    C && t.look !== 'handDrawn' && T.selectAll('path').attr('style', C),
    e && t.look !== 'handDrawn' && T.selectAll('path').attr('style', e),
    n.attr(
      'transform',
      `translate(${-(l.width / 2) + st / 2 - (l.x - (l.left ?? 0))}, ${-(l.height / 2) + st / 2 - (l.y - (l.top ?? 0))})`,
    ),
    Y(t, T),
    (t.intersect = function (L) {
      return q.polygon(t, b, L);
    }),
    s
  );
}
d(Mn, 'windowPane');
var To = new Set(['redux-color', 'redux-dark-color']),
  Gu = new Set(['redux', 'redux-dark', 'redux-color', 'redux-dark-color']);
async function Ue(r, t) {
  const i = t;
  i.alias && (t.label = i.alias);
  const { theme: e, themeVariables: o } = at(),
    { rowEven: a, rowOdd: s, nodeBorder: l, borderColorArray: n } = o;
  if (t.look === 'handDrawn') {
    const { themeVariables: Z } = at(),
      { background: et } = Z,
      nt = {
        ...t,
        id: t.id + '-background',
        domId: (t.domId || t.id) + '-background',
        look: 'default',
        cssStyles: ['stroke: none', `fill: ${et}`],
      };
    await Ue(r, nt);
  }
  const g = at();
  t.useHtmlLabels = g.htmlLabels;
  let c = g.er?.diagramPadding ?? 10,
    h = g.er?.entityPadding ?? 6;
  const { cssStyles: p } = t,
    { labelStyles: u, nodeStyles: f } = H(t);
  if (i.attributes.length === 0 && t.label) {
    const Z = { rx: 0, ry: 0, labelPaddingX: c, labelPaddingY: c * 1.5 };
    Ht(t.label, g) + Z.labelPaddingX * 2 < g.er.minEntityWidth && (t.width = g.er.minEntityWidth);
    const et = await qr(r, t, Z);
    if (e != null && To.has(e)) {
      const nt = i.colorIndex ?? 0;
      et.attr('data-color-id', `color-${nt % n.length}`);
    }
    if (!jt(g.htmlLabels)) {
      const nt = et.select('text'),
        wt = nt.node()?.getBBox();
      nt.attr('transform', `translate(${-wt.width / 2}, 0)`);
    }
    return et;
  }
  g.htmlLabels || ((c *= 1.25), (h *= 1.25));
  let C = U(t);
  C || (C = 'node default');
  const x = r
      .insert('g')
      .attr('class', C)
      .attr('id', t.domId || t.id),
    y = await pr(x, t.label ?? '', g, 0, 0, ['name'], u);
  y.height += h;
  let b = 0;
  const k = [],
    S = [];
  let T = 0,
    L = 0,
    A = 0,
    _ = 0,
    M = !0,
    E = !0;
  for (const Z of i.attributes) {
    const et = await pr(x, Z.type, g, 0, b, ['attribute-type'], u);
    T = Math.max(T, et.width + c);
    const nt = await pr(x, Z.name, g, 0, b, ['attribute-name'], u);
    L = Math.max(L, nt.width + c);
    const wt = await pr(x, Z.keys.join(), g, 0, b, ['attribute-keys'], u);
    A = Math.max(A, wt.width + c);
    const tr = await pr(x, Z.comment, g, 0, b, ['attribute-comment'], u);
    _ = Math.max(_, tr.width + c);
    const Vt = Math.max(et.height, nt.height, wt.height, tr.height) + h;
    (S.push({ yOffset: b, rowHeight: Vt }), (b += Vt));
  }
  let O = 4;
  (A <= c && ((M = !1), (A = 0), O--), _ <= c && ((E = !1), (_ = 0), O--));
  const $ = x.node().getBBox();
  if (y.width + c * 2 - (T + L + A + _) > 0) {
    const Z = y.width + c * 2 - (T + L + A + _);
    ((T += Z / O), (L += Z / O), A > 0 && (A += Z / O), _ > 0 && (_ += Z / O));
  }
  const D = T + L + A + _,
    W = z.svg(x),
    R = N(t, {});
  t.look !== 'handDrawn' && ((R.roughness = 0), (R.fillStyle = 'solid'));
  let P = 0;
  S.length > 0 && (P = S.reduce((Z, et) => Z + (et?.rowHeight ?? 0), 0));
  const I = Math.max($.width + c * 2, t?.width || 0, D),
    j = Math.max((P ?? 0) + y.height, t?.height || 0),
    Q = -I / 2,
    rt = -j / 2;
  if (
    (x.selectAll('g:not(:first-child)').each((Z, et, nt) => {
      const wt = K(nt[et]),
        tr = wt.attr('transform');
      let Vt = 0,
        Ke = 0;
      if (tr) {
        const Ii = RegExp(/translate\(([^,]+),([^)]+)\)/).exec(tr);
        Ii &&
          ((Vt = parseFloat(Ii[1])),
          (Ke = parseFloat(Ii[2])),
          wt.attr('class').includes('attribute-name')
            ? (Vt += T)
            : wt.attr('class').includes('attribute-keys')
              ? (Vt += T + L)
              : wt.attr('class').includes('attribute-comment') && (Vt += T + L + A));
      }
      wt.attr('transform', `translate(${Q + c / 2 + Vt}, ${Ke + rt + y.height + h / 2})`);
    }),
    x.select('.name').attr('transform', 'translate(' + -y.width / 2 + ', ' + (rt + h / 2) + ')'),
    e != null && To.has(e))
  ) {
    const Z = i.colorIndex ?? 0;
    x.attr('data-color-id', `color-${Z % n.length}`);
  }
  const Mt = W.rectangle(Q, rt, I, j, R),
    Ot = x
      .insert(() => Mt, ':first-child')
      .attr('class', 'outer-path')
      .attr('style', p.join(''));
  k.push(0);
  for (const [Z, et] of S.entries()) {
    const wt = (Z + 1) % 2 === 0 && et.yOffset !== 0,
      tr = W.rectangle(Q, y.height + rt + et?.yOffset, I, et?.rowHeight, {
        ...R,
        fill: wt ? a : s,
        stroke: l,
      });
    x.insert(() => tr, 'g.label')
      .attr('style', p.join(''))
      .attr('class', `row-rect-${wt ? 'even' : 'odd'}`);
  }
  const Bt = 1e-4;
  let pt = fr(Q, y.height + rt, I + Q, y.height + rt, Bt),
    yt = W.polygon(
      pt.map((Z) => [Z.x, Z.y]),
      R,
    );
  if (
    (x.insert(() => yt).attr('class', 'divider'),
    (pt = fr(T + Q, y.height + rt, T + Q, j + rt, Bt)),
    (yt = W.polygon(
      pt.map((Z) => [Z.x, Z.y]),
      R,
    )),
    x.insert(() => yt).attr('class', 'divider'),
    M)
  ) {
    const Z = T + L + Q;
    ((pt = fr(Z, y.height + rt, Z, j + rt, Bt)),
      (yt = W.polygon(
        pt.map((et) => [et.x, et.y]),
        R,
      )),
      x.insert(() => yt).attr('class', 'divider'));
  }
  if (E) {
    const Z = T + L + A + Q;
    ((pt = fr(Z, y.height + rt, Z, j + rt, Bt)),
      (yt = W.polygon(
        pt.map((et) => [et.x, et.y]),
        R,
      )),
      x.insert(() => yt).attr('class', 'divider'));
  }
  for (const Z of k) {
    const et = y.height + rt + Z;
    ((pt = fr(Q, et, I + Q, et, Bt)),
      (yt = W.polygon(
        pt.map((nt) => [nt.x, nt.y]),
        R,
      )),
      x.insert(() => yt).attr('class', 'divider'));
  }
  if ((Y(t, Ot), f && t.look !== 'handDrawn'))
    if (e != null && Gu.has(e)) x.selectAll('path').attr('style', f);
    else {
      const et = f
        .split(';')
        ?.filter((nt) => nt.includes('stroke'))
        ?.map((nt) => `${nt}`)
        .join('; ');
      (x.selectAll('path').attr('style', et ?? ''),
        x.selectAll('.row-rect-even path').attr('style', f));
    }
  return (
    (t.intersect = function (Z) {
      return q.rect(t, Z);
    }),
    x
  );
}
d(Ue, 'erBox');
async function pr(r, t, i, e = 0, o = 0, a = [], s = '') {
  const l = r
    .insert('g')
    .attr('class', `label ${a.join(' ')}`)
    .attr('transform', `translate(${e}, ${o})`)
    .attr('style', s);
  t !== to(t) && ((t = to(t)), (t = t.replaceAll('<', '&lt;').replaceAll('>', '&gt;')));
  const n = l
    .node()
    .appendChild(
      await Xt(l, t, { width: Ht(t, i) + 100, style: s, useHtmlLabels: i.htmlLabels }, i),
    );
  if (t.includes('&lt;') || t.includes('&gt;')) {
    let c = n.children[0];
    for (
      c.textContent = c.textContent.replaceAll('&lt;', '<').replaceAll('&gt;', '>');
      c.childNodes[0];
    )
      ((c = c.childNodes[0]),
        (c.textContent = c.textContent.replaceAll('&lt;', '<').replaceAll('&gt;', '>')));
  }
  let g = n.getBBox();
  if (jt(i.htmlLabels)) {
    const c = n.children[0];
    c.style.textAlign = 'start';
    const h = K(n);
    ((g = c.getBoundingClientRect()), h.attr('width', g.width), h.attr('height', g.height));
  }
  return g;
}
d(pr, 'addText');
function fr(r, t, i, e, o) {
  return r === i
    ? [
        { x: r - o / 2, y: t },
        { x: r + o / 2, y: t },
        { x: i + o / 2, y: e },
        { x: i - o / 2, y: e },
      ]
    : [
        { x: r, y: t - o / 2 },
        { x: r, y: t + o / 2 },
        { x: i, y: e + o / 2 },
        { x: i, y: e - o / 2 },
      ];
}
d(fr, 'lineToPolygon');
async function On(r, t, i, e, o = i.class.padding ?? 12) {
  const a = e ? 0 : 3,
    s = r
      .insert('g')
      .attr('class', U(t))
      .attr('id', t.domId || t.id);
  let l = null,
    n = null,
    g = null,
    c = null,
    h = 0,
    p = 0,
    u = 0;
  if (((l = s.insert('g').attr('class', 'annotation-group text')), t.annotations.length > 0)) {
    const b = t.annotations[0];
    (await Nr(l, { text: `«${b}»` }, 0), (h = l.node().getBBox().height));
  }
  ((n = s.insert('g').attr('class', 'label-group text')),
    await Nr(n, t, 0, ['font-weight: bolder']));
  const f = n.node().getBBox();
  ((p = f.height), (g = s.insert('g').attr('class', 'members-group text')));
  let C = 0;
  for (const b of t.members) {
    const k = await Nr(g, b, C, [b.parseClassifier()]);
    C += k + a;
  }
  ((u = g.node().getBBox().height),
    u <= 0 && (u = o / 2),
    (c = s.insert('g').attr('class', 'methods-group text')));
  let x = 0;
  for (const b of t.methods) {
    const k = await Nr(c, b, x, [b.parseClassifier()]);
    x += k + a;
  }
  let y = s.node().getBBox();
  if (l !== null) {
    const b = l.node().getBBox();
    l.attr('transform', `translate(${-b.width / 2})`);
  }
  return (
    n.attr('transform', `translate(${-f.width / 2}, ${h})`),
    (y = s.node().getBBox()),
    g.attr('transform', `translate(0, ${h + p + o * 2})`),
    (y = s.node().getBBox()),
    c.attr('transform', `translate(0, ${h + p + (u ? u + o * 4 : o * 2)})`),
    (y = s.node().getBBox()),
    { shapeSvg: s, bbox: y }
  );
}
d(On, 'textHelper');
async function Nr(r, t, i, e = []) {
  const o = r.insert('g').attr('class', 'label').attr('style', e.join('; ')),
    a = at();
  let s = 'useHtmlLabels' in t ? t.useHtmlLabels : (jt(a.htmlLabels) ?? !0),
    l = '';
  ('text' in t ? (l = t.text) : (l = t.label),
    !s && l.startsWith('\\') && (l = l.substring(1)),
    Xr(l) && (s = !0));
  const n = await Xt(
    o,
    we(cr(l)),
    { width: Ht(l, a) + 50, classes: 'markdown-node-label', useHtmlLabels: s },
    a,
  );
  let g,
    c = 1;
  if (s) {
    const h = n.children[0],
      p = K(n);
    ((c = h.innerHTML.split('<br>').length),
      h.innerHTML.includes('</math>') && (c += h.innerHTML.split('<mrow>').length - 1));
    const u = h.getElementsByTagName('img');
    if (u) {
      const f = l.replace(/<img[^>]*>/g, '').trim() === '';
      await Promise.all(
        [...u].map(
          (C) =>
            new Promise((x) => {
              function y() {
                if (((C.style.display = 'flex'), (C.style.flexDirection = 'column'), f)) {
                  const b =
                      a.fontSize?.toString() ?? window.getComputedStyle(document.body).fontSize,
                    S = parseInt(b, 10) * 5 + 'px';
                  ((C.style.minWidth = S), (C.style.maxWidth = S));
                } else C.style.width = '100%';
                x(C);
              }
              (d(y, 'setupImage'),
                setTimeout(() => {
                  C.complete && y();
                }),
                C.addEventListener('error', y),
                C.addEventListener('load', y));
            }),
        ),
      );
    }
    ((g = h.getBoundingClientRect()), p.attr('width', g.width), p.attr('height', g.height));
  } else {
    (e.includes('font-weight: bolder') && K(n).selectAll('tspan').attr('font-weight', ''),
      (c = n.children.length));
    const h = n.children[0];
    ((n.textContent === '' || n.textContent.includes('&gt')) &&
      ((h.textContent =
        l[0] + l.substring(1).replaceAll('&gt;', '>').replaceAll('&lt;', '<').trim()),
      l[1] === ' ' && (h.textContent = h.textContent[0] + ' ' + h.textContent.substring(1))),
      h.textContent === 'undefined' && (h.textContent = ''),
      (g = n.getBBox()));
  }
  return (o.attr('transform', 'translate(0,' + (-g.height / (2 * c) + i) + ')'), g.height);
}
d(Nr, 'addText');
async function In(r, t) {
  const i = it(),
    { themeVariables: e } = i,
    { useGradient: o } = e,
    a = i.class.padding ?? 12,
    s = a,
    l = t.useHtmlLabels ?? jt(i.htmlLabels) ?? !0,
    n = t;
  ((n.annotations = n.annotations ?? []),
    (n.members = n.members ?? []),
    (n.methods = n.methods ?? []));
  const { shapeSvg: g, bbox: c } = await On(r, t, i, l, s),
    { labelStyles: h, nodeStyles: p } = H(t);
  ((t.labelStyle = h), (t.cssStyles = n.styles || ''));
  const u = n.styles?.join(';') || p || '';
  t.cssStyles || (t.cssStyles = u.replaceAll('!important', '').split(';'));
  const f = n.members.length === 0 && n.methods.length === 0 && !i.class?.hideEmptyMembersBox,
    C = z.svg(g),
    x = N(t, {});
  t.look !== 'handDrawn' && ((x.roughness = 0), (x.fillStyle = 'solid'));
  const y = Math.max(t.width ?? 0, c.width);
  let b = Math.max(t.height ?? 0, c.height);
  const k = (t.height ?? 0) > c.height;
  n.members.length === 0 && n.methods.length === 0
    ? (b += s)
    : n.members.length > 0 && n.methods.length === 0 && (b += s * 2);
  const S = -y / 2,
    T = -b / 2;
  let L = f ? a * 2 : n.members.length === 0 && n.methods.length === 0 ? -a : 0;
  k && (L = a * 2);
  const A = C.rectangle(
      S - a,
      T - a - (f ? a : n.members.length === 0 && n.methods.length === 0 ? -a / 2 : 0),
      y + 2 * a,
      b + 2 * a + L,
      x,
    ),
    _ = g.insert(() => A, ':first-child');
  _.attr('class', 'basic label-container outer-path');
  const M = _.node().getBBox(),
    E = g.select('.annotation-group').node().getBBox().height - (f ? a / 2 : 0) || 0,
    O = g.select('.label-group').node().getBBox().height - (f ? a / 2 : 0) || 0,
    $ = g.select('.members-group').node().getBBox().height - (f ? a / 2 : 0) || 0,
    D =
      (E +
        O +
        T +
        a -
        (T - a - (f ? a : n.members.length === 0 && n.methods.length === 0 ? -a / 2 : 0))) /
      2;
  if (
    (g.selectAll('.text').each((W, R, P) => {
      const I = K(P[R]),
        j = I.attr('transform');
      let Q = 0;
      if (j) {
        const Bt = RegExp(/translate\(([^,]+),([^)]+)\)/).exec(j);
        Bt && (Q = parseFloat(Bt[2]));
      }
      let rt = Q + T + a - (f ? a : n.members.length === 0 && n.methods.length === 0 ? -a / 2 : 0);
      if (I.attr('class').includes('methods-group')) {
        const Ot = Math.max($, s / 2);
        k
          ? (rt = Math.max(D, E + O + Ot + T + s * 2 + a) + s * 2)
          : (rt = E + O + Ot + T + s * 4 + a);
      }
      (n.members.length === 0 &&
        n.methods.length === 0 &&
        i.class?.hideEmptyMembersBox &&
        (n.annotations.length > 0 ? (rt = Q - s) : (rt = Q)),
        l || (rt -= 4));
      let Mt = S;
      ((I.attr('class').includes('label-group') || I.attr('class').includes('annotation-group')) &&
        ((Mt = -I.node()?.getBBox().width / 2 || 0),
        g.selectAll('text').each(function (Ot, Bt, pt) {
          window.getComputedStyle(pt[Bt]).textAnchor === 'middle' && (Mt = 0);
        })),
        I.attr('transform', `translate(${Mt}, ${rt})`));
    }),
    n.members.length > 0 || n.methods.length > 0 || f)
  ) {
    const W = E + O + T + a,
      R = C.line(M.x, W, M.x + M.width, W + 0.001, x);
    g.insert(() => R)
      .attr('class', `divider${t.look === 'neo' && !o ? ' neo-line' : ''}`)
      .attr('style', u);
  }
  if (f || n.members.length > 0 || n.methods.length > 0) {
    const W = E + O + $ + T + s * 2 + a,
      R = C.line(M.x, k ? Math.max(D, W) : W, M.x + M.width, (k ? Math.max(D, W) : W) + 0.001, x);
    g.insert(() => R)
      .attr('class', `divider${t.look === 'neo' && !o ? ' neo-line' : ''}`)
      .attr('style', u);
  }
  if (
    (n.look !== 'handDrawn' && g.selectAll('path').attr('style', u),
    _.select(':nth-child(2)').attr('style', u),
    g.selectAll('.divider').select('path').attr('style', u),
    t.labelStyle
      ? g.selectAll('span').attr('style', t.labelStyle)
      : g.selectAll('span').attr('style', u),
    !l)
  ) {
    const W = RegExp(/color\s*:\s*([^;]*)/),
      R = W.exec(u);
    if (R) {
      const P = R[0].replace('color', 'fill');
      g.selectAll('tspan').attr('style', P);
    } else if (h) {
      const P = W.exec(h);
      if (P) {
        const I = P[0].replace('color', 'fill');
        g.selectAll('tspan').attr('style', I);
      }
    }
  }
  return (
    Y(t, _),
    (t.intersect = function (W) {
      return q.rect(t, W);
    }),
    g
  );
}
d(In, 'classBox');
async function Dn(r, t) {
  const { labelStyles: i, nodeStyles: e } = H(t);
  t.labelStyle = i;
  const o = t,
    a = t,
    s = 20,
    l = 20,
    n = 'verifyMethod' in t,
    g = U(t),
    { themeVariables: c } = it(),
    { borderColorArray: h, requirementEdgeLabelBackground: p } = c,
    u = r
      .insert('g')
      .attr('class', g)
      .attr('id', t.domId ?? t.id);
  let f;
  n
    ? (f = await It(u, `&lt;&lt;${o.type}&gt;&gt;`, 0, t.labelStyle))
    : (f = await It(u, '&lt;&lt;Element&gt;&gt;', 0, t.labelStyle));
  let C = f;
  const x = await It(u, o.name, C, t.labelStyle + '; font-weight: bold;');
  if (((C += x + l), n)) {
    const M = await It(u, `${o.requirementId ? `ID: ${o.requirementId}` : ''}`, C, t.labelStyle);
    C += M;
    const E = await It(u, `${o.text ? `Text: ${o.text}` : ''}`, C, t.labelStyle);
    C += E;
    const O = await It(u, `${o.risk ? `Risk: ${o.risk}` : ''}`, C, t.labelStyle);
    ((C += O),
      await It(u, `${o.verifyMethod ? `Verification: ${o.verifyMethod}` : ''}`, C, t.labelStyle));
  } else {
    const M = await It(u, `${a.type ? `Type: ${a.type}` : ''}`, C, t.labelStyle);
    ((C += M), await It(u, `${a.docRef ? `Doc Ref: ${a.docRef}` : ''}`, C, t.labelStyle));
  }
  const y = (u.node()?.getBBox().width ?? 200) + s,
    b = (u.node()?.getBBox().height ?? 200) + s,
    k = -y / 2,
    S = -b / 2,
    T = z.svg(u),
    L = N(t, {});
  t.look !== 'handDrawn' && ((L.roughness = 0), (L.fillStyle = 'solid'));
  const A = T.rectangle(k, S, y, b, L),
    _ = u.insert(() => A, ':first-child');
  if ((_.attr('class', 'basic label-container outer-path').attr('style', e), h?.length)) {
    const M = t.colorIndex ?? 0;
    u.attr('data-color-id', `color-${M % h.length}`);
  }
  if (
    (u.selectAll('.label').each((M, E, O) => {
      const $ = K(O[E]),
        D = $.attr('transform');
      let W = 0,
        R = 0;
      if (D) {
        const Q = RegExp(/translate\(([^,]+),([^)]+)\)/).exec(D);
        Q && ((W = parseFloat(Q[1])), (R = parseFloat(Q[2])));
      }
      const P = R - b / 2;
      let I = k + s / 2;
      ((E === 0 || E === 1) && (I = W), $.attr('transform', `translate(${I}, ${P + s})`));
    }),
    C > f + x + l)
  ) {
    const M = S + f + x + l;
    let E;
    if (t.look === 'neo') {
      const D = [
        [k, M],
        [k + y, M],
        [k + y, M + 0.001],
        [k, M + 0.001],
      ];
      E = T.polygon(D, L);
    } else E = T.line(k, M, k + y, M, L);
    u.insert(() => E).attr('class', 'divider');
  }
  return (
    Y(t, _),
    (t.intersect = function (M) {
      return q.rect(t, M);
    }),
    e && t.look !== 'handDrawn' && (p || h?.length) && u.selectAll('path').attr('style', e),
    u
  );
}
d(Dn, 'requirementBox');
async function It(r, t, i, e = '') {
  if (t === '') return 0;
  const o = r.insert('g').attr('class', 'label').attr('style', e),
    a = it(),
    s = a.htmlLabels ?? !0,
    l = await Xt(
      o,
      we(cr(t)),
      { width: Ht(t, a) + 50, classes: 'markdown-node-label', useHtmlLabels: s, style: e },
      a,
    );
  let n;
  if (s) {
    const g = l.children[0],
      c = K(l);
    ((n = g.getBoundingClientRect()), c.attr('width', n.width), c.attr('height', n.height));
  } else {
    const g = l.children[0];
    for (const c of g.children) e && c.setAttribute('style', e);
    ((n = l.getBBox()), (n.height += 6));
  }
  return (o.attr('transform', `translate(${-n.width / 2},${-n.height / 2 + i})`), n.height);
}
d(It, 'addText');
var Ku = d((r) => {
  switch (r) {
    case 'Very High':
      return 'red';
    case 'High':
      return 'orange';
    case 'Medium':
      return null;
    case 'Low':
      return 'blue';
    case 'Very Low':
      return 'lightblue';
  }
}, 'colorFromPriority');
async function $n(r, t, { config: i }) {
  const { labelStyles: e, nodeStyles: o } = H(t);
  t.labelStyle = e || '';
  const a = 10,
    s = t.width;
  t.width = (t.width ?? 200) - 10;
  const { shapeSvg: l, bbox: n, label: g } = await V(r, t, U(t)),
    c = t.padding || 10;
  let h = '',
    p;
  'ticket' in t &&
    t.ticket &&
    i?.kanban?.ticketBaseUrl &&
    ((h = i?.kanban?.ticketBaseUrl.replace('#TICKET#', t.ticket)),
    (p = l
      .insert('svg:a', ':first-child')
      .attr('class', 'kanban-ticket-link')
      .attr('xlink:href', h)
      .attr('target', '_blank')));
  const u = {
    useHtmlLabels: t.useHtmlLabels,
    labelStyle: t.labelStyle || '',
    width: t.width,
    img: t.img,
    padding: t.padding || 8,
    centerLabel: !1,
  };
  let f, C;
  p
    ? ({ label: f, bbox: C } = await Pi(p, ('ticket' in t && t.ticket) || '', u))
    : ({ label: f, bbox: C } = await Pi(l, ('ticket' in t && t.ticket) || '', u));
  const { label: x, bbox: y } = await Pi(l, ('assigned' in t && t.assigned) || '', u);
  t.width = s;
  const b = 10,
    k = t?.width || 0,
    S = Math.max(C.height, y.height) / 2,
    T = Math.max(n.height + b * 2, t?.height || 0) + S,
    L = -k / 2,
    A = -T / 2;
  (g.attr('transform', 'translate(' + (c - k / 2) + ', ' + (-S - n.height / 2) + ')'),
    f.attr('transform', 'translate(' + (c - k / 2) + ', ' + (-S + n.height / 2) + ')'),
    x.attr(
      'transform',
      'translate(' + (c + k / 2 - y.width - 2 * a) + ', ' + (-S + n.height / 2) + ')',
    ));
  let _;
  const { rx: M, ry: E } = t,
    { cssStyles: O } = t;
  if (t.look === 'handDrawn') {
    const $ = z.svg(l),
      D = N(t, {}),
      W = M || E ? $.path(Jt(L, A, k, T, M || 0), D) : $.rectangle(L, A, k, T, D);
    ((_ = l.insert(() => W, ':first-child')),
      _.attr('class', 'basic label-container').attr('style', O || null));
  } else {
    ((_ = l.insert('rect', ':first-child')),
      _.attr('class', 'basic label-container __APA__')
        .attr('style', o)
        .attr('rx', M ?? 5)
        .attr('ry', E ?? 5)
        .attr('x', L)
        .attr('y', A)
        .attr('width', k)
        .attr('height', T));
    const $ = 'priority' in t && t.priority;
    if ($) {
      const D = l.append('line'),
        W = L + 2,
        R = A + Math.floor((M ?? 0) / 2),
        P = A + T - Math.floor((M ?? 0) / 2);
      D.attr('x1', W)
        .attr('y1', R)
        .attr('x2', W)
        .attr('y2', P)
        .attr('stroke-width', '4')
        .attr('stroke', Ku($));
    }
  }
  return (
    Y(t, _),
    (t.height = T),
    (t.intersect = function ($) {
      return q.rect(t, $);
    }),
    l
  );
}
d($n, 'kanbanItem');
async function Pn(r, t) {
  const { labelStyles: i, nodeStyles: e } = H(t);
  t.labelStyle = i;
  const { shapeSvg: o, bbox: a, halfPadding: s, label: l } = await V(r, t, U(t)),
    n = a.width + 10 * s,
    g = a.height + 8 * s,
    c = 0.15 * n,
    { cssStyles: h } = t,
    p = a.width + 20,
    u = a.height + 20,
    f = Math.max(n, p),
    C = Math.max(g, u);
  l.attr('transform', `translate(${-a.width / 2}, ${-a.height / 2})`);
  let x;
  const y = `M0 0 
    a${c},${c} 1 0,0 ${f * 0.25},${-1 * C * 0.1}
    a${c},${c} 1 0,0 ${f * 0.25},0
    a${c},${c} 1 0,0 ${f * 0.25},0
    a${c},${c} 1 0,0 ${f * 0.25},${C * 0.1}

    a${c},${c} 1 0,0 ${f * 0.15},${C * 0.33}
    a${c * 0.8},${c * 0.8} 1 0,0 0,${C * 0.34}
    a${c},${c} 1 0,0 ${-1 * f * 0.15},${C * 0.33}

    a${c},${c} 1 0,0 ${-1 * f * 0.25},${C * 0.15}
    a${c},${c} 1 0,0 ${-1 * f * 0.25},0
    a${c},${c} 1 0,0 ${-1 * f * 0.25},0
    a${c},${c} 1 0,0 ${-1 * f * 0.25},${-1 * C * 0.15}

    a${c},${c} 1 0,0 ${-1 * f * 0.1},${-1 * C * 0.33}
    a${c * 0.8},${c * 0.8} 1 0,0 0,${-1 * C * 0.34}
    a${c},${c} 1 0,0 ${f * 0.1},${-1 * C * 0.33}
  H0 V0 Z`;
  if (t.look === 'handDrawn') {
    const b = z.svg(o),
      k = N(t, {}),
      S = b.path(y, k);
    ((x = o.insert(() => S, ':first-child')),
      x.attr('class', 'basic label-container').attr('style', dt(h)));
  } else
    x = o
      .insert('path', ':first-child')
      .attr('class', 'basic label-container')
      .attr('style', e)
      .attr('d', y);
  return (
    x.attr('transform', `translate(${-f / 2}, ${-C / 2})`),
    Y(t, x),
    (t.calcIntersect = function (b, k) {
      return q.rect(b, k);
    }),
    (t.intersect = function (b) {
      return (F.info('Bang intersect', t, b), q.rect(t, b));
    }),
    o
  );
}
d(Pn, 'bang');
async function qn(r, t) {
  const { labelStyles: i, nodeStyles: e } = H(t);
  t.labelStyle = i;
  const { shapeSvg: o, bbox: a, halfPadding: s, label: l } = await V(r, t, U(t)),
    n = a.width + 2 * s,
    g = a.height + 2 * s,
    c = 0.15 * n,
    h = 0.25 * n,
    p = 0.35 * n,
    u = 0.2 * n,
    { cssStyles: f } = t;
  let C;
  const x = `M0 0 
    a${c},${c} 0 0,1 ${n * 0.25},${-1 * n * 0.1}
    a${p},${p} 1 0,1 ${n * 0.4},${-1 * n * 0.1}
    a${h},${h} 1 0,1 ${n * 0.35},${n * 0.2}

    a${c},${c} 1 0,1 ${n * 0.15},${g * 0.35}
    a${u},${u} 1 0,1 ${-1 * n * 0.15},${g * 0.65}

    a${h},${c} 1 0,1 ${-1 * n * 0.25},${n * 0.15}
    a${p},${p} 1 0,1 ${-1 * n * 0.5},0
    a${c},${c} 1 0,1 ${-1 * n * 0.25},${-1 * n * 0.15}

    a${c},${c} 1 0,1 ${-1 * n * 0.1},${-1 * g * 0.35}
    a${u},${u} 1 0,1 ${n * 0.1},${-1 * g * 0.65}
  H0 V0 Z`;
  if (t.look === 'handDrawn') {
    const y = z.svg(o),
      b = N(t, {}),
      k = y.path(x, b);
    ((C = o.insert(() => k, ':first-child')),
      C.attr('class', 'basic label-container').attr('style', dt(f)));
  } else
    C = o
      .insert('path', ':first-child')
      .attr('class', 'basic label-container')
      .attr('style', e)
      .attr('d', x);
  return (
    l.attr('transform', `translate(${-a.width / 2}, ${-a.height / 2})`),
    C.attr('transform', `translate(${-n / 2}, ${-g / 2})`),
    Y(t, C),
    (t.calcIntersect = function (y, b) {
      return q.rect(y, b);
    }),
    (t.intersect = function (y) {
      return (F.info('Cloud intersect', t, y), q.rect(t, y));
    }),
    o
  );
}
d(qn, 'cloud');
async function Rn(r, t) {
  const { labelStyles: i, nodeStyles: e } = H(t);
  t.labelStyle = i;
  const { shapeSvg: o, bbox: a, halfPadding: s, label: l } = await V(r, t, U(t)),
    n = a.width + 8 * s,
    g = a.height + 2 * s,
    c = 5,
    h =
      t.look === 'neo'
        ? `
    M${-n / 2} ${g / 2 - c}
    v${-g + 2 * c}
    q0,-${c} ${c},-${c}
    h${n - 2 * c}
    q${c},0 ${c},${c}
    v${g - c}
    H${-n / 2}
    Z
  `
        : `
    M${-n / 2} ${g / 2 - c}
    v${-g + 2 * c}
    q0,-${c} ${c},-${c}
    h${n - 2 * c}
    q${c},0 ${c},${c}
    v${g - 2 * c}
    q0,${c} ${-c},${c}
    h${-(n - 2 * c)}
    q${-c},0 ${-c},${-c}
    Z
  `;
  if (!t.domId)
    throw new Error(
      `defaultMindmapNode: node "${t.id}" is missing a domId — was render.ts domId prefixing skipped?`,
    );
  const p = o
    .append('path')
    .attr('id', t.domId)
    .attr('class', 'node-bkg node-' + t.type)
    .attr('style', e)
    .attr('d', h);
  return (
    o
      .append('line')
      .attr('class', 'node-line-')
      .attr('x1', -n / 2)
      .attr('y1', g / 2)
      .attr('x2', n / 2)
      .attr('y2', g / 2),
    l.attr('transform', `translate(${-a.width / 2}, ${-a.height / 2})`),
    o.append(() => l.node()),
    Y(t, p),
    (t.calcIntersect = function (u, f) {
      return q.rect(u, f);
    }),
    (t.intersect = function (u) {
      return q.rect(t, u);
    }),
    o
  );
}
d(Rn, 'defaultMindmapNode');
async function Wn(r, t) {
  const i = { padding: t.padding ?? 0 };
  return Xe(r, t, i);
}
d(Wn, 'mindmapCircle');
var Qu = [
    {
      semanticName: 'Process',
      name: 'Rectangle',
      shortName: 'rect',
      description: 'Standard process shape',
      aliases: ['proc', 'process', 'rectangle'],
      internalAliases: ['squareRect'],
      handler: Cn,
    },
    {
      semanticName: 'Event',
      name: 'Rounded Rectangle',
      shortName: 'rounded',
      description: 'Represents an event',
      aliases: ['event'],
      internalAliases: ['roundedRect'],
      handler: pn,
    },
    {
      semanticName: 'Terminal Point',
      name: 'Stadium',
      shortName: 'stadium',
      description: 'Terminal point',
      aliases: ['terminal', 'pill'],
      handler: yn,
    },
    {
      semanticName: 'Subprocess',
      name: 'Framed Rectangle',
      shortName: 'fr-rect',
      description: 'Subprocess',
      aliases: ['subprocess', 'subproc', 'framed-rectangle', 'subroutine'],
      handler: Bn,
    },
    {
      semanticName: 'Database',
      name: 'Cylinder',
      shortName: 'cyl',
      description: 'Database storage',
      aliases: ['db', 'database', 'cylinder'],
      handler: Rl,
    },
    {
      semanticName: 'Data Store',
      name: 'Data Store',
      shortName: 'datastore',
      description: 'Data flow diagram data store',
      aliases: ['data-store'],
      handler: Wl,
    },
    {
      semanticName: 'Start',
      name: 'Circle',
      shortName: 'circle',
      description: 'Starting point',
      aliases: ['circ'],
      handler: Xe,
    },
    {
      semanticName: 'Bang',
      name: 'Bang',
      shortName: 'bang',
      description: 'Bang',
      aliases: ['bang'],
      handler: Pn,
    },
    {
      semanticName: 'Cloud',
      name: 'Cloud',
      shortName: 'cloud',
      description: 'cloud',
      aliases: ['cloud'],
      handler: qn,
    },
    {
      semanticName: 'Decision',
      name: 'Diamond',
      shortName: 'diam',
      description: 'Decision-making step',
      aliases: ['decision', 'diamond', 'question'],
      handler: dn,
    },
    {
      semanticName: 'Prepare Conditional',
      name: 'Hexagon',
      shortName: 'hex',
      description: 'Preparation or condition step',
      aliases: ['hexagon', 'prepare'],
      handler: Ul,
    },
    {
      semanticName: 'Data Input/Output',
      name: 'Lean Right',
      shortName: 'lean-r',
      description: 'Represents input or output',
      aliases: ['lean-right', 'in-out'],
      internalAliases: ['lean_right'],
      handler: on,
    },
    {
      semanticName: 'Data Input/Output',
      name: 'Lean Left',
      shortName: 'lean-l',
      description: 'Represents output or input',
      aliases: ['lean-left', 'out-in'],
      internalAliases: ['lean_left'],
      handler: en,
    },
    {
      semanticName: 'Priority Action',
      name: 'Trapezoid Base Bottom',
      shortName: 'trap-b',
      description: 'Priority action',
      aliases: ['priority', 'trapezoid-bottom', 'trapezoid'],
      handler: Ln,
    },
    {
      semanticName: 'Manual Operation',
      name: 'Trapezoid Base Top',
      shortName: 'trap-t',
      description: 'Represents a manual task',
      aliases: ['manual', 'trapezoid-top', 'inv-trapezoid'],
      internalAliases: ['inv_trapezoid'],
      handler: tn,
    },
    {
      semanticName: 'Stop',
      name: 'Double Circle',
      shortName: 'dbl-circ',
      description: 'Represents a stop point',
      aliases: ['double-circle'],
      internalAliases: ['doublecircle'],
      handler: Nl,
    },
    {
      semanticName: 'Text Block',
      name: 'Text Block',
      shortName: 'text',
      description: 'Text block',
      handler: wn,
    },
    {
      semanticName: 'Card',
      name: 'Notched Rectangle',
      shortName: 'notch-rect',
      description: 'Represents a card',
      aliases: ['card', 'notched-rectangle'],
      handler: El,
    },
    {
      semanticName: 'Lined/Shaded Process',
      name: 'Lined Rectangle',
      shortName: 'lin-rect',
      description: 'Lined process shape',
      aliases: ['lined-rectangle', 'lined-process', 'lin-proc', 'shaded-process'],
      handler: fn,
    },
    {
      semanticName: 'Start',
      name: 'Small Circle',
      shortName: 'sm-circ',
      description: 'Small starting point',
      aliases: ['start', 'small-circle'],
      internalAliases: ['stateStart'],
      handler: kn,
    },
    {
      semanticName: 'Stop',
      name: 'Framed Circle',
      shortName: 'fr-circ',
      description: 'Stop point',
      aliases: ['stop', 'framed-circle'],
      internalAliases: ['stateEnd'],
      handler: bn,
    },
    {
      semanticName: 'Fork/Join',
      name: 'Filled Rectangle',
      shortName: 'fork',
      description: 'Fork or join in process flow',
      aliases: ['join'],
      internalAliases: ['forkJoin'],
      handler: jl,
    },
    {
      semanticName: 'Collate',
      name: 'Hourglass',
      shortName: 'hourglass',
      description: 'Represents a collate operation',
      aliases: ['hourglass', 'collate'],
      handler: Vl,
    },
    {
      semanticName: 'Comment',
      name: 'Curly Brace',
      shortName: 'brace',
      description: 'Adds a comment',
      aliases: ['comment', 'brace-l'],
      handler: Dl,
    },
    {
      semanticName: 'Comment Right',
      name: 'Curly Brace',
      shortName: 'brace-r',
      description: 'Adds a comment',
      handler: $l,
    },
    {
      semanticName: 'Comment with braces on both sides',
      name: 'Curly Braces',
      shortName: 'braces',
      description: 'Adds a comment',
      handler: Pl,
    },
    {
      semanticName: 'Com Link',
      name: 'Lightning Bolt',
      shortName: 'bolt',
      description: 'Communication link',
      aliases: ['com-link', 'lightning-bolt'],
      handler: an,
    },
    {
      semanticName: 'Document',
      name: 'Document',
      shortName: 'doc',
      description: 'Represents a document',
      aliases: ['doc', 'document'],
      handler: An,
    },
    {
      semanticName: 'Delay',
      name: 'Half-Rounded Rectangle',
      shortName: 'delay',
      description: 'Represents a delay',
      aliases: ['half-rounded-rectangle'],
      handler: Xl,
    },
    {
      semanticName: 'Direct Access Storage',
      name: 'Horizontal Cylinder',
      shortName: 'h-cyl',
      description: 'Direct access storage',
      aliases: ['das', 'horizontal-cylinder'],
      handler: vn,
    },
    {
      semanticName: 'Disk Storage',
      name: 'Lined Cylinder',
      shortName: 'lin-cyl',
      description: 'Disk storage',
      aliases: ['disk', 'lined-cylinder'],
      handler: sn,
    },
    {
      semanticName: 'Display',
      name: 'Curved Trapezoid',
      shortName: 'curv-trap',
      description: 'Represents a display',
      aliases: ['curved-trapezoid', 'display'],
      handler: ql,
    },
    {
      semanticName: 'Divided Process',
      name: 'Divided Rectangle',
      shortName: 'div-rect',
      description: 'Divided process shape',
      aliases: ['div-proc', 'divided-rectangle', 'divided-process'],
      handler: zl,
    },
    {
      semanticName: 'Extract',
      name: 'Triangle',
      shortName: 'tri',
      description: 'Extraction process',
      aliases: ['extract', 'triangle'],
      handler: _n,
    },
    {
      semanticName: 'Internal Storage',
      name: 'Window Pane',
      shortName: 'win-pane',
      description: 'Internal storage',
      aliases: ['internal-storage', 'window-pane'],
      handler: Mn,
    },
    {
      semanticName: 'Junction',
      name: 'Filled Circle',
      shortName: 'f-circ',
      description: 'Junction point',
      aliases: ['junction', 'filled-circle'],
      handler: Hl,
    },
    {
      semanticName: 'Loop Limit',
      name: 'Trapezoidal Pentagon',
      shortName: 'notch-pent',
      description: 'Loop limit step',
      aliases: ['loop-limit', 'notched-pentagon'],
      handler: Fn,
    },
    {
      semanticName: 'Manual File',
      name: 'Flipped Triangle',
      shortName: 'flip-tri',
      description: 'Manual file operation',
      aliases: ['manual-file', 'flipped-triangle'],
      handler: Yl,
    },
    {
      semanticName: 'Manual Input',
      name: 'Sloped Rectangle',
      shortName: 'sl-rect',
      description: 'Manual input step',
      aliases: ['manual-input', 'sloped-rectangle'],
      handler: mn,
    },
    {
      semanticName: 'Multi-Document',
      name: 'Stacked Document',
      shortName: 'docs',
      description: 'Multiple documents',
      aliases: ['documents', 'st-doc', 'stacked-document'],
      handler: hn,
    },
    {
      semanticName: 'Multi-Process',
      name: 'Stacked Rectangle',
      shortName: 'st-rect',
      description: 'Multiple processes',
      aliases: ['procs', 'processes', 'stacked-rectangle'],
      handler: nn,
    },
    {
      semanticName: 'Stored Data',
      name: 'Bow Tie Rectangle',
      shortName: 'bow-rect',
      description: 'Stored data',
      aliases: ['stored-data', 'bow-tie-rectangle'],
      handler: Al,
    },
    {
      semanticName: 'Summary',
      name: 'Crossed Circle',
      shortName: 'cross-circ',
      description: 'Summary',
      aliases: ['summary', 'crossed-circle'],
      handler: Il,
    },
    {
      semanticName: 'Tagged Document',
      name: 'Tagged Document',
      shortName: 'tag-doc',
      description: 'Tagged document',
      aliases: ['tag-doc', 'tagged-document'],
      handler: Sn,
    },
    {
      semanticName: 'Tagged Process',
      name: 'Tagged Rectangle',
      shortName: 'tag-rect',
      description: 'Tagged process',
      aliases: ['tagged-rectangle', 'tag-proc', 'tagged-process'],
      handler: Tn,
    },
    {
      semanticName: 'Paper Tape',
      name: 'Flag',
      shortName: 'flag',
      description: 'Paper tape',
      aliases: ['paper-tape'],
      handler: En,
    },
    {
      semanticName: 'Odd',
      name: 'Odd',
      shortName: 'odd',
      description: 'Odd shape',
      internalAliases: ['rect_left_inv_arrow'],
      handler: gn,
    },
    {
      semanticName: 'Lined Document',
      name: 'Lined Document',
      shortName: 'lin-doc',
      description: 'Lined document',
      aliases: ['lined-document'],
      handler: ln,
    },
  ],
  Zu = d(() => {
    const t = [
      ...Object.entries({
        state: xn,
        choice: Ml,
        note: cn,
        rectWithTitle: un,
        labelRect: rn,
        iconSquare: Zl,
        iconCircle: Kl,
        icon: Gl,
        iconRounded: Ql,
        imageSquare: Jl,
        anchor: Fl,
        kanbanItem: $n,
        mindmapCircle: Wn,
        defaultMindmapNode: Rn,
        classBox: In,
        erBox: Ue,
        requirementBox: Dn,
      }),
      ...Qu.flatMap((i) =>
        [
          i.shortName,
          ...('aliases' in i ? i.aliases : []),
          ...('internalAliases' in i ? i.internalAliases : []),
        ].map((o) => [o, i.handler]),
      ),
    ];
    return Object.fromEntries(t);
  }, 'generateShapeMap'),
  zn = Zu();
function Ju(r) {
  return r in zn;
}
d(Ju, 'isValidShape');
var Mi = new Map();
async function Nn(r, t, i) {
  let e, o;
  t.shape === 'rect' && (t.rx && t.ry ? (t.shape = 'roundedRect') : (t.shape = 'squareRect'));
  const a = t.shape ? zn[t.shape] : void 0;
  if (!a) throw new Error(`No such shape: ${t.shape}. Please check your syntax.`);
  if (t.link) {
    let s;
    (i.config.securityLevel === 'sandbox'
      ? (s = '_top')
      : t.linkTarget && (s = t.linkTarget || '_blank'),
      (e = r
        .insert('svg:a')
        .attr('xlink:href', t.link)
        .attr('target', s ?? null)),
      (o = await a(e, t, i)));
  } else ((o = await a(r, t, i)), (e = o));
  return (
    e.attr('data-look', dt(t.look)),
    t.tooltip && o.attr('title', t.tooltip),
    Mi.set(t.id, e),
    t.haveCallback && e.attr('class', e.attr('class') + ' clickable'),
    e
  );
}
d(Nn, 'insertNode');
var KC = d((r, t) => {
    Mi.set(t.id, r);
  }, 'setNodeElem'),
  QC = d(() => {
    Mi.clear();
  }, 'clear'),
  ZC = d((r) => {
    const t = Mi.get(r.id);
    F.trace(
      'Transforming node',
      r.diff,
      r,
      'translate(' + (r.x - r.width / 2 - 5) + ', ' + r.width / 2 + ')',
    );
    const i = 8,
      e = r.diff || 0;
    return (
      r.clusterNode
        ? t.attr(
            'transform',
            'translate(' + (r.x + e - r.width / 2) + ', ' + (r.y - r.height / 2 - i) + ')',
          )
        : t.attr('transform', 'translate(' + r.x + ', ' + r.y + ')'),
      e
    );
  }, 'positionNode'),
  tp = d((r, t, i, e, o, a = !1, s) => {
    (t.arrowTypeStart && So(r, 'start', t.arrowTypeStart, i, e, o, a, s),
      t.arrowTypeEnd && So(r, 'end', t.arrowTypeEnd, i, e, o, a, s));
  }, 'addEdgeMarkers'),
  rp = {
    arrow_cross: { type: 'cross', fill: !1 },
    arrow_point: { type: 'point', fill: !0 },
    arrow_barb: { type: 'barb', fill: !0 },
    arrow_barb_neo: { type: 'barb', fill: !0 },
    arrow_circle: { type: 'circle', fill: !1 },
    aggregation: { type: 'aggregation', fill: !1 },
    extension: { type: 'extension', fill: !1 },
    composition: { type: 'composition', fill: !0 },
    dependency: { type: 'dependency', fill: !0 },
    lollipop: { type: 'lollipop', fill: !1 },
    only_one: { type: 'onlyOne', fill: !1 },
    zero_or_one: { type: 'zeroOrOne', fill: !1 },
    one_or_more: { type: 'oneOrMore', fill: !1 },
    zero_or_more: { type: 'zeroOrMore', fill: !1 },
    requirement_arrow: { type: 'requirement_arrow', fill: !1 },
    requirement_contains: { type: 'requirement_contains', fill: !1 },
  },
  ip = [
    'cross',
    'point',
    'circle',
    'lollipop',
    'aggregation',
    'extension',
    'composition',
    'dependency',
    'barb',
  ],
  So = d((r, t, i, e, o, a, s = !1, l) => {
    const n = rp[i],
      g = n && ip.includes(n.type);
    if (!n) {
      F.warn(`Unknown arrow type: ${i}`);
      return;
    }
    const c = n.type,
      u = `${o}_${a}-${c}${t === 'start' ? 'Start' : 'End'}${s && g ? '-margin' : ''}`;
    if (l && l.trim() !== '') {
      const f = l.replace(/[^\dA-Za-z]/g, '_'),
        C = `${u}_${f}`;
      if (!document.getElementById(C)) {
        const x = document.getElementById(u);
        if (x) {
          const y = x.cloneNode(!0);
          ((y.id = C),
            y.querySelectorAll('path, circle, line').forEach((k) => {
              (k.setAttribute('stroke', l), n.fill && k.setAttribute('fill', l));
            }),
            x.parentNode?.appendChild(y));
        }
      }
      r.attr(`marker-${t}`, `url(${e}#${C})`);
    } else r.attr(`marker-${t}`, `url(${e}#${u})`);
  }, 'addEdgeMarker'),
  ep = d((r) => (typeof r == 'string' ? r : it()?.flowchart?.curve), 'resolveEdgeCurveType'),
  Si = new Map(),
  ut = new Map(),
  JC = d(() => {
    (Si.clear(), ut.clear());
  }, 'clear'),
  Wr = d(
    (r) => (r ? (typeof r == 'string' ? r : r.reduce((t, i) => t + ';' + i, '')) : ''),
    'getLabelStyles',
  ),
  op = d(async (r, t) => {
    const i = it();
    let e = kt(i);
    const { labelStyles: o } = H(t);
    t.labelStyle = o;
    const a = r.insert('g').attr('class', 'edgeLabel'),
      s = a.insert('g').attr('class', 'label').attr('data-id', t.id),
      l = t.labelType === 'markdown',
      g = await Xt(
        r,
        t.label,
        {
          style: Wr(t.labelStyle),
          useHtmlLabels: e,
          addSvgBackground: !0,
          isNode: !1,
          markdown: l,
          width: l ? void 0 : void 0,
        },
        i,
      );
    (s.node().appendChild(g), F.info('abc82', t, t.labelType));
    let c = g.getBBox(),
      h = c;
    if (e) {
      const u = g.children[0],
        f = K(g);
      ((c = u.getBoundingClientRect()),
        (h = c),
        f.attr('width', c.width),
        f.attr('height', c.height));
    } else {
      const u = K(g).select('text').node();
      u && typeof u.getBBox == 'function' && (h = u.getBBox());
    }
    (s.attr('transform', Rr(h, e)), Si.set(t.id, a), (t.width = c.width), (t.height = c.height));
    let p;
    if (t.startLabelLeft) {
      const u = r.insert('g').attr('class', 'edgeTerminals'),
        f = u.insert('g').attr('class', 'inner'),
        C = await Gt(f, t.startLabelLeft, Wr(t.labelStyle) || '', !1, !1);
      p = C;
      let x = C.getBBox();
      if (e) {
        const y = C.children[0],
          b = K(C);
        ((x = y.getBoundingClientRect()), b.attr('width', x.width), b.attr('height', x.height));
      }
      (f.attr('transform', Rr(x, e)),
        ut.get(t.id) || ut.set(t.id, {}),
        (ut.get(t.id).startLeft = u),
        Hr(p, t.startLabelLeft));
    }
    if (t.startLabelRight) {
      const u = r.insert('g').attr('class', 'edgeTerminals'),
        f = u.insert('g').attr('class', 'inner'),
        C = await Gt(f, t.startLabelRight, Wr(t.labelStyle) || '', !1, !1);
      p = C;
      let x = C.getBBox();
      if (e) {
        const y = C.children[0],
          b = K(C);
        ((x = y.getBoundingClientRect()), b.attr('width', x.width), b.attr('height', x.height));
      }
      (f.attr('transform', Rr(x, e)),
        ut.get(t.id) || ut.set(t.id, {}),
        (ut.get(t.id).startRight = u),
        Hr(p, t.startLabelRight));
    }
    if (t.endLabelLeft) {
      const u = r.insert('g').attr('class', 'edgeTerminals'),
        f = u.insert('g').attr('class', 'inner'),
        C = await Gt(u, t.endLabelLeft, Wr(t.labelStyle) || '', !1, !1);
      p = C;
      let x = C.getBBox();
      if (e) {
        const y = C.children[0],
          b = K(C);
        ((x = y.getBoundingClientRect()), b.attr('width', x.width), b.attr('height', x.height));
      }
      (f.attr('transform', Rr(x, e)),
        ut.get(t.id) || ut.set(t.id, {}),
        (ut.get(t.id).endLeft = u),
        Hr(p, t.endLabelLeft));
    }
    if (t.endLabelRight) {
      const u = r.insert('g').attr('class', 'edgeTerminals'),
        f = u.insert('g').attr('class', 'inner'),
        C = await Gt(u, t.endLabelRight, Wr(t.labelStyle) || '', !1, !1);
      p = C;
      let x = C.getBBox();
      if (e) {
        const y = C.children[0],
          b = K(C);
        ((x = y.getBoundingClientRect()), b.attr('width', x.width), b.attr('height', x.height));
      }
      (f.attr('transform', Rr(x, e)),
        ut.get(t.id) || ut.set(t.id, {}),
        (ut.get(t.id).endRight = u),
        Hr(p, t.endLabelRight));
    }
    return g;
  }, 'insertEdgeLabel');
function Hr(r, t) {
  kt(it()) && r && ((r.style.width = t.length * 9 + 'px'), (r.style.height = '12px'));
}
d(Hr, 'setTerminalWidth');
var ap = d((r, t) => {
    F.debug('Moving label abc88 ', r.id, r.label, Si.get(r.id), t);
    let i = t.updatedPath ? t.updatedPath : t.originalPath;
    const e = it(),
      { subGraphTitleTotalMargin: o } = Ye(e);
    if (r.label) {
      const a = Si.get(r.id);
      let s = r.x,
        l = r.y;
      if (i) {
        const n = Ft.calcLabelPosition(i);
        (F.debug(
          'Moving label ' + r.label + ' from (',
          s,
          ',',
          l,
          ') to (',
          n.x,
          ',',
          n.y,
          ') abc88',
        ),
          t.updatedPath && ((s = n.x), (l = n.y)));
      }
      a.attr('transform', `translate(${s}, ${l + o / 2})`);
    }
    if (r.startLabelLeft) {
      const a = ut.get(r.id).startLeft;
      let s = r.x,
        l = r.y;
      if (i) {
        const n = Ft.calcTerminalLabelPosition(r.arrowTypeStart ? 10 : 0, 'start_left', i);
        ((s = n.x), (l = n.y));
      }
      a.attr('transform', `translate(${s}, ${l})`);
    }
    if (r.startLabelRight) {
      const a = ut.get(r.id).startRight;
      let s = r.x,
        l = r.y;
      if (i) {
        const n = Ft.calcTerminalLabelPosition(r.arrowTypeStart ? 10 : 0, 'start_right', i);
        ((s = n.x), (l = n.y));
      }
      a.attr('transform', `translate(${s}, ${l})`);
    }
    if (r.endLabelLeft) {
      const a = ut.get(r.id).endLeft;
      let s = r.x,
        l = r.y;
      if (i) {
        const n = Ft.calcTerminalLabelPosition(r.arrowTypeEnd ? 10 : 0, 'end_left', i);
        ((s = n.x), (l = n.y));
      }
      a.attr('transform', `translate(${s}, ${l})`);
    }
    if (r.endLabelRight) {
      const a = ut.get(r.id).endRight;
      let s = r.x,
        l = r.y;
      if (i) {
        const n = Ft.calcTerminalLabelPosition(r.arrowTypeEnd ? 10 : 0, 'end_right', i);
        ((s = n.x), (l = n.y));
      }
      a.attr('transform', `translate(${s}, ${l})`);
    }
  }, 'positionEdgeLabel'),
  sp = d((r, t) => {
    const i = r.x,
      e = r.y,
      o = Math.abs(t.x - i),
      a = Math.abs(t.y - e),
      s = r.width / 2,
      l = r.height / 2;
    return o >= s || a >= l;
  }, 'outsideNode'),
  lp = d((r, t, i) => {
    F.debug(`intersection calc abc89:
  outsidePoint: ${JSON.stringify(t)}
  insidePoint : ${JSON.stringify(i)}
  node        : x:${r.x} y:${r.y} w:${r.width} h:${r.height}`);
    const e = r.x,
      o = r.y,
      a = Math.abs(e - i.x),
      s = r.width / 2;
    let l = i.x < t.x ? s - a : s + a;
    const n = r.height / 2,
      g = Math.abs(t.y - i.y),
      c = Math.abs(t.x - i.x);
    if (Math.abs(o - t.y) * s > Math.abs(e - t.x) * n) {
      let h = i.y < t.y ? t.y - n - o : o - n - t.y;
      l = (c * h) / g;
      const p = { x: i.x < t.x ? i.x + l : i.x - c + l, y: i.y < t.y ? i.y + g - h : i.y - g + h };
      return (
        l === 0 && ((p.x = t.x), (p.y = t.y)),
        c === 0 && (p.x = t.x),
        g === 0 && (p.y = t.y),
        F.debug(`abc89 top/bottom calc, Q ${g}, q ${h}, R ${c}, r ${l}`, p),
        p
      );
    } else {
      i.x < t.x ? (l = t.x - s - e) : (l = e - s - t.x);
      let h = (g * l) / c,
        p = i.x < t.x ? i.x + c - l : i.x - c + l,
        u = i.y < t.y ? i.y + h : i.y - h;
      return (
        F.debug(`sides calc abc89, Q ${g}, q ${h}, R ${c}, r ${l}`, { _x: p, _y: u }),
        l === 0 && ((p = t.x), (u = t.y)),
        c === 0 && (p = t.x),
        g === 0 && (u = t.y),
        { x: p, y: u }
      );
    }
  }, 'intersection'),
  wo = d((r, t) => {
    F.warn('abc88 cutPathAtIntersect', r, t);
    let i = [],
      e = r[0],
      o = !1;
    return (
      r.forEach((a) => {
        if ((F.info('abc88 checking point', a, t), !sp(t, a) && !o)) {
          const s = lp(t, e, a);
          (F.debug('abc88 inside', a, e, s), F.debug('abc88 intersection', s, t));
          let l = !1;
          (i.forEach((n) => {
            l = l || (n.x === s.x && n.y === s.y);
          }),
            i.some((n) => n.x === s.x && n.y === s.y)
              ? F.warn('abc88 no intersect', s, i)
              : i.push(s),
            (o = !0));
        } else (F.warn('abc88 outside', a, e), (e = a), o || i.push(a));
      }),
      F.debug('returning points', i),
      i
    );
  }, 'cutPathAtIntersect');
function Hn(r) {
  const t = [],
    i = [];
  for (let e = 1; e < r.length - 1; e++) {
    const o = r[e - 1],
      a = r[e],
      s = r[e + 1];
    ((o.x === a.x && a.y === s.y && Math.abs(a.x - s.x) > 5 && Math.abs(a.y - o.y) > 5) ||
      (o.y === a.y && a.x === s.x && Math.abs(a.x - o.x) > 5 && Math.abs(a.y - s.y) > 5)) &&
      (t.push(a), i.push(e));
  }
  return { cornerPoints: t, cornerPointPositions: i };
}
d(Hn, 'extractCornerPoints');
var vo = d(function (r, t, i) {
    const e = t.x - r.x,
      o = t.y - r.y,
      a = Math.sqrt(e * e + o * o),
      s = i / a;
    return { x: t.x - s * e, y: t.y - s * o };
  }, 'findAdjacentPoint'),
  np = d(function (r) {
    const { cornerPointPositions: t } = Hn(r),
      i = [];
    for (let e = 0; e < r.length; e++)
      if (t.includes(e)) {
        const o = r[e - 1],
          a = r[e + 1],
          s = r[e],
          l = vo(o, s, 5),
          n = vo(a, s, 5),
          g = n.x - l.x,
          c = n.y - l.y;
        i.push(l);
        const h = Math.sqrt(2) * 2;
        let p = { x: s.x, y: s.y };
        if (Math.abs(a.x - o.x) > 10 && Math.abs(a.y - o.y) >= 10) {
          F.debug('Corner point fixing', Math.abs(a.x - o.x), Math.abs(a.y - o.y));
          const u = 5;
          s.x === l.x
            ? (p = { x: g < 0 ? l.x - u + h : l.x + u - h, y: c < 0 ? l.y - h : l.y + h })
            : (p = { x: g < 0 ? l.x - h : l.x + h, y: c < 0 ? l.y - u + h : l.y + u - h });
        } else F.debug('Corner point skipping fixing', Math.abs(a.x - o.x), Math.abs(a.y - o.y));
        i.push(p, n);
      } else i.push(r[e]);
    return i;
  }, 'fixCorners'),
  hp = d((r, t, i) => {
    const e = r - t - i,
      o = 2,
      a = 2,
      s = o + a,
      l = Math.floor(e / s),
      n = Array(l).fill(`${o} ${a}`).join(' ');
    return `0 ${t} ${n} ${i}`;
  }, 'generateDashArray'),
  cp = d(function (r, t, i, e, o, a, s, l = !1) {
    if (!s)
      throw new Error(
        `insertEdge: missing diagramId for edge "${t.id}" — edge IDs require a diagram prefix for uniqueness`,
      );
    const { handDrawnSeed: n } = it();
    let g = t.points,
      c = !1;
    const h = o;
    var p = a;
    const u = [];
    for (const I in t.cssCompiledStyles) al(I) || u.push(t.cssCompiledStyles[I]);
    (F.debug('UIO intersect check', t.points, p.x, h.x),
      p.intersect &&
        h.intersect &&
        !l &&
        ((g = g.slice(1, t.points.length - 1)),
        g.unshift(h.intersect(g[0])),
        F.debug(
          'Last point UIO',
          t.start,
          '-->',
          t.end,
          g[g.length - 1],
          p,
          p.intersect(g[g.length - 1]),
        ),
        g.push(p.intersect(g[g.length - 1]))));
    const f = btoa(JSON.stringify(g));
    (t.toCluster &&
      (F.info('to cluster abc88', i.get(t.toCluster)),
      (g = wo(t.points, i.get(t.toCluster).node)),
      (c = !0)),
      t.fromCluster &&
        (F.debug('from cluster abc88', i.get(t.fromCluster), JSON.stringify(g, null, 2)),
        (g = wo(g.reverse(), i.get(t.fromCluster).node).reverse()),
        (c = !0)));
    let C = g.filter((I) => !Number.isNaN(I.y));
    const x = ep(t.curve);
    x !== 'rounded' && (C = np(C));
    let y = si;
    switch (x) {
      case 'linear':
        y = si;
        break;
      case 'basis':
        y = Wi;
        break;
      case 'cardinal':
        y = qo;
        break;
      case 'bumpX':
        y = Wo;
        break;
      case 'bumpY':
        y = Ro;
        break;
      case 'catmullRom':
        y = Po;
        break;
      case 'monotoneX':
        y = $o;
        break;
      case 'monotoneY':
        y = Do;
        break;
      case 'natural':
        y = Io;
        break;
      case 'step':
        y = Oo;
        break;
      case 'stepAfter':
        y = Mo;
        break;
      case 'stepBefore':
        y = Eo;
        break;
      case 'rounded':
        y = si;
        break;
      default:
        y = Wi;
    }
    const { x: b, y: k } = Sg(t),
      S = hc().x(b).y(k).curve(y);
    let T;
    switch (t.thickness) {
      case 'normal':
        T = 'edge-thickness-normal';
        break;
      case 'thick':
        T = 'edge-thickness-thick';
        break;
      case 'invisible':
        T = 'edge-thickness-invisible';
        break;
      default:
        T = 'edge-thickness-normal';
    }
    switch (t.pattern) {
      case 'solid':
        T += ' edge-pattern-solid';
        break;
      case 'dotted':
        T += ' edge-pattern-dotted';
        break;
      case 'dashed':
        T += ' edge-pattern-dashed';
        break;
      default:
        T += ' edge-pattern-solid';
    }
    let L,
      A = x === 'rounded' ? Yn(jn(C, t), 5) : S(C);
    const _ = Array.isArray(t.style) ? t.style : [t.style];
    let M = _.find((I) => I?.startsWith('stroke:')),
      E = '';
    (t.animate && (E = 'edge-animation-fast'),
      t.animation && (E = 'edge-animation-' + t.animation));
    let O = !1;
    if (t.look === 'handDrawn') {
      const I = z.svg(r);
      Object.assign([], C);
      const j = I.path(A, { roughness: 0.3, seed: n });
      ((T += ' transition'),
        (L = K(j)
          .select('path')
          .attr('id', `${s}-${t.id}`)
          .attr('class', ' ' + T + (t.classes ? ' ' + t.classes : '') + (E ? ' ' + E : ''))
          .attr('style', _ ? _.reduce((rt, Mt) => rt + ';' + Mt, '') : '')));
      let Q = L.attr('d');
      (L.attr('d', Q), r.node().appendChild(L.node()));
    } else {
      const I = u.join(';'),
        j = _ ? _.reduce((pt, yt) => pt + yt + ';', '') : '',
        Q = (I ? I + ';' + j + ';' : j) + ';' + (_ ? _.reduce((pt, yt) => pt + ';' + yt, '') : '');
      ((L = r
        .append('path')
        .attr('d', A)
        .attr('id', `${s}-${t.id}`)
        .attr('class', ' ' + T + (t.classes ? ' ' + t.classes : '') + (E ? ' ' + E : ''))
        .attr('style', Q)),
        (M = Q.match(/stroke:([^;]+)/)?.[1]),
        (O = t.animate === !0 || !!t.animation || I.includes('animation')));
      const rt = L.node(),
        Mt = typeof rt.getTotalLength == 'function' ? rt.getTotalLength() : 0,
        Ot = ao[t.arrowTypeStart] || 0,
        Bt = ao[t.arrowTypeEnd] || 0;
      if (t.look === 'neo' && !O) {
        const yt = `stroke-dasharray: ${t.pattern === 'dotted' || t.pattern === 'dashed' ? hp(Mt, Ot, Bt) : `0 ${Ot} ${Mt - Ot - Bt} ${Bt}`}; stroke-dashoffset: 0;`;
        L.attr('style', yt + L.attr('style'));
      }
    }
    (L.attr('data-edge', !0),
      L.attr('data-et', 'edge'),
      L.attr('data-id', t.id),
      L.attr('data-points', f),
      L.attr('data-look', dt(t.look)),
      t.showPoints &&
        C.forEach((I) => {
          r.append('circle')
            .style('stroke', 'red')
            .style('fill', 'red')
            .attr('r', 1)
            .attr('cx', I.x)
            .attr('cy', I.y);
        }));
    let $ = '';
    ((it().flowchart.arrowMarkerAbsolute || it().state.arrowMarkerAbsolute) &&
      (($ =
        window.location.protocol +
        '//' +
        window.location.host +
        window.location.pathname +
        window.location.search),
      ($ = $.replace(/\(/g, '\\(').replace(/\)/g, '\\)'))),
      F.info('arrowTypeStart', t.arrowTypeStart),
      F.info('arrowTypeEnd', t.arrowTypeEnd));
    const D = !O && t?.look === 'neo';
    tp(L, t, $, s, e, D, M);
    const W = Math.floor(g.length / 2),
      R = g[W];
    Ft.isLabelCoordinateInPath(R, L.attr('d')) || (c = !0);
    let P = {};
    return (c && (P.updatedPath = g), (P.originalPath = t.points), P);
  }, 'insertEdge');
function Yn(r, t) {
  if (r.length < 2) return '';
  let i = '';
  const e = r.length,
    o = 1e-5;
  for (let a = 0; a < e; a++) {
    const s = r[a],
      l = r[a - 1],
      n = r[a + 1];
    if (a === 0) i += `M${s.x},${s.y}`;
    else if (a === e - 1) i += `L${s.x},${s.y}`;
    else {
      const g = s.x - l.x,
        c = s.y - l.y,
        h = n.x - s.x,
        p = n.y - s.y,
        u = Math.hypot(g, c),
        f = Math.hypot(h, p);
      if (u < o || f < o) {
        i += `L${s.x},${s.y}`;
        continue;
      }
      const C = g / u,
        x = c / u,
        y = h / f,
        b = p / f,
        k = C * y + x * b,
        S = Math.max(-1, Math.min(1, k)),
        T = Math.acos(S);
      if (T < o || Math.abs(Math.PI - T) < o) {
        i += `L${s.x},${s.y}`;
        continue;
      }
      const L = Math.min(t / Math.sin(T / 2), u / 2, f / 2),
        A = s.x - C * L,
        _ = s.y - x * L,
        M = s.x + y * L,
        E = s.y + b * L;
      ((i += `L${A},${_}`), (i += `Q${s.x},${s.y} ${M},${E}`));
    }
  }
  return i;
}
d(Yn, 'generateRoundedPath');
function me(r, t) {
  if (!r || !t) return { angle: 0, deltaX: 0, deltaY: 0 };
  const i = t.x - r.x,
    e = t.y - r.y;
  return { angle: Math.atan2(e, i), deltaX: i, deltaY: e };
}
d(me, 'calculateDeltaAndAngle');
function jn(r, t) {
  const i = r.map((o) => ({ ...o }));
  if (r.length >= 2 && ft[t.arrowTypeStart]) {
    const o = ft[t.arrowTypeStart],
      a = r[0],
      s = r[1],
      { angle: l } = me(a, s),
      n = o * Math.cos(l),
      g = o * Math.sin(l);
    ((i[0].x = a.x + n), (i[0].y = a.y + g));
  }
  const e = r.length;
  if (e >= 2 && ft[t.arrowTypeEnd]) {
    const o = ft[t.arrowTypeEnd],
      a = r[e - 1],
      s = r[e - 2],
      { angle: l } = me(s, a),
      n = o * Math.cos(l),
      g = o * Math.sin(l);
    ((i[e - 1].x = a.x - n), (i[e - 1].y = a.y - g));
  }
  return i;
}
d(jn, 'applyMarkerOffsetsToPoints');
var dp = d((r, t, i, e) => {
    t.forEach((o) => {
      Ip[o](r, i, e);
    });
  }, 'insertMarkers'),
  gp = d((r, t, i) => {
    (F.trace('Making markers for ', i),
      r
        .append('defs')
        .append('marker')
        .attr('id', i + '_' + t + '-extensionStart')
        .attr('class', 'marker extension ' + t)
        .attr('refX', 18)
        .attr('refY', 7)
        .attr('markerWidth', 20)
        .attr('markerHeight', 28)
        .attr('orient', 'auto')
        .attr('markerUnits', 'userSpaceOnUse')
        .append('path')
        .attr('d', 'M 1,7 L18,13 V 1 Z'),
      r
        .append('defs')
        .append('marker')
        .attr('id', i + '_' + t + '-extensionEnd')
        .attr('class', 'marker extension ' + t)
        .attr('refX', 1)
        .attr('refY', 7)
        .attr('markerWidth', 20)
        .attr('markerHeight', 28)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M 1,1 V 13 L18,7 Z'),
      r
        .append('marker')
        .attr('id', i + '_' + t + '-extensionStart-margin')
        .attr('class', 'marker extension ' + t)
        .attr('refX', 18)
        .attr('refY', 7)
        .attr('markerWidth', 20)
        .attr('markerHeight', 28)
        .attr('orient', 'auto')
        .attr('markerUnits', 'userSpaceOnUse')
        .attr('viewBox', '0 0 20 14')
        .append('polygon')
        .attr('points', '10,7 18,13 18,1')
        .style('stroke-width', 2)
        .style('stroke-dasharray', '0'),
      r
        .append('defs')
        .append('marker')
        .attr('id', i + '_' + t + '-extensionEnd-margin')
        .attr('class', 'marker extension ' + t)
        .attr('refX', 9)
        .attr('refY', 7)
        .attr('markerWidth', 20)
        .attr('markerHeight', 28)
        .attr('orient', 'auto')
        .attr('markerUnits', 'userSpaceOnUse')
        .attr('viewBox', '0 0 20 14')
        .append('polygon')
        .attr('points', '10,1 10,13 18,7')
        .style('stroke-width', 2)
        .style('stroke-dasharray', '0'));
  }, 'extension'),
  up = d((r, t, i) => {
    (r
      .append('defs')
      .append('marker')
      .attr('id', i + '_' + t + '-compositionStart')
      .attr('class', 'marker composition ' + t)
      .attr('refX', 18)
      .attr('refY', 7)
      .attr('markerWidth', 190)
      .attr('markerHeight', 240)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M 18,7 L9,13 L1,7 L9,1 Z'),
      r
        .append('defs')
        .append('marker')
        .attr('id', i + '_' + t + '-compositionEnd')
        .attr('class', 'marker composition ' + t)
        .attr('refX', 1)
        .attr('refY', 7)
        .attr('markerWidth', 20)
        .attr('markerHeight', 28)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M 18,7 L9,13 L1,7 L9,1 Z'),
      r
        .append('defs')
        .append('marker')
        .attr('id', i + '_' + t + '-compositionStart-margin')
        .attr('class', 'marker composition ' + t)
        .attr('refX', 15)
        .attr('refY', 7)
        .attr('markerWidth', 190)
        .attr('markerHeight', 240)
        .attr('orient', 'auto')
        .attr('markerUnits', 'userSpaceOnUse')
        .append('path')
        .style('stroke-width', 0)
        .attr('viewBox', '0 0 15 15')
        .attr('d', 'M 18,7 L9,13 L1,7 L9,1 Z'),
      r
        .append('defs')
        .append('marker')
        .attr('id', i + '_' + t + '-compositionEnd-margin')
        .attr('class', 'marker composition ' + t)
        .attr('refX', 3.5)
        .attr('refY', 7)
        .attr('markerWidth', 20)
        .attr('markerHeight', 28)
        .attr('orient', 'auto')
        .attr('markerUnits', 'userSpaceOnUse')
        .append('path')
        .style('stroke-width', 0)
        .attr('d', 'M 18,7 L9,13 L1,7 L9,1 Z'));
  }, 'composition'),
  pp = d((r, t, i) => {
    (r
      .append('defs')
      .append('marker')
      .attr('id', i + '_' + t + '-aggregationStart')
      .attr('class', 'marker aggregation ' + t)
      .attr('refX', 18)
      .attr('refY', 7)
      .attr('markerWidth', 190)
      .attr('markerHeight', 240)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M 18,7 L9,13 L1,7 L9,1 Z'),
      r
        .append('defs')
        .append('marker')
        .attr('id', i + '_' + t + '-aggregationEnd')
        .attr('class', 'marker aggregation ' + t)
        .attr('refX', 1)
        .attr('refY', 7)
        .attr('markerWidth', 20)
        .attr('markerHeight', 28)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M 18,7 L9,13 L1,7 L9,1 Z'),
      r
        .append('defs')
        .append('marker')
        .attr('id', i + '_' + t + '-aggregationStart-margin')
        .attr('class', 'marker aggregation ' + t)
        .attr('refX', 15)
        .attr('refY', 7)
        .attr('markerWidth', 190)
        .attr('markerHeight', 240)
        .attr('orient', 'auto')
        .attr('markerUnits', 'userSpaceOnUse')
        .append('path')
        .style('stroke-width', 2)
        .attr('d', 'M 18,7 L9,13 L1,7 L9,1 Z'),
      r
        .append('defs')
        .append('marker')
        .attr('id', i + '_' + t + '-aggregationEnd-margin')
        .attr('class', 'marker aggregation ' + t)
        .attr('refX', 1)
        .attr('refY', 7)
        .attr('markerWidth', 20)
        .attr('markerHeight', 28)
        .attr('orient', 'auto')
        .attr('markerUnits', 'userSpaceOnUse')
        .append('path')
        .style('stroke-width', 2)
        .attr('d', 'M 18,7 L9,13 L1,7 L9,1 Z'));
  }, 'aggregation'),
  fp = d((r, t, i) => {
    (r
      .append('defs')
      .append('marker')
      .attr('id', i + '_' + t + '-dependencyStart')
      .attr('class', 'marker dependency ' + t)
      .attr('refX', 6)
      .attr('refY', 7)
      .attr('markerWidth', 190)
      .attr('markerHeight', 240)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M 5,7 L9,13 L1,7 L9,1 Z'),
      r
        .append('defs')
        .append('marker')
        .attr('id', i + '_' + t + '-dependencyEnd')
        .attr('class', 'marker dependency ' + t)
        .attr('refX', 13)
        .attr('refY', 7)
        .attr('markerWidth', 20)
        .attr('markerHeight', 28)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M 18,7 L9,13 L14,7 L9,1 Z'),
      r
        .append('defs')
        .append('marker')
        .attr('id', i + '_' + t + '-dependencyStart-margin')
        .attr('class', 'marker dependency ' + t)
        .attr('refX', 4)
        .attr('refY', 7)
        .attr('markerWidth', 190)
        .attr('markerHeight', 240)
        .attr('orient', 'auto')
        .attr('markerUnits', 'userSpaceOnUse')
        .append('path')
        .style('stroke-width', 0)
        .attr('d', 'M 5,7 L9,13 L1,7 L9,1 Z'),
      r
        .append('defs')
        .append('marker')
        .attr('id', i + '_' + t + '-dependencyEnd-margin')
        .attr('class', 'marker dependency ' + t)
        .attr('refX', 16)
        .attr('refY', 7)
        .attr('markerWidth', 20)
        .attr('markerHeight', 28)
        .attr('orient', 'auto')
        .attr('markerUnits', 'userSpaceOnUse')
        .append('path')
        .style('stroke-width', 0)
        .attr('d', 'M 18,7 L9,13 L14,7 L9,1 Z'));
  }, 'dependency'),
  mp = d((r, t, i) => {
    (r
      .append('defs')
      .append('marker')
      .attr('id', i + '_' + t + '-lollipopStart')
      .attr('class', 'marker lollipop ' + t)
      .attr('refX', 13)
      .attr('refY', 7)
      .attr('markerWidth', 190)
      .attr('markerHeight', 240)
      .attr('orient', 'auto')
      .append('circle')
      .attr('fill', 'transparent')
      .attr('cx', 7)
      .attr('cy', 7)
      .attr('r', 6),
      r
        .append('defs')
        .append('marker')
        .attr('id', i + '_' + t + '-lollipopEnd')
        .attr('class', 'marker lollipop ' + t)
        .attr('refX', 1)
        .attr('refY', 7)
        .attr('markerWidth', 190)
        .attr('markerHeight', 240)
        .attr('orient', 'auto')
        .append('circle')
        .attr('fill', 'transparent')
        .attr('cx', 7)
        .attr('cy', 7)
        .attr('r', 6),
      r
        .append('defs')
        .append('marker')
        .attr('id', i + '_' + t + '-lollipopStart-margin')
        .attr('class', 'marker lollipop ' + t)
        .attr('refX', 13)
        .attr('refY', 7)
        .attr('markerWidth', 190)
        .attr('markerHeight', 240)
        .attr('orient', 'auto')
        .attr('markerUnits', 'userSpaceOnUse')
        .append('circle')
        .attr('fill', 'transparent')
        .attr('cx', 7)
        .attr('cy', 7)
        .attr('r', 6)
        .attr('stroke-width', 2),
      r
        .append('defs')
        .append('marker')
        .attr('id', i + '_' + t + '-lollipopEnd-margin')
        .attr('class', 'marker lollipop ' + t)
        .attr('refX', 1)
        .attr('refY', 7)
        .attr('markerWidth', 190)
        .attr('markerHeight', 240)
        .attr('orient', 'auto')
        .attr('markerUnits', 'userSpaceOnUse')
        .append('circle')
        .attr('fill', 'transparent')
        .attr('cx', 7)
        .attr('cy', 7)
        .attr('r', 6)
        .attr('stroke-width', 2));
  }, 'lollipop'),
  Cp = d((r, t, i) => {
    (r
      .append('marker')
      .attr('id', i + '_' + t + '-pointEnd')
      .attr('class', 'marker ' + t)
      .attr('viewBox', '0 0 10 10')
      .attr('refX', 5)
      .attr('refY', 5)
      .attr('markerUnits', 'userSpaceOnUse')
      .attr('markerWidth', 8)
      .attr('markerHeight', 8)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M 0 0 L 10 5 L 0 10 z')
      .attr('class', 'arrowMarkerPath')
      .style('stroke-width', 1)
      .style('stroke-dasharray', '1,0'),
      r
        .append('marker')
        .attr('id', i + '_' + t + '-pointStart')
        .attr('class', 'marker ' + t)
        .attr('viewBox', '0 0 10 10')
        .attr('refX', 4.5)
        .attr('refY', 5)
        .attr('markerUnits', 'userSpaceOnUse')
        .attr('markerWidth', 8)
        .attr('markerHeight', 8)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M 0 5 L 10 10 L 10 0 z')
        .attr('class', 'arrowMarkerPath')
        .style('stroke-width', 1)
        .style('stroke-dasharray', '1,0'),
      r
        .append('marker')
        .attr('id', i + '_' + t + '-pointEnd-margin')
        .attr('class', 'marker ' + t)
        .attr('viewBox', '0 0 11.5 14')
        .attr('refX', 11.5)
        .attr('refY', 7)
        .attr('markerUnits', 'userSpaceOnUse')
        .attr('markerWidth', 10.5)
        .attr('markerHeight', 14)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M 0 0 L 11.5 7 L 0 14 z')
        .attr('class', 'arrowMarkerPath')
        .style('stroke-width', 0)
        .style('stroke-dasharray', '1,0'),
      r
        .append('marker')
        .attr('id', i + '_' + t + '-pointStart-margin')
        .attr('class', 'marker ' + t)
        .attr('viewBox', '0 0 11.5 14')
        .attr('refX', 1)
        .attr('refY', 7)
        .attr('markerUnits', 'userSpaceOnUse')
        .attr('markerWidth', 11.5)
        .attr('markerHeight', 14)
        .attr('orient', 'auto')
        .append('polygon')
        .attr('points', '0,7 11.5,14 11.5,0')
        .attr('class', 'arrowMarkerPath')
        .style('stroke-width', 0)
        .style('stroke-dasharray', '1,0'));
  }, 'point'),
  yp = d((r, t, i) => {
    (r
      .append('marker')
      .attr('id', i + '_' + t + '-circleEnd')
      .attr('class', 'marker ' + t)
      .attr('viewBox', '0 0 10 10')
      .attr('refX', 11)
      .attr('refY', 5)
      .attr('markerUnits', 'userSpaceOnUse')
      .attr('markerWidth', 11)
      .attr('markerHeight', 11)
      .attr('orient', 'auto')
      .append('circle')
      .attr('cx', '5')
      .attr('cy', '5')
      .attr('r', '5')
      .attr('class', 'arrowMarkerPath')
      .style('stroke-width', 1)
      .style('stroke-dasharray', '1,0'),
      r
        .append('marker')
        .attr('id', i + '_' + t + '-circleStart')
        .attr('class', 'marker ' + t)
        .attr('viewBox', '0 0 10 10')
        .attr('refX', -1)
        .attr('refY', 5)
        .attr('markerUnits', 'userSpaceOnUse')
        .attr('markerWidth', 11)
        .attr('markerHeight', 11)
        .attr('orient', 'auto')
        .append('circle')
        .attr('cx', '5')
        .attr('cy', '5')
        .attr('r', '5')
        .attr('class', 'arrowMarkerPath')
        .style('stroke-width', 1)
        .style('stroke-dasharray', '1,0'),
      r
        .append('marker')
        .attr('id', i + '_' + t + '-circleEnd-margin')
        .attr('class', 'marker ' + t)
        .attr('viewBox', '0 0 10 10')
        .attr('refY', 5)
        .attr('refX', 12.25)
        .attr('markerUnits', 'userSpaceOnUse')
        .attr('markerWidth', 14)
        .attr('markerHeight', 14)
        .attr('orient', 'auto')
        .append('circle')
        .attr('cx', '5')
        .attr('cy', '5')
        .attr('r', '5')
        .attr('class', 'arrowMarkerPath')
        .style('stroke-width', 0)
        .style('stroke-dasharray', '1,0'),
      r
        .append('marker')
        .attr('id', i + '_' + t + '-circleStart-margin')
        .attr('class', 'marker ' + t)
        .attr('viewBox', '0 0 10 10')
        .attr('refX', -2)
        .attr('refY', 5)
        .attr('markerUnits', 'userSpaceOnUse')
        .attr('markerWidth', 14)
        .attr('markerHeight', 14)
        .attr('orient', 'auto')
        .append('circle')
        .attr('cx', '5')
        .attr('cy', '5')
        .attr('r', '5')
        .attr('class', 'arrowMarkerPath')
        .style('stroke-width', 0)
        .style('stroke-dasharray', '1,0'));
  }, 'circle'),
  xp = d((r, t, i) => {
    (r
      .append('marker')
      .attr('id', i + '_' + t + '-crossEnd')
      .attr('class', 'marker cross ' + t)
      .attr('viewBox', '0 0 11 11')
      .attr('refX', 12)
      .attr('refY', 5.2)
      .attr('markerUnits', 'userSpaceOnUse')
      .attr('markerWidth', 11)
      .attr('markerHeight', 11)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M 1,1 l 9,9 M 10,1 l -9,9')
      .attr('class', 'arrowMarkerPath')
      .style('stroke-width', 2)
      .style('stroke-dasharray', '1,0'),
      r
        .append('marker')
        .attr('id', i + '_' + t + '-crossStart')
        .attr('class', 'marker cross ' + t)
        .attr('viewBox', '0 0 11 11')
        .attr('refX', -1)
        .attr('refY', 5.2)
        .attr('markerUnits', 'userSpaceOnUse')
        .attr('markerWidth', 11)
        .attr('markerHeight', 11)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M 1,1 l 9,9 M 10,1 l -9,9')
        .attr('class', 'arrowMarkerPath')
        .style('stroke-width', 2)
        .style('stroke-dasharray', '1,0'),
      r
        .append('marker')
        .attr('id', i + '_' + t + '-crossEnd-margin')
        .attr('class', 'marker cross ' + t)
        .attr('viewBox', '0 0 15 15')
        .attr('refX', 17.7)
        .attr('refY', 7.5)
        .attr('markerUnits', 'userSpaceOnUse')
        .attr('markerWidth', 12)
        .attr('markerHeight', 12)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M 1,1 L 14,14 M 1,14 L 14,1')
        .attr('class', 'arrowMarkerPath')
        .style('stroke-width', 2.5),
      r
        .append('marker')
        .attr('id', i + '_' + t + '-crossStart-margin')
        .attr('class', 'marker cross ' + t)
        .attr('viewBox', '0 0 15 15')
        .attr('refX', -3.5)
        .attr('refY', 7.5)
        .attr('markerUnits', 'userSpaceOnUse')
        .attr('markerWidth', 12)
        .attr('markerHeight', 12)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M 1,1 L 14,14 M 1,14 L 14,1')
        .attr('class', 'arrowMarkerPath')
        .style('stroke-width', 2.5)
        .style('stroke-dasharray', '1,0'));
  }, 'cross'),
  bp = d((r, t, i) => {
    r.append('defs')
      .append('marker')
      .attr('id', i + '_' + t + '-barbEnd')
      .attr('refX', 19)
      .attr('refY', 7)
      .attr('markerWidth', 20)
      .attr('markerHeight', 14)
      .attr('markerUnits', 'userSpaceOnUse')
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M 19,7 L9,13 L14,7 L9,1 Z');
  }, 'barb'),
  kp = d((r, t, i) => {
    const e = at(),
      { themeVariables: o } = e,
      { transitionColor: a } = o;
    (r
      .append('defs')
      .append('marker')
      .attr('id', i + '_' + t + '-barbEnd')
      .attr('refX', 19)
      .attr('refY', 7)
      .attr('markerWidth', 20)
      .attr('markerHeight', 14)
      .attr('markerUnits', 'strokeWidth')
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M 19,7 L11,14 L13,7 L11,0 Z'),
      r
        .append('defs')
        .append('marker')
        .attr('id', i + '_' + t + '-barbEnd-margin')
        .attr('refX', 17)
        .attr('refY', 7)
        .attr('markerWidth', 20)
        .attr('markerHeight', 14)
        .attr('markerUnits', 'userSpaceOnUse')
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M 19,7 L11,14 L13,7 L11,0 Z')
        .attr('fill', `${a}`));
  }, 'barbNeo'),
  Bp = d((r, t, i) => {
    (r
      .append('defs')
      .append('marker')
      .attr('id', i + '_' + t + '-onlyOneStart')
      .attr('class', 'marker onlyOne ' + t)
      .attr('refX', 0)
      .attr('refY', 9)
      .attr('markerWidth', 18)
      .attr('markerHeight', 18)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M9,0 L9,18 M15,0 L15,18'),
      r
        .append('defs')
        .append('marker')
        .attr('id', i + '_' + t + '-onlyOneEnd')
        .attr('class', 'marker onlyOne ' + t)
        .attr('refX', 18)
        .attr('refY', 9)
        .attr('markerWidth', 18)
        .attr('markerHeight', 18)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M3,0 L3,18 M9,0 L9,18'));
  }, 'only_one'),
  Tp = d((r, t, i) => {
    const e = r
      .append('defs')
      .append('marker')
      .attr('id', i + '_' + t + '-zeroOrOneStart')
      .attr('class', 'marker zeroOrOne ' + t)
      .attr('refX', 0)
      .attr('refY', 9)
      .attr('markerWidth', 30)
      .attr('markerHeight', 18)
      .attr('orient', 'auto');
    (e.append('circle').attr('fill', 'white').attr('cx', 21).attr('cy', 9).attr('r', 6),
      e.append('path').attr('d', 'M9,0 L9,18'));
    const o = r
      .append('defs')
      .append('marker')
      .attr('id', i + '_' + t + '-zeroOrOneEnd')
      .attr('class', 'marker zeroOrOne ' + t)
      .attr('refX', 30)
      .attr('refY', 9)
      .attr('markerWidth', 30)
      .attr('markerHeight', 18)
      .attr('orient', 'auto');
    (o.append('circle').attr('fill', 'white').attr('cx', 9).attr('cy', 9).attr('r', 6),
      o.append('path').attr('d', 'M21,0 L21,18'));
  }, 'zero_or_one'),
  Sp = d((r, t, i) => {
    (r
      .append('defs')
      .append('marker')
      .attr('id', i + '_' + t + '-oneOrMoreStart')
      .attr('class', 'marker oneOrMore ' + t)
      .attr('refX', 18)
      .attr('refY', 18)
      .attr('markerWidth', 45)
      .attr('markerHeight', 36)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,18 Q 18,0 36,18 Q 18,36 0,18 M42,9 L42,27'),
      r
        .append('defs')
        .append('marker')
        .attr('id', i + '_' + t + '-oneOrMoreEnd')
        .attr('class', 'marker oneOrMore ' + t)
        .attr('refX', 27)
        .attr('refY', 18)
        .attr('markerWidth', 45)
        .attr('markerHeight', 36)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M3,9 L3,27 M9,18 Q27,0 45,18 Q27,36 9,18'));
  }, 'one_or_more'),
  wp = d((r, t, i) => {
    const e = r
      .append('defs')
      .append('marker')
      .attr('id', i + '_' + t + '-zeroOrMoreStart')
      .attr('class', 'marker zeroOrMore ' + t)
      .attr('refX', 18)
      .attr('refY', 18)
      .attr('markerWidth', 57)
      .attr('markerHeight', 36)
      .attr('orient', 'auto');
    (e.append('circle').attr('fill', 'white').attr('cx', 48).attr('cy', 18).attr('r', 6),
      e.append('path').attr('d', 'M0,18 Q18,0 36,18 Q18,36 0,18'));
    const o = r
      .append('defs')
      .append('marker')
      .attr('id', i + '_' + t + '-zeroOrMoreEnd')
      .attr('class', 'marker zeroOrMore ' + t)
      .attr('refX', 39)
      .attr('refY', 18)
      .attr('markerWidth', 57)
      .attr('markerHeight', 36)
      .attr('orient', 'auto');
    (o.append('circle').attr('fill', 'white').attr('cx', 9).attr('cy', 18).attr('r', 6),
      o.append('path').attr('d', 'M21,18 Q39,0 57,18 Q39,36 21,18'));
  }, 'zero_or_more'),
  vp = d((r, t, i) => {
    const e = at(),
      { themeVariables: o } = e,
      { strokeWidth: a } = o;
    (r
      .append('defs')
      .append('marker')
      .attr('id', i + '_' + t + '-onlyOneStart')
      .attr('class', 'marker onlyOne ' + t)
      .attr('refX', 0)
      .attr('refY', 9)
      .attr('markerWidth', 18)
      .attr('markerHeight', 18)
      .attr('orient', 'auto')
      .attr('markerUnits', 'userSpaceOnUse')
      .append('path')
      .attr('d', 'M9,0 L9,18 M15,0 L15,18')
      .attr('stroke-width', `${a}`),
      r
        .append('defs')
        .append('marker')
        .attr('id', i + '_' + t + '-onlyOneEnd')
        .attr('class', 'marker onlyOne ' + t)
        .attr('refX', 18)
        .attr('refY', 9)
        .attr('markerWidth', 18)
        .attr('markerHeight', 18)
        .attr('orient', 'auto')
        .attr('markerUnits', 'userSpaceOnUse')
        .append('path')
        .attr('d', 'M3,0 L3,18 M9,0 L9,18')
        .attr('stroke-width', `${a}`));
  }, 'only_one_neo'),
  Lp = d((r, t, i) => {
    const e = at(),
      { themeVariables: o } = e,
      { strokeWidth: a, mainBkg: s } = o,
      l = r
        .append('defs')
        .append('marker')
        .attr('id', i + '_' + t + '-zeroOrOneStart')
        .attr('class', 'marker zeroOrOne ' + t)
        .attr('refX', 0)
        .attr('refY', 9)
        .attr('markerWidth', 30)
        .attr('markerHeight', 18)
        .attr('orient', 'auto')
        .attr('markerUnits', 'userSpaceOnUse');
    (l
      .append('circle')
      .attr('fill', s ?? 'white')
      .attr('cx', 21)
      .attr('cy', 9)
      .attr('stroke-width', `${a}`)
      .attr('r', 6),
      l.append('path').attr('d', 'M9,0 L9,18').attr('stroke-width', `${a}`));
    const n = r
      .append('defs')
      .append('marker')
      .attr('id', i + '_' + t + '-zeroOrOneEnd')
      .attr('class', 'marker zeroOrOne ' + t)
      .attr('refX', 30)
      .attr('refY', 9)
      .attr('markerWidth', 30)
      .attr('markerHeight', 18)
      .attr('markerUnits', 'userSpaceOnUse')
      .attr('orient', 'auto');
    (n
      .append('circle')
      .attr('fill', s ?? 'white')
      .attr('cx', 9)
      .attr('cy', 9)
      .attr('stroke-width', `${a}`)
      .attr('r', 6),
      n.append('path').attr('d', 'M21,0 L21,18').attr('stroke-width', `${a}`));
  }, 'zero_or_one_neo'),
  Fp = d((r, t, i) => {
    const e = at(),
      { themeVariables: o } = e,
      { strokeWidth: a } = o;
    (r
      .append('defs')
      .append('marker')
      .attr('id', i + '_' + t + '-oneOrMoreStart')
      .attr('class', 'marker oneOrMore ' + t)
      .attr('refX', 18)
      .attr('refY', 18)
      .attr('markerWidth', 45)
      .attr('markerHeight', 36)
      .attr('orient', 'auto')
      .attr('markerUnits', 'userSpaceOnUse')
      .append('path')
      .attr('d', 'M0,18 Q 18,0 36,18 Q 18,36 0,18 M42,9 L42,27')
      .attr('stroke-width', `${a}`),
      r
        .append('defs')
        .append('marker')
        .attr('id', i + '_' + t + '-oneOrMoreEnd')
        .attr('class', 'marker oneOrMore ' + t)
        .attr('refX', 27)
        .attr('refY', 18)
        .attr('markerWidth', 45)
        .attr('markerHeight', 36)
        .attr('markerUnits', 'userSpaceOnUse')
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M3,9 L3,27 M9,18 Q27,0 45,18 Q27,36 9,18')
        .attr('stroke-width', `${a}`));
  }, 'one_or_more_neo'),
  _p = d((r, t, i) => {
    const e = at(),
      { themeVariables: o } = e,
      { strokeWidth: a, mainBkg: s } = o,
      l = r
        .append('defs')
        .append('marker')
        .attr('id', i + '_' + t + '-zeroOrMoreStart')
        .attr('class', 'marker zeroOrMore ' + t)
        .attr('refX', 18)
        .attr('refY', 18)
        .attr('markerWidth', 57)
        .attr('markerHeight', 36)
        .attr('markerUnits', 'userSpaceOnUse')
        .attr('orient', 'auto');
    (l
      .append('circle')
      .attr('fill', s ?? 'white')
      .attr('cx', 45.5)
      .attr('cy', 18)
      .attr('r', 6)
      .attr('stroke-width', `${a}`),
      l.append('path').attr('d', 'M0,18 Q18,0 36,18 Q18,36 0,18').attr('stroke-width', `${a}`));
    const n = r
      .append('defs')
      .append('marker')
      .attr('id', i + '_' + t + '-zeroOrMoreEnd')
      .attr('class', 'marker zeroOrMore ' + t)
      .attr('refX', 39)
      .attr('refY', 18)
      .attr('markerWidth', 57)
      .attr('markerHeight', 36)
      .attr('orient', 'auto')
      .attr('markerUnits', 'userSpaceOnUse');
    (n
      .append('circle')
      .attr('fill', s ?? 'white')
      .attr('cx', 11)
      .attr('cy', 18)
      .attr('r', 6)
      .attr('stroke-width', `${a}`),
      n.append('path').attr('d', 'M21,18 Q39,0 57,18 Q39,36 21,18').attr('stroke-width', `${a}`));
  }, 'zero_or_more_neo'),
  Ap = d((r, t, i) => {
    r.append('defs')
      .append('marker')
      .attr('id', i + '_' + t + '-requirement_arrowEnd')
      .attr('refX', 20)
      .attr('refY', 10)
      .attr('markerWidth', 20)
      .attr('markerHeight', 20)
      .attr('orient', 'auto')
      .append('path')
      .attr(
        'd',
        `M0,0
      L20,10
      M20,10
      L0,20`,
      );
  }, 'requirement_arrow'),
  Ep = d((r, t, i) => {
    const e = at(),
      { themeVariables: o } = e,
      { strokeWidth: a } = o;
    r.append('defs')
      .append('marker')
      .attr('id', i + '_' + t + '-requirement_arrowEnd')
      .attr('refX', 20)
      .attr('refY', 10)
      .attr('markerWidth', 20)
      .attr('markerHeight', 20)
      .attr('orient', 'auto')
      .attr('markerUnits', 'userSpaceOnUse')
      .attr('stroke-width', `${a}`)
      .attr('viewBox', '0 0 25 20')
      .append('path')
      .attr(
        'd',
        `M0,0
      L20,10
      M20,10
      L0,20`,
      )
      .attr('stroke-linejoin', 'miter');
  }, 'requirement_arrow_neo'),
  Mp = d((r, t, i) => {
    const e = r
      .append('defs')
      .append('marker')
      .attr('id', i + '_' + t + '-requirement_containsStart')
      .attr('refX', 0)
      .attr('refY', 10)
      .attr('markerWidth', 20)
      .attr('markerHeight', 20)
      .attr('orient', 'auto')
      .append('g');
    (e.append('circle').attr('cx', 10).attr('cy', 10).attr('r', 9).attr('fill', 'none'),
      e.append('line').attr('x1', 1).attr('x2', 19).attr('y1', 10).attr('y2', 10),
      e.append('line').attr('y1', 1).attr('y2', 19).attr('x1', 10).attr('x2', 10));
  }, 'requirement_contains'),
  Op = d((r, t, i) => {
    const e = at(),
      { themeVariables: o } = e,
      { strokeWidth: a } = o,
      s = r
        .append('defs')
        .append('marker')
        .attr('id', i + '_' + t + '-requirement_containsStart')
        .attr('refX', 0)
        .attr('refY', 10)
        .attr('markerWidth', 20)
        .attr('markerHeight', 20)
        .attr('orient', 'auto')
        .attr('markerUnits', 'userSpaceOnUse')
        .append('g');
    (s.append('circle').attr('cx', 10).attr('cy', 10).attr('r', 9).attr('fill', 'none'),
      s.append('line').attr('x1', 1).attr('x2', 19).attr('y1', 10).attr('y2', 10),
      s.append('line').attr('y1', 1).attr('y2', 19).attr('x1', 10).attr('x2', 10),
      s.selectAll('*').attr('stroke-width', `${a}`));
  }, 'requirement_contains_neo'),
  Ip = {
    extension: gp,
    composition: up,
    aggregation: pp,
    dependency: fp,
    lollipop: mp,
    point: Cp,
    circle: yp,
    cross: xp,
    barb: bp,
    barbNeo: kp,
    only_one: Bp,
    zero_or_one: Tp,
    one_or_more: Sp,
    zero_or_more: wp,
    only_one_neo: vp,
    zero_or_one_neo: Lp,
    one_or_more_neo: Fp,
    zero_or_more_neo: _p,
    requirement_arrow: Ap,
    requirement_contains: Mp,
    requirement_arrow_neo: Ep,
    requirement_contains_neo: Op,
  },
  Dp = dp,
  $p = {
    common: ti,
    getConfig: at,
    insertCluster: Ou,
    insertEdge: cp,
    insertEdgeLabel: op,
    insertMarkers: Dp,
    insertNode: Nn,
    interpolateToCurve: qe,
    labelHelper: V,
    log: F,
    positionEdgeLabel: ap,
  },
  Zr = {},
  Xn = d((r) => {
    for (const t of r) Zr[t.name] = t;
  }, 'registerLayoutLoaders'),
  Pp = d(() => {
    Xn([
      {
        name: 'dagre',
        loader: d(
          async () =>
            await tt(
              () => import('./dagre-BM42HDAG-CwrAZJCY.js'),
              __vite__mapDeps([0, 1, 2, 3, 4, 5, 6]),
              import.meta.url,
            ),
          'loader',
        ),
      },
      {
        name: 'cose-bilkent',
        loader: d(
          async () =>
            await tt(
              () => import('./cose-bilkent-S5V4N54A-CI6AaVKe.js'),
              __vite__mapDeps([7, 8, 3, 2, 4, 5]),
              import.meta.url,
            ),
          'loader',
        ),
      },
    ]);
  }, 'registerDefaultLayoutLoaders');
Pp();
var ty = d(async (r, t) => {
    if (!(r.layoutAlgorithm in Zr))
      throw new Error(`Unknown layout algorithm: ${r.layoutAlgorithm}`);
    if (r.diagramId)
      for (const c of r.nodes) {
        const h = c.domId || c.id;
        c.domId = `${r.diagramId}-${h}`;
      }
    const i = Zr[r.layoutAlgorithm],
      e = await i.loader(),
      { theme: o, themeVariables: a } = r.config,
      { useGradient: s, gradientStart: l, gradientStop: n } = a,
      g = t.attr('id');
    if (
      (t
        .append('defs')
        .append('filter')
        .attr('id', `${g}-drop-shadow`)
        .attr('height', '130%')
        .attr('width', '130%')
        .append('feDropShadow')
        .attr('dx', '4')
        .attr('dy', '4')
        .attr('stdDeviation', 0)
        .attr('flood-opacity', '0.06')
        .attr('flood-color', `${o?.includes('dark') ? '#FFFFFF' : '#000000'}`),
      t
        .append('defs')
        .append('filter')
        .attr('id', `${g}-drop-shadow-small`)
        .attr('height', '150%')
        .attr('width', '150%')
        .append('feDropShadow')
        .attr('dx', '2')
        .attr('dy', '2')
        .attr('stdDeviation', 0)
        .attr('flood-opacity', '0.06')
        .attr('flood-color', `${o?.includes('dark') ? '#FFFFFF' : '#000000'}`),
      s)
    ) {
      const c = t
        .append('linearGradient')
        .attr('id', t.attr('id') + '-gradient')
        .attr('gradientUnits', 'objectBoundingBox')
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '100%')
        .attr('y2', '0%');
      (c.append('svg:stop').attr('offset', '0%').attr('stop-color', l).attr('stop-opacity', 1),
        c.append('svg:stop').attr('offset', '100%').attr('stop-color', n).attr('stop-opacity', 1));
    }
    return e.render(r, t, $p, { algorithm: i.algorithm });
  }, 'render'),
  ry = d((r = '', { fallback: t = 'dagre' } = {}) => {
    if (r in Zr) return r;
    if (t in Zr)
      return (F.warn(`Layout algorithm ${r} is not registered. Using ${t} as fallback.`), t);
    throw new Error(`Both layout algorithms ${r} and ${t} are not registered.`);
  }, 'getRegisteredLayoutAlgorithm'),
  Un = 'c4',
  qp = d((r) => /^\s*C4Context|C4Container|C4Component|C4Dynamic|C4Deployment/.test(r), 'detector'),
  Rp = d(async () => {
    const { diagram: r } = await tt(
      async () => {
        const { diagram: t } = await import('./c4Diagram-AAUBKEIU-C1lOF5Ut.js');
        return { diagram: t };
      },
      __vite__mapDeps([9, 10, 4, 3, 2, 5]),
      import.meta.url,
    );
    return { id: Un, diagram: r };
  }, 'loader'),
  Wp = { id: Un, detector: qp, loader: Rp },
  zp = Wp,
  Vn = 'flowchart',
  Np = d(
    (r, t) =>
      t?.flowchart?.defaultRenderer === 'dagre-wrapper' || t?.flowchart?.defaultRenderer === 'elk'
        ? !1
        : /^\s*graph/.test(r),
    'detector',
  ),
  Hp = d(async () => {
    const { diagram: r } = await tt(
      async () => {
        const { diagram: t } = await import('./flowDiagram-I6XJVG4X-BokLJIH1.js');
        return { diagram: t };
      },
      __vite__mapDeps([11, 12, 10, 4, 3, 2, 5, 13, 14]),
      import.meta.url,
    );
    return { id: Vn, diagram: r };
  }, 'loader'),
  Yp = { id: Vn, detector: Np, loader: Hp },
  jp = Yp,
  Gn = 'flowchart-v2',
  Xp = d(
    (r, t) =>
      t?.flowchart?.defaultRenderer === 'dagre-d3'
        ? !1
        : (t?.flowchart?.defaultRenderer === 'elk' && (t.layout = 'elk'),
          /^\s*graph/.test(r) && t?.flowchart?.defaultRenderer === 'dagre-wrapper'
            ? !0
            : /^\s*flowchart/.test(r)),
    'detector',
  ),
  Up = d(async () => {
    const { diagram: r } = await tt(
      async () => {
        const { diagram: t } = await import('./flowDiagram-I6XJVG4X-BokLJIH1.js');
        return { diagram: t };
      },
      __vite__mapDeps([11, 12, 10, 4, 3, 2, 5, 13, 14]),
      import.meta.url,
    );
    return { id: Gn, diagram: r };
  }, 'loader'),
  Vp = { id: Gn, detector: Xp, loader: Up },
  Gp = Vp,
  Kn = 'er',
  Kp = d((r) => /^\s*erDiagram/.test(r), 'detector'),
  Qp = d(async () => {
    const { diagram: r } = await tt(
      async () => {
        const { diagram: t } = await import('./erDiagram-TEJ5UH35-BsPy1RWg.js');
        return { diagram: t };
      },
      __vite__mapDeps([15, 13, 4, 3, 2, 5, 14]),
      import.meta.url,
    );
    return { id: Kn, diagram: r };
  }, 'loader'),
  Zp = { id: Kn, detector: Kp, loader: Qp },
  Jp = Zp,
  Qn = 'gitGraph',
  tf = d((r) => /^\s*gitGraph/.test(r), 'detector'),
  rf = d(async () => {
    const { diagram: r } = await tt(
      async () => {
        const { diagram: t } = await import('./gitGraphDiagram-PVQCEYII-CyGtU6Y8.js');
        return { diagram: t };
      },
      __vite__mapDeps([16, 17, 18, 19, 2, 3, 4, 5]),
      import.meta.url,
    );
    return { id: Qn, diagram: r };
  }, 'loader'),
  ef = { id: Qn, detector: tf, loader: rf },
  of = ef,
  Zn = 'gantt',
  af = d((r) => /^\s*gantt/.test(r), 'detector'),
  sf = d(async () => {
    const { diagram: r } = await tt(
      async () => {
        const { diagram: t } = await import('./ganttDiagram-6RSMTGT7-DKMxoKP0.js');
        return { diagram: t };
      },
      __vite__mapDeps([20, 4, 3, 2, 5]),
      import.meta.url,
    );
    return { id: Zn, diagram: r };
  }, 'loader'),
  lf = { id: Zn, detector: af, loader: sf },
  nf = lf,
  Jn = 'info',
  hf = d((r) => /^\s*info/.test(r), 'detector'),
  cf = d(async () => {
    const { diagram: r } = await tt(
      async () => {
        const { diagram: t } = await import('./infoDiagram-5YYISTIA-0FaINmMD.js');
        return { diagram: t };
      },
      __vite__mapDeps([21, 19, 2, 3, 4, 5]),
      import.meta.url,
    );
    return { id: Jn, diagram: r };
  }, 'loader'),
  df = { id: Jn, detector: hf, loader: cf },
  th = 'pie',
  gf = d((r) => /^\s*pie/.test(r), 'detector'),
  uf = d(async () => {
    const { diagram: r } = await tt(
      async () => {
        const { diagram: t } = await import('./pieDiagram-4H26LBE5-BwVnHHHf.js');
        return { diagram: t };
      },
      __vite__mapDeps([22, 17, 19, 2, 3, 4, 5]),
      import.meta.url,
    );
    return { id: th, diagram: r };
  }, 'loader'),
  pf = { id: th, detector: gf, loader: uf },
  rh = 'quadrantChart',
  ff = d((r) => /^\s*quadrantChart/.test(r), 'detector'),
  mf = d(async () => {
    const { diagram: r } = await tt(
      async () => {
        const { diagram: t } = await import('./quadrantDiagram-W4KKPZXB-BfEasW7F.js');
        return { diagram: t };
      },
      __vite__mapDeps([23, 4, 3, 2, 5]),
      import.meta.url,
    );
    return { id: rh, diagram: r };
  }, 'loader'),
  Cf = { id: rh, detector: ff, loader: mf },
  yf = Cf,
  ih = 'xychart',
  xf = d((r) => /^\s*xychart(-beta)?/.test(r), 'detector'),
  bf = d(async () => {
    const { diagram: r } = await tt(
      async () => {
        const { diagram: t } = await import('./xychartDiagram-2RQKCTM6-BX2uTcKG.js');
        return { diagram: t };
      },
      __vite__mapDeps([24, 4, 3, 2, 5]),
      import.meta.url,
    );
    return { id: ih, diagram: r };
  }, 'loader'),
  kf = { id: ih, detector: xf, loader: bf },
  Bf = kf,
  eh = 'requirement',
  Tf = d((r) => /^\s*requirement(Diagram)?/.test(r), 'detector'),
  Sf = d(async () => {
    const { diagram: r } = await tt(
      async () => {
        const { diagram: t } = await import('./requirementDiagram-4Y6WPE33-Cs1X_Ghk.js');
        return { diagram: t };
      },
      __vite__mapDeps([25, 13, 4, 3, 2, 5, 14]),
      import.meta.url,
    );
    return { id: eh, diagram: r };
  }, 'loader'),
  wf = { id: eh, detector: Tf, loader: Sf },
  vf = wf,
  oh = 'sequence',
  Lf = d((r) => /^\s*sequenceDiagram/.test(r), 'detector'),
  Ff = d(async () => {
    const { diagram: r } = await tt(
      async () => {
        const { diagram: t } = await import('./sequenceDiagram-3UESZ5HK-D7z_Ktem.js');
        return { diagram: t };
      },
      __vite__mapDeps([26, 10, 4, 3, 2, 5, 18]),
      import.meta.url,
    );
    return { id: oh, diagram: r };
  }, 'loader'),
  _f = { id: oh, detector: Lf, loader: Ff },
  Af = _f,
  ah = 'class',
  Ef = d(
    (r, t) => (t?.class?.defaultRenderer === 'dagre-wrapper' ? !1 : /^\s*classDiagram/.test(r)),
    'detector',
  ),
  Mf = d(async () => {
    const { diagram: r } = await tt(
      async () => {
        const { diagram: t } = await import('./classDiagram-4FO5ZUOK-W-XJ1P32.js');
        return { diagram: t };
      },
      __vite__mapDeps([27, 28, 12, 10, 4, 3, 2, 5, 13, 14]),
      import.meta.url,
    );
    return { id: ah, diagram: r };
  }, 'loader'),
  Of = { id: ah, detector: Ef, loader: Mf },
  If = Of,
  sh = 'classDiagram',
  Df = d(
    (r, t) =>
      /^\s*classDiagram/.test(r) && t?.class?.defaultRenderer === 'dagre-wrapper'
        ? !0
        : /^\s*classDiagram-v2/.test(r),
    'detector',
  ),
  $f = d(async () => {
    const { diagram: r } = await tt(
      async () => {
        const { diagram: t } = await import('./classDiagram-v2-Q7XG4LA2-W-XJ1P32.js');
        return { diagram: t };
      },
      __vite__mapDeps([29, 28, 12, 10, 4, 3, 2, 5, 13, 14]),
      import.meta.url,
    );
    return { id: sh, diagram: r };
  }, 'loader'),
  Pf = { id: sh, detector: Df, loader: $f },
  qf = Pf,
  lh = 'state',
  Rf = d(
    (r, t) => (t?.state?.defaultRenderer === 'dagre-wrapper' ? !1 : /^\s*stateDiagram/.test(r)),
    'detector',
  ),
  Wf = d(async () => {
    const { diagram: r } = await tt(
      async () => {
        const { diagram: t } = await import('./stateDiagram-AJRCARHV-1wTHzH2J.js');
        return { diagram: t };
      },
      __vite__mapDeps([30, 31, 13, 4, 3, 2, 5, 14, 1, 6]),
      import.meta.url,
    );
    return { id: lh, diagram: r };
  }, 'loader'),
  zf = { id: lh, detector: Rf, loader: Wf },
  Nf = zf,
  nh = 'stateDiagram',
  Hf = d(
    (r, t) =>
      !!(
        /^\s*stateDiagram-v2/.test(r) ||
        (/^\s*stateDiagram/.test(r) && t?.state?.defaultRenderer === 'dagre-wrapper')
      ),
    'detector',
  ),
  Yf = d(async () => {
    const { diagram: r } = await tt(
      async () => {
        const { diagram: t } = await import('./stateDiagram-v2-BHNVJYJU-vKkHKFus.js');
        return { diagram: t };
      },
      __vite__mapDeps([32, 31, 13, 4, 3, 2, 5, 14]),
      import.meta.url,
    );
    return { id: nh, diagram: r };
  }, 'loader'),
  jf = { id: nh, detector: Hf, loader: Yf },
  Xf = jf,
  hh = 'journey',
  Uf = d((r) => /^\s*journey/.test(r), 'detector'),
  Vf = d(async () => {
    const { diagram: r } = await tt(
      async () => {
        const { diagram: t } = await import('./journeyDiagram-JHISSGLW-CC7_DFlb.js');
        return { diagram: t };
      },
      __vite__mapDeps([33, 12, 10, 4, 3, 2, 5]),
      import.meta.url,
    );
    return { id: hh, diagram: r };
  }, 'loader'),
  Gf = { id: hh, detector: Uf, loader: Vf },
  Kf = Gf,
  Qf = d((r, t, i) => {
    F.debug(`rendering svg for syntax error
`);
    const e = md(t),
      o = e.append('g');
    (e.attr('viewBox', '0 0 2412 512'),
      sa(e, 100, 512, !0),
      o
        .append('path')
        .attr('class', 'error-icon')
        .attr(
          'd',
          'm411.313,123.313c6.25-6.25 6.25-16.375 0-22.625s-16.375-6.25-22.625,0l-32,32-9.375,9.375-20.688-20.688c-12.484-12.5-32.766-12.5-45.25,0l-16,16c-1.261,1.261-2.304,2.648-3.31,4.051-21.739-8.561-45.324-13.426-70.065-13.426-105.867,0-192,86.133-192,192s86.133,192 192,192 192-86.133 192-192c0-24.741-4.864-48.327-13.426-70.065 1.402-1.007 2.79-2.049 4.051-3.31l16-16c12.5-12.492 12.5-32.758 0-45.25l-20.688-20.688 9.375-9.375 32.001-31.999zm-219.313,100.687c-52.938,0-96,43.063-96,96 0,8.836-7.164,16-16,16s-16-7.164-16-16c0-70.578 57.422-128 128-128 8.836,0 16,7.164 16,16s-7.164,16-16,16z',
        ),
      o
        .append('path')
        .attr('class', 'error-icon')
        .attr(
          'd',
          'm459.02,148.98c-6.25-6.25-16.375-6.25-22.625,0s-6.25,16.375 0,22.625l16,16c3.125,3.125 7.219,4.688 11.313,4.688 4.094,0 8.188-1.563 11.313-4.688 6.25-6.25 6.25-16.375 0-22.625l-16.001-16z',
        ),
      o
        .append('path')
        .attr('class', 'error-icon')
        .attr(
          'd',
          'm340.395,75.605c3.125,3.125 7.219,4.688 11.313,4.688 4.094,0 8.188-1.563 11.313-4.688 6.25-6.25 6.25-16.375 0-22.625l-16-16c-6.25-6.25-16.375-6.25-22.625,0s-6.25,16.375 0,22.625l15.999,16z',
        ),
      o
        .append('path')
        .attr('class', 'error-icon')
        .attr(
          'd',
          'm400,64c8.844,0 16-7.164 16-16v-32c0-8.836-7.156-16-16-16-8.844,0-16,7.164-16,16v32c0,8.836 7.156,16 16,16z',
        ),
      o
        .append('path')
        .attr('class', 'error-icon')
        .attr(
          'd',
          'm496,96.586h-32c-8.844,0-16,7.164-16,16 0,8.836 7.156,16 16,16h32c8.844,0 16-7.164 16-16 0-8.836-7.156-16-16-16z',
        ),
      o
        .append('path')
        .attr('class', 'error-icon')
        .attr(
          'd',
          'm436.98,75.605c3.125,3.125 7.219,4.688 11.313,4.688 4.094,0 8.188-1.563 11.313-4.688l32-32c6.25-6.25 6.25-16.375 0-22.625s-16.375-6.25-22.625,0l-32,32c-6.251,6.25-6.251,16.375-0.001,22.625z',
        ),
      o
        .append('text')
        .attr('class', 'error-text')
        .attr('x', 1440)
        .attr('y', 250)
        .attr('font-size', '150px')
        .style('text-anchor', 'middle')
        .text('Syntax error in text'),
      o
        .append('text')
        .attr('class', 'error-text')
        .attr('x', 1250)
        .attr('y', 400)
        .attr('font-size', '100px')
        .style('text-anchor', 'middle')
        .text(`mermaid version ${i}`));
  }, 'draw'),
  ch = { draw: Qf },
  Zf = ch,
  Jf = { db: {}, renderer: ch, parser: { parse: d(() => {}, 'parse') } },
  tm = Jf,
  dh = 'flowchart-elk',
  rm = d(
    (r, t = {}) =>
      /^\s*flowchart-elk/.test(r) ||
      (/^\s*(flowchart|graph)/.test(r) && t?.flowchart?.defaultRenderer === 'elk')
        ? ((t.layout = 'elk'), !0)
        : !1,
    'detector',
  ),
  im = d(async () => {
    const { diagram: r } = await tt(
      async () => {
        const { diagram: t } = await import('./flowDiagram-I6XJVG4X-BokLJIH1.js');
        return { diagram: t };
      },
      __vite__mapDeps([11, 12, 10, 4, 3, 2, 5, 13, 14]),
      import.meta.url,
    );
    return { id: dh, diagram: r };
  }, 'loader'),
  em = { id: dh, detector: rm, loader: im },
  om = em,
  gh = 'timeline',
  am = d((r) => /^\s*timeline/.test(r), 'detector'),
  sm = d(async () => {
    const { diagram: r } = await tt(
      async () => {
        const { diagram: t } = await import('./timeline-definition-PNZ67QCA-BoGwOGIp.js');
        return { diagram: t };
      },
      __vite__mapDeps([34, 4, 3, 2, 5]),
      import.meta.url,
    );
    return { id: gh, diagram: r };
  }, 'loader'),
  lm = { id: gh, detector: am, loader: sm },
  nm = lm,
  uh = 'mindmap',
  hm = d((r) => /^\s*mindmap/.test(r), 'detector'),
  cm = d(async () => {
    const { diagram: r } = await tt(
      async () => {
        const { diagram: t } = await import('./mindmap-definition-RKZ34NQL-Bw2XNInU.js');
        return { diagram: t };
      },
      __vite__mapDeps([35, 13, 4, 3, 2, 5, 14]),
      import.meta.url,
    );
    return { id: uh, diagram: r };
  }, 'loader'),
  dm = { id: uh, detector: hm, loader: cm },
  gm = dm,
  ph = 'kanban',
  um = d((r) => /^\s*kanban/.test(r), 'detector'),
  pm = d(async () => {
    const { diagram: r } = await tt(
      async () => {
        const { diagram: t } = await import('./kanban-definition-UN3LZRKU-JtWncK2N.js');
        return { diagram: t };
      },
      __vite__mapDeps([36, 12, 4, 3, 2, 5]),
      import.meta.url,
    );
    return { id: ph, diagram: r };
  }, 'loader'),
  fm = { id: ph, detector: um, loader: pm },
  mm = fm,
  fh = 'sankey',
  Cm = d((r) => /^\s*sankey(-beta)?/.test(r), 'detector'),
  ym = d(async () => {
    const { diagram: r } = await tt(
      async () => {
        const { diagram: t } = await import('./sankeyDiagram-5OEKKPKP-D4oQqOpL.js');
        return { diagram: t };
      },
      __vite__mapDeps([37, 4, 3, 2, 5]),
      import.meta.url,
    );
    return { id: fh, diagram: r };
  }, 'loader'),
  xm = { id: fh, detector: Cm, loader: ym },
  bm = xm,
  mh = 'packet',
  km = d((r) => /^\s*packet(-beta)?/.test(r), 'detector'),
  Bm = d(async () => {
    const { diagram: r } = await tt(
      async () => {
        const { diagram: t } = await import('./diagram-LMA3HP47-BMrD7tDn.js');
        return { diagram: t };
      },
      __vite__mapDeps([38, 17, 19, 2, 3, 4, 5]),
      import.meta.url,
    );
    return { id: mh, diagram: r };
  }, 'loader'),
  Tm = { id: mh, detector: km, loader: Bm },
  Ch = 'radar',
  Sm = d((r) => /^\s*radar-beta/.test(r), 'detector'),
  wm = d(async () => {
    const { diagram: r } = await tt(
      async () => {
        const { diagram: t } = await import('./diagram-2AECGRRQ-B9-9EW9-.js');
        return { diagram: t };
      },
      __vite__mapDeps([39, 17, 19, 2, 3, 4, 5]),
      import.meta.url,
    );
    return { id: Ch, diagram: r };
  }, 'loader'),
  vm = { id: Ch, detector: Sm, loader: wm },
  yh = 'block',
  Lm = d((r) => /^\s*block(-beta)?/.test(r), 'detector'),
  Fm = d(async () => {
    const { diagram: r } = await tt(
      async () => {
        const { diagram: t } = await import('./blockDiagram-GPEHLZMM-CeDGCI2L.js');
        return { diagram: t };
      },
      __vite__mapDeps([40, 12, 4, 3, 2, 5, 1]),
      import.meta.url,
    );
    return { id: yh, diagram: r };
  }, 'loader'),
  _m = { id: yh, detector: Lm, loader: Fm },
  Am = _m,
  xh = 'treeView',
  Em = d((r) => /^\s*treeView-beta/.test(r), 'detector'),
  Mm = d(async () => {
    const { diagram: r } = await tt(
      async () => {
        const { diagram: t } = await import('./diagram-5GNKFQAL-e6ygqUXe.js');
        return { diagram: t };
      },
      __vite__mapDeps([41, 17, 18, 19, 2, 3, 4, 5]),
      import.meta.url,
    );
    return { id: xh, diagram: r };
  }, 'loader'),
  Om = { id: xh, detector: Em, loader: Mm },
  Im = Om,
  bh = 'architecture',
  Dm = d((r) => /^\s*architecture/.test(r), 'detector'),
  $m = d(async () => {
    const { diagram: r } = await tt(
      async () => {
        const { diagram: t } = await import('./architectureDiagram-3BPJPVTR-ClnDEwH3.js');
        return { diagram: t };
      },
      __vite__mapDeps([42, 17, 19, 2, 3, 4, 5, 8]),
      import.meta.url,
    );
    return { id: bh, diagram: r };
  }, 'loader'),
  Pm = { id: bh, detector: Dm, loader: $m },
  qm = Pm,
  kh = 'eventmodeling',
  Rm = d((r) => /^\s*eventmodeling/.test(r), 'detector'),
  Wm = d(async () => {
    const { diagram: r } = await tt(
      async () => {
        const { diagram: t } = await import('./diagram-KO2AKTUF-DOXymSlq.js');
        return { diagram: t };
      },
      __vite__mapDeps([43, 17, 19, 2, 3, 4, 5]),
      import.meta.url,
    );
    return { id: kh, diagram: r };
  }, 'loader'),
  zm = { id: kh, detector: Rm, loader: Wm },
  Nm = zm,
  Bh = 'ishikawa',
  Hm = d((r) => /^\s*ishikawa(-beta)?\b/i.test(r), 'detector'),
  Ym = d(async () => {
    const { diagram: r } = await tt(
      async () => {
        const { diagram: t } = await import('./ishikawaDiagram-YF4QCWOH-BKMMMio4.js');
        return { diagram: t };
      },
      __vite__mapDeps([44, 4, 3, 2, 5]),
      import.meta.url,
    );
    return { id: Bh, diagram: r };
  }, 'loader'),
  jm = { id: Bh, detector: Hm, loader: Ym },
  Th = 'venn',
  Xm = d((r) => /^\s*venn-beta/.test(r), 'detector'),
  Um = d(async () => {
    const { diagram: r } = await tt(
      async () => {
        const { diagram: t } = await import('./vennDiagram-CIIHVFJN-D72fpY8E.js');
        return { diagram: t };
      },
      __vite__mapDeps([45, 4, 3, 2, 5]),
      import.meta.url,
    );
    return { id: Th, diagram: r };
  }, 'loader'),
  Vm = { id: Th, detector: Xm, loader: Um },
  Gm = Vm,
  Sh = 'treemap',
  Km = d((r) => /^\s*treemap/.test(r), 'detector'),
  Qm = d(async () => {
    const { diagram: r } = await tt(
      async () => {
        const { diagram: t } = await import('./diagram-OG6HWLK6-BP0gmJFm.js');
        return { diagram: t };
      },
      __vite__mapDeps([46, 14, 17, 19, 2, 3, 4, 5]),
      import.meta.url,
    );
    return { id: Sh, diagram: r };
  }, 'loader'),
  Zm = { id: Sh, detector: Km, loader: Qm },
  wh = 'wardley-beta',
  Jm = d((r) => /^\s*wardley-beta/i.test(r), 'detector'),
  tC = d(async () => {
    const { diagram: r } = await tt(
      async () => {
        const { diagram: t } = await import('./wardleyDiagram-YWT4CUSO-BpFDKWYD.js');
        return { diagram: t };
      },
      __vite__mapDeps([47, 17, 19, 2, 3, 4, 5]),
      import.meta.url,
    );
    return { id: wh, diagram: r };
  }, 'loader'),
  rC = { id: wh, detector: Jm, loader: tC },
  iC = rC,
  Lo = !1,
  Oi = d(() => {
    Lo ||
      ((Lo = !0),
      mi('error', tm, (r) => r.toLowerCase().trim() === 'error'),
      mi(
        '---',
        {
          db: { clear: d(() => {}, 'clear') },
          styles: {},
          renderer: { draw: d(() => {}, 'draw') },
          parser: {
            parse: d(() => {
              throw new Error(
                "Diagrams beginning with --- are not valid. If you were trying to use a YAML front-matter, please ensure that you've correctly opened and closed the YAML front-matter with un-indented `---` blocks",
              );
            }, 'parse'),
          },
          init: d(() => null, 'init'),
        },
        (r) => r.toLowerCase().trimStart().startsWith('---'),
      ),
      zi(om, gm, qm),
      zi(
        zp,
        mm,
        qf,
        If,
        Jp,
        nf,
        df,
        pf,
        vf,
        Af,
        Gp,
        jp,
        nm,
        of,
        Xf,
        Nf,
        Kf,
        yf,
        bm,
        Tm,
        Bf,
        Am,
        Nm,
        Im,
        vm,
        jm,
        Zm,
        Gm,
        iC,
      ));
  }, 'addDiagrams'),
  eC = d(async () => {
    F.debug('Loading registered diagrams');
    const t = (
      await Promise.allSettled(
        Object.entries(lr).map(async ([i, { detector: e, loader: o }]) => {
          if (o)
            try {
              Xi(i);
            } catch {
              try {
                const { diagram: a, id: s } = await o();
                mi(s, a, e);
              } catch (a) {
                throw (
                  F.error(
                    `Failed to load external diagram with key ${i}. Removing from detectors.`,
                  ),
                  delete lr[i],
                  a
                );
              }
            }
        }),
      )
    ).filter((i) => i.status === 'rejected');
    if (t.length > 0) {
      F.error(`Failed to load ${t.length} external diagrams`);
      for (const i of t) F.error(i);
      throw new Error(`Failed to load ${t.length} external diagrams`);
    }
  }, 'loadRegisteredDiagrams'),
  oC = 'graphics-document document';
function vh(r, t) {
  (r.attr('role', oC), t !== '' && r.attr('aria-roledescription', t));
}
d(vh, 'setA11yDiagramInfo');
function Lh(r, t, i, e) {
  if (r.insert !== void 0) {
    if (i) {
      const o = `chart-desc-${e}`;
      (r.attr('aria-describedby', o), r.insert('desc', ':first-child').attr('id', o).text(i));
    }
    if (t) {
      const o = `chart-title-${e}`;
      (r.attr('aria-labelledby', o), r.insert('title', ':first-child').attr('id', o).text(t));
    }
  }
}
d(Lh, 'addSVGa11yTitleDescription');
var sr,
  Ce =
    ((sr = class {
      constructor(t, i, e, o, a) {
        ((this.type = t), (this.text = i), (this.db = e), (this.parser = o), (this.renderer = a));
      }
      static async fromText(t, i = {}) {
        const e = at(),
          o = be(t, e);
        t =
          Cu(t) +
          `
`;
        try {
          Xi(o);
        } catch {
          const g = gc(o);
          if (!g) throw new jo(`Diagram ${o} not found.`);
          const { id: c, diagram: h } = await g();
          mi(c, h);
        }
        const { db: a, parser: s, renderer: l, init: n } = Xi(o);
        return (
          s.parser && (s.parser.yy = a),
          a.clear?.(),
          n?.(e),
          i.title && a.setDiagramTitle?.(i.title),
          await s.parse(t),
          new sr(o, t, a, s, l)
        );
      }
      async render(t, i) {
        await this.renderer.draw(this.text, t, i, this);
      }
      getParser() {
        return this.parser;
      }
      getType() {
        return this.type;
      }
    }),
    d(sr, 'Diagram'),
    sr),
  Fo = [],
  aC = d(() => {
    (Fo.forEach((r) => {
      r();
    }),
      (Fo = []));
  }, 'attachFunctions'),
  sC = d((r) => r.replace(/^\s*%%(?!{)[^\n]+\n?/gm, '').trimStart(), 'cleanupComments');
function Fh(r) {
  const t = r.match(Yo);
  if (!t) return { text: r, metadata: {} };
  let i = Tg(t[1], { schema: Bg }) ?? {};
  i = typeof i == 'object' && !Array.isArray(i) ? i : {};
  const e = {};
  return (
    i.displayMode && (e.displayMode = i.displayMode.toString()),
    i.title && (e.title = i.title.toString()),
    i.config && (e.config = i.config),
    { text: r.slice(t[0].length), metadata: e }
  );
}
d(Fh, 'extractFrontMatter');
var lC = d(
    (r) =>
      r
        .replace(
          /\r\n?/g,
          `
`,
        )
        .replace(/<(\w+)([^>]*)>/g, (t, i, e) => '<' + i + e.replace(/="([^"]*)"/g, "='$1'") + '>'),
    'cleanupText',
  ),
  nC = d((r) => {
    const { text: t, metadata: i } = Fh(r),
      { displayMode: e, title: o, config: a = {} } = i;
    return (
      e && (a.gantt || (a.gantt = {}), (a.gantt.displayMode = e)),
      { title: o, config: a, text: t }
    );
  }, 'processFrontmatter'),
  hC = d((r) => {
    const t = Ft.detectInit(r) ?? {},
      i = Ft.detectDirective(r, 'wrap');
    return (
      Array.isArray(i)
        ? (t.wrap = i.some(({ type: e }) => e === 'wrap'))
        : i?.type === 'wrap' && (t.wrap = !0),
      { text: ou(r), directive: t }
    );
  }, 'processDirectives');
function Ve(r) {
  const t = lC(r),
    i = nC(t),
    e = hC(i.text),
    o = He(i.config, e.directive);
  return ((r = sC(e.text)), { code: r, title: i.title, config: o });
}
d(Ve, 'preprocessDiagram');
function _h(r) {
  const t = new TextEncoder().encode(r),
    i = Array.from(t, (e) => String.fromCodePoint(e)).join('');
  return btoa(i);
}
d(_h, 'toBase64');
var cC = 5e4,
  dC = 'graph TB;a[Maximum text size in diagram exceeded];style a fill:#faa',
  gC = 'sandbox',
  uC = 'loose',
  pC = 'http://www.w3.org/2000/svg',
  fC = 'http://www.w3.org/1999/xlink',
  mC = 'http://www.w3.org/1999/xhtml',
  CC = '100%',
  yC = '100%',
  xC = 'border:0;margin:0;',
  bC = 'margin:0',
  kC = 'allow-top-navigation-by-user-activation allow-popups',
  BC = 'The "iframe" tag is not supported by your browser.',
  TC = ['foreignobject'],
  SC = ['dominant-baseline'];
function Ge(r) {
  const t = Ve(r);
  return (pi(), Rc(t.config ?? {}), t);
}
d(Ge, 'processAndSetConfigs');
async function Ah(r, t) {
  Oi();
  try {
    const { code: i, config: e } = Ge(r);
    return { diagramType: (await Mh(i)).type, config: e };
  } catch (i) {
    if (t?.suppressErrors) return !1;
    throw i;
  }
}
d(Ah, 'parse');
var _o = d((r, t, i = []) => {
    const e = Ko(`{ ${i.join(' !important; ')} !important; }`);
    return `.${r} ${t} ${e}`;
  }, 'cssImportantStyles'),
  wC = d((r, t = new Map()) => {
    const i = new CSSStyleSheet();
    if (
      (r.fontFamily !== void 0 &&
        i.insertRule(`:root { --mermaid-font-family: ${r.fontFamily}}`, i.cssRules.length),
      r.altFontFamily !== void 0 &&
        i.insertRule(`:root { --mermaid-alt-font-family: ${r.altFontFamily}}`, i.cssRules.length),
      t instanceof Map)
    ) {
      const l = kt(r) ? ['> *', 'span'] : ['rect', 'polygon', 'ellipse', 'circle', 'path'];
      t.forEach((n) => {
        (no(n.styles) ||
          l.forEach((g) => {
            i.insertRule(_o(n.id, g, n.styles), i.cssRules.length);
          }),
          no(n.textStyles) ||
            i.insertRule(
              _o(
                n.id,
                'tspan',
                (n?.textStyles || []).map((g) => g.replace('color', 'fill')),
              ),
              i.cssRules.length,
            ));
      });
    }
    let e = '';
    if (r.themeCSS !== void 0)
      if (typeof i.replaceSync == 'function') {
        const o = new CSSStyleSheet();
        (o.replaceSync(r.themeCSS),
          (e =
            ji(o) +
            `
`));
      } else
        e += `${r.themeCSS}
`;
    return e + ji(i);
  }, 'createCssStyles'),
  vC = d(
    (r, t) =>
      Wh(
        Vh(`${r}{${t}}`),
        zh([
          d(function (e, o, a, s) {
            if (e.type === 'rule' && Array.isArray(e.props)) {
              if (e.parent && e.parent.type === Qe) return;
              e.props = e.props.map((l) => (l.startsWith(r) ? l : `${r} ${l}`));
            } else
              e.type.startsWith('@') &&
                ([...[Hh, Yh, jh, Xh, '@container', '@starting-style'], Qe].includes(e.type) ||
                  (F.warn(`Removing unsupported at-rule ${e.type} from CSS`), (e.type = Uh)));
          }, 'addNamespace'),
          Nh,
        ]),
      ),
    'compileCSS',
  ),
  LC = d((r, t, i, e) => {
    const o = wC(r, i),
      a = od(t, o, { ...r.themeVariables, theme: r.theme, look: r.look }, e);
    return vC(e, a);
  }, 'createUserStyles'),
  FC = d((r = '', t, i) => {
    let e = r;
    return (
      !i && !t && (e = e.replace(/marker-end="url\([\d+./:=?A-Za-z-]*?#/g, 'marker-end="url(#')),
      (e = cr(e)),
      (e = e.replace(/<br>/g, '<br/>')),
      e
    );
  }, 'cleanUpSvgCode'),
  _C = d((r = '', t) => {
    const i = t?.viewBox?.baseVal?.height ? t.viewBox.baseVal.height + 'px' : yC,
      e = _h(`<body style="${bC}">${r}</body>`);
    return `<iframe style="width:${CC};height:${i};${xC}" src="data:text/html;charset=UTF-8;base64,${e}" sandbox="${kC}">
  ${BC}
</iframe>`;
  }, 'putIntoIFrame'),
  Ao = d((r, t, i, e, o) => {
    const a = r.append('div');
    (a.attr('id', i), e && a.attr('style', e));
    const s = a.append('svg').attr('id', t).attr('width', '100%').attr('xmlns', pC);
    return (o && s.attr('xmlns:xlink', o), s.append('g'), r);
  }, 'appendDivSvgG');
function ye(r, t) {
  return r
    .append('iframe')
    .attr('id', t)
    .attr('style', 'width: 100%; height: 100%;')
    .attr('sandbox', '');
}
d(ye, 'sandboxedIframe');
var AC = d((r, t, i, e) => {
    (r.getElementById(t)?.remove(), r.getElementById(i)?.remove(), r.getElementById(e)?.remove());
  }, 'removeExistingElements'),
  EC = d(async function (r, t, i) {
    Oi();
    const e = Ge(t);
    t = e.code;
    const o = at();
    (F.debug(o), t.length > (o?.maxTextSize ?? cC) && (t = dC));
    const a = `#${r}`,
      s = 'i' + r,
      l = '#' + s,
      n = 'd' + r,
      g = '#' + n,
      c = d(() => {
        const D = K(p ? l : g).node();
        D && 'remove' in D && D.remove();
      }, 'removeTempElements');
    let h = K(document.body);
    const p = o.securityLevel === gC,
      u = o.securityLevel === uC,
      f = o.fontFamily;
    if (i !== void 0) {
      if ((i && (i.innerHTML = ''), p)) {
        const $ = ye(K(i), s);
        ((h = K($.nodes()[0].contentDocument.body)), (h.node().style.margin = '0'));
      } else h = K(i);
      Ao(h, r, n, `font-family: ${f}`, fC);
    } else {
      if ((AC(document, r, n, s), p)) {
        const $ = ye(K(document.body), s);
        ((h = K($.nodes()[0].contentDocument.body)), (h.node().style.margin = '0'));
      } else h = K('body');
      Ao(h, r, n);
    }
    let C, x;
    try {
      C = await Ce.fromText(t, { title: e.title });
    } catch ($) {
      if (o.suppressErrorRendering) throw (c(), $);
      ((C = await Ce.fromText('error')), (x = $));
    }
    const y = h.select(g).node(),
      b = C.type,
      k = y.firstChild,
      S = k.firstChild,
      T = C.renderer.getClasses?.(t, C),
      L = LC(o, b, T, a),
      A = document.createElement('style');
    ((A.innerHTML = L), k.insertBefore(A, S));
    try {
      await C.renderer.draw(t, r, '11.15.0', C);
    } catch ($) {
      throw (o.suppressErrorRendering ? c() : Zf.draw(t, r, '11.15.0'), $);
    }
    const _ = h.select(`${g} svg`),
      M = C.db.getAccTitle?.(),
      E = C.db.getAccDescription?.();
    (Oh(b, _, M, E), h.select(`[id="${r}"]`).selectAll('foreignobject > *').attr('xmlns', mC));
    let O = h.select(g).node().innerHTML;
    if (
      (F.debug('config.arrowMarkerAbsolute', o.arrowMarkerAbsolute),
      (O = FC(O, p, jt(o.arrowMarkerAbsolute))),
      p)
    ) {
      const $ = h.select(g + ' svg').node();
      O = _C(O, $);
    } else
      u ||
        (O = Mr.sanitize(O, {
          ADD_TAGS: TC,
          ADD_ATTR: SC,
          HTML_INTEGRATION_POINTS: { foreignobject: !0 },
        }));
    if ((aC(), x)) throw x;
    return (c(), { diagramType: b, svg: O, bindFunctions: C.db.bindFunctions });
  }, 'render');
function Eh(r = {}) {
  const t = ht({}, r);
  (t?.fontFamily &&
    !t.themeVariables?.fontFamily &&
    (t.themeVariables || (t.themeVariables = {}), (t.themeVariables.fontFamily = t.fontFamily)),
    Pc(t),
    t?.theme && t.theme in zt
      ? (t.themeVariables = zt[t.theme].getThemeVariables(t.themeVariables))
      : t && (t.themeVariables = zt.default.getThemeVariables(t.themeVariables)));
  const i = typeof t == 'object' ? $c(t) : Qo();
  (xe(i.logLevel), Oi());
}
d(Eh, 'initialize');
var Mh = d((r, t = {}) => {
  const { code: i } = Ve(r);
  return Ce.fromText(i, t);
}, 'getDiagramFromText');
function Oh(r, t, i, e) {
  (vh(t, r), Lh(t, i, e, t.attr('id')));
}
d(Oh, 'addA11yInfo');
var dr = Object.freeze({
  render: EC,
  parse: Ah,
  getDiagramFromText: Mh,
  initialize: Eh,
  getConfig: at,
  setConfig: Zo,
  getSiteConfig: Qo,
  updateSiteConfig: qc,
  reset: d(() => {
    pi();
  }, 'reset'),
  globalReset: d(() => {
    pi(Or);
  }, 'globalReset'),
  defaultConfig: Or,
});
xe(at().logLevel);
pi(at());
var MC = d((r, t, i) => {
    (F.warn(r),
      Ne(r)
        ? (i && i(r.str, r.hash), t.push({ ...r, message: r.str, error: r }))
        : (i && i(r),
          r instanceof Error &&
            t.push({ str: r.message, message: r.message, hash: r.name, error: r })));
  }, 'handleError'),
  Ih = d(async function (r = { querySelector: '.mermaid' }) {
    try {
      await OC(r);
    } catch (t) {
      if ((Ne(t) && F.error(t.str), Yt.parseError && Yt.parseError(t), !r.suppressErrors))
        throw (F.error('Use the suppressErrors option to suppress these errors'), t);
    }
  }, 'run'),
  OC = d(async function (
    { postRenderCallback: r, querySelector: t, nodes: i } = { querySelector: '.mermaid' },
  ) {
    const e = dr.getConfig();
    F.debug(`${r ? '' : 'No '}Callback function found`);
    let o;
    if (i) o = i;
    else if (t) o = document.querySelectorAll(t);
    else throw new Error('Nodes and querySelector are both undefined');
    (F.debug(`Found ${o.length} diagrams`),
      e?.startOnLoad !== void 0 &&
        (F.debug('Start On Load: ' + e?.startOnLoad),
        dr.updateSiteConfig({ startOnLoad: e?.startOnLoad })));
    const a = new Ft.InitIDGenerator(e.deterministicIds, e.deterministicIDSeed);
    let s;
    const l = [];
    for (const n of Array.from(o)) {
      if ((F.info('Rendering diagram: ' + n.id), n.getAttribute('data-processed'))) continue;
      n.setAttribute('data-processed', 'true');
      const g = `mermaid-${a.next()}`;
      ((s = n.innerHTML),
        (s = No(Ft.entityDecode(s))
          .trim()
          .replace(/<br\s*\/?>/gi, '<br/>')));
      const c = Ft.detectInit(s);
      c && F.debug('Detected early reinit: ', c);
      try {
        const { svg: h, bindFunctions: p } = await qh(g, s, n);
        ((n.innerHTML = h), r && (await r(g)), p && p(n));
      } catch (h) {
        MC(h, l, Yt.parseError);
      }
    }
    if (l.length > 0) throw l[0];
  }, 'runThrowsErrors'),
  Dh = d(function (r) {
    dr.initialize(r);
  }, 'initialize'),
  IC = d(async function (r, t, i) {
    (F.warn('mermaid.init is deprecated. Please use run instead.'), r && Dh(r));
    const e = { postRenderCallback: i, querySelector: '.mermaid' };
    (typeof t == 'string'
      ? (e.querySelector = t)
      : t && (t instanceof HTMLElement ? (e.nodes = [t]) : (e.nodes = t)),
      await Ih(e));
  }, 'init'),
  DC = d(async (r, { lazyLoad: t = !0 } = {}) => {
    (Oi(), zi(...r), t === !1 && (await eC()));
  }, 'registerExternalDiagrams'),
  $h = d(function () {
    if (Yt.startOnLoad) {
      const { startOnLoad: r } = dr.getConfig();
      r && Yt.run().catch((t) => F.error('Mermaid failed to initialize', t));
    }
  }, 'contentLoaded');
typeof document < 'u' && window.addEventListener('load', $h, !1);
var $C = d(function (r) {
    Yt.parseError = r;
  }, 'setParseErrorHandler'),
  wi = [],
  Ri = !1,
  Ph = d(async () => {
    if (!Ri) {
      for (Ri = !0; wi.length > 0; ) {
        const r = wi.shift();
        if (r)
          try {
            await r();
          } catch (t) {
            F.error('Error executing queue', t);
          }
      }
      Ri = !1;
    }
  }, 'executeQueue'),
  PC = d(
    async (r, t) =>
      new Promise((i, e) => {
        const o = d(
          () =>
            new Promise((a, s) => {
              dr.parse(r, t).then(
                (l) => {
                  (a(l), i(l));
                },
                (l) => {
                  (F.error('Error parsing', l), Yt.parseError?.(l), s(l), e(l));
                },
              );
            }),
          'performCall',
        );
        (wi.push(o), Ph().catch(e));
      }),
    'parse',
  ),
  qh = d(
    (r, t, i) =>
      new Promise((e, o) => {
        const a = d(
          () =>
            new Promise((s, l) => {
              dr.render(r, t, i).then(
                (n) => {
                  (s(n), e(n));
                },
                (n) => {
                  (F.error('Error parsing', n), Yt.parseError?.(n), l(n), o(n));
                },
              );
            }),
          'performCall',
        );
        (wi.push(a), Ph().catch(o));
      }),
    'render',
  ),
  qC = d(() => Object.keys(lr).map((r) => ({ id: r })), 'getRegisteredDiagramsMetadata'),
  Yt = {
    startOnLoad: !0,
    mermaidAPI: dr,
    parse: PC,
    render: qh,
    init: IC,
    run: Ih,
    registerExternalDiagrams: DC,
    registerLayoutLoaders: Xn,
    initialize: Dh,
    parseError: void 0,
    contentLoaded: $h,
    setParseErrorHandler: $C,
    detectType: be,
    registerIconPacks: Bu,
    getRegisteredDiagramsMetadata: qC,
  },
  RC = Yt;
const iy = Object.defineProperty({ __proto__: null, default: RC }, Symbol.toStringTag, {
  value: 'Module',
});
export {
  QC as $,
  at as A,
  ud as B,
  He as C,
  Go as D,
  hu as E,
  md as F,
  _i as G,
  yc as H,
  Su as I,
  Bg as J,
  Xr as K,
  jC as L,
  Uc as M,
  aa as N,
  to as O,
  nu as P,
  rd as Q,
  la as R,
  Ou as S,
  Nn as T,
  ZC as U,
  ze as V,
  H as W,
  al as X,
  Dp as Y,
  tu as Z,
  d as _,
  ld as a,
  JC as a0,
  GC as a1,
  Y as a2,
  KC as a3,
  Ye as a4,
  cp as a5,
  ap as a6,
  op as a7,
  $e as a8,
  Ie as a9,
  Rr as aA,
  tl as aB,
  cr as aC,
  ol as aD,
  YC as aE,
  ei as aF,
  Bu as aG,
  ku as aH,
  RC as aI,
  iy as aJ,
  ci as aa,
  qg as ab,
  Pg as ac,
  $g as ad,
  Dg as ae,
  Lg as af,
  Ys as ag,
  Ag as ah,
  vg as ai,
  Og as aj,
  js as ak,
  _g as al,
  zg as am,
  Wg as an,
  Rg as ao,
  Hg as ap,
  Ng as aq,
  Fg as ar,
  Xs as as,
  Ig as at,
  Mg as au,
  Eg as av,
  Us as aw,
  Sg as ax,
  kt as ay,
  Xt as az,
  sd as b,
  it as c,
  sa as d,
  ht as e,
  Ht as f,
  hd as g,
  At as h,
  ti as i,
  il as j,
  Jr as k,
  F as l,
  XC as m,
  ry as n,
  cd as o,
  dd as p,
  Tg as q,
  ty as r,
  nd as s,
  Ju as t,
  Ft as u,
  VC as v,
  gu as w,
  ad as x,
  UC as y,
  cc as z,
};
