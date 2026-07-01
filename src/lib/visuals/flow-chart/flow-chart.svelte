<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils.js';
	import { setFlowChartContext } from './flow-chart-context.js';

	interface Props {
		viewBox?: string;
		arrowId?: string;
		label?: string;
		class?: string;
		children?: Snippet;
	}

	const {
		viewBox = '0 0 480 270',
		arrowId = 'flow-arrow',
		label,
		class: className,
		children
	}: Props = $props();

	setFlowChartContext({ arrowId: () => arrowId });
</script>

<svg
	{viewBox}
	class={cn('w-full overflow-visible', className)}
	aria-hidden={label ? undefined : 'true'}
	aria-label={label}
	role={label ? 'img' : undefined}
>
	{@render children?.()}
</svg>
