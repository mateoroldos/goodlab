import { NARRATION_MODEL_ID, SPEAKERS, type SpeakerId } from './speakers.js';

/** One generated paragraph clip: audio plus its character-level alignment. */
export interface NarrationClip {
	audio: string;
	alignment: string;
}

export interface NarrationManifest {
	clips: Record<string, NarrationClip>;
}

const stableJson = (value: unknown): string => {
	if (value === null || typeof value !== 'object') return JSON.stringify(value);
	if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;

	return `{${Object.entries(value)
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([key, val]) => `${JSON.stringify(key)}:${stableJson(val)}`)
		.join(',')}}`;
};

/** Content-addressed clip id: sha-256 of the spoken text and synthesis inputs. */
export const narrationHash = async (speaker: SpeakerId, text: string): Promise<string> => {
	const { voice } = SPEAKERS[speaker];
	const input = stableJson({
		modelId: NARRATION_MODEL_ID,
		settings: voice.settings,
		text,
		voiceId: voice.voiceId
	});
	const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
	return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
};

/** Speaker lives in the key path so the same line voiced by two speakers can't collide. */
export const narrationKey = async (
	seriesSlug: string,
	episodeSlug: string,
	speaker: SpeakerId,
	text: string
): Promise<string> =>
	`${seriesSlug}/${episodeSlug}/${speaker}/${await narrationHash(speaker, text)}`;

/** True when the manifest has any clip for this episode — gates the Listen affordance. */
export const hasNarration = (
	manifest: NarrationManifest,
	seriesSlug: string | undefined,
	episodeSlug: string
): boolean =>
	seriesSlug !== undefined &&
	Object.keys(manifest.clips).some((key) => key.startsWith(`${seriesSlug}/${episodeSlug}/`));
