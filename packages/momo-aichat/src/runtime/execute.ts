import type { ChatRuntimePort, RunEvent, RuntimeTurnInput } from '@momo/agent-contracts';
import { emptyProjection, reduceRunEvent, type RunProjection } from './projection';
/** Register before start, replay after receipt, then poll the durable cursor to heal lost IPC frames. */
export async function executeRuntimeTurn(
  port: ChatRuntimePort,
  input: RuntimeTurnInput,
  signal: AbortSignal,
  onProjection: (state: RunProjection) => void,
) {
  let state = emptyProjection(),
    runId: string | undefined,
    settled = false;
  const early: RunEvent[] = [];
  const buffered = new Map<number, RunEvent>();
  let resolveDone!: () => void;
  const done = new Promise<void>((resolve) => {
    resolveDone = resolve;
  });
  function accept(event: RunEvent) {
    if (!runId) {
      if (event.sessionId === input.sessionId && event.turnId === input.turnId) early.push(event);
      return;
    }
    if (event.runId !== runId || settled) return;
    buffered.set(event.seq, event);
    while (buffered.has(state.afterSeq + 1)) {
      const next = buffered.get(state.afterSeq + 1)!;
      buffered.delete(state.afterSeq + 1);
      state = reduceRunEvent(state, next);
      onProjection(state);
    }
    if (state.status !== 'running') {
      settled = true;
      resolveDone();
    }
  }
  const off = port.onEvent(accept);
  const abort = () => {
    void port
      .cancel({
        runId,
        sessionId: input.sessionId,
        idempotencyKey: input.idempotencyKey,
        reason: 'user',
      })
      .catch((error) => {
        if (!runId) return;
        state = { ...state, status: 'failed', error: '无法确认停止：' + error.message };
        onProjection(state);
        settled = true;
        resolveDone();
      });
  };
  signal.addEventListener('abort', abort, { once: true });
  let poll: ReturnType<typeof setInterval> | undefined;
  try {
    const result = await port.startTurn(input);
    runId = result.runId;
    for (const event of early.sort((a, b) => a.seq - b.seq)) accept(event);
    for (const event of await port.events(runId, state.afterSeq)) accept(event);
    if (signal.aborted) abort();
    let polling = false;
    poll = setInterval(() => {
      if (settled || polling) return;
      polling = true;
      void port
        .events(runId!, state.afterSeq)
        .then(
          (events) => events.forEach(accept),
          (error) => {
            state = { ...state, status: 'failed', error: error.message };
            onProjection(state);
            settled = true;
            resolveDone();
          },
        )
        .finally(() => {
          polling = false;
        });
    }, 1500);
    await done;
    return state;
  } finally {
    if (poll) clearInterval(poll);
    off();
    signal.removeEventListener('abort', abort);
  }
}
