<script module lang="ts">
	export interface CodeLine {
		id?: string;
		content: string;
		highlighted?: boolean;
		dimmed?: boolean;
	}

	// eslint-disable-next-line no-import-assign -- re-export, not an assignment
	export type { SupportedLanguage } from './code-highlighter.js';

	export interface CodeBlockState {
		language: SupportedLanguage;
		lines: CodeLine[];
	}
</script>

<script lang="ts">
	import { quintOut } from 'svelte/easing';
	import { fly } from 'svelte/transition';
	import { themeContext } from '$lib/themes/theme.svelte.js';
	import { cn } from '$lib/utils.js';
	import {
		getCodeHighlighter,
		supportedLanguages,
		type SupportedLanguage
	} from './code-highlighter.js';

	interface Token {
		content: string;
		color?: string;
		fontStyle?: number;
	}

	type TokenLine = Token[];

	const normalizeLang = (language: SupportedLanguage): SupportedLanguage => {
		const lang = language.trim().toLowerCase();

		return supportedLanguages.includes(lang as SupportedLanguage)
			? (lang as SupportedLanguage)
			: language;
	};

	interface Props {
		state: CodeBlockState;
	}

	// eslint-disable-next-line svelte/no-unused-props -- language and lines accessed via codeState alias
	const { state: codeState }: Props = $props();
	const theme = themeContext.get();

	let tokens = $state.raw<TokenLine[]>([]);
	let highlightedLanguage = $state<SupportedLanguage | undefined>();
	let highlightedTheme = $state<string | undefined>();

	const code = $derived(codeState.lines.map((line) => line.content).join('\n'));

	$effect(() => {
		const language = codeState.language;
		const source = code;
		const shikiTheme = theme.shikiTheme;
		let cancelled = false;

		const highlight = async () => {
			const shiki = await getCodeHighlighter();
			const lang = normalizeLang(language);

			if (cancelled) return;

			tokens = shiki.codeToTokens(source || ' ', { lang, theme: shikiTheme }).tokens as TokenLine[];
			highlightedLanguage = language;
			highlightedTheme = shikiTheme;
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
					{#if highlightedLanguage === codeState.language && highlightedTheme === theme.shikiTheme && tokens[i]}
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
