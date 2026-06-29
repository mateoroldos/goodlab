<script lang="ts">
	import { page } from '$app/state';
	import { themeContext, themes } from '$lib/themes/theme.svelte.js';
	import YoutubeMusic from '$lib/components/youtube-music/youtube-music.svelte';

	const theme = themeContext.get();
</script>

<footer class="fixed bottom-6 left-6 z-40 flex items-center gap-2">
	<label for="theme-select" class="sr-only">Theme</label>
	<select
		id="theme-select"
		class="h-10 rounded-full border border-border bg-card px-4 pr-8 font-mono text-xs text-foreground shadow-sm outline-none transition-colors hover:bg-muted/70 focus-visible:ring-2 focus-visible:ring-ring"
		value={theme.id}
		onchange={(e) => theme.select(e.currentTarget.value)}
	>
		{#each themes as option (option.id)}
			<option value={option.id}>{option.label}</option>
		{/each}
	</select>
</footer>

{#if page.url.pathname !== '/'}
	<footer
		class="fixed bottom-6 right-6 z-40 flex rounded-full border border-border bg-card p-1 shadow-sm"
	>
		<YoutubeMusic class="size-10" />
	</footer>
{/if}
