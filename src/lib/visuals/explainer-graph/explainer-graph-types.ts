import type { FlowAnchor, FlowTone } from '$lib/visuals/flow-chart/flow-types.js';

export type ExplainerGraphEdgeVisibility<EdgeId extends string> =
	| 'all'
	| 'none'
	| readonly EdgeId[];

export interface ExplainerGraphPoint {
	x: number;
	y: number;
}

export interface ExplainerGraphLabel extends ExplainerGraphPoint {
	text: string;
	anchor?: FlowAnchor;
}

export interface ExplainerGraphNode<NodeId extends string = string> extends ExplainerGraphPoint {
	id: NodeId;
	label?: string;
	width?: number;
	height?: number;
	radius?: number;
}

export interface ExplainerGraphEdge<
	EdgeId extends string = string,
	NodeId extends string = string
> {
	id: EdgeId;
	from?: NodeId;
	to?: NodeId;
	path: string;
	labels?: Record<string, ExplainerGraphLabel>;
}

export interface ExplainerGraph<NodeId extends string = string, EdgeId extends string = string> {
	viewBox?: string;
	nodes: Record<NodeId, ExplainerGraphNode<NodeId>>;
	edges: Record<EdgeId, ExplainerGraphEdge<EdgeId, NodeId>>;
}

export interface ExplainerGraphLabelRef<EdgeId extends string = string> {
	edge: EdgeId;
	key: string;
	tone?: FlowTone;
}

export interface ExplainerGraphSnapshot<
	NodeId extends string = string,
	EdgeId extends string = string
> {
	visibleEdges?: ExplainerGraphEdgeVisibility<EdgeId>;
	currentNode?: NodeId;
	activeNodeIds?: readonly NodeId[];
	blockedNodeIds?: readonly NodeId[];
	activeEdgeIds?: readonly EdgeId[];
	successEdgeIds?: readonly EdgeId[];
	invalidEdgeIds?: readonly EdgeId[];
	blockedEdgeIds?: readonly EdgeId[];
	visibleLabels?: ReadonlyArray<ExplainerGraphLabelRef<EdgeId>>;
	nodeTones?: Partial<Record<NodeId, FlowTone>>;
	edgeTones?: Partial<Record<EdgeId, FlowTone>>;
	/**
	 * Spotlight: nodes that aren't current/active/blocked (or explicitly toned)
	 * dim, so the one node being discussed is the single focus point.
	 */
	spotlight?: boolean;
}

export interface ExplainerGraphMotion {
	edges?: boolean;
	labels?: boolean;
	edgeInMs?: number;
	edgeOutMs?: number;
	labelInMs?: number;
	labelOutMs?: number;
}

export interface ResolvedExplainerGraphLabel<
	EdgeId extends string = string
> extends ExplainerGraphLabel {
	id: string;
	edge: EdgeId;
	key: string;
	tone: FlowTone;
}
