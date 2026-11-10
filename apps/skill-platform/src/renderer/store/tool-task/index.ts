import { emptyProjection } from '@momo/aichat';
import type { IToolTaskSnapshot } from '@renderer/services/custom-tool/tool-task';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface IState {
  tasks: Record<string, IToolTaskSnapshot>;
  setTask: (key: string, snapshot: IToolTaskSnapshot) => void;
}
export const useToolTaskStore = create<IState>()(
  persist(
    (set) => ({
      tasks: {},
      setTask: (key, snapshot) => set((state) => ({ tasks: { ...state.tasks, [key]: snapshot } })),
    }),
    {
      name: 'custom-tool-tasks',
      storage: createJSONStorage(() => ({
        getItem: (name) => localStorage.getItem(name),
        removeItem: (name) => localStorage.removeItem(name),
        setItem: (name, value) => {
          try {
            localStorage.setItem(name, value);
          } catch {
            // Large reports must remain usable in memory even when the browser cache is full.
            // Remove stale disk state so restarting cannot silently show an older result.
            try {
              localStorage.removeItem(name);
            } catch {
              // Storage may also be disabled; the active application still owns the task.
            }
          }
        },
      })),
      // Native events are durable in agent_runs; cache the displayed result, never file bytes.
      partialize: (state) => ({
        tasks: Object.fromEntries(
          Object.entries(state.tasks).map(([key, task]) => [
            key,
            {
              ...task,
              projection: {
                ...emptyProjection(),
                runId: task.projection.runId,
                content: task.projection.content,
                events: task.projection.events.filter(
                  (event) => !['assistant.start', 'assistant.commit'].includes(event.type),
                ),
                error: task.projection.error,
                status: task.projection.status === 'running' ? 'cancelled' : task.projection.status,
              },
            },
          ]),
        ),
      }),
    },
  ),
);
