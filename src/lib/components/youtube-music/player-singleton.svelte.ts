import { YouTubeMusicPlayer } from './youtube-music-player.svelte.js';
import { youtubeMusicTracks } from './youtube-music-tracks.js';

export const PLAYER_ID = 'yt-vinyl-hidden';
export const player = new YouTubeMusicPlayer(youtubeMusicTracks, PLAYER_ID);
