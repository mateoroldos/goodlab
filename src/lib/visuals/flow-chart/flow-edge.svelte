<script lang="ts">
	import { cn } from '$lib/utils.js';
	import { getFlowChartContext } from './flow-chart-context.js';
	import type { FlowTone } from './flow-types.js';

	interface Props {
		d: string;
		arrowId?: string;
		tone?: FlowTone;
		class?: string;
	}

	const { d, arrowId, tone = 'default', class: className }: Props = $props();
	const ctx = getFlowChartContext();

	const markerId = $derived(arrowId ?? ctx.arrowId());
	const markerTone = $derived(tone === 'dim' ? 'default' : tone);
	const edgeClass = $derived(
		cn(
			// eslint-disable-next-line better-tailwindcss/no-restricted-classes -- SVG edges need 1.5px strokes and stroke-only transitions without precise Tailwind token equivalents.
			'fill-none stroke-[1.5] transition-[stroke,stroke-opacity,stroke-width] duration-[240ms] ease-in-out motion-reduce:transition-none',
			(tone === 'default' || tone === 'dim') && 'stroke-muted-foreground',
			// eslint-disable-next-line better-tailwindcss/no-restricted-classes -- SVG stroke opacity is a presentation attribute; Tailwind opacity would affect the whole path.
			tone === 'default' && '[stroke-opacity:0.4]',
			// eslint-disable-next-line better-tailwindcss/no-restricted-classes -- SVG stroke opacity is a presentation attribute; Tailwind opacity would affect the whole path.
			tone === 'dim' && '[stroke-opacity:0.25]',
			// eslint-disable-next-line better-tailwindcss/no-restricted-classes -- SVG stroke opacity is a presentation attribute; Tailwind opacity would affect the whole path.
			tone === 'active' && 'stroke-primary stroke-2 [stroke-opacity:0.8]',
			// eslint-disable-next-line better-tailwindcss/no-restricted-classes -- SVG stroke opacity is a presentation attribute; Tailwind opacity would affect the whole path.
			tone === 'success' && 'stroke-green-500 [stroke-opacity:0.6]',
			// eslint-disable-next-line better-tailwindcss/no-restricted-classes -- SVG dash patterns and stroke opacity have no precise Tailwind token equivalents.
			tone === 'invalid' && 'stroke-destructive [stroke-dasharray:5_4] [stroke-opacity:0.75]',
			// eslint-disable-next-line better-tailwindcss/no-restricted-classes -- SVG dash patterns and stroke opacity have no precise Tailwind token equivalents.
			tone === 'blocked' && 'stroke-destructive [stroke-dasharray:4_3] [stroke-opacity:0.75]',
			className
		)
	);
</script>

<path {d} class={edgeClass} marker-end={`url(#${markerId}-${markerTone})`} />
