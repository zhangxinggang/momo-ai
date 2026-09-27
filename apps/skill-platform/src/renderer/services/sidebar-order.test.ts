import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { planSiblingReorder } from '../../../../../packages/momo-tree/src/utils/reorder';
import { orderItems, orderTree, remapPathOrders, reorderIds } from './sidebar-order';

describe('sidebar sorting', () => {
  const tree = [
    {
      id: 'folder',
      name: '目录',
      kind: 'folder' as const,
      children: [
        { id: 'a', name: 'A', kind: 'file' as const },
        { id: 'hidden', name: '隐藏', kind: 'file' as const },
        { id: 'b', name: 'B', kind: 'file' as const },
      ],
    },
    { id: 'root-file', name: '根文件', kind: 'file' as const },
  ];

  it('reorders files and folders at the same level without moving them', () => {
    const plan = planSiblingReorder(tree, 'root-file', 'folder', false)!;
    expect(plan).toEqual({ parentId: null, ids: ['root-file', 'folder'] });
    expect(orderTree(tree, { __root__: plan.ids }).map((node) => node.id)).toEqual(plan.ids);
    expect(tree[0].id).toBe('folder');
  });

  it('keeps filtered-out siblings in the full order', () => {
    const plan = planSiblingReorder(tree, 'b', 'a', false)!;
    expect(plan).toEqual({ parentId: 'folder', ids: ['b', 'a', 'hidden'] });
    const filtered = [{ ...tree[0], children: [tree[0].children![0], tree[0].children![2]] }];
    expect(orderTree(filtered, { folder: plan.ids })[0].children!.map((node) => node.id)).toEqual([
      'b',
      'a',
    ]);
    expect(orderTree(tree, { folder: plan.ids })[0].children!.map((node) => node.id)).toEqual([
      'b',
      'a',
      'hidden',
    ]);
  });

  it('rejects cross-folder, self and missing-node drops', () => {
    expect(planSiblingReorder(tree, 'a', 'root-file', true)).toBeNull();
    expect(planSiblingReorder(tree, 'folder', 'a', true)).toBeNull();
    expect(planSiblingReorder(tree, 'a', 'a', true)).toBeNull();
    expect(reorderIds(['a', 'b'], 'missing', 'a', true)).toBeNull();
    expect(reorderIds(['a', 'b', 'c'], 'a', 'c', true)).toEqual(['b', 'c', 'a']);
  });

  it('appends new entries while ignoring deleted ids and preserves path-based order after rename', () => {
    expect(orderItems(['a', 'b', 'new'], ['deleted', 'b', 'a'], (id) => id)).toEqual([
      'b',
      'a',
      'new',
    ]);
    expect(
      remapPathOrders(
        { __root__: ['dir', 'directory'], dir: ['dir/a', 'dir/b'], 'dir/sub': ['dir/sub/c'] },
        'dir',
        'renamed',
      ),
    ).toEqual({
      __root__: ['renamed', 'directory'],
      renamed: ['renamed/a', 'renamed/b'],
      'renamed/sub': ['renamed/sub/c'],
    });
  });
});

describe('saved sidebar preferences', () => {
  afterEach(() => vi.unstubAllGlobals());
  beforeEach(() => {
    vi.resetModules();
    const values = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    });
  });

  it('restores order after store reload and keeps the six modules isolated', async () => {
    let store = await import('../store/sidebar-order');
    for (const scope of ['toolbox', 'custom-tools', 'workflows', 'notes', 'knowledge', 'prompts'])
      store.useSidebarOrderStore.getState().setOrder(scope, null, [scope, 'second']);
    store.useSidebarOrderStore.getState().setOrder('notes', 'dir', ['dir/b', 'dir/a']);
    store.useSidebarOrderStore.getState().remapPath('notes', 'dir', 'new-dir');
    vi.resetModules();
    store = await import('../store/sidebar-order');
    expect(store.useSidebarOrderStore.getState().orders.notes['new-dir']).toEqual([
      'new-dir/b',
      'new-dir/a',
    ]);
    expect(Object.keys(store.useSidebarOrderStore.getState().orders)).toHaveLength(6);
    expect(store.useSidebarOrderStore.getState().orders.toolbox.__root__).toEqual([
      'toolbox',
      'second',
    ]);
  });

  it('does not display unsaved order when persistence fails', async () => {
    const { useSidebarOrderStore } = await import('../store/sidebar-order');
    vi.stubGlobal('localStorage', {
      setItem: () => {
        throw new Error('disk full');
      },
    });
    expect(() => useSidebarOrderStore.getState().setOrder('notes', null, ['b', 'a'])).toThrow(
      'disk full',
    );
    expect(useSidebarOrderStore.getState().orders.notes).toBeUndefined();
  });
});
