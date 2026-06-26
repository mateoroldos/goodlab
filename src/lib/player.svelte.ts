import { Context } from 'runed';
import type { Episode, ChapterConfig, Step, Phase } from './episode.js';

export class Player {
	readonly #getEpisode: () => Episode;

	chapterIdx = $state(0);
	stepIdx = $state(0);
	phaseIdx = $state(0);

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
	get step(): Step<any> {
		return this.chapter.steps[this.stepIdx];
	}
	get phase(): Phase<any> {
		return this.step.phases[this.phaseIdx];
	}

	get chapterCount(): number {
		return this.#episode.chapters.length;
	}
	get stepCount(): number {
		return this.chapter.steps.length;
	}
	get phaseCount(): number {
		return this.step.phases.length;
	}
	get episodePhaseCount(): number {
		return this.#episode.chapters.reduce(
			(count, chapter) => count + chapter.steps.reduce((sum, step) => sum + step.phases.length, 0),
			0
		);
	}
	get episodePhaseIdx(): number {
		const completedChapters = this.#episode.chapters
			.slice(0, this.chapterIdx)
			.reduce(
				(count, chapter) =>
					count + chapter.steps.reduce((sum, step) => sum + step.phases.length, 0),
				0
			);
		const completedSteps = this.chapter.steps
			.slice(0, this.stepIdx)
			.reduce((count, step) => count + step.phases.length, 0);

		return completedChapters + completedSteps + this.phaseIdx;
	}
	get episodeProgress(): { index: number; count: number; percent: number } {
		const count = this.episodePhaseCount;
		const index = this.episodePhaseIdx;
		const percent = count <= 1 ? 100 : (index / (count - 1)) * 100;

		return { index, count, percent };
	}

	get canGoNext(): boolean {
		return (
			this.phaseIdx < this.step.phases.length - 1 ||
			this.stepIdx < this.chapter.steps.length - 1 ||
			this.chapterIdx < this.#episode.chapters.length - 1
		);
	}

	get canGoPrev(): boolean {
		return this.phaseIdx > 0 || this.stepIdx > 0 || this.chapterIdx > 0;
	}

	next = () => {
		if (this.phaseIdx < this.step.phases.length - 1) {
			this.phaseIdx += 1;
		} else if (this.stepIdx < this.chapter.steps.length - 1) {
			this.phaseIdx = 0;
			this.stepIdx += 1;
		} else if (this.chapterIdx < this.#episode.chapters.length - 1) {
			this.phaseIdx = 0;
			this.stepIdx = 0;
			this.chapterIdx += 1;
		}
	};

	prev = () => {
		if (this.phaseIdx > 0) {
			this.phaseIdx -= 1;
		} else if (this.stepIdx > 0) {
			this.stepIdx -= 1;
			this.phaseIdx = this.step.phases.length - 1;
		} else if (this.chapterIdx > 0) {
			this.chapterIdx -= 1;
			this.stepIdx = this.chapter.steps.length - 1;
			this.phaseIdx = this.step.phases.length - 1;
		}
	};
}

export const playerContext = new Context<Player>('player');
