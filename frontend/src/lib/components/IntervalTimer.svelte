<script lang="ts">
  import type { IntervalSettings } from '$lib/stores/settings';
  import { cn } from '$lib/utils';

  let {
    settings = $bindable<IntervalSettings>({
      enabled: false,
      runMinutes: 5,
      walkMinutes: 1,
      cycles: 5,
      continuous: false,
    }),
  }: { settings?: IntervalSettings } = $props();
</script>

<div class="flex flex-col gap-3 rounded-xl bg-card p-4 border border-border">
  <div class="flex items-center justify-between">
    <div>
      <h3 class="text-sm font-semibold text-foreground">Run/Walk Intervals</h3>
      <p class="text-xs text-muted-foreground">Alternate run & walk phases</p>
    </div>
    <button
      aria-label="Toggle Run/Walk Intervals"
      class={cn(
        'relative h-6 w-11 rounded-full transition-colors',
        settings.enabled ? 'bg-primary' : 'bg-secondary',
      )}
      onclick={() => (settings.enabled = !settings.enabled)}>
      <span
        class={cn(
          'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform',
          settings.enabled && 'translate-x-5',
        )}>
      </span>
    </button>
  </div>

  {#if settings.enabled}
    <div class="grid grid-cols-2 gap-3 mt-1">
      <label class="flex flex-col gap-1">
        <span class="text-xs text-muted-foreground">🏃 Run (min)</span>
        <input
          type="number"
          bind:value={settings.runMinutes}
          min="0.5"
          max="60"
          step="0.5"
          class="rounded-lg bg-secondary px-3 py-2 text-sm text-foreground text-center border-none outline-none" />
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-xs text-muted-foreground">🚶 Walk (min)</span>
        <input
          type="number"
          bind:value={settings.walkMinutes}
          min="0.5"
          max="60"
          step="0.5"
          class="rounded-lg bg-secondary px-3 py-2 text-sm text-foreground text-center border-none outline-none" />
      </label>
    </div>

    <div class="flex items-center justify-between">
      <label class="flex items-center gap-2">
        <input
          type="checkbox"
          bind:checked={settings.continuous}
          class="h-4 w-4 rounded accent-primary" />
        <span class="text-sm text-muted-foreground">Continuous</span>
      </label>

      {#if !settings.continuous}
        <label class="flex items-center gap-2">
          <span class="text-xs text-muted-foreground">Cycles:</span>
          <input
            type="number"
            bind:value={settings.cycles}
            min="1"
            max="50"
            class="w-14 rounded-lg bg-secondary px-2 py-1 text-sm text-foreground text-center border-none outline-none" />
        </label>
      {/if}
    </div>
  {/if}
</div>
