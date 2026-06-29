<script lang="ts">
	import type { Snippet } from 'svelte';
	import { ThemeState, themeContext } from './theme.svelte.js';

	interface Props {
		children: Snippet;
	}

	const { children }: Props = $props();
	const theme = new ThemeState();

	themeContext.set(theme);

	$effect(() => {
		document.documentElement.dataset.theme = theme.id;
	});
</script>

{@render children()}
