<script module lang="ts">
	export type NodeId = 'idle' | 'saving' | 'failed' | 'saved';
	export type EdgeId =
		| 'idle-saving'
		| 'saving-saved'
		| 'saving-failed'
		| 'failed-saving'
		| 'saved-idle'
		| 'idle-failed'
		| 'failed-saved';

	export interface StateGraphSceneState {
		/** The single focus point: the node the machine is in right now. */
		activeNode?: NodeId;
		visibleEdges: EdgeId[];
		invalidEdges: EdgeId[];
	}
</script>

<script lang="ts">
	import CodeBlock, { type CodeBlockState } from '$lib/visuals/code-block/code-block.svelte';
	import ExplainerGraph from '$lib/visuals/explainer-graph/explainer-graph.svelte';
	import FileCard from '$lib/visuals/file-card/file-card.svelte';
	import { soundContext } from '$lib/sounds/sound-effects.svelte.js';
	import {
		saveWorkflowGraph,
		type SaveWorkflowAnyEdgeId
	} from '../../shared/save-workflow-graph.js';

	interface Props {
		state: StateGraphSceneState;
	}

	const { state }: Props = $props();

	const sounds = soundContext.get();

	// Play error sound when invalid edges first appear
	let prevInvalidCount = 0;
	$effect(() => {
		const count = state.invalidEdges.length;
		if (count > prevInvalidCount) sounds.play('ui.error');
		prevInvalidCount = count;
	});

	const graphSnapshot = $derived({
		visibleEdges: state.visibleEdges as readonly SaveWorkflowAnyEdgeId[],
		invalidEdgeIds: state.invalidEdges as readonly SaveWorkflowAnyEdgeId[],
		currentNode: state.activeNode,
		// Spotlight only when a node is the focus — with no current node the
		// whole map should read at full strength.
		spotlight: state.activeNode !== undefined
	});

	// The active node is the single focus: its union member lights, the rest dim.
	const codeFocusIds = $derived(new Set<string>(state.activeNode ? [state.activeNode] : []));

	const codeState = $derived.by(
		(): CodeBlockState => ({
			language: 'typescript',
			lines: [
				{ id: 'type', content: 'type Status =' },
				{ id: 'idle', content: "  | 'idle'" },
				{ id: 'saving', content: "  | 'saving'" },
				{ id: 'failed', content: "  | 'failed'" },
				{ id: 'saved', content: "  | 'saved'" }
			]
		})
	);
</script>

<div class="mx-auto flex w-full max-w-md flex-col gap-6">
	<!-- Type definition -->
	<FileCard title="status.ts">
		<CodeBlock state={codeState} focusIds={codeFocusIds} stagger={false} />
	</FileCard>

	<!-- State graph -->
	<ExplainerGraph graph={saveWorkflowGraph} snapshot={graphSnapshot} arrowId="sg-arrow" />
</div>
