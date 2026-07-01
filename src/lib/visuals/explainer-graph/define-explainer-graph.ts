import type { ExplainerGraph } from './explainer-graph-types.js';

export function defineExplainerGraph<const NodeId extends string, const EdgeId extends string>(
	graph: ExplainerGraph<NodeId, EdgeId>
): ExplainerGraph<NodeId, EdgeId> {
	return graph;
}
