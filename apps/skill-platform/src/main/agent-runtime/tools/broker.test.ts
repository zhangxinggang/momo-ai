import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { testStore } from '../persistence/test-store';
import { ToolBroker, type BrokerContext, type HostTool } from './broker';

const createTool = (overrides: Partial<HostTool> = {}): HostTool => ({
  id: 'system.read',
  name: 'system_read',
  title: 'Read system data',
  description: 'A built-in host tool used by the agent runtime.',
  revision: '1',
  inputSchema: {
    type: 'object',
    properties: { value: { type: 'string' } },
    required: ['value'],
    additionalProperties: false,
  },
  effects: ['read'],
  timeoutMs: 1000,
  parallelSafe: true,
  idempotent: true,
  execute: vi.fn(async ({ value }) => ({ value })),
  ...overrides,
});

describe('host tool broker', () => {
  let store: ReturnType<typeof testStore>;
  let broker: ToolBroker;
  let context: BrokerContext;

  beforeEach(() => {
    store = testStore();
    broker = new ToolBroker(store);
    context = {
      runId: 'run',
      projectId: 'project',
      modeId: 'ask',
      roots: [],
      signal: new AbortController().signal,
      emit: vi.fn(),
      askApproval: vi.fn().mockResolvedValue({ decision: 'allowed-once' }),
    };
  });

  afterEach(() => store.db.close());

  it('executes registered built-in tools and records lifecycle events', async () => {
    const tool = createTool();
    broker.register('run', [tool]);

    await expect(broker.execute(tool.name, { value: 'ok' }, 'call', context)).resolves.toEqual({
      value: 'ok',
    });
    expect(context.askApproval).not.toHaveBeenCalled();
    expect(context.emit).toHaveBeenCalledTimes(2);
  });

  it('validates arguments before execution', async () => {
    const tool = createTool();
    broker.register('run', [tool]);

    await expect(broker.execute(tool.name, { value: 1 }, 'call', context)).rejects.toThrow(
      'Schema',
    );
    expect(tool.execute).not.toHaveBeenCalled();
  });

  it('asks before a network operation and honours rejection', async () => {
    const tool = createTool({
      id: 'system.request',
      name: 'system_request',
      effects: ['network'],
    });
    broker.register('run', [tool]);
    context.askApproval = vi.fn().mockResolvedValue({ decision: 'rejected' });

    await expect(broker.execute(tool.name, { value: 'ok' }, 'call', context)).rejects.toThrow();
    expect(tool.execute).not.toHaveBeenCalled();
  });

  it('revokes a side-effect authorization when permissions become read-only', async () => {
    const tool = createTool({
      id: 'system.request',
      name: 'system_request',
      effects: ['network'],
    });
    let permission: BrokerContext['permissionMode'] = 'danger-full-access';
    const live = { ...context, getPermissionMode: () => permission! };
    broker.register('run', [tool]);

    await broker.authorize(tool.name, { value: 'ok' }, 'call', live);
    permission = 'read-only';

    await expect(broker.execute(tool.name, { value: 'ok' }, 'call', live)).rejects.toThrow();
    expect(tool.execute).not.toHaveBeenCalled();
  });
});
