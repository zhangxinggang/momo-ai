import type { IToolTaskSnapshot } from '@renderer/services/custom-tool/tool-task';
import { emptyProjection } from '@momo/aichat';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
