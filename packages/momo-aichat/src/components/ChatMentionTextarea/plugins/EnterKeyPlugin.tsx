import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { COMMAND_PRIORITY_HIGH, KEY_ENTER_COMMAND } from 'lexical';
import { useEffect } from 'react';

/**
 * 非 Shift+Enter 时阻止 Lexical 插入新段落；业务（发送/@/斜杠）由 ContentEditable onKeyDown 处理。
 */
export function EnterKeyPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      KEY_ENTER_COMMAND,
      (event) => {
        if (!event) {
          return false;
        }
        if (event.shiftKey) {
          return false;
        }
        return true;
      },
      COMMAND_PRIORITY_HIGH,
    );
  }, [editor]);

  return null;
}
