<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { ShortcutRegistry, shortcutContext } from './shortcut-registry.svelte.js';

	interface Props {
		children: Snippet;
	}

	const { children }: Props = $props();
	const shortcuts = new ShortcutRegistry();
	shortcutContext.set(shortcuts);

	onMount(() =>
		shortcuts.register([
			{
				key: 'H',
				description: 'Go home',
				run: () => void goto(resolve('/'))
			}
		])
	);
</script>

<svelte:window onkeydown={(e) => shortcuts.handle(e)} />
{@render children()}
