<script lang="ts">
	import FlowArrowDefs from '$lib/visuals/flow-chart/flow-arrow-defs.svelte';
	import FlowChart from '$lib/visuals/flow-chart/flow-chart.svelte';
	import FlowEdge from '$lib/visuals/flow-chart/flow-edge.svelte';
	import FlowLabel from '$lib/visuals/flow-chart/flow-label.svelte';
	import FlowNode from '$lib/visuals/flow-chart/flow-node.svelte';
	import ComponentPreview from './component-preview.svelte';
	import { codeExample } from './code-example.js';
	import SectionHeading from './section-heading.svelte';

	const code = codeExample(
		'svelte',
		`
<FlowChart viewBox="0 0 520 260" label="Tone matrix" arrowId="lab-flow">
  <FlowArrowDefs />
  <FlowEdge d="M 86 62 C 142 62, 170 62, 226 62" tone="default" />
  <FlowEdge d="M 86 112 C 142 112, 170 112, 226 112" tone="active" />
  <FlowEdge d="M 86 162 C 142 162, 170 162, 226 162" tone="success" />
  <FlowEdge d="M 86 212 C 142 212, 170 212, 226 212" tone="invalid" />
  <FlowNode x={52} y={62}>Default</FlowNode>
  <FlowNode x={270} y={62} tone="default">Node</FlowNode>
  <FlowNode x={52} y={112} tone="active">Active</FlowNode>
  <FlowNode x={270} y={112} tone="active">Node</FlowNode>
  <FlowNode x={52} y={162} tone="success">Success</FlowNode>
  <FlowNode x={270} y={162} tone="success">Node</FlowNode>
  <FlowNode x={52} y={212} tone="invalid">Invalid</FlowNode>
  <FlowNode x={270} y={212} tone="blocked">Blocked</FlowNode>
  <FlowLabel x={392} y={66} anchor="start">Default label</FlowLabel>
  <FlowLabel x={392} y={116} anchor="start" tone="active">Active label</FlowLabel>
  <FlowLabel x={392} y={166} anchor="start" tone="success">Success label</FlowLabel>
  <FlowLabel x={392} y={216} anchor="start" tone="invalid">Invalid label</FlowLabel>
</FlowChart>
`
	);
</script>

<section class="space-y-4">
	<SectionHeading
		title="Flow chart"
		description="Compose SVG nodes, edges, and labels directly. Each piece accepts a tone prop for state-driven color."
	/>
	<ComponentPreview
		title="Tone matrix"
		description="Every node and edge tone rendered side by side."
		{code}
	>
		<FlowChart viewBox="0 0 520 260" label="Flow primitive tone matrix" arrowId="lab-flow">
			<FlowArrowDefs />
			<FlowEdge d="M 86 62 C 142 62, 170 62, 226 62" tone="default" />
			<FlowEdge d="M 86 112 C 142 112, 170 112, 226 112" tone="active" />
			<FlowEdge d="M 86 162 C 142 162, 170 162, 226 162" tone="success" />
			<FlowEdge d="M 86 212 C 142 212, 170 212, 226 212" tone="invalid" />
			<FlowNode x={52} y={62}>Default</FlowNode>
			<FlowNode x={270} y={62} tone="default">Node</FlowNode>
			<FlowNode x={52} y={112} tone="active">Active</FlowNode>
			<FlowNode x={270} y={112} tone="active">Node</FlowNode>
			<FlowNode x={52} y={162} tone="success">Success</FlowNode>
			<FlowNode x={270} y={162} tone="success">Node</FlowNode>
			<FlowNode x={52} y={212} tone="invalid">Invalid</FlowNode>
			<FlowNode x={270} y={212} tone="blocked">Blocked</FlowNode>
			<FlowLabel x={392} y={66} anchor="start">Default label</FlowLabel>
			<FlowLabel x={392} y={116} anchor="start" tone="active">Active label</FlowLabel>
			<FlowLabel x={392} y={166} anchor="start" tone="success">Success label</FlowLabel>
			<FlowLabel x={392} y={216} anchor="start" tone="invalid">Invalid label</FlowLabel>
		</FlowChart>
	</ComponentPreview>
</section>
