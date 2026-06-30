<script module lang="ts">
	export type RecapNodeId = 'idle' | 'saving' | 'failed' | 'saved';
	export type RecapEdgeId =
		| 'idle-saving'
		| 'saving-saved'
		| 'saving-failed'
		| 'failed-saving'
		| 'saved-idle';

	/** Which version of the machine code to show. Grows richer each phase. */
	export type RecapPhase = 1 | 2 | 3 | 4 | 5;

	/** The single focus point, named as the concept the narration is recapping. */
	export type RecapFocus =
		| 'state-idle'
		| 'state-saving'
		| 'state-failed'
		| 'state-saved'
		| 'events-idle'
		| 'events-saving'
		| 'events-failed'
		| 'events-saved'
		| 'ctx'
		| 'guard'
		| 'actions'
		| 'action-startRequest'
		| 'action-clearError'
		| 'action-incrementRetries';

	export interface RecapSceneState {
		phase: RecapPhase;
		/** Phase-1 construction: state lines appear as the narration names them
		 *  (1 idle, 2 saving, 3 failed, 4 saved). Omit for all four. */
		statesRevealed?: 0 | 1 | 2 | 3 | 4;
		/** Actor-usage code construction: 1 create + start, 2 subscribe. Replaces the machine panel. */
		usageStep?: 1 | 2;
		/** When true, reveal the graph panel alongside the code. */
		showGraph?: boolean;
		currentNode?: RecapNodeId;
		activeEdge?: RecapEdgeId;
		activeAction?: 'startRequest' | 'clearError' | 'incrementRetries';
		guardVisible?: boolean;
		guardBlocked?: boolean;
		retries: number;
		focus?: RecapFocus;
		/** Event in the actor mailbox during the run phase. */
		mailbox?: string;
		/** Accumulated snapshot stream during the run phase. */
		snapshots?: RecapNodeId[];
	}
</script>

