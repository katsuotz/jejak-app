<script lang="ts">
	import { onDestroy } from 'svelte';
	import { metronome } from '$lib/audio/metronome-engine';
	import { metronomeSettings, rampSettings, intervalSettings } from '$lib/stores/settings';
	import { sessionHistory } from '$lib/stores/history';
	import { requestWakeLock, releaseWakeLock } from '$lib/utils/wake-lock';
	import BpmControl from '$lib/components/BpmControl.svelte';
	import FootModeToggle from '$lib/components/FootModeToggle.svelte';
	import SoundPicker from '$lib/components/SoundPicker.svelte';
	import VolumeControl from '$lib/components/VolumeControl.svelte';
	import RampControl from '$lib/components/RampControl.svelte';
	import IntervalTimer from '$lib/components/IntervalTimer.svelte';
	import SessionTimer from '$lib/components/SessionTimer.svelte';
	import BeatIndicator from '$lib/components/BeatIndicator.svelte';
	import Button from '$lib/components/ui/button/Button.svelte';

	let isPlaying = $state(false);
	let beatActive = $state(false);
	let elapsedSeconds = $state(0);
	let intervalPhase = $state('');

	let sessionTimer: ReturnType<typeof setInterval> | null = null;
	let rampTimer: ReturnType<typeof setInterval> | null = null;
	let intervalTimer: ReturnType<typeof setInterval> | null = null;
	let sessionStartTime = 0;

	// Sync metronome engine with settings reactively
	$effect(() => {
		metronome.bpm = $metronomeSettings.bpm;
		metronome.soundType = $metronomeSettings.soundType;
		metronome.volume = $metronomeSettings.volume;
		metronome.skipAlternate = $metronomeSettings.footMode !== 'both';
	});

	metronome.setTickCallback(() => {
		beatActive = true;
		setTimeout(() => (beatActive = false), 80);
	});

	function startSession() {
		isPlaying = true;
		sessionStartTime = Date.now();
		elapsedSeconds = 0;

		// If ramp is enabled, start from ramp's startBpm
		if ($rampSettings.enabled) {
			$metronomeSettings.bpm = $rampSettings.startBpm;
		}

		metronome.start();
		requestWakeLock();

		// Session stopwatch
		sessionTimer = setInterval(() => {
			elapsedSeconds = Math.floor((Date.now() - sessionStartTime) / 1000);
		}, 1000);

		// BPM Ramp logic
		if ($rampSettings.enabled) {
			const rampDurationMs = $rampSettings.durationMinutes * 60 * 1000;
			const startBpm = $rampSettings.startBpm;
			const endBpm = $rampSettings.endBpm;
			const rampStart = Date.now();

			rampTimer = setInterval(() => {
				const elapsed = Date.now() - rampStart;
				const progress = Math.min(1, elapsed / rampDurationMs);
				const currentBpm = Math.round(startBpm + (endBpm - startBpm) * progress);
				$metronomeSettings.bpm = currentBpm;
				metronome.bpm = currentBpm;

				if (progress >= 1 && rampTimer) {
					clearInterval(rampTimer);
					rampTimer = null;
				}
			}, 500);
		}

		// Interval timer logic
		if ($intervalSettings.enabled) {
			const runMs = $intervalSettings.runMinutes * 60 * 1000;
			const walkMs = $intervalSettings.walkMinutes * 60 * 1000;
			const cycleMs = runMs + walkMs;
			const maxCycles = $intervalSettings.continuous ? Infinity : $intervalSettings.cycles;
			let completedCycles = 0;
			const intervalStart = Date.now();

			intervalPhase = '🏃 Run';

			intervalTimer = setInterval(() => {
				const elapsed = Date.now() - intervalStart;
				const currentCycle = Math.floor(elapsed / cycleMs);

				if (currentCycle >= maxCycles) {
					intervalPhase = '✅ Done';
					if (intervalTimer) {
						clearInterval(intervalTimer);
						intervalTimer = null;
					}
					return;
				}

				const posInCycle = elapsed % cycleMs;
				const wasRunning = intervalPhase.includes('Run');
				const nowRunning = posInCycle < runMs;

				if (nowRunning) {
					intervalPhase = `🏃 Run (${currentCycle + 1}/${maxCycles === Infinity ? '∞' : maxCycles})`;
				} else {
					intervalPhase = `🚶 Walk (${currentCycle + 1}/${maxCycles === Infinity ? '∞' : maxCycles})`;
				}

				// Play bell on phase transition
				if (wasRunning !== nowRunning || (wasRunning && !nowRunning)) {
					metronome.playBell();
				}
			}, 500);
		}
	}

	function stopSession() {
		isPlaying = false;
		metronome.stop();
		releaseWakeLock();

		if (sessionTimer) {
			clearInterval(sessionTimer);
			sessionTimer = null;
		}
		if (rampTimer) {
			clearInterval(rampTimer);
			rampTimer = null;
		}
		if (intervalTimer) {
			clearInterval(intervalTimer);
			intervalTimer = null;
		}

		// Log session to history if it lasted more than 5 seconds
		if (elapsedSeconds > 5) {
			sessionHistory.add({
				durationSeconds: elapsedSeconds,
				bpm: $rampSettings.enabled ? $rampSettings.startBpm : $metronomeSettings.bpm,
				bpmEnd: $rampSettings.enabled ? $rampSettings.endBpm : undefined,
				footMode: $metronomeSettings.footMode,
				soundType: $metronomeSettings.soundType,
				hadRamp: $rampSettings.enabled,
				hadIntervals: $intervalSettings.enabled
			});
		}

		intervalPhase = '';
	}

	function toggleSession() {
		if (isPlaying) {
			stopSession();
		} else {
			startSession();
		}
	}

	onDestroy(() => {
		stopSession();
		metronome.dispose();
	});
</script>

<div class="flex flex-col gap-6 px-4 py-6 pb-2 max-w-lg mx-auto">
	<!-- Session Timer -->
	<SessionTimer {elapsedSeconds} isRunning={isPlaying} {intervalPhase} />

	<!-- Beat Indicator -->
	<BeatIndicator active={beatActive} />

	<!-- BPM Control -->
	<BpmControl bind:value={$metronomeSettings.bpm} />

	<!-- Start/Stop Button -->
	<div class="flex justify-center">
		<Button
			size="xl"
			variant={isPlaying ? 'destructive' : 'default'}
			class="w-full max-w-xs h-16 rounded-2xl text-xl font-bold shadow-lg {isPlaying ? '' : 'animate-pulse'}"
			onclick={toggleSession}
		>
			{isPlaying ? '⏹ Stop' : '▶ Start'}
		</Button>
	</div>

	<!-- Controls (disabled while playing) -->
	<div class="flex flex-col gap-4 {isPlaying ? 'opacity-50 pointer-events-none' : ''}">
		<FootModeToggle bind:value={$metronomeSettings.footMode} />
		<SoundPicker bind:value={$metronomeSettings.soundType} volume={$metronomeSettings.volume} />
		<VolumeControl bind:value={$metronomeSettings.volume} />
		<RampControl bind:settings={$rampSettings} />
		<IntervalTimer bind:settings={$intervalSettings} />
	</div>
</div>
