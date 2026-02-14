<script lang="ts">
  import type { RampSettings } from '$lib/stores/settings';
  import { cn } from '$lib/utils';

  let {
    settings = $bindable<RampSettings>({
      enabled: false,
      startBpm: 150,
      endBpm: 170,
      durationMinutes: 5,
    }),
  }: { settings?: RampSettings } = $props();
</script>

<div class="flex flex-col gap-3 rounded-xl bg-card p-4 border border-border">
  <div class="flex items-center justify-between">
    <div>
      <h3 class="text-sm font-semibold text-foreground">BPM Ramp</h3>
      <p class="text-xs text-muted-foreground">Gradually change tempo</p>
    </div>
    <button
      aria-label="Toggle BPM Ramp"
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
    <div class="grid grid-cols-3 gap-3 mt-1">
      <label class="flex flex-col gap-1">
        <span class="text-xs text-muted-foreground">Start BPM</span>
        <input
          type="number"
          bind:value={settings.startBpm}
          min="60"
          max="240"
          class="rounded-lg bg-secondary px-3 py-2 text-sm text-foreground text-center border-none outline-none" />
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-xs text-muted-foreground">End BPM</span>
        <input
          type="number"
          bind:value={settings.endBpm}
          min="60"
          max="240"
          class="rounded-lg bg-secondary px-3 py-2 text-sm text-foreground text-center border-none outline-none" />
      </label>
      <label class="flex flex-col gap-1">
        <span class="text-xs text-muted-foreground">Duration (min)</span>
        <input
          type="number"
          bind:value={settings.durationMinutes}
          min="1"
          max="60"
          class="rounded-lg bg-secondary px-3 py-2 text-sm text-foreground text-center border-none outline-none" />
      </label>
    </div>
  {/if}
</div>
