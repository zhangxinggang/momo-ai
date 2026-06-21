import { EditorView } from '@codemirror/view';
import { TFocusOption } from '~/type';
export interface IContentExposeParam {
    /**
     * 手动聚焦
     *
     * @param options 聚焦时光标的位置，不提供默认上次失焦时的位置
     */
    focus(options?: TFocusOption): void;
    /**
     * 获取当前选中的文本
     */
    getSelectedText(): string | undefined;
    /**
     * 重置已经存在的历史记录
     */
    resetHistory(): void;
    getEditorView(): EditorView | undefined;
}
