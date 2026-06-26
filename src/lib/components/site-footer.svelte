<script lang="ts">
	import { page } from '$app/state';
	import YoutubeMusic from '$lib/components/youtube-music/youtube-music.svelte';
</script>

{#if page.url.pathname !== '/'}
	<footer
		class="fixed bottom-6 right-6 z-40 flex rounded-full border border-border bg-card p-1 shadow-sm"
	>
		<YoutubeMusic class="size-10" />
	</footer>
{/if}
