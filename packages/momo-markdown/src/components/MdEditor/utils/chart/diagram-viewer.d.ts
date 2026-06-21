import { ICustomIcon } from '~/type';
export interface IDiagramPanZoomHandle {
    cleanup: () => void;
    centerFit: () => void;
}
/**
 * 为图表容器绑定拖拽移动与滚轮缩放
 */
export declare const bindDiagramPanZoom: (viewport: HTMLElement, content: HTMLElement) => IDiagramPanZoomHandle;
/** 为图表容器挂载操作栏（复制 / 全屏 / 下载） */
export declare const prepareDiagramActionBars: (containers: NodeListOf<HTMLElement> | undefined, options: {
    customIcon: ICustomIcon;
}) => void;
/**
 * 在预览根节点上委托图表操作事件（兼容旧逻辑；主要交互由操作栏直接绑定）
 */
export declare const bindDiagramActionsDelegation: (root: HTMLElement | null | undefined, options: {
    customIcon: ICustomIcon;
}) => () => void;
/**
 * mermaid / plantuml / echarts 操作栏挂载（事件由 bindDiagramActionsDelegation 统一处理）
 */
export declare const copyMermaid: (containers: NodeListOf<HTMLElement> | undefined, options: {
    customIcon: ICustomIcon;
}) => () => void;
/**
 * 缩放、拖拽 mermaid 模块
 */
export declare const zoomMermaid: (containers: NodeListOf<HTMLElement> | undefined, options: {
    customIcon: ICustomIcon;
}) => () => void;
