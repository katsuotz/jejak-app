# Jejak

A mobile-first PWA to help runners maintain their cadence with a metronome, interval timer, and more.

## Features

- **Cadence Metronome** — adjustable BPM (60–240), 4 sound types, both/single foot mode
- **Volume Control** — fine-grained volume slider
- **BPM Ramp** — gradually change tempo over a set duration (warm-up/cool-down)
- **Run/Walk Intervals** — configurable run/walk phases with audio cues
- **Session Timer** — stopwatch that runs alongside the metronome
- **Screen Wake Lock** — keeps screen on during active sessions
- **Dark/Light Mode** — toggle with system default
- **Cadence Presets** — save/load/delete favorite configurations
- **Session History** — auto-logged sessions with BPM, duration, and settings
- **Install to Homescreen** — PWA install prompt for mobile devices

## Tech Stack

- [SvelteKit](https://svelte.dev/) + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com/)
- [shadcn-svelte](https://shadcn-svelte.com/) components
- [@vite-pwa/sveltekit](https://vite-pwa-org.netlify.app/frameworks/sveltekit.html) for PWA support
- Web Audio API for jitter-free metronome scheduling
- [oxlint](https://oxc.rs/) for linting
- [oxfmt](https://oxc.rs/docs/guide/usage/formatter) for formatting

## Getting Started

```bash
cd frontend
pnpm install
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Lint & Format

```bash
pnpm lint           # Run oxlint
pnpm format         # Format with oxfmt
pnpm format:check   # Check formatting
```

## Build

```bash
pnpm build
pnpm preview
```

## Project Structure

```
src/
├── lib/
│   ├── audio/          # Web Audio metronome engine
│   ├── components/     # UI components
│   ├── stores/         # Svelte stores (settings, presets, history)
│   └── utils/          # Wake lock, cn() helper
├── routes/
│   ├── +page.svelte    # Metronome (home)
│   ├── presets/        # Presets page
│   └── history/        # History page
└── app.css             # Tailwind + theme tokens
```
