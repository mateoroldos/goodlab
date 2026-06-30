<script module lang="ts">
	export type NodeId = 'idle' | 'saving' | 'failed' | 'saved';
	export type EdgeId =
		| 'idle-saving'
		| 'saving-saved'
		| 'saving-failed'
		| 'failed-saving'
		| 'saved-idle';
	export type EventId = 'SAVE' | 'SUCCESS' | 'FAIL' | 'RETRY' | 'DONE';

	/**
	 * The single focus point, named as a concept: a rule. Its representations
	 * (the event line in code, the edge on the map) light together; everything
	 * else dims.
	 */
	export interface StateEventsFocus {
		event?: EventId;
		edge?: EdgeId;
	}

	export interface StateEventsSceneState {
		currentNode: NodeId;
		focus?: StateEventsFocus;
		/** Event was sent but the current state had no rule for it */
		rejected?: boolean;
		codeMode: 'event-type' | 'transition-map';
		/** Event type members revealed so far (0 = bare type line, 1–5 = each event). Omit for all five. */
		eventsRevealed?: 0 | 1 | 2 | 3 | 4 | 5;
		/** Rules revealed so far in the transition map (0 = empty table). Omit for all five. */
		mapRevealed?: 0 | 1 | 2 | 3 | 4 | 5;
	}
</script>

<script lang="ts">
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
		state: StateEventsSceneState;
	}

	const { state }: Props = $props();

	const sounds = soundContext.get();

	const focusEdge = $derived(state.focus?.edge);
	const focusEvent = $derived(state.focus?.event);

	// Sound feedback on transitions and rejections (skip initial mount)
	let prevEdge: EdgeId | undefined;
	let prevRejected: boolean | undefined;
	$effect(() => {
		if (focusEdge !== prevEdge && focusEdge !== undefined) {
			sounds.play('ui.transition');
		}
		if (state.rejected && !prevRejected) {
			sounds.play('ui.rejected');
		}
		prevEdge = focusEdge;
		prevRejected = state.rejected;
	});

	const graphSnapshot = $derived({
		visibleEdges: saveWorkflowValidEdges,
		currentNode: state.currentNode,
		activeEdgeIds: focusEdge ? [focusEdge] : [],
		blockedNodeIds: state.rejected ? [state.currentNode] : [],
		visibleLabels: saveWorkflowLabel(focusEdge, 'event'),
		spotlight: true
	});

	// Event type members are revealed one by one as the narration names each event.
	const allEventLines = [
		{ id: 'SAVE', content: "  | { type: 'SAVE' }" },
		{ id: 'SUCCESS', content: "  | { type: 'SUCCESS' }" },
		{ id: 'FAIL', content: "  | { type: 'FAIL' }" },
		{ id: 'RETRY', content: "  | { type: 'RETRY' }" },
		{ id: 'DONE', content: "  | { type: 'DONE' }" }
	];
	const eventTypeCode = $derived.by((): CodeBlockState => {
		const revealed = state.eventsRevealed ?? 5;
		return {
			language: 'typescript',
			lines: [{ id: 'et0', content: 'type Event =' }, ...allEventLines.slice(0, revealed)]
		};
	});

	// Rules appear one by one as the narration names them; the braces stay put.
	const transitionMapCode = $derived.by((): CodeBlockState => {
		const revealed = state.mapRevealed ?? 5;
		const rules = [
			{ id: 'tm-idle', content: "  idle:   { SAVE: 'saving'  }," },
			{ id: 'tm-saving-s', content: "  saving: { SUCCESS: 'saved'," },
			{ id: 'tm-saving-f', content: "             FAIL: 'failed' }," },
			{ id: 'tm-failed', content: "  failed: { RETRY: 'saving'  }," },
			{ id: 'tm-saved', content: "  saved:  { DONE: 'idle'    }," }
		];
		return {
			language: 'typescript',
			lines: [
				{ id: 'tm0', content: 'const rules = {' },
				...rules.slice(0, revealed),
				{ id: 'tm-end', content: '}' }
			]
		};
	});

	const codeState = $derived(state.codeMode === 'event-type' ? eventTypeCode : transitionMapCode);

	// The focused rule's line spotlights; every other line dims.
	const focusIds = $derived.by((): ReadonlySet<string> | undefined => {
		const h = focusEvent;
		if (!h) return undefined;
		// Map each event to the corresponding line ID in the current code mode.
		const lineId =
			state.codeMode === 'event-type'
				? h // event-type IDs match event names exactly
				: (
						{
							SAVE: 'tm-idle',
							SUCCESS: 'tm-saving-s',
							FAIL: 'tm-saving-f',
							RETRY: 'tm-failed',
							DONE: 'tm-saved'
						} as const
					)[h];
		return lineId ? new Set([lineId]) : undefined;
	});

	const filename = $derived(state.codeMode === 'event-type' ? 'events.ts' : 'machine.ts');
</script>

<div class="mx-auto flex w-full max-w-md flex-col gap-6">
	<!-- Code panel -->
	<FileCard title={filename}>
		<CodeBlock state={codeState} {focusIds} stagger={false} />
	</FileCard>

	<!-- State graph -->
	<ExplainerGraph graph={saveWorkflowGraph} snapshot={graphSnapshot} arrowId="se-arrow" />
</div>
