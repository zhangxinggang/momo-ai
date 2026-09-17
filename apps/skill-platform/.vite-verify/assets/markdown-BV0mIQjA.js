import './icons-B5Lu0sqU.js';
import { ad as $e, b5 as Se, aO as we, aQ as ye } from './index-C2avURFS.js';
import './markdown-it-vendor-DL4wSELR.js';
import './markdown-vendor-DldLOD9R.js';
import './ui-vendor-C-FKu2uc.js';
function O() {
  return {
    async: !1,
    breaks: !1,
    extensions: null,
    gfm: !0,
    hooks: null,
    pedantic: !1,
    renderer: null,
    silent: !1,
    tokenizer: null,
    walkTokens: null,
  };
}
var z = O();
function oe(r) {
  z = r;
}
var $ = { exec: () => null };
function C(r) {
  let e = [];
  return (t) => {
    let s = Math.max(0, Math.min(3, t - 1)),
      n = e[s];
    return (n || ((n = r(s)), (e[s] = n)), n);
  };
}
function u(r, e = '') {
  let t = typeof r == 'string' ? r : r.source,
    s = {
      replace: (n, l) => {
        let i = typeof l == 'string' ? l : l.source;
        return ((i = i.replace(b.caret, '$1')), (t = t.replace(n, i)), s);
      },
      getRegex: () => new RegExp(t, e),
    };
  return s;
}
var Re = ((r = '') => {
    try {
      return !!new RegExp('(?<=1)(?<!1)' + r);
    } catch {
      return !1;
    }
  })(),
  b = {
    codeRemoveIndent: /^(?: {1,4}| {0,3}\t)/gm,
    outputLinkReplace: /\\([\[\]])/g,
    indentCodeCompensation: /^(\s+)(?:```)/,
    beginningSpace: /^\s+/,
    endingHash: /#$/,
    startingSpaceChar: /^ /,
    endingSpaceChar: / $/,
    nonSpaceChar: /[^ ]/,
    newLineCharGlobal: /\n/g,
    tabCharGlobal: /\t/g,
    multipleSpaceGlobal: /\s+/g,
    blankLine: /^[ \t]*$/,
    doubleBlankLine: /\n[ \t]*\n[ \t]*$/,
    blockquoteStart: /^ {0,3}>/,
    blockquoteSetextReplace: /\n {0,3}((?:=+|-+) *)(?=\n|$)/g,
    blockquoteSetextReplace2: /^ {0,3}>[ \t]?/gm,
    listReplaceNesting: /^ {1,4}(?=( {4})*[^ ])/g,
    listIsTask: /^\[[ xX]\] +\S/,
    listReplaceTask: /^\[[ xX]\] +/,
    listTaskCheckbox: /\[[ xX]\]/,
    anyLine: /\n.*\n/,
    hrefBrackets: /^<(.*)>$/,
    tableDelimiter: /[:|]/,
    tableAlignChars: /^\||\| *$/g,
    tableRowBlankLine: /\n[ \t]*$/,
    tableAlignRight: /^ *-+: *$/,
    tableAlignCenter: /^ *:-+: *$/,
    tableAlignLeft: /^ *:-+ *$/,
    startATag: /^<a /i,
    endATag: /^<\/a>/i,
    startPreScriptTag: /^<(pre|code|kbd|script)(\s|>)/i,
    endPreScriptTag: /^<\/(pre|code|kbd|script)(\s|>)/i,
    startAngleBracket: /^</,
    endAngleBracket: />$/,
    pedanticHrefTitle: /^([^'"]*[^\s])\s+(['"])(.*)\2/,
    unicodeAlphaNumeric: /[\p{L}\p{N}]/u,
    escapeTest: /[&<>"']/,
    escapeReplace: /[&<>"']/g,
    escapeTestNoEncode: /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/,
    escapeReplaceNoEncode: /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g,
    caret: /(^|[^\[])\^/g,
    percentDecode: /%25/g,
    findPipe: /\|/g,
    splitPipe: / \|/,
    slashPipe: /\\\|/g,
    carriageReturn: /\r\n|\r/g,
    spaceLine: /^ +$/gm,
    notSpaceStart: /^\S*/,
    endingNewline: /\n$/,
    listItemRegex: (r) => new RegExp(`^( {0,3}${r})((?:[	 ][^\\n]*)?(?:\\n|$))`),
    nextBulletRegex: C(
      (r) => new RegExp(`^ {0,${r}}(?:[*+-]|\\d{1,9}[.)])((?:[ 	][^\\n]*)?(?:\\n|$))`),
    ),
    hrRegex: C((r) => new RegExp(`^ {0,${r}}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)`)),
    fencesBeginRegex: C((r) => new RegExp(`^ {0,${r}}(?:\`\`\`|~~~)`)),
    headingBeginRegex: C((r) => new RegExp(`^ {0,${r}}#`)),
    htmlBeginRegex: C((r) => new RegExp(`^ {0,${r}}<(?:[a-z].*>|!--)`, 'i')),
    blockquoteBeginRegex: C((r) => new RegExp(`^ {0,${r}}>`)),
  },
  ze = /^(?:[ \t]*(?:\n|$))+/,
  Ce = /^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/,
  Te =
    /^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/,
  _ = /^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/,
  ve = /^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/,
  H = / {0,3}(?:[*+-]|\d{1,9}[.)])/,
  ce =
    /^(?!bull |blockCode|fences|blockquote|heading|html|table)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html|table))+?)\n {0,3}(=+|-+) *(?:\n+|$)/,
  pe = u(ce)
    .replace(/bull/g, H)
    .replace(/blockCode/g, /(?: {4}| {0,3}\t)/)
    .replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/)
    .replace(/blockquote/g, / {0,3}>/)
    .replace(/heading/g, / {0,3}#{1,6}/)
    .replace(/html/g, / {0,3}<[^\n>]+>\n/)
    .replace(/\|table/g, '')
    .getRegex(),
  Ae = u(ce)
    .replace(/bull/g, H)
    .replace(/blockCode/g, /(?: {4}| {0,3}\t)/)
    .replace(/fences/g, / {0,3}(?:`{3,}|~{3,})/)
    .replace(/blockquote/g, / {0,3}>/)
    .replace(/heading/g, / {0,3}#{1,6}/)
    .replace(/html/g, / {0,3}<[^\n>]+>\n/)
    .replace(/table/g, / {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n/)
    .getRegex(),
  j = /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/,
  Pe = /^[^\n]+/,
  F = /(?!\s*\])(?:\\[\s\S]|[^\[\]\\])+/,
  _e = u(
    /^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/,
  )
    .replace('label', F)
    .replace('title', /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/)
    .getRegex(),
  Le = u(/^(bull)([ \t][^\n]*?)?(?:\n|$)/)
    .replace(/bull/g, H)
    .getRegex(),
  B =
    'address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul',
  G = /<!--(?:-?>|[\s\S]*?(?:-->|$))/,
  Ie = u(
    '^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>\\n*|$)|<![A-Z][\\s\\S]*?(?:>\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$))',
    'i',
  )
    .replace('comment', G)
    .replace('tag', B)
    .replace(
      'attribute',
      / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/,
    )
    .getRegex(),
  he = u(j)
    .replace('hr', _)
    .replace('heading', ' {0,3}#{1,6}(?:\\s|$)')
    .replace('|lheading', '')
    .replace('|table', '')
    .replace('blockquote', ' {0,3}>')
    .replace('fences', ' {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n')
    .replace('list', ' {0,3}(?:[*+-]|1[.)])[ \\t]+[^ \\t\\n]')
    .replace('html', '</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)')
    .replace('tag', B)
    .getRegex(),
  Ee = u(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/)
    .replace('paragraph', he)
    .getRegex(),
  X = {
    blockquote: Ee,
    code: Ce,
    def: _e,
    fences: Te,
    heading: ve,
    hr: _,
    html: Ie,
    lheading: pe,
    list: Le,
    newline: ze,
    paragraph: he,
    table: $,
    text: Pe,
  },
  ee = u(
    '^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)',
  )
    .replace('hr', _)
    .replace('heading', ' {0,3}#{1,6}(?:\\s|$)')
    .replace('blockquote', ' {0,3}>')
    .replace('code', '(?: {4}| {0,3}	)[^\\n]')
    .replace('fences', ' {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n')
    .replace('list', ' {0,3}(?:[*+-]|1[.)])[ \\t]')
    .replace('html', '</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)')
    .replace('tag', B)
    .getRegex(),
  qe = {
    ...X,
    lheading: Ae,
    table: ee,
    paragraph: u(j)
      .replace('hr', _)
      .replace('heading', ' {0,3}#{1,6}(?:\\s|$)')
      .replace('|lheading', '')
      .replace('table', ee)
      .replace('blockquote', ' {0,3}>')
      .replace('fences', ' {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n')
      .replace('list', ' {0,3}(?:[*+-]|1[.)])[ \\t]+[^ \\t\\n]')
      .replace('html', '</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)')
      .replace('tag', B)
      .getRegex(),
  },
  Be = {
    ...X,
    html: u(
      `^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`,
    )
      .replace('comment', G)
      .replace(
        /tag/g,
        '(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b',
      )
      .getRegex(),
    def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,
    heading: /^(#{1,6})(.*)(?:\n+|$)/,
    fences: $,
    lheading: /^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,
    paragraph: u(j)
      .replace('hr', _)
      .replace(
        'heading',
        ` *#{1,6} *[^
]`,
      )
      .replace('lheading', pe)
      .replace('|table', '')
      .replace('blockquote', ' {0,3}>')
      .replace('|fences', '')
      .replace('|list', '')
      .replace('|html', '')
      .replace('|tag', '')
      .getRegex(),
  },
  Ze = /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/,
  Me = /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/,
  ue = /^( {2,}|\\)\n(?!\s*$)/,
  De = /^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/,
  T = /[\p{P}\p{S}]/u,
  Z = /[\s\p{P}\p{S}]/u,
  V = /[^\s\p{P}\p{S}]/u,
  Qe = u(/^((?![*_])punctSpace)/, 'u')
    .replace(/punctSpace/g, Z)
    .getRegex(),
  de = /(?!~)[\p{P}\p{S}]/u,
  Ne = /(?!~)[\s\p{P}\p{S}]/u,
  Oe = /(?:[^\s\p{P}\p{S}]|~)/u,
  He = u(/link|precode-code|html/, 'g')
    .replace(
      'link',
      /\[(?:[^\[\]`]|(?<a>`+)[^`]+\k<a>(?!`))*?\]\((?:\\[\s\S]|[^\\\(\)]|\((?:\\[\s\S]|[^\\\(\)])*\))*\)/,
    )
    .replace('precode-', Re ? '(?<!`)()' : '(^^|[^`])')
    .replace('code', /(?<b>`+)[^`]+\k<b>(?!`)/)
    .replace('html', /<(?! )[^<>]*?>/)
    .getRegex(),
  ge = /^(?:\*+(?:((?!\*)punct)|([^\s*]))?)|^_+(?:((?!_)punct)|([^\s_]))?/,
  je = u(ge, 'u').replace(/punct/g, T).getRegex(),
  Fe = u(ge, 'u').replace(/punct/g, de).getRegex(),
  ke =
    '^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)punctSpace(\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|notPunctSpace(\\*+)(?=notPunctSpace)',
  Ge = u(ke, 'gu')
    .replace(/notPunctSpace/g, V)
    .replace(/punctSpace/g, Z)
    .replace(/punct/g, T)
    .getRegex(),
  Xe = u(ke, 'gu')
    .replace(/notPunctSpace/g, Oe)
    .replace(/punctSpace/g, Ne)
    .replace(/punct/g, de)
    .getRegex(),
  Ve = u(
    '^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)punctSpace(_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)',
    'gu',
  )
    .replace(/notPunctSpace/g, V)
    .replace(/punctSpace/g, Z)
    .replace(/punct/g, T)
    .getRegex(),
  We = u(/^~~?(?:((?!~)punct)|[^\s~])/, 'u')
    .replace(/punct/g, T)
    .getRegex(),
  Ue =
    '^[^~]+(?=[^~])|(?!~)punct(~~?)(?=[\\s]|$)|notPunctSpace(~~?)(?!~)(?=punctSpace|$)|(?!~)punctSpace(~~?)(?=notPunctSpace)|[\\s](~~?)(?!~)(?=punct)|(?!~)punct(~~?)(?!~)(?=punct)|notPunctSpace(~~?)(?=notPunctSpace)',
  Je = u(Ue, 'gu')
    .replace(/notPunctSpace/g, V)
    .replace(/punctSpace/g, Z)
    .replace(/punct/g, T)
    .getRegex(),
  Ke = u(/\\(punct)/, 'gu')
    .replace(/punct/g, T)
    .getRegex(),
  Ye = u(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/)
    .replace('scheme', /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/)
    .replace(
      'email',
      /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/,
    )
    .getRegex(),
  et = u(G).replace('(?:-->|$)', '-->').getRegex(),
  tt = u(
    '^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>',
  )
    .replace('comment', et)
    .replace(
      'attribute',
      /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/,
    )
    .getRegex(),
  I = /(?:\[(?:\\[\s\S]|[^\[\]\\])*\]|\\[\s\S]|`+(?!`)[^`]*?`+(?!`)|``+(?=\])|[^\[\]\\`])*?/,
  rt = u(/^!?\[(label)\]\(\s*(href)(?:(?:[ \t]+(?:\n[ \t]*)?|\n[ \t]*)(title))?\s*\)/)
    .replace('label', I)
    .replace('href', /<(?:\\.|[^\n<>\\])+>|[^ \t\n\x00-\x1f]*/)
    .replace('title', /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/)
    .getRegex(),
  fe = u(/^!?\[(label)\]\[(ref)\]/)
    .replace('label', I)
    .replace('ref', F)
    .getRegex(),
  be = u(/^!?\[(ref)\](?:\[\])?/)
    .replace('ref', F)
    .getRegex(),
  nt = u('reflink|nolink(?!\\()', 'g').replace('reflink', fe).replace('nolink', be).getRegex(),
  te = /[hH][tT][tT][pP][sS]?|[fF][tT][pP]/,
  W = {
    _backpedal: $,
    anyPunctuation: Ke,
    autolink: Ye,
    blockSkip: He,
    br: ue,
    code: Me,
    del: $,
    delLDelim: $,
    delRDelim: $,
    emStrongLDelim: je,
    emStrongRDelimAst: Ge,
    emStrongRDelimUnd: Ve,
    escape: Ze,
    link: rt,
    nolink: be,
    punctuation: Qe,
    reflink: fe,
    reflinkSearch: nt,
    tag: tt,
    text: De,
    url: $,
  },
  st = {
    ...W,
    link: u(/^!?\[(label)\]\((.*?)\)/)
      .replace('label', I)
      .getRegex(),
    reflink: u(/^!?\[(label)\]\s*\[([^\]]*)\]/)
      .replace('label', I)
      .getRegex(),
  },
  D = {
    ...W,
    emStrongRDelimAst: Xe,
    emStrongLDelim: Fe,
    delLDelim: We,
    delRDelim: Je,
    url: u(/^((?:protocol):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/)
      .replace('protocol', te)
      .replace('email', /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/)
      .getRegex(),
    _backpedal: /(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,
    del: /^(~~?)(?=[^\s~])((?:\\[\s\S]|[^\\])*?(?:\\[\s\S]|[^\s~\\]))\1(?=[^~]|$)/,
    text: u(
      /^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|protocol:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/,
    )
      .replace('protocol', te)
      .getRegex(),
  },
  lt = {
    ...D,
    br: u(ue).replace('{2,}', '*').getRegex(),
    text: u(D.text)
      .replace('\\b_', '\\b_| {2,}\\n')
      .replace(/\{2,\}/g, '*')
      .getRegex(),
  },
  L = { normal: X, gfm: qe, pedantic: Be },
  A = { normal: W, gfm: D, breaks: lt, pedantic: st },
  it = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' },
  re = (r) => it[r];
function w(r, e) {
  if (e) {
    if (b.escapeTest.test(r)) return r.replace(b.escapeReplace, re);
  } else if (b.escapeTestNoEncode.test(r)) return r.replace(b.escapeReplaceNoEncode, re);
  return r;
}
function ne(r) {
  try {
    r = encodeURI(r).replace(b.percentDecode, '%');
  } catch {
    return null;
  }
  return r;
}
function se(r, e) {
  let t = r.replace(b.findPipe, (l, i, a) => {
      let c = !1,
        o = i;
      for (; --o >= 0 && a[o] === '\\'; ) c = !c;
      return c ? '|' : ' |';
    }),
    s = t.split(b.splitPipe),
    n = 0;
  if ((s[0].trim() || s.shift(), s.length > 0 && !s.at(-1)?.trim() && s.pop(), e))
    if (s.length > e) s.splice(e);
    else for (; s.length < e; ) s.push('');
  for (; n < s.length; n++) s[n] = s[n].trim().replace(b.slashPipe, '|');
  return s;
}
function S(r, e, t) {
  let s = r.length;
  if (s === 0) return '';
  let n = 0;
  for (; n < s && r.charAt(s - n - 1) === e; ) n++;
  return r.slice(0, s - n);
}
function le(r) {
  let e = r.split(`
`),
    t = e.length - 1;
  for (; t >= 0 && b.blankLine.test(e[t]); ) t--;
  return e.length - t <= 2
    ? r
    : e.slice(0, t + 1).join(`
`);
}
function at(r, e) {
  if (r.indexOf(e[1]) === -1) return -1;
  let t = 0;
  for (let s = 0; s < r.length; s++)
    if (r[s] === '\\') s++;
    else if (r[s] === e[0]) t++;
    else if (r[s] === e[1] && (t--, t < 0)) return s;
  return t > 0 ? -2 : -1;
}
function ot(r, e = 0) {
  let t = e,
    s = '';
  for (let n of r)
    if (n === '	') {
      let l = 4 - (t % 4);
      ((s += ' '.repeat(l)), (t += l));
    } else ((s += n), t++);
  return s;
}
function ie(r, e, t, s, n) {
  let l = e.href,
    i = e.title || null,
    a = r[1].replace(n.other.outputLinkReplace, '$1');
  s.state.inLink = !0;
  let c = {
    type: r[0].charAt(0) === '!' ? 'image' : 'link',
    raw: t,
    href: l,
    title: i,
    text: a,
    tokens: s.inlineTokens(a),
  };
  return ((s.state.inLink = !1), c);
}
function ct(r, e, t) {
  let s = r.match(t.other.indentCodeCompensation);
  if (s === null) return e;
  let n = s[1];
  return e
    .split(
      `
`,
    )
    .map((l) => {
      let i = l.match(t.other.beginningSpace);
      if (i === null) return l;
      let [a] = i;
      return a.length >= n.length ? l.slice(n.length) : l;
    }).join(`
`);
}
var E = class {
    options;
    rules;
    lexer;
    constructor(r) {
      this.options = r || z;
    }
    space(r) {
      let e = this.rules.block.newline.exec(r);
      if (e && e[0].length > 0) return { type: 'space', raw: e[0] };
    }
    code(r) {
      let e = this.rules.block.code.exec(r);
      if (e) {
        let t = this.options.pedantic ? e[0] : le(e[0]),
          s = t.replace(this.rules.other.codeRemoveIndent, '');
        return { type: 'code', raw: t, codeBlockStyle: 'indented', text: s };
      }
    }
    fences(r) {
      let e = this.rules.block.fences.exec(r);
      if (e) {
        let t = e[0],
          s = ct(t, e[3] || '', this.rules);
        return {
          type: 'code',
          raw: t,
          lang: e[2] ? e[2].trim().replace(this.rules.inline.anyPunctuation, '$1') : e[2],
          text: s,
        };
      }
    }
    heading(r) {
      let e = this.rules.block.heading.exec(r);
      if (e) {
        let t = e[2].trim();
        if (this.rules.other.endingHash.test(t)) {
          let s = S(t, '#');
          (this.options.pedantic || !s || this.rules.other.endingSpaceChar.test(s)) &&
            (t = s.trim());
        }
        return {
          type: 'heading',
          raw: S(
            e[0],
            `
`,
          ),
          depth: e[1].length,
          text: t,
          tokens: this.lexer.inline(t),
        };
      }
    }
    hr(r) {
      let e = this.rules.block.hr.exec(r);
      if (e)
        return {
          type: 'hr',
          raw: S(
            e[0],
            `
`,
          ),
        };
    }
    blockquote(r) {
      let e = this.rules.block.blockquote.exec(r);
      if (e) {
        let t = S(
            e[0],
            `
`,
          ).split(`
`),
          s = '',
          n = '',
          l = [];
        for (; t.length > 0; ) {
          let i = !1,
            a = [],
            c;
          for (c = 0; c < t.length; c++)
            if (this.rules.other.blockquoteStart.test(t[c])) (a.push(t[c]), (i = !0));
            else if (!i) a.push(t[c]);
            else break;
          t = t.slice(c);
          let o = a.join(`
`),
            h = o
              .replace(
                this.rules.other.blockquoteSetextReplace,
                `
    $1`,
              )
              .replace(this.rules.other.blockquoteSetextReplace2, '');
          ((s = s
            ? `${s}
${o}`
            : o),
            (n = n
              ? `${n}
${h}`
              : h));
          let p = this.lexer.state.top;
          if (
            ((this.lexer.state.top = !0),
            this.lexer.blockTokens(h, l, !0),
            (this.lexer.state.top = p),
            t.length === 0)
          )
            break;
          let d = l.at(-1);
          if (d?.type === 'code') break;
          if (d?.type === 'blockquote') {
            let f = d,
              k =
                f.raw +
                `
` +
                t.join(`
`),
              y = this.blockquote(k);
            ((l[l.length - 1] = y),
              (s = s.substring(0, s.length - f.raw.length) + y.raw),
              (n = n.substring(0, n.length - f.text.length) + y.text));
            break;
          } else if (d?.type === 'list') {
            let f = d,
              k =
                f.raw +
                `
` +
                t.join(`
`),
              y = this.list(k);
            ((l[l.length - 1] = y),
              (s = s.substring(0, s.length - d.raw.length) + y.raw),
              (n = n.substring(0, n.length - f.raw.length) + y.raw),
              (t = k.substring(l.at(-1).raw.length).split(`
`)));
            continue;
          }
        }
        return { type: 'blockquote', raw: s, tokens: l, text: n };
      }
    }
    list(r) {
      let e = this.rules.block.list.exec(r);
      if (e) {
        let t = e[1].trim(),
          s = t.length > 1,
          n = {
            type: 'list',
            raw: '',
            ordered: s,
            start: s ? +t.slice(0, -1) : '',
            loose: !1,
            items: [],
          };
        ((t = s ? `\\d{1,9}\\${t.slice(-1)}` : `\\${t}`),
          this.options.pedantic && (t = s ? t : '[*+-]'));
        let l = this.rules.other.listItemRegex(t),
          i = !1;
        for (; r; ) {
          let c = !1,
            o = '',
            h = '';
          if (!(e = l.exec(r)) || this.rules.block.hr.test(r)) break;
          ((o = e[0]), (r = r.substring(o.length)));
          let p = ot(
              e[2].split(
                `
`,
                1,
              )[0],
              e[1].length,
            ),
            d = r.split(
              `
`,
              1,
            )[0],
            f = !p.trim(),
            k = 0;
          if (
            (this.options.pedantic
              ? ((k = 2), (h = p.trimStart()))
              : f
                ? (k = e[1].length + 1)
                : ((k = p.search(this.rules.other.nonSpaceChar)),
                  (k = k > 4 ? 1 : k),
                  (h = p.slice(k)),
                  (k += e[1].length)),
            f &&
              this.rules.other.blankLine.test(d) &&
              ((o +=
                d +
                `
`),
              (r = r.substring(d.length + 1)),
              (c = !0)),
            !c)
          ) {
            let y = this.rules.other.nextBulletRegex(k),
              J = this.rules.other.hrRegex(k),
              K = this.rules.other.fencesBeginRegex(k),
              Y = this.rules.other.headingBeginRegex(k),
              xe = this.rules.other.htmlBeginRegex(k),
              me = this.rules.other.blockquoteBeginRegex(k);
            for (; r; ) {
              let M = r.split(
                  `
`,
                  1,
                )[0],
                v;
              if (
                ((d = M),
                this.options.pedantic
                  ? ((d = d.replace(this.rules.other.listReplaceNesting, '  ')), (v = d))
                  : (v = d.replace(this.rules.other.tabCharGlobal, '    ')),
                K.test(d) || Y.test(d) || xe.test(d) || me.test(d) || y.test(d) || J.test(d))
              )
                break;
              if (v.search(this.rules.other.nonSpaceChar) >= k || !d.trim())
                h +=
                  `
` + v.slice(k);
              else {
                if (
                  f ||
                  p
                    .replace(this.rules.other.tabCharGlobal, '    ')
                    .search(this.rules.other.nonSpaceChar) >= 4 ||
                  K.test(p) ||
                  Y.test(p) ||
                  J.test(p)
                )
                  break;
                h +=
                  `
` + d;
              }
              ((f = !d.trim()),
                (o +=
                  M +
                  `
`),
                (r = r.substring(M.length + 1)),
                (p = v.slice(k)));
            }
          }
          (n.loose || (i ? (n.loose = !0) : this.rules.other.doubleBlankLine.test(o) && (i = !0)),
            n.items.push({
              type: 'list_item',
              raw: o,
              task: !!this.options.gfm && this.rules.other.listIsTask.test(h),
              loose: !1,
              text: h,
              tokens: [],
            }),
            (n.raw += o));
        }
        let a = n.items.at(-1);
        if (a) ((a.raw = a.raw.trimEnd()), (a.text = a.text.trimEnd()));
        else return;
        n.raw = n.raw.trimEnd();
        for (let c of n.items) {
          ((this.lexer.state.top = !1), (c.tokens = this.lexer.blockTokens(c.text, [])));
          let o = c.tokens[0];
          if (c.task && (o?.type === 'text' || o?.type === 'paragraph')) {
            ((c.text = c.text.replace(this.rules.other.listReplaceTask, '')),
              (o.raw = o.raw.replace(this.rules.other.listReplaceTask, '')),
              (o.text = o.text.replace(this.rules.other.listReplaceTask, '')));
            for (let p = this.lexer.inlineQueue.length - 1; p >= 0; p--)
              if (this.rules.other.listIsTask.test(this.lexer.inlineQueue[p].src)) {
                this.lexer.inlineQueue[p].src = this.lexer.inlineQueue[p].src.replace(
                  this.rules.other.listReplaceTask,
                  '',
                );
                break;
              }
            let h = this.rules.other.listTaskCheckbox.exec(c.raw);
            if (h) {
              let p = { type: 'checkbox', raw: h[0] + ' ', checked: h[0] !== '[ ]' };
              ((c.checked = p.checked),
                n.loose
                  ? c.tokens[0] &&
                    ['paragraph', 'text'].includes(c.tokens[0].type) &&
                    'tokens' in c.tokens[0] &&
                    c.tokens[0].tokens
                    ? ((c.tokens[0].raw = p.raw + c.tokens[0].raw),
                      (c.tokens[0].text = p.raw + c.tokens[0].text),
                      c.tokens[0].tokens.unshift(p))
                    : c.tokens.unshift({ type: 'paragraph', raw: p.raw, text: p.raw, tokens: [p] })
                  : c.tokens.unshift(p));
            }
          } else c.task && (c.task = !1);
          if (!n.loose) {
            let h = c.tokens.filter((d) => d.type === 'space'),
              p = h.length > 0 && h.some((d) => this.rules.other.anyLine.test(d.raw));
            n.loose = p;
          }
        }
        if (n.loose)
          for (let c of n.items) {
            c.loose = !0;
            for (let o of c.tokens) o.type === 'text' && (o.type = 'paragraph');
          }
        return n;
      }
    }
    html(r) {
      let e = this.rules.block.html.exec(r);
      if (e) {
        let t = le(e[0]);
        return {
          type: 'html',
          block: !0,
          raw: t,
          pre: e[1] === 'pre' || e[1] === 'script' || e[1] === 'style',
          text: t,
        };
      }
    }
    def(r) {
      let e = this.rules.block.def.exec(r);
      if (e) {
        let t = e[1].toLowerCase().replace(this.rules.other.multipleSpaceGlobal, ' '),
          s = e[2]
            ? e[2]
                .replace(this.rules.other.hrefBrackets, '$1')
                .replace(this.rules.inline.anyPunctuation, '$1')
            : '',
          n = e[3]
            ? e[3].substring(1, e[3].length - 1).replace(this.rules.inline.anyPunctuation, '$1')
            : e[3];
        return {
          type: 'def',
          tag: t,
          raw: S(
            e[0],
            `
`,
          ),
          href: s,
          title: n,
        };
      }
    }
    table(r) {
      let e = this.rules.block.table.exec(r);
      if (!e || !this.rules.other.tableDelimiter.test(e[2])) return;
      let t = se(e[1]),
        s = e[2].replace(this.rules.other.tableAlignChars, '').split('|'),
        n = e[3]?.trim()
          ? e[3].replace(this.rules.other.tableRowBlankLine, '').split(`
`)
          : [],
        l = {
          type: 'table',
          raw: S(
            e[0],
            `
`,
          ),
          header: [],
          align: [],
          rows: [],
        };
      if (t.length === s.length) {
        for (let i of s)
          this.rules.other.tableAlignRight.test(i)
            ? l.align.push('right')
            : this.rules.other.tableAlignCenter.test(i)
              ? l.align.push('center')
              : this.rules.other.tableAlignLeft.test(i)
                ? l.align.push('left')
                : l.align.push(null);
        for (let i = 0; i < t.length; i++)
          l.header.push({
            text: t[i],
            tokens: this.lexer.inline(t[i]),
            header: !0,
            align: l.align[i],
          });
        for (let i of n)
          l.rows.push(
            se(i, l.header.length).map((a, c) => ({
              text: a,
              tokens: this.lexer.inline(a),
              header: !1,
              align: l.align[c],
            })),
          );
        return l;
      }
    }
    lheading(r) {
      let e = this.rules.block.lheading.exec(r);
      if (e) {
        let t = e[1].trim();
        return {
          type: 'heading',
          raw: S(
            e[0],
            `
`,
          ),
          depth: e[2].charAt(0) === '=' ? 1 : 2,
          text: t,
          tokens: this.lexer.inline(t),
        };
      }
    }
    paragraph(r) {
      let e = this.rules.block.paragraph.exec(r);
      if (e) {
        let t =
          e[1].charAt(e[1].length - 1) ===
          `
`
            ? e[1].slice(0, -1)
            : e[1];
        return { type: 'paragraph', raw: e[0], text: t, tokens: this.lexer.inline(t) };
      }
    }
    text(r) {
      let e = this.rules.block.text.exec(r);
      if (e) return { type: 'text', raw: e[0], text: e[0], tokens: this.lexer.inline(e[0]) };
    }
    escape(r) {
      let e = this.rules.inline.escape.exec(r);
      if (e) return { type: 'escape', raw: e[0], text: e[1] };
    }
    tag(r) {
      let e = this.rules.inline.tag.exec(r);
      if (e)
        return (
          !this.lexer.state.inLink && this.rules.other.startATag.test(e[0])
            ? (this.lexer.state.inLink = !0)
            : this.lexer.state.inLink &&
              this.rules.other.endATag.test(e[0]) &&
              (this.lexer.state.inLink = !1),
          !this.lexer.state.inRawBlock && this.rules.other.startPreScriptTag.test(e[0])
            ? (this.lexer.state.inRawBlock = !0)
            : this.lexer.state.inRawBlock &&
              this.rules.other.endPreScriptTag.test(e[0]) &&
              (this.lexer.state.inRawBlock = !1),
          {
            type: 'html',
            raw: e[0],
            inLink: this.lexer.state.inLink,
            inRawBlock: this.lexer.state.inRawBlock,
            block: !1,
            text: e[0],
          }
        );
    }
    link(r) {
      let e = this.rules.inline.link.exec(r);
      if (e) {
        let t = e[2].trim();
        if (!this.options.pedantic && this.rules.other.startAngleBracket.test(t)) {
          if (!this.rules.other.endAngleBracket.test(t)) return;
          let l = S(t.slice(0, -1), '\\');
          if ((t.length - l.length) % 2 === 0) return;
        } else {
          let l = at(e[2], '()');
          if (l === -2) return;
          if (l > -1) {
            let i = (e[0].indexOf('!') === 0 ? 5 : 4) + e[1].length + l;
            ((e[2] = e[2].substring(0, l)), (e[0] = e[0].substring(0, i).trim()), (e[3] = ''));
          }
        }
        let s = e[2],
          n = '';
        if (this.options.pedantic) {
          let l = this.rules.other.pedanticHrefTitle.exec(s);
          l && ((s = l[1]), (n = l[3]));
        } else n = e[3] ? e[3].slice(1, -1) : '';
        return (
          (s = s.trim()),
          this.rules.other.startAngleBracket.test(s) &&
            (this.options.pedantic && !this.rules.other.endAngleBracket.test(t)
              ? (s = s.slice(1))
              : (s = s.slice(1, -1))),
          ie(
            e,
            {
              href: s && s.replace(this.rules.inline.anyPunctuation, '$1'),
              title: n && n.replace(this.rules.inline.anyPunctuation, '$1'),
            },
            e[0],
            this.lexer,
            this.rules,
          )
        );
      }
    }
    reflink(r, e) {
      let t;
      if ((t = this.rules.inline.reflink.exec(r)) || (t = this.rules.inline.nolink.exec(r))) {
        let s = (t[2] || t[1]).replace(this.rules.other.multipleSpaceGlobal, ' '),
          n = e[s.toLowerCase()];
        if (!n) {
          let l = t[0].charAt(0);
          return { type: 'text', raw: l, text: l };
        }
        return ie(t, n, t[0], this.lexer, this.rules);
      }
    }
    emStrong(r, e, t = '') {
      let s = this.rules.inline.emStrongLDelim.exec(r);
      if (
        !(
          !s ||
          (!s[1] && !s[2] && !s[3] && !s[4]) ||
          (s[4] && t.match(this.rules.other.unicodeAlphaNumeric))
        ) &&
        (!(s[1] || s[3]) || !t || this.rules.inline.punctuation.exec(t))
      ) {
        let n = [...s[0]].length - 1,
          l,
          i,
          a = n,
          c = 0,
          o =
            s[0][0] === '*'
              ? this.rules.inline.emStrongRDelimAst
              : this.rules.inline.emStrongRDelimUnd;
        for (o.lastIndex = 0, e = e.slice(-1 * r.length + n); (s = o.exec(e)) !== null; ) {
          if (((l = s[1] || s[2] || s[3] || s[4] || s[5] || s[6]), !l)) continue;
          if (((i = [...l].length), s[3] || s[4])) {
            a += i;
            continue;
          } else if ((s[5] || s[6]) && n % 3 && !((n + i) % 3)) {
            c += i;
            continue;
          }
          if (((a -= i), a > 0)) continue;
          i = Math.min(i, i + a + c);
          let h = [...s[0]][0].length,
            p = r.slice(0, n + s.index + h + i);
          if (Math.min(n, i) % 2) {
            let f = p.slice(1, -1);
            return { type: 'em', raw: p, text: f, tokens: this.lexer.inlineTokens(f) };
          }
          let d = p.slice(2, -2);
          return { type: 'strong', raw: p, text: d, tokens: this.lexer.inlineTokens(d) };
        }
      }
    }
    codespan(r) {
      let e = this.rules.inline.code.exec(r);
      if (e) {
        let t = e[2].replace(this.rules.other.newLineCharGlobal, ' '),
          s = this.rules.other.nonSpaceChar.test(t),
          n =
            this.rules.other.startingSpaceChar.test(t) && this.rules.other.endingSpaceChar.test(t);
        return (
          s && n && (t = t.substring(1, t.length - 1)),
          { type: 'codespan', raw: e[0], text: t }
        );
      }
    }
    br(r) {
      let e = this.rules.inline.br.exec(r);
      if (e) return { type: 'br', raw: e[0] };
    }
    del(r, e, t = '') {
      let s = this.rules.inline.delLDelim.exec(r);
      if (s && (!s[1] || !t || this.rules.inline.punctuation.exec(t))) {
        let n = [...s[0]].length - 1,
          l,
          i,
          a = n,
          c = this.rules.inline.delRDelim;
        for (c.lastIndex = 0, e = e.slice(-1 * r.length + n); (s = c.exec(e)) !== null; ) {
          if (
            ((l = s[1] || s[2] || s[3] || s[4] || s[5] || s[6]),
            !l || ((i = [...l].length), i !== n))
          )
            continue;
          if (s[3] || s[4]) {
            a += i;
            continue;
          }
          if (((a -= i), a > 0)) continue;
          i = Math.min(i, i + a);
          let o = [...s[0]][0].length,
            h = r.slice(0, n + s.index + o + i),
            p = h.slice(n, -n);
          return { type: 'del', raw: h, text: p, tokens: this.lexer.inlineTokens(p) };
        }
      }
    }
    autolink(r) {
      let e = this.rules.inline.autolink.exec(r);
      if (e) {
        let t, s;
        return (
          e[2] === '@' ? ((t = e[1]), (s = 'mailto:' + t)) : ((t = e[1]), (s = t)),
          { type: 'link', raw: e[0], text: t, href: s, tokens: [{ type: 'text', raw: t, text: t }] }
        );
      }
    }
    url(r) {
      let e;
      if ((e = this.rules.inline.url.exec(r))) {
        let t, s;
        if (e[2] === '@') ((t = e[0]), (s = 'mailto:' + t));
        else {
          let n;
          do ((n = e[0]), (e[0] = this.rules.inline._backpedal.exec(e[0])?.[0] ?? ''));
          while (n !== e[0]);
          ((t = e[0]), e[1] === 'www.' ? (s = 'http://' + e[0]) : (s = e[0]));
        }
        return {
          type: 'link',
          raw: e[0],
          text: t,
          href: s,
          tokens: [{ type: 'text', raw: t, text: t }],
        };
      }
    }
    inlineText(r) {
      let e = this.rules.inline.text.exec(r);
      if (e) {
        let t = this.lexer.state.inRawBlock;
        return { type: 'text', raw: e[0], text: e[0], escaped: t };
      }
    }
  },
  x = class Q {
    tokens;
    options;
    state;
    inlineQueue;
    tokenizer;
    constructor(e) {
      ((this.tokens = []),
        (this.tokens.links = Object.create(null)),
        (this.options = e || z),
        (this.options.tokenizer = this.options.tokenizer || new E()),
        (this.tokenizer = this.options.tokenizer),
        (this.tokenizer.options = this.options),
        (this.tokenizer.lexer = this),
        (this.inlineQueue = []),
        (this.state = { inLink: !1, inRawBlock: !1, top: !0 }));
      let t = { other: b, block: L.normal, inline: A.normal };
      (this.options.pedantic
        ? ((t.block = L.pedantic), (t.inline = A.pedantic))
        : this.options.gfm &&
          ((t.block = L.gfm), this.options.breaks ? (t.inline = A.breaks) : (t.inline = A.gfm)),
        (this.tokenizer.rules = t));
    }
    static get rules() {
      return { block: L, inline: A };
    }
    static lex(e, t) {
      return new Q(t).lex(e);
    }
    static lexInline(e, t) {
      return new Q(t).inlineTokens(e);
    }
    lex(e) {
      ((e = e.replace(
        b.carriageReturn,
        `
`,
      )),
        this.blockTokens(e, this.tokens));
      for (let t = 0; t < this.inlineQueue.length; t++) {
        let s = this.inlineQueue[t];
        this.inlineTokens(s.src, s.tokens);
      }
      return ((this.inlineQueue = []), this.tokens);
    }
    blockTokens(e, t = [], s = !1) {
      ((this.tokenizer.lexer = this),
        this.options.pedantic && (e = e.replace(b.tabCharGlobal, '    ').replace(b.spaceLine, '')));
      let n = 1 / 0;
      for (; e; ) {
        if (e.length < n) n = e.length;
        else {
          this.infiniteLoopError(e.charCodeAt(0));
          break;
        }
        let l;
        if (
          this.options.extensions?.block?.some((a) =>
            (l = a.call({ lexer: this }, e, t))
              ? ((e = e.substring(l.raw.length)), t.push(l), !0)
              : !1,
          )
        )
          continue;
        if ((l = this.tokenizer.space(e))) {
          e = e.substring(l.raw.length);
          let a = t.at(-1);
          l.raw.length === 1 && a !== void 0
            ? (a.raw += `
`)
            : t.push(l);
          continue;
        }
        if ((l = this.tokenizer.code(e))) {
          e = e.substring(l.raw.length);
          let a = t.at(-1);
          a?.type === 'paragraph' || a?.type === 'text'
            ? ((a.raw +=
                (a.raw.endsWith(`
`)
                  ? ''
                  : `
`) + l.raw),
              (a.text +=
                `
` + l.text),
              (this.inlineQueue.at(-1).src = a.text))
            : t.push(l);
          continue;
        }
        if ((l = this.tokenizer.fences(e))) {
          ((e = e.substring(l.raw.length)), t.push(l));
          continue;
        }
        if ((l = this.tokenizer.heading(e))) {
          ((e = e.substring(l.raw.length)), t.push(l));
          continue;
        }
        if ((l = this.tokenizer.hr(e))) {
          ((e = e.substring(l.raw.length)), t.push(l));
          continue;
        }
        if ((l = this.tokenizer.blockquote(e))) {
          ((e = e.substring(l.raw.length)), t.push(l));
          continue;
        }
        if ((l = this.tokenizer.list(e))) {
          ((e = e.substring(l.raw.length)), t.push(l));
          continue;
        }
        if ((l = this.tokenizer.html(e))) {
          ((e = e.substring(l.raw.length)), t.push(l));
          continue;
        }
        if ((l = this.tokenizer.def(e))) {
          e = e.substring(l.raw.length);
          let a = t.at(-1);
          a?.type === 'paragraph' || a?.type === 'text'
            ? ((a.raw +=
                (a.raw.endsWith(`
`)
                  ? ''
                  : `
`) + l.raw),
              (a.text +=
                `
` + l.raw),
              (this.inlineQueue.at(-1).src = a.text))
            : this.tokens.links[l.tag] ||
              ((this.tokens.links[l.tag] = { href: l.href, title: l.title }), t.push(l));
          continue;
        }
        if ((l = this.tokenizer.table(e))) {
          ((e = e.substring(l.raw.length)), t.push(l));
          continue;
        }
        if ((l = this.tokenizer.lheading(e))) {
          ((e = e.substring(l.raw.length)), t.push(l));
          continue;
        }
        let i = e;
        if (this.options.extensions?.startBlock) {
          let a = 1 / 0,
            c = e.slice(1),
            o;
          (this.options.extensions.startBlock.forEach((h) => {
            ((o = h.call({ lexer: this }, c)),
              typeof o == 'number' && o >= 0 && (a = Math.min(a, o)));
          }),
            a < 1 / 0 && a >= 0 && (i = e.substring(0, a + 1)));
        }
        if (this.state.top && (l = this.tokenizer.paragraph(i))) {
          let a = t.at(-1);
          (s && a?.type === 'paragraph'
            ? ((a.raw +=
                (a.raw.endsWith(`
`)
                  ? ''
                  : `
`) + l.raw),
              (a.text +=
                `
` + l.text),
              this.inlineQueue.pop(),
              (this.inlineQueue.at(-1).src = a.text))
            : t.push(l),
            (s = i.length !== e.length),
            (e = e.substring(l.raw.length)));
          continue;
        }
        if ((l = this.tokenizer.text(e))) {
          e = e.substring(l.raw.length);
          let a = t.at(-1);
          a?.type === 'text'
            ? ((a.raw +=
                (a.raw.endsWith(`
`)
                  ? ''
                  : `
`) + l.raw),
              (a.text +=
                `
` + l.text),
              this.inlineQueue.pop(),
              (this.inlineQueue.at(-1).src = a.text))
            : t.push(l);
          continue;
        }
        if (e) {
          this.infiniteLoopError(e.charCodeAt(0));
          break;
        }
      }
      return ((this.state.top = !0), t);
    }
    inline(e, t = []) {
      return (this.inlineQueue.push({ src: e, tokens: t }), t);
    }
    inlineTokens(e, t = []) {
      this.tokenizer.lexer = this;
      let s = e,
        n = null;
      if (this.tokens.links) {
        let o = Object.keys(this.tokens.links);
        if (o.length > 0)
          for (; (n = this.tokenizer.rules.inline.reflinkSearch.exec(s)) !== null; )
            o.includes(n[0].slice(n[0].lastIndexOf('[') + 1, -1)) &&
              (s =
                s.slice(0, n.index) +
                '[' +
                'a'.repeat(n[0].length - 2) +
                ']' +
                s.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex));
      }
      for (; (n = this.tokenizer.rules.inline.anyPunctuation.exec(s)) !== null; )
        s =
          s.slice(0, n.index) +
          '++' +
          s.slice(this.tokenizer.rules.inline.anyPunctuation.lastIndex);
      let l;
      for (; (n = this.tokenizer.rules.inline.blockSkip.exec(s)) !== null; )
        ((l = n[2] ? n[2].length : 0),
          (s =
            s.slice(0, n.index + l) +
            '[' +
            'a'.repeat(n[0].length - l - 2) +
            ']' +
            s.slice(this.tokenizer.rules.inline.blockSkip.lastIndex)));
      s = this.options.hooks?.emStrongMask?.call({ lexer: this }, s) ?? s;
      let i = !1,
        a = '',
        c = 1 / 0;
      for (; e; ) {
        if (e.length < c) c = e.length;
        else {
          this.infiniteLoopError(e.charCodeAt(0));
          break;
        }
        (i || (a = ''), (i = !1));
        let o;
        if (
          this.options.extensions?.inline?.some((p) =>
            (o = p.call({ lexer: this }, e, t))
              ? ((e = e.substring(o.raw.length)), t.push(o), !0)
              : !1,
          )
        )
          continue;
        if ((o = this.tokenizer.escape(e))) {
          ((e = e.substring(o.raw.length)), t.push(o));
          continue;
        }
        if ((o = this.tokenizer.tag(e))) {
          ((e = e.substring(o.raw.length)), t.push(o));
          continue;
        }
        if ((o = this.tokenizer.link(e))) {
          ((e = e.substring(o.raw.length)), t.push(o));
          continue;
        }
        if ((o = this.tokenizer.reflink(e, this.tokens.links))) {
          e = e.substring(o.raw.length);
          let p = t.at(-1);
          o.type === 'text' && p?.type === 'text'
            ? ((p.raw += o.raw), (p.text += o.text))
            : t.push(o);
          continue;
        }
        if ((o = this.tokenizer.emStrong(e, s, a))) {
          ((e = e.substring(o.raw.length)), t.push(o));
          continue;
        }
        if ((o = this.tokenizer.codespan(e))) {
          ((e = e.substring(o.raw.length)), t.push(o));
          continue;
        }
        if ((o = this.tokenizer.br(e))) {
          ((e = e.substring(o.raw.length)), t.push(o));
          continue;
        }
        if ((o = this.tokenizer.del(e, s, a))) {
          ((e = e.substring(o.raw.length)), t.push(o));
          continue;
        }
        if ((o = this.tokenizer.autolink(e))) {
          ((e = e.substring(o.raw.length)), t.push(o));
          continue;
        }
        if (!this.state.inLink && (o = this.tokenizer.url(e))) {
          ((e = e.substring(o.raw.length)), t.push(o));
          continue;
        }
        let h = e;
        if (this.options.extensions?.startInline) {
          let p = 1 / 0,
            d = e.slice(1),
            f;
          (this.options.extensions.startInline.forEach((k) => {
            ((f = k.call({ lexer: this }, d)),
              typeof f == 'number' && f >= 0 && (p = Math.min(p, f)));
          }),
            p < 1 / 0 && p >= 0 && (h = e.substring(0, p + 1)));
        }
        if ((o = this.tokenizer.inlineText(h))) {
          ((e = e.substring(o.raw.length)),
            o.raw.slice(-1) !== '_' && (a = o.raw.slice(-1)),
            (i = !0));
          let p = t.at(-1);
          p?.type === 'text' ? ((p.raw += o.raw), (p.text += o.text)) : t.push(o);
          continue;
        }
        if (e) {
          this.infiniteLoopError(e.charCodeAt(0));
          break;
        }
      }
      return t;
    }
    infiniteLoopError(e) {
      let t = 'Infinite loop on byte: ' + e;
      if (this.options.silent) console.error(t);
      else throw new Error(t);
    }
  },
  q = class {
    options;
    parser;
    constructor(r) {
      this.options = r || z;
    }
    space(r) {
      return '';
    }
    code({ text: r, lang: e, escaped: t }) {
      let s = (e || '').match(b.notSpaceStart)?.[0],
        n =
          r.replace(b.endingNewline, '') +
          `
`;
      return s
        ? '<pre><code class="language-' +
            w(s) +
            '">' +
            (t ? n : w(n, !0)) +
            `</code></pre>
`
        : '<pre><code>' +
            (t ? n : w(n, !0)) +
            `</code></pre>
`;
    }
    blockquote({ tokens: r }) {
      return `<blockquote>
${this.parser.parse(r)}</blockquote>
`;
    }
    html({ text: r }) {
      return r;
    }
    def(r) {
      return '';
    }
    heading({ tokens: r, depth: e }) {
      return `<h${e}>${this.parser.parseInline(r)}</h${e}>
`;
    }
    hr(r) {
      return `<hr>
`;
    }
    list(r) {
      let e = r.ordered,
        t = r.start,
        s = '';
      for (let i = 0; i < r.items.length; i++) {
        let a = r.items[i];
        s += this.listitem(a);
      }
      let n = e ? 'ol' : 'ul',
        l = e && t !== 1 ? ' start="' + t + '"' : '';
      return (
        '<' +
        n +
        l +
        `>
` +
        s +
        '</' +
        n +
        `>
`
      );
    }
    listitem(r) {
      return `<li>${this.parser.parse(r.tokens)}</li>
`;
    }
    checkbox({ checked: r }) {
      return '<input ' + (r ? 'checked="" ' : '') + 'disabled="" type="checkbox"> ';
    }
    paragraph({ tokens: r }) {
      return `<p>${this.parser.parseInline(r)}</p>
`;
    }
    table(r) {
      let e = '',
        t = '';
      for (let n = 0; n < r.header.length; n++) t += this.tablecell(r.header[n]);
      e += this.tablerow({ text: t });
      let s = '';
      for (let n = 0; n < r.rows.length; n++) {
        let l = r.rows[n];
        t = '';
        for (let i = 0; i < l.length; i++) t += this.tablecell(l[i]);
        s += this.tablerow({ text: t });
      }
      return (
        s && (s = `<tbody>${s}</tbody>`),
        `<table>
<thead>
` +
          e +
          `</thead>
` +
          s +
          `</table>
`
      );
    }
    tablerow({ text: r }) {
      return `<tr>
${r}</tr>
`;
    }
    tablecell(r) {
      let e = this.parser.parseInline(r.tokens),
        t = r.header ? 'th' : 'td';
      return (
        (r.align ? `<${t} align="${r.align}">` : `<${t}>`) +
        e +
        `</${t}>
`
      );
    }
    strong({ tokens: r }) {
      return `<strong>${this.parser.parseInline(r)}</strong>`;
    }
    em({ tokens: r }) {
      return `<em>${this.parser.parseInline(r)}</em>`;
    }
    codespan({ text: r }) {
      return `<code>${w(r, !0)}</code>`;
    }
    br(r) {
      return '<br>';
    }
    del({ tokens: r }) {
      return `<del>${this.parser.parseInline(r)}</del>`;
    }
    link({ href: r, title: e, tokens: t }) {
      let s = this.parser.parseInline(t),
        n = ne(r);
      if (n === null) return s;
      r = n;
      let l = '<a href="' + r + '"';
      return (e && (l += ' title="' + w(e) + '"'), (l += '>' + s + '</a>'), l);
    }
    image({ href: r, title: e, text: t, tokens: s }) {
      s && (t = this.parser.parseInline(s, this.parser.textRenderer));
      let n = ne(r);
      if (n === null) return w(t);
      r = n;
      let l = `<img src="${r}" alt="${w(t)}"`;
      return (e && (l += ` title="${w(e)}"`), (l += '>'), l);
    }
    text(r) {
      return 'tokens' in r && r.tokens
        ? this.parser.parseInline(r.tokens)
        : 'escaped' in r && r.escaped
          ? r.text
          : w(r.text);
    }
  },
  U = class {
    strong({ text: r }) {
      return r;
    }
    em({ text: r }) {
      return r;
    }
    codespan({ text: r }) {
      return r;
    }
    del({ text: r }) {
      return r;
    }
    html({ text: r }) {
      return r;
    }
    text({ text: r }) {
      return r;
    }
    link({ text: r }) {
      return '' + r;
    }
    image({ text: r }) {
      return '' + r;
    }
    br() {
      return '';
    }
    checkbox({ raw: r }) {
      return r;
    }
  },
  m = class N {
    options;
    renderer;
    textRenderer;
    constructor(e) {
      ((this.options = e || z),
        (this.options.renderer = this.options.renderer || new q()),
        (this.renderer = this.options.renderer),
        (this.renderer.options = this.options),
        (this.renderer.parser = this),
        (this.textRenderer = new U()));
    }
    static parse(e, t) {
      return new N(t).parse(e);
    }
    static parseInline(e, t) {
      return new N(t).parseInline(e);
    }
    parse(e) {
      this.renderer.parser = this;
      let t = '';
      for (let s = 0; s < e.length; s++) {
        let n = e[s];
        if (this.options.extensions?.renderers?.[n.type]) {
          let i = n,
            a = this.options.extensions.renderers[i.type].call({ parser: this }, i);
          if (
            a !== !1 ||
            ![
              'space',
              'hr',
              'heading',
              'code',
              'table',
              'blockquote',
              'list',
              'html',
              'def',
              'paragraph',
              'text',
            ].includes(i.type)
          ) {
            t += a || '';
            continue;
          }
        }
        let l = n;
        switch (l.type) {
          case 'space': {
            t += this.renderer.space(l);
            break;
          }
          case 'hr': {
            t += this.renderer.hr(l);
            break;
          }
          case 'heading': {
            t += this.renderer.heading(l);
            break;
          }
          case 'code': {
            t += this.renderer.code(l);
            break;
          }
          case 'table': {
            t += this.renderer.table(l);
            break;
          }
          case 'blockquote': {
            t += this.renderer.blockquote(l);
            break;
          }
          case 'list': {
            t += this.renderer.list(l);
            break;
          }
          case 'checkbox': {
            t += this.renderer.checkbox(l);
            break;
          }
          case 'html': {
            t += this.renderer.html(l);
            break;
          }
          case 'def': {
            t += this.renderer.def(l);
            break;
          }
          case 'paragraph': {
            t += this.renderer.paragraph(l);
            break;
          }
          case 'text': {
            t += this.renderer.text(l);
            break;
          }
          default: {
            let i = 'Token with "' + l.type + '" type was not found.';
            if (this.options.silent) return (console.error(i), '');
            throw new Error(i);
          }
        }
      }
      return t;
    }
    parseInline(e, t = this.renderer) {
      this.renderer.parser = this;
      let s = '';
      for (let n = 0; n < e.length; n++) {
        let l = e[n];
        if (this.options.extensions?.renderers?.[l.type]) {
          let a = this.options.extensions.renderers[l.type].call({ parser: this }, l);
          if (
            a !== !1 ||
            ![
              'escape',
              'html',
              'link',
              'image',
              'strong',
              'em',
              'codespan',
              'br',
              'del',
              'text',
            ].includes(l.type)
          ) {
            s += a || '';
            continue;
          }
        }
        let i = l;
        switch (i.type) {
          case 'escape': {
            s += t.text(i);
            break;
          }
          case 'html': {
            s += t.html(i);
            break;
          }
          case 'link': {
            s += t.link(i);
            break;
          }
          case 'image': {
            s += t.image(i);
            break;
          }
          case 'checkbox': {
            s += t.checkbox(i);
            break;
          }
          case 'strong': {
            s += t.strong(i);
            break;
          }
          case 'em': {
            s += t.em(i);
            break;
          }
          case 'codespan': {
            s += t.codespan(i);
            break;
          }
          case 'br': {
            s += t.br(i);
            break;
          }
          case 'del': {
            s += t.del(i);
            break;
          }
          case 'text': {
            s += t.text(i);
            break;
          }
          default: {
            let a = 'Token with "' + i.type + '" type was not found.';
            if (this.options.silent) return (console.error(a), '');
            throw new Error(a);
          }
        }
      }
      return s;
    }
  },
  P = class {
    options;
    block;
    constructor(r) {
      this.options = r || z;
    }
    static passThroughHooks = new Set([
      'preprocess',
      'postprocess',
      'processAllTokens',
      'emStrongMask',
    ]);
    static passThroughHooksRespectAsync = new Set([
      'preprocess',
      'postprocess',
      'processAllTokens',
    ]);
    preprocess(r) {
      return r;
    }
    postprocess(r) {
      return r;
    }
    processAllTokens(r) {
      return r;
    }
    emStrongMask(r) {
      return r;
    }
    provideLexer(r = this.block) {
      return r ? x.lex : x.lexInline;
    }
    provideParser(r = this.block) {
      return r ? m.parse : m.parseInline;
    }
  },
  pt = class {
    defaults = O();
    options = this.setOptions;
    parse = this.parseMarkdown(!0);
    parseInline = this.parseMarkdown(!1);
    Parser = m;
    Renderer = q;
    TextRenderer = U;
    Lexer = x;
    Tokenizer = E;
    Hooks = P;
    constructor(...r) {
      this.use(...r);
    }
    walkTokens(r, e) {
      let t = [];
      for (let s of r)
        switch (((t = t.concat(e.call(this, s))), s.type)) {
          case 'table': {
            let n = s;
            for (let l of n.header) t = t.concat(this.walkTokens(l.tokens, e));
            for (let l of n.rows) for (let i of l) t = t.concat(this.walkTokens(i.tokens, e));
            break;
          }
          case 'list': {
            let n = s;
            t = t.concat(this.walkTokens(n.items, e));
            break;
          }
          default: {
            let n = s;
            this.defaults.extensions?.childTokens?.[n.type]
              ? this.defaults.extensions.childTokens[n.type].forEach((l) => {
                  let i = n[l].flat(1 / 0);
                  t = t.concat(this.walkTokens(i, e));
                })
              : n.tokens && (t = t.concat(this.walkTokens(n.tokens, e)));
          }
        }
      return t;
    }
    use(...r) {
      let e = this.defaults.extensions || { renderers: {}, childTokens: {} };
      return (
        r.forEach((t) => {
          let s = { ...t };
          if (
            ((s.async = this.defaults.async || s.async || !1),
            t.extensions &&
              (t.extensions.forEach((n) => {
                if (!n.name) throw new Error('extension name required');
                if ('renderer' in n) {
                  let l = e.renderers[n.name];
                  l
                    ? (e.renderers[n.name] = function (...i) {
                        let a = n.renderer.apply(this, i);
                        return (a === !1 && (a = l.apply(this, i)), a);
                      })
                    : (e.renderers[n.name] = n.renderer);
                }
                if ('tokenizer' in n) {
                  if (!n.level || (n.level !== 'block' && n.level !== 'inline'))
                    throw new Error("extension level must be 'block' or 'inline'");
                  let l = e[n.level];
                  (l ? l.unshift(n.tokenizer) : (e[n.level] = [n.tokenizer]),
                    n.start &&
                      (n.level === 'block'
                        ? e.startBlock
                          ? e.startBlock.push(n.start)
                          : (e.startBlock = [n.start])
                        : n.level === 'inline' &&
                          (e.startInline
                            ? e.startInline.push(n.start)
                            : (e.startInline = [n.start]))));
                }
                'childTokens' in n && n.childTokens && (e.childTokens[n.name] = n.childTokens);
              }),
              (s.extensions = e)),
            t.renderer)
          ) {
            let n = this.defaults.renderer || new q(this.defaults);
            for (let l in t.renderer) {
              if (!(l in n)) throw new Error(`renderer '${l}' does not exist`);
              if (['options', 'parser'].includes(l)) continue;
              let i = l,
                a = t.renderer[i],
                c = n[i];
              n[i] = (...o) => {
                let h = a.apply(n, o);
                return (h === !1 && (h = c.apply(n, o)), h || '');
              };
            }
            s.renderer = n;
          }
          if (t.tokenizer) {
            let n = this.defaults.tokenizer || new E(this.defaults);
            for (let l in t.tokenizer) {
              if (!(l in n)) throw new Error(`tokenizer '${l}' does not exist`);
              if (['options', 'rules', 'lexer'].includes(l)) continue;
              let i = l,
                a = t.tokenizer[i],
                c = n[i];
              n[i] = (...o) => {
                let h = a.apply(n, o);
                return (h === !1 && (h = c.apply(n, o)), h);
              };
            }
            s.tokenizer = n;
          }
          if (t.hooks) {
            let n = this.defaults.hooks || new P();
            for (let l in t.hooks) {
              if (!(l in n)) throw new Error(`hook '${l}' does not exist`);
              if (['options', 'block'].includes(l)) continue;
              let i = l,
                a = t.hooks[i],
                c = n[i];
              P.passThroughHooks.has(l)
                ? (n[i] = (o) => {
                    if (this.defaults.async && P.passThroughHooksRespectAsync.has(l))
                      return (async () => {
                        let p = await a.call(n, o);
                        return c.call(n, p);
                      })();
                    let h = a.call(n, o);
                    return c.call(n, h);
                  })
                : (n[i] = (...o) => {
                    if (this.defaults.async)
                      return (async () => {
                        let p = await a.apply(n, o);
                        return (p === !1 && (p = await c.apply(n, o)), p);
                      })();
                    let h = a.apply(n, o);
                    return (h === !1 && (h = c.apply(n, o)), h);
                  });
            }
            s.hooks = n;
          }
          if (t.walkTokens) {
            let n = this.defaults.walkTokens,
              l = t.walkTokens;
            s.walkTokens = function (i) {
              let a = [];
              return (a.push(l.call(this, i)), n && (a = a.concat(n.call(this, i))), a);
            };
          }
          this.defaults = { ...this.defaults, ...s };
        }),
        this
      );
    }
    setOptions(r) {
      return ((this.defaults = { ...this.defaults, ...r }), this);
    }
    lexer(r, e) {
      return x.lex(r, e ?? this.defaults);
    }
    parser(r, e) {
      return m.parse(r, e ?? this.defaults);
    }
    parseMarkdown(r) {
      return (e, t) => {
        let s = { ...t },
          n = { ...this.defaults, ...s },
          l = this.onError(!!n.silent, !!n.async);
        if (this.defaults.async === !0 && s.async === !1)
          return l(
            new Error(
              'marked(): The async option was set to true by an extension. Remove async: false from the parse options object to return a Promise.',
            ),
          );
        if (typeof e > 'u' || e === null)
          return l(new Error('marked(): input parameter is undefined or null'));
        if (typeof e != 'string')
          return l(
            new Error(
              'marked(): input parameter is of type ' +
                Object.prototype.toString.call(e) +
                ', string expected',
            ),
          );
        if ((n.hooks && ((n.hooks.options = n), (n.hooks.block = r)), n.async))
          return (async () => {
            let i = n.hooks ? await n.hooks.preprocess(e) : e,
              a = await (n.hooks ? await n.hooks.provideLexer(r) : r ? x.lex : x.lexInline)(i, n),
              c = n.hooks ? await n.hooks.processAllTokens(a) : a;
            n.walkTokens && (await Promise.all(this.walkTokens(c, n.walkTokens)));
            let o = await (n.hooks ? await n.hooks.provideParser(r) : r ? m.parse : m.parseInline)(
              c,
              n,
            );
            return n.hooks ? await n.hooks.postprocess(o) : o;
          })().catch(l);
        try {
          n.hooks && (e = n.hooks.preprocess(e));
          let i = (n.hooks ? n.hooks.provideLexer(r) : r ? x.lex : x.lexInline)(e, n);
          (n.hooks && (i = n.hooks.processAllTokens(i)),
            n.walkTokens && this.walkTokens(i, n.walkTokens));
          let a = (n.hooks ? n.hooks.provideParser(r) : r ? m.parse : m.parseInline)(i, n);
          return (n.hooks && (a = n.hooks.postprocess(a)), a);
        } catch (i) {
          return l(i);
        }
      };
    }
    onError(r, e) {
      return (t) => {
        if (
          ((t.message += `
Please report this to https://github.com/markedjs/marked.`),
          r)
        ) {
          let s = '<p>An error occurred:</p><pre>' + w(t.message + '', !0) + '</pre>';
          return e ? Promise.resolve(s) : s;
        }
        if (e) return Promise.reject(t);
        throw t;
      };
    }
  },
  R = new pt();
function g(r, e) {
  return R.parse(r, e);
}
g.options = g.setOptions = function (r) {
  return (R.setOptions(r), (g.defaults = R.defaults), oe(g.defaults), g);
};
g.getDefaults = O;
g.defaults = z;
g.use = function (...r) {
  return (R.use(...r), (g.defaults = R.defaults), oe(g.defaults), g);
};
g.walkTokens = function (r, e) {
  return R.walkTokens(r, e);
};
g.parseInline = R.parseInline;
g.Parser = m;
g.parser = m.parse;
g.Renderer = q;
g.TextRenderer = U;
g.Lexer = x;
g.lexer = x.lex;
g.Tokenizer = E;
g.Hooks = P;
g.parse = g;
g.options;
g.setOptions;
g.use;
g.walkTokens;
g.parseInline;
m.parse;
x.lex;
const ht = `
.markdown-viewer{min-height:100%;padding:28px 16px 48px;background:#eef1f4;overflow:auto;box-sizing:border-box}
.markdown-body{color-scheme:light;--bgColor-default:#fff;--bgColor-muted:#f6f8fa;--bgColor-neutral-muted:#818b981f;--borderColor-default:#d1d9e0;--borderColor-muted:#d1d9e0b3;--borderColor-neutral-muted:#d1d9e0b3;--fgColor-default:#1f2328;--fgColor-muted:#59636e;--fgColor-accent:#0969da;background:var(--bgColor-default);border:1px solid rgba(20,35,53,.1);border-radius:12px;margin:0 auto;box-sizing:border-box;min-width:200px;max-width:var(--markdown-max-width,980px);padding:var(--markdown-padding,45px);color:var(--fgColor-default);font-size:var(--markdown-font-size,16px);box-shadow:0 18px 42px rgba(15,23,42,.1)}
.markdown-body h1,.markdown-body h2,.markdown-body h3{margin-top:24px;margin-bottom:16px;font-weight:700;line-height:1.25}
.markdown-body h1{padding-bottom:.3em;border-bottom:1px solid var(--borderColor-muted);font-size:2em}
.markdown-body h2{padding-bottom:.3em;border-bottom:1px solid var(--borderColor-muted);font-size:1.5em}
.markdown-body p,.markdown-body ul,.markdown-body ol,.markdown-body blockquote,.markdown-body table,.markdown-body pre{margin-top:0;margin-bottom:16px}
.markdown-body a{color:var(--fgColor-accent);text-decoration:none}
.markdown-body a:hover{text-decoration:underline}
.markdown-body code{padding:.2em .4em;border-radius:6px;background:var(--bgColor-neutral-muted);font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,'Liberation Mono',monospace;font-size:85%}
.markdown-body pre{padding:16px;overflow:auto;border-radius:8px;background:var(--bgColor-muted)}
.markdown-body pre code{padding:0;background:transparent;font-size:100%}
.markdown-body table{display:block;width:max-content;max-width:100%;overflow:auto;border-spacing:0;border-collapse:collapse}
.markdown-body th,.markdown-body td{padding:6px 13px;border:1px solid var(--borderColor-default)}
.markdown-body tr{background:var(--bgColor-default);border-top:1px solid var(--borderColor-muted)}
.markdown-body tr:nth-child(2n){background:var(--bgColor-muted)}
.markdown-body blockquote{padding:0 1em;color:var(--fgColor-muted);border-left:.25em solid var(--borderColor-default)}
.file-viewer[data-viewer-theme='dark'] .markdown-viewer{background:#101820}
.file-viewer[data-viewer-theme='dark'] .markdown-body{color-scheme:dark;--bgColor-default:#0d1117;--bgColor-muted:#151b23;--bgColor-neutral-muted:#656c7633;--borderColor-default:#3d444d;--borderColor-muted:#3d444db3;--borderColor-neutral-muted:#3d444db3;--fgColor-default:#f0f6fc;--fgColor-muted:#9198a1;--fgColor-accent:#4493f8;background:var(--bgColor-default);border-color:rgba(139,148,158,.26);color:var(--fgColor-default);box-shadow:0 24px 56px rgba(0,0,0,.38)}
@media (max-width:767px){.markdown-viewer{padding:14px 10px 28px}.markdown-body{padding:22px 18px;border-radius:10px}}
@media (prefers-color-scheme:dark){.file-viewer[data-viewer-theme='system'] .markdown-viewer{background:#101820}.file-viewer[data-viewer-theme='system'] .markdown-body{color-scheme:dark;--bgColor-default:#0d1117;--bgColor-muted:#151b23;--bgColor-neutral-muted:#656c7633;--borderColor-default:#3d444d;--borderColor-muted:#3d444db3;--borderColor-neutral-muted:#3d444db3;--fgColor-default:#f0f6fc;--fgColor-muted:#9198a1;--fgColor-accent:#4493f8;background:var(--bgColor-default);border-color:rgba(139,148,158,.26);color:var(--fgColor-default);box-shadow:0 24px 56px rgba(0,0,0,.38)}}
`,
  ut = () => {
    const r = document.createElement('style');
    return ((r.textContent = ht), r);
  },
  dt = (r) => Math.min(2.4, Math.max(0.6, Number(r.toFixed(2)))),
  ae = (r, e) => {
    (r.style.setProperty('--markdown-max-width', `${980 * e}px`),
      r.style.setProperty('--markdown-padding', `${45 * e}px`),
      r.style.setProperty('--markdown-font-size', `${16 * e}px`));
  };
async function mt(r, e) {
  const t = await we(r);
  let s = 1;
  const n = $e(),
    l = document.createElement('div');
  ((l.className = 'markdown-viewer'), (l.dataset.viewerZoomProvider = 'markdown'));
  const i = document.createElement('article');
  ((i.className = 'markdown-body'),
    (i.innerHTML = await g(t)),
    ae(l, s),
    l.append(i),
    e.replaceChildren(ut(), l));
  const a = () => ({
      scale: s,
      label: `${Math.round(s * 100)}%`,
      canZoomIn: s < 2.4,
      canZoomOut: s > 0.6,
      canReset: s !== 1,
      minScale: 0.6,
      maxScale: 2.4,
    }),
    c = (o) => ((s = dt(o)), ae(l, s), n.emit(), a());
  return (
    ye(l, {
      zoomIn: () => c(s + 0.1),
      zoomOut: () => c(s - 0.1),
      resetZoom: () => c(1),
      setZoom: c,
      getState: a,
      subscribe: n.subscribe,
    }),
    {
      $el: e,
      unmount() {
        (Se(l), e.replaceChildren());
      },
    }
  );
}
export { mt as default };
