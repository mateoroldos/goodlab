<script lang="ts">
	import { cn } from '$lib/utils.js';
	import { getFlowChartContext } from './flow-chart-context.js';

	interface Props {
		id?: string;
	}

	const { id }: Props = $props();
	const ctx = getFlowChartContext();
	const arrowId = $derived(id ?? ctx.arrowId());

	const arrowClass = (tone: 'default' | 'active' | 'success' | 'invalid') =>
		cn(
			// eslint-disable-next-line better-tailwindcss/no-restricted-classes -- SVG markers only animate fill; Tailwind has no non-arbitrary fill-only transition utility.
			'transition-[fill] duration-200 ease-out motion-reduce:transition-none',
			tone === 'default' && 'fill-muted-foreground opacity-40',
			tone === 'active' && 'fill-primary',
			tone === 'success' && 'fill-green-500',
			tone === 'invalid' && 'fill-destructive'
		);
</script>

<defs>
	<marker
		id={`${arrowId}-default`}
		viewBox="0 0 10 10"
		refX="9"
		refY="5"
		markerWidth="5"
		markerHeight="5"
		orient="auto"
	>
		<path d="M 0 1 L 9 5 L 0 9 z" class={arrowClass('default')} />
	</marker>
	<marker
		id={`${arrowId}-active`}
		viewBox="0 0 10 10"
		refX="9"
		refY="5"
		markerWidth="5"
		markerHeight="5"
		orient="auto"
	>
		<path d="M 0 1 L 9 5 L 0 9 z" class={arrowClass('active')} />
	</marker>
	<marker
		id={`${arrowId}-success`}
		viewBox="0 0 10 10"
		refX="9"
		refY="5"
		markerWidth="5"
		markerHeight="5"
		orient="auto"
	>
		<path d="M 0 1 L 9 5 L 0 9 z" class={arrowClass('success')} />
	</marker>
	<marker
		id={`${arrowId}-invalid`}
		viewBox="0 0 10 10"
		refX="9"
		refY="5"
		markerWidth="5"
		markerHeight="5"
		orient="auto"
	>
		<path d="M 0 1 L 9 5 L 0 9 z" class={arrowClass('invalid')} />
	</marker>
	<marker
		id={`${arrowId}-blocked`}
		viewBox="0 0 10 10"
		refX="9"
		refY="5"
		markerWidth="5"
		markerHeight="5"
		orient="auto"
	>
		<path d="M 0 1 L 9 5 L 0 9 z" class={arrowClass('invalid')} />
	</marker>
</defs>
