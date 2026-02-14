<script lang="ts">
  let {
    elapsedSeconds = 0,
    isRunning = false,
    intervalPhase = '',
  }: {
    elapsedSeconds?: number;
    isRunning?: boolean;
    intervalPhase?: string;
  } = $props();

  function formatTime(totalSeconds: number): string {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;

    const mm = String(m).padStart(2, '0');
    const ss = String(s).padStart(2, '0');

    if (h > 0) {
      return `${h}:${mm}:${ss}`;
    }
    return `${mm}:${ss}`;
  }
</script>

<div class="flex flex-col items-center gap-1">
  {#if isRunning || elapsedSeconds > 0}
    <span class="tabular-nums text-3xl font-bold text-foreground">
      {formatTime(elapsedSeconds)}
    </span>
    {#if intervalPhase}
      <span class="text-sm font-medium text-primary animate-pulse">{intervalPhase}</span>
    {/if}
  {/if}
</div>
