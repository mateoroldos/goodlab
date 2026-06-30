import { at, defineChapter, say, stop, type Episode } from '$lib/episode.js';
import EffectsScene, { type EffectsSceneState } from './effects-scene.svelte';

const scatteredEffectsChapter = defineChapter<EffectsSceneState>({
	scene: EffectsScene,
	id: 'scattered-effects',
	title: 'Who fired the side effects?',
	initial: { codeMode: 'handler', currentNode: 'idle', handlerStep: 0 },
	paragraphs: [
		[
			"Oh George — of course you're right. But don't rush us: things build slowly here in the Goodlab. One more time, we reach for the simple fix. ",
			stop('The handler sends events around', { handlerStep: 1 }),
			', and ',
			at('fires the side effects along the way', { handlerStep: 2 }),
			' — it calls the API, clears the error, bumps the counter.'
		],
		{
			ask: true,
			spans: [
				stop('The machine moves to `saving`.', { currentNode: 'saving' }),
				' Can it tell you what fired along the way?'
			]
		},
		[
			"[!bug] It can't. Those effects live in the handler, invisible to the graph. And it gets worse, Ben: every new caller has to remember to fire them — discipline doesn't scale, and none of it is easy to test. The machine knows where it is — not what it did to get there."
		],
		say(
			'learner',
			'John... I see the pattern now. The machine should own the actions too, right? Every time we add a caller, we duplicate the effects. The machine should be self-contained.'
		),
		[
			'You are exactly right, Ben. And at this point — we should ask for some help. States, events, context, guards, and now actions — ',
			stop(
				'this exact model already exists as a battle-tested TypeScript library called **XState**.',
				{ codeMode: 'machine', currentNode: 'idle' }
			)
		]
	]
});

const effectsOnEdgesChapter = defineChapter<EffectsSceneState>({
	scene: EffectsScene,
	id: 'effects-on-edges',
	title: 'Where do effects belong?',
	initial: { codeMode: 'machine', currentNode: 'idle' },
	paragraphs: [
		[
			'[!idea] XState gives effects a first-class home, attached right to the transition. It calls them **actions**. Each action lives on the edge that owns it — when the edge fires, the action fires.'
		],
		[
			stop("Let's walk the flow now.", {}),
			' When the `SAVE` event fires, ',
			stop('the machine moves to `saving` and `startRequest` runs', {
				activeAction: 'startRequest',
				activeEdge: 'idle-saving',
				currentNode: 'saving'
			}),
			'. When the request fails, ',
			stop('we land in `failed` and `incrementRetries` bumps the count', {
				activeAction: 'incrementRetries',
				activeEdge: 'saving-failed',
				currentNode: 'failed'
			}),
			'. A retry ',
			stop('crosses back into `saving`, firing `startRequest` again', {
				activeAction: 'startRequest',
				activeEdge: 'failed-saving',
				currentNode: 'saving'
			}),
			'. And on success, ',
			stop('we land in `saved` and `clearError` wipes the slate', {
				activeAction: 'clearError',
				activeEdge: 'saving-saved',
				currentNode: 'saved'
			}),
			'. Each action rides the edge that owns it.'
		],
		[
			stop(
				'[!rule] The effects are part of the graph now. Read the machine and you can see everything — every state, every rule, every effect.',
				{ activeAction: undefined, activeEdge: undefined, currentNode: 'saved' }
			),
			' But none of it runs on its own. Defining a machine and running one are two different things.'
		]
	]
});

export const episode: Episode = {
	chapters: [scatteredEffectsChapter, effectsOnEdgesChapter],
	description:
		'Side effects belong on transitions, not buried in handlers. XState calls them actions.',
	slug: '06-effects-live-on-the-edges',
	title: 'Effects live on the edges'
};
