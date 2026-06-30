<script lang="ts" module>
	export type StopState = 'done' | 'done-sibling' | 'current' | 'upcoming-sibling' | 'upcoming';

	type Item = {
		id: string;
		state: StopState;
		connectedToNext: boolean;
	};
</script>

<script lang="ts">
	import { ArrowUpIcon, ArrowDownIcon } from 'phosphor-svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { playerContext } from '$lib/player.svelte.js';
	import { episodeNavigationContext } from './episode-navigation.svelte.js';
	import StopNode from './stop-node.svelte';
	import { chapterStops } from '$lib/episode.js';

	const player = playerContext.get();
	const navigation = episodeNavigationContext.get();

	function resolveState(ci: number, si: number): StopState {
		const isCurrentChapter = ci === player.chapterIdx;
		if (isCurrentChapter) {
			if (si < player.stopIdx) return 'done-sibling';
			if (si === player.stopIdx) return 'current';
			return 'upcoming-sibling';
		}
		return ci < player.chapterIdx ? 'done' : 'upcoming';
	}

	// Connected runs mirror the text: dots joined by a line are stops of the
	// same paragraph; gaps separate paragraphs (and chapters).
	const items = $derived.by((): Item[] =>
		player.chapters.flatMap((chapter, ci) => {
			const stops = chapterStops(chapter);
			return stops.map((stop, si) => ({
				id: `${ci}-${si}`,
				state: resolveState(ci, si),
				connectedToNext: stops[si + 1]?.paragraphIdx === stop.paragraphIdx
			}));
		})
	);
</script>

<div class="flex w-12 shrink-0 flex-col border-r border-border">
	<div class="flex flex-col items-center gap-1.5 p-2">
		<Button
			variant="outline"
			size="icon-sm"
			disabled={!player.canGoPrev}
			onclick={navigation.prev}
			aria-label="Previous stop"
		>
			<ArrowUpIcon />
		</Button>
		<Button
			variant="outline"
			size="icon-sm"
			disabled={!player.canGoNext}
			onclick={navigation.next}
			aria-label="Next stop"
		>
			<ArrowDownIcon />
		</Button>
	</div>

	<div class="flex-1 overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden">
		<!-- eslint-disable-next-line better-tailwindcss/no-restricted-classes -- py-[50dvh] gives enough runway so scrollIntoView can center the first and last items -->
		<div class="flex flex-col items-center py-[50dvh]">
			{#each items as item (item.id)}
				<StopNode state={item.state} connectedToNext={item.connectedToNext} />
			{/each}
		</div>
	</div>
</div>
