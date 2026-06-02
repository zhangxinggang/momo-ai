import { Highlighter } from 'lucide-react';
import { memo } from 'react';

import type { TInsertContentGenerator } from '../components/MdEditor/type';
import NormalToolbar from '../components/NormalToolbar';

interface IProps {
  title?: string;
  disabled?: boolean;
  showToolbarName?: boolean;
  insert?: (generate: TInsertContentGenerator) => void;
}

/** 文本标记工具栏（==高亮==，对齐 @vavt/v3-extension Mark） */
function ToolbarMark({ title = '标记', disabled, showToolbarName, insert }: IProps) {
  const handleClick = () => {
    insert?.((selectedText) => ({
      targetValue: `==${selectedText}==`,
      select: true,
      deviationStart: 2,
      deviationEnd: -2,
    }));
  };

  return (
    <NormalToolbar disabled={disabled} title={title} onClick={handleClick}>
      <Highlighter className='md-editor-icon' size={16} />
      {showToolbarName ? <div className='md-editor-toolbar-item-name'>{title}</div> : null}
    </NormalToolbar>
  );
}

export default memo(ToolbarMark);
