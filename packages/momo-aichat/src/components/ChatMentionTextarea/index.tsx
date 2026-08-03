import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin';
import classNames from 'classnames';
import {
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  type CSSProperties,
  type KeyboardEvent,
  type Ref,
} from 'react';

import { ChatMentionCallbacksProvider } from './context/ChatMentionCallbacksContext';
import { NoteMentionNode } from './nodes/NoteMentionNode';
import { ControlledValuePlugin } from './plugins/ControlledValuePlugin';
import { EnterKeyPlugin } from './plugins/EnterKeyPlugin';
import { ImperativeApiPlugin } from './plugins/ImperativeApiPlugin';
import type { IChatMentionTextareaRef } from './types';
import styles from './index.module.less';

export type { IChatMentionTextareaRef } from './types';

interface IProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLElement>) => void;
  onSelectionChange?: (selectionStart: number) => void;
  onMentionClick?: (cursorPos: number) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
}

function EditableStatePlugin(props: { disabled?: boolean }) {
  const { disabled } = props;
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    editor.setEditable(!disabled);
  }, [disabled, editor]);

  return null;
}

function ChatMentionTextareaInner(props: IProps, ref: Ref<IChatMentionTextareaRef>) {
  const {
    value,
    onChange,
    onKeyDown,
    onSelectionChange,
    onMentionClick,
    placeholder,
    disabled,
    className,
    style,
  } = props;

  const editableRef = useRef<HTMLDivElement>(null);
  const pendingSelectionRef = useRef<number | null>(null);

  const initialConfig = useMemo(
    () => ({
      namespace: 'ChatMentionTextarea',
      nodes: [NoteMentionNode],
      onError: (error: Error) => {
        console.error(error);
      },
      editable: !disabled,
    }),
    // 仅挂载时创建 editor；disabled 由 EditableStatePlugin 同步
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const callbackValue = useMemo(
    () => ({
      onMentionClick,
    }),
    [onMentionClick],
  );

  return (
    <ChatMentionCallbacksProvider value={callbackValue}>
      <LexicalComposer initialConfig={initialConfig}>
        <EditableStatePlugin disabled={disabled} />
        <div className={styles['mention-input']}>
          <PlainTextPlugin
            contentEditable={
              <ContentEditable
                ref={editableRef}
                className={classNames(styles['mention-input-editable'], className)}
                style={style}
                onKeyDown={onKeyDown}
                spellCheck={false}
                {...(placeholder
                  ? {
                      'aria-placeholder': placeholder,
                      placeholder: (
                        <div className={styles['mention-input-placeholder']}>{placeholder}</div>
                      ),
                    }
                  : {})}
              />
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <ControlledValuePlugin
            value={value}
            onChange={onChange}
            onSelectionChange={onSelectionChange}
            pendingSelectionRef={pendingSelectionRef}
          />
          <EnterKeyPlugin />
          <ImperativeApiPlugin
            apiRef={ref}
            editableRef={editableRef}
            pendingSelectionRef={pendingSelectionRef}
            onSelectionChange={onSelectionChange}
          />
        </div>
      </LexicalComposer>
    </ChatMentionCallbacksProvider>
  );
}

export const ChatMentionTextarea = forwardRef(ChatMentionTextareaInner);

ChatMentionTextarea.displayName = 'ChatMentionTextarea';
