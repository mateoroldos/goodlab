<script module lang="ts">
	export type EffectsNodeId = 'idle' | 'saving' | 'failed' | 'saved';
	export type EffectsEdgeId =
		| 'idle-saving'
		| 'saving-saved'
		| 'saving-failed'
		| 'failed-saving'
		| 'saved-idle';

	export interface EffectsSceneState {
		codeMode: 'handler' | 'machine';
		currentNode: EffectsNodeId;
		activeEdge?: EffectsEdgeId;
		activeAction?: string;
		/** Handler construction stage: 0 empty shell, 1 status moves, 2 side effects. Omit for full. */
		handlerStep?: 0 | 1 | 2;
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
		state: EffectsSceneState;
	}

	const { state }: Props = $props();
	const sounds = soundContext.get();

	let prevActiveEdge: EffectsSceneState['activeEdge'];
	$effect(() => {
		if (state.activeEdge !== prevActiveEdge && state.activeEdge !== undefined) {
			sounds.play('ui.transition');
		}
		prevActiveEdge = state.activeEdge;
	});

	const graphSnapshot = $derived({
		visibleEdges: saveWorkflowValidEdges,
		currentNode: state.currentNode,
		activeEdgeIds: state.activeEdge ? [state.activeEdge] : [],
		visibleLabels: state.activeAction ? saveWorkflowLabel(state.activeEdge, 'action') : [],
		spotlight: true
	});

	// The naive fix uses send() — events are the interface after ep3. The smell
	// here is the effects (clearError, incrementRetries) scattered in the handler
	// instead of declared on the machine transitions where they belong.
	const handlerCode = $derived.by((): CodeBlockState => {
		const step = state.handlerStep ?? 2;
		return {
			language: 'typescript',
			lines: [
				{ id: 'h0', content: 'async function handleSave() {' },
				...(step >= 1
					? [
							{ id: 'h1', content: "  send({ type: 'SAVE' })" },
							{ id: 'h2', content: '  try {' },
							{ id: 'h3', content: '    await api.save()' },
							{ id: 'h4', content: "    send({ type: 'SUCCESS' })" }
						]
					: []),
				...(step >= 2 ? [{ id: 'h5', content: '    clearError()' }] : []),
				...(step >= 1
					? [
							{ id: 'h6', content: '  } catch {' },
							{ id: 'h7', content: "    send({ type: 'FAIL' })" }
						]
					: []),
				...(step >= 2 ? [{ id: 'h8', content: '    incrementRetries()' }] : []),
				...(step >= 1 ? [{ id: 'h9', content: '  }' }] : []),
				{ id: 'h10', content: '}' }
			]
		};
	});

	// While the handler constructs, the newest lines take the spotlight.
	const handlerFocusIds = $derived.by((): ReadonlySet<string> | undefined => {
		if (state.handlerStep === 1) return new Set(['h1', 'h4', 'h7']);
		if (state.handlerStep === 2) return new Set(['h5', 'h8']);
		return undefined;
	});

	// Static — lines never change, only highlights change based on activeAction.
	// Highlights passed separately so in:fly only fires when lines are added/removed.
	const machineCode: CodeBlockState = {
		language: 'typescript',
		lines: [
			{ id: 'e0', content: 'idle: {' },
			{ id: 'e1', content: "  on: { SAVE:    { target: 'saving'," },
			{ id: 'e2', content: "                   actions: 'startRequest' } }" },
			{ id: 'e3', content: '},' },
			{ id: 'e4', content: 'saving: {' },
			{ id: 'e5', content: "  on: { SUCCESS: { target: 'saved'," },
			{ id: 'e6', content: "                   actions: 'clearError' }," },
			{ id: 'e7', content: "        FAIL:    { target: 'failed'," },
			{ id: 'e8', content: "                   actions: 'incrementRetries' } }" },
			{ id: 'e9', content: '},' },
			{ id: 'e10', content: 'failed: {' },
			{ id: 'e11', content: "  on: { RETRY:   { target: 'saving'," },
			{ id: 'e12', content: "                   actions: 'startRequest' } }" },
			{ id: 'e13', content: '}' }
		]
	};

	// One highlight at a time: the action line on the edge being crossed right now
	// (startRequest appears twice in the code — only the crossed edge's copy lights up)
	const edgeActionLine: Partial<Record<EffectsEdgeId, string>> = {
		'idle-saving': 'e2',
		'saving-saved': 'e6',
		'saving-failed': 'e8',
		'failed-saving': 'e12'
	};

	// Spotlight the crossed edge's action line; the rest of the machine dims.
	const machineFocusIds = $derived.by((): ReadonlySet<string> => {
		const id =
			state.activeAction && state.activeEdge ? edgeActionLine[state.activeEdge] : undefined;
		return id ? new Set([id]) : new Set();
	});

	const codeState = $derived(state.codeMode === 'handler' ? handlerCode : machineCode);
	const filename = $derived(state.codeMode === 'handler' ? 'handler.ts' : 'machine.ts');
</script>

<div class="mx-auto flex w-full max-w-md flex-col gap-6">
	<!-- Code file card -->
	<FileCard title={filename}>
		<CodeBlock
			state={codeState}
			focusIds={state.codeMode === 'machine' ? machineFocusIds : handlerFocusIds}
			stagger={false}
		/>
	</FileCard>

	<!-- State graph -->
	<div class="overflow-hidden rounded-xl border border-border/15">
		<ExplainerGraph graph={saveWorkflowGraph} snapshot={graphSnapshot} arrowId="ef-arrow" />
	</div>
</div>
