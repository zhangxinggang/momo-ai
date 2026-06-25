import { MouseEvent } from 'react';
import { TMdHeadingId } from '~/type';
import { ITocItem } from './index';
export interface IProps {
  tocItem: ITocItem;
  mdHeadingId: TMdHeadingId;
  onActive: (tocItem: ITocItem, ele: HTMLDivElement) => void;
  onClick?: (e: MouseEvent, t: ITocItem) => void;
  scrollElementOffsetTop?: number;
}
declare const _default: import('react').MemoExoticComponent<
  ({
    tocItem,
    mdHeadingId,
    onActive,
    onClick,
    scrollElementOffsetTop,
  }: IProps) => import('react/jsx-runtime').JSX.Element
>;
export default _default;
