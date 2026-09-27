import type { WorkspaceFileReview } from '@momo/agent-contracts';

interface Draft {
  runId: string;
  review: WorkspaceFileReview;
  content: string;
}
const drafts = new Map<string, Draft>();
const key = (runId: string, path: string) => runId + '\0' + path;
export function getReviewDraft(runId: string, path: string) {
  return drafts.get(key(runId, path));
}
export function discardReviewDraft(runId: string, path: string) {
  drafts.delete(key(runId, path));
}
export function setReviewDraft(runId: string, review: WorkspaceFileReview, content: string) {
  const id = key(runId, review.path);
  if (content === review.current) drafts.delete(id);
  else drafts.set(id, { runId, review, content });
}
let saving: Promise<void> | undefined;
export function hasReviewDrafts() {
  return drafts.size > 0 || Boolean(saving);
}
/** Flush drafts before undo and the next question so manual corrections are protected. */
export async function flushReviewDrafts() {
  if (saving) {
    await saving;
    return flushReviewDrafts();
  }
  saving = (async () => {
    while (drafts.size > 0)
      for (const [id, draft] of [...drafts]) {
        const result = await window.api.agentRuntime.correctChange(
          draft.runId,
          draft.review.path,
          draft.content,
          draft.review.revision,
        );
        if (drafts.get(id) === draft) drafts.delete(id);
        else {
          const newer = drafts.get(id);
          if (newer) newer.review = result;
        }
      }
  })();
  try {
    await saving;
  } finally {
    saving = undefined;
  }
}
