import { defineScene, type Episode } from '$lib/episode.js';
import CodeBlock, { type CodeBlockState } from '$lib/scenes/code-block/code-block.svelte';

const constScene = defineScene<CodeBlockState>({
	component: CodeBlock,
	id: 'const',
	steps: [
		{
			phases: [
				{
					state: {
						language: 'javascript',
						lines: [{ content: 'const name = "Alice"' }]
					}
				}
			],
			text: "In JavaScript, we use const to declare variables. It's the modern default for values that won't change."
		},
		{
			phases: [
				{
					state: {
						language: 'javascript',
						lines: [{ content: 'const name = "Alice"', highlighted: true }]
					}
				},
				{
					state: {
						language: 'javascript',
						lines: [
							{ content: 'const name = "Alice"' },
							{ content: '' },
							{ content: 'name = "Bob"  // ❌ TypeError', highlighted: true }
						]
					}
				}
			],
			text: 'const creates a binding that cannot be reassigned. Trying to do so throws a TypeError at runtime.'
		},
		{
			phases: [
				{
					state: {
						language: 'javascript',
						lines: [
							{ content: 'const PI = 3.14159' },
							{ content: 'const MAX_RETRIES = 3' },
							{ content: 'const BASE_URL = "https://api.example.com"' }
						]
					}
				}
			],
			text: "Use const as your default. It communicates intent: this value is permanent and shouldn't change."
		}
	],
	title: 'const'
});

const letScene = defineScene<CodeBlockState>({
	component: CodeBlock,
	id: 'let',
	steps: [
		{
			phases: [
				{
					state: {
						language: 'javascript',
						lines: [{ content: 'let counter = 0' }]
					}
				}
			],
			text: "Sometimes a value genuinely needs to change over time. That's exactly what let is designed for."
		},
		{
			phases: [
				{
					state: {
						language: 'javascript',
						lines: [
							{ content: 'let counter = 0' },
							{ content: '' },
							{ content: 'counter++  // ✓ 1' }
						]
					}
				},
				{
					state: {
						language: 'javascript',
						lines: [
							{ content: 'let counter = 0' },
							{ content: '' },
							{ content: 'counter++  // ✓ 1' },
							{ content: 'counter++  // ✓ 2' },
							{ content: 'counter++  // ✓ 3' }
						]
					}
				}
			],
			text: 'Unlike const, let allows free reassignment. The variable is a container whose contents can change.'
		},
		{
			phases: [
				{
					state: {
						language: 'javascript',
						lines: [
							{ content: "// ✓ const for things that don't change" },
							{ content: 'const userId = user.id' },
							{ content: '' },
							{ content: '// ✓ let for things that do' },
							{ content: 'let total = 0' },
							{ content: 'for (const item of cart) total += item.price' }
						]
					}
				}
			],
			text: 'The rule: reach for const first. Switch to let only when reassignment is genuinely the point.'
		}
	],
	title: 'let'
});

export const episode: Episode = {
	description: "The difference between JavaScript's two variable declarations.",
	scenes: [constScene, letScene],
	slug: '01-test',
	title: 'const vs let'
};
