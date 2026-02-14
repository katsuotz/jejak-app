<script lang="ts">
  import { goto } from '$app/navigation';
  import { workoutTemplates } from '$lib/data/workout-templates';
  import { workoutStore } from '$lib/stores/workout';
  import type { WorkoutTemplate } from '$lib/data/workout-templates';

  function formatDuration(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (s === 0) return `${m}:00`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  function startWorkout(template: WorkoutTemplate) {
    workoutStore.load(template);
    goto('/');
  }

  function difficultyColor(id: string): string {
    if (['recovery', 'easy-run'].includes(id)) return 'text-green-400';
    if (['aerobic-steady', 'long-easy'].includes(id)) return 'text-yellow-400';
    return 'text-red-400';
  }

  function difficultyLabel(id: string): string {
    if (['recovery', 'easy-run'].includes(id)) return 'Easy';
    if (['aerobic-steady', 'long-easy'].includes(id)) return 'Moderate';
    return 'Hard';
  }
</script>

<div class="flex flex-col gap-4 px-4 py-6 max-w-lg mx-auto">
  <div>
    <h2 class="text-xl font-bold text-foreground">Workouts</h2>
    <p class="text-sm text-muted-foreground mt-1">
      Built-in workout programs with auto BPM changes
    </p>
  </div>

  <div class="flex flex-col gap-3">
    {#each workoutTemplates as template}
      <button
        onclick={() => startWorkout(template)}
        class="flex flex-col gap-2 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:bg-accent active:scale-[0.98]">
        <div class="flex items-center justify-between">
          <h3 class="text-base font-semibold text-foreground">
            {template.name}
          </h3>
          <div class="flex items-center gap-2">
            <span class="text-xs font-medium {difficultyColor(template.id)}">
              {difficultyLabel(template.id)}
            </span>
            <span
              class="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {template.totalDurationMinutes} min
            </span>
          </div>
        </div>
        <p class="text-xs text-muted-foreground">{template.description}</p>

        <!-- Phase timeline -->
        <div class="flex w-full gap-0.5 rounded-full overflow-hidden h-2 mt-1">
          {#each template.phases as phase}
            {@const widthPct = (phase.durationSeconds / (template.totalDurationMinutes * 60)) * 100}
            <div
              class="h-full rounded-sm {phase.bpm >= 180
                ? 'bg-red-500'
                : phase.bpm >= 170
                  ? 'bg-yellow-500'
                  : 'bg-green-500'}"
              style="width: {widthPct}%"
              title="{phase.name} — {formatDuration(phase.durationSeconds)} @ {phase.bpm} spm">
            </div>
          {/each}
        </div>

        <!-- Phase details -->
        <div class="flex flex-wrap gap-x-3 gap-y-1 mt-1">
          {#each template.phases as phase, i}
            {@const isLast = i === template.phases.length - 1}
            {@const isDuplicate =
              i > 0 &&
              phase.name === template.phases[i - 1].name &&
              phase.bpm === template.phases[i - 1].bpm}
            {#if !isDuplicate}
              <span class="text-[10px] text-muted-foreground">
                {phase.name.replace(/ \(\d+\/\d+\)/, '')}
                {phase.bpm}
              </span>
            {/if}
          {/each}
        </div>
      </button>
    {/each}
  </div>
</div>
