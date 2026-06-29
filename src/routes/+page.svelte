<script lang="ts">
	import { onMount } from 'svelte';
	import { quintOut } from 'svelte/easing';
	import { fly } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import SiteHeader from '$lib/components/site-header.svelte';
	import YoutubeMusic from '$lib/components/youtube-music/youtube-music.svelte';
	import { series } from '$lib/content/catalog.js';
	import { shortcutContext } from '$lib/shortcuts/shortcut-registry.svelte.js';
	import { Kbd } from '$lib/components/ui/kbd/index.js';
	import type { PageData } from './$types';

	const { data }: { data: PageData } = $props();
	const intro = 'A quiet lab exploring software craft, good code, and better ways to think.';

	const shortcuts = shortcutContext.get();

	onMount(() =>
		shortcuts.register(
			series.slice(0, 9).map((item, i) => ({
				key: String(i + 1),
				description: item.title,
				run: () => void goto(resolve(`/series/${item.slug}`))
			}))
		)
	);
</script>

<div class="flex min-h-full flex-col">
	<main class="mx-auto w-full max-w-2xl flex-1 px-8 py-16">
		<SiteHeader ascii={data.ascii} {intro} />

		<!-- Ambient intro — vinyl player card -->
		<section
			in:fly={{ y: 8, duration: 280, delay: 80, easing: quintOut, opacity: 0 }}
			class="mb-16"
		>
			<!-- eslint-disable-next-line better-tailwindcss/no-restricted-classes -- 1.25rem sits between rounded-2xl (1rem) and rounded-3xl (1.5rem); no standard equivalent -->
			<div class="overflow-hidden rounded-[1.25rem] border border-border bg-card/40">
				<div class="flex flex-col sm:flex-row">
					<!-- Platter zone -->
					<div
						class="relative flex shrink-0 items-center justify-center border-b border-border/50 bg-muted/20 p-8 sm:border-b-0 sm:border-r"
					>
						<!-- Groove rings — outer to inner so disc renders on top -->
						<div
							class="absolute left-1/2 top-1/2 size-52 -translate-x-1/2 -translate-y-1/2 rounded-full border border-border/40"
						></div>
						<div
							class="absolute left-1/2 top-1/2 size-48 -translate-x-1/2 -translate-y-1/2 rounded-full border border-border/70"
						></div>
						<YoutubeMusic class="size-40" />
					</div>

					<div class="relative flex flex-1 flex-col justify-center gap-4 px-8 py-7">
						<p class="font-mono text-xs leading-6 text-muted-foreground">
							Read slowly. Build carefully.<br />
							The lab is always open.
						</p>
						<div class="flex items-center gap-2 font-mono text-xs text-muted-foreground/60">
							<span
								>type
								<Kbd>m</Kbd>
								to get into mood
							</span>
						</div>
						<span class="absolute bottom-4 right-6 font-mono text-xs text-muted-foreground/25"
							>33 ⅓</span
						>
					</div>
				</div>
			</div>
		</section>

		<section>
			<div class="mb-6 flex items-center gap-4">
				<!-- eslint-disable-next-line better-tailwindcss/no-restricted-classes -- tracking-widest is only 0.1em; 0.3em is intentional for the wide-spaced section label -->
				<span class="font-mono text-xs tracking-[0.3em] text-muted-foreground/40 uppercase"
					>series</span
				>
				<div class="h-px flex-1 bg-border"></div>
			</div>
			<ul class="m-0 list-none border-t border-border p-0">
				{#each series as item, i (item.slug)}
					<li in:fly={{ y: 8, duration: 280, delay: 140 + i * 60, easing: quintOut, opacity: 0 }}>
						<a
							href={resolve(`/series/${item.slug}`)}
							class="group flex items-start gap-5 border-b border-border py-5 text-foreground no-underline transition-colors duration-150 hover:bg-muted/30"
						>
							<span
								class="w-8 shrink-0 pt-0.5 text-right font-mono text-xs text-muted-foreground/30"
							>
								{String(i + 1).padStart(3, '0')}
							</span>
							<span class="flex flex-1 flex-col gap-1.5">
								<span class="font-medium tracking-tight">{item.title}</span>
								<span class="text-sm text-muted-foreground">{item.description}</span>
							</span>
							<Kbd class="mt-0.5 shrink-0">{i + 1}</Kbd>
						</a>
					</li>
				{/each}
			</ul>
		</section>
	</main>
</div>
