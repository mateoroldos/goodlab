import type { Episode } from '$lib/episode.js';

export interface EpisodeSummary {
	slug: string;
	title: string;
	description: string;
}

export interface SeriesSummary {
	slug: string;
	title: string;
	description: string;
}

export interface Series extends SeriesSummary {
	episodes: EpisodeSummary[];
}

/** Shape each series.ts file must export. Slug is derived from the directory name. */
export interface SeriesMeta {
	title: string;
	description: string;
}

const seriesModules = import.meta.glob<SeriesMeta>('./series/*/series.ts', {
	import: 'series',
	eager: true
});

const episodeModules = import.meta.glob<Episode>('./series/*/episodes/*/episode.ts', {
	import: 'episode',
	eager: true
});

// Glob order is non-deterministic — always sort keys.
const sortedEpisodes = Object.entries(episodeModules).sort(([a], [b]) => a.localeCompare(b));

const pathSlug = (path: string): string => {
	const slug = path.split('/').at(-2);
	if (!slug) throw new Error(`Unexpected glob path shape: ${path}`);
	return slug;
};

const allSeries: Series[] = Object.entries(seriesModules)
	.sort(([a], [b]) => a.localeCompare(b))
	.map(([seriesPath, { title, description }]) => {
		const slug = pathSlug(seriesPath);
		const episodes = sortedEpisodes
			.filter(([p]) => p.startsWith(`./series/${slug}/`))
			.map(([p, ep]) => ({ slug: pathSlug(p), title: ep.title, description: ep.description }));
		return { slug, title, description, episodes };
	});

export const series: Series[] = allSeries;

export const findSeries = (slug: string): Series | undefined =>
	allSeries.find((s) => s.slug === slug);

export const loadEpisode = async (
	seriesSlug: string,
	episodeSlug: string
): Promise<Episode | undefined> =>
	episodeModules[`./series/${seriesSlug}/episodes/${episodeSlug}/episode.ts`];

export const findEpisodeNeighbors = (
	seriesSlug: string,
	episodeSlug: string
): { previousEpisode?: EpisodeSummary; nextEpisode?: EpisodeSummary } => {
	const s = allSeries.find((s) => s.slug === seriesSlug);
	if (!s) return {};

	const idx = s.episodes.findIndex((e) => e.slug === episodeSlug);
	if (idx === -1) return {};

	return {
		previousEpisode: s.episodes[idx - 1],
		nextEpisode: s.episodes[idx + 1]
	};
};
