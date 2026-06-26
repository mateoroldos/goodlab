<script lang="ts">
	import { quintOut } from 'svelte/easing';
	import { fly } from 'svelte/transition';
	import { ArrowBendDownLeftIcon, HouseIcon } from 'phosphor-svelte';
	import { resolve } from '$app/paths';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Kbd } from '$lib/components/ui/kbd/index.js';
	import type { EpisodeSummary, SeriesSummary } from '$lib/content/catalog.js';
	import { playerContext } from '$lib/player.svelte.js';

	interface Props {
		nextEpisode?: EpisodeSummary;
		series?: SeriesSummary;
	}

	const { nextEpisode, series }: Props = $props();

	const player = playerContext.get();
	let activeStep: HTMLElement | undefined = $state();

	const stepKey = $derived(`${player.chapterIdx}-${player.stepIdx}`);
	const isComplete = $derived(!player.canGoNext);

	$effect(() => {
		void stepKey;
		activeStep?.scrollIntoView({ block: 'center', behavior: 'smooth' });
	});
</script>

<!-- eslint-disable-next-line better-tailwindcss/no-restricted-classes -- Viewport-relative vertical padding centers content across screen heights. -->
<div class="flex min-h-full flex-col gap-10 px-6 py-[40dvh]">
	{#each player.chapters as chapter, chapterIdx (chapter.id)}
		<section class="mx-auto flex w-full max-w-md flex-col gap-5">
			<div class="h-5">
				{#if chapter.title}
					<span
						class={[
							'text-xs font-medium uppercase tracking-widest transition-colors duration-300 ease-out',
							chapterIdx === player.chapterIdx ? 'text-primary' : 'text-muted-foreground/35'
						]}
					>
						Chapter {chapterIdx + 1} — {chapter.title}
					</span>
				{/if}
			</div>

			<div class="flex flex-col gap-6">
				{#each chapter.steps as step, stepIdx (`${chapter.id}-${stepIdx}`)}
					{@const active = chapterIdx === player.chapterIdx && stepIdx === player.stepIdx}
					{#if active}
						<p
							bind:this={activeStep}
							class="m-0 text-md leading-relaxed text-foreground transition-colors duration-300 ease-out"
						>
							{step.text}
						</p>
					{:else}
						<p
							class="m-0 text-md leading-relaxed text-muted-foreground/40 transition-colors duration-300 ease-out"
						>
							{step.text}
						</p>
					{/if}
				{/each}
			</div>
		</section>
	{/each}

	{#if isComplete}
		<section
			class="mx-auto flex w-full max-w-md flex-col gap-3 border-t border-border/60 pt-6 motion-safe:will-change-transform"
			in:fly={{ y: 10, duration: 280, delay: 320, easing: quintOut, opacity: 0 }}
			out:fly={{ y: 6, duration: 160, easing: quintOut, opacity: 0 }}
		>
			<p class="m-0 text-xs font-medium uppercase tracking-widest text-primary">Continue</p>
			{#if nextEpisode}
				<p class="m-0 text-sm leading-relaxed text-muted-foreground">
					Next episode: <span class="text-foreground">{nextEpisode.title}</span>. {nextEpisode.description}
				</p>

				<div class="flex flex-wrap items-center gap-2">
					<Button
						href={resolve(`/series/${series?.slug}/e/${nextEpisode.slug}`)}
						variant="outline"
						size="sm"
					>
						Next episode
						<Kbd><ArrowBendDownLeftIcon size={12} weight="bold" /></Kbd>
					</Button>
				</div>
			{:else if series}
				<p class="m-0 text-sm leading-relaxed text-muted-foreground">
					You finished this series. Return to the series page when you are ready.
				</p>

				<div class="flex flex-wrap items-center gap-2">
					<Button href={resolve(`/series/${series.slug}`)} variant="outline" size="sm">
						Series
						<Kbd>Esc</Kbd>
					</Button>
					<Button href={resolve('/')} variant="outline" size="sm">
						<HouseIcon size={14} weight="bold" />
						Home
						<Kbd>H</Kbd>
					</Button>
				</div>
			{/if}
		</section>
	{/if}
</div>
