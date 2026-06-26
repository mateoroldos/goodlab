<script lang="ts">
	import { onMount } from 'svelte';
	import { cn } from '$lib/utils.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { shortcutContext } from '$lib/shortcuts/shortcut-registry.svelte.js';
	import YouTubeMusicControls from './youtube-music-controls.svelte';
	import YouTubeMusicPlaylist from './youtube-music-playlist.svelte';
	import YouTubeMusicTrigger from './youtube-music-trigger.svelte';
	import { player } from './player-singleton.svelte.js';

	const { class: className = 'size-14' }: { class?: string } = $props();

	const shortcuts = shortcutContext.get();

	const handleMenuKeydown = (event: KeyboardEvent) => {
		const idx = Number(event.key) - 1;

		if (!Number.isInteger(idx) || idx < 0 || idx >= player.tracks.length) return;

		event.preventDefault();
		event.stopPropagation();
		player.load(idx);
	};

	onMount(() =>
		shortcuts.register([
			{
				key: 'm',
				description: 'Open music player',
				run: () => {
					player.discOpen = !player.discOpen;
				}
			}
		])
	);
</script>

<DropdownMenu.Root bind:open={player.discOpen}>
	<DropdownMenu.Trigger
		class={cn(
			'relative cursor-pointer overflow-hidden rounded-full bg-transparent p-0 ring-1 ring-border transition-shadow duration-200 hover:ring-ring',
			className
		)}
		style="view-transition-name: music-disc"
	>
		<YouTubeMusicTrigger
			isPlaying={player.isPlaying}
			hasSelected={player.hasSelected}
			thumb={player.thumb}
		/>
		<span class="sr-only">Open music player</span>
	</DropdownMenu.Trigger>

	<DropdownMenu.Content class="w-64" align="end" side="top" onkeydown={handleMenuKeydown}>
		<div class="px-2 py-2">
			<p class="text-xs font-medium">{player.track.title}</p>
			<p class="text-xs text-muted-foreground">{player.track.artist}</p>
		</div>

		<DropdownMenu.Separator />

		<YouTubeMusicControls
			isPlaying={player.isPlaying}
			onPrev={player.prev}
			onToggle={player.toggle}
			onNext={player.next}
		/>

		<DropdownMenu.Separator />

		<YouTubeMusicPlaylist
			tracks={player.tracks}
			currentIdx={player.currentIdx}
			thumbnailFor={player.thumbnailFor}
			onSelect={player.load}
		/>
	</DropdownMenu.Content>
</DropdownMenu.Root>
