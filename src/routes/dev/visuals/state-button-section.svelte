<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import StateButton from '$lib/visuals/state-button/state-button.svelte';
	import { type ActionState } from '$lib/visuals/action-state.js';
	import ComponentPreview from './component-preview.svelte';
	import { codeExample } from './code-example.js';
	import SectionHeading from './section-heading.svelte';

	const states: ActionState[] = ['idle', 'pending', 'success', 'error'];
	const code = codeExample(
		'svelte',
		`
<StateButton state={saveState} variant="outline">
  {#snippet pending()}Saving...{/snippet}
  {#snippet success()}Saved{/snippet}
  {#snippet error()}Retry{/snippet}
  Save changes
</StateButton>
`
	);

	let selected = $state<ActionState>('idle');
</script>

<section class="space-y-4">
	<SectionHeading
		title="State button"
		description="Content slots for each state, with an error shake animation and sound effects."
	/>
	<ComponentPreview
		title="Interactive states"
		description="Cycle through idle, pending, success, and error to see content transitions."
		{code}
		sounds={['ui.success', 'ui.error']}
	>
		<div class="space-y-4">
			<div class="flex flex-wrap gap-2">
				{#each states as state (state)}
					<Button
						size="sm"
						variant={selected === state ? 'default' : 'outline'}
						onclick={() => (selected = state)}
					>
						{state}
					</Button>
				{/each}
			</div>
			<StateButton state={selected} variant={selected === 'error' ? 'destructive' : 'outline'}>
				{#snippet pending()}Saving...{/snippet}
				{#snippet success()}Saved{/snippet}
				{#snippet error()}Retry{/snippet}
				Save changes
			</StateButton>
		</div>
	</ComponentPreview>
</section>
