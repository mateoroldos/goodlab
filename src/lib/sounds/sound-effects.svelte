<script lang="ts">
	import type { Snippet } from 'svelte';
	import { createSoundEffects, soundContext } from './sound-effects.svelte.js';

	interface Props {
		children: Snippet;
	}

	const { children }: Props = $props();
	const sounds = createSoundEffects();
	soundContext.set(sounds);
</script>

{@render children()}
