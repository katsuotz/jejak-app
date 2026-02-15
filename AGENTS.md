# AGENTS.md — Jejak

## Project Overview

Jejak is a mobile-first PWA that helps runners improve their cadence using a real-time metronome. It features adjustable BPM, multiple sound types, run/walk intervals, BPM ramping, built-in workout programs, session history, and cadence presets.

## Repository Structure

```
running-app/
├── frontend/              # SvelteKit PWA (the main application)
│   ├── src/
│   │   ├── app.html       # HTML shell with SEO meta tags
│   │   ├── app.css        # Tailwind CSS v4 theme tokens
│   │   ├── app.d.ts       # Global type declarations
│   │   ├── lib/
│   │   │   ├── audio/
│   │   │   │   └── metronome-engine.ts   # Web Audio API metronome (scheduling, sounds, bell)
│   │   │   ├── components/               # Svelte 5 UI components
│   │   │   │   ├── BpmControl.svelte     # BPM slider + tap tempo
│   │   │   │   ├── BeatIndicator.svelte  # Visual beat pulse
│   │   │   │   ├── FootModeToggle.svelte # Both/one foot mode
│   │   │   │   ├── SoundPicker.svelte    # Sound type selector with preview
│   │   │   │   ├── VolumeControl.svelte  # Volume slider
│   │   │   │   ├── RampControl.svelte    # BPM ramp settings
│   │   │   │   ├── IntervalTimer.svelte  # Run/walk interval config
│   │   │   │   ├── SessionTimer.svelte   # Elapsed time display
│   │   │   │   ├── PwaUpdate.svelte      # SW update notification banner
│   │   │   │   └── ui/                   # shadcn-svelte primitives (Button, Slider)
│   │   │   ├── data/
│   │   │   │   └── workout-templates.ts  # 8 built-in workout programs
│   │   │   ├── stores/
│   │   │   │   ├── settings.ts           # MetronomeSettings, RampSettings, IntervalSettings, theme
│   │   │   │   ├── presets.ts            # User-saved cadence presets (localStorage)
│   │   │   │   ├── history.ts            # Session history log (localStorage)
│   │   │   │   └── workout.ts            # Workout runner state machine
│   │   │   ├── utils/
│   │   │   │   └── wake-lock.ts          # Screen Wake Lock API wrapper
│   │   │   └── utils.ts                  # cn() Tailwind class merge helper
│   │   └── routes/
│   │       ├── +layout.svelte            # App shell: header, nav, theme toggle, install button
│   │       ├── +page.svelte              # Metronome page (home) + workout runner integration
│   │       ├── workouts/+page.svelte     # Built-in workout browser
│   │       ├── presets/+page.svelte      # Saved presets management
│   │       └── history/+page.svelte      # Session history viewer
│   ├── static/                           # PWA icons, favicon, audio assets
│   ├── android/                          # Capacitor Android native project
│   ├── ios/                              # Capacitor iOS native project
│   ├── capacitor.config.ts               # Capacitor config (appId, webDir, etc.)
│   ├── vite.config.ts                    # Vite + SvelteKit + Tailwind + PWA plugin config
│   ├── package.json
│   ├── .oxfmtrc.json                     # oxfmt formatter config
│   └── .prettierrc                       # Prettier config (Svelte files only)
├── nginx/
│   └── jejak.conf          # Nginx config for serving the static build
├── .github/
│   └── workflows/
│       └── deploy.yml       # CI/CD: SSH deploy on push to main
└── README.md
```

## Tech Stack

- **Framework**: SvelteKit with Svelte 5 (runes: `$state`, `$derived`, `$effect`, `$props`, `$bindable`)
- **Styling**: Tailwind CSS v4 with `@theme` tokens, shadcn-svelte components
- **Audio**: Web Audio API with `AudioContext` and `OscillatorNode` for jitter-free scheduling
- **PWA**: `@vite-pwa/sveltekit` with `generateSW` strategy, `registerType: 'prompt'`
- **Native**: Capacitor 8 for Android and iOS builds
- **Build**: Vite, `@sveltejs/adapter-static` (fully static output)
- **Linting**: oxlint (`pnpm lint`)
- **Formatting**: oxfmt for `.ts`/`.js`, Prettier + prettier-plugin-svelte for `.svelte`
- **Deploy**: GitHub Actions → SSH → git pull + pnpm build + nginx reload

## Conventions

### Code Style
- **Svelte 5 runes only** — no legacy `$:` reactive statements, no `export let`. Use `$state()`, `$derived()`, `$effect()`, `$props()`, `$bindable()`.
- **TypeScript strict** — all stores and components are fully typed.
- **2-space indentation, no tabs** — enforced by oxfmt and Prettier.
- **Single quotes** — enforced by oxfmt and Prettier.
- **No semicolons in Svelte templates** — follow existing patterns.
- **Tailwind utility classes** — no custom CSS unless in `app.css` theme layer.

### Component Patterns
- Components use `$props()` with destructuring and type annotations.
- Bindable props use `$bindable()`.
- Components are in `src/lib/components/`, one component per file.
- shadcn-svelte primitives live in `src/lib/components/ui/`.

### Store Patterns
- All persistent stores use `createPersistedStore()` from `settings.ts` which wraps `writable` with `localStorage`.
- localStorage keys are prefixed with `jejak:` (e.g., `jejak:metronome`, `jejak:presets`).
- Non-persistent stores (like `workoutStore`) use plain `writable` with custom methods.

### Routing
- SvelteKit file-based routing under `src/routes/`.
- Static adapter — all pages are prerendered to `build/`.
- SPA fallback via `index.html` (configured in adapter and nginx).

## Commands

```bash
pnpm dev            # Start dev server (localhost:5173)
pnpm build          # Production build to build/
pnpm preview        # Preview production build
pnpm lint           # Run oxlint on src/
pnpm format         # Format ts/js with oxfmt, svelte with prettier
pnpm format:check   # Check formatting without writing
pnpm build:android  # Build web + sync to Android
pnpm build:ios      # Build web + sync to iOS
pnpm cap:sync       # Sync web assets to native projects
pnpm cap:android    # Open Android project in Android Studio
pnpm cap:ios        # Open iOS project in Xcode
```

## Key Architecture Decisions

1. **Web Audio API scheduling** — The metronome uses `AudioContext` with lookahead scheduling for precise timing, not `setInterval`. See `metronome-engine.ts`.
2. **Workout runner** — `workoutStore` is a tick-based state machine. The main page calls `workoutStore.tick()` every second and reacts to phase changes by updating BPM and playing a bell.
3. **PWA update flow** — `registerType: 'prompt'` lets users choose when to update. `PwaUpdate.svelte` checks for SW updates every 60s with guards against `InvalidStateError`.
4. **Static build** — No server runtime. Everything is prerendered and served via nginx with aggressive caching for immutable assets and no-cache for `sw.js`.
5. **Capacitor native apps** — The static `build/` output is loaded into a native WebView via Capacitor. `capacitor.config.ts` sets `webDir: 'build'` and `server.androidScheme: 'https'` for Web Audio and Wake Lock API compatibility. Run `pnpm build:android` or `pnpm build:ios` to build and sync.

## Deployment

- **Server path**: `/var/www/jejak-app/`
- **Nginx config**: `nginx/jejak.conf` — serves `frontend/build/`, with SW no-cache rules before static asset caching.
- **CI/CD**: `.github/workflows/deploy.yml` — on push to `main`, SSHs into server, pulls, builds, reloads nginx.
- **Domain**: configured via `server_name` in nginx (update `jejak.example.com` to actual domain).
