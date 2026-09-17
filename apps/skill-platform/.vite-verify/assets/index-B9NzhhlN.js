import { G as be, p as ce, E as de, c as fe, q as me, T as ue, S as we } from './icons-B5Lu0sqU.js';
import {
  bO as H,
  bZ as Q,
  bU as S,
  bM as V,
  bP as X,
  bQ as Y,
  bR as Z,
  bY as ae,
  bS as ee,
  bW as ie,
  bN as j,
  bX as le,
  b$ as ne,
  bL as oe,
  b_ as re,
  bT as se,
  bV as te,
} from './index-C2avURFS.js';
import './markdown-it-vendor-DL4wSELR.js';
import { q as s } from './markdown-vendor-DldLOD9R.js';
import {
  e as B,
  A as I,
  M as J,
  i as K,
  B as L,
  h as M,
  F as N,
  r as l,
} from './ui-vendor-C-FKu2uc.js';
const y = {
  'inline-editable': '_inline-editable_g174x_1',
  'inline-editable-text': '_inline-editable-text_g174x_8',
  'inline-editable-placeholder': '_inline-editable-placeholder_g174x_16',
  'inline-editable-input': '_inline-editable-input_g174x_19',
  'inline-editable-edit-btn': '_inline-editable-edit-btn_g174x_23',
};
function z({ value: t, placeholder: a = '—', onSave: d }) {
  const [u, n] = l.useState(!1),
    [b, r] = l.useState(t),
    [W, f] = l.useState(!1),
    p = l.useRef(null);
  (l.useEffect(() => {
    u || r(t);
  }, [u, t]),
    l.useEffect(() => {
      u && (p.current?.focus(), p.current?.select());
    }, [u]));
  const m = l.useCallback(async () => {
      const w = b.trim();
      if (w === t.trim()) {
        n(!1);
        return;
      }
      f(!0);
      try {
        (await d(w), n(!1));
      } catch {
        r(t);
      } finally {
        f(!1);
      }
    }, [b, d, t]),
    k = l.useCallback(() => {
      (r(t), n(!0));
    }, [t]),
    v = l.useCallback(
      (w) => {
        (w.key === 'Enter' && (w.preventDefault(), m()), w.key === 'Escape' && (r(t), n(!1)));
      },
      [m, t],
    );
  if (u)
    return s.jsx('div', {
      className: y['inline-editable'],
      children: s.jsx(B, {
        className: y['inline-editable-input'],
        disabled: W,
        onBlur: () => {
          m();
        },
        onChange: (w) => r(w.target.value),
        onKeyDown: v,
        ref: p,
        size: 'small',
        value: b,
      }),
    });
  const x = t.trim() || a,
    C = !t.trim();
  return s.jsxs('div', {
    className: y['inline-editable'],
    children: [
      s.jsx('span', {
        className: C
          ? `${y['inline-editable-text']} ${y['inline-editable-placeholder']}`
          : y['inline-editable-text'],
        children: x,
      }),
      s.jsx('button', {
        'aria-label': '编辑',
        className: y['inline-editable-edit-btn'],
        onClick: k,
        type: 'button',
        children: s.jsx(ce, { className: 'h-3.5 w-3.5' }),
      }),
    ],
  });
}
function pe({ open: t, onCancel: a, onConfirm: d }) {
  const { message: u } = I.useApp(),
    [n] = N.useForm();
  l.useEffect(() => {
    t && n.resetFields();
  }, [n, t]);
  const b = l.useCallback(async () => {
    try {
      const r = await n.validateFields();
      await d({ name: r.name.trim(), remark: r.remark?.trim() ?? '' });
    } catch (r) {
      if (r && typeof r == 'object' && 'errorFields' in r) return;
      (console.error(r), u.error('创建失败'));
    }
  }, [n, u, d]);
  return s.jsx(J, {
    cancelText: '取消',
    destroyOnHidden: !0,
    okText: '创建',
    onCancel: a,
    onOk: () => {
      b();
    },
    open: t,
    title: '新建业务',
    children: s.jsxs(N, {
      form: n,
      layout: 'vertical',
      requiredMark: !1,
      children: [
        s.jsx(N.Item, {
          label: '名称',
          name: 'name',
          rules: [{ required: !0, message: '请输入业务名称' }],
          children: s.jsx(B, { placeholder: '请输入业务名称' }),
        }),
        s.jsx(N.Item, {
          label: '备注',
          name: 'remark',
          children: s.jsx(B.TextArea, { placeholder: '可选备注', rows: 3 }),
        }),
      ],
    }),
  });
}
const o = {
  'workflow-business-list': '_workflow-business-list_ye3sv_1',
  'workflow-business-list-header': '_workflow-business-list-header_ye3sv_8',
  'workflow-business-list-title': '_workflow-business-list-title_ye3sv_19',
  'workflow-business-list-search': '_workflow-business-list-search_ye3sv_22',
  'workflow-business-list-search-icon': '_workflow-business-list-search-icon_ye3sv_40',
  'workflow-business-list-search-input': '_workflow-business-list-search-input_ye3sv_48',
  'workflow-business-list-create-btn': '_workflow-business-list-create-btn_ye3sv_53',
  'workflow-business-list-steps': '_workflow-business-list-steps_ye3sv_60',
  'workflow-business-list-table-wrap': '_workflow-business-list-table-wrap_ye3sv_63',
  'workflow-business-list-empty': '_workflow-business-list-empty_ye3sv_89',
  'workflow-business-list-empty-icon-wrap': '_workflow-business-list-empty-icon-wrap_ye3sv_97',
  'workflow-business-list-empty-icon': '_workflow-business-list-empty-icon_ye3sv_97',
  'workflow-business-list-empty-title': '_workflow-business-list-empty-title_ye3sv_113',
  'workflow-business-list-empty-desc': '_workflow-business-list-empty-desc_ye3sv_118',
};
function ke({ workflowId: t }) {
  const { message: a, modal: d } = I.useApp(),
    u = V(),
    n = j((e) => e.businessListQuery),
    b = j((e) => e.setBusinessListQuery),
    r = j((e) => e.openWorkflowBusinessWork),
    W = j((e) => e.workflowScreen),
    [f, p] = l.useState(null),
    [m, k] = l.useState([]),
    [v, x] = l.useState([]),
    [C, w] = l.useState(!1),
    [R, E] = l.useState(!1),
    T = l.useCallback((e) => {
      const { nodes: i, edges: c } = H(e.graphJson),
        g = X(i, c);
      if (!g.ok) {
        x([]);
        return;
      }
      const h = new Map(i.filter(Y).map((P) => [P.id, P]));
      x(Z(g.steps, h));
    }, []),
    _ = l.useCallback(async () => {
      if (!u) {
        (p(null), k([]), x([]));
        return;
      }
      w(!0);
      try {
        const [e, i] = await Promise.all([ee(t), se(t)]);
        if (!e) {
          (p(null), k([]), x([]), a.error('工作流不存在或已被删除'));
          return;
        }
        (p(e), k(i), T(e));
      } catch (e) {
        (console.error(e), a.error('加载业务列表失败'));
      } finally {
        w(!1);
      }
    }, [T, u, a, t]);
  l.useEffect(() => {
    _();
  }, [_, W, t]);
  const A = l.useMemo(() => {
      const e = n.trim().toLowerCase();
      return e
        ? m.filter((i) => i.name.toLowerCase().includes(e) || i.remark.toLowerCase().includes(e))
        : m;
    }, [m, n]),
    q = l.useCallback(
      async (e) => {
        if (!S()) {
          a.warning('当前环境不支持业务持久化（需桌面端 SQLite）');
          return;
        }
        const i = await te({ workflowId: t, name: e.name, remark: e.remark });
        if (!i) {
          a.error('创建业务失败');
          return;
        }
        (E(!1), await _(), a.success('业务已创建'), r(t, i.id));
      },
      [a, r, _, t],
    ),
    D = l.useCallback(
      (e) => {
        if (!S()) {
          a.warning('当前环境不支持业务持久化（需桌面端 SQLite）');
          return;
        }
        d.confirm({
          title: '删除业务',
          content: `确定删除业务「${e.name}」？将同时删除产出目录与对话记录，此操作不可恢复。`,
          okText: '删除',
          okType: 'danger',
          cancelText: '取消',
          onOk: async () => {
            try {
              (f && (await ie(f.name, e.id), le(f.id, e.id, f.graphJson)),
                await ae(e.id),
                await _(),
                a.success('业务已删除'));
            } catch (i) {
              (console.error(i), a.error('删除失败'));
            }
          },
        });
      },
      [a, d, _, f],
    ),
    F = l.useCallback(
      async (e, i) => {
        if (!i) throw (a.warning('名称不能为空'), new Error('empty name'));
        const c = await Q(e.id, { name: i });
        if (!c) throw (a.error('更新名称失败'), new Error('update failed'));
        (k((g) => g.map((h) => (h.id === e.id ? c : h))), a.success('名称已更新'));
      },
      [a],
    ),
    O = l.useCallback(
      async (e, i) => {
        const c = await Q(e.id, { remark: i });
        if (!c) throw (a.error('更新备注失败'), new Error('update failed'));
        (k((g) => g.map((h) => (h.id === e.id ? c : h))), a.success('备注已更新'));
      },
      [a],
    ),
    $ = l.useMemo(
      () => [
        { title: '序号', key: 'index', width: 64, render: (e, i, c) => c + 1 },
        {
          title: '名称',
          key: 'name',
          ellipsis: !0,
          render: (e, i) =>
            s.jsx(z, { onSave: (c) => F(i, c), placeholder: '未命名业务', value: i.name }),
        },
        {
          title: '备注',
          key: 'remark',
          ellipsis: !0,
          render: (e, i) => s.jsx(z, { onSave: (c) => O(i, c), placeholder: '—', value: i.remark }),
        },
        {
          title: '创建时间',
          dataIndex: 'createdAt',
          key: 'createdAt',
          width: 180,
          render: (e) => (e ? new Date(e).toLocaleString() : '—'),
        },
        {
          title: '操作',
          key: 'actions',
          width: 140,
          render: (e, i) =>
            s.jsxs('div', {
              className: 'flex items-center gap-1',
              children: [
                s.jsx(L, {
                  icon: s.jsx(de, { className: 'h-3.5 w-3.5' }),
                  onClick: () => r(t, i.id),
                  size: 'small',
                  type: 'text',
                  children: '查看',
                }),
                s.jsx(L, {
                  danger: !0,
                  disabled: !S(),
                  icon: s.jsx(ue, { className: 'h-3.5 w-3.5' }),
                  onClick: () => D(i),
                  size: 'small',
                  type: 'text',
                }),
              ],
            }),
        },
      ],
      [D, F, O, r, t],
    ),
    U = m.length > 0,
    G = A.length === 0 && !C;
  return s.jsxs('div', {
    className: o['workflow-business-list'],
    children: [
      s.jsxs('div', {
        className: o['workflow-business-list-header'],
        children: [
          U
            ? s.jsxs('div', {
                className: o['workflow-business-list-search'],
                children: [
                  s.jsx(we, { className: o['workflow-business-list-search-icon'] }),
                  s.jsx(B, {
                    allowClear: !0,
                    className: o['workflow-business-list-search-input'],
                    onChange: (e) => b(e.target.value),
                    placeholder: '按名称或备注搜索业务',
                    value: n,
                    variant: 'borderless',
                  }),
                ],
              })
            : s.jsx(M.Text, {
                className: o['workflow-business-list-title'],
                strong: !0,
                children: f?.name ?? '业务列表',
              }),
          s.jsx(L, {
            className: o['workflow-business-list-create-btn'],
            disabled: !S(),
            icon: s.jsx(fe, { className: 'h-4 w-4' }),
            onClick: () => E(!0),
            type: 'primary',
            children: '新建业务',
          }),
        ],
      }),
      v.length > 0
        ? s.jsx('div', {
            className: o['workflow-business-list-steps'],
            children: s.jsx(re, { mode: 'readonly', steps: v }),
          })
        : null,
      s.jsx('div', {
        className: o['workflow-business-list-table-wrap'],
        children: G
          ? s.jsxs('div', {
              className: o['workflow-business-list-empty'],
              children: [
                s.jsx('div', {
                  className: o['workflow-business-list-empty-icon-wrap'],
                  children: s.jsx(me, { className: o['workflow-business-list-empty-icon'] }),
                }),
                s.jsx(M.Text, {
                  className: o['workflow-business-list-empty-title'],
                  children: n.trim() ? '没有匹配的业务' : '暂无业务',
                }),
                s.jsx(M.Text, {
                  className: o['workflow-business-list-empty-desc'],
                  type: 'secondary',
                  children: n.trim()
                    ? '尝试调整搜索关键词'
                    : S()
                      ? '点击上方「新建业务」开始执行工作流'
                      : '当前环境不支持业务管理（需桌面端）',
                }),
              ],
            })
          : s.jsx(K, {
              columns: $,
              dataSource: A,
              loading: C,
              pagination: { pageSize: 20, showSizeChanger: !1, hideOnSinglePage: !0 },
              rowKey: 'id',
              size: 'middle',
            }),
      }),
      s.jsx(pe, { onCancel: () => E(!1), onConfirm: q, open: R }),
    ],
  });
}
function je() {
  const t = ne((d) => d.selectedWorkflowId),
    a = j((d) => d.workflowScreen);
  return (
    l.useEffect(() => {
      j.getState().resumeWorkflowStudioIfPending();
    }, []),
    a === 'studio'
      ? null
      : t
        ? s.jsx(ke, { workflowId: t })
        : s.jsx(oe, {
            centered: !0,
            description: '从侧栏选择已有工作流，或点击新建工作流开始编排',
            icon: be,
            title: '在左侧选择或新建工作流',
          })
  );
}
export { je as WorkflowManager };
