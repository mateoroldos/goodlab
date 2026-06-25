<script lang="ts">
	import { base } from '$app/paths';

	const episodes = [
		{
			description: "JavaScript's two variable declarations.",
			slug: '01-test',
			title: 'const vs let'
		}
	];
</script>

<main class="px-12 py-16 max-w-2xl">
	<h1 class="text-4xl font-semibold mb-2">goodlab</h1>
	<p class="text-muted-foreground mb-12">Learn complex software engineering with strong visuals.</p>

	<ul class="list-none p-0 m-0 flex flex-col gap-3">
		{#each episodes as ep (ep.slug)}
			<li>
				<!-- eslint-disable svelte/no-navigation-without-resolve -->
				<a
					href="{base}/episodes/{ep.slug}"
					class="flex flex-col gap-1 py-5 px-6 border border-border rounded-lg no-underline text-foreground transition-colors duration-150 ease hover:border-primary/60"
				>
					<span class="font-medium text-base">{ep.title}</span>
					<span class="text-sm text-muted-foreground">{ep.description}</span>
				</a>
				<!-- eslint-enable svelte/no-navigation-without-resolve -->
			</li>
		{/each}
	</ul>
</main>
