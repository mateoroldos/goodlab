import { at, defineChapter, say, stop, type Episode } from '$lib/episode.js';
import ActorScene, { type ActorSceneState } from './actor-scene.svelte';

const machineOnlyChapter = defineChapter<ActorSceneState>({
	scene: ActorScene,
	id: 'machine-only',
	title: 'What does createMachine give you?',
	initial: { codeMode: 'machine', machineStep: 0 },
	paragraphs: [
		say(
			'learner',
			"So... declaring the machine and running it are separate things, right? Then... couldn't we run several independent machines from a single declaration?"
		),
		[
			'Exactly, Ben. `createMachine` gives you back a plain object — a blueprint. Let me build it. We wrap everything in ',
			stop('`createMachine`', { machineStep: 1 }),
			'. It always starts with ',
			at("`initial: 'idle'`", { machineStep: 2 }),
			' — the machine always powers on there. Then we add ',
			at('the states map', { machineStep: 3 }),
			' and fill in ',
			at('every rule', { machineStep: 4 }),
			' we wrote across the last few episodes.'
		],
		[
			stop(
				'Look at the blueprint — for the first time, nothing is lit. No timers, no fetches. Nothing is running.',
				{ machineStep: undefined }
			)
		],
		[
			'And that means one machine can power many running copies at once. We can spin up ',
			stop('actor one', { multiActors: ['idle'] }),
			', ',
			at('actor two', { multiActors: ['idle', 'idle'] }),
			', ',
			at('actor three', { multiActors: ['idle', 'idle', 'idle'] }),
			' — each holding its own state, none aware of the others. The blueprint itself never changes. Each running copy is called an **actor**.'
		]
	]
});

const actorRuntimeChapter = defineChapter<ActorSceneState>({
	scene: ActorScene,
	id: 'actor-runtime',
	title: 'What makes it run?',
	initial: { codeMode: 'usage', running: true, usageStep: 1 },
	paragraphs: [
		[
			stop('`createActor` wraps the machine in an actor', { usageStep: 1 }),
			' — a separate thing, with a mailbox for events and a stream of snapshots. Not running yet — just built.'
		],
		[
			'That snapshot stream is for **subscribers**. Anyone can `subscribe` to the actor — the UI, a logger, a test. ',
			stop("We subscribe first, so we don't miss a single snapshot", { usageStep: 2 }),
			" — in our case, we'll just console log it."
		],
		[
			'Now, ',
			stop('call `.start()`', { usageStep: 3 }),
			' — and ',
			at('the actor comes alive', { actorValue: 'idle' }),
			': its current state is `idle`, and ',
			at('the first snapshot goes out', { snapshots: ['idle'] }),
			'. The actor runs; subscribers watch.'
		],
		[
			stop('Send `SAVE`.', { usageStep: 4 }),
			' ',
			stop('It lands in the mailbox', { mailbox: 'SAVE' }),
			'. The actor ',
			stop('looks up the rule on the blueprint', { activeEdge: 'idle-saving' }),
			' — `idle` has one for `SAVE`. ',
			stop('It fires', { actorValue: 'saving', mailbox: undefined }),
			', and ',
			stop('a new snapshot goes out', { snapshots: ['idle', 'saving'] }),
			': `saving`.'
		],
		[
			stop('Send `SUCCESS`.', { usageStep: 5 }),
			' ',
			stop('Same loop', { activeEdge: undefined, mailbox: 'SUCCESS' }),
			': `saving` has a rule for it. ',
			stop('It fires', { activeEdge: 'saving-saved', actorValue: 'saved', mailbox: undefined }),
			', and ',
			stop('another snapshot goes out', { snapshots: ['idle', 'saving', 'saved'] }),
			' — `saved`.'
		],
		[
			stop(
				'[!rule] The machine is the plan — every possible path, written down before anything runs. The actor is the plan, running.',
				{}
			),
			' And with that, every piece is on the table: states, events, context, guards, actions, actors. Time to see them all in one picture.'
		]
	]
});

export const episode: Episode = {
	chapters: [machineOnlyChapter, actorRuntimeChapter],
	description:
		'The machine is an immutable blueprint. The actor is the running instance that receives events and produces snapshots.',
	slug: '07-the-machine-is-not-the-process',
	title: 'The machine is not the process'
};
