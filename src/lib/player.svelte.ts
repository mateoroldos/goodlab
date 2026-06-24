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
