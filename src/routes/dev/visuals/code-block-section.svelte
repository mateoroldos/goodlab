<script lang="ts">
	import CodeBlock, { type CodeBlockState } from '$lib/visuals/code-block/code-block.svelte';
	import ComponentPreview from './component-preview.svelte';
	import { codeExample } from './code-example.js';
	import SectionHeading from './section-heading.svelte';

	const codeBlocks: Array<{
		name: string;
		description: string;
		state: CodeBlockState;
		code: CodeBlockState;
	}> = [
		{
			name: 'TypeScript highlights',
			description: 'Highlighted and dimmed lines for drawing attention to a specific expression.',
			state: {
				language: 'typescript',
				lines: [
					{ content: 'const visible = snapshot.visibleEdges ?? "all";', highlighted: true },
					{ content: 'if (visible === "none") return [];' },
					{ content: 'return visible.filter((id) => id in graph.edges);', dimmed: true }
				]
			},
			code: codeExample(
				'svelte',
				`
<CodeBlock
  state={{
    language: 'typescript',
    lines: [
      { content: 'const visible = snapshot.visibleEdges ?? "all";', highlighted: true },
      { content: 'if (visible === "none") return [];' },
      { content: 'return visible.filter((id) => id in graph.edges);', dimmed: true }
    ]
  }}
/>
`
			)
		},
		{
			name: 'Svelte snippet',
			description: 'Mixed indentation and tag highlighting in a Svelte template.',
			state: {
				language: 'svelte',
				lines: [
					{ content: '<FlowChart label="Pipeline">' },
					{ content: '\t<FlowArrowDefs />', highlighted: true },
					{ content: '\t<FlowNode x={120} y={80}>Parse</FlowNode>' },
					{ content: '</FlowChart>' }
				]
			},
			code: codeExample(
				'svelte',
				`
<CodeBlock
  state={{
    language: 'svelte',
    lines: [
      { content: '<FlowChart label="Pipeline">' },
      { content: '\\t<FlowArrowDefs />', highlighted: true },
      { content: '\\t<FlowNode x={120} y={80}>Parse</FlowNode>' },
      { content: '</FlowChart>' }
    ]
  }}
/>
`
			)
		}
	];
</script>

<section class="space-y-4">
	<SectionHeading
		title="Code block"
		description="Syntax-highlighted lines with per-line highlight and dim states. Shiki resolves asynchronously — allow a moment for colors to settle."
	/>
	<div class="grid gap-4 lg:grid-cols-2">
		{#each codeBlocks as item (item.name)}
			<ComponentPreview title={item.name} description={item.description} code={item.code}>
				<CodeBlock state={item.state} />
			</ComponentPreview>
		{/each}
	</div>
</section>
