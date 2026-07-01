<script lang="ts">
	import CodeBlockSection from './code-block-section.svelte';
	import ExplainerGraphSection from './explainer-graph-section.svelte';
	import FileCardSection from './file-card-section.svelte';
	import FlowChartSection from './flow-chart-section.svelte';
	import SoundEffectsSection from './sound-effects-section.svelte';
	import StateButtonSection from './state-button-section.svelte';
</script>

<svelte:head><title>Visuals Lab</title></svelte:head>

<main class="mx-auto flex w-full max-w-5xl flex-col gap-16 px-5 py-14 sm:px-8">
	<header class="space-y-3">
		<!-- eslint-disable-next-line better-tailwindcss/no-restricted-classes -- tracking-widest is too tight for this small uppercase dev label. -->
		<p class="font-mono text-xs tracking-[0.28em] text-muted-foreground uppercase">Dev only</p>
		<h1 class="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">Visuals Lab</h1>
		<p class="max-w-xl text-muted-foreground text-lg text-balance">
			Curated states for the complex visual components in <code>src/lib/visuals</code>. Available
			only while running the dev server.
		</p>
	</header>

	<FlowChartSection />
	<FileCardSection />
	<ExplainerGraphSection />
	<CodeBlockSection />
	<StateButtonSection />
	<SoundEffectsSection />
</main>
