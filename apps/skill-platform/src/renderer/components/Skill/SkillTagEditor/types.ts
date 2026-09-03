import type { SelectProps } from 'antd';
import type { MouseEvent } from 'react';

export interface IProps {
  value: string[];
  options: string[];
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  compact?: boolean;
  bordered?: boolean;
  size?: SelectProps['size'];
  className?: string;
  onChange: (tags: string[]) => void;
  onClick?: (event: MouseEvent<HTMLDivElement>) => void;
}
