import type { SynthPreset } from './sound-catalog.js';

// One sound family: chiptune-leaning square/triangle voices softened by a
// lowpass filter, all on a C-major pitch grid, all with a short attack ramp
// so nothing clicks. Smooth and modern, subtly retro underneath.

interface NoteOpts {
	start: number;
	dur: number;
	freq: number;
	glideTo?: number;
	type: OscillatorType;
	peak: number;
	cutoff: number;
}

interface PresetOpts {
	pitch?: number;
}

// One voice: oscillator → lowpass → gain. The 4ms linear attack removes start
// clicks; the lowpass keeps square/triangle waves warm instead of harsh.
function note(ctx: AudioContext, opts: NoteOpts, preset?: PresetOpts): void {
	const pitch = preset?.pitch ?? 1;
	const osc = ctx.createOscillator();
	const filter = ctx.createBiquadFilter();
	const gain = ctx.createGain();
	osc.connect(filter);
	filter.connect(gain);
	gain.connect(ctx.destination);

	osc.type = opts.type;
	filter.type = 'lowpass';
	filter.frequency.value = opts.cutoff;

	osc.frequency.setValueAtTime(opts.freq * pitch, opts.start);
	if (opts.glideTo !== undefined) {
		osc.frequency.exponentialRampToValueAtTime(opts.glideTo * pitch, opts.start + opts.dur * 0.8);
	}

	gain.gain.setValueAtTime(0.0001, opts.start);
	gain.gain.linearRampToValueAtTime(opts.peak, opts.start + 0.004);
	gain.gain.exponentialRampToValueAtTime(0.001, opts.start + opts.dur);

	osc.start(opts.start);
	osc.stop(opts.start + opts.dur + 0.02);
}

/** Synth preset definitions. `t` is the scheduled start (ctx.currentTime + latency). */
export const SYNTH_PRESETS: Record<
	SynthPreset,
	(ctx: AudioContext, t: number, vol: number, pitch?: number) => void
