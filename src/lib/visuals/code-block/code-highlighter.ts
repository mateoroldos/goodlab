import css from '@shikijs/langs/css';
import html from '@shikijs/langs/html';
import javascript from '@shikijs/langs/javascript';
import json from '@shikijs/langs/json';
import svelte from '@shikijs/langs/svelte';
import typescript from '@shikijs/langs/typescript';
import catppuccinMocha from '@shikijs/themes/catppuccin-mocha';
import dracula from '@shikijs/themes/dracula';
import githubDarkDefault from '@shikijs/themes/github-dark-default';
import gruvboxDarkMedium from '@shikijs/themes/gruvbox-dark-medium';
import nord from '@shikijs/themes/nord';
import rosePine from '@shikijs/themes/rose-pine';
import solarizedLight from '@shikijs/themes/solarized-light';
import tokyoNight from '@shikijs/themes/tokyo-night';
import vesper from '@shikijs/themes/vesper';
import { createHighlighterCore } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';

type CodeHighlighter = ReturnType<typeof createHighlighterCore>;

let highlighter: CodeHighlighter | undefined;

export const supportedLanguages = [
	'javascript',
	'typescript',
	'svelte',
	'html',
	'css',
	'json'
] as const;

export type SupportedLanguage = (typeof supportedLanguages)[number];

export function getCodeHighlighter() {
	highlighter ??= createHighlighterCore({
		engine: createJavaScriptRegexEngine(),
		langs: [javascript, typescript, svelte, html, css, json],
		themes: [
			vesper,
			gruvboxDarkMedium,
			catppuccinMocha,
			dracula,
			githubDarkDefault,
			nord,
			rosePine,
			tokyoNight,
			solarizedLight
		]
	});

	return highlighter;
}
