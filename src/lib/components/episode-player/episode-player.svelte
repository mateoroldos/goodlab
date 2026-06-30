<script lang="ts">
	import { onMount } from 'svelte';
	import { CaretDownIcon } from 'phosphor-svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { Player, playerContext } from '$lib/player.svelte.js';
	import type { Episode } from '$lib/episode.js';
	import type { EpisodeSummary, Series } from '$lib/content/catalog.js';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import { Kbd } from '$lib/components/ui/kbd/index.js';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
	import { soundContext } from '$lib/sounds/sound-effects.svelte.js';
	import { shortcutContext } from '$lib/shortcuts/shortcut-registry.svelte.js';
	import Narration from './narration.svelte';
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
	const sounds = soundContext.get();
	const shortcuts = shortcutContext.get();

	playerContext.set(player);

	const navigation = createEpisodeNavigation(player, sounds);
	episodeNavigationContext.set(navigation);

	let episodeMenuOpen = $state(false);
	const openEpisodeMenu = () => {
		if (series) episodeMenuOpen = true;
	};
	const episodeShortcuts = $derived(
		series?.episodes.slice(0, 9).map((item, idx) => ({
			key: String(idx + 1),
			description: `Episode ${idx + 1}`,
			when: () => episodeMenuOpen,
			run: () => void goto(resolve(`/series/${series?.slug}/e/${item.slug}`))
		})) ?? []
	);

	onMount(() =>
		shortcuts.register([
			{ key: 'j', description: 'Next stop', when: () => player.canGoNext, run: navigation.next },
			{
				key: 'k',
				description: 'Previous stop',
				when: () => player.canGoPrev,
				run: navigation.prev
			},
			{
				key: 'e',
				description: 'Open episode menu',
				when: () => Boolean(series) && !episodeMenuOpen,
				run: openEpisodeMenu
			},
			{
				key: 'Escape',
				description: 'Back to series',
				when: () => player.isComplete && !nextEpisode && Boolean(series),
				run: () => {
					if (series) void goto(resolve(`/series/${series.slug}`));
				}
			},
			{
				key: 'h',
				description: 'Home',
				when: () => player.isComplete && !nextEpisode,
				run: () => void goto(resolve('/'))
			},
			{
				key: 'Enter',
				description: 'Next episode',
				when: () => player.isComplete && Boolean(nextEpisode),
				run: () => {
					if (nextEpisode) void goto(resolve(`/series/${series?.slug}/e/${nextEpisode.slug}`));
				}
			},
			...episodeShortcuts
		])
	);
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
			<div class="min-h-0 flex-1">
				<ScrollArea class="h-full">
					<Narration {nextEpisode} {series} />
				</ScrollArea>
			</div>
		</aside>

		<div class="bg-border"></div>

		<section class="relative overflow-hidden">
			<ChapterCanvas />
		</section>
	</main>
</div>
