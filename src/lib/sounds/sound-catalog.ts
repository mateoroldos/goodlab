export type SoundOptions = {
	readonly volume?: number;
};

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
	)
} as const satisfies Record<string, SoundConfig>;

export type SoundId = keyof typeof soundCatalog;
