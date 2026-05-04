import { StopOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import React from 'react';

interface IProps {
  /** 是否显示按钮 */
  visible: boolean;
  /** 点击停止生成的回调函数 */
  onStop: () => void;
  /** 按钮是否禁用 */
  disabled?: boolean;
  /** 自定义样式类名 */
  className?: string;
}

/**
 * 停止生成按钮组件
 * 用于中断AI消息生成过程
 */
const StopGenerationButton: React.FC<IProps> = ({
  visible,
  onStop,
  disabled = false,
  className = '',
}) => {
  if (!visible) {
    return null;
  }

  return (
    <Button
      type='default'
      size='small'
      icon={<StopOutlined />}
      onClick={onStop}
      disabled={disabled}
      className={`disabled:border-surface flex items-center gap-1 border-red-200 bg-red-50 px-3 py-1 text-red-600 shadow-sm transition-all duration-200 ease-in-out hover:border-red-300 hover:bg-red-100 hover:text-red-700 hover:shadow-md focus:border-red-300 focus:bg-red-100 focus:text-red-700 disabled:bg-gray-50 disabled:text-gray-400 ${className} `}
      style={{
        borderRadius: '6px',
        fontSize: '12px',
        height: '28px',
        lineHeight: '1',
      }}>
      停止生成
    </Button>
  );
};

export default StopGenerationButton;
