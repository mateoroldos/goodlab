<script lang="ts" generics="NodeId extends string, EdgeId extends string">
	import { fade } from 'svelte/transition';
	import FlowArrowDefs from '$lib/visuals/flow-chart/flow-arrow-defs.svelte';
	import FlowChart from '$lib/visuals/flow-chart/flow-chart.svelte';
	import FlowEdge from '$lib/visuals/flow-chart/flow-edge.svelte';
	import FlowLabel from '$lib/visuals/flow-chart/flow-label.svelte';
	import FlowNode from '$lib/visuals/flow-chart/flow-node.svelte';
	import type { FlowTone } from '$lib/visuals/flow-chart/flow-types.js';
	import type {
		ExplainerGraph,
		ExplainerGraphMotion,
		ExplainerGraphSnapshot,
		ResolvedExplainerGraphLabel
	} from './explainer-graph-types.js';

	interface Props {
		graph: ExplainerGraph<NodeId, EdgeId>;
		snapshot?: ExplainerGraphSnapshot<NodeId, EdgeId>;
		arrowId?: string;
		label?: string;
		class?: string;
		motion?: ExplainerGraphMotion;
	}

	const {
		graph,
		snapshot = {},
		arrowId = 'explainer-graph-arrow',
		label,
		class: className,
		motion = {}
	}: Props = $props();

	const nodeIds = $derived(Object.keys(graph.nodes) as NodeId[]);
	const edgeIds = $derived(Object.keys(graph.edges) as EdgeId[]);

	const visibleEdgeIds = $derived.by((): EdgeId[] => {
		const visible = snapshot.visibleEdges ?? 'all';
		if (visible === 'none') return [];
		if (visible === 'all') return edgeIds;
		return visible.filter((id) => id in graph.edges);
	});

	const activeNodeSet = $derived(new Set(snapshot.activeNodeIds ?? []));
	const blockedNodeSet = $derived(new Set(snapshot.blockedNodeIds ?? []));
	const activeEdgeSet = $derived(new Set(snapshot.activeEdgeIds ?? []));
	const successEdgeSet = $derived(new Set(snapshot.successEdgeIds ?? []));
	const invalidEdgeSet = $derived(new Set(snapshot.invalidEdgeIds ?? []));
	const blockedEdgeSet = $derived(new Set(snapshot.blockedEdgeIds ?? []));

	function nodeTone(id: NodeId): FlowTone {
		const override = snapshot.nodeTones?.[id];
		if (override) return override;
		if (blockedNodeSet.has(id)) return 'blocked';
		if (snapshot.currentNode === id || activeNodeSet.has(id)) return 'active';
		return 'default';
	}

	function edgeTone(id: EdgeId): FlowTone {
		const override = snapshot.edgeTones?.[id];
		if (override) return override;
		if (blockedEdgeSet.has(id)) return 'blocked';
		if (activeEdgeSet.has(id)) return 'active';
		if (invalidEdgeSet.has(id)) return 'invalid';
		if (successEdgeSet.has(id)) return 'success';
		return 'dim';
	}

	const visibleLabels = $derived.by(
		(): Array<ResolvedExplainerGraphLabel<EdgeId>> =>
			(snapshot.visibleLabels ?? []).flatMap((ref) => {
				const label = graph.edges[ref.edge]?.labels?.[ref.key];
				if (!label) return [];
				return [
					{
						...label,
						id: `${ref.edge}:${ref.key}`,
						edge: ref.edge,
						key: ref.key,
						tone: ref.tone ?? 'active'
					}
				];
			})
	);

	const edgeInMs = $derived(motion.edgeInMs ?? 280);
	const edgeOutMs = $derived(motion.edgeOutMs ?? 180);
	const labelInMs = $derived(motion.labelInMs ?? 220);
	const labelOutMs = $derived(motion.labelOutMs ?? 150);
</script>

<FlowChart {arrowId} viewBox={graph.viewBox} {label} class={className}>
	<FlowArrowDefs />

	{#each visibleEdgeIds as edgeId (edgeId)}
		{@const edge = graph.edges[edgeId]}
		{#if motion.edges === false}
			<FlowEdge d={edge.path} tone={edgeTone(edgeId)} />
		{:else}
			<g in:fade={{ duration: edgeInMs }} out:fade={{ duration: edgeOutMs }}>
				<FlowEdge d={edge.path} tone={edgeTone(edgeId)} />
			</g>
		{/if}
	{/each}

	{#each visibleLabels as item (item.id)}
		{#if motion.labels === false}
			<FlowLabel x={item.x} y={item.y} anchor={item.anchor} tone={item.tone}>
				{item.text}
			</FlowLabel>
		{:else}
			<g in:fade={{ duration: labelInMs }} out:fade={{ duration: labelOutMs }}>
				<FlowLabel x={item.x} y={item.y} anchor={item.anchor} tone={item.tone}>
					{item.text}
				</FlowLabel>
			</g>
		{/if}
	{/each}

	{#each nodeIds as nodeId (nodeId)}
		{@const node = graph.nodes[nodeId]}
		<FlowNode
			x={node.x}
			y={node.y}
			width={node.width}
			height={node.height}
			radius={node.radius}
			tone={nodeTone(nodeId)}
		>
			{node.label ?? node.id}
		</FlowNode>
	{/each}
</FlowChart>
