import svelteConfig from '@sveltejs/eslint-config';

/** @type {import('eslint').Linter.Config[]} */
export default [
	...svelteConfig,
	{
		ignores: ['.svelte-kit/**', 'build/**', 'dist/**', '.vercel/**', '.netlify/**', '.wrangler/**']
	},
	{
		languageOptions: {
			parserOptions: {
				projectService: {
					allowDefaultProject: ['*.js']
				},
				tsconfigRootDir: import.meta.dirname
			}
		}
	}
];
