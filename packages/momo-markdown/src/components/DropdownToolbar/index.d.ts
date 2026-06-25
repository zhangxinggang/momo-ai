import { ReactNode } from 'react';
export interface IProps {
  title?: string;
  visible: boolean;
  trigger?: ReactNode;
  onChange: (visible: boolean) => void;
  overlay: ReactNode;
  children?: ReactNode;
  disabled?: boolean;
}
declare const _default: import('react').MemoExoticComponent<
  (props: IProps) => import('react/jsx-runtime').JSX.Element
>;
export default _default;
