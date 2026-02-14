<script lang="ts">
  import { onDestroy } from 'svelte';
  import { metronome } from '$lib/audio/metronome-engine';
  import { metronomeSettings, rampSettings, intervalSettings } from '$lib/stores/settings';
  import { sessionHistory } from '$lib/stores/history';
  import { workoutStore } from '$lib/stores/workout';
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
  let workoutTickTimer: ReturnType<typeof setInterval> | null = null;
  let sessionStartTime = 0;

  // Workout state
  let workoutPhaseName = $state('');
  let workoutPhaseRemaining = $state(0);
  let workoutTotalPhases = $state(0);
  let workoutCurrentPhaseIdx = $state(0);

  // Check if a workout is loaded (but not yet started)
  let hasWorkout = $derived($workoutStore.template !== null);
  let workoutName = $derived($workoutStore.template?.name ?? '');
  let isWorkoutMode = $state(false);

  // Sync metronome engine with settings reactively
  $effect(() => {
    metronome.bpm = $metronomeSettings.bpm;
    metronome.soundType = $metronomeSettings.soundType;
    metronome.volume = $metronomeSettings.volume;
    metronome.skipAlternate = $metronomeSettings.footMode !== 'both';
  });

  // When a workout is loaded, set BPM to first phase
  $effect(() => {
    if ($workoutStore.template && !$workoutStore.active) {
      const firstPhase = $workoutStore.template.phases[0];
      if (firstPhase) {
        $metronomeSettings.bpm = firstPhase.bpm;
      }
    }
  });

  metronome.setTickCallback(() => {
    beatActive = true;
    setTimeout(() => (beatActive = false), 80);
  });

  function startSession() {
    isPlaying = true;
    sessionStartTime = Date.now();
    elapsedSeconds = 0;

    // Workout mode
    if ($workoutStore.template) {
      isWorkoutMode = true;
      workoutStore.start();
      const phase = workoutStore.getCurrentPhase();
      if (phase) {
        $metronomeSettings.bpm = phase.bpm;
        workoutPhaseName = phase.name;
        workoutPhaseRemaining = phase.durationSeconds;
        workoutTotalPhases = $workoutStore.template.phases.length;
        workoutCurrentPhaseIdx = 0;
      }

      workoutTickTimer = setInterval(() => {
        const result = workoutStore.tick();
        const state = workoutStore.getState();

        if (result.finished) {
          metronome.playBell();
          workoutPhaseName = '✅ Done';
          workoutPhaseRemaining = 0;
          setTimeout(() => stopSession(), 2000);
          return;
        }

        if (result.phaseChanged && result.newPhase) {
          $metronomeSettings.bpm = result.newPhase.bpm;
          metronome.bpm = result.newPhase.bpm;
          metronome.playBell();
          workoutPhaseName = result.newPhase.name;
        }

        workoutCurrentPhaseIdx = state.currentPhaseIndex;
        const currentPhase = state.template?.phases[state.currentPhaseIndex];
        if (currentPhase) {
          workoutPhaseRemaining = currentPhase.durationSeconds - state.phaseElapsedSeconds;
        }
      }, 1000);
    } else {
      isWorkoutMode = false;

      // If ramp is enabled, start from ramp's startBpm
      if ($rampSettings.enabled) {
        $metronomeSettings.bpm = $rampSettings.startBpm;
      }

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

    metronome.start();
    requestWakeLock();

    // Session stopwatch
    sessionTimer = setInterval(() => {
      elapsedSeconds = Math.floor((Date.now() - sessionStartTime) / 1000);
    }, 1000);
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
    if (workoutTickTimer) {
      clearInterval(workoutTickTimer);
      workoutTickTimer = null;
    }

    // Log session to history if it lasted more than 5 seconds
    if (elapsedSeconds > 5) {
      sessionHistory.add({
        durationSeconds: elapsedSeconds,
        bpm: isWorkoutMode
          ? ($workoutStore.template?.phases[0]?.bpm ?? $metronomeSettings.bpm)
          : $rampSettings.enabled
            ? $rampSettings.startBpm
            : $metronomeSettings.bpm,
        bpmEnd: isWorkoutMode
          ? undefined
          : $rampSettings.enabled
            ? $rampSettings.endBpm
            : undefined,
        footMode: $metronomeSettings.footMode,
        soundType: $metronomeSettings.soundType,
        hadRamp: !isWorkoutMode && $rampSettings.enabled,
        hadIntervals: !isWorkoutMode && $intervalSettings.enabled,
      });
    }

    workoutStore.stop();
    isWorkoutMode = false;
    workoutPhaseName = '';
    workoutPhaseRemaining = 0;
    intervalPhase = '';
  }

  function clearWorkout() {
    workoutStore.stop();
    isWorkoutMode = false;
    workoutPhaseName = '';
  }

  function toggleSession() {
    if (isPlaying) {
      stopSession();
    } else {
      startSession();
    }
  }

  function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  onDestroy(() => {
    stopSession();
    metronome.dispose();
  });
</script>

<div class="flex flex-col gap-6 px-4 py-6 pb-2 max-w-lg mx-auto">
  <!-- Workout Banner -->
  {#if hasWorkout && !isPlaying}
    <div class="rounded-xl border border-primary/30 bg-primary/10 p-3">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-xs font-medium text-primary uppercase tracking-widest">Workout Loaded</p>
          <p class="text-sm font-bold text-foreground mt-0.5">{workoutName}</p>
        </div>
        <button
          onclick={clearWorkout}
          class="rounded-lg px-2 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
          ✕ Clear
        </button>
      </div>
    </div>
  {/if}

  <!-- Workout Phase Display -->
  {#if isWorkoutMode && isPlaying}
    <div class="rounded-xl border border-border bg-card p-3">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-xs text-muted-foreground">
            Phase {workoutCurrentPhaseIdx + 1}/{workoutTotalPhases}
          </p>
          <p class="text-lg font-bold text-foreground">{workoutPhaseName}</p>
        </div>
        <div class="text-right">
          <p class="text-xs text-muted-foreground">Remaining</p>
          <p class="text-lg font-bold text-primary tabular-nums">
            {formatTime(workoutPhaseRemaining)}
          </p>
        </div>
      </div>
      <!-- Phase progress bar -->
      {#if $workoutStore.template?.phases[$workoutStore.currentPhaseIndex]}
        {@const currentPhase = $workoutStore.template.phases[$workoutStore.currentPhaseIndex]}
        <div class="mt-2 h-1.5 w-full rounded-full bg-secondary overflow-hidden">
          <div
            class="h-full rounded-full bg-primary transition-all duration-1000"
            style="width: {((currentPhase.durationSeconds - workoutPhaseRemaining) /
              currentPhase.durationSeconds) *
              100}%">
          </div>
        </div>
      {/if}
    </div>
  {/if}

  <!-- Session Timer -->
  <SessionTimer
    {elapsedSeconds}
    isRunning={isPlaying}
    intervalPhase={isWorkoutMode ? '' : intervalPhase} />

  <!-- Beat Indicator -->
  <BeatIndicator active={beatActive} />

  <!-- BPM Control -->
  <BpmControl bind:value={$metronomeSettings.bpm} />

  <!-- Start/Stop Button -->
  <div class="flex justify-center">
    <Button
      size="xl"
      variant={isPlaying ? 'destructive' : 'default'}
      class="w-full max-w-xs h-16 rounded-2xl text-xl font-bold shadow-lg"
      onclick={toggleSession}>
      {isPlaying ? '⏹ Stop' : hasWorkout ? '▶ Start Workout' : '▶ Start'}
    </Button>
  </div>

  <!-- Controls (disabled while playing) -->
  <div class="flex flex-col gap-4 {isPlaying ? 'opacity-50 pointer-events-none' : ''}">
    <FootModeToggle bind:value={$metronomeSettings.footMode} />
    <SoundPicker bind:value={$metronomeSettings.soundType} volume={$metronomeSettings.volume} />
    <VolumeControl bind:value={$metronomeSettings.volume} />
    {#if !hasWorkout}
      <RampControl bind:settings={$rampSettings} />
      <IntervalTimer bind:settings={$intervalSettings} />
    {/if}
  </div>
</div>
