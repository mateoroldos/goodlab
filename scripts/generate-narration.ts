/**
 * Generates narration clips: one mp3 + alignment json per paragraph.
 *
 * Loads the real episode modules, so the catalog is the single source of truth:
 * the exact string keyed here is the exact string the runtime keys. Paragraphs
 * are synthesized in document order per episode; neighboring paragraph text is
 * passed as `previous_text`/`next_text` and the last 3 request IDs are chained
 * as `previous_request_ids` so the model maintains prosody continuity across
 * paragraphs.
 *
 * Existing clips are skipped unless --force is passed. Stale files are pruned.
 * Each paragraph is voiced by its speaker (see narration/speakers.ts). The
 * request-ID chain resets when the episode or speaker changes, or when a clip
 * is skipped.
 *
 * Usage:
 *   bun scripts/generate-narration.ts                          # skip existing
 *   bun scripts/generate-narration.ts --force                  # regenerate all
 *   bun scripts/generate-narration.ts --force --speaker <id>   # regenerate one speaker's clips
 *   bun scripts/generate-narration.ts --dry-run                # list clips, no API calls
 */
import { Glob } from 'bun';
import { mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import process from 'node:process';
import { paragraphSpeaker, type Episode } from '../src/lib/episode.js';
import { paragraphAnchors } from '../src/lib/narration/anchors.js';
import { narrationKey } from '../src/lib/narration/clips.js';
import { NARRATION_MODEL_ID, SPEAKERS, type SpeakerId } from '../src/lib/narration/speakers.js';

interface Args {
	dryRun: boolean;
	force: boolean;
	speaker: SpeakerId | undefined;
}

const fail = (message: string): never => {
	console.error(message);
	process.exit(1);
};

const parseArgs = (): Args => {
	const speakerIndex = process.argv.indexOf('--speaker');
	const speaker = speakerIndex === -1 ? undefined : process.argv[speakerIndex + 1];
	if (speakerIndex !== -1 && (!speaker || speaker.startsWith('--'))) {
		fail('Missing speaker id after --speaker.');
	}
	if (speaker !== undefined && !(speaker in SPEAKERS)) {
		fail(`Unknown speaker "${speaker}". Known: ${Object.keys(SPEAKERS).join(', ')}`);
	}

	return {
		dryRun: process.argv.includes('--dry-run'),
		force: process.argv.includes('--force'),
		speaker: speaker as SpeakerId | undefined
	};
};

const args = parseArgs();

const apiKey = process.env.ELEVENLABS_API_KEY;
const modelId = NARRATION_MODEL_ID;

if (process.env.ELEVENLABS_MODEL_ID && process.env.ELEVENLABS_MODEL_ID !== modelId) {
	fail(
		`ELEVENLABS_MODEL_ID is part of the narration cache key. Update NARRATION_MODEL_ID instead.`
	);
}

if (!apiKey && !args.dryRun) {
	fail('Missing ELEVENLABS_API_KEY. Put it in your shell or local .env file, never in git.');
}

interface Clip {
	key: string;
	series: string;
	episode: string;
	speaker: SpeakerId;
	text: string;
	/** Narration text of the preceding paragraph — shapes prosody but not spoken. */
	prevText: string | undefined;
	/** Narration text of the following paragraph — shapes prosody but not spoken. */
	nextText: string | undefined;
}

const root = process.cwd();
const manifestPath = `${root}/src/lib/content/narration-manifest.json`;
const staticRoot = `${root}/static/narration`;

const scan = async (pattern: string, cwd: string, absolute = false): Promise<string[]> =>
	(await Array.fromAsync(new Glob(pattern).scan({ absolute, cwd }))).sort();

const seriesSlug = (path: string): string => {
	const parts = path.split('/');
	const slug = parts[parts.indexOf('series') + 1];
	if (!slug) throw new Error(`Could not parse series from path: ${path}`);
	return slug;
};

const findEpisodeFiles = async (): Promise<string[]> =>
	[
		...(await scan('src/lib/content/series/*/episodes/*.ts', root, true)),
		...(await scan('src/lib/content/series/*/episodes/*/episode.ts', root, true))
	].filter((file) => !file.endsWith('.svelte.ts'));

const collectParagraphs = (
	series: string,
	episode: Episode
): Array<{ text: string; speaker: SpeakerId }> => {
	const items: Array<{ text: string; speaker: SpeakerId }> = [];
	const seen = new Set<string>();

	for (const chapter of episode.chapters) {
		for (const para of chapter.paragraphs) {
			const { text } = paragraphAnchors(para);
			if (text === '') continue;

			const speaker = paragraphSpeaker(para) as SpeakerId;
			const key = `${series}/${episode.slug}/${speaker}/${text}`;
			if (seen.has(key)) continue;

			seen.add(key);
			items.push({ speaker, text });
		}
	}

	return items;
};

const buildEpisodeClips = async (series: string, episode: Episode): Promise<Clip[]> => {
	const items = collectParagraphs(series, episode);

	return Promise.all(
		items.map(async ({ speaker, text }, i) => ({
			episode: episode.slug,
			key: await narrationKey(series, episode.slug, speaker, text),
			nextText: items[i + 1]?.text,
			prevText: items[i - 1]?.text,
			series,
			speaker,
			text
		}))
	);
};

/**
 * Returns all clips in document order (episode by episode, paragraph by
 * paragraph). Duplicate text within the same episode is deduplicated; the
 * first occurrence's context is preserved.
 */
const buildClips = async (): Promise<Clip[]> => {
	const all: Clip[] = [];

	for (const file of await findEpisodeFiles()) {
		const series = seriesSlug(relative(root, file));
		const { episode } = (await import(file)) as { episode: Episode };
		all.push(...(await buildEpisodeClips(series, episode)));
	}

	return all;
};

interface Synthesis {
	audio: Uint8Array;
	alignment: unknown;
	/** ElevenLabs request-id header value — used to chain previous_request_ids. */
	requestId: string;
}

const synthesize = async (clip: Clip, prevRequestIds: string[]): Promise<Synthesis> => {
	const { voice } = SPEAKERS[clip.speaker];
	const payload: Record<string, unknown> = {
		model_id: modelId,
		text: clip.text,
		voice_settings: voice.settings
	};
	if (clip.prevText) payload.previous_text = clip.prevText;
	if (clip.nextText) payload.next_text = clip.nextText;
	if (prevRequestIds.length > 0) payload.previous_request_ids = prevRequestIds.slice(-3);

	const response = await fetch(
		`https://api.elevenlabs.io/v1/text-to-speech/${voice.voiceId}/with-timestamps`,
		{
			body: JSON.stringify(payload),
			headers: { 'Content-Type': 'application/json', 'xi-api-key': apiKey! },
			method: 'POST'
		}
	);

	if (!response.ok) {
		const detail = await response.text().catch(() => '');
		throw new Error(`ElevenLabs ${response.status} for ${clip.series}/${clip.episode}: ${detail}`);
	}

	const requestId =
		response.headers.get('request-id') ?? response.headers.get('x-request-id') ?? '';
	const data = (await response.json()) as { audio_base64: string; alignment: unknown };
	return {
		alignment: data.alignment,
		audio: Uint8Array.from(Buffer.from(data.audio_base64, 'base64')),
		requestId
	};
};

const prune = async (keep: Set<string>): Promise<void> => {
	const files = await scan('**/*', staticRoot).catch(() => [] as string[]);
	for (const file of files) {
		if (keep.has(file)) continue;
		await rm(join(staticRoot, file));
		console.log(`Pruned narration/${file}`);
	}
	// Drop directories left empty by pruning
	const dirs = (await scan('**/', staticRoot).catch(() => [] as string[])).sort(
		(a, b) => b.length - a.length
	);
	for (const dir of dirs) {
		const abs = join(staticRoot, dir);
		if ((await readdir(abs).catch(() => ['x'])).length === 0) await rm(abs, { recursive: true });
	}
};

const main = async () => {
	const clips = await buildClips();

	if (args.dryRun) {
		for (const clip of clips) {
			const ctx = `${clip.prevText ? '←' : ' '}${clip.nextText ? '→' : ' '}`;
			console.log(`[${ctx}] ${clip.key.slice(0, -52)}…  "${clip.text.slice(0, 60)}"`);
		}
		console.log(`\n${clips.length} paragraph clips.`);
		return;
	}

	const manifest: { clips: Record<string, { audio: string; alignment: string }> } = { clips: {} };
	const keep = new Set<string>();

	let currentChainKey = '';
	let prevRequestIds: string[] = [];

	for (const clip of clips) {
		const rel = clip.key;
		manifest.clips[rel] = { alignment: `/narration/${rel}.json`, audio: `/narration/${rel}.mp3` };
		keep.add(`${rel}.mp3`);
		keep.add(`${rel}.json`);

		// Request-ID chains are per voice: reset at episode boundaries and
		// whenever the speaker changes (text context still flows across).
		const chainKey = `${clip.series}/${clip.episode}/${clip.speaker}`;
		if (chainKey !== currentChainKey) {
			currentChainKey = chainKey;
			prevRequestIds = [];
		}

		const audioFile = `${staticRoot}/${rel}.mp3`;
		const alignmentFile = `${staticRoot}/${rel}.json`;
		// --speaker narrows what --force regenerates; missing clips always generate.
		const forceThis = args.force && (args.speaker === undefined || clip.speaker === args.speaker);
		const exists =
			!forceThis &&
			(await Bun.file(audioFile).exists()) &&
			(await Bun.file(alignmentFile).exists());

		if (exists) {
			// Can't recover the request-ID from disk — break the chain so downstream
			// clips don't condition on a gap in the sequence.
			prevRequestIds = [];
			continue;
		}

		const { audio, alignment, requestId } = await synthesize(clip, prevRequestIds);
		await mkdir(dirname(audioFile), { recursive: true });
		await writeFile(audioFile, audio);
		await writeFile(alignmentFile, JSON.stringify(alignment));
		console.log(`Generated narration/${rel}.mp3`);

		prevRequestIds = requestId ? [...prevRequestIds, requestId].slice(-3) : [];
	}

	await prune(keep);
	await writeFile(manifestPath, `${JSON.stringify(manifest, null, '\t')}\n`);
	console.log(`\nWrote ${relative(root, manifestPath)} with ${clips.length} clips.`);
};

await main();
