import { findSeries } from '$lib/content/catalog.js';
import { error } from '@sveltejs/kit';

import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
	const series = findSeries(params.slug);
	if (!series) error(404, 'Series not found');

	return { series };
};
