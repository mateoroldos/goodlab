<script lang="ts">
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { ArrowLeftIcon } from 'phosphor-svelte';
	import { shortcutContext } from '$lib/shortcuts/shortcut-registry.svelte.js';
	import { Kbd } from '$lib/components/ui/kbd/index.js';
	import type { PageData } from './$types';

	const { data }: { data: PageData } = $props();

	const shortcuts = shortcutContext.get();

	onMount(() =>
		shortcuts.register(
			data.series.episodes.slice(0, 9).map((episode, i) => ({
				key: String(i + 1),
				description: episode.title,
				run: () => void goto(resolve(`/episodes/${episode.slug}`))
			}))
		)
	);
</script>

<main class="mx-auto max-w-2xl px-8 py-16">
	<a
		href={resolve('/')}
		class="mb-10 inline-flex items-center gap-1.5 text-sm text-muted-foreground no-underline transition-colors duration-150 ease-out hover:text-foreground"
	>
		<ArrowLeftIcon size={14} />
		Library
	</a>

	<header
		in:fly={{ y: 6, duration: 280, easing: quintOut, opacity: 0 }}
		class="mb-10 border-b border-border pb-10"
	>
		<p class="mb-3 text-xs font-medium uppercase tracking-widest text-primary">Series</p>
		<h1 class="mb-3 text-4xl font-semibold tracking-tight">{data.series.title}</h1>
		<p class="text-muted-foreground">{data.series.description}</p>
	</header>

	<ol class="m-0 flex list-none flex-col gap-3 p-0">
		{#each data.series.episodes as episode, i (episode.slug)}
			<li in:fly={{ y: 8, duration: 280, delay: 80 + i * 60, easing: quintOut, opacity: 0 }}>
				<a
					href={resolve(`/episodes/${episode.slug}`)}
					class="group flex items-center gap-4 rounded-xl border border-border px-5 py-4 text-foreground no-underline transition-colors duration-150 ease-out hover:border-primary/60"
				>
					<span class="w-10 shrink-0 font-mono text-sm text-muted-foreground/40"
						>{String(i + 1).padStart(2, '0')}</span
					>
					<span class="flex flex-1 flex-col gap-1.5">
						<span class="font-medium">{episode.title}</span>
						<span class="text-sm text-muted-foreground">{episode.description}</span>
					</span>
					<Kbd class="shrink-0">{i + 1}</Kbd>
				</a>
			</li>
		{/each}
	</ol>
</main>
