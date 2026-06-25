import { MouseEvent, ReactNode } from 'react';
export interface IProps {
  children: ReactNode;
  onClick?: (e: MouseEvent) => void;
  disabled?: boolean;
}
declare const _default: import('react').MemoExoticComponent<
  (props: IProps) => import('react/jsx-runtime').JSX.Element
>;
export default _default;
