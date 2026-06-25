import type { TInsertContentGenerator } from '../components/MdEditor/type';
interface IProps {
  title?: string;
  disabled?: boolean;
  showToolbarName?: boolean;
  insert?: (generate: TInsertContentGenerator) => void;
}
/** 表情插入工具栏（对齐 @vavt/v3-extension Emoji） */
declare function ToolbarEmoji({
  title,
  disabled,
  showToolbarName,
  insert,
}: IProps): import('react/jsx-runtime').JSX.Element;
declare const _default: import('react').MemoExoticComponent<typeof ToolbarEmoji>;
export default _default;
