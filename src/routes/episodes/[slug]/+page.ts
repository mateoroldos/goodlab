import { findEpisodeNeighbors, findEpisodeSeries, loadEpisode } from '$lib/content/catalog.js';
import { error } from '@sveltejs/kit';

import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
	const episode = await loadEpisode(params.slug);
	if (!episode) error(404, 'Episode not found');

	return {
		episode,
		series: findEpisodeSeries(params.slug),
		...findEpisodeNeighbors(params.slug)
	};
};
