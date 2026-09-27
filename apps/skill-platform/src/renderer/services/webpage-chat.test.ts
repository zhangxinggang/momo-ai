import { expect, it } from 'vitest';
import { buildWebPagePrompt, WEB_PAGE_SUMMARY_PROMPT, webPageChatIdentity } from './webpage-chat';

it('keeps one stable isolated history per webpage, including path and query', () => {
  expect(webPageChatIdentity('https://example.com/a')).toEqual(
    webPageChatIdentity('https://example.com/a'),
  );
  expect(webPageChatIdentity('https://example.com/a').sessionId).not.toBe(
    webPageChatIdentity('https://example.com/b').sessionId,
  );
  expect(webPageChatIdentity('https://example.com/a?x=1').storageKeyPrefix).not.toBe(
    webPageChatIdentity('https://example.com/a?x=2').storageKeyPrefix,
  );
});

it('injects actual article content as quoted context and retains the requested default question', () => {
  expect(WEB_PAGE_SUMMARY_PROMPT).toBe(
    '请阅读网页内容，并为我提供一份简明扼要的总结。要求：\n1. 用1-2句话概括文章的核心主旨。\n2. 列出关键要点，每个要点不超过200字。',
  );
  const result = buildWebPagePrompt(
    {
      url: 'https://example.com',
      title: '标题',
      content: '网页正文，包含换行\n和"引号"',
      truncated: false,
    },
    WEB_PAGE_SUMMARY_PROMPT,
  );
  expect(result).toContain(
    JSON.stringify({
      url: 'https://example.com',
      title: '标题',
      content: '网页正文，包含换行\n和"引号"',
      truncated: false,
    }),
  );
  expect(result).toContain('用户问题：\n\n' + WEB_PAGE_SUMMARY_PROMPT);
  expect(() =>
    buildWebPagePrompt({ url: '', title: '', content: '', truncated: false }, '总结'),
  ).toThrow('没有可读取的正文');
});
