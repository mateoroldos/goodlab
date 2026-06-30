import svelteConfig from '@sveltejs/eslint-config';
import betterTailwind from 'eslint-plugin-better-tailwindcss';

/** @type {import('eslint').Linter.Config[]} */
export default [
	...svelteConfig,

	{
		plugins: {
			'better-tailwindcss': betterTailwind
		},
		settings: {
			'better-tailwindcss': {
				entryPoint: 'src/routes/layout.css'
			}
		},
		rules: {
			// Core correctness rules you likely want
			'better-tailwindcss/no-duplicate-classes': 'warn',
			'better-tailwindcss/no-conflicting-classes': 'warn',
			// Ban arbitrary values with a plain regex string
			'better-tailwindcss/no-restricted-classes': [
				'warn',
				{
					restrict: ['([a-zA-Z0-9_-]+-\\[[^\\[\\]]+\\]$|^\\[[^\\[\\]]+:[^\\[\\]]+\\]$)']
				}
			]
		}
	},

	// Disable arbitrary-value ban for shadcn/ui components we don't own
	{
		files: ['src/lib/components/ui/**'],
		rules: {
			'better-tailwindcss/no-restricted-classes': 'off'
		}
	},

	// TypeScript project service
	{
		languageOptions: {
			parserOptions: {
				projectService: {
					allowDefaultProject: ['*.js', 'drizzle.config.ts']
				},
				tsconfigRootDir: import.meta.dirname
			}
		}
	},

	{
		ignores: ['.svelte-kit/**', 'build/**', 'dist/**', '.vercel/**', '.netlify/**', '.wrangler/**']
	}
];
