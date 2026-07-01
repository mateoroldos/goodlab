<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		description: string;
		sounds?: readonly string[];
		children: Snippet;
	}

	const { title, description, sounds = [], children }: Props = $props();
</script>

<div class="rounded-2xl border border-border/20 bg-card p-4 shadow-sm">
	<div class="mb-4 space-y-1">
		<div class="flex flex-wrap items-center gap-2">
			<h3 class="font-medium">{title}</h3>
			{#each sounds as sound (sound)}
				<span
					class="rounded-full border border-border/30 bg-background/60 px-2 py-0.5 font-mono text-[10px] text-muted-foreground"
				>
					{sound}
				</span>
			{/each}
		</div>
		<p class="text-sm text-muted-foreground">{description}</p>
	</div>
	<div class="rounded-xl border border-border/10 bg-background/50 p-4">{@render children()}</div>
</div>
