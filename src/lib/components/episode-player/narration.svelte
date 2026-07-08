<script lang="ts">
	import { quintOut } from 'svelte/easing';
	import { fade, fly } from 'svelte/transition';
	import {
		ArrowBendDownLeftIcon,
		ArrowRightIcon,
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
		isAsk,
		isStopSpan,
		paragraphSpans,
		paragraphSpeaker,
		spanText,
		type Paragraph
	} from '$lib/episode.js';
	import { playerContext } from '$lib/player.svelte.js';
	import { narratorContext } from '$lib/narration/narrator.svelte.js';
	import { paragraphAnchors, segRuns, type Seg, type SegRun } from '$lib/narration/anchors.js';
	import { SPEAKERS, type SpeakerId } from '$lib/narration/speakers.js';
	import { soundContext, type SoundId } from '$lib/sounds/sound-effects.svelte.js';
	import { player as music } from '$lib/components/youtube-music/player-singleton.svelte.js';
	import { parseInline, type IconMark } from './inline-marks.js';
	import { scrollToCenter } from './scroll-to-center.js';

	interface Props {
		nextEpisode?: EpisodeSummary;
		series?: SeriesSummary;
	}

	const { nextEpisode, series }: Props = $props();

	const player = playerContext.get();
	const narrator = narratorContext.get();
	const sounds = soundContext.get();

	interface CastStyle {
		accent: string;
		border: string;
		icon: typeof BriefcaseIcon;
	}

	// Visual identity per cast member: icon + accent when their paragraph is
	// focused, dialog border for the non-narrator voices.
	const cast = {
		boss: { accent: 'text-amber-400', border: 'border-amber-400/30', icon: BriefcaseIcon },
		guide: { accent: 'text-primary', border: '', icon: ChalkboardTeacherIcon },
		learner: { accent: 'text-primary', border: 'border-primary/30', icon: StudentIcon }
	} as const satisfies Record<SpeakerId, CastStyle>;

	// Visual + audio identity per narrative icon mark.
	const icons = {
		bug: { accent: 'text-red-400', icon: WarningIcon, sound: 'icon.bug' },
		idea: { accent: 'text-primary', icon: LightbulbIcon, sound: 'icon.idea' },
		rule: { accent: 'text-green-400', icon: SealCheckIcon, sound: 'icon.rule' }
	} as const satisfies Record<
		IconMark,
		{ accent: string; icon: typeof WarningIcon; sound: SoundId }
	>;

	const isIconMark = (v: string): v is IconMark => v in icons;

	/** Whether the narrator is speaking this specific paragraph right now. */
	function isNarrating(ci: number, pi: number): boolean {
		return narrator.listening && narrator.chapterIdx === ci && narrator.paragraphIdx === pi;
	}

	// The paragraph being narrated, and its anchors memoized so the per-frame
	// sound effect below doesn't re-derive them on every charIdx change.
	const narratingPara = $derived(
		narrator.listening
			? player.chapters[narrator.chapterIdx]?.paragraphs[narrator.paragraphIdx]
			: undefined
	);
	const narratingAnchors = $derived(narratingPara && paragraphAnchors(narratingPara));

	// Fire icon accent sounds and word-anchored span sounds once, the moment the
	// sweep reaches them. Bookkeeping only — read and written inside the same
	// effect, never rendered.
	let firedSoundsKey = '';
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	const firedSounds = new Set<string>();
	$effect(() => {
		const para = narratingPara;
		const anchors = narratingAnchors;
		if (!para || !anchors) return;
		const key = `${narrator.chapterIdx}:${narrator.paragraphIdx}`;
		if (key !== firedSoundsKey || narrator.charIdx < 0) {
			firedSoundsKey = key;
			firedSounds.clear();
			if (narrator.charIdx < 0) return;
		}
		// Inline icon marks (bug / idea / rule) fire their accent sound once.
		anchors.segs.forEach((seg, i) => {
			const fireKey = `icon:${i}`;
			if (seg.kind !== 'icon' || firedSounds.has(fireKey) || narrator.charIdx < seg.start) return;
			firedSounds.add(fireKey);
			if (isIconMark(seg.text)) sounds.play(icons[seg.text].sound);
		});
		// Word-anchored span sounds (e.g. door effects) and music actions.
		paragraphSpans(para).forEach((span, i) => {
			if (typeof span === 'string' || narrator.charIdx < anchors.spanStart[i]) return;
			if (span.sound && !firedSounds.has(`sound:${i}`)) {
				firedSounds.add(`sound:${i}`);
				// SAFETY: `Span.sound` stays a loose string so episode.ts avoids importing the
				// UI sound catalog; episode authors must use catalog keys.
				sounds.play(span.sound as SoundId);
			}
			if (span.music === 'pause' && !firedSounds.has(`music:${i}`)) {
				firedSounds.add(`music:${i}`);
				music.fadeOut();
			}
		});
	});
</script>

<!-- Icon grammar: [!bug] foot-gun, [!idea] smarter move, [!rule] takeaway.
     Muted until the reading position reaches them, then accent color lands (300ms ease-out). -->
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

<!-- Inline marks: `code`, **bold**, and icon grammar -->
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

