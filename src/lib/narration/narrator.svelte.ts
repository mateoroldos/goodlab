import { Context, PersistedState } from 'runed';
import { base } from '$app/paths';
import { chapterTimeline, isAsk, paragraphSpeaker } from '$lib/episode.js';
import type { Player } from '$lib/player.svelte.js';
import {
	alignmentDuration,
	charAtTime,
	paragraphDuration,
	paragraphTimedEntries,
	type Alignment,
	type TimedEntry
} from './alignment.js';
import { paragraphAnchors } from './anchors.js';
import { narrationKey, type NarrationManifest } from './clips.js';

/** Breath before advancing to the next paragraph. */
const breathSeconds = 0.4;
/** Longer breath when crossing a chapter boundary. */
const breathChapterSeconds = 0.7;
/** Grace window past the alignment end before we clamp the audio, suppressing ElevenLabs tail bleed. */
const audioClampGrace = 0.15;

export const RATES = [1, 1.25, 1.5, 1.75, 2] as const;
export type Rate = (typeof RATES)[number];

const isRate = (v: number): v is Rate => (RATES as readonly number[]).includes(v);

/** Tolerates garbage or hand-edited storage — anything unknown falls back to 1×. */
const rateSerializer = {
	serialize: (rate: Rate) => String(rate),
	deserialize: (raw: string): Rate => {
		const v = Number(raw);
		return isRate(v) ? v : 1;
	}
};

/**
 * Playback lifecycle while in listen mode. `playing` covers both audible
 * speech and the silent wall-clock tail; `waiting` means the paragraph
 * finished and we hold for Space. Paused-while-waiting is unrepresentable.
 */
export type NarratorStatus = 'playing' | 'paused' | 'waiting';

export interface NarrationSlugs {
	series: string | undefined;
	episode: string;
}

/**
 * Drives listen mode. Owns the audio element and a single clock; on every
 * frame it derives the player's `stopIdx` (last stop whose anchor time has
 * passed) and `charIdx` (word cursor for the text sweep). Nothing is fired
 * imperatively — pause, resume, and seeks stay correct by construction.
 *
 * After audio finishes, the narrator waits for a short breath and advances.
 * Question paragraphs still enter `waiting` so the reader can predict before revealing.
 */
export class Narrator {
	readonly #player: Player;
	readonly #manifest: NarrationManifest;
	readonly #slugs: () => NarrationSlugs;

	status = $state<NarratorStatus>('playing');
	chapterIdx = $state(0);
	paragraphIdx = $state(0);
	/** Char being spoken in the active paragraph's narration text; -1 when silent. */
	charIdx = $state(-1);
	/**
	 * Whether the active clip has word alignment. Optimistically true while a
	 * clip loads so the text renders as an unswept (dim) region instead of
	 * flashing fully lit; false only once the load reveals there is none.
	 */
	aligned = $state(true);
	/** Playback progress 0–1 for the current paragraph's clip. */
	progress = $state(0);
	/** Playback rate. Persisted. */
	readonly #rate = new PersistedState<Rate>('narrator:rate', 1, { serializer: rateSerializer });

	#session = 0;
	#audio: HTMLAudioElement | undefined;
	#alignment: Alignment | undefined;
	#timed: TimedEntry[] = [];
	#paragraphStopIdx = -1;
	#paragraphCursor = -1;
	#duration = 0;
	#time = 0;
	#raf = 0;
	/** Wall clock for the silent stretch: time was `at` when `base` (performance.now) was
	 *  taken. Elapsed real time is scaled by `rate`, so silent stops keep pace with speech. */
	#tail: { base: number; at: number } | undefined;
	#crossingChapter = false;
	/** Prevents multiple prefetch calls for the same next paragraph within one play-through. */
	#prefetchedNext = false;

	constructor(player: Player, manifest: NarrationManifest, slugs: () => NarrationSlugs) {
		this.#player = player;
		this.#manifest = manifest;
		this.#slugs = slugs;
	}

	get listening(): boolean {
		return this.#player.mode === 'listen';
	}

	get paused(): boolean {
		return this.status === 'paused';
	}

	/** True when audio finished and we're holding for the user to press Space. */
	get waiting(): boolean {
		return this.status === 'waiting';
	}

	get rate(): Rate {
		return this.#rate.current;
	}

	/** True when the pause we're holding is a question — pill shows "Reveal". */
	get asking(): boolean {
		if (!this.waiting) return false;
		const chapter = this.#player.chapters[this.chapterIdx];
		const para = chapter?.paragraphs[this.paragraphIdx];
		return para !== undefined && isAsk(para);
	}

	/** Enter listen mode at the paragraph the reader is on. Call from a user gesture. */
	start = (): void => {
		this.#player.mode = 'listen';
		this.status = 'playing';
		void this.#enter(this.#player.chapterIdx, this.#player.paragraphIdx);
	};

