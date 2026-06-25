<script lang="ts">
	import { onDestroy } from 'svelte';
	import { HouseIcon } from 'phosphor-svelte';
	import { Player, playerContext } from '$lib/player.svelte.js';
	import type { Episode } from '$lib/episode.js';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
	import { soundContext } from '$lib/sounds/sound-effects.svelte.js';
	import { shortcutContext } from '$lib/shortcuts/shortcut-registry.svelte.js';
	import StepText from './step-text.svelte';
	import SceneCanvas from './scene-canvas.svelte';
	import SceneNavButtons from './scene-nav-buttons.svelte';
	import {
		createEpisodeNavigation,
		episodeNavigationContext
	} from './episode-navigation.svelte.js';
	import { resolve } from '$app/paths';

	interface Props {
		episode: Episode;
	}
	const { episode }: Props = $props();

	const player = new Player(() => episode);
	const sounds = soundContext.get();
	const shortcuts = shortcutContext.get();

	playerContext.set(player);

	const navigation = createEpisodeNavigation(player, sounds);
	episodeNavigationContext.set(navigation);

	onDestroy(
		shortcuts.register([
			{ key: 'j', description: 'Next step', when: () => player.canGoNext, run: navigation.next },
			{ key: 'k', description: 'Previous step', when: () => player.canGoPrev, run: navigation.prev }
		])
	);
</script>

<div class="dark flex h-dvh flex-col bg-background text-foreground">
	<header class="flex shrink-0 items-center justify-between border-b border-border px-6 py-3">
		<div class="flex items-center gap-3">
			<a
				href={resolve('/')}
				class="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
				aria-label="Back to episodes"
			>
				<HouseIcon weight="bold" size={16} />
			</a>
			<span class="text-sm font-medium">{episode.title}</span>
		</div>
		<span class="text-xs text-muted-foreground/60">
			Part {player.sceneIdx + 1} of {player.sceneCount}
		</span>
	</header>

	<!-- eslint-disable-next-line better-tailwindcss/no-restricted-classes -- Tailwind has no standard utility for a 2fr / 1px / 3fr grid layout. -->
	<main class="grid flex-1 grid-cols-[2fr_1px_3fr] overflow-hidden">
		<aside class="flex overflow-hidden">
			<SceneNavButtons />
			<div class="min-h-0 flex-1">
				<ScrollArea class="h-full">
					<StepText />
				</ScrollArea>
			</div>
		</aside>

		<div class="bg-border"></div>

		<section class="relative overflow-hidden">
			<SceneCanvas />
		</section>
	</main>
</div>
