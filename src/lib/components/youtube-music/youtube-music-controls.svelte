<script lang="ts">
	import { PauseIcon, PlayIcon, SkipBackIcon, SkipForwardIcon } from 'phosphor-svelte';

	const {
		isPlaying,
		onPrev,
		onToggle,
		onNext
	}: {
		isPlaying: boolean;
		onPrev: () => void;
		onToggle: () => void;
		onNext: () => void;
	} = $props();
</script>

<div class="flex items-center justify-center gap-5 py-3">
	<button
		onclick={onPrev}
		aria-label="Previous"
		class="text-muted-foreground transition-colors hover:text-foreground"
	>
		<SkipBackIcon size={16} weight="fill" />
	</button>

	<button
		onclick={onToggle}
		aria-label={isPlaying ? 'Pause' : 'Play'}
		class="flex size-8 items-center justify-center rounded-full bg-foreground text-background transition-transform hover:scale-105 active:scale-95"
	>
		{#if isPlaying}
			<PauseIcon size={14} weight="fill" />
		{:else}
			<PlayIcon size={14} weight="fill" />
		{/if}
	</button>

	<button
		onclick={onNext}
		aria-label="Next"
		class="text-muted-foreground transition-colors hover:text-foreground"
	>
		<SkipForwardIcon size={16} weight="fill" />
	</button>
</div>
