import { lazy, Suspense, type ReactNode } from 'react';

import { AiNewsManager } from '@renderer/components/AiNews';
import { ChatManager } from '@renderer/components/Chat';
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

const PromptManager = lazy(() =>
  import('@renderer/components/Prompt/PromptManager').then((m) => ({ default: m.PromptManager })),
);

const WorkflowManager = lazy(() =>
  import('@renderer/components/Workflow/WorkflowManager').then((m) => ({
    default: m.WorkflowManager,
  })),
);

function ModuleShell({ children }: { children: ReactNode }) {
  return <div className='absolute inset-0 flex min-h-0 flex-col overflow-hidden'>{children}</div>;
}

export function MainContent() {
  const uiViewMode = useUIStore((state) => state.viewMode);

  return (
    <main className='app-wallpaper-section relative flex-1 overflow-hidden'>
      {uiViewMode === 'skill' ? (
        <ModuleShell>
          <Suspense fallback={<CenteredLoading />}>
            <SkillManager />
          </Suspense>
        </ModuleShell>
      ) : uiViewMode === 'kb' ? (
        <ModuleShell>
          <Suspense fallback={<CenteredLoading />}>
            <KnowledgeManager />
          </Suspense>
        </ModuleShell>
      ) : uiViewMode === 'chat' ? (
        <div className='bg-background absolute inset-0 flex min-h-0 flex-col overflow-hidden'>
          <ChatManager />
        </div>
      ) : uiViewMode === 'news' ? (
        <div className='bg-background absolute inset-0 flex min-h-0 flex-col overflow-hidden'>
          <AiNewsManager />
        </div>
      ) : uiViewMode === 'note' ? (
        <ModuleShell>
          <Suspense fallback={<CenteredLoading />}>
            <NoteManager />
          </Suspense>
        </ModuleShell>
      ) : uiViewMode === 'workflow' ? (
        <ModuleShell>
          <Suspense fallback={<CenteredLoading />}>
            <WorkflowManager />
          </Suspense>
        </ModuleShell>
      ) : (
        <ModuleShell>
          <Suspense fallback={<CenteredLoading />}>
            <PromptManager />
          </Suspense>
        </ModuleShell>
      )}
    </main>
  );
}
