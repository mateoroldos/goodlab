<script lang="ts">
	import { page } from '$app/state';
	import { themeContext, themes } from '$lib/themes/theme.svelte.js';
	import YoutubeMusic from '$lib/components/youtube-music/youtube-music.svelte';
	import { Kbd } from '$lib/components/ui/kbd/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';

	const theme = themeContext.get();
</script>

<footer
	class="flex h-full items-center border-t border-border font-mono text-xs text-muted-foreground"
>
	<!-- Left: theme selector -->
	<DropdownMenu.Root>
		<DropdownMenu.Trigger
			class="flex h-full cursor-default items-center gap-2 px-3 outline-none transition-colors hover:text-foreground"
		>
			<span
				class="size-1.5 shrink-0 rounded-full transition-colors duration-300"
				style="background-color: {theme.current.color}"
			></span>
			{theme.current.label}
		</DropdownMenu.Trigger>
		<DropdownMenu.Content
			side="top"
			sideOffset={8}
			align="start"
			class="min-w-44 font-mono text-xs"
		>
			<DropdownMenu.RadioGroup value={theme.id} onValueChange={(v) => theme.select(v)}>
				{#each themes as option (option.id)}
					<DropdownMenu.RadioItem value={option.id}>
						{#snippet children({ checked })}
							<span
								class="size-1.5 shrink-0 rounded-full transition-colors duration-150"
								style="background-color: {option.color}"
							></span>
							<span class={checked ? 'text-foreground' : ''}>{option.label}</span>
						{/snippet}
					</DropdownMenu.RadioItem>
				{/each}
			</DropdownMenu.RadioGroup>
		</DropdownMenu.Content>
	</DropdownMenu.Root>

	<!-- Center: ambient hint -->
	<div class="flex flex-1 items-center justify-center gap-1.5 text-muted-foreground/40">
		<span>when lost, press</span>
		<Kbd>H</Kbd>
		<span>to go home</span>
	</div>

	<!-- Right: github + music -->
	<div class="flex h-full items-center gap-3 px-3">
		<a
			href="https://github.com/mateoroldos/goodlab"
			target="_blank"
			rel="noopener noreferrer"
			class="transition-colors hover:text-foreground">github</a
		>

		{#if page.url.pathname !== '/'}
			<YoutubeMusic class="size-5" />
		{/if}
	</div>
</footer>
