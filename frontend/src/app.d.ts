/// <reference types="@sveltejs/kit" />
/// <reference types="@vite-pwa/sveltekit" />

declare module 'virtual:pwa-register/svelte' {
  import type { Writable } from 'svelte/store';

  export interface RegisterSWOptions {
    immediate?: boolean;
    onNeedRefresh?: () => void;
    onOfflineReady?: () => void;
    onRegistered?: (registration: ServiceWorkerRegistration | undefined) => void;
    onRegisteredSW?: (swScriptUrl: string, registration: ServiceWorkerRegistration | undefined) => void;
    onRegisterError?: (error: Error) => void;
  }

  export function useRegisterSW(options?: RegisterSWOptions): {
    needRefresh: Writable<boolean>;
    offlineReady: Writable<boolean>;
    updateServiceWorker: (reloadPage?: boolean) => Promise<void>;
  };
}

declare global {
  namespace App {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}
