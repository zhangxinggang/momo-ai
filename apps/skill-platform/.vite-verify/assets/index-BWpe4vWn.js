const he = [
    'BOOLEAN',
    'INT32',
    'INT64',
    'INT96',
    'FLOAT',
    'DOUBLE',
    'BYTE_ARRAY',
    'FIXED_LEN_BYTE_ARRAY',
  ],
  M = [
    'PLAIN',
    'GROUP_VAR_INT',
    'PLAIN_DICTIONARY',
    'RLE',
    'BIT_PACKED',
    'DELTA_BINARY_PACKED',
    'DELTA_LENGTH_BYTE_ARRAY',
    'DELTA_BYTE_ARRAY',
    'RLE_DICTIONARY',
    'BYTE_STREAM_SPLIT',
  ],
  et = ['REQUIRED', 'OPTIONAL', 'REPEATED'],
  tt = [
    'UTF8',
    'MAP',
    'MAP_KEY_VALUE',
    'LIST',
    'ENUM',
    'DECIMAL',
    'DATE',
    'TIME_MILLIS',
    'TIME_MICROS',
    'TIMESTAMP_MILLIS',
    'TIMESTAMP_MICROS',
    'UINT_8',
    'UINT_16',
    'UINT_32',
    'UINT_64',
    'INT_8',
    'INT_16',
    'INT_32',
    'INT_64',
    'JSON',
    'BSON',
    'INTERVAL',
  ],
  nt = ['UNCOMPRESSED', 'SNAPPY', 'GZIP', 'LZO', 'BROTLI', 'LZ4', 'ZSTD', 'LZ4_RAW'],
  xe = ['DATA_PAGE', 'INDEX_PAGE', 'DICTIONARY_PAGE', 'DATA_PAGE_V2'],
  it = ['SPHERICAL', 'VINCENTY', 'THOMAS', 'ANDOYER', 'KARNEY'];
function fe(e) {
  const t = G(e);
  if (t.type === 1) return { type: 'Point', coordinates: re(e, t) };
  if (t.type === 2) return { type: 'LineString', coordinates: oe(e, t) };
  if (t.type === 3) return { type: 'Polygon', coordinates: we(e, t) };
  if (t.type === 4) {
    const n = [];
    for (let i = 0; i < t.count; i++) n.push(re(e, G(e)));
    return { type: 'MultiPoint', coordinates: n };
  } else if (t.type === 5) {
    const n = [];
    for (let i = 0; i < t.count; i++) n.push(oe(e, G(e)));
    return { type: 'MultiLineString', coordinates: n };
  } else if (t.type === 6) {
    const n = [];
    for (let i = 0; i < t.count; i++) n.push(we(e, G(e)));
    return { type: 'MultiPolygon', coordinates: n };
  } else if (t.type === 7) {
    const n = [];
    for (let i = 0; i < t.count; i++) n.push(fe(e));
    return { type: 'GeometryCollection', geometries: n };
  } else throw new Error(`Unsupported geometry type: ${t.type}`);
}
function G(e) {
  const { view: t } = e,
    n = t.getUint8(e.offset++) === 1,
    i = t.getUint32(e.offset, n);
  e.offset += 4;
  const f = i % 1e3,
    r = Math.floor(i / 1e3);
  let s = 0;
  f > 1 && f <= 7 && ((s = t.getUint32(e.offset, n)), (e.offset += 4));
  let o = 2;
  return (r && o++, r === 3 && o++, { littleEndian: n, type: f, dim: o, count: s });
}
function re(e, t) {
  const n = [];
  for (let i = 0; i < t.dim; i++) {
    const f = e.view.getFloat64(e.offset, t.littleEndian);
    ((e.offset += 8), n.push(f));
  }
  return n;
}
function oe(e, t) {
  const n = [];
  for (let i = 0; i < t.count; i++) n.push(re(e, t));
  return n;
}
function we(e, t) {
  const { view: n } = e,
    i = [];
  for (let f = 0; f < t.count; f++) {
    const r = n.getUint32(e.offset, t.littleEndian);
    ((e.offset += 4), i.push(oe(e, { ...t, count: r })));
  }
  return i;
}
const Pe = new TextDecoder(),
  X = {
    timestampFromMilliseconds(e) {
      return new Date(Number(e));
    },
    timestampFromMicroseconds(e) {
      return new Date(Number(e / 1000n));
    },
    timestampFromNanoseconds(e) {
      return new Date(Number(e / 1000000n));
    },
    dateFromDays(e) {
      return new Date(e * 864e5);
    },
    stringFromBytes(e) {
      return e && Pe.decode(e);
    },
    geometryFromBytes(e) {
      return e && fe({ view: new DataView(e.buffer, e.byteOffset, e.byteLength), offset: 0 });
    },
    geographyFromBytes(e) {
      return e && fe({ view: new DataView(e.buffer, e.byteOffset, e.byteLength), offset: 0 });
    },
    uuidFromBytes(e) {
      if (!e) return;
      const t = Array.from(e, (n) => n.toString(16).padStart(2, '0')).join('');
      return (
        t.slice(0, 8) +
        '-' +
        t.slice(8, 12) +
        '-' +
        t.slice(12, 16) +
        '-' +
        t.slice(16, 20) +
        '-' +
        t.slice(20, 32)
      );
    },
  };
function me(e, t, n, i) {
  if (t && n.endsWith('_DICTIONARY')) {
    let f = e;
    e instanceof Uint8Array && !(t instanceof Uint8Array) && (f = new t.constructor(e.length));
    for (let r = 0; r < e.length; r++) f[r] = t[e[r]];
    return f;
  } else return $e(e, i);
}
function $e(e, t) {
  const { element: n, parsers: i, utf8: f = !0, schemaPath: r } = t,
    { type: s, converted_type: o, logical_type: c } = n,
    d = n.repetition_type !== 'REQUIRED';
  if (
    r?.some((l) => l.element.logical_type?.type === 'VARIANT') &&
    s === 'BYTE_ARRAY' &&
    o !== 'UTF8' &&
    c?.type !== 'STRING'
  )
    return e;
  if (o === 'DECIMAL') {
    const a = 10 ** -(n.scale || 0),
      h = new Array(e.length);
    for (let g = 0; g < h.length; g++)
      e[g] instanceof Uint8Array ? (h[g] = Fe(e[g]) * a) : (h[g] = Number(e[g]) * a);
    return h;
  }
  if (!o && s === 'INT96') return Array.from(e).map((l) => i.timestampFromNanoseconds(ft(l)));
  if (o === 'DATE') return Array.from(e).map((l) => i.dateFromDays(l));
  if (o === 'TIMESTAMP_MILLIS') return Array.from(e).map((l) => i.timestampFromMilliseconds(l));
  if (o === 'TIMESTAMP_MICROS') return Array.from(e).map((l) => i.timestampFromMicroseconds(l));
  if (o === 'JSON') return e.map((l) => JSON.parse(Pe.decode(l)));
  if (o === 'BSON') throw new Error('parquet bson not supported');
  if (o === 'INTERVAL') throw new Error('parquet interval not supported');
  if (c?.type === 'GEOMETRY') return e.map((l) => i.geometryFromBytes(l));
  if (c?.type === 'GEOGRAPHY') return e.map((l) => i.geographyFromBytes(l));
  if (c?.type === 'UUID') return e.map((l) => i.uuidFromBytes(l));
  if (o === 'UTF8' || c?.type === 'STRING' || (f && s === 'BYTE_ARRAY'))
    return e.map((l) => i.stringFromBytes(l));
  if (o === 'UINT_64' || (c?.type === 'INTEGER' && c.bitWidth === 64 && !c.isSigned)) {
    if (e instanceof BigInt64Array) return new BigUint64Array(e.buffer, e.byteOffset, e.length);
    const l = d ? new Array(e.length) : new BigUint64Array(e.length);
    for (let a = 0; a < l.length; a++) l[a] = e[a];
    return l;
  }
  if (o === 'UINT_32' || (c?.type === 'INTEGER' && c.bitWidth === 32 && !c.isSigned)) {
    if (e instanceof Int32Array) return new Uint32Array(e.buffer, e.byteOffset, e.length);
    const l = d ? new Array(e.length) : new Uint32Array(e.length);
    for (let a = 0; a < l.length; a++) l[a] = e[a] < 0 ? 4294967296 + e[a] : e[a];
    return l;
  }
  if (c?.type === 'FLOAT16') return Array.from(e).map(Ce);
  if (c?.type === 'TIMESTAMP') {
    const { unit: l } = c;
    let a = i.timestampFromMilliseconds;
    (l === 'MICROS' && (a = i.timestampFromMicroseconds),
      l === 'NANOS' && (a = i.timestampFromNanoseconds));
    const h = new Array(e.length);
    for (let g = 0; g < h.length; g++) h[g] = a(e[g]);
    return h;
  }
  return e;
}
function Fe(e) {
  if (!e.length) return 0;
  let t = 0n;
  for (const i of e) t = t * 256n + BigInt(i);
  const n = e.length * 8;
  return (t >= 2n ** BigInt(n - 1) && (t -= 2n ** BigInt(n)), Number(t));
}
function ft(e) {
  const t = (e >> 64n) - 2440588n,
    n = e & 0xffffffffffffffffn;
  return t * 86400000000000n + n;
}
function Ce(e) {
  if (!e) return;
  const t = (e[1] << 8) | e[0],
    n = t >> 15 ? -1 : 1,
    i = (t >> 10) & 31,
    f = t & 1023;
  return i === 0
    ? n * 2 ** -14 * (f / 1024)
    : i === 31
      ? f
        ? NaN
        : n * (1 / 0)
      : n * 2 ** (i - 15) * (1 + f / 1024);
}
function ke(e, t, n) {
  const i = e[t],
    f = [];
  let r = 1;
  if (i.num_children)
    for (; f.length < i.num_children; ) {
      const s = e[t + r],
        o = ke(e, t + r, [...n, s.name]);
      ((r += o.count), f.push(o));
    }
  return { count: r, element: i, children: f, path: n };
}
function Ye(e, t) {
  let n = ke(e, 0, []);
  const i = [n];
  for (const f of t) {
    const r = n.children.find((s) => s.element.name === f);
    if (!r) throw new Error(`parquet schema element not found: ${t}`);
    (i.push(r), (n = r));
  }
  return i;
}
function qe(e) {
  const t = [];
  function n(i) {
    if (i.children.length) for (const f of i.children) n(f);
    else t.push(i.path.join('.'));
  }
  return (n(e), t);
}
function je(e) {
  let t = 0;
  for (const { element: n } of e) n.repetition_type === 'REPEATED' && t++;
  return t;
}
function ae(e) {
  let t = 0;
  for (const { element: n } of e.slice(1)) n.repetition_type !== 'REQUIRED' && t++;
  return t;
}
function rt(e) {
  if (!e || e.element.converted_type !== 'LIST' || e.children.length > 1) return !1;
  const t = e.children[0];
  return !(t.children.length > 1 || t.element.repetition_type !== 'REPEATED');
}
function ot(e) {
  if (!e || e.element.converted_type !== 'MAP' || e.children.length > 1) return !1;
  const t = e.children[0];
  return !(
    t.children.length !== 2 ||
    t.element.repetition_type !== 'REPEATED' ||
    t.children.find((f) => f.element.name === 'key')?.element.repetition_type === 'REPEATED' ||
    t.children.find((f) => f.element.name === 'value')?.element.repetition_type === 'REPEATED'
  );
}
function Ve(e) {
  if (e.length !== 2) return !1;
  const [, t] = e;
  return !(t.element.repetition_type === 'REPEATED' || t.children.length);
}
const st = 0,
  pe = 1,
  Ae = 2,
  Ee = 3,
  lt = 4,
  ct = 5,
  ut = 6,
  at = 7,
  _t = 8,
  dt = 9,
  yt = 12;
