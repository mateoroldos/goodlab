<script module lang="ts">
	export type StateButtonState = 'idle' | 'pending' | 'success' | 'error';
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { Attachment } from 'svelte/attachments';
	import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { Button, type ButtonProps } from '$lib/components/ui/button/index.js';
	import { cn } from '$lib/utils.js';
	import { soundContext } from '$lib/sounds/sound-effects.svelte.js';

	type Props = Omit<ButtonProps, 'children'> & {
		state: StateButtonState;
		children?: Snippet;
		pending?: Snippet;
		success?: Snippet;
		error?: Snippet;
		shakeOnError?: boolean;
		withSounds?: boolean;
	};

	const {
		state: externalState,
		children,
		pending,
		success,
		error,
		shakeOnError = true,
		withSounds = true,
		class: className,
		...restProps
	}: Props = $props();

	const sounds = soundContext.get();

	let prevState: StateButtonState | undefined;
	$effect(() => {
		const prev = prevState;
		prevState = externalState;

		if (prev === undefined || prev === externalState) return;

		if (externalState === 'success' && withSounds) sounds.play('ui.success');
		if (externalState === 'error' && withSounds) sounds.play('ui.error');
	});

	const shakeOnErrorTransition: Attachment = (element) => {
		let prev: StateButtonState | undefined;
		let animation: Animation | undefined;

		$effect(() => {
			const next = externalState;
			const shouldShake = shakeOnError && prev !== undefined && prev !== next && next === 'error';
			prev = next;

			if (!shouldShake || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

			animation?.cancel();
			animation = element.animate(
				[
					{ transform: 'translateX(0)' },
					{ transform: 'translateX(-4px)', offset: 0.15 },
					{ transform: 'translateX(4px)', offset: 0.3 },
					{ transform: 'translateX(-4px)', offset: 0.45 },
					{ transform: 'translateX(4px)', offset: 0.6 },
					{ transform: 'translateX(-4px)', offset: 0.75 },
					{ transform: 'translateX(4px)', offset: 0.9 },
					{ transform: 'translateX(0)' }
				],
				{
					duration: 500,
					easing: 'cubic-bezier(0.36, 0.07, 0.19, 0.97)'
				}
			);
		});

		return () => animation?.cancel();
	};

	const content = $derived.by(() => {
		if (externalState === 'pending') return pending ?? children;
		if (externalState === 'success') return success ?? children;
		if (externalState === 'error') return error ?? children;
		return children;
	});
</script>

<Button
	{@attach shakeOnErrorTransition}
	class={cn('relative overflow-hidden', className)}
	data-state={externalState}
	{...restProps}
>
	{#key externalState}
		<span
			class="inline-flex items-center justify-center gap-2"
			in:fly={{ y: 7, duration: 300, easing: quintOut }}
		>
			{@render content?.()}
		</span>
	{/key}
</Button>
