import { at, defineChapter, say, stop, type Episode } from '$lib/episode.js';
import RecapScene, { type RecapSceneState } from './recap-scene.svelte';

const completeChapter = defineChapter<RecapSceneState>({
	scene: RecapScene,
	id: 'complete-machine',
	title: 'Can one picture hold it all?',
	initial: { phase: 1, retries: 0, statesRevealed: 0 },
	paragraphs: [
		[
			"Let's go back to where we started, Ben. We had four named states — ",
			stop('`idle`', { focus: 'state-idle', statesRevealed: 1 }),
			', ',
			stop('`saving`', { focus: 'state-saving', statesRevealed: 2 }),
			', ',
			stop('`failed`', { focus: 'state-failed', statesRevealed: 3 }),
			' and ',
			stop('`saved`', { focus: 'state-saved', statesRevealed: 4 }),
			'. The impossible combinations were gone.'
		],
		[
			'Then we connected them with events. ',
			stop('`SAVE` only fires from `idle`', {
				focus: 'events-idle',
				phase: 2,
				statesRevealed: undefined
			}),
			'. ',
			stop('`SUCCESS` and `FAIL` only fire from `saving`', { focus: 'events-saving' }),
			'. ',
			stop('`RETRY` from `failed`', { focus: 'events-failed' }),
			', ',
			stop('`DONE` from `saved`', { focus: 'events-saved' }),
			'. Each event locked to where it makes sense.'
		],
		[
			'Then we needed to carry data — the retry count, the last error message. So we added ',
			at('context', { focus: 'ctx', phase: 3 }),
			': a backpack that travels with the machine.'
		],
		[
			'Then we needed a condition: `RETRY` should only fire under the retry limit. So we put ',
			at('a guard on the door', { focus: 'guard', guardVisible: true, phase: 4 }),
			' — the rule lives on the machine, not buried in a handler.'
		],
		[
			'And every transition that triggers an effect declares it right there — ',
			at('`startRequest`', { focus: 'action-startRequest', guardVisible: undefined, phase: 5 }),
			', ',
			at('`clearError`', { focus: 'action-clearError' }),
			', ',
			at('`incrementRetries`', { focus: 'action-incrementRetries' }),
			' — each one on the edge that owns it.'
		],
		say(
			'learner',
			'John... this is beautiful. Everything in one place — no handler to update every time we add a caller, no effects to remember, easy to test. Can we see it flow? Start to finish?'
		),
		[
			'Sure Ben — we just need to ',
			stop('create an actor', { focus: undefined, usageStep: 1 }),
			', ',
			at('subscribe to it', { usageStep: 2 }),
			'... and then, just send events!'
		],
		[
			stop('Watch it run.', { currentNode: 'idle', showGraph: true }),
			' ',
			stop('Save.', { mailbox: 'SAVE' }),
			' ',
			stop('The machine fires', {
				activeAction: 'startRequest',
				activeEdge: 'idle-saving',
				currentNode: 'saving',
				mailbox: undefined,
				snapshots: ['idle', 'saving']
			}),
			' — ',
			stop('and it fails', {
				activeAction: 'incrementRetries',
				activeEdge: 'saving-failed',
				currentNode: 'failed',
				retries: 1,
				snapshots: ['idle', 'saving', 'failed']
			}),
			'. ',
			stop('The guard checks the count', {
				activeAction: undefined,
				activeEdge: undefined,
				guardVisible: true
			}),
			' — still under the limit — so ',
			stop('the retry goes through', {
				mailbox: 'RETRY',
				guardVisible: undefined
			}),
			' ',
			stop('and fires', {
				activeAction: 'startRequest',
				activeEdge: 'failed-saving',
				currentNode: 'saving',
				mailbox: undefined,
				snapshots: ['idle', 'saving', 'failed', 'saving']
			}),
			'. This time ',
			stop('it succeeds', {
				activeAction: 'clearError',
				activeEdge: 'saving-saved',
				currentNode: 'saved',
				guardVisible: undefined,
				retries: 0,
				snapshots: ['idle', 'saving', 'failed', 'saving', 'saved']
			}),
			'. The whole workflow, one graph.'
		],
		[
			stop(
				'That was a long run, Ben. We started with two `useState` booleans and a hidden bug — and now we have this beautiful state machine. [!rule] Impossible states: **impossible**. Impossible transitions: **impossible**. Guards, effects, context — all declared right on the machine. And we know what an actor is — we can run as many as we want, each independent.',
				{
					activeAction: undefined,
					activeEdge: undefined,
					currentNode: undefined,
					mailbox: undefined
				}
			)
		],
		say(
			'boss',
			stop(
				"Too late, gentlemen — I'm closing the office! Oh, and Ben: the checkout flow keeps double-charging when people click pay twice. I need it fixed by Friday.",
				{},
				{ sound: 'door.open' }
			)
		),
		[
			'Ok George, just let us grab our things. ',
			stop(
				"Beers on me, Ben — do you already know how you'll solve that double-charge problem?",
				{},
				{ sound: 'door.close' }
			)
		],
		say('learner', 'Hmm... a state machine?')
	]
});

export const episode: Episode = {
	chapters: [completeChapter],
	description:
		'Everything in one place — states, context, guards, and effects. The complete machine.',
	slug: '08-the-complete-picture',
	title: 'The complete picture'
};
