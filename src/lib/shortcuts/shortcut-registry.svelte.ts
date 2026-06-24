import { Context } from 'runed';

export type Shortcut = {
	readonly key: string;
	readonly description: string;
	readonly scope?: string;
	readonly run: () => void;
	readonly when?: () => boolean;
};

type ShortcutEntry = {
	readonly id: symbol;
	readonly shortcut: Shortcut;
};

const isTypingTarget = (target: EventTarget | null) =>
	target instanceof HTMLElement &&
	(target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

export class ShortcutRegistry {
	readonly #entries = $state<ShortcutEntry[]>([]);

	register(shortcuts: readonly Shortcut[]): () => void {
		const entries = shortcuts.map((shortcut) => ({ id: Symbol(shortcut.key), shortcut }));
		this.#entries.push(...entries);

		return () => {
			for (const entry of entries) {
				const idx = this.#entries.findIndex((candidate) => candidate.id === entry.id);
				if (idx !== -1) this.#entries.splice(idx, 1);
			}
		};
	}

	handle(e: KeyboardEvent): void {
		if (isTypingTarget(e.target)) return;

		const entry = this.#entries.findLast(({ shortcut }) => {
			if (shortcut.key !== e.key) return false;
			return shortcut.when?.() ?? true;
		});

		if (!entry) return;

		e.preventDefault();
		entry.shortcut.run();
	}
}

export const shortcutContext = new Context<ShortcutRegistry>('shortcut-registry');
