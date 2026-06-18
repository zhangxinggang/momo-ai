import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface IKbState {
  activeCollectionId?: number;
  setActiveCollectionId: (id: number | undefined) => void;
  /** 侧栏知识库列表搜索关键词 */
  listSearchQuery: string;
  setListSearchQuery: (query: string) => void;
  /** 侧栏工具栏触发新建知识库弹窗 */
  isCreateModalOpen: boolean;
  setCreateModalOpen: (open: boolean) => void;
}

export const useKbStore = create<IKbState>()(
  persist(
    (set) => ({
      activeCollectionId: undefined,
      setActiveCollectionId: (id) => set({ activeCollectionId: id }),
      listSearchQuery: '',
      setListSearchQuery: (query) => set({ listSearchQuery: query }),
      isCreateModalOpen: false,
      setCreateModalOpen: (open) => set({ isCreateModalOpen: open }),
    }),
    {
      name: 'aim-kb',
      partialize: (state) => ({ activeCollectionId: state.activeCollectionId }),
    },
  ),
);