function j(e) {
  const t = {};
  let n = 0;
  for (; e.offset < e.view.byteLength; ) {
    const i = e.view.getUint8(e.offset++),
      f = i & 15;
    if (f === st) break;
    const r = i >> 4;
    ((n = r ? n + r : Ge(e)), (t[`field_${n}`] = se(e, f)));
  }
  return t;
}
function se(e, t) {
  switch (t) {
    case pe:
      return !0;
    case Ae:
      return !1;
    case Ee:
      return e.view.getInt8(e.offset++);
    case lt:
    case ct:
      return Ge(e);
    case ut:
      return le(e);
    case at: {
      const n = e.view.getFloat64(e.offset, !0);
      return ((e.offset += 8), n);
    }
    case _t: {
      const n = D(e),
        i = new Uint8Array(e.view.buffer, e.view.byteOffset + e.offset, n);
      return ((e.offset += n), i);
    }
    case dt: {
      const n = e.view.getUint8(e.offset++),
        i = n & 15;
      let f = n >> 4;
      f === 15 && (f = D(e));
      const r = i === pe || i === Ae,
        s = new Array(f);
      for (let o = 0; o < f; o++) s[o] = r ? se(e, Ee) === 1 : se(e, i);
      return s;
    }
    case yt:
      return j(e);
    default:
      throw new Error(`thrift unhandled type: ${t}`);
  }
}
function D(e) {
  let t = 0,
    n = 0;
  for (;;) {
    const i = e.view.getUint8(e.offset++);
    if (((t |= (i & 127) << n), !(i & 128))) return t;
    n += 7;
  }
}
function gt(e) {
  let t = 0n,
    n = 0n;
  for (;;) {
    const i = e.view.getUint8(e.offset++);
    if (((t |= BigInt(i & 127) << n), !(i & 128))) return t;
    n += 7n;
  }
}
function Ge(e) {
  const t = D(e);
  return (t >>> 1) ^ -(t & 1);
}
function le(e) {
  const t = gt(e);
  return (t >> 1n) ^ -(t & 1n);
}
function ht(e, t) {
  const n = new Map(),
    i = t?.find(({ key: r }) => r === 'geo')?.value,
    f = (i && JSON.parse(i)?.columns) ?? {};
  for (const [r, s] of Object.entries(f)) {
    if (s.encoding !== 'WKB') continue;
    const o = s.edges === 'spherical' ? 'GEOGRAPHY' : 'GEOMETRY',
      c = s.crs?.id ?? s.crs?.ids?.[0],
      d = c ? `${c.authority}:${c.code.toString()}` : void 0;
    n.set(r, { type: o, crs: d });
  }
  for (let r = 1; r < e.length; r++) {
    const { logical_type: s, name: o, num_children: c, type: d } = e[r];
    if (c) {
      r += c;
      continue;
    }
    d === 'BYTE_ARRAY' && !s && (e[r].logical_type = n.get(o));
  }
}
const wt = 1 << 19,
  mt = new TextDecoder();
function L(e) {
  return e && mt.decode(e);
}
async function pt(e, { parsers: t, initialFetchSize: n = wt, geoparquet: i = !0 } = {}) {
  if (!e || !(e.byteLength >= 0)) throw new Error('parquet expected AsyncBuffer');
  const f = Math.max(0, e.byteLength - n),
    r = await e.slice(f, e.byteLength),
    s = new DataView(r);
  if (s.getUint32(r.byteLength - 4, !0) !== 827474256)
    throw new Error('parquet file invalid (footer != PAR1)');
  const o = s.getUint32(r.byteLength - 8, !0);
  if (o > e.byteLength - 8)
    throw new Error(`parquet metadata length ${o} exceeds available buffer ${e.byteLength - 8}`);
  if (o + 8 > n) {
    const c = e.byteLength - o - 8,
      d = await e.slice(c, f),
      _ = new ArrayBuffer(o + 8),
      l = new Uint8Array(_);
    return (
      l.set(new Uint8Array(d)),
      l.set(new Uint8Array(r), f - c),
      Ie(_, { parsers: t, geoparquet: i })
    );
  } else return Ie(r, { parsers: t, geoparquet: i });
}
function Ie(e, { parsers: t, geoparquet: n = !0 } = {}) {
  if (!(e instanceof ArrayBuffer)) throw new Error('parquet expected ArrayBuffer');
  const i = new DataView(e);
  if (((t = { ...X, ...t }), i.byteLength < 8)) throw new Error('parquet file is too short');
  if (i.getUint32(i.byteLength - 4, !0) !== 827474256)
    throw new Error('parquet file invalid (footer != PAR1)');
  const f = i.byteLength - 8,
    r = i.getUint32(f, !0);
  if (r > i.byteLength - 8)
    throw new Error(`parquet metadata length ${r} exceeds available buffer ${i.byteLength - 8}`);
  const s = f - r,
    c = j({ view: i, offset: s }),
    d = c.field_1,
    _ = c.field_2.map((y) => ({
      type: he[y.field_1],
      type_length: y.field_2,
      repetition_type: et[y.field_3],
      name: L(y.field_4),
      num_children: y.field_5,
      converted_type: tt[y.field_6],
      scale: y.field_7,
      precision: y.field_8,
      field_id: y.field_9,
      logical_type: At(y.field_10),
    })),
    l = _.filter((y) => y.type),
    a = c.field_3,
    h = c.field_4.map((y) => ({
      columns: y.field_1.map((u, p) => ({
        file_path: L(u.field_1),
        file_offset: u.field_2,
        meta_data: u.field_3 && {
          type: he[u.field_3.field_1],
          encodings: u.field_3.field_2?.map((m) => M[m]),
          path_in_schema: u.field_3.field_3.map(L),
          codec: nt[u.field_3.field_4],
          num_values: u.field_3.field_5,
          total_uncompressed_size: u.field_3.field_6,
          total_compressed_size: u.field_3.field_7,
          key_value_metadata: u.field_3.field_8?.map((m) => ({
            key: L(m.field_1),
            value: L(m.field_2),
          })),
          data_page_offset: u.field_3.field_9,
          index_page_offset: u.field_3.field_10,
          dictionary_page_offset: u.field_3.field_11,
          statistics: Et(u.field_3.field_12, l[p], t),
          encoding_stats: u.field_3.field_13?.map((m) => ({
            page_type: xe[m.field_1],
            encoding: M[m.field_2],
            count: m.field_3,
          })),
          bloom_filter_offset: u.field_3.field_14,
          bloom_filter_length: u.field_3.field_15,
          size_statistics: u.field_3.field_16 && {
            unencoded_byte_array_data_bytes: u.field_3.field_16.field_1,
            repetition_level_histogram: u.field_3.field_16.field_2,
            definition_level_histogram: u.field_3.field_16.field_3,
          },
          geospatial_statistics: u.field_3.field_17 && {
            bbox: u.field_3.field_17.field_1 && {
              xmin: u.field_3.field_17.field_1.field_1,
              xmax: u.field_3.field_17.field_1.field_2,
              ymin: u.field_3.field_17.field_1.field_3,
              ymax: u.field_3.field_17.field_1.field_4,
              zmin: u.field_3.field_17.field_1.field_5,
              zmax: u.field_3.field_17.field_1.field_6,
              mmin: u.field_3.field_17.field_1.field_7,
              mmax: u.field_3.field_17.field_1.field_8,
            },
            geospatial_types: u.field_3.field_17.field_2,
          },
        },
        offset_index_offset: u.field_4,
        offset_index_length: u.field_5,
        column_index_offset: u.field_6,
        column_index_length: u.field_7,
        crypto_metadata: u.field_8,
        encrypted_column_metadata: u.field_9,
      })),
      total_byte_size: y.field_2,
      num_rows: y.field_3,
      sorting_columns: y.field_4?.map((u) => ({
        column_idx: u.field_1,
        descending: u.field_2,
        nulls_first: u.field_3,
      })),
      file_offset: y.field_5,
      total_compressed_size: y.field_6,
      ordinal: y.field_7,
    })),
    g = c.field_5?.map((y) => ({ key: L(y.field_1), value: L(y.field_2) })),
    w = L(c.field_6);
  return (
    n && ht(_, g),
    {
      version: d,
      schema: _,
      num_rows: a,
      row_groups: h,
      key_value_metadata: g,
      created_by: w,
      metadata_length: r,
    }
  );
}
function k({ schema: e }) {
  return Ye(e, [])[0];
}
function At(e) {
  return e?.field_1
    ? { type: 'STRING' }
    : e?.field_2
      ? { type: 'MAP' }
      : e?.field_3
        ? { type: 'LIST' }
        : e?.field_4
          ? { type: 'ENUM' }
          : e?.field_5
            ? { type: 'DECIMAL', scale: e.field_5.field_1, precision: e.field_5.field_2 }
            : e?.field_6
              ? { type: 'DATE' }
              : e?.field_7
                ? { type: 'TIME', isAdjustedToUTC: e.field_7.field_1, unit: be(e.field_7.field_2) }
                : e?.field_8
                  ? {
                      type: 'TIMESTAMP',
                      isAdjustedToUTC: e.field_8.field_1,
                      unit: be(e.field_8.field_2),
                    }
                  : e?.field_10
                    ? {
                        type: 'INTEGER',
                        bitWidth: e.field_10.field_1,
                        isSigned: e.field_10.field_2,
                      }
                    : e?.field_11
                      ? { type: 'NULL' }
                      : e?.field_12
                        ? { type: 'JSON' }
                        : e?.field_13
                          ? { type: 'BSON' }
                          : e?.field_14
                            ? { type: 'UUID' }
                            : e?.field_15
                              ? { type: 'FLOAT16' }
                              : e?.field_16
                                ? { type: 'VARIANT', specification_version: e.field_16.field_1 }
                                : e?.field_17
                                  ? { type: 'GEOMETRY', crs: L(e.field_17.field_1) }
                                  : e?.field_18
                                    ? {
                                        type: 'GEOGRAPHY',
                                        crs: L(e.field_18.field_1),
                                        algorithm: it[e.field_18.field_2],
                                      }
                                    : e;
}
function be(e) {
  if (e.field_1) return 'MILLIS';
  if (e.field_2) return 'MICROS';
  if (e.field_3) return 'NANOS';
  throw new Error('parquet time unit required');
}
function Et(e, t, n) {
  return (
    e && {
      max: z(e.field_1, t, n),
      min: z(e.field_2, t, n),
      null_count: e.field_3,
      distinct_count: e.field_4,
      max_value: z(e.field_5, t, n),
      min_value: z(e.field_6, t, n),
      is_max_value_exact: e.field_7,
      is_min_value_exact: e.field_8,
    }
  );
}
function z(e, t, n) {
  const { type: i, converted_type: f, logical_type: r } = t;
  if (e === void 0) return e;
  if (i === 'BOOLEAN') return e[0] === 1;
  if (i === 'BYTE_ARRAY') return n.stringFromBytes(e);
  const s = new DataView(e.buffer, e.byteOffset, e.byteLength);
  return i === 'FLOAT' && s.byteLength === 4
    ? s.getFloat32(0, !0)
    : i === 'DOUBLE' && s.byteLength === 8
      ? s.getFloat64(0, !0)
      : i === 'INT32' && f === 'DATE'
        ? n.dateFromDays(s.getInt32(0, !0))
        : i === 'INT64' && f === 'TIMESTAMP_MILLIS'
          ? n.timestampFromMilliseconds(s.getBigInt64(0, !0))
          : i === 'INT64' && f === 'TIMESTAMP_MICROS'
            ? n.timestampFromMicroseconds(s.getBigInt64(0, !0))
            : i === 'INT64' && r?.type === 'TIMESTAMP' && r?.unit === 'NANOS'
              ? n.timestampFromNanoseconds(s.getBigInt64(0, !0))
              : i === 'INT64' && r?.type === 'TIMESTAMP' && r?.unit === 'MICROS'
                ? n.timestampFromMicroseconds(s.getBigInt64(0, !0))
                : i === 'INT64' && r?.type === 'TIMESTAMP'
                  ? n.timestampFromMilliseconds(s.getBigInt64(0, !0))
                  : i === 'INT32' && s.byteLength === 4
                    ? s.getInt32(0, !0)
                    : i === 'INT64' && s.byteLength === 8
                      ? s.getBigInt64(0, !0)
                      : f === 'DECIMAL'
                        ? Fe(e) * 10 ** -(t.scale || 0)
                        : r?.type === 'FLOAT16'
                          ? Ce(e)
                          : r?.type === 'UUID'
                            ? n.uuidFromBytes(e)
                            : e;
}
function It(e) {
  const t = j(e);
  return {
    page_locations: t.field_1.map((n) => ({
      offset: n.field_1,
      compressed_page_size: n.field_2,
      first_row_index: n.field_3,
    })),
    unencoded_byte_array_data_bytes: t.field_2,
  };
}
const v = 0xffffffffffffffffn,
  U = 0x9e3779b185ebca87n,
  $ = 0xc2b2ae3d27d4eb4fn,
  ve = 0x165667b19e3779f9n,
  ze = 0x85ebca77c2b2ae63n,
  Te = 0x27d4eb2f165667c5n;
