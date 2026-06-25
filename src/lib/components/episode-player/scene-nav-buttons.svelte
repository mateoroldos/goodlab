<script lang="ts" module>
	export type State = 'done' | 'done-sibling' | 'current' | 'upcoming-sibling' | 'upcoming';

	export type Item = {
		id: string;
		state: State;
		connectedToNext: boolean;
	};

	// Single source of truth for phase IDs — used when building items and when querying the DOM.
	export function phaseId(si: number, ti: number, pi: number): string {
		return `${si}-${ti}-${pi}`;
	}
</script>

<script lang="ts">
	import { ArrowUpIcon, ArrowDownIcon } from 'phosphor-svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { playerContext } from '$lib/player.svelte.js';
	import { episodeNavigationContext } from './episode-navigation.svelte.js';
	import PhaseNode from './phase-node.svelte';

	const player = playerContext.get();
	const navigation = episodeNavigationContext.get();

	// done-sibling  = phase before current within the active step (already visited)
	// upcoming-sibling = phase after current within the active step (not yet reached)
	function resolveState(si: number, ti: number, pi: number): State {
		const isCurrentStep = si === player.sceneIdx && ti === player.stepIdx;
		if (isCurrentStep) {
			if (pi < player.phaseIdx) return 'done-sibling';
			if (pi === player.phaseIdx) return 'current';
			return 'upcoming-sibling';
		}
		const isDone = si < player.sceneIdx || (si === player.sceneIdx && ti < player.stepIdx);
		return isDone ? 'done' : 'upcoming';
	}

	const items = $derived.by((): Item[] =>
		player.scenes.flatMap((scene, si) =>
			scene.steps.flatMap((step, ti) =>
				step.phases.map((_, pi) => ({
					id: phaseId(si, ti, pi),
					state: resolveState(si, ti, pi),
					connectedToNext: pi < step.phases.length - 1
				}))
			)
		)
	);

	let trackContainer: HTMLElement | null = $state(null);

	// Parent owns scroll entirely: watches player indices directly, queries the DOM for the
	// active circle, and scrolls to it. Works for both forward and backward navigation.
	// py-[50dvh] on the inner list gives runway so any item can reach the viewport center.
	$effect(() => {
		const id = phaseId(player.sceneIdx, player.stepIdx, player.phaseIdx);
		const el = trackContainer?.querySelector(`[data-phase-id="${id}"]`);
		el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
	});
</script>

<div class="flex w-12 shrink-0 flex-col border-r border-border">
	<div class="flex flex-col items-center gap-1.5 p-2">
		<Button
			variant="outline"
			size="icon-sm"
			disabled={!player.canGoPrev}
			onclick={navigation.prev}
			aria-label="Previous step"
		>
			<ArrowUpIcon />
		</Button>
		<Button
			variant="outline"
			size="icon-sm"
			disabled={!player.canGoNext}
			onclick={navigation.next}
			aria-label="Next step"
		>
			<ArrowDownIcon />
		</Button>
	</div>

	<div
		bind:this={trackContainer}
		class="flex-1 overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden"
	>
		<!-- eslint-disable-next-line better-tailwindcss/no-restricted-classes -- py-[50dvh] gives enough runway so scrollIntoView can center the first and last items -->
		<div class="flex flex-col items-center py-[50dvh]">
			{#each items as item (item.id)}
				<PhaseNode id={item.id} state={item.state} connectedToNext={item.connectedToNext} />
			{/each}
		</div>
	</div>
</div>
