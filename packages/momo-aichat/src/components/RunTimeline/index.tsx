import {
  isFileQuestion,
  type RunEvent,
  type RunInteraction,
  type RunResponse,
  type SourceRef,
} from '@momo/agent-contracts';
import { Button, Checkbox, Input, Radio, Space, Tag } from 'antd';
import React, { useEffect, useState } from 'react';
import { runFailureDetails } from '../../utils/run-failure';
import MarkdownRenderer from '../MarkdownRenderer';

interface IToolActivity {
  key: string;
  toolId: string;
  status: 'running' | 'completed' | 'failed';
  title: string;
  arguments?: unknown;
  message?: string;
  preview?: string;
  unknownOutcome?: boolean;
}

function getToolActivities(events: RunEvent[]): IToolActivity[] {
  const calls = new Map<string, IToolActivity>();
  for (const event of events) {
    if (!['tool.started', 'tool.completed', 'tool.failed'].includes(event.type)) continue;
    const payload = event.payload as unknown as Record<string, unknown>;
    const callId = typeof payload.callId === 'string' ? payload.callId : event.eventId;
    const activity = calls.get(callId) ?? {
      key: callId,
      toolId: String(payload.toolId ?? ''),
      status: 'running' as const,
      title: String(payload.title ?? payload.toolId ?? '工具'),
    };
    if (event.type === 'tool.completed') activity.status = 'completed';
    if (event.type === 'tool.failed') activity.status = 'failed';
    if (typeof payload.title === 'string') activity.title = payload.title;
    if (payload.arguments !== undefined) activity.arguments = payload.arguments;
    if (typeof payload.message === 'string') activity.message = payload.message;
    if (typeof payload.preview === 'string') activity.preview = payload.preview;
    if (payload.unknownOutcome === true) activity.unknownOutcome = true;
    calls.set(callId, activity);
  }
  return Array.from(calls.values());
}

type ToolRecord = Record<string, unknown>;

function asRecord(value: unknown): ToolRecord | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as ToolRecord) : null;
}

function parseToolPreview(preview?: string): unknown {
  if (!preview) return undefined;
  try {
    return JSON.parse(preview);
  } catch {
    return preview;
  }
}

function isTruncatedJsonPreview(preview?: string): boolean {
  if (!preview || preview.length < 12_000) return false;
  const trimmed = preview.trimStart();
  return (
    (trimmed.startsWith('{') || trimmed.startsWith('[')) && parseToolPreview(preview) === preview
  );
}

function clippedText(value: string, limit = 120): string {
  const compact = value.replace(/\s+/g, ' ').trim();
  return compact.length > limit ? `${compact.slice(0, limit)}…` : compact;
}

function toolLabel(tool: IToolActivity): string {
  const labels: Record<string, string> = {
    'execution.run': '运行代码',
    'resources.load': '加载资源',
    'resources.list': '浏览资源',
    'workspace.read': '读取文件',
    'workspace.write': '写入文件',
    'workspace.list': '浏览工作区',
    'workspace.search': '搜索工作区',
    'notes.read': '读取笔记',
    'attachments.list': '浏览附件',
    'attachments.readFile': '读取附件',
    'attachments.read': '读取附件',
    'attachments.extract': '提取附件内容',
    'attachments.search': '搜索附件',
    'knowledge.search': '检索知识库',
    'knowledge.chunk': '读取知识片段',
    'artifact.create': '生成文件',
    'artifact.open': '显示文件',
  };
  return labels[tool.toolId] ?? tool.title;
}

function toolIcon(toolId: string): string {
  if (toolId === 'execution.run') return '</>';
  if (toolId.startsWith('resources.')) return 'MD';
  if (toolId.includes('search')) return '⌕';
  if (toolId.includes('read') || toolId.includes('extract')) return '▤';
  if (toolId.includes('write') || toolId.includes('create')) return '✎';
  return '·';
}

