export type Track = {
	id: string;
	title: string;
	artist: string;
};

type YouTubePlayer = {
	playVideo(): void;
	pauseVideo(): void;
	loadVideoById(id: string): void;
	setVolume(volume: number): void;
	getVolume(): number;
	destroy(): void;
};

type YouTubeApi = {
	Player: new (
		elementId: string,
		options: {
			videoId: string;
			width: string;
			height: string;
			playerVars: Record<string, number>;
			events: { onStateChange(event: { data: number }): void };
		}
	) => YouTubePlayer;
	PlayerState: {
		PLAYING: number;
		ENDED: number;
	};
};

type YouTubeWindow = Window & {
	YT?: YouTubeApi;
	onYouTubeIframeAPIReady?: () => void;
};

const IFRAME_API_SRC = 'https://www.youtube.com/iframe_api';

export class YouTubeMusicPlayer {
	readonly tracks: readonly Track[];
	readonly playerId: string;

	#player: YouTubePlayer | null = null;

	isPlaying = $state(false);
	currentIdx = $state(0);
	hasSelected = $state(false);
	discOpen = $state(false);

	constructor(tracks: readonly Track[], playerId: string) {
		this.tracks = tracks;
		this.playerId = playerId;
	}

	get track(): Track {
		return this.tracks[this.currentIdx];
	}

	get thumb(): string {
		return this.thumbnailFor(this.track);
	}

	thumbnailFor(track: Track): string {
		return `https://img.youtube.com/vi/${track.id}/mqdefault.jpg`;
	}

	mount(): () => void {
		this.#loadApiScript();

		const win = window as YouTubeWindow;
		if (win.YT?.Player) {
			this.#createPlayer();
			return this.destroy;
		}

		const ready = win.onYouTubeIframeAPIReady;
		win.onYouTubeIframeAPIReady = () => {
			ready?.();
			this.#createPlayer();
		};

		return this.destroy;
	}

	destroy = () => {
		this.#player?.destroy();
		this.#player = null;
	};

	load = (idx: number) => {
		const track = this.tracks[idx];
		if (!track) return;

		this.currentIdx = idx;
		this.hasSelected = true;
		this.#player?.loadVideoById(track.id);
		this.isPlaying = true;
	};

	toggle = () => {
		if (!this.#player) return;

		if (this.isPlaying) {
			this.#player.pauseVideo();
			return;
		}

		this.#player.playVideo();
	};

	prev = () => this.load((this.currentIdx - 1 + this.tracks.length) % this.tracks.length);
	next = () => this.load((this.currentIdx + 1) % this.tracks.length);

	/**
	 * Fade the music out (~1.5s), then pause — the room going quiet.
	 * No-op when nothing is playing. Volume is restored after the pause so a
	 * later manual play returns at full level.
	 */
	fadeOut = () => {
		const p = this.#player;
		if (!p || !this.isPlaying) return;

		const from = p.getVolume();
		const start = performance.now();
		const dur = 1500;
		const step = (now: number) => {
			// Bail into the pause if the user paused mid-fade — never leave volume low.
			const t = this.isPlaying ? Math.min((now - start) / dur, 1) : 1;
			p.setVolume(from * (1 - t));
			if (t < 1) {
				requestAnimationFrame(step);
				return;
			}
			p.pauseVideo();
			p.setVolume(from);
		};
		requestAnimationFrame(step);
	};

	#createPlayer() {
		const api = (window as YouTubeWindow).YT;
		if (!api?.Player || this.#player) return;

		this.#player = new api.Player(this.playerId, {
			videoId: this.tracks[0].id,
			width: '1',
			height: '1',
			playerVars: { autoplay: 0, controls: 0, rel: 0 },
			events: {
				onStateChange: ({ data }) => {
					this.isPlaying = data === api.PlayerState.PLAYING;
					if (data === api.PlayerState.ENDED) this.next();
				}
			}
		});
	}

	#loadApiScript() {
		if (document.querySelector(`script[src*="${IFRAME_API_SRC}"]`)) return;

		const tag = document.createElement('script');
		tag.src = IFRAME_API_SRC;
		document.head.appendChild(tag);
	}
}
