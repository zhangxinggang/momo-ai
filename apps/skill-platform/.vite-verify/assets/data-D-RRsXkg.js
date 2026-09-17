const __vite__mapDeps = (
  i,
  m = __vite__mapDeps,
  d = m.f ||
    (m.f = [
      './sql-wasm-browser-BHf22Z9l.js',
      './ui-vendor-C-FKu2uc.js',
      './markdown-vendor-DldLOD9R.js',
      './markdown-it-vendor-DL4wSELR.js',
      './markdown-vendor-CmuYMs8x.css',
      './avsc-CuDJ5jJf.js',
      './psd-oIuPg7-F.js',
      './index-C2avURFS.js',
      './icons-B5Lu0sqU.js',
      './index-DUUm-ELF.css',
    ]),
) => i.map((i) => d[i]);
import { m as x } from './assets-Cqo46k_X.js';
import './markdown-it-vendor-DL4wSELR.js';
import { _ as u } from './markdown-vendor-DldLOD9R.js';
import './ui-vendor-C-FKu2uc.js';
const v = `
.data-viewer{min-height:100%;padding:28px;background:#eef1f4;color:#132235}
.data-card{max-width:1080px;margin:0 auto;overflow:hidden;border:1px solid rgba(15,23,42,.08);border-radius:8px;background:#fff;box-shadow:0 18px 48px rgba(15,23,42,.12)}
.data-header{padding:20px 24px;border-bottom:1px solid rgba(15,23,42,.08)}
.data-header span{color:#0f766e;font-size:12px;font-weight:800}
.data-header h2{margin:6px 0 0;font-size:24px}
.data-summary{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:1px;background:rgba(15,23,42,.08)}
.data-summary div{min-width:0;padding:15px 18px;background:#f8fafc}
.data-summary span{display:block;color:#64748b;font-size:12px}
.data-summary strong{display:block;margin-top:5px;overflow:hidden;color:#132235;font-size:15px;text-overflow:ellipsis;white-space:nowrap}
.font-preview{padding:34px 28px;border-top:1px solid rgba(15,23,42,.08);font-size:42px;line-height:1.45;word-break:break-word}
.asset-image{padding:24px;border-top:1px solid rgba(15,23,42,.08);background:#f8fafc;text-align:center}
.asset-image img{max-width:100%;max-height:70vh;box-shadow:0 10px 30px rgba(15,23,42,.16)}
.asset-text{margin:0;padding:18px 24px;overflow:auto;border-top:1px solid rgba(15,23,42,.08);background:#111827;color:#e5e7eb;font-size:13px;line-height:1.7}
.data-table-wrap{max-height:520px;overflow:auto;border-top:1px solid rgba(15,23,42,.08)}
.data-table{width:100%;border-collapse:collapse;font-size:13px}
.data-table th,.data-table td{max-width:260px;padding:10px 12px;border-bottom:1px solid rgba(15,23,42,.08);overflow:hidden;text-align:left;text-overflow:ellipsis;white-space:nowrap}
.data-table th{position:sticky;top:0;background:#f8fafc;color:#64748b;z-index:1}
`,
  _ = { otf: 'font/otf', ttf: 'font/ttf', woff: 'font/woff', woff2: 'font/woff2' },
  A = 'Flyfish Viewer 轻量预览 AaBbCc 1234567890',
  S = (e) => {
    const t = e.createElement('style');
    return ((t.textContent = v), t);
  },
  s = (e, t, n, r) => {
    const a = e.createElement(t);
    return (n && (a.className = n), r !== void 0 && (a.textContent = r), a);
  },
  h = (e) =>
    e < 1024
      ? `${e} B`
      : e < 1024 * 1024
        ? `${(e / 1024).toFixed(1)} KB`
        : `${(e / 1024 / 1024).toFixed(1)} MB`,
  b = (e) =>
    e.slice(0, 30).map((t) => {
      const n = {};
      return (
        Object.entries(t)
          .slice(0, 24)
          .forEach(([r, a]) => {
            typeof a == 'bigint'
              ? (n[r] = a.toString())
              : a instanceof Uint8Array
                ? (n[r] = `[bytes:${a.byteLength}]`)
                : a && typeof a == 'object'
                  ? (n[r] = JSON.stringify(a).slice(0, 180))
                  : (n[r] = a);
          }),
        n
      );
    }),
  w = (e, t = 8e3) => {
    const n = new Uint8Array(e);
    return Array.from(n.slice(0, Math.min(n.length, t)))
      .map((a) =>
        (a >= 32 && a <= 126) || a === 10 || a === 13 || a === 9 ? String.fromCharCode(a) : ' ',
      )
      .join('')
      .replace(/[ \t]{3,}/g, ' ')
      .trim()
      .slice(0, t);
  },
  f = (e, t = 12) => String.fromCharCode(...new Uint8Array(e.slice(0, t))),
  F = (e) =>
    e.defaultView?.__FLYFISH_DATA_SQL_WASM_URL__ ||
    (typeof window < 'u' ? window.__FLYFISH_DATA_SQL_WASM_URL__ : void 0),
  C = async (e, t, n) => {
    const r = `FlyfishPreviewFont-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      i =
        (e.defaultView || (typeof window < 'u' ? window : void 0))?.FontFace ||
        (typeof FontFace < 'u' ? FontFace : void 0);
    if (!i) throw new Error('当前浏览器不支持 FontFace API');
    const o = new i(r, t);
    return (
      await o.load(),
      e.fonts?.add(o),
      {
        title: '字体文件预览',
        fontFamily: r,
        summary: [
          { label: '格式', value: n.toUpperCase() },
          { label: '大小', value: h(t.byteLength) },
          { label: '渲染方式', value: 'Browser FontFace API' },
        ],
      }
    );
  },
  L = async (e, t, n) => {
    const { default: r } = await u(
        async () => {
          const { default: l } = await import('./sql-wasm-browser-BHf22Z9l.js').then((d) => d.s);
          return { default: l };
        },
        __vite__mapDeps([0, 1, 2, 3, 4]),
        import.meta.url,
      ),
      a = x(n?.options?.data, [F(e)], e.baseURI),
      i = await r({ locateFile: () => a }),
      o = new i.Database(new Uint8Array(t));
    try {
      const d =
          o.exec(
            "select name, type from sqlite_master where type in ('table','view') and name not like 'sqlite_%' order by type, name",
          )[0]?.values || [],
        p = String(d[0]?.[0] || ''),
        c = p ? o.exec(`select * from "${p.replace(/"/g, '""')}" limit 30`)[0] : null;
      return {
        title: 'SQLite 数据库预览',
        summary: [
          { label: '对象数', value: String(d.length) },
          { label: '示例表', value: p || '-' },
          { label: '渲染方式', value: 'sql.js WASM' },
        ],
        rows: b(
          c
            ? c.values.map((m) => Object.fromEntries(c.columns.map((g, y) => [g, m[y]])))
            : d.map((m) => ({ name: m[0], type: m[1] })),
        ),
      };
    } finally {
      o.close();
    }
  },
  P = async (e) => {
    const { parquetMetadataAsync: t, parquetReadObjects: n } = await u(
        async () => {
          const { parquetMetadataAsync: o, parquetReadObjects: l } =
            await import('./index-BWpe4vWn.js');
          return { parquetMetadataAsync: o, parquetReadObjects: l };
        },
        [],
        import.meta.url,
      ),
      r = { byteLength: e.byteLength, slice: (o, l) => e.slice(o, l) },
      a = await t(r),
      i = await n({ file: r, rowFormat: 'object', rowEnd: 30 });
    return {
      title: 'Parquet 列式数据预览',
      summary: [
        { label: '行数', value: a.num_rows?.toString?.() || '-' },
        { label: '列数', value: String(a.schema?.filter((o) => o.name).length || 0) },
        { label: '渲染方式', value: 'hyparquet' },
      ],
      rows: b(i),
    };
  },
  E = async (e) => {
    const n = (
        await u(
          () => import('./avsc-CuDJ5jJf.js').then((i) => i.a),
          __vite__mapDeps([5, 1, 2, 3, 4]),
          import.meta.url,
        )
      ).createBlobDecoder(new Blob([e])),
      r = [];
    let a = '';
    return (
      await new Promise((i, o) => {
        (n.on('metadata', (l) => {
          a = l?.toString?.() || '';
        }),
          n.on('data', (l) => {
            r.length < 30 && r.push(l);
          }),
          n.on('end', i),
          n.on('error', o));
      }),
      {
        title: 'Avro 对象容器预览',
        summary: [
          { label: '示例行', value: String(r.length) },
          { label: 'Schema', value: a ? '已读取' : '未读取' },
          { label: '渲染方式', value: 'avsc' },
        ],
        rows: b(r),
        text: a.slice(0, 6e3),
      }
    );
  },
  W = async (e) => {
    const t = await WebAssembly.compile(e.slice(0)),
      n = WebAssembly.Module.imports(t),
      r = WebAssembly.Module.exports(t);
    return {
      title: 'WebAssembly 模块预览',
      summary: [
        { label: '导入', value: String(n.length) },
        { label: '导出', value: String(r.length) },
        { label: '渲染方式', value: 'WebAssembly.Module' },
      ],
      rows: b([
        ...n.map((a) => ({ kind: 'import', module: a.module, name: a.name, type: a.kind })),
        ...r.map((a) => ({ kind: 'export', module: '-', name: a.name, type: a.kind })),
      ]),
    };
  },
  k = async (e, t) => ({
    title: t === 'eps' ? 'EPS 矢量文件摘要' : 'Illustrator 文件摘要',
    summary: [
      { label: 'Magic', value: f(e).replace(/\s/g, ' ') },
      { label: '大小', value: h(e.byteLength) },
      {
        label: '说明',
        value: t === 'ai' ? '非 PDF-compatible AI 按摘要展示' : 'PostScript 摘要展示',
      },
    ],
    text: w(e),
  }),
  q = async (e) => ({
    title: 'WebArchive 摘要预览',
    summary: [
      { label: '容器', value: f(e).startsWith('bplist') ? 'Binary plist' : 'WebArchive' },
      { label: '大小', value: h(e.byteLength) },
      { label: '说明', value: '安全提取可读片段，不执行网页脚本' },
    ],
    text: w(e),
  }),
  D = async (e, t, n, r) =>
    n in _
      ? C(e, t, n)
      : n === 'sqlite'
        ? L(e, t, r)
        : n === 'parquet'
          ? P(t)
          : n === 'avro'
            ? E(t)
            : n === 'wasm'
              ? W(t)
              : n === 'ai' || n === 'eps'
                ? k(t, n)
                : n === 'webarchive'
                  ? q(t)
                  : {
                      title: '数据资产摘要',
                      summary: [
                        { label: '格式', value: n.toUpperCase() },
                        { label: '大小', value: h(t.byteLength) },
                      ],
                      text: w(t),
                    },
  M = (e, t, n) => {
    const r = s(e, 'div', 'data-summary');
    (n.forEach((a) => {
      const i = s(e, 'div');
      (i.append(s(e, 'span', void 0, a.label), s(e, 'strong', void 0, a.value)), r.appendChild(i));
    }),
      t.appendChild(r));
  },
  U = (e, t, n) => {
    if (!n?.length) return;
    const r = Object.keys(n[0]),
      a = s(e, 'div', 'data-table-wrap'),
      i = s(e, 'table', 'data-table'),
      o = s(e, 'thead'),
      l = s(e, 'tr');
    (r.forEach((p) => {
      l.appendChild(s(e, 'th', void 0, p));
    }),
      o.appendChild(l));
    const d = s(e, 'tbody');
    (n.forEach((p) => {
      const c = s(e, 'tr');
      (r.forEach((m) => {
        c.appendChild(s(e, 'td', void 0, String(p[m] ?? '')));
      }),
        d.appendChild(c));
    }),
      i.append(o, d),
      a.appendChild(i),
      t.appendChild(a));
  },
  B = (e, t, n) => {
    const r = s(e, 'div', 'data-viewer'),
      a = s(e, 'section', 'data-card'),
      i = s(e, 'header', 'data-header');
    if (
      (i.append(s(e, 'span', void 0, n.toUpperCase()), s(e, 'h2', void 0, t.title)),
      a.appendChild(i),
      M(e, a, t.summary),
      t.fontFamily)
    ) {
      const o = s(e, 'div', 'font-preview', A);
      ((o.style.fontFamily = t.fontFamily), a.appendChild(o));
    }
    if (t.image) {
      const o = s(e, 'div', 'asset-image'),
        l = s(e, 'img');
      ((l.src = t.image), (l.alt = '资产预览'), o.appendChild(l), a.appendChild(o));
    }
    return (
      t.text && a.appendChild(s(e, 'pre', 'asset-text', t.text)),
      U(e, a, t.rows),
      r.appendChild(a),
      r
    );
  };
async function z(e, t, n = 'bin', r) {
  const a = t.ownerDocument || document,
    i = n.toLowerCase();
  if (i === 'ai' && f(e, 5) === '%PDF-' && r?.renderNestedBuffer) {
    const d = await r.renderNestedBuffer(e, 'pdf', t, r);
    if (d) return d;
  }
  if (i === 'psd') {
    const { default: d } = await u(
      async () => {
        const { default: p } = await import('./psd-oIuPg7-F.js');
        return { default: p };
      },
      __vite__mapDeps([6, 2, 1, 3, 4, 7, 8, 9]),
      import.meta.url,
    );
    return d(e, t);
  }
  const o = await D(a, e, i, r),
    l = B(a, o, i);
  return (
    t.replaceChildren(S(a), l),
    {
      $el: l,
      unmount() {
        t.replaceChildren();
      },
    }
  );
}
export { z as default };
