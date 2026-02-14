<script lang="ts">
	import { sessionHistory } from '$lib/stores/history';
	import type { SessionRecord } from '$lib/stores/history';
	import Button from '$lib/components/ui/button/Button.svelte';

	let records = $state<SessionRecord[]>([]);

	sessionHistory.subscribe((val) => (records = val));

	function formatDuration(totalSeconds: number): string {
		const h = Math.floor(totalSeconds / 3600);
		const m = Math.floor((totalSeconds % 3600) / 60);
		const s = totalSeconds % 60;
		if (h > 0) return `${h}h ${m}m ${s}s`;
		if (m > 0) return `${m}m ${s}s`;
		return `${s}s`;
	}

	function formatDate(timestamp: number): string {
		return new Date(timestamp).toLocaleDateString(undefined, {
			weekday: 'short',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function footModeLabel(mode: string) {
		return mode === 'both' ? 'Both' : 'One';
	}

	function clearHistory() {
		if (confirm('Clear all session history?')) {
			sessionHistory.clear();
		}
	}
</script>

<div class="flex flex-col gap-6 px-4 py-6 max-w-lg mx-auto">
	<div class="flex items-start justify-between">
		<div>
			<h2 class="text-xl font-bold text-foreground">Session History</h2>
			<p class="text-sm text-muted-foreground mt-1">{records.length} sessions logged</p>
		</div>
		{#if records.length > 0}
			<Button variant="ghost" size="sm" class="text-destructive" onclick={clearHistory}>
				Clear All
			</Button>
		{/if}
	</div>

	{#if records.length === 0}
		<div class="flex flex-col items-center gap-2 py-12 text-muted-foreground">
			<span class="text-4xl">📊</span>
			<p class="text-sm">No sessions recorded yet</p>
			<p class="text-xs">Start a metronome session to begin tracking</p>
		</div>
	{:else}
		<div class="flex flex-col gap-2">
			{#each records as record (record.id)}
				<div class="rounded-xl bg-card border border-border p-4">
					<div class="flex items-start justify-between">
						<div class="flex-1">
							<div class="flex items-center gap-2">
								<span class="text-lg font-bold text-primary tabular-nums">
									{record.bpm}{record.bpmEnd ? ` → ${record.bpmEnd}` : ''} BPM
								</span>
								{#if record.hadRamp}
									<span class="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">Ramp</span>
								{/if}
								{#if record.hadIntervals}
									<span class="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">Intervals</span>
								{/if}
							</div>
							<p class="text-xs text-muted-foreground mt-1">
								{formatDuration(record.durationSeconds)} · {footModeLabel(record.footMode)} · {record.soundType}
							</p>
						</div>
						<div class="text-right">
							<p class="text-xs text-muted-foreground">{formatDate(record.date)}</p>
							<button
								class="text-xs text-muted-foreground hover:text-destructive mt-1 transition-colors"
								onclick={() => sessionHistory.remove(record.id)}
							>
								Delete
							</button>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
