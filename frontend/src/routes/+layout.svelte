<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import { themeMode } from '$lib/stores/settings';
	import { browser } from '$app/environment';
	import { cn } from '$lib/utils';

	let { children } = $props();

	let deferredPrompt: any = $state(null);
	let showInstall = $state(false);

	const navItems = [
		{ href: '/', label: 'Metronome', icon: '🎵' },
		{ href: '/presets', label: 'Presets', icon: '💾' },
		{ href: '/history', label: 'History', icon: '📊' }
	];

	$effect(() => {
		if (browser) {
			document.documentElement.classList.remove('dark', 'light');
			document.documentElement.classList.add($themeMode);
		}
	});

	$effect(() => {
		if (!browser) return;

		const handler = (e: Event) => {
			e.preventDefault();
			deferredPrompt = e;
			showInstall = true;
		};

		window.addEventListener('beforeinstallprompt', handler);

		// Hide if already installed
		if (window.matchMedia('(display-mode: standalone)').matches) {
			showInstall = false;
		}

		return () => window.removeEventListener('beforeinstallprompt', handler);
	});

	async function installApp() {
		if (!deferredPrompt) return;
		deferredPrompt.prompt();
		const { outcome } = await deferredPrompt.userChoice;
		if (outcome === 'accepted') {
			showInstall = false;
		}
		deferredPrompt = null;
	}

	function toggleTheme() {
		$themeMode = $themeMode === 'dark' ? 'light' : 'dark';
	}

	function themeIcon(mode: string): string {
		return mode === 'dark' ? '🌙' : '☀️';
	}
</script>

<div class="flex min-h-dvh flex-col bg-background">
	<!-- Header -->
	<header class="sticky top-0 z-50 flex items-center justify-between border-b border-border bg-background/80 backdrop-blur-md px-4 py-3">
		<h1 class="text-lg font-bold text-primary">Jejak</h1>
		<div class="flex items-center gap-2">
			{#if showInstall}
				<button
					onclick={installApp}
					aria-label="Install app"
					class="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm text-primary-foreground font-medium transition-colors hover:bg-primary/90 active:scale-95"
				>
					<span>📲</span>
					<span class="text-xs">Install</span>
				</button>
			{/if}
			<button
				onclick={toggleTheme}
				aria-label="Toggle theme"
				class="flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
			>
				<span>{themeIcon($themeMode)}</span>
				<span class="capitalize text-xs">{$themeMode}</span>
			</button>
		</div>
	</header>

	<!-- Content -->
	<main class="flex-1 overflow-y-auto">
		{@render children()}
	</main>

	<!-- Bottom Nav -->
	<nav class="sticky bottom-0 z-50 border-t border-border bg-background/80 backdrop-blur-md">
		<div class="flex items-stretch">
			{#each navItems as item}
				<a
					href={item.href}
					class={cn(
						'flex flex-1 flex-col items-center gap-0.5 py-2 text-xs font-medium transition-colors',
						$page.url.pathname === item.href
							? 'text-primary'
							: 'text-muted-foreground hover:text-foreground'
					)}
				>
					<span class="text-lg">{item.icon}</span>
					<span>{item.label}</span>
				</a>
			{/each}
		</div>
	</nav>
</div>
