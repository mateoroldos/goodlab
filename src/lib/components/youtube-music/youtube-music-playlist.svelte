<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { Kbd } from '$lib/components/ui/kbd/index.js';
	import type { Track } from './youtube-music-player.svelte.js';

	const {
		tracks,
		currentIdx,
		thumbnailFor,
		onSelect
	}: {
		tracks: readonly Track[];
		currentIdx: number;
		thumbnailFor: (track: Track) => string;
		onSelect: (idx: number) => void;
	} = $props();
</script>

{#each tracks as track, idx (track.id)}
	<DropdownMenu.Item
		class={idx === currentIdx ? 'bg-accent text-accent-foreground' : undefined}
		onclick={() => onSelect(idx)}
	>
		<div class="relative size-8 shrink-0 overflow-hidden rounded-full">
			<img src={thumbnailFor(track)} alt="" class="size-full object-cover" />
			<div
				class="absolute inset-0 m-auto size-2 rounded-full bg-background/80 ring-1 ring-border/40"
			></div>
		</div>

		<div class="flex min-w-0 flex-1 flex-col gap-0.5">
			<span class="text-xs font-medium leading-tight">{track.title}</span>
			<span class="text-xs text-muted-foreground">{track.artist}</span>
		</div>

		<Kbd class="ml-auto">{idx + 1}</Kbd>
	</DropdownMenu.Item>
{/each}