<!-- Single swept word seg — color depends on whether it's been spoken yet. -->
{#snippet sweepWord(seg: Seg)}
	{@const spoken = seg.end <= narrator.charIdx + 1}
	{@const current = !spoken && seg.start <= narrator.charIdx}
	<span
		class={[
			'transition-colors duration-75',
			spoken ? 'text-foreground' : current ? 'text-foreground/70' : 'text-muted-foreground/30'
		]}>{seg.text}</span
	>
{/snippet}

<!-- A run of same-kind segs wrapped in the appropriate mark element. -->
{#snippet sweepRun(run: SegRun)}
	{#if run.kind === 'code'}<code class="rounded-sm bg-current/10 px-1 font-mono text-sm"
			>{#each run.segs as seg (seg.start)}{#if seg.word}{@render sweepWord(
						seg
					)}{:else}{seg.text}{/if}{/each}</code
		>{:else if run.kind === 'bold'}<strong class="font-semibold"
			>{#each run.segs as seg (seg.start)}{#if seg.word}{@render sweepWord(
						seg
					)}{:else}{seg.text}{/if}{/each}</strong
		>{:else if run.kind === 'icon'}{#each run.segs as seg (seg.start)}{@render iconMark(
				seg.text as IconMark,
				narrator.charIdx >= seg.start
			)}{/each}{:else}{#each run.segs as seg (seg.start)}{#if seg.word}{@render sweepWord(
					seg
				)}{:else}{seg.text}{/if}{/each}{/if}
{/snippet}

<!--
	Read mode: bright through the current stop's reach (everything up to the next
	stop), dim from the next stop onward — the text mirror of the stateAtStop fold.
	Listen mode: char cursor from the narrator drives a smooth swept region across all spans.
	Waiting: all chars lit (charIdx pinned to end by narrator), inline continue hint visible.
-->
{#snippet renderParagraph(para: Paragraph<any>, active: boolean, narrating: boolean)}
	{@const spans = paragraphSpans(para)}

	{#if narrating && narrator.aligned}
		<!-- Listen mode: sweep char-by-char preserving mark wrappers. While the
		     clip loads (charIdx -1) every seg renders unspoken, so the paragraph
		     dims in and sweeps up instead of flashing fully lit. -->
		{@const anchors = paragraphAnchors(para)}
		{#each segRuns(anchors.segs) as run, i (i)}{@render sweepRun(run)}{/each}
	{:else}
		<!-- Read path: player.stop is the active paragraph's stop when active=true;
		     inactive paragraphs get -1 and inherit the parent's muted color. -->
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
	{/if}
{/snippet}

<!-- Cast tag: speaker icon + name for non-guide characters.
     Muted until the paragraph is the focused one, then the speaker's accent lands.
     Guide (John) speaks as the narrator voice — no tag needed above every paragraph. -->
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
					{@const narrating = isNarrating(chapterIdx, paragraphIdx)}
					{@const clickable = narrator.listening && !narrating}
					{@const speaker = paragraphSpeaker(para)}
					{@const dialog = speaker !== 'guide'}
					{#if active || narrating}
						<div class={[dialog && ['border-l-2 pl-4', cast[speaker].border]]}>
							{@render speakerTag(speaker, true)}
							<!-- The bright paragraph only mounts when it becomes current, so the
							     attachment scrolls it into view for both read and listen mode. -->
							<p
								{@attach scrollToCenter(true)}
								class={[
									'm-0 text-md leading-relaxed text-foreground transition-colors duration-300 ease-out',
									dialog && 'italic'
								]}
							>
								{@render renderParagraph(para, true, narrating)}
							</p>
							<!-- Ask paragraphs pause so the reader can predict before pressing. -->
							{#if narrating && narrator.waiting}
								<p
									class={['mt-3 flex items-center gap-1.5 text-xs', 'font-medium text-primary/80']}
									in:fade={{ duration: 300, easing: quintOut }}
								>
									<span>Think, then Space to reveal</span>
									<ArrowRightIcon size={10} />
								</p>
							{:else if active && !narrator.listening && isAsk(para)}
								<p
									class="mt-3 flex items-center gap-1.5 text-xs font-medium text-primary/80"
									in:fade={{ duration: 300, easing: quintOut }}
								>
									<span>Think, then press <Kbd>J</Kbd> to reveal</span>
									<ArrowRightIcon size={10} />
								</p>
							{/if}
						</div>
					{:else}
						<div class={[dialog && 'border-l-2 border-border/40 pl-4']}>
							{@render speakerTag(speaker, false)}
							<!-- eslint-disable-next-line better-tailwindcss/no-restricted-classes -- cursor-pointer only in listen mode -->
							<!-- svelte-ignore a11y_click_events_have_key_events -->
							<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
							<p
								class={[
									'm-0 text-md leading-relaxed transition-colors duration-300 ease-out',
									narrator.listening &&
									narrator.chapterIdx === chapterIdx &&
									narrator.paragraphIdx < paragraphIdx
										? 'text-muted-foreground/20'
										: 'text-muted-foreground/40',
									dialog && 'italic',
									clickable && 'cursor-pointer hover:text-muted-foreground/60'
								]}
								onclick={clickable ? () => narrator.play(chapterIdx, paragraphIdx) : undefined}
							>
								{@render renderParagraph(para, false, false)}
							</p>
						</div>
					{/if}
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
