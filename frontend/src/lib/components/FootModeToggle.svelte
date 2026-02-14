<script lang="ts">
  import type { FootMode } from '$lib/stores/settings';
  import { cn } from '$lib/utils';

  let { value = $bindable<FootMode>('both') }: { value?: FootMode } = $props();

  const options: { key: FootMode; label: string; icon: string }[] = [
    { key: 'both', label: 'Both Feet', icon: '👟👟' },
    { key: 'one', label: 'One Foot', icon: '👟' },
  ];
</script>

<div class="flex flex-col gap-2">
  <span class="text-muted-foreground text-xs font-medium uppercase tracking-widest text-center">
    Foot Mode
  </span>
  <div class="flex gap-1 rounded-xl bg-secondary p-1">
    {#each options as opt}
      <button
        class={cn(
          'flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          value === opt.key
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground',
        )}
        onclick={() => (value = opt.key)}>
        <span class="text-base">{opt.icon}</span>
        <span class="block text-xs mt-0.5">{opt.label}</span>
      </button>
    {/each}
  </div>
</div>
