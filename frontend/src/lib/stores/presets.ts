import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';
import type { MetronomeSettings } from './settings';

export interface Preset {
  id: string;
  name: string;
  settings: MetronomeSettings;
  createdAt: number;
}

function createPresetsStore() {
  const stored = browser ? localStorage.getItem('jejak:presets') : null;
  const initial: Preset[] = stored ? JSON.parse(stored) : [];
  const store = writable<Preset[]>(initial);

  if (browser) {
    store.subscribe((value) => {
      localStorage.setItem('jejak:presets', JSON.stringify(value));
    });
  }

  return {
    subscribe: store.subscribe,
    add(name: string, settings: MetronomeSettings) {
      const preset: Preset = {
        id: crypto.randomUUID(),
        name,
        settings: { ...settings },
        createdAt: Date.now(),
      };
      store.update((presets) => [...presets, preset]);
      return preset;
    },
    remove(id: string) {
      store.update((presets) => presets.filter((p) => p.id !== id));
    },
    getAll() {
      return get(store);
    },
  };
}

export const presets = createPresetsStore();
