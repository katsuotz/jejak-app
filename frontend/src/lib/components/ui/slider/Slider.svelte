<script lang="ts">
	import { cn } from '$lib/utils';

	let {
		value = $bindable(0.5),
		min = 0,
		max = 1,
		step = 0.01,
		class: className,
		...restProps
	}: {
		value?: number;
		min?: number;
		max?: number;
		step?: number;
		class?: string;
	} = $props();

	const percent = $derived(((value - min) / (max - min)) * 100);
</script>

<div class={cn('relative flex w-full touch-none select-none items-center', className)}>
	<input
		type="range"
		bind:value
		{min}
		{max}
		{step}
		class="slider-input w-full"
		{...restProps}
	/>
</div>

<style>
	.slider-input {
		-webkit-appearance: none;
		appearance: none;
		height: 8px;
		border-radius: 9999px;
		background: var(--color-secondary);
		outline: none;
	}

	.slider-input::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 24px;
		height: 24px;
		border-radius: 50%;
		background: var(--color-primary);
		cursor: pointer;
		border: 2px solid var(--color-background);
		box-shadow: 0 0 0 2px var(--color-primary);
	}

	.slider-input::-moz-range-thumb {
		width: 24px;
		height: 24px;
		border-radius: 50%;
		background: var(--color-primary);
		cursor: pointer;
		border: 2px solid var(--color-background);
		box-shadow: 0 0 0 2px var(--color-primary);
	}
</style>
