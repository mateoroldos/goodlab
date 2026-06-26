import type { Episode } from '$lib/episode.js';

export const series = {
	slug: 'javascript-fundamentals',
	title: 'JavaScript Fundamentals',
	description: 'Small JavaScript fundamentals explained through visual code states.',
	episodes: [
		{
			slug: '01-const-vs-let',
			title: 'const vs let',
			description: "JavaScript's two variable declarations."
		},
		{
			slug: '02-functions',
			title: 'functions',
			description: 'How functions package reusable behavior.'
		}
	],
	loadEpisode: async (slug: string): Promise<Episode | undefined> => {
		const loaders: Record<string, () => Promise<{ episode: Episode }>> = {
			'01-const-vs-let': () => import('./episodes/01-const-vs-let.js'),
			'02-functions': () => import('./episodes/02-functions.js')
		};
		const load = loaders[slug];
		if (!load) return undefined;
		return (await load()).episode;
	}
};
