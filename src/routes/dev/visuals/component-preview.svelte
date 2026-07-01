<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs/index.js';
	import CodeBlock, { type CodeBlockState } from '$lib/visuals/code-block/code-block.svelte';

	interface Props {
		title: string;
		description?: string;
		code: CodeBlockState;
		sounds?: readonly string[];
		children: Snippet;
	}

	const { title, description, code, sounds = [], children }: Props = $props();

	let tab = $state('preview');
</script>

<div class="overflow-hidden rounded-2xl border border-border/20 bg-card shadow-sm">
	<div class="border-b border-border/15 px-5 py-4">
		<div class="flex flex-wrap items-center gap-2">
			<h3 class="font-medium">{title}</h3>
			{#each sounds as sound (sound)}
				<span
					class="rounded-full border border-border/30 bg-background/60 px-2 py-0.5 font-mono text-[10px] text-muted-foreground"
				>
					{sound}
				</span>
			{/each}
		</div>
		{#if description}
			<p class="mt-1 text-sm text-muted-foreground">{description}</p>
		{/if}
	</div>

	<Tabs bind:value={tab}>
		<div class="border-b border-border/15 px-5">
			<TabsList variant="line">
				<TabsTrigger value="preview">Preview</TabsTrigger>
				<TabsTrigger value="code">Code</TabsTrigger>
			</TabsList>
		</div>
		<TabsContent value="preview" class="p-4">
			<div class="rounded-xl border border-border/10 bg-background/50 p-4">
				{@render children()}
			</div>
		</TabsContent>
		<TabsContent value="code" class="px-2 py-2">
			<CodeBlock state={code} />
		</TabsContent>
	</Tabs>
</div>