function toolSummary(tool: IToolActivity, value: unknown): string {
  if (isTruncatedJsonPreview(tool.preview)) return '结果较长，预览已截断';
  const result = asRecord(value);
  const args = asRecord(tool.arguments);
  if (tool.status === 'running') {
    const runtime = args && typeof args.runtime === 'string' ? args.runtime : '';
    return runtime ? `正在执行 ${runtime}` : '正在执行';
  }
  if (tool.status === 'failed') return clippedText(tool.message || '调用失败');
  if (result && typeof result.error === 'string') return clippedText(result.error);

  if (tool.toolId === 'execution.run' || (result && typeof result.exitCode === 'number')) {
    const runtime = args && typeof args.runtime === 'string' ? args.runtime : '';
    const exitCode = result?.exitCode;
    const output =
      (typeof result?.stderr === 'string' && result.stderr) ||
      (typeof result?.stdout === 'string' && result.stdout) ||
      '';
    const parts = [runtime, typeof exitCode === 'number' ? `退出码 ${exitCode}` : '执行完成'];
    if (output) parts.push(clippedText(output));
    return parts.filter(Boolean).join(' · ');
  }
  if (result && typeof result.content === 'string') {
    const noun = tool.toolId === 'resources.load' ? '已加载资源' : '已读取内容';
    return `${noun} · ${result.content.length.toLocaleString()} 字`;
  }
  if (result && typeof result.text === 'string') {
    return `已读取文本 · ${result.text.length.toLocaleString()} 字`;
  }
  const items =
    result &&
    (result.items ??
      result.files ??
      result.results ??
      result.matches ??
      result.entries ??
      result.citations ??
      result.chunks);
  if (Array.isArray(items)) return `返回 ${items.length.toLocaleString()} 项`;
  if (Array.isArray(value)) return `返回 ${value.length.toLocaleString()} 项`;
  if (typeof value === 'string') return clippedText(value) || '已返回结果';
  return value === undefined ? '等待结果' : '已返回结果';
}

function JsonValueView({ value, depth = 0 }: { value: unknown; depth?: number }) {
  if (value === null) return <span className='run-tool-json-null'>null</span>;
  if (typeof value === 'string') {
    return value.includes('\n') || value.length > 240 ? (
      <pre className='run-tool-pre run-tool-pre-plain'>{value}</pre>
    ) : (
      <span className='run-tool-json-string'>{value}</span>
    );
  }
  if (typeof value !== 'object') return <span>{String(value)}</span>;
  if (depth >= 3) {
    return <pre className='run-tool-pre run-tool-pre-plain'>{JSON.stringify(value, null, 2)}</pre>;
  }
  if (Array.isArray(value)) {
    const visible = value.slice(0, 20);
    return (
      <div className='run-tool-json-list'>
        {visible.map((item, index) => (
          <div className='run-tool-json-list-item' key={index}>
            <JsonValueView value={item} depth={depth + 1} />
          </div>
        ))}
        {value.length > visible.length ? (
          <details className='run-tool-json-overflow'>
            <summary>展开其余 {value.length - visible.length} 项</summary>
            {value.slice(visible.length).map((item, index) => (
              <div className='run-tool-json-list-item' key={index + visible.length}>
                <JsonValueView value={item} depth={depth + 1} />
              </div>
            ))}
          </details>
        ) : null}
      </div>
    );
  }
  return (
    <div className='run-tool-json-fields'>
      {Object.entries(value).map(([key, item]) => (
        <div className='run-tool-json-field' key={key}>
          <span className='run-tool-json-key'>{key}</span>
          <div className='run-tool-json-value'>
            <JsonValueView value={item} depth={depth + 1} />
          </div>
        </div>
      ))}
    </div>
  );
}

function ToolDataSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className='run-tool-data-section'>
      <div className='run-tool-data-label'>{label}</div>
      {children}
    </section>
  );
}

