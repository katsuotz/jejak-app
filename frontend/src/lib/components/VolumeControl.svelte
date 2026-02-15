<script lang="ts">
  import Slider from '$lib/components/ui/slider/Slider.svelte';

  let { value = $bindable(0.8) }: { value?: number } = $props();

  const volumePercent = $derived(Math.round(value * 100));

  function getVolumeIcon(v: number): string {
    if (v === 0) return '🔇';
    if (v < 0.3) return '🔈';
    if (v < 0.7) return '🔉';
    return '🔊';
  }
</script>

<div class="flex flex-col gap-2">
  <span class="text-muted-foreground text-xs font-medium uppercase tracking-widest text-center">
    Volume
  </span>
  <div class="flex items-center gap-3">
    <span class="text-lg">{getVolumeIcon(value)}</span>
    <Slider type="single" bind:value min={0} max={1} step={0.01} class="flex-1" />
    <span class="text-muted-foreground text-sm tabular-nums w-10 text-right">{volumePercent}%</span>
  </div>
</div>
