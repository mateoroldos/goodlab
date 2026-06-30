<script lang="ts">
	import { quintOut } from 'svelte/easing';
	import { fly } from 'svelte/transition';
	import {
		ArrowBendDownLeftIcon,
		BriefcaseIcon,
		ChalkboardTeacherIcon,
		HouseIcon,
		LightbulbIcon,
		SealCheckIcon,
		StudentIcon,
		WarningIcon
	} from 'phosphor-svelte';
	import { resolve } from '$app/paths';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Kbd } from '$lib/components/ui/kbd/index.js';
	import type { EpisodeSummary, SeriesSummary } from '$lib/content/catalog.js';
	import {
		isStopSpan,
		paragraphSpans,
		paragraphSpeaker,
		spanText,
		type Paragraph
	} from '$lib/episode.js';
	import { playerContext } from '$lib/player.svelte.js';
	import { SPEAKERS, type SpeakerId } from '$lib/narration/speakers.js';
	import { parseInline, type IconMark } from './inline-marks.js';
	import { scrollToCenter } from './scroll-to-center.js';

	interface Props {
		nextEpisode?: EpisodeSummary;
		series?: SeriesSummary;
	}

	const { nextEpisode, series }: Props = $props();

	const player = playerContext.get();

	interface CastStyle {
		accent: string;
		border: string;
		icon: typeof BriefcaseIcon;
	}

	const cast = {
		boss: { accent: 'text-amber-400', border: 'border-amber-400/30', icon: BriefcaseIcon },
		guide: { accent: 'text-primary', border: '', icon: ChalkboardTeacherIcon },
		learner: { accent: 'text-primary', border: 'border-primary/30', icon: StudentIcon }
	} as const satisfies Record<SpeakerId, CastStyle>;

	const icons = {
		bug: { accent: 'text-red-400', icon: WarningIcon },
		idea: { accent: 'text-primary', icon: LightbulbIcon },
		rule: { accent: 'text-green-400', icon: SealCheckIcon }
	} as const satisfies Record<IconMark, { accent: string; icon: typeof WarningIcon }>;
</script>

{#snippet iconMark(mark: IconMark, focused: boolean)}
	{@const Icon = icons[mark].icon}
	<span
		class={[
			// eslint-disable-next-line better-tailwindcss/no-restricted-classes -- The inline icon needs a sub-em baseline nudge to align with the surrounding prose.
			'mr-1 inline-flex align-[-0.125em] transition-colors duration-300 ease-out',
			focused ? icons[mark].accent : 'text-muted-foreground/40'
		]}
		aria-hidden="true"><Icon size={15} weight="fill" /></span
	>
{/snippet}

{#snippet inline(
	text: string,
	focused: boolean
)}{#each parseInline(text) as token, i (i)}{#if token.kind === 'code'}<code
				class="rounded-sm bg-current/10 px-1 font-mono text-sm">{token.value}</code
			>{:else if token.kind === 'bold'}<strong class="font-semibold">{token.value}</strong
			>{:else if token.kind === 'icon'}{@render iconMark(
				token.value,
				focused
			)}{:else}{token.value}{/if}{/each}{/snippet}

<!--
	One rendering path: bright through the current stop's reach (everything up
	to the next stop), dim from the next stop onward — the text mirror of the
	stateAtStop fold. player.stop is always the active paragraph's stop when
	active=true; inactive paragraphs get stopSpanIdx -1 and inherit the parent's
	muted color.
-->
{#snippet renderParagraph(para: Paragraph<any>, active: boolean)}
	{@const spans = paragraphSpans(para)}
	{@const stopSpanIdx = active ? (player.stop?.spanIdx ?? -1) : -1}
	{@const nextStop = spans.findIndex((s, i) => i > stopSpanIdx && isStopSpan(s))}
	{@const reachEnd = nextStop === -1 ? spans.length : nextStop}
	{#each spans as span, si (si)}
		{@const text = spanText(span)}
		{#if text !== ''}
			{@const focused = stopSpanIdx >= 0 && si < reachEnd}
			<span
				class={[
					'transition-colors duration-300 ease-out',
					focused ? 'text-foreground' : active && 'text-muted-foreground/40'
				]}>{@render inline(text, focused)}</span
			>
		{/if}
	{/each}
{/snippet}

{#snippet speakerTag(speaker: SpeakerId, focused: boolean)}
	{#if speaker !== 'guide'}
		{@const Icon = cast[speaker].icon}
		<p
			class={[
				'm-0 mb-1 flex items-center gap-1.5 text-xs font-medium transition-colors duration-300 ease-out',
				focused ? cast[speaker].accent : 'text-muted-foreground/40'
			]}
		>
			<Icon size={12} weight="fill" />
			<span>{SPEAKERS[speaker].name}</span>
		</p>
	{/if}
{/snippet}

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
						{chapter.title}
					</span>
				{/if}
			</div>

			<div class="flex flex-col gap-6">
				{#each chapter.paragraphs as para, paragraphIdx (`${chapter.id}-${paragraphIdx}`)}
					{@const active = chapterIdx === player.chapterIdx && paragraphIdx === player.paragraphIdx}
					{@const speaker = paragraphSpeaker(para)}
					{@const dialog = speaker !== 'guide'}
					<div
						class={dialog
							? ['border-l-2 pl-4', active ? cast[speaker].border : 'border-border/40']
							: ''}
					>
						{@render speakerTag(speaker, active)}
						<p
							{@attach scrollToCenter(active)}
							class={[
								'm-0 text-md leading-relaxed transition-colors duration-300 ease-out',
								active ? 'text-foreground' : 'text-muted-foreground/40',
								dialog && 'italic'
							]}
						>
							{@render renderParagraph(para, active)}
						</p>
					</div>
				{/each}
			</div>
		</section>
	{/each}

	{#if player.isComplete}
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
