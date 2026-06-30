export type SynthPreset =
	| 'success'
	| 'error'
	| 'rejected'
	| 'transition'
	| 'dispatch'
	| 'snapshot'
	| 'pop'
	| 'tick'
	| 'type'
	| 'icon-bug'
	| 'icon-idea'
	| 'icon-rule'
	| 'door-open'
	| 'door-close'
	| 'door-knock'
	| 'actor-start'
	| 'actor-settle';

export type SoundConfig =
	| { readonly kind: 'single'; readonly file: string; readonly volume?: number }
	| { readonly kind: 'random'; readonly files: readonly string[]; readonly volume?: number }
	| { readonly kind: 'synth'; readonly preset: SynthPreset; readonly volume?: number };

export const soundCatalog = {
	'keyboard.click': {
		kind: 'random',
		files: [
			'/sounds/mechanical_keyboard_1.wav',
			'/sounds/mechanical_keyboard_2.wav',
			'/sounds/mechanical_keyboard_3.wav'
		],
		volume: 0.28
	},
	// Synthesized UI sounds (Web Audio API — no files needed)
	'ui.success': { kind: 'synth', preset: 'success', volume: 0.5 },
	'ui.error': { kind: 'synth', preset: 'error', volume: 0.45 },
	'ui.rejected': { kind: 'synth', preset: 'rejected', volume: 0.4 },
	'ui.transition': { kind: 'synth', preset: 'transition', volume: 0.3 },
	'ui.dispatch': { kind: 'synth', preset: 'dispatch', volume: 0.4 },
	// The machine's voice — the actor loop as sound: dispatch (in), transition
	// (fires), snapshot (out). Snapshot is the machine exhaling; keep it soft.
	'ui.snapshot': { kind: 'synth', preset: 'snapshot', volume: 0.32 },
	'ui.pop': { kind: 'synth', preset: 'pop', volume: 0.35 },
	'ui.tick': { kind: 'synth', preset: 'tick', volume: 0.3 },
	// The actor coming alive / the blueprint at rest
	'actor.start': { kind: 'synth', preset: 'actor-start', volume: 0.4 },
	'actor.settle': { kind: 'synth', preset: 'actor-settle', volume: 0.3 },
	// The craft — quiet writing. Synth, not the keyboard wavs: the recorded
	// samples have hot broadband transients that trip output limiters (e.g.
	// laptop smart-amp speaker protection), ducking the narration mid-speech.
	// A tiny lowpassed tap has a controlled peak and can't trigger that.
	'keyboard.type': { kind: 'synth', preset: 'type', volume: 0.6 },
	// Icon grammar accents — fired when the narration sweep reaches an icon mark
	'icon.bug': { kind: 'synth', preset: 'icon-bug', volume: 0.35 },
	'icon.idea': { kind: 'synth', preset: 'icon-idea', volume: 0.35 },
	'icon.rule': { kind: 'synth', preset: 'icon-rule', volume: 0.35 },
	// The room — the only physical sounds. The door is the threshold between
	// the calm of the Goodlab and the chaos outside; only George triggers it.
	'door.open': { kind: 'synth', preset: 'door-open', volume: 0.75 },
	'door.close': { kind: 'synth', preset: 'door-close', volume: 0.7 },
	'door.knock': { kind: 'synth', preset: 'door-knock', volume: 0.7 }
} as const satisfies Record<string, SoundConfig>;

export type SoundId = keyof typeof soundCatalog;
