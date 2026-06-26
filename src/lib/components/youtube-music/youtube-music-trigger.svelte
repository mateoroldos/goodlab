<script lang="ts">
	import { cn } from '$lib/utils.js';

	const {
		isPlaying,
		hasSelected,
		thumb
	}: {
		isPlaying: boolean;
		hasSelected: boolean;
		thumb: string;
	} = $props();

	const discClass = $derived(
		cn(
			// eslint-disable-next-line better-tailwindcss/no-restricted-classes -- 4s spin has no Tailwind equivalent; animate-spin is fixed at 1s and duration utilities don't override named animations
			'dark absolute inset-0 overflow-hidden rounded-full bg-background border animate-[spin_4s_linear_infinite]',
			// eslint-disable-next-line better-tailwindcss/no-restricted-classes -- animation-play-state has no Tailwind utility
			isPlaying ? '[animation-play-state:running]' : '[animation-play-state:paused]',
			!hasSelected && 'bg-card'
		)
	);
</script>

<!--
  All inner elements are sized as percentages of the button container,
  so they scale proportionally with any size class passed to the button.
-->
<!-- eslint-disable better-tailwindcss/no-restricted-classes -- proportional disc layout: 64%/58%/42%/8% have no Tailwind scale equivalents -->
<span class={discClass}>
	<!-- Grooved ring: 64% of disc -->
	<span
		class={cn(
			'absolute left-1/2 top-1/2 h-[64%] w-[64%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-border/60 bg-muted/20',
			hasSelected && 'bg-background/10'
		)}
	></span>

	<!-- Label / artwork area: expands when a track is selected -->
	<span
		class={cn(
			'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-center transition-all duration-300 ease-out motion-reduce:transition-none',
			hasSelected ? 'h-[58%] w-[58%] bg-muted ring-1 ring-border' : 'h-[42%] w-[42%] bg-muted'
		)}
		style:background-image={hasSelected ? `url(${thumb})` : 'none'}
	></span>

	<!-- Center hole: always on top -->
	<span
		class={cn(
			'absolute bg-foreground left-1/2 top-1/2 z-10 size-[8%] -translate-x-1/2 -translate-y-1/2 rounded-full transition-colors duration-300',
			hasSelected ? 'ring-1 ring-border/60' : 'ring-1 ring-border/70'
		)}
	></span>
</span>
<!-- eslint-enable better-tailwindcss/no-restricted-classes -->
