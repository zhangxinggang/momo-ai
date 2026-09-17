const w = (u, E = {}) => {
  const r = u(),
    d = new Map(),
    l = new Set(),
    a = new Set(),
    i = (e, n) => {
      r?.postMessage({ type: e, payload: n });
    },
    c = (e) => {
      const { type: n, payload: o } = e.data || {},
        t = d.get(n);
      (t?.forEach((s) => s(o)), l.forEach((s) => s(e)));
    },
    v = (e) => {
      (E.logErrors !== !1 && console.error(e), a.forEach((n) => n(e)));
    };
  return (
    r?.addEventListener('message', c),
    r?.addEventListener('error', v),
    {
      instance: r,
      worker: { emit: i },
      emit: i,
      onWorkerMessage(e) {
        return (
          l.add(e),
          () => {
            l.delete(e);
          }
        );
      },
      onWorkerError(e) {
        return (
          a.add(e),
          () => {
            a.delete(e);
          }
        );
      },
      onWorkerEvent(e, n) {
        let o = d.get(e);
        return (
          o || ((o = new Set()), d.set(e, o)),
          o.add(n),
          () => {
            (o?.delete(n), o?.size === 0 && d.delete(e));
          }
        );
      },
      mapEvents(e) {
        return Array.isArray(e)
          ? e.reduce((n, o) => ((n[o] = (t) => i(o, t)), n), {})
          : Object.keys(e).reduce((n, o) => {
              const t = e[o];
              return ((n[t] = (s) => i(o, s)), n);
            }, {});
      },
      destroy() {
        (r?.removeEventListener('message', c),
          r?.removeEventListener('error', v),
          r?.terminate(),
          d.clear(),
          l.clear(),
          a.clear());
      },
    }
  );
};
export { w as c };