> = {
	// Rising C-major arpeggio (C5 E5 G5) — a tiny, gentle power-up
	success: (ctx, t, vol) => {
		note(ctx, { start: t, dur: 0.14, freq: 523, type: 'square', peak: vol * 0.3, cutoff: 1800 });
		note(ctx, {
			start: t + 0.07,
			dur: 0.14,
			freq: 659,
			type: 'square',
			peak: vol * 0.3,
			cutoff: 1800
		});
		note(ctx, {
			start: t + 0.14,
			dur: 0.24,
			freq: 784,
			type: 'square',
			peak: vol * 0.36,
			cutoff: 1800
		});
	},

	// Full-octave downward bend (G4 → G3) — a filtered retro "damage" fall
	error: (ctx, t, vol) => {
		note(ctx, {
			start: t,
			dur: 0.2,
			freq: 392,
			glideTo: 196,
			type: 'square',
			peak: vol * 0.38,
			cutoff: 1500
		});
	},

	// Two flat low taps on E4 — reads as a calm "uh-uh", not an alarm
	rejected: (ctx, t, vol) => {
		note(ctx, { start: t, dur: 0.06, freq: 330, type: 'square', peak: vol * 0.38, cutoff: 1300 });
		note(ctx, {
			start: t + 0.09,
			dur: 0.08,
			freq: 330,
			type: 'square',
			peak: vol * 0.34,
			cutoff: 1300
		});
	},

	// Soft upward blip (E5 → G5) — the everyday "the machine moved" tick
	transition: (ctx, t, vol) => {
		note(ctx, {
			start: t,
			dur: 0.09,
			freq: 659,
			glideTo: 784,
			type: 'triangle',
			peak: vol * 0.5,
			cutoff: 2200
		});
	},

	// Quick rising zip (G4 → G5) — a message leaving for the mailbox
	dispatch: (ctx, t, vol) => {
		note(ctx, {
			start: t,
			dur: 0.11,
			freq: 392,
			glideTo: 784,
			type: 'triangle',
			peak: vol * 0.45,
			cutoff: 2400
		});
	},

	// Single glassy E6 ping, no glide — the machine exhaling a snapshot.
	// Distinct from transition (glide) and icon-idea (double sparkle).
	snapshot: (ctx, t, vol) => {
		note(ctx, { start: t, dur: 0.2, freq: 1319, type: 'triangle', peak: vol * 0.32, cutoff: 3000 });
	},

	// Tiny upward blip (C5 → D5) — one more actor joins the room
	pop: (ctx, t, vol, pitch) => {
		note(
			ctx,
			{
				start: t,
				dur: 0.06,
				freq: 523,
				glideTo: 587,
				type: 'triangle',
				peak: vol * 0.4,
				cutoff: 2200
			},
			{ pitch }
		);
	},

	// Short neutral tick — states multiplying, calm breaking
	tick: (ctx, t, vol, pitch) => {
		note(
			ctx,
			{ start: t, dur: 0.05, freq: 440, type: 'square', peak: vol * 0.34, cutoff: 1600 },
			{ pitch }
		);
	},

	// Muted key tap (A3 falling, heavily lowpassed) — writing in the quiet room.
	// Deliberately narrowband with a soft peak so it never competes with the narration voice.
	type: (ctx, t, vol) => {
		note(ctx, {
			start: t,
			dur: 0.045,
			freq: 220,
			glideTo: 160,
			type: 'square',
			peak: vol * 0.3,
			cutoff: 700
		});
	},

	// Short low fall (E4 → C4) — a muted "careful here" nudge
	'icon-bug': (ctx, t, vol) => {
		note(ctx, {
			start: t,
			dur: 0.12,
			freq: 330,
			glideTo: 262,
			type: 'square',
			peak: vol * 0.32,
			cutoff: 1300
		});
	},

	// Quick high sparkle (C6 → E6) — a tiny lightbulb ping
	'icon-idea': (ctx, t, vol) => {
		note(ctx, {
			start: t,
			dur: 0.12,
			freq: 1047,
			glideTo: 1319,
			type: 'triangle',
			peak: vol * 0.4,
			cutoff: 3200
		});
	},

	// Two-note settle (G5 → C6) — a soft "sealed" confirm
	'icon-rule': (ctx, t, vol) => {
		note(ctx, { start: t, dur: 0.08, freq: 784, type: 'triangle', peak: vol * 0.34, cutoff: 2400 });
		note(ctx, {
			start: t + 0.08,
			dur: 0.16,
			freq: 1047,
			type: 'triangle',
			peak: vol * 0.38,
			cutoff: 2400
		});
	},

	// Low creak sweep (A2 → E2) — a heavy door swinging open
	'door-open': (ctx, t, vol) => {
		note(ctx, {
			start: t,
			dur: 0.22,
			freq: 110,
			glideTo: 82,
			type: 'square',
			peak: vol * 0.34,
			cutoff: 520
		});
		note(ctx, {
			start: t + 0.18,
			dur: 0.35,
			freq: 90,
			glideTo: 55,
			type: 'square',
			peak: vol * 0.24,
			cutoff: 420
		});
		// Handle click at the latch
		note(ctx, {
			start: t,
			dur: 0.04,
			freq: 600,
			glideTo: 120,
			type: 'square',
			peak: vol * 0.34,
			cutoff: 900
		});
	},

	// Short slam — latch click then a low thud
	'door-close': (ctx, t, vol) => {
		note(ctx, {
			start: t,
			dur: 0.04,
			freq: 500,
			glideTo: 100,
			type: 'square',
			peak: vol * 0.4,
			cutoff: 800
		});
		note(ctx, {
			start: t + 0.03,
			dur: 0.18,
			freq: 80,
			glideTo: 40,
			type: 'square',
			peak: vol * 0.45,
			cutoff: 350
		});
		note(ctx, {
			start: t + 0.05,
			dur: 0.12,
			freq: 60,
			type: 'square',
			peak: vol * 0.3,
			cutoff: 280
		});
	},

	// Two muted wooden taps — someone at the Goodlab door
	'door-knock': (ctx, t, vol) => {
		note(ctx, {
			start: t,
			dur: 0.07,
			freq: 180,
			glideTo: 120,
			type: 'square',
			peak: vol * 0.55,
			cutoff: 600
		});
		note(ctx, {
			start: t + 0.16,
			dur: 0.09,
			freq: 170,
			glideTo: 110,
			type: 'square',
			peak: vol * 0.5,
			cutoff: 560
		});
	},

	// Warm hum rising an octave (C3 → C4) with a soft fifth above —
	// the blueprint powering into a living actor
	'actor-start': (ctx, t, vol) => {
		note(ctx, {
			start: t,
			dur: 0.5,
			freq: 131,
			glideTo: 262,
			type: 'triangle',
			peak: vol * 0.42,
			cutoff: 900
		});
		note(ctx, {
			start: t + 0.25,
			dur: 0.3,
			freq: 392,
			type: 'triangle',
			peak: vol * 0.16,
			cutoff: 1400
		});
	},

	// The inverse hum (C4 → C3), barely there — nothing is running
	'actor-settle': (ctx, t, vol) => {
		note(ctx, {
			start: t,
			dur: 0.55,
			freq: 262,
			glideTo: 131,
			type: 'triangle',
			peak: vol * 0.28,
			cutoff: 700
		});
	}
};
