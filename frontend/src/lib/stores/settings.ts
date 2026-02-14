import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type FootMode = 'both' | 'one';
export type SoundType = 'click' | 'beep' | 'woodblock' | 'hihat';

export interface MetronomeSettings {
  bpm: number;
  footMode: FootMode;
  soundType: SoundType;
  volume: number;
}

export interface RampSettings {
  enabled: boolean;
  startBpm: number;
  endBpm: number;
  durationMinutes: number;
}

export interface IntervalSettings {
  enabled: boolean;
  runMinutes: number;
  walkMinutes: number;
  cycles: number;
  continuous: boolean;
}

const DEFAULT_METRONOME: MetronomeSettings = {
  bpm: 170,
  footMode: 'one',
  soundType: 'beep',
  volume: 0.8,
};

const DEFAULT_RAMP: RampSettings = {
  enabled: false,
  startBpm: 150,
  endBpm: 170,
  durationMinutes: 5,
};

const DEFAULT_INTERVAL: IntervalSettings = {
  enabled: false,
  runMinutes: 5,
  walkMinutes: 1,
  cycles: 5,
  continuous: false,
};

function createPersistedStore<T>(key: string, defaultValue: T) {
  const stored = browser ? localStorage.getItem(key) : null;
  const initial = stored ? JSON.parse(stored) : defaultValue;
  const store = writable<T>(initial);

  if (browser) {
    store.subscribe((value) => {
      localStorage.setItem(key, JSON.stringify(value));
    });
  }

  return store;
}

export const metronomeSettings = createPersistedStore<MetronomeSettings>(
  'jejak:metronome',
  DEFAULT_METRONOME,
);

export const rampSettings = createPersistedStore<RampSettings>('jejak:ramp', DEFAULT_RAMP);

export const intervalSettings = createPersistedStore<IntervalSettings>(
  'jejak:interval',
  DEFAULT_INTERVAL,
);

export type ThemeMode = 'dark' | 'light';

function getSystemTheme(): ThemeMode {
  if (browser && window.matchMedia('(prefers-color-scheme: light)').matches) {
    return 'light';
  }
  return 'dark';
}

export const themeMode = createPersistedStore<ThemeMode>('jejak:theme', getSystemTheme());
