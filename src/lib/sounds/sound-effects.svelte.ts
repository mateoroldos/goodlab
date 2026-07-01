import { Context } from 'runed';
import { SvelteMap } from 'svelte/reactivity';
import { soundCatalog, type SoundConfig, type SoundId, type SynthPreset } from './sound-catalog.js';

export class SoundEffects<const Catalog extends Record<string, SoundConfig>> {
	readonly #catalog: Catalog;
	readonly #cache = new SvelteMap<string, HTMLAudioElement>();
	#audioCtx: AudioContext | undefined;

	muted = $state(false);
	volume = $state(1);

	constructor(catalog: Catalog) {
		this.#catalog = catalog;
	}

	play(id: keyof Catalog): void {
		if (this.muted) return;

		const cfg = this.#catalog[id];
		const vol = (cfg.volume ?? 1) * this.volume;

		if (cfg.kind === 'synth') {
			this.#playSynth(cfg.preset, vol);
			return;
		}

		if (typeof Audio === 'undefined') return;
		const file = cfg.kind === 'single' ? cfg.file : this.#pick(cfg.files);
		if (!file) return;

		const audio = this.#cache.get(file) ?? new Audio(file);
		audio.currentTime = 0;
		audio.volume = vol;
		this.#cache.set(file, audio);
		void audio.play().catch(() => {});
	}

	#pick(files: readonly string[]): string | undefined {
		return files[Math.floor(Math.random() * files.length)];
	}

	#playSynth(preset: SynthPreset, vol: number): void {
		if (typeof AudioContext === 'undefined') return;
		try {
			this.#audioCtx ??= new AudioContext();
			const ctx = this.#audioCtx;

			// Await resume so oscillators don't schedule while context is suspended.
			// Without this, the first synth sound on a fresh AudioContext is silent.
			const play = () => {
				const t = ctx.currentTime + 0.01;
				switch (preset) {
					case 'success': {
						// Ascending two-tone chime: C5 → G5
						this.#tone(ctx, 523, 'sine', vol * 0.55, t, t + 0.18);
						this.#tone(ctx, 784, 'sine', vol * 0.45, t + 0.07, t + 0.26);
						break;
					}
					case 'error': {
						// Harsh descending sawtooth: starts at a speaker-friendly 660Hz,
						// drops to 220Hz — the sawtooth timbre makes the fall clearly audible.
						const osc = ctx.createOscillator();
						const gain = ctx.createGain();
						osc.connect(gain);
						gain.connect(ctx.destination);
						osc.type = 'sawtooth';
						osc.frequency.setValueAtTime(660, t);
						osc.frequency.exponentialRampToValueAtTime(220, t + 0.13);
						gain.gain.setValueAtTime(vol * 0.32, t);
						gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
						osc.start(t);
						osc.stop(t + 0.16);
						break;
					}
					case 'rejected': {
						// Short downward ping: 600 → 340Hz — stays audible throughout
						const osc = ctx.createOscillator();
						const gain = ctx.createGain();
						osc.connect(gain);
						gain.connect(ctx.destination);
						osc.type = 'sine';
						osc.frequency.setValueAtTime(600, t);
						osc.frequency.exponentialRampToValueAtTime(340, t + 0.09);
						gain.gain.setValueAtTime(vol * 0.42, t);
						gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
						osc.start(t);
						osc.stop(t + 0.13);
						break;
					}
					case 'transition': {
						// Soft tick
						this.#tone(ctx, 680, 'sine', vol * 0.25, t, t + 0.04);
						break;
					}
				}
			};

			if (ctx.state === 'suspended') {
				void ctx.resume().then(play);
			} else {
				play();
			}
		} catch {
			// Silently fail — audio is non-critical
		}
	}

	/** Play a single sine/triangle/etc tone with exponential decay to silence. */
	#tone(
		ctx: AudioContext,
		freq: number,
		type: OscillatorType,
		peakGain: number,
		start: number,
		end: number
	): void {
		const osc = ctx.createOscillator();
		const gain = ctx.createGain();
		osc.connect(gain);
		gain.connect(ctx.destination);
		osc.type = type;
		osc.frequency.value = freq;
		gain.gain.setValueAtTime(peakGain, start);
		gain.gain.exponentialRampToValueAtTime(0.001, end);
		osc.start(start);
		osc.stop(end + 0.01);
	}
}

export type AppSoundEffects = SoundEffects<typeof soundCatalog>;
export const createSoundEffects = () => new SoundEffects(soundCatalog);
export const soundContext = new Context<AppSoundEffects>('sound-effects');
export type { SoundId };
