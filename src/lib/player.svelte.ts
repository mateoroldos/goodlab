import { Context } from 'runed';
import type { Episode, SceneConfig, Step, Phase } from './episode.js';

export class Player {
	readonly #getEpisode: () => Episode;

	sceneIdx = $state(0);
	stepIdx = $state(0);
	phaseIdx = $state(0);

	constructor(getEpisode: () => Episode) {
		this.#getEpisode = getEpisode;
	}

	get #episode(): Episode {
		return this.#getEpisode();
	}

	get scene(): SceneConfig {
		return this.#episode.scenes[this.sceneIdx];
	}
	get scenes(): SceneConfig[] {
		return this.#episode.scenes;
	}
	get step(): Step<any> {
		return this.scene.steps[this.stepIdx];
	}
	get phase(): Phase<any> {
		return this.step.phases[this.phaseIdx];
	}

	get sceneCount(): number {
		return this.#episode.scenes.length;
	}
	get stepCount(): number {
		return this.scene.steps.length;
	}
	get phaseCount(): number {
		return this.step.phases.length;
	}
	get episodePhaseCount(): number {
		return this.#episode.scenes.reduce(
			(count, scene) => count + scene.steps.reduce((sum, step) => sum + step.phases.length, 0),
			0
		);
	}
	get episodePhaseIdx(): number {
		const completedScenes = this.#episode.scenes
			.slice(0, this.sceneIdx)
			.reduce(
				(count, scene) => count + scene.steps.reduce((sum, step) => sum + step.phases.length, 0),
				0
			);
		const completedSteps = this.scene.steps
			.slice(0, this.stepIdx)
			.reduce((count, step) => count + step.phases.length, 0);

		return completedScenes + completedSteps + this.phaseIdx;
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
			this.stepIdx < this.scene.steps.length - 1 ||
			this.sceneIdx < this.#episode.scenes.length - 1
		);
	}

	get canGoPrev(): boolean {
		return this.phaseIdx > 0 || this.stepIdx > 0 || this.sceneIdx > 0;
	}

	next = () => {
		if (this.phaseIdx < this.step.phases.length - 1) {
			this.phaseIdx += 1;
		} else if (this.stepIdx < this.scene.steps.length - 1) {
			this.phaseIdx = 0;
			this.stepIdx += 1;
		} else if (this.sceneIdx < this.#episode.scenes.length - 1) {
			this.phaseIdx = 0;
			this.stepIdx = 0;
			this.sceneIdx += 1;
		}
	};

	prev = () => {
		if (this.phaseIdx > 0) {
			this.phaseIdx -= 1;
		} else if (this.stepIdx > 0) {
			this.stepIdx -= 1;
			this.phaseIdx = this.step.phases.length - 1;
		} else if (this.sceneIdx > 0) {
			this.sceneIdx -= 1;
			this.stepIdx = this.scene.steps.length - 1;
			this.phaseIdx = this.step.phases.length - 1;
		}
	};
}

export const playerContext = new Context<Player>('player');
