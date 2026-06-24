<script lang="ts">
	import { CaretDown, CaretUp } from 'phosphor-svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { playerContext } from '$lib/player.svelte.js';
	import { episodeNavigationContext } from './episode-navigation.svelte.js';

	const player = playerContext.get();
	const navigation = episodeNavigationContext.get();
</script>

<div class="absolute right-4 top-4 z-10 flex flex-col gap-2">
	<Button
		variant="outline"
		size="icon-lg"
		class="size-10 border-primary/40 bg-background/90 font-mono text-base text-primary shadow-[2px_2px_0_hsl(var(--primary)/0.35)] backdrop-blur hover:-translate-y-0.5 hover:bg-primary hover:text-primary-foreground hover:shadow-[3px_3px_0_hsl(var(--primary)/0.25)] active:translate-x-px active:translate-y-px active:shadow-[1px_1px_0_hsl(var(--primary)/0.35)] disabled:shadow-none"
		disabled={!player.canGoPrev}
		onclick={navigation.prev}
		aria-label="Previous step"
	>
		<CaretUp />
	</Button>

	<Button
		variant="outline"
		size="icon-lg"
		class="size-10 border-primary/40 bg-background/90 font-mono text-base text-primary shadow-[2px_2px_0_hsl(var(--primary)/0.35)] backdrop-blur hover:-translate-y-0.5 hover:bg-primary hover:text-primary-foreground hover:shadow-[3px_3px_0_hsl(var(--primary)/0.25)] active:translate-x-px active:translate-y-px active:shadow-[1px_1px_0_hsl(var(--primary)/0.35)] disabled:shadow-none"
		disabled={!player.canGoNext}
		onclick={navigation.next}
		aria-label="Next step"
	>
		<CaretDown />
	</Button>
</div>
