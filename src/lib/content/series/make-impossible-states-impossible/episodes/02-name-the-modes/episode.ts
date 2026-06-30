import { defineChapter, stop, type Episode } from '$lib/episode.js';
import StateGraphScene, { type StateGraphSceneState } from './state-graph-scene.svelte';

const allValidEdges: StateGraphSceneState['visibleEdges'] = [
	'idle-saving',
	'saving-saved',
	'saving-failed',
	'failed-saving',
	'saved-idle'
];

const finiteShapeChapter = defineChapter<StateGraphSceneState>({
	scene: StateGraphScene,
	id: 'finite-shape',
	title: 'How many places can it be?',
	initial: { visibleEdges: [], invalidEdges: [] },
	paragraphs: [
		[
			'Remember that strange jump, Ben — from `idle` straight to `failed`? Hold that thought. First, the map. We have four valid states: ',
			stop('`idle`', { activeNode: 'idle' }),
			', ',
			stop('`saving`', { activeNode: 'saving' }),
			', ',
			stop('`saved`', { activeNode: 'saved' }),
			' and ',
			stop('`failed`', { activeNode: 'failed' }),
			' — laid out as a map. This is the entire shape of the workflow, every place it can ever be.'
		],
		[
			'Our initial bug is now fixed. At any moment, the component lives in ',
			stop('exactly one of them', { activeNode: 'idle' }),
			'. We can safely move around — ',
			stop('to `saving`', { activeNode: 'saving' }),
			', ',
			stop('to `saved`', { activeNode: 'saved' }),
			', ',
			stop('to `failed`', { activeNode: 'failed' }),
			' — but never to two at once.'
		]
	]
});

const transitionsChapter = defineChapter<StateGraphSceneState>({
	scene: StateGraphScene,
	id: 'transitions',
	title: 'What connects them?',
	// Start on idle — our workflow always begins here.
	initial: { activeNode: 'idle', visibleEdges: [], invalidEdges: [] },
	paragraphs: [
		[
			'Our workflow always starts in ',
			stop('`idle`', { activeNode: 'idle' }),
			'. From there, one path exists. When the user clicks save, it ',
			stop('opens an arrow', { visibleEdges: ['idle-saving'] }),
			' that ',
			stop('takes us to `saving`', { activeNode: 'saving' }),
			'. That should be the only way out of `idle`.'
		],
		[
			'From ',
			stop('`saving`', { activeNode: 'saving' }),
			', two possible exits. When the operation succeeds, ',
			stop('an arrow opens', { visibleEdges: ['idle-saving', 'saving-saved'] }),
			' that ',
			stop('takes us to `saved`', { activeNode: 'saved' }),
			'. And when ',
			stop('the operation fails', { activeNode: 'saving' }),
			', ',
			stop('a second arrow', { visibleEdges: ['idle-saving', 'saving-saved', 'saving-failed'] }),
			' ',
			stop('lands us in `failed`', { activeNode: 'failed' }),
			'.'
		],
		[
			'From ',
			stop('`failed`', { activeNode: 'failed' }),
			', a retry arrow ',
			stop('brings us back to', {
				visibleEdges: ['idle-saving', 'saving-saved', 'saving-failed', 'failed-saving']
			}),
			' ',
			stop('`saving`', { activeNode: 'saving' }),
			'. And finally, when we sit in ',
			stop('`saved`', { activeNode: 'saved' }),
			', done ',
			stop('resets to', { visibleEdges: allValidEdges }),
			' ',
			stop('`idle`', { activeNode: 'idle' }),
			'. Five transitions — our complete map.'
		]
	]
});

const missingGuardrailsChapter = defineChapter<StateGraphSceneState>({
	scene: StateGraphScene,
	id: 'missing-guardrails',
	title: 'What stops a sixth arrow?',
	initial: { visibleEdges: allValidEdges, invalidEdges: [] },
	paragraphs: [
		{
			ask: true,
			speaker: 'learner',
			spans: [
				'So, John — back to that jump. Now that the map is laid out... what actually stops a sixth arrow? Say, `idle` jumping straight to `failed`?'
			]
		},
		[
			stop('[!bug] Nothing.', {
				invalidEdges: ['idle-failed'],
				visibleEdges: [...allValidEdges, 'idle-failed']
			}),
			' Any handler can still call `setStatus` from anywhere, ',
			stop('to anywhere', {
				invalidEdges: ['idle-failed', 'failed-saved'],
				visibleEdges: [...allValidEdges, 'idle-failed', 'failed-saved']
			}),
			'. The type names the states — it says nothing about how you move between them.'
		]
	]
});

export const episode: Episode = {
	chapters: [finiteShapeChapter, transitionsChapter, missingGuardrailsChapter],
	description:
		'How named states turn scattered flags into a finite map you can draw, count, and reason about.',
	slug: '02-name-the-modes',
	title: 'Name the modes'
};
