import { CSSProperties, ReactNode } from 'react';
export type IProps = Readonly<{
    title?: ReactNode;
    visible?: boolean;
    width?: string;
    height?: string;
    onClose?: () => void;
    showAdjust?: boolean;
    isFullscreen?: boolean;
    onAdjust?: (val: boolean) => void;
    children?: any;
    className?: string;
    style?: CSSProperties;
    showMask?: boolean;
}>;
declare const _default: import("react").MemoExoticComponent<(props: IProps) => import("react/jsx-runtime").JSX.Element>;
export default _default;
