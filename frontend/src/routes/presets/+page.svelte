<script lang="ts">
  import { presets } from '$lib/stores/presets';
  import { metronomeSettings } from '$lib/stores/settings';
  import Button from '$lib/components/ui/button/Button.svelte';

  let presetName = $state('');
  let presetList = $state(presets.getAll());

  // Keep in sync
  presets.subscribe((val) => (presetList = val));

  function savePreset() {
    if (!presetName.trim()) return;
    presets.add(presetName.trim(), $metronomeSettings);
    presetName = '';
  }

  function loadPreset(id: string) {
    const preset = presetList.find((p) => p.id === id);
    if (preset) {
      $metronomeSettings = { ...preset.settings };
    }
  }

  function deletePreset(id: string) {
    presets.remove(id);
  }

  function footModeLabel(mode: string) {
    return mode === 'both' ? 'Both Feet' : 'One Foot';
  }
</script>

<div class="flex flex-col gap-6 px-4 py-6 max-w-lg mx-auto">
  <div>
    <h2 class="text-xl font-bold text-foreground">Cadence Presets</h2>
    <p class="text-sm text-muted-foreground mt-1">Save and load your favorite configurations</p>
  </div>

  <!-- Save New Preset -->
  <div class="flex gap-2">
    <input
      type="text"
      bind:value={presetName}
      placeholder="Preset name..."
      class="flex-1 rounded-xl bg-secondary px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground border-none outline-none focus:ring-2 focus:ring-primary"
      onkeydown={(e) => e.key === 'Enter' && savePreset()} />
    <Button onclick={savePreset} disabled={!presetName.trim()}>Save</Button>
  </div>

  <p class="text-xs text-muted-foreground">
    Current: {$metronomeSettings.bpm} BPM · {footModeLabel($metronomeSettings.footMode)} · {$metronomeSettings.soundType}
  </p>

  <!-- Preset List -->
  {#if presetList.length === 0}
    <div class="flex flex-col items-center gap-2 py-12 text-muted-foreground">
      <span class="text-4xl">💾</span>
      <p class="text-sm">No presets saved yet</p>
    </div>
  {:else}
    <div class="flex flex-col gap-2">
      {#each presetList as preset (preset.id)}
        <div class="flex items-center gap-3 rounded-xl bg-card border border-border p-4">
          <div class="flex-1 min-w-0">
            <h3 class="text-sm font-semibold text-foreground truncate">
              {preset.name}
            </h3>
            <p class="text-xs text-muted-foreground mt-0.5">
              {preset.settings.bpm} BPM · {footModeLabel(preset.settings.footMode)} · {preset
                .settings.soundType}
            </p>
          </div>
          <div class="flex gap-1.5">
            <Button variant="secondary" size="sm" onclick={() => loadPreset(preset.id)}>
              Load
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onclick={() => deletePreset(preset.id)}
              class="text-destructive hover:text-destructive">
              ✕
            </Button>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
