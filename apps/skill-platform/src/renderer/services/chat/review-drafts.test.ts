import { afterEach, expect, it, vi } from 'vitest';
import {
  flushReviewDrafts,
  getReviewDraft,
  hasReviewDrafts,
  setReviewDraft,
} from './review-drafts';

const review = {
  path: '/work/a.ts',
  before: '1',
  current: '2',
  revision: 'original',
  currentExists: true,
};
const correct = vi.fn(async (_run: string, path: string, content: string) => ({
  ...review,
  path,
  current: content,
  revision: 'saved',
}));
(globalThis as any).window = { api: { agentRuntime: { correctChange: correct } } };
afterEach(async () => {
  correct.mockImplementation(async (_run, path, content) => ({
    ...review,
    path,
    current: content,
    revision: 'saved',
  }));
  await flushReviewDrafts();
  vi.clearAllMocks();
});
it('keeps unsaved corrections across panel unmounts and flushes before continuing', async () => {
  setReviewDraft('run', review, '42');
  expect(hasReviewDrafts()).toBe(true);
  expect(getReviewDraft('run', review.path)?.content).toBe('42');
  await flushReviewDrafts();
  expect(correct).toHaveBeenCalledWith('run', review.path, '42', 'original');
  expect(hasReviewDrafts()).toBe(false);
});
it('retains a stale draft if saving fails, so the next turn cannot silently discard it', async () => {
  setReviewDraft('run', review, 'mine');
  correct.mockRejectedValueOnce(new Error('file changed'));
  await expect(flushReviewDrafts()).rejects.toThrow('file changed');
  expect(getReviewDraft('run', review.path)?.content).toBe('mine');
});
