import './icons-B5Lu0sqU.js';
import { ba as f, br as w } from './index-C2avURFS.js';
import { b as h, c as j, p as M, a as v } from './index-CSjkvQbC.js';
import './markdown-it-vendor-DL4wSELR.js';
import { q as l } from './markdown-vendor-DldLOD9R.js';
import { M as b, T as C, r } from './ui-vendor-C-FKu2uc.js';
const g = {
  'tag-manage': '_tag-manage_sn8t1_1',
  'tag-manage-select': '_tag-manage-select_sn8t1_6',
  'tag-manage-hint': '_tag-manage-hint_sn8t1_9',
  'tag-manage-transfer': '_tag-manage-transfer_sn8t1_14',
};
function E(i, s) {
  if (s.length === 0) return [];
  const n = s.map((t) => h(t)).filter(Boolean);
  return i
    .filter((t) => {
      const o = new Set((t.tags || []).map((a) => h(a)));
      return n.every((a) => o.has(a));
    })
    .map((t) => t.id);
}
function N(i, s) {
  const n = i.trim().toLowerCase();
  return n ? `${s.title} ${s.description}`.toLowerCase().includes(n) : !0;
}
function q({ open: i, onClose: s }) {
  const { showToast: n } = w(),
    t = f((e) => e.skills),
    o = f((e) => e.updateSkill),
    [a, d] = r.useState([]),
    [c, m] = r.useState([]),
    [p, u] = r.useState(!1),
    S = r.useMemo(() => j(t), [t]),
    T = r.useMemo(
      () => t.map((e) => ({ description: e.description || '', key: e.id, title: e.name })),
      [t],
    ),
    k = a.join('\0');
  r.useEffect(() => {
    if (!i) {
      (d([]), m([]), u(!1));
      return;
    }
    m(E(t, a));
  }, [i, k]);
  const y = r.useCallback((e) => {
      d(e);
    }, []),
    _ = r.useCallback((e) => {
      m(e.map(String));
    }, []),
    x = r.useCallback(async () => {
      if (a.length === 0) {
        n('请先选择或新建标签', 'warning');
        return;
      }
      u(!0);
      try {
        const e = await M(a, c, t, o);
        (n(e > 0 ? `已将标签关联到 ${c.length} 个技能，更新 ${e} 项` : '标签关联未发生变化'), s());
      } catch (e) {
        n(e instanceof Error ? e.message : '标签关联失败', 'error');
      } finally {
        u(!1);
      }
    }, [s, a, n, t, c, o]);
  return l.jsx(b, {
    confirmLoading: p,
    destroyOnHidden: !0,
    okButtonProps: { disabled: a.length === 0 },
    okText: '确认',
    open: i,
    title: '标签管理',
    width: 800,
    onCancel: s,
    onOk: x,
    children: l.jsxs('div', {
      className: g['tag-manage'],
      children: [
        l.jsx(v, {
          className: g['tag-manage-select'],
          options: S,
          placeholder: '选择或新建要管理的标签',
          value: a,
          onChange: y,
        }),
        l.jsx('div', {
          className: g['tag-manage-hint'],
          children: '确认后，选中标签将关联到右侧技能，并从左侧技能中移除。',
        }),
        l.jsx(C, {
          className: g['tag-manage-transfer'],
          dataSource: T,
          disabled: a.length === 0,
          filterOption: N,
          render: (e) => e.title,
          showSearch: !0,
          styles: { section: { flex: '1 1 0', height: 360, width: 'auto' } },
          targetKeys: c,
          titles: ['技能列表', '已选技能'],
          onChange: _,
        }),
      ],
    }),
  });
}
export { q as SkillTagManageDialog };
