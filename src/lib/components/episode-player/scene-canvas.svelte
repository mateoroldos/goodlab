<script lang="ts">
	import { fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { playerContext } from '$lib/player.svelte.js';

	const player = playerContext.get();

	const Scene = $derived(player.scene.component);
</script>

<div
	class="relative bg-muted/15 flex h-full flex-col items-center justify-center gap-8 pl-6 pr-10 py-12"
>
	{#key player.sceneIdx}
		<div class="w-full" in:fade={{ duration: 300, easing: cubicOut }}>
			<Scene state={player.phase.state} />
		</div>
	{/key}
</div>
