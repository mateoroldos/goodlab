<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { soundCatalog, type SoundId } from '$lib/sounds/sound-catalog.js';
	import { soundContext } from '$lib/sounds/sound-effects.svelte.js';
	import ComponentPreview from './component-preview.svelte';
	import { codeExample } from './code-example.js';
	import SectionHeading from './section-heading.svelte';

	const ids = Object.keys(soundCatalog) as SoundId[];
	const sounds = soundContext.get();
	const code = codeExample(
		'typescript',
		`
import { soundContext } from '$lib/sounds/sound-effects.svelte.js';

const sounds = soundContext.get();

sounds.play('ui.success');
sounds.play('ui.error');
`
	);
</script>

<section class="space-y-4">
	<SectionHeading
		title="Sound effects"
		description="Every registered sound in the app catalog. Use this to compare volume, tone, and repetition before wiring a new effect."
	/>
	<ComponentPreview
		title="Sound catalog"
		description="Play each sound directly from soundContext."
		{code}
	>
		<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
			{#each ids as id (id)}
				<div class="rounded-xl border border-border/15 bg-card p-3">
					<div class="mb-3 space-y-1">
						<p class="font-mono text-xs font-medium">{id}</p>
						<p class="text-xs text-muted-foreground">
							{soundCatalog[id].kind === 'synth'
								? `synth:${soundCatalog[id].preset}`
								: soundCatalog[id].kind}
						</p>
					</div>
					<Button size="sm" variant="outline" onclick={() => sounds.play(id)}>Play</Button>
				</div>
			{/each}
		</div>
	</ComponentPreview>
</section>