function N(e, t) {
  return ((e << t) | (e >> (64n - t))) & v;
}
function x(e, t) {
  return ((e = (e + t * $) & v), (e = N(e, 31n)), (e * U) & v);
}
function W(e, t) {
  return ((e ^= x(0n, t)), (e * U + ze) & v);
}
function R(e, t = 0n) {
  const n = new DataView(e.buffer, e.byteOffset, e.byteLength),
    i = e.byteLength;
  let f = 0,
    r;
  if (i >= 32) {
    let s = (t + U + $) & v,
      o = (t + $) & v,
      c = t,
      d = (t - U) & v;
    for (; f + 32 <= i; )
      ((s = x(s, n.getBigUint64(f, !0))),
        (f += 8),
        (o = x(o, n.getBigUint64(f, !0))),
        (f += 8),
        (c = x(c, n.getBigUint64(f, !0))),
        (f += 8),
        (d = x(d, n.getBigUint64(f, !0))),
        (f += 8));
    ((r = (N(s, 1n) + N(o, 7n) + N(c, 12n) + N(d, 18n)) & v),
      (r = W(r, s)),
      (r = W(r, o)),
      (r = W(r, c)),
      (r = W(r, d)));
  } else r = (t + Te) & v;
  for (r = (r + BigInt(i)) & v; f + 8 <= i; )
    ((r ^= x(0n, n.getBigUint64(f, !0))), (r = (N(r, 27n) * U + ze) & v), (f += 8));
  for (
    f + 4 <= i &&
    ((r ^= (BigInt(n.getUint32(f, !0)) * U) & v), (r = (N(r, 23n) * $ + ve) & v), (f += 4));
    f < i;
  )
    ((r ^= (BigInt(n.getUint8(f)) * Te) & v), (r = (N(r, 11n) * U) & v), (f += 1));
  return (
    (r ^= r >> 33n),
    (r = (r * $) & v),
    (r ^= r >> 29n),
    (r = (r * ve) & v),
    (r ^= r >> 32n),
    r
  );
}
const bt = new TextEncoder(),
  vt = new Uint32Array([
    1203114875, 1150766481, 2284105051, 2729912477, 1884591559, 770785867, 2667333959, 1550580529,
  ]);
