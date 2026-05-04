import { StrictMode, useEffect, useState } from 'react';
import Header from './Header';
import Preview from './Preview';
import PreviewOnly from './PreviewOnly';
import SecEditor from './SecEditor';
import StreamDemo from './StreamDemo';
import './style.less';

export type Theme = 'dark' | 'light';

function App() {
  const [theme, setTheme] = useState<Theme>('light');
  const [previewTheme, setPreviewTheme] = useState<string>('default');
  const [codeTheme, setCodeTheme] = useState<string>('atom');
  const [lang, setLang] = useState<'zh-CN' | 'en-US'>('zh-CN');

  useEffect(() => {
    document.body.setAttribute('class', theme === 'dark' ? 'theme-dark' : 'theme-light');
  }, [theme]);

  return (
    <StrictMode>
      <div className={'app'}>
        <Header
          theme={theme}
          onChange={setTheme}
          onPreviewChange={setPreviewTheme}
          onCodeThemeChange={setCodeTheme}
          onLangChange={setLang}
        />
        <div className='page-body'>
          <Preview lang={lang} theme={theme} previewTheme={previewTheme} codeTheme={codeTheme} />
          <SecEditor />
          <StreamDemo theme={theme} previewTheme={previewTheme} codeTheme={codeTheme} lang={lang} />
          <PreviewOnly
            lang={lang}
            theme={theme}
            previewTheme={previewTheme}
            codeTheme={codeTheme}
          />
        </div>
      </div>
    </StrictMode>
  );
}

export default App;
