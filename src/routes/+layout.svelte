<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import SoundEffects from '$lib/sounds/sound-effects.svelte';
	import Shortcuts from '$lib/shortcuts/shortcuts.svelte';

	const { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<SoundEffects>
	<Shortcuts>
		{@render children()}
	</Shortcuts>
</SoundEffects>