function ExecutionCard({ tool, value }: { tool: IToolActivity; value: unknown }) {
  const args = asRecord(tool.arguments);
  const result = asRecord(value);
  const runtime = typeof args?.runtime === 'string' ? args.runtime : '代码';
  const code = typeof args?.code === 'string' ? args.code : '';
  const stdout = typeof result?.stdout === 'string' ? result.stdout : '';
  const stderr = typeof result?.stderr === 'string' ? result.stderr : '';
  const resultError = typeof result?.error === 'string' ? result.error : '';
  const exitCode = typeof result?.exitCode === 'number' ? result.exitCode : undefined;
  return (
    <div className='run-tool-result-card run-tool-execution-card'>
      {tool.message || resultError ? (
        <div className='run-tool-error-message'>{tool.message || resultError}</div>
      ) : null}
      {code ? (
        <ToolDataSection label={`${runtime} · 代码`}>
          <pre className='run-tool-pre run-tool-code'>{code}</pre>
        </ToolDataSection>
      ) : null}
      {stdout ? (
        <ToolDataSection label='标准输出'>
          <pre className='run-tool-pre run-tool-terminal'>{stdout}</pre>
        </ToolDataSection>
      ) : null}
      {stderr ? (
        <ToolDataSection label='标准错误'>
          <pre className='run-tool-pre run-tool-terminal run-tool-stderr'>{stderr}</pre>
        </ToolDataSection>
      ) : null}
      {!stdout && !stderr && tool.status !== 'running' ? (
        <div className='run-tool-empty-result'>
          {isTruncatedJsonPreview(tool.preview) ? '结果较长，预览已截断' : '没有输出'}
        </div>
      ) : null}
      <div className='run-tool-execution-footer'>
        <span>{runtime}</span>
        {exitCode !== undefined ? (
          <span data-failed={exitCode !== 0}>退出码 {exitCode}</span>
        ) : null}
        {typeof result?.signal === 'string' && result.signal ? (
          <span>信号 {result.signal}</span>
        ) : null}
      </div>
    </div>
  );
}

function ResourceCard({ content }: { content: string }) {
  return (
    <div className='run-tool-result-card run-tool-markdown-card'>
      <MarkdownRenderer content={content} isStreaming={false} />
    </div>
  );
}

function TextCard({ value }: { value: string }) {
  return (
    <div className='run-tool-result-card'>
      <pre className='run-tool-pre run-tool-pre-plain'>{value}</pre>
    </div>
  );
}

function CollectionCard({ items }: { items: unknown[] }) {
  const visible = items.slice(0, 30);
  const renderItem = (item: unknown, index: number) => {
    const record = asRecord(item);
    const title =
      (typeof item === 'string' && item) ||
      (typeof item === 'number' && String(item)) ||
      (typeof record?.label === 'string' && record.label) ||
      (typeof record?.name === 'string' && record.name) ||
      (typeof record?.path === 'string' && record.path) ||
      (typeof record?.title === 'string' && record.title) ||
      `项目 ${index + 1}`;
    const description =
      (typeof record?.description === 'string' && record.description) ||
      (typeof record?.summary === 'string' && record.summary) ||
      (typeof record?.snippet === 'string' && record.snippet) ||
      (typeof record?.excerpt === 'string' && record.excerpt) ||
      (typeof record?.preview === 'string' && record.preview) ||
      '';
    return (
      <div className='run-tool-collection-item' key={index}>
        <div className='run-tool-collection-title'>{title}</div>
        {description ? <div className='run-tool-collection-description'>{description}</div> : null}
      </div>
    );
  };
  return (
    <div className='run-tool-result-card run-tool-collection-card'>
      {visible.map(renderItem)}
      {items.length > visible.length ? (
        <details className='run-tool-json-overflow'>
          <summary>展开其余 {items.length - visible.length} 项</summary>
          {items
            .slice(visible.length)
            .map((item, index) => renderItem(item, index + visible.length))}
        </details>
      ) : null}
      {items.length === 0 ? <div className='run-tool-empty-result'>没有匹配项</div> : null}
    </div>
  );
}

function GenericToolCard({ tool, value }: { tool: IToolActivity; value: unknown }) {
  const record = asRecord(tool.arguments);
  const hasArguments =
    tool.arguments !== undefined && !(record && Object.keys(record).length === 0);
  const hasResult = value !== undefined;
  return (
    <div className='run-tool-result-card run-tool-generic-card'>
      {hasArguments ? (
        <ToolDataSection label='参数'>
          <JsonValueView value={tool.arguments} />
        </ToolDataSection>
      ) : null}
      {hasResult ? (
        <ToolDataSection label='结果'>
          <JsonValueView value={value} />
        </ToolDataSection>
      ) : null}
      {tool.message ? <div className='run-tool-error-message'>{tool.message}</div> : null}
      {tool.unknownOutcome ? (
        <div className='run-tool-uncertain-message'>外部执行结果尚未确认</div>
      ) : null}
      {!hasArguments && !hasResult && !tool.message && !tool.unknownOutcome ? (
        <div className='run-tool-empty-result'>
          {tool.status === 'running' ? '等待工具返回结果' : '工具没有返回内容'}
        </div>
      ) : null}
    </div>
  );
}

