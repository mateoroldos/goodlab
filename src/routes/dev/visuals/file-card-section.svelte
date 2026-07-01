<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import FileCard from '$lib/visuals/file-card/file-card.svelte';
	import ComponentPreview from './component-preview.svelte';
	import { codeExample } from './code-example.js';
	import SectionHeading from './section-heading.svelte';

	const code = codeExample(
		'svelte',
		`
<!-- Default: macOS traffic-light chrome -->
<FileCard title="example.ts">
  <div class="p-5">Default chrome with content padding.</div>
</FileCard>

<!-- Custom actions: replace chrome with your own controls -->
<FileCard title="with-actions.svelte" chrome="none">
  {#snippet actions()}
    <Button size="sm" variant="outline">Action</Button>
  {/snippet}
  <div class="p-5">Actions slot, no traffic-light chrome.</div>
</FileCard>
`
	);
</script>

<section class="space-y-4">
	<SectionHeading
		title="File card"
		description="Framing chrome for code, files, or any structured content. Optionally swap the macOS traffic-light header for custom actions."
	/>
	<ComponentPreview
		title="Chrome variants"
		description="Default macOS chrome alongside a custom actions slot."
		{code}
	>
		<div class="space-y-4">
			<FileCard title="src/lib/visuals/example.ts" class="bg-card/70">
				<div class="space-y-3 p-5">
					<p class="text-sm text-muted-foreground">Default macOS chrome with content padding.</p>
					<div class="grid grid-cols-3 gap-2 text-center font-mono text-xs">
						<div class="rounded-lg bg-muted/60 p-3">Idle</div>
						<div class="rounded-lg bg-primary/10 p-3 text-primary">Active</div>
						<div class="rounded-lg bg-destructive/10 p-3 text-destructive">Error</div>
					</div>
				</div>
			</FileCard>
			<FileCard title="with-actions.svelte" chrome="none" class="bg-card/70">
				{#snippet actions()}
					<Button size="sm" variant="outline">Action</Button>
				{/snippet}
				<div class="p-5 text-sm text-muted-foreground">
					Custom actions slot without traffic-light chrome.
				</div>
			</FileCard>
		</div>
	</ComponentPreview>
</section>
