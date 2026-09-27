import {
  isFileQuestion,
  type RunEvent,
  type RunInteraction,
  type RunResponse,
  type SourceRef,
} from '@momo/agent-contracts';
import { Button, Checkbox, Input, Radio, Space, Tag } from 'antd';
import React, { useState } from 'react';
import { runFailureDetails } from '../../utils/run-failure';
import MarkdownRenderer from '../MarkdownRenderer';
function Interaction({
  event,
  resolved,
  respond,
  uploadFiles,
}: {
  event: RunEvent;
  resolved: boolean;
  respond: (value: RunResponse) => Promise<void>;
  uploadFiles?: (files: File[]) => Promise<SourceRef[]>;
}) {
  const request = event.payload as unknown as RunInteraction;
  const [selected, setSelected] = useState<Record<string, string[]>>({});
  const [custom, setCustom] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<Record<string, SourceRef[]>>({});
  const [uploading, setUploading] = useState(false);
  const [remember, setRemember] = useState(false);
  const [busy, setBusy] = useState(false),
    [answered, setAnswered] = useState(false),
    [error, setError] = useState('');
  const send = async (decision?: 'allowed-once' | 'rejected') => {
    setBusy(true);
    setError('');
    try {
      await respond({
        runId: event.runId,
        requestId: request.requestId,
        decision,
        remember: request.kind === 'approval' && remember,
        answers:
          request.kind === 'question'
            ? (request.questions ?? []).map((q) => ({
                id: q.id,
                selected: selected[q.id] ?? [],
                custom: custom[q.id] || undefined,
                sourceRefs: files[q.id]?.length ? files[q.id] : undefined,
              }))
            : undefined,
      });
      setAnswered(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  const disabled = resolved || answered || busy || uploading;
  const ready = (request.questions ?? []).every(
    (q) =>
      (selected[q.id]?.length ?? 0) > 0 ||
      (isFileQuestion(q) ? files[q.id]?.length : custom[q.id]?.trim()),
  );
  const selectFiles = async (id: string, chosen: File[]) => {
    if (!chosen.length || !uploadFiles) return;
    setUploading(true);
    setError('');
    try {
      const refs = await uploadFiles(chosen);
      setFiles((previous) => ({ ...previous, [id]: refs }));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUploading(false);
    }
  };
  return (
    <div
      style={{
        border: '1px solid var(--color-border, #ddd)',
        borderRadius: 8,
        padding: 12,
        margin: '8px 0',
      }}>
      <Tag color={disabled ? 'default' : 'blue'}>
        {request.kind === 'approval' ? '执行审批' : 'Harness 追问'}
        {resolved || answered ? ' · 已结束' : ''}
      </Tag>
      {request.kind === 'approval' ? (
        <>
          <div>{request.toolId}</div>
          <p>{request.reason}</p>
          <pre style={{ whiteSpace: 'pre-wrap', maxHeight: 180, overflow: 'auto' }}>
            {JSON.stringify(request.arguments, null, 2)}
          </pre>
          <Space>
            <Checkbox
              disabled={disabled}
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}>
              记住相同参数的授权（代码执行仍逐次审批）
            </Checkbox>
            <Button
              type='primary'
              disabled={disabled}
              loading={busy}
              onClick={() => void send('allowed-once')}>
              允许本次
            </Button>
            <Button disabled={disabled} onClick={() => void send('rejected')}>
              拒绝
            </Button>
          </Space>
        </>
      ) : (
        <>
          {(request.questions ?? []).map((q) => (
            <div key={q.id} style={{ margin: '10px 0' }}>
              <strong>
                {q.intent?.kind === 'plan-review'
                  ? '计划审阅'
                  : q.header?.replace(/^\[file\]\s*/i, '') || q.question}
              </strong>
              {q.header && (
                <p>
                  {q.intent?.kind === 'plan-review' ? '是否批准此计划并退出计划模式？' : q.question}
                </p>
              )}
              {q.detail && (
                <div style={{ maxHeight: 300, overflow: 'auto' }}>
                  <MarkdownRenderer content={q.detail} isStreaming={false} />
                </div>
              )}
              {q.multiSelect ? (
                <Checkbox.Group
                  disabled={disabled}
                  value={selected[q.id] ?? []}
                  onChange={(value) => setSelected((s) => ({ ...s, [q.id]: value as string[] }))}>
                  <Space direction='vertical'>
                    {q.options?.map((o) => (
                      <Checkbox value={o.label} key={o.label}>
                        {q.intent?.kind === 'plan-review' ? (
                          o.label === q.intent.approve ? (
                            '批准并执行：退出计划模式，从下一步开始执行。'
                          ) : (
                            '继续计划：保留计划模式，并向模型提供反馈。'
                          )
                        ) : (
                          <>
                            {o.label} {o.description}
                          </>
                        )}
                      </Checkbox>
                    ))}
                  </Space>
                </Checkbox.Group>
              ) : (
                <Radio.Group
                  disabled={disabled}
                  value={selected[q.id]?.[0]}
                  onChange={(e) => setSelected((s) => ({ ...s, [q.id]: [e.target.value] }))}>
                  <Space direction='vertical'>
                    {q.options?.map((o) => (
                      <Radio value={o.label} key={o.label}>
                        {q.intent?.kind === 'plan-review' ? (
                          o.label === q.intent.approve ? (
                            '批准并执行：退出计划模式，从下一步开始执行。'
                          ) : (
                            '继续计划：保留计划模式，并向模型提供反馈。'
                          )
                        ) : (
                          <>
                            {o.label} {o.description}
                          </>
                        )}
                      </Radio>
                    ))}
                  </Space>
                </Radio.Group>
              )}
              {isFileQuestion(q) ? (
                <div>
                  <label style={{ display: 'inline-block', margin: '8px 0' }}>
                    <span>{uploading ? '正在上传文件…' : '选择文件'}</span>
                    <input
                      type='file'
                      aria-label={q.question}
                      multiple
                      disabled={disabled || !uploadFiles}
                      onChange={(e) => {
                        const chosen = Array.from(e.target.files ?? []);
                        e.target.value = '';
                        void selectFiles(q.id, chosen);
                      }}
                    />
                  </label>
                  {(files[q.id] ?? []).map((file) => (
                    <div key={file.sourceId}>{file.name}</div>
                  ))}
                  {!uploadFiles && <p>当前入口不支持文件上传，请在主 AI 对话中选择文件。</p>}
                </div>
              ) : (
                <Input.TextArea
                  disabled={disabled}
                  placeholder='补充回答'
                  value={custom[q.id] ?? ''}
                  onChange={(e) => setCustom((s) => ({ ...s, [q.id]: e.target.value }))}
                  rows={2}
                />
              )}
            </div>
          ))}
          <Button
            type='primary'
            loading={busy}
            disabled={disabled || !ready}
            onClick={() => void send()}>
            提交回答
          </Button>
        </>
      )}
      {error && <p style={{ color: '#cf1322' }}>{error}</p>}
    </div>
  );
}
export function RunTimeline({
  events,
  status,
  respond,
  renderArtifact,
  uploadFiles,
}: {
  events: RunEvent[];
  status?: string;
  renderArtifact?: (artifact: any) => React.ReactNode;
  respond: (value: RunResponse) => Promise<void>;
  uploadFiles?: (files: File[]) => Promise<SourceRef[]>;
}) {
  const resolved = new Set(
    events.filter((e) => e.type === 'interaction.resolved').map((e) => e.payload.requestId),
  );
  const tools = events.filter((e) => e.type.startsWith('tool.'));
  const requests = events.filter((e) => e.type === 'interaction.requested');
  const failure = runFailureDetails(events);
  const progress = [...events].reverse().find((e) => e.type === 'agent.status');
  return (
    <div>
      {tools.length > 0 && (
        <details>
          <summary>
            工具执行过程 · {tools.filter((e) => e.type === 'tool.started').length} 次调用
          </summary>
          {tools.map((e) => (
            <div key={e.eventId} style={{ padding: 5 }}>
              <Tag
                color={
                  e.type === 'tool.failed' ? 'red' : e.type === 'tool.completed' ? 'green' : 'blue'
                }>
                {e.type === 'tool.started' ? '调用' : e.type === 'tool.completed' ? '完成' : '失败'}
              </Tag>
              {String(e.payload.title ?? e.payload.toolId)}
              {e.payload.message ? <span> · {String(e.payload.message)}</span> : null}
              {e.payload.preview ? (
                <pre style={{ whiteSpace: 'pre-wrap', maxHeight: 120, overflow: 'auto' }}>
                  {String(e.payload.preview)}
                </pre>
              ) : null}
              {e.payload.unknownOutcome ? <Tag color='orange'>外部执行结果尚未确认</Tag> : null}
            </div>
          ))}
        </details>
      )}
      {requests.map((e) => (
        <Interaction
          key={e.eventId}
          event={e}
          resolved={resolved.has(e.payload.requestId) || Boolean(status && status !== 'running')}
          respond={respond}
          uploadFiles={uploadFiles}
        />
      ))}
      {[
        ...new Map(
          events
            .filter((e) => e.type.startsWith('artifact.'))
            .map((e) => [(e.payload.artifact as any).id, e.payload.artifact]),
        ).values(),
      ].map((artifact: any) => (
        <div key={artifact.id}>{renderArtifact?.(artifact) ?? <Tag>{artifact.name}</Tag>}</div>
      ))}
      {status === 'running' && progress?.payload.message ? (
        <Tag color='blue'>{String(progress.payload.message)}</Tag>
      ) : null}
      {status === 'failed' && <p style={{ color: '#cf1322' }}>{failure.message}</p>}
      {status === 'cancelled' && <Tag>已停止 · 保留已有输出</Tag>}
      {status === 'failed' && (
        <Tag color={failure.uncertain ? 'red' : 'orange'}>{failure.label}</Tag>
      )}
    </div>
  );
}
