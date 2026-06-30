import { defineExplainerGraph } from '$lib/visuals/explainer-graph/define-explainer-graph.js';
import type { ExplainerGraphLabelRef } from '$lib/visuals/explainer-graph/explainer-graph-types.js';

export type SaveWorkflowNodeId = 'idle' | 'saving' | 'failed' | 'saved';

export type SaveWorkflowEdgeId =
	| 'idle-saving'
	| 'saving-saved'
	| 'saving-failed'
	| 'failed-saving'
	| 'saved-idle';

export type SaveWorkflowInvalidEdgeId = 'idle-failed' | 'failed-saved';

export type SaveWorkflowAnyEdgeId = SaveWorkflowEdgeId | SaveWorkflowInvalidEdgeId;

export const saveWorkflowGraph = defineExplainerGraph<SaveWorkflowNodeId, SaveWorkflowAnyEdgeId>({
	nodes: {
		idle: { id: 'idle', x: 240, y: 46 },
		saving: { id: 'saving', x: 240, y: 140 },
		failed: { id: 'failed', x: 100, y: 230 },
		saved: { id: 'saved', x: 380, y: 230 }
	},
	edges: {
		'idle-saving': {
			id: 'idle-saving',
			from: 'idle',
			to: 'saving',
			path: 'M 240 62 L 240 118',
			labels: {
				event: { text: 'SAVE', x: 253, y: 90, anchor: 'start' },
				action: { text: 'startRequest', x: 252, y: 88, anchor: 'start' }
			}
		},
		'saving-saved': {
			id: 'saving-saved',
			from: 'saving',
			to: 'saved',
			path: 'M 267 156 Q 380 200 380 208',
			labels: {
				event: { text: 'SUCCESS', x: 348, y: 182, anchor: 'middle' },
				action: { text: 'clearError', x: 345, y: 192, anchor: 'start' }
			}
		},
		'saving-failed': {
			id: 'saving-failed',
			from: 'saving',
			to: 'failed',
			path: 'M 213 156 Q 100 200 100 208',
			labels: {
				event: { text: 'FAIL', x: 134, y: 182, anchor: 'middle' },
				action: { text: 'incrementRetries', x: 68, y: 192, anchor: 'end' }
			}
		},
		'failed-saving': {
			id: 'failed-saving',
			from: 'failed',
			to: 'saving',
			path: 'M 58 220 C 8 195 8 138 190 138',
			labels: {
				event: { text: 'RETRY', x: 16, y: 166, anchor: 'start' },
				guard: { text: '[retries < 3]', x: 4, y: 152, anchor: 'start' },
				action: { text: 'startRequest', x: 6, y: 176, anchor: 'start' }
			}
		},
		'saved-idle': {
			id: 'saved-idle',
			from: 'saved',
			to: 'idle',
			path: 'M 422 220 C 470 190 462 50 290 46',
			labels: {
				event: { text: 'DONE', x: 456, y: 118, anchor: 'middle' },
				action: { text: 'reset', x: 458, y: 145, anchor: 'end' }
			}
		},
		'idle-failed': {
			id: 'idle-failed',
			from: 'idle',
			to: 'failed',
			path: 'M 198 50 C 20 80 20 190 94 212'
		},
		'failed-saved': {
			id: 'failed-saved',
			from: 'failed',
			to: 'saved',
			path: 'M 144 234 L 330 234'
		}
	}
});

export const saveWorkflowValidEdges: SaveWorkflowEdgeId[] = [
	'idle-saving',
	'saving-saved',
	'saving-failed',
	'failed-saving',
	'saved-idle'
];

export function nodesTouchedBySaveWorkflowEdges(
	edges: readonly SaveWorkflowAnyEdgeId[]
): SaveWorkflowNodeId[] {
	return Array.from(
		new Set(
			edges.flatMap((id) => {
				const edge = saveWorkflowGraph.edges[id];
				return [edge.from, edge.to].filter(
					(node): node is SaveWorkflowNodeId => node !== undefined
				);
			})
		)
	);
}

export function saveWorkflowLabel(
	edge: SaveWorkflowAnyEdgeId | undefined,
	key: string,
	tone: ExplainerGraphLabelRef<SaveWorkflowAnyEdgeId>['tone'] = 'active'
): Array<ExplainerGraphLabelRef<SaveWorkflowAnyEdgeId>> {
	return edge ? [{ edge, key, tone }] : [];
}
