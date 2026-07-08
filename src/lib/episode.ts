import type { Component } from 'svelte';
import { defaultSpeaker, type SpeakerId } from './narration/speakers.js';

/**
 * A state delta — only the fields that change at this span.
 * Spread-merged left-to-right onto the chapter's `initial` state.
 * Set a field to `undefined` to explicitly clear it.
 */
export type Patch<S> = Partial<S>;

/**
 * A text span in a paragraph. Either plain prose or a patch anchored to prose.
 *
 * Two kinds of anchored patches:
 * - **stop** — navigable: the reader stops here. One keypress in read mode;
 *   fires at its first word in listen mode. A stop with `text: ''` is silent —
 *   the scene changes, but there is nothing new to read. Use the `stop()`
 *   sugar for both.
 * - **at** (`sync: true`) — not a stop. In read mode its patch folds into the
 *   enclosing stop; in listen mode it fires exactly when the voice reaches its
 *   first word. Use it to land a change on a word mid-sentence without costing
 *   a keypress.
 *
 * `after` only matters in listen mode: milliseconds after the previous stop
 * before a silent stop fires (defaults to a global cadence). Ignored in read mode.
 */
export type Span<S> =
	| string
	| {
			text: string;
			patch: Patch<S>;
			after?: number;
			sync?: boolean;
			/** Sound catalog key to fire when this span's first word is reached (listen mode)
			 *  or the stop is pressed through (read mode). Use for narrative sound cues like
			 *  a door opening. Loose string so episode.ts stays free of UI layer imports. */
			sound?: string;
			/** Site-music action, same anchor timing as `sound`. `'pause'` fades the
			 *  vinyl player out — John quieting the room. Listen mode only. */
			music?: 'pause';
	  };

/**
 * One reader-visible paragraph. Either a plain array of spans, or a config
 * carrying paragraph-level meaning:
 * - `speaker` — who says it (defaults to the guide).
 * - `ask` — a question paragraph: the narrator pauses after it so the reader
 *   predicts before the next paragraph reveals.
 */
export interface ParagraphConfig<S = any> {
	spans: Array<Span<S>>;
	speaker?: SpeakerId;
	ask?: boolean;
}

export type Paragraph<S> = Array<Span<S>> | ParagraphConfig<S>;

export const paragraphSpans = <S>(para: Paragraph<S>): Array<Span<S>> =>
	Array.isArray(para) ? para : para.spans;

export const spanText = (span: Span<unknown>): string =>
	typeof span === 'string' ? span : span.text;

export const paragraphSpeaker = <S>(para: Paragraph<S>): SpeakerId =>
	Array.isArray(para) ? defaultSpeaker : (para.speaker ?? defaultSpeaker);

export const isAsk = <S>(para: Paragraph<S>): boolean =>
	!Array.isArray(para) && (para.ask ?? false);

// ─── Authoring sugar ──────────────────────────────────────────────────────────

/** Anchored stop: the reader stops on these words — one keypress — and the patch applies. */
export function stop<S>(
	text: string,
	patch: Patch<S>,
	opts?: { sound?: string; music?: 'pause' }
): Span<S>;
/**
 * Silent stop: no prose, the scene just changes on its own keypress. In listen
 * mode it fires `after` milliseconds past the previous stop (defaults to a
 * global cadence).
 */
export function stop<S>(patch: Patch<S>, opts?: { after?: number }): Span<S>;
export function stop<S>(
	first: string | Patch<S>,
	second?: Patch<S> | { after?: number },
	opts?: { sound?: string; music?: 'pause' }
): Span<S> {
	if (typeof first === 'string') {
		// SAFETY: the anchored overload guarantees `second` is the patch when `first` is text.
		return { text: first, patch: second as Patch<S>, ...opts };
	}
	// SAFETY: the silent overload guarantees `second` is the options bag when `first` is the patch.
	return { text: '', patch: first, after: (second as { after?: number } | undefined)?.after };
}

/**
 * Change that lands *at* a word while reading continues — not a stop.
 * Fires on its first word in listen mode; folds into the enclosing stop in
 * read mode. The workhorse of the one-delta rule: one visible change per
 * span, landed on the word that names it.
 */
export const at = <S>(text: string, patch: Patch<S>, opts?: { sound?: string }): Span<S> => ({
	text,
	patch,
	sync: true,
	...opts
});

/** Paragraph voiced by a specific speaker. */
export const say = <S>(speaker: SpeakerId, ...spans: Array<Span<S>>): ParagraphConfig<S> => ({
	speaker,
	spans
});

// ─── Timeline ────────────────────────────────────────────────────────────────

/**
 * One patch in chapter order. The stops (anchored, silent, implicit) are what
 * read mode steps through; at-spans sit between them and fold into the
 * preceding stop's reach.
 */
