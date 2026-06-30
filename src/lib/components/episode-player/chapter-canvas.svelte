<script lang="ts">
	import { playerContext } from '$lib/player.svelte.js';

	const player = playerContext.get();

	const Scene = $derived(player.chapter.scene);
</script>

<div
	class="relative bg-muted/15 flex h-full flex-col items-center justify-center gap-8 pl-6 pr-10 py-12"
>
	<div class="w-full">
		<Scene state={player.state} />
	</div>
</div>
