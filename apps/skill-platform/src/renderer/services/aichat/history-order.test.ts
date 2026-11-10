import type { IChatSession } from '@momo/aichat';
import { expect, it } from 'vitest';
import { orderChatHistory, planChatHistoryDrop } from './history-order';

const sessions = [
  { id: 'a', projectId: 'p', updatedAt: 30 },
  { id: 'hidden', projectId: 'p', updatedAt: 20 },
  { id: 'b', projectId: 'p', updatedAt: 10 },
  { id: 'other', projectId: 'q', updatedAt: 40 },
] as IChatSession[];

it('keeps pinned history first and restores manual order independently of activity', () => {
  const project = sessions.filter((session) => session.projectId === 'p');
  expect(orderChatHistory(project).map((session) => session.id)).toEqual(['a', 'hidden', 'b']);
  expect(
    orderChatHistory(project, ['b', 'hidden', 'a'], ['a']).map((session) => session.id),
  ).toEqual(['a', 'b', 'hidden']);
  expect(orderChatHistory(project, ['b', 'hidden', 'a']).map((session) => session.id)).toEqual([
    'b',
    'hidden',
    'a',
  ]);
  expect(
    orderChatHistory(
      [...project, { id: 'new', updatedAt: 50 } as IChatSession],
      ['b', 'hidden', 'a'],
    ).map((session) => session.id),
  ).toEqual(['b', 'hidden', 'a', 'new']);
});

it('reorders the full project during search and rejects cross-project or cross-pin drops', () => {
  expect(planChatHistoryDrop(sessions, {}, [], 'b', 'a', false)).toEqual({
    projectId: 'p',
    ids: ['b', 'a', 'hidden'],
  });
  expect(planChatHistoryDrop(sessions, {}, [], 'a', 'other', true)).toBeNull();
  expect(planChatHistoryDrop(sessions, {}, ['a'], 'b', 'a', false)).toBeNull();
  expect(planChatHistoryDrop(sessions, {}, ['a', 'b'], 'b', 'a', false)?.ids).toEqual([
    'b',
    'a',
    'hidden',
  ]);
  expect(planChatHistoryDrop(sessions, {}, [], 'a', 'a', true)).toBeNull();
  expect(planChatHistoryDrop(sessions, {}, [], 'missing', 'a', true)).toBeNull();
});
