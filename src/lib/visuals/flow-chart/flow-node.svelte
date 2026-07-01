<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils.js';
	import type { FlowTone } from './flow-types.js';

	interface Props {
		x: number;
		y: number;
		width?: number;
		height?: number;
		radius?: number;
		tone?: FlowTone;
		children?: Snippet;
	}

	const { x, y, width = 88, height = 32, radius = 8, tone = 'default', children }: Props = $props();

	const rectClass = $derived(
		cn(
			// eslint-disable-next-line better-tailwindcss/no-restricted-classes -- SVG node fills use color-mix and stroke-only transitions not expressible by Tailwind tokens.
			'fill-[color-mix(in_oklab,var(--muted)_80%,transparent)] stroke-border stroke-1 transition-[fill,stroke,stroke-width] duration-[240ms] ease-in-out motion-reduce:transition-none',
			// eslint-disable-next-line better-tailwindcss/no-restricted-classes -- SVG emphasis needs a 1.5px stroke between Tailwind stroke-1 and stroke-2.
			tone === 'active' && 'fill-primary/15 stroke-primary stroke-[1.5]',
			// eslint-disable-next-line better-tailwindcss/no-restricted-classes -- SVG emphasis needs a 1.5px stroke between Tailwind stroke-1 and stroke-2.
			tone === 'success' && 'fill-green-500/10 stroke-green-500 stroke-[1.5]',
			(tone === 'invalid' || tone === 'blocked') &&
				// eslint-disable-next-line better-tailwindcss/no-restricted-classes -- SVG emphasis needs a 1.5px stroke between Tailwind stroke-1 and stroke-2.
				'fill-destructive/10 stroke-destructive stroke-[1.5]'
		)
	);
	const textClass = $derived(
		cn(
			// eslint-disable-next-line better-tailwindcss/no-restricted-classes -- SVG text only animates fill; Tailwind has no non-arbitrary fill-only transition utility.
			'select-none fill-muted-foreground font-mono text-xs transition-[fill] duration-200 ease-out motion-reduce:transition-none',
			(tone === 'active' || tone === 'success' || tone === 'invalid' || tone === 'blocked') &&
				'fill-foreground'
		)
	);
</script>

<g>
	<rect x={x - width / 2} y={y - height / 2} {width} {height} rx={radius} class={rectClass} />
	<text {x} {y} class={textClass} dominant-baseline="middle" text-anchor="middle">
		{@render children?.()}
	</text>
</g>