export interface TimelineEntry<S> {
	paragraphIdx: number;
	spanIdx: number;
	patch: Patch<S>;
	isStop: boolean;
}

/** True when the span is an anchored (or silent) stop — a navigable position. */
export const isStopSpan = (span: Span<unknown>): boolean =>
	typeof span !== 'string' && span.sync !== true;

/**
 * All patches for a chapter, in fold order. At-spans that precede their
 * paragraph's first stop are reordered to follow it — so stepping onto a
 * paragraph in read mode applies them immediately, not the previous
 * paragraph's stop.
 *
 * Authoring rule: do not place an at-span before the first anchored stop of a
 * paragraph that also has stops. In listen mode such a span would fire before
 * the stop's word, making its time earlier than the stop in the timed list
 * (non-monotonic), which would stall the cursor. The pattern never occurs in
 * practice because at-spans-before-stops only appear in stop-less paragraphs
 * (implicit-stop path).
 */
export const chapterTimeline = <S>(chapter: ChapterConfig<S>): Array<TimelineEntry<S>> => {
	const entries: Array<TimelineEntry<S>> = [];

	for (let pi = 0; pi < chapter.paragraphs.length; pi++) {
		const spans = paragraphSpans(chapter.paragraphs[pi]);
		const leading: Array<TimelineEntry<S>> = [];
		let firstStop: TimelineEntry<S> | undefined;

		for (let si = 0; si < spans.length; si++) {
			const span = spans[si];
			if (typeof span === 'string') continue;
			const entry: TimelineEntry<S> = {
				isStop: isStopSpan(span),
				paragraphIdx: pi,
				patch: span.patch,
				spanIdx: si
			};
			if (entry.isStop) {
				// Emit the first stop with its leading at-spans attached, then continue in span order.
				if (!firstStop) {
					firstStop = entry;
					entries.push(entry, ...leading);
				} else {
					entries.push(entry);
				}
			} else {
				// At-spans after the first stop stay in place — inside their stop's
				// reach; at-spans before it buffer and attach right after it.
				(firstStop ? entries : leading).push(entry);
			}
		}

		if (!firstStop) {
			// No anchored stops — emit one implicit stop, then any at-spans.
			// spanIdx 0 is load-bearing: narration treats a non-negative spanIdx as
			// "this paragraph is reached", lighting it whole (its reach has no next stop).
			entries.push({ isStop: true, paragraphIdx: pi, patch: {}, spanIdx: 0 }, ...leading);
		}
	}

	return entries;
};

// ─── Stop model ──────────────────────────────────────────────────────────────

/**
 * A stop is a navigable position — one keypress forward or back.
 * Every anchored or silent stop is one; a paragraph with no stops produces
 * one implicit stop. At-spans are not stops.
 */
export interface Stop<S> {
	paragraphIdx: number;
	spanIdx: number;
	patch: Patch<S>;
}

/** All navigable stops for a chapter, in reading order. */
export const chapterStops = <S>(chapter: ChapterConfig<S>): Array<Stop<S>> =>
	chapterTimeline(chapter).filter((entry) => entry.isStop);

/**
 * Scene state at a reading position: fold every patch through stop `stopIdx`
 * **and** the at-spans in its reach (up to the next stop). Pure and reversible.
 */
export const stateAtStop = <S>(chapter: ChapterConfig<S>, stopIdx: number): S => {
	let nav = -1;
	let state = chapter.initial;
	for (const entry of chapterTimeline(chapter)) {
		if (entry.isStop) nav += 1;
		if (nav > stopIdx) break;
		state = { ...state, ...entry.patch };
	}
	return state;
};

/** Scene state after folding timeline entries 0..entryIdx — listen mode's cursor. */
export const stateAtEntry = <S>(chapter: ChapterConfig<S>, entryIdx: number): S =>
	chapterTimeline(chapter)
		.slice(0, entryIdx + 1)
		.reduce<S>((acc, entry) => ({ ...acc, ...entry.patch }), chapter.initial);

// ─── Chapter / Episode ───────────────────────────────────────────────────────

/**
 * SAFETY: `S = any` is deliberate existential erasure. An episode holds
 * chapters with heterogeneous scene states; `scene` and `initial` share the
 * same `S` (enforced at authoring time by `defineChapter`), but episode-level
 * code cannot name it. TypeScript has no existential types, so the pairing is
 * erased here and re-trusted where scene and state meet again (chapter-canvas).
 */
export interface ChapterConfig<S = any> {
	id: string;
	title?: string;
	/** The visual component for this chapter. Receives the current folded state. */
	scene: Component<{ state: S }>;
	/** Starting state — the fold begins here. */
	initial: S;
	paragraphs: Array<Paragraph<S>>;
}

export interface Episode {
	slug: string;
	title: string;
	description: string;
	chapters: ChapterConfig[];
}

export const defineChapter = <S>(config: ChapterConfig<S>): ChapterConfig<S> => config;
