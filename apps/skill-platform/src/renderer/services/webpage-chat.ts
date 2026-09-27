import { getBuiltinSkillPrompt } from '@/shared/builtin-skills';
import type { IWebPageContext } from '@/types/modules/webpage';
import { v5 } from 'uuid';

export function webPageChatIdentity(url: string) {
  const id = `webpage-${v5(url, v5.URL)}`;
  return { sessionId: id, storageKeyPrefix: `momo-${id}` };
}

export function buildWebPagePrompt(page: IWebPageContext, question: string): string {
  if (!page.content.trim()) throw new Error('当前网页没有可读取的正文');
  return [
    getBuiltinSkillPrompt('webpageAnswer'),
    JSON.stringify({
      url: page.url,
      title: page.title,
      content: page.content,
      truncated: page.truncated,
    }),
    '用户问题：',
    question,
  ].join('\n\n');
}

export const WEB_PAGE_SUMMARY_PROMPT = getBuiltinSkillPrompt('webpageSummary');

export function getWebPageSummaryPrompt(): string {
  return getBuiltinSkillPrompt('webpageSummary');
}
