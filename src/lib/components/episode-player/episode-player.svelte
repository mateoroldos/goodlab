<script lang="ts">
	import { Player, playerContext } from '$lib/player.svelte.js';
	import type { Episode } from '$lib/episode.js';
	import StepText from './step-text.svelte';
	import SceneCanvas from './scene-canvas.svelte';
	import NavControls from './nav-controls.svelte';

	interface Props {
		episode: Episode;
	}
	const { episode }: Props = $props();

	const player = new Player(() => episode);
	playerContext.set(player);
</script>

<div class="dark flex h-dvh flex-col bg-background text-foreground">
	<header class="flex shrink-0 items-center justify-between border-b border-border px-10 py-4">
		<span class="text-sm font-medium text-muted-foreground">{episode.title}</span>
		<span class="text-xs text-muted-foreground/60">
			Scene {player.sceneIdx + 1} / {player.sceneCount}
		</span>
	</header>

	<main class="grid flex-1 grid-cols-[2fr_1px_3fr] overflow-hidden">
		<aside class="overflow-y-auto">
			<StepText />
		</aside>

		<div class="bg-border"></div>

		<section class="overflow-hidden">
			<SceneCanvas />
		</section>
	</main>

	<NavControls />
</div>
