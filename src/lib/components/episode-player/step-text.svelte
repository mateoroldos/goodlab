<script lang="ts">
	import { playerContext } from '$lib/player.svelte.js';

	const player = playerContext.get();
	let activeStep: HTMLElement | undefined = $state();

	const stepKey = $derived(`${player.sceneIdx}-${player.stepIdx}`);

	$effect(() => {
		void stepKey;
		activeStep?.scrollIntoView({ block: 'center', behavior: 'smooth' });
	});
</script>

<div class="flex min-h-full flex-col gap-10 px-12 py-[42dvh]">
	{#each player.scenes as scene, sceneIdx (scene.id)}
		<section class="flex flex-col gap-5">
			<div class="h-5">
				{#if scene.title}
					<span
						class={[
							'text-[0.7rem] font-medium uppercase tracking-widest transition-colors duration-300 ease-out',
							sceneIdx === player.sceneIdx ? 'text-primary' : 'text-muted-foreground/35'
						]}
					>
						Scene {sceneIdx + 1} — {scene.title}
					</span>
				{/if}
			</div>

			<div class="flex flex-col gap-6">
				{#each scene.steps as step, stepIdx (`${scene.id}-${stepIdx}`)}
					{@const active = sceneIdx === player.sceneIdx && stepIdx === player.stepIdx}
					{#if active}
						<p
							bind:this={activeStep}
							class="m-0 max-w-[38ch] text-[1.2rem] leading-relaxed text-foreground opacity-100 transition-all duration-300 ease-out"
						>
							{step.text}
						</p>
					{:else}
						<p
							class="m-0 max-w-[38ch] text-[1.2rem] leading-relaxed text-muted-foreground/45 opacity-70 transition-all duration-300 ease-out"
						>
							{step.text}
						</p>
					{/if}
				{/each}
			</div>
		</section>
	{/each}
</div>
