<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { defineExplainerGraph } from '$lib/visuals/explainer-graph/define-explainer-graph.js';
	import ExplainerGraph from '$lib/visuals/explainer-graph/explainer-graph.svelte';
	import type { ExplainerGraphSnapshot } from '$lib/visuals/explainer-graph/explainer-graph-types.js';
	import ComponentPreview from './component-preview.svelte';
	import { codeExample } from './code-example.js';
	import Scenario from './scenario-card.svelte';
	import SectionHeading from './section-heading.svelte';

	type NodeId = 'input' | 'parse' | 'plan' | 'ship';
	type EdgeId = 'input-parse' | 'parse-plan' | 'plan-ship' | 'parse-ship';

	const graph = defineExplainerGraph<NodeId, EdgeId>({
		viewBox: '0 0 560 280',
		nodes: {
			input: { id: 'input', label: 'Input', x: 86, y: 82 },
			parse: { id: 'parse', label: 'Parse', x: 242, y: 82 },
			plan: { id: 'plan', label: 'Plan', x: 398, y: 82 },
			ship: { id: 'ship', label: 'Ship', x: 398, y: 198 }
		},
		edges: {
			'input-parse': {
				id: 'input-parse',
				from: 'input',
				to: 'parse',
				path: 'M 130 82 C 166 82, 178 82, 198 82',
				labels: { ok: { x: 164, y: 68, text: 'valid', anchor: 'middle' } }
			},
			'parse-plan': {
				id: 'parse-plan',
				from: 'parse',
				to: 'plan',
				path: 'M 286 82 C 322 82, 334 82, 354 82',
				labels: { ok: { x: 320, y: 68, text: 'ready', anchor: 'middle' } }
			},
			'plan-ship': {
				id: 'plan-ship',
				from: 'plan',
				to: 'ship',
				path: 'M 398 98 C 398 130, 398 150, 398 180',
				labels: { ok: { x: 414, y: 142, text: 'approved', anchor: 'start' } }
			},
			'parse-ship': {
				id: 'parse-ship',
				from: 'parse',
				to: 'ship',
				path: 'M 276 98 C 330 136, 342 166, 360 188',
				labels: { retry: { x: 330, y: 154, text: 'shortcut?', anchor: 'middle' } }
			}
		}
	});

	const snapshots: Array<{
		name: string;
		description: string;
		snapshot: ExplainerGraphSnapshot<NodeId, EdgeId>;
	}> = [
		{
			name: 'Active path',
			description: 'Current node, active edges, and visible success labels.',
			snapshot: {
				currentNode: 'plan',
				activeNodeIds: ['input', 'parse'],
				activeEdgeIds: ['parse-plan'],
				successEdgeIds: ['input-parse'],
				visibleLabels: [
					{ edge: 'input-parse', key: 'ok', tone: 'success' },
					{ edge: 'parse-plan', key: 'ok', tone: 'active' }
				]
			}
		},
		{
			name: 'Blocked branch',
			description: 'Failure and blocked tones with a subset of visible edges.',
			snapshot: {
				visibleEdges: ['input-parse', 'parse-ship', 'plan-ship'],
				currentNode: 'parse',
				invalidEdgeIds: ['parse-ship'],
				blockedEdgeIds: ['plan-ship'],
				blockedNodeIds: ['ship'],
				visibleLabels: [{ edge: 'parse-ship', key: 'retry', tone: 'invalid' }]
			}
		},
		{
			name: 'Skeleton',
			description: 'No edges visible, useful for intro/empty animation states.',
			snapshot: { visibleEdges: 'none', currentNode: 'input' }
		}
	];

	const code = codeExample(
		'typescript',
		`
const graph = defineExplainerGraph({
  viewBox: '0 0 560 280',
  nodes: {
    input: { id: 'input', label: 'Input', x: 86,  y: 82  },
    parse: { id: 'parse', label: 'Parse', x: 242, y: 82  },
    plan:  { id: 'plan',  label: 'Plan',  x: 398, y: 82  },
    ship:  { id: 'ship',  label: 'Ship',  x: 398, y: 198 }
  },
  edges: {
    'input-parse': { id: 'input-parse', from: 'input', to: 'parse',
      path: 'M 130 82 C 166 82, 178 82, 198 82',
      labels: { ok: { x: 164, y: 68, text: 'valid', anchor: 'middle' } }
    },
    'parse-plan': { id: 'parse-plan', from: 'parse', to: 'plan',
      path: 'M 286 82 C 322 82, 334 82, 354 82',
      labels: { ok: { x: 320, y: 68, text: 'ready', anchor: 'middle' } }
    },
    'plan-ship': { id: 'plan-ship', from: 'plan', to: 'ship',
      path: 'M 398 98 C 398 130, 398 150, 398 180',
      labels: { ok: { x: 414, y: 142, text: 'approved', anchor: 'start' } }
    }
  }
});

// Reactive snapshot drives all visual state
let snapshot = $state({
  currentNode: 'plan',
  activeNodeIds: ['input', 'parse'],
  activeEdgeIds: ['parse-plan'],
  successEdgeIds: ['input-parse'],
  visibleLabels: [
    { edge: 'input-parse', key: 'ok', tone: 'success' },
    { edge: 'parse-plan',  key: 'ok', tone: 'active'  }
  ]
});
`
	);

	let selectedSnapshot = $state(snapshots[0]);
</script>

<section class="space-y-4">
	<SectionHeading
		title="Explainer graph"
		description="Define graph data once, then drive all visual state with snapshots. Edges and labels animate between states."
	/>
	<!-- eslint-disable-next-line better-tailwindcss/no-restricted-classes -- The inspector column needs a fixed readable width beside the graph preview. -->
	<div class="grid gap-4 lg:grid-cols-[1fr_300px]">
		<ComponentPreview
			title={selectedSnapshot.name}
			description={selectedSnapshot.description}
			{code}
		>
			<div class="mb-4 flex flex-wrap gap-2">
				{#each snapshots as item (item.name)}
					<Button
						size="sm"
						variant={selectedSnapshot.name === item.name ? 'default' : 'outline'}
						onclick={() => (selectedSnapshot = item)}
					>
						{item.name}
					</Button>
				{/each}
			</div>
			<ExplainerGraph
				{graph}
				snapshot={selectedSnapshot.snapshot}
				arrowId="lab-interactive-explainer"
				label={`${selectedSnapshot.name} explainer graph`}
			/>
		</ComponentPreview>

		<Scenario title="What to inspect" description="Things to verify when switching snapshots.">
			<ul class="space-y-3 text-sm text-muted-foreground">
				<li>Edges fade in and out when visibility changes.</li>
				<li>Labels follow the selected snapshot and tone.</li>
				<li>Node tones remain stable while edges animate.</li>
			</ul>
		</Scenario>
	</div>
</section>
