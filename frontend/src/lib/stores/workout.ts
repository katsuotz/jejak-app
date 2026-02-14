import { writable, get } from 'svelte/store';
import type { WorkoutTemplate, WorkoutPhase } from '$lib/data/workout-templates';

export interface WorkoutState {
  active: boolean;
  template: WorkoutTemplate | null;
  currentPhaseIndex: number;
  phaseElapsedSeconds: number;
  totalElapsedSeconds: number;
}

const DEFAULT_STATE: WorkoutState = {
  active: false,
  template: null,
  currentPhaseIndex: 0,
  phaseElapsedSeconds: 0,
  totalElapsedSeconds: 0,
};

function createWorkoutStore() {
  const store = writable<WorkoutState>({ ...DEFAULT_STATE });

  return {
    subscribe: store.subscribe,
    load(template: WorkoutTemplate) {
      store.set({
        active: false,
        template,
        currentPhaseIndex: 0,
        phaseElapsedSeconds: 0,
        totalElapsedSeconds: 0,
      });
    },
    start() {
      store.update((s) => ({ ...s, active: true }));
    },
    stop() {
      store.set({ ...DEFAULT_STATE });
    },
    getCurrentPhase(): WorkoutPhase | null {
      const state = get(store);
      if (!state.template) return null;
      return state.template.phases[state.currentPhaseIndex] ?? null;
    },
    tick(): { phaseChanged: boolean; finished: boolean; newPhase: WorkoutPhase | null } {
      const state = get(store);
      if (!state.active || !state.template) {
        return { phaseChanged: false, finished: false, newPhase: null };
      }

      const phases = state.template.phases;
      let phaseElapsed = state.phaseElapsedSeconds + 1;
      let phaseIndex = state.currentPhaseIndex;
      let totalElapsed = state.totalElapsedSeconds + 1;
      let phaseChanged = false;
      let finished = false;

      const currentPhase = phases[phaseIndex];
      if (currentPhase && phaseElapsed >= currentPhase.durationSeconds) {
        phaseIndex++;
        phaseElapsed = 0;
        phaseChanged = true;

        if (phaseIndex >= phases.length) {
          finished = true;
          store.set({ ...DEFAULT_STATE });
          return { phaseChanged: true, finished: true, newPhase: null };
        }
      }

      store.set({
        active: true,
        template: state.template,
        currentPhaseIndex: phaseIndex,
        phaseElapsedSeconds: phaseElapsed,
        totalElapsedSeconds: totalElapsed,
      });

      return {
        phaseChanged,
        finished,
        newPhase: phaseChanged ? phases[phaseIndex] : null,
      };
    },
    getState() {
      return get(store);
    },
  };
}

export const workoutStore = createWorkoutStore();
