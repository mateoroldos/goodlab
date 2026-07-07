<script lang="ts">
	import { onMount } from 'svelte';
	import { CaretDownIcon } from 'phosphor-svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { Player, playerContext } from '$lib/player.svelte.js';
	import type { Episode } from '$lib/episode.js';
	import type { EpisodeSummary, Series } from '$lib/content/catalog.js';
	import { hasNarration } from '$lib/narration/clips.js';
	import { manifest } from '$lib/narration/manifest.js';
	import { Narrator, narratorContext } from '$lib/narration/narrator.svelte.js';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import { Kbd } from '$lib/components/ui/kbd/index.js';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
	import { progressContext } from '$lib/progress/progress.js';
	import { soundContext } from '$lib/sounds/sound-effects.svelte.js';
	import { shortcutContext } from '$lib/shortcuts/shortcut-registry.svelte.js';
	import Narration from './narration.svelte';
	import ListenPill from './listen-pill.svelte';
	import ChapterCanvas from './chapter-canvas.svelte';
	import ProgressRail from './progress-rail.svelte';
	import {
		createEpisodeNavigation,
		episodeNavigationContext
	} from './episode-navigation.svelte.js';

	interface Props {
		episode: Episode;
		nextEpisode?: EpisodeSummary;
		series?: Series;
	}
	const { episode, nextEpisode, series }: Props = $props();

	const player = new Player(() => episode);
	const narrator = new Narrator(player, manifest, () => ({
		series: series?.slug,
		episode: episode.slug
	}));
	const sounds = soundContext.get();
	const shortcuts = shortcutContext.get();
	const progress = progressContext.get();

	// Sync progress to storage. Completion can arrive from read mode (keypress)
	// or listen mode (narrator advancing), so watch the player's derived flag.
	$effect(() => {
		if (series && player.isComplete) progress.markCompleted(series.slug, episode.slug);
	});

	playerContext.set(player);
	narratorContext.set(narrator);

	const navigation = createEpisodeNavigation(player, sounds);
	episodeNavigationContext.set(navigation);

	const narrationAvailable = $derived(hasNarration(manifest, series?.slug, episode.slug));

	let episodeMenuOpen = $state(false);
	const openEpisodeMenu = () => {
		if (series && !narrator.listening) episodeMenuOpen = true;
	};
	const episodeShortcuts = $derived(
		series?.episodes.slice(0, 9).map((item, idx) => ({
			key: String(idx + 1),
			description: `Episode ${idx + 1}`,
			when: () => episodeMenuOpen,
			run: () => void goto(resolve(`/series/${series?.slug}/e/${item.slug}`))
		})) ?? []
	);

	onMount(() => {
		if (series) progress.markStarted(series.slug, episode.slug);

		const unregister = shortcuts.register([
			{
				key: 'j',
				description: 'Next stop',
				when: () => player.canGoNext && !narrator.listening,
				run: () => navigation.next()
			},
			{
				key: 'k',
				description: 'Previous stop',
				when: () => player.canGoPrev && !narrator.listening,
				run: () => navigation.prev()
			},
			{
				key: 'e',
				description: 'Open episode menu',
				when: () => Boolean(series) && !episodeMenuOpen && !narrator.listening,
				run: openEpisodeMenu
			},
			{
				key: ' ',
				description: 'Listen / pause',
				// Matches the pill's visibility — no invisible listen mode on the completed screen.
				when: () =>
					narrationAvailable && !episodeMenuOpen && (narrator.listening || !player.isComplete),
				run: () => {
					if (!narrator.listening) narrator.start();
					else narrator.toggle();
				}
			},
			{
				key: 'Escape',
				description: 'Exit listen / back to series',
				when: () => narrator.listening || (player.isComplete && !nextEpisode && Boolean(series)),
				run: () => {
					if (narrator.listening) narrator.exit();
					else if (series) void goto(resolve(`/series/${series.slug}`));
				}
			},
			{
				key: 'h',
				description: 'Home',
				when: () => player.isComplete && !nextEpisode && !narrator.listening,
				run: () => void goto(resolve('/'))
			},
			{
				key: 'Enter',
				description: 'Next episode',
				when: () => player.isComplete && Boolean(nextEpisode) && !narrator.listening,
				run: () => {
					if (nextEpisode) void goto(resolve(`/series/${series?.slug}/e/${nextEpisode.slug}`));
				}
			},
			...episodeShortcuts
		]);
		return () => {
			unregister();
			narrator.destroy();
		};
	});
</script>

<div class="flex h-full flex-col bg-background text-foreground">
	<header class="flex shrink-0 items-center border-b border-border px-6 py-3">
		<div class="flex min-w-0 items-center gap-3">
			<Breadcrumb.Root>
				<Breadcrumb.List>
					{#if series}
						<Breadcrumb.Item>
							<Breadcrumb.Link
								class="text-sm font-medium text-foreground"
								href={resolve(`/series/${series.slug}`)}>{series.title}</Breadcrumb.Link
							>
						</Breadcrumb.Item>
						<Breadcrumb.Separator />
						<Breadcrumb.Item>
							<DropdownMenu.Root bind:open={episodeMenuOpen}>
								<DropdownMenu.Trigger class={buttonVariants({ variant: 'ghost', size: 'sm' })}>
									{episode.title}
									<CaretDownIcon size={14} weight="bold" />
									<Kbd>E</Kbd>
								</DropdownMenu.Trigger>
								<DropdownMenu.Content
									align="start"
									class="min-w-56 border border-border bg-popover text-popover-foreground shadow-lg"
								>
									{#each series.episodes as item, idx (item.slug)}
										<DropdownMenu.Item
											class={item.slug === episode.slug
												? 'bg-accent text-accent-foreground'
												: undefined}
										>
											<a
												href={resolve(`/series/${series?.slug}/e/${item.slug}`)}
												class="flex w-full items-center justify-between gap-6"
											>
												<span>{item.title}</span>
												<Kbd>{idx + 1}</Kbd>
											</a>
										</DropdownMenu.Item>
									{/each}
								</DropdownMenu.Content>
							</DropdownMenu.Root>
						</Breadcrumb.Item>
					{:else}
						<Breadcrumb.Item>
							<Breadcrumb.Page>{episode.title}</Breadcrumb.Page>
						</Breadcrumb.Item>
					{/if}
				</Breadcrumb.List>
			</Breadcrumb.Root>
		</div>
	</header>

	<!-- eslint-disable-next-line better-tailwindcss/no-restricted-classes -- Tailwind has no standard utility for a 2fr / 1px / 3fr grid layout. -->
	<main class="grid flex-1 grid-cols-[2fr_1px_3fr] overflow-hidden">
		<aside class="flex overflow-hidden">
			<ProgressRail />
			<div class="relative min-h-0 flex-1">
				<div
					class="pointer-events-none absolute top-0 left-0 right-0 h-30 bg-gradient-to-b from-background to-transparent z-10"
				></div>
				<ListenPill {narrationAvailable} isComplete={player.isComplete} />
				<ScrollArea class="h-full">
					<Narration {nextEpisode} {series} />
				</ScrollArea>
				<div
					class="pointer-events-none absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent z-10"
				></div>
			</div>
		</aside>

		<div class="bg-border"></div>

		<section class="relative overflow-hidden">
			<ChapterCanvas />
		</section>
	</main>
</div>
