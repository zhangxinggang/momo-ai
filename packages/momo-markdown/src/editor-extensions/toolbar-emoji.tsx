import { Smile } from 'lucide-react';
import { memo, useMemo, useState } from 'react';

import DropdownToolbar from '../components/DropdownToolbar';
import type { TInsertContentGenerator } from '../components/MdEditor/type';

const EMOJI_LIST = [
  '😀',
  '😃',
  '😄',
  '😁',
  '😆',
  '😅',
  '😂',
  '🤣',
  '🥲',
  '🤔',
  '😊',
  '😇',
  '🙂',
  '🙃',
  '😉',
  '😌',
  '😍',
  '🥰',
  '😘',
  '😗',
  '😙',
  '😚',
  '😋',
  '😛',
  '😝',
  '😜',
  '🤪',
  '🤨',
  '🧐',
  '🤓',
  '😎',
  '🥸',
  '🤩',
  '🥳',
  '😏',
  '😒',
  '😞',
  '😔',
  '😟',
  '😕',
  '🙁',
  '👻',
  '😣',
  '😖',
  '😫',
  '😩',
  '🥺',
  '😢',
  '😭',
  '😤',
  '😠',
  '😡',
  '🤬',
  '🤯',
  '😳',
  '👍',
  '👎',
  '💯',
  '👏',
  '🔔',
  '🎁',
  '❓',
  '💣',
  '❤️',
  '☕️',
  '🌀',
  '🙇',
  '💋',
  '🙏',
  '💢',
  '🎉',
  '🔥',
  '✨',
  '💡',
  '📝',
  '✅',
  '❌',
  '⚠️',
];

interface IProps {
  title?: string;
  disabled?: boolean;
  showToolbarName?: boolean;
  insert?: (generate: TInsertContentGenerator) => void;
}

/** 表情插入工具栏（对齐 @vavt/v3-extension Emoji） */
function ToolbarEmoji({ title = '表情', disabled, showToolbarName, insert }: IProps) {
  const [visible, setVisible] = useState(false);

  const overlay = useMemo(
    () => (
      <div className='md-editor-emoji-panel'>
        {EMOJI_LIST.map((emoji) => (
          <button
            key={emoji}
            className='md-editor-emoji-item'
            type='button'
            onClick={() => {
              insert?.(() => ({
                targetValue: emoji,
                select: false,
                deviationStart: 0,
                deviationEnd: 0,
              }));
              setVisible(false);
            }}>
            {emoji}
          </button>
        ))}
      </div>
    ),
    [insert],
  );

  return (
    <DropdownToolbar
      disabled={disabled}
      overlay={overlay}
      title={title}
      visible={visible}
      onChange={setVisible}
      trigger={
        <>
          <Smile className='md-editor-icon' size={16} />
          {showToolbarName ? <div className='md-editor-toolbar-item-name'>{title}</div> : null}
        </>
      }
    />
  );
}

export default memo(ToolbarEmoji);
