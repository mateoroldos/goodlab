import type { CodeBlockState } from '$lib/visuals/code-block/code-block.svelte';

export function codeExample(language: CodeBlockState['language'], source: string): CodeBlockState {
	return {
		language,
		lines: source
			.trim()
			.split('\n')
			.map((content) => ({ content }))
	};
}
