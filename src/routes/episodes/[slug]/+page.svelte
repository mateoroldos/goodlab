<script lang="ts">
	import EpisodePlayer from '$lib/components/episode-player/episode-player.svelte';
	import type { PageData } from './$types';

	const { data }: { data: PageData } = $props();
</script>

<EpisodePlayer episode={data.episode} />