<script lang="ts">
	import { quintOut } from 'svelte/easing';
	import { fade, fly } from 'svelte/transition';
	import CodeBlock, { type CodeBlockState } from '$lib/visuals/code-block/code-block.svelte';
	import ExplainerGraph from '$lib/visuals/explainer-graph/explainer-graph.svelte';
	import FileCard from '$lib/visuals/file-card/file-card.svelte';
	import StateBadge from '$lib/visuals/state-badge/state-badge.svelte';
	import { soundContext } from '$lib/sounds/sound-effects.svelte.js';
	import {
		saveWorkflowGraph,
		saveWorkflowLabel,
		saveWorkflowValidEdges
	} from '../../shared/save-workflow-graph.js';

	interface Props {
		state: RecapSceneState;
	}

	const { state }: Props = $props();
	const sounds = soundContext.get();

	let prevEdge: RecapSceneState['activeEdge'];
	let prevBlocked: boolean | undefined;
	$effect(() => {
		if (state.guardBlocked && !prevBlocked) sounds.play('ui.rejected');
		else if (state.activeEdge !== prevEdge && state.activeEdge) {
			if (state.currentNode === 'saved') sounds.play('ui.success');
			else sounds.play('ui.transition');
		}
		prevEdge = state.activeEdge;
		prevBlocked = state.guardBlocked;
	});

	// "Watch it run" — the actor card appearing is the machine coming alive
	let prevShowGraph: boolean | undefined;
	$effect(() => {
		const next = state.showGraph ?? false;
		if (prevShowGraph === false && next) sounds.play('actor.start');
		prevShowGraph = next;
	});

	// Same actor voice as ep7: events thunk into the mailbox...
	let prevMailbox: string | undefined;
	$effect(() => {
		const next = state.mailbox;
		if (next !== undefined && next !== prevMailbox) sounds.play('ui.dispatch');
		prevMailbox = next;
	});

	// ...and snapshots ping on the way out. Here they land in the same patch as
	// the transition, so the ping trails it slightly — fire, then exhale.
	let prevSnapCount: number | undefined;
	$effect(() => {
		const count = state.snapshots?.length ?? 0;
		if (prevSnapCount !== undefined && count > prevSnapCount) {
			setTimeout(() => sounds.play('ui.snapshot'), 140);
		}
		prevSnapCount = count;
	});

	// Concept → line ids. The focused concept spotlights; the rest of the machine dims.
	const focusLineIds: Record<RecapFocus, string[]> = {
		actions: ['idle', 'suc', 'fail', 'act'],
		'action-startRequest': ['idle', 'act'],
		'action-clearError': ['suc'],
		'action-incrementRetries': ['fail'],
		ctx: ['ctx'],
		'events-idle': ['idle'],
		'events-saving': ['suc', 'fail'],
		'events-failed': ['ret'],
		'events-saved': ['done'],
		guard: ['guard'],
		'state-idle': ['idle'],
		'state-saving': ['suc'],
		'state-failed': ['ret'],
		'state-saved': ['done']
	};
	const focusIds = $derived(state.focus ? new Set(focusLineIds[state.focus]) : undefined);

	// ─── Code phases ─────────────────────────────────────────────────────────────
	// Stable line IDs across phases: the machine grows in place — new lines fly
	// in, existing lines patch — instead of the whole block re-entering each step.

	const phaseCode = $derived.by((): CodeBlockState => {
		const p = state.phase;

		const idle =
			p === 1
				? '    idle:   {},'
				: p < 5
					? "    idle:   { on: { SAVE:    { target: 'saving'  } } },"
					: "    idle:   { on: { SAVE:    { target: 'saving', actions: 'startRequest'     } } },";
		const suc =
			p === 1
				? '    saving: {},'
				: p < 5
					? "    saving: { on: { SUCCESS: { target: 'saved'   },"
					: "    saving: { on: { SUCCESS: { target: 'saved',  actions: 'clearError'       },";
		const fail =
			p < 5
				? "                    FAIL:    { target: 'failed'  } } },"
				: "                    FAIL:    { target: 'failed', actions: 'incrementRetries' } } },";
		const done =
			p === 1 ? '    saved:  {}' : "    saved:  { on: { DONE:    { target: 'idle'    } } }";

		const failedLines =
			p === 1
				? [{ id: 'ret', content: '    failed: {},' }]
				: p < 4
					? [{ id: 'ret', content: "    failed: { on: { RETRY:   { target: 'saving'  } } }," }]
					: [
							{ id: 'ret', content: '    failed: { on: { RETRY: {' },
							{ id: 'guard', content: '      guard:   ({ context }) => context.retries < 3,' },
							{
								id: 'tgt',
								content: p === 5 ? "      target:  'saving'," : "      target:  'saving'"
							},
							...(p === 5 ? [{ id: 'act', content: "      actions: 'startRequest'" }] : []),
							{ id: 'rc', content: '    } } },' }
						];

		// Phase-1 build-up: the skeleton stands first, states are placed one by
		// one as the narration names them. Later phases show everything.
		const revealed = state.statesRevealed ?? 4;

		return {
			language: 'typescript',
			lines: [
				{ id: 'open', content: 'const machine = createMachine({' },
				...(p >= 3 ? [{ id: 'ctx', content: '  context: { retries: 0, message: null },' }] : []),
				{ id: 'init', content: "  initial: 'idle'," },
				{ id: 'states', content: '  states: {' },
				...(revealed >= 1 ? [{ id: 'idle', content: idle }] : []),
				...(revealed >= 2 ? [{ id: 'suc', content: suc }] : []),
				...(p >= 2 ? [{ id: 'fail', content: fail }] : []),
				...(revealed >= 3 ? failedLines : []),
				...(revealed >= 4 ? [{ id: 'done', content: done }] : []),
				{ id: 'states-close', content: '  }' },
				{ id: 'close', content: '})' }
			]
		};
	});

	// Actor usage builds in two steps: create, then subscribe + start — the
	// canonical XState order, so the subscriber catches the initial snapshot.
	const usageCode = $derived.by((): CodeBlockState => {
		const step = state.usageStep ?? 2;
		return {
			language: 'typescript',
			lines: [
				{ id: 'ua0', content: 'const actor = createActor(machine);' },
				...(step >= 2
					? [
							{ id: 'ua2', content: '' },
							{ id: 'ua3', content: 'actor.subscribe(snapshot => {' },
							{ id: 'ua4', content: '  render(snapshot.value);' },
							{ id: 'ua5', content: '});' },
							{ id: 'ua6', content: '' },
							{ id: 'ua1', content: 'actor.start();' }
						]
					: [])
			]
		};
	});

	// ─── Graph ────────────────────────────────────────────────────────────────

	// Only show edges once transitions are introduced (phase 2+)
	const showEdges = $derived(state.phase >= 2);
	const graphLabels = $derived([
		...(state.guardVisible
			? saveWorkflowLabel('failed-saving', 'guard', state.guardBlocked ? 'blocked' : 'active')
			: []),
		...(state.activeAction ? saveWorkflowLabel(state.activeEdge, 'action') : [])
	]);
	const graphSnapshot = $derived({
		visibleEdges: showEdges ? saveWorkflowValidEdges : ('none' as const),
		currentNode: state.currentNode,
		activeEdgeIds: state.activeEdge ? [state.activeEdge] : [],
		blockedEdgeIds: state.guardBlocked ? (['failed-saving'] as const) : [],
		blockedNodeIds: state.currentNode && state.guardBlocked ? [state.currentNode] : [],
		visibleLabels: graphLabels,
		spotlight: state.currentNode !== undefined
	});
