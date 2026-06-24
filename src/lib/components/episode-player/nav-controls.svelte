<script lang="ts">
	import { onDestroy } from 'svelte';
	import { playerContext } from '$lib/player.svelte.js';
	import { shortcutContext } from '$lib/shortcuts/shortcut-registry.svelte.js';
	import { episodeNavigationContext } from './episode-navigation.svelte.js';

	const player = playerContext.get();
	const navigation = episodeNavigationContext.get();
	const shortcuts = shortcutContext.get();
	const progress = $derived(player.episodeProgress);

	onDestroy(
		shortcuts.register([
			{
				key: 'j',
				description: 'Next step',
				when: () => player.canGoNext,
				run: navigation.next
			},
			{
				key: 'k',
				description: 'Previous step',
				when: () => player.canGoPrev,
				run: navigation.prev
			}
		])
	);
</script>

<footer
	class="grid shrink-0 grid-cols-[1fr_auto_1fr] items-center border-t border-primary/30 bg-background/95 px-3 py-2 font-mono text-xs shadow-[0_-1px_0_hsl(var(--primary)/0.12)]"
>
	<div class="flex items-center gap-2 text-primary">
		<span class="bg-primary px-2 py-1 font-semibold text-primary-foreground">NORMAL</span>
		<span class="hidden text-muted-foreground sm:inline">goodlab://episode</span>
	</div>

	<div class="justify-self-center text-muted-foreground">k/j</div>

	<div
		class="flex items-center justify-end gap-3 text-muted-foreground"
		role="progressbar"
		aria-label="Episode progress"
		aria-valuemin="1"
		aria-valuemax={progress.count}
		aria-valuenow={progress.index + 1}
	>
		<span>{progress.index + 1}/{progress.count}</span>
		<span class="text-primary">{Math.round(progress.percent)}%</span>
	</div>
</footer>
