<script lang="ts">
	import './layout.css';
	import { onNavigate } from '$app/navigation';
	import favicon from '$lib/assets/favicon.svg';
	import SiteFooter from '$lib/components/site-footer.svelte';
	import SoundEffects from '$lib/sounds/sound-effects.svelte';
	import Shortcuts from '$lib/shortcuts/shortcuts.svelte';
	import YouTubeMusicMount from '$lib/components/youtube-music/youtube-music-mount.svelte';

	const { children } = $props();

	onNavigate((navigation) => {
		if (!document.startViewTransition) return;

		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<YouTubeMusicMount />
<SoundEffects>
	<Shortcuts>
		{@render children()}
		<SiteFooter />
	</Shortcuts>
</SoundEffects>
