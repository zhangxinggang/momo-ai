import a11yDark from 'highlight.js/styles/a11y-dark.min.css?url';
import a11yLight from 'highlight.js/styles/a11y-light.min.css?url';
import atomDark from 'highlight.js/styles/atom-one-dark.min.css?url';
import atomLight from 'highlight.js/styles/atom-one-light.min.css?url';
import githubDark from 'highlight.js/styles/github-dark.min.css?url';
import githubLight from 'highlight.js/styles/github.min.css?url';
import gradientDark from 'highlight.js/styles/gradient-dark.min.css?url';
import gradientLight from 'highlight.js/styles/gradient-light.min.css?url';
import kimbieDark from 'highlight.js/styles/kimbie-dark.min.css?url';
import kimbieLight from 'highlight.js/styles/kimbie-light.min.css?url';
import paraisoDark from 'highlight.js/styles/paraiso-dark.min.css?url';
import paraisoLight from 'highlight.js/styles/paraiso-light.min.css?url';
import qtcreatorDark from 'highlight.js/styles/qtcreator-dark.min.css?url';
import qtcreatorLight from 'highlight.js/styles/qtcreator-light.min.css?url';
import stackoverflowDark from 'highlight.js/styles/stackoverflow-dark.min.css?url';
import stackoverflowLight from 'highlight.js/styles/stackoverflow-light.min.css?url';
import type { ICodeCss } from './type';

export const localCodeCss: ICodeCss = {
  a11y: { light: a11yLight, dark: a11yDark },
  atom: { light: atomLight, dark: atomDark },
  github: { light: githubLight, dark: githubDark },
  gradient: { light: gradientLight, dark: gradientDark },
  kimbie: { light: kimbieLight, dark: kimbieDark },
  paraiso: { light: paraisoLight, dark: paraisoDark },
  qtcreator: { light: qtcreatorLight, dark: qtcreatorDark },
  stackoverflow: { light: stackoverflowLight, dark: stackoverflowDark },
};
