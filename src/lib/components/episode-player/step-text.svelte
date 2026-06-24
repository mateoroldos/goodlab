<script lang="ts">
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { playerContext } from '$lib/player.svelte.js';

	const player = playerContext.get();

	const stepKey = $derived(`${player.sceneIdx}-${player.stepIdx}`);
</script>

<div class="flex h-full flex-col gap-5 p-12">
	<div class="h-5">
		{#if player.scene.title}
			<span class="text-[0.7rem] font-medium uppercase tracking-widest text-primary">
				Scene {player.sceneIdx + 1} — {player.scene.title}
			</span>
		{/if}
	</div>

	{#key stepKey}
		<p
			class="m-0 max-w-[38ch] text-[1.2rem] leading-relaxed text-foreground/80"
			in:fly={{ y: 10, duration: 240, easing: cubicOut }}
		>
			{player.step.text}
		</p>
	{/key}
</div>