function Tt(e, t) {
  return Number(((e >> 32n) * BigInt(t)) >> 32n);
}
function Lt(e) {
  const t = new Uint32Array(8),
    n = Number(e & 0xffffffffn) | 0;
  for (let i = 0; i < 8; i++) t[i] = 1 << (Math.imul(n, vt[i]) >>> 27);
  return t;
}
function Le(e, t) {
  const n = Tt(t, e.length >> 3) << 3,
    i = Lt(t);
  for (let f = 0; f < 8; f++) if ((e[n + f] & i[f]) === 0) return !1;
  return !0;
}
function Rt(e) {
  const t = j(e),
    n = t.field_1;
  if (
    typeof n != 'number' ||
    n <= 0 ||
    n % 32 !== 0 ||
    !t.field_2?.field_1 ||
    !t.field_3?.field_1 ||
    !t.field_4?.field_1
  )
    return;
  const { view: i, offset: f } = e;
  if (f + n > i.byteLength)
    throw new Error(`parquet bloom filter truncated: need ${n} bytes, have ${i.byteLength - f}`);
  const r = new Uint32Array(n >> 2);
  for (let s = 0; s < r.length; s++) r[s] = i.getUint32(f + s * 4, !0);
  return ((e.offset = f + n), { numBytes: n, blocks: r });
}
function Re(e, t) {
  if (e == null) return;
  const { type: n, converted_type: i, logical_type: f } = t;
  if (n === 'BOOLEAN') return typeof e != 'boolean' ? void 0 : R(new Uint8Array([e ? 1 : 0]));
  if (n === 'FLOAT') {
    if (typeof e != 'number') return;
    const r = new ArrayBuffer(4);
    return (new DataView(r).setFloat32(0, e, !0), R(new Uint8Array(r)));
  }
  if (n === 'DOUBLE') {
    if (typeof e != 'number') return;
    const r = new ArrayBuffer(8);
    return (new DataView(r).setFloat64(0, e, !0), R(new Uint8Array(r)));
  }
  if (n === 'INT32') {
    if (
      i === 'DATE' ||
      i === 'DECIMAL' ||
      i === 'TIME_MILLIS' ||
      f?.type === 'DATE' ||
      f?.type === 'TIME' ||
      f?.type === 'DECIMAL' ||
      typeof e != 'number' ||
      !Number.isInteger(e)
    )
      return;
    const r = new ArrayBuffer(4);
    return (new DataView(r).setInt32(0, e | 0, !0), R(new Uint8Array(r)));
  }
  if (n === 'INT64') {
    if (
      i === 'TIMESTAMP_MILLIS' ||
      i === 'TIMESTAMP_MICROS' ||
      i === 'TIME_MICROS' ||
      i === 'DECIMAL' ||
      f?.type === 'TIMESTAMP' ||
      f?.type === 'TIME' ||
      f?.type === 'DECIMAL'
    )
      return;
    let r;
    if (typeof e == 'bigint') r = e;
    else if (typeof e == 'number' && Number.isSafeInteger(e)) r = BigInt(e);
    else return;
    const s = new ArrayBuffer(8);
    return (new DataView(s).setBigUint64(0, BigInt.asUintN(64, r), !0), R(new Uint8Array(s)));
  }
  if (n === 'BYTE_ARRAY')
    return i === 'JSON' ||
      i === 'BSON' ||
      i === 'DECIMAL' ||
      f?.type === 'JSON' ||
      f?.type === 'BSON' ||
      f?.type === 'VARIANT' ||
      f?.type === 'GEOMETRY' ||
      f?.type === 'GEOGRAPHY'
      ? void 0
      : typeof e == 'string'
        ? R(bt.encode(e))
        : e instanceof Uint8Array
          ? R(e)
          : void 0;
  if (n === 'FIXED_LEN_BYTE_ARRAY')
    return i === 'DECIMAL' ||
      i === 'INTERVAL' ||
      f?.type === 'DECIMAL' ||
      f?.type === 'UUID' ||
      f?.type === 'FLOAT16' ||
      f?.type === 'GEOMETRY' ||
      f?.type === 'GEOGRAPHY'
      ? void 0
      : e instanceof Uint8Array
        ? R(e)
        : void 0;
}
function Nt(e) {
  const t = new Set();
  return (ce(e, t), t);
}
function ce(e, t) {
  if (e) {
    if ('$and' in e && Array.isArray(e.$and)) {
      for (const n of e.$and) ce(n, t);
      return;
    }
    if ('$or' in e && Array.isArray(e.$or)) {
      for (const n of e.$or) ce(n, t);
      return;
    }
    if (!('$nor' in e))
      for (const [n, i] of Object.entries(e))
        n.startsWith('$') ||
          (typeof i == 'object' && i !== null && !Array.isArray(i)
            ? ('$eq' in i || '$in' in i) && t.add(n)
            : t.add(n));
  }
}
function We(e, t) {
  for (let i = 0; i < t.length; i += 1e4) e.push(...t.slice(i, i + 1e4));
}
function O(e, t, n = !0) {
  if (n ? e === t : e == t) return !0;
  if (!e || !t || typeof e != 'object' || typeof t != 'object') return !1;
  if (e instanceof Uint8Array && t instanceof Uint8Array) {
    if (e.length !== t.length) return !1;
    for (let f = 0; f < e.length; f++) if (e[f] !== t[f]) return !1;
    return !0;
  }
  if (Array.isArray(e) && Array.isArray(t)) {
    if (e.length !== t.length) return !1;
    for (let f = 0; f < e.length; f++) if (!O(e[f], t[f], n)) return !1;
    return !0;
  }
  const i = Object.keys(e);
  if (i.length !== Object.keys(t).length) return !1;
  for (const f of i) if (!O(e[f], t[f], n)) return !1;
  return !0;
}
function He(e) {
  if (!e) return [];
  if (e.length === 1) return e[0];
  const t = [];
  for (const n of e) We(t, n);
  return t;
}
function H(e) {
  if (!e) return [];
  const t = [];
  return (
    '$and' in e && Array.isArray(e.$and)
      ? t.push(...e.$and.flatMap(H))
      : '$or' in e && Array.isArray(e.$or)
        ? t.push(...e.$or.flatMap(H))
        : '$nor' in e && Array.isArray(e.$nor)
          ? t.push(...e.$nor.flatMap(H))
          : t.push(...Object.keys(e).map((n) => n.split('.')[0])),
    [...new Set(t)]
  );
}
function F(e, t, n = !0) {
  return '$and' in t && Array.isArray(t.$and)
    ? t.$and.every((i) => F(e, i, n))
    : '$or' in t && Array.isArray(t.$or)
      ? t.$or.some((i) => F(e, i, n))
      : '$nor' in t && Array.isArray(t.$nor)
        ? !t.$nor.some((i) => F(e, i, n))
        : Object.entries(t).every(([i, f]) => {
            const r = Ot(e, i);
            return typeof f != 'object' || f === null || Array.isArray(f)
              ? O(r, f, n)
              : Object.entries(f || {}).every(([s, o]) =>
                  s === '$gt'
                    ? r > o
                    : s === '$gte'
                      ? r >= o
                      : s === '$lt'
                        ? r < o
                        : s === '$lte'
                          ? r <= o
                          : s === '$eq'
                            ? O(r, o, n)
                            : s === '$ne'
                              ? !O(r, o, n)
                              : s === '$in'
                                ? Array.isArray(o) && o.includes(r)
                                : s === '$nin'
                                  ? Array.isArray(o) && !o.includes(r)
                                  : s === '$not'
                                    ? !F({ [i]: r }, { [i]: o }, n)
                                    : !0,
                );
          });
}
function Q({
  rowGroup: e,
  physicalColumns: t,
  filter: n,
  strict: i = !0,
  bloomFilters: f,
  schemaElements: r,
}) {
  if (!n) return !1;
  if ('$and' in n && Array.isArray(n.$and))
    return n.$and.some((s) =>
      Q({
        rowGroup: e,
        physicalColumns: t,
        filter: s,
        strict: i,
        bloomFilters: f,
        schemaElements: r,
      }),
    );
  if ('$or' in n && Array.isArray(n.$or))
    return n.$or.every((s) =>
      Q({
        rowGroup: e,
        physicalColumns: t,
        filter: s,
        strict: i,
        bloomFilters: f,
        schemaElements: r,
      }),
    );
  if ('$nor' in n && Array.isArray(n.$nor)) return !1;
  for (const [s, o] of Object.entries(n)) {
    const c = t.indexOf(s);
    if (c === -1) continue;
    const d = e.columns[c].meta_data?.statistics,
      { min: _, max: l, min_value: a, max_value: h } = d || {},
      g = a !== void 0 ? a : _,
      w = h !== void 0 ? h : l,
      y = g !== void 0 && w !== void 0,
      u = f?.[s],
      p = r?.[s];
    for (const [m, A] of Object.entries(o || {})) {
      if (
        y &&
        ((m === '$gt' && w <= A) ||
          (m === '$gte' && w < A) ||
          (m === '$lt' && g >= A) ||
          (m === '$lte' && g > A) ||
          (m === '$eq' && (A < g || A > w)) ||
          (m === '$ne' && O(g, w, i) && O(g, A, i)) ||
          (m === '$in' && Array.isArray(A) && A.every((E) => E < g || E > w)) ||
          (m === '$nin' && Array.isArray(A) && O(g, w, i) && A.includes(g)))
      )
        return !0;
      if (u && p) {
        if (m === '$eq') {
          const E = Re(A, p);
          if (E !== void 0 && !Le(u.blocks, E)) return !0;
        }
        if (m === '$in' && Array.isArray(A) && A.length > 0) {
          let E = !0;
          for (const T of A) {
            const I = Re(T, p);
            if (I === void 0 || Le(u.blocks, I)) {
              E = !1;
              break;
            }
          }
          if (E) return !0;
        }
      }
    }
  }
  return !1;
}
function Ot(e, t) {
  let n = e;
  for (const i of t.split('.')) n = n?.[i];
  return n;
}
const Bt = 1 << 21;
function Mt({
  metadata: e,
  rowStart: t = 0,
  rowEnd: n = 1 / 0,
  columns: i,
  filter: f,
  filterStrict: r = !0,
  useOffsetIndex: s = !1,
  bloomFiltersByGroup: o,
  schemaElements: c,
}) {
  if (!e) throw new Error('parquetPlan requires metadata');
  const d = [],
    _ = [],
    l = [],
    a = qe(k(e));
  let h = 0,
    g = 0;
  for (const w of e.row_groups) {
    const y = Number(w.num_rows),
      u = h + y,
      p = o?.[g];
    if (
      y > 0 &&
      u > t &&
      h < n &&
      !Q({
        rowGroup: w,
        physicalColumns: a,
        filter: f,
        strict: r,
        bloomFilters: p,
        schemaElements: c,
      })
    ) {
      const m = [];
      for (const I of w.columns) {
        const b = I.meta_data;
        if (I.file_path) throw new Error('parquet file_path not supported');
        if (!b) throw new Error('parquet column metadata is undefined');
        if (!i || i.includes(b.path_in_schema[0])) {
          const P = b.dictionary_page_offset || b.data_page_offset,
            V = Number(P),
            ye = Number(P + b.total_compressed_size);
          if (s && I.offset_index_offset && I.offset_index_length && (t > h || n < u)) {
            const ge = Number(I.offset_index_offset);
            m.push({
              columnMetadata: b,
              offsetIndex: { startByte: ge, endByte: ge + I.offset_index_length },
              range: { startByte: V, endByte: ye },
            });
          } else m.push({ columnMetadata: b, range: { startByte: V, endByte: ye } });
        }
      }
      const A = Math.max(t - h, 0),
        E = Math.min(n - h, y);
      d.push({ chunks: m, rowGroup: w, groupStart: h, groupRows: y, selectStart: A, selectEnd: E });
      let T;
      for (const I of m)
        if ('offsetIndex' in I) l.push(I.offsetIndex);
        else {
          const { range: b } = I;
          i
            ? _.push(b)
            : T && b.endByte - T.startByte <= Bt
              ? (T.endByte = b.endByte)
              : (T && _.push(T), (T = { ...b }));
        }
      T && _.push(T);
    }
    ((h = u), g++);
  }
  return (
    isFinite(n) || (n = h),
    _.push(...l),
    { metadata: e, rowStart: t, rowEnd: n, columns: i, fetches: _, groups: d }
  );
}
async function Ut({ file: e, metadata: t, filter: n, filterStrict: i = !0 }) {
  const f = t.row_groups.map(() => ({})),
    r = Nt(n);
  if (r.size === 0) return f;
  const s = qe(k(t)),
    o = [];
  return (
    t.row_groups.forEach((c, d) => {
      if (!Q({ rowGroup: c, physicalColumns: s, filter: n, strict: i }))
        for (const _ of r) {
          const l = s.indexOf(_);
          if (l === -1) continue;
          const a = c.columns[l]?.meta_data;
          if (!a?.bloom_filter_offset || !a.bloom_filter_length) continue;
          const h = Number(a.bloom_filter_offset),
            g = h + a.bloom_filter_length;
          o.push(
            (async () => {
              const w = await e.slice(h, g),
                y = Rt({ view: new DataView(w), offset: 0 });
              y && (f[d][_] = y);
            })(),
          );
        }
    }),
    o.length && (await Promise.all(o)),
    f
  );
}
function Dt(e, { fetches: t }) {
  const n = t.map(({ startByte: i, endByte: f }) => e.slice(i, f));
  return {
    byteLength: e.byteLength,
    slice(i, f = e.byteLength) {
      const r = t.findIndex(({ startByte: s, endByte: o }) => s <= i && f <= o);
      if (r < 0) return e.slice(i, f);
      if (t[r].startByte !== i || t[r].endByte !== f) {
        const s = i - t[r].startByte,
          o = f - t[r].startByte;
        return n[r] instanceof Promise ? n[r].then((c) => c.slice(s, o)) : n[r].slice(s, o);
      } else return n[r];
    },
  };
}
const _e = new TextDecoder(),
  Ne = new WeakMap();
