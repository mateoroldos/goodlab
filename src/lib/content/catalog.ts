import type { Episode } from '$lib/episode.js';
import { series as jsFundamentals } from './series/javascript-fundamentals/series.js';

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

interface SeriesDef extends Series {
	loadEpisode: (slug: string) => Promise<Episode | undefined>;
}

const allSeries: SeriesDef[] = [jsFundamentals];

export const series: Series[] = allSeries;

export const findSeries = (slug: string): Series | undefined =>
	allSeries.find((s) => s.slug === slug);

export const loadEpisode = async (
	seriesSlug: string,
	episodeSlug: string
): Promise<Episode | undefined> => {
	const s = allSeries.find((s) => s.slug === seriesSlug);
	return s?.loadEpisode(episodeSlug);
};

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
