import type { IExportProgress } from './export-utils';
interface IProps {
    progress: IExportProgress | null;
}
/** 导出时全屏蒙版：居中转圈 + 文案 */
declare function ExportProgressOverlay({ progress }: IProps): import("react").ReactPortal | null;
declare const _default: import("react").MemoExoticComponent<typeof ExportProgressOverlay>;
export default _default;
