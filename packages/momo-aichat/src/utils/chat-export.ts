import type { IChatMessage } from '../types/chat';
import { slashTokensToPlainText } from './slash-token';

export interface IChatTurnExportInput {
  sessionTitle: string;
  userMessage: IChatMessage;
  assistantMessage?: IChatMessage;
  exportedAt?: Date;
}

function formatTimestamp(timestamp?: number): string {
  return timestamp ? new Date(timestamp).toLocaleString() : '—';
}

function safeText(value?: string): string {
  return value?.trim() || '（无）';
}

function escapeTableCell(value: string): string {
  return value.replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>');
}

/** 生成可审计的单轮问答 Markdown：展示内容与实际请求内容分开记录。 */
export function buildChatTurnExport(input: IChatTurnExportInput): string {
  const { userMessage, assistantMessage } = input;
  const invocations =
    userMessage.invocations ?? (userMessage.invocation ? [userMessage.invocation] : []);
  const snapshot = userMessage.requestSnapshot;
  const exportedAt = input.exportedAt ?? new Date();
  const lines: string[] = [
    `# ${input.sessionTitle.trim() || 'AI 问答导出'}`,
    '',
    `- 导出时间：${exportedAt.toLocaleString()}`,
    `- 提问时间：${formatTimestamp(userMessage.timestamp)}`,
    `- 回答时间：${formatTimestamp(assistantMessage?.timestamp)}`,
  ];

  if (invocations.length > 0) {
    lines.push(
      '',
      '## 调用的 Skill / Command',
      '',
      '| 顺序 | 类型 | 名称 | 来源 | 命令 | 分类 / 标签 |',
      '| ---: | --- | --- | --- | --- | --- |',
    );
    invocations.forEach((invocation, index) => {
      const source =
        invocation.scope === 'application'
          ? 'momo-ai 应用技能'
          : invocation.scope === 'project'
            ? '项目资源'
            : 'Agent 全局资源';
      lines.push(
        `| ${index + 1} | ${invocation.kind === 'skill' ? 'Skill' : 'Command'} | ${escapeTableCell(invocation.label || invocation.command)} | ${source} | ${escapeTableCell(invocation.command)} | ${escapeTableCell([invocation.category, ...(invocation.tags ?? [])].filter(Boolean).join(' / ') || '—')} |`,
      );
    });
  }

  lines.push('', '## 用户问题', '', safeText(slashTokensToPlainText(userMessage.content)));

  if (userMessage.attachments?.length) {
    lines.push('', '### 附件', '', '| 名称 | 类型 | 大小 |', '| --- | --- | ---: |');
    for (const attachment of userMessage.attachments) {
      lines.push(
        `| ${escapeTableCell(attachment.name)} | ${escapeTableCell(attachment.mime || attachment.ext)} | ${attachment.size} B |`,
      );
    }
  }

  if (
    snapshot?.apiContent &&
    snapshot.apiContent.trim() !== slashTokensToPlainText(userMessage.content).trim()
  ) {
    lines.push('', '## 实际请求内容（含已展开的 Skill / Command）', '', snapshot.apiContent.trim());
  }

  if (assistantMessage?.thinkingContent?.trim()) {
    lines.push('', '## 思考过程', '', assistantMessage.thinkingContent.trim());
  }

  lines.push('', '## AI 回答', '', safeText(assistantMessage?.content));

  if (snapshot || assistantMessage?.stats) {
    lines.push('', '## 执行详情', '', '| 项目 | 值 |', '| --- | --- |');
    if (snapshot) {
      lines.push(
        `| 模型 ID | ${escapeTableCell(snapshot.modelId)} |`,
        `| Agent 模式 | ${snapshot.agentMode} |`,
        `| Temperature | ${snapshot.temperature} |`,
        `| Top P | ${snapshot.topP} |`,
        `| 知识库 | ${snapshot.kbEnabled ? `启用${snapshot.kbCollectionId ? `（${snapshot.kbCollectionId}）` : ''}` : '关闭'} |`,
      );
    }
    if (assistantMessage?.stats) {
      lines.push(
        `| 实际模型 | ${escapeTableCell(assistantMessage.stats.model)} |`,
        `| 响应耗时 | ${escapeTableCell(assistantMessage.stats.responseTime)} |`,
        `| Prompt Tokens | ${assistantMessage.stats.promptTokens} |`,
        `| Completion Tokens | ${assistantMessage.stats.completionTokens} |`,
        `| Total Tokens | ${assistantMessage.stats.totalTokens} |`,
      );
    }
  }

  return `${lines.join('\n').trim()}\n`;
}

function safeFileName(value: string): string {
  const normalized = value
    .trim()
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, '-')
    .slice(0, 80);
  return normalized || 'AI-问答';
}

/** 使用浏览器下载能力导出 UTF-8 Markdown 文件。 */
export function downloadChatTurnExport(input: IChatTurnExportInput): string {
  const content = buildChatTurnExport(input);
  const timestamp = (input.exportedAt ?? new Date()).toISOString().replace(/[:.]/g, '-');
  const fileName = `${safeFileName(input.sessionTitle)}-${timestamp}.md`;
  const blob = new Blob(['\uFEFF', content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
  return fileName;
}