	/**
	 * Space handler: if waiting → advance; if paused → resume; else → pause.
	 * This is the only way to advance past a waiting state from the keyboard.
	 */
	toggle = (): void => {
		if (this.status === 'waiting') {
			this.status = 'playing';
			this.#advance();
		} else if (this.status === 'paused') {
			this.resume();
		} else {
			this.pause();
		}
	};

	pause = (): void => {
		this.status = 'paused';
		this.#audio?.pause();
		cancelAnimationFrame(this.#raf);
		if (this.#tail) this.#tail = { at: this.#time, base: performance.now() };
	};

	resume = (): void => {
		this.status = 'playing';
		if (this.#audio && !this.#audio.ended) {
			this.#audio.playbackRate = this.rate;
			void this.#audio.play().catch(() => this.pause());
		}
		if (this.#tail) this.#tail = { at: this.#time, base: performance.now() };
		this.#tick();
	};

	/** Direct jump to a specific paragraph — used by click-to-seek in the narration column. */
	play = (ci: number, pi: number): void => {
		this.status = 'playing';
		void this.#enter(ci, pi);
	};

	/** Cycles through 1× → 1.25× → 1.5× → 1×. */
	cycleRate = (): void => {
		const idx = RATES.indexOf(this.rate);
		this.#rate.current = RATES[(idx + 1) % RATES.length];
		if (this.#audio) this.#audio.playbackRate = this.rate;
		// Re-base the silent tail so time already elapsed keeps its old pace.
		if (this.#tail) this.#tail = { at: this.#time, base: performance.now() };
	};

	/** Back to read mode, staying at the current position. */
	exit = (): void => {
		this.#teardown();
		this.charIdx = -1;
		this.status = 'playing';
		this.progress = 0;
		this.#player.mode = 'read';
		this.#player.stopIdx = Math.max(0, this.#player.stopIdx);
		this.#player.cursor = -1;
	};

	destroy = (): void => {
		this.#teardown();
	};

	#teardown(): void {
		this.#session += 1;
		this.#prefetchedNext = false;
		cancelAnimationFrame(this.#raf);
		if (this.#audio) {
			this.#audio.onended = null;
			this.#audio.pause();
			this.#audio = undefined;
		}
		this.#tail = undefined;
	}

	/** Fire-and-forget: prime the next paragraph's alignment JSON in the HTTP cache. */
	#prefetchNext(): void {
		const chapters = this.#player.chapters;
		const chapter = chapters[this.chapterIdx];
		let ci = this.chapterIdx;
		let pi = this.paragraphIdx + 1;
		if (pi >= chapter.paragraphs.length) {
			ci += 1;
			pi = 0;
		}
		if (ci >= chapters.length) return;
		const nextChapter = chapters[ci];
		const nextPara = nextChapter?.paragraphs[pi];
		if (!nextPara) return;
		const { series, episode } = this.#slugs();
		if (!series) return;
		void (async () => {
			const key = await narrationKey(
				series,
				episode,
				paragraphSpeaker(nextPara),
				paragraphAnchors(nextPara).text
			);
			const clip = this.#manifest.clips[key];
			if (clip) void fetch(`${base}${clip.alignment}`);
		})();
	}

	async #enter(ci: number, pi: number): Promise<void> {
		this.#crossingChapter = ci !== this.chapterIdx;
		this.#teardown();
		const session = this.#session;

		this.chapterIdx = ci;
		this.paragraphIdx = pi;
		this.charIdx = -1;
		this.aligned = true;
		this.progress = 0;
		this.#time = 0;

		const chapter = this.#player.chapters[ci];
		const para = chapter.paragraphs[pi];
		const anchors = paragraphAnchors(para);

		// Scene state at paragraph start: everything before this paragraph's first stop
		const entries = chapterTimeline(chapter);
		let nav = -1;
		this.#paragraphStopIdx = -1;
		this.#paragraphCursor = -1;
		for (let i = 0; i < entries.length; i++) {
			if (entries[i].isStop) nav += 1;
			if (entries[i].paragraphIdx >= pi) break;
			this.#paragraphCursor = i;
			if (entries[i].isStop) this.#paragraphStopIdx = nav;
		}
		this.#player.chapterIdx = ci;
		this.#player.stopIdx = this.#paragraphStopIdx;
		this.#player.cursor = this.#paragraphCursor;

		const { series, episode } = this.#slugs();
		let alignment: Alignment | undefined;
		let audio: HTMLAudioElement | undefined;

		if (series !== undefined && anchors.text !== '') {
			const key = await narrationKey(series, episode, paragraphSpeaker(para), anchors.text);
			if (session !== this.#session) return;
			const clip = this.#manifest.clips[key];
			if (clip) {
				try {
					const res = await fetch(`${base}${clip.alignment}`);
					alignment = res.ok ? ((await res.json()) as Alignment) : undefined;
				} catch {
					alignment = undefined;
				}
				if (session !== this.#session) return;
				audio = new Audio(`${base}${clip.audio}`);
				audio.playbackRate = this.rate;
			}
		}

		this.#alignment = alignment;
		this.aligned = alignment !== undefined;
		this.#timed = paragraphTimedEntries(chapter, pi, anchors, alignment);
		this.#duration = paragraphDuration(anchors, alignment, this.#timed);
		this.#audio = audio;
		this.#tail = audio ? undefined : { at: 0, base: performance.now() };

		if (audio) {
			audio.onended = () => {
				this.#tail = { at: this.#time, base: performance.now() };
			};
			try {
				await audio.play();
			} catch {
				// Autoplay blocked — surface as paused so Space resumes
				if (session === this.#session) this.pause();
				return;
			}
			if (session !== this.#session) {
				audio.pause();
				return;
			}
		}

		if (!this.paused) this.#tick();
	}

	#tick(): void {
		const session = this.#session;
		const step = () => {
			if (session !== this.#session || !this.listening || this.paused) return;

			// Derive time from the audio element, but clamp it at alignment end + grace
			// to suppress ElevenLabs next_text conditioning tail bleed. When clamped,
			// we release the audio element so the wall-clock tail takes over.
			if (this.#audio && !this.#audio.ended) {
				const rawTime = this.#audio.currentTime;
				if (this.#alignment && rawTime > alignmentDuration(this.#alignment) + audioClampGrace) {
					const clampAt = alignmentDuration(this.#alignment) + audioClampGrace;
					this.#audio.pause();
					this.#audio = undefined;
					this.#tail = { at: clampAt, base: performance.now() };
					this.#time = clampAt;
				} else {
					this.#time = rawTime;
				}
			} else {
				this.#time = this.#tail
					? this.#tail.at + ((performance.now() - this.#tail.base) / 1000) * this.rate
					: this.#time;
			}

			// Prime the next paragraph's alignment JSON in the HTTP cache ~1.5s before
			// end so the gap between paragraphs is nearly invisible.
			if (!this.#prefetchedNext && this.#time >= this.#duration - 1.5) {
				this.#prefetchedNext = true;
				this.#prefetchNext();
			}

			// Derive both cursors from alignment timing: the stop (text highlight,
			// progress) and the timeline cursor (scene state, incl. at-spans).
			// No early break — silent-stop times can overshoot a later word anchor,
			// and the fold catches earlier patches up anyway.
			let stopIdx = this.#paragraphStopIdx;
			let cursor = this.#paragraphCursor;
			for (const entry of this.#timed) {
				if (entry.time > this.#time) continue;
				stopIdx = entry.stopIdx;
				cursor = entry.entryIdx;
			}
			if (this.#player.stopIdx !== stopIdx) this.#player.stopIdx = stopIdx;
			if (this.#player.cursor !== cursor) this.#player.cursor = cursor;

			// Derive word cursor: pin to last char when finished (keeps text fully lit while waiting)
			if (this.#alignment) {
				this.charIdx =
					this.#audio && !this.#audio.ended
						? charAtTime(this.#alignment, this.#time)
						: this.#alignment.characters.length - 1;
			} else {
				this.charIdx = -1;
			}

			this.progress = this.#duration > 0 ? Math.min(this.#time / this.#duration, 1) : 0;

			if (this.#time >= this.#duration) {
				// Question paragraphs always hold for the reader's prediction.
				const para = this.#player.chapters[this.chapterIdx]?.paragraphs[this.paragraphIdx];
				const holdForAsk = para !== undefined && isAsk(para);
				if (holdForAsk) {
					// Check if there's a next paragraph — if not, just exit.
					const chapters = this.#player.chapters;
					const chapter = chapters[this.chapterIdx];
					const hasNext =
						this.paragraphIdx < chapter.paragraphs.length - 1 ||
						this.chapterIdx < chapters.length - 1;
					if (hasNext) {
						this.status = 'waiting';
						return; // Stop loop — toggle() or seek() will call #advance()
					} else {
						this.exit();
						return;
					}
				}

				// Wait for breath then advance.
				const breath = this.#crossingChapter ? breathChapterSeconds : breathSeconds;
				if (this.#time >= this.#duration + breath) {
					this.#advance();
					return;
				}
			}

			this.#raf = requestAnimationFrame(step);
		};
		this.#raf = requestAnimationFrame(step);
	}

	#advance(): void {
		const chapters = this.#player.chapters;
		const chapter = chapters[this.chapterIdx];
		if (this.paragraphIdx < chapter.paragraphs.length - 1) {
			void this.#enter(this.chapterIdx, this.paragraphIdx + 1);
		} else if (this.chapterIdx < chapters.length - 1) {
			this.#crossingChapter = true;
			void this.#enter(this.chapterIdx + 1, 0);
		} else {
			this.exit();
		}
	}
}

export const narratorContext = new Context<Narrator>('narrator');
