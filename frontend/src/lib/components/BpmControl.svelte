<script lang="ts">
  import Button from '$lib/components/ui/button/Button.svelte';
  import Slider from '$lib/components/ui/slider/Slider.svelte';

  let {
    value = $bindable(170),
    min = 60,
    max = 240,
  }: { value?: number; min?: number; max?: number } = $props();

  function adjust(delta: number) {
    value = Math.max(min, Math.min(max, value + delta));
  }
</script>

<div class="flex flex-col items-center gap-3">
  <span class="text-muted-foreground text-xs font-medium uppercase tracking-widest">BPM</span>
  <div class="flex items-center gap-4">
    <Button
      variant="secondary"
      size="icon"
      onclick={() => adjust(-5)}
      class="h-12 w-12 rounded-full text-lg">
      −5
    </Button>
    <Button
      variant="secondary"
      size="icon"
      onclick={() => adjust(-1)}
      class="h-10 w-10 rounded-full">
      −
    </Button>
    <span class="tabular-nums text-6xl font-bold text-primary min-w-[4ch] text-center">
      {value}
    </span>
    <Button
      variant="secondary"
      size="icon"
      onclick={() => adjust(1)}
      class="h-10 w-10 rounded-full">
      +
    </Button>
    <Button
      variant="secondary"
      size="icon"
      onclick={() => adjust(5)}
      class="h-12 w-12 rounded-full text-lg">
      +5
    </Button>
  </div>
  <Slider type="single" bind:value {min} {max} step={1} class="mt-2 w-full max-w-xs" />
</div>
