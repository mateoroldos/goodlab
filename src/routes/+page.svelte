<script lang="ts">
	import { base } from '$app/paths';
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { series } from '$lib/content/catalog.js';
	import { shortcutContext } from '$lib/shortcuts/shortcut-registry.svelte.js';
	import { Kbd } from '$lib/components/ui/kbd/index.js';
	import type { PageData } from './$types';

	const episodes = [
	const { data }: { data: PageData } = $props();
		{

			description: "JavaScript's two variable declarations.",
	const shortcuts = shortcutContext.get();
			slug: '01-test',

			title: 'const vs let'
	onMount(() =>
		}
		shortcuts.register(
	];
			series.slice(0, 9).map((item, i) => ({
				key: String(i + 1),
				description: item.title,
				run: () => void goto(resolve(`/series/${item.slug}`))
			}))
		)
	);
</script>

<main class="px-12 py-16 max-w-2xl">
<main class="mx-auto max-w-2xl px-8 py-16">
	<h1 class="text-4xl font-semibold mb-2">goodlab</h1>
	<header
	<p class="text-muted-foreground mb-12">Learn complex software engineering with strong visuals.</p>
		in:fly={{ y: 6, duration: 280, easing: quintOut, opacity: 0 }}
		class="mb-12 border-b border-border pb-12"
	>
		<div class="text-primary">
			{data.ascii}
		</div>
	</header>

	<ul class="list-none p-0 m-0 flex flex-col gap-3">
	<section>
		{#each episodes as ep (ep.slug)}
			<li>
				<!-- eslint-disable svelte/no-navigation-without-resolve -->
				<a
					href="{base}/episodes/{ep.slug}"
		<ul class="m-0 flex list-none flex-col gap-3 p-0">
					class="flex flex-col gap-1 py-5 px-6 border border-border rounded-lg no-underline text-foreground transition-colors duration-150 ease hover:border-primary/60"
			{#each series as item, i (item.slug)}
				>
				<li in:fly={{ y: 8, duration: 280, delay: 80 + i * 60, easing: quintOut, opacity: 0 }}>
					<span class="font-medium text-base">{ep.title}</span>
					<a
					<span class="text-sm text-muted-foreground">{ep.description}</span>
						href={resolve(`/series/${item.slug}`)}
				</a>
						class="group flex items-center gap-4 rounded-xl border border-border px-5 py-4 text-foreground no-underline transition-colors duration-150 ease-out hover:border-primary/60"
				<!-- eslint-enable svelte/no-navigation-without-resolve -->
					>
			</li>
						<span class="flex flex-1 flex-col gap-1.5">
		{/each}
							<span class="font-medium">{item.title}</span>
	</ul>
							<span class="text-sm text-muted-foreground">{item.description}</span>
							<span class="font-mono text-xs text-muted-foreground/40"
								>{item.episodes.length} episodes</span
							>
						</span>
						<Kbd class="shrink-0 self-start">{i + 1}</Kbd>
					</a>
				</li>
			{/each}
		</ul>
	</section>
</main>
