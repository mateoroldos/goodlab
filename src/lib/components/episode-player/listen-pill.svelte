<script lang="ts">
	import { quintOut } from 'svelte/easing';
	import { fade } from 'svelte/transition';
	import { HeadphonesIcon, PlayIcon } from 'phosphor-svelte';
	import { tv } from 'tailwind-variants';
	import { Kbd } from '$lib/components/ui/kbd/index.js';
	import { narratorContext } from '$lib/narration/narrator.svelte.js';

	interface Props {
		narrationAvailable: boolean;
		isComplete: boolean;
	}
	const { narrationAvailable, isComplete }: Props = $props();

	const narrator = narratorContext.get();

	const rateLabel = $derived(`${narrator.rate}×`);

	const pill = tv({
		base: 'flex items-center gap-2 rounded-full border backdrop-blur-sm',
		variants: {
			state: {
				idle: 'border-border/50 bg-background/80 px-4 py-2 text-sm text-muted-foreground shadow-sm transition-all duration-200 ease-in-out hover:border-border hover:text-foreground',
				waiting: 'border-primary/30 bg-background/90 px-3 py-2 shadow-md',
				listening: 'border-primary/20 bg-background/90 px-3 py-2 shadow-md'
			}
		}
	});

	const control = tv({
		base: 'text-xs transition-colors duration-150',
		variants: {
			active: {
				true: 'text-primary',
				false: 'text-muted-foreground hover:text-foreground'
			}
		},
		defaultVariants: { active: false }
	});
</script>

{#if narrationAvailable && !isComplete}
	<div
		class="absolute left-0 right-0 top-4 z-20 flex justify-center px-4"
		in:fade={{ duration: 200, easing: quintOut }}
	>
		{#if !narrator.listening}
			<!-- Idle: soft invitation -->
			<button
				class={pill({ state: 'idle' })}
				onclick={() => narrator.start()}
				aria-label="Listen to narration"
			>
				<HeadphonesIcon size={14} />
				<span>Listen</span>
				<Kbd>Space</Kbd>
			</button>
		{:else if narrator.waiting}
			<!-- Waiting: ask paragraphs pause for prediction before reveal. -->
			<div class={pill({ state: 'waiting' })} in:fade={{ duration: 180, easing: quintOut }}>
				<button
					class="flex items-center gap-2 text-sm font-medium text-primary transition-colors duration-150 hover:text-primary/80"
					onclick={() => narrator.toggle()}
					aria-label="Reveal the answer"
				>
					<span>Reveal</span>
					<Kbd>Space</Kbd>
				</button>
				<span class="text-border/60">|</span>
				<button class={control()} onclick={() => narrator.exit()} aria-label="Exit listen mode">
					Exit <Kbd>Esc</Kbd>
				</button>
			</div>
		{:else}
			<!-- Listening / Paused -->
			<div class={pill({ state: 'listening' })} in:fade={{ duration: 180, easing: quintOut }}>
				<!-- Equalizer or play icon -->
				<button
					class="flex items-center gap-2 text-sm font-medium transition-colors duration-150 hover:text-primary"
					onclick={() => narrator.toggle()}
					aria-label={narrator.paused ? 'Resume narration' : 'Pause narration'}
				>
					{#if narrator.paused}
						<PlayIcon size={13} weight="fill" class="text-primary" />
						<span class="text-foreground">Resume</span>
					{:else}
						<!-- 3-bar mini equalizer -->
						<div class="flex h-3 items-end gap-0.5" aria-hidden="true">
							<div class="eq-bar-1 h-full w-0.75 origin-bottom rounded-xs bg-primary"></div>
							<div class="eq-bar-2 h-full w-0.75 origin-bottom rounded-xs bg-primary"></div>
							<div class="eq-bar-3 h-full w-0.75 origin-bottom rounded-xs bg-primary"></div>
						</div>
						<span class="text-foreground">Listening</span>
					{/if}
					<Kbd>Space</Kbd>
				</button>

				<!-- Progress hairline -->
				{#if narrator.progress > 0}
					<div class="relative h-0.5 w-12 overflow-hidden rounded-full bg-border/40">
						<div
							class="absolute inset-y-0 left-0 rounded-full bg-primary/60"
							style="width: {narrator.progress * 100}%"
						></div>
					</div>
				{/if}

				<span class="text-border/60">|</span>

				<button
					class={control({ class: 'rounded px-1.5 py-0.5' })}
					onclick={() => narrator.cycleRate()}
					title="Cycle playback speed"
				>
					{rateLabel}
				</button>

				<button class={control()} onclick={() => narrator.exit()} aria-label="Exit listen mode">
					Esc
				</button>
			</div>
		{/if}
	</div>
{/if}

<!-- Multi-stop keyframes have no Tailwind utility — only the animations live here;
     the bars' layout and color are Tailwind classes in the markup. -->
<style>
	@keyframes eq1 {
		0%,
		100% {
			transform: scaleY(0.25);
		}
		50% {
			transform: scaleY(1);
		}
	}
	@keyframes eq2 {
		0%,
		100% {
			transform: scaleY(0.65);
		}
		35% {
			transform: scaleY(0.2);
		}
		70% {
			transform: scaleY(1);
		}
	}
	@keyframes eq3 {
		0%,
		100% {
			transform: scaleY(0.4);
		}
		60% {
			transform: scaleY(0.85);
		}
	}

	.eq-bar-1 {
		animation: eq1 0.85s ease-in-out infinite;
	}
	.eq-bar-2 {
		animation: eq2 0.65s ease-in-out infinite 0.12s;
	}
	.eq-bar-3 {
		animation: eq3 0.95s ease-in-out infinite 0.28s;
	}

	@media (prefers-reduced-motion: reduce) {
		.eq-bar-1,
		.eq-bar-2,
		.eq-bar-3 {
			animation: none;
			transform: scaleY(0.6);
		}
	}
</style>
