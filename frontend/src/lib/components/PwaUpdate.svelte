<script lang="ts">
	import { useRegisterSW } from 'virtual:pwa-register/svelte';

	const { needRefresh, updateServiceWorker } = useRegisterSW({
		onRegisteredSW(swUrl, r) {
			// Check for updates every 60 seconds
			if (r) {
				setInterval(() => r.update(), 60 * 1000);
			}
		}
	});

	function update() {
		updateServiceWorker(true);
	}

	function dismiss() {
		$needRefresh = false;
	}
</script>

{#if $needRefresh}
	<div class="fixed bottom-16 left-0 right-0 z-[100] flex justify-center px-4 pb-2 animate-in slide-in-from-bottom">
		<div class="flex w-full max-w-sm items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-lg">
			<div class="flex-1 min-w-0">
				<p class="text-sm font-medium text-foreground">New version available</p>
				<p class="text-xs text-muted-foreground">Tap update to get the latest features.</p>
			</div>
			<div class="flex gap-1.5 shrink-0">
				<button
					onclick={dismiss}
					class="rounded-lg px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
				>
					Later
				</button>
				<button
					onclick={update}
					class="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all"
				>
					Update
				</button>
			</div>
		</div>
	</div>
{/if}