function ToolActivityBody({ tool }: { tool: IToolActivity }) {
  const value = parseToolPreview(tool.preview);
  const result = asRecord(value);
  const args = asRecord(tool.arguments);
  if (isTruncatedJsonPreview(tool.preview) && tool.toolId !== 'execution.run') {
    return (
      <div className='run-tool-result-card run-tool-empty-result'>结果较长，当前预览已截断。</div>
    );
  }
  if (tool.toolId === 'execution.run' || (result && typeof result.exitCode === 'number')) {
    return <ExecutionCard tool={tool} value={value} />;
  }
  if (tool.toolId === 'resources.load' && typeof result?.content === 'string') {
    return <ResourceCard content={result.content} />;
  }
  if (tool.toolId === 'resources.list') {
    const items = result && Array.isArray(result.items) ? result.items : [];
    return <CollectionCard items={items} />;
  }
  if (tool.toolId === 'attachments.list') {
    const items = result && Array.isArray(result.files) ? result.files : [];
    return <CollectionCard items={items} />;
  }
  if (tool.toolId.includes('search') || tool.toolId === 'workspace.list') {
    const items =
      result &&
      (result.results ??
        result.matches ??
        result.files ??
        result.items ??
        result.entries ??
        result.citations ??
        result.chunks);
    if (Array.isArray(items)) return <CollectionCard items={items} />;
  }
  if (
    ['workspace.read', 'notes.read', 'attachments.readFile', 'attachments.read'].includes(
      tool.toolId,
    )
  ) {
    const text =
      (typeof result?.content === 'string' && result.content) ||
      (typeof result?.text === 'string' && result.text) ||
      '';
    if (text) return <TextCard value={text} />;
  }
  if (result && typeof result.content === 'string')
    return <ResourceCard content={result.content} />;
  if (result && typeof result.text === 'string') return <TextCard value={result.text} />;
  if (typeof value === 'string') return <TextCard value={value} />;
  if (tool.status === 'failed' && value === undefined && !tool.arguments) {
    return <GenericToolCard tool={tool} value={value} />;
  }
  if (Array.isArray(value)) return <CollectionCard items={value} />;
  if (args || value !== undefined || tool.message || tool.unknownOutcome) {
    return <GenericToolCard tool={tool} value={value} />;
  }
  return null;
}

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
  renderArtifact?: (
    artifact: { id: string; name: string; mimeType: string; size: number },
    sourceRef?: SourceRef,
  ) => React.ReactNode;
  respond: (value: RunResponse) => Promise<void>;
  uploadFiles?: (files: File[]) => Promise<SourceRef[]>;
}) {
  const resolved = new Set(
    events.filter((e) => e.type === 'interaction.resolved').map((e) => e.payload.requestId),
  );
  const tools = getToolActivities(events);
  const [expanded, setExpanded] = useState(false);
  const [openTools, setOpenTools] = useState<Set<string>>(() => new Set());
  const settled = Boolean(status && !['starting', 'running'].includes(status));
  useEffect(() => {
    if (settled) {
      setExpanded(false);
      setOpenTools(new Set());
    }
  }, [settled]);
  const visibleTools = expanded ? tools : settled ? [] : tools.slice(-1);
  const requests = events.filter((e) => e.type === 'interaction.requested');
  const failure = runFailureDetails(events);
  const progress = [...events].reverse().find((e) => e.type === 'agent.status');
  const [showAllArtifacts, setShowAllArtifacts] = useState(false);
  const artifactMap = new Map<
    string,
    {
      artifact: { id: string; name: string; mimeType: string; size: number };
      sourceRef?: SourceRef;
    }
  >();
  for (const event of events) {
    if (!event.type.startsWith('artifact.')) continue;
    const payload = event.payload as unknown as {
      artifact?: { id?: string; name?: string; mimeType?: string; size?: number };
      sourceRef?: SourceRef;
    };
    const artifact = payload.artifact;
    if (!artifact?.id || !artifact.name) continue;
    const previous = artifactMap.get(artifact.id);
    artifactMap.set(artifact.id, {
      artifact: {
        ...previous?.artifact,
        ...artifact,
        id: artifact.id,
        name: artifact.name,
        mimeType: artifact.mimeType ?? previous?.artifact.mimeType ?? 'application/octet-stream',
        size: artifact.size ?? previous?.artifact.size ?? 0,
      },
      sourceRef: payload.sourceRef ?? previous?.sourceRef,
    });
  }
  const artifacts = Array.from(artifactMap.values());
  const visibleArtifacts = showAllArtifacts ? artifacts : artifacts.slice(0, 4);
  return (
    <div>
      {tools.length > 0 && (
        <section className='run-tool-group'>
          <button
            type='button'
            className='run-tool-group-summary'
            aria-expanded={expanded}
            onClick={() => setExpanded((value) => !value)}>
            <span>工具调用</span>
            <span className='run-tool-group-count'>{tools.length}</span>
          </button>
          {visibleTools.length > 0 && (
            <div className='run-tool-list'>
              {visibleTools.map((tool) => {
                const value = parseToolPreview(tool.preview);
                const result = asRecord(value);
                const executionFailed =
                  tool.toolId === 'execution.run' &&
                  ((typeof result?.exitCode === 'number' && result.exitCode !== 0) ||
                    (typeof result?.error === 'string' && Boolean(result.error)));
                const failed = tool.status === 'failed' || executionFailed;
                const stateLabel =
                  tool.status === 'running' ? '进行中' : failed ? '失败' : '已完成';
                return (
                  <details className='run-tool-card' key={tool.key} open={openTools.has(tool.key)}>
                    <summary
                      className='run-tool-card-summary'
                      onClick={(event) => {
                        event.preventDefault();
                        setOpenTools((current) => {
                          const next = new Set(current);
                          if (next.has(tool.key)) next.delete(tool.key);
                          else next.add(tool.key);
                          return next;
                        });
                      }}>
                      <span className='run-tool-kind-icon' aria-hidden='true'>
                        {toolIcon(tool.toolId)}
                      </span>
                      <span
                        className='run-tool-state-dot'
                        data-state={
                          tool.status === 'running' ? 'running' : failed ? 'failed' : 'done'
                        }
                        role='img'
                        aria-label={stateLabel}
                        title={stateLabel}
                      />
                      <span className='run-tool-title'>{toolLabel(tool)}</span>
                      <span className='run-tool-summary-text'>{toolSummary(tool, value)}</span>
                      {tool.unknownOutcome ? (
                        <span className='run-tool-uncertain-chip'>结果待确认</span>
                      ) : null}
                    </summary>
                    <div className='run-tool-card-body'>
                      <ToolActivityBody tool={tool} />
                    </div>
                  </details>
                );
              })}
            </div>
          )}
        </section>
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
      {artifacts.length > 0 ? (
        <section className='run-artifact-section' aria-label='交付文件'>
          <div className='run-artifact-heading'>交付文件</div>
          <div className='run-artifact-grid' data-count={artifacts.length}>
            {visibleArtifacts.map(({ artifact, sourceRef }) => (
              <div className='run-artifact-grid-item' key={artifact.id}>
                {renderArtifact?.(artifact, sourceRef) ?? (
                  <div className='run-artifact-fallback'>{artifact.name}</div>
                )}
              </div>
            ))}
          </div>
          {artifacts.length > 4 ? (
            <button
              className='run-artifact-toggle'
              onClick={() => setShowAllArtifacts((current) => !current)}
              type='button'>
              {showAllArtifacts ? '收起文件' : `显示其余 ${artifacts.length - 4} 个文件`}
            </button>
          ) : null}
        </section>
      ) : null}
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
