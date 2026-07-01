export type SoundOptions = {
	readonly volume?: number;
};

export type SynthPreset = 'success' | 'error' | 'rejected' | 'transition';

export type SoundConfig =
	| {
			readonly kind: 'single';
			readonly file: string;
			readonly volume?: number;
	  }
	| {
			readonly kind: 'random';
			readonly files: readonly string[];
			readonly volume?: number;
	  }
	| {
			readonly kind: 'synth';
			readonly preset: SynthPreset;
			readonly volume?: number;
	  };

export const sound = (file: string, opts: SoundOptions = {}) =>
	({
		kind: 'single',
		file,
		...opts
	}) as const;

export const randomSound = (files: readonly string[], opts: SoundOptions = {}) =>
	({
		kind: 'random',
		files,
		...opts
	}) as const;

export const soundCatalog = {
	'keyboard.click': randomSound(
		[
			'/sounds/mechanical_keyboard_1.wav',
			'/sounds/mechanical_keyboard_2.wav',
			'/sounds/mechanical_keyboard_3.wav'
		],
		{ volume: 0.28 }
	),
	// Synthesized UI sounds (Web Audio API — no files needed)
	'ui.success': { kind: 'synth', preset: 'success', volume: 0.5 },
	'ui.error': { kind: 'synth', preset: 'error', volume: 0.45 },
	'ui.rejected': { kind: 'synth', preset: 'rejected', volume: 0.4 },
	'ui.transition': { kind: 'synth', preset: 'transition', volume: 0.3 }
} as const satisfies Record<string, SoundConfig>;

export type SoundId = keyof typeof soundCatalog;
