import { at, defineChapter, say, stop, type Episode } from '$lib/episode.js';
import SaveStateScene, { type SaveStateSceneState } from './save-state-scene.svelte';

const singleButtonChapter = defineChapter<SaveStateSceneState>({
	scene: SaveStateScene,
	id: 'single-button',
	title: 'What drives the button?',
	initial: { focus: 'isSaving', hasError: false, isSaving: false, mode: 'single-flag' },
	paragraphs: [
		[
			stop(
				"Come in, Ben — everyone's gone home. Best hour in the Goodlab... just the hum of the machines, and room to think.",
				{},
				{ sound: 'door.open' }
			)
		],
		say(
			'learner',
			"Staying late, John? ...And that's my code on your screen, isn't it? Is something wrong?"
		),
		[
			"Not wrong — not yet. It's your save button, your first feature. Clean, simple... I like it. Let's read it together."
		],
		['I see a first piece of state — `isSaving`.'],
		[
			'When the user clicks save, `isSaving` ',
			at('flips to `true`', { isSaving: true }),
			'. The button follows.'
		],
		[
			'And here — a second piece of state: ',
			at('`hasError`', { focus: 'hasError', isSaving: false, mode: 'error-flag' }),
			'. When a save fails, you ',
			at('flip it to `true`', { hasError: true }),
			' — and the button shows the error.'
		],
		say(
			'learner',
			stop(
				'I tested both, John — the spinner while it saves, the error when it fails. Both work.',
				{
					hasError: false
				}
			)
		)
	]
});

const ghostChapter = defineChapter<SaveStateSceneState>({
	scene: SaveStateScene,
	id: 'ghost',
	title: 'What happens when two flags disagree?',
	initial: { focus: 'isSaving', hasError: false, isSaving: false, mode: 'error-flag' },
	paragraphs: [
		[
			"Separately, they work — that's what you tested. But there's one thing you didn't realize, Ben. ",
			stop('A user clicks save', { focus: 'isSaving', isSaving: true, mode: 'ghost' }),
			' — and mid-save, an error comes back. We ',
			stop('flip `hasError` to `true`', { focus: 'contradiction', hasError: true }),
			'... and nothing stops us. Look at your button: both flags `true` at once — it spins **and** shows an error.'
		],
		[
			'[!bug] We just reached an impossible state — the button is saving and failing at the same time. Every time we set `hasError`, someone has to remember to flip `isSaving` back — and nothing enforces it. Two booleans, no rule between them.'
		]
	]
});

const shapeChapter = defineChapter<SaveStateSceneState>({
	scene: SaveStateScene,
	id: 'shape',
	title: 'How do we make it impossible?',
	initial: { hasError: false, isSaving: false, mode: 'error-flag' },
	paragraphs: [
		{
			speaker: 'learner',
			spans: [
				"But... wait. Can't we just reset both flags on every code path? Look — we ",
				stop('wrap the save in a try catch', { mode: 'patched', patchStep: 1 }),
				', ',
				at('flip the flags on the way in', { patchStep: 2 }),
				', reset in ',
				at('the try path', { patchStep: 3 }),
				', and in ',
				at('the catch too', { patchStep: 4 }),
				'.'
			]
		},
		[
			stop('Thanks Ben — your fix definitely works.', { patchStep: undefined }),
			' ',
			stop('The save starts', { isSaving: true, patchFocus: 'entry' }),
			' — ',
			stop('the try path runs', { patchFocus: 'try' }),
			', ',
			stop('and completes clean', { activeState: 'saved', isSaving: false }),
			'. And if it fails, ',
			stop('the catch path', { activeState: undefined, isSaving: true, patchFocus: 'catch' }),
			' ',
			stop('resets correctly too', { activeState: 'failed', isSaving: false, hasError: false }),
			'. But it only works until someone adds a new code path and forgets to reset.'
		],
		[
			"[!idea] Let's make a smarter move. Sorry Ben — I'll refactor this from scratch. ",
			stop('We delete the patch', {
				activeState: undefined,
				mode: 'named',
				namedRevealed: 0,
				patchFocus: undefined
			}),
			' and declare a single **union type** called ',
			at('`Status`', { focus: 'named-state' }),
			'.'
		],
		[
			'Our type holds the four possible states: ',
			stop('`idle`', { namedRevealed: 1, activeState: 'idle' }),
			', ',
			stop('`saving`', { namedRevealed: 2, activeState: 'saving' }),
			', ',
			stop('`failed`', { namedRevealed: 3, activeState: 'failed' }),
			' and ',
			stop('`saved`', { namedRevealed: 4, activeState: 'saved' }),
			' — one named value, holding exactly one state at a time.'
		],
		[
			"[!rule] Now the impossible combination is just... **impossible**. Not because we remembered to clean up — because the type won't allow it. We can safely move ",
			stop('to `saving`', { activeState: 'saving', namedRevealed: undefined }),
			', ',
			stop('to `saved`', { activeState: 'saved' }),
			', ',
			stop('to `failed`', { activeState: 'failed' }),
			', ',
			stop('back to `idle`', { activeState: 'idle' }),
			' — button and code in lockstep.'
		],
		say<SaveStateSceneState>(
			'learner',
			"But... wait a second. Can't we jump straight ",
			stop('from `idle`', { activeState: 'idle' }),
			' ',
			stop('to `failed`', { activeState: 'failed' }),
			" — without ever passing through `saving`? Isn't that impossible?"
		),
		['Sharp eyes, Ben. We just found a second problem: **impossible transitions**.']
	]
});

export const episode: Episode = {
	chapters: [singleButtonChapter, ghostChapter, shapeChapter],
	description: 'Why boolean flags create invalid workflow states, and how named modes remove them.',
	slug: '01-the-bug-is-impossible-combinations',
	title: 'The bug is impossible combinations'
};