</script>

<!-- Code panel — visible while building up -->
{#if !state.showGraph && !state.usageStep}
	<div class="mx-auto w-full max-w-md">
		<FileCard title="machine.ts">
			<!-- Stagger only the first reveal; later phases add a few lines in place -->
			<CodeBlock state={phaseCode} {focusIds} stagger={state.phase === 1} />
		</FileCard>
	</div>
{/if}

<!-- Usage panel — the machine gets an actor and a subscriber before it runs -->
{#if !state.showGraph && state.usageStep}
	<div class="mx-auto w-full max-w-md" in:fade={{ duration: 300 }}>
		<FileCard title="app.ts">
			<CodeBlock state={usageCode} stagger={false} />
		</FileCard>
	</div>
{/if}

<!-- Graph panel — actor-card layout once showGraph is true.
     The actor wraps the machine graph, matching ep7's design. -->
{#if state.showGraph}
	<div
		class="mx-auto w-full max-w-md overflow-hidden rounded-xl border border-border/20"
		in:fade={{ duration: 300 }}
	>
		<!-- Actor header: mailbox -->
		<div
			class="flex min-h-9 items-center justify-between border-b border-border/15 bg-muted/10 px-4 py-2"
		>
			<span class="font-mono text-xs uppercase tracking-widest text-muted-foreground/40">actor</span
			>
			<div class="flex items-center gap-2">
				<span class="font-mono text-xs text-muted-foreground/40">mailbox:</span>
				{#if state.mailbox}
					<!-- eslint-disable better-tailwindcss/no-restricted-classes -- The mailbox pill uses a theme-aware glow color that Tailwind's stock shadows cannot express. -->
					<span
						class="rounded-full border border-border/40 bg-secondary px-2 py-0.5 font-mono text-xs text-secondary-foreground shadow-[0_0_12px_color-mix(in_oklab,var(--secondary-foreground)_18%,transparent)]"
						in:fly={{ y: -8, duration: 220, easing: quintOut }}
					>
						{state.mailbox}
					</span>
					<!-- eslint-enable better-tailwindcss/no-restricted-classes -->
				{:else}
					<span class="font-mono text-xs text-muted-foreground/25" in:fade={{ duration: 150 }}
						>empty</span
					>
				{/if}
			</div>
		</div>

		<!-- Machine blueprint inside the actor -->
		<div class="border-b border-dashed border-border/25">
			<div
				class="flex min-h-7 items-center border-b border-dashed border-border/20 bg-muted/5 px-4 py-1"
			>
				<span class="font-mono text-2xs uppercase tracking-widest text-muted-foreground/30"
					>machine · blueprint</span
				>
			</div>
			<ExplainerGraph graph={saveWorkflowGraph} snapshot={graphSnapshot} arrowId="rc-arrow" />
		</div>

		<!-- Actor footer: state badge + snapshots + context -->
		<div class="flex items-center justify-between gap-4 px-4 py-2.5">
			<div class="flex items-center gap-2">
				<span class="font-mono text-xs text-muted-foreground/40">state:</span>
				{#if state.currentNode}
					<div in:fly={{ x: -6, duration: 200, easing: quintOut }}>
						<StateBadge value={state.currentNode} />
					</div>
				{/if}
			</div>
			{#if state.phase >= 3}
				<div class="font-mono text-xs">
					<span class="text-muted-foreground/40">retries: </span>
					<span
						class="font-medium transition-colors duration-200"
						class:text-destructive={state.retries >= 3}
						class:text-foreground={state.retries < 3}>{state.retries}</span
					>
				</div>
			{/if}
		</div>

		<!-- Snapshot stream -->
		{#if state.snapshots?.length}
			<div class="flex items-center gap-2 border-t border-border/15 bg-muted/10 px-4 py-2">
				<span class="shrink-0 font-mono text-xs text-muted-foreground/40">snapshots ·</span>
				<div class="flex items-center gap-1">
					{#each state.snapshots as snap, i (i)}
						{#if i > 0}
							<span class="text-2xs text-muted-foreground/25">›</span>
						{/if}
						<div in:fly={{ x: -8, duration: 200, easing: quintOut }}>
							<StateBadge value={snap} showIcon={false} />
						</div>
					{/each}
				</div>
			</div>
		{/if}
	</div>
{/if}
