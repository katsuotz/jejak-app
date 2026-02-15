export interface WorkoutPhase {
  name: string;
  durationSeconds: number;
  bpm: number;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  totalDurationMinutes: number;
  description: string;
  phases: WorkoutPhase[];
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

function transformPhase(phase: {
  name: string;
  duration_seconds: number;
  bpm: number;
}): WorkoutPhase {
  return {
    name: phase.name,
    durationSeconds: phase.duration_seconds,
    bpm: phase.bpm,
  };
}

function transformWorkout(workout: {
  id: string;
  name: string;
  total_duration_minutes: number;
  description: string;
  phases: { name: string; duration_seconds: number; bpm: number }[];
}): WorkoutTemplate {
  return {
    id: workout.id,
    name: workout.name,
    totalDurationMinutes: workout.total_duration_minutes,
    description: workout.description,
    phases: workout.phases.map(transformPhase),
  };
}

export async function fetchWorkouts(): Promise<WorkoutTemplate[]> {
  const response = await fetch(`${API_URL}/api/workouts`);
  if (!response.ok) {
    throw new Error('Failed to fetch workouts');
  }
  const data = await response.json();
  return data.map(transformWorkout);
}

export async function fetchWorkoutById(id: string): Promise<WorkoutTemplate> {
  const response = await fetch(`${API_URL}/api/workouts/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch workout');
  }
  const data = await response.json();
  return transformWorkout(data);
}
