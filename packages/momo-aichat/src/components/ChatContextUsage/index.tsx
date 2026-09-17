import { Popover } from 'antd';
import { useState } from 'react';
import { useChatContext } from '../../contexts/ChatContext';
import {
  contextUsagePercent,
  estimateSessionContextUsage,
  formatContextTokens,
  latestContextUsage,
  REFERENCE_CONTEXT_WINDOW_TOKENS,
} from '../../utils/context-usage';

const rows = [
  { key: 'systemTokens', label: '系统提示词', color: '#aeb4be' },
  { key: 'toolsTokens', label: '工具定义', color: '#a78bfa' },
  { key: 'messageTokens', label: '对话消息', color: '#4b8df8' },
] as const;

export function ChatContextUsage({ modelId }: { modelId?: string }) {
  const { currentSession, currentModel } = useChatContext();
  const selectedModel = modelId ?? currentModel;
  const [open, setOpen] = useState(false);
  const usage = latestContextUsage(currentSession?.messages ?? [], selectedModel);
  const estimatedUsage = estimateSessionContextUsage(currentSession?.messages ?? [], selectedModel);
  const displayUsage = usage
    ? usage.contextWindowSource === 'model' && usage.contextWindow
      ? usage
      : {
          ...usage,
          contextWindow: REFERENCE_CONTEXT_WINDOW_TOKENS,
          contextWindowSource: 'estimate' as const,
        }
    : estimatedUsage;
  const percent = contextUsagePercent(displayUsage) ?? 0;
  const contextWindow = displayUsage.contextWindow ?? REFERENCE_CONTEXT_WINDOW_TOKENS;
  const circumference = 2 * Math.PI * 6;
  const total = rows.reduce((sum, row) => sum + displayUsage[row.key], 0);

  return (
    <Popover
      trigger={['hover', 'click']}
      placement='topRight'
      open={open}
      onOpenChange={setOpen}
      arrow={false}
      styles={{ container: { padding: 12, borderRadius: 12 } }}
      content={
        <div className='chat-context-usage-panel'>
          <div className='chat-context-usage-header'>
            <span>
              上下文已用 <strong>{percent}%</strong>
            </span>
            <span className='chat-context-usage-figures'>
              {`~${formatContextTokens(displayUsage.usedTokens)} / ${formatContextTokens(contextWindow)}`}
            </span>
          </div>
          <div className='chat-context-usage-bar' aria-hidden>
            {rows.map((row) => (
              <span
                key={row.key}
                style={{
                  background: row.color,
                  width: `${total ? (displayUsage[row.key] / total) * percent : 0}%`,
                }}
              />
            ))}
          </div>
          <dl className='chat-context-usage-rows'>
            {rows.map((row) => (
              <div key={row.key}>
                <dt>
                  <i style={{ background: row.color }} />
                  {row.label}
                </dt>
                <dd>{`~${formatContextTokens(displayUsage[row.key])}`}</dd>
              </div>
            ))}
          </dl>
        </div>
      }>
      <button
        type='button'
        className='chat-context-usage-trigger'
        aria-label={`上下文已用 ${percent}%，约 ${formatContextTokens(displayUsage.usedTokens)} / ${formatContextTokens(contextWindow)}`}
        aria-expanded={open}>
        <svg width='16' height='16' viewBox='0 0 16 16' aria-hidden>
          <circle className='chat-context-usage-track' cx='8' cy='8' r='6' />
          <circle
            className='chat-context-usage-fill'
            cx='8'
            cy='8'
            r='6'
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - (percent ?? 0) / 100)}
            transform='rotate(-90 8 8)'
          />
        </svg>
      </button>
    </Popover>
  );
}
