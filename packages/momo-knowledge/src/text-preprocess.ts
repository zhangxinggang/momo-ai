import type { ITextPreprocessRules } from './types';

const URL_PATTERN = /https?:\/\/[^\s]+/gi;
const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

/** 按规则预处理文本 */
export function preprocessText(text: string, rules: ITextPreprocessRules): string {
  let next = text;
  if (rules.normalizeWhitespace) {
    next = next
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/\t/g, ' ');
  }
  if (rules.removeUrlsAndEmails) {
    next = next.replace(URL_PATTERN, '').replace(EMAIL_PATTERN, '');
  }
  return next.trim();
}
