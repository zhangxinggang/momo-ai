import type { SelectProps } from 'antd';
import type { MouseEvent } from 'react';

export interface IProps {
  value: string[];
  options: string[];
  placeholder?: string;
  disabled?: boolean;
  size?: SelectProps['size'];
  className?: string;
  onChange: (tags: string[]) => void;
  onClick?: (event: MouseEvent<HTMLDivElement>) => void;
}
