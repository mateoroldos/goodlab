import { Context } from 'runed';
import { SvelteMap } from 'svelte/reactivity';
import { soundCatalog, type SoundConfig, type SoundId } from './sound-catalog.js';
import { SYNTH_PRESETS } from './sound-presets.js';

interface PlayOptions {
	pitch?: number;
}

export class SoundEffects<const Catalog extends Record<string, SoundConfig>> {
	readonly #catalog: Catalog;
	readonly #cache = new SvelteMap<string, HTMLAudioElement>();
	#audioCtx: AudioContext | undefined;

	muted = $state(false);
	volume = $state(1);

	constructor(catalog: Catalog) {
		this.#catalog = catalog;
	}

	play(id: keyof Catalog, opts?: PlayOptions): void {
		if (this.muted) return;

		const cfg = this.#catalog[id];
		const vol = (cfg.volume ?? 1) * this.volume;

		if (cfg.kind === 'synth') {
			this.#playSynth(cfg.preset, vol, opts?.pitch ?? 1);
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

	// Await resume so oscillators don't schedule while context is suspended.
	// Without this, the first synth sound on a fresh AudioContext is silent.
	#playSynth(preset: keyof typeof SYNTH_PRESETS, vol: number, pitch: number): void {
		if (typeof AudioContext === 'undefined') return;
		try {
			this.#audioCtx ??= new AudioContext();
			const ctx = this.#audioCtx;
			const play = () => SYNTH_PRESETS[preset](ctx, ctx.currentTime + 0.01, vol, pitch);

			if (ctx.state === 'suspended') {
				void ctx.resume().then(play);
			} else {
				play();
			}
		} catch {
			// Silently fail — audio is non-critical
		}
	}
}

export type AppSoundEffects = SoundEffects<typeof soundCatalog>;
export const createSoundEffects = () => new SoundEffects(soundCatalog);
export const soundContext = new Context<AppSoundEffects>('sound-effects');
export type { SoundId };
