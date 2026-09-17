import type { RunEvent, RuntimeGoal } from '@momo/agent-contracts';
import type { IChatContextUsage } from '../types/chat';
import { parseContextUsage } from '../utils/context-usage';
import { runFailureMessage } from '../utils/run-failure';
export interface RunProjection {
  runId?: string;
  afterSeq: number;
  content: string;
  thinking: string;
  committedContent: string;
  committedThinking: string;
  provisionalContent: string;
  provisionalThinking: string;
  attemptId?: string;
  revision?: number;
  indexes: number[];
  committedSeqs: Array<number | string>;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  events: RunEvent[];
  citations: any[];
  usage?: Record<string, unknown>;
  error?: string;
  contextUsage?: IChatContextUsage;
  goal?: RuntimeGoal | null;
}
export function emptyProjection(): RunProjection {
  return {
    afterSeq: 0,
    content: '',
    thinking: '',
    committedContent: '',
    committedThinking: '',
    provisionalContent: '',
    provisionalThinking: '',
    indexes: [],
    committedSeqs: [],
    status: 'running',
    events: [],
    citations: [],
  };
}
export function reduceRunEvent(state: RunProjection, event: RunEvent): RunProjection {
  if (event.seq <= state.afterSeq || (state.runId && event.runId !== state.runId)) return state;
  const s = { ...state, runId: event.runId, afterSeq: event.seq },
    p = event.payload;
  if (event.type === 'assistant.start') {
    s.attemptId = String(p.attemptId);
    s.revision = Number(p.revision);
    s.provisionalContent = '';
    s.provisionalThinking = '';
    s.indexes = [];
  }
  if (event.type === 'assistant.delta' || event.type === 'thinking.delta') {
    if (
      s.attemptId !== p.attemptId ||
      Number(p.revision) < Number(s.revision) ||
      s.indexes.includes(Number(p.index))
    )
      return s;
    s.revision = Number(p.revision);
    s.indexes = [...s.indexes, Number(p.index)];
    if (event.type === 'assistant.delta') s.provisionalContent += String(p.text ?? '');
    else s.provisionalThinking += String(p.text ?? '');
  }
  if (
    event.type === 'assistant.commit' &&
    !s.committedSeqs.includes(p.nativeSeq as number | string)
  ) {
    s.committedSeqs = [...s.committedSeqs, p.nativeSeq as number | string];
    s.committedContent += (s.committedContent && p.content ? '\n\n' : '') + String(p.content ?? '');
    s.committedThinking +=
      (s.committedThinking && p.thinking ? '\n\n' : '') + String(p.thinking ?? '');
    s.provisionalContent = '';
    s.provisionalThinking = '';
  }
  if (event.type === 'evidence.added') {
    const all = [...s.citations, ...(Array.isArray(p.citations) ? p.citations : [])];
    s.citations = [
      ...new Map(
        all.map((c) => [c.collectionId + ':' + c.chunkId + ':' + c.revisionId, c]),
      ).values(),
    ];
  }
  if (event.type === 'usage.updated') s.usage = p;
  if (event.type === 'context.updated') s.contextUsage = parseContextUsage(p) ?? s.contextUsage;
  if (event.type === 'goal.updated') s.goal = (p.goal ?? null) as RuntimeGoal | null;
  if (event.type === 'run.completed') s.status = 'completed';
  if (event.type === 'run.cancelled') s.status = 'cancelled';
  if (event.type === 'run.failed') {
    s.status = 'failed';
    s.error = runFailureMessage(p);
  }
  if (!['assistant.delta', 'thinking.delta', 'runtime.event'].includes(event.type))
    s.events = [...s.events, event].slice(-1000);
  s.content =
    s.committedContent +
    (s.committedContent && s.provisionalContent ? '\n\n' : '') +
    s.provisionalContent;
  s.thinking = s.committedThinking + s.provisionalThinking;
  return s;
}
