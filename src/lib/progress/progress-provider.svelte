<script lang="ts">
	import type { Snippet } from 'svelte';
	import { RemoteProgress } from './remote-progress.svelte.js';
	import { noProgress, progressContext, type EpisodeProgress } from './progress.js';

	interface Props {
		signedIn: boolean;
		initial: readonly EpisodeProgress[];
		children: Snippet;
	}

	const { signedIn, initial, children }: Props = $props();

	// Rebuilt on login, logout or invalidation — `initial` is always a fresh
	// server snapshot when the layout data changes.
	const tracker = $derived(signedIn ? new RemoteProgress(initial) : noProgress);

	// Context is set once at init but the tracker swaps with auth state, so
	// consumers get a stable object that delegates to the active tracker.
	progressContext.set({
		status: (seriesSlug, episodeSlug) => tracker.status(seriesSlug, episodeSlug),
		markStarted: (seriesSlug, episodeSlug) => tracker.markStarted(seriesSlug, episodeSlug),
		markCompleted: (seriesSlug, episodeSlug) => tracker.markCompleted(seriesSlug, episodeSlug)
	});
</script>

{@render children()}
