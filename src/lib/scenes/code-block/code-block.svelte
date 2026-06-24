<script module lang="ts">
	export interface CodeLine {
		content: string;
		highlighted?: boolean;
		dimmed?: boolean;
	}

	export interface CodeBlockState {
		language: string;
		lines: CodeLine[];
	}
</script>

<script lang="ts">
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { cn } from '$lib/utils.js';

	interface Props {
		state: CodeBlockState;
	}

	const { state }: Props = $props();
</script>

<div class="w-full overflow-hidden rounded-xl border border-border bg-card font-mono text-sm">
	<div
		class="border-b border-border px-4 py-2.5 text-[0.7rem] uppercase tracking-widest text-muted-foreground/60"
	>
		{state.language}
	</div>

	<div class="min-h-12 py-4">
		{#each state.lines as line, i (`${i}_${line.content}`)}
			<div
				class={cn(
					'flex gap-5 rounded-sm px-5 py-0.5 transition-colors duration-200 ease-out',
					line.highlighted && 'bg-primary/12',
					line.dimmed && 'opacity-30'
				)}
				in:fly={{ x: -10, duration: 220, delay: i * 30, easing: cubicOut }}
			>
				<span class="min-w-[1.5ch] shrink-0 select-none text-right text-muted-foreground/40">
					{i + 1}
				</span>
				<span class="whitespace-pre text-foreground/85">{line.content || ' '}</span>
			</div>
		{/each}
	</div>
</div>
