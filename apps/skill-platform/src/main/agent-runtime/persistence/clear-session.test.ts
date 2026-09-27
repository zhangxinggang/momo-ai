import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { testStore } from './test-store';

describe('clear conversation context', () => {
  let store: ReturnType<typeof testStore>;
  beforeEach(() => {
    store = testStore();
    store.status('run', 'completed');
    store.db
      .prepare('INSERT INTO agent_sessions VALUES (?,?,?,?,?,?,?)')
      .run('session', 'project', 'bundle', 'native-old', 'agent', 'model', 1);
    store.db
      .prepare('INSERT INTO agent_runs VALUES (?,?,?,?,?,?,?,?)')
      .run(
        'other-run',
        'other-session',
        'project',
        'other-turn',
        'other-key',
        'completed',
        '{}',
        1,
      );
    store.append('run', 'assistant.commit', { content: 'old answer' });
    store.append('other-run', 'assistant.commit', { content: 'other answer' });
    store.db
      .prepare('INSERT INTO agent_contexts VALUES (?,?,?)')
      .run('context', 'run', '{"notes":["old"]}');
    store.audit('run', 'old', { content: 'old data' });
    store.set('native-ready:session', 'true');
    store.set('uploaded-files:session', '[{"name":"old.txt"}]');
    store.set('permission:session', 'read-only');
    store.set('kb-scope:run', '["collection"]');
    store.set('kb-count:run', '1');
  });
  afterEach(() => store.db.close());

  it('purges durable records and attachment context while preserving bindings and other conversations', () => {
    store.clearSession('session');
    expect(store.session('session')).toMatchObject({
      id: 'session',
      project_id: 'project',
      bundle_id: 'bundle',
      agent_id: 'agent',
      model_id: 'model',
      created_at: 1,
    });
    expect(store.session('session').native_id).not.toBe('native-old');
    expect(store.run('run')).toBeUndefined();
    for (const table of ['agent_events', 'agent_contexts', 'agent_audit']) {
      expect(store.db.prepare(`SELECT * FROM ${table} WHERE run_id=?`).all('run')).toEqual([]);
    }
    for (const key of [
      'native-ready:session',
      'uploaded-files:session',
      'kb-scope:run',
      'kb-count:run',
    ])
      expect(store.get(key)).toBeNull();
    expect(store.get('permission:session')).toBe('read-only');
    expect(store.run('other-run')).toBeDefined();
    expect(store.events('other-run')[0].payload.content).toBe('other answer');
  });

  it.each(['starting', 'running', 'cancelling'])(
    'refuses a %s run without partially deleting data',
    (status) => {
      store.status('run', status);
      expect(() => store.clearSession('session')).toThrow('当前会话正在生成');
      expect(store.session('session').native_id).toBe('native-old');
      expect(store.events('run')).toHaveLength(1);
      expect(store.get('native-ready:session')).toBe('true');
    },
  );

  it('is safe for a renderer-only conversation without a native binding', () => {
    store.clearSession('unbound');
    expect(store.session('unbound')).toBeUndefined();
    expect(store.events('run')).toHaveLength(1);
  });
});
