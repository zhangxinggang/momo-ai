import './markdown-it-vendor-DL4wSELR.js';
import './markdown-vendor-DldLOD9R.js';
import { _ as e, d as i, F as n, l as s } from './mermaid.core-Cs_8gTP_.js';
import './ui-vendor-C-FKu2uc.js';
import { p } from './wardley-L42UT6IY-PPlg582g.js';
var g = {
    parse: e(async (r) => {
      const a = await p('info', r);
      s.debug(a);
    }, 'parse'),
  },
  d = { version: '11.15.0' },
  v = e(() => d.version, 'getVersion'),
  m = { getVersion: v },
  c = e((r, a, o) => {
    s.debug(
      `rendering info diagram
` + r,
    );
    const t = n(a);
    (i(t, 100, 400, !0),
      t
        .append('g')
        .append('text')
        .attr('x', 100)
        .attr('y', 40)
        .attr('class', 'version')
        .attr('font-size', 32)
        .style('text-anchor', 'middle')
        .text(`v${o}`));
  }, 'draw'),
  l = { draw: c },
  y = { parser: g, db: m, renderer: l };
export { y as diagram };
