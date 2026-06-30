<script lang="ts">
	import type { Snippet } from 'svelte';
	import { tv } from 'tailwind-variants';
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

	/* eslint-disable better-tailwindcss/no-restricted-classes -- SVG nodes need color-mix fills, 1.5px strokes, and per-slot transitions not expressible with Tailwind tokens. */
	const nodeVariants = tv({
		slots: {
			wrapper: 'transition-opacity duration-300 ease-out motion-reduce:transition-none',
			rect: 'fill-[color-mix(in_oklab,var(--muted)_80%,transparent)] stroke-border stroke-1 transition-[fill,stroke,stroke-width] duration-[240ms] ease-in-out motion-reduce:transition-none',
			text: 'select-none fill-muted-foreground font-mono text-xs transition-[fill] duration-200 ease-out motion-reduce:transition-none'
		},
		variants: {
			tone: {
				default: {},
				dim: { wrapper: 'opacity-40' },
				active: { rect: 'fill-primary/15 stroke-primary stroke-[1.5]', text: 'fill-foreground' },
				success: {
					rect: 'fill-green-500/10 stroke-green-500 stroke-[1.5]',
					text: 'fill-foreground'
				},
				invalid: {
					rect: 'fill-destructive/10 stroke-destructive stroke-[1.5]',
					text: 'fill-foreground'
				},
				blocked: {
					rect: 'fill-destructive/10 stroke-destructive stroke-[1.5]',
					text: 'fill-foreground'
				}
			}
		},
		defaultVariants: { tone: 'default' }
	});
	/* eslint-enable better-tailwindcss/no-restricted-classes */

	const { wrapper, rect, text } = $derived(nodeVariants({ tone }));
</script>

<g class={wrapper()}>
	<rect x={x - width / 2} y={y - height / 2} {width} {height} rx={radius} class={rect()} />
	<text {x} {y} class={text()} dominant-baseline="middle" text-anchor="middle">
		{@render children?.()}
	</text>
</g>
