import { defineChapter, type Episode } from '$lib/episode.js';
import CodeBlock, { type CodeBlockState } from '$lib/visuals/code-block/code-block.svelte';

const declarationChapter = defineChapter<CodeBlockState>({
	component: CodeBlock,
	id: 'declaration',
	steps: [
		{
			phases: [
				{
					state: {
						language: 'javascript',
						lines: [
							{ content: 'function greet(name) {' },
							{ content: '  return `Hello, ${name}`' },
							{ content: '}' }
						]
					}
				}
			],
			text: 'A function gives a reusable behavior a name. Here, greet accepts a name and returns a message.'
		},
		{
			phases: [
				{
					state: {
						language: 'javascript',
						lines: [
							{ content: 'function greet(name) {', highlighted: true },
							{ content: '  return `Hello, ${name}`' },
							{ content: '}' }
						]
					}
				},
				{
					state: {
						language: 'javascript',
						lines: [
							{ content: 'function greet(name) {' },
							{ content: '  return `Hello, ${name}`', highlighted: true },
							{ content: '}' }
						]
					}
				}
			],
			text: 'The function signature describes the input. The body describes what happens when the function runs.'
		}
	],
	title: 'declaration'
});

const callChapter = defineChapter<CodeBlockState>({
	component: CodeBlock,
	id: 'call',
	steps: [
		{
			phases: [
				{
					state: {
						language: 'javascript',
						lines: [
							{ content: 'const message = greet("Ada")' },
							{ content: '' },
							{ content: '// "Hello, Ada"' }
						]
					}
				}
			],
			text: 'Calling a function runs the stored behavior with concrete values.'
		},
		{
			phases: [
				{
					state: {
						language: 'javascript',
						lines: [
							{ content: 'const first = greet("Ada")' },
							{ content: 'const second = greet("Linus")' },
							{ content: '' },
							{ content: '// same behavior, different input', highlighted: true }
						]
					}
				}
			],
			text: 'That reuse is the point: one definition can produce many results.'
		}
	],
	title: 'call'
});

export const episode: Episode = {
	chapters: [declarationChapter, callChapter],
	description: 'How functions package reusable behavior.',
	slug: '02-functions',
	title: 'functions'
};
