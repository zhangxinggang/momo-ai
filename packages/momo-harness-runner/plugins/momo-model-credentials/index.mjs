import { CredentialProvider } from '@deepseek-ai/dsh-credentials';
export const name = 'momo-model-credentials';
class MemoryCredentials extends CredentialProvider {
  values = new Map(); records = new Map(); queue = Promise.resolve();
  async resolve(ref) { const value = this.values.get(ref); return value ? { value, source: 'momo-host' } : undefined; }
  async describe(ref) { return { configured: this.values.has(ref), source: 'momo-host', writable: true }; }
  async set(ref, value) { if (!value || !/^MOMO_KEY_[A-Za-z0-9_]+$/.test(ref)) throw Error('Invalid private credential'); this.values.set(ref, value); }
  async unset(ref) { this.values.delete(ref); }
  async readRecord(key) { return this.records.get(key); }
  async describeRecord(key) { const value = this.records.get(key); return { configured: Boolean(value), kind: value?.kind, writable: true }; }
  async listRecords() { return [...this.records].map(([key, value]) => ({ key, kind: value.kind })); }
  async modifyRecord(key, mutate) {
    let result; const work = this.queue.then(async () => { const next = await mutate(this.records.get(key)); if (next !== undefined) this.records.set(key, next); result = this.records.get(key); });
    this.queue = work.catch(() => {}); await work; return result;
  }
  async removeRecord(key) { this.records.delete(key); }
}
export function apply(ctx) { const credentials = new MemoryCredentials(ctx); ctx.effect(() => () => { credentials.values.clear(); credentials.records.clear(); }, 'momo.credentials'); }
