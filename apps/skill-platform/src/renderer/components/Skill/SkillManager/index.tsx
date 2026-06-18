import { CenteredLoading } from '@renderer/components/ui/CenteredLoading';
import { useSyncDefaultOnlineStoreSource } from '@renderer/hooks/useOnlineStoreSources';
import { useSkillStore } from '@renderer/store';
import { lazy, Suspense, useEffect } from 'react';
import { SkillLibraryView } from '../SkillLibraryView';
import { SkillRenderBoundary } from '../SkillRenderBoundary';

const SkillFullDetailPage = lazy(() =>
  import('@renderer/components/Skill/SkillFullDetailPage').then((m) => ({
    default: m.SkillFullDetailPage,
  })),
);
const SkillStore = lazy(() =>
  import('@renderer/components/Skill/SkillStore').then((m) => ({ default: m.SkillStore })),
);
const SkillProjectsView = lazy(() =>
  import('@renderer/components/Skill/SkillProjectsView').then((m) => ({
    default: m.SkillProjectsView,
  })),
);

export function SkillManager() {
  useSyncDefaultOnlineStoreSource();
  const selectedSkillId = useSkillStore((state) => state.selectedSkillId);
  const selectSkill = useSkillStore((state) => state.selectSkill);
  const storeView = useSkillStore((state) => state.storeView);
  const loadSkills = useSkillStore((state) => state.loadSkills);
  const loadDeployedStatus = useSkillStore((state) => state.loadDeployedStatus);

  useEffect(() => {
    useSkillStore.getState().selectSkill(null);
  }, []);

  useEffect(() => {
    let disposed = false;
    let idleId: number | undefined;
    let timeoutId: number | undefined;
    const browserWindow = window as Window & {
      requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
      cancelIdleCallback?: (handle: number) => void;
    };

    void loadSkills().then(() => {
      if (disposed) return;

      const run = () => {
        if (!disposed) {
          void loadDeployedStatus();
        }
      };

      if (typeof browserWindow.requestIdleCallback === 'function') {
        idleId = browserWindow.requestIdleCallback(run, { timeout: 800 });
      } else {
        timeoutId = window.setTimeout(run, 80);
      }
    });

    return () => {
      disposed = true;
      if (idleId !== undefined && typeof browserWindow.cancelIdleCallback === 'function') {
        browserWindow.cancelIdleCallback(idleId);
      }
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [loadSkills, loadDeployedStatus]);

  if (storeView === 'store') {
    return (
      <div className='relative h-full min-h-0 flex-1'>
        <Suspense fallback={<CenteredLoading label='加载中…' />}>
          <SkillStore />
        </Suspense>
      </div>
    );
  }

  if (storeView === 'projects') {
    return (
      <div className='relative h-full min-h-0 flex-1'>
        <Suspense fallback={<CenteredLoading label='加载中…' />}>
          <SkillProjectsView />
        </Suspense>
      </div>
    );
  }

  if (selectedSkillId) {
    return (
      <div className='relative h-full min-h-0 flex-1'>
        <Suspense fallback={<CenteredLoading label='加载中…' />}>
          <SkillRenderBoundary
            resetKey={selectedSkillId}
            title={'当前无法打开这个技能'}
            description={'渲染错误已被隔离，页面仍可继续使用。你可以返回列表，或立即重试加载详情。'}
            primaryActionLabel={'返回'}
            onPrimaryAction={() => selectSkill(null)}
            secondaryActionLabel={'重试'}
            onSecondaryAction={() => {
              void loadSkills().then(() => loadDeployedStatus());
            }}>
            <SkillFullDetailPage />
          </SkillRenderBoundary>
        </Suspense>
      </div>
    );
  }

  return <SkillLibraryView />;
}
