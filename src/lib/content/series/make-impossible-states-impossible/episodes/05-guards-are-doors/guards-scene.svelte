<script module lang="ts">
	export type GuardNodeId = 'idle' | 'saving' | 'failed' | 'saved';

	export interface GuardsSceneState {
		codeMode: 'handler' | 'guard';
		currentNode: GuardNodeId;
		retries: number;
		/** The transition just fired — highlight this edge */
		activeEdge?: 'failed-saving';
		/** Guard evaluated to false — transition blocked */
		blocked?: boolean;
		/** Handler construction stage: 0 empty shell, 1 the if, 2 body, 3 the silent else. Omit for full. */
		handlerStep?: 0 | 1 | 2 | 3;
		/** Guard construction stage: 1 the transition, 2 target, 3 the printed rule. Omit for full. */
		guardStep?: 1 | 2 | 3;
	}
</script>

<script lang="ts">
	import { fade } from 'svelte/transition';
	import CodeBlock, { type CodeBlockState } from '$lib/visuals/code-block/code-block.svelte';
	import ExplainerGraph from '$lib/visuals/explainer-graph/explainer-graph.svelte';
	import FileCard from '$lib/visuals/file-card/file-card.svelte';
	import { soundContext } from '$lib/sounds/sound-effects.svelte.js';
	import {
		saveWorkflowGraph,
		saveWorkflowLabel,
		saveWorkflowValidEdges
	} from '../../shared/save-workflow-graph.js';

	interface Props {
		state: GuardsSceneState;
	}

	const { state }: Props = $props();
	const sounds = soundContext.get();

	let prevBlocked: boolean | undefined;
	let prevActiveEdge: GuardsSceneState['activeEdge'];
	$effect(() => {
		if (state.blocked && !prevBlocked) sounds.play('ui.rejected');
		if (state.activeEdge !== prevActiveEdge && state.activeEdge !== undefined) {
			sounds.play('ui.transition');
		}
		prevBlocked = state.blocked;
		prevActiveEdge = state.activeEdge;
	});

	const showGuard = $derived(state.codeMode === 'guard');
	const graphSnapshot = $derived({
		visibleEdges: saveWorkflowValidEdges,
		currentNode: state.currentNode,
		activeEdgeIds: state.activeEdge ? [state.activeEdge] : [],
		blockedEdgeIds: state.blocked ? (['failed-saving'] as const) : [],
		blockedNodeIds: state.blocked ? [state.currentNode] : [],
		visibleLabels: showGuard
			? saveWorkflowLabel('failed-saving', 'guard', state.blocked ? 'blocked' : 'active')
			: [],
		spotlight: true
	});

	// Focus follows the story beat: while constructing, the newest lines light;
	// the door opening spotlights the target, the door staying shut spotlights
	// the printed rule (or the buried if).
	const focusIds = $derived.by((): ReadonlySet<string> | undefined => {
		if (state.blocked) {
			return state.codeMode === 'guard' ? new Set(['g3', 'g4']) : new Set(['h1', 'h5']);
		}
		if (state.activeEdge && state.codeMode === 'guard') return new Set(['g2', 'g3', 'g4']);
		if (state.codeMode === 'handler' && state.handlerStep !== undefined) {
			if (state.handlerStep === 1) return new Set(['h1', 'h4']);
			if (state.handlerStep === 2) return new Set(['h2', 'h3']);
			if (state.handlerStep === 3) return new Set(['h5']);
		}
		if (state.codeMode === 'guard' && state.guardStep !== undefined) {
			if (state.guardStep === 1) return new Set(['g0', 'gon', 'g1']);
			if (state.guardStep === 2) return new Set(['g2']);
			return new Set(['g3', 'g4']);
		}
		return undefined;
	});

	// Both fixes construct step by step as the narration names each piece.
	// Handler uses send() — events were established in ep3 and remain the interface.
	// The smell here is the condition living in the handler, not raw setStatus usage.
	const handlerCode = $derived.by((): CodeBlockState => {
		const step = state.handlerStep ?? 3;
		return {
			language: 'typescript',
			lines: [
				{ id: 'h0', content: 'function handleRetry() {' },
				...(step >= 1 ? [{ id: 'h1', content: '  if (retries < 3) {' }] : []),
				...(step >= 2
					? [
							{ id: 'h2', content: "    send({ type: 'RETRY' })" },
							{ id: 'h3', content: '    setRetries(r => r + 1)' }
						]
					: []),
				...(step >= 1 ? [{ id: 'h4', content: '  }' }] : []),
				...(step >= 3 ? [{ id: 'h5', content: '  // else: silently do nothing' }] : []),
				{ id: 'h6', content: '}' }
			]
		};
	});

	const guardCode = $derived.by((): CodeBlockState => {
		const step = state.guardStep ?? 3;
		return {
			language: 'typescript',
			lines: [
				{ id: 'g0', content: 'failed: {' },
				{ id: 'gon', content: '  on: {' },
				{ id: 'g1', content: '    RETRY: {' },
				...(step >= 2 ? [{ id: 'g2', content: "      target: 'saving'," }] : []),
				...(step >= 3
					? [
							{ id: 'g3', content: '      guard: ({ context }) =>' },
							{ id: 'g4', content: '        context.retries < 3' }
						]
					: []),
				{ id: 'g5', content: '    }' },
				{ id: 'gonc', content: '  }' },
				{ id: 'g6', content: '}' }
			]
		};
	});

	const codeState = $derived(state.codeMode === 'handler' ? handlerCode : guardCode);
	const filename = $derived(state.codeMode === 'handler' ? 'handler.ts' : 'machine.ts');
</script>

<div class="mx-auto flex w-full max-w-md flex-col gap-6">
	<!-- Code file card -->
	<FileCard title={filename}>
		<CodeBlock state={codeState} {focusIds} stagger={false} />
	</FileCard>

	<!-- State graph + context footer -->
	<div class="overflow-hidden rounded-xl border border-border/15">
		<ExplainerGraph graph={saveWorkflowGraph} snapshot={graphSnapshot} arrowId="ga-arrow" />

		<!-- Context bar -->
		<div class="border-t border-border/15 bg-muted/10 px-4 py-2.5 font-mono text-xs">
			<span class="text-muted-foreground/40">context · </span>
			<span class="text-muted-foreground/60">retries: </span>
			<span
				class="font-medium transition-colors duration-200"
				class:text-destructive={state.retries >= 3}
				class:text-foreground={state.retries < 3}>{state.retries}</span
			>
			{#if state.retries >= 3}
				<span in:fade={{ duration: 180 }} class="ml-2 text-destructive/60">— limit reached</span>
			{/if}
		</div>
	</div>
</div>
