import type { TInsertContentGenerator } from '../components/MdEditor/type';
interface IProps {
  title?: string;
  disabled?: boolean;
  showToolbarName?: boolean;
  insert?: (generate: TInsertContentGenerator) => void;
}
/** 文本标记工具栏（==高亮==，对齐 @vavt/v3-extension Mark） */
declare function ToolbarMark({
  title,
  disabled,
  showToolbarName,
  insert,
}: IProps): import('react/jsx-runtime').JSX.Element;
declare const _default: import('react').MemoExoticComponent<typeof ToolbarMark>;
export default _default;
