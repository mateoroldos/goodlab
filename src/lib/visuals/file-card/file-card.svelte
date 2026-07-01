<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils.js';

	interface Props {
		title?: string;
		chrome?: 'macos' | 'none';
		class?: string;
		headerClass?: string;
		children?: Snippet;
		actions?: Snippet;
	}

	const {
		title,
		chrome = 'macos',
		class: className,
		headerClass,
		children,
		actions
	}: Props = $props();
</script>

<div class={cn('overflow-hidden rounded-xl border border-border/15', className)}>
	{#if title || chrome !== 'none' || actions}
		<div
			class={cn(
				'flex items-center justify-between border-b border-border/15 bg-muted/20 px-4 py-2.5',
				headerClass
			)}
		>
			<span class="font-mono text-xs text-muted-foreground/60">{title}</span>
			{#if actions}
				{@render actions()}
			{:else if chrome === 'macos'}
				<div class="flex items-center gap-1.5" aria-hidden="true">
					<div class="size-2 rounded-full bg-[#FF5F57]/50"></div>
					<div class="size-2 rounded-full bg-[#FFBD2E]/50"></div>
					<div class="size-2 rounded-full bg-[#28C840]/50"></div>
				</div>
			{/if}
		</div>
	{/if}

	{@render children?.()}
</div>
