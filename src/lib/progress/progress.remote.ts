import { command, getRequestEvent, query } from '$app/server';
import { error } from '@sveltejs/kit';
import { eq, sql } from 'drizzle-orm';
import { findSeries } from '$lib/content/catalog.js';
import { createDb } from '$lib/server/db';
import { episodeProgress } from '$lib/server/progress-schema';
import type { EpisodeProgress } from './progress.js';

export interface EpisodeRef {
	seriesSlug: string;
	episodeSlug: string;
}

// Commands are HTTP endpoints — parse by hand instead of trusting the
// declared input types, and only accept episodes that exist in the catalog.
const parseRef = (input: unknown): EpisodeRef => {
	if (typeof input !== 'object' || input === null) error(400, 'Expected an episode reference');
	const { seriesSlug, episodeSlug } = input as Record<string, unknown>;
	if (typeof seriesSlug !== 'string' || typeof episodeSlug !== 'string')
		error(400, 'Expected an episode reference');

	const series = findSeries(seriesSlug);
	if (!series?.episodes.some((e) => e.slug === episodeSlug)) error(400, 'Unknown episode');
	return { seriesSlug, episodeSlug };
};

const requireContext = () => {
	const { locals, platform } = getRequestEvent();
	if (!locals.user) error(401, 'Sign in to sync progress');
	if (!platform?.env) error(500, 'Database unavailable');
	return { userId: locals.user.id, db: createDb(platform.env.DB) };
};

/** All progress records for the signed-in reader; empty when anonymous. */
export const getProgress = query(async (): Promise<EpisodeProgress[]> => {
	const { locals, platform } = getRequestEvent();
	if (!locals.user || !platform?.env) return [];

	const db = createDb(platform.env.DB);
	const rows = await db
		.select()
		.from(episodeProgress)
		.where(eq(episodeProgress.userId, locals.user.id));

	return rows.map((row) => ({
		seriesSlug: row.seriesSlug,
		episodeSlug: row.episodeSlug,
		status: row.completedAt === null ? 'started' : 'completed'
	}));
});

export const markEpisodeStarted = command('unchecked', async (input: EpisodeRef) => {
	const ref = parseRef(input);
	const { userId, db } = requireContext();

	// First visit wins — remounting an episode never resets startedAt.
	await db
		.insert(episodeProgress)
		.values({ userId, ...ref, startedAt: Date.now() })
		.onConflictDoNothing();
});

export const markEpisodeCompleted = command('unchecked', async (input: EpisodeRef) => {
	const ref = parseRef(input);
	const { userId, db } = requireContext();

	const now = Date.now();
	await db
		.insert(episodeProgress)
		.values({ userId, ...ref, startedAt: now, completedAt: now })
		.onConflictDoUpdate({
			target: [episodeProgress.userId, episodeProgress.seriesSlug, episodeProgress.episodeSlug],
			set: {
				// Earliest completion wins — repeat finishes never move the date.
				completedAt: sql`coalesce(${episodeProgress.completedAt}, excluded.completed_at)`
			}
		});
});
