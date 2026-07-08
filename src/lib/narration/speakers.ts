/**
 * The cast. Every narrated paragraph belongs to one speaker; the generation
 * script maps speakers to ElevenLabs voices, the player styles their text.
 *
 * `guide` — John, the experienced voice that teaches. Default for all paragraphs.
 * `learner` — Ben, the curious voice that objects and asks. Used sparingly, at
 * pivot points, for the questions the reader is already asking.
 * `boss` — George, who barges in with feature requests and deadlines. Every
 * new requirement in the story arrives through him.
 */
export interface SpeakerVoice {
	/** ElevenLabs voice id. */
	voiceId: string;
	/** Per-voice synthesis settings sent with every request. */
	settings: { stability: number; similarity_boost: number };
}

export const NARRATION_MODEL_ID = 'eleven_multilingual_v2';

export interface Speaker {
	label: string;
	name: string;
	voice: SpeakerVoice;
}

export const SPEAKERS = {
	boss: {
		label: 'Boss',
		name: 'George',
		voice: {
			voiceId: 'dtSEyYGNJqjrtBArPCVZ',
			settings: { similarity_boost: 0.75, stability: 0.5 }
		}
	},
	guide: {
		label: 'Guide',
		name: 'John',
		voice: {
			voiceId: 'kLhAstPcnnPxqzk6gS5i',
			settings: { similarity_boost: 0.85, stability: 0.7 }
		}
	},
	learner: {
		label: 'Learner',
		name: 'Ben',
		voice: {
			voiceId: 'Rn9Yq7uum9irZ6RwppDN',
			settings: { similarity_boost: 0.75, stability: 0.45 }
		}
	}
} as const satisfies Record<string, Speaker>;

export type SpeakerId = keyof typeof SPEAKERS;

export const defaultSpeaker: SpeakerId = 'guide';
