import { CSSProperties, MouseEvent, ReactNode } from 'react';
export interface IProps {
  title?: string;
  modalTitle?: string;
  visible: boolean;
  width?: string;
  height?: string;
  trigger: ReactNode;
  onClick: (e: MouseEvent) => void;
  onClose: () => void;
  showAdjust?: boolean;
  isFullscreen?: boolean;
  onAdjust?: (v: boolean) => void;
  children?: any;
  className?: string;
  style?: CSSProperties;
  showMask?: boolean;
  disabled?: boolean;
}
declare const _default: import('react').MemoExoticComponent<
  (props: IProps) => import('react/jsx-runtime').JSX.Element
>;
export default _default;
