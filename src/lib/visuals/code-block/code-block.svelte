<script module lang="ts">
	export interface CodeLine {
		id?: string;
		content: string;
		highlighted?: boolean;
		dimmed?: boolean;
	}

	export type SupportedLanguage = 'javascript' | 'typescript' | 'svelte' | 'html' | 'css' | 'json';

	export interface CodeBlockState {
		language: SupportedLanguage;
		lines: CodeLine[];
	}
</script>

<script lang="ts">
	import css from '@shikijs/langs/css';
	import html from '@shikijs/langs/html';
	import javascript from '@shikijs/langs/javascript';
	import json from '@shikijs/langs/json';
	import svelte from '@shikijs/langs/svelte';
	import typescript from '@shikijs/langs/typescript';
	import vesper from '@shikijs/themes/vesper';
	import { quintOut } from 'svelte/easing';
	import { fly } from 'svelte/transition';
	import { createHighlighterCore } from 'shiki/core';
	import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';
	import { cn } from '$lib/utils.js';

	const supportedLanguages = [
		'javascript',
		'typescript',
		'svelte',
		'html',
		'css',
		'json'
	] as const satisfies readonly SupportedLanguage[];

	interface Token {
		content: string;
		color?: string;
		fontStyle?: number;
	}

	type TokenLine = Token[];

	const highlighter = createHighlighterCore({
		engine: createJavaScriptRegexEngine(),
		langs: [javascript, typescript, svelte, html, css, json],
		themes: [vesper]
	});

	const normalizeLang = (language: SupportedLanguage): SupportedLanguage => {
		const lang = language.trim().toLowerCase();

		return supportedLanguages.includes(lang as SupportedLanguage)
			? (lang as SupportedLanguage)
			: language;
	};

	interface Props {
		state: CodeBlockState;
	}

	// eslint-disable-next-line svelte/no-unused-props -- false positive: `language` and `lines` are used through the `codeState` alias. Tracked in eslint-plugin-svelte#1142 / #1172.
	const { state: codeState }: Props = $props();

	let tokens = $state.raw<TokenLine[]>([]);
	let highlightedLanguage = $state<SupportedLanguage | undefined>();

	const code = $derived(codeState.lines.map((line) => line.content).join('\n'));

	$effect(() => {
		const language = codeState.language;
		const source = code;
		let cancelled = false;

		const highlight = async () => {
			const shiki = await highlighter;
			const lang = normalizeLang(language);

			if (cancelled) return;

			tokens = shiki.codeToTokens(source || ' ', { lang, theme: 'vesper' }).tokens as TokenLine[];
			highlightedLanguage = language;
		};

		void highlight();

		return () => {
			cancelled = true;
		};
	});

	const tokenStyle = (token: Token): string | undefined => {
		const styles = [`color: ${token.color ?? 'currentColor'}`];

		if (token.fontStyle === 1 || token.fontStyle === 3) styles.push('font-style: italic');
		if (token.fontStyle === 2 || token.fontStyle === 3) styles.push('font-weight: 700');

		return styles.join('; ');
	};
</script>

<div class="w-full overflow-hidden rounded-xl font-mono text-md">
	<div class="min-h-12 py-4">
		{#each codeState.lines as line, i (line.id ?? `${i}:${line.content}`)}
			<div
				class={cn(
					'flex gap-5 rounded-sm px-5 py-0.5 transition-colors duration-150 ease-out motion-safe:will-change-transform',
					line.highlighted && 'bg-primary/10',
					line.dimmed && 'opacity-30'
				)}
				in:fly={{ y: 4, duration: 700, delay: Math.min(i * 140, 900), easing: quintOut }}
			>
				<!-- eslint-disable-next-line better-tailwindcss/no-restricted-classes -- 1.5ch matches the monospace digit width for line numbers. -->
				<span class="min-w-[1.5ch] shrink-0 select-none text-right text-muted-foreground/35">
					{i + 1}
				</span>
				<span class="whitespace-pre">
					{#if highlightedLanguage === codeState.language && tokens[i]}
						{#each tokens[i] as token, tokenIndex (`${tokenIndex}:${token.content}`)}
							<span style={tokenStyle(token)}>{token.content}</span>
						{/each}
					{:else}
						{line.content || ' '}
					{/if}
				</span>
			</div>
		{/each}
	</div>
</div>
