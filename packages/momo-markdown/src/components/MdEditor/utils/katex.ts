import { globalConfig } from '~/config';

/** Keep preview and rich-text formulas consistent while allowing Unicode text labels. */
const emojiPattern = /\p{Extended_Pictographic}|\p{Regional_Indicator}|\u20e3/u;
const emojiTokenPattern =
  /\p{Extended_Pictographic}|\p{Regional_Indicator}|\p{Emoji_Modifier}|[\u200d\ufe0e\ufe0f\u20e3]/u;

export const getKatexOptions = (displayMode: boolean, source = '') =>
  globalConfig.katexConfig({
    throwOnError: false,
    displayMode,
    // Native MathML uses system fonts for emoji; KaTeX's HTML fonts have no emoji metrics.
    output: emojiPattern.test(source) ? 'mathml' : 'htmlAndMathml',
    strict: (errorCode: string, _message: string, token?: { text?: string }) =>
      errorCode === 'unicodeTextInMathMode' ||
      (errorCode === 'unknownSymbol' && emojiTokenPattern.test(token?.text || ''))
        ? 'ignore'
        : 'warn',
  });
