<script lang="ts">
	import type { Snippet } from 'svelte';
	import { ShortcutRegistry, shortcutContext } from './shortcut-registry.svelte.js';

	interface Props {
		children: Snippet;
	}

	const { children }: Props = $props();
	const shortcuts = new ShortcutRegistry();
	shortcutContext.set(shortcuts);
</script>

<svelte:window onkeydown={(e) => shortcuts.handle(e)} />
{@render children()}
