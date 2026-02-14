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

function m(minutes: number): number {
  return minutes * 60;
}

function s(seconds: number): number {
  return seconds;
}

function repeat(
  count: number,
  phases: WorkoutPhase[],
): WorkoutPhase[] {
  const result: WorkoutPhase[] = [];
  for (let i = 0; i < count; i++) {
    result.push(
      ...phases.map((p) => ({
        ...p,
        name: `${p.name} (${i + 1}/${count})`,
      })),
    );
  }
  return result;
}

export const workoutTemplates: WorkoutTemplate[] = [
  {
    id: 'recovery',
    name: 'Recovery',
    totalDurationMinutes: 20,
    description: 'Light recovery run with low cadence',
    phases: [
      { name: 'Warmup', durationSeconds: m(5), bpm: 160 },
      { name: 'Easy', durationSeconds: m(10), bpm: 168 },
      { name: 'Cooldown', durationSeconds: m(5), bpm: 156 },
    ],
  },
  {
    id: 'easy-run',
    name: 'Easy Run (short)',
    totalDurationMinutes: 30,
    description: 'Short easy-paced run',
    phases: [
      { name: 'Warmup', durationSeconds: m(6), bpm: 162 },
      { name: 'Easy', durationSeconds: m(20), bpm: 170 },
      { name: 'Cooldown', durationSeconds: m(4), bpm: 156 },
    ],
  },
  {
    id: 'aerobic-steady',
    name: 'Aerobic Steady',
    totalDurationMinutes: 40,
    description: 'Sustained aerobic effort at steady cadence',
    phases: [
      { name: 'Warmup', durationSeconds: m(8), bpm: 162 },
      { name: 'Steady', durationSeconds: m(28), bpm: 174 },
      { name: 'Cooldown', durationSeconds: m(4), bpm: 156 },
    ],
  },
  {
    id: 'long-easy',
    name: 'Long Easy',
    totalDurationMinutes: 60,
    description: 'Long easy run for building endurance',
    phases: [
      { name: 'Warmup', durationSeconds: m(8), bpm: 162 },
      { name: 'Easy', durationSeconds: m(46), bpm: 170 },
      { name: 'Cooldown', durationSeconds: m(6), bpm: 156 },
    ],
  },
  {
    id: 'tempo-blocks',
    name: 'Tempo Blocks',
    totalDurationMinutes: 42,
    description: '3 × 6-min tempo blocks with 2-min easy recovery',
    phases: [
      { name: 'Warmup', durationSeconds: m(12), bpm: 162 },
      ...repeat(3, [
        { name: 'Tempo', durationSeconds: m(6), bpm: 180 },
        { name: 'Easy', durationSeconds: m(2), bpm: 168 },
      ]),
      { name: 'Cooldown', durationSeconds: m(8), bpm: 156 },
    ],
  },
  {
    id: '1min-intervals',
    name: '1:00 Intervals',
    totalDurationMinutes: 38,
    description: '10 × 1-min hard with 1-min easy recovery',
    phases: [
      { name: 'Warmup', durationSeconds: m(12), bpm: 162 },
      ...repeat(10, [
        { name: 'Hard', durationSeconds: m(1), bpm: 186 },
        { name: 'Easy', durationSeconds: m(1), bpm: 168 },
      ]),
      { name: 'Cooldown', durationSeconds: m(6), bpm: 156 },
    ],
  },
  {
    id: 'hill-simulation',
    name: 'Hill Simulation',
    totalDurationMinutes: 44,
    description: '8 × 1:30 uphill simulation with downhill recovery',
    phases: [
      { name: 'Warmup', durationSeconds: m(12), bpm: 162 },
      ...repeat(8, [
        { name: 'Up', durationSeconds: s(90), bpm: 184 },
        { name: 'Down', durationSeconds: s(90), bpm: 168 },
      ]),
      { name: 'Cooldown', durationSeconds: m(8), bpm: 156 },
    ],
  },
  {
    id: 'strides',
    name: 'Strides',
    totalDurationMinutes: 30,
    description: '8 × 20-sec fast strides with 70-sec easy recovery',
    phases: [
      { name: 'Warmup', durationSeconds: m(12), bpm: 162 },
      ...repeat(8, [
        { name: 'Fast', durationSeconds: s(20), bpm: 190 },
        { name: 'Easy', durationSeconds: s(70), bpm: 168 },
      ]),
      { name: 'Cooldown', durationSeconds: m(6), bpm: 156 },
    ],
  },
];
