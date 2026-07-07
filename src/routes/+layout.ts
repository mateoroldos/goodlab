import { getProgress } from '$lib/progress/progress.remote.js';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ data }) => ({
	...data,
	// Awaited here (not in a component) so signed-in progress marks are
	// server-rendered without enabling Svelte's experimental async mode.
	progress: data.user ? await getProgress() : []
});
