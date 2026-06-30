import { Context } from 'runed';
import {
	chapterStops,
	stateAtEntry,
	stateAtStop,
	type ChapterConfig,
	type Episode,
	type Stop
} from './episode.js';

export type PlayerMode = 'read' | 'listen';

export class Player {
	readonly #getEpisode: () => Episode;

	mode: PlayerMode = $state('read');
	chapterIdx = $state(0);
	/** Current stop. `-1` means "before the chapter's first stop" (listen mode only). */
	stopIdx = $state(0);
	/**
	 * Listen mode's fine-grained cursor into `chapterTimeline` — lets at-spans
	 * fire mid-sentence at their word. `-1` means "before the first entry".
	 * Owned by the narrator; ignored in read mode.
	 */
	cursor = $state(-1);

	constructor(getEpisode: () => Episode) {
		this.#getEpisode = getEpisode;
	}

	get #episode(): Episode {
		return this.#getEpisode();
	}

	get chapter(): ChapterConfig {
		return this.#episode.chapters[this.chapterIdx];
	}

	get chapters(): ChapterConfig[] {
		return this.#episode.chapters;
	}

	stops: Array<Stop<any>> = $derived(chapterStops(this.chapter));

	get stop(): Stop<any> | undefined {
		return this.stops[this.stopIdx];
	}

	/**
	 * Current folded scene state. Read mode folds through the current stop and
	 * the at-spans in its reach; listen mode follows the narrator's cursor so
	 * at-spans land on their exact word.
	 */
	state: any = $derived(
		this.mode === 'listen'
			? stateAtEntry(this.chapter, this.cursor)
			: stateAtStop(this.chapter, this.stopIdx)
	);

	get paragraphIdx(): number {
		return this.stop?.paragraphIdx ?? 0;
	}

	get canGoNext(): boolean {
		return (
			this.stopIdx < this.stops.length - 1 || this.chapterIdx < this.#episode.chapters.length - 1
		);
	}

	get canGoPrev(): boolean {
		return this.stopIdx > 0 || this.chapterIdx > 0;
	}

	/** True on the episode's last stop — drives the end-of-episode UI. */
	get isComplete(): boolean {
		return !this.canGoNext;
	}

	next = () => {
		if (this.stopIdx < this.stops.length - 1) {
			this.stopIdx += 1;
		} else if (this.chapterIdx < this.#episode.chapters.length - 1) {
			this.chapterIdx += 1;
			this.stopIdx = 0;
		}
	};

	prev = () => {
		if (this.stopIdx > 0) {
			this.stopIdx -= 1;
		} else if (this.chapterIdx > 0) {
			this.chapterIdx -= 1;
			// stops re-derives from the new chapter — read it after the assignment.
			this.stopIdx = this.stops.length - 1;
		}
	};
}

export const playerContext = new Context<Player>('player');
