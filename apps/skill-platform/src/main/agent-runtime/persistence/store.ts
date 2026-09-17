import type { RunEvent, RunEventType } from '@momo/agent-contracts';
import type { Database } from 'better-sqlite3';
import { randomUUID } from 'node:crypto';
export class AgentStore {
  constructor(public readonly db: Database) {
    db.exec(`
      CREATE TABLE IF NOT EXISTS agent_kv(key TEXT PRIMARY KEY,value TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS agent_sessions(id TEXT PRIMARY KEY,project_id TEXT NOT NULL,bundle_id TEXT NOT NULL,native_id TEXT NOT NULL,agent_id TEXT NOT NULL,model_id TEXT NOT NULL,created_at INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS agent_runs(id TEXT PRIMARY KEY,session_id TEXT NOT NULL,project_id TEXT NOT NULL,turn_id TEXT NOT NULL,idempotency_key TEXT NOT NULL UNIQUE,status TEXT NOT NULL,input TEXT NOT NULL,created_at INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS agent_events(run_id TEXT NOT NULL,seq INTEGER NOT NULL,event TEXT NOT NULL,PRIMARY KEY(run_id,seq));
      CREATE TABLE IF NOT EXISTS agent_sources(id TEXT PRIMARY KEY,revision TEXT NOT NULL,metadata TEXT NOT NULL,blob_id TEXT NOT NULL,derived_text TEXT NOT NULL DEFAULT '');
      CREATE TABLE IF NOT EXISTS agent_contexts(id TEXT PRIMARY KEY,run_id TEXT NOT NULL,manifest TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS agent_grants(id TEXT PRIMARY KEY,project_id TEXT NOT NULL,tool_id TEXT NOT NULL,revision TEXT NOT NULL,target_hash TEXT NOT NULL,expires_at INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS agent_audit(id TEXT PRIMARY KEY,run_id TEXT NOT NULL,kind TEXT NOT NULL,payload TEXT NOT NULL,created_at INTEGER NOT NULL);
    `);
    // A killed runtime never becomes a successful turn on restart.
    const interrupted = db
      .prepare("SELECT id FROM agent_runs WHERE status IN ('running','starting','cancelling')")
      .all() as Array<{ id: string }>;
    for (const run of interrupted) {
      this.append(run.id, 'run.failed', {
        message: '应用重启中断了上一轮执行；已有输出保留，外部工具结果可能尚未确认',
        interrupted: true,
      });
      this.status(run.id, 'interrupted');
    }
  }
  get(key: string): string | null {
    return (
      (this.db.prepare('SELECT value FROM agent_kv WHERE key=?').get(key) as any)?.value ?? null
    );
  }
  set(key: string, value: string) {
    this.db.prepare('INSERT OR REPLACE INTO agent_kv VALUES (?,?)').run(key, value);
  }
  remove(key: string) {
    this.db.prepare('DELETE FROM agent_kv WHERE key=?').run(key);
  }
  session(id: string): any {
    return this.db.prepare('SELECT * FROM agent_sessions WHERE id=?').get(id);
  }
  run(id: string): any {
    return this.db.prepare('SELECT * FROM agent_runs WHERE id=?').get(id);
  }
  byKey(key: string): any {
    return this.db.prepare('SELECT * FROM agent_runs WHERE idempotency_key=?').get(key);
  }
  status(runId: string, status: string) {
    this.db.prepare('UPDATE agent_runs SET status=? WHERE id=?').run(status, runId);
  }
  events(runId: string, after = 0): RunEvent[] {
    return (
      this.db
        .prepare('SELECT event FROM agent_events WHERE run_id=? AND seq>? ORDER BY seq')
        .all(runId, after) as any[]
    ).map((row) => JSON.parse(row.event));
  }
  append(runId: string, type: RunEventType, payload: Record<string, unknown>): RunEvent {
    return this.db.transaction(() => {
      const run = this.run(runId);
      if (!run) throw new Error('UNKNOWN_RUN');
      const seq =
        ((
          this.db
            .prepare('SELECT MAX(seq) AS seq FROM agent_events WHERE run_id=?')
            .get(runId) as any
        ).seq ?? 0) + 1;
      const event: RunEvent = {
        eventSchemaVersion: '1',
        eventId: randomUUID(),
        projectId: run.project_id,
        sessionId: run.session_id,
        turnId: run.turn_id,
        runId,
        seq,
        timestamp: Date.now(),
        type,
        payload,
      };
      this.db
        .prepare('INSERT INTO agent_events VALUES (?,?,?)')
        .run(runId, seq, JSON.stringify(event));
      return event;
    })();
  }
  audit(runId: string, kind: string, payload: unknown) {
    this.db
      .prepare('INSERT INTO agent_audit VALUES (?,?,?,?,?)')
      .run(randomUUID(), runId, kind, JSON.stringify(payload), Date.now());
  }
}
