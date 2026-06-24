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

<main class="px-12 py-[60px] max-w-[640px]">
	<h1 class="text-[2rem] font-semibold mb-2">goodlab</h1>
	<p class="text-muted-foreground mb-12">Learn complex software engineering with strong visuals.</p>

	<ul class="list-none p-0 m-0 flex flex-col gap-3">
		{#each episodes as ep (ep.slug)}
			<li>
				<!-- eslint-disable svelte/no-navigation-without-resolve -->
				<a
					href="{base}/episodes/{ep.slug}"
					class="flex flex-col gap-1 py-5 px-6 border border-border rounded-lg no-underline text-foreground transition-colors duration-150 ease hover:border-primary/60"
				>
					<span class="font-medium text-[0.95rem]">{ep.title}</span>
					<span class="text-[0.82rem] text-muted-foreground">{ep.description}</span>
				</a>
				<!-- eslint-enable svelte/no-navigation-without-resolve -->
			</li>
		{/each}
	</ul>
</main>
