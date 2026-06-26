<script lang="ts">
	import { onMount } from 'svelte';
	import { player, PLAYER_ID } from './player-singleton.svelte.js';

	onMount(() => player.mount());
</script>

<!-- eslint-disable-next-line better-tailwindcss/no-restricted-classes -- opacity-0 risks the browser skipping rendering of the iframe; 0.01 keeps it technically visible -->
<div aria-hidden="true" class="size-px overflow-hidden opacity-[0.01]">
	<div id={PLAYER_ID}></div>
</div>
