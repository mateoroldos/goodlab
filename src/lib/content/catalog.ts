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

type EpisodeModule = {
	episode: Episode;
};

const episodeLoaders: Record<string, () => Promise<EpisodeModule>> = {
	'01-test': () => import('$lib/episodes/01-test/episode.js'),
	'02-functions': () => import('$lib/episodes/02-functions/episode.js')
};

export const series: Series[] = [
	{
		description: 'Small JavaScript fundamentals explained through visual code states.',
		episodes: [
			{
				description: "JavaScript's two variable declarations.",
				slug: '01-test',
				title: 'const vs let'
			},
			{
				description: 'How functions package reusable behavior.',
				slug: '02-functions',
				title: 'functions'
			}
		],
		slug: 'javascript-fundamentals',
		title: 'JavaScript Fundamentals'
	}
];

export const episodes = series.flatMap((item) => item.episodes);

export const loadEpisode = async (slug: string): Promise<Episode | undefined> => {
	const load = episodeLoaders[slug];
	if (!load) return undefined;

	const mod = await load();
	return mod.episode;
};

export const findSeries = (slug: string): Series | undefined =>
	series.find((item) => item.slug === slug);

export const findEpisodeSeries = (slug: string): Series | undefined =>
	series.find((item) => item.episodes.some((episode) => episode.slug === slug));

export const findEpisodeNeighbors = (
	slug: string
): { previousEpisode?: EpisodeSummary; nextEpisode?: EpisodeSummary } => {
	const owner = findEpisodeSeries(slug);
	if (!owner) return {};

	const index = owner.episodes.findIndex((episode) => episode.slug === slug);
	if (index === -1) return {};

	return {
		previousEpisode: owner.episodes[index - 1],
		nextEpisode: owner.episodes[index + 1]
	};
};