function Ke(e, t = X) {
  if (Array.isArray(e)) return e.map((n) => Ke(n, t));
  if (typeof e != 'object') return e;
  if ('metadata' in e) {
    const n = St(e.metadata),
      i = e.typed_value && K(e.typed_value, n, t),
      f = e.value && Y(J(e.value), n, t);
    return i && f ? { ...f, ...i } : (i ?? f);
  }
  return e;
}
function K(e, t, n) {
  if (e instanceof Date) return e;
  if (e && typeof e == 'object' && !Array.isArray(e) && !(e instanceof Uint8Array)) {
    if ('typed_value' in e && e.typed_value !== null && e.typed_value !== void 0)
      return K(e.typed_value, t, n);
    if ('value' in e && e.value instanceof Uint8Array) return Y(J(e.value), t, n);
    if ('typed_value' in e || 'value' in e) return null;
    const i = {};
    for (const [f, r] of Object.entries(e)) t.dictionary.includes(f) && (i[f] = K(r, t, n));
    return i;
  }
  return e instanceof Uint8Array ? Y(J(e), t, n) : Array.isArray(e) ? e.map((i) => K(i, t, n)) : e;
}
function J(e) {
  return { view: new DataView(e.buffer, e.byteOffset, e.byteLength), offset: 0 };
}
function St(e) {
  let t = Ne.get(e.buffer);
  t || ((t = new Map()), Ne.set(e.buffer, t));
  const n = `${e.byteOffset}:${e.byteLength}`,
    i = t.get(n);
  if (i) return i;
  const f = J(e),
    r = f.view.getUint8(f.offset++),
    s = r & 15;
  if (s !== 1) throw new Error(`parquet unsupported variant metadata version: ${s}`);
  const o = ((r >> 4) & 1) === 1,
    c = ((r >> 6) & 3) + 1,
    d = S(f, c),
    _ = new Array(d + 1);
  for (let g = 0; g < _.length; g++) _[g] = S(f, c);
  const l = f.offset,
    a = new Array(d);
  for (let g = 0; g < d; g++) {
    const w = _[g],
      y = _[g + 1],
      u = new Uint8Array(e.buffer, e.byteOffset + l + w, y - w);
    a[g] = _e.decode(u);
  }
  const h = { dictionary: a, sorted: o };
  return (t.set(n, h), h);
}
function S(e, t) {
  let n = 0;
  for (let i = 0; i < t; i++) n |= e.view.getUint8(e.offset + i) << (i * 8);
  return ((e.offset += t), n);
}
function Y(e, t, n) {
  const i = e.view.getUint8(e.offset++),
    f = i & 3,
    r = i >> 2;
  if (f === 0) return xt(e, r, n);
  if (f === 2) return Pt(e, r, t, n);
  if (f === 3) return $t(e, r, t, n);
  const s = new Uint8Array(e.view.buffer, e.view.byteOffset + e.offset, r);
  return ((e.offset += r), _e.decode(s));
}
function xt(e, t, n) {
  switch (t) {
    case 0:
      return null;
    case 1:
      return !0;
    case 2:
      return !1;
    case 3: {
      const i = e.view.getInt8(e.offset);
      return ((e.offset += 1), i);
    }
    case 4: {
      const i = e.view.getInt16(e.offset, !0);
      return ((e.offset += 2), i);
    }
    case 5: {
      const i = e.view.getInt32(e.offset, !0);
      return ((e.offset += 4), i);
    }
    case 6: {
      const i = e.view.getBigInt64(e.offset, !0);
      return ((e.offset += 8), i);
    }
    case 7: {
      const i = e.view.getFloat64(e.offset, !0);
      return ((e.offset += 8), i);
    }
    case 8:
      return ne(e, 4);
    case 9:
      return ne(e, 8);
    case 10:
      return ne(e, 16);
    case 11: {
      const i = e.view.getInt32(e.offset, !0);
      return ((e.offset += 4), n.dateFromDays(i));
    }
    case 12:
    case 13: {
      const i = e.view.getBigInt64(e.offset, !0);
      return ((e.offset += 8), n.timestampFromMicroseconds(i));
    }
    case 14: {
      const i = e.view.getFloat32(e.offset, !0);
      return ((e.offset += 4), i);
    }
    case 15:
      return Oe(e);
    case 16: {
      const i = Oe(e);
      return _e.decode(i);
    }
    case 17: {
      const i = e.view.getBigInt64(e.offset, !0);
      return ((e.offset += 8), i);
    }
    case 18:
    case 19: {
      const i = e.view.getBigInt64(e.offset, !0);
      return ((e.offset += 8), n.timestampFromNanoseconds(i));
    }
    case 20: {
      const i = new Uint8Array(e.view.buffer, e.view.byteOffset + e.offset, 16);
      e.offset += 16;
      const f = Array.from(i, (r) => r.toString(16).padStart(2, '0')).join('');
      return `${f.slice(0, 8)}-${f.slice(8, 12)}-${f.slice(12, 16)}-${f.slice(16, 20)}-${f.slice(20)}`;
    }
    default:
      throw new Error(`parquet unsupported variant primitive type: ${t}`);
  }
}
function Pt(e, t, n, i) {
  const f = (t & 3) + 1,
    r = ((t >> 2) & 3) + 1,
    o = (t >> 4) & 1 ? S(e, 4) : e.view.getUint8(e.offset++),
    c = new Array(o);
  for (let l = 0; l < o; l++) c[l] = S(e, r);
  const d = new Array(o + 1);
  for (let l = 0; l < d.length; l++) d[l] = S(e, f);
  const _ = {};
  for (let l = 0; l < o; l++) {
    const a = n.dictionary[c[l]],
      h = { view: e.view, offset: e.offset + d[l] };
    _[a] = Y(h, n, i);
  }
  return ((e.offset += d[d.length - 1]), _);
}
function $t(e, t, n, i) {
  const f = t & 3,
    r = (t >> 2) & 1,
    s = f + 1,
    o = S(e, r ? 4 : 1),
    c = new Array(o + 1);
  for (let l = 0; l < c.length; l++) c[l] = S(e, s);
  const d = e.offset,
    _ = new Array(o);
  for (let l = 0; l < o; l++) {
    const a = { view: e.view, offset: d + c[l] };
    _[l] = Y(a, n, i);
  }
  return ((e.offset = d + c[c.length - 1]), _);
}
function ne(e, t) {
  const n = e.view.getUint8(e.offset);
  e.offset += 1;
  let i;
  if (t === 4) ((i = BigInt(e.view.getInt32(e.offset, !0))), (e.offset += 4));
  else if (t === 8) ((i = e.view.getBigInt64(e.offset, !0)), (e.offset += 8));
  else {
    const f = e.view.getBigUint64(e.offset, !0);
    ((i = (e.view.getBigInt64(e.offset + 8, !0) << 64n) | f), (e.offset += 16));
  }
  return Number(i) * 10 ** -n;
}
function Oe(e) {
  const t = e.view.getUint32(e.offset, !0);
  e.offset += 4;
  const n = new Uint8Array(e.view.buffer, e.view.byteOffset + e.offset, t);
  return ((e.offset += t), n);
}
function Be(e, t, n, i, f) {
  const r = ae(f);
  if (!t?.length && !n.length) {
    if (!r || !i.length) return i;
    t = new Array(i.length).fill(r);
  }
  const s = t?.length || n.length,
    o = f.map(({ element: g }) => g.repetition_type);
  let c = 0;
  const d = [e];
  let _ = e,
    l = 0,
    a = 0,
    h = 0;
  if (n[0])
    for (; l < o.length - 2 && h < n[0]; )
      (l++, o[l] !== 'REQUIRED' && ((_ = _.at(-1)), d.push(_), a++), o[l] === 'REPEATED' && h++);
  for (let g = 0; g < s; g++) {
    const w = t?.length ? t[g] : r,
      y = n[g];
    for (; l && (y < h || o[l] !== 'REPEATED'); )
      (o[l] !== 'REQUIRED' && (d.pop(), a--), o[l] === 'REPEATED' && h--, l--);
    for (
      _ = d.at(-1);
      (l < o.length - 2 || o[l + 1] === 'REPEATED') && (a < w || o[l + 1] === 'REQUIRED');
    ) {
      if ((l++, o[l] !== 'REQUIRED')) {
        const u = [];
        (_.push(u), (_ = u), d.push(u), a++);
      }
      o[l] === 'REPEATED' && h++;
    }
    w === r ? _.push(i[c++]) : l === o.length - 2 ? _.push(null) : _.push([]);
  }
  if (!e.length)
    for (let g = 0; g < r; g++) {
      const w = [];
      (_.push(w), (_ = w));
    }
  return e;
}
function C(e, t, n, i = 0) {
  const f = t.path.join('.'),
    r = t.element.repetition_type === 'OPTIONAL',
    s = r ? i + 1 : i;
  if (rt(t)) {
    let o = t.children[0],
      c = s;
    (o.children.length === 1 && ((o = o.children[0]), c++), C(e, o, n, c));
    const d = o.path.join('.'),
      _ = e.get(d);
    if (!_) throw new Error('parquet list column missing values');
    (r && Z(_, i), e.set(f, _), e.delete(d));
    return;
  }
  if (ot(t)) {
    const o = t.children[0].element.name;
    (C(e, t.children[0].children[0], n, s + 1), C(e, t.children[0].children[1], n, s + 1));
    const c = e.get(`${f}.${o}.key`),
      d = e.get(`${f}.${o}.value`);
    if (!c) throw new Error('parquet map column missing keys');
    if (!d) throw new Error('parquet map column missing values');
    if (c.length !== d.length) throw new Error('parquet map column key/value length mismatch');
    const _ = Ze(c, d, s);
    (r && Z(_, i), e.delete(`${f}.${o}.key`), e.delete(`${f}.${o}.value`), e.set(f, _));
    return;
  }
  if (t.children.length) {
    const o = t.element.repetition_type === 'REQUIRED' ? i : i + 1,
      c = {};
    for (const _ of t.children) {
      C(e, _, n, o);
      const l = e.get(_.path.join('.'));
      if (!l) throw new Error('parquet struct missing child data');
      c[_.element.name] = l;
    }
    for (const _ of t.children) e.delete(_.path.join('.'));
    let d = Qe(c, o);
    (t.element.logical_type?.type === 'VARIANT' && (d = Ke(d, n)), r && Z(d, i), e.set(f, d));
  }
}
function Z(e, t) {
  for (let n = 0; n < e.length; n++) t ? Z(e[n], t - 1) : (e[n] = e[n][0]);
}
function Ze(e, t, n) {
  const i = [];
  for (let f = 0; f < e.length; f++)
    if (n) i.push(Ze(e[f], t[f], n - 1));
    else if (e[f]) {
      const r = {};
      for (let s = 0; s < e[f].length; s++) {
        const o = t[f][s];
        r[e[f][s]] = o === void 0 ? null : o;
      }
      i.push(r);
    } else i.push(void 0);
  return i;
}
function Qe(e, t) {
  const n = Object.keys(e),
    i = e[n[0]]?.length,
    f = [];
  for (let r = 0; r < i; r++) {
    const s = {};
    for (const o of n) {
      if (e[o].length !== i) throw new Error('parquet struct parsing error');
      s[o] = e[o][r];
    }
    t ? f.push(Qe(s, t - 1)) : f.push(s);
  }
  return f;
}
function q(e, t, n) {
  const i = n instanceof Int32Array,
    f = D(e),
    r = D(e);
  D(e);
  let s = le(e),
    o = 0;
  n[o++] = i ? Number(s) : s;
  const c = f / r;
  for (; o < t; ) {
    const d = le(e),
      _ = new Uint8Array(r);
    for (let l = 0; l < r; l++) _[l] = e.view.getUint8(e.offset++);
    for (let l = 0; l < r && o < t; l++) {
      const a = BigInt(_[l]);
      if (a) {
        let h = 0n,
          g = c;
        const w = (1n << a) - 1n;
        for (; g && o < t; ) {
          let y = (BigInt(e.view.getUint8(e.offset)) >> h) & w;
          for (h += a; h >= 8; )
            ((h -= 8n), e.offset++, h && (y |= (BigInt(e.view.getUint8(e.offset)) << (a - h)) & w));
          const u = d + y;
          ((s += u), (n[o++] = i ? Number(s) : s), g--);
        }
        g && (e.offset += Math.ceil((g * Number(a) + Number(h)) / 8));
      } else for (let h = 0; h < c && o < t; h++) ((s += d), (n[o++] = i ? Number(s) : s));
    }
  }
}
function Je(e, t, n) {
  const i = new Int32Array(t);
  q(e, t, i);
  for (let f = 0; f < t; f++)
    ((n[f] = new Uint8Array(e.view.buffer, e.view.byteOffset + e.offset, i[f])),
      (e.offset += i[f]));
}
function Ft(e, t, n) {
  const i = new Int32Array(t);
  q(e, t, i);
  const f = new Int32Array(t);
  q(e, t, f);
  for (let r = 0; r < t; r++) {
    const s = new Uint8Array(e.view.buffer, e.view.byteOffset + e.offset, f[r]);
    (i[r]
      ? ((n[r] = new Uint8Array(i[r] + f[r])),
        n[r].set(n[r - 1].subarray(0, i[r])),
        n[r].set(s, i[r]))
      : (n[r] = s),
      (e.offset += f[r]));
  }
}
function B(e, t, n, i) {
  i === void 0 && ((i = e.view.getUint32(e.offset, !0)), (e.offset += 4));
  const f = e.offset;
  let r = 0;
  for (; r < n.length; ) {
    const s = D(e);
    if (s & 1) r = kt(e, s, t, n, r);
    else {
      const o = s >>> 1;
      (Ct(e, o, t, n, r), (r += o));
    }
  }
  e.offset = f + i;
}
function Ct(e, t, n, i, f) {
  const r = (n + 7) >> 3;
  let s = 0;
  for (let o = 0; o < r; o++) s |= e.view.getUint8(e.offset++) << (o << 3);
  for (let o = 0; o < t; o++) i[f + o] = s;
}
function kt(e, t, n, i, f) {
  let r = (t >> 1) << 3;
  const s = (1 << n) - 1;
  let o = 0;
  if (e.offset < e.view.byteLength) o = e.view.getUint8(e.offset++);
  else if (s) throw new Error(`parquet bitpack offset ${e.offset} out of range`);
  let c = 8,
    d = 0;
  for (; r; )
    d > 8
      ? ((d -= 8), (c -= 8), (o >>>= 8))
      : c - d < n
        ? ((o |= e.view.getUint8(e.offset) << c), e.offset++, (c += 8))
        : (f < i.length && (i[f++] = (o >> d) & s), r--, (d += n));
  return f;
}
function Xe(e, t, n, i) {
  const f = Yt(n, i),
    r = new Uint8Array(t * f);
  for (let s = 0; s < f; s++)
    for (let o = 0; o < t; o++) r[o * f + s] = e.view.getUint8(e.offset++);
  if (n === 'FLOAT') return new Float32Array(r.buffer);
  if (n === 'DOUBLE') return new Float64Array(r.buffer);
  if (n === 'INT32') return new Int32Array(r.buffer);
  if (n === 'INT64') return new BigInt64Array(r.buffer);
  if (n === 'FIXED_LEN_BYTE_ARRAY') {
    const s = new Array(t);
    for (let o = 0; o < t; o++) s[o] = r.subarray(o * f, (o + 1) * f);
    return s;
  }
  throw new Error(`parquet byte_stream_split unsupported type: ${n}`);
}
function Yt(e, t) {
  switch (e) {
    case 'INT32':
    case 'FLOAT':
      return 4;
    case 'INT64':
    case 'DOUBLE':
      return 8;
    case 'FIXED_LEN_BYTE_ARRAY':
      if (!t) throw new Error('parquet byteWidth missing type_length');
      return t;
    default:
      throw new Error(`parquet unsupported type: ${e}`);
  }
}
function de(e, t, n, i) {
  if (n === 0) return [];
  if (t === 'BOOLEAN') return qt(e, n);
  if (t === 'INT32') return jt(e, n);
  if (t === 'INT64') return Vt(e, n);
  if (t === 'INT96') return Gt(e, n);
  if (t === 'FLOAT') return zt(e, n);
  if (t === 'DOUBLE') return Wt(e, n);
  if (t === 'BYTE_ARRAY') return Ht(e, n);
  if (t === 'FIXED_LEN_BYTE_ARRAY') {
    if (!i) throw new Error('parquet missing fixed length');
    return Kt(e, n, i);
  } else throw new Error(`parquet unhandled type: ${t}`);
}
function qt(e, t) {
  const n = new Array(t);
  for (let i = 0; i < t; i++) {
    const f = e.offset + ((i / 8) | 0),
      r = i % 8,
      s = e.view.getUint8(f);
    n[i] = (s & (1 << r)) !== 0;
  }
  return ((e.offset += Math.ceil(t / 8)), n);
}
function jt(e, t) {
  const n =
    (e.view.byteOffset + e.offset) % 4
      ? new Int32Array(ee(e.view.buffer, e.view.byteOffset + e.offset, t * 4))
      : new Int32Array(e.view.buffer, e.view.byteOffset + e.offset, t);
  return ((e.offset += t * 4), n);
}
function Vt(e, t) {
  const n =
    (e.view.byteOffset + e.offset) % 8
      ? new BigInt64Array(ee(e.view.buffer, e.view.byteOffset + e.offset, t * 8))
      : new BigInt64Array(e.view.buffer, e.view.byteOffset + e.offset, t);
  return ((e.offset += t * 8), n);
}
function Gt(e, t) {
  const n = new Array(t);
  for (let i = 0; i < t; i++) {
    const f = e.view.getBigInt64(e.offset + i * 12, !0),
      r = e.view.getInt32(e.offset + i * 12 + 8, !0);
    n[i] = (BigInt(r) << 64n) | f;
  }
  return ((e.offset += t * 12), n);
}
function zt(e, t) {
  const n =
    (e.view.byteOffset + e.offset) % 4
      ? new Float32Array(ee(e.view.buffer, e.view.byteOffset + e.offset, t * 4))
      : new Float32Array(e.view.buffer, e.view.byteOffset + e.offset, t);
  return ((e.offset += t * 4), n);
}
function Wt(e, t) {
  const n =
    (e.view.byteOffset + e.offset) % 8
      ? new Float64Array(ee(e.view.buffer, e.view.byteOffset + e.offset, t * 8))
      : new Float64Array(e.view.buffer, e.view.byteOffset + e.offset, t);
  return ((e.offset += t * 8), n);
}
function Ht(e, t) {
  const n = new Array(t);
  for (let i = 0; i < t; i++) {
    const f = e.view.getUint32(e.offset, !0);
    ((e.offset += 4),
      (n[i] = new Uint8Array(e.view.buffer, e.view.byteOffset + e.offset, f)),
      (e.offset += f));
  }
  return n;
}
function Kt(e, t, n) {
  const i = new Array(t);
  for (let f = 0; f < t; f++)
    ((i[f] = new Uint8Array(e.view.buffer, e.view.byteOffset + e.offset, n)), (e.offset += n));
  return i;
}
function ee(e, t, n) {
  const i = new ArrayBuffer(n);
  return (new Uint8Array(i).set(new Uint8Array(e, t, n)), i);
}
const Zt = [0, 255, 65535, 16777215, 4294967295];
function Me(e, t, n, i, f) {
  for (let r = 0; r < f; r++) n[i + r] = e[t + r];
}
function Qt(e, t) {
  const n = e.byteLength,
    i = t.byteLength;
  let f = 0,
    r = 0;
  for (; f < n; ) {
    const s = e[f];
    if ((f++, s < 128)) break;
  }
  if (i && f >= n) throw new Error('invalid snappy length header');
  for (; f < n; ) {
    const s = e[f];
    let o = 0;
    if ((f++, f >= n)) throw new Error('missing eof marker');
    if ((s & 3) === 0) {
      let c = (s >>> 2) + 1;
      if (c > 60) {
        if (f + 3 >= n) throw new Error('snappy error literal pos + 3 >= inputLength');
        const d = c - 60;
        ((c = e[f] + (e[f + 1] << 8) + (e[f + 2] << 16) + (e[f + 3] << 24)),
          (c = (c & Zt[d]) + 1),
          (f += d));
      }
      if (f + c > n) throw new Error('snappy error literal exceeds input length');
      (Me(e, f, t, r, c), (f += c), (r += c));
    } else {
      let c = 0;
      switch (s & 3) {
        case 1:
          ((o = ((s >>> 2) & 7) + 4), (c = e[f] + ((s >>> 5) << 8)), f++);
          break;
        case 2:
          if (n <= f + 1) throw new Error('snappy error end of input');
          ((o = (s >>> 2) + 1), (c = e[f] + (e[f + 1] << 8)), (f += 2));
          break;
        case 3:
          if (n <= f + 3) throw new Error('snappy error end of input');
          ((o = (s >>> 2) + 1),
            (c = e[f] + (e[f + 1] << 8) + (e[f + 2] << 16) + (e[f + 3] << 24)),
            (f += 4));
          break;
      }
      if (c === 0 || isNaN(c)) throw new Error(`invalid offset ${c} pos ${f} inputLength ${n}`);
      if (c > r) throw new Error('cannot copy from before start of buffer');
      (Me(t, r - c, t, r, o), (r += o));
    }
  }
  if (r !== i) throw new Error('premature end of input');
}
function Jt(e, t, { type: n, element: i, schemaPath: f }) {
  const r = new DataView(e.buffer, e.byteOffset, e.byteLength),
    s = { view: r, offset: 0 };
  let o;
  const c = Xt(s, t, f),
    { definitionLevels: d, numNulls: _ } = en(s, t, f),
    l = t.num_values - _;
  if (t.encoding === 'PLAIN') o = de(s, n, l, i.type_length);
  else if (
    t.encoding === 'PLAIN_DICTIONARY' ||
    t.encoding === 'RLE_DICTIONARY' ||
    t.encoding === 'RLE'
  ) {
    const a = n === 'BOOLEAN' ? 1 : r.getUint8(s.offset++);
    a
      ? ((o = new Array(l)),
        n === 'BOOLEAN'
          ? (B(s, a, o), (o = o.map((h) => !!h)))
          : B(s, a, o, r.byteLength - s.offset))
      : (o = new Uint8Array(l));
  } else if (t.encoding === 'BYTE_STREAM_SPLIT') o = Xe(s, l, n, i.type_length);
  else if (t.encoding === 'DELTA_BINARY_PACKED')
    ((o = n === 'INT32' ? new Int32Array(l) : new BigInt64Array(l)), q(s, l, o));
  else if (t.encoding === 'DELTA_LENGTH_BYTE_ARRAY') ((o = new Array(l)), Je(s, l, o));
  else throw new Error(`parquet unsupported encoding: ${t.encoding}`);
  return { definitionLevels: d, repetitionLevels: c, dataPage: o };
}
function Xt(e, t, n) {
  if (n.length > 1) {
    const i = je(n);
    if (i) {
      const f = new Array(t.num_values);
      return (B(e, te(i), f), f);
    }
  }
  return [];
}
function en(e, t, n) {
  const i = ae(n);
  if (!i) return { definitionLevels: [], numNulls: 0 };
  const f = new Array(t.num_values);
  B(e, te(i), f);
  let r = t.num_values;
  for (const s of f) s === i && r--;
  return (r === 0 && (f.length = 0), { definitionLevels: f, numNulls: r });
}
function ue(e, t, n, i) {
  let f;
  const r = i?.[n];
  if (n === 'UNCOMPRESSED') f = e;
  else if (r) f = r(e, t);
  else if (n === 'SNAPPY') ((f = new Uint8Array(t)), Qt(e, f));
  else throw new Error(`parquet unsupported compression codec: ${n}`);
  if (f?.length !== t)
    throw new Error(`parquet decompressed page length ${f?.length} does not match header ${t}`);
  return f;
}
function tn(e, t, n) {
  const f = { view: new DataView(e.buffer, e.byteOffset, e.byteLength), offset: 0 },
    { type: r, element: s, schemaPath: o, codec: c, compressors: d } = n,
    _ = t.data_page_header_v2;
  if (!_) throw new Error('parquet data page header v2 is undefined');
  const l = nn(f, _, o);
  f.offset = _.repetition_levels_byte_length;
  const a = fn(f, _, o),
    h =
      t.uncompressed_page_size - _.definition_levels_byte_length - _.repetition_levels_byte_length;
  let g = e.subarray(f.offset);
  _.is_compressed !== !1 && (g = ue(g, h, c, d));
  const w = new DataView(g.buffer, g.byteOffset, g.byteLength),
    y = { view: w, offset: 0 };
  let u;
  const p = _.num_values - _.num_nulls;
  if (_.encoding === 'PLAIN') u = de(y, r, p, s.type_length);
  else if (_.encoding === 'RLE') ((u = new Array(p)), B(y, 1, u), (u = u.map((m) => !!m)));
  else if (_.encoding === 'PLAIN_DICTIONARY' || _.encoding === 'RLE_DICTIONARY') {
    const m = w.getUint8(y.offset++);
    ((u = new Array(p)), B(y, m, u, h - 1));
  } else if (_.encoding === 'DELTA_BINARY_PACKED')
    ((u = r === 'INT32' ? new Int32Array(p) : new BigInt64Array(p)), q(y, p, u));
  else if (_.encoding === 'DELTA_LENGTH_BYTE_ARRAY') ((u = new Array(p)), Je(y, p, u));
  else if (_.encoding === 'DELTA_BYTE_ARRAY') ((u = new Array(p)), Ft(y, p, u));
  else if (_.encoding === 'BYTE_STREAM_SPLIT') u = Xe(y, p, r, s.type_length);
  else throw new Error(`parquet unsupported encoding: ${_.encoding}`);
  return { definitionLevels: a, repetitionLevels: l, dataPage: u };
}
function nn(e, t, n) {
  const i = je(n);
  if (!i) return [];
  const f = new Array(t.num_values);
  return (B(e, te(i), f, t.repetition_levels_byte_length), f);
}
function fn(e, t, n) {
  const i = ae(n);
  if (i) {
    const f = new Array(t.num_values);
    return (B(e, te(i), f, t.definition_levels_byte_length), f);
  }
}
function te(e) {
  return 32 - Math.clz32(e);
}
function Ue(e, { groupStart: t, selectStart: n, selectEnd: i }, f, r) {
  const { pathInSchema: s, schemaPath: o } = f,
    c = Ve(o),
    d = [];
  let _,
    l,
    a = 0,
    h = 0;
  const g =
    r &&
    (() => {
      l && r({ pathInSchema: s, columnData: l, rowStart: t + a - l.length, rowEnd: t + a });
    });
  for (; (c ? a < i : e.offset < e.view.byteLength - 1) && !(e.offset >= e.view.byteLength - 1); ) {
    const w = rn(e);
    if (w.type === 'DICTIONARY_PAGE') {
      const { data: y } = De(e, w, f, _, void 0, 0);
      y && (_ = $e(y, f));
    } else {
      const y = l?.length || 0,
        u = De(e, w, f, _, l, n - a);
      u.skipped
        ? (d.length || (h += u.skipped), (a += u.skipped))
        : u.data && l === u.data
          ? (a += u.data.length - y)
          : u.data && u.data.length && (g?.(), d.push(u.data), (a += u.data.length), (l = u.data));
    }
  }
  return (g?.(), { data: d, skipped: h });
}
function De(e, t, n, i, f, r) {
  const { type: s, element: o, schemaPath: c, codec: d, compressors: _ } = n,
    l = new Uint8Array(e.view.buffer, e.view.byteOffset + e.offset, t.compressed_page_size);
  if (((e.offset += t.compressed_page_size), t.type === 'DATA_PAGE')) {
    const a = t.data_page_header;
    if (!a) throw new Error('parquet data page header is undefined');
    if (r > a.num_values && Ve(c)) return { skipped: a.num_values };
    const h = ue(l, Number(t.uncompressed_page_size), d, _),
      { definitionLevels: g, repetitionLevels: w, dataPage: y } = Jt(h, a, n),
      u = me(y, i, a.encoding, n),
      p = Array.isArray(f) ? f : [];
    return { skipped: 0, data: Be(p, g, w, u, c) };
  } else if (t.type === 'DATA_PAGE_V2') {
    const a = t.data_page_header_v2;
    if (!a) throw new Error('parquet data page header v2 is undefined');
    if (r > a.num_rows) return { skipped: a.num_values };
    const { definitionLevels: h, repetitionLevels: g, dataPage: w } = tn(l, t, n),
      y = me(w, i, a.encoding, n),
      u = Array.isArray(f) ? f : [];
    return { skipped: 0, data: Be(u, h, g, y, c) };
  } else if (t.type === 'DICTIONARY_PAGE') {
    const a = t.dictionary_page_header;
    if (!a) throw new Error('parquet dictionary page header is undefined');
    const h = ue(l, Number(t.uncompressed_page_size), d, _),
      g = { view: new DataView(h.buffer, h.byteOffset, h.byteLength), offset: 0 };
    return { skipped: 0, data: de(g, s, a.num_values, o.type_length) };
  } else throw new Error(`parquet unsupported page type: ${t.type}`);
}
function rn(e) {
  const t = j(e),
    n = xe[t.field_1],
    i = t.field_2,
    f = t.field_3,
    r = t.field_4,
    s = t.field_5 && {
      num_values: t.field_5.field_1,
      encoding: M[t.field_5.field_2],
      definition_level_encoding: M[t.field_5.field_3],
      repetition_level_encoding: M[t.field_5.field_4],
      statistics: t.field_5.field_5 && {
        max: t.field_5.field_5.field_1,
        min: t.field_5.field_5.field_2,
        null_count: t.field_5.field_5.field_3,
        distinct_count: t.field_5.field_5.field_4,
        max_value: t.field_5.field_5.field_5,
        min_value: t.field_5.field_5.field_6,
      },
    },
    o = t.field_6,
    c = t.field_7 && {
      num_values: t.field_7.field_1,
      encoding: M[t.field_7.field_2],
      is_sorted: t.field_7.field_3,
    },
    d = t.field_8 && {
      num_values: t.field_8.field_1,
      num_nulls: t.field_8.field_2,
      num_rows: t.field_8.field_3,
      encoding: M[t.field_8.field_4],
      definition_levels_byte_length: t.field_8.field_5,
      repetition_levels_byte_length: t.field_8.field_6,
      is_compressed: t.field_8.field_7 === void 0 ? !0 : t.field_8.field_7,
      statistics: t.field_8.field_8,
    };
  return {
    type: n,
    uncompressed_page_size: i,
    compressed_page_size: f,
    crc: r,
    data_page_header: s,
    index_page_header: o,
    dictionary_page_header: c,
    data_page_header_v2: d,
  };
}
function on(e, { metadata: t }, n) {
  const i = [];
  for (const f of n.chunks) {
    const { data_page_offset: r, dictionary_page_offset: s, path_in_schema: o } = f.columnMetadata,
      c = Ye(t.schema, o),
      d = {
        pathInSchema: o,
        element: c[c.length - 1].element,
        schemaPath: c,
        parsers: { ...X, ...e.parsers },
        ...e,
        ...f.columnMetadata,
      };
    let { startByte: _, endByte: l } = f.range;
    if (!('offsetIndex' in f)) {
      i.push({
        pathInSchema: o,
        data: Promise.resolve(e.file.slice(_, l)).then((a) => {
          const h = { view: new DataView(a), offset: 0 };
          return Ue(h, n, d, e.onPage);
        }),
      });
      continue;
    }
    i.push({
      pathInSchema: o,
      data: Promise.resolve(e.file.slice(f.offsetIndex.startByte, f.offsetIndex.endByte)).then(
        async (a) => {
          const { selectStart: h, selectEnd: g } = n,
            w = It({ view: new DataView(a), offset: 0 }).page_locations;
          let y = -1;
          const u = s || r < w[0].offset;
          for (let I = 0; I < w.length; I++) {
            const b = w[I],
              P = Number(b.first_row_index),
              V = I + 1 < w.length ? Number(w[I + 1].first_row_index) : n.groupRows;
            (y < 0 && !u && V > h && ((_ = Number(b.offset)), (y = P)),
              P < g && (l = Number(b.offset) + b.compressed_page_size));
          }
          y < 0 && (y = 0);
          const p = await e.file.slice(_, l),
            m = { view: new DataView(p), offset: 0 },
            A = y
              ? {
                  ...n,
                  groupStart: n.groupStart + y,
                  selectStart: n.selectStart - y,
                  selectEnd: n.selectEnd - y,
                }
              : n,
            { data: E, skipped: T } = Ue(m, A, d, e.onPage);
          return { data: E, skipped: y + T };
        },
      ),
    });
  }
  return { groupStart: n.groupStart, groupRows: n.groupRows, asyncColumns: i };
}
async function Se({ asyncColumns: e }, t, n, i, f) {
  const r = await Promise.all(
      e.map((l) => l.data.then(({ skipped: a, data: h }) => ({ skipped: a, data: He(h) }))),
    ),
    s = n - t;
  if (f === 'object') {
    const l = Array(s);
    for (let a = 0; a < s; a++) {
      const h = {};
      for (let g = 0; g < e.length; g++) {
        const { data: w, skipped: y } = r[g];
        h[e[g].pathInSchema[0]] = w[t + a - y];
      }
      l[a] = h;
    }
    return l;
  }
  const o = e.map((l) => l.pathInSchema[0]).filter((l) => !i || i.includes(l)),
    c = i ?? o,
    d = c.map((l) => e.findIndex((a) => a.pathInSchema[0] === l)),
    _ = Array(s);
  for (let l = 0; l < s; l++) {
    const a = Array(e.length);
    for (let h = 0; h < c.length; h++) {
      const g = d[h];
      if (g < 0) throw new Error(`parquet column not found: ${c[h]}`);
      const { data: w, skipped: y } = r[g];
      a[h] = w[t + l - y];
    }
    _[l] = a;
  }
  return _;
}
function sn(e, t, n) {
  const { asyncColumns: i } = e;
  n = { ...X, ...n };
  const f = [];
  for (const r of t.children)
    if (r.children.length) {
      const s = i.filter((o) => o.pathInSchema[0] === r.element.name);
      if (!s.length) continue;
      f.push({
        pathInSchema: r.path,
        data: (async () => {
          const o = await Promise.all(s.map((l) => l.data)),
            c = new Map();
          let d = 1 / 0;
          for (let l = 0; l < s.length; l++) {
            const a = He(o[l].data);
            (c.set(s[l].pathInSchema.join('.'), a), (d = Math.min(d, a.length)));
          }
          for (const [l, a] of c) a.length > d && c.set(l, a.slice(0, d));
          C(c, r, n);
          const _ = c.get(r.element.name);
          if (!_) throw new Error('parquet column data not assembled');
          return { data: [_], skipped: 0 };
        })(),
      });
    } else {
      const s = i.find((o) => o.pathInSchema[0] === r.element.name);
      s && f.push(s);
    }
  return { ...e, asyncColumns: f };
}
async function ln(e) {
  e.metadata ??= await pt(e.file, e);
  const {
    rowStart: t = 0,
    rowEnd: n,
    columns: i,
    onChunk: f,
    onComplete: r,
    rowFormat: s,
    filter: o,
    filterStrict: c = !0,
  } = e;
  if (o && s !== 'object') throw new Error('parquet filter requires rowFormat: "object"');
  const d = H(o);
  if (d.length) {
    const y = k(e.metadata).children.map((p) => p.element.name),
      u = d.filter((p) => !y.includes(p));
    if (u.length) throw new Error(`parquet filter columns not found: ${u.join(', ')}`);
  }
  let _ = i,
    l = !1;
  if (i && o) {
    const y = d.filter((u) => !i.includes(u));
    y.length && ((_ = [...i, ...y]), (l = !0));
  }
  let a = _ !== i ? { ...e, columns: _ } : e;
  a = await un(a);
  const h = cn(a);
  if (!r && !f) {
    await ie(h);
    return;
  }
  const g = k(e.metadata),
    w = h.map((y) => sn(y, g, e.parsers));
  if (f)
    for (const y of w)
      for (const u of y.asyncColumns)
        u.data.then(
          ({ data: p, skipped: m }) => {
            let A = y.groupStart + m;
            for (const E of p)
              (f({
                columnName: u.pathInSchema[0],
                columnData: E,
                rowStart: A,
                rowEnd: A + E.length,
              }),
                (A += E.length));
          },
          () => {},
        );
  if (r) {
    await ie(w);
    const y = [];
    for (const u of w) {
      const p = Math.max(t - u.groupStart, 0),
        m = Math.min((n ?? 1 / 0) - u.groupStart, u.groupRows),
        A = s === 'object' ? await Se(u, p, m, _, 'object') : await Se(u, p, m, i, 'array');
      if (o) {
        for (const E of A)
          if (F(E, o, c)) {
            if (l && i) for (const T of d) i.includes(T) || delete E[T];
            y.push(E);
          }
      } else We(y, A);
    }
    r(y);
  } else await ie(w);
}
async function ie(e) {
  const t = e.flatMap((f) => f.asyncColumns.map((r) => r.data)),
    i = (await Promise.allSettled(t)).find((f) => f.status === 'rejected');
  if (i) throw i.reason;
}
function cn(e) {
  if (!e.metadata) throw new Error('parquet requires metadata');
  const t = Mt(e);
  return ((e.file = Dt(e.file, t)), t.groups.map((n) => on(e, t, n)));
}
async function un(e) {
  if (!e.useBloomFilters || !e.filter || !e.metadata) return e;
  const t = k(e.metadata),
    n = {};
  for (const f of t.children) n[f.element.name] = f.element;
  const i = await Ut({
    file: e.file,
    metadata: e.metadata,
    filter: e.filter,
    filterStrict: e.filterStrict,
  });
  return { ...e, bloomFiltersByGroup: i, schemaElements: n };
}
function an(e) {
  return new Promise((t, n) => {
    ln({ ...e, rowFormat: 'object', onComplete: t }).catch(n);
  });
}
export {
  He as flatten,
  Ie as parquetMetadata,
  pt as parquetMetadataAsync,
  ln as parquetRead,
  an as parquetReadObjects,
  k as parquetSchema,
  It as readOffsetIndex,
  Qt as snappyUncompress,
};
