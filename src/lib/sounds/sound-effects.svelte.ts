import { Context } from 'runed';
import { SvelteMap } from 'svelte/reactivity';
import { soundCatalog, type SoundConfig, type SoundId } from './sound-catalog.js';

export class SoundEffects<const Catalog extends Record<string, SoundConfig>> {
	readonly #catalog: Catalog;
	readonly #cache = new SvelteMap<string, HTMLAudioElement>();

	muted = $state(false);
	volume = $state(1);

	constructor(catalog: Catalog) {
		this.#catalog = catalog;
	}

	play(id: keyof Catalog): void {
		if (this.muted || typeof Audio === 'undefined') return;

		const cfg = this.#catalog[id];
		const file = cfg.kind === 'single' ? cfg.file : this.#pick(cfg.files);
		if (!file) return;

		const audio = this.#cache.get(file) ?? new Audio(file);
		audio.currentTime = 0;
		audio.volume = (cfg.volume ?? 1) * this.volume;
		this.#cache.set(file, audio);
		void audio.play().catch(() => {});
	}

	#pick(files: readonly string[]): string | undefined {
		return files[Math.floor(Math.random() * files.length)];
	}
}

export type AppSoundEffects = SoundEffects<typeof soundCatalog>;
export const createSoundEffects = () => new SoundEffects(soundCatalog);
export const soundContext = new Context<AppSoundEffects>('sound-effects');
export type { SoundId };
