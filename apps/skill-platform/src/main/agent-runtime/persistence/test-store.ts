import type { Database } from 'better-sqlite3';
import { DatabaseSync } from 'node:sqlite';
import { AgentStore } from './store';
/** Exercise real SQLite SQL without an Electron ABI native addon in Node tests. */
export function testStore() {
  const db = new DatabaseSync(':memory:') as any;
  db.transaction = (fn: () => unknown) => () => {
    db.exec('SAVEPOINT test_tx');
    try {
      const result = fn();
      db.exec('RELEASE test_tx');
      return result;
    } catch (e) {
      db.exec('ROLLBACK TO test_tx');
      db.exec('RELEASE test_tx');
      throw e;
    }
  };
  const store = new AgentStore(db as Database);
  store.db
    .prepare('INSERT INTO agent_runs VALUES (?,?,?,?,?,?,?,?)')
    .run('run', 'session', 'project', 'turn', 'key', 'running', '{}', Date.now());
  return store;
}
