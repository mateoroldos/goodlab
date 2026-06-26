<script lang="ts">
	import { quintOut } from 'svelte/easing';
	import { fly } from 'svelte/transition';

	const { ascii, intro }: { ascii: string; intro: string } = $props();
</script>

<header in:fly={{ y: 6, duration: 280, easing: quintOut, opacity: 0 }} class="mb-16">
	<pre
		class="overflow-hidden whitespace-pre-wrap wrap-break-words text-center font-sans text-sm leading-none text-primary sm:text-base"
		aria-label="Goodlab">{ascii}</pre>

	<div class="mt-10 flex flex-col items-center gap-4">
		<div class="h-px w-16 bg-border"></div>
		<p class="max-w-xs text-center font-mono text-xs leading-6 tracking-wide text-muted-foreground">
			{intro}
		</p>
	</div>
</header>
