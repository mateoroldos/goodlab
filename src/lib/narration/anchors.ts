import { parseInline } from '$lib/components/episode-player/inline-marks.js';
import { paragraphSpans, spanText, type Paragraph, type Span } from '$lib/episode.js';

export type SegKind = 'text' | 'code' | 'bold' | 'icon';

/**
 * One display segment of a paragraph: a word, a whitespace run, or a
 * zero-width icon mark. `text` preserves the original spacing for rendering
 * (for icons it holds the icon id); `start`/`end` are the segment's char range
 * in the narration text (whitespace collapsed, trimmed, icons dropped), which
 * is what alignment timestamps index into.
 */
export interface Seg {
	spanIdx: number;
	kind: SegKind;
	text: string;
	word: boolean;
	start: number;
	end: number;
}

/**
 * A paragraph, resolved for narration: the exact string sent to TTS,
 * where each span begins inside it, and every word's char range.
 * Pure derivation — the paragraph itself stays the single source of truth.
 */
export interface ParagraphAnchors {
	text: string;
	/** Char offset in `text` where each span's first word lands. */
	spanStart: number[];
	segs: Seg[];
}

/** A silent stop: an anchored span with no prose — silent in narration, still a stop. */
export const isSilentStop = (span: Span<unknown>): boolean =>
	typeof span !== 'string' && span.text === '';

export const paragraphAnchors = (para: Paragraph<unknown>): ParagraphAnchors => {
	const spans = paragraphSpans(para);
	const segs: Seg[] = [];
	let out = '';
	let pendingSpace = false;

	for (let si = 0; si < spans.length; si++) {
		for (const token of parseInline(spanText(spans[si]))) {
			// Icon marks render but are never spoken — zero-width in the narration text.
			if (token.kind === 'icon') {
				segs.push({
					end: out.length,
					kind: 'icon',
					spanIdx: si,
					start: out.length,
					text: token.value,
					word: false
				});
				continue;
			}
			// Split into word/whitespace runs, keeping the original characters
			for (const run of token.value.split(/(\s+)/)) {
				if (run === '') continue;
				if (/^\s+$/.test(run)) {
					if (out.length > 0) pendingSpace = true;
					segs.push({
						end: out.length,
						kind: token.kind,
						spanIdx: si,
						start: out.length,
						text: run,
						word: false
					});
					continue;
				}
				if (pendingSpace) {
					out += ' ';
					pendingSpace = false;
				}
				const start = out.length;
				out += run;
				segs.push({ end: out.length, kind: token.kind, spanIdx: si, start, text: run, word: true });
			}
		}
	}

	// A span's anchor is its first word; empty/whitespace-only spans (silent
	// stops) anchor where the next word lands.
	const spanStart: number[] = [];
	for (let si = spans.length - 1, next = out.length; si >= 0; si--) {
		const word = segs.find((seg) => seg.spanIdx === si && seg.word);
		spanStart[si] = word?.start ?? next;
		next = spanStart[si];
	}

	return { segs, spanStart, text: out };
};

/** Contiguous run of segs sharing the same kind — used for sweep rendering to preserve mark wrappers. */
export interface SegRun {
	kind: SegKind;
	segs: Seg[];
}

/** Groups segs by kind so a multi-word `code token` stays inside one <code> wrapper during the sweep. */
export const segRuns = (segs: Seg[]): SegRun[] => {
	const runs: SegRun[] = [];
	for (const seg of segs) {
		const last = runs[runs.length - 1];
		if (last && last.kind === seg.kind) last.segs.push(seg);
		else runs.push({ kind: seg.kind, segs: [seg] });
	}
	return runs;
};

/** Plain narration text for a paragraph — the exact string sent to TTS. */
export const paragraphText = (para: Paragraph<unknown>): string => paragraphAnchors(para).text;
