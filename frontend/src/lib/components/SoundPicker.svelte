<script lang="ts">
	import type { SoundType } from '$lib/stores/settings';
	import { metronome } from '$lib/audio/metronome-engine';
	import { cn } from '$lib/utils';

	let { value = $bindable<SoundType>('beep'), volume = 0.8 }: { value?: SoundType; volume?: number } = $props();

	const sounds: { key: SoundType; label: string }[] = [
		{ key: 'click', label: 'Click' },
		{ key: 'beep', label: 'Beep' },
		{ key: 'woodblock', label: 'Wood' },
		{ key: 'hihat', label: 'Hi-Hat' }
	];

	function selectAndPreview(key: SoundType) {
		value = key;
		metronome.volume = volume;
		metronome.soundType = key;
		metronome.previewSound();
	}
</script>

<div class="flex flex-col gap-2">
	<span class="text-muted-foreground text-xs font-medium uppercase tracking-widest text-center">Sound</span>
	<div class="flex gap-1 rounded-xl bg-secondary p-1">
		{#each sounds as s}
			<button
				class={cn(
					'flex-1 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
					value === s.key
						? 'bg-primary text-primary-foreground shadow-sm'
						: 'text-muted-foreground hover:text-foreground'
				)}
				onclick={() => selectAndPreview(s.key)}
			>
				{s.label}
			</button>
		{/each}
	</div>
</div>
