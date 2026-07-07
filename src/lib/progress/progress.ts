import { Context } from 'runed';
import type { Series } from '$lib/content/catalog.js';

/** A progress record always means the reader at least started the episode. */
export type RecordedStatus = 'started' | 'completed';

/** No record = untouched. No boolean flags. */
export type EpisodeStatus = RecordedStatus | 'untouched';

/**
 * One episode a reader has touched — the wire shape between the layout
 * load and the tracker. Timestamps stay on the server; the client only
 * ever needs the status.
 */
export interface EpisodeProgress {
	readonly seriesSlug: string;
	readonly episodeSlug: string;
	readonly status: RecordedStatus;
}

/**
 * Seam the UI talks to — D1 through remote functions when signed in,
 * a no-op for anonymous readers.
 */
export interface ProgressTracker {
	status(seriesSlug: string, episodeSlug: string): EpisodeStatus;
	markStarted(seriesSlug: string, episodeSlug: string): void;
	markCompleted(seriesSlug: string, episodeSlug: string): void;
}

/** Anonymous readers: nothing is recorded until they sign in. */
export const noProgress: ProgressTracker = {
	status: () => 'untouched',
	markStarted: () => {},
	markCompleted: () => {}
};

export const episodeKey = (seriesSlug: string, episodeSlug: string): string =>
	`${seriesSlug}/${episodeSlug}`;

/** Series completion is always derived from the catalog — never stored. */
export const completedCount = (tracker: ProgressTracker, series: Series): number =>
	series.episodes.filter((e) => tracker.status(series.slug, e.slug) === 'completed').length;

export const progressContext = new Context<ProgressTracker>('progress');
