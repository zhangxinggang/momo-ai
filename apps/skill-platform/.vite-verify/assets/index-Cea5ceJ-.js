import { bp as u } from './index-C2avURFS.js';
import { q as s, M as v } from './markdown-vendor-DldLOD9R.js';
import { r as o } from './ui-vendor-C-FKu2uc.js';
const M = '_preview_1t529_1',
  f = { preview: M },
  k = v;
function j({ value: e, className: i, theme: n, previewTheme: r, codeTheme: a = 'atom', id: d }) {
  const t = u((l) => l.isDarkMode),
    c = o.useId().replace(/:/g, ''),
    m = d ?? `markdown-preview-${c}`,
    p = n ?? (t ? 'dark' : 'light'),
    w = o.useMemo(() => r ?? 'cyanosis', [t, r]);
  return e.trim()
    ? s.jsx('div', {
        className: [f.preview, i].filter(Boolean).join(' '),
        children: s.jsx(k, {
          id: m,
          value: e,
          theme: p,
          previewTheme: w,
          codeTheme: a,
          style: { background: 'transparent' },
        }),
      })
    : null;
}
export { j as M };
