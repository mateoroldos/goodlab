<script lang="ts">
	import { cn } from '$lib/utils.js';
	import { getFlowChartContext } from './flow-chart-context.js';

	interface Props {
		id?: string;
	}

	const { id }: Props = $props();
	const ctx = getFlowChartContext();
	const arrowId = $derived(id ?? ctx.arrowId());

	const tones = ['default', 'active', 'success', 'invalid', 'blocked'] as const;
	type ArrowTone = (typeof tones)[number];

	// blocked reuses invalid's arrowhead color — its distinction is the dashed edge, not the marker.
	const arrowClass = (tone: ArrowTone): string =>
		cn(
			// eslint-disable-next-line better-tailwindcss/no-restricted-classes -- SVG markers only animate fill; Tailwind has no non-arbitrary fill-only transition utility.
			'transition-[fill] duration-200 ease-out motion-reduce:transition-none',
			tone === 'default' && 'fill-muted-foreground opacity-40',
			tone === 'active' && 'fill-primary',
			tone === 'success' && 'fill-green-500',
			(tone === 'invalid' || tone === 'blocked') && 'fill-destructive'
		);
</script>

<defs>
	{#each tones as tone (tone)}
		<marker
			id={`${arrowId}-${tone}`}
			viewBox="0 0 10 10"
			refX="9"
			refY="5"
			markerWidth="5"
			markerHeight="5"
			orient="auto"
		>
			<path d="M 0 1 L 9 5 L 0 9 z" class={arrowClass(tone)} />
		</marker>
	{/each}
</defs>
