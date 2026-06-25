import { AiChatView, ChatProvider, useChatWorkspaceConfig, type IChatMessage } from '@momo/aichat';
import { FullscreenModal } from '@renderer/components/ui/FullscreenModal';
import { useToast } from '@renderer/components/ui/Toast';
import { useAiChatViewTheme } from '@renderer/hooks/useAiChatViewTheme';
import { useRankedChatModelGroups } from '@renderer/hooks/useRankedChatModelGroups';
import { useStableModelResolver } from '@renderer/hooks/useStableModelResolver';
import { buildSharedAiChatServices, createGeneralChatStream } from '@renderer/services/aichat';
import { pickFolders } from '@renderer/services/desktop';
import {
  buildNoteAiStoragePrefix,
  buildNoteAiWorkspaceStorageKey,
} from '@renderer/services/note/note-ai-storage';
import { getWorkspaceContextFromStorageKey } from '@renderer/services/workspace/context';
import { useNoteStore, useSettingsStore } from '@renderer/store';
import { App, Button } from 'antd';
import { useMemo } from 'react';

interface IContentProps {
  filePath: string;
  noteId: string;
  onClose: () => void;
}

/** 按 noteId 隔离的 AI 写作内容（切换笔记时整棵子树 remount） */
function NoteAiWritingContent({ filePath, noteId, onClose }: IContentProps) {
  const { message } = App.useApp();
  const { showToast } = useToast();
  const appendContent = useNoteStore((s) => s.appendEditorContent);
  const aiModels = useSettingsStore((s) => s.aiModels);
  const modelResolverRef = useStableModelResolver(aiModels);
  const chatModelOptionGroups = useRankedChatModelGroups(aiModels);
  const chatTheme = useAiChatViewTheme();
  const workspaceStorageKey = buildNoteAiWorkspaceStorageKey(noteId);

  const workspace = useChatWorkspaceConfig({
    storageKey: workspaceStorageKey,
    selectFolder: async () => {
      const paths = await pickFolders();
      return paths[0] ?? null;
    },
  });

  const chatServices = useMemo(
    () =>
      buildSharedAiChatServices({
        aiModels,
        chatModelOptionGroups,
        workspace,
        storageKeyPrefix: buildNoteAiStoragePrefix(noteId),
        noAttachmentsMessage: '笔记 AI 写作暂不支持附件',
        onNoAttachments: (msg) => showToast(msg, 'warning'),
        callAIChatStream: createGeneralChatStream({
          getModelConfig: (modelKey) => modelResolverRef.current.getModelConfig(modelKey),
          getDefaultConfig: () => modelResolverRef.current.getModelConfig(),
          onNeedModel: () => showToast('请先在设置中配置 AI 对话模型', 'error'),
          resolveWorkspaceContext: (userMessage) =>
            getWorkspaceContextFromStorageKey(workspaceStorageKey, userMessage),
        }),
      }),
    [
      aiModels,
      chatModelOptionGroups,
      modelResolverRef,
      noteId,
      showToast,
      workspace,
      workspaceStorageKey,
    ],
  );

  const handleSaveToNote = (msg: IChatMessage) => {
    const text = msg.content?.trim();
    if (!text) {
      message.warning('没有可保存的内容');
      return;
    }
    appendContent(`\n\n${text}`);
    message.success('已追加到当前笔记');
    onClose();
  };

  return (
    <ChatProvider services={chatServices}>
      <AiChatView
        {...chatTheme}
        hideWelcome
        renderAssistantMessageActions={(msg) => (
          <Button type='link' size='small' onClick={() => handleSaveToNote(msg)}>
            保存到笔记
          </Button>
        )}
      />
    </ChatProvider>
  );
}

interface IProps {
  open: boolean;
  filePath: string;
  noteId: string;
  onClose: () => void;
}

/** 笔记 AI 写作：全屏对话，可追加到当前笔记（按 noteId 隔离历史与设置） */
export function NoteAiWritingModal({ open, filePath, noteId, onClose }: IProps) {
  if (!noteId) {
    return null;
  }

  return (
    <FullscreenModal
      open={open}
      title={`AI 写作 - ${filePath}`}
      onClose={onClose}
      footer={null}
      showDefaultFooter={false}>
      {open ? (
        <NoteAiWritingContent key={noteId} filePath={filePath} noteId={noteId} onClose={onClose} />
      ) : null}
    </FullscreenModal>
  );
}
