import { validateTurn, type RunEvent } from '@momo/agent-contracts';
import { describe, expect, it } from 'vitest';
import {
  emptyProjection,
  reduceRunEvent,
} from '../../../../../packages/momo-aichat/src/runtime/projection';
import { runFailureDetails } from '../../../../../packages/momo-aichat/src/utils/run-failure';
const event = (
  seq: number,
  type: RunEvent['type'],
  payload: Record<string, unknown>,
): RunEvent => ({
  eventSchemaVersion: '1',
  eventId: String(seq),
  projectId: 'p',
  sessionId: 's',
  turnId: 't',
  runId: 'r',
  seq,
  timestamp: seq,
  type,
  payload,
});
describe('native event projection', () => {
  it('reconciles live revisions with authoritative commits without duplicating text', () => {
    let state = emptyProjection();
    for (const item of [
      event(1, 'assistant.start', { attemptId: 'a', revision: 0 }),
      event(2, 'thinking.delta', { attemptId: 'a', revision: 1, index: 0, text: 'think' }),
      event(3, 'assistant.delta', { attemptId: 'a', revision: 2, index: 1, text: 'partial' }),
      event(4, 'assistant.commit', { nativeSeq: 7, content: 'complete', thinking: 'thought' }),
      event(5, 'assistant.commit', { nativeSeq: 7, content: 'complete' }),
      event(6, 'run.completed', {}),
    ])
      state = reduceRunEvent(state, item);
    expect(state.content).toBe('complete');
    expect(state.thinking).toBe('thought');
    expect(state.status).toBe('completed');
    expect(reduceRunEvent(state, event(2, 'assistant.delta', { text: 'duplicate' }))).toBe(state);
  });
  it('keeps string command commits distinct from numeric native message commits', () => {
    const frames = [
      event(1, 'assistant.commit', { nativeSeq: 'cmd-1', content: 'Goal created' }),
      event(2, 'assistant.commit', { nativeSeq: 7, content: 'Goal done' }),
      event(3, 'assistant.commit', { nativeSeq: 'cmd-1', content: 'duplicate' }),
    ];
    expect(frames.reduce(reduceRunEvent, emptyProjection()).content).toBe(
      'Goal created\n\nGoal done',
    );
  });
  it('preserves native goal status and the explicit cleared state', () => {
    const goal = {
      id: 'goal',
      revision: 1,
      objective: 'task',
      phase: 'paused',
      activation: 'disarmed',
      roundsStarted: 1,
      maxGoalRounds: 256,
    };
    const state = reduceRunEvent(emptyProjection(), event(1, 'goal.updated', { goal }));
    expect(state.goal).toEqual(goal);
    expect(reduceRunEvent(state, event(2, 'goal.updated', { goal: null })).goal).toBeNull();
  });
  it('explains legacy output limits in Chinese and preserves confirmed tool results', () => {
    const frames = [
      event(1, 'tool.started', { callId: 'code' }),
      event(2, 'tool.completed', { callId: 'code' }),
      event(3, 'run.failed', { stopReason: 'max-tokens' }),
    ];
    const state = frames.reduce(reduceRunEvent, emptyProjection());
    expect(state.error).toContain('最大 Token 数');
    expect(state.error).not.toBe('max-tokens');
    expect(runFailureDetails(frames)).toMatchObject({
      uncertain: false,
      label: '答复尚未完成 · 工具结果已保存',
    });
    expect(
      runFailureDetails([frames[0], event(3, 'run.failed', { interrupted: true })]).uncertain,
    ).toBe(true);
    expect(
      runFailureDetails([event(1, 'tool.failed', { unknownOutcome: true }), frames[2]]).uncertain,
    ).toBe(true);
  });
  it('retains partial output and an unresolved question on interruption', () => {
    const frames = [
      event(1, 'assistant.start', { attemptId: 'a', revision: 0 }),
      event(2, 'assistant.delta', { attemptId: 'a', revision: 1, index: 0, text: 'partial' }),
      event(3, 'interaction.requested', { kind: 'question', requestId: 'q' }),
      event(4, 'run.failed', { message: 'interrupted' }),
    ];
    const state = frames.reduce(reduceRunEvent, emptyProjection());
    expect(state.content).toBe('partial');
    expect(state.status).toBe('failed');
    expect(state.error).toBe('interrupted');
    expect(state.events.some((e) => e.type === 'interaction.requested')).toBe(true);
  });
});
describe('host turn boundary', () => {
  const turn = () => ({
    sessionId: 's',
    projectId: 'p',
    turnId: 't',
    idempotencyKey: 'k',
    modelProfileId: 'm',
    agentId: 'a',
    modeId: 'ask',
    rawIntent: 'hello',
    displayInput: 'hello',
    folderPaths: [],
    sourceRefs: [],
    invocations: [],
  });
  it('rejects malformed nested resources before creating a run', () => {
    expect(() => validateTurn(turn())).not.toThrow();
    expect(() => validateTurn({ ...turn(), sourceRefs: [null] })).toThrow();
    expect(() => validateTurn({ ...turn(), invocations: [{ command: 5 }] })).toThrow();
    expect(() => validateTurn({ ...turn(), history: [{ role: 'tool', content: 'x' }] })).toThrow();
    expect(() => validateTurn({ ...turn(), sessionId: '', temperature: NaN })).toThrow();
    expect(() => validateTurn({ ...turn(), permissionMode: 'arbitrary' })).toThrow();
    expect(() => validateTurn({ ...turn(), command: 'shell' })).toThrow();
  });
});
