import { Context, PersistedState } from 'runed';

export const themes = [
	{ id: 'vesper', label: 'Vesper', shiki: 'vesper' },
	{ id: 'gruvbox', label: 'Gruvbox', shiki: 'gruvbox-dark-medium' },
	{ id: 'catppuccin', label: 'Catppuccin', shiki: 'catppuccin-mocha' },
	{ id: 'dracula', label: 'Dracula', shiki: 'dracula' },
	{ id: 'github-dark', label: 'GitHub Dark', shiki: 'github-dark-default' },
	{ id: 'nord', label: 'Nord', shiki: 'nord' },
	{ id: 'rose-pine', label: 'Rose Pine', shiki: 'rose-pine' },
	{ id: 'tokyo-night', label: 'Tokyo Night', shiki: 'tokyo-night' },
	{ id: 'solarized-light', label: 'Solarized Light', shiki: 'solarized-light' }
] as const;

export type Theme = (typeof themes)[number];
export type ThemeId = Theme['id'];
export type ShikiTheme = Theme['shiki'];

const fallback = themes[0];

const findTheme = (id: string): Theme => themes.find((theme) => theme.id === id) ?? fallback;

export class ThemeState {
	readonly #theme = new PersistedState<ThemeId>('goodlab-theme', fallback.id);

	get current(): Theme {
		return findTheme(this.#theme.current);
	}

	get id(): ThemeId {
		return this.current.id;
	}

	get shikiTheme(): ShikiTheme {
		return this.current.shiki;
	}

	set(id: ThemeId): void {
		this.#theme.current = id;
	}

	select(id: string): void {
		this.#theme.current = findTheme(id).id;
	}
}

export const themeContext = new Context<ThemeState>('theme');
