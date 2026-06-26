<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { shortcutContext } from '$lib/shortcuts/shortcut-registry.svelte.js';
	import { Kbd } from '$lib/components/ui/kbd/index.js';
	import PageFooter from '$lib/components/page-footer.svelte';
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

<div class="flex min-h-dvh flex-col">
	<main class="mx-auto w-full max-w-2xl flex-1 px-8 py-16">
		<header class="mb-10 border-b border-border pb-10">
			<h1 class="mb-3 text-3xl font-semibold tracking-tight">{data.series.title}</h1>
			<p class="text-sm leading-6 text-muted-foreground">{data.series.description}</p>
		</header>

		<section>
			<div class="mb-6 flex items-center gap-4">
				<!-- eslint-disable-next-line better-tailwindcss/no-restricted-classes -- tracking-widest is only 0.1em; 0.3em is intentional for the wide-spaced section label -->
				<span class="font-mono text-xs tracking-[0.3em] text-muted-foreground/40 uppercase"
					>episodes</span
				>
				<div class="h-px flex-1 bg-border"></div>
			</div>
			<ol class="m-0 list-none border-t border-border p-0">
				{#each data.series.episodes as episode, i (episode.slug)}
					<li>
						<a
							href={resolve(`/episodes/${episode.slug}`)}
							class="group flex items-start gap-5 border-b border-border py-5 text-foreground no-underline transition-colors duration-150 hover:bg-muted/30"
						>
							<span
								class="w-8 shrink-0 pt-0.5 text-right font-mono text-xs text-muted-foreground/30"
							>
								{String(i + 1).padStart(3, '0')}
							</span>
							<span class="flex flex-1 flex-col gap-1.5">
								<span class="font-medium tracking-tight">{episode.title}</span>
								<span class="text-sm text-muted-foreground">{episode.description}</span>
							</span>
							<Kbd class="mt-0.5 shrink-0">{i + 1}</Kbd>
						</a>
					</li>
				{/each}
			</ol>
		</section>
	</main>
	<PageFooter />
</div>
