import { AiChatView, ChatProvider, type IChatMessage } from '@momo/aichat';
import '@momo/markdown-styles';
import { FullscreenModal } from '@renderer/components/ui/FullscreenModal';
import { useToast } from '@renderer/components/ui/Toast';
import { useAiChatViewTheme } from '@renderer/hooks/useAiChatViewTheme';
import { useChatWorkspaceBinding } from '@renderer/hooks/useChatWorkspaceBinding';
import { useRankedChatModelGroups } from '@renderer/hooks/useRankedChatModelGroups';
import { useStableModelResolver } from '@renderer/hooks/useStableModelResolver';
import { buildSharedAiChatServices, createGeneralChatStream } from '@renderer/services/aichat';
import { useNoteStore, useSettingsStore } from '@renderer/store';
import { App, Button } from 'antd';
import { useMemo } from 'react';

interface IProps {
  open: boolean;
  filePath: string;
  onClose: () => void;
}

/** 笔记 AI 写作：全屏对话，可追加到当前笔记 */
export function NoteAiWritingModal({ open, filePath, onClose }: IProps) {
  const { message } = App.useApp();
  const { showToast } = useToast();
  const appendContent = useNoteStore((s) => s.appendEditorContent);
  const aiModels = useSettingsStore((s) => s.aiModels);
  const modelResolverRef = useStableModelResolver(aiModels);
  const chatModelOptionGroups = useRankedChatModelGroups(aiModels);
  const workspace = useChatWorkspaceBinding();
  const chatTheme = useAiChatViewTheme();

  const chatServices = useMemo(
    () =>
      buildSharedAiChatServices({
        aiModels,
        chatModelOptionGroups,
        workspace,
        storageKeyPrefix: 'skill-platform-note-ai-writing',
        noAttachmentsMessage: '笔记 AI 写作暂不支持附件',
        onNoAttachments: (msg) => showToast(msg, 'warning'),
        callAIChatStream: createGeneralChatStream({
          getModelConfig: (modelKey) => modelResolverRef.current.getModelConfig(modelKey),
          getDefaultConfig: () => modelResolverRef.current.getModelConfig(),
          onNeedModel: () => showToast('请先在设置中配置 AI 对话模型', 'error'),
        }),
      }),
    [aiModels, chatModelOptionGroups, modelResolverRef, showToast, workspace],
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
    <FullscreenModal
      open={open}
      title={`AI 写作 - ${filePath}`}
      onClose={onClose}
      footer={null}
      showDefaultFooter={false}>
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
    </FullscreenModal>
  );
}
