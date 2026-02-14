import type { SoundType } from '$lib/stores/settings';

type TickCallback = (beatNumber: number) => void;

interface SoundConfig {
  frequency: number;
  type: OscillatorType;
  duration: number;
  attackTime: number;
  releaseTime: number;
}

const SOUND_CONFIGS: Record<SoundType, SoundConfig> = {
  click: {
    frequency: 1000,
    type: 'square',
    duration: 0.03,
    attackTime: 0.001,
    releaseTime: 0.02,
  },
  beep: {
    frequency: 880,
    type: 'sine',
    duration: 0.08,
    attackTime: 0.005,
    releaseTime: 0.06,
  },
  woodblock: {
    frequency: 800,
    type: 'triangle',
    duration: 0.04,
    attackTime: 0.001,
    releaseTime: 0.035,
  },
  hihat: {
    frequency: 6000,
    type: 'square',
    duration: 0.025,
    attackTime: 0.001,
    releaseTime: 0.02,
  },
};

const BELL_FREQUENCY = 523.25; // C5 note for interval switch
const BELL_DURATION = 0.4;

export class MetronomeEngine {
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private nextBeatTime = 0;
  private schedulerTimer: ReturnType<typeof setInterval> | null = null;
  private beatCount = 0;
  private isPlaying = false;
  private _volume = 0.8;
  private _bpm = 170;
  private _soundType: SoundType = 'click';
  private _skipAlternate = false;
  private onTick: TickCallback | null = null;

  // Lookahead scheduling parameters
  private readonly scheduleAheadTime = 0.1; // seconds
  private readonly schedulerInterval = 25; // ms

  get playing() {
    return this.isPlaying;
  }

  get currentBeat() {
    return this.beatCount;
  }

  private ensureContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
      this.gainNode = this.audioContext.createGain();
      this.gainNode.gain.value = this._volume;
      this.gainNode.connect(this.audioContext.destination);
    }
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    return this.audioContext;
  }

  set volume(v: number) {
    this._volume = Math.max(0, Math.min(1, v));
    if (this.gainNode) {
      this.gainNode.gain.setValueAtTime(this._volume, this.audioContext!.currentTime);
    }
  }

  get volume() {
    return this._volume;
  }

  set bpm(value: number) {
    this._bpm = Math.max(60, Math.min(240, value));
  }

  get bpm() {
    return this._bpm;
  }

  set soundType(value: SoundType) {
    this._soundType = value;
  }

  set skipAlternate(value: boolean) {
    this._skipAlternate = value;
  }

  setTickCallback(cb: TickCallback) {
    this.onTick = cb;
  }

  private scheduleBeat(time: number) {
    const ctx = this.audioContext!;
    const config = SOUND_CONFIGS[this._soundType];

    // Skip alternate beats for single-foot mode
    if (this._skipAlternate && this.beatCount % 2 !== 0) {
      this.beatCount++;
      return;
    }

    const osc = ctx.createOscillator();
    const env = ctx.createGain();

    osc.type = config.type;
    osc.frequency.setValueAtTime(config.frequency, time);

    // For hihat, add noise-like quality with rapid frequency sweep
    if (this._soundType === 'hihat') {
      osc.frequency.exponentialRampToValueAtTime(100, time + config.duration);
    }

    env.gain.setValueAtTime(0, time);
    env.gain.linearRampToValueAtTime(1, time + config.attackTime);
    env.gain.exponentialRampToValueAtTime(0.001, time + config.duration);

    osc.connect(env);
    env.connect(this.gainNode!);

    osc.start(time);
    osc.stop(time + config.duration + 0.01);

    if (this.onTick) {
      const delay = Math.max(0, (time - ctx.currentTime) * 1000);
      setTimeout(() => this.onTick?.(this.beatCount), delay);
    }

    this.beatCount++;
  }

  private scheduler() {
    const ctx = this.audioContext!;
    const secondsPerBeat = 60.0 / this._bpm;

    while (this.nextBeatTime < ctx.currentTime + this.scheduleAheadTime) {
      this.scheduleBeat(this.nextBeatTime);
      this.nextBeatTime += secondsPerBeat;
    }
  }

  start() {
    if (this.isPlaying) return;

    const ctx = this.ensureContext();
    this.isPlaying = true;
    this.beatCount = 0;
    this.nextBeatTime = ctx.currentTime + 0.05;

    this.schedulerTimer = setInterval(() => this.scheduler(), this.schedulerInterval);
  }

  stop() {
    if (!this.isPlaying) return;

    this.isPlaying = false;
    if (this.schedulerTimer !== null) {
      clearInterval(this.schedulerTimer);
      this.schedulerTimer = null;
    }
  }

  previewSound() {
    const ctx = this.ensureContext();
    const time = ctx.currentTime + 0.02;
    const config = SOUND_CONFIGS[this._soundType];

    const osc = ctx.createOscillator();
    const env = ctx.createGain();

    osc.type = config.type;
    osc.frequency.setValueAtTime(config.frequency, time);

    if (this._soundType === 'hihat') {
      osc.frequency.exponentialRampToValueAtTime(100, time + config.duration);
    }

    env.gain.setValueAtTime(0, time);
    env.gain.linearRampToValueAtTime(1, time + config.attackTime);
    env.gain.exponentialRampToValueAtTime(0.001, time + config.duration);

    osc.connect(env);
    env.connect(this.gainNode!);

    osc.start(time);
    osc.stop(time + config.duration + 0.01);
  }

  playBell() {
    const ctx = this.ensureContext();
    const time = ctx.currentTime;

    const osc = ctx.createOscillator();
    const env = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(BELL_FREQUENCY, time);

    env.gain.setValueAtTime(0, time);
    env.gain.linearRampToValueAtTime(0.6, time + 0.01);
    env.gain.exponentialRampToValueAtTime(0.001, time + BELL_DURATION);

    osc.connect(env);
    env.connect(this.gainNode!);

    osc.start(time);
    osc.stop(time + BELL_DURATION + 0.01);
  }

  dispose() {
    this.stop();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
      this.gainNode = null;
    }
  }
}

export const metronome = new MetronomeEngine();
