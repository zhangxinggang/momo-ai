import React from 'react';

interface IProps {
  visible: boolean;
}

// 说明：该覆盖层应作为“聊天滚动容器”的子元素渲染，并依赖父容器的 relative 定位。
const DropOverlay: React.FC<IProps> = ({ visible }) => {
  if (!visible) return null;
  return (
    <div className='\ pointer-events-none absolute inset-0 z-40 flex select-none items-center justify-center backdrop-blur-md backdrop-saturate-150'>
      <div className='space-y-2 text-center'>
        <div className='text-foreground text-lg font-semibold tracking-wide transition-colors md:text-xl'>
          拖放添加文件
        </div>
        <div className='text-xs text-gray-500 transition-colors md:text-sm dark:text-gray-400'>
          文件数量：最多 10 个，文件类型：txt、md、docx、css、html、js、py
        </div>
      </div>
    </div>
  );
};

export default DropOverlay;
