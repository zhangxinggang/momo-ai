import { lazy, Suspense, useEffect, useState, type ReactNode } from 'react';

import { ChatManager } from '@renderer/components/Chat';
import { ToolboxManager } from '@renderer/components/Toolbox';
import { CenteredLoading } from '@renderer/components/ui/CenteredLoading';
import { useUIStore } from '@renderer/store';

const SkillManager = lazy(() =>
  import('@renderer/components/Skill/SkillManager').then((m) => ({ default: m.SkillManager })),
);

const NoteManager = lazy(() =>
  import('@renderer/components/Note/NoteManager').then((m) => ({ default: m.NoteManager })),
);

const KnowledgeManager = lazy(() =>
  import('@renderer/components/Knowledge/KnowledgeManager').then((m) => ({
    default: m.KnowledgeManager,
  })),
);

function ModuleShell({ children, active }: { children: ReactNode; active: boolean }) {
  return (
    <div
      className={active ? 'absolute inset-0 flex min-h-0 flex-col overflow-hidden' : 'hidden'}
      aria-hidden={!active}>
      {children}
    </div>
  );
}

export function MainContent({ active = true }: { active?: boolean }) {
  const uiViewMode = useUIStore((state) => state.viewMode);
  const [visited, setVisited] = useState(() => new Set([uiViewMode]));
  useEffect(() => {
    setVisited((previous) =>
      previous.has(uiViewMode) ? previous : new Set([...previous, uiViewMode]),
    );
  }, [uiViewMode]);
  const mounted = (mode: typeof uiViewMode) => mode === uiViewMode || visited.has(mode);

  return (
    <main className='app-wallpaper-section relative flex-1 overflow-hidden'>
      <div
        className={
          uiViewMode === 'chat'
            ? 'bg-background absolute inset-0 flex min-h-0 flex-col overflow-hidden'
            : 'hidden'
        }
        aria-hidden={uiViewMode !== 'chat'}>
        <ChatManager visible={active && uiViewMode === 'chat'} />
      </div>
      {mounted('skill') ? (
        <ModuleShell active={uiViewMode === 'skill'}>
          <Suspense fallback={<CenteredLoading />}>
            <SkillManager />
          </Suspense>
        </ModuleShell>
      ) : null}
      {mounted('kb') ? (
        <ModuleShell active={uiViewMode === 'kb'}>
          <Suspense fallback={<CenteredLoading />}>
            <KnowledgeManager />
          </Suspense>
        </ModuleShell>
      ) : null}
      {mounted('toolbox') ? (
        <ModuleShell active={uiViewMode === 'toolbox'}>
          <ToolboxManager />
        </ModuleShell>
      ) : null}
      {mounted('note') ? (
        <ModuleShell active={uiViewMode === 'note'}>
          <Suspense fallback={<CenteredLoading />}>
            <NoteManager />
          </Suspense>
        </ModuleShell>
      ) : null}
    </main>
  );
}
