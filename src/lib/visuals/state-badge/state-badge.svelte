<script module lang="ts">
	import { tv } from 'tailwind-variants';

	export const stateBadgeVariants = tv({
		base: 'node-badge inline-flex items-center gap-1 rounded-md border px-2.5 py-0.5 font-mono text-xs transition-colors duration-280 ease-in-out',
		variants: {
			state: {
				idle: 'border-border bg-muted/60 text-foreground',
				pending: 'border-primary bg-primary/12 text-primary',
				success: 'border-green-500/30 bg-green-500/10 text-green-400',
				error: 'border-destructive/40 bg-destructive/10 text-destructive'
			}
		}
	});
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import { STATE_ICONS, type ActionState } from '$lib/visuals/action-state.js';

	interface Props {
		state: ActionState;
		showIcon?: boolean;
		class?: string;
		children?: Snippet;
	}

	const { state, showIcon = true, class: className, children }: Props = $props();

	const entry = $derived(STATE_ICONS[state]);
</script>

<span class={stateBadgeVariants({ state, class: className })}>
	{#if showIcon}
		{@const Icon = entry.icon}
		<span class={['inline-flex shrink-0', entry.spin ? 'animate-spin' : '']}>
			<Icon size={11} weight="fill" />
		</span>
	{/if}
	{@render children?.()}
</span>
