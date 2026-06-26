<script lang="ts">
	import EpisodePlayer from '$lib/components/episode-player/episode-player.svelte';
	import type { PageData } from './$types';

	const { data }: { data: PageData } = $props();
</script>

{#key data.episode.slug}
	<EpisodePlayer episode={data.episode} nextEpisode={data.nextEpisode} series={data.series} />
{/key}
