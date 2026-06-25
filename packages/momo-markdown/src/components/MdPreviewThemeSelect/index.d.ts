import { type TMdPreviewThemeId } from '../../preview-themes';
import './index.less';
interface IProps {
  value: TMdPreviewThemeId;
  onChange: (theme: TMdPreviewThemeId) => void;
  className?: string;
}
/**
 * Markdown 预览主题切换：嵌入 MdEditor defToolbars 使用
 */
export declare function MdPreviewThemeSelect({
  value,
  onChange,
  className,
}: IProps): import('react/jsx-runtime').JSX.Element;
export {};
