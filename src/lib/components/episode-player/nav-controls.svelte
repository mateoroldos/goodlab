<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { playerContext } from '$lib/player.svelte.js';

	const player = playerContext.get();

	const dots = $derived(Array.from({ length: player.phaseCount }, (_, i) => i <= player.phaseIdx));
</script>

<svelte:window
	onkeydown={(e) => {
		if (e.key === 'ArrowRight' && player.canGoNext) player.next();
		if (e.key === 'ArrowLeft' && player.canGoPrev) player.prev();
	}}
/>

<div class="flex items-center justify-center gap-6 border-t border-border px-10 py-5">
	<Button variant="ghost" onclick={() => player.prev()} disabled={!player.canGoPrev}>← Back</Button>

	<div
		class="flex items-center gap-1.5"
		aria-label="Phase {player.phaseIdx + 1} of {player.phaseCount}"
	>
		{#each dots as filled, i (i)}
			<span
				class="h-1.5 w-1.5 rounded-full transition-colors duration-200 ease-out"
				class:bg-primary={filled}
				class:bg-muted-foreground={!filled}
				style="opacity: {filled ? 1 : 0.3}"
			></span>
		{/each}
	</div>

	<Button variant="default" onclick={() => player.next()} disabled={!player.canGoNext}>
		{player.canGoNext ? 'Next →' : 'Done'}
	</Button>
</div>
