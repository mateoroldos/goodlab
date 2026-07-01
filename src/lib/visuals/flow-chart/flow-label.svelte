<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils.js';
	import type { FlowAnchor, FlowTone } from './flow-types.js';

	interface Props {
		x: number;
		y: number;
		anchor?: FlowAnchor;
		tone?: FlowTone;
		class?: string;
		children?: Snippet;
	}

	const { x, y, anchor = 'middle', tone = 'default', class: className, children }: Props = $props();
	const labelClass = $derived(
		cn(
			// eslint-disable-next-line better-tailwindcss/no-restricted-classes -- SVG labels need 11px type and fill-only transitions for visual balance.
			'fill-muted-foreground stroke-background font-mono text-[11px] font-semibold transition-[fill] duration-200 ease-out motion-reduce:transition-none',
			tone === 'active' && 'fill-primary',
			tone === 'success' && 'fill-green-500',
			(tone === 'invalid' || tone === 'blocked') && 'fill-destructive',
			className
		)
	);
</script>

<text
	{x}
	{y}
	text-anchor={anchor}
	class={labelClass}
	paint-order="stroke"
	stroke-width="5"
	stroke-linejoin="round"
>
	{@render children?.()}
</text>
