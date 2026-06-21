import { CSSProperties, MouseEvent } from 'react';
import { IHeadList, TMdHeadingId, TThemes } from '~/type';
export interface ITocItem extends IHeadList {
    index: number;
    children?: Array<ITocItem>;
}
export interface IProps {
    /**
     * 编辑器的Id，务必与需要绑定的编辑器Id相同
     */
    editorId: string;
    className?: string;
    mdHeadingId?: TMdHeadingId;
    /**
     * 指定滚动的容器，选择器需带上对应的符号，默认预览框
     * 元素必须定位！！！！！！
     *
     * 默认：#md-editor-preview-wrapper
     */
    scrollElement?: string | HTMLElement;
    style?: CSSProperties;
    theme?: TThemes;
    onClick?: (e: MouseEvent, t: ITocItem) => void;
    /**
     * 高亮标题相对滚动容器顶部偏移量，即距离该值时，高亮当前目录菜单项
     *
     * 默认：20px
     */
    offsetTop?: number;
    /**
     * 滚动区域的固定顶部高度
     *
     * 默认：0
     */
    scrollElementOffsetTop?: number;
    /**
     * 高亮的标题变化事件
     *
     * @param heading
     * @returns
     */
    onActive?: (heading: IHeadList | undefined, activeElement: HTMLDivElement) => void;
    /**
     * 滚动容器是否在web component中，默认不在
     *
     * 在其中的话通过document查询不到
     */
    isScrollElementInShadow?: boolean;
    /**
     * 设置与哪个区域同步，默认与内容区域同步
     *
     * >= v5.3.0
     *
     * @default 'preview'
     */
    syncWith?: 'editor' | 'preview';
    /**
     * 控制最大显示的目录层级
     *
     * >= v5.5.0
     */
    catalogMaxDepth?: number;
}
declare const _default: import("react").MemoExoticComponent<(props: IProps) => import("react/jsx-runtime").JSX.Element>;
export default _default;
