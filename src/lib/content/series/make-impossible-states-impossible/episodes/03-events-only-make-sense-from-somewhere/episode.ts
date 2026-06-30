import { at, defineChapter, say, stop, type Episode } from '$lib/episode.js';
import StateEventsScene, { type StateEventsSceneState } from './state-events-scene.svelte';

const namedEventsChapter = defineChapter<StateEventsSceneState>({
	scene: StateEventsScene,
	id: 'named-events',
	title: 'Who decides what an event does?',
	initial: { currentNode: 'idle', codeMode: 'event-type', eventsRevealed: 0 },
	paragraphs: [
		[
			"[!idea] Time for another smart move, Ben. Instead of calling `setStatus` from anywhere, we send named events — and the current state decides what to do with them. We need a type for them. Let's call it ",
			stop('`Event`', { eventsRevealed: 0, focus: undefined }),
			'. It will have: ',
			at('`SAVE`', { eventsRevealed: 1, focus: { event: 'SAVE' } }),
			', ',
			at('`SUCCESS`', { eventsRevealed: 2, focus: { event: 'SUCCESS' } }),
			', ',
			at('`FAIL`', { eventsRevealed: 3, focus: { event: 'FAIL' } }),
			', ',
			at('`RETRY`', { eventsRevealed: 4, focus: { event: 'RETRY' } }),
			', and ',
			at('`DONE`', { eventsRevealed: 5, focus: { event: 'DONE' } }),
			' — one type per thing that can happen.'
		],
		[
			stop('When a `SAVE` event arrives', { focus: { event: 'SAVE' } }),
			' while we sit in `idle`, `idle` should have a rule for it — one that ',
			at('moves us to `saving`', { currentNode: 'saving', focus: { edge: 'idle-saving' } }),
			'.'
		]
	]
});

const stateRelativeChapter = defineChapter<StateEventsSceneState>({
	scene: StateEventsScene,
	id: 'state-relative',
	title: 'What if the event arrives twice?',
	initial: { currentNode: 'saving', codeMode: 'event-type', eventsRevealed: 5 },
	paragraphs: [
		{
			ask: true,
			speaker: 'learner',
			spans: [
				stop("But... wait. What if the same `SAVE` arrives while we're already `saving`?", {
					focus: { event: 'SAVE' }
				})
			]
		},
		[
			'Good question Ben. ',
			stop("A rule for that shouldn't exist", { focus: undefined, rejected: true }),
			' — and the machine should just stay put.'
		],
		[
			stop('Now, if `FAIL` arrives', { focus: { event: 'FAIL' }, rejected: undefined }),
			' while `saving`, another rule should exist — ',
			at('one that moves the machine to `failed`', {
				currentNode: 'failed',
				focus: { edge: 'saving-failed' }
			}),
			'.'
		],
		say<StateEventsSceneState>(
			'learner',
			'Hmm... and say we sit ',
			stop('back in `idle`', { currentNode: 'idle', focus: undefined }),
			' — ',
			at('what about `FAIL` arriving there?', { focus: { event: 'FAIL' } })
		),
		[
			stop('No rule, Ben. Ignored.', { focus: undefined, rejected: true }),
			" [!rule] And that's how impossible transitions disappear — impossible rules are simply never written."
		]
	]
});

const completeSpecChapter = defineChapter<StateEventsSceneState>({
	scene: StateEventsScene,
	id: 'complete-spec',
	title: 'Can we see every rule at once?',
	initial: { currentNode: 'idle', codeMode: 'transition-map', mapRevealed: 0 },
	paragraphs: [
		[
			"Now let's put it all in one place — states, events, and the rules between them. State plus event decides what comes next."
		],
		[
			stop('`idle` gets one rule', {
				focus: { edge: 'idle-saving', event: 'SAVE' },
				mapRevealed: 1
			}),
			': `SAVE` moves us to `saving`. `saving` gets two — ',
			at('`SUCCESS` lands in `saved`', {
				currentNode: 'saving',
				focus: { edge: 'saving-saved', event: 'SUCCESS' },
				mapRevealed: 2
			}),
			', ',
			at('`FAIL` lands in `failed`', {
				focus: { edge: 'saving-failed', event: 'FAIL' },
				mapRevealed: 3
			}),
			'. Then ',
			at('`RETRY` from `failed`', {
				currentNode: 'failed',
				focus: { edge: 'failed-saving', event: 'RETRY' },
				mapRevealed: 4
			}),
			', and ',
			at('`DONE` from `saved`', {
				currentNode: 'saved',
				focus: { edge: 'saved-idle', event: 'DONE' },
				mapRevealed: 5
			}),
			'. Every missing rule is a blocked path — not by accident, but because no one wrote it.'
		],
		[
			stop(
				'[!rule] Congratulations to us — this little table is our first **state machine**. Read it and you know every valid path. No handlers to trace all around our codebase, no scattered conditions.',
				{ currentNode: 'idle', focus: undefined }
			)
		],
		say(
			'boss',
			stop(
				"I could hear the celebration through the wall, gentlemen! Don't get too comfortable. When a save fails, I need to know how many times it failed — and why. Can your little table tell me that?",
				{},
				{ sound: 'door.open' }
			)
		),
		[
			'Easy, George — nothing is wrong. ',
			stop('Failing is a path we planned for — it sits right here on the map.', {
				focus: { edge: 'saving-failed', event: 'FAIL' }
			}),
			' But **how many times**, and **why**... that needs memory. And memory is something ',
			at("our little table doesn't have — yet", { focus: undefined }),
			'.'
		]
	]
});

export const episode: Episode = {
	chapters: [namedEventsChapter, stateRelativeChapter, completeSpecChapter],
	description: 'Events are not global commands — each one only makes sense from specific states.',
	slug: '03-events-only-make-sense-from-somewhere',
	title: 'Events only make sense from somewhere'
};
