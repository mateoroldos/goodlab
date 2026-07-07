import {
	episodeKey,
	type EpisodeProgress,
	type EpisodeStatus,
	type ProgressTracker,
	type RecordedStatus
} from './progress.js';
import { markEpisodeCompleted, markEpisodeStarted } from './progress.remote.js';

const logSyncError = (err: unknown) => console.error('progress sync failed', err);

/**
 * D1-backed tracker for signed-in readers. Seeded from the layout load so
 * marks are server-rendered; marks update the map optimistically and sync
 * through remote commands fire-and-forget — progress is not worth blocking
 * the reading flow over.
 */
export class RemoteProgress implements ProgressTracker {
	#statuses = $state<Record<string, RecordedStatus>>({});

	constructor(initial: readonly EpisodeProgress[]) {
		for (const { seriesSlug, episodeSlug, status } of initial) {
			this.#statuses[episodeKey(seriesSlug, episodeSlug)] = status;
		}
	}

	status(seriesSlug: string, episodeSlug: string): EpisodeStatus {
		return this.#statuses[episodeKey(seriesSlug, episodeSlug)] ?? 'untouched';
	}

	markStarted(seriesSlug: string, episodeSlug: string): void {
		const key = episodeKey(seriesSlug, episodeSlug);
		if (this.#statuses[key]) return;

		this.#statuses[key] = 'started';
		void markEpisodeStarted({ seriesSlug, episodeSlug }).catch(logSyncError);
	}

	markCompleted(seriesSlug: string, episodeSlug: string): void {
		const key = episodeKey(seriesSlug, episodeSlug);
		if (this.#statuses[key] === 'completed') return;

		this.#statuses[key] = 'completed';
		void markEpisodeCompleted({ seriesSlug, episodeSlug }).catch(logSyncError);
	}
}
