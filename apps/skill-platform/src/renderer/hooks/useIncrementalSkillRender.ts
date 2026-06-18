import { useEffect, useState } from 'react';

const LARGE_SKILL_LIST_THRESHOLD = 120;
const INITIAL_SKILL_RENDER_COUNT = 120;
const SKILL_RENDER_CHUNK_SIZE = 120;
const SKILL_RENDER_CHUNK_DELAY_MS = 24;

export function useIncrementalSkillRender(totalCount: number) {
  const [renderedCount, setRenderedCount] = useState(() =>
    totalCount <= LARGE_SKILL_LIST_THRESHOLD
      ? totalCount
      : Math.min(INITIAL_SKILL_RENDER_COUNT, totalCount),
  );

  useEffect(() => {
    const targetCount =
      totalCount <= LARGE_SKILL_LIST_THRESHOLD
        ? totalCount
        : Math.min(INITIAL_SKILL_RENDER_COUNT, totalCount);

    if (totalCount <= LARGE_SKILL_LIST_THRESHOLD) {
      if (renderedCount !== targetCount) {
        setRenderedCount(targetCount);
      }
      return;
    }

    let disposed = false;
    let timeoutId: number | undefined;

    if (renderedCount !== targetCount) {
      setRenderedCount(targetCount);
    }

    const scheduleNextChunk = () => {
      timeoutId = window.setTimeout(() => {
        if (disposed) {
          return;
        }

        setRenderedCount((current) => {
          const next = Math.min(current + SKILL_RENDER_CHUNK_SIZE, totalCount);
          if (next < totalCount) {
            scheduleNextChunk();
          }
          return next;
        });
      }, SKILL_RENDER_CHUNK_DELAY_MS);
    };

    if (INITIAL_SKILL_RENDER_COUNT < totalCount) {
      scheduleNextChunk();
    }

    return () => {
      disposed = true;
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [totalCount]);

  return {
    renderedCount,
    largeListThreshold: LARGE_SKILL_LIST_THRESHOLD,
    isChunkRendering: totalCount > LARGE_SKILL_LIST_THRESHOLD && renderedCount < totalCount,
  };
}

export const SKILL_GALLERY_STAGGER = {
  maxCards: 10,
  delayMs: 50,
} as const;
