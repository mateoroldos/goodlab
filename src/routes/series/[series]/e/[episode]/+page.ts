import { findSeries, findEpisodeNeighbors, loadEpisode } from '$lib/content/catalog.js';
import { error } from '@sveltejs/kit';

import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
	const s = findSeries(params.series);
	if (!s) error(404, 'Series not found');

	const episode = await loadEpisode(params.series, params.episode);
	if (!episode) error(404, 'Episode not found');

	return {
		episode,
		series: s,
		...findEpisodeNeighbors(params.series, params.episode)
	};
};
