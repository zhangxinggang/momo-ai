import { strToU8, zipSync } from 'fflate';
import type { IChatSession } from '../types/chat';
import { buildChatTurnExport } from './chat-export';

/** 导出完整会话；JSON 保留请求快照、Harness 事件和上下文用量。 */
export function buildChatSessionExport(
  session: IChatSession,
  exportedAt = new Date(),
  runtimeLog?: Record<string, unknown>,
): Uint8Array {
  const markdown = [
    `# ${session.title || 'AI 对话'}`,
    '',
    `- 会话 ID：${session.id}`,
    `- 导出时间：${exportedAt.toLocaleString()}`,
  ];
  let turn = 0;
  for (let index = 0; index < session.messages.length; index += 1) {
    const message = session.messages[index];
    if (message.role === 'user') {
      turn += 1;
      const next = session.messages[index + 1];
      const assistantMessage = next?.role === 'assistant' ? next : undefined;
      markdown.push(
        '',
        '---',
        '',
        buildChatTurnExport({
          sessionTitle: `第 ${turn} 轮`,
          userMessage: message,
          assistantMessage,
          exportedAt,
        }),
      );
      if (assistantMessage) index += 1;
    } else {
      markdown.push(
        '',
        `## ${message.role === 'system' ? '系统消息' : '助手消息'}`,
        '',
        message.content,
      );
    }
  }
  return zipSync({
    ...(runtimeLog ? { 'harness-log.json': strToU8(JSON.stringify(runtimeLog, null, 2)) } : {}),
    'conversation.md': strToU8(markdown.join('\n')),
    'session.json': strToU8(
      JSON.stringify({ exportedAt: exportedAt.toISOString(), session }, null, 2),
    ),
  });
}

export function downloadChatSessionExport(
  session: IChatSession,
  runtimeLog?: Record<string, unknown>,
): void {
  const exportedAt = new Date();
  const bytes = buildChatSessionExport(session, exportedAt, runtimeLog);
  const url = URL.createObjectURL(new Blob([new Uint8Array(bytes)], { type: 'application/zip' }));
  const anchor = document.createElement('a');
  const title = (session.title || 'AI-对话')
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, '-')
    .slice(0, 80);
  anchor.href = url;
  anchor.download = `${title}-${exportedAt.toISOString().replace(/[:.]/g, '-')}.zip`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}
