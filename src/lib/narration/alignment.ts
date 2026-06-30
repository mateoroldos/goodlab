import { chapterTimeline, paragraphSpans, type ChapterConfig } from '$lib/episode.js';
import { isSilentStop, type ParagraphAnchors } from './anchors.js';

/** Character-level timing from ElevenLabs `with-timestamps` — chars mirror the narration text. */
export interface Alignment {
	characters: string[];
	character_start_times_seconds: number[];
	character_end_times_seconds: number[];
}

/** Index of the char being spoken at `time` — last char whose start is at or before it. */
export const charAtTime = (alignment: Alignment, time: number): number => {
	const starts = alignment.character_start_times_seconds;
	let lo = 0;
	let hi = starts.length - 1;
	let ans = -1;
	while (lo <= hi) {
		const mid = (lo + hi) >> 1;
		if (starts[mid] <= time) {
			ans = mid;
			lo = mid + 1;
		} else {
			hi = mid - 1;
		}
	}
	return ans;
};

export const timeAtChar = (alignment: Alignment, charIdx: number): number => {
	const starts = alignment.character_start_times_seconds;
	if (starts.length === 0) return 0;
	return starts[Math.min(Math.max(charIdx, 0), starts.length - 1)];
};

export const alignmentDuration = (alignment: Alignment): number => {
	const ends = alignment.character_end_times_seconds;
	return ends.length > 0 ? ends[ends.length - 1] : 0;
};

/**
 * A timeline entry with its firing time inside the paragraph (seconds).
 * `entryIdx` indexes `chapterTimeline(chapter)` — the scene-state cursor.
 * `stopIdx` indexes `chapterStops(chapter)` — the stop this entry belongs to
 * (its own index for stops, the preceding stop's for at-spans).
 */
export interface TimedEntry {
	entryIdx: number;
	stopIdx: number;
	time: number;
}

/** Default gap before a silent stop fires in listen mode, when the author gives no `after`. */
const silentStopGapSeconds = 0.9;

/** Rough speech pace used when a paragraph has no generated audio. */
const secondsPerChar = 0.062;

/** Pad after a trailing silent stop so its scene change lands before the paragraph ends. */
const trailingStopPadSeconds = 0.4;

/**
 * Firing times for a paragraph's patches. Anchored stops and at-spans fire
 * when the voice reaches their word; silent stops fire on a cadence after the
 * previous entry. Without alignment (no clip yet), times are estimated from
 * text length so listen mode degrades to silent auto-advance instead of breaking.
 */
export const paragraphTimedEntries = (
	chapter: ChapterConfig,
	paragraphIdx: number,
	anchors: ParagraphAnchors,
	alignment: Alignment | undefined
): TimedEntry[] => {
	const spans = paragraphSpans(chapter.paragraphs[paragraphIdx]);
	const timed: TimedEntry[] = [];
	let prev = 0;
	let stopIdx = -1;

	const entries = chapterTimeline(chapter);
	for (let entryIdx = 0; entryIdx < entries.length; entryIdx++) {
		const entry = entries[entryIdx];
		if (entry.isStop) stopIdx += 1;
		if (entry.paragraphIdx !== paragraphIdx) continue;

		const span = spans[entry.spanIdx];
		const after = typeof span === 'string' ? undefined : span?.after;
		const time =
			span !== undefined && isSilentStop(span)
				? prev + (after !== undefined ? after / 1000 : silentStopGapSeconds)
				: alignment
					? timeAtChar(alignment, anchors.spanStart[entry.spanIdx])
					: anchors.spanStart[entry.spanIdx] * secondsPerChar;

		timed.push({ entryIdx, stopIdx, time });
		prev = time;
	}

	return timed;
};

/** Paragraph timeline length: the audio (or estimate), stretched to cover trailing silent stops. */
export const paragraphDuration = (
	anchors: ParagraphAnchors,
	alignment: Alignment | undefined,
	timed: TimedEntry[]
): number => {
	const spoken = alignment ? alignmentDuration(alignment) : anchors.text.length * secondsPerChar;
	const lastStop = timed.length > 0 ? timed[timed.length - 1].time + trailingStopPadSeconds : 0;
	return Math.max(spoken, lastStop);
};
