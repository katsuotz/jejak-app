import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';
import type { FootMode, SoundType } from './settings';

export interface SessionRecord {
  id: string;
  date: number;
  durationSeconds: number;
  bpm: number;
  bpmEnd?: number;
  footMode: FootMode;
  soundType: SoundType;
  hadRamp: boolean;
  hadIntervals: boolean;
}

function createHistoryStore() {
  const stored = browser ? localStorage.getItem('jejak:history') : null;
  const initial: SessionRecord[] = stored ? JSON.parse(stored) : [];
  const store = writable<SessionRecord[]>(initial);

  if (browser) {
    store.subscribe((value) => {
      localStorage.setItem('jejak:history', JSON.stringify(value));
    });
  }

  return {
    subscribe: store.subscribe,
    add(record: Omit<SessionRecord, 'id' | 'date'>) {
      const session: SessionRecord = {
        ...record,
        id: crypto.randomUUID(),
        date: Date.now(),
      };
      store.update((records) => [session, ...records]);
      return session;
    },
    remove(id: string) {
      store.update((records) => records.filter((r) => r.id !== id));
    },
    clear() {
      store.set([]);
    },
    getAll() {
      return get(store);
    },
  };
}

export const sessionHistory = createHistoryStore();
