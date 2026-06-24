import type { Episode } from '$lib/episode.js';
import { error } from '@sveltejs/kit';

import type { PageLoad } from './$types';

const registry: Record<string, () => Promise<{ episode: Episode }>> = {
	'01-test': () => import('$lib/episodes/01-test/episode.js')
};

export const load: PageLoad = async ({ params }) => {
	const loader = registry[params.slug];
	if (!loader) {
		error(404, 'Episode not found');
	}
	const { episode } = await loader();
	return { episode };
};
