import { at, defineChapter, say, stop, type Episode } from '$lib/episode.js';
import GuardsScene, { type GuardsSceneState } from './guards-scene.svelte';

const hiddenConditionsChapter = defineChapter<GuardsSceneState>({
	scene: GuardsScene,
	id: 'hidden-conditions',
	title: 'Where does the limit live?',
	initial: { codeMode: 'handler', currentNode: 'failed', handlerStep: 0, retries: 1 },
	paragraphs: [
		["You're asking the right questions, Ben. Any idea where that limit check could live?"],
		say(
			'learner',
			"Well... we could put an `if` inside the retry handler? But I'm not sure — every bit of logic we hide in handlers gets harder to track..."
		),
		[
			"You're right to hesitate — but let's build it anyway, and see it fail. We ",
			stop('wrap the retry in an `if`', { handlerStep: 1 }),
			', ',
			at('move and bump the counter inside', { handlerStep: 2 }),
			', and otherwise... ',
			at('silently do nothing', { handlerStep: 3 }),
			'.'
		],
		[
			'After ',
			at('three failures', { retries: 3 }),
			', `RETRY` fires again. ',
			at('The check fails', { blocked: true }),
			', so nothing happens. [!bug] The machine stays in `failed` — and nothing on the map explains why. The reason is hiding in the handler.'
		]
	]
});

const explicitGuardsChapter = defineChapter<GuardsSceneState>({
	scene: GuardsScene,
	id: 'explicit-guards',
	title: 'What if the rule lived on the door?',
	initial: { codeMode: 'handler', currentNode: 'failed', retries: 1 },
	paragraphs: [
		['So think deeper, Ben. If the map should explain it — where does the rule have to live?'],
		say(
			'learner',
			'Hmm... on the machine itself? Like... putting the condition on the arrow, right next to the transition it controls?'
		),
		[
			'[!idea] Exactly — great thinking, Ben. This is a **guard** — a door with its rule printed on it. We take ',
			stop('the `RETRY` transition', { codeMode: 'guard', guardStep: 1 }),
			', ',
			at('name its target', { guardStep: 2 }),
			', and ',
			at('print the rule right on it', { guardStep: 3 }),
			'. The event knocks; the guard decides.'
		],
		[
			'One retry so far. The event knocks — the guard says `true`. ',
			at('The door opens', { activeEdge: 'failed-saving', currentNode: 'saving' }),
			'. We move to `saving`.'
		],
		{
			ask: true,
			spans: [
				stop('Now three retries. Same event, same knock. What does the guard say?', {
					activeEdge: undefined,
					currentNode: 'failed',
					retries: 3
				})
			]
		},
		[
			stop('`false` — and the door stays shut.', { blocked: true }),
			' We stay in `failed`, but not silently: the rule is printed right on the door.'
		],
		[
			stop(
				'[!rule] Congratulations Ben! Now every condition that controls a transition lives on the machine — visible, named, testable.',
				{ blocked: undefined, currentNode: 'failed', retries: 2 }
			)
		],
		say(
			'boss',
			stop(
				'Congratulating yourselves again, gentlemen? Your tidy little machine is naive — it never actually **does** anything. What really saves, when you move from `idle` to `saving`?',
				{},
				{ sound: 'door.knock' }
			)
		)
	]
});

export const episode: Episode = {
	chapters: [hiddenConditionsChapter, explicitGuardsChapter],
	description:
		'Guards make conditional transitions visible — conditions on arrows, not hidden branches in handlers.',
	slug: '05-guards-are-doors',
	title: 'Guards are doors'
};
