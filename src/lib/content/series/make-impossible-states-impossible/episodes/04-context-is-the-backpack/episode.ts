import { at, defineChapter, say, stop, type Episode } from '$lib/episode.js';
import ContextScene, { type ContextSceneState } from './context-scene.svelte';

const explosionChapter = defineChapter<ContextSceneState>({
	scene: ContextScene,
	id: 'state-explosion',
	title: 'Where does the data go?',
	initial: { mode: 'explosion' },
	paragraphs: [
		[
			'George is right — we do need to track how many times the save has failed. Ben, any quick idea?'
		],
		say(
			'learner',
			'Easy — we can ',
			stop('encode the count in the state name itself', {
				explosion: { focusFrom: 0, revealed: 1 }
			}),
			': ',
			at('`failed-2nd-attempt`', { explosion: { focusFrom: 1, revealed: 2 } }),
			', ',
			at('`failed-3rd-attempt`', { explosion: { focusFrom: 2, revealed: 3 } }),
			'...'
		),
		[
			'Thanks Ben — it works. [!bug] But watch the foot-gun: every new fact multiplies the states. Track ',
			stop('timeouts', { explosion: { focusFrom: 3, revealed: 4 } }),
			'. Track ',
			at('auth errors', { explosion: { focusFrom: 4, revealed: 5 } }),
			'. Each name is now doing two jobs: where the machine is, and what it has to remember.'
		],
		say(
			'learner',
			'Ugh... this is getting out of hand. How do we track data without breeding new states?'
		)
	]
});

const backpackChapter = defineChapter<ContextSceneState>({
	scene: ContextScene,
	id: 'context-backpack',
	title: 'What does the machine carry?',
	initial: {
		mode: 'backpack',
		contextRevealed: 0,
		currentNode: 'idle',
		retries: 0,
		message: null
	},
	paragraphs: [
		[
			'[!idea] We should split the two jobs, Ben. The state says ',
			stop('where the machine is', { focus: 'status' }),
			'. The **context** is ',
			at('the backpack it carries', { contextRevealed: 1, focus: 'context' }),
			" — holding what it knows. We'll carry ",
			at('the `retries` count', { contextRevealed: 2, focus: 'retries' }),
			' and ',
			at('the error `message`', { contextRevealed: 3, focus: 'message' }),
			' in here.'
		],
		[
			'Now, when our machine ',
			at('moves', { currentNode: 'failed', focus: 'status' }),
			', ',
			at('the backpack moves with it', {
				focus: 'context',
				message: 'Network error',
				retries: 1
			}),
			'.'
		],
		[
			'We ',
			at('save again', { currentNode: 'saving', focus: 'status' }),
			' — and it fails a second time. The machine ',
			at('moves exactly as before', {
				currentNode: 'failed',
				focus: 'status',
				message: 'Timeout'
			}),
			' — same `failed` node. The first failure or the fifth: ',
			at('the count travels in the backpack', { focus: 'retries', retries: 2 }),
			', not in the state.'
		],
		[
			'And when the save finally ',
			at('succeeds', { currentNode: 'saved', focus: 'status' }),
			', ',
			at('the context resets', { focus: 'context', message: null, retries: 0 }),
			'. Whatever the data does — reset, grow, persist — the graph never changes shape.'
		],
		[
			stop(
				"[!rule] So now the state tracks the position, and the context tracks the machine's memory. Both stay small — each with a single responsibility.",
				{ currentNode: 'idle', focus: undefined }
			)
		],
		say(
			'learner',
			"But... hold on. Shouldn't we check that limit somewhere? If `retries` keeps growing, shouldn't we stop retrying at some point?"
		)
	]
});

export const episode: Episode = {
	chapters: [explosionChapter, backpackChapter],
	description:
		'States describe location. Context carries data. Separating them keeps the graph small.',
	slug: '04-context-is-the-backpack',
	title: 'Context is the backpack'
};
