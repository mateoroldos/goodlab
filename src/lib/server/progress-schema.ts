import { integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { user } from './auth-schema';

/**
 * One row per (user, episode). Absent row = untouched, null `completed_at` =
 * in progress. Series completion is derived from the catalog at read time —
 * never stored, so adding episodes to a series can't leave stale state.
 * Timestamps are epoch milliseconds, matching the client-side records.
 */
export const episodeProgress = sqliteTable(
	'episode_progress',
	{
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		seriesSlug: text('series_slug').notNull(),
		episodeSlug: text('episode_slug').notNull(),
		startedAt: integer('started_at').notNull(),
		completedAt: integer('completed_at')
	},
	(t) => [primaryKey({ columns: [t.userId, t.seriesSlug, t.episodeSlug] })]
);
