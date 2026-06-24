import { Context } from 'runed';
import type { Player } from '$lib/player.svelte.js';
import type { AppSoundEffects } from '$lib/sounds/sound-effects.svelte.js';

export type EpisodeNavigation = {
	readonly next: () => void;
	readonly prev: () => void;
};

export const createEpisodeNavigation = (
	player: Player,
	sounds: AppSoundEffects
): EpisodeNavigation => ({
	next: () => {
		if (!player.canGoNext) return;

		sounds.play('keyboard.click');
		player.next();
	},
	prev: () => {
		if (!player.canGoPrev) return;

		sounds.play('keyboard.click');
		player.prev();
	}
});

export const episodeNavigationContext = new Context<EpisodeNavigation>('episode-navigation');
